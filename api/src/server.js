// Arranque real (Railway): lee variables de entorno, crea dependencias reales y escucha.
import { cert, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import Stripe from 'stripe';
import { crearApp } from './app.js';
import { leerCuentaDeServicio } from './lib/cuenta-servicio.js';
import { crearMaterialesEmpaquetados } from './lib/materiales-empaquetados.js';

function fallar(mensaje) {
  console.error(`[arranque] ${mensaje}`);
  process.exit(1);
}

const env = process.env;

let cuenta;
try {
  cuenta = leerCuentaDeServicio(env.FIREBASE_SERVICE_ACCOUNT);
} catch (e) {
  fallar(`FIREBASE_SERVICE_ACCOUNT no es válido (${e.message}). Pega el JSON completo de la cuenta de servicio, en una línea o en base64.`);
}
if (!cuenta) fallar('Falta FIREBASE_SERVICE_ACCOUNT. Agrégala en Railway → servicio → Variables.');

const faltantes = ['FIREBASE_STORAGE_BUCKET', 'BUNNY_LIBRARY_ID', 'BUNNY_TOKEN_AUTH_KEY', 'STRIPE_SECRET_KEY', 'ALLOWED_ORIGINS', 'APP_URL']
  .filter((k) => !env[k]);
if (faltantes.length) {
  // No se detiene: el club puede arrancar sin pagos o sin video; esas rutas responden 503.
  console.warn(`[arranque] Variables sin definir: ${faltantes.join(', ')}. Las funciones que dependen de ellas responderán 503.`);
}
if (cuenta.project_id !== 'club-odonteck') {
  console.warn(`[arranque] Ojo: la cuenta de servicio es del proyecto "${cuenta.project_id}", no de "club-odonteck".`);
}

initializeApp({ credential: cert(cuenta), storageBucket: env.FIREBASE_STORAGE_BUCKET || undefined });

const app = crearApp({
  db: getFirestore(),
  auth: getAuth(),
  storage: env.FIREBASE_STORAGE_BUCKET ? getStorage() : null,
  materiales: crearMaterialesEmpaquetados({
    directorio: new URL('../private/materiales/', import.meta.url),
    secreto: cuenta.private_key,
  }),
  stripe: env.STRIPE_SECRET_KEY ? new Stripe(env.STRIPE_SECRET_KEY) : null,
  bunny: {
    libraryId: env.BUNNY_LIBRARY_ID || '725453',
    tokenAuthKey: env.BUNNY_TOKEN_AUTH_KEY || '',
    ttlSeconds: Number(env.BUNNY_TOKEN_TTL_SECONDS) || 300,
  },
  config: {
    appUrl: env.APP_URL || 'https://www.odonteckconsulting.com',
    allowedOrigins: String(env.ALLOWED_ORIGINS || '').split(','),
    storageBucket: env.FIREBASE_STORAGE_BUCKET || '',
    stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET || '',
    stripePrices: { mensual: env.STRIPE_PRICE_MENSUAL || '', anual: env.STRIPE_PRICE_ANUAL || '' },
    praxiaCouponApiUrl: env.PRAXIA_COUPON_API_URL || '',
    praxiaCouponApiSecret: env.PRAXIA_COUPON_API_SECRET || '',
  },
});

const puerto = Number(env.PORT) || 8080;
app.listen(puerto, () => {
  console.log(`[arranque] OdonTeck Club API escuchando en el puerto ${puerto} (proyecto ${cuenta.project_id}).`);
});
