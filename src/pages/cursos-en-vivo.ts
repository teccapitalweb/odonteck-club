// Prototipo local de «Cursos en vivo»: vitrina de cursos de pago que se compran por WhatsApp.
// El club solo promueve e informa; el cobro y la inscripción los confirma el equipo fuera de la plataforma.
import lista from '../data/cursos-en-vivo.json';
import { Auth } from '../core/auth';
import { Datos } from '../core/datos';
import { Perfil } from '../core/perfil';
import { esc, placeholder } from '../ui/partials';

type CursoVivo = (typeof lista)[number];

const WHATSAPP = '522361139827';
const WHATSAPP_VISIBLE = '236 113 9827';
const CLAVE_INSCRITOS = 'odonteck-club:cursos-en-vivo:inscritos';
const INCLUYE = ['Clase en vivo por Google Meet', 'Material de apoyo descargable', 'Constancia digital con QR y folio verificable', 'Grupo de WhatsApp con la ponente'];

export const cursosEnVivoDisponibles = () => Datos.modo === 'demo';

const cursos = () => [...lista].sort((a, b) => a.inicio.localeCompare(b.inicio));
const buscar = (id: string) => lista.find((c) => c.id === id);
const fecha = (iso: string) => new Date(iso).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
const hora = (iso: string) => new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });
const precio = (n: number) => `$${n.toLocaleString('es-MX')} MXN`;
const diasPara = (iso: string) => Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000));
const lugares = (c: CursoVivo) => Math.max(0, c.cupo - c.inscritos);

function inscritos(): string[] {
  try { return JSON.parse(localStorage.getItem(CLAVE_INSCRITOS) || '[]'); } catch { return []; }
}
export function alternarInscripcionDemo(id: string) {
  const actual = inscritos();
  const nuevo = actual.includes(id) ? actual.filter((x) => x !== id) : [...actual, id];
  try { localStorage.setItem(CLAVE_INSCRITOS, JSON.stringify(nuevo)); } catch { /* sin almacenamiento */ }
  return nuevo.includes(id);
}
const estaInscrito = (id: string) => inscritos().includes(id);

function enlaceWhatsApp(c: CursoVivo) {
  const p = Perfil.get();
  const texto = `Hola, quiero inscribirme al curso en vivo «${c.titulo}» (${fecha(c.inicio)}). Soy ${p.nombre}${Auth.usuario?.email ? ` (${Auth.usuario.email})` : ''}. ¿Me comparten los datos para el pago?`;
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`;
}

function etiquetaCupo(c: CursoVivo) {
  const n = lugares(c);
  if (n === 0) return '<span class="cev-chip cev-chip--agotado">Cupo lleno</span>';
  if (n <= 10) return `<span class="cev-chip cev-chip--pocos"><i data-lucide="flame" class="i"></i>Quedan ${n} lugares</span>`;
  return `<span class="cev-chip"><i data-lucide="users" class="i"></i>${n} lugares disponibles</span>`;
}

function tarjeta(c: CursoVivo) {
  const inscrito = estaInscrito(c.id);
  return `
  <article class="cev-card${inscrito ? ' is-inscrito' : ''}">
    <a class="cev-card__flyer" href="#/cursos-en-vivo/${c.id}" aria-label="Ver ${esc(c.titulo)}">
      <img src="${c.flyer}" alt="Flyer del curso ${esc(c.titulo)}" loading="lazy" width="896" height="1200">
      ${inscrito ? '<span class="cev-card__sello"><i data-lucide="badge-check" class="i"></i>Ya eres parte</span>' : `<span class="cev-card__dias">${diasPara(c.inicio) === 0 ? 'Hoy' : `En ${diasPara(c.inicio)} días`}</span>`}
    </a>
    <div class="cev-card__body">
      <span class="eyebrow">${esc(c.area)}</span>
      <h3><a href="#/cursos-en-vivo/${c.id}">${esc(c.titulo)}</a></h3>
      <p class="muted">${esc(c.ponente)}</p>
      <div class="cev-card__meta">
        <span><i data-lucide="calendar-days" class="i"></i>${fecha(c.inicio)}</span>
        <strong>${precio(c.precio)}</strong>
      </div>
      ${etiquetaCupo(c)}
      <div class="cev-card__acciones">
        ${inscrito
          ? `<a class="btn btn--secondary btn--sm" href="#/cursos-en-vivo/${c.id}"><i data-lucide="ticket" class="i"></i>Ver mi acceso</a>`
          : `<a class="btn btn--brand btn--sm" href="${enlaceWhatsApp(c)}" target="_blank" rel="noopener"><i data-lucide="message-circle" class="i"></i>Comprar por WhatsApp</a>
             <a class="btn btn--ghost btn--sm" href="#/cursos-en-vivo/${c.id}">Detalles</a>`}
      </div>
    </div>
  </article>`;
}

export function cursosEnVivo() {
  if (!cursosEnVivoDisponibles()) return placeholder('Muy pronto', 'Los cursos en vivo estarán disponibles próximamente.', 'radio');
  const todos = cursos();
  const misCursos = todos.filter((c) => estaInscrito(c.id));
  return `
  <section class="stack cev" style="gap:28px">
    <div class="cev-hero">
      <div>
        <span class="cev-hero__live"><span></span>Cursos en vivo</span>
        <h1 class="display">Aprende en vivo con <em>especialistas</em></h1>
        <p>Clases por Google Meet con material de apoyo y constancia con folio verificable. Aparta tu lugar por WhatsApp: te compartimos los datos de pago y, al confirmarlo, te damos acceso al grupo del curso.</p>
      </div>
      <ol class="cev-pasos">
        <li><span>1</span><div><strong>Escríbenos</strong><small>Pide informes por WhatsApp</small></div></li>
        <li><span>2</span><div><strong>Realiza tu pago</strong><small>Transferencia o depósito</small></div></li>
        <li><span>3</span><div><strong>Únete al grupo</strong><small>Y recibe tu acceso en el club</small></div></li>
      </ol>
    </div>
    ${misCursos.length ? `
    <div class="cev-mis">
      <h2><i data-lucide="ticket" class="i"></i>Tus cursos en vivo</h2>
      <div class="cev-mis__lista">${misCursos.map((c) => `
        <a href="#/cursos-en-vivo/${c.id}"><img src="${c.flyer}" alt=""><span><strong>${esc(c.titulo)}</strong><small>${fecha(c.inicio)} · ${hora(c.inicio)} h</small></span><i data-lucide="chevron-right" class="i"></i></a>`).join('')}
      </div>
    </div>` : ''}
    <div class="cev-grid">${todos.map(tarjeta).join('')}</div>
    <p class="faint" style="font-size:var(--fs-xs)">Prototipo local: las compras se confirman por WhatsApp y la inscripción la registra el equipo de OdonTeck. Nada de esta sección cobra ni guarda pagos.</p>
  </section>`;
}

export function cursoEnVivo(params: Record<string, string>) {
  if (!cursosEnVivoDisponibles()) return placeholder('Muy pronto', 'Los cursos en vivo estarán disponibles próximamente.', 'radio');
  const c = buscar(params.id);
  if (!c) return placeholder('Curso no encontrado', 'Revisa el enlace o vuelve a la lista de cursos en vivo.', 'radio', '#/cursos-en-vivo', 'Ver cursos en vivo');
  const inscrito = estaInscrito(c.id);
  const calendario = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Curso en vivo OdonTeck: ${c.titulo}`)}&dates=${new Date(c.inicio).toISOString().replace(/[-:]|\.\d{3}/g, '')}/${new Date(new Date(c.inicio).getTime() + 2 * 3_600_000).toISOString().replace(/[-:]|\.\d{3}/g, '')}&details=${encodeURIComponent(`Ponente: ${c.ponente}. Enlace de Google Meet en el grupo del curso.`)}`;
  return `
  <section class="stack cev" style="gap:22px">
    <a class="section-head__cta" href="#/cursos-en-vivo"><span class="circle-btn circle-btn--glass" style="width:34px;height:34px"><i data-lucide="arrow-left" class="i" style="width:15px;height:15px"></i></span>Cursos en vivo</a>
    <div class="cev-detalle">
      <figure class="cev-detalle__flyer"><img src="${c.flyer}" alt="Flyer del curso ${esc(c.titulo)}" width="896" height="1200"></figure>
      <div class="stack" style="gap:18px">
        ${inscrito ? `
        <div class="cev-felicidades" data-cev-felicidades>
          <span class="cev-felicidades__ic"><i data-lucide="party-popper" class="i"></i></span>
          <div>
            <strong>¡Felicidades, ya eres parte de este curso!</strong>
            <p>Tu inscripción está confirmada. Te esperamos el ${fecha(c.inicio)} a las ${hora(c.inicio)} h. El enlace de Google Meet y el material se comparten en el grupo del curso.</p>
            <div class="row" style="gap:8px;flex-wrap:wrap">
              <a class="btn btn--brand btn--sm" href="https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hola, ya estoy inscrito a «${c.titulo}». ¿Me comparten el enlace del grupo?`)}" target="_blank" rel="noopener"><i data-lucide="users" class="i"></i>Unirme al grupo</a>
              <a class="btn btn--secondary btn--sm" href="${calendario}" target="_blank" rel="noopener"><i data-lucide="calendar-plus" class="i"></i>Agregar a mi calendario</a>
            </div>
          </div>
        </div>` : ''}
        <div>
          <span class="cev-hero__live cev-hero__live--claro"><span></span>Curso en vivo · ${esc(c.area)}</span>
          <h1 class="display" style="font-size:var(--fs-2xl);margin-top:10px">${esc(c.titulo)}</h1>
          <p class="muted">${esc(c.subtitulo)}</p>
        </div>
        <dl class="cev-datos">
          <div><dt><i data-lucide="calendar-days" class="i"></i>Inicia</dt><dd>${fecha(c.inicio)} · ${hora(c.inicio)} h</dd></div>
          <div><dt><i data-lucide="video" class="i"></i>Modalidad</dt><dd>En vivo por Google Meet</dd></div>
          <div><dt><i data-lucide="user-round" class="i"></i>Imparte</dt><dd>${esc(c.ponente)}</dd></div>
          <div><dt><i data-lucide="wallet" class="i"></i>Inversión</dt><dd class="cev-precio">${precio(c.precio)}</dd></div>
        </dl>
        ${etiquetaCupo(c)}
        <div class="card card--pad">
          <h3 style="font-size:var(--fs-md)">Incluye</h3>
          <ul class="cev-incluye">${INCLUYE.map((x) => `<li><i data-lucide="check" class="i"></i>${x}</li>`).join('')}</ul>
        </div>
        ${inscrito ? '' : `
        <div class="card card--pad">
          <h3 style="font-size:var(--fs-md)">Cómo inscribirte</h3>
          <ol class="cev-pasos cev-pasos--claro">
            <li><span>1</span><div><strong>Escríbenos por WhatsApp</strong><small>Te enviamos el mensaje ya redactado con tu nombre y el curso.</small></div></li>
            <li><span>2</span><div><strong>Realiza tu pago</strong><small>Te compartimos los datos para transferencia o depósito.</small></div></li>
            <li><span>3</span><div><strong>Confirmamos tu lugar</strong><small>Te agregamos al grupo y tu acceso aparece aquí en el club.</small></div></li>
          </ol>
          <a class="btn btn--brand cev-cta" href="${enlaceWhatsApp(c)}" target="_blank" rel="noopener"><i data-lucide="message-circle" class="i"></i>Comprar por WhatsApp · ${WHATSAPP_VISIBLE}</a>
        </div>`}
        ${Auth.usuario?.esAdmin ? `
        <div class="cev-demo">
          <span><i data-lucide="flask-conical" class="i"></i>Prototipo: en el sistema real, la inscripción la confirma el equipo después del pago.</span>
          <button type="button" class="btn btn--ghost btn--sm" data-cev-simular="${c.id}">${inscrito ? 'Quitar inscripción (demo)' : 'Simular pago confirmado (demo)'}</button>
        </div>` : ''}
      </div>
    </div>
  </section>`;
}
