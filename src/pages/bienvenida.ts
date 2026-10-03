// Entrevista de bienvenida: página propia que se muestra la primera vez que entra un miembro.
// Las preguntas y opciones vienen de la plantilla versionada (core/encuestas o la API);
// aquí sólo vive la presentación: iconos, logotipos de marca y el orden visual de cada paso.
import { createIcons, icons } from 'lucide';
import { Auth, mensajeError } from '../core/auth';
import type { Curso } from '../core/catalogo';
import { cargarEncuestas, encuestaPendiente, posponerEncuesta, responderEncuesta, type OpcionEncuesta, type PreguntaEncuesta } from '../core/encuestas';
import { cursosPorIntereses } from '../core/recomendaciones';
import { navigate } from '../core/router';
import { esc } from '../ui/partials';

type Toast = (mensaje: string, icono?: string) => void;
type Respuestas = Record<string, string | string[]>;
type Forma = 'lista' | 'marcas' | 'chips';

const BORRADOR_KEY = 'odonteck-club:bienvenida-borrador';
// Ruta que el miembro quería abrir cuando la entrevista lo interceptó (la guarda main.ts).
export const DESTINO_KEY = 'odt:tras-bienvenida';
const INTRO = -1;
const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';

// El lado visual cambia de foto por etapa: quién eres (0-1), qué buscas (2-4) y cómo aprendes (5-6).
const FOTOS = ['/fotos/hero-club.webp', '/fotos/hero-consulta.webp', '/fotos/hero-instrumental.webp'];
const LETRAS = 'ABCDEFGHIJ';

const PASOS: Record<string, string> = {
  situacion: 'Tu etapa',
  experiencia: 'Tu experiencia',
  como_conocio: 'Cómo llegaste',
  objetivo: 'Tu objetivo',
  intereses: 'Tus intereses',
  formato: 'Cómo aprendes',
  reto: 'Tu reto',
};

const ICONOS: Record<string, string> = {
  'situacion.estudiante': 'graduation-cap', 'situacion.pasante': 'clipboard-list', 'situacion.general': 'stethoscope',
  'situacion.especialista': 'award', 'situacion.docente': 'presentation', 'situacion.otro': 'ellipsis',
  'experiencia.sin_pacientes': 'book-open', 'experiencia.menos_1': 'sprout', 'experiencia.1_3': 'footprints',
  'experiencia.4_7': 'trending-up', 'experiencia.8_mas': 'medal',
  'como_conocio.colega': 'users-round', 'como_conocio.evento': 'ticket', 'como_conocio.otro': 'compass',
  'objetivo.practica': 'activity', 'objetivo.actualizacion': 'refresh-cw', 'objetivo.certificacion': 'badge-check',
  'objetivo.posgrado': 'school', 'objetivo.comunidad': 'messages-square', 'objetivo.recursos': 'library',
  'formato.video': 'circle-play', 'formato.casos': 'scan-search', 'formato.en_vivo': 'radio',
  'formato.guias': 'file-text', 'formato.quizzes': 'gamepad-2',
  'reto.tiempo': 'clock-3', 'reto.costo': 'wallet', 'reto.confianza': 'search-check',
  'reto.practica': 'route', 'reto.constancia': 'calendar-check', 'reto.otro': 'ellipsis',
};

// Logotipos de marca en SVG local (sin peticiones externas). Sólo se usan en "¿Cómo conociste OdonTeck?".
const MARCAS: Record<string, string> = {
  instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5.4"/><circle cx="12" cy="12" r="4.3"/><circle cx="17.5" cy="6.5" r="1.25" fill="#fff" stroke="none"/></svg>',
  facebook: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#0866FF" d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/></svg>',
  tiktok: `<svg viewBox="0 0 24 24" aria-hidden="true"><g transform="translate(3.4 3.4) scale(.72)">${[['#25F4EE', -1.1], ['#FE2C55', 1.1], ['#fff', 0]].map(([color, d]) => `<path fill="${color}" transform="translate(${d} ${d})" d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>`).join('')}</g></svg>`,
  google: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>',
  whatsapp: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#fff" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>',
};


const entrevista = () => { const e = encuestaPendiente(); return e?.tipo === 'bienvenida' ? e : null; };

// Titulares que entran palabra por palabra: cada palabra sube detrás de su propia máscara.
function levanta() {
  let i = 0;
  return (texto: string) => texto.split(' ').map((p) => `<span class="bv-pal"><span style="--p:${i++}">${esc(p)}</span></span>`).join(' ');
}

function primerNombre() {
  const nombre = (Auth.usuario?.nombre || '').trim();
  if (!nombre || /^modo demo$/i.test(nombre)) return '';
  const p = nombre.replace(/^(Dra?\.|Ing\.|Lic\.)\s*/i, '').split(/\s+/)[0];
  return /^\p{L}{2,}$/u.test(p) ? p[0].toUpperCase() + p.slice(1) : '';
}

export function bienvenida() {
  const encuesta = entrevista();
  if (!encuesta) return '';
  const total = encuesta.preguntas.length;
  const pal = levanta();
  return `
  <div class="bv" data-bienvenida>
    <aside class="bv__lado">
      ${FOTOS.map((f, i) => `<img class="bv__foto bv__foto--${i}" src="${f}" alt="">`).join('')}
      <img class="bv__logo" src="/brand/logo-horizontal-dark.png" alt="OdonTeck">
      <div class="bv__lema">
        <span class="bv__kicker">Tu club, a tu medida</span>
        <h1 class="display">${pal('Antes de recomendarte algo, queremos')} <em>${pal('conocerte.')}</em></h1>
      </div>
      <div class="bv__perfil">
        <span class="bv__perfil-t">Tu perfil en el club<span class="mono" data-bv-hechos></span></span>
        <ol data-bv-perfil>${encuesta.preguntas.map((p, i) => `<li><button type="button" data-bv-ir="${i}" disabled><span class="bv__perfil-n">${i + 1}</span><span class="bv__perfil-k">${esc(PASOS[p.id] || p.texto)}</span><span class="bv__perfil-v"></span></button></li>`).join('')}</ol>
        <p class="bv__privado"><i data-lucide="shield-check" class="i"></i>El panel del equipo sólo muestra tendencias, sin tu nombre ni tu correo.</p>
      </div>
    </aside>
    <section class="bv__panel">
      <header class="bv__barra">
        <img class="bv__logo-movil" data-logo src="/brand/logo-horizontal.png" alt="OdonTeck">
        <div class="bv__avance">
          <div class="bv__progreso" data-bv-progreso role="progressbar" aria-label="Avance de la entrevista" aria-valuemin="0" aria-valuemax="${total}">${'<span></span>'.repeat(total)}</div>
          <span class="bv__cuenta mono" data-bv-cuenta></span>
        </div>
        <button class="bv__despues" type="button" data-bv-accion="posponer">Responder después</button>
      </header>
      <div class="bv__escena" data-bv-escena></div>
      <footer class="bv__pie" data-bv-pie></footer>
    </section>
  </div>`;
}

export function montarBienvenida(toast: Toast) {
  const raiz = document.querySelector<HTMLElement>('[data-bienvenida]');
  const encuesta = entrevista();
  if (!raiz || !encuesta) return;

  const preguntas = encuesta.preguntas;
  const total = preguntas.length;
  const escena = raiz.querySelector<HTMLElement>('[data-bv-escena]')!;
  const pie = raiz.querySelector<HTMLElement>('[data-bv-pie]')!;
  const nombre = primerNombre();
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const filasPerfil = [...raiz.querySelectorAll<HTMLElement>('[data-bv-perfil] li')];
  const valoresPerfil = preguntas.map(() => '');
  let paso = INTRO;
  let respuestas: Respuestas = {};
  let enviando = false;
  let auto = 0;
  let salida = 0;

  // ── Borrador: recargar la página no borra lo ya contestado ──
  // Va atado a la cuenta: en un equipo compartido, otra persona no hereda respuestas ajenas.
  const uid = Auth.usuario?.uid || '';
  try {
    const b = JSON.parse(sessionStorage.getItem(BORRADOR_KEY) || 'null');
    if (b?.clave === encuesta.clave && b.uid === uid) {
      for (const p of preguntas) {
        const validas = new Set((p.opciones || []).map((o) => o.valor));
        const v = b.respuestas?.[p.id];
        if (Array.isArray(v)) { const l = v.filter((x) => validas.has(x)).slice(0, p.max || v.length); if (l.length) respuestas[p.id] = l; }
        else if (typeof v === 'string' && validas.has(v)) respuestas[p.id] = v;
      }
      if (Number.isInteger(b.paso)) paso = Math.max(INTRO, Math.min(total - 1, b.paso));
    }
  } catch {}
  const guardarBorrador = () => { try { sessionStorage.setItem(BORRADOR_KEY, JSON.stringify({ uid, clave: encuesta.clave, paso, respuestas })); } catch {} };
  const borrarBorrador = () => { try { sessionStorage.removeItem(BORRADOR_KEY); } catch {} };

  const elegidas = (p: PreguntaEncuesta) => { const v = respuestas[p.id]; return Array.isArray(v) ? v : v ? [v] : []; };
  const respondida = (p: PreguntaEncuesta) => !p.requerida || elegidas(p).length > 0;
  const etiquetas = (p: PreguntaEncuesta) => elegidas(p).map((v) => p.opciones?.find((o) => o.valor === v)?.etiqueta || v);
  const forma = (p: PreguntaEncuesta): Forma => p.id === 'como_conocio' ? 'marcas' : (p.opciones?.length || 0) > 8 ? 'chips' : 'lista';

  // ── Escenas ──
  function intro() {
    const pal = levanta();
    return `<div class="bv-intro">
      <img class="bv-intro__foto" src="/fotos/hero-club.webp" alt="">
      <span class="bv-eti">Te damos la bienvenida</span>
      <h2 class="bv-intro__t display" tabindex="-1">${nombre ? `${pal(`Hola, ${nombre}.`)}<br>` : ''}${pal('Armemos tu club')} <em>${pal('a tu medida.')}</em></h2>
      <p class="bv-ayuda">Responde ${total} preguntas rápidas y tu inicio se acomodará a tus intereses. Sólo se hace una vez.</p>
      <ul class="bv-intro__datos">
        <li><i data-lucide="list-checks" class="i"></i><strong>${total} preguntas</strong><span>una a la vez</span></li>
        <li><i data-lucide="timer" class="i"></i><strong>Menos de un minuto</strong><span>sólo eliges opciones</span></li>
        <li><i data-lucide="lock-keyhole" class="i"></i><strong>Uso interno</strong><span>nada de datos de pacientes</span></li>
      </ul>
    </div>`;
  }

  function opcion(p: PreguntaEncuesta, o: OpcionEncuesta, i: number, f: Forma) {
    const multiple = p.tipo === 'multiple';
    const marca = f === 'marcas' ? MARCAS[o.valor] : '';
    const grafico = f === 'chips' ? '' : `<span class="bv-op__ic${f === 'marcas' ? ` bv-op__ic--marca bv-op__ic--${o.valor}` : ''}">${marca || `<i data-lucide="${ICONOS[`${p.id}.${o.valor}`] || 'circle'}" class="i"></i>`}</span>`;
    return `<label class="bv-op" style="--i:${i}">
      <input type="${multiple ? 'checkbox' : 'radio'}" name="bv-${esc(p.id)}" value="${esc(o.valor)}" ${elegidas(p).includes(o.valor) ? 'checked' : ''}>
      ${grafico}<span class="bv-op__t">${esc(o.etiqueta)}</span><span class="bv-op__ok">${LETRAS[i] ? `<b aria-hidden="true">${LETRAS[i]}</b>` : ''}${CHECK}</span>
    </label>`;
  }

  function pregunta(p: PreguntaEncuesta, i: number) {
    const f = forma(p);
    return `<div class="bv-q">
      <div class="bv-q__meta"><span class="bv-q__n" aria-hidden="true"><span>${String(i + 1).padStart(2, '0')}</span></span><span class="bv-eti">${esc(PASOS[p.id] || 'Sobre ti')}</span></div>
      <h2 class="bv-q__t display" id="bv-titulo" tabindex="-1">${esc(p.texto)}</h2>
      ${p.ayuda ? `<p class="bv-ayuda">${esc(p.ayuda)}</p>` : ''}
      <fieldset class="bv-ops bv-ops--${f}${p.tipo === 'multiple' ? ' bv-ops--multiple' : ''}" aria-labelledby="bv-titulo">${(p.opciones || []).map((o, j) => opcion(p, o, j, f)).join('')}</fieldset>
      ${p.tipo === 'multiple' ? '<p class="bv-q__limite" data-bv-limite aria-live="polite"></p>' : ''}
    </div>`;
  }

  function recomendados(): Curso[] {
    const intereses = preguntas.find((p) => p.id === 'intereses');
    return cursosPorIntereses(intereses ? elegidas(intereses) : [], 3);
  }

  function cierre() {
    const recs = recomendados();
    const pal = levanta();
    return `<div class="bv-fin">
      <span class="bv-fin__sello">${CHECK}</span>
      <h2 class="bv-q__t display" tabindex="-1">${pal(`Listo${nombre ? `, ${nombre}` : ''}.`)} <em>${pal('Tu club ya te conoce.')}</em></h2>
      <p class="bv-ayuda">Gracias por tomarte el minuto. Tus respuestas ya ordenan tu inicio y el catálogo "Para ti", y nos ayudan a decidir qué contenido producir.</p>
      <ul class="bv-fin__resumen" aria-label="Tus respuestas">${preguntas.flatMap((p) => etiquetas(p)).map((e, i) => `<li style="--i:${i}">${esc(e)}</li>`).join('')}</ul>
      ${recs.length ? `<div class="bv-recs">
        <span class="bv-eti">Para empezar, según tus intereses</span>
        ${recs.map((c, i) => `<a class="bv-rec" href="#/curso/${c.id}" style="--i:${i}"><img src="${esc(c.portada)}" alt="" loading="lazy"><span><small>${esc(c.area)} · ${esc(c.nivel)}</small><strong>${esc(c.titulo)}</strong></span><i data-lucide="arrow-up-right" class="i"></i></a>`).join('')}
      </div>` : ''}
    </div>`;
  }

  // ── Pintado ──
  // Se actualiza fila por fila (sin repintar la lista) para animar sólo la respuesta que cambió.
  function pintarPerfil() {
    let hechos = 0;
    // Se puede saltar a cualquier pregunta ya contestada y a la primera pendiente.
    const pendiente = preguntas.findIndex((p) => !respondida(p));
    const limite = pendiente === -1 ? total - 1 : pendiente;
    preguntas.forEach((p, i) => {
      const li = filasPerfil[i];
      li.querySelector<HTMLButtonElement>('button')!.disabled = paso >= total || enviando || i > limite || i === paso;
      const l = etiquetas(p);
      const valor = l.length > 2 ? `${l.slice(0, 2).join(', ')} +${l.length - 2}` : l.join(', ');
      if (valor) hechos++;
      li.classList.toggle('is-hecho', !!valor);
      li.classList.toggle('is-actual', i === paso);
      if (valor === valoresPerfil[i]) return;
      if (!valor !== !valoresPerfil[i]) li.querySelector('.bv__perfil-n')!.innerHTML = valor ? CHECK : String(i + 1);
      valoresPerfil[i] = valor;
      li.querySelector('.bv__perfil-v')!.textContent = valor;
      li.classList.remove('is-nuevo');
      if (valor) { void li.offsetWidth; li.classList.add('is-nuevo'); }
    });
    raiz!.querySelector('[data-bv-hechos]')!.textContent = `${hechos}/${total}`;
  }

  function pintarAvance() {
    const hechos = paso >= total ? total : Math.max(0, paso);
    const barra = raiz!.querySelector<HTMLElement>('[data-bv-progreso]')!;
    barra.setAttribute('aria-valuenow', String(hechos));
    barra.setAttribute('aria-valuetext', paso === INTRO ? 'Sin empezar' : paso >= total ? 'Completado' : `Pregunta ${paso + 1} de ${total}`);
    raiz!.dataset.foto = String(paso < 2 || paso >= total ? 0 : paso < 5 ? 1 : 2);
    [...barra.children].forEach((s, i) => s.className = i < hechos ? 'is-hecho' : i === paso ? 'is-actual' : '');
    raiz!.querySelector('[data-bv-cuenta]')!.textContent = paso === INTRO ? `${total} preguntas` : paso >= total ? 'Completado' : `${paso + 1} de ${total}`;
  }

  function pintarPie() {
    const flecha = (icono: string) => `<span class="arrow"><i data-lucide="${icono}" class="i${icono === 'loader-circle' ? ' spin' : ''}"></i></span>`;
    if (paso === INTRO) pie.innerHTML = `<span class="bv__nota">Puedes regresar y cambiar tus respuestas antes de terminar.</span><button class="btn btn--brand btn--lg btn--pill-arrow" type="button" data-bv-accion="seguir">Empezar ${flecha('arrow-right')}</button>`;
    else if (paso >= total) pie.innerHTML = `<span class="bv__nota">Tus respuestas quedaron guardadas.</span><button class="btn btn--brand btn--lg btn--pill-arrow" type="button" data-bv-accion="seguir">Entrar al club ${flecha('arrow-right')}</button>`;
    else {
      const ultimo = paso === total - 1;
      pie.innerHTML = `<button class="btn btn--ghost" type="button" data-bv-accion="atras" ${enviando ? 'disabled' : ''}><i data-lucide="arrow-left" class="i"></i>Atrás</button>
        <span class="bv__tecla" aria-hidden="true">o presiona <kbd>Enter ↵</kbd></span>
        <button class="btn btn--brand btn--lg btn--pill-arrow" type="button" data-bv-accion="seguir" ${enviando || !respondida(preguntas[paso]) ? 'disabled' : ''}>${enviando ? 'Guardando…' : ultimo ? 'Terminar' : 'Continuar'} ${flecha(enviando ? 'loader-circle' : ultimo ? 'check' : 'arrow-right')}</button>`;
    }
    createIcons({ icons });
  }

  // Opción múltiple: al llegar al máximo se bloquean las no elegidas en lugar de regañar después.
  function aplicarLimite() {
    const p = preguntas[paso];
    if (!p || p.tipo !== 'multiple') return;
    const n = elegidas(p).length;
    const max = p.max || p.opciones?.length || 0;
    escena.querySelectorAll<HTMLInputElement>('.bv-op input').forEach((x) => { x.disabled = !x.checked && n >= max; });
    const limite = escena.querySelector('[data-bv-limite]');
    if (limite) limite.textContent = n >= max ? `Listo, elegiste ${max}. Quita una si quieres cambiar.` : `Elige hasta ${max} · llevas ${n}`;
  }

  function confeti() {
    const sello = escena.querySelector<HTMLElement>('.bv-fin__sello');
    if (quieto || !sello) return;
    const colores = ['#4a7fc1', '#6fbfb0', '#20254b', '#e0a341', '#9bd9cc'];
    const capa = document.createElement('span');
    capa.className = 'bv-confeti';
    capa.setAttribute('aria-hidden', 'true');
    capa.innerHTML = Array.from({ length: 36 }, (_, i) => {
      const angulo = (i / 36) * Math.PI * 2 + Math.random() * .5;
      const distancia = 70 + Math.random() * 140;
      return `<i style="--x:${Math.round(Math.cos(angulo) * distancia)}px;--y:${Math.round(Math.sin(angulo) * distancia - 30)}px;--r:${Math.round(Math.random() * 720 - 360)}deg;--c:${colores[i % colores.length]};--t:${(.9 + Math.random() * .7).toFixed(2)}s;--w:${Math.round(5 + Math.random() * 5)}px"></i>`;
    }).join('');
    sello.appendChild(capa);
    setTimeout(() => capa.remove(), 2200);
  }

  // La escena anterior sale (hacia el lado contrario al avance) antes de que entre la nueva.
  function pintar(atras = false) {
    clearTimeout(auto); clearTimeout(salida);
    if (paso < total) guardarBorrador();
    raiz!.dataset.escena = paso === INTRO ? 'intro' : paso >= total ? 'cierre' : 'pregunta';
    escena.style.setProperty('--dir', atras ? '-1' : '1');
    pintarPerfil(); pintarAvance(); pintarPie();
    const entrar = () => {
      escena.classList.remove('is-sale'); escena.inert = false;
      escena.innerHTML = paso === INTRO ? intro() : paso >= total ? cierre() : pregunta(preguntas[paso], paso);
      createIcons({ icons }); aplicarLimite();
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      escena.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true });
      if (paso >= total) confeti();
    };
    if (quieto || !escena.firstElementChild) { entrar(); return; }
    escena.inert = true; escena.classList.add('is-sale');
    salida = window.setTimeout(entrar, 190);
  }

  // ── Acciones ──
  // La página se desvanece antes de entrar al club, en lugar de cortar en seco.
  // Si llegó con un enlace directo (un curso, una clase en vivo), al terminar va a ese destino.
  let saliendo = false;
  function salir() {
    if (saliendo) return;
    saliendo = true; clearTimeout(auto); clearTimeout(salida);
    let destino = '/';
    try { destino = sessionStorage.getItem(DESTINO_KEY) || '/'; sessionStorage.removeItem(DESTINO_KEY); } catch {}
    if (quieto) { navigate(destino); return; }
    raiz!.classList.add('is-saliendo');
    setTimeout(() => navigate(destino), 330);
  }

  async function enviar() {
    enviando = true; pintarPie(); pintarPerfil();
    try {
      await responderEncuesta(encuesta!, respuestas);
      enviando = false; borrarBorrador(); paso = total; pintar();
    } catch (e: any) {
      enviando = false;
      // 409: ya se respondió desde otra sesión; no hay nada que repetir.
      if (e?.status === 409) { borrarBorrador(); try { await cargarEncuestas(true); } catch {} navigate('/'); return; }
      pintarPie(); pintarPerfil(); toast(mensajeError(e), 'alert-triangle');
    }
  }

  function seguir() {
    clearTimeout(auto);
    if (enviando || saliendo) return;
    if (paso === INTRO) { paso = 0; pintar(); return; }
    if (paso >= total) { salir(); return; }
    if (!respondida(preguntas[paso])) {
      const ops = escena.querySelector<HTMLElement>('.bv-ops');
      ops?.classList.remove('is-aviso'); void ops?.offsetWidth; ops?.classList.add('is-aviso');
      return;
    }
    if (paso < total - 1) { paso++; pintar(); return; }
    enviar();
  }

  raiz.addEventListener('change', (e) => {
    const input = e.target as HTMLInputElement;
    const p = preguntas[paso];
    if (!p || !input.matches('.bv-op input')) return;
    if (p.tipo === 'multiple') respuestas[p.id] = [...escena.querySelectorAll<HTMLInputElement>('.bv-op input:checked')].map((x) => x.value);
    else respuestas[p.id] = input.value;
    if (!elegidas(p).length) delete respuestas[p.id];
    guardarBorrador(); aplicarLimite(); pintarPerfil();
    if (input.checked) try { navigator.vibrate?.(8); } catch {}
    const boton = pie.querySelector<HTMLButtonElement>('[data-bv-accion="seguir"]');
    if (boton) boton.disabled = !respondida(p);
  });

  raiz.addEventListener('click', async (e) => {
    const el = e.target as HTMLElement;
    const accion = el.closest<HTMLElement>('[data-bv-accion]')?.dataset.bvAccion;
    if (accion === 'seguir') { seguir(); return; }
    if (accion === 'atras') { if (!enviando) { paso = Math.max(INTRO, paso - 1); pintar(true); } return; }
    const ir = el.closest<HTMLButtonElement>('[data-bv-ir]');
    if (ir && !ir.disabled) { const destino = Number(ir.dataset.bvIr); const atras = destino < paso; paso = destino; pintar(atras); return; }
    if (accion === 'posponer') {
      const boton = el.closest<HTMLButtonElement>('button')!; boton.disabled = true;
      try { guardarBorrador(); await posponerEncuesta(encuesta!); toast('Te la recordaremos en unos días', 'clock-3'); salir(); }
      catch (err) { boton.disabled = false; toast(mensajeError(err), 'alert-triangle'); }
      return;
    }
    // Opción única elegida con toque o clic: avanza sola (con teclado se usa Enter o Continuar).
    // El clic real cae en la etiqueta; el del input es el sintético que genera el navegador.
    if (el.closest('.bv-op') && !(el instanceof HTMLInputElement)) avanzarSola();
  });

  function avanzarSola() {
    const p = preguntas[paso];
    if (p?.tipo !== 'opcion' || paso >= total - 1) return;
    clearTimeout(auto);
    auto = window.setTimeout(() => { if (respondida(p)) seguir(); }, 420);
  }

  // Reflejo que sigue al cursor dentro de cada opción.
  raiz.addEventListener('pointermove', (e) => {
    const op = (e.target as HTMLElement).closest<HTMLElement>('.bv-op');
    if (!op || e.pointerType !== 'mouse') return;
    const r = op.getBoundingClientRect();
    op.style.setProperty('--mx', `${e.clientX - r.left}px`);
    op.style.setProperty('--my', `${e.clientY - r.top}px`);
  });

  // Teclado: Enter continúa y las letras A, B, C… eligen la opción que las muestra.
  // Vive en document para que funcione aunque el foco no esté dentro de la página; se retira sola al salir.
  function teclas(e: KeyboardEvent) {
    if (!raiz!.isConnected) { document.removeEventListener('keydown', teclas); return; }
    if (e.ctrlKey || e.metaKey || e.altKey || saliendo || escena.inert) return;
    if (e.key === 'Enter') {
      if ((e.target as HTMLElement).closest?.('button, a')) return;
      e.preventDefault(); seguir(); return;
    }
    const n = e.key.length === 1 ? LETRAS.indexOf(e.key.toUpperCase()) : -1;
    const input = n >= 0 ? escena.querySelectorAll<HTMLInputElement>('.bv-op input')[n] : null;
    if (!input || input.disabled) return;
    e.preventDefault();
    input.checked = input.type === 'checkbox' ? !input.checked : true;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    avanzarSola();
  }
  document.addEventListener('keydown', teclas);

  pintar();
}
