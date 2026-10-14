import { createHash } from 'node:crypto';
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { h } from '../middleware/errores.js';
import { COL, estadoMembresia, nombreVisible } from '../datos.js';
import { conflicto, demasiadasSolicitudes, invalido, noConfigurado, noEncontrado, prohibido } from '../lib/errores.js';
import { booleano, cuerpo, entero, idDocumento, listaDeTextos, sinIndefinidos, texto, textoRequerido, unoDe } from '../lib/validacion.js';

const ETAPAS = ['estudiante', 'general', 'especialista', 'docente', 'investigador', 'otro'];
const MODALIDADES = ['presencial', 'remoto', 'hibrido'];
const DISPONIBILIDAD = ['empleo', 'colaboraciones', 'mentoria', 'suplencias', 'practicas', 'consultorio'];
const TIPOS = ['empleo', 'colaboracion', 'mentoria', 'suplencia', 'practicas', 'consultorio'];
const FOTO_CONTENT_TYPE = 'image/webp';
const FOTO_MAX_BYTES = 2_000_000;
const BANNER_MAX_BYTES = 3_000_000;
const LIMITE_PAGINA = 24;
const LIMITE_CONEXIONES = 100;
const MAX_CONEXIONES_DIA = 10;
const MAX_OPORTUNIDADES_ACTIVAS = 3;
const MAX_REPORTES_DIA = 10;
const REINTENTO_RECHAZADO_MS = 30 * 86400000;
const MOTIVOS_REPORTE = ['spam', 'suplantacion', 'contenido_inapropiado', 'datos_falsos', 'otro'];
const fotoPath = (uid) => `directorio/perfiles/${uid}/avatar.webp`;
const bannerPath = (uid) => `directorio/perfiles/${uid}/banner.webp`;
const assetUrl = (bucket, path) => `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(path)}?alt=media`;
const idEstable = (...partes) => createHash('sha256').update(partes.join('|')).digest('hex').slice(0, 40);
const unicoPorId = (lista) => [...new Map(lista.map((v) => [v.id ?? v.uid, v])).values()];
const cursor = (valor, campo) => valor === undefined ? null : idDocumento(String(valor), campo);
const esIndiceFaltante = (error) => error?.code === 9 || error?.code === 'failed-precondition' || /index/i.test(String(error?.message ?? ''));
const ordenarDocs = (snap, campo) => [...snap.docs].sort((a, b) => String(b.data()?.[campo] ?? '').localeCompare(String(a.data()?.[campo] ?? '')) || a.id.localeCompare(b.id));
const assetVersionado = (url, actualizado) => url ? `${url}${url.includes('?') ? '&' : '?'}v=${encodeURIComponent(actualizado ?? '')}` : null;
const limitarTrasCursor = (docs, cursorId, limite) => {
  const inicio = cursorId ? docs.findIndex((doc) => doc.id === cursorId) + 1 : 0;
  return docs.slice(Math.max(0, inicio), Math.max(0, inicio) + limite);
};

async function conFallbackDeIndice(principal, alternativa, logger) {
  try { return await principal(); }
  catch (error) {
    if (!esIndiceFaltante(error)) throw error;
    logger?.warn?.('Consulta sin índice compuesto; usando fallback acotado.', { error: error?.message });
    return alternativa();
  }
}

const perfilPublico = (p, uid) => ({
  uid: p.uid, nombre: p.nombre, titular: p.titular, etapa: p.etapa,
  especialidades: p.especialidades ?? [], ciudad: p.ciudad ?? '', estado: p.estado ?? '',
  modalidades: p.modalidades ?? [], disponibilidad: p.disponibilidad ?? [],
  habilidades: p.habilidades ?? [], bio: p.bio ?? '', foto: assetVersionado(p.foto, p.actualizado), banner: assetVersionado(p.banner, p.actualizado),
  anosExperiencia: p.anosExperiencia ?? null, idiomas: p.idiomas ?? [], experiencia: p.experiencia ?? [],
  formacion: p.formacion ?? [], credenciales: p.credenciales ?? [], actualizado: p.actualizado,
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
    idiomas: listaDeTextos(body.idiomas, { campo: 'idiomas', maxItems: 6, maxLargo: 40 }) ?? anterior?.idiomas ?? [],
    anosExperiencia: body.anosExperiencia === null ? null : entero(body.anosExperiencia, { campo: 'anosExperiencia', min: 0, max: 70, requerido: false }) ?? anterior?.anosExperiencia ?? null,
    experiencia: validarExperiencia(body.experiencia ?? anterior?.experiencia ?? []),
    formacion: validarFormacion(body.formacion ?? anterior?.formacion ?? []),
    credenciales: validarCredenciales(body.credenciales ?? anterior?.credenciales ?? []),
    bio: textoRequerido(body.bio, { campo: 'bio', min: 30, max: 600, multilinea: true }),
    visible: booleano(body.visible, { campo: 'visible' }) ?? true,
    contacto: { canal: contactoCanal, valor: contactoValor },
    foto: body.foto === null ? null : body.foto === 'propia' && bucket ? assetUrl(bucket, fotoPath(usuario.uid)) : anterior?.foto ?? null,
    banner: body.banner === null ? null : body.banner === 'propio' && bucket ? assetUrl(bucket, bannerPath(usuario.uid)) : anterior?.banner ?? null,
  });
}

function listaEstructurada(valor, campo, maxItems, normalizar) {
  if (!Array.isArray(valor) || valor.length > maxItems) throw invalido(`El campo "${campo}" debe ser una lista de hasta ${maxItems} registros.`);
  return valor.map((item, indice) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) throw invalido(`El registro "${campo}[${indice}]" no es válido.`);
    return normalizar(item, `${campo}[${indice}]`);
  });
}

const validarExperiencia = (valor) => listaEstructurada(valor, 'experiencia', 8, (item, campo) => ({
  puesto: textoRequerido(item.puesto, { campo: `${campo}.puesto`, max: 100 }),
  organizacion: textoRequerido(item.organizacion, { campo: `${campo}.organizacion`, max: 120 }),
  periodo: textoRequerido(item.periodo, { campo: `${campo}.periodo`, max: 60 }),
  descripcion: texto(item.descripcion, { campo: `${campo}.descripcion`, max: 500, multilinea: true }) ?? '',
}));

const validarFormacion = (valor) => listaEstructurada(valor, 'formacion', 8, (item, campo) => ({
  programa: textoRequerido(item.programa, { campo: `${campo}.programa`, max: 120 }),
  institucion: textoRequerido(item.institucion, { campo: `${campo}.institucion`, max: 120 }),
  periodo: textoRequerido(item.periodo, { campo: `${campo}.periodo`, max: 60 }),
}));

const validarCredenciales = (valor) => listaEstructurada(valor, 'credenciales', 12, (item, campo) => ({
  nombre: textoRequerido(item.nombre, { campo: `${campo}.nombre`, max: 120 }),
  emisor: texto(item.emisor, { campo: `${campo}.emisor`, max: 120 }) ?? '',
  anio: texto(item.anio, { campo: `${campo}.anio`, max: 20 }) ?? '',
}));

async function validarAssetSubido(ctx, uid, tipo) {
  if (!ctx.storage || !ctx.config.storageBucket) throw noConfigurado('El almacenamiento de fotos no está configurado en el servidor.');
  const esBanner = tipo === 'banner';
  const path = esBanner ? bannerPath(uid) : fotoPath(uid);
  const maxBytes = esBanner ? BANNER_MAX_BYTES : FOTO_MAX_BYTES;
  const archivo = ctx.storage.bucket(ctx.config.storageBucket).file(path);
  let metadata;
  try { [metadata] = await archivo.getMetadata(); }
  catch { throw invalido('No encontramos la foto subida. Vuelve a seleccionarla.', 'foto_no_subida'); }
  const bytes = Number(metadata?.size);
  if (metadata?.contentType !== FOTO_CONTENT_TYPE || !Number.isFinite(bytes) || bytes < 1 || bytes > maxBytes) {
    await archivo.delete({ ignoreNotFound: true });
    throw invalido(`La ${esBanner ? 'portada' : 'foto'} subida no es un WebP válido de hasta ${maxBytes / 1_000_000} MB.`, esBanner ? 'banner_invalido' : 'foto_invalida');
  }
}

export function rutasDirectorio(ctx) {
  const r = Router();
  const auth = requireAuth(ctx);

  r.get('/directorio', auth, h(async (req, res) => {
    const uid = req.usuario.uid;
    const limite = entero(req.query.limite ?? LIMITE_PAGINA, { campo: 'limite', min: 6, max: 48 });
    const perfilesAntes = cursor(req.query.perfilesAntes, 'perfilesAntes');
    const oportunidadesAntes = cursor(req.query.oportunidadesAntes, 'oportunidadesAntes');
    const [perfilCursor, oportunidadCursor] = await Promise.all([
      perfilesAntes ? ctx.db.collection(COL.directorioPerfiles).doc(perfilesAntes).get() : null,
      oportunidadesAntes ? ctx.db.collection(COL.directorioOportunidades).doc(oportunidadesAntes).get() : null,
    ]);
    if (perfilesAntes && !perfilCursor?.exists) throw invalido('El cursor de perfiles ya no es válido.', 'cursor_invalido');
    if (oportunidadesAntes && !oportunidadCursor?.exists) throw invalido('El cursor de oportunidades ya no es válido.', 'cursor_invalido');
    let qPerfiles = ctx.db.collection(COL.directorioPerfiles).where('visible', '==', true).orderBy('actualizado', 'desc').limit(limite + 1);
    if (perfilCursor) qPerfiles = qPerfiles.startAfter(perfilCursor);
    let qOportunidades = ctx.db.collection(COL.directorioOportunidades).where('estado', '==', 'publicada').orderBy('fecha', 'desc').limit(limite + 1);
    if (oportunidadCursor) qOportunidades = qOportunidades.startAfter(oportunidadCursor);
    const propiaRef = ctx.db.collection(COL.directorioPerfiles).doc(uid);
    const consultas = [
      conFallbackDeIndice(
        () => qPerfiles.get(),
        async () => ({ docs: limitarTrasCursor(ordenarDocs(await ctx.db.collection(COL.directorioPerfiles).where('visible', '==', true).get(), 'actualizado'), perfilesAntes, limite + 1) }),
        ctx.logger,
      ),
      conFallbackDeIndice(
        () => qOportunidades.get(),
        async () => ({ docs: limitarTrasCursor(ordenarDocs(await ctx.db.collection(COL.directorioOportunidades).where('estado', '==', 'publicada').get(), 'fecha'), oportunidadesAntes, limite + 1) }),
        ctx.logger,
      ),
      propiaRef.get(),
      conFallbackDeIndice(
        () => ctx.db.collection(COL.directorioConexiones).where('deUid', '==', uid).orderBy('creado', 'desc').limit(LIMITE_CONEXIONES + 1).get(),
        async () => ({ docs: ordenarDocs(await ctx.db.collection(COL.directorioConexiones).where('deUid', '==', uid).get(), 'creado').slice(0, LIMITE_CONEXIONES + 1) }),
        ctx.logger,
      ),
      conFallbackDeIndice(
        () => ctx.db.collection(COL.directorioConexiones).where('paraUid', '==', uid).orderBy('creado', 'desc').limit(LIMITE_CONEXIONES + 1).get(),
        async () => ({ docs: ordenarDocs(await ctx.db.collection(COL.directorioConexiones).where('paraUid', '==', uid).get(), 'creado').slice(0, LIMITE_CONEXIONES + 1) }),
        ctx.logger,
      ),
      oportunidadesAntes ? Promise.resolve(null) : conFallbackDeIndice(
        () => ctx.db.collection(COL.directorioOportunidades).where('autorUid', '==', uid).orderBy('fecha', 'desc').limit(20).get(),
        async () => ({ docs: ordenarDocs(await ctx.db.collection(COL.directorioOportunidades).where('autorUid', '==', uid).get(), 'fecha').slice(0, 20) }),
        ctx.logger,
      ),
    ];
    const [perfilesSnap, oportunidadesSnap, propiaSnap, conexionesSalientes, conexionesEntrantes, oportunidadesPropias] = await Promise.all(consultas);
    const paginaPerfiles = perfilesSnap.docs.slice(0, limite);
    const paginaOportunidades = oportunidadesSnap.docs.slice(0, limite);
    const propios = propiaSnap.exists ? [{ ...propiaSnap.data(), uid }] : [];
    const perfilesBase = [...paginaPerfiles.map((d) => ({ ...d.data(), uid: d.id })), ...(!perfilesAntes ? propios : [])];
    const perfiles = unicoPorId(perfilesBase).map((p) => perfilPublico(p, uid));
    const ahora = ctx.now().toISOString();
    const oportunidadesBase = [
      ...paginaOportunidades.map((d) => ({ ...d.data(), id: d.id })).filter((o) => !o.expira || o.expira >= ahora),
      ...(oportunidadesPropias?.docs ?? []).map((d) => ({ ...d.data(), id: d.id })),
    ];
    const oportunidades = unicoPorId(oportunidadesBase).sort((a, b) => String(b.fecha).localeCompare(String(a.fecha))).map((o) => oportunidadPublica(o, uid));
    const conexionesBase = unicoPorId([...conexionesSalientes.docs, ...conexionesEntrantes.docs].map((d) => ({ ...d.data(), id: d.id })))
      .sort((a, b) => String(b.creado).localeCompare(String(a.creado)))
      .slice(0, LIMITE_CONEXIONES);
    const uidsOtraPersona = [...new Set(conexionesBase.map((c) => c.deUid === uid ? c.paraUid : c.deUid))];
    const otros = await Promise.all(uidsOtraPersona.map(async (id) => {
      const snap = await ctx.db.collection(COL.directorioPerfiles).doc(id).get();
      return snap.exists ? [id, snap.data()] : [id, null];
    }));
    const mapa = new Map([...otros, ...(propiaSnap.exists ? [[uid, propiaSnap.data()]] : [])]);
    const conexiones = conexionesBase
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
    res.json({
      perfiles, oportunidades, conexiones,
      miPerfil: propiaSnap.exists ? { ...perfilPublico({ ...propiaSnap.data(), uid }, uid), visible: propiaSnap.data().visible, contacto: propiaSnap.data().contacto ?? null } : null,
      paginacion: {
        perfiles: { hayMas: perfilesSnap.docs.length > limite, siguiente: perfilesSnap.docs.length > limite ? paginaPerfiles.at(-1)?.id ?? null : null },
        oportunidades: { hayMas: oportunidadesSnap.docs.length > limite, siguiente: oportunidadesSnap.docs.length > limite ? paginaOportunidades.at(-1)?.id ?? null : null },
        conexiones: { truncadas: conexionesSalientes.docs.length > LIMITE_CONEXIONES || conexionesEntrantes.docs.length > LIMITE_CONEXIONES },
      },
    });
  }));

  r.put('/directorio/perfil', auth, h(async (req, res) => {
    const ref = ctx.db.collection(COL.directorioPerfiles).doc(req.usuario.uid);
    const previo = await ref.get();
    const estado = await estadoMembresia(ctx, req.usuario);
    const nombre = await nombreVisible(ctx, req.usuario, estado.miembro);
    const body = cuerpo(req);
    if (body.foto === 'propia') await validarAssetSubido(ctx, req.usuario.uid, 'foto');
    if (body.banner === 'propio') await validarAssetSubido(ctx, req.usuario.uid, 'banner');
    const datos = validarPerfil(body, previo.exists ? previo.data() : null, req.usuario, nombre, ctx.config.storageBucket);
    const guardado = { ...datos, actualizado: ctx.now().toISOString() };
    await ref.set(guardado);
    res.json({ ...perfilPublico(guardado, req.usuario.uid), visible: guardado.visible });
  }));

  r.delete('/directorio/perfil', auth, h(async (req, res) => {
    const uid = req.usuario.uid;
    const ref = ctx.db.collection(COL.directorioPerfiles).doc(uid);
    if (!(await ref.get()).exists) throw noEncontrado('No tienes un perfil en el directorio.');
    const [oportunidades, salientes, entrantes] = await Promise.all([
      ctx.db.collection(COL.directorioOportunidades).where('autorUid', '==', uid).get(),
      ctx.db.collection(COL.directorioConexiones).where('deUid', '==', uid).get(),
      ctx.db.collection(COL.directorioConexiones).where('paraUid', '==', uid).get(),
    ]);
    const batch = ctx.db.batch();
    const actualizado = ctx.now().toISOString();
    oportunidades.docs.filter((d) => d.data().estado === 'publicada').forEach((d) => batch.update(d.ref, { estado: 'cerrada', actualizado }));
    unicoPorId([...salientes.docs, ...entrantes.docs]).filter((d) => d.data().estado === 'pendiente').forEach((d) => batch.update(d.ref, { estado: 'rechazada', actualizado }));
    batch.delete(ref);
    await batch.commit();
    if (ctx.storage && ctx.config.storageBucket) {
      try {
        const bucket = ctx.storage.bucket(ctx.config.storageBucket);
        await Promise.all([bucket.file(fotoPath(uid)).delete({ ignoreNotFound: true }), bucket.file(bannerPath(uid)).delete({ ignoreNotFound: true })]);
      }
      catch (error) { ctx.logger?.warn?.('No se pudo retirar la foto del perfil eliminado.', { uid, error: error?.message }); }
    }
    res.json({ ok: true });
  }));

  r.post('/directorio/perfil/foto/subida', auth, h(async (req, res) => {
    if (!ctx.storage || !ctx.config.storageBucket) throw noConfigurado('El almacenamiento de fotos no está configurado en el servidor.');
    const b = cuerpo(req);
    if (b.contentType !== FOTO_CONTENT_TYPE) throw invalido('La foto debe procesarse como WebP.', 'tipo_no_permitido');
    const bytes = entero(b.bytes, { campo: 'bytes', min: 1, max: FOTO_MAX_BYTES });
    const bucket = ctx.storage.bucket(ctx.config.storageBucket);
    const path = fotoPath(req.usuario.uid);
    const expires = ctx.now().getTime() + 10 * 60 * 1000;
    const [uploadUrl] = await bucket.file(path).getSignedUrl({ version: 'v4', action: 'write', expires, contentType: FOTO_CONTENT_TYPE });
    res.json({ uploadUrl, path, publicUrl: assetUrl(bucket.name, path), contentType: FOTO_CONTENT_TYPE, bytes, expira: new Date(expires).toISOString() });
  }));

  r.delete('/directorio/perfil/foto', auth, h(async (req, res) => {
    if (!ctx.storage || !ctx.config.storageBucket) throw noConfigurado('El almacenamiento de fotos no está configurado en el servidor.');
    await ctx.storage.bucket(ctx.config.storageBucket).file(fotoPath(req.usuario.uid)).delete({ ignoreNotFound: true });
    const ref = ctx.db.collection(COL.directorioPerfiles).doc(req.usuario.uid);
    const snap = await ref.get();
    if (snap.exists) await ref.update({ foto: null, actualizado: ctx.now().toISOString() });
    res.json({ ok: true });
  }));

  r.post('/directorio/perfil/banner/subida', auth, h(async (req, res) => {
    if (!ctx.storage || !ctx.config.storageBucket) throw noConfigurado('El almacenamiento de portadas no está configurado en el servidor.');
    const b = cuerpo(req);
    if (b.contentType !== FOTO_CONTENT_TYPE) throw invalido('La portada debe procesarse como WebP.', 'tipo_no_permitido');
    const bytes = entero(b.bytes, { campo: 'bytes', min: 1, max: BANNER_MAX_BYTES });
    const bucket = ctx.storage.bucket(ctx.config.storageBucket);
    const path = bannerPath(req.usuario.uid);
    const expires = ctx.now().getTime() + 10 * 60 * 1000;
    const [uploadUrl] = await bucket.file(path).getSignedUrl({ version: 'v4', action: 'write', expires, contentType: FOTO_CONTENT_TYPE });
    res.json({ uploadUrl, path, publicUrl: assetUrl(bucket.name, path), contentType: FOTO_CONTENT_TYPE, bytes, expira: new Date(expires).toISOString() });
  }));

  r.delete('/directorio/perfil/banner', auth, h(async (req, res) => {
    if (!ctx.storage || !ctx.config.storageBucket) throw noConfigurado('El almacenamiento de portadas no está configurado en el servidor.');
    await ctx.storage.bucket(ctx.config.storageBucket).file(bannerPath(req.usuario.uid)).delete({ ignoreNotFound: true });
    const ref = ctx.db.collection(COL.directorioPerfiles).doc(req.usuario.uid);
    const snap = await ref.get();
    if (snap.exists) await ref.update({ banner: null, actualizado: ctx.now().toISOString() });
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
    await ctx.db.runTransaction(async (tx) => {
      const oportunidades = await tx.get(ctx.db.collection(COL.directorioOportunidades).where('autorUid', '==', req.usuario.uid));
      const activas = oportunidades.docs.filter((doc) => doc.data().estado === 'publicada');
      if (activas.length >= MAX_OPORTUNIDADES_ACTIVAS) throw conflicto(`Puedes mantener hasta ${MAX_OPORTUNIDADES_ACTIVAS} oportunidades activas. Cierra una antes de publicar otra.`, 'limite_oportunidades');
      tx.create(ref, datos);
    });
    res.status(201).json(oportunidadPublica(datos, req.usuario.uid));
  }));

  r.patch('/directorio/oportunidades/:id', auth, h(async (req, res) => {
    const ref = ctx.db.collection(COL.directorioOportunidades).doc(idDocumento(req.params.id));
    const snap = await ref.get();
    if (!snap.exists) throw noEncontrado('No encontramos la oportunidad.');
    const actual = snap.data();
    if (actual.autorUid !== req.usuario.uid && !req.usuario.esAdmin) throw prohibido();
    const estado = unoDe(cuerpo(req).estado, ['cerrada'], { campo: 'estado', requerido: true });
    await ref.update({ estado, actualizado: ctx.now().toISOString() });
    res.json(oportunidadPublica({ ...actual, estado, id: ref.id }, req.usuario.uid));
  }));

  r.post('/directorio/conexiones', auth, h(async (req, res) => {
    const body = cuerpo(req);
    let paraUid = body.paraUid ? idDocumento(body.paraUid, 'paraUid') : null;
    const oportunidadId = body.oportunidadId ? idDocumento(body.oportunidadId, 'oportunidadId') : null;
    if (oportunidadId) {
      const op = await ctx.db.collection(COL.directorioOportunidades).doc(oportunidadId).get();
      if (!op.exists || op.data().estado !== 'publicada' || (op.data().expira && op.data().expira < ctx.now().toISOString())) throw noEncontrado('La oportunidad ya no está disponible.');
      paraUid = op.data().autorUid;
    }
    if (!paraUid) throw noEncontrado('Selecciona una persona u oportunidad.');
    if (paraUid === req.usuario.uid) throw conflicto('No puedes enviarte una solicitud a ti mismo.');
    const destino = await ctx.db.collection(COL.directorioPerfiles).doc(paraUid).get();
    if (!destino.exists || destino.data().visible !== true) throw noEncontrado('Ese perfil ya no está disponible.');
    const ref = ctx.db.collection(COL.directorioConexiones).doc(idEstable(req.usuario.uid, paraUid, oportunidadId ?? 'perfil'));
    const ahora = ctx.now().toISOString();
    const datos = { id: ref.id, deUid: req.usuario.uid, paraUid, oportunidadId, mensaje: textoRequerido(body.mensaje, { campo: 'mensaje', min: 20, max: 500, multilinea: true }), estado: 'pendiente', creado: ahora, actualizado: ahora };
    await ctx.db.runTransaction(async (tx) => {
      const existente = await tx.get(ref);
      const desde = new Date(ctx.now().getTime() - 86400000).toISOString();
      const conexiones = await tx.get(ctx.db.collection(COL.directorioConexiones).where('deUid', '==', req.usuario.uid));
      const recientes = conexiones.docs.filter((doc) => doc.data().creado >= desde);
      if (recientes.length >= MAX_CONEXIONES_DIA) throw demasiadasSolicitudes(`Puedes enviar hasta ${MAX_CONEXIONES_DIA} solicitudes de conexión cada 24 horas.`);
      if (existente.exists) {
        const actual = existente.data();
        if (['pendiente', 'aceptada'].includes(actual.estado)) throw conflicto('Ya existe una solicitud activa con esta persona.');
        const reintentoEn = new Date(actual.actualizado ?? actual.creado ?? 0).getTime() + REINTENTO_RECHAZADO_MS;
        if (reintentoEn > ctx.now().getTime()) throw conflicto('Esta solicitud fue declinada recientemente. Respeta la decisión antes de volver a intentarlo.', 'reintento_bloqueado');
      }
      tx.set(ref, datos);
    });
    res.status(201).json({ ...datos, esEntrante: false, otraPersona: destino.data().nombre, contacto: null });
  }));

  r.post('/directorio/reportes', auth, h(async (req, res) => {
    const body = cuerpo(req);
    const tipo = unoDe(body.tipo, ['perfil', 'oportunidad'], { campo: 'tipo', requerido: true });
    const objetivoId = idDocumento(body.objetivoId, 'objetivoId');
    const motivo = unoDe(body.motivo, MOTIVOS_REPORTE, { campo: 'motivo', requerido: true });
    const detalle = texto(body.detalle, { campo: 'detalle', max: 500, multilinea: true }) ?? '';
    const coleccion = tipo === 'perfil' ? COL.directorioPerfiles : COL.directorioOportunidades;
    const objetivo = await ctx.db.collection(coleccion).doc(objetivoId).get();
    if (!objetivo.exists || (tipo === 'perfil' ? objetivo.data().visible !== true : objetivo.data().estado !== 'publicada')) throw noEncontrado('Ese contenido ya no está disponible.');
    if ((tipo === 'perfil' ? objetivoId : objetivo.data().autorUid) === req.usuario.uid) throw conflicto('No puedes denunciar tu propio contenido.');
    const ref = ctx.db.collection(COL.directorioReportes).doc(idEstable(req.usuario.uid, tipo, objetivoId));
    const creado = ctx.now().toISOString();
    const datos = {
      id: ref.id, reportanteUid: req.usuario.uid, tipo, objetivoId, motivo, detalle,
      resumenObjetivo: tipo === 'perfil' ? objetivo.data().nombre : objetivo.data().titulo,
      autorUid: tipo === 'perfil' ? objetivoId : objetivo.data().autorUid,
      estado: 'pendiente', creado, actualizado: creado,
    };
    await ctx.db.runTransaction(async (tx) => {
      if ((await tx.get(ref)).exists) throw conflicto('Ya enviaste una denuncia sobre este contenido.', 'reporte_duplicado');
      const desde = new Date(ctx.now().getTime() - 86400000).toISOString();
      const reportes = await tx.get(ctx.db.collection(COL.directorioReportes).where('reportanteUid', '==', req.usuario.uid));
      const recientes = reportes.docs.filter((doc) => doc.data().creado >= desde);
      if (recientes.length >= MAX_REPORTES_DIA) throw demasiadasSolicitudes(`Puedes enviar hasta ${MAX_REPORTES_DIA} denuncias cada 24 horas.`);
      tx.create(ref, datos);
    });
    res.status(201).json({ id: ref.id, estado: 'pendiente' });
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
