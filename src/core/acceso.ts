// Regla de oro (freemium). Un solo lugar decide qué es gratis y qué pide VIP.
// Demo: gratis por defecto; "Activar VIP (demo)" simula la membresía para explorar.
// API: usa el esVip real del backend (que además lo valida del lado servidor).
import { createIcons, icons } from 'lucide';
import { Auth } from './auth';
import { Datos, type Material } from './datos';
import { CursoGratis } from './curso-gratis';
import type { Curso } from './catalogo';

export const VIP_SIM = 'odonteck-club:vip-sim';

export const Acceso = {
  vip(): boolean { return !!Auth.usuario?.esVip; },
  demo(): boolean { return Datos.modo === 'demo'; },
  activarVipDemo() { try { localStorage.setItem(VIP_SIM, '1'); } catch {} },
  quitarVipDemo() { try { localStorage.removeItem(VIP_SIM); } catch {} },

  // «Escoge tu curso gratis»: el curso que eligió el miembro, completo menos su última clase.
  // En modo API el servidor aplica exactamente la misma regla a los videos.
  cursoGratis(curso: Curso): boolean { return !!curso && CursoGratis.id() === curso.id; },
  claseLibre(curso: Curso, n: number): boolean {
    if (!this.cursoGratis(curso)) return false;
    const numeros = curso.clases.map((k) => k.n).sort((a, b) => a - b);
    return numeros.length > 1 && numeros.includes(n) && n !== numeros[numeros.length - 1];
  },
  claseAccesible(curso: Curso, n: number) { return this.vip() || this.claseLibre(curso, n); },

  // Materiales: el recurso gratuito se declara explícitamente en el catálogo.
  materialLibre(m: Material): boolean { return m.gratis === true; },
  materialAccesible(m: Material) { return this.vip() || this.materialLibre(m) || m.desbloqueadoConPuntos === true; },

  // Comunidad: ver es gratis, interactuar es VIP
  puedeComunidad(): boolean { return this.vip(); },
};

// ── Modal de paywall reutilizable ──
export function mostrarPaywall(texto = 'Este contenido es exclusivo para miembros VIP.') {
  if (document.querySelector('.paywall')) return;
  const demo = Acceso.demo();
  const el = document.createElement('div');
  el.className = 'paywall';
  el.innerHTML = `
    <div class="paywall__box">
      <button class="paywall__x" aria-label="Cerrar"><i data-lucide="x" class="i"></i></button>
      <span class="paywall__ic"><i data-lucide="crown" class="i"></i></span>
      <h3>Contenido VIP</h3>
      <p>${texto}</p>
      <div class="paywall__cta">
        <button class="btn btn--brand btn--lg" data-vip>${demo ? 'Activar VIP (demo)' : 'Hazte VIP'}</button>
        <a class="btn btn--secondary" href="#/suscripcion" data-cerrar>Ver planes</a>
      </div>
      ${demo ? '<p class="paywall__nota">En el demo, "Activar VIP" desbloquea todo para que explores.</p>' : ''}
    </div>`;
  document.body.appendChild(el);
  createIcons({ icons });
  const cerrar = () => el.remove();
  el.querySelector('.paywall__x')!.addEventListener('click', cerrar);
  el.addEventListener('click', (e) => { if (e.target === el) cerrar(); });
  el.querySelector('[data-cerrar]')!.addEventListener('click', cerrar);
  el.querySelector('[data-vip]')!.addEventListener('click', () => {
    if (demo) { Acceso.activarVipDemo(); location.reload(); }
    else { location.hash = '#/suscripcion'; cerrar(); }
  });
}
