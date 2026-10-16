import { readFile } from 'node:fs/promises';

const catalogo = JSON.parse(await readFile(new URL('../src/data/catalogo.json', import.meta.url), 'utf8'));

function hash(texto) {
  let valor = 2166136261;
  for (let i = 0; i < texto.length; i += 1) {
    valor ^= texto.charCodeAt(i);
    valor = Math.imul(valor, 16777619);
  }
  return valor >>> 0;
}

const tipos = ['ordenar', 'relacionar', 'pulso'];
const clases = catalogo.cursos.flatMap((curso) => curso.clases.map((clase) => ({ curso, clase })));
const sinNotas = clases.filter(({ clase }) => !clase.notas?.conceptos?.length);
const tiemposInvalidos = clases.filter(({ clase }) => clase.notas?.conceptos?.some(({ t }) => !/^\d{1,2}:\d{2}(?::\d{2})?$/.test(t)));
const reparto = Object.fromEntries([...tipos, 'rompecabezas'].map((tipo) => [tipo, 0]));
for (const { curso, clase } of clases) {
  const tipo = clase.notas?.conceptos?.length === 1 ? 'rompecabezas' : tipos[hash(`${curso.id}:${clase.n}`) % tipos.length];
  reparto[tipo] += 1;
}

console.log(JSON.stringify({
  cursos: catalogo.cursos.length,
  clases: clases.length,
  listasParaJuego: clases.length - sinNotas.length,
  sinNotas: sinNotas.map(({ curso, clase }) => `${curso.id}:${clase.n}`),
  tiemposInvalidos: tiemposInvalidos.map(({ curso, clase }) => `${curso.id}:${clase.n}`),
  reparto,
}, null, 2));

if (sinNotas.length || tiemposInvalidos.length || clases.length === 0) process.exitCode = 1;
