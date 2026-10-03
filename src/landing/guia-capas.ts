export type GestoGuia = 'reposo' | 'saludo' | 'espera' | 'respuesta';
export type PosturaGuia = 'saludo' | 'orientar' | 'celebrar';
export const FOTOGRAMAS_GUIA = 72;
export const FPS_GUIA = 24;

// Máscaras ajustadas a los tres PNG v01. La mano libre se separa del cuerpo y
// vuelve a solaparse por el puño para que la rotación no abra una costura.
const POSTURAS = {
  saludo: {
    mano: 'M185 250H365L405 330L408 470L370 555L285 566L220 505L175 390Z',
    puno: 'M270 520L410 495L435 565L388 620L275 600Z',
    x: 337, y: 544, cuerpoX: 530,
  },
  orientar: {
    mano: 'M80 425H265L350 485L420 550L425 650L355 684L285 620L205 570L85 545Z',
    puno: 'M330 598L430 575L455 670L390 715L315 675Z',
    x: 386, y: 641, cuerpoX: 530,
  },
  celebrar: {
    mano: 'M255 390H405L438 475L430 610L374 677L295 650L260 555Z',
    puno: 'M315 610L438 595L455 690L385 730L305 690Z',
    x: 378, y: 648, cuerpoX: 530,
  },
} satisfies Record<PosturaGuia, { mano: string; puno: string; x: number; y: number; cuerpoX: number }>;

export function poseGuia(segundos: number, gesto: GestoGuia = 'saludo', postura: PosturaGuia = 'saludo') {
  const t = Math.max(0, Math.min(3, segundos));
  const envolvente = Math.sin(Math.PI * t / 3) ** 2;
  const fuerza = gesto === 'reposo' ? .18 : gesto === 'espera' ? .24 : gesto === 'respuesta' ? .55 : 1;
  if (postura === 'orientar') return { mano: -4 * envolvente * Math.sin(Math.PI * t) * fuerza, cuerpo: -1.1 * envolvente * fuerza, y: 0 };
  if (postura === 'celebrar') return { mano: 5 * envolvente * Math.sin(2 * Math.PI * t) * fuerza, cuerpo: .8 * envolvente * Math.sin(Math.PI * t) * fuerza, y: -6 * envolvente * fuerza };
  return { mano: 10 * envolvente * Math.sin(2 * Math.PI * t) * fuerza, cuerpo: -.65 * envolvente * fuerza, y: 0 };
}

export function dibujoGuia(imagen: string, id: string, postura: PosturaGuia = 'saludo') {
  const p = POSTURAS[postura];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-70 -25 1167 1582" data-postura="${postura}" aria-hidden="true" focusable="false" class="oguia-rig"><defs>
    <clipPath id="${id}-mano"><path d="${p.mano}"/></clipPath>
    <clipPath id="${id}-puno"><path d="${p.puno}"/></clipPath>
    <mask id="${id}-base" maskUnits="userSpaceOnUse" x="0" y="0" width="1027" height="1532"><rect width="1027" height="1532" fill="white"/><path d="${p.mano}" fill="black"/></mask>
    <image id="${id}-imagen" href="${imagen}" width="1027" height="1532" preserveAspectRatio="xMidYMid meet"/>
  </defs><g data-cuerpo transform="rotate(0 ${p.cuerpoX} 1480)"><use href="#${id}-imagen" mask="url(#${id}-base)"/><g data-mano transform="rotate(0 ${p.x} ${p.y})"><use href="#${id}-imagen" clip-path="url(#${id}-mano)"/></g><use href="#${id}-imagen" clip-path="url(#${id}-puno)"/></g></svg>`;
}

export function aplicarPose(svg: SVGElement, pose: ReturnType<typeof poseGuia>) {
  const postura = (svg.getAttribute('data-postura') || 'saludo') as PosturaGuia;
  const p = POSTURAS[postura];
  svg.querySelector('[data-cuerpo]')!.setAttribute('transform', `translate(0 ${pose.y}) rotate(${pose.cuerpo} ${p.cuerpoX} 1480)`);
  svg.querySelector('[data-mano]')!.setAttribute('transform', `rotate(${pose.mano} ${p.x} ${p.y})`);
}
