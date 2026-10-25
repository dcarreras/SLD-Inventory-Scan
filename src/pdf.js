import * as pdfjs from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { createWorker } from 'tesseract.js';
import { proposals } from './inventory';
pdfjs.GlobalWorkerOptions.workerSrc=workerUrl;
export async function analyze(file, options, progress, cancelled) {
  const bytes=await file.arrayBuffer();
  const doc=await pdfjs.getDocument({data:bytes}).promise;
  if(doc.numPages!==1) throw new Error('El MVP admite PDF de una página.');
  const page=await doc.getPage(1), viewport=page.getViewport({scale:1}), previewScale=Math.min(2,2400/Math.max(viewport.width,viewport.height)), preview=document.createElement('canvas');
  const pv=page.getViewport({scale:previewScale}); preview.width=Math.ceil(pv.width);preview.height=Math.ceil(pv.height);
  progress('Preparando vista del plano',5);await page.render({canvasContext:preview.getContext('2d'),viewport:pv,canvas:preview}).promise;
  const content=await page.getTextContent(), words=[];
  for(const item of content.items){if(!item.str?.trim())continue;const m=pdfjs.Util.transform(viewport.transform,item.transform), h=Math.max(1,Math.hypot(m[2],m[3]));words.push({text:item.str.trim(),x:m[4],y:m[5]-h,width:item.width||h,height:h,source:'Texto vectorial',confidence:null})}
  if(cancelled())throw new Error('Análisis cancelado.');
  if(options.ocr){
    progress('Cargando OCR local',10);
    const worker=await createWorker('eng',1,{workerPath:'/ocr/worker.min.js',corePath:'/ocr/core',langPath:'/ocr/lang',gzip:false,cacheMethod:'none'});
    try{const scale=2, v=page.getViewport({scale}), size=1800, overlap=120, tiles=[];
      for(let y=0;y<v.height;y+=size-overlap)for(let x=0;x<v.width;x+=size-overlap)tiles.push({x,y,w:Math.min(size,Math.ceil(v.width-x)),h:Math.min(size,Math.ceil(v.height-y))});
      for(let i=0;i<tiles.length;i++){if(cancelled())throw new Error('Análisis cancelado.');const t=tiles[i], canvas=document.createElement('canvas');canvas.width=t.w;canvas.height=t.h;await page.render({canvasContext:canvas.getContext('2d'),canvas,viewport:v,transform:[1,0,0,1,-t.x,-t.y]}).promise;
        const result=await worker.recognize(canvas,{}, {blocks:true});for(const block of result.data.blocks||[])for(const para of block.paragraphs||[])for(const line of para.lines||[])for(const w of line.words||[]){if(w.confidence<35||!w.text.trim())continue;words.push({text:w.text.trim(),x:(w.bbox.x0+t.x)/scale,y:(w.bbox.y0+t.y)/scale,width:(w.bbox.x1-w.bbox.x0)/scale,height:(w.bbox.y1-w.bbox.y0)/scale,source:'OCR',confidence:Math.round(w.confidence)})}canvas.width=0;canvas.height=0;progress(`OCR local · fragmento ${i+1} de ${tiles.length}`,10+80*(i+1)/tiles.length);
      }
    }finally{await worker.terminate()}
  }
  await doc.cleanup();return {preview:preview.toDataURL('image/png'),canvas:preview,width:viewport.width,height:viewport.height,items:proposals(words),wordCount:words.length};
}
