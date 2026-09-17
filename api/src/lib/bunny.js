// Firma de Bunny Stream (Token Authentication del embed).
import { createHash } from 'node:crypto';

const ID_BIBLIOTECA = /^\d+$/;
const ID_VIDEO = /^[A-Za-z0-9-]+$/;

/**
 * expires = floor(now/1000) + TTL
 * token   = sha256_hex(BUNNY_TOKEN_AUTH_KEY + videoId + expires)
 * url     = https://iframe.mediadelivery.net/embed/{libraryId}/{videoId}?token={token}&expires={expires}
 */
export function firmarEmbedBunny({ libraryId, tokenAuthKey, videoId, ttlSeconds = 300, ahoraMs = Date.now() }) {
  if (!ID_BIBLIOTECA.test(String(libraryId ?? ''))) throw new Error('El ID de biblioteca de Bunny no es válido');
  if (!ID_VIDEO.test(String(videoId ?? ''))) throw new Error('El ID de video de Bunny no es válido');
  if (!tokenAuthKey) throw new Error('Falta la llave de Token Authentication de Bunny');
  const ttl = Math.max(30, Math.floor(Number(ttlSeconds) || 300));
  const expires = Math.floor(ahoraMs / 1000) + ttl;
  const token = createHash('sha256').update(`${tokenAuthKey}${videoId}${expires}`).digest('hex');
  const embedUrl = `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?token=${token}&expires=${expires}`;
  return { embedUrl, expires };
}
