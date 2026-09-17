// Parser WebVTT propio (sin dependencias).
// Soporta: BOM, CRLF, cabecera con texto, bloques NOTE / STYLE / REGION, identificadores de cue,
// ajustes de cue (align:, position:), texto en varias líneas, etiquetas (<v>, <c.clase>, <b>, <i>,
// timestamps internos <00:00:01.000>), entidades HTML y cues duplicados de subtítulos "rodantes".
import { vttTimestampASegundos } from './tiempo.mjs';

const ENTIDADES = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&nbsp;': ' ', '&lrm;': '', '&rlm;': '', '&quot;': '"', '&#39;': "'" };

/** Limpia el texto de un cue: quita etiquetas, decodifica entidades y colapsa espacios. */
export function limpiarTextoCue(texto) {
  return texto
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(?:amp|lt|gt|nbsp|lrm|rlm|quot|#39);/g, (e) => ENTIDADES[e])
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/\s+/g, ' ')
    .trim();
}

const LINEA_TIEMPO = /^\s*(\S+)\s+-->\s+(\S+)(?:\s+.*)?$/;

/**
 * Parsea un documento VTT.
 * @returns {{ segmentos: {inicio:number, fin:number, texto:string}[], texto: string }}
 *   `inicio`/`fin` en segundos (3 decimales). `texto` es el texto plano completo.
 */
export function parsearVtt(contenido) {
  if (typeof contenido !== 'string') throw new TypeError('El VTT debe ser texto');
  const limpio = contenido.replace(/^﻿/, '').replace(/\r\n?/g, '\n');
  const bloques = limpio.split(/\n[ \t]*\n+/);
  if (!/^WEBVTT(?:[ \t].*)?$/.test(bloques[0]?.split('\n')[0] ?? '')) {
    throw new Error('No es un archivo WebVTT (falta la cabecera WEBVTT)');
  }

  const segmentos = [];
  for (let i = 1; i < bloques.length; i++) {
    const lineas = bloques[i].split('\n').filter((l, idx, arr) => !(idx === arr.length - 1 && l.trim() === ''));
    if (!lineas.length || lineas.every((l) => l.trim() === '')) continue;
    const primera = lineas[0].trim();
    // Bloques que no son cues.
    if (/^(NOTE|STYLE|REGION)(\s|$)/.test(primera)) continue;

    // La línea de tiempo puede ser la 1ª o la 2ª (si hay identificador de cue).
    const idxTiempo = lineas.findIndex((l) => l.includes('-->'));
    if (idxTiempo < 0 || idxTiempo > 1) continue;
    const m = lineas[idxTiempo].match(LINEA_TIEMPO);
    if (!m) continue;
    const inicio = vttTimestampASegundos(m[1]);
    const fin = vttTimestampASegundos(m[2]);
    if (inicio === null || fin === null || fin < inicio) continue;

    const texto = limpiarTextoCue(lineas.slice(idxTiempo + 1).join('\n'));
    if (!texto) continue;

    const anterior = segmentos.at(-1);
    // Subtítulos rodantes: mismo texto repetido de forma contigua → se extiende el segmento.
    if (anterior && anterior.texto === texto && inicio - anterior.fin <= 1) {
      anterior.fin = Math.max(anterior.fin, redondear(fin));
      continue;
    }
    segmentos.push({ inicio: redondear(inicio), fin: redondear(fin), texto });
  }
  segmentos.sort((a, b) => a.inicio - b.inicio);
  return { segmentos, texto: textoPlano(segmentos) };
}

/** Une los segmentos en un único texto plano. */
export function textoPlano(segmentos) {
  return segmentos.map((s) => s.texto).join(' ').replace(/\s+/g, ' ').trim();
}

const redondear = (n) => Math.round(n * 1000) / 1000;
