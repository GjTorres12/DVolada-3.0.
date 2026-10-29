import sharp from 'sharp';
import {mkdir} from 'node:fs/promises';
// Create an enlarged app icon from the original D + courier on the left of the logo.
// Keep the full wordmark unchanged throughout the website.
const source='public/logo.png';
const {width,height}=await sharp(source).metadata();
if(!width||!height)throw new Error('No se pudo leer el logo original de Dvolada');
const left=Math.round(width*.005);
const cropWidth=Math.min(width-left,Math.round(width*.43));
const cropped=await sharp(source).extract({left,top:0,width:cropWidth,height}).png().toBuffer();
const trimmed=await sharp(cropped).trim({background:'#ffffff',threshold:16}).png().toBuffer();
await mkdir('public',{recursive:true});
for(const size of [192,512]){
  const padding=Math.round(size*.035);
  const inner=size-padding*2;
  const icon=await sharp(trimmed).resize(inner,inner,{fit:'contain',background:'#fff9f4'}).flatten({background:'#fff9f4'}).png().toBuffer();
  await sharp({create:{width:size,height:size,channels:4,background:'#fff9f4'}})
    .composite([{input:icon,left:padding,top:padding}]).png().toFile('public/icon-'+size+'.png');
  console.log('Ícono Dvolada ampliado: '+size+'x'+size);
}
