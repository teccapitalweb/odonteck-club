// Diálogo de confirmación reutilizable (reemplaza confirm() nativo).
// Devuelve una promesa que resuelve true si el usuario confirma y false si cancela.
import { createIcons, icons } from 'lucide';
import { esc } from './partials';

export interface OpcionesConfirmar {
  recibirMotivo?: (motivo: string) => void;
  titulo: string;
  mensaje?: string;
  confirmar?: string;
  cancelar?: string;
  peligro?: boolean;
  icono?: string;
}

export function confirmar(op: OpcionesConfirmar): Promise<boolean> {
  return new Promise((resolve) => {
    document.querySelector('.dialogo')?.remove();
    const el = document.createElement('div');
    el.className = 'dialogo';
    el.innerHTML = `
      <div class="dialogo__box" role="alertdialog" aria-modal="true" aria-labelledby="dlg-titulo" ${op.mensaje ? 'aria-describedby="dlg-msg"' : ''}>
        <span class="dialogo__ic ${op.peligro ? 'dialogo__ic--danger' : ''}"><i data-lucide="${op.icono || (op.peligro ? 'alert-triangle' : 'help-circle')}" class="i"></i></span>
        <h3 id="dlg-titulo">${esc(op.titulo)}</h3>
        ${op.mensaje ? `<p id="dlg-msg">${esc(op.mensaje)}</p>` : ''}
        ${op.recibirMotivo ? '<label class="field" style="text-align:left">Motivo del cambio<textarea class="input" data-dlg-motivo required minlength="3" maxlength="500" placeholder="Explica brevemente por qué haces este cambio. No incluyas códigos ni datos sensibles."></textarea></label>' : ''}
        <div class="dialogo__cta">
          <button class="btn btn--secondary" data-dlg-cancelar>${esc(op.cancelar || 'Cancelar')}</button>
          <button class="btn ${op.peligro ? 'btn--danger' : 'btn--brand'}" data-dlg-ok>${esc(op.confirmar || 'Confirmar')}</button>
        </div>
      </div>`;
    document.body.appendChild(el);
    createIcons({ icons });

    const focoPrevio = document.activeElement as HTMLElement | null;
    const botones = [...el.querySelectorAll<HTMLElement>('textarea,button')];
    // En acciones destructivas el foco inicial va a Cancelar para evitar confirmaciones accidentales.
    (op.peligro ? el.querySelector<HTMLButtonElement>('[data-dlg-cancelar]') : el.querySelector<HTMLButtonElement>('[data-dlg-ok]'))?.focus();

    let resuelto = false;
    const cerrar = (valor: boolean) => {
      if (resuelto) return;
      resuelto = true;
      document.removeEventListener('keydown', onKey, true);
      el.remove();
      focoPrevio?.focus?.();
      resolve(valor);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); cerrar(false); return; }
      if (e.key !== 'Tab' || !botones.length) return;
      const primero = botones[0];
      const ultimo = botones[botones.length - 1];
      if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
      else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
    };
    document.addEventListener('keydown', onKey, true);
    el.addEventListener('click', (e) => { if (e.target === el) cerrar(false); });
    el.querySelector('[data-dlg-cancelar]')!.addEventListener('click', () => cerrar(false));
    el.querySelector('[data-dlg-ok]')!.addEventListener('click', () => {
      const motivo = el.querySelector<HTMLTextAreaElement>('[data-dlg-motivo]');
      if (motivo) {
        motivo.setCustomValidity(motivo.value.trim().length < 3 ? 'Escribe un motivo de al menos 3 caracteres.' : '');
        if (!motivo.reportValidity()) return;
        op.recibirMotivo?.(motivo.value.trim());
      }
      cerrar(true);
    });
  });
}
