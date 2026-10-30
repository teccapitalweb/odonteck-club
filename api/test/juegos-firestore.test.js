import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import request from 'supertest';
import { initializeApp, deleteApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { crearApp } from '../src/app.js';
import { crearEntorno, semillaBase, TOKENS, bearer, AHORA_ISO } from './fakes/app.js';
import { crearJuegoClase } from '../src/lib/juegos-generador.js';
import { crearCierre } from '../src/lib/cierres-contenido.js';
import { resolverJuego } from './fakes/resolver-juego.js';

test('Firestore real de emulador persiste matrices, partidas y cierres sin arrays anidados', {skip:!process.env.FIRESTORE_EMULATOR_HOST},async()=>{
 const host=process.env.FIRESTORE_EMULATOR_HOST;
 assert.match(host,/^(127\.0\.0\.1|localhost):\d+$/,'Solo emulador local; nunca producción');
 const firebase=initializeApp({projectId:'demo-odonteck-juegos'},'qa-juegos');const db=getFirestore(firebase);
 try{
   const base=crearEntorno(),c=JSON.parse(readFileSync(new URL('../../src/data/catalogo.json',import.meta.url),'utf8')).cursos[0];
   const semilla=semillaBase();semilla[`v2_cursos/${c.id}`]={...c,publicado:true};semilla[`v2_progreso/vip1_${c.id}`]={uid:'vip1',cursoId:c.id,vistas:c.clases.map(k=>k.n)};
   for(const [path,value] of Object.entries(semilla))await db.doc(path).set(value);
   const app=crearApp({db,auth:base.auth,now:()=>new Date(AHORA_ISO)});
   for(const k of c.clases){
     const ruta=`/juegos-clase/${c.id}/${k.n}`;
     const {body:p}=await request(app).post(ruta+'/iniciar').set(bearer(TOKENS.vip)).send({reiniciar:true}).expect(200);
     assert.equal(typeof (await db.doc(`v2_juegos_clase/vip1_${c.id}_${k.n}`).get()).data().partida.juego,'string');
     const eventos=resolverJuego(p.juego);
     await request(app).put(ruta+'/partida').set(bearer(TOKENS.vip)).send({partidaId:p.id,revision:0,eventos:eventos.slice(0,1)}).expect(200);
     await request(app).post(ruta).set(bearer(TOKENS.vip)).send({partidaId:p.id,revision:1,eventos}).expect(200);
     const {body:r}=await request(app).post(ruta+'/iniciar').set(bearer(TOKENS.vip)).send({}).expect(200);
     assert.equal(r.finalizada,true);assert.equal(r.juego.tipo,crearJuegoClase(c.id,k.n,k.notas,c.titulo,k.titulo,c.portada).tipo);
   }
   const ruta=`/cierres/${c.id}`,{body:p}=await request(app).post(ruta+'/iniciar').set(bearer(TOKENS.vip)).send({reiniciar:true}).expect(200);
   const {body:r}=await request(app).put(ruta).set(bearer(TOKENS.vip)).send({id:p.id,revision:0,respuestas:crearCierre(c).preguntas.map(x=>x.correcta),finalizar:true}).expect(200);
   assert.equal(r.aciertos,3);const doc=await db.doc(`v2_juegos_clase/vip1_${c.id}_cierre`).get();assert.equal(doc.data().cierre.finalizado,true);
 }finally{await db.terminate();await deleteApp(firebase);}
});
