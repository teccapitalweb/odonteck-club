import { access, readFile } from 'node:fs/promises';

const catalogo = JSON.parse(await readFile(new URL('../src/data/catalogo.json', import.meta.url), 'utf8'));
const fuenteJuego = await readFile(new URL('../src/core/juego-clase.ts', import.meta.url), 'utf8');

function hash(texto) {
  let valor = 2166136261;
  for (let i = 0; i < texto.length; i += 1) {
    valor ^= texto.charCodeAt(i);
    valor = Math.imul(valor, 16777619);
  }
  return valor >>> 0;
}

function normalizarPalabra(palabra) {
  return palabra
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '');
}

const PALABRAS_EXCLUIDAS = new Set([
  'PARA', 'COMO', 'ESTE', 'ESTA', 'ESTOS', 'ESTAS', 'SOLO', 'CADA', 'PERO', 'SINO',
  'ANTE', 'BAJO', 'CABE', 'CONTRA', 'DESDE', 'DURANTE', 'ENTRE', 'HACIA', 'HASTA',
  'MEDIANTE', 'SEGUN', 'SOBRE', 'TRAS', 'CUANDO', 'DONDE', 'QUIEN', 'CUAL', 'CUALES',
  'TODO', 'TODA', 'TODOS', 'TODAS', 'OTRO', 'OTRA', 'OTROS', 'OTRAS', 'MISMO', 'MISMA',
  'DEBE', 'DEBEN', 'PUEDE', 'PUEDEN', 'TIENE', 'TIENEN', 'HACE', 'HACEN', 'ESTAR',
  'ESTAN', 'SERA', 'SEAN', 'SIDO', 'AUNQUE', 'PORQUE', 'ADEMAS', 'TAMBIEN', 'DESPUES',
  'ANTES', 'LUEGO', 'SIEMPRE', 'NUNCA', 'MUCHO', 'POCO', 'GRAN', 'PARTE', 'FORMA',
  'CASO', 'CASOS', 'CLASE', 'CLASES', 'CURSO', 'CURSOS', 'VIDEO', 'TEMA', 'PUNTO',
  'PUNTOS', 'TIPO', 'TIPOS', 'NIVEL', 'AREA', 'EQUIPO', 'ODONTECK', 'GENERAL',
  'GENERALES', 'DENTRO', 'FUERA', 'MENOS', 'MAYOR', 'MENOR', 'MEJOR', 'PEOR',
]);

const secuencia = ['rompecabezas', 'sopa', 'ahorcado', 'memorama', 'palabra'];
function elegirTipoJuego(cursoId, n) {
  const claseActual = Math.max(1, n);
  const claseRompecabezas = cursoId === 'diagnostico-en-ortodoncia-para-odontologos-generales'
    ? 1
    : (hash(cursoId) % 3) + 1;
  if (claseActual === claseRompecabezas) return 'rompecabezas';
  const otros = ['sopa', 'ahorcado', 'memorama', 'palabra'];
  const offset = hash(`${cursoId}:otros`) % otros.length;
  const posicionSinRompe = claseActual < claseRompecabezas ? claseActual - 1 : claseActual - 2;
  return otros[(offset + posicionSinRompe) % otros.length];
}

const clases = catalogo.cursos.flatMap((curso) => curso.clases.map((clase) => ({ curso, clase })));
const sinNotas = clases.filter(({ clase }) => !clase.notas?.conceptos?.length);
const conMenosDe3Terminos = [];
const reparto = Object.fromEntries(secuencia.map((t) => [t, 0]));
const rompecabezas = [];
const imagenesFaltantes = [];
const imagenesSinMapa = [];

for (const { curso, clase } of clases) {
  const frases = [
    ...(clase.notas?.conceptos?.map((x) => x.texto) || []),
    clase.notas?.resumen || '',
    `${curso.titulo}: ${clase.titulo}`,
  ];
  const usados = new Set();
  for (const f of frases) {
    for (const raw of f.split(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+/)) {
      const w = normalizarPalabra(raw);
      if (w.length >= 4 && w.length <= 10 && !PALABRAS_EXCLUIDAS.has(w)) usados.add(w);
    }
  }
  if (usados.size < 3) conMenosDe3Terminos.push(`${curso.id}:${clase.n}`);
  const tipo = elegirTipoJuego(curso.id, clase.n);
  reparto[tipo] += 1;
  if (tipo === 'rompecabezas') {
    const archivo = `${curso.id}-clase-${clase.n}.jpg`;
    const ruta = new URL(`../public/juegos/rompecabezas/${archivo}`, import.meta.url);
    rompecabezas.push(`${curso.id}:${clase.n}`);
    try {
      await access(ruta);
    } catch {
      imagenesFaltantes.push(archivo);
    }
    if (!fuenteJuego.includes(archivo)) imagenesSinMapa.push(archivo);
  }
}

const tablero30Piezas = fuenteJuego.includes('const cols = 5;') && fuenteJuego.includes('const rows = 6;');

console.log(JSON.stringify({
  cursos: catalogo.cursos.length,
  clases: clases.length,
  listasParaJuego: clases.length - sinNotas.length - conMenosDe3Terminos.length,
  sinNotas: sinNotas.map(({ curso, clase }) => `${curso.id}:${clase.n}`),
  conMenosDe3Terminos,
  reparto,
  rompecabezasConImagen: rompecabezas.length - imagenesFaltantes.length,
  rompecabezasSinImagen: imagenesFaltantes,
  imagenesSinMapa,
  piezasPorRompecabezas: tablero30Piezas ? 30 : null,
}, null, 2));

if (sinNotas.length || conMenosDe3Terminos.length || clases.length === 0 || rompecabezas.length !== 18 || imagenesFaltantes.length || imagenesSinMapa.length || !tablero30Piezas) process.exitCode = 1;
