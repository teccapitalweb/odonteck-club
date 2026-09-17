// Cliente Bunny con fetch falso: paginado, cabeceras, reintentos y firma de URLs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { crearClienteBunny, cuerpoTranscripcion, firmarUrlCdn, urlCaptions } from '../lib/bunny.mjs';
import { ErrorHttp, conReintentos, parsearRetryAfter, procesarEnCola } from '../lib/reintentos.mjs';

function respuesta(status, cuerpo, headers = {}) {
  return { ok: status >= 200 && status < 300, status, headers: new Headers(headers), text: async () => (cuerpo === undefined ? '' : JSON.stringify(cuerpo)) };
}
function fetchFalso(respuestas) {
  const llamadas = [];
  const fn = async (url, init) => {
    llamadas.push({ url: new URL(url), init });
    const r = respuestas.shift();
    if (r instanceof Error) throw r;
    return r;
  };
  fn.llamadas = llamadas;
  return fn;
}
const sinEspera = { esperar: async () => {}, baseMs: 1 };

test('listarVideos recorre todas las páginas con AccessKey', async () => {
  const f = fetchFalso([
    respuesta(200, { totalItems: 3, currentPage: 1, itemsPerPage: 2, items: [{ guid: 'a' }, { guid: 'b' }] }),
    respuesta(200, { totalItems: 3, currentPage: 2, itemsPerPage: 2, items: [{ guid: 'c' }] }),
  ]);
  const bunny = crearClienteBunny({ apiKey: 'llave-falsa', libraryId: '725453', fetchImpl: f, reintentos: sinEspera });
  const videos = await bunny.listarVideos({ itemsPorPagina: 2 });
  assert.deepEqual(videos.map((v) => v.guid), ['a', 'b', 'c']);
  assert.equal(f.llamadas.length, 2);
  assert.equal(f.llamadas[0].url.origin + f.llamadas[0].url.pathname, 'https://video.bunnycdn.com/library/725453/videos');
  assert.equal(f.llamadas[1].url.searchParams.get('page'), '2');
  assert.equal(f.llamadas[0].init.headers.AccessKey, 'llave-falsa');
  assert.equal(f.llamadas[0].init.method, 'GET');
});

test('listarVideos con biblioteca vacía', async () => {
  const f = fetchFalso([respuesta(200, { totalItems: 0, currentPage: 1, itemsPerPage: 100, items: [] })]);
  const bunny = crearClienteBunny({ apiKey: 'k', libraryId: '1', fetchImpl: f });
  assert.deepEqual(await bunny.listarVideos(), []);
});

test('reintenta 429 y 5xx respetando Retry-After; no reintenta 401', async () => {
  const esperas = [];
  const f = fetchFalso([respuesta(429, { m: 'lento' }, { 'retry-after': '7' }), respuesta(503, {}), respuesta(200, { totalItems: 1, items: [{ guid: 'a' }], itemsPerPage: 100 })]);
  const bunny = crearClienteBunny({ apiKey: 'k', libraryId: '1', fetchImpl: f, reintentos: { esperar: async (ms) => esperas.push(ms), baseMs: 10 } });
  assert.equal((await bunny.listarVideos()).length, 1);
  assert.equal(f.llamadas.length, 3);
  assert.ok(esperas[0] >= 7000, `respeta Retry-After (${esperas[0]})`);

  const f401 = fetchFalso([respuesta(401, { m: 'no' })]);
  const b401 = crearClienteBunny({ apiKey: 'k', libraryId: '1', fetchImpl: f401, reintentos: sinEspera });
  await assert.rejects(b401.listarVideos(), (e) => e instanceof ErrorHttp && e.status === 401);
  assert.equal(f401.llamadas.length, 1);
});

test('solicitarTranscripcion: POST con el cuerpo documentado', async () => {
  const f = fetchFalso([respuesta(200, { success: true, message: null, statusCode: 200 })]);
  const bunny = crearClienteBunny({ apiKey: 'k', libraryId: '725453', fetchImpl: f });
  const r = await bunny.solicitarTranscripcion('v-1');
  assert.equal(r.success, true);
  const { url, init } = f.llamadas[0];
  assert.equal(init.method, 'POST');
  assert.equal(url.pathname, '/library/725453/videos/v-1/transcribe');
  assert.equal(url.searchParams.has('force'), false);
  assert.deepEqual(JSON.parse(init.body), cuerpoTranscripcion('es'));
  assert.deepEqual(JSON.parse(init.body).targetLanguages, ['es']);
  assert.equal(JSON.parse(init.body).generateTitle, false);

  const f2 = fetchFalso([respuesta(200, { success: true })]);
  await crearClienteBunny({ apiKey: 'k', libraryId: '1', fetchImpl: f2 }).solicitarTranscripcion('v-1', { forzar: true });
  assert.equal(f2.llamadas[0].url.searchParams.get('force'), 'true');
});

test('crearClienteBunny exige credenciales', () => {
  assert.throws(() => crearClienteBunny({ libraryId: '1' }), /BUNNY_API_KEY/);
  assert.throws(() => crearClienteBunny({ apiKey: 'k' }), /BUNNY_LIBRARY_ID/);
});

test('urlCaptions y firmarUrlCdn', () => {
  assert.equal(urlCaptions({ videoId: 'abc', idioma: 'es' }), 'https://vz-f5a76892-30a.b-cdn.net/abc/captions/es.vtt');
  const firmada = new URL(firmarUrlCdn('https://zona.b-cdn.net/abc/captions/es.vtt', { llave: 'secreto', ttlSegundos: 60, ahora: 1_000_000 }));
  assert.equal(firmada.searchParams.get('expires'), String(1000 + 60));
  const esperado = createHmac('sha256', 'secreto').update('/abc/captions/es.vtt1060').digest('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  assert.equal(firmada.searchParams.get('token'), `HS256-${esperado}`);
  assert.throws(() => firmarUrlCdn('https://zona.b-cdn.net/x', {}), /BUNNY_CDN_TOKEN_KEY/);
});

test('conReintentos: errores de red se reintentan, errores de programación no', async () => {
  let n = 0;
  const r = await conReintentos(async () => { if (n++ < 2) throw new TypeError('fetch failed'); return 'ok'; }, sinEspera);
  assert.equal(r, 'ok');
  let m = 0;
  await assert.rejects(conReintentos(async () => { m++; throw new SyntaxError('JSON'); }, sinEspera), SyntaxError);
  assert.equal(m, 1);
  let k = 0;
  await assert.rejects(conReintentos(async () => { k++; throw new ErrorHttp(500, 'x'); }, { ...sinEspera, intentos: 3 }), /x/);
  assert.equal(k, 3);
});

test('parsearRetryAfter en segundos y fecha', () => {
  assert.equal(parsearRetryAfter('3'), 3000);
  assert.equal(parsearRetryAfter(new Date(10_000).toUTCString(), 4_000), 6000);
  assert.equal(parsearRetryAfter(null), undefined);
});

test('procesarEnCola limita concurrencia y no lanza', async () => {
  let activas = 0;
  let max = 0;
  const r = await procesarEnCola([1, 2, 3, 4, 5], async (x) => {
    activas++; max = Math.max(max, activas);
    await new Promise((res) => setTimeout(res, 5));
    activas--;
    if (x === 3) throw new Error('falla 3');
    return x * 2;
  }, { concurrencia: 2 });
  assert.equal(max, 2);
  assert.deepEqual(r.map((x) => x.ok), [true, true, false, true, true]);
  assert.equal(r[4].valor, 10);
});
