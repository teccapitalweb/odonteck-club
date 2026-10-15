// Retos · el arcade del club. Mini-app autónoma: hub + Quiz Relámpago, Detective
// Dental y Flashcards. Todo el contenido sale de los cursos (quizzes y notas).
import { createIcons, icons } from 'lucide';
import { esc, iniciales } from '../ui/partials';
import {
  nivel, nivelConXPJuegos, retoDiario, completarDiaria, bancoPreguntas, barajar, calificarPreguntaReto, type Pregunta,
  mazoDeHoy, repasarCarta, estatsMazo, type Flashcard, type Calidad, type SR,
  obtenerSR, restaurarSR, pendientesHoy, proximoRepaso, areasPreguntas, misiones,
  casos, resolverCaso, casosResueltos, casoResuelto, registrarQuiz, mejorQuiz, statsQuiz, type Caso,
} from '../core/juegos';
import { Acceso, mostrarPaywall } from '../core/acceso';
import { Liga } from '../core/liga';
import { Datos } from '../core/datos';
import { RetosRemotos, type PreguntaSesionReto } from '../core/retos-remotos';
import { current } from '../core/router';

type Vista = 'hub' | 'quiz' | 'caso' | 'flash' | 'diaria' | 'liga';
let vista: Vista = 'hub';
let timer: number | null = null;
let globalesMontados = false;
const parar = () => { if (timer) { clearInterval(timer); timer = null; } };

// estados de cada juego
type ModoQuiz = 'relampago' | 'practica';
interface QuizState {
  preguntas: (Pregunta & { remota?: PreguntaSesionReto })[];
  idx: number;
  score: number;
  vidas: number;
  combo: number;
  mejorCombo: number;
  aciertos: number;
  contestada: boolean;
  restante: number;
  modo: ModoQuiz;
  area: string;
  xpGanado: number;
}
let Q: QuizState | null = null;
interface CasoState {
  caso: Caso;
  paso: 'dx' | 'plan';
  dxOk: boolean;
  planOk: boolean;
  contestada: boolean;
}
let C: CasoState | null = null;
interface FlashState {
  cartas: Flashcard[];
  idx: number;
  volteada: boolean;
  historial: { id: string; cal: Calidad; prevSR: SR | null; idx: number }[];
}
let F: FlashState | null = null;
let D: { p: Pregunta; contestada: boolean } | null = null;

const root = () => document.getElementById('arcade');
function pinta(html: string) { const r = root(); if (!r) return; r.innerHTML = html; createIcons({ icons }); }
const iconos = () => createIcons({ icons });
const repintarHub = () => {
  if (!current().path.startsWith('/retos')) return;
  if (vista === 'hub') hub();
  else if (vista === 'quiz' && root()?.querySelector('.ar-mode-grid')) bibliotecaQuiz();
};

// ══════════════ PÁGINA ══════════════
export function retos() {
  return `<section class="arcade-page"><div id="arcade" class="stack" style="gap:24px"></div></section>`;
}

export function montarArcade() {
  const r = root();
  if (!r || r.dataset.mounted) return;
  r.dataset.mounted = '1';
  vista = 'hub'; parar();
  r.addEventListener('click', onClick);
  if (!globalesMontados) {
    document.addEventListener('keydown', onKey);
    window.addEventListener('retos:cambio', repintarHub);
    globalesMontados = true;
  }
  hub();
}

function onClick(e: Event) {
  const el = (e.target as HTMLElement).closest<HTMLElement>('[data-a]');
  if (!el) return;
  const a = el.dataset.a!;
  const acciones: Record<string, () => void> = {
    hub: () => { parar(); vista = 'hub'; hub(); },
    'retos-retry': () => { void RetosRemotos.cargar(true); hub(); },
    'ir-liga': vistaLiga,
    'ir-quiz': bibliotecaQuiz, 'quiz-jugar': () => iniciarQuiz(el.dataset.area || 'Todas', (el.dataset.modo || 'relampago') as ModoQuiz), 'quiz-resp': () => responderQuiz(+el.dataset.i!), 'quiz-enviar': enviarQuiz, 'quiz-move': () => moverQuiz(el), 'quiz-sig': sigQuiz,
    'ir-caso': () => elegirCaso(), 'caso-jugar': () => iniciarCaso(el.dataset.id!),
    'caso-resp': () => respCaso(+el.dataset.i!), 'caso-sig': sigCaso,
    'ir-flash': iniciarFlash, 'flash-flip': flipFlash, 'flash-cal': () => calFlash(el.dataset.cal as Calidad), 'flash-undo': undoFlash,
    'ir-diaria': iniciarDiaria, 'diaria-resp': () => respDiaria(+el.dataset.i!),
  };
  acciones[a]?.();
}

// ══════════════ HUB ══════════════
function hub() {
  vista = 'hub';
  const remoto = RetosRemotos.resumen();
  const esApi = Datos.modo === 'api';
  const nv = esApi && remoto ? nivelConXPJuegos(remoto.estado.xp) : nivel();
  const d = retoDiario();
  const em = estatsMazo();
  const totalCasos = casos().length;
  const banco = esApi ? (remoto?.disponibilidad.preguntas || 0) : bancoPreguntas().length;
  const racha = esApi ? (remoto?.estado.racha || 0) : d.racha;
  const recomendacion = remoto?.recomendacion || (!esApi && areasPreguntas()[0] ? { area: areasPreguntas()[0], preguntas: Acceso.vip() ? 8 : 3, minutos: 6, motivo: 'Una sesión breve para mantener activo tu criterio clínico.' } : null);
  const dominio = remoto?.estado.dominio?.length
    ? remoto.estado.dominio.slice(0, 4)
    : (remoto?.disponibilidad.areas || []).slice(0, 4).map((item) => ({ area: item.area, aciertos: 0, total: 0, precision: 0, estado: 'Por explorar', ultima: null }));
  const errorRemoto = esApi ? RetosRemotos.error() : null;
  const sinRemoto = esApi && !remoto;
  const cargando = sinRemoto && !errorRemoto;
  const dato = (v: string | number) => (sinRemoto ? (errorRemoto ? '—' : '…') : v);
  pinta(`
    <div class="ar-hub">
    <header class="ar-intro">
      <div class="ar-intro__copy">
        <span class="ar-kicker"><i data-lucide="activity" class="i"></i> Entrenamiento clínico adaptativo</span>
        <h1>Entrena lo que más te hará avanzar.</h1>
        <p>Sesiones breves que convierten tus cursos, errores y repasos pendientes en práctica clínica útil.</p>
      </div>
      <span class="ar-streak"><i data-lucide="flame" class="i"></i><span><small>Constancia actual</small><strong>${sinRemoto ? dato(racha) : `${racha} ${racha === 1 ? 'día' : 'días'}`}</strong></span></span>
    </header>

    ${errorRemoto ? `<div class="ar-sync-error"><i data-lucide="cloud-off" class="i"></i><div><strong>No pudimos preparar tus datos de entrenamiento.</strong><span>${esc(errorRemoto)}</span></div><button class="btn btn--secondary btn--sm" data-a="retos-retry">Reintentar</button></div>` : ''}

    <section class="ar-command-grid">
      <article class="ar-prescription">
        <div class="ar-prescription__head"><span><i data-lucide="crosshair" class="i"></i>Tu siguiente mejor paso</span><small>${recomendacion?.minutos || 5} min</small></div>
        <div class="ar-prescription__copy">
          <span class="eyebrow">Sesión recomendada</span>
          <h2>${recomendacion ? `Refuerza ${esc(recomendacion.area)}` : cargando ? 'Preparando tu sesión recomendada' : 'Tu entrenamiento estará listo pronto'}</h2>
          <p>${recomendacion ? esc(recomendacion.motivo) : cargando ? 'Revisamos tu desempeño y las preguntas disponibles para tu acceso.' : 'Aún no hay preguntas aprobadas disponibles para tu acceso.'}</p>
        </div>
        <div class="ar-prescription__meta">
          <span><i data-lucide="list-checks" class="i"></i>${dato(recomendacion?.preguntas || 0)} preguntas</span>
          <span><i data-lucide="graduation-cap" class="i"></i>Modo práctica</span>
          <span><i data-lucide="shield-check" class="i"></i>Feedback clínico</span>
        </div>
        <button class="btn btn--brand btn--lg btn--pill-arrow" data-a="quiz-jugar" data-modo="practica" data-area="${esc(recomendacion?.area || 'Todas')}" ${recomendacion ? '' : 'disabled'}>Comenzar sesión <span class="arrow"><i data-lucide="arrow-right" class="i"></i></span></button>
      </article>

      <aside class="ar-mastery">
        <div class="ar-mastery__title"><div><span class="eyebrow">Mapa de dominio</span><h2>Tu criterio por área</h2></div><span class="ar-level-dot" style="--c:${nv.color}"><i data-lucide="${nv.icon}" class="i"></i></span></div>
        ${dominio.length ? `<div class="ar-mastery__list">${dominio.map((item) => `<div class="ar-mastery__row"><div><strong>${esc(item.area)}</strong><small>${esc(item.estado)}</small></div><span>${item.total ? `${item.precision}%` : 'Nuevo'}</span><div class="ar-mastery__bar"><i style="width:${item.total ? Math.max(6, item.precision) : 3}%"></i></div></div>`).join('')}</div>` : cargando ? '<div class="ar-mastery__empty"><i data-lucide="loader-circle" class="i spin"></i><p>Cargando tu mapa clínico…</p></div>' : '<div class="ar-mastery__empty"><i data-lucide="radar" class="i"></i><p>Completa tu primera sesión para construir tu mapa clínico.</p></div>'}
        <div class="ar-mastery__level"><span>Nivel ${dato(`${nv.indice + 1} · ${nv.nombre}`)}</span><strong>${dato(nv.xp)} XP</strong><div><i style="width:${sinRemoto ? 0 : nv.pct}%"></i></div><small>${sinRemoto ? (cargando ? 'Sincronizando tu progreso…' : '') : nv.siguiente ? `${nv.faltan} XP para ${nv.siguiente.nombre}` : 'Nivel máximo alcanzado'}</small></div>
      </aside>
    </section>

    <div class="ar-evidence-strip">
      <div><strong>${esApi ? dato(`${remoto?.estado.quiz.precision ?? 0}%`) : mejorQuiz()}</strong><span>${esApi ? 'precisión acumulada' : 'mejor quiz'}</span></div>
      <div><strong>${casosResueltos()}/${totalCasos}</strong><span>casos resueltos</span></div>
      <div><strong>${em.dominadas}</strong><span>tarjetas dominadas</span></div>
      <div><strong>${dato(banco)}</strong><span>preguntas disponibles</span></div>
    </div>

    <div class="ar-feature-row">
    ${esApi ? `<div class="league-mini league-mini--soon">
      <div class="league-mini__head"><span class="league-mini__ic"><i data-lucide="users-round" class="i"></i></span><div><small>Ligas del Club</small><strong>Competencia real, justa y voluntaria</strong></div></div>
      <span class="league-mini__soon">Próximamente</span>
    </div>` : (() => { const liga = Liga.resumen(); const yo = liga.yo; const top3 = liga.clasificacion.slice(0, 3); return `
    <button class="league-mini" data-a="ir-liga">
      <div class="league-mini__head">
        <span class="league-mini__ic"><i data-lucide="trophy" class="i"></i></span>
        <div><small>Clasificación del Club</small><strong>${yo ? `Puesto #${yo.puesto}` : 'Ver ranking'} · ${liga.participantes} miembros</strong></div>
      </div>
      <div class="league-mini__podium">
        ${top3.map((f, i) => `<div class="league-mini__slot"><span class="league-mini__avatar${f.esYo ? ' is-me' : ''}">${iniciales(f.nombre)}</span><small>${['🥇','🥈','🥉'][i]}</small></div>`).join('')}
      </div>
      <i data-lucide="chevron-right" class="i league-mini__arr"></i>
    </button>`; })()}

    ${esApi ? `<div class="ar-daily ar-daily--insight"><span class="ar-daily__ic"><i data-lucide="calendar-check-2" class="i"></i></span><span class="ar-daily__tx"><strong>${cargando ? 'Revisando tu constancia…' : racha ? `Llevas ${racha} ${racha === 1 ? 'día' : 'días'} entrenando` : 'Tu constancia empieza hoy'}</strong><span class="faint">Una sesión corta y bien elegida vale más que acumular puntos sin propósito.</span></span></div>` : `<button class="ar-daily ${d.hechoHoy ? 'is-done' : ''}" data-a="ir-diaria" ${d.hechoHoy ? 'disabled' : ''}>
      <span class="ar-daily__ic">${d.hechoHoy ? '<i data-lucide="check-check" class="i"></i>' : `<img src="/brand/icon-reto-diario.jpg" alt="Reto diario" style="width:100%;height:100%;object-fit:cover;border-radius:inherit">`}</span>
      <span class="ar-daily__tx">
        <strong>Reto diario ${d.racha > 0 ? `· racha ${d.racha}` : ''}</strong>
        <span class="faint">${d.hechoHoy ? '¡Listo por hoy! Vuelve mañana para mantener tu racha.' : 'Una pregunta rápida para sumar XP y racha.'}</span>
      </span>
      ${d.hechoHoy ? '' : '<i data-lucide="arrow-right" class="i"></i>'}
    </button>`}
    </div>

    <section class="ar-training">
    <header class="ar-section-intro"><div><span class="ar-kicker ar-kicker--light">Elige tu reto</span><h2>¿Qué quieres entrenar hoy?</h2></div><p>Sesiones cortas para avanzar a tu ritmo.</p></header>
    <div class="ar-grid">
      ${tile('ir-quiz', '/brand/icon-quiz.jpg', 'Banco clínico', `${dato(banco)} preguntas · estudio o simulación`, '#4a7fc1')}
      ${tile('ir-caso', '/brand/icon-detective.jpg', 'Detective Dental', `Diagnostica ${totalCasos} casos clínicos paso a paso`, '#4fa899')}
      ${(() => { const pend = pendientesHoy(); const lim = Acceso.vip() ? 15 : 5; return tile('ir-flash', '/brand/icon-flashcards.jpg', 'Flashcards', pend ? `${Math.min(pend, lim)} para hoy · ${em.total} tarjetas` : `Todo repasado · ${em.dominadas} dominadas`, '#c98a5b'); })()}
    </div>
    </section>

    ${esApi ? `<div class="ar-integrity"><span><i data-lucide="badge-check" class="i"></i></span><div><strong>Progreso clínico verificable</strong><p>Tus respuestas se califican en el servidor y construyen un mapa personal. Nunca mostramos soluciones antes de contestar ni participantes ficticios en producción.</p></div></div>` : (() => { const m = misiones(); return `
    <div class="ar-misiones">
      <div class="ar-misiones__head"><span><i data-lucide="target" class="i"></i></span><div><small>Misión semanal</small><strong>${m.pct}% completada</strong></div></div>
      <div class="ar-misiones__bar"><span style="width:${m.pct}%"></span></div>
      <ul>${m.items.map((mi) => `<li class="${mi.ok ? 'is-done' : ''}"><span><i data-lucide="${mi.ok ? 'check' : 'circle'}" class="i"></i></span><div><strong>${mi.titulo}</strong><small>${mi.desc}</small></div></li>`).join('')}</ul>
      <span class="ar-misiones__reward"><i data-lucide="gift" class="i"></i>Completa las 3 para dominar la semana</span>
    </div>`; })()}

    <p class="ar-footnote"><i data-lucide="book-open-check" class="i"></i> El contenido de los retos se genera a partir de los cursos, quizzes y notas del Club.</p>
    </div>
  `);
}
const tile = (a: string, img: string, tit: string, sub: string, color: string) => `
  <button class="ar-tile" data-a="${a}" style="--c:${color}">
    <span class="ar-tile__visual"><img class="ar-tile__icon" src="${img}" alt=""><span>${String(['ir-quiz', 'ir-caso', 'ir-flash'].indexOf(a) + 1).padStart(2, '0')}</span></span>
    <span class="ar-tile__tag">${a === 'ir-quiz' ? 'Velocidad y conocimiento' : a === 'ir-caso' ? 'Razonamiento clínico' : 'Repaso inteligente'}</span>
    <strong>${tit}</strong><span class="faint">${sub}</span>
    <span class="ar-tile__action">${a === 'ir-quiz' ? 'Elegir modo' : a === 'ir-caso' ? 'Resolver casos' : 'Repasar tarjetas'}<i data-lucide="arrow-right" class="i"></i></span>
  </button>`;

const barra = () => `<button class="btn btn--ghost btn--sm" data-a="hub"><i data-lucide="arrow-left" class="i"></i>Retos</button>`;

// ══════════════ LIGA / CLASIFICACIÓN ══════════════
function vistaLiga() {
  vista = 'liga';
  const liga = Liga.resumen();
  const top3 = liga.clasificacion.slice(0, 3);
  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;
  const heights = ['120px', '160px', '90px'];
  const medals = ['🥈', '🥇', '🥉'];

  pinta(`${barra()}
    <div class="league-view">
      <div class="league-hero">
        <span class="chip chip--accent"><i data-lucide="trophy" class="i"></i>Clasificación</span>
        <h2 class="display" style="font-size:var(--fs-2xl)">Club OdonTeck</h2>
        <p class="muted">${liga.participantes} participantes${liga.esDemo ? ' · datos de demostración' : ''}</p>
      </div>

      ${top3.length >= 3 ? `<div class="league-podium">
        ${podiumOrder.map((f, i) => `
          <div class="league-podium__slot ${f.esYo ? 'is-me' : ''}">
            <span class="league-podium__medal">${medals[i]}</span>
            <span class="league-podium__avatar${f.esYo ? ' is-me' : ''}">${iniciales(f.nombre)}</span>
            <strong>${esc(f.nombre)}</strong>
            <span class="faint">${f.xp.toLocaleString()} XP</span>
            <div class="league-podium__bar" style="height:${heights[i]}"></div>
          </div>`).join('')}
      </div>` : ''}

      <div class="league-ranking">
        ${liga.clasificacion.map((f) => `
          <div class="league-row ${f.esYo ? 'is-me' : ''}">
            <span class="league-row__pos">${f.puesto <= 3 ? ['🥇', '🥈', '🥉'][f.puesto - 1] : f.puesto}</span>
            <span class="league-row__avatar">${iniciales(f.nombre)}</span>
            <div class="league-row__info">
              <strong>${esc(f.nombre)}${f.esYo ? ' (tú)' : ''}</strong>
              <span class="faint">${f.nivel} · ${f.clases} clases · ${f.cursos} cursos</span>
            </div>
            <span class="league-row__xp">${f.xp.toLocaleString()} XP</span>
          </div>`).join('')}
      </div>

      ${liga.esDemo ? '<p class="faint" style="font-size:var(--fs-xs);text-align:center;margin-top:12px">Datos de demostración. Con la API conectada verás la clasificación real.</p>' : ''}
    </div>`);
}

// ══════════════ QUIZ RELÁMPAGO / PRÁCTICA ══════════════
const TIEMPO = 15; // seg por pregunta
const iconoArea = (area: string): string => {
  const m: Record<string, string> = { 'Ortodoncia': 'align-horizontal-justify-center', 'Cariología': 'search', 'Odontopediatría': 'baby', 'Cirugía': 'scissors', 'Periodoncia': 'activity', 'Materiales': 'box', 'Estética': 'sparkles', 'Endodoncia': 'scan', 'Medicina bucal': 'shield-plus' };
  return m[area] || 'book-open';
};
const modoCard = (modo: string, area: string, icon: string, titulo: string, texto: string, meta: string, color: string) =>
  `<button class="ar-mode-card" data-a="quiz-jugar" data-modo="${modo}" data-area="${esc(area)}" style="--mode:${color}"><span class="ar-mode-card__ic"><i data-lucide="${icon}" class="i"></i></span><strong>${titulo}</strong><p>${texto}</p><small>${meta}<i data-lucide="arrow-right" class="i"></i></small></button>`;

function bibliotecaQuiz() {
  vista = 'quiz'; parar();
  const remoto = RetosRemotos.resumen();
  const preguntas = Datos.modo === 'api' ? remoto?.disponibilidad.preguntas || 0 : bancoPreguntas().length;
  const areas = Datos.modo === 'api' ? (remoto?.disponibilidad.areas || []).map((item) => item.area) : areasPreguntas();
  const sq = statsQuiz();
  pinta(`${barra()}
    <div class="ar-head" style="margin-bottom:8px">
      <span class="chip chip--primary"><i data-lucide="brain-circuit" class="i"></i>Banco clínico</span>
      <h2 class="display" style="font-size:var(--fs-2xl)">Elige cómo quieres entrenar</h2>
      <p class="muted">${preguntas} ${Datos.modo === 'api' ? 'preguntas aprobadas' : 'reactivos del demo'} · ${areas.length} áreas${Datos.modo === 'api' && remoto ? ` · ${remoto.estado.quiz.precision}% de precisión acumulada` : ` · récord ${sq.mejor}`}</p>
    </div>
    <div class="ar-mode-grid">
      ${modoCard('practica', 'Todas', 'graduation-cap', 'Estudio guiado', 'Sin reloj · feedback clínico después de cada respuesta', `${Acceso.vip() ? 10 : 3} preguntas`, '#4fa899')}
      ${modoCard('relampago', 'Todas', 'timer', 'Simulación', '15 segundos · vidas y presión controlada', `${Acceso.vip() ? 8 : 3} preguntas`, '#4a7fc1')}
    </div>
    <div class="ar-section-head"><span class="eyebrow">Por área</span><span class="faint">${preguntas} reactivos</span></div>
    <div class="ar-grid">${areas.map((area) => {
      const n = Datos.modo === 'api' ? remoto?.disponibilidad.areas.find((item) => item.area === area)?.total || 0 : bancoPreguntas().filter((p) => p.area === area).length;
      return `<button class="ar-tile" data-a="quiz-jugar" data-area="${esc(area)}" data-modo="practica" style="--c:#4a7fc1"><span class="ar-tile__ic"><i data-lucide="${iconoArea(area)}" class="i"></i></span><strong>${esc(area)}</strong><span class="faint">${n} preguntas · estudio guiado</span><span class="ar-tile__go"><i data-lucide="arrow-up-right" class="i"></i></span></button>`;
    }).join('')}</div>`);
}

async function iniciarQuiz(area = 'Todas', modo: ModoQuiz = 'relampago') {
  let pool: (Pregunta & { remota?: PreguntaSesionReto })[];
  if (Datos.modo === 'api') {
    pinta(`${barra()}<div class="ar-loading"><i data-lucide="loader-circle" class="i spin"></i><strong>Preparando tu sesión</strong><span>Seleccionamos preguntas aprobadas según tu acceso y desempeño.</span></div>`);
    try {
      const sesion = await RetosRemotos.crearSesion(modo, area);
      pool = sesion.preguntas.map((pregunta) => ({
        id: pregunta.ref,
        curso: pregunta.curso,
        area: pregunta.area,
        tipo: pregunta.tipo,
        q: pregunta.q,
        instruccion: pregunta.instruccion,
        opciones: pregunta.opciones || [],
        elementos: pregunta.elementos,
        izquierda: pregunta.izquierda,
        derecha: pregunta.derecha,
        plantilla: pregunta.plantilla,
        huecos: pregunta.huecos,
        explicacion: '',
        remota: pregunta,
      }));
    } catch (e) {
      const mensaje = e instanceof Error ? e.message : 'No pudimos preparar el entrenamiento.';
      return pinta(`${barra()}<div class="ar-empty"><i data-lucide="cloud-off" class="i"></i><strong>No se pudo iniciar la sesión</strong><span class="faint">${esc(mensaje)}</span><button class="btn btn--secondary" data-a="ir-quiz">Volver a intentarlo</button></div>`);
    }
  } else {
    pool = barajar(bancoPreguntas().filter((p) => (area === 'Todas' || p.area === area) && (modo !== 'relampago' || p.tipo === 'seleccion')));
  }
  if (!pool.length) return pinta(`${barra()}<div class="ar-empty">Aún no hay preguntas${area !== 'Todas' ? ` de ${area}` : ''} en los cursos.</div>`);
  const lim = Acceso.vip() ? (modo === 'practica' ? 10 : 8) : 3;
  Q = { preguntas: pool.slice(0, lim), idx: 0, score: 0, vidas: 3, combo: 0, mejorCombo: 0, aciertos: 0, contestada: false, restante: TIEMPO, modo, area, xpGanado: 0 };
  vista = 'quiz';
  pintaQuiz();
}
function pintaQuiz() {
  if (!Q) return;
  const p: Pregunta = Q.preguntas[Q.idx];
  parar();
  Q.contestada = false; Q.restante = TIEMPO;
  pinta(`
    <div class="ar-top">${barra()}
      <div class="ar-hud">
        ${Q.modo === 'relampago' ? `<span class="ar-vidas">${'❤'.repeat(Q.vidas)}${'<span class=off>♡</span>'.repeat(3 - Q.vidas)}</span>` : ''}
        <span class="ar-combo ${Q.combo > 1 ? 'on' : ''}">${Q.combo > 1 ? '🔥 x' + Q.combo : ''}</span>
        <span class="ar-score"><i data-lucide="star" class="i"></i>${Q.score}</span>
      </div>
    </div>
    ${Q.modo === 'relampago' ? '<div class="ar-timer"><span id="ar-tbar" style="width:100%"></span></div>' : '<div class="ar-practice-banner"><i data-lucide="graduation-cap" class="i"></i>Modo práctica · piensa con calma</div>'}
    <div class="ar-q">
      <div class="ar-q__meta"><span class="chip chip--primary">${esc(p.area)} · ${Q.idx + 1}/${Q.preguntas.length}</span><span class="ar-q__type">${etiquetaTipo(p.tipo)}</span></div>
      <h2 class="display" style="font-size:var(--fs-xl)">${esc(p.q)}</h2>
      ${p.instruccion ? `<p class="ar-q__instruction">${esc(p.instruccion)}</p>` : ''}
      ${controlPregunta(p)}
      <div id="ar-fb"></div>
    </div>`);
  if (Q.modo !== 'relampago') return;
  const bar = document.getElementById('ar-tbar')!;
  const t0 = Date.now();
  timer = window.setInterval(() => {
    if (!Q) return;
    const pasado = (Date.now() - t0) / 1000; Q.restante = Math.max(0, TIEMPO - pasado);
    bar.style.width = (Q.restante / TIEMPO * 100) + '%';
    if (Q.restante <= 0) { parar(); responderQuiz(null); }
  }, 80);
}
const etiquetaTipo = (tipo: Pregunta['tipo']) => ({ seleccion: 'Una respuesta', seleccion_multiple: 'Varias respuestas', ordenar: 'Secuencia', relacionar: 'Relacionar', completar: 'Completar' }[tipo]);

function controlPregunta(p: Pregunta) {
  if (p.tipo === 'seleccion') return `<div class="ar-opts ar-answer">${p.opciones.map((o, i) => `<button class="ar-opt" data-a="quiz-resp" data-i="${i}"><kbd>${i + 1}</kbd> ${esc(o)}</button>`).join('')}</div>`;
  if (p.tipo === 'seleccion_multiple') return `<form id="ar-answer" class="ar-answer ar-multi" onsubmit="return false">${p.opciones.map((o, i) => `<label><input type="checkbox" name="opcion" value="${i}"><span class="ar-answer__mark">${String.fromCharCode(65 + i)}</span><span>${esc(o)}</span></label>`).join('')}<button type="button" class="btn btn--brand" data-a="quiz-enviar">Comprobar selección</button></form>`;
  if (p.tipo === 'ordenar') return `<div id="ar-answer" class="ar-answer ar-order"><p>Coloca los pasos en la secuencia correcta.</p><div class="ar-order__list">${(p.elementos || []).map((item, i, lista) => `<div class="ar-order__item" data-order-id="${esc(item.id)}"><span class="ar-order__pos">${i + 1}</span><strong>${esc(item.texto)}</strong><span><button type="button" data-a="quiz-move" data-dir="-1" aria-label="Subir" ${i === 0 ? 'disabled' : ''}><i data-lucide="chevron-up" class="i"></i></button><button type="button" data-a="quiz-move" data-dir="1" aria-label="Bajar" ${i === lista.length - 1 ? 'disabled' : ''}><i data-lucide="chevron-down" class="i"></i></button></span></div>`).join('')}</div><button type="button" class="btn btn--brand" data-a="quiz-enviar">Comprobar secuencia</button></div>`;
  if (p.tipo === 'relacionar') return `<form id="ar-answer" class="ar-answer ar-relate" onsubmit="return false">${(p.izquierda || []).map((item) => `<label data-left-id="${esc(item.id)}"><strong>${esc(item.texto)}</strong><i data-lucide="arrow-right" class="i"></i><select class="input"><option value="">Elige la relación…</option>${(p.derecha || []).map((opcion) => `<option value="${esc(opcion.id)}">${esc(opcion.texto)}</option>`).join('')}</select></label>`).join('')}<button type="button" class="btn btn--brand" data-a="quiz-enviar">Comprobar relaciones</button></form>`;
  return `<form id="ar-answer" class="ar-answer ar-complete" onsubmit="return false"><p>${esc(p.plantilla || 'Completa los espacios con el término correcto.')}</p>${(p.huecos || []).map((h, i) => `<label data-gap-id="${esc(h.id)}"><span>${i + 1}</span><strong>${esc(h.etiqueta || `Espacio ${i + 1}`)}</strong><input class="input" autocomplete="off" placeholder="Escribe tu respuesta"></label>`).join('')}<button type="button" class="btn btn--brand" data-a="quiz-enviar">Comprobar respuestas</button></form>`;
}

function moverQuiz(el: HTMLElement) {
  const item = el.closest<HTMLElement>('[data-order-id]');
  if (!item || !Q || Q.contestada) return;
  const dir = Number(el.dataset.dir);
  const lista = item.parentElement!;
  if (dir < 0 && item.previousElementSibling) lista.insertBefore(item, item.previousElementSibling);
  if (dir > 0 && item.nextElementSibling) lista.insertBefore(item.nextElementSibling, item);
  [...lista.querySelectorAll<HTMLElement>('[data-order-id]')].forEach((fila, i, filas) => {
    fila.querySelector<HTMLElement>('.ar-order__pos')!.textContent = String(i + 1);
    const botones = fila.querySelectorAll<HTMLButtonElement>('button');
    botones[0].disabled = i === 0; botones[1].disabled = i === filas.length - 1;
  });
}

function enviarQuiz() {
  if (!Q || Q.contestada) return;
  const p = Q.preguntas[Q.idx];
  const contenedor = document.getElementById('ar-answer');
  if (!contenedor) return;
  let respuesta: unknown;
  if (p.tipo === 'seleccion_multiple') respuesta = [...contenedor.querySelectorAll<HTMLInputElement>('input:checked')].map((x) => Number(x.value));
  else if (p.tipo === 'ordenar') respuesta = [...contenedor.querySelectorAll<HTMLElement>('[data-order-id]')].map((x) => x.dataset.orderId || '');
  else if (p.tipo === 'relacionar') respuesta = Object.fromEntries([...contenedor.querySelectorAll<HTMLElement>('[data-left-id]')].map((fila) => [fila.dataset.leftId || '', fila.querySelector<HTMLSelectElement>('select')!.value]));
  else respuesta = Object.fromEntries([...contenedor.querySelectorAll<HTMLElement>('[data-gap-id]')].map((fila) => [fila.dataset.gapId || '', fila.querySelector<HTMLInputElement>('input')!.value.trim()]));
  const vacia = p.tipo === 'seleccion_multiple' ? !(respuesta as unknown[]).length : Object.values(respuesta as Record<string, unknown>).some((x) => !String(x));
  if (vacia) {
    document.getElementById('ar-fb')!.innerHTML = '<div class="ar-exp bad"><strong>Completa la interacción</strong><p>Responde todos los elementos antes de comprobar.</p></div>';
    return;
  }
  responderQuiz(respuesta);
}

function textoSolucion(p: Pregunta, respuesta: unknown) {
  if (p.tipo === 'seleccion') return p.opciones[Number(respuesta)] || '';
  if (p.tipo === 'seleccion_multiple') return (Array.isArray(respuesta) ? respuesta : []).map((i) => p.opciones[Number(i)]).filter(Boolean).join(' · ');
  if (p.tipo === 'ordenar') return (Array.isArray(respuesta) ? respuesta : []).map((id) => p.elementos?.find((x) => x.id === id)?.texto).filter(Boolean).join(' → ');
  if (p.tipo === 'relacionar') return Object.entries((respuesta || {}) as Record<string, unknown>).map(([a, b]) => `${p.izquierda?.find((x) => x.id === a)?.texto}: ${p.derecha?.find((x) => x.id === b)?.texto}`).join(' · ');
  return Object.entries((respuesta || {}) as Record<string, unknown>).map(([id, valor]) => `${p.huecos?.find((x) => x.id === id)?.etiqueta || id}: ${valor}`).join(' · ');
}

async function responderQuiz(respuesta: unknown) {
  if (!Q || Q.contestada) return; Q.contestada = true; parar();
  const p = Q.preguntas[Q.idx];
  const controles = root()!.querySelectorAll<HTMLInputElement | HTMLButtonElement | HTMLSelectElement>('.ar-answer input, .ar-answer button, .ar-answer select, .ar-opt');
  controles.forEach((control) => { control.disabled = true; });
  let explicacion = p.explicacion;
  let puntos = 0;
  let respuestaCorrecta: unknown = null;
  if (Datos.modo === 'api' && p.remota) {
    document.getElementById('ar-fb')!.innerHTML = '<div class="ar-exp" role="status"><strong class="row" style="gap:8px"><i data-lucide="loader-circle" class="i spin"></i>Calificando…</strong></div>';
    iconos();
    try {
      const resultado = await RetosRemotos.responder(p.remota, respuesta);
      puntos = resultado.puntos;
      respuestaCorrecta = resultado.respuestaCorrecta;
      explicacion = resultado.explicacion;
      Q.xpGanado += resultado.xpGanado;
    } catch (e) {
      Q.contestada = false;
      controles.forEach((control) => { control.disabled = false; });
      const mensaje = e instanceof Error ? e.message : 'No pudimos calificar esta respuesta.';
      document.getElementById('ar-fb')!.innerHTML = `<div class="ar-exp bad"><strong>No se guardó tu respuesta</strong><p>${esc(mensaje)}</p></div>`;
      iconos();
      return;
    }
  } else {
    const resultado = calificarPreguntaReto(p, respuesta);
    puntos = resultado.puntos;
    respuestaCorrecta = resultado.respuestaCorrecta;
  }
  p.explicacion = explicacion;
  const ok = puntos === 1;
  const parcial = puntos > 0 && !ok;
  if (p.tipo === 'seleccion') root()!.querySelectorAll<HTMLButtonElement>('.ar-opt').forEach((b, j) => { if (j === Number(respuestaCorrecta)) b.classList.add('ok'); if (j === Number(respuesta) && !ok) b.classList.add('bad'); });
  if (ok) {
    const bonus = Q.modo === 'relampago' ? Math.round(Q.restante / TIEMPO * 100) : 40;
    const suma = Math.round((100 + bonus) * (1 + Q.combo * 0.1));
    Q.score += suma; Q.combo++; Q.mejorCombo = Math.max(Q.mejorCombo, Q.combo); Q.aciertos++; celebrar('sutil');
  } else { Q.score += Math.round(100 * puntos); if (Q.modo === 'relampago') Q.vidas--; Q.combo = 0; }
  const fin = (Q.modo === 'relampago' && Q.vidas <= 0) || Q.idx >= Q.preguntas.length - 1;
  document.getElementById('ar-fb')!.innerHTML = `
    <div class="ar-exp ${ok ? 'ok' : parcial ? 'partial' : 'bad'}">
      <strong>${ok ? '¡Dominado! ⚡' : parcial ? `Vas bien · ${Math.round(puntos * 100)}%` : 'Revisemos el criterio'}</strong><p>${esc(explicacion || 'Revisa la respuesta correcta antes de continuar.')}</p>
      <div class="ar-solution"><span>Solución revisada</span><strong>${esc(textoSolucion(p, respuestaCorrecta))}</strong></div>
      <button class="btn btn--brand" data-a="quiz-sig">${fin ? 'Ver resultado' : 'Siguiente'} <kbd>Enter</kbd> <i data-lucide="arrow-right" class="i"></i></button>
    </div>`;
  iconos();
  const r = root()!; r.querySelector('.ar-exp')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
function sigQuiz() {
  if (!Q) return;
  if ((Q.modo === 'relampago' && Q.vidas <= 0) || Q.idx >= Q.preguntas.length - 1) return finQuiz();
  Q.idx++; pintaQuiz();
}
function finQuiz() {
  if (!Q) return;
  parar();
  const prevBest = mejorQuiz();
  if (Datos.modo === 'demo') registrarQuiz(Q.score, Q.aciertos, Q.preguntas.length, Q.mejorCombo);
  const xpGan = Datos.modo === 'api' ? Q.xpGanado : Math.round(Q.score / 10);
  const precision = Math.round(Q.aciertos / Q.preguntas.length * 100);
  const sq = statsQuiz();
  pinta(`${barra()}
    <div class="ar-result">
      <div class="ar-result__ic"><i data-lucide="zap" class="i"></i></div>
      <h2 class="display" style="font-size:var(--fs-2xl)">${Q.score} puntos</h2>
      <div class="ar-flash__resumen">
        <div><strong>${Q.aciertos}/${Q.preguntas.length}</strong><span class="faint">Aciertos</span></div>
        <div><strong>${precision}%</strong><span class="faint">Precisión</span></div>
        <div><strong>x${Q.mejorCombo}</strong><span class="faint">Mejor combo</span></div>
      </div>
      <p class="muted">+${xpGan} XP${Datos.modo === 'api' ? ' · Tu mapa clínico ya se actualizó' : `${Q.score > prevBest ? ' · ¡nuevo récord!' : ''} · ${sq.jugados} partida${sq.jugados === 1 ? '' : 's'}`}</p>
      ${!Acceso.vip() ? '<p class="muted" style="max-width:40ch">Versión gratis: 3 preguntas. Hazte VIP para el quiz completo y todos los retos.</p><button class="btn btn--brand btn--lg" data-paywall="El quiz completo y todos los retos son para miembros VIP."><i data-lucide="crown" class="i"></i>Hazte VIP</button>' : ''}
      <div class="row" style="gap:10px;justify-content:center">
        <button class="btn btn--brand btn--lg" data-a="quiz-jugar" data-modo="${Q.modo}" data-area="${esc(Q.area)}"><i data-lucide="rotate-ccw" class="i"></i>Jugar de nuevo</button>
        <button class="btn btn--secondary btn--lg" data-a="ir-quiz">Más modos</button>
        <button class="btn btn--ghost btn--lg" data-a="hub">Volver</button>
      </div>
    </div>`);
  if (precision >= 80) celebrar('grande'); else if (precision >= 50) celebrar('normal');
}

// ══════════════ DETECTIVE DENTAL ══════════════
function elegirCaso() {
  vista = 'caso';
  pinta(`${barra()}
    <div class="ar-head"><h2 class="display" style="font-size:var(--fs-2xl)">Detective Dental 🔍</h2>
      <p class="muted">Analiza el caso, da tu diagnóstico y elige el plan. Como en el consultorio.</p></div>
    <div class="ar-grid">
      ${casos().map((c, i) => { const bloq = !Acceso.vip() && i > 0; const ok = casoResuelto(c.id); return `<button class="ar-tile" data-a="caso-jugar" data-id="${c.id}" style="--c:#4fa899">
        <span class="ar-tile__ic"><i data-lucide="${ok ? 'check-circle' : 'folder-heart'}" class="i"></i></span>
        <strong>${esc(c.titulo)}${ok ? ' ✅' : ''}</strong><span class="faint">${esc(c.area)} · ${esc(c.paciente)}</span>
        <span class="ar-tile__go"><i data-lucide="${bloq ? 'lock' : 'arrow-up-right'}" class="i"></i></span></button>`; }).join('')}
    </div>`);
}
function iniciarCaso(id: string) {
  if (!Acceso.vip() && casos()[0]?.id !== id) { mostrarPaywall('Este caso clínico es para miembros VIP. El primero es gratis.'); return; }
  const caso = casos().find((c) => c.id === id)!;
  C = { caso, paso: 'dx', dxOk: false, planOk: false, contestada: false };
  pintaCaso();
}
function pintaCaso() {
  if (!C) return;
  const c = C.caso;
  const paso = C.paso === 'dx' ? c.diagnostico : c.plan;
  const etiqueta = C.paso === 'dx' ? 'Paso 1 · Diagnóstico' : 'Paso 2 · Plan de tratamiento';
  pinta(`${barra()}
    <div class="ar-caso">
      <div class="ar-caso__ficha">
        <span class="chip chip--primary">${esc(c.area)}</span>
        <h2 class="display" style="font-size:var(--fs-xl);margin:6px 0">${esc(c.titulo)}</h2>
        <p class="ar-caso__pac"><i data-lucide="user" class="i"></i>${esc(c.paciente)}</p>
        <p>${esc(c.presentacion)}</p>
        <div class="ar-caso__hall"><strong>Hallazgos</strong><ul>${c.hallazgos.map((h: string) => `<li>${esc(h)}</li>`).join('')}</ul></div>
      </div>
      <div class="ar-caso__q">
        <span class="eyebrow">${etiqueta}</span>
        <h3 style="font-size:var(--fs-md);margin:6px 0 12px">${esc(paso.pregunta)}</h3>
        <div class="ar-opts">${paso.opciones.map((o: string, i: number) => `<button class="ar-opt" data-a="caso-resp" data-i="${i}">${esc(o)}</button>`).join('')}</div>
        <div id="ar-fb"></div>
      </div>
    </div>`);
}
function respCaso(i: number) {
  if (!C || C.contestada) return; C.contestada = true;
  const paso = C.paso === 'dx' ? C.caso.diagnostico : C.caso.plan;
  const ok = i === paso.correcta;
  if (C.paso === 'dx') C.dxOk = ok; else C.planOk = ok;
  const opts = root()!.querySelectorAll<HTMLButtonElement>('.ar-opt');
  opts.forEach((b, j) => { b.disabled = true; if (j === paso.correcta) b.classList.add('ok'); if (j === i && !ok) b.classList.add('bad'); });
  if (ok) celebrar('sutil');
  const ultimo = C.paso === 'plan';
  document.getElementById('ar-fb')!.innerHTML = `
    <div class="ar-exp ${ok ? 'ok' : 'bad'}"><strong>${ok ? '¡Bien diagnosticado! 🩺' : 'Revisemos…'}</strong>
      <p>${esc(paso.explicacion)}</p>
      <button class="btn btn--brand" data-a="caso-sig">${ultimo ? 'Ver resultado' : 'Continuar al plan'} <i data-lucide="arrow-right" class="i"></i></button></div>`;
  iconos();
  root()!.querySelector('.ar-exp')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
function sigCaso() {
  if (!C) return;
  if (C.paso === 'dx') { C.paso = 'plan'; C.contestada = false; pintaCaso(); return; }
  const perfecto = C.dxOk && C.planOk;
  resolverCaso(C.caso.id, perfecto);
  pinta(`${barra()}
    <div class="ar-result">
      <div class="ar-result__ic" style="background:${perfecto ? 'var(--accent)' : 'var(--surface-2)'}"><i data-lucide="${perfecto ? 'party-popper' : 'clipboard-check'}" class="i"></i></div>
      <h2 class="display" style="font-size:var(--fs-2xl)">${perfecto ? '¡Caso resuelto!' : 'Caso completado'}</h2>
      <p class="muted">Diagnóstico ${C.dxOk ? '✅' : '❌'} · Plan ${C.planOk ? '✅' : '❌'}${perfecto ? ' · +50 XP' : ''}</p>
      <div class="row" style="gap:10px;justify-content:center">
        <button class="btn btn--brand btn--lg" data-a="ir-caso"><i data-lucide="folder-heart" class="i"></i>Otro caso</button>
        <button class="btn btn--secondary btn--lg" data-a="hub">Volver</button>
      </div>
    </div>`);
  if (perfecto) celebrar('grande'); else if (C.dxOk || C.planOk) celebrar('normal');
}

// ══════════════ FLASHCARDS ══════════════
function iniciarFlash() {
  const cartas = mazoDeHoy(Acceso.vip() ? 15 : 5);
  if (!cartas.length) {
    const prox = proximoRepaso();
    const cuando = prox ? prox.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }) : '';
    return pinta(`${barra()}<div class="ar-empty">¡Todo repasado por hoy!${cuando ? `<br><span class="faint">Próximo repaso: ${cuando}</span>` : ''}</div>`);
  }
  F = { cartas, idx: 0, volteada: false, historial: [] };
  vista = 'flash';
  pintaFlash();
}
function pintaFlash() {
  if (!F) return;
  const c: Flashcard = F.cartas[F.idx];
  pinta(`${barra()}
    <div class="ar-flash">
      <div class="ar-flash__prog"><span style="width:${(F.idx) / F.cartas.length * 100}%"></span></div>
      <span class="faint" style="text-align:center">${F.idx + 1} / ${F.cartas.length} · ${esc(c.area)}</span>
      <div class="ar-card ${F.volteada ? 'flip' : ''}" data-a="flash-flip">
        <div class="ar-card__cara ar-card__frente"><span class="eyebrow">${esc(c.curso)}</span><p>${esc(c.frente)}</p><span class="ar-card__hint"><i data-lucide="pointer" class="i"></i>toca para ver · <kbd>espacio</kbd></span></div>
        <div class="ar-card__cara ar-card__reverso"><div>${c.reverso}</div></div>
      </div>
      ${F.volteada ? `<div class="ar-flash__cal">
        <button class="btn btn--secondary btn--lg" data-a="flash-cal" data-cal="again"><i data-lucide="rotate-ccw" class="i"></i>Otra vez <kbd>1</kbd></button>
        <button class="btn btn--secondary btn--lg" data-a="flash-cal" data-cal="hard"><i data-lucide="minus" class="i"></i>Difícil <kbd>2</kbd></button>
        <button class="btn btn--brand btn--lg" data-a="flash-cal" data-cal="easy"><i data-lucide="check" class="i"></i>Fácil <kbd>3</kbd></button>
      </div>${F.historial.length ? `<button class="btn btn--ghost btn--sm" data-a="flash-undo" style="justify-self:center"><i data-lucide="undo-2" class="i"></i>Deshacer <kbd>Ctrl+Z</kbd></button>` : ''}` : '<p class="faint" style="text-align:center;font-size:var(--fs-xs)">Piénsalo y voltea la tarjeta · <kbd>espacio</kbd></p>'}
    </div>`);
}
function flipFlash() { if (F && !F.volteada) { F.volteada = true; pintaFlash(); } }
function calFlash(cal: Calidad) {
  if (!F) return;
  const id = F.cartas[F.idx].id;
  const prevSR = obtenerSR(id);
  repasarCarta(id, cal);
  F.historial.push({ id, cal, prevSR, idx: F.idx });
  if (F.idx >= F.cartas.length - 1) return finFlash();
  F.idx++; F.volteada = false; pintaFlash();
}
function undoFlash() {
  if (!F || !F.historial.length) return;
  const last = F.historial.pop()!;
  restaurarSR(last.id, last.prevSR);
  F.idx = last.idx;
  F.volteada = true;
  pintaFlash();
}
function finFlash() {
  if (!F) return;
  const em = estatsMazo();
  const easy = F.historial.filter(h => h.cal === 'easy').length;
  const hard = F.historial.filter(h => h.cal === 'hard').length;
  const again = F.historial.filter(h => h.cal === 'again').length;
  const xpGanado = easy * 3 + hard;
  const pctEasy = F.cartas.length ? easy / F.cartas.length : 0;
  if (pctEasy >= 0.8) celebrar('grande'); else if (pctEasy >= 0.5) celebrar('normal');
  pinta(`${barra()}
    <div class="ar-result">
      <div class="ar-result__ic" style="background:#c98a5b"><i data-lucide="layers" class="i"></i></div>
      <h2 class="display" style="font-size:var(--fs-2xl)">¡Repaso terminado!</h2>
      <div class="ar-flash__resumen">
        <div><strong>${easy}</strong><span class="faint">Fácil</span></div>
        <div><strong>${hard}</strong><span class="faint">Difícil</span></div>
        <div><strong>${again}</strong><span class="faint">Otra vez</span></div>
      </div>
      <p class="muted">+${xpGanado} XP · ${em.dominadas} tarjetas dominadas de ${em.total}</p>
      ${F.historial.length ? `<button class="btn btn--ghost btn--sm" data-a="flash-undo"><i data-lucide="undo-2" class="i"></i>Deshacer última</button>` : ''}
      ${!Acceso.vip() ? '<button class="btn btn--brand btn--lg" data-paywall="El repaso completo (todas las tarjetas) es para miembros VIP."><i data-lucide="crown" class="i"></i>Hazte VIP</button>' : ''}
      <button class="btn btn--secondary btn--lg" data-a="hub">Volver a Retos</button>
    </div>`);
}
function onKey(e: KeyboardEvent) {
  if (vista === 'flash' && F) {
    if (e.key === ' ' && !F.volteada) { e.preventDefault(); flipFlash(); return; }
    if (F.volteada) {
      if (e.key === '1') { calFlash('again'); return; }
      if (e.key === '2') { calFlash('hard'); return; }
      if (e.key === '3') { calFlash('easy'); return; }
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undoFlash(); }
    return;
  }
  if (vista === 'quiz' && Q) {
    if (!Q.contestada) {
      const n = parseInt(e.key);
      if (Q.preguntas[Q.idx].tipo === 'seleccion' && n >= 1 && n <= Q.preguntas[Q.idx].opciones.length) { responderQuiz(n - 1); return; }
    }
    if (Q.contestada && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); sigQuiz(); return; }
  }
  if (vista === 'diaria' && D && !D.contestada) {
    const n = parseInt(e.key);
    if (n >= 1 && n <= D.p.opciones.length) { respDiaria(n - 1); }
  }
}

// ══════════════ RETO DIARIO ══════════════
function iniciarDiaria() {
  const d = retoDiario();
  if (d.hechoHoy || !d.pregunta) return hub();
  vista = 'diaria';
  D = { p: d.pregunta, contestada: false };
  const p: Pregunta = D.p;
  pinta(`${barra()}
    <div class="ar-q">
      <span class="chip chip--primary"><i data-lucide="calendar-days" class="i"></i>Reto diario · ${esc(p.area)}</span>
      <h2 class="display" style="font-size:var(--fs-xl)">${esc(p.q)}</h2>
      <div class="ar-opts">${p.opciones.map((o, i) => `<button class="ar-opt" data-a="diaria-resp" data-i="${i}">${esc(o)}</button>`).join('')}</div>
      <div id="ar-fb"></div>
    </div>`);
}
function respDiaria(i: number) {
  if (!D || D.contestada) return; D.contestada = true;
  const p: Pregunta = D.p; const ok = i === p.correcta;
  const opts = root()!.querySelectorAll<HTMLButtonElement>('.ar-opt');
  opts.forEach((b, j) => { b.disabled = true; if (j === p.correcta) b.classList.add('ok'); if (j === i && !ok) b.classList.add('bad'); });
  if (ok) celebrar('normal');
  const dia = completarDiaria(ok);
  document.getElementById('ar-fb')!.innerHTML = `
    <div class="ar-exp ${ok ? 'ok' : 'bad'}"><strong>${ok ? '¡Correcto! +30 XP' : '+10 XP por participar'}</strong>
      <p>${esc(p.explicacion)}</p>
      <p class="muted">🔥 Racha diaria: <strong>${dia.racha}</strong></p>
      <button class="btn btn--brand" data-a="hub">Listo <i data-lucide="check" class="i"></i></button></div>`;
  iconos();
}

// ══════════════ Celebración (3 intensidades, respeta reduced-motion) ══════════════
type Intensidad = 'sutil' | 'normal' | 'grande';
/** También la usa la Academia al aprobar un módulo o completar un programa (anfitrión opcional). */
export function celebrar(intensidad: Intensidad = 'normal', anfitrion?: HTMLElement | null) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const r = anfitrion ?? root(); if (!r) return;
  const host = document.createElement('div'); host.className = 'ar-confeti';
  const cols = ['#4fa899', '#4a7fc1', '#e0b341', '#20254b', '#6fbfb0'];
  const cant = intensidad === 'sutil' ? 12 : intensidad === 'normal' ? 26 : 50;
  const dur = intensidad === 'sutil' ? 1000 : intensidad === 'normal' ? 1400 : 2200;
  if (intensidad === 'grande') host.classList.add('ar-confeti--grande');
  for (let i = 0; i < cant; i++) {
    const s = document.createElement('span');
    s.style.left = Math.random() * 100 + '%';
    s.style.background = cols[i % cols.length];
    s.style.animationDelay = (Math.random() * (intensidad === 'grande' ? 0.5 : 0.2)) + 's';
    s.style.transform = `translateY(0) rotate(${Math.random() * 360}deg)`;
    if (intensidad === 'grande') { s.style.width = (7 + Math.random() * 8) + 'px'; s.style.height = (10 + Math.random() * 10) + 'px'; }
    host.appendChild(s);
  }
  r.appendChild(host);
  setTimeout(() => host.remove(), dur);
}
