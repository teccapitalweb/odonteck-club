import assert from 'node:assert/strict';
import { beforeEach, describe, test } from 'node:test';
import request from 'supertest';
import { TOKENS, bearer, crearEntorno } from './fakes/app.js';

let env;
beforeEach(() => { env = crearEntorno(); });

const perfil = (token, datos = {}) => request(env.app).put('/directorio/perfil').set(bearer(token)).send({
  titular: 'Odontóloga general con enfoque preventivo', etapa: 'general',
  especialidades: ['Odontología general'], ciudad: 'Puebla', estado: 'Puebla',
  modalidades: ['presencial'], disponibilidad: ['empleo', 'colaboraciones'],
  habilidades: ['Fotografía clínica'], bio: 'Profesional interesada en colaborar con equipos clínicos responsables y aprender en comunidad.',
  visible: true, contacto: { canal: 'correo' }, ...datos,
});

const oportunidad = (datos = {}) => ({
  titulo: 'Odontólogo general para clínica multidisciplinaria', tipo: 'empleo', organizacion: 'Clínica Horizonte',
  modalidad: 'presencial', ciudad: 'Puebla', entidad: 'Puebla', especialidades: ['Odontología general'],
  resumen: 'Buscamos colega con trato humano para integrarse tres tardes por semana a un equipo clínico estable.',
  requisitos: 'Título y cédula', compensacion: 'Honorarios en entrevista', ...datos,
});

describe('directorio profesional', () => {
  test('requiere sesión y permite a cualquier miembro crear un perfil opt-in', async () => {
    await request(env.app).get('/directorio').expect(401);
    const res = await perfil(TOKENS.free).expect(200);
    assert.equal(res.body.uid, 'free1');
    assert.equal(res.body.visible, true);
    assert.equal(res.body.contacto, undefined);
    assert.equal(env.db.leer('v2_directorio_perfiles/free1').contacto.valor, 'carla@example.com');
  });

  test('nunca expone contactos al explorar perfiles', async () => {
    await perfil(TOKENS.vip, { contacto: { canal: 'whatsapp', valor: '+52 222 123 4567' } }).expect(200);
    const res = await request(env.app).get('/directorio').set(bearer(TOKENS.free)).expect(200);
    assert.equal(res.body.perfiles[0].contacto, undefined);
    assert.equal(JSON.stringify(res.body).includes('222 123 4567'), false);
    const propia = await request(env.app).get('/directorio').set(bearer(TOKENS.vip)).expect(200);
    assert.deepEqual(propia.body.miPerfil.contacto, { canal: 'whatsapp', valor: '+52 222 123 4567' });
  });

  test('solo VIP publica oportunidades; todos pueden explorarlas', async () => {
    const datos = oportunidad();
    await request(env.app).post('/directorio/oportunidades').set(bearer(TOKENS.free)).send(datos).expect(403);
    const creada = await request(env.app).post('/directorio/oportunidades').set(bearer(TOKENS.vip)).send(datos).expect(201);
    assert.equal(creada.body.estado, 'publicada');
    const lista = await request(env.app).get('/directorio').set(bearer(TOKENS.free)).expect(200);
    assert.equal(lista.body.oportunidades.length, 1);
  });

  test('el contacto solo aparece después de que la persona destinataria acepta', async () => {
    await perfil(TOKENS.vip, { contacto: { canal: 'whatsapp', valor: '+52 222 123 4567' } }).expect(200);
    await perfil(TOKENS.free).expect(200);
    const solicitud = await request(env.app).post('/directorio/conexiones').set(bearer(TOKENS.free)).send({ paraUid: 'vip1', mensaje: 'Hola, me interesa conversar sobre una colaboración clínica responsable.' }).expect(201);
    assert.equal(solicitud.body.contacto, null);
    await request(env.app).post('/directorio/conexiones').set(bearer(TOKENS.free)).send({ paraUid: 'vip1', mensaje: 'Repito la solicitud para probar duplicados.' }).expect(409);
    const aceptada = await request(env.app).patch(`/directorio/conexiones/${solicitud.body.id}`).set(bearer(TOKENS.vip)).send({ estado: 'aceptada' }).expect(200);
    assert.equal(aceptada.body.estado, 'aceptada');
    const lista = await request(env.app).get('/directorio').set(bearer(TOKENS.free)).expect(200);
    assert.deepEqual(lista.body.conexiones[0].contacto, { canal: 'whatsapp', valor: '+52 222 123 4567' });
  });

  test('rechaza conexión consigo mismo y perfil con HTML', async () => {
    await perfil(TOKENS.free).expect(200);
    await request(env.app).post('/directorio/conexiones').set(bearer(TOKENS.free)).send({ paraUid: 'free1', mensaje: 'Este mensaje tiene longitud suficiente para intentar conectar.' }).expect(409);
    await perfil(TOKENS.vip, { bio: '<script>alert(1)</script> texto que intenta superar la longitud mínima.' }).expect(400);
  });

  test('firma únicamente una foto WebP pequeña en la carpeta del usuario y permite retirarla', async () => {
    await perfil(TOKENS.free).expect(200);
    const firma = await request(env.app).post('/directorio/perfil/foto/subida').set(bearer(TOKENS.free)).send({ contentType: 'image/webp', bytes: 125000 }).expect(200);
    assert.equal(firma.body.path, 'directorio/perfiles/free1/avatar.webp');
    assert.match(firma.body.publicUrl, /directorio%2Fperfiles%2Ffree1%2Favatar\.webp/);
    assert.equal(env.storage.firmadas.at(-1).contentType, 'image/webp');
    await request(env.app).post('/directorio/perfil/foto/subida').set(bearer(TOKENS.free)).send({ contentType: 'image/png', bytes: 10 }).expect(400);
    await request(env.app).post('/directorio/perfil/foto/subida').set(bearer(TOKENS.free)).send({ contentType: 'image/webp', bytes: 2_000_001 }).expect(400);
    await perfil(TOKENS.free, { foto: 'propia' }).expect(200);
    const listado = await request(env.app).get('/directorio').set(bearer(TOKENS.vip)).expect(200);
    assert.match(listado.body.perfiles.find((p) => p.uid === 'free1').foto, /avatar\.webp/);
    await request(env.app).delete('/directorio/perfil/foto').set(bearer(TOKENS.free)).expect(200);
    assert.equal(env.db.leer('v2_directorio_perfiles/free1').foto, null);
    assert.deepEqual(env.storage.borrados, ['directorio/perfiles/free1/avatar.webp']);
  });

  test('pagina perfiles y oportunidades sin repetir resultados', async () => {
    for (let i = 0; i < 8; i++) {
      await env.db.collection('v2_directorio_perfiles').doc(`colega${i}`).set({
        uid: `colega${i}`, nombre: `Colega ${i}`, titular: 'Odontología general', etapa: 'general', visible: true,
        especialidades: [], ciudad: 'Puebla', estado: 'Puebla', modalidades: ['presencial'], disponibilidad: ['colaboraciones'],
        habilidades: [], bio: 'Perfil profesional de prueba con suficiente información para el directorio.',
        contacto: { canal: 'correo', valor: `colega${i}@example.com` }, actualizado: `2026-09-${String(10 + i).padStart(2, '0')}T12:00:00.000Z`,
      });
    }
    const primera = await request(env.app).get('/directorio?limite=6').set(bearer(TOKENS.free)).expect(200);
    assert.equal(primera.body.perfiles.length, 6);
    assert.equal(primera.body.paginacion.perfiles.hayMas, true);
    const segunda = await request(env.app).get(`/directorio?limite=6&perfilesAntes=${encodeURIComponent(primera.body.paginacion.perfiles.siguiente)}`).set(bearer(TOKENS.free)).expect(200);
    assert.equal(segunda.body.perfiles.length, 2);
    assert.equal(segunda.body.paginacion.perfiles.hayMas, false);
    assert.equal(primera.body.perfiles.some((p) => segunda.body.perfiles.some((q) => q.uid === p.uid)), false);
  });

  test('oculta o elimina el perfil y cierra oportunidades y solicitudes pendientes', async () => {
    await perfil(TOKENS.vip).expect(200);
    await perfil(TOKENS.free).expect(200);
    await perfil(TOKENS.vip, { visible: false }).expect(200);
    const oculto = await request(env.app).get('/directorio').set(bearer(TOKENS.free)).expect(200);
    assert.equal(oculto.body.perfiles.some((p) => p.uid === 'vip1'), false);
    await perfil(TOKENS.vip, { visible: true }).expect(200);
    const op = await request(env.app).post('/directorio/oportunidades').set(bearer(TOKENS.vip)).send(oportunidad()).expect(201);
    const conexion = await request(env.app).post('/directorio/conexiones').set(bearer(TOKENS.free)).send({ paraUid: 'vip1', mensaje: 'Me interesa conversar sobre esta oportunidad profesional responsable.' }).expect(201);
    await request(env.app).delete('/directorio/perfil').set(bearer(TOKENS.vip)).expect(200);
    assert.equal(env.db.leer(`v2_directorio_oportunidades/${op.body.id}`).estado, 'cerrada');
    assert.equal(env.db.leer(`v2_directorio_conexiones/${conexion.body.id}`).estado, 'rechazada');
    assert.equal(env.db.leer('v2_directorio_perfiles/vip1'), undefined);
  });

  test('rechaza oportunidades expiradas y limita solicitudes masivas', async () => {
    await perfil(TOKENS.vip).expect(200);
    const op = await request(env.app).post('/directorio/oportunidades').set(bearer(TOKENS.vip)).send(oportunidad()).expect(201);
    await env.db.collection('v2_directorio_oportunidades').doc(op.body.id).update({ expira: '2026-09-16T12:00:00.000Z' });
    await request(env.app).post('/directorio/conexiones').set(bearer(TOKENS.free)).send({ oportunidadId: op.body.id, mensaje: 'Quiero conversar sobre esta oportunidad profesional publicada.' }).expect(404);
    for (let i = 0; i < 11; i++) {
      await env.db.collection('v2_directorio_perfiles').doc(`destino${i}`).set({ uid: `destino${i}`, nombre: `Destino ${i}`, visible: true, contacto: { canal: 'correo', valor: `d${i}@example.com` } });
    }
    for (let i = 0; i < 10; i++) {
      await request(env.app).post('/directorio/conexiones').set(bearer(TOKENS.free)).send({ paraUid: `destino${i}`, mensaje: 'Solicitud profesional con contexto suficiente para iniciar conversación.' }).expect(201);
    }
    await request(env.app).post('/directorio/conexiones').set(bearer(TOKENS.free)).send({ paraUid: 'destino10', mensaje: 'Solicitud profesional adicional que debe respetar el límite diario.' }).expect(429);
  });

  test('hace idempotente la conexión ante envíos simultáneos', async () => {
    await perfil(TOKENS.vip).expect(200);
    const enviar = () => request(env.app).post('/directorio/conexiones').set(bearer(TOKENS.free)).send({ paraUid: 'vip1', mensaje: 'Solicitud simultánea con contexto profesional y propósito claro.' });
    const respuestas = await Promise.all([enviar(), enviar()]);
    assert.deepEqual(respuestas.map((r) => r.status).sort(), [201, 409]);
    assert.equal(env.db.rutas('v2_directorio_conexiones').length, 1);
  });

  test('limita oportunidades activas y permite volver a publicar tras cerrar una', async () => {
    for (let i = 0; i < 3; i++) await request(env.app).post('/directorio/oportunidades').set(bearer(TOKENS.vip)).send(oportunidad({ titulo: `Vacante clínica profesional número ${i + 1}` })).expect(201);
    await request(env.app).post('/directorio/oportunidades').set(bearer(TOKENS.vip)).send(oportunidad({ titulo: 'Cuarta vacante clínica profesional' })).expect(409);
    const primera = env.db.rutas('v2_directorio_oportunidades')[0].split('/').at(-1);
    await request(env.app).patch(`/directorio/oportunidades/${primera}`).set(bearer(TOKENS.vip)).send({ estado: 'cerrada' }).expect(200);
    await request(env.app).post('/directorio/oportunidades').set(bearer(TOKENS.vip)).send(oportunidad({ titulo: 'Nueva vacante tras cerrar la anterior' })).expect(201);
  });

  test('valida el archivo realmente subido y elimina fotos fuera de límite', async () => {
    const firma = await request(env.app).post('/directorio/perfil/foto/subida').set(bearer(TOKENS.free)).send({ contentType: 'image/webp', bytes: 125000 }).expect(200);
    env.storage.metadatos.set(firma.body.path, { size: '2000001', contentType: 'image/webp' });
    await perfil(TOKENS.free, { foto: 'propia' }).expect(400);
    assert.equal(env.storage.metadatos.has(firma.body.path), false);
    assert.equal(env.storage.borrados.includes(firma.body.path), true);
  });

  test('acepta denuncias privadas y permite que administración retire el contenido', async () => {
    await perfil(TOKENS.vip).expect(200);
    const reporte = await request(env.app).post('/directorio/reportes').set(bearer(TOKENS.free)).send({ tipo: 'perfil', objetivoId: 'vip1', motivo: 'datos_falsos', detalle: 'La especialidad anunciada requiere revisión documental.' }).expect(201);
    assert.deepEqual(Object.keys(reporte.body).sort(), ['estado', 'id']);
    await request(env.app).post('/directorio/reportes').set(bearer(TOKENS.free)).send({ tipo: 'perfil', objetivoId: 'vip1', motivo: 'spam' }).expect(409);
    const pendientes = await request(env.app).get('/admin/directorio/reportes?estado=pendiente').set(bearer(TOKENS.admin)).expect(200);
    assert.equal(pendientes.body.length, 1);
    assert.equal('reportanteUid' in pendientes.body[0], false);
    await request(env.app).patch(`/admin/directorio/reportes/${reporte.body.id}`).set(bearer(TOKENS.admin)).send({ estado: 'revisado', accion: 'ocultar' }).expect(200);
    assert.equal(env.db.leer('v2_directorio_perfiles/vip1').visible, false);
    await request(env.app).patch(`/admin/directorio/reportes/${reporte.body.id}`).set(bearer(TOKENS.admin)).send({ estado: 'descartado', accion: 'ninguna' }).expect(409);
  });
});
