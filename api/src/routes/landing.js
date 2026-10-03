// Catálogo público mínimo para la landing y su guía. Lista explícita de campos:
// nunca videos, miembros, reservas, IDs de Stripe ni datos de pacientes.
import express from 'express';
import { COL, leerDoc } from '../datos.js';
import { h } from '../middleware/errores.js';

const importe = (valor) => typeof valor === 'number' && Number.isFinite(valor) && valor >= 0 ? valor : null;
const texto = (valor, max = 1200) => typeof valor === 'string' ? valor.trim().slice(0, max) : '';
const imagen = (valor) => typeof valor === 'string' && /^\/(?!\/)/.test(valor) ? valor : '/cursos/curso-01.webp';

export function rutasLanding(ctx) {
  const r = express.Router();
  let preciosStripe = null;
  let preciosPendientes = null;

  async function planesConfirmados(config) {
    const guardados = {
      mensual: importe(config?.precios?.mensual),
      anual: importe(config?.precios?.anual),
    };
    if (!ctx.stripe?.prices?.retrieve) return guardados;
    if (!preciosStripe || Date.now() - preciosStripe.ts > 60_000) {
      preciosPendientes ??= Promise.all(['mensual', 'anual'].map(async (plan) => {
        const id = ctx.config.stripePrices?.[plan];
        if (!id) return [plan, null];
        try {
          const precio = await ctx.stripe.prices.retrieve(id);
          const intervalo = plan === 'mensual' ? 'month' : 'year';
          const valido = precio.active === true && precio.currency === 'mxn' && precio.type === 'recurring'
            && precio.recurring?.interval === intervalo && precio.recurring?.interval_count === 1
            && importe(precio.unit_amount) !== null;
          return [plan, valido ? precio.unit_amount / 100 : null];
        } catch {
          return [plan, null];
        }
      })).then((entradas) => {
        preciosStripe = { ts: Date.now(), planes: Object.fromEntries(entradas) };
      }).finally(() => { preciosPendientes = null; });
      await preciosPendientes;
    }
    return {
      mensual: preciosStripe.planes.mensual ?? guardados.mensual,
      anual: preciosStripe.planes.anual ?? guardados.anual,
    };
  }

  r.get('/landing/catalogo', h(async (_req, res) => {
    res.set('Cache-Control', 'no-store');
    const [cursosSnap, config] = await Promise.all([
      ctx.db.collection(COL.cursos).get(),
      leerDoc(ctx.db, COL.config, 'general'),
    ]);
    const cursos = cursosSnap.docs
      .map((doc) => ({ ...doc.data(), id: doc.id }))
      .filter((curso) => curso.publicado === true && typeof curso.titulo === 'string')
      .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
      .map((curso) => ({
        id: texto(curso.id, 180),
        titulo: texto(curso.titulo),
        area: texto(curso.area, 120),
        imagen: imagen(curso.portada),
        nivel: texto(curso.nivel, 80),
        instructor: texto(curso.instructor, 160),
        descripcion: texto(curso.descripcion),
        clases: Array.isArray(curso.clases) ? curso.clases.length : 0,
        accesoGratis: Array.isArray(curso.clases) && curso.clases.some((clase) => clase?.gratis === true),
      }));
    const planes = await planesConfirmados(config);
    res.json({ fuente: 'api', verificadoEn: ctx.now().toISOString(), cursos, planes });
  }));

  return r;
}
