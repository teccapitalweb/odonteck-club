// Progreso del miembro. Provisional en localStorage; en Fase 2 se persiste en
// Firestore (progreso/{uid}_{cursoId}) a través del backend. La interfaz no cambia.
import { cursos, type Curso } from './catalogo';

export interface ProgresoCurso { vistas: number[]; ultima: number; actualizado: string; historial?: string[]; }
const KEY = 'odonteck-club:progreso:v1';

function leer(): Record<string, ProgresoCurso> {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
}
function escribir(p: Record<string, ProgresoCurso>) { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch {} }

export const Progreso = {
  de(cursoId: string): ProgresoCurso { return leer()[cursoId] || { vistas: [], ultima: 1, actualizado: '' }; },
  marcarVista(cursoId: string, n: number) {
    const all = leer(); const p = all[cursoId] || { vistas: [], ultima: n, actualizado: '' };
    if (!p.vistas.includes(n)) { p.vistas.push(n); (p.historial ||= []).push(new Date().toISOString()); }
    p.vistas.sort((a, b) => a - b); p.ultima = n; p.actualizado = new Date().toISOString();
    all[cursoId] = p; escribir(all);
  },
  abrirClase(cursoId: string, n: number) {
    const all = leer(); const p = all[cursoId] || { vistas: [], ultima: n, actualizado: '' };
    p.ultima = n; p.actualizado = new Date().toISOString(); all[cursoId] = p; escribir(all);
  },
  porcentaje(c: Curso) { return Math.round((this.de(c.id).vistas.length / c.clases.length) * 100); },
  completado(c: Curso) { return this.de(c.id).vistas.length >= c.clases.length; },
  // Desbloqueo secuencial: la clase n se abre si la n-1 ya fue vista (la 1 siempre)
  desbloqueada(c: Curso, n: number) { return n === 1 || this.de(c.id).vistas.includes(n - 1); },
  siguiente(c: Curso) { const v = this.de(c.id).vistas; return c.clases.find((k) => !v.includes(k.n))?.n ?? c.clases.length; },
  enMarcha(): Curso[] {
    const all = leer();
    return cursos.filter((c) => all[c.id] && all[c.id].vistas.length > 0 && !this.completado(c))
      .sort((a, b) => (all[b.id].actualizado || '').localeCompare(all[a.id].actualizado || ''));
  },
  completados(): Curso[] { return cursos.filter((c) => this.completado(c)); },
  reciente(): Curso | undefined { return this.enMarcha()[0]; },
  totalVistas() { return Object.values(leer()).reduce((a, p) => a + p.vistas.length, 0); },
  fechas(): string[] { return Object.values(leer()).flatMap((p) => p.historial || []); },
  hidratar(data: Record<string, ProgresoCurso>) { escribir(data); },
};
