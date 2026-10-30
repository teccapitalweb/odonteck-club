import { Auth, api } from '../core/auth';
import { esc } from './partials';
import '../styles/repaso-pro.css';

type Pregunta={q:string;tipo:string;opciones:string[];fuente:{n:number;t:string;titulo:string};correcta?:number;explicacion?:string;acierto?:boolean};
type Cierre={id:string;revision:number;titulo:string;respuestas:(number|null)[];preguntas:Pregunta[];finalizado:boolean;aciertos?:number;intento:number};
export async function abrirCierreCurso(cursoId:string) {
 document.querySelector<HTMLDialogElement>('[data-course-closing]')?.close();
 const uid=Auth.usuario?.uid; const key=`odt:cierre-v1:${uid}:${cursoId}`;
 const ruta=`/cierres/${encodeURIComponent(cursoId)}`;
 const d=document.createElement('dialog');d.className='repaso-pro';d.dataset.courseClosing=cursoId;d.setAttribute('aria-label','Cierre especial del curso');
 const foco=document.activeElement as HTMLElement|null;
 document.body.append(d);d.innerHTML='<div class="rp-loading"><p role="status">Preparando tu cierre de curso…</p><button type="button" data-cierre="cerrar">Cerrar</button></div>';d.showModal();
 let c:Cierre, paso=0,error='',estado='Recuperando tu avance…',cerrado=false,ocupado=false;
 let cola=Promise.resolve(),timer:ReturnType<typeof setTimeout>|undefined;
 const activo=()=>!cerrado&&Auth.usuario?.uid===uid;
 const cache=()=>{try{localStorage.setItem(key,JSON.stringify({id:c.id,respuestas:c.respuestas,revision:c.revision}));}catch{}};
 const btn=(t:string,a:string,extra='')=>`<button type="button" data-cierre="${a}" ${extra}>${t}</button>`;
 async function iniciar(reiniciar=false,recuperar=false){
   ocupado=true;error='';
   try{
     c=await api<Cierre>(ruta+'/iniciar',{method:'POST',json:{reiniciar}});
     if(!activo())return;
     let pendiente=false;
     if(!reiniciar&&!recuperar&&!c.finalizado){try{const local=JSON.parse(localStorage.getItem(key)||'null');if(local?.id===c.id&&local.revision===c.revision&&Array.isArray(local.respuestas)&&local.respuestas.length===3&&local.respuestas.every((x:unknown)=>x===null||Number.isInteger(x)&&Number(x)>=0&&Number(x)<3)){pendiente=JSON.stringify(local.respuestas)!==JSON.stringify(c.respuestas);c.respuestas=local.respuestas;}}catch{}}
     paso=Math.max(0,c.respuestas.findIndex(x=>x===null));estado='Guardado en tu cuenta';ocupado=false;pintar();
     if(pendiente)void guardar();
   }catch(e:any){ocupado=false;error=e.message;if(activo())pintar();}
 }
 function guardar(finalizar=false){
   const respuestas=[...c.respuestas],id=c.id;
   cola=cola.then(async()=>{
     if(Auth.usuario?.uid!==uid||id!==c.id)return;
     estado='Guardando en tu cuenta…';
     try{
       const r=await api<Cierre>(ruta,{method:'PUT',json:{id,revision:c.revision,respuestas,finalizar}});
       if(Auth.usuario?.uid!==uid)return;
       // Keep newer taps while an earlier draft request is in flight.
       c={...r,respuestas:finalizar?r.respuestas:c.respuestas};cache();error='';estado='Guardado en tu cuenta';
     }catch(e:any){error=e.message;estado='Pendiente de guardar · conservamos tu selección en este dispositivo';}
     if(finalizar)ocupado=false;
     if(activo())pintar();
   });return cola;
 }
 function pintar(){
   if(!activo())return;
   const enfocado=(document.activeElement as HTMLElement)?.dataset.cierre;
   let cuerpo='';
   if(!c)cuerpo=`<h2>No pudimos abrir el cierre</h2><p>${esc(error)}</p>${btn('Volver a intentar','recuperar')}`;
   else if(c.finalizado){
     cuerpo=`<section class="rp-result rp-course-result"><span class="rp-medal" aria-hidden="true">✦</span><small>UN PASO MÁS EN TU FORMACIÓN</small><h2>${c.aciertos===3?'Lo aprendido, conectado.':'Curso recorrido. Sigamos afinando.'}</h2><p>Ya tienes un mapa para recordar lo esencial de <strong>${esc(c.titulo)}</strong>.</p><div class="rp-score"><strong>${c.aciertos}/3</strong><span>respuestas correctas · intento ${c.intento}</span></div><p>Este repaso es formativo. No modifica tu certificado ni entrega OdonCoins adicionales.</p>${c.preguntas.map((p,i)=>`<article><small>${p.acierto?'✓ CONCEPTO REFORZADO':'↻ PARA REPASAR'} · ${esc(p.tipo)}</small><h3>${esc(p.q)}</h3><p>Tu respuesta: ${esc(p.opciones[c.respuestas[i]!])}</p>${p.acierto?'':`<p><strong>Respuesta: ${esc(p.opciones[p.correcta!])}</strong></p>`}<p>${esc(p.explicacion||'')}</p><a class="rp-source" data-cierre="fuente" href="#/curso/${encodeURIComponent(cursoId)}/clase/${p.fuente.n}">Repasar clase ${p.fuente.n} · referencia ${esc(p.fuente.t)}</a></article>`).join('')}<div class="rp-actions">${btn('Practicar de nuevo','reiniciar')}<a class="btn" data-cierre="fuente" href="#/certificados">Mis certificados</a>${btn('Volver al curso','cerrar')}</div></section>`;
   }else{
     const p=c.preguntas[paso];
     cuerpo=`<div class="rp-stepper" aria-label="Paso ${paso+1} de 3">${c.preguntas.map((_,i)=>`<span class="${i<=paso?'active':''}"></span>`).join('')}</div><p class="rp-progress">${String(paso+1).padStart(2,'0')} / 03 · ${esc(p.tipo)}</p><h2 class="rp-question" tabindex="-1">${esc(p.q)}</h2>${paso===1?'<p>Situación de aprendizaje basada en el contenido del curso.</p>':''}<div class="rp-options" role="group" aria-label="Selecciona una respuesta">${p.opciones.map((x,i)=>btn(`<b>${'ABC'[i]}</b><span>${esc(x)}</span>`,'opcion',`data-i="${i}" aria-pressed="${c.respuestas[paso]===i}" ${ocupado?'disabled':''}`)).join('')}</div><p class="rp-source">Basado en clase ${p.fuente.n} · ${esc(p.fuente.t)}. Podrás volver a la fuente al terminar.</p><div class="rp-actions">${paso?btn('Anterior','anterior',ocupado?'disabled':''):''}${btn(paso===2?'Ver mi cierre':'Continuar','siguiente',c.respuestas[paso]===null||ocupado?'disabled':'')}</div><p class="rp-source">3 pasos, sin cronómetro. Puedes cerrar y retomar desde el curso.</p>`;
   }
   d.innerHTML=`<header class="rp-header"><div><small>ODONTECK · CIERRE DE CURSO</small><h2>Conecta lo que aprendiste</h2><p>${esc(c?.titulo||'Tu repaso final')}</p></div>${btn('×','cerrar','aria-label="Guardar y cerrar"')}</header><div class="rp-body">${cuerpo}</div><footer class="rp-footer"><span role="status">${estado}</span>${error&&c?`<p role="alert">${esc(error)}</p>${btn('Reintentar guardado','guardar')}${btn('Recuperar de mi cuenta','recuperar')}`:''}</footer>`;
   if(enfocado)d.querySelector<HTMLElement>(`[data-cierre="${enfocado}"]`)?.focus({preventScroll:true});
 }
 d.addEventListener('click',async e=>{
   const b=(e.target as HTMLElement).closest<HTMLElement>('[data-cierre]');if(!b)return;const a=b.dataset.cierre;
   if(a==='cerrar'||a==='fuente'){d.close();return;}
   if(ocupado)return;
   if(a==='recuperar'||a==='reiniciar'){clearTimeout(timer);ocupado=true;await cola;await iniciar(a==='reiniciar',true);return;}
   if(a==='guardar'){await guardar();return;}
   if(a==='opcion'){c.respuestas[paso]=Number(b.dataset.i);cache();estado='Guardado pendiente';pintar();d.querySelector<HTMLElement>(`[data-cierre="opcion"][data-i="${b.dataset.i}"]`)?.focus({preventScroll:true});clearTimeout(timer);timer=setTimeout(()=>void guardar(),450);return;}
   if(a==='anterior'){paso--;pintar();d.querySelector<HTMLElement>('.rp-question')?.focus();return;}
   if(a==='siguiente'&&c.respuestas[paso]!==null){if(paso<2){paso++;pintar();d.querySelector<HTMLElement>('.rp-question')?.focus();}else{clearTimeout(timer);ocupado=true;pintar();await guardar(true);}}
 });
 d.addEventListener('close',()=>{cerrado=true;clearTimeout(timer);if(c&&!c.finalizado&&!ocupado){cache();void guardar();}d.remove();foco?.isConnected&&foco.focus({preventScroll:true});},{once:true});
 const cambio=()=>{if(Auth.usuario?.uid!==uid)d.close();};window.addEventListener('auth:cuenta-cambio',cambio);d.addEventListener('close',()=>window.removeEventListener('auth:cuenta-cambio',cambio),{once:true});
 await iniciar();
}
