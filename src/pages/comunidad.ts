import { Comunidad, hace } from '../core/comunidad';
import { cursos, curso as getCurso } from '../core/catalogo';
import { BRAND } from '../core/brand';
import { Progreso } from '../core/progreso';
import { Datos } from '../core/datos';
import { Perfil } from '../core/perfil';
import { iniciales, esc, placeholder } from '../ui/partials';
import { envivoPanel, proximoEvento } from './envivo';
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

function tarjetaHilo(h: ReturnType<typeof Comunidad.hilos>[number], destacado = false) {
  const c = h.cursoId ? getCurso(h.cursoId) : null;
  const border = destacado ? 'border-left:3px solid var(--primary);' : '';
  const bg = destacado ? 'background:color-mix(in srgb,var(--primary) 3%,var(--surface));' : '';
  return `
  <a class="card card--pad card--hover" href="#/comunidad/${h.id}" style="display:grid;grid-template-columns:auto 1fr auto;gap:14px;align-items:start;color:inherit;border-radius:var(--r-xl);${border}${bg}">
    <div class="avatar" style="width:42px;height:42px">${iniciales(h.autor)}</div>
    <div class="stack" style="gap:5px">
      <div class="row" style="gap:8px;flex-wrap:wrap">
        ${destacado ? '<span class="chip chip--primary" style="height:20px;font-size:10px"><i data-lucide="pin" class="i" style="width:10px;height:10px"></i>Fijado</span>' : ''}
        <strong style="font-size:var(--fs-sm)">${esc(h.autor)}</strong>
        <span class="faint" style="font-size:11px">${hace(h.fecha)}</span>
        ${c ? `<span class="chip chip--outline" style="height:22px;font-size:10px">${esc(c.area)}</span>` : ''}
      </div>
      <div style="font-family:var(--font-display);font-weight:700;font-size:var(--fs-md)">${esc(h.titulo)}</div>
      <p class="muted" style="font-size:var(--fs-sm);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;line-height:1.5">${esc(h.texto)}</p>
    </div>
    <div style="display:flex;gap:12px;align-items:center;font-size:11px;color:var(--text-3)"><span class="row" style="gap:3px"><i data-lucide="message-circle" class="i" style="width:13px;height:13px"></i>${respuestasDe(h)}</span><span class="row" style="gap:3px"><i data-lucide="thumbs-up" class="i" style="width:13px;height:13px"></i>${h.util}</span></div>
  </a>`;
}

function foroPanel(filtro: string | null, hilos: ReturnType<typeof Comunidad.hilos>, opciones: string) {
  const destacado = hilos.find((h) => h.id === 'bienvenida');
  const resto = hilos.filter((h) => h.id !== 'bienvenida');

  return `
    <div style="display:grid;grid-template-columns:auto 1fr auto;gap:14px;align-items:center;padding:18px 20px;border-radius:var(--r-xl);background:var(--surface-2);border:1px dashed color-mix(in srgb,var(--primary) 25%,var(--line))">
      <div class="avatar" style="width:42px;height:42px;background:var(--primary-soft);color:var(--primary)">${Perfil.iniciales()}</div>
      <input class="input" placeholder="¿Tienes una duda clínica o un caso que compartir?" data-pregunta-rapida readonly style="cursor:pointer;border-radius:var(--r-lg)" />
      <button class="btn btn--brand btn--sm" data-nuevo-hilo style="border-radius:var(--r-lg)"><i data-lucide="plus" class="i"></i>Nuevo tema</button>
    </div>
    <form class="card card--pad stack" data-form-hilo hidden style="gap:12px">
      <h3>Nuevo tema</h3>
      <input class="input" name="titulo" placeholder="Título · ej. ¿Cómo manejan la sensibilidad post-blanqueamiento?" required maxlength="120">
      <textarea class="input" name="texto" rows="4" placeholder="Cuenta el caso o la duda. Sin datos que identifiquen al paciente." required style="padding:12px 14px;resize:vertical"></textarea>
      <div class="row" style="justify-content:space-between"><select class="input" name="cursoId" style="max-width:360px"><option value="">Tema general</option>${opciones}</select>
        <div class="row"><button type="button" class="btn btn--ghost" data-cancelar-hilo>Cancelar</button><button class="btn btn--brand">Publicar</button></div></div>
    </form>
    <div class="row" style="gap:8px;flex-wrap:wrap"><a class="chip ${!filtro ? 'chip--primary' : ''}" href="#/comunidad?tab=foro">Todos</a>${cursos.filter((c) => Comunidad.hilos(c.id).length).map((c) => `<a class="chip ${filtro === c.id ? 'chip--primary' : 'chip--outline'}" href="#/comunidad?tab=foro&curso=${c.id}">${esc(c.area)} · ${esc(c.titulo.slice(0, 28))}…</a>`).join('')}</div>
    <div class="stack" style="gap:12px">
      ${destacado ? tarjetaHilo(destacado, true) : ''}
      ${resto.length ? resto.map((h) => tarjetaHilo(h)).join('') : (!destacado ? '<div class="card card--pad" style="text-align:center;padding:48px"><h3>Aún no hay temas aquí</h3><p class="muted">Sé la primera en abrir uno.</p></div>' : '')}
    </div>
    ${Datos.modo === 'demo' ? '<p class="faint" style="font-size:var(--fs-xs)">Demo local: los temas se guardan únicamente en este dispositivo.</p>' : ''}`;
}

// ── Página principal ────────────────────────────────────────────────────────

export function comunidad(_: Record<string, string>, query: URLSearchParams) {
  const tab = query.get('tab') || 'foro';
  const filtro = query.get('curso');
  const hilos = filtro ? Comunidad.hilos(filtro) : Comunidad.hilos();
  const opciones = cursos.map((c) => `<option value="${c.id}">${esc(c.titulo)}</option>`).join('');

  const totalMiembros: number | string = Datos.modo === 'demo' ? MIEMBROS_DEMO.length + 1 : '—';
  const totalTemas = Comunidad.hilos().length;
  const totalResp = Comunidad.hilos().reduce((a, h) => a + respuestasDe(h), 0);
  const ev = proximoEvento();

  return `
  <section class="stack" style="gap:24px">
    <div style="border-radius:var(--r-2xl);background:var(--hero-gradient);padding:36px 40px;color:#fff;position:relative;overflow:hidden">
      <div style="position:absolute;inset:0;opacity:.08;background:url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2280%22 height=%2280%22><circle cx=%2240%22 cy=%2240%22 r=%2220%22 fill=%22none%22 stroke=%22%23fff%22 stroke-width=%222%22/></svg>') repeat"></div>
      <div style="position:relative;display:flex;justify-content:space-between;align-items:center;gap:24px;flex-wrap:wrap">
        <div>
          <span style="font-size:11px;text-transform:uppercase;letter-spacing:.12em;opacity:.7;display:flex;align-items:center;gap:6px"><i data-lucide="heart-pulse" class="i" style="width:13px;height:13px"></i>Comunidad OdonTeck</span>
          <h1 style="font-family:var(--font-display);font-size:clamp(1.5rem,3vw,2rem);font-weight:800;margin:6px 0 4px">Tu espacio <em>dental</em></h1>
          <p style="opacity:.7;font-size:var(--fs-sm)">Comparte casos, resuelve dudas y crece profesionalmente</p>
        </div>
        <div style="display:flex;gap:20px;align-items:center">
          ${[['users', totalMiembros, 'miembros'], ['messages-square', totalTemas, 'temas'], ['corner-down-right', totalResp, 'respuestas']].map(([ic, val, lab]) => `<div style="text-align:center"><div style="font-family:var(--font-display);font-size:var(--fs-xl);font-weight:800">${val}</div><span style="font-size:11px;opacity:.65;display:flex;align-items:center;gap:4px;justify-content:center"><i data-lucide="${ic}" class="i" style="width:11px;height:11px"></i>${lab}</span></div>`).join('<div style="width:1px;height:28px;background:rgba(255,255,255,.2)"></div>')}
        </div>
      </div>
    </div>
    <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px">
      <a class="card card--hover" href="${BRAND.canalWhatsApp}" target="_blank" rel="noopener" style="display:flex;gap:14px;align-items:center;padding:16px 18px;color:inherit;border-radius:var(--r-xl);border-top:4px solid #25d366">
        <span style="width:42px;height:42px;border-radius:12px;background:#25d366;color:#fff;display:grid;place-items:center;flex-shrink:0"><i data-lucide="message-circle" class="i" style="width:18px;height:18px"></i></span>
        <div style="flex:1;min-width:0"><strong style="font-size:var(--fs-sm)">Grupo de WhatsApp</strong><p class="faint" style="font-size:11px;margin-top:1px">Avisos y comunidad dental</p></div>
        <i data-lucide="arrow-up-right" class="i" style="width:16px;height:16px;color:var(--text-3);flex-shrink:0"></i>
      </a>
      <a class="card card--hover" href="#/praxia" style="display:flex;gap:14px;align-items:center;padding:16px 18px;color:inherit;border-radius:var(--r-xl);border-top:4px solid var(--primary)">
        <span style="width:42px;height:42px;border-radius:12px;background:var(--primary);color:#fff;display:grid;place-items:center;flex-shrink:0"><i data-lucide="brain" class="i" style="width:18px;height:18px"></i></span>
        <div style="flex:1;min-width:0"><strong style="font-size:var(--fs-sm)">Praxia Medical</strong><p class="faint" style="font-size:11px;margin-top:1px">Asistente clínico dental</p></div>
        <i data-lucide="arrow-right" class="i" style="width:16px;height:16px;color:var(--text-3);flex-shrink:0"></i>
      </a>
      ${ev ? `
      <a class="card card--hover" href="#/comunidad?tab=en-vivo" style="display:flex;gap:14px;align-items:center;padding:16px 18px;color:inherit;border-radius:var(--r-xl);border-top:4px solid var(--brand-navy)">
        <span style="width:42px;height:42px;border-radius:12px;background:var(--hero-gradient);color:#fff;display:grid;place-items:center;flex-shrink:0"><i data-lucide="radio" class="i" style="width:18px;height:18px"></i></span>
        <div style="flex:1;min-width:0"><strong style="font-size:var(--fs-sm)">${esc(ev.titulo.slice(0, 30))}</strong><p class="faint" style="font-size:11px;margin-top:1px">Próxima clase en vivo</p></div>
        <i data-lucide="arrow-right" class="i" style="width:16px;height:16px;color:var(--text-3);flex-shrink:0"></i>
      </a>` : `
      <a class="card card--hover" href="#/cursos" style="display:flex;gap:14px;align-items:center;padding:16px 18px;color:inherit;border-radius:var(--r-xl);border-top:4px solid var(--brand-teal)">
        <span style="width:42px;height:42px;border-radius:12px;background:var(--brand-teal);color:#fff;display:grid;place-items:center;flex-shrink:0"><i data-lucide="book-open" class="i" style="width:18px;height:18px"></i></span>
        <div style="flex:1;min-width:0"><strong style="font-size:var(--fs-sm)">${cursos.length} cursos</strong><p class="faint" style="font-size:11px;margin-top:1px">${Progreso.totalVistas()} clases vistas entre todos</p></div>
        <i data-lucide="arrow-right" class="i" style="width:16px;height:16px;color:var(--text-3);flex-shrink:0"></i>
      </a>`}
    </div>
    <div class="tabs">
      <a class="${tab === 'foro' ? 'chip--primary' : ''}" href="#/comunidad?tab=foro">
        <i data-lucide="messages-square" class="i" style="width:15px;height:15px"></i>Foro</a>
      <a class="${tab === 'en-vivo' ? 'chip--primary' : ''}" href="#/comunidad?tab=en-vivo">
        <i data-lucide="radio" class="i" style="width:15px;height:15px"></i>En vivo</a>
      <a class="${tab === 'actividad' ? 'chip--primary' : ''}" href="#/comunidad?tab=actividad">
        <i data-lucide="activity" class="i" style="width:15px;height:15px"></i>Actividad</a>
    </div>
    <div class="stack" style="gap:20px">
      ${tab === 'en-vivo' ? envivoPanel() : tab === 'foro' ? foroPanel(filtro, hilos, opciones) : actividadPanel()}
    </div>
  </section>`;
}

// ── Detalle de hilo ─────────────────────────────────────────────────────────

export function hilo(params: Record<string, string>) {
  const h = Comunidad.hilo(params.id);
  if (!h) return placeholder('Tema no encontrado', 'Puede que se haya borrado.', 'search-x');
  const c = h.cursoId ? getCurso(h.cursoId) : null;
  return `
  <section class="stack" style="gap:20px;max-width:820px">
    <a class="section-head__cta" href="#/comunidad?tab=foro" style="align-self:flex-start"><span class="circle-btn circle-btn--glass" style="width:34px;height:34px"><i data-lucide="arrow-left" class="i" style="width:15px;height:15px"></i></span>Comunidad</a>
    <article class="card card--pad stack" style="gap:16px;border-radius:var(--r-2xl);padding:28px">
      <div class="row" style="gap:12px"><div class="avatar" style="width:44px;height:44px">${iniciales(h.autor)}</div><div><strong>${esc(h.autor)}</strong><br><span class="faint" style="font-size:var(--fs-xs)">${hace(h.fecha)}${c ? ` · <a href="#/curso/${c.id}">${esc(c.titulo)}</a>` : ' · Tema general'}</span></div></div>
      <h1 class="display" style="font-size:var(--fs-xl)">${esc(h.titulo)}</h1>
      <p style="white-space:pre-wrap;line-height:1.65">${esc(h.texto)}</p>
      <div class="row" style="gap:12px;padding-top:4px;border-top:1px solid var(--line)"><button class="btn btn--secondary btn--sm" data-util="${h.id}" style="border-radius:var(--r-lg)"><i data-lucide="thumbs-up" class="i"></i>Útil · ${h.util}</button><span class="faint" style="font-size:var(--fs-xs)">${h.respuestas.length} respuestas</span></div>
    </article>
    <div class="stack" style="gap:10px">${h.respuestas.map((r) => `
      <div class="card card--pad" style="display:grid;grid-template-columns:auto 1fr;gap:14px;border-radius:var(--r-xl);padding:18px 20px"><div class="avatar" style="width:38px;height:38px;background:var(--surface-3);color:var(--text-2)">${iniciales(r.autor)}</div>
        <div><div class="row" style="gap:8px"><strong style="font-size:var(--fs-sm)">${esc(r.autor)}</strong><span class="faint" style="font-size:11px">${hace(r.fecha)}</span></div><p style="font-size:var(--fs-sm);margin-top:6px;white-space:pre-wrap;line-height:1.55">${esc(r.texto)}</p></div></div>`).join('')}</div>
    <form class="card card--pad stack" data-form-respuesta="${h.id}" style="gap:12px;border-radius:var(--r-2xl);padding:22px">
      <textarea class="input" name="texto" rows="3" placeholder="Escribe tu respuesta…" required style="padding:14px 16px;resize:vertical;border-radius:var(--r-lg)"></textarea>
      <div class="row" style="justify-content:flex-end"><button class="btn btn--brand btn--pill-arrow">Responder <span class="arrow"><i data-lucide="send" class="i"></i></span></button></div>
    </form>
  </section>`;
}
