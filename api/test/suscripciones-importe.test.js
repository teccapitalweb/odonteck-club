import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { mesesPorCiclo, resumenImporteSuscripcion } from '../src/lib/suscripciones.js';

const sub = (price, extra = {}) => ({ items: { data: [{ price }] }, ...extra });
const precio = (unit_amount, interval = 'month', interval_count = 1, currency = 'mxn') => ({ unit_amount, currency, recurring: { interval, interval_count } });

describe('resumenImporteSuscripcion', () => {
  test('mensual sin descuento: neto = bruto = unit_amount', () => {
    const r = resumenImporteSuscripcion(sub(precio(19900, 'month')));
    assert.equal(r.importeMensualBrutoCents, 19900);
    assert.equal(r.descuentoMensualCents, 0);
    assert.equal(r.importeMensualNetoCents, 19900);
    assert.equal(r.moneda, 'mxn');
    assert.equal(r.promotionCode, null);
  });

  test('anual: se normaliza a mensual dividiendo entre 12', () => {
    const r = resumenImporteSuscripcion(sub(precio(189900, 'year')));
    assert.equal(mesesPorCiclo(precio(189900, 'year')), 12);
    assert.equal(r.importeMensualBrutoCents, Math.round(189900 / 12));
  });

  test('percent_off recurrente descuenta del bruto y expone el promo code', () => {
    const r = resumenImporteSuscripcion(sub(precio(20000, 'month'), {
      discount: { promotion_code: 'promo_abc', coupon: { percent_off: 25, duration: 'forever' } },
    }));
    assert.equal(r.descuentoMensualCents, 5000);
    assert.equal(r.importeMensualNetoCents, 15000);
    assert.equal(r.promotionCode, 'promo_abc');
  });

  test('amount_off se normaliza a mensual según el ciclo (anual /12)', () => {
    const r = resumenImporteSuscripcion(sub(precio(120000, 'year'), {
      discount: { coupon: { amount_off: 12000, duration: 'repeating' } },
    }));
    assert.equal(r.importeMensualBrutoCents, 10000); // 120000/12
    assert.equal(r.descuentoMensualCents, 1000); // 12000/12
    assert.equal(r.importeMensualNetoCents, 9000);
  });

  test("descuento 'once' no afecta el MRR recurrente", () => {
    const r = resumenImporteSuscripcion(sub(precio(20000, 'month'), {
      discount: { coupon: { percent_off: 50, duration: 'once' } },
    }));
    assert.equal(r.descuentoMensualCents, 0);
    assert.equal(r.importeMensualNetoCents, 20000);
  });

  test('sin precio con importe devuelve null (MRR usará estimación)', () => {
    assert.equal(resumenImporteSuscripcion(sub({ currency: 'mxn' })), null);
    assert.equal(resumenImporteSuscripcion({ items: { data: [] } }), null);
  });

  test('el descuento nunca deja el neto negativo', () => {
    const r = resumenImporteSuscripcion(sub(precio(10000, 'month'), {
      discount: { coupon: { amount_off: 999999, duration: 'forever' } },
    }));
    assert.equal(r.descuentoMensualCents, 10000);
    assert.equal(r.importeMensualNetoCents, 0);
  });
});
