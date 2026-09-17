// Utilidades de línea de comandos, rutas y archivos compartidas por los scripts.
import { parseArgs } from 'node:util';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync, renameSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const DIR_PIPELINE = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const DIR_OUT = process.env.PIPELINE_OUT_DIR ? resolve(process.env.PIPELINE_OUT_DIR) : join(DIR_PIPELINE, 'out');
export const RUTA_CATALOGO = process.env.CATALOGO_PATH ? resolve(process.env.CATALOGO_PATH) : resolve(DIR_PIPELINE, '..', '..', 'src', 'data', 'catalogo.json');

export const rutas = {
  inventario: () => join(DIR_OUT, 'inventario.json'),
  solicitudesTranscripcion: () => join(DIR_OUT, 'transcripciones-solicitadas.json'),
  vtt: (videoId) => join(DIR_OUT, 'vtt', `${videoId}.vtt`),
  transcripcion: (videoId) => join(DIR_OUT, 'transcripciones', `${videoId}.json`),
  contenido: (cursoId) => join(DIR_OUT, 'contenido', `${cursoId}.json`),
  dirContenido: () => join(DIR_OUT, 'contenido'),
  reporte: (nombre) => join(DIR_OUT, 'reportes', nombre),
};

/**
 * Parsea argumentos con las banderas comunes (--help, --apply, --dry-run) más las del script.
 * `--dry-run` es el modo por defecto; `--apply` debe pasarse explícitamente.
 */
export function leerArgs(opcionesExtra = {}, argv = process.argv.slice(2)) {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: false,
    strict: true,
    options: {
      help: { type: 'boolean', short: 'h', default: false },
      apply: { type: 'boolean', default: false },
      'dry-run': { type: 'boolean', default: false },
      ...opcionesExtra,
    },
  });
  if (values.apply && values['dry-run']) throw new Error('Usa --apply o --dry-run, no ambos');
  return { ...values, aplicar: values.apply === true, positionals };
}

/** Ejecuta `main` mostrando errores legibles y código de salida 1. */
export function ejecutar(main) {
  main().catch((err) => {
    console.error(`\n✗ ${err?.message ?? err}`);
    if (process.env.DEBUG) console.error(err);
    process.exitCode = 1;
  });
}

export function leerJson(ruta) {
  return JSON.parse(readFileSync(ruta, 'utf8'));
}

export function leerJsonSiExiste(ruta, porDefecto = null) {
  return existsSync(ruta) ? leerJson(ruta) : porDefecto;
}

/** Escritura atómica (archivo temporal + rename) para no dejar JSON a medias. */
export function escribirJson(ruta, datos) {
  mkdirSync(dirname(ruta), { recursive: true });
  const tmp = `${ruta}.tmp`;
  writeFileSync(tmp, JSON.stringify(datos, null, 2) + '\n');
  renameSync(tmp, ruta);
}

export function escribirTexto(ruta, texto) {
  mkdirSync(dirname(ruta), { recursive: true });
  const tmp = `${ruta}.tmp`;
  writeFileSync(tmp, texto);
  renameSync(tmp, ruta);
}

export function listarJson(dir) {
  return existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => join(dir, f)) : [];
}

export function leerCatalogo(ruta = RUTA_CATALOGO) {
  if (!existsSync(ruta)) throw new Error(`No existe el catálogo: ${ruta}`);
  return leerJson(ruta);
}

export function leerInventario() {
  const ruta = rutas.inventario();
  if (!existsSync(ruta)) throw new Error(`No existe ${ruta}. Corre primero: node bunny-inventario.mjs --apply`);
  return leerJson(ruta);
}

/** Lee una variable de entorno obligatoria sin imprimir su valor. */
export function requerirEnv(nombre) {
  const v = process.env[nombre];
  if (!v) throw new Error(`Falta la variable de entorno ${nombre}`);
  return v;
}

export function avisoModo(aplicar) {
  console.log(aplicar ? '▶ Modo APPLY: se escribirán cambios.' : '◌ Modo DRY-RUN (por defecto): no se escribe nada. Usa --apply para ejecutar.');
}
