import { describe,it,expect } from 'vitest';
import { applyMappings,deduplicate,detectLegends,proposals,visibleRows } from './inventory';
describe('inventario',()=>{
  it('elimina texto vectorial y OCR duplicado, conservando su procedencia',()=>{const words=[{text:'CB101',x:10,y:20,width:20,height:10,source:'OCR',confidence:80},{text:'CB101',x:11,y:20,width:20,height:10,source:'Texto vectorial',confidence:null}];expect(deduplicate(words)).toHaveLength(1);expect(proposals(words)[0].source).toBe('Texto vectorial')});
  it('filtra por estado, tipo y texto',()=>{const items=[{tag:'Q1',type:'Interruptor',validated:true},{tag:'Q2',type:'Barra',validated:false}];expect(visibleRows(items,'Q1','Validadas','Interruptor')).toHaveLength(1);expect(visibleRows(items,'Q1','Pendientes','Todos')).toHaveLength(0)});
  it('asocia un descriptor próximo a su etiqueta y no interpreta palabras minúsculas como siglas',()=>{const words=[{text:'CT205',x:10,y:20,width:40,height:10,source:'OCR',confidence:90},{text:'TRANSFORMER',x:200,y:20,width:80,height:10,source:'OCR',confidence:90},{text:'es',x:400,y:40,width:10,height:10,source:'OCR',confidence:70}];expect(proposals(words).map(x=>x.tag)).toEqual(['CT205'])});
  it('extrae una leyenda textual, no la inventaría y aplica su equivalencia',()=>{
    const words=[{text:'LEYENDA',x:10,y:10,width:55,height:10,source:'Texto vectorial'},{text:'CB',x:20,y:40,width:15,height:10,source:'Texto vectorial'},{text:'INTERRUPTOR',x:60,y:40,width:80,height:10,source:'Texto vectorial'},{text:'CB101',x:300,y:200,width:35,height:10,source:'Texto vectorial'}];
    const legends=detectLegends(words,{page:1}),items=proposals(words,{legendZones:legends.zones,mappings:legends.mappings});
    expect(legends.mappings).toMatchObject([{pattern:'CB',type:'Interruptor automático',origin:'Leyenda detectada'}]);
    expect(items).toHaveLength(1);expect(items[0]).toMatchObject({tag:'CB101',type:'Interruptor automático',classificationBasis:'Leyenda detectada'});
  });
  it('prioriza una regla manual y preserva una clasificación editada',()=>{
    const items=[{id:'a',tag:'X101',description:'',type:'Elemento por revisar',baseType:'Elemento por revisar',classificationBasis:'Sin clasificar',baseClassificationBasis:'Sin clasificar'},{id:'b',tag:'X102',type:'Personalizado',classificationBasis:'Edición manual'}];
    const mappings=[{pattern:'X',type:'Equipo de leyenda',origin:'Leyenda detectada',enabled:true},{pattern:'X',type:'Equipo manual',origin:'Regla manual',enabled:true}];
    expect(applyMappings(items,mappings)).toMatchObject([{type:'Equipo manual',classificationBasis:'Regla manual'},{type:'Personalizado',classificationBasis:'Edición manual'}]);
  });
});
