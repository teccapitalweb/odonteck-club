import { curso as getCurso, LIBRARY_ID, fmtMin } from '../core/catalogo';
import { Progreso } from '../core/progreso';
import { esc, placeholder } from '../ui/partials';

export function clase(params: Record<string, string>) {
  const c = getCurso(params.id);
  const n = Number(params.n);
  const k = c?.clases.find((x) => x.n === n);
  if (!c || !k) return placeholder('Clase no encontrada', 'Revisa el temario del curso.', 'search-x');
  if (!Progreso.desbloqueada(c, n)) {
    return placeholder('Esta clase todavía está bloqueada', `Termina la clase ${n - 1} para desbloquearla. Así avanzas a tu ritmo y sin saltarte nada.`, 'lock')
      .replace('href="#/cursos">Ir a cursos', `href="#/curso/${c.id}/clase/${n - 1}">Ir a la clase ${n - 1}`);
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
          <iframe src="${embed}" loading="lazy" style="border:0;position:absolute;inset:0;width:100%;height:100%" allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture" allowfullscreen></iframe>
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
        <p class="faint" style="font-size:var(--fs-xs)">Video servido desde Bunny (biblioteca ${LIBRARY_ID}). En la Fase 2 el enlace se firma desde el backend para que solo miembros puedan verlo.</p>
      </div>
      <div class="card card--pad stack" data-tabs style="gap:16px">
        <div class="tabs"><button data-for="temario" class="is-active">Temario</button><button data-for="notas">Notas</button><button data-for="quiz">Quiz</button></div>
        <div data-tab="temario" class="stack" style="gap:10px;font-size:var(--fs-sm)">${temario}</div>
        <div data-tab="notas" hidden class="stack" style="gap:10px;text-align:center;padding:20px 0">
          <span class="circle-btn" style="width:48px;height:48px;background:var(--primary-soft);color:var(--primary);margin:0 auto"><i data-lucide="captions" class="i"></i></span>
          <strong>Notas de la clase</strong><p class="muted" style="font-size:var(--fs-sm)">Resumen, conceptos clave y marcas de tiempo. Se generan de la transcripción del video (Fase 5).</p>
        </div>
        <div data-tab="quiz" hidden class="stack" style="gap:10px;text-align:center;padding:20px 0">
          <span class="circle-btn" style="width:48px;height:48px;background:var(--accent-soft);color:var(--accent);margin:0 auto"><i data-lucide="brain" class="i"></i></span>
          <strong>Quiz de la clase</strong><p class="muted" style="font-size:var(--fs-sm)">3 a 5 preguntas para reforzar lo aprendido. Se generan de la transcripción y las revisa OdonTeck (Fase 5).</p>
        </div>
      </div>
    </div>
  </section>`;
}
