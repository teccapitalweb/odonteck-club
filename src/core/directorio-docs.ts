// Documentos del Directorio (CV, títulos, constancias): preparación en el navegador,
// miniaturas reales (primera página del PDF o la propia imagen) y visor ampliado.
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { Datos } from './datos';
import { Directorio, leerArchivoDemo, type DocumentoDirectorio, type DocumentoPreparado } from './directorio';

const PDF_MAX = 10_000_000;
const IMG_ORIGINAL_MAX = 15_000_000;
const IMG_MAX = 6_000_000;
const MINIATURA_ANCHO = 560;

export const TIPOS_DOCUMENTO: Record<string, string> = {
  cv: 'CV', titulo: 'Título o cédula', certificado: 'Certificado', constancia: 'Constancia', portafolio: 'Portafolio', otro: 'Documento',
};

async function pdfjs() {
  const lib = await import('pdfjs-dist');
  lib.GlobalWorkerOptions.workerSrc = workerUrl;
  return lib;
}

const aWebp = (canvas: HTMLCanvasElement, calidad: number) =>
  new Promise<Blob>((ok, err) => canvas.toBlob((b) => b ? ok(b) : err(new Error('No pudimos generar la vista previa.')), 'image/webp', calidad));

async function primeraPagina(pdf: PDFDocumentProxy, ancho = MINIATURA_ANCHO) {
  const pagina = await pdf.getPage(1);
  const base = pagina.getViewport({ scale: 1 });
  const viewport = pagina.getViewport({ scale: ancho / base.width });
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(viewport.width); canvas.height = Math.round(viewport.height);
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  await pagina.render({ canvas, canvasContext: ctx, viewport }).promise;
  return canvas;
}

async function imagenEnCanvas(src: string, anchoMax: number) {
  const img = await new Promise<HTMLImageElement>((ok, err) => { const el = new Image(); el.onload = () => ok(el); el.onerror = () => err(new Error('No pudimos leer la imagen.')); el.src = src; });
  const escala = Math.min(1, anchoMax / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.naturalWidth * escala); canvas.height = Math.round(img.naturalHeight * escala);
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
}

/** Valida y procesa el archivo elegido: PDF tal cual (con miniatura de su primera página) o imagen optimizada a WebP. */
export async function prepararDocumento(file: File): Promise<DocumentoPreparado> {
  const nombreSugerido = file.name.replace(/\.[a-z0-9]+$/i, '').replace(/[_-]+/g, ' ').replace(/[<>]/g, '').trim().slice(0, 90) || 'Documento';
  const esPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
  if (esPdf) {
    if (file.size > PDF_MAX) throw new Error('El PDF debe pesar menos de 10 MB.');
    const datos = new Uint8Array(await file.arrayBuffer());
    if (String.fromCharCode(...datos.slice(0, 5)) !== '%PDF-') throw new Error('Ese archivo no parece un PDF válido.');
    const lib = await pdfjs();
    const pdf = await lib.getDocument({ data: datos.slice() }).promise;
    try {
      const miniatura = await aWebp(await primeraPagina(pdf), .82);
      return { archivo: new Blob([datos], { type: 'application/pdf' }), mime: 'application/pdf', miniatura, preview: URL.createObjectURL(miniatura), paginas: pdf.numPages, nombreSugerido };
    } finally { void pdf.cleanup(); }
  }
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error('Sube un PDF o una imagen JPG, PNG o WebP.');
  if (file.size > IMG_ORIGINAL_MAX) throw new Error('La imagen original debe pesar menos de 15 MB.');
  const origen = URL.createObjectURL(file);
  try {
    const archivo = await aWebp(await imagenEnCanvas(origen, 2200), .86);
    if (archivo.size > IMG_MAX) throw new Error('La imagen optimizada todavía supera 6 MB. Prueba con otra.');
    const miniatura = await aWebp(await imagenEnCanvas(origen, MINIATURA_ANCHO), .8);
    return { archivo, mime: 'image/webp', miniatura, preview: URL.createObjectURL(miniatura), paginas: null, nombreSugerido };
  } finally { URL.revokeObjectURL(origen); }
}

// ── Resolución de enlaces (API firmada, IndexedDB del demo o archivo de ejemplo) ──
const cacheUrls = new Map<string, Promise<{ archivo: string | null; miniatura: string | null }>>();

function urlsDe(uid: string, doc: DocumentoDirectorio) {
  const clave = `${uid}/${doc.id}/${doc.url ?? ''}`;
  let p = cacheUrls.get(clave);
  if (!p) {
    p = (async () => {
      if (!doc.accesible) return { archivo: null, miniatura: null };
      if (Datos.modo === 'api') return { archivo: doc.url ?? null, miniatura: doc.miniatura ?? null };
      if (doc.url) {
        // Documento de ejemplo servido por el propio sitio: la miniatura se calcula aquí mismo.
        if (doc.mime !== 'application/pdf') return { archivo: doc.url, miniatura: doc.url };
        const lib = await pdfjs();
        const pdf = await lib.getDocument({ url: doc.url }).promise;
        try { return { archivo: doc.url, miniatura: URL.createObjectURL(await aWebp(await primeraPagina(pdf), .82)) }; }
        finally { void pdf.cleanup(); }
      }
      const guardado = await leerArchivoDemo(doc.id);
      if (!guardado) return { archivo: null, miniatura: null };
      return { archivo: URL.createObjectURL(guardado.archivo), miniatura: URL.createObjectURL(guardado.miniatura) };
    })();
    p.catch(() => cacheUrls.delete(clave));
    cacheUrls.set(clave, p);
  }
  return p;
}

const buscarDoc = (uid: string, id: string) => Directorio.ficha(uid)?.documentos.find((d) => d.id === id) ?? null;

/** Rellena las miniaturas de la página tras cada render. */
export function montarDocumentosDirectorio() {
  document.querySelectorAll<HTMLImageElement>('img[data-doc-thumb]:not([data-montada])').forEach((img) => {
    img.dataset.montada = '1';
    const doc = buscarDoc(img.dataset.uid || '', img.dataset.id || '');
    if (!doc) return;
    const marco = img.closest<HTMLElement>('[data-doc-frame]');
    urlsDe(img.dataset.uid || '', doc).then(({ miniatura }) => {
      if (!miniatura) { marco?.classList.add('is-missing'); return; }
      img.onload = () => marco?.classList.add('is-ready');
      img.onerror = () => marco?.classList.add('is-missing');
      img.src = miniatura;
    }).catch(() => marco?.classList.add('is-missing'));
  });
}

// ── Visor ampliado ──
let visorActual: { cerrar: () => void } | null = null;

export async function abrirVisorDocumento(uid: string, id: string) {
  const doc = buscarDoc(uid, id);
  if (!doc || !doc.accesible) return;
  visorActual?.cerrar();
  const esPdf = doc.mime === 'application/pdf';
  const dialog = document.createElement('dialog');
  dialog.className = 'doc-viewer';
  dialog.setAttribute('aria-label', `Documento: ${doc.nombre}`);
  const titulo = document.createElement('div');
  titulo.className = 'doc-viewer__title';
  const tipo = document.createElement('span'); tipo.textContent = TIPOS_DOCUMENTO[doc.tipo] ?? 'Documento';
  const nombre = document.createElement('strong'); nombre.textContent = doc.nombre;
  const detalle = document.createElement('small'); detalle.textContent = esPdf ? (doc.paginas ? `${doc.paginas} ${doc.paginas === 1 ? 'página' : 'páginas'}` : 'PDF') : 'Imagen';
  titulo.append(tipo, nombre, detalle);
  const acciones = document.createElement('div'); acciones.className = 'doc-viewer__actions';
  acciones.innerHTML = '<a class="btn btn--secondary btn--sm" data-doc-viewer-open target="_blank" rel="noopener" hidden><i data-lucide="external-link" class="i"></i><span>Abrir aparte</span></a><button type="button" class="doc-viewer__close" data-doc-viewer-close aria-label="Cerrar documento"><i data-lucide="x" class="i"></i></button>';
  const cabecera = document.createElement('header'); cabecera.append(titulo, acciones);
  const cuerpo = document.createElement('div'); cuerpo.className = 'doc-viewer__body';
  cuerpo.innerHTML = '<div class="doc-viewer__loading"><i data-lucide="loader-circle" class="i"></i>Preparando documento…</div>';
  dialog.append(cabecera, cuerpo);
  document.body.append(dialog);
  let pdf: PDFDocumentProxy | null = null;
  let vivo = true;
  const cerrar = () => { vivo = false; if (dialog.open) dialog.close(); dialog.remove(); void pdf?.cleanup(); document.documentElement.classList.remove('doc-viewer-open'); if (visorActual?.cerrar === cerrar) visorActual = null; };
  visorActual = { cerrar };
  dialog.addEventListener('close', cerrar);
  dialog.addEventListener('click', (e) => { const t = e.target as HTMLElement; if (t === dialog || t.closest('[data-doc-viewer-close]')) cerrar(); });
  document.documentElement.classList.add('doc-viewer-open');
  dialog.showModal();
  const { createIcons, icons } = await import('lucide');
  createIcons({ icons });

  try {
    const { archivo, miniatura } = await urlsDe(uid, doc);
    if (!archivo) throw new Error('El enlace del documento expiró. Recarga la página.');
    const abrir = acciones.querySelector<HTMLAnchorElement>('[data-doc-viewer-open]')!;
    abrir.href = archivo; abrir.hidden = false;
    if (!esPdf) {
      const img = document.createElement('img'); img.className = 'doc-viewer__image'; img.alt = doc.nombre; img.src = archivo;
      cuerpo.replaceChildren(img); return;
    }
    const lib = await pdfjs();
    try { pdf = await lib.getDocument({ url: archivo }).promise; }
    catch {
      // Sin acceso directo al PDF (p. ej. el almacenamiento no permite leerlo desde el sitio):
      // mostramos la portada en grande y el botón para abrirlo completo.
      const aviso = document.createElement('div'); aviso.className = 'doc-viewer__fallback';
      if (miniatura) { const img = document.createElement('img'); img.src = miniatura; img.alt = doc.nombre; aviso.append(img); }
      const p = document.createElement('p'); p.textContent = 'Usa «Abrir aparte» para leer el PDF completo.'; aviso.append(p);
      cuerpo.replaceChildren(aviso); return;
    }
    if (!vivo) return;
    cuerpo.replaceChildren();
    const total = Math.min(pdf.numPages, 40);
    const ancho = Math.min(cuerpo.clientWidth - 24, 900);
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    for (let n = 1; n <= total && vivo; n++) {
      const pagina = await pdf.getPage(n);
      const base = pagina.getViewport({ scale: 1 });
      const viewport = pagina.getViewport({ scale: (ancho / base.width) * ratio });
      const canvas = document.createElement('canvas');
      canvas.className = 'doc-viewer__page';
      canvas.width = Math.round(viewport.width); canvas.height = Math.round(viewport.height);
      canvas.style.width = `${Math.round(viewport.width / ratio)}px`;
      canvas.setAttribute('aria-label', `Página ${n} de ${pdf.numPages}`);
      cuerpo.append(canvas);
      const ctx = canvas.getContext('2d')!;
      await pagina.render({ canvas, canvasContext: ctx, viewport }).promise;
    }
    if (pdf.numPages > total && vivo) { const mas = document.createElement('p'); mas.className = 'doc-viewer__more'; mas.textContent = `Se muestran ${total} de ${pdf.numPages} páginas. Usa «Abrir aparte» para ver el resto.`; cuerpo.append(mas); }
  } catch (err) {
    if (!vivo) return;
    const p = document.createElement('p'); p.className = 'doc-viewer__error';
    p.textContent = err instanceof Error ? err.message : 'No pudimos abrir el documento.';
    cuerpo.replaceChildren(p);
  }
}
