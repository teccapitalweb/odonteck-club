// Admin · resumen, miembros, comunidad, avisos y ajustes.
import { Datos, type MiembroDemo } from '../core/datos';
import { Comunidad, hace } from '../core/comunidad';
import { Progreso } from '../core/progreso';
import { Admin } from '../core/admin';
import { contactosEncuestasDemo, resumenEncuestasDemo, type PreguntaResumenEncuesta } from '../core/encuestas';
import { esc, iniciales } from '../ui/partials';
import { adminHead } from './shell';
import { vacio, callout } from './contenido';

const DIA = 864e5;
export function estadoMiembro(m: MiembroDemo, ahora = Date.now()) {
  if (m.cortesiaHasta && new Date(m.cortesiaHasta).getTime() > ahora) return { vip: true, etiqueta: 'Cortesía', chip: 'chip--primary' };
  if (m.esVip === true) return { vip: true, etiqueta: m.esAdmin ? 'Administrador' : m.plan === 'anual' ? 'VIP anual' : m.plan === 'mensual' ? 'VIP mensual' : 'VIP activo', chip: 'chip--accent' };
  if ((m.plan === 'mensual' || m.plan === 'anual') && m.vence && new Date(m.vence).getTime() > ahora) return { vip: true, etiqueta: m.plan === 'anual' ? 'VIP anual' : 'VIP mensual', chip: 'chip--accent' };
  return { vip: false, etiqueta: 'Sin membresía', chip: '' };
}
const fecha = (iso?: string | null) => iso ? new Date(iso.length === 10 ? iso + 'T12:00:00' : iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

// ═══ RESUMEN ═══
export function adminResumen() {
  if (Datos.modo === 'api' && Admin.resumen) return adminResumenReal(Admin.resumen);
  const cfg = Datos.config();
  const ms = Datos.miembros();
  const ahora = Date.now();
  const activos = ms.filter((m) => estadoMiembro(m).vip);
  const mensual = activos.filter((m) => m.plan === 'mensual' && !m.cortesiaHasta).length;
  const anual = activos.filter((m) => m.plan === 'anual').length;
  const mrr = mensual * cfg.precioMensual + Math.round((anual * cfg.precioAnual) / 12);
  const altas30 = ms.filter((m) => ahora - new Date(m.alta).getTime() < 30 * DIA).length;
  const porVencer = ms.filter((m) => m.vence && new Date(m.vence).getTime() > ahora && new Date(m.vence).getTime() - ahora < 7 * DIA);
  const inactivos = activos.filter((m) => ahora - new Date(m.ultimaActividad).getTime() > 14 * DIA);
  const cursos = Datos.cursos();
  const genericos = cursos.reduce((a, c) => a + c.clases.filter((k) => /^Clase \d+$/.test(k.titulo)).length, 0);
  const qz = Datos.quizzes();
  const meses = Array.from({ length: 6 }, (_, i) => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 5 + i); return d; });
  const altasMes = meses.map((d) => ms.filter((m) => { const a = new Date(m.alta); return a.getMonth() === d.getMonth() && a.getFullYear() === d.getFullYear(); }).length);
  const maxAlta = Math.max(1, ...altasMes);
  const topCursos = cursos.map((c) => ({ c, v: Progreso.de(c.id).vistas.length })).sort((a, b) => b.v - a.v).slice(0, 5);
  const maxV = Math.max(1, ...topCursos.map((t) => t.v));
  const kpi = (icon: string, label: string, valor: string, nota: string) => `<div class="kpi"><span class="kpi__ic"><i data-lucide="${icon}" class="i"></i></span><span class="kpi__label">${label}</span><strong class="kpi__val">${valor}</strong><span class="kpi__nota">${nota}</span></div>`;
  return `
  ${adminHead('Resumen', new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))}
  ${Datos.modo === 'demo' ? callout('Datos de demostración', 'Los miembros de esta pantalla son ficticios. Con el backend conectado, estos números salen de Firebase y Stripe en tiempo real.') : ''}
  <div class="kpis">
    ${kpi('users', 'Miembros activos', String(activos.length), `${mensual} mensual · ${anual} anual · ${activos.length - mensual - anual} cortesía`)}
    ${kpi('trending-up', 'Ingreso mensual estimado', `$${mrr.toLocaleString('es-MX')}`, 'MXN · anual prorrateado')}
    ${kpi('user-plus', 'Altas en 30 días', String(altas30), `${porVencer.length} vencen esta semana`)}
    ${kpi('alert-triangle', 'Sin actividad 14+ días', String(inactivos.length), 'miembros activos en riesgo de baja')}
  </div>
  <div class="admin-grid admin-grid--even">
    <div class="card card--pad stack" style="gap:14px">
      <h3 class="admin-card-title">Altas por mes</h3>
      <div class="bars">${meses.map((d, i) => `<div class="bars__col"><span class="bars__val mono">${altasMes[i]}</span><div class="bars__bar" style="height:${(altasMes[i] / maxAlta) * 100}%"></div><span class="bars__lbl">${d.toLocaleDateString('es-MX', { month: 'short' })}</span></div>`).join('')}</div>
    </div>
    <div class="card card--pad stack" style="gap:12px">
      <h3 class="admin-card-title">Cursos más vistos</h3>
      ${topCursos.some((t) => t.v) ? topCursos.map((t) => `<div class="hbar"><span class="hbar__lbl">${esc(t.c.titulo)}</span><div class="progress"><span style="width:${(t.v / maxV) * 100}%"></span></div><span class="mono faint">${t.v}</span></div>`).join('')
        : '<p class="muted" style="font-size:var(--fs-sm)">Aún no hay clases vistas registradas en este navegador.</p>'}
    </div>
  </div>
  <div class="admin-grid admin-grid--even">
    <div class="card card--pad stack" style="gap:10px">
      <h3 class="admin-card-title">Pendientes de contenido</h3>
      <a class="todo" href="#/admin/cursos"><i data-lucide="type" class="i"></i><span><strong>${genericos} clases</strong> con título genérico "Clase N"</span><i data-lucide="chevron-right" class="i"></i></a>
      <a class="todo" href="#/admin/quizzes"><i data-lucide="brain" class="i"></i><span><strong>${qz.filter((q) => q.estado === 'borrador').length} quizzes</strong> esperando revisión</span><i data-lucide="chevron-right" class="i"></i></a>
      <a class="todo" href="#/admin/materiales"><i data-lucide="library" class="i"></i><span><strong>${Datos.materiales().filter((m) => m.estado !== 'disponible').length} materiales</strong> sin publicar</span><i data-lucide="chevron-right" class="i"></i></a>
      <a class="todo" href="#/admin/en-vivo"><i data-lucide="radio" class="i"></i><span><strong>${Datos.eventos().filter((e) => new Date(e.fecha).getTime() > ahora).length} clases en vivo</strong> programadas</span><i data-lucide="chevron-right" class="i"></i></a>
    </div>
    <div class="card card--pad stack" style="gap:10px">
      <h3 class="admin-card-title">Vencen en 7 días</h3>
      ${porVencer.length ? porVencer.map((m) => `<a class="todo" href="#/admin/miembros/${m.uid}"><div class="avatar" style="width:30px;height:30px;font-size:11px">${iniciales(m.nombre)}</div><span><strong>${esc(m.nombre)}</strong><br><span class="faint">${m.plan} · vence ${fecha(m.vence)}</span></span><i data-lucide="chevron-right" class="i"></i></a>`).join('')
        : '<p class="muted" style="font-size:var(--fs-sm)">Nadie vence esta semana.</p>'}
    </div>
  </div>`;
}

function adminResumenReal(r: NonNullable<typeof Admin.resumen>) {
  const cursos = Datos.cursos();
  const qz = Datos.quizzes();
  const genericos = cursos.reduce((a, c) => a + c.clases.filter((k) => /^Clase \d+$/.test(k.titulo)).length, 0);
  const maxV = Math.max(1, ...r.cursosTop.map((t) => t.vistas));
  const kpi = (icon: string, label: string, valor: number, nota: string) => `<div class="kpi"><span class="kpi__ic"><i data-lucide="${icon}" class="i"></i></span><span class="kpi__label">${label}</span><strong class="kpi__val">${valor}</strong><span class="kpi__nota">${nota}</span></div>`;
  return `
  ${adminHead('Resumen', new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))}
  <div class="kpis">
    ${kpi('users', 'Miembros activos', r.miembrosActivos, 'membresía, cortesía o admin vigente')}
    ${kpi('user-plus', 'Altas en 30 días', r.altas30d, `${r.bajas30d} bajas registradas`)}
    ${kpi('play-circle', 'Clases vistas', r.clasesVistas30d, 'durante los últimos 30 días')}
    ${kpi('award', 'Certificados', r.certificados30d, `${r.temasForo30d} temas nuevos en comunidad`)}
  </div>
  <div class="admin-grid admin-grid--even">
    <div class="card card--pad stack" style="gap:12px">
      <h3 class="admin-card-title">Cursos más vistos · 30 días</h3>
      ${r.cursosTop.length ? r.cursosTop.map((t) => `<div class="hbar"><span class="hbar__lbl">${esc(t.titulo)}</span><div class="progress"><span style="width:${(t.vistas / maxV) * 100}%"></span></div><span class="mono faint">${t.vistas}</span></div>`).join('') : '<p class="muted" style="font-size:var(--fs-sm)">Todavía no hay vistas en este periodo.</p>'}
    </div>
    <div class="card card--pad stack" style="gap:10px">
      <h3 class="admin-card-title">Pendientes de contenido</h3>
      <a class="todo" href="#/admin/cursos"><i data-lucide="type" class="i"></i><span><strong>${genericos} clases</strong> con título genérico</span><i data-lucide="chevron-right" class="i"></i></a>
      <a class="todo" href="#/admin/quizzes"><i data-lucide="brain" class="i"></i><span><strong>${qz.filter((q) => q.estado === 'borrador').length} quizzes</strong> esperando revisión</span><i data-lucide="chevron-right" class="i"></i></a>
      <a class="todo" href="#/admin/materiales"><i data-lucide="library" class="i"></i><span><strong>${Datos.materiales().filter((m) => m.estado !== 'disponible').length} materiales</strong> sin publicar</span><i data-lucide="chevron-right" class="i"></i></a>
      <a class="todo" href="#/admin/en-vivo"><i data-lucide="radio" class="i"></i><span><strong>${Datos.eventos().filter((e) => new Date(e.fecha).getTime() > Date.now()).length} clases en vivo</strong> programadas</span><i data-lucide="chevron-right" class="i"></i></a>
    </div>
  </div>`;
}

// ═══ MIEMBROS ═══
export function adminMiembros(_: Record<string, string>, query: URLSearchParams) {
  const q = (query.get('q') || '').toLowerCase();
  const f = query.get('estado') || '';
  let l = Datos.miembros();
  if (q) l = l.filter((m) => (m.nombre + m.email).toLowerCase().includes(q));
  if (f === 'vip') l = l.filter((m) => estadoMiembro(m).vip && !m.cortesiaHasta);
  if (f === 'cortesia') l = l.filter((m) => m.cortesiaHasta && new Date(m.cortesiaHasta).getTime() > Date.now());
  if (f === 'sin') l = l.filter((m) => !estadoMiembro(m).vip);
  const chip = (k: string, t: string) => `<a class="chip ${f === k ? 'chip--primary' : 'chip--outline'}" href="#/admin/miembros?${new URLSearchParams({ q, estado: k })}">${t}</a>`;
  return `
  ${adminHead('Miembros', `${Datos.miembros().length} cuentas · ${Datos.miembros().filter((m) => estadoMiembro(m).vip).length} con acceso`)}
  <div class="row" style="justify-content:space-between">
    <form class="search" style="flex:1;max-width:420px" data-form="buscar-miembro"><i data-lucide="search" class="i"></i><input class="input" name="q" value="${esc(q)}" placeholder="Buscar por nombre o correo"></form>
    <div class="row" style="gap:6px">${chip('', 'Todos')}${chip('vip', 'VIP')}${chip('cortesia', 'Cortesía')}${chip('sin', 'Sin membresía')}</div>
  </div>
  ${l.length ? `<div class="card dtable-wrap"><table class="dtable"><thead><tr><th>Miembro</th><th>Estado</th><th>Vence</th><th>Clases vistas</th><th>Última actividad</th><th></th></tr></thead><tbody>
    ${l.map((m) => { const e = estadoMiembro(m); return `<tr>
      <td><a class="dtable__main" href="#/admin/miembros/${m.uid}"><span class="avatar" style="width:34px;height:34px;font-size:12px">${iniciales(m.nombre)}</span><span><strong>${esc(m.nombre)}</strong><br><span class="faint">${esc(m.email)}</span></span></a></td>
      <td><span class="chip ${e.chip}">${e.etiqueta}</span></td><td>${fecha(m.cortesiaHasta || m.vence)}</td><td class="mono">${m.clasesVistas}</td><td>${hace(m.ultimaActividad)}</td>
      <td><a class="btn btn--ghost btn--icon btn--xs" href="#/admin/miembros/${m.uid}"><i data-lucide="chevron-right" class="i"></i></a></td></tr>`; }).join('')}
  </tbody></table></div>` : vacio('Sin resultados', 'Prueba con otro nombre o filtro.')}`;
}

export function adminMiembro(params: Record<string, string>) {
  const detalle = Datos.modo === 'api' && Admin.detalleMiembro?.uid === params.uid ? Admin.detalleMiembro : null;
  const m = detalle || Datos.miembros().find((x) => x.uid === params.uid);
  if (!m) return vacio('Miembro no encontrado', '', '<a class="btn btn--brand" href="#/admin/miembros">Volver</a>');
  const e = estadoMiembro(m);
  const cortesiaVigente = m.cortesiaHasta && new Date(m.cortesiaHasta).getTime() > Date.now();
  return `
  <a class="section-head__cta" href="#/admin/miembros" style="align-self:flex-start"><span class="circle-btn circle-btn--glass" style="width:34px;height:34px"><i data-lucide="arrow-left" class="i" style="width:15px;height:15px"></i></span>Miembros</a>
  <div class="card card--pad row" style="gap:18px;align-items:center">
    <div class="avatar avatar--lg">${iniciales(m.nombre)}</div>
    <div style="flex:1"><h1 class="display" style="font-size:var(--fs-xl)">${esc(m.nombre)}</h1><p class="muted">${esc(m.email)}${m.alta ? ` · alta ${fecha(m.alta)}` : ''}</p></div>
    <span class="chip ${e.chip}" style="height:32px;font-size:var(--fs-sm)">${e.etiqueta}</span>
  </div>
  <div class="kpis">
    <div class="kpi"><span class="kpi__label">Plan</span><strong class="kpi__val" style="font-size:var(--fs-lg)">${({ mensual: 'Mensual', anual: 'Anual', cortesia: 'Cortesía', ninguno: 'Sin plan', admin: 'Administrador', regalo: 'Regalo' } as Record<string, string>)[m.plan || 'ninguno'] || esc(m.plan || 'Sin plan')}</strong><span class="kpi__nota">vence ${fecha(m.vence)}</span></div>
    <div class="kpi"><span class="kpi__label">Clases vistas</span><strong class="kpi__val">${m.clasesVistas}</strong><span class="kpi__nota">de ${Datos.cursos().reduce((a, c) => a + c.clases.length, 0)}</span></div>
    <div class="kpi"><span class="kpi__label">Última actividad</span><strong class="kpi__val" style="font-size:var(--fs-lg)">${hace(m.ultimaActividad)}</strong><span class="kpi__nota">${fecha(m.ultimaActividad)}</span></div>
  </div>
  <div class="admin-grid admin-grid--even">
    <form class="card card--pad stack" style="gap:12px" data-form="cortesia" data-uid="${m.uid}">
      <h3 class="admin-card-title">Acceso de cortesía</h3>
      ${cortesiaVigente ? `<p style="font-size:var(--fs-sm)">Vigente hasta <strong>${fecha(m.cortesiaHasta)}</strong>${m.cortesiaMotivo ? ` · ${esc(m.cortesiaMotivo)}` : ''}</p>` : '<p class="muted" style="font-size:var(--fs-sm)">Da acceso VIP sin cobro por un periodo: ponentes, alianzas, compensaciones.</p>'}
      <div class="form-grid"><div class="field"><label>Días</label><div class="row" style="gap:6px">${[7, 15, 30, 90].map((d) => `<button type="button" class="chip chip--outline" data-dias="${d}">${d}</button>`).join('')}</div><input class="input" type="number" min="1" max="730" name="dias" value="30" required></div>
      <div class="field"><label>Motivo (queda registrado)</label><input class="input" name="motivo" required placeholder="Ponente invitada, compensación…"></div></div>
      <div class="row"><button class="btn btn--brand"><i data-lucide="gift" class="i"></i>${cortesiaVigente ? 'Extender cortesía' : 'Dar cortesía'}</button>${cortesiaVigente ? `<button type="button" class="btn btn--danger" data-revocar-cortesia="${m.uid}">Revocar</button>` : ''}</div>
    </form>
    <div class="card card--pad stack" style="gap:10px">
      <h3 class="admin-card-title">Suscripción en Stripe</h3>
      <p class="muted" style="font-size:var(--fs-sm)">Cancelar, reembolsar o cambiar de plan se hace desde Stripe para que los cobros y la membresía nunca se desincronicen. Con el backend conectado, aquí aparece el historial de pagos y el enlace directo al cliente en Stripe.</p>
      <div class="row"><button class="btn btn--secondary" disabled><i data-lucide="credit-card" class="i"></i>Ver en Stripe</button><button class="btn btn--secondary" disabled><i data-lucide="x-circle" class="i"></i>Cancelar al final del periodo</button></div>
    </div>
  </div>
  ${detalle ? `<div class="admin-grid admin-grid--even">
    <div class="card card--pad stack" style="gap:10px"><h3 class="admin-card-title">Progreso por curso</h3>${detalle.progreso.length ? detalle.progreso.map((p) => `<div class="hbar"><span class="hbar__lbl">${esc(p.titulo)}</span><div class="progress"><span style="width:${p.total ? Math.round((p.vistas.length / p.total) * 100) : 0}%"></span></div><span class="mono faint">${p.vistas.length}/${p.total}</span></div>`).join('') : '<p class="muted" style="font-size:var(--fs-sm)">Todavía no ha iniciado cursos.</p>'}</div>
    <div class="card card--pad stack" style="gap:10px"><h3 class="admin-card-title">Certificados</h3>${detalle.certificados.length ? detalle.certificados.map((c) => `<div class="todo"><i data-lucide="award" class="i"></i><span><strong>${esc(c.cursoTitulo)}</strong><br><span class="faint">${esc(c.folio)} · ${fecha(c.emitido)}</span></span></div>`).join('') : '<p class="muted" style="font-size:var(--fs-sm)">Sin certificados emitidos.</p>'}</div>
  </div>` : ''}`;
}

// ═══ COMUNIDAD ═══
export function adminComunidad() {
  const l = Comunidad.todos();
  const reportes = Admin.reportesDirectorio;
  const pendientes = reportes.filter((r) => r.estado === 'pendiente');
  const motivos: Record<string, string> = { spam: 'Spam o publicidad engañosa', suplantacion: 'Suplantación', contenido_inapropiado: 'Contenido inapropiado', datos_falsos: 'Datos profesionales falsos', otro: 'Otro motivo' };
  return `
  ${adminHead('Comunidad', `${l.length} temas · ${l.filter((h) => h.oculto).length} ocultos · ${pendientes.length} denuncias pendientes`)}
  <section class="stack" style="gap:10px;margin-bottom:22px">
    <div class="row" style="justify-content:space-between;align-items:end"><div><span class="eyebrow">Seguridad del directorio</span><h2 style="font-family:var(--font-display);font-size:var(--fs-lg)">Denuncias por revisar</h2></div><span class="chip ${pendientes.length ? 'chip--primary' : ''}">${pendientes.length} pendientes</span></div>
    ${pendientes.length ? pendientes.map((r) => `<article class="card card--pad admin-directory-report">
      <div class="avatar"><i data-lucide="${r.tipo === 'perfil' ? 'user-round-search' : 'briefcase-business'}" class="i"></i></div>
      <div><div class="row" style="gap:8px"><span class="chip">${r.tipo === 'perfil' ? 'Perfil' : 'Oportunidad'}</span><strong style="font-size:var(--fs-sm)">${esc(motivos[r.motivo] || r.motivo)}</strong><span class="faint" style="font-size:var(--fs-xs)">${hace(r.creado)}</span></div><h3 style="margin-top:6px;font-family:var(--font-display);font-size:var(--fs-md)">${esc(r.resumenObjetivo)}</h3>${r.detalle ? `<p class="muted" style="font-size:var(--fs-sm)">${esc(r.detalle)}</p>` : '<p class="faint" style="font-size:var(--fs-xs)">Sin detalle adicional.</p>'}</div>
      <div class="row admin-directory-report__actions">${r.tipo === 'perfil' ? `<button class="btn btn--danger btn--sm" data-directorio-reporte="${r.id}:revisado:ocultar">Ocultar perfil</button>` : `<button class="btn btn--danger btn--sm" data-directorio-reporte="${r.id}:revisado:cerrar">Cerrar oportunidad</button>`}<button class="btn btn--secondary btn--sm" data-directorio-reporte="${r.id}:descartado:ninguna">Descartar</button></div>
    </article>`).join('') : vacio('Sin denuncias pendientes', 'El directorio está al día. Las nuevas denuncias aparecerán aquí sin revelar la identidad del miembro que reportó.')}
  </section>
  <div class="row" style="justify-content:space-between;align-items:end;margin-bottom:10px"><div><span class="eyebrow">Foro</span><h2 style="font-family:var(--font-display);font-size:var(--fs-lg)">Temas de la comunidad</h2></div></div>
  ${l.length ? `<div class="stack" style="gap:10px">${l.map((h) => `
    <div class="card card--pad" style="display:grid;grid-template-columns:auto 1fr auto;gap:14px;align-items:start;${h.oculto ? 'opacity:.6' : ''}">
      <div class="avatar">${iniciales(h.autor)}</div>
      <div><div class="row" style="gap:8px"><strong style="font-size:var(--fs-sm)">${esc(h.autor)}</strong><span class="faint" style="font-size:var(--fs-xs)">${hace(h.fecha)} · ${h.respuestas.length} respuestas · ${h.util} útil</span>${h.oculto ? '<span class="chip">Oculto</span>' : ''}</div>
        <a href="#/comunidad/${h.id}" target="_blank" style="font-family:var(--font-display);font-weight:700;color:var(--text)">${esc(h.titulo)}</a>
        <p class="muted" style="font-size:var(--fs-sm)">${esc(h.texto.slice(0, 220))}${h.texto.length > 220 ? '…' : ''}</p></div>
      <button class="btn btn--sm ${h.oculto ? 'btn--secondary' : 'btn--danger'}" data-ocultar-hilo="${h.id}">${h.oculto ? 'Mostrar' : 'Ocultar'}</button>
    </div>`).join('')}</div>` : vacio('Sin temas', 'Cuando los miembros abran temas aparecerán aquí para moderarlos.')}`;
}

// ═══ AVISOS ═══
export function adminAvisos() {
  const l = Datos.avisos();
  return `
  ${adminHead('Avisos', 'Mensajes que aparecen en la campana de notificaciones de todos los miembros.')}
  <form class="card card--pad stack" style="gap:12px;max-width:820px" data-form="aviso">
    <div class="field"><label>Título</label><input class="input" name="titulo" required maxlength="80" placeholder="Nuevo curso: Endodoncia pediátrica"></div>
    <div class="field"><label>Mensaje</label><textarea class="input" name="texto" rows="3" required maxlength="400" placeholder="Ya está disponible completo en tu catálogo…"></textarea></div>
    <div class="field"><label>Enlace (opcional)</label><input class="input" name="enlace" placeholder="#/cursos o https://…"></div>
    <div class="row" style="justify-content:flex-end"><button class="btn btn--brand btn--pill-arrow">Publicar aviso <span class="arrow"><i data-lucide="send" class="i"></i></span></button></div>
  </form>
  <div class="stack" style="gap:10px;max-width:820px">${l.map((a) => `
    <div class="card card--pad row" style="justify-content:space-between;align-items:flex-start;flex-wrap:nowrap">
      <div><strong>${esc(a.titulo)}</strong><p class="muted" style="font-size:var(--fs-sm)">${esc(a.texto)}</p><span class="faint" style="font-size:var(--fs-xs)">${hace(a.fecha)}${a.enlace ? ` · ${esc(a.enlace)}` : ''}</span></div>
      ${Datos.modo === 'demo' ? `<button class="btn btn--ghost btn--icon btn--xs" data-borrar-aviso="${a.id}" aria-label="Borrar"><i data-lucide="trash-2" class="i"></i></button>` : ''}
    </div>`).join('') || vacio('Sin avisos publicados', 'El primero aparecerá en la campana de todos los miembros.')}</div>`;
}

// ═══ ENCUESTAS ═══
const colorNps = (nps: number | null | undefined) => nps === null || nps === undefined ? 'var(--text-3)' : nps >= 50 ? 'var(--success)' : nps >= 0 ? 'var(--warning)' : 'var(--danger)';
const fmtNps = (nps: number | null | undefined) => nps === null || nps === undefined ? '—' : `${nps > 0 ? '+' : ''}${nps}`;

function preguntaEncuesta(p: PreguntaResumenEncuesta) {
  const nota = p.condicional ? `<span class="encuesta-dato__nota"><i data-lucide="git-branch" class="i"></i>La vieron ${p.aplicables ?? 0}</span>` : '';
  if (p.tipo === 'escala' && p.nps !== undefined) {
    const n = (p.promotores ?? 0) + (p.pasivos ?? 0) + (p.detractores ?? 0);
    const pct = (x: number) => n ? Math.round((x / n) * 100) : 0;
    return `<div class="encuesta-dato encuesta-dato--nps"><h4>${esc(p.texto)}${nota}</h4>
      <div class="encuesta-dato__promedio"><strong style="color:${colorNps(p.nps)}">${fmtNps(p.nps)}</strong><span class="muted">NPS · promedio ${p.promedio ?? '—'} de 10 · ${p.total} respuestas</span></div>
      <div class="encuesta-nps" title="Promotores (9-10), pasivos (7-8) y detractores (0-6)"><i style="width:${pct(p.promotores ?? 0)}%;background:var(--success)"></i><i style="width:${pct(p.pasivos ?? 0)}%;background:var(--warning)"></i><i style="width:${pct(p.detractores ?? 0)}%;background:var(--danger)"></i></div>
      <div class="encuesta-nps__leyenda"><span><b style="background:var(--success)"></b>${p.promotores ?? 0} promotores</span><span><b style="background:var(--warning)"></b>${p.pasivos ?? 0} pasivos</span><span><b style="background:var(--danger)"></b>${p.detractores ?? 0} detractores</span></div></div>`;
  }
  if (p.tipo === 'escala') return `<div class="encuesta-dato"><h4>${esc(p.texto)}${nota}</h4><div class="encuesta-dato__promedio"><strong>${p.promedio ?? '—'}</strong><span class="muted">de ${p.max} · ${p.total} respuestas</span></div></div>`;
  if (p.tipo === 'texto') return `<div class="encuesta-dato"><h4>${esc(p.texto)}${nota}</h4>${p.comentarios?.length ? p.comentarios.map((c) => `<p class="encuesta-comentario">${esc(c)}</p>`).join('') : '<p class="muted" style="font-size:var(--fs-sm)">Sin comentarios todavía.</p>'}</div>`;
  return `<div class="encuesta-dato"><h4>${esc(p.texto)}${nota}</h4>${(p.opciones || []).map((o) => `<div class="encuesta-barra" title="${o.total} respuestas"><span>${esc(o.etiqueta)}</span><span class="encuesta-barra__pista"><i style="width:${Math.min(100, o.porcentaje)}%"></i></span><strong class="mono">${o.porcentaje}%</strong></div>`).join('')}</div>`;
}

export function adminEncuestas(_: Record<string, string>, query: URLSearchParams) {
  const plan = query.get('plan') === 'vip' ? 'vip' : query.get('plan') === 'gratis' ? 'gratis' : null;
  const r = Datos.modo === 'api' ? Admin.encuestas : resumenEncuestasDemo(plan);
  const contactos = Datos.modo === 'api' ? Admin.contactosEncuestas : contactosEncuestasDemo();
  if (!r) return vacio('Sin resultados disponibles', 'No se pudo preparar el resumen de encuestas.');
  const porTipo = (tipo: string) => r.encuestas.find((e) => e.tipo === tipo)?.total || 0;
  const experiencia = r.encuestas.find((e) => e.tipo === 'pulso');
  const rec = experiencia?.preguntas.find((p) => p.id === 'recomendacion');
  const prom = (id: string) => experiencia?.preguntas.find((p) => p.id === id)?.promedio ?? null;
  const kpi = (icon: string, label: string, valor: string | number, nota: string, color = '') => `<div class="kpi"><span class="kpi__ic"><i data-lucide="${icon}" class="i"></i></span><span class="kpi__label">${label}</span><strong class="kpi__val" ${color ? `style="color:${color}"` : ''}>${valor}</strong><span class="kpi__nota">${nota}</span></div>`;
  const filtro = (valor: string | null, etiqueta: string, n: number) => `<a class="chip ${plan === valor ? 'chip--primary' : 'chip--outline'}" href="#/admin/encuestas${valor ? `?plan=${valor}` : ''}" ${plan === valor ? 'aria-current="page"' : ''}>${etiqueta} <span class="mono">${n}</span></a>`;
  const planes = r.planes ?? { vip: 0, gratis: 0, sinDato: 0 };
  return `${adminHead('Encuestas', 'Conoce a la comunidad, mide el valor de los cursos y cómo le está funcionando el club a cada quien.', `<button class="btn btn--secondary" data-exportar-encuestas><i data-lucide="download" class="i"></i>Exportar CSV</button>`)}
  <div class="card card--pad row" style="align-items:flex-start;flex-wrap:nowrap;background:var(--primary-soft)"><i data-lucide="shield-check" class="i" style="color:var(--primary);flex:0 0 20px"></i><p style="font-size:var(--fs-sm)"><strong>Privacidad por diseño.</strong> Aquí sólo se muestran tendencias agregadas y comentarios sin nombre ni correo. El único correo visible es el de quien calificó bajo y pidió expresamente que le escribiéramos.</p></div>
  <div class="row" style="gap:8px;flex-wrap:wrap;align-items:center"><span class="muted" style="font-size:var(--fs-sm)">Ver respuestas de:</span>${filtro(null, 'Todos', planes.vip + planes.gratis + planes.sinDato)}${filtro('vip', 'Miembros VIP', planes.vip)}${filtro('gratis', 'Cuentas gratis', planes.gratis)}</div>
  <div class="kpis encuestas-kpis">
    ${kpi('messages-square', 'Respuestas', r.totalRespuestas, plan ? `sólo ${plan === 'vip' ? 'VIP' : 'gratis'}` : 'todas las encuestas')}
    ${kpi('user-round-search', 'Entrevista inicial', porTipo('bienvenida'), 'quién es y qué le gusta')}
    ${kpi('graduation-cap', 'Fin de curso', porTipo('curso'), 'calidad y recomendación')}
    ${kpi('activity', 'Experiencia en el club', porTipo('pulso'), 'uso, facilidad y qué falta')}
    ${kpi('thumbs-up', 'NPS del club', fmtNps(rec?.nps), rec?.total ? `${rec.promotores} promotores · ${rec.detractores} detractores` : 'sin respuestas de experiencia', colorNps(rec?.nps))}
    ${kpi('compass', 'Facilidad de uso', prom('facilidad') ?? '—', 'de 5 estrellas')}
    ${kpi('sparkles', 'Calidad percibida', prom('calidad') ?? '—', 'de 5 estrellas')}
    ${kpi('mail', 'Quieren que les escribamos', contactos.length, 'calificaron bajo y dieron permiso')}
  </div>
  ${experiencia?.periodos?.length ? `<section class="card dtable-wrap"><div class="card--pad" style="padding-bottom:0"><span class="eyebrow">Tendencia por trimestre</span><h3 class="admin-card-title" style="margin-top:4px">Experiencia en el club, periodo a periodo</h3></div><table class="dtable"><thead><tr><th>Periodo</th><th>Respuestas</th><th>NPS</th><th>Facilidad</th><th>Calidad</th></tr></thead><tbody>${experiencia.periodos.map((p) => `<tr><td><strong class="mono">${esc(p.periodo)}</strong></td><td class="mono">${p.total}</td><td><strong style="color:${colorNps(p.nps)}">${fmtNps(p.nps)}</strong></td><td>${p.facilidad ?? '—'} / 5</td><td>${p.calidad ?? '—'} / 5</td></tr>`).join('')}</tbody></table></section>` : ''}
  ${contactos.length ? `<section class="card dtable-wrap"><div class="card--pad" style="padding-bottom:0"><span class="eyebrow">Con su permiso</span><h3 class="admin-card-title" style="margin-top:4px">Miembros que pidieron que les escribamos</h3><p class="muted" style="font-size:var(--fs-sm);margin-top:4px">Calificaron 6 o menos y aceptaron que los contactemos para entender qué mejorar.</p></div><table class="dtable"><thead><tr><th>Correo</th><th>Plan</th><th>Calificación</th><th>Motivo</th><th>Fecha</th></tr></thead><tbody>${contactos.map((c) => `<tr><td><a href="mailto:${esc(c.correo)}">${esc(c.correo)}</a></td><td>${c.vip === true ? 'VIP' : c.vip === false ? 'Gratis' : '—'}</td><td class="mono">${c.recomendacion ?? '—'} / 10</td><td>${esc(c.motivo || c.mejora || '—')}</td><td class="mono">${esc(c.enviado.slice(0, 10))}</td></tr>`).join('')}</tbody></table></section>` : ''}
  ${r.totalRespuestas ? `<div class="stack" style="gap:18px">${r.encuestas.filter((e) => e.total > 0).map((e) => `<section class="card card--pad encuesta-resumen"><div class="encuesta-resumen__head"><div><span class="eyebrow">${esc(e.tipo === 'bienvenida' ? 'Primer ingreso · quién es y qué le gusta' : e.tipo === 'curso' ? 'Curso completado' : 'Experiencia en la plataforma')}</span><h3 class="admin-card-title" style="margin-top:4px">${esc(e.titulo)}</h3></div><span class="chip chip--primary">${e.total} respuestas</span></div><div class="encuesta-resumen__preguntas">${e.preguntas.map(preguntaEncuesta).join('')}</div></section>`).join('')}</div>` : vacio('Aún no hay respuestas', plan ? 'No hay respuestas de este tipo de miembro todavía.' : 'Los resultados aparecerán aquí cuando los miembros contesten. En modo demo, entra como miembro y completa la entrevista para probar el flujo.')}
  ${r.cursos.length ? `<section class="card dtable-wrap"><table class="dtable"><thead><tr><th>Curso</th><th>Respuestas</th><th>Utilidad</th><th>Recomendación</th></tr></thead><tbody>${r.cursos.map((c) => `<tr><td><strong>${esc(c.titulo)}</strong></td><td class="mono">${c.total}</td><td>${c.utilidad ?? '—'} / 5</td><td>${c.recomendacion ?? '—'} / 10</td></tr>`).join('')}</tbody></table></section>` : ''}`;
}

// ═══ AJUSTES ═══
export function adminAjustes() {
  const c = Datos.config();
  return `
  ${adminHead('Ajustes', 'Precios, contacto y administración del club.')}
  <form class="card card--pad stack" style="gap:14px;max-width:820px" data-form="config">
    <h3 class="admin-card-title">Membresía</h3>
    <div class="form-grid form-grid--3">
      <div class="field"><label>Precio mensual (MXN)</label><input class="input" type="number" min="0" name="precioMensual" value="${c.precioMensual}"></div>
      <div class="field"><label>Precio anual (MXN)</label><input class="input" type="number" min="0" name="precioAnual" value="${c.precioAnual}"></div>
      <div class="field"><label>Descuento VIP en vivo (%)</label><input class="input" type="number" min="0" max="100" name="descuentoVIP" value="${c.descuentoVIP}"></div>
    </div>
    <p class="faint" style="font-size:var(--fs-xs)">Los precios que se cobran los define Stripe. Cambiarlos aquí actualiza lo que se muestra; con el backend conectado se valida que coincidan con los precios de Stripe.</p>
    <h3 class="admin-card-title" style="margin-top:8px">Contacto</h3>
    <div class="form-grid">
      <div class="field"><label>WhatsApp de soporte (con lada, solo números)</label><input class="input mono" name="whatsappSoporte" value="${esc(c.whatsappSoporte)}" pattern="[0-9]{10,15}"></div>
      <div class="field"><label>Canal o grupo de WhatsApp</label><input class="input" type="url" name="canalWhatsApp" value="${esc(c.canalWhatsApp)}"></div>
    </div>
    <div class="field"><label>Enlace a Praxia</label><input class="input" type="url" name="praxiaUrl" value="${esc(c.praxiaUrl)}"></div>
    <div class="row" style="justify-content:flex-end"><button class="btn btn--brand btn--pill-arrow">Guardar ajustes <span class="arrow"><i data-lucide="check" class="i"></i></span></button></div>
  </form>
  <div class="card card--pad stack" style="gap:10px;max-width:820px">
    <h3 class="admin-card-title">Quién puede entrar al admin</h3>
    <p style="font-size:var(--fs-sm)">Solo cuentas de TEC Capital con permiso de administrador en Firebase. El permiso no es una lista de correos en el código: se asigna a la cuenta con un comando del backend y se verifica en la app, en el servidor y en las reglas de la base de datos.</p>
    <pre class="code">cd api
node scripts/set-admin.mjs correo@teccapital.com</pre>
    <p class="faint" style="font-size:var(--fs-xs)">La persona debe cerrar sesión y volver a entrar para que el permiso aplique.</p>
  </div>
  <div class="card card--pad row" style="justify-content:space-between;max-width:820px">
    <div><strong>Modo de datos: ${Datos.modo === 'demo' ? 'demo' : 'conectado'}</strong><p class="faint" style="font-size:var(--fs-xs)">${Datos.modo === 'demo' ? 'Todo se guarda en este navegador. Restablecer borra tus cambios y vuelve a los datos iniciales.' : 'Conectado al backend.'}</p></div>
    ${Datos.modo === 'demo' ? '<button class="btn btn--danger" data-restablecer-demo><i data-lucide="rotate-ccw" class="i"></i>Restablecer demo</button>' : ''}
  </div>`;
}
