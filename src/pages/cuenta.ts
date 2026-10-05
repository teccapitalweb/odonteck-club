import { Perfil } from '../core/perfil';
import { BRAND, wa } from '../core/brand';
import { Progreso } from '../core/progreso';
import { cursos } from '../core/catalogo';
import { puntos } from '../core/logros';
import { avatarUsuario, esc } from '../ui/partials';
import { Auth } from '../core/auth';
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
  return `
  <section class="stack" style="gap:20px;max-width:900px">
    <div class="section-head"><div><span class="chip chip--primary">Mi perfil</span><h1 class="display" style="font-size:var(--fs-2xl)">Hola, <em>${esc(Perfil.primerNombre())}</em></h1></div></div>
    <div class="grid perfil-grid">
      <div class="stack" style="gap:20px;min-width:0">
      <form class="card card--pad stack" data-form-perfil style="gap:14px">
        <div class="row" style="gap:14px">${avatarUsuario(Auth.usuario?.foto, Perfil.iniciales(), 'avatar avatar--lg')}<div><strong>Foto de perfil</strong><br><span class="faint" style="font-size:var(--fs-xs)">${Auth.usuario?.foto ? 'Sincronizada con tu cuenta de Google.' : 'Si entras con Google, usaremos automáticamente tu foto.'}</span></div></div>
        <div class="field"><label>Nombre completo (así saldrá en tus certificados)</label><input class="input" name="nombre" value="${esc(p.nombre)}" required maxlength="60" placeholder="Dra. Nombre Apellido Apellido"></div>
        <div class="grid grid--2" style="gap:12px">
          <div class="field"><label>WhatsApp</label><input class="input" name="whatsapp" value="${esc(p.whatsapp)}" placeholder="+52 1 236 123 4567"></div>
          <div class="field"><label>Especialidad</label><input class="input" name="especialidad" value="${esc(p.especialidad)}" placeholder="Odontología general, Ortodoncia…"></div>
        </div>
        <div class="field"><label>Ciudad</label><input class="input" name="ciudad" value="${esc(p.ciudad)}" placeholder="Puebla, Pue."></div>
        <div class="row" style="justify-content:flex-end"><button class="btn btn--brand btn--pill-arrow">Guardar cambios <span class="arrow"><i data-lucide="check" class="i"></i></span></button></div>
      </form>
      <form class="card card--pad stack intereses-editor" data-form-intereses style="gap:16px">
        <div class="row" style="align-items:flex-start;justify-content:space-between;gap:16px">
          <div><span class="eyebrow">Personalización</span><h2 style="font-size:var(--fs-lg);margin-top:4px">Mis intereses</h2><p class="muted" style="font-size:var(--fs-sm);margin-top:5px">Actualiza lo que quieres ver primero en Inicio y en el catálogo “Para ti”.</p></div>
          <span class="chip" data-intereses-contador>${intereses.length}/3</span>
        </div>
        <fieldset class="intereses-editor__opciones"><legend class="sr-only">Elige entre uno y tres intereses</legend>
          ${opciones.map((o) => {
            const activo = intereses.includes(o.valor);
            return `<label class="interes-chip"><input type="checkbox" name="intereses" value="${esc(o.valor)}" ${activo ? 'checked' : ''} ${intereses.length >= 3 && !activo ? 'disabled' : ''}><span><i data-lucide="${activo ? 'check' : 'plus'}" class="i"></i>${esc(o.etiqueta)}</span></label>`;
          }).join('')}
        </fieldset>
        <div class="row" style="justify-content:space-between;gap:12px;flex-wrap:wrap"><span class="faint" style="font-size:var(--fs-xs)">Elige de 1 a 3. Puedes cambiarlos cuando quieras.</span><button class="btn btn--brand btn--pill-arrow">Guardar intereses <span class="arrow"><i data-lucide="sparkles" class="i"></i></span></button></div>
      </form>
      </div>
      <div class="stack">
        <div class="card card--pad stack" style="gap:10px;background:var(--brand-navy);color:#fff;border:0">
          <span class="eyebrow" style="color:var(--brand-teal)">Tu membresía</span>
          <div class="display" style="font-size:var(--fs-xl)">${membresia}</div>
          <p style="font-size:var(--fs-sm);opacity:.8">${detalleMembresia}</p>
          <a class="btn btn--white btn--sm" href="#/suscripcion">Gestionar suscripción</a>
        </div>
        <div class="card card--pad stack" style="gap:8px">
          <span class="eyebrow">Tu actividad</span>
          ${[['Clases vistas', Progreso.totalVistas()], ['Cursos completados', Progreso.completados().length], ['Cursos en marcha', Progreso.enMarcha().length], ['Puntos', puntos()]].map(([l, v]) => `<div class="row" style="justify-content:space-between;font-size:var(--fs-sm)"><span class="muted">${l}</span><strong class="mono">${v}</strong></div>`).join('')}
        </div>
      </div>
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

    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px">
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
  const sw = (k: keyof typeof p.avisos, l: string, d: string) => `<div class="row" style="justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--line)"><div><strong style="font-size:var(--fs-sm)">${l}</strong><br><span class="faint" style="font-size:var(--fs-xs)">${d}</span></div><button class="switch" role="switch" aria-checked="${p.avisos[k]}" data-aviso="${k}"></button></div>`;
  return `
  <section class="stack" style="gap:20px;max-width:760px">
    <div class="section-head"><div><span class="chip chip--primary">Configuración</span><h1 class="display" style="font-size:var(--fs-2xl)">Ajustes</h1></div></div>
    <div class="card card--pad"><span class="eyebrow">Apariencia</span>
      <div class="row" style="justify-content:space-between;padding:12px 0"><div><strong style="font-size:var(--fs-sm)">Modo oscuro</strong><br><span class="faint" style="font-size:var(--fs-xs)">Solo para esta sesión; el club siempre abre en claro</span></div><button class="btn btn--secondary btn--sm" data-theme-toggle><i data-lucide="moon" class="i"></i>Cambiar</button></div></div>
    <div class="card card--pad"><span class="eyebrow">Avisos</span>${sw('enVivo', 'Clases en vivo', 'Recordatorio antes de cada transmisión')}${sw('nuevos', 'Nuevos cursos y materiales', 'Cuando se publique algo nuevo')}${sw('comunidad', 'Comunidad', 'Respuestas a tus temas')}</div>
    <div class="card card--pad stack" style="gap:10px"><span class="eyebrow">App</span>
      <div class="row" style="justify-content:space-between"><div><strong style="font-size:var(--fs-sm)">Instalar OdonTeck como app</strong><br><span class="faint" style="font-size:var(--fs-xs)">Pantalla completa, más rápido, acceso desde tu inicio</span></div><button class="btn btn--brand btn--sm" data-install-btn><i data-lucide="download" class="i"></i>Instalar</button></div></div>
    <div class="card card--pad stack" style="gap:10px"><span class="eyebrow">Cuenta</span>
      <div class="row" style="justify-content:space-between"><div><strong style="font-size:var(--fs-sm)">Cerrar sesión</strong><br><span class="faint" style="font-size:var(--fs-xs)">Sales de este dispositivo</span></div><button class="btn btn--danger btn--sm" data-salir><i data-lucide="log-out" class="i"></i>Cerrar sesión</button></div>
      <div class="row" style="justify-content:space-between"><div><strong style="font-size:var(--fs-sm)">Legales</strong></div><div class="row"><a class="btn btn--ghost btn--sm" href="${BRAND.sitio}/pages/privacidad.html" target="_blank" rel="noopener">Privacidad</a><a class="btn btn--ghost btn--sm" href="${BRAND.sitio}/pages/terminos.html" target="_blank" rel="noopener">Términos</a></div></div>
    </div>
    <p class="faint" style="font-size:var(--fs-xs)">OdonTeck Club · versión 0.4 · TEC Capital</p>
  </section>`;
}

export function mas() {
  const items = [...(Auth.usuario?.esAdmin ? [['#/admin', 'shield-check', 'Panel admin']] : []), ['#/comunidad', 'messages-square', 'Comunidad'], ['#/logros', 'flame', 'Logros'], ['#/certificados', 'award', 'Certificados'], ['#/praxia', 'stethoscope', 'Prueba Praxia'], ['#/perfil', 'user', 'Mi perfil'], ['#/suscripcion', 'credit-card', 'Suscripción'], ['#/configuracion', 'settings', 'Configuración']];
  return `
  <section class="stack" style="gap:16px">
    <div class="row" style="gap:12px">${avatarUsuario(Auth.usuario?.foto, Perfil.iniciales(), 'avatar avatar--lg')}<div><div class="display" style="font-size:var(--fs-lg)">${esc(Perfil.get().nombre)}</div><span class="user-card__plan"><i data-lucide="crown" class="i"></i>${Perfil.planNombre()}</span></div></div>
    <div class="grid" style="grid-template-columns:1fr 1fr;gap:12px">${items.map(([h, i, l]) => `<a class="card card--pad card--hover" href="${h}" style="display:flex;gap:12px;align-items:center;color:inherit;padding:16px"><span class="circle-btn" style="background:var(--primary-soft);color:var(--primary);width:38px;height:38px"><i data-lucide="${i}" class="i"></i></span><strong style="font-size:var(--fs-sm)">${l}</strong></a>`).join('')}</div>
    <a class="card card--pad" href="${BRAND.canalWhatsApp}" target="_blank" rel="noopener" style="display:flex;gap:12px;align-items:center;color:inherit;background:color-mix(in srgb,#25d366 10%,var(--surface))"><span class="circle-btn" style="background:#25d366"><i data-lucide="message-circle" class="i"></i></span><div><strong style="font-size:var(--fs-sm)">Grupo de WhatsApp</strong><br><span class="faint" style="font-size:var(--fs-xs)">Avisos y comunidad</span></div></a>
  </section>`;
}
