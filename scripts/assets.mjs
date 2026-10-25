import {mkdir,copyFile,readdir} from 'node:fs/promises';
import {join} from 'node:path';
await mkdir('public/ocr/core',{recursive:true});await mkdir('public/ort',{recursive:true});
await copyFile('node_modules/tesseract.js/dist/worker.min.js','public/ocr/worker.min.js');
for(const f of await readdir('node_modules/tesseract.js-core'))if(/\.wasm\.js$/.test(f))await copyFile(join('node_modules/tesseract.js-core',f),join('public/ocr/core',f));
for(const f of ['ort-wasm-simd-threaded.wasm','ort-wasm-simd-threaded.mjs'])await copyFile(join('node_modules/onnxruntime-web/dist',f),join('public/ort',f));
