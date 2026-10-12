import { api } from './auth';
import { Datos, type Config, type Curso, type Evento, type Material, type Quiz } from './datos';
import { Progreso, type ProgresoCurso } from './progreso';
import { Comunidad, type Hilo, type Respuesta } from './comunidad';
import { Certificados, type CertificadoRemoto } from './certificados';
import { RetosRemotos } from './retos-remotos';
import { Recompensas } from './recompensas';
import { Directorio } from './directorio';

interface CatalogoRemoto {
  cursos?: unknown[];
  materiales?: unknown[];
  eventos?: unknown[];
  config?: {
    precios?: { mensual?: number; anual?: number };
    descuentoVIP?: number;
    whatsappSoporte?: string;
    canalWhatsApp?: string;
    praxiaUrl?: string;
  };
}

let cargado = false;
let pendiente: Promise<void> | null = null;
const quizzesCargados = new Set<string>();

const adaptarCurso = (v: any): Curso => ({
  ...v,
  portada: v.portada || '/cursos/curso-01.webp',
  aprenderas: Array.isArray(v.aprenderas) ? v.aprenderas : [],
  clases: (Array.isArray(v.clases) ? v.clases : []).map((c: any) => ({
    ...c,
    duracion: c.duracionMin ?? c.duracion ?? null,
  })),
});

const adaptarMaterial = (v: any): Material => ({
  ...v,
  portada: v.portada || '/materiales/portadas/guia-diagnostico-ortodoncico.webp',
});

const adaptarEvento = (v: any): Evento => ({
  ...v,
  reservas: Array.isArray(v.reservas) ? v.reservas.length : Number(v.reservas) || 0,
});

async function cargarQuizDeRuta(path: string) {
  const m = path.match(/^\/curso\/([^/]+)\/clase\/(\d+)$/);
  if (!m) return;
  const cursoId = decodeURIComponent(m[1]);
  const n = Number(m[2]);
  const id = `${cursoId}_${n}`;
  await api(`/progreso/${encodeURIComponent(cursoId)}/abrir`, { method: 'POST', json: { n } });
  if (quizzesCargados.has(id)) return;
  quizzesCargados.add(id);
  try {
    const r = await api<{ version?: number; preguntas: Partial<Quiz['preguntas'][number]>[] }>(`/quiz/${encodeURIComponent(cursoId)}/${n}`);
    const quiz: Quiz = {
      id, cursoId, n, estado: 'aprobado', version: Math.max(1, Number(r.version) || 1), actualizado: '',
      preguntas: r.preguntas.map((p) => ({ ...p, q: p.q || '', opciones: p.opciones || [], correcta: -1, explicacion: '' })),
    };
    Datos.hidratarAdmin('quizzes', [...Datos.quizzes().filter((q) => q.id !== id), quiz]);
  } catch (e: any) {
    if (e?.status !== 404 && e?.status !== 403) {
      quizzesCargados.delete(id);
    }
  }
}

async function cargarComunidadDeRuta(path: string) {
  if (!path.startsWith('/comunidad')) return;
  const detalle = path.match(/^\/comunidad\/([^/?]+)$/);
  if (detalle) {
    const r = await api<{ hilo: Hilo; respuestas: Respuesta[] }>(`/foro/${encodeURIComponent(decodeURIComponent(detalle[1]))}`);
    Comunidad.hidratarDetalle(r.hilo, r.respuestas);
    return;
  }
  Comunidad.hidratar(await api<Hilo[]>('/foro'));
  await Directorio.cargar();
}

async function cargarExtrasDeRuta(path: string) {
  await Promise.all([
    cargarQuizDeRuta(path),
    cargarComunidadDeRuta(path),
    path.startsWith('/certificados') ? api<CertificadoRemoto[]>('/certificados').then((lista) => Certificados.hidratar(lista)) : Promise.resolve(),
    path === '/retos' ? RetosRemotos.cargar() : Promise.resolve(),
    path === '/recompensas' || path === '/logros' || path.startsWith('/materiales') ? Recompensas.cargar().catch(() => null) : Promise.resolve(),
  ]);
}

export async function cargarClub(path = '/', forzar = false) {
  if (Datos.modo !== 'api') return;
  if (cargado && !forzar) return cargarExtrasDeRuta(path);
  if (pendiente) { await pendiente; return cargarExtrasDeRuta(path); }

  pendiente = (async () => {
    // La sincronización conserva actividad histórica y debe terminar antes de
    // pedir el catálogo para reflejar desbloqueos previos por puntos.
    await Recompensas.cargar().catch(() => null);
    const [catalogo, progreso] = await Promise.all([
      api<CatalogoRemoto>('/catalogo'),
      api<Record<string, ProgresoCurso>>('/progreso').catch(() => null),
    ]);

    Datos.hidratarAdmin('cursos', (catalogo.cursos || []).map(adaptarCurso));
    Datos.hidratarAdmin('materiales', (catalogo.materiales || []).map(adaptarMaterial));
    Datos.hidratarAdmin('eventos', (catalogo.eventos || []).map(adaptarEvento));

    const remota = catalogo.config || {};
    const actual = Datos.config();
    const config: Config = {
      precioMensual: Number(remota.precios?.mensual) || actual.precioMensual,
      precioAnual: Number(remota.precios?.anual) || actual.precioAnual,
      descuentoVIP: Number(remota.descuentoVIP) || actual.descuentoVIP,
      whatsappSoporte: remota.whatsappSoporte || actual.whatsappSoporte,
      canalWhatsApp: remota.canalWhatsApp || actual.canalWhatsApp,
      praxiaUrl: remota.praxiaUrl || actual.praxiaUrl,
    };
    Datos.hidratarAdmin('config', config);

    if (progreso) Progreso.hidratar(progreso);

    cargado = true;
  })().finally(() => { pendiente = null; });

  await pendiente;
  await cargarExtrasDeRuta(path);
}

export function invalidarClub() {
  cargado = false;
  quizzesCargados.clear();
  Datos.invalidarAdmin('cursos', 'materiales', 'eventos', 'config');
  RetosRemotos.limpiar();
  Recompensas.limpiar();
}
