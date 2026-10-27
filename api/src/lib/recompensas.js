import { createHash, randomBytes } from 'node:crypto';
import { conflicto, invalido, noEncontrado } from './errores.js';
import { RECOMPENSAS, CATALOGO_COL, combinarRecompensa, puedeEntregar, recompensaPublica, esEntregaAutomatica, leerCatalogoRecompensas } from './recompensas-catalogo.js';
import { tienePlantilla } from './recompensas-archivos.js';

export const REGLAS_PUNTOS = Object.freeze({
  clase: 10,
  curso: 50,
  quiz: 20,
  retoCorrecto: 10,
  retoIntento: 2,
  juegoClase: 5,
  encuestaBienvenida: 25,
  encuestaCurso: 20,
  encuestaExperiencia: 40,
  temaComunidad: 10,
  respuestaComunidad: 5,
  membresia: 300,
});

export { RECOMPENSAS } from './recompensas-catalogo.js';


export const LOGROS_RECOMPENSA = Object.freeze([
  { id: 'primer-paso', titulo: 'Primer paso', descripcion: 'Completaste tu primera clase.', icono: 'footprints', contador: 'clases', meta: 1 },
  { id: 'en-marcha', titulo: 'En marcha', descripcion: 'Completaste 5 clases.', icono: 'play', contador: 'clases', meta: 5 },
  { id: 'certificado', titulo: 'Primer certificado', descripcion: 'Terminaste tu primer curso.', icono: 'award', contador: 'cursos', meta: 1 },
  { id: 'mente-clinica', titulo: 'Mente clínica', descripcion: 'Aprobaste 3 evaluaciones.', icono: 'brain', contador: 'quizzes', meta: 3 },
  { id: 'retador', titulo: 'Retador constante', descripcion: 'Ganaste 100 puntos practicando en Retos.', icono: 'gamepad-2', contador: 'puntosRetos', meta: 100 },
  { id: 'repaso-constante', titulo: 'Repaso constante', descripcion: 'Completaste 10 juegos de repaso al terminar tus clases.', icono: 'puzzle', contador: 'juegosClase', meta: 10 },
  { id: 'voz', titulo: 'Voz de la comunidad', descripcion: 'Publicaste tu primer tema.', icono: 'message-circle', contador: 'temas', meta: 1 },
  { id: 'especialista', titulo: 'Especialista', descripcion: 'Terminaste 3 cursos.', icono: 'badge-check', contador: 'cursos', meta: 3 },
  { id: 'maestro', titulo: 'Maestro OdonTeck', descripcion: 'Terminaste 10 cursos.', icono: 'crown', contador: 'cursos', meta: 10 },
  { id: 'miembro-club', titulo: 'Miembro del club', descripcion: 'Activaste una membresía pagada.', icono: 'gem', contador: 'membresias', meta: 1 },
]);

const numero = (valor) => Number.isFinite(Number(valor)) ? Number(valor) : 0;
const objeto = (valor) => valor && typeof valor === 'object' && !Array.isArray(valor) ? valor : {};
const idMovimiento = (uid, clave) => createHash('sha256').update(`${uid}:${clave}`).digest('hex').slice(0, 40);
const codigoCampana = (valor) => typeof valor === 'string' && /^[A-Z0-9-]{8,32}$/.test(valor.trim().toUpperCase().replace(/\s+/g, ''))
  ? valor.trim().toUpperCase().replace(/\s+/g, '')
  : '';
const hashCodigoCampana = (valor) => createHash('sha256').update(codigoCampana(valor)).digest('hex');
// Nunca se importan en el cliente: el catálogo del navegador sólo recibe `requiereCodigo`.
const CODIGOS_CAMPANA_HASH = Object.freeze({
  'kit-bienvenida-canal-30': '8998c23a37ac10aa77f0f558fc522ed3e38105ea14b42059fb853bf9a36cca21',
  'praxia-bienvenida-30-dias': '8998c23a37ac10aa77f0f558fc522ed3e38105ea14b42059fb853bf9a36cca21',
});
const codigoSolicitudPraxia = () => {
  const token = randomBytes(5).toString('hex').toUpperCase();
  return `PRA-${token.slice(0, 5)}-${token.slice(5)}`;
};

export const estadoRecompensasVacio = (uid = '') => ({
  uid,
  saldo: 0,
  ganados: 0,
  gastados: 0,
  contadores: {},
  logros: {},
  desbloqueos: { materiales: [], recompensas: [] },
  personalizacion: { marco: null, portada: null },
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
    desbloqueos: { materiales: Array.isArray(desbloqueos.materiales) ? [...new Set(desbloqueos.materiales.filter((x) => typeof x === 'string'))] : [], recompensas: Array.isArray(desbloqueos.recompensas) ? [...new Set(desbloqueos.recompensas.filter(x=>typeof x==='string'))] : [] },
    personalizacion: { marco: typeof v.personalizacion?.marco==='string'?v.personalizacion.marco:null, portada: typeof v.personalizacion?.portada==='string'?v.personalizacion.portada:null },
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

export function catalogoRecompensas(estado, esVip = false, materialesDisponibles = null, catalogo = RECOMPENSAS, canjes = []) {
  const e = normalizarEstadoRecompensas(estado);
  const porId = new Map(canjes.map(c=>[c.recompensaId,c]));
  return catalogo.map(r => {
    const registro=porId.get(r.id);
    const canjeada=r.tipo==='material'?e.desbloqueos.materiales.includes(r.materialId):e.desbloqueos.recompensas.includes(r.id)||!!e.contadores[`canje:${r.id}`];
    return { ...recompensaPublica(r), canjeada, incluidaVip:r.tipo==='material'&&esVip, alcanza:e.saldo>=r.puntos,
      disponible:puedeEntregar(r)&&(r.tipo!=='archivo'||tienePlantilla(r.id))&&(r.tipo!=='material'||materialesDisponibles===null||materialesDisponibles.has(r.materialId)),
      estatus:registro?.estatus??(canjeada?(esEntregaAutomatica(r)?'entregado':'pendiente'):null),
      aplicado:r.tipo==='personalizacion'&&e.personalizacion[r.ranura]===r.id,
    };
  });
}

export async function canjearRecompensa(ctx, colecciones, usuario, recompensaId, esVip = false, precioEsperado, codigo) {
  const base=RECOMPENSAS.find(r=>r.id===recompensaId)??(await leerCatalogoRecompensas(ctx.db)).find(r=>r.id===recompensaId);
  if(!base)throw noEncontrado('Esa recompensa no existe.');
  const codigoEsperado=CODIGOS_CAMPANA_HASH[base.id];
  if(base.requiereCodigo===true&&(!codigoEsperado||!codigoCampana(codigo)||hashCodigoCampana(codigo)!==codigoEsperado))throw invalido('El código de acceso no es válido. Revisa el mensaje del canal oficial.','codigo_invalido');
  if(esVip&&base.tipo==='material')throw conflicto('Tu membresía VIP ya incluye este material.','recompensa_incluida');
  const {db}=ctx;
  if(base.tipo==='material') {
    const m=await db.collection(colecciones.materiales).doc(base.materialId).get();
    if(!(m.exists&&m.data().estado==='disponible'&&m.data().archivo)&&ctx.materiales?.tiene(base.materialId)!==true)throw conflicto('Esta recompensa estará disponible cuando publiquemos el material autorizado.','recompensa_no_disponible');
  }
  if(base.tipo==='archivo'&&!tienePlantilla(base.id))throw conflicto('El archivo todavía no está preparado.','recompensa_no_disponible');
  const estadoRef=db.collection(colecciones.recompensasEstado).doc(usuario.uid);
  const canjeRef=db.collection(colecciones.recompensasCanjes).doc(idMovimiento(usuario.uid,`canje:${base.id}`));
  const movimientoRef=db.collection(colecciones.recompensasMovimientos).doc(idMovimiento(usuario.uid,`gasto:${base.id}`));
  const configRef=db.collection(CATALOGO_COL).doc(base.id);
  return db.runTransaction(async tx=>{
    const [estadoSnap,canjeSnap,configSnap]=await tx.getAll(estadoRef,canjeRef,configRef);
    if(canjeSnap.exists)throw conflicto('Esta recompensa ya tiene un canje registrado.','recompensa_ya_canjeada');
    const recompensa=combinarRecompensa(base,configSnap.exists?configSnap.data():{});
    if(!puedeEntregar(recompensa))throw conflicto('Esta recompensa todavía no está disponible o no tiene cupos.','recompensa_no_disponible');
    if(precioEsperado!==undefined&&precioEsperado!==recompensa.puntos)throw conflicto('El precio cambió. Actualiza la tienda y confirma el nuevo importe.','precio_actualizado');
    const estado=normalizarEstadoRecompensas(estadoSnap.exists?estadoSnap.data():null,usuario.uid);
    if(estado.contadores[`canje:${recompensa.id}`]||estado.desbloqueos.recompensas.includes(recompensa.id)||(recompensa.materialId&&estado.desbloqueos.materiales.includes(recompensa.materialId)))throw conflicto('Ya tienes esta recompensa en tu colección.','recompensa_ya_canjeada');
    if(estado.saldo<recompensa.puntos)throw conflicto(`Necesitas ${recompensa.puntos-estado.saldo} OdonCoins más.`,'puntos_insuficientes');
    const ahoraISO=ctx.now().toISOString();
    estado.saldo-=recompensa.puntos;estado.gastados+=recompensa.puntos;estado.contadores[`canje:${recompensa.id}`]=1;
    if(recompensa.tipo==='material')estado.desbloqueos.materiales=[...new Set([...estado.desbloqueos.materiales,recompensa.materialId])];
    else if(esEntregaAutomatica(recompensa))estado.desbloqueos.recompensas=[...new Set([...estado.desbloqueos.recompensas,recompensa.id])];
    const estatus=esEntregaAutomatica(recompensa)?'entregado':'pendiente';
    const notificacion={id:`canje-${recompensa.id}-${ahoraISO}`,tipo:'recompensa',titulo:estatus==='entregado'?'Recompensa desbloqueada':'Solicitud de recompensa recibida',texto:estatus==='entregado'?`${recompensa.titulo} ya está en tu colección.`:'Tu solicitud quedó registrada. Puedes seguir su estado en Mis recompensas.',enlace:recompensa.tipo==='material'?`#/materiales/${recompensa.materialId}`:'#/recompensas?vista=coleccion',fecha:ahoraISO,leida:false};
    estado.notificaciones=[...estado.notificaciones,notificacion].slice(-30);estado.actualizado=ahoraISO;
    const reservaCupo=recompensa.tipo==='manual'&&Number.isInteger(recompensa.cupo);
    if(reservaCupo)tx.set(configRef,{...configSnap.data(),cupo:recompensa.cupo-1,actualizado:ahoraISO});
    tx.set(estadoRef,estado);
    const codigoEntrega=recompensa.id==='praxia-bienvenida-30-dias'?codigoSolicitudPraxia():null;
    tx.create(canjeRef,{uid:usuario.uid,recompensaId:recompensa.id,titulo:recompensa.titulo,puntos:recompensa.puntos,tipo:recompensa.tipo,estatus,solicitado:ahoraISO,reservaCupo,plazo:recompensa.plazo??null,...(codigoEntrega?{codigoEntrega}: {})});
    tx.create(movimientoRef,{uid:usuario.uid,clave:`gasto:${recompensa.id}`,tipo:'canje',puntos:-recompensa.puntos,detalle:`Canje: ${recompensa.titulo}`,fecha:ahoraISO});
    return {estado,recompensa:{...recompensaPublica(recompensa),estatus,...(codigoEntrega?{codigoEntrega}: {})},notificacion};
  });
}

export const materialDesbloqueado = (estado, materialId) => normalizarEstadoRecompensas(estado).desbloqueos.materiales.includes(materialId);
export const recompensaDeMaterial = (materialId) => RECOMPENSAS.find((r) => r.tipo === 'material' && r.materialId === materialId) ?? null;
