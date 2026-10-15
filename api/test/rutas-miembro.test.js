import assert from 'node:assert/strict';
import { beforeEach, describe, test } from 'node:test';
import request from 'supertest';
import { MATERIALES_OFICIALES } from '../src/lib/materiales-oficiales.js';
import { AHORA_ISO, ORIGEN_OK, TOKENS, bearer, crearEntorno } from './fakes/app.js';

let env;
beforeEach(() => {
  env = crearEntorno();
});

const vista = (token, cursoId, n) => request(env.app).post(`/progreso/${cursoId}/vista`).set(bearer(token)).send({ n });

describe('públicas, autenticación y cabeceras', () => {
  test('GET /health responde { ok: true } sin token', async () => {
    const res = await request(env.app).get('/health').expect(200);
    assert.deepEqual(res.body, { ok: true });
  });

  test('401 sin token, con token inválido y con token revocado', async () => {
    for (const ruta of ['/me', '/catalogo', '/progreso', '/certificados', '/foro']) {
      const res = await request(env.app).get(ruta).expect(401);
      assert.equal(res.body.error, 'no_autenticado');
      assert.equal(typeof res.body.mensaje, 'string');
    }
    const invalido = await request(env.app).get('/me').set(bearer('tk-falso')).expect(401);
    assert.equal(invalido.body.error, 'token_invalido');
    const revocado = await request(env.app).get('/me').set(bearer(TOKENS.revocado)).expect(401);
    assert.equal(revocado.body.error, 'sesion_revocada');
    await request(env.app).post('/video/token').send({ cursoId: 'curso-a', n: 1 }).expect(401);
  });

  test('verifyIdToken se llama con checkRevoked = true', async () => {
    await request(env.app).get('/me').set(bearer(TOKENS.vip)).expect(200);
    assert.deepEqual(env.auth.llamadas.at(-1), { token: TOKENS.vip, checkRevoked: true });
  });

  test('rutas autenticadas mandan Cache-Control: no-store (también en 401)', async () => {
    const ok = await request(env.app).get('/me').set(bearer(TOKENS.vip)).expect(200);
    assert.equal(ok.headers['cache-control'], 'no-store');
    const no = await request(env.app).get('/me').expect(401);
    assert.equal(no.headers['cache-control'], 'no-store');
  });

  test('CORS: solo orígenes de la lista', async () => {
    const ok = await request(env.app).get('/health').set('Origin', ORIGEN_OK).expect(200);
    assert.equal(ok.headers['access-control-allow-origin'], ORIGEN_OK);
    const local = await request(env.app).options('/me').set('Origin', 'http://localhost:5179').set('Access-Control-Request-Method', 'GET');
    assert.equal(local.headers['access-control-allow-origin'], 'http://localhost:5179');
    const put = await request(env.app).options('/directorio/perfil').set('Origin', 'http://localhost:5179').set('Access-Control-Request-Method', 'PUT');
    assert.match(put.headers['access-control-allow-methods'], /PUT/);
    const malo = await request(env.app).get('/health').set('Origin', 'https://malicioso.example').expect(200);
    assert.equal(malo.headers['access-control-allow-origin'], undefined);
  });

  test('ruta inexistente y JSON inválido responden { error, mensaje }', async () => {
    const r404 = await request(env.app).get('/no-existe').expect(404);
    assert.equal(r404.body.error, 'ruta_no_encontrada');
    const r400 = await request(env.app).patch('/me/perfil').set(bearer(TOKENS.vip)).set('Content-Type', 'application/json').send('{mal');
    assert.equal(r400.status, 400);
    assert.equal(r400.body.error, 'json_invalido');
  });
});

describe('/me y perfil', () => {
  test('VIP por membresía vieja', async () => {
    const res = await request(env.app).get('/me').set(bearer(TOKENS.vip)).expect(200);
    assert.equal(res.body.uid, 'vip1');
    assert.equal(res.body.esVip, true);
    assert.equal(res.body.esAdmin, false);
    assert.equal(res.body.plan, 'mensual');
    assert.equal(res.body.vence, '2026-12-31T00:00:00.000Z');
    assert.equal(res.body.perfil.nombre, 'Dra. Ana VIP');
    assert.deepEqual(res.body.perfil.avisos, { enVivo: true, nuevos: true, comunidad: true });
  });

  test('VIP heredado por correo conserva acceso aunque el documento anterior sea email_...', async () => {
    env.db.docs.set('miembros/email_legacy_example_com', { uid: null, activa: true, plan: 'regalo', expiraEn: '2026-12-20T00:00:00.000Z', nombre: 'Dra. Legado', email: 'legacy@example.com', stripeCustomerId: 'cus_legacy' });
    const res = await request(env.app).get('/me').set(bearer(TOKENS.legacy)).expect(200);
    assert.equal(res.body.uid, 'legacy-auth-uid');
    assert.equal(res.body.esVip, true);
    assert.equal(res.body.plan, 'regalo');
    assert.equal(res.body.vence, '2026-12-20T00:00:00.000Z');
    assert.equal(res.body.perfil.nombre, 'Dra. Legado');
  });

  test('no VIP y admin', async () => {
    const free = await request(env.app).get('/me').set(bearer(TOKENS.free)).expect(200);
    assert.equal(free.body.esVip, false);
    const admin = await request(env.app).get('/me').set(bearer(TOKENS.admin)).expect(200);
    assert.equal(admin.body.esVip, true);
    assert.equal(admin.body.esAdmin, true);
  });

  test('PATCH /me/perfil guarda en v2_perfiles y nunca en miembros', async () => {
    const antes = env.db.leer('miembros/vip1');
    const res = await request(env.app)
      .patch('/me/perfil')
      .set(bearer(TOKENS.vip))
      .send({ nombre: 'Ana María', ciudad: 'CDMX', avisos: { comunidad: false }, activa: false })
      .expect(200);
    assert.equal(res.body.nombre, 'Ana María');
    assert.deepEqual(res.body.avisos, { enVivo: true, nuevos: true, comunidad: false });
    assert.equal(env.db.leer('v2_perfiles/vip1').ciudad, 'CDMX');
    assert.deepEqual(env.db.leer('miembros/vip1'), antes);
    await request(env.app).patch('/me/perfil').set(bearer(TOKENS.vip)).send({ nombre: '<img src=x>' }).expect(400);
    await request(env.app).patch('/me/perfil').set(bearer(TOKENS.vip)).send({ whatsapp: 'no es tel' }).expect(400);
  });

  test('PATCH /me/intereses valida, guarda en v2_perfiles y sobrevive a otros cambios de perfil', async () => {
    const antes = env.db.leer('miembros/vip1');
    const res = await request(env.app).patch('/me/intereses').set(bearer(TOKENS.vip))
      .send({ intereses: ['ortodoncia', 'endodoncia', 'cirugia'] }).expect(200);
    assert.deepEqual(res.body, { intereses: ['ortodoncia', 'endodoncia', 'cirugia'] });
    assert.deepEqual(env.db.leer('v2_perfiles/vip1').intereses, ['ortodoncia', 'endodoncia', 'cirugia']);

    for (const intereses of [[], ['ortodoncia', 'ortodoncia'], ['ortodoncia', 'endodoncia', 'cirugia', 'periodoncia'], ['no-existe']]) {
      await request(env.app).patch('/me/intereses').set(bearer(TOKENS.vip)).send({ intereses }).expect(400);
    }

    await request(env.app).patch('/me/perfil').set(bearer(TOKENS.vip)).send({ ciudad: 'Puebla' }).expect(200);
    assert.deepEqual(env.db.leer('v2_perfiles/vip1').intereses, ['ortodoncia', 'endodoncia', 'cirugia']);
    assert.deepEqual(env.db.leer('miembros/vip1'), antes);
  });
});

describe('encuestas de miembro', () => {
  const bienvenida = {
    situacion: 'estudiante',
    como_conocio: 'instagram',
    objetivo: 'practica',
    intereses: ['diagnostico', 'ortodoncia'],
    experiencia: 'sin_pacientes',
    formato: ['video', 'casos'],
    reto: 'tiempo',
  };

  test('entrevista inicial: aparece una vez, valida y guarda sin tocar miembros', async () => {
    const antes = env.db.leer('miembros/free1');
    const pendientes = await request(env.app).get('/encuestas/pendientes').set(bearer(TOKENS.free)).expect(200);
    assert.equal(pendientes.body.pendientes[0].clave, 'bienvenida-v2');
    assert.equal(pendientes.body.pendientes[0].preguntas.length, 7);
    assert.equal(JSON.stringify(pendientes.body).includes('uid'), false);

    await request(env.app).post('/encuestas/bienvenida-v2/responder').set(bearer(TOKENS.free)).send({ respuestas: { ...bienvenida, intereses: ['ortodoncia', 'endodoncia', 'cirugia', 'periodoncia'] } }).expect(400);
    const guardada = await request(env.app).post('/encuestas/bienvenida-v2/responder').set(bearer(TOKENS.free)).send({ respuestas: bienvenida }).expect(201);
    assert.equal(guardada.body.ok, true);
    assert.deepEqual(env.db.leer('v2_encuestas_respuestas/free1__bienvenida-v2').respuestas, bienvenida);
    assert.deepEqual(env.db.leer('miembros/free1'), antes);
    const despues = await request(env.app).get('/encuestas/pendientes').set(bearer(TOKENS.free)).expect(200);
    assert.equal(despues.body.pendientes.some((x) => x.clave === 'bienvenida-v2'), false);
    // El perfil de la entrevista vuelve al cliente para personalizar el club, sin nada identificable.
    assert.deepEqual(despues.body.perfil, { intereses: ['diagnostico', 'ortodoncia'], objetivo: 'practica', formato: ['video', 'casos'], situacion: 'estudiante', reto: 'tiempo' });
    assert.equal(pendientes.body.perfil, null);
    await request(env.app).patch('/me/intereses').set(bearer(TOKENS.free)).send({ intereses: ['endodoncia'] }).expect(200);
    const actualizado = await request(env.app).get('/encuestas/pendientes').set(bearer(TOKENS.free)).expect(200);
    assert.deepEqual(actualizado.body.perfil.intereses, ['endodoncia']);
    assert.deepEqual(env.db.leer('v2_encuestas_respuestas/free1__bienvenida-v2').respuestas.intereses, ['diagnostico', 'ortodoncia']);
    await request(env.app).post('/encuestas/bienvenida-v2/responder').set(bearer(TOKENS.free)).send({ respuestas: bienvenida }).expect(409);
  });

  test('se puede posponer sin perderla y no se muestra a administradores', async () => {
    const r = await request(env.app).post('/encuestas/bienvenida-v2/posponer').set(bearer(TOKENS.vip)).send({}).expect(200);
    assert.equal(r.body.dias, 3);
    const pendientes = await request(env.app).get('/encuestas/pendientes').set(bearer(TOKENS.vip)).expect(200);
    assert.equal(pendientes.body.pendientes.some((x) => x.clave === 'bienvenida-v2'), false);
    assert.equal(env.db.leer('v2_encuestas_estado/vip1').pospuestas['bienvenida-v2'].veces, 1);
    const admin = await request(env.app).get('/encuestas/pendientes').set(bearer(TOKENS.admin)).expect(200);
    assert.deepEqual(admin.body.pendientes, []);
  });

  test('al terminar un curso aparece su evaluación una sola vez', async () => {
    for (const n of [1, 2, 3]) await vista(TOKENS.vip, 'curso-a', n).expect(200);
    const pendientes = await request(env.app).get('/encuestas/pendientes').set(bearer(TOKENS.vip)).expect(200);
    const curso = pendientes.body.pendientes.find((x) => x.tipo === 'curso');
    assert.equal(curso.clave, 'curso-final-v1--curso-a');
    assert.equal(curso.cursoTitulo, 'Endodoncia práctica');
    const respuestas = { utilidad: 5, claridad: 4, aplicacion: 'inmediato', recomendacion: 9, mejora: 'Agregar un caso final.' };
    await request(env.app).post(`/encuestas/${curso.clave}/responder`).set(bearer(TOKENS.vip)).send({ respuestas }).expect(201);
    const despues = await request(env.app).get('/encuestas/pendientes').set(bearer(TOKENS.vip)).expect(200);
    assert.equal(despues.body.pendientes.some((x) => x.clave === curso.clave), false);
  });

  // El reloj de pruebas está en 2026-09-17: la clave del trimestre es experiencia-v2--2026T3.
  const EXPERIENCIA = 'experiencia-v2--2026T3';
  const experiencia = {
    uso: 'semanal', dispositivo: 'celular', facilidad: 4, tecnico: 'ninguno', calidad: 5, duracion: 'adecuada', nivel: 'adecuado',
    valor: ['cursos', 'quizzes'], sin_usar: ['comunidad'], falta: ['casos'], recomendacion: 9, mejora: 'Más casos.',
  };
  const prepararExperiencia = async (token, uid, primeraVista = '2026-08-20T12:00:00.000Z') => {
    await request(env.app).get('/encuestas/pendientes').set(bearer(token)).expect(200);
    await request(env.app).post('/encuestas/bienvenida-v2/responder').set(bearer(token)).send({ respuestas: bienvenida }).expect(201);
    env.db.docs.set(`v2_encuestas_estado/${uid}`, { ...env.db.leer(`v2_encuestas_estado/${uid}`), primeraVista });
  };

  test('experiencia: aparece a los 21 días, aplica condicionales por plan y guarda el plan sin correo', async () => {
    await prepararExperiencia(TOKENS.free, 'free1');
    const pendientes = await request(env.app).get('/encuestas/pendientes').set(bearer(TOKENS.free)).expect(200);
    assert.equal(pendientes.body.pendientes[0].clave, EXPERIENCIA);
    assert.equal(pendientes.body.vip, false);
    assert.deepEqual(pendientes.body.respondidas, ['bienvenida-v2']);
    // Hasta 2 en "qué falta"; un promotor no debe contestar motivo ni contacto; una cuenta gratis no ve "renovar".
    await request(env.app).post(`/encuestas/${EXPERIENCIA}/responder`).set(bearer(TOKENS.free)).send({ respuestas: { ...experiencia, falta: ['casos', 'app', 'descargas'] } }).expect(400);
    await request(env.app).post(`/encuestas/${EXPERIENCIA}/responder`).set(bearer(TOKENS.free)).send({ respuestas: { ...experiencia, vip_que: 'precio', renovar: 'si', motivo: 'x', contacto: 'si' } }).expect(201);
    const doc = env.db.leer(`v2_encuestas_respuestas/free1__${EXPERIENCIA}`);
    assert.deepEqual(doc.respuestas, { ...experiencia, vip_que: 'precio' });
    assert.equal(doc.vip, false);
    assert.equal(doc.correoContacto, undefined);
  });

  test('experiencia: un detractor VIP contesta motivo y contacto; el correo sólo se guarda con permiso', async () => {
    await prepararExperiencia(TOKENS.vip, 'vip1');
    const detractor = { ...experiencia, tecnico: 'video', tecnico_detalle: 'No carga en Safari', recomendacion: 4, motivo: 'Faltan cursos de mi área', renovar: 'no_se', contacto: 'si' };
    await request(env.app).post(`/encuestas/${EXPERIENCIA}/responder`).set(bearer(TOKENS.vip)).send({ respuestas: { ...detractor, contacto: undefined } }).expect(400); // contacto es obligatorio para quien califica bajo
    await request(env.app).post(`/encuestas/${EXPERIENCIA}/responder`).set(bearer(TOKENS.vip)).send({ respuestas: detractor }).expect(201);
    const doc = env.db.leer(`v2_encuestas_respuestas/vip1__${EXPERIENCIA}`);
    assert.equal(doc.vip, true);
    assert.equal(doc.correoContacto, 'ana@example.com');
    assert.equal(doc.respuestas.renovar, 'no_se');
    assert.equal(doc.respuestas.vip_que, undefined);
    assert.equal(doc.respuestas.tecnico_detalle, 'No carga en Safari');
    const despues = await request(env.app).get('/encuestas/pendientes').set(bearer(TOKENS.vip)).expect(200);
    assert.equal(despues.body.pendientes.some((x) => x.clave === EXPERIENCIA), false);
  });

  test('experiencia: se adelanta al día 7 con 8 clases, nunca antes, y se repite hasta pasados 90 días', async () => {
    await prepararExperiencia(TOKENS.vip, 'vip1', '2026-09-14T12:00:00.000Z');
    const estado = env.db.leer('v2_encuestas_estado/vip1');
    env.db.docs.set('v2_progreso/vip1_curso-x', { uid: 'vip1', cursoId: 'curso-x', vistas: [1, 2, 3, 4, 5, 6, 7, 8], historial: [] });
    let pendientes = await request(env.app).get('/encuestas/pendientes').set(bearer(TOKENS.vip)).expect(200);
    assert.equal(pendientes.body.pendientes.some((x) => x.clave === EXPERIENCIA), false, 'con 3 días no aparece aunque haya avanzado');
    env.db.docs.set('v2_encuestas_estado/vip1', { ...estado, primeraVista: '2026-09-09T12:00:00.000Z' });
    pendientes = await request(env.app).get('/encuestas/pendientes').set(bearer(TOKENS.vip)).expect(200);
    assert.equal(pendientes.body.pendientes.some((x) => x.clave === EXPERIENCIA), true, 'con 8 días y 8 clases sí aparece');
    // Respondió el trimestre pasado hace 40 días: todavía no se repite; hace 100 días: sí.
    env.db.docs.set('v2_encuestas_respuestas/vip1__experiencia-v2--2026T2', { uid: 'vip1', clave: 'experiencia-v2--2026T2', encuestaId: 'experiencia', version: 2, tipo: 'pulso', vip: true, respuestas: { recomendacion: 8 }, enviado: '2026-08-08T12:00:00.000Z' });
    pendientes = await request(env.app).get('/encuestas/pendientes').set(bearer(TOKENS.vip)).expect(200);
    assert.equal(pendientes.body.pendientes.some((x) => x.clave === EXPERIENCIA), false, 'respondida hace 40 días: aún no');
    env.db.docs.set('v2_encuestas_respuestas/vip1__experiencia-v2--2026T2', { ...env.db.leer('v2_encuestas_respuestas/vip1__experiencia-v2--2026T2'), enviado: '2026-06-09T12:00:00.000Z' });
    pendientes = await request(env.app).get('/encuestas/pendientes').set(bearer(TOKENS.vip)).expect(200);
    assert.equal(pendientes.body.pendientes.some((x) => x.clave === EXPERIENCIA), true, 'respondida hace 100 días: vuelve a salir');
  });

  test('experiencia: tras dos aplazamientos deja de insistir en el trimestre', async () => {
    await prepararExperiencia(TOKENS.free, 'free1');
    for (let i = 0; i < 2; i++) {
      const r = await request(env.app).post(`/encuestas/${EXPERIENCIA}/posponer`).set(bearer(TOKENS.free)).send({}).expect(200);
      assert.equal(r.body.dias, 14);
      const estado = env.db.leer('v2_encuestas_estado/free1');
      env.db.docs.set('v2_encuestas_estado/free1', { ...estado, pospuestas: { ...estado.pospuestas, [EXPERIENCIA]: { ...estado.pospuestas[EXPERIENCIA], hasta: '2026-09-01T00:00:00.000Z' } } });
    }
    const pendientes = await request(env.app).get('/encuestas/pendientes').set(bearer(TOKENS.free)).expect(200);
    assert.equal(pendientes.body.pendientes.some((x) => x.clave === EXPERIENCIA), false, 'aplazada dos veces: ya no insiste');
    await request(env.app).post(`/encuestas/${EXPERIENCIA}/posponer`).set(bearer(TOKENS.free)).send({}).expect(409);
  });
});

describe('/catalogo', () => {
  test('nunca devuelve videoId y oculta lo no publicado', async () => {
    const res = await request(env.app).get('/catalogo').set(bearer(TOKENS.vip)).expect(200);
    assert.equal(JSON.stringify(res.body).includes('videoId'), false);
    assert.equal(JSON.stringify(res.body).includes('video-a-1'), false);
    assert.deepEqual(res.body.cursos.map((c) => c.id), ['curso-a']);
    assert.equal(res.body.cursos[0].clases.length, 3);
    assert.equal(res.body.cursos[0].clases[0].ficha.estado, 'aprobada');
    assert.equal(JSON.stringify(res.body).includes('fichas/curso-a/1.pdf'), false, 'la ruta privada del PDF no sale en el catálogo');
    // El catálogo incluye los materiales de Firestore + el lote oficial pendiente
    // (merged dedupeado por id). Mientras Storage no esté habilitado, los 10
    // oficiales aparecen como "proximamente" para no dejar la biblioteca vacía.
    const idsMateriales = res.body.materiales.map((m) => m.id);
    assert.ok(idsMateriales.includes('guia'));
    assert.ok(idsMateriales.includes('manual-vip'));
    assert.equal(res.body.materiales.find((m) => m.id === 'guia').gratis, true);
    assert.deepEqual(res.body.eventos.map((e) => e.id), ['ev1']);
    assert.equal(res.body.config.precios.mensual, 199);
  });

  test('eventos: sin uids de otros; enlace solo para VIP', async () => {
    const vip = await request(env.app).get('/catalogo').set(bearer(TOKENS.vip)).expect(200);
    assert.equal(vip.body.eventos[0].reservas, 1);
    assert.equal(vip.body.eventos[0].reservado, false);
    assert.equal(vip.body.eventos[0].enlace, 'https://meet.example.com/x');
    const free = await request(env.app).get('/catalogo').set(bearer(TOKENS.free)).expect(200);
    assert.equal(free.body.eventos[0].enlace, null);
    assert.equal(JSON.stringify(free.body).includes('otro-uid'), false);
  });
});

describe('acceso a clases', () => {
  test('firma la ficha aprobada y conserva el mismo acceso secuencial de la clase', async () => {
    const ok = await request(env.app).get('/clases/curso-a/1/ficha').set(bearer(TOKENS.free)).expect(200);
    assert.match(ok.body.url, /fichas%?\/?curso-a%?\/?1\.pdf|fichas\/curso-a\/1\.pdf/);
    const firma = env.storage.firmadas.at(-1);
    assert.equal(firma.action, 'read');
    assert.equal(firma.expires - Date.parse('2026-09-17T12:00:00Z'), 10 * 60 * 1000);
    await request(env.app).get('/clases/curso-a/2/ficha').set(bearer(TOKENS.free)).expect(403);
  });
  test('clase gratis sin VIP: se puede ver; clase de pago: 403 requiere_vip', async () => {
    const ok = await request(env.app).post('/video/token').set(bearer(TOKENS.free)).send({ cursoId: 'curso-a', n: 1 }).expect(200);
    assert.match(ok.body.embedUrl, /^https:\/\/iframe\.mediadelivery\.net\/embed\/725453\/video-a-1\?token=[0-9a-f]{64}&expires=\d+$/);
    assert.equal(ok.body.expires, Math.floor(Date.parse('2026-09-17T12:00:00Z') / 1000) + 300);

    await vista(TOKENS.free, 'curso-a', 1).expect(200);
    const bloqueada = await request(env.app).post('/video/token').set(bearer(TOKENS.free)).send({ cursoId: 'curso-a', n: 2 }).expect(403);
    assert.equal(bloqueada.body.error, 'requiere_vip');
    await vista(TOKENS.free, 'curso-a', 2).expect(403);
  });

  test('clase bloqueada hasta ver la anterior (video, abrir y vista)', async () => {
    const r1 = await request(env.app).post('/video/token').set(bearer(TOKENS.vip)).send({ cursoId: 'curso-a', n: 2 }).expect(403);
    assert.equal(r1.body.error, 'clase_bloqueada');
    assert.equal(r1.body.requiere, 1);
    const r2 = await vista(TOKENS.vip, 'curso-a', 2).expect(403);
    assert.equal(r2.body.error, 'clase_bloqueada');
    await request(env.app).post('/progreso/curso-a/abrir').set(bearer(TOKENS.vip)).send({ n: 3 }).expect(403);

    await vista(TOKENS.vip, 'curso-a', 1).expect(200);
    await request(env.app).post('/video/token').set(bearer(TOKENS.vip)).send({ cursoId: 'curso-a', n: 2 }).expect(200);
    await request(env.app).post('/video/token').set(bearer(TOKENS.vip)).send({ cursoId: 'curso-a', n: 3 }).expect(403);
  });

  test('curso no publicado, clase inexistente y datos inválidos', async () => {
    const r = await request(env.app).post('/video/token').set(bearer(TOKENS.vip)).send({ cursoId: 'curso-b', n: 1 }).expect(404);
    assert.equal(r.body.error, 'curso_no_encontrado');
    await request(env.app).post('/video/token').set(bearer(TOKENS.vip)).send({ cursoId: 'curso-a', n: 9 }).expect(404);
    await request(env.app).post('/video/token').set(bearer(TOKENS.vip)).send({ cursoId: 'curso-a', n: 'x' }).expect(400);
  });

  test('sin llave de Bunny: 503', async () => {
    const e = crearEntorno({ sinBunny: true });
    const r = await request(e.app).post('/video/token').set(bearer(TOKENS.vip)).send({ cursoId: 'curso-a', n: 1 }).expect(503);
    assert.equal(r.body.error, 'no_configurado');
  });

  test('cortesía vigente abre clases de pago; vencida no', async () => {
    env.db.docs.set('v2_cortesias/free1', { uid: 'free1', hasta: '2026-09-20T00:00:00.000Z', motivo: 'prueba' });
    await vista(TOKENS.free, 'curso-a', 1).expect(200);
    await vista(TOKENS.free, 'curso-a', 2).expect(200);
    env.reloj.ahora = new Date('2026-09-21T00:00:00Z');
    await vista(TOKENS.free, 'curso-a', 3).expect(403);
  });
});

describe('progreso y certificados', () => {
  test('abrir registra la última clase', async () => {
    const r = await request(env.app).post('/progreso/curso-a/abrir').set(bearer(TOKENS.vip)).send({ n: 1 }).expect(200);
    assert.deepEqual(r.body, { vistas: [], ultima: 1, historial: [], actualizado: '2026-09-17T12:00:00.000Z' });
  });

  test('al ver la última clase se emite el certificado, idempotente y con folio único', async () => {
    const r1 = await vista(TOKENS.vip, 'curso-a', 1).expect(200);
    assert.equal(r1.body.certificado, undefined);
    await vista(TOKENS.vip, 'curso-a', 2).expect(200);
    const r3 = await vista(TOKENS.vip, 'curso-a', 3).expect(200);
    assert.deepEqual(r3.body.progreso.vistas, [1, 2, 3]);
    const cert = r3.body.certificado;
    assert.equal(cert.folio, 'ODT-2026-00001');
    assert.equal(cert.uid, 'vip1');
    assert.equal(cert.nombre, 'Dra. Ana VIP');
    assert.equal(cert.cursoTitulo, 'Endodoncia práctica');
    assert.equal(cert.clases, 3);

    // Repetir la última vista (o cualquiera) no emite otro folio.
    const otra = await vista(TOKENS.vip, 'curso-a', 3).expect(200);
    assert.equal(otra.body.certificado.folio, cert.folio);
    assert.equal(otra.body.progreso.historial.length, 3, 'repetir una vista no duplica historial');
    const lista = await request(env.app).get('/certificados').set(bearer(TOKENS.vip)).expect(200);
    assert.equal(lista.body.length, 1);
    assert.equal(env.db.rutas('v2_certificados').length, 1);

    // Otro usuario recibe el siguiente folio.
    for (const n of [1, 2]) await vista(TOKENS.vip2, 'curso-a', n).expect(200);
    const b = await vista(TOKENS.vip2, 'curso-a', 3).expect(200);
    assert.equal(b.body.certificado.folio, 'ODT-2026-00002');

    // /progreso refleja el avance sin campos internos.
    const prog = await request(env.app).get('/progreso').set(bearer(TOKENS.vip)).expect(200);
    assert.deepEqual(Object.keys(prog.body), ['curso-a']);
    assert.deepEqual(Object.keys(prog.body['curso-a']).sort(), ['actualizado', 'historial', 'ultima', 'vistas']);
  });

  test('vistas simultáneas de la última clase generan un solo certificado', async () => {
    await vista(TOKENS.vip, 'curso-a', 1).expect(200);
    await vista(TOKENS.vip, 'curso-a', 2).expect(200);
    const [a, b] = await Promise.all([vista(TOKENS.vip, 'curso-a', 3), vista(TOKENS.vip, 'curso-a', 3)]);
    assert.equal(a.body.certificado.folio, b.body.certificado.folio);
    assert.equal(env.db.rutas('v2_certificados').length, 1);
  });

  test('/verificar/:folio es público y no expone uid', async () => {
    for (const n of [1, 2, 3]) await vista(TOKENS.vip, 'curso-a', n).expect(200);
    const ok = await request(env.app).get('/verificar/ODT-2026-00001').expect(200);
    assert.deepEqual(ok.body, { valido: true, folio: 'ODT-2026-00001', nombre: 'Dra. Ana VIP', cursoTitulo: 'Endodoncia práctica', emitido: '2026-09-17T12:00:00.000Z' });
    const no = await request(env.app).get('/verificar/ODT-2026-09999').expect(404);
    assert.equal(no.body.valido, false);
    await request(env.app).get('/verificar/cualquier-cosa').expect(400);
  });

  test('/verificar acepta el folio del club anterior migrado en folioAnterior', async () => {
    await env.db.collection('v2_certificados').doc('ODT-2026-00042').set({ folio: 'ODT-2026-00042', folioAnterior: 'OdonTeck-2025-A1B2C3', uid: 'viejo', nombre: 'Dra. Migrada', cursoTitulo: 'Curso viejo', emitido: '2025-05-01T00:00:00.000Z' });
    const ok = await request(env.app).get('/verificar/OdonTeck-2025-A1B2C3').expect(200);
    assert.equal(ok.body.folio, 'ODT-2026-00042');
    assert.equal(ok.body.uid, undefined);
    await request(env.app).get('/verificar/ODONTECK-2025-A1B2C3').expect(200);
    await request(env.app).get('/verificar/OdonTeck-2025-ZZZZZZ').expect(404);
  });

  test('una suscripción del checkout nuevo da acceso VIP en /me', async () => {
    await env.db.collection('v2_suscripciones').doc('free1').set({ estado: 'active', plan: 'anual', periodoFin: '2027-09-17T12:00:00.000Z' });
    const me = await request(env.app).get('/me').set(bearer(TOKENS.free)).expect(200);
    assert.equal(me.body.esVip, true);
    assert.equal(me.body.plan, 'anual');
  });
});

describe('materiales', () => {
  test('permite el material gratuito y reserva los demás para VIP con URL firmada de 10 minutos', async () => {
    const gratis = await request(env.app).get('/materiales/guia/descarga').set(bearer(TOKENS.free)).expect(200);
    assert.match(gratis.body.url, /materiales\/guia\.pdf/);
    const bloqueado = await request(env.app).get('/materiales/manual-vip/descarga').set(bearer(TOKENS.free)).expect(403);
    assert.equal(bloqueado.body.error, 'requiere_vip');
    const ok = await request(env.app).get('/materiales/manual-vip/descarga').set(bearer(TOKENS.vip)).expect(200);
    assert.match(ok.body.url, /materiales\/manual-vip\.pdf/);
    const firma = env.storage.firmadas.at(-1);
    assert.equal(firma.action, 'read');
    assert.equal(firma.expires - Date.parse('2026-09-17T12:00:00Z'), 10 * 60 * 1000);
    await request(env.app).get('/materiales/secreto/descarga').set(bearer(TOKENS.vip)).expect(404);
  });
});

describe('recompensas y puntos', () => {
  test('reconoce una vez la membresía pagada de usuarios anteriores', async () => {
    const primero = await request(env.app).get('/recompensas/resumen').set(bearer(TOKENS.vip)).expect(200);
    assert.equal(primero.body.saldo, 300);
    assert.equal(primero.body.contadores.membresias, 1);
    assert.equal(primero.body.logros.find((l) => l.id === 'miembro-club').logrado, true);
    const segundo = await request(env.app).get('/recompensas/resumen').set(bearer(TOKENS.vip)).expect(200);
    assert.equal(segundo.body.saldo, 300);
    assert.equal(segundo.body.movimientos.filter((m) => m.tipo === 'membresia').length, 1);
  });

  test('una clase suma una sola vez y crea el logro sin permitir puntos por recarga', async () => {
    const primera = await vista(TOKENS.free, 'curso-a', 1).expect(200);
    assert.equal(primera.body.recompensas.puntosGanados, 10);
    assert.equal(primera.body.recompensas.saldo, 10);
    assert.equal(primera.body.recompensas.logrosNuevos[0].id, 'primer-paso');

    const repetida = await vista(TOKENS.free, 'curso-a', 1).expect(200);
    assert.equal(repetida.body.recompensas.puntosGanados, 0);
    assert.equal(repetida.body.recompensas.saldo, 10);

    const resumen = await request(env.app).get('/recompensas/resumen').set(bearer(TOKENS.free)).expect(200);
    assert.equal(resumen.body.saldo, 10);
    assert.equal(resumen.body.ganados, 10);
    assert.equal(resumen.body.logros.find((l) => l.id === 'primer-paso').logrado, true);
    assert.equal(env.db.rutas('v2_recompensas_movimientos').filter((ruta) => env.db.leer(ruta).tipo === 'clase').length, 1);
  });

  test('un usuario gratis canjea una guía propia y obtiene acceso permanente; Praxia queda pendiente', async () => {
    env.db.docs.set('v2_recompensas_estado/free1', {
      uid: 'free1', saldo: 1750, ganados: 1750, gastados: 0, contadores: {}, logros: {},
      desbloqueos: { materiales: [] }, notificaciones: [], actualizado: AHORA_ISO,
    });

    const noPublicado = await request(env.app).post('/recompensas/canjear').set(bearer(TOKENS.free))
      .send({ recompensaId: 'guia-diagnostico-ortodoncico' }).expect(409);
    assert.equal(noPublicado.body.error, 'recompensa_no_disponible');
    assert.equal(env.db.leer('v2_recompensas_estado/free1').saldo, 1750, 'un material no publicado no consume puntos');

    env.db.docs.set('v2_materiales/guia-diagnostico-ortodoncico', {
      id: 'guia-diagnostico-ortodoncico', titulo: 'Guía de diagnóstico', tipo: 'PDF', estado: 'disponible', gratis: false,
      archivo: 'materiales/guia-diagnostico-ortodoncico.pdf',
    });

    await request(env.app).get('/materiales/guia-diagnostico-ortodoncico/descarga').set(bearer(TOKENS.free)).expect(403);
    const guia = await request(env.app).post('/recompensas/canjear').set(bearer(TOKENS.free))
      .send({ recompensaId: 'guia-diagnostico-ortodoncico' }).expect(201);
    assert.equal(guia.body.saldo, 1500);
    assert.equal(guia.body.recompensa.estatus, 'entregado');
    assert.equal(env.db.rutas('v2_recompensas_movimientos').map((ruta) => env.db.leer(ruta)).find((x) => x.tipo === 'canje').puntos, -250);
    await request(env.app).get('/materiales/guia-diagnostico-ortodoncico/descarga').set(bearer(TOKENS.free)).expect(200);
    await request(env.app).post('/recompensas/canjear').set(bearer(TOKENS.free))
      .send({ recompensaId: 'guia-diagnostico-ortodoncico' }).expect(409);

    const praxia = await request(env.app).post('/recompensas/canjear').set(bearer(TOKENS.free))
      .send({ recompensaId: 'praxia-30-dias' }).expect(201);
    assert.equal(praxia.body.saldo, 0);
    assert.equal(praxia.body.recompensa.estatus, 'pendiente');
    const canje = env.db.rutas('v2_recompensas_canjes').map((ruta) => env.db.leer(ruta)).find((x) => x.recompensaId === 'praxia-30-dias');
    assert.equal(canje.estatus, 'pendiente');
  });

  test('los diez materiales propios se publican desde la API privada y respetan gratis, VIP o canje', async () => {
    env = crearEntorno({ materialesEmpaquetados: MATERIALES_OFICIALES.map((m) => m.id) });
    const catalogo = await request(env.app).get('/catalogo').set(bearer(TOKENS.free)).expect(200);
    const oficiales = catalogo.body.materiales.filter((m) => MATERIALES_OFICIALES.some((oficial) => oficial.id === m.id));
    assert.equal(oficiales.length, 10);
    assert.equal(oficiales.every((m) => m.estado === 'disponible'), true);
    assert.equal(oficiales.find((m) => m.id === 'atlas-caries-icdas').gratis, true);
    assert.equal(oficiales.filter((m) => m.id !== 'atlas-caries-icdas').every((m) => m.puntosRequeridos > 0), true);

    const gratis = await request(env.app).get('/materiales/atlas-caries-icdas/descarga').set(bearer(TOKENS.free)).expect(200);
    const enlace = new URL(gratis.body.url);
    const pdf = await request(env.app).get(`${enlace.pathname}${enlace.search}`).expect(200);
    assert.match(pdf.headers['content-type'], /application\/pdf/);
    await request(env.app).get('/materiales/guia-diagnostico-ortodoncico/descarga').set(bearer(TOKENS.free)).expect(403);

    env.db.docs.set('v2_recompensas_estado/free1', {
      uid: 'free1', saldo: 250, ganados: 250, gastados: 0, contadores: {}, logros: {},
      desbloqueos: { materiales: [] }, notificaciones: [], actualizado: AHORA_ISO,
    });
    await request(env.app).post('/recompensas/canjear').set(bearer(TOKENS.free))
      .send({ recompensaId: 'guia-diagnostico-ortodoncico' }).expect(201);
    await request(env.app).get('/materiales/guia-diagnostico-ortodoncico/descarga').set(bearer(TOKENS.free)).expect(200);

    const resumen = await request(env.app).get('/recompensas/resumen').set(bearer(TOKENS.free)).expect(200);
    const materiales = resumen.body.recompensas.filter((r) => r.tipo === 'material');
    assert.equal(materiales.length, 9);
    assert.equal(materiales.every((r) => r.disponible === true), true);
  });
});

describe('quizzes', () => {
  test('GET no incluye respuestas ni explicaciones; solo quizzes aprobados', async () => {
    const r = await request(env.app).get('/quiz/curso-a/1').set(bearer(TOKENS.free)).expect(200);
    assert.equal(r.body.preguntas.length, 3);
    for (const p of r.body.preguntas) assert.deepEqual(Object.keys(p).sort(), ['id', 'instruccion', 'opciones', 'q', 'tipo']);
    assert.equal(JSON.stringify(r.body).includes('correcta'), false);
    const borrador = await request(env.app).get('/quiz/curso-a/2').set(bearer(TOKENS.vip)).expect(404);
    assert.equal(borrador.body.error, 'quiz_no_disponible');
  });

  test('POST califica con umbral de 70%', async () => {
    const reprobado = await request(env.app).post('/quiz/curso-a/1').set(bearer(TOKENS.vip)).send({
      respuestas: [0, 1, 0], confianzas: [2, 3, 1], justificaciones: ['Comparé los hallazgos.', '', 'Me faltó revisar la evidencia.'],
    }).expect(200);
    assert.equal(reprobado.body.correctas, 2);
    assert.equal(reprobado.body.total, 3);
    assert.equal(reprobado.body.aprobado, false, '66% no aprueba');
    assert.deepEqual(reprobado.body.detalle.map((d) => d.correcta), [0, 1, 2]);
    assert.equal(reprobado.body.detalle[2].explicacion, 'Explicación de P3');

    const aprobado = await request(env.app).post('/quiz/curso-a/1').set(bearer(TOKENS.vip)).send({
      respuestas: [0, 1, 2], confianzas: [3, 3, 3], justificaciones: ['A', 'B', 'C'],
    }).expect(200);
    assert.equal(aprobado.body.aprobado, true);
    assert.deepEqual(aprobado.body.intento, { numero: 2, mejorPuntaje: 100, aprobadoAlgunaVez: true, versionQuiz: 1, fecha: AHORA_ISO });
    let intento = env.db.leer('v2_intentos/vip1_curso-a_1');
    assert.equal(intento.correctas, 3);
    assert.equal(intento.aprobado, true);
    assert.equal(intento.intentos, 2);
    assert.equal(intento.historial.length, 2);
    assert.equal(intento.historial[0].confianzaPromedio, 2);
    assert.deepEqual(intento.historial[1].respuestas, [0, 1, 2]);
    assert.deepEqual(intento.historial[1].justificaciones, ['A', 'B', 'C']);

    await request(env.app).post('/quiz/curso-a/1').set(bearer(TOKENS.vip)).send({ respuestas: [2, 2, 2] }).expect(200);
    intento = env.db.leer('v2_intentos/vip1_curso-a_1');
    assert.equal(intento.aprobado, false, 'el último intento conserva su resultado real');
    assert.equal(intento.aprobadoAlgunaVez, true, 'un reintento no borra una aprobación anterior');
    assert.equal(intento.mejorPuntaje, 100);
    assert.equal(intento.historial.length, 3);

    await request(env.app).post('/quiz/curso-a/1').set(bearer(TOKENS.vip)).send({ respuestas: [0, 1] }).expect(400);
    await request(env.app).post('/quiz/curso-a/1').set(bearer(TOKENS.vip)).send({ respuestas: ['a', 1, 2] }).expect(400);
    await request(env.app).post('/quiz/curso-a/1').set(bearer(TOKENS.vip)).send({ respuestas: [0, 1, 2], confianzas: [4, 2, 1] }).expect(400);
    await request(env.app).post('/quiz/curso-a/1').set(bearer(TOKENS.vip)).send({ respuestas: [0, 1, 2], justificaciones: ['solo una'] }).expect(400);
  });

  test('quiz de una clase de pago exige VIP', async () => {
    env.db.docs.set('v2_quizzes/curso-a_2', { cursoId: 'curso-a', n: 2, estado: 'aprobado', preguntas: [{ q: 'x', opciones: ['a', 'b'], correcta: 0 }] });
    await request(env.app).get('/quiz/curso-a/2').set(bearer(TOKENS.free)).expect(403);
  });

  test('si falla la lectura del quiz, el 404 del curso y el 403 de VIP conservan su prioridad', async () => {
    const snapshot = env.db._snapshot.bind(env.db);
    env.db._snapshot = (ref) => {
      if (ref.path.startsWith('v2_quizzes/')) throw new Error('Firestore no disponible (simulado).');
      return snapshot(ref);
    };
    const inexistente = await request(env.app).get('/quiz/no-existe/1').set(bearer(TOKENS.free)).expect(404);
    assert.equal(inexistente.body.error, 'curso_no_encontrado');
    const sinClase = await request(env.app).get('/quiz/curso-a/9').set(bearer(TOKENS.free)).expect(404);
    assert.equal(sinClase.body.error, 'clase_no_encontrada');
    const vip = await request(env.app).get('/quiz/curso-a/2').set(bearer(TOKENS.free)).expect(403);
    assert.equal(vip.body.error, 'requiere_vip');
    const accesible = await request(env.app).get('/quiz/curso-a/1').set(bearer(TOKENS.free)).expect(500);
    assert.equal(accesible.body.error, 'error_interno');
  });
});

describe('Retos V2', () => {
  test('resumen y sesión usan solo preguntas aprobadas y accesibles', async () => {
    const resumen = await request(env.app).get('/retos/resumen').set(bearer(TOKENS.free)).expect(200);
    assert.equal(resumen.body.disponibilidad.preguntas, 3);
    assert.deepEqual(resumen.body.disponibilidad.areas, [{ area: 'Endodoncia', total: 3 }]);
    assert.equal(resumen.body.recomendacion.area, 'Endodoncia');
    assert.equal(resumen.body.estado.xp, 0);

    const sesion = await request(env.app).post('/retos/sesion').set(bearer(TOKENS.free))
      .send({ modo: 'practica', area: 'Todas', limite: 3 }).expect(200);
    assert.equal(sesion.body.total, 3);
    assert.equal(JSON.stringify(sesion.body).includes('correcta'), false);
    assert.equal(JSON.stringify(sesion.body).includes('explicacion'), false);
    assert.deepEqual(Object.keys(sesion.body.preguntas[0]).sort(), ['area', 'clase', 'curso', 'cursoId', 'id', 'indice', 'instruccion', 'n', 'opciones', 'q', 'ref', 'tipo']);

    await request(env.app).post('/retos/sesion').set(bearer(TOKENS.free))
      .send({ modo: 'practica', area: 'Todas', limite: 4 }).expect(400);
  });

  test('miembro gratis no recibe preguntas de clases VIP', async () => {
    env.db.docs.set('v2_quizzes/curso-a_2', {
      cursoId: 'curso-a', n: 2, estado: 'aprobado',
      preguntas: [{ q: 'Pregunta VIP', opciones: ['A', 'B'], correcta: 1, explicacion: 'Solo VIP' }],
    });
    const gratis = await request(env.app).get('/retos/resumen').set(bearer(TOKENS.free)).expect(200);
    assert.equal(gratis.body.disponibilidad.preguntas, 3);
    const vip = await request(env.app).get('/retos/resumen').set(bearer(TOKENS.vip)).expect(200);
    assert.equal(vip.body.disponibilidad.preguntas, 4);
  });

  test('Retos sirve y califica interacciones avanzadas sin revelar soluciones antes de responder', async () => {
    env.db.docs.set('v2_quizzes/curso-a_1', {
      cursoId: 'curso-a', n: 1, estado: 'aprobado',
      preguntas: [
        { id: 'multi', tipo: 'seleccion_multiple', compatibleRetos: true, q: 'Selecciona dos', instruccion: 'Elige dos opciones', opciones: ['A', 'B', 'C'], correctas: [0, 2], explicacion: 'A y C forman el conjunto correcto.' },
        { id: 'orden', tipo: 'ordenar', compatibleRetos: true, q: 'Ordena la secuencia', elementos: [{ id: 'a', texto: 'Primero' }, { id: 'b', texto: 'Después' }, { id: 'c', texto: 'Al final' }], ordenCorrecto: ['a', 'b', 'c'], explicacion: 'La secuencia respeta el flujo enseñado.' },
        { id: 'fuera', tipo: 'seleccion', compatibleRetos: false, q: 'No usar', opciones: ['A', 'B'], correcta: 0, explicacion: 'Privada para la clase.' },
      ],
    });

    const sesion = await request(env.app).post('/retos/sesion').set(bearer(TOKENS.free))
      .send({ modo: 'practica', area: 'Todas', limite: 3 }).expect(200);
    assert.equal(sesion.body.total, 2);
    assert.deepEqual(sesion.body.preguntas.map((p) => p.tipo).sort(), ['ordenar', 'seleccion_multiple']);
    assert.equal(JSON.stringify(sesion.body).includes('correctas'), false);
    assert.equal(JSON.stringify(sesion.body).includes('ordenCorrecto'), false);

    const multi = await request(env.app).post('/retos/responder').set(bearer(TOKENS.free))
      .send({ cursoId: 'curso-a', n: 1, indice: 0, respuesta: [0, 2] }).expect(200);
    assert.equal(multi.body.acertada, true);
    assert.equal(multi.body.puntos, 1);
    assert.deepEqual(multi.body.respuestaCorrecta, [0, 2]);

    const parcial = await request(env.app).post('/retos/responder').set(bearer(TOKENS.free))
      .send({ cursoId: 'curso-a', n: 1, indice: 1, respuesta: ['b', 'c', 'a'] }).expect(200);
    assert.equal(parcial.body.acertada, false);
    assert.equal(parcial.body.puntos, 0.5);
    assert.deepEqual(parcial.body.respuestaCorrecta, ['a', 'b', 'c']);

    await request(env.app).post('/retos/responder').set(bearer(TOKENS.free))
      .send({ cursoId: 'curso-a', n: 1, indice: 2, respuesta: 0 }).expect(404);
  });

  test('califica en servidor, acumula dominio y evita repetir XP el mismo día', async () => {
    const primera = await request(env.app).post('/retos/responder').set(bearer(TOKENS.free))
      .send({ cursoId: 'curso-a', n: 1, indice: 0, opcion: 0 }).expect(200);
    assert.equal(primera.body.acertada, true);
    assert.equal(primera.body.correcta, 0);
    assert.equal(primera.body.explicacion, 'Explicación de P1');
    assert.equal(primera.body.xpGanado, 10);
    assert.equal(primera.body.estado.racha, 1);
    assert.deepEqual(primera.body.estado.dominio[0], {
      area: 'Endodoncia', aciertos: 1, total: 1, precision: 100, estado: 'Por explorar', ultima: AHORA_ISO,
    });

    const repetida = await request(env.app).post('/retos/responder').set(bearer(TOKENS.free))
      .send({ cursoId: 'curso-a', n: 1, indice: 0, opcion: 2 }).expect(200);
    assert.equal(repetida.body.acertada, false);
    assert.equal(repetida.body.xpGanado, 0);
    assert.equal(repetida.body.estado.xp, 10);
    assert.equal(repetida.body.estado.quiz.precision, 50);

    const guardado = env.db.leer('v2_retos_estados/free1');
    assert.equal(guardado.uid, 'free1');
    assert.equal(guardado.preguntas['curso-a_1_0'].intentos, 2);
    assert.equal(JSON.stringify(guardado).includes('email'), false);
  });

  test('rechaza referencias y respuestas inválidas', async () => {
    await request(env.app).post('/retos/responder').set(bearer(TOKENS.free))
      .send({ cursoId: 'curso-a', n: 1, indice: 99, opcion: 0 }).expect(404);
    await request(env.app).post('/retos/responder').set(bearer(TOKENS.free))
      .send({ cursoId: 'curso-a', n: 1, indice: 0, opcion: 99 }).expect(400);
    await request(env.app).post('/retos/responder').set(bearer(TOKENS.free))
      .send({ cursoId: 'curso-a', n: 2, indice: 0, opcion: 0 }).expect(403);
  });
});

describe('foro', () => {
  test('listar sin ocultos y sin la lista utilPor', async () => {
    const r = await request(env.app).get('/foro').set(bearer(TOKENS.free)).expect(200);
    assert.deepEqual(r.body.map((x) => x.id), ['hilo1']);
    assert.equal('utilPor' in r.body[0], false);
    await request(env.app).get('/foro/hilo-oculto').set(bearer(TOKENS.vip)).expect(404);
  });

  test('sin filtro lista hasta 300 temas visibles, los más recientes primero (los ocultos no restan)', async () => {
    for (let i = 320; i < 325; i++) {
      const fecha = new Date(Date.parse('2026-01-01T00:00:00.000Z') + i * 60_000).toISOString();
      env.db.docs.set(`v2_foro/t${i}`, { id: `t${i}`, titulo: `Oculto ${i}`, texto: 'x', autorUid: 'vip2', autor: 'Dr. Beto VIP', cursoId: null, fecha, util: 0, utilPor: [], oculto: true });
    }
    for (let i = 0; i < 320; i++) {
      const fecha = new Date(Date.parse('2026-01-01T00:00:00.000Z') + i * 60_000).toISOString();
      env.db.docs.set(`v2_foro/t${i}`, { id: `t${i}`, titulo: `Tema ${i}`, texto: 'x', autorUid: 'vip2', autor: 'Dr. Beto VIP', cursoId: null, fecha, util: 0, utilPor: [], oculto: false });
    }
    const r = await request(env.app).get('/foro').set(bearer(TOKENS.vip)).expect(200);
    assert.equal(r.body.length, 300);
    assert.equal(r.body[0].id, 'hilo1');
    assert.equal(r.body[1].id, 't319');
    assert.equal(r.body.at(-1).id, 't21');
  });

  test('un tema oculto no expone sus respuestas', async () => {
    env.db.docs.set('v2_foro/hilo-oculto/respuestas/r1', { id: 'r1', autorUid: 'x', autor: 'x', texto: 'Respuesta oculta', fecha: AHORA_ISO, oculto: false });
    const r = await request(env.app).get('/foro/hilo-oculto').set(bearer(TOKENS.vip)).expect(404);
    assert.equal(JSON.stringify(r.body).includes('Respuesta oculta'), false);
  });

  test('publicar exige VIP, rechaza HTML y textos largos', async () => {
    await request(env.app).post('/foro').set(bearer(TOKENS.free)).send({ titulo: 'Hola a todos', texto: 'Mi pregunta' }).expect(403);
    const html = await request(env.app).post('/foro').set(bearer(TOKENS.vip)).send({ titulo: 'Hola', texto: '<script>alert(1)</script>' }).expect(400);
    assert.equal(html.body.error, 'html_no_permitido');
    const largo = await request(env.app).post('/foro').set(bearer(TOKENS.vip)).send({ titulo: 'x'.repeat(141), texto: 'ok ok' }).expect(400);
    assert.equal(largo.body.error, 'texto_muy_largo');
    const ok = await request(env.app).post('/foro').set(bearer(TOKENS.vip)).send({ titulo: 'Caso clínico', texto: 'Línea 1\nLínea 2', cursoId: 'curso-a' }).expect(201);
    assert.equal(ok.body.autor, 'Dra. Ana VIP');
    assert.equal(ok.body.autorUid, 'vip1');
    assert.equal(ok.body.texto, 'Línea 1\nLínea 2');
    assert.equal(ok.body.util, 0);
    const filtrado = await request(env.app).get('/foro?cursoId=curso-a').set(bearer(TOKENS.vip)).expect(200);
    assert.deepEqual(filtrado.body.map((x) => x.id), [ok.body.id]);
  });

  test('responder y leer un hilo', async () => {
    const r = await request(env.app).post('/foro/hilo1/respuestas').set(bearer(TOKENS.vip)).send({ texto: 'Te respondo' }).expect(201);
    assert.equal(r.body.texto, 'Te respondo');
    const hilo = await request(env.app).get('/foro/hilo1').set(bearer(TOKENS.free)).expect(200);
    assert.equal(hilo.body.respuestas.length, 1);
    assert.equal(hilo.body.hilo.respuestas, 1);
    await request(env.app).post('/foro/hilo1/respuestas').set(bearer(TOKENS.vip)).send({ texto: 'x'.repeat(3001) }).expect(400);
  });

  test('útil: una sola vez por usuario', async () => {
    const r1 = await request(env.app).post('/foro/hilo1/util').set(bearer(TOKENS.vip)).expect(200);
    assert.deepEqual(r1.body, { util: 1 });
    const r2 = await request(env.app).post('/foro/hilo1/util').set(bearer(TOKENS.vip)).expect(409);
    assert.equal(r2.body.error, 'ya_marcado_util');
    assert.equal(r2.body.util, 1);
    const r3 = await request(env.app).post('/foro/hilo1/util').set(bearer(TOKENS.vip2)).expect(200);
    assert.deepEqual(r3.body, { util: 2 });
    assert.equal(env.db.leer('v2_foro/hilo1').util, 2);
    const lista = await request(env.app).get('/foro').set(bearer(TOKENS.vip)).expect(200);
    assert.equal(lista.body[0].marcadoUtil, true);
  });
});

describe('eventos', () => {
  test('reserva alterna y exige VIP', async () => {
    await request(env.app).post('/eventos/ev1/reserva').set(bearer(TOKENS.free)).expect(403);
    const r1 = await request(env.app).post('/eventos/ev1/reserva').set(bearer(TOKENS.vip)).expect(200);
    assert.deepEqual(r1.body, { reservado: true });
    assert.deepEqual(env.db.leer('v2_eventos/ev1').reservas, ['otro-uid', 'vip1']);
    const r2 = await request(env.app).post('/eventos/ev1/reserva').set(bearer(TOKENS.vip)).expect(200);
    assert.deepEqual(r2.body, { reservado: false });
    await request(env.app).post('/eventos/ev-oculto/reserva').set(bearer(TOKENS.vip)).expect(404);
    env.reloj.ahora = new Date('2026-10-02T00:00:00Z');
    const tarde = await request(env.app).post('/eventos/ev1/reserva').set(bearer(TOKENS.vip)).expect(409);
    assert.equal(tarde.body.error, 'evento_terminado');
  });
});
