// Genera api/content/academia/catalogo.json a partir del temario aprobado en docs/PLAN-ACADEMIA.md (sección 6).
// Formato que se lee de la sección 6 (hasta "## 7."):
//   **N. Título del programa** · <nivel en texto, p. ej. "Inicial a Intermedio"> · K módulos
//   1. Título del módulo
//   2. …
// El id, el área, la descripción y el público salen de META; si un programa no está en META se toman
// de la tabla de la sección 6 (| # | id | Área | Nivel | Público |) y la descripción queda vacía.
// Uso: node scripts/academia/generar-catalogo.mjs [--salida <ruta.json>] [--simular]
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = fileURLToPath(new URL('../../', import.meta.url));
const args = process.argv.slice(2);
const simular = args.includes('--simular');
const iSalida = args.indexOf('--salida');
const salida = iSalida >= 0 && args[iSalida + 1] ? resolve(args[iSalida + 1]) : resolve(raiz, 'api/content/academia/catalogo.json');
const plan = readFileSync(resolve(raiz, 'docs/PLAN-ACADEMIA.md'), 'utf8');

const META = {
  1: { id: 'anatomia-dental', area: 'Ciencias básicas', publico: ['estudiantes de odontología', 'pasantes', 'asistentes dentales', 'pacientes informados'],
    descripcion: 'Recorrido por la cavidad oral, sus tejidos, huesos, músculos, vasos y nervios, y por la anatomía de cada grupo dentario. Incluye odontogénesis, nomenclatura FDI, dentición temporal, oclusión y anatomía radiográfica, la base para todo lo demás.' },
  2: { id: 'caries-dental', area: 'Cariología', publico: ['estudiantes de odontología', 'pasantes', 'odontólogos generales', 'asistentes dentales', 'pacientes informados'],
    descripcion: 'La caries como enfermedad dinámica mediada por la biopelícula y los azúcares, y cómo prevenirla, detectarla y manejarla con criterios actuales. Recorre la evaluación de riesgo, ICDAS II, flúor, selladores, dieta, odontología mínimamente invasiva y la atención por etapas de la vida.' },
  3: { id: 'enfermedad-periodontal', area: 'Periodoncia', publico: ['estudiantes de odontología', 'pasantes', 'odontólogos generales', 'asistentes dentales'],
    descripcion: 'Del periodonto sano a la periodontitis con la clasificación 2017 de la AAP y la EFP. Enseña examen periodontal, estadificación y gradación, factores de riesgo, relación con la salud general, terapia no quirúrgica, mantenimiento y salud periimplantaria.' },
  4: { id: 'endodoncia', area: 'Endodoncia', publico: ['estudiantes de odontología', 'pasantes', 'odontólogos generales'],
    descripcion: 'Fundamentos del tratamiento de conductos, desde la biología pulpar y la anatomía interna hasta el diagnóstico, la terapia pulpar vital y las fases de limpieza, conformación y obturación. Cierra con pronóstico, retratamiento, traumatismos y criterios de referencia.' },
  5: { id: 'odontopediatria', area: 'Odontopediatría', publico: ['estudiantes de odontología', 'pasantes', 'odontólogos generales', 'asistentes dentales', 'pacientes informados'],
    descripcion: 'Salud bucal de bebés, niñas y niños: desarrollo de la dentición, primera visita, manejo de la conducta, prevención personalizada y caries de la infancia temprana. Incluye terapia pulpar y restauración de dientes temporales, hábitos, traumatismos y atención a necesidades especiales.' },
  6: { id: 'bioseguridad', area: 'Bioseguridad', publico: ['estudiantes de odontología', 'pasantes', 'odontólogos generales', 'asistentes dentales'],
    descripcion: 'Control de infecciones en el consultorio dental con base en la normativa mexicana y las guías internacionales. Cubre precauciones estándar, higiene de manos, equipo de protección, vacunación, punzocortantes, aerosoles, esterilización y su monitoreo, agua de la unidad, RPBI y protección radiológica.' },
};

const inicio = plan.search(/^## 6\./m);
const fin = plan.search(/^## 7\./m);
if (inicio < 0 || fin < inicio) throw new Error('No se encontró la sección "## 6." seguida de "## 7." en docs/PLAN-ACADEMIA.md');
const seccion = plan.slice(inicio, fin);

// Tabla opcional: | # | id | Área | Nivel | Público |
const tabla = new Map();
for (const fila of seccion.matchAll(/^\|\s*(\d+)\s*\|\s*`?([a-z0-9-]+)`?\s*\|([^|]*)\|([^|]*)\|([^|]*)\|\s*$/gm)) {
  tabla.set(Number(fila[1]), { id: fila[2], area: fila[3].trim(), nivel: fila[4].trim(), publico: fila[5].split(',').map((x) => x.trim()).filter(Boolean) });
}

const partes = seccion.split(/\n\*\*(\d+)\. /).slice(1);
const programas = [];
for (let i = 0; i < partes.length; i += 2) {
  const numero = Number(partes[i]);
  const cuerpo = partes[i + 1];
  const cierre = cuerpo.indexOf('**');
  const titulo = cuerpo.slice(0, cierre).trim();
  // Todo lo que va entre el primer "·" y "· K módulos" es el nivel, en texto libre.
  const cab = cuerpo.slice(cierre + 2).split('\n')[0].match(/^\s*·\s*(.+?)\s*·\s*(\d+)\s+módulos?/);
  if (!cab) throw new Error(`Programa ${numero}: la cabecera debe ser "**${numero}. Título** · nivel · K módulos"`);
  const modulos = [...cuerpo.matchAll(/^(\d+)\. (.+)$/gm)].map((m) => ({ n: Number(m[1]), titulo: m[2].trim() }));
  if (modulos.length !== Number(cab[2])) throw new Error(`Programa ${numero}: declara ${cab[2]} módulos y lista ${modulos.length}`);
  modulos.forEach((m, k) => { if (m.n !== k + 1) throw new Error(`Programa ${numero}: el módulo ${k + 1} está numerado como ${m.n}`); });
  const meta = META[numero] ?? tabla.get(numero);
  if (!meta?.id) throw new Error(`Programa ${numero}: falta su id en META o en la tabla de la sección 6`);
  programas.push({
    id: meta.id,
    numero,
    titulo,
    area: meta.area ?? tabla.get(numero)?.area ?? '',
    descripcion: meta.descripcion ?? '',
    nivel: cab[1],
    publico: meta.publico ?? tabla.get(numero)?.publico ?? [],
    portada: { id: `${meta.id}/portada`, proporcion: '16:9' },
    modulos,
  });
}
if (!programas.length) throw new Error('No se encontró ningún programa en la sección 6');
if (new Set(programas.map((p) => p.id)).size !== programas.length) throw new Error('Hay ids de programa repetidos');
const total = seccion.match(/Totales:\s*(\d+)\s*programas/);
if (total && Number(total[1]) !== programas.length) throw new Error(`El plan declara ${total[1]} programas y se leyeron ${programas.length}`);

const previo = existsSync(salida) ? JSON.parse(readFileSync(salida, 'utf8')) : null;
const catalogo = { version: previo?.version ?? 1, actualizado: new Date().toISOString().slice(0, 10), programas };
const resumen = `${programas.length} programas, ${programas.reduce((a, p) => a + p.modulos.length, 0)} módulos`;
if (simular) {
  const igual = previo && JSON.stringify(previo.programas) === JSON.stringify(programas);
  console.log(`Simulación: ${resumen}. ${previo ? (igual ? 'Coincide con el catálogo actual.' : 'DIFIERE del catálogo actual.') : 'No hay catálogo previo.'}`);
  process.exit(previo && !igual ? 1 : 0);
}
mkdirSync(dirname(salida), { recursive: true });
writeFileSync(salida, JSON.stringify(catalogo, null, 2) + '\n');
console.log(`catalogo.json: ${resumen} → ${salida}`);
