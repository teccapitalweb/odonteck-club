import assert from 'node:assert/strict';
import { beforeEach, describe, test } from 'node:test';
import request from 'supertest';
import { TOKENS, bearer, crearEntorno } from './fakes/app.js';

let env;
beforeEach(() => {
  env = crearEntorno();
});

const admin = (metodo, ruta) => request(env.app)[metodo](ruta).set(bearer(TOKENS.admin));

const sembrarCanje = (id, estatus, solicitado) => {
  env.db.docs.set(`v2_recompensas_canjes/${id}`, {
    recompensaId: 'guia-materiales', titulo: `Canje ${id}`, uid: 'free1',
    puntos: 500, tipo: 'manual', estatus, solicitado,
  });
};

describe('admin: paginación de canjes y filtro por estatus', () => {
  beforeEach(() => {
    // 5 canjes: 2 pendientes, intercalados por fecha, para comprobar que ninguno se pierde.
    sembrarCanje('c1', 'entregado', '2026-09-05T00:00:00.000Z');
    sembrarCanje('c2', 'pendiente', '2026-09-04T00:00:00.000Z');
    sembrarCanje('c3', 'cancelado', '2026-09-03T00:00:00.000Z');
    sembrarCanje('c4', 'entregado', '2026-09-02T00:00:00.000Z');
    sembrarCanje('c5', 'pendiente', '2026-09-01T00:00:00.000Z');
  });

  test('pagina por cursor sin corte silencioso', async () => {
    const p1 = await admin('get', '/admin/recompensas?limite=2').expect(200);
    assert.equal(p1.body.canjes.length, 2);
    assert.deepEqual(p1.body.canjes.map((c) => c.id), ['c1', 'c2']); // orden por solicitado desc
    assert.equal(p1.body.siguiente, 'c2');
    assert.equal(p1.body.limite, 2);

    const p2 = await admin('get', `/admin/recompensas?limite=2&cursor=${p1.body.siguiente}`).expect(200);
    assert.deepEqual(p2.body.canjes.map((c) => c.id), ['c3', 'c4']);
    assert.equal(p2.body.siguiente, 'c4');

    const p3 = await admin('get', `/admin/recompensas?limite=2&cursor=${p2.body.siguiente}`).expect(200);
    assert.deepEqual(p3.body.canjes.map((c) => c.id), ['c5']);
    assert.equal(p3.body.siguiente, null); // última página
  });

  test('filtro por estatus devuelve sólo ese estatus, incluidos los que quedan lejos', async () => {
    const r = await admin('get', '/admin/recompensas?estatus=pendiente').expect(200);
    assert.equal(r.body.estatus, 'pendiente');
    assert.deepEqual(r.body.canjes.map((c) => c.id), ['c2', 'c5']);
    assert.ok(r.body.canjes.every((c) => c.estatus === 'pendiente'));
  });

  test('estatus inválido 400 y cursor que no corresponde al filtro 400', async () => {
    await admin('get', '/admin/recompensas?estatus=raro').expect(400);
    // c1 es "entregado": no sirve como cursor del filtro "pendiente".
    const r = await admin('get', '/admin/recompensas?estatus=pendiente&cursor=c1').expect(400);
    assert.equal(r.body.error, 'cursor_invalido');
  });

  test('sin parámetros devuelve todos (no se limita a los 100 más recientes)', async () => {
    const r = await admin('get', '/admin/recompensas').expect(200);
    assert.equal(r.body.canjes.length, 5);
    assert.equal(r.body.siguiente, null);
  });
});

describe('admin: paginación de miembros sin corte silencioso', () => {
  test('por defecto devuelve todos y expone el total en cabecera', async () => {
    const r = await admin('get', '/admin/miembros').expect(200);
    const total = Number(r.headers['x-total-count']);
    assert.ok(total >= 4);
    assert.equal(r.body.length, total); // sin corte: body == total
    assert.equal(r.headers['x-next-offset'], undefined);
  });

  test('con limite/cursor pagina por offset y encadena sin perder a nadie', async () => {
    const total = Number((await admin('get', '/admin/miembros').expect(200)).headers['x-total-count']);
    const p1 = await admin('get', '/admin/miembros?limite=1').expect(200);
    assert.equal(p1.body.length, 1);
    assert.equal(Number(p1.headers['x-next-offset']), 1);

    const vistos = new Set(p1.body.map((m) => m.uid));
    let offset = 1;
    for (let i = 0; i < total; i++) {
      const p = await admin('get', `/admin/miembros?limite=1&cursor=${offset}`).expect(200);
      if (!p.body.length) break;
      p.body.forEach((m) => vistos.add(m.uid));
      if (!p.headers['x-next-offset']) break;
      offset = Number(p.headers['x-next-offset']);
    }
    assert.equal(vistos.size, total); // se recorrió toda la lista
  });
});
