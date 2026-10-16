// Encuestas ligeras del club (fin de curso y pulso a 21 días): un modal por pasos,
// una pregunta a la vez, con estrellas para calificar y cierre de agradecimiento.
// La entrevista inicial tiene su propia página (pages/bienvenida.ts). Comparte con ella
// las clases de opciones y progreso de styles/bienvenida.css.
import { createIcons, icons } from 'lucide';
import { Auth, mensajeError } from '../core/auth';
import { curso as getCurso } from '../core/catalogo';
import { encuestaPendiente, esVipParaEncuestas, posponerEncuesta, preguntaAplica, responderEncuesta, type EncuestaPendiente, type PreguntaEncuesta } from '../core/encuestas';
import { esc } from './partials';

type Toast = (mensaje: string, icono?: string) => void;
type Valor = string | string[] | number;

const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
const ESTRELLA = '<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="M12 2.8l2.9 6 6.6.9-4.8 4.6 1.2 6.6L12 17.8l-5.9 3.1 1.2-6.6L2.5 9.7l6.6-.9z"/></svg>';
// Lo que significa cada estrella, por pregunta (1 a 5).
const SENTIDO: Record<string, string[]> = {
  utilidad: ['Nada útil', 'Poco útil', 'Útil', 'Muy útil', 'Imprescindible'],
  claridad: ['Confusas', 'Poco claras', 'Aceptables', 'Claras', 'Muy claras'],
  facilidad: ['Muy difícil', 'Difícil', 'Regular', 'Fácil', 'Muy fácil'],
  calidad: ['Baja', 'Regular', 'Buena', 'Muy buena', 'Excelente'],
};

function primerNombre() {
  const n = (Auth.usuario?.nombre || '').trim().split(/\s+/)[0] || '';
  return /^\p{L}{2,}$/u.test(n) && !/^modo$/i.test(n) ? n[0].toUpperCase() + n.slice(1) : '';
}

export function mostrarEncuestaPendiente(toast: Toast) {
  const encuesta = encuestaPendiente();
  if (document.querySelector('.encuesta-modal')) return true;
  // La entrevista inicial tiene su propia página (#/bienvenida); aquí sólo van las encuestas ligeras.
  if (!encuesta || encuesta.tipo === 'bienvenida' || encuesta.tipo === 'brujula' || document.querySelector('.onb, .paywall')) return false;
  abrir(encuesta, toast);
  return true;
}

function abrir(encuesta: EncuestaPendiente, toast: Toast) {
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const respuestas: Record<string, Valor> = {};
  // Las preguntas condicionales (mostrarSi) aparecen o desaparecen según lo contestado y el plan del miembro.
  const vip = esVipParaEncuestas();
  const visibles = () => encuesta.preguntas.filter((p) => preguntaAplica(p, respuestas, vip));
  const total = () => visibles().length;
  const actual = () => visibles()[paso];
  let paso = 0;
  let enviando = false;
  let auto = 0;
  let salida = 0;

  const cursoInfo = encuesta.cursoId ? getCurso(encuesta.cursoId) : undefined;
  const titulo = encuesta.tipo === 'curso' ? `¿Qué te pareció <em>${esc(encuesta.cursoTitulo || 'el curso')}</em>?` : esc(encuesta.titulo);
  const el = document.createElement('div');
  el.className = 'encuesta-modal';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.setAttribute('aria-labelledby', 'encuesta-titulo');
  el.innerHTML = `<div class="enc" data-enc>
    <header class="enc__cab">
      ${cursoInfo ? `<img class="enc__portada" src="${esc(cursoInfo.portada)}" alt="">` : `<span class="enc__icono"><i data-lucide="${encuesta.tipo === 'pulso' ? 'heart-pulse' : 'clipboard-check'}" class="i"></i></span>`}
      <div class="enc__cab-texto">
        <span class="bv-eti">${encuesta.tipo === 'curso' ? 'Curso completado' : 'Tu opinión'} · <span data-enc-n>${total()}</span> preguntas</span>
        <h2 id="encuesta-titulo" class="display">${titulo}</h2>
      </div>
      <button class="enc__cerrar" type="button" data-enc-posponer aria-label="Ahora no"><i data-lucide="x" class="i"></i></button>
    </header>
    <div class="enc__avance">
      <div class="bv__progreso" role="progressbar" aria-label="Avance de la encuesta" aria-valuemin="0" aria-valuemax="${total()}">${'<span></span>'.repeat(total())}</div>
      <span class="bv__cuenta mono" data-enc-cuenta></span>
    </div>
    <div class="enc__escena" data-enc-escena></div>
    <footer class="enc__pie" data-enc-pie></footer>
  </div>`;
  document.body.appendChild(el);

  const escena = el.querySelector<HTMLElement>('[data-enc-escena]')!;
  const pie = el.querySelector<HTMLElement>('[data-enc-pie]')!;
  const barra = el.querySelector<HTMLElement>('.bv__progreso')!;
  const cuenta = el.querySelector<HTMLElement>('[data-enc-cuenta]')!;

  const valor = (p: PreguntaEncuesta) => respuestas[p.id];
  const respondida = (p: PreguntaEncuesta) => {
    const v = valor(p);
    if (!p.requerida) return true;
    return Array.isArray(v) ? v.length > 0 : v !== undefined && v !== '';
  };

  // ── Escenas ──
  function estrellas(p: PreguntaEncuesta) {
    const sentido = SENTIDO[p.id] || [];
    const actual = Number(valor(p) || 0);
    return `<div class="enc-estrellas" role="radiogroup" aria-labelledby="enc-pregunta">
      ${Array.from({ length: p.max! - p.min! + 1 }, (_, i) => p.min! + i).map((n) => `<label class="enc-estrella" style="--i:${n}" title="${esc(sentido[n - 1] || String(n))}"><input type="radio" name="enc-${esc(p.id)}" value="${n}" ${actual === n ? 'checked' : ''}>${ESTRELLA}<span class="sr-only">${n}</span></label>`).join('')}
    </div>
    <p class="enc-estrellas__sentido" data-enc-sentido>${actual ? esc(sentido[actual - 1] || String(actual)) : `<span>${esc(p.minEtiqueta || '')}</span><span>${esc(p.maxEtiqueta || '')}</span>`}</p>`;
  }

  function escalaNumerica(p: PreguntaEncuesta) {
    const actual = valor(p);
    return `<div class="enc-nps" role="radiogroup" aria-labelledby="enc-pregunta">
      ${Array.from({ length: p.max! - p.min! + 1 }, (_, i) => p.min! + i).map((n, i) => `<label class="enc-nps__n" style="--i:${i}"><input type="radio" name="enc-${esc(p.id)}" value="${n}" ${actual === n ? 'checked' : ''}><span>${n}</span></label>`).join('')}
    </div>
    <p class="enc-nps__extremos"><span>${esc(p.minEtiqueta || '')}</span><span>${esc(p.maxEtiqueta || '')}</span></p>`;
  }

  function opciones(p: PreguntaEncuesta) {
    const multiple = p.tipo === 'multiple';
    const elegidas = Array.isArray(valor(p)) ? (valor(p) as string[]) : valor(p) ? [String(valor(p))] : [];
    return `<fieldset class="bv-ops ${multiple ? 'bv-ops--chips bv-ops--multiple' : 'bv-ops--lista'}" aria-labelledby="enc-pregunta">
      ${(p.opciones || []).map((o, i) => `<label class="bv-op bv-op--simple" style="--i:${i}"><input type="${multiple ? 'checkbox' : 'radio'}" name="enc-${esc(p.id)}" value="${esc(o.valor)}" ${elegidas.includes(o.valor) ? 'checked' : ''}><span class="bv-op__t">${esc(o.etiqueta)}</span><span class="bv-op__ok">${CHECK}</span></label>`).join('')}
    </fieldset>
    ${multiple ? '<p class="bv-q__limite" data-enc-limite aria-live="polite"></p>' : ''}`;
  }

  function texto(p: PreguntaEncuesta) {
    const max = p.max || 500;
    const campo = p.corto
      ? `<input class="input enc-texto enc-texto--corto" type="text" name="enc-${esc(p.id)}" maxlength="${max}" value="${esc(String(valor(p) || ''))}" placeholder="Escribe aquí…" aria-labelledby="enc-pregunta" autocomplete="off">`
      : `<textarea class="input enc-texto" name="enc-${esc(p.id)}" rows="4" maxlength="${max}" placeholder="Escribe lo que quieras compartir…" aria-labelledby="enc-pregunta">${esc(String(valor(p) || ''))}</textarea>`;
    return `${campo}
    <p class="enc-texto__pie"><span>${p.ayuda ? esc(p.ayuda) : 'Opcional.'}</span><span class="mono" data-enc-contador>${String(valor(p) || '').length}/${max}</span></p>`;
  }

  function pregunta(p: PreguntaEncuesta, i: number) {
    const cuerpo = p.tipo === 'escala' ? (p.max! - p.min! < 6 ? estrellas(p) : escalaNumerica(p)) : p.tipo === 'texto' ? texto(p) : opciones(p);
    return `<div class="enc-q">
      <div class="bv-q__meta"><span class="bv-q__n" aria-hidden="true"><span>${String(i + 1).padStart(2, '0')}</span></span>${p.requerida ? '' : '<span class="bv-eti">Opcional</span>'}</div>
      <h3 id="enc-pregunta" class="enc-q__t display" tabindex="-1">${esc(p.texto)}</h3>
      ${p.ayuda && p.tipo !== 'texto' ? `<p class="bv-ayuda">${esc(p.ayuda)}</p>` : ''}
      <div class="enc-q__cuerpo">${cuerpo}</div>
    </div>`;
  }

  function gracias() {
    const nombre = primerNombre();
    return `<div class="enc-fin">
      <span class="bv-fin__sello">${CHECK}</span>
      <h3 class="enc-q__t display" tabindex="-1">¡Gracias${nombre ? `, ${esc(nombre)}` : ''}!</h3>
      <p class="bv-ayuda">${encuesta.tipo === 'curso' ? 'Tu opinión ya está con el equipo y cuenta para la siguiente edición del curso.' : 'Tu opinión ya está con el equipo. Así sabemos qué mejorar primero.'}</p>
    </div>`;
  }

  // ── Pintado ──
  function pintarAvance() {
    const hechos = Math.min(paso, total());
    // El número de pasos puede cambiar con las condicionales: la barra se ajusta.
    if (barra.children.length !== total()) { barra.innerHTML = '<span></span>'.repeat(total()); barra.setAttribute('aria-valuemax', String(total())); }
    const n = el.querySelector('[data-enc-n]'); if (n) n.textContent = String(total());
    barra.setAttribute('aria-valuenow', String(hechos));
    [...barra.children].forEach((s, i) => s.className = i < hechos ? 'is-hecho' : i === paso ? 'is-actual' : '');
    cuenta.textContent = paso >= total() ? 'Listo' : `${paso + 1} de ${total()}`;
  }

  // Una pregunta opcional sin respuesta se "omite"; con respuesta se "continúa".
  const etiquetaSeguir = (p: PreguntaEncuesta, ultimo: boolean) => ultimo ? 'Enviar' : p.requerida || valor(p) ? 'Continuar' : 'Omitir';

  function pintarPie() {
    const flecha = (icono: string) => `<span class="arrow"><i data-lucide="${icono}" class="i${icono === 'loader-circle' ? ' spin' : ''}"></i></span>`;
    if (paso >= total()) { pie.innerHTML = `<button class="btn btn--brand btn--lg btn--pill-arrow" type="button" data-enc-cerrar>Seguir en el club ${flecha('arrow-right')}</button>`; }
    else {
      const ultimo = paso === total() - 1;
      const p = actual();
      pie.innerHTML = `${paso > 0 ? `<button class="btn btn--ghost" type="button" data-enc-atras ${enviando ? 'disabled' : ''}><i data-lucide="arrow-left" class="i"></i>Atrás</button>` : `<button class="btn btn--ghost" type="button" data-enc-posponer>Ahora no</button>`}
        <button class="btn btn--brand btn--lg btn--pill-arrow" type="button" data-enc-seguir ${enviando || !respondida(p) ? 'disabled' : ''}><span data-enc-etiqueta>${enviando ? 'Enviando…' : etiquetaSeguir(p, ultimo)}</span> ${flecha(enviando ? 'loader-circle' : ultimo ? 'send' : 'arrow-right')}</button>`;
    }
    createIcons({ icons });
  }

  function aplicarLimite() {
    const p = actual();
    if (!p || p.tipo !== 'multiple') return;
    const n = Array.isArray(valor(p)) ? (valor(p) as string[]).length : 0;
    const max = p.max || p.opciones?.length || 0;
    escena.querySelectorAll<HTMLInputElement>('.bv-op input').forEach((x) => { x.disabled = !x.checked && n >= max; });
    const limite = escena.querySelector('[data-enc-limite]');
    if (limite) limite.textContent = n >= max ? `Listo, elegiste ${max}. Quita una si quieres cambiar.` : `Elige hasta ${max} · llevas ${n}`;
  }

  function pintar(atras = false) {
    clearTimeout(auto); clearTimeout(salida);
    escena.style.setProperty('--dir', atras ? '-1' : '1');
    pintarAvance(); pintarPie();
    const entrar = () => {
      escena.classList.remove('is-sale'); escena.inert = false;
      escena.innerHTML = paso >= total() ? gracias() : pregunta(actual(), paso);
      createIcons({ icons }); aplicarLimite();
      const foco = escena.querySelector<HTMLElement>('textarea, input[type="text"], h3');
      foco?.focus({ preventScroll: true });
    };
    if (quieto || !escena.firstElementChild) { entrar(); return; }
    escena.inert = true; escena.classList.add('is-sale');
    salida = window.setTimeout(entrar, 180);
  }

  // ── Acciones ──
  function cerrar() {
    clearTimeout(auto); clearTimeout(salida);
    document.removeEventListener('keydown', teclas);
    el.classList.add('is-cerrando');
    setTimeout(() => { el.remove(); window.dispatchEvent(new CustomEvent('encuesta:cerrada')); }, quieto ? 0 : 220);
  }

  async function enviar() {
    enviando = true; pintarPie();
    try {
      const limpias: Record<string, unknown> = {};
      for (const p of visibles()) { const v = valor(p); if (v !== undefined && v !== '' && !(Array.isArray(v) && !v.length)) limpias[p.id] = v; }
      await responderEncuesta(encuesta, limpias);
      enviando = false; paso = total(); pintar();
    } catch (e: any) {
      enviando = false;
      if (e?.status === 409) { cerrar(); return; }
      pintarPie(); toast(mensajeError(e), 'alert-triangle');
    }
  }

  function seguir() {
    clearTimeout(auto);
    if (enviando) return;
    if (paso >= total()) { cerrar(); return; }
    if (!respondida(actual())) { const c = escena.querySelector<HTMLElement>('.enc-q__cuerpo'); c?.classList.remove('is-aviso'); void c?.offsetWidth; c?.classList.add('is-aviso'); return; }
    if (paso < total() - 1) { paso++; pintar(); return; }
    enviar();
  }

  async function posponer(boton: HTMLButtonElement) {
    boton.disabled = true;
    try { await posponerEncuesta(encuesta); cerrar(); toast('Te la recordaremos más adelante', 'clock-3'); }
    catch (e) { boton.disabled = false; toast(mensajeError(e), 'alert-triangle'); }
  }

  // Una respuesta única (estrella, número u opción) avanza sola, salvo en la última pregunta.
  function avanzarSola() {
    const p = actual();
    if (p.tipo === 'multiple' || p.tipo === 'texto' || paso >= total() - 1) return;
    clearTimeout(auto);
    auto = window.setTimeout(() => { if (respondida(p)) seguir(); }, 460);
  }

  el.addEventListener('change', (e) => {
    const input = e.target as HTMLInputElement;
    const p = actual();
    if (!p || input.tagName !== 'INPUT' || input.type === 'text') return;
    if (p.tipo === 'multiple') respuestas[p.id] = [...escena.querySelectorAll<HTMLInputElement>('.bv-op input:checked')].map((x) => x.value);
    else if (p.tipo === 'escala') respuestas[p.id] = Number(input.value);
    else respuestas[p.id] = input.value;
    const sentido = escena.querySelector('[data-enc-sentido]');
    if (sentido && p.tipo === 'escala') sentido.textContent = (SENTIDO[p.id] || [])[Number(input.value) - 1] || input.value;
    aplicarLimite();
    const boton = pie.querySelector<HTMLButtonElement>('[data-enc-seguir]');
    if (boton) boton.disabled = !respondida(p);
    if (input.checked) try { navigator.vibrate?.(8); } catch {}
  });

  el.addEventListener('input', (e) => {
    const area = e.target as HTMLTextAreaElement;
    const p = actual();
    if (!p || !area.matches('textarea, input[type="text"]')) return;
    respuestas[p.id] = area.value.trim();
    const contador = escena.querySelector('[data-enc-contador]');
    if (contador) contador.textContent = `${area.value.length}/${p.max || 500}`;
    const etiqueta = pie.querySelector('[data-enc-etiqueta]');
    if (etiqueta) etiqueta.textContent = etiquetaSeguir(p, paso === total() - 1);
  });

  el.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    if (t.closest('[data-enc-seguir]')) { seguir(); return; }
    if (t.closest('[data-enc-atras]')) { if (!enviando && paso > 0) { paso--; pintar(true); } return; }
    if (t.closest('[data-enc-cerrar]')) { cerrar(); return; }
    const pos = t.closest<HTMLButtonElement>('[data-enc-posponer]');
    if (pos) { posponer(pos); return; }
    if (t.closest('.bv-op, .enc-estrella, .enc-nps__n') && !(t instanceof HTMLInputElement)) avanzarSola();
  });

  // Enter continúa (no desde el cuadro de texto, donde sirve para saltos de línea); Escape pospone.
  function teclas(e: KeyboardEvent) {
    if (!el.isConnected) { document.removeEventListener('keydown', teclas); return; }
    if (e.key === 'Escape') { const b = el.querySelector<HTMLButtonElement>('[data-enc-posponer]'); if (b && !b.disabled && paso < total()) posponer(b); else if (paso >= total()) cerrar(); return; }
    if (e.key !== 'Enter' || e.ctrlKey || e.metaKey || e.altKey || escena.inert) return;
    const objetivo = e.target as HTMLElement;
    if (objetivo.closest('textarea, button, a')) return;
    e.preventDefault(); seguir();
  }
  document.addEventListener('keydown', teclas);

  pintar();
}
