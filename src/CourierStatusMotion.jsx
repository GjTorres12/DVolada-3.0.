import React from 'react';
import './CourierStatusMotion.css';

// Repartidor Dvolada: silueta naranja original, con extremidades separadas para animación.
// La posición del personaje indica el estado del pedido, no una ubicación GPS.
export default function CourierStatusMotion({status='En camino'}){
 const moving=['Recogido','En camino','En ubicación'].includes(status);
 return <span className={'dv-courier-motion '+(moving?'is-moving':'')} role="img" aria-label={'Repartidor Dvolada, estado: '+status}>
  <svg viewBox="0 0 140 112" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
   <g className="dv-courier-art" fill="#ff6900" stroke="#ff6900" strokeLinecap="round" strokeLinejoin="round">
    <g className="dv-courier-leg dv-courier-leg-back" style={{transformOrigin:'66px 72px'}}>
     <path d="M65 72 Q52 84 41 93 L22 97" fill="none" strokeWidth="12"/>
    </g>
    <g className="dv-courier-leg dv-courier-leg-front" style={{transformOrigin:'67px 72px'}}>
     <path d="M67 72 Q80 82 86 95 L103 99" fill="none" strokeWidth="12"/>
    </g>
    <path d="M44 49 Q55 38 69 42 Q83 46 86 59 L78 79 Q62 86 49 72 L37 60Z"/>
    <g className="dv-courier-arm dv-courier-arm-back" style={{transformOrigin:'54px 51px'}}>
     <path d="M53 51 Q39 48 31 57 L19 62" fill="none" strokeWidth="10"/>
    </g>
    <g className="dv-courier-head">
     <circle cx="69" cy="25" r="15"/>
     <path d="M74 18 Q89 9 100 14" fill="none" strokeWidth="7"/>
    </g>
    <g className="dv-courier-arm dv-courier-arm-front" style={{transformOrigin:'79px 52px'}}>
     <path d="M79 52 Q91 60 103 49 L110 40" fill="none" strokeWidth="10"/>
     <rect x="106" y="29" width="26" height="22" rx="3" stroke="none"/>
     <path d="M108 36 H130" fill="none" stroke="#fff4e5" strokeWidth="3"/>
    </g>
   </g>
  </svg>
 </span>;
}
