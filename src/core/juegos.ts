// Motor de "Retos" (arcade): XP, niveles, racha diaria, repetición espaciada,
// mazo de flashcards y banco de preguntas. En modo demo el progreso vive en localStorage.
import { Datos } from './datos';
import { cursos, curso as getCurso } from './catalogo';
import { puntos as puntosProgreso } from './logros';
import casosSeed from '../data/casos.json';

const KEY = 'odonteck-club:retos:v1';

export interface SR { due: string; reps: number }
export type Calidad = 'again' | 'hard' | 'easy';
interface Semanal { sem: string; quiz: boolean; repaso: boolean }
interface Estado {
  xp: number;
  quizBest: number;
  quizBestCombo: number;
  quizJugados: number;
  quizAciertos: number;
  quizTotal: number;
  casos: Record<string, boolean>;
  sr: Record<string, SR>;
  diaria: { fecha: string; racha: number };
  semanal: Semanal;
}

const HOY = () => new Date().toISOString().slice(0, 10);
function semanaISO(): string {
  const d = new Date(); const t = new Date(d.valueOf());
  t.setDate(t.getDate() - ((d.getDay() + 6) % 7) + 3);
  const first = new Date(t.getFullYear(), 0, 4);
  const wk = 1 + Math.round(((t.getTime() - first.getTime()) / 86400000 - 3 + ((first.getDay() + 6) % 7)) / 7);
  return `${t.getFullYear()}-W${String(wk).padStart(2, '0')}`;
}

function leerSemanal(e: Estado): Semanal {
  const sem = semanaISO();
  if (e.semanal?.sem === sem) return e.semanal;
  return { sem, quiz: false, repaso: false };
}

function leer(): Estado {
  const def: Estado = { xp: 0, quizBest: 0, quizBestCombo: 0, quizJugados: 0, quizAciertos: 0, quizTotal: 0, casos: {}, sr: {}, diaria: { fecha: '', racha: 0 }, semanal: { sem: '', quiz: false, repaso: false } };
  const e: Estado = { ...def, ...((() => { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; } })()) };
  e.semanal = leerSemanal(e);
  return e;
}
function guardar(e: Estado) {
  try { localStorage.setItem(KEY, JSON.stringify(e)); } catch {}
  window.dispatchEvent(new CustomEvent('retos:cambio'));
}

// ── Niveles (XP total = progreso real + XP de juegos) ──
export const NIVELES = [
  { nombre: 'Aprendiz', min: 0, icon: 'sprout', color: '#8a94b3' },
  { nombre: 'Bronce', min: 200, icon: 'medal', color: '#c98a5b' },
  { nombre: 'Plata', min: 600, icon: 'award', color: '#9aa7bd' },
  { nombre: 'Oro', min: 1400, icon: 'trophy', color: '#e0b341' },
  { nombre: 'Platino', min: 3000, icon: 'gem', color: '#4fa899' },
  { nombre: 'Maestro OdonTeck', min: 6000, icon: 'crown', color: '#4a7fc1' },
] as const;

export const xpTotal = () => puntosProgreso() + leer().xp;

export function nivelDesdeXP(xp: number) {
  let i = 0;
  for (let j = 0; j < NIVELES.length; j++) if (xp >= NIVELES[j].min) i = j;
  const actual = NIVELES[i];
  const sig = NIVELES[i + 1];
  const pct = sig ? Math.round(((xp - actual.min) / (sig.min - actual.min)) * 100) : 100;
  return { ...actual, indice: i, xp, siguiente: sig || null, faltan: sig ? sig.min - xp : 0, pct };
}

export const nivel = () => nivelDesdeXP(xpTotal());
export const nivelConXPJuegos = (xpJuegos: number) => nivelDesdeXP(puntosProgreso() + Math.max(0, Number(xpJuegos) || 0));

export function ganarXP(n: number) { const e = leer(); e.xp += n; guardar(e); }

// ── Reto diario (mantiene una racha) ──
export function retoDiario() {
  const e = leer();
  const hoy = HOY();
  const ayer = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const hechoHoy = e.diaria.fecha === hoy;
  const racha = e.diaria.fecha === hoy || e.diaria.fecha === ayer ? e.diaria.racha : 0;
  // pregunta del día: determinística por fecha
  const banco = bancoPreguntas();
  const idx = banco.length ? hashFecha(hoy) % banco.length : 0;
  return { hechoHoy, racha, pregunta: banco[idx] || null };
}
export function completarDiaria(acierto: boolean) {
  const e = leer(); const hoy = HOY();
  if (e.diaria.fecha === hoy) return leer().diaria; // ya se hizo
  const ayer = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  e.diaria.racha = (e.diaria.fecha === ayer ? e.diaria.racha : 0) + 1;
  e.diaria.fecha = hoy;
  e.xp += acierto ? 30 : 10;
  guardar(e);
  return e.diaria;
}
const hashFecha = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

// ── Banco de preguntas (extraído de los quizzes reales de los cursos) ──
export interface Pregunta { id: string; curso: string; area: string; q: string; opciones: string[]; correcta: number; explicacion: string }

export function bancoPreguntas(): Pregunta[] {
  const out: Pregunta[] = [];
  for (const qz of Datos.quizzes()) {
    const c = getCurso(qz.cursoId);
    qz.preguntas.forEach((p, i) => out.push({
      id: `${qz.id}#${i}`, curso: c?.titulo || qz.cursoId, area: c?.area || 'General',
      q: p.q, opciones: p.opciones, correcta: p.correcta, explicacion: p.explicacion,
    }));
  }
  return out;
}

// ── Flashcards (de los quizzes + notas de clase de los cursos) ──
export interface Flashcard { id: string; area: string; curso: string; frente: string; reverso: string }

export function mazoCompleto(): Flashcard[] {
  const cards: Flashcard[] = [];
  // 1) De cada pregunta de quiz: frente = pregunta, reverso = respuesta + explicación
  for (const p of bancoPreguntas()) {
    cards.push({ id: 'q:' + p.id, area: p.area, curso: p.curso,
      frente: p.q, reverso: `<strong>${p.opciones[p.correcta]}</strong><br>${p.explicacion}` });
  }
  // 2) De las notas de clase: concepto (con su marca de tiempo) como repaso
  for (const c of cursos) {
    for (const k of c.clases) {
      if (!k.notas) continue;
      k.notas.conceptos?.forEach((x, i) => cards.push({
        id: `n:${c.id}:${k.n}:${i}`, area: c.area, curso: c.titulo,
        frente: `${x.texto}`, reverso: `${k.notas!.resumen ? `<p>${k.notas!.resumen}</p>` : ''}<span class="faint">${c.titulo} · clase ${k.n} · ${x.t}</span>` }));
    }
  }
  return cards;
}

// Tarjetas "para hoy": vencidas por repetición espaciada + nuevas, mezcladas
export function mazoDeHoy(limite = 15): Flashcard[] {
  const e = leer(); const ahora = Date.now();
  const todas = mazoCompleto();
  const vencidas = barajar(todas.filter((c) => e.sr[c.id] && new Date(e.sr[c.id].due).getTime() <= ahora));
  const nuevas = barajar(todas.filter((c) => !e.sr[c.id]));
  return [...vencidas, ...nuevas].slice(0, limite);
}
const INTERVALOS = [1, 3, 7, 16, 35]; // días

function diasParaRepaso(reps: number): number {
  if (reps < INTERVALOS.length) return INTERVALOS[reps];
  const extra = reps - INTERVALOS.length + 1;
  return Math.min(INTERVALOS[INTERVALOS.length - 1] * Math.pow(2, extra), 365);
}

export function repasarCarta(id: string, cal: Calidad) {
  const e = leer();
  const prev = e.sr[id] || { due: '', reps: 0 };
  let reps: number;
  let dias: number;
  let xp: number;
  switch (cal) {
    case 'again': reps = 0; dias = 0; xp = 0; break;
    case 'hard':  reps = prev.reps; dias = Math.max(1, Math.round(diasParaRepaso(prev.reps) / 2)); xp = 1; break;
    case 'easy':  reps = prev.reps + 1; dias = diasParaRepaso(prev.reps); xp = 3; break;
  }
  e.sr[id] = { reps, due: new Date(Date.now() + dias * 86400000).toISOString() };
  e.xp += xp;
  e.semanal = leerSemanal(e); e.semanal.repaso = true;
  guardar(e);
}

export function obtenerSR(id: string): SR | null {
  const e = leer();
  return e.sr[id] ? { ...e.sr[id] } : null;
}

export function restaurarSR(id: string, sr: SR | null) {
  const e = leer();
  if (sr) e.sr[id] = sr; else delete e.sr[id];
  guardar(e);
}

export function estatsMazo() {
  const e = leer(); const todas = mazoCompleto();
  const dominadas = todas.filter((c) => (e.sr[c.id]?.reps || 0) >= 3).length;
  return { total: todas.length, dominadas, estudiadas: Object.keys(e.sr).length };
}

export function pendientesHoy(): number {
  const e = leer(); const ahora = Date.now();
  const todas = mazoCompleto();
  return todas.filter((c) => !e.sr[c.id] || new Date(e.sr[c.id].due).getTime() <= ahora).length;
}

export function proximoRepaso(): Date | null {
  const e = leer();
  let min = Infinity;
  for (const c of mazoCompleto()) {
    const sr = e.sr[c.id];
    if (sr && new Date(sr.due).getTime() > Date.now()) min = Math.min(min, new Date(sr.due).getTime());
  }
  return min === Infinity ? null : new Date(min);
}

// ── Quiz Relámpago ──
export function registrarQuiz(puntaje: number, aciertos: number, total: number, mejorCombo: number) {
  const e = leer();
  e.xp += Math.round(puntaje / 10);
  e.quizBest = Math.max(e.quizBest, puntaje);
  e.quizBestCombo = Math.max(e.quizBestCombo, mejorCombo);
  e.quizJugados++;
  e.quizAciertos += aciertos;
  e.quizTotal += total;
  e.semanal = leerSemanal(e); e.semanal.quiz = true;
  guardar(e);
}
export const mejorQuiz = () => leer().quizBest;

export function statsQuiz() {
  const e = leer();
  return {
    mejor: e.quizBest,
    mejorCombo: e.quizBestCombo,
    jugados: e.quizJugados,
    precision: e.quizTotal ? Math.round(e.quizAciertos / e.quizTotal * 100) : 0,
  };
}

// ── Detective Dental (casos clínicos) ──
export interface Caso {
  id: string; area: string; titulo: string; paciente: string; presentacion: string; hallazgos: string[];
  diagnostico: { pregunta: string; opciones: string[]; correcta: number; explicacion: string };
  plan: { pregunta: string; opciones: string[]; correcta: number; explicacion: string };
}
export const casos = (): Caso[] => casosSeed as Caso[];
export function resolverCaso(id: string, perfecto: boolean) {
  const e = leer();
  if (!e.casos[id] && perfecto) { e.casos[id] = true; e.xp += 50; }
  guardar(e);
}
export const casosResueltos = () => Object.values(leer().casos).filter(Boolean).length;
export const casoResuelto = (id: string) => !!leer().casos[id];

export function areasPreguntas(): string[] {
  return [...new Set(bancoPreguntas().map((p) => p.area))].sort();
}

export interface Mision { titulo: string; desc: string; ok: boolean }
export function misiones(): { items: Mision[]; pct: number } {
  const e = leer();
  const s = leerSemanal(e);
  const items: Mision[] = [
    { titulo: 'Reto diario', desc: 'Completa el reto de hoy', ok: e.diaria.fecha === HOY() },
    { titulo: 'Quiz semanal', desc: 'Juega un quiz esta semana', ok: s.quiz },
    { titulo: 'Repaso activo', desc: 'Repasa tus flashcards', ok: s.repaso },
  ];
  return { items, pct: Math.round(items.filter((m) => m.ok).length / items.length * 100) };
}

export const barajar = <T>(a: T[]): T[] => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
