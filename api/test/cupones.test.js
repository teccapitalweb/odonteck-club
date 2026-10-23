import assert from 'node:assert/strict';
import { beforeEach, describe, test } from 'node:test';
import request from 'supertest';
import { TOKENS, bearer, crearEntorno } from './fakes/app.js';

let env;
beforeEach(() => {
  env = crearEntorno();
});

const admin = (metodo, ruta) => request(env.app)[metodo](ruta).set(bearer(TOKENS.admin));

describe('cupones: administración', () => {
  test('crear exige admin; VIP recibe 403 y sin token 401', async () => {
    await request(env.app).post('/admin/cupones').set(bearer(TOKENS.vip)).send({ dias: 30 }).expect(403);
    await request(env.app).post('/admin/cupones').send({ dias: 30 }).expect(401);
    await request(env.app).get('/admin/cupones').set(bearer(TOKENS.vip)).expect(403);
  });

  test('crear genera código, usosMax por defecto 1 y aparece en la lista', async () => {
    const r = await admin('post', '/admin/cupones').send({ dias: 30, etiqueta: 'Bienvenida' }).expect(201);
    assert.match(r.body.codigo, /^[A-Z0-9]{12}$/);
    assert.equal(r.body.dias, 30);
    assert.equal(r.body.usosMax, 1);
    assert.equal(r.body.usados, 0);
    assert.equal(r.body.estado, 'activo');
    assert.equal(r.body.etiqueta, 'Bienvenida');
    const lista = await admin('get', '/admin/cupones').expect(200);
    assert.ok(lista.body.some((c) => c.codigo === r.body.codigo));
  });

  test('crear con código propio lo normaliza a mayúsculas y rechaza duplicados e inválidos', async () => {
    const r = await admin('post', '/admin/cupones').send({ codigo: ' verano30 ', dias: 90, usosMax: 100 }).expect(201);
    assert.equal(r.body.codigo, 'VERANO30');
    assert.equal(r.body.usosMax, 100);
    await admin('post', '/admin/cupones').send({ codigo: 'VERANO30', dias: 30 }).expect(409);
    const malo = await admin('post', '/admin/cupones').send({ codigo: 'ab', dias: 30 }).expect(400);
    assert.equal(malo.body.error, 'codigo_invalido');
    await admin('post', '/admin/cupones').send({ dias: 0 }).expect(400);
  });

  test('revocar cambia el estado', async () => {
    await admin('post', '/admin/cupones').send({ codigo: 'DESCU', dias: 30 }).expect(201);
    const r = await admin('patch', '/admin/cupones/descu').send({ estado: 'revocado' }).expect(200);
    assert.equal(r.body.estado, 'revocado');
    await admin('patch', '/admin/cupones/NOEXISTE').send({ estado: 'revocado' }).expect(404);
  });
});

describe('cupones: canje por el miembro', () => {
  const crear = (body) => admin('post', '/admin/cupones').send(body).expect(201);
  const canjear = (token, codigo) => request(env.app).post('/cupones/canjear').set(bearer(token)).send({ codigo });

  test('canjear agrega días de cortesía desde hoy y consume un uso', async () => {
    await crear({ codigo: 'MES1', dias: 30, usosMax: 5 });
    const r = await canjear(TOKENS.free, 'mes1').expect(201);
    assert.equal(r.body.ok, true);
    assert.equal(r.body.dias, 30);
    // AHORA = 2026-09-17T12:00:00Z + 30 días
    assert.equal(r.body.hasta, '2026-10-17T12:00:00.000Z');
    const cortesia = env.db.docs.get('v2_cortesias/free1');
    assert.equal(cortesia.hasta, '2026-10-17T12:00:00.000Z');
    assert.equal(cortesia.otorgadaPor, 'cupon:MES1');
    const cupon = env.db.docs.get('v2_cupones/MES1');
    assert.equal(cupon.usados, 1);
    assert.ok(env.db.docs.get('v2_cupones_canjes/MES1__free1'));
  });

  test('canjear extiende una cortesía vigente en vez de reemplazarla', async () => {
    env.db.docs.set('v2_cortesias/free1', { uid: 'free1', hasta: '2026-12-31T00:00:00.000Z', motivo: 'previa' });
    await crear({ codigo: 'EXTEN', dias: 30, usosMax: 5 });
    const r = await canjear(TOKENS.free, 'EXTEN').expect(201);
    assert.equal(r.body.hasta, '2027-01-30T00:00:00.000Z');
  });

  test('no se puede canjear dos veces el mismo cupón', async () => {
    await crear({ codigo: 'UNAVEZ', dias: 30, usosMax: 5 });
    await canjear(TOKENS.free, 'UNAVEZ').expect(201);
    const r = await canjear(TOKENS.free, 'UNAVEZ').expect(409);
    assert.equal(r.body.error, 'cupon_ya_canjeado');
    assert.equal(env.db.docs.get('v2_cupones/UNAVEZ').usados, 1);
  });

  test('respeta el límite de usos', async () => {
    await crear({ codigo: 'SOLO1', dias: 30, usosMax: 1 });
    await canjear(TOKENS.free, 'SOLO1').expect(201);
    const r = await canjear(TOKENS.vip, 'SOLO1').expect(409);
    assert.equal(r.body.error, 'cupon_agotado');
  });

  test('rechaza cupón revocado, vencido, inexistente o código inválido', async () => {
    await crear({ codigo: 'REVO', dias: 30 });
    await admin('patch', '/admin/cupones/REVO').send({ estado: 'revocado' }).expect(200);
    assert.equal((await canjear(TOKENS.free, 'REVO').expect(409)).body.error, 'cupon_no_disponible');

    await crear({ codigo: 'VIEJO', dias: 30, usosMax: 5, vence: '2026-01-01T00:00:00.000Z' });
    assert.equal((await canjear(TOKENS.free, 'VIEJO').expect(409)).body.error, 'cupon_vencido');

    await canjear(TOKENS.free, 'NOEXISTE').expect(404);
    assert.equal((await canjear(TOKENS.free, '--').expect(400)).body.error, 'codigo_invalido');
  });

  test('canjear exige sesión', async () => {
    await crear({ codigo: 'AUTH', dias: 30 });
    await request(env.app).post('/cupones/canjear').send({ codigo: 'AUTH' }).expect(401);
  });

  test('limita los intentos de canje por usuario (anti fuerza bruta)', async () => {
    for (let i = 0; i < 10; i++) await canjear(TOKENS.free, 'NOEXISTEX').expect(404);
    const r = await canjear(TOKENS.free, 'NOEXISTEX').expect(429);
    assert.equal(r.body.error, 'limite_alcanzado');
  });
});
