import { Datos } from '../core/datos';
import { Recompensas, type Recompensa } from '../core/recompensas';
import { esc } from '../ui/partials';

const niveles = [
  { nombre: 'Aprendiz', min: 0, siguiente: 200 },
  { nombre: 'Explorador clínico', min: 200, siguiente: 600 },
  { nombre: 'Especialista', min: 600, siguiente: 1400 },
  { nombre: 'Mentor OdonTeck', min: 1400, siguiente: 3000 },
  { nombre: 'Maestro', min: 3000, siguiente: 6000 },
];

const fecha = (valor: string) => {
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? '' : new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short' }).format(d);
};

function tarjeta(r: Recompensa, saldo: number) {
  const entregada = r.canjeada || r.incluidaVip;
  const pendiente = r.estatus === 'pendiente';
  const estado = r.disponible === false ? 'Próximamente' : r.incluidaVip ? 'Incluido en VIP' : pendiente ? 'En validación' : r.canjeada ? 'Canjeado' : `${r.puntos.toLocaleString('es-MX')} pts`;
  const accion = r.disponible === false
    ? '<button class="btn btn--secondary" disabled><i data-lucide="clock-3" class="i"></i>Próximamente</button>'
    : entregada
    ? r.materialId
      ? `<a class="btn btn--secondary" href="#/materiales/${r.materialId}"><i data-lucide="book-open" class="i"></i>Abrir en biblioteca</a>`
      : `<span class="reward-status"><i data-lucide="clock-3" class="i"></i>${pendiente ? 'El equipo confirmará la activación' : 'Solicitud registrada'}</span>`
    : `<button class="btn btn--brand" data-canjear-recompensa="${r.id}" ${saldo < r.puntos ? 'disabled' : ''}><i data-lucide="${saldo < r.puntos ? 'lock-keyhole' : 'sparkles'}" class="i"></i>${saldo < r.puntos ? `Te faltan ${(r.puntos - saldo).toLocaleString('es-MX')}` : 'Canjear ahora'}</button>`;
  return `<article class="reward-card ${entregada ? 'is-earned' : ''}">
    <div class="reward-card__top"><span class="reward-card__icon"><i data-lucide="${r.icono}" class="i"></i></span><span class="chip ${entregada ? 'chip--accent' : 'chip--outline'}">${estado}</span></div>
    <div><span class="eyebrow">${r.tipo === 'material' ? 'Recurso permanente' : 'Beneficio especial'}</span><h3>${esc(r.titulo)}</h3><p>${esc(r.descripcion)}</p></div>
    <div class="reward-card__foot">${accion}</div>
  </article>`;
}

export function paginaRecompensas() {
  const resumen = Recompensas.resumen();
  if (!resumen) return `<section class="rewards-loading card card--pad"><i data-lucide="loader-circle" class="i spin"></i><p>Preparando tus recompensas…</p></section>`;
  const nivel = [...niveles].reverse().find((n) => resumen.ganados >= n.min) || niveles[0];
  const pct = Math.min(100, Math.round(((resumen.ganados - nivel.min) / Math.max(1, nivel.siguiente - nivel.min)) * 100));
  const ganado = resumen.logros.filter((l) => l.logrado).length;
  const actividades = [
    ['play-circle', 'Completar una clase', '+10', 'Una sola vez por clase'],
    ['graduation-cap', 'Terminar un curso', '+50', 'Además de tus clases'],
    ['brain', 'Aprobar una evaluación', '+20', 'Una vez por evaluación'],
    ['gamepad-2', 'Resolver un reto', '+2 a +10', 'Primer intento del día'],
    ['clipboard-check', 'Responder una encuesta', '+20 a +40', 'Tu opinión también cuenta'],
    ['messages-square', 'Aportar a Comunidad', '+5 a +10', 'Tema o respuesta útil'],
    ['gem', 'Activar membresía', '+300', 'Al confirmar el pago'],
  ];
  return `<section class="rewards-page stack">
    <header class="rewards-hero">
      <div class="rewards-hero__copy">
        <span class="rewards-kicker"><i data-lucide="sparkles" class="i"></i>Club de recompensas ${Datos.modo === 'demo' ? '· vista demo' : ''}</span>
        <h1 class="display">Tu aprendizaje ahora también <em>abre puertas.</em></h1>
        <p>Aprende, practica y participa. OdonTeck registra cada avance válido y lo convierte en beneficios que sí puedes usar.</p>
        <div class="rewards-hero__stats">
          <div><strong>${resumen.saldo.toLocaleString('es-MX')}</strong><span>puntos disponibles</span></div>
          <div><strong>${resumen.ganados.toLocaleString('es-MX')}</strong><span>ganados en total</span></div>
          <div><strong>${ganado}/${resumen.logros.length}</strong><span>logros alcanzados</span></div>
        </div>
      </div>
      <div class="rewards-wallet">
        <div class="rewards-wallet__shine"></div>
        <div class="rewards-wallet__head"><span>ODONTECK CLUB</span><i data-lucide="waves" class="i"></i></div>
        <div class="rewards-wallet__balance"><span>Saldo</span><strong>${resumen.saldo.toLocaleString('es-MX')} <small>pts</small></strong></div>
        <div class="rewards-wallet__level"><div><strong>${nivel.nombre}</strong><span>${Math.max(0, nivel.siguiente - resumen.ganados).toLocaleString('es-MX')} pts para el siguiente nivel</span></div><span>${pct}%</span></div>
        <div class="progress"><span style="width:${pct}%"></span></div>
      </div>
    </header>

    <div class="rewards-heading"><div><span class="eyebrow">Usa tus puntos</span><h2 class="display">Beneficios que acompañan tu práctica</h2></div><p>Los materiales se desbloquean al instante. Praxia se registra como solicitud y se activa después de la confirmación del equipo.</p></div>
    <div class="rewards-grid">${resumen.recompensas.map((r) => tarjeta(r, resumen.saldo)).join('')}</div>

    <div class="rewards-columns">
      <section class="card reward-panel">
        <div class="reward-panel__head"><div><span class="eyebrow">Suma puntos</span><h2>Todo avance cuenta</h2></div><span class="reward-safe"><i data-lucide="shield-check" class="i"></i>Sin duplicados</span></div>
        <div class="earn-list">${actividades.map(([icono, titulo, puntos, nota]) => `<div class="earn-item"><span><i data-lucide="${icono}" class="i"></i></span><div><strong>${titulo}</strong><small>${nota}</small></div><b>${puntos}</b></div>`).join('')}</div>
        <p class="reward-note"><i data-lucide="info" class="i"></i>Repetir o recargar una actividad ya registrada no suma otra vez. Así tus puntos conservan valor.</p>
      </section>
      <section class="card reward-panel">
        <div class="reward-panel__head"><div><span class="eyebrow">Actividad reciente</span><h2>Tu historial</h2></div><span class="chip chip--outline">${resumen.movimientos.length}</span></div>
        <div class="reward-history">${resumen.movimientos.length ? resumen.movimientos.slice(0, 7).map((m) => `<div><span class="reward-history__icon"><i data-lucide="${m.puntos >= 0 ? 'plus' : 'minus'}" class="i"></i></span><p><strong>${esc(m.detalle || 'Actividad OdonTeck')}</strong><small>${fecha(m.fecha)}</small></p><b class="${m.puntos >= 0 ? 'is-plus' : ''}">${m.puntos >= 0 ? '+' : ''}${m.puntos}</b></div>`).join('') : '<div class="reward-empty"><i data-lucide="route" class="i"></i><p>Tu próxima actividad aparecerá aquí.</p></div>'}</div>
      </section>
    </div>
  </section>`;
}
