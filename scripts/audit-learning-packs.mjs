import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const raiz = resolve(import.meta.dirname, '..');
const [catalogo, quizzes] = await Promise.all([
  readFile(resolve(raiz, 'src/data/catalogo.json'), 'utf8').then(JSON.parse),
  readFile(resolve(raiz, 'src/data/quizzes-demo.json'), 'utf8').then(JSON.parse),
]);

const mapaQuiz = new Map(quizzes.map((q) => [`${q.cursoId}_${q.n}`, q]));
const filas = catalogo.cursos.flatMap((curso) => curso.clases.map((clase) => {
  const id = `${curso.id}_${clase.n}`;
  const quiz = mapaQuiz.get(id);
  return {
    id, curso: curso.titulo, clase: clase.titulo,
    notas: Boolean(clase.notas?.resumen && clase.notas?.conceptos?.length),
    quiz: Boolean(quiz?.estado === 'aprobado' && quiz?.preguntas?.length),
    pdf: Boolean(clase.ficha?.estado === 'aprobada' && clase.ficha?.archivo),
  };
}));

const total = filas.length;
const cuenta = (campo) => filas.filter((f) => f[campo]).length;
const resumen = { clases: total, notas: cuenta('notas'), quizzesAprobados: cuenta('quiz'), pdfsAprobados: cuenta('pdf'), paquetesCompletos: filas.filter((f) => f.notas && f.quiz && f.pdf).length };
console.log(JSON.stringify(resumen, null, 2));

const faltantes = filas.filter((f) => !f.notas || !f.quiz || !f.pdf);
if (faltantes.length) {
  console.log('\nFaltantes (primeros 20):');
  for (const f of faltantes.slice(0, 20)) console.log(`- ${f.id}: ${!f.notas ? 'notas ' : ''}${!f.quiz ? 'quiz ' : ''}${!f.pdf ? 'pdf' : ''}`.trim());
  if (faltantes.length > 20) console.log(`- ... y ${faltantes.length - 20} clases más`);
}

if (process.argv.includes('--strict') && faltantes.length) process.exitCode = 1;
