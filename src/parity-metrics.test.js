import {describe,expect,it} from 'vitest';
import {measureParity} from './parity-metrics';

describe('métricas de paridad OCR',()=>{
  it('mide etiquetas y coordenadas frente a una referencia validada',()=>{
    const reference={items:[{tag:'CB-01',accepted:true,rect:{x:100,y:100,width:20,height:20}},{tag:'CT-02',accepted:true,rect:{x:400,y:100,width:20,height:20}}]};
    const candidate={items:[{tag:'CB01',page:1,x:26,y:26,width:5,height:5},{tag:'LA-03',page:1,x:100,y:100,width:5,height:5}]};
    expect(measureParity(reference,candidate)).toMatchObject({reference:2,candidates:2,matched:1,missed:1,falsePositives:1,recall:.5,precision:.5,falsePositiveRate:.5});
  });
  it('rechaza una referencia sin validación humana',()=>{
    expect(()=>measureParity({items:[{tag:'CB-01',rect:{x:0,y:0,width:1,height:1}}]},{items:[]})).toThrow('validado manualmente');
  });
});
