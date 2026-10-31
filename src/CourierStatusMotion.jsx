import React from 'react';
import './CourierStatusMotion.css';

// Personaje vectorial ligero: no depende de imágenes ni recortes del logo.
export default function CourierStatusMotion({status='En camino'}){
 const moving=['Recogido','En camino','En ubicación'].includes(status);
 return <span className={'dv-courier-motion '+(moving?'is-moving':'')} role="img" aria-label={'Repartidor naranja llevando un paquete. Estado: '+status}>
  <svg viewBox="0 0 72 84" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
   <g className="dv-courier-body" stroke="#fa711c" strokeLinecap="round" strokeLinejoin="round">
    <g className="dv-courier-leg dv-courier-leg-back"><path d="M29 52 L19 65 L10 72" strokeWidth="8" fill="none"/><path d="M10 72 L5 72" strokeWidth="6" fill="none"/></g>
    <g className="dv-courier-leg dv-courier-leg-front"><path d="M34 53 L43 64 L50 73" strokeWidth="8" fill="none"/><path d="M50 73 L57 73" strokeWidth="6" fill="none"/></g>
    <path d="M28 30 Q18 39 25 54 L40 56 Q44 41 38 33 Z" fill="#fa711c" strokeWidth="2"/>
    <path className="dv-courier-arm" d="M35 36 L45 44 L52 43" strokeWidth="7" fill="none"/>
    <circle cx="30" cy="19" r="11" fill="#fa711c" stroke="none"/>
    <path d="M27 10 Q37 6 43 15 L46 17" strokeWidth="4" fill="none"/>
   </g>
   <g className="dv-courier-parcel">
    <rect x="48" y="27" width="21" height="20" rx="2.5" fill="#ffad54" stroke="#da631a" strokeWidth="1.5"/>
    <path d="M58 28 V46" stroke="#fff0d2" strokeWidth="3" opacity=".8"/>
   </g>
  </svg>
 </span>;
}
