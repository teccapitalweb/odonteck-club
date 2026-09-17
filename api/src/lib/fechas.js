// Utilidades de fechas. Firestore puede traer Timestamp (con toMillis/toDate),
// objetos serializados { seconds } o { _seconds }, Date, números en ms o cadenas ISO.

const SOLO_FECHA = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Convierte cualquier representación de fecha a milisegundos.
 * Devuelve `null` si el valor está vacío y `NaN` si existe pero no se puede interpretar
 * (así quien llama puede fallar cerrado ante un dato corrupto).
 */
export function aMillis(valor) {
  if (valor === undefined || valor === null || valor === '') return null;
  if (valor instanceof Date) return valor.getTime();
  if (typeof valor === 'number') return Number.isFinite(valor) ? valor : NaN;
  if (typeof valor === 'object') {
    if (typeof valor.toMillis === 'function') return valor.toMillis();
    if (typeof valor.toDate === 'function') return valor.toDate().getTime();
    const seg = valor.seconds ?? valor._seconds;
    if (typeof seg === 'number') return seg * 1000 + Math.floor((valor.nanoseconds ?? valor._nanoseconds ?? 0) / 1e6);
    return NaN;
  }
  if (typeof valor === 'string') {
    const texto = valor.trim();
    // Una fecha sin hora ("2026-10-01") se interpreta como el final de ese día en
    // hora del centro de México: quien escribió "vence el 1 de octubre" espera
    // tener acceso durante todo el 1 de octubre.
    const ms = SOLO_FECHA.test(texto) ? Date.parse(`${texto}T23:59:59-06:00`) : Date.parse(texto);
    return Number.isFinite(ms) ? ms : NaN;
  }
  return NaN;
}

/** ISO 8601 o null. */
export function aISO(valor) {
  const ms = aMillis(valor);
  return ms === null || Number.isNaN(ms) ? null : new Date(ms).toISOString();
}

export const DIA_MS = 24 * 60 * 60 * 1000;
