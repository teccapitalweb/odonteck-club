// Retos · el arcade del club. Mini-app autónoma: hub + Quiz Relámpago, Detective
// Dental y Flashcards. Todo el contenido sale de los cursos (quizzes y notas).
import { createIcons, icons } from 'lucide';
import { esc } from '../ui/partials';
import {
  nivel, retoDiario, completarDiaria, bancoPreguntas, barajar, type Pregunta,
  mazoDeHoy, repasarCarta, estatsMazo, type Flashcard,
  casos, resolverCaso, casosResueltos, registrarQuiz, mejorQuiz,
} from '../core/juegos';
import { Acceso, mostrarPaywall } from '../core/acceso';

type Vista = 'hub' | 'quiz' | 'caso' | 'flash' | 'diaria';
let vista: Vista = 'hub';
let timer: number | null = null;
const parar = () => { if (timer) { clearInterval(timer); timer = null; } };

// estados de cada juego
let Q: any = null;      // quiz relámpago
let C: any = null;      // detective dental
let F: any = null;      // flashcards
let D: any = null;      // reto diario

const root = () => document.getElementById('arcade');
function pinta(html: string) { const r = root(); if (!r) return; r.innerHTML = html; createIcons({ icons }); }
const iconos = () => createIcons({ icons });

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
  window.addEventListener('retos:cambio', () => { if (vista === 'hub') hub(); });
  hub();
}

function onClick(e: Event) {
  const el = (e.target as HTMLElement).closest<HTMLElement>('[data-a]');
  if (!el) return;
  const a = el.dataset.a!;
  const acciones: Record<string, () => void> = {
    hub: () => { parar(); vista = 'hub'; hub(); },
    'ir-quiz': iniciarQuiz, 'quiz-resp': () => respQuiz(+el.dataset.i!), 'quiz-sig': sigQuiz,
    'ir-caso': () => elegirCaso(), 'caso-jugar': () => iniciarCaso(el.dataset.id!),
    'caso-resp': () => respCaso(+el.dataset.i!), 'caso-sig': sigCaso,
    'ir-flash': iniciarFlash, 'flash-flip': flipFlash, 'flash-cal': () => calFlash(el.dataset.b === '1'),
    'ir-diaria': iniciarDiaria, 'diaria-resp': () => respDiaria(+el.dataset.i!),
  };
  acciones[a]?.();
}

// ══════════════ HUB ══════════════
function hub() {
  vista = 'hub';
  const nv = nivel();
  const d = retoDiario();
  const em = estatsMazo();
  const totalCasos = casos().length;
  const banco = bancoPreguntas().length;
  pinta(`
    <div class="ar-hero">
      <div class="ar-hero__lvl">
        <span class="ar-badge" style="--c:${nv.color}"><i data-lucide="${nv.icon}" class="i"></i></span>
        <div>
          <div class="eyebrow">Nivel ${nv.indice + 1}</div>
          <h1 class="display" style="font-size:var(--fs-2xl);margin:0">${nv.nombre}</h1>
          <div class="ar-xp"><div class="ar-xp__bar"><span style="width:${nv.pct}%"></span></div>
            <span class="faint">${nv.xp} XP${nv.siguiente ? ` · faltan ${nv.faltan} para ${nv.siguiente.nombre}` : ' · máximo nivel'}</span></div>
        </div>
      </div>
      <div class="ar-hero__stats">
        <div><strong>${mejorQuiz()}</strong><span>mejor quiz</span></div>
        <div><strong>${casosResueltos()}/${totalCasos}</strong><span>casos</span></div>
        <div><strong>${em.dominadas}</strong><span>tarjetas dominadas</span></div>
      </div>
    </div>

    <button class="ar-daily ${d.hechoHoy ? 'is-done' : ''}" data-a="ir-diaria" ${d.hechoHoy ? 'disabled' : ''}>
      <span class="ar-daily__ic"><i data-lucide="${d.hechoHoy ? 'check-check' : 'calendar-days'}" class="i"></i></span>
      <span class="ar-daily__tx">
        <strong>Reto diario ${d.racha > 0 ? `· 🔥 ${d.racha}` : ''}</strong>
        <span class="faint">${d.hechoHoy ? '¡Listo por hoy! Vuelve mañana para mantener tu racha.' : 'Una pregunta rápida para sumar XP y racha.'}</span>
      </span>
      ${d.hechoHoy ? '' : '<i data-lucide="arrow-right" class="i"></i>'}
    </button>

    <div class="ar-grid">
      ${tile('ir-quiz', 'zap', 'Quiz Relámpago', `Contra reloj · ${banco} preguntas de tus cursos`, '#4a7fc1')}
      ${tile('ir-caso', 'stethoscope', 'Detective Dental', `Diagnostica ${totalCasos} casos clínicos paso a paso`, '#4fa899')}
      ${tile('ir-flash', 'layers', 'Flashcards', `Repaso espaciado · ${em.total} tarjetas`, '#c98a5b')}
    </div>
    <p class="faint" style="font-size:var(--fs-xs);text-align:center">El contenido de los retos se genera de los cursos del club. Mientras más clases, quizzes y notas, más retos.</p>
  `);
}
const tile = (a: string, icon: string, tit: string, sub: string, color: string) => `
  <button class="ar-tile" data-a="${a}" style="--c:${color}">
    <span class="ar-tile__ic"><i data-lucide="${icon}" class="i"></i></span>
    <strong>${tit}</strong><span class="faint">${sub}</span>
    <span class="ar-tile__go"><i data-lucide="arrow-up-right" class="i"></i></span>
  </button>`;

const barra = () => `<button class="btn btn--ghost btn--sm" data-a="hub"><i data-lucide="arrow-left" class="i"></i>Retos</button>`;

// ══════════════ QUIZ RELÁMPAGO ══════════════
const TIEMPO = 15; // seg por pregunta
function iniciarQuiz() {
  const pool = barajar(bancoPreguntas());
  if (!pool.length) return pinta(`${barra()}<div class="ar-empty">Aún no hay preguntas en los cursos. Agrega quizzes desde el panel admin.</div>`);
  const lim = Acceso.vip() ? 8 : 3;
  Q = { preguntas: pool.slice(0, lim), idx: 0, score: 0, vidas: 3, combo: 0, contestada: false, restante: TIEMPO };
  pintaQuiz();
}
function pintaQuiz() {
  const p: Pregunta = Q.preguntas[Q.idx];
  parar();
  Q.contestada = false; Q.restante = TIEMPO;
  pinta(`
    <div class="ar-top">${barra()}
      <div class="ar-hud">
        <span class="ar-vidas">${'❤'.repeat(Q.vidas)}${'<span class=off>♡</span>'.repeat(3 - Q.vidas)}</span>
        <span class="ar-combo ${Q.combo > 1 ? 'on' : ''}">${Q.combo > 1 ? '🔥 x' + Q.combo : ''}</span>
        <span class="ar-score"><i data-lucide="star" class="i"></i>${Q.score}</span>
      </div>
    </div>
    <div class="ar-timer"><span id="ar-tbar" style="width:100%"></span></div>
    <div class="ar-q">
      <span class="chip chip--primary">${esc(p.area)} · ${Q.idx + 1}/${Q.preguntas.length}</span>
      <h2 class="display" style="font-size:var(--fs-xl)">${esc(p.q)}</h2>
      <div class="ar-opts">
        ${p.opciones.map((o, i) => `<button class="ar-opt" data-a="quiz-resp" data-i="${i}">${esc(o)}</button>`).join('')}
      </div>
      <div id="ar-fb"></div>
    </div>`);
  const bar = document.getElementById('ar-tbar')!;
  const t0 = Date.now();
  timer = window.setInterval(() => {
    const pasado = (Date.now() - t0) / 1000; Q.restante = Math.max(0, TIEMPO - pasado);
    bar.style.width = (Q.restante / TIEMPO * 100) + '%';
    if (Q.restante <= 0) { parar(); respQuiz(-1); }
  }, 80);
}
function respQuiz(i: number) {
  if (Q.contestada) return; Q.contestada = true; parar();
  const p: Pregunta = Q.preguntas[Q.idx];
  const ok = i === p.correcta;
  const opts = root()!.querySelectorAll<HTMLButtonElement>('.ar-opt');
  opts.forEach((b, j) => { b.disabled = true; if (j === p.correcta) b.classList.add('ok'); if (j === i && !ok) b.classList.add('bad'); });
  if (ok) {
    const bonus = Math.round(Q.restante / TIEMPO * 100);
    const suma = Math.round((100 + bonus) * (1 + Q.combo * 0.1));
    Q.score += suma; Q.combo++; confeti();
  } else { Q.vidas--; Q.combo = 0; }
  const fin = Q.vidas <= 0 || Q.idx >= Q.preguntas.length - 1;
  document.getElementById('ar-fb')!.innerHTML = `
    <div class="ar-exp ${ok ? 'ok' : 'bad'}">
      <strong>${ok ? '¡Correcto! ⚡' : 'Casi…'}</strong><p>${esc(p.explicacion)}</p>
      <button class="btn btn--brand" data-a="quiz-sig">${fin ? 'Ver resultado' : 'Siguiente'} <i data-lucide="arrow-right" class="i"></i></button>
    </div>`;
  iconos();
  const r = root()!; r.querySelector('.ar-exp')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
function sigQuiz() {
  if (Q.vidas <= 0 || Q.idx >= Q.preguntas.length - 1) return finQuiz();
  Q.idx++; pintaQuiz();
}
function finQuiz() {
  parar(); registrarQuiz(Q.score);
  const xpGan = Math.round(Q.score / 10);
  pinta(`${barra()}
    <div class="ar-result">
      <div class="ar-result__ic"><i data-lucide="zap" class="i"></i></div>
      <h2 class="display" style="font-size:var(--fs-2xl)">${Q.score} puntos</h2>
      <p class="muted">Ganaste <strong>${xpGan} XP</strong>${Q.score >= mejorQuiz() ? ' · ¡nuevo récord! 🏆' : ''}</p>
      ${!Acceso.vip() ? '<p class="muted" style="max-width:40ch">Versión gratis: 3 preguntas. Hazte VIP para el quiz completo y todos los retos.</p><button class="btn btn--brand btn--lg" data-paywall="El quiz completo y todos los retos son para miembros VIP."><i data-lucide="crown" class="i"></i>Hazte VIP</button>' : ''}
      <div class="row" style="gap:10px;justify-content:center">
        <button class="btn btn--brand btn--lg" data-a="ir-quiz"><i data-lucide="rotate-ccw" class="i"></i>Jugar de nuevo</button>
        <button class="btn btn--secondary btn--lg" data-a="hub">Volver</button>
      </div>
    </div>`);
}

// ══════════════ DETECTIVE DENTAL ══════════════
function elegirCaso() {
  vista = 'caso';
  pinta(`${barra()}
    <div class="ar-head"><h2 class="display" style="font-size:var(--fs-2xl)">Detective Dental 🔍</h2>
      <p class="muted">Analiza el caso, da tu diagnóstico y elige el plan. Como en el consultorio.</p></div>
    <div class="ar-grid">
      ${casos().map((c, i) => { const bloq = !Acceso.vip() && i > 0; return `<button class="ar-tile" data-a="caso-jugar" data-id="${c.id}" style="--c:#4fa899">
        <span class="ar-tile__ic"><i data-lucide="folder-heart" class="i"></i></span>
        <strong>${esc(c.titulo)}</strong><span class="faint">${esc(c.area)} · ${esc(c.paciente)}</span>
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
  if (C.contestada) return; C.contestada = true;
  const paso = C.paso === 'dx' ? C.caso.diagnostico : C.caso.plan;
  const ok = i === paso.correcta;
  if (C.paso === 'dx') C.dxOk = ok; else C.planOk = ok;
  const opts = root()!.querySelectorAll<HTMLButtonElement>('.ar-opt');
  opts.forEach((b, j) => { b.disabled = true; if (j === paso.correcta) b.classList.add('ok'); if (j === i && !ok) b.classList.add('bad'); });
  if (ok) confeti();
  const ultimo = C.paso === 'plan';
  document.getElementById('ar-fb')!.innerHTML = `
    <div class="ar-exp ${ok ? 'ok' : 'bad'}"><strong>${ok ? '¡Bien diagnosticado! 🩺' : 'Revisemos…'}</strong>
      <p>${esc(paso.explicacion)}</p>
      <button class="btn btn--brand" data-a="caso-sig">${ultimo ? 'Ver resultado' : 'Continuar al plan'} <i data-lucide="arrow-right" class="i"></i></button></div>`;
  iconos();
  root()!.querySelector('.ar-exp')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
function sigCaso() {
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
}

// ══════════════ FLASHCARDS ══════════════
function iniciarFlash() {
  const cartas = mazoDeHoy(Acceso.vip() ? 15 : 5);
  if (!cartas.length) return pinta(`${barra()}<div class="ar-empty">¡Todo repasado por hoy! 🎉 Vuelve mañana o agrega más quizzes/notas a los cursos.</div>`);
  F = { cartas, idx: 0, volteada: false };
  pintaFlash();
}
function pintaFlash() {
  const c: Flashcard = F.cartas[F.idx];
  pinta(`${barra()}
    <div class="ar-flash">
      <div class="ar-flash__prog"><span style="width:${(F.idx) / F.cartas.length * 100}%"></span></div>
      <span class="faint" style="text-align:center">${F.idx + 1} / ${F.cartas.length} · ${esc(c.area)}</span>
      <div class="ar-card ${F.volteada ? 'flip' : ''}" data-a="flash-flip">
        <div class="ar-card__cara ar-card__frente"><span class="eyebrow">${esc(c.curso)}</span><p>${esc(c.frente)}</p><span class="ar-card__hint"><i data-lucide="pointer" class="i"></i>toca para ver</span></div>
        <div class="ar-card__cara ar-card__reverso"><div>${c.reverso}</div></div>
      </div>
      ${F.volteada ? `<div class="ar-flash__cal">
        <button class="btn btn--secondary btn--lg" data-a="flash-cal" data-b="0"><i data-lucide="rotate-ccw" class="i"></i>Otra vez</button>
        <button class="btn btn--brand btn--lg" data-a="flash-cal" data-b="1"><i data-lucide="check" class="i"></i>La sabía</button>
      </div>` : '<p class="faint" style="text-align:center;font-size:var(--fs-xs)">Piénsalo y voltea la tarjeta</p>'}
    </div>`);
}
function flipFlash() { if (!F.volteada) { F.volteada = true; pintaFlash(); } }
function calFlash(bien: boolean) {
  repasarCarta(F.cartas[F.idx].id, bien);
  if (F.idx >= F.cartas.length - 1) return finFlash();
  F.idx++; F.volteada = false; pintaFlash();
}
function finFlash() {
  const em = estatsMazo();
  pinta(`${barra()}
    <div class="ar-result">
      <div class="ar-result__ic" style="background:#c98a5b"><i data-lucide="layers" class="i"></i></div>
      <h2 class="display" style="font-size:var(--fs-2xl)">¡Repaso terminado!</h2>
      <p class="muted">Llevas <strong>${em.dominadas}</strong> tarjetas dominadas de ${em.total}.</p>
      ${!Acceso.vip() ? '<button class="btn btn--brand btn--lg" data-paywall="El repaso completo (todas las tarjetas) es para miembros VIP."><i data-lucide="crown" class="i"></i>Hazte VIP</button>' : ''}
      <button class="btn btn--secondary btn--lg" data-a="hub">Volver a Retos</button>
    </div>`);
}

// ══════════════ RETO DIARIO ══════════════
function iniciarDiaria() {
  const d = retoDiario();
  if (d.hechoHoy || !d.pregunta) return hub();
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
  if (D.contestada) return; D.contestada = true;
  const p: Pregunta = D.p; const ok = i === p.correcta;
  const opts = root()!.querySelectorAll<HTMLButtonElement>('.ar-opt');
  opts.forEach((b, j) => { b.disabled = true; if (j === p.correcta) b.classList.add('ok'); if (j === i && !ok) b.classList.add('bad'); });
  if (ok) confeti();
  const dia = completarDiaria(ok);
  document.getElementById('ar-fb')!.innerHTML = `
    <div class="ar-exp ${ok ? 'ok' : 'bad'}"><strong>${ok ? '¡Correcto! +30 XP' : '+10 XP por participar'}</strong>
      <p>${esc(p.explicacion)}</p>
      <p class="muted">🔥 Racha diaria: <strong>${dia.racha}</strong></p>
      <button class="btn btn--brand" data-a="hub">Listo <i data-lucide="check" class="i"></i></button></div>`;
  iconos();
}

// ══════════════ Confeti (ligero, sin librerías) ══════════════
function confeti() {
  const r = root(); if (!r) return;
  const host = document.createElement('div'); host.className = 'ar-confeti';
  const cols = ['#4fa899', '#4a7fc1', '#e0b341', '#20254b', '#6fbfb0'];
  for (let i = 0; i < 26; i++) {
    const s = document.createElement('span');
    s.style.left = Math.random() * 100 + '%';
    s.style.background = cols[i % cols.length];
    s.style.animationDelay = (Math.random() * 0.2) + 's';
    s.style.transform = `translateY(0) rotate(${Math.random() * 360}deg)`;
    host.appendChild(s);
  }
  r.appendChild(host);
  setTimeout(() => host.remove(), 1400);
}
