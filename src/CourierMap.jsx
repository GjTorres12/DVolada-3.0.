import React,{useEffect,useRef,useState} from 'react';
import './CourierMap.css';
const LEAFLET_CSS='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const LEAFLET_JS='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
let leafletPromise;
function loadLeaflet(){
 if(window.L)return Promise.resolve(window.L);
 if(!leafletPromise){
  leafletPromise=new Promise((resolve,reject)=>{
   if(!document.querySelector('[data-dv-leaflet-css]')){const css=document.createElement('link');css.rel='stylesheet';css.href=LEAFLET_CSS;css.dataset.dvLeafletCss='1';document.head.appendChild(css)}
   const script=document.createElement('script');script.src=LEAFLET_JS;script.onload=()=>resolve(window.L);script.onerror=()=>reject(new Error('No se pudo cargar el mapa'));document.head.appendChild(script);
  });
 }
 return leafletPromise;
}
const valid=p=>p&&Number.isFinite(Number(p.lat))&&Number.isFinite(Number(p.lng))&&Math.abs(Number(p.lat))<=90&&Math.abs(Number(p.lng))<=180;
export default function CourierMap({restaurant=null,customer=null,orderId=null}){
 const element=useRef(null),map=useRef(null),layers=useRef([]),gps=useRef(null);
 const [position,setPosition]=useState(null),[destination,setDestination]=useState('restaurant'),[message,setMessage]=useState('Activá tu ubicación para mostrar el recorrido.'),[ready,setReady]=useState(false);
 const target=destination==='restaurant'?restaurant:customer;
 useEffect(()=>{let cancelled=false;loadLeaflet().then(L=>{if(cancelled||!element.current)return;const m=L.map(element.current,{zoomControl:true}).setView([14.5,-88.8],12);L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(m);map.current=m;setReady(true)}).catch(()=>setMessage('No se pudo cargar el mapa. Revisá la conexión.'));return()=>{cancelled=true;map.current?.remove();map.current=null}},[]);
 useEffect(()=>{if(!navigator.geolocation){setMessage('Este dispositivo no permite acceder al GPS.');return}const id=navigator.geolocation.watchPosition(p=>{gps.current={lat:p.coords.latitude,lng:p.coords.longitude};setPosition(gps.current)},()=>setMessage('GPS no disponible. Podés habilitar el permiso de ubicación en el navegador.'),{enableHighAccuracy:true,maximumAge:10000,timeout:15000});return()=>navigator.geolocation.clearWatch(id)},[]);
 useEffect(()=>{if(!ready||!map.current)return;const L=window.L,m=map.current;layers.current.forEach(x=>m.removeLayer(x));layers.current=[];const pin=(p,label,color)=>{if(!valid(p))return;const marker=L.circleMarker([Number(p.lat),Number(p.lng)],{radius:9,color,fillColor:color,fillOpacity:.9}).addTo(m).bindPopup(label);layers.current.push(marker)};
 pin(position,'Mi ubicación','#2563eb');pin(restaurant,'Restaurante','#f26732');pin(customer,'Cliente','#16a34a');
 if(valid(position))m.setView([position.lat,position.lng],15);
 if(!valid(position)||!valid(target)){setMessage(!valid(target)?'Faltan coordenadas verificadas del destino. Se conectarán cuando el servidor entregue los datos del pedido.':'Esperando ubicación GPS…');return}
 const controller=new AbortController();const url='https://router.project-osrm.org/route/v1/driving/'+position.lng+','+position.lat+';'+target.lng+','+target.lat+'?overview=full&geometries=geojson';
 fetch(url,{signal:controller.signal}).then(r=>{if(!r.ok)throw Error('Ruta no disponible');return r.json()}).then(data=>{if(!data.routes?.[0])throw Error('No se encontró ruta por carretera');const points=data.routes[0].geometry.coordinates.map(c=>[c[1],c[0]]);const line=L.polyline(points,{color:'#2563eb',weight:6,opacity:.85}).addTo(m);layers.current.push(line);m.fitBounds(line.getBounds(),{padding:[30,30]});setMessage('Ruta estimada por calles. Verificá las condiciones reales del camino.')}).catch(e=>{if(e.name!=='AbortError')setMessage('No se pudo calcular una ruta por calles. Intentá de nuevo más tarde.')});
 return()=>controller.abort();
 },[ready,position?.lat,position?.lng,destination,restaurant?.lat,restaurant?.lng,customer?.lat,customer?.lng]);
 const openNavigation=provider=>{if(!valid(target))return;const coordinates=target.lat+','+target.lng;window.open(provider==='waze'?'https://waze.com/ul?ll='+encodeURIComponent(coordinates)+'&navigate=yes':'https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(coordinates),'_blank','noopener,noreferrer')};
 return <section className="dv-courier-map-panel"><div className="dv-courier-map-head"><div><strong>Mapa de entregas</strong><small>{orderId?'Pedido '+orderId:'Vista previa · sin pedido asignado'}</small></div><span>GPS</span></div><div ref={element} className="dv-courier-map-canvas" role="region" aria-label="Mapa interactivo del repartidor"/><div className="dv-courier-map-controls"><button className={destination==='restaurant'?'active':''} onClick={()=>setDestination('restaurant')}>Ir al restaurante</button><button className={destination==='customer'?'active':''} onClick={()=>setDestination('customer')}>Ir al cliente</button></div><p className="dv-courier-map-message" role="status">{message}</p><div className="dv-courier-map-controls"><button disabled={!valid(target)} onClick={()=>openNavigation('google')}>Google Maps</button><button disabled={!valid(target)} onClick={()=>openNavigation('waze')}>Waze</button></div><small className="dv-courier-map-disclaimer">Prototipo: los destinos se conectarán a pedidos reales mediante el servidor. Las rutas usan un servicio público de demostración, no apto para producción.</small></section>;
}
