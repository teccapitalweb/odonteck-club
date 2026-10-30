import assert from 'node:assert/strict';
import { test } from 'node:test';
import request from 'supertest';
import { crearEntorno, TOKENS, bearer } from './fakes/app.js';

const llamada = (e, metodo, ruta) => request(e.app)[metodo](ruta).set(bearer(TOKENS.admin));

test('admin: resumen, lista y ficha coinciden para suscripciones, regalos, pruebas y alias heredados', async () => {
  const e = crearEntorno();
  e.db.docs.set('v2_suscripciones/free1', { estado: 'active', plan: 'mensual', periodoFin: '2027-01-01T00:00:00Z' });
  e.db.docs.set('v2_cortesias/free1', { hasta: '2026-12-01T00:00:00Z' });
  e.db.docs.set('v2_suscripciones/solo-sus', { estado: 'trialing', plan: 'anual', periodoFin: '2027-01-01T00:00:00Z' });
  e.db.docs.set('miembros/email_legacy', { email: 'legacy@example.com', esRegalo: true, plan: 'anual' });
  e.db.docs.set('miembros/email_legacy_duplicado', { email: 'legacy@example.com', esRegalo: true, plan: 'anual' });
  const lista = (await llamada(e, 'get', '/admin/miembros').expect(200)).body;
  const resumen = (await llamada(e, 'get', '/admin/resumen').expect(200)).body;
  assert.equal(resumen.registrados, lista.length);
  assert.equal(resumen.miembrosActivos, lista.filter((x) => x.esVip).length);
  assert.equal(lista.some((x) => x.uid.startsWith('email_')), false);
  for (const m of lista) {
    const ficha = (await llamada(e, 'get', `/admin/miembros/${m.uid}`).expect(200)).body;
    for (const campo of ['esVip', 'origenAcceso', 'plan', 'vence']) assert.equal(ficha[campo], m[campo], `${m.uid}: ${campo}`);
  }
  assert.equal(resumen.accesos.suscripcion, 1);
  assert.equal(resumen.accesos.prueba, 1);
  assert.equal(resumen.accesos.regalo, 1);
  assert.equal(lista.find((x) => x.uid === 'free1').origenAcceso, 'suscripcion', 'cortesía simultánea no oculta la suscripción');
  assert.equal(resumen.anualActivos, 1, 'ni regalo ni prueba se cuentan como plan anual comercial');
  const filtrada = (await llamada(e, 'get', '/admin/miembros?origen=prueba').expect(200)).body;
  assert.deepEqual(filtrada.map((m) => m.uid), ['solo-sus']);
});

test('admin: cortesía, revocación y reinicio conservan responsable y antes/después; errores no generan historial', async () => {
  const e = crearEntorno();
  await llamada(e, 'post', '/admin/miembros/free1/cortesia').send({ dias: 30, motivo: 'Compensación por incidencia' }).expect(201);
  await llamada(e, 'post', '/admin/miembros/free1/cortesia').send({ dias: 0, motivo: 'Inválido' }).expect(400);
  await llamada(e, 'delete', '/admin/miembros/free1/cortesia').send({ motivoAuditoria: 'Solicitud de cancelación' }).expect(200);
  e.db.docs.set('v2_curso_gratis/free1', { cursoId: 'curso-a' });
  await llamada(e, 'delete', '/admin/miembros/free1/curso-gratis').send({ motivoAuditoria: 'Corrección solicitada' }).expect(200);
  const eventos = (await llamada(e, 'get', '/admin/bitacora').expect(200)).body.eventos;
  assert.equal(eventos.length, 3);
  assert.ok(eventos.every((x) => x.actorUid === 'adm1' && x.motivoManual));
  const baja = eventos.find((x) => x.accion === 'revocar_cortesia');
  assert.ok(baja.antes.hasta);
  assert.equal(baja.despues, null);
  assert.equal(eventos.find((x) => x.accion === 'reiniciar_curso_gratis').antes.cursoId, 'curso-a');
  await request(e.app).get('/admin/bitacora').expect(401);
  await request(e.app).get('/admin/bitacora').set(bearer(TOKENS.free)).expect(403);
  await llamada(e, 'delete', `/admin/bitacora/${baja.id}`).expect(404);
});

test('admin: cupones y contenido se auditan sin copiar secretos ni respuestas', async () => {
  const e = crearEntorno();
  await llamada(e, 'post', '/admin/cupones').send({ codigo: 'SECRETO-1234', dias: 30 }).expect(201);
  await llamada(e, 'patch', '/admin/cupones/SECRETO-1234').send({ estado: 'revocado' }).expect(200);
  await llamada(e, 'patch', '/admin/cursos/curso-a').send({ clases: [{ n: 1, titulo: 'Clase privada', videoId: 'video-super-secreto', gratis: false }] }).expect(200);
  const eventos = (await llamada(e, 'get', '/admin/bitacora').expect(200)).body.eventos;
  const serializado = JSON.stringify(eventos);
  assert.ok(!serializado.includes('SECRETO-1234'));
  assert.ok(!serializado.includes('video-super-secreto'));
  assert.ok(!serializado.includes('Clase privada'));
  const cambio = eventos.find((x) => x.tipo === 'v2_cursos');
  assert.equal(cambio.despues.clases.elementos, 1);
  assert.equal(typeof cambio.despues.clases.huella, 'string');
});

test('admin: paginación recorre todos los registros sin perder fechas repetidas', async () => {
  const e = crearEntorno();
  for (let n = 0; n < 53; n++) e.db.docs.set(`v2_admin_auditoria/evento-${String(n).padStart(3, '0')}`, { fecha: '2026-10-30T10:00:00.000Z', accion: 'prueba' });
  const uno = (await llamada(e, 'get', '/admin/bitacora').expect(200)).body;
  const dos = (await llamada(e, 'get', `/admin/bitacora?cursor=${uno.siguiente}`).expect(200)).body;
  assert.equal(uno.eventos.length, 50);
  assert.equal(dos.eventos.length, 3);
  assert.equal(new Set([...uno.eventos, ...dos.eventos].map((x) => x.id)).size, 53);
  assert.equal(dos.siguiente, null);
  await llamada(e, 'get', '/admin/bitacora?cursor=no-existe').expect(400);
});

test('admin: si falla la preparación del registro no aplica el cambio', async () => {
  const e = crearEntorno();
  const original = e.db.runTransaction.bind(e.db);
  e.db.runTransaction = (fn) => original((tx) => {
    const crear = tx.create.bind(tx);
    tx.create = (ref, datos) => { if (ref.path.startsWith('v2_admin_auditoria/')) throw new Error('fallo de prueba'); return crear(ref, datos); };
    return fn(tx);
  });
  await llamada(e, 'post', '/admin/miembros/free1/cortesia').send({ dias: 30, motivo: 'Prueba de atomicidad' }).expect(500);
  assert.equal(e.db.leer('v2_cortesias/free1'), undefined);
  assert.equal(e.db.rutas('v2_admin_auditoria').length, 0);
});
