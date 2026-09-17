// Validación propia del contenido generado (clase y curso). Devuelve la lista de errores en español
// para poder reenviarla al modelo en el reintento.
import { mmssASegundos } from './tiempo.mjs';

export const NIVELES = ['Básico', 'Intermedio', 'Avanzado'];
export const LIMITES = {
  tituloMaxCaracteres: 70,
  resumenMaxPalabras: 60,
  conceptosMin: 3,
  conceptosMax: 6,
  preguntas: 4,
  opciones: 4,
  descripcionCursoMaxPalabras: 50,
  aprenderas: 5,
  toleranciaMarcaSeg: 3,
};

export const contarPalabras = (t) => String(t ?? '').trim().split(/\s+/).filter(Boolean).length;

/** Normaliza para comparar opciones: minúsculas, sin acentos, sin puntuación ni espacios extra. */
export const normalizar = (t) => String(t ?? '')
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

const textoValido = (v) => typeof v === 'string' && v.trim().length > 0;

/**
 * Valida el contenido de UNA clase.
 * @param {object} c  { titulo, resumen, conceptos, preguntas }
 * @param {object} ctx
 * @param {number|null} ctx.duracionSeg  duración del video (inventario); si es null se usa el fin de la transcripción
 * @param {{inicio:number, fin:number}[]} [ctx.segmentos]  para comprobar que las marcas existen en la transcripción
 * @returns {string[]} errores (vacío = válido)
 */
export function validarClase(c, { duracionSeg = null, segmentos = [] } = {}) {
  const e = [];
  if (!c || typeof c !== 'object' || Array.isArray(c)) return ['La respuesta debe ser un objeto JSON'];

  // titulo
  if (!textoValido(c.titulo)) e.push('titulo: vacío o no es texto');
  else {
    if ([...c.titulo.trim()].length > LIMITES.tituloMaxCaracteres) e.push(`titulo: tiene ${[...c.titulo.trim()].length} caracteres (máximo ${LIMITES.tituloMaxCaracteres})`);
    if (/\bclase\s*(n|\d+)\b/i.test(c.titulo)) e.push("titulo: no debe ser genérico ni contener 'Clase N'");
  }

  // resumen
  if (!textoValido(c.resumen)) e.push('resumen: vacío o no es texto');
  else if (contarPalabras(c.resumen) > LIMITES.resumenMaxPalabras) e.push(`resumen: tiene ${contarPalabras(c.resumen)} palabras (máximo ${LIMITES.resumenMaxPalabras})`);

  // conceptos
  const fin = Number.isFinite(duracionSeg) && duracionSeg > 0 ? duracionSeg : (segmentos.at(-1)?.fin ?? null);
  if (!Array.isArray(c.conceptos)) e.push('conceptos: debe ser un arreglo');
  else {
    if (c.conceptos.length < LIMITES.conceptosMin || c.conceptos.length > LIMITES.conceptosMax) {
      e.push(`conceptos: hay ${c.conceptos.length} (deben ser entre ${LIMITES.conceptosMin} y ${LIMITES.conceptosMax})`);
    }
    c.conceptos.forEach((k, i) => {
      if (!k || typeof k !== 'object') return e.push(`conceptos[${i}]: debe ser objeto { t, texto }`);
      if (!textoValido(k.texto)) e.push(`conceptos[${i}].texto: vacío`);
      const seg = mmssASegundos(k.t);
      if (seg === null) return e.push(`conceptos[${i}].t: '${k.t}' no tiene formato mm:ss`);
      if (fin !== null && seg > fin) e.push(`conceptos[${i}].t: ${k.t} está fuera de la duración del video`);
      else if (segmentos.length && !marcaEnTranscripcion(seg, segmentos)) e.push(`conceptos[${i}].t: ${k.t} no corresponde a ningún momento con texto en la transcripción`);
    });
    const marcas = c.conceptos.map((k) => mmssASegundos(k?.t)).filter((s) => s !== null);
    if (marcas.some((s, i) => i > 0 && s < marcas[i - 1])) e.push('conceptos: las marcas deben ir en orden cronológico');
  }

  // preguntas
  if (!Array.isArray(c.preguntas)) e.push('preguntas: debe ser un arreglo');
  else {
    if (c.preguntas.length !== LIMITES.preguntas) e.push(`preguntas: hay ${c.preguntas.length} (deben ser exactamente ${LIMITES.preguntas})`);
    e.push(...validarPreguntas(c.preguntas));
  }
  return e;
}

/** Valida preguntas de quiz (reutilizable también al publicar). */
export function validarPreguntas(preguntas) {
  const e = [];
  const vistas = new Set();
  preguntas.forEach((p, i) => {
    if (!p || typeof p !== 'object') return e.push(`preguntas[${i}]: debe ser objeto`);
    if (!textoValido(p.q)) e.push(`preguntas[${i}].q: vacía`);
    else {
      const n = normalizar(p.q);
      if (vistas.has(n)) e.push(`preguntas[${i}].q: pregunta repetida`);
      vistas.add(n);
    }
    if (!Array.isArray(p.opciones) || p.opciones.length !== LIMITES.opciones) {
      e.push(`preguntas[${i}].opciones: deben ser exactamente ${LIMITES.opciones}`);
    } else {
      if (p.opciones.some((o) => !textoValido(o))) e.push(`preguntas[${i}].opciones: hay opciones vacías`);
      const norm = p.opciones.map(normalizar);
      if (new Set(norm).size !== norm.length) e.push(`preguntas[${i}].opciones: hay opciones repetidas`);
    }
    const nOpc = Array.isArray(p.opciones) ? p.opciones.length : LIMITES.opciones;
    if (!Number.isInteger(p.correcta) || p.correcta < 0 || p.correcta >= nOpc) e.push(`preguntas[${i}].correcta: índice inválido (${p.correcta}); debe ser entero 0–${nOpc - 1}`);
    if (!textoValido(p.explicacion)) e.push(`preguntas[${i}].explicacion: vacía`);
  });
  return e;
}

/** Valida el contenido a nivel curso. */
export function validarCurso(c) {
  const e = [];
  if (!c || typeof c !== 'object' || Array.isArray(c)) return ['La respuesta debe ser un objeto JSON'];
  if (!textoValido(c.descripcion)) e.push('descripcion: vacía');
  else if (contarPalabras(c.descripcion) > LIMITES.descripcionCursoMaxPalabras) e.push(`descripcion: tiene ${contarPalabras(c.descripcion)} palabras (máximo ${LIMITES.descripcionCursoMaxPalabras})`);
  if (!Array.isArray(c.aprenderas) || c.aprenderas.length !== LIMITES.aprenderas) e.push(`aprenderas: deben ser exactamente ${LIMITES.aprenderas} elementos`);
  else {
    if (c.aprenderas.some((a) => !textoValido(a))) e.push('aprenderas: hay elementos vacíos');
    if (new Set(c.aprenderas.map(normalizar)).size !== c.aprenderas.length) e.push('aprenderas: hay elementos repetidos');
  }
  if (!NIVELES.includes(c.nivel)) e.push(`nivel: '${c.nivel}' no es uno de ${NIVELES.join(', ')}`);
  return e;
}

/** ¿La marca (segundos, con precisión de mm:ss) cae dentro de algún segmento con texto? */
export function marcaEnTranscripcion(seg, segmentos, tolerancia = LIMITES.toleranciaMarcaSeg) {
  return segmentos.some((s) => seg >= Math.floor(s.inicio) - tolerancia && seg <= Math.ceil(s.fin) + tolerancia);
}
