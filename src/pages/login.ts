import { Datos } from '../core/datos';
import { cursos } from '../core/catalogo';

export function login(_: Record<string, string>, query: URLSearchParams) {
  const modo = query.get('modo') === 'registro' ? 'registro' : query.get('modo') === 'recuperar' ? 'recuperar' : 'entrar';
  const totalClases = cursos.reduce((a, c) => a + c.clases.length, 0);
  const resumenCatalogo = cursos.length ? `${cursos.length} cursos · ${totalClases} clases` : 'Cursos y clases clínicas';
  const google = `<button type="button" class="login__google" data-login-google><svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M21.35 11.1H12v2.9h5.4c-.25 1.4-1 2.6-2.1 3.4v2.8h3.4c2-1.85 3.15-4.55 3.15-7.75 0-.65-.05-1.1-.5-1.35z"/><path fill="#34A853" d="M12 22c2.85 0 5.25-.95 7-2.55l-3.4-2.8c-.95.65-2.15 1.05-3.6 1.05-2.75 0-5.1-1.85-5.95-4.4H2.55v2.9C4.3 19.6 7.85 22 12 22z"/><path fill="#FBBC05" d="M6.05 13.3c-.2-.65-.35-1.3-.35-2s.15-1.35.35-2V6.4H2.55A9.9 9.9 0 0 0 2 11.3c0 1.6.4 3.1 1.05 4.5l3-2.5z"/><path fill="#EA4335" d="M12 5.9c1.55 0 2.95.55 4.05 1.6l3-3C17.25 2.85 14.85 2 12 2 7.85 2 4.3 4.4 2.55 7.9l3.5 2.9C6.9 8.25 9.25 5.9 12 5.9z"/></svg>Continuar con Google</button>`;
  const titulo = { entrar: 'Qué bueno <em>verte</em>', registro: 'Empieza tu <em>formación</em>', recuperar: 'Recupera tu <em>acceso</em>' }[modo];
  const sub = { entrar: 'Entra para continuar donde te quedaste.', registro: 'Crea tu cuenta: el primer curso es casi completo gratis.', recuperar: 'Te enviamos un enlace para crear una contraseña nueva.' }[modo];
  const form = modo === 'recuperar' ? `
      <form class="stack" style="gap:12px" data-login-form="recuperar">
        <input class="input" name="email" type="email" placeholder="Correo electrónico" required autocomplete="email">
        <button class="btn btn--brand btn--lg btn--pill-arrow" style="justify-content:space-between">Enviar enlace <span class="arrow"><i data-lucide="send" class="i"></i></span></button>
      </form>
      <p class="faint login__alt"><a href="#/login">Volver a iniciar sesión</a></p>` : `
      ${google}
      <div class="login__or">o con tu correo</div>
      <form class="stack" style="gap:12px" data-login-form="${modo}">
        ${modo === 'registro' ? '<input class="input" name="nombre" placeholder="Nombre completo (así saldrá en tus certificados)" required autocomplete="name">' : ''}
        <input class="input" name="email" type="email" placeholder="Correo electrónico" required autocomplete="email">
        <input class="input" name="pass" type="password" placeholder="Contraseña" required minlength="6" autocomplete="${modo === 'registro' ? 'new-password' : 'current-password'}">
        <p class="login__error" data-login-error hidden></p>
        <button class="btn btn--brand btn--lg btn--pill-arrow" style="justify-content:space-between">${modo === 'registro' ? 'Crear mi cuenta' : 'Entrar'} <span class="arrow"><i data-lucide="arrow-right" class="i"></i></span></button>
      </form>
      ${modo === 'entrar' ? '<p class="faint login__alt"><a href="#/login?modo=recuperar">¿Olvidaste tu contraseña?</a> · ¿No tienes cuenta? <a href="#/login?modo=registro">Regístrate</a></p>'
                          : '<p class="faint login__alt">¿Ya tienes cuenta? <a href="#/login">Inicia sesión</a></p>'}`;
  return `
  <div class="login-page">
    <div class="login">
      <div class="login__form">
        <img data-logo src="/brand/logo-horizontal.png" alt="OdonTeck" style="height:38px;width:auto;align-self:flex-start">
        <div><h1 class="display display--black">${titulo}</h1><p class="muted" style="margin-top:8px">${sub}</p></div>
        ${Datos.modo === 'api' && modo !== 'recuperar' ? `<div class="login__demo" style="background:color-mix(in srgb,var(--brand-teal) 10%,var(--surface));border-color:color-mix(in srgb,var(--brand-teal) 30%,var(--line))"><i data-lucide="shield-check" class="i"></i><div><strong>¿Ya pagabas en el portal anterior?</strong><br>Usa el mismo correo. Si nunca creaste una contraseña, regístrate con ese correo y conservaremos tu acceso VIP.</div></div>` : ''}
        ${Datos.modo === 'demo' ? `
          <div class="login__demo"><i data-lucide="flask-conical" class="i"></i><div><strong>Versión de demostración</strong><br>El inicio de sesión real se activa al conectar el backend. Entra al demo para recorrer el club y el admin.</div></div>
          <button class="btn btn--gradient btn--lg btn--pill-arrow" style="justify-content:space-between" data-login-demo>Entrar al demo <span class="arrow"><i data-lucide="arrow-right" class="i"></i></span></button>` : form}
      </div>
      <div class="login__visual">
        <img src="/fotos/hero.webp" alt="">
        <img class="tooth" src="/fotos/tooth-3d.png" alt="">
        <div class="glass glass--pin" style="top:60px;left:50px;--pin:52px"><span class="ic"><i data-lucide="graduation-cap" class="i"></i></span><div>Catálogo<strong>${resumenCatalogo}</strong></div></div>
        <div class="glass glass--pin" style="top:150px;right:50px;--pin:70px"><span class="ic"><i data-lucide="award" class="i"></i></span><div>Certificados<strong>Con folio verificable</strong></div></div>
        <div class="glass" style="position:absolute;bottom:50px;left:50px"><span class="ic"><i data-lucide="library" class="i"></i></span><div>Biblioteca<strong>Guías y formatos clínicos</strong></div></div>
        <div class="glass glass--dark" style="position:absolute;bottom:50px;right:50px"><span class="ic"><i data-lucide="radio" class="i"></i></span><div>Cada mes<strong>Clases en vivo</strong></div></div>
      </div>
    </div>
  </div>`;
}
