import { createHash } from 'node:crypto';
import { conflicto, noEncontrado } from './errores.js';

export const REGLAS_PUNTOS = Object.freeze({
  clase: 10,
  curso: 50,
  quiz: 20,
  retoCorrecto: 10,
  retoIntento: 2,
  encuestaBienvenida: 25,
  encuestaCurso: 20,
  encuestaExperiencia: 40,
  temaComunidad: 10,
  respuestaComunidad: 5,
  membresia: 300,
});

export const RECOMPENSAS = Object.freeze([
  {
    id: 'guia-diagnostico-ortodoncico',
    titulo: 'Guía de diagnóstico ortodóncico',
    descripcion: 'Desbloqueo permanente de una guía clínica propia de OdonTeck.',
    puntos: 250,
    tipo: 'material',
    materialId: 'guia-diagnostico-ortodoncico',
    icono: 'book-open',
  },
  {
    id: 'consentimiento-informado',
    titulo: 'Formato de consentimiento informado',
    descripcion: 'Desbloqueo permanente del formato clínico propio de OdonTeck.',
    puntos: 300,
    tipo: 'material',
    materialId: 'consentimiento-informado',
    icono: 'file-signature',
  },
  {
    id: 'tabla-dosis-anestesicas',
    titulo: 'Tabla de dosis anestésicas',
    descripcion: 'Referencia rápida de dosis máximas para la práctica clínica.',
    puntos: 350,
    tipo: 'material',
    materialId: 'tabla-dosis-anestesicas',
    icono: 'syringe',
  },
  {
    id: 'plantilla-nota-clinica-receta',
    titulo: 'Plantilla de nota clínica y receta',
    descripcion: 'Formato editable para documentar la consulta diaria.',
    puntos: 400,
    tipo: 'material',
    materialId: 'plantilla-nota-clinica-receta',
    icono: 'notebook-pen',
  },
  {
    id: 'protocolo-abscesos',
    titulo: 'Protocolo de manejo de abscesos',
    descripcion: 'Desbloqueo permanente del protocolo clínico de OdonTeck.',
    puntos: 450,
    tipo: 'material',
    materialId: 'protocolo-abscesos',
    icono: 'clipboard-plus',
  },
  {
    id: 'guia-materiales-restauradores',
    titulo: 'Guía de materiales restauradores',
    descripcion: 'Consulta rápida para seleccionar materiales por indicación.',
    puntos: 500,
    tipo: 'material',
    materialId: 'guia-materiales-restauradores',
    icono: 'layers-3',
  },
  {
    id: 'checklist-urgencias-pediatricas',
    titulo: 'Checklist de urgencias odontopediátricas',
    descripcion: 'Lista práctica para orientar la atención inicial de urgencias.',
    puntos: 500,
    tipo: 'material',
    materialId: 'checklist-urgencias-pediatricas',
    icono: 'list-checks',
  },
  {
    id: 'guia-instrumentacion-endodontica',
    titulo: 'Guía de instrumentación endodóntica',
    descripcion: 'Secuencia clínica propia para consulta permanente.',
    puntos: 550,
    tipo: 'material',
    materialId: 'guia-instrumentacion-endodontica',
    icono: 'route',
  },
  {
    id: 'manual-estratificacion-resinas',
    titulo: 'Manual de estratificación de resinas',
    descripcion: 'Desbloqueo permanente del manual clínico ilustrado de OdonTeck.',
    puntos: 600,
    tipo: 'material',
    materialId: 'manual-estratificacion-resinas',
    icono: 'library',
  },
  {
    id: 'praxia-30-dias',
    titulo: '30 días de Praxia Medical',
    descripcion: 'Solicitud de activación por 30 días. El equipo confirma el beneficio antes de iniciarlo.',
    puntos: 1500,
    tipo: 'manual',
    icono: 'stethoscope',
  },
]);

export const LOGROS_RECOMPENSA = Object.freeze([
  { id: 'primer-paso', titulo: 'Primer paso', descripcion: 'Completaste tu primera clase.', icono: 'footprints', contador: 'clases', meta: 1 },
  { id: 'en-marcha', titulo: 'En marcha', descripcion: 'Completaste 5 clases.', icono: 'play', contador: 'clases', meta: 5 },
  { id: 'certificado', titulo: 'Primer certificado', descripcion: 'Terminaste tu primer curso.', icono: 'award', contador: 'cursos', meta: 1 },
  { id: 'mente-clinica', titulo: 'Mente clínica', descripcion: 'Aprobaste 3 evaluaciones.', icono: 'brain', contador: 'quizzes', meta: 3 },
  { id: 'retador', titulo: 'Retador constante', descripcion: 'Ganaste 100 puntos practicando en Retos.', icono: 'gamepad-2', contador: 'puntosRetos', meta: 100 },
  { id: 'voz', titulo: 'Voz de la comunidad', descripcion: 'Publicaste tu primer tema.', icono: 'message-circle', contador: 'temas', meta: 1 },
  { id: 'especialista', titulo: 'Especialista', descripcion: 'Terminaste 3 cursos.', icono: 'badge-check', contador: 'cursos', meta: 3 },
  { id: 'maestro', titulo: 'Maestro OdonTeck', descripcion: 'Terminaste 10 cursos.', icono: 'crown', contador: 'cursos', meta: 10 },
  { id: 'miembro-club', titulo: 'Miembro del club', descripcion: 'Activaste una membresía pagada.', icono: 'gem', contador: 'membresias', meta: 1 },
]);

const numero = (valor) => Number.isFinite(Number(valor)) ? Number(valor) : 0;
const objeto = (valor) => valor && typeof valor === 'object' && !Array.isArray(valor) ? valor : {};
const idMovimiento = (uid, clave) => createHash('sha256').update(`${uid}:${clave}`).digest('hex').slice(0, 40);

export const estadoRecompensasVacio = (uid = '') => ({
  uid,
  saldo: 0,
  ganados: 0,
  gastados: 0,
  contadores: {},
  logros: {},
  desbloqueos: { materiales: [] },
  notificaciones: [],
  actualizado: null,
});

export function normalizarEstadoRecompensas(valor, uid = '') {
  const v = objeto(valor);
  const desbloqueos = objeto(v.desbloqueos);
  return {
    uid: uid || String(v.uid || ''),
    saldo: Math.max(0, numero(v.saldo)),
    ganados: Math.max(0, numero(v.ganados)),
    gastados: Math.max(0, numero(v.gastados)),
    contadores: Object.fromEntries(Object.entries(objeto(v.contadores)).map(([k, n]) => [k, Math.max(0, numero(n))])),
    logros: objeto(v.logros),
    desbloqueos: { materiales: Array.isArray(desbloqueos.materiales) ? [...new Set(desbloqueos.materiales.filter((x) => typeof x === 'string'))] : [] },
    notificaciones: Array.isArray(v.notificaciones) ? v.notificaciones.filter((n) => n && typeof n === 'object').slice(-30) : [],
    actualizado: typeof v.actualizado === 'string' ? v.actualizado : null,
  };
}

function evaluarLogros(estado, ahoraISO) {
  const nuevos = [];
  for (const logro of LOGROS_RECOMPENSA) {
    if (estado.logros[logro.id] || numero(estado.contadores[logro.contador]) < logro.meta) continue;
    estado.logros[logro.id] = { fecha: ahoraISO };
    nuevos.push(logro);
  }
  if (nuevos.length) {
    const notificaciones = nuevos.map((logro) => ({
      id: `logro-${logro.id}-${ahoraISO}`,
      tipo: 'logro',
      titulo: `Logro desbloqueado: ${logro.titulo}`,
      texto: logro.descripcion,
      enlace: '#/logros',
      fecha: ahoraISO,
      leida: false,
    }));
    estado.notificaciones = [...estado.notificaciones, ...notificaciones].slice(-30);
  }
  return nuevos;
}

/**
 * Registra eventos dentro de una transacción ya abierta. Todas las lecturas se
 * hacen antes de escribir para cumplir la regla de transacciones de Firestore.
 * Devuelve el resultado público y el estado completo que queda guardado.
 */
async function registrarEventosTx({ tx, db, colecciones, uid, eventos, ahora }) {
  const lista = eventos.filter((e) => e && typeof e.clave === 'string' && e.clave && Number.isFinite(Number(e.puntos)));
  const estadoRef = db.collection(colecciones.recompensasEstado).doc(uid);
  if (!lista.length) {
    const estadoSnap = await tx.get(estadoRef);
    const estado = normalizarEstadoRecompensas(estadoSnap.exists ? estadoSnap.data() : null, uid);
    return { estado, resultado: { puntosGanados: 0, saldo: estado.saldo, logrosNuevos: [], notificaciones: estado.notificaciones.filter((n) => n.leida !== true) } };
  }
  const movimientos = lista.map((evento) => ({ evento, ref: db.collection(colecciones.recompensasMovimientos).doc(idMovimiento(uid, evento.clave)) }));
  // Una sola lectura por lotes: dentro de una transacción, tx.get en paralelo se encola de todos modos.
  const [estadoSnap, ...movSnaps] = await tx.getAll(estadoRef, ...movimientos.map(({ ref }) => ref));
  const estado = normalizarEstadoRecompensas(estadoSnap.exists ? estadoSnap.data() : null, uid);
  const ahoraISO = ahora.toISOString();
  let puntosGanados = 0;
  movimientos.forEach(({ evento, ref }, i) => {
    if (movSnaps[i].exists) return;
    const puntos = Math.max(0, Math.round(Number(evento.puntos)));
    puntosGanados += puntos;
    estado.saldo += puntos;
    estado.ganados += puntos;
    if (evento.contador) {
      const delta = evento.delta === undefined ? 1 : Math.max(0, numero(evento.delta));
      estado.contadores[evento.contador] = numero(estado.contadores[evento.contador]) + delta;
    }
    tx.create(ref, {
      uid,
      clave: evento.clave,
      tipo: evento.tipo || 'actividad',
      puntos,
      detalle: typeof evento.detalle === 'string' ? evento.detalle.slice(0, 180) : '',
      fecha: ahoraISO,
    });
  });
  if (!puntosGanados && movimientos.every((_, i) => movSnaps[i].exists)) {
    return { estado, resultado: { puntosGanados: 0, saldo: estado.saldo, logrosNuevos: [], notificaciones: [] } };
  }
  const logrosNuevos = evaluarLogros(estado, ahoraISO);
  estado.actualizado = ahoraISO;
  tx.set(estadoRef, estado);
  return {
    estado,
    resultado: {
      puntosGanados,
      saldo: estado.saldo,
      logrosNuevos,
      notificaciones: estado.notificaciones.filter((n) => n.leida !== true),
    },
  };
}

export async function otorgarEventosTx(opciones) {
  return (await registrarEventosTx(opciones)).resultado;
}

/** Como otorgarEventos, pero entrega también el estado guardado para no releerlo. */
export async function registrarEventos(ctx, colecciones, uid, eventos) {
  return ctx.db.runTransaction((tx) => registrarEventosTx({
    tx,
    db: ctx.db,
    colecciones,
    uid,
    eventos,
    ahora: ctx.now(),
  }));
}

export async function otorgarEventos(ctx, colecciones, uid, eventos) {
  return (await registrarEventos(ctx, colecciones, uid, eventos)).resultado;
}

export function logrosPublicos(estado) {
  const e = normalizarEstadoRecompensas(estado);
  return LOGROS_RECOMPENSA.map((logro) => ({
    id: logro.id,
    titulo: logro.titulo,
    descripcion: logro.descripcion,
    icono: logro.icono,
    progreso: Math.min(logro.meta, numero(e.contadores[logro.contador])),
    meta: logro.meta,
    logrado: !!e.logros[logro.id],
    fecha: e.logros[logro.id]?.fecha ?? null,
  }));
}

export function catalogoRecompensas(estado, esVip = false, materialesDisponibles = null) {
  const e = normalizarEstadoRecompensas(estado);
  return RECOMPENSAS.map((r) => {
    const canjeada = r.tipo === 'material'
      ? e.desbloqueos.materiales.includes(r.materialId)
      : !!e.contadores[`canje:${r.id}`];
    return {
      ...r,
      canjeada,
      incluidaVip: r.tipo === 'material' && esVip,
      alcanza: e.saldo >= r.puntos,
      disponible: r.tipo !== 'material' || materialesDisponibles === null || materialesDisponibles.has(r.materialId),
    };
  });
}

export async function canjearRecompensa(ctx, colecciones, usuario, recompensaId, esVip = false) {
  const recompensa = RECOMPENSAS.find((r) => r.id === recompensaId);
  if (!recompensa) throw noEncontrado('Esa recompensa no existe.');
  if (esVip && recompensa.tipo === 'material') throw conflicto('Tu membresía VIP ya incluye este material.', 'recompensa_incluida');
  const { db } = ctx;
  if (recompensa.tipo === 'material') {
    const materialSnap = await db.collection(colecciones.materiales).doc(recompensa.materialId).get();
    const publicadoEnStorage = materialSnap.exists && materialSnap.data().estado === 'disponible' && !!materialSnap.data().archivo;
    const publicadoEnApi = ctx.materiales?.tiene(recompensa.materialId) === true;
    if (!publicadoEnStorage && !publicadoEnApi) {
      throw conflicto('Esta recompensa estará disponible cuando publiquemos el material autorizado.', 'recompensa_no_disponible');
    }
  }
  const estadoRef = db.collection(colecciones.recompensasEstado).doc(usuario.uid);
  const canjeRef = db.collection(colecciones.recompensasCanjes).doc(idMovimiento(usuario.uid, `canje:${recompensa.id}`));
  const movimientoRef = db.collection(colecciones.recompensasMovimientos).doc(idMovimiento(usuario.uid, `gasto:${recompensa.id}`));
  return db.runTransaction(async (tx) => {
    const [estadoSnap, canjeSnap] = await Promise.all([tx.get(estadoRef), tx.get(canjeRef)]);
    if (canjeSnap.exists) throw conflicto('Esta recompensa ya fue canjeada.', 'recompensa_ya_canjeada');
    const estado = normalizarEstadoRecompensas(estadoSnap.exists ? estadoSnap.data() : null, usuario.uid);
    if (estado.saldo < recompensa.puntos) throw conflicto(`Necesitas ${recompensa.puntos - estado.saldo} puntos más.`, 'puntos_insuficientes');
    const ahoraISO = ctx.now().toISOString();
    estado.saldo -= recompensa.puntos;
    estado.gastados += recompensa.puntos;
    estado.contadores[`canje:${recompensa.id}`] = 1;
    if (recompensa.tipo === 'material') estado.desbloqueos.materiales = [...new Set([...estado.desbloqueos.materiales, recompensa.materialId])];
    const estatus = recompensa.tipo === 'material' ? 'entregado' : 'pendiente';
    const notificacion = {
      id: `canje-${recompensa.id}-${ahoraISO}`,
      tipo: 'recompensa',
      titulo: recompensa.tipo === 'material' ? 'Recurso desbloqueado' : 'Solicitud de recompensa recibida',
      texto: recompensa.tipo === 'material' ? `${recompensa.titulo} ya está disponible en tu biblioteca.` : 'El equipo confirmará la activación de Praxia antes de iniciar tus 30 días.',
      enlace: recompensa.tipo === 'material' ? `#/materiales/${recompensa.materialId}` : '#/recompensas',
      fecha: ahoraISO,
      leida: false,
    };
    estado.notificaciones = [...estado.notificaciones, notificacion].slice(-30);
    estado.actualizado = ahoraISO;
    tx.set(estadoRef, estado);
    tx.create(canjeRef, {
      uid: usuario.uid,
      recompensaId: recompensa.id,
      titulo: recompensa.titulo,
      puntos: recompensa.puntos,
      tipo: recompensa.tipo,
      estatus,
      solicitado: ahoraISO,
    });
    tx.create(movimientoRef, {
      uid: usuario.uid,
      clave: `gasto:${recompensa.id}`,
      tipo: 'canje',
      puntos: -recompensa.puntos,
      detalle: `Canje: ${recompensa.titulo}`,
      fecha: ahoraISO,
    });
    return { estado, recompensa: { ...recompensa, estatus }, notificacion };
  });
}

export const materialDesbloqueado = (estado, materialId) => normalizarEstadoRecompensas(estado).desbloqueos.materiales.includes(materialId);
export const recompensaDeMaterial = (materialId) => RECOMPENSAS.find((r) => r.tipo === 'material' && r.materialId === materialId) ?? null;
