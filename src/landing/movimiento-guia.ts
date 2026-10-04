import { marcaGuia as marca } from './guia-datos';
import { aplicarPose, dibujoGuia, FOTOGRAMAS_GUIA, FPS_GUIA, poseGuia } from './guia-capas';
import type { GestoGuia, PosturaGuia } from './guia-capas';

const montados = new WeakSet<HTMLElement>();
const TRANSICION_POSTURA_MS = 110;

/** Tres PNG transparentes montados como SVG por capas: cuerpo, mano y puño. */
export function montarMovimientoGuia(root: HTMLElement) {
  if (montados.has(root)) return;
  montados.add(root);
  const personajes = [...root.querySelectorAll<HTMLElement>('.mascot')];
  const rigs = personajes.map(() => new Map<PosturaGuia, SVGElement>());
  const repetir = root.querySelector<HTMLButtonElement>('[data-guia-saludo]')!;
  const pausa = root.querySelector<HTMLButtonElement>('[data-guia-pausa]')!;
  const rutas: Record<PosturaGuia, string> = {
    saludo: marca.saludo,
    orientar: marca.orientar,
    celebrar: marca.celebrar,
  };
  const disponibles = new Set<PosturaGuia>();
  const reducido = matchMedia('(prefers-reduced-motion: reduce)');
  const clavePausa = `${marca.id}:guia-pausada:v1`;
  let pausada = false;
  try { pausada = sessionStorage.getItem(clavePausa) === '1'; } catch { /* La guía sigue estática. */ }
  let cargada = false;
  let ocupada = false;
  let posturaActual: PosturaGuia = 'saludo';
  let gesto: GestoGuia = 'saludo';
  let paso = 0;
  let temporizador: ReturnType<typeof setTimeout> | undefined;
  let transicion = false;
  let versionTransicion = 0;
  let alternanciaPermitida = root.dataset.guiaAlternancia !== 'neutral';
  let neutralPendiente = false;
  let proximaAlternancia = 0;
  root.dataset.guiaPostura = posturaActual;
  root.dataset.guiaAlternancia = alternanciaPermitida ? 'libre' : 'neutral';

  function detener() { clearTimeout(temporizador); temporizador = undefined; }
  function cancelarTransicion() {
    if (transicion) { detener(); transicion = false; versionTransicion++; }
    root.classList.remove('guia-postura-salida', 'guia-postura-entrada');
  }
  function permiteGesto() {
    return cargada && !pausada && !reducido.matches && !ocupada && !document.hidden;
  }
  function renovarAlternancia() {
    proximaAlternancia = Date.now() + 12000 + Math.floor(Math.random() * 8001);
  }
  function mostrar(fotograma: number) {
    const pose = poseGuia(fotograma / FPS_GUIA, gesto, posturaActual);
    rigs.forEach((opciones) => {
      const svg = opciones.get(posturaActual);
      if (svg) aplicarPose(svg, pose);
    });
    root.dataset.guiaFrame = String(fotograma);
  }
  function actualizarControles() {
    repetir.disabled = !cargada || pausada || reducido.matches || ocupada || transicion;
    pausa.disabled = !cargada || reducido.matches;
    pausa.setAttribute('aria-pressed', String(pausada));
    pausa.setAttribute('aria-label', reducido.matches ? 'Movimiento desactivado por accesibilidad' : pausada ? 'Reanudar animación de Alexia' : 'Pausar animación de Alexia');
    pausa.title = pausa.getAttribute('aria-label')!;
    pausa.querySelector('[data-guia-icono="pause"]')!.toggleAttribute('hidden', pausada);
    pausa.querySelector('[data-guia-icono="play"]')!.toggleAttribute('hidden', !pausada);
  }
  function seleccionar(postura: PosturaGuia) {
    if (!permiteGesto() || !disponibles.has(postura)) return false;
    posturaActual = postura;
    root.dataset.guiaPostura = postura;
    rigs.forEach((opciones) => {
      opciones.forEach((svg) => svg.toggleAttribute('hidden', true));
      opciones.get(postura)!.toggleAttribute('hidden', false);
    });
    actualizarControles();
    return true;
  }
  function cambiarPostura(postura: PosturaGuia, nuevo: GestoGuia = 'saludo', prioridad = false) {
    if (!permiteGesto() || !disponibles.has(postura)) return;
    if (transicion) {
      if (!prioridad) return;
      cancelarTransicion();
      actualizarControles();
    }
    if (postura === posturaActual) {
      if (!prioridad) renovarAlternancia();
      reproducir(nuevo);
      return;
    }
    detener();
    transicion = true;
    const version = ++versionTransicion;
    root.classList.add('guia-postura-salida');
    actualizarControles();
    temporizador = setTimeout(() => {
      if (!transicion || version !== versionTransicion) return;
      temporizador = undefined;
      if (!seleccionar(postura)) { cancelarTransicion(); actualizarControles(); return; }
      gesto = nuevo;
      paso = 0;
      if (!prioridad) renovarAlternancia();
      root.dataset.guiaEstado = nuevo;
      mostrar(0);
      root.classList.remove('guia-postura-salida');
      root.classList.add('guia-postura-entrada');
      temporizador = setTimeout(() => {
        if (!transicion || version !== versionTransicion) return;
        temporizador = undefined;
        cancelarTransicion();
        actualizarControles();
        if (!permiteGesto()) return;
        paso = 1;
        temporizador = setTimeout(avanzar, 1000 / FPS_GUIA);
      }, TRANSICION_POSTURA_MS);
    }, TRANSICION_POSTURA_MS);
  }
  function montarPostura(postura: PosturaGuia, ruta: string) {
    personajes.forEach((personaje, indice) => {
      if (rigs[indice].has(postura)) return;
      const id = `odt-guia-${indice}-${postura}`;
      const dibujo = dibujoGuia(ruta, id, postura)
        .replace('<svg ', `<svg data-guia-rig="${postura}"${postura === posturaActual ? '' : ' hidden'} `);
      personaje.insertAdjacentHTML('beforeend', dibujo);
      rigs[indice].set(postura, personaje.querySelector<SVGElement>(`[data-guia-rig="${postura}"]`)!);
    });
  }
  function precargar(postura: PosturaGuia) {
    const imagen = new Image();
    let resuelta = false;
    let decodificando = false;
    const fallar = () => {
      if (resuelta) return;
      resuelta = true;
      if (postura === 'saludo') {
        detener();
        root.dataset.guiaEstado = 'error';
      }
      actualizarControles();
    };
    const aceptar = () => {
      if (resuelta) return;
      resuelta = true;
      disponibles.add(postura);
      montarPostura(postura, imagen.src);
      if (postura === 'saludo') {
        cargada = true;
        personajes.forEach((personaje) => personaje.classList.add('motion-ready'));
        actualizarControles();
        reproducir(alternanciaPermitida ? 'saludo' : 'reposo');
      } else actualizarControles();
    };
    imagen.onload = () => {
      if (resuelta || decodificando) return;
      decodificando = true;
      if (typeof imagen.decode === 'function') imagen.decode().then(aceptar, fallar);
      else aceptar();
    };
    imagen.onerror = fallar;
    imagen.src = rutas[postura];
  }
  function avanzar() {
    detener();
    if (!cargada) return;
    if (pausada || reducido.matches) {
      mostrar(0);
      root.dataset.guiaEstado = reducido.matches ? 'reducido' : 'pausada';
      return;
    }
    if (document.hidden || !personajes.some((personaje) => personaje.getClientRects().length)) return;
    if (gesto === 'reposo' && paso === 0 && !ocupada) {
      root.dataset.guiaEstado = 'reposo';
      mostrar(0);
      if (!alternanciaPermitida) return;
      if (Date.now() >= proximaAlternancia) {
        const opciones = [...disponibles].filter((postura) => postura !== posturaActual);
        if (opciones.length) {
          cambiarPostura(opciones[Math.floor(Math.random() * opciones.length)]);
          return;
        }
        renovarAlternancia();
      }
      temporizador = setTimeout(avanzar, Math.min(2600, Math.max(1, proximaAlternancia - Date.now())));
      return;
    }
    root.dataset.guiaEstado = gesto;
    mostrar(paso);
    const demora = gesto === 'reposo' && paso === 0 ? 2600 : 1000 / FPS_GUIA;
    paso++;
    if (paso >= FOTOGRAMAS_GUIA) { paso = 0; gesto = ocupada ? 'espera' : 'reposo'; }
    temporizador = setTimeout(avanzar, demora);
  }
  function reproducir(nuevo: GestoGuia) {
    cancelarTransicion();
    if (neutralPendiente && !alternanciaPermitida && permiteGesto() && seleccionar('saludo')) {
      neutralPendiente = false;
      nuevo = 'reposo';
    }
    gesto = nuevo;
    paso = 0;
    avanzar();
  }

  root.addEventListener('guia:estado', (evento) => {
    const detalle = (evento as CustomEvent<{ ocupado: boolean }>).detail;
    if (!detalle || typeof detalle.ocupado !== 'boolean') return;
    const antes = ocupada;
    ocupada = detalle.ocupado;
    actualizarControles();
    if (antes !== ocupada) reproducir(ocupada ? 'espera' : 'respuesta');
    actualizarControles();
  });
  root.addEventListener('guia:postura', (evento) => {
    const detalle: unknown = (evento as CustomEvent).detail;
    if (!detalle || typeof detalle !== 'object' || Array.isArray(detalle)) return;
    const { postura, alternar } = detalle as { postura?: unknown; alternar?: unknown };
    if (postura !== 'saludo' && postura !== 'orientar' && postura !== 'celebrar') return;
    alternanciaPermitida = typeof alternar === 'boolean' ? alternar : postura !== 'saludo';
    neutralPendiente = !alternanciaPermitida && !permiteGesto() && posturaActual !== 'saludo';
    root.dataset.guiaAlternancia = alternanciaPermitida ? 'libre' : 'neutral';
    renovarAlternancia();
    cambiarPostura(postura, postura === 'saludo' ? 'respuesta' : 'saludo', true);
  });
  root.addEventListener('guia:saludo', () => { if (!repetir.disabled) reproducir('saludo'); });
  repetir.addEventListener('click', () => { if (!repetir.disabled) cambiarPostura('saludo'); });
  pausa.addEventListener('click', () => {
    if (pausa.disabled) return;
    pausada = !pausada;
    try { sessionStorage.setItem(clavePausa, pausada ? '1' : '0'); } catch { /* Sin almacenamiento. */ }
    if (!pausada) renovarAlternancia();
    reproducir(ocupada ? 'espera' : 'reposo');
    actualizarControles();
  });
  reducido.addEventListener('change', () => {
    if (!reducido.matches) renovarAlternancia();
    reproducir(ocupada ? 'espera' : 'reposo');
    actualizarControles();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelarTransicion(); detener(); actualizarControles(); }
    else { renovarAlternancia(); reproducir(ocupada ? 'espera' : 'reposo'); actualizarControles(); }
  });

  renovarAlternancia();
  actualizarControles();
  (Object.keys(rutas) as PosturaGuia[]).forEach(precargar);
}
