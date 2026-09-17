// Manejo uniforme de errores: siempre { error, mensaje } con el status correcto.
import { HttpError } from '../lib/errores.js';

/** Envuelve handlers async para que los rechazos lleguen al manejador de errores (Express 4). */
export const h = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export function noEncontradoRuta(req, res) {
  res.status(404).json({ error: 'ruta_no_encontrada', mensaje: `No existe la ruta ${req.method} ${req.path}.` });
}

export function manejarErrores(logger = console) {
  // eslint-disable-next-line no-unused-vars
  return function (err, req, res, next) {
    if (res.headersSent) return;
    if (err instanceof HttpError) {
      return res.status(err.status).json({ error: err.error, mensaje: err.message, ...(err.extra ?? {}) });
    }
    if (err?.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'json_invalido', mensaje: 'El cuerpo de la petición no es JSON válido.' });
    }
    if (err?.type === 'entity.too.large') {
      return res.status(413).json({ error: 'cuerpo_muy_grande', mensaje: 'La petición es demasiado grande.' });
    }
    logger.error?.(`[error] ${req.method} ${req.originalUrl}:`, err?.stack ?? err);
    return res.status(500).json({ error: 'error_interno', mensaje: 'Ocurrió un error inesperado. Intenta de nuevo en un momento.' });
  };
}
