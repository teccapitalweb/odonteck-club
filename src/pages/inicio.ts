import { CursoGratis } from '../core/curso-gratis';
import { Acceso } from '../core/acceso';
import { cursos } from '../core/catalogo';
import { Progreso } from '../core/progreso';
import { tarjetaCurso, encabezado, esc } from '../ui/partials';
import { Perfil } from '../core/perfil';
import { BRAND } from '../core/brand';
import { proximoEvento } from './envivo';
import { racha, puntos } from '../core/logros';
import { Comunidad } from '../core/comunidad';
import { cursosPorIntereses, etiquetaIntereses, interesesDelMiembro } from '../core/recomendaciones';
import { Recompensas } from '../core/recompensas';
import { Auth } from '../core/auth';

const PRAXIA_REWARDS = new Set(['praxia-bienvenida-30-dias', 'praxia-regalo-privado-30-dias']);
const praxiaDeferKey = () => `odonteck-club:praxia-code-deferred-until:${Auth.usuario?.uid || 'anon'}`;

function bienvenidaPraxia() {
  const resumen = Recompensas.resumen();
  const yaCanjeada = resumen?.canjes?.some((canje) => PRAXIA_REWARDS.has(canje.recompensaId))
    || resumen?.recompensas.some((recompensa) => PRAXIA_REWARDS.has(recompensa.id) && recompensa.canjeada);
  let pospuesta = false;
  try { pospuesta = Number(localStorage.getItem(praxiaDeferKey()) || '0') > Date.now(); } catch {}
  if (yaCanjeada || pospuesta) return '';

  return `
  <section class="praxia-code-gate" role="dialog" aria-modal="true" aria-labelledby="praxia-code-title" aria-describedby="praxia-code-description" data-praxia-code-gate>
    <div class="praxia-code-gate__backdrop" aria-hidden="true"></div>
    <div class="praxia-code-gate__card">
      <div class="praxia-code-gate__seal" aria-hidden="true"><i data-lucide="sparkles" class="i"></i></div>
      <span class="praxia-code-gate__eyebrow">Beneficio de bienvenida</span>
      <h2 id="praxia-code-title">Activa tu mes gratis de Praxia</h2>
      <p id="praxia-code-description">Si recibiste un código de OdonTeck, escríbelo aquí para registrarlo desde tu cuenta.</p>
      <label class="praxia-code-gate__label" for="praxia-welcome-code">Código de acceso</label>
      <input id="praxia-welcome-code" class="praxia-code-gate__input" data-praxia-code-input autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="Ej. ODON-XXXX-XXXX" aria-describedby="praxia-code-help" />
      <p id="praxia-code-help" class="praxia-code-gate__help">Al completarlo, te mostraremos tu código de seguimiento y quedará guardado en tus recompensas.</p>
      <p class="praxia-code-gate__error" data-praxia-code-error role="alert" hidden></p>
      <button type="button" class="btn btn--brand praxia-code-gate__submit" data-praxia-code-claim><i data-lucide="gift" class="i"></i>Activar mi mes gratis</button>
      <button type="button" class="praxia-code-gate__defer" data-praxia-code-defer>No tengo un código ahora</button>
      <small>Si lo pospones, volveremos a mostrártelo en 7 días.</small>
    </div>
  </section>`;
}

function widgets() {
  const ev = proximoEvento();
  const r = racha();
  const completados = Progreso.completados().length;
  const fmt = (iso: string) => new Date(iso).toLocaleString('es-MX', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  return `
  <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:16px">
    <div class="widget widget--live">
      <span class="eyebrow"><i data-lucide="radio" class="i"></i>Próxima clase en vivo</span>
      ${ev ? `<div class="widget__title">${esc(ev.titulo)}</div><p style="font-size:var(--fs-sm);opacity:.85">${fmt(ev.fecha)} · ${esc(ev.ponente)}</p><a class="btn btn--sm" href="#/en-vivo"><i data-lucide="bell" class="i"></i>Reservar mi lugar</a>`
           : `<div class="widget__title">Sin clases programadas</div><p style="font-size:var(--fs-sm);opacity:.85">Te avisamos cuando haya nuevas transmisiones en vivo.</p><a class="btn btn--sm" href="${BRAND.canalWhatsApp}" target="_blank" rel="noopener"><i data-lucide="bell" class="i"></i>Avisarme por WhatsApp</a>`}
    </div>
    <div class="widget widget--wa">
      <span class="eyebrow"><i data-lucide="message-circle" class="i"></i>Comunidad OdonTeck</span>
      <div class="widget__title">Comunidad dental</div>
      <p class="muted" style="font-size:var(--fs-sm)">Conecta con colegas y comparte casos clínicos.</p>
      <a class="btn btn--sm" href="${BRAND.canalWhatsApp}" target="_blank" rel="noopener"><i data-lucide="message-circle" class="i"></i>Abrir grupo</a>
    </div>
    <div class="widget">
      <span class="eyebrow"><i data-lucide="brain" class="i"></i>Praxia Medical</span>
      <div class="widget__title">Tu asistente clínico dental</div>
      <p class="muted" style="font-size:var(--fs-sm)">Consulta protocolos, fármacos y casos clínicos al instante desde tu cuenta OdonTeck.</p>
      <a class="btn btn--sm btn--brand" href="#/praxia"><i data-lucide="sparkles" class="i"></i>Probar Praxia</a>
    </div>
    <div class="widget">
      <span class="eyebrow"><i data-lucide="activity" class="i"></i>Tu actividad</span>
      <div class="widget__row"><span style="min-width:96px">Cursos</span><div class="progress progress--thin"><span style="width:${Math.round((completados / cursos.length) * 100)}%"></span></div><span class="mono">${completados}/${cursos.length}</span></div>
      <div class="widget__row"><span style="min-width:96px">Clases</span><div class="progress progress--thin"><span style="width:${Math.round((Progreso.totalVistas() / cursos.reduce((a, c) => a + c.clases.length, 0)) * 100)}%"></span></div><span class="mono">${Progreso.totalVistas()}</span></div>
      <div class="widget__row"><span style="min-width:96px">Racha</span><div class="progress progress--thin"><span style="width:${Math.min(100, r.semanas * 12)}%"></span></div><span class="mono">${r.semanas} sem</span></div>
      <div class="widget__row"><span style="min-width:96px">Comunidad</span><div class="progress progress--thin"><span style="width:${Math.min(100, Comunidad.misHilos().length * 25)}%"></span></div><span class="mono">${Comunidad.misHilos().length}</span></div>
      <a class="btn btn--sm btn--secondary" href="#/logros"><i data-lucide="flame" class="i"></i>${puntos()} puntos · ver logros</a>
    </div>
  </div>`;
}

function saludo() {
  const h = new Date().getHours();
  return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches';
}

export function inicio() {
  const reciente = Progreso.reciente();
  const enMarcha = Progreso.enMarcha();
  const completados = Progreso.completados();
  const vistas = Progreso.totalVistas();
  const totalClases = cursos.reduce((a, c) => a + c.clases.length, 0);
  const general = Math.round((vistas / totalClases) * 100);

  let hero: string;
  if (reciente) {
    const n = Progreso.siguiente(reciente);
    const clase = reciente.clases.find((k) => k.n === n)!;
    hero = `
      <div class="home-resume__copy">
        <span class="home-resume__kicker"><i data-lucide="sparkles" class="i"></i>${saludo()}, ${esc(Perfil.tratamiento())}</span>
        <div><span class="eyebrow">Continúa aprendiendo</span><h1>${esc(reciente.titulo)}</h1><p>Clase ${n} de ${reciente.clases.length} · ${esc(clase.titulo)}</p></div>
        <div class="home-resume__actions"><a class="btn btn--white btn--pill-arrow" href="#/curso/${reciente.id}/clase/${n}">Reanudar clase <span class="arrow"><i data-lucide="play" class="i"></i></span></a><a href="#/cursos">Ver mis cursos <i data-lucide="arrow-right" class="i"></i></a></div>
      </div>`;
  } else if (!Acceso.vip() && !CursoGratis.id()) {
    hero = `
      <div class="home-resume__copy">
        <span class="home-resume__kicker"><i data-lucide="gift" class="i"></i>${saludo()}, ${esc(Perfil.tratamiento())}</span>
        <div><span class="eyebrow">Regalo de bienvenida</span><h1>Escoge tu curso gratis</h1><p>Elige cualquiera de los ${cursos.length} cursos y tenlo completo, menos la clase final.</p></div>
        <div class="home-resume__actions"><button class="btn btn--white btn--pill-arrow" data-curso-gratis-abrir>Elegir mi curso <span class="arrow"><i data-lucide="gift" class="i"></i></span></button><a href="#/cursos">Explorar catálogo <i data-lucide="arrow-right" class="i"></i></a></div>
      </div>`;
  } else {
    const elegido = !Acceso.vip() ? cursos.find((x) => x.id === CursoGratis.id()) : null;
    const primero = elegido ?? cursos[0];
    hero = `
      <div class="home-resume__copy">
        <span class="home-resume__kicker"><i data-lucide="sparkles" class="i"></i>${saludo()}, ${esc(Perfil.tratamiento())}</span>
        <div><span class="eyebrow">${elegido ? 'Tu curso gratis' : 'Tu primer paso'}</span><h1>${esc(primero.titulo)}</h1><p>${elegido ? `${primero.clases.length - 1} clases gratis para empezar hoy.` : `${cursos.length} cursos grabados con casos reales de consultorio.`}</p></div>
        <div class="home-resume__actions"><a class="btn btn--white btn--pill-arrow" href="#/curso/${primero.id}">${elegido ? 'Empezar mi curso' : 'Empezar'} <span class="arrow"><i data-lucide="play" class="i"></i></span></a><a href="#/cursos">Explorar catálogo <i data-lucide="arrow-right" class="i"></i></a></div>
      </div>`;
  }

  // Primero lo que dijo en la entrevista inicial; si no la contestó (o ya agotó esas áreas), lo cercano a lo que estudia.
  const intereses = interesesDelMiembro();
  const sinEmpezar = (c: typeof cursos[number]) => !Progreso.completado(c) && Progreso.porcentaje(c) === 0;
  const porIntereses = cursosPorIntereses(intereses, 4, { excluir: (c) => !sinEmpezar(c) });
  const relleno = cursos.filter((c) => sinEmpezar(c) && !porIntereses.includes(c))
    .sort((a, b) => (reciente && a.area === reciente.area ? -1 : 0) - (reciente && b.area === reciente.area ? -1 : 0));
  const recomendados = [...porIntereses, ...relleno].slice(0, 4);
  const tituloRecs = porIntereses.length ? `Según tus intereses: <em>${esc(etiquetaIntereses(intereses).toLowerCase())}</em>` : reciente ? `Sigue con <em>${esc(reciente.area.toLowerCase())}</em> y más` : 'Empieza por <em>aquí</em>';

  return `
  <section class="home-top stack" style="gap:20px">
    <div class="home-resume">
      <div class="home-resume__texture" aria-hidden="true"></div>
      ${hero}
      <aside class="home-resume__summary">
        <div class="home-resume__progress"><span>Progreso general</span><strong>${general}%</strong><div><i style="width:${general}%"></i></div></div>
        <div class="home-resume__metrics"><span><strong>${enMarcha.length}</strong>en marcha</span><span><strong>${completados.length}</strong>completados</span><span><strong>${vistas}</strong>clases vistas</span></div>
        <div class="home-resume__links"><a href="#/comunidad?tab=en-vivo"><i data-lucide="radio" class="i"></i><span>Clases en vivo<small>${proximoEvento() ? 'Próxima sesión disponible' : 'Consulta el calendario'}</small></span><i data-lucide="chevron-right" class="i"></i></a><a href="#/certificados"><i data-lucide="award" class="i"></i><span>Certificados<small>Consulta tus folios</small></span><i data-lucide="chevron-right" class="i"></i></a></div>
      </aside>
    </div>
    ${widgets()}
  </section>

  ${enMarcha.length ? `
  <section class="stack" style="gap:20px">
    ${encabezado('En marcha', 'Tus cursos <em>en progreso</em>', `<a class="section-head__cta" href="#/cursos?tab=marcha">Ver todos <span class="circle-btn"><i data-lucide="arrow-up-right" class="i"></i></span></a>`)}
    <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr))">${enMarcha.slice(0, 4).map(tarjetaCurso).join('')}</div>
  </section>` : ''}

  <section class="stack" style="gap:20px">
    ${encabezado('Recomendado para ti', tituloRecs, `<a class="section-head__cta" href="${porIntereses.length ? '#/cursos?tab=para-ti' : '#/cursos'}">Ver los ${cursos.length} cursos <span class="circle-btn"><i data-lucide="arrow-up-right" class="i"></i></span></a>`)}
    <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr))">${recomendados.map(tarjetaCurso).join('')}</div>
  </section>
  ${bienvenidaPraxia()}`;
}
