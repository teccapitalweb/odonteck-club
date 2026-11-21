// Panel «Métricas»: cohortes, finalización/abandono por clase, quizzes, cupones,
// promotion codes y economía de OdonCoins. Datos precalculados en el servidor.
import { Admin } from '../core/admin';
import { Datos } from '../core/datos';
import { esc } from '../ui/partials';
import { adminHead } from './shell';

const pct = (x: number) => `${Math.round((x ?? 0) * 100)}%`;
const fechaHora = (iso?: string) => (iso ? new Date(iso).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' }) : '—');

export function adminMetricas() {
  if (Datos.modo === 'demo') return adminHead('Métricas', 'Las métricas reales requieren una sesión administrativa conectada.');
  const m = Admin.metricas;
  if (!m) return `${adminHead('Métricas', 'No pudimos cargar las métricas.')}<p role="alert">${esc(Admin.error)}</p><a class="btn btn--brand" href="#/admin/metricas">Volver a cargar</a>`;

  const barra = (x: number) => `<div class="progress"><span style="width:${Math.min(100, Math.round((x ?? 0) * 100))}%"></span></div>`;

  const cohortes = m.retencionCohortes.length
    ? `<table class="dtable"><thead><tr><th>Cohorte</th><th>Altas</th><th>Siguen</th><th>Retención</th></tr></thead><tbody>${m.retencionCohortes.map((c) => `<tr><td>${esc(c.cohorte)}</td><td>${c.base}</td><td>${c.retenidos}</td><td>${pct(c.tasa)}</td></tr>`).join('')}</tbody></table>`
    : '<p class="muted">Sin suscripciones con fecha de alta todavía.</p>';

  const registros = m.registrosPorMes.length
    ? `<div class="bars">${m.registrosPorMes.map((r) => { const max = Math.max(1, ...m.registrosPorMes.map((x) => x.total)); return `<div class="bars__col"><span class="bars__val mono">${r.total}</span><div class="bars__bar" style="height:${(r.total / max) * 100}%"></div><span class="bars__lbl">${esc(r.mes.slice(5))}</span></div>`; }).join('')}</div>`
    : '<p class="muted">Sin registros.</p>';

  const quizPeores = m.quizzes.porClase.slice(0, 8);
  const quizzes = `<p>Aprobación global: <strong>${pct(m.quizzes.global.tasa)}</strong> (${m.quizzes.global.aprobados}/${m.quizzes.global.intentos} intentos).</p>${quizPeores.length ? `<table class="dtable"><thead><tr><th>Clase</th><th>Intentos</th><th>Aprobación</th></tr></thead><tbody>${quizPeores.map((q) => `<tr><td>${esc(q.titulo)} · C${q.n}</td><td>${q.intentos}</td><td>${pct(q.tasa)}</td></tr>`).join('')}</tbody></table>` : ''}`;

  const economia = `<div class="kpis">
    <div class="kpi"><span class="kpi__label">OdonCoins emitidos</span><strong class="kpi__val">${m.economiaOdonCoins.emitidos.toLocaleString('es-MX')}</strong></div>
    <div class="kpi"><span class="kpi__label">Gastados</span><strong class="kpi__val">${m.economiaOdonCoins.gastados.toLocaleString('es-MX')}</strong></div>
    <div class="kpi"><span class="kpi__label">Saldo pendiente</span><strong class="kpi__val">${m.economiaOdonCoins.saldoPendiente.toLocaleString('es-MX')}</strong></div>
  </div>${m.economiaOdonCoins.masCanjeadas.length ? `<h4 class="admin-card-title">Más canjeadas</h4><ol class="stack" style="gap:4px">${m.economiaOdonCoins.masCanjeadas.map((r) => `<li>${esc(r.titulo)} — <strong>${r.canjes}</strong></li>`).join('')}</ol>` : ''}`;

  const promos = m.promosStripe.length
    ? `<table class="dtable"><thead><tr><th>Promo code</th><th>Subs</th><th>Activas</th><th>Descuento/mes</th><th>Neto/mes</th></tr></thead><tbody>${m.promosStripe.map((p) => `<tr><td class="mono">${esc(p.promotionCode)}</td><td>${p.suscripciones}</td><td>${p.activas}</td><td>$${p.descuentoMensualMXN.toLocaleString('es-MX')}</td><td>$${p.netoMensualMXN.toLocaleString('es-MX')}</td></tr>`).join('')}</tbody></table>`
    : '<p class="muted">Ninguna suscripción con promotion code de Stripe. (Se llena cuando lleguen eventos nuevos o tras el backfill.)</p>';

  const cuponesApp = m.cuponesApp.length
    ? `<table class="dtable"><thead><tr><th>Cupón</th><th>Canjes</th><th>Convirtieron</th><th>Tasa</th></tr></thead><tbody>${m.cuponesApp.map((c) => `<tr><td class="mono">${esc(c.codigo)}</td><td>${c.redenciones}</td><td>${c.convertidos}</td><td>${pct(c.tasa)}</td></tr>`).join('')}</tbody></table>`
    : '<p class="muted">Sin canjes de cupones todavía.</p>';

  const clases = m.finalizacionClases.slice(0, 10).map((c) => `<details class="card card--pad"><summary><strong>${esc(c.titulo)}</strong> · ${c.base} iniciaron</summary><table class="dtable"><thead><tr><th>Clase</th><th>Vieron</th><th>Finalización</th><th>Abandono</th></tr></thead><tbody>${c.clases.map((k) => `<tr><td>C${k.n}</td><td>${k.vieron}</td><td>${barra(k.finalizacion)} ${pct(k.finalizacion)}</td><td>${k.abandono === null ? '—' : pct(k.abandono)}</td></tr>`).join('')}</tbody></table></details>`).join('') || '<p class="muted">Sin datos de progreso.</p>';

  const card = (titulo: string, cuerpo: string) => `<section class="card card--pad stack" style="gap:10px"><h3 class="admin-card-title">${titulo}</h3>${cuerpo}</section>`;

  return `${adminHead('Métricas', 'Cohortes, finalización, quizzes, cupones y economía de OdonCoins.')}
  <div class="row" style="justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">
    <span class="faint" style="font-size:var(--fs-xs)">Calculado: ${fechaHora(m.calculadoEn)}${m.cacheado ? ' (en caché)' : ''}${m.aproximado ? ' · registro de usuarios aproximado' : ''}</span>
    <a class="btn btn--secondary btn--sm" href="#/admin/metricas?actualizar=1"><i data-lucide="refresh-cw" class="i"></i>Actualizar ahora</a>
  </div>
  <div class="admin-grid admin-grid--even">
    ${card('Retención por cohorte de alta', cohortes)}
    ${card('Registros de cuenta por mes', registros)}
  </div>
  <div class="admin-grid admin-grid--even">
    ${card('Aprobación de quizzes', quizzes)}
    ${card('Economía de OdonCoins', economia)}
  </div>
  <div class="admin-grid admin-grid--even">
    ${card('Promotion codes de Stripe', promos)}
    ${card('Cupones de la app (días de cortesía)', cuponesApp)}
  </div>
  ${card('Finalización y abandono por clase', clases)}`;
}
