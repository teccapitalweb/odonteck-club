import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';

const fuente = await readFile(new URL('../src/landing/guia-datos.ts', import.meta.url), 'utf8');

function cargar(env, fetchImpl = async () => { throw new Error('sin fetch'); }) {
  const preparada = fuente
    .replace("import { Datos } from '../core/datos';", "const { Datos } = require('../core/datos');")
    .replaceAll('import.meta.env', '__env');
  const js = ts.transpileModule(preparada, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const modulo = { exports: {} };
  const contexto = vm.createContext({
    module: modulo, exports: modulo.exports, __env: env, fetch: fetchImpl,
    AbortSignal, Intl, URL, console,
    require(id) {
      if (id !== '../core/datos') throw new Error(`require inesperado: ${id}`);
      return { Datos: {
        config: () => ({ precioMensual: 299, precioAnual: 2990 }),
        cursos: () => [{ id: 'demo', titulo: 'Demo', area: 'General', portada: '/demo.webp', nivel: 'Básico', instructor: 'Equipo', descripcion: 'Demo', publicado: true, clases: [{ gratis: true }] }],
      } };
    },
  });
  new vm.Script(js).runInContext(contexto);
  return modulo.exports;
}

let pruebas = 0;
{
  const api = cargar({ VITE_LANDING_API_URL: 'https://api.odonteck.test/', PROD: true }, async (url, opciones) => {
    assert.equal(url, 'https://api.odonteck.test/landing/catalogo');
    assert.equal(opciones.cache, 'no-store');
    return { ok: true, json: async () => ({ fuente: 'api', verificadoEn: new Date().toISOString(), planes: { mensual: 349, anual: null }, cursos: [{ id: 'uno', titulo: 'Curso', area: 'Endodoncia', imagen: '/portada.webp', nivel: 'Intermedio', instructor: 'Dra.', descripcion: 'Formación', clases: 8, accesoGratis: true }] }) };
  });
  const datos = await api.cargarDatosGuia();
  assert.equal(datos.fuente, 'api');
  assert.equal(datos.cursos[0].id, 'uno');
  pruebas++;
}
{
  const produccion = cargar({ PROD: true });
  await assert.rejects(() => produccion.cargarDatosGuia(), /Falta la API/);
  pruebas++;
}
{
  const caida = cargar({ VITE_API_URL: 'https://api.odonteck.test', PROD: true }, async () => ({ ok: false }));
  await assert.rejects(() => caida.cargarDatosGuia(), /no disponible/);
  pruebas++;
}
{
  const vacio = cargar({ VITE_API_URL: 'https://api.odonteck.test', PROD: true }, async () => ({ ok: true, json: async () => ({ fuente: 'api', verificadoEn: new Date().toISOString(), planes: { mensual: null, anual: null }, cursos: [] }) }));
  assert.equal((await vacio.cargarDatosGuia()).cursos.length, 0);
  pruebas++;
}
{
  for (const invalido of [
    { imagen: 'https://otro.test/x.webp', mensual: 100 },
    { imagen: '/x.webp', mensual: -1 },
  ]) {
    const modulo = cargar({ VITE_API_URL: 'https://api.odonteck.test', PROD: true }, async () => ({ ok: true, json: async () => ({ fuente: 'api', verificadoEn: new Date().toISOString(), planes: { mensual: invalido.mensual, anual: 1000 }, cursos: [{ id: 'x', titulo: 'X', area: 'A', imagen: invalido.imagen, nivel: '', instructor: '', descripcion: '', clases: 1, accesoGratis: false }] }) }));
    await assert.rejects(() => modulo.cargarDatosGuia(), /sin verificación/);
  }
  pruebas++;
}
{
  const demo = cargar({ DEV: true, PROD: false });
  assert.equal(demo.ES_DEMO_GUIA, true);
  assert.equal((await demo.cargarDatosGuia()).fuente, 'demo');
  pruebas++;
}

console.log(`guia-datos: ${pruebas} pruebas OK`);
