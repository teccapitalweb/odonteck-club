// generar-contenido con un cliente de Anthropic falso inyectado (sin red, sin llaves).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ErrorGeneracion, MODELO, estimarCostoCurso, formatearTranscripcion, generarClase, promptClase } from '../lib/contenido.mjs';
import { generarContenidoCurso, planCurso } from '../lib/generar.mjs';
import { claseValida, cursoValido, fixtureJson, segmentosDePrueba } from './helpers.mjs';

/** Doble del SDK: responde en orden con las respuestas dadas y registra las peticiones. */
function clienteFalso(respuestas) {
  const peticiones = [];
  return {
    peticiones,
    beta: {
      messages: {
        async create(params) {
          peticiones.push(params);
          const r = respuestas.shift();
          if (!r) throw new Error('el doble se quedó sin respuestas');
          if (r instanceof Error) throw r;
          return {
            model: r.model ?? MODELO,
            stop_reason: r.stop_reason ?? 'end_turn',
            stop_details: r.stop_details ?? null,
            content: [{ type: 'thinking', thinking: '' }, ...(r.texto !== undefined ? [{ type: 'text', text: r.texto }] : [])],
            usage: { input_tokens: 1000, output_tokens: 500 },
          };
        },
      },
    },
  };
}
const json = (o) => ({ texto: JSON.stringify(o) });

const catalogo = fixtureJson('catalogo-mini.json');
const curso = catalogo.cursos[0];
const transcripcion = { segmentos: segmentosDePrueba(10) };
const inventarioIdx = new Map([['v-1', { duracionSeg: 600 }], ['v-2', { duracionSeg: 600 }]]);

test('generarClase: petición bien formada y contenido limpio', async () => {
  const cliente = clienteFalso([json(claseValida({ titulo: '  Cefalometría lateral en la consulta general  ' }))]);
  const r = await generarClase(cliente, { curso, clase: curso.clases[0], totalClases: 2, transcripcion, duracionSeg: 600, effort: 'high' });
  assert.equal(r.intentos, 1);
  assert.equal(r.contenido.titulo, 'Cefalometría lateral en la consulta general');
  assert.equal(r.contenido.videoId, 'v-1');
  assert.equal(r.contenido.preguntas.length, 4);
  assert.deepEqual(r.uso, { entrada: 1000, salida: 500, llamadas: 1 });

  const p = cliente.peticiones[0];
  assert.equal(p.model, 'claude-opus-5');
  assert.deepEqual(p.thinking, { type: 'adaptive' });
  assert.equal(p.output_config.effort, 'high');
  assert.equal(p.output_config.format.type, 'json_schema');
  assert.equal(p.fallbacks, 'default');
  assert.ok(p.betas.includes('server-side-fallback-2026-07-01'));
  assert.equal(p.temperature, undefined, 'Opus 5 rechaza parámetros de muestreo');
  assert.match(p.system, /única fuente/);
  assert.match(p.messages[0].content, /\[00:30\] Explicación clínica número 2/);
  assert.match(p.messages[0].content, /Duración del video: 10:00/);
});

test('generarClase: reintenta una vez enviando los errores de validación', async () => {
  const mala = claseValida({ titulo: 'Clase 1', conceptos: [{ t: '99:00', texto: 'x' }, { t: '00:30', texto: 'y' }, { t: '01:00', texto: 'z' }] });
  const cliente = clienteFalso([json(mala), json(claseValida())]);
  const logs = [];
  const r = await generarClase(cliente, { curso, clase: curso.clases[0], totalClases: 2, transcripcion, duracionSeg: 600, log: (m) => logs.push(m) });
  assert.equal(r.intentos, 2);
  assert.deepEqual(r.uso, { entrada: 2000, salida: 1000, llamadas: 2 });
  const segundo = cliente.peticiones[1].messages[0].content;
  assert.match(segundo, /no pasó la validación/);
  assert.match(segundo, /Clase N/);
  assert.match(segundo, /fuera de la duración/);
  assert.match(segundo, /<respuesta_anterior>/);
  assert.equal(cliente.peticiones[1].messages.length, 1, 'el reintento es un solo turno de usuario');
  assert.ok(logs.some((l) => /intento 1 inválido/.test(l)));
});

test('generarClase: JSON roto dos veces → ErrorGeneracion con errores', async () => {
  const cliente = clienteFalso([{ texto: '{no es json' }, { texto: '' }]);
  await assert.rejects(
    generarClase(cliente, { curso, clase: curso.clases[0], totalClases: 2, transcripcion, duracionSeg: 600 }),
    (e) => e instanceof ErrorGeneracion && /JSON válido/.test(e.errores[0]) && e.uso.llamadas === 2,
  );
});

test('generarClase: max_tokens cuenta como intento fallido', async () => {
  const cliente = clienteFalso([{ stop_reason: 'max_tokens', texto: '{"titulo":' }, json(claseValida())]);
  const r = await generarClase(cliente, { curso, clase: curso.clases[0], totalClases: 2, transcripcion, duracionSeg: 600 });
  assert.equal(r.intentos, 2);
});

test('generarClase: negativa del modelo no se reintenta', async () => {
  const cliente = clienteFalso([{ stop_reason: 'refusal', stop_details: { category: 'bio' } }]);
  await assert.rejects(generarClase(cliente, { curso, clase: curso.clases[0], totalClases: 2, transcripcion, duracionSeg: 600 }), /se negó.*bio/);
  assert.equal(cliente.peticiones.length, 1);
});

test('generarClase: transcripción vacía no llama a la API', async () => {
  const cliente = clienteFalso([]);
  await assert.rejects(generarClase(cliente, { curso, clase: curso.clases[0], totalClases: 2, transcripcion: { segmentos: [] } }), /vacía/);
  assert.equal(cliente.peticiones.length, 0);
});

test('generarContenidoCurso: clases + ficha, guardado incremental y orden', async () => {
  const cliente = clienteFalso([json(claseValida({ titulo: 'Tema A' })), json(claseValida({ titulo: 'Tema B' })), json(cursoValido())]);
  const plan = planCurso({ curso, inventarioIdx, leerTranscripcion: () => transcripcion });
  assert.equal(plan.pendientes.length, 2);
  const guardados = [];
  const r = await generarContenidoCurso({ cliente, curso, plan, guardar: (c) => guardados.push(structuredClone(c)), ahora: () => new Date('2026-09-17T00:00:00Z') });
  assert.equal(r.estado, 'completo');
  assert.deepEqual(r.clases.map((c) => [c.n, c.titulo]), [[1, 'Tema A'], [2, 'Tema B']]);
  assert.deepEqual(r.curso, cursoValido());
  assert.equal(r.errores.length, 0);
  assert.equal(r.usoUltimaCorrida.llamadas, 3);
  assert.equal(r.usoUltimaCorrida.usd, (3000 / 1e6) * 5 + (1500 / 1e6) * 25);
  assert.equal(guardados.length, 3, 'guarda tras cada clase y al final');
  assert.equal(guardados[0].estado, 'parcial');
  // La ficha del curso recibe los resúmenes de las clases.
  assert.match(cliente.peticiones[2].messages[0].content, /1\. Tema A/);
  assert.match(cliente.peticiones[2].system, /exactamente 5/);
});

test('generarContenidoCurso: una clase falla → estado parcial, sin ficha, no detiene las demás', async () => {
  const mala = json({ titulo: 'x' });
  const cliente = clienteFalso([mala, mala, json(claseValida({ titulo: 'Tema B' }))]);
  const plan = planCurso({ curso, inventarioIdx, leerTranscripcion: () => transcripcion });
  const r = await generarContenidoCurso({ cliente, curso, plan });
  assert.equal(r.estado, 'parcial');
  assert.equal(r.curso, null);
  assert.deepEqual(r.clases.map((c) => c.n), [2]);
  assert.equal(r.errores[0].n, 1);
  assert.equal(cliente.peticiones.length, 3, 'no se genera la ficha sin todas las clases');
});

test('generarContenidoCurso: errores de API (no de validación) detienen el curso', async () => {
  const cliente = clienteFalso([new Error('429 rate limit')]);
  const plan = planCurso({ curso, inventarioIdx, leerTranscripcion: () => transcripcion });
  await assert.rejects(generarContenidoCurso({ cliente, curso, plan }), /429/);
});

test('planCurso retoma: reutiliza clases previas y solo genera lo faltante', async () => {
  const previo = { clases: [{ n: 1, videoId: 'v-1', titulo: 'Tema A', resumen: 'r', conceptos: [], preguntas: [] }], curso: null };
  const leer = (id) => (id === 'v-2' ? transcripcion : id === 'v-1' ? transcripcion : null);
  const plan = planCurso({ curso, inventarioIdx, leerTranscripcion: leer, contenidoPrevio: previo });
  assert.deepEqual(plan.listas.map((c) => c.n), [1]);
  assert.deepEqual(plan.pendientes.map((p) => p.clase.n), [2]);
  assert.equal(plan.cursoPendiente, true);
  const regenerar = planCurso({ curso, inventarioIdx, leerTranscripcion: leer, contenidoPrevio: previo, regenerar: true });
  assert.equal(regenerar.pendientes.length, 2);
  const sinT = planCurso({ curso, inventarioIdx, leerTranscripcion: (id) => (id === 'v-1' ? transcripcion : null) });
  assert.deepEqual(sinT.sinTranscripcion, [2]);
});

test('formatearTranscripcion agrupa por ventana con marcas reales', () => {
  const t = formatearTranscripcion([
    { inicio: 0, fin: 5, texto: 'uno' }, { inicio: 6, fin: 10, texto: 'dos' }, { inicio: 21, fin: 25, texto: 'tres' }, { inicio: 3600, fin: 3605, texto: 'cuatro' },
  ]);
  assert.equal(t, '[00:00] uno dos\n[00:21] tres\n[60:00] cuatro');
});

test('estimarCostoCurso da tokens y costo positivos proporcionales a la transcripción', () => {
  const corta = estimarCostoCurso({ curso, clasesPendientes: [{ clase: curso.clases[0], transcripcion: { segmentos: segmentosDePrueba(5) }, duracionSeg: 300 }] });
  const larga = estimarCostoCurso({ curso, clasesPendientes: [{ clase: curso.clases[0], transcripcion: { segmentos: segmentosDePrueba(60) }, duracionSeg: 3600 }] });
  assert.ok(corta.entrada > 0 && corta.usd > 0);
  assert.ok(larga.entrada > corta.entrada);
  const prompt = promptClase({ curso, clase: curso.clases[0], totalClases: 2, duracionSeg: 300, segmentos: segmentosDePrueba(5) });
  assert.ok(corta.entrada >= Math.ceil(prompt.length / 3));
});
