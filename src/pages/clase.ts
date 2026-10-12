import { curso as getCurso, LIBRARY_ID, fmtMin } from '../core/catalogo';
import { Progreso } from '../core/progreso';
import { esc, placeholder } from '../ui/partials';
import { Datos, type Clase } from '../core/datos';
import { Acceso } from '../core/acceso';

const vacioTab = (icon: string, titulo: string, texto: string, color = 'primary') => `<div class="stack" style="gap:10px;text-align:center;padding:20px 0"><span class="circle-btn" style="width:48px;height:48px;background:var(--${color}-soft);color:var(--${color});margin:0 auto"><i data-lucide="${icon}" class="i"></i></span><strong>${titulo}</strong><p class="muted" style="font-size:var(--fs-sm)">${texto}</p></div>`;

function notasHTML(k: Clase, cursoId: string) {
  if (!k.notas) return vacioTab('captions', 'Notas de la clase', 'Resumen y conceptos clave con marca de tiempo. Se generan de la transcripción del video y las revisa OdonTeck.');
  const clave = `${cursoId}:${k.n}`;
  const total = k.notas.conceptos.length;
  const evaluacion = Datos.quiz(cursoId, k.n);
  const preguntas = evaluacion?.estado === 'aprobado' ? evaluacion.preguntas : [];
  const practicasBase = [
    ...preguntas.map((p) => ({ texto: p.q, tipo: 'Reto aprobado', icono: 'brain-circuit' })),
    ...k.notas.conceptos.map((x) => ({ texto: `Explícalo con tus propias palabras: ${x.texto}`, tipo: `Recuperación · ${x.t}`, icono: 'message-circle-question' })),
    { texto: 'Resume la idea central de la clase en una sola decisión clínica.', tipo: 'Síntesis', icono: 'scan-text' },
    { texto: '¿Qué parte del video volverías a revisar antes de aplicar este contenido?', tipo: 'Autocalibración', icono: 'history' },
  ];
  const practicas = practicasBase.filter((x, i, lista) => lista.findIndex((y) => y.texto === x.texto) === i).slice(0, 4);
  const bloques = 1 + total + practicas.length;
  return `<div class="notas-pro" data-notas-board="${esc(clave)}" data-notas-total="${total}">
    <header class="notas-pro__hero">
      <span class="notas-pro__hero-icon"><i data-lucide="notebook-pen" class="i"></i></span>
      <div><span class="eyebrow">Cuaderno clínico 360°</span><h3>De mirar la clase a dominarla</h3><p>Comprende, recupera de memoria, vuelve a la evidencia y construye tus propias notas.</p></div>
      <div class="notas-pro__hero-actions"><span><strong>${bloques}</strong><small>bloques de estudio</small></span><button type="button" class="btn btn--secondary notas-pro__copy" data-notas-copy><i data-lucide="copy" class="i"></i>Copiar cuaderno</button></div>
    </header>
    <div class="notas-pro__overview">
      <article class="notas-pro__summary"><span class="notas-pro__label"><i data-lucide="sparkles" class="i"></i>Resumen ejecutivo</span><p>${esc(k.notas.resumen)}</p></article>
      <aside class="notas-pro__progress">
        <div class="notas-pro__ring" style="--notes-progress:0"><strong data-notas-percent>0%</strong><small>repasado</small></div>
        <div><span class="eyebrow">Tu avance</span><strong><b data-notas-done>0</b> de ${total} conceptos</strong><p>Marca cada punto después de comprenderlo.</p></div>
      </aside>
    </div>
    ${total ? `<section class="notas-timeline"><div class="notas-timeline__head"><div><span class="eyebrow">Ruta de aprendizaje</span><h4>Conceptos conectados al video</h4></div><span><i data-lucide="play-circle" class="i"></i>Toca una hora para volver a la explicación</span></div>
      <ol class="notas-timeline__list">
        ${k.notas.conceptos.map((x, i) => `<li data-nota-item="${i}">
          <span class="notas-timeline__rail"><i></i></span>
          <button type="button" class="notas-timeline__time" data-video-key="${esc(clave)}" data-video-seek="${esc(x.t)}" aria-label="Repasar en el video desde ${esc(x.t)}"><i data-lucide="play" class="i"></i>${esc(x.t)}</button>
          <div class="notas-timeline__text"><small>Concepto ${String(i + 1).padStart(2, '0')}</small><p>${esc(x.texto)}</p><span><i data-lucide="brain" class="i"></i>Intenta explicarlo sin mirar antes de marcarlo.</span></div>
          <button type="button" class="notas-timeline__check" data-nota-check="${i}" aria-pressed="false" aria-label="Marcar concepto ${i + 1} como repasado"><i data-lucide="circle" class="i"></i><span>Repasar</span></button>
        </li>`).join('')}
      </ol>
    </section>` : ''}
    <div class="notas-pro__study-grid">
      <section class="notas-recall">
        <div class="notas-module__head"><span class="notas-module__icon"><i data-lucide="brain-circuit" class="i"></i></span><div><span class="eyebrow">Recuperación activa</span><h4>Comprueba lo que realmente recuerdas</h4><p>No releas todavía: formula tu respuesta y después regresa al video o al quiz.</p></div></div>
        <div class="notas-recall__list">
          ${practicas.map((p, i) => `<details class="notas-recall__item"><summary><span class="notas-recall__number">${String(i + 1).padStart(2, '0')}</span><div><small><i data-lucide="${p.icono}" class="i"></i>${esc(p.tipo)}</small><strong>${esc(p.texto)}</strong></div><i data-lucide="chevron-down" class="i notas-recall__chevron"></i></summary><div class="notas-recall__answer"><span><i data-lucide="pen-line" class="i"></i>Respóndela en tu cuaderno personal antes de comprobarla.</span>${preguntas.length ? `<button type="button" class="btn btn--secondary" data-notas-go-quiz><i data-lucide="arrow-right" class="i"></i>Ir al reto clínico</button>` : `<span class="notas-recall__pending"><i data-lucide="shield-check" class="i"></i>El reto formal de esta clase sigue en revisión.</span>`}</div></details>`).join('')}
        </div>
      </section>
      <section class="notas-personal">
        <div class="notas-module__head"><span class="notas-module__icon"><i data-lucide="pencil-ruler" class="i"></i></span><div><span class="eyebrow">Tu espacio privado</span><h4>Bitácora de la clase</h4><p>Escribe conexiones, dudas o aplicaciones para tu práctica.</p></div></div>
        <div class="notas-personal__paper"><textarea class="input" data-notas-personal maxlength="1800" rows="8" placeholder="Ejemplo: El concepto que debo volver a revisar es…&#10;&#10;En mi práctica esto se relaciona con…" aria-label="Notas personales de esta clase"></textarea><span class="notas-personal__lines" aria-hidden="true"></span></div>
        <footer class="notas-personal__footer"><span><i data-lucide="hard-drive" class="i"></i><b data-notas-save-state>Guardado sólo en este dispositivo</b></span><strong><b data-notas-characters>0</b>/1800</strong></footer>
      </section>
    </div>
    <footer class="notas-pro__footer"><span><i data-lucide="badge-check" class="i"></i>Sistema disponible en todas las clases del catálogo</span><span><i data-lucide="shield-check" class="i"></i>Los datos clínicos visibles provienen del material ya cargado</span></footer>
  </div>`;
}

function fichaHTML(k: Clase, cursoId: string) {
  const lista = `<ul class="study-sheet__list"><li><i data-lucide="file-check-2" class="i"></i>Resumen visual de la clase</li><li><i data-lucide="list-checks" class="i"></i>Conceptos y checklist de repaso</li><li><i data-lucide="brain" class="i"></i>Preguntas de recuperación activa</li></ul>`;
  if (k.ficha?.estado === 'aprobada') return `<div class="study-sheet study-sheet--ready">
    <div class="study-sheet__cover"><span>ODT</span><i data-lucide="file-text" class="i"></i><small>FICHA DE ESTUDIO</small></div>
    <div class="study-sheet__content"><span class="study-sheet__status"><i data-lucide="badge-check" class="i"></i>Revisada y disponible</span><h3>Tu repaso de esta clase</h3><p>Una guía breve para fijar lo importante sin volver a buscar cada minuto del video.</p>${lista}
      <button class="btn btn--brand" data-descargar-ficha="${esc(cursoId)}:${k.n}"><i data-lucide="download" class="i"></i>Descargar PDF</button>
      <small>Versión ${esc(k.ficha.version || '1.0')}${k.ficha.actualizada ? ` · ${new Date(k.ficha.actualizada).toLocaleDateString('es-MX')}` : ''}</small>
    </div></div>`;
  const vistaPreviaLocal = k.ficha?.estado === 'borrador' && /^(localhost|127\.0\.0\.1)$/.test(location.hostname) && k.ficha.vistaPreviaLocal;
  if (vistaPreviaLocal) return `<div class="study-sheet study-sheet--pending study-sheet--preview">
    <div class="study-sheet__cover"><span>ODT</span><i data-lucide="file-search" class="i"></i><small>BORRADOR 0.9</small></div>
    <div class="study-sheet__content"><span class="study-sheet__status"><i data-lucide="shield-alert" class="i"></i>Vista editorial local</span><h3>Ficha lista para revisión clínica</h3><p>Ya puedes comprobar la maquetación, las actividades y la clave razonada. El archivo no se publicará hasta que un odontólogo apruebe el contenido.</p>${lista}
      <a class="btn btn--brand" href="${esc(vistaPreviaLocal)}" target="_blank" rel="noopener"><i data-lucide="external-link" class="i"></i>Abrir borrador PDF</a>
      <small>Solo visible en localhost · Pendiente de revisión clínica</small>
    </div></div>`;
  return `<div class="study-sheet study-sheet--pending">
    <div class="study-sheet__cover"><span>ODT</span><i data-lucide="file-clock" class="i"></i><small>EN REVISIÓN</small></div>
    <div class="study-sheet__content"><span class="study-sheet__status"><i data-lucide="shield-check" class="i"></i>Control de calidad clínica</span><h3>Ficha de estudio en preparación</h3><p>No publicamos resúmenes automáticos sin validar. Esta ficha se activará cuando contenido, referencias y respuestas hayan sido revisados.</p>${lista}<small>El video y las notas siguen disponibles mientras termina la revisión.</small></div>
  </div>`;
}

function quizHTML(cursoId: string, n: number) {
  const q = Datos.quiz(cursoId, n);
  const borradorLocal = q?.estado === 'borrador' && /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  if (!q || (q.estado !== 'aprobado' && !borradorLocal)) return vacioTab('brain', 'Quiz de la clase', 'Preguntas cortas para reforzar lo aprendido. Aparecen aquí cuando OdonTeck las revisa y aprueba.', 'accent');
  const total = q.preguntas.length;
  return `<form class="stack lesson-quiz" style="gap:14px" data-quiz-miembro="${cursoId}:${n}" data-paso="0" novalidate>
    <div class="lesson-quiz__intro"><span class="lesson-quiz__icon"><i data-lucide="brain-circuit" class="i"></i></span><div><span class="eyebrow">OdonTeck Clinical Lab</span><strong>Simulación de decisión clínica</strong><p>${total} interacciones con razonamiento, calibración de confianza y evidencia trazable al video.</p></div><div class="lesson-quiz__badges">${borradorLocal ? '<span class="lesson-quiz__draft"><i data-lucide="shield-alert" class="i"></i>Vista editorial · revisión clínica pendiente</span>' : ''}<span class="lesson-quiz__time"><i data-lucide="timer" class="i"></i>${Math.max(2, Math.ceil(total * 1.5))} min</span></div></div>
    <div class="quiz-journey" aria-label="Progreso de la evaluación">
      <div class="quiz-journey__meta"><span data-quiz-progress-text>Pregunta 1 de ${total}</span><strong data-quiz-progress-percent>${Math.round(100 / total)}%</strong></div>
      <div class="quiz-journey__track"><span data-quiz-progress-fill style="width:${100 / total}%"></span></div>
      <div class="quiz-journey__steps">${q.preguntas.map((_, i) => `<button type="button" class="${i === 0 ? 'is-active' : ''}" data-quiz-ir="${i}" aria-label="Ir a la pregunta ${i + 1}" aria-current="${i === 0 ? 'step' : 'false'}"><span>${i + 1}</span></button>`).join('')}</div>
    </div>
    <div class="quiz-studio">
      <div class="quiz-studio__main">
    ${q.preguntas.map((p, i) => `<fieldset class="quiz-q ${i === 0 ? 'is-active' : ''}" data-pregunta="${i}" data-tipo="${p.tipo || 'seleccion'}" data-competencia="${esc(p.competencia || 'Criterio clínico aplicado')}" data-nivel="${esc(p.nivelCognitivo || 'Aplicar')}" tabindex="-1" ${i === 0 ? '' : 'hidden'}>
      <legend><span class="quiz-q__number">${i + 1}</span><span>Pregunta ${i + 1} de ${q.preguntas.length}</span><button type="button" class="quiz-q__flag" data-quiz-flag="${i}" aria-pressed="false" title="Marcar para revisar"><i data-lucide="bookmark" class="i"></i><span>Revisar</span></button><span class="quiz-q__type">${({ seleccion: 'Una respuesta', seleccion_multiple: 'Varias respuestas', ordenar: 'Ordenar', relacionar: 'Relacionar', completar: 'Completar' } as Record<string, string>)[p.tipo || 'seleccion']}</span></legend>
      <div class="quiz-thinking-path" aria-label="Ruta de razonamiento"><span><b>01</b> Analiza</span><i data-lucide="chevron-right" class="i"></i><span><b>02</b> Decide</span><i data-lucide="chevron-right" class="i"></i><span><b>03</b> Calibra</span></div>
      ${(p.casoClinico || p.competencia || p.nivelCognitivo) ? `<article class="quiz-case">
        <span class="quiz-case__icon"><i data-lucide="clipboard-check" class="i"></i></span>
        <div class="quiz-case__body"><span class="eyebrow">Situación clínica</span>${p.casoClinico ? `<p>${esc(p.casoClinico)}</p>` : ''}
          <div class="quiz-case__meta">${p.competencia ? `<span><i data-lucide="target" class="i"></i>${esc(p.competencia)}</span>` : ''}${p.nivelCognitivo ? `<span><i data-lucide="brain" class="i"></i>${esc(p.nivelCognitivo)}</span>` : ''}</div>
        </div>
      </article>` : ''}
      <p class="quiz__q" style="font-size:var(--fs-md)">${esc(p.q)}</p>
      ${p.instruccion ? `<p class="quiz__hint">${esc(p.instruccion)}</p>` : ''}
      ${quizInteraccion(p, i)}
      ${razonamientoHTML(i)}
      <p class="quiz__exp" hidden>${esc(p.explicacion)}</p>
      <p class="quiz__calibration" hidden></p>
    </fieldset>`).join('')}
      </div>
      <aside class="quiz-coach" aria-label="Panel de decisión clínica">
        <div class="quiz-coach__head"><span><i data-lucide="activity" class="i"></i></span><div><small>Panel clínico</small><strong>Tu ruta de decisión</strong></div></div>
        <div class="quiz-coach__focus"><small>Competencia activa</small><strong data-coach-competencia>${esc(q.preguntas[0]?.competencia || 'Criterio clínico aplicado')}</strong><span data-coach-nivel>${esc(q.preguntas[0]?.nivelCognitivo || 'Aplicar')}</span></div>
        <div class="quiz-coach__checklist">
          <span><i data-lucide="scan-search" class="i"></i><b>Analiza</b><small>Identifica los datos que sí cambian la decisión.</small></span>
          <span><i data-lucide="git-branch" class="i"></i><b>Decide</b><small>Construye tu respuesta antes de comparar.</small></span>
          <span><i data-lucide="gauge" class="i"></i><b>Calibra</b><small>Declara cuánta confianza tienes en tu criterio.</small></span>
        </div>
        <div class="quiz-coach__stats"><span><b data-coach-complete>0/${total}</b><small>completadas</small></span><span><b data-coach-flags>0</b><small>por revisar</small></span></div>
        <p class="quiz-coach__safe"><i data-lucide="shield-check" class="i"></i>La solución permanece protegida hasta entregar el reto.</p>
      </aside>
    </div>
    <div class="quiz__resultado" hidden></div>
    <div class="quiz-nav">
      <button class="btn btn--secondary" type="button" data-quiz-nav="-1" hidden><i data-lucide="arrow-left" class="i"></i>Anterior</button>
      <span class="quiz-nav__hint"><i data-lucide="shield-check" class="i"></i>Tus respuestas se evalúan de forma segura</span>
      <button class="btn btn--brand" type="button" data-quiz-nav="1">Siguiente <i data-lucide="arrow-right" class="i"></i></button>
      <button class="btn btn--brand" type="submit" data-quiz-submit hidden>Finalizar reto <i data-lucide="sparkles" class="i"></i></button>
    </div>
  </form>`;
}

function quizInteraccion(p: ReturnType<typeof Datos.quizzes>[number]['preguntas'][number], i: number) {
  const tipo = p.tipo || 'seleccion';
  if (tipo === 'seleccion' || tipo === 'seleccion_multiple') return `<div class="quiz-choice-list">${(p.opciones || []).map((o, j) => `<div class="quiz-choice-row"><label class="quiz__opt"><input type="${tipo === 'seleccion_multiple' ? 'checkbox' : 'radio'}" name="r${i}" value="${j}" ${tipo === 'seleccion' ? 'required' : ''} hidden><span class="k">${tipo === 'seleccion_multiple' ? '✓' : 'ABCDEF'[j]}</span><span>${esc(o)}</span></label><button type="button" class="quiz-choice-row__exclude" data-quiz-exclude="${i}:${j}" aria-pressed="false" aria-label="Descartar opción ${'ABCDEF'[j]}"><i data-lucide="eye-off" class="i"></i><span>Descartar</span></button></div>`).join('')}</div>`;
  if (tipo === 'ordenar') return `<div class="quiz__interactive quiz-sort" data-quiz-sort="${i}"><p><i data-lucide="list-ordered" class="i"></i>Ordena la secuencia usando las flechas:</p><div class="quiz-sort__list">${(p.elementos || []).map((x, pos, lista) => `<div class="quiz-sort__item" data-sort-item data-id="${esc(x.id)}"><input type="hidden" data-sort-answer name="r${i}-${pos}" value="${esc(x.id)}"><span class="quiz-sort__position" data-sort-position>${pos + 1}</span><i data-lucide="grip-vertical" class="i quiz-sort__grip" aria-hidden="true"></i><strong>${esc(x.texto)}</strong><span class="quiz-sort__actions"><button type="button" class="circle-btn" data-quiz-move="-1" aria-label="Subir ${esc(x.texto)}" ${pos === 0 ? 'disabled' : ''}><i data-lucide="chevron-up" class="i"></i></button><button type="button" class="circle-btn" data-quiz-move="1" aria-label="Bajar ${esc(x.texto)}" ${pos === lista.length - 1 ? 'disabled' : ''}><i data-lucide="chevron-down" class="i"></i></button></span></div>`).join('')}</div></div>`;
  if (tipo === 'relacionar') return `<div class="quiz__interactive quiz-match"><p><i data-lucide="waypoints" class="i"></i>Relaciona cada concepto con su correspondencia:</p>${(p.izquierda || []).map((x) => `<label><strong><span>Concepto</span>${esc(x.texto)}</strong><span class="quiz-match__arrow"><i data-lucide="arrow-right" class="i"></i></span><select class="input" name="r${i}-${esc(x.id)}" required aria-label="Correspondencia para ${esc(x.texto)}"><option value="">Elige una relación…</option>${(p.derecha || []).map((y) => `<option value="${esc(y.id)}">${esc(y.texto)}</option>`).join('')}</select></label>`).join('')}</div>`;
  if (tipo === 'completar') return `<div class="quiz__interactive quiz-complete"><p><i data-lucide="text-cursor-input" class="i"></i>${esc(p.plantilla || 'Completa los espacios')}</p>${(p.huecos || []).map((h, pos) => `<label><strong><span>${String(pos + 1).padStart(2, '0')}</span>${esc(h.etiqueta || `Espacio ${pos + 1}`)}</strong><input class="input" name="r${i}-${esc(h.id)}" required autocomplete="off" placeholder="Escribe tu respuesta…"></label>`).join('')}</div>`;
  return '';
}

function razonamientoHTML(i: number) {
  return `<div class="quiz-reasoning">
    <div class="quiz-reasoning__head"><span class="quiz-reasoning__icon"><i data-lucide="brain-cog" class="i"></i></span><div><strong>Bitácora de razonamiento</strong><p>Explica qué dato inclinó tu decisión. Se guarda en tu historial privado y no modifica tu puntaje.</p></div></div>
    <textarea class="input quiz-reasoning__note" name="j${i}" maxlength="240" rows="2" placeholder="Ejemplo: elegí esta respuesta porque…" aria-label="Justificación opcional de la pregunta ${i + 1}"></textarea>
    <div class="quiz-confidence"><div><span class="eyebrow">Calibra tu criterio</span><strong>¿Qué tan segura es tu respuesta?</strong></div><input type="hidden" name="c${i}" data-confidence-input required><div class="quiz-confidence__options"><button type="button" data-quiz-confidence="1"><i data-lucide="circle-help" class="i"></i><span>Duda</span></button><button type="button" data-quiz-confidence="2"><i data-lucide="gauge" class="i"></i><span>Razonable</span></button><button type="button" data-quiz-confidence="3"><i data-lucide="badge-check" class="i"></i><span>Muy segura</span></button></div></div>
  </div>`;
}

export function clase(params: Record<string, string>) {
  const c = getCurso(params.id);
  const n = Number(params.n);
  const k = c?.clases.find((x) => x.n === n);
  if (!c || !k) return placeholder('Clase no encontrada', 'Revisa el temario del curso.', 'search-x');
  if (!Progreso.desbloqueada(c, n)) {
    return placeholder('Esta clase todavía está bloqueada', `Termina la clase ${n - 1} para desbloquearla. Así avanzas a tu ritmo y sin saltarte nada.`, 'lock')
      .replace('href="#/cursos">Ir a cursos', `href="#/curso/${c.id}/clase/${n - 1}">Ir a la clase ${n - 1}`);
  }
  if (!Acceso.claseAccesible(c, n)) {
    const totalClases = c.clases.length;
    const restantes = totalClases - n + 1;
    const iniciales = c.instructor.split(' ').filter((w) => /^[A-ZÁÉÍÓÚ]/.test(w)).slice(-2).map((w) => w[0]).join('');
    const clasesVip = c.clases.filter((x) => !Acceso.claseLibre(c, x.n));
    const durTotal = clasesVip.reduce((s, x) => s + (x.duracion || 0), 0);

    return `<section class="stack" style="gap:20px">
      <a class="section-head__cta" href="#/curso/${c.id}" style="align-self:flex-start"><span class="circle-btn circle-btn--glass" style="width:34px;height:34px"><i data-lucide="arrow-left" class="i" style="width:15px;height:15px"></i></span>${esc(c.titulo)}</a>
      <div class="locked-hero" style="min-height:480px">
        <img src="${c.portada}" alt="">
        <div class="locked-hero__body" style="padding:40px 44px;gap:24px;max-width:100%;display:grid;grid-template-columns:1fr auto auto;align-items:center">
          <div style="display:grid;gap:14px;justify-items:start;align-self:center">
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
              <span style="display:inline-flex;align-items:center;gap:6px;background:rgba(111,191,176,.15);color:var(--brand-teal);font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;padding:5px 14px;border-radius:99px;border:1px solid rgba(111,191,176,.25)"><i data-lucide="crown" class="i" style="width:13px;height:13px"></i>Contenido VIP</span>
              <span style="display:inline-flex;align-items:center;gap:5px;background:rgba(255,255,255,.1);color:rgba(255,255,255,.7);font-size:var(--fs-xs);padding:5px 12px;border-radius:99px"><i data-lucide="play-circle" class="i" style="width:12px;height:12px"></i>Clase ${n} de ${totalClases}</span>
              ${k.duracion ? `<span style="display:inline-flex;align-items:center;gap:5px;background:rgba(255,255,255,.1);color:rgba(255,255,255,.7);font-size:var(--fs-xs);padding:5px 12px;border-radius:99px"><i data-lucide="clock" class="i" style="width:12px;height:12px"></i>${fmtMin(k.duracion)}</span>` : ''}
            </div>
            <h1 class="display" style="font-size:clamp(var(--fs-lg),2.5vw,var(--fs-2xl));line-height:1.15">${esc(k.titulo)}</h1>
            <p style="max-width:40ch;color:rgba(255,255,255,.8);font-size:var(--fs-sm);line-height:1.6">Desbloquea esta clase${restantes > 1 ? ` y ${restantes - 1} más` : ''}, todo el catálogo de cursos, tu certificado con folio y la biblioteca completa.</p>
            <div style="display:flex;align-items:center;gap:10px">
              <span style="width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.15);display:grid;place-items:center;font-size:11px;font-weight:700;color:#fff;border:2px solid rgba(255,255,255,.25)">${iniciales || 'OT'}</span>
              <div style="font-size:var(--fs-xs)"><strong style="color:#fff">${esc(c.instructor)}</strong><div style="color:rgba(255,255,255,.5)">${esc(c.area)} · ${esc(c.nivel)}</div></div>
            </div>
            <a class="btn btn--lg" href="#/suscripcion" style="background:var(--brand-teal);color:var(--brand-navy);font-weight:700;margin-top:4px"><i data-lucide="crown" class="i"></i>Ver planes y precios <i data-lucide="arrow-right" class="i"></i></a>
          </div>
          <div style="width:240px;display:grid;gap:10px;background:rgba(255,255,255,.06);border-radius:var(--r-xl);padding:22px 20px;backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.1)">
            <span style="font-family:var(--font-display);font-weight:700;font-size:var(--fs-sm);color:#fff">Con VIP desbloqueas</span>
            <div style="display:grid;gap:8px;font-size:var(--fs-xs);color:rgba(255,255,255,.85)">
              ${[['play-circle', 'Todos los cursos y clases'], ['award', 'Certificados con folio'], ['library', 'Biblioteca de materiales'], ['brain', 'Quizzes y retos clínicos'], ['messages-square', 'Comunidad profesional']].map(([ic, t]) => `<div style="display:flex;gap:8px;align-items:center"><span style="width:28px;height:28px;border-radius:50%;background:rgba(111,191,176,.15);display:grid;place-items:center;flex-shrink:0"><i data-lucide="${ic}" class="i" style="width:13px;height:13px;color:var(--brand-teal)"></i></span>${t}</div>`).join('')}
            </div>
          </div>
          <div style="width:220px;display:grid;gap:8px;background:rgba(255,255,255,.06);border-radius:var(--r-xl);padding:22px 20px;backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.1);align-content:start">
            <span style="font-size:11px;font-weight:600;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:.06em">Clases del curso</span>
            ${c.clases.map((x) => {
              const libre = Acceso.claseLibre(c, x.n);
              const actual = x.n === n;
              return `<div style="display:flex;gap:7px;align-items:center;font-size:var(--fs-xs);color:rgba(255,255,255,${actual ? '1' : libre ? '.7' : '.45'})${actual ? ';font-weight:600' : ''}"><i data-lucide="${libre ? 'check-circle' : actual ? 'circle-dot' : 'lock'}" class="i" style="width:12px;height:12px;flex-shrink:0;color:${actual ? 'var(--brand-teal)' : libre ? 'var(--brand-teal)' : 'rgba(255,255,255,.3)'}"></i><span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(x.titulo)}</span></div>`;
            }).join('')}
            ${durTotal ? `<span style="font-size:11px;color:rgba(255,255,255,.35);margin-top:2px">${fmtMin(durTotal)} de contenido VIP</span>` : ''}
          </div>
        </div>
      </div>
    </section>`;
  }
  Progreso.abrirClase(c.id, n);
  const vista = Progreso.de(c.id).vistas.includes(n);
  const prev = c.clases.find((x) => x.n === n - 1);
  const next = c.clases.find((x) => x.n === n + 1);
  const quizDisponible = Datos.quiz(c.id, n)?.estado === 'aprobado';

  // Provisional: embed directo. En Fase 2 el backend firma la URL (token + expires).
  const embed = `https://iframe.mediadelivery.net/embed/${LIBRARY_ID}/${k.videoId}?autoplay=false&preload=true&responsive=true`;

  const temario = c.clases.map((x) => {
    const v = Progreso.de(c.id).vistas.includes(x.n);
    const abierta = Progreso.desbloqueada(c, x.n);
    const actual = x.n === n;
    const style = actual ? 'color:var(--primary);font-weight:600' : v ? '' : abierta ? '' : 'opacity:.5';
    const inner = `<span class="mono faint" style="width:22px">${v ? '✓' : x.n}</span>${esc(x.titulo)}`;
    return abierta ? `<a href="#/curso/${c.id}/clase/${x.n}" class="row" style="gap:10px;${style};color:inherit;flex-wrap:nowrap">${inner}</a>`
                   : `<div class="row" style="gap:10px;${style};flex-wrap:nowrap"><i data-lucide="lock" class="i" style="width:14px;height:14px"></i>${esc(x.titulo)}</div>`;
  }).join('');

  return `
  <section class="stack" style="gap:20px">
    <a class="section-head__cta" href="#/curso/${c.id}" style="align-self:flex-start"><span class="circle-btn circle-btn--glass" style="width:34px;height:34px"><i data-lucide="arrow-left" class="i" style="width:15px;height:15px"></i></span>${esc(c.titulo)}</a>
    <div class="grid lesson-workspace" data-lesson-workspace data-lesson-mode="default">
      <div class="stack lesson-stage" style="gap:16px">
        <div class="player" style="aspect-ratio:16/9;background:#0a0d18">
          <iframe id="video-${esc(c.id)}-${n}" ${Datos.modo === 'demo' ? `src="${embed}"` : ''} data-video="${c.id}:${n}" title="${esc(k.titulo)}" loading="lazy" style="border:0;position:absolute;inset:0;width:100%;height:100%" allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;fullscreen" allowfullscreen></iframe>
        </div>
        <div class="row" style="justify-content:space-between;align-items:flex-start">
          <div><span class="eyebrow">Clase ${n} de ${c.clases.length}${k.duracion ? ' · ' + fmtMin(k.duracion) : ''}</span><h1 class="display" style="font-size:var(--fs-xl);margin-top:4px">${esc(k.titulo)}</h1>
            <div class="lesson-progress" style="margin-top:8px"><div class="progress progress--thin"><span style="width:${Progreso.porcentaje(c)}%"></span></div>${Progreso.de(c.id).vistas.length} de ${c.clases.length} vistas · ${Progreso.porcentaje(c)}%</div></div>
          <div class="row" style="flex-wrap:nowrap">
            ${prev ? `<a class="btn btn--secondary" href="#/curso/${c.id}/clase/${prev.n}"><i data-lucide="chevron-left" class="i"></i>Anterior</a>` : ''}
            ${vista && quizDisponible ? `<button class="btn btn--brand" data-abrir-quiz="${c.id}:${n}"><i data-lucide="brain-circuit" class="i"></i>Resolver reto</button>` : ''}
            ${vista
              ? (next ? `<a class="btn btn--secondary btn--pill-arrow" href="#/curso/${c.id}/clase/${next.n}">Siguiente clase <span class="arrow"><i data-lucide="arrow-right" class="i"></i></span></a>`
                      : `<a class="btn btn--gradient btn--pill-arrow" href="#/curso/${c.id}">Curso completado <span class="arrow"><i data-lucide="award" class="i"></i></span></a>`)
              : `<button class="btn btn--brand btn--pill-arrow" data-marcar-vista="${c.id}:${n}" ${quizDisponible ? 'data-abrir-quiz-al-final' : ''}>${quizDisponible ? 'Finalizar y abrir reto' : 'Marcar vista y seguir'} <span class="arrow"><i data-lucide="${quizDisponible ? 'brain-circuit' : 'arrow-right'}" class="i"></i></span></button>`}
          </div>
        </div>
        ${next ? `
        <div class="upnext">
          <div class="upnext__thumb"><img src="${c.portada}" alt=""><i data-lucide="${Progreso.desbloqueada(c, next.n) || vista ? 'play' : 'lock'}" class="i"></i></div>
          <div><span class="eyebrow">A continuación · clase ${next.n}</span><div class="upnext__title">${esc(next.titulo)}</div><p class="faint" style="font-size:var(--fs-xs);margin-top:4px">${vista ? 'Ya puedes verla.' : 'Se desbloquea al marcar esta clase como vista.'}</p></div>
          ${vista ? `<a class="circle-btn" href="#/curso/${c.id}/clase/${next.n}" aria-label="Ir a la siguiente"><i data-lucide="arrow-right" class="i"></i></a>` : `<span class="circle-btn" style="background:var(--surface-3);color:var(--text-3)"><i data-lucide="lock" class="i"></i></span>`}
        </div>` : `
        <div class="upnext" style="background:var(--accent-soft);border-color:transparent">
          <span class="circle-btn" style="background:var(--accent);width:56px;height:56px"><i data-lucide="award" class="i" style="width:24px;height:24px"></i></span>
          <div><span class="eyebrow">Última clase</span><div class="upnext__title">Al marcarla como vista, el curso queda completado y se emite tu certificado.</div></div>
        </div>`}
      </div>
      <div class="card card--pad stack lesson-tools" data-tabs style="gap:16px">
        <div class="tabs lesson-tools__tabs"><button data-for="temario" class="is-active"><i data-lucide="list-video" class="i"></i>Temario</button><button data-for="notas"><i data-lucide="notebook-tabs" class="i"></i>Notas</button><button data-for="quiz"><i data-lucide="brain" class="i"></i>Quiz</button><button data-for="ficha"><i data-lucide="file-down" class="i"></i>Ficha</button></div>
        <div data-tab="temario" class="stack" style="gap:10px;font-size:var(--fs-sm)">${temario}</div>
        <div data-tab="notas" hidden class="stack" style="gap:10px">${notasHTML(k, c.id)}</div>
        <div data-tab="quiz" hidden class="stack" style="gap:12px">${quizHTML(c.id, n)}</div>
        <div data-tab="ficha" hidden class="stack" style="gap:12px">${fichaHTML(k, c.id)}</div>
      </div>
    </div>
  </section>`;
}
