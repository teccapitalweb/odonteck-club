import catalogo from '../data/recompensas.json' with { type: 'json' };
import { conflicto, invalido, noEncontrado } from './errores.js';

export const RECOMPENSAS = Object.freeze(catalogo);
export const CATALOGO_COL = 'v2_recompensas_catalogo';
export const esEntregaAutomatica = (r) =>
  ['material', 'archivo', 'personalizacion'].includes(r.tipo);
const estados = ['disponible', 'proximamente', 'pausada'];
export function combinarRecompensa(base, ajuste = {}) {
  const permitidos = [
    'titulo',
    'descripcion',
    'puntos',
    'estado',
    'cupo',
    'plazo',
    'instrucciones',
    'revisionProfesional',
  ];
  const cambios = Object.fromEntries(
    permitidos
      .filter((k) => ajuste[k] !== undefined)
      .map((k) => [k, ajuste[k]]),
  );
  return { ...base, ...cambios };
}
export async function leerCatalogoRecompensas(db) {
  const snap = await db.collection(CATALOGO_COL).get();
  const ajustes = new Map(snap.docs.map((d) => [d.id, d.data()]));
  const nuevos = snap.docs
    .filter(
      (d) => d.data().nuevo === true && !RECOMPENSAS.some((r) => r.id === d.id),
    )
    .map((d) => ({ ...d.data(), id: d.id }));
  return [
    ...RECOMPENSAS.map((r) => combinarRecompensa(r, ajustes.get(r.id))),
    ...nuevos,
  ];
}
export function puedeEntregar(r) {
  if (r.estado !== 'disponible') return false;
  if (esEntregaAutomatica(r)) return true;
  if (r.id === 'praxia-30-dias') return !Number.isInteger(r.cupo) || r.cupo > 0; // Beneficio heredado, siempre con confirmación manual.
  return (
    Number.isInteger(r.cupo) &&
    r.cupo > 0 &&
    !!r.plazo &&
    !!r.instrucciones &&
    (!r.requiereRevision || r.revisionProfesional === true)
  );
}
export function validarAjusteRecompensa(base, previo, body) {
  if (!body || typeof body !== 'object' || Array.isArray(body))
    throw invalido('Configuración inválida.');
  const permitidos = [
    'titulo',
    'descripcion',
    'puntos',
    'estado',
    'cupo',
    'plazo',
    'instrucciones',
    'revisionProfesional',
  ];
  if (Object.keys(body).some((k) => !permitidos.includes(k)))
    throw invalido('La configuración contiene campos no permitidos.');
  const ajuste = { ...previo };
  for (const key of ['titulo', 'descripcion', 'plazo', 'instrucciones'])
    if (body[key] !== undefined) {
      const max = {
        titulo: 100,
        descripcion: 600,
        plazo: 120,
        instrucciones: 1000,
      }[key];
      if (
        typeof body[key] !== 'string' ||
        body[key].length > max ||
        (['titulo', 'descripcion'].includes(key) && !body[key].trim())
      )
        throw invalido(`El campo ${key} no es válido.`);
      ajuste[key] = body[key].trim();
    }
  for (const key of ['puntos', 'cupo'])
    if (body[key] !== undefined) {
      if (
        !Number.isInteger(body[key]) ||
        body[key] < (key === 'puntos' ? 1 : 0) ||
        body[key] > 100000
      )
        throw invalido(
          `El campo ${key} debe ser un entero dentro del rango permitido.`,
        );
      ajuste[key] = body[key];
    }
  if (body.estado !== undefined) {
    if (!estados.includes(body.estado)) throw invalido('Estado no permitido.');
    ajuste.estado = body.estado;
  }
  if (body.revisionProfesional !== undefined) {
    if (typeof body.revisionProfesional !== 'boolean')
      throw invalido('La revisión debe confirmarse explícitamente.');
    ajuste.revisionProfesional = body.revisionProfesional;
  }
  const r = combinarRecompensa(base, ajuste);
  // Cero existencias es una configuración válida; el canje sigue bloqueado por puedeEntregar.
  if (
    r.estado === 'disponible' &&
    !puedeEntregar({ ...r, cupo: r.cupo === 0 ? 1 : r.cupo })
  )
    throw conflicto(
      'Antes de habilitarla indica cupos, plazo e instrucciones de entrega y, si corresponde, confirma la revisión profesional.',
      'entrega_no_preparada',
    );
  return ajuste;
}
export function buscarRecompensa(id) {
  const r = RECOMPENSAS.find((x) => x.id === id);
  if (!r) throw noEncontrado('Esa recompensa no existe.');
  return r;
}
export function recompensaPublica(r) {
  const { instrucciones, revisionProfesional, actualizadoPor, ...publico } = r;
  return publico;
}
