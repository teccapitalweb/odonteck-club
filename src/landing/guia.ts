import { createIcons, icons } from 'lucide';
import { CLUB_GUIA, ES_DEMO_GUIA, escaparGuia as esc, marcaGuia, pesosGuia, type DatosGuia, type EstadoGuia } from './guia-datos';
import { crearSeguimientoRespuestas, posturaRespuesta } from './gestos-guia';
import type { PosturaGuia } from './guia-capas';

interface Opcion { label: string; action: string }
interface Mensaje {
  role: 'assistant' | 'user';
  text: string;
  opciones?: Opcion[];
  cursos?: string[];
  extra?: 'planes' | 'whatsapp';
  postura?: PosturaGuia;
}
type Fuente = () => { datos: DatosGuia | null; estado: EstadoGuia };

const INICIO: Opcion[] = [
  { label: 'Encontrar un curso', action: 'buscar' },
  { label: 'Explorar lo gratuito', action: 'gratis' },
  { label: 'Conocer la membresía', action: 'membresia' },
  { label: 'Cursos en vivo', action: 'envivo' },
  { label: 'Resolver una duda', action: 'duda' },
];
const opcion = (label: string, action = label): Opcion => ({ label, action });

export function montarGuia(fuente: Fuente) {
  const root = document.querySelector<HTMLElement>('#assistant-root');
  if (!root) return { actualizar() {}, abrir() {} };
  const host = root;
  const clave = `${marcaGuia.id}:guia-${ES_DEMO_GUIA ? 'demo' : 'publica'}:v2`;
  const bienvenida: Mensaje = {
    role: 'assistant',
    text: 'Hola, soy Alexia, tu guía de OdonTeck. Te ayudo a encontrar formación dentro del club. ¿Qué te gustaría explorar?',
    opciones: INICIO,
    postura: 'saludo',
  };
  let mensajes: Mensaje[] = [bienvenida];
  let area = '';
  let ocupado = false;
  let abierto = false;
  let focoPrevio: HTMLElement | null = null;
  let bloqueoPagina: { x: number; y: number; top: string } | null = null;
  try {
    const guardado = JSON.parse(sessionStorage.getItem(clave) || 'null');
    if (guardado && Array.isArray(guardado.mensajes) && guardado.mensajes.length
      && guardado.mensajes.every((m: Mensaje) => m && (m.role === 'assistant' || m.role === 'user') && typeof m.text === 'string')) {
      mensajes = guardado.mensajes.slice(-60);
      area = typeof guardado.area === 'string' ? guardado.area : '';
    }
  } catch { /* Una conversación nueva siempre queda disponible. */ }
  const seguirPostura = crearSeguimientoRespuestas(mensajes.filter((m) => m.role === 'assistant').at(-1));

  root.innerHTML = `
    <div class="oguia-saludo" hidden><button class="oguia-icono" data-guia-descartar aria-label="Descartar saludo"><i data-lucide="x"></i></button><p>Hola, soy Alexia. Puedo ayudarte a elegir un curso.</p></div>
    <button class="oguia-launcher" aria-label="Abrir guía OdonTeck" aria-controls="oguia-panel" aria-expanded="false">
      <span class="oguia-personaje" aria-hidden="true"></span><span class="oguia-launcher__copy"><small><i data-lucide="sparkles"></i>Guía OdonTeck</small><strong>Te ayudo a elegir</strong><span>Cursos y membresía <i data-lucide="arrow-up-right"></i></span></span>
    </button>
    <div class="oguia-backdrop" hidden></div>
    <section class="oguia-panel" id="oguia-panel" role="dialog" aria-label="Conversación con Alexia, guía de OdonTeck" aria-modal="false" hidden>
      <span class="oguia-personaje oguia-personaje--panel" aria-hidden="true"></span>
      <div class="oguia-superficie">
        <header class="oguia-header"><div><small>OdonTeck Club</small><strong>Alexia</strong><span>Guía virtual de formación</span></div>
          <button class="oguia-icono" data-guia-repetir aria-label="Repetir saludo de Alexia"><i data-lucide="rotate-ccw"></i></button>
          <button class="oguia-icono" data-guia-pausa aria-label="Pausar animación de Alexia" aria-pressed="false"><i data-lucide="pause" data-icono-pausa></i><i data-lucide="play" data-icono-play hidden></i></button>
          <button class="oguia-icono" data-guia-cerrar aria-label="Minimizar y conservar conversación"><i data-lucide="chevron-down"></i></button>
        </header>
        <div class="oguia-aviso">Orientación sobre el club y su catálogo. No ofrece diagnóstico, tratamiento ni consejo clínico.</div>
        <div class="oguia-mensajes" role="log" aria-label="Historial de la conversación" aria-live="polite" aria-relevant="additions"></div>
        <form class="oguia-compositor"><label><span class="sr-only">Escribe tu pregunta</span><input name="pregunta" placeholder="¿Qué te gustaría aprender?" maxlength="500" autocomplete="off" required></label><button type="submit" aria-label="Enviar pregunta"><i data-lucide="arrow-up"></i></button></form>
        <div class="oguia-footer"><button data-guia-action="asesor">Hablar con el equipo</button><button data-guia-reset>Empezar de nuevo</button></div>
      </div>
    </section>`;

  const launcher = root.querySelector<HTMLButtonElement>('.oguia-launcher')!;
  const panel = root.querySelector<HTMLElement>('.oguia-panel')!;
  const backdrop = root.querySelector<HTMLElement>('.oguia-backdrop')!;
  const saludo = root.querySelector<HTMLElement>('.oguia-saludo')!;
  const log = root.querySelector<HTMLElement>('.oguia-mensajes')!;
  const input = root.querySelector<HTMLInputElement>('.oguia-compositor input')!;
  const enviarBtn = root.querySelector<HTMLButtonElement>('.oguia-compositor button')!;
  const guardar = () => { try { sessionStorage.setItem(clave, JSON.stringify({ mensajes: mensajes.slice(-60), area })); } catch { /* No es crítico. */ } };

  const cursoUrl = (id: string) => `${CLUB_GUIA}/#/curso/${encodeURIComponent(id)}`;
  function tarjetasPlanes(datos: DatosGuia | null) {
    if (!datos) return '<div class="oguia-nota">No pude verificar los planes. El equipo puede confirmarlos.</div>';
    const etiqueta = datos.fuente === 'demo' ? 'Ejemplo local' : 'Precio verificado';
    return `<div class="oguia-planes"><div><small>Mensual</small><strong>${datos.planes.mensual === null ? 'Por confirmar' : `${pesosGuia(datos.planes.mensual)} / mes`}</strong></div><div><small>Anual</small><strong>${datos.planes.anual === null ? 'Por confirmar' : `${pesosGuia(datos.planes.anual)} / año`}</strong></div><span>${etiqueta}</span></div>`;
  }

  function pintar() {
    const { datos } = fuente();
    log.innerHTML = mensajes.map((mensaje) => `<div class="oguia-mensaje ${mensaje.role}"><small>${mensaje.role === 'user' ? 'TÚ' : 'ALEXIA · GUÍA ODONTECK'}</small><div class="oguia-burbuja" tabindex="-1">${esc(mensaje.text)}</div>
      ${mensaje.cursos?.map((id) => {
        const curso = datos?.cursos.find((c) => c.id === id);
        if (!curso) return '';
        return `<article class="oguia-curso"><img src="${esc(curso.imagen)}" alt="" loading="lazy"><div><small>${esc(curso.area)}</small><h4>${esc(curso.titulo)}</h4><p>${curso.clases} clases · ${esc(curso.nivel || 'A tu ritmo')}</p></div><a href="${cursoUrl(curso.id)}">Ver curso <i data-lucide="arrow-up-right"></i></a></article>`;
      }).join('') || ''}
      ${mensaje.extra === 'planes' ? tarjetasPlanes(datos) : ''}
      ${mensaje.opciones?.length ? `<div class="oguia-opciones">${mensaje.opciones.map((o) => `<button data-guia-action="${esc(o.action)}">${esc(o.label)}</button>`).join('')}</div>` : ''}
      ${mensaje.extra === 'whatsapp' ? `<div class="oguia-opciones"><a class="oguia-whatsapp" href="https://wa.me/${marcaGuia.whatsapp}?text=${encodeURIComponent('Hola OdonTeck, quisiera orientación sobre sus cursos y la membresía del club.')}" target="_blank" rel="noopener noreferrer">Abrir WhatsApp <i data-lucide="arrow-up-right"></i></a><button data-guia-copiar>Copiar resumen</button></div>` : ''}</div>`).join('');
    if (ocupado) log.insertAdjacentHTML('beforeend', '<div class="oguia-escribiendo" role="status"><span></span><span></span><span></span> Consultando…</div>');
    enviarBtn.disabled = ocupado;
    log.setAttribute('aria-busy', String(ocupado));
    host.dispatchEvent(new CustomEvent('guia:estado', { detail: { ocupado } }));
    const postura = seguirPostura(mensajes.at(-1), ocupado);
    if (postura) host.dispatchEvent(new CustomEvent('guia:postura', { detail: { postura } }));
    createIcons({ icons, root: host });
    log.scrollTop = log.scrollHeight;
  }

  function responder(text: string, opciones?: Opcion[], cursos?: string[], extra?: Mensaje['extra'], postura?: PosturaGuia) {
    const mensaje: Mensaje = { role: 'assistant', text, opciones, cursos, extra, postura };
    mensaje.postura = posturaRespuesta(mensaje);
    mensajes.push(mensaje);
    guardar();
  }

  function datosDisponibles() {
    const actual = fuente();
    if (actual.estado === 'cargando') {
      responder('Estoy consultando el catálogo. Intenta de nuevo en un momento o habla con el equipo.', [opcion('Volver a intentar', 'buscar'), opcion('Hablar con el equipo', 'asesor')], undefined, undefined, 'saludo');
      return null;
    }
    if (actual.estado === 'error' || !actual.datos) {
      responder('No pude verificar el catálogo. Para cuidarte, no mostraré cursos ni precios sin confirmar.', [opcion('Hablar con el equipo', 'asesor')], undefined, undefined, 'saludo');
      return null;
    }
    return actual.datos;
  }

  function recomendar() {
    const datos = datosDisponibles();
    if (!datos) return;
    const lista = datos.cursos.filter((curso) => !area || curso.area === area).slice(0, 3);
    if (!lista.length) {
      responder('No encontré cursos verificados para esa selección. Podemos probar otra especialidad.', [opcion('Elegir otra área', 'buscar'), opcion('Hablar con el equipo', 'asesor')], undefined, undefined, 'saludo');
      return;
    }
    responder(`${datos.fuente === 'demo' ? 'En esta demostración encontré' : 'Encontré'} ${lista.length} ${lista.length === 1 ? 'curso' : 'cursos'} para ${area || 'seguir explorando'}.`, [opcion('Elegir otra área', 'buscar'), opcion('Conocer la membresía', 'membresia')], lista.map((curso) => curso.id), undefined, datos.fuente === 'api' ? 'celebrar' : 'orientar');
  }

  function actuar(action: string) {
    if (action.startsWith('area:')) { area = action.slice(5); recomendar(); return; }
    switch (action) {
      case 'buscar': {
        const datos = datosDisponibles();
        if (!datos) break;
        const areas = [...new Set(datos.cursos.map((curso) => curso.area).filter(Boolean))];
        responder('¿Qué área de odontología te interesa?', [...areas.map((valor) => opcion(valor, `area:${valor}`)), opcion('No estoy seguro', 'orientar')], undefined, undefined, 'orientar');
        break;
      }
      case 'orientar':
        area = '';
        responder('Podemos empezar por tu objetivo. ¿Quieres resolver un tema puntual o explorar la formación completa?', [opcion('Un tema puntual', 'buscar'), opcion('Formación continua', 'membresia')], undefined, undefined, 'orientar');
        break;
      case 'gratis': {
        const datos = datosDisponibles();
        const primero = datos?.cursos.find((curso) => curso.accesoGratis);
        responder('Puedes explorar casi completo el primer curso; sólo su última clase requiere VIP. En Materiales, el Atlas de caries · Clasificación ICDAS es gratuito. El resto conserva el acceso indicado por el club.', [opcion('Ver cursos', 'buscar'), opcion('Conocer la membresía', 'membresia')], primero ? [primero.id] : undefined, undefined, 'orientar');
        break;
      }
      case 'membresia':
        responder('La membresía reúne cursos grabados, materiales, quizzes, certificados y comunidad. Los cursos en vivo se consultan por separado.', [opcion('Comparar planes', 'planes'), opcion('Explorar cursos', 'buscar'), opcion('Hablar con el equipo', 'asesor')], undefined, undefined, 'orientar');
        break;
      case 'planes': {
        const datos = datosDisponibles();
        if (datos) responder('Estos son los planes disponibles. Si un importe aparece por confirmar, Alexia no lo inventará: el equipo debe validarlo.', [opcion('Explorar cursos', 'buscar'), opcion('Hablar con el equipo', 'asesor')], undefined, 'planes', datos.fuente === 'api' ? 'celebrar' : 'orientar');
        break;
      }
      case 'envivo':
        responder('Los cursos en vivo cambian por edición. El equipo puede confirmar fechas, ponentes, cupo y precio vigentes por WhatsApp.', [opcion('Hablar con el equipo', 'asesor'), opcion('Ver cursos grabados', 'buscar')], undefined, undefined, 'saludo');
        break;
      case 'certificado':
        responder('Al completar un curso se emite un certificado con folio verificable. El folio confirma el documento; no representa una acreditación externa.', [opcion('Encontrar un curso', 'buscar'), opcion('Otra duda', 'duda')], undefined, undefined, 'orientar');
        break;
      case 'duda':
        responder('¿Qué quieres saber sobre OdonTeck?', [opcion('Qué incluye la membresía', 'membresia'), opcion('Contenido gratuito', 'gratis'), opcion('Cómo funciona el certificado', 'certificado'), opcion('Cursos en vivo', 'envivo')], undefined, undefined, 'orientar');
        break;
      case 'asesor':
        responder('Puedes abrir WhatsApp para hablar con el equipo. La conversación no se envía automáticamente; si quieres compartir el contexto, copia el resumen y revísalo antes de pegarlo.', undefined, undefined, 'whatsapp', 'saludo');
        break;
      default: {
        const texto = action.toLocaleLowerCase('es-MX').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (/paciente|diagnost|tratamiento|medicamento|farmaco|dosis|dolor|receta|protocolo/.test(texto)) responder('Puedo orientarte dentro del club, pero no evaluar casos, pacientes, diagnósticos, medicamentos ni tratamientos. Para formación, elige un área del catálogo.', [opcion('Buscar formación', 'buscar')], undefined, undefined, 'saludo');
        else if (/^(?:muchas\s+)?gracias/.test(texto)) responder('¡Con gusto! Aquí estoy si quieres seguir explorando.', INICIO, undefined, undefined, 'celebrar');
        else if (/asesor|humano|persona|whatsapp/.test(texto)) actuar('asesor');
        else if (/certificado|diploma|constancia/.test(texto)) actuar('certificado');
        else if (/precio|costo|plan|membresia|vip/.test(texto)) actuar('planes');
        else if (/gratis|probar|atlas|icdas/.test(texto)) actuar('gratis');
        else {
          const curso = fuente().datos?.cursos.find((c) => texto.includes(c.area.toLocaleLowerCase('es-MX').normalize('NFD').replace(/[\u0300-\u036f]/g, '')));
          if (curso) actuar(`area:${curso.area}`);
          else responder('Mis respuestas son guiadas. Puedo ayudarte a encontrar un curso, explicar la membresía, mostrar lo gratuito o contactar al equipo.', INICIO, undefined, undefined, 'orientar');
        }
      }
    }
  }

  async function enviar(action: string, label: string) {
    if (ocupado) return;
    mensajes.push({ role: 'user', text: label.slice(0, 500) });
    guardar();
    ocupado = true;
    pintar();
    await new Promise((resolve) => setTimeout(resolve, 420));
    actuar(action);
    ocupado = false;
    pintar();
  }

  function bloquearFondo(bloquear: boolean) {
    if (bloquear && !bloqueoPagina) {
      bloqueoPagina = { x: scrollX, y: scrollY, top: document.body.style.top };
      document.body.style.top = `${-scrollY}px`;
      document.documentElement.classList.add('oguia-scroll-lock');
      document.body.classList.add('oguia-scroll-lock');
    } else if (!bloquear && bloqueoPagina) {
      const anterior = bloqueoPagina;
      bloqueoPagina = null;
      document.documentElement.classList.remove('oguia-scroll-lock');
      document.body.classList.remove('oguia-scroll-lock');
      document.body.style.top = anterior.top;
      scrollTo({ left: anterior.x, top: anterior.y, behavior: 'instant' });
    }
  }

  function sincronizarViewport() {
    if (!abierto) return;
    const movil = matchMedia('(max-width:600px)').matches;
    const alto = window.visualViewport?.height || innerHeight;
    const top = (window.visualViewport?.offsetTop || 0) + 8;
    panel.style.setProperty('--oguia-alto', `${Math.round(alto)}px`);
    panel.style.setProperty('--oguia-top', `${Math.round(top)}px`);
    panel.classList.toggle('compacta', alto < (movil ? 650 : 600));
    panel.setAttribute('aria-modal', String(movil));
    bloquearFondo(movil);
  }

  function abrir(action?: string) {
    if (!abierto) focoPrevio = document.activeElement as HTMLElement;
    abierto = true;
    panel.hidden = false;
    backdrop.hidden = false;
    launcher.hidden = true;
    saludo.hidden = true;
    launcher.setAttribute('aria-expanded', 'true');
    sincronizarViewport();
    pintar();
    host.querySelector<HTMLButtonElement>('[data-guia-cerrar]')!.focus({ preventScroll: true });
    if (action) void enviar(action, INICIO.find((item) => item.action === action)?.label || action);
  }

  function cerrar() {
    abierto = false;
    panel.hidden = true;
    backdrop.hidden = true;
    launcher.hidden = false;
    launcher.setAttribute('aria-expanded', 'false');
    bloquearFondo(false);
    (focoPrevio?.isConnected ? focoPrevio : launcher)?.focus({ preventScroll: true });
  }

  launcher.addEventListener('click', () => abrir());
  backdrop.addEventListener('click', cerrar);
  root.querySelector('[data-guia-cerrar]')!.addEventListener('click', cerrar);
  root.querySelector('[data-guia-descartar]')!.addEventListener('click', () => { saludo.hidden = true; });
  root.querySelector<HTMLFormElement>('.oguia-compositor')!.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const texto = input.value.trim();
    if (!texto || ocupado) return;
    input.value = '';
    void enviar(texto, texto);
  });
  root.addEventListener('click', (evento) => {
    const objetivo = evento.target as HTMLElement;
    const accion = objetivo.closest<HTMLElement>('[data-guia-action]');
    if (accion) void enviar(accion.dataset.guiaAction!, accion.textContent!.trim());
    if (objetivo.closest('[data-guia-reset]') && !ocupado) { mensajes = [bienvenida]; area = ''; guardar(); pintar(); }
    if (objetivo.closest('[data-guia-copiar]')) {
      const resumen = `Consulta en OdonTeck:\n${mensajes.filter((m) => m.role === 'user').slice(-8).map((m) => `• ${m.text}`).join('\n')}\nRevisa este texto antes de compartirlo.`;
      void navigator.clipboard.writeText(resumen).then(() => { responder('Resumen copiado. Revísalo antes de pegarlo en WhatsApp.'); pintar(); }).catch(() => { responder('El navegador no permitió copiar. Puedes seleccionar el historial manualmente.'); pintar(); });
    }
  });
  document.addEventListener('click', (evento) => {
    const acceso = (evento.target as HTMLElement).closest<HTMLElement>('[data-assistant]');
    if (acceso && !root.contains(acceso)) abrir(acceso.dataset.assistant);
  });
  panel.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape') { evento.preventDefault(); cerrar(); }
    if (evento.key === 'Tab' && matchMedia('(max-width:600px)').matches) {
      const nodos = [...panel.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input')].filter((nodo) => nodo.getClientRects().length);
      const primero = nodos[0], ultimo = nodos.at(-1);
      if (evento.shiftKey && document.activeElement === primero) { evento.preventDefault(); ultimo?.focus(); }
      else if (!evento.shiftKey && document.activeElement === ultimo) { evento.preventDefault(); primero?.focus(); }
    }
  });
  window.visualViewport?.addEventListener('resize', sincronizarViewport, { passive: true });
  window.visualViewport?.addEventListener('scroll', sincronizarViewport, { passive: true });
  addEventListener('resize', sincronizarViewport, { passive: true });
  setTimeout(() => {
    try {
      const claveSaludo = `${clave}:saludo`;
      if (!sessionStorage.getItem(claveSaludo) && scrollY < 20 && !abierto) { saludo.hidden = false; sessionStorage.setItem(claveSaludo, '1'); }
    } catch { /* El acceso principal sigue visible. */ }
  }, 1500);
  pintar();
  createIcons({ icons, root });
  return { actualizar: pintar, abrir };
}
