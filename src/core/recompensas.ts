import { api, Auth } from './auth';
import catalogoBase from '../../api/src/data/recompensas.json';
import { Comunidad } from './comunidad';
import { Datos } from './datos';
import { encuestaRespondida } from './encuestas';
import { Progreso } from './progreso';

export interface MovimientoRecompensa {
  id: string;
  tipo: string;
  puntos: number;
  detalle: string;
  fecha: string;
}

export interface NotificacionRecompensa {
  id: string;
  tipo: 'logro' | 'recompensa' | string;
  titulo: string;
  texto: string;
  enlace: string;
  fecha: string;
  leida: boolean;
}

export interface LogroRecompensa {
  id: string;
  titulo: string;
  descripcion: string;
  icono: string;
  progreso: number;
  meta: number;
  logrado: boolean;
  fecha: string | null;
}

export interface Recompensa {
  id: string;
  titulo: string;
  descripcion: string;
  puntos: number;
  tipo: 'material' | 'manual' | 'archivo' | 'personalizacion';
  categoria?: string;
  estado?: string;
  entrega?: string;
  incluye?: string[];
  motivoPendiente?: string;
  imagen?: string;
  ranura?: 'marco' | 'portada';
  estilo?: string;
  aplicado?: boolean;
  cupo?: number;
  plazo?: string;
  materialId?: string;
  icono: string;
  canjeada: boolean;
  incluidaVip: boolean;
  alcanza: boolean;
  disponible: boolean;
  estatus?: 'entregado' | 'pendiente' | 'cancelado' | null;
}

export interface ResumenRecompensas {
  canjes?: { id: string; recompensaId: string; titulo: string; puntos: number; estatus: string; solicitado: string; nota?: string|null; plazo?: string|null }[];
  personalizacion?: {marco:string|null;portada:string|null};
  saldo: number;
  ganados: number;
  gastados: number;
  contadores: Record<string, number>;
  logros: LogroRecompensa[];
  recompensas: Recompensa[];
  movimientos: MovimientoRecompensa[];
  notificaciones: NotificacionRecompensa[];
  actualizado: string | null;
}

export interface PremioRecompensas {
  puntosGanados?: number;
  saldo?: number;
  logrosNuevos?: { id?: string; titulo?: string }[];
  notificaciones?: NotificacionRecompensa[];
}

const DEMO_KEY = 'odonteck-club:recompensas-demo:v1';
const JUEGOS_DEMO_KEY = 'odonteck-club:juegos-clase:v1';
const catalogoDemo = catalogoBase as unknown as Recompensa[];

let cache: ResumenRecompensas | null = null;
let pendiente: Promise<ResumenRecompensas | null> | null = null;
let sucio = false;
let generacion = 0;

const progresoDemo = () => {
  const clases = Progreso.totalVistas();
  const cursos = Progreso.completados().length;
  const temas = Comunidad.misHilos().length;
  const encuestas = encuestaRespondida('experiencia') ? 1 : 0;
  let juegos = 0;
  try {
    const guardados = JSON.parse(localStorage.getItem(JUEGOS_DEMO_KEY) || '{}');
    juegos = guardados && typeof guardados === 'object' && !Array.isArray(guardados) ? Object.keys(guardados).length : 0;
  } catch {}
  const actividad = clases * 10 + cursos * 50 + temas * 10 + encuestas * 40 + juegos * 5;
  // El saldo mínimo permite recorrer el canje durante la demostración local; producción nunca usa este valor.
  return Math.max(actividad, 720);
};

function demo(): ResumenRecompensas {
  let guardado: { gastados: number; canjes: string[] } = { gastados: 0, canjes: [] };
  try { guardado = { ...guardado, ...JSON.parse(localStorage.getItem(DEMO_KEY) || '{}') }; } catch {}
  const ganados = progresoDemo();
  const saldo = Math.max(0, ganados - Number(guardado.gastados || 0));
  const ahora = new Date().toISOString();
  const logrosBase = [
    ['primer-paso', 'Primer paso', 'Completaste tu primera clase.', 'footprints', 'clases', 1],
    ['en-marcha', 'En marcha', 'Completaste 5 clases.', 'play', 'clases', 5],
    ['certificado', 'Primer certificado', 'Terminaste tu primer curso.', 'award', 'cursos', 1],
    ['mente-clinica', 'Mente clínica', 'Aprobaste 3 evaluaciones.', 'brain', 'quizzes', 3],
    ['retador', 'Retador constante', 'Ganaste 100 puntos practicando en Retos.', 'gamepad-2', 'puntosRetos', 100],
    ['repaso-constante', 'Repaso constante', 'Completaste 10 juegos de repaso al terminar tus clases.', 'puzzle', 'juegosClase', 10],
    ['voz', 'Voz de la comunidad', 'Publicaste tu primer tema.', 'message-circle', 'temas', 1],
    ['especialista', 'Especialista', 'Terminaste 3 cursos.', 'badge-check', 'cursos', 3],
    ['maestro', 'Maestro OdonTeck', 'Terminaste 10 cursos.', 'crown', 'cursos', 10],
    ['miembro-club', 'Miembro del club', 'Activaste una membresía pagada.', 'gem', 'membresias', 1],
  ] as const;
  let juegosClase = 0;
  try {
    const guardados = JSON.parse(localStorage.getItem(JUEGOS_DEMO_KEY) || '{}');
    juegosClase = guardados && typeof guardados === 'object' && !Array.isArray(guardados) ? Object.keys(guardados).length : 0;
  } catch {}
  const contadores: Record<string, number> = { clases: Progreso.totalVistas(), cursos: Progreso.completados().length, temas: Comunidad.misHilos().length, quizzes: 0, puntosRetos: 0, membresias: 0, juegosClase };
  const canjes = Array.isArray(guardado.canjes) ? guardado.canjes : [];
  return {
    saldo, ganados, gastados: Number(guardado.gastados || 0), contadores,
    logros: logrosBase.map(([id, titulo, descripcion, icono, contador, meta]) => ({ id, titulo, descripcion, icono, meta, progreso: Math.min(meta, contadores[contador] || 0), logrado: (contadores[contador] || 0) >= meta, fecha: null })),
    recompensas: catalogoDemo.map((r) => ({ ...r, canjeada: canjes.includes(r.id), incluidaVip: false, alcanza: saldo >= r.puntos, disponible: r.estado === 'disponible', estatus: canjes.includes(r.id) ? (r.tipo === 'manual' ? 'pendiente' : 'entregado') : null })),
    movimientos: [{ id: 'demo', tipo: 'demo', puntos: ganados, detalle: 'Saldo de demostración local', fecha: ahora }],
    notificaciones: [], actualizado: ahora,
  };
}

function publicar(valor: ResumenRecompensas | null) {
  cache = valor;
  window.dispatchEvent(new CustomEvent('recompensas:cambio'));
  return valor;
}

export const Recompensas = {
  invalidar() { sucio = true; },
  resumen: () => cache ?? (Datos.modo === 'demo' ? demo() : null),
  async cargar(forzar = false): Promise<ResumenRecompensas | null> {
    if (Datos.modo === 'demo') return publicar(demo());
    if (cache && !forzar && !sucio) return cache;
    if (pendiente) return pendiente;
    sucio = false;
    const gen = generacion;
    const carga: Promise<ResumenRecompensas | null> = api<ResumenRecompensas>('/recompensas/resumen')
      .then((valor) => (gen === generacion ? publicar(valor) : null))
      .catch((e) => { if (gen === generacion) sucio = true; throw e; })
      .finally(() => { if (pendiente === carga) pendiente = null; });
    pendiente = carga;
    return carga;
  },
  aplicarPremio(premio: PremioRecompensas | null | undefined) {
    if (!premio || Datos.modo !== 'api') return;
    sucio = true;
    if (!cache) { void this.cargar().catch(() => null); return; }
    const puntos = Math.max(0, Number(premio.puntosGanados) || 0);
    const nuevos = new Set((premio.logrosNuevos || []).map((l) => l.id));
    const ahora = new Date().toISOString();
    publicar({
      ...cache,
      saldo: typeof premio.saldo === 'number' ? premio.saldo : cache.saldo + puntos,
      ganados: cache.ganados + puntos,
      logros: cache.logros.map((l) => nuevos.has(l.id) && !l.logrado ? { ...l, logrado: true, progreso: l.meta, fecha: ahora } : l),
      notificaciones: Array.isArray(premio.notificaciones) ? premio.notificaciones : cache.notificaciones,
    });
  },
  async canjear(recompensaId: string, precioEsperado?: number) {
    if (Datos.modo === 'demo') {
      const actual = demo();
      const recompensa = actual.recompensas.find((r) => r.id === recompensaId);
      if (!recompensa) throw new Error('Esa recompensa no existe.');
      if (!recompensa.disponible) throw new Error('Esta recompensa todavía no está disponible.');
      if (recompensa.canjeada) throw new Error('Esta recompensa ya fue canjeada.');
      if (!recompensa.alcanza) throw new Error(`Necesitas ${recompensa.puntos - actual.saldo} OdonCoins más.`);
      const guardado = { gastados: actual.gastados + recompensa.puntos, canjes: [...actual.recompensas.filter((r) => r.canjeada).map((r) => r.id), recompensa.id] };
      localStorage.setItem(DEMO_KEY, JSON.stringify(guardado));
      publicar(demo());
      return { saldo: cache!.saldo, recompensa: { ...recompensa, estatus: recompensa.tipo !== 'manual' ? 'entregado' as const : 'pendiente' as const } };
    }
    const resultado = await api<{ saldo: number; recompensa: Recompensa; notificacion: NotificacionRecompensa }>('/recompensas/canjear', { method: 'POST', json: { recompensaId, precioEsperado: precioEsperado ?? cache?.recompensas.find(r=>r.id===recompensaId)?.puntos } });
    await this.cargar(true);
    return resultado;
  },
  async descargar(id: string) {
    if(Datos.modo==='demo') throw new Error('La descarga protegida está disponible al iniciar sesión en el club.');
    const token=await Auth.token();
    const response=await fetch(`${import.meta.env.VITE_API_URL}/recompensas/${encodeURIComponent(id)}/archivo`,{headers:{Authorization:`Bearer ${token}`}});
    if(!response.ok){const e=await response.json().catch(()=>({}));throw new Error(e.mensaje||'No pudimos descargar el archivo.');}
    const blob=await response.blob(),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download=`${id}.html`;a.click();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
  },
  async aplicar(recompensaId:string|null,ranura:'marco'|'portada') {
    if(Datos.modo==='demo')throw new Error('Activa tus diseños al iniciar sesión en el club.');
    await api('/recompensas/personalizacion',{method:'POST',json:{recompensaId,ranura}});
    await this.cargar(true);
  },
  async marcarLeidas() {
    if (!cache?.notificaciones.length) return;
    if (Datos.modo === 'api') await api('/recompensas/notificaciones/leidas', { method: 'POST' });
    if (cache) publicar({ ...cache, notificaciones: [] });
  },
  limpiar() { generacion++; cache = null; pendiente = null; sucio = false; },
};
