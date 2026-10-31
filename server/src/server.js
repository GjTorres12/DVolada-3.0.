import http from 'node:http';
import {createHash} from 'node:crypto';
import {Pool} from 'pg';
import {jwtVerify} from 'jose';

const port=Number(process.env.PORT||8080);
const databaseUrl=process.env.DATABASE_URL;
const jwtSecret=process.env.DVOLADA_JWT_SECRET;
const issuer=process.env.DVOLADA_JWT_ISSUER;
const audience=process.env.DVOLADA_JWT_AUDIENCE;
if(!databaseUrl||!jwtSecret||Buffer.byteLength(jwtSecret)<32||!issuer||!audience){
 console.error('Required: DATABASE_URL, DVOLADA_JWT_SECRET (>=32 bytes), DVOLADA_JWT_ISSUER, DVOLADA_JWT_AUDIENCE');
 process.exit(1);
}
const pool=new Pool({connectionString:databaseUrl,max:10,connectionTimeoutMillis:5000});
const secret=new TextEncoder().encode(jwtSecret);
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const transitions={Pendiente:['Aceptado','Rechazado'],Aceptado:['Preparando','Cancelado'],Preparando:['Listo','Cancelado'],Listo:[]};
const send=(res,status,body)=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'});res.end(JSON.stringify(body))};
async function auth(req){
 const token=/^Bearer (.+)$/i.exec(req.headers.authorization||'')?.[1];
 if(!token)throw Object.assign(Error('Authentication required'),{code:401});
 const {payload}=await jwtVerify(token,secret,{issuer,audience,algorithms:['HS256']});
 if(!uuid.test(payload.restaurant_id||'')||!uuid.test(payload.sub||''))throw Object.assign(Error('Invalid identity'),{code:401});
 if(!Array.isArray(payload.permissions)||!payload.permissions.includes('online:orders:read'))throw Object.assign(Error('Insufficient permissions'),{code:403});
 const {rows}=await pool.query('SELECT plan,subscription_status FROM restaurants WHERE id=$1',[payload.restaurant_id]);
 if(!rows.length||rows[0].subscription_status!=='active'||!['ONLINE','PLUS'].includes(rows[0].plan))throw Object.assign(Error('Online plan not active'),{code:403});
 return {restaurantId:payload.restaurant_id,userId:payload.sub,permissions:payload.permissions};
}
async function parseJson(req){
 let value='';for await(const chunk of req){value+=chunk;if(value.length>4096)throw Object.assign(Error('Request too large'),{code:413})}
 try{return JSON.parse(value)}catch{throw Object.assign(Error('Invalid JSON'),{code:400})}
}
const server=http.createServer(async(req,res)=>{
 try{
 const url=new URL(req.url,'http://localhost');
 if(req.method==='GET'&&url.pathname==='/health'){
  await pool.query('SELECT 1');return send(res,200,{status:'ok'});
 }
 const identity=await auth(req);
 if(req.method==='GET'&&url.pathname==='/api/v1/restaurant/capabilities')
  return send(res,200,{online:true,local:false,restaurantId:identity.restaurantId});
 if(req.method==='GET'&&url.pathname==='/api/v1/restaurant/orders'){
  const limit=50;
  // Initial snapshot is limited; full cursor pagination remains pending.
  const {rows}=await pool.query(
   'SELECT id,order_number,status,version,created_at,updated_at FROM online_orders WHERE restaurant_id=$1 ORDER BY updated_at DESC,id LIMIT $2',
   [identity.restaurantId,limit]
  );
  return send(res,200,{orders:rows,serverTime:new Date().toISOString(),hasMore:rows.length===limit,notice:'Snapshot only; use /changes for incremental updates'});
 }
 if(req.method==='GET'&&url.pathname==='/api/v1/restaurant/orders/changes'){
  const since=url.searchParams.get('since')||'0';
  if(!/^(0|[1-9]\\d{0,15})$/.test(since)||!Number.isSafeInteger(Number(since)))return send(res,400,{error:'Invalid since cursor'});
  const {rows}=await pool.query(
   'SELECT e.id AS cursor,e.order_id,e.from_status,e.to_status,e.version,e.created_at FROM online_order_events e WHERE e.restaurant_id=$1 AND e.id>$2 ORDER BY e.id ASC LIMIT 101',
   [identity.restaurantId,since]
  );
  const hasMore=rows.length>100,events=rows.slice(0,100);
  return send(res,200,{events,nextCursor:String(events.at(-1)?.cursor??since),hasMore,serverTime:new Date().toISOString()});
 }
 const detail=/^\\/api\\/v1\\/restaurant\\/orders\\/([0-9a-f-]+)$/i.exec(url.pathname);
 if(req.method==='GET'&&detail){
  if(!uuid.test(detail[1]))return send(res,400,{error:'Invalid order ID'});
  const {rows}=await pool.query('SELECT id,order_number,status,version,created_at,updated_at FROM online_orders WHERE id=$1 AND restaurant_id=$2',[detail[1],identity.restaurantId]);
  return rows.length?send(res,200,{order:rows[0]}):send(res,404,{error:'Order not found'});
 }
 const match=/^\/api\/v1\/restaurant\/orders\/([0-9a-f-]+)\/status$/i.exec(url.pathname);
 if(req.method==='PATCH'&&match){
  if(!uuid.test(match[1]))return send(res,400,{error:'Invalid order ID'});
  if(!identity.permissions.includes('online:orders:write'))return send(res,403,{error:'Write permission required'});
  const key=req.headers['idempotency-key'];
  if(typeof key!=='string'||!uuid.test(key))return send(res,400,{error:'UUID Idempotency-Key required'});
  const body=await parseJson(req);
  if(!Number.isSafeInteger(body.expectedVersion)||body.expectedVersion<1||typeof body.status!=='string')
   return send(res,400,{error:'Invalid status or expectedVersion'});
  const hash=createHash('sha256').update(JSON.stringify({id:match[1],status:body.status,expectedVersion:body.expectedVersion})).digest('hex');
  const client=await pool.connect();
  try{
   await client.query('BEGIN');
   await client.query('INSERT INTO online_idempotency(restaurant_id,actor_id,idempotency_key,request_hash) VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING',[identity.restaurantId,identity.userId,key,hash]);
   const record=await client.query('SELECT request_hash,response_status,response_body FROM online_idempotency WHERE restaurant_id=$1 AND actor_id=$2 AND idempotency_key=$3 FOR UPDATE',[identity.restaurantId,identity.userId,key]);
   const previous=record.rows[0];
   if(previous.request_hash!==hash){await client.query('ROLLBACK');return send(res,409,{error:'Idempotency key reused with different request'})}
   if(previous.response_status){await client.query('COMMIT');return send(res,previous.response_status,previous.response_body)}
   const found=await client.query('SELECT id,status,version FROM online_orders WHERE id=$1 AND restaurant_id=$2 FOR UPDATE',[match[1],identity.restaurantId]);
   let status,response;
   const current=found.rows[0];
   if(!current){status=404;response={error:'Order not found'}}
   else if(current.version!==body.expectedVersion){status=409;response={error:'ORDER_CHANGED',current}}
   else if(!(transitions[current.status]||[]).includes(body.status)){status=422;response={error:'Invalid status transition',current}}
   else{
    const changed=await client.query('UPDATE online_orders SET status=$1,version=version+1,updated_at=now() WHERE id=$2 AND restaurant_id=$3 RETURNING id,status,version,updated_at',[body.status,match[1],identity.restaurantId]);
    await client.query('INSERT INTO online_order_events(order_id,restaurant_id,actor_id,from_status,to_status,version) VALUES($1,$2,$3,$4,$5,$6)',[match[1],identity.restaurantId,identity.userId,current.status,body.status,changed.rows[0].version]);
    status=200;response={order:changed.rows[0]};
   }
   await client.query('UPDATE online_idempotency SET response_status=$4,response_body=$5 WHERE restaurant_id=$1 AND actor_id=$2 AND idempotency_key=$3',[identity.restaurantId,identity.userId,key,status,JSON.stringify(response)]);
   await client.query('COMMIT');return send(res,status,response);
  }catch(e){await client.query('ROLLBACK');throw e}finally{client.release()}
 }
 return send(res,404,{error:'Not found'});
 }catch(e){if(e.code===401||e.code===403||e.code===400||e.code===413)return send(res,e.code,{error:e.message});if(e.code==='ERR_JWT_EXPIRED'||e.code?.startsWith?.('ERR_JWT'))return send(res,401,{error:'Invalid or expired token'});console.error('API error',e);return send(res,500,{error:'Internal server error'})}
});
server.listen(port,()=>console.log('Dvolada Online API listening on '+port));
