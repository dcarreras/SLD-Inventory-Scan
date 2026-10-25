import * as ort from 'onnxruntime-web/wasm';
const classes = 'person,bicycle,car,motorcycle,airplane,bus,train,truck,boat,traffic light,fire hydrant,stop sign,parking meter,bench,bird,cat,dog,horse,sheep,cow,elephant,bear,zebra,giraffe,backpack,umbrella,handbag,tie,suitcase,frisbee,skis,snowboard,sports ball,kite,baseball bat,baseball glove,skateboard,surfboard,tennis racket,bottle,wine glass,cup,fork,knife,spoon,bowl,banana,apple,sandwich,orange,broccoli,carrot,hot dog,pizza,donut,cake,chair,couch,potted plant,bed,dining table,toilet,tv,laptop,mouse,remote,keyboard,cell phone,microwave,oven,toaster,sink,refrigerator,book,clock,vase,scissors,teddy bear,hair drier,toothbrush'.split(',');
export async function runVision(canvas, width, height) {
  ort.env.wasm.wasmPaths={wasm:'/ort/ort-wasm-simd-threaded.wasm'};
  const parts=await Promise.all(['/models/yolo11s.0','/models/yolo11s.1'].map(async url=>{const r=await fetch(url);if(!r.ok) throw new Error('No se han encontrado los pesos locales de YOLO11s.');return new Uint8Array(await r.arrayBuffer())}));
  const bytes=new Uint8Array(parts.reduce((n,p)=>n+p.length,0));let offset=0;for(const p of parts){bytes.set(p,offset);offset+=p.length}
  const session=await ort.InferenceSession.create(bytes,{executionProviders:['wasm']});
  const input=document.createElement('canvas');input.width=640;input.height=480;
  const ctx=input.getContext('2d',{willReadFrequently:true});ctx.drawImage(canvas,0,0,640,480);
  const pixels=ctx.getImageData(0,0,640,480).data, data=new Float32Array(3*640*480);
  for(let i=0;i<640*480;i++) for(let c=0;c<3;c++) data[c*640*480+i]=pixels[i*4+c]/255;
  const result=await session.run({[session.inputNames[0]]:new ort.Tensor('float32',data,[1,3,480,640])});
  const t=result[session.outputNames[0]], n=t.dims[2], values=t.data, found=[];
  for(let i=0;i<n;i++){let best=0,cls=0;for(let c=0;c<80;c++){const score=values[(4+c)*n+i];if(score>best){best=score;cls=c}}if(best<0.35)continue;
    const w=values[2*n+i]*width/640,h=values[3*n+i]*height/480,x=values[i]*width/640-w/2,y=values[n+i]*height/480-h/2;
    found.push({id:crypto.randomUUID(),tag:classes[cls],description:'Clase COCO experimental; no identificada como símbolo eléctrico',type:'Detección visual experimental',voltage:'',current:'',source:'YOLO11s / COCO',confidence:Math.round(best*100),validated:false,x,y,width:w,height:h});
  }
  found.sort((a,b)=>b.confidence-a.confidence);
  const kept=[];for(const a of found){if(kept.some(b=>{const ix=Math.max(0,Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x)),iy=Math.max(0,Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y)),intersection=ix*iy;return a.tag===b.tag&&intersection/(a.width*a.height+b.width*b.height-intersection)>0.45}))continue;kept.push(a)}
  await session.release();return kept;
}
