import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import request from 'supertest';
import { crearJuegoClase } from '../src/lib/juegos-generador.js';
import { reproducirPartida } from '../src/lib/juegos-partida.js';
import { crearCierre } from '../src/lib/cierres-contenido.js';
import { crearEntorno, semillaBase, bearer, TOKENS } from './fakes/app.js';
import { resolverJuego } from './fakes/resolver-juego.js';
const cursos=JSON.parse(readFileSync(new URL('../../src/data/catalogo.json',import.meta.url),'utf8')).cursos;
const juegos=cursos.flatMap(c=>c.clases.map(k=>({c,k,g:crearJuegoClase(c.id,k.n,k.notas,c.titulo,k.titulo,c.portada)})));
function entorno(c,vistas=[]){const semilla=semillaBase();semilla[`v2_cursos/${c.id}`]={...c,publicado:true};semilla[`v2_progreso/vip1_${c.id}`]={uid:'vip1',cursoId:c.id,vistas};return crearEntorno({semilla});}
const post=(e,p,b={},token=TOKENS.vip)=>request(e.app).post(p).set(bearer(token)).send(b);
const put=(e,p,b,token=TOKENS.vip)=>request(e.app).put(p).set(bearer(token)).send(b);

test('los 77 repasos son jugables, resolubles y puntúan 100 sin errores ni ayudas',()=>{
 assert.equal(juegos.length,77);const tipos=new Set();
 for(const {g,c,k} of juegos){assert.ok(g,`${c.id}:${k.n}`);tipos.add(g.tipo);const s=reproducirPartida(g,resolverJuego(g));assert.equal(s.terminada,true);assert.equal(s.puntaje,100);}
 assert.equal(tipos.size,5);
});
test('fallar las dos palabras de ahorcado da cero y no permite saltar rondas',()=>{
 const g=juegos.find(x=>x.g.tipo==='ahorcado').g,ev=[];
 assert.throws(()=>reproducirPartida(g,[{tipo:'siguiente'}]));
 for(const p of g.ahorcado){const malas=[...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].filter(l=>!p.palabra.includes(l)).slice(0,6);ev.push(...malas.map(letra=>({tipo:'letra',letra})),{tipo:'siguiente'});}
 const s=reproducirPartida(g,ev);assert.equal(s.aciertos,0);assert.equal(s.errores,12);assert.equal(s.puntaje,0);assert.equal(s.terminada,true);
});
test('no acepta movimientos imposibles ni registros de longitud excesiva',()=>{
 for(const {g} of juegos){assert.throws(()=>reproducirPartida(g,[{tipo:'completar',puntaje:100}]));assert.throws(()=>reproducirPartida(g,Array(1201).fill({tipo:'ayuda'})));}
 const g=juegos.find(x=>x.g.tipo==='memorama').g;assert.throws(()=>reproducirPartida(g,[{tipo:'par',x:g.memorama[0].uid,y:g.memorama[0].uid}]));
});
test('las ayudas reducen el resultado aunque se termine el rompecabezas',()=>{
 const g=juegos.find(x=>x.g.tipo==='rompecabezas').g,ev=[];let s=reproducirPartida(g,ev);
 ev.push({tipo:'ayuda'},{tipo:'ayuda'},{tipo:'ver-guia'});s=reproducirPartida(g,ev);
 while(!s.terminada){const x=s.orden.findIndex((id,i)=>id!==i);ev.push({tipo:'cambiar',x,y:s.orden.indexOf(x)});s=reproducirPartida(g,ev);}
 assert.ok(s.puntaje>0&&s.puntaje<100);assert.ok(s.ayudas>0);
});
test('servidor exige clase vista, conserva borrador y no lo recompensa',async()=>{
 const {c,k}=juegos.find(x=>x.k.n===1);const e=entorno(c),ruta=`/juegos-clase/${c.id}/${k.n}`;
 await post(e,ruta+'/iniciar').expect(409);
 e.db.docs.set(`v2_progreso/vip1_${c.id}`,{uid:'vip1',cursoId:c.id,vistas:[k.n]});
 const {body:p}=await post(e,ruta+'/iniciar').expect(200),ev=resolverJuego(p.juego).slice(0,1);
 await put(e,ruta+'/partida',{partidaId:p.id,revision:0,eventos:ev}).expect(200);
 const {body:retoma}=await post(e,ruta+'/iniciar').expect(200);assert.deepEqual(retoma.eventos,ev);assert.equal(retoma.revision,1);
 const {body:lista}=await request(e.app).get('/juegos-clase').set(bearer(TOKENS.vip)).expect(200);assert.deepEqual(lista,[]);
 const {body:saldo}=await request(e.app).get('/recompensas/resumen').set(bearer(TOKENS.vip)).expect(200);assert.equal(saldo.contadores.juegosClase||0,0);
 await post(e,ruta,{partidaId:p.id,revision:1,eventos:ev}).expect(409);
 await put(e,ruta+'/partida',{partidaId:p.id,revision:0,eventos:resolverJuego(p.juego)}).expect(409);
 await put(e,ruta+'/partida',{partidaId:p.id,revision:1,eventos:[]}).expect(409);
 await put(e,ruta+'/partida',{partidaId:p.id,revision:1,eventos:ev},TOKENS.vip2).expect(409);
});
test('resultado calculado en servidor, reintentos y peticiones repetidas no duplican OdonCoins',async()=>{
 const {c,k}=juegos[0],e=entorno(c,[k.n]),ruta=`/juegos-clase/${c.id}/${k.n}`;
 const {body:p}=await post(e,ruta+'/iniciar').expect(200);
 await post(e,ruta,{tipo:'memorama',puntaje:100}).expect(400);
 const b={partidaId:p.id,revision:0,eventos:resolverJuego(p.juego),puntaje:1,tipo:'falso'};
 const {body:r}=await post(e,ruta,b).expect(200);assert.equal(r.estado.puntaje,100);assert.equal(r.juego.tipo,p.juego.tipo);assert.equal(r.recompensas.puntosGanados,5);
 assert.equal('partida' in r.juego,false);
 const {body:repetida}=await post(e,ruta,b).expect(200);assert.equal(repetida.juego.intentos,1);assert.equal(repetida.recompensas,undefined);
 const {body:nuevo}=await post(e,ruta+'/iniciar',{reiniciar:true}).expect(200);
 const {body:segunda}=await post(e,ruta,{partidaId:nuevo.id,revision:0,eventos:resolverJuego(nuevo.juego)}).expect(200);assert.equal(segunda.recompensas.puntosGanados,0);assert.equal(segunda.juego.intentos,2);
 const lista=await request(e.app).get('/juegos-clase').set(bearer(TOKENS.vip2)).expect(200);assert.deepEqual(lista.body,[]);
});
test('18 cierres tienen 54 preguntas y referencias existentes',()=>{
 for(const c of cursos){const cierre=crearCierre(c);assert.equal(cierre.preguntas.length,3);for(const p of cierre.preguntas){assert.equal(new Set(p.opciones).size,3);assert.ok(p.fuente.texto);assert.ok(p.correcta>=0&&p.correcta<3);}}
});
test('el cierre de Ortodoncia reconoce los apuntes originales que siguen en producción',()=>{
 const c=structuredClone(cursos[0]);
 c.clases[0].notas.conceptos=[{t:'02:00',texto:'Clasificación de Angle (Clase I, II y III) según la relación del primer molar.'}];
 c.clases[1].notas.conceptos=[{t:'02:00',texto:'Análisis de espacio: espacio disponible frente al requerido para detectar apiñamiento.'}];
 c.clases[2].notas.conceptos=[{t:'02:00',texto:'Hábitos (succión digital, deglución atipica, respiración bucal) y su efecto en la maloclusión.'}];
 const cierre=crearCierre(c);assert.match(cierre.preguntas[0].q,/Angle/);assert.equal(cierre.preguntas[1].fuente.n,2);assert.equal(cierre.preguntas[2].fuente.n,3);
});
test('las tarjetas usan vocabulario clínico y ocultan todas las repeticiones de la palabra',()=>{
 for(const {g} of juegos)for(const t of g.terminos){assert.ok(!['ESTUDIA','HALLAZGOS','MANTENER','PERMANENTE','PACIENTE'].includes(t.palabra));const pista=t.pistaOculta.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();assert.ok(!new RegExp('\\b'+t.palabra+'\\b').test(pista),t.etiqueta);}
});
test('cierre requiere todas las clases y membresía, guarda selección y protege resultado',async()=>{
 const c=cursos[0],e=entorno(c,[1,2,3,4]),ruta=`/cierres/${c.id}`;
 await post(e,ruta+'/iniciar').expect(409);
 e.db.docs.set(`v2_progreso/vip1_${c.id}`,{uid:'vip1',cursoId:c.id,vistas:c.clases.map(x=>x.n)});
 const {body:p}=await post(e,ruta+'/iniciar').expect(200);
 assert.equal(p.preguntas.length,3);assert.ok(p.preguntas.every(x=>!('correcta' in x)&&!('explicacion' in x)&&!('texto' in x.fuente)));assert.equal(p.contenido,undefined);
 await put(e,ruta,{id:p.id,revision:0,respuestas:[0,null,null]}).expect(200);
 const {body:retoma}=await post(e,ruta+'/iniciar').expect(200);assert.deepEqual(retoma.respuestas,[0,null,null]);
 await put(e,ruta,{id:p.id,revision:1,respuestas:[0,null,null],finalizar:true}).expect(400);
 const respuestas=crearCierre(c).preguntas.map(x=>x.correcta),b={id:p.id,revision:1,respuestas,finalizar:true};
 const {body:r}=await put(e,ruta,b).expect(200);assert.equal(r.aciertos,3);assert.ok(r.preguntas.every(x=>x.acierto&&x.explicacion));
 const {body:rep}=await put(e,ruta,b).expect(200);assert.equal(rep.fecha,r.fecha);
 await put(e,ruta,{...b,respuestas:respuestas.map(x=>(x+1)%3)}).expect(409);
 await post(e,ruta+'/iniciar',{},TOKENS.free).expect(403);
 await post(e,ruta+'/iniciar',{},TOKENS.vip2).expect(403);
 const {body:repetir}=await post(e,ruta+'/iniciar',{reiniciar:true}).expect(200);assert.equal(repetir.intento,2);assert.notEqual(repetir.id,p.id);assert.equal(repetir.finalizado,false);
 const games=await request(e.app).get('/juegos-clase').set(bearer(TOKENS.vip)).expect(200);assert.deepEqual(games.body,[]);
});


test('los 18 tableros avanzados tienen 30 piezas fuera de lugar y requieren 29 intercambios',()=>{
 const puzzles=juegos.filter(x=>x.g.tipo==='rompecabezas');assert.equal(puzzles.length,18);
 for(const {g,c,k} of puzzles){
  assert.equal(g.rompecabezasImagen.ordenInicial.length,30);
  assert.equal(new Set(g.rompecabezasImagen.ordenInicial).size,30);
  assert.ok(g.rompecabezasImagen.ordenInicial.every((id,i)=>id!==i));
  assert.equal(resolverJuego(g).length,29);
  const otro=crearJuegoClase(c.id,k.n,k.notas,c.titulo,k.titulo,c.portada,'otro-intento');
  assert.notDeepEqual(otro.rompecabezasImagen.ordenInicial,g.rompecabezasImagen.ordenInicial);
  assert.throws(()=>reproducirPartida(g,[{tipo:'cambiar',x:0,y:30}]));
 }
});
test('reabrir no repone las dos ayudas ni las tres miradas',async()=>{
 const {c,k}=juegos.find(x=>x.g.tipo==='rompecabezas'),e=entorno(c,[k.n]),ruta=`/juegos-clase/${c.id}/${k.n}`;
 const {body:p}=await post(e,ruta+'/iniciar').expect(200);
 const ev=[{tipo:'ayuda'},{tipo:'ayuda'},...Array.from({length:3},()=>({tipo:'ver-guia'}))];
 await put(e,ruta+'/partida',{partidaId:p.id,revision:0,eventos:ev}).expect(200);
 const {body:r}=await post(e,ruta+'/iniciar').expect(200);
 assert.equal(r.id,p.id);assert.deepEqual(r.eventos,ev);assert.deepEqual(r.juego,p.juego);
 const s=reproducirPartida(r.juego,r.eventos);assert.equal(s.acomodadas,2);assert.equal(s.guias,3);assert.equal(s.ayudas,5);
 for(const tipo of ['ayuda','ver-guia']){
  assert.throws(()=>reproducirPartida(r.juego,[...r.eventos,{tipo}]));
  const rechazado=await put(e,ruta+'/partida',{partidaId:r.id,revision:r.revision,eventos:[...r.eventos,{tipo}]});assert.ok(rechazado.status>=400);
 }
 const {body:n}=await post(e,ruta+'/iniciar',{reiniciar:true}).expect(200);
 assert.notEqual(n.id,p.id);assert.notDeepEqual(n.juego.rompecabezasImagen.ordenInicial,p.juego.rompecabezasImagen.ordenInicial);
 assert.equal(reproducirPartida(n.juego,n.eventos).ayudas,0);
});
test('partidas anteriores de 16 piezas siguen siendo resolubles con sus ayudas originales',()=>{
 const g=structuredClone(juegos.find(x=>x.g.tipo==='rompecabezas').g);
 g.rompecabezasImagen={columnas:4,filas:4,piezas:g.rompecabezasImagen.piezas.slice(0,16),ordenInicial:[...Array.from({length:15},(_,i)=>i+1),0]};
 const ev=[];let s=reproducirPartida(g,ev);
 while(!s.terminada){ev.push({tipo:'ayuda'});s=reproducirPartida(g,ev);}
 assert.equal(s.aciertos,16);assert.equal(s.acomodadas,15);assert.ok(s.terminada);
});
