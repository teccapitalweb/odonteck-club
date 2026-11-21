// Métricas del panel admin. Funciones PURAS: reciben mapas/arreglos ya leídos y no
// tocan Firestore ni Stripe. Las rutas (admin.js) leen las colecciones, cachean el
// resultado en v2_contadores y llaman a estas funciones.
import { aMillis, DIA_MS } from './fechas.js';
import { membresiaVigente, suscripcionVigente } from './acceso.js';

const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const mesDe = (iso) => { const ms = aMillis(iso); return ms === null || Number.isNaN(ms) ? null : new Date(ms).toISOString().slice(0, 7); };

/** Mapa uid -> ms de última actividad (máximo de `historial` del progreso). Fuente ÚNICA para Resumen y Miembros. */
export function mapaUltimaActividad(progresoDocs) {
  const mapa = new Map();
  for (const p of progresoDocs) {
    if (!p?.uid) continue;
    const ms = Math.max(0, ...((Array.isArray(p.historial) ? p.historial : []).map((f) => aMillis(f) ?? 0)));
    if (ms > (mapa.get(p.uid) ?? 0)) mapa.set(p.uid, ms);
  }
  return mapa;
}

/** Neto mensual en MXN de una suscripción. Usa el dato real capturado; si falta, estima con config. */
export function netoMensualMXN(sub, config) {
  if (Number.isFinite(sub?.importeMensualNetoCents)) return { mxn: sub.importeMensualNetoCents / 100, estimado: false };
  const precios = config?.precios ?? {};
  const base = sub?.plan === 'anual' ? num(precios.anual) / 12 : num(precios.mensual);
  return { mxn: base, estimado: true };
}

/** MRR real (sólo active, sin bloqueo), MRR potencial (trialing) y en riesgo (past_due/unpaid). */
export function calcularMRR(suscripciones, config) {
  let mrr = 0, mrrPotencial = 0, riesgoMonto = 0, estimado = false, otraMoneda = 0;
  const enRiesgo = [];
  let activos = 0, trialing = 0;
  for (const [uid, s] of suscripciones) {
    if (!s || s.accesoBloqueado === true) continue;
    // El catálogo es MXN (landing valida currency==='mxn'). Una suscripción con moneda
    // capturada distinta de mxn no se suma al MRR en MXN; se cuenta aparte para no inflarlo.
    if (s.moneda && String(s.moneda).toLowerCase() !== 'mxn') {
      if (['active', 'trialing', 'past_due'].includes(s.estado)) otraMoneda++;
      continue;
    }
    const { mxn, estimado: est } = netoMensualMXN(s, config);
    if (s.estado === 'active') { mrr += mxn; activos++; estimado = estimado || est; }
    else if (s.estado === 'trialing') { mrrPotencial += mxn; trialing++; }
    else if (s.estado === 'past_due' || s.estado === 'unpaid') { riesgoMonto += mxn; enRiesgo.push({ uid, plan: s.estado }); }
  }
  return {
    mrr: Math.round(mrr), estimado, moneda: 'MXN', activos, otraMoneda,
    mrrPotencial: Math.round(mrrPotencial), trialing,
    enRiesgo: { cuentas: enRiesgo.length, monto: Math.round(riesgoMonto), lista: enRiesgo.slice(0, 50) },
  };
}

const ESTADOS_PERDIDOS = ['canceled', 'incomplete_expired'];

/**
 * true si la suscripción YA perdió el acceso por cancelación. Stripe pone
 * `canceled_at` cuando se SOLICITA la cancelación (incluso con cancel_at_period_end,
 * mientras sigue activa), así que NO sirve para contar bajas. La baja es por fin
 * efectivo: estado canceled/incomplete_expired, o cancelación al final con el periodo ya vencido.
 */
export function esBaja(sub, ahora) {
  if (!sub) return false;
  if (ESTADOS_PERDIDOS.includes(sub.estado)) return true;
  if (sub.cancelaAlFinal === true) {
    const fin = aMillis(sub.periodoFin);
    return fin !== null && !Number.isNaN(fin) && fin <= ahora.getTime();
  }
  return false;
}

/** Fecha efectiva de la baja: fin de periodo si canceló al final; si no, canceladaEn. */
export function fechaBajaEfectiva(sub) {
  if (sub?.cancelaAlFinal === true && sub.periodoFin) return sub.periodoFin;
  return sub?.canceladaEn ?? sub?.periodoFin ?? null;
}

/** Tasa de bajas real por FIN EFECTIVO de la cancelación en la ventana (30 días por defecto). */
export function tasaBajas(suscripciones, ahora, ventanaDias = 30) {
  const desde = ahora.getTime() - ventanaDias * DIA_MS;
  let bajas = 0, activos = 0;
  for (const [, s] of suscripciones) {
    if (!s) continue;
    if (['active', 'trialing', 'past_due'].includes(s.estado) && s.accesoBloqueado !== true) activos++;
    if (esBaja(s, ahora)) {
      const fin = aMillis(fechaBajaEfectiva(s));
      if (fin !== null && !Number.isNaN(fin) && fin >= desde && fin <= ahora.getTime()) bajas++;
    }
  }
  const base = activos + bajas;
  return { bajas, activos, ventanaDias, tasa: base > 0 ? bajas / base : 0 };
}

/** Bajas programadas: cancelaAlFinal, aún con acceso; agrupadas por fecha de fin. */
export function bajasProgramadas(suscripciones) {
  const lista = [];
  for (const [uid, s] of suscripciones) {
    if (s?.cancelaAlFinal === true && ['active', 'trialing'].includes(s.estado) && s.accesoBloqueado !== true) {
      lista.push({ uid, periodoFin: s.periodoFin ?? null, plan: s.plan ?? null });
    }
  }
  lista.sort((a, b) => String(a.periodoFin ?? '').localeCompare(String(b.periodoFin ?? '')));
  return { cuentas: lista.length, lista: lista.slice(0, 50) };
}

/** VIP pagado ahora (suscripción vigente o membresía heredada vigente; NO cortesía). */
export function esVipPagado(sub, miembro, ahora) {
  return suscripcionVigente(sub, ahora) || membresiaVigente(miembro, ahora);
}

/** Conversión curso gratis -> VIP pagado. */
export function conversionCursoGratis(cursoGratis, suscripciones, miembros, ahora) {
  let base = 0, convertidos = 0;
  for (const [uid, cg] of cursoGratis) {
    if (!cg?.cursoId) continue; // sólo quienes eligieron un curso
    base++;
    if (esVipPagado(suscripciones.get(uid) ?? null, miembros.get(uid) ?? null, ahora)) convertidos++;
  }
  return { base, convertidos, tasa: base > 0 ? convertidos / base : 0 };
}

/** Altas (altaVip = sub.created) y bajas (por fin efectivo) v2 en la ventana. */
export function altasBajasV2(suscripciones, ahora, ventanaDias = 30) {
  const desde = ahora.getTime() - ventanaDias * DIA_MS;
  let altas = 0, bajas = 0;
  for (const [, s] of suscripciones) {
    const alta = aMillis(s?.altaVip);
    if (alta !== null && !Number.isNaN(alta) && alta >= desde) altas++;
    if (esBaja(s, ahora)) {
      const fin = aMillis(fechaBajaEfectiva(s));
      if (fin !== null && !Number.isNaN(fin) && fin >= desde && fin <= ahora.getTime()) bajas++;
    }
  }
  return { altas, bajas, ventanaDias };
}

/** Retención por cohorte de alta VIP (snapshot: % de cada cohorte con acceso hoy). */
export function retencionPorCohorte(suscripciones, miembros, ahora) {
  const cohortes = new Map();
  for (const [uid, s] of suscripciones) {
    const mes = mesDe(s?.altaVip);
    if (!mes) continue;
    const c = cohortes.get(mes) ?? { cohorte: mes, base: 0, retenidos: 0 };
    c.base++;
    if (esVipPagado(s, miembros.get(uid) ?? null, ahora)) c.retenidos++;
    cohortes.set(mes, c);
  }
  return [...cohortes.values()]
    .map((c) => ({ ...c, tasa: c.base > 0 ? c.retenidos / c.base : 0 }))
    .sort((a, b) => a.cohorte.localeCompare(b.cohorte));
}

/** Finalización y abandono por clase, por curso. */
export function finalizacionPorClase(progresoDocs, cursos) {
  const vistasPorCurso = new Map(); // cursoId -> Map(n -> cuenta)
  for (const p of progresoDocs) {
    if (!p?.cursoId) continue;
    const m = vistasPorCurso.get(p.cursoId) ?? new Map();
    for (const n of new Set((Array.isArray(p.vistas) ? p.vistas : []).map(Number))) {
      if (Number.isInteger(n)) m.set(n, (m.get(n) ?? 0) + 1);
    }
    vistasPorCurso.set(p.cursoId, m);
  }
  const salida = [];
  for (const [cursoId, curso] of cursos) {
    const numeros = (Array.isArray(curso?.clases) ? curso.clases : []).map((c) => Number(c.n)).filter(Number.isInteger).sort((a, b) => a - b);
    if (!numeros.length) continue;
    const m = vistasPorCurso.get(cursoId) ?? new Map();
    const base = m.get(numeros[0]) ?? 0;
    // Acota a [0,1]: datos inconsistentes (ver una clase posterior sin la primera)
    // podrían dar finalización >100% o abandono negativo.
    const acotar = (x) => (x === null ? null : Math.max(0, Math.min(1, x)));
    const clases = numeros.map((n, i) => {
      const vieron = m.get(n) ?? 0;
      const sig = i + 1 < numeros.length ? (m.get(numeros[i + 1]) ?? 0) : null;
      return { n, vieron, finalizacion: acotar(base > 0 ? vieron / base : 0), abandono: acotar(sig === null || vieron === 0 ? null : 1 - sig / vieron) };
    });
    salida.push({ cursoId, titulo: curso?.titulo ?? cursoId, base, clases });
  }
  return salida.sort((a, b) => b.base - a.base);
}

/** Aprobación de quizzes, global y por clase (usa v2_intentos). */
export function aprobacionQuizzes(intentos, cursos) {
  let totalIntentos = 0, aprobados = 0;
  const porClave = new Map();
  for (const it of intentos) {
    totalIntentos++;
    const ok = it?.aprobadoAlgunaVez === true || it?.aprobado === true;
    if (ok) aprobados++;
    const clave = `${it?.cursoId}_${it?.n}`;
    const c = porClave.get(clave) ?? { cursoId: it?.cursoId, n: it?.n, intentos: 0, aprobados: 0 };
    c.intentos++; if (ok) c.aprobados++;
    porClave.set(clave, c);
  }
  const porClase = [...porClave.values()].map((c) => ({
    ...c, titulo: cursos.get(c.cursoId)?.titulo ?? c.cursoId,
    tasa: c.intentos > 0 ? c.aprobados / c.intentos : 0,
  })).sort((a, b) => a.tasa - b.tasa);
  return { global: { intentos: totalIntentos, aprobados, tasa: totalIntentos > 0 ? aprobados / totalIntentos : 0 }, porClase };
}

/** Economía de OdonCoins: emitidos, gastados, saldo pendiente y recompensas más canjeadas. */
export function economiaOdonCoins(recompensasEstado, recompensasCanjes) {
  let emitidos = 0, gastados = 0, saldoPendiente = 0;
  for (const e of recompensasEstado) {
    emitidos += Math.max(0, num(e?.ganados));
    gastados += Math.max(0, num(e?.gastados));
    saldoPendiente += Math.max(0, num(e?.saldo));
  }
  const porRecompensa = new Map();
  for (const c of recompensasCanjes) {
    if (c?.estatus === 'cancelado') continue;
    const k = c?.recompensaId ?? '(desconocida)';
    const r = porRecompensa.get(k) ?? { recompensaId: k, titulo: c?.titulo ?? k, canjes: 0 };
    r.canjes++; porRecompensa.set(k, r);
  }
  const masCanjeadas = [...porRecompensa.values()].sort((a, b) => b.canjes - a.canjes).slice(0, 10);
  return { emitidos, gastados, saldoPendiente, masCanjeadas };
}

/** Efecto de los cupones de la APP (días de cortesía) en conversión a VIP pagado. */
export function efectoCuponesApp(cuponesCanjes, suscripciones, miembros, ahora) {
  const porCodigo = new Map();
  for (const c of cuponesCanjes) {
    if (!c?.codigo || !c?.uid) continue;
    const e = porCodigo.get(c.codigo) ?? { codigo: c.codigo, redenciones: 0, convertidos: 0 };
    e.redenciones++;
    if (esVipPagado(suscripciones.get(c.uid) ?? null, miembros.get(c.uid) ?? null, ahora)) e.convertidos++;
    porCodigo.set(c.codigo, e);
  }
  return [...porCodigo.values()]
    .map((e) => ({ ...e, tasa: e.redenciones > 0 ? e.convertidos / e.redenciones : 0 }))
    .sort((a, b) => b.redenciones - a.redenciones);
}

/** Efecto de los PROMOTION CODES de Stripe sobre las suscripciones y el MRR. */
export function efectoPromosStripe(suscripciones) {
  const porCodigo = new Map();
  for (const [, s] of suscripciones) {
    if (!s?.promotionCode) continue;
    const e = porCodigo.get(s.promotionCode) ?? { promotionCode: s.promotionCode, suscripciones: 0, activas: 0, descuentoMensualMXN: 0, netoMensualMXN: 0 };
    e.suscripciones++;
    if (s.estado === 'active' && s.accesoBloqueado !== true) {
      e.activas++;
      e.descuentoMensualMXN += num(s.descuentoMensualCents) / 100;
      e.netoMensualMXN += num(s.importeMensualNetoCents) / 100;
    }
    porCodigo.set(s.promotionCode, e);
  }
  return [...porCodigo.values()]
    .map((e) => ({ ...e, descuentoMensualMXN: Math.round(e.descuentoMensualMXN), netoMensualMXN: Math.round(e.netoMensualMXN) }))
    .sort((a, b) => b.suscripciones - a.suscripciones);
}

/** Canjes manuales pendientes con más de `dias` días (alerta en el Resumen). */
export function canjesPendientesViejos(recompensasCanjes, ahora, dias = 3) {
  const limite = ahora.getTime() - dias * DIA_MS;
  const lista = recompensasCanjes
    .filter((c) => c?.estatus === 'pendiente' && c?.tipo === 'manual' && (aMillis(c.solicitado) ?? ahora.getTime()) <= limite)
    .map((c) => ({ id: c.id ?? null, uid: c.uid ?? null, recompensaId: c.recompensaId ?? null, titulo: c.titulo ?? c.recompensaId, solicitado: c.solicitado ?? null }))
    .sort((a, b) => String(a.solicitado ?? '').localeCompare(String(b.solicitado ?? '')));
  return { cuentas: lista.length, dias, lista: lista.slice(0, 50) };
}
