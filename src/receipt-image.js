const money=n=>'L '+Number(n||0).toLocaleString('es-HN',{minimumFractionDigits:2,maximumFractionDigits:2});
const loadImage=src=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=src});
export async function saveReceiptImage(order,base='/'){
 const items=Array.isArray(order.items)?order.items:[];
 const w=900,p=56,rowH=62,tableY=530,tableEnd=tableY+74+Math.max(items.length,1)*rowH;
 const summaryY=tableEnd+28,pinY=summaryY+154,thanksY=pinY+190,footerY=thanksY+135,h=footerY+175;
 const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
 const c=canvas.getContext('2d');if(!c)throw new Error('Canvas no disponible');
 const dark='#123b30',orange='#fa621c',muted='#66746b',cream='#fffaf4';
 const rect=(x,y,a,b,color)=>{c.fillStyle=color;c.fillRect(x,y,a,b)};
 const round=(x,y,a,b,r,color)=>{c.fillStyle=color;c.beginPath();c.roundRect(x,y,a,b,r);c.fill()};
 const txt=(v,x,y,size=22,color=dark,weight='400',align='left')=>{c.fillStyle=color;c.font=weight+' '+size+'px Arial, sans-serif';c.textAlign=align;c.fillText(String(v??''),x,y);c.textAlign='left'};
 const fit=(v,max,width,size=22,weight='400')=>{let text=String(v??'');c.font=weight+' '+size+'px Arial';while(c.measureText(text).width>width&&text.length>3)text=text.slice(0,-2)+'…';return text};
 const drawLogo=(img,x,y,maxW,maxH)=>{const r=Math.min(maxW/img.naturalWidth,maxH/img.naturalHeight);const a=img.naturalWidth*r,b=img.naturalHeight*r;c.drawImage(img,x,y+(maxH-b)/2,a,b)};
 const line=(y,x=p,to=w-p)=>{rect(x,y,to-x,2,'#e6e3dc')};
 const subtotal=items.reduce((n,i)=>n+(Number(i.qty)||1)*(Number(i.price)||0),0);
 const total=Number(order.total)||0,extras=Math.round((total-subtotal)*100)/100;
 const number=String(order.orderNo||order.id||'—');
 const date=String(order.date||new Date().toLocaleString('es-HN'));
 rect(0,0,w,h,cream);
 // Header: original transparent logo on light background to keep dark lettering legible.
 round(26,24,w-52,205,26,'#ffffff');
 try{const logo=await loadImage(base+'dvolada-logo-original.png');drawLogo(logo,58,37,565,128)}catch{txt('Dvolada',p,112,64,orange,'800')}
 txt('TU PEDIDO, A UN TOQUE',p,200,20,dark,'700');
 round(p,258,w-p*2,100,18,dark);
 txt('COMPROBANTE',p+24,299,32,'#fff','800');
 txt('DE PEDIDO',p+24,336,28,'#ffac68','800');
 txt(number,w-p-24,322,32,'#fff','800','right');
 txt('RESTAURANTE',p,405,15,orange,'800');
 txt(fit(order.placeName||'Dvolada',40,w-p*2,30,'700'),p,446,30,dark,'700');
 txt('Cliente: '+fit(order.name||'Cliente',45,430,19),p,486,19,muted);
 txt(date,w-p,486,18,muted,'400','right');
 // Item table.
 round(p,tableY,w-p*2,58,12,dark);
 txt('PRODUCTO',p+18,tableY+38,18,'#fff','700');
 txt('CANT.',w-300,tableY+38,18,'#fff','700','right');
 txt('IMPORTE',w-p-16,tableY+38,18,'#fff','700','right');
 if(!items.length)txt('Sin productos registrados',p+20,tableY+112,20,muted);
 items.forEach((i,k)=>{const y=tableY+58+k*rowH;rect(p,y,w-p*2,rowH,k%2?'#f5efe8':'#fff');txt(fit(i.name||'Producto',36,450,20),p+18,y+39,20,dark,'600');txt(Number(i.qty)||1,w-300,y+39,20,dark,'500','right');txt(money((Number(i.qty)||1)*(Number(i.price)||0)),w-p-16,y+39,20,dark,'600','right')});
 line(tableEnd+6);
 // Totals: do not label unknown fees as tax or discount.
 txt('Subtotal',p+18,summaryY+44,21,muted);
 txt(money(subtotal),w-p-18,summaryY+44,22,dark,'700','right');
 if(Math.abs(extras)>.005){txt(extras>0?'Envío y otros cargos':'Ajustes y descuentos',p+18,summaryY+86,20,muted);txt(money(extras),w-p-18,summaryY+86,21,dark,'600','right')}
 round(p,summaryY+100,w-p*2,70,14,orange);
 txt('TOTAL A PAGAR',p+22,summaryY+146,24,'#fff','800');
 txt(money(total),w-p-22,summaryY+147,32,'#fff','800','right');
 // Separate PIN card with generous space.
 round(p,pinY+18,w-p*2,145,17,'#e7f3e9');
 txt('PIN DE ENTREGA',p+26,pinY+65,20,dark,'800');
 txt(String(order.pin||'—'),p+26,pinY+128,52,dark,'800');
 txt('Mostrá este código al recibir tu pedido.',p+26,pinY+156,16,muted);
 // Thank-you section.
 round(p,thanksY,w-p*2,100,16,'#fff0e4');
 txt('¡Gracias por tu pedido!',p+24,thanksY+43,28,dark,'700');
 txt('Pedí fácil, que te llega de volada.',p+24,thanksY+77,18,muted);
 // Footer: dedicated logo area with no overlapping elements.
 line(footerY-12);
 txt('Comprobante de demostración.',p,footerY+31,17,muted);
 txt('No válido como factura fiscal.',p,footerY+57,17,muted);
 try{const nexora=await loadImage(base+'nexora-logo-original.png');const r=Math.min(300/nexora.naturalWidth,100/nexora.naturalHeight);const a=nexora.naturalWidth*r,b=nexora.naturalHeight*r;c.drawImage(nexora,w-p-a,footerY+7,a,b)}catch{txt('Powered by NEXORA SYSTEMS',w-p,footerY+67,20,dark,'700','right')}
 round(0,h-38,w,38,0,dark);txt('DVOLADA  •  PEDÍ FÁCIL',w/2,h-12,16,'#fff','700','center');
 await new Promise((resolve,reject)=>canvas.toBlob(blob=>{if(!blob)return reject(new Error('No se pudo generar el comprobante'));const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='Dvolada-'+number.replace(/[^a-z0-9-]/gi,'')+'.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);resolve()},'image/png'));
}
