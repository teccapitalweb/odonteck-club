import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';

function cargar(fuente) {
  const preparada = fuente.replace(/^import type[^\n]+\n/gm, '');
  const js = ts.transpileModule(preparada, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const modulo = { exports: {} };
  vm.runInNewContext(js, { module: modulo, exports: modulo.exports, Math });
  return modulo.exports;
}

const capas = cargar(await readFile(new URL('../src/landing/guia-capas.ts', import.meta.url), 'utf8'));
assert.equal(capas.FOTOGRAMAS_GUIA, 72);
assert.equal(capas.FPS_GUIA, 24);
let pruebas = 0;
for (const postura of ['saludo', 'orientar', 'celebrar']) {
  for (const gesto of ['reposo', 'saludo', 'espera', 'respuesta']) {
    for (const segundo of [0, .5, 1.5, 3]) {
      const pose = capas.poseGuia(segundo, gesto, postura);
      assert.ok(Object.values(pose).every(Number.isFinite));
    }
  }
  const svg = capas.dibujoGuia(`/asistente/${postura}.png`, `id-${postura}`, postura);
  assert.match(svg, /<mask/);
  assert.match(svg, /clipPath/);
  assert.match(svg, /data-mano/);
  assert.match(svg, new RegExp(`data-postura="${postura}"`));
  pruebas++;
}
for (const postura of ['saludo', 'orientar', 'celebrar']) {
  const inicio = capas.poseGuia(0, 'saludo', postura);
  const fin = capas.poseGuia(3, 'saludo', postura);
  assert.ok(Math.abs(inicio.mano) < 1e-9 && Math.abs(fin.mano) < 1e-9);
  const maximo = Math.max(...Array.from({ length: 72 }, (_, i) => Math.abs(capas.poseGuia(i / 24, 'saludo', postura).mano)));
  assert.ok(maximo <= 2.61, `${postura} no debe abrir la unión del brazo: ${maximo}`);
  pruebas++;
}

const gestosFuente = (await readFile(new URL('../src/landing/gestos-guia.ts', import.meta.url), 'utf8')).replace(/^import type[^\n]+\n/gm, '');
const gestos = cargar(gestosFuente);
assert.equal(gestos.posturaRespuesta({ extra: 'planes' }), 'orientar');
assert.equal(gestos.posturaRespuesta({ extra: 'whatsapp' }), 'saludo');
assert.equal(gestos.posturaRespuesta({ postura: 'celebrar' }), 'celebrar');
const seguir = gestos.crearSeguimientoRespuestas();
const mensaje = { role: 'assistant', opciones: [{}] };
assert.equal(seguir(mensaje, false), 'orientar');
assert.equal(seguir(mensaje, false), null);
assert.equal(seguir({ role: 'user' }, false), null);
assert.equal(seguir({ role: 'assistant' }, true), null);
pruebas += 4;

const index = await readFile(new URL('../landing/index.html', import.meta.url), 'utf8');
const main = await readFile(new URL('../src/landing/main.ts', import.meta.url), 'utf8');
assert.match(index, /id="assistant-root"/);
assert.doesNotMatch(index, /class="lp-wa-fab"/);
assert.match(main, /montarMovimientoGuia/);
assert.match(main, /cargarDatosGuia/);
pruebas++;

console.log(`guia-capas: ${pruebas} pruebas OK`);
