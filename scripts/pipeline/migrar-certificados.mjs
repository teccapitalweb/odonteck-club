#!/usr/bin/env node
// Paso 6 · Propone (y con --apply copia) los certificados viejos a v2_certificados conservando folioAnterior.
// Solo LEE `certificados` y `cursos` (colecciones del club actual); solo escribe en v2_certificados.
import { avisoModo, ejecutar, escribirJson, leerArgs, leerCatalogo, leerJson, rutas } from './lib/cli.mjs';
import { abrirFirestore } from './lib/firestore.mjs';
import { planMigracion } from './lib/certificados.mjs';

const AYUDA = `
migrar-certificados.mjs · Copia certificados/{folio} (panel viejo) → v2_certificados/{ODT-AAAA-NNNNN}.

Mapeo (inferido de vip-panel.html y verificar.html del club actual):
  folio (OdonTeck-AAAA-XXXXXX) → folioAnterior      uid, nombre → igual
  cursoId (id de la colección vieja 'cursos') → cursoId del catálogo nuevo (por id, título o videoIds)
  curso → cursoTitulo      area → area      sesiones → clases      emitido|createdAt → emitido (ISO)
  horas, instructor, year, createdAt → se descartan (no existen en el contrato v2)
Folio nuevo: ODT-<año de emisión>-<consecutivo de 5 dígitos>, continuando tras el mayor existente en v2.
Un solo certificado por usuario+curso (el más antiguo); los duplicados se reportan y no se copian.

Uso:
  node migrar-certificados.mjs                        dry-run contra Firestore (solo lecturas)
  node migrar-certificados.mjs --desde-json <f>       dry-run con un volcado local { certificados, cursos, v2_certificados }
  node migrar-certificados.mjs --apply                escribe con create() (nunca sobreescribe)

Opciones:
  --desde-json <archivo>   usa un volcado local en vez de Firestore (solo dry-run)
  --apply
  -h, --help

Variables: FIREBASE_SERVICE_ACCOUNT
Escribe siempre el reporte en out/reportes/migracion-certificados.json (local, sin datos nuevos en Firestore en dry-run).
`;

ejecutar(async () => {
  const args = leerArgs({ 'desde-json': { type: 'string' } });
  if (args.help) return console.log(AYUDA);
  if (args.aplicar && args['desde-json']) throw new Error('--desde-json solo sirve en dry-run');
  avisoModo(args.aplicar);

  const catalogo = leerCatalogo();
  let viejos, cursosViejos, v2Existentes, db;
  if (args['desde-json']) {
    const v = leerJson(args['desde-json']);
    const aDocs = (arr) => (arr ?? []).map((d) => ({ id: d.id ?? d.folio, data: d }));
    viejos = aDocs(v.certificados);
    cursosViejos = new Map(aDocs(v.cursos).map((d) => [d.id, d.data]));
    v2Existentes = aDocs(v.v2_certificados);
  } else {
    db = await abrirFirestore();
    const leer = async (col) => (await db.collection(col).get()).docs.map((d) => ({ id: d.id, data: d.data() }));
    [viejos, v2Existentes] = await Promise.all([leer('certificados'), leer('v2_certificados')]);
    cursosViejos = new Map((await leer('cursos')).map((d) => [d.id, d.data]));
  }

  const plan = planMigracion({ viejos, catalogo, cursosViejos, v2Existentes });
  console.log(`\nCertificados viejos: ${viejos.length} · v2 existentes: ${v2Existentes.length}`);
  console.log(`A migrar: ${plan.migrar.length} · ya migrados: ${plan.yaMigrados.length} · duplicados: ${plan.duplicados.length} · sin resolver curso: ${plan.sinResolver.length} · inválidos: ${plan.invalidos.length}`);
  for (const m of plan.migrar) console.log(`   + ${m.doc.folio} ← ${m.doc.folioAnterior}  ${m.doc.cursoId} (vía ${m.via})  ${m.doc.emitido.slice(0, 10)}`);
  for (const d of plan.duplicados) console.log(`   = ${d.folioAnterior}: ${d.motivo}`);
  for (const s of plan.sinResolver) console.log(`   ? ${s.folioAnterior}: no se encontró el curso (cursoId ${s.cursoIdAnterior}, "${s.curso}")`);
  for (const i of plan.invalidos) console.log(`   ✗ ${i.folioAnterior}: ${i.motivo}`);

  // El reporte local no incluye nombres para no dejar datos personales sueltos en disco.
  escribirJson(rutas.reporte('migracion-certificados.json'), {
    generado: new Date().toISOString(),
    modo: args.aplicar ? 'apply' : 'dry-run',
    migrar: plan.migrar.map((m) => ({ folio: m.doc.folio, folioAnterior: m.doc.folioAnterior, cursoId: m.doc.cursoId, cursoIdAnterior: m.cursoIdAnterior, via: m.via, emitido: m.doc.emitido })),
    yaMigrados: plan.yaMigrados, duplicados: plan.duplicados, sinResolver: plan.sinResolver, invalidos: plan.invalidos,
  });

  if (!args.aplicar) return console.log('\n(dry-run) Nada escrito en Firestore. Reporte en out/reportes/migracion-certificados.json');

  let escritos = 0;
  // Lotes de 400 con create(): si un folio ya existe el lote falla completo y no se sobreescribe nada.
  for (let i = 0; i < plan.migrar.length; i += 400) {
    const lote = db.batch();
    for (const m of plan.migrar.slice(i, i + 400)) lote.create(db.collection('v2_certificados').doc(m.doc.folio), m.doc);
    await lote.commit();
    escritos += Math.min(400, plan.migrar.length - i);
    console.log(`   ✓ ${escritos}/${plan.migrar.length}`);
  }
  console.log(`\n✓ Migrados ${escritos}. Recuerda: /verificar/:folio debe aceptar también folioAnterior para que los QR viejos sigan funcionando.`);
});
