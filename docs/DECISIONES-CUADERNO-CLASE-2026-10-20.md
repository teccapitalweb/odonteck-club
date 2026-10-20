# Cuaderno de repaso por clase — decisión y estado

Fecha: 20 de octubre de 2026  
Alcance: experiencia de Notas dentro del reproductor de clase; no cambia pagos, puntos, permisos de membresía ni datos clínicos.

## Decisión de experiencia

- Se conservan las pestañas existentes **Temario / Notas / Quiz / Ficha**. No se agrega otra pestaña ni se mezcla el cuaderno con el juego de cierre.
- La pestaña **Notas** presenta un acceso compacto, no el cuaderno completo dentro de la columna estrecha del reproductor.
- **Abrir cuaderno** presenta la nota completa de esa clase en un diálogo amplio. En escritorio queda centrado y con un único scroll de contenido; en móvil ocupa la pantalla, respeta áreas seguras y también usa un único scroll.
- El diálogo se puede cerrar con su botón o con Escape. “Ir al reto clínico” lo cierra antes de abrir la pestaña Quiz.
- Se conserva el material de repaso ya existente: resumen, conceptos con marca de tiempo, marcas de progreso, preguntas de recuperación, bitácora personal y copia del cuaderno. No se inventan conceptos clínicos ni se sustituye la Ficha descargable.
- El cuaderno es repaso voluntario: abrirlo, escribir o marcar conceptos **no concede puntos**. Las reglas de puntos no se modifican aquí.

## Estado de persistencia (importante)

- El resumen, las marcas de tiempo y las preguntas de recuperación se derivan del contenido local/versionado de cada clase.
- En producción vigente (PR #25), las marcas de conceptos y la bitácora personal aún se guardan en `localStorage` (`odonteck-club:notas-repaso:v1` y `odonteck-club:notas-personales:v1`); el producto indica **“Guardado sólo en este dispositivo”**. En la rama local descrita aquí se añadió sincronización autenticada por UID mediante `/notas-clase/:cursoId/:n` y `v2_notas_clase`; no se migra ni mezcla automáticamente el localStorage anterior, para no mezclar datos entre cuentas. En demo se conserva localStorage.
- Copiar cuaderno utiliza el portapapeles del navegador y no crea un registro remoto.
- Esto es distinto del juego de cierre: su estado y los 5 puntos de la primera finalización por clase se guardan en la API autenticada, con idempotencia. El cuaderno sincronizado no acredita puntos por escribir o marcar conceptos; no se fijó una regla de recompensa para esas acciones.
- El endpoint de la rama exige autenticación y acceso/desbloqueo de la clase, asigna el documento desde el UID verificado (nunca desde el cuerpo), valida índices y limita texto a 1800 caracteres. Borrar el texto y desmarcar todos los conceptos elimina el documento vacío. El cliente no escribe Firestore directamente.

## Implementación y verificación requerida

- Componente: `src/pages/clase.ts` (`notasHTML`); interacción: `src/main.ts`; estilos: `src/styles/components.css`.
- Cada clase con notas mantiene un lanzador y un diálogo identificable por curso/clase. La inicialización existente de progreso y bitácora debe seguir encontrando el tablero dentro del diálogo cerrado.
- Antes de integrar: `npm run build`, `cd api && npm run check && npm test`, auditoría de juegos (`npm run audit:class-games`), `git diff --check`, y prueba manual de una clase con notas en escritorio y viewport móvil: abrir/cerrar, Escape, scroll, copy, sincronización por UID tras recargar, reconexión/reintento, volver al minuto del video e ir del cuaderno al Quiz.
- También probar una clase sin notas: conserva el estado vacío actual y no muestra un lanzador que abra un cuaderno vacío.
- El diálogo y la sincronización del cuaderno son locales hasta integrarse y publicarse. El merge de PR #25 sólo corrigió la respuesta del encabezado; no incluía ni el diálogo amplio ni `/notas-clase`.

## Regla para el siguiente relevo

No afirmar “sincronizado con perfil” o “publicado” por ver el cuaderno, por pasar el build o por probar el demo. Confirmar por separado estado de Git/PR, bundle del despliegue público y API autenticada. Publicar el frontend requiere incluir el commit en la fuente que sirve el dominio; publicar el endpoint requiere deploy de Railway y smoke autenticado. No se otorgan puntos de cuaderno sin una regla aprobada.
