import assert from 'node:assert/strict';
import {test} from 'node:test';
import request from 'supertest';
import {initializeApp,deleteApp} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';
import {crearApp} from '../src/app.js';
import {crearEntorno,semillaBase,TOKENS,bearer,AHORA_ISO} from './fakes/app.js';

test('Retos: concurrencia, reenvío y migración conservan XP y monedero en Firestore real', {skip:!process.env.FIRESTORE_EMULATOR_HOST}, async()=>{
 assert.match(process.env.FIRESTORE_EMULATOR_HOST,/^(127\.0\.0\.1|localhost):\d+$/);
 const fb=initializeApp({projectId:'demo-odonteck-juegos'},'qa-retos');const db=getFirestore(fb);
 try{
  const base=crearEntorno();for(const [path,value] of Object.entries(semillaBase()))await db.doc(path).set(value);
  const app=crearApp({db,auth:base.auth,now:()=>new Date(AHORA_ISO)});
  const enviar=()=>request(app).post('/retos/responder').set(bearer(TOKENS.free)).send({cursoId:'curso-a',n:1,indice:0,respuesta:0,intentoId:'red-repetida-emulador-001'}).expect(200);
  const wallet=()=>request(app).get('/recompensas/resumen').set(bearer(TOKENS.free)).expect(200);
  const resultados=await Promise.all([enviar(),enviar(),wallet(),enviar(),wallet()]);
  for(const i of [0,1,3])assert.equal(resultados[i].body.xpGanado,10);
  const e=(await db.doc('v2_retos_estados/free1').get()).data();assert.equal(e.xp,10);assert.equal(e.quiz.total,1);
  const w=(await wallet()).body;assert.equal(w.contadores.puntosRetos,10);
  const repetida=(await enviar()).body;assert.equal(repetida.xpGanado,10);assert.equal((await wallet()).body.saldo,w.saldo);
 }finally{await db.terminate();await deleteApp(fb);}
});
