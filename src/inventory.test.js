import { describe,it,expect } from 'vitest';
import { deduplicate,proposals,visibleRows } from './inventory';
describe('inventario',()=>{
  it('elimina texto vectorial y OCR duplicado, conservando su procedencia',()=>{const words=[{text:'CB101',x:10,y:20,width:20,height:10,source:'OCR',confidence:80},{text:'CB101',x:11,y:20,width:20,height:10,source:'Texto vectorial',confidence:null}];expect(deduplicate(words)).toHaveLength(1);expect(proposals(words)[0].source).toBe('Texto vectorial')});
  it('filtra por estado, tipo y texto',()=>{const items=[{tag:'Q1',type:'Interruptor',validated:true},{tag:'Q2',type:'Barra',validated:false}];expect(visibleRows(items,'Q1','Validadas','Interruptor')).toHaveLength(1);expect(visibleRows(items,'Q1','Pendientes','Todos')).toHaveLength(0)});
});
