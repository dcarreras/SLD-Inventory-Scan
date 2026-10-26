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
    expect(result).toMatchObject({wordCount:0,items:[]});
  });
});
