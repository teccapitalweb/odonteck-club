// Reparte la posición de la respuesta correcta entre A, B, C y D en exámenes y verificaciones,
// moviendo opciones de lugar sin tocar su texto. Evita que «siempre B» apruebe un examen.
// Respeta preguntas cuyas opciones dependen del orden (por ejemplo «A y B», «ambas»).
// Uso: node scripts/academia/balancear-respuestas.mjs [programa] [--aplicar]
// Sin --aplicar solo simula. Las carpetas que empiezan con "_" se ignoran.
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const base = fileURLToPath(new URL('../../api/content/academia/', import.meta.url));
const args = process.argv.slice(2);
const aplicar = args.includes('--aplicar');
const filtro = args.find((a) => !a.startsWith('--'));
const catalogo = JSON.parse(readFileSync(join(base, 'catalogo.json'), 'utf8'));
const DEPENDE_ORDEN = /\b(ambas|ambos|las dos|anteriores|opci[oó]n [abcd]|incisos?)\b|\b[ABCD] y [ABCD]\b/i;
const hash = (s) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 17);

function balancear(preguntas, semilla) {
  const movibles = preguntas.filter((p) => Array.isArray(p.opciones) && p.opciones.length === 4 && !p.opciones.some((o) => DEPENDE_ORDEN.test(o)) && !/\b(?:[Oo]pci[oó]n|[Ii]nciso|[Rr]espuesta) [ABCD]\b/.test(p.explicacion || ''));
  // Posiciones objetivo: ciclo A-D barajado de forma estable por módulo.
  const objetivo = [];
  let a = semilla;
  while (objetivo.length < movibles.length) {
    const bloque = [0, 1, 2, 3];
    for (let i = 3; i > 0; i--) { a = (a * 1103515245 + 12345) >>> 0; const j = a % (i + 1); [bloque[i], bloque[j]] = [bloque[j], bloque[i]]; }
    objetivo.push(...bloque);
  }
  let cambios = 0;
  movibles.forEach((p, i) => {
    const destino = objetivo[i];
    if (p.correcta === destino) return;
    const ops = [...p.opciones];
    [ops[p.correcta], ops[destino]] = [ops[destino], ops[p.correcta]];
    p.opciones = ops; p.correcta = destino; cambios++;
  });
  return cambios;
}

const distribucion = (ps) => ps.reduce((c, p) => (c[p.correcta]++, c), [0, 0, 0, 0]);
let totalCambios = 0, modulos = 0;
for (const prog of catalogo.programas.filter((p) => !String(p.id).startsWith('_') && (!filtro || p.id === filtro))) {
  const dir = join(base, prog.id);
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir).filter((x) => /^modulo-\d\d\.json$/.test(x))) {
    const ruta = join(dir, f);
    let m;
    try { m = JSON.parse(readFileSync(ruta, 'utf8')); } catch { console.log(`  omitido ${prog.id}/${f}: JSON incompleto`); continue; }
    if (!Array.isArray(m.examen?.preguntas) || m.examen.preguntas.length < 15) continue;
    const antes = distribucion(m.examen.preguntas).join('/');
    let cambios = balancear(m.examen.preguntas, hash(`${prog.id}${f}`));
    const verif = (m.temas || []).flatMap((t) => (Array.isArray(t.verificacion) ? t.verificacion : []));
    cambios += balancear(verif, hash(`${prog.id}${f}v`));
    if (!cambios) continue;
    modulos++; totalCambios += cambios;
    console.log(`  ${prog.id}/${f}: examen ${antes} → ${distribucion(m.examen.preguntas).join('/')} (${cambios} preguntas)`);
    if (aplicar) writeFileSync(ruta, JSON.stringify(m, null, 2) + '\n');
  }
}
console.log(`${aplicar ? 'Aplicado' : 'Simulación'}: ${totalCambios} preguntas en ${modulos} módulos.`);
