import '@fontsource-variable/outfit/wght.css';
import '@fontsource-variable/inter/opsz.css';
import '@fontsource-variable/jetbrains-mono/index.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/active.css';
import './styles/admin.css';
import './styles/arcade.css';
import { createIcons, icons } from 'lucide';
import { route, startRouter, onRender, onBeforeRender, current, navigate, render } from './core/router';
import { shellHTML, marcarNavActivo } from './ui/shell';
import { adminShellHTML, marcarAdminActivo } from './admin/shell';
import { instalarAccionesAdmin } from './admin/acciones';
import { Auth, api, mensajeError } from './core/auth';
import { Datos } from './core/datos';
import { Progreso } from './core/progreso';
import { Perfil } from './core/perfil';
import { Comunidad } from './core/comunidad';
import { curso as getCurso } from './core/catalogo';
import { esc } from './ui/partials';
import { inicio } from './pages/inicio';
import { catalogo } from './pages/cursos';
import { curso } from './pages/curso';
import { clase } from './pages/clase';
import { biblioteca, material } from './pages/materiales';
import { envivo, toggleReserva } from './pages/envivo';
import { comunidad, hilo } from './pages/comunidad';
import { paginaLogros } from './pages/logros';
import { retos, montarArcade } from './pages/retos';
import { Acceso, mostrarPaywall } from './core/acceso';
import { mostrarOnboarding } from './ui/onboarding';
import { certificados, certificado } from './pages/certificados';
import { praxia, perfil, suscripcion, configuracion, mas } from './pages/cuenta';
import { login } from './pages/login';
import { adminCursos, adminCurso, adminQuizzes, adminQuiz, adminMateriales, adminMaterial, adminEnVivo, adminEvento } from './admin/contenido';
import { adminResumen, adminMiembros, adminMiembro, adminComunidad, adminAvisos, adminAjustes } from './admin/gestion';

// ── Tema: claro por defecto, siempre. El cambio solo dura la sesión ──
const root = document.documentElement;
function setTheme(t: 'light' | 'dark') {
  root.dataset.theme = t;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t === 'dark' ? '#0d1220' : '#f6f5f1');
  document.querySelectorAll<HTMLElement>('[data-theme-toggle] [data-lucide], [data-theme-toggle] svg').forEach((i) => i.setAttribute('data-lucide', t === 'dark' ? 'sun' : 'moon'));
  document.querySelectorAll<HTMLImageElement>('[data-logo]').forEach((img) => {
    const admin = !!img.closest('.sidebar--admin');
    img.src = admin || t === 'dark' ? '/brand/logo-horizontal-dark.png' : '/brand/logo-horizontal.png';
  });
  createIcons({ icons });
}

// ── Avisos breves ──
function toast(msg: string, icon = 'check') {
  let host = document.querySelector('.toast-host');
  if (!host) { host = document.createElement('div'); host.className = 'toast-host'; document.body.appendChild(host); }
  const t = document.createElement('div'); t.className = 'toast'; t.innerHTML = `<i data-lucide="${icon}" class="i"></i>${esc(msg)}`;
  host.appendChild(t); createIcons({ icons }); setTimeout(() => t.remove(), 3200);
}

// ── Cascarones: miembro, admin o pantalla sola (login) ──
let shellActual: 'miembro' | 'admin' | 'solo' | null = null;
function montar(tipo: 'miembro' | 'admin' | 'solo') {
  if (shellActual === tipo) return;
  shellActual = tipo;
  document.getElementById('app')!.innerHTML = tipo === 'miembro' ? shellHTML() : tipo === 'admin' ? adminShellHTML() : '<main id="outlet"></main>';
  setTheme(root.dataset.theme === 'dark' ? 'dark' : 'light');
  actualizarNotifs();
}
function remontar() { const t = shellActual; shellActual = null; if (t) montar(t); render(); }

onBeforeRender(async (path) => {
  await Auth.iniciar();
  const u = Auth.usuario;
  if (path === '/login') {
    if (u) { navigate(sessionStorage.getItem('odt:volver') || '/'); return false; }
    montar('solo'); return true;
  }
  if (!u) { sessionStorage.setItem('odt:volver', location.hash.slice(1) || '/'); navigate('/login'); return false; }
  if (path.startsWith('/admin')) {
    if (!u.esAdmin) { toast('Tu cuenta no tiene acceso al panel de administración', 'shield-alert'); navigate('/'); return false; }
    montar('admin'); return true;
  }
  montar('miembro'); return true;
});

// ── Rutas del miembro ──
route('/login', login);
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
route('/retos', retos);
route('/certificados', certificados);
route('/certificados/:id', certificado);
route('/praxia', praxia);
route('/perfil', perfil);
route('/suscripcion', suscripcion);
route('/configuracion', configuracion);
route('/mas', mas);
// ── Rutas del admin ──
route('/admin', adminResumen);
route('/admin/cursos', adminCursos);
route('/admin/cursos/:id', adminCurso);
route('/admin/quizzes', adminQuizzes);
route('/admin/quizzes/:cursoId/:n', adminQuiz);
route('/admin/materiales', adminMateriales);
route('/admin/materiales/:id', adminMaterial);
route('/admin/en-vivo', adminEnVivo);
route('/admin/en-vivo/:id', adminEvento);
route('/admin/miembros', adminMiembros);
route('/admin/miembros/:uid', adminMiembro);
route('/admin/comunidad', adminComunidad);
route('/admin/avisos', adminAvisos);
route('/admin/ajustes', adminAjustes);

onRender(() => {
  const { path } = current();
  if (shellActual === 'admin') marcarAdminActivo(path); else marcarNavActivo(path);
  const crumb = document.querySelector('[data-crumb]'); if (crumb) crumb.textContent = document.querySelector('#outlet h1')?.textContent?.trim() || 'Administración';
  cargarVideos();
  if (path.startsWith('/retos')) montarArcade();
  createIcons({ icons });
  if (shellActual === 'miembro') mostrarOnboarding();
});
instalarAccionesAdmin(toast);
startRouter();
window.addEventListener('datos:cambio', (e) => { if ((e as CustomEvent).detail === 'avisos') actualizarNotifs(); });

// ── Video: en modo api el backend firma el enlace de Bunny ──
async function cargarVideos() {
  if (Datos.modo === 'demo') return;
  for (const f of document.querySelectorAll<HTMLIFrameElement>('iframe[data-video]:not([src])')) {
    const [cursoId, n] = f.dataset.video!.split(':');
    try { const r = await api<{ embedUrl: string }>('/video/token', { method: 'POST', json: { cursoId, n: Number(n) } }); f.src = r.embedUrl; }
    catch (e: any) { f.replaceWith(Object.assign(document.createElement('div'), { className: 'player__error', textContent: e.status === 403 ? 'Esta clase es para miembros VIP.' : 'No se pudo cargar el video. Intenta de nuevo.' })); }
  }
}

// ── Notificaciones (avisos publicados desde el admin) ──
const VISTO_KEY = 'odonteck-club:avisos-visto';
function actualizarNotifs() {
  const badge = document.querySelector<HTMLElement>('[data-notifs-badge]'); if (!badge) return;
  const visto = localStorage.getItem(VISTO_KEY) || '';
  const nuevos = Datos.avisos().filter((a) => a.fecha > visto).length;
  badge.hidden = !nuevos; badge.textContent = String(nuevos);
}
function abrirNotifs(panel: HTMLElement) {
  const visto = localStorage.getItem(VISTO_KEY) || '';
  const l = Datos.avisos();
  panel.innerHTML = `<div class="row" style="justify-content:space-between;padding:6px 10px"><strong style="font-size:var(--fs-sm)">Avisos</strong><span class="faint" style="font-size:var(--fs-xs)">${l.length}</span></div>` +
    (l.length ? l.map((a) => `<a class="notif ${a.fecha > visto ? 'is-new' : ''}" href="${esc(a.enlace || '#/')}"><strong>${esc(a.titulo)}</strong><p>${esc(a.texto)}</p></a>`).join('')
              : '<p class="muted" style="padding:16px;font-size:var(--fs-sm);text-align:center">No tienes avisos nuevos.</p>');
  localStorage.setItem(VISTO_KEY, new Date().toISOString());
  actualizarNotifs();
}

// ── Interacciones globales del miembro ──
document.addEventListener('click', async (e) => {
  const el = e.target as HTMLElement;
  const pw = el.closest<HTMLElement>('[data-paywall]');
  if (pw) { mostrarPaywall(pw.dataset.paywall || undefined); return; }

  if (el.closest('[data-guia]')) { mostrarOnboarding(true); return; }

  if (el.closest('[data-theme-toggle]')) setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');

  const bell = el.closest('[data-notifs]');
  const panel = document.querySelector<HTMLElement>('[data-notifs-panel]');
  if (panel) {
    if (bell) { panel.hidden = !panel.hidden; if (!panel.hidden) abrirNotifs(panel); }
    else if (!el.closest('[data-notifs-panel]')) panel.hidden = true;
  }

  const tab = el.closest<HTMLButtonElement>('.tabs button[data-for]');
  if (tab) {
    tab.parentElement!.querySelectorAll('button').forEach((b) => b.classList.toggle('is-active', b === tab));
    tab.closest('[data-tabs]')?.querySelectorAll<HTMLElement>('[data-tab]').forEach((p) => (p.hidden = p.dataset.tab !== tab.dataset.for));
  }

  const marcar = el.closest<HTMLElement>('[data-marcar-vista]');
  if (marcar) {
    const [id, n] = marcar.dataset.marcarVista!.split(':');
    if (Datos.modo === 'api') { try { await api(`/progreso/${id}/vista`, { method: 'POST', json: { n: Number(n) } }); } catch (err) { toast(mensajeError(err), 'alert-triangle'); return; } }
    Progreso.marcarVista(id, Number(n));
    const c = getCurso(id);
    const hayNext = c && c.clases.some((k) => k.n === Number(n) + 1);
    if (c && !hayNext) toast('Curso completado · tu certificado ya está listo', 'award');
    navigate(hayNext ? `/curso/${id}/clase/${Number(n) + 1}` : `/curso/${id}`);
  }

  const res = el.closest<HTMLElement>('[data-reservar]');
  if (res) { toggleReserva(res.dataset.reservar!); toast('Reserva actualizada · te avisamos antes de la clase', 'bell'); render(); }

  if (el.closest('[data-nuevo-hilo]')) {
    if (!Acceso.puedeComunidad()) { mostrarPaywall('Publicar en la comunidad es para miembros VIP. Puedes leer todos los temas gratis.'); return; }
    const f = document.querySelector<HTMLElement>('[data-form-hilo]'); if (f) { f.hidden = false; f.querySelector('input')?.focus(); } }
  if (el.closest('[data-cancelar-hilo]')) { const f = document.querySelector<HTMLElement>('[data-form-hilo]'); if (f) f.hidden = true; }
  const util = el.closest<HTMLElement>('[data-util]');
  if (util) { if (!Acceso.puedeComunidad()) { mostrarPaywall('Reaccionar en la comunidad es para miembros VIP.'); return; } Comunidad.util(util.dataset.util!); render(); }

  const aviso = el.closest<HTMLElement>('[data-aviso]');
  if (aviso) { const p = Perfil.get(); const k = aviso.dataset.aviso as keyof typeof p.avisos; p.avisos[k] = !p.avisos[k]; Perfil.set({ avisos: p.avisos }); aviso.setAttribute('aria-checked', String(p.avisos[k])); }

  const plan = el.closest<HTMLElement>('[data-cambiar-plan]');
  if (plan) {
    if (Datos.modo === 'api') { try { const r = await api<{ url: string }>('/stripe/checkout', { method: 'POST', json: { plan: plan.dataset.cambiarPlan } }); location.href = r.url; } catch (err) { toast(mensajeError(err), 'alert-triangle'); } }
    else toast('En el demo no se cobra. Con el backend conectado abre el pago seguro de Stripe.', 'credit-card');
  }
  if (el.closest('[data-portal-stripe]')) {
    if (Datos.modo === 'api') { try { const r = await api<{ url: string }>('/stripe/portal', { method: 'POST' }); location.href = r.url; } catch (err) { toast(mensajeError(err), 'alert-triangle'); } }
    else toast('El portal de facturación de Stripe se abre con el backend conectado.', 'credit-card');
  }

  if (el.closest('[data-imprimir]')) window.print();
  const share = el.closest<HTMLElement>('[data-compartir-cert], [data-compartir]');
  if (share) { try { if (navigator.share) await navigator.share({ title: 'OdonTeck Club', url: location.href }); else { await navigator.clipboard.writeText(location.href); toast('Enlace copiado', 'link'); } } catch {} }
  if (el.closest('[data-guardar]')) toast('Guardado en tu biblioteca', 'bookmark');

  // Login
  if (el.closest('[data-login-demo]')) { await Auth.entrarDemo(); remontarDesdeLogin(); }
  if (el.closest('[data-login-google]')) { try { await Auth.entrarGoogle(); remontarDesdeLogin(); } catch (err) { mostrarErrorLogin(err); } }
  if (el.closest('[data-salir]')) { await Auth.salir(); shellActual = null; navigate('/login'); }

  // Opción de quiz marcada visualmente (el input está oculto)
  const opt = el.closest<HTMLLabelElement>('.quiz__opt');
  if (opt && opt.closest('[data-quiz-miembro]') && !opt.closest('form')!.dataset.calificado) opt.querySelector('input')!.checked = true;
});

function remontarDesdeLogin() { shellActual = null; const v = sessionStorage.getItem('odt:volver') || '/'; sessionStorage.removeItem('odt:volver'); navigate(v === '/login' ? '/' : v); render(); }
function mostrarErrorLogin(err: unknown) { const p = document.querySelector<HTMLElement>('[data-login-error]'); if (p) { p.hidden = false; p.textContent = mensajeError(err); } else toast(mensajeError(err), 'alert-triangle'); }

document.addEventListener('submit', async (e) => {
  const f = e.target as HTMLFormElement;
  if (f.matches('[data-search]')) {
    e.preventDefault(); const q = new FormData(f).get('q') as string;
    navigate('/cursos' + (q ? '?q=' + encodeURIComponent(q) : ''));
  }
  if (f.matches('[data-login-form]')) {
    e.preventDefault(); const d = new FormData(f); const btn = f.querySelector('button')!; btn.setAttribute('disabled', '');
    try {
      const modo = f.dataset.loginForm;
      if (modo === 'entrar') await Auth.entrarCorreo(String(d.get('email')), String(d.get('pass')));
      if (modo === 'registro') await Auth.registrar(String(d.get('nombre')).trim(), String(d.get('email')), String(d.get('pass')));
      if (modo === 'recuperar') { await Auth.recuperar(String(d.get('email'))); toast('Te enviamos un correo para crear tu contraseña', 'mail'); navigate('/login'); return; }
      remontarDesdeLogin();
    } catch (err) { mostrarErrorLogin(err); } finally { btn.removeAttribute('disabled'); }
  }
  if (f.matches('[data-quiz-miembro]')) {
    e.preventDefault();
    const [cursoId, n] = f.dataset.quizMiembro!.split(':');
    const q = Datos.quiz(cursoId, Number(n)); if (!q) return;
    const d = new FormData(f); let ok = 0;
    q.preguntas.forEach((p, i) => {
      const r = Number(d.get(`r${i}`)); const fs = f.querySelector(`[data-pregunta="${i}"]`)!;
      fs.querySelectorAll<HTMLLabelElement>('.quiz__opt').forEach((o, j) => { o.classList.toggle('is-correct', j === p.correcta); o.classList.toggle('is-wrong', j === r && r !== p.correcta); });
      fs.querySelector<HTMLElement>('.quiz__exp')!.hidden = false;
      if (r === p.correcta) ok++;
    });
    const aprobado = ok / q.preguntas.length >= 0.7;
    const res = f.querySelector<HTMLElement>('.quiz__resultado')!;
    res.hidden = false; res.className = `quiz__resultado ${aprobado ? 'ok' : 'no'}`;
    res.textContent = aprobado ? `¡Muy bien! ${ok} de ${q.preguntas.length} correctas.` : `${ok} de ${q.preguntas.length} correctas. Repasa la clase y vuelve a intentarlo.`;
    f.dataset.calificado = '1';
    const btn = f.querySelector<HTMLButtonElement>('button')!; btn.textContent = 'Intentar de nuevo'; btn.type = 'button';
    btn.onclick = () => render();
    try { const k = 'odonteck-club:intentos:v1'; const h = JSON.parse(localStorage.getItem(k) || '{}'); h[`${cursoId}_${n}`] = { ok, total: q.preguntas.length, aprobado, fecha: new Date().toISOString() }; localStorage.setItem(k, JSON.stringify(h)); } catch {}
  }
  if (f.matches('[data-form-hilo]')) {
    e.preventDefault();
    if (!Acceso.puedeComunidad()) { mostrarPaywall('Publicar en la comunidad es para miembros VIP.'); return; }
    const d = new FormData(f);
    const h = Comunidad.crear(String(d.get('titulo')).trim(), String(d.get('texto')).trim(), (d.get('cursoId') as string) || null);
    toast('Tema publicado', 'message-circle'); navigate(`/comunidad/${h.id}`);
  }
  if (f.matches('[data-form-respuesta]')) {
    e.preventDefault();
    if (!Acceso.puedeComunidad()) { mostrarPaywall('Responder en la comunidad es para miembros VIP.'); return; }
    Comunidad.responder(f.dataset.formRespuesta!, String(new FormData(f).get('texto')).trim()); render();
  }
  if (f.matches('[data-form-perfil]')) {
    e.preventDefault(); const d = new FormData(f);
    Perfil.set({ nombre: String(d.get('nombre')).trim(), whatsapp: String(d.get('whatsapp')).trim(), especialidad: String(d.get('especialidad')).trim(), ciudad: String(d.get('ciudad')).trim() });
    remontar(); toast('Perfil guardado', 'check');
  }
});

// ── PWA: service worker y botón de instalar fijo, nunca popups ──
if ('serviceWorker' in navigator && import.meta.env.PROD) window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
let deferred: any = null;
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e; });
window.addEventListener('appinstalled', () => { document.querySelectorAll('[data-install]').forEach((x) => x.remove()); toast('OdonTeck quedó instalado en tu dispositivo', 'smartphone'); });
document.addEventListener('click', async (e) => {
  if (!(e.target as HTMLElement).closest('[data-install-btn]')) return;
  if (deferred) { deferred.prompt(); await deferred.userChoice; deferred = null; return; }
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  toast(ios ? 'En iPhone: toca Compartir y luego "Agregar a inicio".' : 'En Chrome: menú ⋮ → "Instalar app" o "Agregar a pantalla principal".', 'smartphone');
});
if (window.matchMedia('(display-mode: standalone)').matches) document.addEventListener('DOMContentLoaded', () => document.querySelectorAll('[data-install]').forEach((x) => x.remove()));
