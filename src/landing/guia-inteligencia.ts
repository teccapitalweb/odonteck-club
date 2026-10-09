import type { CursoGuia } from './guia-datos';

export type ObjetivoGuia = 'actualizar' | 'resolver' | 'certificar' | 'explorar';
export type NivelGuia = 'Básico' | 'Intermedio' | 'Avanzado' | '';

export interface PerfilGuia {
  area: string;
  objetivo: ObjetivoGuia | '';
  nivel: NivelGuia;
}

const SINONIMOS: Record<string, string[]> = {
  Ortodoncia: ['ortodoncia', 'brackets', 'alineadores', 'oclusion', 'maloclusion'],
  Endodoncia: ['endodoncia', 'conductos', 'canales', 'retroobturacion', 'pulpar'],
  Odontopediatría: ['odontopediatria', 'pediatrica', 'pediatrico', 'ninos', 'infancia', 'traumatismo'],
  Cirugía: ['cirugia', 'extraccion', 'exodoncia', 'quirurgico', 'tercer molar'],
  Periodoncia: ['periodoncia', 'periodontal', 'encia', 'raspado', 'alisado', 'absceso'],
  Estética: ['estetica', 'sonrisa', 'resina', 'corona', 'puente', 'rehabilitacion'],
  Cariología: ['cariologia', 'caries', 'icdas'],
  Materiales: ['materiales', 'restaurador', 'restauradores', 'composites'],
  'Medicina bucal': ['medicina bucal', 'sistemica', 'sistemico', 'patologia oral'],
};

export function normalizarGuia(valor: string) {
  return valor.toLocaleLowerCase('es-MX').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

export function areaDesdeConsulta(consulta: string, cursos: CursoGuia[]) {
  const texto = normalizarGuia(consulta);
  const areas = [...new Set(cursos.map((curso) => curso.area).filter(Boolean))];
  return areas.find((area) => {
    const nombre = normalizarGuia(area);
    return texto.includes(nombre) || (SINONIMOS[area] || []).some((termino) => texto.includes(normalizarGuia(termino)));
  }) || '';
}

function palabrasClave(curso: CursoGuia) {
  return new Set(normalizarGuia(`${curso.titulo} ${curso.area} ${curso.descripcion} ${curso.nivel}`).split(' ').filter((p) => p.length > 3));
}

export function recomendarCursos(cursos: CursoGuia[], perfil: PerfilGuia, consulta = '', limite = 3) {
  const texto = normalizarGuia(consulta);
  const palabras = texto.split(' ').filter((p) => p.length > 3);
  const universo = perfil.area ? cursos.filter((curso) => curso.area === perfil.area) : cursos;
  return universo.map((curso, indice) => {
    let puntos = Math.max(0, 18 - indice) / 100;
    if (perfil.area && curso.area === perfil.area) puntos += 8;
    if (perfil.nivel && normalizarGuia(curso.nivel) === normalizarGuia(perfil.nivel)) puntos += 3;
    if (perfil.objetivo === 'explorar' && curso.accesoGratis) puntos += 3;
    if (perfil.objetivo === 'actualizar' && curso.nivel !== 'Básico') puntos += 1.5;
    if (perfil.objetivo === 'resolver' && /manejo|diagnostico|tratamiento|tecnicas/i.test(curso.titulo)) puntos += 1.5;
    const clave = palabrasClave(curso);
    for (const palabra of palabras) if (clave.has(palabra)) puntos += 2;
    return { curso, puntos };
  }).filter(({ puntos }) => puntos > .2 || (!perfil.area && !perfil.nivel && !consulta))
    .sort((a, b) => b.puntos - a.puntos)
    .slice(0, limite)
    .map(({ curso }) => curso);
}

export function razonRecomendacion(perfil: PerfilGuia) {
  const partes = [perfil.area, perfil.nivel ? `nivel ${perfil.nivel.toLocaleLowerCase('es-MX')}` : '', perfil.objetivo === 'explorar' ? 'opciones para comenzar' : ''].filter(Boolean);
  return partes.length ? `Elegidos por ${partes.join(' · ')}` : 'Selección destacada del catálogo';
}
