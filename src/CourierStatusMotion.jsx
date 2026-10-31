import React from 'react';
import './CourierStatusMotion.css';

// Se utiliza la D/repartidor ORIGINAL del logo oficial de Dvolada.
// El recorte SVG conserva el recurso de marca; las piernas se animan independientemente.
export default function CourierStatusMotion({status='En camino'}){
 const moving=['Recogido','En camino','En ubicación'].includes(status);
 const src=import.meta.env.BASE_URL+'dvolada-logo-original.png';
 return <span className={'dv-courier-motion dv-courier-original '+(moving?'is-moving':'')} role="img" aria-label={'Repartidor Dvolada, estado: '+status}>
  <svg viewBox="0 0 650 713" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
   <defs><clipPath id="dv-original-courier-crop"><rect width="650" height="713"/></clipPath></defs>
   <g className="dv-courier-legs" fill="none" stroke="#ff6900" strokeWidth="36" strokeLinecap="round">
    <path className="dv-courier-leg dv-courier-leg-back" d="M365 536 Q348 597 290 636"/>
    <path className="dv-courier-leg dv-courier-leg-front" d="M390 536 Q423 601 481 625"/>
   </g>
   <g className="dv-courier-original-art" clipPath="url(#dv-original-courier-crop)">
    <image href={src} x="0" y="0" width="1242" height="713" preserveAspectRatio="none"/>
   </g>
  </svg>
 </span>;
}
