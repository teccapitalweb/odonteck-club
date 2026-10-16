// Orientación profesional basada en preferencias declaradas. No es una prueba psicométrica
// ni mide aptitud clínica: sólo ordena señales para personalizar el aprendizaje en OdonTeck.
export const AREAS_BRUJULA = Object.freeze({
  diagnostico: 'Diagnóstico y cariología', ortodoncia: 'Ortodoncia', endodoncia: 'Endodoncia',
  restauradora: 'Odontología restauradora', estetica: 'Estética dental', cirugia: 'Cirugía bucal',
  periodoncia: 'Periodoncia', pediatria: 'Odontopediatría', rehabilitacion: 'Rehabilitación oral',
  medicina_bucal: 'Medicina bucal',
});

export const ESTILOS_BRUJULA = Object.freeze({
  analitico: 'Análisis clínico', manual: 'Precisión manual', comunicacion: 'Comunicación y confianza',
  planificacion: 'Planificación de largo plazo', urgencias: 'Resolución bajo presión', docencia: 'Docencia e investigación',
});

const P = Object.freeze({
  problema: {
    patrones: { a: ['diagnostico', 'medicina_bucal'], e: ['analitico'] },
    transformar: { a: ['restauradora', 'estetica'], e: ['manual'] },
    precision: { a: ['endodoncia', 'restauradora'], e: ['manual', 'analitico'] },
    plan: { a: ['ortodoncia', 'rehabilitacion'], e: ['planificacion'] },
  },
  jornada: {
    planificada: { a: ['ortodoncia', 'rehabilitacion'], e: ['planificacion'] },
    variada: { a: ['diagnostico', 'restauradora'], e: ['analitico', 'comunicacion'] },
    intensa: { a: ['cirugia', 'endodoncia'], e: ['urgencias', 'manual'] },
    acompanamiento: { a: ['pediatria', 'periodoncia'], e: ['comunicacion', 'planificacion'] },
  },
  detalle: {
    imagenes: { a: ['diagnostico', 'medicina_bucal'], e: ['analitico'] },
    simetria: { a: ['estetica', 'ortodoncia'], e: ['manual'] },
    tejidos: { a: ['periodoncia', 'medicina_bucal'], e: ['analitico'] },
    oclusion: { a: ['rehabilitacion', 'ortodoncia'], e: ['planificacion'] },
  },
  resultado: {
    dolor: { a: ['endodoncia', 'cirugia'], e: ['urgencias'] },
    sonrisa: { a: ['estetica', 'restauradora'], e: ['manual'] },
    crecimiento: { a: ['pediatria', 'ortodoncia'], e: ['comunicacion', 'planificacion'] },
    funcion: { a: ['rehabilitacion', 'periodoncia'], e: ['planificacion'] },
  },
  pacientes: {
    ninos: { a: ['pediatria'], e: ['comunicacion'] },
    ansiosos: { a: ['restauradora', 'endodoncia'], e: ['comunicacion'] },
    complejos: { a: ['diagnostico', 'medicina_bucal'], e: ['analitico'] },
    seguimiento: { a: ['periodoncia', 'rehabilitacion'], e: ['planificacion', 'comunicacion'] },
  },
  aprender: {
    casos: { a: ['diagnostico', 'medicina_bucal'], e: ['analitico'] },
    protocolos: { a: ['endodoncia', 'cirugia'], e: ['planificacion'] },
    simulacion: { a: ['restauradora', 'cirugia'], e: ['manual'] },
    visual: { a: ['estetica', 'ortodoncia'], e: ['manual'] },
    evidencia: { a: ['medicina_bucal', 'periodoncia'], e: ['docencia', 'analitico'] },
  },
  proyecto: {
    integral: { a: ['diagnostico', 'restauradora'], e: ['comunicacion'] },
    estudio: { a: ['estetica', 'rehabilitacion'], e: ['manual', 'planificacion'] },
    quirurgico: { a: ['cirugia', 'endodoncia'], e: ['urgencias', 'manual'] },
    academia: { a: ['medicina_bucal', 'pediatria'], e: ['docencia', 'comunicacion'] },
  },
});

const FORTALEZAS = Object.freeze({
  analisis: 'analitico', manos: 'manual', explicar: 'comunicacion', organizar: 'planificacion',
  presion: 'urgencias', investigar: 'docencia',
});

const sumar = (mapa, ids, valor = 1) => ids.forEach((id) => { mapa[id] = (mapa[id] || 0) + valor; });
const ordenar = (mapa, etiquetas, limite) => Object.entries(etiquetas)
  .map(([id, etiqueta]) => ({ id, etiqueta, puntaje: mapa[id] || 0 }))
  .sort((a, b) => b.puntaje - a.puntaje || a.etiqueta.localeCompare(b.etiqueta, 'es'))
  .slice(0, limite);

export function calcularBrujula(respuestas) {
  const areas = {};
  const estilos = {};
  for (const [pregunta, opciones] of Object.entries(P)) {
    const señal = opciones[respuestas?.[pregunta]];
    if (!señal) continue;
    sumar(areas, señal.a, 2);
    sumar(estilos, señal.e, 2);
  }
  for (const valor of Array.isArray(respuestas?.fortalezas) ? respuestas.fortalezas : []) {
    const estilo = FORTALEZAS[valor];
    if (estilo) sumar(estilos, [estilo], 2);
  }
  const topAreas = ordenar(areas, AREAS_BRUJULA, 3);
  const maxArea = Math.max(1, ...topAreas.map((x) => x.puntaje));
  return {
    version: 1,
    areas: topAreas.map((x) => ({ ...x, afinidad: Math.round((x.puntaje / maxArea) * 100) })),
    estilos: ordenar(estilos, ESTILOS_BRUJULA, 3),
    alcance: 'orientacion_no_diagnostica',
  };
}
