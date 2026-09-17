import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cursoDesdeCatalogo, formatearPlan, planPublicacion } from '../lib/publicar.mjs';
import { claseValida, cursoValido, fixtureJson } from './helpers.mjs';

const catalogo = fixtureJson('catalogo-mini.json');
const cat = catalogo.cursos[0];
const inventarioIdx = new Map([['v-1', { duracionSeg: 600, duracionMin: 10 }], ['v-2', { duracionSeg: 900, duracionMin: 15 }]]);
const contenido = {
  cursoId: cat.id,
  generado: '2026-09-17T00:00:00.000Z',
  estado: 'completo',
  curso: cursoValido(),
  clases: [
    { n: 1, videoId: 'v-1', ...claseValida({ titulo: 'Cefalometría lateral' }) },
    { n: 2, videoId: 'v-2', ...claseValida({ titulo: 'Plan de derivación' }) },
  ],
};
const ahora = new Date('2026-09-18T00:00:00Z');

test('curso con datos provisionales: actualiza títulos, duración, notas y ficha; crea quizzes en borrador', () => {
  const doc = { ...cursoDesdeCatalogo(cat), actualizado: { marca: 'Timestamp' } };
  const plan = planPublicacion({ cursoDoc: doc, catalogoCurso: cat, contenido, inventarioIdx, ahora });
  assert.equal(plan.accionCurso, 'actualizar');
  assert.equal(plan.docCurso, null);
  assert.deepEqual(Object.keys(plan.actualizacion).sort(), ['actualizado', 'aprenderas', 'clases', 'descripcion']);
  const [c1, c2] = plan.actualizacion.clases;
  assert.equal(c1.titulo, 'Cefalometría lateral');
  assert.equal(c1.duracionMin, 10);
  assert.equal(c2.duracionMin, 15);
  assert.equal(c1.gratis, true, 'conserva campos existentes');
  assert.deepEqual(c1.notas, { resumen: contenido.clases[0].resumen, conceptos: contenido.clases[0].conceptos });
  assert.equal(plan.actualizacion.actualizado, '2026-09-18T00:00:00.000Z');
  assert.equal(doc.clases[0].titulo, 'Clase 1', 'no muta el doc original');
  assert.deepEqual(plan.quizzes.map((q) => [q.id, q.accion]), [[`${cat.id}_1`, 'crear'], [`${cat.id}_2`, 'crear']]);
  assert.deepEqual(plan.quizzes[0].doc, { cursoId: cat.id, n: 1, estado: 'borrador', preguntas: contenido.clases[0].preguntas, generado: contenido.generado });
  assert.match(formatearPlan(plan), /clases\[n=1\]\.titulo\n\s+- Clase 1\n\s+\+ Cefalometría lateral/);
});

test('NUNCA sobreescribe un quiz aprobado, ni siquiera con --reemplazar-borradores', () => {
  const quizzes = new Map([
    [`${cat.id}_1`, { estado: 'aprobado', preguntas: [] }],
    [`${cat.id}_2`, { estado: 'borrador', preguntas: [] }],
  ]);
  const plan = planPublicacion({ cursoDoc: cursoDesdeCatalogo(cat), catalogoCurso: cat, contenido, inventarioIdx, quizzes, opciones: { reemplazarBorradores: true } });
  assert.deepEqual(plan.quizzes.map((q) => q.accion), ['omitir-aprobado', 'reemplazar']);
  assert.equal(plan.quizzes[0].doc, undefined);
  const sinOpcion = planPublicacion({ cursoDoc: cursoDesdeCatalogo(cat), catalogoCurso: cat, contenido, inventarioIdx, quizzes });
  assert.deepEqual(sinOpcion.quizzes.map((q) => q.accion), ['omitir-aprobado', 'omitir-borrador']);
});

test('respeta ediciones humanas salvo que se pida reemplazar', () => {
  const doc = cursoDesdeCatalogo(cat);
  doc.clases[0].titulo = 'Título escrito por el doctor';
  doc.clases[0].notas = { resumen: 'editado', conceptos: [] };
  doc.clases[0].duracionMin = 10;
  doc.descripcion = 'Descripción editada';
  doc.aprenderas = ['a', 'b', 'c', 'd', 'e'];
  const plan = planPublicacion({ cursoDoc: doc, catalogoCurso: cat, contenido, inventarioIdx });
  const c1 = plan.actualizacion.clases[0];
  assert.equal(c1.titulo, 'Título escrito por el doctor');
  assert.equal(c1.notas.resumen, 'editado');
  assert.equal(plan.actualizacion.descripcion, undefined);
  assert.ok(plan.avisos.some((a) => /reemplazar-titulos/.test(a)));
  assert.ok(plan.avisos.some((a) => /reemplazar-notas/.test(a)));
  assert.ok(plan.avisos.some((a) => /reemplazar-curso/.test(a)));

  const forzado = planPublicacion({ cursoDoc: doc, catalogoCurso: cat, contenido, inventarioIdx, opciones: { reemplazarTitulos: true, reemplazarNotas: true, reemplazarCurso: true } });
  assert.equal(forzado.actualizacion.clases[0].titulo, 'Cefalometría lateral');
  assert.equal(forzado.actualizacion.descripcion, cursoValido().descripcion);
});

test('sin cambios → no escribe el curso', () => {
  const primero = planPublicacion({ cursoDoc: cursoDesdeCatalogo(cat), catalogoCurso: cat, contenido, inventarioIdx });
  const yaAplicado = { ...cursoDesdeCatalogo(cat), ...primero.actualizacion };
  const segundo = planPublicacion({ cursoDoc: yaAplicado, catalogoCurso: cat, contenido, inventarioIdx });
  assert.equal(segundo.accionCurso, 'omitir');
  assert.equal(segundo.actualizacion, null);
  assert.equal(segundo.cambios.length, 0);
});

test('curso inexistente: aviso, o creación con --crear-faltantes (publicado: false)', () => {
  const sin = planPublicacion({ cursoDoc: null, catalogoCurso: cat, contenido, inventarioIdx });
  assert.equal(sin.accionCurso, 'omitir');
  assert.match(sin.avisos[0], /crear-faltantes/);
  const crear = planPublicacion({ cursoDoc: null, catalogoCurso: cat, contenido, inventarioIdx, opciones: { crearFaltantes: true } });
  assert.equal(crear.accionCurso, 'crear');
  assert.equal(crear.docCurso.publicado, false);
  assert.equal(crear.docCurso.clases[0].titulo, 'Cefalometría lateral');
});

test('omite clases con videoId distinto o contenido inválido', () => {
  const doc = cursoDesdeCatalogo(cat);
  doc.clases[1].videoId = 'otro';
  const roto = structuredClone(contenido);
  roto.clases[0].preguntas[0].correcta = 9;
  const plan = planPublicacion({ cursoDoc: doc, catalogoCurso: cat, contenido: roto, inventarioIdx });
  assert.equal(plan.quizzes.length, 0);
  assert.ok(plan.avisos.some((a) => /videoId distinto/.test(a)));
  assert.ok(plan.avisos.some((a) => /contenido inválido/.test(a)));
});
