import assert from 'node:assert/strict';
import { beforeEach, describe, test } from 'node:test';
import Stripe from 'stripe';
import request from 'supertest';
import { ORIGEN_OK, TOKENS, WEBHOOK_SECRET, bearer, crearEntorno } from './fakes/app.js';

let env;
beforeEach(() => {
  env = crearEntorno();
});

const admin = (metodo, ruta) => request(env.app)[metodo](ruta).set(bearer(TOKENS.admin));

describe('admin: autorización', () => {
  test('403 para usuarios sin claim admin (aunque sean VIP) y 401 sin token', async () => {
    for (const ruta of ['/admin/resumen', '/admin/cursos', '/admin/miembros', '/admin/config', '/admin/foro']) {
      const r = await request(env.app).get(ruta).set(bearer(TOKENS.vip)).expect(403);
      assert.equal(r.body.error, 'prohibido');
      await request(env.app).get(ruta).expect(401);
    }
    await request(env.app).post('/admin/miembros/free1/cortesia').set(bearer(TOKENS.vip)).send({ dias: 30, motivo: 'yo mismo' }).expect(403);
  });

  test('resumen', async () => {
    env.db.docs.set('v2_progreso/vip1_curso-a', { uid: 'vip1', cursoId: 'curso-a', vistas: [1, 2], historial: ['2026-09-10T00:00:00Z', '2026-01-01T00:00:00Z'], actualizado: '2026-09-10T00:00:00Z' });
    const r = await admin('get', '/admin/resumen').expect(200);
    assert.equal(r.body.miembrosActivos, 2);
    assert.equal(r.body.altas30d, 1);
    assert.equal(r.body.bajas30d, 1);
    assert.equal(r.body.clasesVistas30d, 1);
    assert.equal(r.body.temasForo30d, 2);
    assert.deepEqual(r.body.cursosTop, [{ cursoId: 'curso-a', titulo: 'Endodoncia práctica', vistas: 1 }]);
  });

  test('resumen · retención: inactivos y por-vencer traen contacto para recordatorios', async () => {
    // vip2 no tiene progreso registrado, así que siempre cuenta como inactivo.
    env.db.docs.set('v2_perfiles/vip2', { nombre: 'Dr. Beto VIP', whatsapp: '+52 55 1234 5678', email: 'beto@example.com' });
    const r = await admin('get', '/admin/resumen').expect(200);
    assert.ok(Array.isArray(r.body.porVencer));
    assert.ok(Array.isArray(r.body.inactivosLista));
    const beto = r.body.inactivosLista.find((x) => x.uid === 'vip2');
    assert.ok(beto, 'vip2 debe aparecer en inactivosLista');
    assert.equal(beto.whatsapp, '+52 55 1234 5678');
    assert.equal(beto.plan, 'anual');
    assert.ok('ultimaActividad' in beto);
    for (const m of r.body.porVencer) assert.equal(typeof m.whatsapp, 'string');
  });

  test('encuestas: entrega agregados útiles sin UID ni correo', async () => {
    env.db.docs.set('v2_encuestas_respuestas/u1__bienvenida-v2', {
      uid: 'u1', clave: 'bienvenida-v2', encuestaId: 'bienvenida', version: 2, tipo: 'bienvenida',
      respuestas: { situacion: 'estudiante', como_conocio: 'instagram', objetivo: 'practica', intereses: ['ortodoncia'], experiencia: 'sin_pacientes', formato: ['video'], reto: 'tiempo' }, enviado: '2026-09-15T00:00:00Z',
    });
    env.db.docs.set('v2_encuestas_respuestas/u2__curso-final-v1--curso-a', {
      uid: 'u2', clave: 'curso-final-v1--curso-a', encuestaId: 'curso-final', version: 1, tipo: 'curso', cursoId: 'curso-a', cursoTitulo: 'Endodoncia práctica',
      respuestas: { utilidad: 5, claridad: 4, aplicacion: 'inmediato', recomendacion: 9, mejora: 'Más casos.' }, enviado: '2026-09-16T00:00:00Z',
    });
    const r = await admin('get', '/admin/encuestas/resumen').expect(200);
    assert.equal(r.body.totalRespuestas, 2);
    assert.equal(r.body.encuestas.find((x) => x.id === 'bienvenida').total, 1);
    assert.equal(r.body.encuestas.find((x) => x.id === 'curso-final').preguntas.find((x) => x.id === 'utilidad').promedio, 5);
    assert.deepEqual(r.body.cursos, [{ cursoId: 'curso-a', titulo: 'Endodoncia práctica', total: 1, utilidad: 5, recomendacion: 9 }]);
    assert.equal(JSON.stringify(r.body).includes('u1'), false);
    assert.equal(JSON.stringify(r.body).includes('"uid":'), false);
    assert.equal(JSON.stringify(r.body).includes('@'), false);
  });

  test('encuestas de experiencia: NPS, bases condicionales, segmentación por plan, periodos y contactos con permiso', async () => {
    const exp = (uid, periodo, vip, respuestas, extra = {}) => env.db.docs.set(`v2_encuestas_respuestas/${uid}__experiencia-v2--${periodo}`, {
      uid, clave: `experiencia-v2--${periodo}`, encuestaId: 'experiencia', version: 2, tipo: 'pulso', vip, respuestas, enviado: `2026-0${periodo === '2026T2' ? '6' : '9'}-10T00:00:00Z`, ...extra,
    });
    const base = { uso: 'semanal', dispositivo: 'celular', facilidad: 4, tecnico: 'ninguno', calidad: 5, duracion: 'adecuada', nivel: 'adecuado', valor: ['cursos'], sin_usar: ['comunidad'], falta: ['casos'] };
    exp('p1', '2026T3', true, { ...base, recomendacion: 10, renovar: 'si' });
    exp('p2', '2026T3', true, { ...base, recomendacion: 9, renovar: 'si' });
    exp('d1', '2026T3', false, { ...base, tecnico: 'video', tecnico_detalle: 'Safari', recomendacion: 3, motivo: 'Pocos cursos', vip_que: 'precio', contacto: 'si' }, { correoContacto: 'carla@example.com' });
    exp('n1', '2026T3', false, { ...base, recomendacion: 7, vip_que: 'mas_cursos', contacto: 'no' });
    exp('viejo', '2026T2', true, { ...base, recomendacion: 2, renovar: 'no', contacto: 'no' });

    const todos = await admin('get', '/admin/encuestas/resumen').expect(200);
    const pulso = todos.body.encuestas.find((x) => x.id === 'experiencia');
    assert.equal(pulso.total, 5);
    const rec = pulso.preguntas.find((p) => p.id === 'recomendacion');
    // 2 promotores, 1 pasivo, 2 detractores de 5 → NPS 0.
    assert.deepEqual({ nps: rec.nps, promotores: rec.promotores, pasivos: rec.pasivos, detractores: rec.detractores }, { nps: 0, promotores: 2, pasivos: 1, detractores: 2 });
    // "renovar" sólo aplica a VIP (3 docs); "contacto" sólo a quien calificó 0-6 (2 docs).
    assert.equal(pulso.preguntas.find((p) => p.id === 'renovar').aplicables, 3);
    assert.equal(pulso.preguntas.find((p) => p.id === 'contacto').aplicables, 2);
    assert.equal(pulso.preguntas.find((p) => p.id === 'tecnico_detalle').comentarios[0], 'Safari');
    assert.deepEqual(pulso.periodos.map((p) => [p.periodo, p.total, p.nps]), [['2026T3', 4, 25], ['2026T2', 1, -100]]);
    assert.deepEqual(todos.body.planes, { vip: 3, gratis: 2, sinDato: 0 });
    assert.equal(JSON.stringify(todos.body).includes('@'), false, 'el resumen nunca trae correos');

    const vip = await admin('get', '/admin/encuestas/resumen?plan=vip').expect(200);
    assert.equal(vip.body.plan, 'vip');
    assert.equal(vip.body.encuestas.find((x) => x.id === 'experiencia').total, 3);
    const gratis = await admin('get', '/admin/encuestas/resumen?plan=gratis').expect(200);
    assert.equal(gratis.body.encuestas.find((x) => x.id === 'experiencia').preguntas.find((p) => p.id === 'recomendacion').nps, -50);

    const contactos = await admin('get', '/admin/encuestas/contactos').expect(200);
    assert.deepEqual(contactos.body.map((c) => [c.correo, c.recomendacion, c.motivo]), [['carla@example.com', 3, 'Pocos cursos']]);
    await request(env.app).get('/admin/encuestas/contactos').set(bearer(TOKENS.vip)).expect(403);
  });
});

describe('admin: cursos', () => {
  test('lista completa con videoId, crear, editar y borrar', async () => {
    const lista = await admin('get', '/admin/cursos').expect(200);
    assert.deepEqual(lista.body.map((c) => c.id), ['curso-a', 'curso-b']);
    assert.equal(lista.body[0].clases[0].videoId, 'video-a-1');

    const nuevo = { id: 'curso-c', titulo: 'Periodoncia', area: 'Periodoncia', nivel: 'Básico', clases: [{ n: 1, titulo: 'Intro', videoId: 'abc-123', gratis: true }] };
    const creado = await admin('post', '/admin/cursos').send(nuevo).expect(201);
    assert.equal(creado.body.publicado, false);
    assert.equal(creado.body.clases[0].duracionMin, null);
    await admin('post', '/admin/cursos').send(nuevo).expect(409);
    await admin('post', '/admin/cursos').send({ ...nuevo, id: 'curso-d', nivel: 'Experto' }).expect(400);

    const editado = await admin('patch', '/admin/cursos/curso-c').send({ publicado: true, titulo: 'Periodoncia I' }).expect(200);
    assert.equal(editado.body.publicado, true);
    assert.equal(editado.body.clases.length, 1, 'PATCH sin clases conserva las existentes');
    await admin('patch', '/admin/cursos/no-existe').send({ titulo: 'x' }).expect(404);

    await admin('delete', '/admin/cursos/curso-c').expect(200);
    assert.equal(env.db.leer('v2_cursos/curso-c'), undefined);
  });

  test('no se borra un curso con progreso', async () => {
    await request(env.app).post('/progreso/curso-a/vista').set(bearer(TOKENS.vip)).send({ n: 1 }).expect(200);
    const r = await admin('delete', '/admin/cursos/curso-a').expect(409);
    assert.equal(r.body.error, 'curso_con_progreso');
  });
});

describe('admin: materiales, eventos, subidas', () => {
  test('CRUD de materiales fija archivo en Storage y firma subidas', async () => {
    const creado = await admin('post', '/admin/materiales').send({ id: 'atlas', titulo: 'Atlas', tipo: 'Libro', estado: 'disponible' }).expect(201);
    assert.equal(creado.body.archivo, 'materiales/atlas.pdf');
    await admin('post', '/admin/materiales').send({ id: 'otro', titulo: 'x', tipo: 'Video' }).expect(400);

    const subida = await admin('post', '/admin/materiales/atlas/subida').send({ tipo: 'archivo', contentType: 'application/pdf' }).expect(200);
    assert.equal(subida.body.path, 'materiales/atlas.pdf');
    assert.equal(env.storage.firmadas.at(-1).action, 'write');
    assert.equal(env.storage.firmadas.at(-1).contentType, 'application/pdf');
    const portada = await admin('post', '/admin/materiales/atlas/subida').send({ tipo: 'portada', contentType: 'image/webp' }).expect(200);
    assert.equal(portada.body.path, 'materiales/portadas/atlas.webp');
    assert.match(portada.body.publicUrl, /materiales%2Fportadas%2Fatlas\.webp\?alt=media$/);
    const mala = await admin('post', '/admin/materiales/atlas/subida').send({ tipo: 'archivo', contentType: 'text/html' }).expect(400);
    assert.equal(mala.body.error, 'tipo_no_permitido');

    await admin('patch', '/admin/materiales/atlas').send({ estado: 'oculto' }).expect(200);
    await admin('delete', '/admin/materiales/atlas').expect(200);
    assert.deepEqual(env.storage.borrados, ['materiales/atlas.pdf']);
  });

  test('CRUD de eventos sin tocar reservas', async () => {
    const creado = await admin('post', '/admin/eventos').send({ id: 'ev2', titulo: 'Webinar', fecha: '2026-11-01T18:00:00Z', publicado: true }).expect(201);
    assert.deepEqual(creado.body.reservas, []);
    assert.equal(creado.body.fecha, '2026-11-01T18:00:00.000Z');
    const editado = await admin('patch', '/admin/eventos/ev1').send({ titulo: 'Nuevo', reservas: [] }).expect(200);
    assert.deepEqual(editado.body.reservas, ['otro-uid']);
    await admin('post', '/admin/eventos').send({ id: 'ev3', titulo: 'Sin fecha' }).expect(400);
  });
});

describe('admin: miembros y cortesías', () => {
  test('cortesía convierte en VIP y se puede revocar', async () => {
    assert.equal((await request(env.app).get('/me').set(bearer(TOKENS.free))).body.esVip, false);
    const c = await admin('post', '/admin/miembros/free1/cortesia').send({ dias: 30, motivo: 'Ponente invitado' }).expect(201);
    assert.equal(c.body.hasta, '2026-10-17T12:00:00.000Z');
    assert.equal(c.body.otorgadaPor, 'admin@example.com');
    const me = await request(env.app).get('/me').set(bearer(TOKENS.free)).expect(200);
    assert.equal(me.body.esVip, true);
    assert.equal(me.body.plan, 'cortesia');
    assert.equal(env.db.leer('miembros/free1').activa, false, 'miembros no se modifica');

    await admin('post', '/admin/miembros/free1/cortesia').send({ dias: 0, motivo: 'x' }).expect(400);
    await admin('post', '/admin/miembros/no-existe/cortesia').send({ dias: 5, motivo: 'nadie' }).expect(404);

    await admin('delete', '/admin/miembros/free1/cortesia').expect(200);
    assert.equal((await request(env.app).get('/me').set(bearer(TOKENS.free))).body.esVip, false);
    await admin('delete', '/admin/miembros/free1/cortesia').expect(404);
  });

  test('lista con filtros y detalle', async () => {
    // Incluye a TODOS los usuarios de Firebase Auth (logueados), no solo los que tienen doc en Firestore.
    const todos = await admin('get', '/admin/miembros').expect(200);
    assert.deepEqual(todos.body.map((m) => m.uid).sort(), ['adm1', 'free1', 'legacy-auth-uid', 'solo_auth', 'vencido1', 'vip1', 'vip2']);
    const vip = await admin('get', '/admin/miembros?estado=vip').expect(200);
    assert.deepEqual(vip.body.map((m) => m.uid).sort(), ['adm1', 'vip1', 'vip2']);
    const q = await admin('get', '/admin/miembros?q=CARLA').expect(200);
    assert.deepEqual(q.body.map((m) => m.uid), ['free1']);
    await admin('get', '/admin/miembros?estado=raro').expect(400);

    await request(env.app).post('/progreso/curso-a/vista').set(bearer(TOKENS.vip)).send({ n: 1 }).expect(200);
    const detalle = await admin('get', '/admin/miembros/vip1').expect(200);
    assert.equal(detalle.body.esVip, true);
    assert.equal(detalle.body.progreso[0].total, 3);
    assert.deepEqual(detalle.body.progreso[0].vistas, [1]);
    await admin('get', '/admin/miembros/fantasma').expect(404);
  });
});

describe('admin: foro, quizzes, avisos y config', () => {
  test('moderar foro', async () => {
    const todos = await admin('get', '/admin/foro').expect(200);
    assert.equal(todos.body.length, 2);
    await admin('patch', '/admin/foro/hilo1').send({ oculto: true }).expect(200);
    await request(env.app).get('/foro/hilo1').set(bearer(TOKENS.vip)).expect(404);
    await admin('patch', '/admin/foro/hilo1').send({ oculto: 'si' }).expect(400);
  });

  test('quizzes: filtrar, editar y aprobar', async () => {
    const borradores = await admin('get', '/admin/quizzes?estado=borrador').expect(200);
    assert.deepEqual(borradores.body.map((q) => q.id), ['curso-a_2']);
    const aprobado = await admin('patch', '/admin/quizzes/curso-a_2').send({ estado: 'aprobado' }).expect(200);
    assert.equal(aprobado.body.revisadoPor, 'admin@example.com');
    await request(env.app).get('/quiz/curso-a/2').set(bearer(TOKENS.vip)).expect(200);
    const interactivo = await admin('patch', '/admin/quizzes/curso-a_2').send({ preguntas: [{
      id: 'p-match', tipo: 'relacionar', q: 'Relaciona', instruccion: 'Une cada concepto', explicacion: 'Relaciones revisadas.',
      izquierda: [{ id: 'i1', texto: 'Uno' }, { id: 'i2', texto: 'Dos' }], derecha: [{ id: 'd1', texto: 'A' }, { id: 'd2', texto: 'B' }], pares: { i1: 'd2', i2: 'd1' },
    }] }).expect(200);
    assert.equal(interactivo.body.preguntas[0].tipo, 'relacionar');
    assert.equal(interactivo.body.estado, 'borrador', 'editar contenido exige una nueva revisión');
    assert.equal(interactivo.body.version, 2);
    await request(env.app).get('/quiz/curso-a/2').set(bearer(TOKENS.vip)).expect(404);
    const reaprobado = await admin('patch', '/admin/quizzes/curso-a_2').send({ estado: 'aprobado' }).expect(200);
    assert.equal(reaprobado.body.version, 2);
    const publico = await request(env.app).get('/quiz/curso-a/2').set(bearer(TOKENS.vip)).expect(200);
    assert.equal(JSON.stringify(publico.body).includes('"pares"'), false);
    assert.equal(JSON.stringify(publico.body).includes('Relaciones revisadas'), false);
    await admin('patch', '/admin/quizzes/curso-a_2').send({ preguntas: [{ q: 'x', opciones: ['a'], correcta: 0 }] }).expect(400);
    await admin('patch', '/admin/quizzes/curso-a_3').send({ estado: 'aprobado' }).expect(404);
    const creado = await admin('patch', '/admin/quizzes/curso-a_3').send({ preguntas: [{ q: '¿?', opciones: ['a', 'b'], correcta: 1 }] }).expect(200);
    assert.equal(creado.body.estado, 'borrador');
  });

  test('avisos y config', async () => {
    await admin('post', '/admin/avisos').send({ titulo: 'Nuevo curso', texto: 'Ya está disponible', enlace: 'https://club.odonteckconsulting.com/#/cursos' }).expect(201);
    assert.equal((await admin('get', '/admin/avisos').expect(200)).body.length, 1);
    await admin('post', '/admin/avisos').send({ titulo: 'x', texto: '<a href=x>clic</a>' }).expect(400);

    const cfg = await admin('patch', '/admin/config').send({ precios: { mensual: 249 }, descuentoVIP: 25 }).expect(200);
    assert.deepEqual(cfg.body.precios, { mensual: 249, anual: 1899 });
    assert.equal(cfg.body.descuentoVIP, 25);
    await admin('patch', '/admin/config').send({ stripePriceAnual: 'no-es-price' }).expect(400);
  });
});

describe('stripe', () => {
  test('checkout crea sesión de suscripción con uid y metadata', async () => {
    const r = await request(env.app).post('/stripe/checkout').set(bearer(TOKENS.free)).send({ plan: 'anual' }).expect(200);
    assert.match(r.body.url, /^https:\/\/checkout\.stripe\.test\//);
    const p = env.stripe.creadas.checkout.at(-1);
    assert.equal(p.mode, 'subscription');
    assert.equal(p.client_reference_id, 'free1');
    assert.deepEqual(p.metadata, { uid: 'free1', plan: 'anual', origen: 'odonteck-club-v2' });
    assert.deepEqual(p.subscription_data.metadata, p.metadata);
    assert.deepEqual(p.line_items, [{ price: 'price_anual_test', quantity: 1 }]);
    assert.equal(p.customer_email, 'carla@example.com');
    assert.equal(p.success_url, `${ORIGEN_OK}/#/suscripcion?pago=exito&session_id={CHECKOUT_SESSION_ID}`);
    assert.equal(p.cancel_url, `${ORIGEN_OK}/#/suscripcion?pago=cancelado`);
  });

  test('checkout: plan inválido 400, ya VIP 409, sin token 401, sin Stripe o webhook 503', async () => {
    await request(env.app).post('/stripe/checkout').set(bearer(TOKENS.free)).send({ plan: 'vitalicio' }).expect(400);
    const vip = await request(env.app).post('/stripe/checkout').set(bearer(TOKENS.vip)).send({ plan: 'mensual' }).expect(409);
    assert.equal(vip.body.error, 'ya_es_vip');
    await request(env.app).post('/stripe/checkout').send({ plan: 'mensual' }).expect(401);
    const sin = crearEntorno({ sinStripe: true });
    await request(sin.app).post('/stripe/checkout').set(bearer(TOKENS.free)).send({ plan: 'mensual' }).expect(503);
    const sinWebhook = crearEntorno({ sinWebhook: true });
    await request(sinWebhook.app).post('/stripe/checkout').set(bearer(TOKENS.free)).send({ plan: 'mensual' }).expect(503);
    assert.equal(sinWebhook.stripe.creadas.checkout.length, 0);
  });

  test('portal requiere cliente de Stripe', async () => {
    await request(env.app).post('/stripe/portal').set(bearer(TOKENS.free)).expect(404);
    env.db.docs.set('v2_suscripciones/free1', { uid: 'free1', customerId: 'cus_123' });
    const r = await request(env.app).post('/stripe/portal').set(bearer(TOKENS.free)).expect(200);
    assert.match(r.body.url, /billing\.stripe\.test/);
    assert.equal(env.stripe.creadas.portal.at(-1).customer, 'cus_123');
    assert.equal(env.stripe.creadas.portal.at(-1).return_url, `${ORIGEN_OK}/#/suscripcion`);
  });

  test('portal reconoce el cliente Stripe de una membresía heredada por correo', async () => {
    env.db.docs.set('miembros/email_legacy_example_com', { activa: true, email: 'legacy@example.com', stripeCustomerId: 'cus_legacy' });
    const r = await request(env.app).post('/stripe/portal').set(bearer(TOKENS.legacy)).expect(200);
    assert.match(r.body.url, /billing\.stripe\.test/);
    assert.equal(env.stripe.creadas.portal.at(-1).customer, 'cus_legacy');
  });

  function eventoFirmado(evento, secreto = WEBHOOK_SECRET) {
    const payload = JSON.stringify(evento);
    const firma = new Stripe('sk_test_x').webhooks.generateTestHeaderString({ payload, secret: secreto });
    return { payload, firma };
  }

  const eventoSuscripcion = (overrides = {}) => ({
    id: 'evt_1',
    object: 'event',
    type: 'customer.subscription.updated',
    created: 1_790_000_000,
    data: {
      object: {
        id: 'sub_1',
        object: 'subscription',
        customer: 'cus_1',
        status: 'active',
        cancel_at_period_end: false,
        canceled_at: null,
        metadata: { uid: 'free1', plan: 'mensual', origen: 'odonteck-club-v2' },
        items: { data: [{ price: { id: 'price_mensual_test' }, current_period_end: 1_792_000_000 }] },
      },
    },
    ...overrides,
  });

  test('webhook con firma inválida responde 400 y no escribe nada', async () => {
    const { payload } = eventoFirmado(eventoSuscripcion(), 'whsec_otro');
    const { firma } = eventoFirmado(eventoSuscripcion(), 'whsec_otro');
    const r = await request(env.app).post('/stripe/webhook').set('Stripe-Signature', firma).set('Content-Type', 'application/json').send(payload).expect(400);
    assert.equal(r.body.error, 'firma_invalida');
    const sinFirma = await request(env.app).post('/stripe/webhook').set('Content-Type', 'application/json').send(payload).expect(400);
    assert.equal(sinFirma.body.error, 'firma_invalida');
    assert.equal(env.db.rutas('v2_suscripciones').length, 0);
  });

  test('webhook válido escribe en v2_suscripciones y nunca en miembros; es idempotente', async () => {
    const antes = env.db.leer('miembros/free1');
    const { payload, firma } = eventoFirmado(eventoSuscripcion());
    const r = await request(env.app).post('/stripe/webhook').set('Stripe-Signature', firma).set('Content-Type', 'application/json').send(payload).expect(200);
    assert.equal(r.body.resultado, 'suscripcion_guardada');
    const sus = env.db.leer('v2_suscripciones/free1');
    assert.equal(sus.estado, 'active');
    assert.equal(sus.plan, 'mensual');
    assert.equal(sus.customerId, 'cus_1');
    assert.equal(sus.periodoFin, new Date(1_792_000_000 * 1000).toISOString());
    assert.deepEqual(env.db.leer('miembros/free1'), antes);

    const dup = await request(env.app).post('/stripe/webhook').set('Stripe-Signature', firma).set('Content-Type', 'application/json').send(payload).expect(200);
    assert.equal(dup.body.duplicado, true);

    // Un evento más viejo de la misma suscripción no pisa el estado.
    const viejo = eventoFirmado(eventoSuscripcion({ id: 'evt_0', created: 1_780_000_000, data: { object: { ...eventoSuscripcion().data.object, status: 'past_due' } } }));
    const rv = await request(env.app).post('/stripe/webhook').set('Stripe-Signature', viejo.firma).set('Content-Type', 'application/json').send(viejo.payload).expect(200);
    assert.equal(rv.body.resultado, 'ignorado_evento_viejo');
    assert.equal(env.db.leer('v2_suscripciones/free1').estado, 'active');

    // Sin metadata.uid se resuelve por customerId.
    const obj = { ...eventoSuscripcion().data.object, metadata: { origen: 'odonteck-club-v2' }, status: 'canceled', canceled_at: 1_791_000_000 };
    const baja = eventoFirmado(eventoSuscripcion({ id: 'evt_2', type: 'customer.subscription.deleted', created: 1_791_000_000, data: { object: obj } }));
    await request(env.app).post('/stripe/webhook').set('Stripe-Signature', baja.firma).set('Content-Type', 'application/json').send(baja.payload).expect(200);
    assert.equal(env.db.leer('v2_suscripciones/free1').estado, 'canceled');
  });

  test('checkout.session.completed recupera la suscripción y usa client_reference_id', async () => {
    env = crearEntorno();
    env.stripe.subscriptions.retrieve = async () => eventoSuscripcion().data.object;
    const evento = {
      id: 'evt_cs',
      object: 'event',
      type: 'checkout.session.completed',
      created: 1_790_000_100,
      data: { object: { id: 'cs_1', object: 'checkout.session', mode: 'subscription', payment_status: 'paid', metadata: { origen: 'odonteck-club-v2' }, client_reference_id: 'free1', customer: 'cus_1', subscription: 'sub_1', customer_details: { email: 'carla@example.com' } } },
    };
    const { payload, firma } = eventoFirmado(evento);
    await request(env.app).post('/stripe/webhook').set('Stripe-Signature', firma).set('Content-Type', 'application/json').send(payload).expect(200);
    const sus = env.db.leer('v2_suscripciones/free1');
    assert.equal(sus.subscriptionId, 'sub_1');
    assert.equal(sus.email, 'carla@example.com');
    const recompensas = env.db.leer('v2_recompensas_estado/free1');
    assert.equal(recompensas.saldo, 300);
    assert.equal(recompensas.contadores.membresias, 1);
  });

  test('checkout.session.async_payment_succeeded activa el plan al confirmarse el método diferido', async () => {
    env.stripe.subscriptions.retrieve = async () => eventoSuscripcion().data.object;
    const evento = {
      id: 'evt_async_paid',
      object: 'event',
      type: 'checkout.session.async_payment_succeeded',
      created: 1_790_000_200,
      data: { object: { id: 'cs_async', object: 'checkout.session', mode: 'subscription', metadata: { origen: 'odonteck-club-v2' }, client_reference_id: 'free1', customer: 'cus_1', subscription: 'sub_1', payment_status: 'paid' } },
    };
    const { payload, firma } = eventoFirmado(evento);
    const r = await request(env.app).post('/stripe/webhook').set('Stripe-Signature', firma).set('Content-Type', 'application/json').send(payload).expect(200);
    assert.equal(r.body.resultado, 'suscripcion_guardada');
    assert.equal(env.db.leer('v2_suscripciones/free1').estado, 'active');
    assert.equal(env.db.leer('v2_recompensas_estado/free1').saldo, 300);
  });

  test('eventos de otra consultora no activan usuarios ni otorgan puntos', async () => {
    const evento = eventoSuscripcion();
    evento.data.object.metadata.origen = 'otra-plataforma';
    const { payload, firma } = eventoFirmado(evento);
    const r = await request(env.app).post('/stripe/webhook').set('Stripe-Signature', firma).set('Content-Type', 'application/json').send(payload).expect(200);
    assert.equal(r.body.resultado, 'ignorado_otro_origen');
    assert.equal(env.db.rutas('v2_suscripciones').length, 0);
  });

  test('puente heredado conserva bytes y firma y devuelve 503 si falla', async (t) => {
    const { webhookStripe } = await import('../src/routes/stripe.js');
    const evento = eventoSuscripcion();
    evento.data.object.metadata.origen = 'odonteck-panel';
    const { payload, firma } = eventoFirmado(evento);
    const req = { body: Buffer.from(payload), headers: { 'stripe-signature': firma } };
    const res = { set() {}, json(value) { this.body = value; } };
    const ctx = { stripe: env.stripe, config: { stripeWebhookSecret: WEBHOOK_SECRET, stripeLegacyForward: true } };
    const mock = t.mock.method(globalThis, 'fetch', async (url, options) => {
      assert.equal(url, 'https://odonteck-production.up.railway.app/stripe/webhook');
      assert.equal(options.body.toString(), payload);
      assert.equal(options.headers['stripe-signature'], firma);
      return { ok: true };
    });
    let error;
    await webhookStripe(ctx)(req, res, (e) => { error = e; });
    assert.equal(error, undefined);
    assert.equal(res.body.resultado, 'reenviado_heredado');
    mock.mock.mockImplementation(async () => ({ ok: false }));
    await webhookStripe(ctx)(req, res, (e) => { error = e; });
    assert.equal(error.status, 503);
  });

  test('checkout no pagado no activa acceso ni puntos', async () => {
    const evento = { id: 'evt_unpaid', type: 'checkout.session.completed', created: 1790000000,
      data: { object: { mode: 'subscription', metadata: { origen: 'odonteck-club-v2' }, payment_status: 'unpaid', client_reference_id: 'free1', subscription: 'sub_1' } } };
    const { payload, firma } = eventoFirmado(evento);
    const r = await request(env.app).post('/stripe/webhook').set('Stripe-Signature', firma).set('Content-Type', 'application/json').send(payload).expect(200);
    assert.equal(r.body.resultado, 'pendiente_pago');
    assert.equal(env.db.rutas('v2_suscripciones').length, 0);
    assert.equal(env.db.rutas('v2_recompensas_estado').length, 0);
  });
});
