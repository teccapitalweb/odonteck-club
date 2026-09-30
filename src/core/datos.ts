// Almacén de contenido editable desde el admin.
// Modo demo: localStorage sembrado con src/data/*.json. Modo api: se reemplaza por llamadas al backend (docs/contrato.md).
import catalogoSeed from '../data/catalogo.json';
import materialesSeed from '../data/materiales.json';
import eventosSeed from '../data/envivo.json';
import miembrosSeed from '../data/miembros-demo.json';
import quizzesSeed from '../data/quizzes-demo.json';

export interface Nota { resumen: string; conceptos: { t: string; texto: string }[] }
export interface Clase { n: number; titulo: string; videoId: string; duracion: number | null; gratis: boolean; notas?: Nota }
export interface Curso {
  id: string; titulo: string; area: string; nivel: string; instructor: string; portada: string; banner?: string;
  descripcion: string; aprenderas?: string[]; orden: number; publicado?: boolean; bunnyCollectionId: string; clases: Clase[];
}
export interface Material {
  id: string; titulo: string; tipo: string; categoria: string; area: string; autor: string; paginas: number; portada: string;
  cursoId: string | null; descripcion: string; estado: 'disponible' | 'proximamente' | 'oculto' | string; gratis?: boolean; url?: string;
}
export interface Evento { id: string; titulo: string; ponente: string; fecha: string; duracionMin: number; enlace?: string | null; cursoId?: string; publicado?: boolean; reservas?: number; reservado?: boolean }
export interface Pregunta { q: string; opciones: string[]; correcta: number; explicacion: string }
export interface Quiz { id: string; cursoId: string; n: number; estado: 'borrador' | 'aprobado'; preguntas: Pregunta[]; actualizado: string }
export interface MiembroDemo { uid: string; nombre: string; email: string; plan: 'mensual' | 'anual' | 'cortesia' | 'ninguno'; vence: string | null; alta: string; clasesVistas: number; ultimaActividad: string; cortesiaHasta?: string | null; cortesiaMotivo?: string }
export interface Aviso { id: string; titulo: string; texto: string; enlace?: string; fecha: string }
export interface Config { precioMensual: number; precioAnual: number; descuentoVIP: number; whatsappSoporte: string; canalWhatsApp: string; praxiaUrl: string }

const PREFIX = 'odonteck-club:datos:v1:';
const CONFIG_DEF: Config = {
  precioMensual: 199, precioAnual: 1899, descuentoVIP: 20, whatsappSoporte: '5212361139827',
  canalWhatsApp: 'https://whatsapp.com/channel/0029VbCQbyVISTkPMfD7hz0N',
  praxiaUrl: 'https://app.praxiamedical.com/?utm_source=odonteck-club&utm_medium=panel',
};

function leer<T>(k: string, semilla: T): T {
  try { const v = localStorage.getItem(PREFIX + k); return v ? JSON.parse(v) : structuredClone(semilla); } catch { return structuredClone(semilla); }
}
function escribir<T>(k: string, v: T) {
  try { localStorage.setItem(PREFIX + k, JSON.stringify(v)); } catch (e) { alert('No hay espacio en el navegador para guardar este cambio. Usa imágenes más ligeras.'); throw e; }
  window.dispatchEvent(new CustomEvent('datos:cambio', { detail: k }));
}
const hoy = () => new Date().toISOString();

const cursosSeed: Curso[] = (catalogoSeed.cursos as Curso[]).map((c) => ({ ...c, publicado: c.publicado ?? true, aprenderas: [] }));

export const Datos = {
  modo: (import.meta.env.VITE_API_URL ? 'api' : 'demo') as 'api' | 'demo',
  libraryId: catalogoSeed.libraryId as string,

  cursos: () => leer<Curso[]>('cursos', cursosSeed)
    // Portadas nuevas: si el demo guardado conserva la portada provisional, se toma la del catálogo
    .map((c) => { const s = cursosSeed.find((x) => x.id === c.id); return s && /^\/cursos\/curso-\d+\.webp$/.test(c.portada) && s.portada !== c.portada ? { ...c, portada: s.portada } : c; })
    .sort((a, b) => a.orden - b.orden),
  guardarCurso(c: Curso) { const l = this.cursos(); const i = l.findIndex((x) => x.id === c.id); i >= 0 ? (l[i] = c) : l.push(c); escribir('cursos', l); },
  borrarCurso(id: string) { escribir('cursos', this.cursos().filter((c) => c.id !== id)); },
  reordenarCursos(ids: string[]) { const l = this.cursos(); ids.forEach((id, i) => { const c = l.find((x) => x.id === id); if (c) c.orden = i + 1; }); escribir('cursos', l); },

  materiales: () => {
    const guardados = leer<Material[]>('materiales', materialesSeed as Material[]);
    if (Datos.modo === 'api') return guardados;
    const semilla = materialesSeed as Material[];
    const orden = new Map(semilla.map((m, i) => [m.id, i]));
    return guardados
      .map((m) => {
        const actual = semilla.find((x) => x.id === m.id);
        return actual ? { ...m, gratis: actual.gratis === true } : m;
      })
      .sort((a, b) => (orden.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (orden.get(b.id) ?? Number.MAX_SAFE_INTEGER));
  },
  guardarMaterial(m: Material) { const l = this.materiales(); const i = l.findIndex((x) => x.id === m.id); i >= 0 ? (l[i] = m) : l.unshift(m); escribir('materiales', l); },
  borrarMaterial(id: string) { escribir('materiales', this.materiales().filter((m) => m.id !== id)); },

  eventos: () => leer<Evento[]>('eventos', eventosSeed as Evento[]).sort((a, b) => a.fecha.localeCompare(b.fecha)),
  guardarEvento(e: Evento) { const l = this.eventos(); const i = l.findIndex((x) => x.id === e.id); i >= 0 ? (l[i] = e) : l.push(e); escribir('eventos', l); },
  borrarEvento(id: string) { escribir('eventos', this.eventos().filter((e) => e.id !== id)); },

  quizzes: () => leer<Quiz[]>('quizzes', quizzesSeed as Quiz[]),
  quiz: (cursoId: string, n: number) => Datos.quizzes().find((q) => q.cursoId === cursoId && q.n === n),
  guardarQuiz(q: Quiz) { const l = this.quizzes(); q.actualizado = hoy(); const i = l.findIndex((x) => x.id === q.id); i >= 0 ? (l[i] = q) : l.push(q); escribir('quizzes', l); },

  miembros: () => leer<MiembroDemo[]>('miembros', miembrosSeed as MiembroDemo[]),
  guardarMiembro(m: MiembroDemo) { const l = this.miembros(); const i = l.findIndex((x) => x.uid === m.uid); if (i >= 0) l[i] = m; escribir('miembros', l); },

  avisos: () => leer<Aviso[]>('avisos', []).sort((a, b) => b.fecha.localeCompare(a.fecha)),
  publicarAviso(a: Omit<Aviso, 'id' | 'fecha'>) { const l = this.avisos(); l.unshift({ ...a, id: Math.random().toString(36).slice(2, 10), fecha: hoy() }); escribir('avisos', l); },
  borrarAviso(id: string) { escribir('avisos', this.avisos().filter((a) => a.id !== id)); },

  config: () => ({ ...CONFIG_DEF, ...leer<Partial<Config>>('config', {}) }),
  guardarConfig(c: Config) { escribir('config', c); },

  restablecerDemo() { Object.keys(localStorage).filter((k) => k.startsWith(PREFIX)).forEach((k) => localStorage.removeItem(k)); window.dispatchEvent(new CustomEvent('datos:cambio', { detail: '*' })); },

  hidratarAdmin(k: string, v: unknown) { escribir(k, v); },
  invalidarAdmin(...keys: string[]) { for (const k of keys) { try { localStorage.removeItem(PREFIX + k); } catch {} window.dispatchEvent(new CustomEvent('datos:cambio', { detail: k })); } },
};

export const slug = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'item';

// Reduce una imagen subida a WebP ligero (para portadas en modo demo)
export function imagenAWebp(file: File, maxLado = 900, calidad = 0.82): Promise<string> {
  return new Promise((ok, err) => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, maxLado / Math.max(img.width, img.height));
      const cv = document.createElement('canvas'); cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k);
      cv.getContext('2d')!.drawImage(img, 0, 0, cv.width, cv.height);
      ok(cv.toDataURL('image/webp', calidad)); URL.revokeObjectURL(img.src);
    };
    img.onerror = err; img.src = URL.createObjectURL(file);
  });
}
