import React,{useRef,useState} from 'react';
import {MessageCircle} from 'lucide-react';

// A tap opens chat; dragging moves the bubble without accidentally opening it.
export default function DraggableChatFab({onOpen}){
  const [position,setPosition]=useState(()=>{
    try{const value=JSON.parse(localStorage.getItem('dv_chat_fab_position')||'null');return value&&Number.isFinite(value.x)&&Number.isFinite(value.y)?value:null}catch{return null}
  });
  const gesture=useRef(null);
  const clamp=(x,y)=>({x:Math.max(8,Math.min(window.innerWidth-90,x)),y:Math.max(8,Math.min(window.innerHeight-65,y))});
  function down(e){
    if(e.button!==undefined&&e.button!==0)return;
    const rect=e.currentTarget.getBoundingClientRect();
    gesture.current={pointer:e.pointerId,startX:e.clientX,startY:e.clientY,offsetX:e.clientX-rect.left,offsetY:e.clientY-rect.top,moved:false};
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function move(e){
    const g=gesture.current;if(!g||g.pointer!==e.pointerId)return;
    if(Math.hypot(e.clientX-g.startX,e.clientY-g.startY)>7)g.moved=true;
    if(g.moved)setPosition(clamp(e.clientX-g.offsetX,e.clientY-g.offsetY));
  }
  function up(e){
    const g=gesture.current;if(!g||g.pointer!==e.pointerId)return;
    gesture.current=null;
    if(!g.moved){onOpen();return}
    const p=clamp(e.clientX-g.offsetX,e.clientY-g.offsetY);
    const x=p.x+45<window.innerWidth/2?8:Math.max(8,window.innerWidth-90);
    const final=clamp(x,p.y);
    setPosition(final);
    try{localStorage.setItem('dv_chat_fab_position',JSON.stringify(final))}catch{}
  }
  return <button type="button" className="dv-chat-fab dv-chat-fab-draggable"
    style={position?{left:Math.min(position.x,Math.max(8,window.innerWidth-90)),top:Math.min(position.y,Math.max(8,window.innerHeight-65)),right:'auto',bottom:'auto'}:undefined}
    onPointerDown={down} onPointerMove={move} onPointerUp={up}
    onPointerCancel={()=>{gesture.current=null}}
    onClick={e=>{if(e.detail===0)onOpen()}}
    aria-label="Abrir chat; mantené presionado y arrastrá para mover" title="Tocá para abrir o arrastrá para mover">
    <MessageCircle size={25}/><span>Chat</span>
  </button>;
}
