// Stripe: checkout y portal (autenticados) y webhook (público, firmado).
// IMPORTANTE: el webhook escribe SOLO en v2_suscripciones/{uid}; nunca en miembros/{uid}.
// El endpoint v2 sólo procesa eventos de su propio checkout; Stripe es compartido.
import express from 'express';
import { COL, estadoMembresia, leerConfig, leerDoc, leerMiembroHeredado } from '../datos.js';
import { HttpError, conflicto, noConfigurado, noEncontrado } from '../lib/errores.js';
import { otorgarEventos, revertirMembresiaTx, REGLAS_PUNTOS } from '../lib/recompensas.js';
import { registrarEventoSistema } from '../lib/auditoria.js';
import { resumenImporteSuscripcion } from '../lib/suscripciones.js';
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

    // Se reutiliza el destino Stripe existente. Conserva el receptor heredado
    // para renovaciones antiguas: mismos bytes y firma, sólo tras validarla aquí.
    // Los eventos de cobro/disputa no traen metadata.origen, así que se resuelven por
    // el cliente: si el cliente tiene suscripción v2, son nuestros y no se reenvían.
    if (ctx.config.stripeLegacyForward && !(await eventoParaV2(ctx, evento))) {
      try {
        const respuesta = await fetch('https://odonteck-production.up.railway.app/stripe/webhook', {
          method: 'POST', headers: { 'content-type': 'application/json', 'stripe-signature': firma },
          body: req.body, signal: AbortSignal.timeout(8000), redirect: 'error',
        });
        if (!respuesta.ok) throw new Error('Receptor heredado no confirmó');
        return res.json({ recibido: true, resultado: 'reenviado_heredado' });
      } catch {
        throw new HttpError(503, 'heredado_no_disponible', 'La confirmación heredada se reintentará.');
      }
    }

    // Idempotencia atómica: Stripe reintenta y puede entregar el mismo evento dos
    // veces a la vez. En lugar de leer la marca y escribirla después (dos entregas
    // simultáneas podrían pasar ambas), se RESERVA el id con create(): sólo una gana;
    // la otra recibe ALREADY_EXISTS y se confirma como duplicada. Si el procesamiento
    // falla, se libera la marca para que el reintento de Stripe lo vuelva a procesar.
    const marcaRef = ctx.db.collection(COL.stripeEventos).doc(evento.id);
    try {
      await marcaRef.create({ tipo: evento.type, estado: 'procesando', recibido: ctx.now().toISOString() });
    } catch (e) {
      if (e?.code === 6 || /ALREADY_EXISTS/.test(e?.message ?? '')) {
        return res.json({ recibido: true, duplicado: true });
      }
      throw e;
    }
    let resultado;
    try {
      resultado = await procesarEvento(ctx, evento);
    } catch (e) {
      await marcaRef.delete().catch(() => {});
      throw e;
    }
    await marcaRef.set({ tipo: evento.type, estado: 'listo', resultado, procesado: ctx.now().toISOString() });
    res.json({ recibido: true, resultado });
  });
}

const EVENTOS_CARGO = ['charge.refunded', 'charge.dispute.created', 'charge.dispute.closed'];

const idDe = (v) => (typeof v === 'string' ? v : v?.id ?? null);

/** Cliente de Stripe asociado a un evento de cobro o disputa (la disputa no lo trae: se lee del cobro). */
async function customerDeEventoCargo(ctx, evento) {
  const obj = evento.data?.object ?? {};
  if (evento.type === 'charge.refunded') return idDe(obj.customer);
  // Disputa: resolver el cliente a partir del cobro.
  const chargeId = idDe(obj.charge);
  if (idDe(obj.customer)) return idDe(obj.customer);
  if (!chargeId || !ctx.stripe?.charges?.retrieve) return null;
  try {
    const cobro = await ctx.stripe.charges.retrieve(chargeId);
    return idDe(cobro?.customer);
  } catch {
    return null;
  }
}

/** uid con suscripción v2 para un customerId de Stripe, o null. */
async function uidDeCustomer(ctx, customer) {
  if (!customer) return null;
  const snap = await ctx.db.collection(COL.suscripciones).where('customerId', '==', customer).limit(1).get();
  return snap.empty ? null : snap.docs[0].id;
}

/** true si el evento le corresponde a este servidor v2 (no al receptor heredado). */
async function eventoParaV2(ctx, evento) {
  if (evento.data?.object?.metadata?.origen === 'odonteck-club-v2') return true;
  if (EVENTOS_CARGO.includes(evento.type)) {
    return (await uidDeCustomer(ctx, await customerDeEventoCargo(ctx, evento))) !== null;
  }
  return false;
}

async function procesarEvento(ctx, evento) {
  const obj = evento.data?.object ?? {};
  // Cobros/disputas: se resuelven por el cliente (no traen metadata.origen).
  if (EVENTOS_CARGO.includes(evento.type)) {
    const uid = await uidDeCustomer(ctx, await customerDeEventoCargo(ctx, evento));
    if (!uid) return 'ignorado_sin_uid';
    if (evento.type === 'charge.refunded') return manejarReembolso(ctx, evento, obj, uid);
    if (evento.type === 'charge.dispute.created') return manejarDisputaAbierta(ctx, evento, obj, uid);
    return manejarDisputaCerrada(ctx, evento, obj, uid);
  }
  if (obj.metadata?.origen !== 'odonteck-club-v2') return 'ignorado_otro_origen';
  switch (evento.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded': {
      if (obj.mode !== 'subscription') return 'ignorado_no_suscripcion';
      if (!['paid', 'no_payment_required'].includes(obj.payment_status)) return 'pendiente_pago';
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
    // Importe/descuento mensual real (para MRR neto de promociones) y código de promo.
    const importe = resumenImporteSuscripcion(sub);
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
      // Alta VIP = creación de la suscripción en Stripe (constante). Para cohortes/altas v2.
      altaVip: segundosAISO(sub.created) ?? actual?.altaVip ?? null,
      ...(importe
        ? {
            moneda: importe.moneda,
            importeMensualBrutoCents: importe.importeMensualBrutoCents,
            descuentoMensualCents: importe.descuentoMensualCents,
            importeMensualNetoCents: importe.importeMensualNetoCents,
            promotionCode: importe.promotionCode,
          }
        : {}),
      eventoCreado: evento.created,
      ultimoEvento: evento.id,
      actualizado: ctx.now().toISOString(),
    };
    tx.set(ref, datos, { merge: true });
    return 'suscripcion_guardada';
  });
}

// charge.refunded: reembolso total bloquea el acceso y revierte los 300 OdonCoins
// (lo que quede, sin negativo); el parcial sólo se registra en la bitácora.
async function manejarReembolso(ctx, evento, charge, uid) {
  const total = Number(charge.amount);
  const reembolsado = Number(charge.amount_refunded);
  const esTotal = charge.refunded === true || (Number.isFinite(total) && total > 0 && reembolsado >= total);
  const chargeId = idDe(charge) ?? evento.id;
  const subRef = ctx.db.collection(COL.suscripciones).doc(uid);
  if (!esTotal) {
    await ctx.db.runTransaction((tx) => {
      registrarEventoSistema(ctx, tx, {
        ref: subRef, objetivoUid: uid, accion: 'reembolso_parcial',
        motivo: `Reembolso parcial de membresía (${reembolsado} de ${total}). No se tocó el acceso ni los OdonCoins.`,
        extra: { reembolsado, total },
      });
    });
    return 'reembolso_parcial_registrado';
  }
  return ctx.db.runTransaction(async (tx) => {
    const subSnap = await tx.get(subRef);
    const antes = subSnap.exists ? subSnap.data() : null;
    const reversion = await revertirMembresiaTx({ tx, db: ctx.db, colecciones: COL, uid, chargeId, ahora: ctx.now(), detalle: 'Reembolso total de membresía' });
    const bloqueo = { accesoBloqueado: true, bloqueo: { motivo: 'reembolso_total', chargeId, fecha: ctx.now().toISOString() } };
    tx.set(subRef, bloqueo, { merge: true });
    registrarEventoSistema(ctx, tx, {
      ref: subRef, objetivoUid: uid, accion: 'reembolso_total',
      motivo: `Reembolso total: acceso VIP bloqueado y ${reversion.revertido} OdonCoins revertidos${reversion.faltante ? `; ${reversion.faltante} ya gastados sin revertir` : ''}.`,
      antes, despues: { ...(antes ?? {}), ...bloqueo }, extra: { revertido: reversion.revertido, faltante: reversion.faltante },
    });
    return 'reembolso_total_aplicado';
  });
}

// charge.dispute.created: NO corta el acceso; marca "en disputa" y alerta al admin.
async function manejarDisputaAbierta(ctx, evento, dispute, uid) {
  const chargeId = idDe(dispute.charge);
  const subRef = ctx.db.collection(COL.suscripciones).doc(uid);
  return ctx.db.runTransaction(async (tx) => {
    const subSnap = await tx.get(subRef);
    const antes = subSnap.exists ? subSnap.data() : null;
    const marca = { enDisputa: true, disputa: { id: idDe(dispute), chargeId, estado: 'abierta', fecha: ctx.now().toISOString() } };
    tx.set(subRef, marca, { merge: true });
    registrarEventoSistema(ctx, tx, {
      ref: subRef, objetivoUid: uid, accion: 'disputa_abierta',
      motivo: 'Disputa de cobro abierta. El acceso se mantiene; requiere revisión del admin.',
      antes, despues: { ...(antes ?? {}), ...marca },
    });
    return 'disputa_registrada';
  });
}

// charge.dispute.closed: perdida = igual que reembolso total; ganada = sólo quita la marca.
async function manejarDisputaCerrada(ctx, evento, dispute, uid) {
  const chargeId = idDe(dispute.charge);
  const subRef = ctx.db.collection(COL.suscripciones).doc(uid);
  if (dispute.status === 'lost') {
    return ctx.db.runTransaction(async (tx) => {
      const subSnap = await tx.get(subRef);
      const antes = subSnap.exists ? subSnap.data() : null;
      const reversion = await revertirMembresiaTx({ tx, db: ctx.db, colecciones: COL, uid, chargeId, ahora: ctx.now(), detalle: 'Disputa perdida de membresía' });
      const cambio = { enDisputa: false, accesoBloqueado: true, bloqueo: { motivo: 'disputa_perdida', chargeId, fecha: ctx.now().toISOString() }, disputa: { id: idDe(dispute), chargeId, estado: 'perdida', cerrada: ctx.now().toISOString() } };
      tx.set(subRef, cambio, { merge: true });
      registrarEventoSistema(ctx, tx, {
        ref: subRef, objetivoUid: uid, accion: 'disputa_perdida',
        motivo: `Disputa perdida: acceso VIP bloqueado y ${reversion.revertido} OdonCoins revertidos${reversion.faltante ? `; ${reversion.faltante} ya gastados sin revertir` : ''}.`,
        antes, despues: { ...(antes ?? {}), ...cambio }, extra: { revertido: reversion.revertido, faltante: reversion.faltante },
      });
      return 'disputa_perdida_aplicada';
    });
  }
  return ctx.db.runTransaction(async (tx) => {
    const subSnap = await tx.get(subRef);
    const antes = subSnap.exists ? subSnap.data() : null;
    const cambio = { enDisputa: false, disputa: { id: idDe(dispute), chargeId, estado: 'ganada', cerrada: ctx.now().toISOString() } };
    tx.set(subRef, cambio, { merge: true });
    registrarEventoSistema(ctx, tx, {
      ref: subRef, objetivoUid: uid, accion: 'disputa_ganada',
      motivo: 'Disputa ganada: se retira la marca de disputa. El acceso no cambia.',
      antes, despues: { ...(antes ?? {}), ...cambio },
    });
    return 'disputa_ganada_registrada';
  });
}
