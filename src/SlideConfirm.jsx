import React,{useRef,useState,useEffect} from 'react';
import './slide-confirm.css';
export default function SlideConfirm({onConfirm,disabled=false,label='Desliza para confirmar',amount=''}) {
 const track=useRef(null),pointer=useRef(null),locked=useRef(false);
 const [progress,setProgress]=useState(0);
 const [dragging,setDragging]=useState(false);
 const [done,setDone]=useState(false);
 const getProgress=x=>{const r=track.current?.getBoundingClientRect();if(!r)return 0;const travel=Math.max(1,r.width-72);return Math.min(1,Math.max(0,(x-r.left-36)/travel))};
 const reset=()=>{pointer.current=null;setDragging(false);setProgress(0)};
 const finish=()=>{if(disabled||locked.current)return;locked.current=true;setDone(true);setProgress(1);onConfirm?.()};
 const down=e=>{if(disabled||locked.current||e.button!==0)return;pointer.current=e.pointerId;setDragging(true);setProgress(getProgress(e.clientX));e.currentTarget.setPointerCapture?.(e.pointerId)};
 const move=e=>{if(pointer.current!==e.pointerId||disabled)return;setProgress(getProgress(e.clientX))};
 const up=e=>{if(pointer.current!==e.pointerId)return;const p=getProgress(e.clientX);if(p>=.91)finish();else reset();pointer.current=null;setDragging(false)};
 useEffect(()=>{if(disabled&&!locked.current){setProgress(0);setDragging(false)}},[disabled]);
 return <div className="dv-slide-wrap">
  <div ref={track} className={'dv-slide-track '+(disabled?'is-disabled ':'')+(dragging?'is-dragging ':'')+(done?'is-done':'')} role="slider" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress*100)} aria-disabled={disabled} tabIndex={disabled?-1:0} onKeyDown={e=>{if(disabled||locked.current)return;if(['Enter',' ','ArrowRight','End'].includes(e.key)){e.preventDefault();finish()}}} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={reset} onLostPointerCapture={()=>{if(pointer.current!==null)reset()}}>
   <div className="dv-slide-fill" style={{width:`calc(68px + (100% - 68px) * ${progress})`}}/>
   <span className="dv-slide-text">{done?'¡Pedido confirmado!':'Desliza para confirmar'} <span aria-hidden="true">⟶</span></span>
   <div className="dv-slide-knob" style={{left:`calc((100% - 68px) * ${progress})`}} aria-hidden="true"><span className="dv-slide-logo"><img className="dv-slide-d-image" src={`${import.meta.env.BASE_URL}dvolada_icono_D_original.png`} alt="" draggable="false"/></span></div>
   <span className="dv-slide-chevrons" aria-hidden="true">›››</span>
  </div>
  <small className="dv-slide-hint">{disabled?'Completá los datos para habilitar la confirmación.' :' '}</small>
 </div>;
}
