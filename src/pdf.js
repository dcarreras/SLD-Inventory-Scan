import * as pdfjs from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { LocalOcr } from './ocr-client';
import { applyMappings, detectLegends, proposals } from './inventory';
pdfjs.GlobalWorkerOptions.workerSrc=workerUrl;

const DPI=300, TILE=3000, OVERLAP=160;
export async function previewPdf(file, pageNumber=1, zoom=1) {
  const task=pdfjs.getDocument({data:await file.arrayBuffer()});
  task.onPassword=()=>{task.destroy()};
  try {
    const doc=await task.promise;
    const page=await doc.getPage(pageNumber),viewport=page.getViewport({scale:1});
    const scale=Math.min(2*zoom,6000/Math.max(viewport.width,viewport.height),Math.sqrt(20000000/(viewport.width*viewport.height)));
    const canvas=document.createElement('canvas'),view=page.getViewport({scale});
    canvas.width=Math.ceil(view.width);canvas.height=Math.ceil(view.height);
    try {
      await page.render({canvasContext:canvas.getContext('2d'),viewport:view,canvas,background:'white'}).promise;
      return {image:canvas.toDataURL('image/png'),pageCount:doc.numPages};
    } finally {canvas.width=0;canvas.height=0}
  } finally {await task.destroy()}
}
export function tilesFor(width,height) {
  const tiles=[];
  for(let y=0;y<height;y+=TILE-OVERLAP)for(let x=0;x<width;x+=TILE-OVERLAP)
    tiles.push({x,y,w:Math.min(TILE,Math.ceil(width-x)),h:Math.min(TILE,Math.ceil(height-y))});
  return tiles;
}
export function ocrWord(item,tile,scale) {
  const xs=item.poly.map(p=>p[0]),ys=item.poly.map(p=>p[1]),x=Math.min(...xs),y=Math.min(...ys);
  return {text:item.text.trim(),x:(x+tile.x)/scale,y:(y+tile.y)/scale,width:(Math.max(...xs)-x)/scale,height:(Math.max(...ys)-y)/scale,source:'OCR RapidOCR',confidence:Math.round(item.score*100)};
}
export async function analyze(file, options, progress, cancelled, signal) {
  const bytes=await file.arrayBuffer(),doc=await pdfjs.getDocument({data:bytes}).promise;
  const proposalMode=options.vector===false?'desktop':'enhanced';
  let ocr;
  try {
    const pages=[],items=[],legendMappings=[],legendZones=[];let wordCount=0;
    if(options.ocr){progress('Cargando OCR local',1);ocr=new LocalOcr(signal);await ocr.initialize()}
    for(let pageNumber=1;pageNumber<=doc.numPages;pageNumber++){
    if(cancelled())throw new Error('Análisis cancelado.');
    const page=await doc.getPage(pageNumber),viewport=page.getViewport({scale:1}),previewScale=Math.min(2,2400/Math.max(viewport.width,viewport.height)),preview=document.createElement('canvas');
    const pv=page.getViewport({scale:previewScale});preview.width=Math.ceil(pv.width);preview.height=Math.ceil(pv.height);
    progress(`Procesando página ${pageNumber} de ${doc.numPages}`,(pageNumber-1)*100/doc.numPages);await page.render({canvasContext:preview.getContext('2d'),viewport:pv,canvas:preview,background:'white'}).promise;
    const words=[];
    if(options.vector!==false){const content=await page.getTextContent();for(const item of content.items){if(!item.str?.trim())continue;const m=pdfjs.Util.transform(viewport.transform,item.transform),h=Math.max(1,Math.hypot(m[2],m[3]));words.push({text:item.str.trim(),x:m[4],y:m[5]-h,width:item.width||h,height:h,source:'Texto vectorial',confidence:null})}}
    if(cancelled())throw new Error('Análisis cancelado.');
    if(options.ocr){
      const scale=DPI/72,v=page.getViewport({scale}),tiles=tilesFor(v.width,v.height);
      for(let i=0;i<tiles.length;i++){
        if(cancelled())throw new Error('Análisis cancelado.');
        const t=tiles[i],canvas=document.createElement('canvas');canvas.width=t.w;canvas.height=t.h;
        try{
          await page.render({canvasContext:canvas.getContext('2d'),canvas,viewport:v,transform:[1,0,0,1,-t.x,-t.y],background:'white'}).promise;
          const result=await ocr.recognize(canvas);
          for(const item of result.items)if(item.text.trim()&&item.score>=0.5)words.push(ocrWord(item,t,scale));
        }finally{canvas.width=0;canvas.height=0}
        progress(`Página ${pageNumber} de ${doc.numPages} · OCR ${i+1} de ${tiles.length}`,100*(pageNumber-1+(i+1)/tiles.length*.9)/doc.numPages);
      }
    }
    if(cancelled())throw new Error('Análisis cancelado.');
    const legends=proposalMode==='desktop'?{mappings:[],zones:[]}:detectLegends(words,{page:pageNumber});
    legendMappings.push(...legends.mappings);legendZones.push(...legends.zones);
    items.push(...proposals(words,{mode:proposalMode,legendZones:legends.zones}).map(item=>({...item,page:pageNumber})));
    if(options.vision){progress(`Procesando página ${pageNumber} de ${doc.numPages}`,100*(pageNumber-.05)/doc.numPages);items.push(...(await options.vision(preview,viewport.width,viewport.height)).map(item=>({...item,page:pageNumber})))}
    if(cancelled())throw new Error('Análisis cancelado.');
    pages.push({preview:preview.toDataURL('image/png'),width:viewport.width,height:viewport.height});wordCount+=words.length;preview.width=0;preview.height=0;
    }
    const classified=proposalMode==='desktop'?items:applyMappings(items,legendMappings);
    return {pages,items:classified,legendMappings,legendZones,wordCount,analysis:{mode:options.mode||'custom',vector:options.vector!==false,ocr:!!options.ocr,vision:!!options.vision,proposalMode,dpi:DPI,tileSize:TILE,tileOverlap:OVERLAP}};
  }finally{if(ocr)ocr.dispose();await doc.cleanup()}
}
