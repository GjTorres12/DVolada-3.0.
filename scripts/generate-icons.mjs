import sharp from 'sharp';
import {mkdir} from 'node:fs/promises';

// Build the Android icon from the orange courier mark in the original Dvolada logo.
// Render the gradient and symbol into ONE opaque pixel buffer, preventing rectangular
// transparency/resize artifacts in Android launchers.
const {data,info}=await sharp('public/logo.png').ensureAlpha().raw().toBuffer({resolveWithObject:true});
const {width,height,channels}=info;
const mask=Buffer.alloc(width*height*4);
let minX=width,minY=height,maxX=-1,maxY=-1;
for(let y=0;y<height;y++)for(let x=0;x<width;x++){
 const p=(y*width+x)*channels,q=(y*width+x)*4;
 const r=data[p],g=data[p+1],b=data[p+2],a=data[p+3];
 const orange=a>40 && r>115 && r>g*1.22 && g>b*1.16 && r-b>65;
 if(!orange)continue;
 mask[q]=r;mask[q+1]=g;mask[q+2]=b;mask[q+3]=a;
 minX=Math.min(minX,x);maxX=Math.max(maxX,x);
 minY=Math.min(minY,y);maxY=Math.max(maxY,y);
}
if(maxX<minX)throw new Error('No se detectó el repartidor naranja');
const mark=await sharp(mask,{raw:{width,height,channels:4}})
 .extract({left:minX,top:minY,width:maxX-minX+1,height:maxY-minY+1})
 .png().toBuffer();
await mkdir('public',{recursive:true});
for(const size of [192,512]){
 const pad=Math.round(size*.065),inner=size-2*pad;
 const {data:icon,info:im}=await sharp(mark)
  .resize(inner,inner,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}})
  .ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const out=Buffer.alloc(size*size*4);
 const left=Math.floor((size-im.width)/2),top=Math.floor((size-im.height)/2);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const i=(y*size+x)*4;
  const nx=x/(size-1),ny=y/(size-1);
  const diagonal=Math.max(0,Math.min(1,(nx+ny-0.6)/1.4));
  const glow=Math.exp(-(((nx-.92)**2)/.23+((ny-.92)**2)/.25))*.25;
  const t=Math.min(.55,diagonal*.28+glow);
  const bg=[255,255-Math.round(92*t),255-Math.round(170*t)];
  const ix=x-left,iy=y-top;
  if(ix>=0&&iy>=0&&ix<im.width&&iy<im.height){
   const j=(iy*im.width+ix)*im.channels;
   const a=icon[j+3]/255;
   out[i]=Math.round(icon[j]*a+bg[0]*(1-a));
   out[i+1]=Math.round(icon[j+1]*a+bg[1]*(1-a));
   out[i+2]=Math.round(icon[j+2]*a+bg[2]*(1-a));
  }else{out[i]=bg[0];out[i+1]=bg[1];out[i+2]=bg[2];}
  out[i+3]=255;
 }
 await sharp(out,{raw:{width:size,height:size,channels:4}})
  .png().toFile('public/icon-clean-'+size+'.png');
 console.log('Ícono limpio generado: '+size+'x'+size);
}
