#!/usr/bin/env node
/*
 * Backfill de v2_suscripciones: rellena importeMensual*, descuento, promotionCode,
 * moneda y altaVip en las suscripciones existentes, leyendo de Stripe en SOLO LECTURA.
 *
 * Stripe se usa SÓLO para LEER (subscriptions.retrieve). Firestore se ESCRIBE para
 * rellenar los campos nuevos. No cancela, no reembolsa, no modifica nada en Stripe.
 *
 * ── Uso (lo corres tú; este repo NO lo ejecuta) ───────────────────────────────
 *   1. Credenciales de servicio de Firebase (proyecto OdonTeck):
 *        export GOOGLE_APPLICATION_CREDENTIALS=/ruta/service-account.json
 *   2. Llave SECRETA de Stripe en modo lectura (restricted key de solo lectura ideal):
 *        export STRIPE_SECRET_KEY=sk_live_...        # o sk_test_... en pruebas
 *   3. Proyecto OdonTeck esperado (red de seguridad para no tocar otro proyecto):
 *        export EXPECTED_PROJECT_ID=club-odonteck    # o un .firebaserc con projects.default
 *   4. Dry-run (por defecto): muestra qué cambiaría, SIN escribir:
 *        node api/scripts/backfill-suscripciones.mjs
 *   5. Aplicar de verdad (escribe en Firestore):
 *        node api/scripts/backfill-suscripciones.mjs --apply
 *      Opcional: --limit=100 para procesar sólo las primeras N.
 *
 * Idempotente: se puede correr varias veces; sólo escribe los campos calculados.
 */
import admin from 'firebase-admin';
import Stripe from 'stripe';
import { existsSync, readFileSync } from 'node:fs';
import { resumenImporteSuscripcion } from '../src/lib/suscripciones.js';

const APLICAR = process.argv.includes('--apply');
const LIMITE = Number((process.argv.find((a) => a.startsWith('--limit=')) || '').split('=')[1]) || Infinity;

function requerir(nombre) {
  const v = process.env[nombre];
  if (!v) {
    console.error(`✖ Falta la variable de entorno ${nombre}. Lee las instrucciones al inicio del script.`);
    process.exit(1);
  }
  return v;
}

// project_id del proyecto al que REALMENTE se va a escribir (del service account o del entorno).
function leerProjectIdActual() {
  const ruta = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (ruta && existsSync(ruta)) {
    try { return JSON.parse(readFileSync(ruta, 'utf8')).project_id || null; } catch { /* sigue */ }
  }
  return process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || null;
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
  if (/^sk_live_/.test(key)) return 'LIVE (clave secreta)';
  if (/^sk_test_/.test(key)) return 'TEST (clave secreta)';
  if (/^rk_live_/.test(key)) return 'LIVE (restricted key)';
  if (/^rk_test_/.test(key)) return 'TEST (restricted key)';
  return 'desconocido';
}

async function main() {
  requerir('GOOGLE_APPLICATION_CREDENTIALS');
  const stripeKey = requerir('STRIPE_SECRET_KEY');

  // Red de seguridad: identifica y confirma el proyecto ANTES de conectar o escribir.
  const projectActual = leerProjectIdActual();
  const projectEsperado = leerProjectIdEsperado();
  console.log(`Firebase project_id: ${projectActual ?? '(desconocido)'}`);
  console.log(`Stripe: ${modoStripe(stripeKey)}`);
  console.log(`Proyecto OdonTeck esperado: ${projectEsperado ?? '(no definido)'}`);
  if (!projectEsperado) {
    console.error('✖ Abortado: no se pudo determinar el proyecto esperado. Define EXPECTED_PROJECT_ID (p. ej. club-odonteck) o un .firebaserc con projects.default.');
    process.exit(1);
  }
  if (!projectActual) {
    console.error('✖ Abortado: no se pudo determinar el project_id de las credenciales. Revisa GOOGLE_APPLICATION_CREDENTIALS.');
    process.exit(1);
  }
  if (projectActual !== projectEsperado) {
    console.error(`✖ Abortado: el project_id actual (${projectActual}) NO es el de OdonTeck (${projectEsperado}). No se tocará ningún proyecto ajeno.`);
    process.exit(1);
  }

  const stripe = new Stripe(stripeKey);
  if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.applicationDefault() });
  const db = admin.firestore();

  console.log(`Backfill de v2_suscripciones · modo ${APLICAR ? 'APLICAR (escribe)' : 'DRY-RUN (no escribe)'}`);
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
      const cambia = Object.entries(campos).some(([k, v]) => JSON.stringify(data[k]) !== JSON.stringify(v));
      if (!cambia) continue;
      actualizadas++;
      console.log(`  ${doc.id}: ${APLICAR ? 'escribiendo' : 'cambiaría'} →`, campos);
      if (APLICAR) await doc.ref.set(campos, { merge: true });
    } catch (e) {
      errores++;
      console.error(`  ${doc.id}: error leyendo ${subId}: ${e.message}`);
    }
  }

  console.log(`\nResumen: ${procesadas} procesadas, ${actualizadas} ${APLICAR ? 'actualizadas' : 'cambiarían'}, ${sinSubId} sin subscriptionId, ${errores} con error.`);
  if (!APLICAR) console.log('Dry-run: no se escribió nada. Añade --apply para aplicar.');
  process.exit(errores ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
