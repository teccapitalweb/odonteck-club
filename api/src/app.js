// Crea la app de Express a partir de dependencias inyectadas (reales en server.js, dobles en tests).
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import { manejarErrores, noEncontradoRuta } from './middleware/errores.js';
import { rutasAdmin } from './routes/admin.js';
import { rutasEncuestas } from './routes/encuestas.js';
import { rutasDirectorio } from './routes/directorio.js';
import { rutasLanding } from './routes/landing.js';
import { rutasMiembro } from './routes/miembro.js';
import { rutasPublicas } from './routes/publicas.js';
import { rutasRecompensas } from './routes/recompensas.js';
import { rutasStripe, webhookStripe } from './routes/stripe.js';

const CONFIG_POR_DEFECTO = {
  appUrl: 'https://www.odonteckconsulting.com',
  allowedOrigins: [],
  storageBucket: '',
  stripeWebhookSecret: '',
  stripePrices: { mensual: '', anual: '' },
  praxiaCouponApiUrl: '',
  praxiaCouponApiSecret: '',
};

export const normalizarOrigen = (o) => String(o ?? '').trim().replace(/\/+$/, '');

/**
 * @param {{
 *   db: import('firebase-admin/firestore').Firestore,
 *   auth: { verifyIdToken: Function, getUser: Function },
 *   storage?: { bucket: Function } | null,
 *   materiales?: { ids: Function, tiene: Function, urlFirmada: Function, validar: Function, enviar: Function } | null,
 *   stripe?: import('stripe').Stripe | null,
 *   bunny?: { libraryId: string, tokenAuthKey: string, ttlSeconds: number } | null,
 *   now?: () => Date,
 *   config?: Partial<typeof CONFIG_POR_DEFECTO>,
 *   logger?: Pick<Console, 'error' | 'warn' | 'info'>,
 * }} deps
 */
export function crearApp(deps) {
  if (!deps?.db) throw new Error('crearApp: falta la dependencia "db" (Firestore).');
  if (!deps?.auth) throw new Error('crearApp: falta la dependencia "auth" (Firebase Auth).');

  const ctx = {
    db: deps.db,
    auth: deps.auth,
    storage: deps.storage ?? null,
    materiales: deps.materiales ?? null,
    stripe: deps.stripe ?? null,
    bunny: deps.bunny ?? null,
    now: deps.now ?? (() => new Date()),
    logger: deps.logger ?? console,
    config: {
      ...CONFIG_POR_DEFECTO,
      ...(deps.config ?? {}),
      stripePrices: { ...CONFIG_POR_DEFECTO.stripePrices, ...(deps.config?.stripePrices ?? {}) },
    },
  };
  const permitidos = new Set((ctx.config.allowedOrigins ?? []).map(normalizarOrigen).filter(Boolean));

  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1); // Railway pone un proxy delante.

  app.use((req, res, next) => {
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('Referrer-Policy', 'no-referrer');
    next();
  });

  app.use(
    cors({
      // Sin Origin (curl, Stripe, servidores) no aplica CORS. Un origen fuera de la lista
      // simplemente no recibe cabeceras CORS y el navegador bloquea la respuesta.
      origin: (origin, cb) => cb(null, !origin || permitidos.has(normalizarOrigen(origin))),
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Authorization', 'Content-Type'],
      maxAge: 7200,
    }),
  );

  app.use(compression({ threshold: 1024 }));

  // El webhook necesita el cuerpo crudo para verificar la firma: va ANTES de express.json.
  app.post('/stripe/webhook', express.raw({ type: '*/*', limit: '1mb' }), webhookStripe(ctx));

  app.use(express.json({ limit: '300kb' }));

  app.use(rutasLanding(ctx));
  app.use(rutasPublicas(ctx));
  app.use(rutasEncuestas(ctx));
  app.use(rutasDirectorio(ctx));
  app.use(rutasRecompensas(ctx));
  app.use(rutasAdmin(ctx));
  app.use(rutasStripe(ctx));
  app.use(rutasMiembro(ctx));

  app.use(noEncontradoRuta);
  app.use(manejarErrores(ctx.logger));
  return app;
}
