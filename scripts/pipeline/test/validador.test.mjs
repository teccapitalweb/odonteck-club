import { test } from 'node:test';
import assert from 'node:assert/strict';
import { marcaEnTranscripcion, validarClase, validarCurso, validarPreguntas } from '../lib/validador.mjs';
import { claseValida, cursoValido, segmentosDePrueba } from './helpers.mjs';

const ctx = { duracionSeg: 600, segmentos: segmentosDePrueba(10) };
const conError = (errores, patron) => assert.ok(errores.some((e) => patron.test(e)), `se esperaba ${patron}, llegó: ${JSON.stringify(errores)}`);

test('clase válida no tiene errores', () => {
  assert.deepEqual(validarClase(claseValida(), ctx), []);
});

test('rechaza título largo o genérico', () => {
  conError(validarClase(claseValida({ titulo: 'x'.repeat(71) }), ctx), /titulo: tiene 71/);
  conError(validarClase(claseValida({ titulo: 'Clase 3: Cefalometría' }), ctx), /Clase N/);
  conError(validarClase(claseValida({ titulo: '  ' }), ctx), /titulo: vacío/);
});

test('rechaza resumen de más de 60 palabras', () => {
  conError(validarClase(claseValida({ resumen: Array(61).fill('palabra').join(' ') }), ctx), /resumen: tiene 61 palabras/);
});

test('conceptos: cantidad, formato, duración, existencia en transcripción y orden', () => {
  const c = claseValida();
  conError(validarClase({ ...c, conceptos: c.conceptos.slice(0, 2) }, ctx), /deben ser entre 3 y 6/);
  conError(validarClase({ ...c, conceptos: [...c.conceptos, { t: '5:3', texto: 'x' }] }, ctx), /no tiene formato mm:ss/);
  conError(validarClase({ ...c, conceptos: [...c.conceptos, { t: '10:30', texto: 'x' }] }, ctx), /fuera de la duración/);
  // Hueco en la transcripción: no hay texto entre 100 s y 400 s.
  const hueco = { duracionSeg: 600, segmentos: [{ inicio: 0, fin: 100, texto: 'a' }, { inicio: 400, fin: 600, texto: 'b' }] };
  conError(validarClase({ ...c, conceptos: [{ t: '00:10', texto: 'a' }, { t: '04:00', texto: 'x' }, { t: '07:00', texto: 'b' }] }, hueco), /no corresponde a ningún momento/);
  conError(validarClase({ ...c, conceptos: [c.conceptos[1], c.conceptos[0], c.conceptos[2]] }, ctx), /orden cronológico/);
});

test('sin segmentos ni duración solo valida formato', () => {
  assert.deepEqual(validarClase(claseValida(), {}), []);
});

test('preguntas: cantidad exacta de 5', () => {
  const c = claseValida();
  conError(validarClase({ ...c, preguntas: c.preguntas.slice(0, 4) }, ctx), /exactamente 5/);
});

test('preguntas: selección, evidencia, diversidad y explicación', () => {
  const p = claseValida().preguntas[0];
  conError(validarPreguntas([{ ...p, opciones: ['a', 'b', 'c'] }]), /exactamente 4/);
  conError(validarPreguntas([{ ...p, opciones: ['Origen dental', 'origen  DENTAL.', 'c', 'd'] }]), /opciones repetidas/);
  conError(validarPreguntas([{ ...p, opciones: ['a', '', 'c', 'd'] }]), /opciones vacías/);
  conError(validarPreguntas([{ ...p, correcta: 4 }]), /índice inválido/);
  conError(validarPreguntas([{ ...p, correcta: 1.5 }]), /índice inválido/);
  conError(validarPreguntas([{ ...p, correcta: '1' }]), /índice inválido/);
  conError(validarPreguntas([{ ...p, explicacion: '' }]), /explicacion: vacía/);
  conError(validarPreguntas([{ ...p, referenciaVideo: '99:00' }], ctx), /fuera de la duración/);
  conError(validarPreguntas([p, { ...p, q: p.q.toUpperCase() }]), /pregunta repetida/);
  const c = claseValida();
  conError(validarClase({ ...c, preguntas: c.preguntas.map((x, i) => i === 4 ? { ...p, q: 'Otra pregunta', referenciaVideo: '06:00' } : x) }, ctx), /falta una interacción de tipo 'completar'/);
});

test('preguntas: valida estructuras interactivas', () => {
  const [, multiple, ordenar, relacionar, completar] = claseValida().preguntas;
  conError(validarPreguntas([{ ...multiple, correctas: [0] }]), /requiere entre 2/);
  conError(validarPreguntas([{ ...ordenar, ordenCorrecto: ['a', 'a', 'c'] }]), /todos los IDs/);
  conError(validarPreguntas([{ ...relacionar, pares: { a: 'x', b: 'x', c: 'z' } }]), /cada ID una sola vez/);
  conError(validarPreguntas([{ ...completar, huecos: [{ id: '1', respuestas: [] }] }]), /entre 2 y 4 espacios/);
});

test('entradas que no son objeto', () => {
  assert.deepEqual(validarClase(null), ['La respuesta debe ser un objeto JSON']);
  assert.deepEqual(validarClase([]), ['La respuesta debe ser un objeto JSON']);
  conError(validarClase({ titulo: 'Algo', resumen: 'Algo' }, ctx), /conceptos: debe ser un arreglo/);
});

test('curso válido e inválido', () => {
  assert.deepEqual(validarCurso(cursoValido()), []);
  conError(validarCurso(cursoValido({ descripcion: Array(51).fill('p').join(' ') })), /51 palabras/);
  conError(validarCurso(cursoValido({ aprenderas: ['a', 'b'] })), /exactamente 5/);
  conError(validarCurso(cursoValido({ aprenderas: ['a', 'b', 'c', 'd', 'A'] })), /repetidos/);
  conError(validarCurso(cursoValido({ nivel: 'Experto' })), /nivel/);
});

test('marcaEnTranscripcion con tolerancia', () => {
  const s = [{ inicio: 10.4, fin: 20.2, texto: 'x' }];
  assert.equal(marcaEnTranscripcion(10, s), true);
  assert.equal(marcaEnTranscripcion(7, s), true);
  assert.equal(marcaEnTranscripcion(6, s), false);
  assert.equal(marcaEnTranscripcion(24, s), true);
  assert.equal(marcaEnTranscripcion(25, s), false);
});
