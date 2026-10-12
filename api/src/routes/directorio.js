import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { h } from '../middleware/errores.js';
import { COL, estadoMembresia, nombreVisible } from '../datos.js';
import { conflicto, invalido, noConfigurado, noEncontrado, prohibido } from '../lib/errores.js';
import { booleano, cuerpo, entero, idDocumento, listaDeTextos, sinIndefinidos, texto, textoRequerido, unoDe } from '../lib/validacion.js';

const ETAPAS = ['estudiante', 'general', 'especialista', 'docente', 'investigador', 'otro'];
const MODALIDADES = ['presencial', 'remoto', 'hibrido'];
const DISPONIBILIDAD = ['empleo', 'colaboraciones', 'mentoria', 'suplencias', 'practicas', 'consultorio'];
const TIPOS = ['empleo', 'colaboracion', 'mentoria', 'suplencia', 'practicas', 'consultorio'];
const FOTO_CONTENT_TYPE = 'image/webp';
const fotoPath = (uid) => `directorio/perfiles/${uid}/avatar.webp`;
const fotoUrl = (bucket, uid) => `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(fotoPath(uid))}?alt=media`;

const perfilPublico = (p, uid) => ({
  uid: p.uid, nombre: p.nombre, titular: p.titular, etapa: p.etapa,
  especialidades: p.especialidades ?? [], ciudad: p.ciudad ?? '', estado: p.estado ?? '',
  modalidades: p.modalidades ?? [], disponibilidad: p.disponibilidad ?? [],
  habilidades: p.habilidades ?? [], bio: p.bio ?? '', foto: p.foto ?? null, actualizado: p.actualizado,
  esMio: p.uid === uid,
});

const oportunidadPublica = (o, uid) => ({
  id: o.id, autorUid: o.autorUid, autor: o.autor, titulo: o.titulo, tipo: o.tipo,
  organizacion: o.organizacion, modalidad: o.modalidad, ciudad: o.ciudad ?? '',
  estado: o.estado, entidad: o.entidad ?? '', especialidades: o.especialidades ?? [],
  resumen: o.resumen, requisitos: o.requisitos ?? '', compensacion: o.compensacion ?? '',
  fecha: o.fecha, expira: o.expira, esMia: o.autorUid === uid,
});

function validarPerfil(body, anterior, usuario, nombre, bucket) {
  const contactoCanal = unoDe(body.contacto?.canal, ['correo', 'whatsapp'], { campo: 'contacto.canal' }) ?? anterior?.contacto?.canal ?? 'correo';
  const contactoValor = contactoCanal === 'correo'
    ? String(usuario.email || '').trim().toLowerCase()
    : textoRequerido(body.contacto?.valor ?? anterior?.contacto?.valor, { campo: 'contacto.valor', max: 30 });
  return sinIndefinidos({
    uid: usuario.uid,
    nombre,
    titular: textoRequerido(body.titular, { campo: 'titular', max: 100 }),
    etapa: unoDe(body.etapa, ETAPAS, { campo: 'etapa', requerido: true }),
    especialidades: listaDeTextos(body.especialidades, { campo: 'especialidades', maxItems: 4, maxLargo: 60 }) ?? [],
    ciudad: texto(body.ciudad, { campo: 'ciudad', max: 80 }) ?? '',
    estado: texto(body.estado, { campo: 'estado', max: 80 }) ?? '',
    modalidades: (listaDeTextos(body.modalidades, { campo: 'modalidades', maxItems: 3, maxLargo: 20 }) ?? []).map((v) => unoDe(v, MODALIDADES, { campo: 'modalidades', requerido: true })),
    disponibilidad: (listaDeTextos(body.disponibilidad, { campo: 'disponibilidad', maxItems: 6, maxLargo: 30 }) ?? []).map((v) => unoDe(v, DISPONIBILIDAD, { campo: 'disponibilidad', requerido: true })),
    habilidades: listaDeTextos(body.habilidades, { campo: 'habilidades', maxItems: 10, maxLargo: 60 }) ?? [],
    bio: textoRequerido(body.bio, { campo: 'bio', min: 30, max: 600, multilinea: true }),
    visible: booleano(body.visible, { campo: 'visible' }) ?? true,
    contacto: { canal: contactoCanal, valor: contactoValor },
    foto: body.foto === null ? null : body.foto === 'propia' && bucket ? fotoUrl(bucket, usuario.uid) : anterior?.foto ?? null,
  });
}

export function rutasDirectorio(ctx) {
  const r = Router();
  const auth = requireAuth(ctx);

  r.get('/directorio', auth, h(async (req, res) => {
    const [perfilesSnap, oportunidadesSnap, conexionesSnap] = await Promise.all([
      ctx.db.collection(COL.directorioPerfiles).get(),
      ctx.db.collection(COL.directorioOportunidades).get(),
      ctx.db.collection(COL.directorioConexiones).get(),
    ]);
    const uid = req.usuario.uid;
    const todosPerfiles = perfilesSnap.docs.map((d) => ({ ...d.data(), uid: d.id }));
    const mapa = new Map(todosPerfiles.map((p) => [p.uid, p]));
    const perfiles = todosPerfiles.filter((p) => p.visible === true || p.uid === uid).map((p) => perfilPublico(p, uid));
    const ahora = ctx.now().toISOString();
    const oportunidades = oportunidadesSnap.docs.map((d) => ({ ...d.data(), id: d.id }))
      .filter((o) => o.autorUid === uid || (o.estado === 'publicada' && (!o.expira || o.expira >= ahora)))
      .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha))).map((o) => oportunidadPublica(o, uid));
    const conexiones = conexionesSnap.docs.map((d) => ({ ...d.data(), id: d.id }))
      .filter((c) => c.deUid === uid || c.paraUid === uid)
      .sort((a, b) => String(b.creado).localeCompare(String(a.creado)))
      .map((c) => {
        const otraUid = c.deUid === uid ? c.paraUid : c.deUid;
        const otra = mapa.get(otraUid);
        return {
          id: c.id, deUid: c.deUid, paraUid: c.paraUid, oportunidadId: c.oportunidadId ?? null,
          mensaje: c.mensaje, estado: c.estado, creado: c.creado, actualizado: c.actualizado,
          esEntrante: c.paraUid === uid, otraPersona: otra?.nombre ?? 'Miembro OdonTeck',
          contacto: c.estado === 'aceptada' && otra?.contacto ? otra.contacto : null,
        };
      });
    res.json({ perfiles, oportunidades, conexiones, miPerfil: mapa.has(uid) ? { ...perfilPublico(mapa.get(uid), uid), visible: mapa.get(uid).visible, contacto: mapa.get(uid).contacto ?? null } : null });
  }));

  r.put('/directorio/perfil', auth, h(async (req, res) => {
    const ref = ctx.db.collection(COL.directorioPerfiles).doc(req.usuario.uid);
    const previo = await ref.get();
    const estado = await estadoMembresia(ctx, req.usuario);
    const nombre = await nombreVisible(ctx, req.usuario, estado.miembro);
    const datos = validarPerfil(cuerpo(req), previo.exists ? previo.data() : null, req.usuario, nombre, ctx.config.storageBucket);
    const guardado = { ...datos, actualizado: ctx.now().toISOString() };
    await ref.set(guardado);
    res.json({ ...perfilPublico(guardado, req.usuario.uid), visible: guardado.visible });
  }));

  r.post('/directorio/perfil/foto/subida', auth, h(async (req, res) => {
    if (!ctx.storage || !ctx.config.storageBucket) throw noConfigurado('El almacenamiento de fotos no está configurado en el servidor.');
    const b = cuerpo(req);
    if (b.contentType !== FOTO_CONTENT_TYPE) throw invalido('La foto debe procesarse como WebP.', 'tipo_no_permitido');
    const bytes = entero(b.bytes, { campo: 'bytes', min: 1, max: 2_000_000 });
    const bucket = ctx.storage.bucket(ctx.config.storageBucket);
    const path = fotoPath(req.usuario.uid);
    const expires = ctx.now().getTime() + 10 * 60 * 1000;
    const [uploadUrl] = await bucket.file(path).getSignedUrl({ version: 'v4', action: 'write', expires, contentType: FOTO_CONTENT_TYPE });
    res.json({ uploadUrl, path, publicUrl: fotoUrl(bucket.name, req.usuario.uid), contentType: FOTO_CONTENT_TYPE, bytes, expira: new Date(expires).toISOString() });
  }));

  r.delete('/directorio/perfil/foto', auth, h(async (req, res) => {
    if (!ctx.storage || !ctx.config.storageBucket) throw noConfigurado('El almacenamiento de fotos no está configurado en el servidor.');
    await ctx.storage.bucket(ctx.config.storageBucket).file(fotoPath(req.usuario.uid)).delete({ ignoreNotFound: true });
    const ref = ctx.db.collection(COL.directorioPerfiles).doc(req.usuario.uid);
    const snap = await ref.get();
    if (snap.exists) await ref.update({ foto: null, actualizado: ctx.now().toISOString() });
    res.json({ ok: true });
  }));

  r.post('/directorio/oportunidades', auth, h(async (req, res) => {
    const membresia = await estadoMembresia(ctx, req.usuario);
    if (!membresia.esVip) throw prohibido('Publicar oportunidades es un beneficio VIP. Puedes explorar y conectar gratis.');
    const body = cuerpo(req);
    const fecha = ctx.now();
    const ref = ctx.db.collection(COL.directorioOportunidades).doc();
    const datos = {
      id: ref.id, autorUid: req.usuario.uid, autor: await nombreVisible(ctx, req.usuario, membresia.miembro),
      titulo: textoRequerido(body.titulo, { campo: 'titulo', min: 8, max: 120 }),
      tipo: unoDe(body.tipo, TIPOS, { campo: 'tipo', requerido: true }),
      organizacion: textoRequerido(body.organizacion, { campo: 'organizacion', max: 120 }),
      modalidad: unoDe(body.modalidad, MODALIDADES, { campo: 'modalidad', requerido: true }),
      ciudad: texto(body.ciudad, { campo: 'ciudad', max: 80 }) ?? '',
      entidad: texto(body.entidad, { campo: 'entidad', max: 80 }) ?? '',
      especialidades: listaDeTextos(body.especialidades, { campo: 'especialidades', maxItems: 4, maxLargo: 60 }) ?? [],
      resumen: textoRequerido(body.resumen, { campo: 'resumen', min: 40, max: 1000, multilinea: true }),
      requisitos: texto(body.requisitos, { campo: 'requisitos', max: 1000, multilinea: true }) ?? '',
      compensacion: texto(body.compensacion, { campo: 'compensacion', max: 180 }) ?? '',
      estado: 'publicada', fecha: fecha.toISOString(), expira: new Date(fecha.getTime() + 45 * 86400000).toISOString(),
    };
    await ref.set(datos);
    res.status(201).json(oportunidadPublica(datos, req.usuario.uid));
  }));

  r.patch('/directorio/oportunidades/:id', auth, h(async (req, res) => {
    const ref = ctx.db.collection(COL.directorioOportunidades).doc(idDocumento(req.params.id));
    const snap = await ref.get();
    if (!snap.exists) throw noEncontrado('No encontramos la oportunidad.');
    const actual = snap.data();
    if (actual.autorUid !== req.usuario.uid && !req.usuario.esAdmin) throw prohibido();
    const estado = unoDe(cuerpo(req).estado, ['publicada', 'cerrada'], { campo: 'estado', requerido: true });
    await ref.update({ estado, actualizado: ctx.now().toISOString() });
    res.json(oportunidadPublica({ ...actual, estado, id: ref.id }, req.usuario.uid));
  }));

  r.post('/directorio/conexiones', auth, h(async (req, res) => {
    const body = cuerpo(req);
    let paraUid = body.paraUid ? idDocumento(body.paraUid, 'paraUid') : null;
    const oportunidadId = body.oportunidadId ? idDocumento(body.oportunidadId, 'oportunidadId') : null;
    if (oportunidadId) {
      const op = await ctx.db.collection(COL.directorioOportunidades).doc(oportunidadId).get();
      if (!op.exists || op.data().estado !== 'publicada') throw noEncontrado('La oportunidad ya no está disponible.');
      paraUid = op.data().autorUid;
    }
    if (!paraUid) throw noEncontrado('Selecciona una persona u oportunidad.');
    if (paraUid === req.usuario.uid) throw conflicto('No puedes enviarte una solicitud a ti mismo.');
    const destino = await ctx.db.collection(COL.directorioPerfiles).doc(paraUid).get();
    if (!destino.exists || destino.data().visible !== true) throw noEncontrado('Ese perfil ya no está disponible.');
    const existentes = await ctx.db.collection(COL.directorioConexiones).get();
    const repetida = existentes.docs.some((d) => {
      const c = d.data();
      return c.deUid === req.usuario.uid && c.paraUid === paraUid && (c.oportunidadId ?? null) === oportunidadId && ['pendiente', 'aceptada'].includes(c.estado);
    });
    if (repetida) throw conflicto('Ya existe una solicitud activa con esta persona.');
    const ref = ctx.db.collection(COL.directorioConexiones).doc();
    const ahora = ctx.now().toISOString();
    const datos = { id: ref.id, deUid: req.usuario.uid, paraUid, oportunidadId, mensaje: textoRequerido(body.mensaje, { campo: 'mensaje', min: 20, max: 500, multilinea: true }), estado: 'pendiente', creado: ahora, actualizado: ahora };
    await ref.set(datos);
    res.status(201).json({ ...datos, esEntrante: false, otraPersona: destino.data().nombre, contacto: null });
  }));

  r.patch('/directorio/conexiones/:id', auth, h(async (req, res) => {
    const ref = ctx.db.collection(COL.directorioConexiones).doc(idDocumento(req.params.id));
    const snap = await ref.get();
    if (!snap.exists) throw noEncontrado('No encontramos la solicitud.');
    const actual = snap.data();
    if (actual.paraUid !== req.usuario.uid) throw prohibido('Solo quien recibe puede responder esta solicitud.');
    if (actual.estado !== 'pendiente') throw conflicto('Esta solicitud ya fue respondida.');
    const estado = unoDe(cuerpo(req).estado, ['aceptada', 'rechazada'], { campo: 'estado', requerido: true });
    await ref.update({ estado, actualizado: ctx.now().toISOString() });
    const otra = await ctx.db.collection(COL.directorioPerfiles).doc(actual.deUid).get();
    res.json({ ...actual, id: ref.id, estado, actualizado: ctx.now().toISOString(), esEntrante: true, otraPersona: otra.data()?.nombre ?? 'Miembro OdonTeck', contacto: estado === 'aceptada' ? otra.data()?.contacto ?? null : null });
  }));

  return r;
}
