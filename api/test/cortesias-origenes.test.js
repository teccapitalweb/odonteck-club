import assert from 'node:assert/strict';
import { beforeEach, describe, test } from 'node:test';
import request from 'supertest';
import { TOKENS, bearer, crearEntorno } from './fakes/app.js';

let env;
beforeEach(() => {
  env = crearEntorno();
});

const admin = (metodo, ruta) => request(env.app)[metodo](ruta).set(bearer(TOKENS.admin));
const darCortesia = (uid, body) => admin('post', `/admin/miembros/${uid}/cortesia`).send(body);
const revocar = (uid) => admin('delete', `/admin/miembros/${uid}/cortesia`).send({ motivoAuditoria: 'prueba' });
const crearCupon = (body) => admin('post', '/admin/cupones').send(body).expect(201);
const canjear = (token, codigo) => request(env.app).post('/cupones/canjear').set(bearer(token)).send({ codigo });

describe('cortesías: orígenes separados (admin vs cupón)', () => {
  test('revocar la cortesía del admin conserva los días del cupón', async () => {
    // Admin otorga 60 días (hasta 2026-11-16) y el miembro canjea un cupón de 30 (hasta 2026-10-17).
    await darCortesia('free1', { dias: 60, motivo: 'Beca de prueba' }).expect(201);
    await crearCupon({ codigo: 'SUMA30', dias: 30, usosMax: 5 });
    await canjear(TOKENS.free, 'SUMA30').expect(201);

    let doc = env.db.docs.get('v2_cortesias/free1');
    assert.equal(doc.admin.hasta, '2026-11-16T12:00:00.000Z');
    assert.equal(doc.cupones.hasta, '2026-10-17T12:00:00.000Z');
    assert.equal(doc.hasta, '2026-11-16T12:00:00.000Z'); // efectivo = el mayor

    const r = await revocar('free1').expect(200);
    assert.equal(r.body.conservaCupon, true);
    doc = env.db.docs.get('v2_cortesias/free1');
    assert.equal(doc.admin, null);
    assert.equal(doc.cupones.hasta, '2026-10-17T12:00:00.000Z');
    assert.equal(doc.hasta, '2026-10-17T12:00:00.000Z'); // sólo quedan los días del cupón
  });

  test('canjear un cupón no pisa la cortesía del admin', async () => {
    await darCortesia('free1', { dias: 10, motivo: 'Admin' }).expect(201); // hasta 2026-09-27
    await crearCupon({ codigo: 'INDEP', dias: 5, usosMax: 5 });
    await canjear(TOKENS.free, 'INDEP').expect(201); // cupón hasta 2026-09-22

    const doc = env.db.docs.get('v2_cortesias/free1');
    assert.equal(doc.admin.hasta, '2026-09-27T12:00:00.000Z');
    assert.equal(doc.cupones.hasta, '2026-09-22T12:00:00.000Z');
    assert.equal(doc.hasta, '2026-09-27T12:00:00.000Z');
  });

  test('revocar cuando sólo hay cortesía de admin borra el documento', async () => {
    await darCortesia('free1', { dias: 30, motivo: 'Sola' }).expect(201);
    const r = await revocar('free1').expect(200);
    assert.equal(r.body.conservaCupon, false);
    assert.equal(env.db.docs.get('v2_cortesias/free1'), undefined);
  });

  test('revocar cuando sólo hay días de cupón responde 409 y no borra nada', async () => {
    await crearCupon({ codigo: 'SOLOCUP', dias: 30, usosMax: 5 });
    await canjear(TOKENS.free, 'SOLOCUP').expect(201);
    const r = await revocar('free1').expect(409);
    assert.equal(r.body.error, 'sin_cortesia_admin');
    assert.equal(env.db.docs.get('v2_cortesias/free1').cupones.hasta, '2026-10-17T12:00:00.000Z');
  });

  test('migra un documento heredado del admin (plano) y lo revoca por completo', async () => {
    env.db.docs.set('v2_cortesias/free1', { uid: 'free1', hasta: '2026-12-31T00:00:00.000Z', motivo: 'Legado', otorgadaPor: 'admin@example.com' });
    const r = await revocar('free1').expect(200);
    assert.equal(r.body.conservaCupon, false);
    assert.equal(env.db.docs.get('v2_cortesias/free1'), undefined);
  });

  test('un documento heredado de cupón (plano) no se puede revocar como cortesía de admin', async () => {
    env.db.docs.set('v2_cortesias/free1', { uid: 'free1', hasta: '2026-12-31T00:00:00.000Z', motivo: 'Cupón X', otorgadaPor: 'cupon:X' });
    await revocar('free1').expect(409);
    assert.ok(env.db.docs.get('v2_cortesias/free1'));
  });

  test('el límite de días está alineado con el front (máximo 730)', async () => {
    await darCortesia('free1', { dias: 731, motivo: 'Demasiado' }).expect(400);
    await darCortesia('free1', { dias: 730, motivo: 'Tope' }).expect(201);
  });
});
