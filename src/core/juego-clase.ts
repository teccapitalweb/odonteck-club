import type { Nota } from './datos';

export type TipoJuegoClase = 'rompecabezas' | 'sopa' | 'ahorcado' | 'memorama' | 'palabra';

export type TerminoClinico = {
  id: string;
  palabra: string;      // Normalizada A-Z sin tildes (4..10 letras)
  etiqueta: string;     // Palabra original con tildes y capitalización limpia
  pista: string;        // Idea clínica completa de la clase
  pistaCorta: string;   // Idea resumida para tarjetas de memorama
  pistaOculta: string;  // Idea clínica con [ _____ ] en lugar de la palabra
  color: number;        // Índice de color 0..4
};

export type PalabraEnSopa = {
  id: string;
  palabra: string;
  etiqueta: string;
  pista: string;
  color: number;
  fila: number;
  col: number;
  df: number;
  dc: number;
  celdas: string[];
};

export type SopaDeLetras = {
  filas: number;
  columnas: number;
  matriz: string[][];
  palabras: PalabraEnSopa[];
};

export type PiezaImagen = {
  indiceCorrecto: number; // 0..5 (3 columnas × 2 filas)
  fila: number;
  col: number;
  concepto: string;
};

export type CartaMemorama = {
  uid: string;
  parId: string;
  tipo: 'termino' | 'definicion';
  texto: string;
  subtexto: string;
  color: number;
};

export type RetoPalabra = {
  id: string;
  palabra: string;
  etiqueta: string;
  pistaOculta: string;
  pistaCompleta: string;
  letrasBarajadas: { id: string; letra: string }[];
};

export type JuegoClase = {
  clave: string;
  tipo: TipoJuegoClase;
  imagen: string;
  terminos: TerminoClinico[];
  rompecabezasImagen: {
    columnas: number;
    filas: number;
    piezas: PiezaImagen[];
    ordenInicial: number[];
  };
  sopa: SopaDeLetras;
  ahorcado: TerminoClinico[];
  memorama: CartaMemorama[];
  retosPalabra: RetoPalabra[];
};

export const PROGRESO_JUEGO_KEY = 'odonteck-club:juegos-clase:v1';

export function obtenerPuntajeJuego(clave: string): number {
  try {
    const datos = JSON.parse(localStorage.getItem(PROGRESO_JUEGO_KEY) || '{}');
    return Number(datos?.[clave]?.mejorPuntaje || 0);
  } catch {
    return 0;
  }
}

export const INFO_TIPO_JUEGO: Record<TipoJuegoClase, { etiqueta: string; titulo: string; resumen: string; icono: string }> = {
  rompecabezas: {
    etiqueta: 'Rompecabezas visual',
    titulo: 'Arma la escena clínica de la clase',
    resumen: 'Reconstruye la fotografía clínica de esta clase en 6 piezas interactivas y desbloquea sus puntos clave.',
    icono: 'puzzle',
  },
  sopa: {
    etiqueta: 'Sopa de letras clínica',
    titulo: 'Encuentra los conceptos clave',
    resumen: 'Localiza en el tablero los 5 términos clínicos esenciales explicados durante la clase.',
    icono: 'grid-3x3',
  },
  ahorcado: {
    etiqueta: 'El ahorcado clínico',
    titulo: 'Descubre el término oculto',
    resumen: 'Adivina el concepto clínico letra por letra a partir de la pista de la clase sin agotar las 6 vidas.',
    icono: 'shield-alert',
  },
  memorama: {
    etiqueta: 'Memorama clínico 3D',
    titulo: 'Conecta cada concepto con su idea',
    resumen: 'Voltea las tarjetas ilustradas para emparejar cada término de la clase con su aplicación clínica.',
    icono: 'layers',
  },
  palabra: {
    etiqueta: 'Palabra secreta',
    titulo: 'Ordena las letras del concepto',
    resumen: 'Forma el término clínico correcto tocando las fichas de letras desordenadas con apoyo de la pista.',
    icono: 'spell-check',
  },
};

const IMAGENES_ORTODONCIA: Record<number, string> = {
  1: '/cursos/diagnostico-en-ortodoncia-para-odontologos-generales/clase-01-diagnostico-integral.png',
  2: '/cursos/diagnostico-en-ortodoncia-para-odontologos-generales/clase-02-historia-fotografias-registros.png',
  3: '/cursos/diagnostico-en-ortodoncia-para-odontologos-generales/clase-03-radiologia-cefalometria.png',
  4: '/cursos/diagnostico-en-ortodoncia-para-odontologos-generales/clase-04-integracion-mecanicas.png',
  5: '/cursos/diagnostico-en-ortodoncia-para-odontologos-generales/clase-05-trazado-casos.png',
};

export function resolverImagenClase(cursoId: string, n: number, portadaCurso?: string): string {
  if (cursoId === 'diagnostico-en-ortodoncia-para-odontologos-generales' && IMAGENES_ORTODONCIA[n]) {
    return IMAGENES_ORTODONCIA[n];
  }
  if (portadaCurso) return portadaCurso;
  return `/cursos/${cursoId}.webp`;
}

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

export function normalizarPalabra(palabra: string) {
  return palabra
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '');
}

const TERMINOS_PRIORITARIOS = new Set([
  'ORTODONCIA', 'ORTODONCICO', 'ORTODONCICA', 'OCLUSION', 'OCLUSAL', 'OCLUSALES',
  'PERIODONTO', 'PERIODONTAL', 'ANAMNESIS', 'RADIOGRAFIA', 'PANORAMICA', 'CEFALOMETRIA',
  'CONSENTIMIENTO', 'ALINEADORES', 'BRACKETS', 'APINAMIENTO', 'DENTARIO', 'DENTARIA',
  'CARIES', 'BIOFILM', 'ICDAS', 'ESMALTE', 'DENTINA', 'FLUOR', 'SONDA', 'MORDIDA',
  'PULPA', 'PULPAR', 'PULPOTOMIA', 'PULPECTOMIA', 'NECROTICA', 'RADICULAR', 'CONDUCTOS',
  'ANESTESIA', 'LUXACION', 'ELEVADOR', 'FORCEPS', 'ALVEOLO', 'SUTURA', 'ALVEOLITIS',
  'EXODONCIA', 'ESPACIO', 'MANTENEDOR', 'ERUPCION', 'ERUPCIONAR', 'CEMENTADO', 'HIGIENE',
  'IMPLANTE', 'IMPLANTES', 'COLGAJO', 'INCISION', 'BIOTIPO', 'PROTESIS', 'CORONA', 'CORONAS',
  'ENDODONCIA', 'IRRIGACION', 'OBTURACION', 'OBTURAR', 'GUTAPERCHA', 'AISLAMIENTO',
  'DIQUE', 'GRAPA', 'RESINA', 'RESINAS', 'ADHESIVO', 'ADHESION', 'GRABADO',
  'PEROXIDO', 'GINGIVITIS', 'SONDAJE', 'CURETAJE', 'TRAUMATISMO', 'AVULSION',
  'FERULA', 'FERULAS', 'DIAGNOSTICO', 'PRONOSTICO', 'HISTORIA', 'FOTOGRAFIAS',
  'MODELOS', 'VITALIDAD', 'ANATOMIA', 'APICAL', 'LIGAMENTO', 'COMPRESION', 'CONTENCION',
  'TOMOGRAFIA', 'LESION', 'LESIONES', 'PACIENTE', 'CLINICO', 'CLINICA', 'ESTETICA',
  'ARCADA', 'ARCADAS', 'RAICES', 'HUESO', 'DIENTE', 'DIENTES', 'PRIMARIO', 'PRIMARIOS',
  'PERMANENTE', 'SIMETRIA', 'PERFIL', 'HABITOS', 'CARIOGENICO', 'DIETA', 'SECADO',
]);

const PALABRAS_EXCLUIDAS = new Set([
  'PARA', 'COMO', 'ESTE', 'ESTA', 'ESTOS', 'ESTAS', 'SOLO', 'CADA', 'PERO', 'SINO',
  'ANTE', 'BAJO', 'CABE', 'CONTRA', 'DESDE', 'DURANTE', 'ENTRE', 'HACIA', 'HASTA',
  'MEDIANTE', 'SEGUN', 'SOBRE', 'TRAS', 'CUANDO', 'DONDE', 'QUIEN', 'CUAL', 'CUALES',
  'TODO', 'TODA', 'TODOS', 'TODAS', 'OTRO', 'OTRA', 'OTROS', 'OTRAS', 'MISMO', 'MISMA',
  'DEBE', 'DEBEN', 'PUEDE', 'PUEDEN', 'TIENE', 'TIENEN', 'HACE', 'HACEN', 'ESTAR',
  'ESTAN', 'SERA', 'SEAN', 'SIDO', 'AUNQUE', 'PORQUE', 'ADEMAS', 'TAMBIEN', 'DESPUES',
  'ANTES', 'LUEGO', 'SIEMPRE', 'NUNCA', 'MUCHO', 'POCO', 'GRAN', 'PARTE', 'FORMA',
  'CASO', 'CASOS', 'CLASE', 'CLASES', 'CURSO', 'CURSOS', 'VIDEO', 'TEMA', 'PUNTO',
  'PUNTOS', 'TIPO', 'TIPOS', 'NIVEL', 'AREA', 'EQUIPO', 'ODONTECK', 'GENERAL',
  'GENERALES', 'DENTRO', 'FUERA', 'MENOS', 'MAYOR', 'MENOR', 'MEJOR', 'PEOR',
  'PRIMERO', 'PRIMERA', 'SEGUNDO', 'SEGUNDA', 'TERCERO', 'TERCERA', 'DIFERENCIAR',
  'CONSIDERAR', 'INTEGRAR', 'INTEGRA', 'PERMITE', 'PERMITEN', 'EXPLICAR', 'EXPLICA',
  'EXPLICADA', 'PRESENTA', 'PRESENTADO', 'RECONOCER', 'SELECCIONAR', 'DECIDIR',
  'DECIDE', 'INICIAR', 'ELEGIR', 'COMBINADAS', 'ESPERADA', 'EXISTENTES', 'PREVIOS',
  'PREVIAS', 'POSIBLE', 'CORRECTA', 'ADECUADO', 'ADECUADA', 'CUIDADOSA', 'PROGRESIVA',
  'INICIAL', 'PRINCIPAL', 'INDIVIDUAL', 'ACOMPANE', 'REQUIERE', 'COLOCARLO', 'CONSERVAR',
  'RETIRAR', 'ENTENDERLA', 'BUSCAR', 'JUSTIFICAR', 'SIRVEN', 'PLANIFICAR', 'MANEJO',
  'VALORACION', 'SELECCION', 'RELACION', 'REVISION', 'COMPLETA', 'COMPLETO', 'CONTROL',
]);

function capitalizar(texto: string) {
  const limpio = texto.trim();
  if (!limpio) return '';
  return limpio.charAt(0).toUpperCase() + limpio.slice(1);
}

function ocultarEnPista(pista: string, etiqueta: string) {
  const escapada = etiqueta.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(^|[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ])(${escapada})(?=$|[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ])`, 'i');
  if (regex.test(pista)) {
    return pista.replace(regex, (_, previo) => `${previo}_____`);
  }
  return `${pista} (_____ )`;
}

function recortarPista(pista: string, etiqueta: string) {
  const sinPalabra = ocultarEnPista(pista, etiqueta).replace('_____', '•••');
  if (sinPalabra.length <= 92) return sinPalabra;
  return `${sinPalabra.slice(0, 89).trim()}…`;
}

function extraerTerminos(notas?: Nota, cursoTitulo = '', claseTitulo = ''): TerminoClinico[] {
  const frasesBase: string[] = [];
  for (const c of notas?.conceptos || []) {
    if (c.texto?.trim()) frasesBase.push(c.texto.trim());
  }
  const frasesExpandidas: string[] = [...frasesBase];
  if (frasesExpandidas.length < 5) {
    for (const f of frasesBase) {
      for (const parte of f.split(/[;:]+/).map((s) => s.trim()).filter((s) => s.length >= 16)) {
        if (!frasesExpandidas.includes(parte)) frasesExpandidas.push(parte);
      }
    }
  }
  if (notas?.resumen?.trim()) {
    for (const parte of notas.resumen.split(/[.;]+/).map((s) => s.trim()).filter((s) => s.length >= 16)) {
      if (!frasesExpandidas.includes(parte)) frasesExpandidas.push(parte);
    }
    if (!frasesExpandidas.includes(notas.resumen.trim())) {
      frasesExpandidas.push(notas.resumen.trim());
    }
  }
  if (cursoTitulo || claseTitulo) {
    frasesExpandidas.push(`${cursoTitulo}: ${claseTitulo}`.trim());
  }

  const usados = new Set<string>();
  const terminos: TerminoClinico[] = [];

  const puntuarCandidato = (w: string) => {
    let pts = 0;
    if (TERMINOS_PRIORITARIOS.has(w)) pts += 30;
    if (w.length >= 6 && w.length <= 9) pts += 8;
    return pts + w.length;
  };

  for (const frase of frasesExpandidas) {
    if (terminos.length >= 6) break;
    const tokens = frase.split(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+/).filter(Boolean);
    const candidatos = tokens
      .map((raw) => ({ raw, w: normalizarPalabra(raw) }))
      .filter((x) => x.w.length >= 5 && x.w.length <= 10 && !PALABRAS_EXCLUIDAS.has(x.w) && !usados.has(x.w));
    candidatos.sort((a, b) => puntuarCandidato(b.w) - puntuarCandidato(a.w));
    const mejor = candidatos[0];
    if (mejor) {
      usados.add(mejor.w);
      const id = `t${terminos.length + 1}`;
      const etiqueta = capitalizar(mejor.raw);
      terminos.push({
        id,
        palabra: mejor.w,
        etiqueta,
        pista: frase,
        pistaCorta: recortarPista(frase, mejor.raw),
        pistaOculta: ocultarEnPista(frase, mejor.raw),
        color: terminos.length % 5,
      });
    }
  }

  if (terminos.length < 5) {
    for (const frase of frasesExpandidas) {
      if (terminos.length >= 6) break;
      const tokens = frase.split(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+/).filter(Boolean);
      const candidatos = tokens
        .map((raw) => ({ raw, w: normalizarPalabra(raw) }))
        .filter((x) => x.w.length >= 4 && x.w.length <= 10 && !PALABRAS_EXCLUIDAS.has(x.w) && !usados.has(x.w));
      candidatos.sort((a, b) => puntuarCandidato(b.w) - puntuarCandidato(a.w));
      for (const cand of candidatos) {
        if (terminos.length >= 6) break;
        if (usados.has(cand.w)) continue;
        usados.add(cand.w);
        const id = `t${terminos.length + 1}`;
        const etiqueta = capitalizar(cand.raw);
        terminos.push({
          id,
          palabra: cand.w,
          etiqueta,
          pista: frase,
          pistaCorta: recortarPista(frase, cand.raw),
          pistaOculta: ocultarEnPista(frase, cand.raw),
          color: terminos.length % 5,
        });
      }
    }
  }

  return terminos;
}

function construirSopa(terminos: TerminoClinico[], semilla: number): SopaDeLetras {
  const seleccion = terminos.slice(0, 5);
  const maxLong = Math.max(8, ...seleccion.map((t) => t.palabra.length));
  const lado = Math.max(10, Math.min(11, maxLong + 1));
  const filas = lado;
  const columnas = lado;
  const matriz: string[][] = Array.from({ length: filas }, () => Array.from({ length: columnas }, () => ''));
  const azar = aleatorio(semilla + 101);
  const direcciones = [
    { df: 0, dc: 1 },
    { df: 1, dc: 0 },
    { df: 1, dc: 1 },
  ];

  const colocadas: PalabraEnSopa[] = [];
  const ordenadas = [...seleccion].sort((a, b) => b.palabra.length - a.palabra.length);

  for (let idx = 0; idx < ordenadas.length; idx += 1) {
    const item = ordenadas[idx];
    const palabra = item.palabra;
    const candidatos: { fila: number; col: number; df: number; dc: number; cruces: number }[] = [];

    for (const { df, dc } of direcciones) {
      const maxF = df === 0 ? filas - 1 : filas - palabra.length;
      const maxC = dc === 0 ? columnas - 1 : columnas - palabra.length;
      for (let f = 0; f <= maxF; f += 1) {
        for (let c = 0; c <= maxC; c += 1) {
          let cabe = true;
          let cruces = 0;
          for (let k = 0; k < palabra.length; k += 1) {
            const actual = matriz[f + df * k][c + dc * k];
            if (actual !== '' && actual !== palabra[k]) {
              cabe = false;
              break;
            }
            if (actual === palabra[k]) cruces += 1;
          }
          if (cabe) candidatos.push({ fila: f, col: c, df, dc, cruces });
        }
      }
    }

    if (candidatos.length) {
      const conCruce = candidatos.filter((x) => x.cruces > 0);
      const pool = conCruce.length && azar() > 0.25 ? conCruce : candidatos;
      const elegido = pool[Math.floor(azar() * pool.length)];
      const celdas: string[] = [];
      for (let k = 0; k < palabra.length; k += 1) {
        const rf = elegido.fila + elegido.df * k;
        const rc = elegido.col + elegido.dc * k;
        matriz[rf][rc] = palabra[k];
        celdas.push(`${rf}:${rc}`);
      }
      colocadas.push({
        id: item.id,
        palabra: item.palabra,
        etiqueta: item.etiqueta,
        pista: item.pista,
        color: item.color,
        fila: elegido.fila,
        col: elegido.col,
        df: elegido.df,
        dc: elegido.dc,
        celdas,
      });
    }
  }

  colocadas.sort((a, b) => a.id.localeCompare(b.id));

  const alfabeto = 'AAABCDEEEFGHIIIJKLMNNOOOPQRSTUUVZ';
  for (let f = 0; f < filas; f += 1) {
    for (let c = 0; c < columnas; c += 1) {
      if (!matriz[f][c]) {
        matriz[f][c] = alfabeto[Math.floor(azar() * alfabeto.length)];
      }
    }
  }

  return { filas, columnas, matriz, palabras: colocadas };
}

/**
 * Garantiza que cada uno de los 18 cursos tenga exactamente 1 clase con Rompecabezas visual
 * (siempre entre la clase 1 y la 3, para cubrir cursos de 3, 4 y 5 clases) y que las demás
 * clases del mismo curso tengan juegos distintos sin repetir (sopa, ahorcado, memorama, palabra).
 */
export function elegirTipoJuego(cursoId: string, n: number): TipoJuegoClase {
  const claseActual = Math.max(1, n);
  const claseRompecabezas = cursoId === 'diagnostico-en-ortodoncia-para-odontologos-generales'
    ? 1
    : (hash(cursoId) % 3) + 1;
  if (claseActual === claseRompecabezas) return 'rompecabezas';

  const otros: TipoJuegoClase[] = ['sopa', 'ahorcado', 'memorama', 'palabra'];
  const offset = hash(`${cursoId}:otros`) % otros.length;
  const posicionSinRompe = claseActual < claseRompecabezas ? claseActual - 1 : claseActual - 2;
  return otros[(offset + posicionSinRompe) % otros.length];
}

export function crearJuegoClase(
  cursoId: string,
  n: number,
  notas?: Nota,
  cursoTitulo = '',
  claseTitulo = '',
  portadaCurso?: string,
): JuegoClase | null {
  if (!notas?.conceptos?.length) return null;
  const clave = `${cursoId}:${n}`;
  const semilla = hash(clave);
  const terminos = extraerTerminos(notas, cursoTitulo, claseTitulo);
  if (terminos.length < 3) return null;

  const tipo = elegirTipoJuego(cursoId, n);
  const imagen = resolverImagenClase(cursoId, n, portadaCurso);

  // 1. Rompecabezas visual 3:4 vertical (2 columnas x 3 filas = 6 piezas grandes y claras)
  const cols = 2;
  const rows = 3;
  const totalPiezas = cols * rows;
  const textosConceptos = notas.conceptos.map((c) => c.texto);
  const piezas: PiezaImagen[] = Array.from({ length: totalPiezas }, (_, idx) => ({
    indiceCorrecto: idx,
    fila: Math.floor(idx / cols),
    col: idx % cols,
    concepto: textosConceptos[idx % textosConceptos.length] || notas.resumen || claseTitulo,
  }));
  const baseIndices = piezas.map((p) => p.indiceCorrecto);
  let ordenInicial = barajar(baseIndices, semilla + 19);
  if (ordenInicial.every((val, i) => val === i)) {
    ordenInicial = [3, 0, 5, 1, 4, 2];
  }

  // 2. Sopa de letras
  const sopa = construirSopa(terminos, semilla);

  // 3. El ahorcado (3 palabras)
  const ahorcado = barajar(terminos, semilla + 29).slice(0, Math.min(3, terminos.length));

  // 4. Memorama (4 pares = 8 cartas)
  const paresBase = terminos.slice(0, Math.min(4, terminos.length));
  const cartasSinBarajar: CartaMemorama[] = paresBase.flatMap((t, idx) => [
    {
      uid: `${t.id}-term`,
      parId: t.id,
      tipo: 'termino',
      texto: t.etiqueta,
      subtexto: 'Concepto clave',
      color: idx % 4,
    },
    {
      uid: `${t.id}-def`,
      parId: t.id,
      tipo: 'definicion',
      texto: t.pistaCorta,
      subtexto: 'En la clase',
      color: idx % 4,
    },
  ]);
  const memorama = barajar(cartasSinBarajar, semilla + 71);

  // 5. Retos de armar la palabra (3 palabras con fichas de letras desordenadas)
  const retosPalabra: RetoPalabra[] = terminos.slice(0, Math.min(3, terminos.length)).map((t, idx) => {
    const letrasBase = t.palabra.split('').map((letra, lIdx) => ({
      id: `${t.id}-L${lIdx}`,
      letra,
    }));
    let letrasBarajadas = barajar(letrasBase, semilla + 89 + idx * 13);
    if (letrasBarajadas.every((x, i) => x.letra === t.palabra[i])) {
      letrasBarajadas = [...letrasBarajadas.slice(1), letrasBarajadas[0]];
    }
    return {
      id: t.id,
      palabra: t.palabra,
      etiqueta: t.etiqueta,
      pistaOculta: t.pistaOculta,
      pistaCompleta: t.pista,
      letrasBarajadas,
    };
  });

  return {
    clave,
    tipo,
    imagen,
    terminos,
    rompecabezasImagen: {
      columnas: cols,
      filas: rows,
      piezas,
      ordenInicial,
    },
    sopa,
    ahorcado,
    memorama,
    retosPalabra,
  };
}

export function lineaEntreCeldas(f1: number, c1: number, f2: number, c2: number): string[] {
  const df = f2 - f1;
  const dc = c2 - c1;
  if (df === 0 && dc === 0) return [`${f1}:${c1}`];
  const pasosF = Math.abs(df);
  const pasosC = Math.abs(dc);
  if (df !== 0 && dc !== 0 && pasosF !== pasosC) return [];
  const pasos = Math.max(pasosF, pasosC);
  const incF = Math.sign(df);
  const incC = Math.sign(dc);
  const celdas: string[] = [];
  for (let i = 0; i <= pasos; i += 1) {
    celdas.push(`${f1 + incF * i}:${c1 + incC * i}`);
  }
  return celdas;
}
