import { invalido } from './errores.js';

const normalizar = (v) => String(v ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
const tipoDe = (p) => p?.tipo ?? 'seleccion';
const idDe = (p, i) => String(p?.id ?? `p${i + 1}`);
const hash = (texto) => [...String(texto)].reduce((n, c) => ((n * 31) + c.charCodeAt(0)) >>> 0, 2166136261);
const mezclarPublico = (lista, semilla) => [...lista].sort((a, b) => hash(`${semilla}:${a.id}`) - hash(`${semilla}:${b.id}`));

export function preguntaPublica(p, i = 0) {
  const base = {
    id: idDe(p, i), tipo: tipoDe(p), q: String(p.q ?? ''), instruccion: String(p.instruccion ?? ''),
    ...(p.casoClinico ? { casoClinico: String(p.casoClinico) } : {}),
    ...(p.competencia ? { competencia: String(p.competencia) } : {}),
    ...(p.nivelCognitivo ? { nivelCognitivo: String(p.nivelCognitivo) } : {}),
  };
  switch (base.tipo) {
    case 'seleccion':
    case 'seleccion_multiple': return { ...base, opciones: Array.isArray(p.opciones) ? p.opciones : [] };
    case 'ordenar': return { ...base, elementos: mezclarPublico(Array.isArray(p.elementos) ? p.elementos.map(({ id, texto }) => ({ id, texto })) : [], base.id) };
    case 'relacionar': return { ...base, izquierda: p.izquierda ?? [], derecha: mezclarPublico(p.derecha ?? [], base.id) };
    case 'completar': return { ...base, plantilla: String(p.plantilla ?? ''), huecos: Array.isArray(p.huecos) ? p.huecos.map(({ id, etiqueta }) => ({ id, etiqueta })) : [] };
    default: throw invalido(`Tipo de pregunta no soportado: ${base.tipo}.`);
  }
}

const listaUnica = (v, campo) => {
  if (!Array.isArray(v) || new Set(v).size !== v.length) throw invalido(`"${campo}" debe ser una lista sin duplicados.`);
  return v;
};

export function calificarPregunta(p, respuesta, i = 0) {
  const tipo = tipoDe(p);
  let puntos = 0;
  let respuestaCorrecta;
  if (tipo === 'seleccion') {
    if (respuesta !== null && !Number.isInteger(respuesta)) throw invalido(`"respuestas[${i}]" debe ser un índice o null.`);
    puntos = respuesta === p.correcta ? 1 : 0;
    respuestaCorrecta = p.correcta;
  } else if (tipo === 'seleccion_multiple') {
    const elegidas = listaUnica(respuesta ?? [], `respuestas[${i}]`).map(Number);
    if (elegidas.some((n) => !Number.isInteger(n) || n < 0 || n >= p.opciones.length)) throw invalido(`"respuestas[${i}]" contiene opciones inválidas.`);
    const correctas = new Set(p.correctas);
    const aciertos = elegidas.filter((n) => correctas.has(n)).length;
    const errores = elegidas.filter((n) => !correctas.has(n)).length;
    puntos = Math.max(0, (aciertos / correctas.size) - (errores / Math.max(1, p.opciones.length - correctas.size)));
    respuestaCorrecta = [...correctas];
  } else if (tipo === 'ordenar') {
    const ids = (p.elementos ?? []).map((x) => String(x.id));
    const orden = listaUnica(respuesta ?? [], `respuestas[${i}]`).map(String);
    if (orden.length !== ids.length || orden.some((id) => !ids.includes(id))) throw invalido(`"respuestas[${i}]" debe ordenar todos los elementos.`);
    const correcta = p.ordenCorrecto.map(String);
    if (correcta.length <= 1) puntos = orden.join('|') === correcta.join('|') ? 1 : 0;
    else {
      const pares = correcta.slice(0, -1).map((id, j) => `${id}>${correcta[j + 1]}`);
      const usuario = new Set(orden.slice(0, -1).map((id, j) => `${id}>${orden[j + 1]}`));
      puntos = pares.filter((par) => usuario.has(par)).length / pares.length;
    }
    respuestaCorrecta = correcta;
  } else if (tipo === 'relacionar') {
    if (!respuesta || typeof respuesta !== 'object' || Array.isArray(respuesta)) throw invalido(`"respuestas[${i}]" debe contener las relaciones.`);
    const pares = p.pares ?? {};
    const claves = Object.keys(pares);
    puntos = claves.length ? claves.filter((id) => String(respuesta[id] ?? '') === String(pares[id])).length / claves.length : 0;
    respuestaCorrecta = pares;
  } else if (tipo === 'completar') {
    if (!respuesta || typeof respuesta !== 'object' || Array.isArray(respuesta)) throw invalido(`"respuestas[${i}]" debe contener los textos de cada espacio.`);
    const huecos = p.huecos ?? [];
    const ok = huecos.filter((h) => (h.respuestas ?? []).some((r) => normalizar(r) === normalizar(respuesta[h.id]))).length;
    puntos = huecos.length ? ok / huecos.length : 0;
    respuestaCorrecta = Object.fromEntries(huecos.map((h) => [h.id, h.respuestas?.[0] ?? '']));
  } else throw invalido(`Tipo de pregunta no soportado: ${tipo}.`);
  puntos = Math.round(Math.max(0, Math.min(1, puntos)) * 1000) / 1000;
  return { id: idDe(p, i), tipo, acertada: puntos === 1, puntos, explicacion: p.explicacion ?? '', ...(p.referenciaVideo ? { referenciaVideo: p.referenciaVideo } : {}), respuestaCorrecta, ...(tipo === 'seleccion' ? { correcta: respuestaCorrecta } : {}) };
}

export function calificarEvaluacion(preguntas, respuestas, aprobatorio = 0.7) {
  if (!Array.isArray(respuestas) || respuestas.length !== preguntas.length) throw invalido(`"respuestas" debe ser una lista con ${preguntas.length} elementos.`);
  const detalle = preguntas.map((p, i) => calificarPregunta(p, respuestas[i], i));
  const suma = detalle.reduce((n, d) => n + d.puntos, 0);
  const puntaje = preguntas.length ? Math.round((suma / preguntas.length) * 100) : 0;
  return { correctas: detalle.filter((d) => d.acertada).length, total: preguntas.length, puntaje, aprobado: puntaje >= aprobatorio * 100, detalle };
}
