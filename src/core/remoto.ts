import { api, Auth } from './auth';
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

const TTL = 60_000;
let cargado = false;
let pendiente: Promise<void> | null = null;
let generacion = 0;
let uidCargado: string | null = null;
let foroEn = 0;
let hiloFresco: { id: string; en: number } | null = null;
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

async function cargarQuizDeRuta(path: string, mismaRuta: boolean) {
  const m = path.match(/^\/curso\/([^/]+)\/clase\/(\d+)$/);
  if (!m) return;
  const cursoId = decodeURIComponent(m[1]);
  const n = Number(m[2]);
  const id = `${cursoId}_${n}`;
  const pedirQuiz = !quizzesCargados.has(id);
  if (pedirQuiz) quizzesCargados.add(id);
  const [abierta, respuesta] = await Promise.allSettled([
    mismaRuta ? Promise.resolve() : api(`/progreso/${encodeURIComponent(cursoId)}/abrir`, { method: 'POST', json: { n } }),
    pedirQuiz ? api<{ version?: number; preguntas: Partial<Quiz['preguntas'][number]>[] }>(`/quiz/${encodeURIComponent(cursoId)}/${n}`) : Promise.resolve(null),
  ]);
  if (abierta.status === 'rejected') { quizzesCargados.delete(id); throw abierta.reason; }
  try {
    if (respuesta.status === 'rejected') throw respuesta.reason;
    const r = respuesta.value;
    if (!r) return;
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

async function cargarComunidadDeRuta(path: string, mismaRuta: boolean) {
  if (!path.startsWith('/comunidad')) return;
  const detalle = path.match(/^\/comunidad\/([^/?]+)$/);
  if (detalle) {
    const id = decodeURIComponent(detalle[1]);
    if (hiloFresco?.id === id && Date.now() - hiloFresco.en < TTL) { hiloFresco = null; return; }
    const r = await api<{ hilo: Hilo; respuestas: Respuesta[] }>(`/foro/${encodeURIComponent(id)}`);
    Comunidad.hidratarDetalle(r.hilo, r.respuestas);
    return;
  }
  if (foroEn && (mismaRuta || Date.now() - foroEn < TTL)) return;
  Comunidad.hidratar(await api<Hilo[]>('/foro'));
  foroEn = Date.now();
}

async function cargarExtrasDeRuta(path: string, mismaRuta: boolean) {
  if (path === '/retos') void RetosRemotos.cargar().catch(() => null);
  await Promise.all([
    cargarQuizDeRuta(path, mismaRuta),
    cargarComunidadDeRuta(path, mismaRuta),
    (path === '/directorio' || path.startsWith('/directorio/perfil/')) && !(Directorio.cargado() && (mismaRuta || Directorio.vigente(TTL))) ? Directorio.cargar() : Promise.resolve(),
    path.startsWith('/directorio/perfil/') && !Directorio.fichaVigente(decodeURIComponent(path.slice('/directorio/perfil/'.length)), TTL) ? Directorio.cargarFicha(decodeURIComponent(path.slice('/directorio/perfil/'.length))).catch(() => null) : Promise.resolve(),
    path.startsWith('/certificados') ? api<CertificadoRemoto[]>('/certificados').then((lista) => Certificados.hidratar(lista)) : Promise.resolve(),
    path === '/' || path === '/perfil' || path === '/logros' || path === '/recompensas' || path === '/retos' || path.startsWith('/comunidad') || path.startsWith('/materiales') ? Recompensas.cargar().catch(() => null) : Promise.resolve(),
  ]);
}

export async function cargarClub(path = '/', forzar = false, mismaRuta = false) {
  if (Datos.modo !== 'api') return;
  const uid = Auth.usuario?.uid ?? null;
  if (uid !== uidCargado) { if (uidCargado) invalidarClub(); uidCargado = uid; pendiente = null; }
  if (cargado && !forzar) return cargarExtrasDeRuta(path, mismaRuta);

  if (!pendiente) {
    const gen = generacion;
    const nueva: Promise<void> = (async () => {
      void Recompensas.cargar().catch(() => null);
      // /catalogo lee los desbloqueos del estado guardado; la sincronización de recompensas solo suma puntos y logros.
      const [catalogo, progreso] = await Promise.all([
        api<CatalogoRemoto>('/catalogo'),
        api<Record<string, ProgresoCurso>>('/progreso').catch(() => null),
      ]);
      if (gen !== generacion) return;

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
    })().finally(() => { if (pendiente === nueva) pendiente = null; });
    pendiente = nueva;
  }

  // Un extra que falle (p. ej. 403 al abrir una clase VIP) no debe adelantar el render antes del catálogo.
  const carga = pendiente;
  const extras = cargarExtrasDeRuta(path, mismaRuta);
  await Promise.allSettled([carga, extras]);
  await carga;
  await extras;
}

export function invalidarComunidad() { foroEn = 0; hiloFresco = null; }
export function invalidarDirectorio() { Directorio.invalidar(); }
export function marcarHiloFresco(id: string) { hiloFresco = { id, en: Date.now() }; }

export function invalidarClub() {
  generacion++;
  cargado = false;
  quizzesCargados.clear();
  Datos.invalidarAdmin('cursos', 'materiales', 'eventos', 'config');
  RetosRemotos.limpiar();
  Recompensas.limpiar();
  invalidarComunidad();
  Comunidad.hidratar([]);
  invalidarDirectorio();
  Directorio.hidratar({ perfiles: [], oportunidades: [], conexiones: [], miPerfil: null });
}
