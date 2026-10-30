import { randomUUID } from 'node:crypto';
import { crearCierre, cierrePublico } from '../lib/cierres-contenido.js';
import { cursoCompleto, numerosDeClase } from '../lib/acceso.js';
import { COL, leerDoc } from '../datos.js';
import { cuerpo, idDocumento } from '../lib/validacion.js';
import { conflicto, invalido, noEncontrado } from '../lib/errores.js';
import { h } from '../middleware/errores.js';

export function montarCierres(r,ctx,auth,prepararClase) {
 async function acceso(req) {
   const id=req.params.cursoId; idDocumento(id,'cursoId');
   const curso=await leerDoc(ctx.db,COL.cursos,id);
   if(!curso)throw noEncontrado('Curso no encontrado.');
   return prepararClase(req,id,numerosDeClase(curso).at(-1));
 }
 async function operar(req,res,iniciar) {
   const {u,curso,progRef}=await acceso(req),b=cuerpo(req);
   const ref=ctx.db.collection(COL.juegosClase).doc(`${u.uid}_${curso.id}_cierre`);
   const resultado=await ctx.db.runTransaction(async tx=>{
     const [snap,prog]=await tx.getAll(ref,progRef);
     if(!cursoCompleto(curso,prog.data()?.vistas||[]))throw conflicto('Completa todas las clases para abrir el cierre del curso.','curso_incompleto');
     const previo=snap.data()?.cierre;
     let c=previo;
     if(iniciar) {
       if(!c||b.reiniciar===true){
         const contenido=crearCierre(curso);if(!contenido)throw noEncontrado('Este curso todavía no tiene cierre disponible.');
         c={id:randomUUID(),revision:0,contenido,respuestas:[null,null,null],finalizado:false,intento:(previo?.intento||0)+1};
       }
     }else{
       if(!c||b.id!==c.id)throw conflicto('El intento cambió. Recupera el cierre de tu cuenta.');
       if(!Array.isArray(b.respuestas)||b.respuestas.length!==3||b.respuestas.some(x=>x!==null&&(!Number.isInteger(x)||x<0||x>2)))throw invalido('Elige una opción válida en cada paso.');
       const mismas=JSON.stringify(c.respuestas)===JSON.stringify(b.respuestas);
       if((c.revision!==b.revision||c.finalizado)&&!mismas)throw conflicto('Este cierre avanzó en otra sesión. Recupera el resultado de tu cuenta.');
       if(b.finalizar===true&&b.respuestas.includes(null))throw invalido('Responde los tres pasos antes de terminar.');
       c={...c,respuestas:b.respuestas,revision:c.revision+(mismas?0:1)};
       if(b.finalizar===true&&!c.finalizado){
         c.finalizado=true;c.fecha=ctx.now().toISOString();
         c.aciertos=c.contenido.preguntas.filter((p,i)=>p.correcta===c.respuestas[i]).length;
       }
     }
     tx.set(ref,{uid:u.uid,cursoId:curso.id,cierre:c});
     return cierrePublico(c);
   });res.json(resultado);
 }
 r.post('/cierres/:cursoId/iniciar',auth,h((req,res)=>operar(req,res,true)));
 r.put('/cierres/:cursoId',auth,h((req,res)=>operar(req,res,false)));
}
