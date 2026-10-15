import { Auth, api } from './auth';
import { Datos } from './datos';
import { Progreso } from './progreso';

export type TipoPreguntaEncuesta = 'opcion' | 'multiple' | 'escala' | 'texto';

export interface OpcionEncuesta { valor: string; etiqueta: string }
/** Condición para mostrar una pregunta: según otra respuesta (valores o tope numérico) o según el plan del miembro. */
export interface CondicionEncuesta { pregunta?: string; valores?: string[]; hasta?: number; vip?: boolean }
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
  corto?: boolean;
  mostrarSi?: CondicionEncuesta;
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
  aplicables?: number;
  condicional?: boolean;
  promedio?: number | null;
  min?: number;
  max?: number;
  nps?: number | null;
  promotores?: number;
  pasivos?: number;
  detractores?: number;
  opciones?: (OpcionEncuesta & { total: number; porcentaje: number })[];
  comentarios?: string[];
}
export interface PeriodoResumenEncuesta { periodo: string; total: number; nps: number | null; facilidad: number | null; calidad: number | null }
export interface ResumenEncuestas {
  totalRespuestas: number;
  plan?: 'vip' | 'gratis' | null;
  planes?: { vip: number; gratis: number; sinDato: number };
  encuestas: { id: string; tipo: string; titulo: string; version: number; total: number; preguntas: PreguntaResumenEncuesta[]; periodos?: PeriodoResumenEncuesta[] }[];
  cursos: { cursoId: string; titulo: string; total: number; utilidad: number | null; recomendacion: number | null }[];
}
export interface ContactoEncuesta { clave: string; enviado: string; correo: string; vip: boolean | null; recomendacion: number | null; motivo: string; mejora: string }

const opcion = (valor: string, etiqueta: string): OpcionEncuesta => ({ valor, etiqueta });
// Espejo de ENCUESTAS en api/src/lib/encuestas.js. Las plantillas se versionan en código para conservar preguntas comparables.
const PLANTILLAS = {
  bienvenida: {
    // Debe coincidir con ENCUESTAS.bienvenida de api/src/lib/encuestas.js. Se presenta como página propia (#/bienvenida).
    clave: 'bienvenida-v2', id: 'bienvenida', version: 2, tipo: 'bienvenida' as const, prioridad: 100,
    titulo: 'Ayúdanos a conocerte', descripcion: 'Son siete preguntas breves para recomendarte mejor contenido y entender a nuestra comunidad.',
    preguntas: [
      { id: 'situacion', tipo: 'opcion' as const, requerida: true, texto: '¿En qué etapa profesional te encuentras?', ayuda: 'Así sabemos a quién le hablamos.', opciones: [opcion('estudiante', 'Estudiante de odontología'), opcion('pasante', 'Pasante o servicio social'), opcion('general', 'Odontología general'), opcion('especialista', 'Especialista'), opcion('docente', 'Docencia o investigación'), opcion('otro', 'Otra etapa')] },
      { id: 'experiencia', tipo: 'opcion' as const, requerida: true, texto: '¿Cuánto tiempo llevas atendiendo pacientes?', ayuda: 'Cuenta también la clínica de la universidad.', opciones: [opcion('sin_pacientes', 'Todavía no atiendo pacientes'), opcion('menos_1', 'Menos de 1 año'), opcion('1_3', 'De 1 a 3 años'), opcion('4_7', 'De 4 a 7 años'), opcion('8_mas', '8 años o más')] },
      { id: 'como_conocio', tipo: 'opcion' as const, requerida: true, texto: '¿Cómo conociste OdonTeck?', ayuda: 'Elige el lugar donde nos viste por primera vez.', opciones: [opcion('instagram', 'Instagram'), opcion('facebook', 'Facebook'), opcion('tiktok', 'TikTok'), opcion('google', 'Google'), opcion('whatsapp', 'WhatsApp'), opcion('colega', 'Colega o profesor'), opcion('evento', 'Curso o evento'), opcion('otro', 'Otro medio')] },
      { id: 'objetivo', tipo: 'opcion' as const, requerida: true, texto: '¿Qué quieres lograr principalmente?', ayuda: 'Elige el que más pese hoy; después puedes explorar todo el club.', opciones: [opcion('practica', 'Mejorar mi práctica clínica'), opcion('actualizacion', 'Mantenerme al día'), opcion('certificacion', 'Obtener formación certificada'), opcion('posgrado', 'Prepararme para posgrado'), opcion('comunidad', 'Conectar con la comunidad'), opcion('recursos', 'Conseguir recursos clínicos')] },
      { id: 'intereses', tipo: 'multiple' as const, requerida: true, max: 3, texto: '¿Qué áreas te interesan más?', ayuda: 'Con esto ordenamos tu inicio y el catálogo "Para ti".', opciones: [opcion('diagnostico', 'Diagnóstico y cariología'), opcion('ortodoncia', 'Ortodoncia'), opcion('endodoncia', 'Endodoncia'), opcion('restauradora', 'Odontología restauradora'), opcion('estetica', 'Estética dental'), opcion('cirugia', 'Cirugía bucal'), opcion('periodoncia', 'Periodoncia'), opcion('pediatria', 'Odontopediatría'), opcion('rehabilitacion', 'Rehabilitación oral'), opcion('medicina_bucal', 'Medicina bucal')] },
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
  // Experiencia en la plataforma (espejo de ENCUESTAS.pulso): cómo le está funcionando el club, no sus gustos.
  // Sale a los 21 días o desde el día 7 con 8 clases; se repite cada 90 días (una clave por trimestre) y calla
  // tras 2 aplazamientos. `mostrarSi` oculta las preguntas que no aplican.
  pulso: {
    clave: 'experiencia-v2', id: 'experiencia', version: 2, tipo: 'pulso' as const, prioridad: 60,
    titulo: '¿Cómo te está funcionando el club?', descripcion: 'Ya llevas un tiempo con nosotros. Queremos saber qué te sirve, qué te estorba y qué te falta.',
    preguntas: [
      { id: 'uso', tipo: 'opcion' as const, requerida: true, texto: '¿Con qué frecuencia entras al club?', ayuda: 'Sin culpa: nos sirve para entender tu ritmo.', opciones: [opcion('varias_semana', 'Varias veces por semana'), opcion('semanal', 'Una vez por semana'), opcion('ocasional', 'Algunas veces al mes'), opcion('casi_nunca', 'Casi no he podido entrar')] },
      { id: 'dispositivo', tipo: 'opcion' as const, requerida: true, texto: '¿Desde dónde usas más el club?', opciones: [opcion('celular', 'Celular'), opcion('computadora', 'Computadora'), opcion('tablet', 'Tablet')] },
      { id: 'facilidad', tipo: 'escala' as const, requerida: true, min: 1, max: 5, texto: '¿Qué tan fácil es encontrar lo que buscas?', minEtiqueta: 'Difícil', maxEtiqueta: 'Muy fácil' },
      { id: 'tecnico', tipo: 'opcion' as const, requerida: true, texto: '¿Has tenido problemas técnicos?', opciones: [opcion('ninguno', 'Ninguno'), opcion('video', 'El video no carga'), opcion('lento', 'Va lento'), opcion('acceso', 'No puedo entrar'), opcion('otro', 'Otro problema')] },
      { id: 'tecnico_detalle', tipo: 'texto' as const, requerida: false, corto: true, max: 160, texto: '¿Nos cuentas cuál?', ayuda: 'Un renglón basta: qué pasó y en qué pantalla.', mostrarSi: { pregunta: 'tecnico', valores: ['video', 'lento', 'acceso', 'otro'] } },
      { id: 'calidad', tipo: 'escala' as const, requerida: true, min: 1, max: 5, texto: '¿Cómo calificas la calidad de los cursos y materiales?', minEtiqueta: 'Baja', maxEtiqueta: 'Excelente' },
      { id: 'duracion', tipo: 'opcion' as const, requerida: true, texto: 'La duración de las clases te parece…', opciones: [opcion('corta', 'Muy corta'), opcion('adecuada', 'Adecuada'), opcion('larga', 'Muy larga')] },
      { id: 'nivel', tipo: 'opcion' as const, requerida: true, texto: 'El nivel de los cursos para ti es…', opciones: [opcion('basico', 'Muy básico'), opcion('adecuado', 'Adecuado'), opcion('avanzado', 'Muy avanzado')] },
      { id: 'valor', tipo: 'multiple' as const, requerida: true, max: 3, texto: '¿Qué es lo que más te ha servido?', opciones: [opcion('cursos', 'Cursos'), opcion('materiales', 'Materiales clínicos'), opcion('quizzes', 'Quizzes y retos'), opcion('certificados', 'Certificados'), opcion('comunidad', 'Comunidad'), opcion('en_vivo', 'Sesiones en vivo')] },
      { id: 'sin_usar', tipo: 'multiple' as const, requerida: true, max: 6, texto: '¿Qué parte del club no has usado todavía?', ayuda: 'Nos dice qué no se está encontrando.', opciones: [opcion('materiales', 'Biblioteca de materiales'), opcion('quizzes', 'Quizzes y retos'), opcion('comunidad', 'Comunidad'), opcion('en_vivo', 'Sesiones en vivo'), opcion('certificados', 'Certificados'), opcion('ninguna', 'Ya usé todo')] },
      { id: 'falta', tipo: 'multiple' as const, requerida: true, max: 2, texto: '¿Qué te gustaría que agregáramos?', opciones: [opcion('mas_cursos', 'Más cursos'), opcion('casos', 'Casos clínicos'), opcion('en_vivo', 'Más sesiones en vivo'), opcion('descargas', 'Materiales descargables'), opcion('app', 'App para celular'), opcion('comunidad', 'Comunidad más activa'), opcion('avales', 'Constancias con aval')] },
      { id: 'recomendacion', tipo: 'escala' as const, requerida: true, min: 0, max: 10, texto: '¿Qué tan probable es que recomiendes OdonTeck Club a un colega?', minEtiqueta: 'Nada probable', maxEtiqueta: 'Muy probable' },
      { id: 'motivo', tipo: 'texto' as const, requerida: false, corto: true, max: 200, texto: '¿Qué fue lo principal para tu calificación?', ayuda: 'Nos ayuda a saber por dónde empezar.', mostrarSi: { pregunta: 'recomendacion', hasta: 6 } },
      { id: 'renovar', tipo: 'opcion' as const, requerida: true, texto: '¿Renovarías tu membresía VIP?', mostrarSi: { vip: true }, opciones: [opcion('si', 'Sí'), opcion('probablemente', 'Probablemente'), opcion('no_se', 'No lo sé'), opcion('no', 'No')] },
      { id: 'vip_que', tipo: 'opcion' as const, requerida: true, texto: '¿Qué te haría hacerte VIP?', mostrarSi: { vip: false }, opciones: [opcion('precio', 'Un mejor precio'), opcion('mas_cursos', 'Más cursos'), opcion('certificados', 'Certificados con más valor'), opcion('no_interesa', 'Por ahora no me interesa'), opcion('otro', 'Otra cosa')] },
      { id: 'contacto', tipo: 'opcion' as const, requerida: true, texto: '¿Podemos escribirte para entender mejor qué mejorar?', ayuda: 'Si aceptas, el equipo verá tu correo sólo para esto.', mostrarSi: { pregunta: 'recomendacion', hasta: 6 }, opciones: [opcion('si', 'Sí, escríbanme'), opcion('no', 'Prefiero que no')] },
      { id: 'mejora', tipo: 'texto' as const, requerida: false, max: 500, texto: '¿Qué cambiarías o mejorarías del club?', ayuda: 'Opcional. No incluyas datos de pacientes.' },
    ],
  },
};
const EXPERIENCIA = { dias: 21, clases: 8, diasMinimos: 7, repetirDias: 90, maxPosponer: 2 };
const periodoExperiencia = (ms: number) => { const d = new Date(ms); return `${d.getUTCFullYear()}T${Math.floor(d.getUTCMonth() / 3) + 1}`; };
const claveExperiencia = (ms = Date.now()) => `${PLANTILLAS.pulso.clave}--${periodoExperiencia(ms)}`;

/** Si una pregunta aplica según las respuestas previas y el plan (null = desconocido: aplica). Espejo de la API. */
export function preguntaAplica(p: PreguntaEncuesta, respuestas: Record<string, unknown>, vip: boolean | null): boolean {
  const c = p.mostrarSi;
  if (!c) return true;
  if (c.vip !== undefined) return vip === null ? true : vip === c.vip;
  const v = respuestas?.[c.pregunta!];
  if (v === undefined || v === null || v === '') return false;
  if (c.valores) return Array.isArray(v) ? v.some((x) => c.valores!.includes(String(x))) : c.valores.includes(String(v));
  if (c.hasta !== undefined) return Number(v) <= c.hasta;
  return true;
}

const ESTADO_KEY = 'odonteck-club:encuestas-estado:v1';
const RESPUESTAS_KEY = 'odonteck-club:encuestas-respuestas:v1';
const INTERESES_KEY = 'odonteck-club:intereses:v1';
const DIA = 864e5;
interface EstadoDemo { primeraVista: string; respondidas: string[]; pospuestas: Record<string, string>; veces?: Record<string, number> }
interface RespuestaDemo { clave: string; encuestaId: string; version: number; tipo: string; cursoId?: string | null; cursoTitulo?: string | null; vip?: boolean; correoContacto?: string; respuestas: Record<string, unknown>; enviado: string }

/** Lo que la entrevista inicial dijo del miembro (sin PII); alimenta las recomendaciones del club. */
export interface PerfilEncuesta { intereses?: string[]; objetivo?: string; formato?: string[]; situacion?: string; reto?: string }
const CAMPOS_PERFIL: (keyof PerfilEncuesta)[] = ['intereses', 'objetivo', 'formato', 'situacion', 'reto'];
const estado = { pendientes: [] as EncuestaPendiente[], respondidas: [] as string[], vip: null as boolean | null, perfil: null as PerfilEncuesta | null, cargado: false };
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
  const clave = claveExperiencia();
  const dias = (Date.now() - new Date(e.primeraVista).getTime()) / DIA;
  const ultima = leer<RespuestaDemo[]>(RESPUESTAS_KEY, []).filter((d) => d.encuestaId === PLANTILLAS.pulso.id).map((d) => new Date(d.enviado).getTime()).reduce((a, b) => Math.max(a, b), 0);
  const lista = dias >= EXPERIENCIA.dias || (dias >= EXPERIENCIA.diasMinimos && Progreso.totalVistas() >= EXPERIENCIA.clases);
  const repetible = !ultima || Date.now() - ultima >= EXPERIENCIA.repetirDias * DIA;
  const silenciada = (e.veces?.[clave] ?? 0) >= EXPERIENCIA.maxPosponer;
  if (lista && repetible && !silenciada && disponible(e, clave)) salida.push({ ...PLANTILLAS.pulso, clave });
  return salida.sort((a, b) => (b.prioridad || 0) - (a.prioridad || 0));
}

let cargando: Promise<void> | null = null;
let generacion = 0;
export async function cargarEncuestas(forzar = false) {
  if (estado.cargado && !forzar) return;
  if (!forzar && cargando) return cargando;
  const carga: Promise<void> = leerEncuestas().finally(() => { if (cargando === carga) cargando = null; });
  cargando = carga;
  return carga;
}

async function leerEncuestas() {
  if (Datos.modo === 'api') {
    const gen = generacion;
    const r = await api<{ pendientes: EncuestaPendiente[]; respondidas?: string[]; vip?: boolean; perfil?: PerfilEncuesta | null }>('/encuestas/pendientes');
    // Respuesta de una sesión anterior (cerró sesión y entró otra cuenta mientras estaba en vuelo).
    if (gen !== generacion) return;
    estado.pendientes = r.pendientes; estado.respondidas = r.respondidas ?? []; estado.vip = r.vip ?? null; estado.perfil = r.perfil ?? null;
  } else {
    estado.pendientes = pendientesDemo();
    estado.respondidas = estadoDemo().respondidas;
    estado.vip = Auth.usuario?.esVip ?? null;
    const bienvenida = leer<RespuestaDemo[]>(RESPUESTAS_KEY, []).filter((d) => d.encuestaId === PLANTILLAS.bienvenida.id).sort((a, b) => b.enviado.localeCompare(a.enviado))[0];
    const perfilInicial = bienvenida ? Object.fromEntries(CAMPOS_PERFIL.filter((k) => bienvenida.respuestas[k] !== undefined).map((k) => [k, bienvenida.respuestas[k]])) as PerfilEncuesta : null;
    const interesesActuales = leer<string[] | null>(INTERESES_KEY, null);
    estado.perfil = perfilInicial || interesesActuales
      ? { ...(perfilInicial ?? {}), ...(interesesActuales?.length ? { intereses: interesesActuales } : {}) }
      : null;
  }
  estado.cargado = true;
}

export function encuestaPendiente() { return estado.pendientes[0] ?? null; }
/** Plan del miembro al momento de contestar (para las preguntas condicionales por plan). */
export function esVipParaEncuestas() { return estado.vip ?? Auth.usuario?.esVip ?? null; }
/** Si ya respondió alguna versión/periodo de una encuesta (p. ej. 'experiencia'): alimenta el logro "Voz del club". */
/** Perfil de la entrevista inicial, o null si no la ha contestado. */
export function perfilEncuesta() { return estado.perfil; }
export function opcionesIntereses() {
  return PLANTILLAS.bienvenida.preguntas.find((p) => p.id === 'intereses')!.opciones!;
}
export async function guardarIntereses(intereses: string[]) {
  const validos = new Set(opcionesIntereses().map((o) => o.valor));
  if (intereses.length < 1 || intereses.length > 3) throw new Error('Elige entre 1 y 3 intereses.');
  if (new Set(intereses).size !== intereses.length || intereses.some((valor) => !validos.has(valor))) throw new Error('Hay intereses no válidos o repetidos.');
  let guardados = [...intereses];
  if (Datos.modo === 'api') {
    const r = await api<{ intereses: string[] }>('/me/intereses', { method: 'PATCH', json: { intereses } });
    guardados = r.intereses;
  } else guardar(INTERESES_KEY, guardados);
  estado.perfil = { ...(estado.perfil ?? {}), intereses: guardados };
  return guardados;
}
export function encuestaRespondida(id: string) { return estado.respondidas.some((c) => c === id || c.startsWith(`${id}-`)); }

export async function responderEncuesta(encuesta: EncuestaPendiente, respuestas: Record<string, unknown>) {
  if (Datos.modo === 'api') {
    const resultado = await api<{ recompensas?: { puntosGanados?: number; logrosNuevos?: { titulo?: string }[] } }>(`/encuestas/${encodeURIComponent(encuesta.clave)}/responder`, { method: 'POST', json: { respuestas } });
    if (resultado.recompensas?.puntosGanados || resultado.recompensas?.logrosNuevos?.length) {
      window.dispatchEvent(new CustomEvent('recompensas:ganadas', { detail: resultado.recompensas }));
    }
  }
  else {
    const todas = leer<RespuestaDemo[]>(RESPUESTAS_KEY, []);
    const vip = Auth.usuario?.esVip ?? false;
    const doc: RespuestaDemo = { clave: encuesta.clave, encuestaId: encuesta.id, version: encuesta.version, tipo: encuesta.tipo, cursoId: encuesta.cursoId, cursoTitulo: encuesta.cursoTitulo, vip, respuestas, enviado: new Date().toISOString() };
    if (respuestas.contacto === 'si' && Auth.usuario?.email) doc.correoContacto = Auth.usuario.email;
    todas.push(doc);
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
    e.pospuestas[encuesta.clave] = new Date(Date.now() + dias * DIA).toISOString();
    e.veces = { ...(e.veces ?? {}), [encuesta.clave]: (e.veces?.[encuesta.clave] ?? 0) + 1 };
    guardar(ESTADO_KEY, e);
  }
  await cargarEncuestas(true);
}

export function reiniciarEncuestas() { cargando = null; generacion++; estado.cargado = false; estado.pendientes = []; estado.respondidas = []; estado.vip = null; estado.perfil = null; }

// ── Resumen demo (espejo de resumirEncuestas en la API) ──
const porcentaje = (n: number, total: number) => total ? Math.round((n / total) * 1000) / 10 : 0;
const promedioDe = (xs: unknown[]) => xs.length ? Math.round(xs.map(Number).reduce((a, v) => a + v, 0) / xs.length * 10) / 10 : null;
export function calcularNps(valores: number[]) {
  const n = valores.length;
  if (!n) return { nps: null, promotores: 0, pasivos: 0, detractores: 0 };
  const promotores = valores.filter((v) => v >= 9).length;
  const detractores = valores.filter((v) => v <= 6).length;
  return { nps: Math.round(((promotores - detractores) / n) * 100), promotores, pasivos: n - promotores - detractores, detractores };
}

export function resumenEncuestasDemo(plan: 'vip' | 'gratis' | null = null): ResumenEncuestas {
  const todas = leer<RespuestaDemo[]>(RESPUESTAS_KEY, []);
  const docs = plan === 'vip' ? todas.filter((d) => d.vip === true) : plan === 'gratis' ? todas.filter((d) => d.vip === false) : todas;
  const plantillas = [PLANTILLAS.bienvenida, PLANTILLAS.curso, PLANTILLAS.pulso];
  const encuestas = plantillas.map((p) => {
    const grupo = docs.filter((d) => d.encuestaId === p.id && d.version === p.version);
    const preguntas: PreguntaResumenEncuesta[] = (p.preguntas as PreguntaEncuesta[]).map((q) => {
      const aplicables = grupo.filter((d) => preguntaAplica(q, d.respuestas, d.vip ?? null));
      const valores = aplicables.map((d) => d.respuestas[q.id]).filter((v) => v !== undefined && v !== null && v !== '');
      const base = { id: q.id, texto: q.texto, tipo: q.tipo, total: valores.length, aplicables: aplicables.length, condicional: Boolean(q.mostrarSi) };
      if (q.tipo === 'escala') return { ...base, promedio: promedioDe(valores), min: q.min, max: q.max, ...(q.min === 0 && q.max === 10 ? calcularNps(valores.map(Number)) : {}) };
      if (q.tipo === 'texto') return { ...base, comentarios: valores.map(String).slice(-12).reverse() };
      const planos = q.tipo === 'multiple' ? valores.flat() : valores;
      return { ...base, opciones: q.opciones!.map((o) => { const total = planos.filter((v) => v === o.valor).length; return { ...o, total, porcentaje: porcentaje(total, q.tipo === 'multiple' ? aplicables.length : valores.length) }; }) };
    });
    const salida: ResumenEncuestas['encuestas'][number] = { id: p.id, tipo: p.tipo, titulo: p.titulo, version: p.version, total: grupo.length, preguntas };
    if (p.tipo === 'pulso') {
      const porPeriodo = new Map<string, { periodo: string; total: number; recomendacion: number[]; facilidad: number[]; calidad: number[] }>();
      for (const d of grupo) {
        const periodo = d.clave.split('--')[1] || 'sin-periodo';
        const actual = porPeriodo.get(periodo) ?? { periodo, total: 0, recomendacion: [], facilidad: [], calidad: [] };
        actual.total++;
        for (const k of ['recomendacion', 'facilidad', 'calidad'] as const) if (Number.isInteger(d.respuestas[k])) actual[k].push(Number(d.respuestas[k]));
        porPeriodo.set(periodo, actual);
      }
      salida.periodos = [...porPeriodo.values()].sort((a, b) => b.periodo.localeCompare(a.periodo)).map((x) => ({ periodo: x.periodo, total: x.total, nps: calcularNps(x.recomendacion).nps, facilidad: promedioDe(x.facilidad), calidad: promedioDe(x.calidad) }));
    }
    return salida;
  });
  const cursos = new Map<string, { cursoId: string; titulo: string; total: number; utilidad: number[]; recomendacion: number[] }>();
  docs.filter((d) => d.encuestaId === PLANTILLAS.curso.id).forEach((d) => {
    const id = d.cursoId || 'sin-curso'; const c = cursos.get(id) || { cursoId: id, titulo: d.cursoTitulo || id, total: 0, utilidad: [], recomendacion: [] };
    c.total++; if (Number.isInteger(d.respuestas.utilidad)) c.utilidad.push(Number(d.respuestas.utilidad)); if (Number.isInteger(d.respuestas.recomendacion)) c.recomendacion.push(Number(d.respuestas.recomendacion)); cursos.set(id, c);
  });
  return {
    totalRespuestas: docs.length, plan,
    planes: { vip: todas.filter((d) => d.vip === true).length, gratis: todas.filter((d) => d.vip === false).length, sinDato: todas.filter((d) => d.vip !== true && d.vip !== false).length },
    encuestas,
    cursos: [...cursos.values()].map((c) => ({ cursoId: c.cursoId, titulo: c.titulo, total: c.total, utilidad: promedioDe(c.utilidad), recomendacion: promedioDe(c.recomendacion) })),
  };
}

export function contactosEncuestasDemo(): ContactoEncuesta[] {
  return leer<RespuestaDemo[]>(RESPUESTAS_KEY, []).filter((d) => d.encuestaId === PLANTILLAS.pulso.id && d.correoContacto)
    .sort((a, b) => b.enviado.localeCompare(a.enviado))
    .map((d) => ({ clave: d.clave, enviado: d.enviado, correo: d.correoContacto!, vip: d.vip ?? null, recomendacion: Number.isInteger(d.respuestas.recomendacion) ? Number(d.respuestas.recomendacion) : null, motivo: String(d.respuestas.motivo || ''), mejora: String(d.respuestas.mejora || '') }));
}
