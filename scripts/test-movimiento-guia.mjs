import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
const require = createRequire(import.meta.url);
const ts = require('typescript');
const compiled = ts.transpileModule(readFileSync(new URL('../src/landing/movimiento-guia.ts', import.meta.url), 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const rigContext=vm.createContext({exports:{}});
vm.runInContext(ts.transpileModule(readFileSync(new URL('../src/landing/guia-capas.ts', import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,rigContext);
const rig=rigContext.exports;

const rutas = {
  saludo: '/asistente/odonteck-guia-saludo-v05.png',
  orientar: '/asistente/odonteck-guia-orientar-v05.png',
  celebrar: '/asistente/odonteck-guia-celebrar-v05.png',
};

function entorno({reducido=false,guardado=false,conDecode=false,alternancia='libre',aleatorios=[0]}={}) {
  class Elemento extends EventTarget {
    dataset={}; style={}; attrs={}; disabled=false; textContent=''; visible=true;
    innerHTML=''; rigs=new Map(); inserciones=0; aplicaciones=0;
    classList={valores:new Set(),add(...names){names.forEach(n=>this.valores.add(n));},remove(...names){names.forEach(n=>this.valores.delete(n));}};
    setAttribute(k,v){this.attrs[k]=v;} getAttribute(k){return this.attrs[k];}
    toggleAttribute(k,activo){
      if(activo)this.attrs[k]='';else delete this.attrs[k];
      if(this.personaje)assert.ok(visible(this.personaje).length<=1,'nunca superponer dos siluetas, ni durante el cambio');
      return activo;
    }
    getClientRects(){return this.visible ? [{}] : [];}
    insertAdjacentHTML(posicion,html){
      assert.equal(posicion,'beforeend');
      const postura=html.match(/data-guia-rig="([^"]+)"/)?.[1];
      assert.ok(postura,'cada SVG montado tiene una postura identificable');
      assert.equal(this.rigs.has(postura),false,'una postura no se remonta');
      const svg=new Elemento(),tag=html.slice(0,html.indexOf('>'));
      for(const [,k,v] of tag.matchAll(/([\w-]+)="([^"]*)"/g)) {
        svg.setAttribute(k,v);
        if(k.startsWith('data-')) svg.dataset[k.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=v;
      }
      if(/\shidden(?:\s|$)/.test(tag))svg.attrs.hidden='';
      this.rigs.set(postura,svg);svg.personaje=this;this.innerHTML+=html;this.inserciones++;
      assert.ok(visible(this).length<=1,'un PNG tardío se monta oculto');
    }
    querySelector(s){
      if(s.startsWith('[data-guia-rig='))return this.rigs.get(s.match(/="([^"]+)"/)?.[1])??null;
      if(s==='.guia-rig')return this.rigs.values().next().value??null;
      this.capas??={};
      return this.capas[s]??=(s.startsWith('[data-guia-icono=')?new Elemento():{setAttribute:(k,v)=>{this.attrs[s+':'+k]=v;}});
    }
  }
  const root=new Elemento(), personajes=[new Elemento(),new Elemento()], repetir=new Elemento(), pausa=new Elemento();
  root.dataset.guiaAlternancia=alternancia;
  root.querySelectorAll=s=>{assert.equal(s,'.mascot','solo se consultan personajes, no botones de postura');return personajes;};
  root.querySelector=s=>{assert.ok(['[data-guia-saludo]','[data-guia-pausa]'].includes(s));return s==='[data-guia-saludo]' ? repetir : pausa;};
  const media=new EventTarget();media.matches=reducido;
  const document=new EventTarget();document.hidden=false;
  const storage=new Map(guardado ? [['test:guia-pausada:v1','1']] : []);
  const timers=new Map(),imagenes=new Map(),decoders=new Map();let counter=0,now=0;
  class Imagen {
    constructor(){if(conDecode)this.decode=()=>new Promise((resolve,reject)=>decoders.set(this.src,{resolve,reject}));}
    set src(value){this.ruta=value;imagenes.set(value,this);}
    get src(){return this.ruta;}
  }
  class Reloj extends Date {static now(){return now;}}
  const matematicas=Object.create(Math);let indiceAleatorio=0;
  matematicas.random=()=>aleatorios[Math.min(indiceAleatorio++,aleatorios.length-1)];
  const rigObservado={...rig,aplicarPose:(svg,pose)=>{svg.aplicaciones++;rig.aplicarPose(svg,pose);}};
  const context=vm.createContext({exports:{},require:s=>s==='./guia-capas'?rigObservado:({marcaGuia:{id:'test',saludo:rutas.saludo,orientar:rutas.orientar,celebrar:rutas.celebrar}}),Image:Imagen,matchMedia:()=>media,document,sessionStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},Date:Reloj,Math:matematicas,CustomEvent,Event,setTimeout:(f,ms)=>{timers.set(++counter,{f,ms});return counter;},clearTimeout:id=>timers.delete(id)});
  vm.runInContext(compiled,context);context.exports.montarMovimientoGuia(root);
  return {root,personajes,repetir,pausa,media,document,storage,timers,imagenes,
    ahora:()=>now,salto:ms=>{now+=ms;},
    remontar:()=>context.exports.montarMovimientoGuia(root),
    load:(postura='saludo')=>imagenes.get(rutas[postura]).onload(),
    fail:(postura='saludo')=>imagenes.get(rutas[postura]).onerror(),
    decodificar:async postura=>{decoders.get(rutas[postura]).resolve();await Promise.resolve();},
    fallarDecode:async postura=>{decoders.get(rutas[postura]).reject(new Error('imagen inválida'));await Promise.resolve();},
    tick:()=>{const [id,item]=timers.entries().next().value;timers.delete(id);now+=item.ms;item.f();},
    click:el=>el.dispatchEvent(new Event('click')),
    estado:ocupado=>root.dispatchEvent(new CustomEvent('guia:estado',{detail:{ocupado}})),
    auto:detalle=>root.dispatchEvent(new CustomEvent('guia:postura',{detail:detalle}))};
}
test('recorre 72 fotogramas en orden y permite repetir el saludo',()=>{const e=entorno();e.load();for(let i=0;i<72;i++){assert.equal(e.root.dataset.guiaFrame,String(i));if(i<71)e.tick();}e.click(e.repetir);assert.equal(e.root.dataset.guiaFrame,'0');assert.equal(e.root.dataset.guiaEstado,'saludo');});
test('pausa detiene temporizadores y persiste sin tocar conversación',()=>{const e=entorno();e.load();e.click(e.pausa);assert.equal(e.root.dataset.guiaEstado,'pausada');assert.equal(e.timers.size,0);assert.equal(e.storage.get('test:guia-pausada:v1'),'1');assert.equal(e.storage.size,1);e.click(e.pausa);assert.equal(e.timers.size,1);});
test('respeta pausa guardada',()=>{const e=entorno({guardado:true});e.load();assert.equal(e.root.dataset.guiaEstado,'pausada');assert.equal(e.timers.size,0);});
test('iconos SVG de pausa y reproducir reflejan el estado y conservan las etiquetas accesibles',()=>{const e=entorno();e.load();const pause=e.pausa.querySelector('[data-guia-icono="pause"]'),play=e.pausa.querySelector('[data-guia-icono="play"]');const comprobar=pausada=>{assert.equal('hidden' in pause.attrs,pausada);assert.equal('hidden' in play.attrs,!pausada);assert.equal(e.pausa.getAttribute('aria-pressed'),String(pausada));assert.equal(e.pausa.getAttribute('aria-label'),pausada?'Reanudar animación de Alexia':'Pausar animación de Alexia');};comprobar(false);e.click(e.pausa);comprobar(true);e.estado(true);comprobar(true);e.estado(false);comprobar(true);e.click(e.pausa);comprobar(false);const guardada=entorno({guardado:true});guardada.load();assert.equal('hidden' in guardada.pausa.querySelector('[data-guia-icono="play"]').attrs,false);});
test('movimiento reducido estático y cambios de preferencia en vivo',()=>{const e=entorno({reducido:true});e.load();assert.equal(e.root.dataset.guiaEstado,'reducido');assert.equal(e.timers.size,0);assert.equal(e.pausa.disabled,true);e.media.matches=false;e.media.dispatchEvent(new Event('change'));assert.equal(e.timers.size,1);e.media.matches=true;e.media.dispatchEvent(new Event('change'));assert.equal(e.timers.size,0);});
test('pestaña oculta no anima; al volver reanuda',()=>{const e=entorno();e.load();e.document.hidden=true;e.document.dispatchEvent(new Event('visibilitychange'));assert.equal(e.timers.size,0);e.document.hidden=false;e.document.dispatchEvent(new Event('visibilitychange'));assert.equal(e.timers.size,1);});
test('espera y respuesta reaccionan al estado del asistente',()=>{const e=entorno();e.load();e.estado(true);assert.equal(e.root.dataset.guiaEstado,'espera');assert.equal(e.repetir.disabled,true);e.estado(false);assert.equal(e.root.dataset.guiaEstado,'respuesta');assert.equal(e.repetir.disabled,false);});
test('fallo de imagen conserva el PNG anterior y deshabilita controles',()=>{const e=entorno();e.fail();assert.equal(e.root.dataset.guiaEstado,'error');assert.equal(e.personajes[0].classList.valores.size,0);assert.equal(e.repetir.disabled,true);assert.equal(e.pausa.disabled,true);assert.equal(e.timers.size,0);});
test('montaje repetido no duplica los listeners ni invierte dos veces la pausa',()=>{const e=entorno();e.load();e.remontar();e.click(e.pausa);assert.equal(e.storage.get('test:guia-pausada:v1'),'1');assert.equal(e.timers.size,0);});
test('SVG no recorta cabeza ni cabello; solo separa mano y solapa el puño',()=>{const e=entorno();e.load();const html=e.personajes[0].innerHTML;assert.ok(!html.includes('-cabeza'));assert.ok(html.includes('viewBox="-70 -25 1167 1582"'));assert.ok(html.includes('L430 575'));assert.ok(html.includes('-puno'));assert.notEqual(html,e.personajes[1].innerHTML);});
test('las curvas empiezan y terminan en neutro sin valores no finitos',()=>{for(const gesto of ['reposo','saludo','espera','respuesta']){for(const t of [0,3])for(const v of Object.values(rig.poseGuia(t,gesto)))assert.ok(Math.abs(v)<1e-10);for(let i=0;i<72;i++)for(const v of Object.values(rig.poseGuia(i/24,gesto)))assert.ok(Number.isFinite(v));}});

function visible(personaje) {
  return [...personaje.rigs].filter(([,svg])=>!('hidden' in svg.attrs)).map(([nombre])=>nombre);
}

function terminarTransicion(e) {
  for(let i=0;i<2 && (e.root.classList.valores.has('guia-postura-salida') || e.root.classList.valores.has('guia-postura-entrada'));i++)e.tick();
  assert.equal(e.root.classList.valores.has('guia-postura-salida'),false);
  assert.equal(e.root.classList.valores.has('guia-postura-entrada'),false);
}

test('carga desordenada de variantes no selecciona postura ni inicia otro temporizador',()=>{
  const e=entorno();
  assert.equal(e.imagenes.size,3);
  e.load('celebrar');
  assert.equal(e.repetir.disabled,true);
  assert.equal(e.timers.size,0);
  assert.deepEqual(visible(e.personajes[0]),[]);
  e.load();e.tick();
  const frame=e.root.dataset.guiaFrame,temporizador=[...e.timers.keys()];
  e.load('orientar');
  assert.equal(e.root.dataset.guiaPostura,'saludo');
  assert.equal(e.root.dataset.guiaFrame,frame);
  assert.deepEqual([...e.timers.keys()],temporizador);
  e.personajes.forEach(p=>assert.deepEqual(visible(p),['saludo']));
  assert.equal(e.repetir.disabled,false);
});

test('eventos seleccionan un único SVG y repetir recupera el saludo original sin botones de postura',()=>{
  const e=entorno();
  e.auto({postura:'orientar'});assert.equal(e.root.dataset.guiaPostura,'saludo');
  e.load();e.load('orientar');e.load('celebrar');e.tick();
  for(const nombre of ['orientar','celebrar']){
    e.auto({postura:nombre});terminarTransicion(e);
    assert.equal(e.root.dataset.guiaPostura,nombre);
    assert.equal(e.root.dataset.guiaFrame,'0');
    e.personajes.forEach(p=>assert.deepEqual(visible(p),[nombre]));
    assert.equal(e.timers.size,1);
  }
  e.click(e.repetir);terminarTransicion(e);
  assert.equal(e.root.dataset.guiaPostura,'saludo');
  assert.equal(e.root.dataset.guiaFrame,'0');
  e.personajes.forEach(p=>assert.deepEqual(visible(p),['saludo']));
});

test('variante tardía o fallida conserva SVG activo y controles del saludo',()=>{
  const e=entorno();e.load();e.load('orientar');e.auto({postura:'orientar'});terminarTransicion(e);e.tick();
  const frame=e.root.dataset.guiaFrame,temporizador=[...e.timers.keys()];
  e.load('celebrar');
  assert.equal(e.root.dataset.guiaPostura,'orientar');
  assert.equal(e.root.dataset.guiaFrame,frame);
  assert.deepEqual([...e.timers.keys()],temporizador);
  e.personajes.forEach(p=>assert.deepEqual(visible(p),['orientar']));
  const fallida=entorno();fallida.load();fallida.fail('orientar');
  assert.equal(fallida.repetir.disabled,false);
  assert.equal(fallida.pausa.disabled,false);
  assert.equal(fallida.root.dataset.guiaEstado,'saludo');
  assert.equal(fallida.timers.size,1);
  fallida.auto({postura:'orientar'});
  assert.equal(fallida.root.dataset.guiaPostura,'saludo');
  fallida.load('celebrar');fallida.auto({postura:'celebrar'});terminarTransicion(fallida);
  assert.equal(fallida.root.dataset.guiaPostura,'celebrar');
});

test('si falla la base las variantes no eliminan el PNG de respaldo ni habilitan el motor',()=>{
  const e=entorno();e.load('orientar');e.fail();e.load('celebrar');
  assert.equal(e.root.dataset.guiaEstado,'error');
  assert.equal(e.timers.size,0);
  e.personajes.forEach(p=>{
    assert.equal(p.classList.valores.has('motion-ready'),false);
    assert.deepEqual(visible(p),[]);
  });
  assert.equal(e.repetir.disabled,true);
  assert.equal(e.pausa.disabled,true);
});

test('pausa durante carga impide selección, cambios tardíos y temporizadores extra',()=>{
  const e=entorno();e.load();e.click(e.pausa);e.load('orientar');e.load('celebrar');
  e.auto({postura:'orientar'});e.click(e.repetir);
  assert.equal(e.root.dataset.guiaPostura,'saludo');
  assert.equal(e.root.dataset.guiaEstado,'pausada');
  assert.equal(e.timers.size,0);
  assert.equal(e.repetir.disabled,true);
  e.click(e.pausa);e.auto({postura:'orientar'});terminarTransicion(e);
  assert.equal(e.root.dataset.guiaPostura,'orientar');
  assert.equal(e.timers.size,1);
});

test('movimiento reducido conserva la postura estática y bloquea controles de gesto',()=>{
  const e=entorno({reducido:true});e.load();e.load('orientar');e.load('celebrar');
  e.auto({postura:'celebrar'});e.click(e.pausa);
  assert.equal(e.root.dataset.guiaPostura,'saludo');
  assert.equal(e.timers.size,0);
  assert.equal(e.repetir.disabled,true);
  e.media.matches=false;e.media.dispatchEvent(new Event('change'));e.auto({postura:'celebrar'});terminarTransicion(e);
  e.media.matches=true;e.media.dispatchEvent(new Event('change'));
  assert.equal(e.root.dataset.guiaPostura,'celebrar');
  assert.equal(e.root.dataset.guiaEstado,'reducido');
  assert.equal(e.root.dataset.guiaFrame,'0');
  assert.equal(e.timers.size,0);
  e.personajes.forEach(p=>assert.deepEqual(visible(p),['celebrar']));
});

test('precarga espera a decode y no cambia el gesto cuando termina una variante',async()=>{
  const e=entorno({conDecode:true});e.load();
  assert.equal(e.personajes[0].inserciones,0);
  assert.equal(e.pausa.disabled,true);
  await e.decodificar('saludo');e.tick();
  const frame=e.root.dataset.guiaFrame,temporizador=[...e.timers.keys()];
  e.load('orientar');assert.equal(e.personajes[0].rigs.has('orientar'),false);
  await e.decodificar('orientar');
  assert.equal(e.personajes[0].rigs.has('orientar'),true);
  assert.equal(e.root.dataset.guiaPostura,'saludo');
  assert.equal(e.root.dataset.guiaFrame,frame);
  assert.deepEqual([...e.timers.keys()],temporizador);
  e.load('celebrar');await e.fallarDecode('celebrar');
  assert.equal(e.personajes[0].rigs.has('celebrar'),false);
  assert.equal(e.pausa.disabled,false);
  assert.equal(e.timers.size,1);
});

test('fallo de decode base conserva respaldo y una carga posterior no lo revive',async()=>{
  const e=entorno({conDecode:true});e.load();await e.fallarDecode('saludo');
  e.load('orientar');await e.decodificar('orientar');
  assert.equal(e.root.dataset.guiaEstado,'error');
  assert.equal(e.timers.size,0);
  assert.equal(e.personajes[0].classList.valores.has('motion-ready'),false);
  assert.equal(e.repetir.disabled,true);
});

test('los SVG se montan una vez, tienen IDs únicos y solo se aplica pose al activo',()=>{
  const e=entorno();e.load();e.load('orientar');e.load('celebrar');
  const saludo=e.personajes[0].rigs.get('saludo');
  const orientar=e.personajes[0].rigs.get('orientar'),celebrar=e.personajes[0].rigs.get('celebrar');
  e.tick();assert.equal(orientar.aplicaciones,0);assert.equal(celebrar.aplicaciones,0);
  const aplicacionesSaludo=saludo.aplicaciones;
  e.auto({postura:'orientar'});terminarTransicion(e);for(let i=0;i<71;i++)e.tick();
  assert.equal(saludo.aplicaciones,aplicacionesSaludo);
  assert.equal(orientar.aplicaciones,72);
  assert.equal(celebrar.aplicaciones,0);
  const html=e.personajes.map(p=>p.innerHTML).join('');
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(ids.length,new Set(ids).size);
  e.load();e.load('orientar');e.load('celebrar');e.remontar();
  e.personajes.forEach(p=>assert.equal(p.inserciones,3));
  assert.equal(e.imagenes.size,3);
  assert.equal(e.timers.size,1);
});

test('espera y respuesta conservan postura durante el gesto sin duplicar el reloj',()=>{
  const e=entorno();e.load();e.load('orientar');e.auto({postura:'orientar'});terminarTransicion(e);
  e.estado(true);
  assert.equal(e.repetir.disabled,true);
  assert.equal(e.root.dataset.guiaPostura,'orientar');
  e.estado(false);
  for(let i=0;i<71;i++){
    assert.equal(e.timers.size,1);
    e.tick();assert.equal(e.root.dataset.guiaPostura,'orientar');
  }
  e.click(e.pausa);
  assert.equal(e.timers.size,0);
});

test('curvas de las tres posturas son finitas y empiezan y terminan en neutro',()=>{
  for(const postura of Object.keys(rutas))for(const gesto of ['reposo','saludo','espera','respuesta']){
    for(const t of [0,3])for(const v of Object.values(rig.poseGuia(t,gesto,postura)))assert.ok(Math.abs(v)<1e-10);
    for(let i=0;i<72;i++)for(const v of Object.values(rig.poseGuia(i/24,gesto,postura)))assert.ok(Number.isFinite(v));
  }
});

test('las tres posturas usan curvas distintas y no repiten la animación original',()=>{
  for(const gesto of ['reposo','saludo','espera','respuesta'])for(const [a,b] of [['saludo','orientar'],['saludo','celebrar'],['orientar','celebrar']]){
    let distancia=0;
    for(let i=0;i<72;i++){
      const primera=rig.poseGuia(i/24,gesto,a),segunda=rig.poseGuia(i/24,gesto,b);
      for(const campo of ['mano','cuerpo','desplazamiento'])distancia+=(primera[campo]-segunda[campo])**2;
    }
    assert.ok(distancia>1e-4,`${a} y ${b} tienen movimiento propio para ${gesto}`);
  }
});

test('evento automático usa salida y entrada de110ms sin superposición ni remonte',()=>{
  const e=entorno();e.load();e.load('orientar');e.load('celebrar');e.tick();
  const frame=e.root.dataset.guiaFrame,html=e.personajes.map(p=>p.innerHTML);
  e.auto({postura:'orientar'});
  assert.equal(e.root.classList.valores.has('guia-postura-salida'),true);
  assert.equal(e.root.dataset.guiaPostura,'saludo');
  assert.equal(e.root.dataset.guiaFrame,frame);
  assert.equal(e.timers.size,1);
  assert.equal([...e.timers.values()][0].ms,110);
  assert.equal(e.repetir.disabled,true);
  assert.equal(e.pausa.disabled,false);
  e.personajes.forEach(p=>assert.deepEqual(visible(p),['saludo']));
  e.tick();
  assert.equal(e.root.classList.valores.has('guia-postura-salida'),false);
  assert.equal(e.root.classList.valores.has('guia-postura-entrada'),true);
  assert.equal(e.root.dataset.guiaPostura,'orientar');
  assert.equal(e.root.dataset.guiaFrame,'0');
  assert.equal(e.root.dataset.guiaEstado,'saludo');
  assert.equal([...e.timers.values()][0].ms,110);
  e.personajes.forEach(p=>assert.deepEqual(visible(p),['orientar']));
  e.tick();
  assert.equal(e.root.classList.valores.has('guia-postura-entrada'),false);
  assert.equal(e.root.dataset.guiaFrame,'0');
  assert.equal(e.timers.size,1);
  assert.equal([...e.timers.values()][0].ms,1000/24);
  assert.equal(e.repetir.disabled,false);
  assert.deepEqual(e.personajes.map(p=>p.innerHTML),html);
  e.tick();assert.equal(e.root.dataset.guiaFrame,'1');
});

test('payload automático inválido no cambia postura, fotograma ni temporizador',()=>{
  const e=entorno();e.load();e.load('orientar');e.tick();
  const frame=e.root.dataset.guiaFrame,temporizador=[...e.timers.keys()];
  for(const detalle of [undefined,null,false,42,'orientar',[],{}, {postura:null},{postura:42},{postura:'inexistente'},{postura:'Orientar'}])e.auto(detalle);
  e.root.dispatchEvent(new Event('guia:postura'));
  assert.equal(e.root.dataset.guiaPostura,'saludo');
  assert.equal(e.root.dataset.guiaFrame,frame);
  assert.deepEqual([...e.timers.keys()],temporizador);
  assert.equal(e.root.classList.valores.size,0);
});

test('pausa, reduced, ocupado y pestaña oculta bloquean automático sin aplazar la selección',()=>{
  for(const guardia of ['pausa','reducido','ocupada','oculta']){
    const e=entorno();e.load();e.load('orientar');
    if(guardia==='pausa')e.click(e.pausa);
    if(guardia==='reducido'){e.media.matches=true;e.media.dispatchEvent(new Event('change'));}
    if(guardia==='ocupada')e.estado(true);
    if(guardia==='oculta'){e.document.hidden=true;e.document.dispatchEvent(new Event('visibilitychange'));}
    const frame=e.root.dataset.guiaFrame,temporizador=[...e.timers.keys()];
    e.auto({postura:'orientar'});
    assert.equal(e.root.dataset.guiaPostura,'saludo',guardia);
    assert.equal(e.root.dataset.guiaFrame,frame,guardia);
    assert.deepEqual([...e.timers.keys()],temporizador,guardia);
    assert.equal(e.root.classList.valores.size,0,guardia);
    if(guardia==='pausa')e.click(e.pausa);
    if(guardia==='reducido'){e.media.matches=false;e.media.dispatchEvent(new Event('change'));}
    if(guardia==='ocupada')e.estado(false);
    if(guardia==='oculta'){e.document.hidden=false;e.document.dispatchEvent(new Event('visibilitychange'));}
    assert.equal(e.root.dataset.guiaPostura,'saludo','desbloquear no ejecuta un evento pasado');
    assert.equal(e.timers.size,1);
  }
});

test('evento previo a carga o decode no se ejecuta tarde ni habilita una variante fallida',async()=>{
  const e=entorno({conDecode:true});e.auto({postura:'orientar'});
  e.load();await e.decodificar('saludo');e.tick();
  e.auto({postura:'orientar'});
  const frame=e.root.dataset.guiaFrame,temporizador=[...e.timers.keys()];
  e.load('orientar');e.auto({postura:'orientar'});await e.decodificar('orientar');
  assert.equal(e.root.dataset.guiaPostura,'saludo');
  assert.equal(e.root.dataset.guiaFrame,frame);
  assert.deepEqual([...e.timers.keys()],temporizador);
  e.load('celebrar');await e.fallarDecode('celebrar');e.auto({postura:'celebrar'});
  assert.equal(e.root.dataset.guiaPostura,'saludo');
  assert.equal(e.root.classList.valores.size,0);
  assert.deepEqual([...e.timers.keys()],temporizador);
  e.auto({postura:'orientar'});terminarTransicion(e);
  assert.equal(e.root.dataset.guiaPostura,'orientar','solo un evento nuevo puede elegir la cargada');
});

test('cancelación de ambas fases conserva el SVG visible y anula callbacks obsoletos',()=>{
  for(const fase of ['salida','entrada'])for(const motivo of ['pausa','reducido','oculta','ocupada']){
    const e=entorno();e.load();e.load('orientar');e.auto({postura:'orientar'});
    if(fase==='entrada')e.tick();
    const obsoleto=[...e.timers.values()][0].f,postura=e.root.dataset.guiaPostura;
    if(motivo==='pausa')e.click(e.pausa);
    if(motivo==='reducido'){e.media.matches=true;e.media.dispatchEvent(new Event('change'));}
    if(motivo==='oculta'){e.document.hidden=true;e.document.dispatchEvent(new Event('visibilitychange'));}
    if(motivo==='ocupada')e.estado(true);
    assert.equal(e.root.classList.valores.has('guia-postura-salida'),false,`${fase}/${motivo}`);
    assert.equal(e.root.classList.valores.has('guia-postura-entrada'),false,`${fase}/${motivo}`);
    assert.equal(e.root.dataset.guiaPostura,postura);
    e.personajes.forEach(p=>assert.deepEqual(visible(p),[postura]));
    const temporizador=[...e.timers.keys()],frame=e.root.dataset.guiaFrame;
    assert.equal(e.timers.size,motivo==='ocupada'?1:0);
    obsoleto();
    assert.equal(e.root.dataset.guiaPostura,postura);
    assert.equal(e.root.dataset.guiaFrame,frame);
    assert.deepEqual([...e.timers.keys()],temporizador,'callback cancelado no revive el motor');
  }
});

test('eventos de estado repetidos no reinician transición ni fotogramas al repintar',()=>{
  const e=entorno();e.load();e.load('orientar');e.estado(true);e.estado(false);e.auto({postura:'orientar'});
  const salida=[...e.timers.keys()];
  for(let i=0;i<10;i++)e.estado(false);
  assert.deepEqual([...e.timers.keys()],salida);
  assert.equal(e.root.classList.valores.has('guia-postura-salida'),true);
  terminarTransicion(e);for(let i=0;i<5;i++)e.tick();
  const frame=e.root.dataset.guiaFrame,temporizador=[...e.timers.keys()];
  for(let i=0;i<10;i++)e.estado(false);
  e.remontar();
  assert.equal(e.root.dataset.guiaFrame,frame);
  assert.equal(e.root.dataset.guiaPostura,'orientar');
  assert.deepEqual([...e.timers.keys()],temporizador);
});

test('carga adicional no cambia el reloj y el último contexto válido tiene prioridad sin timers dobles',()=>{
  const e=entorno();e.load();e.load('orientar');e.auto({postura:'orientar'});
  const temporizador=[...e.timers.keys()],obsoleto=[...e.timers.values()][0].f;
  e.load('celebrar');
  assert.deepEqual([...e.timers.keys()],temporizador);
  e.auto({postura:'celebrar'});e.click(e.repetir);
  const nuevo=[...e.timers.keys()];
  assert.notDeepEqual(nuevo,temporizador);
  assert.equal(e.timers.size,1);
  obsoleto();assert.deepEqual([...e.timers.keys()],nuevo);
  assert.equal(e.root.dataset.guiaPostura,'saludo');
  terminarTransicion(e);
  assert.equal(e.root.dataset.guiaPostura,'celebrar');
  assert.equal(e.timers.size,1);
  assert.equal(e.personajes[0].inserciones,3);
});

test('automático neutral usa respuesta suave y orientar/celebrar usan su gesto completo',()=>{
  const e=entorno();e.load();e.load('orientar');e.load('celebrar');
  for(const nombre of ['orientar','celebrar','saludo']){
    e.auto({postura:nombre});terminarTransicion(e);
    assert.equal(e.root.dataset.guiaPostura,nombre);
    assert.equal(e.root.dataset.guiaEstado,nombre==='saludo'?'respuesta':'saludo');
    assert.equal(e.timers.size,1);
    e.tick();
  }
});

test('una respuesta nueva en la misma postura reproduce sin transición ni cambiar de SVG',()=>{
  const e=entorno();e.load();e.load('orientar');e.auto({postura:'orientar'});terminarTransicion(e);
  for(let i=0;i<5;i++)e.tick();
  const html=e.personajes.map(p=>p.innerHTML);
  e.auto({postura:'orientar'});
  assert.equal(e.root.dataset.guiaPostura,'orientar');
  assert.equal(e.root.dataset.guiaFrame,'0');
  assert.equal(e.root.classList.valores.size,0);
  assert.equal(e.timers.size,1);
  assert.deepEqual(e.personajes.map(p=>p.innerHTML),html);
});

function hastaSalidaIdle(e) {
  let ticks=0;
  while(!e.root.classList.valores.has('guia-postura-salida')){
    assert.equal(e.timers.size,1,'solo un timer, incluso en el reposo aleatorio');
    assert.ok(ticks++<1500,'se alcanza el próximo intervalo sin un loop infinito');
    e.tick();
  }
  return e.ahora();
}

function avanzarHasta(e,limite) {
  let ticks=0;
  while(e.timers.size && e.ahora()+[...e.timers.values()][0].ms<=limite){
    assert.ok(ticks++<1500,'el motor termina el recorrido acotado');
    assert.equal(e.timers.size,1);
    e.tick();
  }
}

test('idle inicia la alternancia tras un intervalo aleatorio entre12 y20s, no cada3s',()=>{
  for(const [random,esperado] of [[0,12000],[.5,16000],[.999999,20000]]){
    const e=entorno({aleatorios:[random]});e.load();e.load('orientar');e.load('celebrar');
    avanzarHasta(e,11999);
    assert.equal(e.root.dataset.guiaPostura,'saludo');
    assert.equal(e.root.classList.valores.has('guia-postura-salida'),false);
    const salida=hastaSalidaIdle(e);
    // El reloj acumula fracciones de24fps; el despertar mínimo de1ms permite ese redondeo.
    assert.ok(Math.abs(salida-esperado)<=1.01,`random ${random}: salida ${salida}, esperado ${esperado}`);
    assert.equal(e.root.dataset.guiaPostura,'saludo','la silueta cambia solo al completar la salida');
    terminarTransicion(e);
    assert.notEqual(e.root.dataset.guiaPostura,'saludo');
    assert.equal(e.timers.size,1);
  }
});

test('idle elige una postura distinta de la actual y mantiene intervalos propios y un solo reloj',()=>{
  const e=entorno({aleatorios:[.2,.9,.1,.1,.5,.9,.7,.1,.2,.9]});e.load();e.load('orientar');e.load('celebrar');
  let anterior=e.root.dataset.guiaPostura,ultimoCambio=0;
  const elegidas=new Set([anterior]);
  for(let i=0;i<8;i++){
    const salida=hastaSalidaIdle(e);
    const intervalo=salida-ultimoCambio;
    assert.ok(intervalo>=12000-1.01 && intervalo<=20000+1.01,`intervalo ${intervalo}`);
    e.tick();ultimoCambio=e.ahora();
    const siguiente=e.root.dataset.guiaPostura;
    assert.notEqual(siguiente,anterior);
    elegidas.add(siguiente);anterior=siguiente;
    e.tick();assert.equal(e.timers.size,1);
  }
  assert.equal(elegidas.size,3,'las tres posturas pueden participar sin repetición consecutiva');
});

test('una variante fallida nunca entra en el sorteo y onload tardío no selecciona ni reinicia el deadline',()=>{
  const e=entorno({aleatorios:[.9]});e.load();e.fail('celebrar');
  avanzarHasta(e,11900);
  const frame=e.root.dataset.guiaFrame,temporizador=[...e.timers.keys()];
  e.load('orientar');
  assert.equal(e.root.dataset.guiaPostura,'saludo');
  assert.equal(e.root.dataset.guiaFrame,frame);
  assert.deepEqual([...e.timers.keys()],temporizador);
  for(let i=0;i<4;i++){
    hastaSalidaIdle(e);terminarTransicion(e);
    assert.notEqual(e.root.dataset.guiaPostura,'celebrar');
  }
});

test('sin alternativas cargadas el motor espera otro intervalo y no entra en cambios vacíos',()=>{
  const e=entorno();e.load();
  avanzarHasta(e,25000);
  assert.equal(e.root.dataset.guiaPostura,'saludo');
  assert.equal(e.root.classList.valores.size,0);
  assert.equal(e.timers.size,1);
  e.load('orientar');
  assert.equal(e.root.classList.valores.size,0,'terminar la carga no cambia la postura');
  hastaSalidaIdle(e);terminarTransicion(e);
  assert.equal(e.root.dataset.guiaPostura,'orientar');
});

test('contexto neutral bloquea todo idle hasta una nueva respuesta positiva',()=>{
  const e=entorno();e.load();e.load('orientar');e.load('celebrar');e.auto({postura:'celebrar'});terminarTransicion(e);
  e.auto({postura:'saludo'});terminarTransicion(e);
  assert.equal(e.root.dataset.guiaAlternancia,'neutral');
  avanzarHasta(e,e.ahora()+60000);
  assert.equal(e.root.dataset.guiaPostura,'saludo');
  assert.equal(e.root.dataset.guiaEstado,'reposo');
  assert.equal(e.timers.size,0,'neutral no mantiene ciclos positivos ni despertares innecesarios');
  e.salto(60000);e.load('orientar');e.load('celebrar');e.estado(false);
  assert.equal(e.timers.size,0,'carga y repintado no desbloquean neutral');
  e.auto({postura:'orientar'});terminarTransicion(e);
  assert.equal(e.root.dataset.guiaAlternancia,'libre');
  assert.equal(e.root.dataset.guiaPostura,'orientar');
  assert.equal(e.timers.size,1);
  hastaSalidaIdle(e);terminarTransicion(e);
  assert.notEqual(e.root.dataset.guiaPostura,'orientar');
});

test('historial restaurado neutral arranca estático y cargar variantes no reanima una respuesta antigua',()=>{
  const e=entorno({alternancia:'neutral'});e.load('celebrar');e.load();e.load('orientar');
  assert.equal(e.root.dataset.guiaPostura,'saludo');
  assert.equal(e.root.dataset.guiaAlternancia,'neutral');
  assert.equal(e.root.dataset.guiaEstado,'reposo');
  assert.equal(e.root.dataset.guiaFrame,'0');
  assert.equal(e.timers.size,0);
  e.salto(120000);e.estado(false);e.remontar();
  assert.equal(e.timers.size,0);
  e.personajes.forEach(p=>assert.deepEqual(visible(p),['saludo']));
});

test('override alternar boolean permite bienvenida y preserva neutralidad con información sin verificar',()=>{
  const e=entorno({alternancia:'neutral'});e.load();e.load('orientar');e.load('celebrar');
  e.auto({postura:'saludo',alternar:true});
  assert.equal(e.root.dataset.guiaAlternancia,'libre');
  hastaSalidaIdle(e);terminarTransicion(e);
  assert.notEqual(e.root.dataset.guiaPostura,'saludo');
  e.auto({postura:'orientar',alternar:false});terminarTransicion(e);
  assert.equal(e.root.dataset.guiaAlternancia,'neutral');
  avanzarHasta(e,e.ahora()+60000);
  assert.equal(e.root.dataset.guiaPostura,'orientar');
  assert.equal(e.timers.size,0);
  e.auto({postura:'orientar',alternar:'false'});
  assert.equal(e.root.dataset.guiaAlternancia,'libre','override inválido usa el default por postura');
  e.auto({postura:'saludo',alternar:'true'});terminarTransicion(e);
  assert.equal(e.root.dataset.guiaAlternancia,'neutral');
});

test('nuevo contexto renueva deadline y repintados repetidos no lo aplazan',()=>{
  const e=entorno();e.load();e.load('orientar');e.load('celebrar');
  avanzarHasta(e,9000);
  const evento=e.ahora();e.auto({postura:'orientar'});terminarTransicion(e);
  for(let i=0;i<15;i++)e.estado(false);
  assert.ok(Math.abs(hastaSalidaIdle(e)-(evento+12000))<1e-6);
  terminarTransicion(e);
  assert.equal(e.timers.size,1);
});

test('idle no alterna ocupado, pausado, oculto o reduced y reanudar concede un intervalo nuevo',()=>{
  for(const guardia of ['pausa','reducido','oculta','ocupada']){
    const e=entorno();e.load();e.load('orientar');e.load('celebrar');
    avanzarHasta(e,9000);
    if(guardia==='pausa')e.click(e.pausa);
    if(guardia==='reducido'){e.media.matches=true;e.media.dispatchEvent(new Event('change'));}
    if(guardia==='oculta'){e.document.hidden=true;e.document.dispatchEvent(new Event('visibilitychange'));}
    if(guardia==='ocupada'){e.estado(true);avanzarHasta(e,e.ahora()+45000);}
    else e.salto(45000);
    assert.equal(e.root.dataset.guiaPostura,'saludo',guardia);
    assert.equal(e.root.classList.valores.size,0,guardia);
    const reanudar=e.ahora();
    if(guardia==='pausa')e.click(e.pausa);
    if(guardia==='reducido'){e.media.matches=false;e.media.dispatchEvent(new Event('change'));}
    if(guardia==='oculta'){e.document.hidden=false;e.document.dispatchEvent(new Event('visibilitychange'));}
    if(guardia==='ocupada'){e.estado(false);e.auto({postura:'saludo',alternar:true});}
    assert.ok(Math.abs(hastaSalidaIdle(e)-(reanudar+12000))<1e-6,guardia);
  }
});

test('neutral recibido bloqueada normaliza saludo estático solo al desbloquear, sin gesto atrasado',()=>{
  for(const bloqueo of ['pausa','oculta','reducido','ocupada']){
    const e=entorno();e.load();e.load('orientar');e.load('celebrar');e.auto({postura:'celebrar'});terminarTransicion(e);
    if(bloqueo==='pausa')e.click(e.pausa);
    if(bloqueo==='oculta'){e.document.hidden=true;e.document.dispatchEvent(new Event('visibilitychange'));}
    if(bloqueo==='reducido'){e.media.matches=true;e.media.dispatchEvent(new Event('change'));}
    if(bloqueo==='ocupada')e.estado(true);
    e.auto({postura:'saludo',alternar:false});
    assert.equal(e.root.dataset.guiaPostura,'celebrar','el PNG no cambia durante bloqueo');
    assert.equal(e.root.dataset.guiaAlternancia,'neutral');
    if(bloqueo==='pausa')e.click(e.pausa);
    if(bloqueo==='oculta'){e.document.hidden=false;e.document.dispatchEvent(new Event('visibilitychange'));}
    if(bloqueo==='reducido'){e.media.matches=false;e.media.dispatchEvent(new Event('change'));}
    if(bloqueo==='ocupada')e.estado(false);
    assert.equal(e.root.dataset.guiaPostura,'saludo',bloqueo);
    assert.equal(e.root.dataset.guiaEstado,'reposo',bloqueo);
    assert.equal(e.root.dataset.guiaFrame,'0');
    assert.equal(e.root.classList.valores.size,0);
    assert.equal(e.timers.size,0,'no se reproduce un gesto positivo ni neutral pendiente');
    e.personajes.forEach(p=>assert.deepEqual(visible(p),['saludo']));
  }
});
