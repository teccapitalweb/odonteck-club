// «Escoge tu curso gratis»: anuncio de bienvenida (primera entrada) y el controlador del
// pantalla independiente #/curso-gratis (filtros, panel de detalle, confirmación y celebración).
import { createIcons, icons } from 'lucide';
import { cursos } from '../core/catalogo';
import { CursoGratis } from '../core/curso-gratis';
import { Acceso } from '../core/acceso';
import { Auth } from '../core/auth';
import { navigate } from '../core/router';
import { detalleCursoGratis } from '../pages/curso-gratis';
import { esc } from './partials';

type Toast = (msg: string, icon?: string) => void;
const elegibles = () => cursos.filter((c) => c.publicado !== false && c.clases.length >= 2);

/** Debe aparecer el anuncio: miembro gratis y estado de elección confirmado. */
export function debeMostrarCursoGratis() {
  if (!Auth.usuario || Acceso.vip() || !CursoGratis.cargado() || CursoGratis.id()) return false;
  if (!elegibles().length || location.hash.startsWith('#/curso-gratis')) return false;
  return true;
}

/**
 * Anuncio de bienvenida. Con `cursoId` o `forzar` (botones de la app) lleva directo a la pantalla.
 * Devuelve true si quedó algo abierto (para no encimar el recorrido de bienvenida).
 */
export function mostrarEleccionCursoGratis(_toast: Toast, opciones: { forzar?: boolean; cursoId?: string } = {}) {
  if (opciones.forzar || opciones.cursoId) {
    navigate(`/curso-gratis${opciones.cursoId ? `?curso=${encodeURIComponent(opciones.cursoId)}` : ''}`);
    return true;
  }
  if (document.querySelector('.cga')) return true;
  if (!debeMostrarCursoGratis()) return false;
  const lista = elegibles();
  const portadas = lista.slice(0, 9);
  const el = document.createElement('div');
  el.className = 'cga';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.setAttribute('aria-label', 'Regalo de bienvenida: escoge tu curso gratis');
  el.innerHTML = `
    <div class="cga__card">
      <div class="cga__visual" aria-hidden="true">
        <div class="cga__stack">${portadas.map((c, i) => `<img src="${esc(c.portada)}" alt="" style="--i:${i};left:${4 + (i % 3) * 31 + (i % 2) * 3}%;top:${5 + Math.floor(i / 3) * 29 + ((i + 1) % 2) * 5}%">`).join('')}</div>
        <span class="cga__ribbon"><i data-lucide="gift" class="i"></i>GRATIS</span>
      </div>
      <div class="cga__copy">
        <span class="cga__kicker"><i data-lucide="sparkles" class="i"></i>Regalo de bienvenida</span>
        <h2>Tu primer curso <em>va por nuestra cuenta.</em></h2>
        <p>Escoge cualquiera de nuestros ${lista.length} cursos y tómalo gratis: todas sus clases, menos la final.</p>
        <ul>
          <li><i data-lucide="check" class="i"></i>Clases de especialistas con casos reales</li>
          <li><i data-lucide="check" class="i"></i>Quiz por clase y avance guiado</li>
          <li><i data-lucide="check" class="i"></i>Sin tarjeta, sin compromiso</li>
        </ul>
        <div class="cga__actions"><button type="button" class="btn btn--brand btn--lg btn--pill-arrow" data-cga-ir>Escoger mi curso gratis <span class="arrow"><i data-lucide="arrow-right" class="i"></i></span></button></div>
      </div>
    </div>`;
  document.body.appendChild(el);
  document.documentElement.classList.add('cg-open');
  createIcons({ icons });
  const cerrar = () => {
    el.classList.add('is-leaving');
    setTimeout(() => { el.remove(); document.documentElement.classList.remove('cg-open'); }, 220);
  };
  el.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    if (t.closest('[data-cga-ir]')) { cerrar(); navigate('/curso-gratis'); }
  });
  return true;
}

// ── Pantalla independiente #/curso-gratis ──
let quitarModulo: (() => void) | null = null;

/** Quita el panel de selección (vive en <body>) al salir de la ruta. */
export function desmontarCursoGratis() {
  quitarModulo?.();
  document.querySelectorAll('body > .cgm-drawer').forEach((d) => d.remove());
}

export function montarCursoGratis(toast: Toast) {
  const raiz = document.querySelector<HTMLElement>('[data-cgm]');
  if (!raiz) return;
  // Si el panel ya no está dentro de la página, este render ya se montó: no repetir.
  const drawer = raiz.querySelector<HTMLElement>('[data-cgm-drawer]');
  if (!drawer) return;
  desmontarCursoGratis();
  // El contenido de la app tiene transformaciones de transición: un `position: fixed` dentro
  // quedaría anclado a ese contenedor y no a la ventana. El panel se monta en <body>.
  document.body.appendChild(drawer);
  const panel = drawer.querySelector<HTMLElement>('[data-cgm-panel]')!;
  const grid = raiz.querySelector<HTMLElement>('[data-cgm-grid]');
  const vacio = raiz.querySelector<HTMLElement>('[data-cgm-vacio]');
  const expandir = raiz.querySelector<HTMLButtonElement>('[data-cgm-expand]');
  const cambio = raiz.dataset.cambio === '1';
  const puedeElegir = !Acceso.vip() && (!CursoGratis.id() || cambio);
  let area = '';
  let texto = '';
  let orden = '';
  let expandido = false;

  const filtrar = () => {
    if (!grid) return;
    const tarjetas = [...grid.querySelectorAll<HTMLElement>('[data-cgm-card]')];
    let visibles = 0;
    tarjetas.forEach((t) => {
      const ok = (!area || t.dataset.area === area) && (!texto || (t.dataset.texto || '').includes(texto));
      t.hidden = !ok; if (ok) visibles++;
    });
    if (orden) tarjetas.sort((a, b) => (Number(a.dataset.min) - Number(b.dataset.min)) * (orden === 'corto' ? 1 : -1)).forEach((t) => grid.appendChild(t));
    const explorando = !!(area || texto || orden);
    grid.classList.toggle('cgm-grid--collapsed', !expandido && !explorando);
    if (expandir) expandir.hidden = expandido || explorando;
    if (vacio) vacio.hidden = visibles > 0;
  };

  const abrir = (id: string) => {
    const c = cursos.find((x) => x.id === id); if (!c) return;
    if (!puedeElegir) { navigate(`/curso/${id}`); return; }
    panel.innerHTML = detalleCursoGratis(c, cambio);
    drawer.classList.add('is-open'); drawer.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('cg-open');
    panel.scrollTop = 0;
    createIcons({ icons });
    panel.querySelector<HTMLElement>('[data-cgm-elegir]')?.focus({ preventScroll: true });
  };
  const cerrar = () => { drawer.classList.remove('is-open'); drawer.setAttribute('aria-hidden', 'true'); document.documentElement.classList.remove('cg-open'); };

  const celebrar = (id: string) => {
    const c = cursos.find((x) => x.id === id)!;
    cerrar();
    const el = document.createElement('div');
    el.className = 'cgm-done';
    el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true');
    el.innerHTML = `<div class="cgm-done__card"><div class="cgm-done__confetti" aria-hidden="true">${Array.from({ length: 36 }, (_, i) => `<i style="--x:${(i * 29) % 100};--d:${(i % 9) * 70}ms;--h:${(i * 47) % 360};--r:${(i * 61) % 360}deg"></i>`).join('')}</div>
      <img class="cgm-done__img" src="${esc(c.portada)}" alt="">
      <span class="cgm-done__ic"><i data-lucide="party-popper" class="i"></i></span>
      <span class="eyebrow">¡Es tuyo!</span><h2>${esc(c.titulo)}</h2>
      <p>Tienes ${c.clases.length - 1} clases gratis para empezar hoy. Cuando quieras la clase final, el certificado y todo el catálogo, hazte VIP.</p>
      <div class="cgm-done__actions"><a class="btn btn--brand btn--lg btn--pill-arrow" href="#/curso/${esc(c.id)}/clase/1">Empezar la clase 1 <span class="arrow"><i data-lucide="play" class="i"></i></span></a><a class="btn btn--secondary" href="#/curso/${esc(c.id)}">Ver el temario</a></div></div>`;
    document.body.appendChild(el);
    createIcons({ icons });
    el.addEventListener('click', (e) => { const t = e.target as HTMLElement; if (t === el || t.closest('a')) el.remove(); });
  };

  const alClic = async (e: MouseEvent) => {
    const t = e.target as HTMLElement;
    const scroll = t.closest<HTMLAnchorElement>('[data-cgm-scroll]');
    if (scroll) { e.preventDefault(); raiz.querySelector(scroll.getAttribute('href') || '')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    const verOtros = t.closest<HTMLAnchorElement>('a.cgm-link[href^="#cgm-"]');
    if (verOtros) { e.preventDefault(); raiz.querySelector(verOtros.getAttribute('href')!)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    const filtro = t.closest<HTMLButtonElement>('[data-cgm-area]');
    if (filtro) { area = filtro.dataset.cgmArea || ''; raiz.querySelectorAll('[data-cgm-area]').forEach((b) => b.classList.toggle('is-active', b === filtro)); filtrar(); return; }
    if (t.closest('[data-cgm-expand]')) { expandido = true; grid?.classList.remove('cgm-grid--collapsed'); if (expandir) expandir.hidden = true; return; }
    const ver = t.closest<HTMLElement>('[data-cgm-ver]');
    if (ver) { abrir(ver.dataset.cgmVer || ''); return; }
    if (t.closest('[data-cgm-cerrar]') || t === drawer) { cerrar(); return; }
    const elegir = t.closest<HTMLButtonElement>('[data-cgm-elegir]');
    if (elegir) {
      elegir.disabled = true; elegir.classList.add('is-loading');
      try {
        await CursoGratis.elegir(elegir.dataset.cgmElegir || '');
        celebrar(elegir.dataset.cgmElegir || '');
        window.dispatchEvent(new CustomEvent('curso-gratis:elegido'));
      } catch (err) { elegir.disabled = false; elegir.classList.remove('is-loading'); toast(err instanceof Error ? err.message : 'No pudimos guardar tu elección.', 'alert-triangle'); }
    }
  };
  const alEscribir = (e: Event) => {
    const t = e.target as HTMLInputElement;
    if (t.matches('[data-cgm-buscar]')) { texto = t.value.trim().toLocaleLowerCase('es-MX').normalize('NFD').replace(/[̀-ͯ]/g, ''); filtrar(); }
    if (t.matches('[data-cgm-orden]')) { orden = t.value; filtrar(); }
  };
  const alTeclado = (e: KeyboardEvent) => { if (e.key === 'Escape' && drawer.classList.contains('is-open')) cerrar(); };
  raiz.addEventListener('click', alClic);
  drawer.addEventListener('click', alClic);
  raiz.addEventListener('input', alEscribir);
  raiz.addEventListener('change', alEscribir);
  document.addEventListener('keydown', alTeclado);
  quitarModulo = () => { drawer.removeEventListener('click', alClic); raiz.removeEventListener('click', alClic); raiz.removeEventListener('input', alEscribir); raiz.removeEventListener('change', alEscribir); document.removeEventListener('keydown', alTeclado); document.documentElement.classList.remove('cg-open'); quitarModulo = null; };

  const pre = raiz.dataset.preseleccion;
  if (pre) abrir(pre);
}
