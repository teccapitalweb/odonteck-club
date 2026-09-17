// Autenticación con Firebase ID token y autorización de admin por custom claim.
import { HttpError, noAutenticado, prohibido } from '../lib/errores.js';


/** Exige `Authorization: Bearer <ID token>`; deja `req.usuario = { uid, email, nombre, esAdmin }`. */
export function requireAuth(ctx) {
  return async function autenticar(req, res, next) {
    res.set('Cache-Control', 'no-store');
    res.set('Pragma', 'no-cache');
    const match = /^Bearer\s+(\S+)\s*$/i.exec(String(req.headers.authorization ?? ''));
    if (!match) return next(noAutenticado('Inicia sesión para continuar.'));
    try {
      // true = también rechaza tokens revocados (cuenta deshabilitada o sesiones cerradas).
      const token = await ctx.auth.verifyIdToken(match[1], true);
      req.usuario = {
        uid: token.uid,
        email: token.email ?? '',
        nombre: token.name ?? '',
        esAdmin: token.admin === true,
      };
      return next();
    } catch (e) {
      if (e?.code === 'auth/id-token-revoked' || e?.code === 'auth/user-disabled') {
        return next(new HttpError(401, 'sesion_revocada', 'Tu sesión fue cerrada. Vuelve a iniciar sesión.'));
      }
      if (e?.code === 'auth/id-token-expired') {
        return next(new HttpError(401, 'sesion_vencida', 'Tu sesión venció. Vuelve a iniciar sesión.'));
      }
      return next(new HttpError(401, 'token_invalido', 'No pudimos verificar tu sesión. Vuelve a iniciar sesión.'));
    }
  };
}

/** Requiere claim `admin: true`. Debe ir después de requireAuth. */
export function requireAdmin(req, res, next) {
  if (req.usuario?.esAdmin !== true) return next(prohibido('Esta sección es solo para administradores.'));
  return next();
}
