#!/usr/bin/env node
// Paso 5 · Publica out/contenido/*.json en v2_cursos (títulos, duracionMin, notas, ficha) y v2_quizzes (borrador).
import { basename } from 'node:path';
import { avisoModo, ejecutar, leerArgs, leerCatalogo, leerInventario, leerJson, listarJson, rutas } from './lib/cli.mjs';
import { abrirFirestore } from './lib/firestore.mjs';
import { indicePorVideo } from './lib/inventario.mjs';
import { cursoDesdeCatalogo, formatearPlan, idQuiz, planPublicacion } from './lib/publicar.mjs';

const AYUDA = `
publicar-contenido.mjs · Aplica out/contenido/*.json a Firestore.
  v2_cursos/{cursoId}: clases[].titulo, clases[].duracionMin (del inventario), clases[].notas { resumen, conceptos },
                       y descripcion/aprenderas/nivel si siguen siendo los provisionales.
  v2_quizzes/{cursoId}_{n}: { cursoId, n, estado: 'borrador', preguntas, generado }.

Uso:
  node publicar-contenido.mjs                   dry-run: imprime el diff contra Firestore
  node publicar-contenido.mjs --apply           escribe (una transacción por curso)

Opciones:
  --solo <cursoId>
  --crear-faltantes          crea v2_cursos/{id} desde catalogo.json (publicado: false) si no existe
  --reemplazar-titulos       sobreescribe títulos de clase editados a mano
  --reemplazar-notas         sobreescribe notas existentes
  --reemplazar-curso         sobreescribe descripcion/aprenderas/nivel ya editados
  --reemplazar-borradores    sobreescribe quizzes en 'borrador' (los 'aprobado' NUNCA se tocan)
  --sin-firestore            dry-run sin credenciales: compara contra catalogo.json y asume que no hay quizzes
  --apply
  -h, --help

Variables: FIREBASE_SERVICE_ACCOUNT (JSON en una línea o base64; proyecto club-odonteck)
Requiere: out/inventario.json, out/contenido/*.json
`;

ejecutar(async () => {
  const args = leerArgs({
    solo: { type: 'string' },
    'crear-faltantes': { type: 'boolean', default: false },
    'reemplazar-titulos': { type: 'boolean', default: false },
    'reemplazar-notas': { type: 'boolean', default: false },
    'reemplazar-curso': { type: 'boolean', default: false },
    'reemplazar-borradores': { type: 'boolean', default: false },
    'sin-firestore': { type: 'boolean', default: false },
  });
  if (args.help) return console.log(AYUDA);
  if (args.aplicar && args['sin-firestore']) throw new Error('--sin-firestore solo sirve en dry-run');
  avisoModo(args.aplicar);

  const opciones = {
    crearFaltantes: args['crear-faltantes'],
    reemplazarTitulos: args['reemplazar-titulos'],
    reemplazarNotas: args['reemplazar-notas'],
    reemplazarCurso: args['reemplazar-curso'],
    reemplazarBorradores: args['reemplazar-borradores'],
  };
  const catalogo = leerCatalogo();
  const porId = new Map(catalogo.cursos.map((c) => [c.id, c]));
  const inventarioIdx = indicePorVideo(leerInventario());
  const archivos = listarJson(rutas.dirContenido()).filter((f) => !args.solo || basename(f, '.json') === args.solo);
  if (!archivos.length) throw new Error('No hay archivos en out/contenido/ (corre generar-contenido.mjs --apply)');

  if (args['sin-firestore']) {
    console.log('⚠ Sin Firestore: el diff es contra catalogo.json y supone que no existen quizzes. No refleja producción.');
    for (const f of archivos) {
      const contenido = leerJson(f);
      const cat = porId.get(contenido.cursoId);
      const plan = planPublicacion({ cursoDoc: cat ? cursoDesdeCatalogo(cat) : null, catalogoCurso: cat, contenido, inventarioIdx, opciones });
      console.log(formatearPlan(plan));
    }
    return console.log('\n(dry-run) Nada escrito.');
  }

  const db = await abrirFirestore();
  const totales = { cursos: 0, quizzesCreados: 0, quizzesReemplazados: 0, aprobadosIntactos: 0 };
  for (const f of archivos) {
    const contenido = leerJson(f);
    if (contenido.estado !== 'completo') console.log(`\n⚠ ${contenido.cursoId}: contenido '${contenido.estado}', se publica lo disponible`);
    const cursoRef = db.collection('v2_cursos').doc(contenido.cursoId);
    const quizRefs = (contenido.clases ?? []).map((c) => db.collection('v2_quizzes').doc(idQuiz(contenido.cursoId, c.n)));

    // Transacción: se relee todo y se recalcula el plan dentro, así un quiz aprobado entre la lectura
    // y la escritura nunca se sobreescribe.
    const plan = await db.runTransaction(async (tx) => {
      const [cursoSnap, ...quizSnaps] = await tx.getAll(cursoRef, ...quizRefs);
      const quizzes = new Map(quizSnaps.filter((s) => s.exists).map((s) => [s.id, s.data()]));
      const p = planPublicacion({
        cursoDoc: cursoSnap.exists ? cursoSnap.data() : null,
        catalogoCurso: porId.get(contenido.cursoId), contenido, inventarioIdx, quizzes, opciones,
      });
      if (!args.aplicar) return p;
      if (p.docCurso) tx.create(cursoRef, p.docCurso);
      if (p.actualizacion) tx.update(cursoRef, p.actualizacion);
      for (const q of p.quizzes) {
        const ref = db.collection('v2_quizzes').doc(q.id);
        if (q.accion === 'crear') tx.create(ref, q.doc);
        if (q.accion === 'reemplazar') tx.set(ref, q.doc);
      }
      return p;
    }, args.aplicar ? {} : { readOnly: true });

    console.log(formatearPlan(plan));
    if (plan.docCurso || plan.actualizacion) totales.cursos++;
    totales.quizzesCreados += plan.quizzes.filter((q) => q.accion === 'crear').length;
    totales.quizzesReemplazados += plan.quizzes.filter((q) => q.accion === 'reemplazar').length;
    totales.aprobadosIntactos += plan.quizzes.filter((q) => q.accion === 'omitir-aprobado').length;
  }
  console.log(`\n${args.aplicar ? '✓ Escrito' : '(dry-run) Se escribiría'}: ${totales.cursos} cursos · ${totales.quizzesCreados} quizzes nuevos · ${totales.quizzesReemplazados} borradores reemplazados · ${totales.aprobadosIntactos} aprobados intactos`);
  if (args.aplicar) console.log('Los quizzes quedan en borrador: requieren revisión clínica en el admin antes de aprobarse.');
});
