// Importa las imágenes que el propietario deja en imagenes-academia/NN-programa/modulo-NN/.
// - Si un archivo empieza con su número (01.png, 07-algo.jpg) o se llama portada.*, se asigna directo.
// - Si no tienen nombre útil, se asignan por orden de creación (el orden de la lista del LEEME).
// - Se revisa que la proporción de cada imagen coincida con la esperada; las dudas se reportan.
// - Con --aplicar se convierten a WebP en public/academia/<id>.webp y se actualiza el manifiesto
//   src/data/academia-imagenes.json (el lector solo pide imágenes que estén en él).
// Requiere `sharp`, que no es dependencia del proyecto: instálalo aparte si vas a importar.
// Uso: node scripts/academia/importar-imagenes.mjs [programa] [--aplicar]
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CARPETA_IMAGENES, imagenesDeModulo } from './preparar-imagenes.mjs';

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.error([
    'Este script necesita la librería "sharp" para leer y convertir imágenes, y no está instalada.',
    'No se instala sola porque no es dependencia del club. Para importar imágenes, instálala a mano',
    'en tu copia local (por ejemplo: npm install --no-save sharp) y vuelve a ejecutar el script.',
  ].join('\n'));
  process.exit(1);
}

const raiz = fileURLToPath(new URL('../../', import.meta.url));
const base = join(raiz, 'api/content/academia');
const carpetas = fileURLToPath(CARPETA_IMAGENES);
const publico = join(raiz, 'public/academia');
const args = process.argv.slice(2);
const aplicar = args.includes('--aplicar');
const filtro = args.find((a) => !a.startsWith('--'));
const catalogo = JSON.parse(readFileSync(join(base, 'catalogo.json'), 'utf8'));
const nn = (n) => String(n).padStart(2, '0');
const RAZON = { '16:9': 16 / 9, '4:3': 4 / 3, '3:4': 3 / 4, '1:1': 1, '9:16': 9 / 16 };
const proporcionMasCercana = (r) => Object.entries(RAZON).sort((a, b) => Math.abs(a[1] - r) - Math.abs(b[1] - r))[0][0];

let importadas = 0, avisos = 0;
for (const p of catalogo.programas.filter((x) => !String(x.id).startsWith('_') && (!filtro || x.id === filtro))) {
  for (const meta of p.modulos) {
    const dir = join(carpetas, `${nn(p.numero)}-${p.id}`, `modulo-${nn(meta.n)}`);
    const archivoMod = join(base, p.id, `modulo-${nn(meta.n)}.json`);
    if (!existsSync(dir) || !existsSync(archivoMod)) continue;
    const archivos = readdirSync(dir).filter((f) => /\.(png|jpe?g|webp)$/i.test(f));
    if (!archivos.length) continue;
    const esperadas = imagenesDeModulo(JSON.parse(readFileSync(archivoMod, 'utf8')));
    const info = await Promise.all(archivos.map(async (f) => {
      const ruta = join(dir, f);
      const { width, height } = await sharp(ruta).metadata();
      const st = statSync(ruta);
      const num = /^portada/i.test(f) ? 0 : /^(\d{1,2})\b/.test(f) ? Number(f.match(/^(\d{1,2})/)[1]) - 1 : null;
      return { f, ruta, width, height, prop: proporcionMasCercana(width / height), creada: Math.min(st.mtimeMs, st.birthtimeMs || st.mtimeMs), num };
    }));
    const asignacion = new Map();
    for (const x of info) if (x.num !== null && esperadas[x.num]) asignacion.set(x.num, x);
    const libres = info.filter((x) => ![...asignacion.values()].includes(x)).sort((a, b) => a.creada - b.creada);
    const huecos = esperadas.map((_, i) => i).filter((i) => !asignacion.has(i));
    libres.forEach((x, k) => { if (huecos[k] !== undefined) asignacion.set(huecos[k], x); });
    console.log(`\n${p.id} · módulo ${meta.n}: ${archivos.length} archivos para ${esperadas.length} imágenes`);
    if (archivos.length !== esperadas.length) { avisos++; console.log(`  ⚠ Faltan o sobran imágenes (${archivos.length} de ${esperadas.length}).`); }
    for (const [i, x] of [...asignacion.entries()].sort((a, b) => a[0] - b[0])) {
      const e = esperadas[i];
      const ok = x.prop === e.proporcion;
      if (!ok) avisos++;
      console.log(`  ${ok ? '✔' : '⚠'} ${nn(i + 1)} ${e.id} [${e.proporcion}] ← ${x.f} (${x.width}×${x.height}, ${x.prop})${ok ? '' : '  PROPORCIÓN DISTINTA: revisar'}`);
      if (aplicar && ok) {
        const salida = join(publico, `${e.id}.webp`);
        mkdirSync(dirname(salida), { recursive: true });
        await sharp(x.ruta).resize(1600, 1600, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 80 }).toFile(salida);
        importadas++;
      }
    }
  }
}

// Manifiesto: solo los ids que existen en public/academia.
const ids = [];
const recorrer = (d, pref = '') => { if (!existsSync(d)) return; for (const f of readdirSync(d)) { const r = join(d, f); if (statSync(r).isDirectory()) recorrer(r, `${pref}${f}/`); else if (extname(f) === '.webp') ids.push(`${pref}${f.replace(/\.webp$/, '')}`); } };
recorrer(publico);
writeFileSync(join(raiz, 'src/data/academia-imagenes.json'), JSON.stringify({ ids: ids.sort() }, null, 2) + '\n');
console.log(`\n${aplicar ? `Importadas: ${importadas}.` : 'Simulación (usa --aplicar para importar).'} Avisos: ${avisos}. Imágenes publicadas en total: ${ids.length}.`);
