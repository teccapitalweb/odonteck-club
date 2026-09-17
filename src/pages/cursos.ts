import { cursos, areas, buscar } from '../core/catalogo';
import { Progreso } from '../core/progreso';
import { tarjetaCurso, esc } from '../ui/partials';

export function catalogo(_: Record<string, string>, query: URLSearchParams) {
  const q = query.get('q') || '';
  const area = query.get('area') || '';
  const tab = query.get('tab') || 'todos';

  let lista = buscar(q);
  if (area) lista = lista.filter((c) => c.area === area);
  if (tab === 'marcha') lista = lista.filter((c) => Progreso.porcentaje(c) > 0 && !Progreso.completado(c));
  if (tab === 'completados') lista = lista.filter((c) => Progreso.completado(c));

  const link = (params: Record<string, string>) => {
    const p = new URLSearchParams({ q, area, tab, ...params });
    [...p.keys()].forEach((k) => { if (!p.get(k) || (k === 'tab' && p.get(k) === 'todos')) p.delete(k); });
    const s = p.toString();
    return '#/cursos' + (s ? '?' + s : '');
  };
  const tabs = [['todos', 'Todos'], ['marcha', 'En progreso'], ['completados', 'Completados']]
    .map(([k, l]) => `<a class="chip ${tab === k ? 'chip--primary' : ''}" href="${link({ tab: k })}">${l}</a>`).join('');
  const chips = [`<a class="chip ${!area ? 'chip--primary' : 'chip--outline'}" href="${link({ area: '' })}">Todas las áreas</a>`]
    .concat(areas.map((a) => `<a class="chip ${area === a ? 'chip--primary' : 'chip--outline'}" href="${link({ area: a })}">${a}</a>`)).join('');

  return `
  <section class="stack" style="gap:22px">
    <div class="section-head">
      <div><span class="chip chip--primary">Cursos</span><h1 class="display" style="font-size:var(--fs-2xl)">Catálogo <em>OdonTeck</em></h1>
        <p class="muted" style="margin-top:6px">${cursos.length} cursos grabados · ${cursos.reduce((a, c) => a + c.clases.length, 0)} clases · la primera clase de cada curso es gratis.</p></div>
      <div class="tabs" style="min-width:300px">${tabs}</div>
    </div>
    <div class="row" style="gap:8px">${chips}</div>
    ${q ? `<p class="muted">Resultados para <strong>"${esc(q)}"</strong> · <a href="${link({ q: '' })}">limpiar</a></p>` : ''}
    ${lista.length
      ? `<div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(210px,1fr))">${lista.map(tarjetaCurso).join('')}</div>`
      : `<div class="card card--pad" style="text-align:center;padding:56px"><h3>Nada por aquí todavía</h3><p class="muted">Prueba con otra área o vuelve a "Todos".</p></div>`}
  </section>`;
}
