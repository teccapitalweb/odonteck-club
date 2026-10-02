import { createIcons, icons } from 'lucide';
import { mensajeError } from '../core/auth';
import { encuestaPendiente, posponerEncuesta, responderEncuesta, type EncuestaPendiente, type PreguntaEncuesta } from '../core/encuestas';
import { esc } from './partials';

type Toast = (mensaje: string, icono?: string) => void;

function campo(p: PreguntaEncuesta) {
  const nombre = `encuesta-${p.id}`;
  if (p.tipo === 'texto') return `<textarea class="input encuesta__texto" name="${esc(p.id)}" rows="4" maxlength="${p.max || 500}" placeholder="Tu respuesta (opcional)"></textarea>${p.ayuda ? `<small>${esc(p.ayuda)}</small>` : ''}`;
  if (p.tipo === 'escala') {
    const valores = Array.from({ length: (p.max! - p.min!) + 1 }, (_, i) => p.min! + i);
    return `<div class="encuesta__escala">${valores.map((v) => `<label><input type="radio" name="${nombre}" value="${v}" ${p.requerida ? 'required' : ''}><span>${v}</span></label>`).join('')}</div><div class="encuesta__extremos"><span>${esc(p.minEtiqueta || '')}</span><span>${esc(p.maxEtiqueta || '')}</span></div>`;
  }
  const multiple = p.tipo === 'multiple';
  return `<div class="encuesta__opciones" data-multiple-max="${multiple ? p.max || '' : ''}">${(p.opciones || []).map((o) => `<label class="encuesta__opcion"><input type="${multiple ? 'checkbox' : 'radio'}" name="${nombre}" value="${esc(o.valor)}" ${!multiple && p.requerida ? 'required' : ''}><span>${esc(o.etiqueta)}</span></label>`).join('')}</div>${multiple ? `<small>Elige ${p.requerida ? 'al menos una y ' : ''}hasta ${p.max} opciones.</small>` : ''}`;
}

function cerrar(el: HTMLElement) {
  el.remove();
  window.dispatchEvent(new CustomEvent('encuesta:cerrada'));
}

function respuestas(form: HTMLFormElement, encuesta: EncuestaPendiente) {
  const salida: Record<string, unknown> = {};
  for (const p of encuesta.preguntas) {
    const nombre = `encuesta-${p.id}`;
    if (p.tipo === 'multiple') {
      const valores = [...form.querySelectorAll<HTMLInputElement>(`input[name="${nombre}"]:checked`)].map((x) => x.value);
      if (p.requerida && !valores.length) throw new Error(`Responde “${p.texto}”.`);
      if (valores.length > (p.max || Infinity)) throw new Error(`Elige máximo ${p.max} opciones en “${p.texto}”.`);
      if (valores.length) salida[p.id] = valores;
    } else if (p.tipo === 'escala') {
      const v = form.querySelector<HTMLInputElement>(`input[name="${nombre}"]:checked`)?.value;
      if (v !== undefined) salida[p.id] = Number(v);
    } else if (p.tipo === 'opcion') {
      const v = form.querySelector<HTMLInputElement>(`input[name="${nombre}"]:checked`)?.value;
      if (v !== undefined) salida[p.id] = v;
    } else {
      const v = form.elements.namedItem(p.id) as HTMLTextAreaElement | null;
      if (v?.value.trim()) salida[p.id] = v.value.trim();
    }
  }
  return salida;
}

export function mostrarEncuestaPendiente(toast: Toast) {
  const encuesta = encuestaPendiente();
  if (document.querySelector('.encuesta-modal')) return true;
  // La entrevista inicial tiene su propia página (#/bienvenida); aquí sólo van las encuestas ligeras.
  if (!encuesta || encuesta.tipo === 'bienvenida' || document.querySelector('.onb, .paywall')) return false;
  const el = document.createElement('div');
  el.className = 'encuesta-modal';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.setAttribute('aria-labelledby', 'encuesta-titulo');
  el.innerHTML = `<form class="encuesta" data-form-encuesta>
    <div class="encuesta__encabezado">
      <span class="encuesta__icono"><i data-lucide="clipboard-check" class="i"></i></span>
      <div><span class="eyebrow">Encuesta breve · ${encuesta.preguntas.length} preguntas</span><h2 id="encuesta-titulo">${esc(encuesta.titulo)}</h2><p>${esc(encuesta.descripcion)}</p></div>
    </div>
    <div class="encuesta__preguntas">${encuesta.preguntas.map((p, i) => `<fieldset class="encuesta__pregunta"><legend><span>${i + 1}</span>${esc(p.texto)}${p.requerida ? '<sup>*</sup>' : ' <em>opcional</em>'}</legend>${campo(p)}</fieldset>`).join('')}</div>
    <div class="encuesta__privacidad"><i data-lucide="shield-check" class="i"></i><p><strong>Uso responsable de tus respuestas.</strong> Se vinculan a tu cuenta sólo para evitar duplicados y mejorar el club. El panel muestra tendencias y comentarios sin tu nombre ni correo. No incluyas datos de pacientes.</p></div>
    <div class="encuesta__acciones"><button class="btn btn--ghost" type="button" data-posponer-encuesta>Ahora no</button><button class="btn btn--brand btn--lg" type="submit">Enviar respuestas <i data-lucide="send" class="i"></i></button></div>
  </form>`;
  document.body.appendChild(el);
  createIcons({ icons });
  const form = el.querySelector<HTMLFormElement>('form')!;
  form.querySelectorAll<HTMLElement>('[data-multiple-max]').forEach((grupo) => grupo.addEventListener('change', () => {
    const max = Number(grupo.dataset.multipleMax);
    const checks = [...grupo.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')];
    const llenos = checks.filter((x) => x.checked).length >= max;
    checks.forEach((x) => { if (!x.checked) x.disabled = llenos; });
  }));
  el.querySelector('[data-posponer-encuesta]')!.addEventListener('click', async () => {
    const boton = el.querySelector<HTMLButtonElement>('[data-posponer-encuesta]')!; boton.disabled = true;
    try { await posponerEncuesta(encuesta); cerrar(el); toast('Te la recordaremos más adelante', 'clock-3'); }
    catch (e) { boton.disabled = false; toast(mensajeError(e), 'alert-triangle'); }
  });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const boton = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    try {
      const valores = respuestas(form, encuesta);
      boton.disabled = true; boton.innerHTML = '<i data-lucide="loader-circle" class="i spin"></i>Enviando…'; createIcons({ icons });
      await responderEncuesta(encuesta, valores);
      cerrar(el); toast('¡Gracias! Tu respuesta quedó registrada', 'heart');
    } catch (error) {
      boton.disabled = false; boton.innerHTML = 'Enviar respuestas <i data-lucide="send" class="i"></i>'; createIcons({ icons });
      toast(mensajeError(error), 'alert-triangle');
    }
  });
  setTimeout(() => form.querySelector<HTMLInputElement>('input, textarea')?.focus(), 50);
  return true;
}
