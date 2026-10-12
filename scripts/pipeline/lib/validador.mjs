// Validación propia del contenido generado (clase y curso). Devuelve la lista de errores en español
// para poder reenviarla al modelo en el reintento.
import { mmssASegundos } from './tiempo.mjs';

export const NIVELES = ['Básico', 'Intermedio', 'Avanzado'];
export const TIPOS_PREGUNTA = ['seleccion', 'seleccion_multiple', 'ordenar', 'relacionar', 'completar'];
export const NIVELES_COGNITIVOS = ['Aplicar', 'Analizar', 'Decidir'];
export const LIMITES = {
  tituloMaxCaracteres: 70,
  resumenMaxPalabras: 60,
  conceptosMin: 3,
  conceptosMax: 6,
  preguntas: 5,
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
    e.push(...validarPreguntas(c.preguntas, { duracionSeg, segmentos }));
  }
  return e;
}

/** Valida preguntas de quiz (reutilizable también al publicar). */
export function validarPreguntas(preguntas, { duracionSeg = null, segmentos = [] } = {}) {
  const e = [];
  const vistas = new Set();
  const tipos = new Set();
  const validarElementos = (lista, campo, { min = 3, max = 6 } = {}) => {
    if (!Array.isArray(lista) || lista.length < min || lista.length > max) { e.push(`${campo}: debe tener entre ${min} y ${max} elementos`); return [];
    }
    const ids = [];
    lista.forEach((x, j) => {
      if (!x || typeof x !== 'object' || !textoValido(x.id) || !textoValido(x.texto)) e.push(`${campo}[${j}]: requiere id y texto`);
      else ids.push(String(x.id));
    });
    if (new Set(ids).size !== ids.length) e.push(`${campo}: contiene IDs repetidos`);
    return ids;
  };
  preguntas.forEach((p, i) => {
    if (!p || typeof p !== 'object') return e.push(`preguntas[${i}]: debe ser objeto`);
    const tipo = p.tipo ?? 'seleccion';
    if (!TIPOS_PREGUNTA.includes(tipo)) e.push(`preguntas[${i}].tipo: '${tipo}' no está soportado`);
    else tipos.add(tipo);
    if (!textoValido(p.q)) e.push(`preguntas[${i}].q: vacía`);
    else {
      const n = normalizar(p.q);
      if (vistas.has(n)) e.push(`preguntas[${i}].q: pregunta repetida`);
      vistas.add(n);
    }
    if (!textoValido(p.casoClinico)) e.push(`preguntas[${i}].casoClinico: vacío`);
    if (!textoValido(p.competencia)) e.push(`preguntas[${i}].competencia: vacía`);
    if (!NIVELES_COGNITIVOS.includes(p.nivelCognitivo)) e.push(`preguntas[${i}].nivelCognitivo: debe ser Aplicar, Analizar o Decidir`);
    const seg = mmssASegundos(p.referenciaVideo);
    const fin = Number.isFinite(duracionSeg) && duracionSeg > 0 ? duracionSeg : (segmentos.at(-1)?.fin ?? null);
    if (seg === null) e.push(`preguntas[${i}].referenciaVideo: debe tener formato mm:ss`);
    else if (fin !== null && seg > fin) e.push(`preguntas[${i}].referenciaVideo: está fuera de la duración`);
    else if (segmentos.length && !marcaEnTranscripcion(seg, segmentos)) e.push(`preguntas[${i}].referenciaVideo: no corresponde a texto de la transcripción`);

    if (tipo === 'seleccion' || tipo === 'seleccion_multiple') {
      if (!Array.isArray(p.opciones) || p.opciones.length !== LIMITES.opciones) e.push(`preguntas[${i}].opciones: deben ser exactamente ${LIMITES.opciones}`);
      else {
        if (p.opciones.some((o) => !textoValido(o))) e.push(`preguntas[${i}].opciones: hay opciones vacías`);
        const norm = p.opciones.map(normalizar);
        if (new Set(norm).size !== norm.length) e.push(`preguntas[${i}].opciones: hay opciones repetidas`);
      }
      const nOpc = Array.isArray(p.opciones) ? p.opciones.length : LIMITES.opciones;
      if (tipo === 'seleccion' && (!Number.isInteger(p.correcta) || p.correcta < 0 || p.correcta >= nOpc)) e.push(`preguntas[${i}].correcta: índice inválido (${p.correcta}); debe ser entero 0–${nOpc - 1}`);
      if (tipo === 'seleccion_multiple') {
        if (!Array.isArray(p.correctas) || p.correctas.length < 2 || p.correctas.length >= nOpc) e.push(`preguntas[${i}].correctas: requiere entre 2 y ${Math.max(2, nOpc - 1)} índices`);
        else if (new Set(p.correctas).size !== p.correctas.length || p.correctas.some((x) => !Number.isInteger(x) || x < 0 || x >= nOpc)) e.push(`preguntas[${i}].correctas: contiene índices inválidos o repetidos`);
      }
    } else if (tipo === 'ordenar') {
      const ids = validarElementos(p.elementos, `preguntas[${i}].elementos`);
      if (!Array.isArray(p.ordenCorrecto) || p.ordenCorrecto.length !== ids.length || new Set(p.ordenCorrecto).size !== ids.length || p.ordenCorrecto.some((id) => !ids.includes(String(id)))) e.push(`preguntas[${i}].ordenCorrecto: debe contener todos los IDs una sola vez`);
    } else if (tipo === 'relacionar') {
      const izq = validarElementos(p.izquierda, `preguntas[${i}].izquierda`, { min: 3, max: 5 });
      const der = validarElementos(p.derecha, `preguntas[${i}].derecha`, { min: 3, max: 5 });
      if (izq.length !== der.length) e.push(`preguntas[${i}]: ambos lados deben tener la misma cantidad`);
      const respuestas = p.pares && typeof p.pares === 'object' && !Array.isArray(p.pares) ? izq.map((id) => String(p.pares[id] ?? '')) : [];
      if (respuestas.length !== izq.length || respuestas.some((id) => !der.includes(id)) || new Set(respuestas).size !== respuestas.length) e.push(`preguntas[${i}].pares: debe relacionar cada ID una sola vez`);
    } else if (tipo === 'completar') {
      if (!textoValido(p.plantilla)) e.push(`preguntas[${i}].plantilla: vacía`);
      if (!Array.isArray(p.huecos) || p.huecos.length < 2 || p.huecos.length > 4) e.push(`preguntas[${i}].huecos: debe tener entre 2 y 4 espacios`);
      else {
        const ids = p.huecos.map((h) => String(h?.id ?? ''));
        if (ids.some((id) => !id) || new Set(ids).size !== ids.length) e.push(`preguntas[${i}].huecos: requiere IDs únicos`);
        p.huecos.forEach((h, j) => { if (!Array.isArray(h?.respuestas) || !h.respuestas.length || h.respuestas.some((x) => !textoValido(x))) e.push(`preguntas[${i}].huecos[${j}].respuestas: requiere respuestas válidas`); });
      }
    }
    if (!textoValido(p.explicacion)) e.push(`preguntas[${i}].explicacion: vacía`);
  });
  if (preguntas.length === LIMITES.preguntas) {
    for (const tipo of TIPOS_PREGUNTA) if (!tipos.has(tipo)) e.push(`preguntas: falta una interacción de tipo '${tipo}'`);
  }
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
