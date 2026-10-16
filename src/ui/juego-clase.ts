import { createIcons, icons } from 'lucide';
import { crearJuegoClase, opcionesPulso, puntuarOrden, puntuarRelaciones, type JuegoClase } from '../core/juego-clase';
import type { Nota } from '../core/datos';
import { esc } from './partials';

const PROGRESO_KEY = 'odonteck-club:juegos-clase:v1';

type OpcionesJuego = {
  cursoId: string;
  n: number;
  cursoTitulo: string;
  claseTitulo: string;
  notas?: Nota;
  quizDisponible: boolean;
  siguienteTitulo?: string;
  onReto(): void;
  onContinuar(): void;
  onCerrar?(): void;
};

function guardarMejorPuntaje(clave: string, puntaje: number) {
  try {
    const datos = JSON.parse(localStorage.getItem(PROGRESO_KEY) || '{}');
    const actual = Number(datos?.[clave]?.mejorPuntaje || 0);
    datos[clave] = { mejorPuntaje: Math.max(actual, puntaje), fecha: new Date().toISOString() };
    localStorage.setItem(PROGRESO_KEY, JSON.stringify(datos));
  } catch {}
}

function cabecera(opciones: OpcionesJuego, juego: JuegoClase) {
  const nombres = {
    ordenar: ['Ruta del video', 'Reconstruye la secuencia en la que aparecieron los conceptos.'],
    relacionar: ['Conecta el minuto', 'Relaciona cada idea con el momento en que apareció.'],
    pulso: ['Pulso de memoria', 'Reconoce el concepto explicado en cada momento del video.'],
    rompecabezas: ['Idea en piezas', 'Reconstruye la idea central exactamente como apareció en tu clase.'],
  } as const;
  const [nombre, instruccion] = nombres[juego.tipo];
  return `<header class="lesson-game__hero">
    <div class="lesson-game__eyebrow"><i data-lucide="gamepad-2"></i>Misión de cierre · clase ${opciones.n}</div>
    <button type="button" class="lesson-game__close" data-game-close aria-label="Cerrar juego"><i data-lucide="x"></i></button>
    <div class="lesson-game__hero-copy"><span class="lesson-game__badge"><i data-lucide="sparkles"></i>Juego basado en esta clase</span><h2>${nombre}</h2><p>${instruccion}</p></div>
    <div class="lesson-game__lesson"><small>${esc(opciones.cursoTitulo)}</small><strong>${esc(opciones.claseTitulo)}</strong></div>
  </header>`;
}

function ordenarHTML(juego: JuegoClase, orden: string[]) {
  const porId = new Map(juego.conceptos.map((x) => [x.id, x]));
  return `<div class="lesson-game__board" data-game-board="ordenar">
    <div class="lesson-game__board-head"><span><b>Tu secuencia</b><small>Mueve las tarjetas hasta reconstruir el recorrido del video.</small></span><span class="lesson-game__counter">${orden.length} momentos</span></div>
    <ol class="lesson-game__timeline">${orden.map((id, indice) => {
      const concepto = porId.get(id)!;
      return `<li data-game-order="${id}"><span class="lesson-game__number">${String(indice + 1).padStart(2, '0')}</span><p>${esc(concepto.texto)}</p><div class="lesson-game__move"><button type="button" data-game-move="-1" ${indice === 0 ? 'disabled' : ''} aria-label="Subir concepto"><i data-lucide="chevron-up"></i></button><button type="button" data-game-move="1" ${indice === orden.length - 1 ? 'disabled' : ''} aria-label="Bajar concepto"><i data-lucide="chevron-down"></i></button></div></li>`;
    }).join('')}</ol>
  </div>`;
}

function relacionarHTML(juego: JuegoClase) {
  return `<div class="lesson-game__board" data-game-board="relacionar">
    <div class="lesson-game__board-head"><span><b>Mapa concepto-minuto</b><small>Elige una marca distinta para cada concepto.</small></span><span class="lesson-game__counter">${juego.conceptos.length} conexiones</span></div>
    <div class="lesson-game__matches">${juego.conceptos.map((concepto, indice) => `<label><span class="lesson-game__number">${String(indice + 1).padStart(2, '0')}</span><p>${esc(concepto.texto)}</p><select class="input" data-game-match="${concepto.id}" aria-label="Minuto para ${esc(concepto.texto)}"><option value="">Elegir minuto</option>${juego.tiempos.map((t) => `<option value="${esc(t)}">${esc(t)}</option>`).join('')}</select></label>`).join('')}</div>
  </div>`;
}

function pulsoHTML(juego: JuegoClase, indice: number, aciertos: number) {
  const concepto = juego.conceptos[indice];
  const opciones = opcionesPulso(juego, indice);
  return `<div class="lesson-game__board lesson-game__pulse" data-game-board="pulso">
    <div class="lesson-game__progress"><span style="width:${((indice + 1) / juego.conceptos.length) * 100}%"></span></div>
    <div class="lesson-game__board-head"><span><b>Ronda ${indice + 1} de ${juego.conceptos.length}</b><small>${aciertos} aciertos hasta ahora</small></span><span class="lesson-game__time"><i data-lucide="clock-3"></i>${esc(concepto.t)}</span></div>
    <h3>¿Qué concepto se trabaja en este momento?</h3>
    <div class="lesson-game__options">${opciones.map((opcion) => `<button type="button" data-game-option="${opcion.id}"><span></span>${esc(opcion.texto)}</button>`).join('')}</div>
  </div>`;
}

function rompecabezasHTML(juego: JuegoClase, orden: string[]) {
  const porId = new Map(juego.fragmentos.map((x) => [x.id, x]));
  return `<div class="lesson-game__board" data-game-board="rompecabezas">
    <div class="lesson-game__board-head"><span><b>Reconstruye la idea central</b><small>Ordena todas las piezas hasta recuperar el mensaje de la clase.</small></span><span class="lesson-game__time"><i data-lucide="clock-3"></i>${esc(juego.conceptos[0].t)}</span></div>
    <div class="lesson-game__puzzle" aria-label="Piezas de la idea central">${orden.map((id, indice) => `<div data-game-fragment="${id}"><span>${indice + 1}</span><p>${esc(porId.get(id)?.texto || '')}</p><div class="lesson-game__move"><button type="button" data-game-fragment-move="-1" ${indice === 0 ? 'disabled' : ''} aria-label="Mover fragmento a la izquierda"><i data-lucide="chevron-left"></i></button><button type="button" data-game-fragment-move="1" ${indice === orden.length - 1 ? 'disabled' : ''} aria-label="Mover fragmento a la derecha"><i data-lucide="chevron-right"></i></button></div></div>`).join('')}</div>
  </div>`;
}

function resultadoHTML(opciones: OpcionesJuego, puntaje: number) {
  const dominio = puntaje === 100 ? 'Ruta dominada' : puntaje >= 70 ? 'Buen recuerdo' : 'Misión completada';
  return `<section class="lesson-game__result" aria-live="polite">
    <span class="lesson-game__result-icon"><i data-lucide="${puntaje === 100 ? 'trophy' : 'badge-check'}"></i></span>
    <span class="lesson-game__eyebrow">Misión completada</span><h2>${dominio}</h2>
    <div class="lesson-game__score"><strong>${puntaje}%</strong><span>de la ruta reconstruida</span></div>
    <p>${puntaje === 100 ? 'Reconociste toda la secuencia de la clase.' : 'Ya activaste el recuerdo. Puedes repetir el juego para afianzar la secuencia.'}</p>
    <div class="lesson-game__result-actions"><button type="button" class="btn btn--secondary" data-game-retry><i data-lucide="rotate-ccw"></i>Jugar otra vez</button><button type="button" class="btn btn--brand" data-game-next>${opciones.quizDisponible ? '<i data-lucide="brain-circuit"></i>Continuar al reto clínico' : `<i data-lucide="arrow-right"></i>${opciones.siguienteTitulo ? 'Ir a la siguiente clase' : 'Volver al curso'}`}</button></div>
    <small><i data-lucide="shield-check"></i>Este juego es práctica de memoria; no sustituye la evaluación clínica revisada.</small>
  </section>`;
}

export function abrirJuegoClase(opciones: OpcionesJuego) {
  const juego = crearJuegoClase(opciones.cursoId, opciones.n, opciones.notas);
  if (!juego) return false;
  document.querySelector<HTMLDialogElement>('[data-lesson-game]')?.remove();

  const dialogo = document.createElement('dialog');
  dialogo.className = 'lesson-game';
  dialogo.dataset.lessonGame = juego.clave;
  let orden = [...juego.ordenInicial];
  let ordenFragmentos = [...juego.ordenFragmentos];
  let pulsoIndice = 0;
  let pulsoAciertos = 0;
  let accionFinal = false;

  const renderJuego = () => {
    const contenido = juego.tipo === 'ordenar' ? ordenarHTML(juego, orden)
      : juego.tipo === 'relacionar' ? relacionarHTML(juego)
      : juego.tipo === 'rompecabezas' ? rompecabezasHTML(juego, ordenFragmentos)
      : pulsoHTML(juego, pulsoIndice, pulsoAciertos);
    dialogo.innerHTML = `<div class="lesson-game__shell">${cabecera(opciones, juego)}<main class="lesson-game__content">${contenido}<div class="lesson-game__feedback" data-game-feedback aria-live="polite"></div>${juego.tipo !== 'pulso' ? '<button type="button" class="btn btn--brand lesson-game__check" data-game-check><i data-lucide="wand-sparkles"></i>Comprobar misión</button>' : ''}</main></div>`;
    createIcons({ icons, attrs: { 'aria-hidden': 'true' } });
  };

  const terminar = (puntaje: number) => {
    guardarMejorPuntaje(juego.clave, puntaje);
    window.dispatchEvent(new CustomEvent('juego-clase:completado', { detail: { cursoId: opciones.cursoId, n: opciones.n, puntaje, tipo: juego.tipo } }));
    dialogo.querySelector<HTMLElement>('.lesson-game__content')!.innerHTML = resultadoHTML(opciones, puntaje);
    createIcons({ icons, attrs: { 'aria-hidden': 'true' } });
  };

  dialogo.addEventListener('click', (evento) => {
    const boton = (evento.target as HTMLElement).closest<HTMLElement>('button');
    if (!boton) return;
    if (boton.matches('[data-game-close]')) { dialogo.close(); return; }
    if (boton.matches('[data-game-retry]')) { orden = [...juego.ordenInicial]; ordenFragmentos = [...juego.ordenFragmentos]; pulsoIndice = 0; pulsoAciertos = 0; renderJuego(); return; }
    if (boton.matches('[data-game-next]')) { accionFinal = true; dialogo.close(); opciones.quizDisponible ? opciones.onReto() : opciones.onContinuar(); return; }
    if (boton.matches('[data-game-move]')) {
      const fila = boton.closest<HTMLElement>('[data-game-order]');
      const desde = fila ? orden.indexOf(fila.dataset.gameOrder!) : -1;
      const hasta = desde + Number(boton.dataset.gameMove);
      if (desde >= 0 && hasta >= 0 && hasta < orden.length) [orden[desde], orden[hasta]] = [orden[hasta], orden[desde]];
      renderJuego();
      dialogo.querySelectorAll<HTMLElement>('[data-game-order]')[hasta]?.focus();
      return;
    }
    if (boton.matches('[data-game-fragment-move]')) {
      const pieza = boton.closest<HTMLElement>('[data-game-fragment]');
      const desde = pieza ? ordenFragmentos.indexOf(pieza.dataset.gameFragment!) : -1;
      const hasta = desde + Number(boton.dataset.gameFragmentMove);
      if (desde >= 0 && hasta >= 0 && hasta < ordenFragmentos.length) [ordenFragmentos[desde], ordenFragmentos[hasta]] = [ordenFragmentos[hasta], ordenFragmentos[desde]];
      renderJuego();
      dialogo.querySelectorAll<HTMLElement>('[data-game-fragment]')[hasta]?.focus();
      return;
    }
    if (boton.matches('[data-game-option]')) {
      const correcta = juego.conceptos[pulsoIndice].id;
      const acierto = boton.dataset.gameOption === correcta;
      if (acierto) pulsoAciertos += 1;
      dialogo.querySelectorAll<HTMLButtonElement>('[data-game-option]').forEach((opcion) => {
        opcion.disabled = true;
        if (opcion.dataset.gameOption === correcta) opcion.classList.add('is-correct');
        else if (opcion === boton) opcion.classList.add('is-wrong');
      });
      const feedback = dialogo.querySelector<HTMLElement>('[data-game-feedback]')!;
      feedback.className = `lesson-game__feedback is-visible ${acierto ? 'is-success' : 'is-review'}`;
      feedback.innerHTML = `<i data-lucide="${acierto ? 'check-circle-2' : 'scan-search'}"></i><span><b>${acierto ? '¡Conexión correcta!' : 'Buen intento: fija esta conexión.'}</b><small>${esc(juego.conceptos[pulsoIndice].t)} · ${esc(juego.conceptos[pulsoIndice].texto)}</small></span><button type="button" data-game-pulse-next>${pulsoIndice + 1 === juego.conceptos.length ? 'Ver resultado' : 'Siguiente ronda'}<i data-lucide="arrow-right"></i></button>`;
      createIcons({ icons, attrs: { 'aria-hidden': 'true' } });
      return;
    }
    if (boton.matches('[data-game-pulse-next]')) {
      pulsoIndice += 1;
      if (pulsoIndice >= juego.conceptos.length) terminar(Math.round((pulsoAciertos / juego.conceptos.length) * 100));
      else renderJuego();
      return;
    }
    if (boton.matches('[data-game-check]')) {
      if (juego.tipo === 'ordenar') { terminar(puntuarOrden(juego, orden)); return; }
      if (juego.tipo === 'rompecabezas') {
        const correctos = juego.fragmentos.reduce((total, fragmento, indice) => total + (ordenFragmentos[indice] === fragmento.id ? 1 : 0), 0);
        terminar(Math.round((correctos / juego.fragmentos.length) * 100));
        return;
      }
      const respuestas = Object.fromEntries([...dialogo.querySelectorAll<HTMLSelectElement>('[data-game-match]')].map((select) => [select.dataset.gameMatch!, select.value]));
      if (Object.values(respuestas).some((valor) => !valor)) {
        const feedback = dialogo.querySelector<HTMLElement>('[data-game-feedback]')!;
        feedback.className = 'lesson-game__feedback is-visible is-review';
        feedback.innerHTML = '<i data-lucide="circle-alert"></i><span><b>Completa todas las conexiones</b><small>Falta elegir al menos un minuto.</small></span>';
        createIcons({ icons, attrs: { 'aria-hidden': 'true' } });
        return;
      }
      terminar(puntuarRelaciones(juego, respuestas));
    }
  });
  dialogo.addEventListener('close', () => { dialogo.remove(); if (!accionFinal) opciones.onCerrar?.(); }, { once: true });
  document.body.append(dialogo);
  renderJuego();
  dialogo.showModal();
  return true;
}
