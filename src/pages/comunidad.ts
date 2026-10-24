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
import { TIPOS_DOCUMENTO } from '../core/directorio-docs';
import { Directorio, type PerfilDirectorio, type OportunidadDirectorio, type DocumentoDirectorio } from '../core/directorio';
import { navigate } from '../core/router';

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
      ${portada ? `<img src="${esc(portada)}" alt="${esc(c?.titulo || h.titulo)}" loading="lazy" decoding="async">` : '<span class="community-post__mark"><i data-lucide="messages-square" class="i"></i>ODONTECK CLUB</span>'}
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

const etiqueta = (v: string) => esc(v.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase()));
const listaCSV = (v: string[]) => esc(v.join(', '));

function avatarProfesional(p: Pick<PerfilDirectorio, 'nombre' | 'foto'>, clase = '') {
  return `<span class="network-avatar ${clase}"><span aria-hidden="true">${ini(p.nombre)}</span>${p.foto ? `<img src="${esc(p.foto)}" alt="Foto de ${esc(p.nombre)}" width="720" height="720" loading="lazy" decoding="async" data-avatar-image>` : ''}</span>`;
}

const botonReportar = (tipo: 'perfil' | 'oportunidad', id: string, nombre: string) => `<button class="network-report" type="button" data-network-report data-type="${tipo}" data-id="${esc(id)}" data-name="${esc(nombre)}" aria-label="Denunciar ${tipo === 'perfil' ? 'perfil' : 'oportunidad'}"><i data-lucide="flag" class="i"></i></button>`;

function tarjetaPersona(p: PerfilDirectorio) {
  const tono = Math.abs([...p.uid].reduce((n, c) => n + c.charCodeAt(0), 0)) % 4;
  const especialidad = p.especialidades[0] || etiqueta(p.etapa);
  return `<article class="network-card network-person network-person--tone-${tono}" data-network-card data-uid="${esc(p.uid)}" data-href="#/directorio/perfil/${encodeURIComponent(p.uid)}" tabindex="0" aria-label="Ver el perfil completo de ${esc(p.nombre)}">
    <div class="network-person__portrait ${p.foto ? 'has-photo' : 'is-fallback'}">
      ${avatarProfesional(p, 'network-avatar--profile')}
      <span class="network-person__peek" aria-hidden="true"><i data-lucide="eye" class="i"></i>Ver perfil completo</span>
      <i data-lucide="sparkles" class="i network-person__watermark" aria-hidden="true"></i>
      <div class="network-person__badges"><span><i data-lucide="circle-dot" class="i"></i>${etiqueta(p.disponibilidad[0] || 'conectar')}</span>${p.esMio ? '<b>Tu perfil</b>' : '<b><i data-lucide="badge-check" class="i"></i>Verificado</b>'}</div>
    </div>
    <div class="network-person__body">
      <span class="network-person__specialty">${esc(especialidad)}</span>
      <div class="network-person__title"><h3>${esc(p.nombre)} <i data-lucide="badge-check" class="i" aria-label="Perfil de la comunidad OdonTeck"></i></h3>${p.esMio ? '<span class="network-own">Tu perfil</span>' : ''}</div>
      <p class="network-person__role">${esc(p.titular)}</p>
      <p class="network-bio">${esc(p.bio)}</p>
      <div class="network-meta"><span><i data-lucide="map-pin" class="i"></i>${esc([p.ciudad, p.estado].filter(Boolean).join(', ') || 'Ubicación abierta')}</span><span><i data-lucide="briefcase-business" class="i"></i>${etiqueta(p.etapa)}</span>${p.anosExperiencia ? `<span><i data-lucide="timer" class="i"></i>${p.anosExperiencia} ${p.anosExperiencia === 1 ? 'año' : 'años'}</span>` : ''}</div>
      <div class="network-tags">${[...p.especialidades, ...p.habilidades.slice(0, 2)].slice(0, 4).map((x) => `<span>${esc(x)}</span>`).join('')}</div>
      ${p.documentos?.length ? `<span class="network-person__docs"><i data-lucide="paperclip" class="i"></i>${p.documentos.length} ${p.documentos.length === 1 ? 'documento adjunto' : 'documentos adjuntos'}</span>` : ''}
    </div>
    <footer><div class="network-card__actions"><a class="btn btn--ghost btn--sm" href="#/directorio/perfil/${encodeURIComponent(p.uid)}"><i data-lucide="id-card" class="i"></i>Ver perfil</a>${p.esMio ? '<button class="btn btn--secondary btn--sm" data-network-profile><i data-lucide="pencil" class="i"></i>Editar</button>' : `${botonReportar('perfil', p.uid, p.nombre)}<button class="btn btn--brand btn--sm" data-network-connect data-uid="${esc(p.uid)}" data-name="${esc(p.nombre)}"><i data-lucide="user-plus" class="i"></i>Conectar</button>`}</div></footer>
  </article>`;
}

const tamanoLegible = (bytes: number) => !bytes ? '' : bytes < 1_000_000 ? `${Math.max(1, Math.round(bytes / 1000))} KB` : `${(bytes / 1_000_000).toFixed(1)} MB`;

function tarjetaDocumento(uid: string, d: DocumentoDirectorio, esMio: boolean) {
  const tipo = TIPOS_DOCUMENTO[d.tipo] ?? 'Documento';
  const detalle = [d.mime === 'application/pdf' ? (d.paginas ? `PDF · ${d.paginas} ${d.paginas === 1 ? 'pág.' : 'págs.'}` : 'PDF') : 'Imagen', tamanoLegible(d.bytes)].filter(Boolean).join(' · ');
  const visibilidad = d.visibilidad === 'conexiones'
    ? '<span class="dir-doc__vis is-private"><i data-lucide="lock" class="i"></i>Solo conexiones</span>'
    : '<span class="dir-doc__vis"><i data-lucide="users" class="i"></i>Miembros</span>';
  if (!d.accesible) {
    return `<article class="dir-doc is-locked">
      <div class="dir-doc__frame"><div class="dir-doc__lock"><i data-lucide="lock-keyhole" class="i"></i><b>Visible al conectar</b><small>Se desbloquea cuando acepte tu solicitud.</small></div></div>
      <div class="dir-doc__info"><span class="dir-doc__type">${esc(tipo)}</span><strong>${esc(d.nombre)}</strong><small>${esc(detalle)}</small></div>
    </article>`;
  }
  return `<article class="dir-doc">
    <button type="button" class="dir-doc__frame" data-doc-frame data-doc-open data-uid="${esc(uid)}" data-id="${esc(d.id)}" aria-label="Ampliar ${esc(d.nombre)}">
      <img alt="" data-doc-thumb data-uid="${esc(uid)}" data-id="${esc(d.id)}" decoding="async">
      <span class="dir-doc__skeleton" aria-hidden="true"><i data-lucide="${d.mime === 'application/pdf' ? 'file-text' : 'image'}" class="i"></i></span>
      <span class="dir-doc__zoom" aria-hidden="true"><i data-lucide="maximize-2" class="i"></i>Ampliar</span>
    </button>
    <div class="dir-doc__info"><span class="dir-doc__type">${esc(tipo)}</span><strong title="${esc(d.nombre)}">${esc(d.nombre)}</strong><small>${esc(detalle)}</small>
      <div class="dir-doc__foot">${visibilidad}${esMio ? `<span class="dir-doc__tools"><button type="button" data-doc-visibilidad data-id="${esc(d.id)}" data-valor="${d.visibilidad === 'conexiones' ? 'miembros' : 'conexiones'}" title="${d.visibilidad === 'conexiones' ? 'Mostrar a todos los miembros' : 'Mostrar solo a mis conexiones'}" aria-label="Cambiar quién puede verlo"><i data-lucide="${d.visibilidad === 'conexiones' ? 'eye' : 'eye-off'}" class="i"></i></button><button type="button" data-doc-quitar data-id="${esc(d.id)}" data-name="${esc(d.nombre)}" title="Quitar documento" aria-label="Quitar ${esc(d.nombre)}"><i data-lucide="trash-2" class="i"></i></button></span>` : ''}</div>
    </div>
  </article>`;
}

export function perfilDirectorio(params: Record<string, string>) {
  const uid = decodeURIComponent(params.uid || '');
  const data = Directorio.get();
  const ficha = Directorio.ficha(uid);
  if (!ficha) return `<section class="dir-profile-page"><a class="dir-back" href="#/directorio"><i data-lucide="arrow-left" class="i"></i>Volver al Directorio</a><div class="community-empty"><i data-lucide="user-round-x" class="i"></i><h3>Este perfil ya no está disponible</h3><p>Puede que la persona lo haya ocultado o retirado del directorio.</p><a class="btn btn--brand" href="#/directorio">Explorar perfiles</a></div></section>`;
  const p = ficha.perfil;
  const mio = data.miPerfil;
  const esMio = !!p.esMio;
  const tono = Math.abs([...p.uid].reduce((n, c) => n + c.charCodeAt(0), 0)) % 4;
  const especialidad = p.especialidades[0] || etiqueta(p.etapa);
  const experiencia = p.experiencia ?? [];
  const formacion = p.formacion ?? [];
  const credenciales = p.credenciales ?? [];
  const idiomas = p.idiomas ?? [];
  const docs = ficha.documentos;
  const norm = (x: string) => x.trim().toLocaleLowerCase('es-MX');
  const mias = new Set([...(mio?.especialidades ?? []), ...(mio?.habilidades ?? [])].map(norm));
  const compartidas = mio && !esMio ? [...new Set([...p.especialidades, ...p.habilidades])].filter((x) => mias.has(norm(x))) : [];
  const afinidad = !mio || esMio ? '' : `<div class="network-affinity ${compartidas.length ? '' : 'is-empty'}"><span class="network-affinity__icon"><i data-lucide="${compartidas.length ? 'sparkles' : 'compass'}" class="i"></i></span><div><strong>${compartidas.length ? `Tienen ${compartidas.length} ${compartidas.length === 1 ? 'área' : 'áreas'} en común` : 'Perfil complementario al tuyo'}</strong><p>${compartidas.length ? compartidas.map((x) => `<b>${esc(x)}</b>`).join('') : 'No comparten áreas declaradas: puede ser una buena alianza para referir pacientes o colaborar.'}</p></div></div>`;
  const primerNombre = esc(p.nombre.split(' ').slice(0, 2).join(' '));
  const ubicacion = esc([p.ciudad, p.estado].filter(Boolean).join(', ') || 'Ubicación abierta');
  const bloqueados = docs.filter((d) => !d.accesible).length;
  const documentos = `<section class="dir-docs" id="documentos">
    <header><div><span class="eyebrow">Trayectoria documentada</span><h4>Documentos y CV</h4><p>${esMio ? 'Adjunta tu CV, títulos, constancias o portafolio. Tú decides quién puede verlos.' : docs.length ? 'Toca un documento para verlo en grande.' : `${primerNombre} todavía no adjunta documentos.`}</p></div>${esMio ? `<span class="dir-docs__count">${docs.length}/6</span>` : ''}</header>
    ${bloqueados && !esMio ? `<p class="dir-docs__notice"><i data-lucide="shield-check" class="i"></i>${bloqueados === 1 ? 'Un documento se comparte' : `${bloqueados} documentos se comparten`} solo con conexiones aceptadas.</p>` : ''}
    <div class="dir-docs__grid">
      ${docs.map((d) => tarjetaDocumento(p.uid, d, esMio)).join('')}
      ${esMio && docs.length < 6 ? `<label class="dir-doc dir-doc--add"><input type="file" accept="application/pdf,image/jpeg,image/png,image/webp" data-doc-input hidden><span class="dir-doc__plus"><i data-lucide="file-up" class="i"></i></span><strong>Adjuntar documento</strong><small>PDF hasta 10 MB o imagen JPG, PNG o WebP</small></label>` : ''}
      ${!docs.length && !esMio ? '<div class="dir-docs__empty"><i data-lucide="folder-open" class="i"></i><span>Sin documentos por ahora</span></div>' : ''}
    </div>
  </section>`;
  return `<section class="dir-profile-page network-person--tone-${tono}">
    <a class="dir-back" href="#/directorio"><i data-lucide="arrow-left" class="i"></i>Volver al Directorio</a>
    <div class="dir-hero">
      <div class="dir-hero__cover network-profile-sheet__cover ${p.banner ? 'has-banner' : ''}">
        ${p.banner ? `<img src="${esc(p.banner)}" alt="Portada profesional de ${esc(p.nombre)}" width="1600" height="560" decoding="async">` : ''}
        <span><i data-lucide="badge-check" class="i"></i>Perfil profesional OdonTeck</span>
        ${esMio ? `<div class="dir-hero__edit"><label class="dir-chip-btn"><input type="file" accept="image/jpeg,image/png,image/webp" data-dir-banner-inline hidden><i data-lucide="image-up" class="i"></i>${p.banner ? 'Cambiar portada' : 'Agregar portada'}</label>${p.banner ? '<button type="button" class="dir-chip-btn" data-dir-banner-quitar><i data-lucide="image-minus" class="i"></i>Quitar</button>' : ''}</div>` : `<b>${etiqueta(p.disponibilidad[0] || 'conectar')}</b>`}
      </div>
      <div class="dir-hero__body">
        <div class="dir-hero__avatar">
          ${avatarProfesional(p, 'network-avatar--sheet')}
          ${esMio ? `<label class="dir-hero__camera" title="Cambiar foto"><input type="file" accept="image/jpeg,image/png,image/webp" data-dir-photo-inline hidden><i data-lucide="camera" class="i"></i><span class="sr-only">Cambiar foto</span></label>` : ''}
        </div>
        <div class="dir-hero__identity">
          <span class="network-person__specialty">${esc(especialidad)}</span>
          <h1>${esc(p.nombre)} <i data-lucide="badge-check" class="i" aria-label="Perfil de la comunidad OdonTeck"></i></h1>
          <p>${esc(p.titular)}</p>
          <div class="network-meta"><span><i data-lucide="map-pin" class="i"></i>${ubicacion}</span><span><i data-lucide="briefcase-business" class="i"></i>${etiqueta(p.etapa)}</span>${p.anosExperiencia ? `<span><i data-lucide="timer" class="i"></i>${p.anosExperiencia} ${p.anosExperiencia === 1 ? 'año' : 'años'} de experiencia</span>` : ''}</div>
        </div>
        <div class="dir-hero__actions">${esMio
          ? `<button class="btn btn--secondary" data-network-profile><i data-lucide="pencil" class="i"></i>Editar perfil</button>${p.foto ? '<button type="button" class="btn btn--ghost btn--sm" data-dir-photo-quitar>Quitar foto</button>' : ''}`
          : `${botonReportar('perfil', p.uid, p.nombre)}<button class="btn btn--brand" data-network-connect data-uid="${esc(p.uid)}" data-name="${esc(p.nombre)}"><i data-lucide="user-plus" class="i"></i>Conectar</button>`}</div>
      </div>
    </div>
    <div class="network-profile-sheet__metrics"><span><i data-lucide="timer" class="i"></i><strong>${p.anosExperiencia ?? '—'}</strong><small>años de experiencia</small></span><span><i data-lucide="briefcase-business" class="i"></i><strong>${experiencia.length}</strong><small>${experiencia.length === 1 ? 'experiencia' : 'experiencias'}</small></span><span><i data-lucide="graduation-cap" class="i"></i><strong>${formacion.length + credenciales.length}</strong><small>formación y credenciales</small></span><span><i data-lucide="paperclip" class="i"></i><strong>${docs.length}</strong><small>${docs.length === 1 ? 'documento' : 'documentos'}</small></span></div>
    ${afinidad}
    <div class="dir-profile-grid network-profile-sheet__content">
      <div class="dir-profile-main">
        <section class="dir-panel"><span class="eyebrow">Perfil profesional</span><h4>Sobre su práctica</h4><p class="dir-bio">${esc(p.bio)}</p>
        ${experiencia.length ? `<div class="network-profile-sheet__section"><strong>Experiencia</strong><div class="network-timeline">${experiencia.map((x) => `<article><span></span><div><small>${esc(x.periodo)}</small><h5>${esc(x.puesto)}</h5><b>${esc(x.organizacion)}</b>${x.descripcion ? `<p>${esc(x.descripcion)}</p>` : ''}</div></article>`).join('')}</div></div>` : ''}
        ${formacion.length ? `<div class="network-profile-sheet__section"><strong>Formación académica</strong><div class="network-profile-list">${formacion.map((x) => `<article><i data-lucide="graduation-cap" class="i"></i><div><h5>${esc(x.programa)}</h5><p>${esc(x.institucion)} · ${esc(x.periodo)}</p></div></article>`).join('')}</div></div>` : ''}
        </section>
        ${documentos}
      </div>
      <aside><span class="eyebrow">Afinidad profesional</span><h4>Disponible para</h4><div class="network-profile-sheet__availability">${p.disponibilidad.map((x) => `<span><i data-lucide="check-circle-2" class="i"></i>${etiqueta(x)}</span>`).join('')}</div><h4>Modalidad</h4><div class="network-profile-sheet__availability">${p.modalidades.map((x) => `<span><i data-lucide="map" class="i"></i>${etiqueta(x)}</span>`).join('')}</div>${credenciales.length ? `<h4>Credenciales</h4><div class="network-profile-credentials">${credenciales.map((x) => `<article><i data-lucide="award" class="i"></i><span><b>${esc(x.nombre)}</b><small>${esc([x.emisor, x.anio].filter(Boolean).join(' · '))}</small></span></article>`).join('')}</div>` : ''}${idiomas.length ? `<h4>Idiomas</h4><div class="network-profile-sheet__availability">${idiomas.map((x) => `<span><i data-lucide="languages" class="i"></i>${esc(x)}</span>`).join('')}</div>` : ''}<h4>Áreas y habilidades</h4><div class="network-tags">${[...p.especialidades, ...p.habilidades].map((x) => `<span>${esc(x)}</span>`).join('')}</div><p><i data-lucide="shield-check" class="i"></i>El contacto permanece privado hasta aceptar una conexión.</p>
      ${esMio ? '' : `<ol class="network-steps network-steps--stack" aria-label="Cómo funciona la conexión"><li><span>1</span><div><b>Envías tu solicitud</b><small>Con un mensaje breve de presentación.</small></div></li><li><span>2</span><div><b>${primerNombre} la revisa</b><small>Puede aceptarla o declinarla.</small></div></li><li><span>3</span><div><b>Se comparte el contacto</b><small>Y los documentos privados, solo entre ustedes.</small></div></li></ol>`}
      </aside>
    </div>
    ${esMio ? '' : `<div class="dir-sticky-cta"><div><strong>${primerNombre}</strong><small>${esc(p.titular)}</small></div>${botonReportar('perfil', p.uid, p.nombre)}<button class="btn btn--brand" data-network-connect data-uid="${esc(p.uid)}" data-name="${esc(p.nombre)}"><i data-lucide="send" class="i"></i>Enviar solicitud</button></div>`}
    ${Datos.modo === 'demo' ? '<p class="community-demo-note"><i data-lucide="monitor" class="i"></i>Perfil y documentos ficticios del prototipo local. Lo que adjuntes se guarda solo en este navegador.</p>' : ''}
    <dialog class="network-dialog network-dialog--small dir-doc-dialog" data-doc-dialog>
      <form method="dialog" data-doc-form>
        <header><div><span class="eyebrow">Nuevo documento</span><h3>Revisa cómo se verá</h3></div><button type="button" data-network-close aria-label="Cerrar"><i data-lucide="x" class="i"></i></button></header>
        <div class="dir-doc-dialog__preview"><img alt="Vista previa del documento" data-doc-preview><small data-doc-preview-info></small></div>
        <label>Nombre visible<input class="input" name="nombre" required maxlength="90" data-doc-nombre placeholder="Ej. CV 2026"></label>
        <label>Tipo<select class="input" name="tipo">${Object.entries(TIPOS_DOCUMENTO).map(([v, t]) => `<option value="${v}">${esc(t)}</option>`).join('')}</select></label>
        <fieldset class="dir-doc-dialog__vis"><legend>¿Quién puede verlo?</legend>
          <label><input type="radio" name="visibilidad" value="miembros" checked><span><b><i data-lucide="users" class="i"></i>Miembros del club</b><small>Cualquier miembro que visite tu perfil.</small></span></label>
          <label><input type="radio" name="visibilidad" value="conexiones"><span><b><i data-lucide="lock" class="i"></i>Solo conexiones</b><small>Recomendado si incluye teléfono, correo o domicilio.</small></span></label>
        </fieldset>
        <p class="dir-doc-dialog__hint"><i data-lucide="info" class="i"></i>No subas expedientes ni datos de pacientes.</p>
        <footer><button type="button" class="btn btn--ghost" data-network-close>Cancelar</button><button class="btn btn--brand"><i data-lucide="paperclip" class="i"></i>Adjuntar</button></footer>
      </form>
    </dialog>
    ${dialogosDirectorio()}
  </section>`;
}

function tarjetaOportunidad(o: OportunidadDirectorio) {
  return `<article class="network-card network-job">
    <header><span class="network-job__icon"><i data-lucide="${o.tipo === 'empleo' ? 'briefcase-business' : o.tipo === 'mentoria' ? 'graduation-cap' : 'handshake'}" class="i"></i></span><div><span class="eyebrow">${etiqueta(o.tipo)} · ${etiqueta(o.modalidad)}</span><h3>${esc(o.titulo)}</h3><p>${esc(o.organizacion)} · ${esc([o.ciudad, o.entidad].filter(Boolean).join(', ') || 'Ubicación flexible')}</p></div></header>
    <p class="network-bio">${esc(o.resumen)}</p>
    <div class="network-tags">${o.especialidades.map((x) => `<span>${esc(x)}</span>`).join('')}</div>
    <footer><small>Publicado por ${esc(o.autor)}</small><div class="network-card__actions">${o.esMia ? `<span class="network-own">Tu oportunidad</span>${o.estado === 'publicada' ? `<button class="btn btn--ghost btn--sm" data-network-close-job="${esc(o.id)}">Cerrar</button>` : ''}` : `${botonReportar('oportunidad', o.id, o.titulo)}<button class="btn btn--brand btn--sm" data-network-connect data-uid="${esc(o.autorUid)}" data-opportunity="${esc(o.id)}" data-name="${esc(o.autor)}">Me interesa</button>`}</div></footer>
  </article>`;
}

function completitudPerfil(p: PerfilDirectorio | null) {
  if (!p) return 0;
  const senales = [p.foto, p.banner, p.titular, p.bio, p.ciudad || p.estado, p.especialidades.length, p.habilidades.length, p.anosExperiencia !== null && p.anosExperiencia !== undefined, p.experiencia?.length, p.formacion?.length, p.credenciales?.length, p.idiomas?.length];
  return Math.round((senales.filter(Boolean).length / senales.length) * 100);
}

const filaExperiencia = (x: { puesto?: string; organizacion?: string; periodo?: string; descripcion?: string } = {}) => `<article class="network-repeat-row" data-network-repeat-row>
  <header><span><i data-lucide="briefcase-business" class="i"></i>Experiencia profesional</span><button type="button" data-network-remove-row aria-label="Quitar experiencia"><i data-lucide="trash-2" class="i"></i></button></header>
  <div><label>Puesto o función<input class="input" name="experienciaPuesto" value="${esc(x.puesto || '')}" required maxlength="100" placeholder="Odontóloga asociada"></label><label>Clínica u organización<input class="input" name="experienciaOrganizacion" value="${esc(x.organizacion || '')}" required maxlength="120" placeholder="Clínica Horizonte"></label><label>Periodo<input class="input" name="experienciaPeriodo" value="${esc(x.periodo || '')}" required maxlength="60" placeholder="2022 · Actualidad"></label><label class="network-form-wide">Qué hiciste y qué aportaste<textarea class="input" name="experienciaDescripcion" rows="2" maxlength="500" placeholder="Responsabilidades, enfoque y resultados sin datos de pacientes.">${esc(x.descripcion || '')}</textarea></label></div>
</article>`;

const filaFormacion = (x: { programa?: string; institucion?: string; periodo?: string } = {}) => `<article class="network-repeat-row" data-network-repeat-row>
  <header><span><i data-lucide="graduation-cap" class="i"></i>Formación académica</span><button type="button" data-network-remove-row aria-label="Quitar formación"><i data-lucide="trash-2" class="i"></i></button></header>
  <div><label>Programa o grado<input class="input" name="formacionPrograma" value="${esc(x.programa || '')}" required maxlength="120" placeholder="Especialidad en Ortodoncia"></label><label>Institución<input class="input" name="formacionInstitucion" value="${esc(x.institucion || '')}" required maxlength="120" placeholder="Universidad o institución"></label><label>Periodo<input class="input" name="formacionPeriodo" value="${esc(x.periodo || '')}" required maxlength="60" placeholder="2019 · 2021"></label></div>
</article>`;

const filaCredencial = (x: { nombre?: string; emisor?: string; anio?: string } = {}) => `<article class="network-repeat-row" data-network-repeat-row>
  <header><span><i data-lucide="award" class="i"></i>Curso o credencial</span><button type="button" data-network-remove-row aria-label="Quitar credencial"><i data-lucide="trash-2" class="i"></i></button></header>
  <div><label>Nombre<input class="input" name="credencialNombre" value="${esc(x.nombre || '')}" required maxlength="120" placeholder="Diplomado en flujo digital"></label><label>Emisor<input class="input" name="credencialEmisor" value="${esc(x.emisor || '')}" maxlength="120" placeholder="Institución"></label><label>Año<input class="input" name="credencialAnio" value="${esc(x.anio || '')}" maxlength="20" placeholder="2025"></label></div>
</article>`;

function directorioPanel(query: URLSearchParams) {
  const data = Directorio.get();
  const vista = query.get('vista') || 'personas';
  const q = (query.get('q') || '').trim().toLocaleLowerCase('es-MX');
  const coincide = (campos: unknown[]) => !q || campos.flat().join(' ').toLocaleLowerCase('es-MX').includes(q);
  const perfiles = data.perfiles.filter((p) => coincide([p.nombre, p.titular, p.especialidades, p.ciudad, p.estado, p.habilidades]));
  const oportunidades = data.oportunidades.filter((o) => coincide([o.titulo, o.tipo, o.organizacion, o.especialidades, o.ciudad, o.entidad]));
  const afinidades = [...new Set(data.perfiles.flatMap((p) => p.especialidades))].slice(0, 5);
  const pendientes = data.conexiones.filter((c) => c.estado === 'pendiente').length;
  const hayMas = vista === 'personas' ? data.paginacion?.perfiles.hayMas : vista === 'oportunidades' ? data.paginacion?.oportunidades.hayMas : false;
  return `<section class="network-directory">
    <div class="network-hero">
      <div class="network-hero__texture" aria-hidden="true"></div>
      <div class="network-hero__copy"><span class="eyebrow"><i data-lucide="network" class="i"></i>Red profesional OdonTeck</span><h2>Tu siguiente oportunidad puede empezar con una conversación.</h2><p>Descubre talento odontológico, comparte experiencia y crea alianzas con privacidad desde el primer contacto.</p><div class="network-hero__proof"><span>${data.perfiles.slice(0, 3).map((p) => avatarProfesional(p, 'network-avatar--mini')).join('')}</span><p><strong>${data.perfiles.length} perfiles profesionales</strong><br>Una comunidad enfocada en crecer juntos.</p></div></div>
      <div class="network-hero__actions"><button class="btn btn--secondary" data-network-profile><i data-lucide="contact" class="i"></i>${data.miPerfil ? 'Editar mi perfil' : 'Crear mi perfil'}</button><button class="btn btn--brand" data-network-job><i data-lucide="plus" class="i"></i>Publicar oportunidad</button></div>
    </div>
    <div class="network-toolbar">
      <nav><a class="${vista === 'personas' ? 'is-active' : ''}" href="#/directorio?vista=personas">Personas <span>${data.perfiles.length}</span></a><a class="${vista === 'oportunidades' ? 'is-active' : ''}" href="#/directorio?vista=oportunidades">Oportunidades <span>${data.oportunidades.length}</span></a><a class="${vista === 'conexiones' ? 'is-active' : ''}" href="#/directorio?vista=conexiones">Mis conexiones ${pendientes ? `<span>${pendientes}</span>` : ''}</a></nav>
      <form data-network-search><label><i data-lucide="search" class="i"></i><input name="q" value="${esc(query.get('q') || '')}" placeholder="Especialidad, ciudad o habilidad"><input type="hidden" name="vista" value="${esc(vista)}"></label></form>
    </div>
    ${vista === 'personas' ? `<div class="network-affinities"><span><i data-lucide="sparkles" class="i"></i>Explora por afinidad</span><a class="${!q ? 'is-active' : ''}" href="#/directorio?vista=personas">Todo</a>${afinidades.map((x) => `<a class="${q === x.toLocaleLowerCase('es-MX') ? 'is-active' : ''}" href="#/directorio?vista=personas&q=${encodeURIComponent(x)}">${esc(x)}</a>`).join('')}</div>` : ''}
    <div class="network-grid">
      ${vista === 'personas' ? (perfiles.length ? perfiles.map(tarjetaPersona).join('') : '<div class="community-empty"><i data-lucide="search-x" class="i"></i><h3>No encontramos perfiles</h3><p>Prueba con otra especialidad o ciudad.</p></div>') : ''}
      ${vista === 'oportunidades' ? (oportunidades.length ? oportunidades.map(tarjetaOportunidad).join('') : '<div class="community-empty"><i data-lucide="briefcase-business" class="i"></i><h3>No hay oportunidades con ese filtro</h3><p>Puedes publicar una nueva si eres miembro VIP.</p></div>') : ''}
      ${vista === 'conexiones' ? (data.conexiones.length ? data.conexiones.map((c) => `<article class="network-card network-request"><span class="network-avatar">${ini(c.otraPersona)}</span><div><span class="eyebrow">${c.esEntrante ? 'Solicitud recibida' : 'Solicitud enviada'}</span><h3>${esc(c.otraPersona)}</h3><p>${esc(c.mensaje)}</p>${c.contacto ? `<a class="network-contact" href="${c.contacto.canal === 'correo' ? `mailto:${esc(c.contacto.valor)}` : `https://wa.me/${esc(c.contacto.valor.replace(/\D/g, ''))}`}" target="_blank" rel="noopener"><i data-lucide="message-circle" class="i"></i>Contactar por ${etiqueta(c.contacto.canal)}</a>` : ''}</div><aside><span class="network-status network-status--${esc(c.estado)}">${etiqueta(c.estado)}</span>${c.esEntrante && c.estado === 'pendiente' ? `<button class="btn btn--brand btn--sm" data-network-answer="aceptada" data-id="${esc(c.id)}">Aceptar</button><button class="btn btn--ghost btn--sm" data-network-answer="rechazada" data-id="${esc(c.id)}">Declinar</button>` : ''}</aside></article>`).join('') : '<div class="community-empty"><i data-lucide="handshake" class="i"></i><h3>Aún no tienes solicitudes</h3><p>Explora perfiles u oportunidades para crear tu red.</p></div>') : ''}
    </div>
    ${hayMas ? `<div class="network-more"><button class="btn btn--secondary" data-network-load-more="${vista === 'personas' ? 'perfiles' : 'oportunidades'}"><i data-lucide="chevrons-down" class="i"></i>Cargar más ${vista}</button></div>` : ''}
    ${Datos.modo === 'demo' ? '<p class="community-demo-note"><i data-lucide="monitor" class="i"></i>Perfiles y oportunidades ficticios para visualizar el prototipo local.</p>' : ''}
    ${dialogosDirectorio()}
  </section>`;
}

function formularioPerfilDirectorio(data: ReturnType<typeof Directorio.get>) {
  return `<form method="dialog" data-network-profile-form>
        <header><div><span class="eyebrow">Perfil profesional</span><h3>Construye una presencia que cuente tu trayectoria.</h3><p>Tu ficha funcionará como un CV visual dentro de la red OdonTeck.</p></div><div class="network-profile-progress"><span><b>${completitudPerfil(data.miPerfil)}%</b> completo</span><i><b style="width:${completitudPerfil(data.miPerfil)}%"></b></i></div></header>
        <section class="network-banner-editor ${data.miPerfil?.banner ? 'has-banner' : ''}" data-network-banner-frame>
          ${data.miPerfil?.banner ? `<img src="${esc(data.miPerfil.banner)}" alt="Tu portada profesional" width="1600" height="560" loading="lazy" decoding="async" data-network-banner-preview>` : '<img alt="Tu portada profesional" data-network-banner-preview hidden>'}
          <div><span class="eyebrow"><i data-lucide="panel-top" class="i"></i>Portada de tu perfil</span><h4>Dale identidad a tu trayectoria.</h4><p>Usa una imagen horizontal de tu consultorio, espacio de trabajo o una composición profesional sin datos de pacientes.</p><span><label class="btn btn--secondary btn--sm"><i data-lucide="image-up" class="i"></i>${data.miPerfil?.banner ? 'Cambiar portada' : 'Subir portada'}<input type="file" accept="image/jpeg,image/png,image/webp" data-network-banner-input hidden></label><button type="button" class="btn btn--ghost btn--sm" data-network-banner-remove ${data.miPerfil?.banner ? '' : 'hidden'}>Quitar</button></span></div>
        </section>
        <section class="network-photo-editor">
          <div class="network-photo-editor__avatar" data-network-photo-frame><span data-network-photo-fallback>${ini(data.miPerfil?.nombre || Perfil.get().nombre)}</span>${data.miPerfil?.foto ? `<img src="${esc(data.miPerfil.foto)}" alt="Tu foto profesional" width="720" height="720" loading="lazy" decoding="async" data-network-photo-preview>` : '<img alt="Tu foto profesional" data-network-photo-preview hidden>'}<b><i data-lucide="camera" class="i"></i></b></div>
          <div class="network-photo-editor__copy"><span class="eyebrow">Tu imagen profesional</span><h4>Una foto cercana inspira confianza.</h4><p>La recortamos al centro y la optimizamos automáticamente. JPG, PNG o WebP de hasta 8 MB.</p><div><label class="btn btn--secondary btn--sm"><i data-lucide="upload" class="i"></i>${data.miPerfil?.foto ? 'Cambiar foto' : 'Subir foto'}<input type="file" accept="image/jpeg,image/png,image/webp" data-network-photo-input hidden></label><button type="button" class="btn btn--ghost btn--sm" data-network-photo-remove ${data.miPerfil?.foto ? '' : 'hidden'}>Quitar</button></div></div>
          <span class="network-photo-editor__privacy"><i data-lucide="eye" class="i"></i>Visible en tu tarjeta del directorio</span>
        </section>
        <div class="network-form-heading"><span>01</span><div><h4>Identidad profesional</h4><p>Una introducción clara ayuda a que las conexiones adecuadas te encuentren.</p></div></div>
        <div class="network-form-grid">
          <label>Titular profesional<input class="input" name="titular" value="${esc(data.miPerfil?.titular || '')}" required maxlength="100" placeholder="Odontóloga general · rehabilitación oral"></label>
          <label>Etapa<select class="input" name="etapa" required>${['estudiante','general','especialista','docente','investigador','otro'].map((x) => `<option value="${x}" ${data.miPerfil?.etapa === x ? 'selected' : ''}>${etiqueta(x)}</option>`).join('')}</select></label>
          <label>Especialidades<input class="input" name="especialidades" value="${listaCSV(data.miPerfil?.especialidades || [])}" placeholder="Ortodoncia, Endodoncia"></label>
          <label>Ciudad<input class="input" name="ciudad" value="${esc(data.miPerfil?.ciudad || '')}" placeholder="Puebla"></label>
          <label>Estado<input class="input" name="estado" value="${esc(data.miPerfil?.estado || '')}" placeholder="Puebla"></label>
          <label>Habilidades<input class="input" name="habilidades" value="${listaCSV(data.miPerfil?.habilidades || [])}" placeholder="Flujo digital, fotografía clínica"></label>
          <label>Años de experiencia<input class="input" type="number" name="anosExperiencia" min="0" max="70" value="${data.miPerfil?.anosExperiencia ?? ''}" placeholder="5"></label>
          <label>Idiomas<input class="input" name="idiomas" value="${listaCSV(data.miPerfil?.idiomas || [])}" placeholder="Español, Inglés"></label>
          <label class="network-form-wide">Presentación<textarea class="input" name="bio" rows="4" minlength="30" maxlength="600" required placeholder="Cuenta brevemente tu experiencia y el tipo de colaboración que buscas.">${esc(data.miPerfil?.bio || '')}</textarea></label>
          <fieldset class="network-form-wide"><legend>Disponible para</legend>${['empleo','colaboraciones','mentoria','suplencias','practicas','consultorio'].map((x) => `<label><input type="checkbox" name="disponibilidad" value="${x}" ${data.miPerfil?.disponibilidad.includes(x) ? 'checked' : ''}>${etiqueta(x)}</label>`).join('')}</fieldset>
          <label>Modalidad<select class="input" name="modalidad">${['presencial','remoto','hibrido'].map((x) => `<option value="${x}" ${data.miPerfil?.modalidades.includes(x) ? 'selected' : ''}>${etiqueta(x)}</option>`).join('')}</select></label>
        </div>
        <div class="network-form-heading"><span>02</span><div><h4>Experiencia</h4><p>Cuenta dónde has trabajado, qué haces y el valor que aportas. Máximo 8 registros.</p></div><button class="btn btn--secondary btn--sm" type="button" data-network-add-row="experiencia"><i data-lucide="plus" class="i"></i>Agregar</button></div>
        <div class="network-repeat-list" data-network-repeat-list="experiencia">${(data.miPerfil?.experiencia || []).map(filaExperiencia).join('')}</div>
        <template data-network-template="experiencia">${filaExperiencia()}</template>
        <div class="network-form-heading"><span>03</span><div><h4>Formación y credenciales</h4><p>Agrega grados, especialidades, diplomados y certificaciones relevantes.</p></div></div>
        <div class="network-repeat-split"><section><header><b>Formación académica</b><button class="btn btn--ghost btn--sm" type="button" data-network-add-row="formacion"><i data-lucide="plus" class="i"></i>Agregar</button></header><div class="network-repeat-list" data-network-repeat-list="formacion">${(data.miPerfil?.formacion || []).map(filaFormacion).join('')}</div></section><section><header><b>Cursos y credenciales</b><button class="btn btn--ghost btn--sm" type="button" data-network-add-row="credenciales"><i data-lucide="plus" class="i"></i>Agregar</button></header><div class="network-repeat-list" data-network-repeat-list="credenciales">${(data.miPerfil?.credenciales || []).map(filaCredencial).join('')}</div></section></div>
        <template data-network-template="formacion">${filaFormacion()}</template><template data-network-template="credenciales">${filaCredencial()}</template>
        <div class="network-form-heading"><span>04</span><div><h4>Privacidad y contacto</h4><p>Tu información de contacto nunca aparece en el perfil público.</p></div></div>
        <div class="network-form-grid network-form-grid--privacy">
          <label>Contacto privado<select class="input" name="contactoCanal"><option value="correo" ${data.miPerfil?.contacto?.canal !== 'whatsapp' ? 'selected' : ''}>Correo de mi cuenta</option><option value="whatsapp" ${data.miPerfil?.contacto?.canal === 'whatsapp' ? 'selected' : ''}>WhatsApp</option></select></label>
          <label data-network-whatsapp ${data.miPerfil?.contacto?.canal === 'whatsapp' ? '' : 'hidden'}>Número de WhatsApp<input class="input" name="contactoValor" value="${esc(data.miPerfil?.contacto?.canal === 'whatsapp' ? data.miPerfil.contacto.valor : '')}" placeholder="5212220000000"></label>
          <label class="network-visibility network-form-wide"><input type="checkbox" name="visible" value="1" ${data.miPerfil?.visible !== false ? 'checked' : ''}><span><strong>Mostrar mi perfil en el directorio</strong><small>Si lo desactivas, nadie podrá encontrarte ni enviarte nuevas solicitudes.</small></span></label>
        </div>
        <footer><div class="network-profile-controls"><p><i data-lucide="shield-check" class="i"></i>Tu contacto solo se comparte tras aceptar una conexión.</p>${data.miPerfil ? '<button class="network-delete-profile" type="button" data-network-delete-profile><i data-lucide="user-round-x" class="i"></i>Eliminar mi perfil del directorio</button>' : ''}</div><button class="btn btn--brand"><i data-lucide="badge-check" class="i"></i>Guardar perfil</button></footer>
      </form>`;
}

export function editarPerfilDirectorio() {
  const data = Directorio.get();
  return `
    <a class="section-head__cta" href="#/directorio" style="align-self:flex-start"><span class="circle-btn circle-btn--glass" style="width:34px;height:34px"><i data-lucide="arrow-left" class="i" style="width:15px;height:15px"></i></span>Volver al Directorio</a>
    <div class="card card--pad network-editor-page">${formularioPerfilDirectorio(data)}</div>`;
}

function dialogosDirectorio() {
  return `<dialog class="network-dialog" data-network-job-dialog><form method="dialog" data-network-job-form><header><div><span class="eyebrow">Nueva oportunidad</span><h3>Publica una propuesta clara y profesional.</h3></div><button type="button" data-network-close aria-label="Cerrar"><i data-lucide="x" class="i"></i></button></header><div class="network-form-grid"><label class="network-form-wide">Título<input class="input" name="titulo" required minlength="8" maxlength="120" placeholder="Odontólogo general para clínica multidisciplinaria"></label><label>Tipo<select class="input" name="tipo"><option value="empleo">Empleo</option><option value="colaboracion">Colaboración</option><option value="mentoria">Mentoría</option><option value="suplencia">Suplencia</option><option value="practicas">Prácticas</option><option value="consultorio">Compartir consultorio</option></select></label><label>Modalidad<select class="input" name="modalidad"><option value="presencial">Presencial</option><option value="remoto">Remoto</option><option value="hibrido">Híbrida</option></select></label><label>Organización<input class="input" name="organizacion" required maxlength="120"></label><label>Ciudad<input class="input" name="ciudad"></label><label>Estado<input class="input" name="entidad"></label><label>Especialidades<input class="input" name="especialidades" placeholder="Odontología general, Rehabilitación"></label><label class="network-form-wide">Descripción<textarea class="input" name="resumen" minlength="40" maxlength="1000" rows="4" required></textarea></label><label class="network-form-wide">Requisitos<textarea class="input" name="requisitos" maxlength="1000" rows="2"></textarea></label><label class="network-form-wide">Compensación o condiciones<input class="input" name="compensacion" maxlength="180" placeholder="Sé transparente; evita datos sensibles"></label></div><footer><p>Visible durante 45 días. Publicar requiere VIP.</p><button class="btn btn--brand">Publicar oportunidad</button></footer></form></dialog>
    <dialog class="network-dialog network-dialog--small" data-network-connect-dialog><form method="dialog" data-network-connect-form><header><div><span class="eyebrow">Solicitud privada</span><h3>Conectar con <span data-network-name>Colega</span></h3></div><button type="button" data-network-close aria-label="Cerrar"><i data-lucide="x" class="i"></i></button></header><input type="hidden" name="paraUid"><input type="hidden" name="oportunidadId"><label>Mensaje<textarea class="input" name="mensaje" required minlength="20" maxlength="500" rows="5" placeholder="Preséntate y explica por qué te gustaría conversar."></textarea></label><footer><p>La otra persona decide si comparte su contacto.</p><button class="btn btn--brand">Enviar solicitud</button></footer></form></dialog>
    <dialog class="network-dialog network-dialog--small" data-network-report-dialog><form method="dialog" data-network-report-form><header><div><span class="eyebrow">Comunidad segura</span><h3>Denunciar <span data-network-report-name>contenido</span></h3></div><button type="button" data-network-close aria-label="Cerrar"><i data-lucide="x" class="i"></i></button></header><input type="hidden" name="tipo"><input type="hidden" name="objetivoId"><div class="network-form-grid"><label class="network-form-wide">Motivo<select class="input" name="motivo" required><option value="spam">Spam o publicidad engañosa</option><option value="suplantacion">Suplantación de identidad</option><option value="contenido_inapropiado">Contenido inapropiado</option><option value="datos_falsos">Información profesional falsa</option><option value="otro">Otro motivo</option></select></label><label class="network-form-wide">Cuéntanos qué sucede<textarea class="input" name="detalle" maxlength="500" rows="4" placeholder="No incluyas datos clínicos ni información de pacientes."></textarea></label></div><footer><p><i data-lucide="shield-check" class="i"></i>El equipo revisará la denuncia; la otra persona no verá quién la envió.</p><button class="btn btn--brand"><i data-lucide="flag" class="i"></i>Enviar denuncia</button></footer></form></dialog>`;
}

// ── Página principal ────────────────────────────────────────────────────────

export function comunidad(_: Record<string, string>, query: URLSearchParams) {
  const tab = query.get('tab') || 'foro';
  if (tab === 'directorio') {
    const siguiente = new URLSearchParams(query);
    siguiente.delete('tab');
    queueMicrotask(() => navigate(`/directorio${siguiente.size ? `?${siguiente}` : ''}`));
    return '<section class="community-page"><div class="community-empty"><i data-lucide="loader-circle" class="i"></i><h3>Abriendo Directorio</h3><p>Ahora tiene su propio espacio dentro del Club.</p></div></section>';
  }
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
      ${tab === 'en-vivo' ? envivoPanel() : tab === 'actividad' ? actividadPanel() : foroPanel(filtro, areaFiltro, hilos, opciones)}
    </div>
  </section>`;
}

export function directorio(_: Record<string, string>, query: URLSearchParams) {
  return `<section class="directory-page" aria-label="Directorio profesional OdonTeck">${directorioPanel(query)}</section>`;
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
