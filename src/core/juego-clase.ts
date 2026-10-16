import type { Nota } from './datos';

export type ConceptoJuego = {
  id: string;
  t: string;
  texto: string;
  segundos: number;
};

export type JuegoClase = {
  clave: string;
  tipo: 'ordenar' | 'relacionar' | 'pulso' | 'rompecabezas';
  conceptos: ConceptoJuego[];
  ordenInicial: string[];
  tiempos: string[];
  fragmentos: { id: string; texto: string }[];
  ordenFragmentos: string[];
};

export function tiempoASegundos(valor: string) {
  const partes = valor.trim().split(':').map(Number);
  if (!partes.length || partes.some((x) => !Number.isFinite(x) || x < 0)) return Number.MAX_SAFE_INTEGER;
  return partes.reduce((total, parte) => total * 60 + parte, 0);
}

function hash(texto: string) {
  let valor = 2166136261;
  for (let i = 0; i < texto.length; i += 1) {
    valor ^= texto.charCodeAt(i);
    valor = Math.imul(valor, 16777619);
  }
  return valor >>> 0;
}

function aleatorio(semilla: number) {
  let estado = semilla || 1;
  return () => {
    estado = Math.imul(estado ^ (estado >>> 15), 1 | estado);
    estado ^= estado + Math.imul(estado ^ (estado >>> 7), 61 | estado);
    return ((estado ^ (estado >>> 14)) >>> 0) / 4294967296;
  };
}

function barajar<T>(lista: T[], semilla: number) {
  const salida = [...lista];
  const azar = aleatorio(semilla);
  for (let i = salida.length - 1; i > 0; i -= 1) {
    const j = Math.floor(azar() * (i + 1));
    [salida[i], salida[j]] = [salida[j], salida[i]];
  }
  return salida;
}

export function crearJuegoClase(cursoId: string, n: number, notas?: Nota): JuegoClase | null {
  if (!notas?.conceptos?.length) return null;
  const clave = `${cursoId}:${n}`;
  const conceptos = notas.conceptos
    .map((concepto, indice) => ({
      id: `c${indice + 1}`,
      t: concepto.t,
      texto: concepto.texto,
      segundos: tiempoASegundos(concepto.t),
    }))
    .sort((a, b) => a.segundos - b.segundos || a.id.localeCompare(b.id));
  const semilla = hash(clave);
  let ordenInicial = barajar(conceptos.map((x) => x.id), semilla + 17);
  const correcto = conceptos.map((x) => x.id);
  if (ordenInicial.every((id, i) => id === correcto[i])) ordenInicial = [...ordenInicial.slice(1), ordenInicial[0]];
  const tipos = ['ordenar', 'relacionar', 'pulso'] as const;
  const palabras = conceptos[0].texto.trim().split(/\s+/);
  const totalFragmentos = Math.min(4, Math.max(3, Math.ceil(palabras.length / 4)));
  const tamano = Math.ceil(palabras.length / totalFragmentos);
  const fragmentos = Array.from({ length: totalFragmentos }, (_, indice) => ({
    id: `f${indice + 1}`,
    texto: palabras.slice(indice * tamano, (indice + 1) * tamano).join(' '),
  })).filter((x) => x.texto);
  let ordenFragmentos = barajar(fragmentos.map((x) => x.id), semilla + 47);
  if (ordenFragmentos.every((id, i) => id === fragmentos[i]?.id)) ordenFragmentos = [...ordenFragmentos.slice(1), ordenFragmentos[0]];
  return {
    clave,
    tipo: conceptos.length === 1 ? 'rompecabezas' : tipos[semilla % tipos.length],
    conceptos,
    ordenInicial,
    tiempos: barajar(conceptos.map((x) => x.t), semilla + 31),
    fragmentos,
    ordenFragmentos,
  };
}

export function puntuarOrden(juego: JuegoClase, orden: string[]) {
  const correctos = juego.conceptos.reduce((total, concepto, indice) => total + (orden[indice] === concepto.id ? 1 : 0), 0);
  return Math.round((correctos / juego.conceptos.length) * 100);
}

export function puntuarRelaciones(juego: JuegoClase, respuestas: Record<string, string>) {
  const correctos = juego.conceptos.reduce((total, concepto) => total + (respuestas[concepto.id] === concepto.t ? 1 : 0), 0);
  return Math.round((correctos / juego.conceptos.length) * 100);
}

export function opcionesPulso(juego: JuegoClase, indice: number) {
  const correcta = juego.conceptos[indice];
  if (!correcta) return [];
  const otras = barajar(juego.conceptos.filter((x) => x.id !== correcta.id), hash(`${juego.clave}:${indice}`)).slice(0, 2);
  return barajar([correcta, ...otras], hash(`${juego.clave}:opciones:${indice}`));
}
