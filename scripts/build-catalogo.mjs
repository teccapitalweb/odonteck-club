// Genera src/data/catalogo.json a partir del catálogo Bunny del club actual.
// Provisional hasta la Fase 2 (los datos reales de área/ponente/portada vienen de Firestore).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const src = readFileSync('C:/dev/Odonteck/assets/odonteck-bunny-catalog.js', 'utf8');
globalThis.window = {};
new Function(src)();
const catalogo = globalThis.window.ODONTECK_BUNNY_CATALOG;

const AREAS = [
  ['Ortodoncia', /ortodoncia/i],
  ['Odontopediatría', /pedi[aá]tric|infancia|ni[ñn]os|odontopediatr/i],
  ['Periodoncia', /periodon|enc[ií]a|raspado|absceso/i],
  ['Endodoncia', /endodonc|canales radiculares|retroobturaci/i],
  ['Cirugía', /extracci|quir[uú]rg/i],
  ['Estética', /est[eé]tica|sonrisa|resinas|coronas/i],
  ['Materiales', /materiales/i],
  ['Medicina bucal', /sist[eé]micas|salud oral|patolog/i],
  ['Cariología', /caries/i],
];
const NIVEL = { 3: 'Básico', 4: 'Intermedio', 5: 'Intermedio' };
const slug = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const cursos = catalogo.map((c, i) => {
  const area = (AREAS.find(([, re]) => re.test(c.titulo)) || ['Odontología general'])[0];
  return {
    id: slug(c.titulo),
    titulo: c.titulo,
    area,
    nivel: NIVEL[c.sesiones.length] || 'Intermedio',
    instructor: 'Equipo OdonTeck',
    portada: `/cursos/curso-${String((i % 18) + 1).padStart(2, '0')}.webp`,
    descripcion: `Curso grabado de la membresía OdonTeck: ${c.titulo}. ${c.sesiones.length} clases con casos reales de consultorio.`,
    orden: i + 1,
    bunnyCollectionId: c.collectionId,
    clases: c.sesiones.map((s) => ({
      n: s.numero,
      titulo: s.titulo,
      videoId: s.videoId,
      duracion: null,
      gratis: s.numero === 1,
    })),
  };
});

mkdirSync('src/data', { recursive: true });
writeFileSync('src/data/catalogo.json', JSON.stringify({ libraryId: '725453', generado: new Date().toISOString(), cursos }, null, 2));
console.log(`${cursos.length} cursos, ${cursos.reduce((a, c) => a + c.clases.length, 0)} clases`);
