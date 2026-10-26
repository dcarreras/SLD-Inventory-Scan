import {describe,it,expect} from 'vitest';
import {translate} from './i18n';
import {visibleRows} from './inventory';

describe('idiomas',()=>{
  it('traduce el progreso y mantiene el texto del plano sin modificar',()=>{
    expect(translate('en','OCR local · fragmento 2 de 5')).toBe('Local OCR · tile 2 of 5');
    expect(translate('en','Análisis terminado: 12 fragmentos de texto y 3 propuestas. Revisa cada resultado.')).toBe('Analysis complete: 12 text fragments and 3 proposals. Review each result.');
    expect(translate('en','CB101')).toBe('CB101');
    expect(translate('es','Pendiente')).toBe('Pendiente');
  });
  it('permite buscar el tipo traducido sin cambiar los datos guardados',()=>{
    const item={tag:'CB101',type:'Interruptor automático',source:'Texto vectorial',validated:false};
    expect(visibleRows([item],'circuit breaker','Todas','Todos',value=>translate('en',value))).toEqual([item]);
    expect(item.type).toBe('Interruptor automático');
  });
});
