import { PaddleOCR } from '@paddleocr/paddleocr-js';
import * as ort from 'onnxruntime-web/wasm';
let ocr,orientation;
const detOptions={limitSideLen:736,limitType:'min',maxSideLimit:2000,thresh:0.3,boxThresh:0.5,unclipRatio:1.6};
function crop(cv,source,poly){
  const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
  const width=Math.max(1,Math.floor(Math.max(distance(poly[0],poly[1]),distance(poly[2],poly[3]))));
  const height=Math.max(1,Math.floor(Math.max(distance(poly[0],poly[3]),distance(poly[1],poly[2]))));
  const src=cv.matFromArray(4,1,cv.CV_32FC2,poly.flat()),dst=cv.matFromArray(4,1,cv.CV_32FC2,[0,0,width,0,width,height,0,height]);
  const matrix=cv.getPerspectiveTransform(src,dst),output=new cv.Mat();
  try{cv.warpPerspective(source,output,matrix,new cv.Size(width,height),cv.INTER_CUBIC,cv.BORDER_REPLICATE,new cv.Scalar())}finally{src.delete();dst.delete();matrix.delete()}
  if(height/width>=1.5){const rotated=new cv.Mat();cv.rotate(output,rotated,cv.ROTATE_90_COUNTERCLOCKWISE);output.delete();return rotated}
  return output;
}
async function correctOrientations(cv,crops){
  const order=crops.map((mat,index)=>({index,ratio:mat.cols/mat.rows})).sort((a,b)=>a.ratio-b.ratio),plane=48*192;
  for(let start=0;start<order.length;start+=6){
    const batch=order.slice(start,start+6),data=new Float32Array(batch.length*3*plane);
    for(let n=0;n<batch.length;n++){
      const source=crops[batch[n].index],width=Math.min(192,Math.ceil(48*source.cols/source.rows));
      const resized=new cv.Mat(),bgr=new cv.Mat();
      try{
        cv.resize(source,resized,new cv.Size(width,48),0,0,cv.INTER_LINEAR);
        cv.cvtColor(resized,bgr,source.channels()===4?cv.COLOR_RGBA2BGR:cv.COLOR_RGB2BGR);
        for(let y=0;y<48;y++)for(let x=0;x<width;x++)for(let c=0;c<3;c++)data[n*3*plane+c*plane+y*192+x]=(bgr.data[(y*width+x)*3+c]/255-.5)/.5;
      }finally{resized.delete();bgr.delete()}
    }
    const result=await orientation.run({[orientation.inputNames[0]]:new ort.Tensor('float32',data,[batch.length,3,48,192])});
    const scores=result[orientation.outputNames[0]].data;
    for(let n=0;n<batch.length;n++)if(scores[2*n+1]>scores[2*n]&&scores[2*n+1]>.9){const index=batch[n].index,rotated=new cv.Mat();cv.rotate(crops[index],rotated,cv.ROTATE_180);crops[index].delete();crops[index]=rotated}
  }
}
async function recognize(bitmap){
  const canvas=new OffscreenCanvas(bitmap.width,bitmap.height),context=canvas.getContext('2d',{willReadFrequently:true});
  context.drawImage(bitmap,0,0);bitmap.close();
  const cv=ocr.cv,original=cv.matFromImageData(context.getImageData(0,0,canvas.width,canvas.height));
  const rawWidth=canvas.width,rawHeight=canvas.height;canvas.width=0;canvas.height=0;
  let image=original,scaled=null,padded=null,pad=0;const crops=[];
  try{
    if(Math.max(rawWidth,rawHeight)>2000){
      const ratio=2000/Math.max(rawWidth,rawHeight),width=Math.max(32,Math.round(Math.floor(rawWidth*ratio)/32)*32),height=Math.max(32,Math.round(Math.floor(rawHeight*ratio)/32)*32);
      scaled=new cv.Mat();cv.resize(original,scaled,new cv.Size(width,height),0,0,cv.INTER_LINEAR);image=scaled;
    }
    const imageWidth=image.cols,imageHeight=image.rows;
    if(image.rows<=30||image.cols/image.rows>8){
      pad=Math.floor(Math.abs(Math.max(Math.floor(image.cols/8),30)*2-image.rows)/2);padded=new cv.Mat();cv.copyMakeBorder(image,padded,pad,pad,0,0,cv.BORDER_CONSTANT,new cv.Scalar(0,0,0,255));image=padded;
    }
    const [{boxes}]=await ocr.detModel.predict(cv,[image],detOptions);
    for(const box of boxes)crops.push(crop(cv,image,box.poly));
    await correctOrientations(cv,crops);
    const recognized=crops.length?await ocr.recModel.predict(cv,crops):[];
    return {items:recognized.flatMap((result,index)=>result.text&&result.score>=.5?[{...result,poly:boxes[index].poly.map(([x,y])=>[Math.max(0,Math.min(rawWidth,x*rawWidth/imageWidth)),Math.max(0,Math.min(rawHeight,(y-pad)*rawHeight/imageHeight))])}]:[])};
  }finally{for(const mat of crops)mat.delete();if(padded)padded.delete();if(scaled)scaled.delete();original.delete()}
}
self.onmessage=async ({data})=>{
  const {id,action,bitmap}=data;
  try {
    let result;
    if(action==='initialize'){
      ocr=await PaddleOCR.create({worker:false,textDetectionModelName:'rapidocr_det',textRecognitionModelName:'rapidocr_rec',textDetectionModelAsset:{url:'/rapidocr/det.tar'},textRecognitionModelAsset:{url:'/rapidocr/rec.tar'},textDetectionBatchSize:1,textRecognitionBatchSize:6,ortOptions:{backend:'wasm',numThreads:1}});
      orientation=await ort.InferenceSession.create('/rapidocr/cls.onnx',{executionProviders:['wasm']});
    }else if(action==='recognize')result=await recognize(bitmap);
    self.postMessage({id,result});
  }catch(error){self.postMessage({id,error:error?.message||String(error)})}
};
