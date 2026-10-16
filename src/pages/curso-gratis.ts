// Pantalla independiente «Escoge tu curso gratis»: aparece antes del Club, sin navegación
// de módulos. El curso elegido queda abierto excepto la última clase (regla del servidor).
import { cursos } from '../core/catalogo';
import { Acceso } from '../core/acceso';
import { CursoGratis } from '../core/curso-gratis';
import { encuestaPendiente } from '../core/encuestas';
import { cursosPorIntereses, etiquetaIntereses, interesesDelMiembro } from '../core/recomendaciones';
import type { Curso } from '../core/datos';
import { esc } from '../ui/partials';

const elegibles = () => cursos.filter((c) => c.publicado !== false && c.clases.length >= 2);
const minutos = (c: Curso) => c.clases.reduce((s, k) => s + (k.duracion || 0), 0);
export const duracionCurso = (c: Curso) => { const m = minutos(c); return m >= 60 ? `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60} min` : ''}` : m ? `${m} min` : `${c.clases.length} clases`; };
const normal = (v: string) => v.toLocaleLowerCase('es-MX').normalize('NFD').replace(/[̀-ͯ]/g, '');

function tarjeta(c: Curso, recomendado = false) {
  const texto = normal([c.titulo, c.area, c.instructor, c.descripcion].join(' '));
  return `<article class="cgm-card${recomendado ? ' cgm-card--rec' : ''}" data-cgm-card data-area="${esc(c.area)}" data-texto="${esc(texto)}" data-min="${minutos(c)}" data-clases="${c.clases.length}">
    <button type="button" class="cgm-card__btn" data-cgm-ver="${esc(c.id)}" aria-label="Ver ${esc(c.titulo)}">
      <span class="cgm-card__media"><img src="${esc(c.portada)}" alt="" loading="lazy" decoding="async"><span class="cgm-card__area">${esc(c.area)}</span>${recomendado ? '<span class="cgm-card__rec"><i data-lucide="sparkles" class="i"></i>Para ti</span>' : ''}</span>
      <span class="cgm-card__body">
        <strong>${esc(c.titulo)}</strong>
        <small>${esc(c.instructor)}</small>
        <span class="cgm-card__meta"><span><i data-lucide="play-circle" class="i"></i>${c.clases.length} clases</span><span><i data-lucide="clock-3" class="i"></i>${duracionCurso(c)}</span><span><i data-lucide="signal" class="i"></i>${esc(c.nivel)}</span></span>
        <span class="cgm-card__free"><b>${c.clases.length - 1} de ${c.clases.length}</b> clases gratis</span>
      </span>
      <span class="cgm-card__cta">Ver curso <i data-lucide="arrow-right" class="i"></i></span>
    </button>
  </article>`;
}

/** Panel lateral con el detalle del curso y la confirmación. */
export function detalleCursoGratis(c: Curso, cambio: boolean) {
  const ultima = Math.max(...c.clases.map((k) => k.n));
  const aprendes = (c.aprenderas ?? []).slice(0, 4);
  return `<div class="cgm-drawer__cover"><img src="${esc(c.banner || c.portada)}" alt=""><button type="button" class="cgm-drawer__x" data-cgm-cerrar aria-label="Cerrar"><i data-lucide="x" class="i"></i></button><div><span class="cgm-pill"><i data-lucide="sparkles" class="i"></i>${esc(c.area)} · ${esc(c.nivel)}</span><h2>${esc(c.titulo)}</h2><p>${esc(c.instructor)}</p></div></div>
    <div class="cgm-drawer__body">
      <div class="cgm-drawer__stats"><span><strong>${c.clases.length - 1}</strong><small>clases gratis</small></span><span><strong>${duracionCurso(c)}</strong><small>de contenido</small></span><span><strong>1</strong><small>clase final VIP</small></span></div>
      <p class="cgm-drawer__desc">${esc(c.descripcion)}</p>
      ${aprendes.length ? `<h3>Lo que vas a aprender</h3><ul class="cgm-drawer__learn">${aprendes.map((x) => `<li><i data-lucide="check-circle-2" class="i"></i>${esc(x)}</li>`).join('')}</ul>` : ''}
      <h3>Temario</h3>
      <ol class="cgm-drawer__temario">${c.clases.map((k) => `<li class="${k.n === ultima ? 'is-vip' : ''}"><span>${k.n === ultima ? '<i data-lucide="crown" class="i"></i>' : k.n}</span><div><b>${esc(k.titulo)}</b><small>${k.n === ultima ? 'Clase final · incluida en VIP' : `${k.duracion ? `${k.duracion} min · ` : ''}Gratis`}</small></div>${k.n === ultima ? '<i data-lucide="lock" class="i cgm-lock"></i>' : '<i data-lucide="unlock" class="i cgm-unlock"></i>'}</li>`).join('')}</ol>
    </div>
    <footer class="cgm-drawer__foot">
      <p><i data-lucide="info" class="i"></i>${cambio ? 'Este es tu único cambio. Después, tu curso gratis queda definido.' : 'Tu elección es definitiva. Solo puedes cambiarla una vez en las próximas 24 horas, si no has avanzado más de una clase.'}</p>
      <button type="button" class="btn btn--brand btn--lg" data-cgm-elegir="${esc(c.id)}"><i data-lucide="gift" class="i"></i>${cambio ? 'Cambiar a este curso' : 'Elegir como mi curso gratis'}</button>
    </footer>`;
}

export function cursoGratisPagina(_: Record<string, string>, query: URLSearchParams) {
  const lista = elegibles();
  const vip = Acceso.vip();
  const estado = CursoGratis.estado();
  const elegido = estado?.cursoId ? lista.find((c) => c.id === estado.cursoId) ?? cursos.find((c) => c.id === estado.cursoId) : null;
  const puedeElegir = !vip && (!elegido || !!estado?.puedeCambiar);
  const intereses = interesesDelMiembro();
  const recomendados = puedeElegir ? cursosPorIntereses(intereses, 3).filter((c) => c.clases.length >= 2 && c.id !== elegido?.id) : [];
  const areas = [...new Set(lista.map((c) => c.area))];
  const mosaico = [...lista, ...lista].slice(0, 16);
  const preseleccion = query.get('curso') || '';
  const requerido = !vip && !elegido;
  const faltaEntrevista = encuestaPendiente()?.tipo === 'bienvenida';
  const accionSuperior = requerido
    ? `<button type="button" class="cgm-screen__logout" data-salir aria-label="Cerrar sesión"><i data-lucide="log-out" class="i"></i><span>Cerrar sesión</span></button>`
    : `<div class="cgm-screen__actions"><a class="cgm-screen__enter" href="${faltaEntrevista ? '#/bienvenida' : '#/'}" aria-label="${faltaEntrevista ? 'Continuar bienvenida' : 'Entrar al Club'}"><span>${faltaEntrevista ? 'Continuar bienvenida' : 'Entrar al Club'}</span><i data-lucide="arrow-right" class="i"></i></a><button type="button" class="cgm-screen__logout" data-salir aria-label="Cerrar sesión"><i data-lucide="log-out" class="i"></i></button></div>`;

  const heroCopy = vip
    ? `<span class="cgm-pill"><i data-lucide="crown" class="i"></i>Miembro VIP</span><h1>Ya tienes <em>todos los cursos</em> abiertos.</h1><p>Como VIP no necesitas elegir: aprovecha el catálogo completo, la biblioteca y los retos.</p><div class="cgm-hero__actions"><a class="btn btn--white btn--lg" href="#/cursos"><i data-lucide="graduation-cap" class="i"></i>Ir al catálogo</a></div>`
    : elegido
      ? `<span class="cgm-pill"><i data-lucide="badge-check" class="i"></i>Elección confirmada</span><h1>Tu curso gratis<br><em>ya está listo.</em></h1><p><b class="cgm-hero__course">${esc(elegido.titulo)}</b>${elegido.clases.length - 1} clases gratis para aprender a tu ritmo. La clase final y el certificado se abren con VIP.${estado?.puedeCambiar ? ' Todavía puedes cambiarlo una vez.' : ''}</p><div class="cgm-hero__actions"><a class="btn btn--white btn--lg btn--pill-arrow" href="#/curso/${esc(elegido.id)}">Continuar mi curso <span class="arrow"><i data-lucide="play" class="i"></i></span></a>${estado?.puedeCambiar ? '<a class="cgm-link" href="#cgm-explorar">Ver otros cursos</a>' : '<a class="cgm-link" href="#/suscripcion">Abrir todos con VIP</a>'}</div>`
      : `<span class="cgm-pill"><i data-lucide="gift" class="i"></i>Un regalo para empezar</span><span class="cgm-required"><i data-lucide="lock-keyhole" class="i"></i>Tu primer paso en OdonTeck</span><h1>Escoge tu<br><em>curso gratis.</em></h1><p>Elige el tema que más te inspire y empieza hoy: todas sus clases menos la final, sin tarjeta y a tu propio ritmo.</p><div class="cgm-hero__actions"><a class="btn btn--white btn--lg btn--pill-arrow" href="#cgm-explorar" data-cgm-scroll>Descubrir mi curso <span class="arrow"><i data-lucide="arrow-down" class="i"></i></span></a><a class="cgm-link" href="#cgm-como" data-cgm-scroll>Ver qué incluye</a></div>`;

  return `<div class="cgm-screen${requerido ? ' is-required' : ' is-complete'}">
    <header class="cgm-screen__topbar">
      <a class="cgm-screen__brand" href="#/curso-gratis" aria-label="OdonTeck"><img data-logo src="/brand/logo-horizontal.png" alt="OdonTeck"></a>
      <div class="cgm-screen__status"><span>Tu bienvenida personalizada</span><strong>${requerido ? 'Paso 1 de 3 · Elige tu curso' : faltaEntrevista ? 'Paso 2 de 3 · Cuéntanos sobre ti' : 'Bienvenida completa'}</strong></div>
      ${accionSuperior}
    </header>
    <nav class="cgm-screen__journey" aria-label="Progreso de bienvenida">
      <span class="${requerido ? 'is-active' : 'is-done'}" ${requerido ? 'aria-current="step"' : ''}><i data-lucide="${requerido ? 'gift' : 'check'}" class="i"></i><b>1</b><em>Elegir tu curso</em></span>
      <span class="${requerido ? '' : faltaEntrevista ? 'is-active' : 'is-done'}" ${!requerido && faltaEntrevista ? 'aria-current="step"' : ''}><i data-lucide="${!requerido && !faltaEntrevista ? 'check' : 'user-round'}" class="i"></i><b>2</b><em>Conocerte</em></span>
      <span class="${!requerido && !faltaEntrevista ? 'is-active' : ''}" ${!requerido && !faltaEntrevista ? 'aria-current="step"' : ''}><i data-lucide="layout-dashboard" class="i"></i><b>3</b><em>Entrar al Club</em></span>
    </nav>
    <main class="cgm-screen__content">
    <section class="cgm" data-cgm data-preseleccion="${esc(preseleccion)}" data-cambio="${elegido && estado?.puedeCambiar ? '1' : ''}">
    <header class="cgm-hero">
      <div class="cgm-hero__glow" aria-hidden="true"><i></i><i></i></div>
      <div class="cgm-hero__mosaic" aria-hidden="true">${[0, 1].map((fila) => `<div class="cgm-hero__row cgm-hero__row--${fila}">${[...mosaico, ...mosaico].map((c) => `<img src="${esc(c.portada)}" alt="" loading="lazy">`).join('')}</div>`).join('')}</div>
      <div class="cgm-hero__copy">${heroCopy}</div>
      <div class="cgm-hero__facts">
        <span><strong>${lista.length}</strong><small>cursos para elegir</small></span>
        <span><strong>${areas.length}</strong><small>especialidades</small></span>
        <span><strong>100%</strong><small>en línea, a tu ritmo</small></span>
      </div>
    </header>

    <section class="cgm-assurance" id="cgm-como" aria-label="Qué incluye tu curso gratis">
      <div class="cgm-assurance__lead"><span class="eyebrow">Una elección simple</span><strong>Elige hoy. Aprende a tu ritmo.</strong></div>
      <div><i data-lucide="credit-card" class="i"></i><span><b>Sin tarjeta</b><small>No pedimos datos de pago</small></span></div>
      <div><i data-lucide="badge-check" class="i"></i><span><b>Clases y quizzes</b><small>Tu avance queda guardado</small></span></div>
      <div><i data-lucide="refresh-cw" class="i"></i><span><b>Elección protegida</b><small>Un cambio durante 24 horas</small></span></div>
    </section>

    ${recomendados.length ? `<section class="cgm-recs"><div class="cgm-head cgm-head--editorial"><span class="eyebrow">Selección OdonTeck · Para ti</span><h2>Empieza por lo que más conecta contigo.</h2><p>Elegimos estas opciones según tu perfil: ${esc(etiquetaIntereses(intereses).toLowerCase())}.</p></div><div class="cgm-grid cgm-grid--recs">${recomendados.map((c) => tarjeta(c, true)).join('')}</div></section>` : ''}

    ${vip ? '' : `<section class="cgm-explorar" id="cgm-explorar">
      <div class="cgm-head cgm-head--editorial"><span class="eyebrow">${puedeElegir ? 'Todas las opciones' : 'Catálogo'}</span><h2>${puedeElegir ? 'Encuentra el curso que es para ti.' : 'Explora lo que sigue.'}</h2><p>${puedeElegir ? `${lista.length} cursos y ${areas.length} especialidades. Elige uno; los demás se abren con VIP.` : 'Tu curso gratis ya está definido. Con VIP tienes acceso a todo el catálogo.'}</p></div>
      <div class="cgm-toolbar">
        <label class="cgm-search"><i data-lucide="search" class="i"></i><input type="search" placeholder="Busca por tema, especialidad o ponente" data-cgm-buscar aria-label="Buscar cursos"></label>
        <div class="cgm-areas" role="tablist" aria-label="Filtrar por especialidad"><button type="button" class="is-active" data-cgm-area="">Todas</button>${areas.map((a) => `<button type="button" data-cgm-area="${esc(a)}">${esc(a)}</button>`).join('')}</div>
        <label class="cgm-orden"><span>Ordenar</span><select data-cgm-orden><option value="">Destacados</option><option value="corto">Más cortos</option><option value="largo">Más completos</option></select></label>
      </div>
      <div class="cgm-grid cgm-grid--collapsed" data-cgm-grid>${lista.map((c) => tarjeta(c)).join('')}</div>
      <p class="cgm-vacio" data-cgm-vacio hidden><i data-lucide="search-x" class="i"></i>No encontramos cursos con ese filtro.</p>
      <button type="button" class="cgm-more" data-cgm-expand><span>Ver los ${lista.length} cursos</span><i data-lucide="chevron-down" class="i"></i></button>
    </section>`}

    <footer class="cgm-note"><i data-lucide="shield-check" class="i"></i><p><strong>Tu elección queda vinculada a tu cuenta.</strong><span>Puedes cambiar una vez durante las primeras 24 horas si aún no avanzaste más de una clase.</span></p>${requerido ? '<span class="cgm-note__secure"><i data-lucide="lock-keyhole" class="i"></i>Paso necesario</span>' : '<a href="#/suscripcion">Conocer VIP <i data-lucide="arrow-up-right" class="i"></i></a>'}</footer>

      <aside class="cgm-drawer" data-cgm-drawer aria-hidden="true"><div class="cgm-drawer__panel" role="dialog" aria-modal="true" aria-label="Detalle del curso" data-cgm-panel></div></aside>
    </section>
    </main>
  </div>`;
}
