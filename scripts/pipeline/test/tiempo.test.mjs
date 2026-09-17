import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mmssASegundos, segundosAMinutos, segundosAMmss, vttTimestampASegundos } from '../lib/tiempo.mjs';

test('segundosAMmss formatea y no limita minutos a 59', () => {
  assert.equal(segundosAMmss(0), '00:00');
  assert.equal(segundosAMmss(65.9), '01:05');
  assert.equal(segundosAMmss(4510), '75:10');
  assert.throws(() => segundosAMmss(-1));
  assert.throws(() => segundosAMmss(Number.NaN));
});

test('mmssASegundos acepta mm:ss y h:mm:ss; rechaza formatos inválidos', () => {
  assert.equal(mmssASegundos('00:00'), 0);
  assert.equal(mmssASegundos('12:34'), 754);
  assert.equal(mmssASegundos('75:10'), 4510);
  assert.equal(mmssASegundos('1:02:03'), 3723);
  assert.equal(mmssASegundos(' 3:07 '), 187);
  for (const malo of ['12:60', '1:60:00', 'abc', '12', '', null, 754, '12:3']) assert.equal(mmssASegundos(malo), null, String(malo));
});

test('ida y vuelta mm:ss', () => {
  for (const s of [0, 59, 60, 599, 3599, 3600, 7322]) assert.equal(mmssASegundos(segundosAMmss(s)), s);
});

test('vttTimestampASegundos con horas opcionales y milésimas', () => {
  assert.equal(vttTimestampASegundos('00:00:01.000'), 1);
  assert.equal(vttTimestampASegundos('01:02:03.004'), 3723.004);
  assert.equal(vttTimestampASegundos('02:03.5'), 123.5);
  assert.equal(vttTimestampASegundos('00:00:01,250'), 1.25);
  assert.equal(vttTimestampASegundos('00:61:00.000'), null);
  assert.equal(vttTimestampASegundos('basura'), null);
});

test('segundosAMinutos redondea con mínimo 1', () => {
  assert.equal(segundosAMinutos(1830), 31);
  assert.equal(segundosAMinutos(20), 1);
  assert.equal(segundosAMinutos(0), null);
  assert.equal(segundosAMinutos(undefined), null);
});
