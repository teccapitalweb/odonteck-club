// «Escoge tu curso gratis»: el miembro gratis elige un curso del catálogo y lo tiene
// completo excepto la última clase. En modo API la elección vive en el servidor
// (v2_curso_gratis) y es lo que realmente abre los videos; aquí solo se refleja.
import { api } from './auth';
import { Datos } from './datos';

export interface EstadoCursoGratis {
  cursoId: string | null; origen: string | null; elegido: string | null;
  puedeCambiar: boolean; cambiaHasta: string | null;
}

const KEY = 'odonteck-club:curso-gratis:v1';
const VISTAS_KEY = 'odonteck-club:progreso:v1';
const CAMBIO_MS = 24 * 60 * 60 * 1000;
let estado: EstadoCursoGratis | null = null;
let cambios = 0;

function vistasDemo(cursoId: string): number {
  try {
    const p = JSON.parse(localStorage.getItem(VISTAS_KEY) || '{}');
    return (p?.[cursoId]?.vistas ?? []).length;
  } catch { return 0; }
}

function leerDemo(): EstadoCursoGratis {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (v?.cursoId) {
      cambios = v.cambios ?? 0;
      const limite = new Date(v.elegido).getTime() + CAMBIO_MS;
      const puede = cambios === 0 && Date.now() < limite && vistasDemo(v.cursoId) <= 1;
      return { cursoId: v.cursoId, origen: 'eleccion', elegido: v.elegido, puedeCambiar: puede, cambiaHasta: puede ? new Date(limite).toISOString() : null };
    }
  } catch {}
  return { cursoId: null, origen: null, elegido: null, puedeCambiar: false, cambiaHasta: null };
}

export const CursoGratis = {
  /** true cuando ya sabemos si eligió (o no) — evita mostrar el anuncio antes de tiempo. */
  cargado: () => Datos.modo !== 'api' || estado !== null,
  id(): string | null { if (Datos.modo !== 'api') estado = leerDemo(); return estado?.cursoId ?? null; },
  estado(): EstadoCursoGratis | null { if (Datos.modo !== 'api') estado = leerDemo(); return estado; },
  hidratar(v: EstadoCursoGratis | null) { estado = v; },
  limpiar() { estado = null; },
  async cargar() {
    if (Datos.modo !== 'api') { estado = leerDemo(); return estado; }
    estado = await api<EstadoCursoGratis>('/curso-gratis');
    return estado;
  },
  async elegir(cursoId: string): Promise<EstadoCursoGratis> {
    if (Datos.modo === 'api') {
      estado = await api<EstadoCursoGratis>('/curso-gratis', { method: 'POST', json: { cursoId } });
      return estado;
    }
    const actual = leerDemo();
    if (actual.cursoId && actual.cursoId !== cursoId && !actual.puedeCambiar) throw new Error('Tu curso gratis ya está definido. Hazte VIP para abrir todos los cursos.');
    if (actual.cursoId !== cursoId) {
      const datos = actual.cursoId ? { cursoId, elegido: actual.elegido, cambios: 1, anterior: actual.cursoId } : { cursoId, elegido: new Date().toISOString(), cambios: 0 };
      try { localStorage.setItem(KEY, JSON.stringify(datos)); } catch {}
    }
    estado = leerDemo();
    return estado;
  },
  /** Solo demo: deja el prototipo como recién llegado para volver a ver el anuncio. */
  reiniciarDemo() { try { localStorage.removeItem(KEY); } catch {} estado = null; },
};
