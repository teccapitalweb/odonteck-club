// Utilidades de prueba: rutas de fixtures y constructores de datos válidos.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const DIR_FIXTURES = join(dirname(fileURLToPath(import.meta.url)), 'fixtures');
export const fixture = (nombre) => readFileSync(join(DIR_FIXTURES, nombre), 'utf8');
export const fixtureJson = (nombre) => JSON.parse(fixture(nombre));

/** Segmentos de transcripción de ~N minutos, un segmento cada 30 s. */
export function segmentosDePrueba(minutos = 10) {
  return Array.from({ length: minutos * 2 }, (_, i) => ({ inicio: i * 30, fin: i * 30 + 28, texto: `Explicación clínica número ${i + 1} sobre el diagnóstico.` }));
}

export function claseValida(extra = {}) {
  return {
    titulo: 'Análisis cefalométrico para detectar maloclusión clase II esquelética',
    resumen: 'Se explica cómo leer una cefalometría lateral para distinguir una maloclusión esquelética de una dental y cuándo derivar al ortodoncista.',
    conceptos: [
      { t: '00:30', texto: 'Diferencia entre maloclusión dental y esquelética' },
      { t: '02:00', texto: 'Ángulo ANB como referencia' },
      { t: '05:30', texto: 'Criterios de derivación' },
    ],
    preguntas: [
      { tipo: 'seleccion', q: '¿Qué hallazgo orienta primero a un origen esquelético?', instruccion: 'Elige una respuesta.', referenciaVideo: '00:30', casoClinico: 'La exploración plantea diferenciar un componente dental de uno esquelético.', competencia: 'Discriminar el origen de la maloclusión', nivelCognitivo: 'Aplicar', opciones: ['Relación de bases óseas', 'Color dental', 'Edad del expediente', 'Orden de fotografías'], correcta: 0, explicacion: 'La relación entre bases óseas permite diferenciar el componente esquelético del dental.' },
      { tipo: 'seleccion_multiple', q: '¿Qué datos deben integrarse antes de decidir la derivación?', instruccion: 'Elige todas las respuestas correctas.', referenciaVideo: '02:00', casoClinico: 'Debes integrar los datos disponibles antes de decidir una derivación.', competencia: 'Integrar evidencia diagnóstica', nivelCognitivo: 'Decidir', opciones: ['Hallazgo cefalométrico', 'Exploración clínica', 'Color del uniforme', 'Nombre del archivo'], correctas: [0, 1], explicacion: 'La decisión combina los hallazgos del estudio con la exploración clínica.' },
      { tipo: 'ordenar', q: 'Ordena la secuencia diagnóstica explicada.', instruccion: 'Coloca los pasos en orden.', referenciaVideo: '02:30', casoClinico: 'Organiza el flujo de valoración antes de emitir una conducta.', competencia: 'Secuenciar el razonamiento diagnóstico', nivelCognitivo: 'Analizar', elementos: [{ id: 'a', texto: 'Explorar al paciente' }, { id: 'b', texto: 'Interpretar el trazo' }, { id: 'c', texto: 'Decidir la derivación' }], ordenCorrecto: ['a', 'b', 'c'], explicacion: 'La secuencia parte de la exploración, integra el trazo y termina en la decisión.' },
      { tipo: 'relacionar', q: 'Relaciona cada elemento con su función clínica.', instruccion: 'Forma tres pares.', referenciaVideo: '05:30', casoClinico: 'Distingue la contribución de cada elemento al proceso diagnóstico.', competencia: 'Relacionar herramientas y funciones', nivelCognitivo: 'Analizar', izquierda: [{ id: 'a', texto: 'Exploración' }, { id: 'b', texto: 'Cefalometría' }, { id: 'c', texto: 'Derivación' }], derecha: [{ id: 'x', texto: 'Hallazgos clínicos' }, { id: 'y', texto: 'Relación esquelética' }, { id: 'z', texto: 'Manejo interdisciplinario' }], pares: { a: 'x', b: 'y', c: 'z' }, explicacion: 'Cada herramienta cumple una función distinta dentro de la decisión diagnóstica.' },
      { tipo: 'completar', q: 'Completa la síntesis del criterio diagnóstico.', instruccion: 'Escribe los conceptos faltantes.', referenciaVideo: '06:00', casoClinico: 'Sintetiza los componentes de una valoración integrada.', competencia: 'Construir una síntesis diagnóstica', nivelCognitivo: 'Aplicar', plantilla: 'La valoración integra [1] y [2].', huecos: [{ id: '1', etiqueta: 'Fuente clínica', respuestas: ['exploración clínica', 'exploracion clinica'] }, { id: '2', etiqueta: 'Estudio', respuestas: ['cefalometría', 'cefalometria'] }], explicacion: 'La valoración no depende de un dato aislado: integra exploración y cefalometría.' },
    ],
    ...extra,
  };
}

export const cursoValido = (extra = {}) => ({
  descripcion: 'Aprende a identificar maloclusiones en la consulta general y a decidir cuándo derivar.',
  aprenderas: ['Leer una cefalometría lateral', 'Distinguir maloclusión dental y esquelética', 'Aplicar criterios de derivación', 'Explicar el diagnóstico al paciente', 'Registrar hallazgos ortodónticos'],
  nivel: 'Intermedio',
  ...extra,
});
