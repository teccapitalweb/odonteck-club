// Validación y saneamiento de entradas. Todas lanzan HttpError 400 con mensaje en español.
import { invalido } from './errores.js';
import { aMillis } from './fechas.js';

// Cualquier cosa con forma de etiqueta: <b>, </div>, <!-- -->, <?xml, <img ...>.
// "a < b" o "3<5" sí se permiten.
const PARECE_HTML = /<\s*[a-zA-Z!/?]/;
// Caracteres de control (se conservan \t y \n en textos multilínea).
const CONTROL = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;
const CONTROL_Y_SALTOS = /[\x00-\x1F\x7F]/g;

export const LIMITES = {
  tituloHilo: 140,
  textoHilo: 5000,
  textoRespuesta: 3000,
  nombre: 80,
  corto: 120,
  medio: 300,
  largo: 5000,
};

export function esObjeto(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

export function cuerpo(req) {
  return esObjeto(req.body) ? req.body : {};
}

/**
 * Texto plano sin HTML.
 * @param {unknown} valor
 * @param {{ campo: string, min?: number, max: number, requerido?: boolean, multilinea?: boolean }} opts
 * @returns {string|undefined}
 */
export function texto(valor, { campo, min = 0, max, requerido = false, multilinea = false }) {
  if (valor === undefined || valor === null) {
    if (requerido) throw invalido(`El campo "${campo}" es obligatorio.`);
    return valor === undefined ? undefined : '';
  }
  if (typeof valor !== 'string') throw invalido(`El campo "${campo}" debe ser texto.`);
  const limpio = multilinea
    ? valor.replace(/\r\n?/g, '\n').replace(CONTROL, '').trim()
    : valor.replace(CONTROL_Y_SALTOS, ' ').trim();
  if (limpio.length === 0) {
    if (requerido) throw invalido(`El campo "${campo}" es obligatorio.`);
    return '';
  }
  if (PARECE_HTML.test(limpio)) throw invalido(`El campo "${campo}" no puede contener HTML.`, 'html_no_permitido');
  if (limpio.length < min) throw invalido(`El campo "${campo}" debe tener al menos ${min} caracteres.`);
  if (limpio.length > max) throw invalido(`El campo "${campo}" admite como máximo ${max} caracteres.`, 'texto_muy_largo');
  return limpio;
}

export function textoRequerido(valor, opts) {
  return texto(valor, { ...opts, requerido: true });
}

export function entero(valor, { campo, min = -Infinity, max = Infinity, requerido = true }) {
  if (valor === undefined || valor === null || valor === '') {
    if (requerido) throw invalido(`El campo "${campo}" es obligatorio.`);
    return undefined;
  }
  const n = typeof valor === 'string' && /^-?\d+$/.test(valor.trim()) ? Number(valor) : valor;
  if (!Number.isInteger(n)) throw invalido(`El campo "${campo}" debe ser un número entero.`);
  if (n < min || n > max) throw invalido(`El campo "${campo}" debe estar entre ${min} y ${max}.`);
  return n;
}

export function numeroONulo(valor, { campo, min = 0, max = 100000 }) {
  if (valor === undefined) return undefined;
  if (valor === null || valor === '') return null;
  if (typeof valor !== 'number' || !Number.isFinite(valor)) throw invalido(`El campo "${campo}" debe ser un número o null.`);
  if (valor < min || valor > max) throw invalido(`El campo "${campo}" debe estar entre ${min} y ${max}.`);
  return valor;
}

export function booleano(valor, { campo, requerido = false }) {
  if (valor === undefined) {
    if (requerido) throw invalido(`El campo "${campo}" es obligatorio.`);
    return undefined;
  }
  if (typeof valor !== 'boolean') throw invalido(`El campo "${campo}" debe ser true o false.`);
  return valor;
}

export function unoDe(valor, opciones, { campo, requerido = false }) {
  if (valor === undefined) {
    if (requerido) throw invalido(`El campo "${campo}" es obligatorio.`);
    return undefined;
  }
  if (!opciones.includes(valor)) throw invalido(`El campo "${campo}" debe ser uno de: ${opciones.join(', ')}.`);
  return valor;
}

const SLUG = /^[a-z0-9](?:[a-z0-9-]{0,148}[a-z0-9])?$/;
export function slug(valor, { campo = 'id' } = {}) {
  if (typeof valor !== 'string' || !SLUG.test(valor)) {
    throw invalido(`El campo "${campo}" solo admite minúsculas, números y guiones (máx. 150).`);
  }
  return valor;
}

/** IDs que llegan por URL: evita rutas raras en Firestore ("/", "..", vacíos). */
const ID_DOC = /^[A-Za-z0-9_-]{1,200}$/;
export function idDocumento(valor, campo = 'id') {
  if (typeof valor !== 'string' || !ID_DOC.test(valor)) throw invalido(`El identificador "${campo}" no es válido.`);
  return valor;
}

export function url(valor, { campo, requerido = false }) {
  if (valor === undefined) {
    if (requerido) throw invalido(`El campo "${campo}" es obligatorio.`);
    return undefined;
  }
  if (valor === null || valor === '') return null;
  if (typeof valor !== 'string' || valor.length > 2000) throw invalido(`El campo "${campo}" debe ser una URL.`);
  // Rutas relativas del propio sitio (ej. /cursos/curso-01.webp) también valen.
  if (valor.startsWith('/') && !valor.startsWith('//')) return valor;
  let u;
  try {
    u = new URL(valor);
  } catch {
    throw invalido(`El campo "${campo}" debe ser una URL válida.`);
  }
  if (u.protocol !== 'https:') throw invalido(`El campo "${campo}" debe usar https.`);
  return u.toString();
}

export function fechaISO(valor, { campo, requerido = false }) {
  if (valor === undefined) {
    if (requerido) throw invalido(`El campo "${campo}" es obligatorio.`);
    return undefined;
  }
  const ms = typeof valor === 'string' ? aMillis(valor) : NaN;
  if (ms === null || Number.isNaN(ms)) throw invalido(`El campo "${campo}" debe ser una fecha ISO.`);
  return new Date(ms).toISOString();
}

export function listaDeTextos(valor, { campo, maxItems = 50, maxLargo = LIMITES.medio }) {
  if (valor === undefined) return undefined;
  if (!Array.isArray(valor) || valor.length > maxItems) throw invalido(`El campo "${campo}" debe ser una lista de hasta ${maxItems} textos.`);
  return valor.map((v, i) => textoRequerido(v, { campo: `${campo}[${i}]`, max: maxLargo }));
}

/** Copia solo las claves definidas (Firestore rechaza undefined). */
export function sinIndefinidos(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
}
