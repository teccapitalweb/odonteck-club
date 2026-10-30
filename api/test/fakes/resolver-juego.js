import { reproducirPartida } from '../../src/lib/juegos-partida.js';
export function resolverJuego(g) {
 const eventos=[];
 if(g.tipo==='rompecabezas'){
   let s=reproducirPartida(g,eventos);
   while(!s.terminada){const x=s.orden.findIndex((id,i)=>id!==i);eventos.push({tipo:'cambiar',x,y:s.orden.indexOf(x)});s=reproducirPartida(g,eventos);}
 }else if(g.tipo==='memorama'){
   for(const id of new Set(g.memorama.map(c=>c.parId))){const [x,y]=g.memorama.filter(c=>c.parId===id);eventos.push({tipo:'par',x:x.uid,y:y.uid});}
 }else if(g.tipo==='sopa'){
   for(const p of g.sopa.palabras)eventos.push({tipo:'buscar',celdas:p.celdas});
 }else if(g.tipo==='ahorcado'){
   for(const p of g.ahorcado){for(const letra of new Set(p.palabra))eventos.push({tipo:'letra',letra});eventos.push({tipo:'siguiente'});}
 }else{
   for(const p of g.retosPalabra){for(const letra of p.palabra)eventos.push({tipo:'letra',letra});eventos.push({tipo:'comprobar'});}
 }return eventos;
}
