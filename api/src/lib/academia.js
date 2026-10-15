// Academia OdonTeck: carga del contenido versionado (api/content/academia) y reglas puras
// compartidas por las rutas de miembro y de administración.
// - Un JSON por módulo: <programa>/modulo-NN.json, más catalogo.json.
// - Las carpetas que empiezan con "_" (muestras, borradores locales) se ignoran siempre.
// - El estado efectivo de un módulo lo decide la revisión administrativa guardada en
//   v2_academia_revisiones/{programa}_{n}; si no existe, cuenta el "estado" del JSON.
import { existsSync, readFileSync } from 'node:fs';

export const CONTENIDO_ACADEMIA = new URL('../../content/academia/', import.meta.url);
export const ESTADOS_ACADEMIA = Object.freeze(['borrador', 'revision', 'aprobado']);
export const APROBATORIO_ACADEMIA = 0.7;
// Tras reprobar se espera antes de recibir otro examen: así no se puede extraer el banco de
// respuestas a fuerza de intentos seguidos (cada calificación muestra las correctas).
export const ESPERA_REINTENTO_MS = 3 * 60 * 1000;

const ID_PROGRAMA = /^[a-z0-9][a-z0-9-]{0,79}$/;
export const programaValido = (id) => typeof id === 'string' && ID_PROGRAMA.test(id);
export const nn = (n) => String(n).padStart(2, '0');
export const idRevision = (programa, n) => `${programa}_${n}`;

/** Cargador por defecto: lee del disco y conserva en memoria lo ya leído (los faltantes se reintentan). */
export function cargadorAcademiaDisco(base = CONTENIDO_ACADEMIA) {
  const cache = new Map();
  const leer = (ruta) => {
    if (cache.has(ruta)) return cache.get(ruta);
    const url = new URL(ruta, base);
    if (!existsSync(url)) return null;
    const valor = JSON.parse(readFileSync(url, 'utf8'));
    cache.set(ruta, valor);
    return valor;
  };
  return {
    catalogo() {
      const c = leer('catalogo.json');
      const programas = Array.isArray(c?.programas) ? c.programas.filter((p) => programaValido(p?.id)) : [];
      return { ...(c ?? {}), programas };
    },
    modulo(programa, n) {
      if (!programaValido(programa) || !Number.isInteger(n) || n < 1 || n > 99) return null;
      return leer(`${programa}/modulo-${nn(n)}.json`);
    },
  };
}

/** Estado que manda: la revisión del admin tiene prioridad sobre el estado escrito en el JSON. */
export function estadoEfectivo(modulo, revision) {
  if (!modulo) return null;
  if (revision && ESTADOS_ACADEMIA.includes(revision.estado)) return revision.estado;
  return ESTADOS_ACADEMIA.includes(modulo.estado) ? modulo.estado : 'borrador';
}

export const moduloVisible = (modulo, estado, { esAdmin = false, borradores = false } = {}) =>
  !!modulo && (estado === 'aprobado' || esAdmin === true || borradores === true);

/** Quita del módulo todo lo que permitiría responder el examen sin estudiar. */
export function moduloPublico(m, estado = m?.estado) {
  const { examen, ...resto } = m;
  return {
    ...resto,
    estado,
    examen: { aprobar: examen?.aprobar ?? 70, mostrar: examen?.mostrar ?? 10, total: Array.isArray(examen?.preguntas) ? examen.preguntas.length : 0 },
  };
}

export function barajar(lista, azar = Math.random) {
  const b = [...lista];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

const palabras = (s) => String(s ?? '').trim().split(/\s+/).filter(Boolean).length;

/** Métricas editoriales de un módulo para el panel de revisión. */
export function metricasModulo(m) {
  let total = 0;
  let figuras = m?.portada ? 1 : 0;
  let actividades = 0;
  for (const t of Array.isArray(m?.temas) ? m.temas : []) {
    for (const b of Array.isArray(t?.bloques) ? t.bloques : []) {
      if (b?.tipo === 'texto') total += palabras(b.md);
      else if (b?.tipo === 'recuadro') total += palabras(b.md);
      else if (b?.tipo === 'lista') total += palabras((b.items ?? []).join(' '));
      else if (b?.tipo === 'pasos') total += palabras((b.pasos ?? []).map((p) => `${p?.titulo ?? ''} ${p?.md ?? ''}`).join(' '));
      else if (b?.tipo === 'tabla') total += palabras((b.filas ?? []).flat().join(' '));
      else if (b?.tipo === 'figura') figuras++;
      else if (b?.tipo === 'actividad') actividades++;
    }
  }
  return {
    palabras: total,
    figuras,
    actividades,
    temas: Array.isArray(m?.temas) ? m.temas.length : 0,
    preguntas: Array.isArray(m?.examen?.preguntas) ? m.examen.preguntas.length : 0,
  };
}
