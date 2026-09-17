// Transformaciones puras de src/data/*.json al modelo v2 del contrato (usadas por scripts/seed-v2.mjs).
import { validarCurso, validarMaterial } from './esquemas.js';

/** Catálogo del frontend -> documento de v2_cursos. */
export function mapearCurso(c, actualizado) {
  const curso = {
    id: c.id,
    titulo: c.titulo,
    area: c.area,
    nivel: c.nivel,
    instructor: c.instructor ?? '',
    portada: c.portada ?? null,
    ...(c.banner ? { banner: c.banner } : {}),
    descripcion: c.descripcion ?? '',
    aprenderas: Array.isArray(c.aprenderas) ? c.aprenderas : [],
    orden: Number.isInteger(c.orden) ? c.orden : 0,
    publicado: c.publicado ?? true,
    bunnyCollectionId: c.bunnyCollectionId ?? '',
    clases: (c.clases ?? []).map((cl) => ({
      n: cl.n,
      titulo: cl.titulo,
      videoId: cl.videoId ?? '',
      // El catálogo trae `duracion`; el contrato usa `duracionMin`.
      duracionMin: cl.duracionMin ?? cl.duracion ?? null,
      gratis: cl.gratis === true,
      ...(cl.notas ? { notas: cl.notas } : {}),
    })),
  };
  // Pasa por la misma validación que el admin: si algo no cuadra, lanza con mensaje claro.
  const validado = validarCurso(curso);
  return { ...validado, actualizado };
}

/** materiales.json -> documento de v2_materiales. `url` pública se sustituye por `archivo` en Storage. */
export function mapearMaterial(m, actualizado) {
  const validado = validarMaterial({
    id: m.id,
    titulo: m.titulo,
    tipo: m.tipo,
    categoria: m.categoria ?? '',
    area: m.area ?? '',
    autor: m.autor ?? '',
    paginas: m.paginas ?? null,
    portada: m.portada ?? null,
    cursoId: m.cursoId ?? null,
    descripcion: m.descripcion ?? '',
    estado: m.estado ?? 'proximamente',
  });
  return { ...validado, archivo: `materiales/${validado.id}.pdf`, actualizado };
}
