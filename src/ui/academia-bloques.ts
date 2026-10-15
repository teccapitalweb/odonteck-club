// Academia OdonTeck: dibujo de bloques de lectura, actividades y minijuegos, y su interacción.
// Lógica portada de la Academia de referencia; el aspecto lo da src/styles/academia.css con los tokens del club.
// Todo el texto viene del contenido revisado y se escapa siempre; el formato admitido es
// **negritas**, *cursivas*, párrafos y listas con guion.
import type { Actividad, Bloque, Minijuego, PreguntaA, Tema } from '../core/academia';
import { urlImagen } from '../core/academia';

export const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
const ic = (n: string) => `<i data-lucide="${n}" class="i" aria-hidden="true"></i>`;

// ── Texto con formato mínimo ──
function enLinea(s: string) {
  return esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/(^|[^*])\*(?!\s)(.+?)\*(?!\*)/g, '$1<em>$2</em>');
}
export function md(texto: string, glosario?: Map<string, string>, usados?: Set<string>) {
  return String(texto || '').split(/\n{2,}/).map((parrafo) => {
    const lineas = parrafo.split('\n');
    if (lineas.every((l) => /^\s*[-•]\s+/.test(l))) return `<ul>${lineas.map((l) => `<li>${glosar(enLinea(l.replace(/^\s*[-•]\s+/, '')), glosario, usados)}</li>`).join('')}</ul>`;
    return `<p>${glosar(lineas.map(enLinea).join('<br>'), glosario, usados)}</p>`;
  }).join('');
}

// Marca la primera aparición de cada término del glosario en el tema.
function glosar(html: string, glosario?: Map<string, string>, usados?: Set<string>) {
  if (!glosario || !usados) return html;
  for (const [termino, def] of glosario) {
    const clave = termino.toLowerCase();
    if (usados.has(clave)) continue;
    const patron = new RegExp(`(^|[^\\p{L}>])(${termino.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})(?![\\p{L}])(?![^<]*>)`, 'iu');
    if (patron.test(html)) {
      html = html.replace(patron, (_, antes, palabra) => `${antes}<button type="button" class="ac-glos" data-glos="${esc(def)}" aria-label="${esc(palabra)}: ${esc(def)}">${palabra}</button>`);
      usados.add(clave);
    }
  }
  return html;
}

// ── Figuras y diagramas ──
const PROP: Record<string, string> = { '16:9': '16 / 9', '4:3': '4 / 3', '3:4': '3 / 4', '1:1': '1 / 1', '9:16': '9 / 16' };
export function figura(id: string, proporcion: string, alt: string, pie: string, numero?: string, clase = '') {
  const url = urlImagen(id);
  const media = url
    ? `<img src="${url}" alt="${esc(alt)}" loading="lazy" decoding="async">`
    : `<div class="ac-fig__vacia" role="img" aria-label="${esc(alt)}"><span>${ic('image')}</span><small>Imagen en preparación</small><em>${esc(alt)}</em></div>`;
  return `<figure class="ac-fig ac-fig--${proporcion.replace(':', 'x')} ${clase}" data-img="${esc(id)}"><div class="ac-fig__media" style="aspect-ratio:${PROP[proporcion] || '16 / 9'}">${media}</div>${pie ? `<figcaption>${numero ? `<b>Figura ${esc(numero)}</b>` : ''}${esc(pie)}</figcaption>` : ''}</figure>`;
}

function diagrama(b: Extract<Bloque, { tipo: 'diagrama' }>, numero: string) {
  // Diagrama genérico: los elementos como nodos conectados. Un SVG a la medida puede sustituirlo por id.
  const nodos = b.elementos.map((e, i) => `<li style="--i:${i}"><span class="ac-diag__n">${i + 1}</span><span>${esc(e)}</span></li>`).join('');
  return `<figure class="ac-diag" data-diagrama="${esc(b.id)}"><div class="ac-diag__lienzo"><ol class="ac-diag__nodos ${b.elementos.length > 4 ? 'is-largo' : ''}">${nodos}</ol></div><figcaption><b>Diagrama ${esc(numero)}</b>${esc(b.pie)}</figcaption></figure>`;
}

const VARIANTES: Record<string, { icono: string; etiqueta: string }> = {
  atencion: { icono: 'triangle-alert', etiqueta: 'Atención clínica' },
  sabias: { icono: 'lightbulb', etiqueta: '¿Sabías que…?' },
  profundizar: { icono: 'microscope', etiqueta: 'Para profundizar' },
  ejemplo: { icono: 'clipboard-list', etiqueta: 'Caso clínico' },
  mexico: { icono: 'flag', etiqueta: 'En México' },
};

// ── Actividades ──
function barajarCon<T>(lista: T[], semilla: number) {
  let a = semilla >>> 0 || 1;
  const azar = () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; };
  const b = [...lista];
  for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(azar() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
  if (b.length > 2 && b.every((x, i) => x === lista[i])) b.push(b.shift()!);
  return b;
}
const hash = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

export function actividad(a: Actividad, idAct: string) {
  const cab = (icono: string, tipo: string) => `<header class="ac-act__head"><span class="ac-act__ic">${ic(icono)}</span><span><small>Actividad ${esc(idAct)} · ${tipo}</small><strong>${esc(a.titulo)}</strong></span></header>`;
  const pie = (txt = 'Comprobar') => `<footer class="ac-act__pie"><span class="ac-act__estado" data-act-estado role="status" aria-live="polite"></span><button type="button" class="btn btn--brand btn--sm" data-act-comprobar>${txt} ${ic('check')}</button></footer>`;
  const datos = `data-act="${esc(a.actividad)}" data-act-id="${esc(idAct)}"`;
  if (a.actividad === 'ordenar') {
    const orden = barajarCon(a.elementos.map((_, i) => i), hash(idAct));
    return `<section class="ac-act" ${datos} data-correcto="${a.elementos.map((_, i) => i).join(',')}">${cab('list-ordered', 'Ordena')}${a.instruccion ? `<p class="ac-act__ins">${esc(a.instruccion)} Toca los pasos en orden; toca otra vez para quitar.</p>` : ''}<div class="ac-ord">${orden.map((i) => `<button type="button" class="ac-ficha" data-ord="${i}"><span class="ac-ficha__num" data-seq></span><span>${esc(a.elementos[i])}</span></button>`).join('')}</div>${pie()}</section>`;
  }
  if (a.actividad === 'relacionar') {
    const derecha = barajarCon(a.pares.map((_, i) => i), hash(idAct) + 3);
    return `<section class="ac-act" ${datos}>${cab('git-compare-arrows', 'Relaciona')}<p class="ac-act__ins">${esc(a.instruccion || 'Une cada concepto con su pareja.')} Toca un concepto y luego su pareja.</p><div class="ac-rel"><div class="ac-rel__col">${a.pares.map((p, i) => `<button type="button" class="ac-ficha" data-rel-a="${i}">${esc(p.a)}</button>`).join('')}</div><div class="ac-rel__col">${derecha.map((i) => `<button type="button" class="ac-ficha" data-rel-b="${i}">${esc(a.pares[i].b)}</button>`).join('')}</div></div>${pie()}</section>`;
  }
  if (a.actividad === 'vf') {
    return `<section class="ac-act" ${datos}>${cab('scale', 'Verdadero o falso')}<ol class="ac-vf">${a.afirmaciones.map((x, i) => `<li data-vf="${i}" data-ok="${x.verdadero ? 'v' : 'f'}"><p>${esc(x.texto)}</p><div class="ac-vf__btns"><button type="button" class="ac-chip" data-vf-r="v">Verdadero</button><button type="button" class="ac-chip" data-vf-r="f">Falso</button></div><p class="ac-vf__exp" hidden>${esc(x.explicacion)}</p></li>`).join('')}</ol></section>`;
  }
  if (a.actividad === 'caso') {
    return `<section class="ac-act ac-act--caso" ${datos} data-retros="${esc(JSON.stringify(a.opciones.map((o) => o.retro)))}">${cab('stethoscope', 'Caso clínico')}<p class="ac-caso__sit">${esc(a.situacion)}</p><div class="ac-caso__ops">${a.opciones.map((o, i) => `<button type="button" class="ac-ficha ac-ficha--op" data-caso="${i}" data-ok="${o.correcta ? 1 : 0}"><span class="ac-ficha__letra">${'ABCD'[i]}</span><span>${esc(o.texto)}</span></button>`).join('')}</div><div class="ac-caso__retro" data-caso-retro hidden></div></section>`;
  }
  // calculadora
  return `<section class="ac-act ac-act--calc" ${datos} data-expr="${esc(a.resultado.expresion)}" data-dec="${a.resultado.decimales ?? 2}">${cab('calculator', 'Calculadora')}${a.instruccion ? `<p class="ac-act__ins">${esc(a.instruccion)}</p>` : ''}<p class="ac-calc__formula">${ic('sigma')}${esc(a.formula)}</p><div class="ac-calc__vars">${a.variables.map((v) => `<label><span>${esc(v.etiqueta)}</span><span class="ac-calc__in"><input type="number" inputmode="decimal" step="any" data-var="${esc(v.id)}" value="${v.valor}">${v.unidad ? `<em>${esc(v.unidad)}</em>` : ''}</span></label>`).join('')}</div><output class="ac-calc__res"><small>${esc(a.resultado.etiqueta)}</small><b data-calc-res>—</b>${a.resultado.unidad ? `<em>${esc(a.resultado.unidad)}</em>` : ''}</output></section>`;
}

// ── Bloques ──
export function bloques(tema: Tema) {
  const glosario = new Map(tema.glosario.map((g) => [g.termino, g.definicion]));
  const usados = new Set<string>();
  let fig = 0, dia = 0, act = 0;
  return tema.bloques.map((b) => {
    switch (b.tipo) {
      case 'subtitulo': return `<h3 class="ac-sub" id="s-${hash(b.texto)}">${esc(b.texto)}</h3>`;
      case 'texto': return `<div class="ac-txt">${md(b.md, glosario, usados)}</div>`;
      case 'lista': return `<div class="ac-lista">${b.titulo ? `<h4>${esc(b.titulo)}</h4>` : ''}<${b.ordenada ? 'ol' : 'ul'}>${b.items.map((x) => `<li>${enLinea(x)}</li>`).join('')}</${b.ordenada ? 'ol' : 'ul'}></div>`;
      case 'pasos': return `<div class="ac-pasos"><h4>${ic('list-checks')}${esc(b.titulo)}</h4><ol>${b.pasos.map((p, i) => `<li><span class="ac-pasos__n">${i + 1}</span><div><strong>${esc(p.titulo)}</strong>${md(p.md)}</div></li>`).join('')}</ol></div>`;
      case 'tabla': return `<div class="ac-tabla"><h4>${esc(b.titulo)}</h4><div class="ac-tabla__scroll" tabindex="0"><table><thead><tr>${b.columnas.map((c) => `<th scope="col">${esc(c)}</th>`).join('')}</tr></thead><tbody>${b.filas.map((f) => `<tr>${f.map((c, i) => (i === 0 ? `<th scope="row">${enLinea(c)}</th>` : `<td>${enLinea(c)}</td>`)).join('')}</tr>`).join('')}</tbody></table></div></div>`;
      case 'recuadro': { const v = VARIANTES[b.variante] || VARIANTES.sabias; const plegable = b.variante === 'profundizar'; return plegable ? `<details class="ac-rec ac-rec--${b.variante}"><summary><span class="ac-rec__ic">${ic(v.icono)}</span><span><small>${v.etiqueta}</small><strong>${esc(b.titulo)}</strong></span>${ic('chevron-down')}</summary><div class="ac-rec__body">${md(b.md)}</div></details>` : `<aside class="ac-rec ac-rec--${b.variante}"><div class="ac-rec__head"><span class="ac-rec__ic">${ic(v.icono)}</span><span><small>${v.etiqueta}</small><strong>${esc(b.titulo)}</strong></span></div><div class="ac-rec__body">${md(b.md)}</div></aside>`; }
      case 'figura': fig++; return figura(b.id, b.proporcion, b.alt, b.pie, `${tema.n}.${fig}`);
      case 'diagrama': dia++; return diagrama(b, `${tema.n}.${dia}`);
      case 'cita': return `<blockquote class="ac-cita"><p>${esc(b.texto)}</p><cite>${esc(b.autor)}</cite></blockquote>`;
      case 'actividad': act++; return actividad(b, `${tema.n}.${act}`);
      default: return '';
    }
  }).join('');
}

export function verificacion(tema: Tema) {
  return `<section class="ac-verif" data-verif><header><span class="ac-act__ic">${ic('circle-check-big')}</span><span><small>Verificación rápida · ${tema.verificacion.length} preguntas</small><strong>¿Te quedó claro el tema ${esc(tema.n)}?</strong></span></header>${tema.verificacion.map((p, i) => `<fieldset class="ac-q" data-q="${i}" data-ok="${p.correcta}"><legend><span>${i + 1}</span>${esc(p.q)}</legend><div class="ac-q__ops">${p.opciones.map((o, j) => `<button type="button" class="ac-op" data-op="${j}"><span class="ac-op__l">${'ABCD'[j]}</span><span>${esc(o)}</span></button>`).join('')}</div><p class="ac-q__exp" hidden>${esc(p.explicacion || '')}</p></fieldset>`).join('')}</section>`;
}

// ── Minijuegos ──
const DIRS = [[0, 1], [1, 0], [1, 1], [-1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1]];
export function generarSopa(palabras: string[], semilla: number) {
  const tam = Math.min(15, Math.max(11, Math.max(...palabras.map((p) => p.length)) + 2));
  let a = semilla >>> 0 || 7;
  const azar = () => { a = (a * 1103515245 + 12345) >>> 0; return a / 4294967296; };
  for (let intento = 0; intento < 40; intento++) {
    const g: string[][] = Array.from({ length: tam }, () => Array(tam).fill(''));
    const ubic: { palabra: string; celdas: [number, number][] }[] = [];
    const ordenadas = [...palabras].sort((x, y) => y.length - x.length);
    let ok = true;
    for (const p of ordenadas) {
      let puesto = false;
      for (let t = 0; t < 300 && !puesto; t++) {
        const [dr, dc] = DIRS[Math.floor(azar() * (intento < 20 ? 4 : 8))];
        const r0 = Math.floor(azar() * tam), c0 = Math.floor(azar() * tam);
        const celdas: [number, number][] = [];
        for (let k = 0; k < p.length; k++) {
          const r = r0 + dr * k, c = c0 + dc * k;
          if (r < 0 || c < 0 || r >= tam || c >= tam || (g[r][c] && g[r][c] !== p[k])) { celdas.length = 0; break; }
          celdas.push([r, c]);
        }
        if (celdas.length === p.length) { celdas.forEach(([r, c], k) => (g[r][c] = p[k])); ubic.push({ palabra: p, celdas }); puesto = true; }
      }
      if (!puesto) { ok = false; break; }
    }
    if (!ok) continue;
    const letras = 'ABCDEFGHIJLMNOPRSTUVZ';
    for (const fila of g) for (let c = 0; c < tam; c++) if (!fila[c]) fila[c] = letras[Math.floor(azar() * letras.length)];
    return { tam, grilla: g, ubic };
  }
  return null;
}

export function generarCrucigrama(pistas: { palabra: string; pista: string }[]) {
  type P = { palabra: string; pista: string; r: number; c: number; h: boolean };
  const lista = [...pistas].sort((a, b) => b.palabra.length - a.palabra.length);
  const puestas: P[] = [];
  const mapa = new Map<string, string>();
  const k = (r: number, c: number) => `${r},${c}`;
  const cabe = (w: string, r: number, c: number, h: boolean) => {
    let cruces = 0;
    if (mapa.has(k(r - (h ? 0 : 1), c - (h ? 1 : 0))) || mapa.has(k(r + (h ? 0 : w.length), c + (h ? w.length : 0)))) return -1;
    for (let i = 0; i < w.length; i++) {
      const rr = r + (h ? 0 : i), cc = c + (h ? i : 0);
      const actual = mapa.get(k(rr, cc));
      if (actual) { if (actual !== w[i]) return -1; cruces++; continue; }
      if (mapa.has(k(rr + (h ? 1 : 0), cc + (h ? 0 : 1))) || mapa.has(k(rr - (h ? 1 : 0), cc - (h ? 0 : 1)))) return -1;
    }
    return cruces;
  };
  const poner = (p: { palabra: string; pista: string }, r: number, c: number, h: boolean) => {
    for (let i = 0; i < p.palabra.length; i++) mapa.set(k(r + (h ? 0 : i), c + (h ? i : 0)), p.palabra[i]);
    puestas.push({ ...p, r, c, h });
  };
  const sueltas: typeof lista = [];
  lista.forEach((p, idx) => {
    if (idx === 0) return poner(p, 0, 0, true);
    let mejor: { r: number; c: number; h: boolean; x: number } | null = null;
    for (const q of puestas) for (let i = 0; i < q.palabra.length; i++) for (let j = 0; j < p.palabra.length; j++) {
      if (q.palabra[i] !== p.palabra[j]) continue;
      const h = !q.h;
      const r = q.h ? q.r - j : q.r + i, c = q.h ? q.c + i : q.c - j;
      const x = cabe(p.palabra, r, c, h);
      if (x > 0 && (!mejor || x > mejor.x)) mejor = { r, c, h, x };
    }
    if (mejor) poner(p, mejor.r, mejor.c, mejor.h); else sueltas.push(p);
  });
  // Las que no cruzan se colocan debajo, en horizontal y separadas.
  let maxR = Math.max(...[...mapa.keys()].map((x) => Number(x.split(',')[0])));
  const minC = Math.min(...[...mapa.keys()].map((x) => Number(x.split(',')[1])));
  for (const p of sueltas) { maxR += 2; poner(p, maxR, minC, true); }
  const rs = [...mapa.keys()].map((x) => Number(x.split(',')[0])), cs = [...mapa.keys()].map((x) => Number(x.split(',')[1]));
  const r0 = Math.min(...rs), c0 = Math.min(...cs);
  const filas = Math.max(...rs) - r0 + 1, cols = Math.max(...cs) - c0 + 1;
  const numeros = new Map<string, number>();
  const ordenadas = [...puestas].sort((a, b) => a.r - b.r || a.c - b.c);
  let num = 0;
  const conNumero = ordenadas.map((p) => { const key = k(p.r, p.c); if (!numeros.has(key)) numeros.set(key, ++num); return { ...p, num: numeros.get(key)!, r: p.r - r0, c: p.c - c0 }; });
  const celdas = new Map<string, string>(); for (const [key, v] of mapa) { const [r, c] = key.split(',').map(Number); celdas.set(k(r - r0, c - c0), v); }
  const nums = new Map<string, number>(); for (const [key, v] of numeros) { const [r, c] = key.split(',').map(Number); nums.set(k(r - r0, c - c0), v); }
  return { filas, cols, celdas, nums, palabras: conNumero };
}

export function minijuegoHTML(j: Minijuego, semilla: number) {
  if (j.tipo === 'sopa') {
    const s = generarSopa(j.palabras, semilla);
    if (!s) return '<p>No se pudo generar la sopa de letras.</p>';
    return `<div class="ac-sopa" data-juego="sopa" data-total="${j.palabras.length}" style="--tam:${s.tam}"><div class="ac-sopa__grid" role="grid" aria-label="Sopa de letras">${s.grilla.map((f, r) => f.map((l, c) => `<button type="button" class="ac-sopa__c" data-rc="${r},${c}">${l}</button>`).join('')).join('')}</div><ul class="ac-sopa__lista">${j.palabras.map((p) => `<li data-palabra="${p}" data-celdas="${s.ubic.find((u) => u.palabra === p)!.celdas.map((x) => x.join(',')).join(';')}">${p}</li>`).join('')}</ul><p class="ac-juego__ayuda">Toca la primera letra y luego la última de cada palabra. Pueden ir en horizontal, vertical, diagonal o al revés.</p></div>`;
  }
  if (j.tipo === 'crucigrama') {
    const c = generarCrucigrama(j.pistas);
    const celdas: string[] = [];
    for (let r = 0; r < c.filas; r++) for (let col = 0; col < c.cols; col++) {
      const key = `${r},${col}`;
      celdas.push(c.celdas.has(key) ? `<label class="ac-cruz__c">${c.nums.has(key) ? `<small>${c.nums.get(key)}</small>` : ''}<input maxlength="1" autocomplete="off" autocapitalize="characters" data-rc="${key}" data-letra="${c.celdas.get(key)}" aria-label="Casilla ${key}"></label>` : '<span class="ac-cruz__v"></span>');
    }
    const lista = (h: boolean) => c.palabras.filter((p) => p.h === h).map((p) => `<li><b>${p.num}</b> ${esc(p.pista)} <em>(${p.palabra.length})</em></li>`).join('');
    return `<div class="ac-cruz" data-juego="crucigrama"><div class="ac-cruz__scroll"><div class="ac-cruz__grid" style="--cols:${c.cols}">${celdas.join('')}</div></div><div class="ac-cruz__pistas"><div><h4>Horizontales</h4><ol>${lista(true)}</ol></div><div><h4>Verticales</h4><ol>${lista(false)}</ol></div></div><button type="button" class="btn btn--brand" data-cruz-revisar>Revisar crucigrama ${ic('check')}</button></div>`;
  }
  const cartas = barajarCon(j.pares.flatMap((p, i) => [{ t: p.a, i, lado: 'a' }, { t: p.b, i, lado: 'b' }]), semilla);
  return `<div class="ac-memo" data-juego="memorama" data-total="${j.pares.length}">${cartas.map((x) => `<button type="button" class="ac-memo__c" data-par="${x.i}" data-lado="${x.lado}" aria-label="Carta oculta"><span class="ac-memo__dorso">${ic('sparkles')}</span><span class="ac-memo__cara">${esc(x.t)}</span></button>`).join('')}<p class="ac-juego__ayuda">Voltea dos cartas: encuentra cada concepto con su pareja.</p></div>`;
}

// ── Interacción (delegación) ──
// Evaluador aritmético propio (sin eval): números, variables, + - * / y paréntesis.
export function evaluar(expr: string, vars: Record<string, number>) {
  const t = expr.match(/\d+(?:\.\d+)?|[a-zA-Z][a-zA-Z0-9]*|[-+*/()]|\S/g) || [];
  let i = 0;
  const primario = (): number => {
    const x = t[i++];
    if (x === '(') { const v = suma(); if (t[i++] !== ')') return NaN; return v; }
    if (x === '-') return -primario();
    if (x === '+') return primario();
    if (x !== undefined && /^\d/.test(x)) return Number(x);
    if (x !== undefined && /^[a-zA-Z]/.test(x)) return x in vars ? vars[x] : NaN;
    return NaN;
  };
  const producto = (): number => { let v = primario(); while (t[i] === '*' || t[i] === '/') { const op = t[i++]; const d = primario(); v = op === '*' ? v * d : v / d; } return v; };
  const suma = (): number => { let v = producto(); while (t[i] === '+' || t[i] === '-') { const op = t[i++]; const d = producto(); v = op === '+' ? v + d : v - d; } return v; };
  const v = suma();
  return i === t.length ? v : NaN;
}

export function montarInteraccion(root: HTMLElement, opciones: { alCompletarJuego?: () => void; sonidoOk?: () => void; sonidoNo?: () => void } = {}) {
  const ok = () => opciones.sonidoOk?.();
  const no = () => opciones.sonidoNo?.();
  const estado = (sec: Element, txt: string, bien: boolean) => { const e = sec.querySelector<HTMLElement>('[data-act-estado]'); if (e) { e.textContent = txt; e.className = `ac-act__estado ${bien ? 'is-ok' : 'is-no'}`; } };
  let selRel: HTMLElement | null = null;
  let sopaInicio: HTMLElement | null = null;
  let memo: HTMLElement[] = [];
  const recalcular = (sec: HTMLElement) => {
    const vars: Record<string, number> = {};
    sec.querySelectorAll<HTMLInputElement>('[data-var]').forEach((i) => { vars[i.dataset.var!] = Number(i.value); });
    const v = evaluar(sec.dataset.expr || '', vars);
    const out = sec.querySelector<HTMLElement>('[data-calc-res]');
    if (out) out.textContent = Number.isFinite(v) ? v.toLocaleString('es-MX', { maximumFractionDigits: Number(sec.dataset.dec || 2), minimumFractionDigits: Number(sec.dataset.dec || 2) }) : '—';
  };
  root.querySelectorAll<HTMLElement>('.ac-act--calc').forEach(recalcular);
  root.addEventListener('input', (e) => { const sec = (e.target as HTMLElement).closest<HTMLElement>('.ac-act--calc'); if (sec) recalcular(sec); });

  root.addEventListener('click', (e) => {
    const el = e.target as HTMLElement;
    // Glosario
    const g = el.closest<HTMLElement>('.ac-glos');
    if (g) { root.querySelectorAll('.ac-glos.is-open').forEach((x) => x !== g && x.classList.remove('is-open')); g.classList.toggle('is-open'); return; }
    // Ordenar
    const ord = el.closest<HTMLButtonElement>('[data-ord]');
    if (ord && !ord.disabled) {
      const sec = ord.closest<HTMLElement>('.ac-act')!;
      const seq = (sec.dataset.seq || '').split(',').filter(Boolean);
      const i = seq.indexOf(ord.dataset.ord!);
      if (i >= 0) seq.splice(i, 1); else seq.push(ord.dataset.ord!);
      sec.dataset.seq = seq.join(',');
      sec.querySelectorAll<HTMLElement>('[data-ord]').forEach((b) => { const k = seq.indexOf(b.dataset.ord!); b.classList.toggle('is-sel', k >= 0); b.querySelector('[data-seq]')!.textContent = k >= 0 ? String(k + 1) : ''; });
      return;
    }
    // Relacionar
    const ra = el.closest<HTMLButtonElement>('[data-rel-a]'), rb = el.closest<HTMLButtonElement>('[data-rel-b]');
    if ((ra && !ra.disabled) || (rb && !rb.disabled)) {
      const b = (ra || rb)!;
      if (ra) { selRel?.classList.remove('is-sel'); selRel = ra; ra.classList.add('is-sel'); return; }
      if (selRel && rb) {
        const sec = rb.closest('.ac-act')!;
        if (selRel.dataset.relA === rb.dataset.relB) { [selRel, rb].forEach((x) => { x.classList.remove('is-sel'); x.classList.add('is-ok'); (x as HTMLButtonElement).disabled = true; }); ok(); const faltan = sec.querySelectorAll('[data-rel-a]:not(:disabled)').length; estado(sec, faltan ? `¡Bien! Faltan ${faltan}.` : '¡Todas las parejas correctas!', true); }
        else { rb.classList.add('is-no'); setTimeout(() => rb.classList.remove('is-no'), 600); no(); estado(sec, 'Esa no es su pareja. Intenta otra.', false); }
        selRel.classList.remove('is-sel'); selRel = null;
      }
      return void b;
    }
    // Verdadero o falso
    const vf = el.closest<HTMLButtonElement>('[data-vf-r]');
    if (vf) {
      const li = vf.closest<HTMLElement>('[data-vf]')!;
      if (li.dataset.resp) return;
      li.dataset.resp = vf.dataset.vfR!;
      const bien = vf.dataset.vfR === li.dataset.ok;
      li.classList.add(bien ? 'is-ok' : 'is-no'); vf.classList.add('is-sel');
      li.querySelector<HTMLElement>('.ac-vf__exp')!.hidden = false;
      li.querySelectorAll<HTMLButtonElement>('[data-vf-r]').forEach((b) => (b.disabled = true));
      bien ? ok() : no();
      return;
    }
    // Caso
    const caso = el.closest<HTMLButtonElement>('[data-caso]');
    if (caso && !caso.disabled) {
      const sec = caso.closest<HTMLElement>('.ac-act')!;
      const retros = JSON.parse(sec.dataset.retros || '[]') as string[];
      const bien = caso.dataset.ok === '1';
      sec.querySelectorAll<HTMLElement>('[data-caso]').forEach((b) => b.classList.remove('is-sel', 'is-ok', 'is-no'));
      caso.classList.add('is-sel', bien ? 'is-ok' : 'is-no');
      const r = sec.querySelector<HTMLElement>('[data-caso-retro]')!;
      r.hidden = false; r.className = `ac-caso__retro ${bien ? 'is-ok' : 'is-no'}`;
      r.innerHTML = `<strong>${bien ? 'Buena decisión' : 'Piénsalo de nuevo'}</strong><p>${esc(retros[Number(caso.dataset.caso)])}</p>`;
      if (bien) { sec.querySelectorAll<HTMLButtonElement>('[data-caso]').forEach((b) => (b.disabled = true)); ok(); } else no();
      return;
    }
    // Comprobar orden
    const comp = el.closest<HTMLElement>('[data-act-comprobar]');
    if (comp) {
      const sec = comp.closest<HTMLElement>('.ac-act')!;
      if (sec.dataset.act === 'ordenar') {
        const seq = (sec.dataset.seq || '').split(',').filter(Boolean);
        const total = sec.querySelectorAll('[data-ord]').length;
        if (seq.length < total) return estado(sec, `Te faltan ${total - seq.length} por ordenar.`, false);
        const bien = seq.every((v, i) => Number(v) === i);
        sec.querySelectorAll<HTMLElement>('[data-ord]').forEach((b) => { const k = seq.indexOf(b.dataset.ord!); b.classList.toggle('is-ok', k === Number(b.dataset.ord)); b.classList.toggle('is-no', k !== Number(b.dataset.ord)); });
        if (bien) { sec.querySelectorAll<HTMLButtonElement>('[data-ord]').forEach((b) => (b.disabled = true)); ok(); estado(sec, '¡Orden correcto!', true); }
        else { no(); estado(sec, 'Algunos pasos no van ahí. Toca para reacomodar y vuelve a comprobar.', false); }
      }
      return;
    }
    // Verificación del tema
    const op = el.closest<HTMLButtonElement>('.ac-q [data-op]');
    if (op) {
      const fs = op.closest<HTMLElement>('.ac-q')!;
      if (fs.dataset.resp) return;
      fs.dataset.resp = op.dataset.op!;
      const bien = op.dataset.op === fs.dataset.ok;
      fs.querySelectorAll<HTMLButtonElement>('[data-op]').forEach((b) => { b.disabled = true; if (b.dataset.op === fs.dataset.ok) b.classList.add('is-ok'); });
      if (!bien) op.classList.add('is-no');
      fs.classList.add(bien ? 'is-ok' : 'is-no');
      fs.querySelector<HTMLElement>('.ac-q__exp')!.hidden = false;
      bien ? ok() : no();
      return;
    }
    // Sopa de letras
    const celda = el.closest<HTMLElement>('.ac-sopa__c');
    if (celda) {
      const sopa = celda.closest<HTMLElement>('.ac-sopa')!;
      if (!sopaInicio) { sopaInicio = celda; celda.classList.add('is-ini'); return; }
      const [r0, c0] = sopaInicio.dataset.rc!.split(',').map(Number), [r1, c1] = celda.dataset.rc!.split(',').map(Number);
      sopaInicio.classList.remove('is-ini'); sopaInicio = null;
      const dr = Math.sign(r1 - r0), dc = Math.sign(c1 - c0), largo = Math.max(Math.abs(r1 - r0), Math.abs(c1 - c0)) + 1;
      if (!(r0 === r1 || c0 === c1 || Math.abs(r1 - r0) === Math.abs(c1 - c0))) return no();
      const ruta = Array.from({ length: largo }, (_, k) => `${r0 + dr * k},${c0 + dc * k}`);
      const clave = ruta.join(';'), inversa = [...ruta].reverse().join(';');
      const li = [...sopa.querySelectorAll<HTMLElement>('[data-palabra]:not(.is-ok)')].find((x) => x.dataset.celdas === clave || x.dataset.celdas === inversa);
      if (!li) return no();
      li.classList.add('is-ok'); ok();
      ruta.forEach((rc) => sopa.querySelector(`[data-rc="${rc}"]`)?.classList.add('is-ok'));
      if (sopa.querySelectorAll('[data-palabra].is-ok').length === Number(sopa.dataset.total)) opciones.alCompletarJuego?.();
      return;
    }
    // Crucigrama
    if (el.closest('[data-cruz-revisar]')) {
      const cruz = el.closest<HTMLElement>('.ac-cruz')!;
      let bien = 0, total = 0;
      cruz.querySelectorAll<HTMLInputElement>('input[data-letra]').forEach((i) => { total++; const v = i.value.toUpperCase() === i.dataset.letra; i.classList.toggle('is-ok', v); i.classList.toggle('is-no', !!i.value && !v); if (v) bien++; });
      if (bien === total) { ok(); opciones.alCompletarJuego?.(); } else no();
      return;
    }
    // Memorama
    const carta = el.closest<HTMLButtonElement>('.ac-memo__c');
    if (carta && !carta.classList.contains('is-ok') && !carta.classList.contains('is-up') && memo.length < 2) {
      carta.classList.add('is-up'); carta.setAttribute('aria-label', carta.querySelector('.ac-memo__cara')!.textContent || '');
      memo.push(carta);
      if (memo.length === 2) {
        const [a, b] = memo;
        if (a.dataset.par === b.dataset.par && a.dataset.lado !== b.dataset.lado) {
          a.classList.add('is-ok'); b.classList.add('is-ok'); memo = []; ok();
          const tablero = a.closest<HTMLElement>('.ac-memo')!;
          if (tablero.querySelectorAll('.ac-memo__c.is-ok').length === Number(tablero.dataset.total) * 2) opciones.alCompletarJuego?.();
        } else { no(); setTimeout(() => { a.classList.remove('is-up'); b.classList.remove('is-up'); memo = []; }, 900); }
      }
    }
  });

  // Crucigrama: avanzar a la siguiente casilla al escribir.
  root.addEventListener('input', (e) => {
    const i = e.target as HTMLInputElement;
    if (!i.matches('.ac-cruz input')) return;
    i.value = i.value.toUpperCase().replace(/[^A-ZÑ]/g, '').slice(-1);
    if (!i.value) return;
    const inputs = [...i.closest('.ac-cruz')!.querySelectorAll<HTMLInputElement>('input')];
    inputs[inputs.indexOf(i) + 1]?.focus();
  });
}

export type { PreguntaA };
