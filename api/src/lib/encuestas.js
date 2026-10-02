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
      { id: 'situacion', tipo: 'opcion', requerida: true, texto: '¿En qué etapa profesional te encuentras?', ayuda: 'Así ajustamos el nivel de lo que te recomendamos.', opciones: [
        opcion('estudiante', 'Estudiante de odontología'), opcion('pasante', 'Pasante o servicio social'),
        opcion('general', 'Odontólogo general'), opcion('especialista', 'Especialista'),
        opcion('docente', 'Docente o investigador'), opcion('otro', 'Otra etapa'),
      ] },
      { id: 'experiencia', tipo: 'opcion', requerida: true, texto: '¿Cuánta experiencia clínica tienes?', ayuda: 'Cuenta el tiempo atendiendo pacientes, dentro o fuera de la universidad.', opciones: [
        opcion('aun_estudio', 'Aún estoy estudiando'), opcion('menos_1', 'Menos de 1 año'),
        opcion('1_3', 'De 1 a 3 años'), opcion('4_7', 'De 4 a 7 años'), opcion('8_mas', '8 años o más'),
      ] },
      { id: 'como_conocio', tipo: 'opcion', requerida: true, texto: '¿Cómo conociste OdonTeck?', ayuda: 'Elige el lugar donde nos viste por primera vez.', opciones: [
        opcion('instagram', 'Instagram'), opcion('facebook', 'Facebook'), opcion('tiktok', 'TikTok'),
        opcion('google', 'Google'), opcion('whatsapp', 'WhatsApp'), opcion('colega', 'Colega o profesor'),
        opcion('evento', 'Curso o evento'), opcion('otro', 'Otro medio'),
      ] },
      { id: 'objetivo', tipo: 'opcion', requerida: true, texto: '¿Qué quieres lograr principalmente?', ayuda: 'Elige el que más pese hoy; después puedes explorar todo el club.', opciones: [
        opcion('practica', 'Mejorar mi práctica clínica'), opcion('actualizacion', 'Mantenerme actualizado'),
        opcion('certificacion', 'Obtener formación certificada'), opcion('posgrado', 'Prepararme para posgrado'),
        opcion('comunidad', 'Conectar con la comunidad'), opcion('recursos', 'Conseguir recursos clínicos'),
      ] },
      { id: 'intereses', tipo: 'multiple', requerida: true, max: 3, texto: '¿Qué áreas te interesan más?', ayuda: 'Con esto ordenamos los cursos que verás primero.', opciones: [
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
  pulso: Object.freeze({
    id: 'pulso-21-dias', version: 1, tipo: 'pulso', prioridad: 60, dias: 21,
    titulo: '¿Cómo te está funcionando OdonTeck?',
    descripcion: 'Queremos comprobar que el club realmente te esté aportando valor.',
    preguntas: [
      { id: 'frecuencia', tipo: 'opcion', requerida: true, texto: '¿Con qué frecuencia has usado el club?', opciones: [
        opcion('varias_semana', 'Varias veces por semana'), opcion('semanal', 'Una vez por semana'),
        opcion('ocasional', 'Algunas veces al mes'), opcion('casi_nunca', 'Casi no he podido usarlo'),
      ] },
      { id: 'valor', tipo: 'multiple', requerida: true, max: 3, texto: '¿Qué te ha aportado más valor?', opciones: [
        opcion('cursos', 'Cursos'), opcion('materiales', 'Materiales clínicos'), opcion('quizzes', 'Quizzes y retos'),
        opcion('certificados', 'Certificados'), opcion('comunidad', 'Comunidad'), opcion('en_vivo', 'Sesiones en vivo'),
      ] },
      { id: 'obstaculo', tipo: 'opcion', requerida: true, texto: '¿Qué te dificulta aprovecharlo más?', opciones: [
        opcion('tiempo', 'Falta de tiempo'), opcion('contenido', 'No encuentro el contenido que necesito'),
        opcion('navegacion', 'Me cuesta navegarlo'), opcion('costo', 'El costo'),
        opcion('tecnico', 'Un problema técnico'), opcion('ninguno', 'Nada por ahora'), opcion('otro', 'Otro motivo'),
      ] },
      { id: 'satisfaccion', tipo: 'escala', requerida: true, min: 0, max: 10, texto: 'En general, ¿qué tan satisfecho estás?', minEtiqueta: 'Nada satisfecho', maxEtiqueta: 'Muy satisfecho' },
      { id: 'siguiente', tipo: 'texto', requerida: false, max: 500, texto: '¿Qué contenido o mejora te haría volver más seguido?', ayuda: 'Opcional. No incluyas datos de pacientes.' },
    ],
  }),
});

export const claveBienvenida = () => `bienvenida-v${ENCUESTAS.bienvenida.version}`;
export const clavePulso = () => `pulso-21-dias-v${ENCUESTAS.pulso.version}`;
export const claveCurso = (cursoId) => `curso-final-v${ENCUESTAS.curso.version}--${cursoId}`;

export function plantillaPorClave(clave) {
  if (clave === claveBienvenida()) return ENCUESTAS.bienvenida;
  if (clave === clavePulso()) return ENCUESTAS.pulso;
  if (typeof clave === 'string' && clave.startsWith(`curso-final-v${ENCUESTAS.curso.version}--`)) return ENCUESTAS.curso;
  return null;
}

export function encuestaPublica(plantilla, { clave, cursoId = null, cursoTitulo = null } = {}) {
  return {
    clave, id: plantilla.id, version: plantilla.version, tipo: plantilla.tipo,
    titulo: plantilla.tipo === 'curso' && cursoTitulo ? `${plantilla.titulo}: ${cursoTitulo}` : plantilla.titulo,
    descripcion: plantilla.descripcion, cursoId, cursoTitulo, preguntas: plantilla.preguntas,
  };
}

export function validarRespuestas(plantilla, valor) {
  if (!esObjeto(valor)) throw invalido('Las respuestas deben enviarse como un objeto.');
  const permitidas = new Set(plantilla.preguntas.map((p) => p.id));
  for (const id of Object.keys(valor)) if (!permitidas.has(id)) throw invalido(`La pregunta "${id}" no pertenece a esta encuesta.`);
  const salida = {};
  for (const p of plantilla.preguntas) {
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
      const limpio = texto(v, { campo: p.texto, max: p.max ?? 500, multilinea: true });
      if (limpio) salida[p.id] = limpio;
    }
  }
  return salida;
}

const porcentaje = (n, total) => total ? Math.round((n / total) * 1000) / 10 : 0;

export function resumirEncuestas(respuestas) {
  const plantillas = [ENCUESTAS.bienvenida, ENCUESTAS.curso, ENCUESTAS.pulso];
  const encuestas = plantillas.map((plantilla) => {
    const docs = respuestas.filter((r) => r.encuestaId === plantilla.id && r.version === plantilla.version);
    const preguntas = plantilla.preguntas.map((p) => {
      const valores = docs.map((r) => r.respuestas?.[p.id]).filter((v) => v !== undefined && v !== null && v !== '');
      const base = { id: p.id, texto: p.texto, tipo: p.tipo, total: valores.length };
      if (p.tipo === 'escala') {
        const promedio = valores.length ? Math.round((valores.reduce((a, v) => a + Number(v), 0) / valores.length) * 10) / 10 : null;
        return { ...base, promedio, min: p.min, max: p.max };
      }
      if (p.tipo === 'texto') return { ...base, comentarios: valores.slice(-12).reverse() };
      const planos = p.tipo === 'multiple' ? valores.flat() : valores;
      return {
        ...base,
        opciones: p.opciones.map((o) => {
          const total = planos.filter((v) => v === o.valor).length;
          return { ...o, total, porcentaje: porcentaje(total, p.tipo === 'multiple' ? docs.length : valores.length) };
        }),
      };
    });
    return { id: plantilla.id, tipo: plantilla.tipo, titulo: plantilla.titulo, version: plantilla.version, total: docs.length, preguntas };
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
  const promedio = (xs) => xs.length ? Math.round((xs.reduce((a, v) => a + v, 0) / xs.length) * 10) / 10 : null;
  return {
    totalRespuestas: respuestas.length,
    encuestas,
    cursos: [...cursos.values()].map((c) => ({ cursoId: c.cursoId, titulo: c.titulo, total: c.total, utilidad: promedio(c.utilidad), recomendacion: promedio(c.recomendacion) })).sort((a, b) => b.total - a.total),
  };
}
