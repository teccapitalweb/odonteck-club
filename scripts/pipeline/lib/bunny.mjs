// Cliente mínimo de la API de Bunny Stream con reintentos, más utilidades de captions del CDN.
//
// Endpoints (confirmados contra https://bunny.net/docs/reference el 2026-09-17):
//   GET  https://video.bunnycdn.com/library/{libraryId}/videos?page=&itemsPerPage=   header AccessKey
//        → { totalItems, currentPage, itemsPerPage, items: Video[] }
//        Video: guid, title, length (segundos), status (4 = Finished), availableResolutions
//        ("360p,720p" como TEXTO separado por comas), captions: [{ srclang, label, version }], collectionId
//   POST https://video.bunnycdn.com/library/{libraryId}/videos/{videoId}/transcribe?force=
//        body TranscribeSettings { targetLanguages, sourceLanguage, generateTitle, generateDescription,
//        generateChapters, generateMoments } → StatusModel { success, message, statusCode }
// Ruta de captions en el CDN (docs "Storage structure"):
//   https://{pull_zone}.b-cdn.net/{videoId}/captions/{codigo_idioma}.vtt
import { createHmac } from 'node:crypto';
import { ErrorHttp, conReintentos, parsearRetryAfter } from './reintentos.mjs';

export const API_BUNNY = 'https://video.bunnycdn.com';
export const CDN_HOSTNAME_POR_DEFECTO = 'vz-f5a76892-30a.b-cdn.net';
export const STATUS_BUNNY = { 0: 'Created', 1: 'Uploaded', 2: 'Processing', 3: 'Transcoding', 4: 'Finished', 5: 'Error', 6: 'UploadFailed', 7: 'JitSegmenting', 8: 'JitPlaylistsCreated' };

/**
 * @param {object} op
 * @param {string} op.apiKey  llave de la biblioteca (AccessKey). Nunca se imprime.
 * @param {string|number} op.libraryId
 * @param {typeof fetch} [op.fetchImpl]  inyectable en tests
 * @param {object} [op.reintentos]  opciones de conReintentos (intentos, baseMs, esperar...)
 * @param {(msg:string)=>void} [op.log]
 */
export function crearClienteBunny({ apiKey, libraryId, fetchImpl = globalThis.fetch, reintentos = {}, log = () => {} }) {
  if (!apiKey) throw new Error('Falta BUNNY_API_KEY');
  if (!libraryId) throw new Error('Falta BUNNY_LIBRARY_ID');

  async function peticion(metodo, ruta, { query, body } = {}) {
    const url = new URL(`${API_BUNNY}${ruta}`);
    for (const [k, v] of Object.entries(query ?? {})) if (v !== undefined) url.searchParams.set(k, String(v));
    return conReintentos(async () => {
      const res = await fetchImpl(url, {
        method: metodo,
        headers: { AccessKey: apiKey, accept: 'application/json', ...(body ? { 'content-type': 'application/json' } : {}) },
        body: body ? JSON.stringify(body) : undefined,
      });
      const texto = await res.text();
      if (!res.ok) {
        throw new ErrorHttp(res.status, `Bunny ${metodo} ${url.pathname} → HTTP ${res.status}: ${texto.slice(0, 300)}`, {
          cuerpo: texto,
          retryAfterMs: parsearRetryAfter(res.headers?.get?.('retry-after')),
        });
      }
      return texto ? JSON.parse(texto) : null;
    }, { ...reintentos, alReintentar: ({ intento, espera, error }) => log(`  reintento ${intento} en ${espera} ms (${error.status ?? error.message})`) });
  }

  return {
    libraryId: String(libraryId),

    /** Lista TODOS los videos de la biblioteca recorriendo las páginas. */
    async listarVideos({ itemsPorPagina = 100 } = {}) {
      const videos = [];
      for (let pagina = 1; ; pagina++) {
        const r = await peticion('GET', `/library/${libraryId}/videos`, { query: { page: pagina, itemsPerPage: itemsPorPagina, orderBy: 'date' } });
        const items = r?.items ?? [];
        videos.push(...items);
        log(`  página ${pagina}: ${items.length} videos (total ${r?.totalItems ?? '?'})`);
        if (!items.length || videos.length >= (r?.totalItems ?? 0) || items.length < (r?.itemsPerPage ?? itemsPorPagina)) break;
      }
      return videos;
    },

    /**
     * Solicita la transcripción automática de un video.
     * Forma confirmada en la referencia de Bunny (video_transcribevideo) el 2026-09-17.
     * VERIFICAR con `--solo <videoId>` antes de lanzar los 77: la documentación no aclara si
     * `targetLanguages` debe incluir el idioma de origen o solo las traducciones, ni el costo por minuto.
     */
    solicitarTranscripcion(videoId, { idioma = 'es', forzar = false } = {}) {
      return peticion('POST', `/library/${libraryId}/videos/${encodeURIComponent(videoId)}/transcribe`, {
        query: { force: forzar ? 'true' : undefined },
        body: cuerpoTranscripcion(idioma),
      });
    },
  };
}

/** Cuerpo de la petición de transcripción (aislado para revisarlo contra la documentación). */
export function cuerpoTranscripcion(idioma = 'es') {
  return {
    targetLanguages: [idioma],
    sourceLanguage: idioma,
    generateTitle: false,
    generateDescription: false,
    generateChapters: false,
    generateMoments: false,
  };
}

/** `availableResolutions` llega como "360p,720p"; lo convertimos a arreglo. */
export function parsearResoluciones(valor) {
  if (Array.isArray(valor)) return valor;
  return String(valor ?? '').split(',').map((s) => s.trim()).filter(Boolean);
}

/** Busca un caption en español ('es', 'es-MX', 'spa'...). Devuelve el objeto caption o null. */
export function captionEspanol(captions) {
  return (captions ?? []).find((c) => /^(es|spa)([-_].*)?$/i.test(String(c?.srclang ?? ''))) ?? null;
}

/** URL pública (sin firmar) del VTT de un video en el CDN de la biblioteca. */
export function urlCaptions({ cdnHostname = CDN_HOSTNAME_POR_DEFECTO, videoId, idioma = 'es' }) {
  return `https://${cdnHostname}/${encodeURIComponent(videoId)}/captions/${encodeURIComponent(idioma)}.vtt`;
}

/**
 * Firma una URL del CDN con Token Authentication "avanzada" de Bunny (HMAC-SHA256, prefijo HS256-).
 * Solo hace falta si la Pull Zone de la biblioteca tiene activado Token Authentication; en ese caso el
 * VTT responde 403 sin firma. La llave es la "URL Token Authentication Key" de la Pull Zone
 * (BUNNY_CDN_TOKEN_KEY), que NO es la misma que la del embed (BUNNY_TOKEN_AUTH_KEY del contrato).
 *
 * VERIFICAR contra https://bunny.net/docs/cdn/security/token-authentication/advanced antes de usarla:
 * esta implementación sigue la descripción de la documentación
 *   mensaje = rutaFirmada + expires + ipUsuario + parametrosOrdenados
 *   token   = 'HS256-' + base64url(HMAC_SHA256(llave, mensaje))
 * pero no se pudo probar contra una zona real (no hay credenciales).
 */
export function firmarUrlCdn(url, { llave, ttlSegundos = 3600, ahora = Date.now(), rutaPermitida, ipUsuario = '' }) {
  if (!llave) throw new Error('Falta BUNNY_CDN_TOKEN_KEY para firmar la URL');
  const u = new URL(url);
  const expires = Math.floor(ahora / 1000) + ttlSegundos;
  const extra = new URLSearchParams();
  if (rutaPermitida) extra.set('token_path', rutaPermitida);
  const firmables = [...extra.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}=${v}`).join('&');
  const rutaFirmada = rutaPermitida ?? decodeURIComponent(u.pathname);
  const mensaje = `${rutaFirmada}${expires}${ipUsuario}${firmables}`;
  const hash = createHmac('sha256', llave).update(mensaje).digest('base64').replace(/\n/g, '').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const token = `HS256-${ipUsuario ? '1-' : ''}${hash}`;
  u.searchParams.set('token', token);
  u.searchParams.set('expires', String(expires));
  if (rutaPermitida) u.searchParams.set('token_path', rutaPermitida);
  return u.toString();
}
