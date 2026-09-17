// Rutas públicas: salud y verificación de certificados por folio.
import express from 'express';
import { COL, leerDoc } from '../datos.js';
import { folioValido } from '../lib/folio.js';
import { h } from '../middleware/errores.js';

const FOLIO_VIEJO = /^odonteck-\d{4}-[a-z0-9]{4,12}$/i;

export function rutasPublicas(ctx) {
  const r = express.Router();

  r.get('/health', (req, res) => {
    res.set('Cache-Control', 'no-store');
    res.json({ ok: true });
  });

  r.get('/verificar/:folio', h(async (req, res) => {
    // Respuesta corta en caché: el certificado no cambia una vez emitido.
    res.set('Cache-Control', 'public, max-age=300');
    const crudo = String(req.params.folio ?? '').trim();
    let folio = crudo.toUpperCase();
    let cert = null;
    if (folioValido(folio)) {
      cert = await leerDoc(ctx.db, COL.certificados, folio);
    } else if (FOLIO_VIEJO.test(crudo)) {
      // Certificados del club anterior (QR ya impresos): se migraron conservando su folio en `folioAnterior`.
      const variantes = [...new Set([crudo, `OdonTeck-${crudo.slice(9)}`])];
      for (const v of variantes) {
        const snap = await ctx.db.collection(COL.certificados).where('folioAnterior', '==', v).limit(1).get();
        if (!snap.empty) { cert = snap.docs[0].data(); folio = cert.folio; break; }
      }
    } else {
      res.set('Cache-Control', 'no-store');
      return res.status(400).json({ valido: false, error: 'folio_invalido', mensaje: 'El folio debe tener el formato ODT-AAAA-NNNNN.' });
    }
    if (!cert) {
      res.set('Cache-Control', 'no-store');
      return res.status(404).json({ valido: false, error: 'certificado_no_encontrado', mensaje: 'No existe un certificado con ese folio.' });
    }
    // Solo lo necesario para verificar: nada de uid ni correo.
    return res.json({ valido: true, folio, nombre: cert.nombre, cursoTitulo: cert.cursoTitulo, emitido: cert.emitido });
  }));

  return r;
}
