import React,{useEffect,useState} from 'react';
import {RefreshCw,X} from 'lucide-react';
import './pwa-update.css';

export default function PwaUpdatePrompt(){
 const [waiting,setWaiting]=useState(null),[busy,setBusy]=useState(false),[dismissed,setDismissed]=useState(false);
 useEffect(()=>{
  if(!('serviceWorker' in navigator))return;
  let alive=true,registration=null,timer=null;
  const inspect=reg=>{if(alive&&reg?.waiting&&navigator.serviceWorker.controller){setWaiting(reg.waiting);setDismissed(false)}};
  const onController=()=>window.location.reload();
  navigator.serviceWorker.addEventListener('controllerchange',onController);
  navigator.serviceWorker.ready.then(reg=>{
   if(!alive)return;
   registration=reg;inspect(reg);
   const onFound=()=>{const worker=reg.installing;if(!worker)return;worker.addEventListener('statechange',()=>{if(worker.state==='installed')inspect(reg)})};
   reg.addEventListener('updatefound',onFound);
   timer=setInterval(()=>{if(navigator.onLine)reg.update().catch(()=>{})},5*60*1000);
   document.addEventListener('visibilitychange',onVisible);
   function onVisible(){if(!document.hidden&&navigator.onLine)reg.update().catch(()=>{})}
   cleanup.current=()=>{reg.removeEventListener('updatefound',onFound);document.removeEventListener('visibilitychange',onVisible)};
  }).catch(()=>{});
  const cleanup={current:()=>{}};
  return()=>{alive=false;if(timer)clearInterval(timer);cleanup.current();navigator.serviceWorker.removeEventListener('controllerchange',onController)};
 },[]);
 const update=()=>{if(!waiting)return;setBusy(true);waiting.postMessage({type:'SKIP_WAITING'});setTimeout(()=>setBusy(false),12000)};
 if(!waiting||dismissed)return null;
 return <div className="dv-update-banner" role="status" aria-live="polite"><div className="dv-update-icon"><RefreshCw size={22}/></div><div className="dv-update-copy"><strong>¡Dvolada tiene una actualización!</strong><span>Hay mejoras listas. Actualizá sin desinstalar la app.</span></div><button className="dv-update-apply" onClick={update} disabled={busy}>{busy?'Actualizando…':'Actualizar ahora'}</button><button className="dv-update-close" aria-label="Actualizar más tarde" title="Más tarde" onClick={()=>setDismissed(true)}><X size={18}/></button></div>;
}
