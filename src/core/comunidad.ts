// Foro de la comunidad. Provisional en localStorage; en Fase 2 pasa a Firestore (foro_temas + comentarios).
import { Perfil } from './perfil';

export interface Respuesta { id: string; autor: string; texto: string; fecha: string }
export interface Hilo { id: string; titulo: string; texto: string; autor: string; fecha: string; cursoId: string | null; respuestas: Respuesta[]; util: number }
const KEY = 'odonteck-club:foro:v1';
const uid = () => Math.random().toString(36).slice(2, 10);

const SEMILLA: Hilo[] = [
  { id: 'bienvenida', titulo: 'Bienvenidos a la comunidad OdonTeck', texto: 'Este es el espacio para compartir casos, dudas y experiencias de consultorio. Abre un tema por curso o uno general. Sin pacientes identificables, por favor.', autor: 'Equipo OdonTeck', fecha: '2026-09-01T10:00:00.000Z', cursoId: null, respuestas: [], util: 12 },
];

function leer(): Hilo[] { try { const v = JSON.parse(localStorage.getItem(KEY) || 'null'); return Array.isArray(v) ? v : SEMILLA; } catch { return SEMILLA; } }
function escribir(h: Hilo[]) { try { localStorage.setItem(KEY, JSON.stringify(h)); } catch {} }

export const Comunidad = {
  hilos(cursoId?: string | null): Hilo[] {
    const h = leer().sort((a, b) => b.fecha.localeCompare(a.fecha));
    return cursoId === undefined ? h : h.filter((x) => x.cursoId === cursoId);
  },
  hilo(id: string) { return leer().find((h) => h.id === id); },
  crear(titulo: string, texto: string, cursoId: string | null) {
    const h = leer(); const nuevo: Hilo = { id: uid(), titulo, texto, autor: Perfil.get().nombre, fecha: new Date().toISOString(), cursoId, respuestas: [], util: 0 };
    h.push(nuevo); escribir(h); return nuevo;
  },
  responder(id: string, texto: string) {
    const h = leer(); const t = h.find((x) => x.id === id); if (!t) return;
    t.respuestas.push({ id: uid(), autor: Perfil.get().nombre, texto, fecha: new Date().toISOString() }); escribir(h);
  },
  util(id: string) { const h = leer(); const t = h.find((x) => x.id === id); if (t) { t.util++; escribir(h); } },
  misHilos() { const n = Perfil.get().nombre; return leer().filter((h) => h.autor === n); },
};

export const hace = (iso: string) => {
  const d = (Date.now() - new Date(iso).getTime()) / 60000;
  if (d < 60) return `hace ${Math.max(1, Math.round(d))} min`;
  if (d < 1440) return `hace ${Math.round(d / 60)} h`;
  if (d < 43200) return `hace ${Math.round(d / 1440)} d`;
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
};
