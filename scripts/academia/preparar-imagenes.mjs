// Prepara el trabajo de imágenes de la Academia OdonTeck:
//  1. docs/academia-imagenes/NN-programa.md: todos los prompts del programa, en orden, por módulo.
//  2. <carpeta de imágenes>/NN-programa/modulo-NN/LEEME.txt: carpeta donde el propietario deja las
//     imágenes de ese módulo (sin renombrar), con la lista en el orden en que debe generarlas.
//  3. docs/academia-imagenes/README.md: índice con totales.
// La carpeta de imágenes es ../imagenes-academia (junto al repositorio) o la que indique ACADEMIA_IMAGENES.
// Los diagramas no van al generador de imágenes: se dibujan en código.
// Uso: node scripts/academia/preparar-imagenes.mjs [programa]
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const raiz = new URL('../../', import.meta.url);
const base = new URL('api/content/academia/', raiz);
const docs = new URL('docs/academia-imagenes/', raiz);
export const CARPETA_IMAGENES = process.env.ACADEMIA_IMAGENES
  ? pathToFileURL(`${resolve(process.env.ACADEMIA_IMAGENES)}/`)
  : new URL('../imagenes-academia/', raiz);
const nn = (n) => String(n).padStart(2, '0');
const PIXELES = { '16:9': '1920 × 1080', '4:3': '1600 × 1200', '3:4': '1200 × 1600', '1:1': '1400 × 1400', '9:16': '1080 × 1920' };

/** Lista ordenada de imágenes de un módulo: portada primero y luego figuras en orden de lectura. */
export function imagenesDeModulo(m) {
  const lista = m.portada ? [{ id: m.portada.id, proporcion: m.portada.proporcion, alt: m.portada.alt, prompt: m.portada.prompt, ubicacion: 'Portada del módulo' }] : [];
  for (const t of m.temas || []) {
    let k = 0;
    for (const b of t?.bloques || []) if (b.tipo === 'figura') { k++; lista.push({ id: b.id, proporcion: b.proporcion, alt: b.alt, prompt: b.prompt, ubicacion: `Tema ${t.n} · figura ${t.n}.${k}`, pie: b.pie }); }
  }
  return lista;
}

// Solo se ejecuta como script (importar-imagenes reutiliza imagenesDeModulo).
if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const catalogo = JSON.parse(readFileSync(new URL('catalogo.json', base), 'utf8'));
  const filtro = process.argv.slice(2).find((a) => !a.startsWith('--'));
  mkdirSync(docs, { recursive: true });
  mkdirSync(CARPETA_IMAGENES, { recursive: true });
  const indice = [];
  let totalGlobal = 0;
  for (const p of catalogo.programas.filter((x) => !String(x.id).startsWith('_') && (!filtro || x.id === filtro))) {
    const carpetaProg = `${nn(p.numero)}-${p.id}`;
    const modulos = [];
    for (const meta of p.modulos) {
      const url = new URL(`${p.id}/modulo-${nn(meta.n)}.json`, base);
      if (!existsSync(url)) continue;
      try { modulos.push(JSON.parse(readFileSync(url, 'utf8'))); } catch { /* módulo a medio escribir */ }
    }
    if (!modulos.length) { indice.push({ p, carpetaProg, modulos: 0, imagenes: 0 }); continue; }
    let md = `# Imágenes · Programa ${nn(p.numero)} · ${p.titulo}\n\n`;
    md += 'Documento de prompts de la Academia OdonTeck. Se genera desde el contenido del programa; si el contenido cambia, se vuelve a generar.\n\n';
    md += `## Cómo entregar las imágenes\n\n1. Abre la carpeta \`imagenes-academia/${carpetaProg}/\`.\n2. Entra a la subcarpeta del módulo (por ejemplo \`modulo-01\`).\n3. Genera las imágenes **en el orden de la lista** y guárdalas ahí. Si puedes, nómbralas con su número (\`01.png\`, \`portada.png\`); si no, el importador usa el orden de creación y la proporción para identificarlas.\n4. Ejecuta \`npm run academia:importar-imagenes -- ${p.id}\` para revisarlas y \`-- --aplicar\` para convertirlas a WebP.\n\n`;
    md += `## Especificaciones generales\n\n- Estilo: fotografía clínica realista o ilustración realista, consultorio dental limpio y bien iluminado, colores naturales.\n- Anatomía dental correcta; sin sangre ni contenido gráfico perturbador; sin rostros identificables de pacientes.\n- Equipo de protección personal correcto en toda escena clínica.\n- Sin texto, letreros, logotipos ni marcas de agua dentro de la imagen.\n- Tamaños sugeridos: ${Object.entries(PIXELES).map(([k, v]) => `${k} → ${v} px`).join(' · ')}.\n\n`;
    let totalProg = 0;
    const filasIndice = [];
    for (const m of modulos) {
      const lista = imagenesDeModulo(m);
      totalProg += lista.length;
      const carpetaMod = `modulo-${nn(m.modulo)}`;
      const destino = new URL(`${carpetaProg}/${carpetaMod}/`, CARPETA_IMAGENES);
      mkdirSync(destino, { recursive: true });
      const conteo = lista.reduce((a, x) => ((a[x.proporcion] = (a[x.proporcion] || 0) + 1), a), {});
      writeFileSync(new URL('LEEME.txt', destino), [
        `Programa ${nn(p.numero)} · ${p.titulo}`,
        `Módulo ${m.modulo} · ${m.titulo}`,
        '',
        `Deja aquí las ${lista.length} imágenes de este módulo, en este orden:`,
        '',
        ...lista.map((x, i) => `${nn(i + 1)}. [${x.proporcion}] ${x.ubicacion} — ${x.alt}`),
        '',
        `Proporciones: ${Object.entries(conteo).map(([k, v]) => `${v} de ${k}`).join(', ')}.`,
        `Prompts completos: docs/academia-imagenes/${carpetaProg}.md`,
        '',
      ].join('\r\n'));
      md += `## Módulo ${m.modulo} · ${m.titulo}\n\nCarpeta: \`imagenes-academia/${carpetaProg}/${carpetaMod}/\` · ${lista.length} imágenes (${Object.entries(conteo).map(([k, v]) => `${v} de ${k}`).join(', ')}).\n\n`;
      lista.forEach((x, i) => {
        md += `### ${nn(i + 1)} · ${x.ubicacion} · ${x.proporcion}\n\n`;
        md += `- **Identificador:** \`${x.id}\`\n- **Qué muestra:** ${x.alt}\n${x.pie ? `- **Pie en la lectura:** ${x.pie}\n` : ''}- **Tamaño:** ${PIXELES[x.proporcion] || x.proporcion} px\n\n**Prompt:**\n\n> ${String(x.prompt).replace(/\n/g, ' ')}\n\n`;
      });
      filasIndice.push(`| ${m.modulo} | ${m.titulo} | ${lista.length} |`);
    }
    md += `## Resumen\n\n| Módulo | Título | Imágenes |\n| --- | --- | --- |\n${filasIndice.join('\n')}\n\n**Total del programa: ${totalProg} imágenes.**\n\n## Revisión antes de entregar\n\n- [ ] Ninguna imagen tiene texto, letras ni logotipos.\n- [ ] La anatomía dental (número de cúspides, raíces, dentición) es correcta.\n- [ ] Personas con equipo de protección; sin rostros identificables.\n- [ ] La proporción es la indicada (el importador la revisa).\n- [ ] Cada imagen está en la carpeta de su módulo.\n`;
    writeFileSync(new URL(`${carpetaProg}.md`, docs), md);
    totalGlobal += totalProg;
    indice.push({ p, carpetaProg, modulos: modulos.length, imagenes: totalProg });
  }
  let readme = `# Imágenes de la Academia OdonTeck\n\nUn documento de prompts por programa y una carpeta por módulo en \`imagenes-academia/\` (junto al repositorio).\nSe regenera con \`npm run academia:preparar-imagenes\`; se importan con \`npm run academia:importar-imagenes\`.\n\n| Programa | Documento | Módulos escritos | Imágenes |\n| --- | --- | --- | --- |\n`;
  for (const x of indice) readme += `| ${nn(x.p.numero)} · ${x.p.titulo} | ${x.modulos ? `[${x.carpetaProg}.md](${x.carpetaProg}.md)` : 'pendiente'} | ${x.modulos} de ${x.p.modulos.length} | ${x.imagenes} |\n`;
  readme += `\n**Total actual: ${totalGlobal} imágenes.** Los diagramas con etiquetas no están incluidos: se dibujan en código.\n`;
  writeFileSync(new URL('README.md', docs), readme);
  console.log(`Imágenes listadas: ${totalGlobal} en ${indice.filter((x) => x.modulos).length} programas. Carpetas en ${fileURLToPath(CARPETA_IMAGENES)}`);
}
