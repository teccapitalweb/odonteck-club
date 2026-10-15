import assert from 'node:assert/strict';
import { beforeEach, describe, test } from 'node:test';
import request from 'supertest';
import { crearApp } from '../src/app.js';
import { requireAdmin, requireAuth } from '../src/middleware/auth.js';
import { AHORA_ISO, bearer } from './fakes/app.js';
import { FakeFirestore } from './fakes/firestore.js';
import { crearAuthFalso, crearStorageFalso } from './fakes/servicios.js';

const AHORA_S = Date.parse(AHORA_ISO) / 1000;

let env;
beforeEach(() => {
  const reloj = { ahora: new Date(AHORA_ISO) };
  const tokens = {
    'tk-vip': { uid: 'vip1', email: 'ana@example.com', name: 'Ana', exp: AHORA_S + 3600 },
    'tk-admin': { uid: 'adm1', email: 'admin@example.com', admin: true, exp: AHORA_S + 3600 },
    'tk-corto': { uid: 'vip1', email: 'ana@example.com', exp: AHORA_S + 60 },
  };
  const auth = crearAuthFalso({ tokens });
  const db = new FakeFirestore({
    'miembros/vip1': { activa: true, plan: 'mensual', expiraEn: '2026-12-31T00:00:00.000Z', nombre: 'Dra. Ana VIP', email: 'ana@example.com' },
    'v2_cursos/curso-a': {
      titulo: 'Curso A',
      publicado: true,
      clases: [{ n: 1, titulo: 'Clase 1', gratis: true, ficha: { estado: 'aprobada', archivo: 'fichas/curso-a/1.pdf' } }],
    },
    'v2_materiales/guia': { titulo: 'Guía', estado: 'disponible', gratis: true, archivo: 'materiales/guia.pdf' },
  });
  const app = crearApp({ db, auth, storage: crearStorageFalso(), now: () => new Date(reloj.ahora), logger: { error() {}, warn() {}, info() {} } });
  env = { app, auth, tokens, reloj };
});

const verificaciones = (token) => env.auth.llamadas.filter((l) => l.token === token).length;
const avanzar = (ms) => { env.reloj.ahora = new Date(env.reloj.ahora.getTime() + ms); };

describe('caché de verificación de token', () => {
  test('dos GET autenticados con el mismo token verifican una sola vez', async () => {
    const a = await request(env.app).get('/me').set(bearer('tk-vip')).expect(200);
    const b = await request(env.app).get('/me').set(bearer('tk-vip')).expect(200);
    await request(env.app).get('/progreso').set(bearer('tk-vip')).expect(200);
    assert.equal(verificaciones('tk-vip'), 1);
    assert.deepEqual(b.body, a.body);
    assert.equal(b.body.uid, 'vip1');
    assert.equal(b.headers['cache-control'], 'no-store');
  });

  test('un POST con el mismo token vuelve a verificar con checkRevoked', async () => {
    await request(env.app).get('/me').set(bearer('tk-vip')).expect(200);
    await request(env.app).post('/recompensas/notificaciones/leidas').set(bearer('tk-vip')).expect(200);
    assert.equal(verificaciones('tk-vip'), 2);
    assert.deepEqual(env.auth.llamadas.at(-1), { token: 'tk-vip', checkRevoked: true });
  });

  test('un GET bajo /admin verifica en vivo aunque el token esté en caché', async () => {
    const me = await request(env.app).get('/me').set(bearer('tk-admin')).expect(200);
    assert.equal(me.body.esAdmin, true);
    await request(env.app).get('/admin/config').set(bearer('tk-admin')).expect(200);
    await request(env.app).get('/admin/config').set(bearer('tk-admin')).expect(200);
    await request(env.app).get('/ADMIN/config').set(bearer('tk-admin')).expect(200);
    assert.equal(verificaciones('tk-admin'), 4);
    assert.deepEqual(env.auth.llamadas.at(-1), { token: 'tk-admin', checkRevoked: true });
  });

  test('un admin nunca se sirve desde la caché, tampoco en rutas de miembro', async () => {
    await request(env.app).get('/me').set(bearer('tk-admin')).expect(200);
    await request(env.app).get('/me').set(bearer('tk-admin')).expect(200);
    await request(env.app).get('/progreso').set(bearer('tk-admin')).expect(200);
    assert.equal(verificaciones('tk-admin'), 3);
    env.tokens['tk-admin'].revocado = true;
    const revocado = await request(env.app).get('/me').set(bearer('tk-admin')).expect(401);
    assert.equal(revocado.body.error, 'sesion_revocada');
  });

  test('las descargas de materiales y las fichas (URLs firmadas) verifican en vivo', async () => {
    await request(env.app).get('/me').set(bearer('tk-vip')).expect(200);
    await request(env.app).get('/materiales/guia/descarga').set(bearer('tk-vip')).expect(200);
    await request(env.app).get('/Materiales/guia/DESCARGA').set(bearer('tk-vip')).expect(200);
    await request(env.app).get('/clases/curso-a/1/ficha').set(bearer('tk-vip')).expect(200);
    await request(env.app).get('/CLASES/curso-a/1/Ficha/').set(bearer('tk-vip')).expect(200);
    assert.equal(verificaciones('tk-vip'), 5);
    await request(env.app).get('/progreso').set(bearer('tk-vip')).expect(200);
    assert.equal(verificaciones('tk-vip'), 5, 'el resto de lecturas de miembro sí usa la caché');
    env.tokens['tk-vip'].revocado = true;
    const descarga = await request(env.app).get('/materiales/guia/descarga').set(bearer('tk-vip')).expect(401);
    assert.equal(descarga.body.error, 'sesion_revocada');
  });

  test('una revocación detectada en vivo invalida la caché del token', async () => {
    await request(env.app).get('/me').set(bearer('tk-vip')).expect(200);
    env.tokens['tk-vip'].revocado = true;
    await request(env.app).get('/me').set(bearer('tk-vip')).expect(200);
    const post = await request(env.app).post('/recompensas/notificaciones/leidas').set(bearer('tk-vip')).expect(401);
    assert.equal(post.body.error, 'sesion_revocada');
    const get = await request(env.app).get('/me').set(bearer('tk-vip')).expect(401);
    assert.equal(get.body.error, 'sesion_revocada');
    assert.equal(verificaciones('tk-vip'), 3);
  });

  test('los errores de verificación no se cachean', async () => {
    for (let i = 0; i < 2; i++) {
      const res = await request(env.app).get('/me').set(bearer('tk-falso')).expect(401);
      assert.deepEqual(res.body, { error: 'token_invalido', mensaje: 'No pudimos verificar tu sesión. Vuelve a iniciar sesión.' });
    }
    assert.equal(verificaciones('tk-falso'), 2);
  });

  test('la entrada vence a los 5 minutos o antes si el token expira', async () => {
    await request(env.app).get('/me').set(bearer('tk-vip')).expect(200);
    await request(env.app).get('/me').set(bearer('tk-corto')).expect(200);
    avanzar(61_000);
    await request(env.app).get('/me').set(bearer('tk-vip')).expect(200);
    await request(env.app).get('/me').set(bearer('tk-corto')).expect(200);
    assert.equal(verificaciones('tk-vip'), 1);
    assert.equal(verificaciones('tk-corto'), 2);
    avanzar(4 * 60_000);
    await request(env.app).get('/me').set(bearer('tk-vip')).expect(200);
    assert.equal(verificaciones('tk-vip'), 2);
  });
});

describe('middleware aislado', () => {
  const peticion = (token, path = '/me', method = 'GET') => ({ method, baseUrl: '', path, headers: { authorization: `Bearer ${token}` } });
  const respuesta = { set() {} };
  const ejecutar = (mw, req) => new Promise((resolve) => { mw(req, respuesta, (err) => resolve(err)); });
  const diferido = () => {
    let soltar;
    const promesa = new Promise((resolve) => { soltar = resolve; });
    return { promesa, soltar };
  };

  function crearCtx({ conExp = true } = {}) {
    const llamadas = [];
    const auth = {
      async verifyIdToken(token) {
        llamadas.push(token);
        return { uid: token, ...(conExp ? { exp: AHORA_S + 3600 } : {}) };
      },
    };
    return { ctx: { auth, now: () => new Date(AHORA_ISO) }, llamadas };
  }

  /** Auth que decide el resultado al recibir la llamada y lo entrega cuando se suelta `control.pausa`. */
  function crearCtxPausable() {
    const llamadas = [];
    const control = { revocado: false, pausa: null };
    const auth = {
      async verifyIdToken(token) {
        llamadas.push(token);
        const { revocado, pausa } = control;
        if (pausa) await pausa;
        if (revocado) throw Object.assign(new Error('The Firebase ID token has been revoked.'), { code: 'auth/id-token-revoked' });
        return { uid: token, admin: token.startsWith('adm'), exp: AHORA_S + 3600 };
      },
    };
    return { ctx: { auth, now: () => new Date(AHORA_ISO) }, llamadas, control };
  }

  test('requireAdmin exige que el claim se haya verificado en vivo en esa misma petición', async () => {
    const auth = { async verifyIdToken() { return { uid: 'adm1', admin: true, exp: AHORA_S + 3600 }; } };
    const mw = requireAuth({ auth, now: () => new Date(AHORA_ISO) });
    for (let i = 0; i < 2; i++) {
      const req = peticion('tk-admin');
      assert.equal(await ejecutar(mw, req), undefined);
      assert.equal(req.usuario.esAdmin, true);
      assert.equal(await ejecutar(requireAdmin, req), undefined);
    }
    const sinVerificar = { ...peticion('tk-admin'), usuario: { uid: 'adm1', esAdmin: true } };
    const err = await ejecutar(requireAdmin, sinVerificar);
    assert.equal(err.status, 403);
    assert.equal(err.error, 'prohibido');
  });

  test('carrera: un GET lento no vuelve a cachear un token que un POST detectó revocado', async () => {
    const { ctx, llamadas, control } = crearCtxPausable();
    const mw = requireAuth(ctx);
    const pausa = diferido();
    control.pausa = pausa.promesa;
    const lento = ejecutar(mw, peticion('tk-a'));
    control.pausa = null;
    control.revocado = true;
    const post = await ejecutar(mw, peticion('tk-a', '/foro', 'POST'));
    assert.equal(post.error, 'sesion_revocada');
    pausa.soltar();
    assert.equal(await lento, undefined, 'el GET que ya verificaba termina con su resultado');
    const siguiente = await ejecutar(mw, peticion('tk-a'));
    assert.equal(siguiente?.status, 401);
    assert.equal(siguiente.error, 'sesion_revocada');
    assert.equal(llamadas.length, 3);
  });

  test('un token con lápida se verifica en vivo y, si resulta válido, vuelve a la caché', async () => {
    let falla = true;
    const llamadas = [];
    const auth = {
      async verifyIdToken(token) {
        llamadas.push(token);
        if (falla) throw Object.assign(new Error('revocado'), { code: 'auth/id-token-revoked' });
        return { uid: token, exp: AHORA_S + 3600 };
      },
    };
    const mw = requireAuth({ auth, now: () => new Date(AHORA_ISO) });
    assert.equal((await ejecutar(mw, peticion('tk-a'))).error, 'sesion_revocada');
    falla = false;
    assert.equal(await ejecutar(mw, peticion('tk-a')), undefined);
    assert.equal(await ejecutar(mw, peticion('tk-a', '/catalogo')), undefined);
    assert.equal(llamadas.length, 2);
  });

  test('los tokens basura no dejan lápida ni expulsan sesiones válidas', async () => {
    const llamadas = [];
    const auth = {
      async verifyIdToken(token) {
        llamadas.push(token);
        if (token.startsWith('basura')) throw Object.assign(new Error('mal formado'), { code: 'auth/argument-error' });
        return { uid: token, exp: AHORA_S + 3600 };
      },
    };
    const mw = requireAuth({ auth, now: () => new Date(AHORA_ISO) });
    assert.equal(await ejecutar(mw, peticion('legit')), undefined);
    for (let i = 0; i < 5000; i++) assert.equal((await ejecutar(mw, peticion(`basura-${i}`))).error, 'token_invalido');
    assert.equal(await ejecutar(mw, peticion('legit')), undefined);
    assert.equal(llamadas.filter((t) => t === 'legit').length, 1);
  });

  test('tres GET simultáneos con la caché vacía comparten una sola verificación', async () => {
    const { ctx, llamadas, control } = crearCtxPausable();
    const mw = requireAuth(ctx);
    const pausa = diferido();
    control.pausa = pausa.promesa;
    const reqs = ['/me', '/catalogo', '/progreso'].map((ruta) => peticion('tk-a', ruta));
    const pendientes = reqs.map((req) => ejecutar(mw, req));
    pausa.soltar();
    assert.deepEqual(await Promise.all(pendientes), [undefined, undefined, undefined]);
    assert.equal(llamadas.length, 1);
    reqs.forEach((req) => assert.equal(req.usuario.uid, 'tk-a'));
    assert.equal(await ejecutar(mw, peticion('tk-a', '/foro')), undefined);
    assert.equal(llamadas.length, 1);
  });

  test('si la verificación compartida falla, todas las peticiones reciben el 401', async () => {
    const { ctx, llamadas, control } = crearCtxPausable();
    const mw = requireAuth(ctx);
    const pausa = diferido();
    control.pausa = pausa.promesa;
    control.revocado = true;
    const pendientes = ['/me', '/catalogo', '/progreso'].map((ruta) => ejecutar(mw, peticion('tk-a', ruta)));
    pausa.soltar();
    for (const err of await Promise.all(pendientes)) assert.equal(err?.error, 'sesion_revocada');
    assert.equal(llamadas.length, 1);
  });

  test('escrituras, /admin y URLs firmadas no se suman a una verificación en curso', async () => {
    const { ctx, llamadas, control } = crearCtxPausable();
    const mw = requireAuth(ctx);
    const pausa = diferido();
    control.pausa = pausa.promesa;
    const pendientes = [
      ejecutar(mw, peticion('tk-a')),
      ejecutar(mw, peticion('tk-a', '/foro', 'POST')),
      ejecutar(mw, peticion('tk-a', '/materiales/guia/descarga')),
      ejecutar(mw, peticion('tk-a', '/clases/curso-a/1/ficha')),
      ejecutar(mw, { ...peticion('tk-a', '/config'), baseUrl: '/admin' }),
    ];
    pausa.soltar();
    assert.deepEqual(await Promise.all(pendientes), Array(5).fill(undefined));
    assert.equal(llamadas.length, 5);
  });

  test('un admin no reutiliza la verificación de otra petición', async () => {
    const { ctx, llamadas, control } = crearCtxPausable();
    const mw = requireAuth(ctx);
    const pausa = diferido();
    control.pausa = pausa.promesa;
    const pendientes = [ejecutar(mw, peticion('adm-1')), ejecutar(mw, peticion('adm-1', '/catalogo'))];
    pausa.soltar();
    assert.deepEqual(await Promise.all(pendientes), [undefined, undefined]);
    assert.equal(llamadas.length, 2);
    assert.equal(await ejecutar(mw, peticion('adm-1')), undefined);
    assert.equal(llamadas.length, 3);
  });

  test('sin exp en el token no se cachea', async () => {
    const { ctx, llamadas } = crearCtx({ conExp: false });
    const mw = requireAuth(ctx);
    await ejecutar(mw, peticion('tk-a'));
    await ejecutar(mw, peticion('tk-a'));
    assert.equal(llamadas.length, 2);
  });

  test('tope de 5000 entradas: se descartan las más antiguas', async () => {
    const { ctx, llamadas } = crearCtx();
    const mw = requireAuth(ctx);
    for (let i = 0; i <= 5000; i++) await ejecutar(mw, peticion(`tk-${i}`));
    assert.equal(llamadas.length, 5001);
    await ejecutar(mw, peticion('tk-5000'));
    assert.equal(llamadas.length, 5001);
    await ejecutar(mw, peticion('tk-0'));
    assert.equal(llamadas.length, 5002);
  });
});
