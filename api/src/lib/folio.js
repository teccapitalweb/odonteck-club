// Folios de certificado: ODT-AAAA-NNNNN (consecutivo por año).

export const FOLIO_REGEX = /^ODT-\d{4}-\d{5}$/;

export function formatearFolio(anio, consecutivo) {
  const a = Number(anio);
  const c = Number(consecutivo);
  if (!Number.isInteger(a) || a < 1000 || a > 9999) throw new Error('Año de folio inválido');
  if (!Number.isInteger(c) || c < 1 || c > 99999) throw new Error('Consecutivo de folio fuera de rango (1-99999)');
  return `ODT-${a}-${String(c).padStart(5, '0')}`;
}

export function folioValido(folio) {
  return typeof folio === 'string' && FOLIO_REGEX.test(folio);
}
