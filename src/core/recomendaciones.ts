// Recomendaciones de cursos a partir de la entrevista inicial (intereses). Las usan la página de
// bienvenida, el inicio y el filtro "Para ti" del catálogo.
import { cursos, type Curso } from './catalogo';
import { perfilEncuesta } from './encuestas';

// Áreas del catálogo que corresponden a cada interés de la entrevista.
export const AREAS_POR_INTERES: Record<string, string[]> = {
  diagnostico: ['Cariología'], ortodoncia: ['Ortodoncia'], endodoncia: ['Endodoncia'], restauradora: ['Materiales', 'Estética'],
  estetica: ['Estética'], cirugia: ['Cirugía'], periodoncia: ['Periodoncia'], pediatria: ['Odontopediatría'],
  rehabilitacion: ['Estética'], medicina_bucal: ['Medicina bucal'],
};
export const ETIQUETA_INTERES: Record<string, string> = {
  diagnostico: 'Diagnóstico y cariología', ortodoncia: 'Ortodoncia', endodoncia: 'Endodoncia', restauradora: 'Odontología restauradora',
  estetica: 'Estética dental', cirugia: 'Cirugía bucal', periodoncia: 'Periodoncia', pediatria: 'Odontopediatría',
  rehabilitacion: 'Rehabilitación oral', medicina_bucal: 'Medicina bucal',
};

/** Intereses declarados primero y, después, señales de la Brújula. Nunca sustituye lo que eligió la persona. */
export const interesesDelMiembro = () => {
  const perfil = perfilEncuesta();
  return [...new Set([...(perfil?.intereses ?? []), ...(perfil?.brujula?.areas.map((a) => a.id) ?? [])])];
};

/** Cursos de las áreas de cada interés, tomando uno de cada interés por ronda para no cargar todo hacia el primero. */
export function cursosPorIntereses(intereses: string[], n = 3, { excluir = () => false }: { excluir?: (c: Curso) => boolean } = {}): Curso[] {
  const listas = intereses.map((v) => cursos.filter((c) => (AREAS_POR_INTERES[v] || []).includes(c.area) && !excluir(c)));
  const salida: Curso[] = [];
  for (let ronda = 0; salida.length < n && listas.some((l) => l[ronda]); ronda++) {
    for (const l of listas) if (l[ronda] && salida.length < n && !salida.includes(l[ronda])) salida.push(l[ronda]);
  }
  return salida;
}

/** "Ortodoncia, Endodoncia y Periodoncia" para encabezados. */
export function etiquetaIntereses(intereses: string[]) {
  const l = intereses.map((v) => ETIQUETA_INTERES[v] || v);
  return l.length <= 1 ? l.join('') : `${l.slice(0, -1).join(', ')} y ${l.at(-1)}`;
}
