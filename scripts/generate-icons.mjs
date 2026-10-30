import sharp from 'sharp';
import {mkdir} from 'node:fs/promises';

// Extract the orange D and delivery rider from the ORIGINAL logo artwork.
// Remove the dark "volada" lettering so the Android icon is readable.
const source='public/logo.png';
const {data,info}=await sharp(source).ensureAlpha().raw().toBuffer({resolveWithObject:true});
const {width,height,channels}=info;
const rgba=Buffer.alloc(width*height*4);
let minX=width,minY=height,maxX=-1,maxY=-1;
for(let y=0;y<height;y++)for(let x=0;x<width;x++){
 const p=(y*width+x)*channels,q=(y*width+x)*4;
 const r=data[p],g=data[p+1],b=data[p+2],a=data[p+3];
 // Saturated orange, red and golden-yellow strokes from the supplied mark.
 const isMark=a>30 && r>115 && r>g*1.22 && g>b*1.16 && (r-b)>65;
 if(isMark){
  rgba[q]=r;rgba[q+1]=g;rgba[q+2]=b;rgba[q+3]=a;
  if(x<minX)minX=x;if(x>maxX)maxX=x;if(y<minY)minY=y;if(y>maxY)maxY=y;
 }
}
if(maxX<minX||maxY<minY)throw new Error('No se detectó el símbolo naranja del logo');
const crop={left:Math.max(0,minX-2),top:Math.max(0,minY-2),width:Math.min(width-minX+2,maxX-minX+5),height:Math.min(height-minY+2,maxY-minY+5)};
const mark=await sharp(rgba,{raw:{width,height,channels:4}}).extract(crop).png().toBuffer();
await mkdir('public',{recursive:true});
for(const size of [192,512]){
 const pad=Math.round(size*.075),inner=size-pad*2;
 const background=Buffer.from(`<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="warm" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="0.52" stop-color="#fffaf4"/><stop offset="1" stop-color="#ffd4a7"/></linearGradient><radialGradient id="glow" cx="0.96" cy="0.97" r="0.85"><stop offset="0" stop-color="#ff923e" stop-opacity="0.48"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient></defs><rect width="100%" height="100%" fill="url(#warm)"/><rect width="100%" height="100%" fill="url(#glow)"/></svg>`);
 const artwork=await sharp(mark).resize(inner,inner,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).png().toBuffer();
 const a=await sharp(artwork).metadata();
 await sharp(background)
  .composite([{input:artwork,left:Math.floor((size-a.width)/2),top:Math.floor((size-a.height)/2)}])
  .png().toFile('public/icon-smooth-'+size+'.png');
 console.log('Dvolada icon '+size+'x'+size+': orange symbol only');
}
