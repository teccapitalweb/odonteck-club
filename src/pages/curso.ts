import { CursoGratis } from '../core/curso-gratis';
import { curso as getCurso, cursos, fmtMin } from '../core/catalogo';
import { Progreso } from '../core/progreso';
import { Acceso } from '../core/acceso';
import { esc, tarjetaCurso, placeholder } from '../ui/partials';

export function curso(params: Record<string, string>) {
  const c = getCurso(params.id);
  if (!c) return placeholder('Curso no encontrado', 'Puede que el enlace sea viejo. Revisa el catálogo.', 'search-x');
  const p = Progreso.porcentaje(c);
  const vistas = Progreso.de(c.id).vistas;
  const sig = Progreso.siguiente(c);
  const done = Progreso.completado(c);
  const iniciales = c.instructor.split(' ').filter((w) => /^[A-ZÁÉÍÓÚ]/.test(w)).slice(-2).map((w) => w[0]).join('');
  const esGratis = Acceso.cursoGratis(c);
  const bloqueado = !Acceso.vip() && !esGratis;
  const gratisElegido = CursoGratis.id();
  const sinElegir = !Acceso.vip() && !gratisElegido;
  const cursoGratisNombre = gratisElegido ? cursos.find((x) => x.id === gratisElegido)?.titulo ?? '' : '';
  const puedeCambiar = !Acceso.vip() && !!CursoGratis.estado()?.puedeCambiar && !esGratis;

  const temario = c.clases.map((k) => {
    const vista = vistas.includes(k.n);
    const libre = Acceso.claseLibre(c, k.n);
    const abierta = Progreso.desbloqueada(c, k.n) && (Acceso.vip() || libre);
    const actual = !vista && k.n === sig && abierta;
    const cls = vista ? 'is-done' : actual ? 'is-current' : abierta ? '' : 'is-locked';
    const num = vista ? `<i data-lucide="check" class="i" style="width:14px;height:14px"></i>` : k.n;
    const necesitaVip = !Acceso.vip() && !libre;
    const ico = vista ? 'rotate-ccw' : necesitaVip ? 'crown' : abierta ? 'play' : 'lock';
    const chip = libre && !Acceso.vip()
      ? ' <span class="chip chip--accent" style="height:20px;margin-left:6px">Gratis</span>'
      : necesitaVip
        ? ' <span class="chip" style="height:20px;margin-left:6px;background:var(--surface-3)"><i data-lucide="crown" class="i" style="width:10px;height:10px"></i>VIP</span>'
        : '';
    const inner = `
      <div class="lesson__num">${num}</div>
      <div class="lesson__thumb"><img src="${c.portada}" alt="" loading="lazy" decoding="async"><i data-lucide="${ico}" class="i"></i></div>
      <div><div class="lesson__title">${esc(k.titulo)}${chip}</div>
        <div class="lesson__dur">${k.duracion ? fmtMin(k.duracion) : 'Clase ' + k.n}</div></div>`;
    return abierta
      ? `<a class="lesson ${cls}" href="#/curso/${c.id}/clase/${k.n}" style="color:inherit">${inner}</a>`
      : necesitaVip
        ? `<a class="lesson ${cls}" href="#/curso/${c.id}/clase/${k.n}" style="color:inherit;opacity:.7">${inner}</a>`
        : `<div class="lesson ${cls}" title="Termina la clase anterior para desbloquearla">${inner}</div>`;
  }).join('');

  const cta = done
    ? `<a class="btn btn--white btn--lg btn--pill-arrow" href="#/certificados">Ver mi certificado <span class="arrow" style="background:var(--brand-navy);color:#fff"><i data-lucide="award" class="i"></i></span></a>`
    : sinElegir
      ? `<button class="btn btn--white btn--lg btn--pill-arrow" data-curso-gratis-abrir="${c.id}"><i data-lucide="gift" class="i"></i>Elegir como mi curso gratis <span class="arrow" style="background:var(--brand-navy);color:#fff"><i data-lucide="arrow-right" class="i"></i></span></button>`
      : bloqueado
      ? `<button class="btn btn--white btn--lg btn--pill-arrow" data-paywall="Este curso es para miembros VIP. Hazte VIP y desbloquea todos los cursos."><i data-lucide="crown" class="i"></i>Hazte VIP para empezar <span class="arrow" style="background:var(--brand-navy);color:#fff"><i data-lucide="arrow-right" class="i"></i></span></button>`
      : `<a class="btn btn--white btn--lg btn--pill-arrow" href="#/curso/${c.id}/clase/${sig}">${p ? `Continuar con la clase ${sig}` : 'Empezar el curso'} <span class="arrow" style="background:var(--brand-navy);color:#fff"><i data-lucide="play" class="i"></i></span></a>`;

  const relacionados = cursos.filter((x) => x.id !== c.id && x.area === c.area).slice(0, 3);
  const otros = relacionados.length ? relacionados : cursos.filter((x) => x.id !== c.id).slice(0, 3);

  return `
  <section class="stack" style="gap:24px">
    <a class="section-head__cta" href="#/cursos" style="align-self:flex-start"><span class="circle-btn circle-btn--glass" style="width:34px;height:34px"><i data-lucide="arrow-left" class="i" style="width:15px;height:15px"></i></span>Catálogo</a>
    <div class="course-hero">
      <img src="${c.portada}" alt="" fetchpriority="high" decoding="async">
      <div class="course-hero__body">
        <div class="row"><span class="chip">${c.area}</span><span class="chip"><i data-lucide="signal" class="i"></i>${c.nivel}</span><span class="chip"><i data-lucide="play-circle" class="i"></i>${c.clases.length} clases</span>${done ? '<span class="chip chip--accent"><i data-lucide="check" class="i"></i>Completado</span>' : bloqueado ? '<span class="chip" style="background:rgba(255,255,255,.15)"><i data-lucide="crown" class="i"></i>VIP</span>' : esGratis ? '<span class="chip chip--accent">Gratis</span>' : ''}</div>
        <h1 class="display display--black course-hero__title">${esc(c.titulo)}</h1>
        <div class="row" style="gap:14px">
          <div class="avatar" style="border:2px solid rgba(255,255,255,.5)">${iniciales || 'OT'}</div>
          <div style="font-size:var(--fs-sm)"><strong>${esc(c.instructor)}</strong><br><span style="opacity:.75">Curso grabado · membresía OdonTeck</span></div>
          <div class="row" style="margin-left:auto">${cta}<button class="circle-btn circle-btn--glass" aria-label="Guardar"><i data-lucide="bookmark" class="i"></i></button></div>
        </div>
      </div>
    </div>

    <div class="grid" style="grid-template-columns:1.6fr 1fr;align-items:start;gap:28px">
      <div class="stack" style="gap:18px">
        <p class="muted" style="font-size:var(--fs-md)">${esc(c.descripcion)}</p>
        <h3 style="font-size:var(--fs-md);margin-top:8px">Temario</h3>
        <div class="syllabus">${temario}</div>
      </div>
      <div class="stack" style="position:sticky;top:88px">
        ${sinElegir ? `
        <div class="cg-cta" style="grid-template-columns:auto minmax(0,1fr)">
          <span class="cg-cta__ic"><i data-lucide="gift" class="i"></i></span>
          <div><strong>¿Este será tu curso gratis?</strong><small>Elige uno del catálogo y tenlo completo, menos la clase final.</small></div>
          <button class="btn" style="grid-column:1/-1;justify-content:center" data-curso-gratis-abrir="${c.id}"><i data-lucide="gift" class="i"></i>Elegir este curso</button>
        </div>` : bloqueado ? `
        ${cursoGratisNombre ? `<p class="muted" style="font-size:var(--fs-sm)"><i data-lucide="gift" class="i" style="width:14px;height:14px;vertical-align:-2px"></i> Tu curso gratis es <a href="#/curso/${gratisElegido}"><strong>${esc(cursoGratisNombre)}</strong></a>.${puedeCambiar ? ` <button class="btn btn--ghost btn--sm" data-curso-gratis-abrir="${c.id}">Cambiar a este</button>` : ''}</p>` : ''}
        <div class="card card--pad stack" style="gap:12px;background:color-mix(in srgb,var(--brand-navy) 6%,var(--surface));border-color:color-mix(in srgb,var(--brand-navy) 20%,var(--line))">
          <div class="row" style="gap:10px"><span class="circle-btn" style="width:40px;height:40px;background:var(--brand-gradient);color:#fff"><i data-lucide="crown" class="i" style="width:18px;height:18px"></i></span><div><strong>Curso VIP</strong><p class="muted" style="font-size:var(--fs-sm)">Hazte VIP para ver todas las clases, obtener tu certificado y acceder a la biblioteca.</p></div></div>
          <button class="btn btn--brand" style="width:100%;justify-content:center" data-paywall="Este curso es para miembros VIP. Hazte VIP y desbloquea todos los cursos."><i data-lucide="crown" class="i"></i>Hazte VIP</button>
          <a class="btn btn--secondary btn--sm" href="#/suscripcion" style="width:100%;justify-content:center">Ver planes y precios</a>
        </div>` : `
        <div class="card card--pad stack" style="gap:16px">
          <div class="row" style="justify-content:space-between"><div><span class="eyebrow">Tu avance</span><div style="font-family:var(--font-display);font-size:var(--fs-xl);font-weight:700;margin-top:4px">${vistas.length} de ${c.clases.length} clases</div></div><div class="ring" style="--p:${p};--size:64px" data-label="${p}%"></div></div>
          <div class="progress"><span style="width:${p}%"></span></div>
          <div class="stack" style="gap:10px;font-size:var(--fs-sm)">
            <div class="row" style="gap:10px"><span class="circle-btn" style="width:30px;height:30px;background:var(--accent-soft);color:var(--accent)"><i data-lucide="award" class="i" style="width:14px;height:14px"></i></span>Certificado con folio verificable</div>
            <div class="row" style="gap:10px"><span class="circle-btn" style="width:30px;height:30px;background:var(--accent-soft);color:var(--accent)"><i data-lucide="brain" class="i" style="width:14px;height:14px"></i></span>Quiz al final de cada clase</div>
            <div class="row" style="gap:10px"><span class="circle-btn" style="width:30px;height:30px;background:var(--accent-soft);color:var(--accent)"><i data-lucide="unlock" class="i" style="width:14px;height:14px"></i></span>Desbloqueo por avance, a tu ritmo</div>
          </div>
        </div>`}
      </div>
    </div>
  </section>

  <section class="stack" style="gap:20px">
    <div class="section-head"><div><span class="chip chip--primary">Relacionados</span><h2 class="display">Más de <em>${esc(c.area.toLowerCase())}</em></h2></div></div>
    <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr))">${otros.map(tarjetaCurso).join('')}</div>
  </section>`;
}
