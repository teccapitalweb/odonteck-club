import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, test } from 'node:test';
import request from 'supertest';
import { TOKENS, bearer, crearEntorno, semillaBase } from './fakes/app.js';
import { cargadorAcademiaDisco, estadoEfectivo, metricasModulo, moduloPublico } from '../src/lib/academia.js';

// Contenido en memoria: un programa de 3 módulos con bancos de examen pequeños (nunca los archivos reales).
const pregunta = (id, correcta) => ({ id, q: `Pregunta ${id}`, opciones: ['A', 'B', 'C', 'D'], correcta, explicacion: `Porque ${id}` });
function modulo(n, estado = 'aprobado') {
  return {
    programa: 'prog', modulo: n, titulo: `Módulo ${n}`, estado,
    temas: [{ n: `${n}.1`, titulo: 'Tema', bloques: [{ tipo: 'texto', md: 'Uno dos tres cuatro.' }, { tipo: 'figura', id: `prog/m0${n}/01` }], verificacion: [] }],
    examen: { aprobar: 70, mostrar: 4, preguntas: [0, 1, 2, 3, 4, 5].map((i) => pregunta(`m${n}-p${i}`, i % 4)) },
  };
}
function academia({ estado2 = 'aprobado', estado3 = 'aprobado' } = {}) {
  const mods = { 1: modulo(1), 2: modulo(2, estado2), 3: modulo(3, estado3) };
  return {
    catalogo: () => ({ programas: [{ id: 'prog', numero: 1, titulo: 'Programa de prueba', area: 'Endodoncia', modulos: [1, 2, 3].map((n) => ({ n, titulo: `Módulo ${n}` })) }] }),
    modulo: (p, n) => (p === 'prog' ? mods[n] ?? null : null),
  };
}
const pedir = (app, metodo, ruta, token = TOKENS.vip) => request(app)[metodo](ruta).set(bearer(token));

async function rendir(app, n, { acertar = true, token = TOKENS.vip } = {}) {
  const ex = await pedir(app, 'get', `/academia/prog/${n}/examen`, token).expect(200);
  const respuestas = Object.fromEntries(ex.body.preguntas.map((q) => {
    const i = Number(q.id.split('-p')[1]);
    return [q.id, acertar ? i % 4 : (i + 1) % 4];
  }));
  const res = await pedir(app, 'post', `/academia/prog/${n}/examen`, token).send({ respuestas });
  assert.equal(res.status, 200, JSON.stringify(res.body));
  return res;
}

describe('academia · miembro', () => {
  test('requiere sesión', async () => {
    const { app } = crearEntorno({ academia: academia() });
    await request(app).get('/academia').expect(401);
    await request(app).get('/academia/prog/1').expect(401);
    await request(app).post('/academia/prog/1/examen').send({ respuestas: {} }).expect(401);
  });

  test('el catálogo marca disponibilidad y no expone exámenes', async () => {
    const { app } = crearEntorno({ academia: academia({ estado2: 'borrador' }) });
    const res = await pedir(app, 'get', '/academia').expect(200);
    const mods = res.body.programas[0].modulos;
    assert.deepEqual(mods.map((m) => m.disponible), [true, false, true]);
    assert.deepEqual(res.body.certificados, {});
    assert.equal(JSON.stringify(res.body).includes('correcta'), false);
  });

  test('el módulo se entrega sin preguntas ni respuestas del examen', async () => {
    const { app } = crearEntorno({ academia: academia() });
    const res = await pedir(app, 'get', '/academia/prog/1', TOKENS.free).expect(200);
    assert.equal(res.body.examen.total, 6);
    assert.equal(res.body.examen.preguntas, undefined);
    assert.equal(JSON.stringify(res.body).includes('m1-p0'), false);
  });

  test('módulo 1 gratis; módulos siguientes requieren VIP', async () => {
    const { app } = crearEntorno({ academia: academia() });
    await pedir(app, 'get', '/academia/prog/1', TOKENS.free).expect(200);
    const r = await pedir(app, 'get', '/academia/prog/2', TOKENS.free).expect(402);
    assert.equal(r.body.error, 'requiere_vip');
    await pedir(app, 'get', '/academia/prog/2/examen', TOKENS.free).expect(402);
  });

  test('un módulo se desbloquea solo al aprobar el examen del anterior', async () => {
    const { app, reloj } = crearEntorno({ academia: academia() });
    const bloqueado = await pedir(app, 'get', '/academia/prog/2').expect(403);
    assert.equal(bloqueado.body.error, 'modulo_bloqueado');
    const reprobado = await rendir(app, 1, { acertar: false });
    assert.equal(reprobado.body.aprobado, false);
    await pedir(app, 'get', '/academia/prog/2').expect(403);
    reloj.ahora = new Date(reloj.ahora.getTime() + 4 * 60 * 1000);
    const ok = await rendir(app, 1);
    assert.equal(ok.body.aprobado, true);
    assert.equal(ok.body.porcentaje, 100);
    assert.equal(ok.body.siguiente, 2);
    assert.equal(ok.body.programaCompleto, false);
    assert.equal(ok.body.certificado, undefined);
    assert.equal(ok.body.detalle.length, 4);
    assert.ok(ok.body.detalle.every((d) => typeof d.explicacion === 'string'));
    await pedir(app, 'get', '/academia/prog/2').expect(200);
    const prog = await pedir(app, 'get', '/academia/progreso').expect(200);
    assert.equal(prog.body.prog.modulos['1'].aprobado, true);
    assert.equal(prog.body.prog.modulos['1'].intentos, 2);
  });

  test('admin salta VIP y desbloqueo', async () => {
    const { app } = crearEntorno({ academia: academia() });
    await pedir(app, 'get', '/academia/prog/3', TOKENS.admin).expect(200);
  });

  test('el examen emitido solo se califica una vez y con sus propias preguntas', async () => {
    const { app } = crearEntorno({ academia: academia() });
    await pedir(app, 'post', '/academia/prog/1/examen').send({ respuestas: {} }).expect(409);
    const ex = await pedir(app, 'get', '/academia/prog/1/examen').expect(200);
    assert.equal(ex.body.preguntas.length, 4);
    assert.equal(ex.body.aprobar, 70);
    assert.ok(ex.body.preguntas.every((q) => q.correcta === undefined && q.explicacion === undefined));
    await pedir(app, 'post', '/academia/prog/1/examen').send({ respuestas: [1, 2] }).expect(400);
    await pedir(app, 'post', '/academia/prog/1/examen').send({ respuestas: { otra: 1 } }).expect(200);
    const r = await pedir(app, 'post', '/academia/prog/1/examen').send({ respuestas: {} }).expect(409);
    assert.equal(r.body.error, 'examen_no_emitido');
  });

  test('si el banco cambia entre emitir y calificar responde examen_desactualizado', async () => {
    const contenido = academia();
    const { app } = crearEntorno({ academia: contenido });
    await pedir(app, 'get', '/academia/prog/1/examen').expect(200);
    contenido.modulo('prog', 1).examen.preguntas = [pregunta('nueva-p0', 0)];
    const r = await pedir(app, 'post', '/academia/prog/1/examen').send({ respuestas: {} }).expect(409);
    assert.equal(r.body.error, 'examen_desactualizado');
  });

  test('tras reprobar hay que esperar antes de pedir otro examen', async () => {
    const { app, reloj } = crearEntorno({ academia: academia() });
    await rendir(app, 1, { acertar: false });
    const r = await pedir(app, 'get', '/academia/prog/1/examen').expect(429);
    assert.equal(r.body.error, 'espera_examen');
    reloj.ahora = new Date(reloj.ahora.getTime() + 4 * 60 * 1000);
    await pedir(app, 'get', '/academia/prog/1/examen').expect(200);
  });

  test('reprobar después de aprobar no quita la aprobación ni baja la mejor marca', async () => {
    const { app } = crearEntorno({ academia: academia() });
    await rendir(app, 1);
    const r = await rendir(app, 1, { acertar: false });
    assert.equal(r.body.aprobado, false);
    assert.equal(r.body.mejor, 100);
    await pedir(app, 'get', '/academia/prog/2').expect(200);
  });

  test('los borradores solo los ve admin, salvo con la bandera de configuración', async () => {
    const contenido = academia({ estado2: 'borrador' });
    const { app } = crearEntorno({ academia: contenido });
    await rendir(app, 1);
    const r = await pedir(app, 'get', '/academia/prog/2').expect(404);
    assert.equal(r.body.error, 'modulo_en_preparacion');
    await pedir(app, 'get', '/academia/prog/2', TOKENS.admin).expect(200);
    const conBandera = crearEntorno({ academia: contenido, academiaBorradores: true });
    await rendir(conBandera.app, 1);
    await pedir(conBandera.app, 'get', '/academia/prog/2').expect(200);
  });

  test('registrar un tema leído valida que pertenezca al módulo', async () => {
    const { app } = crearEntorno({ academia: academia() });
    await pedir(app, 'post', '/academia/prog/1/tema').send({ tema: '1.1' }).expect(200);
    await pedir(app, 'post', '/academia/prog/1/tema').send({ tema: '9.9' }).expect(400);
    await pedir(app, 'post', '/academia/prog/1/tema').send({ tema: 11 }).expect(400);
    const prog = await pedir(app, 'get', '/academia/progreso').expect(200);
    assert.ok(prog.body.prog.modulos['1'].temas['1.1']);
  });

  test('programa o módulo inexistente responde 404', async () => {
    const { app } = crearEntorno({ academia: academia() });
    await pedir(app, 'get', '/academia/nada/1').expect(404);
    await pedir(app, 'get', '/academia/prog/9').expect(404);
    await pedir(app, 'get', '/academia/prog/abc').expect(404);
  });
});

describe('academia · certificado del programa', () => {
  test('se emite al aprobar todos los módulos, es idempotente y verificable', async () => {
    const semilla = {
      ...semillaBase(),
      // El contador es compartido con los certificados de curso y hay un folio ocupado a mano.
      'v2_contadores/certificados-2026': { ultimo: 4 },
      'v2_certificados/ODT-2026-00005': { folio: 'ODT-2026-00005', uid: 'otro', nombre: 'Otro', cursoTitulo: 'Curso', emitido: '2026-01-01T00:00:00.000Z' },
    };
    const { app, db } = crearEntorno({ semilla, academia: academia() });
    await rendir(app, 1);
    await rendir(app, 2);
    const fin = await rendir(app, 3);
    assert.equal(fin.body.programaCompleto, true);
    assert.equal(fin.body.siguiente, null);
    const cert = fin.body.certificado;
    assert.equal(cert.folio, 'ODT-2026-00006');
    assert.equal(cert.tipo, 'academia');
    assert.equal(cert.nuevo, true);
    assert.equal(cert.programaId, 'prog');
    assert.equal(cert.programaTitulo, 'Programa de prueba');
    assert.equal(cert.nombre, 'Dra. Ana VIP');
    assert.equal(cert.uid, undefined);
    assert.equal(db.docs.get('v2_contadores/certificados-2026').ultimo, 6);
    assert.equal(db.docs.get('v2_academia_certificados/ODT-2026-00006').uid, 'vip1');

    // Repetir un examen no emite otro certificado ni mueve el contador.
    const otra = await rendir(app, 2);
    assert.equal(otra.body.certificado.folio, 'ODT-2026-00006');
    assert.equal(otra.body.certificado.nuevo, false);
    assert.equal(db.docs.get('v2_contadores/certificados-2026').ultimo, 6);
    assert.equal([...db.docs.keys()].filter((k) => k.startsWith('v2_academia_certificados/')).length, 1);

    const catalogo = await pedir(app, 'get', '/academia').expect(200);
    assert.equal(catalogo.body.certificados.prog.folio, 'ODT-2026-00006');
    assert.equal(catalogo.body.progreso.prog.certificado, 'ODT-2026-00006');

    const ver = await request(app).get('/verificar/odt-2026-00006').expect(200);
    assert.deepEqual(ver.body, {
      valido: true, folio: 'ODT-2026-00006', tipo: 'academia', nombre: 'Dra. Ana VIP',
      cursoTitulo: 'Programa de prueba', programaTitulo: 'Programa de prueba', emitido: cert.emitido,
    });
    // Los certificados de curso siguen verificándose igual.
    const curso = await request(app).get('/verificar/ODT-2026-00005').expect(200);
    assert.equal(curso.body.tipo, undefined);
    assert.equal(curso.body.cursoTitulo, 'Curso');
  });

  test('reprobar el último módulo no emite certificado', async () => {
    const { app, db } = crearEntorno({ academia: academia() });
    await rendir(app, 1);
    await rendir(app, 2);
    const r = await rendir(app, 3, { acertar: false });
    assert.equal(r.body.programaCompleto, false);
    assert.equal(r.body.certificado, undefined);
    assert.equal([...db.docs.keys()].some((k) => k.startsWith('v2_academia_certificados/')), false);
  });
});

describe('academia · revisión administrativa', () => {
  test('GET /admin/academia lista estados y métricas; solo admin', async () => {
    const { app } = crearEntorno({ academia: academia({ estado2: 'borrador' }) });
    await pedir(app, 'get', '/admin/academia', TOKENS.vip).expect(403);
    const res = await pedir(app, 'get', '/admin/academia', TOKENS.admin).expect(200);
    const fila = res.body.programas[0].modulos[1];
    assert.equal(fila.estadoJson, 'borrador');
    assert.equal(fila.estado, 'borrador');
    assert.equal(fila.existe, true);
    assert.equal(fila.palabras, 4);
    assert.equal(fila.figuras, 1);
    assert.equal(fila.preguntas, 6);
    assert.equal(JSON.stringify(res.body).includes('correcta'), false);
  });

  test('aprobar desde el admin publica un borrador para miembros', async () => {
    const { app, db } = crearEntorno({ academia: academia({ estado2: 'borrador' }) });
    await rendir(app, 1);
    await pedir(app, 'get', '/academia/prog/2').expect(404);
    await pedir(app, 'patch', '/admin/academia/prog/2', TOKENS.vip).send({ estado: 'aprobado' }).expect(403);
    const r = await pedir(app, 'patch', '/admin/academia/prog/2', TOKENS.admin).send({ estado: 'aprobado', nota: 'Revisado por la Dra. X' }).expect(200);
    assert.equal(r.body.estado, 'aprobado');
    assert.equal(r.body.estadoJson, 'borrador');
    assert.equal(r.body.revision.revisor, 'adm1');
    assert.equal(db.docs.get('v2_academia_revisiones/prog_2').nota, 'Revisado por la Dra. X');
    const mod = await pedir(app, 'get', '/academia/prog/2').expect(200);
    assert.equal(mod.body.estado, 'aprobado');
    const cat = await pedir(app, 'get', '/academia').expect(200);
    assert.equal(cat.body.programas[0].modulos[1].disponible, true);
  });

  test('devolver a borrador oculta un módulo aprobado en el JSON', async () => {
    const { app } = crearEntorno({ academia: academia() });
    await pedir(app, 'patch', '/admin/academia/prog/3', TOKENS.admin).send({ estado: 'borrador', nota: 'Corregir la tabla 3.2' }).expect(200);
    const cat = await pedir(app, 'get', '/academia').expect(200);
    assert.deepEqual(cat.body.programas[0].modulos.map((m) => m.disponible), [true, true, false]);
    await pedir(app, 'get', '/academia/prog/3', TOKENS.admin).expect(200);
    await rendir(app, 1);
    await rendir(app, 2);
    const oculto = await pedir(app, 'get', '/academia/prog/3').expect(404);
    assert.equal(oculto.body.error, 'modulo_en_preparacion');
  });

  test('PATCH valida estado, nota y existencia', async () => {
    const vacio = { ...academia(), modulo: (p, n) => (n === 3 ? null : academia().modulo(p, n)) };
    const { app } = crearEntorno({ academia: vacio });
    await pedir(app, 'patch', '/admin/academia/prog/2', TOKENS.admin).send({ estado: 'publicado' }).expect(400);
    await pedir(app, 'patch', '/admin/academia/prog/2', TOKENS.admin).send({}).expect(400);
    await pedir(app, 'patch', '/admin/academia/prog/2', TOKENS.admin).send({ estado: 'revision', nota: '<b>x</b>' }).expect(400);
    await pedir(app, 'patch', '/admin/academia/nada/1', TOKENS.admin).send({ estado: 'aprobado' }).expect(404);
    const sin = await pedir(app, 'patch', '/admin/academia/prog/3', TOKENS.admin).send({ estado: 'aprobado' }).expect(409);
    assert.equal(sin.body.error, 'modulo_sin_contenido');
  });
});

describe('academia · contenido', () => {
  test('el estado efectivo prefiere la revisión y el público no lleva el banco', () => {
    assert.equal(estadoEfectivo(null, { estado: 'aprobado' }), null);
    assert.equal(estadoEfectivo({ estado: 'borrador' }, { estado: 'aprobado' }), 'aprobado');
    assert.equal(estadoEfectivo({ estado: 'aprobado' }, { estado: 'otro' }), 'aprobado');
    assert.equal(estadoEfectivo({ estado: 'raro' }, null), 'borrador');
    const pub = moduloPublico(modulo(1), 'aprobado');
    assert.equal(pub.examen.preguntas, undefined);
    assert.equal(pub.examen.total, 6);
    assert.equal(metricasModulo(modulo(1)).temas, 1);
  });

  test('el cargador de disco ignora carpetas con "_" e ids inválidos', () => {
    const dir = mkdtempSync(join(tmpdir(), 'academia-'));
    try {
      writeFileSync(join(dir, 'catalogo.json'), JSON.stringify({ programas: [
        { id: 'endo', titulo: 'Endo', modulos: [{ n: 1, titulo: 'Uno' }] },
        { id: '_muestra', titulo: 'Muestra', modulos: [{ n: 1, titulo: 'Uno' }] },
      ] }));
      mkdirSync(join(dir, 'endo'));
      mkdirSync(join(dir, '_muestra'));
      writeFileSync(join(dir, 'endo', 'modulo-01.json'), JSON.stringify(modulo(1)));
      writeFileSync(join(dir, '_muestra', 'modulo-01.json'), JSON.stringify(modulo(1)));
      const c = cargadorAcademiaDisco(pathToFileURL(`${dir}/`));
      assert.deepEqual(c.catalogo().programas.map((p) => p.id), ['endo']);
      assert.equal(c.modulo('endo', 1).titulo, 'Módulo 1');
      assert.equal(c.modulo('_muestra', 1), null);
      assert.equal(c.modulo('../endo', 1), null);
      assert.equal(c.modulo('endo', 2), null);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
