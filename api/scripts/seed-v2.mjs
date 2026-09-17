#!/usr/bin/env node
// Siembra v2_cursos desde ../src/data/catalogo.json y v2_materiales desde ../src/data/materiales.json.
//
// Por defecto es un ensayo (--dry-run): imprime lo que haría y no se conecta a nada.
// Para escribir hay que pedirlo explícitamente:
//   FIREBASE_SERVICE_ACCOUNT='<json o base64>' node scripts/seed-v2.mjs --apply
// Opciones:
//   --apply        escribe en Firestore
//   --sobrescribir reemplaza documentos que ya existen (por defecto se respetan las ediciones del admin)
//   --solo=cursos | --solo=materiales
import { readFileSync } from 'node:fs';
import { mapearCurso, mapearMaterial } from '../src/lib/semilla.js';

const args = new Set(process.argv.slice(2));
const aplicar = args.has('--apply');
const sobrescribir = args.has('--sobrescribir');
const solo = [...args].find((a) => a.startsWith('--solo='))?.split('=')[1];
if (aplicar && args.has('--dry-run')) {
  console.error('Usa --apply o --dry-run, no ambos.');
  process.exit(1);
}
if (solo && !['cursos', 'materiales'].includes(solo)) {
  console.error('--solo debe ser "cursos" o "materiales".');
  process.exit(1);
}

const leerJson = (ruta) => JSON.parse(readFileSync(new URL(ruta, import.meta.url), 'utf8'));
const ahora = new Date().toISOString();

const catalogo = leerJson('../../src/data/catalogo.json');
const materialesJson = leerJson('../../src/data/materiales.json');

const lotes = [];
const errores = [];
if (solo !== 'materiales') {
  const cursos = Array.isArray(catalogo) ? catalogo : catalogo.cursos ?? [];
  if (catalogo.libraryId && String(catalogo.libraryId) !== '725453') {
    console.warn(`Aviso: catalogo.json usa la biblioteca ${catalogo.libraryId}, no la 725453 del contrato.`);
  }
  for (const c of cursos) {
    try {
      lotes.push({ coleccion: 'v2_cursos', id: c.id, datos: mapearCurso(c, ahora) });
    } catch (e) {
      errores.push(`curso ${c.id}: ${e.message}`);
    }
  }
}
if (solo !== 'cursos') {
  const materiales = Array.isArray(materialesJson) ? materialesJson : materialesJson.materiales ?? [];
  for (const m of materiales) {
    try {
      lotes.push({ coleccion: 'v2_materiales', id: m.id, datos: mapearMaterial(m, ahora) });
    } catch (e) {
      errores.push(`material ${m.id}: ${e.message}`);
    }
  }
}

if (errores.length) {
  console.error('Hay datos que no pasan la validación; no se escribe nada:');
  for (const e of errores) console.error(`  - ${e}`);
  process.exit(1);
}

const resumenDoc = ({ coleccion, id, datos }) => {
  if (coleccion === 'v2_cursos') {
    const gratis = datos.clases.filter((c) => c.gratis).map((c) => c.n);
    return `${coleccion}/${id} · "${datos.titulo}" · ${datos.clases.length} clases (gratis: ${gratis.join(', ') || 'ninguna'}) · publicado=${datos.publicado}`;
  }
  return `${coleccion}/${id} · "${datos.titulo}" · ${datos.estado} · archivo=${datos.archivo}`;
};

if (!aplicar) {
  console.log('ENSAYO (--dry-run): no se escribe nada. Usa --apply para escribir.\n');
  for (const l of lotes) console.log(`  set ${resumenDoc(l)}`);
  console.log(`\nTotal: ${lotes.length} documentos.`);
  console.log('Recuerda: los PDF deben subirse aparte a Storage en materiales/<id>.pdf.');
  process.exit(0);
}

// --- Escritura real ---
const { leerCuentaDeServicio } = await import('../src/lib/cuenta-servicio.js');
let cuenta;
try {
  cuenta = leerCuentaDeServicio(process.env.FIREBASE_SERVICE_ACCOUNT);
} catch (e) {
  console.error(`FIREBASE_SERVICE_ACCOUNT no es válido: ${e.message}`);
  process.exit(1);
}
if (!cuenta) {
  console.error('Me niego a continuar: --apply requiere FIREBASE_SERVICE_ACCOUNT definida explícitamente.');
  process.exit(1);
}
const { cert, initializeApp } = await import('firebase-admin/app');
const { getFirestore } = await import('firebase-admin/firestore');
initializeApp({ credential: cert(cuenta) });
const db = getFirestore();

console.log(`Escribiendo en el proyecto ${cuenta.project_id}...`);
let escritos = 0;
let omitidos = 0;
for (const l of lotes) {
  const ref = db.collection(l.coleccion).doc(l.id);
  if (!sobrescribir && (await ref.get()).exists) {
    console.log(`  omitido (ya existe) ${l.coleccion}/${l.id}`);
    omitidos++;
    continue;
  }
  await ref.set(l.datos);
  console.log(`  escrito ${resumenDoc(l)}`);
  escritos++;
}
console.log(`\nListo: ${escritos} escritos, ${omitidos} omitidos.`);
