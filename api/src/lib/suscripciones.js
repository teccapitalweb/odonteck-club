// Normaliza el importe y los descuentos de una suscripción de Stripe a una base
// MENSUAL en centavos, para calcular el MRR real neto de promociones (promotion
// codes). Funciones puras: no tocan Firestore ni Stripe.

const MESES_POR_INTERVALO = { day: 1 / 30, week: 7 / 30, month: 1, year: 12 };

/** Meses que cubre un ciclo de facturación de un precio de Stripe. */
export function mesesPorCiclo(price) {
  const interval = price?.recurring?.interval;
  const count = Number(price?.recurring?.interval_count) || 1;
  const meses = (MESES_POR_INTERVALO[interval] ?? 1) * count;
  return meses > 0 ? meses : 1;
}

/**
 * Importe/descuento mensual de una suscripción, en centavos, a partir del objeto
 * `subscription` de Stripe (con su item y precio). Devuelve `null` si no hay precio
 * con importe (entonces el MRR usará el precio de config como estimación).
 *
 * Reglas de descuento para MRR recurrente:
 *  - `percent_off`: se aplica siempre sobre el bruto mensual.
 *  - `amount_off`: es por ciclo; se normaliza a mensual dividiendo entre los meses del ciclo.
 *  - `duration: 'once'`: NO afecta el MRR recurrente (sólo la primera factura) → se ignora.
 */
export function resumenImporteSuscripcion(sub) {
  const price = sub?.items?.data?.[0]?.price ?? null;
  const amt = Number(price?.unit_amount);
  if (!price || !Number.isFinite(amt)) return null;
  const meses = mesesPorCiclo(price);
  const bruto = Math.round(amt / meses);

  const entradas = sub?.discount ? [sub.discount] : (Array.isArray(sub?.discounts) ? sub.discounts : []);
  let descuento = 0;
  let promotionCode = null;
  for (const d of entradas) {
    if (!promotionCode && d?.promotion_code) {
      promotionCode = typeof d.promotion_code === 'string' ? d.promotion_code : d.promotion_code?.id ?? null;
    }
    const c = d?.coupon ?? (d && typeof d === 'object' && ('percent_off' in d || 'amount_off' in d) ? d : null);
    if (!c || c.duration === 'once') continue;
    if (Number.isFinite(c.percent_off)) descuento += Math.round(bruto * c.percent_off / 100);
    else if (Number.isFinite(c.amount_off)) descuento += Math.round(Number(c.amount_off) / meses);
  }
  descuento = Math.min(bruto, Math.max(0, descuento));

  return {
    moneda: price.currency ?? null,
    importeMensualBrutoCents: bruto,
    descuentoMensualCents: descuento,
    importeMensualNetoCents: bruto - descuento,
    promotionCode,
  };
}
