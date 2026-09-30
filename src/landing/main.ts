import '@fontsource-variable/outfit/wght.css';
import '@fontsource-variable/inter/opsz.css';
import '@fontsource-variable/jetbrains-mono/index.css';
import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/components.css';
import '../styles/active.css';
import '../styles/landing.css';
import { createIcons, icons } from 'lucide';
import cursos from './cursos-en-vivo.json';
import { Datos } from '../core/datos';

const WA_SITIO = '5212381479365';
const CLUB = (import.meta.env.VITE_CLUB_URL as string | undefined)?.replace(/\/$/, '') || '';
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
const wa = (t: string) => `https://wa.me/${WA_SITIO}?text=${encodeURIComponent(t)}`;
const cfg = Datos.config();

// ── Enlaces ──
document.querySelectorAll<HTMLAnchorElement>('[data-wa]').forEach((a) => { a.href = wa(a.dataset.wa!); a.target = '_blank'; a.rel = 'noopener'; });
document.querySelectorAll<HTMLAnchorElement>('[data-club-link]').forEach((a) => (a.href = CLUB + a.dataset.clubLink));
document.querySelectorAll<HTMLAnchorElement>('[data-praxia]').forEach((a) => {
  const url = new URL(cfg.praxiaUrl);
  url.searchParams.set('utm_source', 'odonteck-landing');
  a.href = url.toString();
});
document.querySelectorAll('[data-descuento]').forEach((e) => (e.textContent = String(cfg.descuentoVIP)));
document.querySelector('[data-anio]')!.textContent = String(new Date().getFullYear());

// ── Catálogo del club con filtro por área ──
const club = Datos.cursos().filter((c) => c.publicado !== false);
document.querySelectorAll('[data-precio-mensual]').forEach((e) => (e.textContent = `$${cfg.precioMensual.toLocaleString('es-MX')}`));
const areas = ['Todos', ...new Set(club.map((c) => c.area))];
let filtro = 'Todos';
function pintarCursos() {
  const lista = filtro === 'Todos' ? club : club.filter((c) => c.area === filtro);
  document.querySelector('[data-filtros]')!.innerHTML = areas.map((a) => `<button class="chip ${a === filtro ? 'chip--primary' : 'chip--outline'}" data-area="${esc(a)}">${esc(a)}</button>`).join('');
  document.querySelector('[data-cursos]')!.innerHTML = lista.map((c, i) => `
    <article class="lp-curso" style="--i:${i}">
      <a class="lp-curso__cover" href="${CLUB}/#/curso/${encodeURIComponent(c.id)}" aria-label="${esc(c.titulo)}"><img src="${c.portada}" alt="" loading="lazy"><span class="chip chip--glass">${esc(c.area)}</span></a>
      <div class="lp-curso__body">
        <h3>${esc(c.titulo)}</h3>
        <p class="lp-curso__ponente"><i data-lucide="play-circle" class="i"></i>${c.clases.length} clases · ${esc(c.nivel)}</p>
        <div class="lp-curso__foot">
          <span class="lp-curso__gratis"><i data-lucide="gift" class="i"></i>Prueba gratis</span>
          <a class="btn btn--brand btn--sm" href="${CLUB}/#/curso/${encodeURIComponent(c.id)}">Ver curso</a>
        </div>
      </div>
    </article>`).join('');
  createIcons({ icons });
}
pintarCursos();

// ── Cursos en vivo (beneficio: descuento para miembros) ──
type CursoVivo = (typeof cursos)[number];
document.querySelector('[data-envivo-flyers]')!.innerHTML = cursos.slice(0, 3).map((c) =>
  `<button class="lp-envivo__flyer" data-temario="${c.id}" aria-label="Ver ${esc(c.nombre)}"><img src="${c.img}" alt="" loading="lazy"></button>`).join('');
function abrirEnVivo() {
  document.querySelector('[data-modal-body]')!.innerHTML = `
    <button class="lp-modal__close" data-cerrar aria-label="Cerrar"><i data-lucide="x" class="i"></i></button>
    <div class="lp-modal__content">
      <span class="chip chip--live">Cursos en vivo</span>
      <h3 class="display" style="font-size:var(--fs-xl);margin:10px 0 6px">Cursos en vivo de OdonTeck</h3>
      <p class="muted">Miembros del club: ${cfg.descuentoVIP}% de descuento. Toca un curso para ver su temario.</p>
      <ul class="lp-envivo__lista">${cursos.map((c) => `<li><button data-temario="${c.id}"><img src="${c.img}" alt="" loading="lazy"><span><strong>${esc(c.nombre)}</strong><small>${esc(c.ponente)} · $${c.costo} MXN</small></span><i data-lucide="chevron-right" class="i"></i></button></li>`).join('')}</ul>
    </div>`;
  createIcons({ icons });
  if (!modal.open) modal.showModal();
}

// ── Modal de temario ──
const modal = document.querySelector<HTMLDialogElement>('[data-modal]')!;
function abrirTemario(c: CursoVivo) {
  document.querySelector('[data-modal-body]')!.innerHTML = `
    <button class="lp-modal__close" data-cerrar aria-label="Cerrar"><i data-lucide="x" class="i"></i></button>
    <div class="lp-modal__cover"><img src="${c.img}" alt=""></div>
    <div class="lp-modal__content">
      <span class="chip chip--primary">${esc(c.area)}</span>
      <h3 class="display" style="font-size:var(--fs-xl);margin:10px 0 6px">${esc(c.nombre)}</h3>
      <p class="muted" style="display:flex;gap:6px;align-items:center"><i data-lucide="user-round" class="i" style="width:16px;height:16px"></i>${esc(c.ponente)}</p>
      <h4>Temario</h4>
      <ol class="lp-modal__temario">${c.temario.map((t) => `<li>${esc(t)}</li>`).join('')}</ol>
      <h4>Incluye</h4>
      <ul class="lp-modal__incluye">${c.beneficios.map((b) => `<li><i data-lucide="check" class="i"></i>${esc(b)}</li>`).join('')}</ul>
      <div class="lp-modal__foot"><span class="lp-curso__precio"><small>Inversión</small>$${c.costo} MXN</span>
        <a class="btn btn--brand btn--pill-arrow" href="${wa(`Hola OdonTeck, quiero inscribirme al curso "${c.nombre}".`)}" target="_blank" rel="noopener">Inscribirme por WhatsApp <span class="arrow"><i data-lucide="arrow-up-right" class="i"></i></span></a></div>
      <p class="faint" style="font-size:var(--fs-xs);margin-top:10px">Miembros del Club OdonTeck: ${cfg.descuentoVIP}% de descuento en cursos en vivo.</p>
    </div>`;
  createIcons({ icons });
  if (!modal.open) modal.showModal();
  modal.scrollTop = 0;
}
modal.addEventListener('click', (e) => { if (e.target === modal || (e.target as HTMLElement).closest('[data-cerrar]')) modal.close(); });

// ── Planes del club ──
const ahorro = cfg.precioMensual * 12 - cfg.precioAnual;
document.querySelector('[data-planes]')!.innerHTML = `
  <div class="lp-plan" data-reveal>
    <span class="lp-plan__name">VIP Mensual</span>
    <strong class="lp-plan__price">$${cfg.precioMensual.toLocaleString('es-MX')}<small> MXN / mes</small></strong>
    <p>Acceso completo al club. Cancela cuando quieras.</p>
    <a class="btn btn--secondary btn--lg" href="${CLUB}/#/login?modo=registro">Empezar mensual</a>
  </div>
  <div class="lp-plan lp-plan--top" data-reveal>
    <span class="lp-plan__badge">${ahorro > 0 ? `Ahorras $${ahorro.toLocaleString('es-MX')}` : 'Mejor precio'}</span>
    <span class="lp-plan__name">VIP Anual</span>
    <strong class="lp-plan__price">$${cfg.precioAnual.toLocaleString('es-MX')}<small> MXN / año</small></strong>
    <p>Equivale a $${Math.round(cfg.precioAnual / 12).toLocaleString('es-MX')} al mes. Un año completo de formación.</p>
    <a class="btn btn--gradient btn--lg btn--pill-arrow" href="${CLUB}/#/login?modo=registro">Unirme al club <span class="arrow"><i data-lucide="arrow-right" class="i"></i></span></a>
  </div>
  <div class="lp-plan lp-plan--info" data-reveal>
    <i data-lucide="gift" class="i"></i>
    <strong>Prueba antes de decidir</strong>
    <p>El primer curso es casi completo gratis, y en los demás puedes probar la primera clase al crear tu cuenta.</p>
  </div>`;

// ── Momentos (fotos reales de generaciones) ──
document.querySelector('[data-momentos]')!.innerHTML = Array.from({ length: 8 }, (_, i) =>
  `<figure class="lp-momento"><img src="/landing/momentos/momento-${String(i + 1).padStart(2, '0')}.webp" alt="Generación de un curso OdonTeck" loading="lazy"></figure>`).join('');

// ── Opiniones (transcritas de las recomendaciones públicas en Facebook) ──
const OPINIONES = [
  { nombre: 'Katia Ballesteros', fecha: '7 oct 2025', texto: 'Excelente curso, siempre están actualizando el contenido y brindan acompañamiento personalizado. Lo mejor es la oportunidad de resolver dudas y analizar casos junto con los docentes. Muy completo y actualizado. ¡Súper recomendado!', estrellas: true },
  { nombre: 'Jorge Chavez', fecha: '8 oct 2025', texto: 'Información y conocimiento amplio y suficiente para reforzar lo aprendido en la carrera de cirujano dentista e implementar una mejor, actualizada y profesional praxis en nuestros consultorios.' },
  { nombre: 'Judith Galindo', fecha: '7 oct 2025', texto: 'Recomiendo los cursos de Odonteck ya que te ayudan a desarrollar nuevas habilidades profesionales, adquirir nuevos conocimientos además de que nos dan información actualizada, obteniendo una mejor preparación.' },
  { nombre: 'Norma Idalia Orozco Orozco', fecha: '7 oct 2025', texto: 'Excelente plataforma, destaco la flexibilidad de horarios, el ritmo de estudios, la diversidad de recursos y herramientas de interacción, lo que facilita el aprendizaje y la actualización.' },
  { nombre: 'BereQui Ramírez', fecha: '4 sep 2025', texto: 'De los mejores cursos y accesibles ya que los podemos ver después si tenemos dudas. Son muy atentos y los cursos muy completos y profesionales. Aprendemos mucho. 100% recomendables.' },
  { nombre: 'Kari AreRui', fecha: '4 sep 2025', texto: 'Excelentes cursos que ofrecen, amplían sin duda conocimientos para poder dar consultas integrales y actualizadas a los pacientes.' },
];
const ini = (n: string) => n.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
document.querySelector('[data-opiniones]')!.innerHTML = OPINIONES.map((o, i) => `
  <figure class="lp-opinion ${i === 0 ? 'lp-opinion--destacada' : ''}" data-reveal>
    <i data-lucide="quote" class="i lp-opinion__quote"></i>
    ${o.estrellas || i === 0 ? '<div class="lp-opinion__stars">★★★★★</div>' : ''}
    <blockquote>${esc(o.texto)}</blockquote>
    <figcaption><span class="avatar">${ini(o.nombre)}</span><span><strong>${esc(o.nombre)}</strong><small>Recomendó OdonTeck en Facebook · ${o.fecha}</small></span></figcaption>
  </figure>`).join('');

createIcons({ icons });

// ── Interacciones ──
document.addEventListener('click', (e) => {
  const el = e.target as HTMLElement;
  const area = el.closest<HTMLElement>('[data-area]');
  if (area) { filtro = area.dataset.area!; pintarCursos(); }
  const t = el.closest<HTMLElement>('[data-temario]');
  if (t) { const c = cursos.find((x) => String(x.id) === t.dataset.temario); if (c) abrirTemario(c); }
  if (el.closest('[data-ver-envivo]')) abrirEnVivo();
  const sc = el.closest<HTMLElement>('[data-scroll]');
  if (sc) { const [k, d] = sc.dataset.scroll!.split(':'); const box = document.querySelector<HTMLElement>(`[data-${k}]`)!; box.scrollBy({ left: Number(d) * box.clientWidth * 0.8, behavior: 'smooth' }); }
  if (el.closest('[data-burger]')) { const m = document.querySelector<HTMLElement>('[data-mobile-menu]')!; m.hidden = !m.hidden; }
  if (el.closest('[data-mobile-menu] a')) document.querySelector<HTMLElement>('[data-mobile-menu]')!.hidden = true;
});

// Nav con fondo al hacer scroll
const nav = document.querySelector<HTMLElement>('[data-nav]')!;
const onScroll = () => nav.classList.toggle('is-scrolled', scrollY > 12);
addEventListener('scroll', onScroll, { passive: true }); onScroll();

// Aparición suave y contadores
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const io = new IntersectionObserver((entries) => entries.forEach((en) => {
  if (!en.isIntersecting) return;
  const el = en.target as HTMLElement;
  el.classList.add('is-in'); io.unobserve(el);
  el.querySelectorAll<HTMLElement>('[data-count]').forEach((c) => {
    const fin = Number(c.dataset.count); const suf = c.dataset.suffix || '';
    if (reduce) { c.textContent = fin + suf; return; }
    const t0 = performance.now();
    const paso = (t: number) => { const k = Math.min(1, (t - t0) / 1400); c.textContent = Math.round(fin * (1 - Math.pow(1 - k, 3))) + suf; if (k < 1) requestAnimationFrame(paso); };
    requestAnimationFrame(paso);
  });
}), { threshold: 0.15 });
document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
  // Lo visible al cargar aparece de inmediato; lo demás al entrar en pantalla
  if (el.getBoundingClientRect().top < innerHeight) { el.classList.add('is-in'); io.observe(el); } else io.observe(el);
});
// Respaldo: si el navegador no reporta intersecciones, mostrar todo
setTimeout(() => document.querySelectorAll('[data-reveal]:not(.is-in)').forEach((el) => { const r = el.getBoundingClientRect(); if (r.top < innerHeight) el.classList.add('is-in'); }), 1200);
addEventListener('scroll', () => document.querySelectorAll('[data-reveal]:not(.is-in)').forEach((el) => { if (el.getBoundingClientRect().top < innerHeight * 0.92) el.classList.add('is-in'); }), { passive: true });

// ── Hero carrusel ──
{
  const heroSlidesEl = document.querySelector<HTMLElement>('[data-hero-slides]');
  if (heroSlidesEl) {
    const HERO_IMGS = ['/fotos/hero-cirujano.webp', '/fotos/hero-consulta.webp', '/fotos/hero-instrumental.webp'];
    heroSlidesEl.innerHTML = HERO_IMGS.map((s, i) => `<img class="lp-hero__slide ${i === 0 ? 'on' : ''}" src="${s}" alt="" ${i === 0 ? '' : 'loading="lazy"'}>`).join('');
    const mediaEl = document.querySelector('.lp-hero__media');
    const dotsWrap = document.createElement('div');
    dotsWrap.className = 'lp-hero__dots';
    dotsWrap.innerHTML = HERO_IMGS.map((_, i) => `<button class="lp-hero__dot ${i === 0 ? 'on' : ''}" data-hero-dot="${i}" aria-label="Portada ${i + 1}"></button>`).join('');
    mediaEl?.appendChild(dotsWrap);
    const slides = [...heroSlidesEl.querySelectorAll('.lp-hero__slide')];
    const dots = [...dotsWrap.querySelectorAll<HTMLButtonElement>('.lp-hero__dot')];
    let idx = 0;
    let timer = 0;
    const go = (n: number) => {
      idx = ((n % slides.length) + slides.length) % slides.length;
      slides.forEach((s, i) => s.classList.toggle('on', i === idx));
      dots.forEach((d, i) => d.classList.toggle('on', i === idx));
    };
    const auto = () => { timer = window.setInterval(() => go(idx + 1), 5000); };
    auto();
    mediaEl?.addEventListener('mouseenter', () => clearInterval(timer));
    mediaEl?.addEventListener('mouseleave', auto);
    dotsWrap.addEventListener('click', (e) => {
      const b = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-hero-dot]');
      if (b) { clearInterval(timer); go(Number(b.dataset.heroDot)); auto(); }
    });
  }
}
