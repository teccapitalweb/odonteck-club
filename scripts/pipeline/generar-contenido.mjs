#!/usr/bin/env node
// Paso 4 · Genera títulos, notas y quizzes por clase, y la ficha de cada curso, con Claude.
import { avisoModo, ejecutar, escribirJson, leerArgs, leerCatalogo, leerInventario, leerJsonSiExiste, requerirEnv, rutas } from './lib/cli.mjs';
import { MODELO, PRECIO_USD_POR_MTOK, costoUsd } from './lib/contenido.mjs';
import { estimarCostoCurso, generarContenidoCurso, planCurso } from './lib/generar.mjs';
import { indicePorVideo } from './lib/inventario.mjs';

const AYUDA = `
generar-contenido.mjs · Por cada clase con transcripción pide a ${MODELO} un JSON con
  { titulo, resumen, conceptos: [{ t: 'mm:ss', texto }], preguntas: [{ q, opciones(4), correcta, explicacion }] }
y por curso { descripcion, aprenderas[5], nivel }. Valida y reintenta una vez con los errores.
Guarda out/contenido/<cursoId>.json (se guarda tras cada clase; volver a correr retoma lo pendiente).

Uso:
  node generar-contenido.mjs                        dry-run: estimación de tokens y costo, sin llamar a la API
  node generar-contenido.mjs --solo <cursoId>       limita a un curso
  node generar-contenido.mjs --apply                genera (con costo)

Opciones:
  --solo <cursoId>        solo ese curso
  --regenerar             ignora el contenido previo y vuelve a generar todo lo seleccionado
  --effort <nivel>        low | medium | high (por defecto) | xhigh | max
  --presupuesto <usd>     aborta antes de empezar si la estimación supera este monto
  --apply
  -h, --help

Variables: ANTHROPIC_API_KEY (solo con --apply)
Requiere: out/inventario.json y out/transcripciones/*.json

IMPORTANTE: el contenido es un BORRADOR. Un odontólogo debe revisar notas y quizzes en el admin antes de aprobar.
`;

ejecutar(async () => {
  const args = leerArgs({
    solo: { type: 'string' },
    regenerar: { type: 'boolean', default: false },
    effort: { type: 'string', default: 'high' },
    presupuesto: { type: 'string' },
  });
  if (args.help) return console.log(AYUDA);
  if (!['low', 'medium', 'high', 'xhigh', 'max'].includes(args.effort)) throw new Error(`--effort inválido: ${args.effort}`);
  avisoModo(args.aplicar);

  const catalogo = leerCatalogo();
  const inventarioIdx = indicePorVideo(leerInventario());
  const cursos = catalogo.cursos.filter((c) => !args.solo || c.id === args.solo);
  if (args.solo && !cursos.length) throw new Error(`No existe el curso ${args.solo} en el catálogo`);

  const leerTranscripcion = (videoId) => leerJsonSiExiste(rutas.transcripcion(videoId));
  const trabajos = [];
  let total = { entrada: 0, salida: 0 };
  console.log(`\nEstimación (${MODELO}: $${PRECIO_USD_POR_MTOK.entrada}/M entrada, $${PRECIO_USD_POR_MTOK.salida}/M salida; aproximada ±50 %):`);
  for (const curso of cursos) {
    const contenidoPrevio = args.regenerar ? null : leerJsonSiExiste(rutas.contenido(curso.id));
    const plan = planCurso({ curso, inventarioIdx, leerTranscripcion, contenidoPrevio, regenerar: args.regenerar });
    const pendienteCurso = plan.cursoPendiente || plan.pendientes.length > 0;
    const todasConTranscripcion = plan.sinTranscripcion.length === 0;
    const est = estimarCostoCurso({ curso, clasesPendientes: plan.pendientes, generarCursoTambien: pendienteCurso && todasConTranscripcion });
    total.entrada += est.entrada;
    total.salida += est.salida;
    console.log(`  ${curso.id}\n     clases a generar: ${plan.pendientes.length} · ya listas: ${plan.listas.length} · sin transcripción: ${plan.sinTranscripcion.length ? plan.sinTranscripcion.join(', ') : 0}` +
      `\n     ~${est.entrada.toLocaleString('es-MX')} tokens entrada · ~${est.salida.toLocaleString('es-MX')} salida · ~$${est.usd.toFixed(2)}`);
    if (plan.pendientes.length || (pendienteCurso && todasConTranscripcion)) trabajos.push({ curso, plan, contenidoPrevio });
  }
  const usdTotal = costoUsd(total);
  console.log(`\nTOTAL estimado: ~${total.entrada.toLocaleString('es-MX')} tokens entrada · ~${total.salida.toLocaleString('es-MX')} salida · ~$${usdTotal.toFixed(2)} USD`);

  if (args.presupuesto && usdTotal > Number(args.presupuesto)) throw new Error(`La estimación ($${usdTotal.toFixed(2)}) supera --presupuesto ${args.presupuesto}`);
  if (!args.aplicar) return console.log('\n(dry-run) No se llamó a la API. Repite con --apply para generar.');
  if (!trabajos.length) return console.log('\nNada pendiente.');

  requerirEnv('ANTHROPIC_API_KEY');
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const cliente = new Anthropic({ maxRetries: 4 });

  const real = { entrada: 0, salida: 0 };
  let conErrores = 0;
  for (const { curso, plan, contenidoPrevio } of trabajos) {
    console.log(`\n▶ ${curso.id}`);
    const r = await generarContenidoCurso({
      cliente, curso, plan, contenidoPrevio, effort: args.effort, log: console.log,
      guardar: (c) => escribirJson(rutas.contenido(curso.id), c),
    });
    real.entrada += r.usoUltimaCorrida.entrada;
    real.salida += r.usoUltimaCorrida.salida;
    if (r.errores.length) conErrores++;
    console.log(`  estado: ${r.estado} · errores: ${r.errores.length} · costo: $${r.usoUltimaCorrida.usd.toFixed(2)}`);
  }
  console.log(`\n✓ Costo real aproximado: $${costoUsd(real).toFixed(2)} USD (${real.entrada.toLocaleString('es-MX')} entrada, ${real.salida.toLocaleString('es-MX')} salida)`);
  console.log('Siguiente: node publicar-contenido.mjs (dry-run) y revisión clínica en el admin.');
  if (conErrores) process.exitCode = 1;
});
