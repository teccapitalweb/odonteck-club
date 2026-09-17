// Reglas de acceso del club. Funciones puras: no tocan Firestore.
import { aMillis } from './fechas.js';

/** Fecha de expiración de la membresía vieja (`expiraEn` o `fechaFinAcceso`). */
export function expiracionMiembro(miembro) {
  if (!miembro) return null;
  const valor = miembro.expiraEn ?? miembro.fechaFinAcceso;
  return aMillis(valor);
}

/** true si la membresía del club viejo (`miembros/{uid}`) da acceso ahora. */
export function membresiaVigente(miembro, ahora) {
  if (!miembro) return false;
  const activa = miembro.activa === true || miembro.activo === true;
  if (!activa) return false;
  const exp = expiracionMiembro(miembro);
  if (exp === null) return true;
  // Un vencimiento ilegible se trata como vencido: falla cerrado.
  if (Number.isNaN(exp)) return false;
  return exp > ahora.getTime();
}

/** true si la cortesía nueva (`v2_cortesias/{uid}`) sigue vigente. */
export function cortesiaVigente(cortesia, ahora) {
  if (!cortesia) return false;
  const hasta = aMillis(cortesia.hasta);
  return hasta !== null && !Number.isNaN(hasta) && hasta > ahora.getTime();
}

/**
 * Regla VIP del contrato:
 * (activa || activo) && (!exp || exp > ahora), o cortesía vigente, o claim admin.
 * @param {object|null} miembro  datos de miembros/{uid}
 * @param {Date} ahora
 * @param {{ cortesia?: object|null, esAdmin?: boolean }} extras
 */
export function esVip(miembro, ahora = new Date(), { cortesia = null, esAdmin = false, suscripcion = null } = {}) {
  if (esAdmin === true) return true;
  if (membresiaVigente(miembro, ahora)) return true;
  if (suscripcionVigente(suscripcion, ahora)) return true;
  return cortesiaVigente(cortesia, ahora);
}

/**
 * true si la suscripción del checkout nuevo (`v2_suscripciones/{uid}`, escrita por el webhook) da acceso.
 * Activa o en prueba mientras no pase el fin del periodo; con pago fallido (`past_due`) se respeta
 * el periodo ya pagado. Si cancela al final del periodo, conserva acceso hasta esa fecha.
 */
export function suscripcionVigente(sus, ahora) {
  if (!sus || !['active', 'trialing', 'past_due'].includes(sus.estado)) return false;
  const fin = aMillis(sus.periodoFin);
  if (fin === null) return sus.estado !== 'past_due';
  if (Number.isNaN(fin)) return false;
  return fin > ahora.getTime();
}

/** Números de clase ordenados de un curso. */
export function numerosDeClase(curso) {
  return (Array.isArray(curso?.clases) ? curso.clases : [])
    .map((c) => Number(c.n))
    .filter((n) => Number.isInteger(n) && n > 0)
    .sort((a, b) => a - b);
}

/**
 * Desbloqueo secuencial: la primera clase siempre está abierta; cualquier otra
 * requiere haber marcado como vista la clase anterior del curso.
 * "Anterior" es la clase previa en el orden de `n`, por si hay huecos en la numeración.
 */
export function claseDesbloqueada(curso, n, vistas = []) {
  const numeros = numerosDeClase(curso);
  const i = numeros.indexOf(Number(n));
  if (i < 0) return false;
  if (i === 0) return true;
  return vistas.map(Number).includes(numeros[i - 1]);
}

/** Acceso por membresía: VIP o clase marcada como gratis. */
export function tieneAccesoAClase(clase, vip) {
  return vip === true || clase?.gratis === true;
}

/** true cuando todas las clases del curso están en `vistas`. */
export function cursoCompleto(curso, vistas = []) {
  const numeros = numerosDeClase(curso);
  if (!numeros.length) return false;
  const set = new Set(vistas.map(Number));
  return numeros.every((n) => set.has(n));
}
