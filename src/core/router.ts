// Router por hash: #/cursos, #/curso/:id, #/curso/:id/clase/:n
export type Params = Record<string, string>;
export type Page = (params: Params, query: URLSearchParams) => string | Promise<string>;

const routes: { pattern: RegExp; keys: string[]; page: Page }[] = [];
let outlet: HTMLElement;
let afterRender: (() => void)[] = [];

export function route(path: string, page: Page) {
  const keys: string[] = [];
  const pattern = new RegExp('^' + path.replace(/:([a-zA-Z]+)/g, (_, k) => { keys.push(k); return '([^/]+)'; }) + '/?$');
  routes.push({ pattern, keys, page });
}

export function onRender(fn: () => void) { afterRender.push(fn); }

export function navigate(hash: string) { location.hash = hash.startsWith('#') ? hash : '#' + hash; }

export function current() {
  const raw = location.hash.replace(/^#/, '') || '/';
  const [path, qs = ''] = raw.split('?');
  return { path, query: new URLSearchParams(qs) };
}

async function render() {
  const { path, query } = current();
  for (const r of routes) {
    const m = path.match(r.pattern);
    if (!m) continue;
    const params: Params = {};
    r.keys.forEach((k, i) => (params[k] = decodeURIComponent(m[i + 1])));
    outlet.innerHTML = await r.page(params, query);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    afterRender.forEach((fn) => fn());
    return;
  }
  outlet.innerHTML = `<section class="stack" style="padding:80px 0;text-align:center"><h1 class="display">Página no encontrada</h1><p class="muted">La ruta <code class="mono">${path}</code> no existe.</p><a class="btn btn--brand" href="#/">Ir al inicio</a></section>`;
  afterRender.forEach((fn) => fn());
}

export function startRouter(el: HTMLElement) {
  outlet = el;
  window.addEventListener('hashchange', render);
  render();
}
