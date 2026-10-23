// Admin · cursos, quizzes, materiales y en vivo.
import { Datos, type Curso, type Material, type Evento, type Quiz } from '../core/datos';
import { esc } from '../ui/partials';
import { adminHead } from './shell';

const TIPOS = ['PDF', 'Libro', 'Presentación'];
const NIVELES = ['Básico', 'Intermedio', 'Avanzado'];
const opt = (vals: string[], sel: string) => vals.map((v) => `<option ${v === sel ? 'selected' : ''}>${esc(v)}</option>`).join('');
export const vacio = (titulo: string, texto: string, cta = '') => `<div class="card card--pad" style="text-align:center;padding:48px"><h3>${titulo}</h3><p class="muted" style="margin:6px 0 14px">${texto}</p>${cta}</div>`;

// ═══ CURSOS ═══
export function adminCursos() {
  const l = Datos.cursos();
  const quizzes = Datos.quizzes();
  return `
  ${adminHead('Cursos', `${l.length} cursos · ${l.reduce((a, c) => a + c.clases.length, 0)} clases · ${l.filter((c) => c.publicado !== false).length} publicados`,
    `<a class="btn btn--brand btn--pill-arrow" href="#/admin/cursos/nuevo">Nuevo curso <span class="arrow"><i data-lucide="plus" class="i"></i></span></a>`)}
  <div data-bulk-cursos></div>
  <div class="card dtable-wrap"><table class="dtable" data-tabla="cursos">
    <thead><tr><th class="dtable__check"><input type="checkbox" data-bulk-all aria-label="Seleccionar todos"></th><th style="width:60px">#</th><th>Curso</th><th>Área</th><th>Clases</th><th>Títulos</th><th>Quizzes</th><th>Estado</th><th style="width:120px"></th></tr></thead>
    <tbody>${l.map((c, i) => {
      const genericos = c.clases.filter((k) => /^Clase \d+$/.test(k.titulo)).length;
      const qz = quizzes.filter((q) => q.cursoId === c.id);
      return `<tr data-curso-fila="${c.id}">
        <td class="dtable__check"><input type="checkbox" data-bulk-item="${c.id}" aria-label="Seleccionar ${esc(c.titulo)}"></td>
        <td class="mono faint"><span class="row" style="gap:6px;align-items:center;flex-wrap:nowrap"><span class="drag-handle" draggable="true" data-arrastre="${c.id}" title="Arrastra para reordenar"><i data-lucide="grip-vertical" class="i"></i></span>${i + 1}</span></td>
        <td><a class="dtable__main" href="#/admin/cursos/${c.id}"><img src="${c.portada}" alt=""><span><strong>${esc(c.titulo)}</strong><br><span class="faint">${esc(c.instructor)}</span></span></a></td>
        <td>${esc(c.area)}</td><td class="mono">${c.clases.length}</td>
        <td>${genericos ? `<span class="chip chip--warn">${genericos} sin título</span>` : '<span class="chip chip--accent">Completos</span>'}</td>
        <td><span class="chip">${qz.filter((q) => q.estado === 'aprobado').length}/${c.clases.length}</span></td>
        <td><button class="switch" role="switch" aria-checked="${c.publicado !== false}" data-toggle-publicado="${c.id}" title="Publicado"></button></td>
        <td><div class="row" style="gap:4px;flex-wrap:nowrap">
          <button class="btn btn--ghost btn--icon btn--xs" data-mover-curso="${c.id}:-1" ${i === 0 ? 'disabled' : ''} aria-label="Subir"><i data-lucide="arrow-up" class="i"></i></button>
          <button class="btn btn--ghost btn--icon btn--xs" data-mover-curso="${c.id}:1" ${i === l.length - 1 ? 'disabled' : ''} aria-label="Bajar"><i data-lucide="arrow-down" class="i"></i></button>
          <a class="btn btn--ghost btn--icon btn--xs" href="#/admin/cursos/${c.id}" aria-label="Editar"><i data-lucide="pencil" class="i"></i></a>
        </div></td></tr>`;
    }).join('')}</tbody></table></div>`;
}

export function adminCurso(params: Record<string, string>) {
  const nuevo = params.id === 'nuevo';
  const c: Curso = nuevo
    ? { id: '', titulo: '', area: '', nivel: 'Básico', instructor: '', portada: '/cursos/curso-01.webp', descripcion: '', aprenderas: [], orden: Datos.cursos().length + 1, publicado: false, bunnyCollectionId: '', clases: [] }
    : Datos.cursos().find((x) => x.id === params.id)!;
  if (!c) return vacio('Curso no encontrado', 'Puede que se haya borrado.', '<a class="btn btn--brand" href="#/admin/cursos">Volver</a>');
  const areas = [...new Set(Datos.cursos().map((x) => x.area))].sort();
  return `
  <a class="section-head__cta" href="#/admin/cursos" style="align-self:flex-start"><span class="circle-btn circle-btn--glass" style="width:34px;height:34px"><i data-lucide="arrow-left" class="i" style="width:15px;height:15px"></i></span>Cursos</a>
  <form class="stack" style="gap:20px" data-form="curso" data-id="${c.id}">
    ${adminHead(nuevo ? 'Nuevo curso' : esc(c.titulo), nuevo ? 'Llena los datos y agrega las clases con su ID de video de Bunny.' : `${c.clases.length} clases · biblioteca Bunny ${Datos.libraryId}`,
      `${!nuevo ? `<a class="btn btn--secondary" href="#/curso/${c.id}" target="_blank"><i data-lucide="eye" class="i"></i>Ver como miembro</a>` : ''}<button class="btn btn--brand btn--pill-arrow">Guardar <span class="arrow"><i data-lucide="check" class="i"></i></span></button>`)}
    <div class="admin-grid">
      <div class="card card--pad stack" style="gap:14px">
        <h3 class="admin-card-title">Datos del curso</h3>
        <div class="field"><label>Título</label><input class="input" name="titulo" value="${esc(c.titulo)}" required maxlength="140"></div>
        <div class="form-grid">
          <div class="field"><label>Área</label><input class="input" name="area" value="${esc(c.area)}" list="areas" required><datalist id="areas">${areas.map((a) => `<option value="${esc(a)}">`).join('')}</datalist></div>
          <div class="field"><label>Nivel</label><select class="input" name="nivel">${opt(NIVELES, c.nivel)}</select></div>
        </div>
        <div class="field"><label>Ponente</label><input class="input" name="instructor" value="${esc(c.instructor)}" placeholder="Dra. Nombre Apellido"></div>
        <div class="field"><label>Descripción</label><textarea class="input" name="descripcion" rows="3">${esc(c.descripcion)}</textarea></div>
        <div class="field"><label>Lo que aprenderás (uno por línea)</label><textarea class="input" name="aprenderas" rows="4">${esc((c.aprenderas || []).join('\n'))}</textarea></div>
        <div class="form-grid">
          <div class="field"><label>ID de colección en Bunny</label><input class="input mono" name="bunnyCollectionId" value="${esc(c.bunnyCollectionId)}"></div>
          <div class="field"><label>Publicado</label><select class="input" name="publicado"><option value="1" ${c.publicado !== false ? 'selected' : ''}>Sí, visible para miembros</option><option value="0" ${c.publicado === false ? 'selected' : ''}>No, oculto</option></select></div>
        </div>
      </div>
      <div class="card card--pad stack" style="gap:12px">
        <h3 class="admin-card-title">Portada 3:4</h3>
        <div class="cover-drop"><img src="${c.portada}" alt="" data-preview="portada">${Datos.modo === 'demo' ? '<label class="btn btn--secondary btn--sm"><i data-lucide="upload" class="i"></i>Subir imagen<input type="file" accept="image/*" hidden data-subir-imagen="portada"></label>' : ''}</div>
        ${Datos.modo === 'api' ? `<div class="field"><label>URL pública o ruta de la portada</label><input class="input" name="portada" value="${esc(c.portada)}" required placeholder="/cursos/portada.webp o https://…"></div>` : `<input type="hidden" name="portada" value="${esc(c.portada)}">`}
        <p class="faint" style="font-size:var(--fs-xs)">${Datos.modo === 'demo' ? 'Usa las imágenes generadas con la guía de Flow. Se optimizan al subir.' : 'La API de cursos guarda una URL; no envía archivos ni secretos de Bunny desde el navegador.'}</p>
      </div>
    </div>
    <div class="card card--pad stack" style="gap:12px">
      <div class="row" style="justify-content:space-between"><h3 class="admin-card-title">Clases</h3><button type="button" class="btn btn--secondary btn--sm" data-clase-accion="agregar"><i data-lucide="plus" class="i"></i>Agregar clase</button></div>
      ${c.clases.length ? `<div class="dtable-wrap"><table class="dtable dtable--form"><thead><tr><th style="width:40px">#</th><th>Título</th><th style="width:30%">ID de video en Bunny</th><th style="width:90px">Min</th><th style="width:70px">Gratis</th><th style="width:110px"></th></tr></thead><tbody>
        ${c.clases.map((k, i) => `<tr>
          <td class="mono faint">${i + 1}</td>
          <td><input class="input input--sm" name="clase-${i}-titulo" value="${esc(k.titulo)}" required>${/^Clase \d+$/.test(k.titulo) ? '<span class="faint" style="font-size:10px">Título genérico · se reemplaza con la transcripción</span>' : ''}</td>
          <td><input class="input input--sm mono" name="clase-${i}-videoId" value="${esc(k.videoId)}" required></td>
          <td><input class="input input--sm mono" name="clase-${i}-duracion" type="number" min="0" value="${k.duracion ?? ''}"></td>
          <td style="text-align:center"><input type="checkbox" name="clase-${i}-gratis" ${k.gratis ? 'checked' : ''}></td>
          <td><div class="row" style="gap:2px;flex-wrap:nowrap">
            <button type="button" class="btn btn--ghost btn--icon btn--xs" data-clase-accion="subir:${i}" ${i === 0 ? 'disabled' : ''}><i data-lucide="arrow-up" class="i"></i></button>
            <button type="button" class="btn btn--ghost btn--icon btn--xs" data-clase-accion="bajar:${i}" ${i === c.clases.length - 1 ? 'disabled' : ''}><i data-lucide="arrow-down" class="i"></i></button>
            <button type="button" class="btn btn--ghost btn--icon btn--xs" data-clase-accion="quitar:${i}"><i data-lucide="trash-2" class="i"></i></button>
          </div></td></tr>`).join('')}
      </tbody></table></div>` : vacio('Sin clases', 'Agrega la primera clase con su ID de video de Bunny.')}
    </div>
    ${!nuevo ? `<div class="card card--pad row" style="justify-content:space-between"><div><strong>Borrar curso</strong><p class="faint" style="font-size:var(--fs-xs)">Solo si nadie lo ha empezado. En producción el backend lo impide si hay progreso.</p></div><button type="button" class="btn btn--danger" data-borrar-curso="${c.id}"><i data-lucide="trash-2" class="i"></i>Borrar</button></div>` : ''}
  </form>`;
}

// ═══ QUIZZES ═══
export function adminQuizzes() {
  const qz = Datos.quizzes();
  const cursos = Datos.cursos();
  const aprob = qz.filter((q) => q.estado === 'aprobado').length;
  const clases = cursos.flatMap((c) => c.clases.map((k) => ({ cursoId: c.id, ...k })));
  const total = clases.length;
  const notas = clases.filter((k) => !!k.notas).length;
  const fichas = clases.filter((k) => k.ficha?.estado === 'aprobada').length;
  const completos = clases.filter((k) => !!k.notas && k.ficha?.estado === 'aprobada' && qz.some((q) => q.cursoId === k.cursoId && q.n === k.n && q.estado === 'aprobado')).length;
  const cobertura = (valor: number) => total ? Math.round(valor / total * 100) : 0;
  return `
  ${adminHead('Quizzes', `${aprob} aprobados · ${qz.length - aprob} en borrador · ${cursos.reduce((a, c) => a + c.clases.length, 0) - qz.length} clases sin quiz`)}
  <div class="learning-coverage" aria-label="Cobertura de paquetes por clase">
    ${[[notas, 'Notas', 'notebook-tabs'], [aprob, 'Quiz aprobado', 'brain'], [fichas, 'Ficha PDF', 'file-check-2'], [completos, 'Paquete completo', 'badge-check']].map(([valor, etiqueta, icono]) => `<article class="learning-coverage__item"><span class="learning-coverage__icon"><i data-lucide="${icono}" class="i"></i></span><div><strong>${valor}/${total}</strong><span>${etiqueta}</span></div><div class="learning-coverage__bar"><i style="width:${cobertura(Number(valor))}%"></i></div><small>${cobertura(Number(valor))}%</small></article>`).join('')}
  </div>
  ${callout('Cómo se generan', 'Los quizzes salen de la transcripción de cada video (scripts/pipeline) y entran como <b>borrador</b>. Un odontólogo los revisa, corrige y aprueba aquí. Solo los aprobados los ven los miembros.')}
  <div class="stack" style="gap:12px">${cursos.map((c) => `
    <details class="card acc" ${qz.some((q) => q.cursoId === c.id) ? 'open' : ''}>
      <summary><img src="${c.portada}" alt=""><strong>${esc(c.titulo)}</strong><span class="chip">${qz.filter((q) => q.cursoId === c.id && q.estado === 'aprobado').length}/${c.clases.length}</span></summary>
      <div class="acc__body">${c.clases.map((k) => {
        const q = qz.find((x) => x.cursoId === c.id && x.n === k.n);
        const chip = !q ? '<span class="chip">Sin quiz</span>' : q.estado === 'aprobado' ? '<span class="chip chip--accent">Aprobado</span>' : '<span class="chip chip--warn">Borrador</span>';
        return `<a class="acc__row" href="#/admin/quizzes/${c.id}/${k.n}"><span class="mono faint">${k.n}</span><span>${esc(k.titulo)}</span>${chip}${q ? `<span class="faint" style="font-size:var(--fs-xs)">${q.preguntas.length} preguntas</span>` : ''}<i data-lucide="chevron-right" class="i"></i></a>`;
      }).join('')}</div>
    </details>`).join('')}</div>`;
}

const TIPOS_QUIZ = [
  ['seleccion', 'Una respuesta'], ['seleccion_multiple', 'Varias respuestas'], ['ordenar', 'Ordenar pasos'],
  ['relacionar', 'Relacionar conceptos'], ['completar', 'Completar espacios'],
];

function editorInteraccion(p: Quiz['preguntas'][number], i: number) {
  const tipo = p.tipo || 'seleccion';
  if (tipo === 'seleccion' || tipo === 'seleccion_multiple') {
    const total = Math.max(4, Math.min(6, p.opciones?.length || 4));
    return `<div class="stack quiz-author__body" style="gap:7px">${Array.from({ length: total }, (_, o) => `
      <label class="quiz-edit-opt"><input type="${tipo === 'seleccion' ? 'radio' : 'checkbox'}" name="p-${i}-${tipo === 'seleccion' ? 'correcta' : 'correctas'}" value="${o}" ${(tipo === 'seleccion' ? p.correcta === o : p.correctas?.includes(o)) ? 'checked' : ''} ${tipo === 'seleccion' ? 'required' : ''}>
      <span class="k">${'ABCDEF'[o]}</span><input class="input input--sm" name="p-${i}-o-${o}" value="${esc(p.opciones?.[o] || '')}" placeholder="Opción ${o + 1}" required></label>`).join('')}</div>`;
  }
  if (tipo === 'ordenar') {
    const elementos = (p.elementos || []).map((x) => `${x.id} | ${x.texto}`).join('\n');
    return `<div class="quiz-author__body form-grid">
      <div class="field"><label>Elementos disponibles</label><textarea class="input mono" name="p-${i}-elementos" rows="5" placeholder="e1 | Primer paso&#10;e2 | Segundo paso" required>${esc(elementos)}</textarea><span class="faint">Un elemento por línea: ID | texto.</span></div>
      <div class="field"><label>Orden correcto</label><input class="input mono" name="p-${i}-orden" value="${esc((p.ordenCorrecto || []).join(', '))}" placeholder="e2, e1, e3" required><span class="faint">IDs separados por coma. El alumno nunca recibe esta secuencia.</span></div>
    </div>`;
  }
  if (tipo === 'relacionar') {
    const pares = (p.izquierda || []).map((x) => { const derId = p.pares?.[x.id] || ''; const der = p.derecha?.find((y) => y.id === derId); return `${x.id} | ${x.texto} | ${derId} | ${der?.texto || ''}`; }).join('\n');
    return `<div class="field quiz-author__body"><label>Pares correctos</label><textarea class="input mono" name="p-${i}-pares" rows="6" placeholder="i1 | Concepto | d1 | Definición" required>${esc(pares)}</textarea><span class="faint">Una relación por línea: ID izquierdo | concepto | ID derecho | respuesta.</span></div>`;
  }
  const huecos = (p.huecos || []).map((h) => `${h.id} | ${h.etiqueta || ''} | ${(h.respuestas || []).join(' | ')}`).join('\n');
  return `<div class="stack quiz-author__body" style="gap:10px">
    <div class="field"><label>Texto o consigna</label><textarea class="input" name="p-${i}-plantilla" rows="2" placeholder="Completa los términos clave de la clase." required>${esc(p.plantilla || '')}</textarea></div>
    <div class="field"><label>Espacios y respuestas aceptadas</label><textarea class="input mono" name="p-${i}-huecos" rows="5" placeholder="h1 | Término 1 | respuesta | alias aceptado" required>${esc(huecos)}</textarea><span class="faint">ID | etiqueta | respuesta principal | alias opcionales.</span></div>
  </div>`;
}

export function adminQuiz(params: Record<string, string>) {
  const c = Datos.cursos().find((x) => x.id === params.cursoId);
  const n = Number(params.n);
  const k = c?.clases.find((x) => x.n === n);
  if (!c || !k) return vacio('Clase no encontrada', '', '<a class="btn btn--brand" href="#/admin/quizzes">Volver</a>');
  const q: Quiz = Datos.quiz(c.id, n) || { id: `${c.id}_${n}`, cursoId: c.id, n, estado: 'borrador', preguntas: [], actualizado: '' };
  return `
  <a class="section-head__cta" href="#/admin/quizzes" style="align-self:flex-start"><span class="circle-btn circle-btn--glass" style="width:34px;height:34px"><i data-lucide="arrow-left" class="i" style="width:15px;height:15px"></i></span>Quizzes</a>
  <form class="stack" style="gap:18px" data-form="quiz" data-id="${q.id}" data-curso="${c.id}" data-n="${n}">
    ${adminHead(`Quiz · clase ${n}`, `${esc(c.titulo)} · ${esc(k.titulo)}`,
      `<span class="chip ${q.estado === 'aprobado' ? 'chip--accent' : 'chip--warn'}">${q.estado === 'aprobado' ? 'Aprobado' : 'Borrador'}</span>
       <button class="btn btn--secondary" name="accion" value="borrador">Guardar borrador</button>
       <button class="btn btn--brand btn--pill-arrow" name="accion" value="aprobar">Aprobar y publicar <span class="arrow"><i data-lucide="check" class="i"></i></span></button>`)}
    ${q.preguntas.map((p, i) => `
    <div class="card card--pad stack quiz-author" style="gap:12px">
      <div class="row quiz-author__head" style="justify-content:space-between">
        <div><span class="eyebrow">Pregunta ${i + 1}</span><p class="faint">La respuesta se califica en el servidor.</p></div>
        <div class="row" style="flex-wrap:nowrap"><select class="input input--sm quiz-author__type" name="p-${i}-tipo" data-quiz-tipo aria-label="Tipo de interacción">${TIPOS_QUIZ.map(([v, l]) => `<option value="${v}" ${(p.tipo || 'seleccion') === v ? 'selected' : ''}>${l}</option>`).join('')}</select><button type="button" class="btn btn--ghost btn--icon btn--xs" data-quiz-accion="quitar:${i}" aria-label="Quitar pregunta"><i data-lucide="trash-2" class="i"></i></button></div>
      </div>
      <input type="hidden" name="p-${i}-id" value="${esc(p.id || `p${i + 1}`)}">
      <div class="field"><label>Pregunta</label><textarea class="input" name="p-${i}-q" rows="2" required>${esc(p.q)}</textarea></div>
      <div class="field"><label>Instrucción breve <span class="faint">(opcional)</span></label><input class="input" name="p-${i}-instruccion" value="${esc(p.instruccion || '')}" placeholder="Ej. Selecciona todas las que correspondan"></div>
      <label class="check-row"><input type="checkbox" name="p-${i}-compatible-retos" value="1" ${p.compatibleRetos !== false ? 'checked' : ''}><span><strong>Disponible en Retos</strong><small>Puede aparecer en sesiones de práctica adaptativa. La solución permanece en el servidor.</small></span></label>
      ${editorInteraccion(p, i)}
      <div class="field"><label>Retroalimentación explicativa</label><textarea class="input" name="p-${i}-explicacion" rows="2" required placeholder="Explica por qué, no solo cuál es la respuesta.">${esc(p.explicacion)}</textarea></div>
    </div>`).join('') || vacio('Sin preguntas', 'Se generan de la transcripción del video. También puedes escribirlas a mano.')}
    <button type="button" class="btn btn--secondary" style="justify-self:start" data-quiz-accion="agregar"><i data-lucide="plus" class="i"></i>Agregar pregunta</button>
  </form>`;
}

// ═══ MATERIALES ═══
export function adminMateriales() {
  const l = Datos.materiales();
  const estado = (e: string) => e === 'disponible' ? '<span class="chip chip--accent">Disponible</span>' : e === 'oculto' ? '<span class="chip">Oculto</span>' : '<span class="chip chip--warn">Próximamente</span>';
  return `
  ${adminHead('Materiales', `${l.length} recursos · ${l.filter((m) => m.estado === 'disponible').length} disponibles`,
    `<a class="btn btn--brand btn--pill-arrow" href="#/admin/materiales/nuevo">Nuevo material <span class="arrow"><i data-lucide="plus" class="i"></i></span></a>`)}
  <div data-bulk-materiales></div>
  <div class="card dtable-wrap"><table class="dtable" data-tabla="materiales">
    <thead><tr><th class="dtable__check"><input type="checkbox" data-bulk-all aria-label="Seleccionar todos"></th><th>Material</th><th>Tipo</th><th>Área</th><th>Págs.</th><th>Estado</th><th style="width:60px"></th></tr></thead>
    <tbody>${l.map((m) => `<tr data-material-fila="${m.id}">
      <td class="dtable__check"><input type="checkbox" data-bulk-item="${m.id}" aria-label="Seleccionar ${esc(m.titulo)}"></td>
      <td><a class="dtable__main dtable__main--book" href="#/admin/materiales/${m.id}"><img src="${m.portada}" alt=""><span><strong>${esc(m.titulo)}</strong><br><span class="faint">${esc(m.categoria)}</span></span></a></td>
      <td>${esc(m.tipo)}</td><td>${esc(m.area)}</td><td class="mono">${m.paginas}</td><td>${estado(m.estado)}</td>
      <td><a class="btn btn--ghost btn--icon btn--xs" href="#/admin/materiales/${m.id}"><i data-lucide="pencil" class="i"></i></a></td></tr>`).join('')}</tbody></table></div>`;
}

export function adminMaterial(params: Record<string, string>) {
  const nuevo = params.id === 'nuevo';
  const m: Material = nuevo ? { id: '', titulo: '', tipo: 'PDF', categoria: 'Guía clínica', area: '', autor: 'Equipo académico OdonTeck', paginas: 1, portada: '/materiales/portadas/guia-diagnostico-ortodoncico.webp', cursoId: null, descripcion: '', estado: 'proximamente', gratis: false, url: '' }
    : Datos.materiales().find((x) => x.id === params.id)!;
  if (!m) return vacio('Material no encontrado', '', '<a class="btn btn--brand" href="#/admin/materiales">Volver</a>');
  const cursos = Datos.cursos();
  return `
  <a class="section-head__cta" href="#/admin/materiales" style="align-self:flex-start"><span class="circle-btn circle-btn--glass" style="width:34px;height:34px"><i data-lucide="arrow-left" class="i" style="width:15px;height:15px"></i></span>Materiales</a>
  <form class="stack" style="gap:20px" data-form="material" data-id="${m.id}">
    ${adminHead(nuevo ? 'Nuevo material' : esc(m.titulo), 'PDF, libro o presentación para la biblioteca de miembros.',
      `${Datos.modo === 'api' && !nuevo ? `<button type="button" class="btn btn--secondary" data-descargar-material="${m.id}"><i data-lucide="file-text" class="i"></i>Abrir archivo</button>` : m.url ? `<a class="btn btn--secondary" href="${m.url}" target="_blank"><i data-lucide="file-text" class="i"></i>Abrir archivo</a>` : ''}<button class="btn btn--brand btn--pill-arrow">Guardar <span class="arrow"><i data-lucide="check" class="i"></i></span></button>`)}
    <div class="admin-grid">
      <div class="card card--pad stack" style="gap:14px">
        <div class="field"><label>Título</label><input class="input" name="titulo" value="${esc(m.titulo)}" required maxlength="120"></div>
        <div class="form-grid form-grid--3">
          <div class="field"><label>Tipo</label><select class="input" name="tipo">${opt(TIPOS, m.tipo)}</select></div>
          <div class="field"><label>Categoría</label><input class="input" name="categoria" value="${esc(m.categoria)}" placeholder="Guía clínica, Formato…"></div>
          <div class="field"><label>Páginas o láminas</label><input class="input" type="number" min="1" name="paginas" value="${m.paginas}"></div>
        </div>
        <div class="form-grid">
          <div class="field"><label>Área</label><input class="input" name="area" value="${esc(m.area)}" required></div>
          <div class="field"><label>Autor</label><input class="input" name="autor" value="${esc(m.autor)}"></div>
        </div>
        <div class="field"><label>Curso relacionado</label><select class="input" name="cursoId"><option value="">Recurso general</option>${cursos.map((c) => `<option value="${c.id}" ${m.cursoId === c.id ? 'selected' : ''}>${esc(c.titulo)}</option>`).join('')}</select></div>
        <div class="field"><label>Descripción</label><textarea class="input" name="descripcion" rows="3">${esc(m.descripcion)}</textarea></div>
        <div class="form-grid form-grid--3">
          <div class="field"><label>${Datos.modo === 'api' ? 'PDF' : 'Archivo'}</label>${Datos.modo === 'api' ? '<input class="input" type="file" name="archivoFile" accept="application/pdf"><span class="faint" style="font-size:var(--fs-xs)">Déjalo vacío para conservar el PDF actual.</span>' : `<input class="input mono" name="url" value="${esc(m.url || '')}" placeholder="/materiales/archivo.pdf">`}</div>
          <div class="field"><label>Estado</label><select class="input" name="estado">${[['disponible', 'Disponible'], ['proximamente', 'Próximamente'], ['oculto', 'Oculto']].map(([v, l]) => `<option value="${v}" ${m.estado === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
          <div class="field"><label>Acceso</label><select class="input" name="gratis"><option value="0" ${!m.gratis ? 'selected' : ''}>Solo VIP</option><option value="1" ${m.gratis ? 'selected' : ''}>Gratuito</option></select></div>
        </div>
        <p class="faint" style="font-size:var(--fs-xs)">${Datos.modo === 'demo' ? 'En modo demo el archivo se indica con su ruta. Con el backend conectado, aquí subes el PDF y se guarda en Firebase Storage con descarga solo para miembros.' : 'El PDF se guarda en Firebase Storage; la descarga es solo para miembros.'}</p>
      </div>
      <div class="card card--pad stack" style="gap:12px">
        <h3 class="admin-card-title">Portada 3:4</h3>
        <div class="cover-drop cover-drop--book"><img src="${m.portada}" alt="" data-preview="portada"><label class="btn btn--secondary btn--sm"><i data-lucide="upload" class="i"></i>Subir portada<input type="file" name="portadaFile" accept="image/*" hidden data-subir-imagen="portada"></label></div>
        <input type="hidden" name="portada" value="${esc(m.portada)}">
      </div>
    </div>
    ${!nuevo ? `<div class="card card--pad row" style="justify-content:space-between"><div><strong>Borrar material</strong><p class="faint" style="font-size:var(--fs-xs)">Si solo quieres esconderlo, cambia el estado a Oculto.</p></div><button type="button" class="btn btn--danger" data-borrar-material="${m.id}"><i data-lucide="trash-2" class="i"></i>Borrar</button></div>` : ''}
  </form>`;
}

// ═══ EN VIVO ═══
export function adminEnVivo() {
  const l = Datos.eventos();
  const ahora = Date.now();
  const fmt = (iso: string) => new Date(iso).toLocaleString('es-MX', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  return `
  ${adminHead('En vivo', `${l.filter((e) => new Date(e.fecha).getTime() > ahora).length} próximas · ${l.filter((e) => new Date(e.fecha).getTime() <= ahora).length} pasadas`,
    `<a class="btn btn--brand btn--pill-arrow" href="#/admin/en-vivo/nuevo">Programar clase <span class="arrow"><i data-lucide="plus" class="i"></i></span></a>`)}
  ${l.length ? `<div class="card dtable-wrap"><table class="dtable"><thead><tr><th>Clase</th><th>Fecha</th><th>Ponente</th><th>Reservas</th><th>Estado</th><th style="width:60px"></th></tr></thead><tbody>
    ${l.map((e) => `<tr><td><a href="#/admin/en-vivo/${e.id}"><strong>${esc(e.titulo)}</strong></a></td><td>${fmt(e.fecha)}</td><td>${esc(e.ponente)}</td><td class="mono">${e.reservas || 0}</td>
      <td>${new Date(e.fecha).getTime() <= ahora ? '<span class="chip">Pasada</span>' : e.publicado === false ? '<span class="chip">Oculta</span>' : '<span class="chip chip--live">Próxima</span>'}</td>
      <td><a class="btn btn--ghost btn--icon btn--xs" href="#/admin/en-vivo/${e.id}"><i data-lucide="pencil" class="i"></i></a></td></tr>`).join('')}</tbody></table></div>`
    : vacio('Sin clases en vivo programadas', 'Programa la próxima transmisión: aparece en el inicio de todos los miembros y pueden reservar lugar.', '<a class="btn btn--brand" href="#/admin/en-vivo/nuevo">Programar clase</a>')}`;
}

export function adminEvento(params: Record<string, string>) {
  const nuevo = params.id === 'nuevo';
  const e: Evento = nuevo ? { id: '', titulo: '', ponente: '', fecha: new Date(Date.now() + 7 * 864e5).toISOString(), duracionMin: 90, enlace: '', cursoId: '', publicado: true }
    : Datos.eventos().find((x) => x.id === params.id)!;
  if (!e) return vacio('Clase no encontrada', '', '<a class="btn btn--brand" href="#/admin/en-vivo">Volver</a>');
  const local = new Date(new Date(e.fecha).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  return `
  <a class="section-head__cta" href="#/admin/en-vivo" style="align-self:flex-start"><span class="circle-btn circle-btn--glass" style="width:34px;height:34px"><i data-lucide="arrow-left" class="i" style="width:15px;height:15px"></i></span>En vivo</a>
  <form class="stack" style="gap:20px;max-width:820px" data-form="evento" data-id="${e.id}">
    ${adminHead(nuevo ? 'Programar clase en vivo' : esc(e.titulo), 'Se muestra en Inicio y En vivo; los miembros pueden reservar.', `<button class="btn btn--brand btn--pill-arrow">Guardar <span class="arrow"><i data-lucide="check" class="i"></i></span></button>`)}
    <div class="card card--pad stack" style="gap:14px">
      <div class="field"><label>Título</label><input class="input" name="titulo" value="${esc(e.titulo)}" required></div>
      <div class="form-grid form-grid--3">
        <div class="field"><label>Fecha y hora</label><input class="input" type="datetime-local" name="fecha" value="${local}" required></div>
        <div class="field"><label>Duración (min)</label><input class="input" type="number" min="15" name="duracionMin" value="${e.duracionMin}"></div>
        <div class="field"><label>Visible</label><select class="input" name="publicado"><option value="1" ${e.publicado !== false ? 'selected' : ''}>Sí</option><option value="0" ${e.publicado === false ? 'selected' : ''}>No</option></select></div>
      </div>
      <div class="field"><label>Ponente</label><input class="input" name="ponente" value="${esc(e.ponente)}" required></div>
      <div class="field"><label>Enlace de la transmisión (Zoom, Meet, YouTube)</label><input class="input" type="url" name="enlace" value="${esc(e.enlace || '')}" placeholder="https://"></div>
      <div class="field"><label>Curso grabado cuando se suba (opcional)</label><select class="input" name="cursoId"><option value="">Aún no</option>${Datos.cursos().map((c) => `<option value="${c.id}" ${e.cursoId === c.id ? 'selected' : ''}>${esc(c.titulo)}</option>`).join('')}</select></div>
    </div>
    ${!nuevo ? `<div class="card card--pad row" style="justify-content:space-between"><strong>Borrar clase en vivo</strong><button type="button" class="btn btn--danger" data-borrar-evento="${e.id}"><i data-lucide="trash-2" class="i"></i>Borrar</button></div>` : ''}
  </form>`;
}

export const callout = (titulo: string, texto: string) => `<div class="admin-callout"><i data-lucide="info" class="i"></i><div><strong>${titulo}</strong><p>${texto}</p></div></div>`;
