import { api } from './auth';
import { Datos } from './datos';
import { Progreso } from './progreso';

export type TipoPreguntaEncuesta = 'opcion' | 'multiple' | 'escala' | 'texto';

export interface OpcionEncuesta { valor: string; etiqueta: string }
export interface PreguntaEncuesta {
  id: string;
  tipo: TipoPreguntaEncuesta;
  texto: string;
  requerida: boolean;
  opciones?: OpcionEncuesta[];
  min?: number;
  max?: number;
  minEtiqueta?: string;
  maxEtiqueta?: string;
  ayuda?: string;
}
export interface EncuestaPendiente {
  clave: string;
  id: string;
  version: number;
  tipo: 'bienvenida' | 'curso' | 'pulso';
  titulo: string;
  descripcion: string;
  cursoId?: string | null;
  cursoTitulo?: string | null;
  preguntas: PreguntaEncuesta[];
  prioridad?: number;
}

export interface PreguntaResumenEncuesta {
  id: string;
  texto: string;
  tipo: TipoPreguntaEncuesta;
  total: number;
  promedio?: number | null;
  min?: number;
  max?: number;
  opciones?: (OpcionEncuesta & { total: number; porcentaje: number })[];
  comentarios?: string[];
}
export interface ResumenEncuestas {
  totalRespuestas: number;
  encuestas: { id: string; tipo: string; titulo: string; version: number; total: number; preguntas: PreguntaResumenEncuesta[] }[];
  cursos: { cursoId: string; titulo: string; total: number; utilidad: number | null; recomendacion: number | null }[];
}

const opcion = (valor: string, etiqueta: string): OpcionEncuesta => ({ valor, etiqueta });
const PLANTILLAS = {
  bienvenida: {
    // Debe coincidir con ENCUESTAS.bienvenida de api/src/lib/encuestas.js. Se presenta como página propia (#/bienvenida).
    clave: 'bienvenida-v2', id: 'bienvenida', version: 2, tipo: 'bienvenida' as const, prioridad: 100,
    titulo: 'Ayúdanos a conocerte', descripcion: 'Son siete preguntas breves para recomendarte mejor contenido y entender a nuestra comunidad.',
    preguntas: [
      { id: 'situacion', tipo: 'opcion' as const, requerida: true, texto: '¿En qué etapa profesional te encuentras?', ayuda: 'Así ajustamos el nivel de lo que te recomendamos.', opciones: [opcion('estudiante', 'Estudiante de odontología'), opcion('pasante', 'Pasante o servicio social'), opcion('general', 'Odontólogo general'), opcion('especialista', 'Especialista'), opcion('docente', 'Docente o investigador'), opcion('otro', 'Otra etapa')] },
      { id: 'experiencia', tipo: 'opcion' as const, requerida: true, texto: '¿Cuánta experiencia clínica tienes?', ayuda: 'Cuenta el tiempo atendiendo pacientes, dentro o fuera de la universidad.', opciones: [opcion('aun_estudio', 'Aún estoy estudiando'), opcion('menos_1', 'Menos de 1 año'), opcion('1_3', 'De 1 a 3 años'), opcion('4_7', 'De 4 a 7 años'), opcion('8_mas', '8 años o más')] },
      { id: 'como_conocio', tipo: 'opcion' as const, requerida: true, texto: '¿Cómo conociste OdonTeck?', ayuda: 'Elige el lugar donde nos viste por primera vez.', opciones: [opcion('instagram', 'Instagram'), opcion('facebook', 'Facebook'), opcion('tiktok', 'TikTok'), opcion('google', 'Google'), opcion('whatsapp', 'WhatsApp'), opcion('colega', 'Colega o profesor'), opcion('evento', 'Curso o evento'), opcion('otro', 'Otro medio')] },
      { id: 'objetivo', tipo: 'opcion' as const, requerida: true, texto: '¿Qué quieres lograr principalmente?', ayuda: 'Elige el que más pese hoy; después puedes explorar todo el club.', opciones: [opcion('practica', 'Mejorar mi práctica clínica'), opcion('actualizacion', 'Mantenerme actualizado'), opcion('certificacion', 'Obtener formación certificada'), opcion('posgrado', 'Prepararme para posgrado'), opcion('comunidad', 'Conectar con la comunidad'), opcion('recursos', 'Conseguir recursos clínicos')] },
      { id: 'intereses', tipo: 'multiple' as const, requerida: true, max: 3, texto: '¿Qué áreas te interesan más?', ayuda: 'Con esto ordenamos los cursos que verás primero.', opciones: [opcion('diagnostico', 'Diagnóstico y cariología'), opcion('ortodoncia', 'Ortodoncia'), opcion('endodoncia', 'Endodoncia'), opcion('restauradora', 'Odontología restauradora'), opcion('estetica', 'Estética dental'), opcion('cirugia', 'Cirugía bucal'), opcion('periodoncia', 'Periodoncia'), opcion('pediatria', 'Odontopediatría'), opcion('rehabilitacion', 'Rehabilitación oral'), opcion('medicina_bucal', 'Medicina bucal')] },
      { id: 'formato', tipo: 'multiple' as const, requerida: true, max: 2, texto: '¿Cómo prefieres aprender?', ayuda: 'Nos ayuda a decidir qué producir primero.', opciones: [opcion('video', 'Clases cortas en video'), opcion('casos', 'Casos clínicos paso a paso'), opcion('en_vivo', 'Sesiones en vivo'), opcion('guias', 'Guías y protocolos'), opcion('quizzes', 'Quizzes y retos')] },
      { id: 'reto', tipo: 'opcion' as const, requerida: true, texto: '¿Qué es lo que más te dificulta seguir formándote?', ayuda: 'Queremos quitar ese obstáculo, no sumar otro.', opciones: [opcion('tiempo', 'Falta de tiempo'), opcion('costo', 'El costo de los cursos'), opcion('confianza', 'Encontrar contenido confiable'), opcion('practica', 'Llevar la teoría a la práctica'), opcion('constancia', 'Mantener la constancia'), opcion('otro', 'Otro motivo')] },
    ],
  },
  curso: {
    clave: 'curso-final-v1', id: 'curso-final', version: 1, tipo: 'curso' as const, prioridad: 80,
    titulo: 'Tu experiencia con el curso', descripcion: 'Tu opinión nos ayuda a conservar lo útil y mejorar la siguiente edición.',
    preguntas: [
      { id: 'utilidad', tipo: 'escala' as const, requerida: true, min: 1, max: 5, texto: '¿Qué tan útil fue para tu formación o práctica?', minEtiqueta: 'Poco útil', maxEtiqueta: 'Muy útil' },
      { id: 'claridad', tipo: 'escala' as const, requerida: true, min: 1, max: 5, texto: '¿Qué tan claras fueron las explicaciones?', minEtiqueta: 'Poco claras', maxEtiqueta: 'Muy claras' },
      { id: 'aplicacion', tipo: 'opcion' as const, requerida: true, texto: '¿Cuándo crees que aplicarás lo aprendido?', opciones: [opcion('inmediato', 'En mi práctica de inmediato'), opcion('pronto', 'En los próximos meses'), opcion('formacion', 'Principalmente en mi formación'), opcion('sin_aplicacion', 'Aún no veo una aplicación clara')] },
      { id: 'recomendacion', tipo: 'escala' as const, requerida: true, min: 0, max: 10, texto: '¿Qué tan probable es que recomiendes este curso?', minEtiqueta: 'Nada probable', maxEtiqueta: 'Muy probable' },
      { id: 'mejora', tipo: 'texto' as const, requerida: false, max: 500, texto: '¿Qué deberíamos mejorar o agregar?', ayuda: 'Opcional. No incluyas datos de pacientes.' },
    ],
  },
  pulso: {
    clave: 'pulso-21-dias-v1', id: 'pulso-21-dias', version: 1, tipo: 'pulso' as const, prioridad: 60,
    titulo: '¿Cómo te está funcionando OdonTeck?', descripcion: 'Queremos comprobar que el club realmente te esté aportando valor.',
    preguntas: [
      { id: 'frecuencia', tipo: 'opcion' as const, requerida: true, texto: '¿Con qué frecuencia has usado el club?', opciones: [opcion('varias_semana', 'Varias veces por semana'), opcion('semanal', 'Una vez por semana'), opcion('ocasional', 'Algunas veces al mes'), opcion('casi_nunca', 'Casi no he podido usarlo')] },
      { id: 'valor', tipo: 'multiple' as const, requerida: true, max: 3, texto: '¿Qué te ha aportado más valor?', opciones: [opcion('cursos', 'Cursos'), opcion('materiales', 'Materiales clínicos'), opcion('quizzes', 'Quizzes y retos'), opcion('certificados', 'Certificados'), opcion('comunidad', 'Comunidad'), opcion('en_vivo', 'Sesiones en vivo')] },
      { id: 'obstaculo', tipo: 'opcion' as const, requerida: true, texto: '¿Qué te dificulta aprovecharlo más?', opciones: [opcion('tiempo', 'Falta de tiempo'), opcion('contenido', 'No encuentro el contenido que necesito'), opcion('navegacion', 'Me cuesta navegarlo'), opcion('costo', 'El costo'), opcion('tecnico', 'Un problema técnico'), opcion('ninguno', 'Nada por ahora'), opcion('otro', 'Otro motivo')] },
      { id: 'satisfaccion', tipo: 'escala' as const, requerida: true, min: 0, max: 10, texto: 'En general, ¿qué tan satisfecho estás?', minEtiqueta: 'Nada satisfecho', maxEtiqueta: 'Muy satisfecho' },
      { id: 'siguiente', tipo: 'texto' as const, requerida: false, max: 500, texto: '¿Qué contenido o mejora te haría volver más seguido?', ayuda: 'Opcional. No incluyas datos de pacientes.' },
    ],
  },
};

const ESTADO_KEY = 'odonteck-club:encuestas-estado:v1';
const RESPUESTAS_KEY = 'odonteck-club:encuestas-respuestas:v1';
const DIA = 864e5;
interface EstadoDemo { primeraVista: string; respondidas: string[]; pospuestas: Record<string, string> }
interface RespuestaDemo { clave: string; encuestaId: string; version: number; tipo: string; cursoId?: string | null; cursoTitulo?: string | null; respuestas: Record<string, unknown>; enviado: string }

const estado = { pendientes: [] as EncuestaPendiente[], cargado: false };
const leer = <T>(key: string, fallback: T): T => { try { return JSON.parse(localStorage.getItem(key) || '') as T; } catch { return fallback; } };
const guardar = (key: string, valor: unknown) => { try { localStorage.setItem(key, JSON.stringify(valor)); } catch {} };
const estadoDemo = (): EstadoDemo => {
  const previo = leer<EstadoDemo | null>(ESTADO_KEY, null);
  if (previo) return previo;
  const inicial = { primeraVista: new Date().toISOString(), respondidas: [], pospuestas: {} };
  guardar(ESTADO_KEY, inicial); return inicial;
};
const disponible = (e: EstadoDemo, clave: string) => !e.respondidas.includes(clave) && (!e.pospuestas[clave] || new Date(e.pospuestas[clave]).getTime() <= Date.now());

function pendientesDemo(): EncuestaPendiente[] {
  const e = estadoDemo();
  const salida: EncuestaPendiente[] = [];
  if (disponible(e, PLANTILLAS.bienvenida.clave)) salida.push(PLANTILLAS.bienvenida);
  for (const c of Progreso.completados()) {
    const clave = `${PLANTILLAS.curso.clave}--${c.id}`;
    if (disponible(e, clave)) salida.push({ ...PLANTILLAS.curso, clave, titulo: `${PLANTILLAS.curso.titulo}: ${c.titulo}`, cursoId: c.id, cursoTitulo: c.titulo });
  }
  if (Date.now() - new Date(e.primeraVista).getTime() >= 21 * DIA && disponible(e, PLANTILLAS.pulso.clave)) salida.push(PLANTILLAS.pulso);
  return salida.sort((a, b) => (b.prioridad || 0) - (a.prioridad || 0));
}

export async function cargarEncuestas(forzar = false) {
  if (estado.cargado && !forzar) return;
  if (Datos.modo === 'api') estado.pendientes = (await api<{ pendientes: EncuestaPendiente[] }>('/encuestas/pendientes')).pendientes;
  else estado.pendientes = pendientesDemo();
  estado.cargado = true;
}

export function encuestaPendiente() { return estado.pendientes[0] ?? null; }

export async function responderEncuesta(encuesta: EncuestaPendiente, respuestas: Record<string, unknown>) {
  if (Datos.modo === 'api') await api(`/encuestas/${encodeURIComponent(encuesta.clave)}/responder`, { method: 'POST', json: { respuestas } });
  else {
    const todas = leer<RespuestaDemo[]>(RESPUESTAS_KEY, []);
    todas.push({ clave: encuesta.clave, encuestaId: encuesta.id, version: encuesta.version, tipo: encuesta.tipo, cursoId: encuesta.cursoId, cursoTitulo: encuesta.cursoTitulo, respuestas, enviado: new Date().toISOString() });
    guardar(RESPUESTAS_KEY, todas);
    const e = estadoDemo(); e.respondidas = [...new Set([...e.respondidas, encuesta.clave])]; guardar(ESTADO_KEY, e);
  }
  await cargarEncuestas(true);
}

export async function posponerEncuesta(encuesta: EncuestaPendiente) {
  if (Datos.modo === 'api') await api(`/encuestas/${encodeURIComponent(encuesta.clave)}/posponer`, { method: 'POST' });
  else {
    const e = estadoDemo();
    const dias = encuesta.tipo === 'bienvenida' ? 3 : encuesta.tipo === 'curso' ? 7 : 14;
    e.pospuestas[encuesta.clave] = new Date(Date.now() + dias * DIA).toISOString(); guardar(ESTADO_KEY, e);
  }
  await cargarEncuestas(true);
}

export function reiniciarEncuestas() { estado.cargado = false; estado.pendientes = []; }

const porcentaje = (n: number, total: number) => total ? Math.round((n / total) * 1000) / 10 : 0;
export function resumenEncuestasDemo(): ResumenEncuestas {
  const docs = leer<RespuestaDemo[]>(RESPUESTAS_KEY, []);
  const plantillas = [PLANTILLAS.bienvenida, PLANTILLAS.curso, PLANTILLAS.pulso];
  const encuestas = plantillas.map((p) => {
    const grupo = docs.filter((d) => d.encuestaId === p.id && d.version === p.version);
    const preguntas: PreguntaResumenEncuesta[] = p.preguntas.map((q) => {
      const valores = grupo.map((d) => d.respuestas[q.id]).filter((v) => v !== undefined && v !== null && v !== '');
      const base = { id: q.id, texto: q.texto, tipo: q.tipo, total: valores.length };
      if (q.tipo === 'escala') return { ...base, promedio: valores.length ? Math.round(valores.map(Number).reduce((a, v) => a + v, 0) / valores.length * 10) / 10 : null, min: q.min, max: q.max };
      if (q.tipo === 'texto') return { ...base, comentarios: valores.map(String).slice(-12).reverse() };
      const planos = q.tipo === 'multiple' ? valores.flat() : valores;
      return { ...base, opciones: q.opciones!.map((o) => { const total = planos.filter((v) => v === o.valor).length; return { ...o, total, porcentaje: porcentaje(total, q.tipo === 'multiple' ? grupo.length : valores.length) }; }) };
    });
    return { id: p.id, tipo: p.tipo, titulo: p.titulo, version: p.version, total: grupo.length, preguntas };
  });
  const cursos = new Map<string, { cursoId: string; titulo: string; total: number; utilidad: number[]; recomendacion: number[] }>();
  docs.filter((d) => d.encuestaId === PLANTILLAS.curso.id).forEach((d) => {
    const id = d.cursoId || 'sin-curso'; const c = cursos.get(id) || { cursoId: id, titulo: d.cursoTitulo || id, total: 0, utilidad: [], recomendacion: [] };
    c.total++; if (Number.isInteger(d.respuestas.utilidad)) c.utilidad.push(Number(d.respuestas.utilidad)); if (Number.isInteger(d.respuestas.recomendacion)) c.recomendacion.push(Number(d.respuestas.recomendacion)); cursos.set(id, c);
  });
  const prom = (xs: number[]) => xs.length ? Math.round(xs.reduce((a, v) => a + v, 0) / xs.length * 10) / 10 : null;
  return { totalRespuestas: docs.length, encuestas, cursos: [...cursos.values()].map((c) => ({ cursoId: c.cursoId, titulo: c.titulo, total: c.total, utilidad: prom(c.utilidad), recomendacion: prom(c.recomendacion) })) };
}
