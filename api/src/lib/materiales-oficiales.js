// Lote de materiales propios aprobados para el primer lanzamiento.
// Debe coincidir 1:1 con el whitelist de `scripts/publish-owned-materials.mjs`.
//
// Mientras Firebase Storage no esté habilitado y Firestore `v2_materiales`
// esté vacío, estos registros se devuelven en /catalogo con estado
// "proximamente", para que los miembros vean el inventario próximo sin
// exponer PDFs ni URLs sin firmar. Cuando Storage quede listo y se corra
// `npm run publish:materials -- --apply`, Firestore se llena y este
// fallback deja de usarse automáticamente.

export const MATERIALES_OFICIALES = [
  {
    id: 'atlas-caries-icdas',
    titulo: 'Atlas de caries · Clasificación ICDAS',
    tipo: 'Libro',
    categoria: 'Guía clínica',
    area: 'Cariología',
    autor: 'Equipo académico OdonTeck',
    paginas: 7,
    portada: '/materiales/portadas/atlas-caries-icdas.webp',
    cursoId: 'diagnostico-y-clasificacion-de-la-caries-dental',
    descripcion: 'Códigos ICDAS 0–6 con fotografía clínica, radiografía y decisión de tratamiento por código.',
    gratis: true,
  },
  {
    id: 'guia-diagnostico-ortodoncico',
    titulo: 'Guía de bolsillo · Diagnóstico ortodóncico',
    tipo: 'Guía',
    categoria: 'Guía clínica',
    area: 'Ortodoncia',
    autor: 'Equipo académico OdonTeck',
    paginas: 10,
    portada: '/materiales/portadas/guia-diagnostico-ortodoncico.webp',
    cursoId: 'diagnostico-en-ortodoncia-para-odontologos-generales',
    descripcion: 'Checklist de exploración, tabla de clasificación de Angle con ejemplos fotográficos y formato de nota clínica listo para imprimir.',
  },
  {
    id: 'consentimiento-informado',
    titulo: 'Formato de consentimiento informado',
    tipo: 'Formato',
    categoria: 'Formato clínico',
    area: 'Medicina bucal',
    autor: 'Equipo académico OdonTeck',
    paginas: 2,
    portada: '/materiales/portadas/consentimiento-informado.webp',
    cursoId: null,
    descripcion: 'Formato editable para registrar riesgos, alternativas y aceptación del paciente antes de un procedimiento.',
  },
  {
    id: 'tabla-dosis-anestesicas',
    titulo: 'Tabla de dosis anestésicas',
    tipo: 'Guía',
    categoria: 'Referencia rápida',
    area: 'Medicina bucal',
    autor: 'Equipo académico OdonTeck',
    paginas: 2,
    portada: '/materiales/portadas/tabla-dosis-anestesicas.webp',
    cursoId: null,
    descripcion: 'Dosis máximas de lidocaína, mepivacaína y articaína por kg y por tipo de paciente.',
  },
  {
    id: 'protocolo-abscesos',
    titulo: 'Protocolo de manejo de abscesos periodontales',
    tipo: 'Protocolo',
    categoria: 'Protocolo clínico',
    area: 'Periodoncia',
    autor: 'Equipo académico OdonTeck',
    paginas: 4,
    portada: '/materiales/portadas/protocolo-abscesos.webp',
    cursoId: 'manejo-de-abscesos-periodontales',
    descripcion: 'Pasos de diagnóstico, drenaje, antibiótico cuando aplica y seguimiento.',
  },
  {
    id: 'guia-materiales-restauradores',
    titulo: 'Guía de selección de materiales restauradores',
    tipo: 'Guía',
    categoria: 'Guía clínica',
    area: 'Materiales',
    autor: 'Equipo académico OdonTeck',
    paginas: 5,
    portada: '/materiales/portadas/guia-materiales-restauradores.webp',
    cursoId: 'materiales-dentales-restauradores-indicaciones-y-usos',
    descripcion: 'Cuándo elegir resina, amalgama, vidrio ionómero o cerómero por indicación y zona.',
  },
  {
    id: 'manual-estratificacion-resinas',
    titulo: 'Manual de estratificación de resinas',
    tipo: 'Guía',
    categoria: 'Guía clínica',
    area: 'Estética',
    autor: 'Equipo académico OdonTeck',
    paginas: 8,
    portada: '/materiales/portadas/manual-estratificacion-resinas.webp',
    cursoId: 'resinas-compuestas-seleccion-manipulacion-y-tecnicas-de-estratificacion',
    descripcion: 'Capas y tonos para restauración estética con resina compuesta en anteriores.',
  },
  {
    id: 'checklist-urgencias-pediatricas',
    titulo: 'Checklist · Urgencias odontopediátricas',
    tipo: 'Guía',
    categoria: 'Referencia rápida',
    area: 'Odontopediatría',
    autor: 'Equipo académico OdonTeck',
    paginas: 3,
    portada: '/materiales/portadas/checklist-urgencias-pediatricas.webp',
    cursoId: 'traumatismos-dentales-en-ninos',
    descripcion: 'Pasos iniciales ante avulsión, luxación y fractura dental en niños.',
  },
  {
    id: 'guia-instrumentacion-endodontica',
    titulo: 'Guía de instrumentación endodóntica',
    tipo: 'Guía',
    categoria: 'Guía clínica',
    area: 'Endodoncia',
    autor: 'Equipo académico OdonTeck',
    paginas: 6,
    portada: '/materiales/portadas/guia-instrumentacion-endodontica.webp',
    cursoId: 'retroobturacion-en-endodoncia-tecnicas-y-materiales',
    descripcion: 'Secuencia de instrumentación manual y rotatoria con irrigación recomendada.',
  },
  {
    id: 'plantilla-nota-clinica-receta',
    titulo: 'Plantilla de nota clínica y receta',
    tipo: 'Formato',
    categoria: 'Formato clínico',
    area: 'Medicina bucal',
    autor: 'Equipo académico OdonTeck',
    paginas: 2,
    portada: '/materiales/portadas/plantilla-nota-clinica-receta.webp',
    cursoId: null,
    descripcion: 'Formato editable para nota clínica diaria y receta médica.',
  },
];

/**
 * Devuelve el lote de materiales oficiales marcados como "proximamente",
 * listos para servirse desde /catalogo cuando Firestore `v2_materiales` esté vacío.
 * NO incluye `url` ni `archivo` para no exponer PDFs sin firma de Storage.
 */
export function materialesOficialesComoProximamente() {
  return MATERIALES_OFICIALES.map((m) => ({
    ...m,
    estado: 'proximamente',
  }));
}
