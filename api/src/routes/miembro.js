// Rutas de miembro (requieren Firebase ID token).
import express from 'express';
import {
  claseDesbloqueada,
  cursoCompleto,
  numerosDeClase,
  tieneAccesoAClase,
} from '../lib/acceso.js';
import { firmarEmbedBunny } from '../lib/bunny.js';
import { MAX_VISTAS_PARA_CAMBIAR, enVentanaDeCambio, estadoCursoGratis, leerCursoGratis } from '../lib/curso-gratis.js';
import { HttpError, conflicto, demasiadasSolicitudes, invalido, noConfigurado, noEncontrado } from '../lib/errores.js';
import { calificarEvaluacion, calificarPregunta, preguntaPublica } from '../lib/evaluaciones.js';
import { DIA_MS, aMillis } from '../lib/fechas.js';
import { formatearFolio } from '../lib/folio.js';
import { ENCUESTAS } from '../lib/encuestas.js';
import { leerCatalogoRecompensas } from '../lib/recompensas-catalogo.js';
import { materialOficialPorId, materialesOficialesComoProximamente } from '../lib/materiales-oficiales.js';
import {
  estadoRetosPublico,
  normalizarEstadoRetos,
  prioridadPregunta,
  refPregunta,
  registrarActividad,
} from '../lib/retos.js';
import {
  canjearRecompensa,
  catalogoRecompensas,
  logrosPublicos,
  materialDesbloqueado,
  normalizarEstadoRecompensas,
  otorgarEventos,
  otorgarEventosTx,
  recompensaDeMaterial,
  registrarEventos,
  REGLAS_PUNTOS,
} from '../lib/recompensas.js';
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
  leerMiembroHeredado,
  nombreVisible,
  perfilConDefectos,
  progresoPublico,
} from '../datos.js';
import { requireAuth } from '../middleware/auth.js';
import { h } from '../middleware/errores.js';

const MAX_HISTORIAL = 500;
const MAX_HISTORIAL_QUIZ = 10;
const MAX_BYTES_RESPUESTAS_QUIZ = 20_000;
const APROBATORIO = 0.7;
const TIPOS_JUEGO_CLASE = new Set(['rompecabezas', 'sopa', 'ahorcado', 'memorama', 'palabra']);
const WHATSAPP = /^\+?[\d\s().-]{7,20}$/;
const INTERESES_VALIDOS = new Set(ENCUESTAS.bienvenida.preguntas.find((p) => p.id === 'intereses').opciones.map((o) => o.valor));

const requiereVip = (mensaje = 'Esta función es exclusiva para miembros VIP.') => new HttpError(403, 'requiere_vip', mensaje);

export function rutasMiembro(ctx) {
  const r = express.Router();
  const auth = requireAuth(ctx);
  const { db } = ctx;

  async function sincronizarRecompensas(usuario) {
    const [progresoSnap, intentosSnap, respuestasSnap, foroSnap, juegosSnap, retos, actual, membresia] = await Promise.all([
      db.collection(COL.progreso).where('uid', '==', usuario.uid).get(),
      db.collection(COL.intentos).where('uid', '==', usuario.uid).get(),
      db.collection(COL.encuestasRespuestas).where('uid', '==', usuario.uid).get(),
      db.collection(COL.foro).where('autorUid', '==', usuario.uid).get(),
      db.collection(COL.juegosClase).where('uid', '==', usuario.uid).get(),
      leerDoc(db, COL.retosEstado, usuario.uid),
      leerDoc(db, COL.recompensasEstado, usuario.uid),
      estadoMembresia(ctx, usuario),
    ]);
    const estadoActual = normalizarEstadoRecompensas(actual, usuario.uid);
    const eventos = [];
    progresoSnap.docs.forEach((doc) => {
      const p = doc.data();
      (Array.isArray(p.vistas) ? p.vistas : []).forEach((n) => eventos.push({
        clave: `clase:${p.cursoId}:${Number(n)}`,
        tipo: 'clase', puntos: REGLAS_PUNTOS.clase, contador: 'clases', detalle: `Clase ${Number(n)} completada`,
      }));
      if (p.certificado) eventos.push({
        clave: `curso:${p.cursoId}`, tipo: 'curso', puntos: REGLAS_PUNTOS.curso, contador: 'cursos', detalle: 'Curso completado',
      });
    });
    intentosSnap.docs.forEach((doc) => {
      const intento = doc.data();
      if (intento.aprobadoAlgunaVez || intento.aprobado) eventos.push({
        clave: `quiz:${intento.cursoId}:${intento.n}`, tipo: 'quiz', puntos: REGLAS_PUNTOS.quiz, contador: 'quizzes', detalle: 'Evaluación aprobada',
      });
    });
    respuestasSnap.docs.forEach((doc) => {
      const respuesta = doc.data();
      const puntos = respuesta.tipo === 'bienvenida' ? REGLAS_PUNTOS.encuestaBienvenida : respuesta.tipo === 'curso' ? REGLAS_PUNTOS.encuestaCurso : REGLAS_PUNTOS.encuestaExperiencia;
      eventos.push({ clave: `encuesta:${respuesta.clave}`, tipo: 'encuesta', puntos, contador: 'encuestas', detalle: 'Encuesta respondida' });
    });
    foroSnap.docs.forEach((doc) => eventos.push({
      clave: `tema:${doc.id}`, tipo: 'comunidad', puntos: REGLAS_PUNTOS.temaComunidad, contador: 'temas', detalle: 'Tema publicado en Comunidad',
    }));
    juegosSnap.docs.forEach((doc) => {
      const juego = doc.data();
      eventos.push({
        clave: `juego-clase:${juego.cursoId}:${Number(juego.n)}`,
        tipo: 'juego-clase', puntos: REGLAS_PUNTOS.juegoClase, contador: 'juegosClase', detalle: `Repaso completado: clase ${Number(juego.n)}`,
      });
    });
    if (membresia.membresiaPagada && !estadoActual.contadores.membresias) {
      eventos.push({
        clave: 'membresia:historica:v1',
        tipo: 'membresia',
        puntos: REGLAS_PUNTOS.membresia,
        contador: 'membresias',
        detalle: 'Membresía activa reconocida del club anterior',
      });
    }
    if (!estadoActual.contadores.retosMigrados && Number(retos?.xp) > 0) {
      const xp = Math.min(5000, Math.max(0, Math.round(Number(retos.xp))));
      eventos.push({ clave: 'retos:historico:v1', tipo: 'reto', puntos: xp, contador: 'puntosRetos', delta: xp, detalle: 'XP anterior de Retos migrado' });
    }
    if (!estadoActual.contadores.retosMigrados) {
      eventos.push({ clave: 'retos:migracion:v1', tipo: 'sistema', puntos: 0, contador: 'retosMigrados', detalle: 'Migración de Retos completada' });
    }
    if (!eventos.length) return { estado: estadoActual, membresia };
    const { estado } = await registrarEventos(ctx, COL, usuario.uid, eventos);
    return { estado: normalizarEstadoRecompensas(estado, usuario.uid), membresia };
  }

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
    const [actual, miembro] = await Promise.all([leerDoc(db, COL.perfiles, u.uid), leerMiembroHeredado(ctx, u)]);
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

  r.patch('/me/intereses', auth, h(async (req, res) => {
    const u = req.usuario;
    const intereses = cuerpo(req).intereses;
    if (!Array.isArray(intereses) || intereses.length < 1 || intereses.length > 3) {
      throw invalido('"intereses" debe incluir entre 1 y 3 opciones.');
    }
    if (intereses.some((valor) => typeof valor !== 'string' || !INTERESES_VALIDOS.has(valor))) {
      throw invalido('"intereses" contiene una opción no válida.');
    }
    if (new Set(intereses).size !== intereses.length) throw invalido('"intereses" no debe contener opciones repetidas.');

    const [actual, miembro] = await Promise.all([leerDoc(db, COL.perfiles, u.uid), leerMiembroHeredado(ctx, u)]);
    const base = perfilConDefectos(actual, miembro, u);
    const perfil = { ...base, intereses: [...intereses], actualizado: ctx.now().toISOString() };
    await db.collection(COL.perfiles).doc(u.uid).set(perfil);
    res.json({ intereses: perfil.intereses });
  }));

  // ---------- Puntos, logros y recompensas ----------
  r.get('/recompensas/resumen', auth, h(async (req, res) => {
    const [{ estado, membresia }, materialesSnap, catalogo, canjesSnap] = await Promise.all([
      sincronizarRecompensas(req.usuario),
      db.collection(COL.materiales).get(),
      leerCatalogoRecompensas(db),
      db.collection(COL.recompensasCanjes).where('uid','==',req.usuario.uid).get(),
    ]);
    // Después de sincronizar, para que aparezcan los movimientos que se acaban de otorgar.
    const movimientosSnap = await db.collection(COL.recompensasMovimientos).where('uid', '==', req.usuario.uid).get();
    const materialesDisponibles = new Set(materialesSnap.docs
      .filter((doc) => doc.data().estado === 'disponible' && typeof doc.data().archivo === 'string' && doc.data().archivo)
      .map((doc) => doc.id));
    for (const id of ctx.materiales?.ids?.() ?? []) materialesDisponibles.add(id);
    const movimientos = movimientosSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha))).slice(0, 25);
    res.json({
      saldo: estado.saldo,
      ganados: estado.ganados,
      gastados: estado.gastados,
      contadores: estado.contadores,
      logros: logrosPublicos(estado),
      moneda: { nombre: 'OdonCoins', simbolo: 'OC', equivalenciaPunto: 1 },
      recompensas: catalogoRecompensas(estado, membresia.esVip, materialesDisponibles, catalogo, canjesSnap.docs.map(d=>d.data())),
      personalizacion: estado.personalizacion,
      canjes: canjesSnap.docs.map(d=>{const c=d.data();return {id:d.id,recompensaId:c.recompensaId,titulo:c.titulo,puntos:c.puntos,estatus:c.estatus,solicitado:c.solicitado,nota:c.nota??null,plazo:c.plazo??null};}).sort((a,b)=>String(b.solicitado).localeCompare(String(a.solicitado))),
      movimientos,
      notificaciones: estado.notificaciones.filter((n) => n.leida !== true),
      actualizado: estado.actualizado,
    });
  }));

  r.post('/recompensas/canjear', auth, h(async (req, res) => {
    const { membresia } = await sincronizarRecompensas(req.usuario);
    const recompensaId = slug(cuerpo(req).recompensaId, { campo: 'recompensaId' });
    const precioEsperado=cuerpo(req).precioEsperado;
    if(precioEsperado!==undefined&&(!Number.isInteger(precioEsperado)||precioEsperado<1))throw invalido('El importe de confirmación no es válido.');
    const resultado = await canjearRecompensa(ctx, COL, req.usuario, recompensaId, membresia.esVip, precioEsperado);
    res.status(201).json({
      saldo: resultado.estado.saldo,
      recompensa: resultado.recompensa,
      notificacion: resultado.notificacion,
    });
  }));

  r.post('/recompensas/notificaciones/leidas', auth, h(async (req, res) => {
    const ref = db.collection(COL.recompensasEstado).doc(req.usuario.uid);
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) return;
      const estado = normalizarEstadoRecompensas(snap.data(), req.usuario.uid);
      estado.notificaciones = estado.notificaciones.map((n) => ({ ...n, leida: true }));
      estado.actualizado = ctx.now().toISOString();
      tx.set(ref, estado);
    });
    res.json({ ok: true });
  }));

  // ---------- Catálogo ----------
  r.get('/catalogo', auth, h(async (req, res) => {
    const u = req.usuario;
    const [cursosSnap, materialesSnap, eventosSnap, config, estado, recompensasEstado] = await Promise.all([
      db.collection(COL.cursos).get(),
      db.collection(COL.materiales).get(),
      db.collection(COL.eventos).get(),
      leerConfig(db),
      estadoMembresia(ctx, u),
      leerDoc(db, COL.recompensasEstado, u.uid),
    ]);

    const cursos = cursosSnap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((c) => c.publicado === true)
      .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
      .map(cursoPublico);

    // Catálogo de materiales = lote oficial + lo que haya en Firestore.
    // Garantiza que la biblioteca nunca aparezca vacía para los miembros.
    //
    // Dedupe por id: construye el set contra TODOS los docs de Firestore
    // (incluyendo ocultos) para respetar la decisión del admin — si un admin
    // ocultó deliberadamente un material oficial, no se reintroduce desde el
    // fallback. Firestore gana en los visibles; los oficiales que no están en
    // Firestore (de ninguna forma) aparecen como "proximamente".
    const todosFirestore = materialesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const idsEnFirestore = new Set(todosFirestore.map((m) => m.id));
    const docsVisibles = todosFirestore.filter((m) => m.estado !== 'oculto');
    const oficialesFaltantes = materialesOficialesComoProximamente()
      .filter((m) => !idsEnFirestore.has(m.id));
    for (const material of oficialesFaltantes) {
      if (ctx.materiales?.tiene(material.id)) {
        material.estado = 'disponible';
        material.archivo = `materiales/${material.id}.pdf`;
      }
    }
    const materiales = [...docsVisibles, ...oficialesFaltantes]
      .sort((a, b) => String(a.titulo ?? '').localeCompare(String(b.titulo ?? ''), 'es'))
      .map((material) => {
        const recompensa = recompensaDeMaterial(material.id);
        return {
          ...material,
          desbloqueadoConPuntos: materialDesbloqueado(recompensasEstado, material.id),
          puntosRequeridos: recompensa?.puntos ?? null,
        };
      });

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

  // ── «Escoge tu curso gratis» ──
  r.get('/curso-gratis', auth, h(async (req, res) => {
    const estado = await estadoMembresia(ctx, req.usuario);
    const eleccion = await leerCursoGratis(ctx, req.usuario.uid);
    res.json({ ...(await estadoCursoGratis(ctx, req.usuario.uid, eleccion)), esVip: estado.esVip === true });
  }));

  r.post('/curso-gratis', auth, h(async (req, res) => {
    const uid = req.usuario.uid;
    const cursoId = idDocumento(String(cuerpo(req).cursoId ?? ''), 'cursoId');
    const estado = await estadoMembresia(ctx, req.usuario);
    if (estado.esVip) throw conflicto('Como miembro VIP ya tienes todos los cursos abiertos.', 'es_vip');
    const curso = await leerDoc(db, COL.cursos, cursoId);
    if (!curso || curso.publicado !== true) throw noEncontrado('Ese curso no existe o no está publicado.');
    if (numerosDeClase(curso).length < 2) throw conflicto('Ese curso todavía no tiene clases suficientes para elegirlo.', 'curso_incompleto');
    const ref = db.collection(COL.cursoGratis).doc(uid);
    await leerCursoGratis(ctx, uid); // aplica la migración perezosa antes de decidir
    const ahora = ctx.now();
    let datos;
    let mismo = false;
    // Transacción: dos peticiones simultáneas no pueden gastar el cambio único dos veces.
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const previa = snap.exists ? snap.data() : null;
      if (!previa?.cursoId) {
        datos = { uid, cursoId, origen: 'eleccion', elegido: ahora.toISOString(), cambios: 0, maxAbierta: 0 };
      } else if (previa.cursoId === cursoId) {
        datos = previa; mismo = true; return;
      } else {
        const prog = await tx.get(db.collection(COL.progreso).doc(`${uid}_${previa.cursoId}`));
        const vistas = prog.exists ? (prog.data().vistas ?? []).length : 0;
        if (!enVentanaDeCambio(previa, ahora.getTime()) || vistas > MAX_VISTAS_PARA_CAMBIAR) {
          throw conflicto('Tu curso gratis ya está definido. Hazte VIP para abrir todos los cursos.', 'eleccion_definitiva');
        }
        datos = { ...previa, cursoId, cambios: 1, anterior: previa.cursoId, cambiadoEn: ahora.toISOString(), maxAbierta: 0 };
      }
      tx.set(ref, datos);
    });
    res.status(mismo ? 200 : 201).json({ ...(await estadoCursoGratis(ctx, uid, datos)), esVip: false });
  }));

  /** Carga curso + clase y verifica acceso (VIP o gratis) y, opcionalmente, desbloqueo secuencial. */
  async function prepararClase(req, cursoId, nCrudo, { exigirDesbloqueo = true, conQuiz = false } = {}) {
    const u = req.usuario;
    idDocumento(cursoId, 'cursoId');
    const n = entero(nCrudo, { campo: 'n', min: 1, max: 999 });
    const progRef = db.collection(COL.progreso).doc(`${u.uid}_${cursoId}`);
    // Se lanzan a la vez pero se esperan en el orden de validación: un fallo secundario no tapa un 404 o 403.
    const cursoP = leerDoc(db, COL.cursos, cursoId);
    const estadoP = estadoMembresia(ctx, u);
    const progP = exigirDesbloqueo ? progRef.get() : null;
    const quizP = conQuiz ? leerDoc(db, COL.quizzes, `${cursoId}_${n}`) : null;
    for (const p of [estadoP, progP, quizP]) p?.catch(() => {});
    const curso = await cursoP;
    if (!curso || (curso.publicado !== true && !u.esAdmin)) throw new HttpError(404, 'curso_no_encontrado', 'Ese curso no existe o no está publicado.');
    const clase = (curso.clases ?? []).find((c) => Number(c.n) === n);
    if (!clase) throw new HttpError(404, 'clase_no_encontrada', 'Esa clase no existe en el curso.');
    const estado = await estadoP;
    if (!estado.esVip) {
      await leerCursoGratis(ctx, u.uid); // migración perezosa, si aplica
      // Acceso y registro de lo abierto en la MISMA transacción que usa el cambio de curso:
      // si el miembro cambia de curso a la vez, una de las dos operaciones ve a la otra y
      // no puede abrir el curso anterior ni cambiarse tras haberlo aprovechado.
      const gratisRef = db.collection(COL.cursoGratis).doc(u.uid);
      const elegido = await db.runTransaction(async (tx) => {
        const snap = await tx.get(gratisRef);
        const actual = snap.exists ? snap.data() : null;
        if (tieneAccesoAClase(curso, cursoId, n, false, actual?.cursoId) && n > (actual.maxAbierta ?? 0)) tx.update(gratisRef, { maxAbierta: n });
        return actual?.cursoId ?? null;
      });
      if (!tieneAccesoAClase(curso, cursoId, n, false, elegido)) {
        throw requiereVip(elegido === cursoId
          ? 'La última clase de tu curso gratis es para miembros VIP. Hazte VIP para terminarlo y obtener tu certificado.'
          : 'Este curso es para miembros VIP. Tu curso gratis es el que elegiste; hazte VIP para abrir todos.');
      }
    }
    const progSnap = await progP;
    const progreso = progSnap?.exists ? progSnap.data() : null;
    if (exigirDesbloqueo) verificarDesbloqueo(u, curso, n, progreso);
    const quiz = await quizP;
    return { u, n, curso: { id: cursoId, ...curso }, clase, estado, progRef, progreso, quiz };
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

      const eventosRecompensa = [];
      if (!yaVista) eventosRecompensa.push({
        clave: `clase:${curso.id}:${n}`,
        tipo: 'clase',
        puntos: REGLAS_PUNTOS.clase,
        contador: 'clases',
        detalle: `Clase completada: ${curso.titulo}, clase ${n}`,
      });
      if (cursoCompleto(curso, vistas)) eventosRecompensa.push({
        clave: `curso:${curso.id}`,
        tipo: 'curso',
        puntos: REGLAS_PUNTOS.curso,
        contador: 'cursos',
        detalle: `Curso completado: ${curso.titulo}`,
      });
      const recompensas = await otorgarEventosTx({
        tx,
        db,
        colecciones: COL,
        uid: u.uid,
        eventos: eventosRecompensa,
        ahora,
      });

      // --- Escrituras ---
      tx.set(progRef, progreso);
      escrituras.forEach((escribir) => escribir());
      return { progreso, certificado, recompensas };
    });

    const salida = { progreso: progresoPublico(resultado.progreso), recompensas: resultado.recompensas };
    if (resultado.certificado) salida.certificado = resultado.certificado;
    res.json(salida);
  }));

  // ---------- Juegos breves de repaso por clase ----------
  r.get('/notas-clase/:cursoId/:n', auth, h(async (req, res) => {
    const { u, n, curso } = await prepararClase(req, req.params.cursoId, req.params.n);
    const ref = db.collection(COL.notasClase).doc(`${u.uid}_${curso.id}_${n}`);
    const snap = await ref.get();
    const datos = snap.exists ? snap.data() : {};
    res.json({
      repasados: Array.isArray(datos.repasados) ? datos.repasados : [],
      bitacora: typeof datos.bitacora === 'string' ? datos.bitacora : '',
      actualizado: typeof datos.actualizado === 'string' ? datos.actualizado : null,
    });
  }));

  r.put('/notas-clase/:cursoId/:n', auth, h(async (req, res) => {
    const { u, n, curso, clase } = await prepararClase(req, req.params.cursoId, req.params.n);
    const b = cuerpo(req);
    if (!Array.isArray(b.repasados)) throw invalido('La lista de conceptos repasados no es válida.');
    const total = Array.isArray(clase.notas?.conceptos) ? clase.notas.conceptos.length : 0;
    const repasados = [...new Set(b.repasados.map((valor) => entero(valor, { campo: 'repasado', min: 0, max: Math.max(0, total - 1) })))].sort((a, z) => a - z);
    if (repasados.some((indice) => indice >= total)) throw invalido('El concepto repasado no existe en esta clase.');
    const bitacora = texto(b.bitacora, { campo: 'bitacora', max: 1800, multilinea: true }) || '';
    const actualizado = ctx.now().toISOString();
    const ref = db.collection(COL.notasClase).doc(`${u.uid}_${curso.id}_${n}`);
    if (!repasados.length && !bitacora) await ref.delete();
    else await ref.set({ uid: u.uid, cursoId: curso.id, n, repasados, bitacora, actualizado });
    res.json({ repasados, bitacora, actualizado });
  }));

  // ---------- Juegos breves de repaso por clase ----------
  r.get('/juegos-clase', auth, h(async (req, res) => {
    const snap = await db.collection(COL.juegosClase).where('uid', '==', req.usuario.uid).get();
    res.json(snap.docs.map((doc) => {
      const { uid: _uid, ...juego } = doc.data();
      return juego;
    }));
  }));

  r.post('/juegos-clase/:cursoId/:n', auth, h(async (req, res) => {
    const { u, n, curso, progRef } = await prepararClase(req, req.params.cursoId, req.params.n);
    const { tipo, puntaje: puntajeEntrada } = cuerpo(req);
    if (!TIPOS_JUEGO_CLASE.has(tipo)) throw invalido('El tipo de juego no es válido.');
    const puntaje = entero(puntajeEntrada, { campo: 'puntaje', min: 0, max: 100 });
    const fecha = ctx.now();
    const fechaISO = fecha.toISOString();
    const juegoRef = db.collection(COL.juegosClase).doc(`${u.uid}_${curso.id}_${n}`);
    const resultado = await db.runTransaction(async (tx) => {
      const [juegoSnap, progresoSnap] = await tx.getAll(juegoRef, progRef);
      const progreso = progresoSnap.exists ? progresoSnap.data() : null;
      if (!Array.isArray(progreso?.vistas) || !progreso.vistas.includes(n)) {
        throw conflicto('Primero termina la clase para guardar su repaso.', 'clase_no_vista');
      }
      const anterior = juegoSnap.exists ? juegoSnap.data() : null;
      const juego = {
        uid: u.uid,
        cursoId: curso.id,
        n,
        tipo: anterior?.tipo || tipo,
        completado: true,
        mejorPuntaje: Math.max(Number(anterior?.mejorPuntaje) || 0, puntaje),
        intentos: Math.max(0, Number(anterior?.intentos) || 0) + 1,
        primeraVez: anterior?.primeraVez || fechaISO,
        ultimoIntento: fechaISO,
        actualizado: fechaISO,
      };
      const recompensas = await otorgarEventosTx({
        tx,
        db,
        colecciones: COL,
        uid: u.uid,
        ahora: fecha,
        eventos: [{
          clave: `juego-clase:${curso.id}:${n}`,
          tipo: 'juego-clase',
          puntos: REGLAS_PUNTOS.juegoClase,
          contador: 'juegosClase',
          detalle: `Repaso completado: ${curso.titulo}, clase ${n}`,
        }],
      });
      tx.set(juegoRef, juego);
      return { juego, recompensas };
    });
    const { uid: _uid, ...juego } = resultado.juego;
    res.json({ juego, recompensas: resultado.recompensas });
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

  // ---------- Ficha de estudio por clase ----------
  r.get('/clases/:cursoId/:n/ficha', auth, h(async (req, res) => {
    const { clase } = await prepararClase(req, req.params.cursoId, req.params.n);
    const ficha = clase.ficha;
    if (!ficha || ficha.estado !== 'aprobada') throw conflicto('La ficha de esta clase todavía está en revisión.', 'ficha_no_disponible');
    const archivo = typeof ficha.archivo === 'string' ? ficha.archivo : '';
    if (!archivo.startsWith('fichas/') || archivo.includes('..') || !archivo.endsWith('.pdf')) throw conflicto('La ficha no tiene un archivo válido.', 'ficha_sin_archivo');
    if (!ctx.storage) throw noConfigurado('El almacenamiento de fichas no está configurado en el servidor.');
    const [url] = await ctx.storage.bucket(ctx.config.storageBucket || undefined).file(archivo).getSignedUrl({
      version: 'v4', action: 'read', expires: ctx.now().getTime() + 10 * 60 * 1000,
    });
    res.json({ url });
  }));

  // ---------- Materiales ----------
  r.get('/materiales/:id/descarga', auth, h(async (req, res) => {
    const id = idDocumento(req.params.id);
    const [estado, materialFirestore, recompensasEstado] = await Promise.all([
      estadoMembresia(ctx, req.usuario),
      leerDoc(db, COL.materiales, id),
      leerDoc(db, COL.recompensasEstado, req.usuario.uid),
    ]);
    const oficialEmpaquetado = ctx.materiales?.tiene(id) ? materialOficialPorId(id) : null;
    const material = materialFirestore ?? (oficialEmpaquetado ? {
      ...oficialEmpaquetado,
      estado: 'disponible',
      archivo: `materiales/${id}.pdf`,
    } : null);
    if (!material || material.estado === 'oculto') throw noEncontrado('Ese material no existe.');
    if (material.estado !== 'disponible') throw conflicto('Este material todavía no está disponible.', 'material_no_disponible');
    if (!estado.esVip && material.gratis !== true && !materialDesbloqueado(recompensasEstado, id)) {
      const recompensa = recompensaDeMaterial(id);
      const mensaje = recompensa
        ? `Este material requiere membresía VIP o un canje de ${recompensa.puntos} puntos.`
        : 'Este material es exclusivo para miembros VIP.';
      throw requiereVip(mensaje);
    }
    const archivo = typeof material.archivo === 'string' ? material.archivo : '';
    if (!archivo.startsWith('materiales/') || archivo.includes('..')) {
      throw conflicto('Este material no tiene archivo cargado.', 'sin_archivo');
    }
    if (ctx.materiales?.tiene(id)) {
      const origen = `${req.protocol}://${req.get('host')}`;
      const expira = ctx.now().getTime() + 10 * 60 * 1000;
      return res.json({ url: ctx.materiales.urlFirmada(id, origen, expira) });
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
  async function cargarQuizPor(req, cursoId, numero) {
    const { curso, n, quiz } = await prepararClase(req, cursoId, numero, { exigirDesbloqueo: false, conQuiz: true });
    const preguntas = Array.isArray(quiz?.preguntas) ? quiz.preguntas : [];
    if (!quiz || quiz.estado !== 'aprobado' || preguntas.length === 0) {
      throw new HttpError(404, 'quiz_no_disponible', 'Esta clase todavía no tiene quiz.');
    }
    const versionQuiz = Math.max(1, Number(quiz.version) || 1);
    return { curso, n, preguntas, versionQuiz };
  }

  async function cargarQuiz(req) {
    return cargarQuizPor(req, req.params.cursoId, req.params.n);
  }

  r.get('/quiz/:cursoId/:n', auth, h(async (req, res) => {
    const { preguntas, versionQuiz } = await cargarQuiz(req);
    // Nunca se envían reglas de calificación ni explicaciones antes de responder.
    res.json({ version: versionQuiz, preguntas: preguntas.map(preguntaPublica) });
  }));

  r.post('/quiz/:cursoId/:n', auth, h(async (req, res) => {
    const { curso, n, preguntas, versionQuiz } = await cargarQuiz(req);
    const { respuestas, confianzas: confianzasEntrada, justificaciones: justificacionesEntrada } = cuerpo(req);
    if (!Array.isArray(respuestas) || respuestas.length !== preguntas.length) {
      throw invalido(`"respuestas" debe ser una lista con ${preguntas.length} elementos.`);
    }
    if (JSON.stringify(respuestas).length > MAX_BYTES_RESPUESTAS_QUIZ) {
      throw invalido('Las respuestas del quiz exceden el tamaño permitido.');
    }
    const confianzas = confianzasEntrada === undefined ? null : (() => {
      if (!Array.isArray(confianzasEntrada) || confianzasEntrada.length !== preguntas.length) {
        throw invalido(`"confianzas" debe ser una lista con ${preguntas.length} elementos.`);
      }
      return confianzasEntrada.map((valor, i) => entero(valor, { campo: `confianzas[${i}]`, min: 1, max: 3 }));
    })();
    const justificaciones = justificacionesEntrada === undefined ? null : (() => {
      if (!Array.isArray(justificacionesEntrada) || justificacionesEntrada.length !== preguntas.length) {
        throw invalido(`"justificaciones" debe ser una lista con ${preguntas.length} elementos.`);
      }
      return justificacionesEntrada.map((valor, i) => texto(valor, { campo: `justificaciones[${i}]`, max: 240, multilinea: true }) ?? '');
    })();
    const { correctas, total, puntaje, aprobado, detalle } = calificarEvaluacion(preguntas, respuestas, APROBATORIO);
    const u = req.usuario;
    const fecha = ctx.now();
    const intentoRef = db.collection(COL.intentos).doc(`${u.uid}_${curso.id}_${n}`);
    const resultadoIntento = await db.runTransaction(async (tx) => {
      const intentoSnap = await tx.get(intentoRef);
      const anterior = intentoSnap.exists ? intentoSnap.data() : null;
      const premio = aprobado ? await otorgarEventosTx({
        tx,
        db,
        colecciones: COL,
        uid: u.uid,
        ahora: fecha,
        eventos: [{
          clave: `quiz:${curso.id}:${n}`,
          tipo: 'quiz',
          puntos: REGLAS_PUNTOS.quiz,
          contador: 'quizzes',
          detalle: `Evaluación aprobada: ${curso.titulo}, clase ${n}`,
        }],
      }) : { puntosGanados: 0, saldo: null, logrosNuevos: [], notificaciones: [] };
      const historialAnterior = Array.isArray(anterior?.historial) ? anterior.historial : anterior?.fecha ? [{
        numero: 1,
        versionQuiz: Math.max(1, Number(anterior.versionQuiz) || 1),
        correctas: Number(anterior.correctas) || 0,
        total: Number(anterior.total) || total,
        puntaje: Number(anterior.puntaje) || 0,
        aprobado: anterior.aprobado === true,
        fecha: anterior.fecha,
        migrado: true,
      }] : [];
      const intentosPrevios = Math.max(Number(anterior?.intentos) || 0, historialAnterior.length);
      const numero = intentosPrevios + 1;
      const confianzaPromedio = confianzas ? Math.round((confianzas.reduce((suma, valor) => suma + valor, 0) / Math.max(1, confianzas.length)) * 100) / 100 : null;
      const entradaHistorial = sinIndefinidos({
        numero,
        versionQuiz,
        correctas,
        total,
        puntaje,
        aprobado,
        fecha: fecha.toISOString(),
        respuestas,
        confianzas: confianzas ?? undefined,
        confianzaPromedio: confianzaPromedio ?? undefined,
        justificaciones: justificaciones ?? undefined,
      });
      const mejorPuntaje = Math.max(Number(anterior?.mejorPuntaje ?? anterior?.puntaje) || 0, puntaje);
      const aprobadoAlgunaVez = anterior?.aprobadoAlgunaVez === true || anterior?.aprobado === true || aprobado;
      const historial = [...historialAnterior, entradaHistorial].slice(-MAX_HISTORIAL_QUIZ);
      tx.set(intentoRef, {
        uid: u.uid,
        cursoId: curso.id,
        n,
        versionQuiz,
        correctas,
        total,
        puntaje,
        aprobado,
        fecha: fecha.toISOString(),
        intentos: numero,
        mejorPuntaje,
        aprobadoAlgunaVez,
        historial,
      });
      return { premio, intento: { numero, mejorPuntaje, aprobadoAlgunaVez, versionQuiz, fecha: fecha.toISOString() } };
    });
    res.json({ correctas, total, puntaje, aprobado, detalle, recompensas: resultadoIntento.premio, intento: resultadoIntento.intento });
  }));

  // ---------- Retos V2 ----------
  async function bancoRetos(req) {
    const [estadoAcceso, cursosSnap, quizzesSnap] = await Promise.all([
      estadoMembresia(ctx, req.usuario),
      db.collection(COL.cursos).get(),
      db.collection(COL.quizzes).get(),
    ]);
    const cursoGratisId = estadoAcceso.esVip ? null : (await leerCursoGratis(ctx, req.usuario.uid))?.cursoId ?? null;
    const cursos = new Map(cursosSnap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((curso) => curso.publicado === true)
      .map((curso) => [curso.id, curso]));
    const preguntas = [];
    for (const doc of quizzesSnap.docs) {
      const quiz = doc.data();
      if (quiz?.estado !== 'aprobado' || !Array.isArray(quiz.preguntas)) continue;
      const curso = cursos.get(String(quiz.cursoId));
      const n = Number(quiz.n);
      const clase = curso?.clases?.find((item) => Number(item.n) === n);
      if (!curso || !clase || !tieneAccesoAClase(curso, curso.id, n, estadoAcceso.esVip, cursoGratisId)) continue;
      quiz.preguntas.forEach((pregunta, indice) => {
        if (!pregunta || typeof pregunta.q !== 'string' || pregunta.compatibleRetos === false) return;
        let publica;
        try { publica = preguntaPublica(pregunta, indice); } catch { return; }
        preguntas.push({
          ref: refPregunta(curso.id, n, indice),
          cursoId: curso.id,
          curso: curso.titulo,
          clase: clase.titulo,
          n,
          indice,
          area: curso.area || 'General',
          ...publica,
        });
      });
    }
    return { preguntas, estadoAcceso };
  }

  function disponibilidadRetos(preguntas) {
    const areas = new Map();
    preguntas.forEach((pregunta) => areas.set(pregunta.area, (areas.get(pregunta.area) || 0) + 1));
    return {
      preguntas: preguntas.length,
      areas: [...areas.entries()].map(([area, total]) => ({ area, total })).sort((a, b) => b.total - a.total || a.area.localeCompare(b.area, 'es')),
    };
  }

  r.get('/retos/resumen', auth, h(async (req, res) => {
    const [{ preguntas }, guardado] = await Promise.all([
      bancoRetos(req),
      leerDoc(db, COL.retosEstado, req.usuario.uid),
    ]);
    const estado = estadoRetosPublico(guardado, req.usuario.uid);
    const disponibilidad = disponibilidadRetos(preguntas);
    const disponibles = new Set(disponibilidad.areas.map((item) => item.area));
    const porReforzar = estado.dominio.find((item) => disponibles.has(item.area) && item.total >= 2);
    const recomendada = porReforzar?.area || disponibilidad.areas[0]?.area || null;
    res.json({
      estado,
      disponibilidad,
      recomendacion: recomendada ? {
        area: recomendada,
        preguntas: Math.min(8, preguntas.filter((item) => item.area === recomendada).length),
        minutos: Math.max(3, Math.ceil(Math.min(8, preguntas.filter((item) => item.area === recomendada).length) * 1.2)),
        motivo: porReforzar ? 'Refuerza el área que más puede mejorar hoy.' : 'Empieza por el área con más práctica disponible.',
      } : null,
    });
  }));

  r.post('/retos/sesion', auth, h(async (req, res) => {
    const b = cuerpo(req);
    const modo = b.modo === 'relampago' ? 'relampago' : b.modo === 'practica' ? 'practica' : null;
    if (!modo) throw invalido('"modo" debe ser "practica" o "relampago".');
    const area = texto(b.area, { campo: 'area', max: 80 }) || 'Todas';
    const [{ preguntas, estadoAcceso }, retosGuardados] = await Promise.all([
      bancoRetos(req),
      leerDoc(db, COL.retosEstado, req.usuario.uid),
    ]);
    const maximo = estadoAcceso.esVip ? (modo === 'practica' ? 10 : 8) : 3;
    const limite = entero(b.limite ?? maximo, { campo: 'limite', min: 1, max: maximo });
    const guardado = normalizarEstadoRetos(retosGuardados, req.usuario.uid);
    const candidatas = preguntas.filter((item) => (area === 'Todas' || item.area === area) && (modo !== 'relampago' || item.tipo === 'seleccion'));
    candidatas.sort((a, b) => prioridadPregunta(guardado, a) - prioridadPregunta(guardado, b) || a.ref.localeCompare(b.ref));
    const seleccion = candidatas.slice(0, limite);
    res.json({ modo, area, total: seleccion.length, preguntas: seleccion });
  }));

  r.post('/retos/responder', auth, h(async (req, res) => {
    const b = cuerpo(req);
    const cursoId = idDocumento(b.cursoId, 'cursoId');
    const n = entero(b.n, { campo: 'n', min: 1, max: 999 });
    const indice = entero(b.indice, { campo: 'indice', min: 0, max: 999 });
    const respuesta = Object.prototype.hasOwnProperty.call(b, 'respuesta')
      ? b.respuesta
      : (b.opcion === null ? null : entero(b.opcion, { campo: 'opcion', min: 0, max: 99 }));
    const { curso, preguntas } = await cargarQuizPor(req, cursoId, n);
    const pregunta = preguntas[indice];
    if (!pregunta) throw noEncontrado('Esa pregunta ya no está disponible.');
    if (pregunta.compatibleRetos === false) throw noEncontrado('Esa pregunta no está disponible en Retos.');
    const detalle = calificarPregunta(pregunta, respuesta, indice);
    const { acertada, puntos } = detalle;
    const ahora = ctx.now();
    const ahoraISO = ahora.toISOString();
    const hoy = ahoraISO.slice(0, 10);
    const ref = refPregunta(curso.id, n, indice);
    const estadoRef = db.collection(COL.retosEstado).doc(req.usuario.uid);

    const resultado = await db.runTransaction(async (tx) => {
      const snap = await tx.get(estadoRef);
      const estado = normalizarEstadoRetos(snap.exists ? snap.data() : null, req.usuario.uid);
      const previa = estado.preguntas[ref] && typeof estado.preguntas[ref] === 'object' ? estado.preguntas[ref] : {};
      const primerIntentoHoy = String(previa.ultima || '').slice(0, 10) !== hoy;
      const xpGanado = primerIntentoHoy ? (acertada ? 10 : 2) : 0;
      estado.preguntas[ref] = {
        intentos: Number(previa.intentos || 0) + 1,
        aciertos: Number(previa.aciertos || 0) + (acertada ? 1 : 0),
        ultimaPuntuacion: puntos,
        ultima: ahoraISO,
        ultimaCorrecta: acertada,
      };
      const area = curso.area || 'General';
      const dominio = estado.dominio[area] && typeof estado.dominio[area] === 'object' ? estado.dominio[area] : {};
      estado.dominio[area] = {
        total: Number(dominio.total || 0) + 1,
        aciertos: Number(dominio.aciertos || 0) + puntos,
        ultima: ahoraISO,
      };
      estado.quiz.total += 1;
      estado.quiz.aciertos += puntos;
      estado.xp += xpGanado;
      estado.actividad = registrarActividad(estado.actividad, ahora);
      estado.actualizado = ahoraISO;
      const recompensas = xpGanado > 0 ? await otorgarEventosTx({
        tx,
        db,
        colecciones: COL,
        uid: req.usuario.uid,
        ahora,
        eventos: [{
          clave: `reto:${ref}:${hoy}`,
          tipo: 'reto',
          puntos: xpGanado,
          contador: 'puntosRetos',
          delta: xpGanado,
          detalle: acertada ? 'Respuesta correcta en Retos' : 'Práctica completada en Retos',
        }],
      }) : { puntosGanados: 0, saldo: null, logrosNuevos: [], notificaciones: [] };
      tx.set(estadoRef, estado);
      return { estado: estadoRetosPublico(estado, req.usuario.uid), xpGanado, recompensas };
    });

    res.json({
      ref,
      acertada,
      puntos,
      tipo: detalle.tipo,
      correcta: detalle.correcta ?? null,
      respuestaCorrecta: detalle.respuestaCorrecta,
      explicacion: detalle.explicacion || '',
      ...(detalle.referenciaVideo ? { referenciaVideo: detalle.referenciaVideo } : {}),
      xpGanado: resultado.xpGanado,
      estado: resultado.estado,
      recompensas: resultado.recompensas,
    });
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
    const TOPE = 300;
    let docs;
    if (req.query.cursoId !== undefined && req.query.cursoId !== '') {
      docs = (await db.collection(COL.foro).where('cursoId', '==', idDocumento(String(req.query.cursoId), 'cursoId')).get()).docs;
    } else {
      // Sólo sin filtro (where + orderBy exigiría un índice compuesto). Se pagina hasta juntar TOPE visibles: los ocultos no cuentan.
      docs = [];
      let visibles = 0;
      let desde = null;
      for (;;) {
        let q = db.collection(COL.foro).orderBy('fecha', 'desc').limit(TOPE);
        if (desde) q = q.startAfter(desde);
        const pagina = await q.get();
        docs.push(...pagina.docs);
        visibles += pagina.docs.filter((d) => d.data().oculto !== true).length;
        if (visibles >= TOPE || pagina.size < TOPE) break;
        desde = pagina.docs.at(-1);
      }
    }
    const hilos = docs
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
    const recompensas = await otorgarEventos(ctx, COL, u.uid, [{
      clave: `tema:${ref.id}`,
      tipo: 'comunidad',
      puntos: REGLAS_PUNTOS.temaComunidad,
      contador: 'temas',
      detalle: 'Tema publicado en Comunidad',
    }]);
    res.status(201).json({ ...hiloPublico(hilo, u.uid), recompensas });
  }));

  r.get('/foro/:id', auth, h(async (req, res) => {
    const id = idDocumento(req.params.id);
    const ref = db.collection(COL.foro).doc(id);
    const respP = ref.collection(COL.respuestas).get();
    respP.catch(() => {});
    const snap = await ref.get();
    if (!snap.exists || snap.data().oculto === true) throw noEncontrado('Ese tema no existe.');
    const respSnap = await respP;
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
    const recompensas = await otorgarEventos(ctx, COL, u.uid, [{
      clave: `respuesta:${id}:${respRef.id}`,
      tipo: 'comunidad',
      puntos: REGLAS_PUNTOS.respuestaComunidad,
      contador: 'respuestas',
      detalle: 'Respuesta publicada en Comunidad',
    }]);
    res.status(201).json({ ...respuesta, recompensas });
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

  // Canjear un cupón: agrega días de acceso (cortesía) de forma idempotente por usuario.
  r.post('/cupones/canjear', auth, h(async (req, res) => {
    const codigo = String(cuerpo(req).codigo ?? '').trim().toUpperCase().replace(/\s+/g, '');
    if (!/^[A-Z0-9-]{4,24}$/.test(codigo)) throw invalido('Ese código no es válido.', 'codigo_invalido');
    const uid = req.usuario.uid;
    const ahora = ctx.now();
    // Rate limit por usuario: el código es un secreto que da acceso, así que limitamos los intentos para frenar la fuerza bruta.
    const intentosRef = db.collection(COL.cuponesIntentos).doc(uid);
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(intentosRef);
      const desde = ahora.getTime() - 60 * 60 * 1000;
      const recientes = (snap.exists ? snap.data().intentos ?? [] : []).filter((t) => (aMillis(t) ?? 0) > desde);
      if (recientes.length >= 10) throw demasiadasSolicitudes('Demasiados intentos de canje. Espera un momento e inténtalo de nuevo.');
      tx.set(intentosRef, { uid, intentos: [...recientes, ahora.toISOString()].slice(-10) });
    });
    const cuponRef = db.collection(COL.cupones).doc(codigo);
    const canjeRef = db.collection(COL.cuponesCanjes).doc(`${codigo}__${uid}`);
    const cortesiaRef = db.collection(COL.cortesias).doc(uid);
    const resultado = await db.runTransaction(async (tx) => {
      const [cuponSnap, canjeSnap, cortesiaSnap] = await Promise.all([tx.get(cuponRef), tx.get(canjeRef), tx.get(cortesiaRef)]);
      if (!cuponSnap.exists) throw noEncontrado('Ese cupón no existe o ya no está disponible.');
      const cupon = cuponSnap.data();
      if (cupon.estado !== 'activo') throw conflicto('Este cupón ya no está disponible.', 'cupon_no_disponible');
      if (cupon.vence && (aMillis(cupon.vence) ?? 0) < ahora.getTime()) throw conflicto('Este cupón ya venció.', 'cupon_vencido');
      if (cupon.usosMax > 0 && (cupon.usados ?? 0) >= cupon.usosMax) throw conflicto('Este cupón ya alcanzó su límite de usos.', 'cupon_agotado');
      if (canjeSnap.exists) throw conflicto('Ya habías canjeado este cupón.', 'cupon_ya_canjeado');
      const dias = cupon.dias;
      const hastaPrevio = cortesiaSnap.exists ? (aMillis(cortesiaSnap.data().hasta) ?? 0) : 0;
      const base = hastaPrevio > ahora.getTime() ? hastaPrevio : ahora.getTime();
      const hasta = new Date(base + dias * DIA_MS).toISOString();
      tx.set(cortesiaRef, { uid, hasta, motivo: `Cupón ${codigo}`, otorgadaPor: `cupon:${codigo}`, fecha: ahora.toISOString() });
      tx.set(canjeRef, { codigo, uid, dias, fecha: ahora.toISOString() });
      tx.set(cuponRef, { ...cupon, usados: (cupon.usados ?? 0) + 1, actualizado: ahora.toISOString() });
      return { dias, hasta };
    });
    res.status(201).json({ ok: true, dias: resultado.dias, hasta: resultado.hasta });
  }));

  return r;
}
