#!/usr/bin/env node
// Crea una sola vez el bucket privado del club. Por defecto solo inspecciona;
// --apply permite crear/configurar el recurso tras autorización del propietario.
import { cert, initializeApp } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { leerCuentaDeServicio } from '../src/lib/cuenta-servicio.js';

const aplicar = process.argv.includes('--apply');
const cuenta = leerCuentaDeServicio(process.env.FIREBASE_SERVICE_ACCOUNT);
const bucketName = String(process.env.FIREBASE_STORAGE_BUCKET || '').trim();
if (!cuenta || !bucketName) throw new Error('Faltan FIREBASE_SERVICE_ACCOUNT o FIREBASE_STORAGE_BUCKET.');
const app = initializeApp({ credential: cert(cuenta), projectId: cuenta.project_id, storageBucket: bucketName });
const bucket = getStorage(app).bucket(bucketName);
const [existe] = await bucket.exists();

if (!existe && !aplicar) {
  console.log(JSON.stringify({ existe: false, proyecto: cuenta.project_id, bucket: bucketName, accion: 'ejecutar con --apply para crear privado en US' }));
  process.exit(0);
}

if (!existe) {
  await bucket.storage.createBucket(bucketName, {
    location: 'US',
    iamConfiguration: {
      uniformBucketLevelAccess: { enabled: true },
      publicAccessPrevention: 'enforced',
    },
    labels: { app: 'odonteck-club', contenido: 'materiales-privados' },
  });
}

const activo = getStorage(app).bucket(bucketName);
await activo.setCorsConfiguration([{
  origin: ['https://www.odonteckconsulting.com', 'https://club.odonteckconsulting.com', 'http://localhost:5173', 'http://127.0.0.1:5173'],
  method: ['GET', 'HEAD', 'PUT'],
  responseHeader: ['Content-Type', 'Content-Length'],
  maxAgeSeconds: 3600,
}]);
const [meta] = await activo.getMetadata();
console.log(JSON.stringify({
  ok: true,
  creado: !existe,
  proyecto: cuenta.project_id,
  bucket: activo.name,
  ubicacion: meta.location,
  accesoUniforme: meta.iamConfiguration?.uniformBucketLevelAccess?.enabled === true,
  prevencionPublica: meta.iamConfiguration?.publicAccessPrevention ?? null,
}));
