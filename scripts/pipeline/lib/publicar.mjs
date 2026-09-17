// Planeación (pura) de la publicación de out/contenido/*.json en v2_cursos y v2_quizzes.
import { validarClase, validarCurso, validarPreguntas } from './validador.mjs';

const DESCRIPCION_PROVISIONAL = /^Curso grabado de la membresía OdonTeck:/;
const TITULO_GENERICO = /^\s*clase\s+\d+\s*$/i;

export const idQuiz = (cursoId, n) => `${cursoId}_${n}`;

/** Doc base de v2_cursos a partir de catalogo.json (solo si se piden crear los faltantes). */
export function cursoDesdeCatalogo(c) {
  return {
    id: c.id, titulo: c.titulo, area: c.area, nivel: c.nivel, instructor: c.instructor, portada: c.portada,
    descripcion: c.descripcion, aprenderas: [], orden: c.orden, publicado: false, bunnyCollectionId: c.bunnyCollectionId,
    clases: c.clases.map((k) => ({ n: k.n, titulo: k.titulo, videoId: k.videoId, duracionMin: null, gratis: Boolean(k.gratis) })),
  };
}

/**
 * Calcula qué cambiaría en un curso y sus quizzes.
 * @param {object} op
 * @param {object|null} op.cursoDoc   doc actual de v2_cursos/{id} (null si no existe)
 * @param {object} op.catalogoCurso    curso de catalogo.json (para crear si falta)
 * @param {object} op.contenido        out/contenido/<cursoId>.json
 * @param {Map} op.inventarioIdx       videoId → clase del inventario
 * @param {Map<string, object>} op.quizzes  id → doc actual de v2_quizzes (solo los existentes)
 * @param {object} [op.opciones]  { crearFaltantes, reemplazarTitulos, reemplazarNotas, reemplazarCurso, reemplazarBorradores }
 */
export function planPublicacion({ cursoDoc, catalogoCurso, contenido, inventarioIdx, quizzes = new Map(), opciones = {}, ahora = new Date() }) {
  // docCurso: doc completo (solo al crear). actualizacion: campos de primer nivel a actualizar (update parcial,
  // para no reescribir Timestamps u otros campos que el admin haya puesto).
  const plan = { cursoId: contenido.cursoId, accionCurso: 'omitir', cambios: [], docCurso: null, actualizacion: null, quizzes: [], avisos: [] };
  const iso = ahora.toISOString();

  let base = cursoDoc;
  if (!base) {
    if (!opciones.crearFaltantes) {
      plan.avisos.push(`v2_cursos/${contenido.cursoId} no existe; usa --crear-faltantes para crearlo desde catalogo.json (publicado: false)`);
      return plan;
    }
    if (!catalogoCurso) {
      plan.avisos.push(`El curso ${contenido.cursoId} no está en catalogo.json`);
      return plan;
    }
    base = cursoDesdeCatalogo(catalogoCurso);
    plan.accionCurso = 'crear';
  }

  // Copia superficial: los valores anidados que no cambian conservan su instancia (p. ej. Timestamp).
  const doc = { ...base, clases: (base.clases ?? []).map((k) => ({ ...k })) };
  const tocados = new Set();
  const cambios = [];
  const clasesDoc = new Map((doc.clases ?? []).map((k) => [k.n, k]));

  for (const c of contenido.clases ?? []) {
    const k = clasesDoc.get(c.n);
    const ruta = `clases[n=${c.n}]`;
    if (!k) { plan.avisos.push(`${ruta}: no existe en v2_cursos; se omite`); continue; }
    if (k.videoId !== c.videoId) { plan.avisos.push(`${ruta}: videoId distinto al del contenido (${k.videoId} ≠ ${c.videoId}); se omite`); continue; }
    const errores = validarClase(c, { duracionSeg: inventarioIdx.get(c.videoId)?.duracionSeg ?? null });
    if (errores.length) { plan.avisos.push(`${ruta}: contenido inválido, se omite (${errores[0]})`); continue; }

    const dur = inventarioIdx.get(c.videoId)?.duracionMin ?? null;
    if (dur !== null && k.duracionMin !== dur) { cambios.push({ campo: `${ruta}.duracionMin`, antes: k.duracionMin ?? null, despues: dur }); k.duracionMin = dur; tocados.add('clases'); }

    if ((!k.titulo || TITULO_GENERICO.test(k.titulo) || opciones.reemplazarTitulos) && k.titulo !== c.titulo) {
      cambios.push({ campo: `${ruta}.titulo`, antes: k.titulo ?? null, despues: c.titulo });
      k.titulo = c.titulo;
      tocados.add('clases');
    } else if (k.titulo !== c.titulo) {
      plan.avisos.push(`${ruta}.titulo editado a mano ("${k.titulo}"); se conserva (usa --reemplazar-titulos)`);
    }

    const notas = { resumen: c.resumen, conceptos: c.conceptos };
    if (!k.notas || opciones.reemplazarNotas) {
      if (JSON.stringify(k.notas ?? null) !== JSON.stringify(notas)) { cambios.push({ campo: `${ruta}.notas`, antes: k.notas ?? null, despues: notas }); k.notas = notas; tocados.add('clases'); }
    } else if (JSON.stringify(k.notas) !== JSON.stringify(notas)) {
      plan.avisos.push(`${ruta}.notas ya existen; se conservan (usa --reemplazar-notas)`);
    }

    // Quiz
    const id = idQuiz(contenido.cursoId, c.n);
    const actual = quizzes.get(id);
    const nuevo = { cursoId: contenido.cursoId, n: c.n, estado: 'borrador', preguntas: c.preguntas, generado: contenido.generado ?? iso };
    if (validarPreguntas(c.preguntas).length) { plan.quizzes.push({ id, accion: 'omitir-invalido' }); continue; }
    if (!actual) plan.quizzes.push({ id, accion: 'crear', doc: nuevo });
    else if (actual.estado === 'aprobado') plan.quizzes.push({ id, accion: 'omitir-aprobado' });
    else if (opciones.reemplazarBorradores) plan.quizzes.push({ id, accion: 'reemplazar', doc: nuevo, antes: actual });
    else plan.quizzes.push({ id, accion: 'omitir-borrador' });
  }

  // Ficha del curso
  if (contenido.curso && !validarCurso(contenido.curso).length) {
    const provisional = !doc.aprenderas?.length || DESCRIPCION_PROVISIONAL.test(doc.descripcion ?? '');
    if (provisional || opciones.reemplazarCurso) {
      for (const campo of ['descripcion', 'aprenderas', 'nivel']) {
        if (JSON.stringify(doc[campo] ?? null) !== JSON.stringify(contenido.curso[campo])) {
          cambios.push({ campo, antes: doc[campo] ?? null, despues: contenido.curso[campo] });
          doc[campo] = contenido.curso[campo];
          tocados.add(campo);
        }
      }
    } else {
      plan.avisos.push('descripcion/aprenderas/nivel ya fueron editados; se conservan (usa --reemplazar-curso)');
    }
  } else if (contenido.curso) {
    plan.avisos.push(`ficha del curso inválida, se omite (${validarCurso(contenido.curso)[0]})`);
  }

  plan.cambios = cambios;
  if (plan.accionCurso === 'crear') {
    doc.actualizado = iso;
    plan.docCurso = doc;
  } else if (tocados.size) {
    plan.accionCurso = 'actualizar';
    plan.actualizacion = Object.fromEntries([...tocados].map((campo) => [campo, doc[campo]]));
    plan.actualizacion.actualizado = iso;
  }
  return plan;
}

const corto = (v, max = 90) => {
  const s = typeof v === 'string' ? v : JSON.stringify(v);
  return s === undefined ? 'undefined' : s.length > max ? `${s.slice(0, max - 1)}…` : s;
};

/** Diff legible para el dry-run. */
export function formatearPlan(plan) {
  const l = [`\n■ ${plan.cursoId} · curso: ${plan.accionCurso}`];
  for (const c of plan.cambios) l.push(`   ~ ${c.campo}\n       - ${corto(c.antes)}\n       + ${corto(c.despues)}`);
  const porAccion = {};
  for (const q of plan.quizzes) (porAccion[q.accion] ??= []).push(q.id.split('_').at(-1));
  for (const [accion, ns] of Object.entries(porAccion)) l.push(`   quiz ${accion}: clases ${ns.join(', ')}`);
  for (const a of plan.avisos) l.push(`   ⚠ ${a}`);
  return l.join('\n');
}
