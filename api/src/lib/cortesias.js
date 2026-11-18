// Cortesías (v2_cortesias/{uid}): días de acceso gratis que pueden venir de dos
// orígenes independientes que comparten el mismo documento:
//   - `admin`:   otorgados a mano desde el panel (POST/DELETE /admin/.../cortesia)
//   - `cupones`: canjeados por el miembro con un código (POST /cupones/canjear)
//
// El acceso efectivo termina en la fecha MAYOR de ambos (`hasta`), que se conserva
// en el nivel superior por compatibilidad con `cortesiaVigente()` y el panel.
// Revocar la cortesía del admin NO borra los días de cupón, y canjear un cupón NO
// pisa la cortesía del admin.
import { aMillis, DIA_MS } from './fechas.js';

// Tope de días para una cortesía otorgada por el panel. Alineado con el máximo del
// formulario del front (src/admin/gestion.ts) para que ambos coincidan.
export const MAX_DIAS_CORTESIA = 730;

const parteValida = (p) => {
  if (!p || typeof p !== 'object') return null;
  const ms = aMillis(p.hasta);
  if (ms === null || Number.isNaN(ms)) return null;
  return {
    hasta: new Date(ms).toISOString(),
    motivo: typeof p.motivo === 'string' ? p.motivo : '',
    otorgadaPor: typeof p.otorgadaPor === 'string' ? p.otorgadaPor : '',
    fecha: typeof p.fecha === 'string' ? p.fecha : null,
  };
};

/**
 * Separa un documento de cortesía en sus dos orígenes.
 * Documentos nuevos ya traen `admin`/`cupones`. Documentos heredados (planos, un
 * solo `hasta`) se atribuyen por `otorgadaPor`: los que empiezan con "cupon:" son
 * de cupón; el resto se consideran del admin. Así, al migrar, revocar sigue
 * tocando sólo lo que claramente dio el admin.
 * @returns {{ admin: object|null, cupones: object|null }}
 */
export function partesCortesia(data) {
  if (!data || typeof data !== 'object') return { admin: null, cupones: null };
  if ('admin' in data || 'cupones' in data) {
    return { admin: parteValida(data.admin), cupones: parteValida(data.cupones) };
  }
  const plano = parteValida(data);
  if (!plano) return { admin: null, cupones: null };
  return String(data.otorgadaPor ?? '').startsWith('cupon:')
    ? { admin: null, cupones: plano }
    : { admin: plano, cupones: null };
}

/** Fecha ISO de fin de acceso efectivo (la mayor de ambos orígenes) o null. */
export function cortesiaEfectiva(partes) {
  const fechas = [partes.admin?.hasta, partes.cupones?.hasta]
    .map((v) => aMillis(v))
    .filter((ms) => ms !== null && !Number.isNaN(ms));
  if (!fechas.length) return null;
  return new Date(Math.max(...fechas)).toISOString();
}

/**
 * Arma el documento a guardar a partir de sus partes. Mantiene `hasta`/`motivo`/
 * `otorgadaPor`/`fecha` en el nivel superior (tomados del origen vigente de mayor
 * fecha) para que `cortesiaVigente()` y el panel sigan funcionando igual.
 */
export function docCortesia(partes, { uid, ahora }) {
  const admin = partes.admin ?? null;
  const cupones = partes.cupones ?? null;
  const hasta = cortesiaEfectiva({ admin, cupones });
  const dominante = !admin ? cupones : !cupones ? admin
    : (aMillis(admin.hasta) ?? 0) >= (aMillis(cupones.hasta) ?? 0) ? admin : cupones;
  return {
    uid,
    hasta,
    motivo: dominante?.motivo ?? '',
    otorgadaPor: dominante?.otorgadaPor ?? '',
    fecha: dominante?.fecha ?? null,
    admin,
    cupones,
    actualizado: ahora.toISOString(),
  };
}

/** Otorga/renueva la cortesía del admin: reemplaza SÓLO la parte del admin. */
export function aplicarCortesiaAdmin(partes, { dias, motivo, otorgadaPor, ahora }) {
  return {
    admin: {
      hasta: new Date(ahora.getTime() + dias * DIA_MS).toISOString(),
      motivo,
      otorgadaPor,
      fecha: ahora.toISOString(),
    },
    cupones: partes.cupones ?? null,
  };
}

/** Canjea un cupón: suma días SÓLO sobre la parte de cupones (se acumulan entre sí). */
export function aplicarCupon(partes, { dias, codigo, ahora }) {
  const previo = aMillis(partes.cupones?.hasta);
  const base = previo !== null && !Number.isNaN(previo) && previo > ahora.getTime() ? previo : ahora.getTime();
  return {
    admin: partes.admin ?? null,
    cupones: {
      hasta: new Date(base + dias * DIA_MS).toISOString(),
      motivo: `Cupón ${codigo}`,
      otorgadaPor: `cupon:${codigo}`,
      fecha: ahora.toISOString(),
    },
  };
}
