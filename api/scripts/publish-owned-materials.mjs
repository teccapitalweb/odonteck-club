#!/usr/bin/env node
// Publica únicamente el lote propio aprobado para el primer lanzamiento.
// Los libros comerciales de `public/libros` y los materiales fuera de esta
// lista nunca se suben. Por defecto es dry-run; --apply escribe Storage/Firestore.
import { readFileSync, statSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mapearMaterial } from '../src/lib/semilla.js';
import { leerCuentaDeServicio } from '../src/lib/cuenta-servicio.js';

const IDS_PROPIOS = new Set([
  'atlas-caries-icdas',
  'guia-diagnostico-ortodoncico',
  'consentimiento-informado',
  'tabla-dosis-anestesicas',
  'protocolo-abscesos',
  'guia-materiales-restauradores',
  'manual-estratificacion-resinas',
  'checklist-urgencias-pediatricas',
  'guia-instrumentacion-endodontica',
  'plantilla-nota-clinica-receta',
]);
const aplicar = process.argv.includes('--apply');
const sobrescribir = process.argv.includes('--sobrescribir');
const raiz = resolve(fileURLToPath(new URL('../../', import.meta.url)));
const todos = JSON.parse(readFileSync(resolve(raiz, 'src/data/materiales.json'), 'utf8'));
const materiales = todos.filter((m) => IDS_PROPIOS.has(m.id));
if (materiales.length !== IDS_PROPIOS.size) throw new Error(`Se esperaban ${IDS_PROPIOS.size} materiales propios y se encontraron ${materiales.length}.`);

const ahora = new Date().toISOString();
const lote = materiales.map((m) => {
  const local = resolve(raiz, 'public', String(m.url).replace(/^\//, ''));
  const cabecera = readFileSync(local).subarray(0, 5).toString('ascii');
  if (cabecera !== '%PDF-') throw new Error(`${basename(local)} no parece un PDF.`);
  return { m, local, bytes: statSync(local).size, datos: mapearMaterial(m, ahora) };
});
if (lote.filter(({ datos }) => datos.gratis).map(({ m }) => m.id).join(',') !== 'atlas-caries-icdas') {
  throw new Error('La lista debe tener exactamente Atlas ICDAS como material gratuito.');
}

console.log(JSON.stringify({
  modo: aplicar ? 'apply' : 'dry-run',
  materiales: lote.length,
  bytes: lote.reduce((s, x) => s + x.bytes, 0),
  gratis: lote.filter((x) => x.datos.gratis).map((x) => x.m.id),
  vip: lote.filter((x) => !x.datos.gratis).map((x) => x.m.id),
}, null, 2));
if (!aplicar) process.exit(0);

const cuenta = leerCuentaDeServicio(process.env.FIREBASE_SERVICE_ACCOUNT);
const bucketName = String(process.env.FIREBASE_STORAGE_BUCKET || '').trim();
if (!cuenta || !bucketName) throw new Error('--apply requiere FIREBASE_SERVICE_ACCOUNT y FIREBASE_STORAGE_BUCKET.');
const { cert, initializeApp } = await import('firebase-admin/app');
const { getFirestore } = await import('firebase-admin/firestore');
const { getStorage } = await import('firebase-admin/storage');
const app = initializeApp({ credential: cert(cuenta), storageBucket: bucketName });
const db = getFirestore(app);
const storage = getStorage(app);
let bucket;
for (const candidato of [...new Set([bucketName, `${cuenta.project_id}.appspot.com`, `${cuenta.project_id}.firebasestorage.app`])]) {
  const b = storage.bucket(candidato);
  const [existe] = await b.exists();
  if (existe) { bucket = b; break; }
}
if (!bucket) throw new Error(`No existe un bucket de Storage para el proyecto ${cuenta.project_id}. Debe habilitarse antes de publicar materiales.`);

let escritos = 0;
let omitidos = 0;
for (const item of lote) {
  const ref = db.collection('v2_materiales').doc(item.m.id);
  const [doc, [archivoExiste]] = await Promise.all([ref.get(), bucket.file(item.datos.archivo).exists()]);
  if (!sobrescribir && doc.exists && archivoExiste) {
    omitidos++;
    continue;
  }
  await bucket.upload(item.local, {
    destination: item.datos.archivo,
    metadata: { contentType: 'application/pdf', cacheControl: 'private, max-age=0, no-store' },
    resumable: false,
  });
  await ref.set(item.datos);
  escritos++;
}
console.log(JSON.stringify({ ok: true, proyecto: cuenta.project_id, bucket: bucket.name, escritos, omitidos }));
