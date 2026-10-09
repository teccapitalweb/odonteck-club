const DIA_MS = 24 * 60 * 60 * 1000;

export const estadoRetosVacio = (uid = '') => ({
  uid,
  xp: 0,
  quiz: { mejor: 0, mejorCombo: 0, jugados: 0, aciertos: 0, total: 0 },
  preguntas: {},
  dominio: {},
  actividad: { fecha: '', racha: 0, dias: [] },
  actualizado: null,
});

const numero = (valor, defecto = 0) => Number.isFinite(Number(valor)) ? Number(valor) : defecto;
const objeto = (valor) => valor && typeof valor === 'object' && !Array.isArray(valor) ? valor : {};

export function normalizarEstadoRetos(valor, uid = '') {
  const base = estadoRetosVacio(uid);
  const estado = objeto(valor);
  const quiz = objeto(estado.quiz);
  const actividad = objeto(estado.actividad);
  return {
    uid: uid || String(estado.uid || ''),
    xp: Math.max(0, numero(estado.xp)),
    quiz: {
      mejor: Math.max(0, numero(quiz.mejor)),
      mejorCombo: Math.max(0, numero(quiz.mejorCombo)),
      jugados: Math.max(0, numero(quiz.jugados)),
      aciertos: Math.max(0, numero(quiz.aciertos)),
      total: Math.max(0, numero(quiz.total)),
    },
    preguntas: objeto(estado.preguntas),
    dominio: objeto(estado.dominio),
    actividad: {
      fecha: typeof actividad.fecha === 'string' ? actividad.fecha : '',
      racha: Math.max(0, numero(actividad.racha)),
      dias: Array.isArray(actividad.dias) ? actividad.dias.filter((x) => typeof x === 'string').slice(-120) : [],
    },
    actualizado: typeof estado.actualizado === 'string' ? estado.actualizado : base.actualizado,
  };
}

export const hoyUTC = (ahora) => ahora.toISOString().slice(0, 10);

export function registrarActividad(actividad, ahora) {
  const actual = { ...estadoRetosVacio().actividad, ...objeto(actividad) };
  const hoy = hoyUTC(ahora);
  if (actual.fecha === hoy) return actual;
  const ayer = hoyUTC(new Date(ahora.getTime() - DIA_MS));
  const dias = [...new Set([...(Array.isArray(actual.dias) ? actual.dias : []), hoy])].slice(-120);
  return {
    fecha: hoy,
    racha: actual.fecha === ayer ? Math.max(0, numero(actual.racha)) + 1 : 1,
    dias,
  };
}

export function dominioPublico(dominio = {}) {
  return Object.entries(objeto(dominio)).map(([area, valor]) => {
    const d = objeto(valor);
    const aciertos = Math.max(0, numero(d.aciertos));
    const total = Math.max(0, numero(d.total));
    const precision = total ? Math.round(aciertos / total * 100) : 0;
    const estado = total < 3 ? 'Por explorar' : precision >= 80 ? 'Sólido' : precision >= 60 ? 'En progreso' : 'Por reforzar';
    return { area, aciertos, total, precision, estado, ultima: typeof d.ultima === 'string' ? d.ultima : null };
  }).sort((a, b) => a.precision - b.precision || b.total - a.total || a.area.localeCompare(b.area, 'es'));
}

export function estadoRetosPublico(valor, uid = '') {
  const e = normalizarEstadoRetos(valor, uid);
  return {
    xp: e.xp,
    quiz: {
      ...e.quiz,
      precision: e.quiz.total ? Math.round(e.quiz.aciertos / e.quiz.total * 100) : 0,
    },
    racha: e.actividad.racha,
    diasActivos: e.actividad.dias.length,
    dominio: dominioPublico(e.dominio),
    actualizado: e.actualizado,
  };
}

export const refPregunta = (cursoId, n, indice) => `${cursoId}_${n}_${indice}`;

export function prioridadPregunta(estado, item) {
  const previa = objeto(estado?.preguntas?.[item.ref]);
  const intentos = Math.max(0, numero(previa.intentos));
  const aciertos = Math.max(0, numero(previa.aciertos));
  if (!intentos) return -1;
  return aciertos / intentos;
}
