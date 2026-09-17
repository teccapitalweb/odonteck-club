// Orquestación de la generación por curso (sin E/S directa: lectura y guardado se inyectan).
import { ErrorGeneracion, MODELO, costoUsd, estimarCostoCurso, generarClase, generarCurso } from './contenido.mjs';

/**
 * Reúne las clases de un curso que tienen transcripción y aún no tienen contenido (salvo `regenerar`).
 * @param {(videoId:string)=>object|null} leerTranscripcion
 */
export function planCurso({ curso, inventarioIdx, leerTranscripcion, contenidoPrevio = null, regenerar = false }) {
  const previas = new Map((contenidoPrevio?.clases ?? []).map((c) => [c.n, c]));
  const sinTranscripcion = [];
  const listas = [];
  const pendientes = [];
  for (const clase of curso.clases) {
    const t = leerTranscripcion(clase.videoId);
    if (!t?.segmentos?.length) { sinTranscripcion.push(clase.n); continue; }
    const duracionSeg = inventarioIdx.get(clase.videoId)?.duracionSeg ?? t.duracionSeg ?? null;
    const previa = previas.get(clase.n);
    if (previa && previa.videoId === clase.videoId && !regenerar) listas.push(previa);
    else pendientes.push({ clase, transcripcion: t, duracionSeg });
  }
  const cursoPendiente = regenerar || !contenidoPrevio?.curso;
  return { sinTranscripcion, listas, pendientes, cursoPendiente };
}

/**
 * Genera (o completa) el contenido de un curso. Guarda tras cada clase para no perder trabajo pagado.
 * @param {object} op
 * @param {object} op.cliente  cliente de Anthropic (o doble) con beta.messages.create
 * @param {(contenido:object)=>void} op.guardar
 */
export async function generarContenidoCurso({ cliente, curso, plan, contenidoPrevio = null, effort = 'high', guardar = () => {}, log = () => {}, ahora = () => new Date() }) {
  const uso = { entrada: 0, salida: 0, llamadas: 0 };
  const sumar = (u) => { if (!u) return; uso.entrada += u.entrada; uso.salida += u.salida; uso.llamadas += u.llamadas; };
  const clases = new Map(plan.listas.map((c) => [c.n, c]));
  const errores = [];
  const modelos = new Set(contenidoPrevio?.modelos ?? []);

  const armar = () => {
    const ordenadas = [...clases.values()].sort((a, b) => a.n - b.n);
    const completo = ordenadas.length === curso.clases.length && Boolean(cursoFinal);
    return {
      cursoId: curso.id,
      cursoTitulo: curso.titulo,
      modelo: MODELO,
      modelos: [...modelos],
      generado: ahora().toISOString(),
      estado: completo ? 'completo' : 'parcial',
      curso: cursoFinal,
      clases: ordenadas,
      errores,
      usoUltimaCorrida: { ...uso, usd: Number(costoUsd(uso).toFixed(4)) },
    };
  };
  let cursoFinal = plan.cursoPendiente ? null : contenidoPrevio?.curso ?? null;

  for (const p of plan.pendientes) {
    log(`  · clase ${p.clase.n}: generando…`);
    try {
      const r = await generarClase(cliente, { curso, clase: p.clase, totalClases: curso.clases.length, transcripcion: p.transcripcion, duracionSeg: p.duracionSeg, effort, log });
      sumar(r.uso);
      if (r.modelo) modelos.add(r.modelo);
      clases.set(p.clase.n, r.contenido);
      // Si se regeneró una clase, la ficha del curso debe rehacerse con los resúmenes nuevos.
      cursoFinal = null;
      log(`    ✓ "${r.contenido.titulo}" (${r.intentos} intento${r.intentos > 1 ? 's' : ''})`);
    } catch (err) {
      if (!(err instanceof ErrorGeneracion)) throw err; // errores de API/red: detener el curso
      sumar(err.uso);
      errores.push({ n: p.clase.n, mensaje: err.message, detalle: err.errores });
      log(`    ✗ clase ${p.clase.n}: ${err.message}`);
    }
    guardar(armar());
  }

  const todas = curso.clases.every((c) => clases.has(c.n));
  if (!cursoFinal && todas) {
    log('  · ficha del curso: generando…');
    try {
      const resumenes = [...clases.values()].sort((a, b) => a.n - b.n).map(({ n, titulo, resumen }) => ({ n, titulo, resumen }));
      const r = await generarCurso(cliente, { curso, clases: resumenes, effort, log });
      sumar(r.uso);
      if (r.modelo) modelos.add(r.modelo);
      cursoFinal = r.contenido;
      log('    ✓ ficha del curso');
    } catch (err) {
      if (!(err instanceof ErrorGeneracion)) throw err;
      sumar(err.uso);
      errores.push({ n: null, mensaje: `curso: ${err.message}`, detalle: err.errores });
    }
  } else if (!todas) {
    log('  · ficha del curso: se omite hasta que todas las clases tengan contenido');
  }

  const final = armar();
  guardar(final);
  return final;
}

export { estimarCostoCurso };
