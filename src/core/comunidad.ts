// Foro de la comunidad. Provisional en localStorage; en Fase 2 pasa a Firestore (foro_temas + comentarios).
import { Perfil } from './perfil';
import { Datos } from './datos';
import { Auth } from './auth';

export interface Respuesta { id: string; autor: string; texto: string; fecha: string }
export interface Hilo { id: string; titulo: string; texto: string; autor: string; autorUid?: string; fecha: string; cursoId: string | null; respuestas: Respuesta[]; respuestasTotal?: number; util: number; marcadoUtil?: boolean; oculto?: boolean }
const KEY = 'odonteck-club:foro:v1';
const uid = () => Math.random().toString(36).slice(2, 10);

const SEMILLA: Hilo[] = [
  { id: 'bienvenida', titulo: 'Bienvenidos a la comunidad OdonTeck', texto: 'Este es el espacio para compartir casos, dudas y experiencias de consultorio. Abre un tema por curso o uno general. Sin pacientes identificables, por favor.', autor: 'Equipo OdonTeck', fecha: '2026-09-01T10:00:00.000Z', cursoId: null, respuestas: [], util: 12 },
  { id: 'demo-caries-radiografia', titulo: '¿Lesión activa o detenida?', texto: 'Estoy repasando los criterios visuales y táctiles para caries oclusal. ¿Qué hallazgo pesa más en su decisión antes de intervenir?', autor: 'Dra. Ana Torres', fecha: '2026-09-26T18:20:00.000Z', cursoId: 'diagnostico-y-clasificacion-de-la-caries-dental', respuestas: [{ id: 'r-demo-1', autor: 'Dr. Carlos Mendoza', texto: 'Primero correlacionaría actividad, textura y control de placa; la imagen por sí sola no cuenta toda la historia.', fecha: '2026-09-26T19:05:00.000Z' }], util: 18 },
  { id: 'demo-ortodoncia-registros', titulo: 'Los registros que más cambian una referencia', texto: 'Cuando el caso llega desde práctica general, fotografías consistentes, panorámica y análisis de espacio hacen una diferencia enorme. ¿Qué registro suelen echar de menos?', autor: 'Dr. Carlos Mendoza', fecha: '2026-09-25T15:40:00.000Z', cursoId: 'diagnostico-en-ortodoncia-para-odontologos-generales', respuestas: [{ id: 'r-demo-2', autor: 'Dra. Sofía Reyes', texto: 'Las fotografías extraorales de perfil bien estandarizadas; ayudan muchísimo a valorar crecimiento y armonía facial.', fecha: '2026-09-25T16:10:00.000Z' }], util: 24 },
  { id: 'demo-pediatria-conductos', titulo: 'Un detalle que evita sorpresas en odontopediatría', texto: 'En molares temporales, anticipar la anatomía radicular y revisar la reabsorción fisiológica cambia por completo la planeación. Compartan sus puntos de control.', autor: 'Dra. Sofía Reyes', fecha: '2026-09-24T12:15:00.000Z', cursoId: 'endodoncia-pediatrica-manejo-de-los-canales-radiculares-en-ninos', respuestas: [], util: 15 },
];

function leer(): Hilo[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (!Array.isArray(v)) return SEMILLA;
    const ids = new Set(v.map((h) => h?.id));
    return [...v, ...SEMILLA.filter((h) => !ids.has(h.id))];
  } catch { return SEMILLA; }
}
function escribir(h: Hilo[]) { try { localStorage.setItem(KEY, JSON.stringify(h)); } catch {} }
let remotos: Hilo[] = [];
const normalizar = (h: any, respuestas?: Respuesta[]): Hilo => ({
  ...h,
  cursoId: h.cursoId ?? null,
  respuestas: respuestas ?? (Array.isArray(h.respuestas) ? h.respuestas : []),
  respuestasTotal: Number(h.respuestasTotal ?? (Array.isArray(h.respuestas) ? h.respuestas.length : h.respuestas)) || 0,
  util: Number(h.util) || 0,
});
const fuente = () => Datos.modo === 'api' ? remotos : leer();

export const Comunidad = {
  hilos(cursoId?: string | null): Hilo[] {
    const h = fuente().filter((x) => !x.oculto).sort((a, b) => b.fecha.localeCompare(a.fecha));
    return cursoId === undefined ? h : h.filter((x) => x.cursoId === cursoId);
  },
  hilo(id: string) { return fuente().find((h) => h.id === id && !h.oculto); },
  todos() { return fuente().sort((a, b) => b.fecha.localeCompare(a.fecha)); },
  alternarOculto(id: string) { const h = leer(); const t = h.find((x) => x.id === id); if (t) { t.oculto = !t.oculto; escribir(h); } },
  crear(titulo: string, texto: string, cursoId: string | null) {
    const h = leer(); const nuevo: Hilo = { id: uid(), titulo, texto, autor: Perfil.get().nombre, fecha: new Date().toISOString(), cursoId, respuestas: [], util: 0 };
    h.push(nuevo); escribir(h); return nuevo;
  },
  responder(id: string, texto: string) {
    const h = leer(); const t = h.find((x) => x.id === id); if (!t) return;
    t.respuestas.push({ id: uid(), autor: Perfil.get().nombre, texto, fecha: new Date().toISOString() }); escribir(h);
  },
  util(id: string) { const h = leer(); const t = h.find((x) => x.id === id); if (t) { t.util++; escribir(h); } },
  misHilos() { const n = Perfil.get().nombre; return fuente().filter((h) => Datos.modo === 'api' ? h.autorUid === Auth.usuario?.uid : h.autor === n); },
  hidratar(hilos: unknown[]) { remotos = (Array.isArray(hilos) ? hilos : []).map((h) => normalizar(h)); },
  hidratarDetalle(hilo: unknown, respuestas: Respuesta[]) {
    const detalle = normalizar(hilo, respuestas);
    detalle.respuestasTotal = respuestas.length;
    remotos = [detalle, ...remotos.filter((h) => h.id !== detalle.id)];
  },
  agregarRemoto(hilo: unknown) { const nuevo = normalizar(hilo); remotos = [nuevo, ...remotos.filter((h) => h.id !== nuevo.id)]; return nuevo; },
  responderRemoto(id: string, respuesta: Respuesta) {
    const hilo = remotos.find((h) => h.id === id); if (!hilo) return;
    hilo.respuestas = [...hilo.respuestas, respuesta]; hilo.respuestasTotal = (hilo.respuestasTotal ?? 0) + 1;
  },
  utilRemoto(id: string, util: number) { const hilo = remotos.find((h) => h.id === id); if (hilo) { hilo.util = util; hilo.marcadoUtil = true; } },
};

export const hace = (iso: string) => {
  if (!iso || Number.isNaN(new Date(iso).getTime())) return 'Sin actividad';
  const d = (Date.now() - new Date(iso).getTime()) / 60000;
  if (d < 60) return `hace ${Math.max(1, Math.round(d))} min`;
  if (d < 1440) return `hace ${Math.round(d / 60)} h`;
  if (d < 43200) return `hace ${Math.round(d / 1440)} d`;
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
};
