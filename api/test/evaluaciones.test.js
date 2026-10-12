import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { calificarEvaluacion, calificarPregunta, preguntaPublica } from '../src/lib/evaluaciones.js';

describe('motor de evaluaciones interactivas', () => {
  test('mantiene compatibilidad con selección tradicional y oculta la respuesta', () => {
    const p = { q: 'Pregunta', opciones: ['A', 'B'], correcta: 1, explicacion: 'Razón', referenciaVideo: '03:25' };
    assert.deepEqual(preguntaPublica(p), { id: 'p1', tipo: 'seleccion', q: 'Pregunta', instruccion: '', opciones: ['A', 'B'] });
    const resultado = calificarPregunta(p, 1);
    assert.equal(resultado.puntos, 1);
    assert.equal(resultado.referenciaVideo, '03:25');
  });
  test('expone contexto pedagógico pero no la solución ni la marca de evidencia', () => {
    const p = { q: 'Pregunta', casoClinico: 'Caso sustentado.', competencia: 'Decidir una conducta', nivelCognitivo: 'Decidir', referenciaVideo: '04:10', opciones: ['A', 'B'], correcta: 0 };
    const publica = preguntaPublica(p);
    assert.equal(publica.casoClinico, 'Caso sustentado.');
    assert.equal(publica.competencia, 'Decidir una conducta');
    assert.equal(publica.nivelCognitivo, 'Decidir');
    assert.equal(publica.referenciaVideo, undefined);
    assert.equal(publica.correcta, undefined);
  });
  test('selección múltiple da crédito parcial y penaliza marcar de más', () => {
    const p = { tipo: 'seleccion_multiple', q: 'Elige', opciones: ['A', 'B', 'C', 'D'], correctas: [0, 2] };
    assert.equal(calificarPregunta(p, [0]).puntos, .5);
    assert.equal(calificarPregunta(p, [0, 1, 2]).puntos, .5);
    assert.equal(calificarPregunta(p, [0, 2]).acertada, true);
  });
  test('ordenar usa pares adyacentes para crédito parcial', () => {
    const p = { tipo: 'ordenar', q: 'Ordena', elementos: [{ id: 'a', texto: 'A' }, { id: 'b', texto: 'B' }, { id: 'c', texto: 'C' }], ordenCorrecto: ['a', 'b', 'c'] };
    assert.equal(calificarPregunta(p, ['a', 'b', 'c']).puntos, 1);
    assert.equal(calificarPregunta(p, ['a', 'b', 'c']).acertada, true);
    assert.equal(calificarPregunta(p, ['a', 'c', 'b']).puntos, 0);
  });
  test('relacionar y completar califican por elemento, normalizando acentos', () => {
    const relacionar = { tipo: 'relacionar', pares: { a: '1', b: '2' } };
    assert.equal(calificarPregunta(relacionar, { a: '1', b: 'x' }).puntos, .5);
    const completar = { tipo: 'completar', huecos: [{ id: 'h1', respuestas: ['cúspide'] }, { id: 'h2', respuestas: ['surco central'] }] };
    assert.equal(calificarPregunta(completar, { h1: 'Cuspide', h2: 'surco  central' }).puntos, 1);
  });
  test('puntaje final usa parciales y umbral configurable', () => {
    const preguntas = [{ q: 'P1', opciones: ['A', 'B'], correcta: 0 }, { tipo: 'relacionar', pares: { a: '1', b: '2' } }];
    const r = calificarEvaluacion(preguntas, [0, { a: '1', b: 'x' }]);
    assert.equal(r.puntaje, 75); assert.equal(r.aprobado, true); assert.equal(r.correctas, 1);
  });
});
