#!/usr/bin/env node
// Paso 1 · Inventario: cruza los videos de Bunny Stream con src/data/catalogo.json.
import { crearClienteBunny } from './lib/bunny.mjs';
import { avisoModo, ejecutar, escribirJson, leerArgs, leerCatalogo, leerJson, requerirEnv, rutas, RUTA_CATALOGO } from './lib/cli.mjs';
import { cruzarInventario } from './lib/inventario.mjs';

const AYUDA = `
bunny-inventario.mjs · Lista los videos de la biblioteca de Bunny y los cruza con el catálogo.

Uso:
  node bunny-inventario.mjs              dry-run: consulta Bunny (solo lectura) e imprime el reporte
  node bunny-inventario.mjs --apply      además escribe out/inventario.json

Opciones:
  --desde-json <archivo>   usa un JSON guardado con los videos de Bunny (arreglo o { items }) en vez de llamar a la API
  --catalogo <archivo>     catálogo a cruzar (por defecto ${RUTA_CATALOGO})
  --apply                  escribe out/inventario.json
  -h, --help               esta ayuda

Variables: BUNNY_API_KEY, BUNNY_LIBRARY_ID (no hacen falta con --desde-json)
Salida: duración (length en s), título en Bunny, availableResolutions, captions y si hay captions en español,
        más las clases que faltan en Bunny y los videos de Bunny que no están en el catálogo.
`;

ejecutar(async () => {
  const args = leerArgs({ 'desde-json': { type: 'string' }, catalogo: { type: 'string' } });
  if (args.help) return console.log(AYUDA);
  avisoModo(args.aplicar);

  const catalogo = leerCatalogo(args.catalogo);
  let videos;
  if (args['desde-json']) {
    const crudo = leerJson(args['desde-json']);
    videos = Array.isArray(crudo) ? crudo : crudo.items ?? [];
    console.log(`Videos leídos de ${args['desde-json']}: ${videos.length}`);
  } else {
    const libraryId = requerirEnv('BUNNY_LIBRARY_ID');
    if (String(libraryId) !== String(catalogo.libraryId)) {
      console.warn(`⚠ BUNNY_LIBRARY_ID (${libraryId}) no coincide con catalogo.libraryId (${catalogo.libraryId})`);
    }
    const bunny = crearClienteBunny({ apiKey: requerirEnv('BUNNY_API_KEY'), libraryId, log: console.log });
    console.log(`Consultando biblioteca ${libraryId}…`);
    videos = await bunny.listarVideos();
  }

  const inv = cruzarInventario(catalogo, videos);
  imprimirReporte(inv);

  if (args.aplicar) {
    escribirJson(rutas.inventario(), inv);
    console.log(`\n✓ Escrito ${rutas.inventario()}`);
  } else {
    console.log('\n(dry-run) No se escribió out/inventario.json. Repite con --apply.');
  }
});

function imprimirReporte(inv) {
  const r = inv.resumen;
  console.log(`\nClases en catálogo: ${r.clasesCatalogo} · videos en Bunny: ${r.videosBunny} · encontradas: ${r.encontradas}`);
  console.log(`Con captions en español: ${r.conCaptionsEs} · sin terminar de procesar: ${r.sinTerminarDeProcesar} · minutos totales: ${r.minutosTotales}`);
  if (inv.faltantesEnBunny.length) {
    console.log(`\n✗ ${inv.faltantesEnBunny.length} clases del catálogo NO existen en Bunny:`);
    for (const c of inv.faltantesEnBunny) console.log(`   ${c.cursoId} #${c.n}  ${c.videoId}`);
  }
  if (inv.noEnCatalogo.length) {
    console.log(`\n? ${inv.noEnCatalogo.length} videos de Bunny que no están en el catálogo:`);
    for (const v of inv.noEnCatalogo) console.log(`   ${v.videoId}  ${v.titulo ?? ''}  (${v.duracionSeg ?? '?'} s)`);
  }
  if (inv.duplicadosEnCatalogo.length) {
    console.log(`\n⚠ videoId repetido en el catálogo:`);
    for (const c of inv.duplicadosEnCatalogo) console.log(`   ${c.cursoId} #${c.n}  ${c.videoId}`);
  }
  const noTerminados = inv.clases.filter((c) => c.enBunny && c.status !== 4);
  if (noTerminados.length) {
    console.log('\n⚠ Videos que Bunny aún no marca como Finished (status 4):');
    for (const c of noTerminados) console.log(`   ${c.cursoId} #${c.n}  ${c.videoId}  ${c.statusTexto}`);
  }
}
