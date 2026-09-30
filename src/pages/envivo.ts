import { Datos, type Evento } from '../core/datos';
import { cursos } from '../core/catalogo';
import { BRAND } from '../core/brand';
import { esc, tarjetaCurso } from '../ui/partials';

const eventosPublicados = (): Evento[] => Datos.eventos().filter((e) => e.publicado !== false);
const KEY = 'odonteck-club:reservas:v1';
const reservas = (): string[] => {
  if (Datos.modo === 'api') return Datos.eventos().filter((e) => e.reservado === true).map((e) => e.id);
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
};
export const toggleReserva = (id: string) => { const r = reservas(); const i = r.indexOf(id); i >= 0 ? r.splice(i, 1) : r.push(id); localStorage.setItem(KEY, JSON.stringify(r)); };

const fmt = (iso: string) => new Date(iso).toLocaleString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });

export function proximoEvento() { return eventosPublicados().filter((e) => new Date(e.fecha).getTime() > Date.now()).sort((a, b) => a.fecha.localeCompare(b.fecha))[0]; }

export function envivoPanel() {
  const ahora = Date.now();
  const proximos = eventosPublicados().filter((e) => new Date(e.fecha).getTime() > ahora).sort((a, b) => a.fecha.localeCompare(b.fecha));
  const pasados = eventosPublicados().filter((e) => new Date(e.fecha).getTime() <= ahora);
  const r = reservas();
  const prox = proximos[0];

  const heroProx = prox ? `
    <div class="hero" style="min-height:260px;grid-template-columns:1fr">
      <div class="hero__body">
        <span class="hero__kicker"><span class="chip chip--live" style="height:22px">Próxima</span>${fmt(prox.fecha)}</span>
        <h2 class="display display--black" style="font-size:var(--fs-xl)">${esc(prox.titulo)}</h2>
        <p class="hero__lead">Con ${esc(prox.ponente)} · ${prox.duracionMin} min · transmisión en vivo con preguntas al final.</p>
        <div class="hero__actions">
          <button class="btn btn--white btn--lg btn--pill-arrow" data-reservar="${prox.id}">${r.includes(prox.id) ? 'Reservado · te avisamos' : 'Reservar mi lugar'} <span class="arrow" style="background:var(--brand-navy);color:#fff"><i data-lucide="${r.includes(prox.id) ? 'check' : 'bell'}" class="i"></i></span></button>
          ${prox.enlace ? `<a class="btn btn--lg" style="background:rgba(255,255,255,.12);color:#fff" href="${prox.enlace}" target="_blank" rel="noopener">Entrar a la transmisión</a>` : ''}
        </div>
      </div>
    </div>` : `
    <div class="card card--pad" style="text-align:center;padding:48px 24px;display:grid;gap:14px;justify-items:center;border-radius:var(--r-2xl);background:color-mix(in srgb,var(--brand-navy) 5%,var(--surface));border:1px dashed color-mix(in srgb,var(--brand-navy) 20%,var(--line))">
      <span style="width:56px;height:56px;border-radius:16px;background:var(--hero-gradient);color:#fff;display:grid;place-items:center"><i data-lucide="radio" class="i" style="width:24px;height:24px"></i></span>
      <h2 class="display display--black" style="font-size:var(--fs-xl)">Sin clases programadas</h2>
      <p class="muted" style="max-width:46ch;font-size:var(--fs-sm);line-height:1.55">Te avisamos en cuanto haya una nueva transmisión. Los cursos en vivo se anuncian primero en el canal de WhatsApp.</p>
      <a class="btn btn--brand btn--pill-arrow" href="${BRAND.canalWhatsApp}" target="_blank" rel="noopener">Seguir el canal <span class="arrow"><i data-lucide="arrow-up-right" class="i"></i></span></a>
    </div>`;

  return `
    ${heroProx}
    ${proximos.length > 1 ? `<div class="stack" style="gap:10px">${proximos.slice(1).map((e) => `
      <div class="upnext"><div class="upnext__thumb" style="background:var(--hero-gradient);display:grid;place-items:center;color:#fff"><i data-lucide="radio" class="i" style="position:static;filter:none"></i></div>
        <div><span class="eyebrow">${fmt(e.fecha)}</span><div class="upnext__title">${esc(e.titulo)}</div><p class="faint" style="font-size:var(--fs-xs)">${esc(e.ponente)} · ${e.duracionMin} min</p></div>
        <button class="btn btn--sm ${r.includes(e.id) ? 'btn--secondary' : 'btn--brand'}" data-reservar="${e.id}">${r.includes(e.id) ? 'Reservado' : 'Reservar'}</button></div>`).join('')}</div>` : ''}
    <div class="stack" style="gap:14px">
      <span class="eyebrow"><i data-lucide="video" class="i" style="width:14px;height:14px"></i>Grabaciones</span>
      <p class="muted" style="font-size:var(--fs-sm)">Cada curso nació como clase en vivo. Las grabaciones se suben unas semanas después.</p>
      ${pasados.length ? `<div class="stack" style="gap:8px">${pasados.map((e) => `<div class="upnext"><div><span class="eyebrow">${fmt(e.fecha)}</span><div class="upnext__title">${esc(e.titulo)}</div></div>${e.cursoId ? `<a class="btn btn--brand btn--sm" href="#/curso/${e.cursoId}">Ver grabación</a>` : '<span class="chip">Pendiente de subir</span>'}</div>`).join('')}</div>` : ''}
      <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(260px,1fr))">${cursos.slice(0, 4).map(tarjetaCurso).join('')}</div>
    </div>`;
}

export function envivo() {
  return `<section class="stack" style="gap:20px">${envivoPanel()}</section>`;
}
