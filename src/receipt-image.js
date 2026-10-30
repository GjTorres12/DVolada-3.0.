const money=n=>'L '+Number(n||0).toLocaleString('es-HN',{minimumFractionDigits:2,maximumFractionDigits:2});
export async function saveReceiptImage(o,base='/'){
 const w=840,p=56,c=document.createElement('canvas'),ctx=c.getContext('2d');const items=o.items||[];c.width=w;c.height=670+items.length*52;const h=c.height;
 ctx.fillStyle='#fffaf4';ctx.fillRect(0,0,w,h);ctx.fillStyle='#153a30';ctx.fillRect(0,0,w,174);ctx.fillStyle='#f9efe3';ctx.font='bold 48px Arial';ctx.fillText('Dvolada',p,87);ctx.font='20px Arial';ctx.fillText('TU PEDIDO, A UN TOQUE',p,123);
 try{const img=new Image();img.crossOrigin='anonymous';img.src=base+'logo.png';await new Promise((res,rej)=>{img.onload=res;img.onerror=rej});const ratio=img.naturalWidth/img.naturalHeight;const iw=Math.min(250,112*ratio);ctx.fillStyle='#fff';ctx.fillRect(w-p-iw-14,27,iw+28,119);ctx.drawImage(img,w-p-iw,35,iw,102)}catch{}
 ctx.fillStyle='#153a30';ctx.font='bold 27px Arial';ctx.fillText('COMPROBANTE DE PEDIDO',p,235);ctx.fillStyle='#b95130';ctx.font='bold 26px Arial';ctx.fillText(o.orderNo||o.id,p,285);
 ctx.fillStyle='#37453d';ctx.font='20px Arial';ctx.fillText('Restaurante: '+(o.placeName||'Dvolada'),p,328);ctx.fillText('Cliente: '+(o.name||'Cliente'),p,362);ctx.fillText('Fecha: '+(o.date||new Date().toLocaleString('es-HN')),p,396);
 ctx.strokeStyle='#d8cbbb';ctx.beginPath();ctx.moveTo(p,420);ctx.lineTo(w-p,420);ctx.stroke();ctx.font='bold 21px Arial';ctx.fillStyle='#153a30';ctx.fillText('PRODUCTOS',p,454);ctx.textAlign='right';ctx.fillText('IMPORTE',w-p,454);ctx.textAlign='left';
 let y=502;for(const i of items){ctx.font='20px Arial';ctx.fillStyle='#24372e';let name=String(i.name||'Producto');if(name.length>39)name=name.slice(0,36)+'…';ctx.fillText((i.qty||1)+' × '+name,p,y);ctx.textAlign='right';ctx.fillText(money((i.price||0)*(i.qty||1)),w-p,y);ctx.textAlign='left';y+=52}
 ctx.strokeStyle='#d8cbbb';ctx.beginPath();ctx.moveTo(p,y-17);ctx.lineTo(w-p,y-17);ctx.stroke();
 ctx.fillStyle='#153a30';ctx.font='bold 34px Arial';ctx.fillText('TOTAL',p,y+35);ctx.textAlign='right';ctx.fillText(money(o.total),w-p,y+35);ctx.textAlign='left';
 ctx.fillStyle='#f2e7d9';ctx.fillRect(p,y+65,w-p*2,95);ctx.fillStyle='#153a30';ctx.font='bold 20px Arial';ctx.fillText('PIN DE ENTREGA',p+24,y+99);ctx.font='bold 37px Arial';ctx.fillText(String(o.pin||'—'),p+24,y+140);
 ctx.fillStyle='#657067';ctx.font='17px Arial';ctx.fillText('Mostrá este comprobante al recibir tu pedido.',p,y+203);
 ctx.fillStyle='#9c8a77';ctx.font='15px Arial';ctx.fillText('Demostración · No es factura fiscal',p,h-72);
 ctx.fillStyle='#153a30';ctx.font='bold 20px Arial';ctx.textAlign='right';ctx.fillText('Powered by NEXORA',w-p,h-67);ctx.textAlign='left';
 await new Promise((resolve,reject)=>c.toBlob(b=>{if(!b)return reject(new Error('No se pudo generar imagen'));const u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download='Dvolada-'+String(o.orderNo||o.id).replace(/[^a-z0-9-]/gi,'')+'.png';a.click();setTimeout(()=>URL.revokeObjectURL(u),2000);resolve()},'image/png'));
}
