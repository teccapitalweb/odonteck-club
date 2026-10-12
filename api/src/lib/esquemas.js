// Validación de documentos que edita el admin (cursos, materiales, eventos, quizzes, config).
// `parcial: true` = PATCH: solo se validan y devuelven los campos presentes.
import { invalido } from './errores.js';
import {
  LIMITES,
  booleano,
  entero,
  esObjeto,
  fechaISO,
  listaDeTextos,
  numeroONulo,
  sinIndefinidos,
  slug,
  texto,
  textoRequerido,
  unoDe,
  url,
} from './validacion.js';

export const NIVELES = ['Básico', 'Intermedio', 'Avanzado'];
export const TIPOS_MATERIAL = ['PDF', 'Libro', 'Presentación'];
export const ESTADOS_MATERIAL = ['disponible', 'proximamente', 'oculto'];
export const ESTADOS_QUIZ = ['borrador', 'aprobado'];
export const TIPOS_PREGUNTA = ['seleccion', 'seleccion_multiple', 'ordenar', 'relacionar', 'completar'];
export const NIVELES_COGNITIVOS = ['Aplicar', 'Analizar', 'Decidir'];

const VIDEO_ID = /^[A-Za-z0-9-]{1,80}$/;
const MARCA_TIEMPO = /^(\d{1,2}:)?\d{1,2}:\d{2}$/;

function req(parcial, valor, fn) {
  // En creación todo lo que pasa por aquí es obligatorio; en PATCH solo si viene.
  if (parcial && valor === undefined) return undefined;
  return fn(true);
}

// Campo opcional: si no viene, en PATCH se omite y en creación toma el valor por defecto.
const opcional = (parcial) => (valor, validar, defecto) => (valor === undefined ? (parcial ? undefined : defecto) : validar());

function validarNotas(notas, campo) {
  if (notas === undefined) return undefined;
  if (notas === null) return null;
  if (!esObjeto(notas)) throw invalido(`El campo "${campo}" debe ser un objeto.`);
  const conceptos = notas.conceptos === undefined ? [] : notas.conceptos;
  if (!Array.isArray(conceptos) || conceptos.length > 100) throw invalido(`"${campo}.conceptos" debe ser una lista (máx. 100).`);
  return {
    resumen: texto(notas.resumen, { campo: `${campo}.resumen`, max: LIMITES.largo, multilinea: true }) ?? '',
    conceptos: conceptos.map((c, i) => {
      if (!esObjeto(c)) throw invalido(`"${campo}.conceptos[${i}]" debe ser un objeto.`);
      if (typeof c.t !== 'string' || !MARCA_TIEMPO.test(c.t)) throw invalido(`"${campo}.conceptos[${i}].t" debe tener formato mm:ss.`);
      return { t: c.t, texto: textoRequerido(c.texto, { campo: `${campo}.conceptos[${i}].texto`, max: LIMITES.medio }) };
    }),
  };
}

function validarFicha(ficha, campo) {
  if (ficha === undefined) return undefined;
  if (ficha === null) return null;
  if (!esObjeto(ficha)) throw invalido(`El campo "${campo}" debe ser un objeto.`);
  const estado = unoDe(ficha.estado, ['borrador', 'aprobada'], { campo: `${campo}.estado`, requerido: true });
  const archivo = texto(ficha.archivo, { campo: `${campo}.archivo`, max: 300 });
  if (archivo && (!archivo.startsWith('fichas/') || archivo.includes('..') || !archivo.endsWith('.pdf'))) throw invalido(`"${campo}.archivo" debe ser una ruta PDF privada dentro de fichas/.`);
  if (estado === 'aprobada' && !archivo) throw invalido(`"${campo}.archivo" es obligatorio para una ficha aprobada.`);
  return sinIndefinidos({
    estado,
    archivo: archivo || undefined,
    version: texto(ficha.version, { campo: `${campo}.version`, max: 40 }),
    revisadaPor: texto(ficha.revisadaPor, { campo: `${campo}.revisadaPor`, max: LIMITES.corto }),
    actualizada: ficha.actualizada === undefined ? undefined : fechaISO(ficha.actualizada, { campo: `${campo}.actualizada` }),
  });
}

export function validarClases(clases) {
  if (!Array.isArray(clases) || clases.length > 300) throw invalido('"clases" debe ser una lista (máx. 300).');
  const vistos = new Set();
  return clases
    .map((c, i) => {
      if (!esObjeto(c)) throw invalido(`"clases[${i}]" debe ser un objeto.`);
      const n = entero(c.n, { campo: `clases[${i}].n`, min: 1, max: 999 });
      if (vistos.has(n)) throw invalido(`El número de clase ${n} está repetido.`);
      vistos.add(n);
      const videoId = c.videoId === undefined || c.videoId === null ? '' : c.videoId;
      if (typeof videoId !== 'string' || (videoId !== '' && !VIDEO_ID.test(videoId))) {
        throw invalido(`"clases[${i}].videoId" no es un ID de Bunny válido.`);
      }
      return sinIndefinidos({
        n,
        titulo: textoRequerido(c.titulo, { campo: `clases[${i}].titulo`, max: LIMITES.corto * 2 }),
        videoId,
        duracionMin: numeroONulo(c.duracionMin === undefined ? null : c.duracionMin, { campo: `clases[${i}].duracionMin`, max: 1000 }),
        gratis: c.gratis === undefined ? false : booleano(c.gratis, { campo: `clases[${i}].gratis` }),
        notas: validarNotas(c.notas, `clases[${i}].notas`),
        ficha: validarFicha(c.ficha, `clases[${i}].ficha`),
      });
    })
    .sort((a, b) => a.n - b.n);
}

export function validarCurso(body, { parcial = false } = {}) {
  const b = esObjeto(body) ? body : {};
  const opc = opcional(parcial);
  return sinIndefinidos({
    id: parcial ? undefined : slug(b.id, { campo: 'id' }),
    titulo: req(parcial, b.titulo, () => textoRequerido(b.titulo, { campo: 'titulo', max: 200 })),
    area: req(parcial, b.area, () => textoRequerido(b.area, { campo: 'area', max: LIMITES.corto })),
    nivel: unoDe(b.nivel, NIVELES, { campo: 'nivel', requerido: !parcial }),
    instructor: opc(b.instructor, () => texto(b.instructor, { campo: 'instructor', max: LIMITES.corto }), ''),
    portada: opc(b.portada, () => url(b.portada, { campo: 'portada' }), null),
    banner: url(b.banner, { campo: 'banner' }),
    descripcion: opc(b.descripcion, () => texto(b.descripcion, { campo: 'descripcion', max: LIMITES.largo, multilinea: true }), ''),
    aprenderas: opc(b.aprenderas, () => listaDeTextos(b.aprenderas, { campo: 'aprenderas' }), []),
    orden: opc(b.orden, () => entero(b.orden, { campo: 'orden', min: 0, max: 100000, requerido: false }), 0),
    publicado: opc(b.publicado, () => booleano(b.publicado, { campo: 'publicado' }), false),
    bunnyCollectionId: opc(b.bunnyCollectionId, () => texto(b.bunnyCollectionId, { campo: 'bunnyCollectionId', max: 80 }), ''),
    clases: b.clases === undefined ? (parcial ? undefined : []) : validarClases(b.clases),
  });
}

export function validarMaterial(body, { parcial = false } = {}) {
  const b = esObjeto(body) ? body : {};
  const opc = opcional(parcial);
  const out = sinIndefinidos({
    id: parcial ? undefined : slug(b.id, { campo: 'id' }),
    titulo: req(parcial, b.titulo, () => textoRequerido(b.titulo, { campo: 'titulo', max: 200 })),
    tipo: unoDe(b.tipo, TIPOS_MATERIAL, { campo: 'tipo', requerido: !parcial }),
    categoria: opc(b.categoria, () => texto(b.categoria, { campo: 'categoria', max: LIMITES.corto }), ''),
    area: opc(b.area, () => texto(b.area, { campo: 'area', max: LIMITES.corto }), ''),
    autor: opc(b.autor, () => texto(b.autor, { campo: 'autor', max: LIMITES.corto }), ''),
    paginas: opc(b.paginas, () => numeroONulo(b.paginas, { campo: 'paginas', max: 10000 }), null),
    portada: opc(b.portada, () => url(b.portada, { campo: 'portada' }), null),
    cursoId: b.cursoId === undefined ? (parcial ? undefined : null) : b.cursoId === null || b.cursoId === '' ? null : slug(b.cursoId, { campo: 'cursoId' }),
    descripcion: opc(b.descripcion, () => texto(b.descripcion, { campo: 'descripcion', max: LIMITES.largo, multilinea: true }), ''),
    estado: unoDe(b.estado, ESTADOS_MATERIAL, { campo: 'estado' }) ?? (parcial ? undefined : 'proximamente'),
    gratis: opc(b.gratis, () => booleano(b.gratis, { campo: 'gratis' }), false),
  });
  // `archivo` no se recibe: siempre es materiales/<id>.pdf y lo fija el servidor.
  return out;
}

export function validarEvento(body, { parcial = false } = {}) {
  const b = esObjeto(body) ? body : {};
  const opc = opcional(parcial);
  return sinIndefinidos({
    id: parcial ? undefined : slug(b.id, { campo: 'id' }),
    titulo: req(parcial, b.titulo, () => textoRequerido(b.titulo, { campo: 'titulo', max: 200 })),
    ponente: opc(b.ponente, () => texto(b.ponente, { campo: 'ponente', max: LIMITES.corto }), ''),
    fecha: fechaISO(b.fecha, { campo: 'fecha', requerido: !parcial }),
    duracionMin: opc(b.duracionMin, () => entero(b.duracionMin, { campo: 'duracionMin', min: 1, max: 1440, requerido: false }), 60),
    enlace: url(b.enlace, { campo: 'enlace' }),
    cursoId: b.cursoId === undefined ? undefined : b.cursoId === null || b.cursoId === '' ? null : slug(b.cursoId, { campo: 'cursoId' }),
    publicado: opc(b.publicado, () => booleano(b.publicado, { campo: 'publicado' }), false),
    // `reservas` no se edita desde el admin: la administran los miembros.
  });
}

export function validarPreguntas(preguntas) {
  if (!Array.isArray(preguntas) || preguntas.length > 50) throw invalido('"preguntas" debe ser una lista (máx. 50).');
  return preguntas.map((p, i) => {
    if (!esObjeto(p)) throw invalido(`"preguntas[${i}]" debe ser un objeto.`);
    const prefijo = `preguntas[${i}]`;
    const tipo = unoDe(p.tipo ?? 'seleccion', TIPOS_PREGUNTA, { campo: `${prefijo}.tipo`, requerido: true });
    const referenciaVideo = p.referenciaVideo === undefined ? undefined : textoRequerido(p.referenciaVideo, { campo: `${prefijo}.referenciaVideo`, max: 8 });
    if (referenciaVideo !== undefined && !MARCA_TIEMPO.test(referenciaVideo)) throw invalido(`"${prefijo}.referenciaVideo" debe tener formato mm:ss o h:mm:ss.`);
    const base = sinIndefinidos({
      id: p.id === undefined ? undefined : textoRequerido(p.id, { campo: `${prefijo}.id`, max: 60 }),
      tipo,
      q: textoRequerido(p.q, { campo: `preguntas[${i}].q`, max: 500, multilinea: true }),
      instruccion: texto(p.instruccion, { campo: `${prefijo}.instruccion`, max: 500, multilinea: true }) ?? '',
      referenciaVideo,
      casoClinico: p.casoClinico === undefined ? undefined : textoRequerido(p.casoClinico, { campo: `${prefijo}.casoClinico`, max: 800, multilinea: true }),
      competencia: p.competencia === undefined ? undefined : textoRequerido(p.competencia, { campo: `${prefijo}.competencia`, max: 160 }),
      nivelCognitivo: p.nivelCognitivo === undefined ? undefined : unoDe(p.nivelCognitivo, NIVELES_COGNITIVOS, { campo: `${prefijo}.nivelCognitivo`, requerido: true }),
      explicacion: texto(p.explicacion, { campo: `${prefijo}.explicacion`, max: 1000, multilinea: true }) ?? '',
    });
    const listaElementos = (valor, campo, { min = 2, max = 10 } = {}) => {
      if (!Array.isArray(valor) || valor.length < min || valor.length > max) throw invalido(`"${campo}" debe tener entre ${min} y ${max} elementos.`);
      const elementos = valor.map((x, j) => {
        if (!esObjeto(x)) throw invalido(`"${campo}[${j}]" debe ser un objeto.`);
        return {
          id: textoRequerido(x.id, { campo: `${campo}[${j}].id`, max: 60 }),
          texto: textoRequerido(x.texto, { campo: `${campo}[${j}].texto`, max: LIMITES.medio }),
        };
      });
      if (new Set(elementos.map((x) => x.id)).size !== elementos.length) throw invalido(`"${campo}" contiene IDs repetidos.`);
      return elementos;
    };
    if (tipo === 'seleccion' || tipo === 'seleccion_multiple') {
      if (!Array.isArray(p.opciones) || p.opciones.length < 2 || p.opciones.length > 6) throw invalido(`"${prefijo}.opciones" debe tener entre 2 y 6 opciones.`);
      const opciones = p.opciones.map((o, j) => textoRequerido(o, { campo: `${prefijo}.opciones[${j}]`, max: LIMITES.medio }));
      if (new Set(opciones.map((o) => o.toLocaleLowerCase('es'))).size !== opciones.length) throw invalido(`"${prefijo}.opciones" contiene opciones repetidas.`);
      if (tipo === 'seleccion') return { ...base, opciones, correcta: entero(p.correcta, { campo: `${prefijo}.correcta`, min: 0, max: opciones.length - 1 }) };
      if (!Array.isArray(p.correctas) || !p.correctas.length) throw invalido(`"${prefijo}.correctas" debe incluir al menos una respuesta.`);
      const correctas = p.correctas.map((v, j) => entero(v, { campo: `${prefijo}.correctas[${j}]`, min: 0, max: opciones.length - 1 }));
      if (new Set(correctas).size !== correctas.length) throw invalido(`"${prefijo}.correctas" contiene índices repetidos.`);
      return { ...base, opciones, correctas };
    }
    if (tipo === 'ordenar') {
      const elementos = listaElementos(p.elementos, `${prefijo}.elementos`);
      if (!Array.isArray(p.ordenCorrecto) || p.ordenCorrecto.length !== elementos.length) throw invalido(`"${prefijo}.ordenCorrecto" debe incluir todos los elementos.`);
      const ordenCorrecto = p.ordenCorrecto.map(String);
      const ids = new Set(elementos.map((x) => x.id));
      if (new Set(ordenCorrecto).size !== elementos.length || ordenCorrecto.some((id) => !ids.has(id))) throw invalido(`"${prefijo}.ordenCorrecto" no coincide con los elementos.`);
      return { ...base, elementos, ordenCorrecto };
    }
    if (tipo === 'relacionar') {
      const izquierda = listaElementos(p.izquierda, `${prefijo}.izquierda`);
      const derecha = listaElementos(p.derecha, `${prefijo}.derecha`);
      if (!esObjeto(p.pares)) throw invalido(`"${prefijo}.pares" debe ser un objeto.`);
      const idsDerecha = new Set(derecha.map((x) => x.id));
      const pares = Object.fromEntries(izquierda.map((x) => {
        const valor = String(p.pares[x.id] ?? '');
        if (!idsDerecha.has(valor)) throw invalido(`"${prefijo}.pares.${x.id}" no apunta a una opción válida.`);
        return [x.id, valor];
      }));
      return { ...base, izquierda, derecha, pares };
    }
    const plantilla = textoRequerido(p.plantilla, { campo: `${prefijo}.plantilla`, max: 1000, multilinea: true });
    if (!Array.isArray(p.huecos) || p.huecos.length < 1 || p.huecos.length > 10) throw invalido(`"${prefijo}.huecos" debe tener entre 1 y 10 elementos.`);
    const huecos = p.huecos.map((h, j) => {
      if (!esObjeto(h)) throw invalido(`"${prefijo}.huecos[${j}]" debe ser un objeto.`);
      if (!Array.isArray(h.respuestas) || h.respuestas.length < 1 || h.respuestas.length > 8) throw invalido(`"${prefijo}.huecos[${j}].respuestas" debe tener entre 1 y 8 respuestas.`);
      return {
        id: textoRequerido(h.id, { campo: `${prefijo}.huecos[${j}].id`, max: 60 }),
        etiqueta: texto(h.etiqueta, { campo: `${prefijo}.huecos[${j}].etiqueta`, max: LIMITES.corto }) ?? '',
        respuestas: h.respuestas.map((r, k) => textoRequerido(r, { campo: `${prefijo}.huecos[${j}].respuestas[${k}]`, max: LIMITES.medio })),
      };
    });
    if (new Set(huecos.map((h) => h.id)).size !== huecos.length) throw invalido(`"${prefijo}.huecos" contiene IDs repetidos.`);
    return { ...base, plantilla, huecos };
  });
}

export function validarConfig(body) {
  const b = esObjeto(body) ? body : {};
  let precios;
  if (b.precios !== undefined) {
    if (!esObjeto(b.precios)) throw invalido('"precios" debe ser un objeto { mensual, anual }.');
    precios = sinIndefinidos({
      mensual: numeroONulo(b.precios.mensual, { campo: 'precios.mensual', max: 1_000_000 }),
      anual: numeroONulo(b.precios.anual, { campo: 'precios.anual', max: 1_000_000 }),
    });
  }
  const PRICE = /^price_[A-Za-z0-9]+$/;
  const priceId = (v, campo) => {
    if (v === undefined) return undefined;
    if (v === null || v === '') return '';
    if (typeof v !== 'string' || !PRICE.test(v)) throw invalido(`"${campo}" debe ser un ID de precio de Stripe (price_...).`);
    return v;
  };
  return sinIndefinidos({
    precios,
    descuentoVIP: numeroONulo(b.descuentoVIP, { campo: 'descuentoVIP', max: 100 }),
    whatsappSoporte: texto(b.whatsappSoporte, { campo: 'whatsappSoporte', max: LIMITES.medio }),
    canalWhatsApp: url(b.canalWhatsApp, { campo: 'canalWhatsApp' }),
    praxiaUrl: url(b.praxiaUrl, { campo: 'praxiaUrl' }),
    stripePriceMensual: priceId(b.stripePriceMensual, 'stripePriceMensual'),
    stripePriceAnual: priceId(b.stripePriceAnual, 'stripePriceAnual'),
  });
}
