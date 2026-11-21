import assert from 'node:assert/strict';
import { beforeEach, describe, test } from 'node:test';
import Stripe from 'stripe';
import request from 'supertest';
import { TOKENS, WEBHOOK_SECRET, bearer, crearEntorno } from './fakes/app.js';

let env;

const firmar = (evento) => {
  const payload = JSON.stringify(evento);
  const firma = new Stripe('sk_test_x').webhooks.generateTestHeaderString({ payload, secret: WEBHOOK_SECRET });
  return { payload, firma };
};
const enviar = (evento) => {
  const { payload, firma } = firmar(evento);
  return request(env.app).post('/stripe/webhook').set('Stripe-Signature', firma).set('Content-Type', 'application/json').send(payload);
};
const sub = () => env.db.leer('v2_suscripciones/free1');
const wallet = () => env.db.leer('v2_recompensas_estado/free1');
const movimientos = () => env.db.rutas('v2_recompensas_movimientos').length;
const auditorias = () => [...env.db.docs.keys()].filter((k) => k.startsWith('v2_admin_auditoria/')).map((k) => env.db.leer(k));

const reembolso = (id, over = {}) => ({
  id, type: 'charge.refunded', created: 1_790_000_000,
  data: { object: { id: over.chargeId ?? 'ch_1', object: 'charge', customer: 'cus_1', amount: 24900, amount_refunded: 24900, refunded: true, ...over } },
});
const disputa = (id, type, over = {}) => ({
  id, type, created: 1_790_000_100,
  data: { object: { id: over.disputaId ?? 'dp_1', object: 'dispute', charge: 'ch_1', status: over.status, ...over } },
});

beforeEach(() => {
  env = crearEntorno();
  env.db.docs.set('v2_suscripciones/free1', { uid: 'free1', customerId: 'cus_1', subscriptionId: 'sub_1', estado: 'active', plan: 'mensual', periodoFin: '2026-12-31T00:00:00.000Z' });
  env.db.docs.set('v2_recompensas_estado/free1', { uid: 'free1', saldo: 300, ganados: 300, gastados: 0, contadores: { membresias: 1 } });
  // La disputa no trae el cliente: se resuelve leyendo el cobro.
  env.stripe.charges = { retrieve: async () => ({ id: 'ch_1', customer: 'cus_1' }) };
});

describe('stripe: reembolsos', () => {
  test('reembolso total bloquea el acceso y revierte los 300 OdonCoins', async () => {
    const r = await enviar(reembolso('evt_r1')).expect(200);
    assert.equal(r.body.resultado, 'reembolso_total_aplicado');
    assert.equal(sub().accesoBloqueado, true);
    assert.equal(sub().bloqueo.motivo, 'reembolso_total');
    assert.equal(wallet().saldo, 0);
    assert.equal(movimientos(), 1);
    assert.ok(auditorias().some((e) => e.accion === 'reembolso_total'));

    // El free1 deja de ser VIP (su único acceso era la suscripción v2).
    const me = await request(env.app).get('/me').set(bearer(TOKENS.free)).expect(200);
    assert.equal(me.body.esVip, false);
  });

  test('si ya gastó parte, revierte sólo lo que queda (sin saldo negativo) y registra el faltante', async () => {
    env.db.docs.set('v2_recompensas_estado/free1', { uid: 'free1', saldo: 100, ganados: 300, gastados: 200, contadores: {} });
    await enviar(reembolso('evt_r2')).expect(200);
    assert.equal(wallet().saldo, 0); // no negativo
    const mov = env.db.leer(env.db.rutas('v2_recompensas_movimientos')[0]);
    assert.equal(mov.puntos, -100);
    const log = auditorias().find((e) => e.accion === 'reembolso_total');
    assert.match(log.motivo, /200 ya gastados/);
  });

  test('reembolso parcial no toca el acceso ni los OdonCoins; sólo bitácora', async () => {
    const r = await enviar(reembolso('evt_r3', { amount: 24900, amount_refunded: 5000, refunded: false })).expect(200);
    assert.equal(r.body.resultado, 'reembolso_parcial_registrado');
    assert.equal(sub().accesoBloqueado, undefined);
    assert.equal(wallet().saldo, 300);
    assert.equal(movimientos(), 0);
    assert.ok(auditorias().some((e) => e.accion === 'reembolso_parcial'));
  });

  test('es idempotente: el mismo evento no revierte dos veces', async () => {
    await enviar(reembolso('evt_r4')).expect(200);
    const dup = await enviar(reembolso('evt_r4')).expect(200);
    assert.equal(dup.body.duplicado, true);
    assert.equal(wallet().saldo, 0);
    assert.equal(movimientos(), 1);
  });

  test('un cliente sin suscripción v2 se ignora (no es nuestro)', async () => {
    const r = await enviar(reembolso('evt_r5', { customer: 'cus_ajeno' })).expect(200);
    assert.equal(r.body.resultado, 'ignorado_sin_uid');
  });
});

describe('stripe: disputas', () => {
  test('disputa abierta no corta el acceso; marca en disputa y alerta en el resumen', async () => {
    const r = await enviar(disputa('evt_d1', 'charge.dispute.created', { status: 'needs_response' })).expect(200);
    assert.equal(r.body.resultado, 'disputa_registrada');
    assert.equal(sub().enDisputa, true);
    assert.equal(sub().accesoBloqueado, undefined); // acceso intacto
    assert.equal(wallet().saldo, 300);

    const me = await request(env.app).get('/me').set(bearer(TOKENS.free)).expect(200);
    assert.equal(me.body.esVip, true);

    const resumen = await request(env.app).get('/admin/resumen').set(bearer(TOKENS.admin)).expect(200);
    assert.equal(resumen.body.disputasActivas, 1);
    assert.equal(resumen.body.disputas[0].uid, 'free1');
  });

  test('disputa cerrada perdida = reembolso total (bloquea acceso y revierte OdonCoins)', async () => {
    await enviar(disputa('evt_d2a', 'charge.dispute.created', { status: 'needs_response' })).expect(200);
    const r = await enviar(disputa('evt_d2b', 'charge.dispute.closed', { status: 'lost' })).expect(200);
    assert.equal(r.body.resultado, 'disputa_perdida_aplicada');
    assert.equal(sub().accesoBloqueado, true);
    assert.equal(sub().enDisputa, false);
    assert.equal(sub().disputa.estado, 'perdida');
    assert.equal(wallet().saldo, 0);
  });

  test('disputa cerrada ganada quita la marca y no toca el acceso ni los OdonCoins', async () => {
    await enviar(disputa('evt_d3a', 'charge.dispute.created', { status: 'needs_response' })).expect(200);
    const r = await enviar(disputa('evt_d3b', 'charge.dispute.closed', { status: 'won' })).expect(200);
    assert.equal(r.body.resultado, 'disputa_ganada_registrada');
    assert.equal(sub().enDisputa, false);
    assert.equal(sub().accesoBloqueado, false); // ganar la disputa también retira cualquier bloqueo
    assert.equal(sub().disputa.estado, 'ganada');
    assert.equal(wallet().saldo, 300);
  });

  test('reembolso y luego disputa perdida del MISMO cobro no revierten dos veces', async () => {
    await enviar(reembolso('evt_x1')).expect(200);
    assert.equal(wallet().saldo, 0);
    assert.equal(movimientos(), 1);
    // Disputa perdida del mismo charge ch_1: acceso sigue bloqueado, sin segunda reversión.
    await enviar(disputa('evt_x2', 'charge.dispute.closed', { status: 'lost' })).expect(200);
    assert.equal(wallet().saldo, 0);
    assert.equal(movimientos(), 1); // misma clave membresia-reembolso:ch_1
    assert.equal(sub().accesoBloqueado, true);
  });
});

describe('stripe: desbloqueo de acceso tras reembolso/disputa', () => {
  const checkout = (id) => ({
    id, type: 'checkout.session.completed', created: 1_790_000_300,
    data: { object: { id: `cs_${id}`, object: 'checkout.session', mode: 'subscription', payment_status: 'paid', metadata: { origen: 'odonteck-club-v2' }, client_reference_id: 'free1', customer: 'cus_1', subscription: 'sub_1' } },
  });

  test('un pago nuevo tras un reembolso total levanta el bloqueo (esVip vuelve a true)', async () => {
    await enviar(reembolso('evt_block')).expect(200);
    assert.equal(sub().accesoBloqueado, true);
    assert.equal((await request(env.app).get('/me').set(bearer(TOKENS.free)).expect(200)).body.esVip, false);

    // El pago nuevo recupera una suscripción activa de Stripe.
    env.stripe.subscriptions = { retrieve: async () => ({ id: 'sub_1', status: 'active', customer: 'cus_1', created: 1_790_000_000, items: { data: [{ price: { id: 'price_mensual_test' } }] } }) };
    await enviar(checkout('nuevo')).expect(200);
    assert.equal(sub().accesoBloqueado, false);
    assert.equal(sub().enDisputa, false);
    assert.equal((await request(env.app).get('/me').set(bearer(TOKENS.free)).expect(200)).body.esVip, true);
    assert.ok(auditorias().some((e) => e.accion === 'desbloqueo_acceso'));
  });

  test('el admin puede desbloquear manualmente; sin bloqueo responde 409', async () => {
    await enviar(reembolso('evt_block2')).expect(200);
    assert.equal(sub().accesoBloqueado, true);
    await request(env.app).post('/admin/miembros/free1/desbloquear').set(bearer(TOKENS.admin)).expect(200);
    assert.equal(sub().accesoBloqueado, false);
    assert.equal((await request(env.app).get('/me').set(bearer(TOKENS.free)).expect(200)).body.esVip, true);
    const r = await request(env.app).post('/admin/miembros/free1/desbloquear').set(bearer(TOKENS.admin)).expect(409);
    assert.equal(r.body.error, 'no_bloqueada');
  });

  test('desbloqueo manual exige admin', async () => {
    await request(env.app).post('/admin/miembros/free1/desbloquear').expect(401);
    await request(env.app).post('/admin/miembros/free1/desbloquear').set(bearer(TOKENS.vip)).expect(403);
  });
});
