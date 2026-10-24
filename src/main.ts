import '@fontsource-variable/outfit/wght.css';
import '@fontsource-variable/inter/opsz.css';
import '@fontsource-variable/jetbrains-mono/index.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/active.css';
import './styles/inicio.css';
import './styles/curso-gratis.css';
import './styles/admin.css';
import './styles/login.css';
import './styles/arcade.css';
import './styles/herramientas.css';
import './styles/comunidad.css';
import './styles/encuestas.css';
import './styles/bienvenida.css';
import './styles/brujula.css';
import './styles/encuesta-modal.css';
import './styles/perfil.css';
import './styles/recompensas.css';
import './styles/visor.css';
import './styles/juego-clase.css';
import { createIcons, icons } from 'lucide';
import { route, startRouter, onRender, onBeforeRender, current, navigate, render } from './core/router';
import { shellHTML, marcarNavActivo } from './ui/shell';
import { adminShellHTML, marcarAdminActivo } from './admin/shell';
import { instalarAccionesAdmin } from './admin/acciones';
import { Auth, api, mensajeError } from './core/auth';
import { Datos, type Pregunta } from './core/datos';
import { descargarRepasoPDF } from './core/repaso-pdf';
import { Progreso } from './core/progreso';
import { Perfil } from './core/perfil';
import { Comunidad } from './core/comunidad';
import { curso as getCurso, cursos as catalogoCursos } from './core/catalogo';
import { esc } from './ui/partials';
import { inicio } from './pages/inicio';
import { catalogo } from './pages/cursos';
import { curso } from './pages/curso';
import { clase } from './pages/clase';
import { biblioteca, material } from './pages/materiales';
import { visor, montarVisor } from './pages/visor';
import { toggleReserva } from './pages/envivo';
import { comunidad, directorio, hilo } from './pages/comunidad';
import { paginaLogros } from './pages/logros';
import { paginaRecompensas } from './pages/recompensas';
import { retos, montarArcade } from './pages/retos';
import { Acceso, mostrarPaywall } from './core/acceso';
import { cargarClub, invalidarComunidad, invalidarDirectorio, marcarHiloFresco } from './core/remoto';
import { Admin, cargarAdmin, canjearCuponMiembro } from './core/admin';
import { mostrarOnboarding } from './ui/onboarding';
import { abrirJuegoClase } from './ui/juego-clase';
import { juegoClaseCompletado, type RegistroJuegoClase, type TipoJuegoClase } from './core/juego-clase';
import { desmontarCursoGratis, mostrarEleccionCursoGratis, montarCursoGratis } from './ui/curso-gratis';
import { cursoGratisPagina } from './pages/curso-gratis';
import { CursoGratis } from './core/curso-gratis';
import { cargarEncuestas, encuestaPendiente, guardarIntereses, reiniciarEncuestas } from './core/encuestas';
import { mostrarEncuestaPendiente } from './ui/encuesta';
import { bienvenida, montarBienvenida, DESTINO_KEY } from './pages/bienvenida';
import { brujula, montarBrujula } from './pages/brujula';
import { certificados, certificado, verificar } from './pages/certificados';
import { buscar } from './pages/buscar';
import { praxia, perfil, suscripcion, configuracion, mas } from './pages/cuenta';
import { herramientas, herramienta } from './pages/herramientas';
import { login } from './pages/login';
import { Recompensas } from './core/recompensas';
import { puntos } from './core/logros';
import { Directorio, prepararBannerDirectorio, prepararFotoDirectorio, type ImagenDirectorioPreparada } from './core/directorio';
import { adminCursos, adminCurso, adminQuizzes, adminQuiz, adminMateriales, adminMaterial, adminEnVivo, adminEvento } from './admin/contenido';
import { adminResumen, adminMiembros, adminMiembro, adminComunidad, adminAvisos, adminAjustes, adminEncuestas, adminCupones } from './admin/gestion';

type PlayerJsInstance = {
  on(evento: string, callback: (datos?: unknown) => void): void;
  setCurrentTime(segundos: number): void;
  play(): void;
};
declare global {
  interface Window { playerjs?: { Player: new (elemento: HTMLIFrameElement | string) => PlayerJsInstance } }
}

const videosFinalizados = new Set<string>();
const reproductoresVideo = new Map<string, PlayerJsInstance>();
const NOTAS_REPASO_KEY = 'odonteck-club:notas-repaso:v1';
const NOTAS_PERSONALES_KEY = 'odonteck-club:notas-personales:v1';
const INTENTOS_QUIZ_KEY = 'odonteck-club:intentos:v2';
type NotaRemota = { repasados: number[]; bitacora: string };
const notasRemotas = new Map<string, NotaRemota>();
const temporizadoresNotas = new Map<string, number>();
const revisionesNotas = new Map<string, number>();
const colasNotas = new Map<string, Promise<void>>();
const claveRemotaNotas = (clave: string, uid = Auth.usuario?.uid || '') => `${uid}:${clave}`;

type ResumenIntentoQuiz = { numero: number; mejorPuntaje: number; aprobadoAlgunaVez: boolean; versionQuiz: number; fecha: string };

function leerNotasRepasadas(): Record<string, number[]> {
  if (Datos.modo === 'api') {
    const prefijo = `${Auth.usuario?.uid || ''}:`;
    return Object.fromEntries([...notasRemotas].filter(([clave]) => clave.startsWith(prefijo)).map(([clave, nota]) => [clave.slice(prefijo.length), nota.repasados]));
  }
  try {
    const valor = JSON.parse(localStorage.getItem(NOTAS_REPASO_KEY) || '{}');
    return valor && typeof valor === 'object' && !Array.isArray(valor) ? valor : {};
  } catch { return {}; }
}

function escribirNotasRepasadas(valor: Record<string, number[]>) {
  if (Datos.modo === 'api') {
    for (const [clave, repasados] of Object.entries(valor)) {
      const claveUid = claveRemotaNotas(clave);
      const anterior = notasRemotas.get(claveUid) || { repasados: [], bitacora: '' };
      notasRemotas.set(claveUid, { ...anterior, repasados });
      programarGuardadoNotas(clave);
    }
    return;
  }
  try { localStorage.setItem(NOTAS_REPASO_KEY, JSON.stringify(valor)); } catch {}
}

function leerNotasPersonales(): Record<string, string> {
  if (Datos.modo === 'api') {
    const prefijo = `${Auth.usuario?.uid || ''}:`;
    return Object.fromEntries([...notasRemotas].filter(([clave]) => clave.startsWith(prefijo)).map(([clave, nota]) => [clave.slice(prefijo.length), nota.bitacora]));
  }
  try {
    const valor = JSON.parse(localStorage.getItem(NOTAS_PERSONALES_KEY) || '{}');
    return valor && typeof valor === 'object' && !Array.isArray(valor) ? valor : {};
  } catch { return {}; }
}

function escribirNotasPersonales(valor: Record<string, string>) {
  if (Datos.modo === 'api') {
    for (const [clave, bitacora] of Object.entries(valor)) {
      const claveUid = claveRemotaNotas(clave);
      const anterior = notasRemotas.get(claveUid) || { repasados: [], bitacora: '' };
      notasRemotas.set(claveUid, { ...anterior, bitacora });
      programarGuardadoNotas(clave);
    }
    return;
  }
  try { localStorage.setItem(NOTAS_PERSONALES_KEY, JSON.stringify(valor)); } catch {}
}

function estadoGuardadoNotas(panel: HTMLElement, mensaje: string) {
  const estado = panel.querySelector<HTMLElement>('[data-notas-save-state]');
  const retry = panel.querySelector<HTMLButtonElement>('[data-notas-retry]');
  if (estado) estado.textContent = mensaje;
  if (retry) {
    retry.hidden = !mensaje.includes('Reintenta');
    retry.dataset.notasRetryMode = mensaje.startsWith('No se pudo cargar') ? 'load' : 'save';
  }
}

function habilitarEdicionNotas(panel: HTMLElement, habilitar: boolean) {
  panel.querySelectorAll<HTMLButtonElement>('[data-nota-check]').forEach((button) => { button.disabled = !habilitar; });
  const textarea = panel.querySelector<HTMLTextAreaElement>('[data-notas-personal]');
  if (textarea) textarea.disabled = !habilitar;
}

async function cargarNotasRemotas(panel: HTMLElement) {
  const clave = panel.dataset.notasBoard || '';
  const uid = Auth.usuario?.uid || '';
  if (!uid) { estadoGuardadoNotas(panel, 'Inicia sesión para sincronizar tus notas.'); return; }
  const [cursoId, n] = clave.split(':');
  if (!cursoId || !n) return;
  panel.dataset.notasLoading = 'true';
  habilitarEdicionNotas(panel, false);
  estadoGuardadoNotas(panel, 'Cargando tus notas…');
  try {
    const datos = await api<NotaRemota>(`/notas-clase/${encodeURIComponent(cursoId)}/${encodeURIComponent(n)}`);
    const nota = { repasados: Array.isArray(datos.repasados) ? datos.repasados : [], bitacora: typeof datos.bitacora === 'string' ? datos.bitacora : '' };
    if (Auth.usuario?.uid !== uid) return;
    notasRemotas.set(claveRemotaNotas(clave, uid), nota);
    panel.dataset.notasLoading = 'false';
    refrescarNotas(panel);
    refrescarNotaPersonal(panel);
    habilitarEdicionNotas(panel, true);
    estadoGuardadoNotas(panel, 'Sincronizado con tu cuenta');
  } catch {
    if (Auth.usuario?.uid !== uid) return;
    panel.dataset.notasLoading = 'error';
    estadoGuardadoNotas(panel, 'No se pudo cargar. Reintenta la sincronización.');
  }
}

function programarGuardadoNotas(clave: string) {
  if (Datos.modo !== 'api') return;
  const uid = Auth.usuario?.uid || '';
  if (!uid) return;
  const claveUid = claveRemotaNotas(clave, uid);
  const panel = [...document.querySelectorAll<HTMLElement>('[data-notas-board]')].find((x) => x.dataset.notasBoard === clave);
  if (!panel || panel.dataset.notasLoading === 'true' || panel.dataset.notasLoading === 'error') return;
  const [cursoId, n] = clave.split(':');
  const revision = (revisionesNotas.get(claveUid) || 0) + 1;
  revisionesNotas.set(claveUid, revision);
  const anterior = temporizadoresNotas.get(claveUid);
  if (anterior) window.clearTimeout(anterior);
  estadoGuardadoNotas(panel, 'Guardando en tu cuenta…');
  temporizadoresNotas.set(claveUid, window.setTimeout(() => {
    temporizadoresNotas.delete(claveUid);
    const previo = colasNotas.get(claveUid) || Promise.resolve();
    const trabajo = previo.catch(() => {}).then(async () => {
      if (Auth.usuario?.uid !== uid) return;
      const nota = notasRemotas.get(claveUid) || { repasados: [], bitacora: '' };
      try {
        const guardada = await api<NotaRemota>(`/notas-clase/${encodeURIComponent(cursoId)}/${encodeURIComponent(n)}`, {
          method: 'PUT', json: nota,
        });
        if (revisionesNotas.get(claveUid) === revision && Auth.usuario?.uid === uid) {
          notasRemotas.set(claveUid, { repasados: guardada.repasados, bitacora: guardada.bitacora });
          estadoGuardadoNotas(panel, 'Guardado en tu cuenta');
        }
      } catch {
        if (revisionesNotas.get(claveUid) === revision && Auth.usuario?.uid === uid) estadoGuardadoNotas(panel, 'No se pudo guardar. Reintenta la sincronización.');
      }
    });
    colasNotas.set(claveUid, trabajo);
    void trabajo.finally(() => { if (colasNotas.get(claveUid) === trabajo) colasNotas.delete(claveUid); });
  }, 500));
}

function refrescarNotaPersonal(panel: HTMLElement) {
  const clave = panel.dataset.notasBoard || '';
  const textarea = panel.querySelector<HTMLTextAreaElement>('[data-notas-personal]');
  if (!textarea) return;
  textarea.value = leerNotasPersonales()[clave] || '';
  const contador = panel.querySelector<HTMLElement>('[data-notas-characters]');
  if (contador) contador.textContent = String(textarea.value.length);
}

function refrescarNotas(panel: HTMLElement) {
  const clave = panel.dataset.notasBoard || '';
  const total = Number(panel.dataset.notasTotal || 0);
  const guardadas = new Set((leerNotasRepasadas()[clave] || []).map(Number));
  panel.querySelectorAll<HTMLElement>('[data-nota-item]').forEach((item) => {
    const indice = Number(item.dataset.notaItem);
    const completada = guardadas.has(indice);
    item.classList.toggle('is-done', completada);
    const boton = item.querySelector<HTMLButtonElement>('[data-nota-check]');
    if (!boton) return;
    boton.classList.toggle('is-active', completada);
    boton.setAttribute('aria-pressed', String(completada));
    boton.setAttribute('aria-label', `${completada ? 'Marcar como pendiente' : 'Marcar como repasado'} el concepto ${indice + 1}`);
    boton.innerHTML = completada
      ? '<i data-lucide="badge-check" class="i"></i><span>Dominado</span>'
      : '<i data-lucide="circle" class="i"></i><span>Repasar</span>';
  });
  const completadas = [...guardadas].filter((indice) => indice >= 0 && indice < total).length;
  const porcentaje = total ? Math.round(completadas / total * 100) : 0;
  const contador = panel.querySelector<HTMLElement>('[data-notas-done]');
  const porcentajeEl = panel.querySelector<HTMLElement>('[data-notas-percent]');
  const anillo = panel.querySelector<HTMLElement>('.notas-pro__ring');
  if (contador) contador.textContent = String(completadas);
  if (porcentajeEl) porcentajeEl.textContent = `${porcentaje}%`;
  if (anillo) anillo.style.setProperty('--notes-progress', String(porcentaje));
}

function hidratarNotas() {
  document.querySelectorAll<HTMLElement>('[data-notas-board]').forEach((panel) => {
    refrescarNotas(panel);
    refrescarNotaPersonal(panel);
    if (Datos.modo === 'api') void cargarNotasRemotas(panel);
  });
}

const normalizarRespuesta = (v: unknown) => String(v ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
function calificarPreguntaDemo(p: Pregunta, respuesta: unknown) {
  const tipo = p.tipo || 'seleccion';
  let puntos = 0;
  let respuestaCorrecta: unknown;
  if (tipo === 'seleccion') {
    puntos = respuesta === p.correcta ? 1 : 0; respuestaCorrecta = p.correcta;
  } else if (tipo === 'seleccion_multiple') {
    const elegidas = new Set(Array.isArray(respuesta) ? respuesta.map(Number) : []); const correctas = new Set(p.correctas || []);
    const aciertos = [...elegidas].filter((x) => correctas.has(x)).length; const errores = [...elegidas].filter((x) => !correctas.has(x)).length;
    puntos = Math.max(0, aciertos / Math.max(1, correctas.size) - errores / Math.max(1, (p.opciones?.length || 0) - correctas.size)); respuestaCorrecta = [...correctas];
  } else if (tipo === 'ordenar') {
    const orden = Array.isArray(respuesta) ? respuesta.map(String) : []; const correcta = p.ordenCorrecto || [];
    const pares = correcta.slice(0, -1).map((id, j) => `${id}>${correcta[j + 1]}`); const delUsuario = new Set(orden.slice(0, -1).map((id, j) => `${id}>${orden[j + 1]}`));
    puntos = pares.length ? pares.filter((x) => delUsuario.has(x)).length / pares.length : Number(orden.join('|') === correcta.join('|')); respuestaCorrecta = correcta;
  } else if (tipo === 'relacionar') {
    const r = respuesta && typeof respuesta === 'object' ? respuesta as Record<string, string> : {}; const pares = p.pares || {}; const ids = Object.keys(pares);
    puntos = ids.length ? ids.filter((id) => r[id] === pares[id]).length / ids.length : 0; respuestaCorrecta = pares;
  } else {
    const r = respuesta && typeof respuesta === 'object' ? respuesta as Record<string, string> : {}; const huecos = p.huecos || [];
    puntos = huecos.length ? huecos.filter((h) => (h.respuestas || []).some((x) => normalizarRespuesta(x) === normalizarRespuesta(r[h.id]))).length / huecos.length : 0;
    respuestaCorrecta = Object.fromEntries(huecos.map((h) => [h.id, h.respuestas?.[0] || '']));
  }
  puntos = Math.round(Math.max(0, Math.min(1, puntos)) * 1000) / 1000;
  return { correcta: tipo === 'seleccion' ? p.correcta : undefined, respuestaCorrecta, acertada: puntos === 1, puntos, explicacion: p.explicacion, referenciaVideo: p.referenciaVideo };
}

function registrarIntentoQuizDemo(clave: string, versionQuiz: number, resultado: {
  correctas: number; total: number; puntaje: number; aprobado: boolean; respuestas: unknown[]; confianzas: number[]; justificaciones: string[];
}): ResumenIntentoQuiz {
  const fecha = new Date().toISOString();
  try {
    const todo = JSON.parse(localStorage.getItem(INTENTOS_QUIZ_KEY) || '{}') as Record<string, any>;
    const previo = todo[clave] && typeof todo[clave] === 'object' ? todo[clave] : {};
    const numero = Math.max(Number(previo.intentos) || 0, Array.isArray(previo.historial) ? previo.historial.length : 0) + 1;
    const mejorPuntaje = Math.max(Number(previo.mejorPuntaje) || 0, resultado.puntaje);
    const aprobadoAlgunaVez = previo.aprobadoAlgunaVez === true || resultado.aprobado;
    const confianzaPromedio = Math.round(resultado.confianzas.reduce((suma, valor) => suma + valor, 0) / Math.max(1, resultado.confianzas.length) * 100) / 100;
    const historial = [...(Array.isArray(previo.historial) ? previo.historial : []), {
      numero, versionQuiz, fecha, ...resultado, confianzaPromedio,
    }].slice(-10);
    todo[clave] = { intentos: numero, mejorPuntaje, aprobadoAlgunaVez, ultimoPuntaje: resultado.puntaje, fecha, historial };
    localStorage.setItem(INTENTOS_QUIZ_KEY, JSON.stringify(todo));
    return { numero, mejorPuntaje, aprobadoAlgunaVez, versionQuiz, fecha };
  } catch {
    return { numero: 1, mejorPuntaje: resultado.puntaje, aprobadoAlgunaVez: resultado.aprobado, versionQuiz, fecha };
  }
}

function segundosDeMarca(marca: string) {
  const partes = marca.split(':').map(Number);
  if (partes.some((n) => !Number.isFinite(n)) || partes.length < 2 || partes.length > 3) return null;
  return partes.reduce((total, n) => total * 60 + n, 0);
}

function solucionEsperadaHTML(p: Pregunta, respuestaCorrecta: unknown) {
  const tipo = p.tipo || 'seleccion';
  let lineas: string[] = [];
  if (tipo === 'seleccion') {
    const indice = Number(respuestaCorrecta);
    if (Number.isInteger(indice) && p.opciones?.[indice]) lineas = [p.opciones[indice]];
  } else if (tipo === 'seleccion_multiple') {
    lineas = (Array.isArray(respuestaCorrecta) ? respuestaCorrecta : []).map((indice) => p.opciones?.[Number(indice)]).filter((x): x is string => !!x);
  } else if (tipo === 'ordenar') {
    const mapa = new Map((p.elementos || []).map((x) => [x.id, x.texto]));
    const orden = (Array.isArray(respuestaCorrecta) ? respuestaCorrecta : []).map((id) => mapa.get(String(id))).filter((x): x is string => !!x);
    if (orden.length) return `<ol class="quiz-feedback__sequence">${orden.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>`;
  } else if (tipo === 'relacionar' && respuestaCorrecta && typeof respuestaCorrecta === 'object') {
    const izquierda = new Map((p.izquierda || []).map((x) => [x.id, x.texto]));
    const derecha = new Map((p.derecha || []).map((x) => [x.id, x.texto]));
    lineas = Object.entries(respuestaCorrecta as Record<string, unknown>).map(([a, b]) => `${izquierda.get(a) || a} → ${derecha.get(String(b)) || String(b)}`);
  } else if (tipo === 'completar' && respuestaCorrecta && typeof respuestaCorrecta === 'object') {
    const huecos = new Map((p.huecos || []).map((h) => [h.id, h.etiqueta || h.id]));
    lineas = Object.entries(respuestaCorrecta as Record<string, unknown>).map(([id, valor]) => `${huecos.get(id) || id}: ${String(valor)}`);
  }
  return lineas.length ? `<ul>${lineas.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : '<p>Consulta la explicación clínica para reconstruir la decisión.</p>';
}

function respuestaUsuarioHTML(p: Pregunta, respuesta: unknown) {
  if (respuesta === null || respuesta === undefined || (Array.isArray(respuesta) && !respuesta.length)) return '<p class="quiz-feedback__empty">No se registró una respuesta.</p>';
  return solucionEsperadaHTML(p, respuesta);
}

function preguntaQuizCompleta(fs: HTMLElement) {
  const tipo = fs.dataset.tipo || 'seleccion';
  let respuestaCompleta = false;
  if (tipo === 'seleccion' || tipo === 'seleccion_multiple') respuestaCompleta = !!fs.querySelector<HTMLInputElement>('.quiz__opt input:checked');
  else if (tipo === 'ordenar') {
    const orden = [...fs.querySelectorAll<HTMLInputElement>('[data-sort-answer]')];
    respuestaCompleta = orden.every((x) => x.value) && new Set(orden.map((x) => x.value)).size === orden.length;
  } else respuestaCompleta = [...fs.querySelectorAll<HTMLInputElement | HTMLSelectElement>('.quiz__interactive input[required], .quiz__interactive select[required]')].every((x) => x.value.trim());
  return respuestaCompleta && !!fs.querySelector<HTMLInputElement>('[data-confidence-input]')?.value;
}

function faltaPreguntaQuiz(fs: HTMLElement) {
  const tipo = fs.dataset.tipo || 'seleccion';
  const tieneRespuesta = tipo === 'seleccion' || tipo === 'seleccion_multiple'
    ? !!fs.querySelector<HTMLInputElement>('.quiz__opt input:checked')
    : tipo === 'ordenar'
      ? !!fs.querySelector<HTMLInputElement>('[data-sort-answer]')
      : [...fs.querySelectorAll<HTMLInputElement | HTMLSelectElement>('.quiz__interactive input[required], .quiz__interactive select[required]')].every((x) => x.value.trim());
  return !tieneRespuesta ? 'Construye primero tu respuesta.' : 'Indica qué tan segura es tu decisión.';
}

function mostrarPasoQuiz(form: HTMLFormElement, paso: number) {
  const preguntas = [...form.querySelectorAll<HTMLElement>('[data-pregunta]')];
  if (!preguntas.length) return;
  const actual = Math.max(0, Math.min(preguntas.length - 1, paso));
  form.dataset.paso = String(actual);
  preguntas.forEach((q, i) => {
    q.hidden = i !== actual; q.classList.toggle('is-active', i === actual);
    if (preguntaQuizCompleta(q)) q.classList.remove('quiz-q--attention');
  });
  form.querySelectorAll<HTMLButtonElement>('[data-quiz-ir]').forEach((b, i) => {
    b.classList.toggle('is-active', i === actual);
    b.classList.toggle('is-complete', preguntaQuizCompleta(preguntas[i]));
    b.classList.toggle('is-flagged', preguntas[i].dataset.flagged === '1');
    b.setAttribute('aria-current', i === actual ? 'step' : 'false');
  });
  const activada = preguntas[actual];
  const competencia = form.querySelector<HTMLElement>('[data-coach-competencia]'); if (competencia) competencia.textContent = activada.dataset.competencia || 'Criterio clínico aplicado';
  const nivel = form.querySelector<HTMLElement>('[data-coach-nivel]'); if (nivel) nivel.textContent = activada.dataset.nivel || 'Aplicar';
  const completadas = preguntas.filter(preguntaQuizCompleta).length;
  const porRevisar = preguntas.filter((q) => q.dataset.flagged === '1').length;
  const completas = form.querySelector<HTMLElement>('[data-coach-complete]'); if (completas) completas.textContent = `${completadas}/${preguntas.length}`;
  const flags = form.querySelector<HTMLElement>('[data-coach-flags]'); if (flags) flags.textContent = String(porRevisar);
  const porcentaje = Math.round(((actual + 1) / preguntas.length) * 100);
  const texto = form.querySelector<HTMLElement>('[data-quiz-progress-text]'); if (texto) texto.textContent = `Pregunta ${actual + 1} de ${preguntas.length}`;
  const percent = form.querySelector<HTMLElement>('[data-quiz-progress-percent]'); if (percent) percent.textContent = `${porcentaje}%`;
  const barra = form.querySelector<HTMLElement>('[data-quiz-progress-fill]'); if (barra) barra.style.width = `${porcentaje}%`;
  const anterior = form.querySelector<HTMLButtonElement>('[data-quiz-nav="-1"]'); if (anterior) anterior.hidden = actual === 0;
  const siguiente = form.querySelector<HTMLButtonElement>('[data-quiz-nav="1"]'); if (siguiente) siguiente.hidden = actual === preguntas.length - 1;
  const enviar = form.querySelector<HTMLButtonElement>('[data-quiz-submit]'); if (enviar) enviar.hidden = actual !== preguntas.length - 1;
  preguntas[actual].focus({ preventScroll: true });
}

function renumerarOrdenQuiz(lista: HTMLElement) {
  const quiz = lista.closest<HTMLElement>('[data-quiz-sort]'); if (!quiz) return;
  const indice = quiz.dataset.quizSort;
  const filas = [...lista.querySelectorAll<HTMLElement>('[data-sort-item]')];
  filas.forEach((fila, pos) => {
    const numero = fila.querySelector<HTMLElement>('[data-sort-position]'); if (numero) numero.textContent = String(pos + 1);
    const input = fila.querySelector<HTMLInputElement>('input[type="hidden"]'); if (input) input.name = `r${indice}-${pos}`;
    const botones = fila.querySelectorAll<HTMLButtonElement>('[data-quiz-move]');
    if (botones[0]) botones[0].disabled = pos === 0;
    if (botones[1]) botones[1].disabled = pos === filas.length - 1;
  });
}

// ── Tema: claro por defecto, siempre. El cambio solo dura la sesión ──
const root = document.documentElement;
function setTheme(t: 'light' | 'dark') {
  root.dataset.theme = t;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t === 'dark' ? '#0d1220' : '#f6f5f1');
  document.querySelectorAll<HTMLElement>('[data-theme-toggle] [data-lucide], [data-theme-toggle] svg').forEach((i) => i.setAttribute('data-lucide', t === 'dark' ? 'sun' : 'moon'));
  document.querySelectorAll<HTMLImageElement>('[data-logo]').forEach((img) => {
    const admin = !!img.closest('.sidebar--admin');
    img.src = admin || t === 'dark' ? '/brand/logo-horizontal-dark.png' : '/brand/logo-horizontal.png';
  });
  createIcons({ icons });
}

// ── Avisos breves ──
function toast(msg: string, icon = 'check') {
  let host = document.querySelector('.toast-host');
  if (!host) { host = document.createElement('div'); host.className = 'toast-host'; document.body.appendChild(host); }
  const esError = icon === 'alert-triangle' || icon === 'shield-alert' || icon === 'x-circle';
  const t = document.createElement('div'); t.className = `toast${esError ? ' toast--error' : ''}`; t.innerHTML = `<i data-lucide="${icon}" class="i"></i>${esc(msg)}`;
  host.appendChild(t); createIcons({ icons }); setTimeout(() => t.remove(), 3200);
}

type PremioActividad = { puntosGanados?: number; logrosNuevos?: { titulo?: string }[] } | null | undefined;
function registrarPremio(premio: PremioActividad) {
  if (!premio || (!premio.puntosGanados && !premio.logrosNuevos?.length)) return;
  window.dispatchEvent(new CustomEvent('recompensas:ganadas', { detail: premio }));
}

// Si el proveedor deja de servir una foto, retiramos sólo la imagen y quedan
// visibles las iniciales que ya están debajo como respaldo accesible.
document.addEventListener('error', (e) => {
  const img = e.target;
  if (img instanceof HTMLImageElement && img.matches('[data-avatar-image]')) img.remove();
}, true);

// ── Cascarones: miembro, admin o pantalla sola (login) ──
let shellActual: 'miembro' | 'admin' | 'solo' | null = null;
let fotoDirectorioPendiente: ImagenDirectorioPreparada | null = null;
let quitarFotoDirectorio = false;
let bannerDirectorioPendiente: ImagenDirectorioPreparada | null = null;
let quitarBannerDirectorio = false;
function limpiarFotoDirectorioPendiente() {
  if (fotoDirectorioPendiente) URL.revokeObjectURL(fotoDirectorioPendiente.preview);
  if (bannerDirectorioPendiente) URL.revokeObjectURL(bannerDirectorioPendiente.preview);
  fotoDirectorioPendiente = null;
  bannerDirectorioPendiente = null;
  quitarFotoDirectorio = false;
  quitarBannerDirectorio = false;
}
function montar(tipo: 'miembro' | 'admin' | 'solo') {
  if (shellActual === tipo) return;
  shellActual = tipo;
  document.getElementById('app')!.innerHTML = tipo === 'miembro' ? shellHTML() : tipo === 'admin' ? adminShellHTML() : '<main id="outlet"></main>';
  setTheme(root.dataset.theme === 'dark' ? 'dark' : 'light');
  actualizarNotifs();
}
function remontar() { const t = shellActual; shellActual = null; if (t) montar(t); render(); }

const MARCA_BIENVENIDA = 'odt:bienvenida-ok:';
let esqueletoPendiente = 0;
let rutaPintada: string | null = null;
let cascaronProvisional = false;
function bienvenidaResuelta(uid: string) {
  try { return localStorage.getItem(MARCA_BIENVENIDA + uid) === '1'; } catch { return false; }
}
function recordarBienvenida(uid: string, resuelta: boolean) {
  try { if (resuelta) localStorage.setItem(MARCA_BIENVENIDA + uid, '1'); else localStorage.removeItem(MARCA_BIENVENIDA + uid); } catch {}
}
function pintarEsqueleto(uid: string) {
  if (shellActual !== 'miembro') {
    // Sin la marca no sabemos si la entrevista de bienvenida va a redirigir: se espera como antes.
    if (shellActual || !bienvenidaResuelta(uid) || !Auth.perfilResuelto()) return;
    montar('miembro');
    cascaronProvisional = true;
  }
  const outlet = document.getElementById('outlet');
  if (!outlet) return;
  outlet.innerHTML = '<div class="card card--pad row" style="justify-content:center;min-height:180px"><i data-lucide="loader-circle" class="i spin"></i><span>Cargando…</span></div>';
  createIcons({ icons });
}

onBeforeRender(async (path) => {
  clearTimeout(esqueletoPendiente);
  await Auth.iniciar();
  const u = Auth.usuario;
  if (path.startsWith('/verificar')) { montar('solo'); return true; }
  if (path === '/login') {
    if (u) { navigate(sessionStorage.getItem('odt:volver') || '/'); return false; }
    montar('solo'); return true;
  }
  if (!u) { sessionStorage.setItem('odt:volver', location.hash.slice(1) || '/'); navigate('/login'); return false; }
  if (path.startsWith('/admin')) {
    await Auth.perfil();
    if (!Auth.usuario?.esAdmin) { toast('Tu cuenta no tiene acceso al panel de administración', 'shield-alert'); navigate('/'); return false; }
    // El panel hidrata el foro con su propia vista y modera el directorio: al volver se recargan.
    invalidarComunidad(); invalidarDirectorio();
    montar('admin');
    const outlet = document.getElementById('outlet');
    if (outlet) outlet.innerHTML = '<div class="card card--pad row" style="justify-content:center;min-height:180px"><i data-lucide="loader-circle" class="i spin"></i><span>Cargando datos administrativos…</span></div>';
    createIcons({ icons });
    await cargarAdmin(path, current().query);
    return true;
  }
  clearTimeout(esqueletoPendiente);
  const esqueleto = path !== '/bienvenida' && path !== '/curso-gratis' && path !== rutaPintada
    ? window.setTimeout(() => { if (current().path === path && rutaPintada !== path) pintarEsqueleto(u.uid); }, 150)
    : 0;
  esqueletoPendiente = esqueleto;
  // Auth.perfil() trae esVip desde /me: los paywalls del render dependen de él.
  const [, , encuestasListas] = await Promise.all([Auth.perfil(), cargarClub(path, false, path === rutaPintada).catch(() => {}), cargarEncuestas().then(() => true, () => false)]);
  clearTimeout(esqueleto);
  // Render superado (cierre de sesión, otra ruta o el admin) mientras se cargaba: no montar nada desde aquí.
  if (Auth.usuario?.uid !== u.uid || current().path !== path) return false;
  // El cascarón montado antes de tener catálogo y puntos se vuelve a pintar con los datos ya cargados.
  if (cascaronProvisional) { cascaronProvisional = false; if (shellActual === 'miembro') shellActual = null; }
  // Primera decisión de una cuenta gratis: elegir el curso de bienvenida antes de cualquier
  // entrevista o módulo. Se valida aquí para cubrir URL pegada, Atrás y recarga;
  // VIP, admin, migrados y elecciones ya guardadas quedan fuera del bloqueo.
  const hayCursosElegibles = catalogoCursos.some((c) => c.publicado !== false && c.clases.length >= 2);
  // La cuenta demo lleva esAdmin=true para permitir revisar el panel, pero en rutas de
  // miembro debe vivir el mismo onboarding que una cuenta gratis real.
  const administradorReal = Datos.modo === 'api' && Auth.usuario?.esAdmin;
  const sinCursoGratis = !administradorReal && !Acceso.vip() && CursoGratis.cargado() && !CursoGratis.id() && hayCursosElegibles;
  if (sinCursoGratis && path !== '/curso-gratis') {
    navigate('/curso-gratis'); return false;
  }
  // La selección no pertenece al cascarón de módulos: nunca pinta sidebar, topbar ni navegación móvil.
  if (path === '/curso-gratis') { montar('solo'); return true; }
  // Después de elegir, la entrevista de bienvenida ocupa su propia página hasta responderla o posponerla.
  const entrevista = encuestaPendiente()?.tipo === 'bienvenida';
  if (encuestasListas) recordarBienvenida(u.uid, !entrevista);
  if (path === '/bienvenida') {
    if (!entrevista) { navigate('/'); return false; }
    montar('solo'); return true;
  }
  if (entrevista) {
    if (path !== '/') sessionStorage.setItem(DESTINO_KEY, location.hash.slice(1));
    navigate('/bienvenida'); return false;
  }
  montar('miembro'); return true;
});

// ── Rutas del miembro ──
route('/login', login);
route('/bienvenida', bienvenida);
route('/brujula', brujula);
route('/', inicio);
route('/cursos', catalogo);
route('/curso/:id', curso);
route('/curso/:id/clase/:n', clase);
route('/materiales', biblioteca);
route('/materiales/:id/visor', visor);
route('/materiales/:id', material);
route('/en-vivo', () => { navigate('/comunidad?tab=en-vivo'); return ''; });
route('/comunidad', comunidad);
route('/comunidad/:id', hilo);
route('/directorio', directorio);
route('/curso-gratis', cursoGratisPagina);
route('/logros', paginaLogros);
route('/recompensas', paginaRecompensas);
route('/retos', retos);
route('/certificados', certificados);
route('/certificados/:id', certificado);
route('/verificar/:folio', verificar);
route('/buscar', buscar);
route('/praxia', praxia);
route('/herramientas', herramientas);
route('/herramientas/:slug', herramienta);
route('/perfil', perfil);
route('/suscripcion', suscripcion);
route('/configuracion', configuracion);
route('/mas', mas);
// ── Rutas del admin ──
const paginaAdmin = (pagina: (params: Record<string, string>, query: URLSearchParams) => string) => (params: Record<string, string>, query: URLSearchParams) => Admin.error
  ? `<div class="card card--pad stack" style="max-width:720px;margin:auto;text-align:center;gap:14px"><i data-lucide="server-off" class="i" style="width:34px;height:34px;margin:auto"></i><h1 class="display" style="font-size:var(--fs-xl)">No se pudo cargar el panel</h1><p class="muted">${esc(Admin.error)}</p><button class="btn btn--brand" style="justify-self:center" data-reintentar-admin><i data-lucide="refresh-cw" class="i"></i>Reintentar</button></div>`
  : pagina(params, query);
route('/admin', paginaAdmin(adminResumen));
route('/admin/cursos', paginaAdmin(adminCursos));
route('/admin/cursos/:id', paginaAdmin(adminCurso));
route('/admin/quizzes', paginaAdmin(adminQuizzes));
route('/admin/quizzes/:cursoId/:n', paginaAdmin(adminQuiz));
route('/admin/materiales', paginaAdmin(adminMateriales));
route('/admin/materiales/:id', paginaAdmin(adminMaterial));
route('/admin/en-vivo', paginaAdmin(adminEnVivo));
route('/admin/en-vivo/:id', paginaAdmin(adminEvento));
route('/admin/miembros', paginaAdmin(adminMiembros));
route('/admin/miembros/:uid', paginaAdmin(adminMiembro));
route('/admin/comunidad', paginaAdmin(adminComunidad));
route('/admin/cupones', paginaAdmin(adminCupones));
route('/admin/avisos', paginaAdmin(adminAvisos));
route('/admin/encuestas', paginaAdmin(adminEncuestas));
route('/admin/ajustes', paginaAdmin(adminAjustes));

onRender(() => {
  const { path } = current();
  rutaPintada = path;
  if (shellActual === 'admin') marcarAdminActivo(path); else marcarNavActivo(path);
  const crumb = document.querySelector('[data-crumb]'); if (crumb) crumb.textContent = document.querySelector('#outlet h1')?.textContent?.trim() || 'Administración';
  cargarVideos();
  if (path.startsWith('/retos')) montarArcade();
  if (path.endsWith('/visor')) montarVisor();
  if (path.startsWith('/curso-gratis')) montarCursoGratis(toast); else desmontarCursoGratis();
  if (path === '/bienvenida') montarBienvenida(toast);
  if (path === '/brujula') montarBrujula(toast);
  hidratarNotas();
  createIcons({ icons });
  // Primera entrada: elección obligatoria → entrevista → Brújula/recorrido.
  // El recorrido no interrumpe una clase ni la elección del curso gratis: aparece en la siguiente pantalla.
  const sinRecorrido = /\/clase\/|^\/(curso-gratis|brujula)/.test(path);
  if (shellActual === 'miembro' && !mostrarEncuestaPendiente(toast) && !sinRecorrido && !mostrarEleccionCursoGratis(toast)) mostrarOnboarding();
});
instalarAccionesAdmin(toast);
startRouter();
window.addEventListener('datos:cambio', (e) => { if ((e as CustomEvent).detail === 'avisos') actualizarNotifs(); });
window.addEventListener('recompensas:cambio', actualizarNotifs);
window.addEventListener('recompensas:ganadas', (e) => {
  const detalle = (e as CustomEvent).detail;
  const puntos = Number(detalle?.puntosGanados || 0);
  const logros = detalle?.logrosNuevos || [];
  if (puntos > 0) toast(`+${puntos} puntos añadidos a tus recompensas`, 'sparkles');
  logros.forEach((logro: { titulo?: string }) => toast(`Logro desbloqueado: ${logro.titulo || 'nuevo logro'}`, 'trophy'));
  Recompensas.aplicarPremio(detalle);
});
window.addEventListener('encuesta:cerrada', () => { if (shellActual === 'miembro' && !mostrarEleccionCursoGratis(toast)) mostrarOnboarding(); });
window.addEventListener('curso-gratis:elegido', () => { if (shellActual === 'miembro') render(); });

function abrirQuizDeClase(cursoId: string, n: number, { anunciar = false } = {}) {
  const iframe = document.querySelector<HTMLIFrameElement>(`iframe[data-video="${CSS.escape(`${cursoId}:${n}`)}"]`);
  const herramientas = iframe?.closest('section')?.querySelector<HTMLElement>('[data-tabs]');
  const boton = herramientas?.querySelector<HTMLButtonElement>('.tabs button[data-for="quiz"]');
  if (!herramientas || !boton) return false;
  boton.parentElement?.querySelectorAll('button').forEach((b) => b.classList.toggle('is-active', b === boton));
  herramientas.querySelectorAll<HTMLElement>('[data-tab]').forEach((p) => { p.hidden = p.dataset.tab !== 'quiz'; });
  const espacio = herramientas.closest<HTMLElement>('[data-lesson-workspace]');
  if (espacio) espacio.dataset.lessonMode = 'quiz';
  herramientas.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const form = herramientas.querySelector<HTMLFormElement>('[data-quiz-miembro]');
  if (form) {
    if (!form.dataset.quizInicio) form.dataset.quizInicio = String(Date.now());
    mostrarPasoQuiz(form, Number(form.dataset.paso || 0));
    if (anunciar) toast('Video terminado · tu reto clínico está listo', 'brain-circuit');
  } else if (anunciar) toast('Video terminado · la evaluación está en revisión clínica', 'shield-check');
  return !!form;
}

function abrirJuegoDeClase(cursoId: string, n: number, { anunciar = false, actualizarAlCerrar = false } = {}) {
  const c = getCurso(cursoId);
  const k = c?.clases.find((clase) => clase.n === n);
  if (!c || !k) return false;
  const siguiente = c.clases.find((clase) => clase.n === n + 1);
  const abierto = abrirJuegoClase({
    cursoId,
    n,
    cursoTitulo: c.titulo,
    claseTitulo: k.titulo,
    portadaCurso: c.portada,
    notas: k.notas,
    siguienteTitulo: siguiente?.titulo,
    onCompletar: Datos.modo === 'api' ? async (puntaje: number, tipo: TipoJuegoClase) => {
      const resultado = await api<{ juego: RegistroJuegoClase; recompensas?: NonNullable<PremioActividad> }>(`/juegos-clase/${encodeURIComponent(cursoId)}/${n}`, {
        method: 'POST', json: { puntaje, tipo },
      });
      return resultado;
    } : undefined,
    onContinuar: () => navigate(siguiente ? `/curso/${cursoId}/clase/${siguiente.n}` : `/curso/${cursoId}`),
    onCerrar: actualizarAlCerrar ? () => render() : undefined,
  });
  if (abierto && anunciar) toast('Clase terminada · tu juego de cierre está listo', 'gamepad-2');
  if (!abierto) navigate(siguiente ? `/curso/${cursoId}/clase/${siguiente.n}` : `/curso/${cursoId}`);
  return abierto;
}

function refrescarYAbrirJuego(cursoId: string, n: number, { anunciar = false } = {}) {
  requestAnimationFrame(() => abrirJuegoDeClase(cursoId, n, { anunciar, actualizarAlCerrar: true }));
}

async function registrarVistaClase(cursoId: string, n: number) {
  const yaVista = Progreso.de(cursoId).vistas.includes(n);
  if (!yaVista && Datos.modo === 'api') {
    const r = await api<{ recompensas?: PremioActividad }>(`/progreso/${cursoId}/vista`, { method: 'POST', json: { n } });
    registrarPremio(r.recompensas);
  }
  if (!yaVista) Progreso.marcarVista(cursoId, n);
  const c = getCurso(cursoId);
  const hayNext = !!c?.clases.some((k) => k.n === n + 1);
  if (c && !hayNext && !yaVista) {
    toast('Curso completado · tu certificado ya está listo', 'award');
    try { await cargarEncuestas(true); } catch {}
  }
  return { c, hayNext };
}

async function finalizarVideo(cursoId: string, n: number) {
  const clave = `${cursoId}:${n}`;
  if (videosFinalizados.has(clave)) return;
  videosFinalizados.add(clave);
  try {
    await registrarVistaClase(cursoId, n);
    render();
    toast('Video terminado · tu juego de repaso ya está listo', 'gamepad-2');
  } catch (err) {
    videosFinalizados.delete(clave);
    toast(mensajeError(err), 'alert-triangle');
  }
}

function montarSeguimientoVideo(iframe: HTMLIFrameElement) {
  if (iframe.dataset.playerSeguimiento) return;
  iframe.dataset.playerSeguimiento = 'pendiente';
  iframe.addEventListener('load', () => {
    if (iframe.dataset.playerSeguimiento === 'activo') return;
    const Player = window.playerjs?.Player;
    if (!Player) { iframe.dataset.playerSeguimiento = 'sin-api'; return; }
    const player = new Player(iframe);
    if (iframe.dataset.video) reproductoresVideo.set(iframe.dataset.video, player);
    player.on('ended', () => {
      const [cursoId, n] = (iframe.dataset.video || '').split(':');
      if (cursoId && Number.isInteger(Number(n))) void finalizarVideo(cursoId, Number(n));
    });
    iframe.dataset.playerSeguimiento = 'activo';
  }, { once: true });
}

// ── Video: en modo api el backend firma el enlace de Bunny ──
async function cargarVideos() {
  for (const f of document.querySelectorAll<HTMLIFrameElement>('iframe[data-video]')) {
    montarSeguimientoVideo(f);
    if (Datos.modo === 'demo' || f.src) continue;
    const [cursoId, n] = f.dataset.video!.split(':');
    try { const r = await api<{ embedUrl: string }>('/video/token', { method: 'POST', json: { cursoId, n: Number(n) } }); f.src = r.embedUrl; }
    catch (e: any) { f.replaceWith(Object.assign(document.createElement('div'), { className: 'player__error', textContent: e.status === 403 ? 'Esta clase es para miembros VIP.' : 'No se pudo cargar el video. Intenta de nuevo.' })); }
  }
}

// ── Notificaciones (avisos publicados desde el admin) ──
const VISTO_KEY = 'odonteck-club:avisos-visto';
function actualizarNotifs() {
  const badge = document.querySelector<HTMLElement>('[data-notifs-badge]'); if (!badge) return;
  const visto = localStorage.getItem(VISTO_KEY) || '';
  const nuevos = Datos.avisos().filter((a) => a.fecha > visto).length + (Recompensas.resumen()?.notificaciones.length || 0);
  badge.hidden = !nuevos; badge.textContent = String(nuevos);
}
function abrirNotifs(panel: HTMLElement) {
  const visto = localStorage.getItem(VISTO_KEY) || '';
  const l = Datos.avisos();
  const premios = Recompensas.resumen()?.notificaciones || [];
  const itemsPremio = premios.map((n) => `<a class="notif is-new" href="${esc(n.enlace || '#/recompensas')}"><strong>${esc(n.titulo)}</strong><p>${esc(n.texto)}</p></a>`).join('');
  const itemsAviso = l.map((a) => `<a class="notif ${a.fecha > visto ? 'is-new' : ''}" href="${esc(a.enlace || '#/')}"><strong>${esc(a.titulo)}</strong><p>${esc(a.texto)}</p></a>`).join('');
  panel.innerHTML = `<div class="row" style="justify-content:space-between;padding:6px 10px"><strong style="font-size:var(--fs-sm)">Avisos y logros</strong><span class="faint" style="font-size:var(--fs-xs)">${l.length + premios.length}</span></div>` +
    (itemsPremio || itemsAviso ? itemsPremio + itemsAviso : '<p class="muted" style="padding:16px;font-size:var(--fs-sm);text-align:center">No tienes avisos nuevos.</p>');
  localStorage.setItem(VISTO_KEY, new Date().toISOString());
  void Recompensas.marcarLeidas().catch(() => {});
  actualizarNotifs();
}

function mostrarResumenCuenta(abierto: boolean) {
  const drawer = document.querySelector<HTMLElement>('[data-account-drawer]');
  const scrim = document.querySelector<HTMLElement>('[data-account-scrim]');
  const toggle = document.querySelector<HTMLElement>('[data-account-toggle]');
  if (!drawer || !scrim || !toggle) return;
  if (abierto) {
    document.querySelectorAll<HTMLElement>('[data-account-points]').forEach((x) => { x.textContent = String(puntos()); });
    const vistas = document.querySelector<HTMLElement>('[data-account-views]');
    const completos = document.querySelector<HTMLElement>('[data-account-courses]');
    if (vistas) vistas.textContent = String(Progreso.totalVistas());
    if (completos) completos.textContent = String(Progreso.completados().length);
  }
  drawer.hidden = !abierto;
  scrim.hidden = !abierto;
  toggle.setAttribute('aria-expanded', String(abierto));
}

// ── Interacciones globales del miembro ──
document.addEventListener('click', async (e) => {
  const el = e.target as HTMLElement;
  const abrirCuaderno = el.closest<HTMLButtonElement>('[data-notas-open]');
  if (abrirCuaderno) {
    const dialog = document.getElementById(abrirCuaderno.dataset.notasOpen || '') as HTMLDialogElement | null;
    if (dialog && !dialog.open) dialog.showModal();
    return;
  }
  const dialogNotas = el.closest<HTMLDialogElement>('.notas-dialog');
  if (dialogNotas && (el.closest('[data-notas-close]') || e.target === dialogNotas)) { dialogNotas.close(); return; }
  const pw = el.closest<HTMLElement>('[data-paywall]');
  if (pw) { mostrarPaywall(pw.dataset.paywall || undefined); return; }

  if (el.closest('[data-guia]')) { mostrarOnboarding(true); return; }
  const abrirCursoGratis = el.closest<HTMLElement>('[data-curso-gratis-abrir]');
  if (abrirCursoGratis) { mostrarEleccionCursoGratis(toast, { forzar: true, cursoId: abrirCursoGratis.dataset.cursoGratisAbrir || undefined }); return; }
  if (el.closest('[data-demo-reiniciar-todo]') && Datos.modo === 'demo') {
    if (!confirm('¿Empezar el prototipo como un usuario nuevo? Se borra todo lo guardado en este navegador para el demo.')) return;
    try { Object.keys(localStorage).filter((k) => k.startsWith('odonteck-club:')).forEach((k) => localStorage.removeItem(k)); sessionStorage.clear(); indexedDB.deleteDatabase('odonteck-club-directorio-docs'); } catch {}
    location.replace(`${location.pathname}#/login`); location.reload(); return;
  }
  if (el.closest('[data-curso-gratis-reiniciar-demo]')) { CursoGratis.reiniciarDemo(); toast('Listo: deberás elegir de nuevo tu curso gratis para continuar', 'gift'); navigate('/'); return; }

  if (el.closest('[data-theme-toggle]')) setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');

  const repasarVideo = el.closest<HTMLButtonElement>('[data-video-seek]');
  if (repasarVideo) {
    const clave = repasarVideo.dataset.videoKey || '';
    const marca = repasarVideo.dataset.videoSeek || '';
    const segundos = segundosDeMarca(marca);
    const player = reproductoresVideo.get(clave);
    const iframe = document.querySelector<HTMLIFrameElement>(`iframe[data-video="${CSS.escape(clave)}"]`);
    if (player && segundos !== null) {
      player.setCurrentTime(segundos); player.play();
      iframe?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      toast(`Repasando la evidencia en ${marca}`, 'play-circle');
    } else toast('El video todavía se está preparando. Intenta de nuevo en un momento.', 'loader-circle');
    return;
  }

  const bell = el.closest('[data-notifs]');
  const panel = document.querySelector<HTMLElement>('[data-notifs-panel]');
  if (panel) {
    if (bell) { panel.hidden = !panel.hidden; if (!panel.hidden) abrirNotifs(panel); }
    else if (!el.closest('[data-notifs-panel]')) panel.hidden = true;
  }

  const accountToggle = el.closest('[data-account-toggle]');
  const accountDrawer = document.querySelector<HTMLElement>('[data-account-drawer]');
  if (accountToggle) {
    if (panel) panel.hidden = true;
    mostrarResumenCuenta(accountDrawer?.hasAttribute('hidden') ?? true);
    return;
  }
  if (el.closest('[data-account-close], [data-account-scrim]')) { mostrarResumenCuenta(false); return; }
  if (accountDrawer && !accountDrawer.hidden) {
    if (el.closest('[data-account-drawer] a')) mostrarResumenCuenta(false);
    else if (!el.closest('[data-account-drawer]')) mostrarResumenCuenta(false);
  }

  const tab = el.closest<HTMLButtonElement>('.tabs button[data-for]');
  if (tab) {
    tab.parentElement!.querySelectorAll('button').forEach((b) => b.classList.toggle('is-active', b === tab));
    const herramientas = tab.closest<HTMLElement>('[data-tabs]');
    herramientas?.querySelectorAll<HTMLElement>('[data-tab]').forEach((p) => (p.hidden = p.dataset.tab !== tab.dataset.for));
    const espacio = herramientas?.closest<HTMLElement>('[data-lesson-workspace]');
    if (espacio) espacio.dataset.lessonMode = tab.dataset.for === 'quiz' ? 'quiz' : 'default';
  }

  const retryNotas = el.closest<HTMLButtonElement>('[data-notas-retry]');
  if (retryNotas) {
    const tablero = retryNotas.closest<HTMLElement>('[data-notas-board]');
    if (tablero && retryNotas.dataset.notasRetryMode === 'save') programarGuardadoNotas(tablero.dataset.notasBoard || '');
    else if (tablero) await cargarNotasRemotas(tablero);
    return;
  }

  const marcarNota = el.closest<HTMLButtonElement>('[data-nota-check]');
  if (marcarNota) {
    const tablero = marcarNota.closest<HTMLElement>('[data-notas-board]'); if (!tablero) return;
    const clave = tablero.dataset.notasBoard || '';
    const indice = Number(marcarNota.dataset.notaCheck);
    const estado = leerNotasRepasadas();
    const repasadas = new Set((estado[clave] || []).map(Number));
    if (repasadas.has(indice)) repasadas.delete(indice); else repasadas.add(indice);
    const dominada = repasadas.has(indice);
    estado[clave] = [...repasadas].sort((a, b) => a - b);
    escribirNotasRepasadas(estado);
    refrescarNotas(tablero);
    createIcons({ icons });
    toast(dominada ? 'Concepto marcado como dominado' : 'Concepto pendiente de repaso', dominada ? 'badge-check' : 'rotate-ccw');
    return;
  }

  const copiarNotas = el.closest<HTMLButtonElement>('[data-notas-copy]');
  if (copiarNotas) {
    const tablero = copiarNotas.closest<HTMLElement>('[data-notas-board]'); if (!tablero) return;
    const resumen = tablero.querySelector<HTMLElement>('.notas-pro__summary p')?.textContent?.trim() || '';
    const conceptos = [...tablero.querySelectorAll<HTMLElement>('.notas-timeline__text p')].map((x, i) => `${i + 1}. ${x.textContent?.trim() || ''}`);
    const practicas = [...tablero.querySelectorAll<HTMLElement>('.notas-recall__item summary strong')].map((x, i) => `${i + 1}. ${x.textContent?.trim() || ''}`);
    const personal = tablero.querySelector<HTMLTextAreaElement>('[data-notas-personal]')?.value.trim() || '';
    try {
      await navigator.clipboard.writeText(`Resumen\n${resumen}\n\nConceptos clave\n${conceptos.join('\n')}\n\nPreguntas de recuperación\n${practicas.join('\n')}${personal ? `\n\nMi bitácora\n${personal}` : ''}`);
      toast('Cuaderno completo copiado', 'copy');
    } catch { toast('No se pudieron copiar las notas en este navegador', 'circle-alert'); }
    return;
  }

  const irQuizDesdeNotas = el.closest<HTMLButtonElement>('[data-notas-go-quiz]');
  if (irQuizDesdeNotas) {
    irQuizDesdeNotas.closest<HTMLDialogElement>('.notas-dialog')?.close();
    const herramientas = irQuizDesdeNotas.closest<HTMLElement>('[data-tabs]');
    const botonQuiz = herramientas?.querySelector<HTMLButtonElement>('.tabs button[data-for="quiz"]');
    if (!herramientas || !botonQuiz) return;
    botonQuiz.parentElement?.querySelectorAll('button').forEach((b) => b.classList.toggle('is-active', b === botonQuiz));
    herramientas.querySelectorAll<HTMLElement>('[data-tab]').forEach((p) => { p.hidden = p.dataset.tab !== 'quiz'; });
    const espacio = herramientas.closest<HTMLElement>('[data-lesson-workspace]');
    if (espacio) espacio.dataset.lessonMode = 'quiz';
    herramientas.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const quiz = herramientas.querySelector<HTMLFormElement>('[data-quiz-miembro]');
    if (quiz) mostrarPasoQuiz(quiz, Number(quiz.dataset.paso || 0));
    createIcons({ icons });
    return;
  }

  const descartarQuiz = el.closest<HTMLButtonElement>('[data-quiz-exclude]');
  if (descartarQuiz) {
    const form = descartarQuiz.closest<HTMLFormElement>('[data-quiz-miembro]'); if (!form || form.dataset.calificado) return;
    const fila = descartarQuiz.closest<HTMLElement>('.quiz-choice-row'); if (!fila) return;
    const descartada = !fila.classList.contains('is-excluded');
    fila.classList.toggle('is-excluded', descartada);
    descartarQuiz.setAttribute('aria-pressed', String(descartada));
    descartarQuiz.innerHTML = descartada ? '<i data-lucide="undo-2" class="i"></i><span>Recuperar</span>' : '<i data-lucide="eye-off" class="i"></i><span>Descartar</span>';
    if (descartada) { const input = fila.querySelector<HTMLInputElement>('input'); if (input) input.checked = false; }
    mostrarPasoQuiz(form, Number(form.dataset.paso || 0)); createIcons({ icons });
    return;
  }

  const marcarQuiz = el.closest<HTMLButtonElement>('[data-quiz-flag]');
  if (marcarQuiz) {
    const form = marcarQuiz.closest<HTMLFormElement>('[data-quiz-miembro]'); if (!form || form.dataset.calificado) return;
    const pregunta = marcarQuiz.closest<HTMLElement>('[data-pregunta]'); if (!pregunta) return;
    const marcada = pregunta.dataset.flagged !== '1';
    pregunta.dataset.flagged = marcada ? '1' : '0';
    marcarQuiz.classList.toggle('is-active', marcada);
    marcarQuiz.setAttribute('aria-pressed', String(marcada));
    marcarQuiz.querySelector('span')!.textContent = marcada ? 'Marcada' : 'Revisar';
    mostrarPasoQuiz(form, Number(form.dataset.paso || 0));
    toast(marcada ? 'Pregunta marcada para revisar' : 'Pregunta retirada de revisión', marcada ? 'bookmark-check' : 'bookmark');
    return;
  }

  const confianzaQuiz = el.closest<HTMLButtonElement>('[data-quiz-confidence]');
  if (confianzaQuiz) {
    const form = confianzaQuiz.closest<HTMLFormElement>('[data-quiz-miembro]'); if (!form || form.dataset.calificado) return;
    const bloque = confianzaQuiz.closest<HTMLElement>('.quiz-confidence');
    const input = bloque?.querySelector<HTMLInputElement>('[data-confidence-input]'); if (!input) return;
    input.value = confianzaQuiz.dataset.quizConfidence || '';
    bloque!.querySelectorAll<HTMLButtonElement>('[data-quiz-confidence]').forEach((b) => { const activo = b === confianzaQuiz; b.classList.toggle('is-active', activo); b.setAttribute('aria-pressed', String(activo)); });
    mostrarPasoQuiz(form, Number(form.dataset.paso || 0));
    return;
  }

  const moverQuiz = el.closest<HTMLButtonElement>('[data-quiz-move]');
  if (moverQuiz) {
    const form = moverQuiz.closest<HTMLFormElement>('[data-quiz-miembro]');
    if (!form || form.dataset.calificado) return;
    const fila = moverQuiz.closest<HTMLElement>('[data-sort-item]');
    const lista = fila?.parentElement;
    if (!fila || !lista) return;
    const filas = [...lista.querySelectorAll<HTMLElement>('[data-sort-item]')];
    const pos = filas.indexOf(fila); const destino = pos + Number(moverQuiz.dataset.quizMove);
    if (destino < 0 || destino >= filas.length) return;
    if (destino > pos) lista.insertBefore(filas[destino], fila); else lista.insertBefore(fila, filas[destino]);
    renumerarOrdenQuiz(lista);
    fila.animate([{ transform: 'translateY(0)', background: 'var(--primary-soft)' }, { transform: 'translateY(0)', background: 'var(--surface)' }], { duration: 360 });
    return;
  }

  const irQuiz = el.closest<HTMLButtonElement>('[data-quiz-ir]');
  if (irQuiz) {
    const form = irQuiz.closest<HTMLFormElement>('[data-quiz-miembro]');
    if (form) mostrarPasoQuiz(form, Number(irQuiz.dataset.quizIr));
    return;
  }

  const navegarQuiz = el.closest<HTMLButtonElement>('[data-quiz-nav]');
  if (navegarQuiz) {
    const form = navegarQuiz.closest<HTMLFormElement>('[data-quiz-miembro]'); if (!form) return;
    const actual = Number(form.dataset.paso || 0);
    const pregunta = form.querySelector<HTMLElement>(`[data-pregunta="${actual}"]`);
    if (Number(navegarQuiz.dataset.quizNav) > 0 && !form.dataset.calificado && pregunta && !preguntaQuizCompleta(pregunta)) {
      pregunta.classList.remove('quiz-q--attention'); void pregunta.offsetWidth; pregunta.classList.add('quiz-q--attention');
      toast(faltaPreguntaQuiz(pregunta), 'circle-alert'); return;
    }
    mostrarPasoQuiz(form, actual + Number(navegarQuiz.dataset.quizNav));
    return;
  }

  const marcar = el.closest<HTMLElement>('[data-marcar-vista]');
  if (marcar) {
    const [id, n] = marcar.dataset.marcarVista!.split(':');
    try {
      await registrarVistaClase(id, Number(n));
      refrescarYAbrirJuego(id, Number(n), { anunciar: true });
    } catch (err) { toast(mensajeError(err), 'alert-triangle'); }
    return;
  }

  const abrirJuego = el.closest<HTMLElement>('[data-abrir-juego]');
  if (abrirJuego) { const [id, n] = abrirJuego.dataset.abrirJuego!.split(':'); abrirJuegoDeClase(id, Number(n), { actualizarAlCerrar: true }); return; }

  const irSiguiente = el.closest<HTMLElement>('[data-ir-siguiente]');
  if (irSiguiente) {
    const clave = irSiguiente.dataset.irSiguiente || '';
    const [id, n] = clave.split(':');
    if (id && n && !juegoClaseCompletado(clave)) {
      e.preventDefault();
      abrirJuegoDeClase(id, Number(n), { anunciar: true, actualizarAlCerrar: true });
      return;
    }
  }

  const abrirQuiz = el.closest<HTMLElement>('[data-abrir-quiz]');
  if (abrirQuiz) { const [id, n] = abrirQuiz.dataset.abrirQuiz!.split(':'); abrirQuizDeClase(id, Number(n)); return; }

  const res = el.closest<HTMLElement>('[data-reservar]');
  if (res) {
    const id = res.dataset.reservar!;
    try {
      if (Datos.modo === 'api') {
        const r = await api<{ reservado: boolean }>(`/eventos/${encodeURIComponent(id)}/reserva`, { method: 'POST' });
        const evento = Datos.eventos().find((x) => x.id === id);
        if (evento) Datos.guardarEvento({ ...evento, reservado: r.reservado, reservas: Math.max(0, Number(evento.reservas || 0) + (r.reservado ? 1 : -1)) });
      } else toggleReserva(id);
      toast('Reserva actualizada · te avisamos antes de la clase', 'bell'); render();
    } catch (err) { toast(mensajeError(err), 'alert-triangle'); }
  }

  const descargar = el.closest<HTMLButtonElement>('[data-descargar-material]');
  if (descargar) {
    descargar.disabled = true;
    try {
      const r = await api<{ url: string }>(`/materiales/${encodeURIComponent(descargar.dataset.descargarMaterial!)}/descarga`);
      location.href = r.url;
    } catch (err) { toast(mensajeError(err), 'alert-triangle'); descargar.disabled = false; }
  }

  const ficha = el.closest<HTMLButtonElement>('[data-descargar-ficha]');
  if (ficha) {
    ficha.disabled = true;
    try {
      const [cursoId, n] = ficha.dataset.descargarFicha!.split(':');
      if (Datos.modo === 'api') {
        const r = await api<{ url: string }>(`/clases/${encodeURIComponent(cursoId)}/${Number(n)}/ficha`);
        window.open(r.url, '_blank', 'noopener,noreferrer');
      } else {
        const archivo = Datos.cursos().find((c) => c.id === cursoId)?.clases.find((k) => k.n === Number(n))?.ficha?.archivo;
        if (!archivo) throw new Error('La ficha todavía no tiene un PDF asociado.');
        window.open(archivo, '_blank', 'noopener,noreferrer');
      }
    } catch (err) { toast(mensajeError(err), 'alert-triangle'); }
    finally { ficha.disabled = false; }
  }

  const repaso = el.closest<HTMLButtonElement>('[data-descargar-repaso]');
  if (repaso) {
    repaso.disabled = true;
    try {
      const [cursoId, n] = repaso.dataset.descargarRepaso!.split(':');
      const curso = Datos.cursos().find((item) => item.id === cursoId);
      const clase = curso?.clases.find((item) => item.n === Number(n));
      if (!curso || !clase) throw new Error('No encontré los datos de esta clase.');
      await descargarRepasoPDF(curso, clase);
    } catch (err) { toast(mensajeError(err), 'alert-triangle'); }
    finally { repaso.disabled = false; }
  }

  if (el.closest('[data-pregunta-rapida]')) {
    if (!Acceso.puedeComunidad()) { mostrarPaywall('Publicar en la comunidad es para miembros VIP. Puedes leer todos los temas gratis.'); return; }
    navigate('/comunidad?tab=foro'); setTimeout(() => { const f = document.querySelector<HTMLElement>('[data-form-hilo]'); if (f) { f.hidden = false; f.querySelector('input')?.focus(); } }, 100); return; }
  if (el.closest('[data-nuevo-hilo]')) {
    if (!Acceso.puedeComunidad()) { mostrarPaywall('Publicar en la comunidad es para miembros VIP. Puedes leer todos los temas gratis.'); return; }
    const f = document.querySelector<HTMLElement>('[data-form-hilo]'); if (f) { f.hidden = false; f.querySelector('input')?.focus(); } }
  if (el.closest('[data-cancelar-hilo]')) { const f = document.querySelector<HTMLElement>('[data-form-hilo]'); if (f) f.hidden = true; }
  const verPerfil = el.closest<HTMLElement>('[data-network-view]');
  if (verPerfil) {
    const dialog = [...document.querySelectorAll<HTMLDialogElement>('[data-network-view-dialog]')].find((d) => d.dataset.networkViewDialog === verPerfil.dataset.uid);
    if (dialog) { dialog.scrollTop = 0; dialog.showModal(); } return;
  }
  if (el.closest('[data-network-profile]')) { limpiarFotoDirectorioPendiente(); el.closest<HTMLDialogElement>('dialog')?.close(); const dialog = document.querySelector<HTMLDialogElement>('[data-network-profile-dialog]'); if (dialog) { dialog.scrollTop = 0; dialog.showModal(); } return; }
  if (el.closest('[data-network-job]')) {
    if (!Auth.usuario?.esVip && Datos.modo === 'api') { mostrarPaywall('Publicar oportunidades es un beneficio VIP. Puedes explorar perfiles y conectar gratis.'); return; }
    document.querySelector<HTMLDialogElement>('[data-network-job-dialog]')?.showModal(); return;
  }
  if (el.closest('[data-network-close]')) { el.closest<HTMLDialogElement>('dialog')?.close(); return; }
  if (el.closest('[data-network-photo-remove]')) {
    if (fotoDirectorioPendiente) URL.revokeObjectURL(fotoDirectorioPendiente.preview);
    fotoDirectorioPendiente = null; quitarFotoDirectorio = true;
    const dialog = el.closest<HTMLDialogElement>('dialog');
    const preview = dialog?.querySelector<HTMLImageElement>('[data-network-photo-preview]');
    if (preview) { preview.hidden = true; preview.removeAttribute('src'); }
    const boton = dialog?.querySelector<HTMLElement>('[data-network-photo-remove]'); if (boton) boton.hidden = true;
    toast('La foto se quitará al guardar el perfil', 'image-minus'); return;
  }
  if (el.closest('[data-network-banner-remove]')) {
    if (bannerDirectorioPendiente) URL.revokeObjectURL(bannerDirectorioPendiente.preview);
    bannerDirectorioPendiente = null; quitarBannerDirectorio = true;
    const dialog = el.closest<HTMLDialogElement>('dialog');
    const preview = dialog?.querySelector<HTMLImageElement>('[data-network-banner-preview]');
    if (preview) { preview.hidden = true; preview.removeAttribute('src'); }
    dialog?.querySelector('[data-network-banner-frame]')?.classList.remove('has-banner');
    const boton = dialog?.querySelector<HTMLElement>('[data-network-banner-remove]'); if (boton) boton.hidden = true;
    toast('La portada se quitará al guardar el perfil', 'image-minus'); return;
  }
  const agregarFila = el.closest<HTMLButtonElement>('[data-network-add-row]');
  if (agregarFila) {
    const form = agregarFila.closest<HTMLFormElement>('[data-network-profile-form]');
    const tipo = agregarFila.dataset.networkAddRow || '';
    const lista = form?.querySelector<HTMLElement>(`[data-network-repeat-list="${tipo}"]`);
    const plantilla = form?.querySelector<HTMLTemplateElement>(`template[data-network-template="${tipo}"]`);
    const maximos: Record<string, number> = { experiencia: 8, formacion: 8, credenciales: 12 };
    if (!lista || !plantilla) return;
    if (lista.querySelectorAll('[data-network-repeat-row]').length >= (maximos[tipo] || 8)) { toast('Llegaste al máximo de registros de esta sección.', 'alert-triangle'); return; }
    lista.append(plantilla.content.cloneNode(true)); createIcons({ icons });
    lista.querySelectorAll<HTMLElement>('[data-network-repeat-row]')[lista.querySelectorAll('[data-network-repeat-row]').length - 1]?.querySelector<HTMLInputElement>('input')?.focus(); return;
  }
  const quitarFila = el.closest<HTMLButtonElement>('[data-network-remove-row]');
  if (quitarFila) { quitarFila.closest('[data-network-repeat-row]')?.remove(); return; }
  const connect = el.closest<HTMLElement>('[data-network-connect]');
  if (connect) {
    el.closest<HTMLDialogElement>('dialog')?.close();
    const dialog = document.querySelector<HTMLDialogElement>('[data-network-connect-dialog]');
    if (!dialog) return;
    const form = dialog.querySelector<HTMLFormElement>('[data-network-connect-form]')!;
    form.querySelector<HTMLInputElement>('input[name="paraUid"]')!.value = connect.dataset.uid || '';
    form.querySelector<HTMLInputElement>('input[name="oportunidadId"]')!.value = connect.dataset.opportunity || '';
    const name = dialog.querySelector<HTMLElement>('[data-network-name]'); if (name) name.textContent = connect.dataset.name || 'Colega';
    dialog.showModal(); return;
  }
  const answer = el.closest<HTMLElement>('[data-network-answer]');
  if (answer) {
    try { await Directorio.responder(answer.dataset.id!, answer.dataset.networkAnswer as 'aceptada' | 'rechazada'); toast(answer.dataset.networkAnswer === 'aceptada' ? 'Conexión aceptada · ya pueden contactarse' : 'Solicitud declinada', answer.dataset.networkAnswer === 'aceptada' ? 'handshake' : 'x'); render(); }
    catch (err) { toast(mensajeError(err), 'alert-triangle'); }
    return;
  }
  const cargarMas = el.closest<HTMLButtonElement>('[data-network-load-more]');
  if (cargarMas) {
    cargarMas.disabled = true;
    try {
      await Directorio.cargar(cargarMas.dataset.networkLoadMore as 'perfiles' | 'oportunidades');
      render();
    } catch (err) { toast(mensajeError(err), 'alert-triangle'); cargarMas.disabled = false; }
    return;
  }
  const cerrarOportunidad = el.closest<HTMLButtonElement>('[data-network-close-job]');
  if (cerrarOportunidad) {
    const id = cerrarOportunidad.dataset.networkCloseJob!;
    if (!confirm('¿Cerrar esta oportunidad? Dejará de aceptar nuevas solicitudes.')) return;
    cerrarOportunidad.disabled = true;
    try { await Directorio.cerrarOportunidad(id); toast('Oportunidad cerrada', 'archive'); render(); }
    catch (err) { toast(mensajeError(err), 'alert-triangle'); cerrarOportunidad.disabled = false; }
    return;
  }
  const eliminarPerfil = el.closest<HTMLButtonElement>('[data-network-delete-profile]');
  if (eliminarPerfil) {
    if (!confirm('¿Eliminar tu perfil del directorio? También se cerrarán tus oportunidades y solicitudes pendientes. Tus cursos y tu cuenta OdonTeck no se eliminarán.')) return;
    eliminarPerfil.disabled = true;
    try {
      await Directorio.eliminarPerfil(); limpiarFotoDirectorioPendiente();
      eliminarPerfil.closest<HTMLDialogElement>('dialog')?.close();
      toast('Perfil retirado del directorio', 'user-round-x'); render();
    } catch (err) { toast(mensajeError(err), 'alert-triangle'); eliminarPerfil.disabled = false; }
    return;
  }
  const reportar = el.closest<HTMLElement>('[data-network-report]');
  if (reportar) {
    el.closest<HTMLDialogElement>('dialog')?.close();
    const dialog = document.querySelector<HTMLDialogElement>('[data-network-report-dialog]');
    if (!dialog) return;
    const form = dialog.querySelector<HTMLFormElement>('[data-network-report-form]')!;
    form.reset();
    form.querySelector<HTMLInputElement>('input[name="tipo"]')!.value = reportar.dataset.type || '';
    form.querySelector<HTMLInputElement>('input[name="objetivoId"]')!.value = reportar.dataset.id || '';
    const nombre = dialog.querySelector<HTMLElement>('[data-network-report-name]');
    if (nombre) nombre.textContent = reportar.dataset.name || 'contenido';
    dialog.showModal(); return;
  }
  const util = el.closest<HTMLElement>('[data-util]');
  if (util) {
    if (!Acceso.puedeComunidad()) { mostrarPaywall('Reaccionar en la comunidad es para miembros VIP.'); return; }
    try {
      if (Datos.modo === 'api') {
        const r = await api<{ util: number }>(`/foro/${encodeURIComponent(util.dataset.util!)}/util`, { method: 'POST' });
        Comunidad.utilRemoto(util.dataset.util!, r.util);
        if (current().path.startsWith('/comunidad/')) marcarHiloFresco(util.dataset.util!);
      } else Comunidad.util(util.dataset.util!);
      render();
    } catch (err) { toast(mensajeError(err), 'alert-triangle'); }
  }

  const aviso = el.closest<HTMLElement>('[data-aviso]');
  if (aviso) {
    const p = Perfil.get(); const k = aviso.dataset.aviso as keyof typeof p.avisos; const anterior = p.avisos[k];
    p.avisos[k] = !anterior;
    try {
      if (Datos.modo === 'api') {
        const perfil = await api<Partial<ReturnType<typeof Perfil.get>>>('/me/perfil', { method: 'PATCH', json: { avisos: { [k]: p.avisos[k] } } });
        Perfil.hidratar(perfil, p.plan, p.vence);
      } else Perfil.set({ avisos: p.avisos });
      aviso.setAttribute('aria-checked', String(p.avisos[k]));
    } catch (err) { p.avisos[k] = anterior; aviso.setAttribute('aria-checked', String(anterior)); toast(mensajeError(err), 'alert-triangle'); }
  }

  const plan = el.closest<HTMLElement>('[data-cambiar-plan]');
  if (plan) {
    if (Datos.modo === 'api') {
      const btn = plan as HTMLButtonElement;
      const previo = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = 'Conectando con Stripe…';
      try {
        const r = await api<{ url: string }>('/stripe/checkout', { method: 'POST', json: { plan: plan.dataset.cambiarPlan } });
        if (r?.url) {
          location.href = r.url;
        } else {
          throw new Error('No se recibió la dirección de pago de Stripe.');
        }
      } catch (err) {
        toast(mensajeError(err), 'alert-triangle');
        btn.disabled = false;
        btn.innerHTML = previo;
      }
    }
    else toast('En el demo no se cobra. Con el backend conectado abre el pago seguro de Stripe.', 'credit-card');
  }
  if (el.closest('[data-portal-stripe]')) {
    if (Datos.modo === 'api') { try { const r = await api<{ url: string }>('/stripe/portal', { method: 'POST' }); location.href = r.url; } catch (err) { toast(mensajeError(err), 'alert-triangle'); } }
    else toast('El portal de facturación de Stripe se abre con el backend conectado.', 'credit-card');
  }
  if (el.closest('[data-refrescar-pago]')) {
    const boton = el.closest<HTMLButtonElement>('[data-refrescar-pago]')!;
    boton.disabled = true;
    try {
      await Auth.refrescarPerfil();
      render();
      toast(Auth.usuario?.esVip ? 'Membresía activada. ¡Bienvenido a VIP!' : 'El pago aún se está confirmando. Vuelve a revisar en unos segundos.', Auth.usuario?.esVip ? 'badge-check' : 'clock-3');
    } catch (err) {
      boton.disabled = false;
      toast(mensajeError(err), 'alert-triangle');
    }
  }

  if (el.closest('[data-imprimir]')) window.print();
  const share = el.closest<HTMLElement>('[data-compartir-cert], [data-compartir]');
  if (share) {
    const url = share.dataset.compartirUrl ? new URL(share.dataset.compartirUrl, location.href).href : location.href;
    try { if (navigator.share) await navigator.share({ title: 'OdonTeck Club', url }); else { await navigator.clipboard.writeText(url); toast('Enlace copiado', 'link'); } } catch {}
  }

  const canje = el.closest<HTMLButtonElement>('[data-canjear-recompensa]');
  if (canje) {
    const id = canje.dataset.canjearRecompensa!;
    const recompensa = Recompensas.resumen()?.recompensas.find((r) => r.id === id);
    if (!recompensa || !confirm(`¿Canjear ${recompensa.puntos.toLocaleString('es-MX')} puntos por “${recompensa.titulo}”?`)) return;
    canje.disabled = true;
    try {
      const resultado = await Recompensas.canjear(id);
      if (Datos.modo === 'demo' && recompensa.materialId) {
        const material = Datos.materiales().find((m) => m.id === recompensa.materialId);
        if (material) Datos.guardarMaterial({ ...material, desbloqueadoConPuntos: true });
      } else if (Datos.modo === 'api') await cargarClub(current().path, true);
      toast(resultado.recompensa.estatus === 'pendiente' ? 'Solicitud registrada. Te confirmaremos la activación.' : 'Recompensa desbloqueada en tu biblioteca', resultado.recompensa.estatus === 'pendiente' ? 'clock-3' : 'gift');
      render();
    } catch (err) { toast(mensajeError(err), 'alert-triangle'); canje.disabled = false; }
  }
  if (el.closest('[data-guardar]')) toast('Guardado en tu biblioteca', 'bookmark');

  // Login
  if (el.closest('[data-login-demo]')) { await Auth.entrarDemo(); remontarDesdeLogin(); }
  if (el.closest('[data-login-google]')) {
    if (Datos.modo === 'demo') { await Auth.entrarDemo(); remontarDesdeLogin(); return; }
    try { await Auth.entrarGoogle(); remontarDesdeLogin(); } catch (err) { mostrarErrorLogin(err); }
  }
  if (el.closest('[data-salir]')) { await Auth.salir(); reiniciarEncuestas(); shellActual = null; navigate('/login'); }

  // Opción de quiz marcada visualmente (el input está oculto)
  const opt = el.closest<HTMLLabelElement>('.quiz__opt');
  if (opt && opt.closest('[data-quiz-miembro]') && !opt.closest('form')!.dataset.calificado) {
    const form = opt.closest<HTMLFormElement>('[data-quiz-miembro]')!;
    // La etiqueta ya activa el input de forma nativa. Forzarlo aquí hacía un
    // doble cambio (marcar + desmarcar) en radios ocultos.
    setTimeout(() => mostrarPasoQuiz(form, Number(form.dataset.paso || 0)));
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') mostrarResumenCuenta(false);
});

function remontarDesdeLogin() { shellActual = null; const v = sessionStorage.getItem('odt:volver') || '/'; sessionStorage.removeItem('odt:volver'); const antes = location.hash; navigate(v === '/login' ? '/' : v); if (location.hash === antes) render(); }
function mostrarErrorLogin(err: unknown) { const p = document.querySelector<HTMLElement>('[data-login-error]'); if (p) { p.hidden = false; p.textContent = mensajeError(err); } else toast(mensajeError(err), 'alert-triangle'); }

document.addEventListener('input', (e) => {
  const textarea = e.target as HTMLTextAreaElement;
  if (!textarea.matches('[data-notas-personal]')) return;
  const tablero = textarea.closest<HTMLElement>('[data-notas-board]'); if (!tablero) return;
  const clave = tablero.dataset.notasBoard || '';
  const estado = leerNotasPersonales();
  if (textarea.value) estado[clave] = textarea.value; else delete estado[clave];
  escribirNotasPersonales(estado);
  const contador = tablero.querySelector<HTMLElement>('[data-notas-characters]');
  const guardado = tablero.querySelector<HTMLElement>('[data-notas-save-state]');
  if (contador) contador.textContent = String(textarea.value.length);
  if (guardado && Datos.modo === 'demo') guardado.textContent = 'Guardado sólo en este dispositivo';
});

document.addEventListener('change', async (e) => {
  const input = e.target as HTMLInputElement;
  const quiz = input.closest<HTMLFormElement>('[data-quiz-miembro]');
  if (quiz && !quiz.dataset.calificado) mostrarPasoQuiz(quiz, Number(quiz.dataset.paso || 0));
  if (input.matches('[data-network-photo-input]')) {
    const file = input.files?.[0]; if (!file) return;
    try {
      const preparada = await prepararFotoDirectorio(file);
      if (fotoDirectorioPendiente) URL.revokeObjectURL(fotoDirectorioPendiente.preview);
      fotoDirectorioPendiente = preparada; quitarFotoDirectorio = false;
      const dialog = input.closest<HTMLDialogElement>('dialog');
      const preview = dialog?.querySelector<HTMLImageElement>('[data-network-photo-preview]');
      if (preview) { preview.src = preparada.preview; preview.hidden = false; }
      const boton = dialog?.querySelector<HTMLElement>('[data-network-photo-remove]'); if (boton) boton.hidden = false;
      toast('Foto lista · la optimizamos para tu perfil', 'wand-sparkles');
    } catch (err) { input.value = ''; toast(mensajeError(err), 'alert-triangle'); }
    return;
  }
  if (input.matches('[data-network-banner-input]')) {
    const file = input.files?.[0]; if (!file) return;
    try {
      const preparada = await prepararBannerDirectorio(file);
      if (bannerDirectorioPendiente) URL.revokeObjectURL(bannerDirectorioPendiente.preview);
      bannerDirectorioPendiente = preparada; quitarBannerDirectorio = false;
      const dialog = input.closest<HTMLDialogElement>('dialog');
      const preview = dialog?.querySelector<HTMLImageElement>('[data-network-banner-preview]');
      if (preview) { preview.src = preparada.preview; preview.hidden = false; }
      dialog?.querySelector('[data-network-banner-frame]')?.classList.add('has-banner');
      const boton = dialog?.querySelector<HTMLElement>('[data-network-banner-remove]'); if (boton) boton.hidden = false;
      toast('Portada lista · la ajustamos al formato de tu perfil', 'wand-sparkles');
    } catch (err) { input.value = ''; toast(mensajeError(err), 'alert-triangle'); }
    return;
  }
  if (input.matches('[data-network-profile-form] select[name="contactoCanal"]')) {
    const fila = input.closest('form')?.querySelector<HTMLElement>('[data-network-whatsapp]');
    if (fila) fila.hidden = input.value !== 'whatsapp';
    return;
  }
  if (!input.matches('[data-form-intereses] input[name="intereses"]')) return;
  const form = input.closest<HTMLFormElement>('[data-form-intereses]')!;
  let elegidos = [...form.querySelectorAll<HTMLInputElement>('input[name="intereses"]:checked')];
  if (elegidos.length > 3) {
    input.checked = false;
    elegidos = elegidos.filter((x) => x !== input);
    toast('Puedes elegir hasta 3 intereses.', 'alert-triangle');
  }
  const completo = elegidos.length >= 3;
  form.querySelectorAll<HTMLInputElement>('input[name="intereses"]').forEach((opcion) => {
    opcion.disabled = completo && !opcion.checked;
    opcion.closest('label')?.querySelector('[data-lucide]')?.setAttribute('data-lucide', opcion.checked ? 'check' : 'plus');
  });
  const contador = form.querySelector<HTMLElement>('[data-intereses-contador]');
  if (contador) contador.textContent = `${elegidos.length}/3`;
  createIcons({ icons });
});

document.addEventListener('submit', async (e) => {
  const f = e.target as HTMLFormElement;
  if (f.matches('[data-canjear-cupon]')) {
    e.preventDefault();
    const boton = f.querySelector<HTMLButtonElement>('button[type="submit"]');
    const codigo = String(new FormData(f).get('codigo') || '').trim();
    if (!codigo) return;
    if (boton) boton.disabled = true;
    try {
      const r = await canjearCuponMiembro(codigo);
      toast(`¡Listo! Se agregaron ${r.dias} días de acceso.`, 'party-popper');
      setTimeout(() => location.reload(), 900);
    } catch (err) { toast(mensajeError(err), 'alert-triangle'); if (boton) boton.disabled = false; }
    return;
  }
  if (f.matches('[data-network-search]')) {
    e.preventDefault(); const d = new FormData(f); const q = String(d.get('q') || '').trim(); const vista = String(d.get('vista') || 'personas');
    navigate(`/directorio?vista=${encodeURIComponent(vista)}${q ? `&q=${encodeURIComponent(q)}` : ''}`); return;
  }
  if (f.matches('[data-network-profile-form]')) {
    e.preventDefault(); const d = new FormData(f); const csv = (k: string) => String(d.get(k) || '').split(',').map((x) => x.trim()).filter(Boolean);
    const todos = (k: string) => d.getAll(k).map((x) => String(x).trim());
    const experienciaPuestos = todos('experienciaPuesto'); const experienciaOrganizaciones = todos('experienciaOrganizacion'); const experienciaPeriodos = todos('experienciaPeriodo'); const experienciaDescripciones = todos('experienciaDescripcion');
    const experiencia = experienciaPuestos.map((puesto, i) => ({ puesto, organizacion: experienciaOrganizaciones[i] || '', periodo: experienciaPeriodos[i] || '', descripcion: experienciaDescripciones[i] || '' }));
    const formacionProgramas = todos('formacionPrograma'); const formacionInstituciones = todos('formacionInstitucion'); const formacionPeriodos = todos('formacionPeriodo');
    const formacion = formacionProgramas.map((programa, i) => ({ programa, institucion: formacionInstituciones[i] || '', periodo: formacionPeriodos[i] || '' }));
    const credencialNombres = todos('credencialNombre'); const credencialEmisores = todos('credencialEmisor'); const credencialAnios = todos('credencialAnio');
    const credenciales = credencialNombres.map((nombre, i) => ({ nombre, emisor: credencialEmisores[i] || '', anio: credencialAnios[i] || '' }));
    const anosExperiencia = String(d.get('anosExperiencia') || '').trim();
    const boton = f.querySelector<HTMLButtonElement>('footer button[type="submit"], footer button:not([type])'); if (boton) boton.disabled = true;
    try {
      await Directorio.guardarPerfil({ titular: String(d.get('titular') || '').trim(), etapa: String(d.get('etapa')), especialidades: csv('especialidades'), ciudad: String(d.get('ciudad') || '').trim(), estado: String(d.get('estado') || '').trim(), modalidades: [String(d.get('modalidad'))], disponibilidad: d.getAll('disponibilidad').map(String), habilidades: csv('habilidades'), idiomas: csv('idiomas'), anosExperiencia: anosExperiencia ? Number(anosExperiencia) : null, experiencia, formacion, credenciales, bio: String(d.get('bio') || '').trim(), visible: d.get('visible') === '1', contacto: { canal: String(d.get('contactoCanal')), valor: String(d.get('contactoValor') || '').trim() } }, fotoDirectorioPendiente, quitarFotoDirectorio, bannerDirectorioPendiente, quitarBannerDirectorio);
      limpiarFotoDirectorioPendiente(); f.closest<HTMLDialogElement>('dialog')?.close(); toast('Perfil profesional actualizado', 'badge-check'); render();
    } catch (err) { toast(mensajeError(err), 'alert-triangle'); if (boton) boton.disabled = false; } return;
  }
  if (f.matches('[data-network-job-form]')) {
    e.preventDefault(); const d = new FormData(f); const especialidades = String(d.get('especialidades') || '').split(',').map((x) => x.trim()).filter(Boolean);
    try { await Directorio.publicar({ titulo: String(d.get('titulo')), tipo: String(d.get('tipo')), organizacion: String(d.get('organizacion')), modalidad: String(d.get('modalidad')), ciudad: String(d.get('ciudad') || ''), entidad: String(d.get('entidad') || ''), especialidades, resumen: String(d.get('resumen')), requisitos: String(d.get('requisitos') || ''), compensacion: String(d.get('compensacion') || '') }); f.closest<HTMLDialogElement>('dialog')?.close(); toast('Oportunidad publicada por 45 días', 'briefcase-business'); if (location.hash === '#/directorio?vista=oportunidades') render(); else navigate('/directorio?vista=oportunidades'); }
    catch (err) { toast(mensajeError(err), 'alert-triangle'); } return;
  }
  if (f.matches('[data-network-connect-form]')) {
    e.preventDefault(); const d = new FormData(f);
    try { await Directorio.conectar(String(d.get('paraUid')), String(d.get('oportunidadId') || '') || null, String(d.get('mensaje') || '').trim()); f.closest<HTMLDialogElement>('dialog')?.close(); toast('Solicitud enviada de forma privada', 'send'); navigate('/directorio?vista=conexiones'); }
    catch (err) { toast(mensajeError(err), 'alert-triangle'); } return;
  }
  if (f.matches('[data-network-report-form]')) {
    e.preventDefault(); const d = new FormData(f); const boton = f.querySelector<HTMLButtonElement>('button[type="submit"], footer button:not([type])');
    if (boton) boton.disabled = true;
    try {
      await Directorio.reportar(String(d.get('tipo')) as 'perfil' | 'oportunidad', String(d.get('objetivoId')), String(d.get('motivo')), String(d.get('detalle') || '').trim());
      f.closest<HTMLDialogElement>('dialog')?.close(); toast('Denuncia enviada para revisión', 'shield-check');
    } catch (err) { toast(mensajeError(err), 'alert-triangle'); }
    finally { if (boton) boton.disabled = false; }
    return;
  }
  if (f.matches('[data-search]')) {
    e.preventDefault(); const q = new FormData(f).get('q') as string;
    navigate('/buscar' + (q ? '?q=' + encodeURIComponent(q) : ''));
  }
  if (f.matches('[data-login-form]')) {
    e.preventDefault(); const d = new FormData(f); const btn = f.querySelector('button')!; btn.setAttribute('disabled', '');
    try {
      const modo = f.dataset.loginForm;
      if (Datos.modo === 'demo') {
        if (modo === 'recuperar') { toast('En modo demo: enlace simulado para ' + (d.get('email') || 'tu correo'), 'mail'); navigate('/login'); return; }
        await Auth.entrarDemo(); remontarDesdeLogin(); return;
      }
      if (modo === 'entrar') await Auth.entrarCorreo(String(d.get('email')), String(d.get('pass')));
      if (modo === 'registro') await Auth.registrar(String(d.get('nombre')).trim(), String(d.get('email')), String(d.get('pass')));
      if (modo === 'recuperar') { await Auth.recuperar(String(d.get('email'))); toast('Te enviamos un correo para crear tu contraseña', 'mail'); navigate('/login'); return; }
      remontarDesdeLogin();
    } catch (err) { mostrarErrorLogin(err); } finally { btn.removeAttribute('disabled'); }
  }
  if (f.matches('[data-quiz-miembro]')) {
    e.preventDefault();
    const [cursoId, nStr] = f.dataset.quizMiembro!.split(':');
    const n = Number(nStr);
    const q = Datos.quiz(cursoId, n); if (!q) return;
    const incompleta = [...f.querySelectorAll<HTMLElement>('[data-pregunta]')].findIndex((fs) => !preguntaQuizCompleta(fs));
    if (incompleta >= 0) {
      mostrarPasoQuiz(f, incompleta);
      const fs = f.querySelector<HTMLElement>(`[data-pregunta="${incompleta}"]`); fs?.classList.add('quiz-q--attention');
      toast(fs ? faltaPreguntaQuiz(fs) : 'Aún falta completar esta interacción.', 'circle-alert'); return;
    }
    const d = new FormData(f);
    const respuestas = q.preguntas.map((p, i) => {
      const tipo = p.tipo || 'seleccion';
      if (tipo === 'seleccion') { const v = d.get(`r${i}`); return v === null ? null : Number(v); }
      if (tipo === 'seleccion_multiple') return d.getAll(`r${i}`).map(Number);
      if (tipo === 'ordenar') return (p.elementos || []).map((_, pos) => String(d.get(`r${i}-${pos}`) || ''));
      if (tipo === 'relacionar') return Object.fromEntries((p.izquierda || []).map((x) => [x.id, String(d.get(`r${i}-${x.id}`) || '')]));
      if (tipo === 'completar') return Object.fromEntries((p.huecos || []).map((h) => [h.id, String(d.get(`r${i}-${h.id}`) || '')]));
      return null;
    });
    const confianzas = q.preguntas.map((_, i) => Number(d.get(`c${i}`) || 0));
    const justificaciones = q.preguntas.map((_, i) => String(d.get(`j${i}`) || '').trim());
    const btn = f.querySelector<HTMLButtonElement>('[data-quiz-submit]')!;
    btn.setAttribute('disabled', '');

    type Detalle = { correcta?: number; respuestaCorrecta?: unknown; acertada?: boolean; puntos?: number; explicacion: string; referenciaVideo?: string };
    let correctas: number, total: number, puntaje: number, aprobado: boolean, detalle: Detalle[];
    let intentoResumen: ResumenIntentoQuiz | null = null;
    let premio: PremioActividad = null;

    if (Datos.modo === 'api') {
      try {
        const r = await api<{ correctas: number; total: number; puntaje: number; aprobado: boolean; detalle: Detalle[]; recompensas?: PremioActividad; intento?: ResumenIntentoQuiz }>(
          `/quiz/${encodeURIComponent(cursoId)}/${n}`, { method: 'POST', json: { respuestas, confianzas, justificaciones } });
        ({ correctas, total, aprobado, detalle } = r);
        puntaje = Number.isFinite(r.puntaje) ? r.puntaje : Math.round((correctas / Math.max(1, total)) * 100);
        premio = r.recompensas;
        intentoResumen = r.intento || null;
      } catch (err) { toast(mensajeError(err), 'alert-triangle'); btn.removeAttribute('disabled'); return; }
    } else {
      detalle = q.preguntas.map((p, i) => calificarPreguntaDemo(p, respuestas[i]));
      correctas = detalle.filter((x) => x.acertada).length;
      total = q.preguntas.length;
      puntaje = Math.round(detalle.reduce((s, x) => s + Number(x.puntos || 0), 0) / total * 100);
      aprobado = puntaje >= 70;
      intentoResumen = registrarIntentoQuizDemo(`${cursoId}_${n}`, Math.max(1, Number(q.version) || 1), { correctas, total, puntaje, aprobado, respuestas, confianzas, justificaciones });
    }

    q.preguntas.forEach((p, i) => {
      const r = respuestas[i]; const det = detalle[i];
      const fs = f.querySelector(`[data-pregunta="${i}"]`)!;
      fs.classList.toggle('quiz-q--ok', det.acertada === true);
      fs.classList.toggle('quiz-q--partial', !det.acertada && Number(det.puntos) > 0);
      fs.querySelectorAll<HTMLLabelElement>('.quiz__opt').forEach((o, j) => {
        const correctas: number[] = Array.isArray(det.respuestaCorrecta) ? det.respuestaCorrecta.map(Number) : det.correcta === undefined ? [] : [det.correcta];
        if (!correctas.length) return;
        o.classList.toggle('is-correct', correctas.includes(j));
        o.classList.toggle('is-wrong', (Array.isArray(r) ? (r as unknown[]).some((x) => Number(x) === j) : j === r) && !correctas.includes(j));
      });
      const exp = fs.querySelector<HTMLElement>('.quiz__exp')!;
      const porcentajePregunta = Math.round(Number(det.puntos || 0) * 100);
      const estadoPregunta = porcentajePregunta === 100 ? 'Decisión correcta' : porcentajePregunta > 0 ? 'Crédito parcial' : 'Punto por reforzar';
      exp.innerHTML = `<div class="quiz-feedback">
        <div class="quiz-feedback__top"><span class="quiz-feedback__status"><i data-lucide="${porcentajePregunta === 100 ? 'badge-check' : porcentajePregunta > 0 ? 'pie-chart' : 'scan-search'}" class="i"></i>${estadoPregunta}</span><strong>${porcentajePregunta}%</strong></div>
        <div class="quiz-feedback__reason"><span class="eyebrow">Razonamiento clínico</span><p>${esc(det.explicacion || 'Revisa la solución esperada y contrástala con tu razonamiento.')}</p></div>
        <div class="quiz-feedback__compare">
          <div><span class="eyebrow">Tu respuesta</span>${respuestaUsuarioHTML(p, r)}</div>
          <div class="is-expected"><span class="eyebrow">Criterio esperado</span>${solucionEsperadaHTML(p, det.respuestaCorrecta)}</div>
        </div>
        ${det.referenciaVideo ? `<div class="quiz-feedback__actions"><button type="button" class="btn btn--secondary" data-video-key="${esc(`${cursoId}:${n}`)}" data-video-seek="${esc(det.referenciaVideo)}"><i data-lucide="play-circle" class="i"></i>Repasar en el video · ${esc(det.referenciaVideo)}</button><small>Te lleva al momento exacto que sustenta la respuesta.</small></div>` : ''}
      </div>`;
      exp.hidden = false;
      const confianza = confianzas[i]; const puntos = Number(det.puntos || 0);
      const calibracion = fs.querySelector<HTMLElement>('.quiz__calibration')!;
      const mensajeCalibracion = puntos === 1 && confianza === 3
        ? 'Criterio bien calibrado: decisión correcta con confianza alta.'
        : puntos === 1
          ? 'La decisión fue correcta. Revisa la explicación para convertir esa duda en criterio sólido.'
          : confianza === 3
            ? 'Punto de revisión: tu confianza fue alta, pero el resultado no fue completo. Compara tu justificación con la explicación.'
            : puntos > 0
              ? 'Vas bien encaminada: hubo crédito parcial y tu nivel de confianza invita a revisar el paso que faltó.'
              : 'Detectaste incertidumbre. Usa la explicación para identificar la señal que faltó en tu razonamiento.';
      calibracion.className = `quiz__calibration ${puntos === 1 ? 'is-aligned' : confianza === 3 ? 'is-alert' : 'is-learning'}`;
      calibracion.innerHTML = `<i data-lucide="${puntos === 1 ? 'badge-check' : confianza === 3 ? 'scan-search' : 'lightbulb'}" class="i"></i><span><strong>Calibración de criterio</strong>${mensajeCalibracion}</span>`;
      calibracion.hidden = false;
    });

    const res = f.querySelector<HTMLElement>('.quiz__resultado')!;
    res.hidden = false; res.className = `quiz__resultado ${aprobado ? 'ok' : 'no'}`;
    const calibradas = detalle.filter((det, i) => (Number(det.puntos || 0) === 1 && confianzas[i] >= 2) || (Number(det.puntos || 0) < 1 && confianzas[i] === 1)).length;
    const bitacoras = justificaciones.filter(Boolean).length;
    const transcurridos = Math.max(1, Math.round((Date.now() - Number(f.dataset.quizInicio || Date.now())) / 1000));
    const tiempo = transcurridos < 60 ? `${transcurridos} s` : `${Math.floor(transcurridos / 60)} min ${transcurridos % 60} s`;
    const marcadas = f.querySelectorAll<HTMLElement>('[data-pregunta][data-flagged="1"]').length;
    const reporte = q.preguntas.map((p, i) => {
      const dominio = Math.round(Number(detalle[i]?.puntos || 0) * 100);
      return `<div class="quiz-report__row"><span class="quiz-report__index">${String(i + 1).padStart(2, '0')}</span><div><strong>${esc(p.competencia || p.q)}</strong><small>${esc(p.nivelCognitivo || 'Aplicar')} · ${esc((p.tipo || 'seleccion').replaceAll('_', ' '))}</small><span class="quiz-report__bar"><i style="width:${dominio}%"></i></span></div><b>${dominio}%</b></div>`;
    }).join('');
    res.innerHTML = `<div class="quiz-score" style="--score:${puntaje}"><div class="quiz-score__ring"><strong>${puntaje}%</strong><span>dominio</span></div><div><span class="eyebrow">${aprobado ? 'Reto superado' : 'Sigue practicando'}</span><h3>${aprobado ? 'Criterio clínico consolidado' : 'Tu mapa de mejora está listo'}</h3><p>${correctas} de ${total} decisiones completamente correctas.${aprobado ? ' Tu avance quedó registrado.' : ' Revisa la evidencia de cada paso e inténtalo de nuevo.'}</p><div class="quiz-score__insights"><span><i data-lucide="history" class="i"></i>Intento ${intentoResumen?.numero || 1}</span><span><i data-lucide="trophy" class="i"></i>Mejor ${intentoResumen?.mejorPuntaje ?? puntaje}%</span><span><i data-lucide="gauge" class="i"></i>${calibradas}/${total} calibradas</span><span><i data-lucide="notebook-pen" class="i"></i>${bitacoras}/${total} razonamientos</span><span><i data-lucide="timer" class="i"></i>${tiempo}</span><span><i data-lucide="bookmark" class="i"></i>${marcadas} marcadas</span></div><small>La calibración orienta tu estudio y nunca modifica el puntaje. Este intento queda en tu historial de aprendizaje.</small></div></div><section class="quiz-report"><div class="quiz-report__head"><div><span class="eyebrow">Informe de dominio</span><h4>Desempeño por competencia</h4></div><span><i data-lucide="shield-check" class="i"></i>Evidencia revisable</span></div><div class="quiz-report__list">${reporte}</div></section>`;
    f.dataset.calificado = '1';
    f.classList.add('is-reviewed');
    f.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input, select, textarea').forEach((x) => { x.disabled = true; });
    f.querySelectorAll<HTMLButtonElement>('[data-quiz-move], [data-quiz-flag], [data-quiz-confidence], [data-quiz-exclude]').forEach((x) => { x.disabled = true; });
    registrarPremio(premio);
    btn.removeAttribute('disabled'); btn.hidden = false; btn.innerHTML = '<i data-lucide="rotate-ccw" class="i"></i>Intentar de nuevo'; btn.type = 'button';
    btn.onclick = () => render();
    createIcons({ icons });
  }
  if (f.matches('[data-form-hilo]')) {
    e.preventDefault();
    if (!Acceso.puedeComunidad()) { mostrarPaywall('Publicar en la comunidad es para miembros VIP.'); return; }
    const d = new FormData(f);
    try {
      const datos = { titulo: String(d.get('titulo')).trim(), texto: String(d.get('texto')).trim(), cursoId: (d.get('cursoId') as string) || null };
      let h;
      if (Datos.modo === 'api') {
        const remoto = await api<any>('/foro', { method: 'POST', json: datos });
        h = Comunidad.agregarRemoto(remoto);
        invalidarComunidad();
        registrarPremio(remoto.recompensas);
      } else h = Comunidad.crear(datos.titulo, datos.texto, datos.cursoId);
      toast('Tema publicado', 'message-circle'); navigate(`/comunidad/${h.id}`);
    } catch (err) { toast(mensajeError(err), 'alert-triangle'); }
  }
  if (f.matches('[data-form-respuesta]')) {
    e.preventDefault();
    if (!Acceso.puedeComunidad()) { mostrarPaywall('Responder en la comunidad es para miembros VIP.'); return; }
    const id = f.dataset.formRespuesta!; const texto = String(new FormData(f).get('texto')).trim();
    try {
      if (Datos.modo === 'api') {
        const respuesta = await api<Parameters<typeof Comunidad.responderRemoto>[1] & { recompensas?: PremioActividad }>(`/foro/${encodeURIComponent(id)}/respuestas`, { method: 'POST', json: { texto } });
        Comunidad.responderRemoto(id, respuesta);
        marcarHiloFresco(id);
        registrarPremio(respuesta.recompensas);
      } else Comunidad.responder(id, texto);
      render();
    } catch (err) { toast(mensajeError(err), 'alert-triangle'); }
  }
  if (f.matches('[data-form-perfil]')) {
    e.preventDefault(); const d = new FormData(f);
    const cambios = { nombre: String(d.get('nombre')).trim(), whatsapp: String(d.get('whatsapp')).trim(), especialidad: String(d.get('especialidad')).trim(), ciudad: String(d.get('ciudad')).trim() };
    try {
      if (Datos.modo === 'api') {
        const actual = Perfil.get();
        const perfil = await api<Partial<ReturnType<typeof Perfil.get>>>('/me/perfil', { method: 'PATCH', json: cambios });
        Perfil.hidratar(perfil, actual.plan, actual.vence);
      } else Perfil.set(cambios);
      remontar(); toast('Perfil guardado', 'check');
    } catch (err) { toast(mensajeError(err), 'alert-triangle'); }
  }
  if (f.matches('[data-form-intereses]')) {
    e.preventDefault();
    const intereses = new FormData(f).getAll('intereses').map(String);
    const btn = f.querySelector<HTMLButtonElement>('button[type="submit"], button:not([type])');
    if (btn) btn.disabled = true;
    try {
      await guardarIntereses(intereses);
      remontar();
      toast('Tus intereses quedaron actualizados.', 'sparkles');
    } catch (err) {
      toast(mensajeError(err), 'alert-triangle');
      if (btn) btn.disabled = false;
    }
  }
});

// ── PWA: service worker y botón de instalar fijo, nunca popups ──
if ('serviceWorker' in navigator && import.meta.env.PROD) window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
let deferred: any = null;
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e; });
window.addEventListener('appinstalled', () => { document.querySelectorAll('[data-install]').forEach((x) => x.remove()); toast('OdonTeck quedó instalado en tu dispositivo', 'smartphone'); });
document.addEventListener('click', async (e) => {
  if (!(e.target as HTMLElement).closest('[data-install-btn]')) return;
  if (deferred) { deferred.prompt(); await deferred.userChoice; deferred = null; return; }
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  toast(ios ? 'En iPhone: toca Compartir y luego "Agregar a inicio".' : 'En Chrome: menú ⋮ → "Instalar app" o "Agregar a pantalla principal".', 'smartphone');
});
if (window.matchMedia('(display-mode: standalone)').matches) document.addEventListener('DOMContentLoaded', () => document.querySelectorAll('[data-install]').forEach((x) => x.remove()));
