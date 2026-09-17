import { Progreso } from '../core/progreso';
import { curso as getCurso, type Curso } from '../core/catalogo';
import { Perfil } from '../core/perfil';
import { esc, placeholder } from '../ui/partials';

// Folio determinista provisional. En Fase 2 lo emite el backend y queda en certificados/{folio}.
export function folio(c: Curso) {
  const fecha = Progreso.de(c.id).actualizado || new Date().toISOString();
  let h = 0; for (const ch of c.id + Perfil.get().nombre) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return `ODT-${fecha.slice(0, 4)}-${String(h % 100000).padStart(5, '0')}`;
}
const fechaLarga = (iso: string) => new Date(iso || Date.now()).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });

export function certificados() {
  const listos = Progreso.completados();
  const enMarcha = Progreso.enMarcha();
  return `
  <section class="stack" style="gap:20px">
    <div class="section-head"><div><span class="chip chip--primary">Certificados</span><h1 class="display" style="font-size:var(--fs-2xl)">Tus <em>certificados</em> OdonTeck</h1>
      <p class="muted" style="margin-top:6px">Con folio único y verificación pública. Se emiten al completar todas las clases de un curso.</p></div></div>
    ${listos.length ? `<div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(280px,1fr))">${listos.map((c) => `
      <a class="card card--hover" href="#/certificados/${c.id}" style="overflow:hidden;color:inherit">
        <div style="aspect-ratio:1.414;background:var(--hero-gradient);position:relative;display:grid;place-items:center;color:#fff;padding:20px;text-align:center">
          <img data-logo-cert src="/brand/logo-horizontal-dark.png" alt="" style="position:absolute;top:14px;left:14px;height:18px;width:auto;opacity:.9">
          <div><span class="eyebrow" style="color:rgba(255,255,255,.7)">Certificado</span><div class="display" style="font-size:var(--fs-md);margin-top:6px">${esc(c.titulo)}</div><div class="mono" style="font-size:11px;margin-top:10px;opacity:.8">${folio(c)}</div></div>
        </div>
        <div class="card--pad" style="padding:16px 18px;display:flex;justify-content:space-between;align-items:center"><div><strong style="font-size:var(--fs-sm)">${esc(c.area)}</strong><br><span class="faint" style="font-size:var(--fs-xs)">${fechaLarga(Progreso.de(c.id).actualizado)}</span></div><span class="circle-btn" style="width:36px;height:36px"><i data-lucide="arrow-up-right" class="i" style="width:15px;height:15px"></i></span></div>
      </a>`).join('')}</div>` : `
      <div class="card card--pad" style="display:grid;grid-template-columns:auto 1fr;gap:20px;align-items:center;padding:32px">
        <span class="circle-btn" style="width:64px;height:64px;background:var(--accent-soft);color:var(--accent)"><i data-lucide="award" class="i" style="width:28px;height:28px"></i></span>
        <div><h3>Tu primer certificado está a un curso de distancia</h3><p class="muted">Termina todas las clases de cualquier curso y aparecerá aquí con su folio.</p>
          ${enMarcha[0] ? `<a class="btn btn--brand btn--sm" style="margin-top:10px" href="#/curso/${enMarcha[0].id}">Continuar ${esc(enMarcha[0].titulo.slice(0, 40))}…</a>` : `<a class="btn btn--brand btn--sm" style="margin-top:10px" href="#/cursos">Elegir un curso</a>`}</div>
      </div>`}
    ${enMarcha.length ? `<h3 style="font-size:var(--fs-md)">En camino</h3><div class="stack" style="gap:10px">${enMarcha.map((c) => `<div class="upnext"><div class="upnext__thumb"><img src="${c.portada}" alt=""></div><div><div class="upnext__title">${esc(c.titulo)}</div><div class="lesson-progress" style="margin-top:6px"><div class="progress progress--thin"><span style="width:${Progreso.porcentaje(c)}%"></span></div>${Progreso.porcentaje(c)}%</div></div><a class="circle-btn" href="#/curso/${c.id}/clase/${Progreso.siguiente(c)}"><i data-lucide="play" class="i"></i></a></div>`).join('')}</div>` : ''}
  </section>`;
}

export function certificado(params: Record<string, string>) {
  const c = getCurso(params.id);
  if (!c || !Progreso.completado(c)) return placeholder('Certificado no disponible', 'Este curso todavía no está completado.', 'lock');
  const p = Perfil.get(); const f = folio(c); const fecha = fechaLarga(Progreso.de(c.id).actualizado);
  return `
  <section class="stack" style="gap:20px">
    <div class="row" style="justify-content:space-between">
      <a class="section-head__cta" href="#/certificados"><span class="circle-btn circle-btn--glass" style="width:34px;height:34px"><i data-lucide="arrow-left" class="i" style="width:15px;height:15px"></i></span>Certificados</a>
      <div class="row"><button class="btn btn--secondary" data-imprimir><i data-lucide="printer" class="i"></i>Imprimir / PDF</button><button class="btn btn--brand btn--pill-arrow" data-compartir-cert="${f}">Compartir <span class="arrow"><i data-lucide="share-2" class="i"></i></span></button></div>
    </div>
    <div class="cert" id="cert">
      <div class="cert__inner">
        <img data-logo src="/brand/logo-horizontal.png" alt="OdonTeck" style="height:34px;width:auto">
        <span class="eyebrow" style="margin-top:28px">Certificado de finalización</span>
        <p class="muted" style="margin-top:10px">OdonTeck Consulting Group certifica que</p>
        <h1 class="display display--black" style="font-size:var(--fs-3xl);margin-top:6px">${esc(p.nombre)}</h1>
        <p class="muted" style="margin-top:14px">completó satisfactoriamente el curso</p>
        <h2 class="display" style="font-size:var(--fs-xl);margin-top:6px;max-width:30ch">${esc(c.titulo)}</h2>
        <p class="muted" style="margin-top:8px">${c.clases.length} clases · área de ${esc(c.area)} · emitido el ${fecha}</p>
        <div class="cert__foot">
          <div><div class="cert__firma"></div><strong>Dirección académica</strong><br><span class="faint" style="font-size:var(--fs-xs)">OdonTeck Consulting Group</span></div>
          <div style="text-align:center"><div class="cert__qr"><i data-lucide="qr-code" class="i" style="width:44px;height:44px"></i></div><span class="mono" style="font-size:11px">${f}</span></div>
          <div style="text-align:right"><strong>Verificación</strong><br><span class="faint" style="font-size:var(--fs-xs)">club.odonteckconsulting.com/verificar/${f}</span></div>
        </div>
      </div>
    </div>
    <p class="faint" style="font-size:var(--fs-xs)">Provisional: el folio y el QR definitivos los emite el backend (Fase 2) y quedan registrados para verificación pública. El nombre sale de tu perfil.</p>
  </section>`;
}
