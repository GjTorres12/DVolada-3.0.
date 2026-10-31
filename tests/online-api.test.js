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
