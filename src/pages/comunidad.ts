import { Comunidad, hace } from '../core/comunidad';
import { cursos, curso as getCurso } from '../core/catalogo';
import { BRAND } from '../core/brand';
import { Progreso } from '../core/progreso';
import { Datos } from '../core/datos';
import { Perfil } from '../core/perfil';
import { Auth } from '../core/auth';
import { iniciales, esc, placeholder, avatarUsuario } from '../ui/partials';
import { envivoPanel } from './envivo';
import { puntos } from '../core/logros';

// ── Miembros simulados (demo) ──────────────────────────────────────────────
const MIEMBROS_DEMO = [
  { nombre: 'Dr. Carlos Mendoza', especialidad: 'Ortodoncia', desde: '2026-08-12' },
  { nombre: 'Dra. Ana Torres', especialidad: 'Endodoncia', desde: '2026-07-03' },
  { nombre: 'Dr. Luis Herrera', especialidad: 'Cirugía', desde: '2026-09-01' },
  { nombre: 'Dra. Sofía Reyes', especialidad: 'Odontopediatría', desde: '2026-08-20' },
  { nombre: 'Dr. Miguel Ángel Paz', especialidad: 'Periodoncia', desde: '2026-06-15' },
  { nombre: 'Dra. Valentina Cruz', especialidad: 'Prostodoncia', desde: '2026-09-10' },
  { nombre: 'Dr. Roberto Díaz', especialidad: 'Cariología', desde: '2026-07-28' },
  { nombre: 'Dra. Mariana López', especialidad: 'Endodoncia', desde: '2026-08-05' },
];

const ini = (nombre: string) => nombre.replace(/^(Dra?\.|Ing\.|Lic\.)\s*/i, '').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
const respuestasDe = (h: ReturnType<typeof Comunidad.hilos>[number]) => h.respuestasTotal ?? h.respuestas.length;

// ── Feed de actividad ──────────────────────────────────────────────────────
interface Actividad {
  icon: string;
  color: string;
  html: string;
  fecha: string;
  avatar?: string;
}

function generarActividad(): Actividad[] {
  const items: Actividad[] = [];

  for (const h of Comunidad.hilos()) {
    items.push({
      icon: 'message-circle', color: 'primary', avatar: ini(h.autor),
      html: `<strong>${esc(h.autor)}</strong> abrió el tema <a href="#/comunidad/${h.id}" style="color:var(--primary)">${esc(h.titulo.slice(0, 50))}</a>`,
      fecha: h.fecha,
    });
    for (const r of h.respuestas.slice(-5)) {
      items.push({
        icon: 'corner-down-right', color: 'accent', avatar: ini(r.autor),
        html: `<strong>${esc(r.autor)}</strong> respondió en <a href="#/comunidad/${h.id}" style="color:var(--primary)">${esc(h.titulo.slice(0, 40))}</a>`,
        fecha: r.fecha,
      });
    }
  }

  for (const ev of Datos.eventos().filter((e) => e.publicado !== false)) {
    items.push({
      icon: 'radio', color: 'brand',
      html: `Clase en vivo programada: <strong>${esc(ev.titulo)}</strong> con ${esc(ev.ponente)}`,
      fecha: ev.fecha,
    });
  }

  if (Datos.modo === 'demo') {
    // Actividad ficticia visible únicamente en el recorrido local.
    items.push(
      { icon: 'user-plus', color: 'accent', avatar: ini(MIEMBROS_DEMO[0].nombre), html: `<strong>${esc(MIEMBROS_DEMO[0].nombre)}</strong> se unió al club`, fecha: '2026-09-20T14:30:00Z' },
      { icon: 'user-plus', color: 'accent', avatar: ini(MIEMBROS_DEMO[5].nombre), html: `<strong>${esc(MIEMBROS_DEMO[5].nombre)}</strong> se unió al club`, fecha: '2026-09-18T09:15:00Z' },
      { icon: 'check-circle', color: 'primary', avatar: ini(MIEMBROS_DEMO[1].nombre), html: `<strong>${esc(MIEMBROS_DEMO[1].nombre)}</strong> completó <em>Diagnóstico en Ortodoncia</em>`, fecha: '2026-09-22T10:00:00Z' },
      { icon: 'check-circle', color: 'primary', avatar: ini(MIEMBROS_DEMO[6].nombre), html: `<strong>${esc(MIEMBROS_DEMO[6].nombre)}</strong> completó <em>Diagnóstico de Caries</em>`, fecha: '2026-09-19T16:45:00Z' },
      { icon: 'award', color: 'brand', avatar: ini(MIEMBROS_DEMO[4].nombre), html: `<strong>${esc(MIEMBROS_DEMO[4].nombre)}</strong> obtuvo el logro <em>Especialista</em>`, fecha: '2026-09-21T11:20:00Z' },
      { icon: 'flame', color: 'brand', avatar: ini(MIEMBROS_DEMO[3].nombre), html: `<strong>${esc(MIEMBROS_DEMO[3].nombre)}</strong> lleva 5 semanas seguidas estudiando`, fecha: '2026-09-23T08:00:00Z' },
      { icon: 'star', color: 'accent', avatar: ini(MIEMBROS_DEMO[7].nombre), html: `<strong>${esc(MIEMBROS_DEMO[7].nombre)}</strong> recomendó el curso de <em>Endodoncia Pediátrica</em>`, fecha: '2026-09-17T13:10:00Z' },
      { icon: 'book-open', color: 'primary', avatar: ini(MIEMBROS_DEMO[2].nombre), html: `<strong>${esc(MIEMBROS_DEMO[2].nombre)}</strong> empezó <em>Extracciones Simples</em>`, fecha: '2026-09-24T07:30:00Z' },
    );
  }

  const progUser = Progreso.completados();
  for (const c of progUser) {
    items.push({
      icon: 'award', color: 'brand', avatar: Perfil.iniciales(),
      html: `<strong>Tú</strong> completaste <em>${esc(c.titulo)}</em>`,
      fecha: Progreso.de(c.id).actualizado || '2026-09-25T00:00:00Z',
    });
  }

  items.sort((a, b) => b.fecha.localeCompare(a.fecha));
  return items;
}

// ── Panels ──────────────────────────────────────────────────────────────────

function actividadPanel() {
  const actividades = generarActividad();
  const miembrosVisibles = Datos.modo === 'demo' ? MIEMBROS_DEMO : [];
  const totalMiembros: number | string = Datos.modo === 'demo' ? MIEMBROS_DEMO.length + 1 : '—';
  const totalRespuestas = Comunidad.hilos().reduce((a, h) => a + respuestasDe(h), 0);

  return `
    <div class="grid" style="grid-template-columns:1fr 300px;gap:24px;align-items:start">
      <div class="stack" style="gap:0">
        ${actividades.length ? actividades.slice(0, 15).map((a, i) => `
        <div style="display:grid;grid-template-columns:36px 1fr auto;gap:12px;padding:14px 16px;align-items:center;border-radius:var(--r-lg);${i % 2 === 0 ? 'background:var(--surface-2)' : ''}">
          <div class="avatar" style="width:36px;height:36px;font-size:12px;background:var(--${a.color}-soft);color:var(--${a.color})">${a.avatar || `<i data-lucide="${a.icon}" class="i" style="width:15px;height:15px"></i>`}</div>
          <div style="font-size:var(--fs-sm);line-height:1.5">${a.html}</div>
          <span class="faint" style="font-size:11px;white-space:nowrap">${hace(a.fecha)}</span>
        </div>`).join('') : '<div class="card card--pad" style="text-align:center;padding:40px"><p class="muted">Sin actividad todavía.</p></div>'}
      </div>
      <div class="stack" style="gap:14px">
        <div class="card card--pad stack" style="gap:14px;border-radius:var(--r-2xl)">
          <div class="row" style="gap:8px"><span style="width:32px;height:32px;border-radius:10px;background:var(--primary-soft);color:var(--primary);display:grid;place-items:center"><i data-lucide="users" class="i" style="width:15px;height:15px"></i></span><strong style="font-size:var(--fs-sm)">Miembros activos</strong></div>
          <div style="display:flex;flex-wrap:wrap;gap:6px">
            <div class="avatar" style="width:40px;height:40px;font-size:12px;border:2px solid var(--primary)">${Perfil.iniciales()}</div>
            ${miembrosVisibles.map((m) => `<div class="avatar" style="width:40px;height:40px;font-size:12px" title="${esc(m.nombre)} · ${esc(m.especialidad)}">${ini(m.nombre)}</div>`).join('')}
          </div>
          <p class="faint" style="font-size:11px">${totalMiembros} miembros · ${totalRespuestas} respuestas en el foro</p>
        </div>
        <div class="card card--pad stack" style="gap:12px;border-radius:var(--r-2xl)">
          <div class="row" style="gap:8px"><span style="width:32px;height:32px;border-radius:10px;background:var(--accent-soft);color:var(--accent);display:grid;place-items:center"><i data-lucide="trophy" class="i" style="width:15px;height:15px"></i></span><strong style="font-size:var(--fs-sm)">Tu resumen</strong></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            ${[['primary', Progreso.totalVistas(), 'clases vistas'], ['accent', Progreso.completados().length, 'certificados'], ['brand-teal', Comunidad.misHilos().length, 'temas tuyos'], ['text', puntos(), 'puntos']].map(([c, v, l]) => `<div style="padding:12px;text-align:center;border-radius:var(--r-lg);background:var(--surface-2)"><div style="font-size:var(--fs-lg);font-weight:700;color:var(--${c})">${v}</div><span class="faint" style="font-size:11px">${l}</span></div>`).join('')}
          </div>
          <a class="btn btn--sm btn--secondary" href="#/logros" style="width:100%;justify-content:center"><i data-lucide="flame" class="i"></i>Ver logros</a>
        </div>
        <div style="border-radius:var(--r-2xl);padding:20px;background:linear-gradient(135deg,color-mix(in srgb,var(--brand-navy) 8%,var(--surface)),color-mix(in srgb,var(--brand-teal) 6%,var(--surface)));border:1px solid color-mix(in srgb,var(--brand-teal) 15%,var(--line))">
          <div class="row" style="gap:8px;margin-bottom:8px"><i data-lucide="lightbulb" class="i" style="width:15px;height:15px;color:var(--brand-teal)"></i><strong style="font-size:var(--fs-xs);color:var(--brand-teal)">Tip de la comunidad</strong></div>
          <p style="font-size:var(--fs-sm);color:var(--text-2);line-height:1.55">Comparte tus casos clínicos sin datos que identifiquen al paciente. Así todos aprendemos de la experiencia real.</p>
        </div>
      </div>
    </div>`;
}

type HiloComunidad = ReturnType<typeof Comunidad.hilos>[number];

const avatarMiembro = (nombre: string, foto?: string | null, clases = 'community-avatar') =>
  avatarUsuario(foto, iniciales(nombre), clases);

function tarjetaHilo(h: HiloComunidad, destacado = false) {
  const c = h.cursoId ? getCurso(h.cursoId) : null;
  const portada = c?.banner || c?.portada;
  const area = c?.area || 'General';
  const respuestas = respuestasDe(h);
  return `
  <article class="community-post ${destacado ? 'community-post--pinned' : ''}">
    <header class="community-post__head">
      ${avatarMiembro(h.autor)}
      <a href="#/comunidad/${h.id}" class="community-post__identity"><strong>${esc(h.autor)}</strong><span>${esc(area)} · ${hace(h.fecha)}</span></a>
      ${destacado ? '<span class="community-post__pin"><i data-lucide="pin" class="i"></i>Fijado</span>' : '<button class="community-icon-btn" aria-label="Más opciones"><i data-lucide="ellipsis" class="i"></i></button>'}
    </header>
    <a href="#/comunidad/${h.id}" class="community-post__visual ${portada ? '' : 'community-post__visual--brand'}">
      ${portada ? `<img src="${esc(portada)}" alt="${esc(c?.titulo || h.titulo)}" loading="lazy">` : '<span class="community-post__mark"><i data-lucide="messages-square" class="i"></i>ODONTECK CLUB</span>'}
      <span class="community-post__shade"></span>
      <span class="community-post__visual-copy"><small>${esc(area)}</small><strong>${esc(h.titulo)}</strong></span>
    </a>
    <div class="community-post__actions">
      <button class="community-post__action ${h.marcadoUtil ? 'is-active' : ''}" data-util="${h.id}" aria-label="Marcar como útil"><i data-lucide="heart" class="i"></i></button>
      <a class="community-post__action" href="#/comunidad/${h.id}" aria-label="Ver comentarios"><i data-lucide="message-circle" class="i"></i></a>
      <button class="community-post__action" data-compartir data-compartir-url="#/comunidad/${h.id}" aria-label="Compartir publicación"><i data-lucide="send" class="i"></i></button>
      <a class="community-post__action community-post__save" href="#/comunidad/${h.id}" aria-label="Guardar publicación"><i data-lucide="bookmark" class="i"></i></a>
    </div>
    <div class="community-post__body">
      <strong>${h.util} ${h.util === 1 ? 'persona lo encontró útil' : 'personas lo encontraron útil'}</strong>
      <p><b>${esc(h.autor)}</b> ${esc(h.texto)}</p>
      <a href="#/comunidad/${h.id}">${respuestas ? `Ver ${respuestas === 1 ? 'la respuesta' : `las ${respuestas} respuestas`}` : 'Inicia la conversación'}</a>
    </div>
  </article>`;
}

function historiasPanel(hilos: HiloComunidad[]) {
  const historias = hilos.filter((h) => h.id !== 'bienvenida').filter((h, i, lista) => lista.findIndex((x) => x.autor === h.autor) === i).slice(0, 6);
  return `<div class="community-stories" aria-label="Historias de la comunidad">
    <button class="community-story community-story--mine" data-nuevo-hilo>
      <span class="community-story__ring">${avatarMiembro(Perfil.get().nombre, Auth.usuario?.foto, 'community-story__avatar')}<i data-lucide="plus" class="i"></i></span>
      <small>Tu caso</small>
    </button>
    ${historias.map((h) => { const c = h.cursoId ? getCurso(h.cursoId) : null; return `<a class="community-story" href="#/comunidad/${h.id}">
      <span class="community-story__ring">${avatarMiembro(h.autor, null, 'community-story__avatar')}</span>
      <small>${esc(c?.area || h.autor.split(' ')[1] || 'General')}</small>
    </a>`; }).join('')}
  </div>`;
}

function comunidadAside(hilos: HiloComunidad[]) {
  const actividad = generarActividad().slice(0, 3);
  const porArea = new Map<string, number>();
  for (const h of Comunidad.hilos()) {
    const area = h.cursoId ? getCurso(h.cursoId)?.area || 'General' : 'General';
    porArea.set(area, (porArea.get(area) || 0) + 1);
  }
  const explorar = [...porArea.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  const perfil = Perfil.get();
  return `<aside class="community-aside">
    <div class="community-profile-mini">
      ${avatarMiembro(perfil.nombre, Auth.usuario?.foto, 'community-profile-mini__avatar')}
      <div><strong>${esc(perfil.nombre)}</strong><span>${esc(perfil.especialidad || Perfil.planNombre())}</span></div>
      <a href="#/perfil">Ver perfil</a>
    </div>
    <section class="community-side-card">
      <header><div><span class="eyebrow">Al día</span><h3>Actividad</h3></div><a href="#/comunidad?tab=actividad">Ver todo</a></header>
      <div class="community-activity-list">${actividad.length ? actividad.map((a) => `<div class="community-activity-item"><span class="community-activity-item__avatar">${a.avatar || `<i data-lucide="${a.icon}" class="i"></i>`}</span><div>${a.html}<small>${hace(a.fecha)}</small></div></div>`).join('') : '<p class="community-side-empty">Todavía no hay actividad reciente.</p>'}</div>
    </section>
    <section class="community-side-card">
      <header><div><span class="eyebrow">Descubre</span><h3>Explorar</h3></div><span>${hilos.length} publicaciones</span></header>
      <div class="community-explore">${explorar.length ? explorar.map(([area, total]) => `<a href="${area === 'General' ? '#/comunidad?tab=foro' : `#/comunidad?tab=foro&area=${encodeURIComponent(area)}`}"><span><i data-lucide="${area === 'General' ? 'sparkles' : 'stethoscope'}" class="i"></i></span><strong>${esc(area)}</strong><small>${total}</small></a>`).join('') : '<p class="community-side-empty">Las áreas aparecerán cuando haya publicaciones.</p>'}</div>
    </section>
    <div class="community-safety"><i data-lucide="shield-check" class="i"></i><p><strong>Comparte con criterio clínico.</strong><span>Sin nombres, rostros ni datos que identifiquen pacientes.</span></p></div>
    <nav class="community-quick-links"><a href="${BRAND.canalWhatsApp}" target="_blank" rel="noopener">WhatsApp</a><a href="#/praxia">Praxia</a><a href="#/comunidad?tab=en-vivo">En vivo</a></nav>
  </aside>`;
}

function foroPanel(filtro: string | null, areaFiltro: string | null, hilos: HiloComunidad[], opciones: string) {
  const destacado = hilos.find((h) => h.id === 'bienvenida');
  const resto = hilos.filter((h) => h.id !== 'bienvenida');
  const filtros = [...new Set(cursos.filter((c) => Comunidad.hilos(c.id).length).map((c) => c.area))];
  return `
    <div class="community-layout">
      <main class="community-feed">
        <div class="community-composer">
          ${avatarMiembro(Perfil.get().nombre, Auth.usuario?.foto)}
          <button data-pregunta-rapida>Comparte una duda, aprendizaje o caso clínico…</button>
          <button class="btn btn--brand" data-nuevo-hilo><i data-lucide="plus" class="i"></i>Publicar</button>
        </div>
        <form class="community-create" data-form-hilo hidden>
          <header><div><span class="eyebrow">Nueva publicación</span><h3>Comparte con la comunidad</h3></div><button type="button" class="community-icon-btn" data-cancelar-hilo aria-label="Cerrar"><i data-lucide="x" class="i"></i></button></header>
          <input class="input" name="titulo" placeholder="Título · ej. ¿Cómo manejan la sensibilidad post-blanqueamiento?" required maxlength="120">
          <textarea class="input" name="texto" rows="4" placeholder="Cuenta el caso o la duda. Sin datos que identifiquen al paciente." required></textarea>
          <footer><select class="input" name="cursoId"><option value="">Tema general</option>${opciones}</select><div><button type="button" class="btn btn--ghost" data-cancelar-hilo>Cancelar</button><button class="btn btn--brand"><i data-lucide="send" class="i"></i>Publicar</button></div></footer>
        </form>
        ${historiasPanel(hilos)}
        <div class="community-feed-tools">
          <div class="community-filters"><a class="${!filtro && !areaFiltro ? 'is-active' : ''}" href="#/comunidad?tab=foro">Todo</a>${filtros.map((area) => `<a class="${areaFiltro === area ? 'is-active' : ''}" href="#/comunidad?tab=foro&area=${encodeURIComponent(area)}">${esc(area)}</a>`).join('')}</div>
          <span><i data-lucide="sliders-horizontal" class="i"></i>Más recientes</span>
        </div>
        <div class="community-post-list">
          ${destacado && !filtro ? tarjetaHilo(destacado, true) : ''}
          ${resto.length ? resto.map((h) => tarjetaHilo(h)).join('') : (!destacado ? '<div class="community-empty"><i data-lucide="images" class="i"></i><h3>Aún no hay publicaciones aquí</h3><p>Abre la primera conversación de esta especialidad.</p><button class="btn btn--brand" data-nuevo-hilo>Crear publicación</button></div>' : '')}
        </div>
        ${Datos.modo === 'demo' ? '<p class="community-demo-note"><i data-lucide="monitor" class="i"></i>Vista demo: las publicaciones se guardan únicamente en este dispositivo.</p>' : ''}
      </main>
      ${comunidadAside(hilos)}
    </div>`;
}

// ── Página principal ────────────────────────────────────────────────────────

export function comunidad(_: Record<string, string>, query: URLSearchParams) {
  const tab = query.get('tab') || 'foro';
  const filtro = query.get('curso');
  const areaFiltro = query.get('area');
  const hilos = filtro
    ? Comunidad.hilos(filtro)
    : areaFiltro
      ? Comunidad.hilos().filter((h) => h.cursoId && getCurso(h.cursoId)?.area === areaFiltro)
      : Comunidad.hilos();
  const opciones = cursos.map((c) => `<option value="${c.id}">${esc(c.titulo)}</option>`).join('');

  const totalTemas = Comunidad.hilos().length;
  const totalResp = Comunidad.hilos().reduce((a, h) => a + respuestasDe(h), 0);

  return `
  <section class="community-page">
    <header class="community-page__head">
      <div><span class="eyebrow"><i data-lucide="heart-pulse" class="i"></i>Comunidad OdonTeck</span><h1>La clínica también se aprende <em>en comunidad.</em></h1><p>Comparte criterios, casos y aprendizajes con colegas del Club.</p></div>
      <div class="community-page__stats"><span><strong>${totalTemas}</strong>publicaciones</span><span><strong>${totalResp}</strong>respuestas</span><button class="btn btn--brand" data-nuevo-hilo><i data-lucide="plus" class="i"></i>Crear publicación</button></div>
    </header>
    <nav class="community-tabs" aria-label="Secciones de Comunidad">
      <a class="${tab === 'foro' ? 'is-active' : ''}" href="#/comunidad?tab=foro"><i data-lucide="layout-grid" class="i"></i>Feed</a>
      <a class="${tab === 'en-vivo' ? 'is-active' : ''}" href="#/comunidad?tab=en-vivo"><i data-lucide="radio" class="i"></i>En vivo</a>
      <a class="${tab === 'actividad' ? 'is-active' : ''}" href="#/comunidad?tab=actividad"><i data-lucide="activity" class="i"></i>Actividad</a>
    </nav>
    <div class="community-view">
      ${tab === 'en-vivo' ? envivoPanel() : tab === 'foro' ? foroPanel(filtro, areaFiltro, hilos, opciones) : actividadPanel()}
    </div>
  </section>`;
}

// ── Detalle de hilo ─────────────────────────────────────────────────────────

export function hilo(params: Record<string, string>) {
  const h = Comunidad.hilo(params.id);
  if (!h) return placeholder('Tema no encontrado', 'Puede que se haya borrado.', 'search-x');
  const c = h.cursoId ? getCurso(h.cursoId) : null;
  const portada = c?.banner || c?.portada;
  return `
  <section class="community-detail">
    <a class="community-detail__back" href="#/comunidad?tab=foro"><i data-lucide="arrow-left" class="i"></i>Volver al feed</a>
    <article class="community-detail__shell">
      <div class="community-detail__media ${portada ? '' : 'community-post__visual--brand'}">
        ${portada ? `<img src="${esc(portada)}" alt="${esc(c?.titulo || h.titulo)}">` : '<span class="community-post__mark"><i data-lucide="messages-square" class="i"></i>ODONTECK CLUB</span>'}
        <span class="community-post__shade"></span>
        <span class="community-post__visual-copy"><small>${esc(c?.area || 'General')}</small><h1>${esc(h.titulo)}</h1></span>
      </div>
      <div class="community-detail__conversation">
        <header>${avatarMiembro(h.autor)}<div><strong>${esc(h.autor)}</strong><span>${c ? esc(c.area) : 'General'} · ${hace(h.fecha)}</span></div><button class="community-icon-btn" data-compartir data-compartir-url="#/comunidad/${h.id}" aria-label="Compartir"><i data-lucide="send" class="i"></i></button></header>
        <div class="community-detail__caption">${avatarMiembro(h.autor)}<p><strong>${esc(h.autor)}</strong> ${esc(h.texto)}</p></div>
        <div class="community-detail__comments">${h.respuestas.length ? h.respuestas.map((r) => `<div class="community-detail__comment">${avatarMiembro(r.autor)}<p><strong>${esc(r.autor)}</strong> ${esc(r.texto)}<small>${hace(r.fecha)}</small></p></div>`).join('') : '<div class="community-detail__empty"><i data-lucide="message-circle" class="i"></i><strong>Abre la conversación</strong><span>Sé la primera persona en aportar otro punto de vista.</span></div>'}</div>
        <div class="community-detail__actions"><button class="community-post__action ${h.marcadoUtil ? 'is-active' : ''}" data-util="${h.id}" aria-label="Marcar como útil"><i data-lucide="heart" class="i"></i></button><span><strong>${h.util}</strong> lo encontraron útil</span></div>
        <form class="community-detail__reply" data-form-respuesta="${h.id}"><textarea class="input" name="texto" rows="2" placeholder="Aporta una respuesta…" required></textarea><button class="btn btn--brand" aria-label="Responder"><i data-lucide="send" class="i"></i><span>Responder</span></button></form>
      </div>
    </article>
  </section>`;
}
