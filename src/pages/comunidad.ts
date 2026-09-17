import { Comunidad, hace } from '../core/comunidad';
import { cursos, curso as getCurso } from '../core/catalogo';
import { BRAND, wa } from '../core/brand';
import { iniciales } from '../ui/partials';
import { esc, placeholder } from '../ui/partials';

function tarjetaHilo(h: ReturnType<typeof Comunidad.hilos>[number]) {
  const c = h.cursoId ? getCurso(h.cursoId) : null;
  return `
  <a class="card card--pad card--hover" href="#/comunidad/${h.id}" style="display:grid;grid-template-columns:auto 1fr auto;gap:14px;align-items:start;color:inherit">
    <div class="avatar">${iniciales(h.autor)}</div>
    <div class="stack" style="gap:4px">
      <div class="row" style="gap:8px"><strong style="font-size:var(--fs-sm)">${esc(h.autor)}</strong><span class="faint" style="font-size:var(--fs-xs)">${hace(h.fecha)}</span>${c ? `<span class="chip chip--outline" style="height:22px;font-size:10px">${esc(c.area)}</span>` : ''}</div>
      <div style="font-family:var(--font-display);font-weight:700;font-size:var(--fs-md)">${esc(h.titulo)}</div>
      <p class="muted" style="font-size:var(--fs-sm);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${esc(h.texto)}</p>
    </div>
    <div class="stack" style="gap:6px;align-items:flex-end;font-size:var(--fs-xs)" class="faint"><span class="row" style="gap:4px"><i data-lucide="message-circle" class="i" style="width:14px;height:14px"></i>${h.respuestas.length}</span><span class="row" style="gap:4px"><i data-lucide="thumbs-up" class="i" style="width:14px;height:14px"></i>${h.util}</span></div>
  </a>`;
}

export function comunidad(_: Record<string, string>, query: URLSearchParams) {
  const filtro = query.get('curso');
  const hilos = filtro ? Comunidad.hilos(filtro) : Comunidad.hilos();
  const opciones = cursos.map((c) => `<option value="${c.id}">${esc(c.titulo)}</option>`).join('');
  return `
  <section class="stack" style="gap:20px">
    <div class="section-head"><div><span class="chip chip--primary">Comunidad</span><h1 class="display" style="font-size:var(--fs-2xl)">Colegas que <em>comparten</em> casos</h1></div>
      <button class="btn btn--brand btn--pill-arrow" data-nuevo-hilo>Nuevo tema <span class="arrow"><i data-lucide="plus" class="i"></i></span></button></div>
    <div class="grid" style="grid-template-columns:1fr 1fr;gap:16px">
      <div class="card card--pad" style="display:flex;gap:14px;align-items:center;background:color-mix(in srgb,#25d366 10%,var(--surface));border-color:color-mix(in srgb,#25d366 30%,var(--line))">
        <span class="circle-btn" style="background:#25d366"><i data-lucide="message-circle" class="i"></i></span>
        <div style="flex:1"><strong>Grupo de WhatsApp OdonTeck</strong><p class="muted" style="font-size:var(--fs-sm)">Avisos de cursos en vivo, novedades y comunidad dental.</p></div>
        <a class="btn btn--sm" style="background:#25d366;color:#fff" href="${BRAND.canalWhatsApp}" target="_blank" rel="noopener">Abrir grupo</a>
      </div>
      <div class="card card--pad" style="display:flex;gap:14px;align-items:center">
        <span class="circle-btn" style="background:var(--brand-gradient)"><i data-lucide="percent" class="i"></i></span>
        <div style="flex:1"><strong>Tu ${BRAND.descuentoVIP}% VIP en cursos en vivo</strong><p class="muted" style="font-size:var(--fs-sm)">En cursos de certificación con folio oficial OdonTeck.</p></div>
        <a class="btn btn--sm btn--brand" href="${wa(`Hola OdonTeck, soy miembro VIP del club y quiero aplicar mi ${BRAND.descuentoVIP}% de descuento en un curso en vivo.`)}" target="_blank" rel="noopener">Solicitar</a>
      </div>
    </div>
    <form class="card card--pad stack" data-form-hilo hidden style="gap:12px">
      <h3>Nuevo tema</h3>
      <input class="input" name="titulo" placeholder="Título · ej. ¿Cómo manejan la sensibilidad post-blanqueamiento?" required maxlength="120">
      <textarea class="input" name="texto" rows="4" placeholder="Cuenta el caso o la duda. Sin datos que identifiquen al paciente." required style="padding:12px 14px;resize:vertical"></textarea>
      <div class="row" style="justify-content:space-between"><select class="input" name="cursoId" style="max-width:360px"><option value="">Tema general</option>${opciones}</select>
        <div class="row"><button type="button" class="btn btn--ghost" data-cancelar-hilo>Cancelar</button><button class="btn btn--brand">Publicar</button></div></div>
    </form>
    <div class="row" style="gap:8px"><a class="chip ${!filtro ? 'chip--primary' : ''}" href="#/comunidad">Todos</a>${cursos.filter((c) => Comunidad.hilos(c.id).length).map((c) => `<a class="chip ${filtro === c.id ? 'chip--primary' : 'chip--outline'}" href="#/comunidad?curso=${c.id}">${esc(c.area)} · ${esc(c.titulo.slice(0, 28))}…</a>`).join('')}</div>
    <div class="stack" style="gap:12px">${hilos.length ? hilos.map(tarjetaHilo).join('') : '<div class="card card--pad" style="text-align:center;padding:48px"><h3>Aún no hay temas aquí</h3><p class="muted">Sé la primera en abrir uno.</p></div>'}</div>
    <p class="faint" style="font-size:var(--fs-xs)">Provisional: los temas se guardan en este dispositivo. En la Fase 2 la comunidad es compartida entre todos los miembros.</p>
  </section>`;
}

export function hilo(params: Record<string, string>) {
  const h = Comunidad.hilo(params.id);
  if (!h) return placeholder('Tema no encontrado', 'Puede que se haya borrado.', 'search-x');
  const c = h.cursoId ? getCurso(h.cursoId) : null;
  return `
  <section class="stack" style="gap:20px;max-width:820px">
    <a class="section-head__cta" href="#/comunidad" style="align-self:flex-start"><span class="circle-btn circle-btn--glass" style="width:34px;height:34px"><i data-lucide="arrow-left" class="i" style="width:15px;height:15px"></i></span>Comunidad</a>
    <article class="card card--pad stack" style="gap:14px">
      <div class="row" style="gap:12px"><div class="avatar">${iniciales(h.autor)}</div><div><strong>${esc(h.autor)}</strong><br><span class="faint" style="font-size:var(--fs-xs)">${hace(h.fecha)}${c ? ` · <a href="#/curso/${c.id}">${esc(c.titulo)}</a>` : ' · Tema general'}</span></div></div>
      <h1 class="display" style="font-size:var(--fs-xl)">${esc(h.titulo)}</h1>
      <p style="white-space:pre-wrap">${esc(h.texto)}</p>
      <div class="row"><button class="btn btn--secondary btn--sm" data-util="${h.id}"><i data-lucide="thumbs-up" class="i"></i>Útil · ${h.util}</button><span class="faint" style="font-size:var(--fs-xs)">${h.respuestas.length} respuestas</span></div>
    </article>
    <div class="stack" style="gap:10px">${h.respuestas.map((r) => `
      <div class="card card--pad" style="display:grid;grid-template-columns:auto 1fr;gap:12px"><div class="avatar" style="background:var(--surface-3);color:var(--text-2)">${iniciales(r.autor)}</div>
        <div><div class="row" style="gap:8px"><strong style="font-size:var(--fs-sm)">${esc(r.autor)}</strong><span class="faint" style="font-size:var(--fs-xs)">${hace(r.fecha)}</span></div><p style="font-size:var(--fs-sm);margin-top:4px;white-space:pre-wrap">${esc(r.texto)}</p></div></div>`).join('')}</div>
    <form class="card card--pad stack" data-form-respuesta="${h.id}" style="gap:10px">
      <textarea class="input" name="texto" rows="3" placeholder="Escribe tu respuesta…" required style="padding:12px 14px;resize:vertical"></textarea>
      <div class="row" style="justify-content:flex-end"><button class="btn btn--brand btn--pill-arrow">Responder <span class="arrow"><i data-lucide="send" class="i"></i></span></button></div>
    </form>
  </section>`;
}
