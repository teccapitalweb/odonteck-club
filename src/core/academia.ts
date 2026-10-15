// Academia OdonTeck: capa de datos.
// - Modo demo (sin VITE_API_URL): el contenido se carga del repositorio bajo demanda y el avance vive
//   en localStorage ('odonteck-club:academia:v1:<uid>'). Sirve para diseño, no como prueba de producción.
// - Modo API: todo pasa por /academia (acceso, desbloqueo, examen y certificado se deciden en el servidor).
// El catálogo (títulos de programas y módulos) es público y viaja en el bundle; los módulos NO:
// en producción la rama de import.meta.glob desaparece y el contenido llega solo desde la API.
import imagenesJson from '../data/academia-imagenes.json';
import { api, Auth } from './auth';
import { Datos } from './datos';

export interface ModuloCatalogo { n: number; titulo: string; disponible?: boolean; estado?: string | null; temas?: number; duracionMin?: number | null }
export interface Programa {
  id: string; numero: number; titulo: string; area: string; descripcion: string; nivel: string; publico: string[];
  portada: { id: string; proporcion: string }; modulos: ModuloCatalogo[];
}
export interface Fuente { tipo: string; titulo: string; autor: string; anio?: number; url?: string }
export interface PreguntaA { id: string; q: string; opciones: string[]; correcta?: number; explicacion?: string }
export type Actividad =
  | { actividad: 'ordenar'; titulo: string; instruccion?: string; elementos: string[] }
  | { actividad: 'relacionar'; titulo: string; instruccion?: string; pares: { a: string; b: string }[] }
  | { actividad: 'vf'; titulo: string; afirmaciones: { texto: string; verdadero: boolean; explicacion: string }[] }
  | { actividad: 'caso'; titulo: string; situacion: string; opciones: { texto: string; correcta: boolean; retro: string }[] }
  | { actividad: 'calculadora'; titulo: string; instruccion?: string; formula: string; variables: { id: string; etiqueta: string; valor: number; unidad?: string }[]; resultado: { expresion: string; etiqueta: string; unidad?: string; decimales?: number } };
export type Bloque =
  | { tipo: 'subtitulo'; texto: string }
  | { tipo: 'texto'; md: string }
  | { tipo: 'lista'; titulo?: string; items: string[]; ordenada?: boolean }
  | { tipo: 'pasos'; titulo: string; pasos: { titulo: string; md: string }[] }
  | { tipo: 'tabla'; titulo: string; columnas: string[]; filas: string[][] }
  | { tipo: 'recuadro'; variante: 'atencion' | 'sabias' | 'profundizar' | 'ejemplo' | 'mexico'; titulo: string; md: string }
  | { tipo: 'figura'; id: string; proporcion: string; alt: string; pie: string; prompt?: string }
  | { tipo: 'diagrama'; id: string; pie: string; descripcion: string; elementos: string[] }
  | { tipo: 'cita'; texto: string; autor: string }
  | (Actividad & { tipo: 'actividad' });
export interface Tema {
  n: string; titulo: string; minutos: number; enPocasPalabras: string; bloques: Bloque[];
  glosario: { termino: string; definicion: string }[]; verificacion: PreguntaA[]; fuentes?: Fuente[];
}
export type Minijuego =
  | { tipo: 'sopa'; titulo: string; palabras: string[] }
  | { tipo: 'crucigrama'; titulo: string; pistas: { palabra: string; pista: string }[] }
  | { tipo: 'memorama'; titulo: string; pares: { a: string; b: string }[] };
export interface Modulo {
  programa: string; modulo: number; titulo: string; estado: string; resumen: string; objetivos: string[]; duracionMin: number;
  portada: { id: string; proporcion: string; alt: string };
  temas: Tema[]; minijuego: Minijuego;
  examen: { aprobar: number; mostrar: number; total?: number; preguntas?: PreguntaA[] };
}
export interface AvanceModulo { temas?: Record<string, string>; juego?: string; mejor?: number; intentos?: number; aprobado?: boolean; aprobadoEn?: string }
export type Avance = Record<string, { modulos?: Record<string, AvanceModulo>; certificado?: string }>;
export interface CertificadoAcademia { folio: string; tipo: 'academia'; nombre: string; programaId: string; programaTitulo: string; area: string; modulos: number; emitido: string; nuevo?: boolean }
export interface ResultadoExamen {
  correctas: number; total: number; porcentaje: number; aprobado: boolean; mejor: number;
  detalle: { id: string; correcta: number; acertada: boolean; explicacion: string }[];
  siguiente: number | null; programaCompleto: boolean; certificado?: CertificadoAcademia;
}
export type EstadoRevision = 'borrador' | 'revision' | 'aprobado';
export interface FilaRevision {
  n: number; titulo: string; existe: boolean; estadoJson: string | null; estado: string | null;
  revision: { estado: string; revisor: string | null; fecha: string | null; nota: string } | null;
  palabras: number; figuras: number; actividades: number; temas: number; preguntas: number;
}
export interface ProgramaRevision { id: string; numero: number | null; titulo: string; area: string; modulos: FilaRevision[] }

const MODO_API = Datos.modo === 'api';
const RAIZ = '../../api/content/academia';

// Catálogo público (si todavía no existe el archivo, la Academia queda vacía en lugar de romper el build).
const catalogos = import.meta.glob<{ programas: Programa[] }>('../../api/content/academia/catalogo.json', { eager: true, import: 'default' });
export const programas: Programa[] = (Object.values(catalogos)[0]?.programas ?? []).filter((p) => !p.id.startsWith('_'));
export const programa = (id: string) => programas.find((p) => p.id === id);

// ── Imágenes: solo las que ya existen en public/academia (manifiesto generado por script) ──
const imagenes = new Set<string>((imagenesJson as { ids: string[] }).ids);
export const urlImagen = (id: string) => (imagenes.has(id) ? `/academia/${id}.webp` : null);

// ── Contenido ──
// En producción (VITE_API_URL definido) esta rama desaparece del bundle: el contenido VIP no viaja público.
const locales: Record<string, () => Promise<unknown>> = import.meta.env.VITE_API_URL
  ? {}
  : import.meta.glob(['../../api/content/academia/*/modulo-*.json', '!../../api/content/academia/_*/**'], { import: 'default' });
const cacheModulos = new Map<string, Modulo>();

export class ErrorAcademia extends Error {
  codigo: string;
  constructor(codigo: string, mensaje: string) { super(mensaje); this.codigo = codigo; }
}
const comoError = (e: unknown, defecto: string) => {
  const err = e as { status?: number; codigo?: string; message?: string };
  return e instanceof ErrorAcademia ? e : new ErrorAcademia(err?.codigo || String(err?.status || 'error'), err?.message || defecto);
};

const rutaLocal = (p: string, n: number) => `${RAIZ}/${p}/modulo-${String(n).padStart(2, '0')}.json`;
export const moduloDisponibleLocal = (p: string, n: number) => !!locales[rutaLocal(p, n)];

// ── Estado remoto (modo API) ──
let avanceRemoto: Avance = {};
let certificadosRemotos: Record<string, CertificadoAcademia> = {};
let catalogoRemoto: Programa[] | null = null;
let catalogoEn = 0;
let uidCargado: string | null = null;
const TTL = 30_000;

function revisarUsuario() {
  const uid = Auth.usuario?.uid ?? null;
  if (uid !== uidCargado) {
    uidCargado = uid;
    avanceRemoto = {}; certificadosRemotos = {}; catalogoRemoto = null; catalogoEn = 0; cacheModulos.clear();
  }
}

/** Catálogo con disponibilidad por módulo. En API refresca avance y certificados. */
export async function cargarCatalogo(forzar = false): Promise<Programa[]> {
  if (!MODO_API) {
    const rev = revisionesLocales();
    return programas.map((p) => ({
      ...p,
      modulos: p.modulos.map((m) => ({ ...m, disponible: moduloDisponibleLocal(p.id, m.n), estado: rev[`${p.id}_${m.n}`]?.estado ?? null })),
    }));
  }
  revisarUsuario();
  if (catalogoRemoto && !forzar && Date.now() - catalogoEn < TTL) return catalogoRemoto;
  const r = await api<{ programas: Programa[]; progreso: Avance; certificados?: Record<string, CertificadoAcademia> }>('/academia');
  catalogoRemoto = r.programas;
  avanceRemoto = r.progreso ?? {};
  certificadosRemotos = r.certificados ?? {};
  catalogoEn = Date.now();
  return catalogoRemoto;
}

export async function cargarModulo(p: string, n: number): Promise<Modulo> {
  if (MODO_API) revisarUsuario();
  const clave = `${p}/${n}`;
  const guardado = cacheModulos.get(clave);
  if (guardado) return guardado;
  let m: Modulo;
  if (MODO_API) {
    try { m = await api<Modulo>(`/academia/${encodeURIComponent(p)}/${n}`); }
    catch (e) { throw comoError(e, 'No se pudo cargar el módulo.'); }
  } else {
    const cargar = locales[rutaLocal(p, n)];
    if (!cargar) throw new ErrorAcademia('modulo_en_preparacion', 'Este módulo está en preparación.');
    m = (await cargar()) as Modulo;
  }
  cacheModulos.set(clave, m);
  return m;
}

/** Precarga de la ruta (llamada desde remoto.ts antes de pintar en modo API). Los errores se muestran al pintar. */
export async function cargarAcademiaDeRuta(path: string) {
  const m = path.match(/^\/academia(?:\/([^/]+))?(?:\/(\d+))?/);
  if (!m) return;
  const tareas: Promise<unknown>[] = [cargarCatalogo(true)];
  if (m[1] && m[2]) tareas.push(cargarModulo(decodeURIComponent(m[1]), Number(m[2])));
  await Promise.allSettled(tareas);
}

// ── Avance ──
const claveLocal = () => `odonteck-club:academia:v1:${Auth.usuario?.uid || 'anonimo'}`;
function leerLocal(): Avance { try { const v = JSON.parse(localStorage.getItem(claveLocal()) || '{}'); return v && typeof v === 'object' ? v : {}; } catch { return {}; } }
function guardarLocal(a: Avance) { try { localStorage.setItem(claveLocal(), JSON.stringify(a)); } catch { /* sin almacenamiento */ } }

export const avance = (): Avance => (MODO_API ? avanceRemoto : leerLocal());
export const avanceModulo = (p: string, n: number): AvanceModulo => avance()[p]?.modulos?.[String(n)] ?? {};
export async function refrescarAvance() { if (MODO_API) avanceRemoto = await api<Avance>('/academia/progreso'); }

function mutarLocal(p: string, n: number, fn: (m: AvanceModulo) => void) {
  const a = leerLocal();
  const prog = (a[p] ||= {}); const mods = (prog.modulos ||= {}); const m = (mods[String(n)] ||= {});
  fn(m); guardarLocal(a);
}
function mutarCache(p: string, n: number, fn: (m: AvanceModulo) => void) {
  const prog = (avanceRemoto[p] ||= {}); const mods = (prog.modulos ||= {}); fn((mods[String(n)] ||= {}));
}

export async function marcarTemaLeido(p: string, n: number, tema: string) {
  const ahora = new Date().toISOString();
  if (!MODO_API) return mutarLocal(p, n, (m) => { (m.temas ||= {})[tema] ||= ahora; });
  if (avanceModulo(p, n).temas?.[tema]) return;
  mutarCache(p, n, (m) => { (m.temas ||= {})[tema] = ahora; });
  try { await api(`/academia/${encodeURIComponent(p)}/${n}/tema`, { method: 'POST', json: { tema } }); } catch { /* se reintenta en la siguiente lectura */ }
}

// El minijuego es práctica sin valor: su marca vive en el navegador en ambos modos.
const claveJuegos = () => `odonteck-club:academia:juegos:${Auth.usuario?.uid || 'anonimo'}`;
export function marcarJuego(p: string, n: number) {
  try { const j = JSON.parse(localStorage.getItem(claveJuegos()) || '{}'); j[`${p}/${n}`] ||= new Date().toISOString(); localStorage.setItem(claveJuegos(), JSON.stringify(j)); } catch { /* sin almacenamiento */ }
}
export function juegoCompletado(p: string, n: number) {
  try { return !!JSON.parse(localStorage.getItem(claveJuegos()) || '{}')[`${p}/${n}`]; } catch { return false; }
}

const CLAVE_REVISOR = 'odonteck-club:academia:modo-revisor';
export function modoRevisorDemo() { try { return !MODO_API && localStorage.getItem(CLAVE_REVISOR) === '1'; } catch { return false; } }
export function alternarModoRevisorDemo() { try { if (modoRevisorDemo()) localStorage.removeItem(CLAVE_REVISOR); else localStorage.setItem(CLAVE_REVISOR, '1'); } catch { /* sin almacenamiento */ } }

/** Admin real (claim verificado por la API). En demo solo salta candados con el «modo revisor» activado, para poder probar también el flujo normal. */
export const esAdminAcademia = () => (MODO_API && !!Auth.usuario?.esAdmin) || (modoRevisorDemo() && !!Auth.usuario?.esAdmin);
export const moduloAprobado = (p: string, n: number) => !!avanceModulo(p, n).aprobado;
export const moduloDesbloqueado = (p: string, n: number) => n === 1 || moduloAprobado(p, n - 1) || esAdminAcademia();
export function temasLeidos(p: string, m: Modulo) { const t = avanceModulo(p, m.modulo).temas || {}; return m.temas.filter((x) => t[x.n]).length; }

export function resumenPrograma(p: Programa) {
  const aprobados = p.modulos.filter((m) => moduloAprobado(p.id, m.n)).length;
  const siguiente = p.modulos.find((m) => !moduloAprobado(p.id, m.n))?.n ?? p.modulos.length;
  const iniciado = Object.keys(avance()[p.id]?.modulos || {}).length > 0;
  const total = p.modulos.length || 1;
  return { aprobados, total: p.modulos.length, pct: Math.round((aprobados / total) * 100), siguiente, iniciado, completo: p.modulos.length > 0 && aprobados === p.modulos.length };
}

// ── Certificados ──
const claveCertLocal = () => `odonteck-club:academia:certificados:${Auth.usuario?.uid || 'anonimo'}`;
function certificadosLocales(): Record<string, CertificadoAcademia> { try { return JSON.parse(localStorage.getItem(claveCertLocal()) || '{}'); } catch { return {}; } }
export const certificadoDe = (p: string): CertificadoAcademia | null => (MODO_API ? certificadosRemotos[p] : certificadosLocales()[p]) ?? null;
export const certificadosAcademia = (): CertificadoAcademia[] => Object.values(MODO_API ? certificadosRemotos : certificadosLocales());

function emitirCertificadoLocal(p: Programa): CertificadoAcademia {
  const todos = certificadosLocales();
  if (todos[p.id]) return { ...todos[p.id], nuevo: false };
  const emitido = new Date().toISOString();
  let h = 0; for (const ch of `${p.id}${Auth.usuario?.uid || ''}academia`) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const cert: CertificadoAcademia = {
    folio: `ODT-${emitido.slice(0, 4)}-${String(h % 100000).padStart(5, '0')}`, tipo: 'academia', nombre: Auth.usuario?.nombre || 'Miembro OdonTeck',
    programaId: p.id, programaTitulo: p.titulo, area: p.area, modulos: p.modulos.length, emitido,
  };
  todos[p.id] = cert;
  try { localStorage.setItem(claveCertLocal(), JSON.stringify(todos)); } catch { /* sin almacenamiento */ }
  return { ...cert, nuevo: true };
}
/** Verificación demo de un folio de Academia emitido en este navegador. */
export const verificarFolioLocal = (folio: string) => certificadosAcademia().find((c) => c.folio === folio) ?? null;

// ── Examen ──
export async function emitirExamen(p: string, n: number): Promise<{ aprobar: number; preguntas: PreguntaA[] }> {
  if (MODO_API) {
    try { return await api(`/academia/${encodeURIComponent(p)}/${n}/examen`); } catch (e) { throw comoError(e, 'No se pudo iniciar el examen.'); }
  }
  const m = await cargarModulo(p, n);
  const banco = [...(m.examen.preguntas || [])];
  for (let i = banco.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [banco[i], banco[j]] = [banco[j], banco[i]]; }
  return { aprobar: m.examen.aprobar, preguntas: banco.slice(0, m.examen.mostrar).map(({ id, q, opciones }) => ({ id, q, opciones })) };
}

export async function calificarExamen(p: string, n: number, ids: string[], respuestas: Record<string, number | null>): Promise<ResultadoExamen> {
  if (MODO_API) {
    let r: ResultadoExamen;
    try { r = await api<ResultadoExamen>(`/academia/${encodeURIComponent(p)}/${n}/examen`, { method: 'POST', json: { respuestas } }); }
    catch (e) { throw comoError(e, 'No se pudo calificar el examen.'); }
    mutarCache(p, n, (m) => { m.mejor = r.mejor; m.intentos = (m.intentos || 0) + 1; if (r.aprobado) m.aprobado = true; });
    if (r.certificado) { certificadosRemotos[p] = r.certificado; (avanceRemoto[p] ||= {}).certificado = r.certificado.folio; }
    catalogoEn = 0;
    return r;
  }
  const m = await cargarModulo(p, n);
  const banco = new Map((m.examen.preguntas || []).map((q) => [q.id, q]));
  const detalle = ids.map((id) => { const q = banco.get(id)!; return { id, correcta: q.correcta!, acertada: respuestas[id] === q.correcta, explicacion: q.explicacion || '' }; });
  const correctas = detalle.filter((d) => d.acertada).length;
  const porcentaje = Math.round((correctas / Math.max(1, detalle.length)) * 100);
  const aprobado = correctas / Math.max(1, detalle.length) >= 0.7;
  let mejor = porcentaje;
  mutarLocal(p, n, (a) => { a.mejor = Math.max(a.mejor || 0, porcentaje); mejor = a.mejor; a.intentos = (a.intentos || 0) + 1; if (aprobado && !a.aprobado) { a.aprobado = true; a.aprobadoEn = new Date().toISOString(); } });
  const prog = programa(p)!;
  const ultimo = Math.max(...prog.modulos.map((x) => x.n));
  const completo = prog.modulos.every((x) => moduloAprobado(p, x.n));
  const certificado = completo ? emitirCertificadoLocal(prog) : undefined;
  return { correctas, total: detalle.length, porcentaje, aprobado, mejor, detalle, siguiente: aprobado && n < ultimo ? n + 1 : null, programaCompleto: completo, ...(certificado ? { certificado } : {}) };
}

// ── Revisión editorial (panel admin) ──
const CLAVE_REVISIONES = 'odonteck-club:academia:revisiones:demo';
function revisionesLocales(): Record<string, { estado: EstadoRevision; nota: string; fecha: string }> {
  try { return JSON.parse(localStorage.getItem(CLAVE_REVISIONES) || '{}'); } catch { return {}; }
}
const palabrasDe = (s: unknown) => String(s ?? '').trim().split(/\s+/).filter(Boolean).length;
function metricas(m: Modulo) {
  let palabras = 0, figuras = m.portada ? 1 : 0, actividades = 0;
  for (const t of m.temas || []) for (const b of t.bloques || []) {
    if (b.tipo === 'texto' || b.tipo === 'recuadro') palabras += palabrasDe(b.md);
    else if (b.tipo === 'lista') palabras += palabrasDe(b.items.join(' '));
    else if (b.tipo === 'pasos') palabras += palabrasDe(b.pasos.map((x) => `${x.titulo} ${x.md}`).join(' '));
    else if (b.tipo === 'tabla') palabras += palabrasDe(b.filas.flat().join(' '));
    else if (b.tipo === 'figura') figuras++;
    else if (b.tipo === 'actividad') actividades++;
  }
  return { palabras, figuras, actividades, temas: m.temas?.length || 0, preguntas: m.examen?.preguntas?.length || 0 };
}

export async function cargarRevisionAcademia(): Promise<ProgramaRevision[]> {
  if (MODO_API) return (await api<{ programas: ProgramaRevision[] }>('/admin/academia')).programas;
  const rev = revisionesLocales();
  return Promise.all(programas.map(async (p) => ({
    id: p.id, numero: p.numero, titulo: p.titulo, area: p.area,
    modulos: await Promise.all(p.modulos.map(async (mm): Promise<FilaRevision> => {
      const m = moduloDisponibleLocal(p.id, mm.n) ? await cargarModulo(p.id, mm.n).catch(() => null) : null;
      const r = rev[`${p.id}_${mm.n}`];
      return {
        n: mm.n, titulo: mm.titulo, existe: !!m, estadoJson: m?.estado ?? null, estado: m ? (r?.estado ?? m.estado) : null,
        revision: r ? { estado: r.estado, revisor: 'demo', fecha: r.fecha, nota: r.nota } : null,
        ...(m ? metricas(m) : { palabras: 0, figuras: 0, actividades: 0, temas: 0, preguntas: 0 }),
      };
    })),
  })));
}

export async function revisarModulo(p: string, n: number, estado: EstadoRevision, nota = '') {
  if (MODO_API) {
    await api(`/admin/academia/${encodeURIComponent(p)}/${n}`, { method: 'PATCH', json: { estado, nota } });
    catalogoEn = 0; cacheModulos.delete(`${p}/${n}`);
    return;
  }
  const rev = revisionesLocales();
  rev[`${p}_${n}`] = { estado, nota, fecha: new Date().toISOString() };
  try { localStorage.setItem(CLAVE_REVISIONES, JSON.stringify(rev)); } catch { /* sin almacenamiento */ }
}
