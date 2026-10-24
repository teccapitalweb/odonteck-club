import { Datos, type Material } from '../core/datos';
import { curso as getCurso } from '../core/catalogo';
import { esc, placeholder } from '../ui/partials';
import { Acceso } from '../core/acceso';
import { Recompensas } from '../core/recompensas';

export const materiales: Material[] = [];
const recargar = () => materiales.splice(0, materiales.length, ...Datos.materiales().filter((m) => m.estado !== 'oculto'));
recargar(); window.addEventListener('datos:cambio', recargar);
const tipoIcon: Record<string, string> = { PDF: 'file-text', Libro: 'book-open', Presentación: 'presentation' };

const recompensaDe = (m: Material) => Recompensas.resumen()?.recompensas.find((r) => r.materialId === m.id);
const puntosDe = (m: Material) => recompensaDe(m)?.puntos ?? m.puntosRequeridos ?? null;
const desbloqueado = (m: Material) => m.desbloqueadoConPuntos === true || recompensaDe(m)?.canjeada === true;
const accesible = (m: Material) => Acceso.materialAccesible(m) || desbloqueado(m);

export function estante(items: Material[]) {
  return `<div class="shelf">${items.map((m) => `
    <a class="shelf__item" href="#/materiales/${m.id}">
      <div class="shelf__cover"><img src="${m.portada}" alt="" loading="lazy">${m.estado !== 'disponible' ? '<span class="chip chip--glass" style="position:absolute;left:8px;bottom:8px;height:22px;font-size:10px">Próximamente</span>' : Acceso.materialLibre(m) ? '<span class="chip chip--accent" style="position:absolute;top:8px;right:8px;height:24px;font-size:10px">Gratis</span>' : desbloqueado(m) ? '<span class="chip chip--accent" style="position:absolute;top:8px;right:8px;height:24px;font-size:10px">Desbloqueado</span>' : !accesible(m) && puntosDe(m) ? `<span class="chip chip--glass" style="position:absolute;top:8px;right:8px;height:24px;font-size:10px"><i data-lucide="sparkles" class="i" style="width:12px;height:12px"></i>${puntosDe(m)} pts</span>` : !accesible(m) ? '<span class="chip chip--glass" style="position:absolute;top:8px;right:8px;height:24px;width:24px;padding:0;justify-content:center"><i data-lucide="lock" class="i" style="width:13px;height:13px"></i></span>' : ''}</div>
      <div class="shelf__title">${esc(m.titulo)}</div>
      <div class="shelf__meta">${m.tipo} · ${m.paginas} ${m.tipo === 'Presentación' ? 'láminas' : 'págs'}</div>
    </a>`).join('')}</div>`;
}

export function biblioteca(_: Record<string, string>, query: URLSearchParams) {
  const tipo = query.get('tipo') || '';
  const q = (query.get('q') || '').toLowerCase();
  let lista = materiales;
  if (tipo) lista = lista.filter((m) => m.tipo === tipo);
  if (q) lista = lista.filter((m) => (m.titulo + m.area + m.categoria).toLowerCase().includes(q));
  const destacado = lista[0];
  const chips = [['', 'Todo'], ['PDF', 'PDF'], ['Libro', 'Libros'], ['Presentación', 'Presentaciones']]
    .map(([k, l]) => `<a class="chip ${tipo === k ? 'chip--primary' : ''}" href="#/materiales${k ? '?tipo=' + encodeURIComponent(k) : ''}">${l}</a>`).join('');
  return `
  <section class="stack" style="gap:24px">
    <div class="section-head"><div><span class="chip chip--primary">Materiales</span><h1 class="display" style="font-size:var(--fs-2xl)">Tu biblioteca <em>clínica</em></h1>
      <p class="muted" style="margin-top:6px">${materiales.length} recursos · guías, formatos, atlas y presentaciones de tus cursos.</p></div><div class="row">${chips}</div></div>
    ${destacado ? fichaLibro(destacado, true) : ''}
    ${lista.length ? estante(lista) : `<div class="card card--pad" style="text-align:center;padding:56px"><h3>Sin resultados</h3><p class="muted">Prueba con otro tipo.</p></div>`}
  </section>`;
}

export function material(params: Record<string, string>) {
  const m = materiales.find((x) => x.id === params.id);
  if (!m) return placeholder('Material no encontrado', 'Revisa la biblioteca.', 'search-x');
  const relacionados = materiales.filter((x) => x.id !== m.id && (x.area === m.area || x.tipo === m.tipo)).slice(0, 6);
  return `
  <section class="stack" style="gap:24px">
    <a class="section-head__cta" href="#/materiales" style="align-self:flex-start"><span class="circle-btn circle-btn--glass" style="width:34px;height:34px"><i data-lucide="arrow-left" class="i" style="width:15px;height:15px"></i></span>Biblioteca</a>
    ${fichaLibro(m, false)}
  </section>
  <section class="stack" style="gap:20px">
    <div class="section-head"><div><span class="chip chip--primary">Relacionados</span><h2 class="display">Más de <em>${esc(m.area.toLowerCase())}</em></h2></div></div>
    ${estante(relacionados)}
  </section>`;
}

export function fichaLibro(m: Material, compacto: boolean) {
  const c = m.cursoId ? getCurso(m.cursoId) : null;
  const acc = accesible(m);
  const puntos = puntosDe(m);
  const disponible = m.estado === 'disponible' && acc && (Datos.modo === 'api' || !!m.url);
  return `
  <div class="book">
    <div class="book__cover"><img src="${m.portada}" alt="" loading="lazy" decoding="async"><span class="chip"><i data-lucide="${tipoIcon[m.tipo] || 'file'}" class="i"></i>${m.tipo} · ${m.paginas} ${m.tipo === 'Presentación' ? 'láminas' : 'págs'}</span></div>
    <div>
      <span class="eyebrow">${esc(m.categoria)} · ${esc(m.area)}</span>
      <h2 class="display book__title" style="margin-top:8px">${compacto ? `<a href="#/materiales/${m.id}" style="color:inherit">${esc(m.titulo)}</a>` : esc(m.titulo)}</h2>
      <p class="book__author">${esc(m.autor)}</p>
      <p class="book__lead" style="font-family:var(--font-body);font-style:normal">${esc(m.descripcion)}</p>
      <div class="book__actions">
        ${disponible
          ? `<a class="btn btn--brand btn--lg btn--pill-arrow" href="#/materiales/${encodeURIComponent(m.id)}/visor">${Acceso.materialLibre(m) ? 'Leer gratis' : 'Leer ahora'} <span class="arrow"><i data-lucide="book-open" class="i"></i></span></a>`
          : m.estado === 'disponible' && !acc && puntos
            ? `<a class="btn btn--brand btn--lg" href="#/recompensas"><i data-lucide="sparkles" class="i"></i>Canjear por ${puntos} puntos</a>`
          : m.estado === 'disponible' && !acc
            ? `<button class="btn btn--brand btn--lg" data-paywall="Este material es exclusivo para miembros VIP."><i data-lucide="crown" class="i"></i>Desbloquear con VIP</button>`
            : `<span class="btn btn--secondary btn--lg" style="opacity:.7"><i data-lucide="clock" class="i"></i>Próximamente</span>`}
        <div class="spacer"></div>
        <button class="btn btn--secondary btn--icon" aria-label="Guardar" data-guardar="${m.id}"><i data-lucide="bookmark" class="i"></i></button>
        <button class="btn btn--secondary btn--icon" aria-label="Compartir" data-compartir="${m.id}"><i data-lucide="share-2" class="i"></i></button>
      </div>
      <div class="book__facts">
        <div><h4>Formato</h4><p>${m.tipo}, ${m.paginas} ${m.tipo === 'Presentación' ? 'láminas' : 'páginas'}</p></div>
        <div><h4>Del curso</h4><p>${c ? `<a href="#/curso/${c.id}">${esc(c.titulo)}</a>` : 'Recurso general de la biblioteca'}</p></div>
        <div><h4>Área</h4><p>${esc(m.area)}</p></div>
        <div><h4>Estado</h4><p>${Acceso.materialLibre(m) ? 'Acceso gratuito' : desbloqueado(m) ? 'Desbloqueado permanentemente con puntos' : m.estado === 'disponible' ? (acc ? 'Disponible para miembros VIP' : puntos ? `VIP o ${puntos} puntos` : 'Requiere membresía VIP') : 'En preparación · se publica desde el admin'}</p></div>
      </div>
    </div>
  </div>`;
}
