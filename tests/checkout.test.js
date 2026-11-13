import test from 'node:test';
import assert from 'node:assert/strict';
import {changeQuantity,changeInstruction} from '../src/cart-lines.js';
import {withinOpeningHours,restaurantIsOpen,validSchedule} from '../src/restaurant-hours.js';
const at=(day,hour,minute=0)=>new Date(2026,10,8+day,hour,minute);
test('quantity and instructions only affect the selected restaurant',()=>{
 const cart=[{id:1,placeId:1,qty:2},{id:1,placeId:2,qty:3}];
 assert.deepEqual(changeQuantity(cart,1,1,-1).map(x=>x.qty),[1,3]);
 assert.deepEqual(changeQuantity(cart,1,1,-2),[cart[1]]);
 assert.equal(changeQuantity(cart,1,2,100)[1].qty,99);
 const edited=changeInstruction(cart,'1','2','Sin cebolla');
 assert.equal(edited[0].instructions,undefined);assert.equal(edited[1].instructions,'Sin cebolla');
 assert.equal(cart[1].qty,3);
});
test('opening hours respect boundaries, closures and unknown schedules',()=>{
 const hours={1:{open:'08:00',close:'17:00'}};
 assert.equal(withinOpeningHours(hours,at(1,8)),true);
 assert.equal(withinOpeningHours(hours,at(1,17)),false);
 assert.equal(withinOpeningHours(hours,at(2,10)),false);
 assert.equal(withinOpeningHours({1:{open:'08:00',close:'17:00',closed:true}},at(1,10)),false);
 assert.equal(restaurantIsOpen({}),null);
 for(const status of ['closed','paused','pause'])assert.equal(restaurantIsOpen({hours,status},at(1,10)),false);
});
test('overnight hours continue into the following day including week wrap',()=>{
 const hours={1:{open:'18:00',close:'02:00'},6:{open:'20:00',close:'01:00'}};
 assert.equal(withinOpeningHours(hours,at(1,19)),true);
 assert.equal(withinOpeningHours(hours,at(1,1)),false);
 assert.equal(withinOpeningHours(hours,at(2,1)),true);
 assert.equal(withinOpeningHours(hours,at(2,2)),false);
 assert.equal(withinOpeningHours(hours,at(0,0,30)),true);
});
test('invalid dates and malformed hours cannot enable scheduled checkout',()=>{
 const now=at(1,10).getTime();
 for(const value of ['',null,'invalid',new Date(now+14*60000).toISOString()])assert.equal(validSchedule(value,now),false);
 assert.equal(validSchedule(new Date(now+15*60000).toISOString(),now),true);
 assert.equal(withinOpeningHours({1:{open:'99:99',close:'18:00'}},at(1,10)),false);
});
