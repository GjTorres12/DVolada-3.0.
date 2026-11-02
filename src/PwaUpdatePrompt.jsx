import React,{useEffect,useRef,useState} from 'react';
import {RefreshCw,X} from 'lucide-react';
import './pwa-update.css';

const CURRENT_BUILD=document.querySelector('meta[name="dvolada-build"]')?.content||'';
const BASE=import.meta.env.BASE_URL;
export default function PwaUpdatePrompt(){
 const [waiting,setWaiting]=useState(null),[newBuild,setNewBuild]=useState(''),[busy,setBusy]=useState(false),[dismissed,setDismissed]=useState('');
 const waitingRef=useRef(null);
 useEffect(()=>{
  let alive=true,registration=null,timer=null,removeWorker=()=>{};
  const inspect=reg=>{if(!alive)return;if(reg?.waiting&&navigator.serviceWorker.controller){waitingRef.current=reg.waiting;setWaiting(reg.waiting)}};
  const onController=()=>window.location.reload();
  const check=async()=>{
   if(!navigator.onLine)return;
   try{
    const response=await fetch(BASE+'version.json?t='+Date.now(),{cache:'no-store'});
    if(response.ok){const data=await response.json();if(alive&&CURRENT_BUILD&&data.version&&data.version!==CURRENT_BUILD)setNewBuild(data.version)}
   }catch{}
   if(registration)registration.update().catch(()=>{});
  };
  if('serviceWorker' in navigator){
   navigator.serviceWorker.addEventListener('controllerchange',onController);
   navigator.serviceWorker.ready.then(reg=>{
    if(!alive)return;registration=reg;inspect(reg);
    const onFound=()=>{const worker=reg.installing;if(!worker)return;worker.addEventListener('statechange',()=>{if(worker.state==='installed')inspect(reg)})};
    reg.addEventListener('updatefound',onFound);
    removeWorker=()=>reg.removeEventListener('updatefound',onFound);
   }).catch(()=>{});
  }
  const onVisible=()=>{if(!document.hidden)check()};
  const onOnline=()=>check();
  document.addEventListener('visibilitychange',onVisible);
  window.addEventListener('online',onOnline);
  check();timer=setInterval(check,60000);
  return()=>{alive=false;clearInterval(timer);removeWorker();document.removeEventListener('visibilitychange',onVisible);window.removeEventListener('online',onOnline);if('serviceWorker' in navigator)navigator.serviceWorker.removeEventListener('controllerchange',onController)};
 },[]);
 const token=newBuild||'worker-update';
 const available=Boolean(newBuild||waiting);
 const update=()=>{
  if(!available)return;
  let cart=[];
  try{cart=JSON.parse(localStorage.getItem('dv_cart')||'[]')}catch{}
  if(Array.isArray(cart)&&cart.length&&!window.confirm('Tenés productos en tu carrito. D Volada los mantiene guardados, pero una actualización puede interrumpir lo que estés haciendo. ¿Actualizar ahora?'))return;
  setBusy(true);
  const worker=waitingRef.current;
  if(worker){worker.postMessage({type:'SKIP_WAITING'});setTimeout(()=>window.location.reload(),3500)}
  else window.location.reload();
 };
 if(!available||dismissed===token)return null;
 return <div className="dv-update-banner" role="status" aria-live="polite"><div className="dv-update-icon"><RefreshCw size={22}/></div><div className="dv-update-copy"><strong>¡Hay una nueva actualización de D Volada!</strong><span>Tenemos mejoras listas para vos. Podés actualizar ahora o seguir usando la versión actual.</span></div><button className="dv-update-apply" onClick={update} disabled={busy}>{busy?'Actualizando…':'Actualizar ahora'}</button><button className="dv-update-close" aria-label="Actualizar más tarde" title="Más tarde" onClick={()=>setDismissed(token)}><X size={18}/></button></div>;
}
