import { curso as getCurso, LIBRARY_ID, fmtMin } from '../core/catalogo';
import { Progreso } from '../core/progreso';
import { esc, placeholder } from '../ui/partials';
import { Datos, type Clase } from '../core/datos';
import { Acceso } from '../core/acceso';

const vacioTab = (icon: string, titulo: string, texto: string, color = 'primary') => `<div class="stack" style="gap:10px;text-align:center;padding:20px 0"><span class="circle-btn" style="width:48px;height:48px;background:var(--${color}-soft);color:var(--${color});margin:0 auto"><i data-lucide="${icon}" class="i"></i></span><strong>${titulo}</strong><p class="muted" style="font-size:var(--fs-sm)">${texto}</p></div>`;

function notasHTML(k: Clase) {
  if (!k.notas) return vacioTab('captions', 'Notas de la clase', 'Resumen y conceptos clave con marca de tiempo. Se generan de la transcripción del video y las revisa OdonTeck.');
  return `<div class="notas">
    <div class="notas__resumen">
      <span class="notas__ic"><i data-lucide="sparkles" class="i"></i></span>
      <div><span class="eyebrow">Resumen</span><p>${esc(k.notas.resumen)}</p></div>
    </div>
    ${k.notas.conceptos.length ? `<span class="eyebrow" style="margin-top:4px">Conceptos clave</span>
    <ul class="notas__list">
      ${k.notas.conceptos.map((x) => `<li><span class="notas__t"><i data-lucide="clock" class="i"></i>${esc(x.t)}</span><span>${esc(x.texto)}</span></li>`).join('')}
    </ul>` : ''}
    <p class="notas__pie"><i data-lucide="badge-check" class="i"></i>Material revisado por OdonTeck</p>
  </div>`;
}

function quizHTML(cursoId: string, n: number) {
  const q = Datos.quiz(cursoId, n);
  if (!q || q.estado !== 'aprobado') return vacioTab('brain', 'Quiz de la clase', 'Preguntas cortas para reforzar lo aprendido. Aparecen aquí cuando OdonTeck las revisa y aprueba.', 'accent');
  return `<form class="stack" style="gap:14px" data-quiz-miembro="${cursoId}:${n}">
    ${q.preguntas.map((p, i) => `<fieldset class="quiz-q" data-pregunta="${i}">
      <legend class="eyebrow">Pregunta ${i + 1} de ${q.preguntas.length}</legend>
      <p class="quiz__q" style="font-size:var(--fs-md)">${esc(p.q)}</p>
      ${p.opciones.map((o, j) => `<label class="quiz__opt"><input type="radio" name="r${i}" value="${j}" required hidden><span class="k">${'ABCD'[j]}</span>${esc(o)}</label>`).join('')}
      <p class="quiz__exp" hidden>${esc(p.explicacion)}</p>
    </fieldset>`).join('')}
    <p class="quiz__resultado" hidden></p>
    <button class="btn btn--brand">Comprobar respuestas</button>
  </form>`;
}

export function clase(params: Record<string, string>) {
  const c = getCurso(params.id);
  const n = Number(params.n);
  const k = c?.clases.find((x) => x.n === n);
  if (!c || !k) return placeholder('Clase no encontrada', 'Revisa el temario del curso.', 'search-x');
  if (!Progreso.desbloqueada(c, n)) {
    return placeholder('Esta clase todavía está bloqueada', `Termina la clase ${n - 1} para desbloquearla. Así avanzas a tu ritmo y sin saltarte nada.`, 'lock')
      .replace('href="#/cursos">Ir a cursos', `href="#/curso/${c.id}/clase/${n - 1}">Ir a la clase ${n - 1}`);
  }
  if (!Acceso.claseAccesible(c, n)) {
    const totalClases = c.clases.length;
    const restantes = totalClases - n + 1;
    const iniciales = c.instructor.split(' ').filter((w) => /^[A-ZÁÉÍÓÚ]/.test(w)).slice(-2).map((w) => w[0]).join('');
    const clasesVip = c.clases.filter((x) => !Acceso.claseLibre(c, x.n));
    const durTotal = clasesVip.reduce((s, x) => s + (x.duracion || 0), 0);

    return `<section class="stack" style="gap:20px">
      <a class="section-head__cta" href="#/curso/${c.id}" style="align-self:flex-start"><span class="circle-btn circle-btn--glass" style="width:34px;height:34px"><i data-lucide="arrow-left" class="i" style="width:15px;height:15px"></i></span>${esc(c.titulo)}</a>
      <div class="locked-hero" style="min-height:480px">
        <img src="${c.portada}" alt="">
        <div class="locked-hero__body" style="padding:40px 44px;gap:24px;max-width:100%;display:grid;grid-template-columns:1fr auto auto;align-items:center">
          <div style="display:grid;gap:14px;justify-items:start;align-self:center">
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
              <span style="display:inline-flex;align-items:center;gap:6px;background:rgba(111,191,176,.15);color:var(--brand-teal);font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;padding:5px 14px;border-radius:99px;border:1px solid rgba(111,191,176,.25)"><i data-lucide="crown" class="i" style="width:13px;height:13px"></i>Contenido VIP</span>
              <span style="display:inline-flex;align-items:center;gap:5px;background:rgba(255,255,255,.1);color:rgba(255,255,255,.7);font-size:var(--fs-xs);padding:5px 12px;border-radius:99px"><i data-lucide="play-circle" class="i" style="width:12px;height:12px"></i>Clase ${n} de ${totalClases}</span>
              ${k.duracion ? `<span style="display:inline-flex;align-items:center;gap:5px;background:rgba(255,255,255,.1);color:rgba(255,255,255,.7);font-size:var(--fs-xs);padding:5px 12px;border-radius:99px"><i data-lucide="clock" class="i" style="width:12px;height:12px"></i>${fmtMin(k.duracion)}</span>` : ''}
            </div>
            <h1 class="display" style="font-size:clamp(var(--fs-lg),2.5vw,var(--fs-2xl));line-height:1.15">${esc(k.titulo)}</h1>
            <p style="max-width:40ch;color:rgba(255,255,255,.8);font-size:var(--fs-sm);line-height:1.6">Desbloquea esta clase${restantes > 1 ? ` y ${restantes - 1} más` : ''}, todo el catálogo de cursos, tu certificado con folio y la biblioteca completa.</p>
            <div style="display:flex;align-items:center;gap:10px">
              <span style="width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.15);display:grid;place-items:center;font-size:11px;font-weight:700;color:#fff;border:2px solid rgba(255,255,255,.25)">${iniciales || 'OT'}</span>
              <div style="font-size:var(--fs-xs)"><strong style="color:#fff">${esc(c.instructor)}</strong><div style="color:rgba(255,255,255,.5)">${esc(c.area)} · ${esc(c.nivel)}</div></div>
            </div>
            <a class="btn btn--lg" href="#/suscripcion" style="background:var(--brand-teal);color:var(--brand-navy);font-weight:700;margin-top:4px"><i data-lucide="crown" class="i"></i>Ver planes y precios <i data-lucide="arrow-right" class="i"></i></a>
          </div>
          <div style="width:240px;display:grid;gap:10px;background:rgba(255,255,255,.06);border-radius:var(--r-xl);padding:22px 20px;backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.1)">
            <span style="font-family:var(--font-display);font-weight:700;font-size:var(--fs-sm);color:#fff">Con VIP desbloqueas</span>
            <div style="display:grid;gap:8px;font-size:var(--fs-xs);color:rgba(255,255,255,.85)">
              ${[['play-circle', 'Todos los cursos y clases'], ['award', 'Certificados con folio'], ['library', 'Biblioteca de materiales'], ['brain', 'Quizzes y retos clínicos'], ['messages-square', 'Comunidad profesional']].map(([ic, t]) => `<div style="display:flex;gap:8px;align-items:center"><span style="width:28px;height:28px;border-radius:50%;background:rgba(111,191,176,.15);display:grid;place-items:center;flex-shrink:0"><i data-lucide="${ic}" class="i" style="width:13px;height:13px;color:var(--brand-teal)"></i></span>${t}</div>`).join('')}
            </div>
          </div>
          <div style="width:220px;display:grid;gap:8px;background:rgba(255,255,255,.06);border-radius:var(--r-xl);padding:22px 20px;backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.1);align-content:start">
            <span style="font-size:11px;font-weight:600;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:.06em">Clases del curso</span>
            ${c.clases.map((x) => {
              const libre = Acceso.claseLibre(c, x.n);
              const actual = x.n === n;
              return `<div style="display:flex;gap:7px;align-items:center;font-size:var(--fs-xs);color:rgba(255,255,255,${actual ? '1' : libre ? '.7' : '.45'})${actual ? ';font-weight:600' : ''}"><i data-lucide="${libre ? 'check-circle' : actual ? 'circle-dot' : 'lock'}" class="i" style="width:12px;height:12px;flex-shrink:0;color:${actual ? 'var(--brand-teal)' : libre ? 'var(--brand-teal)' : 'rgba(255,255,255,.3)'}"></i><span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(x.titulo)}</span></div>`;
            }).join('')}
            ${durTotal ? `<span style="font-size:11px;color:rgba(255,255,255,.35);margin-top:2px">${fmtMin(durTotal)} de contenido VIP</span>` : ''}
          </div>
        </div>
      </div>
    </section>`;
  }
  Progreso.abrirClase(c.id, n);
  const vista = Progreso.de(c.id).vistas.includes(n);
  const prev = c.clases.find((x) => x.n === n - 1);
  const next = c.clases.find((x) => x.n === n + 1);

  // Provisional: embed directo. En Fase 2 el backend firma la URL (token + expires).
  const embed = `https://iframe.mediadelivery.net/embed/${LIBRARY_ID}/${k.videoId}?autoplay=false&preload=true&responsive=true`;

  const temario = c.clases.map((x) => {
    const v = Progreso.de(c.id).vistas.includes(x.n);
    const abierta = Progreso.desbloqueada(c, x.n);
    const actual = x.n === n;
    const style = actual ? 'color:var(--primary);font-weight:600' : v ? '' : abierta ? '' : 'opacity:.5';
    const inner = `<span class="mono faint" style="width:22px">${v ? '✓' : x.n}</span>${esc(x.titulo)}`;
    return abierta ? `<a href="#/curso/${c.id}/clase/${x.n}" class="row" style="gap:10px;${style};color:inherit;flex-wrap:nowrap">${inner}</a>`
                   : `<div class="row" style="gap:10px;${style};flex-wrap:nowrap"><i data-lucide="lock" class="i" style="width:14px;height:14px"></i>${esc(x.titulo)}</div>`;
  }).join('');

  return `
  <section class="stack" style="gap:20px">
    <a class="section-head__cta" href="#/curso/${c.id}" style="align-self:flex-start"><span class="circle-btn circle-btn--glass" style="width:34px;height:34px"><i data-lucide="arrow-left" class="i" style="width:15px;height:15px"></i></span>${esc(c.titulo)}</a>
    <div class="grid" style="grid-template-columns:1.7fr 1fr;align-items:start;gap:24px">
      <div class="stack" style="gap:16px">
        <div class="player" style="aspect-ratio:16/9;background:#0a0d18">
          <iframe ${Datos.modo === 'demo' ? `src="${embed}"` : ''} data-video="${c.id}:${n}" loading="lazy" style="border:0;position:absolute;inset:0;width:100%;height:100%" allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;fullscreen" allowfullscreen></iframe>
        </div>
        <div class="row" style="justify-content:space-between;align-items:flex-start">
          <div><span class="eyebrow">Clase ${n} de ${c.clases.length}${k.duracion ? ' · ' + fmtMin(k.duracion) : ''}</span><h1 class="display" style="font-size:var(--fs-xl);margin-top:4px">${esc(k.titulo)}</h1>
            <div class="lesson-progress" style="margin-top:8px"><div class="progress progress--thin"><span style="width:${Progreso.porcentaje(c)}%"></span></div>${Progreso.de(c.id).vistas.length} de ${c.clases.length} vistas · ${Progreso.porcentaje(c)}%</div></div>
          <div class="row" style="flex-wrap:nowrap">
            ${prev ? `<a class="btn btn--secondary" href="#/curso/${c.id}/clase/${prev.n}"><i data-lucide="chevron-left" class="i"></i>Anterior</a>` : ''}
            ${vista
              ? (next ? `<a class="btn btn--brand btn--pill-arrow" href="#/curso/${c.id}/clase/${next.n}">Siguiente clase <span class="arrow"><i data-lucide="arrow-right" class="i"></i></span></a>`
                      : `<a class="btn btn--gradient btn--pill-arrow" href="#/curso/${c.id}">Curso completado <span class="arrow"><i data-lucide="award" class="i"></i></span></a>`)
              : `<button class="btn btn--brand btn--pill-arrow" data-marcar-vista="${c.id}:${n}">Marcar vista y seguir <span class="arrow"><i data-lucide="arrow-right" class="i"></i></span></button>`}
          </div>
        </div>
        ${next ? `
        <div class="upnext">
          <div class="upnext__thumb"><img src="${c.portada}" alt=""><i data-lucide="${Progreso.desbloqueada(c, next.n) || vista ? 'play' : 'lock'}" class="i"></i></div>
          <div><span class="eyebrow">A continuación · clase ${next.n}</span><div class="upnext__title">${esc(next.titulo)}</div><p class="faint" style="font-size:var(--fs-xs);margin-top:4px">${vista ? 'Ya puedes verla.' : 'Se desbloquea al marcar esta clase como vista.'}</p></div>
          ${vista ? `<a class="circle-btn" href="#/curso/${c.id}/clase/${next.n}" aria-label="Ir a la siguiente"><i data-lucide="arrow-right" class="i"></i></a>` : `<span class="circle-btn" style="background:var(--surface-3);color:var(--text-3)"><i data-lucide="lock" class="i"></i></span>`}
        </div>` : `
        <div class="upnext" style="background:var(--accent-soft);border-color:transparent">
          <span class="circle-btn" style="background:var(--accent);width:56px;height:56px"><i data-lucide="award" class="i" style="width:24px;height:24px"></i></span>
          <div><span class="eyebrow">Última clase</span><div class="upnext__title">Al marcarla como vista, el curso queda completado y se emite tu certificado.</div></div>
        </div>`}
      </div>
      <div class="card card--pad stack" data-tabs style="gap:16px">
        <div class="tabs"><button data-for="temario" class="is-active">Temario</button><button data-for="notas">Notas</button><button data-for="quiz">Quiz</button></div>
        <div data-tab="temario" class="stack" style="gap:10px;font-size:var(--fs-sm)">${temario}</div>
        <div data-tab="notas" hidden class="stack" style="gap:10px">${notasHTML(k)}</div>
        <div data-tab="quiz" hidden class="stack" style="gap:12px">${quizHTML(c.id, n)}</div>
      </div>
    </div>
  </section>`;
}
