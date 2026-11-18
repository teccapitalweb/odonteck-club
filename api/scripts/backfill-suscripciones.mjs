#!/usr/bin/env node
/*
 * Backfill de v2_suscripciones: rellena importeMensual*, descuento, promotionCode,
 * moneda y altaVip en las suscripciones existentes, leyendo de Stripe en SOLO LECTURA.
 *
 * Stripe se usa SÓLO para LEER (subscriptions.retrieve). Firestore se ESCRIBE para
 * rellenar los campos nuevos. No cancela, no reembolsa, no modifica nada en Stripe.
 *
 * ── Uso en Railway (desde api/) ───────────────────────────────────────────────
 *   railway run node scripts/backfill-suscripciones.mjs            # dry-run (no escribe)
 *   railway run node scripts/backfill-suscripciones.mjs --apply    # aplica
 *   Railway ya inyecta FIREBASE_SERVICE_ACCOUNT y STRIPE_SECRET_KEY del servicio.
 *   Define además EXPECTED_PROJECT_ID=club-odonteck como candado de proyecto.
 *
 * ── Uso local ─────────────────────────────────────────────────────────────────
 *   export FIREBASE_SERVICE_ACCOUNT='{...}'    # JSON en una línea o base64 (igual que la API)
 *   # o bien:  export GOOGLE_APPLICATION_CREDENTIALS=/ruta/service-account.json
 *   export STRIPE_SECRET_KEY=rk_live_...        # ideal: restricted key de SOLO LECTURA
 *   export EXPECTED_PROJECT_ID=club-odonteck
 *   node api/scripts/backfill-suscripciones.mjs            # dry-run
 *   node api/scripts/backfill-suscripciones.mjs --apply    # aplica
 *
 * Idempotente: se puede correr varias veces; sólo escribe los campos calculados.
 */
import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import Stripe from 'stripe';
import { existsSync, readFileSync } from 'node:fs';
import { leerCuentaDeServicio } from '../src/lib/cuenta-servicio.js';
import { resumenImporteSuscripcion } from '../src/lib/suscripciones.js';

const APLICAR = process.argv.includes('--apply');
const LIMITE = Number((process.argv.find((a) => a.startsWith('--limit=')) || '').split('=')[1]) || Infinity;

function abortar(mensaje) {
  console.error(`✖ ${mensaje}`);
  process.exit(1);
}

function requerir(nombre) {
  const v = process.env[nombre];
  if (!v) abortar(`Falta la variable de entorno ${nombre}. Lee las instrucciones al inicio del script.`);
  return v;
}

// Fuente de credencial y project_id, SIN construir aún la credencial (cert valida la
// llave y debe correr DESPUÉS del candado de proyecto). Primero FIREBASE_SERVICE_ACCOUNT
// (el mismo parser que la API en Railway: JSON o base64); si no, GOOGLE_APPLICATION_CREDENTIALS.
function resolverFuente() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    let cuenta;
    try { cuenta = leerCuentaDeServicio(process.env.FIREBASE_SERVICE_ACCOUNT); }
    catch (e) { abortar(`FIREBASE_SERVICE_ACCOUNT no es válido (${e.message}). Pega el JSON completo, en una línea o base64.`); }
    return { cuenta, projectId: cuenta.project_id, fuente: 'FIREBASE_SERVICE_ACCOUNT' };
  }
  const ruta = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (ruta && existsSync(ruta)) {
    let projectId = null;
    try { projectId = JSON.parse(readFileSync(ruta, 'utf8')).project_id || null; } catch { /* se intenta por entorno */ }
    return { cuenta: null, projectId: projectId ?? process.env.GOOGLE_CLOUD_PROJECT ?? process.env.GCLOUD_PROJECT ?? null, fuente: 'GOOGLE_APPLICATION_CREDENTIALS' };
  }
  abortar('Faltan credenciales de Firebase. Define FIREBASE_SERVICE_ACCOUNT (JSON o base64, como la API en Railway) o GOOGLE_APPLICATION_CREDENTIALS (ruta al service account).');
}

// project_id esperado: EXPECTED_PROJECT_ID o projects.default de un .firebaserc cercano.
function leerProjectIdEsperado() {
  if (process.env.EXPECTED_PROJECT_ID) return process.env.EXPECTED_PROJECT_ID.trim();
  for (const ruta of ['.firebaserc', 'api/.firebaserc', '../.firebaserc']) {
    if (existsSync(ruta)) {
      try { const p = JSON.parse(readFileSync(ruta, 'utf8'))?.projects?.default; if (p) return p; } catch { /* sigue */ }
    }
  }
  return null;
}

function modoStripe(key) {
  if (/^rk_/.test(key)) return 'RESTRINGIDA';
  if (/^sk_live_/.test(key)) return 'LIVE';
  if (/^sk_test_/.test(key)) return 'TEST';
  return 'desconocida';
}

async function main() {
  const stripeKey = requerir('STRIPE_SECRET_KEY');
  const fuente = resolverFuente();
  const projectEsperado = leerProjectIdEsperado();

  // Encabezado: nunca imprime llaves ni datos personales, sólo identificadores de entorno.
  console.log(`Firebase project_id: ${fuente.projectId ?? '(desconocido)'}  (de ${fuente.fuente})`);
  console.log(`Stripe: ${modoStripe(stripeKey)}`);
  console.log(`Proyecto OdonTeck esperado: ${projectEsperado ?? '(no definido)'}`);
  console.log(`Modo: ${APLICAR ? 'APPLY (escribe en Firestore)' : 'DRY-RUN (no escribe)'}`);

  // Candado de proyecto, ANTES de construir la credencial: no tocar nunca un proyecto ajeno.
  if (!projectEsperado) abortar('No se pudo determinar el proyecto esperado. Define EXPECTED_PROJECT_ID (p. ej. club-odonteck) o un .firebaserc con projects.default.');
  if (!fuente.projectId) abortar('No se pudo determinar el project_id de las credenciales.');
  if (fuente.projectId !== projectEsperado) abortar(`El project_id actual (${fuente.projectId}) NO es el de OdonTeck (${projectEsperado}). No se tocará ningún proyecto ajeno.`);

  const stripe = new Stripe(stripeKey);
  const credential = fuente.cuenta ? cert(fuente.cuenta) : applicationDefault();
  if (!getApps().length) initializeApp({ credential, projectId: fuente.projectId });
  const db = getFirestore();

  const snap = await db.collection('v2_suscripciones').get();
  let procesadas = 0, actualizadas = 0, sinSubId = 0, errores = 0;

  for (const doc of snap.docs) {
    if (procesadas >= LIMITE) break;
    procesadas++;
    const data = doc.data();
    const subId = data.subscriptionId;
    if (!subId) { sinSubId++; continue; }
    try {
      // SOLO LECTURA de Stripe. Se expanden los descuentos para leer el promo code.
      const sub = await stripe.subscriptions.retrieve(subId, { expand: ['discounts', 'items.data.price'] });
      const importe = resumenImporteSuscripcion(sub);
      const campos = {
        altaVip: sub.created ? new Date(sub.created * 1000).toISOString() : (data.altaVip ?? null),
        ...(importe ? {
          moneda: importe.moneda,
          importeMensualBrutoCents: importe.importeMensualBrutoCents,
          descuentoMensualCents: importe.descuentoMensualCents,
          importeMensualNetoCents: importe.importeMensualNetoCents,
          promotionCode: importe.promotionCode,
        } : {}),
      };
      const cambiados = Object.keys(campos).filter((k) => JSON.stringify(data[k]) !== JSON.stringify(campos[k]));
      if (!cambiados.length) continue;
      actualizadas++;
      // Sólo el id del documento y los NOMBRES de los campos que cambian. Sin valores.
      console.log(`  ${doc.id}: ${APLICAR ? 'escrito' : 'cambiaría'} → ${cambiados.join(', ')}`);
      if (APLICAR) await doc.ref.set(campos, { merge: true });
    } catch (e) {
      errores++;
      console.error(`  ${doc.id}: error al leer la suscripción en Stripe (${e.code || e.type || 'error'}).`);
    }
  }

  console.log(`\nResumen: ${procesadas} procesadas, ${actualizadas} ${APLICAR ? 'actualizadas' : 'cambiarían'}, ${sinSubId} sin subscriptionId, ${errores} con error.`);
  if (!APLICAR) console.log('Dry-run: no se escribió nada. Añade --apply para aplicar.');
  process.exit(errores ? 1 : 0);
}

main().catch((e) => { console.error(e.message || e); process.exit(1); });
