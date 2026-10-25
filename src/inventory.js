const identifier = /\b(?:Q[A-Z]*|CT|VT|CVT|LA|DS|ES|CB|BCT|TR|T)-?\d{1,4}[A-Z]?\b|\bD\d{2,4}\b/i;
const descriptor = /\b(?:CB|DS|ES|CT\w*|VT\w*|CVT|LA|BCT|REACTOR|TRANSFORMER)\b/;
const types = [[/\b(?:CB|CIRCUIT BREAKER|INTERRUPTOR)\b/i,'Interruptor automático'],[/\b(?:DS|DISCONNECT|ISOLATOR|SECCIONADOR)\b/i,'Seccionador'],[/\b(?:ES|EARTH SWITCH)\b/i,'Puesta a tierra'],[/\b(?:CT\w*|CURRENT TRANSFORMER)\b/i,'Transformador de corriente'],[/\b(?:VT|CVT|VOLTAGE TRANSFORMER)\b/i,'Transformador de tensión'],[/\b(?:LA|ARRESTER)\b/i,'Pararrayos'],[/\b(?:TRANSFORMER|MVA)\b/i,'Transformador de potencia'],[/\b(?:REACTOR|REACTANCIA)\b/i,'Reactor'],[/\b(?:BUSBAR|BARRA)\b/i,'Barra']];
export function deduplicate(words) {
  const out=[];
  for (const word of [...words].sort((a,b)=>(b.confidence ?? 101)-(a.confidence ?? 101))) {
    const norm=s=>s.toUpperCase().replace(/[^A-Z0-9]/g,'');
    if (!out.some(other=>norm(word.text)===norm(other.text) && Math.abs(word.x-other.x)<12 && Math.abs(word.y-other.y)<12)) out.push(word);
  }
  return out;
}
export function proposals(words) {
  const clean=deduplicate(words), out=[];
  for (const word of clean.filter(w=>identifier.test(w.text) || descriptor.test(w.text))) {
    const nearby=clean.filter(w=>Math.abs(w.y-word.y)<25 && Math.abs(w.x-word.x)<160).sort((a,b)=>a.x-b.x);
    const description=nearby.map(w=>w.text).join(' ');
    const tagged=nearby.filter(w=>identifier.test(w.text)).sort((a,b)=>Math.abs(a.x-word.x)-Math.abs(b.x-word.x))[0] || word;
    const tag=(tagged.text.match(identifier)||tagged.text.match(descriptor)||[tagged.text])[0].trim();
    if(out.some(p=>p.tag.toUpperCase()===tag.toUpperCase() && Math.abs(p.x-tagged.x)<50 && Math.abs(p.y-tagged.y)<50)) continue;
    out.push({id:crypto.randomUUID(),tag,description,type:types.find(([re])=>re.test(description))?.[1] || 'Elemento por revisar',voltage:description.match(/\b\d+(?:[.,]\d+)?\s?kV\b/i)?.[0]||'',current:description.match(/\b\d+(?:[.,]\d+)?\s?(?:A|kA)\b/i)?.[0]||'',source:tagged.source,confidence:tagged.confidence,validated:false,x:tagged.x,y:tagged.y,width:tagged.width,height:tagged.height});
  }
  return out;
}
export const visibleRows = (items,query,status,type) => items.filter(p=>(status==='Todas'||(status==='Validadas'?p.validated:!p.validated)) && (type==='Todos'||p.type===type) && [p.tag,p.description,p.type,p.voltage,p.current,p.source].join(' ').toLowerCase().includes(query.toLowerCase()));
