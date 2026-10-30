import { COL, leerDoc } from '../datos.js';
import { normalizarEstadoRecompensas } from './recompensas.js';
import { invalido } from './errores.js';
import { idDocumento } from './validacion.js';
import { leerCatalogoRecompensas } from './recompensas-catalogo.js';

export async function paginaAlumno(db, coleccion, uid, fecha, cursor, { subcoleccion = false } = {}) {
  const base = subcoleccion ? db.collection(coleccion).doc(uid).collection('eventos') : db.collection(coleccion);
  let q = (subcoleccion ? base : base.where('uid', '==', uid)).orderBy(fecha, 'desc');
  if (cursor) {
    const snap = await base.doc(idDocumento(String(cursor), 'cursor')).get();
    if (!snap.exists || (!subcoleccion && snap.data().uid !== uid)) throw invalido('La página no pertenece a este expediente.');
    q = q.startAfter(snap);
  }
  const snap = await q.limit(31).get();
  return { registros: snap.docs.slice(0, 30).map((d) => ({ ...d.data(), id: d.id })), siguiente: snap.size > 30 ? snap.docs[29].id : null };
}

export async function movimientosAlumno(ctx, uid, cursor) {
  const p = await paginaAlumno(ctx.db, COL.recompensasMovimientos, uid, 'fecha', cursor);
  return { ...p, registros: p.registros.map((m) => ({ id: m.id, fecha: m.fecha, tipo: m.tipo, puntos: Number(m.puntos) || 0, detalle: String(m.detalle ?? '').slice(0, 500) })) };
}

export async function recompensasAlumno(ctx, uid, cursor) {
  const [p, catalogo, wallet] = await Promise.all([paginaAlumno(ctx.db, COL.recompensasCanjes, uid, 'solicitado', cursor), leerCatalogoRecompensas(ctx.db), leerDoc(ctx.db, COL.recompensasEstado, uid)]);
  const mapa = new Map(catalogo.map((x) => [x.id, x]));
  const acceso = normalizarEstadoRecompensas(wallet, uid).desbloqueos;
  const materiales = acceso.materiales.length ? await ctx.db.getAll(...acceso.materiales.map(id => ctx.db.collection(COL.materiales).doc(id))) : [];
  const coleccion = [...materiales.map(d => ({ id: d.id, titulo: d.data()?.titulo || catalogo.find(r => r.materialId === d.id)?.titulo || d.id, tipo: 'material' })), ...acceso.recompensas.map(id => ({ id, titulo: mapa.get(id)?.titulo || id, tipo: 'recompensa' }))];
  return { ...p, coleccion, registros: p.registros.map((c) => {
    const r = mapa.get(c.recompensaId);
    const praxia = String(c.recompensaId).startsWith('praxia-');
    return {
      id: c.id, recompensaId: c.recompensaId, titulo: c.titulo || r?.titulo || c.recompensaId,
      tipo: c.tipo, puntos: Number(c.puntos) || 0, estatus: c.estatus,
      solicitado: c.solicitado, entregado: c.entregado ?? null, resuelto: c.resuelto ?? null,
      nota: typeof c.nota === 'string' ? c.nota.slice(0, 500) : '',
      incluye: Array.isArray(r?.incluye) ? r.incluye.slice(0, 20) : [],
      ubicacion: r?.materialId ? 'Materiales → Mi biblioteca' : 'Recompensas → Mi colección',
      praxia: praxia ? { codigoEmitido: /^PRX-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(c.codigoEntrega ?? ''), vence: c.cuponVence ?? null, activacion: 'no_verificada' } : null,
    };
  }) };
}

// No busca por correo ni mezcla clientes: sólo IDs ya vinculados a la cuenta.
// Leer un cobro no activa membresías ni genera reembolsos.
export async function pagosAlumno(ctx, miembro, sus, query) {
  const clientes = [...new Set([sus?.customerId, miembro?.stripeCustomerId].filter((v) => typeof v === 'string' && /^cus_[a-zA-Z0-9]+$/.test(v)))];
  const cliente = query.cliente ? String(query.cliente) : clientes[0] ?? null;
  if (cliente && !clientes.includes(cliente)) throw invalido('El cliente de cobro no pertenece a este expediente.');
  const base = { clientes, cliente, registros: [], siguiente: null, consultadoEn: ctx.now().toISOString() };
  if (!clientes.length) return { ...base, disponible: false, motivo: 'sin_vinculo', mensaje: 'No hay un cliente de Stripe vinculado. Esto no demuestra que nunca haya pagado.' };
  if (!ctx.stripe?.charges?.list) return { ...base, disponible: false, motivo: 'sin_conexion', mensaje: 'La consulta de cobros no está disponible. La membresía se muestra por separado.' };
  const cursor = query.cursor ? String(query.cursor) : null;
  if (cursor && !/^ch_[a-zA-Z0-9]+$/.test(cursor)) throw invalido('La referencia de página de cobros no es válida.');
  try {
    const p = await ctx.stripe.charges.list({ customer: cliente, limit: 20, ...(cursor ? { starting_after: cursor } : {}) }, { timeout: 8000, maxNetworkRetries: 0 });
    const registros = p.data.map((c) => ({
      id: c.id, fecha: new Date(c.created * 1000).toISOString(), moneda: c.currency,
      solicitado: c.amount, capturado: c.amount_captured ?? 0, reembolsado: c.amount_refunded ?? 0,
      estado: c.disputed ? 'disputa' : c.refunded ? 'reembolsado' : c.amount_refunded > 0 ? 'reembolso_parcial'
        : c.status === 'failed' ? 'fallido' : c.paid === true && c.captured === true && c.status === 'succeeded' ? 'confirmado'
          : c.paid === true && c.captured === false ? 'autorizado' : 'pendiente',
      prueba: c.livemode === false,
    }));
    return { ...base, disponible: true, registros, siguiente: p.has_more && registros.length ? registros.at(-1).id : null };
  } catch {
    return { ...base, disponible: false, motivo: 'error_consulta', mensaje: 'No se pudieron verificar los cobros en Stripe. Reintenta; no se interpreta como ausencia de pagos.' };
  }
}
