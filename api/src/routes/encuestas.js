import express from 'express';
import { COL, estadoMembresia } from '../datos.js';
import { DIA_MS, aMillis } from '../lib/fechas.js';
import {
  ENCUESTAS,
  claveBienvenida,
  claveCurso,
  clavePulso,
  encuestaPublica,
  experienciaDisponible,
  plantillaPorClave,
  validarRespuestas,
} from '../lib/encuestas.js';
import { conflicto, invalido } from '../lib/errores.js';
import { cuerpo, idDocumento } from '../lib/validacion.js';
import { requireAuth } from '../middleware/auth.js';
import { h } from '../middleware/errores.js';

const CLAVE = /^[A-Za-z0-9_-]{1,500}$/;
const claveValida = (valor) => {
  if (typeof valor !== 'string' || !CLAVE.test(valor)) throw invalido('La clave de encuesta no es válida.');
  return valor;
};
const idRespuesta = (uid, clave) => `${uid}__${clave}`;

async function estadoEncuestas(ctx, uid) {
  const ref = ctx.db.collection(COL.encuestasEstado).doc(uid);
  return ctx.db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const ahora = ctx.now().toISOString();
    if (snap.exists) {
      const estado = snap.data();
      tx.set(ref, { ultimaConsulta: ahora }, { merge: true });
      return estado;
    }
    const estado = { uid, primeraVista: ahora, ultimaConsulta: ahora, pospuestas: {} };
    tx.set(ref, estado);
    return estado;
  });
}

const estaPospuesta = (estado, clave, ahoraMs) => {
  const hasta = aMillis(estado?.pospuestas?.[clave]?.hasta);
  return hasta !== null && !Number.isNaN(hasta) && hasta > ahoraMs;
};

async function calcularPendientes(ctx, usuario) {
  if (usuario.esAdmin) return { pendientes: [], respondidas: [], vip: false, perfil: null };
  const estado = await estadoEncuestas(ctx, usuario.uid);
  const [respuestasSnap, progresoSnap, cursosSnap, membresia] = await Promise.all([
    ctx.db.collection(COL.encuestasRespuestas).where('uid', '==', usuario.uid).get(),
    ctx.db.collection(COL.progreso).where('uid', '==', usuario.uid).get(),
    ctx.db.collection(COL.cursos).get(),
    estadoMembresia(ctx, usuario),
  ]);
  const respondidas = new Set(respuestasSnap.docs.map((d) => d.data().clave));
  // Perfil de la entrevista inicial (sin PII) para personalizar el club: intereses, objetivo, formato, etapa y reto.
  const docBienvenida = respuestasSnap.docs.map((d) => d.data()).filter((r) => r.encuestaId === ENCUESTAS.bienvenida.id).sort((a, b) => String(b.enviado).localeCompare(String(a.enviado)))[0];
  const perfil = docBienvenida ? Object.fromEntries(['intereses', 'objetivo', 'formato', 'situacion', 'reto'].filter((k) => docBienvenida.respuestas?.[k] !== undefined).map((k) => [k, docBienvenida.respuestas[k]])) : null;
  const titulos = new Map(cursosSnap.docs.map((d) => [d.id, d.data().titulo || d.id]));
  const ahoraMs = ctx.now().getTime();
  const salida = [];

  const bienvenida = claveBienvenida();
  if (!respondidas.has(bienvenida) && !estaPospuesta(estado, bienvenida, ahoraMs)) {
    salida.push({ ...encuestaPublica(ENCUESTAS.bienvenida, { clave: bienvenida }), prioridad: ENCUESTAS.bienvenida.prioridad });
  }

  const completos = progresoSnap.docs
    .map((d) => d.data())
    .filter((p) => p.certificado && p.cursoId)
    .sort((a, b) => (aMillis(b.actualizado) ?? 0) - (aMillis(a.actualizado) ?? 0));
  for (const p of completos) {
    const clave = claveCurso(p.cursoId);
    if (respondidas.has(clave) || estaPospuesta(estado, clave, ahoraMs)) continue;
    salida.push({ ...encuestaPublica(ENCUESTAS.curso, { clave, cursoId: p.cursoId, cursoTitulo: titulos.get(p.cursoId) ?? p.cursoId }), prioridad: ENCUESTAS.curso.prioridad, disponibleDesde: p.actualizado ?? null });
  }

  // Experiencia: una clave por trimestre; se repite cada 90 días y calla tras `maxPosponer` aplazamientos.
  const pulso = clavePulso(ahoraMs);
  const primeraVista = aMillis(estado.primeraVista);
  const clasesVistas = progresoSnap.docs.reduce((n, d) => n + (Array.isArray(d.data().vistas) ? d.data().vistas.length : 0), 0);
  const ultimaExperiencia = respuestasSnap.docs.map((d) => d.data()).filter((r) => r.encuestaId === ENCUESTAS.pulso.id).map((r) => aMillis(r.enviado) ?? 0).reduce((a, b) => Math.max(a, b), 0) || null;
  const silenciada = Number(estado?.pospuestas?.[pulso]?.veces ?? 0) >= ENCUESTAS.pulso.maxPosponer;
  if (experienciaDisponible(primeraVista, clasesVistas, ahoraMs, ultimaExperiencia) && !respondidas.has(pulso) && !silenciada && !estaPospuesta(estado, pulso, ahoraMs)) {
    salida.push({ ...encuestaPublica(ENCUESTAS.pulso, { clave: pulso }), prioridad: ENCUESTAS.pulso.prioridad, disponibleDesde: new Date(primeraVista + ENCUESTAS.pulso.diasMinimos * DIA_MS).toISOString() });
  }
  return {
    pendientes: salida.sort((a, b) => b.prioridad - a.prioridad || String(b.disponibleDesde ?? '').localeCompare(String(a.disponibleDesde ?? ''))),
    respondidas: [...respondidas],
    vip: membresia.esVip === true,
    perfil,
  };
}

export function rutasEncuestas(ctx) {
  const r = express.Router();
  const auth = requireAuth(ctx);

  r.get('/encuestas/pendientes', auth, h(async (req, res) => {
    res.json(await calcularPendientes(ctx, req.usuario));
  }));

  r.post('/encuestas/:clave/responder', auth, h(async (req, res) => {
    const clave = claveValida(req.params.clave);
    const plantilla = plantillaPorClave(clave);
    if (!plantilla) throw invalido('Esa encuesta no existe o ya cambió de versión.');
    const { pendientes, vip } = await calcularPendientes(ctx, req.usuario);
    const encuesta = pendientes.find((p) => p.clave === clave);
    if (!encuesta) throw conflicto('Esta encuesta ya fue respondida o todavía no está disponible.', 'encuesta_no_disponible');
    const respuestas = validarRespuestas(plantilla, cuerpo(req).respuestas, { vip });
    const ref = ctx.db.collection(COL.encuestasRespuestas).doc(idRespuesta(req.usuario.uid, clave));
    const doc = {
      uid: req.usuario.uid,
      clave,
      encuestaId: plantilla.id,
      version: plantilla.version,
      tipo: plantilla.tipo,
      cursoId: encuesta.cursoId ?? null,
      cursoTitulo: encuesta.cursoTitulo ?? null,
      // Plan al responder, para segmentar agregados sin exponer identidad.
      vip,
      respuestas,
      enviado: ctx.now().toISOString(),
      avisoPrivacidad: '2026-10-02',
    };
    // El correo sólo se guarda si la persona pidió que le escribamos; es lo único con identidad que ve el admin.
    if (respuestas.contacto === 'si' && req.usuario.email) doc.correoContacto = req.usuario.email;
    try { await ref.create(doc); }
    catch (e) {
      if (e?.code === 6 || /ALREADY_EXISTS/.test(e?.message ?? '')) throw conflicto('Esta encuesta ya fue respondida.', 'encuesta_respondida');
      throw e;
    }
    res.status(201).json({ ok: true, clave, siguiente: (await calcularPendientes(ctx, req.usuario)).pendientes[0] ?? null });
  }));

  r.post('/encuestas/:clave/posponer', auth, h(async (req, res) => {
    const clave = claveValida(req.params.clave);
    const plantilla = plantillaPorClave(clave);
    if (!plantilla) throw invalido('Esa encuesta no existe o ya cambió de versión.');
    const { pendientes } = await calcularPendientes(ctx, req.usuario);
    if (!pendientes.some((p) => p.clave === clave)) throw conflicto('Esta encuesta ya fue respondida o no está disponible.', 'encuesta_no_disponible');
    if (plantilla.tipo === 'curso' && cuerpo(req).cursoId !== undefined) idDocumento(cuerpo(req).cursoId, 'cursoId');
    const ref = ctx.db.collection(COL.encuestasEstado).doc(req.usuario.uid);
    const actual = (await ref.get()).data() ?? { uid: req.usuario.uid, pospuestas: {} };
    const dias = plantilla.tipo === 'bienvenida' ? 3 : plantilla.tipo === 'curso' ? 7 : 14;
    const previa = actual.pospuestas?.[clave] ?? {};
    const pospuestas = {
      ...(actual.pospuestas ?? {}),
      [clave]: { hasta: new Date(ctx.now().getTime() + dias * DIA_MS).toISOString(), veces: Number(previa.veces ?? 0) + 1 },
    };
    await ref.set({ ...actual, uid: req.usuario.uid, pospuestas, actualizado: ctx.now().toISOString() }, { merge: true });
    res.json({ ok: true, clave, dias });
  }));

  return r;
}
