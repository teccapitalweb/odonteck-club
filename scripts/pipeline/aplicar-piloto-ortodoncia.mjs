import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const cursoId = 'diagnostico-en-ortodoncia-para-odontologos-generales';
const actualizado = '2026-10-10T00:00:00.000Z';

const leerJson = async (relativa) => JSON.parse(await readFile(path.join(raiz, relativa), 'utf8'));
const guardarJson = async (relativa, valor) => {
  await writeFile(path.join(raiz, relativa), `${JSON.stringify(valor, null, 2)}\n`, 'utf8');
};

const contenido = await leerJson('scripts/pipeline/out/contenido/diagnostico-en-ortodoncia-para-odontologos-generales.json');
const catalogo = await leerJson('src/data/catalogo.json');
const quizzes = await leerJson('src/data/quizzes-demo.json');

const curso = catalogo.cursos.find((item) => item.id === cursoId);
if (!curso) throw new Error(`No existe el curso ${cursoId} en catalogo.json`);
if (contenido.clases.length !== curso.clases.length) {
  throw new Error(`El paquete tiene ${contenido.clases.length} clases y el catálogo ${curso.clases.length}`);
}

curso.descripcion = contenido.curso.descripcion;
curso.aprenderas = contenido.curso.aprenderas;
curso.nivel = contenido.curso.nivel;

for (const claseContenido of contenido.clases) {
  const clase = curso.clases.find((item) => item.n === claseContenido.n);
  if (!clase) throw new Error(`Falta la clase ${claseContenido.n} en el catálogo`);
  if (clase.videoId !== claseContenido.videoId) {
    throw new Error(`El video de la clase ${claseContenido.n} no coincide con el paquete validado`);
  }

  clase.titulo = claseContenido.titulo;
  clase.notas = {
    resumen: claseContenido.resumen,
    conceptos: claseContenido.conceptos,
  };
  clase.ficha = {
    estado: 'borrador',
    archivo: `fichas/${cursoId}/clase-${claseContenido.n}.pdf`,
    version: '0.9',
    revisadaPor: 'Pendiente de revisión clínica',
    actualizada: actualizado,
    vistaPreviaLocal: `/output/pdf/ortodoncia-clase-${claseContenido.n}-ficha-estudio.pdf`,
  };
}

const nuevosQuizzes = contenido.clases.map((clase) => ({
  id: `${cursoId}_${clase.n}`,
  cursoId,
  n: clase.n,
  estado: 'borrador',
  version: 1,
  actualizado,
  preguntas: clase.preguntas,
}));

const primeraPosicion = quizzes.findIndex((quiz) => quiz.cursoId === cursoId);
const restantes = quizzes.filter((quiz) => quiz.cursoId !== cursoId);
if (primeraPosicion < 0) throw new Error(`No existe ningún quiz previo para ${cursoId}`);
restantes.splice(primeraPosicion, 0, ...nuevosQuizzes);

await guardarJson('src/data/catalogo.json', catalogo);
await guardarJson('src/data/quizzes-demo.json', restantes);

console.log(`Curso actualizado: ${curso.titulo}`);
console.log(`Clases: ${curso.clases.length}; conceptos: ${curso.clases.reduce((total, clase) => total + clase.notas.conceptos.length, 0)}`);
console.log(`Quizzes en borrador: ${nuevosQuizzes.length}; actividades: ${nuevosQuizzes.reduce((total, quiz) => total + quiz.preguntas.length, 0)}`);
