import assert from 'node:assert/strict';
import { test } from 'node:test';
import request from 'supertest';
import { crearEntorno, TOKENS, bearer } from './fakes/app.js';

const get = (e, uid, query) => request(e.app).get(`/admin/miembros/${uid}/expediente?${query}`).set(bearer(TOKENS.admin));

test('expediente: acceso exclusivo admin, consulta sólo del alumno y paginación sin duplicados', async () => {
  const e = crearEntorno();
  for (let n = 0; n < 32; n++) e.db.docs.set(`v2_recompensas_movimientos/m${n}`, { uid:'free1', fecha:'2026-10-30T10:00:00Z', puntos:n, tipo:'actividad', detalle:'Clase completada' });
  e.db.docs.set('v2_recompensas_movimientos/ajeno', { uid:'vip1', fecha:'2026-10-30T10:00:00Z', puntos:12345 });
  await request(e.app).get('/admin/miembros/free1/expediente?seccion=movimientos').expect(401);
  await request(e.app).get('/admin/miembros/free1/expediente?seccion=movimientos').set(bearer(TOKENS.vip)).expect(403);
  const uno = (await get(e,'free1','seccion=movimientos').expect(200)).body;
  const dos = (await get(e,'free1',`seccion=movimientos&cursor=${uno.siguiente}`).expect(200)).body;
  assert.equal(uno.registros.length,30);
  assert.equal(dos.registros.length,2);
  assert.equal(new Set([...uno.registros,...dos.registros].map(x=>x.id)).size,32);
  assert.equal(dos.siguiente,null);
  assert.ok(!JSON.stringify(uno).includes('12345'));
  await get(e,'free1','seccion=movimientos&cursor=ajeno').expect(400);
  await get(e,'no-existe','seccion=movimientos').expect(404);
  await get(e,'free1','seccion=secreto').expect(400);
});

test('expediente: pagos capturados, autorizados, fallidos, reembolsados y disputas; sin datos de tarjeta', async () => {
  const e = crearEntorno();
  e.db.docs.set('v2_suscripciones/free1', { customerId:'cus_actual', estado:'active' });
  const llamadas = [];
  const base = { amount:19900, amount_captured:19900, amount_refunded:0, paid:true, captured:true, status:'succeeded', created:1793361600, currency:'mxn', livemode:true, billing_details:{email:'privado@ejemplo.test'}, payment_method_details:{card:{last4:'4242'}}, receipt_url:'https://privado.test' };
  e.stripe.charges = { list: async(params,opts) => { llamadas.push({params,opts}); return { has_more:true, data:[
    {...base,id:'ch_confirmado'}, {...base,id:'ch_autorizado',captured:false,amount_captured:0},
    {...base,id:'ch_fallido',paid:false,captured:false,status:'failed',amount_captured:0},
    {...base,id:'ch_parcial',amount_refunded:5000}, {...base,id:'ch_total',amount_refunded:19900,refunded:true},
    {...base,id:'ch_disputa',disputed:true},
  ] }; } };
  const r = (await get(e,'free1','seccion=pagos').expect(200)).body;
  assert.deepEqual(r.registros.map(x=>x.estado),['confirmado','autorizado','fallido','reembolso_parcial','reembolsado','disputa']);
  assert.equal(r.siguiente,'ch_disputa');
  assert.deepEqual(llamadas[0].params,{customer:'cus_actual',limit:20});
  assert.equal(llamadas[0].opts.timeout,8000);
  assert.ok(!JSON.stringify(r).includes('4242'));
  assert.ok(!JSON.stringify(r).includes('privado'));
  await get(e,'free1','seccion=pagos&cliente=cus_ajeno').expect(400);
  assert.equal(llamadas.length,1);
  await get(e,'free1','seccion=pagos&cursor=ch_anterior').expect(200);
  assert.equal(llamadas[1].params.starting_after,'ch_anterior');
});

test('expediente: fallo de Stripe y cliente sin vínculo son desconocidos, no ausencia de pagos', async () => {
  const e = crearEntorno();
  const sin = (await get(e,'free1','seccion=pagos').expect(200)).body;
  assert.equal(sin.disponible,false);
  assert.equal(sin.motivo,'sin_vinculo');
  e.db.docs.set('v2_suscripciones/free1',{customerId:'cus_actual'});
  e.stripe.charges = { list: async()=>{throw Error('detalle secreto');} };
  const fallo = (await get(e,'free1','seccion=pagos').expect(200)).body;
  assert.equal(fallo.disponible,false);
  assert.equal(fallo.motivo,'error_consulta');
  assert.ok(!JSON.stringify(fallo).includes('detalle secreto'));
  assert.equal(e.stripe.creadas.checkout.length,0);
});

test('expediente: Praxia distingue emisión de activación, no revela código; canjes filtrados por dueño', async () => {
  const e = crearEntorno();
  e.db.docs.set('v2_recompensas_canjes/praxia1',{uid:'free1',recompensaId:'praxia-comunidad-30-dias',tipo:'manual',estatus:'entregado',codigoEntrega:'PRX-ABCD-1234',solicitado:'2026-10-30T00:00:00Z',puntos:0});
  e.db.docs.set('v2_recompensas_canjes/praxia2',{uid:'vip1',recompensaId:'praxia-comunidad-30-dias',tipo:'manual',estatus:'pendiente',solicitado:'2026-10-30T00:00:00Z'});
  e.db.docs.set('v2_recompensas_estado/free1',{desbloqueos:{materiales:['material-historico'],recompensas:[]}});
  e.db.docs.set('v2_materiales/material-historico',{titulo:'Guía de bienvenida'});
  const r = (await get(e,'free1','seccion=recompensas').expect(200)).body;
  assert.deepEqual(r.coleccion,[{id:'material-historico',titulo:'Guía de bienvenida',tipo:'material'}]);
  assert.equal(r.registros.length,1);
  assert.equal(r.registros[0].praxia.codigoEmitido,true);
  assert.equal(r.registros[0].praxia.activacion,'no_verificada');
  assert.ok(!JSON.stringify(r).includes('PRX-ABCD-1234'));
});

test('expediente: bitácora personal conserva referencia global y no mezcla actores con objetivos', async () => {
  const e = crearEntorno();
  await request(e.app).post('/admin/miembros/free1/cortesia').set(bearer(TOKENS.admin)).send({dias:30,motivo:'Ponente invitada'}).expect(201);
  const personal = (await get(e,'free1','seccion=historial').expect(200)).body;
  const global = (await request(e.app).get('/admin/bitacora').set(bearer(TOKENS.admin)).expect(200)).body;
  assert.equal(personal.registros.length,1);
  assert.deepEqual(personal.registros[0],global.eventos[0]);
  assert.equal((await get(e,'adm1','seccion=historial').expect(200)).body.registros.length,0);
  assert.equal((await get(e,'vip1','seccion=historial').expect(200)).body.registros.length,0);
});

test('expediente: clases válidas sin duplicados, monedero no inicializado y fechas de sesión diferenciadas', async () => {
  const e = crearEntorno();
  e.db.docs.set('v2_progreso/free1_curso-a',{uid:'free1',cursoId:'curso-a',vistas:[1,1,999],actualizado:'2026-09-17T10:00:00Z'});
  const d = (await request(e.app).get('/admin/miembros/free1').set(bearer(TOKENS.admin)).expect(200)).body;
  assert.deepEqual(d.progreso[0].vistas,[1]);
  assert.equal(d.recompensas.registrado,false);
  assert.equal(d.ultimoInicioSesion,null);
});
