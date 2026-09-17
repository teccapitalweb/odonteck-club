// Rutas de miembro (requieren Firebase ID token).
import express from 'express';
import {
  claseDesbloqueada,
  cursoCompleto,
  numerosDeClase,
  tieneAccesoAClase,
} from '../lib/acceso.js';
import { firmarEmbedBunny } from '../lib/bunny.js';
import { HttpError, conflicto, invalido, noConfigurado, noEncontrado } from '../lib/errores.js';
import { aMillis } from '../lib/fechas.js';
import { formatearFolio } from '../lib/folio.js';
import {
  LIMITES,
  booleano,
  cuerpo,
  entero,
  esObjeto,
  idDocumento,
  sinIndefinidos,
  slug,
  texto,
  textoRequerido,
} from '../lib/validacion.js';
import {
  COL,
  cursoPublico,
  estadoMembresia,
  leerConfig,
  leerDoc,
  nombreVisible,
  perfilConDefectos,
  progresoPublico,
} from '../datos.js';
import { requireAuth } from '../middleware/auth.js';
import { h } from '../middleware/errores.js';

const MAX_HISTORIAL = 500;
const APROBATORIO = 0.7;
const WHATSAPP = /^\+?[\d\s().-]{7,20}$/;

const requiereVip = (mensaje = 'Esta función es exclusiva para miembros VIP.') => new HttpError(403, 'requiere_vip', mensaje);

export function rutasMiembro(ctx) {
  const r = express.Router();
  const auth = requireAuth(ctx);
  const { db } = ctx;

  // ---------- Perfil ----------
  r.get('/me', auth, h(async (req, res) => {
    const u = req.usuario;
    const [estado, perfil] = await Promise.all([estadoMembresia(ctx, u), leerDoc(db, COL.perfiles, u.uid)]);
    res.json({
      uid: u.uid,
      email: u.email,
      esVip: estado.esVip,
      esAdmin: u.esAdmin,
      plan: estado.plan,
      vence: estado.vence,
      perfil: perfilConDefectos(perfil, estado.miembro, u),
    });
  }));

  r.patch('/me/perfil', auth, h(async (req, res) => {
    const u = req.usuario;
    const b = cuerpo(req);
    const cambios = sinIndefinidos({
      nombre: texto(b.nombre, { campo: 'nombre', max: LIMITES.nombre }),
      whatsapp: texto(b.whatsapp, { campo: 'whatsapp', max: 20 }),
      especialidad: texto(b.especialidad, { campo: 'especialidad', max: LIMITES.nombre }),
      ciudad: texto(b.ciudad, { campo: 'ciudad', max: LIMITES.nombre }),
    });
    if (cambios.whatsapp && !WHATSAPP.test(cambios.whatsapp)) throw invalido('El WhatsApp debe ser un número de teléfono (7 a 20 dígitos).');
    if (b.avisos !== undefined) {
      if (!esObjeto(b.avisos)) throw invalido('"avisos" debe ser un objeto { enVivo, nuevos, comunidad }.');
      const avisos = sinIndefinidos({
        enVivo: booleano(b.avisos.enVivo, { campo: 'avisos.enVivo' }),
        nuevos: booleano(b.avisos.nuevos, { campo: 'avisos.nuevos' }),
        comunidad: booleano(b.avisos.comunidad, { campo: 'avisos.comunidad' }),
      });
      cambios.avisos = avisos;
    }
    const [actual, miembro] = await Promise.all([leerDoc(db, COL.perfiles, u.uid), leerDoc(db, COL.miembros, u.uid)]);
    const base = perfilConDefectos(actual, miembro, u);
    const perfil = {
      ...base,
      ...cambios,
      avisos: { ...base.avisos, ...(cambios.avisos ?? {}) },
      actualizado: ctx.now().toISOString(),
    };
    await db.collection(COL.perfiles).doc(u.uid).set(perfil);
    res.json(perfil);
  }));

  // ---------- Catálogo ----------
  r.get('/catalogo', auth, h(async (req, res) => {
    const u = req.usuario;
    const [cursosSnap, materialesSnap, eventosSnap, config, estado] = await Promise.all([
      db.collection(COL.cursos).get(),
      db.collection(COL.materiales).get(),
      db.collection(COL.eventos).get(),
      leerConfig(db),
      estadoMembresia(ctx, u),
    ]);

    const cursos = cursosSnap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((c) => c.publicado === true)
      .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
      .map(cursoPublico);

    const materiales = materialesSnap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((m) => m.estado !== 'oculto')
      .sort((a, b) => String(a.titulo ?? '').localeCompare(String(b.titulo ?? ''), 'es'));

    const eventos = eventosSnap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((e) => e.publicado === true)
      .sort((a, b) => (aMillis(a.fecha) ?? 0) - (aMillis(b.fecha) ?? 0))
      .map(({ reservas = [], enlace, ...e }) => ({
        ...e,
        // Sin la lista de uids de otros miembros: solo el conteo y si yo reservé.
        reservas: Array.isArray(reservas) ? reservas.length : 0,
        reservado: Array.isArray(reservas) && reservas.includes(u.uid),
        enlace: estado.esVip ? (enlace ?? null) : null,
      }));

    res.json({
      cursos,
      materiales,
      eventos,
      config: {
        precios: config.precios,
        descuentoVIP: config.descuentoVIP,
        whatsappSoporte: config.whatsappSoporte,
        canalWhatsApp: estado.esVip ? config.canalWhatsApp : '',
        praxiaUrl: config.praxiaUrl,
      },
    });
  }));

  // ---------- Progreso ----------
  r.get('/progreso', auth, h(async (req, res) => {
    const snap = await db.collection(COL.progreso).where('uid', '==', req.usuario.uid).get();
    const salida = {};
    for (const d of snap.docs) {
      const p = d.data();
      if (p.cursoId) salida[p.cursoId] = progresoPublico(p);
    }
    res.json(salida);
  }));

  /** Carga curso + clase y verifica acceso (VIP o gratis) y, opcionalmente, desbloqueo secuencial. */
  async function prepararClase(req, cursoId, nCrudo, { exigirDesbloqueo = true } = {}) {
    const u = req.usuario;
    idDocumento(cursoId, 'cursoId');
    const n = entero(nCrudo, { campo: 'n', min: 1, max: 999 });
    const curso = await leerDoc(db, COL.cursos, cursoId);
    if (!curso || (curso.publicado !== true && !u.esAdmin)) throw new HttpError(404, 'curso_no_encontrado', 'Ese curso no existe o no está publicado.');
    const clase = (curso.clases ?? []).find((c) => Number(c.n) === n);
    if (!clase) throw new HttpError(404, 'clase_no_encontrada', 'Esa clase no existe en el curso.');
    const estado = await estadoMembresia(ctx, u);
    if (!tieneAccesoAClase(clase, estado.esVip)) {
      throw requiereVip('Esta clase es exclusiva para miembros VIP. Hazte VIP para continuar.');
    }
    const progRef = db.collection(COL.progreso).doc(`${u.uid}_${cursoId}`);
    const progSnap = await progRef.get();
    const progreso = progSnap.exists ? progSnap.data() : null;
    if (exigirDesbloqueo) verificarDesbloqueo(u, curso, n, progreso);
    return { u, n, curso: { id: cursoId, ...curso }, clase, estado, progRef, progreso };
  }

  function verificarDesbloqueo(u, curso, n, progreso) {
    // Los admins revisan cursos completos sin tener que verlos en orden.
    if (u.esAdmin) return;
    if (!claseDesbloqueada(curso, n, progreso?.vistas ?? [])) {
      const numeros = numerosDeClase(curso);
      const anterior = numeros[numeros.indexOf(n) - 1];
      throw new HttpError(403, 'clase_bloqueada', `Primero termina la clase ${anterior}.`, { requiere: anterior });
    }
  }

  r.post('/progreso/:cursoId/abrir', auth, h(async (req, res) => {
    const { u, n, curso, progRef, progreso } = await prepararClase(req, req.params.cursoId, cuerpo(req).n);
    const ahora = ctx.now().toISOString();
    const nuevo = {
      uid: u.uid,
      cursoId: curso.id,
      vistas: progreso?.vistas ?? [],
      ultima: n,
      historial: progreso?.historial ?? [],
      actualizado: ahora,
    };
    await progRef.set(nuevo, { merge: true });
    res.json(progresoPublico(nuevo));
  }));

  r.post('/progreso/:cursoId/vista', auth, h(async (req, res) => {
    const { u, n, curso, progRef } = await prepararClase(req, req.params.cursoId, cuerpo(req).n, { exigirDesbloqueo: false });
    const nombre = await nombreVisible(ctx, u);
    const ahora = ctx.now();
    const ahoraISO = ahora.toISOString();

    const resultado = await db.runTransaction(async (tx) => {
      // --- Lecturas (Firestore exige leer todo antes de escribir) ---
      const progSnap = await tx.get(progRef);
      const previo = progSnap.exists ? progSnap.data() : null;
      verificarDesbloqueo(u, curso, n, previo);

      const vistasPrevias = Array.isArray(previo?.vistas) ? previo.vistas.map(Number) : [];
      const yaVista = vistasPrevias.includes(n);
      const vistas = yaVista ? vistasPrevias : [...vistasPrevias, n].sort((a, b) => a - b);
      let historial = Array.isArray(previo?.historial) ? previo.historial : [];
      if (!yaVista) historial = [...historial, ahoraISO].slice(-MAX_HISTORIAL);

      const progreso = {
        uid: u.uid,
        cursoId: curso.id,
        vistas,
        ultima: n,
        historial,
        actualizado: ahoraISO,
      };

      let certificado = null;
      const escrituras = [];
      if (cursoCompleto(curso, vistas)) {
        // Idempotencia: el folio emitido queda anotado en el progreso de (uid, curso).
        if (previo?.certificado) {
          const certSnap = await tx.get(db.collection(COL.certificados).doc(previo.certificado));
          if (certSnap.exists) certificado = certSnap.data();
        }
        if (!certificado) {
          const anio = ahora.getUTCFullYear();
          const contRef = db.collection(COL.contadores).doc(`certificados-${anio}`);
          const contSnap = await tx.get(contRef);
          let consecutivo = Number(contSnap.exists ? contSnap.data().ultimo : 0) || 0;
          let folio;
          // Por si alguien creó a mano un certificado con el siguiente folio: se salta.
          for (let intento = 0; intento < 50; intento++) {
            consecutivo += 1;
            folio = formatearFolio(anio, consecutivo);
            const existe = await tx.get(db.collection(COL.certificados).doc(folio));
            if (!existe.exists) break;
            folio = null;
          }
          if (!folio) throw new HttpError(500, 'folio_no_disponible', 'No se pudo asignar un folio de certificado. Avisa a soporte.');
          certificado = {
            folio,
            uid: u.uid,
            nombre,
            cursoId: curso.id,
            cursoTitulo: curso.titulo ?? '',
            area: curso.area ?? '',
            clases: numerosDeClase(curso).length,
            emitido: ahoraISO,
          };
          escrituras.push(() => tx.set(contRef, { ultimo: consecutivo, actualizado: ahoraISO }));
          escrituras.push(() => tx.create(db.collection(COL.certificados).doc(folio), certificado));
        }
        progreso.certificado = certificado.folio;
      } else if (previo?.certificado) {
        progreso.certificado = previo.certificado;
      }

      // --- Escrituras ---
      tx.set(progRef, progreso);
      escrituras.forEach((escribir) => escribir());
      return { progreso, certificado };
    });

    const salida = { progreso: progresoPublico(resultado.progreso) };
    if (resultado.certificado) salida.certificado = resultado.certificado;
    res.json(salida);
  }));

  // ---------- Video ----------
  r.post('/video/token', auth, h(async (req, res) => {
    const b = cuerpo(req);
    const { clase } = await prepararClase(req, b.cursoId, b.n);
    const bunny = ctx.bunny ?? {};
    if (!bunny.libraryId || !bunny.tokenAuthKey) throw noConfigurado('La reproducción de video no está configurada en el servidor.');
    if (!clase.videoId) throw conflicto('Esta clase todavía no tiene video disponible.', 'video_no_disponible');
    const firmado = firmarEmbedBunny({
      libraryId: bunny.libraryId,
      tokenAuthKey: bunny.tokenAuthKey,
      videoId: clase.videoId,
      ttlSeconds: bunny.ttlSeconds,
      ahoraMs: ctx.now().getTime(),
    });
    res.json(firmado);
  }));

  // ---------- Materiales ----------
  r.get('/materiales/:id/descarga', auth, h(async (req, res) => {
    const id = idDocumento(req.params.id);
    const estado = await estadoMembresia(ctx, req.usuario);
    if (!estado.esVip) throw requiereVip('Las descargas son exclusivas para miembros VIP.');
    const material = await leerDoc(db, COL.materiales, id);
    if (!material || material.estado === 'oculto') throw noEncontrado('Ese material no existe.');
    if (material.estado !== 'disponible') throw conflicto('Este material todavía no está disponible.', 'material_no_disponible');
    const archivo = typeof material.archivo === 'string' ? material.archivo : '';
    if (!archivo.startsWith('materiales/') || archivo.includes('..')) {
      throw conflicto('Este material no tiene archivo cargado.', 'sin_archivo');
    }
    if (!ctx.storage) throw noConfigurado('El almacenamiento de archivos no está configurado en el servidor.');
    const [url] = await ctx.storage.bucket(ctx.config.storageBucket || undefined).file(archivo).getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: ctx.now().getTime() + 10 * 60 * 1000,
    });
    res.json({ url });
  }));

  // ---------- Certificados ----------
  r.get('/certificados', auth, h(async (req, res) => {
    const snap = await db.collection(COL.certificados).where('uid', '==', req.usuario.uid).get();
    const lista = snap.docs.map((d) => d.data()).sort((a, b) => String(b.emitido).localeCompare(String(a.emitido)));
    res.json(lista);
  }));

  // ---------- Quizzes ----------
  async function cargarQuiz(req) {
    const { curso, n } = await prepararClase(req, req.params.cursoId, req.params.n, { exigirDesbloqueo: false });
    const quiz = await leerDoc(db, COL.quizzes, `${curso.id}_${n}`);
    const preguntas = Array.isArray(quiz?.preguntas) ? quiz.preguntas : [];
    if (!quiz || quiz.estado !== 'aprobado' || preguntas.length === 0) {
      throw new HttpError(404, 'quiz_no_disponible', 'Esta clase todavía no tiene quiz.');
    }
    return { curso, n, preguntas };
  }

  r.get('/quiz/:cursoId/:n', auth, h(async (req, res) => {
    const { preguntas } = await cargarQuiz(req);
    // Nunca se envían `correcta` ni `explicacion` antes de responder.
    res.json({ preguntas: preguntas.map((p) => ({ q: p.q, opciones: p.opciones })) });
  }));

  r.post('/quiz/:cursoId/:n', auth, h(async (req, res) => {
    const { curso, n, preguntas } = await cargarQuiz(req);
    const { respuestas } = cuerpo(req);
    if (!Array.isArray(respuestas) || respuestas.length !== preguntas.length) {
      throw invalido(`"respuestas" debe ser una lista con ${preguntas.length} elementos.`);
    }
    respuestas.forEach((v, i) => {
      if (v !== null && !Number.isInteger(v)) throw invalido(`"respuestas[${i}]" debe ser el índice de la opción o null.`);
    });
    const detalle = preguntas.map((p, i) => ({
      correcta: p.correcta,
      acertada: respuestas[i] === p.correcta,
      explicacion: p.explicacion ?? '',
    }));
    const correctas = detalle.filter((d) => d.acertada).length;
    const total = preguntas.length;
    const aprobado = correctas / total >= APROBATORIO;
    const u = req.usuario;
    await db.collection(COL.intentos).doc(`${u.uid}_${curso.id}_${n}`).set({
      uid: u.uid,
      cursoId: curso.id,
      n,
      correctas,
      total,
      aprobado,
      fecha: ctx.now().toISOString(),
    });
    res.json({ correctas, total, aprobado, detalle });
  }));

  // ---------- Foro ----------
  const hiloPublico = (hilo, uid) => {
    const { utilPor = [], ...resto } = hilo;
    return { ...resto, marcadoUtil: Array.isArray(utilPor) && utilPor.includes(uid) };
  };

  async function exigirVip(req, mensaje) {
    const estado = await estadoMembresia(ctx, req.usuario);
    if (!estado.esVip) throw requiereVip(mensaje);
    return estado;
  }

  r.get('/foro', auth, h(async (req, res) => {
    let q = db.collection(COL.foro);
    if (req.query.cursoId !== undefined && req.query.cursoId !== '') {
      q = q.where('cursoId', '==', idDocumento(String(req.query.cursoId), 'cursoId'));
    }
    const snap = await q.get();
    const hilos = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((hilo) => hilo.oculto !== true)
      .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)))
      .slice(0, 300)
      .map((hilo) => hiloPublico(hilo, req.usuario.uid));
    res.json(hilos);
  }));

  r.post('/foro', auth, h(async (req, res) => {
    const u = req.usuario;
    const estado = await exigirVip(req, 'Publicar en la comunidad es exclusivo para miembros VIP.');
    const b = cuerpo(req);
    const titulo = textoRequerido(b.titulo, { campo: 'titulo', min: 3, max: LIMITES.tituloHilo });
    const textoHilo = textoRequerido(b.texto, { campo: 'texto', min: 3, max: LIMITES.textoHilo, multilinea: true });
    let cursoId = null;
    if (b.cursoId !== undefined && b.cursoId !== null && b.cursoId !== '') {
      cursoId = slug(b.cursoId, { campo: 'cursoId' });
      const curso = await leerDoc(db, COL.cursos, cursoId);
      if (!curso || curso.publicado !== true) throw invalido('El curso indicado no existe.', 'curso_no_encontrado');
    }
    const ref = db.collection(COL.foro).doc();
    const hilo = {
      id: ref.id,
      titulo,
      texto: textoHilo,
      autorUid: u.uid,
      autor: await nombreVisible(ctx, u, estado.miembro),
      cursoId,
      fecha: ctx.now().toISOString(),
      util: 0,
      utilPor: [],
      respuestas: 0,
      oculto: false,
    };
    await ref.set(hilo);
    res.status(201).json(hiloPublico(hilo, u.uid));
  }));

  r.get('/foro/:id', auth, h(async (req, res) => {
    const id = idDocumento(req.params.id);
    const ref = db.collection(COL.foro).doc(id);
    const snap = await ref.get();
    if (!snap.exists || snap.data().oculto === true) throw noEncontrado('Ese tema no existe.');
    const respSnap = await ref.collection(COL.respuestas).get();
    const respuestas = respSnap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((x) => x.oculto !== true)
      .sort((a, b) => String(a.fecha).localeCompare(String(b.fecha)));
    res.json({ hilo: hiloPublico({ id: snap.id, ...snap.data() }, req.usuario.uid), respuestas });
  }));

  r.post('/foro/:id/respuestas', auth, h(async (req, res) => {
    const u = req.usuario;
    const id = idDocumento(req.params.id);
    const estado = await exigirVip(req, 'Responder en la comunidad es exclusivo para miembros VIP.');
    const textoResp = textoRequerido(cuerpo(req).texto, { campo: 'texto', min: 1, max: LIMITES.textoRespuesta, multilinea: true });
    const autor = await nombreVisible(ctx, u, estado.miembro);
    const hiloRef = db.collection(COL.foro).doc(id);
    const respRef = hiloRef.collection(COL.respuestas).doc();
    const respuesta = { id: respRef.id, autorUid: u.uid, autor, texto: textoResp, fecha: ctx.now().toISOString(), oculto: false };
    await db.runTransaction(async (tx) => {
      const hilo = await tx.get(hiloRef);
      if (!hilo.exists || hilo.data().oculto === true) throw noEncontrado('Ese tema no existe.');
      tx.create(respRef, respuesta);
      tx.update(hiloRef, { respuestas: (Number(hilo.data().respuestas) || 0) + 1 });
    });
    res.status(201).json(respuesta);
  }));

  r.post('/foro/:id/util', auth, h(async (req, res) => {
    const u = req.usuario;
    const id = idDocumento(req.params.id);
    await exigirVip(req, 'Participar en la comunidad es exclusivo para miembros VIP.');
    const hiloRef = db.collection(COL.foro).doc(id);
    const util = await db.runTransaction(async (tx) => {
      const snap = await tx.get(hiloRef);
      if (!snap.exists || snap.data().oculto === true) throw noEncontrado('Ese tema no existe.');
      const hilo = snap.data();
      const utilPor = Array.isArray(hilo.utilPor) ? hilo.utilPor : [];
      if (utilPor.includes(u.uid)) {
        throw new HttpError(409, 'ya_marcado_util', 'Ya marcaste este tema como útil.', { util: utilPor.length });
      }
      const nuevos = [...utilPor, u.uid];
      tx.update(hiloRef, { utilPor: nuevos, util: nuevos.length });
      return nuevos.length;
    });
    res.json({ util });
  }));

  // ---------- Eventos ----------
  r.post('/eventos/:id/reserva', auth, h(async (req, res) => {
    const u = req.usuario;
    const id = idDocumento(req.params.id);
    await exigirVip(req, 'Reservar lugar en eventos es exclusivo para miembros VIP.');
    const ref = db.collection(COL.eventos).doc(id);
    const ahora = ctx.now().getTime();
    const reservado = await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists || snap.data().publicado !== true) throw noEncontrado('Ese evento no existe.');
      const evento = snap.data();
      const reservas = Array.isArray(evento.reservas) ? evento.reservas : [];
      if (reservas.includes(u.uid)) {
        tx.update(ref, { reservas: reservas.filter((x) => x !== u.uid) });
        return false;
      }
      const inicio = aMillis(evento.fecha);
      const fin = (inicio ?? 0) + (Number(evento.duracionMin) || 0) * 60 * 1000;
      if (inicio !== null && !Number.isNaN(inicio) && fin < ahora) {
        throw conflicto('Este evento ya terminó.', 'evento_terminado');
      }
      tx.update(ref, { reservas: [...reservas, u.uid] });
      return true;
    });
    res.json({ reservado });
  }));

  return r;
}
