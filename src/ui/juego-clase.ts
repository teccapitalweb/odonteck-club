import { Auth, api } from '../core/auth';
import { Datos, type Nota } from '../core/datos';
import { crearJuegoClase, lineaEntreCeldas, registrarJuegoClaseRemoto, INFO_TIPO_JUEGO, type JuegoClase } from '../core/juego-clase';
import { reproducirPartida, VERSION_JUEGOS } from '../../api/src/lib/juegos-partida.js';
import { esc } from './partials';
import '../styles/repaso-pro.css';

type Opciones = { cursoId:string; n:number; cursoTitulo:string; claseTitulo:string; portadaCurso?:string; notas?:Nota; siguienteTitulo?:string; onContinuar():void; onCerrar?():void };
export async function abrirJuegoClase(o:Opciones):Promise<boolean> {
  document.querySelector<HTMLDialogElement>('[data-lesson-game]')?.close();
  const uid=Auth.usuario?.uid || 'demo';
  const key=`odt:partida-v2:${uid}:${o.cursoId}:${o.n}`;
  const ruta=`/juegos-clase/${encodeURIComponent(o.cursoId)}/${o.n}`;
  const d=document.createElement('dialog');d.className='repaso-pro';d.dataset.lessonGame=`${o.cursoId}:${o.n}`;d.setAttribute('aria-label','Repaso de la clase');
  const focoAnterior=document.activeElement as HTMLElement|null;
  document.body.append(d);d.innerHTML='<div class="rp-loading"><p role="status">Recuperando tu partida…</p><button type="button" data-rp="cerrar">Cerrar</button></div>';d.showModal();
  let partida:any,g:JuegoClase,estado:any,eventos:any[]=[],seleccion:number|null=null,cartas:string[]=[],ancla:number[]|null=null,guia=false;
  let timer:ReturnType<typeof setTimeout>|undefined,closed=false,continuar=false,reiniciando=false,cola=Promise.resolve(),error='',guardado='Preparando…';
  const vigente=()=>!closed && (Datos.modo!=='api'||Auth.usuario?.uid===uid);
  const boton=(texto:string,accion:string,extra='')=>`<button type="button" data-rp="${accion}" ${extra}>${texto}</button>`;
  function cache(){try{localStorage.setItem(key,JSON.stringify({id:partida.id,version:VERSION_JUEGOS,juego:g,eventos,revision:partida.revision,finalizada:partida.finalizada}));}catch{}}
  async function iniciar(reiniciar=false){
    error='';guardado='Recuperando tu partida…';
    if(Datos.modo==='api')partida=await api(ruta+'/iniciar',{method:'POST',json:{reiniciar}});
    else {const juego=crearJuegoClase(o.cursoId,o.n,o.notas,o.cursoTitulo,o.claseTitulo,o.portadaCurso);if(!juego)throw Error('Este repaso necesita contenido adicional. Puedes continuar con el curso.');partida={id:crypto.randomUUID(),juego,eventos:[],revision:0,finalizada:false};}
    if(!vigente())return;
    g=partida.juego;eventos=[...partida.eventos];
    try{const local=JSON.parse(localStorage.getItem(key)||'null');if(!reiniciar && local?.version===VERSION_JUEGOS && (Datos.modo!=='api'||local.id===partida.id) && local.eventos.length>=eventos.length && JSON.stringify(local.eventos.slice(0,eventos.length))===JSON.stringify(eventos)){reproducirPartida(g,local.eventos);eventos=local.eventos;}}catch{}
    estado=reproducirPartida(g,eventos);seleccion=null;cartas=[];ancla=null;guardado=Datos.modo==='api'?'Partida recuperada de tu cuenta':'Demostración · guardado en este navegador';
    if(g.tipo==='rompecabezas')await new Promise<void>((resolve,reject)=>{const img=new Image();const limite=setTimeout(()=>reject(Error('La imagen tardó demasiado. Revisa tu conexión y vuelve a abrir el repaso.')),20000);img.onload=()=>{clearTimeout(limite);resolve();};img.onerror=()=>{clearTimeout(limite);reject(Error('No se pudo cargar la imagen del repaso. Vuelve a intentarlo.'));};img.src=g.imagen;});
    pintar();if(eventos.length>partida.eventos.length || (estado.terminada&&!partida.finalizada))programar();
  }
  function programar(){clearTimeout(timer);timer=setTimeout(()=>{void guardar();},450);}
  function guardar(){
    cola=cola.then(async()=>{
      if(Datos.modo!=='api'){partida.finalizada=estado.terminada;cache();guardado='Guardado en este navegador';if(vigente())pintar();return;}
      if(Auth.usuario?.uid!==uid)return;
      const copia=structuredClone(eventos), final=reproducirPartida(g,copia).terminada;
      guardado='Guardando en tu cuenta…';if(vigente())actualizarEstado();
      try{
        const r:any=await api(ruta+(final?'':'/partida'),{method:final?'POST':'PUT',json:{partidaId:partida.id,revision:partida.revision,eventos:copia}});
        if(Auth.usuario?.uid!==uid)return;
        partida.revision=r.revision;partida.finalizada=r.finalizada;cache();error='';guardado='Guardado en tu cuenta';
        if(final){registrarJuegoClaseRemoto(r.juego);if(r.recompensas)window.dispatchEvent(new CustomEvent('recompensas:ganadas',{detail:r.recompensas}));}
      }catch(e:any){error=e.message||'No se pudo guardar.';guardado='Guardado pendiente · tus jugadas siguen en este dispositivo';}
      if(vigente())pintar();
    });return cola;
  }
  function mover(a:any){try{const nuevo=[...eventos,a];estado=reproducirPartida(g,nuevo);eventos=nuevo;cache();guardado='Guardado pendiente';error='';pintar();programar();}catch(e:any){error=e.message;pintar();}}
  function actualizarEstado(){const x=d.querySelector('[data-rp-status]');if(x)x.textContent=guardado;}
  function pintar(){
    if(!vigente())return;
    const activo=document.activeElement as HTMLElement|null;
    const foco=activo&&d.contains(activo)?{...activo.dataset}:null;
    const tableroScroll=d.querySelector('.rp-board-scroll')?.scrollLeft||0;
    const meta=INFO_TIPO_JUEGO[g.tipo];
    let contenido='';
    if(estado.terminada){
      const score=estado.puntaje;
      contenido=`<section class="rp-result"><span class="rp-medal">${score>=70?'✦':'↻'}</span><h2>${score>=70?'Repaso completado':'Repaso terminado: sigamos practicando'}</h2><div class="rp-score"><strong>${score}</strong><span>puntos de práctica / 100</span></div><p>La puntuación considera aciertos, errores y ayudas. No es una calificación clínica ni modifica tu certificado.</p><div class="rp-stats"><span><b>${estado.aciertos}</b>Aciertos</span><span><b>${estado.errores}</b>Errores</span><span><b>${estado.ayudas}</b>Ayudas</span></div><h3>Para llevarte de esta clase</h3>${g.terminos.slice(0,2).map(t=>`<article><strong>${esc(t.etiqueta)}</strong><p>${esc(t.pista)}</p></article>`).join('')}<p>Los OdonCoins de participación se entregan una sola vez por clase, al confirmar el guardado.</p><div class="rp-actions">${boton('Practicar otra vez','reiniciar')}${boton(o.siguienteTitulo?'Siguiente clase':'Ver cierre del curso','continuar',partida.finalizada?'':'disabled')}</div></section>`;
    }else if(g.tipo==='rompecabezas'){
      contenido=`<p>Toca una pieza y después otra para intercambiarlas.</p><div class="rp-actions">${boton(guia?'Ocultar guía':'Ver imagen guía','guia')}${boton('Acomodar una pieza','ayuda')}</div>${guia?`<img class="rp-reference" src="${esc(g.imagen)}" alt="Imagen completa para guiar el rompecabezas">`:''}<p class="rp-progress">${estado.aciertos} de 16 piezas en su lugar</p><div class="rp-puzzle">${estado.orden.map((id:number,pos:number)=>`<button type="button" data-rp="pieza" data-i="${pos}" class="${seleccion===pos?'selected':''}" aria-label="Pieza ${pos+1}${seleccion===pos?', seleccionada':''}" aria-pressed="${seleccion===pos}" style="background-image:url('${esc(g.imagen)}');background-position:${(id%4)*100/3}% ${Math.floor(id/4)*100/3}%"><span>${id===pos?'✓':pos+1}</span></button>`).join('')}</div>`;
    }else if(g.tipo==='sopa'){
      const pista=eventos.at(-1)?.tipo==='ayuda'?g.sopa.palabras.find(p=>!estado.encontradas.includes(p.id))?.celdas[0]:null;
      contenido=`<p>Toca la primera y la última letra. Puedes desplazar el tablero horizontalmente.</p><div class="rp-terms">${g.sopa.palabras.map(p=>`<span class="${estado.encontradas.includes(p.id)?'done':''}">${esc(p.etiqueta)}</span>`).join('')}</div>${boton('Señalar el inicio de una palabra','ayuda')}<div class="rp-board-scroll" tabindex="0" aria-label="Tablero desplazable"><div class="rp-soup" style="grid-template-columns:repeat(${g.sopa.columnas},36px)">${g.sopa.matriz.flatMap((fila,f)=>fila.map((letra,c)=>{const coord=`${f}:${c}`;const found=g.sopa.palabras.some(p=>estado.encontradas.includes(p.id)&&p.celdas.includes(coord));return `<button type="button" data-rp="celda" data-f="${f}" data-c="${c}" class="${found?'found':''} ${ancla?.[0]===f&&ancla?.[1]===c||pista===coord?'selected':''}" aria-label="Fila ${f+1}, columna ${c+1}: ${letra}">${letra}</button>`;})).join('')}</div></div><details><summary>Leer las pistas completas</summary>${g.sopa.palabras.map(p=>`<p><b>${esc(p.etiqueta)}:</b> ${esc(p.pista)}</p>`).join('')}</details>`;
    }else if(g.tipo==='ahorcado'){
      const p=g.ahorcado[estado.ronda],won=[...p.palabra].every(l=>estado.letras.includes(l)),ended=won||estado.fallosRonda>=6;
      contenido=`<p class="rp-progress">Concepto ${estado.ronda+1} de ${g.ahorcado.length} · ${6-estado.fallosRonda} intentos disponibles</p><article class="rp-clue">${esc(p.pistaOculta)}</article><div class="rp-word" aria-label="Término por descubrir">${[...p.palabra].map(l=>`<span>${ended||estado.letras.includes(l)?l:'·'}</span>`).join('')}</div>${ended?`<article><h3>${won?'Concepto identificado':'Vamos a reforzarlo'}</h3><p><b>${esc(p.etiqueta)}.</b> ${esc(p.pista)}</p></article>${boton(estado.ronda+1<g.ahorcado.length?'Siguiente concepto':'Ver mi resultado','siguiente')}`:`${boton('Revelar una letra','ayuda')}<div class="rp-keyboard">${[...'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'].map(l=>boton(l,'letra',`data-letra="${l}" ${estado.letras.includes(l)?'disabled':''}`)).join('')}</div>`}`;
    }else if(g.tipo==='memorama'){
      contenido=`<p>Relaciona un concepto con su idea. Puedes leer sin límite de tiempo.</p><p class="rp-progress">${estado.pares.length} de ${g.memorama.length/2} parejas</p><div class="rp-memory">${g.memorama.map((c,i)=>{const done=estado.pares.includes(c.parId),visible=done||cartas.includes(c.uid);return `<button type="button" data-rp="carta" data-id="${c.uid}" ${done?'disabled':''} class="${visible?'flipped':''}" aria-label="${visible?esc(c.texto):`Voltear tarjeta ${i+1}`}" aria-pressed="${visible}">${visible?`<small>${c.tipo==='termino'?'CONCEPTO':'IDEA DE LA CLASE'}</small><span>${esc(c.texto)}</span>`:`<b>✦</b><span>Tarjeta ${i+1}</span>`}</button>`;}).join('')}</div>${cartas.length===2?boton('Seguir buscando','voltear'):''}`;
    }else{
      const p=g.retosPalabra[estado.ronda];const usados:Record<string,number>={};
      contenido=`<p class="rp-progress">Concepto ${estado.ronda+1} de ${g.retosPalabra.length}</p><article class="rp-clue">${esc(p.pistaOculta)}</article><div class="rp-word" aria-label="Respuesta">${[...p.palabra].map((_,i)=>`<span>${estado.palabra[i]||'·'}</span>`).join('')}</div><div class="rp-actions">${boton('Borrar letra','borrar',!estado.palabra?'disabled':'')}${boton('Colocar una letra','ayuda',estado.palabra===p.palabra?'disabled':'')}</div><div class="rp-keyboard">${p.letrasBarajadas.map(x=>{usados[x.letra]=(usados[x.letra]||0)+1;const disabled=usados[x.letra]<=[...estado.palabra].filter((l:string)=>l===x.letra).length;return boton(x.letra,'letra',`data-letra="${x.letra}" ${disabled?'disabled':''}`);}).join('')}</div>${boton('Comprobar respuesta','comprobar',estado.palabra.length===p.palabra.length?'':'disabled')}`;
    }
    d.innerHTML=`<header class="rp-header"><div><small>ODONTECK · REPASO DE CLASE</small><h2>${esc(meta.etiqueta)}</h2><p>Clase ${o.n}${o.claseTitulo.toLowerCase().trim()===`clase ${o.n}`?'':` · ${esc(o.claseTitulo)}`}</p></div>${boton('×','cerrar','aria-label="Guardar y cerrar repaso"')}</header><div class="rp-body">${contenido}${estado.mensaje?`<p class="rp-feedback" role="status">${esc(estado.mensaje)}</p>`:''}</div><footer class="rp-footer"><span data-rp-status role="status">${guardado}</span>${error?`<p role="alert">${esc(error)}</p>${boton('Reintentar guardado','guardar')}${boton('Recuperar partida de mi cuenta','recuperar')}`:''}</footer>`;
    if(foco?.rp){const bs=[...d.querySelectorAll<HTMLButtonElement>('[data-rp]')];const mismo=bs.find(b=>!b.disabled&&Object.entries(foco).every(([k,v])=>b.dataset[k]===v));(mismo||bs.find(b=>!b.disabled&&b.dataset.rp===foco.rp)||d.querySelector<HTMLButtonElement>('[data-rp="continuar"], [data-rp="siguiente"]'))?.focus({preventScroll:true});}
    const tablero=d.querySelector('.rp-board-scroll');if(tablero)tablero.scrollLeft=tableroScroll;
  }
  d.addEventListener('click',async e=>{
    const b=(e.target as HTMLElement).closest<HTMLElement>('[data-rp]');if(!b)return;
    const a=b.dataset.rp;
    if(a==='cerrar'){d.close();return;}
    if(reiniciando)return;
    if(a==='guardar'){await guardar();return;}
    if(a==='continuar'){if(!partida.finalizada)return;continuar=true;d.close();o.onContinuar();return;}
    if(a==='reiniciar'||a==='recuperar'){reiniciando=true;guardado='Recuperando partida…';actualizarEstado();clearTimeout(timer);await cola;try{if(a==='recuperar')localStorage.removeItem(key);await iniciar(a==='reiniciar');}catch(e:any){error=e.message;pintar();}finally{reiniciando=false;}return;}
    if(a==='guia'){guia=!guia;pintar();return;}
    if(a==='pieza'){const i=Number(b.dataset.i);if(seleccion===null){seleccion=i;pintar();}else if(seleccion===i){seleccion=null;pintar();}else{const x=seleccion;seleccion=null;mover({tipo:'cambiar',x,y:i});}return;}
    if(a==='celda'){const p=[Number(b.dataset.f),Number(b.dataset.c)];if(!ancla){ancla=p;pintar();}else{const start=ancla;ancla=null;const celdas=lineaEntreCeldas(start[0],start[1],p[0],p[1]);if(celdas.length>=2)mover({tipo:'buscar',celdas});else pintar();}return;}
    if(a==='carta'){if(cartas.length===2)return;const id=b.dataset.id!;if(cartas.includes(id))return;cartas.push(id);if(cartas.length===2){const [x,y]=cartas;const coinciden=g.memorama.find(c=>c.uid===x)?.parId===g.memorama.find(c=>c.uid===y)?.parId;if(coinciden)cartas=[];mover({tipo:'par',x,y});}else pintar();return;}
    if(a==='voltear'){cartas=[];pintar();return;}
    mover(a==='letra'?{tipo:a,letra:b.dataset.letra}:{tipo:a});
  });
  d.addEventListener('close',()=>{closed=true;clearTimeout(timer);if(partida){cache();void guardar();}d.remove();if(!continuar){o.onCerrar?.();focoAnterior?.isConnected&&focoAnterior.focus({preventScroll:true});}},{once:true});
  const cambio=()=>{if(Auth.usuario?.uid!==uid)d.close();};window.addEventListener('auth:cuenta-cambio',cambio);d.addEventListener('close',()=>window.removeEventListener('auth:cuenta-cambio',cambio),{once:true});
  try{await iniciar();}catch(e:any){if(vigente())d.innerHTML=`<div class="rp-body"><h2>No pudimos abrir el repaso</h2><p>${esc(e.message)}</p>${boton('Cerrar y volver a intentar','cerrar')}</div>`;}
  return true;
}
