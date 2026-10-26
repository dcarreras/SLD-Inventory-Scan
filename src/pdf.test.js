import {describe,it,expect} from 'vitest';
import {tilesFor,ocrWord} from './pdf';
describe('coordenadas del OCR',()=>{
  it('divide el plano en fragmentos solapados sin perder los bordes',()=>{
    expect(tilesFor(3100,100)).toEqual([{x:0,y:0,w:3000,h:100},{x:2840,y:0,w:260,h:100}]);
  });
  it('convierte polígonos y desplazamientos a puntos PDF',()=>{
    const item=ocrWord({text:' CT101 ',score:.91,poly:[[100,200],[200,200],[200,250],[100,250]]},{x:2840,y:0},300/72);
    expect(item).toMatchObject({text:'CT101',y:48,width:24,height:12,confidence:91});expect(item.x).toBeCloseTo(705.6);
  });
});
