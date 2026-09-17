// Utilidades de tiempo compartidas: marcas 'mm:ss', timestamps de VTT y minutos.

/**
 * Convierte segundos a 'mm:ss'. Los minutos NO se limitan a 59
 * (una clase de 75 minutos da '75:10'), que es lo que usa el reproductor en notas.
 */
export function segundosAMmss(segundos) {
  if (!Number.isFinite(segundos) || segundos < 0) throw new Error(`segundos inválidos: ${segundos}`);
  const total = Math.floor(segundos);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * Convierte 'mm:ss' (o 'h:mm:ss') a segundos. Devuelve null si el formato no es válido.
 * Acepta minutos > 59 en la forma 'mm:ss'; los segundos siempre deben ser 00–59.
 */
export function mmssASegundos(marca) {
  if (typeof marca !== 'string') return null;
  const m = marca.trim().match(/^(?:(\d+):)?(\d{1,3}):(\d{2})$/);
  if (!m) return null;
  const [, h, min, seg] = m;
  if (Number(seg) > 59) return null;
  if (h !== undefined && Number(min) > 59) return null;
  return Number(h ?? 0) * 3600 + Number(min) * 60 + Number(seg);
}

/**
 * Timestamp de WebVTT → segundos (con milésimas).
 * Formatos válidos: 'hh:mm:ss.ttt' y 'mm:ss.ttt'. Se tolera ',' como separador decimal (estilo SRT).
 */
export function vttTimestampASegundos(ts) {
  const m = String(ts).trim().match(/^(?:(\d+):)?(\d{2}):(\d{2})[.,](\d{1,3})$/);
  if (!m) return null;
  const [, h, min, seg, ms] = m;
  if (Number(min) > 59 || Number(seg) > 59) return null;
  return Number(h ?? 0) * 3600 + Number(min) * 60 + Number(seg) + Number(ms.padEnd(3, '0')) / 1000;
}

/** Duración en segundos → minutos redondeados para `duracionMin` (mínimo 1 si hay video). */
export function segundosAMinutos(segundos) {
  if (!Number.isFinite(segundos) || segundos <= 0) return null;
  return Math.max(1, Math.round(segundos / 60));
}
