import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { crearApp } from '../src/app.js';
import { crearEntorno, semillaBase, ORIGEN_OK } from './fakes/app.js';

describe('Catálogo público de la landing', () => {
  test('sin token expone sólo cursos publicados y nunca datos sensibles', async () => {
    const env = crearEntorno();
    const antes = JSON.stringify(env.db);
    const { body, headers } = await request(env.app).get('/landing/catalogo').set('Origin', ORIGEN_OK).expect(200);
    assert.equal(headers['access-control-allow-origin'], ORIGEN_OK);
    assert.equal(headers['cache-control'], 'no-store');
    assert.equal(body.fuente, 'api');
    assert.equal(body.cursos.length, 1);
    assert.deepEqual(body.cursos[0], {
      id: 'curso-a', titulo: 'Endodoncia práctica', area: 'Endodoncia', imagen: '/cursos/a.webp',
      nivel: 'Intermedio', instructor: 'Equipo OdonTeck', descripcion: 'Curso A', clases: 3, accesoGratis: true,
    });
    const serializado = JSON.stringify(body);
    for (const privado of ['videoId', 'bunnyCollectionId', 'reservas', 'email', 'stripePriceMensual']) {
      assert.ok(!serializado.includes(privado));
    }
    assert.equal(JSON.stringify(env.db), antes);
  });

  test('sin configuración no inventa precios ni convierte un catálogo vacío en semillas', async () => {
    const { app } = crearEntorno({ semilla: {}, sinStripe: true });
    const { body } = await request(app).get('/landing/catalogo').expect(200);
    assert.deepEqual(body.cursos, []);
    assert.deepEqual(body.planes, { mensual: null, anual: null });
  });

  test('usa precios guardados y rechaza portada externa', async () => {
    const semilla = {
      ...semillaBase(),
      'v2_config/general': { precios: { mensual: 219, anual: 1999 } },
      'v2_cursos/curso-a': { ...semillaBase()['v2_cursos/curso-a'], portada: '//externo.test/x.png' },
    };
    const { app } = crearEntorno({ semilla, sinStripe: true });
    const { body } = await request(app).get('/landing/catalogo').expect(200);
    assert.deepEqual(body.planes, { mensual: 219, anual: 1999 });
    assert.equal(body.cursos[0].imagen, '/cursos/curso-01.webp');
  });

  test('Stripe sólo confirma precios recurrentes MXN y cachea la consulta', async () => {
    const env = crearEntorno();
    let llamadas = 0;
    const app = crearApp({
      db: env.db, auth: env.auth,
      stripe: { prices: { retrieve: async (id) => {
        llamadas++;
        return { active: true, type: 'recurring', currency: id === 'mensual' ? 'mxn' : 'usd', unit_amount: 20000, recurring: { interval: id === 'mensual' ? 'month' : 'year', interval_count: 1 } };
      } } },
      config: { stripePrices: { mensual: 'mensual', anual: 'anual' } },
    });
    const primera = await request(app).get('/landing/catalogo').expect(200);
    assert.deepEqual(primera.body.planes, { mensual: 200, anual: null });
    await request(app).get('/landing/catalogo').expect(200);
    assert.equal(llamadas, 2);
  });

  test('un fallo de lectura responde error y nunca datos de demostración', async () => {
    const env = crearEntorno();
    env.db.collection = () => { throw new Error('sin Firestore'); };
    await request(env.app).get('/landing/catalogo').expect('Cache-Control', 'no-store').expect(500);
  });
});
