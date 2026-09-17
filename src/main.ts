import '@fontsource-variable/outfit/wght.css';
import '@fontsource-variable/inter/opsz.css';
import '@fontsource-variable/jetbrains-mono/index.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/active.css';
import { createIcons, icons } from 'lucide';

// ── Tema: claro por defecto, siempre. El cambio solo dura la sesión ──
const root = document.documentElement;
function setTheme(t: 'light' | 'dark') {
  root.dataset.theme = t;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t === 'dark' ? '#0d1220' : '#f6f5f1');
  document.querySelectorAll<HTMLElement>('[data-theme-toggle]').forEach((b) => {
    b.setAttribute('aria-pressed', String(t === 'dark'));
    b.querySelector('[data-lucide]')?.setAttribute('data-lucide', t === 'dark' ? 'sun' : 'moon');
  });
  document.querySelectorAll<HTMLImageElement>('[data-logo]').forEach((img) => {
    img.src = t === 'dark' ? '/brand/logo-horizontal-dark.png' : '/brand/logo-horizontal.png';
  });
  createIcons({ icons });
}
document.addEventListener('click', (e) => {
  const t = (e.target as HTMLElement).closest('[data-theme-toggle]');
  if (t) setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
  const tab = (e.target as HTMLElement).closest<HTMLButtonElement>('.tabs button');
  if (tab) {
    tab.parentElement!.querySelectorAll('button').forEach((b) => b.classList.toggle('is-active', b === tab));
    const panel = tab.closest('[data-tabs]');
    panel?.querySelectorAll<HTMLElement>('[data-tab]').forEach((p) => (p.hidden = p.dataset.tab !== tab.dataset.for));
  }
  const opt = (e.target as HTMLElement).closest('.quiz__opt');
  if (opt) { opt.parentElement!.querySelectorAll('.quiz__opt').forEach((o) => o.classList.remove('is-correct')); opt.classList.add('is-correct'); }
  const sw = (e.target as HTMLElement).closest('.switch');
  if (sw) sw.setAttribute('aria-checked', String(sw.getAttribute('aria-checked') !== 'true'));
});
setTheme('light');
