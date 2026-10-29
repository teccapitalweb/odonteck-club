import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { test } from 'node:test';

function cargar(file, mocks = {}, globals = {}) {
  const src = readFileSync(new URL('../src/' + file, import.meta.url), 'utf8').replaceAll('import.meta.env', '__env');
  const code = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const module = { exports: {} };
  const ctx = vm.createContext({ module, exports: module.exports, __env: { VITE_API_URL: 'https://api.test' }, URL, console, Event, queueMicrotask,
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    require: id => { if (!(id in mocks)) throw Error('Unexpected module: ' + id); return mocks[id]; }, ...globals });
  new vm.Script(code).runInContext(ctx);
  return module.exports;
}
const tick = () => new Promise(resolve => setImmediate(resolve));
const delay = () => { let resolve; const promise = new Promise(r => resolve = r); return { promise, resolve }; };

test('no acepta una elección tardía de otra cuenta; reintenta después de una desconexión', async () => {
  const auth = { usuario: { uid: 'a' } }, pending = delay();
  let request = () => pending.promise;
  const { CursoGratis } = cargar('core/curso-gratis.ts', { './auth': { Auth: auth, api: (...args) => request(...args) }, './datos': { Datos: { modo: 'api' } } });
  const primera = CursoGratis.cargar();
  auth.usuario = { uid: 'b' }; CursoGratis.limpiar();
  pending.resolve({ cursoId: 'curso-de-a' }); await primera;
  assert.equal(CursoGratis.cargado(), false);
  request = async () => { throw Error('sin red'); };
  await assert.rejects(CursoGratis.cargar(), /sin red/);
  assert.equal(CursoGratis.cargado(), false);
  request = async () => ({ cursoId: 'curso-de-b' });
  await CursoGratis.cargar(); assert.equal(CursoGratis.id(), 'curso-de-b');
  request = async () => { throw Error('sin red'); };
  await assert.rejects(CursoGratis.cargar(), /sin red/);
  assert.equal(CursoGratis.id(), 'curso-de-b');
});

test('perfil y progreso remoto funcionan con almacenamiento local bloqueado y no heredan otra cuenta', () => {
  const localStorage = { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); } };
  const { Perfil } = cargar('core/perfil.ts', {}, { localStorage });
  Perfil.seleccionarCuenta('a'); Perfil.hidratar({ nombre: 'Cuenta A', recorridoVisto: true }, 'mensual');
  assert.equal(Perfil.get().nombre, 'Cuenta A');
  Perfil.seleccionarCuenta('b'); assert.equal(Perfil.get().nombre, 'Mi cuenta'); assert.equal(Perfil.get().plan, 'invitado');
  const { Progreso } = cargar('core/progreso.ts', { './catalogo': { cursos: [] } }, { localStorage });
  Progreso.hidratar({ curso: { vistas: [1, 2], ultima: 2, actualizado: '2026-10-29' } });
  assert.equal(Progreso.totalVistas(), 2);
  Progreso.hidratar({}); assert.equal(Progreso.totalVistas(), 0);
});

test('una encuesta de la cuenta anterior en vuelo no reaparece al cambiar de usuario', async () => {
  const auth = { usuario: { uid: 'a' } }, pending = delay(); let request = () => pending.promise;
  const module = cargar('core/encuestas.ts', {
    './auth': { Auth: auth, api: () => request() }, './datos': { Datos: { modo: 'api' } }, './progreso': { Progreso: {} }, './brujula': { calcularBrujula() {} },
  });
  const inicial = module.cargarEncuestas();
  auth.usuario = { uid: 'b' }; request = async () => ({ pendientes: [], respondidas: ['bienvenida-v2'] });
  await module.cargarEncuestas();
  pending.resolve({ pendientes: [{ tipo: 'bienvenida' }], respondidas: [] }); await inicial;
  assert.equal(module.encuestaPendiente(), null);
  assert.equal(module.encuestaRespondida('bienvenida'), true);
});

test('el recorrido no se abre en un dispositivo nuevo si ya hay curso, respuesta o marca del servidor', async () => {
  for (const reason of ['curso', 'encuesta', 'servidor']) {
    let writes = 0;
    const perfil = { recorridoVisto: reason === 'servidor' };
    const module = cargar('ui/onboarding.ts', {
      lucide: { createIcons() {}, icons: {} }, '../core/auth': { Auth: { usuario: { uid: 'a' }, perfilResuelto: () => true }, api: async () => { writes++; } },
      '../core/datos': { Datos: { modo: 'api' } }, '../core/perfil': { Perfil: { get: () => perfil, set: p => Object.assign(perfil, p) } },
      '../core/curso-gratis': { CursoGratis: { id: () => reason === 'curso' ? 'curso-a' : null } },
      '../core/encuestas': { encuestaRespondida: () => reason === 'encuesta' }, '../core/progreso': { Progreso: { totalVistas: () => 0 } },
    }, { document: { querySelector: () => null, createElement() { assert.fail('No debe abrir el recorrido'); } } });
    module.mostrarOnboarding(); await tick();
    assert.equal(writes, reason === 'servidor' ? 0 : 1);
  }
});

test('Auth espera la sesión restaurada, admite persistencia durable y no confirma un perfil fallido', async () => {
  const tokenReady = delay(); let failMe = true, config;
  const user = { uid: 'persistido', email: 'test@example.com', getIdTokenResult: () => tokenReady.promise, getIdToken: async () => 'token-test' };
  const instance = { currentUser: user };
  const firebase = { initializeAuth: (_app, options) => { config = options; return instance; }, indexedDBLocalPersistence: 'idb', browserLocalPersistence: 'local', browserPopupRedirectResolver: 'popup', onAuthStateChanged: (_auth, cb) => { queueMicrotask(() => cb(user)); return () => {}; } };
  let hydrated = 0;
  const { Auth } = cargar('core/auth.ts', {
    './datos': { Datos: { modo: 'api' } }, './perfil': { Perfil: { seleccionarCuenta() {}, hidratar() { hydrated++; } } },
    'firebase/app': { initializeApp: () => ({}) }, 'firebase/auth': firebase,
  }, { document: { querySelector: () => true }, window: new EventTarget(), fetch: async () => ({ ok: !failMe, status: failMe ? 503 : 200, json: async () => failMe ? { mensaje: 'Sin conexión' } : { esVip: true, plan: 'mensual', perfil: { nombre: 'Miembro' } } }) });
  let ready = false; const init = Auth.iniciar().then(() => ready = true); await tick();
  assert.equal(ready, false); tokenReady.resolve({ claims: {} }); await init;
  assert.equal(Auth.usuario.uid, 'persistido');
  assert.deepEqual(Array.from(config.persistence), ['idb', 'local']);
  await assert.rejects(Auth.perfil(), /Sin conexión/); assert.equal(Auth.perfilResuelto(), false); assert.equal(hydrated, 0);
  failMe = false; await Auth.perfil(); assert.equal(Auth.perfilResuelto(), true); assert.equal(Auth.usuario.esVip, true); assert.equal(hydrated, 1);
});
