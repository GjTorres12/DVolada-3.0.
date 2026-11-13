import test from 'node:test';
import assert from 'node:assert/strict';
import {createOnlineApi,OnlineApiError,conflictMessage} from '../src/online-api.js';

test('requires HTTPS and an authenticated token provider',()=>{
 assert.throws(()=>createOnlineApi({baseUrl:'http://example.com',getAccessToken:()=> 'x'}),/HTTPS/);
 assert.throws(()=>createOnlineApi({baseUrl:'https://example.com'}),/token provider/);
});

test('does not send requests without an authenticated session',async()=>{
 let called=false;
 const api=createOnlineApi({baseUrl:'https://api.example.com',getAccessToken:()=>null,fetchImpl:()=>{called=true}});
 await assert.rejects(api.listOrders(),e=>e.status===401);
 assert.equal(called,false);
});

test('GET orders includes bearer auth and no-cache',async()=>{
 let captured;
 const api=createOnlineApi({baseUrl:'https://api.example.com/',getAccessToken:()=> 'test-token',fetchImpl:async(url,opts)=>{
  captured={url,opts};return {ok:true,json:async()=>({orders:[]})};
 }});
 assert.deepEqual(await api.listOrders(),{orders:[]});
 assert.equal(captured.url,'https://api.example.com/api/v1/restaurant/orders');
 assert.equal(captured.opts.headers.Authorization,'Bearer test-token');
 assert.equal(captured.opts.cache,'no-store');
});

test('conflict 409 does not retry and exposes a review message',async()=>{
 let calls=0;
 const api=createOnlineApi({baseUrl:'https://api.example.com',getAccessToken:()=> 'test-token',fetchImpl:async()=>{
  calls++;return {ok:false,status:409,json:async()=>({error:'ORDER_CHANGED',current:{version:2,status:'Preparando'}})};
 }});
 await assert.rejects(api.updateStatus({id:'f23e8d91-66b1-4e47-821e-6f8efb6d7b61',version:1},'Listo'),e=>{
  assert.ok(e instanceof OnlineApiError);assert.equal(e.status,409);
  assert.match(conflictMessage(e),/Otro empleado/);return true;
 });
 assert.equal(calls,1);
});

test('rejects unversioned orders before sending an update',async()=>{
 let called=false;
 const api=createOnlineApi({baseUrl:'https://api.example.com',getAccessToken:()=> 'x',fetchImpl:()=>{called=true}});
 await assert.rejects(api.updateStatus({id:'1'},'Listo'),/versión/);
 assert.equal(called,false);
});

test('status PATCH sends version and idempotency key without leaking tokens in body',async()=>{
 let captured;
 const api=createOnlineApi({baseUrl:'https://api.example.com',getAccessToken:()=> 'secret-token',fetchImpl:async(url,opts)=>{
  captured={url,opts};return {ok:true,json:async()=>({order:{id:'order-1',version:4,status:'Listo'}})};
 }});
 const result=await api.updateStatus({id:'order-1',version:3},'Listo');
 assert.equal(result.order.version,4);
 assert.equal(captured.url,'https://api.example.com/api/v1/restaurant/orders/order-1/status');
 assert.equal(captured.opts.method,'PATCH');
 assert.match(captured.opts.headers['Idempotency-Key'],/^[0-9a-f-]{36}$/i);
 assert.equal(captured.opts.headers.Authorization,'Bearer secret-token');
 assert.deepEqual(JSON.parse(captured.opts.body),{status:'Listo',expectedVersion:3});
 assert.ok(!captured.opts.body.includes('secret-token'));
});

test('order identifiers are encoded as one URL path segment',async()=>{
 let url;
 const api=createOnlineApi({baseUrl:'https://api.example.com',getAccessToken:()=> 'x',fetchImpl:async(u)=>{url=u;return {ok:true,json:async()=>({})}}});
 await api.getOrder('order/123?x=1');
 assert.equal(url,'https://api.example.com/api/v1/restaurant/orders/order%2F123%3Fx%3D1');
});

test('server errors preserve HTTP status and message',async()=>{
 const api=createOnlineApi({baseUrl:'https://api.example.com',getAccessToken:()=> 'x',fetchImpl:async()=>({ok:false,status:403,json:async()=>({error:'Acceso denegado'})})});
 await assert.rejects(api.listOrders(),error=>error instanceof OnlineApiError&&error.status===403&&error.message==='Acceso denegado');
});

test('rejects API URLs with embedded credentials or unexpected paths',()=>{
 for(const baseUrl of [
  'https://user:password@api.example.com',
  'https://api.example.com/redirect',
  'https://api.example.com/?token=secret',
  'https://api.example.com/#fragment',
  'http://127.0.0.1:8787',
  'not-a-url'
 ])assert.throws(()=>createOnlineApi({baseUrl,getAccessToken:()=> 'token'}));
});

test('accepts localhost HTTP only for development and normalizes origin',async()=>{
 let captured;
 const api=createOnlineApi({baseUrl:'http://localhost:8787/',getAccessToken:()=> 'token',fetchImpl:async url=>{captured=url;return {ok:true,json:async()=>({orders:[]})}}});
 await api.listOrders();
 assert.equal(captured,'http://localhost:8787/api/v1/restaurant/orders');
});

test('rejects malformed successful responses instead of reporting a saved change',async()=>{
 for(const json of [async()=>{throw new SyntaxError()},async()=>null,async()=>[],async()=> 'ok']){
  const api=createOnlineApi({baseUrl:'https://api.example.com',getAccessToken:()=> 'x',fetchImpl:async()=>({ok:true,status:200,json})});
  await assert.rejects(api.listOrders(),error=>error instanceof OnlineApiError&&/inválida/.test(error.message));
 }
});
test('authenticated requests refuse redirects and invalid order versions',async()=>{
 let calls=0;
 const api=createOnlineApi({baseUrl:'https://api.example.com',getAccessToken:()=> 'x',fetchImpl:async(url,opts)=>{calls++;assert.equal(opts.redirect,'error');return {ok:true,json:async()=>({orders:[]})}}});
 for(const version of [0,-1,1.5])await assert.rejects(api.updateStatus({id:'1',version},'Listo'),/versión/);
 assert.equal(calls,0);await api.listOrders();assert.equal(calls,1);
});
