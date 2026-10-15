// Anuncio de bienvenida «Escoge tu curso gratis». Paso 1: elegir entre todos los cursos.
// Paso 2: confirmar viendo el temario (la última clase queda para VIP). Paso 3: celebrar.
import { createIcons, icons } from 'lucide';
import { cursos } from '../core/catalogo';
import { CursoGratis } from '../core/curso-gratis';
import { Acceso } from '../core/acceso';
import { Auth } from '../core/auth';
import type { Curso } from '../core/datos';
import { esc } from './partials';

const POSPUESTO_KEY = 'odonteck-club:curso-gratis:pospuesto';
type Toast = (msg: string, icon?: string) => void;

const elegibles = () => cursos.filter((c) => c.publicado !== false && c.clases.length >= 2);
const minutos = (c: Curso) => c.clases.reduce((s, k) => s + (k.duracion || 0), 0);
const duracion = (c: Curso) => { const m = minutos(c); return m >= 60 ? `${Math.floor(m / 60)} h ${m % 60 ? `${m % 60} min` : ''}`.trim() : m ? `${m} min` : `${c.clases.length} clases`; };

/** Debe aparecer: miembro gratis, ya sabemos que no ha elegido y no lo pospuso en esta sesión. */
export function debeMostrarCursoGratis() {
  if (!Auth.usuario || Acceso.vip() || !CursoGratis.cargado() || CursoGratis.id()) return false;
  if (!elegibles().length) return false;
  try { if (sessionStorage.getItem(POSPUESTO_KEY)) return false; } catch {}
  return true;
}

/** Intenta mostrar el anuncio de bienvenida. Devuelve true si quedó abierto. */
export function mostrarEleccionCursoGratis(toast: Toast, opciones: { forzar?: boolean; cursoId?: string } = {}) {
  if (document.querySelector('.cg')) return true;
  if (!opciones.forzar && !debeMostrarCursoGratis()) return false;
  if (Acceso.vip()) return false;
  const actual = CursoGratis.estado();
  if (actual?.cursoId && !actual.puedeCambiar) { toast('Tu curso gratis ya está definido. Hazte VIP para abrir todos.', 'lock'); return false; }

  const el = document.createElement('div');
  el.className = 'cg';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.setAttribute('aria-label', 'Escoge tu curso gratis');
  document.body.appendChild(el);
  document.documentElement.classList.add('cg-open');
  let area = 'Todas';
  const cerrar = (posponer = false) => {
    if (posponer) { try { sessionStorage.setItem(POSPUESTO_KEY, '1'); } catch {} }
    el.classList.add('is-leaving');
    setTimeout(() => { el.remove(); document.documentElement.classList.remove('cg-open'); }, 220);
    document.removeEventListener('keydown', alTeclado);
  };
  const alTeclado = (e: KeyboardEvent) => { if (e.key === 'Escape' && !el.querySelector('.cg__done')) cerrar(true); };
  document.addEventListener('keydown', alTeclado);

  const pintarLista = () => {
    const lista = elegibles();
    const areas = ['Todas', ...new Set(lista.map((c) => c.area))];
    const visibles = area === 'Todas' ? lista : lista.filter((c) => c.area === area);
    const portadas = lista.slice(0, 5);
    el.innerHTML = `
      <div class="cg__shell">
        <button class="cg__x" type="button" data-cg-later aria-label="Decidir después"><i data-lucide="x" class="i"></i></button>
        <aside class="cg__hero">
          <div class="cg__hero-bg" aria-hidden="true">${portadas.map((c, i) => `<img src="${esc(c.portada)}" alt="" style="--i:${i}">`).join('')}</div>
          <div class="cg__hero-copy">
            <span class="cg__kicker"><i data-lucide="gift" class="i"></i>Regalo de bienvenida</span>
            <h2>Tu primer curso<br><em>va por nuestra cuenta.</em></h2>
            <p>Elige el que más te sirva hoy. Lo tienes completo, gratis, desde la primera hasta la penúltima clase.</p>
            <ul>
              <li><i data-lucide="play-circle" class="i"></i>Clases grabadas por especialistas</li>
              <li><i data-lucide="brain" class="i"></i>Quiz por clase y avance guiado</li>
              <li><i data-lucide="crown" class="i"></i>La clase final y el certificado, con VIP</li>
            </ul>
            <div class="cg__count"><strong>${lista.length}</strong><span>cursos para elegir</span></div>
          </div>
        </aside>
        <section class="cg__pick">
          <header>
            <span class="eyebrow">Paso 1 de 2</span>
            <h3>Escoge tu curso gratis</h3>
            <p>Solo puedes elegir uno. Los demás se abren con la membresía VIP.</p>
          </header>
          <nav class="cg__areas" aria-label="Filtrar por área">${areas.map((a) => `<button type="button" class="${a === area ? 'is-active' : ''}" data-cg-area="${esc(a)}">${esc(a)}</button>`).join('')}</nav>
          <div class="cg__grid">
            ${visibles.map((c) => `<button type="button" class="cg-card" data-cg-curso="${esc(c.id)}">
              <span class="cg-card__img"><img src="${esc(c.portada)}" alt="" loading="lazy"><span class="cg-card__area">${esc(c.area)}</span></span>
              <span class="cg-card__body"><strong>${esc(c.titulo)}</strong><small>${esc(c.instructor)}</small>
                <span class="cg-card__meta"><span><i data-lucide="play-circle" class="i"></i>${c.clases.length} clases</span><span><i data-lucide="clock-3" class="i"></i>${duracion(c)}</span><span><i data-lucide="signal" class="i"></i>${esc(c.nivel)}</span></span>
              </span>
              <span class="cg-card__go" aria-hidden="true">Elegir <i data-lucide="arrow-right" class="i"></i></span>
            </button>`).join('')}
          </div>
          <footer><button type="button" class="cg__later" data-cg-later>Decidir después</button><span><i data-lucide="shield-check" class="i"></i>Sin tarjeta. Sin compromiso.</span></footer>
        </section>
      </div>`;
    createIcons({ icons });
  };

  const pintarConfirmacion = (c: Curso) => {
    const ultima = Math.max(...c.clases.map((k) => k.n));
    const cambio = !!CursoGratis.id();
    el.innerHTML = `
      <div class="cg__shell cg__shell--confirm">
        <button class="cg__x" type="button" data-cg-later aria-label="Decidir después"><i data-lucide="x" class="i"></i></button>
        <aside class="cg__cover"><img src="${esc(c.banner || c.portada)}" alt=""><div><span class="cg__kicker"><i data-lucide="sparkles" class="i"></i>${esc(c.area)} · ${esc(c.nivel)}</span><h2>${esc(c.titulo)}</h2><p>${esc(c.instructor)}</p></div></aside>
        <section class="cg__confirm">
          <header><span class="eyebrow">Paso 2 de 2</span><h3>${cambio ? 'Cambiar tu curso gratis' : 'Confirma tu curso gratis'}</h3><p>${esc(c.descripcion)}</p></header>
          <div class="cg__stats"><span><strong>${c.clases.length - 1}</strong><small>clases gratis</small></span><span><strong>${duracion(c)}</strong><small>de contenido</small></span><span><strong>1</strong><small>clase final VIP</small></span></div>
          <ol class="cg__temario">${c.clases.map((k) => `<li class="${k.n === ultima ? 'is-vip' : ''}"><span>${k.n === ultima ? '<i data-lucide="crown" class="i"></i>' : k.n}</span><div><b>${esc(k.titulo)}</b><small>${k.n === ultima ? 'Clase final · incluida en VIP' : k.duracion ? `${k.duracion} min · gratis` : 'Gratis'}</small></div></li>`).join('')}</ol>
          <p class="cg__aviso"><i data-lucide="info" class="i"></i>${cambio ? 'Este es tu único cambio. Después, tu curso gratis queda definido.' : 'Tu elección es definitiva. Solo puedes cambiarla una vez en las próximas 24 horas, si no has avanzado más de una clase.'}</p>
          <footer><button type="button" class="btn btn--ghost" data-cg-back><i data-lucide="arrow-left" class="i"></i>Ver otros cursos</button><button type="button" class="btn btn--brand btn--lg" data-cg-confirm="${esc(c.id)}"><i data-lucide="gift" class="i"></i>${cambio ? 'Cambiar a este curso' : 'Elegir este curso'}</button></footer>
        </section>
      </div>`;
    createIcons({ icons });
  };

  const pintarListo = (c: Curso) => {
    el.innerHTML = `
      <div class="cg__shell cg__done">
        <div class="cg__confetti" aria-hidden="true">${Array.from({ length: 28 }, (_, i) => `<i style="--x:${(i * 37) % 100};--d:${(i % 7) * 90}ms;--h:${(i * 53) % 360}"></i>`).join('')}</div>
        <span class="cg__done-ic"><i data-lucide="party-popper" class="i"></i></span>
        <span class="eyebrow">¡Listo!</span>
        <h2>${esc(c.titulo)} es tuyo</h2>
        <p>Tienes ${c.clases.length - 1} clases gratis para empezar hoy. Cuando quieras la clase final, el certificado y los demás cursos, hazte VIP.</p>
        <div class="cg__done-actions"><a class="btn btn--brand btn--lg" href="#/curso/${esc(c.id)}/clase/1" data-cg-close><i data-lucide="play" class="i"></i>Empezar la clase 1</a><a class="btn btn--secondary" href="#/curso/${esc(c.id)}" data-cg-close>Ver el temario</a></div>
      </div>`;
    createIcons({ icons });
  };

  el.addEventListener('click', async (e) => {
    const t = e.target as HTMLElement;
    if (t === el && !el.querySelector('.cg__done')) { cerrar(true); return; }
    if (t.closest('[data-cg-later]')) { cerrar(true); toast('Puedes elegirlo cuando quieras desde Inicio o Cursos.', 'gift'); return; }
    if (t.closest('[data-cg-close]')) { cerrar(); return; }
    const filtro = t.closest<HTMLElement>('[data-cg-area]');
    if (filtro) { area = filtro.dataset.cgArea || 'Todas'; pintarLista(); return; }
    if (t.closest('[data-cg-back]')) { pintarLista(); return; }
    const tarjeta = t.closest<HTMLElement>('[data-cg-curso]');
    if (tarjeta) { const c = cursos.find((x) => x.id === tarjeta.dataset.cgCurso); if (c) pintarConfirmacion(c); return; }
    const confirmar = t.closest<HTMLButtonElement>('[data-cg-confirm]');
    if (confirmar) {
      const c = cursos.find((x) => x.id === confirmar.dataset.cgConfirm); if (!c) return;
      confirmar.disabled = true; confirmar.classList.add('is-loading');
      try { await CursoGratis.elegir(c.id); try { sessionStorage.removeItem(POSPUESTO_KEY); } catch {} pintarListo(c); window.dispatchEvent(new CustomEvent('curso-gratis:elegido', { detail: c.id })); }
      catch (err) { confirmar.disabled = false; confirmar.classList.remove('is-loading'); toast(err instanceof Error ? err.message : 'No pudimos guardar tu elección. Intenta de nuevo.', 'alert-triangle'); }
    }
  });

  const preseleccion = opciones.cursoId ? cursos.find((c) => c.id === opciones.cursoId) : null;
  if (preseleccion) pintarConfirmacion(preseleccion); else pintarLista();
  return true;
}
