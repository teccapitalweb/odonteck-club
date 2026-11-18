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
 *   3. Dry-run (por defecto): muestra qué cambiaría, SIN escribir:
 *        node api/scripts/backfill-suscripciones.mjs
 *   4. Aplicar de verdad (escribe en Firestore):
 *        node api/scripts/backfill-suscripciones.mjs --apply
 *      Opcional: --limit=100 para procesar sólo las primeras N.
 *
 * Idempotente: se puede correr varias veces; sólo escribe los campos calculados.
 */
import admin from 'firebase-admin';
import Stripe from 'stripe';
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

async function main() {
  requerir('GOOGLE_APPLICATION_CREDENTIALS');
  const stripe = new Stripe(requerir('STRIPE_SECRET_KEY'));
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
