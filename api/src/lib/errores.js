// Error con status HTTP y forma { error, mensaje } del contrato.
export class HttpError extends Error {
  constructor(status, error, mensaje, extra = undefined) {
    super(mensaje);
    this.status = status;
    this.error = error;
    this.extra = extra;
  }
}

export const noAutenticado = (mensaje = 'Inicia sesión para continuar.') => new HttpError(401, 'no_autenticado', mensaje);
export const prohibido = (mensaje = 'No tienes permiso para esta acción.') => new HttpError(403, 'prohibido', mensaje);
export const noEncontrado = (mensaje = 'No encontramos lo que buscas.') => new HttpError(404, 'no_encontrado', mensaje);
export const invalido = (mensaje, error = 'datos_invalidos') => new HttpError(400, error, mensaje);
export const conflicto = (mensaje, error = 'conflicto') => new HttpError(409, error, mensaje);
export const demasiadasSolicitudes = (mensaje = 'Has realizado demasiadas solicitudes. Intenta más tarde.') => new HttpError(429, 'limite_alcanzado', mensaje);
export const noConfigurado = (mensaje) => new HttpError(503, 'no_configurado', mensaje);
