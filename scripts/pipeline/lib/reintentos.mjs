// Reintentos con espera exponencial y cola de concurrencia limitada.

export const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

/** Error HTTP con status y cuerpo, para decidir si se reintenta. */
export class ErrorHttp extends Error {
  constructor(status, mensaje, { cuerpo, retryAfterMs } = {}) {
    super(mensaje);
    this.name = 'ErrorHttp';
    this.status = status;
    this.cuerpo = cuerpo;
    this.retryAfterMs = retryAfterMs;
  }
}

/** 408, 425, 429 y 5xx se reintentan; errores de red (sin status) también. */
export function esReintentable(err) {
  if (!(err instanceof ErrorHttp)) {
    // fetch de Node lanza TypeError('fetch failed') en fallos de red; también códigos de socket.
    const codigo = err?.code ?? err?.cause?.code;
    if (['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED', 'EAI_AGAIN', 'UND_ERR_SOCKET', 'UND_ERR_CONNECT_TIMEOUT'].includes(codigo)) return true;
    return err instanceof TypeError && /fetch failed/i.test(err.message);
  }
  return err.status === 408 || err.status === 425 || err.status === 429 || err.status >= 500;
}

/**
 * Ejecuta `fn(intento)` con reintentos exponenciales (base·2^n + jitter), respetando Retry-After.
 * @param {object} op
 * @param {number} [op.intentos=5] intentos totales
 * @param {number} [op.baseMs=1000]
 * @param {number} [op.maxMs=60000]
 * @param {(ms:number)=>Promise<void>} [op.esperar] inyectable en tests
 * @param {(info:object)=>void} [op.alReintentar]
 */
export async function conReintentos(fn, { intentos = 5, baseMs = 1000, maxMs = 60000, esperar = dormir, alReintentar, reintentable = esReintentable, azar = Math.random } = {}) {
  let ultimo;
  for (let i = 0; i < intentos; i++) {
    try {
      return await fn(i);
    } catch (err) {
      ultimo = err;
      if (i === intentos - 1 || !reintentable(err)) throw err;
      const exponencial = Math.min(maxMs, baseMs * 2 ** i);
      const espera = Math.min(maxMs, Math.max(err?.retryAfterMs ?? 0, exponencial + Math.floor(azar() * baseMs * 0.25)));
      alReintentar?.({ intento: i + 1, espera, error: err });
      await esperar(espera);
    }
  }
  throw ultimo;
}

/** Interpreta la cabecera Retry-After (segundos o fecha HTTP) → milisegundos. */
export function parsearRetryAfter(valor, ahora = Date.now()) {
  if (!valor) return undefined;
  const seg = Number(valor);
  if (Number.isFinite(seg)) return Math.max(0, seg * 1000);
  const fecha = Date.parse(valor);
  return Number.isFinite(fecha) ? Math.max(0, fecha - ahora) : undefined;
}

/**
 * Procesa `elementos` con `trabajo(elemento, indice)` usando como máximo `concurrencia` tareas a la vez
 * y una pausa opcional entre arranques. Nunca lanza: devuelve `{ ok, error, valor, elemento }` por elemento.
 */
export async function procesarEnCola(elementos, trabajo, { concurrencia = 2, pausaMs = 0, esperar = dormir } = {}) {
  const resultados = new Array(elementos.length);
  let siguiente = 0;
  async function trabajador() {
    while (siguiente < elementos.length) {
      const i = siguiente++;
      try {
        resultados[i] = { ok: true, elemento: elementos[i], valor: await trabajo(elementos[i], i) };
      } catch (error) {
        resultados[i] = { ok: false, elemento: elementos[i], error };
      }
      if (pausaMs && siguiente < elementos.length) await esperar(pausaMs);
    }
  }
  await Promise.all(Array.from({ length: Math.max(1, Math.min(concurrencia, elementos.length)) }, trabajador));
  return resultados;
}
