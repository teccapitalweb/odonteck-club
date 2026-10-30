import { createHash, randomUUID } from 'node:crypto';
import { COL } from '../datos.js';
import { noEncontrado } from './errores.js';

const visibles = new Set('titulo estado estatus publicado oculto visible plan hasta dias usosMax usados vence etiqueta cursoId origen anterior puntos cupo precio precios mensual anual descuentoVIP version n orden nivel categoria tipo entrega resuelto saldo gastados ganados accion recompensaId'.split(' '));
const sensibles = /codigo|token|secret|password|stripe|email|whatsapp|telefono|url|enlace|archivo|videoId|nota|texto|detalle|motivo|nombre|autor|Por$/i;
const huella = (v) => createHash('sha256').update(JSON.stringify(v) ?? 'null').digest('hex');

// Las instantáneas son resúmenes, nunca copias de credenciales, códigos,
// respuestas de quizzes, datos personales ni URLs privadas.
export function resumenAuditable(doc) {
  if (!doc) return null;
  return Object.fromEntries(Object.entries(doc).filter(([k]) => !sensibles.test(k)).map(([k, v]) => {
    if (visibles.has(k) && (v === null || ['string', 'number', 'boolean'].includes(typeof v))) return [k, typeof v === 'string' ? v.slice(0, 250) : v];
    if (k === 'precios') return [k, Object.fromEntries(['mensual', 'anual'].filter((p) => typeof v?.[p] === 'number').map((p) => [p, v[p]]))];
    return [k, { huella: huella(v), ...(Array.isArray(v) ? { elementos: v.length } : {}) }];
  }));
}

export function registrarAuditoria(ctx, tx, req, { ref, accion, antes = null, despues = null, motivo, extra }) {
  const id = randomUUID();
  const tipo = ref.path.split('/')[0];
  const recurso = tipo === COL.cupones ? `cupon-${huella(ref.id).slice(0, 16)}` : ref.path;
  const campos = [...new Set([...Object.keys(antes ?? {}), ...Object.keys(despues ?? {})])]
    .filter((k) => !['actualizado', 'actualizadoPor'].includes(k) && JSON.stringify(antes?.[k]) !== JSON.stringify(despues?.[k]));
  const motivoManual = String(motivo ?? req.body?.motivoAuditoria ?? '').trim().slice(0, 500);
  const evento = {
    id, fecha: ctx.now().toISOString(), actorUid: req.usuario.uid,
    actor: req.usuario.email || req.usuario.uid, tipo, recurso, accion,
    motivo: motivoManual || 'Acción administrativa desde el panel',
    motivoManual: !!motivoManual, campos,
    antes: resumenAuditable(antes), despues: resumenAuditable(despues),
    ...(extra ? { efectos: resumenAuditable(extra) } : {}),
  };
  tx.create(ctx.db.collection(COL.adminAuditoria).doc(id), evento);
  const objetivoUid = [COL.cortesias, COL.cursoGratis, COL.perfiles].includes(tipo) ? ref.id
    : tipo === COL.recompensasCanjes ? (despues?.uid || antes?.uid) : null;
  if (objetivoUid) tx.create(ctx.db.collection(COL.adminAuditoriaMiembros).doc(objetivoUid).collection('eventos').doc(id), evento);
  return evento;
}

export async function escribirAuditado(ctx, req, ref, datos, { modo = 'set', accion = 'actualizar', motivo, requiereExistir = false } = {}) {
  return ctx.db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const antes = snap.exists ? snap.data() : null;
    if (requiereExistir && !snap.exists) throw noEncontrado('El registro ya no existe.');
    const valor = typeof datos === 'function' ? datos(antes) : datos;
    const despues = modo === 'delete' ? null : modo === 'merge' ? fusionar(antes ?? {}, valor) : valor;
    if (modo === 'delete') tx.delete(ref);
    else if (modo === 'create') tx.create(ref, despues);
    else tx.set(ref, despues);
    registrarAuditoria(ctx, tx, req, { ref, accion, antes, despues, motivo });
    return despues;
  });
}

function fusionar(base, cambio) {
  const salida = { ...base };
  for (const [k, v] of Object.entries(cambio)) salida[k] = v && typeof v === 'object' && !Array.isArray(v) ? fusionar(base[k] ?? {}, v) : v;
  return salida;
}
