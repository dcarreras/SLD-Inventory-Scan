export class LocalOcr {
  constructor(signal){
    this.worker=new Worker(new URL('./ocr-worker.js',import.meta.url),{type:'module'});
    this.next=0;this.pending=new Map();this.signal=signal;
    this.onAbort=()=>this.dispose();
    signal?.addEventListener('abort',this.onAbort,{once:true});
    this.worker.onmessage=({data})=>{const request=this.pending.get(data.id);if(!request)return;this.pending.delete(data.id);data.error?request.reject(new Error(data.error)):request.resolve(data.result)};
    this.worker.onerror=()=>{for(const request of this.pending.values())request.reject(new Error('No se pudo iniciar el OCR local en este navegador.'));this.pending.clear()};
  }
  request(action,bitmap){
    if(this.signal?.aborted){bitmap?.close();return Promise.reject(new Error('Análisis cancelado.'))}
    return new Promise((resolve,reject)=>{const id=++this.next;this.pending.set(id,{resolve,reject});this.worker.postMessage({id,action,bitmap},bitmap?[bitmap]:[])});
  }
  initialize(){return this.request('initialize')}
  async recognize(canvas){return this.request('recognize',await createImageBitmap(canvas))}
  dispose(){this.signal?.removeEventListener('abort',this.onAbort);this.worker.terminate();for(const request of this.pending.values())request.reject(new Error('Análisis cancelado.'));this.pending.clear()}
}
