import assert from 'node:assert/strict';
import { beforeEach, describe, test } from 'node:test';
import request from 'supertest';
import { TOKENS, bearer, crearEntorno } from './fakes/app.js';

let env;
const admin = (metodo, ruta) => request(env.app)[metodo](ruta).set(bearer(TOKENS.admin));
const curso = (id, orden, publicado = true) => ({ id, titulo: id, area: 'x', nivel: 'Básico', orden, publicado, clases: [{ n: 1, titulo: 'C1', videoId: 'v', gratis: true }] });

beforeEach(() => {
  env = crearEntorno();
  env.db.docs.set('v2_cursos/c1', curso('c1', 1));
  env.db.docs.set('v2_cursos/c2', curso('c2', 2));
  env.db.docs.set('v2_cursos/c3', curso('c3', 3, false));
});

const auditorias = () => [...env.db.docs.keys()].filter((k) => k.startsWith('v2_admin_auditoria/')).map((k) => env.db.leer(k));

describe('cursos: reordenamiento atómico', () => {
  test('reordena en un solo evento de bitácora', async () => {
    const r = await admin('post', '/admin/cursos/reordenar').send({ ids: ['curso-b', 'c3', 'c1', 'c2'] }).expect(200);
    assert.equal(r.body.total, 4);
    assert.equal(env.db.leer('v2_cursos/curso-b').orden, 1);
    assert.equal(env.db.leer('v2_cursos/c3').orden, 2);
    assert.equal(env.db.leer('v2_cursos/c1').orden, 3);
    assert.equal(env.db.leer('v2_cursos/c2').orden, 4);
    assert.equal(auditorias().filter((e) => e.accion === 'reordenar_cursos').length, 1);
  });

  test('si falta un curso, no cambia nada (404)', async () => {
    await admin('post', '/admin/cursos/reordenar').send({ ids: ['c1', 'noexiste'] }).expect(404);
    assert.equal(env.db.leer('v2_cursos/c1').orden, 1); // intacto
  });

  test('rechaza lista vacía, ids repetidos o exceso', async () => {
    await admin('post', '/admin/cursos/reordenar').send({ ids: [] }).expect(400);
    await admin('post', '/admin/cursos/reordenar').send({ ids: ['c1', 'c1'] }).expect(400);
  });
});

describe('cursos: acciones masivas atómicas', () => {
  test('publicar/ocultar en un solo evento', async () => {
    const r = await admin('post', '/admin/cursos/lote').send({ ids: ['c1', 'c2', 'c3'], accion: 'ocultar' }).expect(200);
    assert.deepEqual(r.body.afectados, ['c1', 'c2', 'c3']);
    assert.equal(env.db.leer('v2_cursos/c1').publicado, false);
    assert.equal(env.db.leer('v2_cursos/c3').publicado, false);
    assert.equal(auditorias().filter((e) => e.accion === 'lote_ocultar').length, 1);
  });

  test('borrar omite los cursos con progreso y borra el resto, un solo evento', async () => {
    env.db.docs.set('v2_progreso/p1', { uid: 'u1', cursoId: 'c2', vistas: [1] });
    const r = await admin('post', '/admin/cursos/lote').send({ ids: ['c1', 'c2', 'c3'], accion: 'borrar' }).expect(200);
    assert.deepEqual(r.body.afectados.sort(), ['c1', 'c3']);
    assert.deepEqual(r.body.omitidos, [{ id: 'c2', motivo: 'curso_con_progreso' }]);
    assert.equal(env.db.leer('v2_cursos/c1'), undefined);
    assert.ok(env.db.leer('v2_cursos/c2')); // con progreso, se conserva
    assert.equal(env.db.leer('v2_cursos/c3'), undefined);
    assert.equal(auditorias().filter((e) => e.accion === 'lote_borrar').length, 1);
  });

  test('ids inexistentes se reportan como omitidos', async () => {
    const r = await admin('post', '/admin/cursos/lote').send({ ids: ['c1', 'fantasma'], accion: 'publicar' }).expect(200);
    assert.deepEqual(r.body.afectados, ['c1']);
    assert.deepEqual(r.body.omitidos, [{ id: 'fantasma', motivo: 'no_existe' }]);
  });

  test('acción inválida 400 y exige admin', async () => {
    await admin('post', '/admin/cursos/lote').send({ ids: ['c1'], accion: 'raro' }).expect(400);
    await request(env.app).post('/admin/cursos/lote').set(bearer(TOKENS.vip)).send({ ids: ['c1'], accion: 'publicar' }).expect(403);
  });
});
