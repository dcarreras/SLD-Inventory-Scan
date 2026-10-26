import {describe,expect,it} from 'vitest';
import {localOcrError} from './ocr-client';

describe('diagnóstico del worker OCR',()=>{
  it('conserva el detalle del fallo de arranque',()=>{
    expect(localOcrError('CSP bloqueó unsafe-eval').message).toBe('No se pudo iniciar el OCR local. Detalle técnico: CSP bloqueó unsafe-eval');
  });
});
