import { Perfil } from '../core/perfil';
import { BRAND, wa } from '../core/brand';
import { Progreso } from '../core/progreso';
import { cursos } from '../core/catalogo';
import { puntos } from '../core/logros';
import { avatarUsuario, esc } from '../ui/partials';
import { Auth } from '../core/auth';
import { Datos } from '../core/datos';
import { Acceso } from '../core/acceso';
import { opcionesIntereses, perfilEncuesta } from '../core/encuestas';

export function praxia() {
  return `
  <section class="stack" style="gap:24px">
    <div class="card" style="overflow:hidden;display:grid;grid-template-columns:1fr 1.2fr;align-items:center;background:var(--hero-gradient);color:#fff;border:0">
      <div class="card--pad stack" style="gap:16px;padding:44px">
        <span class="chip" style="background:rgba(255,255,255,.14);color:#fff">Plataforma para consultorios · TEC Capital</span>
        <h1 class="display display--black" style="font-size:var(--fs-2xl)">Tu consultorio, <em style="color:var(--brand-teal)">en orden.</em></h1>
        <p style="opacity:.85">Praxia es la plataforma para doctores: expediente, recetas y documentos con folio, agenda con recordatorios y reportes. Lo que antes eran herramientas sueltas dentro del club, ahora vive en un solo lugar hecho para tu práctica.</p>
        <div class="stack" style="gap:8px;font-size:var(--fs-sm)">
          <div class="row" style="gap:8px"><i data-lucide="check-circle-2" class="i" style="color:var(--brand-teal)"></i>Recetas y documentos con folio y huella digital SHA-256</div>
          <div class="row" style="gap:8px"><i data-lucide="check-circle-2" class="i" style="color:var(--brand-teal)"></i>Agenda por mes, semana y día con recordatorios</div>
          <div class="row" style="gap:8px"><i data-lucide="check-circle-2" class="i" style="color:var(--brand-teal)"></i>Expediente clínico seguro, por paciente</div>
          <div class="row" style="gap:8px"><i data-lucide="check-circle-2" class="i" style="color:var(--brand-teal)"></i>Reportes de tu consultorio</div>
        </div>
        <div class="row"><a class="btn btn--white btn--lg btn--pill-arrow" href="${BRAND.praxia}" target="_blank" rel="noopener">Probar Praxia gratis <span class="arrow" style="background:var(--brand-navy);color:#fff"><i data-lucide="arrow-up-right" class="i"></i></span></a><span style="font-size:var(--fs-xs);opacity:.75">Sin tarjeta · beneficio para miembros OdonTeck</span></div>
      </div>
      <div style="padding:28px 0;transform:perspective(1200px) rotateY(-8deg) translateX(20px)"><img src="/praxia/captura-1.webp" alt="Praxia" style="border-radius:14px 0 0 14px;box-shadow:0 30px 60px -20px rgba(0,0,0,.6)"></div>
    </div>
    <div class="grid grid--3">
      ${[['file-check', 'Documentos emitidos', 'Cada PDF clínico con su folio y vigencia; las versiones anteriores se conservan para auditoría.'], ['calendar', 'Agenda', 'Citas en calendario y lista, con estados: programada, confirmada, atendida, cancelada.'], ['bell-ring', 'Recordatorios', 'Avisos automáticos a tus pacientes para reducir inasistencias.']].map(([i, t, d]) => `
      <div class="card card--pad stack" style="gap:8px"><span class="circle-btn" style="background:var(--primary-soft);color:var(--primary)"><i data-lucide="${i}" class="i"></i></span><h3 style="font-size:var(--fs-md)">${t}</h3><p class="muted" style="font-size:var(--fs-sm)">${d}</p></div>`).join('')}
    </div>
    <div class="card" style="overflow:hidden"><img src="/praxia/captura-2.webp" alt="Agenda de Praxia"></div>
  </section>`;
}

export function perfil() {
  const p = Perfil.get();
  const intereses = perfilEncuesta()?.intereses ?? [];
  const opciones = opcionesIntereses();
  const plan = BRAND.planes.find((x) => x.id === p.plan);
  const esCortesia = p.plan === 'cortesia';
  const esAdmin = p.plan === 'admin';
  const membresia = plan?.nombre || (esCortesia ? 'VIP cortesía' : esAdmin ? 'VIP administrador' : 'Plan gratis');
  const detalleMembresia = plan && p.vence
    ? `Renueva el ${new Date(p.vence).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })} · $${plan.precio} MXN/${plan.periodo}`
    : esCortesia && p.vence
      ? `Acceso de cortesía hasta el ${new Date(p.vence).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}.`
      : esAdmin
        ? 'Acceso administrativo con todos los beneficios VIP.'
        : 'Activa tu membresía para ver todo el catálogo.';
  const perfilCompleto = [p.nombre, p.whatsapp, p.especialidad, p.ciudad, intereses.length ? 'intereses' : ''].filter(Boolean).length;
  const completitud = Math.round((perfilCompleto / 5) * 100);
  const identidad = [p.especialidad, p.ciudad].filter(Boolean).join(' · ') || 'Completa tu especialidad y ciudad';
  const email = Auth.usuario?.email || 'Cuenta de demostración';
  return `
  <section class="account-page">
    <header class="account-hero">
      <div class="account-hero__glow" aria-hidden="true"></div>
      <div class="account-hero__top">
        <span class="account-kicker"><i data-lucide="badge-check" class="i"></i> Perfil profesional</span>
        <nav class="account-tabs" aria-label="Cuenta"><a class="is-active" href="#/perfil">Perfil</a><a href="#/configuracion">Configuración</a></nav>
      </div>
      <div class="account-hero__identity">
        <div class="profile-avatar-wrap">${avatarUsuario(Auth.usuario?.foto, Perfil.iniciales(), 'avatar profile-avatar')}<span class="profile-avatar__status" title="Cuenta activa"><i data-lucide="check" class="i"></i></span></div>
        <div class="account-hero__copy">
          <p>Bienvenido de nuevo</p>
          <h1>${esc(p.nombre)}</h1>
          <span>${esc(identidad)}</span>
        </div>
        <a class="btn account-hero__settings" href="#/configuracion"><i data-lucide="settings-2" class="i"></i>Ajustes</a>
      </div>
      <div class="account-hero__footer">
        <div class="profile-stats" aria-label="Actividad del perfil">
          <div><strong>${Progreso.totalVistas()}</strong><span>Clases vistas</span></div>
          <div><strong>${Progreso.completados().length}</strong><span>Cursos terminados</span></div>
          <div><strong>${puntos()}</strong><span>Puntos</span></div>
        </div>
        <div class="profile-completion">
          <span class="profile-completion__ring" style="--profile-complete:${completitud}" aria-label="Perfil ${completitud}% completo"><strong>${completitud}%</strong></span>
          <div><strong>Perfil ${completitud === 100 ? 'completo' : 'en progreso'}</strong><span>${perfilCompleto} de 5 datos esenciales</span></div>
        </div>
      </div>
    </header>

    <div class="perfil-grid">
      <div class="account-main">
      <form class="card account-card profile-form" data-form-perfil>
        <div class="account-card__head">
          <span class="account-card__icon"><i data-lucide="contact" class="i"></i></span>
          <div><span class="eyebrow">Información profesional</span><h2>Datos de tu perfil</h2><p>Estos datos personalizan tu experiencia y el nombre aparecerá en tus certificados.</p></div>
        </div>
        <div class="profile-photo-row">
          ${avatarUsuario(Auth.usuario?.foto, Perfil.iniciales(), 'avatar avatar--lg')}
          <div><strong>Foto de perfil</strong><span>${Auth.usuario?.foto ? 'Sincronizada de forma segura con tu cuenta de Google.' : 'Al entrar con Google mostraremos automáticamente tu foto.'}</span></div>
          <span class="source-badge"><i data-lucide="shield-check" class="i"></i>${Auth.usuario?.foto ? 'Google' : 'Iniciales'}</span>
        </div>
        <div class="profile-fields">
          <div class="field field--wide"><label>Nombre completo <span>· para certificados</span></label><div class="input-wrap"><i data-lucide="user-round" class="i"></i><input class="input" name="nombre" value="${esc(p.nombre)}" required maxlength="60" placeholder="Dra. Nombre Apellido Apellido"></div></div>
          <div class="field"><label>WhatsApp</label><div class="input-wrap"><i data-lucide="phone" class="i"></i><input class="input" name="whatsapp" value="${esc(p.whatsapp)}" placeholder="+52 1 236 123 4567"></div></div>
          <div class="field"><label>Especialidad</label><div class="input-wrap"><i data-lucide="stethoscope" class="i"></i><input class="input" name="especialidad" value="${esc(p.especialidad)}" placeholder="Odontología general, Ortodoncia…"></div></div>
          <div class="field field--wide"><label>Ciudad</label><div class="input-wrap"><i data-lucide="map-pin" class="i"></i><input class="input" name="ciudad" value="${esc(p.ciudad)}" placeholder="Puebla, Pue."></div></div>
        </div>
        <div class="account-card__actions"><span><i data-lucide="lock-keyhole" class="i"></i>Tu información personal permanece protegida.</span><button class="btn btn--brand btn--pill-arrow">Guardar cambios <span class="arrow"><i data-lucide="check" class="i"></i></span></button></div>
      </form>
      <form class="card account-card intereses-editor" data-form-intereses>
        <div class="account-card__head account-card__head--counter">
          <span class="account-card__icon account-card__icon--teal"><i data-lucide="sparkles" class="i"></i></span>
          <div><span class="eyebrow">Personalización</span><h2>Temas que te interesan</h2><p>Usamos tu selección para ordenar Inicio y el catálogo “Para ti”.</p></div>
          <span class="chip" data-intereses-contador>${intereses.length}/3</span>
        </div>
        <fieldset class="intereses-editor__opciones"><legend class="sr-only">Elige entre uno y tres intereses</legend>
          ${opciones.map((o) => {
            const activo = intereses.includes(o.valor);
            return `<label class="interes-chip"><input type="checkbox" name="intereses" value="${esc(o.valor)}" ${activo ? 'checked' : ''} ${intereses.length >= 3 && !activo ? 'disabled' : ''}><span><i data-lucide="${activo ? 'check' : 'plus'}" class="i"></i>${esc(o.etiqueta)}</span></label>`;
          }).join('')}
        </fieldset>
        <div class="account-card__actions"><span>Elige de 1 a 3. Puedes cambiarlos cuando quieras.</span><button class="btn btn--brand btn--pill-arrow">Guardar intereses <span class="arrow"><i data-lucide="sparkles" class="i"></i></span></button></div>
      </form>
      </div>
      <aside class="account-aside">
        <div class="membership-card">
          <span class="membership-card__orb" aria-hidden="true"></span>
          <div class="membership-card__top"><span class="eyebrow">Tu membresía</span><i data-lucide="crown" class="i"></i></div>
          <strong>${membresia}</strong>
          <p>${detalleMembresia}</p>
          <a class="btn btn--white btn--sm" href="#/suscripcion">Gestionar suscripción <i data-lucide="arrow-up-right" class="i"></i></a>
        </div>
        <div class="card account-card account-summary">
          <div class="account-card__head account-card__head--compact"><span class="account-card__icon"><i data-lucide="shield-check" class="i"></i></span><div><span class="eyebrow">Cuenta</span><h2>Acceso protegido</h2></div></div>
          <div class="account-detail"><span>Correo</span><strong title="${esc(email)}">${esc(email)}</strong></div>
          <div class="account-detail"><span>Foto</span><strong>${Auth.usuario?.foto ? 'Sincronizada' : 'Sin vincular'}</strong></div>
          <div class="account-detail"><span>Sesión</span><strong class="status-ok"><i data-lucide="circle-check" class="i"></i>Activa</strong></div>
          <a class="account-link" href="#/configuracion"><span><i data-lucide="settings-2" class="i"></i>Preferencias y seguridad</span><i data-lucide="chevron-right" class="i"></i></a>
        </div>
      </aside>
    </div>
  </section>`;
}

export function suscripcion() {
  const p = Perfil.get();
  const esVip = Acceso.vip();
  const mensual = BRAND.planes.find((x) => x.id === 'mensual');
  const anual = BRAND.planes.find((x) => x.id === 'anual');
  const precioMesDesdAnual = anual ? Math.round(anual.precio / 12) : 0;
  const totalCursos = cursos.length;
  const totalClases = cursos.reduce((s, c) => s + c.clases.length, 0);

  const beneficio = (ico: string, titulo: string, desc: string) =>
    `<div style="display:flex;gap:14px;align-items:flex-start"><span style="width:40px;height:40px;border-radius:12px;background:var(--primary-soft);color:var(--primary);display:grid;place-items:center;flex-shrink:0"><i data-lucide="${ico}" class="i" style="width:18px;height:18px"></i></span><div><strong style="font-size:var(--fs-sm)">${titulo}</strong><p class="muted" style="font-size:var(--fs-xs);margin-top:2px">${desc}</p></div></div>`;

  const planCard = (pl: typeof BRAND.planes[0], recomendado: boolean) => {
    const activo = p.plan === pl.id;
    const precioMes = pl.id === 'anual' ? precioMesDesdAnual : pl.precio;
    const ico = recomendado ? 'crown' : 'zap';
    const accent = recomendado ? 'var(--brand-navy)' : 'var(--brand-teal)';
    const accentSoft = recomendado ? 'color-mix(in srgb,var(--brand-navy) 8%,transparent)' : 'color-mix(in srgb,var(--brand-teal) 10%,transparent)';
    return `
    <div class="plan-card" style="position:relative;border-radius:var(--r-2xl);overflow:hidden;border:2px solid ${activo || recomendado ? accent : 'var(--line)'};background:var(--surface);transition:border-color .2s,box-shadow .2s">
      <div style="height:6px;background:${recomendado ? 'var(--brand-gradient)' : 'linear-gradient(90deg,var(--brand-teal),color-mix(in srgb,var(--brand-teal) 40%,#fff))'}"></div>
      ${recomendado ? '<div style="position:absolute;top:6px;right:0;background:var(--brand-gradient);color:#fff;font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;padding:5px 16px 5px 14px;border-radius:0 0 0 12px">Más popular</div>' : ''}
      <div style="display:grid;gap:18px;padding:28px 26px">
        <div style="display:flex;align-items:center;gap:12px">
          <span style="width:44px;height:44px;border-radius:14px;background:${accentSoft};color:${accent};display:grid;place-items:center"><i data-lucide="${ico}" class="i" style="width:20px;height:20px"></i></span>
          <div>
            <span style="font-family:var(--font-display);font-weight:700;font-size:var(--fs-md);display:block">${pl.nombre}</span>
            ${activo ? '<span style="font-size:11px;color:var(--primary);font-weight:600">Tu plan actual</span>' : `<span style="font-size:11px;color:var(--text-3)">${pl.id === 'anual' ? 'El favorito de nuestros miembros' : 'Flexible, sin compromiso'}</span>`}
          </div>
        </div>
        <div style="background:${accentSoft};border-radius:var(--r-lg);padding:16px 18px;display:flex;align-items:baseline;gap:6px;justify-content:center">
          <span style="font-family:var(--font-display);font-weight:800;font-size:clamp(2rem,5vw,2.5rem);color:${accent};line-height:1">$${precioMes.toLocaleString('es-MX')}</span>
          <span style="font-size:var(--fs-xs);color:var(--text-3)">/mes</span>
        </div>
        <div style="text-align:center;font-size:var(--fs-xs);color:var(--text-3);margin-top:-10px">
          ${pl.id === 'anual' ? `$${pl.precio.toLocaleString('es-MX')} MXN al año` : 'Sin contrato · cancela cuando quieras'}
          ${pl.ahorro ? `<div style="margin-top:6px;display:inline-flex;align-items:center;gap:5px;background:color-mix(in srgb,var(--brand-teal) 12%,transparent);color:var(--brand-teal);font-size:11px;font-weight:600;padding:4px 12px;border-radius:99px"><i data-lucide="badge-percent" class="i" style="width:12px;height:12px"></i>${pl.ahorro}</div>` : ''}
        </div>
        <div style="display:grid;gap:9px;font-size:var(--fs-sm)">
          ${[['play-circle', `${totalCursos} cursos · ${totalClases}+ clases`], ['award', 'Certificados con folio'], ['library', 'Biblioteca y materiales'], ['brain', 'Quizzes y retos'], ['radio', 'En vivo y comunidad']].map(([ic, t]) => `<div style="display:flex;gap:9px;align-items:center"><i data-lucide="${ic}" class="i" style="width:15px;height:15px;color:var(--brand-teal);flex-shrink:0"></i>${t}</div>`).join('')}
        </div>
        ${activo
          ? `<button class="btn btn--secondary" disabled style="width:100%;justify-content:center;opacity:.55;border-style:dashed">Plan activo <i data-lucide="check" class="i"></i></button>`
          : `<button class="btn ${recomendado ? 'btn--brand' : ''}" data-cambiar-plan="${pl.id}" style="width:100%;justify-content:center;font-weight:700;${recomendado ? '' : 'background:var(--brand-teal);color:var(--brand-navy)'}">${esVip ? 'Cambiar a este plan' : 'Empezar ahora'} <i data-lucide="arrow-right" class="i"></i></button>`}
      </div>
    </div>`;
  };

  return `
  <section class="stack" style="gap:24px;max-width:860px;margin:0 auto">
    <div style="text-align:center;display:grid;gap:8px;justify-items:center">
      <span class="chip chip--primary"><i data-lucide="crown" class="i"></i>Membresía VIP</span>
      <h1 class="display display--black" style="font-size:clamp(var(--fs-xl),3.5vw,var(--fs-2xl))">Invierte en tu práctica profesional</h1>
      <p class="muted" style="font-size:var(--fs-sm);max-width:50ch">Acceso ilimitado a cursos, certificados verificables, materiales descargables, retos clínicos y comunidad profesional.</p>
    </div>

    <div class="grid grid--2" style="gap:20px;align-items:stretch">
      ${mensual ? planCard(mensual, false) : ''}
      ${anual ? planCard(anual, true) : ''}
    </div>

    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:14px">
      ${beneficio('play-circle', 'Cursos completos', `${totalCursos} cursos con ${totalClases}+ clases en video HD.`)}
      ${beneficio('award', 'Certificados oficiales', 'PDF con folio único verificable.')}
      ${beneficio('library', 'Biblioteca', 'Guías, protocolos y recursos.')}
      ${beneficio('brain', 'Quizzes y retos', 'Preguntas revisadas por profesionales.')}
      ${beneficio('radio', 'En vivo', 'Sesiones con especialistas.')}
      ${beneficio('messages-square', 'Comunidad', 'Foro exclusivo para dentistas.')}
    </div>

    <div style="text-align:center;display:grid;gap:10px;justify-items:center;padding:16px 0">
      <div style="display:flex;justify-content:center">
        ${['LD', 'MR', 'JV', 'AS', 'PC'].map((i) => `<span style="width:32px;height:32px;border-radius:50%;background:var(--brand-gradient);display:grid;place-items:center;font-size:10px;font-weight:700;color:#fff;margin-left:-8px;border:3px solid var(--surface)">${i}</span>`).join('')}
      </div>
      <p style="font-size:var(--fs-xs);color:var(--text-3)">Dentistas de todo el país ya estudian con OdonTeck</p>
    </div>

    <div class="card card--pad" style="display:flex;gap:20px;align-items:center;justify-content:space-between;flex-wrap:wrap;background:color-mix(in srgb,var(--brand-navy) 4%,var(--surface));border-color:color-mix(in srgb,var(--brand-navy) 15%,var(--line))">
      <div style="min-width:0"><h3 style="font-size:var(--fs-sm)">Facturación y pagos</h3><p class="muted" style="font-size:var(--fs-xs);margin-top:2px">Cambiar tarjeta, recibos o cancelar desde el portal seguro de Stripe.</p></div>
      <div class="row" style="gap:8px;flex-shrink:0">
        <button class="btn btn--secondary btn--sm" data-portal-stripe><i data-lucide="credit-card" class="i"></i>Portal</button>
        <a class="btn btn--ghost btn--sm" href="${wa('Hola OdonTeck, tengo una duda sobre mi suscripción VIP.')}" target="_blank" rel="noopener"><i data-lucide="message-circle" class="i"></i>Soporte</a>
      </div>
    </div>

    ${esVip ? `<div class="card card--pad" style="display:flex;gap:20px;align-items:center;justify-content:space-between;flex-wrap:wrap;background:color-mix(in srgb,var(--brand-teal) 8%,var(--surface));border-color:color-mix(in srgb,var(--brand-teal) 24%,var(--line))">
      <div style="min-width:0;max-width:58ch"><h3 style="font-size:var(--fs-sm)">Biblioteca y herramientas heredadas</h3><p class="muted" style="font-size:var(--fs-xs);margin-top:2px">Tu membresía también conserva el contenido del portal anterior mientras terminamos de migrar materiales, grabaciones y herramientas al club nuevo.</p></div>
      <a class="btn btn--brand btn--sm" href="/vip-panel.html" target="_blank" rel="noopener"><i data-lucide="external-link" class="i"></i>Abrir portal anterior</a>
    </div>` : ''}

    <p style="text-align:center;font-size:var(--fs-xs);color:var(--text-3)">Pagos seguros con Stripe · Cancela en cualquier momento · Sin permanencia</p>
  </section>`;
}

export function configuracion() {
  const p = Perfil.get();
  const sw = (k: keyof typeof p.avisos, icon: string, l: string, d: string) => `<div class="setting-row"><span class="setting-row__icon"><i data-lucide="${icon}" class="i"></i></span><div><strong>${l}</strong><span>${d}</span></div><button class="switch" type="button" role="switch" aria-label="${l}" aria-checked="${p.avisos[k]}" data-aviso="${k}"></button></div>`;
  return `
  <section class="account-page settings-page">
    <header class="settings-hero">
      <div class="account-hero__top">
        <span class="account-kicker"><i data-lucide="sliders-horizontal" class="i"></i> Centro de control</span>
        <nav class="account-tabs" aria-label="Cuenta"><a href="#/perfil">Perfil</a><a class="is-active" href="#/configuracion">Configuración</a></nav>
      </div>
      <div class="settings-hero__copy"><h1>Tu cuenta, a tu manera</h1><p>Administra preferencias, avisos y acceso desde un solo lugar.</p></div>
    </header>
    <div class="settings-layout">
      <aside class="settings-summary">
        <div class="settings-person">${avatarUsuario(Auth.usuario?.foto, Perfil.iniciales(), 'avatar settings-person__avatar')}<div><strong>${esc(p.nombre)}</strong><span>${esc(Auth.usuario?.email || 'Cuenta de demostración')}</span></div></div>
        <nav class="settings-nav" aria-label="Secciones de configuración">
          <a href="#ajustes-apariencia"><i data-lucide="palette" class="i"></i>Apariencia</a>
          <a href="#ajustes-avisos"><i data-lucide="bell-ring" class="i"></i>Notificaciones</a>
          <a href="#ajustes-app"><i data-lucide="smartphone" class="i"></i>Aplicación</a>
          <a href="#ajustes-cuenta"><i data-lucide="shield-check" class="i"></i>Cuenta</a>
        </nav>
        <div class="settings-help"><i data-lucide="life-buoy" class="i"></i><div><strong>¿Necesitas ayuda?</strong><span>El equipo OdonTeck puede orientarte.</span><a href="${wa('Hola OdonTeck, necesito ayuda con la configuración de mi cuenta.')}" target="_blank" rel="noopener">Contactar soporte</a></div></div>
      </aside>
      <div class="settings-content">
        <section class="card settings-card" id="ajustes-apariencia">
          <div class="settings-card__head"><div><span class="eyebrow">Experiencia</span><h2>Apariencia</h2><p>Ajusta cómo se ve OdonTeck en este dispositivo.</p></div><span class="account-card__icon"><i data-lucide="palette" class="i"></i></span></div>
          <div class="setting-row"><span class="setting-row__icon"><i data-lucide="moon-star" class="i"></i></span><div><strong>Modo oscuro</strong><span>Reduce el brillo durante esta sesión; la siguiente inicia en modo claro.</span></div><button class="btn btn--secondary btn--sm" type="button" data-theme-toggle><i data-lucide="moon" class="i"></i>Cambiar</button></div>
        </section>
        <section class="card settings-card" id="ajustes-avisos">
          <div class="settings-card__head"><div><span class="eyebrow">Preferencias</span><h2>Notificaciones</h2><p>Elige qué novedades quieres recibir del club.</p></div><span class="account-card__icon account-card__icon--teal"><i data-lucide="bell-ring" class="i"></i></span></div>
          ${sw('enVivo', 'radio', 'Clases en vivo', 'Recibe un recordatorio antes de cada transmisión.')}
          ${sw('nuevos', 'sparkles', 'Nuevos cursos y materiales', 'Entérate cuando publiquemos contenido nuevo.')}
          ${sw('comunidad', 'messages-square', 'Actividad en Comunidad', 'Avisos cuando respondan a tus publicaciones.')}
        </section>
        <section class="card settings-card" id="ajustes-app">
          <div class="settings-card__head"><div><span class="eyebrow">Acceso rápido</span><h2>Aplicación</h2><p>Lleva tu aprendizaje contigo sin abrir primero el navegador.</p></div><span class="account-card__icon"><i data-lucide="smartphone" class="i"></i></span></div>
          <div class="setting-row setting-row--feature"><span class="setting-row__icon"><i data-lucide="download" class="i"></i></span><div><strong>Instalar OdonTeck</strong><span>Acceso desde tu inicio, pantalla completa y una experiencia más rápida.</span></div><button class="btn btn--brand btn--sm" type="button" data-install-btn><i data-lucide="download" class="i"></i>Instalar</button></div>
        </section>
        <section class="card settings-card" id="ajustes-cuenta">
          <div class="settings-card__head"><div><span class="eyebrow">Privacidad y acceso</span><h2>Cuenta</h2><p>Revisa tu sesión y los documentos legales.</p></div><span class="account-card__icon"><i data-lucide="shield-check" class="i"></i></span></div>
          <div class="setting-row"><span class="setting-row__icon"><i data-lucide="mail" class="i"></i></span><div><strong>${esc(Auth.usuario?.email || 'Cuenta de demostración')}</strong><span>Correo vinculado a tu sesión actual.</span></div><span class="status-pill"><i data-lucide="circle-check" class="i"></i>Activa</span></div>
          <div class="setting-row"><span class="setting-row__icon"><i data-lucide="file-lock-2" class="i"></i></span><div><strong>Privacidad y términos</strong><span>Consulta cómo protegemos y utilizamos tus datos.</span></div><div class="setting-actions"><a href="${BRAND.sitio}/pages/privacidad.html" target="_blank" rel="noopener">Privacidad</a><a href="${BRAND.sitio}/pages/terminos.html" target="_blank" rel="noopener">Términos</a></div></div>
          <div class="setting-row setting-row--danger"><span class="setting-row__icon"><i data-lucide="log-out" class="i"></i></span><div><strong>Cerrar sesión</strong><span>Finaliza el acceso únicamente en este dispositivo.</span></div><button class="btn btn--danger btn--sm" type="button" data-salir>Cerrar sesión</button></div>
        </section>
        <p class="settings-version">OdonTeck Club · versión 0.4 · Desarrollado por TEC Capital</p>
      </div>
    </div>
  </section>`;
}

export function mas() {
  const items = [...(Auth.usuario?.esAdmin ? [['#/admin', 'shield-check', 'Panel admin']] : []), ['#/academia', 'book-open-text', 'Academia'], ['#/comunidad', 'messages-square', 'Comunidad'], ['#/directorio', 'contact-round', 'Directorio'], ['#/logros', 'flame', 'Logros'], ['#/certificados', 'award', 'Certificados'], ...(Datos.modo === 'demo' ? [['#/cursos-en-vivo', 'radio', 'Cursos en vivo']] : []), ['#/herramientas', 'wrench', 'Herramientas Pro'], ['#/praxia', 'stethoscope', 'Prueba Praxia'], ['#/perfil', 'user', 'Mi perfil'], ['#/suscripcion', 'credit-card', 'Suscripción'], ['#/configuracion', 'settings', 'Configuración']];
  return `
  <section class="stack" style="gap:16px">
    <div class="row" style="gap:12px">${avatarUsuario(Auth.usuario?.foto, Perfil.iniciales(), 'avatar avatar--lg')}<div><div class="display" style="font-size:var(--fs-lg)">${esc(Perfil.get().nombre)}</div><span class="user-card__plan"><i data-lucide="crown" class="i"></i>${Perfil.planNombre()}</span></div></div>
    <div class="grid" style="grid-template-columns:1fr 1fr;gap:12px">${items.map(([h, i, l]) => `<a class="card card--pad card--hover" href="${h}" style="display:flex;gap:12px;align-items:center;color:inherit;padding:16px"><span class="circle-btn" style="background:var(--primary-soft);color:var(--primary);width:38px;height:38px"><i data-lucide="${i}" class="i"></i></span><strong style="font-size:var(--fs-sm)">${l}</strong></a>`).join('')}</div>
    <a class="card card--pad" href="${BRAND.canalWhatsApp}" target="_blank" rel="noopener" style="display:flex;gap:12px;align-items:center;color:inherit;background:color-mix(in srgb,#25d366 10%,var(--surface))"><span class="circle-btn" style="background:#075e54"><i data-lucide="message-circle" class="i"></i></span><div><strong style="font-size:var(--fs-sm)">Grupo de WhatsApp</strong><br><span class="faint" style="font-size:var(--fs-xs)">Avisos y comunidad</span></div></a>
    <button class="account-quick__logout" type="button" data-salir aria-label="Cerrar sesión en este dispositivo" style="margin-top:4px"><i data-lucide="log-out" class="i"></i>Cerrar sesión</button>
  </section>`;
}
