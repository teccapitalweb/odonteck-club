import { marcaGuia } from './guia-datos';
import { aplicarPose, dibujoGuia, FOTOGRAMAS_GUIA, FPS_GUIA, poseGuia } from './guia-capas';
import type { GestoGuia, PosturaGuia } from './guia-capas';

const montados = new WeakSet<HTMLElement>();
const TRANSICION_MS = 120;

/** Tres PNG transparentes montados como SVG por capas: cuerpo, mano y puño. */
export function montarMovimientoGuia(root: HTMLElement) {
  if (montados.has(root)) return;
  montados.add(root);
  const personajes = [...root.querySelectorAll<HTMLElement>('.oguia-personaje')];
  const rigs = personajes.map(() => new Map<PosturaGuia, SVGElement>());
  const repetir = root.querySelector<HTMLButtonElement>('[data-guia-repetir]')!;
  const pausa = root.querySelector<HTMLButtonElement>('[data-guia-pausa]')!;
  const rutas: Record<PosturaGuia, string> = {
    saludo: marcaGuia.saludo,
    orientar: marcaGuia.orientar,
    celebrar: marcaGuia.celebrar,
  };
  const disponibles = new Set<PosturaGuia>();
  const reducido = matchMedia('(prefers-reduced-motion: reduce)');
  const clavePausa = `${marcaGuia.id}:guia-pausada:v1`;
  let pausada = false;
  try { pausada = sessionStorage.getItem(clavePausa) === '1'; } catch { /* La guía sigue estática. */ }
  let cargada = false;
  let ocupada = false;
  let posturaActual: PosturaGuia = 'saludo';
  let posturaDeseada: PosturaGuia = 'saludo';
  let gesto: GestoGuia = 'reposo';
  let paso = 0;
  let temporizador: ReturnType<typeof setTimeout> | undefined;
  let transicion = 0;

  const detener = () => { clearTimeout(temporizador); temporizador = undefined; };
  const permiteMovimiento = () => cargada && !pausada && !reducido.matches && !document.hidden;

  function actualizarControles() {
    repetir.disabled = !permiteMovimiento() || ocupada;
    pausa.disabled = !cargada || reducido.matches;
    pausa.setAttribute('aria-pressed', String(pausada));
    pausa.setAttribute('aria-label', reducido.matches ? 'Movimiento desactivado por accesibilidad' : pausada ? 'Reanudar animación de Alexia' : 'Pausar animación de Alexia');
    pausa.querySelector('[data-icono-pausa]')?.toggleAttribute('hidden', pausada);
    pausa.querySelector('[data-icono-play]')?.toggleAttribute('hidden', !pausada);
  }

  function mostrar(frame: number) {
    const pose = poseGuia(frame / FPS_GUIA, gesto, posturaActual);
    rigs.forEach((opciones) => {
      const svg = opciones.get(posturaActual);
      if (svg) aplicarPose(svg, pose);
    });
  }

  function avanzar() {
    detener();
    if (!permiteMovimiento() || !personajes.some((p) => p.getClientRects().length)) { mostrar(0); return; }
    mostrar(paso++);
    if (paso >= FOTOGRAMAS_GUIA) { paso = 0; gesto = ocupada ? 'espera' : 'reposo'; }
    temporizador = setTimeout(avanzar, gesto === 'reposo' && paso === 1 ? 2400 : 1000 / FPS_GUIA);
  }

  function reproducir(nuevo: GestoGuia) {
    detener();
    gesto = nuevo;
    paso = 0;
    avanzar();
  }

  function seleccionar(postura: PosturaGuia, nuevo: GestoGuia = 'respuesta') {
    posturaDeseada = postura;
    if (!disponibles.has(postura)) return;
    const version = ++transicion;
    root.classList.add('oguia-postura-salida');
    setTimeout(() => {
      if (version !== transicion) return;
      posturaActual = postura;
      rigs.forEach((opciones) => opciones.forEach((svg, clave) => svg.toggleAttribute('hidden', clave !== postura)));
      root.dataset.postura = postura;
      root.classList.remove('oguia-postura-salida');
      root.classList.add('oguia-postura-entrada');
      reproducir(nuevo);
      setTimeout(() => { if (version === transicion) root.classList.remove('oguia-postura-entrada'); }, TRANSICION_MS);
    }, TRANSICION_MS);
  }

  function montarPostura(postura: PosturaGuia, ruta: string) {
    personajes.forEach((personaje, indice) => {
      const id = `odt-guia-${indice}-${postura}`;
      const dibujo = dibujoGuia(ruta, id, postura).replace('<svg ', `<svg data-guia-rig="${postura}"${postura === posturaActual ? '' : ' hidden'} `);
      personaje.insertAdjacentHTML('beforeend', dibujo);
      rigs[indice].set(postura, personaje.querySelector<SVGElement>(`[data-guia-rig="${postura}"]`)!);
    });
  }

  function precargar(postura: PosturaGuia, ruta: string) {
    const imagen = new Image();
    imagen.onload = () => {
      if (disponibles.has(postura)) return;
      disponibles.add(postura);
      montarPostura(postura, ruta);
      if (postura === posturaDeseada && postura !== posturaActual) seleccionar(postura, 'respuesta');
      if (postura === 'saludo') {
        cargada = true;
        personajes.forEach((p) => p.classList.add('motion-ready'));
        reproducir('saludo');
      }
      actualizarControles();
    };
    imagen.onerror = actualizarControles;
    imagen.src = ruta;
  }

  root.addEventListener('guia:estado', (evento) => {
    const detalle = (evento as CustomEvent<{ ocupado?: unknown }>).detail;
    if (typeof detalle?.ocupado !== 'boolean' || detalle.ocupado === ocupada) return;
    ocupada = detalle.ocupado;
    reproducir(ocupada ? 'espera' : 'respuesta');
    actualizarControles();
  });
  root.addEventListener('guia:postura', (evento) => {
    const postura = (evento as CustomEvent<{ postura?: unknown }>).detail?.postura;
    if (postura === 'saludo' || postura === 'orientar' || postura === 'celebrar') seleccionar(postura, postura === 'saludo' ? 'respuesta' : 'saludo');
  });
  repetir.addEventListener('click', () => seleccionar('saludo', 'saludo'));
  pausa.addEventListener('click', () => {
    if (pausa.disabled) return;
    pausada = !pausada;
    try { sessionStorage.setItem(clavePausa, pausada ? '1' : '0'); } catch { /* No es crítico. */ }
    reproducir(ocupada ? 'espera' : 'reposo');
    actualizarControles();
  });
  reducido.addEventListener('change', () => { reproducir(ocupada ? 'espera' : 'reposo'); actualizarControles(); });
  document.addEventListener('visibilitychange', () => document.hidden ? detener() : reproducir(ocupada ? 'espera' : 'reposo'));

  actualizarControles();
  (Object.entries(rutas) as [PosturaGuia, string][]).forEach(([postura, ruta]) => precargar(postura, ruta));
}
