import { api } from './auth';
import { Datos } from './datos';

export type ModoReto = 'practica' | 'relampago';

export interface DominioReto {
  area: string;
  aciertos: number;
  total: number;
  precision: number;
  estado: 'Por explorar' | 'Por reforzar' | 'En progreso' | 'Sólido' | string;
  ultima: string | null;
}

export interface ResumenRetos {
  estado: {
    xp: number;
    quiz: { mejor: number; mejorCombo: number; jugados: number; aciertos: number; total: number; precision: number };
    racha: number;
    diasActivos: number;
    dominio: DominioReto[];
    actualizado: string | null;
  };
  disponibilidad: { preguntas: number; areas: { area: string; total: number }[] };
  recomendacion: { area: string; preguntas: number; minutos: number; motivo: string } | null;
}

export interface PreguntaSesionReto {
  ref: string;
  cursoId: string;
  curso: string;
  clase: string;
  n: number;
  indice: number;
  area: string;
  q: string;
  opciones: string[];
}

interface SesionReto {
  modo: ModoReto;
  area: string;
  total: number;
  preguntas: PreguntaSesionReto[];
}

export interface RespuestaReto {
  ref: string;
  acertada: boolean;
  correcta: number;
  explicacion: string;
  xpGanado: number;
  estado: ResumenRetos['estado'];
  recompensas?: { puntosGanados?: number; logrosNuevos?: { titulo?: string }[] };
}

let cache: ResumenRetos | null = null;
let error: string | null = null;
let pendiente: Promise<ResumenRetos | null> | null = null;

export const RetosRemotos = {
  resumen: () => cache,
  error: () => error,
  async cargar(forzar = false): Promise<ResumenRetos | null> {
    if (Datos.modo !== 'api') return null;
    if (cache && !forzar) return cache;
    if (pendiente) return pendiente;
    error = null;
    pendiente = api<ResumenRetos>('/retos/resumen')
      .then((valor) => (cache = valor))
      .catch((e) => { error = e?.message || 'No pudimos preparar tu entrenamiento.'; return null; })
      .finally(() => { pendiente = null; });
    return pendiente;
  },
  async crearSesion(modo: ModoReto, area = 'Todas', limite?: number): Promise<SesionReto> {
    return api<SesionReto>('/retos/sesion', { method: 'POST', json: { modo, area, ...(limite ? { limite } : {}) } });
  },
  async responder(pregunta: PreguntaSesionReto, opcion: number | null): Promise<RespuestaReto> {
    const respuesta = await api<RespuestaReto>('/retos/responder', {
      method: 'POST',
      json: { cursoId: pregunta.cursoId, n: pregunta.n, indice: pregunta.indice, opcion },
    });
    if (cache) cache = { ...cache, estado: respuesta.estado };
    if (respuesta.recompensas?.puntosGanados || respuesta.recompensas?.logrosNuevos?.length) {
      window.dispatchEvent(new CustomEvent('recompensas:ganadas', { detail: respuesta.recompensas }));
    }
    return respuesta;
  },
  limpiar() { cache = null; error = null; pendiente = null; },
};
