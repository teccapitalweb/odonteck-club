// «Escoge tu curso gratis»: cada miembro gratis elige UN curso del catálogo. Ese curso
// queda abierto completo excepto su última clase; los demás requieren VIP.
// La elección vive en v2_curso_gratis/{uid} y solo la escribe este servidor.
import { COL } from '../datos.js';

export const CAMBIO_GRATIS_MS = 24 * 60 * 60 * 1000;
export const MAX_VISTAS_PARA_CAMBIAR = 1;

const leerVistas = async (ctx, uid, cursoId) => {
  const snap = await ctx.db.collection(COL.progreso).doc(`${uid}_${cursoId}`).get();
  return snap.exists ? (snap.data().vistas ?? []).length : 0;
};

/**
 * Devuelve la elección del miembro o null si aún no elige.
 * Migración perezosa: quien ya avanzó en el curso gratis anterior (el que tenía clases
 * marcadas «gratis») lo conserva como su curso gratis, sin tener que elegir.
 */
export async function leerCursoGratis(ctx, uid) {
  const ref = ctx.db.collection(COL.cursoGratis).doc(uid);
  const snap = await ref.get();
  if (snap.exists) return snap.data();
  const progreso = await ctx.db.collection(COL.progreso).where('uid', '==', uid).get();
  const conAvance = progreso.docs.map((d) => d.data()).filter((p) => p?.cursoId && (p.vistas ?? []).length > 0);
  if (!conAvance.length) return null;
  const cursos = await ctx.db.getAll(...conAvance.map((p) => ctx.db.collection(COL.cursos).doc(String(p.cursoId))));
  const candidatos = cursos
    .filter((s) => s.exists && s.data().publicado === true && (s.data().clases ?? []).some((c) => c?.gratis === true))
    .map((s) => ({ id: s.id, vistas: (conAvance.find((p) => p.cursoId === s.id)?.vistas ?? []).length }))
    .sort((a, b) => b.vistas - a.vistas);
  if (!candidatos.length) return null;
  const datos = { uid, cursoId: candidatos[0].id, origen: 'migracion', elegido: ctx.now().toISOString(), cambios: 0 };
  await ref.set(datos);
  return datos;
}

/** Estado público de la elección, con la ventana de cambio único ya resuelta. */
export async function estadoCursoGratis(ctx, uid, eleccion) {
  if (!eleccion?.cursoId) return { cursoId: null, origen: eleccion?.origen ?? null, elegido: null, puedeCambiar: false, cambiaHasta: null };
  const limite = new Date(eleccion.elegido).getTime() + CAMBIO_GRATIS_MS;
  const enVentana = eleccion.origen === 'eleccion' && (eleccion.cambios ?? 0) === 0 && ctx.now().getTime() < limite;
  const puedeCambiar = enVentana && (await leerVistas(ctx, uid, eleccion.cursoId)) <= MAX_VISTAS_PARA_CAMBIAR;
  return { cursoId: eleccion.cursoId, origen: eleccion.origen, elegido: eleccion.elegido, puedeCambiar, cambiaHasta: puedeCambiar ? new Date(limite).toISOString() : null };
}

export { leerVistas };
