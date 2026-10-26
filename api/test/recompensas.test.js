import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { crearEntorno, TOKENS, bearer, AHORA_ISO } from './fakes/app.js';
import { RECOMPENSAS, CATALOGO_COL } from '../src/lib/recompensas-catalogo.js';
import { archivoRecompensa } from '../src/lib/recompensas-archivos.js';
import { normalizarEstadoRecompensas } from '../src/lib/recompensas.js';

let env;
const estado = (uid) => env.db.leer(`v2_recompensas_estado/${uid}`);
const rec = (id) => RECOMPENSAS.find((r) => r.id === id);
const canjear = (id, token = TOKENS.free, precio = rec(id)?.puntos) =>
  request(env.app)
    .post('/recompensas/canjear')
    .set(bearer(token))
    .send({ recompensaId: id, precioEsperado: precio });
const config = (id, body, token = TOKENS.admin) =>
  request(env.app)
    .patch(`/admin/recompensas/${id}`)
    .set(bearer(token))
    .send(body);
const resolver = (id, estatus, token = TOKENS.admin) =>
  request(env.app)
    .post(`/admin/recompensas/canjes/${id}/resolver`)
    .set(bearer(token))
    .send({ estatus, nota: 'Seguimiento de prueba.' });
const perfil = (body = {}) =>
  request(env.app)
    .put('/directorio/perfil')
    .set(bearer(TOKENS.free))
    .send({
      titular: 'Perfil de prueba',
      etapa: 'general',
      especialidades: [],
      ciudad: 'Puebla',
      estado: 'Puebla',
      modalidades: ['presencial'],
      disponibilidad: [],
      habilidades: [],
      bio: 'Perfil profesional temporal para una prueba de integración.',
      visible: true,
      contacto: { canal: 'correo' },
      ...body,
    });
const aplicar = (recompensaId, ranura = 'marco') =>
  request(env.app)
    .post('/recompensas/personalizacion')
    .set(bearer(TOKENS.free))
    .send({ recompensaId, ranura });
function saldo(uid, importe = 10000) {
  env.db.docs.set(`v2_recompensas_estado/${uid}`, {
    uid,
    saldo: importe,
    ganados: importe,
    gastados: 0,
    contadores: {},
    logros: {},
    desbloqueos: { materiales: [] },
    notificaciones: [],
    actualizado: AHORA_ISO,
  });
}
beforeEach(() => {
  env = crearEntorno();
  for (const uid of ['free1', 'vip1', 'vip2', 'adm1']) saldo(uid);
});

test('120 propuestas, 40 archivos reales y sin contenido clínico nuevo habilitado', () => {
  assert.equal(RECOMPENSAS.length, 120);
  assert.equal(new Set(RECOMPENSAS.map((r) => r.id)).size, 120);
  assert.equal(RECOMPENSAS.filter((r) => r.estado === 'disponible').length, 60);
  const archivos = RECOMPENSAS.filter((r) => r.tipo === 'archivo');
  assert.equal(archivos.length, 40);
  for (const r of archivos) {
    const html = archivoRecompensa(r.id);
    assert.match(html, /<table>/);
    assert.match(html, /contenteditable/);
    assert.match(html, /Guardar copia editada/);
    assert(!html.includes('src="http'));
  }
  assert(
    RECOMPENSAS.filter((r) => r.requiereRevision).every(
      (r) => r.estado === 'proximamente',
    ),
  );
});
test('normaliza el saldo anterior sin perder materiales ni diseños adquiridos', () => {
  const e = normalizarEstadoRecompensas(
    {
      saldo: 120,
      ganados: 350,
      gastados: 230,
      desbloqueos: { materiales: ['guia'], recompensas: ['marco-orbita'] },
      personalizacion: { marco: 'marco-orbita', portada: null },
    },
    'free1',
  );
  assert.equal(e.saldo, 120);
  assert.equal(e.ganados, 350);
  assert.deepEqual(e.desbloqueos.materiales, ['guia']);
  assert.deepEqual(e.desbloqueos.recompensas, ['marco-orbita']);
  assert.equal(e.personalizacion.marco, 'marco-orbita');
});
test('un canje concurrente repetido descuenta una sola vez', async () => {
  const results = await Promise.all([
    canjear('agenda-semanal'),
    canjear('agenda-semanal'),
  ]);
  assert.deepEqual(results.map((r) => r.status).sort(), [201, 409]);
  assert.equal(estado('free1').saldo, 10000 - rec('agenda-semanal').puntos);
  assert.equal(env.db.rutas('v2_recompensas_canjes').length, 1);
  assert.equal(
    env.db
      .rutas('v2_recompensas_movimientos')
      .map((p) => env.db.leer(p))
      .filter((m) => m.tipo === 'canje').length,
    1,
  );
});
test('dos compras concurrentes no pueden consumir el mismo saldo', async () => {
  saldo('free1', 60);
  const results = await Promise.all([
    canjear('marco-orbita'),
    canjear('marco-nacar'),
  ]);
  assert.deepEqual(results.map((r) => r.status).sort(), [201, 409]);
  assert(estado('free1').saldo >= 0);
});
test('no canjea próximas, pausadas ni precios cambiados y mantiene el monedero', async () => {
  await canjear(RECOMPENSAS.find((r) => r.estado === 'proximamente').id).expect(
    409,
  );
  await config('marco-orbita', { puntos: 45 }).expect(200);
  const r = await canjear('marco-orbita').expect(409);
  assert.equal(r.body.error, 'precio_actualizado');
  await config('marco-orbita', { estado: 'pausada' }).expect(200);
  await canjear('marco-orbita', TOKENS.free, 45).expect(409);
  assert.equal(estado('free1').saldo, 10000);
  await config('marco-orbita', { estado: 'disponible' }).expect(200);
  await canjear('marco-orbita', TOKENS.free, 45).expect(201);
  assert.equal(estado('free1').saldo, 9955);
});
test('los archivos requieren canje del propio miembro, incluso para VIP', async () => {
  const path = '/recompensas/agenda-semanal/archivo';
  await request(env.app).get(path).expect(401);
  await request(env.app).get(path).set(bearer(TOKENS.vip)).expect(403);
  await canjear('agenda-semanal').expect(201);
  const file = await request(env.app)
    .get(path)
    .set(bearer(TOKENS.free))
    .expect(200);
  assert.match(file.headers['content-disposition'], /attachment/);
  assert.match(file.headers['cache-control'], /no-store/);
  assert.match(file.text, /Agenda semanal/);
  await request(env.app).get(path).set(bearer(TOKENS.vip)).expect(403);
  await request(env.app)
    .get('/recompensas/marco-orbita/archivo')
    .set(bearer(TOKENS.free))
    .expect(404);
});
test('marcos y portadas se aplican solo tras canje y se preservan al ganar puntos', async () => {
  await aplicar('marco-orbita').expect(409);
  await perfil({ personalizacion: { marco: 'marco-orbita' } }).expect(200);
  assert.equal(
    env.db.leer('v2_directorio_perfiles/free1').personalizacion.marco,
    undefined,
  );
  await aplicar('marco-orbita').expect(403);
  await canjear('marco-orbita').expect(201);
  await aplicar('marco-orbita').expect(200);
  await aplicar('marco-orbita', 'portada').expect(400);
  await request(env.app)
    .get('/recompensas/resumen')
    .set(bearer(TOKENS.free))
    .expect(200);
  assert.equal(estado('free1').personalizacion.marco, 'marco-orbita');
  const listing = await request(env.app)
    .get('/directorio')
    .set(bearer(TOKENS.vip))
    .expect(200);
  assert.equal(
    listing.body.perfiles.find((p) => p.uid === 'free1').personalizacion.marco,
    'marco-orbita',
  );
  await perfil({ personalizacion: { marco: 'marco-prisma' } }).expect(200);
  assert.equal(
    env.db.leer('v2_directorio_perfiles/free1').personalizacion.marco,
    'marco-orbita',
  );
  await aplicar(null).expect(200);
  assert.equal(estado('free1').personalizacion.marco, null);
  assert(estado('free1').desbloqueos.recompensas.includes('marco-orbita'));
});
test('al retirar o reemplazar la portada propia se desactiva el diseño sin perderlo', async () => {
  await perfil().expect(200);
  await canjear('portada-minimal').expect(201);
  await aplicar('portada-minimal', 'portada').expect(200);
  await perfil({ banner: null }).expect(200);
  assert.equal(estado('free1').personalizacion.portada, null);
  await aplicar('portada-minimal', 'portada').expect(200);
  await request(env.app)
    .delete('/directorio/perfil/banner')
    .set(bearer(TOKENS.free))
    .expect(200);
  assert.equal(estado('free1').personalizacion.portada, null);
  assert(estado('free1').desbloqueos.recompensas.includes('portada-minimal'));
});
test('admin protegido y configuración estricta; no altera tipo, entregables ni autorización', async () => {
  await request(env.app).get('/admin/recompensas').expect(401);
  for (const t of [TOKENS.free, TOKENS.vip]) {
    await request(env.app).get('/admin/recompensas').set(bearer(t)).expect(403);
    await config('marco-orbita', { puntos: 1 }, t).expect(403);
  }
  for (const b of [
    { puntos: -1 },
    { puntos: 1.5 },
    { tipo: 'manual' },
    { estado: 'otro' },
    { cupo: 1.2 },
    { revisionProfesional: 'true' },
    { instrucciones: 'x'.repeat(1001) },
  ])
    await config('marco-orbita', b).expect(400);
});
test('beneficios manuales requieren entrega y cupos; clínicos requieren revisión', async () => {
  const r = RECOMPENSAS.find((r) => r.requiereRevision);
  await config(r.id, { estado: 'disponible' }).expect(409);
  await config(r.id, {
    estado: 'disponible',
    cupo: 2,
    plazo: '7 días',
    instrucciones: 'Entrega por equipo autorizado.',
  }).expect(409);
  await config(r.id, {
    estado: 'disponible',
    cupo: 2,
    plazo: '7 días',
    instrucciones: 'Solo administración.',
    revisionProfesional: true,
  }).expect(200);
  const s = await request(env.app)
    .get('/recompensas/resumen')
    .set(bearer(TOKENS.free))
    .expect(200);
  const item = s.body.recompensas.find((x) => x.id === r.id);
  assert(item.disponible);
  assert.equal(item.instrucciones, undefined);
  assert.equal(item.revisionProfesional, undefined);
});
test('último cupo se reserva una sola vez; cancelación concurrente devuelve una vez', async () => {
  const id = RECOMPENSAS.find(
    (r) => r.estado === 'proximamente' && !r.requiereRevision,
  ).id;
  await config(id, {
    estado: 'disponible',
    cupo: 1,
    plazo: '5 días',
    instrucciones: 'Entrega de prueba.',
  }).expect(200);
  const results = await Promise.all([
    canjear(id, TOKENS.free),
    canjear(id, TOKENS.vip),
  ]);
  assert.deepEqual(results.map((r) => r.status).sort(), [201, 409]);
  assert.equal(env.db.leer(`${CATALOGO_COL}/${id}`).cupo, 0);
  await config(id, { plazo: '6 días' }).expect(200);
  const path = env.db.rutas('v2_recompensas_canjes')[0],
    c = env.db.leer(path),
    canjeId = path.split('/')[1];
  await resolver(canjeId, 'cancelado', TOKENS.free).expect(403);
  const refunds = await Promise.all([
    resolver(canjeId, 'cancelado'),
    resolver(canjeId, 'cancelado'),
  ]);
  assert(refunds.every((r) => r.status === 200));
  assert.equal(estado(c.uid).saldo, 10000);
  assert.equal(estado(c.uid).gastados, 0);
  assert.equal(env.db.leer(`${CATALOGO_COL}/${id}`).cupo, 1);
  assert.equal(
    env.db
      .rutas('v2_recompensas_movimientos')
      .map((p) => env.db.leer(p))
      .filter((m) => m.tipo === 'reembolso').length,
    1,
  );
  await resolver(canjeId, 'entregado').expect(409);
  const token = c.uid === 'free1' ? TOKENS.free : TOKENS.vip;
  await canjear(id, token).expect(409);
});
test('entrega confirmada no devuelve saldo y queda en seguimiento del miembro', async () => {
  await canjear('praxia-30-dias').expect(201);
  const path = env.db.rutas('v2_recompensas_canjes')[0],
    id = path.split('/')[1];
  await resolver(id, 'entregado').expect(200);
  await resolver(id, 'entregado').expect(200);
  await resolver(id, 'cancelado').expect(409);
  assert.equal(estado('free1').saldo, 8500);
  const s = await request(env.app)
    .get('/recompensas/resumen')
    .set(bearer(TOKENS.free))
    .expect(200);
  assert.equal(s.body.canjes[0].estatus, 'entregado');
  assert.equal(s.body.canjes[0].nota, 'Seguimiento de prueba.');
});
test('admin crea una propuesta manual, la habilita y queda canjeable con precio del servidor', async () => {
  const create = (body, token = TOKENS.admin) =>
    request(env.app).post('/admin/recompensas').set(bearer(token)).send(body);
  const body = {
    id: 'prueba-nueva',
    titulo: 'Prueba nueva',
    descripcion: 'Beneficio personalizado',
    puntos: 200,
  };
  await create(body, TOKENS.free).expect(403);
  await create({ ...body, tipo: 'archivo' }).expect(400);
  await create(body).expect(201);
  await create(body).expect(409);
  await canjear(body.id, TOKENS.free, 200).expect(409);
  await config(body.id, {
    estado: 'disponible',
    cupo: 3,
    plazo: '2 días',
    instrucciones: 'Equipo de soporte entrega el beneficio.',
  }).expect(200);
  await canjear(body.id, TOKENS.free, 1).expect(409);
  await canjear(body.id, TOKENS.free, 200).expect(201);
  const s = await request(env.app)
    .get('/recompensas/resumen')
    .set(bearer(TOKENS.free))
    .expect(200);
  assert.equal(
    s.body.recompensas.find((r) => r.id === body.id).estatus,
    'pendiente',
  );
  assert.equal(estado('free1').saldo, 9800);
});
