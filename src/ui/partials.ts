import { Progreso } from '../core/progreso';
import { type Curso, duracionCurso } from '../core/catalogo';

export const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

export const iniciales = (nombre: string) =>
  nombre.replace(/^(Dra?\.|Ing\.|Lic\.|Equipo)\s*/i, '').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || 'OT';

export function avatarUsuario(foto: string | null | undefined, letras: string, clases = 'avatar') {
  let src = '';
  try {
    const url = new URL(foto || '');
    if (url.protocol === 'https:') src = url.href;
  } catch { /* Las iniciales quedan como respaldo. */ }
  return `<span class="${esc(clases)}"><span class="avatar__fallback">${esc(letras)}</span>${src ? `<img data-avatar-image src="${esc(src)}" alt="" referrerpolicy="no-referrer">` : ''}</span>`;
}

export function tarjetaCurso(c: Curso) {
  const p = Progreso.porcentaje(c);
  const done = Progreso.completado(c);
  const chip = done
    ? `<span class="chip chip--accent"><i data-lucide="check" class="i"></i>Completado</span>`
    : p > 0 ? `<span class="chip chip--glass">${p}%</span>`
    : `<span class="chip chip--glass"><i data-lucide="sparkles" class="i"></i>${c.area}</span>`;
  const icon = done ? 'award' : p > 0 ? 'play' : 'arrow-up-right';
  return `
  <a class="pcard" href="#/curso/${c.id}">
    <img src="${c.portada}" alt="" loading="lazy">
    <div class="pcard__top">${chip}<span class="circle-btn circle-btn--glass" style="width:36px;height:36px"><i data-lucide="${icon}" class="i" style="width:15px;height:15px"></i></span></div>
    <div class="pcard__body">
      <div class="pcard__title">${esc(c.titulo)}</div>
      <div class="pcard__meta"><span><i data-lucide="play-circle" class="i"></i>${meta(c)}</span><span><i data-lucide="signal" class="i"></i>${c.nivel}</span></div>
      ${p > 0 && !done ? `<div class="progress progress--thin"><span style="width:${p}%"></span></div>` : ''}
    </div>
    <div class="pcard__cta">
      <span class="who"><span class="avatar">${iniciales(c.instructor)}</span>${esc(c.instructor)}</span>
      <span class="btn btn--sm">${done ? 'Repasar' : p > 0 ? 'Continuar' : 'Ver curso'}</span>
    </div>
  </a>`;
}

export function encabezado(chip: string, titulo: string, cta = '') {
  return `<div class="section-head"><div><span class="chip chip--primary">${chip}</span><h2 class="display">${titulo}</h2></div>${cta}</div>`;
}

export function placeholder(titulo: string, texto: string, icon = 'construction', enlace = '#/cursos', accion = 'Ir a cursos') {
  return `<section class="card card--pad" style="text-align:center;padding:64px 24px;display:grid;gap:12px;justify-items:center">
    <span class="circle-btn" style="width:56px;height:56px;background:var(--primary-soft);color:var(--primary)"><i data-lucide="${icon}" class="i" style="width:24px;height:24px"></i></span>
    <h1 class="display" style="font-size:var(--fs-xl)">${titulo}</h1>
    <p class="muted" style="max-width:48ch">${texto}</p>
    <a class="btn btn--brand" href="${enlace}">${accion}</a>
  </section>`;
}

export const meta = (c: Curso) => `${c.clases.length} clases · ${duracionCurso(c)}`;
