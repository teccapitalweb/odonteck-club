import assert from 'node:assert/strict';
import { beforeEach, describe, test } from 'node:test';
import request from 'supertest';
import { ORIGEN_OK, TOKENS, bearer, crearEntorno } from './fakes/app.js';

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
    assert.deepEqual(res.body.materiales.map((m) => m.id).sort(), ['guia', 'manual-vip']);
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

describe('quizzes', () => {
  test('GET no incluye respuestas ni explicaciones; solo quizzes aprobados', async () => {
    const r = await request(env.app).get('/quiz/curso-a/1').set(bearer(TOKENS.free)).expect(200);
    assert.equal(r.body.preguntas.length, 3);
    for (const p of r.body.preguntas) assert.deepEqual(Object.keys(p).sort(), ['opciones', 'q']);
    assert.equal(JSON.stringify(r.body).includes('correcta'), false);
    const borrador = await request(env.app).get('/quiz/curso-a/2').set(bearer(TOKENS.vip)).expect(404);
    assert.equal(borrador.body.error, 'quiz_no_disponible');
  });

  test('POST califica con umbral de 70%', async () => {
    const reprobado = await request(env.app).post('/quiz/curso-a/1').set(bearer(TOKENS.vip)).send({ respuestas: [0, 1, 0] }).expect(200);
    assert.equal(reprobado.body.correctas, 2);
    assert.equal(reprobado.body.total, 3);
    assert.equal(reprobado.body.aprobado, false, '66% no aprueba');
    assert.deepEqual(reprobado.body.detalle.map((d) => d.correcta), [0, 1, 2]);
    assert.equal(reprobado.body.detalle[2].explicacion, 'Explicación de P3');

    const aprobado = await request(env.app).post('/quiz/curso-a/1').set(bearer(TOKENS.vip)).send({ respuestas: [0, 1, 2] }).expect(200);
    assert.equal(aprobado.body.aprobado, true);
    const intento = env.db.leer('v2_intentos/vip1_curso-a_1');
    assert.equal(intento.correctas, 3);
    assert.equal(intento.aprobado, true);

    await request(env.app).post('/quiz/curso-a/1').set(bearer(TOKENS.vip)).send({ respuestas: [0, 1] }).expect(400);
    await request(env.app).post('/quiz/curso-a/1').set(bearer(TOKENS.vip)).send({ respuestas: ['a', 1, 2] }).expect(400);
  });

  test('quiz de una clase de pago exige VIP', async () => {
    env.db.docs.set('v2_quizzes/curso-a_2', { cursoId: 'curso-a', n: 2, estado: 'aprobado', preguntas: [{ q: 'x', opciones: ['a', 'b'], correcta: 0 }] });
    await request(env.app).get('/quiz/curso-a/2').set(bearer(TOKENS.free)).expect(403);
  });
});

describe('foro', () => {
  test('listar sin ocultos y sin la lista utilPor', async () => {
    const r = await request(env.app).get('/foro').set(bearer(TOKENS.free)).expect(200);
    assert.deepEqual(r.body.map((x) => x.id), ['hilo1']);
    assert.equal('utilPor' in r.body[0], false);
    await request(env.app).get('/foro/hilo-oculto').set(bearer(TOKENS.vip)).expect(404);
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
