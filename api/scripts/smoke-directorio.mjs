#!/usr/bin/env node
// Prueba de humo autenticada del Directorio profesional (miembro / VIP / admin).
// Modelada sobre scripts/smoke-v2.mjs: crea cuentas técnicas efímeras mediante custom token,
// ejerce los flujos reales de la Fase 4 del plan y limpia TODOS sus datos y cuentas al terminar,
// aunque la prueba falle.
//
// IMPORTANTE: este script NO se ejecuta en CI ni en esta tarea. Se corre a mano, idealmente
// contra una API v2 de staging. No tiene valores por defecto: si falta cualquier variable de
// entorno aborta sin tocar nada y NUNCA apunta a producción por omisión.
//
// Uso:
//   API_URL=https://<api> \
//   FIREBASE_WEB_API_KEY=<web-api-key-del-proyecto> \
//   FIREBASE_SERVICE_ACCOUNT='<json o base64 de la cuenta de servicio de club-odonteck>' \
//   node scripts/smoke-directorio.mjs
//
// Opcional: SMOKE_ORIGIN (por defecto el dominio oficial del club).
import { cert, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { leerCuentaDeServicio } from '../src/lib/cuenta-servicio.js';
import { COL } from '../src/datos.js';

const apiUrl = String(process.env.API_URL || '').replace(/\/$/, '');
const webApiKey = String(process.env.FIREBASE_WEB_API_KEY || '');
const origen = String(process.env.SMOKE_ORIGIN || 'https://www.odonteckconsulting.com');
const cuenta = leerCuentaDeServicio(process.env.FIREBASE_SERVICE_ACCOUNT);

if (!apiUrl || !webApiKey || !cuenta) {
  console.error('Faltan API_URL, FIREBASE_WEB_API_KEY o FIREBASE_SERVICE_ACCOUNT.');
  console.error('No se asume ningún entorno por defecto; define las tres variables explícitamente.');
  process.exit(1);
}

// Límites del Directorio (deben coincidir con api/src/routes/directorio.js).
const MAX_CONEXIONES_DIA = 10;
const MAX_OPORTUNIDADES_ACTIVAS = 3;

initializeApp({ credential: cert(cuenta) });
const auth = getAuth();
const db = getFirestore();

const sello = Date.now();
const limpieza = []; // funciones de limpieza, se ejecutan en orden inverso
const usuarios = []; // uids efímeros a eliminar

function assert(condicion, mensaje) {
  if (!condicion) throw new Error(mensaje);
}

async function pedir(idToken, metodo, ruta, body) {
  const headers = { Origin: origen };
  if (idToken) headers.Authorization = `Bearer ${idToken}`;
  const init = { method: metodo, headers };
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(body);
  }
  const res = await fetch(`${apiUrl}${ruta}`, init);
  const data = await res.json().catch(() => ({}));
  return { status: res.status, body: data };
}

async function ok(idToken, metodo, ruta, body, estadoEsperado = 200) {
  const r = await pedir(idToken, metodo, ruta, body);
  if (r.status !== estadoEsperado) {
    throw new Error(`${metodo} ${ruta} => ${r.status} ${r.body.mensaje || r.body.error || ''} (esperaba ${estadoEsperado})`);
  }
  return r.body;
}

async function esperaError(idToken, metodo, ruta, body, estado, codigo) {
  const r = await pedir(idToken, metodo, ruta, body);
  if (r.status !== estado) throw new Error(`${metodo} ${ruta} => ${r.status} (esperaba ${estado} ${codigo ?? ''})`);
  if (codigo && r.body.error !== codigo) throw new Error(`${metodo} ${ruta} => error '${r.body.error}' (esperaba '${codigo}')`);
  return r.body;
}

async function cuentaEfimera(etiqueta, claims = {}) {
  const uid = `smoke-dir-${etiqueta}-${sello}`;
  const token = await auth.createCustomToken(uid, { smokeTest: true, ...claims });
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${encodeURIComponent(webApiKey)}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, returnSecureToken: true }) },
  );
  const login = await res.json().catch(() => ({}));
  if (!login.idToken) throw new Error(`No se autenticó la cuenta ${etiqueta}: ${login.error?.message || 'sin idToken'}`);
  usuarios.push(uid);
  return { uid, idToken: login.idToken };
}

const perfilValido = (sufijo) => ({
  titular: `Odontologo de prueba ${sufijo}`,
  etapa: 'general',
  especialidades: ['Ortodoncia'],
  ciudad: 'CDMX',
  estado: 'CDMX',
  modalidades: ['remoto'],
  disponibilidad: ['colaboraciones'],
  habilidades: ['Diagnostico'],
  bio: 'Perfil efimero creado por el smoke del Directorio para validar el flujo real de extremo a extremo.',
  visible: true,
  contacto: { canal: 'whatsapp', valor: `52155500${String(sello).slice(-5)}` },
});

const oportunidadValida = (sufijo) => ({
  titulo: `Colaboracion clinica ${sufijo}`,
  tipo: 'colaboracion',
  organizacion: 'Clinica de prueba OdonTeck',
  modalidad: 'remoto',
  resumen: 'Oportunidad efimera creada por el smoke del Directorio para validar publicacion VIP y el limite de activas.',
});

async function principal() {
  // Preflight: /health + CORS.
  const health = await pedir(null, 'GET', '/health');
  assert(health.status === 200 && health.body.ok === true, '/health no respondió ok:true');

  const miembro = await cuentaEfimera('miembro');
  const vip = await cuentaEfimera('vip');
  const admin = await cuentaEfimera('admin', { admin: true });

  // VIP por cortesía nueva (sin tocar la colección heredada `miembros`).
  const cortesiaRef = db.collection(COL.cortesias).doc(vip.uid);
  await cortesiaRef.set({ hasta: new Date(Date.now() + 86_400_000).toISOString(), origen: 'smoke-directorio', smokeTest: true });
  limpieza.push(() => cortesiaRef.delete().catch(() => {}));

  assert((await ok(vip.idToken, 'GET', '/me')).esVip === true, 'La cuenta VIP (cortesía) no quedó como VIP');
  assert((await ok(miembro.idToken, 'GET', '/me')).esVip === false, 'La cuenta miembro no debe ser VIP');
  assert((await ok(admin.idToken, 'GET', '/me')).esAdmin === true, 'La cuenta admin no trae el claim admin');

  // --- MIEMBRO: perfil opt-in ---
  const perfilM = await ok(miembro.idToken, 'PUT', '/directorio/perfil', perfilValido('miembro'));
  limpieza.push(() => db.collection(COL.directorioPerfiles).doc(miembro.uid).delete().catch(() => {}));
  assert(perfilM.visible === true, 'El perfil del miembro no quedó visible');

  // VIP y admin también publican perfil (objetivos de conexión/moderación).
  await ok(vip.idToken, 'PUT', '/directorio/perfil', perfilValido('vip'));
  limpieza.push(() => db.collection(COL.directorioPerfiles).doc(vip.uid).delete().catch(() => {}));
  await ok(admin.idToken, 'PUT', '/directorio/perfil', perfilValido('admin'));
  limpieza.push(() => db.collection(COL.directorioPerfiles).doc(admin.uid).delete().catch(() => {}));

  // Feed: nunca expone el contacto de perfiles ajenos; sí el propio en miPerfil.
  const feed = await ok(miembro.idToken, 'GET', '/directorio');
  const ajenos = feed.perfiles.filter((p) => p.esMio !== true);
  assert(ajenos.length >= 1, 'El feed no incluyó ningún perfil ajeno');
  assert(ajenos.every((p) => !('contacto' in p)), 'El feed expuso el contacto de un perfil ajeno');
  assert(feed.miPerfil && feed.miPerfil.contacto, 'miPerfil debería incluir mi propio contacto');

  // --- MIEMBRO: foto WebP firmada (solo si Storage está configurado) ---
  const subida = await pedir(miembro.idToken, 'POST', '/directorio/perfil/foto/subida', { contentType: 'image/webp', bytes: 2048 });
  if (subida.status === 503 && subida.body.error === 'no_configurado') {
    console.log('SKIP foto: Storage no configurado en este entorno (el resto del Directorio opera).');
  } else {
    assert(subida.status === 200 && typeof subida.body.uploadUrl === 'string', 'No se firmó la URL de subida de foto');
    const put = await fetch(subida.body.uploadUrl, { method: 'PUT', headers: { 'Content-Type': 'image/webp' }, body: Buffer.from(`webp-smoke-${sello}`) });
    assert(put.ok, `La subida firmada falló con ${put.status}`);
    const conFoto = await ok(miembro.idToken, 'PUT', '/directorio/perfil', { ...perfilValido('miembro'), foto: 'propia' });
    assert(typeof conFoto.foto === 'string' && conFoto.foto.includes(miembro.uid), 'El perfil no quedó con la foto propia');
    await ok(miembro.idToken, 'DELETE', '/directorio/perfil/foto');
  }

  // --- Conexión: el contacto solo se revela tras aceptar ---
  const conexion = await ok(miembro.idToken, 'POST', '/directorio/conexiones',
    { paraUid: vip.uid, mensaje: 'Hola, me gustaria conectar para una colaboracion clinica.' }, 201);
  limpieza.push(() => db.collection(COL.directorioConexiones).doc(conexion.id).delete().catch(() => {}));
  assert(conexion.contacto === null, 'La conexión recién creada no debe revelar contacto');

  const feedPend = await ok(miembro.idToken, 'GET', '/directorio');
  const cxPend = feedPend.conexiones.find((c) => c.id === conexion.id);
  assert(cxPend && cxPend.estado === 'pendiente' && cxPend.contacto === null, 'La conexión pendiente no debe exponer contacto');

  // Idempotencia: reenviar la misma solicitud => 409.
  await esperaError(miembro.idToken, 'POST', '/directorio/conexiones',
    { paraUid: vip.uid, mensaje: 'Reenvio identico para validar la idempotencia del ID estable.' }, 409);

  // El destinatario (VIP) acepta y ve el contacto del solicitante.
  const aceptada = await ok(vip.idToken, 'PATCH', `/directorio/conexiones/${conexion.id}`, { estado: 'aceptada' });
  assert(aceptada.contacto && aceptada.contacto.valor, 'Al aceptar, el destinatario debe ver el contacto del solicitante');

  // Tras aceptar, el solicitante ya ve el contacto.
  const feedAcc = await ok(miembro.idToken, 'GET', '/directorio');
  const cxAcc = feedAcc.conexiones.find((c) => c.id === conexion.id);
  assert(cxAcc && cxAcc.estado === 'aceptada' && cxAcc.contacto && cxAcc.contacto.valor, 'Tras aceptar, el solicitante debe ver el contacto');

  // --- Anti-spam: 11.ª solicitud en 24 h => 429 ---
  for (let i = 0; i < MAX_CONEXIONES_DIA; i++) {
    const ref = db.collection(COL.directorioConexiones).doc(`smoke-dir-spam-${sello}-${i}`);
    const ahora = new Date().toISOString();
    await ref.set({ deUid: miembro.uid, paraUid: `destino-${i}`, oportunidadId: null, mensaje: 'sintetica', estado: 'rechazada', creado: ahora, actualizado: ahora, smokeTest: true });
    limpieza.push(() => ref.delete().catch(() => {}));
  }
  await esperaError(miembro.idToken, 'POST', '/directorio/conexiones',
    { paraUid: admin.uid, mensaje: 'Intento numero 11 dentro de 24 horas: debe bloquearse por anti-spam.' }, 429, 'limite_alcanzado');

  // --- VIP: publicar oportunidad + límite de activas ---
  await esperaError(miembro.idToken, 'POST', '/directorio/oportunidades', oportunidadValida('no-vip'), 403, 'prohibido');
  const oportunidades = [];
  for (let i = 0; i < MAX_OPORTUNIDADES_ACTIVAS; i++) {
    const op = await ok(vip.idToken, 'POST', '/directorio/oportunidades', oportunidadValida(`#${i + 1}`), 201);
    oportunidades.push(op.id);
    limpieza.push(() => db.collection(COL.directorioOportunidades).doc(op.id).delete().catch(() => {}));
  }
  await esperaError(vip.idToken, 'POST', '/directorio/oportunidades', oportunidadValida('#4'), 409, 'limite_oportunidades');

  // --- ADMIN: reporte -> bandeja -> cerrar oportunidad ---
  const reporteOp = await ok(miembro.idToken, 'POST', '/directorio/reportes',
    { tipo: 'oportunidad', objetivoId: oportunidades[0], motivo: 'spam', detalle: 'Reporte efimero del smoke.' }, 201);
  limpieza.push(() => db.collection(COL.directorioReportes).doc(reporteOp.id).delete().catch(() => {}));
  assert(reporteOp.estado === 'pendiente', 'El reporte de oportunidad no quedó pendiente');

  const bandeja = await ok(admin.idToken, 'GET', '/admin/directorio/reportes?estado=pendiente');
  assert(Array.isArray(bandeja), 'La bandeja de reportes debería ser un arreglo');
  const enBandeja = bandeja.find((x) => x.id === reporteOp.id);
  assert(enBandeja, 'El reporte no apareció en la bandeja admin');
  assert(!('reportanteUid' in enBandeja), 'La bandeja admin no debe exponer el UID del reportante');

  const cerrado = await ok(admin.idToken, 'PATCH', `/admin/directorio/reportes/${reporteOp.id}`, { estado: 'revisado', accion: 'cerrar' });
  assert(cerrado.accion === 'cerrar' && cerrado.estado === 'revisado', 'La moderación no marcó la oportunidad como cerrada');
  assert((await db.collection(COL.directorioOportunidades).doc(oportunidades[0]).get()).data()?.estado === 'cerrada', 'La oportunidad denunciada no quedó cerrada');

  // --- ADMIN: reporte -> ocultar perfil ---
  const reportePerfil = await ok(miembro.idToken, 'POST', '/directorio/reportes',
    { tipo: 'perfil', objetivoId: vip.uid, motivo: 'datos_falsos', detalle: 'Reporte de perfil efimero del smoke.' }, 201);
  limpieza.push(() => db.collection(COL.directorioReportes).doc(reportePerfil.id).delete().catch(() => {}));
  const oculto = await ok(admin.idToken, 'PATCH', `/admin/directorio/reportes/${reportePerfil.id}`, { estado: 'revisado', accion: 'ocultar' });
  assert(oculto.accion === 'ocultar', 'La moderación de perfil no aplicó ocultar');
  assert((await db.collection(COL.directorioPerfiles).doc(vip.uid).get()).data()?.visible === false, 'El perfil denunciado no quedó oculto');

  // --- DELETE perfil con cascada ---
  assert((await ok(miembro.idToken, 'DELETE', '/directorio/perfil')).ok === true, 'No se pudo eliminar el perfil del miembro');
  assert((await ok(miembro.idToken, 'GET', '/directorio')).miPerfil === null, 'El perfil del miembro debería haber desaparecido');

  await ok(vip.idToken, 'DELETE', '/directorio/perfil');
  for (const id of oportunidades) {
    const snap = await db.collection(COL.directorioOportunidades).doc(id).get();
    assert(snap.data()?.estado === 'cerrada', `La oportunidad ${id} no quedó cerrada tras borrar el perfil VIP`);
  }

  console.log('OK Directorio: perfil, feed sin contacto ajeno, foto, conexión/aceptación, anti-spam, idempotencia, oportunidades/límite, moderación admin y cascada.');
}

try {
  await principal();
} finally {
  for (const paso of limpieza.reverse()) await paso();
  for (const uid of usuarios) await auth.deleteUser(uid).catch(() => {});
}
