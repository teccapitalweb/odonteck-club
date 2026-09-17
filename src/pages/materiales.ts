import data from '../data/materiales.json';
import { curso as getCurso } from '../core/catalogo';
import { esc, placeholder } from '../ui/partials';

interface Material { id: string; titulo: string; tipo: string; categoria: string; area: string; autor: string; paginas: number; portada: string; cursoId: string | null; descripcion: string; estado: string; url?: string }
export const materiales = data as Material[];
const tipoIcon: Record<string, string> = { PDF: 'file-text', Libro: 'book-open', Presentación: 'presentation' };

export function estante(items: Material[]) {
  return `<div class="shelf">${items.map((m) => `
    <a class="shelf__item" href="#/materiales/${m.id}">
      <div class="shelf__cover"><img src="${m.portada}" alt="" loading="lazy">${m.estado !== 'disponible' ? '<span class="chip chip--glass" style="position:absolute;left:8px;bottom:8px;height:22px;font-size:10px">Próximamente</span>' : ''}</div>
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
  const disponible = m.estado === 'disponible' && m.url;
  return `
  <div class="book">
    <div class="book__cover"><img src="${m.portada}" alt=""><span class="chip"><i data-lucide="${tipoIcon[m.tipo] || 'file'}" class="i"></i>${m.tipo} · ${m.paginas} ${m.tipo === 'Presentación' ? 'láminas' : 'págs'}</span></div>
    <div>
      <span class="eyebrow">${esc(m.categoria)} · ${esc(m.area)}</span>
      <h2 class="display book__title" style="margin-top:8px">${compacto ? `<a href="#/materiales/${m.id}" style="color:inherit">${esc(m.titulo)}</a>` : esc(m.titulo)}</h2>
      <p class="book__author">${esc(m.autor)}</p>
      <p class="book__lead" style="font-family:var(--font-body);font-style:normal">${esc(m.descripcion)}</p>
      <div class="book__actions">
        ${disponible
          ? `<a class="btn btn--brand btn--lg btn--pill-arrow" href="${m.url}" target="_blank" rel="noopener">Abrir <span class="arrow"><i data-lucide="arrow-up-right" class="i"></i></span></a>`
          : `<span class="btn btn--secondary btn--lg" style="opacity:.7"><i data-lucide="clock" class="i"></i>Próximamente</span>`}
        <div class="spacer"></div>
        <button class="btn btn--secondary btn--icon" aria-label="Guardar" data-guardar="${m.id}"><i data-lucide="bookmark" class="i"></i></button>
        <button class="btn btn--secondary btn--icon" aria-label="Compartir" data-compartir="${m.id}"><i data-lucide="share-2" class="i"></i></button>
        ${disponible ? `<a class="btn btn--secondary btn--icon" aria-label="Descargar" href="${m.url}" download><i data-lucide="download" class="i"></i></a>` : ''}
      </div>
      <div class="book__facts">
        <div><h4>Formato</h4><p>${m.tipo}, ${m.paginas} ${m.tipo === 'Presentación' ? 'láminas' : 'páginas'}</p></div>
        <div><h4>Del curso</h4><p>${c ? `<a href="#/curso/${c.id}">${esc(c.titulo)}</a>` : 'Recurso general de la biblioteca'}</p></div>
        <div><h4>Área</h4><p>${esc(m.area)}</p></div>
        <div><h4>Estado</h4><p>${disponible ? 'Disponible para miembros' : 'En preparación · se publica desde el admin'}</p></div>
      </div>
    </div>
  </div>`;
}
