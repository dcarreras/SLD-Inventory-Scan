const scale = 300 / 72;
const identifier = /(?<![A-Z0-9])[-=]?(?:(?:Q|CT|VT|CVT|LA|DS|ES|CB|BCT|TR|T)[A-Z]*\s*-?\s*\d{1,4}(?:[A-Z](?=\b))?|D\d{2,4})(?=\b|[A-Z]{2})/i;
const descriptor = /^(?:CB|DS|ES|CT\w*|VT\w*|CVT|LA|BCT|REACTOR|TRANSFORMER|CIRCUIT[- ]BREAKER|(?:CURRENT|VOLTAGE) TRANSFORMER|(?:CAPACITIVE|CAPACITOR) VOLTAGE TRANSFORMER|(?:EARTH|EARTHING|GROUND|GROUNDING) SWITCH|(?:SURGE|LIGHTNING) ARRESTER|DISCONNECTOR|ISOLATOR|SECCIONADOR|PARARRAYOS)$/i;
const explicitTypes={CB:'Interruptor automático',DS:'Seccionador',ES:'Seccionador de puesta a tierra',CT:'Transformador de corriente',BCT:'Transformador de corriente',VT:'Transformador de tensión',CVT:'Transformador de tensión',LA:'Pararrayos'};
const types = [[/\b(?:CB|CIRCUIT[- ]BREAKER|INTERRUPTOR)\b/i,'Interruptor automático'],[/\b(?:DS|DISCONNECT(?:OR)?|ISOLATOR|SECCIONADOR)\b/i,'Seccionador'],[/\b(?:ES|(?:EARTH|EARTHING|GROUND|GROUNDING)[- ]SWITCH|PUESTA A TIERRA)\b/i,'Seccionador de puesta a tierra'],[/\b(?:CT|BCT|CURRENT[- ]TRANSFORMER|TRANSFORMADOR DE CORRIENTE)\b/i,'Transformador de corriente'],[/\b(?:VT|CVT|VOLTAGE[- ]TRANSFORMER|TRANSFORMADOR DE TENSI[OÓ]N)\b/i,'Transformador de tensión'],[/\b(?:LA|(?:SURGE|LIGHTNING)[- ]ARRESTER|PARARRAYOS)\b/i,'Pararrayos'],[/\b(?:POWER[- ]TRANSFORMER|TRANSFORMADOR DE POTENCIA|MVA)\b/i,'Transformador de potencia'],[/\b(?:REACTOR|REACTANCIA)\b/i,'Reactor'],[/\b(?:BUSBAR|BARRA)\b/i,'Barra'],[/\b(?:SF6|FUSE|FUSIBLE)\b/i,'Equipo eléctrico']];
const norm = text => text.toUpperCase().replace(/[^A-Z0-9]/g,'');
const center = word => [word.x + word.width / 2, word.y + word.height / 2];
const distance = (a,b) => { const [ax,ay]=center(a),[bx,by]=center(b);return Math.hypot(ax-bx,ay-by) };
function classify(tag,description) {
  const match=tag.match(/^[-=]?(CB|DS|ES|CT|BCT|VT|CVT|LA)\s*-?\s*\d{1,4}[A-Z]?$/i);
  if(match)return {type:explicitTypes[match[1].toUpperCase()],classificationBasis:'Etiqueta'};
  const candidates=types.filter(([re])=>re.test(description)).map(([,type])=>type);
  return candidates.length===1?{type:candidates[0],classificationBasis:'Descripción'}:{type:'Elemento por revisar',classificationBasis:'Sin clasificar'};
}

export function deduplicate(words) {
  const out=[];
  for(const word of [...words].sort((a,b)=>(b.confidence??101)-(a.confidence??101))) {
    if(!out.some(other=>norm(word.text)===norm(other.text)&&distance(word,other)<70/scale)) out.push(word);
  }
  return out;
}

export function proposals(words) {
  const clean=deduplicate(words),out=[];
  for(const word of clean) {
    if(!identifier.test(word.text)&&(!descriptor.test(word.text)||(word.text.length<=2&&word.text!==word.text.toUpperCase())))continue;
    const [x,y]=center(word);
    const nearby=clean.filter(item=>{const [ix,iy]=center(item);return Math.abs(iy-y)<105/scale&&Math.abs(ix-x)<900/scale}).sort((a,b)=>a.x-b.x);
    const description=nearby.map(item=>item.text).join(' ');
    const tagged=identifier.test(word.text)?word:nearby.filter(item=>identifier.test(item.text)).sort((a,b)=>distance(word,a)-distance(word,b))[0]||word;
    const tag=tagged.text.match(identifier)?.[0]||tagged.text;
    const [anchorX,anchorY]=center(tagged);
    if(out.some(item=>norm(item.tag)===norm(tag)&&Math.hypot(item.anchorX-anchorX,item.anchorY-anchorY)<250/scale))continue;
    const confidences=nearby.map(item=>item.confidence).filter(value=>value!=null);
    out.push({id:crypto.randomUUID(),tag,description,...classify(tag,description),voltage:description.match(/\b\d+(?:[.,]\d+)?\s*k\s*v\b/i)?.[0]||'',current:description.match(/\b\d+(?:[.,]\d+)?\s?(?:A|k\s*A)\b/i)?.[0]||'',source:tagged.source,confidence:confidences.length?Math.round(confidences.reduce((a,b)=>a+b,0)/confidences.length):null,validated:false,x:tagged.x,y:tagged.y,width:tagged.width,height:tagged.height,anchorX,anchorY});
  }
  return out.sort((a,b)=>a.x-b.x||a.y-b.y).map(({anchorX,anchorY,...item})=>item);
}
export const visibleRows = (items,query,status,type,translate=value=>value) => items.filter(p=>(status==='Todas'||(status==='Validadas'?p.validated:!p.validated)) && (type==='Todos'||p.type===type) && [p.tag,p.description,p.type,translate(p.type),p.voltage,p.current,p.source,translate(p.source)].join(' ').toLowerCase().includes(query.toLowerCase()));
