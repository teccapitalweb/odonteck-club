import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { TIPOS_PREGUNTA, validarClase, validarCurso } from './lib/validador.mjs';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const cursoId = 'diagnostico-en-ortodoncia-para-odontologos-generales';
const leerJson = async (relativa) => JSON.parse(await readFile(path.join(raiz, relativa), 'utf8'));

const catalogo = await leerJson('src/data/catalogo.json');
const quizzes = await leerJson('src/data/quizzes-demo.json');
const curso = catalogo.cursos.find((item) => item.id === cursoId);
if (!curso) throw new Error(`No existe ${cursoId} en catalogo.json`);

const erroresCurso = validarCurso(curso);
if (erroresCurso.length) throw new Error(`Curso inválido:\n- ${erroresCurso.join('\n- ')}`);
if (curso.clases.length !== 5) throw new Error(`Se esperaban 5 clases y hay ${curso.clases.length}`);

for (const clase of curso.clases) {
  const quiz = quizzes.find((item) => item.cursoId === cursoId && item.n === clase.n);
  const transcripcion = await leerJson(`scripts/pipeline/out/transcripciones-locales/ortodoncia-${clase.n}.json`);
  if (!quiz) throw new Error(`Falta el quiz de la clase ${clase.n}`);
  if (quiz.estado !== 'borrador') throw new Error(`El quiz ${quiz.id} no está protegido como borrador`);
  if (clase.ficha?.estado !== 'borrador') throw new Error(`La ficha de la clase ${clase.n} no está protegida como borrador`);

  const contenidoClase = {
    titulo: clase.titulo,
    resumen: clase.notas?.resumen,
    conceptos: clase.notas?.conceptos,
    preguntas: quiz.preguntas,
  };
  const errores = validarClase(contenidoClase, {
    duracionSeg: transcripcion.duracionSeg,
    segmentos: transcripcion.segmentos,
  });
  if (errores.length) throw new Error(`Clase ${clase.n} inválida:\n- ${errores.join('\n- ')}`);

  const tipos = new Set(quiz.preguntas.map((pregunta) => pregunta.tipo));
  if (TIPOS_PREGUNTA.some((tipo) => !tipos.has(tipo))) {
    throw new Error(`La clase ${clase.n} no contiene las cinco interacciones`);
  }
}

const quizzesCurso = quizzes.filter((item) => item.cursoId === cursoId);
if (quizzesCurso.length !== 5) throw new Error(`Se esperaban 5 quizzes y hay ${quizzesCurso.length}`);

console.log('Piloto de Ortodoncia válido');
console.log('5 clases · 30 conceptos · 25 actividades · 5 tipos por clase');
console.log('Quizzes y fichas protegidos como borradores para revisión clínica');
