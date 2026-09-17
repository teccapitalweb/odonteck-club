import { cursos } from '../core/catalogo';
import { Progreso } from '../core/progreso';
import { tarjetaCurso, encabezado, esc } from '../ui/partials';

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
      <span class="hero__kicker"><i data-lucide="sparkles" class="i" style="width:14px;height:14px"></i>${saludo()}, Dra. Ramírez</span>
      <h1 class="display display--black hero__title">Continúa donde <em>te quedaste.</em></h1>
      <p class="hero__lead">${esc(reciente.titulo)} · clase ${n} de ${reciente.clases.length} · ${esc(clase.titulo)}</p>
      <div class="hero__actions">
        <a class="btn btn--white btn--lg btn--pill-arrow" href="#/curso/${reciente.id}/clase/${n}">Reanudar clase <span class="arrow" style="background:var(--brand-navy);color:#fff"><i data-lucide="play" class="i"></i></span></a>
        <a class="btn btn--lg" style="background:rgba(255,255,255,.12);color:#fff;border-color:rgba(255,255,255,.2)" href="#/cursos">Ver mis cursos</a>
      </div>`;
  } else {
    const primero = cursos[0];
    hero = `
      <span class="hero__kicker"><i data-lucide="sparkles" class="i" style="width:14px;height:14px"></i>${saludo()}, Dra. Ramírez · bienvenida al club</span>
      <h1 class="display display--black hero__title">Empieza tu <em>primera clase.</em></h1>
      <p class="hero__lead">${cursos.length} cursos grabados con casos reales de consultorio. Te sugerimos empezar por ${esc(primero.titulo)}.</p>
      <div class="hero__actions">
        <a class="btn btn--white btn--lg btn--pill-arrow" href="#/curso/${primero.id}/clase/1">Ver la primera clase <span class="arrow" style="background:var(--brand-navy);color:#fff"><i data-lucide="play" class="i"></i></span></a>
        <a class="btn btn--lg" style="background:rgba(255,255,255,.12);color:#fff;border-color:rgba(255,255,255,.2)" href="#/cursos">Explorar el catálogo</a>
      </div>`;
  }

  const recomendados = cursos.filter((c) => !Progreso.completado(c) && Progreso.porcentaje(c) === 0)
    .sort((a, b) => (reciente && a.area === reciente.area ? -1 : 0) - (reciente && b.area === reciente.area ? -1 : 0)).slice(0, 4);

  return `
  <section class="stack" style="gap:20px">
    <div class="hero">
      <div class="hero__bg"><img src="/fotos/hero.webp" alt=""></div>
      <div class="hero__body">${hero}
        <div class="hero__stats">
          <div><strong>${general}%</strong><span>progreso general</span></div>
          <div><strong>${enMarcha.length}</strong><span>cursos en marcha</span></div>
          <div><strong>${completados.length}</strong><span>completados</span></div>
          <div><strong>${vistas}</strong><span>clases vistas</span></div>
        </div>
      </div>
      <div class="hero__visual">
        <img class="tooth" src="/fotos/tooth-3d.png" alt="">
        <div class="glass glass--pin" style="top:44px;right:40px;--pin:40px"><span class="ic"><i data-lucide="radio" class="i"></i></span><div>Jueves 19:00<strong>Endodoncia en vivo</strong></div></div>
        <div class="glass glass--pin" style="top:120px;left:36px;--pin:56px"><span class="ic"><i data-lucide="award" class="i"></i></span><div>Al terminar<strong>Certificado con folio</strong></div></div>
        <div class="glass" style="position:absolute;bottom:44px;left:36px"><span class="ic"><i data-lucide="brain" class="i"></i></span><div>Quiz por clase<strong>Refuerza lo aprendido</strong></div></div>
      </div>
    </div>
  </section>

  ${enMarcha.length ? `
  <section class="stack" style="gap:20px">
    ${encabezado('En marcha', 'Tus cursos <em>en progreso</em>', `<a class="section-head__cta" href="#/cursos?tab=marcha">Ver todos <span class="circle-btn"><i data-lucide="arrow-up-right" class="i"></i></span></a>`)}
    <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">${enMarcha.slice(0, 4).map(tarjetaCurso).join('')}</div>
  </section>` : ''}

  <section class="stack" style="gap:20px">
    ${encabezado('Recomendado para ti', reciente ? `Sigue con <em>${esc(reciente.area.toLowerCase())}</em> y más` : 'Empieza por <em>aquí</em>', `<a class="section-head__cta" href="#/cursos">Ver los ${cursos.length} cursos <span class="circle-btn"><i data-lucide="arrow-up-right" class="i"></i></span></a>`)}
    <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">${recomendados.map(tarjetaCurso).join('')}</div>
  </section>`;
}
