import {readFile} from 'node:fs/promises';
import {measureParity} from '../src/parity-metrics.js';

const [referencePath,candidatePath,...options]=process.argv.slice(2);
if(!referencePath||!candidatePath)throw new Error('Uso: node scripts/measure-parity.mjs <referencia-validada.json> <resultado.json> [--candidate-space=pdf|desktop]');
const candidateSpace=options.find(value=>value.startsWith('--candidate-space='))?.split('=')[1]||'pdf';
if(!['pdf','desktop'].includes(candidateSpace))throw new Error('candidate-space debe ser pdf o desktop.');
const [reference,candidate]=await Promise.all([referencePath,candidatePath].map(async path=>JSON.parse(await readFile(path,'utf8'))));
console.log(JSON.stringify(measureParity(reference,candidate,{candidateSpace}),null,2));
