import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cruzarInventario, indicePorVideo, seleccionarPendientes } from '../lib/inventario.mjs';
import { captionEspanol, parsearResoluciones } from '../lib/bunny.mjs';
import { fixtureJson } from './helpers.mjs';

const catalogo = fixtureJson('catalogo-mini.json');
const videos = fixtureJson('bunny-videos.json');
const inv = cruzarInventario(catalogo, videos, { ahora: new Date('2026-09-17T12:00:00Z') });

test('cruza catálogo y Bunny por videoId', () => {
  assert.equal(inv.libraryId, '725453');
  assert.equal(inv.generado, '2026-09-17T12:00:00.000Z');
  assert.deepEqual(inv.resumen, {
    clasesCatalogo: 3, videosBunny: 3, encontradas: 2, faltantesEnBunny: 1, noEnCatalogo: 1,
    conCaptionsEs: 1, sinTerminarDeProcesar: 0, minutosTotales: 71,
  });
  const c1 = indicePorVideo(inv).get('v-1');
  assert.equal(c1.tituloBunny, 'Ortodoncia sesion 1.mp4');
  assert.equal(c1.duracionSeg, 1830);
  assert.equal(c1.duracionMin, 31);
  assert.deepEqual(c1.availableResolutions, ['360p', '720p', '1080p']);
  assert.equal(c1.tieneCaptionsEs, true);
  assert.equal(c1.idiomaCaptionEs, 'es');
  assert.equal(indicePorVideo(inv).get('v-2').tieneCaptionsEs, false);
});

test('reporta faltantes en Bunny y videos fuera del catálogo', () => {
  assert.deepEqual(inv.faltantesEnBunny, [{ cursoId: 'periodoncia-basica', n: 1, videoId: 'v-3', tituloCatalogo: 'Clase 1' }]);
  assert.deepEqual(inv.noEnCatalogo, [{ videoId: 'v-extra', titulo: 'Webinar suelto', duracionSeg: 600, collectionId: null }]);
  assert.equal(inv.clases.find((c) => c.videoId === 'v-3').enBunny, false);
});

test('detecta videoId repetido en el catálogo', () => {
  const dup = structuredClone(catalogo);
  dup.cursos[1].clases[0].videoId = 'v-1';
  const r = cruzarInventario(dup, videos);
  assert.deepEqual(r.duplicadosEnCatalogo, [{ cursoId: 'periodoncia-basica', n: 1, videoId: 'v-1' }]);
});

test('seleccionarPendientes: solo terminados, sin captions es y no solicitados', () => {
  assert.deepEqual(seleccionarPendientes(inv).map((c) => c.videoId), ['v-2']);
  assert.deepEqual(seleccionarPendientes(inv, { 'v-2': { fecha: 'x' } }).map((c) => c.videoId), []);
  assert.deepEqual(seleccionarPendientes(inv, {}, { solo: 'v-1' }).map((c) => c.videoId), []);
  assert.deepEqual(seleccionarPendientes(inv, {}, { solo: 'v-1', forzar: true }).map((c) => c.videoId), ['v-1']);
  const procesando = structuredClone(inv);
  procesando.clases.find((c) => c.videoId === 'v-2').status = 3;
  assert.deepEqual(seleccionarPendientes(procesando), []);
});

test('captionEspanol y parsearResoluciones', () => {
  assert.equal(captionEspanol([{ srclang: 'en' }, { srclang: 'es-MX' }]).srclang, 'es-MX');
  assert.equal(captionEspanol([{ srclang: 'et' }]), null);
  assert.equal(captionEspanol(undefined), null);
  assert.deepEqual(parsearResoluciones(''), []);
  assert.deepEqual(parsearResoluciones(' 360p, 720p '), ['360p', '720p']);
  assert.deepEqual(parsearResoluciones(['720p']), ['720p']);
});
