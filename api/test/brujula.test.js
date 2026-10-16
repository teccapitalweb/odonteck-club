import test from 'node:test';
import assert from 'node:assert/strict';
import { calcularBrujula } from '../src/lib/brujula.js';

test('Brújula calcula tres áreas y estilos con intensidades relativas acotadas', () => {
  const resultado = calcularBrujula({
    problema: 'patrones', jornada: 'variada', detalle: 'imagenes', resultado: 'funcion', pacientes: 'complejos',
    fortalezas: ['analisis', 'organizar', 'investigar'], aprender: 'evidencia', proyecto: 'academia',
  });
  assert.equal(resultado.alcance, 'orientacion_no_diagnostica');
  assert.equal(resultado.areas.length, 3);
  assert.equal(resultado.estilos.length, 3);
  assert.equal(resultado.areas[0].id, 'medicina_bucal');
  assert.equal(resultado.areas[0].afinidad, 100);
  assert.ok(resultado.areas.every((x) => x.afinidad >= 0 && x.afinidad <= 100));
});

test('Brújula es determinista y no conserva estado entre personas', () => {
  const manual = { problema: 'precision', jornada: 'intensa', detalle: 'simetria', resultado: 'sonrisa', pacientes: 'ansiosos', fortalezas: ['manos', 'presion'], aprender: 'simulacion', proyecto: 'quirurgico' };
  const comunicacion = { problema: 'plan', jornada: 'acompanamiento', detalle: 'oclusion', resultado: 'crecimiento', pacientes: 'ninos', fortalezas: ['explicar', 'organizar'], aprender: 'casos', proyecto: 'academia' };
  assert.deepEqual(calcularBrujula(manual), calcularBrujula(manual));
  assert.notDeepEqual(calcularBrujula(manual).areas, calcularBrujula(comunicacion).areas);
  assert.equal(calcularBrujula(comunicacion).estilos[0].id, 'comunicacion');
});
