import { cursos, buscar as buscarCursos } from '../core/catalogo';
import { Datos } from '../core/datos';
import { esc } from '../ui/partials';

export function buscar(_: Record<string, string>, query: URLSearchParams) {
  const q = query.get('q')?.trim() || '';
  const n = q.toLowerCase();

  if (!n) return `<section class="stack" style="gap:20px"><div class="section-head"><div>
    <span class="chip chip--primary"><i data-lucide="search" class="i"></i>Búsqueda</span>
    <h1 class="display" style="font-size:var(--fs-2xl)">Buscar</h1>
    <p class="muted">Escribe algo en la barra de búsqueda para encontrar cursos, clases o materiales.</p>
    </div></div></section>`;

  const resCursos = buscarCursos(q);

  const resClases: { cursoId: string; cursoTitulo: string; n: number; titulo: string }[] = [];
  for (const c of cursos) {
    for (const k of c.clases) {
      if (k.titulo.toLowerCase().includes(n)) resClases.push({ cursoId: c.id, cursoTitulo: c.titulo, n: k.n, titulo: k.titulo });
    }
  }

  const resMats = Datos.materiales().filter((m) =>
    m.estado === 'disponible' && (m.titulo + ' ' + m.area + ' ' + m.autor + ' ' + m.categoria).toLowerCase().includes(n),
  );

  const total = resCursos.length + resClases.length + resMats.length;

  return `
  <section class="stack" style="gap:24px">
    <div class="section-head"><div>
      <span class="chip chip--primary"><i data-lucide="search" class="i"></i>Búsqueda</span>
      <h1 class="display" style="font-size:var(--fs-2xl)">${total} resultado${total !== 1 ? 's' : ''} para «${esc(q)}»</h1>
    </div></div>

    ${resCursos.length ? `<div>
      <h2 style="font-size:var(--fs-md);margin-bottom:12px"><i data-lucide="book-open" class="i" style="width:16px;height:16px;vertical-align:-2px"></i> Cursos (${resCursos.length})</h2>
      <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(280px,1fr))">
        ${resCursos.map((c) => `
          <a class="card card--hover" href="#/curso/${c.id}" style="display:grid;grid-template-columns:80px 1fr;gap:14px;padding:14px;color:inherit">
            <img src="${c.portada}" alt="" style="border-radius:var(--r-md);aspect-ratio:1;object-fit:cover;width:100%">
            <div><strong style="font-size:var(--fs-sm)">${esc(c.titulo)}</strong><br><span class="faint" style="font-size:var(--fs-xs)">${esc(c.area)} · ${esc(c.instructor)} · ${c.clases.length} clases</span></div>
          </a>`).join('')}
      </div>
    </div>` : ''}

    ${resClases.length ? `<div>
      <h2 style="font-size:var(--fs-md);margin-bottom:12px"><i data-lucide="play-circle" class="i" style="width:16px;height:16px;vertical-align:-2px"></i> Clases (${resClases.length})</h2>
      <div class="stack" style="gap:8px">
        ${resClases.map((k) => `
          <a class="card card--hover" href="#/curso/${k.cursoId}/clase/${k.n}" style="display:grid;grid-template-columns:1fr auto;align-items:center;padding:12px 16px;color:inherit">
            <div><strong style="font-size:var(--fs-sm)">${esc(k.titulo)}</strong><br><span class="faint" style="font-size:var(--fs-xs)">Clase ${k.n} · ${esc(k.cursoTitulo)}</span></div>
            <span class="circle-btn" style="width:32px;height:32px"><i data-lucide="play" class="i" style="width:14px;height:14px"></i></span>
          </a>`).join('')}
      </div>
    </div>` : ''}

    ${resMats.length ? `<div>
      <h2 style="font-size:var(--fs-md);margin-bottom:12px"><i data-lucide="file-text" class="i" style="width:16px;height:16px;vertical-align:-2px"></i> Materiales (${resMats.length})</h2>
      <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(280px,1fr))">
        ${resMats.map((m) => `
          <a class="card card--hover" href="#/materiales/${m.id}" style="display:grid;grid-template-columns:60px 1fr;gap:12px;padding:14px;color:inherit">
            <img src="${m.portada}" alt="" style="border-radius:var(--r-md);aspect-ratio:0.7;object-fit:cover;width:100%">
            <div><strong style="font-size:var(--fs-sm)">${esc(m.titulo)}</strong><br><span class="faint" style="font-size:var(--fs-xs)">${esc(m.tipo)} · ${esc(m.area)}</span></div>
          </a>`).join('')}
      </div>
    </div>` : ''}

    ${!total ? `<div class="card card--pad" style="text-align:center;padding:40px">
      <i data-lucide="search-x" class="i" style="width:40px;height:40px;color:var(--text-3);margin:0 auto 12px"></i>
      <h3>Sin resultados para «${esc(q)}»</h3>
      <p class="muted">Prueba con otro término o explora el catálogo.</p>
      <a class="btn btn--brand" href="#/cursos" style="margin-top:12px">Ver todos los cursos</a>
    </div>` : ''}
  </section>`;
}
