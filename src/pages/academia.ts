// Academia OdonTeck: catálogo de programas, portada del programa con su ruta de módulos, mapa del
// módulo, lector de temas, minijuego y examen. Misma lógica que la Academia de referencia, con el
// diseño del club (tokens de src/styles/tokens.css, botones y chips de components.css).
import { createIcons, icons } from 'lucide';
import { Acceso } from '../core/acceso';
import { Datos } from '../core/datos';
import {
  programa as getPrograma, cargarCatalogo, cargarModulo, avanceModulo, moduloAprobado, moduloDesbloqueado,
  temasLeidos, resumenPrograma, marcarTemaLeido, marcarJuego, juegoCompletado, emitirExamen, calificarExamen,
  refrescarAvance, certificadoDe, esAdminAcademia, programas as programasLocales,
  type CertificadoAcademia, type Modulo, type Programa, type PreguntaA, type ResultadoExamen,
} from '../core/academia';
import { bloques, esc, figura, minijuegoHTML, montarInteraccion, verificacion } from '../ui/academia-bloques';
import { celebrar } from './retos';
import '../styles/academia.css';

const ic = (n: string) => `<i data-lucide="${n}" class="i" aria-hidden="true"></i>`;
// Cada área conserva un tono de la familia de marca (azules, teal y marino).
const AREAS: [RegExp, { icono: string; color: string }][] = [
  [/anatom|ciencias/i, { icono: 'scan-face', color: '#2f6fb5' }],
  [/cariol|caries/i, { icono: 'shield-plus', color: '#3b8a7d' }],
  [/periodon/i, { icono: 'heart-pulse', color: '#4a6fb0' }],
  [/endodon/i, { icono: 'git-branch', color: '#1c467a' }],
  [/pediatr/i, { icono: 'baby', color: '#4fa899' }],
  [/bioseg|infecc/i, { icono: 'shield-check', color: '#20254b' }],
];
const area = (a: string) => AREAS.find(([re]) => re.test(a))?.[1] ?? { icono: 'graduation-cap', color: '#2f6fb5' };
const num2 = (n: number) => String(n).padStart(2, '0');
const horas = (min: number) => (min >= 90 ? `${Math.round(min / 60)} h` : `${min} min`);
const vip = () => Acceso.vip() || esAdminAcademia();
const ruta = (...p: (string | number)[]) => `#/academia/${p.map((x) => encodeURIComponent(String(x))).join('/')}`;
const fechaLarga = (iso: string) => new Date(iso || Date.now()).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
const hashTxt = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

function portadaPrograma(p: Programa, grande = false) {
  const a = area(p.area);
  return `<div class="ac-portada ${grande ? 'ac-portada--grande' : ''}" style="--area-c:${a.color}">${figura(p.portada.id, '16:9', `Portada del programa ${p.titulo}`, '', undefined, 'ac-fig--portada')}<span class="ac-portada__sello"><b>${num2(p.numero)}</b><small>Programa</small></span><span class="ac-portada__ic">${ic(a.icono)}</span></div>`;
}

function migas(items: [string, string?][]) {
  return `<nav class="ac-migas" aria-label="Ruta">${items.map(([t, h], i) => (h ? `<a href="${h}">${esc(t)}</a>` : `<span aria-current="page">${esc(t)}</span>`) + (i < items.length - 1 ? ic('chevron-right') : '')).join('')}</nav>`;
}

function errorHTML(e: unknown, p?: Programa, n?: number) {
  const err = e as { codigo?: string; message?: string };
  const codigo = err?.codigo || '';
  if (codigo === 'requiere_vip' || codigo === '402') return `<div class="ac-aviso ac-aviso--vip">${ic('crown')}<div><strong>Este módulo es para miembros VIP</strong><p>El módulo 1 de cada programa es gratis. Hazte VIP para seguir con ${p ? `los ${p.modulos.length - 1} módulos restantes` : 'el resto del programa'} y presentar sus exámenes.</p><button type="button" class="btn btn--brand" data-paywall="Desbloquea todos los módulos de la Academia OdonTeck y obtén tu certificado de programa.">${ic('crown')} Hazte VIP</button></div></div>`;
  if (codigo === 'modulo_bloqueado' || codigo === '403') return `<div class="ac-aviso">${ic('lock')}<div><strong>Módulo bloqueado</strong><p>Aprueba el examen del módulo ${n ? n - 1 : 'anterior'} con 70 % o más para desbloquear este.</p>${p && n ? `<a class="btn btn--brand" href="${ruta(p.id, n - 1)}">${ic('arrow-left')} Ir al módulo ${n - 1}</a>` : ''}</div></div>`;
  if (codigo === 'modulo_en_preparacion' || codigo === '404') return `<div class="ac-aviso">${ic('pen-line')}<div><strong>Módulo en preparación</strong><p>Nuestro equipo está escribiendo este módulo y un profesional lo revisa antes de publicarlo. Te avisaremos cuando esté listo.</p>${p ? `<a class="btn btn--secondary" href="${ruta(p.id)}">${ic('arrow-left')} Volver al programa</a>` : ''}</div></div>`;
  if (codigo === 'espera_examen') return `<div class="ac-aviso">${ic('timer')}<div><strong>Un respiro antes de reintentar</strong><p>${esc(err?.message || 'Repasa las explicaciones y vuelve a intentarlo en unos minutos.')}</p></div></div>`;
  return `<div class="ac-aviso">${ic('circle-alert')}<div><strong>No pudimos cargar el contenido</strong><p>${esc(err?.message || 'Intenta de nuevo en un momento.')}</p></div></div>`;
}
const envolver = (html: string, extra = '') => `<section class="ac ${extra}">${html}</section>`;

function certificadoHTML(c: CertificadoAcademia, compacto = false) {
  return `<article class="ac-certificado ${compacto ? 'ac-certificado--compacto' : ''}">
    <div class="ac-certificado__marco">
      <span class="ac-certificado__sello">${ic('award')}</span>
      <div class="ac-certificado__txt">
        <span class="eyebrow">Certificado de programa · Academia OdonTeck</span>
        <strong>${esc(c.programaTitulo)}</strong>
        <p>Otorgado a <b>${esc(c.nombre)}</b> por aprobar los ${c.modulos} módulos · ${fechaLarga(c.emitido)}</p>
      </div>
      <div class="ac-certificado__folio"><small>Folio</small><span class="mono">${esc(c.folio)}</span></div>
    </div>
    <div class="ac-certificado__acciones">
      <a class="btn btn--secondary btn--sm" href="#/verificar/${encodeURIComponent(c.folio)}">${ic('shield-check')} Verificación pública</a>
      <button type="button" class="btn btn--ghost btn--sm" data-ac-copiar="${esc(c.folio)}">${ic('copy')} Copiar folio</button>
    </div>
  </article>`;
}

// ═════════ Catálogo ═════════
export async function academia() {
  let lista: Programa[];
  try { lista = await cargarCatalogo(); } catch (e) { return envolver(errorHTML(e)); }
  if (!lista.length) return envolver(`<div class="ac-aviso">${ic('pen-line')}<div><strong>La Academia está en preparación</strong><p>Pronto encontrarás aquí programas de lectura guiada con exámenes y certificado.</p></div></div>`);
  const totalModulos = lista.reduce((a, p) => a + p.modulos.length, 0);
  const listos = lista.reduce((a, p) => a + p.modulos.filter((m) => m.disponible).length, 0);
  const enCurso = lista.filter((p) => { const r = resumenPrograma(p); return r.iniciado && !r.completo; });
  const areas = [...new Set(lista.map((p) => p.area))];
  const tarjeta = (p: Programa) => {
    const r = resumenPrograma(p);
    const disp = p.modulos.filter((m) => m.disponible).length;
    const a = area(p.area);
    return `<a class="ac-card" href="${ruta(p.id)}" data-area="${esc(p.area)}" data-buscar="${esc(`${p.titulo} ${p.area} ${p.descripcion}`.toLowerCase())}" style="--area-c:${a.color}">
      ${portadaPrograma(p)}
      <div class="ac-card__body">
        <span class="ac-card__area">${ic(a.icono)}${esc(p.area)}</span>
        <h3>${esc(p.titulo)}</h3>
        <p>${esc(p.descripcion)}</p>
        <div class="ac-card__meta"><span>${ic('layers')}${p.modulos.length} módulos</span><span>${ic('signal')}${esc(p.nivel)}</span>${certificadoDe(p.id) ? `<span class="ac-card__ok">${ic('award')}Certificado</span>` : ''}</div>
        ${r.iniciado ? `<div class="progress progress--thin" aria-label="Avance ${r.pct} %"><span style="width:${r.pct}%"></span></div><small class="ac-card__avance">${r.aprobados} de ${r.total} módulos aprobados</small>` : disp < p.modulos.length ? `<small class="ac-card__avance">${disp ? `${disp} de ${p.modulos.length} módulos publicados` : 'En preparación'}</small>` : ''}
      </div></a>`;
  };
  return `<section class="ac ac-catalogo">
    <header class="ac-hero">
      <div class="ac-hero__txt">
        <span class="ac-hero__eyebrow">${ic('graduation-cap')} Academia OdonTeck</span>
        <h1>Aprende odontología <em>módulo a módulo</em></h1>
        <p>Programas de lectura guiada con figuras, casos clínicos, actividades y exámenes. Avanzas a tu ritmo: apruebas un módulo y se abre el siguiente. Al terminar, obtienes un certificado con folio verificable.</p>
        <dl class="ac-hero__datos"><div><dt>Programas</dt><dd>${lista.length}</dd></div><div><dt>Módulos</dt><dd>${totalModulos}</dd></div><div><dt>Publicados</dt><dd>${listos}</dd></div></dl>
      </div>
      <ol class="ac-hero__ruta" aria-label="Cómo funciona">
        <li>${ic('book-open')}<span><b>Lee</b>temas cortos con figuras</span></li>
        <li>${ic('puzzle')}<span><b>Practica</b>casos, actividades y minijuegos</span></li>
        <li>${ic('clipboard-check')}<span><b>Aprueba</b>el examen de cada módulo</span></li>
        <li>${ic('award')}<span><b>Certifícate</b>al completar el programa</span></li>
      </ol>
    </header>
    ${enCurso.length ? `<section class="ac-seguir"><h2 class="ac-h2">${ic('play')} Continúa donde te quedaste</h2><div class="ac-seguir__lista">${enCurso.map((p) => { const r = resumenPrograma(p); return `<a class="ac-seguir__item" href="${ruta(p.id, r.siguiente)}" style="--area-c:${area(p.area).color}"><span class="ac-seguir__num">${num2(p.numero)}</span><span><strong>${esc(p.titulo)}</strong><small>Módulo ${r.siguiente} · ${esc(p.modulos.find((m) => m.n === r.siguiente)?.titulo || '')}</small><span class="progress progress--thin"><span style="width:${r.pct}%"></span></span></span>${ic('arrow-right')}</a>`; }).join('')}</div></section>` : ''}
    <div class="ac-filtros" role="search">
      <label class="ac-buscar">${ic('search')}<input type="search" placeholder="Buscar programa o tema…" data-ac-buscar aria-label="Buscar programa"></label>
      <div class="ac-chips" role="group" aria-label="Filtrar por área"><button type="button" class="ac-chip is-on" data-ac-area="">Todos</button>${areas.map((a) => `<button type="button" class="ac-chip" data-ac-area="${esc(a)}">${ic(area(a).icono)}${esc(a)}</button>`).join('')}</div>
    </div>
    <div class="ac-grid" data-ac-grid>${lista.map(tarjeta).join('')}</div>
    <p class="ac-vacio" data-ac-vacio hidden>No encontramos programas con esa búsqueda.</p>
  </section>`;
}

// ═════════ Portada del programa ═════════
const PUBLICO: Record<string, string> = { secundaria: 'Secundaria', bachillerato: 'Bachillerato', universidad: 'Universidad', profesional: 'Profesionales' };

export async function academiaPrograma(params: Record<string, string>) {
  const p0 = getPrograma(params.programa);
  if (!p0) return envolver(`${migas([['Academia', '#/academia'], ['No encontrado']])}${errorHTML({ codigo: '404' })}`);
  let p: Programa = p0;
  try { p = (await cargarCatalogo()).find((x) => x.id === p0.id) || p0; } catch { /* sigue con el catálogo público */ }
  const r = resumenPrograma(p);
  const totalMin = p.modulos.reduce((a, m) => a + (m.duracionMin || 0), 0);
  const cert = certificadoDe(p.id);
  const a = area(p.area);
  const sendero = p.modulos.map((m) => {
    const ok = moduloAprobado(p.id, m.n), abierto = moduloDesbloqueado(p.id, m.n), actual = m.n === r.siguiente && !r.completo;
    const av = avanceModulo(p.id, m.n);
    const estado = ok ? 'is-ok' : actual ? 'is-actual' : abierto ? 'is-abierto' : 'is-cerrado';
    const sello = ok ? ic('check') : !abierto ? ic('lock') : m.n > 1 && !vip() ? ic('crown') : `<b>${m.n}</b>`;
    const etiqueta = `Módulo ${m.n}${m.n === 1 ? ' · gratis' : ''}${m.disponible === false ? ' · en preparación' : ''}`;
    return `<li class="ac-paso ${estado}"><a href="${ruta(p.id, m.n)}"><span class="ac-paso__sello">${sello}</span><span class="ac-paso__txt"><small>${etiqueta}</small><strong>${esc(m.titulo)}</strong>${ok ? `<em>Aprobado · ${av.mejor ?? ''} %</em>` : actual && av.temas ? `<em>${Object.keys(av.temas).length} temas leídos</em>` : ''}</span>${ic('chevron-right')}</a></li>`;
  }).join('');
  return `<section class="ac ac-programa" style="--area-c:${a.color}">
    ${migas([['Academia', '#/academia'], [p.titulo]])}
    <header class="ac-prog">
      ${portadaPrograma(p, true)}
      <div class="ac-prog__txt">
        <span class="ac-card__area">${ic(a.icono)}${esc(p.area)} · ${esc(p.nivel)}</span>
        <h1>${esc(p.titulo)}</h1>
        <p>${esc(p.descripcion)}</p>
        <div class="ac-datos"><span>${ic('layers')}<b>${p.modulos.length}</b> módulos</span>${totalMin ? `<span>${ic('clock')}<b>${horas(totalMin)}</b> aprox.</span>` : ''}<span>${ic('clipboard-check')}<b>70 %</b> para aprobar cada módulo</span></div>
        <div class="ac-prog__publico">${p.publico.map((x) => `<span class="chip">${esc(PUBLICO[x] || x)}</span>`).join('')}</div>
        <div class="ac-prog__cta"><a class="btn btn--brand btn--lg" href="${ruta(p.id, r.siguiente)}">${r.completo ? 'Repasar el programa' : r.iniciado ? `Continuar en el módulo ${r.siguiente}` : 'Empezar el módulo 1'} ${ic('arrow-right')}</a>${r.iniciado ? `<div class="ac-prog__avance"><div class="progress"><span style="width:${r.pct}%"></span></div><small>${r.aprobados} de ${r.total} módulos aprobados</small></div>` : ''}</div>
      </div>
    </header>
    ${cert ? certificadoHTML(cert) : ''}
    <div class="ac-cuerpo2">
      <section><h2 class="ac-h2">${ic('route')} Ruta del programa</h2><ol class="ac-sendero">${sendero}</ol></section>
      <aside class="ac-lado">
        ${cert ? '' : `<div class="ac-cert"><span class="ac-cert__sello">${ic('award')}</span><strong>Certificado al terminar</strong><p>Aprueba los ${p.modulos.length} módulos y obtén un certificado con folio ODT verificable públicamente.</p>${r.iniciado ? `<div class="progress progress--thin"><span style="width:${r.pct}%"></span></div>` : ''}</div>`}
        <div class="ac-como card"><h3>Cómo avanzas</h3><ol><li>Lee los temas del módulo; cada uno cierra con 3 preguntas de repaso.</li><li>Practica con las actividades y el minijuego.</li><li>Presenta el examen: 10 preguntas al azar, 70 % para aprobar.</li><li>Al aprobar se abre el siguiente módulo. Puedes repetir el examen.</li></ol>${vip() ? '' : `<p class="ac-como__vip">${ic('crown')} El módulo 1 es gratis; el resto es para miembros VIP.</p>`}</div>
      </aside>
    </div>
  </section>`;
}

// ═════════ Mapa del módulo ═════════
interface Preparado { html?: string; p?: Programa; n?: number; m?: Modulo; migasMod?: () => string }
type Listo = Required<Omit<Preparado, 'html'>>;
async function prepararModulo(params: Record<string, string>): Promise<Preparado> {
  const p = getPrograma(params.programa); const n = Number(params.n);
  // El avance (desbloqueos) llega con el catálogo: en modo API se asegura antes de decidir candados.
  if (Datos.modo === 'api') await cargarCatalogo().catch(() => null);
  if (!p || !p.modulos.some((m) => m.n === n)) return { html: envolver(`${migas([['Academia', '#/academia'], ['No encontrado']])}${errorHTML({ codigo: '404' }, p)}`) };
  const migasMod = () => migas([['Academia', '#/academia'], [p.titulo, ruta(p.id)], [`Módulo ${n}`]]);
  if (n > 1 && !vip()) return { html: envolver(`${migasMod()}${errorHTML({ codigo: 'requiere_vip' }, p, n)}`) };
  if (!moduloDesbloqueado(p.id, n)) return { html: envolver(`${migasMod()}${errorHTML({ codigo: 'modulo_bloqueado' }, p, n)}`) };
  try { const m = await cargarModulo(p.id, n); return { p, n, m, migasMod }; } catch (e) { return { html: envolver(`${migasMod()}${errorHTML(e, p, n)}`) }; }
}

export async function academiaModulo(params: Record<string, string>) {
  const r = await prepararModulo(params);
  if (!r.m) return r.html!;
  const { p, n, m, migasMod } = r as Listo;
  const av = avanceModulo(p.id, n);
  const leidos = temasLeidos(p.id, m);
  const todos = leidos === m.temas.length;
  const actividades = m.temas.reduce((a, t) => a + t.bloques.filter((b) => b.tipo === 'actividad').length, 0);
  const juego = ({ sopa: ['grid-3x3', 'Sopa de letras'], crucigrama: ['type', 'Crucigrama'], memorama: ['copy', 'Memorama'] } as Record<string, string[]>)[m.minijuego?.tipo] ?? ['puzzle', 'Minijuego'];
  const lista = m.temas.map((t, i) => {
    const leido = !!av.temas?.[t.n];
    const figs = t.bloques.filter((b) => b.tipo === 'figura').length;
    const acts = t.bloques.filter((b) => b.tipo === 'actividad').length;
    return `<li class="ac-tema ${leido ? 'is-ok' : ''}"><a href="${ruta(p.id, n, i + 1)}"><span class="ac-tema__n">${esc(t.n)}</span><span class="ac-tema__txt"><strong>${esc(t.titulo)}</strong><small>${ic('clock')}${t.minutos} min · ${figs} figura${figs === 1 ? '' : 's'} · ${acts} actividad${acts === 1 ? '' : 'es'}</small></span><span class="ac-tema__estado">${leido ? `${ic('check')} Leído` : `Leer ${ic('arrow-right')}`}</span></a></li>`;
  }).join('');
  const siguienteTema = m.temas.findIndex((t) => !av.temas?.[t.n]);
  const borrador = m.estado && m.estado !== 'aprobado';
  return `<section class="ac ac-modulo" style="--area-c:${area(p.area).color}">
    ${migasMod()}
    ${borrador ? `<div class="ac-borrador">${ic('eye')} Vista previa: este módulo está en <b>${esc(m.estado)}</b> y aún no lo ven los miembros.</div>` : ''}
    <header class="ac-mod">
      <div class="ac-mod__txt">
        <span class="chip chip--primary">${ic('layers')} Módulo ${n} de ${p.modulos.length}</span>
        <h1>${esc(m.titulo)}</h1>
        <p class="ac-lead">${esc(m.resumen)}</p>
        <div class="ac-datos"><span>${ic('book-open')}<b>${m.temas.length}</b> temas</span><span>${ic('puzzle')}<b>${actividades}</b> actividades</span><span>${ic('clock')}<b>${horas(m.duracionMin)}</b></span>${av.mejor != null ? `<span>${ic('trophy')}Mejor examen <b>${av.mejor} %</b></span>` : ''}</div>
        <a class="btn btn--brand btn--lg" href="${siguienteTema >= 0 ? ruta(p.id, n, siguienteTema + 1) : ruta(p.id, n, 'examen')}">${siguienteTema < 0 ? (av.aprobado ? 'Repetir el examen' : 'Presentar el examen') : leidos ? `Seguir con el tema ${m.temas[siguienteTema].n}` : 'Empezar a leer'} ${ic('arrow-right')}</a>
      </div>
      ${figura(m.portada.id, '16:9', m.portada.alt, '', undefined, 'ac-mod__portada')}
    </header>
    <div class="ac-cuerpo2">
      <section>
        <h2 class="ac-h2">${ic('target')} Al terminar podrás</h2>
        <ul class="ac-objetivos">${m.objetivos.map((o) => `<li>${ic('check')}<span>${esc(o)}</span></li>`).join('')}</ul>
        <h2 class="ac-h2">${ic('list-ordered')} Temas <small>${leidos} de ${m.temas.length} leídos</small></h2>
        <ol class="ac-temas">${lista}</ol>
      </section>
      <aside class="ac-lado">
        <a class="ac-paso-final ${juegoCompletado(p.id, n) ? 'is-ok' : ''}" href="${ruta(p.id, n, 'juego')}"><span class="ac-paso-final__ic">${ic(juego[0])}</span><span><small>Minijuego del módulo</small><strong>${juego[1]}</strong><em>${juegoCompletado(p.id, n) ? 'Completado' : 'Repasa el vocabulario jugando'}</em></span>${ic('arrow-right')}</a>
        <a class="ac-paso-final ac-paso-final--examen ${av.aprobado ? 'is-ok' : ''} ${todos ? '' : 'is-pendiente'}" href="${ruta(p.id, n, 'examen')}"><span class="ac-paso-final__ic">${ic(av.aprobado ? 'badge-check' : 'clipboard-check')}</span><span><small>Examen del módulo</small><strong>${av.aprobado ? `Aprobado · ${av.mejor} %` : `${m.examen.mostrar} preguntas · ${m.examen.aprobar} % para aprobar`}</strong><em>${todos ? (av.aprobado ? (n < p.modulos.length ? `Módulo ${n + 1} desbloqueado` : 'Programa completo') : 'Listo para presentarlo') : `Lee los ${m.temas.length} temas para habilitarlo`}</em></span>${ic(todos ? 'arrow-right' : 'lock')}</a>
      </aside>
    </div>
  </section>`;
}

// ═════════ Lector de temas ═════════
export async function academiaTema(params: Record<string, string>) {
  const r = await prepararModulo(params);
  if (!r.m) return r.html!;
  const { p, n, m } = r as Listo;
  const t = Number(params.t);
  const tema = m.temas[t - 1];
  if (!tema) return academiaModulo(params);
  const av = avanceModulo(p.id, n);
  const anterior = t > 1 ? ruta(p.id, n, t - 1) : ruta(p.id, n);
  const ultimo = t === m.temas.length;
  const siguiente = ultimo ? ruta(p.id, n, 'juego') : ruta(p.id, n, t + 1);
  const subtitulos = tema.bloques.filter((b) => b.tipo === 'subtitulo') as { tipo: 'subtitulo'; texto: string }[];
  const habla = 'speechSynthesis' in window;
  return `<section class="ac ac-lector" style="--area-c:${area(p.area).color}" data-ac-lector="${esc(p.id)}|${n}|${esc(tema.n)}">
    <div class="ac-lector__progreso" aria-hidden="true"><span data-ac-progreso></span></div>
    <details class="ac-indice" data-ac-indice>
      <summary>${ic('list')} <span>Índice del módulo · tema ${esc(tema.n)} de ${m.temas.length}</span>${ic('chevron-down')}</summary>
      <a class="ac-indice__mod" href="${ruta(p.id, n)}">${ic('arrow-left')}<span><small>Módulo ${n}</small>${esc(m.titulo)}</span></a>
      <ol>${m.temas.map((x, i) => `<li class="${i + 1 === t ? 'is-actual' : ''} ${av.temas?.[x.n] ? 'is-ok' : ''}"><a href="${ruta(p.id, n, i + 1)}"${i + 1 === t ? ' aria-current="page"' : ''}><span>${av.temas?.[x.n] ? ic('check') : esc(x.n)}</span>${esc(x.titulo)}</a>${i + 1 === t && subtitulos.length ? `<ul>${subtitulos.map((s) => `<li><a href="#" data-ac-ir="s-${hashTxt(s.texto)}">${esc(s.texto)}</a></li>`).join('')}</ul>` : ''}</li>`).join('')}
        <li class="ac-indice__extra"><a href="${ruta(p.id, n, 'juego')}"><span>${ic('puzzle')}</span>Minijuego</a></li>
        <li class="ac-indice__extra"><a href="${ruta(p.id, n, 'examen')}"><span>${ic('clipboard-check')}</span>Examen</a></li>
      </ol>
    </details>
    <article class="ac-articulo" data-ac-articulo>
      ${migas([['Academia', '#/academia'], [p.titulo, ruta(p.id)], [`Módulo ${n}`, ruta(p.id, n)], [`Tema ${tema.n}`]])}
      <header class="ac-art__head">
        <span class="chip chip--accent">${ic('book-open')} Tema ${esc(tema.n)} · ${tema.minutos} min de lectura</span>
        <h1>${esc(tema.titulo)}</h1>
        <div class="ac-herr" role="toolbar" aria-label="Herramientas de lectura">
          <button type="button" class="ac-herr__b" data-ac-letra="-1" aria-label="Letra más pequeña">A−</button>
          <button type="button" class="ac-herr__b" data-ac-letra="1" aria-label="Letra más grande">A+</button>
          ${habla ? `<button type="button" class="ac-herr__b" data-ac-escuchar aria-pressed="false">${ic('volume-2')}<span>Escuchar</span></button>` : ''}
        </div>
      </header>
      <aside class="ac-pocas"><span>${ic('sparkles')} En pocas palabras</span><p>${esc(tema.enPocasPalabras)}</p></aside>
      <div class="ac-cuerpo" data-ac-cuerpo>${bloques(tema)}</div>
      ${tema.verificacion?.length ? verificacion(tema) : ''}
      <footer class="ac-art__pie">
        <a class="btn btn--secondary" href="${anterior}">${ic('arrow-left')} ${t > 1 ? `Tema ${m.temas[t - 2].n}` : 'Módulo'}</a>
        <a class="btn btn--brand" href="${siguiente}" data-ac-terminar>${ultimo ? 'Terminar y jugar el minijuego' : `Siguiente: tema ${m.temas[t].n}`} ${ic('arrow-right')}</a>
      </footer>
    </article>
  </section>`;
}

// ═════════ Minijuego ═════════
export async function academiaJuego(params: Record<string, string>) {
  const r = await prepararModulo(params);
  if (!r.m) return r.html!;
  const { p, n, m } = r as Listo;
  const semilla = [...`${p.id}${n}${Date.now() >> 16}`].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 9);
  return `<section class="ac ac-juego" style="--area-c:${area(p.area).color}" data-ac-juego="${esc(p.id)}|${n}">
    ${migas([['Academia', '#/academia'], [p.titulo, ruta(p.id)], [`Módulo ${n}`, ruta(p.id, n)], ['Minijuego']])}
    <header class="ac-juego__head"><span class="chip chip--primary">${ic('puzzle')} Minijuego del módulo ${n}</span><h1>${esc(m.minijuego.titulo)}</h1><p class="ac-lead">Repasa el vocabulario del módulo antes del examen.</p></header>
    <div class="ac-juego__tablero">${minijuegoHTML(m.minijuego, semilla)}</div>
    <div class="ac-juego__fin" data-ac-juego-fin hidden><span class="ac-juego__sello">${ic('trophy')}</span><div><strong>¡Completado!</strong><p>Ya dominas el vocabulario del módulo. Ahora sí, al examen.</p></div><a class="btn btn--brand" href="${ruta(p.id, n, 'examen')}">Ir al examen ${ic('arrow-right')}</a></div>
    <footer class="ac-art__pie"><a class="btn btn--secondary" href="${ruta(p.id, n)}">${ic('arrow-left')} Volver al módulo</a><a class="btn btn--secondary" href="${ruta(p.id, n, 'examen')}">Saltar al examen ${ic('arrow-right')}</a></footer>
  </section>`;
}

// ═════════ Examen ═════════
let examenActual: { p: string; n: number; preguntas: PreguntaA[]; resp: Record<string, number | null>; i: number } | null = null;

export async function academiaExamen(params: Record<string, string>) {
  const r = await prepararModulo(params);
  if (!r.m) return r.html!;
  const { p, n, m } = r as Listo;
  examenActual = null;
  const leidos = temasLeidos(p.id, m), todos = leidos === m.temas.length;
  const av = avanceModulo(p.id, n);
  return `<section class="ac ac-examen" style="--area-c:${area(p.area).color}" data-ac-examen="${esc(p.id)}|${n}">
    ${migas([['Academia', '#/academia'], [p.titulo, ruta(p.id)], [`Módulo ${n}`, ruta(p.id, n)], ['Examen']])}
    <div class="ac-ex" data-ac-ex>
      <div class="ac-ex__intro">
        <span class="ac-ex__sello">${ic('clipboard-check')}</span>
        <span class="eyebrow">Examen del módulo ${n}</span>
        <h1>${esc(m.titulo)}</h1>
        <ul class="ac-ex__reglas"><li>${ic('list-ordered')}<span><b>${m.examen.mostrar}</b> preguntas al azar de un banco de ${m.examen.total ?? m.examen.preguntas?.length ?? m.examen.mostrar}</span></li><li>${ic('target')}<span><b>${m.examen.aprobar} %</b> para aprobar y desbloquear ${n < p.modulos.length ? `el módulo ${n + 1}` : 'tu certificado del programa'}</span></li><li>${ic('rotate-ccw')}<span>Puedes repetirlo; cuenta tu mejor resultado</span></li><li>${ic('keyboard')}<span>Atajos: teclas 1 a 4 para elegir, flechas para moverte</span></li></ul>
        ${av.intentos ? `<p class="ac-ex__previo">${ic('history')} ${av.intentos} intento${av.intentos === 1 ? '' : 's'} · mejor resultado <b>${av.mejor} %</b>${av.aprobado ? ' · aprobado' : ''}</p>` : ''}
        ${todos ? `<button type="button" class="btn btn--brand btn--lg" data-ac-ex-iniciar>${av.intentos ? 'Presentar de nuevo' : 'Comenzar examen'} ${ic('arrow-right')}</button>` : `<div class="ac-aviso">${ic('book-open')}<div><strong>Primero termina la lectura</strong><p>Has leído ${leidos} de ${m.temas.length} temas. El examen se habilita al leerlos todos.</p><a class="btn btn--brand" href="${ruta(p.id, n, (m.temas.findIndex((t) => !av.temas?.[t.n]) + 1) || 1)}">Seguir leyendo ${ic('arrow-right')}</a></div></div>`}
      </div>
    </div>
  </section>`;
}

function pintarPregunta(root: HTMLElement) {
  const ex = examenActual!; const q = ex.preguntas[ex.i];
  const total = ex.preguntas.length, elegida = ex.resp[q.id];
  const respondidas = Object.values(ex.resp).filter((v) => v != null).length;
  root.innerHTML = `<div class="ac-ex__run">
    <header class="ac-ex__barra"><span><b>${ex.i + 1}</b> de ${total}</span><div class="progress"><span style="width:${((ex.i + 1) / total) * 100}%"></span></div></header>
    <fieldset class="ac-ex__q"><legend>${esc(q.q)}</legend><div class="ac-q__ops">${q.opciones.map((o, j) => `<button type="button" class="ac-op ${elegida === j ? 'is-sel' : ''}" data-ac-ex-op="${j}" aria-pressed="${elegida === j}"><span class="ac-op__l">${'ABCD'[j]}</span><span>${esc(o)}</span></button>`).join('')}</div></fieldset>
    <footer class="ac-ex__nav"><button type="button" class="btn btn--secondary" data-ac-ex-prev ${ex.i === 0 ? 'disabled' : ''}>${ic('arrow-left')} Anterior</button><span class="ac-ex__puntos" aria-hidden="true">${ex.preguntas.map((x, k) => `<i class="${ex.resp[x.id] != null ? 'is-r' : ''} ${k === ex.i ? 'is-a' : ''}"></i>`).join('')}</span>${ex.i < total - 1 ? `<button type="button" class="btn btn--brand" data-ac-ex-next ${elegida == null ? 'disabled' : ''}>Siguiente ${ic('arrow-right')}</button>` : `<button type="button" class="btn btn--gradient" data-ac-ex-enviar ${respondidas < total ? 'disabled' : ''}>Entregar examen ${ic('send')}</button>`}</footer>
  </div>`;
  createIcons({ icons, root });
}

function pintarResultado(root: HTMLElement, r: ResultadoExamen) {
  const ex = examenActual!;
  const q = new Map(ex.preguntas.map((x) => [x.id, x]));
  const cert = r.certificado;
  root.innerHTML = `<div class="ac-ex__res ${r.aprobado ? 'is-ok' : 'is-no'}">
    <div class="ac-ex__nota"><svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="52" class="ac-ex__aro"/><circle cx="60" cy="60" r="52" class="ac-ex__aro-v" style="stroke-dasharray:${(r.porcentaje / 100) * 326.7} 326.7"/></svg><b>${r.porcentaje}<small>%</small></b></div>
    <span class="chip ${r.aprobado ? 'chip--accent' : ''}">${r.aprobado ? `${ic('badge-check')} Módulo aprobado` : `${ic('rotate-ccw')} Aún no`}</span>
    <h2>${r.aprobado ? (r.programaCompleto ? '¡Completaste el programa!' : '¡Aprobaste el módulo!') : 'Te faltó poco'}</h2>
    <p>${r.correctas} de ${r.total} correctas · mejor resultado ${r.mejor} %. ${r.aprobado ? (r.programaCompleto ? 'Aprobaste todos los módulos del programa.' : r.siguiente ? `El módulo ${r.siguiente} ya está abierto.` : '') : 'Necesitas 70 % para aprobar. Revisa las explicaciones y vuelve a intentarlo en unos minutos.'}</p>
    ${cert ? certificadoHTML(cert, true) : ''}
    <div class="ac-ex__acciones">${r.aprobado && r.siguiente ? `<a class="btn btn--brand btn--lg" href="${ruta(ex.p, r.siguiente)}">Ir al módulo ${r.siguiente} ${ic('arrow-right')}</a>` : ''}${!r.aprobado ? `<button type="button" class="btn btn--brand btn--lg" data-ac-ex-iniciar>Intentar de nuevo ${ic('rotate-ccw')}</button>` : ''}<a class="btn btn--secondary" href="${r.programaCompleto ? ruta(ex.p) : ruta(ex.p, ex.n)}">${r.programaCompleto ? 'Ver el programa' : 'Volver al módulo'}</a></div>
    <h3 class="ac-h2">${ic('list-checks')} Revisión de respuestas</h3>
    <ol class="ac-ex__rev">${r.detalle.map((d) => { const x = q.get(d.id); if (!x) return ''; const elegida = ex.resp[d.id]; return `<li class="${d.acertada ? 'is-ok' : 'is-no'}"><p><b>${esc(x.q)}</b></p><p class="ac-ex__tu">${ic(d.acertada ? 'circle-check' : 'circle-x')} Tu respuesta: ${elegida != null ? esc(x.opciones[elegida]) : 'sin responder'}</p>${d.acertada ? '' : `<p class="ac-ex__buena">${ic('check')} Correcta: ${esc(x.opciones[d.correcta] ?? '')}</p>`}<p class="ac-ex__exp">${esc(d.explicacion)}</p></li>`; }).join('')}</ol>
  </div>`;
  createIcons({ icons, root });
  if (r.aprobado) celebrar(r.programaCompleto ? 'grande' : 'normal', document.body);
  root.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
}

// ═════════ Montaje ═════════
let desmontar: (() => void) | null = null;
const LETRA = 'odonteck-club:academia:letra';

/** Se llama en cada render: limpia lo anterior y conecta los eventos si la página es de la Academia. */
export function montarAcademia() {
  desmontar?.(); desmontar = null;
  const root = document.querySelector<HTMLElement>('#outlet .ac');
  if (!root) return;
  const ab = new AbortController();
  const sig = { signal: ab.signal };
  const suave: ScrollBehavior = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  if (Datos.modo === 'api') void refrescarAvance().catch(() => {});

  // Tamaño de letra del lector (preferencia por persona).
  const aplicarLetra = (v: number) => root.style.setProperty('--ac-letra', String(v));
  let letra = 1; try { letra = Number(localStorage.getItem(LETRA)) || 1; } catch { /* sin almacenamiento */ }
  aplicarLetra(letra);

  // Catálogo: búsqueda y filtro por área.
  const grid = root.querySelector<HTMLElement>('[data-ac-grid]');
  let areaSel = '';
  const filtrar = () => {
    const q = (root.querySelector<HTMLInputElement>('[data-ac-buscar]')?.value || '').trim().toLowerCase();
    let visibles = 0;
    grid?.querySelectorAll<HTMLElement>('.ac-card').forEach((c) => { const ok = (!areaSel || c.dataset.area === areaSel) && (!q || c.dataset.buscar!.includes(q)); c.hidden = !ok; if (ok) visibles++; });
    const v = root.querySelector<HTMLElement>('[data-ac-vacio]'); if (v) v.hidden = visibles > 0;
  };
  root.querySelector('[data-ac-buscar]')?.addEventListener('input', filtrar, sig);

  // Lector: índice abierto en escritorio, barra de progreso y tema leído al llegar al final.
  const lector = root.matches('[data-ac-lector]') ? root : null;
  if (lector) {
    const indice = root.querySelector<HTMLDetailsElement>('[data-ac-indice]');
    const escritorio = matchMedia('(min-width: 1100px)');
    const ajustarIndice = () => { if (indice) indice.open = escritorio.matches; };
    ajustarIndice();
    escritorio.addEventListener('change', ajustarIndice, sig);
    const [pid, n, tema] = lector.dataset.acLector!.split('|');
    const barra = root.querySelector<HTMLElement>('[data-ac-progreso]');
    const art = root.querySelector<HTMLElement>('[data-ac-articulo]')!;
    let marcado = false;
    const onScroll = () => {
      const r = art.getBoundingClientRect();
      const pct = Math.min(1, Math.max(0, (innerHeight - r.top) / Math.max(1, r.height)));
      if (barra) barra.style.width = `${pct * 100}%`;
      if (pct > 0.92 && !marcado) { marcado = true; void marcarTemaLeido(pid, Number(n), tema); }
    };
    addEventListener('scroll', onScroll, { passive: true, signal: ab.signal });
    onScroll();
    root.querySelector('[data-ac-terminar]')?.addEventListener('click', () => { void marcarTemaLeido(pid, Number(n), tema); }, sig);
  }

  montarInteraccion(root, {
    alCompletarJuego: () => {
      const j = root.matches('[data-ac-juego]') ? root : null;
      if (!j) return;
      const [pid, n] = j.dataset.acJuego!.split('|');
      marcarJuego(pid, Number(n));
      const fin = root.querySelector<HTMLElement>('[data-ac-juego-fin]'); if (fin) { fin.hidden = false; fin.scrollIntoView({ behavior: suave, block: 'center' }); }
      celebrar('normal', document.body);
    },
  });

  root.addEventListener('click', async (e) => {
    const el = e.target as HTMLElement;
    const chip = el.closest<HTMLElement>('[data-ac-area]');
    if (chip) { areaSel = chip.dataset.acArea || ''; root.querySelectorAll('[data-ac-area]').forEach((c) => c.classList.toggle('is-on', c === chip)); filtrar(); return; }
    const ir = el.closest<HTMLElement>('[data-ac-ir]');
    if (ir) { e.preventDefault(); document.getElementById(ir.dataset.acIr!)?.scrollIntoView({ behavior: suave, block: 'start' }); if (!matchMedia('(min-width: 1100px)').matches) root.querySelector<HTMLDetailsElement>('[data-ac-indice]')?.removeAttribute('open'); return; }
    const copiar = el.closest<HTMLElement>('[data-ac-copiar]');
    if (copiar) { try { await navigator.clipboard.writeText(copiar.dataset.acCopiar || ''); copiar.innerHTML = `${ic('check')} Copiado`; createIcons({ icons, root: copiar }); } catch { /* sin portapapeles */ } return; }
    const l = el.closest<HTMLElement>('[data-ac-letra]');
    if (l) { letra = Math.min(1.3, Math.max(0.9, Math.round((letra + Number(l.dataset.acLetra) * 0.1) * 10) / 10)); aplicarLetra(letra); try { localStorage.setItem(LETRA, String(letra)); } catch { /* sin almacenamiento */ } return; }
    const escuchar = el.closest<HTMLButtonElement>('[data-ac-escuchar]');
    if (escuchar && 'speechSynthesis' in window) {
      if (speechSynthesis.speaking) { speechSynthesis.cancel(); escuchar.setAttribute('aria-pressed', 'false'); return; }
      const texto = [...root.querySelectorAll<HTMLElement>('.ac-art__head h1, .ac-pocas p, .ac-cuerpo .ac-sub, .ac-cuerpo .ac-txt, .ac-cuerpo .ac-pasos, .ac-cuerpo .ac-lista, .ac-cuerpo .ac-rec')].map((x) => x.innerText).join('. ');
      const u = new SpeechSynthesisUtterance(texto); u.lang = 'es-MX'; u.rate = 1;
      const voz = speechSynthesis.getVoices().find((v) => v.lang === 'es-MX') ?? speechSynthesis.getVoices().find((v) => v.lang.startsWith('es'));
      if (voz) u.voice = voz;
      u.onend = () => escuchar.setAttribute('aria-pressed', 'false');
      speechSynthesis.speak(u); escuchar.setAttribute('aria-pressed', 'true');
      return;
    }
    // Examen
    const exRoot = root.querySelector<HTMLElement>('[data-ac-ex]');
    const exAttr = root.matches('[data-ac-examen]') ? root.dataset.acExamen : undefined;
    if (!exRoot || !exAttr) return;
    const [pid, nn] = exAttr.split('|'); const n = Number(nn);
    const iniciar = el.closest<HTMLButtonElement>('[data-ac-ex-iniciar]');
    if (iniciar) {
      iniciar.disabled = true;
      try {
        const ex = await emitirExamen(pid, n);
        examenActual = { p: pid, n, preguntas: ex.preguntas, resp: {}, i: 0 };
        pintarPregunta(exRoot); exRoot.scrollIntoView({ behavior: suave, block: 'start' });
      } catch (err) {
        iniciar.disabled = false;
        exRoot.querySelector('.ac-aviso')?.remove();
        exRoot.insertAdjacentHTML('beforeend', errorHTML(err, getPrograma(pid), n)); createIcons({ icons, root: exRoot });
      }
      return;
    }
    if (!examenActual) return;
    const op = el.closest<HTMLElement>('[data-ac-ex-op]');
    if (op) { examenActual.resp[examenActual.preguntas[examenActual.i].id] = Number(op.dataset.acExOp); pintarPregunta(exRoot); exRoot.querySelector<HTMLElement>(`[data-ac-ex-op="${op.dataset.acExOp}"]`)?.focus(); return; }
    if (el.closest('[data-ac-ex-next]')) { examenActual.i++; pintarPregunta(exRoot); return; }
    if (el.closest('[data-ac-ex-prev]')) { examenActual.i--; pintarPregunta(exRoot); return; }
    const enviar = el.closest<HTMLButtonElement>('[data-ac-ex-enviar]');
    if (enviar) {
      enviar.disabled = true; enviar.textContent = 'Calificando…';
      try { pintarResultado(exRoot, await calificarExamen(pid, n, examenActual.preguntas.map((x) => x.id), examenActual.resp)); }
      catch (err) { enviar.disabled = false; enviar.textContent = 'Entregar examen'; exRoot.insertAdjacentHTML('beforeend', errorHTML(err, getPrograma(pid), n)); createIcons({ icons, root: exRoot }); }
    }
  }, sig);

  // Teclado en el examen: 1-4 eligen opción, flechas navegan.
  document.addEventListener('keydown', (e) => {
    const exRoot = root.querySelector<HTMLElement>('[data-ac-ex]');
    if (!examenActual || !exRoot?.querySelector('.ac-ex__run') || e.altKey || e.ctrlKey || e.metaKey) return;
    if ((e.target as HTMLElement)?.matches?.('input, textarea')) return;
    if (/^[1-4]$/.test(e.key)) exRoot.querySelector<HTMLElement>(`[data-ac-ex-op="${Number(e.key) - 1}"]`)?.click();
    if (e.key === 'ArrowRight') exRoot.querySelector<HTMLButtonElement>('[data-ac-ex-next]:not(:disabled)')?.click();
    if (e.key === 'ArrowLeft') exRoot.querySelector<HTMLButtonElement>('[data-ac-ex-prev]:not(:disabled)')?.click();
  }, sig);

  desmontar = () => { ab.abort(); if ('speechSynthesis' in window && speechSynthesis.speaking) speechSynthesis.cancel(); };
}

export { programasLocales as programasAcademia };
