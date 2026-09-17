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
import { placeholder } from './ui/partials';
import { Progreso } from './core/progreso';
import { curso as getCurso } from './core/catalogo';
import { inicio } from './pages/inicio';
import { catalogo } from './pages/cursos';
import { curso } from './pages/curso';
import { clase } from './pages/clase';

// ── Tema: claro por defecto, siempre. El cambio solo dura la sesión ──
const root = document.documentElement;
function setTheme(t: 'light' | 'dark') {
  root.dataset.theme = t;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t === 'dark' ? '#0d1220' : '#f6f5f1');
  document.querySelectorAll<HTMLElement>('[data-theme-toggle] [data-lucide]').forEach((i) => i.setAttribute('data-lucide', t === 'dark' ? 'sun' : 'moon'));
  document.querySelectorAll<HTMLImageElement>('[data-logo]').forEach((img) => { img.src = t === 'dark' ? '/brand/logo-horizontal-dark.png' : '/brand/logo-horizontal.png'; });
  createIcons({ icons });
}

// ── Cascarón ──
document.getElementById('app')!.innerHTML = shellHTML();
setTheme('light');

// ── Rutas ──
route('/', inicio);
route('/cursos', catalogo);
route('/curso/:id', curso);
route('/curso/:id/clase/:n', clase);
route('/materiales', () => placeholder('Materiales', 'Tu biblioteca de PDFs, libros y presentaciones. Llega en la Fase 4.', 'library'));
route('/en-vivo', () => placeholder('En vivo', 'Próximas clases en vivo, reservas y grabaciones. Llega en la Fase 4.', 'radio'));
route('/comunidad', () => placeholder('Comunidad', 'Foro por curso y canal de WhatsApp. Llega en la Fase 6.', 'messages-square'));
route('/logros', () => placeholder('Logros', 'Medallas, racha y puntos ligados a tu progreso real. Llega en la Fase 6.', 'flame'));
route('/certificados', () => placeholder('Certificados', 'Con folio y verificación pública. Llega en la Fase 4.', 'award'));
route('/praxia', () => placeholder('Prueba Praxia', 'La plataforma de TEC Capital para tu consultorio. Llega en la Fase 6.', 'stethoscope'));
route('/perfil', () => placeholder('Mi perfil', 'Nombre para certificados, foto, WhatsApp y preferencias. Llega en la Fase 4.', 'user'));
route('/configuracion', () => placeholder('Configuración', 'Tema, notificaciones, instalar app, sesión. Llega en la Fase 4.', 'settings'));
route('/mas', () => placeholder('Más', 'Comunidad, logros, certificados, Praxia y configuración.', 'menu'));

onRender(() => { marcarNavActivo(current().path); createIcons({ icons }); });
startRouter(document.getElementById('outlet')!);

// ── Interacciones globales ──
document.addEventListener('click', (e) => {
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
    navigate(hayNext ? `/curso/${id}/clase/${Number(n) + 1}` : `/curso/${id}`);
  }
});
document.querySelector<HTMLFormElement>('[data-search]')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const q = new FormData(e.target as HTMLFormElement).get('q') as string;
  navigate('/cursos' + (q ? '?q=' + encodeURIComponent(q) : ''));
});

// ── PWA: botón de instalar fijo, nunca popups ──
let deferred: any = null;
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e; });
document.querySelector('[data-install-btn]')?.addEventListener('click', async () => {
  if (deferred) { deferred.prompt(); await deferred.userChoice; deferred = null; }
  else alert('En iPhone: toca Compartir y luego "Agregar a inicio". En Android/Chrome: menú ⋮ → "Instalar app".');
});
if (window.matchMedia('(display-mode: standalone)').matches) document.querySelector<HTMLElement>('[data-install]')?.remove();
