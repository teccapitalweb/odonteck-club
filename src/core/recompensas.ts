import { api } from './auth';
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
  tipo: 'material' | 'manual';
  materialId?: string;
  icono: string;
  canjeada: boolean;
  incluidaVip: boolean;
  alcanza: boolean;
  disponible: boolean;
  estatus?: 'entregado' | 'pendiente';
}

export interface ResumenRecompensas {
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

const DEMO_KEY = 'odonteck-club:recompensas-demo:v1';
const catalogoDemo: Omit<Recompensa, 'canjeada' | 'incluidaVip' | 'alcanza' | 'disponible'>[] = [
  { id: 'guia-diagnostico-ortodoncico', titulo: 'Guía de diagnóstico ortodóncico', descripcion: 'Desbloqueo permanente de una guía clínica propia de OdonTeck.', puntos: 250, tipo: 'material', materialId: 'guia-diagnostico-ortodoncico', icono: 'book-open' },
  { id: 'consentimiento-informado', titulo: 'Formato de consentimiento informado', descripcion: 'Desbloqueo permanente del formato clínico propio de OdonTeck.', puntos: 300, tipo: 'material', materialId: 'consentimiento-informado', icono: 'file-signature' },
  { id: 'tabla-dosis-anestesicas', titulo: 'Tabla de dosis anestésicas', descripcion: 'Referencia rápida de dosis máximas para la práctica clínica.', puntos: 350, tipo: 'material', materialId: 'tabla-dosis-anestesicas', icono: 'syringe' },
  { id: 'plantilla-nota-clinica-receta', titulo: 'Plantilla de nota clínica y receta', descripcion: 'Formato editable para documentar la consulta diaria.', puntos: 400, tipo: 'material', materialId: 'plantilla-nota-clinica-receta', icono: 'notebook-pen' },
  { id: 'protocolo-abscesos', titulo: 'Protocolo de manejo de abscesos', descripcion: 'Desbloqueo permanente del protocolo clínico de OdonTeck.', puntos: 450, tipo: 'material', materialId: 'protocolo-abscesos', icono: 'clipboard-plus' },
  { id: 'guia-materiales-restauradores', titulo: 'Guía de materiales restauradores', descripcion: 'Consulta rápida para seleccionar materiales por indicación.', puntos: 500, tipo: 'material', materialId: 'guia-materiales-restauradores', icono: 'layers-3' },
  { id: 'checklist-urgencias-pediatricas', titulo: 'Checklist de urgencias odontopediátricas', descripcion: 'Lista práctica para orientar la atención inicial de urgencias.', puntos: 500, tipo: 'material', materialId: 'checklist-urgencias-pediatricas', icono: 'list-checks' },
  { id: 'guia-instrumentacion-endodontica', titulo: 'Guía de instrumentación endodóntica', descripcion: 'Secuencia clínica propia para consulta permanente.', puntos: 550, tipo: 'material', materialId: 'guia-instrumentacion-endodontica', icono: 'route' },
  { id: 'manual-estratificacion-resinas', titulo: 'Manual de estratificación de resinas', descripcion: 'Desbloqueo permanente del manual clínico ilustrado de OdonTeck.', puntos: 600, tipo: 'material', materialId: 'manual-estratificacion-resinas', icono: 'library' },
  { id: 'praxia-30-dias', titulo: '30 días de Praxia Medical', descripcion: 'Solicitud de activación. El equipo confirma el beneficio antes de iniciar los 30 días.', puntos: 1500, tipo: 'manual', icono: 'stethoscope' },
];

let cache: ResumenRecompensas | null = null;
let pendiente: Promise<ResumenRecompensas | null> | null = null;

const progresoDemo = () => {
  const clases = Progreso.totalVistas();
  const cursos = Progreso.completados().length;
  const temas = Comunidad.misHilos().length;
  const encuestas = encuestaRespondida('experiencia') ? 1 : 0;
  const actividad = clases * 10 + cursos * 50 + temas * 10 + encuestas * 40;
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
    ['voz', 'Voz de la comunidad', 'Publicaste tu primer tema.', 'message-circle', 'temas', 1],
    ['especialista', 'Especialista', 'Terminaste 3 cursos.', 'badge-check', 'cursos', 3],
    ['maestro', 'Maestro OdonTeck', 'Terminaste 10 cursos.', 'crown', 'cursos', 10],
    ['miembro-club', 'Miembro del club', 'Activaste una membresía pagada.', 'gem', 'membresias', 1],
  ] as const;
  const contadores: Record<string, number> = { clases: Progreso.totalVistas(), cursos: Progreso.completados().length, temas: Comunidad.misHilos().length, quizzes: 0, puntosRetos: 0, membresias: 0 };
  const canjes = Array.isArray(guardado.canjes) ? guardado.canjes : [];
  return {
    saldo, ganados, gastados: Number(guardado.gastados || 0), contadores,
    logros: logrosBase.map(([id, titulo, descripcion, icono, contador, meta]) => ({ id, titulo, descripcion, icono, meta, progreso: Math.min(meta, contadores[contador] || 0), logrado: (contadores[contador] || 0) >= meta, fecha: null })),
    recompensas: catalogoDemo.map((r) => ({ ...r, canjeada: canjes.includes(r.id), incluidaVip: false, alcanza: saldo >= r.puntos, disponible: true })),
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
  resumen: () => cache ?? (Datos.modo === 'demo' ? demo() : null),
  async cargar(forzar = false): Promise<ResumenRecompensas | null> {
    if (Datos.modo === 'demo') return publicar(demo());
    if (cache && !forzar) return cache;
    if (pendiente) return pendiente;
    pendiente = api<ResumenRecompensas>('/recompensas/resumen')
      .then(publicar)
      .finally(() => { pendiente = null; });
    return pendiente;
  },
  async canjear(recompensaId: string) {
    if (Datos.modo === 'demo') {
      const actual = demo();
      const recompensa = actual.recompensas.find((r) => r.id === recompensaId);
      if (!recompensa) throw new Error('Esa recompensa no existe.');
      if (recompensa.canjeada) throw new Error('Esta recompensa ya fue canjeada.');
      if (!recompensa.alcanza) throw new Error(`Necesitas ${recompensa.puntos - actual.saldo} puntos más.`);
      const guardado = { gastados: actual.gastados + recompensa.puntos, canjes: [...actual.recompensas.filter((r) => r.canjeada).map((r) => r.id), recompensa.id] };
      localStorage.setItem(DEMO_KEY, JSON.stringify(guardado));
      publicar(demo());
      return { saldo: cache!.saldo, recompensa: { ...recompensa, estatus: recompensa.tipo === 'material' ? 'entregado' as const : 'pendiente' as const } };
    }
    const resultado = await api<{ saldo: number; recompensa: Recompensa; notificacion: NotificacionRecompensa }>('/recompensas/canjear', { method: 'POST', json: { recompensaId } });
    await this.cargar(true);
    return resultado;
  },
  async marcarLeidas() {
    if (!cache?.notificaciones.length) return;
    if (Datos.modo === 'api') await api('/recompensas/notificaciones/leidas', { method: 'POST' });
    if (cache) publicar({ ...cache, notificaciones: [] });
  },
  limpiar() { cache = null; pendiente = null; },
};
