const scale = 300 / 72;
const identifier = /(?<![A-Z0-9])[-=]?(?:(?:Q|CT|VT|CVT|LA|DS|ES|CB|BCT|TR|T)[A-Z]*\s*-?\s*\d{1,4}(?:[A-Z](?=\b))?|D\d{2,4})(?=\b|[A-Z]{2})/i;
const descriptor = /^(?:CB|DS|ES|CT\w*|VT\w*|CVT|LA|BCT|REACTOR|TRANSFORMER|CIRCUIT[- ]BREAKER|(?:CURRENT|VOLTAGE) TRANSFORMER|(?:CAPACITIVE|CAPACITOR) VOLTAGE TRANSFORMER|(?:EARTH|EARTHING|GROUND|GROUNDING) SWITCH|(?:SURGE|LIGHTNING) ARRESTER|DISCONNECTOR|ISOLATOR|SECCIONADOR|PARARRAYOS)$/i;
const desktopIdentifier = /(?<![A-Z0-9])(?:[-=]?(?:(?:Q|CT|VT|CVT|LA|DS|ES|CB|BCT|TR|T)[A-Z]*-?\d{1,4}[A-Z]?|D\d{2,4})\b)/i;
const desktopDescriptor = /^(?:CB|DS|ES|CT\w*|VT\w*|CVT|LA|BCT|REACTOR|TRANSFORMER)$/i;
const legendHeading = /\b(?:LEYENDA|LEGEND|SYMBOLS?|ABREVIATURAS?|ABBREVIATIONS?|KEY)\b/i;
const legendCode = /^[-=]?(?:CB|DS|ES|CT|BCT|VT|CVT|LA|TR|Q|[A-Z]{1,5})$/;
const explicitTypes={CB:'Interruptor automático',DS:'Seccionador',ES:'Seccionador de puesta a tierra',CT:'Transformador de corriente',BCT:'Transformador de corriente',VT:'Transformador de tensión',CVT:'Transformador de tensión',LA:'Pararrayos'};
const types = [[/\b(?:CB|CIRCUIT[- ]BREAKER|INTERRUPTOR)\b/i,'Interruptor automático'],[/\b(?:DS|DISCONNECT(?:OR)?|ISOLATOR|SECCIONADOR)\b/i,'Seccionador'],[/\b(?:ES|(?:EARTH|EARTHING|GROUND|GROUNDING)[- ]SWITCH|PUESTA A TIERRA)\b/i,'Seccionador de puesta a tierra'],[/\b(?:CT|BCT|CURRENT[- ]TRANSFORMER|TRANSFORMADOR DE CORRIENTE)\b/i,'Transformador de corriente'],[/\b(?:VT|CVT|VOLTAGE[- ]TRANSFORMER|TRANSFORMADOR DE TENSI[OÓ]N)\b/i,'Transformador de tensión'],[/\b(?:LA|(?:SURGE|LIGHTNING)[- ]ARRESTER|PARARRAYOS)\b/i,'Pararrayos'],[/\b(?:POWER[- ]TRANSFORMER|TRANSFORMADOR DE POTENCIA|MVA)\b/i,'Transformador de potencia'],[/\b(?:REACTOR|REACTANCIA)\b/i,'Reactor'],[/\b(?:BUSBAR|BARRA)\b/i,'Barra'],[/\b(?:SF6|FUSE|FUSIBLE)\b/i,'Equipo eléctrico']];
const norm = text => String(text||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const center = word => [word.x + word.width / 2, word.y + word.height / 2];
const distance = (a,b) => { const [ax,ay]=center(a),[bx,by]=center(b);return Math.hypot(ax-bx,ay-by) };

function typeFromDescription(text) {
  const candidates=types.filter(([re])=>re.test(text||'')).map(([,type])=>type);
  return candidates.length===1?candidates[0]:'Elemento por revisar';
}
function baseClassification(tag,description) {
  const match=String(tag||'').match(/^[-=]?(CB|DS|ES|CT|BCT|VT|CVT|LA)\s*-?\s*\d{1,4}[A-Z]?$/i);
  if(match)return {type:explicitTypes[match[1].toUpperCase()],classificationBasis:'Etiqueta'};
  const type=typeFromDescription(description);
  return {type,classificationBasis:type==='Elemento por revisar'?'Sin clasificar':'Descripción'};
}
function classifyDesktop(description){
  if(/\b(?:CB|CIRCUIT BREAKER|INTERRUPTOR)\b/i.test(description))return 'Interruptor automático';
  if(/\b(?:DS|DISCONNECT|ISOLATOR|SECCIONADOR)\b/i.test(description))return 'Seccionador';
  if(/\b(?:ES|EARTH SWITCH|PUESTA A TIERRA)\b/i.test(description))return 'Seccionador de puesta a tierra';
  if(/\b(?:CT\w*|CURRENT TRANSFORMER|TRANSFORMADOR DE CORRIENTE)\b/i.test(description))return 'Transformador de corriente';
  if(/\b(?:VT|CVT|VOLTAGE TRANSFORMER|TRANSFORMADOR DE TENSI)\b/i.test(description))return 'Transformador de tensión';
  if(/\b(?:LA|ARRESTER|PARARRAYOS)\b/i.test(description))return 'Pararrayos';
  if(/\b(?:TRANSFORMER|MVA)\b/i.test(description))return 'Transformador de potencia';
  if(/\b(?:REACTOR|REACTANCIA)\b/i.test(description))return 'Reactor';
  if(/\b(?:BUSBAR|BARRA)\b/i.test(description))return 'Barra';
  if(/\b(?:SF6|FUSE|FUSIBLE)\b/i.test(description))return 'Equipo eléctrico';
  return 'Elemento por revisar';
}

export function deduplicate(words) {
  const out=[];
  for(const word of [...words].sort((a,b)=>(b.confidence??101)-(a.confidence??101))) {
    if(!out.some(other=>norm(word.text)===norm(other.text)&&distance(word,other)<70/scale)) out.push(word);
  }
  return out;
}

function rowsNearHeading(words,heading) {
  const candidates=words.filter(word=>word!==heading&&word.y>=heading.y-18&&word.y<=heading.y+650&&word.x>=heading.x-100&&word.x<=heading.x+850).sort((a,b)=>a.y-b.y||a.x-b.x);
  const rows=[];
  for(const word of candidates) {
    const row=rows.find(item=>Math.abs(item.y-word.y)<18);
    if(row) { row.words.push(word); row.y=Math.min(row.y,word.y); }
    else rows.push({y:word.y,words:[word]});
  }
  const contiguous=[];
  for(const row of rows) {
    if(contiguous.length&&row.y-contiguous.at(-1).y>65) break;
    contiguous.push(row);
  }
  return contiguous;
}

export function detectLegends(words,{page=1}={}) {
  const clean=deduplicate(words),mappings=[],zones=[];
  for(const heading of clean.filter(word=>legendHeading.test(word.text))) {
    const rows=rowsNearHeading(clean,heading),found=[];
    for(const row of rows) {
      const ordered=[...row.words].sort((a,b)=>a.x-b.x),codeWord=ordered.find(word=>legendCode.test(word.text.trim().toUpperCase()));
      if(!codeWord||ordered.length<2)continue;
      const pattern=codeWord.text.trim().replace(/^[-=]/,'').toUpperCase(),description=ordered.filter(word=>word!==codeWord).map(word=>word.text).join(' ').trim();
      const type=explicitTypes[pattern]||typeFromDescription(`${pattern} ${description}`);
      if(type==='Elemento por revisar')continue;
      found.push({id:'legend-'+page+'-'+norm(pattern)+'-'+Math.round(row.y),pattern,type,description,origin:'Leyenda detectada',page,enabled:true,words:ordered});
    }
    if(!found.length)continue;
    const legendWords=found.flatMap(mapping=>mapping.words);
    const left=Math.min(heading.x,...legendWords.map(word=>word.x))-12;
    const top=Math.min(heading.y,...legendWords.map(word=>word.y))-12;
    const right=Math.max(heading.x+heading.width,...legendWords.map(word=>word.x+word.width))+12;
    const bottom=Math.max(heading.y+heading.height,...legendWords.map(word=>word.y+word.height))+12;
    zones.push({page,x:left,y:top,width:right-left,height:bottom-top});
    for(const {words:unused,...mapping} of found)if(!mappings.some(other=>norm(other.pattern)===norm(mapping.pattern)&&other.type===mapping.type))mappings.push(mapping);
  }
  return {mappings,zones};
}

function inLegendZone(word,zones) {
  return zones.some(zone=>word.x>=zone.x&&word.x+word.width<=zone.x+zone.width&&word.y>=zone.y&&word.y+word.height<=zone.y+zone.height);
}
function mappingMatches(item,mapping) {
  const pattern=norm(mapping.pattern);
  if(!pattern)return false;
  const tag=norm(item.tag),description=norm(item.description);
  return tag===pattern||(tag.startsWith(pattern)&&/^[A-Z]+$/.test(pattern))||description.includes(pattern);
}

export function applyMappings(items,mappings=[]) {
  const active=[...mappings].filter(mapping=>mapping.enabled!==false&&mapping.pattern&&mapping.type).sort((a,b)=>(b.origin==='Regla manual')-(a.origin==='Regla manual'));
  return items.map(item=>{
    if(item.classificationBasis==='Edición manual'||item.manual)return item;
    const base={...item,type:item.baseType??item.type,classificationBasis:item.baseClassificationBasis??item.classificationBasis,legendMappingId:null};
    const mapping=active.find(rule=>mappingMatches(base,rule));
    return mapping?{...base,type:mapping.type,classificationBasis:mapping.origin==='Regla manual'?'Regla manual':'Leyenda detectada',legendMappingId:mapping.id}:base;
  });
}

export function proposals(words,{mode='enhanced',legendZones=[],mappings=[]}={}) {
  const source=legendZones.length?words.filter(word=>!inLegendZone(word,legendZones)):words;
  const proposed=mode==='desktop'?desktopProposals(source):enhancedProposals(source);
  return applyMappings(proposed,mappings);
}
function enhancedProposals(words) {
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
    const confidences=nearby.map(item=>item.confidence).filter(value=>value!=null),classification=baseClassification(tag,description);
    out.push({id:crypto.randomUUID(),tag,description,...classification,baseType:classification.type,baseClassificationBasis:classification.classificationBasis,voltage:description.match(/\b\d+(?:[.,]\d+)?\s*k\s*v\b/i)?.[0]||'',current:description.match(/\b\d+(?:[.,]\d+)?\s?(?:A|k\s*A)\b/i)?.[0]||'',source:tagged.source,confidence:confidences.length?Math.round(confidences.reduce((a,b)=>a+b,0)/confidences.length):null,validated:false,x:tagged.x,y:tagged.y,width:tagged.width,height:tagged.height,anchorX,anchorY});
  }
  return out.sort((a,b)=>a.x-b.x||a.y-b.y).map(({anchorX,anchorY,...item})=>item);
}
function desktopProposals(words){
  const clean=deduplicate(words).map(word=>({...word,text:word.text.replace(/\s+/g,'')})),out=[];
  for(const word of clean){
    if(!desktopIdentifier.test(word.text)&&!desktopDescriptor.test(word.text))continue;
    const [x,y]=center(word),nearby=clean.filter(item=>{const [ix,iy]=center(item);return Math.abs(iy-y)<105/scale&&Math.abs(ix-x)<900/scale}).sort((a,b)=>a.x-b.x),description=nearby.map(item=>item.text).join(' '),tag=(nearby.find(item=>desktopIdentifier.test(item.text))||word).text;
    if(out.some(item=>norm(item.tag)===norm(tag)&&Math.hypot(item.anchorX-x,item.anchorY-y)<250/scale))continue;
    const confidences=nearby.map(item=>item.confidence).filter(value=>value!=null),type=classifyDesktop(description);
    out.push({id:crypto.randomUUID(),tag,description,type,baseType:type,classificationBasis:'Compatibilidad con escritorio',baseClassificationBasis:'Compatibilidad con escritorio',voltage:description.match(/\b\d+(?:[.,]\d+)?\s?kV\b/i)?.[0]||'',current:description.match(/\b\d+(?:[.,]\d+)?\s?(?:A|kA)\b/i)?.[0]||'',source:word.source,confidence:confidences.length?Math.round(confidences.reduce((a,b)=>a+b,0)/confidences.length):null,validated:false,x:word.x,y:word.y,width:word.width,height:word.height,anchorX:x,anchorY:y});
  }
  return out.sort((a,b)=>a.x-b.x||a.y-b.y).map(({anchorX,anchorY,...item})=>item);
}
export const visibleRows = (items,query,status,type,translate=value=>value) => items.filter(p=>(status==='Todas'||(status==='Validadas'?p.validated:!p.validated)) && (type==='Todos'||p.type===type) && [p.tag,p.description,p.type,translate(p.type),p.voltage,p.current,p.source,translate(p.source),p.classificationBasis].join(' ').toLowerCase().includes(query.toLowerCase()));
