// Tour de bienvenida para nuevos miembros. Rápido (6 pasos), bonito y saltable.
// Se recuerda por cuenta en el servidor y se puede reabrir con el botón de ayuda.
import { createIcons, icons } from 'lucide';
import { api, Auth } from '../core/auth';
import { Datos } from '../core/datos';
import { Perfil } from '../core/perfil';
import { CursoGratis } from '../core/curso-gratis';
import { encuestaRespondida } from '../core/encuestas';
import { Progreso } from '../core/progreso';

export const ONBOARDING_KEY = 'odonteck-club:bienvenida-vista';

interface Paso { icon: string; color: string; titulo: string; texto: string }
const PASOS: Paso[] = [
  { icon: 'party-popper', color: '#4a7fc1', titulo: '¡Bienvenida a OdonTeck Club!',
    texto: 'Tu formación odontológica en un solo lugar: cursos, biblioteca, clases en vivo, comunidad y retos. Te damos un recorrido de 30 segundos.' },
  { icon: 'graduation-cap', color: '#4fa899', titulo: 'Cursos a tu ritmo',
    texto: 'Cursos grabados por especialistas, con quiz por clase y avance guiado. Escoge un curso gratis: lo tienes completo excepto la clase final. Con VIP se abren todos.' },
  { icon: 'library', color: '#c98a5b', titulo: 'Biblioteca clínica',
    texto: 'Guías, formatos, atlas y libros para consultar cuando los necesites. Un vistazo rápido a todo tu material de apoyo.' },
  { icon: 'gamepad-2', color: '#7c5cbf', titulo: 'Retos: aprende jugando',
    texto: 'Quiz Relámpago contra reloj, Detective Dental (diagnostica casos), Flashcards de repaso y niveles con XP. El contenido sale de tus cursos.' },
  { icon: 'messages-square', color: '#e0a341', titulo: 'Comunidad y En vivo',
    texto: 'Comparte casos y dudas con otros colegas, y cada mes hay clases en vivo con especialistas (con descuento para miembros).' },
  { icon: 'crown', color: '#20254b', titulo: 'Certifícate y hazte VIP',
    texto: 'Al terminar cada curso obtienes un certificado con folio verificable. Hazte VIP para desbloquear todos los cursos, la biblioteca y los retos.' },
];

let i = 0;
const guardando = new Set<string>();
function recordarRecorrido(uid: string) {
  try { localStorage.setItem(`${ONBOARDING_KEY}:${uid}`, '1'); } catch {}
  if (Datos.modo !== 'api' || Perfil.get().recorridoVisto || guardando.has(uid)) return;
  guardando.add(uid);
  void api('/me/recorrido-visto', { method: 'POST' }).then(() => {
    if (Auth.usuario?.uid === uid) Perfil.set({ recorridoVisto: true });
  }).catch(() => { /* La marca local permite reintentar sin volver a interrumpir. */ }).finally(() => guardando.delete(uid));
}

export function mostrarOnboarding(forzar = false) {
  const uid = Auth.usuario?.uid;
  if (!uid || (Datos.modo === 'api' && !Auth.perfilResuelto())) return;
  let vistoLocal = false;
  try { vistoLocal = localStorage.getItem(`${ONBOARDING_KEY}:${uid}`) === '1'; } catch {}
  // Una elección o actividad ya guardada también identifica a quien vuelve desde otro dispositivo.
  const yaEmpezo = !!CursoGratis.id() || encuestaRespondida('bienvenida') || Progreso.totalVistas() > 0;
  if (!forzar && (vistoLocal || Perfil.get().recorridoVisto || yaEmpezo)) { recordarRecorrido(uid); return; }
  if (document.querySelector('.onb')) return;
  recordarRecorrido(uid);
  i = 0;
  const el = document.createElement('div');
  el.className = 'onb';
  document.body.appendChild(el);
  const cerrar = () => el.remove();
  el.addEventListener('click', (e) => { if (e.target === el) cerrar(); });
  pinta(el, cerrar);
}

function pinta(el: HTMLElement, cerrar: () => void) {
  const p = PASOS[i];
  const ultimo = i === PASOS.length - 1;
  el.innerHTML = `
    <div class="onb__card">
      <button class="onb__x" aria-label="Cerrar"><i data-lucide="x" class="i"></i></button>
      <div class="onb__head" style="--c:${p.color}">
        <span class="onb__ic"><i data-lucide="${p.icon}" class="i"></i></span>
      </div>
      <div class="onb__body">
        <span class="eyebrow">Paso ${i + 1} de ${PASOS.length}</span>
        <h2>${p.titulo}</h2>
        <p>${p.texto}</p>
        <div class="onb__dots">${PASOS.map((_, j) => `<span class="${j === i ? 'on' : ''}"></span>`).join('')}</div>
        <div class="onb__nav">
          ${i > 0 ? `<button class="btn btn--secondary" data-prev><i data-lucide="arrow-left" class="i"></i>Atrás</button>` : `<button class="btn btn--ghost" data-skip>Saltar</button>`}
          <button class="btn btn--brand btn--lg" data-next>${ultimo ? '¡Empezar!' : 'Siguiente'} <i data-lucide="${ultimo ? 'check' : 'arrow-right'}" class="i"></i></button>
        </div>
      </div>
    </div>`;
  createIcons({ icons });
  el.querySelector('.onb__x')!.addEventListener('click', cerrar);
  el.querySelector('[data-skip]')?.addEventListener('click', cerrar);
  el.querySelector('[data-prev]')?.addEventListener('click', () => { i--; pinta(el, cerrar); });
  el.querySelector('[data-next]')!.addEventListener('click', () => { if (ultimo) cerrar(); else { i++; pinta(el, cerrar); } });
}
