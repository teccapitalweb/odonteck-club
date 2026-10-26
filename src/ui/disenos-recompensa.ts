export const claseDiseno = (id?: string | null) =>
  id &&
  /^(marco-(orbita|nacar|grafito|turquesa|aurora|prisma)|portada-(minimal|geometria|atlas|nocturna))$/.test(
    id,
  )
    ? `odon-${id}`
    : '';
