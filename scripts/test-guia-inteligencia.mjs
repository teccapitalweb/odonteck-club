import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const codigo = fs.readFileSync(new URL('../src/landing/guia-inteligencia.ts', import.meta.url), 'utf8');
const js = ts.transpileModule(codigo, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const exports = {};
vm.runInNewContext(js, { exports, module: { exports }, require: () => ({}) });
const { areaDesdeConsulta, normalizarGuia, recomendarCursos, razonRecomendacion } = exports;

const cursos = [
  { id: 'orto', titulo: 'Diagnóstico en Ortodoncia', area: 'Ortodoncia', descripcion: 'Maloclusión y diagnóstico', nivel: 'Intermedio', accesoGratis: true },
  { id: 'endo', titulo: 'Retroobturación en Endodoncia', area: 'Endodoncia', descripcion: 'Técnicas para conductos', nivel: 'Intermedio', accesoGratis: false },
  { id: 'pedia', titulo: 'Traumatismos Dentales en Niños', area: 'Odontopediatría', descripcion: 'Manejo en la infancia', nivel: 'Básico', accesoGratis: false },
];

assert.equal(normalizarGuia('Odontopediatría: Niños'), 'odontopediatria ninos');
assert.equal(areaDesdeConsulta('Quiero aprender sobre conductos', cursos), 'Endodoncia');
assert.equal(areaDesdeConsulta('Busco algo de brackets', cursos), 'Ortodoncia');
const pediatria = recomendarCursos(cursos, { area: 'Odontopediatría', nivel: 'Básico', objetivo: 'resolver' });
assert.equal(pediatria[0].id, 'pedia');
assert.equal(pediatria.length, 1);
assert.equal(recomendarCursos(cursos, { area: '', nivel: '', objetivo: 'explorar' })[0].id, 'orto');
assert.match(razonRecomendacion({ area: 'Endodoncia', nivel: 'Intermedio', objetivo: 'actualizar' }), /Endodoncia/);
console.log('guia-inteligencia: 7 comprobaciones aprobadas');
