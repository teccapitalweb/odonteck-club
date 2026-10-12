// Generación de notas, títulos y quizzes con la API de Anthropic.
// El cliente se inyecta (objeto con `beta.messages.create`) para poder probar con un doble.
import { segundosAMmss } from './tiempo.mjs';
import { LIMITES, NIVELES, validarClase, validarCurso } from './validador.mjs';

export const MODELO = 'claude-opus-5';
// Precios de lista de Claude Opus 5 (USD por millón de tokens) al 2026-09. Revisar si cambian.
export const PRECIO_USD_POR_MTOK = { entrada: 5, salida: 25 };
// Fallback del servidor ante una negativa del clasificador: el API reintenta con el modelo recomendado.
const BETAS = ['server-side-fallback-2026-07-01'];

// ───────────────────────── Prompts ─────────────────────────

export const SISTEMA_CLASE = `Eres editor académico de OdonTeck Club, una membresía de educación continua para odontólogos en México.
Recibes la transcripción automática de UNA clase grabada y produces el material de estudio de esa clase.

Reglas de fidelidad (las más importantes):
- La transcripción es tu única fuente. Todo lo que escribas debe estar dicho en la clase.
- No agregues datos que no aparezcan: dosis, porcentajes, tiempos, marcas comerciales, nombres de autores, clasificaciones o referencias. No completes con conocimiento general aunque sea correcto.
- La transcripción automática puede traer términos técnicos mal reconocidos. Corrige el término solo cuando el contexto lo deje inequívoco; si no, omite esa parte.
- Si un punto es ambiguo, prefiere dejarlo fuera antes que interpretarlo.

Qué producir:
- titulo: máximo ${LIMITES.tituloMaxCaracteres} caracteres, específico del tema de esta clase. Nada de "Clase N", ni repetir el nombre del curso, ni comillas o punto final.
- resumen: máximo ${LIMITES.resumenMaxPalabras} palabras. Qué se enseña y para qué le sirve al odontólogo en consulta.
- conceptos: entre ${LIMITES.conceptosMin} y ${LIMITES.conceptosMax} ideas clave en orden cronológico. "t" es la marca mm:ss donde se explica, copiada de una de las marcas [mm:ss] que preceden cada línea de la transcripción. "texto" en una frase breve.
- preguntas: exactamente ${LIMITES.preguntas}, una por cada tipo y en este orden: seleccion, seleccion_multiple, ordenar, relacionar y completar. Deben evaluar razonamiento clínico, no memoria trivial.
  - Cada pregunta debe partir de un caso, decisión, secuencia, comparación o criterio explicado de forma inequívoca en la clase.
  - "casoClinico": una situación breve de una a tres frases, construida solo con hechos presentes en la transcripción. Si no hay paciente, formula una situación de decisión profesional sin inventar edad, signos, antecedentes ni resultados.
  - "competencia": habilidad clínica concreta que se evalúa, en una frase breve.
  - "nivelCognitivo": usa exactamente Aplicar, Analizar o Decidir. No redactes reactivos de simple recuerdo.
  - "referenciaVideo": marca mm:ss exacta de una línea de la transcripción que contiene la evidencia principal. No uses una marca aproximada ni inventada.
  - seleccion: cuatro opciones plausibles, una correcta. Evita pistas de redacción, absolutos, "todas" y "ninguna".
  - seleccion_multiple: cuatro opciones plausibles y dos o tres correctas. La consigna debe decir explícitamente que pueden elegirse varias.
  - ordenar: entre tres y seis pasos realmente secuenciales. No fuerces una secuencia cuando la clase no la establece.
  - relacionar: entre tres y cinco pares uno a uno, útiles para discriminar conceptos clínicos.
  - completar: dos a cuatro huecos con términos o criterios inequívocos. Incluye variantes de respuesta aceptables solo si significan lo mismo.
  - "explicacion": dos o tres frases: justifica la solución, contrasta el error más probable y remite al criterio enseñado, sin añadir conocimiento externo.

Escribe en español de México con terminología clínica correcta. Responde solo con el JSON pedido.`;

export const SISTEMA_CURSO = `Eres editor académico de OdonTeck Club, una membresía de educación continua para odontólogos en México.
Con los títulos y resúmenes de las clases de un curso (ya revisados a partir de sus transcripciones) redactas la ficha del curso.

Reglas:
- Usa solo lo que dicen los resúmenes. No prometas temas, certificaciones, horas ni resultados que no aparezcan.
- descripcion: máximo ${LIMITES.descripcionCursoMaxPalabras} palabras, dirigida a un odontólogo que decide si toma el curso.
- aprenderas: exactamente ${LIMITES.aprenderas} logros concretos, cada uno iniciando con verbo en infinitivo, sin repetirse.
- nivel: uno de ${NIVELES.join(', ')}, según la complejidad clínica del contenido.

Escribe en español de México. Responde solo con el JSON pedido.`;

// Esquemas JSON para structured outputs (solo tipos/requeridos/enums; los límites finos los revisa el validador).
const propiedadesBasePregunta = {
  tipo: { type: 'string' }, q: { type: 'string' }, instruccion: { type: 'string' }, referenciaVideo: { type: 'string' }, casoClinico: { type: 'string' }, competencia: { type: 'string' }, nivelCognitivo: { type: 'string', enum: ['Aplicar', 'Analizar', 'Decidir'] }, explicacion: { type: 'string' },
};
const elemento = { type: 'object', additionalProperties: false, required: ['id', 'texto'], properties: { id: { type: 'string' }, texto: { type: 'string' } } };
const pregunta = (tipo, requeridos, properties) => ({
  type: 'object', additionalProperties: false,
  required: ['tipo', 'q', 'instruccion', 'referenciaVideo', 'casoClinico', 'competencia', 'nivelCognitivo', 'explicacion', ...requeridos],
  properties: { ...propiedadesBasePregunta, tipo: { type: 'string', enum: [tipo] }, ...properties },
});

export const ESQUEMA_CLASE = {
  type: 'object',
  additionalProperties: false,
  required: ['titulo', 'resumen', 'conceptos', 'preguntas'],
  properties: {
    titulo: { type: 'string' },
    resumen: { type: 'string' },
    conceptos: {
      type: 'array',
      items: { type: 'object', additionalProperties: false, required: ['t', 'texto'], properties: { t: { type: 'string' }, texto: { type: 'string' } } },
    },
    preguntas: {
      type: 'array',
      items: { oneOf: [
        pregunta('seleccion', ['opciones', 'correcta'], { opciones: { type: 'array', items: { type: 'string' } }, correcta: { type: 'integer', enum: [0, 1, 2, 3] } }),
        pregunta('seleccion_multiple', ['opciones', 'correctas'], { opciones: { type: 'array', items: { type: 'string' } }, correctas: { type: 'array', items: { type: 'integer', enum: [0, 1, 2, 3] } } }),
        pregunta('ordenar', ['elementos', 'ordenCorrecto'], { elementos: { type: 'array', items: elemento }, ordenCorrecto: { type: 'array', items: { type: 'string' } } }),
        pregunta('relacionar', ['izquierda', 'derecha', 'pares'], { izquierda: { type: 'array', items: elemento }, derecha: { type: 'array', items: elemento }, pares: { type: 'object', additionalProperties: { type: 'string' } } }),
        pregunta('completar', ['plantilla', 'huecos'], { plantilla: { type: 'string' }, huecos: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['id', 'etiqueta', 'respuestas'], properties: { id: { type: 'string' }, etiqueta: { type: 'string' }, respuestas: { type: 'array', items: { type: 'string' } } } } } }),
      ] },
    },
  },
};

export const ESQUEMA_CURSO = {
  type: 'object',
  additionalProperties: false,
  required: ['descripcion', 'aprenderas', 'nivel'],
  properties: {
    descripcion: { type: 'string' },
    aprenderas: { type: 'array', items: { type: 'string' } },
    nivel: { type: 'string', enum: NIVELES },
  },
};

/**
 * Convierte segmentos en líneas "[mm:ss] texto", agrupando ~`ventanaSeg` segundos por línea
 * para ahorrar tokens sin perder marcas de tiempo reales.
 */
export function formatearTranscripcion(segmentos, { ventanaSeg = 20 } = {}) {
  const lineas = [];
  let actual = null;
  for (const s of segmentos) {
    if (!actual || s.inicio - actual.inicio >= ventanaSeg) {
      if (actual) lineas.push(actual);
      actual = { inicio: s.inicio, textos: [s.texto] };
    } else actual.textos.push(s.texto);
  }
  if (actual) lineas.push(actual);
  return lineas.map((l) => `[${segundosAMmss(l.inicio)}] ${l.textos.join(' ')}`).join('\n');
}

export function promptClase({ curso, clase, totalClases, duracionSeg, segmentos }) {
  return [
    `Curso: ${curso.titulo}`,
    `Área: ${curso.area ?? 'Odontología'}`,
    `Clase ${clase.n} de ${totalClases}`,
    duracionSeg ? `Duración del video: ${segundosAMmss(duracionSeg)}` : null,
    '',
    '<transcripcion>',
    formatearTranscripcion(segmentos),
    '</transcripcion>',
    '',
    'Genera el JSON de la clase: titulo, resumen, conceptos y preguntas.',
  ].filter((l) => l !== null).join('\n');
}

export function promptCurso({ curso, clases }) {
  return [
    `Curso: ${curso.titulo}`,
    `Área: ${curso.area ?? 'Odontología'}`,
    `Nivel actual en el catálogo (orientativo): ${curso.nivel ?? 'sin definir'}`,
    '',
    '<clases>',
    ...clases.map((c) => `${c.n}. ${c.titulo}\n   ${c.resumen}`),
    '</clases>',
    '',
    'Genera el JSON del curso: descripcion, aprenderas y nivel.',
  ].join('\n');
}

// ───────────────────────── Llamada al modelo ─────────────────────────

export class ErrorGeneracion extends Error {
  constructor(mensaje, { errores = [], uso } = {}) {
    super(mensaje);
    this.name = 'ErrorGeneracion';
    this.errores = errores;
    this.uso = uso;
  }
}

const usoVacio = () => ({ entrada: 0, salida: 0, llamadas: 0 });
function sumarUso(acc, usage) {
  acc.entrada += (usage?.input_tokens ?? 0) + (usage?.cache_creation_input_tokens ?? 0) + (usage?.cache_read_input_tokens ?? 0);
  acc.salida += usage?.output_tokens ?? 0;
  acc.llamadas += 1;
  return acc;
}

/** Una llamada: devuelve { datos | errorParseo, modelo, usage }. */
async function llamar(cliente, { sistema, usuario, esquema, effort, maxTokens }) {
  const res = await cliente.beta.messages.create({
    model: MODELO,
    max_tokens: maxTokens,
    betas: BETAS,
    fallbacks: 'default',
    thinking: { type: 'adaptive' },
    output_config: { effort, format: { type: 'json_schema', schema: esquema } },
    system: sistema,
    messages: [{ role: 'user', content: usuario }],
  });
  if (res.stop_reason === 'refusal') {
    const cat = res.stop_details?.category ?? 'sin categoría';
    throw new ErrorGeneracion(`El modelo se negó a responder (${cat})`, { uso: sumarUso(usoVacio(), res.usage) });
  }
  if (res.stop_reason === 'max_tokens') {
    return { errorParseo: 'La respuesta se cortó por max_tokens', modelo: res.model, usage: res.usage };
  }
  const texto = (res.content ?? []).filter((b) => b.type === 'text').map((b) => b.text).join('');
  try {
    return { datos: JSON.parse(texto), texto, modelo: res.model, usage: res.usage };
  } catch {
    return { errorParseo: 'La respuesta no es JSON válido', texto, modelo: res.model, usage: res.usage };
  }
}

/**
 * Genera y valida con un reintento: si la primera respuesta falla, se vuelve a pedir
 * incluyendo la respuesta anterior y la lista de errores.
 */
async function generarValidado(cliente, { sistema, usuario, esquema, validar, effort = 'high', maxTokens = 16000, log = () => {} }) {
  const uso = usoVacio();
  let intentoPrevio = null;
  for (let intento = 1; intento <= 2; intento++) {
    const mensaje = intentoPrevio
      ? `${usuario}\n\nTu respuesta anterior no pasó la validación.\n<respuesta_anterior>\n${intentoPrevio.texto ?? '(vacía)'}\n</respuesta_anterior>\n<errores>\n${intentoPrevio.errores.map((x) => `- ${x}`).join('\n')}\n</errores>\nCorrige todos los errores y devuelve el JSON completo.`
      : usuario;
    const r = await llamar(cliente, { sistema, usuario: mensaje, esquema, effort, maxTokens });
    sumarUso(uso, r.usage);
    const errores = r.errorParseo ? [r.errorParseo] : validar(r.datos);
    if (!errores.length) return { datos: r.datos, uso, intentos: intento, modelo: r.modelo };
    log(`    intento ${intento} inválido: ${errores.slice(0, 3).join(' | ')}${errores.length > 3 ? ` (+${errores.length - 3})` : ''}`);
    intentoPrevio = { texto: r.texto, errores };
  }
  throw new ErrorGeneracion('El contenido no pasó la validación tras el reintento', { errores: intentoPrevio.errores, uso });
}

/** Genera título, resumen, conceptos y preguntas de una clase. */
export async function generarClase(cliente, { curso, clase, totalClases, transcripcion, duracionSeg, effort, log }) {
  const segmentos = transcripcion.segmentos ?? [];
  if (!segmentos.length) throw new ErrorGeneracion(`La transcripción de la clase ${clase.n} está vacía`);
  const r = await generarValidado(cliente, {
    sistema: SISTEMA_CLASE,
    usuario: promptClase({ curso, clase, totalClases, duracionSeg, segmentos }),
    esquema: ESQUEMA_CLASE,
    validar: (d) => validarClase(d, { duracionSeg, segmentos }),
    effort,
    log,
  });
  const d = r.datos;
  return {
    contenido: {
      n: clase.n,
      videoId: clase.videoId,
      titulo: d.titulo.trim(),
      resumen: d.resumen.trim(),
      conceptos: d.conceptos.map((k) => ({ t: k.t.trim(), texto: k.texto.trim() })),
      preguntas: d.preguntas.map(limpiarPregunta),
    },
    uso: r.uso,
    intentos: r.intentos,
    modelo: r.modelo,
  };
}

function limpiarPregunta(p) {
  const base = { tipo: p.tipo, q: p.q.trim(), instruccion: p.instruccion.trim(), referenciaVideo: p.referenciaVideo.trim(), casoClinico: p.casoClinico.trim(), competencia: p.competencia.trim(), nivelCognitivo: p.nivelCognitivo, explicacion: p.explicacion.trim() };
  if (p.tipo === 'seleccion') return { ...base, opciones: p.opciones.map((o) => o.trim()), correcta: p.correcta };
  if (p.tipo === 'seleccion_multiple') return { ...base, opciones: p.opciones.map((o) => o.trim()), correctas: p.correctas };
  if (p.tipo === 'ordenar') return { ...base, elementos: p.elementos.map((x) => ({ id: x.id.trim(), texto: x.texto.trim() })), ordenCorrecto: p.ordenCorrecto.map((x) => x.trim()) };
  if (p.tipo === 'relacionar') return { ...base, izquierda: p.izquierda.map((x) => ({ id: x.id.trim(), texto: x.texto.trim() })), derecha: p.derecha.map((x) => ({ id: x.id.trim(), texto: x.texto.trim() })), pares: Object.fromEntries(Object.entries(p.pares).map(([k, v]) => [k.trim(), String(v).trim()])) };
  return { ...base, plantilla: p.plantilla.trim(), huecos: p.huecos.map((h) => ({ id: h.id.trim(), etiqueta: h.etiqueta.trim(), respuestas: h.respuestas.map((r) => r.trim()) })) };
}

/** Genera descripción, "aprenderás" y nivel de un curso a partir de los resúmenes de sus clases. */
export async function generarCurso(cliente, { curso, clases, effort, log }) {
  const r = await generarValidado(cliente, {
    sistema: SISTEMA_CURSO,
    usuario: promptCurso({ curso, clases }),
    esquema: ESQUEMA_CURSO,
    validar: validarCurso,
    effort,
    maxTokens: 8000,
    log,
  });
  return {
    contenido: { descripcion: r.datos.descripcion.trim(), aprenderas: r.datos.aprenderas.map((a) => a.trim()), nivel: r.datos.nivel },
    uso: r.uso,
    intentos: r.intentos,
    modelo: r.modelo,
  };
}

// ───────────────────────── Estimación de costo ─────────────────────────

/** Aproximación conservadora para español con el tokenizador actual (~3 caracteres por token). */
export const tokensAprox = (texto) => Math.ceil(String(texto ?? '').length / 3);

// Salida estimada por llamada, incluyendo razonamiento adaptativo (no se ve, pero se cobra).
export const SALIDA_ESTIMADA = { clase: 5000, curso: 2500 };

/**
 * Estima tokens y costo de generar un curso. `clasesPendientes` trae las transcripciones.
 * Se asume un 30 % de reintentos de validación.
 */
export function estimarCostoCurso({ curso, clasesPendientes, generarCursoTambien = true }) {
  const factorReintento = 1.3;
  let entrada = 0;
  let salida = 0;
  for (const c of clasesPendientes) {
    const prompt = promptClase({ curso, clase: c.clase, totalClases: curso.clases.length, duracionSeg: c.duracionSeg, segmentos: c.transcripcion.segmentos ?? [] });
    entrada += (tokensAprox(SISTEMA_CLASE) + tokensAprox(prompt)) * factorReintento;
    salida += SALIDA_ESTIMADA.clase * factorReintento;
  }
  if (generarCursoTambien) {
    entrada += tokensAprox(SISTEMA_CURSO) + curso.clases.length * 150 + 200;
    salida += SALIDA_ESTIMADA.curso;
  }
  return { entrada: Math.round(entrada), salida: Math.round(salida), usd: costoUsd({ entrada, salida }) };
}

export function costoUsd({ entrada, salida }) {
  return (entrada / 1e6) * PRECIO_USD_POR_MTOK.entrada + (salida / 1e6) * PRECIO_USD_POR_MTOK.salida;
}
