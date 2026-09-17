import { Perfil } from '../core/perfil';
import { BRAND, wa } from '../core/brand';
import { Progreso } from '../core/progreso';
import { puntos } from '../core/logros';
import { esc } from '../ui/partials';

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
  const plan = BRAND.planes.find((x) => x.id === p.plan);
  return `
  <section class="stack" style="gap:20px;max-width:900px">
    <div class="section-head"><div><span class="chip chip--primary">Mi perfil</span><h1 class="display" style="font-size:var(--fs-2xl)">Hola, <em>${esc(Perfil.primerNombre())}</em></h1></div></div>
    <div class="grid" style="grid-template-columns:1fr 320px;gap:20px;align-items:start">
      <form class="card card--pad stack" data-form-perfil style="gap:14px">
        <div class="row" style="gap:14px"><div class="avatar avatar--lg">${Perfil.iniciales()}</div><div><strong>Foto de perfil</strong><br><span class="faint" style="font-size:var(--fs-xs)">Se sube desde el admin en la Fase 2 · por ahora, iniciales</span></div></div>
        <div class="field"><label>Nombre completo (así saldrá en tus certificados)</label><input class="input" name="nombre" value="${esc(p.nombre)}" required maxlength="60" placeholder="Dra. Nombre Apellido Apellido"></div>
        <div class="grid grid--2" style="gap:12px">
          <div class="field"><label>WhatsApp</label><input class="input" name="whatsapp" value="${esc(p.whatsapp)}" placeholder="+52 1 236 123 4567"></div>
          <div class="field"><label>Especialidad</label><input class="input" name="especialidad" value="${esc(p.especialidad)}" placeholder="Odontología general, Ortodoncia…"></div>
        </div>
        <div class="field"><label>Ciudad</label><input class="input" name="ciudad" value="${esc(p.ciudad)}" placeholder="Puebla, Pue."></div>
        <div class="row" style="justify-content:flex-end"><button class="btn btn--brand btn--pill-arrow">Guardar cambios <span class="arrow"><i data-lucide="check" class="i"></i></span></button></div>
      </form>
      <div class="stack">
        <div class="card card--pad stack" style="gap:10px;background:var(--brand-navy);color:#fff;border:0">
          <span class="eyebrow" style="color:var(--brand-teal)">Tu membresía</span>
          <div class="display" style="font-size:var(--fs-xl)">${plan ? plan.nombre : 'Invitado'}</div>
          <p style="font-size:var(--fs-sm);opacity:.8">${plan ? `Renueva el ${new Date(p.vence).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })} · $${plan.precio} MXN/${plan.periodo}` : 'Activa tu membresía para ver todo el catálogo.'}</p>
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
  return `
  <section class="stack" style="gap:20px;max-width:900px">
    <div class="section-head"><div><span class="chip chip--primary">Suscripción</span><h1 class="display" style="font-size:var(--fs-2xl)">Tu plan <em>VIP</em></h1></div></div>
    <div class="grid grid--2">
      ${BRAND.planes.map((pl) => `
      <div class="card card--pad stack" style="gap:12px;${p.plan === pl.id ? 'border-color:var(--primary);box-shadow:var(--ring)' : ''}">
        <div class="row" style="justify-content:space-between"><strong>${pl.nombre}</strong>${p.plan === pl.id ? '<span class="chip chip--primary">Tu plan</span>' : pl.id === 'anual' ? '<span class="chip chip--accent">Mejor precio</span>' : ''}</div>
        <div class="display display--black" style="font-size:var(--fs-2xl)">$${pl.precio.toLocaleString('es-MX')} <span style="font-size:var(--fs-sm);font-weight:500;color:var(--text-3)">MXN / ${pl.periodo}</span></div>
        <p class="muted" style="font-size:var(--fs-sm)">${pl.ahorro || 'Cancela cuando quieras'} · acceso a todos los cursos, materiales, en vivo y certificados.</p>
        ${p.plan === pl.id ? `<button class="btn btn--secondary" disabled>Plan activo</button>` : `<button class="btn btn--brand" data-cambiar-plan="${pl.id}">${p.plan === 'invitado' ? 'Hazte VIP' : 'Cambiar a este plan'}</button>`}
      </div>`).join('')}
    </div>
    <div class="card card--pad stack" style="gap:10px">
      <h3 style="font-size:var(--fs-md)">Facturación y pagos</h3>
      <p class="muted" style="font-size:var(--fs-sm)">Cambiar tarjeta, descargar recibos, cancelar o reactivar se hace en el portal seguro de Stripe. Se conecta en la Fase 2 con tu cuenta actual.</p>
      <div class="row"><button class="btn btn--secondary" disabled><i data-lucide="credit-card" class="i"></i>Portal de facturación</button><a class="btn btn--ghost" href="${wa('Hola OdonTeck, tengo una duda sobre mi suscripción VIP.')}" target="_blank" rel="noopener"><i data-lucide="message-circle" class="i"></i>Soporte por WhatsApp</a></div>
    </div>
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
      <div class="row" style="justify-content:space-between"><div><strong style="font-size:var(--fs-sm)">Cerrar sesión</strong><br><span class="faint" style="font-size:var(--fs-xs)">Se conecta con Firebase en la Fase 2</span></div><button class="btn btn--danger btn--sm" disabled><i data-lucide="log-out" class="i"></i>Cerrar sesión</button></div>
      <div class="row" style="justify-content:space-between"><div><strong style="font-size:var(--fs-sm)">Legales</strong></div><div class="row"><a class="btn btn--ghost btn--sm" href="${BRAND.sitio}/pages/privacidad.html" target="_blank" rel="noopener">Privacidad</a><a class="btn btn--ghost btn--sm" href="${BRAND.sitio}/pages/terminos.html" target="_blank" rel="noopener">Términos</a></div></div>
    </div>
    <p class="faint" style="font-size:var(--fs-xs)">OdonTeck Club · versión 0.4 · TEC Capital</p>
  </section>`;
}

export function mas() {
  const items = [['#/comunidad', 'messages-square', 'Comunidad'], ['#/logros', 'flame', 'Logros'], ['#/certificados', 'award', 'Certificados'], ['#/praxia', 'stethoscope', 'Prueba Praxia'], ['#/perfil', 'user', 'Mi perfil'], ['#/suscripcion', 'credit-card', 'Suscripción'], ['#/configuracion', 'settings', 'Configuración']];
  return `
  <section class="stack" style="gap:16px">
    <div class="row" style="gap:12px"><div class="avatar avatar--lg">${Perfil.iniciales()}</div><div><div class="display" style="font-size:var(--fs-lg)">${esc(Perfil.get().nombre)}</div><span class="user-card__plan"><i data-lucide="crown" class="i"></i>VIP ${Perfil.get().plan}</span></div></div>
    <div class="grid" style="grid-template-columns:1fr 1fr;gap:12px">${items.map(([h, i, l]) => `<a class="card card--pad card--hover" href="${h}" style="display:flex;gap:12px;align-items:center;color:inherit;padding:16px"><span class="circle-btn" style="background:var(--primary-soft);color:var(--primary);width:38px;height:38px"><i data-lucide="${i}" class="i"></i></span><strong style="font-size:var(--fs-sm)">${l}</strong></a>`).join('')}</div>
    <a class="card card--pad" href="${BRAND.canalWhatsApp}" target="_blank" rel="noopener" style="display:flex;gap:12px;align-items:center;color:inherit;background:color-mix(in srgb,#25d366 10%,var(--surface))"><span class="circle-btn" style="background:#25d366"><i data-lucide="message-circle" class="i"></i></span><div><strong style="font-size:var(--fs-sm)">Grupo de WhatsApp</strong><br><span class="faint" style="font-size:var(--fs-xs)">Avisos y comunidad</span></div></a>
  </section>`;
}
