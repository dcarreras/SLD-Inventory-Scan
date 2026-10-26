import {describe,it,expect} from 'vitest';
import {deduplicate,proposals} from './inventory';
const word=(text,x,y,confidence=95)=>({text,x,y,width:10,height:5,source:'OCR RapidOCR',confidence});
describe('alineación con OCR de escritorio',()=>{
  it('asocia tensión y corriente dentro de la distancia de escritorio',()=>{
    const rows=proposals([word('CB-01',10,10),word('220kV',30,10),word('1250A',200,10)]);
    expect(rows).toHaveLength(1);expect(rows[0]).toMatchObject({tag:'CB-01',voltage:'220kV',current:'1250A'});
  });
  it('conserva repeticiones espacialmente distintas y elimina solapes',()=>{
    const rows=deduplicate([word('Q123',10,10,75),word('Q123',13,10,95),word('Q123',100,10,80)]);
    expect(rows).toHaveLength(2);expect(rows[0].confidence).toBe(95);
  });
  it('separa identificadores de texto vectorial o OCR concatenado',()=>{
    expect(proposals([word('CT205CURRENTTRANSFORMER',10,10)])[0].tag).toBe('CT205');
    expect(proposals([word('VT300 VOLTAGE TRANSFORMER',10,10)])[0].tag).toBe('VT300');
  });
  it('repite las reglas de propuesta de escritorio en el modo de comparación',()=>{
    const rows=proposals([word('CB101',10,10),word('CT205CURRENTTRANSFORMER',40,10)],{mode:'desktop'});
    expect(rows).toHaveLength(1);expect(rows[0]).toMatchObject({tag:'CB101',classificationBasis:'Compatibilidad con escritorio'});
  });
  it('conserva identificadores próximos y clasifica sus prefijos explícitos',()=>{
    const rows=proposals([word('CB 101',10,10),word('CT205',40,10),word('CVT-02',75,10)]);
    expect(rows.map(({tag,type,classificationBasis})=>({tag,type,classificationBasis}))).toEqual([
      {tag:'CB 101',type:'Interruptor automático',classificationBasis:'Etiqueta'},
      {tag:'CT205',type:'Transformador de corriente',classificationBasis:'Etiqueta'},
      {tag:'CVT-02',type:'Transformador de tensión',classificationBasis:'Etiqueta'}
    ]);
  });
  it('reconoce términos técnicos completos sin atribuir categorías ambiguas',()=>{
    expect(proposals([word('EARTHING SWITCH',10,10)])[0]).toMatchObject({type:'Seccionador de puesta a tierra',classificationBasis:'Descripción'});
    expect(proposals([word('SURGE ARRESTER',10,10)])[0]).toMatchObject({type:'Pararrayos',classificationBasis:'Descripción'});
    expect(proposals([word('Q1',10,10),word('CIRCUIT BREAKER',40,10),word('CURRENT TRANSFORMER',80,10)])[0]).toMatchObject({tag:'Q1',type:'Elemento por revisar',classificationBasis:'Sin clasificar'});
  });
  it('mantiene el texto de unidades con espacios detectados por OCR',()=>{
    expect(proposals([word('CB101',10,10),word('132 k V',40,10),word('40 k A',80,10)])[0]).toMatchObject({voltage:'132 k V',current:'40 k A'});
  });
});
