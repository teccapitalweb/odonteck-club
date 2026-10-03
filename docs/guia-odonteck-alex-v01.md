# Alex · guía virtual de OdonTeck v01

## Identidad visual

Personaje masculino original para OdonTeck: piel morena cálida, cabello oscuro corto y ondulado,
lentes rectangulares azul marino, bata blanca con vivos teal, filipina teal, pantalón azul marino,
tenis crema/azul y carpeta azul. Estética 3D premium, amable y profesional; fondo transparente.

No reutiliza personajes, imágenes ni identidad de Elite Pecuario. Las tres piezas se generaron con
ImageGen y se conservan en:

- `/public/asistente/odonteck-guia-saludo-v01.png`
- `/public/asistente/odonteck-guia-orientar-v01.png`
- `/public/asistente/odonteck-guia-celebrar-v01.png`

## Prompts finales

### Saludo

> Crea un personaje completamente original para una plataforma mexicana de educación odontológica,
> un guía masculino joven llamado Alex. Cuerpo completo, estilo 3D premium, piel morena cálida,
> cabello oscuro corto y ondulado, lentes rectangulares azul marino, bata blanca con vivos teal,
> filipina teal, pantalón azul marino, tenis crema y azul, carpeta azul marino. Pose amable de saludo
> con una mano levantada. Silueta limpia, iluminación de estudio suave, fondo transparente. Sin texto,
> sin logotipos, sin instrumental ni procedimiento dental. No imitar personajes existentes.

### Orientar

> Conserva exactamente la identidad, ropa, proporciones, rostro, carpeta, iluminación y acabado 3D
> del personaje de referencia. Cambia únicamente el brazo y la mano libres a una pose de presentación:
> palma abierta señalando lateralmente, gesto profesional y acogedor. Cuerpo completo, fondo transparente,
> sin texto ni logotipos.

### Celebrar

> Conserva exactamente la identidad, ropa, proporciones, rostro, carpeta, iluminación y acabado 3D
> del personaje de referencia. Cambia únicamente el brazo y la mano libres a un pulgar arriba profesional,
> con expresión cálida y segura. Cuerpo completo, fondo transparente, sin texto ni logotipos.

## Comportamiento

Alex es una guía conversacional determinista, no una IA clínica. Orienta dentro del catálogo, explica
la membresía y el contenido gratuito, muestra planes sólo si están verificados y ofrece contacto humano.
Nunca diagnostica, recomienda tratamientos, medicamentos, dosis ni protocolos para pacientes. La historia
se guarda únicamente en `sessionStorage`; no se manda a WhatsApp de forma automática.
