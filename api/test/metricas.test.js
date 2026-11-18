import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import {
  calcularMRR, tasaBajas, bajasProgramadas, conversionCursoGratis, altasBajasV2,
  retencionPorCohorte, finalizacionPorClase, aprobacionQuizzes, economiaOdonCoins,
  efectoCuponesApp, efectoPromosStripe, canjesPendientesViejos, mapaUltimaActividad,
} from '../src/lib/metricas.js';

const AHORA = new Date('2026-09-17T12:00:00.000Z');
const config = { precios: { mensual: 199, anual: 1899 } };
const mapa = (obj) => new Map(Object.entries(obj));

describe('calcularMRR', () => {
  const subs = mapa({
    a: { estado: 'active', importeMensualNetoCents: 15920 }, // 159.2 real
    b: { estado: 'active', plan: 'mensual' },                 // 199 estimado
    c: { estado: 'trialing', importeMensualNetoCents: 19900 }, // potencial 199
    d: { estado: 'past_due', importeMensualNetoCents: 19900 }, // riesgo 199
    e: { estado: 'active', accesoBloqueado: true, importeMensualNetoCents: 99900 }, // excluida
  });
  test('sólo active sin bloqueo suma al MRR; trialing y en riesgo van aparte', () => {
    const r = calcularMRR(subs, config);
    assert.equal(r.mrr, 358); // round(159.2 + 199)
    assert.equal(r.estimado, true); // la sub b usó estimación
    assert.equal(r.activos, 2);
    assert.equal(r.mrrPotencial, 199);
    assert.equal(r.trialing, 1);
    assert.equal(r.enRiesgo.cuentas, 1);
    assert.equal(r.enRiesgo.monto, 199);
  });
});

test('tasaBajas por canceladaEn en ventana de 30 días', () => {
  const subs = mapa({
    a: { estado: 'active' },
    b: { estado: 'active', canceladaEn: '2026-09-10T00:00:00.000Z' }, // dentro
    c: { estado: 'canceled', canceladaEn: '2026-01-01T00:00:00.000Z' }, // fuera
  });
  const r = tasaBajas(subs, AHORA, 30);
  assert.equal(r.bajas, 1);
  assert.equal(r.activos, 2);
  assert.equal(Math.round(r.tasa * 1000) / 1000, Math.round((1 / 3) * 1000) / 1000);
});

test('bajasProgramadas: cancelaAlFinal con acceso vigente', () => {
  const subs = mapa({
    a: { estado: 'active', cancelaAlFinal: true, periodoFin: '2026-10-01T00:00:00.000Z', plan: 'mensual' },
    b: { estado: 'active', cancelaAlFinal: false },
    c: { estado: 'canceled', cancelaAlFinal: true },
  });
  const r = bajasProgramadas(subs);
  assert.equal(r.cuentas, 1);
  assert.equal(r.lista[0].uid, 'a');
});

test('conversionCursoGratis cuenta sólo VIP pagado', () => {
  const cg = mapa({ u1: { cursoId: 'c1' }, u2: { cursoId: 'c1' }, u3: { cursoId: 'c1' } });
  const subs = mapa({ u1: { estado: 'active', periodoFin: '2026-12-31T00:00:00.000Z' } });
  const miembros = mapa({ u2: { activa: true } }); // membresía heredada vigente
  const r = conversionCursoGratis(cg, subs, miembros, AHORA);
  assert.equal(r.base, 3);
  assert.equal(r.convertidos, 2); // u1 (sub) + u2 (miembro); u3 no
});

test('altasBajasV2 usa altaVip y canceladaEn', () => {
  const subs = mapa({
    a: { altaVip: '2026-09-05T00:00:00.000Z' },
    b: { altaVip: '2026-01-01T00:00:00.000Z', canceladaEn: '2026-09-12T00:00:00.000Z' },
  });
  const r = altasBajasV2(subs, AHORA, 30);
  assert.equal(r.altas, 1);
  assert.equal(r.bajas, 1);
});

test('retencionPorCohorte agrupa por mes de altaVip', () => {
  const subs = mapa({
    a: { altaVip: '2026-08-10T00:00:00.000Z', estado: 'active', periodoFin: '2026-12-31T00:00:00.000Z' },
    b: { altaVip: '2026-08-20T00:00:00.000Z', estado: 'canceled' },
    c: { altaVip: '2026-09-01T00:00:00.000Z', estado: 'active', periodoFin: '2026-12-31T00:00:00.000Z' },
  });
  const r = retencionPorCohorte(subs, new Map(), AHORA);
  const ago = r.find((x) => x.cohorte === '2026-08');
  assert.equal(ago.base, 2);
  assert.equal(ago.retenidos, 1);
  assert.equal(ago.tasa, 0.5);
});

test('finalizacionPorClase y abandono', () => {
  const cursos = mapa({ c1: { titulo: 'Curso 1', clases: [{ n: 1 }, { n: 2 }, { n: 3 }] } });
  const progreso = [
    { uid: 'u1', cursoId: 'c1', vistas: [1, 2, 3] },
    { uid: 'u2', cursoId: 'c1', vistas: [1, 2] },
    { uid: 'u3', cursoId: 'c1', vistas: [1] },
    { uid: 'u4', cursoId: 'c1', vistas: [1] },
  ];
  const r = finalizacionPorClase(progreso, cursos);
  const c1 = r[0];
  assert.equal(c1.base, 4); // vieron clase 1
  assert.equal(c1.clases[1].vieron, 2); // clase 2
  assert.equal(c1.clases[0].abandono, 0.5); // de 4 que vieron 1, 2 vieron 2 -> 50% abandono
  assert.equal(c1.clases[2].finalizacion, 0.25); // 1/4
});

test('aprobacionQuizzes global y por clase', () => {
  const cursos = mapa({ c1: { titulo: 'Curso 1' } });
  const intentos = [
    { cursoId: 'c1', n: 1, aprobadoAlgunaVez: true },
    { cursoId: 'c1', n: 1, aprobado: false, aprobadoAlgunaVez: false },
    { cursoId: 'c1', n: 2, aprobado: true },
  ];
  const r = aprobacionQuizzes(intentos, cursos);
  assert.equal(r.global.intentos, 3);
  assert.equal(r.global.aprobados, 2);
  const clase1 = r.porClase.find((x) => x.n === 1);
  assert.equal(clase1.tasa, 0.5);
});

test('economiaOdonCoins suma y rankea canjes', () => {
  const estados = [
    { ganados: 300, gastados: 100, saldo: 200 },
    { ganados: 50, gastados: 0, saldo: 50 },
  ];
  const canjes = [
    { recompensaId: 'guia', titulo: 'Guía', estatus: 'entregado' },
    { recompensaId: 'guia', titulo: 'Guía', estatus: 'pendiente' },
    { recompensaId: 'atlas', titulo: 'Atlas', estatus: 'entregado' },
    { recompensaId: 'atlas', titulo: 'Atlas', estatus: 'cancelado' }, // excluido
  ];
  const r = economiaOdonCoins(estados, canjes);
  assert.equal(r.emitidos, 350);
  assert.equal(r.gastados, 100);
  assert.equal(r.saldoPendiente, 250);
  assert.equal(r.masCanjeadas[0].recompensaId, 'guia');
  assert.equal(r.masCanjeadas[0].canjes, 2);
  assert.equal(r.masCanjeadas.find((x) => x.recompensaId === 'atlas').canjes, 1);
});

test('efectoCuponesApp cuenta redenciones y conversiones', () => {
  const canjes = [{ codigo: 'BIENVENIDA', uid: 'u1' }, { codigo: 'BIENVENIDA', uid: 'u2' }];
  const subs = mapa({ u1: { estado: 'active', periodoFin: '2026-12-31T00:00:00.000Z' } });
  const r = efectoCuponesApp(canjes, subs, new Map(), AHORA);
  assert.equal(r[0].codigo, 'BIENVENIDA');
  assert.equal(r[0].redenciones, 2);
  assert.equal(r[0].convertidos, 1);
});

test('efectoPromosStripe agrupa por promotion code y suma descuento', () => {
  const subs = mapa({
    a: { promotionCode: 'promo_x', estado: 'active', descuentoMensualCents: 5000, importeMensualNetoCents: 15000 },
    b: { promotionCode: 'promo_x', estado: 'canceled', descuentoMensualCents: 5000, importeMensualNetoCents: 15000 },
  });
  const r = efectoPromosStripe(subs);
  assert.equal(r[0].promotionCode, 'promo_x');
  assert.equal(r[0].suscripciones, 2);
  assert.equal(r[0].activas, 1);
  assert.equal(r[0].descuentoMensualMXN, 50);
  assert.equal(r[0].netoMensualMXN, 150);
});

test('canjesPendientesViejos: manuales pendientes con más de 3 días', () => {
  const canjes = [
    { id: 'x', tipo: 'manual', estatus: 'pendiente', solicitado: '2026-09-10T00:00:00.000Z' }, // >3d
    { id: 'y', tipo: 'manual', estatus: 'pendiente', solicitado: '2026-09-16T00:00:00.000Z' }, // reciente
    { id: 'z', tipo: 'manual', estatus: 'entregado', solicitado: '2026-01-01T00:00:00.000Z' },
  ];
  const r = canjesPendientesViejos(canjes, AHORA, 3);
  assert.equal(r.cuentas, 1);
  assert.equal(r.lista[0].id, 'x');
});

test('mapaUltimaActividad toma el máximo del historial', () => {
  const m = mapaUltimaActividad([
    { uid: 'u1', historial: ['2026-09-01T00:00:00.000Z', '2026-09-10T00:00:00.000Z'] },
    { uid: 'u1', cursoId: 'c2', historial: ['2026-09-15T00:00:00.000Z'] },
  ]);
  assert.equal(new Date(m.get('u1')).toISOString(), '2026-09-15T00:00:00.000Z');
});
