import assert from 'node:assert/strict';
import { test } from 'node:test';
import request from 'supertest';
import { crearEntorno, TOKENS, bearer } from './fakes/app.js';

const responder=(e,body={},token=TOKENS.free)=>request(e.app).post('/retos/responder').set(bearer(token)).send({cursoId:'curso-a',n:1,indice:0,respuesta:0,...body});
const monedero=e=>request(e.app).get('/recompensas/resumen').set(bearer(TOKENS.free));

test('responder antes de abrir el monedero no duplica los OdonCoins por migración',async()=>{
 const e=crearEntorno();
 const {body:r}=await responder(e).expect(200);
 assert.equal(r.xpGanado,10);assert.equal(r.recompensas.puntosGanados,10);
 const {body:w}=await monedero(e).expect(200);
 assert.equal(w.contadores.puntosRetos,10);
 const retos=w.movimientos.filter(x=>x.tipo==='reto');assert.equal(retos.reduce((n,x)=>n+x.puntos,0),10);
 const {body:otra}=await monedero(e).expect(200);assert.equal(otra.saldo,w.saldo);
});

test('acierto, error, repetición y nuevo día se reflejan en el saldo y en XP',async()=>{
 const e=crearEntorno();const {body:base}=await monedero(e).expect(200);
 const {body:ok}=await responder(e).expect(200);assert.equal(ok.xpGanado,10);
 const {body:mal}=await responder(e,{indice:1,respuesta:0}).expect(200);assert.equal(mal.xpGanado,2);
 const {body:rep}=await responder(e).expect(200);assert.equal(rep.xpGanado,0);assert.equal(rep.recompensas.puntosGanados,0);
 const {body:w}=await monedero(e).expect(200);assert.equal(w.saldo,base.saldo+12);assert.equal(w.contadores.puntosRetos,12);
 e.reloj.ahora=new Date(e.reloj.ahora.getTime()+86400000);
 const {body:dia}=await responder(e).expect(200);assert.equal(dia.xpGanado,10);assert.equal(dia.estado.xp,22);
 const {body:fin}=await monedero(e).expect(200);assert.equal(fin.saldo,base.saldo+22);
});

test('el cliente no puede imponer premios ni sumar puntos a otra cuenta',async()=>{
 const e=crearEntorno();await monedero(e).expect(200);
 const {body:r}=await responder(e,{xpGanado:99999,puntos:99999,uid:'vip2'}).expect(200);
 assert.equal(r.xpGanado,10);assert.equal(e.db.leer('v2_recompensas_estado/vip2'),undefined);
 await responder(e,{n:3}).expect(403);
});


test('reintentar el mismo envío conserva el premio y no duplica estadísticas',async()=>{
 const e=crearEntorno(),id='intento-prueba-red-0001';await monedero(e).expect(200);
 const {body:a}=await responder(e,{intentoId:id}).expect(200);
 const {body:b}=await responder(e,{intentoId:id}).expect(200);
 assert.equal(b.xpGanado,10);assert.deepEqual(a.estado,b.estado);
 assert.equal(e.db.leer('v2_retos_estados/free1').quiz.total,1);
 assert.equal(e.db.leer('v2_recompensas_estado/free1').contadores.puntosRetos,10);
 await responder(e,{intentoId:id,respuesta:1}).expect(409);
 await responder(e,{intentoId:'mal'}).expect(400);
 await responder(e,{indice:1,respuesta:1}).expect(200);
 const {body:otraVez}=await responder(e,{intentoId:id}).expect(200);
 assert.equal(otraVez.estado.xp,20);assert.equal(otraVez.recompensas.ganados,20);assert.equal(otraVez.recompensas.saldo,20);
});

test('migración conserva XP históricos sin volver a pagar puntos ya registrados',async()=>{
 const e=crearEntorno();e.db.docs.set('v2_retos_estados/free1',{uid:'free1',xp:100});
 await responder(e).expect(200);
 const {body:w}=await monedero(e).expect(200);assert.equal(w.contadores.puntosRetos,110);
 const {body:otra}=await monedero(e).expect(200);assert.equal(otra.saldo,w.saldo);
});

test('preguntas nuevas desbloquean el logro Retador constante al llegar a 100',async()=>{
 const e=crearEntorno();await monedero(e).expect(200);
 const q=e.db.leer('v2_quizzes/curso-a_1').preguntas[0];
 e.db.docs.set('v2_quizzes/curso-a_1',{cursoId:'curso-a',n:1,estado:'aprobado',preguntas:Array.from({length:10},(_,i)=>({...q,id:'reto-'+i,q:'Pregunta '+i}))});
 let ultimo;for(let indice=0;indice<10;indice++)ultimo=(await responder(e,{indice}).expect(200)).body;
 assert.ok(ultimo.recompensas.logrosNuevos.some(x=>x.id==='retador'));
 const {body:w}=await monedero(e).expect(200);assert.equal(w.contadores.puntosRetos,100);assert.ok(w.logros.find(x=>x.id==='retador').logrado);
});
