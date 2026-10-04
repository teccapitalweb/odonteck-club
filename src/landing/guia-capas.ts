export type GestoGuia = 'reposo' | 'saludo' | 'espera' | 'respuesta';
export type PosturaGuia = 'saludo' | 'orientar' | 'celebrar';
export const FOTOGRAMAS_GUIA = 72;
export const FPS_GUIA = 24;

// Máscaras ajustadas a los tres PNG v05. El pivote queda dentro del puño y la
// solapa fija cubre ampliamente la unión para que el antebrazo nunca se separe.
const POSTURAS = {
  saludo: {
    mano: 'M185 220H350L390 305L392 440L410 505L397 575L355 612L288 590L242 520L190 410Z',
    puno: 'M238 414L378 407L420 472L423 568L382 625L258 610L232 517Z',
    x: 319, y: 510, cuerpoX: 520,
  },
  orientar: {
    mano: 'M70 392H250L325 438L385 492L402 568L365 620L302 600L230 550L72 540Z',
    puno: 'M244 442L374 450L416 508L420 594L366 638L260 610L236 520Z',
    x: 320, y: 525, cuerpoX: 520,
  },
  celebrar: {
    mano: 'M265 270H395L424 352L416 478L400 558L360 602L302 570L276 500Z',
    puno: 'M244 420L380 410L420 485L420 580L370 628L255 605L238 515Z',
    x: 318, y: 514, cuerpoX: 520,
  },
} satisfies Record<PosturaGuia, { mano: string; puno: string; x: number; y: number; cuerpoX: number }>;

export function poseGuia(segundos: number, gesto: GestoGuia = 'saludo', postura: PosturaGuia = 'saludo') {
  const t = Math.max(0, Math.min(3, segundos));
  const envolvente = Math.sin(Math.PI * t / 3) ** 2;
  const fuerza = gesto === 'reposo' ? .12 : gesto === 'espera' ? .2 : gesto === 'respuesta' ? .5 : 1;
  if (postura === 'orientar') return { mano: -1.6 * envolvente * Math.sin(Math.PI * t) * fuerza, cuerpo: -1.1 * envolvente * fuerza, desplazamiento: 0 };
  if (postura === 'celebrar') return { mano: 2 * envolvente * Math.sin(2 * Math.PI * t) * fuerza, cuerpo: .8 * envolvente * Math.sin(Math.PI * t) * fuerza, desplazamiento: -6 * envolvente * fuerza };
  return { mano: 2.6 * envolvente * Math.sin(2 * Math.PI * t) * fuerza, cuerpo: -.65 * envolvente * fuerza, desplazamiento: 0 };
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
  svg.querySelector('[data-cuerpo]')!.setAttribute('transform', `translate(0 ${pose.desplazamiento}) rotate(${pose.cuerpo} ${p.cuerpoX} 1480)`);
  svg.querySelector('[data-mano]')!.setAttribute('transform', `rotate(${pose.mano} ${p.x} ${p.y})`);
}
