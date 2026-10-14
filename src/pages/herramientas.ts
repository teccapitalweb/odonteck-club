import { esc, placeholder } from '../ui/partials';

type Herramienta = { slug: string; titulo: string; icono: string; desc: string };

export const HERRAMIENTAS: Herramienta[] = [
  { slug: 'cotizador', titulo: 'Cotizador de tratamientos', icono: 'receipt', desc: 'Arma un presupuesto con tratamientos, cantidades y precios. Genera un PDF formal con tu marca para el paciente.' },
  { slug: 'plan', titulo: 'Plan de tratamiento por fases', icono: 'clipboard-list', desc: 'Organiza el tratamiento en etapas con duración, estado y costo. PDF tipo línea de tiempo para el paciente.' },
  { slug: 'prescripcion', titulo: 'Calculadora de prescripción', icono: 'pill', desc: 'Dosis de referencia de antibióticos y analgésicos de uso odontológico. En pediátrico calcula por peso.' },
  { slug: 'odontograma', titulo: 'Odontograma digital', icono: 'layout-grid', desc: 'Marca condiciones diente por diente en notación FDI y exporta el registro a PDF.' },
  { slug: 'anestesico', titulo: 'Calculadora de anestésico local', icono: 'syringe', desc: 'Dosis máxima segura y número de cartuchos según el peso del paciente. Cartucho estándar de 1.8 mL.' },
];

const NOTA_PRIVACIDAD = '<p class="faint" style="font-size:var(--fs-xs)">Las herramientas funcionan en tu navegador: lo que captures y los PDF que generes no se envían ni se guardan en el club.</p>';

function srcHerramienta(slug: string) {
  return import.meta.env.BASE_URL + 'herramientas/herramienta-' + slug + '.html?theme=' + (document.documentElement.dataset.theme === 'dark' ? 'night' : 'day');
}

export function herramientas() {
  return `
  <section class="stack" style="gap:24px">
    <div class="section-head"><div><span class="chip chip--primary"><i data-lucide="wrench" class="i"></i>Herramientas Pro</span><h1 class="display" style="font-size:var(--fs-2xl)">Herramientas <em>pro</em> para tu consultorio</h1>
      <p class="muted" style="margin-top:6px">Cotizaciones, planes de tratamiento y odontograma en PDF con tu marca, más calculadoras de dosis de referencia. Todo funciona en tu navegador.</p></div></div>
    <div class="tools-grid">${HERRAMIENTAS.map((h) => `
      <a class="card card--hover tool-card" href="#/herramientas/${h.slug}">
        <span class="tool-card__ic"><i data-lucide="${h.icono}" class="i"></i></span>
        <strong>${esc(h.titulo)}</strong>
        <span class="muted">${esc(h.desc)}</span>
        <span class="tool-card__go"><i data-lucide="arrow-up-right" class="i"></i></span>
      </a>`).join('')}</div>
    ${NOTA_PRIVACIDAD}
  </section>`;
}

export function herramienta(params: Record<string, string>) {
  const h = HERRAMIENTAS.find((x) => x.slug === params.slug);
  if (!h) return placeholder('Herramienta no encontrada', 'Revisa el enlace o vuelve al listado.', 'wrench', '#/herramientas', 'Ver herramientas');
  const src = esc(srcHerramienta(h.slug));
  return `
  <section class="stack" style="gap:20px">
    <div class="row tool-head" style="justify-content:space-between;gap:12px;flex-wrap:wrap">
      <a class="section-head__cta" href="#/herramientas"><span class="circle-btn circle-btn--glass" style="width:34px;height:34px"><i data-lucide="arrow-left" class="i" style="width:15px;height:15px"></i></span>Herramientas</a>
      <a class="btn btn--secondary btn--sm" href="${src}" target="_blank" rel="noopener"><i data-lucide="external-link" class="i"></i>Abrir en pestaña nueva</a>
    </div>
    <h1 class="display" style="font-size:var(--fs-lg)">${esc(h.titulo)}</h1>
    <div class="tool-frame card"><iframe class="tool-frame__iframe" data-tool="${h.slug}" src="${src}" title="${esc(h.titulo)}" loading="eager"></iframe></div>
    <p class="faint" style="font-size:var(--fs-xs)">¿Problemas con la herramienta o con la descarga del PDF? <a href="${src}" target="_blank" rel="noopener">Ábrela en una pestaña nueva</a>.</p>
    ${NOTA_PRIVACIDAD}
  </section>`;
}

window.addEventListener('message', (e) => {
  if (e.origin !== location.origin || !e.data || e.data.odtTool !== 1 || typeof e.data.h !== 'number') return;
  const f = document.querySelector<HTMLIFrameElement>('iframe[data-tool]');
  if (!f || e.source !== f.contentWindow) return;
  // El body del tool mide min-height:100vh = alto del iframe; sumar padding aquí lo haría crecer sin fin.
  const h = Math.min(8000, Math.max(480, Math.round(e.data.h)));
  if (Math.abs(h - f.offsetHeight) >= 2) f.style.height = h + 'px';
});
