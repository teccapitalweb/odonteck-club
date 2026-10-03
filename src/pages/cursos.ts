import { cursos, areas, buscar } from '../core/catalogo';
import { Progreso } from '../core/progreso';
import { tarjetaCurso, esc } from '../ui/partials';
import { cursosPorIntereses, etiquetaIntereses, interesesDelMiembro } from '../core/recomendaciones';

export function catalogo(_: Record<string, string>, query: URLSearchParams) {
  const q = query.get('q') || '';
  const area = query.get('area') || '';
  const tab = query.get('tab') || 'todos';

  const intereses = interesesDelMiembro();
  let lista = buscar(q);
  if (area) lista = lista.filter((c) => c.area === area);
  // "Para ti": las áreas que eligió en la entrevista, en el orden en que las eligió.
  if (tab === 'para-ti') { const paraTi = cursosPorIntereses(intereses, cursos.length); lista = lista.filter((c) => paraTi.includes(c)).sort((a, b) => paraTi.indexOf(a) - paraTi.indexOf(b)); }
  if (tab === 'marcha') lista = lista.filter((c) => Progreso.porcentaje(c) > 0 && !Progreso.completado(c));
  if (tab === 'completados') lista = lista.filter((c) => Progreso.completado(c));

  const link = (params: Record<string, string>) => {
    const p = new URLSearchParams({ q, area, tab, ...params });
    [...p.keys()].forEach((k) => { if (!p.get(k) || (k === 'tab' && p.get(k) === 'todos')) p.delete(k); });
    const s = p.toString();
    return '#/cursos' + (s ? '?' + s : '');
  };
  const tabs = [['todos', 'Todos'], ...(intereses.length ? [['para-ti', 'Para ti']] : []), ['marcha', 'En progreso'], ['completados', 'Completados']]
    .map(([k, l]) => `<a class="${tab === k ? 'is-active' : ''}" href="${link({ tab: k })}" ${tab === k ? 'aria-current="page"' : ''}>${l}</a>`).join('');
  const chips = [`<a class="chip ${!area ? 'chip--primary' : 'chip--outline'}" href="${link({ area: '' })}" ${!area ? 'aria-current="page"' : ''}>Todas las áreas</a>`]
    .concat(areas.map((a) => `<a class="chip ${area === a ? 'chip--primary' : 'chip--outline'}" href="${link({ area: a })}" ${area === a ? 'aria-current="page"' : ''}>${a}</a>`)).join('');

  const enMarcha = Progreso.enMarcha().length;
  const completados = Progreso.completados().length;
  return `
  <section class="catalog-page stack">
    <div class="catalog-band">
      <div class="catalog-band__copy">
        <span class="hero__kicker"><i data-lucide="graduation-cap" class="i" style="width:14px;height:14px"></i>Catálogo OdonTeck</span>
        <h1 class="display display--black">Cursos grabados, <em>a tu ritmo.</em></h1>
        <p>Formación clínica especializada, disponible cuando la necesitas.</p>
      </div>
      <div class="catalog-band__bottom">
        <div class="hero__stats">
          <div><strong>${cursos.length}</strong><span>cursos disponibles</span></div>
          <div><strong>${cursos.reduce((a, c) => a + c.clases.length, 0)}</strong><span>clases grabadas</span></div>
          <div><strong>${enMarcha}</strong><span>en progreso</span></div>
          <div><strong>${completados}</strong><span>completados</span></div>
        </div>
        <nav class="catalog-tabs" aria-label="Filtrar cursos por avance">${tabs}</nav>
      </div>
    </div>
    <div class="catalog-controls">
      <div class="catalog-controls__heading">
        <div><span class="catalog-eyebrow">Explora la biblioteca</span><h2>Encuentra tu próximo curso</h2></div>
        <span class="catalog-count">${lista.length} ${lista.length === 1 ? 'curso' : 'cursos'}</span>
      </div>
      <nav class="catalog-filters" aria-label="Filtrar cursos por área">${chips}</nav>
    </div>
    ${q ? `<p class="muted">Resultados para <strong>"${esc(q)}"</strong> · <a href="${link({ q: '' })}">limpiar</a></p>` : ''}
    ${tab === 'para-ti' ? `<p class="muted"><i data-lucide="sparkles" class="i" style="width:14px;height:14px;vertical-align:-2px"></i> Elegido a partir de tus intereses: <strong>${esc(etiquetaIntereses(intereses))}</strong>.</p>` : ''}
    ${lista.length
      ? `<div class="catalog-grid">${lista.map(tarjetaCurso).join('')}</div>`
      : `<div class="card card--pad catalog-empty"><h3>Nada por aquí todavía</h3><p class="muted">Prueba con otra área o vuelve a "Todos".</p></div>`}
  </section>`;
}
