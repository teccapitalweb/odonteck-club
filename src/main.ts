import '@fontsource-variable/outfit/wght.css';
import '@fontsource-variable/inter/opsz.css';
import '@fontsource-variable/jetbrains-mono/index.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/active.css';
import { createIcons, icons } from 'lucide';
import { route, startRouter, onRender, current, navigate } from './core/router';
import { shellHTML, marcarNavActivo } from './ui/shell';
import { Progreso } from './core/progreso';
import { Perfil } from './core/perfil';
import { Comunidad } from './core/comunidad';
import { curso as getCurso } from './core/catalogo';
import { inicio } from './pages/inicio';
import { catalogo } from './pages/cursos';
import { curso } from './pages/curso';
import { clase } from './pages/clase';
import { biblioteca, material } from './pages/materiales';
import { envivo, toggleReserva } from './pages/envivo';
import { comunidad, hilo } from './pages/comunidad';
import { paginaLogros } from './pages/logros';
import { certificados, certificado } from './pages/certificados';
import { praxia, perfil, suscripcion, configuracion, mas } from './pages/cuenta';

// ── Tema: claro por defecto, siempre. El cambio solo dura la sesión ──
const root = document.documentElement;
function setTheme(t: 'light' | 'dark') {
  root.dataset.theme = t;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t === 'dark' ? '#0d1220' : '#f6f5f1');
  document.querySelectorAll<HTMLElement>('[data-theme-toggle] [data-lucide]').forEach((i) => i.setAttribute('data-lucide', t === 'dark' ? 'sun' : 'moon'));
  document.querySelectorAll<HTMLImageElement>('[data-logo]').forEach((img) => { img.src = t === 'dark' ? '/brand/logo-horizontal-dark.png' : '/brand/logo-horizontal.png'; });
  createIcons({ icons });
}

// ── Avisos breves ──
function toast(msg: string, icon = 'check') {
  let host = document.querySelector('.toast-host');
  if (!host) { host = document.createElement('div'); host.className = 'toast-host'; document.body.appendChild(host); }
  const t = document.createElement('div'); t.className = 'toast'; t.innerHTML = `<i data-lucide="${icon}" class="i"></i>${msg}`;
  host.appendChild(t); createIcons({ icons }); setTimeout(() => t.remove(), 3200);
}

// ── Cascarón ──
function montar() { document.getElementById('app')!.innerHTML = shellHTML(); setTheme(root.dataset.theme === 'dark' ? 'dark' : 'light'); }
montar();

// ── Rutas ──
route('/', inicio);
route('/cursos', catalogo);
route('/curso/:id', curso);
route('/curso/:id/clase/:n', clase);
route('/materiales', biblioteca);
route('/materiales/:id', material);
route('/en-vivo', envivo);
route('/comunidad', comunidad);
route('/comunidad/:id', hilo);
route('/logros', paginaLogros);
route('/certificados', certificados);
route('/certificados/:id', certificado);
route('/praxia', praxia);
route('/perfil', perfil);
route('/suscripcion', suscripcion);
route('/configuracion', configuracion);
route('/mas', mas);

onRender(() => { marcarNavActivo(current().path); createIcons({ icons }); });
startRouter(document.getElementById('outlet')!);
const rerender = () => window.dispatchEvent(new HashChangeEvent('hashchange'));

// ── Interacciones globales ──
document.addEventListener('click', async (e) => {
  const el = e.target as HTMLElement;
  if (el.closest('[data-theme-toggle]')) setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');

  const tab = el.closest<HTMLButtonElement>('.tabs button[data-for]');
  if (tab) {
    tab.parentElement!.querySelectorAll('button').forEach((b) => b.classList.toggle('is-active', b === tab));
    tab.closest('[data-tabs]')?.querySelectorAll<HTMLElement>('[data-tab]').forEach((p) => (p.hidden = p.dataset.tab !== tab.dataset.for));
  }

  const marcar = el.closest<HTMLElement>('[data-marcar-vista]');
  if (marcar) {
    const [id, n] = marcar.dataset.marcarVista!.split(':');
    Progreso.marcarVista(id, Number(n));
    const c = getCurso(id);
    const hayNext = c && c.clases.some((k) => k.n === Number(n) + 1);
    if (c && !hayNext) toast('Curso completado · tu certificado ya está listo', 'award');
    navigate(hayNext ? `/curso/${id}/clase/${Number(n) + 1}` : `/curso/${id}`);
  }

  const res = el.closest<HTMLElement>('[data-reservar]');
  if (res) { toggleReserva(res.dataset.reservar!); toast('Reserva actualizada · te avisamos antes de la clase', 'bell'); rerender(); }

  if (el.closest('[data-nuevo-hilo]')) { const f = document.querySelector<HTMLElement>('[data-form-hilo]'); if (f) { f.hidden = false; f.querySelector('input')?.focus(); } }
  if (el.closest('[data-cancelar-hilo]')) { const f = document.querySelector<HTMLElement>('[data-form-hilo]'); if (f) f.hidden = true; }
  const util = el.closest<HTMLElement>('[data-util]');
  if (util) { Comunidad.util(util.dataset.util!); rerender(); }

  const aviso = el.closest<HTMLElement>('[data-aviso]');
  if (aviso) { const p = Perfil.get(); const k = aviso.dataset.aviso as keyof typeof p.avisos; p.avisos[k] = !p.avisos[k]; Perfil.set({ avisos: p.avisos }); aviso.setAttribute('aria-checked', String(p.avisos[k])); }

  const plan = el.closest<HTMLElement>('[data-cambiar-plan]');
  if (plan) toast('El cambio de plan se hace con Stripe en la Fase 2', 'credit-card');

  if (el.closest('[data-imprimir]')) window.print();
  const share = el.closest<HTMLElement>('[data-compartir-cert], [data-compartir]');
  if (share) {
    const url = location.href;
    try { if (navigator.share) await navigator.share({ title: 'OdonTeck Club', url }); else { await navigator.clipboard.writeText(url); toast('Enlace copiado', 'link'); } } catch {}
  }
  if (el.closest('[data-guardar]')) toast('Guardado en tu biblioteca', 'bookmark');
});

document.addEventListener('submit', (e) => {
  const f = e.target as HTMLFormElement;
  if (f.matches('[data-search]')) {
    e.preventDefault();
    const q = new FormData(f).get('q') as string;
    navigate('/cursos' + (q ? '?q=' + encodeURIComponent(q) : ''));
  }
  if (f.matches('[data-form-hilo]')) {
    e.preventDefault(); const d = new FormData(f);
    const h = Comunidad.crear(String(d.get('titulo')).trim(), String(d.get('texto')).trim(), (d.get('cursoId') as string) || null);
    toast('Tema publicado', 'message-circle'); navigate(`/comunidad/${h.id}`);
  }
  if (f.matches('[data-form-respuesta]')) {
    e.preventDefault(); Comunidad.responder(f.dataset.formRespuesta!, String(new FormData(f).get('texto')).trim()); rerender();
  }
  if (f.matches('[data-form-perfil]')) {
    e.preventDefault(); const d = new FormData(f);
    Perfil.set({ nombre: String(d.get('nombre')).trim(), whatsapp: String(d.get('whatsapp')).trim(), especialidad: String(d.get('especialidad')).trim(), ciudad: String(d.get('ciudad')).trim() });
    montar(); startRouter(document.getElementById('outlet')!); toast('Perfil guardado', 'check');
  }
});

// ── PWA: botón de instalar fijo, nunca popups ──
let deferred: any = null;
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e; });
document.addEventListener('click', async (e) => {
  if (!(e.target as HTMLElement).closest('[data-install-btn]')) return;
  if (deferred) { deferred.prompt(); await deferred.userChoice; deferred = null; }
  else toast('En iPhone: Compartir → "Agregar a inicio". En Android/Chrome: menú ⋮ → "Instalar app".', 'smartphone');
});
if (window.matchMedia('(display-mode: standalone)').matches) document.querySelector<HTMLElement>('[data-install]')?.remove();
