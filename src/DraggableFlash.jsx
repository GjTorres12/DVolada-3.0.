import React,{useEffect,useRef,useState} from 'react';

import './draggable-flash.css';
const SIZE=64;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function getInitial(){try{const p=JSON.parse(localStorage.getItem('dv_flash_position'));if(p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&typeof window!=='undefined'&&p.x>=0&&p.x<window.innerWidth-24&&p.y>=0&&p.y<window.innerHeight-90)return p}catch{}return null}
export default function DraggableFlash({onOpen}){
 const el=useRef(null),drag=useRef(null),ignoreClick=useRef(false);
 const [pos,setPos]=useState(()=>typeof window!=='undefined'&&window.innerWidth<=900?null:getInitial());
 const [moving,setMoving]=useState(false);
 const bounds=()=>({w:window.innerWidth,h:window.innerHeight});
 const limit=p=>{const {w,h}=bounds();return {x:clamp(p.x,8,Math.max(8,w-SIZE-8)),y:clamp(p.y,Math.max(8,window.visualViewport?.offsetTop||8),Math.max(8,h-SIZE-96))}};
 useEffect(()=>{const onResize=()=>setPos(p=>p?limit(p):null);onResize();window.addEventListener('resize',onResize);return()=>window.removeEventListener('resize',onResize)},[]);
 const down=e=>{if(e.button!==0)return;const rect=el.current.getBoundingClientRect();drag.current={id:e.pointerId,sx:e.clientX,sy:e.clientY,x:rect.left,y:rect.top,moved:false};e.currentTarget.setPointerCapture(e.pointerId)};
 const move=e=>{const d=drag.current;if(!d||d.id!==e.pointerId)return;const dx=e.clientX-d.sx,dy=e.clientY-d.sy;if(Math.hypot(dx,dy)>7)d.moved=true;if(d.moved){setMoving(true);setPos(limit({x:d.x+dx,y:d.y+dy}))}};
 const up=e=>{const d=drag.current;if(!d||d.id!==e.pointerId)return;if(d.moved){const p=limit({x:d.x+e.clientX-d.sx,y:d.y+e.clientY-d.sy});setPos(p);try{localStorage.setItem('dv_flash_position',JSON.stringify(p))}catch{}ignoreClick.current=true}else ignoreClick.current=false;drag.current=null;setMoving(false)};
 const cancel=()=>{drag.current=null;setMoving(false)};
 return <button ref={el} type="button" className={'dv-flash-fab dv-flash-draggable'+(moving?' is-moving':'')} style={pos?{left:pos.x+'px',top:pos.y+'px',right:'auto',bottom:'auto'}:{}} aria-label="Ofertas Flash. Mantené presionado y arrastrá para mover" title="Tocá para ver Flash · arrastrá para mover" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={cancel} onClick={e=>{if(ignoreClick.current){ignoreClick.current=false;e.preventDefault();return}onOpen?.()}}><svg className="dv-flash-custom-bolt" viewBox="0 0 48 90" aria-hidden="true" focusable="false"><path d="M29 3 L8 44 H23 L16 86 L42 38 H27 Z"/></svg></button>;
}
