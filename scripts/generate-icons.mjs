import sharp from 'sharp';
import {mkdir} from 'node:fs/promises';
const source='public/logo.png';
const meta=await sharp(source).metadata();
const width=meta.width;
const height=meta.height;
if(!width||!height)throw new Error('No se pudo leer el logo original de Dvolada');
const cropWidth=Math.min(width,Math.round(width*.44));
const left=Math.max(0,Math.round(width*.005));
const crop=sharp(source).extract({left,top:0,width:Math.min(cropWidth,width-left),height});
await mkdir('public',{recursive:true});
for(const size of [192,512]){
 const pad=Math.round(size*.09);
 await crop.clone().resize(size-pad*2,size-pad*2,{fit:'contain',background:'#fff9f4'}).flatten({background:'#fff9f4'}).extend({top:pad,bottom:pad,left:pad,right:pad,background:'#fff9f4'}).png().toFile('public/icon-'+size+'.png');
 console.log('Ícono PWA generado: '+size+'x'+size);
}
