import React from 'react';
import './CourierStatusMotion.css';

// Repartidor SVG integrado en la app: gorra, mochila y caja en una mano.
export default function CourierStatusMotion({status='En camino'}){
 const walking=!['Entregado','Cancelado'].includes(status);
 return <span className={'dv-courier-motion '+(walking?'is-moving':'')} role="img" aria-label={'Repartidor naranja caminando con una caja. Estado: '+status}>
  <svg viewBox="0 0 90 110" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
   <g className="dv-courier-walker">
    <g className="dv-courier-back-leg"><path d="M41 71 L31 84 L22 99" fill="none" stroke="#f97316" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/><path d="M22 99 L14 99" stroke="#f97316" strokeWidth="7" strokeLinecap="round"/></g>
    <g className="dv-courier-front-leg"><path d="M45 71 L56 84 L67 98" fill="none" stroke="#ff8a1e" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/><path d="M67 98 L75 98" stroke="#ff8a1e" strokeWidth="7" strokeLinecap="round"/></g>
    <rect x="22" y="42" width="16" height="25" rx="6" fill="#dc5b10"/>
    <path d="M36 42 Q49 37 55 50 L52 73 Q44 80 35 71 Z" fill="#ff790f"/>
    <path d="M36 48 L28 62 L34 69" fill="none" stroke="#e96a0e" strokeWidth="8" strokeLinecap="round"/>
    <circle cx="45" cy="26" r="13" fill="#ff8a1e"/>
    <path d="M32 23 Q32 11 45 10 Q58 11 58 22 Z" fill="#f26712"/>
    <path d="M49 22 L66 22 Q69 23 66 27 L53 28" fill="#ff9d25"/>
    <path d="M52 47 L62 56 L68 55" fill="none" stroke="#ff8a1e" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
    <g className="dv-courier-box"><rect x="65" y="39" width="22" height="23" rx="3" fill="#f5b65c" stroke="#c56c23" strokeWidth="1.5"/><path d="M76 40 V60" stroke="#fff0cc" strokeWidth="4"/></g>
   </g>
  </svg>
 </span>;
}
