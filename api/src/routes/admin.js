// Rutas de administración (claim `admin: true`).
import { randomInt } from 'node:crypto';
import express from 'express';
import {
  COL,
  calcularEstado,
  leerConfig,
  leerDoc,
  perfilConDefectos,
} from '../datos.js';
import { ESTADOS_QUIZ, validarConfig, validarCurso, validarEvento, validarMaterial, validarPreguntas } from '../lib/esquemas.js';
import { conflicto, invalido, noConfigurado, noEncontrado } from '../lib/errores.js';
import { DIA_MS, aISO, aMillis } from '../lib/fechas.js';
import { contactosEncuestas, resumirEncuestas } from '../lib/encuestas.js';
import { LIMITES, booleano, cuerpo, entero, esObjeto, idDocumento, texto, textoRequerido, unoDe, url } from '../lib/validacion.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { h } from '../middleware/errores.js';

const TIPOS_SUBIDA = {
  archivo: { 'application/pdf': 'pdf' },
  portada: { 'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/png': 'png' },
};

// El club viejo no tiene un esquema fijo de fechas de alta/baja: se prueban los nombres conocidos.
const CAMPOS_ALTA = ['fechaAlta', 'creadoEn', 'creado', 'fechaInicio', 'fechaRegistro', 'createdAt'];
const CAMPOS_BAJA = ['canceladoEn', 'fechaBaja', 'fechaCancelacion'];

const primeraFecha = (obj, campos) => {
  for (const c of campos) {
    const ms = aMillis(obj?.[c]);
    if (ms !== null && !Number.isNaN(ms)) return ms;
  }
  return null;
};

const docs = (snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() }));
const esIndiceFaltante = (error) => error?.code === 9 || error?.code === 'failed-precondition' || /index/i.test(String(error?.message ?? ''));

export function rutasAdmin(ctx) {
  const r = express.Router();
  const { db } = ctx;
  r.use('/admin', requireAuth(ctx), requireAdmin);

  const ahoraISO = () => ctx.now().toISOString();

  // ---------- Resumen ----------
  r.get('/admin/resumen', h(async (req, res) => {
    const ahora = ctx.now();
    const desde = ahora.getTime() - 30 * DIA_MS;
    const [miembrosSnap, cortesiasSnap, progresoSnap, certSnap, foroSnap, cursosSnap] = await Promise.all([
      db.collection(COL.miembros).get(),
      db.collection(COL.cortesias).get(),
      db.collection(COL.progreso).get(),
      db.collection(COL.certificados).get(),
      db.collection(COL.foro).get(),
      db.collection(COL.cursos).get(),
    ]);
    const miembros = new Map(miembrosSnap.docs.map((d) => [d.id, d.data()]));
    const cortesias = new Map(cortesiasSnap.docs.map((d) => [d.id, d.data()]));
    const uids = new Set([...miembros.keys(), ...cortesias.keys()]);
    let miembrosActivos = 0;
    for (const uid of uids) {
      if (calcularEstado(miembros.get(uid) ?? null, cortesias.get(uid) ?? null, false, ahora).esVip) miembrosActivos++;
    }
    let altas30d = 0;
    let bajas30d = 0;
    for (const m of miembros.values()) {
      const alta = primeraFecha(m, CAMPOS_ALTA);
      const baja = primeraFecha(m, CAMPOS_BAJA);
      if (alta !== null && alta >= desde) altas30d++;
      if (baja !== null && baja >= desde) bajas30d++;
    }
    let clasesVistas30d = 0;
    const vistasPorCurso = new Map();
    for (const d of progresoSnap.docs) {
      const p = d.data();
      const recientes = (p.historial ?? []).filter((f) => (aMillis(f) ?? 0) >= desde).length;
      clasesVistas30d += recientes;
      if (recientes) vistasPorCurso.set(p.cursoId, (vistasPorCurso.get(p.cursoId) ?? 0) + recientes);
    }
    const titulos = new Map(cursosSnap.docs.map((d) => [d.id, d.data().titulo ?? d.id]));
    const cursosTop = [...vistasPorCurso.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cursoId, vistas]) => ({ cursoId, titulo: titulos.get(cursoId) ?? cursoId, vistas }));
    res.json({
      miembrosActivos,
      altas30d,
      bajas30d,
      clasesVistas30d,
      certificados30d: certSnap.docs.filter((d) => (aMillis(d.data().emitido) ?? 0) >= desde).length,
      temasForo30d: foroSnap.docs.filter((d) => (aMillis(d.data().fecha) ?? 0) >= desde).length,
      cursosTop,
    });
  }));

  // ---------- Encuestas (solo agregados; nunca expone UID ni correo) ----------
  r.get('/admin/encuestas/resumen', h(async (req, res) => {
    const plan = req.query.plan === 'vip' || req.query.plan === 'gratis' ? req.query.plan : null;
    const snap = await db.collection(COL.encuestasRespuestas).get();
    res.json(resumirEncuestas(snap.docs.map((d) => d.data()), { plan }));
  }));

  // Correos de quienes pidieron que les escribamos tras calificar bajo (único dato con identidad, con permiso explícito).
  r.get('/admin/encuestas/contactos', h(async (req, res) => {
    const snap = await db.collection(COL.encuestasRespuestas).get();
    res.json(contactosEncuestas(snap.docs.map((d) => d.data())));
  }));

  // ---------- CRUD genérico (cursos, materiales, eventos) ----------
  function crud({ ruta, coleccion, validar, nombre, alCrear = (x) => x, antesDeBorrar, despuesDeBorrar, ordenar }) {
    r.get(`/admin/${ruta}`, h(async (req, res) => {
      const lista = docs(await db.collection(coleccion).get());
      res.json(ordenar ? lista.sort(ordenar) : lista);
    }));

    r.post(`/admin/${ruta}`, h(async (req, res) => {
      const datos = alCrear(validar(cuerpo(req), { parcial: false }));
      const ref = db.collection(coleccion).doc(datos.id);
      const doc = { ...datos, actualizado: ahoraISO() };
      try {
        await ref.create(doc);
      } catch (e) {
        if (e?.code === 6 || /ALREADY_EXISTS/.test(e?.message ?? '')) throw conflicto(`Ya existe ${nombre} con id "${datos.id}".`, 'ya_existe');
        throw e;
      }
      res.status(201).json(doc);
    }));

    r.patch(`/admin/${ruta}/:id`, h(async (req, res) => {
      const id = idDocumento(req.params.id);
      const cambios = validar(cuerpo(req), { parcial: true });
      if (Object.keys(cambios).length === 0) throw invalido('No enviaste ningún campo para actualizar.');
      const ref = db.collection(coleccion).doc(id);
      const actualizado = await db.runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        if (!snap.exists) throw noEncontrado(`No existe ${nombre} con id "${id}".`);
        const nuevo = { ...snap.data(), ...cambios, id, actualizado: ahoraISO() };
        tx.set(ref, nuevo);
        return nuevo;
      });
      res.json(actualizado);
    }));

    r.delete(`/admin/${ruta}/:id`, h(async (req, res) => {
      const id = idDocumento(req.params.id);
      const ref = db.collection(coleccion).doc(id);
      const snap = await ref.get();
      if (!snap.exists) throw noEncontrado(`No existe ${nombre} con id "${id}".`);
      if (antesDeBorrar) await antesDeBorrar(id, snap.data());
      await ref.delete();
      if (despuesDeBorrar) await despuesDeBorrar(id, snap.data());
      res.json({ ok: true, id });
    }));
  }

  crud({
    ruta: 'cursos',
    coleccion: COL.cursos,
    validar: validarCurso,
    nombre: 'un curso',
    ordenar: (a, b) => (a.orden ?? 0) - (b.orden ?? 0),
    antesDeBorrar: async (id) => {
      const prog = await db.collection(COL.progreso).where('cursoId', '==', id).limit(1).get();
      if (!prog.empty) {
        throw conflicto('No se puede borrar: hay miembros con progreso en este curso. Despublícalo en su lugar.', 'curso_con_progreso');
      }
    },
  });

  crud({
    ruta: 'materiales',
    coleccion: COL.materiales,
    validar: validarMaterial,
    nombre: 'un material',
    ordenar: (a, b) => String(a.titulo ?? '').localeCompare(String(b.titulo ?? ''), 'es'),
    alCrear: (m) => ({ ...m, archivo: `materiales/${m.id}.pdf` }),
    despuesDeBorrar: async (id, material) => {
      if (!ctx.storage || typeof material.archivo !== 'string' || !material.archivo.startsWith('materiales/')) return;
      try {
        await ctx.storage.bucket(ctx.config.storageBucket || undefined).file(material.archivo).delete({ ignoreNotFound: true });
      } catch (e) {
        ctx.logger.warn?.(`[admin] no se pudo borrar ${material.archivo} de Storage:`, e.message);
      }
    },
  });

  crud({
    ruta: 'eventos',
    coleccion: COL.eventos,
    validar: validarEvento,
    nombre: 'un evento',
    ordenar: (a, b) => (aMillis(b.fecha) ?? 0) - (aMillis(a.fecha) ?? 0),
    alCrear: (e) => ({ ...e, enlace: e.enlace ?? null, cursoId: e.cursoId ?? null, reservas: [] }),
  });

  r.post('/admin/materiales/:id/subida', h(async (req, res) => {
    const id = idDocumento(req.params.id);
    const b = cuerpo(req);
    const tipo = unoDe(b.tipo, ['archivo', 'portada'], { campo: 'tipo', requerido: true });
    const extension = TIPOS_SUBIDA[tipo][b.contentType];
    if (!extension) {
      throw invalido(`Tipo de archivo no permitido para ${tipo}. Usa: ${Object.keys(TIPOS_SUBIDA[tipo]).join(', ')}.`, 'tipo_no_permitido');
    }
    const material = await leerDoc(db, COL.materiales, id);
    if (!material) throw noEncontrado(`No existe un material con id "${id}".`);
    if (!ctx.storage) throw noConfigurado('El almacenamiento de archivos no está configurado en el servidor.');
    const path = tipo === 'archivo' ? `materiales/${id}.pdf` : `materiales/portadas/${id}.${extension}`;
    const bucket = ctx.storage.bucket(ctx.config.storageBucket || undefined);
    const expires = ctx.now().getTime() + 15 * 60 * 1000;
    const [uploadUrl] = await bucket.file(path).getSignedUrl({
      version: 'v4',
      action: 'write',
      expires,
      contentType: b.contentType,
    });
    const salida = { uploadUrl, path, contentType: b.contentType, expira: new Date(expires).toISOString() };
    if (tipo === 'portada') {
      // Las portadas son públicas (storage.rules): esta URL sirve para guardarla en `portada`.
      salida.publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(path)}?alt=media`;
    }
    res.json(salida);
  }));

  // ---------- Miembros ----------
  async function cargarMapas() {
    const [miembrosSnap, cortesiasSnap, perfilesSnap, progresoSnap] = await Promise.all([
      db.collection(COL.miembros).get(),
      db.collection(COL.cortesias).get(),
      db.collection(COL.perfiles).get(),
      db.collection(COL.progreso).get(),
    ]);
    const mapa = (snap) => new Map(snap.docs.map((d) => [d.id, d.data()]));
    return { miembros: mapa(miembrosSnap), cortesias: mapa(cortesiasSnap), perfiles: mapa(perfilesSnap), progreso: progresoSnap.docs.map((d) => d.data()) };
  }

  r.get('/admin/miembros', h(async (req, res) => {
    const q = String(req.query.q ?? '').trim().toLowerCase().slice(0, 100);
    const filtro = req.query.estado === undefined || req.query.estado === '' ? 'todos' : String(req.query.estado);
    unoDe(filtro, ['todos', 'vip', 'no_vip', 'cortesia'], { campo: 'estado' });
    const ahora = ctx.now();
    const { miembros, cortesias, perfiles, progreso } = await cargarMapas();

    const actividad = new Map();
    for (const p of progreso) {
      if (!p.uid) continue;
      const a = actividad.get(p.uid) ?? { clasesVistas: 0, ultimaActividad: null };
      a.clasesVistas += Array.isArray(p.vistas) ? p.vistas.length : 0;
      if (p.actualizado && (!a.ultimaActividad || p.actualizado > a.ultimaActividad)) a.ultimaActividad = p.actualizado;
      actividad.set(p.uid, a);
    }

    const uids = new Set([...miembros.keys(), ...cortesias.keys(), ...perfiles.keys()]);
    let lista = [...uids].map((uid) => {
      const m = miembros.get(uid) ?? null;
      const c = cortesias.get(uid) ?? null;
      const estado = calcularEstado(m, c, false, ahora);
      const a = actividad.get(uid) ?? { clasesVistas: 0, ultimaActividad: null };
      return {
        uid,
        nombre: perfiles.get(uid)?.nombre ?? m?.nombre ?? '',
        email: m?.email ?? '',
        esVip: estado.esVip,
        plan: estado.plan,
        vence: estado.vence,
        cortesiaHasta: estado.cortesiaVigente ? aISO(c.hasta) : null,
        clasesVistas: a.clasesVistas,
        ultimaActividad: a.ultimaActividad,
      };
    });

    if (q) lista = lista.filter((x) => [x.uid, x.nombre, x.email].some((v) => String(v).toLowerCase().includes(q)));
    if (filtro === 'vip') lista = lista.filter((x) => x.esVip);
    if (filtro === 'no_vip') lista = lista.filter((x) => !x.esVip);
    if (filtro === 'cortesia') lista = lista.filter((x) => x.cortesiaHasta);
    lista.sort((a, b) => String(b.ultimaActividad ?? '').localeCompare(String(a.ultimaActividad ?? '')) || a.nombre.localeCompare(b.nombre, 'es'));
    res.json(lista.slice(0, 1000));
  }));

  async function usuarioAuth(uid) {
    try {
      return await ctx.auth.getUser(uid);
    } catch (e) {
      if (e?.code === 'auth/user-not-found') return null;
      throw e;
    }
  }

  r.get('/admin/miembros/:uid', h(async (req, res) => {
    const uid = idDocumento(req.params.uid, 'uid');
    const [m, c, perfil, sus, progSnap, certSnap, cursosSnap, usuario, cursoGratis] = await Promise.all([
      leerDoc(db, COL.miembros, uid),
      leerDoc(db, COL.cortesias, uid),
      leerDoc(db, COL.perfiles, uid),
      leerDoc(db, COL.suscripciones, uid),
      db.collection(COL.progreso).where('uid', '==', uid).get(),
      db.collection(COL.certificados).where('uid', '==', uid).get(),
      db.collection(COL.cursos).get(),
      usuarioAuth(uid),
      leerDoc(db, COL.cursoGratis, uid),
    ]);
    if (!m && !c && !perfil && !usuario && progSnap.empty) throw noEncontrado('No existe ese miembro.');
    const esAdmin = usuario?.customClaims?.admin === true;
    const estado = calcularEstado(m, c, esAdmin, ctx.now());
    const cursos = new Map(cursosSnap.docs.map((d) => [d.id, d.data()]));
    res.json({
      uid,
      nombre: perfil?.nombre ?? m?.nombre ?? usuario?.displayName ?? '',
      email: m?.email ?? usuario?.email ?? '',
      esVip: estado.esVip,
      esAdmin,
      plan: estado.plan,
      vence: estado.vence,
      cortesia: c,
      cortesiaHasta: estado.cortesiaVigente ? aISO(c.hasta) : null,
      suscripcion: sus,
      perfil: perfilConDefectos(perfil, m, { nombre: usuario?.displayName }),
      miembro: m
        ? {
            activa: m.activa ?? null,
            activo: m.activo ?? null,
            plan: m.plan ?? null,
            esRegalo: m.esRegalo ?? null,
            expira: aISO(m.expiraEn ?? m.fechaFinAcceso),
            whatsapp: m.whatsapp ?? null,
          }
        : null,
      progreso: progSnap.docs
        .map((d) => d.data())
        .map((p) => ({
          cursoId: p.cursoId,
          titulo: cursos.get(p.cursoId)?.titulo ?? p.cursoId,
          vistas: p.vistas ?? [],
          total: (cursos.get(p.cursoId)?.clases ?? []).length,
          ultima: p.ultima ?? null,
          actualizado: p.actualizado ?? null,
          certificado: p.certificado ?? null,
        })),
      certificados: certSnap.docs.map((d) => d.data()).sort((a, b) => String(b.emitido).localeCompare(String(a.emitido))),
      cursoGratis: cursoGratis?.cursoId ? { cursoId: cursoGratis.cursoId, titulo: cursos.get(cursoGratis.cursoId)?.titulo ?? cursoGratis.cursoId, origen: cursoGratis.origen, elegido: cursoGratis.elegido, cambios: cursoGratis.cambios ?? 0 } : null,
    });
  }));

  r.post('/admin/miembros/:uid/cortesia', h(async (req, res) => {
    const uid = idDocumento(req.params.uid, 'uid');
    const b = cuerpo(req);
    const dias = entero(b.dias, { campo: 'dias', min: 1, max: 3650 });
    const motivo = textoRequerido(b.motivo, { campo: 'motivo', min: 3, max: LIMITES.medio });
    const [usuario, miembro] = await Promise.all([usuarioAuth(uid), leerDoc(db, COL.miembros, uid)]);
    if (!usuario && !miembro) throw noEncontrado('No existe un usuario con ese uid.');
    const ahora = ctx.now();
    const cortesia = {
      uid,
      hasta: new Date(ahora.getTime() + dias * DIA_MS).toISOString(),
      motivo,
      otorgadaPor: req.usuario.email || req.usuario.uid,
      fecha: ahora.toISOString(),
    };
    await db.collection(COL.cortesias).doc(uid).set(cortesia);
    res.status(201).json(cortesia);
  }));

  // Reinicia «Escoge tu curso gratis»: el miembro vuelve a ver el anuncio para elegir.
  // Se deja un registro vacío para que la migración automática no lo reasigne.
  r.delete('/admin/miembros/:uid/curso-gratis', h(async (req, res) => {
    const uid = idDocumento(req.params.uid, 'uid');
    const ref = db.collection(COL.cursoGratis).doc(uid);
    const previo = await ref.get();
    await ref.set({ uid, cursoId: null, origen: 'reinicio', anterior: previo.exists ? previo.data().cursoId ?? null : null, reiniciadoPor: req.usuario.email || req.usuario.uid, elegido: null, cambios: 0, fecha: ctx.now().toISOString() });
    res.json({ ok: true, uid });
  }));

  r.delete('/admin/miembros/:uid/cortesia', h(async (req, res) => {
    const uid = idDocumento(req.params.uid, 'uid');
    const ref = db.collection(COL.cortesias).doc(uid);
    if (!(await ref.get()).exists) throw noEncontrado('Ese miembro no tiene cortesía.');
    await ref.delete();
    res.json({ ok: true, uid });
  }));

  // ---------- Cupones (días de acceso canjeables) ----------
  const ALFABETO_CUPON = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sin O/0/I/1 para evitar confusiones
  // Los códigos funcionan como un secreto (dan acceso): aleatoriedad criptográfica y 12 caracteres (~32^12) para que no se puedan adivinar por fuerza bruta.
  const generarCodigo = () => Array.from({ length: 12 }, () => ALFABETO_CUPON[randomInt(ALFABETO_CUPON.length)]).join('');
  const normalizarCodigo = (v) => String(v ?? '').trim().toUpperCase().replace(/\s+/g, '');
  const CODIGO_VALIDO = /^[A-Z0-9-]{4,24}$/;

  r.get('/admin/cupones', h(async (req, res) => {
    const lista = docs(await db.collection(COL.cupones).get()).sort((a, b) => String(b.creado ?? '').localeCompare(String(a.creado ?? '')));
    res.json(lista);
  }));

  r.post('/admin/cupones', h(async (req, res) => {
    const b = cuerpo(req);
    const dias = entero(b.dias, { campo: 'dias', min: 1, max: 3650 });
    const usosMax = entero(b.usosMax, { campo: 'usosMax', min: 0, max: 100000, requerido: false }) ?? 1;
    const etiqueta = texto(b.etiqueta, { campo: 'etiqueta', max: LIMITES.corto }) ?? '';
    let vence = null;
    if (b.vence !== undefined && b.vence !== null && b.vence !== '') {
      const ms = aMillis(b.vence);
      if (ms === null || Number.isNaN(ms)) throw invalido('La fecha de vencimiento no es válida.', 'vence_invalido');
      vence = new Date(ms).toISOString();
    }
    const codigo = b.codigo ? normalizarCodigo(b.codigo) : generarCodigo();
    if (!CODIGO_VALIDO.test(codigo)) throw invalido('El código debe tener de 4 a 24 letras, números o guiones.', 'codigo_invalido');
    const doc = { codigo, dias, usosMax, usados: 0, vence, etiqueta, estado: 'activo', creadoPor: req.usuario.email || req.usuario.uid, creado: ahoraISO(), actualizado: ahoraISO() };
    try {
      await db.collection(COL.cupones).doc(codigo).create(doc);
    } catch (e) {
      if (e?.code === 6 || /ALREADY_EXISTS/.test(e?.message ?? '')) throw conflicto(`Ya existe un cupón con el código "${codigo}".`, 'ya_existe');
      throw e;
    }
    res.status(201).json(doc);
  }));

  r.patch('/admin/cupones/:codigo', h(async (req, res) => {
    const codigo = normalizarCodigo(req.params.codigo);
    const b = cuerpo(req);
    const cambios = {};
    if (b.estado !== undefined) cambios.estado = unoDe(b.estado, ['activo', 'revocado'], { campo: 'estado', requerido: true });
    if (b.etiqueta !== undefined) cambios.etiqueta = texto(b.etiqueta, { campo: 'etiqueta', max: LIMITES.corto });
    if (Object.keys(cambios).length === 0) throw invalido('No enviaste ningún campo para actualizar.');
    const ref = db.collection(COL.cupones).doc(codigo);
    const actualizado = await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) throw noEncontrado(`No existe un cupón con el código "${codigo}".`);
      const nuevo = { ...snap.data(), ...cambios, codigo, actualizado: ahoraISO() };
      tx.set(ref, nuevo);
      return nuevo;
    });
    res.json(actualizado);
  }));

  // ---------- Foro ----------
  r.get('/admin/foro', h(async (req, res) => {
    const lista = docs(await db.collection(COL.foro).get()).sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));
    res.json(lista);
  }));

  r.patch('/admin/foro/:id', h(async (req, res) => {
    const id = idDocumento(req.params.id);
    const b = cuerpo(req);
    const oculto = booleano(b.oculto, { campo: 'oculto', requerido: true });
    const hiloRef = db.collection(COL.foro).doc(id);
    if (!(await hiloRef.get()).exists) throw noEncontrado('Ese tema no existe.');
    // Extensión: con `respuestaId` se modera una respuesta en lugar del hilo.
    if (b.respuestaId !== undefined) {
      const respRef = hiloRef.collection(COL.respuestas).doc(idDocumento(b.respuestaId, 'respuestaId'));
      if (!(await respRef.get()).exists) throw noEncontrado('Esa respuesta no existe.');
      await respRef.update({ oculto });
      return res.json({ id: respRef.id, hiloId: id, oculto });
    }
    await hiloRef.update({ oculto });
    res.json({ id, oculto });
  }));

  // ---------- Moderación del directorio ----------
  r.get('/admin/directorio/reportes', h(async (req, res) => {
    const estado = req.query.estado ? unoDe(String(req.query.estado), ['pendiente', 'revisado', 'descartado'], { campo: 'estado' }) : undefined;
    let q = db.collection(COL.directorioReportes);
    if (estado) q = q.where('estado', '==', estado);
    let lista;
    try { lista = docs(await q.orderBy('creado', 'desc').limit(100).get()); }
    catch (error) {
      if (!esIndiceFaltante(error)) throw error;
      ctx.logger?.warn?.('Consulta administrativa sin índice compuesto; usando fallback acotado.', { error: error?.message });
      lista = docs(await db.collection(COL.directorioReportes).get())
        .filter((item) => !estado || item.estado === estado)
        .sort((a, b) => String(b.creado).localeCompare(String(a.creado)))
        .slice(0, 100);
    }
    res.json(lista.map((x) => ({
      id: x.id, tipo: x.tipo, objetivoId: x.objetivoId, resumenObjetivo: x.resumenObjetivo,
      motivo: x.motivo, detalle: x.detalle ?? '', estado: x.estado, creado: x.creado,
      actualizado: x.actualizado, accion: x.accion ?? null,
    })));
  }));

  r.patch('/admin/directorio/reportes/:id', h(async (req, res) => {
    const id = idDocumento(req.params.id);
    const b = cuerpo(req);
    const estado = unoDe(b.estado, ['revisado', 'descartado'], { campo: 'estado', requerido: true });
    const accion = unoDe(b.accion ?? 'ninguna', ['ninguna', 'ocultar', 'cerrar'], { campo: 'accion', requerido: true });
    const ref = db.collection(COL.directorioReportes).doc(id);
    const actualizado = ahoraISO();
    const resultado = await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) throw noEncontrado('Esa denuncia no existe.');
      const reporte = snap.data();
      if (reporte.estado !== 'pendiente') throw conflicto('Esta denuncia ya fue revisada.');
      let objetivoRef = null;
      if (accion === 'ocultar') {
        if (reporte.tipo !== 'perfil') throw invalido('La acción ocultar sólo aplica a perfiles.');
        objetivoRef = db.collection(COL.directorioPerfiles).doc(reporte.objetivoId);
      }
      if (accion === 'cerrar') {
        if (reporte.tipo !== 'oportunidad') throw invalido('La acción cerrar sólo aplica a oportunidades.');
        objetivoRef = db.collection(COL.directorioOportunidades).doc(reporte.objetivoId);
      }
      if (objetivoRef) {
        const objetivo = await tx.get(objetivoRef);
        if (!objetivo.exists) throw noEncontrado('El contenido denunciado ya no existe.');
        tx.update(objetivoRef, reporte.tipo === 'perfil' ? { visible: false, actualizado } : { estado: 'cerrada', actualizado });
      }
      const cambio = { estado, accion, actualizado, revisadoPor: req.usuario.email || req.usuario.uid };
      tx.update(ref, cambio);
      return { ...reporte, ...cambio, id };
    });
    res.json({ id: resultado.id, estado: resultado.estado, accion: resultado.accion, actualizado: resultado.actualizado });
  }));

  // ---------- Quizzes ----------
  r.get('/admin/quizzes', h(async (req, res) => {
    const estado = req.query.estado ? unoDe(String(req.query.estado), ESTADOS_QUIZ, { campo: 'estado' }) : undefined;
    let q = db.collection(COL.quizzes);
    if (estado) q = q.where('estado', '==', estado);
    const lista = docs(await q.get()).sort((a, b) => String(a.cursoId).localeCompare(String(b.cursoId)) || (a.n ?? 0) - (b.n ?? 0));
    res.json(lista);
  }));

  r.patch('/admin/quizzes/:id', h(async (req, res) => {
    const id = idDocumento(req.params.id);
    const partes = /^([a-z0-9-]+)_(\d{1,3})$/.exec(id);
    if (!partes) throw invalido('El id del quiz debe tener la forma {cursoId}_{n}.');
    const b = cuerpo(req);
    const preguntas = b.preguntas === undefined ? undefined : validarPreguntas(b.preguntas);
    const estado = unoDe(b.estado, ESTADOS_QUIZ, { campo: 'estado' });
    if (preguntas === undefined && estado === undefined) throw invalido('Envía "preguntas" y/o "estado".');
    const ref = db.collection(COL.quizzes).doc(id);
    const resultado = await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const actual = snap.exists ? snap.data() : null;
      if (!actual) {
        // Alta manual de un quiz: requiere preguntas y que el curso tenga esa clase.
        if (!preguntas) throw noEncontrado('Ese quiz no existe; envía "preguntas" para crearlo.');
        const cursoSnap = await tx.get(db.collection(COL.cursos).doc(partes[1]));
        const n = Number(partes[2]);
        if (!cursoSnap.exists || !(cursoSnap.data().clases ?? []).some((c) => Number(c.n) === n)) {
          throw invalido('El curso o la clase del quiz no existen.', 'clase_no_encontrada');
        }
      }
      const preguntasCambiaron = preguntas !== undefined
        && JSON.stringify(preguntas) !== JSON.stringify(Array.isArray(actual?.preguntas) ? actual.preguntas : []);
      const version = actual ? Math.max(1, Number(actual.version) || 1) + (preguntasCambiaron ? 1 : 0) : 1;
      const nuevo = {
        ...(actual ?? { cursoId: partes[1], n: Number(partes[2]), generado: ahoraISO(), estado: 'borrador', preguntas: [] }),
        ...(preguntas !== undefined ? { preguntas } : {}),
        ...(estado !== undefined ? { estado } : {}),
        ...(preguntasCambiaron && estado === undefined ? { estado: 'borrador' } : {}),
        version,
        actualizado: ahoraISO(),
      };
      if (nuevo.estado === 'aprobado') {
        if (!Array.isArray(nuevo.preguntas) || nuevo.preguntas.length === 0) {
          throw conflicto('No se puede aprobar un quiz sin preguntas.', 'quiz_vacio');
        }
        nuevo.revisadoPor = req.usuario.email || req.usuario.uid;
      }
      tx.set(ref, nuevo);
      return nuevo;
    });
    res.json({ id, ...resultado });
  }));

  // ---------- Avisos ----------
  r.get('/admin/avisos', h(async (req, res) => {
    res.json(docs(await db.collection(COL.avisos).get()).sort((a, b) => String(b.fecha).localeCompare(String(a.fecha))));
  }));

  r.post('/admin/avisos', h(async (req, res) => {
    const b = cuerpo(req);
    const ref = db.collection(COL.avisos).doc();
    const aviso = {
      id: ref.id,
      titulo: textoRequerido(b.titulo, { campo: 'titulo', min: 3, max: LIMITES.tituloHilo }),
      texto: textoRequerido(b.texto, { campo: 'texto', min: 3, max: 2000, multilinea: true }),
      enlace: url(b.enlace, { campo: 'enlace' }) ?? null,
      fecha: ahoraISO(),
      autor: req.usuario.email || req.usuario.uid,
    };
    await ref.set(aviso);
    res.status(201).json(aviso);
  }));

  // ---------- Config ----------
  r.get('/admin/config', h(async (req, res) => {
    res.json(await leerConfig(db));
  }));

  r.patch('/admin/config', h(async (req, res) => {
    if (!esObjeto(req.body)) throw invalido('El cuerpo debe ser un objeto.');
    const cambios = validarConfig(req.body);
    if (Object.keys(cambios).length === 0) throw invalido('No enviaste ningún campo válido para actualizar.');
    await db.collection(COL.config).doc('general').set({ ...cambios, actualizado: ahoraISO() }, { merge: true });
    res.json(await leerConfig(db));
  }));

  return r;
}
