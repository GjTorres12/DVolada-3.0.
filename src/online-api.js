/**
 * Dvolada Online API client.
 * No localStorage tokens or demo credentials. An authenticated session provider
 * must supply an access token before enabling real orders.
 */
export class OnlineApiError extends Error {
 constructor(message,status,details){super(message);this.name='OnlineApiError';this.status=status;this.details=details}
}
export function createOnlineApi({baseUrl,getAccessToken,fetchImpl=fetch}){
 if(!/^https:\/\//i.test(baseUrl||'')&&!/^http:\/\/localhost(?::\d+)?$/i.test(baseUrl||''))throw Error('Online API requires HTTPS (or localhost for development)');
 if(typeof getAccessToken!=='function')throw Error('Authenticated token provider required');
 const base=baseUrl.replace(/\/$/,'');
 async function request(path,{method='GET',body,signal,idempotencyKey}={}){
  const token=await getAccessToken();
  if(!token)throw new OnlineApiError('Sesión no disponible',401);
  const response=await fetchImpl(base+path,{
   method,signal,cache:'no-store',
   headers:{Authorization:'Bearer '+token,...(body?{'Content-Type':'application/json'}:{}),...(idempotencyKey?{'Idempotency-Key':idempotencyKey}:{})},
   ...(body?{body:JSON.stringify(body)}:{})
  });
  const data=await response.json().catch(()=>({error:'Respuesta inválida del servidor'}));
  if(!response.ok)throw new OnlineApiError(data.error||'Error de servidor',response.status,data);
  return data;
 }
 return {
  capabilities:(signal)=>request('/api/v1/restaurant/capabilities',{signal}),
  listOrders:(signal)=>request('/api/v1/restaurant/orders',{signal}),
  getOrder:(id,signal)=>request('/api/v1/restaurant/orders/'+encodeURIComponent(id),{signal}),
  changes:(cursor='0',signal)=>request('/api/v1/restaurant/orders/changes?since='+encodeURIComponent(cursor),{signal}),
  async updateStatus(order,status){
   if(!order?.id||!Number.isSafeInteger(order.version))throw Error('Pedido sin versión del servidor');
   if(typeof crypto==='undefined'||typeof crypto.randomUUID!=='function')throw Error('Se requiere un navegador seguro para generar clave única');
   return request('/api/v1/restaurant/orders/'+encodeURIComponent(order.id)+'/status',{
    method:'PATCH',idempotencyKey:crypto.randomUUID(),
    body:{status,expectedVersion:order.version}
   });
  }
 };
}
/**
 * A 409 means another employee changed the order. Caller must show the latest
 * state and require a fresh explicit choice; never automatically retry a PATCH.
 */
export function conflictMessage(error){
 return error instanceof OnlineApiError&&error.status===409
  ?'Otro empleado modificó este pedido. Revisá el estado actualizado antes de continuar.'
  :null;
}
