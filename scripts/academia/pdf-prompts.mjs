// Genera un PDF de prompts de imágenes para un módulo: dimensiones arriba, prompt exacto abajo.
// Uso: node scripts/academia/pdf-prompts.mjs <programa> <n>
// Produce el HTML en output/pdf/ y lo convierte a PDF con Microsoft Edge (o Chrome) sin cabeza.
// La ruta del navegador se detecta; puede forzarse con la variable EDGE_PATH.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const [programa, nStr] = process.argv.slice(2);
if (!programa || !nStr) { console.error('Uso: node scripts/academia/pdf-prompts.mjs <programa> <n>'); process.exit(1); }
const n = Number(nStr);
const raiz = new URL('../../', import.meta.url);
const catalogo = JSON.parse(readFileSync(new URL('api/content/academia/catalogo.json', raiz), 'utf8'));
const prog = catalogo.programas.find((p) => p.id === programa);
if (!prog) { console.error('Programa no encontrado:', programa); process.exit(1); }
const archivo = new URL(`api/content/academia/${programa}/modulo-${String(n).padStart(2, '0')}.json`, raiz);
if (!existsSync(archivo)) { console.error(`Ese módulo todavía no está escrito: ${fileURLToPath(archivo)}`); process.exit(1); }
const m = JSON.parse(readFileSync(archivo, 'utf8'));

function buscarNavegador() {
  const candidatos = [
    process.env.EDGE_PATH,
    process.env['ProgramFiles(x86)'] && join(process.env['ProgramFiles(x86)'], 'Microsoft/Edge/Application/msedge.exe'),
    process.env.ProgramFiles && join(process.env.ProgramFiles, 'Microsoft/Edge/Application/msedge.exe'),
    process.env.LOCALAPPDATA && join(process.env.LOCALAPPDATA, 'Microsoft/Edge/Application/msedge.exe'),
    process.env.ProgramFiles && join(process.env.ProgramFiles, 'Google/Chrome/Application/chrome.exe'),
    process.env.LOCALAPPDATA && join(process.env.LOCALAPPDATA, 'Google/Chrome/Application/chrome.exe'),
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/microsoft-edge',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
  ].filter(Boolean);
  return candidatos.find((c) => existsSync(c)) ?? null;
}

const DIM = {
  '16:9': { px: '1920 × 1080 px', nota: 'Genera en 16:9 (horizontal).' },
  '4:3': { px: '1600 × 1200 px', nota: 'Si tu generador no tiene 4:3, genera en 16:9 y encuadra pensando en un recorte 4:3.' },
  '3:4': { px: '1200 × 1600 px', nota: 'Genera en 3:4 (vertical).' },
  '1:1': { px: '1400 × 1400 px', nota: 'Genera en 1:1 (cuadrada).' },
  '9:16': { px: '1080 × 1920 px', nota: 'Genera en 9:16 (vertical).' },
};
const esc = (s) => String(s ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const nn = (x) => String(x).padStart(2, '0');

const lista = [{ id: m.portada.id, prop: m.portada.proporcion, alt: m.portada.alt, prompt: m.portada.prompt, ub: 'Portada del módulo', pie: '' }];
for (const t of m.temas) { let k = 0; for (const b of t.bloques) if (b.tipo === 'figura') { k++; lista.push({ id: b.id, prop: b.proporcion, alt: b.alt, prompt: b.prompt, pie: b.pie || '', ub: `Tema ${t.n} · figura ${t.n}.${k}` }); } }
const conteo = lista.reduce((a, x) => ((a[x.prop] = (a[x.prop] || 0) + 1), a), {});

const bloques = lista.map((x, i) => {
  const d = DIM[x.prop] ?? { px: x.prop, nota: '' };
  return `<section class="img"><div class="cab"><span class="num">${nn(i + 1)}</span><div><div class="ub">${esc(x.ub)}</div><div class="alt">${esc(x.alt)}</div></div></div>
    <div class="dim"><b>Dimensiones:</b> ${esc(x.prop)} &nbsp;·&nbsp; ${d.px}<span class="nota">${esc(d.nota)}</span></div>
    <div class="pl">Prompt exacto (cópialo tal cual):</div><div class="prompt">${esc(x.prompt)}</div>
    ${x.pie ? `<div class="pie"><b>Pie en la lectura:</b> ${esc(x.pie)}</div>` : ''}</section>`;
}).join('\n');

// Colores de la marca OdonTeck (marino, azul y teal).
const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>
  @page { size: A4; margin: 16mm 14mm; } * { box-sizing: border-box; }
  body { font-family: "Segoe UI", Arial, sans-serif; color: #1b1f33; font-size: 11pt; line-height: 1.5; }
  .portada { text-align: center; padding: 60mm 0 20mm; page-break-after: always; }
  .portada .sello { display: inline-block; border: 2px solid #20254b; border-radius: 8px; padding: 6px 14px; font-size: 10pt; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; color: #2f6fb5; }
  .portada h1 { font-size: 26pt; margin: 14px 0 6px; color: #20254b; } .portada h2 { font-size: 15pt; font-weight: 600; color: #545a72; margin: 0 0 22px; }
  .portada .meta { display: inline-block; text-align: left; border: 1.5px solid #e5e2da; border-radius: 10px; padding: 14px 20px; background: #fbfaf7; font-size: 11pt; }
  .instr { max-width: 150mm; margin: 20px auto 0; text-align: left; font-size: 10pt; color: #545a72; background: #edf8f6; border: 1.5px solid #6fbfb0; border-radius: 10px; padding: 12px 16px; }
  .img { border: 1.5px solid #e5e2da; border-radius: 12px; padding: 12px 14px 14px; margin: 0 0 10px; page-break-inside: avoid; background: #fff; }
  .cab { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 8px; }
  .num { flex: 0 0 auto; display: inline-grid; place-items: center; width: 30px; height: 30px; border-radius: 8px; background: #20254b; color: #fff; font-weight: 800; font-size: 12pt; }
  .ub { font-weight: 800; font-size: 11.5pt; } .alt { color: #545a72; font-size: 9.5pt; }
  .dim { background: #eef4fb; border-left: 4px solid #2f6fb5; border-radius: 0 8px 8px 0; padding: 7px 12px; font-size: 11pt; margin-bottom: 8px; }
  .dim .nota { display: block; color: #545a72; font-size: 9pt; margin-top: 2px; }
  .pl { font-size: 8.5pt; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: #687087; margin-bottom: 4px; }
  .prompt { border: 1.5px solid #20254b; border-radius: 8px; padding: 10px 12px; background: #fff; font-size: 10.5pt; line-height: 1.55; white-space: pre-wrap; }
  .pie { margin-top: 7px; font-size: 9pt; color: #545a72; }
</style></head><body>
  <div class="portada"><span class="sello">Academia OdonTeck · Imágenes</span>
    <h1>Programa ${nn(prog.numero)} · ${esc(prog.titulo)}</h1><h2>Módulo ${n} · ${esc(m.titulo)}</h2>
    <div class="meta"><div><b>Imágenes de este módulo:</b> ${lista.length}</div>
      <div><b>Proporciones:</b> ${Object.entries(conteo).map(([k, v]) => `${v} de ${k}`).join(' · ')}</div>
      <div><b>Orden:</b> genera las imágenes en el orden de este documento (01 a ${nn(lista.length)}).</div></div>
    <div class="instr">En cada imagen, las <b>dimensiones van arriba</b> (no dentro del prompt). El <b>prompt</b> es el texto exacto para pegar en el generador. Estilo: fotografía clínica realista, consultorio dental limpio, colores naturales, equipo de protección correcto y sin rostros identificables. Sin texto, logotipos ni marcas de agua dentro de la imagen. Guarda cada imagen en la carpeta de su módulo, en orden.</div>
  </div>${bloques}</body></html>`;

const dir = fileURLToPath(new URL('output/pdf/', raiz));
mkdirSync(dir, { recursive: true });
const nombre = `Prompts-${programa}-M${nn(n)}`;
const htmlPath = join(dir, `${nombre}.html`);
const pdfPath = join(dir, `${nombre}.pdf`);
writeFileSync(htmlPath, html);
const navegador = buscarNavegador();
if (!navegador) {
  console.log(`No se encontró Microsoft Edge ni Chrome; abre el HTML y guárdalo como PDF: ${htmlPath}`);
  process.exit(0);
}
execFileSync(navegador, ['--headless=new', '--disable-gpu', '--no-pdf-header-footer', `--print-to-pdf=${pdfPath}`, `--user-data-dir=${join(dir, 'navegador-pdf')}`, new URL(`file:///${htmlPath.replace(/\\/g, '/')}`).href], { stdio: 'ignore' });
console.log(`PDF: ${pdfPath} · ${lista.length} imágenes`);
