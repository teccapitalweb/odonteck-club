// Academia OdonTeck: programas de lectura por módulos (Programa → Módulo → Tema → Actividad).
// - El contenido vive en api/content/academia (versionado en Git, revisado por especialistas).
// - Módulo 1 de cada programa gratis; el resto requiere VIP. Un módulo se abre al aprobar el anterior.
// - Solo se publica lo aprobado (estado efectivo = revisión admin o, si no hay, el JSON). Los
//   borradores los ven administradores, salvo que config.academiaBorradores sea true.
// - El examen lo califica el servidor; las respuestas correctas nunca viajan antes de responder.
// - Al aprobar todos los módulos de un programa se emite, dentro de la misma transacción, un
//   certificado con folio ODT-AAAA-NNNNN (mismo contador y verificación pública que los cursos).
import express from 'express';
import { COL, estadoMembresia, leerDoc, nombreVisible } from '../datos.js';
import {
  APROBATORIO_ACADEMIA,
  ESPERA_REINTENTO_MS,
  barajar,
  estadoEfectivo,
  idRevision,
  moduloPublico,
  moduloVisible,
} from '../lib/academia.js';
import { HttpError, invalido, noEncontrado } from '../lib/errores.js';
import { formatearFolio } from '../lib/folio.js';
import { cuerpo, esObjeto } from '../lib/validacion.js';
import { requireAuth } from '../middleware/auth.js';
import { h } from '../middleware/errores.js';

/** Certificado de Academia para el miembro y para la verificación (sin datos de más). */
export const certificadoAcademiaPublico = (c) => ({
  folio: c.folio,
  tipo: 'academia',
  nombre: c.nombre,
  programaId: c.programaId,
  programaTitulo: c.programaTitulo,
  area: c.area ?? '',
  modulos: c.modulos ?? 0,
  emitido: c.emitido,
});

export function rutasAcademia(ctx) {
  const r = express.Router();
  const auth = requireAuth(ctx);
  const { db } = ctx;
  const contenido = ctx.academia;
  const borradores = ctx.config?.academiaBorradores === true;

  const programa = (id) => contenido.catalogo().programas.find((p) => p.id === id);
  const progresoRef = (uid) => db.collection(COL.academiaProgreso).doc(uid);
  const intentoRef = (uid, p, n) => db.collection(COL.academiaIntentos).doc(`${uid}_${p}_${n}`);
  async function leerProgreso(uid) {
    const snap = await progresoRef(uid).get();
    return snap.exists ? snap.data() : { uid, programas: {} };
  }
  async function leerRevisiones() {
    const snap = await db.collection(COL.academiaRevisiones).get();
    return new Map(snap.docs.map((d) => [d.id, d.data()]));
  }
  const aprobado = (prog, pid, n) => prog?.programas?.[pid]?.modulos?.[String(n)]?.aprobado === true;

  /** Resuelve programa, módulo, visibilidad, acceso VIP y desbloqueo, en ese orden. */
  async function prepararModulo(req, { exigirDesbloqueo = true } = {}) {
    const p = programa(String(req.params.programa));
    const n = Number(req.params.n);
    if (!p || !Number.isInteger(n) || !p.modulos.some((m) => m.n === n)) throw noEncontrado('Este módulo no existe.');
    const m = contenido.modulo(p.id, n);
    const revision = m ? await leerDoc(db, COL.academiaRevisiones, idRevision(p.id, n)) : null;
    const estado = estadoEfectivo(m, revision);
    if (!moduloVisible(m, estado, { esAdmin: req.usuario.esAdmin, borradores })) {
      throw new HttpError(404, 'modulo_en_preparacion', 'Este módulo está en preparación.');
    }
    const [membresia, prog] = await Promise.all([estadoMembresia(ctx, req.usuario), leerProgreso(req.usuario.uid)]);
    if (n > 1 && !membresia.esVip && !req.usuario.esAdmin) {
      throw new HttpError(402, 'requiere_vip', 'Este módulo es para miembros VIP. El módulo 1 de cada programa es gratis.');
    }
    if (exigirDesbloqueo && n > 1 && !req.usuario.esAdmin && !aprobado(prog, p.id, n - 1)) {
      throw new HttpError(403, 'modulo_bloqueado', `Aprueba el examen del módulo ${n - 1} para desbloquear este módulo.`);
    }
    return { p, n, m, estado, prog };
  }

  // Catálogo con disponibilidad por módulo, avance y certificados de esta cuenta.
  r.get('/academia', auth, h(async (req, res) => {
    const [prog, revisiones, certSnap] = await Promise.all([
      leerProgreso(req.usuario.uid),
      leerRevisiones(),
      db.collection(COL.academiaCertificados).where('uid', '==', req.usuario.uid).get(),
    ]);
    const opciones = { esAdmin: req.usuario.esAdmin, borradores };
    const programas = contenido.catalogo().programas.map((p) => ({
      ...p,
      modulos: p.modulos.map((mm) => {
        const m = contenido.modulo(p.id, mm.n);
        const estado = estadoEfectivo(m, revisiones.get(idRevision(p.id, mm.n)));
        return {
          ...mm,
          disponible: moduloVisible(m, estado, opciones),
          estado,
          temas: Array.isArray(m?.temas) ? m.temas.length : 0,
          duracionMin: m?.duracionMin ?? null,
        };
      }),
    }));
    const certificados = Object.fromEntries(certSnap.docs.map((d) => d.data()).map((c) => [c.programaId, certificadoAcademiaPublico(c)]));
    res.json({ programas, progreso: prog.programas ?? {}, certificados });
  }));

  r.get('/academia/progreso', auth, h(async (req, res) => {
    res.json((await leerProgreso(req.usuario.uid)).programas ?? {});
  }));

  r.get('/academia/:programa/:n', auth, h(async (req, res) => {
    const { m, estado } = await prepararModulo(req);
    res.json(moduloPublico(m, estado));
  }));

  // Marca un tema como leído (avance, sin valor canjeable).
  r.post('/academia/:programa/:n/tema', auth, h(async (req, res) => {
    const { p, n, m } = await prepararModulo(req);
    const { tema } = cuerpo(req);
    if (typeof tema !== 'string' || !(m.temas ?? []).some((t) => t.n === tema)) throw invalido('"tema" no pertenece a este módulo.');
    const ahora = ctx.now().toISOString();
    await progresoRef(req.usuario.uid).set({
      uid: req.usuario.uid,
      actualizado: ahora,
      programas: { [p.id]: { modulos: { [String(n)]: { temas: { [tema]: ahora } } } } },
    }, { merge: true });
    res.json({ ok: true });
  }));

  // Emite un examen: preguntas al azar del banco, sin respuestas. Se guarda qué preguntas se dieron.
  r.get('/academia/:programa/:n/examen', auth, h(async (req, res) => {
    const { p, n, m } = await prepararModulo(req);
    const banco = Array.isArray(m.examen?.preguntas) ? m.examen.preguntas : [];
    if (!banco.length) throw noEncontrado('Este módulo todavía no tiene examen.');
    const ref = intentoRef(req.usuario.uid, p.id, n);
    const previo = (await ref.get()).data();
    if (previo?.calificado && previo.aprobado === false && !req.usuario.esAdmin) {
      const restante = Date.parse(previo.fecha) + ESPERA_REINTENTO_MS - ctx.now().getTime();
      if (restante > 0) {
        const min = Math.ceil(restante / 60000);
        throw new HttpError(429, 'espera_examen', `Repasa las explicaciones y vuelve a intentarlo en ${min} minuto${min === 1 ? '' : 's'}.`);
      }
    }
    const elegidas = barajar(banco).slice(0, Math.min(m.examen.mostrar ?? 10, banco.length));
    await ref.set({
      uid: req.usuario.uid, programa: p.id, modulo: n, emitido: ctx.now().toISOString(), ids: elegidas.map((q) => q.id), calificado: false,
    }, { merge: true });
    res.json({ aprobar: m.examen.aprobar ?? 70, preguntas: elegidas.map((q) => ({ id: q.id, q: q.q, opciones: q.opciones })) });
  }));

  // Califica el examen emitido. Solo se aceptan las preguntas que se entregaron en el último GET.
  r.post('/academia/:programa/:n/examen', auth, h(async (req, res) => {
    const { p, n, m } = await prepararModulo(req);
    const { respuestas } = cuerpo(req);
    if (!esObjeto(respuestas)) throw invalido('"respuestas" debe ser un objeto { idPregunta: indiceOpcion }.');
    const uid = req.usuario.uid;
    const nombre = await nombreVisible(ctx, req.usuario);
    const ahora = ctx.now();
    const ahoraISO = ahora.toISOString();
    const refIntento = intentoRef(uid, p.id, n);
    const progRef = progresoRef(uid);

    const resultado = await db.runTransaction(async (tx) => {
      // --- Lecturas (Firestore exige leer todo antes de escribir) ---
      const intento = (await tx.get(refIntento)).data();
      if (!intento || intento.calificado) throw new HttpError(409, 'examen_no_emitido', 'Inicia el examen de nuevo para recibir preguntas.');
      const banco = new Map((m.examen?.preguntas ?? []).map((q) => [q.id, q]));
      const detalle = (intento.ids ?? []).map((id) => {
        const q = banco.get(id);
        if (!q) throw new HttpError(409, 'examen_desactualizado', 'El examen cambió; inícialo de nuevo.');
        const v = respuestas[id];
        if (v !== null && v !== undefined && !Number.isInteger(v)) throw invalido(`La respuesta de ${id} debe ser el índice de la opción.`);
        return { id, correcta: q.correcta, acertada: v === q.correcta, explicacion: q.explicacion ?? '' };
      });
      if (!detalle.length) throw new HttpError(409, 'examen_no_emitido', 'Inicia el examen de nuevo para recibir preguntas.');
      const correctas = detalle.filter((d) => d.acertada).length;
      const total = detalle.length;
      const porcentaje = Math.round((correctas / total) * 100);
      const ok = correctas / total >= APROBATORIO_ACADEMIA;

      const prog = (await tx.get(progRef)).data() ?? { programas: {} };
      const previoProg = prog.programas?.[p.id] ?? {};
      const previo = previoProg.modulos?.[String(n)] ?? {};
      const mejor = Math.max(previo.mejor ?? 0, porcentaje);
      const yaAprobado = previo.aprobado === true || ok;
      // El programa queda completo cuando todos sus módulos del catálogo están aprobados.
      const completo = p.modulos.every((mm) => (mm.n === n ? yaAprobado : aprobado(prog, p.id, mm.n)));

      let certificado = null;
      let nuevo = false;
      const escrituras = [];
      if (completo) {
        // Idempotencia: el folio emitido queda anotado en el avance del programa.
        if (previoProg.certificado) {
          const certSnap = await tx.get(db.collection(COL.academiaCertificados).doc(previoProg.certificado));
          if (certSnap.exists) certificado = certSnap.data();
        }
        if (!certificado) {
          const anio = ahora.getUTCFullYear();
          // Mismo contador que los certificados de curso: un solo espacio de folios verificable.
          const contRef = db.collection(COL.contadores).doc(`certificados-${anio}`);
          const contSnap = await tx.get(contRef);
          let consecutivo = Number(contSnap.exists ? contSnap.data().ultimo : 0) || 0;
          let folio = null;
          for (let intentoFolio = 0; intentoFolio < 50 && !folio; intentoFolio++) {
            consecutivo += 1;
            const candidato = formatearFolio(anio, consecutivo);
            const [deCurso, deAcademia] = await Promise.all([
              tx.get(db.collection(COL.certificados).doc(candidato)),
              tx.get(db.collection(COL.academiaCertificados).doc(candidato)),
            ]);
            if (!deCurso.exists && !deAcademia.exists) folio = candidato;
          }
          if (!folio) throw new HttpError(500, 'folio_no_disponible', 'No se pudo asignar un folio de certificado. Avisa a soporte.');
          certificado = {
            folio,
            tipo: 'academia',
            uid,
            nombre,
            programaId: p.id,
            programaTitulo: p.titulo ?? '',
            area: p.area ?? '',
            modulos: p.modulos.length,
            emitido: ahoraISO,
          };
          nuevo = true;
          escrituras.push(() => tx.set(contRef, { ultimo: consecutivo, actualizado: ahoraISO }));
          escrituras.push(() => tx.create(db.collection(COL.academiaCertificados).doc(folio), certificado));
        }
      }

      // --- Escrituras ---
      tx.set(refIntento, {
        calificado: true, correctas, total, porcentaje, aprobado: ok, fecha: ahoraISO, intentos: (intento.intentos ?? 0) + 1,
      }, { merge: true });
      tx.set(progRef, {
        uid,
        actualizado: ahoraISO,
        programas: {
          [p.id]: {
            ...(certificado ? { certificado: certificado.folio } : {}),
            modulos: {
              [String(n)]: {
                mejor,
                intentos: (previo.intentos ?? 0) + 1,
                aprobado: yaAprobado,
                ...(ok && !previo.aprobado ? { aprobadoEn: ahoraISO } : {}),
              },
            },
          },
        },
      }, { merge: true });
      escrituras.forEach((escribir) => escribir());
      return { correctas, total, porcentaje, aprobado: ok, mejor, detalle, completo, certificado, nuevo };
    });

    const ultimo = Math.max(...p.modulos.map((x) => x.n));
    const { completo, certificado, nuevo, ...resto } = resultado;
    res.json({
      ...resto,
      siguiente: resultado.aprobado && n < ultimo ? n + 1 : null,
      programaCompleto: completo,
      ...(certificado ? { certificado: { ...certificadoAcademiaPublico(certificado), nuevo } } : {}),
    });
  }));

  return r;
}
