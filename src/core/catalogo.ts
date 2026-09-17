import data from '../data/catalogo.json';

export interface Clase { n: number; titulo: string; videoId: string; duracion: number | null; gratis: boolean; }
export interface Curso {
  id: string; titulo: string; area: string; nivel: string; instructor: string; portada: string;
  descripcion: string; orden: number; bunnyCollectionId: string; clases: Clase[];
}

export const LIBRARY_ID: string = data.libraryId;
export const cursos: Curso[] = data.cursos as Curso[];
export const areas: string[] = [...new Set(cursos.map((c) => c.area))].sort((a, b) => a.localeCompare(b, 'es'));

export const curso = (id: string) => cursos.find((c) => c.id === id);
export const buscar = (q: string) => {
  const n = q.trim().toLowerCase();
  if (!n) return cursos;
  return cursos.filter((c) => (c.titulo + ' ' + c.area + ' ' + c.instructor).toLowerCase().includes(n));
};
export const duracionCurso = (c: Curso) => {
  const min = c.clases.reduce((a, k) => a + (k.duracion ?? 0), 0);
  return min ? fmtMin(min) : `${c.clases.length} clases`;
};
export const fmtMin = (min: number) => (min >= 60 ? `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, '0')}` : `${min} min`);
