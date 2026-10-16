import { mensajeError } from '../core/auth';
import { cargarEncuestas, encuestaPendientePorTipo, perfilEncuesta, posponerEncuesta, responderEncuesta } from '../core/encuestas';
import { cursosPorIntereses } from '../core/recomendaciones';
import { navigate, render } from '../core/router';
import { esc } from '../ui/partials';

type Toast = (mensaje: string, icono?: string) => void;

const ICONOS: Record<string, string> = {
  problema:'search-check', jornada:'calendar-range', detalle:'scan-search', resultado:'sparkles',
  pacientes:'heart-handshake', fortalezas:'gem', aprender:'brain-circuit', proyecto:'telescope',
};
const MOTIVOS: Record<string, string> = {
  diagnostico:'Te atrae observar, integrar señales y construir hipótesis clínicas.', ortodoncia:'Disfrutas planear cambios progresivos y seguir su evolución.',
  endodoncia:'Conectas con la precisión técnica y la resolución de dolor.', restauradora:'Te motiva recuperar estructura, detalle y función.',
  estetica:'Notas proporción, armonía y resultados visuales.', cirugia:'Te atraen la acción, los procedimientos y las decisiones concretas.',
  periodoncia:'Valoras tejidos, prevención y seguimiento a largo plazo.', pediatria:'Destaca tu interés por comunicar, acompañar y guiar el desarrollo.',
  rehabilitacion:'Piensas en función integral, planificación y estabilidad.', medicina_bucal:'Te interesan los casos complejos, la evidencia y el diagnóstico diferencial.',
};

function reporte() {
  const resultado = perfilEncuesta()?.brujula;
  if (!resultado) return '';
  const cursos = cursosPorIntereses(resultado.areas.map((a) => a.id), 3);
  return `<section class="br-result" aria-labelledby="br-titulo">
    <header class="br-result__hero">
      <span class="br-kicker"><i data-lucide="compass" class="i"></i> Tu brújula profesional</span>
      <h1 id="br-titulo" class="display">Una ruta para explorar,<br><em>no una etiqueta.</em></h1>
      <p>Tus respuestas sugieren estas afinidades. Úsalas para probar contenidos, comparar experiencias y descubrir qué disfrutas en la práctica.</p>
      <div class="br-result__styles">${resultado.estilos.map((e) => `<span><i data-lucide="check" class="i"></i>${esc(e.etiqueta)}</span>`).join('')}</div>
    </header>
    <div class="br-result__grid">
      ${resultado.areas.map((a, i) => `<article class="br-affinity" style="--orden:${i}">
        <div class="br-affinity__top"><span>0${i + 1}</span><i data-lucide="${['route','focus','sparkles'][i]}" class="i"></i></div>
        <h2>${esc(a.etiqueta)}</h2><p>${esc(MOTIVOS[a.id] || 'Hay señales consistentes para explorar esta área con más profundidad.')}</p>
        <div class="br-affinity__meter" aria-label="Intensidad relativa ${a.afinidad || 0} de 100"><span style="width:${a.afinidad || 0}%"></span></div>
        <small>Señal relativa ${a.afinidad || 0}/100</small>
      </article>`).join('')}
    </div>
    ${cursos.length ? `<section class="br-courses"><div><span class="br-kicker">Siguiente exploración</span><h2 class="display">Convierte una afinidad en tu siguiente curso</h2><p>Revisa estas sugerencias para decidir qué área explorar después de tu curso de bienvenida.</p></div><div class="br-courses__list">${cursos.map((c) => `<a href="#/curso/${encodeURIComponent(c.id)}"><img src="${esc(c.portada)}" alt=""><span><small>${esc(c.area)} · ${esc(c.nivel)}</small><strong>${esc(c.titulo)}</strong></span><i data-lucide="arrow-up-right" class="i"></i></a>`).join('')}</div></section>` : ''}
    <aside class="br-note"><i data-lucide="shield-check" class="i"></i><p><strong>Orientación responsable.</strong> Este resultado no mide aptitud, no sustituye orientación académica y no determina una especialidad. Tus intereses pueden cambiar con la experiencia.</p></aside>
  </section>`;
}

export function brujula() {
  const hecha = reporte();
  if (hecha) return hecha;
  const encuesta = encuestaPendientePorTipo('brujula');
  if (!encuesta) {
    const entrevistaLista = !!perfilEncuesta();
    return `<section class="br-empty"><i data-lucide="compass" class="i"></i><h1 class="display">Tu Brújula se está preparando</h1><p>${entrevistaLista ? 'La dejaste para después. Volverá a estar disponible en unos días para que la contestes con calma.' : 'Primero completa la entrevista inicial para que podamos darte una orientación más personal.'}</p><a class="btn btn--brand" href="${entrevistaLista ? '#/' : '#/bienvenida'}">${entrevistaLista ? 'Volver al inicio' : 'Completar entrevista'}</a></section>`;
  }
  return `<section class="br-page">
    <header class="br-hero">
      <div class="br-hero__copy"><span class="br-kicker"><i data-lucide="compass" class="i"></i> Brújula profesional</span><h1 class="display">Descubre qué tipo de trabajo clínico <em>te mueve.</em></h1><p>Ocho situaciones breves para reconocer afinidades, fortalezas y maneras de aprender. No es un examen y no hay respuestas “mejores”.</p><div class="br-hero__facts"><span><strong>8</strong> decisiones</span><span><strong>3</strong> afinidades</span><span><strong>≈3</strong> minutos</span></div><button class="btn btn--white btn--lg btn--pill-arrow" type="button" data-br-empezar>Comenzar <span class="arrow"><i data-lucide="arrow-down" class="i"></i></span></button></div>
      <div class="br-hero__visual" aria-hidden="true"><span class="br-orbit br-orbit--1"></span><span class="br-orbit br-orbit--2"></span><span class="br-orbit br-orbit--3"></span><div class="br-compass"><i data-lucide="compass" class="i"></i></div><span class="br-dot br-dot--1">Precisión</span><span class="br-dot br-dot--2">Análisis</span><span class="br-dot br-dot--3">Conexión</span></div>
    </header>
    <form class="br-form" data-br-form>
      <div class="br-form__head"><div><span class="br-kicker">Tu manera de trabajar</span><h2 class="display">Elige lo que más se parezca a ti hoy</h2></div><span data-br-avance>0/${encuesta.preguntas.length}</span></div>
      <div class="br-questions">${encuesta.preguntas.map((p,i) => `<fieldset class="br-question" data-br-pregunta="${esc(p.id)}"><legend><span>${String(i+1).padStart(2,'0')}</span><i data-lucide="${ICONOS[p.id] || 'circle-help'}" class="i"></i><strong>${esc(p.texto)}</strong></legend>${p.ayuda ? `<p>${esc(p.ayuda)}</p>` : ''}<div class="br-options">${(p.opciones || []).map((o) => `<label><input type="${p.tipo === 'multiple' ? 'checkbox' : 'radio'}" name="${esc(p.id)}" value="${esc(o.valor)}"><span><i data-lucide="check" class="i"></i>${esc(o.etiqueta)}</span></label>`).join('')}</div></fieldset>`).join('')}</div>
      <footer class="br-form__footer"><div><i data-lucide="lock-keyhole" class="i"></i><span>Guardamos preferencias, nunca datos de pacientes.</span></div><div><button class="btn btn--ghost" type="button" data-br-posponer>Hacerlo después</button><button class="btn btn--brand btn--lg btn--pill-arrow" type="submit">Ver mi brújula <span class="arrow"><i data-lucide="compass" class="i"></i></span></button></div></footer>
    </form>
  </section>`;
}

export function montarBrujula(toast: Toast) {
  const form = document.querySelector<HTMLFormElement>('[data-br-form]');
  if (!form) return;
  const encuesta = encuestaPendientePorTipo('brujula');
  if (!encuesta) return;
  const actualizar = () => {
    const hechas = encuesta.preguntas.filter((p) => form.querySelector(`input[name="${CSS.escape(p.id)}"]:checked`)).length;
    const contador = form.querySelector('[data-br-avance]'); if (contador) contador.textContent = `${hechas}/${encuesta.preguntas.length}`;
    form.querySelectorAll<HTMLElement>('[data-br-pregunta]').forEach((q) => q.classList.toggle('is-ready', !!q.querySelector('input:checked')));
  };
  document.querySelector('[data-br-empezar]')?.addEventListener('click', () => form.scrollIntoView({behavior:'smooth',block:'start'}));
  form.addEventListener('change', (e) => {
    const input = e.target as HTMLInputElement;
    if (input.type === 'checkbox') {
      const elegidas = form.querySelectorAll<HTMLInputElement>(`input[name="${CSS.escape(input.name)}"]:checked`);
      if (elegidas.length > 3) { input.checked=false; toast('Puedes elegir hasta tres fortalezas', 'info'); }
    }
    actualizar();
  });
  form.querySelector('[data-br-posponer]')?.addEventListener('click', async () => { try { await posponerEncuesta(encuesta); toast('Guardamos la Brújula para después', 'clock-3'); navigate('/'); } catch(e){ toast(mensajeError(e),'alert-triangle'); } });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const respuestas: Record<string,string|string[]> = {};
    for (const p of encuesta.preguntas) {
      const valores=[...form.querySelectorAll<HTMLInputElement>(`input[name="${CSS.escape(p.id)}"]:checked`)].map((x)=>x.value);
      if (!valores.length) { form.querySelector(`[data-br-pregunta="${CSS.escape(p.id)}"]`)?.scrollIntoView({behavior:'smooth',block:'center'}); toast('Completa esta decisión para ver tu resultado','circle-help'); return; }
      respuestas[p.id]=p.tipo==='multiple'?valores:valores[0];
    }
    const boton=form.querySelector<HTMLButtonElement>('button[type="submit"]')!; boton.disabled=true; boton.textContent='Calculando tu brújula…';
    try { await responderEncuesta(encuesta,respuestas); await render(); toast('Tu brújula profesional está lista','compass'); }
    catch(err: any){
      // Si el POST sí alcanzó a guardarse pero falló la recarga posterior, el segundo intento
      // devuelve 409. Recuperamos el resultado persistido en vez de dejar a la persona atrapada.
      if (err?.status === 409) {
        try { await cargarEncuestas(true); await render(); toast('Recuperamos tu resultado guardado','compass'); return; } catch {}
      }
      boton.disabled=false; boton.textContent='Ver mi brújula'; toast(mensajeError(err),'alert-triangle');
    }
  });
  actualizar();
}
