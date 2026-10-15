// Panel admin · Academia: revisión editorial de módulos.
// El estado efectivo (lo que ven los miembros) es la revisión guardada desde aquí; si no existe,
// cuenta el "estado" escrito en el JSON. Solo "aprobado" se publica.
import { createIcons, icons } from 'lucide';
import { adminHead } from './shell';
import { cargarRevisionAcademia, revisarModulo, type EstadoRevision, type ProgramaRevision } from '../core/academia';
import { mensajeError } from '../core/auth';
import { Datos } from '../core/datos';
import { esc } from '../ui/partials';

const ic = (n: string) => `<i data-lucide="${n}" class="i" aria-hidden="true"></i>`;
const ETIQUETA: Record<string, string> = { borrador: 'Borrador', revision: 'En revisión', aprobado: 'Aprobado' };
const CHIP: Record<string, string> = { borrador: 'chip--outline', revision: 'chip--primary', aprobado: 'chip--accent' };
const fecha = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }) : '');

export async function adminAcademia() {
  let programas: ProgramaRevision[];
  try { programas = await cargarRevisionAcademia(); }
  catch (e) { return `${adminHead('Academia', 'Revisión editorial de módulos')}<div class="card card--pad">${esc(mensajeError(e))}</div>`; }
  const filas = programas.flatMap((p) => p.modulos.map((m) => ({ p, m })));
  const escritos = filas.filter((f) => f.m.existe).length;
  const aprobados = filas.filter((f) => f.m.estado === 'aprobado').length;
  const enRevision = filas.filter((f) => f.m.estado === 'revision').length;
  return `${adminHead('Academia', 'Revisa cada módulo antes de publicarlo. Solo los aprobados los ven los miembros.')}
  <section class="ac-admin" data-ac-admin>
    <div class="grid grid--4">
      <div class="card card--pad"><span class="eyebrow">Módulos en catálogo</span><div class="display" style="font-size:var(--fs-xl)">${filas.length}</div></div>
      <div class="card card--pad"><span class="eyebrow">Escritos</span><div class="display" style="font-size:var(--fs-xl)">${escritos}</div></div>
      <div class="card card--pad"><span class="eyebrow">En revisión</span><div class="display" style="font-size:var(--fs-xl)">${enRevision}</div></div>
      <div class="card card--pad"><span class="eyebrow">Publicados</span><div class="display" style="font-size:var(--fs-xl)">${aprobados}</div></div>
    </div>
    ${Datos.modo === 'demo' ? `<p class="faint" style="font-size:var(--fs-xs)">${ic('flask-conical')} Demo: las decisiones se guardan en este navegador y no publican nada.</p>` : ''}
    ${programas.map((p) => `
    <details class="card ac-admin__prog" ${p.modulos.some((m) => m.existe) ? 'open' : ''}>
      <summary><span><strong>${p.numero ? `${String(p.numero).padStart(2, '0')} · ` : ''}${esc(p.titulo)}</strong><small class="faint">${esc(p.area)} · ${p.modulos.filter((m) => m.existe).length} de ${p.modulos.length} escritos · ${p.modulos.filter((m) => m.estado === 'aprobado').length} aprobados</small></span>${ic('chevron-down')}</summary>
      <div class="dtable-wrap ac-admin__tabla" tabindex="0">
        <table class="dtable">
          <thead><tr><th scope="col">Módulo</th><th scope="col">Estado</th><th scope="col">Contenido</th><th scope="col">Nota de revisión</th><th scope="col">Acciones</th></tr></thead>
          <tbody>${p.modulos.map((m) => `
            <tr data-ac-fila="${esc(p.id)}|${m.n}">
              <th scope="row"><span class="mono faint">${String(m.n).padStart(2, '0')}</span> ${esc(m.titulo)}</th>
              <td>${m.existe ? `<span class="chip ${CHIP[m.estado || 'borrador'] || ''}">${ETIQUETA[m.estado || 'borrador'] || esc(m.estado || '')}</span>${m.revision ? `<small class="faint ac-admin__meta">Revisado ${fecha(m.revision.fecha)}${m.estadoJson !== m.estado ? ` · JSON: ${esc(m.estadoJson || '')}` : ''}</small>` : ''}` : '<span class="faint">Sin escribir</span>'}</td>
              <td>${m.existe ? `<small>${m.temas} temas · ${m.palabras.toLocaleString('es-MX')} palabras · ${m.figuras} imágenes · ${m.preguntas} preguntas</small>` : ''}</td>
              <td>${m.existe ? `<input class="input ac-admin__nota" data-ac-nota maxlength="300" placeholder="Observaciones (opcional)" value="${esc(m.revision?.nota || '')}" aria-label="Nota de revisión del módulo ${m.n}">` : ''}</td>
              <td>${m.existe ? `<div class="row ac-admin__acciones">
                <a class="btn btn--ghost btn--sm" href="#/academia/${encodeURIComponent(p.id)}/${m.n}" target="_blank" rel="noopener">${ic('eye')}Vista previa</a>
                ${m.estado !== 'aprobado' ? `<button type="button" class="btn btn--brand btn--sm" data-ac-revisar="aprobado">${ic('badge-check')}Aprobar</button>` : ''}
                ${m.estado !== 'revision' ? `<button type="button" class="btn btn--secondary btn--sm" data-ac-revisar="revision">${ic('message-square-text')}En revisión</button>` : ''}
                ${m.estado !== 'borrador' ? `<button type="button" class="btn btn--danger btn--sm" data-ac-revisar="borrador">${ic('undo-2')}A borrador</button>` : ''}
              </div>` : ''}</td>
            </tr>`).join('')}</tbody>
        </table>
      </div>
    </details>`).join('')}
  </section>`;
}

let abortar: AbortController | null = null;
export function montarAdminAcademia(toast: (msg: string, icon?: string) => void, repintar: () => void) {
  abortar?.abort(); abortar = null;
  const root = document.querySelector<HTMLElement>('[data-ac-admin]');
  if (!root) return;
  abortar = new AbortController();
  root.addEventListener('click', async (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-ac-revisar]');
    if (!b) return;
    const fila = b.closest<HTMLElement>('[data-ac-fila]')!;
    const [p, n] = fila.dataset.acFila!.split('|');
    const estado = b.dataset.acRevisar as EstadoRevision;
    const nota = fila.querySelector<HTMLInputElement>('[data-ac-nota]')?.value.trim() || '';
    if (estado === 'aprobado' && !confirm('¿Publicar este módulo para los miembros? Confirma que un profesional revisó su contenido clínico.')) return;
    fila.querySelectorAll('button').forEach((x) => (x.disabled = true));
    try {
      await revisarModulo(p, Number(n), estado, nota);
      toast(estado === 'aprobado' ? 'Módulo aprobado y publicado' : estado === 'revision' ? 'Módulo marcado en revisión' : 'Módulo devuelto a borrador', 'check');
      repintar();
    } catch (err) {
      fila.querySelectorAll('button').forEach((x) => (x.disabled = false));
      toast(mensajeError(err), 'alert-triangle');
    }
  }, { signal: abortar.signal });
  createIcons({ icons, root });
}
