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
    const datos = { titulo: 'Odontólogo general para clínica multidisciplinaria', tipo: 'empleo', organizacion: 'Clínica Horizonte', modalidad: 'presencial', ciudad: 'Puebla', entidad: 'Puebla', especialidades: ['Odontología general'], resumen: 'Buscamos colega con trato humano para integrarse tres tardes por semana a un equipo clínico estable.', requisitos: 'Título y cédula', compensacion: 'Honorarios en entrevista' };
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
});
