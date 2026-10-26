import {afterEach,describe,expect,it,vi} from 'vitest';

const state=vi.hoisted(()=>({pages:[]}));
vi.mock('pdfjs-dist',()=>({
  GlobalWorkerOptions:{},
  Util:{transform:(_viewport,transform)=>transform},
  getDocument:()=>({promise:Promise.resolve({numPages:state.pages.length,getPage:async number=>state.pages[number-1],cleanup:async()=>{}})})
}));
import {analyze} from './pdf';

describe('análisis multipágina',()=>{
  afterEach(()=>vi.unstubAllGlobals());
  it('mantiene propuestas repetidas y dimensiones separadas por página',async()=>{
    const page=width=>({
      getViewport:({scale})=>({width:width*scale,height:100*scale,transform:[1,0,0,1,0,0]}),
      render:()=>({promise:Promise.resolve()}),
      getTextContent:async()=>({items:[{str:'CB101',width:30,transform:[1,0,0,10,10,20]}]})
    });
    state.pages=[page(200),page(300)];
    vi.stubGlobal('document',{createElement:()=>({getContext:()=>({}),toDataURL:()=> 'data:image/png;base64,preview'})});
    const result=await analyze({arrayBuffer:async()=>new ArrayBuffer(0)},{ocr:false},()=>{},()=>false);
    expect(result.pages.map(({width})=>width)).toEqual([200,300]);
    expect(result.items.map(({tag,page})=>({tag,page}))).toEqual([{tag:'CB101',page:1},{tag:'CB101',page:2}]);
  });
  it('permite excluir el texto vectorial para comparar solo OCR',async()=>{
    const page={getViewport:({scale})=>({width:200*scale,height:100*scale,transform:[1,0,0,1,0,0]}),render:()=>({promise:Promise.resolve()}),getTextContent:async()=>({items:[{str:'CB101',width:30,transform:[1,0,0,10,10,20]}]})};
    state.pages=[page];
    vi.stubGlobal('document',{createElement:()=>({getContext:()=>({}),toDataURL:()=> 'data:image/png;base64,preview'})});
    const result=await analyze({arrayBuffer:async()=>new ArrayBuffer(0)},{ocr:false,vector:false},()=>{},()=>false);
    expect(result).toMatchObject({wordCount:0,items:[],analysis:{vector:false,ocr:false,vision:false,proposalMode:'desktop',dpi:300,tileSize:3000,tileOverlap:160}});
  });
  it('conserva las reglas de leyenda detectadas con el análisis',async()=>{
    const page={getViewport:({scale})=>({width:200*scale,height:100*scale,transform:[1,0,0,1,0,0]}),render:()=>({promise:Promise.resolve()}),getTextContent:async()=>({items:[{str:'LEYENDA',width:30,transform:[1,0,0,10,10,20]},{str:'CB',width:20,transform:[1,0,0,10,20,50]},{str:'INTERRUPTOR',width:50,transform:[1,0,0,10,60,50]},{str:'CB101',width:30,transform:[1,0,0,10,130,90]}]})};
    state.pages=[page];
    vi.stubGlobal('document',{createElement:()=>({getContext:()=>({}),toDataURL:()=> 'data:image/png;base64,preview'})});
    const result=await analyze({arrayBuffer:async()=>new ArrayBuffer(0)},{ocr:false,mode:'reinforced'},()=>{},()=>false);
    expect(result.legendMappings).toMatchObject([{pattern:'CB',type:'Interruptor automático'}]);
    expect(result.items).toMatchObject([{tag:'CB101',classificationBasis:'Leyenda detectada'}]);
  });
  it('aplica una leyenda de una página a propuestas de las páginas posteriores',async()=>{
    const page=items=>({getViewport:({scale})=>({width:200*scale,height:100*scale,transform:[1,0,0,1,0,0]}),render:()=>({promise:Promise.resolve()}),getTextContent:async()=>({items})});
    state.pages=[page([{str:'LEYENDA',width:30,transform:[1,0,0,10,10,20]},{str:'CB',width:20,transform:[1,0,0,10,20,50]},{str:'INTERRUPTOR',width:50,transform:[1,0,0,10,60,50]}]),page([{str:'CB101',width:30,transform:[1,0,0,10,130,80]}])];
    vi.stubGlobal('document',{createElement:()=>({getContext:()=>({}),toDataURL:()=> 'data:image/png;base64,preview'})});
    const result=await analyze({arrayBuffer:async()=>new ArrayBuffer(0)},{ocr:false,mode:'reinforced'},()=>{},()=>false);
    expect(result.items).toMatchObject([{tag:'CB101',page:2,classificationBasis:'Leyenda detectada'}]);
  });
});
