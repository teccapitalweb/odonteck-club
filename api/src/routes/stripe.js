// Stripe: checkout y portal (autenticados) y webhook (público, firmado).
// IMPORTANTE: el webhook escribe SOLO en v2_suscripciones/{uid}; nunca en miembros/{uid}.
// No se registra en Stripe hasta el cambio definitivo (el webhook viejo sigue activo).
import express from 'express';
import { COL, estadoMembresia, leerConfig, leerDoc, leerMiembroHeredado } from '../datos.js';
import { HttpError, conflicto, noConfigurado, noEncontrado } from '../lib/errores.js';
import { otorgarEventos, REGLAS_PUNTOS } from '../lib/recompensas.js';
import { cuerpo, unoDe } from '../lib/validacion.js';
import { requireAuth } from '../middleware/auth.js';
import { h } from '../middleware/errores.js';

const ESTADOS_ACTIVOS = ['active', 'trialing'];
const ESTADOS_POBRES = ['incomplete', 'incomplete_expired', 'canceled'];

const segundosAISO = (s) => (Number.isFinite(s) ? new Date(s * 1000).toISOString() : null);

async function preciosStripe(ctx) {
  const config = await leerConfig(ctx.db);
  return {
    mensual: ctx.config.stripePrices?.mensual || config.stripePriceMensual || '',
    anual: ctx.config.stripePrices?.anual || config.stripePriceAnual || '',
  };
}

async function customerIdDe(ctx, uid, miembro) {
  const sus = await leerDoc(ctx.db, COL.suscripciones, uid);
  return sus?.customerId || miembro?.stripeCustomerId || null;
}

function exigirStripe(ctx) {
  if (!ctx.stripe) throw noConfigurado('Los pagos no están configurados en el servidor.');
  return ctx.stripe;
}

export function rutasStripe(ctx) {
  const r = express.Router();
  const auth = requireAuth(ctx);

  r.post('/stripe/checkout', auth, h(async (req, res) => {
    const stripe = exigirStripe(ctx);
    if (!ctx.config.stripeWebhookSecret) {
      throw noConfigurado('El pago nuevo todavía no está habilitado. Usa el portal anterior de OdonTeck.');
    }
    const u = req.usuario;
    const plan = unoDe(cuerpo(req).plan, ['mensual', 'anual'], { campo: 'plan', requerido: true });
    const precios = await preciosStripe(ctx);
    if (!precios[plan]) throw noConfigurado(`El precio del plan ${plan} no está configurado.`);

    const estado = await estadoMembresia(ctx, u);
    const sus = await leerDoc(ctx.db, COL.suscripciones, u.uid);
    const susActiva = sus && ESTADOS_ACTIVOS.includes(sus.estado);
    if (estado.membresiaPagada || susActiva) {
      throw conflicto('Ya tienes una membresía activa. Puedes administrarla desde tu cuenta.', 'ya_es_vip');
    }

    const customer = sus?.customerId || estado.miembro?.stripeCustomerId || null;
    const appUrl = ctx.config.appUrl.replace(/\/$/, '');
    const metadata = { uid: u.uid, plan, origen: 'odonteck-club-v2' };
    const params = {
      mode: 'subscription',
      line_items: [{ price: precios[plan], quantity: 1 }],
      client_reference_id: u.uid,
      metadata,
      subscription_data: { metadata },
      allow_promotion_codes: true,
      success_url: `${appUrl}/#/suscripcion?pago=exito&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/#/suscripcion?pago=cancelado`,
      locale: 'es',
    };
    if (customer) params.customer = customer;
    else if (u.email) params.customer_email = u.email;

    const session = await stripe.checkout.sessions.create(params);
    res.json({ url: session.url });
  }));

  r.post('/stripe/portal', auth, h(async (req, res) => {
    const stripe = exigirStripe(ctx);
    const u = req.usuario;
    const miembro = await leerMiembroHeredado(ctx, u);
    const customer = await customerIdDe(ctx, u.uid, miembro);
    if (!customer) throw noEncontrado('No encontramos una suscripción de Stripe asociada a tu cuenta.');
    const session = await stripe.billingPortal.sessions.create({
      customer,
      return_url: `${ctx.config.appUrl.replace(/\/$/, '')}/#/suscripcion`,
    });
    res.json({ url: session.url });
  }));

  return r;
}

/** Handler del webhook. Se monta en app.js ANTES de express.json, con express.raw. */
export function webhookStripe(ctx) {
  return h(async (req, res) => {
    res.set('Cache-Control', 'no-store');
    const stripe = exigirStripe(ctx);
    const secreto = ctx.config.stripeWebhookSecret;
    if (!secreto) throw noConfigurado('El webhook de Stripe no está configurado.');
    const firma = req.headers['stripe-signature'];
    if (!firma || !Buffer.isBuffer(req.body)) {
      throw new HttpError(400, 'firma_invalida', 'Falta la firma de Stripe o el cuerpo no es el original.');
    }
    let evento;
    try {
      evento = stripe.webhooks.constructEvent(req.body, firma, secreto);
    } catch (e) {
      ctx.logger.warn?.('[stripe] firma inválida:', e.message);
      throw new HttpError(400, 'firma_invalida', 'La firma del webhook de Stripe no es válida.');
    }

    // Idempotencia: Stripe reintenta; un evento ya procesado se confirma sin repetir.
    const marcaRef = ctx.db.collection(COL.stripeEventos).doc(evento.id);
    if ((await marcaRef.get()).exists) return res.json({ recibido: true, duplicado: true });

    const resultado = await procesarEvento(ctx, evento);
    await marcaRef.set({ tipo: evento.type, resultado, procesado: ctx.now().toISOString() });
    res.json({ recibido: true, resultado });
  });
}

async function procesarEvento(ctx, evento) {
  const obj = evento.data?.object ?? {};
  switch (evento.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded': {
      if (obj.mode !== 'subscription') return 'ignorado_no_suscripcion';
      const uid = obj.client_reference_id || obj.metadata?.uid;
      if (!uid) return 'ignorado_sin_uid';
      let sub = null;
      if (obj.subscription) {
        sub = typeof obj.subscription === 'string' ? await ctx.stripe.subscriptions.retrieve(obj.subscription) : obj.subscription;
      }
      const datos = {
        uid,
        customerId: typeof obj.customer === 'string' ? obj.customer : obj.customer?.id ?? null,
        email: obj.customer_details?.email ?? obj.customer_email ?? null,
      };
      if (!sub) {
        await ctx.db.collection(COL.suscripciones).doc(uid).set({ ...datos, actualizado: ctx.now().toISOString() }, { merge: true });
        return 'checkout_sin_suscripcion';
      }
      const resultado = await guardarSuscripcion(ctx, uid, sub, evento, datos);
      if (ESTADOS_ACTIVOS.includes(sub.status) && (obj.payment_status !== 'unpaid' || evento.type === 'checkout.session.async_payment_succeeded')) {
        await otorgarEventos(ctx, COL, uid, [{
          clave: `membresia:${obj.id || sub.id}`,
          tipo: 'membresia',
          puntos: REGLAS_PUNTOS.membresia,
          contador: 'membresias',
          detalle: 'Membresía OdonTeck activada',
        }]);
      }
      return resultado;
    }
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const uid = await uidDeSuscripcion(ctx, obj);
      if (!uid) {
        ctx.logger.warn?.(`[stripe] ${evento.type} ${obj.id}: no se encontró el uid (¿suscripción del club viejo?)`);
        return 'ignorado_sin_uid';
      }
      return guardarSuscripcion(ctx, uid, obj, evento, {});
    }
    default:
      return 'ignorado_tipo';
  }
}

async function uidDeSuscripcion(ctx, sub) {
  if (sub.metadata?.uid) return sub.metadata.uid;
  const customer = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id;
  if (!customer) return null;
  const snap = await ctx.db.collection(COL.suscripciones).where('customerId', '==', customer).limit(1).get();
  return snap.empty ? null : snap.docs[0].id;
}

function planDePrecio(ctx, priceId, sub) {
  const { mensual, anual } = ctx.config.stripePrices ?? {};
  if (priceId && priceId === mensual) return 'mensual';
  if (priceId && priceId === anual) return 'anual';
  return sub.metadata?.plan ?? null;
}

async function guardarSuscripcion(ctx, uid, sub, evento, extra) {
  const ref = ctx.db.collection(COL.suscripciones).doc(uid);
  return ctx.db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const actual = snap.exists ? snap.data() : null;

    // Un evento de otra suscripción (vieja) en estado pobre no degrada la vigente.
    if (actual?.subscriptionId && actual.subscriptionId !== sub.id && ESTADOS_POBRES.includes(sub.status)) {
      return 'ignorado_suscripcion_anterior';
    }
    // Eventos fuera de orden de la misma suscripción: gana el más reciente.
    if (actual?.subscriptionId === sub.id && Number(actual.eventoCreado) > Number(evento.created)) {
      return 'ignorado_evento_viejo';
    }

    const item = sub.items?.data?.[0] ?? {};
    const priceId = item.price?.id ?? null;
    // Desde la API 2025-03-31 el periodo vive en el item; antes, en la suscripción.
    const periodoFin = item.current_period_end ?? sub.current_period_end;
    const datos = {
      uid,
      ...Object.fromEntries(Object.entries(extra).filter(([, v]) => v !== null && v !== undefined)),
      customerId: (typeof sub.customer === 'string' ? sub.customer : sub.customer?.id) ?? extra.customerId ?? actual?.customerId ?? null,
      subscriptionId: sub.id,
      estado: sub.status,
      plan: planDePrecio(ctx, priceId, sub),
      priceId,
      periodoFin: segundosAISO(periodoFin),
      cancelaAlFinal: sub.cancel_at_period_end === true,
      canceladaEn: segundosAISO(sub.canceled_at),
      eventoCreado: evento.created,
      ultimoEvento: evento.id,
      actualizado: ctx.now().toISOString(),
    };
    tx.set(ref, datos, { merge: true });
    return 'suscripcion_guardada';
  });
}
