import { Datos } from '../core/datos';
import {
  Recompensas,
  type Recompensa,
  type ResumenRecompensas,
} from '../core/recompensas';
import { esc } from '../ui/partials';
import { claseDiseno } from '../ui/disenos-recompensa';

const numero = (n: number) => n.toLocaleString('es-MX');
const precio = (puntos: number) => puntos === 0 ? 'Gratis' : `${numero(puntos)} OC`;
const fecha = (s: string) =>
  Number.isNaN(new Date(s).getTime())
    ? ''
    : new Intl.DateTimeFormat('es-MX', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(new Date(s));
function arte(r: Recompensa) {
  if (r.imagen)
    return `<div class="reward-art reward-art--image ${r.disponible ? '' : 'reward-art--soon'}"><img src="${esc(r.imagen)}" alt="" loading="lazy"></div>`;
  if (r.tipo === 'personalizacion')
    return `<div class="reward-art reward-art--design ${r.ranura === 'portada' ? claseDiseno(r.id) : ''}"><span class="reward-art__avatar ${r.ranura === 'marco' ? claseDiseno(r.id) : ''}">OT</span><span>${r.ranura === 'marco' ? 'MARCO DE PERFIL' : 'PORTADA DE PERFIL'}</span></div>`;
  if (r.tipo === 'archivo')
    return `<div class="reward-art reward-art--file"><div class="reward-paper"><small>ODONTECK · EDITABLE</small><strong>${esc(r.titulo)}</strong><i></i><i></i><i></i></div><span class="reward-art__tag">HTML · EDITABLE · IMPRIMIBLE</span></div>`;
  return `<div class="reward-art ${r.disponible ? '' : 'reward-art--soon'}"><i data-lucide="${esc(r.icono)}" class="i"></i><span>${esc(r.categoria || 'Biblioteca y Praxia')}</span></div>`;
}
function accion(r: Recompensa, saldo: number) {
  if (r.estatus === 'cancelado')
    return '<span class="reward-status">Cancelado · OC devueltos</span>';
  if (r.incluidaVip)
    return `<a class="btn btn--secondary" href="#/materiales/${encodeURIComponent(r.materialId!)}">Abrir · incluido en VIP</a>`;
  if (r.canjeada) {
    if (r.tipo === 'material')
      return `<a class="btn btn--secondary" href="#/materiales/${encodeURIComponent(r.materialId!)}">Abrir en biblioteca</a>`;
    if (r.tipo === 'archivo')
      return `<button class="btn btn--brand" data-reward-download="${esc(r.id)}"><i data-lucide="download" class="i"></i>Descargar plantilla</button>`;
    if (r.tipo === 'personalizacion')
      return `<button class="btn ${r.aplicado ? 'btn--secondary' : 'btn--brand'}" data-reward-apply="${esc(r.id)}" data-slot="${r.ranura}" data-remove="${r.aplicado ? '1' : '0'}">${r.aplicado ? 'Quitar diseño activo' : 'Usar en mi perfil'}</button>`;
    return `<span class="reward-status"><i data-lucide="${r.estatus === 'entregado' ? 'check' : 'clock-3'}" class="i"></i>${r.estatus === 'entregado' ? 'Entrega confirmada' : 'Solicitud en seguimiento'}</span>`;
  }
  if (!r.disponible)
    return `<button class="btn btn--secondary" data-reward-detail="${esc(r.id)}">Ver detalles</button>`;
  return `<button class="btn ${saldo >= r.puntos ? 'btn--brand' : 'btn--secondary'}" data-reward-detail="${esc(r.id)}">${saldo >= r.puntos ? 'Ver y canjear' : `Te faltan ${numero(r.puntos - saldo)} OC`}</button>`;
}
function tarjeta(r: Recompensa, saldo: number) {
  return `<article class="reward-card ${r.canjeada || r.incluidaVip ? 'is-earned' : ''}" data-reward-card="${esc(r.id)}">${arte(r)}<div class="reward-card__content"><div class="reward-card__top"><span class="eyebrow">${esc(r.categoria || 'Recompensas')}</span><span class="chip chip--outline">${r.estatus === 'cancelado' ? 'Cancelado' : r.incluidaVip ? 'Incluido en VIP' : r.canjeada ? 'En tu colección' : !r.disponible ? (r.estado === 'pausada' ? 'En pausa' : r.cupo === 0 ? 'Sin cupos' : 'Próximamente') : precio(r.puntos)}</span></div><h3>${esc(r.titulo)}</h3><p>${esc(r.descripcion)}</p><small class="reward-delivery"><i data-lucide="${r.tipo === 'manual' ? 'calendar-clock' : 'zap'}" class="i"></i>${esc(r.disponible ? r.plazo || r.entrega || 'Disponible al canjear' : r.motivoPendiente || 'En preparación')}</small><div class="reward-card__foot">${accion(r, saldo)}</div></div></article>`;
}

export function detalleRecompensa(r: Recompensa, saldo: number) {
  return `<form method="dialog"><button class="reward-dialog__close btn btn--ghost" aria-label="Cerrar detalle">Cerrar <i data-lucide="x" class="i"></i></button></form>${arte(r)}<div class="reward-dialog__body"><span class="eyebrow">${esc(r.categoria || 'OdonTeck Club')}</span><h2>${esc(r.titulo)}</h2><p>${esc(r.descripcion)}</p><ul>${(r.incluye || [r.entrega || 'Beneficio del club']).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>${r.tipo === 'archivo' ? '<p class="reward-note">Recibes una hoja de trabajo con tablas para completar en tu navegador. Usa «Guardar copia editada» para conservar tus cambios en el archivo descargado.</p>' : ''}<p class="reward-note">${esc(r.disponible ? r.plazo || r.entrega || 'Entrega en tu colección' : r.motivoPendiente || 'Todavía estamos preparando esta recompensa.')}</p>${r.disponible && !r.canjeada && !r.incluidaVip ? `${r.requiereCodigo ? '<label class="reward-code-field">Código de acceso<input class="input" data-reward-code autocomplete="one-time-code" maxlength="32" placeholder="Ej. ODON-XXXX-XXXX"></label><small class="reward-delivery">Recíbelo por el canal oficial o de forma privada; no aparece en la tienda.</small>' : ''}<div class="reward-checkout"><span>Precio <strong>${precio(r.puntos)}</strong></span><span>Tu saldo <strong>${numero(saldo)} OC</strong></span><span>Después del canje <strong>${saldo >= r.puntos ? `${numero(saldo - r.puntos)} OC` : 'Saldo insuficiente'}</strong></span></div><button class="btn btn--brand" data-canjear-recompensa="${esc(r.id)}" data-precio="${r.puntos}" ${saldo < r.puntos ? 'disabled' : ''}>${r.puntos === 0 ? 'Registrar solicitud gratuita' : `Confirmar canje · ${numero(r.puntos)} OC`}</button><small class="reward-delivery">Un canje por recompensa. ${r.tipo === 'manual' ? (r.puntos === 0 ? 'El lugar queda sujeto a la validación del canal y a la disponibilidad del cupo.' : 'Si el equipo cancela la entrega, recibirás tus OC de vuelta.') : 'La recompensa permanecerá en tu colección.'}</small>` : r.disponible ? accion(r, saldo) : '<p>Te avisaremos en el catálogo cuando esté lista.</p>'}</div>`;
}
function cabecera(s: ResumenRecompensas) {
  const niveles = [
    { nombre: 'Aprendiz', min: 0, siguiente: 200 },
    { nombre: 'Explorador clínico', min: 200, siguiente: 600 },
    { nombre: 'Especialista', min: 600, siguiente: 1400 },
    { nombre: 'Mentor OdonTeck', min: 1400, siguiente: 3000 },
    { nombre: 'Maestro', min: 3000, siguiente: 6000 },
    { nombre: 'Trayectoria OdonTeck', min: 6000, siguiente: null },
  ];
  const nivel = [...niveles].reverse().find((n) => s.ganados >= n.min)!;
  const pct = nivel.siguiente
    ? Math.min(
        100,
        Math.round(
          ((s.ganados - nivel.min) / (nivel.siguiente - nivel.min)) * 100,
        ),
      )
    : 100;
  return `<header class="rewards-hero"><div class="rewards-hero__copy"><span class="rewards-kicker"><i data-lucide="coins" class="i"></i>OdonCoins ${Datos.modo === 'demo' ? '· demostración' : ''}</span><h1 class="display">Aprende. Suma.<br><em>Elige tu recompensa.</em></h1><p>Diseños para tu perfil, plantillas editables y beneficios para tu desarrollo profesional.</p><p class="rewards-delivery-summary">${s.recompensas.filter((r) => r.disponible && r.tipo !== 'manual').length} de entrega automática · ${s.recompensas.filter((r) => r.disponible && r.tipo === 'manual').length} con seguimiento manual</p><div class="rewards-hero__stats"><div><strong>${s.recompensas.filter((r) => r.disponible).length}</strong><span>listas para canjear</span></div><div><strong>${s.recompensas.length}</strong><span>en el catálogo completo</span></div><div><strong>${s.recompensas.filter((r) => r.canjeada || r.incluidaVip).length}</strong><span>en tu colección</span></div></div></div><div class="rewards-wallet"><div class="rewards-wallet__shine"></div><div class="rewards-wallet__head"><span>TU MONEDERO ODONTECK</span><span class="odon-coin" aria-label="OdonCoins">OC</span></div><div class="rewards-wallet__balance"><span>Saldo disponible</span><strong data-wallet-balance>${numero(s.saldo)} <small>OC</small></strong></div><div class="rewards-wallet__level"><div><strong>${nivel.nombre}</strong><span>${nivel.siguiente ? `${numero(Math.max(0, nivel.siguiente - s.ganados))} OC ganados para el siguiente nivel` : 'Tu trayectoria sigue creciendo'}</span></div><span>${pct}%</span></div><div class="progress"><span style="width:${pct}%"></span></div><small class="wallet-explanation">1 punto de tu saldo anterior = 1 OdonCoin</small></div></header>`;
}
function historial(s: ResumenRecompensas) {
  return `<section class="card reward-panel"><h2>Tu historial de OdonCoins</h2><p>El total ganado determina tu nivel. Canjear no lo reduce.</p><div class="reward-history">${s.movimientos.length ? s.movimientos.map((m) => `<div><span class="reward-history__icon"><i data-lucide="${m.puntos >= 0 ? 'plus' : 'minus'}" class="i"></i></span><p><strong>${esc(m.detalle)}</strong><small>${fecha(m.fecha)}</small></p><b>${m.puntos >= 0 ? '+' : ''}${numero(m.puntos)} OC</b></div>`).join('') : '<p>Tus movimientos aparecerán al completar actividades.</p>'}</div></section>`;
}
function solicitudes(s: ResumenRecompensas) {
  const lista = (s.canjes || []).filter(
    (c) =>
      s.recompensas.find((r) => r.id === c.recompensaId)?.tipo === 'manual',
  );
  return lista.length
    ? `<section class="card reward-panel"><h2>Seguimiento de solicitudes</h2>${lista.map((c) => `<article class="reward-request"><div><strong>${esc(c.titulo)}</strong><small>${fecha(c.solicitado)} · ${numero(c.puntos)} OC</small><p>${esc(c.nota || c.plazo || 'El equipo confirmará los detalles de la entrega.')}</p>${c.codigoEntrega ? `<p class="reward-claim-code"><span>Tu código de seguimiento Praxia</span><code>${esc(c.codigoEntrega)}</code><small>Guárdalo: identifica tu solicitud mientras Praxia confirma la activación.</small></p>` : ''}</div><span class="chip">${c.estatus === 'entregado' ? 'Entregado' : c.estatus === 'cancelado' ? 'Cancelado · reembolsado' : 'Pendiente'}</span></article>`).join('')}</section>`
    : '';
}

export function paginaRecompensas(
  _: Record<string, string>,
  query: URLSearchParams,
) {
  const s = Recompensas.resumen();
  if (!s)
    return '<section class="rewards-loading card card--pad"><i data-lucide="loader-circle" class="i spin"></i><p>Preparando tu monedero OdonCoins…</p><button class="btn btn--secondary" data-reward-retry>Reintentar</button></section>';
  const vista = ['coleccion', 'proximas', 'historial'].includes(
    query.get('vista') || '',
  )
    ? query.get('vista')!
    : 'catalogo';
  const q = query.get('q') || '',
    categoria = query.get('categoria') || '',
    orden = query.get('orden') || 'destacadas',
    alcanza = query.get('alcanza') === '1';
  const categorias = [
    ...new Set(s.recompensas.map((r) => r.categoria || 'Biblioteca y Praxia')),
  ];
  const norm = (v: string) =>
    v
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  const lista = s.recompensas.filter(
    (r) =>
      (vista === 'coleccion'
        ? r.canjeada || r.incluidaVip
        : vista === 'proximas'
          ? !r.disponible
          : r.disponible) &&
      (!categoria || r.categoria === categoria) &&
      (!q || norm(`${r.titulo} ${r.descripcion}`).includes(norm(q))) &&
      (!alcanza || r.puntos <= s.saldo),
  );
  if (orden === 'menor') lista.sort((a, b) => a.puntos - b.puntos);
  if (orden === 'mayor') lista.sort((a, b) => b.puntos - a.puntos);
  if (orden === 'nombre')
    lista.sort((a, b) => a.titulo.localeCompare(b.titulo));
  const paginas = Math.max(1, Math.ceil(lista.length / 18)),
    pagina = Math.max(
      1,
      Math.min(paginas, Math.floor(Number(query.get('pagina')) || 1)),
    );
  const link = (n: number) => {
    const p = new URLSearchParams(query);
    p.set('pagina', String(n));
    return `#/recompensas?${p}`;
  };
  const tabs = `<nav class="reward-tabs" aria-label="Secciones de recompensas">${[
    ['catalogo', 'Tienda'],
    ['coleccion', 'Mis recompensas'],
    ['proximas', 'Próximamente'],
    ['historial', 'Movimientos'],
  ]
    .map(
      ([id, label]) =>
        `<a href="#/recompensas?vista=${id}" class="${vista === id ? 'is-active' : ''}" ${vista === id ? 'aria-current="page"' : ''}>${label}</a>`,
    )
    .join('')}</nav>`;
  const filters = `<form class="reward-filters" data-reward-filter><input type="hidden" name="vista" value="${vista}"><label>Buscar<input class="input" name="q" value="${esc(q)}" placeholder="CV, marco, agenda…"></label><label>Categoría<select class="input" name="categoria"><option value="">Todas las categorías</option>${categorias.map((c) => `<option value="${esc(c)}" ${categoria === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select></label><label>Orden<select class="input" name="orden">${[
    ['destacadas', 'Destacadas'],
    ['menor', 'Menor precio'],
    ['mayor', 'Mayor precio'],
    ['nombre', 'Nombre'],
  ]
    .map(
      ([v, t]) =>
        `<option value="${v}" ${v === orden ? 'selected' : ''}>${t}</option>`,
    )
    .join(
      '',
    )}</select></label><label class="reward-affordable"><input type="checkbox" name="alcanza" value="1" ${alcanza ? 'checked' : ''}>Me alcanza</label><button class="btn btn--brand">Filtrar</button><a class="btn btn--ghost" href="#/recompensas?vista=${vista}">Limpiar</a></form>`;
  const title =
    vista === 'coleccion'
      ? 'Lo que ya es tuyo'
      : vista === 'proximas'
        ? 'Más opciones en camino'
        : 'Elige algo para ti';
  const intro =
    vista === 'proximas'
      ? 'Conoce las próximas recompensas. Todavía no consumen monedas ni aceptan canjes.'
      : vista === 'coleccion'
        ? 'Descarga tus archivos, activa tus diseños y consulta el seguimiento de tus solicitudes.'
        : 'Revisa qué incluye cada recompensa y confirma el importe antes de canjear.';
  const grid = `<div class="rewards-heading"><div><span class="eyebrow">TIENDA ODONTECK</span><h2 class="display">${title}</h2></div><p>${intro}</p></div>${filters}<p class="reward-result-count" aria-live="polite">${lista.length} recompensas · página ${pagina} de ${paginas}</p><div class="rewards-grid">${
    lista.length
      ? lista
          .slice((pagina - 1) * 18, pagina * 18)
          .map((r) => tarjeta(r, s.saldo))
          .join('')
      : '<div class="card reward-empty-state"><i data-lucide="search" class="i"></i><h3>No encontramos recompensas con esos filtros</h3><p>Prueba otra categoría o quita el filtro de saldo.</p></div>'
  }</div>${paginas > 1 ? `<nav class="reward-pagination" aria-label="Páginas de recompensas">${pagina > 1 ? `<a class="btn btn--secondary" href="${link(pagina - 1)}">Anterior</a>` : ''}<span>${pagina} / ${paginas}</span>${pagina < paginas ? `<a class="btn btn--secondary" href="${link(pagina + 1)}">Siguiente</a>` : ''}</nav>` : ''}`;
  const actividades = [
    ['play-circle', 'Completar una clase', '10 OC'],
    ['puzzle', 'Juego de repaso de clase', '5 OC'],
    ['brain', 'Aprobar una evaluación', '20 OC'],
    ['graduation-cap', 'Terminar un curso', '50 OC'],
    ['gamepad-2', 'Primer intento diario de Retos', '2–10 OC'],
    ['clipboard-check', 'Responder encuestas', '20–40 OC'],
  ];
  return `<section class="rewards-page stack">${cabecera(s)}${tabs}${vista === 'historial' ? historial(s) : grid}${vista === 'coleccion' ? solicitudes(s) : ''}<section class="card reward-panel"><div class="reward-panel__head"><div><span class="eyebrow">SIGUE SUMANDO</span><h2>Tu aprendizaje cuenta</h2></div><span class="reward-safe">Sin duplicar actividades</span></div><div class="earn-list">${actividades.map(([icon, t, p]) => `<div class="earn-item"><span><i data-lucide="${icon}" class="i"></i></span><strong>${t}</strong><b>+${p}</b></div>`).join('')}</div><p class="reward-note">Los OdonCoins son créditos del club. Conservas tu saldo anterior y tus materiales incluidos en VIP. Las recompensas que requieren preparación se habilitan cuando su entrega está lista.</p></section><dialog id="reward-detail" class="reward-dialog" aria-label="Detalle y confirmación de recompensa"></dialog></section>`;
}
