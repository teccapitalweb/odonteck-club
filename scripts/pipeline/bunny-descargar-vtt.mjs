#!/usr/bin/env node
// Paso 3 · Descarga los .vtt en español desde el CDN de Bunny y los convierte a transcripciones JSON.
import { existsSync, readFileSync } from 'node:fs';
import { CDN_HOSTNAME_POR_DEFECTO, firmarUrlCdn, urlCaptions } from './lib/bunny.mjs';
import { avisoModo, ejecutar, escribirJson, escribirTexto, leerArgs, leerInventario, rutas } from './lib/cli.mjs';
import { ErrorHttp, conReintentos, parsearRetryAfter, procesarEnCola } from './lib/reintentos.mjs';
import { parsearVtt } from './lib/vtt.mjs';

const AYUDA = `
bunny-descargar-vtt.mjs · Descarga out/vtt/<videoId>.vtt y genera out/transcripciones/<videoId>.json
                          con { videoId, idioma, duracionSeg, segmentos: [{ inicio, fin, texto }], texto }.

Uso:
  node bunny-descargar-vtt.mjs                    dry-run: lista las URLs que se descargarían
  node bunny-descargar-vtt.mjs --apply            descarga y parsea
  node bunny-descargar-vtt.mjs --solo-parsear --apply   re-parsea los .vtt ya descargados, sin red

Opciones:
  --solo <videoId>        solo ese video
  --reemplazar            vuelve a descargar aunque exista el .vtt
  --solo-parsear          no descarga; parsea lo que haya en out/vtt/
  --concurrencia <n>      descargas simultáneas (por defecto 4)
  --apply
  -h, --help

Variables:
  BUNNY_CDN_HOSTNAME      Pull Zone de la biblioteca (por defecto ${CDN_HOSTNAME_POR_DEFECTO})
  BUNNY_CDN_TOKEN_KEY     solo si la Pull Zone tiene Token Authentication (sin firma el CDN responde 403).
                          Es la llave de la Pull Zone, distinta de BUNNY_TOKEN_AUTH_KEY (embed).
                          La firma (lib/bunny.mjs → firmarUrlCdn) está pendiente de verificar contra una zona real.
Requiere: out/inventario.json. Solo toma videos cuyo inventario marca captions en español.
`;

ejecutar(async () => {
  const args = leerArgs({
    solo: { type: 'string' },
    reemplazar: { type: 'boolean', default: false },
    'solo-parsear': { type: 'boolean', default: false },
    concurrencia: { type: 'string', default: '4' },
  });
  if (args.help) return console.log(AYUDA);
  avisoModo(args.aplicar);

  const inv = leerInventario();
  const cdnHostname = process.env.BUNNY_CDN_HOSTNAME || CDN_HOSTNAME_POR_DEFECTO;
  const llaveToken = process.env.BUNNY_CDN_TOKEN_KEY || null;

  const candidatas = inv.clases.filter((c) => c.enBunny && (!args.solo || c.videoId === args.solo));
  const sinCaptions = candidatas.filter((c) => !c.tieneCaptionsEs);
  const conCaptions = candidatas.filter((c) => c.tieneCaptionsEs);
  if (sinCaptions.length) console.log(`⚠ ${sinCaptions.length} videos aún sin captions en español (corre bunny-transcribir y vuelve a hacer inventario).`);

  const trabajos = conCaptions.map((c) => {
    const idioma = c.idiomaCaptionEs ?? 'es';
    const url = urlCaptions({ cdnHostname, videoId: c.videoId, idioma });
    const yaDescargado = existsSync(rutas.vtt(c.videoId));
    return { ...c, idioma, url, descargar: !args['solo-parsear'] && (args.reemplazar || !yaDescargado), yaDescargado };
  });

  console.log(`\nCon captions: ${trabajos.length} · a descargar: ${trabajos.filter((t) => t.descargar).length} · token auth: ${llaveToken ? 'sí' : 'no'}`);
  if (!args.aplicar) {
    for (const t of trabajos) console.log(`   ${t.descargar ? '↓' : '='} ${t.cursoId} #${t.n}  ${t.url}`);
    console.log('\n(dry-run) No se descargó ni escribió nada.');
    return;
  }

  const resultados = await procesarEnCola(trabajos, async (t) => {
    if (t.descargar) {
      const url = llaveToken ? firmarUrlCdn(t.url, { llave: llaveToken, ttlSegundos: 600 }) : t.url;
      const vtt = await descargarTexto(url, t.videoId);
      escribirTexto(rutas.vtt(t.videoId), vtt);
    } else if (!t.yaDescargado) {
      throw new Error('no hay .vtt descargado para parsear');
    }
    const { segmentos, texto } = parsearVtt(readFileSync(rutas.vtt(t.videoId), 'utf8'));
    if (!segmentos.length) throw new Error('el VTT no tiene cues con texto');
    escribirJson(rutas.transcripcion(t.videoId), {
      videoId: t.videoId,
      cursoId: t.cursoId,
      n: t.n,
      idioma: t.idioma,
      duracionSeg: t.duracionSeg ?? null,
      generado: new Date().toISOString(),
      segmentos,
      texto,
    });
    console.log(`   ✓ ${t.cursoId} #${t.n}: ${segmentos.length} segmentos, ${texto.split(/\s+/).length} palabras`);
  }, { concurrencia: Number(args.concurrencia) });

  const fallos = resultados.filter((r) => !r.ok);
  console.log(`\nListas: ${resultados.length - fallos.length} · fallidas: ${fallos.length}`);
  for (const f of fallos) console.log(`   ✗ ${f.elemento.videoId}: ${f.error.message}`);
  if (fallos.length) process.exitCode = 1;
});

async function descargarTexto(url, videoId) {
  return conReintentos(async () => {
    const res = await fetch(url);
    if (res.status === 403 || res.status === 401) {
      throw new ErrorHttp(res.status, `HTTP ${res.status} para ${videoId}: la Pull Zone probablemente exige Token Authentication (define BUNNY_CDN_TOKEN_KEY)`);
    }
    if (!res.ok) throw new ErrorHttp(res.status, `HTTP ${res.status} al descargar el VTT de ${videoId}`, { retryAfterMs: parsearRetryAfter(res.headers.get('retry-after')) });
    return res.text();
  }, { intentos: 4 });
}
