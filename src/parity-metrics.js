const normalize=value=>(value||'').toUpperCase().replace(/[^A-Z0-9]/g,'');

function rows(payload){return payload?.items||payload?.equipment||[]}

function point(item,space,scale){
  const box=item.rect||item;
  const factor=space==='desktop'?scale:1;
  return {tag:normalize(item.tag),page:item.page||1,x:(box.x||0)/factor+(box.width||0)/factor/2,y:(box.y||0)/factor+(box.height||0)/factor/2};
}

export function measureParity(reference,candidate,{referenceScale=300/72,candidateSpace='pdf',distance=80/(300/72)}={}){
  if(candidate.analysis&&(!candidate.analysis.ocr||candidate.analysis.vector||candidate.analysis.vision||candidate.analysis.proposalMode!=='desktop'))throw new Error('El resultado web debe usar solo OCR y el modo de compatibilidad con escritorio.');
  const expected=rows(reference).filter(item=>item.accepted===true||item.validated===true);
  if(!expected.length)throw new Error('La referencia debe contener al menos un elemento validado manualmente.');
  const actual=rows(candidate),available=actual.map((item,index)=>({item,index,point:point(item,candidateSpace,referenceScale)})),matches=[];
  for(const item of expected){
    const target=point(item,'desktop',referenceScale);
    const found=available.filter(entry=>entry.point.page===target.page&&entry.point.tag===target.tag).map(entry=>({...entry,distance:Math.hypot(entry.point.x-target.x,entry.point.y-target.y)})).filter(entry=>entry.distance<=distance).sort((a,b)=>a.distance-b.distance)[0];
    if(found){matches.push(found.distance);available.splice(available.findIndex(entry=>entry.index===found.index),1)}
  }
  const matched=matches.length, falsePositives=available.length;
  return {reference:expected.length,candidates:actual.length,matched,missed:expected.length-matched,falsePositives,recall:matched/expected.length,precision:actual.length?(actual.length-falsePositives)/actual.length:0,falsePositiveRate:actual.length?falsePositives/actual.length:0,meanCoordinateDistance:matched?matches.reduce((sum,value)=>sum+value,0)/matched:0};
}
