import { createIcons, icons } from 'lucide';
import {
  crearJuegoClase,
  lineaEntreCeldas,
  registrarJuegoClaseRemoto,
  type RegistroJuegoClase,
  type JuegoClase,
  type TipoJuegoClase,
} from '../core/juego-clase';
import type { Nota } from '../core/datos';
import type { PremioRecompensas } from '../core/recompensas';
import { esc } from './partials';

const PROGRESO_KEY = 'odonteck-club:juegos-clase:v1';
const ALFABETO = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');

type OpcionesJuego = {
  cursoId: string;
  n: number;
  cursoTitulo: string;
  claseTitulo: string;
  portadaCurso?: string;
  notas?: Nota;
  siguienteTitulo?: string;
  onCompletar?(puntaje: number, tipo: TipoJuegoClase): Promise<{ juego: RegistroJuegoClase; recompensas?: PremioRecompensas }>;
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

const META_JUEGO: Record<TipoJuegoClase, { etiqueta: string; titulo: string; descripcion: string; icono: string }> = {
  rompecabezas: {
    etiqueta: 'Rompecabezas visual',
    titulo: 'Reconstruye la imagen',
    descripcion: 'Intercambia 16 piezas para completar la imagen.',
    icono: 'puzzle',
  },
  sopa: {
    etiqueta: 'Sopa de letras',
    titulo: 'Encuentra los conceptos clave',
    descripcion: 'Encuentra tres conceptos de esta clase.',
    icono: 'grid-3x3',
  },
  ahorcado: {
    etiqueta: 'El ahorcado clínico',
    titulo: 'Descubre el término oculto',
    descripcion: 'Descubre dos términos a partir de sus pistas.',
    icono: 'scan-search',
  },
  memorama: {
    etiqueta: 'Memorama clínico',
    titulo: 'Conecta cada concepto con su idea',
    descripcion: 'Une tres conceptos con sus ideas clave.',
    icono: 'layers',
  },
  palabra: {
    etiqueta: 'Palabra secreta',
    titulo: 'Ordena las letras del concepto',
    descripcion: 'Ordena las letras de dos conceptos.',
    icono: 'spell-check',
  },
};

function escudoDentalSVG(errores: number, maxErrores: number) {
  const restantes = Math.max(0, maxErrores - errores);
  const estado = restantes >= 5 ? 'optimal' : restantes >= 3 ? 'warning' : 'danger';
  const segmentos = Array.from({ length: maxErrores }, (_, i) => i < restantes);
  return `<div class="hangman-visual hangman-visual--${estado}" aria-label="${restantes} de ${maxErrores} vidas disponibles">
    <svg viewBox="0 0 120 120" class="hangman-visual__svg" aria-hidden="true">
      <defs>
        <linearGradient id="toothGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="100%" stop-color="#d8f6f0"/>
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="52" class="hangman-visual__ring-bg"/>
      <circle cx="60" cy="60" r="52" class="hangman-visual__ring-fill" stroke-dasharray="${Math.round((restantes / maxErrores) * 326)} 326"/>
      <path d="M40 36 C32 36 28 45 30 56 C32 66 36 72 38 84 C40 92 45 94 48 86 C51 78 54 74 60 74 C66 74 69 78 72 86 C75 94 80 92 82 84 C84 72 88 66 90 56 C92 45 88 36 80 36 C73 36 67 40 60 40 C53 40 47 36 40 36 Z" fill="url(#toothGrad)" stroke="currentColor" stroke-width="3"/>
      ${errores >= 1 ? '<path d="M48 42 L55 52" class="hangman-visual__crack"/>' : ''}
      ${errores >= 2 ? '<path d="M55 52 L49 62" class="hangman-visual__crack"/>' : ''}
      ${errores >= 3 ? '<path d="M72 43 L64 55" class="hangman-visual__crack"/>' : ''}
      ${errores >= 4 ? '<path d="M64 55 L70 67" class="hangman-visual__crack"/>' : ''}
      ${errores >= 5 ? '<path d="M55 52 L64 55" class="hangman-visual__crack"/>' : ''}
      ${errores >= 6 ? '<path d="M44 74 L76 74" class="hangman-visual__crack"/>' : ''}
    </svg>
    <div class="hangman-visual__meta">
      <strong>${restantes} de ${maxErrores} vidas</strong>
      <div class="hangman-visual__pips">
        ${segmentos.map((activo) => `<span class="${activo ? 'is-on' : 'is-off'}"></span>`).join('')}
      </div>
    </div>
  </div>`;
}

function resultadoHTML(opciones: OpcionesJuego, juego: JuegoClase, puntaje: number) {
  const meta = META_JUEGO[juego.tipo];
  const idea = juego.terminos[0];
  return `<section class="lesson-game__result lesson-game__result--simple" aria-live="polite">
    <div class="game-result__medal"><span class="lesson-game__result-icon"><i data-lucide="sparkles"></i></span><span class="game-result__orbit" aria-hidden="true"></span></div>
    <span class="lesson-game__eyebrow">${meta.etiqueta} · Clase ${opciones.n}</span>
    <h2>¡Buen repaso!</h2>
    <p class="game-result__lesson">${esc(opciones.claseTitulo)}</p>
    <div class="game-result__score" role="img" aria-label="Precisión del repaso: ${puntaje} por ciento" style="--score:${puntaje}%"><strong>${puntaje}%</strong><span>precisión</span></div>
    ${idea ? `<p class="lesson-game__result-takeaway"><strong>${esc(idea.etiqueta)}:</strong> ${esc(idea.pistaCorta)}</p>` : ''}
    <button type="button" class="btn btn--brand" data-game-next><i data-lucide="arrow-right"></i>${opciones.siguienteTitulo ? 'Siguiente clase' : 'Terminar curso'}</button>
  </section>`;
}

export function abrirJuegoClase(opciones: OpcionesJuego) {
  const juego = crearJuegoClase(
    opciones.cursoId,
    opciones.n,
    opciones.notas,
    opciones.cursoTitulo,
    opciones.claseTitulo,
    opciones.portadaCurso,
  );
  if (!juego) return false;
  document.querySelector<HTMLDialogElement>('[data-lesson-game]')?.remove();

  const dialogo = document.createElement('dialog');
  dialogo.className = 'lesson-game';
  dialogo.dataset.lessonGame = juego.clave;

  const tipo = juego.tipo;
  dialogo.dataset.gameType = tipo;
  const meta = META_JUEGO[tipo];
  let accionFinal = false;

  // ── 1. Estado Rompecabezas Visual (16 piezas) ──
  let ordenPiezas = [...juego.rompecabezasImagen.ordenInicial];
  let piezaSeleccionadaPos: number | null = null;
  let mostrarGuia = false;
  let movimientosPuzzle = 0;
  let pistasPuzzle = 0;
  let puzzleCompletado = false;

  // ── 2. Estado Sopa de Letras ──
  const encontradasSopa = new Set<string>();
  let celdaInicioSopa: { f: number; c: number } | null = null;
  let celdasSeleccionSopa: string[] = [];
  let arrastrandoSopa = false;
  let celdaPistaSopa: string | null = null;
  let pistasUsadasSopa = 0;

  // ── 3. Estado El Ahorcado ──
  const MAX_ERRORES = 6;
  let rondaAhorcado = 0;
  let letrasProbadas = new Set<string>();
  let erroresAhorcado = 0;
  let aciertosRondas = 0;
  let pistasAhorcado = 0;

  // ── 4. Estado Memorama ──
  const paresResueltos = new Set<string>();
  let volteadas: string[] = [];
  let bloqueadoMemorama = false;
  let intentosMemorama = 0;

  // ── 5. Estado Arma la Palabra ──
  let rondaPalabra = 0;
  let fichasElegidas: string[] = []; // IDs de letrasBarajadas
  let pistasPalabra = 0;

  let guardandoResultado = false;
  let puntajePendiente: number | null = null;
  const terminar = async (puntaje: number) => {
    if (guardandoResultado) return;
    guardandoResultado = true;
    puntajePendiente = puntaje;
    if (opciones.onCompletar) {
      dialogo.innerHTML = `<div class="lesson-game__shell lesson-game__shell--result"><section class="lesson-game__result lesson-game__result--simple" role="status" aria-live="polite"><span class="lesson-game__result-icon"><i data-lucide="cloud-upload"></i></span><h2>Guardando tu repaso…</h2><p class="game-result__lesson">Tus puntos se añadirán a tu perfil.</p></section></div>`;
      createIcons({ icons, attrs: { 'aria-hidden': 'true' } });
      try {
        const guardado = await opciones.onCompletar(puntaje, tipo);
        registrarJuegoClaseRemoto(guardado.juego);
        if (guardado.recompensas) window.dispatchEvent(new CustomEvent('recompensas:ganadas', { detail: guardado.recompensas }));
      } catch {
        guardandoResultado = false;
        dialogo.innerHTML = `<div class="lesson-game__shell lesson-game__shell--result"><button type="button" class="lesson-game__close" data-game-close aria-label="Cerrar juego"><i data-lucide="x"></i></button><section class="lesson-game__result lesson-game__result--simple" role="alert"><span class="lesson-game__result-icon"><i data-lucide="cloud-off"></i></span><h2>No se guardó todavía</h2><p class="game-result__lesson">Conservamos tu resultado en esta pantalla. Reintenta para guardar el avance y los puntos en tu perfil.</p><button type="button" class="btn btn--brand" data-game-save-retry><i data-lucide="rotate-cw"></i>Reintentar guardado</button></section></div>`;
        createIcons({ icons, attrs: { 'aria-hidden': 'true' } });
        return;
      }
    } else {
      guardarMejorPuntaje(juego.clave, puntaje);
    }
    window.dispatchEvent(new CustomEvent('juego-clase:completado', {
      detail: { cursoId: opciones.cursoId, n: opciones.n, puntaje, tipo },
    }));
    dialogo.innerHTML = `<div class="lesson-game__shell lesson-game__shell--result">
      <button type="button" class="lesson-game__close" data-game-close aria-label="Cerrar juego"><i data-lucide="x"></i></button>
      ${resultadoHTML(opciones, juego, puntaje)}
    </div>`;
    guardandoResultado = false;
    puntajePendiente = null;
    createIcons({ icons, attrs: { 'aria-hidden': 'true' } });
  };

  // ── RENDER 1: ROMPECABEZAS VISUAL CON IMAGEN ──
  const renderRompecabezasImagen = () => {
    const { columnas, filas, piezas } = juego.rompecabezasImagen;
    const colocadasBien = ordenPiezas.filter((idPieza, pos) => idPieza === pos).length;
    const porcentaje = Math.round((colocadasBien / piezas.length) * 100);
    const conceptoDestacado = piezas[Math.min(piezas.length - 1, colocadasBien)]?.concepto || opciones.claseTitulo;

    return `<div class="game-layout game-layout--rompecabezas">
      <aside class="game-showcase">
        <div class="game-showcase__top">
          <span class="game-badge"><i data-lucide="${meta.icono}"></i>${meta.etiqueta} · Clase ${opciones.n}</span>
          <h2>${meta.titulo}</h2>
          <p>${meta.descripcion}</p>
        </div>

        <div class="puzzle-preview-card">
          <div class="puzzle-preview-card__head">
            <span><i data-lucide="image"></i>Imagen guía de la clase</span>
            <strong>${porcentaje}% armado</strong>
          </div>
          <div class="puzzle-preview-card__img">
            <img src="${esc(juego.imagen)}" alt="Vista previa de ${esc(opciones.claseTitulo)}">
          </div>
          <div class="puzzle-preview-card__actions">
            <button type="button" class="btn btn--secondary btn--sm ${mostrarGuia ? 'is-active' : ''}" data-puzzle-toggle-guide>
              <i data-lucide="eye"></i>${mostrarGuia ? 'Ocultar guía en tablero' : 'Ver guía en tablero'}
            </button>
            <button type="button" class="btn btn--secondary btn--sm" data-puzzle-img-hint ${puzzleCompletado ? 'disabled' : ''}>
              <i data-lucide="wand-sparkles"></i>Acomodar 1 pieza
            </button>
          </div>
        </div>

        <div class="game-takeaway">
          <span class="game-takeaway__label"><i data-lucide="sparkles"></i>Concepto desbloqueado (${colocadasBien}/${piezas.length})</span>
          <p>${esc(conceptoDestacado)}</p>
        </div>
      </aside>

      <section class="game-stage">
        <div class="game-stage__bar">
          <div class="game-stage__hint">
            <i data-lucide="hand"></i>
            <span>${piezaSeleccionadaPos !== null ? 'Ahora toca otra pieza para intercambiarlas de lugar' : 'Toca dos piezas para intercambiarlas (o arrástralas)'}</span>
          </div>
          <span class="game-pill">${colocadasBien} de ${piezas.length} en su sitio</span>
        </div>

        <div class="image-puzzle-board ${puzzleCompletado ? 'is-complete' : ''} ${mostrarGuia ? 'show-guide' : ''}" style="--puzzle-cols:${columnas};--puzzle-rows:${filas};--puzzle-img:url('${esc(juego.imagen)}')">
          ${ordenPiezas.map((indiceReal, posActual) => {
            const pieza = piezas[indiceReal];
            const enSuSitio = indiceReal === posActual;
            const seleccionada = piezaSeleccionadaPos === posActual;
            const bgX = columnas > 1 ? (pieza.col / (columnas - 1)) * 100 : 0;
            const bgY = filas > 1 ? (pieza.fila / (filas - 1)) * 100 : 0;
            return `<button
              type="button"
              draggable="${!enSuSitio && !puzzleCompletado}"
              class="image-puzzle-tile ${enSuSitio ? 'is-correct' : ''} ${seleccionada ? 'is-selected' : ''}"
              data-puzzle-pos="${posActual}"
              style="background-image:url('${esc(juego.imagen)}');background-size:${columnas * 100}% ${filas * 100}%;background-position:${bgX}% ${bgY}%"
              aria-label="Pieza en posición ${posActual + 1}${enSuSitio ? ', colocada correctamente' : ''}"
            >
              <span class="image-puzzle-tile__frame"></span>
              <span class="image-puzzle-tile__badge">${enSuSitio ? '<i data-lucide="check"></i>' : indiceReal + 1}</span>
            </button>`;
          }).join('')}
        </div>

        <div class="image-puzzle-strip">
          ${juego.terminos.slice(0, 2).map((t, idx) => {
            const piezasParaDesbloquear = Math.ceil(piezas.length * (idx + 1) / 3);
            const desbloqueado = colocadasBien >= piezasParaDesbloquear;
            return `<div class="image-puzzle-fact ${desbloqueado ? 'is-unlocked' : ''}">
              <span class="image-puzzle-fact__icon"><i data-lucide="${desbloqueado ? 'check-circle-2' : 'lock'}"></i></span>
              <div>
                <strong>${esc(t.etiqueta)}</strong>
                <small>${desbloqueado ? esc(t.pistaCorta) : 'Coloca más piezas para revelar esta clave'}</small>
              </div>
            </div>`;
          }).join('')}
        </div>
      </section>
    </div>`;
  };

  // ── RENDER 2: SOPA DE LETRAS CLÍNICA ──
  const renderSopa = () => {
    const { filas, columnas, matriz, palabras } = juego.sopa;
    const mapaCeldasEncontradas = new Map<string, number>();
    for (const p of palabras) {
      if (encontradasSopa.has(p.id)) {
        for (const coord of p.celdas) mapaCeldasEncontradas.set(coord, p.color);
      }
    }
    const seleccionSet = new Set(celdasSeleccionSopa);
    const letrasSeleccion = celdasSeleccionSopa
      .map((coord) => {
        const [f, c] = coord.split(':').map(Number);
        return matriz[f]?.[c] || '';
      })
      .join('');

    return `<div class="game-layout game-layout--sopa">
      <aside class="game-showcase">
        <div class="game-showcase__top">
          <span class="game-badge"><i data-lucide="${meta.icono}"></i>${meta.etiqueta} · Clase ${opciones.n}</span>
          <h2>${meta.titulo}</h2>
          <p>${meta.descripcion}</p>
        </div>

        <div class="game-showcase__photo">
          <img src="${esc(juego.imagen)}" alt="${esc(opciones.claseTitulo)}">
          <div class="game-showcase__photo-caption">
            <small>${esc(opciones.cursoTitulo)}</small>
            <strong>${esc(opciones.claseTitulo)}</strong>
          </div>
        </div>

        <div class="sopa-sidebar">
          <div class="sopa-sidebar__head">
            <strong>Conceptos por encontrar (${encontradasSopa.size}/${palabras.length})</strong>
            <button type="button" class="btn btn--secondary btn--sm" data-sopa-hint><i data-lucide="lightbulb"></i>Pista</button>
          </div>
          <ul class="sopa-wordlist">
            ${palabras.map((p) => {
              const hallada = encontradasSopa.has(p.id);
              return `<li class="sopa-wordcard ${hallada ? `is-found is-color-${p.color}` : ''}" data-sopa-word="${p.id}">
                <div class="sopa-wordcard__top">
                  <strong class="sopa-wordcard__term">${esc(p.palabra)}</strong>
                  <span class="sopa-wordcard__badge">${hallada ? '<i data-lucide="check"></i> Hallada' : `${p.palabra.length} letras`}</span>
                </div>
                <p class="sopa-wordcard__clue">${esc(p.pista)}</p>
              </li>`;
            }).join('')}
          </ul>
        </div>
      </aside>

      <section class="game-stage">
        <div class="game-stage__bar">
          <div class="sopa-selection-pill ${letrasSeleccion ? 'is-selecting' : ''}" data-sopa-preview>
            <i data-lucide="sparkles"></i>
            <span>${letrasSeleccion ? `Seleccionando: <strong>${letrasSeleccion}</strong>` : 'Arrastra con el mouse o toca la primera y la última letra'}</span>
          </div>
          <span class="game-pill">${encontradasSopa.size} / ${palabras.length} palabras</span>
        </div>

        <div class="sopa-board-wrap">
          <div class="sopa-grid" style="--sopa-cols:${columnas};--sopa-rows:${filas}" role="grid" aria-label="Tablero de sopa de letras">
            ${matriz.map((fila, f) => fila.map((letra, c) => {
              const coord = `${f}:${c}`;
              const colorEncontrado = mapaCeldasEncontradas.get(coord);
              const enSeleccion = seleccionSet.has(coord);
              const esInicio = celdaInicioSopa?.f === f && celdaInicioSopa?.c === c;
              const esPista = celdaPistaSopa === coord;
              const clases = [
                'sopa-cell',
                colorEncontrado !== undefined ? `is-found is-color-${colorEncontrado}` : '',
                enSeleccion ? 'is-selecting' : '',
                esInicio ? 'is-anchor' : '',
                esPista ? 'is-hint' : '',
              ].filter(Boolean).join(' ');
              return `<button type="button" class="${clases}" data-sopa-cell="${coord}" data-f="${f}" data-c="${c}" aria-label="Fila ${f + 1} columna ${c + 1}: ${letra}">${letra}</button>`;
            }).join('')).join('')}
          </div>
        </div>
      </section>
    </div>`;
  };

  // ── RENDER 3: EL AHORCADO CLÍNICO ──
  const renderAhorcado = () => {
    const totalRondas = juego.ahorcado.length;
    const actual = juego.ahorcado[rondaAhorcado];
    const letrasPalabra = actual.palabra.split('');
    const ganada = letrasPalabra.every((l) => letrasProbadas.has(l));
    const perdida = erroresAhorcado >= MAX_ERRORES && !ganada;
    const terminadaRonda = ganada || perdida;

    const pistaHTML = esc(actual.pistaOculta).replace(
      '_____',
      `<span class="hangman-clue__blank">${ganada || perdida ? esc(actual.etiqueta) : '_______'}</span>`,
    );

    return `<div class="game-layout game-layout--ahorcado">
      <section class="game-stage">
        <div class="game-stage__bar">
          <div class="hangman-rounds">
            <span> Concepto <strong>${rondaAhorcado + 1}</strong> de ${totalRondas}</span>
            <div class="hangman-dots">
              ${juego.ahorcado.map((_, i) => `<i class="${i < rondaAhorcado ? 'is-done' : i === rondaAhorcado ? 'is-current' : ''}"></i>`).join('')}
            </div>
          </div>
          ${escudoDentalSVG(erroresAhorcado, MAX_ERRORES)}
          ${!terminadaRonda ? `<button type="button" class="btn btn--secondary btn--sm" data-hangman-hint><i data-lucide="lightbulb"></i>Revelar 1 letra</button>` : ''}
        </div>

        <div class="hangman-clue">
          <span class="hangman-clue__label"><i data-lucide="stethoscope"></i>Pista tomada de la clase</span>
          <p>${pistaHTML}</p>
        </div>

        <div class="hangman-word" aria-label="Palabra de ${letrasPalabra.length} letras">
          ${letrasPalabra.map((letra) => {
            const visible = letrasProbadas.has(letra) || perdida;
            const reveladaPorPerdida = !letrasProbadas.has(letra) && perdida;
            return `<span class="hangman-slot ${visible ? 'is-revealed' : ''} ${reveladaPorPerdida ? 'is-missed' : ''}">${visible ? letra : ''}</span>`;
          }).join('')}
        </div>

        ${terminadaRonda ? `<div class="hangman-banner ${ganada ? 'is-win' : 'is-loss'}">
          <div class="hangman-banner__copy">
            <i data-lucide="${ganada ? 'check-circle-2' : 'info'}"></i>
            <div>
              <strong>${ganada ? `¡Excelente! Descubriste: ${esc(actual.etiqueta)}` : `El término correcto era: ${esc(actual.etiqueta)}`}</strong>
              <small>${esc(actual.pista)}</small>
            </div>
          </div>
          <button type="button" class="btn btn--brand" data-hangman-next>
            ${rondaAhorcado + 1 < totalRondas ? 'Siguiente palabra' : 'Ver resultado final'}
            <i data-lucide="arrow-right"></i>
          </button>
        </div>` : `<div class="hangman-keyboard" role="group" aria-label="Teclado de letras">
          ${ALFABETO.map((letra) => {
            const usada = letrasProbadas.has(letra);
            const acierto = usada && actual.palabra.includes(letra);
            const fallo = usada && !actual.palabra.includes(letra);
            return `<button type="button" class="hangman-key ${acierto ? 'is-hit' : ''} ${fallo ? 'is-miss' : ''}" data-hangman-key="${letra}" ${usada ? 'disabled' : ''}>${letra}</button>`;
          }).join('')}
        </div>`}
      </section>
    </div>`;
  };

  // ── RENDER 4: MEMORAMA CLÍNICO ILUSTRADO ──
  const renderMemorama = () => {
    const cartas = juego.memorama;
    const totalPares = Math.floor(cartas.length / 2);
    return `<div class="game-layout game-layout--memorama">
      <aside class="game-showcase">
        <div class="game-showcase__top">
          <span class="game-badge"><i data-lucide="${meta.icono}"></i>${meta.etiqueta} · Clase ${opciones.n}</span>
          <h2>${meta.titulo}</h2>
          <p>${meta.descripcion}</p>
        </div>

        <div class="game-showcase__photo">
          <img src="${esc(juego.imagen)}" alt="${esc(opciones.claseTitulo)}">
          <div class="game-showcase__photo-caption">
            <small>${esc(opciones.cursoTitulo)}</small>
            <strong>${esc(opciones.claseTitulo)}</strong>
          </div>
        </div>

        <div class="game-takeaway">
          <span class="game-takeaway__label"><i data-lucide="award"></i>Parejas encontradas: ${paresResueltos.size} de ${totalPares}</span>
          <p>Cada par une un término clave de la clase con su aplicación clínica directa.</p>
        </div>
      </aside>

      <section class="game-stage">
        <div class="game-stage__bar">
          <div class="game-stage__hint">
            <i data-lucide="Sparkles"></i>
            <span>Voltea dos cartas para encontrar cada pareja concepto–definición</span>
          </div>
          <span class="game-pill">${paresResueltos.size} / ${totalPares} pares · ${intentosMemorama} turnos</span>
        </div>

        <div class="memory-grid" role="list" aria-label="Cartas del memorama clínico">
          ${cartas.map((carta, idx) => {
            const resuelta = paresResueltos.has(carta.parId);
            const abierta = resuelta || volteadas.includes(carta.uid);
            return `<button
              type="button"
              class="memory-card ${abierta ? 'is-flipped' : ''} ${resuelta ? `is-matched is-color-${carta.color}` : ''}"
              data-memory-card="${carta.uid}"
              ${abierta || bloqueadoMemorama ? 'disabled' : ''}
              aria-label="Carta ${idx + 1}"
            >
              <div class="memory-card__inner">
                <div class="memory-card__front">
                  <span class="memory-card__num">0${idx + 1}</span>
                  <span class="memory-card__logo"><i data-lucide="sparkles"></i></span>
                  <small>OdonTeck Club</small>
                </div>
                <div class="memory-card__back is-type-${carta.tipo}">
                  <span class="memory-card__tag">
                    <i data-lucide="${carta.tipo === 'termino' ? 'ScanSearch' : 'Stethoscope'}"></i>
                    ${esc(carta.subtexto)}
                  </span>
                  <p class="${carta.tipo === 'termino' ? 'memory-card__term' : 'memory-card__def'}">${esc(carta.texto)}</p>
                  ${resuelta ? '<span class="memory-card__check"><i data-lucide="check"></i></span>' : ''}
                </div>
              </div>
            </button>`;
          }).join('')}
        </div>
      </section>
    </div>`;
  };

  // ── RENDER 5: ARMA LA PALABRA CLÍNICA ──
  const renderPalabra = () => {
    const total = juego.retosPalabra.length;
    const actual = juego.retosPalabra[rondaPalabra];
    const palabraFormada = fichasElegidas
      .map((id) => actual.letrasBarajadas.find((x) => x.id === id)?.letra || '')
      .join('');
    const completada = palabraFormada === actual.palabra;
    const llenaIncorrecta = fichasElegidas.length === actual.palabra.length && !completada;

    const pistaHTML = esc(actual.pistaOculta).replace(
      '_____',
      `<span class="hangman-clue__blank">${completada ? esc(actual.etiqueta) : '_______'}</span>`,
    );

    return `<div class="game-layout game-layout--palabra">
      <aside class="game-showcase">
        <div class="game-showcase__top">
          <span class="game-badge"><i data-lucide="${meta.icono}"></i>${meta.etiqueta} · Clase ${opciones.n}</span>
          <h2>${meta.titulo}</h2>
          <p>${meta.descripcion}</p>
        </div>

        <div class="game-showcase__photo">
          <img src="${esc(juego.imagen)}" alt="${esc(opciones.claseTitulo)}">
          <div class="game-showcase__photo-caption">
            <small>Reto ${rondaPalabra + 1} de ${total}</small>
            <strong>${esc(opciones.claseTitulo)}</strong>
          </div>
        </div>

        <div class="game-takeaway">
          <span class="game-takeaway__label"><i data-lucide="lightbulb"></i>Consejo</span>
          <p>Puedes tocar una casilla superior para devolver una letra o usar el botón de pista si tienes duda.</p>
        </div>
      </aside>

      <section class="game-stage">
        <div class="game-stage__bar">
          <div class="hangman-rounds">
            <span>Palabra <strong>${rondaPalabra + 1}</strong> de ${total}</span>
            <div class="hangman-dots">
              ${juego.retosPalabra.map((_, i) => `<i class="${i < rondaPalabra ? 'is-done' : i === rondaPalabra ? 'is-current' : ''}"></i>`).join('')}
            </div>
          </div>
          <div class="sopa-actions">
            ${!completada ? `<button type="button" class="btn btn--secondary btn--sm" data-word-clear ${fichasElegidas.length === 0 ? 'disabled' : ''}><i data-lucide="rotate-ccw"></i>Limpiar</button>` : ''}
            ${!completada ? `<button type="button" class="btn btn--secondary btn--sm" data-word-hint><i data-lucide="lightbulb"></i>Colocar 1 letra</button>` : ''}
          </div>
        </div>

        <div class="hangman-clue">
          <span class="hangman-clue__label"><i data-lucide="stethoscope"></i>Pista clínica de la clase</span>
          <p>${pistaHTML}</p>
        </div>

        <div class="word-slots ${llenaIncorrecta ? 'is-shake' : ''}" aria-label="Casillas de la palabra">
          ${Array.from({ length: actual.palabra.length }, (_, idx) => {
            const fichaId = fichasElegidas[idx];
            const ficha = actual.letrasBarajadas.find((x) => x.id === fichaId);
            return `<button type="button" class="word-slot ${ficha ? 'is-filled' : ''} ${completada ? 'is-correct' : ''} ${llenaIncorrecta ? 'is-wrong' : ''}" data-word-unpick="${idx}" ${!ficha || completada ? 'disabled' : ''}>
              ${ficha ? ficha.letra : ''}
            </button>`;
          }).join('')}
        </div>

        ${llenaIncorrecta ? `<p class="word-error-msg"><i data-lucide="circle-alert"></i>Algunas letras no están en el orden correcto. Toca una letra arriba para corregirla.</p>` : ''}

        ${completada ? `<div class="hangman-banner is-win">
          <div class="hangman-banner__copy">
            <i data-lucide="check-circle-2"></i>
            <div>
              <strong>¡Correcto! Formaste: ${esc(actual.etiqueta)}</strong>
              <small>${esc(actual.pistaCompleta)}</small>
            </div>
          </div>
          <button type="button" class="btn btn--brand" data-word-next>
            ${rondaPalabra + 1 < total ? 'Siguiente palabra' : 'Ver resultado final'}
            <i data-lucide="arrow-right"></i>
          </button>
        </div>` : `<div class="word-tiles" role="group" aria-label="Fichas de letras disponibles">
          ${actual.letrasBarajadas.map((ficha) => {
            const usada = fichasElegidas.includes(ficha.id);
            return `<button type="button" class="word-tile ${usada ? 'is-used' : ''}" data-word-pick="${ficha.id}" ${usada ? 'disabled' : ''}>
              ${ficha.letra}
            </button>`;
          }).join('')}
        </div>`}
      </section>
    </div>`;
  };

  const renderJuego = () => {
    const contenido = tipo === 'rompecabezas'
      ? renderRompecabezasImagen()
      : tipo === 'sopa'
        ? renderSopa()
        : tipo === 'ahorcado'
          ? renderAhorcado()
          : tipo === 'memorama'
            ? renderMemorama()
            : renderPalabra();

    dialogo.innerHTML = `<div class="lesson-game__shell">
      <button type="button" class="lesson-game__close" data-game-close aria-label="Cerrar juego"><i data-lucide="x"></i></button>
      <header class="game-dialog__header">
        <div class="game-dialog__hero" style="--game-hero-image:url('${esc(juego.imagen)}')">
          <div class="game-dialog__hero-content">
            <div class="game-dialog__meta"><span><i data-lucide="${meta.icono}"></i>${meta.etiqueta}</span><span>Repaso de clase</span></div>
            <h2>${meta.titulo}</h2>
            <p>${meta.descripcion}</p>
            <div class="game-dialog__lesson"><i data-lucide="book-open-check"></i><span>Clase ${opciones.n}</span><b aria-hidden="true">·</b><strong>${esc(opciones.claseTitulo)}</strong></div>
          </div>
          <span class="game-dialog__hero-mark" aria-hidden="true"><i data-lucide="${meta.icono}"></i><span></span></span>
        </div>
      </header>
      ${contenido}
    </div>`;
    createIcons({ icons, attrs: { 'aria-hidden': 'true' } });
  };

  // ── Lógica de intercambio en Rompecabezas Visual ──
  const intercambiarPiezas = (posA: number, posB: number) => {
    if (posA === posB || puzzleCompletado) return;
    [ordenPiezas[posA], ordenPiezas[posB]] = [ordenPiezas[posB], ordenPiezas[posA]];
    piezaSeleccionadaPos = null;
    movimientosPuzzle += 1;
    const completo = ordenPiezas.every((idPieza, idx) => idPieza === idx);
    if (completo) {
      puzzleCompletado = true;
      renderJuego();
      const puntaje = Math.max(80, 100 - pistasPuzzle * 6);
      window.setTimeout(() => terminar(puntaje), 900);
    } else {
      renderJuego();
    }
  };

  // ── Lógica Sopa de Letras ──
  const actualizarVistaSeleccionSopa = () => {
    const seleccionSet = new Set(celdasSeleccionSopa);
    dialogo.querySelectorAll<HTMLButtonElement>('[data-sopa-cell]').forEach((btn) => {
      const coord = btn.dataset.sopaCell || '';
      const [f, c] = coord.split(':').map(Number);
      btn.classList.toggle('is-selecting', seleccionSet.has(coord));
      btn.classList.toggle('is-anchor', celdaInicioSopa?.f === f && celdaInicioSopa?.c === c);
    });
    const preview = dialogo.querySelector<HTMLElement>('[data-sopa-preview]');
    if (preview) {
      const letras = celdasSeleccionSopa
        .map((coord) => {
          const [f, c] = coord.split(':').map(Number);
          return juego.sopa.matriz[f]?.[c] || '';
        })
        .join('');
      preview.classList.toggle('is-selecting', Boolean(letras));
      preview.innerHTML = `<i data-lucide="sparkles"></i><span>${letras ? `Seleccionando: <strong>${letras}</strong>` : 'Arrastra con el mouse o toca la primera y la última letra'}</span>`;
      createIcons({ icons, attrs: { 'aria-hidden': 'true' } });
    }
  };

  const verificarSeleccionSopa = (celdas: string[]) => {
    if (celdas.length < 2) return false;
    const claveDirecta = celdas.join('|');
    const claveInversa = [...celdas].reverse().join('|');
    const palabraHallada = juego.sopa.palabras.find(
      (p) => !encontradasSopa.has(p.id) && (p.celdas.join('|') === claveDirecta || p.celdas.join('|') === claveInversa),
    );
    if (!palabraHallada) return false;

    encontradasSopa.add(palabraHallada.id);
    celdaInicioSopa = null;
    celdasSeleccionSopa = [];
    celdaPistaSopa = null;
    renderJuego();

    if (encontradasSopa.size === juego.sopa.palabras.length) {
      const puntaje = Math.max(75, 100 - pistasUsadasSopa * 5);
      window.setTimeout(() => terminar(puntaje), 600);
    }
    return true;
  };

  const probarLetraAhorcado = (letra: string) => {
    const actual = juego.ahorcado[rondaAhorcado];
    if (!actual || letrasProbadas.has(letra)) return;
    const ganadaPrevia = actual.palabra.split('').every((l) => letrasProbadas.has(l));
    if (ganadaPrevia || erroresAhorcado >= MAX_ERRORES) return;

    letrasProbadas.add(letra);
    if (!actual.palabra.includes(letra)) {
      erroresAhorcado += 1;
    }
    const ganadaAhora = actual.palabra.split('').every((l) => letrasProbadas.has(l));
    if (ganadaAhora) aciertosRondas += 1;
    renderJuego();
  };

  // ── Eventos de puntero Sopa de Letras ──
  dialogo.addEventListener('pointerdown', (e) => {
    if (tipo !== 'sopa') return;
    const celda = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-sopa-cell]');
    if (!celda) return;
    const f = Number(celda.dataset.f);
    const c = Number(celda.dataset.c);
    if (celdaInicioSopa && (celdaInicioSopa.f !== f || celdaInicioSopa.c !== c)) {
      const linea = lineaEntreCeldas(celdaInicioSopa.f, celdaInicioSopa.c, f, c);
      if (linea.length > 1 && verificarSeleccionSopa(linea)) {
        arrastrandoSopa = false;
        return;
      }
    }
    arrastrandoSopa = true;
    celdaInicioSopa = { f, c };
    celdasSeleccionSopa = [`${f}:${c}`];
    actualizarVistaSeleccionSopa();
  });

  dialogo.addEventListener('pointermove', (e) => {
    if (tipo !== 'sopa' || !celdaInicioSopa) return;
    if (!arrastrandoSopa && e.pointerType === 'touch') return;
    const bajoPuntero = document.elementFromPoint(e.clientX, e.clientY);
    const celda = bajoPuntero?.closest<HTMLButtonElement>('[data-sopa-cell]');
    if (!celda) return;
    const f = Number(celda.dataset.f);
    const c = Number(celda.dataset.c);
    const linea = lineaEntreCeldas(celdaInicioSopa.f, celdaInicioSopa.c, f, c);
    if (linea.length) {
      celdasSeleccionSopa = linea;
      actualizarVistaSeleccionSopa();
    }
  });

  const onPointerUp = () => {
    if (!arrastrandoSopa) return;
    arrastrandoSopa = false;
    if (celdasSeleccionSopa.length > 1) {
      const exito = verificarSeleccionSopa(celdasSeleccionSopa);
      if (!exito) {
        celdaInicioSopa = null;
        celdasSeleccionSopa = [];
        actualizarVistaSeleccionSopa();
      }
    }
  };
  window.addEventListener('pointerup', onPointerUp);

  // ── Drag & Drop Rompecabezas de Imagen ──
  dialogo.addEventListener('dragstart', (e) => {
    const tile = (e.target as HTMLElement).closest<HTMLElement>('[data-puzzle-pos]');
    if (!tile?.dataset.puzzlePos) return;
    piezaSeleccionadaPos = Number(tile.dataset.puzzlePos);
    e.dataTransfer?.setData('text/plain', tile.dataset.puzzlePos);
  });

  dialogo.addEventListener('dragover', (e) => {
    if ((e.target as HTMLElement).closest('[data-puzzle-pos]')) e.preventDefault();
  });

  dialogo.addEventListener('drop', (e) => {
    const destino = (e.target as HTMLElement).closest<HTMLElement>('[data-puzzle-pos]');
    if (!destino?.dataset.puzzlePos) return;
    e.preventDefault();
    const posDestino = Number(destino.dataset.puzzlePos);
    const origenRaw = e.dataTransfer?.getData('text/plain');
    const posOrigen = origenRaw !== undefined && origenRaw !== '' ? Number(origenRaw) : piezaSeleccionadaPos;
    if (posOrigen !== null && Number.isInteger(posOrigen)) {
      intercambiarPiezas(posOrigen, posDestino);
    }
  });

  // ── Teclado físico para El Ahorcado y Arma la Palabra ──
  const onKeyDown = (e: KeyboardEvent) => {
    if (!dialogo.open) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const tecla = e.key.toUpperCase();
    if (tipo === 'ahorcado') {
      if (tecla === 'ENTER') {
        dialogo.querySelector<HTMLButtonElement>('[data-hangman-next]')?.click();
        return;
      }
      const norm = tecla === 'Ñ' ? 'Ñ' : tecla.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (/^[A-ZÑ]$/.test(norm)) {
        e.preventDefault();
        probarLetraAhorcado(norm);
      }
    } else if (tipo === 'palabra') {
      const actual = juego.retosPalabra[rondaPalabra];
      if (!actual) return;
      if (tecla === 'BACKSPACE' && fichasElegidas.length > 0) {
        e.preventDefault();
        fichasElegidas.pop();
        renderJuego();
        return;
      }
      if (tecla === 'ENTER') {
        dialogo.querySelector<HTMLButtonElement>('[data-word-next]')?.click();
        return;
      }
      const norm = tecla.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (/^[A-Z]$/.test(norm)) {
        const disponible = actual.letrasBarajadas.find((x) => x.letra === norm && !fichasElegidas.includes(x.id));
        if (disponible) {
          e.preventDefault();
          fichasElegidas.push(disponible.id);
          renderJuego();
        }
      }
    }
  };
  window.addEventListener('keydown', onKeyDown);

  // ── Clics de todos los juegos ──
  dialogo.addEventListener('click', (evento) => {
    const boton = (evento.target as HTMLElement).closest<HTMLElement>('button');
    if (!boton) return;

    if (boton.matches('[data-game-close]')) {
      dialogo.close();
      return;
    }

    if (boton.matches('[data-game-save-retry]') && puntajePendiente !== null) {
      void terminar(puntajePendiente);
      return;
    }

    if (boton.matches('[data-game-retry]')) {
      ordenPiezas = [...juego.rompecabezasImagen.ordenInicial];
      piezaSeleccionadaPos = null;
      movimientosPuzzle = 0;
      pistasPuzzle = 0;
      puzzleCompletado = false;
      encontradasSopa.clear();
      celdaInicioSopa = null;
      celdasSeleccionSopa = [];
      celdaPistaSopa = null;
      pistasUsadasSopa = 0;
      rondaAhorcado = 0;
      letrasProbadas = new Set();
      erroresAhorcado = 0;
      aciertosRondas = 0;
      pistasAhorcado = 0;
      paresResueltos.clear();
      volteadas = [];
      bloqueadoMemorama = false;
      intentosMemorama = 0;
      rondaPalabra = 0;
      fichasElegidas = [];
      pistasPalabra = 0;
      renderJuego();
      return;
    }

    if (boton.matches('[data-game-next]')) {
      accionFinal = true;
      dialogo.close();
      opciones.onContinuar();
      return;
    }

    // 1. Clics Rompecabezas de Imagen
    if (boton.matches('[data-puzzle-pos]')) {
      const pos = Number(boton.dataset.puzzlePos);
      if (piezaSeleccionadaPos === null) {
        piezaSeleccionadaPos = pos;
        renderJuego();
      } else if (piezaSeleccionadaPos === pos) {
        piezaSeleccionadaPos = null;
        renderJuego();
      } else {
        intercambiarPiezas(piezaSeleccionadaPos, pos);
      }
      return;
    }

    if (boton.matches('[data-puzzle-toggle-guide]')) {
      mostrarGuia = !mostrarGuia;
      renderJuego();
      return;
    }

    if (boton.matches('[data-puzzle-img-hint]')) {
      const posDescolocada = ordenPiezas.findIndex((idPieza, pos) => idPieza !== pos);
      if (posDescolocada >= 0) {
        const posDondeEstaLaCorrecta = ordenPiezas.indexOf(posDescolocada);
        if (posDondeEstaLaCorrecta >= 0) {
          pistasPuzzle += 1;
          intercambiarPiezas(posDescolocada, posDondeEstaLaCorrecta);
        }
      }
      return;
    }

    // 2. Clics Sopa de Letras
    if (boton.matches('[data-sopa-hint]')) {
      const pendiente = juego.sopa.palabras.find((p) => !encontradasSopa.has(p.id));
      if (pendiente) {
        pistasUsadasSopa += 1;
        celdaPistaSopa = pendiente.celdas[0];
        celdaInicioSopa = { f: pendiente.fila, c: pendiente.col };
        celdasSeleccionSopa = [pendiente.celdas[0]];
        renderJuego();
      }
      return;
    }

    // 3. Clics Ahorcado
    if (boton.matches('[data-hangman-key]')) {
      const letra = boton.dataset.hangmanKey || '';
      if (letra) probarLetraAhorcado(letra);
      return;
    }

    if (boton.matches('[data-hangman-hint]')) {
      const actual = juego.ahorcado[rondaAhorcado];
      if (!actual) return;
      const faltante = actual.palabra.split('').find((l) => !letrasProbadas.has(l));
      if (faltante) {
        pistasAhorcado += 1;
        probarLetraAhorcado(faltante);
      }
      return;
    }

    if (boton.matches('[data-hangman-next]')) {
      if (rondaAhorcado + 1 < juego.ahorcado.length) {
        rondaAhorcado += 1;
        letrasProbadas = new Set();
        erroresAhorcado = 0;
        renderJuego();
      } else {
        const base = Math.round((Math.max(1, aciertosRondas) / juego.ahorcado.length) * 100);
        terminar(Math.max(75, base - pistasAhorcado * 5));
      }
      return;
    }

    // 4. Clics Memorama
    if (boton.matches('[data-memory-card]')) {
      if (bloqueadoMemorama) return;
      const uid = boton.dataset.memoryCard || '';
      if (!uid || volteadas.includes(uid)) return;
      volteadas.push(uid);
      renderJuego();

      if (volteadas.length === 2) {
        intentosMemorama += 1;
        const [c1, c2] = volteadas.map((id) => juego.memorama.find((x) => x.uid === id)!);
        if (c1 && c2 && c1.parId === c2.parId) {
          paresResueltos.add(c1.parId);
          volteadas = [];
          renderJuego();
          if (paresResueltos.size === Math.floor(juego.memorama.length / 2)) {
            const extraTurnos = Math.max(0, intentosMemorama - paresResueltos.size);
            const puntaje = Math.max(80, 100 - extraTurnos * 4);
            window.setTimeout(() => terminar(puntaje), 650);
          }
        } else {
          bloqueadoMemorama = true;
          window.setTimeout(() => {
            volteadas = [];
            bloqueadoMemorama = false;
            renderJuego();
          }, 850);
        }
      }
      return;
    }

    // 5. Clics Arma la Palabra
    if (boton.matches('[data-word-pick]')) {
      const id = boton.dataset.wordPick || '';
      const actual = juego.retosPalabra[rondaPalabra];
      if (id && actual && fichasElegidas.length < actual.palabra.length && !fichasElegidas.includes(id)) {
        fichasElegidas.push(id);
        renderJuego();
      }
      return;
    }

    if (boton.matches('[data-word-unpick]')) {
      const idx = Number(boton.dataset.wordUnpick);
      if (Number.isInteger(idx) && idx >= 0 && idx < fichasElegidas.length) {
        fichasElegidas.splice(idx, 1);
        renderJuego();
      }
      return;
    }

    if (boton.matches('[data-word-clear]')) {
      fichasElegidas = [];
      renderJuego();
      return;
    }

    if (boton.matches('[data-word-hint]')) {
      const actual = juego.retosPalabra[rondaPalabra];
      if (!actual) return;
      pistasPalabra += 1;
      // Busca la primera posición incorrecta o vacía y coloca la letra correcta ahí
      let posCorregir = 0;
      for (let i = 0; i < actual.palabra.length; i += 1) {
        const fichaActual = actual.letrasBarajadas.find((x) => x.id === fichasElegidas[i]);
        if (!fichaActual || fichaActual.letra !== actual.palabra[i]) {
          posCorregir = i;
          break;
        }
      }
      fichasElegidas = fichasElegidas.slice(0, posCorregir);
      const letraNecesaria = actual.palabra[posCorregir];
      const fichaCorrecta = actual.letrasBarajadas.find(
        (x) => x.letra === letraNecesaria && !fichasElegidas.includes(x.id),
      );
      if (fichaCorrecta) {
        fichasElegidas.push(fichaCorrecta.id);
      }
      renderJuego();
      return;
    }

    if (boton.matches('[data-word-next]')) {
      if (rondaPalabra + 1 < juego.retosPalabra.length) {
        rondaPalabra += 1;
        fichasElegidas = [];
        renderJuego();
      } else {
        terminar(Math.max(80, 100 - pistasPalabra * 5));
      }
    }
  });

  dialogo.addEventListener('close', () => {
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('pointerup', onPointerUp);
    dialogo.remove();
    if (!accionFinal) opciones.onCerrar?.();
  }, { once: true });

  document.body.append(dialogo);
  renderJuego();
  dialogo.showModal();
  return true;
}
