// Cascarón de la app: barra lateral, barra superior, barra inferior móvil, salida del router.
import { Perfil } from '../core/perfil';
import { Auth } from '../core/auth';
import { Datos } from '../core/datos';
import { Acceso } from '../core/acceso';
import { Progreso } from '../core/progreso';
import { puntos } from '../core/logros';
import { avatarUsuario, esc } from './partials';
const proximos = () => Datos.eventos().filter((e) => e.publicado !== false && new Date(e.fecha).getTime() > Date.now()).length;
export const NAV = [
  { href: '#/', icon: 'home', label: 'Inicio', match: /^\/$/ },
  { href: '#/cursos', icon: 'graduation-cap', label: 'Cursos', match: /^\/(cursos|curso\/)/ },
  { href: '#/materiales', icon: 'library', label: 'Materiales', match: /^\/materiales/ },
  { href: '#/comunidad', icon: 'messages-square', label: 'Comunidad', match: /^\/comunidad/, badge: 2 },
  { href: '#/directorio', icon: 'contact-round', label: 'Directorio', match: /^\/directorio/ },
  { href: '#/retos', icon: 'gamepad-2', label: 'Retos', match: /^\/retos/ },
  { group: 'Herramientas' },
  { href: '#/herramientas', icon: 'wrench', label: 'Herramientas Pro', match: /^\/herramientas/ },
  { href: '#/praxia', icon: 'stethoscope', label: 'Prueba Praxia', match: /^\/praxia/ },
  { group: 'Tu progreso' },
  { href: '#/brujula', icon: 'compass', label: 'Mi Brújula', match: /^\/brujula/ },
  { href: '#/recompensas', icon: 'gift', label: 'Recompensas', match: /^\/recompensas/ },
  { href: '#/logros', icon: 'flame', label: 'Logros', match: /^\/logros/ },
  { href: '#/certificados', icon: 'award', label: 'Certificados', match: /^\/certificados/ },
] as const;

export function shellHTML() {
  const foto = Auth.usuario?.foto;
  const avatar = (clases = 'avatar') => avatarUsuario(foto, Perfil.iniciales(), clases);
  const perfil = Perfil.get();
  const saldo = puntos();
  const clasesVistas = Progreso.totalVistas();
  const cursosCompletados = Progreso.completados().length;
  // La elección del curso gratis vive fuera de los módulos: es una pantalla de acceso obligatoria.
  const items = NAV.map((n) =>
    'group' in n
      ? `<div class="nav__label eyebrow">${n.group}</div>`
      : `<a class="nav__item" href="${n.href}" data-nav><i data-lucide="${n.icon}" class="i"></i>${n.label}${'badge' in n && proximos() ? `<span class="badge">${proximos()}</span>` : ''}</a>`
  ).join('');
  const bottom = NAV.filter((n) => 'href' in n).slice(0, 4).map((n: any) =>
    `<a href="${n.href}" data-nav><i data-lucide="${n.icon}" class="i"></i>${n.label}</a>`).join('') +
    `<a href="#/mas" data-nav><i data-lucide="menu" class="i"></i>Más</a>`;
  return `
  <div class="app">
    <aside class="sidebar">
      <a class="sidebar__logo" href="#/"><img data-logo src="/brand/logo-horizontal.png" alt="OdonTeck" /></a>
      <nav class="nav">${items}${Auth.usuario?.esAdmin ? `<div class="nav__label eyebrow">TEC Capital</div><a class="nav__item nav__item--admin" href="#/admin"><i data-lucide="shield-check" class="i"></i>Panel admin</a>` : ''}</nav>
      <div class="sidebar__foot">
        ${!Acceso.vip() ? `<button class="btn btn--brand" style="width:100%" data-paywall="Hazte VIP y desbloquea todos los cursos, la biblioteca y los retos."><i data-lucide="crown" class="i"></i>Hazte VIP</button>` : `<div class="install-card" data-install>
          <h4>Lleva OdonTeck en tu bolsillo</h4>
          <p>Instálalo como app: abre más rápido y a pantalla completa.</p>
          <button class="btn btn--sm" data-install-btn><i data-lucide="download" class="i"></i>Instalar app</button>
        </div>`}
        <div class="user-card">
          <a class="user-card__link" href="#/perfil" aria-label="Abrir mi perfil">
            ${avatar('avatar user-card__avatar')}
            <div class="user-card__identity"><div class="user-card__name">${esc(Perfil.get().nombre)}</div><div class="user-card__plan">${Acceso.vip() ? `<i data-lucide="crown" class="i"></i>${Perfil.planNombre()}` : `<i data-lucide="user" class="i"></i>Plan gratis`}</div></div>
          </a>
          <button type="button" class="user-card__logout" data-salir aria-label="Cerrar sesión en este dispositivo" title="Cerrar sesión"><i data-lucide="log-out" class="i"></i></button>
        </div>
      </div>
    </aside>
    <div class="main">
      <header class="topbar">
        <form class="search" data-search><i data-lucide="search" class="i"></i><input class="input" name="q" placeholder="Buscar cursos, clases o materiales…" autocomplete="off" /></form>
        <div class="topbar__right">
          <button class="btn btn--ghost btn--icon" data-guia aria-label="Guía de la plataforma"><i data-lucide="help-circle" class="i"></i></button>
          <button class="btn btn--ghost btn--icon" data-theme-toggle aria-label="Cambiar tema"><i data-lucide="moon" class="i"></i></button>
          <button class="btn btn--ghost btn--icon topbar__logout" type="button" data-salir aria-label="Cerrar sesión"><i data-lucide="log-out" class="i"></i></button>
          <div class="notifs"><button class="btn btn--ghost btn--icon" aria-label="Notificaciones" data-notifs><i data-lucide="bell" class="i"></i><span class="badge notifs__badge" data-notifs-badge hidden></span></button><div class="notifs__panel" data-notifs-panel hidden></div></div>
          <button class="topbar__avatar" type="button" aria-label="Abrir resumen de mi cuenta" aria-controls="account-quick-panel" aria-expanded="false" data-account-toggle>${avatar()}</button>
        </div>
      </header>
      <div class="account-quick__scrim" data-account-scrim hidden></div>
      <aside class="account-quick" id="account-quick-panel" aria-label="Resumen de mi cuenta" data-account-drawer hidden>
        <div class="account-quick__hero">
          <div class="account-quick__top"><span><i data-lucide="sparkles" class="i"></i>Tu espacio OdonTeck</span><button type="button" data-account-close aria-label="Cerrar resumen"><i data-lucide="x" class="i"></i></button></div>
          <div class="account-quick__identity">
            <div class="account-quick__avatar-wrap">${avatar('avatar account-quick__avatar')}<span class="account-quick__status"><i data-lucide="check" class="i"></i></span></div>
            <div><strong>${esc(perfil.nombre)}</strong><small>${esc(Auth.usuario?.email || 'Cuenta de demostración')}</small><span class="account-quick__plan"><i data-lucide="${Acceso.vip() ? 'crown' : 'user-round'}" class="i"></i>${esc(Perfil.planNombre())}</span></div>
          </div>
        </div>
        <div class="account-quick__body">
          <div class="account-quick__stats" aria-label="Actividad">
            <div><strong data-account-points>${saldo}</strong><span>Puntos</span></div>
            <div><strong data-account-views>${clasesVistas}</strong><span>Clases</span></div>
            <div><strong data-account-courses>${cursosCompletados}</strong><span>Cursos</span></div>
          </div>
          <a class="account-quick__reward" href="#/recompensas">
            <span class="account-quick__reward-icon"><i data-lucide="gift" class="i"></i></span>
            <div><span>Saldo para recompensas</span><strong><b data-account-points>${saldo}</b> puntos disponibles</strong><small>Canjéalos por libros y beneficios.</small></div>
            <i data-lucide="chevron-right" class="i"></i>
          </a>
          <nav class="account-quick__links" aria-label="Accesos de cuenta">
            <a href="#/perfil"><span><i data-lucide="contact" class="i"></i></span><div><strong>Mi perfil</strong><small>Datos profesionales</small></div><i data-lucide="arrow-up-right" class="i"></i></a>
            <a href="#/logros"><span><i data-lucide="badge-check" class="i"></i></span><div><strong>Mis logros</strong><small>Avances y medallas</small></div><i data-lucide="arrow-up-right" class="i"></i></a>
            <a href="#/suscripcion"><span><i data-lucide="crown" class="i"></i></span><div><strong>Membresía</strong><small>Plan y beneficios</small></div><i data-lucide="arrow-up-right" class="i"></i></a>
            <a href="#/configuracion"><span><i data-lucide="settings-2" class="i"></i></span><div><strong>Configuración</strong><small>Avisos y apariencia</small></div><i data-lucide="arrow-up-right" class="i"></i></a>
          </nav>
          <div class="account-quick__tip"><i data-lucide="lightbulb" class="i"></i><p><strong>Tu siguiente avance empieza aquí.</strong><span>Cada clase, reto y encuesta puede sumar a tu progreso.</span></p></div>
          <button type="button" class="account-quick__logout" data-salir aria-label="Cerrar sesión en este dispositivo"><i data-lucide="log-out" class="i"></i>Cerrar sesión</button>
        </div>
      </aside>
      <main class="content" id="outlet" style="display:grid;gap:56px;align-content:start"></main>
    </div>
  </div>
  <nav class="bottom-nav">${bottom}</nav>`;
}

export function marcarNavActivo(path: string) {
  document.querySelectorAll<HTMLAnchorElement>('[data-nav]').forEach((a) => {
    const item = NAV.find((n) => 'href' in n && n.href === a.getAttribute('href')) as any;
    a.classList.toggle('is-active', item ? item.match.test(path) : false);
  });
}
