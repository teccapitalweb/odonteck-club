#!/usr/bin/env node
// Paso 2 · Solicita a Bunny la transcripción automática en español de los videos que aún no tienen captions.
import { crearClienteBunny } from './lib/bunny.mjs';
import { avisoModo, ejecutar, escribirJson, leerArgs, leerInventario, leerJsonSiExiste, requerirEnv, rutas } from './lib/cli.mjs';
import { seleccionarPendientes } from './lib/inventario.mjs';
import { procesarEnCola } from './lib/reintentos.mjs';

const AYUDA = `
bunny-transcribir.mjs · Pide a Bunny Stream la transcripción automática (captions 'es') de cada video sin captions en español.

Uso:
  node bunny-transcribir.mjs                      dry-run: lista qué videos se enviarían
  node bunny-transcribir.mjs --solo <videoId>     limita a un video (úsalo primero para validar el endpoint)
  node bunny-transcribir.mjs --apply              envía las solicitudes

Opciones:
  --solo <videoId>        procesa solo ese video
  --forzar                re-encola aunque ya tenga captions o ya se haya solicitado (?force=true)
  --concurrencia <n>      solicitudes simultáneas (por defecto 2)
  --pausa-ms <ms>         pausa entre solicitudes (por defecto 1500)
  --apply                 ejecuta las solicitudes (tienen costo en Bunny)
  -h, --help

Variables: BUNNY_API_KEY, BUNNY_LIBRARY_ID
Requiere: out/inventario.json (bunny-inventario.mjs --apply). Registra lo solicitado en out/transcripciones-solicitadas.json
para no pedir dos veces el mismo video. Bunny tarda en generar los captions: vuelve a correr el inventario más tarde.
`;

ejecutar(async () => {
  const args = leerArgs({
    solo: { type: 'string' },
    forzar: { type: 'boolean', default: false },
    concurrencia: { type: 'string', default: '2' },
    'pausa-ms': { type: 'string', default: '1500' },
  });
  if (args.help) return console.log(AYUDA);
  avisoModo(args.aplicar);

  const inv = leerInventario();
  const solicitadas = leerJsonSiExiste(rutas.solicitudesTranscripcion(), {});
  const pendientes = seleccionarPendientes(inv, solicitadas, { solo: args.solo, forzar: args.forzar });

  if (args.solo && !inv.clases.some((c) => c.videoId === args.solo)) throw new Error(`El video ${args.solo} no está en el inventario`);
  console.log(`\nVideos a transcribir: ${pendientes.length}`);
  for (const c of pendientes) console.log(`   ${c.cursoId} #${c.n}  ${c.videoId}  (${c.duracionMin ?? '?'} min)`);
  const minutos = pendientes.reduce((a, c) => a + (c.duracionMin ?? 0), 0);
  console.log(`Minutos de video: ${minutos} (revisa la tarifa de transcripción vigente en tu panel de Bunny).`);

  if (!args.aplicar || !pendientes.length) {
    if (!args.aplicar) console.log('\n(dry-run) No se envió ninguna solicitud.');
    return;
  }

  const bunny = crearClienteBunny({ apiKey: requerirEnv('BUNNY_API_KEY'), libraryId: requerirEnv('BUNNY_LIBRARY_ID'), log: console.log });
  const resultados = await procesarEnCola(pendientes, async (c) => {
    const r = await bunny.solicitarTranscripcion(c.videoId, { idioma: 'es', forzar: args.forzar });
    if (r && r.success === false) throw new Error(r.message ?? `Bunny respondió success=false (${r.statusCode})`);
    // Se guarda al momento para no perder el registro si el proceso se interrumpe.
    solicitadas[c.videoId] = { fecha: new Date().toISOString(), cursoId: c.cursoId, n: c.n, respuesta: r ?? null };
    escribirJson(rutas.solicitudesTranscripcion(), solicitadas);
    console.log(`   ✓ ${c.videoId}`);
    return r;
  }, { concurrencia: Number(args.concurrencia), pausaMs: Number(args['pausa-ms']) });

  const fallos = resultados.filter((r) => !r.ok);
  console.log(`\nSolicitadas: ${resultados.length - fallos.length} · fallidas: ${fallos.length}`);
  for (const f of fallos) console.log(`   ✗ ${f.elemento.videoId}: ${f.error.message}`);
  if (fallos.length) process.exitCode = 1;
});

