// Migración (pura) de la colección vieja `certificados` a `v2_certificados`.
//
// Mapeo inferido de C:\dev\Odonteck\vip-panel.html (emitirCertificadoFirestore, getCertificadosReales)
// y verificar.html:
//   certificados/{folio} = { folio: 'OdonTeck-AAAA-XXXXXX', uid, nombre, cursoId (id autogenerado del doc
//                            en la colección vieja `cursos`), curso (título), area, horas, sesiones,
//                            instructor, emitido (ISO), year, createdAt (serverTimestamp) }  · escrito con merge
//   v2_certificados/{folio} = { folio: 'ODT-AAAA-NNNNN', uid, nombre, cursoId (slug del catálogo nuevo),
//                               cursoTitulo, area, clases, emitido (ISO), folioAnterior }
//   folio        ← nuevo, secuencial por año de emisión (ver asignarFolios)
//   folioAnterior← viejo.folio || id del doc
//   uid, nombre  ← iguales
//   cursoId      ← se resuelve contra catalogo.json (ver resolverCurso)
//   cursoTitulo  ← viejo.curso (lo que se certificó), o el título del catálogo si falta
//   area         ← viejo.area, o el área del catálogo si falta / es el valor por defecto
//   clases       ← viejo.sesiones si > 0, o número de clases del curso en el catálogo
//   emitido      ← viejo.emitido (ISO) o createdAt → ISO
//   horas, instructor, year, createdAt → no existen en el contrato v2; se descartan (quedan en la colección vieja).
import { normalizar } from './validador.mjs';

const AREA_POR_DEFECTO_VIEJA = 'Odontología General';
export const slug = (s) => normalizar(s).replace(/\s+/g, '-');

/** Convierte a ISO un string, Date, Timestamp de Firestore o { _seconds } serializado. */
export function aIso(v) {
  if (!v) return null;
  if (typeof v === 'string') { const t = Date.parse(v); return Number.isFinite(t) ? new Date(t).toISOString() : null; }
  if (v instanceof Date) return Number.isFinite(v.getTime()) ? v.toISOString() : null;
  if (typeof v.toDate === 'function') return v.toDate().toISOString();
  const seg = v._seconds ?? v.seconds;
  if (Number.isFinite(seg)) return new Date(seg * 1000).toISOString();
  return null;
}

/**
 * Resuelve el curso nuevo de un certificado viejo. Orden:
 *  1. viejo.cursoId ya es un id del catálogo nuevo
 *  2. slug(viejo.curso) coincide con el slug del título de algún curso nuevo
 *  3. doc viejo de `cursos/{cursoId}`: por slug de su título o por videoIds de sus sesiones
 * @returns {{ curso: object|null, via: string }}
 */
export function resolverCurso(viejo, catalogo, cursosViejos = new Map()) {
  const porId = new Map(catalogo.cursos.map((c) => [c.id, c]));
  const porSlug = new Map(catalogo.cursos.map((c) => [slug(c.titulo), c]));
  if (viejo.cursoId && porId.has(viejo.cursoId)) return { curso: porId.get(viejo.cursoId), via: 'cursoId' };
  if (viejo.curso && porSlug.has(slug(viejo.curso))) return { curso: porSlug.get(slug(viejo.curso)), via: 'titulo' };
  const cv = cursosViejos.get(viejo.cursoId);
  if (cv) {
    if (cv.titulo && porSlug.has(slug(cv.titulo))) return { curso: porSlug.get(slug(cv.titulo)), via: 'cursos-viejos.titulo' };
    const videos = new Set((cv.sesiones ?? []).map((s) => s?.videoId).filter(Boolean));
    if (videos.size) {
      const candidatos = catalogo.cursos
        .map((c) => ({ c, comunes: c.clases.filter((k) => videos.has(k.videoId)).length }))
        .filter((x) => x.comunes > 0)
        .sort((a, b) => b.comunes - a.comunes);
      if (candidatos.length === 1 || (candidatos.length > 1 && candidatos[0].comunes > candidatos[1].comunes)) {
        return { curso: candidatos[0].c, via: 'cursos-viejos.videoId' };
      }
    }
  }
  return { curso: null, via: 'sin-resolver' };
}

const FOLIO_V2 = /^ODT-(\d{4})-(\d{5})$/;

/**
 * Propone la migración completa.
 * @param {object} op
 * @param {Array<{id:string, data:object}>} op.viejos         docs de `certificados`
 * @param {object} op.catalogo                                 catalogo.json
 * @param {Map<string, object>} [op.cursosViejos]             docs de `cursos` (id → data)
 * @param {Array<{id:string, data:object}>} [op.v2Existentes] docs actuales de `v2_certificados`
 * @returns {{ migrar, yaMigrados, duplicados, sinResolver, invalidos }}
 */
export function planMigracion({ viejos, catalogo, cursosViejos = new Map(), v2Existentes = [] }) {
  const yaMigradosPorFolio = new Map(v2Existentes.filter((d) => d.data.folioAnterior).map((d) => [d.data.folioAnterior, d.id]));
  const clavesV2 = new Set(v2Existentes.map((d) => `${d.data.uid}|${d.data.cursoId}`));
  const res = { migrar: [], yaMigrados: [], duplicados: [], sinResolver: [], invalidos: [] };

  const candidatos = [];
  for (const { id, data } of viejos) {
    const folioAnterior = data.folio || id;
    if (yaMigradosPorFolio.has(folioAnterior)) { res.yaMigrados.push({ folioAnterior, folio: yaMigradosPorFolio.get(folioAnterior) }); continue; }
    const emitido = aIso(data.emitido) ?? aIso(data.createdAt);
    if (!data.uid || !emitido) { res.invalidos.push({ folioAnterior, motivo: !data.uid ? 'sin uid' : 'sin fecha de emisión válida' }); continue; }
    const { curso, via } = resolverCurso(data, catalogo, cursosViejos);
    if (!curso) { res.sinResolver.push({ folioAnterior, cursoIdAnterior: data.cursoId ?? null, curso: data.curso ?? null }); continue; }
    candidatos.push({
      via,
      cursoIdAnterior: data.cursoId ?? null,
      doc: {
        folio: null,
        uid: data.uid,
        nombre: (data.nombre ?? '').trim() || 'Usuario VIP',
        cursoId: curso.id,
        cursoTitulo: (data.curso ?? '').trim() || curso.titulo,
        area: data.area && data.area !== AREA_POR_DEFECTO_VIEJA ? data.area : curso.area ?? data.area ?? 'Odontología general',
        clases: Number(data.sesiones) > 0 ? Number(data.sesiones) : curso.clases.length,
        emitido,
        folioAnterior,
      },
    });
  }

  // Un certificado por (uid, curso): se conserva el más antiguo; el resto se reporta para decisión humana.
  candidatos.sort((a, b) => a.doc.emitido.localeCompare(b.doc.emitido) || a.doc.folioAnterior.localeCompare(b.doc.folioAnterior));
  const vistos = new Map();
  for (const c of candidatos) {
    const clave = `${c.doc.uid}|${c.doc.cursoId}`;
    if (clavesV2.has(clave)) { res.duplicados.push({ folioAnterior: c.doc.folioAnterior, motivo: 'ya existe un v2_certificado para ese usuario y curso' }); continue; }
    if (vistos.has(clave)) { res.duplicados.push({ folioAnterior: c.doc.folioAnterior, motivo: `mismo usuario y curso que ${vistos.get(clave)}` }); continue; }
    vistos.set(clave, c.doc.folioAnterior);
    res.migrar.push(c);
  }

  asignarFolios(res.migrar.map((c) => c.doc), v2Existentes.map((d) => d.id));
  return res;
}

/**
 * Asigna folios ODT-AAAA-NNNNN secuenciales por año, empezando después del mayor existente de ese año.
 * Muta los docs. Nota: el backend podría emitir folios con otra estrategia (el front provisional usa un hash);
 * por eso la escritura usa create() y falla si el folio ya existe, en vez de sobreescribir.
 */
export function asignarFolios(docs, foliosExistentes = []) {
  const max = new Map();
  for (const f of foliosExistentes) {
    const m = String(f).match(FOLIO_V2);
    if (m) max.set(m[1], Math.max(max.get(m[1]) ?? 0, Number(m[2])));
  }
  for (const d of docs) {
    const anio = d.emitido.slice(0, 4);
    const n = (max.get(anio) ?? 0) + 1;
    if (n > 99999) throw new Error(`Se agotaron los folios de ${anio}`);
    max.set(anio, n);
    d.folio = `ODT-${anio}-${String(n).padStart(5, '0')}`;
  }
  return docs;
}
