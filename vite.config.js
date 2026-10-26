import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
const wasm=fileURLToPath(import.meta.resolve('onnxruntime-web/wasm'));
function rapidOcrDetector(){
  return {name:'rapidocr-detector-parity',transform(code,id){
    if(!id.replaceAll('\\','/').includes('/@paddleocr/paddleocr-js/dist/index.mjs'))return;
    const search='cv.findContours(bitmap, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);';
    if(!code.includes(search))throw new Error('PaddleOCR detector changed; review the RapidOCR parity patch.');
    return code.replace(search,'const kernel = cv.Mat.ones(2, 2, cv.CV_8U); cv.dilate(bitmap, bitmap, kernel); kernel.delete(); '+search).replace('if (contour.rows < 4)', 'if (contour.rows < 1)');
  }};
}
export default defineConfig({plugins:[rapidOcrDetector()],worker:{plugins:()=>[rapidOcrDetector()]},resolve:{alias:[{find:/^onnxruntime-web$/,replacement:wasm}]},optimizeDeps:{exclude:['@paddleocr/paddleocr-js'],include:['clipper-lib','js-yaml','@techstark/opencv-js']}});
