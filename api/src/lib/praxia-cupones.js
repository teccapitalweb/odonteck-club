import { createHmac } from 'node:crypto';

const CODIGO_PRAXIA = /^PRX-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

function firma(secreto, timestamp, cuerpo) {
  return createHmac('sha256', secreto).update(`${timestamp}.${cuerpo}`).digest('hex');
}

/**
 * Solicita a Praxia un cupón ya utilizable. El secreto permanece en los dos
 * backends; el navegador nunca recibe autorización para emitir cupones.
 */
export async function emitirCuponPraxia(config, { requestId, rewardId }) {
  const endpoint = String(config.praxiaCouponApiUrl || '').trim();
  const secreto = String(config.praxiaCouponApiSecret || '').trim();
  if (!endpoint || secreto.length < 32) {
    return { ok: false, motivo: 'La integración con Praxia todavía no está configurada.' };
  }
  let url;
  try {
    url = new URL(endpoint);
  } catch {
    return { ok: false, motivo: 'La URL de integración con Praxia no es válida.' };
  }
  if (url.protocol !== 'https:') {
    return { ok: false, motivo: 'La integración con Praxia requiere HTTPS.' };
  }

  const cuerpo = JSON.stringify({ requestId, rewardId });
  const timestamp = String(Date.now());
  const controlador = new AbortController();
  const tiempo = setTimeout(() => controlador.abort(), 12_000);
  try {
    const respuesta = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-OdonTeck-Timestamp': timestamp,
        'X-OdonTeck-Signature': `sha256=${firma(secreto, timestamp, cuerpo)}`,
      },
      body: cuerpo,
      signal: controlador.signal,
    });
    const datos = await respuesta.json().catch(() => null);
    const codigo = datos?.coupon?.code;
    if (!respuesta.ok || typeof codigo !== 'string' || !CODIGO_PRAXIA.test(codigo)) {
      return { ok: false, motivo: 'Praxia no pudo emitir el cupón todavía.' };
    }
    return { ok: true, codigo, vence: typeof datos.coupon.expires_at === 'string' ? datos.coupon.expires_at : null };
  } catch (error) {
    const motivo = error?.name === 'AbortError'
      ? 'Praxia tardó demasiado en responder.'
      : 'No pudimos contactar a Praxia todavía.';
    return { ok: false, motivo };
  } finally {
    clearTimeout(tiempo);
  }
}

/** Reporte agregado de una campaña; nunca trae códigos ni datos de pacientes. */
export async function reporteCuponesPraxia(config, { campaignId }) {
  const endpoint = String(config.praxiaCouponApiUrl || '').trim();
  const secreto = String(config.praxiaCouponApiSecret || '').trim();
  if (!endpoint || secreto.length < 32) return { ok: false, motivo: 'La integración con Praxia todavía no está configurada.' };
  let url;
  try {
    url = new URL(endpoint);
    if (url.protocol !== 'https:' || !url.pathname.endsWith('/coupons')) throw new Error('endpoint');
    url.pathname = `${url.pathname.slice(0, -'/coupons'.length)}/coupon-report`;
  } catch {
    return { ok: false, motivo: 'La URL de reporte de Praxia no es válida.' };
  }

  const cuerpo = JSON.stringify({ campaignId });
  const timestamp = String(Date.now());
  const controlador = new AbortController();
  const tiempo = setTimeout(() => controlador.abort(), 12_000);
  try {
    const respuesta = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-OdonTeck-Timestamp': timestamp,
        'X-OdonTeck-Signature': `sha256=${firma(secreto, timestamp, cuerpo)}`,
      },
      body: cuerpo,
      signal: controlador.signal,
    });
    const datos = await respuesta.json().catch(() => null);
    if (!respuesta.ok || !Number.isInteger(datos?.issued) || !Number.isInteger(datos?.redeemed) || !Array.isArray(datos?.activity)) {
      return { ok: false, motivo: 'Praxia no pudo preparar el reporte todavía.' };
    }
    const activity = datos.activity
      .filter((fila) => typeof fila?.day === 'string' && Number.isInteger(fila?.issued) && Number.isInteger(fila?.redeemed))
      .map((fila) => ({ day: fila.day, issued: fila.issued, redeemed: fila.redeemed }));
    return { ok: true, issued: datos.issued, redeemed: datos.redeemed, activity };
  } catch (error) {
    return { ok: false, motivo: error?.name === 'AbortError' ? 'Praxia tardó demasiado en responder.' : 'No pudimos contactar a Praxia todavía.' };
  } finally {
    clearTimeout(tiempo);
  }
}
