import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { validarClases, validarPreguntas } from '../src/lib/esquemas.js';

const base = { id: 'p1', q: 'Pregunta revisada', instruccion: 'Sigue la consigna', referenciaVideo: '03:25', casoClinico: 'Situación clínica sustentada en la clase.', competencia: 'Integrar hallazgos', nivelCognitivo: 'Analizar', explicacion: 'Retroalimentación clínica revisada.' };

describe('validación de autoría para evaluaciones v2', () => {
  test('acepta los cinco tipos y conserva solo su configuración válida', () => {
    const preguntas = validarPreguntas([
      { ...base, tipo: 'seleccion', opciones: ['A', 'B'], correcta: 1 },
      { ...base, id: 'p2', tipo: 'seleccion_multiple', opciones: ['A', 'B', 'C'], correctas: [0, 2] },
      { ...base, id: 'p3', tipo: 'ordenar', elementos: [{ id: 'a', texto: 'Paso A' }, { id: 'b', texto: 'Paso B' }], ordenCorrecto: ['b', 'a'] },
      { ...base, id: 'p4', tipo: 'relacionar', izquierda: [{ id: 'i1', texto: 'Uno' }, { id: 'i2', texto: 'Dos' }], derecha: [{ id: 'd1', texto: 'A' }, { id: 'd2', texto: 'B' }], pares: { i1: 'd2', i2: 'd1' } },
      { ...base, id: 'p5', tipo: 'completar', plantilla: 'Completa', huecos: [{ id: 'h1', etiqueta: 'Término', respuestas: ['cúspide', 'cuspide'] }] },
    ]);
    assert.deepEqual(preguntas.map((p) => p.tipo), ['seleccion', 'seleccion_multiple', 'ordenar', 'relacionar', 'completar']);
    assert.deepEqual(preguntas[1].correctas, [0, 2]);
    assert.equal(preguntas[0].referenciaVideo, '03:25');
    assert.equal(preguntas[0].casoClinico, 'Situación clínica sustentada en la clase.');
    assert.equal(preguntas[0].nivelCognitivo, 'Analizar');
    assert.deepEqual(preguntas[4].huecos[0].respuestas, ['cúspide', 'cuspide']);
  });

  test('rechaza soluciones incompletas, IDs repetidos y rutas de ficha inseguras', () => {
    assert.throws(() => validarPreguntas([{ ...base, tipo: 'seleccion_multiple', opciones: ['A', 'B'], correctas: [] }]), /al menos una/);
    assert.throws(() => validarPreguntas([{ ...base, tipo: 'ordenar', elementos: [{ id: 'a', texto: 'A' }, { id: 'a', texto: 'B' }], ordenCorrecto: ['a', 'a'] }]), /IDs repetidos/);
    assert.throws(() => validarPreguntas([{ ...base, tipo: 'relacionar', izquierda: [{ id: 'i1', texto: 'Uno' }, { id: 'i2', texto: 'Dos' }], derecha: [{ id: 'd1', texto: 'A' }, { id: 'd2', texto: 'B' }], pares: { i1: 'd9', i2: 'd1' } }]), /no apunta/);
    assert.throws(() => validarPreguntas([{ ...base, referenciaVideo: '3:xx', tipo: 'seleccion', opciones: ['A', 'B'], correcta: 0 }]), /formato mm:ss/);
    assert.throws(() => validarPreguntas([{ ...base, nivelCognitivo: 'Recordar', tipo: 'seleccion', opciones: ['A', 'B'], correcta: 0 }]), /nivelCognitivo/);
    assert.throws(() => validarClases([{ n: 1, titulo: 'Clase', videoId: 'abc-123', gratis: true, ficha: { estado: 'aprobada', archivo: '../publica.pdf' } }]), /ruta PDF privada/);
  });
});
