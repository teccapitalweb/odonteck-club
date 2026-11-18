import assert from 'node:assert/strict';
import { beforeEach, describe, test } from 'node:test';
import request from 'supertest';
import { TOKENS, bearer, crearEntorno } from './fakes/app.js';

let env;
beforeEach(() => { env = crearEntorno(); });
const admin = (ruta) => request(env.app).get(ruta).set(bearer(TOKENS.admin));

describe('resumen: caché con TTL y actualizar', () => {
  test('la segunda llamada viene de caché; ?actualizar=1 recalcula', async () => {
    const r1 = await admin('/admin/resumen').expect(200);
    assert.equal(r1.body.cacheado, false);
    assert.ok(r1.body.calculadoEn);

    const r2 = await admin('/admin/resumen').expect(200);
    assert.equal(r2.body.cacheado, true);
    assert.equal(r2.body.calculadoEn, r1.body.calculadoEn);

    // Un cambio nuevo NO se ve mientras la caché siga fresca...
    env.db.docs.set('v2_suscripciones/z1', { uid: 'z1', estado: 'active', enDisputa: true, disputa: { fecha: '2026-09-15T00:00:00.000Z' } });
    const r3 = await admin('/admin/resumen').expect(200);
    assert.equal(r3.body.cacheado, true);
    assert.equal(r3.body.disputasActivas, r1.body.disputasActivas);

    // ...hasta que se fuerza el recálculo.
    const r4 = await admin('/admin/resumen?actualizar=1').expect(200);
    assert.equal(r4.body.cacheado, false);
    assert.equal(r4.body.disputasActivas, r1.body.disputasActivas + 1);
  });
});

describe('resumen: métricas y resiliencia', () => {
  test('MRR estimado usa el precio de config cuando falta el importe real', async () => {
    env.db.docs.set('v2_suscripciones/vip1', { uid: 'vip1', estado: 'active', plan: 'mensual' }); // sin importeMensualNetoCents
    const r = await admin('/admin/resumen').expect(200);
    assert.equal(r.body.mrr, 199); // CONFIG_POR_DEFECTO.precios.mensual
    assert.equal(r.body.mrrEstimado, true);
  });

  test('trialing es MRR potencial y past_due va a en riesgo, no al MRR', async () => {
    env.db.docs.set('v2_suscripciones/a', { uid: 'a', estado: 'active', importeMensualNetoCents: 10000 });
    env.db.docs.set('v2_suscripciones/b', { uid: 'b', estado: 'trialing', importeMensualNetoCents: 20000 });
    env.db.docs.set('v2_suscripciones/c', { uid: 'c', estado: 'past_due', importeMensualNetoCents: 30000 });
    const r = await admin('/admin/resumen?actualizar=1').expect(200);
    assert.equal(r.body.mrr, 100);
    assert.equal(r.body.mrrPotencial, 200);
    assert.equal(r.body.enRiesgo.cuentas, 1);
    assert.equal(r.body.enRiesgo.monto, 300);
  });

  test('conversión curso gratis -> VIP y canjes manuales viejos aparecen en el resumen', async () => {
    env.db.docs.set('v2_curso_gratis/free1', { uid: 'free1', cursoId: 'curso-a' });
    env.db.docs.set('v2_suscripciones/free1', { uid: 'free1', estado: 'active', periodoFin: '2026-12-31T00:00:00.000Z' });
    env.db.docs.set('v2_recompensas_canjes/old', { uid: 'free1', recompensaId: 'guia-materiales', titulo: 'Guía', tipo: 'manual', estatus: 'pendiente', solicitado: '2026-09-01T00:00:00.000Z' });
    const r = await admin('/admin/resumen?actualizar=1').expect(200);
    assert.equal(r.body.conversionCursoGratis.base, 1);
    assert.equal(r.body.conversionCursoGratis.convertidos, 1);
    assert.equal(r.body.canjesPendientes.cuentas, 1);
    assert.equal(r.body.canjesPendientes.lista[0].id, 'old');
  });

  test('no se cae si el registro de usuarios es demasiado grande: marca aproximado', async () => {
    env.auth.listUsers = async () => ({ users: [], pageToken: 'hay-mas' }); // nunca termina de paginar
    const r = await admin('/admin/resumen?actualizar=1').expect(200);
    assert.equal(r.body.aproximado, true);
  });
});
