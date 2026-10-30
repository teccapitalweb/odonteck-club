import { randomUUID } from 'node:crypto';
import { crearJuegoClase } from '../lib/juegos-generador.js';
import { reproducirPartida, VERSION_JUEGOS } from '../lib/juegos-partida.js';
import { cuerpo } from '../lib/validacion.js';
import { conflicto, invalido } from '../lib/errores.js';
import { h } from '../middleware/errores.js';
import { COL } from '../datos.js';
import { otorgarEventosTx, REGLAS_PUNTOS } from '../lib/recompensas.js';

export function montarJuegos(r, ctx, auth, prepararClase) {
  const { db }=ctx;
  r.get('/juegos-clase',auth,h(async(req,res)=>{
    const snap=await db.collection(COL.juegosClase).where('uid','==',req.usuario.uid).get();
    res.json(snap.docs.map(d=>d.data()).filter(d=>d.completado).map(({uid,partida,...registro})=>registro));
  }));
  r.post('/juegos-clase/:cursoId/:n/iniciar',auth,h(async(req,res)=>{
    const {u,n,curso,clase,progRef}=await prepararClase(req,req.params.cursoId,req.params.n);
    const ref=db.collection(COL.juegosClase).doc(`${u.uid}_${curso.id}_${n}`);
    const reiniciar=cuerpo(req).reiniciar===true;
    const partida=await db.runTransaction(async tx=>{
      const [snap,prog]=await tx.getAll(ref,progRef);
      if(!prog.data()?.vistas?.includes(n))throw conflicto('Termina la clase antes de empezar el repaso.','clase_no_vista');
      const anterior=snap.exists?snap.data():{};
      if(anterior.partida?.version===VERSION_JUEGOS && !reiniciar)return anterior.partida;
      const id=randomUUID();
      const juego=crearJuegoClase(curso.id,n,clase.notas,curso.titulo,clase.titulo,curso.portada,id);
      if(!juego)throw conflicto('Este repaso necesita contenido adicional. Puedes continuar con tu curso.','repaso_no_disponible');
      // Firestore does not accept nested arrays (the soup board is a matrix).
      // Keep the immutable puzzle as JSON; the event log stays queryable.
      const p={id,version:VERSION_JUEGOS,juego:JSON.stringify(juego),eventos:[],revision:0,finalizada:false,actualizado:ctx.now().toISOString()};
      tx.set(ref,{...anterior,uid:u.uid,cursoId:curso.id,n,partida:p});return p;
    });res.json({...partida,juego:JSON.parse(partida.juego)});
  }));
  async function guardar(req,res,finalizar) {
    const {u,n,curso,progRef}=await prepararClase(req,req.params.cursoId,req.params.n);
    const b=cuerpo(req);
    if(!b.partidaId || !Number.isInteger(b.revision) || !Array.isArray(b.eventos))throw invalido('Actualiza la página para usar el repaso verificado.');
    const ref=db.collection(COL.juegosClase).doc(`${u.uid}_${curso.id}_${n}`);
    const respuesta=await db.runTransaction(async tx=>{
      const [snap,prog]=await tx.getAll(ref,progRef);const anterior=snap.exists?snap.data():{};const p=anterior.partida;
      if(!prog.data()?.vistas?.includes(n))throw conflicto('Primero termina la clase.','clase_no_vista');
      if(!p || p.id!==b.partidaId || p.version!==VERSION_JUEGOS)throw conflicto('Esta partida cambió. Ciérrala y vuelve a abrirla.','partida_cambiada');
      const iguales=JSON.stringify(p.eventos)===JSON.stringify(b.eventos);
      if(p.revision!==b.revision && !iguales)throw conflicto('La partida avanzó en otro dispositivo. Vuelve a abrirla para recuperar ese avance.','partida_cambiada');
      if(p.finalizada && !iguales)throw conflicto('Este intento ya terminó. Inicia otro para practicar.','partida_finalizada');
      // Append-only: a saved mistake cannot disappear from a later submission.
      if(JSON.stringify(b.eventos.slice(0,p.eventos.length))!==JSON.stringify(p.eventos))throw conflicto('No se pueden borrar jugadas guardadas.','partida_cambiada');
      const contenido=JSON.parse(p.juego);
      let estado;try{estado=reproducirPartida(contenido,b.eventos);}catch(e){throw invalido(e.message);}
      if(finalizar && !estado.terminada)throw conflicto('Completa las rondas antes de guardar el resultado.','partida_incompleta');
      const fecha=ctx.now().toISOString();
      const nueva={...p,eventos:b.eventos,revision:p.revision+(iguales?0:1),actualizado:fecha,finalizada:p.finalizada||finalizar};
      let registro={...anterior,partida:nueva};let recompensas;
      if(finalizar && !p.finalizada){
        recompensas=await otorgarEventosTx({tx,db,colecciones:COL,uid:u.uid,ahora:ctx.now(),eventos:[{clave:`juego-clase:${curso.id}:${n}`,tipo:'juego-clase',puntos:REGLAS_PUNTOS.juegoClase,contador:'juegosClase',detalle:`Repaso completado: ${curso.titulo}, clase ${n}`}]});
        registro={...registro,tipo:contenido.tipo,completado:true,mejorPuntaje:Math.max(anterior.mejorPuntaje||0,estado.puntaje),ultimoPuntaje:estado.puntaje,intentos:(anterior.intentos||0)+1,primeraVez:anterior.primeraVez||fecha,ultimoIntento:fecha,actualizado:fecha,version:VERSION_JUEGOS};
      }
      tx.set(ref,registro);
      const {uid,partida,...juego}=registro;
      return {revision:nueva.revision,finalizada:nueva.finalizada,estado,juego,...(recompensas?{recompensas}:{})};
    });res.json(respuesta);
  }
  r.put('/juegos-clase/:cursoId/:n/partida',auth,h((req,res)=>guardar(req,res,false)));
  r.post('/juegos-clase/:cursoId/:n',auth,h((req,res)=>guardar(req,res,true)));
}
