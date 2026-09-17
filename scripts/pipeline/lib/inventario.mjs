// Cruce entre catalogo.json y la lista de videos de Bunny.
import { captionEspanol, parsearResoluciones, STATUS_BUNNY } from './bunny.mjs';
import { segundosAMinutos } from './tiempo.mjs';

/**
 * @param {{ libraryId:string, cursos: Array<{id,titulo,clases:Array<{n,titulo,videoId}>}> }} catalogo
 * @param {Array<object>} videosBunny  items de GET /library/{id}/videos
 * @returns inventario listo para escribir en out/inventario.json
 */
export function cruzarInventario(catalogo, videosBunny, { ahora = new Date() } = {}) {
  const porGuid = new Map(videosBunny.map((v) => [v.guid, v]));
  const enCatalogo = new Set();
  const clases = [];
  const faltantesEnBunny = [];
  const duplicadosEnCatalogo = [];

  for (const curso of catalogo.cursos) {
    for (const clase of curso.clases) {
      if (enCatalogo.has(clase.videoId)) duplicadosEnCatalogo.push({ cursoId: curso.id, n: clase.n, videoId: clase.videoId });
      enCatalogo.add(clase.videoId);
      const v = porGuid.get(clase.videoId);
      const base = { cursoId: curso.id, n: clase.n, videoId: clase.videoId, tituloCatalogo: clase.titulo };
      if (!v) {
        faltantesEnBunny.push(base);
        clases.push({ ...base, enBunny: false });
        continue;
      }
      const es = captionEspanol(v.captions);
      clases.push({
        ...base,
        enBunny: true,
        tituloBunny: v.title ?? null,
        duracionSeg: Number.isFinite(v.length) ? v.length : null,
        duracionMin: segundosAMinutos(v.length),
        status: v.status ?? null,
        statusTexto: STATUS_BUNNY[v.status] ?? 'Desconocido',
        availableResolutions: parsearResoluciones(v.availableResolutions),
        captions: (v.captions ?? []).map(({ srclang, label, version }) => ({ srclang, label, version })),
        tieneCaptionsEs: Boolean(es),
        idiomaCaptionEs: es?.srclang ?? null,
        collectionId: v.collectionId ?? null,
      });
    }
  }

  const noEnCatalogo = videosBunny
    .filter((v) => !enCatalogo.has(v.guid))
    .map((v) => ({ videoId: v.guid, titulo: v.title ?? null, duracionSeg: v.length ?? null, collectionId: v.collectionId ?? null }));

  const encontradas = clases.filter((c) => c.enBunny);
  return {
    generado: ahora.toISOString(),
    libraryId: String(catalogo.libraryId),
    resumen: {
      clasesCatalogo: clases.length,
      videosBunny: videosBunny.length,
      encontradas: encontradas.length,
      faltantesEnBunny: faltantesEnBunny.length,
      noEnCatalogo: noEnCatalogo.length,
      conCaptionsEs: encontradas.filter((c) => c.tieneCaptionsEs).length,
      sinTerminarDeProcesar: encontradas.filter((c) => c.status !== 4).length,
      minutosTotales: Math.round(encontradas.reduce((a, c) => a + (c.duracionSeg ?? 0), 0) / 60),
    },
    clases,
    faltantesEnBunny,
    noEnCatalogo,
    duplicadosEnCatalogo,
  };
}

/** Índice videoId → clase del inventario. */
export function indicePorVideo(inventario) {
  return new Map((inventario?.clases ?? []).map((c) => [c.videoId, c]));
}

/** Videos del catálogo presentes en Bunny, terminados de procesar y sin captions en español. */
export function seleccionarPendientes(inv, solicitadas = {}, { solo, forzar = false } = {}) {
  return inv.clases.filter((c) => {
    if (solo && c.videoId !== solo) return false;
    if (!c.enBunny) return false;
    if (forzar) return true;
    if (c.status !== 4) return false;
    return !c.tieneCaptionsEs && !solicitadas[c.videoId];
  });
}
