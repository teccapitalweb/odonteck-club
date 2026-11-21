import assert from 'node:assert/strict';
import { beforeEach, describe, test } from 'node:test';
import request from 'supertest';
import { TOKENS, bearer, crearEntorno } from './fakes/app.js';

let env;
beforeEach(() => { env = crearEntorno(); });
const admin = (ruta) => request(env.app).get(ruta).set(bearer(TOKENS.admin));

describe('GET /admin/metricas', () => {
  test('exige admin', async () => {
    await request(env.app).get('/admin/metricas').expect(401);
    await request(env.app).get('/admin/metricas').set(bearer(TOKENS.vip)).expect(403);
  });

  test('entrega todas las secciones y cachea con TTL de 1 hora', async () => {
    env.db.docs.set('v2_suscripciones/a', { uid: 'a', estado: 'active', altaVip: '2026-08-01T00:00:00.000Z', periodoFin: '2026-12-31T00:00:00.000Z', promotionCode: 'promo_x', descuentoMensualCents: 5000, importeMensualNetoCents: 15000 });
    env.db.docs.set('v2_intentos/a_curso-a_1', { uid: 'a', cursoId: 'curso-a', n: 1, aprobadoAlgunaVez: true });
    env.db.docs.set('v2_recompensas_estado/a', { uid: 'a', ganados: 300, gastados: 100, saldo: 200 });
    env.db.docs.set('v2_recompensas_canjes/x', { uid: 'a', recompensaId: 'guia', titulo: 'Guía', estatus: 'entregado' });
    env.db.docs.set('v2_cupones_canjes/BIEN__a', { codigo: 'BIEN', uid: 'a' });
    env.db.docs.set('v2_progreso/a_curso-a', { uid: 'a', cursoId: 'curso-a', vistas: [1] });

    const r = await admin('/admin/metricas').expect(200);
    assert.equal(r.body.cacheado, false);
    assert.ok(r.body.calculadoEn);
    assert.ok(Array.isArray(r.body.retencionCohortes));
    assert.equal(r.body.retencionCohortes.find((c) => c.cohorte === '2026-08').retenidos, 1);
    assert.ok(Array.isArray(r.body.finalizacionClases));
    assert.equal(r.body.quizzes.global.aprobados, 1);
    assert.equal(r.body.economiaOdonCoins.emitidos, 300);
    assert.equal(r.body.economiaOdonCoins.masCanjeadas[0].recompensaId, 'guia');
    assert.equal(r.body.cuponesApp[0].codigo, 'BIEN');
    assert.equal(r.body.cuponesApp[0].convertidos, 1);
    assert.equal(r.body.promosStripe[0].promotionCode, 'promo_x');
    assert.equal(r.body.promosStripe[0].descuentoMensualMXN, 50);

    const r2 = await admin('/admin/metricas').expect(200);
    assert.equal(r2.body.cacheado, true);
    const r3 = await admin('/admin/metricas?actualizar=1').expect(200);
    assert.equal(r3.body.cacheado, false);
  });
});
