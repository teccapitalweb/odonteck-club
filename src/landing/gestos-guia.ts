import type { PosturaGuia } from './guia-capas';

export interface RespuestaGuia {
  role?: 'assistant' | 'user';
  opciones?: unknown[];
  cursos?: string[];
  extra?: 'planes' | 'whatsapp';
  postura?: PosturaGuia;
}

export function posturaRespuesta(respuesta: RespuestaGuia): PosturaGuia {
  if (respuesta.postura === 'saludo' || respuesta.postura === 'orientar' || respuesta.postura === 'celebrar') return respuesta.postura;
  if (respuesta.extra === 'whatsapp') return 'saludo';
  if (respuesta.extra === 'planes' || (Array.isArray(respuesta.opciones) && respuesta.opciones.length > 0)
    || (Array.isArray(respuesta.cursos) && respuesta.cursos.length > 0)) return 'orientar';
  return 'saludo';
}

export function crearSeguimientoRespuestas(inicial?: RespuestaGuia) {
  let ultima = inicial?.role === 'user' ? undefined : inicial;
  return (respuesta?: RespuestaGuia, ocupado = false): PosturaGuia | null => {
    if (ocupado || !respuesta || respuesta.role === 'user' || respuesta === ultima) return null;
    ultima = respuesta;
    return posturaRespuesta(respuesta);
  };
}
