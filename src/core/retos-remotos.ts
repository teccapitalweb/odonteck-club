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
  id: string;
  tipo: 'seleccion' | 'seleccion_multiple' | 'ordenar' | 'relacionar' | 'completar';
  q: string;
  instruccion?: string;
  casoClinico?: string;
  competencia?: string;
  nivelCognitivo?: string;
  opciones?: string[];
  elementos?: { id: string; texto: string }[];
  izquierda?: { id: string; texto: string }[];
  derecha?: { id: string; texto: string }[];
  plantilla?: string;
  huecos?: { id: string; etiqueta?: string }[];
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
  puntos: number;
  tipo: PreguntaSesionReto['tipo'];
  correcta: number | null;
  respuestaCorrecta: unknown;
  explicacion: string;
  referenciaVideo?: string;
  xpGanado: number;
  estado: ResumenRetos['estado'];
  recompensas?: { puntosGanados?: number; logrosNuevos?: { titulo?: string }[] };
}

let cache: ResumenRetos | null = null;
let error: string | null = null;
let pendiente: Promise<ResumenRetos | null> | null = null;
let generacion = 0;

export const RetosRemotos = {
  resumen: () => cache,
  error: () => error,
  async cargar(forzar = false): Promise<ResumenRetos | null> {
    if (Datos.modo !== 'api') return null;
    if (cache && !forzar) return cache;
    if (pendiente) return pendiente;
    error = null;
    const gen = generacion;
    const carga: Promise<ResumenRetos | null> = api<ResumenRetos>('/retos/resumen')
      .then((valor) => (gen === generacion ? (cache = valor) : null))
      .catch((e) => { if (gen === generacion) error = e?.message || 'No pudimos preparar tu entrenamiento.'; return null; })
      .finally(() => {
        if (pendiente === carga) pendiente = null;
        if (gen === generacion) window.dispatchEvent(new CustomEvent('retos:cambio'));
      });
    pendiente = carga;
    return carga;
  },
  async crearSesion(modo: ModoReto, area = 'Todas', limite?: number): Promise<SesionReto> {
    return api<SesionReto>('/retos/sesion', { method: 'POST', json: { modo, area, ...(limite ? { limite } : {}) } });
  },
  async responder(pregunta: PreguntaSesionReto, respuesta: unknown): Promise<RespuestaReto> {
    const resultado = await api<RespuestaReto>('/retos/responder', {
      method: 'POST',
      json: { cursoId: pregunta.cursoId, n: pregunta.n, indice: pregunta.indice, respuesta },
    });
    if (cache) cache = { ...cache, estado: resultado.estado };
    if (resultado.recompensas?.puntosGanados || resultado.recompensas?.logrosNuevos?.length) {
      window.dispatchEvent(new CustomEvent('recompensas:ganadas', { detail: resultado.recompensas }));
    }
    return resultado;
  },
  limpiar() { generacion++; cache = null; error = null; pendiente = null; },
};
