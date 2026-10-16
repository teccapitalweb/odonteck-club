import { invalido } from './errores.js';
import { entero, esObjeto, texto } from './validacion.js';

const opcion = (valor, etiqueta) => ({ valor, etiqueta });

export const ENCUESTAS = Object.freeze({
  bienvenida: Object.freeze({
    // v2: entrevista de siete pasos que el cliente presenta como página propia (#/bienvenida).
    id: 'bienvenida', version: 2, tipo: 'bienvenida', prioridad: 100,
    titulo: 'Ayúdanos a conocerte',
    descripcion: 'Son siete preguntas breves para recomendarte mejor contenido y entender a nuestra comunidad.',
    preguntas: [
      { id: 'situacion', tipo: 'opcion', requerida: true, texto: '¿En qué etapa profesional te encuentras?', ayuda: 'Así sabemos a quién le hablamos.', opciones: [
        opcion('estudiante', 'Estudiante de odontología'), opcion('pasante', 'Pasante o servicio social'),
        opcion('general', 'Odontología general'), opcion('especialista', 'Especialista'),
        opcion('docente', 'Docencia o investigación'), opcion('otro', 'Otra etapa'),
      ] },
      { id: 'experiencia', tipo: 'opcion', requerida: true, texto: '¿Cuánto tiempo llevas atendiendo pacientes?', ayuda: 'Cuenta también la clínica de la universidad.', opciones: [
        opcion('sin_pacientes', 'Todavía no atiendo pacientes'), opcion('menos_1', 'Menos de 1 año'),
        opcion('1_3', 'De 1 a 3 años'), opcion('4_7', 'De 4 a 7 años'), opcion('8_mas', '8 años o más'),
      ] },
      { id: 'como_conocio', tipo: 'opcion', requerida: true, texto: '¿Cómo conociste OdonTeck?', ayuda: 'Elige el lugar donde nos viste por primera vez.', opciones: [
        opcion('instagram', 'Instagram'), opcion('facebook', 'Facebook'), opcion('tiktok', 'TikTok'),
        opcion('google', 'Google'), opcion('whatsapp', 'WhatsApp'), opcion('colega', 'Colega o profesor'),
        opcion('evento', 'Curso o evento'), opcion('otro', 'Otro medio'),
      ] },
      { id: 'objetivo', tipo: 'opcion', requerida: true, texto: '¿Qué quieres lograr principalmente?', ayuda: 'Elige el que más pese hoy; después puedes explorar todo el club.', opciones: [
        opcion('practica', 'Mejorar mi práctica clínica'), opcion('actualizacion', 'Mantenerme al día'),
        opcion('certificacion', 'Obtener formación certificada'), opcion('posgrado', 'Prepararme para posgrado'),
        opcion('comunidad', 'Conectar con la comunidad'), opcion('recursos', 'Conseguir recursos clínicos'),
      ] },
      { id: 'intereses', tipo: 'multiple', requerida: true, max: 3, texto: '¿Qué áreas te interesan más?', ayuda: 'Con esto ordenamos tu inicio y el catálogo "Para ti".', opciones: [
        opcion('diagnostico', 'Diagnóstico y cariología'), opcion('ortodoncia', 'Ortodoncia'), opcion('endodoncia', 'Endodoncia'),
        opcion('restauradora', 'Odontología restauradora'), opcion('estetica', 'Estética dental'),
        opcion('cirugia', 'Cirugía bucal'), opcion('periodoncia', 'Periodoncia'), opcion('pediatria', 'Odontopediatría'),
        opcion('rehabilitacion', 'Rehabilitación oral'), opcion('medicina_bucal', 'Medicina bucal'),
      ] },
      { id: 'formato', tipo: 'multiple', requerida: true, max: 2, texto: '¿Cómo prefieres aprender?', ayuda: 'Nos ayuda a decidir qué producir primero.', opciones: [
        opcion('video', 'Clases cortas en video'), opcion('casos', 'Casos clínicos paso a paso'),
        opcion('en_vivo', 'Sesiones en vivo'), opcion('guias', 'Guías y protocolos'),
        opcion('quizzes', 'Quizzes y retos'),
      ] },
      { id: 'reto', tipo: 'opcion', requerida: true, texto: '¿Qué es lo que más te dificulta seguir formándote?', ayuda: 'Queremos quitar ese obstáculo, no sumar otro.', opciones: [
        opcion('tiempo', 'Falta de tiempo'), opcion('costo', 'El costo de los cursos'),
        opcion('confianza', 'Encontrar contenido confiable'), opcion('practica', 'Llevar la teoría a la práctica'),
        opcion('constancia', 'Mantener la constancia'), opcion('otro', 'Otro motivo'),
      ] },
    ],
  }),
  brujula: Object.freeze({
    id: 'brujula', version: 1, tipo: 'brujula', prioridad: 90,
    titulo: 'Descubre tu brújula profesional',
    descripcion: 'Explora qué áreas y formas de trabajo conectan mejor con lo que disfrutas. No hay respuestas correctas.',
    preguntas: [
      { id: 'problema', tipo: 'opcion', requerida: true, texto: '¿Qué tipo de problema disfrutas resolver más?', opciones: [opcion('patrones', 'Detectar patrones y llegar a un diagnóstico'), opcion('transformar', 'Transformar forma, función y apariencia'), opcion('precision', 'Resolver procedimientos de alta precisión'), opcion('plan', 'Construir un plan que evoluciona durante meses')] },
      { id: 'jornada', tipo: 'opcion', requerida: true, texto: 'Tu jornada ideal se parece más a…', opciones: [opcion('planificada', 'Casos planificados y seguimiento de largo plazo'), opcion('variada', 'Problemas distintos y decisiones clínicas variadas'), opcion('intensa', 'Intervenciones concretas y ritmo intenso'), opcion('acompanamiento', 'Acompañar, explicar y generar confianza')] },
      { id: 'detalle', tipo: 'opcion', requerida: true, texto: '¿Qué detalle suele captar primero tu atención?', opciones: [opcion('imagenes', 'Los patrones en imágenes y signos clínicos'), opcion('simetria', 'La simetría, proporción y color'), opcion('tejidos', 'El estado de tejidos y mucosas'), opcion('oclusion', 'La mordida, función y relación entre estructuras')] },
      { id: 'resultado', tipo: 'opcion', requerida: true, texto: '¿Qué resultado profesional te daría más satisfacción?', opciones: [opcion('dolor', 'Resolver dolor o una urgencia con seguridad'), opcion('sonrisa', 'Recuperar una sonrisa natural y armónica'), opcion('crecimiento', 'Guiar crecimiento, hábitos y desarrollo'), opcion('funcion', 'Devolver función estable a largo plazo')] },
      { id: 'pacientes', tipo: 'opcion', requerida: true, texto: '¿Con qué contexto te imaginas trabajando con mayor comodidad?', opciones: [opcion('ninos', 'Niñas, niños y sus familias'), opcion('ansiosos', 'Personas ansiosas que necesitan calma y claridad'), opcion('complejos', 'Casos complejos que requieren investigar'), opcion('seguimiento', 'Pacientes que requieren seguimiento constante')] },
      { id: 'fortalezas', tipo: 'multiple', requerida: true, max: 3, texto: '¿Qué fortalezas te gustaría usar más en tu carrera?', ayuda: 'Elige hasta tres.', opciones: [opcion('analisis', 'Analizar información'), opcion('manos', 'Trabajar con precisión manual'), opcion('explicar', 'Explicar y generar confianza'), opcion('organizar', 'Organizar planes y procesos'), opcion('presion', 'Decidir bajo presión'), opcion('investigar', 'Enseñar e investigar')] },
      { id: 'aprender', tipo: 'opcion', requerida: true, texto: '¿Cómo aprendes mejor algo clínico?', opciones: [opcion('casos', 'Comparando casos y diagnósticos'), opcion('protocolos', 'Siguiendo protocolos claros'), opcion('simulacion', 'Practicando técnicas y movimientos'), opcion('visual', 'Observando diseño, forma y resultados'), opcion('evidencia', 'Leyendo evidencia y discutiendo hallazgos')] },
      { id: 'proyecto', tipo: 'opcion', requerida: true, texto: '¿Qué proyecto futuro te emociona más?', opciones: [opcion('integral', 'Una consulta integral y resolutiva'), opcion('estudio', 'Un espacio enfocado en estética y rehabilitación'), opcion('quirurgico', 'Un entorno de procedimientos y urgencias'), opcion('academia', 'Combinar clínica, docencia e investigación')] },
    ],
  }),
  curso: Object.freeze({
    id: 'curso-final', version: 1, tipo: 'curso', prioridad: 80,
    titulo: 'Tu experiencia con el curso',
    descripcion: 'Tu opinión nos ayuda a conservar lo útil y mejorar la siguiente edición.',
    preguntas: [
      { id: 'utilidad', tipo: 'escala', requerida: true, min: 1, max: 5, texto: '¿Qué tan útil fue para tu formación o práctica?', minEtiqueta: 'Poco útil', maxEtiqueta: 'Muy útil' },
      { id: 'claridad', tipo: 'escala', requerida: true, min: 1, max: 5, texto: '¿Qué tan claras fueron las explicaciones?', minEtiqueta: 'Poco claras', maxEtiqueta: 'Muy claras' },
      { id: 'aplicacion', tipo: 'opcion', requerida: true, texto: '¿Cuándo crees que aplicarás lo aprendido?', opciones: [
        opcion('inmediato', 'En mi práctica de inmediato'), opcion('pronto', 'En los próximos meses'),
        opcion('formacion', 'Principalmente en mi formación'), opcion('sin_aplicacion', 'Aún no veo una aplicación clara'),
      ] },
      { id: 'recomendacion', tipo: 'escala', requerida: true, min: 0, max: 10, texto: '¿Qué tan probable es que recomiendes este curso?', minEtiqueta: 'Nada probable', maxEtiqueta: 'Muy probable' },
      { id: 'mejora', tipo: 'texto', requerida: false, max: 500, texto: '¿Qué deberíamos mejorar o agregar?', ayuda: 'Opcional. No incluyas datos de pacientes.' },
    ],
  }),
  // Experiencia en la plataforma: no pregunta gustos (eso es la bienvenida) sino cómo le está
  // funcionando el club a quien ya lo usó. Sale a los `dias` días de la primera visita, o antes
  // (desde `diasMinimos`) si ya vio `clases` clases; se repite cada `repetirDias` (clave por trimestre)
  // y deja de insistir tras `maxPosponer` aplazamientos. `mostrarSi` oculta preguntas que no aplican.
  pulso: Object.freeze({
    id: 'experiencia', version: 2, tipo: 'pulso', prioridad: 60,
    dias: 21, clases: 8, diasMinimos: 7, repetirDias: 90, maxPosponer: 2,
    titulo: '¿Cómo te está funcionando el club?',
    descripcion: 'Ya llevas un tiempo con nosotros. Queremos saber qué te sirve, qué te estorba y qué te falta.',
    preguntas: [
      { id: 'uso', tipo: 'opcion', requerida: true, texto: '¿Con qué frecuencia entras al club?', ayuda: 'Sin culpa: nos sirve para entender tu ritmo.', opciones: [
        opcion('varias_semana', 'Varias veces por semana'), opcion('semanal', 'Una vez por semana'),
        opcion('ocasional', 'Algunas veces al mes'), opcion('casi_nunca', 'Casi no he podido entrar'),
      ] },
      { id: 'dispositivo', tipo: 'opcion', requerida: true, texto: '¿Desde dónde usas más el club?', opciones: [
        opcion('celular', 'Celular'), opcion('computadora', 'Computadora'), opcion('tablet', 'Tablet'),
      ] },
      { id: 'facilidad', tipo: 'escala', requerida: true, min: 1, max: 5, texto: '¿Qué tan fácil es encontrar lo que buscas?', minEtiqueta: 'Difícil', maxEtiqueta: 'Muy fácil' },
      { id: 'tecnico', tipo: 'opcion', requerida: true, texto: '¿Has tenido problemas técnicos?', opciones: [
        opcion('ninguno', 'Ninguno'), opcion('video', 'El video no carga'), opcion('lento', 'Va lento'),
        opcion('acceso', 'No puedo entrar'), opcion('otro', 'Otro problema'),
      ] },
      { id: 'tecnico_detalle', tipo: 'texto', requerida: false, corto: true, max: 160, texto: '¿Nos cuentas cuál?', ayuda: 'Un renglón basta: qué pasó y en qué pantalla.', mostrarSi: { pregunta: 'tecnico', valores: ['video', 'lento', 'acceso', 'otro'] } },
      { id: 'calidad', tipo: 'escala', requerida: true, min: 1, max: 5, texto: '¿Cómo calificas la calidad de los cursos y materiales?', minEtiqueta: 'Baja', maxEtiqueta: 'Excelente' },
      { id: 'duracion', tipo: 'opcion', requerida: true, texto: 'La duración de las clases te parece…', opciones: [
        opcion('corta', 'Muy corta'), opcion('adecuada', 'Adecuada'), opcion('larga', 'Muy larga'),
      ] },
      { id: 'nivel', tipo: 'opcion', requerida: true, texto: 'El nivel de los cursos para ti es…', opciones: [
        opcion('basico', 'Muy básico'), opcion('adecuado', 'Adecuado'), opcion('avanzado', 'Muy avanzado'),
      ] },
      { id: 'valor', tipo: 'multiple', requerida: true, max: 3, texto: '¿Qué es lo que más te ha servido?', opciones: [
        opcion('cursos', 'Cursos'), opcion('materiales', 'Materiales clínicos'), opcion('quizzes', 'Quizzes y retos'),
        opcion('certificados', 'Certificados'), opcion('comunidad', 'Comunidad'), opcion('en_vivo', 'Sesiones en vivo'),
      ] },
      { id: 'sin_usar', tipo: 'multiple', requerida: true, max: 6, texto: '¿Qué parte del club no has usado todavía?', ayuda: 'Nos dice qué no se está encontrando.', opciones: [
        opcion('materiales', 'Biblioteca de materiales'), opcion('quizzes', 'Quizzes y retos'), opcion('comunidad', 'Comunidad'),
        opcion('en_vivo', 'Sesiones en vivo'), opcion('certificados', 'Certificados'), opcion('ninguna', 'Ya usé todo'),
      ] },
      { id: 'falta', tipo: 'multiple', requerida: true, max: 2, texto: '¿Qué te gustaría que agregáramos?', opciones: [
        opcion('mas_cursos', 'Más cursos'), opcion('casos', 'Casos clínicos'), opcion('en_vivo', 'Más sesiones en vivo'),
        opcion('descargas', 'Materiales descargables'), opcion('app', 'App para celular'),
        opcion('comunidad', 'Comunidad más activa'), opcion('avales', 'Constancias con aval'),
      ] },
      { id: 'recomendacion', tipo: 'escala', requerida: true, min: 0, max: 10, texto: '¿Qué tan probable es que recomiendes OdonTeck Club a un colega?', minEtiqueta: 'Nada probable', maxEtiqueta: 'Muy probable' },
      { id: 'motivo', tipo: 'texto', requerida: false, corto: true, max: 200, texto: '¿Qué fue lo principal para tu calificación?', ayuda: 'Nos ayuda a saber por dónde empezar.', mostrarSi: { pregunta: 'recomendacion', hasta: 6 } },
      { id: 'renovar', tipo: 'opcion', requerida: true, texto: '¿Renovarías tu membresía VIP?', mostrarSi: { vip: true }, opciones: [
        opcion('si', 'Sí'), opcion('probablemente', 'Probablemente'), opcion('no_se', 'No lo sé'), opcion('no', 'No'),
      ] },
      { id: 'vip_que', tipo: 'opcion', requerida: true, texto: '¿Qué te haría hacerte VIP?', mostrarSi: { vip: false }, opciones: [
        opcion('precio', 'Un mejor precio'), opcion('mas_cursos', 'Más cursos'), opcion('certificados', 'Certificados con más valor'),
        opcion('no_interesa', 'Por ahora no me interesa'), opcion('otro', 'Otra cosa'),
      ] },
      { id: 'contacto', tipo: 'opcion', requerida: true, texto: '¿Podemos escribirte para entender mejor qué mejorar?', ayuda: 'Si aceptas, el equipo verá tu correo sólo para esto.', mostrarSi: { pregunta: 'recomendacion', hasta: 6 }, opciones: [
        opcion('si', 'Sí, escríbanme'), opcion('no', 'Prefiero que no'),
      ] },
      { id: 'mejora', tipo: 'texto', requerida: false, max: 500, texto: '¿Qué cambiarías o mejorarías del club?', ayuda: 'Opcional. No incluyas datos de pacientes.' },
    ],
  }),
});

export const DIA_MS_ENCUESTAS = 864e5;
export const claveBienvenida = () => `bienvenida-v${ENCUESTAS.bienvenida.version}`;
export const claveBrujula = () => `brujula-v${ENCUESTAS.brujula.version}`;
export const claveCurso = (cursoId) => `curso-final-v${ENCUESTAS.curso.version}--${cursoId}`;
// Un trimestre por clave: así cada periodo cuenta como una encuesta nueva y el NPS se puede comparar en el tiempo.
export const periodoExperiencia = (ahoraMs) => { const d = new Date(ahoraMs); return `${d.getUTCFullYear()}T${Math.floor(d.getUTCMonth() / 3) + 1}`; };
export const clavePulso = (ahoraMs = Date.now()) => `${ENCUESTAS.pulso.id}-v${ENCUESTAS.pulso.version}--${periodoExperiencia(ahoraMs)}`;

// La encuesta de experiencia está lista cuando pasaron `dias` días, o desde `diasMinimos` si ya vio `clases` clases,
// y han pasado `repetirDias` desde la última vez que se respondió.
export function experienciaDisponible(primeraVistaMs, clasesVistas, ahoraMs, ultimaRespuestaMs = null) {
  if (primeraVistaMs === null || Number.isNaN(primeraVistaMs)) return false;
  const dias = (ahoraMs - primeraVistaMs) / DIA_MS_ENCUESTAS;
  const lista = dias >= ENCUESTAS.pulso.dias || (dias >= ENCUESTAS.pulso.diasMinimos && clasesVistas >= ENCUESTAS.pulso.clases);
  const repetible = ultimaRespuestaMs === null || Number.isNaN(ultimaRespuestaMs) || ahoraMs - ultimaRespuestaMs >= ENCUESTAS.pulso.repetirDias * DIA_MS_ENCUESTAS;
  return lista && repetible;
}

export function plantillaPorClave(clave) {
  if (clave === claveBienvenida()) return ENCUESTAS.bienvenida;
  if (clave === claveBrujula()) return ENCUESTAS.brujula;
  if (typeof clave !== 'string') return null;
  if (clave.startsWith(`${ENCUESTAS.pulso.id}-v${ENCUESTAS.pulso.version}--`)) return ENCUESTAS.pulso;
  if (clave.startsWith(`curso-final-v${ENCUESTAS.curso.version}--`)) return ENCUESTAS.curso;
  return null;
}

export function encuestaPublica(plantilla, { clave, cursoId = null, cursoTitulo = null } = {}) {
  return {
    clave, id: plantilla.id, version: plantilla.version, tipo: plantilla.tipo,
    titulo: plantilla.tipo === 'curso' && cursoTitulo ? `${plantilla.titulo}: ${cursoTitulo}` : plantilla.titulo,
    descripcion: plantilla.descripcion, cursoId, cursoTitulo, preguntas: plantilla.preguntas,
  };
}

/** Si una pregunta aplica según las respuestas previas y el plan (vip true/false; null = desconocido, cuenta como que aplica). */
export function preguntaAplica(p, respuestas, { vip = null } = {}) {
  const c = p.mostrarSi;
  if (!c) return true;
  if (c.vip !== undefined) return vip === null || vip === undefined ? true : Boolean(vip) === c.vip;
  const v = respuestas?.[c.pregunta];
  if (v === undefined || v === null || v === '') return false;
  if (c.valores) return Array.isArray(v) ? v.some((x) => c.valores.includes(x)) : c.valores.includes(v);
  if (c.hasta !== undefined) return Number(v) <= c.hasta;
  return true;
}

export function validarRespuestas(plantilla, valor, { vip = null } = {}) {
  if (!esObjeto(valor)) throw invalido('Las respuestas deben enviarse como un objeto.');
  const permitidas = new Set(plantilla.preguntas.map((p) => p.id));
  for (const id of Object.keys(valor)) if (!permitidas.has(id)) throw invalido(`La pregunta "${id}" no pertenece a esta encuesta.`);
  const salida = {};
  for (const p of plantilla.preguntas) {
    // Las preguntas que no aplican se ignoran aunque vengan contestadas: nunca se guardan.
    if (!preguntaAplica(p, valor, { vip })) continue;
    const v = valor[p.id];
    if (p.tipo === 'opcion') {
      if ((v === undefined || v === '') && !p.requerida) continue;
      const opciones = p.opciones.map((o) => o.valor);
      if (!opciones.includes(v)) throw invalido(`Selecciona una opción válida en "${p.texto}".`);
      salida[p.id] = v;
    } else if (p.tipo === 'multiple') {
      if ((!Array.isArray(v) || v.length === 0) && p.requerida) throw invalido(`Responde "${p.texto}".`);
      if (!Array.isArray(v)) continue;
      const unicas = [...new Set(v)];
      if (unicas.length > p.max) throw invalido(`En "${p.texto}" puedes elegir hasta ${p.max} opciones.`);
      const opciones = new Set(p.opciones.map((o) => o.valor));
      if (unicas.some((x) => typeof x !== 'string' || !opciones.has(x))) throw invalido(`Hay una opción inválida en "${p.texto}".`);
      salida[p.id] = unicas;
    } else if (p.tipo === 'escala') {
      salida[p.id] = entero(v, { campo: p.texto, min: p.min, max: p.max, requerido: p.requerida });
    } else if (p.tipo === 'texto') {
      const limpio = texto(v, { campo: p.texto, max: p.max ?? 500, multilinea: !p.corto });
      if (limpio) salida[p.id] = limpio;
    }
  }
  return salida;
}

/** Net Promoter Score de una escala 0-10: promotores (9-10) menos detractores (0-6), en puntos. */
export function calcularNps(valores) {
  const n = valores.length;
  if (!n) return { nps: null, promotores: 0, pasivos: 0, detractores: 0 };
  const promotores = valores.filter((v) => v >= 9).length;
  const detractores = valores.filter((v) => v <= 6).length;
  return { nps: Math.round(((promotores - detractores) / n) * 100), promotores, pasivos: n - promotores - detractores, detractores };
}

const porcentaje = (n, total) => total ? Math.round((n / total) * 1000) / 10 : 0;
const promedioDe = (xs) => xs.length ? Math.round((xs.reduce((a, v) => a + Number(v), 0) / xs.length) * 10) / 10 : null;

/** Filtra respuestas por plan del miembro al responder: 'vip', 'gratis' o todas. Las antiguas sin dato sólo cuentan en "todas". */
export function filtrarPorPlan(respuestas, plan) {
  if (plan === 'vip') return respuestas.filter((r) => r.vip === true);
  if (plan === 'gratis') return respuestas.filter((r) => r.vip === false);
  return respuestas;
}

/** Agregados sin PII. `plan` segmenta; `periodos` (sólo experiencia) permite comparar trimestres. */
export function resumirEncuestas(todas, { plan = null } = {}) {
  const respuestas = filtrarPorPlan(todas, plan);
  const plantillas = [ENCUESTAS.bienvenida, ENCUESTAS.brujula, ENCUESTAS.curso, ENCUESTAS.pulso];
  const encuestas = plantillas.map((plantilla) => {
    const docs = respuestas.filter((r) => r.encuestaId === plantilla.id && r.version === plantilla.version);
    const preguntas = plantilla.preguntas.map((p) => {
      // Base: sólo quienes vieron la pregunta (las condicionales no cuentan a quien no aplicaban).
      const aplicables = docs.filter((r) => preguntaAplica(p, r.respuestas, { vip: r.vip ?? null }));
      const valores = aplicables.map((r) => r.respuestas?.[p.id]).filter((v) => v !== undefined && v !== null && v !== '');
      const base = { id: p.id, texto: p.texto, tipo: p.tipo, total: valores.length, aplicables: aplicables.length, condicional: Boolean(p.mostrarSi) };
      if (p.tipo === 'escala') {
        const extra = p.min === 0 && p.max === 10 ? calcularNps(valores.map(Number)) : {};
        return { ...base, promedio: promedioDe(valores), min: p.min, max: p.max, ...extra };
      }
      if (p.tipo === 'texto') return { ...base, comentarios: valores.slice(-12).reverse() };
      const planos = p.tipo === 'multiple' ? valores.flat() : valores;
      return {
        ...base,
        opciones: p.opciones.map((o) => {
          const total = planos.filter((v) => v === o.valor).length;
          return { ...o, total, porcentaje: porcentaje(total, p.tipo === 'multiple' ? aplicables.length : valores.length) };
        }),
      };
    });
    const salida = { id: plantilla.id, tipo: plantilla.tipo, titulo: plantilla.titulo, version: plantilla.version, total: docs.length, preguntas };
    if (plantilla.tipo === 'pulso') {
      // Tendencia por trimestre: respuestas y NPS de cada periodo, del más reciente al más antiguo.
      const porPeriodo = new Map();
      for (const r of docs) {
        const periodo = String(r.clave || '').split('--')[1] || 'sin-periodo';
        const actual = porPeriodo.get(periodo) ?? { periodo, total: 0, recomendacion: [], facilidad: [], calidad: [] };
        actual.total += 1;
        for (const k of ['recomendacion', 'facilidad', 'calidad']) if (Number.isInteger(r.respuestas?.[k])) actual[k].push(r.respuestas[k]);
        porPeriodo.set(periodo, actual);
      }
      salida.periodos = [...porPeriodo.values()].sort((a, b) => b.periodo.localeCompare(a.periodo))
        .map((x) => ({ periodo: x.periodo, total: x.total, nps: calcularNps(x.recomendacion).nps, facilidad: promedioDe(x.facilidad), calidad: promedioDe(x.calidad) }));
    }
    return salida;
  });

  const cursos = new Map();
  for (const r of respuestas.filter((x) => x.encuestaId === ENCUESTAS.curso.id)) {
    const id = r.cursoId || 'sin-curso';
    const actual = cursos.get(id) ?? { cursoId: id, titulo: r.cursoTitulo || id, total: 0, utilidad: [], recomendacion: [] };
    actual.total += 1;
    if (Number.isInteger(r.respuestas?.utilidad)) actual.utilidad.push(r.respuestas.utilidad);
    if (Number.isInteger(r.respuestas?.recomendacion)) actual.recomendacion.push(r.respuestas.recomendacion);
    cursos.set(id, actual);
  }
  return {
    totalRespuestas: respuestas.length,
    plan: plan || null,
    planes: { vip: todas.filter((r) => r.vip === true).length, gratis: todas.filter((r) => r.vip === false).length, sinDato: todas.filter((r) => r.vip !== true && r.vip !== false).length },
    encuestas,
    cursos: [...cursos.values()].map((c) => ({ cursoId: c.cursoId, titulo: c.titulo, total: c.total, utilidad: promedioDe(c.utilidad), recomendacion: promedioDe(c.recomendacion) })).sort((a, b) => b.total - a.total),
  };
}

/** Miembros que pidieron que les escribamos tras calificar bajo: el único lugar donde aparece un correo, y sólo con su permiso. */
export function contactosEncuestas(respuestas) {
  return respuestas
    .filter((r) => r.encuestaId === ENCUESTAS.pulso.id && r.correoContacto)
    .sort((a, b) => String(b.enviado).localeCompare(String(a.enviado)))
    .map((r) => ({ clave: r.clave, enviado: r.enviado, correo: r.correoContacto, vip: r.vip ?? null, recomendacion: r.respuestas?.recomendacion ?? null, motivo: r.respuestas?.motivo ?? '', mejora: r.respuestas?.mejora ?? '' }));
}
