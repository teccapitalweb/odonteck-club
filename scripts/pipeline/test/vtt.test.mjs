import { test } from 'node:test';
import assert from 'node:assert/strict';
import { limpiarTextoCue, parsearVtt } from '../lib/vtt.mjs';
import { fixture } from './helpers.mjs';

test('VTT básico → segmentos y texto plano', () => {
  const { segmentos, texto } = parsearVtt(fixture('basico.vtt'));
  assert.equal(segmentos.length, 3);
  assert.deepEqual(segmentos[0], { inicio: 1, fin: 4.5, texto: 'Bienvenidos a la clase de diagnóstico.' });
  assert.deepEqual(segmentos[2], { inicio: 70, fin: 75.25, texto: 'El análisis cefalométrico nos orienta.' });
  assert.equal(texto, 'Bienvenidos a la clase de diagnóstico. Hoy revisamos la maloclusión clase II. El análisis cefalométrico nos orienta.');
});

test('VTT con STYLE, NOTE, REGION, identificadores, ajustes, etiquetas, entidades y cues vacíos', () => {
  const { segmentos } = parsearVtt(fixture('estilos.vtt'));
  assert.deepEqual(segmentos.map((s) => s.texto), [
    'Buenas tardes, colegas',
    'La periodontitis & la gingivitis <no> son lo mismo',
    'La periodontitis & la',
    'Texto con timestamp interno y espacio',
  ]);
  assert.deepEqual([segmentos[0].inicio, segmentos[0].fin], [0.5, 3]);
  // Cue repetido contiguo (subtítulo rodante) se fusiona extendiendo el fin.
  assert.deepEqual([segmentos[2].inicio, segmentos[2].fin], [6, 10]);
  assert.equal(segmentos[3].inicio, 3723.004);
});

test('CRLF, BOM y líneas en blanco múltiples', () => {
  const crlf = '﻿' + fixture('basico.vtt').replace(/\r?\n/g, '\r\n').replace(/\r\n\r\n/g, '\r\n\r\n\r\n');
  const { segmentos } = parsearVtt(crlf);
  assert.equal(segmentos.length, 3);
  assert.equal(segmentos[1].texto, 'Hoy revisamos la maloclusión clase II.');
});

test('texto en varias líneas se une con espacio', () => {
  const { segmentos } = parsearVtt('WEBVTT\n\n00:01.000 --> 00:02.000\nprimera línea\nsegunda línea\n');
  assert.deepEqual(segmentos, [{ inicio: 1, fin: 2, texto: 'primera línea segunda línea' }]);
});

test('ignora cues con tiempos inválidos o invertidos', () => {
  const { segmentos } = parsearVtt('WEBVTT\n\n00:05.000 --> 00:02.000\nal revés\n\nxx --> yy\nroto\n\n00:06.000 --> 00:07.000\nbien\n');
  assert.deepEqual(segmentos.map((s) => s.texto), ['bien']);
});

test('rechaza documentos sin cabecera WEBVTT', () => {
  assert.throws(() => parsearVtt('1\n00:00:01,000 --> 00:00:02,000\nSRT'), /WEBVTT/);
  assert.throws(() => parsearVtt(null), TypeError);
});

test('limpiarTextoCue decodifica entidades numéricas', () => {
  assert.equal(limpiarTextoCue('Pr&#243;tesis&nbsp; <i>fija</i>'), 'Prótesis fija');
});
