import '@fontsource-variable/outfit/wght.css';
import '@fontsource-variable/inter/opsz.css';
import '@fontsource-variable/jetbrains-mono/index.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/active.css';
import './styles/admin.css';
import './styles/arcade.css';
import './styles/encuestas.css';
import './styles/bienvenida.css';
import './styles/encuesta-modal.css';
import './styles/perfil.css';
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
import { toggleReserva } from './pages/envivo';
import { comunidad, hilo } from './pages/comunidad';
import { paginaLogros } from './pages/logros';
import { retos, montarArcade } from './pages/retos';
import { Acceso, mostrarPaywall } from './core/acceso';
import { cargarClub } from './core/remoto';
import { Admin, cargarAdmin } from './core/admin';
import { mostrarOnboarding } from './ui/onboarding';
import { cargarEncuestas, encuestaPendiente, guardarIntereses, reiniciarEncuestas } from './core/encuestas';
import { mostrarEncuestaPendiente } from './ui/encuesta';
import { bienvenida, montarBienvenida, DESTINO_KEY } from './pages/bienvenida';
import { certificados, certificado, verificar } from './pages/certificados';
import { buscar } from './pages/buscar';
import { praxia, perfil, suscripcion, configuracion, mas } from './pages/cuenta';
import { login } from './pages/login';
import { adminCursos, adminCurso, adminQuizzes, adminQuiz, adminMateriales, adminMaterial, adminEnVivo, adminEvento } from './admin/contenido';
import { adminResumen, adminMiembros, adminMiembro, adminComunidad, adminAvisos, adminAjustes, adminEncuestas } from './admin/gestion';

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

// Si el proveedor deja de servir una foto, retiramos sólo la imagen y quedan
// visibles las iniciales que ya están debajo como respaldo accesible.
document.addEventListener('error', (e) => {
  const img = e.target;
  if (img instanceof HTMLImageElement && img.matches('[data-avatar-image]')) img.remove();
}, true);

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
  if (path.startsWith('/verificar')) { montar('solo'); return true; }
  if (path === '/login') {
    if (u) { navigate(sessionStorage.getItem('odt:volver') || '/'); return false; }
    montar('solo'); return true;
  }
  if (!u) { sessionStorage.setItem('odt:volver', location.hash.slice(1) || '/'); navigate('/login'); return false; }
  if (path.startsWith('/admin')) {
    if (!u.esAdmin) { toast('Tu cuenta no tiene acceso al panel de administración', 'shield-alert'); navigate('/'); return false; }
    montar('admin');
    const outlet = document.getElementById('outlet');
    if (outlet) outlet.innerHTML = '<div class="card card--pad row" style="justify-content:center;min-height:180px"><i data-lucide="loader-circle" class="i spin"></i><span>Cargando datos administrativos…</span></div>';
    createIcons({ icons });
    await cargarAdmin(path, current().query);
    return true;
  }
  try { await cargarClub(path); } catch {}
  try { await cargarEncuestas(); } catch {}
  // Primera entrada: la entrevista de bienvenida ocupa su propia página hasta responderla o posponerla.
  const entrevista = encuestaPendiente()?.tipo === 'bienvenida';
  if (path === '/bienvenida') {
    if (!entrevista) { navigate('/'); return false; }
    montar('solo'); return true;
  }
  if (entrevista) {
    if (path !== '/') sessionStorage.setItem(DESTINO_KEY, location.hash.slice(1));
    navigate('/bienvenida'); return false;
  }
  montar('miembro'); return true;
});

// ── Rutas del miembro ──
route('/login', login);
route('/bienvenida', bienvenida);
route('/', inicio);
route('/cursos', catalogo);
route('/curso/:id', curso);
route('/curso/:id/clase/:n', clase);
route('/materiales', biblioteca);
route('/materiales/:id', material);
route('/en-vivo', () => { navigate('/comunidad?tab=en-vivo'); return ''; });
route('/comunidad', comunidad);
route('/comunidad/:id', hilo);
route('/logros', paginaLogros);
route('/retos', retos);
route('/certificados', certificados);
route('/certificados/:id', certificado);
route('/verificar/:folio', verificar);
route('/buscar', buscar);
route('/praxia', praxia);
route('/perfil', perfil);
route('/suscripcion', suscripcion);
route('/configuracion', configuracion);
route('/mas', mas);
// ── Rutas del admin ──
const paginaAdmin = (pagina: (params: Record<string, string>, query: URLSearchParams) => string) => (params: Record<string, string>, query: URLSearchParams) => Admin.error
  ? `<div class="card card--pad stack" style="max-width:720px;margin:auto;text-align:center;gap:14px"><i data-lucide="server-off" class="i" style="width:34px;height:34px;margin:auto"></i><h1 class="display" style="font-size:var(--fs-xl)">No se pudo cargar el panel</h1><p class="muted">${esc(Admin.error)}</p><button class="btn btn--brand" style="justify-self:center" data-reintentar-admin><i data-lucide="refresh-cw" class="i"></i>Reintentar</button></div>`
  : pagina(params, query);
route('/admin', paginaAdmin(adminResumen));
route('/admin/cursos', paginaAdmin(adminCursos));
route('/admin/cursos/:id', paginaAdmin(adminCurso));
route('/admin/quizzes', paginaAdmin(adminQuizzes));
route('/admin/quizzes/:cursoId/:n', paginaAdmin(adminQuiz));
route('/admin/materiales', paginaAdmin(adminMateriales));
route('/admin/materiales/:id', paginaAdmin(adminMaterial));
route('/admin/en-vivo', paginaAdmin(adminEnVivo));
route('/admin/en-vivo/:id', paginaAdmin(adminEvento));
route('/admin/miembros', paginaAdmin(adminMiembros));
route('/admin/miembros/:uid', paginaAdmin(adminMiembro));
route('/admin/comunidad', paginaAdmin(adminComunidad));
route('/admin/avisos', paginaAdmin(adminAvisos));
route('/admin/encuestas', paginaAdmin(adminEncuestas));
route('/admin/ajustes', paginaAdmin(adminAjustes));

onRender(() => {
  const { path } = current();
  if (shellActual === 'admin') marcarAdminActivo(path); else marcarNavActivo(path);
  const crumb = document.querySelector('[data-crumb]'); if (crumb) crumb.textContent = document.querySelector('#outlet h1')?.textContent?.trim() || 'Administración';
  cargarVideos();
  if (path.startsWith('/retos')) montarArcade();
  if (path === '/bienvenida') montarBienvenida(toast);
  createIcons({ icons });
  if (shellActual === 'miembro' && !mostrarEncuestaPendiente(toast)) mostrarOnboarding();
});
instalarAccionesAdmin(toast);
startRouter();
window.addEventListener('datos:cambio', (e) => { if ((e as CustomEvent).detail === 'avisos') actualizarNotifs(); });
window.addEventListener('encuesta:cerrada', () => { if (shellActual === 'miembro') mostrarOnboarding(); });

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
    if (c && !hayNext) { try { await cargarEncuestas(true); } catch {} }
    navigate(hayNext ? `/curso/${id}/clase/${Number(n) + 1}` : `/curso/${id}`);
  }

  const res = el.closest<HTMLElement>('[data-reservar]');
  if (res) {
    const id = res.dataset.reservar!;
    try {
      if (Datos.modo === 'api') {
        const r = await api<{ reservado: boolean }>(`/eventos/${encodeURIComponent(id)}/reserva`, { method: 'POST' });
        const evento = Datos.eventos().find((x) => x.id === id);
        if (evento) Datos.guardarEvento({ ...evento, reservado: r.reservado, reservas: Math.max(0, Number(evento.reservas || 0) + (r.reservado ? 1 : -1)) });
      } else toggleReserva(id);
      toast('Reserva actualizada · te avisamos antes de la clase', 'bell'); render();
    } catch (err) { toast(mensajeError(err), 'alert-triangle'); }
  }

  const descargar = el.closest<HTMLButtonElement>('[data-descargar-material]');
  if (descargar) {
    descargar.disabled = true;
    try {
      const r = await api<{ url: string }>(`/materiales/${encodeURIComponent(descargar.dataset.descargarMaterial!)}/descarga`);
      location.href = r.url;
    } catch (err) { toast(mensajeError(err), 'alert-triangle'); descargar.disabled = false; }
  }

  if (el.closest('[data-pregunta-rapida]')) {
    if (!Acceso.puedeComunidad()) { mostrarPaywall('Publicar en la comunidad es para miembros VIP. Puedes leer todos los temas gratis.'); return; }
    navigate('/comunidad?tab=foro'); setTimeout(() => { const f = document.querySelector<HTMLElement>('[data-form-hilo]'); if (f) { f.hidden = false; f.querySelector('input')?.focus(); } }, 100); return; }
  if (el.closest('[data-nuevo-hilo]')) {
    if (!Acceso.puedeComunidad()) { mostrarPaywall('Publicar en la comunidad es para miembros VIP. Puedes leer todos los temas gratis.'); return; }
    const f = document.querySelector<HTMLElement>('[data-form-hilo]'); if (f) { f.hidden = false; f.querySelector('input')?.focus(); } }
  if (el.closest('[data-cancelar-hilo]')) { const f = document.querySelector<HTMLElement>('[data-form-hilo]'); if (f) f.hidden = true; }
  const util = el.closest<HTMLElement>('[data-util]');
  if (util) {
    if (!Acceso.puedeComunidad()) { mostrarPaywall('Reaccionar en la comunidad es para miembros VIP.'); return; }
    try {
      if (Datos.modo === 'api') {
        const r = await api<{ util: number }>(`/foro/${encodeURIComponent(util.dataset.util!)}/util`, { method: 'POST' });
        Comunidad.utilRemoto(util.dataset.util!, r.util);
      } else Comunidad.util(util.dataset.util!);
      render();
    } catch (err) { toast(mensajeError(err), 'alert-triangle'); }
  }

  const aviso = el.closest<HTMLElement>('[data-aviso]');
  if (aviso) {
    const p = Perfil.get(); const k = aviso.dataset.aviso as keyof typeof p.avisos; const anterior = p.avisos[k];
    p.avisos[k] = !anterior;
    try {
      if (Datos.modo === 'api') {
        const perfil = await api<Partial<ReturnType<typeof Perfil.get>>>('/me/perfil', { method: 'PATCH', json: { avisos: { [k]: p.avisos[k] } } });
        Perfil.hidratar(perfil, p.plan, p.vence);
      } else Perfil.set({ avisos: p.avisos });
      aviso.setAttribute('aria-checked', String(p.avisos[k]));
    } catch (err) { p.avisos[k] = anterior; aviso.setAttribute('aria-checked', String(anterior)); toast(mensajeError(err), 'alert-triangle'); }
  }

  const plan = el.closest<HTMLElement>('[data-cambiar-plan]');
  if (plan) {
    if (Datos.modo === 'api' && import.meta.env.VITE_STRIPE_CHECKOUT_ENABLED !== 'true') {
      location.href = 'https://www.odonteckconsulting.com/vip-auth.html?tab=register';
    }
    else if (Datos.modo === 'api') { try { const r = await api<{ url: string }>('/stripe/checkout', { method: 'POST', json: { plan: plan.dataset.cambiarPlan } }); location.href = r.url; } catch (err) { toast(mensajeError(err), 'alert-triangle'); } }
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
  if (el.closest('[data-salir]')) { await Auth.salir(); reiniciarEncuestas(); shellActual = null; navigate('/login'); }

  // Opción de quiz marcada visualmente (el input está oculto)
  const opt = el.closest<HTMLLabelElement>('.quiz__opt');
  if (opt && opt.closest('[data-quiz-miembro]') && !opt.closest('form')!.dataset.calificado) opt.querySelector('input')!.checked = true;
});

function remontarDesdeLogin() { shellActual = null; const v = sessionStorage.getItem('odt:volver') || '/'; sessionStorage.removeItem('odt:volver'); navigate(v === '/login' ? '/' : v); render(); }
function mostrarErrorLogin(err: unknown) { const p = document.querySelector<HTMLElement>('[data-login-error]'); if (p) { p.hidden = false; p.textContent = mensajeError(err); } else toast(mensajeError(err), 'alert-triangle'); }

document.addEventListener('change', (e) => {
  const input = e.target as HTMLInputElement;
  if (!input.matches('[data-form-intereses] input[name="intereses"]')) return;
  const form = input.closest<HTMLFormElement>('[data-form-intereses]')!;
  let elegidos = [...form.querySelectorAll<HTMLInputElement>('input[name="intereses"]:checked')];
  if (elegidos.length > 3) {
    input.checked = false;
    elegidos = elegidos.filter((x) => x !== input);
    toast('Puedes elegir hasta 3 intereses.', 'alert-triangle');
  }
  const completo = elegidos.length >= 3;
  form.querySelectorAll<HTMLInputElement>('input[name="intereses"]').forEach((opcion) => {
    opcion.disabled = completo && !opcion.checked;
    opcion.closest('label')?.querySelector('[data-lucide]')?.setAttribute('data-lucide', opcion.checked ? 'check' : 'plus');
  });
  const contador = form.querySelector<HTMLElement>('[data-intereses-contador]');
  if (contador) contador.textContent = `${elegidos.length}/3`;
  createIcons({ icons });
});

document.addEventListener('submit', async (e) => {
  const f = e.target as HTMLFormElement;
  if (f.matches('[data-search]')) {
    e.preventDefault(); const q = new FormData(f).get('q') as string;
    navigate('/buscar' + (q ? '?q=' + encodeURIComponent(q) : ''));
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
    const [cursoId, nStr] = f.dataset.quizMiembro!.split(':');
    const n = Number(nStr);
    const q = Datos.quiz(cursoId, n); if (!q) return;
    const d = new FormData(f);
    const respuestas = q.preguntas.map((_, i) => Number(d.get(`r${i}`)));
    const btn = f.querySelector<HTMLButtonElement>('button')!;
    btn.setAttribute('disabled', '');

    type Detalle = { correcta: number; explicacion: string };
    let correctas: number, total: number, aprobado: boolean, detalle: Detalle[];

    if (Datos.modo === 'api') {
      try {
        const r = await api<{ correctas: number; total: number; aprobado: boolean; detalle: Detalle[] }>(
          `/quiz/${encodeURIComponent(cursoId)}/${n}`, { method: 'POST', json: { respuestas } });
        ({ correctas, total, aprobado, detalle } = r);
      } catch (err) { toast(mensajeError(err), 'alert-triangle'); btn.removeAttribute('disabled'); return; }
    } else {
      detalle = q.preguntas.map((p) => ({ correcta: p.correcta, explicacion: p.explicacion }));
      correctas = respuestas.filter((r, i) => r === detalle[i].correcta).length;
      total = q.preguntas.length;
      aprobado = correctas / total >= 0.7;
    }

    q.preguntas.forEach((_, i) => {
      const r = respuestas[i]; const det = detalle[i];
      const fs = f.querySelector(`[data-pregunta="${i}"]`)!;
      fs.querySelectorAll<HTMLLabelElement>('.quiz__opt').forEach((o, j) => {
        o.classList.toggle('is-correct', j === det.correcta);
        o.classList.toggle('is-wrong', j === r && r !== det.correcta);
      });
      const exp = fs.querySelector<HTMLElement>('.quiz__exp')!;
      if (det.explicacion) exp.textContent = det.explicacion;
      exp.hidden = false;
    });

    const res = f.querySelector<HTMLElement>('.quiz__resultado')!;
    res.hidden = false; res.className = `quiz__resultado ${aprobado ? 'ok' : 'no'}`;
    res.textContent = aprobado ? `¡Muy bien! ${correctas} de ${total} correctas.` : `${correctas} de ${total} correctas. Repasa la clase y vuelve a intentarlo.`;
    f.dataset.calificado = '1';
    btn.removeAttribute('disabled'); btn.textContent = 'Intentar de nuevo'; btn.type = 'button';
    btn.onclick = () => render();
    try { const k = 'odonteck-club:intentos:v1'; const h = JSON.parse(localStorage.getItem(k) || '{}'); h[`${cursoId}_${n}`] = { ok: correctas, total, aprobado, fecha: new Date().toISOString() }; localStorage.setItem(k, JSON.stringify(h)); } catch {}
  }
  if (f.matches('[data-form-hilo]')) {
    e.preventDefault();
    if (!Acceso.puedeComunidad()) { mostrarPaywall('Publicar en la comunidad es para miembros VIP.'); return; }
    const d = new FormData(f);
    try {
      const datos = { titulo: String(d.get('titulo')).trim(), texto: String(d.get('texto')).trim(), cursoId: (d.get('cursoId') as string) || null };
      const h = Datos.modo === 'api'
        ? Comunidad.agregarRemoto(await api('/foro', { method: 'POST', json: datos }))
        : Comunidad.crear(datos.titulo, datos.texto, datos.cursoId);
      toast('Tema publicado', 'message-circle'); navigate(`/comunidad/${h.id}`);
    } catch (err) { toast(mensajeError(err), 'alert-triangle'); }
  }
  if (f.matches('[data-form-respuesta]')) {
    e.preventDefault();
    if (!Acceso.puedeComunidad()) { mostrarPaywall('Responder en la comunidad es para miembros VIP.'); return; }
    const id = f.dataset.formRespuesta!; const texto = String(new FormData(f).get('texto')).trim();
    try {
      if (Datos.modo === 'api') {
        const respuesta = await api<Parameters<typeof Comunidad.responderRemoto>[1]>(`/foro/${encodeURIComponent(id)}/respuestas`, { method: 'POST', json: { texto } });
        Comunidad.responderRemoto(id, respuesta);
      } else Comunidad.responder(id, texto);
      render();
    } catch (err) { toast(mensajeError(err), 'alert-triangle'); }
  }
  if (f.matches('[data-form-perfil]')) {
    e.preventDefault(); const d = new FormData(f);
    const cambios = { nombre: String(d.get('nombre')).trim(), whatsapp: String(d.get('whatsapp')).trim(), especialidad: String(d.get('especialidad')).trim(), ciudad: String(d.get('ciudad')).trim() };
    try {
      if (Datos.modo === 'api') {
        const actual = Perfil.get();
        const perfil = await api<Partial<ReturnType<typeof Perfil.get>>>('/me/perfil', { method: 'PATCH', json: cambios });
        Perfil.hidratar(perfil, actual.plan, actual.vence);
      } else Perfil.set(cambios);
      remontar(); toast('Perfil guardado', 'check');
    } catch (err) { toast(mensajeError(err), 'alert-triangle'); }
  }
  if (f.matches('[data-form-intereses]')) {
    e.preventDefault();
    const intereses = new FormData(f).getAll('intereses').map(String);
    const btn = f.querySelector<HTMLButtonElement>('button[type="submit"], button:not([type])');
    if (btn) btn.disabled = true;
    try {
      await guardarIntereses(intereses);
      remontar();
      toast('Tus intereses quedaron actualizados.', 'sparkles');
    } catch (err) {
      toast(mensajeError(err), 'alert-triangle');
      if (btn) btn.disabled = false;
    }
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
