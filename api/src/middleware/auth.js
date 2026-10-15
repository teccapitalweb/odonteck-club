// Autenticación con Firebase ID token y autorización de admin por custom claim.
import { createHash } from 'node:crypto';
import { HttpError, noAutenticado, prohibido } from '../lib/errores.js';

const VIGENCIA_CACHE_MS = 5 * 60 * 1000;
const MAX_CACHE = 5000;
// Siempre en vivo: /admin y las rutas que emiten URLs firmadas.
const RUTAS_EN_VIVO = [
  /^\/admin(?:\/|$)/i,
  /^\/materiales\/[^/]+\/descarga\/?$/i,
  /^\/clases\/[^/]+\/[^/]+\/ficha\/?$/i,
];
// Un estado por instancia de Auth: la app real comparte uno y cada app de prueba el suyo.
const estadosPorAuth = new WeakMap();
const verificadasEnVivo = new WeakSet();
let secuencia = 0;

function estadoDe(auth) {
  let estado = estadosPorAuth.get(auth);
  if (!estado) {
    estado = { cache: new Map(), enCurso: new Map() };
    estadosPorAuth.set(auth, estado);
  }
  return estado;
}

function guardarEnCache(cache, clave, entrada, ahora) {
  cache.delete(clave);
  cache.set(clave, entrada);
  if (cache.size <= MAX_CACHE) return;
  for (const [k, v] of cache) if (v.expira <= ahora) cache.delete(k);
  for (const k of cache.keys()) {
    if (cache.size <= MAX_CACHE) break;
    cache.delete(k);
  }
}

function errorDeSesion(e) {
  if (e?.code === 'auth/id-token-revoked' || e?.code === 'auth/user-disabled') {
    return new HttpError(401, 'sesion_revocada', 'Tu sesión fue cerrada. Vuelve a iniciar sesión.');
  }
  if (e?.code === 'auth/id-token-expired') {
    return new HttpError(401, 'sesion_vencida', 'Tu sesión venció. Vuelve a iniciar sesión.');
  }
  return new HttpError(401, 'token_invalido', 'No pudimos verificar tu sesión. Vuelve a iniciar sesión.');
}

/** Exige `Authorization: Bearer <ID token>`; deja `req.usuario = { uid, email, nombre, esAdmin }`. */
export function requireAuth(ctx) {
  const { cache, enCurso } = estadoDe(ctx.auth);

  async function verificarEnVivo(token, clave) {
    const inicio = secuencia;
    let decodificado;
    try {
      // true = también rechaza tokens revocados (cuenta deshabilitada o sesiones cerradas).
      decodificado = await ctx.auth.verifyIdToken(token, true);
    } catch (e) {
      enCurso.delete(clave);
      if (e?.code === 'auth/id-token-revoked' || e?.code === 'auth/user-disabled') {
        // Lápida: una verificación que empezó antes de esta revocación ya no puede volver a cachear el token.
        const ahora = ctx.now().getTime();
        guardarEnCache(cache, clave, { invalido: true, marca: ++secuencia, expira: ahora + VIGENCIA_CACHE_MS }, ahora);
      } else {
        cache.delete(clave);
      }
      throw e;
    }
    const usuario = {
      uid: decodificado.uid,
      email: decodificado.email ?? '',
      nombre: decodificado.name ?? '',
      esAdmin: decodificado.admin === true,
    };
    const ahora = ctx.now().getTime();
    const actual = cache.get(clave);
    const expira = Math.min(ahora + VIGENCIA_CACHE_MS, Number(decodificado.exp) * 1000);
    if (!(actual?.invalido && actual.marca > inicio) && expira > ahora) guardarEnCache(cache, clave, { usuario, expira }, ahora);
    return usuario;
  }

  async function verificarCompartida(token, clave) {
    const enProceso = enCurso.get(clave);
    if (enProceso) {
      const usuario = await enProceso;
      // Un admin no reutiliza la verificación de otra petición: hace la suya.
      if (usuario.esAdmin !== true) return { usuario, propia: false };
    }
    const promesa = verificarEnVivo(token, clave);
    enCurso.set(clave, promesa);
    const limpiar = () => { if (enCurso.get(clave) === promesa) enCurso.delete(clave); };
    promesa.then(limpiar, limpiar);
    return { usuario: await promesa, propia: true };
  }

  return async function autenticar(req, res, next) {
    res.set('Cache-Control', 'no-store');
    res.set('Pragma', 'no-cache');
    const match = /^Bearer\s+(\S+)\s*$/i.exec(String(req.headers.authorization ?? ''));
    if (!match) return next(noAutenticado('Inicia sesión para continuar.'));
    const clave = createHash('sha256').update(match[1]).digest('hex');
    const ruta = `${req.baseUrl}${req.path}`;
    // Sólo lecturas de miembro usan la caché; escrituras, /admin y URLs firmadas verifican revocación en vivo.
    const conCache = req.method === 'GET' && !RUTAS_EN_VIVO.some((patron) => patron.test(ruta));
    if (conCache) {
      const guardada = cache.get(clave);
      // Un admin nunca sale de la caché: prepararClase le salta la condición de 'publicado'.
      if (guardada && !guardada.invalido && guardada.expira > ctx.now().getTime() && guardada.usuario.esAdmin !== true) {
        req.usuario = { ...guardada.usuario };
        return next();
      }
    }
    try {
      const { usuario, propia } = conCache
        ? await verificarCompartida(match[1], clave)
        : { usuario: await verificarEnVivo(match[1], clave), propia: true };
      req.usuario = { ...usuario };
      if (propia) verificadasEnVivo.add(req);
      return next();
    } catch (e) {
      return next(errorDeSesion(e));
    }
  };
}

/** Requiere claim `admin: true` verificado en vivo en esta petición. Debe ir después de requireAuth. */
export function requireAdmin(req, res, next) {
  if (req.usuario?.esAdmin !== true || !verificadasEnVivo.has(req)) return next(prohibido('Esta sección es solo para administradores.'));
  return next();
}
