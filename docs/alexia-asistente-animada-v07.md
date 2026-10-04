# Alexia · asistente 3D animada v07

Fecha: 3 de octubre de 2026. Integración local; sin publicación.

## Dirección elegida

La opción H, **3D editorial suave**, es la identidad activa del asistente. Conserva el blazer azul marino corto, top marfil acanalado, pantalón verde agua amplio, botines crema, aretes teal, pin dental y tableta azul marino.

## Posturas

| Estado | Archivo | Uso |
|---|---|---|
| Saludo | `/public/asistente/odonteck-guia-saludo-v05.png` | Bienvenida y repetición manual |
| Orientar | `/public/asistente/odonteck-guia-orientar-v05.png` | Opciones, cursos y planes |
| Celebrar | `/public/asistente/odonteck-guia-celebrar-v05.png` | Respuestas positivas y logros |

Los tres activos son PNG RGBA de 1024 × 1536 con fondo transparente. La identidad, vestuario, encuadre y escala permanecen constantes; cambia únicamente el brazo libre.

## Animación inspirada en Elite Pecuario

- Cada postura se monta como SVG con cuerpo, mano y puño superpuesto.
- El brazo libre se mueve con una curva corta de 72 muestras a 24 fps nominales; el cuerpo tiene un balanceo mínimo.
- El contexto del diálogo elige automáticamente saludo, orientación o celebración.
- Durante el reposo positivo puede alternar entre posturas, sin repetir la actual, después de 12 a 20 segundos.
- Estados de error, información no verificada o atención humana mantienen una postura neutral.
- Incluye transición sin superponer siluetas, precarga de activos y respaldo estático si falla la imagen base.
- Pausa/reanudación persiste durante la sesión, respeta `prefers-reduced-motion` y detiene temporizadores cuando la pestaña está oculta.

No es un video ni un modelo 3D articulado. La animación combina imágenes transparentes completas con recortes SVG controlados.

## Prompts de ImageGen

Modo utilizado: ImageGen integrado, edición `identity-preserve`, usando `alexia-concepto-h-3d-editorial.png` como referencia exacta.

### Orientar

Cambiar únicamente el brazo libre del lado izquierdo del espectador: bajarlo y extenderlo a la altura de cintura/pecho, con la palma hacia arriba en un gesto natural de “te muestro las opciones”. Conservar exactamente identidad, rostro, cabello, outfit, tableta, postura corporal, escala, iluminación y acabado 3D; cuerpo completo, fondo alfa transparente y anatomía correcta.

### Celebrar

Cambiar únicamente el brazo libre del lado izquierdo del espectador: pulgar arriba relajado a la altura del pecho, codo flexionado y cuatro dedos cerrados de forma natural. Conservar exactamente identidad, rostro, cabello, outfit, tableta, postura corporal, escala, iluminación y acabado 3D; cuerpo completo, fondo alfa transparente y anatomía correcta.
