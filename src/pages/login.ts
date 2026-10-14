import { Datos } from '../core/datos';
import { cursos } from '../core/catalogo';

export function login(_: Record<string, string>, query: URLSearchParams) {
  const modo = query.get('modo') === 'registro' ? 'registro' : query.get('modo') === 'recuperar' ? 'recuperar' : 'entrar';
  const totalClases = cursos.reduce((a, c) => a + c.clases.length, 0);
  const resumenCatalogo = cursos.length ? `${cursos.length} cursos · ${totalClases} clases` : 'Cursos y clases clínicas';
  const google = `<button type="button" class="login__google" data-login-google><svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.35 11.1H12v2.9h5.4c-.25 1.4-1 2.6-2.1 3.4v2.8h3.4c2-1.85 3.15-4.55 3.15-7.75 0-.65-.05-1.1-.5-1.35z"/><path fill="#34A853" d="M12 22c2.85 0 5.25-.95 7-2.55l-3.4-2.8c-.95.65-2.15 1.05-3.6 1.05-2.75 0-5.1-1.85-5.95-4.4H2.55v2.9C4.3 19.6 7.85 22 12 22z"/><path fill="#FBBC05" d="M6.05 13.3c-.2-.65-.35-1.3-.35-2s.15-1.35.35-2V6.4H2.55A9.9 9.9 0 0 0 2 11.3c0 1.6.4 3.1 1.05 4.5l3-2.5z"/><path fill="#EA4335" d="M12 5.9c1.55 0 2.95.55 4.05 1.6l3-3C17.25 2.85 14.85 2 12 2 7.85 2 4.3 4.4 2.55 7.9l3.5 2.9C6.9 8.25 9.25 5.9 12 5.9z"/></svg><span>Continuar con Google</span></button>`;
  const titulo = { entrar: 'Continúa tu <em>formación</em>', registro: 'Crea tu acceso <em>gratuito</em>', recuperar: 'Recupera tu <em>acceso</em>' }[modo];
  const sub = {
    entrar: 'Vuelve a tus cursos, progreso y recursos clínicos.',
    registro: 'Empieza a explorar OdonTeck y descubre qué puede aportar a tu práctica.',
    recuperar: 'Te enviaremos un enlace seguro para crear una contraseña nueva.',
  }[modo];
  const campo = (nombre: string, etiqueta: string, tipo: string, icono: string, autocomplete: string, extra = '') => `
    <label class="login__field">
      <span>${etiqueta}</span>
      <span class="login__control"><i data-lucide="${icono}" class="i"></i><input class="input" name="${nombre}" type="${tipo}" placeholder="${etiqueta}" required autocomplete="${autocomplete}" ${extra}></span>
    </label>`;
  const form = modo === 'recuperar' ? `
      <form class="login__fields" data-login-form="recuperar">
        ${campo('email', 'Correo electrónico', 'email', 'mail', 'email')}
        <button class="btn btn--brand btn--lg btn--pill-arrow login__submit">Enviar enlace <span class="arrow"><i data-lucide="send" class="i"></i></span></button>
      </form>
      <p class="login__alt"><a href="#/login"><i data-lucide="arrow-left" class="i"></i>Volver a iniciar sesión</a></p>` : `
      ${google}
      <div class="login__or"><span>o continúa con tu correo</span></div>
      <form class="login__fields" data-login-form="${modo}">
        ${modo === 'registro' ? campo('nombre', 'Nombre completo', 'text', 'user-round', 'name') : ''}
        ${campo('email', 'Correo electrónico', 'email', 'mail', 'email')}
        ${campo('pass', 'Contraseña', 'password', 'lock-keyhole', modo === 'registro' ? 'new-password' : 'current-password', 'minlength="6"')}
        <p class="login__error" data-login-error hidden></p>
        <button class="btn btn--brand btn--lg btn--pill-arrow login__submit">${modo === 'registro' ? 'Crear mi cuenta' : 'Entrar al club'} <span class="arrow"><i data-lucide="arrow-right" class="i"></i></span></button>
      </form>
      ${modo === 'entrar' ? '<p class="login__alt"><a href="#/login?modo=recuperar">¿Olvidaste tu contraseña?</a></p>' : '<p class="login__alt">¿Ya tienes una cuenta? <a href="#/login">Inicia sesión</a></p>'}`;
  return `
  <div class="login-page">
    <div class="login">
      <section class="login__form" aria-labelledby="login-title">
        <div class="login__brand"><img data-logo src="/brand/logo-horizontal.png" alt="OdonTeck"><span><i data-lucide="shield-check" class="i"></i>Acceso seguro</span></div>
        ${modo === 'recuperar' ? '' : `<nav class="login__mode" aria-label="Tipo de acceso"><a class="${modo === 'entrar' ? 'is-active' : ''}" href="#/login">Iniciar sesión</a><a class="${modo === 'registro' ? 'is-active' : ''}" href="#/login?modo=registro">Crear cuenta gratis</a></nav>`}
        <div class="login__intro"><span class="eyebrow">Club OdonTeck</span><h1 id="login-title" class="display display--black">${titulo}</h1><p>${sub}</p></div>
        ${modo !== 'recuperar' ? `<div class="login__legacy"><span class="login__legacy-icon"><i data-lucide="badge-check" class="i"></i></span><div><strong>¿Ya eras miembro?</strong><p>Usa el mismo correo del portal anterior. Si aún no tenías contraseña, crea tu cuenta con ese correo y conservaremos tu acceso.</p></div></div>` : ''}
        ${form}
        ${Datos.modo === 'demo' ? `<p class="login__demo-quick"><button type="button" class="login__demo-pill" data-login-demo title="Entrar directo sin rellenar datos"><i data-lucide="flask-conical" class="i"></i> Entrar directo al demo (1 clic)</button></p>` : ''}
        <div class="login__trust"><span><i data-lucide="lock" class="i"></i>Conexión protegida</span><span><i data-lucide="heart-handshake" class="i"></i>Tu acceso, siempre contigo</span></div>
      </section>
      <aside class="login__visual" aria-label="Beneficios de OdonTeck Club">
        <img class="login__photo" src="/fotos/hero-club.webp" alt="Odontóloga consultando contenido clínico desde una tablet">
        <div class="login__visual-top"><span class="login__seal"><i data-lucide="sparkles" class="i"></i>Formación para tu práctica</span><span class="login__catalog"><i data-lucide="play-circle" class="i"></i>${resumenCatalogo}</span></div>
        <div class="login__story">
          <span class="login__kicker">Aprende · practica · avanza</span>
          <h2 class="display">Tu crecimiento clínico, en un solo lugar.</h2>
          <p class="login__story-copy">Contenido odontológico para estudiar a tu ritmo, reforzar decisiones clínicas y seguir construyendo tu trayectoria profesional.</p>
          <div class="login__free-card">
            <span class="login__free-icon"><i data-lucide="gift" class="i"></i></span>
            <div><strong>Empieza con acceso gratuito</strong><p>Explora el primer curso casi completo, la primera clase de los demás cursos, el Atlas ICDAS y una muestra de Retos.</p></div>
          </div>
          <div class="login__benefits">
            <div><span><i data-lucide="graduation-cap" class="i"></i></span><strong>Cursos a tu ritmo</strong><small>Clases claras y organizadas</small></div>
            <div><span><i data-lucide="library" class="i"></i></span><strong>Biblioteca clínica</strong><small>Guías y recursos de consulta</small></div>
            <div><span><i data-lucide="gamepad-2" class="i"></i></span><strong>Retos y casos</strong><small>Practica lo que aprendes</small></div>
            <div><span><i data-lucide="award" class="i"></i></span><strong>Certificados</strong><small>Folios públicos verificables</small></div>
          </div>
          <div class="login__membership"><span><i data-lucide="crown" class="i"></i>Membresía completa</span><p>Desbloquea el catálogo, la biblioteca VIP, todos los retos y casos, tu progreso y certificados.</p></div>
        </div>
      </aside>
    </div>
  </div>`;
}
