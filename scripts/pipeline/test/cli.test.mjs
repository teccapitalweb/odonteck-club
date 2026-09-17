// Pruebas de humo de los scripts: --help, dry-run sin escribir y --apply local con fixtures (sin red).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DIR_FIXTURES, claseValida, cursoValido } from './helpers.mjs';

const DIR = join(dirname(fileURLToPath(import.meta.url)), '..');
const SCRIPTS = ['bunny-inventario.mjs', 'bunny-transcribir.mjs', 'bunny-descargar-vtt.mjs', 'generar-contenido.mjs', 'publicar-contenido.mjs', 'migrar-certificados.mjs'];

function correr(script, args, env = {}) {
  // Entorno limpio: sin llaves reales aunque existan en la máquina.
  const base = { PATH: process.env.PATH, SystemRoot: process.env.SystemRoot };
  const r = spawnSync(process.execPath, [join(DIR, script), ...args], { cwd: DIR, env: { ...base, ...env }, encoding: 'utf8' });
  return { codigo: r.status, salida: `${r.stdout}${r.stderr}` };
}

for (const s of SCRIPTS) {
  test(`${s} --help`, () => {
    const r = correr(s, ['--help']);
    assert.equal(r.codigo, 0, r.salida);
    assert.match(r.salida, /Uso:/);
    assert.match(r.salida, /--apply/);
  });
}

test('banderas desconocidas y --apply con --dry-run fallan', () => {
  assert.equal(correr('bunny-inventario.mjs', ['--no-existe']).codigo, 1);
  assert.match(correr('bunny-inventario.mjs', ['--apply', '--dry-run']).salida, /no ambos/);
});

test('flujo local: inventario → vtt parseado → estimación → diff sin Firestore', () => {
  const out = mkdtempSync(join(tmpdir(), 'pipeline-'));
  const env = { PIPELINE_OUT_DIR: out, CATALOGO_PATH: join(DIR_FIXTURES, 'catalogo-mini.json') };
  try {
    // Inventario en dry-run no escribe; con --apply sí.
    let r = correr('bunny-inventario.mjs', ['--desde-json', join(DIR_FIXTURES, 'bunny-videos.json')], env);
    assert.equal(r.codigo, 0, r.salida);
    assert.match(r.salida, /NO existen en Bunny/);
    assert.equal(existsSync(join(out, 'inventario.json')), false);
    r = correr('bunny-inventario.mjs', ['--desde-json', join(DIR_FIXTURES, 'bunny-videos.json'), '--apply'], env);
    assert.equal(r.codigo, 0, r.salida);
    assert.equal(JSON.parse(readFileSync(join(out, 'inventario.json'), 'utf8')).resumen.encontradas, 2);

    // Transcribir en dry-run lista v-2 y no pide credenciales.
    r = correr('bunny-transcribir.mjs', [], env);
    assert.equal(r.codigo, 0, r.salida);
    assert.match(r.salida, /v-2/);

    // VTT: re-parseo local de un archivo ya "descargado".
    mkdirSync(join(out, 'vtt'), { recursive: true });
    writeFileSync(join(out, 'vtt', 'v-1.vtt'), readFileSync(join(DIR_FIXTURES, 'basico.vtt')));
    r = correr('bunny-descargar-vtt.mjs', ['--solo-parsear', '--apply'], env);
    assert.equal(r.codigo, 0, r.salida);
    const t = JSON.parse(readFileSync(join(out, 'transcripciones', 'v-1.json'), 'utf8'));
    assert.equal(t.segmentos.length, 3);
    assert.equal(t.duracionSeg, 1830);

    // Generar en dry-run: estimación sin ANTHROPIC_API_KEY.
    r = correr('generar-contenido.mjs', [], env);
    assert.equal(r.codigo, 0, r.salida);
    assert.match(r.salida, /TOTAL estimado/);
    assert.match(r.salida, /No se llamó a la API/);
    assert.equal(correr('generar-contenido.mjs', ['--apply'], env).codigo, 1, 'sin llave no genera');

    // Publicar sin Firestore con un contenido de ejemplo.
    mkdirSync(join(out, 'contenido'), { recursive: true });
    writeFileSync(join(out, 'contenido', 'diagnostico-en-ortodoncia.json'), JSON.stringify({
      cursoId: 'diagnostico-en-ortodoncia', estado: 'parcial', curso: cursoValido(), generado: '2026-09-17T00:00:00Z',
      clases: [{ n: 1, videoId: 'v-1', ...claseValida({ conceptos: [{ t: '00:30', texto: 'a' }, { t: '01:00', texto: 'b' }, { t: '01:10', texto: 'c' }] }) }],
    }));
    r = correr('publicar-contenido.mjs', ['--sin-firestore'], env);
    assert.equal(r.codigo, 0, r.salida);
    assert.match(r.salida, /quiz crear: clases 1/);
    assert.match(r.salida, /duracionMin/);
    assert.equal(correr('publicar-contenido.mjs', ['--apply'], env).codigo, 1, 'sin cuenta de servicio no publica');

    // Certificados con volcado local.
    const volcado = join(out, 'volcado.json');
    writeFileSync(volcado, JSON.stringify({ certificados: [{ folio: 'OdonTeck-2026-AAA111', uid: 'u', nombre: 'N', cursoId: 'x', curso: 'Periodoncia Básica', emitido: '2026-02-01T00:00:00Z' }] }));
    r = correr('migrar-certificados.mjs', ['--desde-json', volcado], env);
    assert.equal(r.codigo, 0, r.salida);
    assert.match(r.salida, /ODT-2026-00001 ← OdonTeck-2026-AAA111/);
    assert.ok(existsSync(join(out, 'reportes', 'migracion-certificados.json')));
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});
