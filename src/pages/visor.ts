import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { PDFDocumentProxy, PDFPageProxy, RenderTask } from 'pdfjs-dist';
import { Acceso } from '../core/acceso';
import { api, mensajeError } from '../core/auth';
import { Datos, type Material } from '../core/datos';
import { Recompensas } from '../core/recompensas';
import { esc, placeholder } from '../ui/partials';

const STORAGE_KEY = 'odonteck-club:lectura-materiales';

function paginaGuardada(id: string): number {
  try { return Number(JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')[id]) || 0; } catch { return 0; }
}

function guardarPagina(id: string, pagina: number) {
  try {
    const lecturas = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    lecturas[id] = pagina;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lecturas));
  } catch { /* La lectura sigue funcionando aunque el navegador bloquee almacenamiento. */ }
}

function recompensaDe(material: Material) {
  return Recompensas.resumen()?.recompensas.find((recompensa) => recompensa.materialId === material.id);
}

function materialAccesible(material: Material) {
  return Acceso.materialAccesible(material) || material.desbloqueadoConPuntos === true || recompensaDe(material)?.canjeada === true;
}

function materialPorId(id: string) {
  return Datos.materiales().find((material) => material.id === id);
}

export function visor(params: Record<string, string>) {
  const material = materialPorId(params.id);
  if (!material) return placeholder('Material no encontrado', 'Revisa la biblioteca clínica.', 'search-x', '#/materiales', 'Volver a materiales');
  if (material.estado !== 'disponible') return placeholder('Material en preparación', 'Te avisaremos cuando esté listo para consultar.', 'clock', '#/materiales', 'Volver a materiales');
  if (!materialAccesible(material)) {
    const puntos = recompensaDe(material)?.puntos ?? material.puntosRequeridos;
    return placeholder(
      'Material bloqueado',
      puntos ? `Desbloquéalo permanentemente con ${puntos} puntos desde Recompensas, o accede como miembro VIP.` : 'Este material requiere membresía VIP.',
      'lock-keyhole', '#/recompensas', 'Ver recompensas',
    );
  }

  const guardada = paginaGuardada(material.id);
  return `
  <section class="libro" data-visor data-material-id="${esc(material.id)}" data-saved="${guardada}">
    <header class="libro__header">
      <a class="libro__back" href="#/materiales/${encodeURIComponent(material.id)}">
        <i data-lucide="arrow-left" class="i"></i><span>Biblioteca</span>
      </a>
      <div class="libro__header-centro">
        <span class="libro__brand-mark"><i data-lucide="sparkles" class="i"></i></span>
        <div><span>LECTOR ODONTECK</span><h1>${esc(material.titulo)}</h1></div>
      </div>
      <div class="libro__controles">
        <button class="libro__ctrl-btn" type="button" data-visor-zoom-out aria-label="Alejar" title="Alejar"><i data-lucide="zoom-out" class="i"></i></button>
        <button class="libro__ctrl-btn" type="button" data-visor-zoom-in aria-label="Acercar" title="Acercar"><i data-lucide="zoom-in" class="i"></i></button>
        <button class="libro__ctrl-btn" type="button" data-visor-download aria-label="Descargar PDF" title="Descargar PDF"><i data-lucide="download" class="i"></i></button>
        <button class="libro__ctrl-btn" type="button" data-visor-fullscreen aria-label="Pantalla completa" title="Pantalla completa"><i data-lucide="maximize" class="i"></i></button>
      </div>
    </header>

    ${guardada > 1 ? `<div class="libro__continuar" data-visor-continuar="${guardada}" role="status">
      <i data-lucide="bookmark-check" class="i"></i><span>Retomamos tu lectura · página ${guardada}</span>
      <button class="libro__continuar-x" type="button" data-visor-continuar-x aria-label="Cerrar aviso"><i data-lucide="x" class="i"></i></button>
    </div>` : ''}

    <div class="libro__escenario" data-visor-escenario aria-live="polite">
      <button class="libro__flecha libro__flecha--izq" type="button" data-visor-prev disabled aria-label="Página anterior"><i data-lucide="chevron-left" class="i"></i></button>

      <div class="libro__cuerpo" data-visor-canvas>
        <div class="libro__borde-ext libro__borde-ext--izq"></div>
        <article class="libro__pagina libro__pagina--izq" data-visor-page-left>
          <span class="libro__esquina libro__esquina--tl"></span><span class="libro__esquina libro__esquina--bl"></span>
          <canvas data-visor-canvas-left aria-label="Página izquierda"></canvas>
          <span class="libro__pag-num libro__pag-num--izq" data-visor-num-left></span>
        </article>
        <div class="libro__lomo" aria-hidden="true"><span></span><span></span><span></span></div>
        <article class="libro__pagina libro__pagina--der" data-visor-page-right>
          <span class="libro__esquina libro__esquina--tr"></span><span class="libro__esquina libro__esquina--br"></span>
          <canvas data-visor-canvas-right aria-label="Página derecha"></canvas>
          <span class="libro__pag-num libro__pag-num--der" data-visor-num-right></span>
        </article>
        <div class="libro__borde-ext libro__borde-ext--der"></div>
      </div>

      <button class="libro__flecha libro__flecha--der" type="button" data-visor-next disabled aria-label="Página siguiente"><i data-lucide="chevron-right" class="i"></i></button>

      <div class="libro__estado" data-visor-estado>
        <span class="libro__loader"><i data-lucide="loader-circle" class="i spin"></i></span>
        <strong>Preparando tu lectura</strong><small>Validando el acceso y cargando el documento protegido…</small>
      </div>
    </div>

    <footer class="libro__pie">
      <span class="libro__info"><i data-lucide="user-round" class="i"></i>${esc(material.autor)}</span>
      <div class="libro__paginador">
        <span aria-hidden="true">✦</span>
        <button class="libro__pag-btn" type="button" data-visor-pag-texto disabled>Página <strong>—</strong></button>
        <span aria-hidden="true">✦</span>
      </div>
      <div class="libro__ir-a" data-visor-ir-a hidden>
        <label for="visor-ir-a">Ir a página</label>
        <input id="visor-ir-a" type="number" data-visor-ir-a-input min="1" inputmode="numeric">
        <button type="button" data-visor-ir-a-ok>Ir</button><button type="button" data-visor-ir-a-x aria-label="Cerrar">×</button>
      </div>
      <span class="libro__info"><i data-lucide="book-open" class="i"></i><span data-visor-total>${esc(material.tipo)} · ${material.paginas} páginas</span></span>
    </footer>

    <div class="libro__progreso" data-visor-progreso role="slider" aria-label="Progreso de lectura" aria-valuemin="1" aria-valuemax="${material.paginas}" aria-valuenow="1" tabindex="0">
      <span class="libro__progreso-fill" data-visor-progreso-fill></span><span class="libro__progreso-thumb" data-visor-progreso-thumb></span>
    </div>
  </section>`;
}

async function urlMaterial(material: Material) {
  if (Datos.modo === 'api') {
    const respuesta = await api<{ url: string }>(`/materiales/${encodeURIComponent(material.id)}/descarga`);
    return respuesta.url;
  }
  if (!material.url) throw new Error('Este material todavía no tiene un archivo asociado.');
  return material.url;
}

export function montarVisor() {
  const raizEncontrada = document.querySelector<HTMLElement>('[data-visor]');
  if (!raizEncontrada) return;
  const raiz: HTMLElement = raizEncontrada;
  const materialEncontrado = materialPorId(raiz.dataset.materialId || '');
  if (!materialEncontrado) return;
  const material: Material = materialEncontrado;

  document.body.classList.add('visor-activo');
  const $ = <T extends HTMLElement>(selector: string) => raiz.querySelector<T>(selector)!;
  const escenario = $('[data-visor-escenario]');
  const cuerpo = $('[data-visor-canvas]');
  const paginaIzq = $('[data-visor-page-left]');
  const paginaDer = $('[data-visor-page-right]');
  const canvasIzq = $<HTMLCanvasElement>('[data-visor-canvas-left]');
  const canvasDer = $<HTMLCanvasElement>('[data-visor-canvas-right]');
  const numeroIzq = $('[data-visor-num-left]');
  const numeroDer = $('[data-visor-num-right]');
  const anterior = $<HTMLButtonElement>('[data-visor-prev]');
  const siguiente = $<HTMLButtonElement>('[data-visor-next]');
  const paginador = $<HTMLButtonElement>('[data-visor-pag-texto]');
  const progreso = $('[data-visor-progreso]');
  const progresoFill = $('[data-visor-progreso-fill]');
  const progresoThumb = $('[data-visor-progreso-thumb]');
  const estado = $('[data-visor-estado]');
  const irA = $('[data-visor-ir-a]');
  const irAInput = $<HTMLInputElement>('[data-visor-ir-a-input]');
  const fullscreen = $<HTMLButtonElement>('[data-visor-fullscreen]');
  const descargar = $<HTMLButtonElement>('[data-visor-download]');
  const continuar = raiz.querySelector<HTMLElement>('[data-visor-continuar]');

  let pdf: PDFDocumentProxy | null = null;
  let pagina = 1;
  let total = Math.max(1, material.paginas || 1);
  let zoom = 1;
  let panX = 0;
  let panY = 0;
  let destruido = false;
  let renderVersion = 0;
  let renderIzq: RenderTask | null = null;
  let renderDer: RenderTask | null = null;
  const abortador = new AbortController();
  const movil = () => matchMedia('(max-width: 768px)').matches;

  function mostrarEstado(titulo: string, detalle: string, error = false) {
    estado.classList.toggle('is-error', error);
    estado.innerHTML = `${error ? '<span class="libro__status-icon"><i data-lucide="file-warning" class="i"></i></span>' : '<span class="libro__loader"><i data-lucide="loader-circle" class="i spin"></i></span>'}<strong>${esc(titulo)}</strong><small>${esc(detalle)}</small>${error ? '<button class="btn btn--secondary" type="button" data-visor-retry><i data-lucide="refresh-cw" class="i"></i>Reintentar</button>' : ''}`;
    estado.hidden = false;
    import('lucide').then(({ createIcons, icons }) => createIcons({ icons }));
    estado.querySelector('[data-visor-retry]')?.addEventListener('click', () => void cargar());
  }

  function aplicarTransformacion() {
    cuerpo.style.transform = zoom === 1 && panX === 0 && panY === 0 ? '' : `scale(${zoom}) translate(${panX}px, ${panY}px)`;
    cuerpo.style.cursor = zoom > 1 ? 'grab' : '';
  }

  function fijarZoom(valor: number) {
    zoom = Math.max(1, Math.min(3, valor));
    if (zoom === 1) { panX = 0; panY = 0; }
    aplicarTransformacion();
  }

  function limpiarCanvas(canvas: HTMLCanvasElement, contenedor: HTMLElement, numero: HTMLElement) {
    const contexto = canvas.getContext('2d');
    contexto?.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = 1; canvas.height = 1;
    numero.textContent = '';
    contenedor.classList.add('libro__pagina--vacia');
  }

  async function renderPagina(pdfPage: PDFPageProxy, canvas: HTMLCanvasElement, contenedor: HTMLElement, lado: 'izq' | 'der', version: number) {
    const base = pdfPage.getViewport({ scale: 1 });
    const densidad = Math.min(window.devicePixelRatio || 1, 2);
    const altoDisponible = Math.max(420, escenario.clientHeight - 32);
    const anchoDisponible = Math.max(280, (escenario.clientWidth - (movil() ? 24 : 172)) / (movil() ? 1 : 2));
    const escalaAjuste = Math.min(anchoDisponible / base.width, altoDisponible / base.height);
    const viewport = pdfPage.getViewport({ scale: Math.max(1, Math.min(2.6, escalaAjuste * densidad)) });
    const contexto = canvas.getContext('2d', { alpha: false });
    if (!contexto || destruido || version !== renderVersion) return;

    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    canvas.style.aspectRatio = `${base.width} / ${base.height}`;
    contenedor.classList.remove('libro__pagina--vacia');
    contenedor.classList.add('is-rendering');
    if (lado === 'izq') renderIzq?.cancel(); else renderDer?.cancel();
    const tarea = pdfPage.render({ canvas, canvasContext: contexto, viewport });
    if (lado === 'izq') renderIzq = tarea; else renderDer = tarea;
    try { await tarea.promise; } catch (error: unknown) {
      if ((error as { name?: string })?.name !== 'RenderingCancelledException') throw error;
    } finally {
      contenedor.classList.remove('is-rendering');
    }
  }

  function actualizarProgreso() {
    const porcentaje = ((pagina - 1) / Math.max(total - 1, 1)) * 100;
    progresoFill.style.width = `${porcentaje}%`;
    progresoThumb.style.left = `${porcentaje}%`;
    progreso.setAttribute('aria-valuemax', String(total));
    progreso.setAttribute('aria-valuenow', String(pagina));
  }

  async function ir(destino: number, direccion = 0) {
    if (!pdf || destruido) return;
    if (zoom > 1) fijarZoom(1);
    const version = ++renderVersion;
    const esMovil = movil();
    pagina = Math.max(1, Math.min(total, destino));
    if (!esMovil && pagina % 2 === 0) pagina -= 1;
    const derecha = pagina + 1;

    anterior.disabled = pagina <= 1;
    siguiente.disabled = esMovil ? pagina >= total : derecha >= total;
    paginador.disabled = false;
    paginador.innerHTML = esMovil || derecha > total
      ? `Página <strong>${pagina}</strong> de <strong>${total}</strong>`
      : `Páginas <strong>${pagina}</strong>–<strong>${derecha}</strong> de <strong>${total}</strong>`;
    numeroIzq.textContent = String(pagina);
    numeroDer.textContent = derecha <= total ? String(derecha) : '';
    cuerpo.dataset.turn = direccion > 0 ? 'next' : direccion < 0 ? 'prev' : '';
    cuerpo.animate(
      direccion ? [{ opacity: .62, transform: `perspective(1200px) rotateY(${direccion > 0 ? '-2.5deg' : '2.5deg'})` }, { opacity: 1, transform: 'perspective(1200px) rotateY(0)' }] : [{ opacity: .82 }, { opacity: 1 }],
      { duration: 260, easing: 'cubic-bezier(.2,.7,.2,1)' },
    );

    const izquierdaPdf = await pdf.getPage(pagina);
    if (destruido || version !== renderVersion) return;
    await renderPagina(izquierdaPdf, canvasIzq, paginaIzq, 'izq', version);
    if (!esMovil && derecha <= total && !destruido && version === renderVersion) {
      const derechaPdf = await pdf.getPage(derecha);
      if (destruido || version !== renderVersion) return;
      await renderPagina(derechaPdf, canvasDer, paginaDer, 'der', version);
    } else {
      limpiarCanvas(canvasDer, paginaDer, numeroDer);
    }
    actualizarProgreso();
    guardarPagina(material.id, pagina);
  }

  async function cargar() {
    mostrarEstado('Preparando tu lectura', 'Validando el acceso y cargando el documento protegido…');
    anterior.disabled = true; siguiente.disabled = true; paginador.disabled = true;
    try {
      const url = await urlMaterial(material);
      const respuesta = await fetch(url, { cache: 'no-store', signal: abortador.signal });
      if (!respuesta.ok) throw new Error(`No se pudo cargar el documento (${respuesta.status}).`);
      const datos = await respuesta.arrayBuffer();
      const pdfjs = await import('pdfjs-dist');
      pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
      pdf = await pdfjs.getDocument({ data: datos }).promise;
      total = pdf.numPages;
      $('[data-visor-total]').textContent = `${material.tipo} · ${total} ${total === 1 ? 'página' : 'páginas'}`;
      irAInput.max = String(total);
      estado.hidden = true;
      const guardada = Math.max(1, Math.min(total, Number(raiz.dataset.saved) || 1));
      await ir(guardada);
    } catch (error) {
      if (!destruido && (error as { name?: string })?.name !== 'AbortError') mostrarEstado('No pudimos abrir el material', mensajeError(error), true);
    }
  }

  const irAnterior = () => void ir(pagina - (movil() ? 1 : 2), -1);
  const irSiguiente = () => void ir(pagina + (movil() ? 1 : 2), 1);
  anterior.addEventListener('click', irAnterior);
  siguiente.addEventListener('click', irSiguiente);
  $('[data-visor-zoom-in]').addEventListener('click', () => fijarZoom(zoom + .25));
  $('[data-visor-zoom-out]').addEventListener('click', () => fijarZoom(zoom - .25));
  fullscreen.addEventListener('click', () => document.fullscreenElement ? void document.exitFullscreen() : void raiz.requestFullscreen?.());
  descargar.addEventListener('click', async () => {
    descargar.disabled = true;
    try { window.open(await urlMaterial(material), '_blank', 'noopener,noreferrer'); }
    catch (error) { mostrarEstado('No se pudo descargar', mensajeError(error), true); }
    finally { descargar.disabled = false; }
  });

  if (continuar) {
    continuar.querySelector('[data-visor-continuar-x]')?.addEventListener('click', () => continuar.remove());
    window.setTimeout(() => continuar.remove(), 6000);
  }

  function abrirIrA() { irA.hidden = false; irAInput.value = String(pagina); irAInput.focus(); irAInput.select(); }
  function cerrarIrA() { irA.hidden = true; }
  function confirmarIrA() { const valor = Number(irAInput.value); if (valor >= 1 && valor <= total) void ir(valor, valor > pagina ? 1 : -1); cerrarIrA(); }
  paginador.addEventListener('click', abrirIrA);
  $('[data-visor-ir-a-ok]').addEventListener('click', confirmarIrA);
  $('[data-visor-ir-a-x]').addEventListener('click', cerrarIrA);
  irAInput.addEventListener('keydown', (evento) => { if (evento.key === 'Enter') confirmarIrA(); if (evento.key === 'Escape') cerrarIrA(); });

  let arrastrando = false;
  let inicioX = 0;
  let inicioY = 0;
  let baseX = 0;
  let baseY = 0;
  cuerpo.addEventListener('pointerdown', (evento) => {
    if (zoom <= 1) return;
    arrastrando = true; inicioX = evento.clientX; inicioY = evento.clientY; baseX = panX; baseY = panY;
    cuerpo.setPointerCapture(evento.pointerId); cuerpo.style.cursor = 'grabbing'; evento.preventDefault();
  });
  cuerpo.addEventListener('pointermove', (evento) => {
    if (!arrastrando) return;
    panX = baseX + (evento.clientX - inicioX) / zoom;
    panY = baseY + (evento.clientY - inicioY) / zoom;
    aplicarTransformacion();
  });
  cuerpo.addEventListener('pointerup', () => { arrastrando = false; cuerpo.style.cursor = zoom > 1 ? 'grab' : ''; });
  cuerpo.addEventListener('dblclick', (evento) => { fijarZoom(zoom > 1 ? 1 : 2); evento.preventDefault(); });
  cuerpo.addEventListener('contextmenu', (evento) => evento.preventDefault());
  escenario.addEventListener('wheel', (evento) => {
    if (!evento.ctrlKey && !evento.metaKey) return;
    evento.preventDefault(); fijarZoom(zoom + (evento.deltaY < 0 ? .15 : -.15));
  }, { passive: false });

  let toqueX = 0;
  let toqueY = 0;
  escenario.addEventListener('touchstart', (evento) => {
    if (evento.touches.length !== 1 || zoom > 1) return;
    toqueX = evento.touches[0].clientX; toqueY = evento.touches[0].clientY;
  }, { passive: true });
  escenario.addEventListener('touchend', (evento) => {
    if (!evento.changedTouches.length || zoom > 1) return;
    const dx = evento.changedTouches[0].clientX - toqueX;
    const dy = evento.changedTouches[0].clientY - toqueY;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) { if (dx < 0) irSiguiente(); else irAnterior(); }
  }, { passive: true });

  function irDesdeProgreso(evento: MouseEvent) {
    if (!pdf) return;
    const rect = progreso.getBoundingClientRect();
    const fraccion = Math.max(0, Math.min(1, (evento.clientX - rect.left) / rect.width));
    const destino = Math.round(fraccion * (total - 1)) + 1;
    void ir(destino, destino > pagina ? 1 : -1);
  }
  progreso.addEventListener('click', irDesdeProgreso);
  progreso.addEventListener('keydown', (evento) => { if (evento.key === 'ArrowLeft') irAnterior(); if (evento.key === 'ArrowRight') irSiguiente(); });

  const teclado = (evento: KeyboardEvent) => {
    if (!document.querySelector('[data-visor]') || irA.contains(document.activeElement)) return;
    if (evento.key === 'ArrowLeft') irAnterior();
    if (evento.key === 'ArrowRight' || evento.key === ' ') { evento.preventDefault(); irSiguiente(); }
    if (evento.key === 'Home') { evento.preventDefault(); void ir(1, -1); }
    if (evento.key === 'End') { evento.preventDefault(); void ir(total, 1); }
    if (evento.key.toLowerCase() === 'f') fullscreen.click();
    if (evento.key === '+' || evento.key === '=') fijarZoom(zoom + .25);
    if (evento.key === '-') fijarZoom(zoom - .25);
    if (evento.key === '0') fijarZoom(1);
  };
  document.addEventListener('keydown', teclado);

  document.addEventListener('fullscreenchange', () => {
    const icono = fullscreen.querySelector('[data-lucide]');
    icono?.setAttribute('data-lucide', document.fullscreenElement ? 'minimize' : 'maximize');
    import('lucide').then(({ createIcons, icons }) => createIcons({ icons }));
  });

  let eraMovil = movil();
  let resizeTimer = 0;
  const redimensionar = () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      const ahoraMovil = movil();
      if (pdf && (ahoraMovil !== eraMovil || document.fullscreenElement)) { eraMovil = ahoraMovil; void ir(pagina); }
    }, 180);
  };
  window.addEventListener('resize', redimensionar);

  const observador = new MutationObserver(() => {
    if (document.querySelector('[data-visor]')) return;
    destruido = true;
    abortador.abort();
    renderIzq?.cancel(); renderDer?.cancel();
    void pdf?.cleanup();
    document.body.classList.remove('visor-activo');
    document.removeEventListener('keydown', teclado);
    window.removeEventListener('resize', redimensionar);
    observador.disconnect();
  });
  observador.observe(document.getElementById('outlet')!, { childList: true });
  void cargar();
}
