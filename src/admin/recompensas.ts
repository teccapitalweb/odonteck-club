import { Admin } from '../core/admin';
import { Datos } from '../core/datos';
import { esc } from '../ui/partials';
import { adminHead } from './shell';

export function adminRecompensas(
  _: Record<string, string>,
  query: URLSearchParams,
) {
  const data = Admin.recompensas;
  if (Datos.modo === 'demo')
    return adminHead(
      'OdonCoins y recompensas',
      'La administración de precios, existencias y entregas requiere una sesión administrativa real.',
    );
  if (!data)
    return `${adminHead('OdonCoins y recompensas', 'No pudimos cargar el catálogo.')}<p role="alert">${esc(Admin.error)}</p><a class="btn btn--brand" href="#/admin/recompensas">Volver a cargar</a>`;
  const q = query.get('q') || '',
    vista = query.get('vista') === 'canjes' ? 'canjes' : 'catalogo';
  const items = data.catalogo.filter((r) =>
    `${r.titulo} ${r.categoria} ${r.id}`
      .toLowerCase()
      .includes(q.toLowerCase()),
  );
  const canjes = data.canjes.filter((c) =>
    `${c.titulo} ${c.uid} ${c.estatus}`.toLowerCase().includes(q.toLowerCase()),
  );
  const catalogo = items
    .map(
      (r) =>
        `<details class="reward-admin-item"><summary><span><strong>${esc(r.titulo)}</strong><small>${esc(r.categoria || 'Beneficios')} · ${esc(r.tipo)}</small></span><span>${r.puntos} OC · ${esc(r.estado || 'proximamente')}</span></summary><form data-form="recompensa-config" data-id="${esc(r.id)}" class="reward-admin-form"><label>Título<input class="input" name="titulo" value="${esc(r.titulo)}" required maxlength="100"></label><label>Precio en OC<input class="input" name="puntos" type="number" min="1" max="100000" value="${r.puntos}" required></label><label class="reward-admin-wide">Descripción<textarea class="input" name="descripcion" maxlength="600" required>${esc(r.descripcion)}</textarea></label><label>Estado<select class="input" name="estado">${[
          ['disponible', 'Disponible'],
          ['proximamente', 'Próximamente'],
          ['pausada', 'Pausada'],
        ]
          .map(
            ([v, t]) =>
              `<option value="${v}" ${r.estado === v ? 'selected' : ''}>${t}</option>`,
          )
          .join(
            '',
          )}</select></label>${r.tipo === 'manual' ? `<label>Cupos o existencias disponibles<input class="input" name="cupo" type="number" min="0" max="100000" value="${r.cupo ?? ''}" placeholder="Necesario para nuevas recompensas"></label><label class="reward-admin-wide">Plazo de entrega<input class="input" name="plazo" maxlength="120" value="${esc(r.plazo || '')}" placeholder="Ej. dentro de 5 días hábiles tras coordinar la fecha"></label><label class="reward-admin-wide">Instrucciones internas y responsable<textarea class="input" name="instrucciones" maxlength="1000" placeholder="Quién entrega, qué entrega y cómo se coordina">${esc(r.instrucciones || '')}</textarea></label>${r.requiereRevision ? `<label class="reward-admin-wide reward-affordable"><input name="revisionProfesional" type="checkbox" ${r.revisionProfesional ? 'checked' : ''}>Confirmo que el contenido fue revisado por un profesional competente.</label>` : ''}<p class="reward-admin-wide muted">Publica solo si puedes cumplir esta entrega. Al canjear se reserva una existencia; cancelar devuelve los OC y la existencia.</p>` : ''}<button class="btn btn--brand">Guardar configuración</button><small class="muted">Los cambios de precio se aplican a nuevos canjes.</small></form></details>`,
    )
    .join('');
  const solicitudes = canjes
    .map(
      (c) =>
        `<article class="card reward-panel"><div class="reward-request"><div><strong>${esc(c.titulo)}</strong><small>${esc(c.solicitado)} · ${c.puntos} OC</small><a href="#/admin/miembros/${encodeURIComponent(c.uid)}">Ver miembro</a></div><span class="chip">${esc(c.estatus)}</span></div>${c.nota ? `<p>${esc(c.nota)}</p>` : ''}${c.tipo === 'manual' && c.estatus === 'pendiente' ? `<form data-form="recompensa-resolver" data-id="${esc(c.id)}" class="stack"><label>Nota visible para el miembro<textarea class="input" name="nota" required maxlength="500" placeholder="Describe la entrega o el motivo de cancelación. Sin datos sensibles."></textarea></label><div class="row"><button name="estatus" value="entregado" class="btn btn--brand">Confirmar entrega</button><button name="estatus" value="cancelado" class="btn btn--secondary">Cancelar y devolver ${c.puntos} OC</button></div></form>` : ''}</article>`,
    )
    .join('');
  return `${adminHead('OdonCoins y recompensas', `${data.catalogo.length} recompensas · saldo y canjes validados por el servidor`)}<nav class="reward-tabs"><a class="${vista === 'catalogo' ? 'is-active' : ''}" href="#/admin/recompensas">Catálogo y precios</a><a class="${vista === 'canjes' ? 'is-active' : ''}" href="#/admin/recompensas?vista=canjes">Entregas y devoluciones</a></nav><form class="reward-filters" data-form="recompensa-buscar"><input name="vista" value="${vista}" type="hidden"><label>Buscar<input class="input" name="q" value="${esc(q)}" placeholder="Título, categoría o miembro"></label><button class="btn btn--secondary">Buscar</button></form>${vista === 'catalogo' ? `<div class="stack">${catalogo || '<p>No hay coincidencias.</p>'}</div><details class="card reward-panel"><summary>Agregar una nueva recompensa con entrega coordinada</summary><form data-form="recompensa-nueva" class="reward-admin-form"><label>Identificador único<input class="input" name="id" required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxlength="100" placeholder="asesoria-portafolio-junio"></label><label>Título<input class="input" name="titulo" required maxlength="100"></label><label>Precio en OC<input class="input" type="number" name="puntos" min="1" max="100000" value="500" required></label><label class="reward-admin-wide">Descripción<textarea class="input" name="descripcion" required maxlength="600"></textarea></label><p class="muted reward-admin-wide">Se crea como Próximamente. Después podrás definir cupos, responsable y plazo para habilitarla.</p><button class="btn btn--brand">Crear recompensa</button></form></details>` : `<p class="muted">Últimos ${data.limiteCanjes} canjes. Las devoluciones se registran una sola vez y no modifican el total ganado.</p><div class="stack">${solicitudes || '<p>No hay canjes con este filtro.</p>'}</div>`}`;
}
