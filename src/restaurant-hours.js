function minutes(value) {
 if(typeof value!=='string'||!/^([01]?\d|2[0-3]):[0-5]\d$/.test(value))return null;
 const [h,m]=value.split(':').map(Number);return h*60+m;
}
function slot(hours,day) {
 const value=hours[day];
 if(!value||value.closed)return null;
 const start=minutes(value.open),end=minutes(value.close);
 return start===null||end===null||start===end?null:{start,end};
}
export function withinOpeningHours(hours,date=new Date()) {
 if(!hours||!Number.isFinite(date.getTime()))return false;
 const day=date.getDay(),now=date.getHours()*60+date.getMinutes();
 const today=slot(hours,day),previous=slot(hours,(day+6)%7);
 return Boolean(today&&(today.start<today.end?now>=today.start&&now<today.end:now>=today.start)
  ||previous&&previous.start>previous.end&&now<previous.end);
}
export function restaurantIsOpen(place,date=new Date()) {
 if(place.isOpen===false||place.open===false||place.paused===true||place.isPaused===true||['closed','paused','pause'].includes(place.status))return false;
 return place.hours?withinOpeningHours(place.hours,date):null;
}
export function validSchedule(value,now=Date.now()) {
 const time=new Date(value).getTime();
 return Boolean(value)&&Number.isFinite(time)&&time>=now+15*60000;
}
