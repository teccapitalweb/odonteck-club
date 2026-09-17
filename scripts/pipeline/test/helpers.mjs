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
    preguntas: [0, 1, 2, 3].map((i) => ({
      q: `¿Qué indica el hallazgo clínico ${i + 1} descrito en clase?`,
      opciones: ['Origen esquelético', 'Origen dental', 'Hábito de succión', 'Erupción ectópica'],
      correcta: i,
      explicacion: 'Así se explicó al comparar los trazos cefalométricos.',
    })),
    ...extra,
  };
}

export const cursoValido = (extra = {}) => ({
  descripcion: 'Aprende a identificar maloclusiones en la consulta general y a decidir cuándo derivar.',
  aprenderas: ['Leer una cefalometría lateral', 'Distinguir maloclusión dental y esquelética', 'Aplicar criterios de derivación', 'Explicar el diagnóstico al paciente', 'Registrar hallazgos ortodónticos'],
  nivel: 'Intermedio',
  ...extra,
});
