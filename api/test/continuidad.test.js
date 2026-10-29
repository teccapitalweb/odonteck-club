import assert from 'node:assert/strict';
import { test } from 'node:test';
import request from 'supertest';
import { crearEntorno, TOKENS, bearer } from './fakes/app.js';

test('curso, progreso y bienvenida se recuperan desde otra sesión y tras reiniciar el servidor', async () => {
  const env = crearEntorno();
  env.db.docs.delete('v2_curso_gratis/free1');
  await request(env.app).post('/curso-gratis').set(bearer(TOKENS.free)).send({ cursoId: 'curso-a' }).expect(201);
  await request(env.app).post('/progreso/curso-a/vista').set(bearer(TOKENS.free)).send({ n: 1 }).expect(200);
  await request(env.app).post('/encuestas/bienvenida-v2/responder').set(bearer(TOKENS.free)).send({ respuestas: {
    situacion: 'estudiante', como_conocio: 'instagram', objetivo: 'practica', intereses: ['diagnostico', 'ortodoncia'], experiencia: 'sin_pacientes', formato: ['video', 'casos'], reto: 'tiempo',
  } }).expect(201);
  await request(env.app).post('/me/recorrido-visto').set(bearer(TOKENS.free)).expect(200);
  const reiniciado = crearEntorno({ semilla: Object.fromEntries(env.db.docs) });
  for (const agente of ['Mozilla/5.0 (iPhone)', 'Mozilla/5.0 (Linux; Android 14)']) {
    const movil = request.agent(reiniciado.app);
    const elegido = await movil.get('/curso-gratis').set(bearer(TOKENS.free)).set('User-Agent', agente).expect(200);
    assert.equal(elegido.body.cursoId, 'curso-a');
    const progreso = await movil.get('/progreso').set(bearer(TOKENS.free)).expect(200);
    assert.deepEqual(progreso.body['curso-a'].vistas, [1]);
    const pendientes = await movil.get('/encuestas/pendientes').set(bearer(TOKENS.free)).expect(200);
    assert.equal(pendientes.body.pendientes.some(e => e.tipo === 'bienvenida'), false);
    assert.ok(pendientes.body.respondidas.includes('bienvenida-v2'));
    const me = await movil.get('/me').set(bearer(TOKENS.free)).expect(200);
    assert.equal(me.body.perfil.recorridoVisto, true);
  }
});

test('el recorrido se guarda sólo en la cuenta autenticada y los cambios de perfil no lo reinician', async () => {
  const env = crearEntorno();
  await request(env.app).post('/me/recorrido-visto').expect(401);
  await request(env.app).post('/me/recorrido-visto').set(bearer(TOKENS.free)).send({ uid: 'vip1' }).expect(200);
  await request(env.app).post('/me/recorrido-visto').set(bearer(TOKENS.free)).expect(200);
  await request(env.app).patch('/me/perfil').set(bearer(TOKENS.free)).send({ ciudad: 'Puebla', recorridoVisto: false }).expect(200);
  await request(env.app).patch('/me/intereses').set(bearer(TOKENS.free)).send({ intereses: ['ortodoncia'] }).expect(200);
  const me = await request(env.app).get('/me').set(bearer(TOKENS.free)).expect(200);
  assert.equal(me.body.perfil.recorridoVisto, true);
  assert.equal(me.body.perfil.ciudad, 'Puebla');
  const otra = await request(env.app).get('/me').set(bearer(TOKENS.vip)).expect(200);
  assert.equal(otra.body.perfil.recorridoVisto, false);
});

test('posponer la bienvenida permanece en otra sesión; no equivale a haberla contestado', async () => {
  const env = crearEntorno();
  await request(env.app).post('/encuestas/bienvenida-v2/posponer').set(bearer(TOKENS.free)).send({}).expect(200);
  const otra = request.agent(env.app);
  const r = await otra.get('/encuestas/pendientes').set(bearer(TOKENS.free)).expect(200);
  assert.equal(r.body.pendientes.some(e => e.tipo === 'bienvenida'), false);
  assert.equal(r.body.respondidas.includes('bienvenida-v2'), false);
});
