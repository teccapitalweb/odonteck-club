import { createHmac, timingSafeEqual } from 'node:crypto';
import { accessSync, constants } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MATERIALES_OFICIALES } from './materiales-oficiales.js';

const IDS_OFICIALES = new Set(MATERIALES_OFICIALES.map((material) => material.id));

const firma = (secreto, id, expira) => createHmac('sha256', secreto)
  .update(`material:${id}:${expira}`)
  .digest('base64url');

const iguales = (a, b) => {
  const izquierda = Buffer.from(String(a || ''));
  const derecha = Buffer.from(String(b || ''));
  return izquierda.length === derecha.length && timingSafeEqual(izquierda, derecha);
};

/**
 * Sirve únicamente los diez PDF propios incluidos en el despliegue de la API.
 * Las URLs son temporales y sólo se emiten después de validar membresía/canje.
 */
export function crearMaterialesEmpaquetados({ directorio, secreto, ahora = () => new Date() }) {
  const base = resolve(fileURLToPath(directorio));
  const disponibles = new Map();
  for (const id of IDS_OFICIALES) {
    const ruta = resolve(base, `${id}.pdf`);
    try {
      accessSync(ruta, constants.R_OK);
      disponibles.set(id, ruta);
    } catch {
      // Un despliegue incompleto no debe anunciar el material como disponible.
    }
  }

  return {
    ids: () => new Set(disponibles.keys()),
    tiene: (id) => disponibles.has(id),
    urlFirmada(id, origen, expira) {
      if (!disponibles.has(id)) return null;
      const exp = Math.floor(Number(expira));
      const token = firma(secreto, id, exp);
      return `${String(origen).replace(/\/+$/, '')}/materiales/${encodeURIComponent(id)}/archivo?exp=${exp}&token=${encodeURIComponent(token)}`;
    },
    validar(id, expira, token) {
      const exp = Math.floor(Number(expira));
      if (!disponibles.has(id) || !Number.isSafeInteger(exp) || exp <= ahora().getTime()) return false;
      return iguales(token, firma(secreto, id, exp));
    },
    enviar(id, res) {
      const ruta = disponibles.get(id);
      if (!ruta) return false;
      res.set({
        'Cache-Control': 'private, no-store, max-age=0',
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${id}.pdf"`,
        'X-Content-Type-Options': 'nosniff',
      });
      res.sendFile(ruta);
      return true;
    },
  };
}

