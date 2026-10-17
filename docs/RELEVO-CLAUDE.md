# Relevo operativo para Claude · OdonTeck Club

> Lee este archivo antes de trabajar. Es el corte corto y vigente; `CONTEXTO-MAESTRO.md` conserva el detalle histórico y `contrato.md` define datos y endpoints.

## 1. Fuente de verdad

- Repositorio: `https://github.com/teccapitalweb/odonteck-club.git`
- Rama: `main`
- Corte público verificado: `13797ef`
- Dominio: `https://www.odonteckconsulting.com/`
- Frontend: GitHub Pages mediante el workflow `Pages`; última ejecución pública verificada `38976464505` (`success`, commit `13797ef`)
- API: `https://api-production-db314.up.railway.app`
- Railway: proyecto `odonteck-club-v2`, servicio `api`, despliegue funcional `28536ee0-32f0-475f-980a-4278205c4a64` (`SUCCESS`, commit `13797ef`)

Un commit posterior que sólo cambie documentación no implica un runtime distinto. Verifica siempre Git, Cloudflare y Railway por separado.

## 2. No tocar ni mezclar

- No mezclar OdonTeck con Élite/Visión Pecuaria, Agrotec América u otros productos. Sólo pueden usarse como referencia visual o de comportamiento.
- No exponer `.env`, service accounts, llaves Bunny/Stripe/Firebase ni datos personales.
- No modificar pagos, webhooks, membresías heredadas, DNS, reglas o producción sin autorización explícita y verificación previa.
- No subir `public/libros/`: requiere auditoría de autoría, licencias y tamaño.
- Preservar estos archivos locales sin seguimiento:

```text
.claude/
docs/prompts-hero-carrusel-v2.md
docs/prompts-hero-carrusel.md
docs/prompts-hero-expand.md
docs/prompts-portadas-libros.md
public/fotos/inicio-aurora-odontologia-v1.png
public/libros/
```

## 3. Estado real del producto

Publicado y conectado en modo API:

- autenticación, identidad/foto de Google y membresía heredada;
- catálogo, cursos, videos firmados, progreso secuencial, quizzes y certificados;
- materiales privados con lector PDF.js;
- Recompensas, puntos, canjes, logros y notificaciones;
- Retos V2 respaldado por API para quiz relámpago/práctica;
- Comunidad visual respaldada por `/foro`;
- entrevista inicial, encuestas posteriores e intereses editables;
- Brújula profesional opcional (`brujula-v1`) con resultado no diagnóstico y recomendaciones combinadas;
- landing y Alexia Concierge;
- perfil, sesiones/eventos y panel admin cableado a `/admin/*`.
- evaluaciones v2 con autoría administrativa, versión de contenido y calificación de selección, selección múltiple, ordenar, relacionar y completar; las soluciones se conservan en servidor. En la clase, el miembro ve un reto guiado paso a paso con descarte de distractores, bitácora privada, confianza obligatoria, calibración posterior, feedback por pregunta, puntaje visual y ordenamiento accesible mediante controles subir/bajar. La API conserva los diez intentos más recientes, mejor puntuación y aprobación histórica sin duplicar puntos; la metacognición no cambia el puntaje. En la rama local `feat/juegos-cierre-clase`, antes del reto aparece además una misión de memoria ligada a las notas de esa clase; no entrega puntos ni contiene soluciones clínicas nuevas;
- corte local posterior a producción: Retos reutiliza el banco v2 en modo práctica para selección múltiple, ordenar, relacionar y completar, con crédito parcial, controles accesibles y solución sólo después de responder. Simulación sigue limitada a selección. El admin controla la elegibilidad con `compatibleRetos`; todavía no está desplegado;
- corte local posterior a producción: Directorio es un módulo principal independiente en `#/directorio` (la URL anterior dentro de Comunidad redirige), con perfiles visuales tipo CV, foto, portada, años de experiencia, idiomas, trayectoria, formación, credenciales, oportunidades y conexiones privadas. La configuración admite listas repetibles y la ficha pública muestra métricas y línea de tiempo sin exponer contacto. Se endureció con ocultar/eliminar perfil, cierre de oportunidades, cursores estables, límites anti-spam, conexiones idempotentes, bloqueo de vencidas, verificación real de foto/portada en Storage y denuncia/moderación administrativa. La suite local pasa, pero reglas, índices y runtime todavía no están desplegados;
- pestaña de ficha por clase y descarga privada firmada cuando la ficha está aprobada. Aún no hay fichas clínicas aprobadas: no confundir infraestructura lista con contenido revisado.

Demo local sin `VITE_API_URL`:

- usa semillas y `localStorage` intencionalmente;
- puede contener ranking, publicaciones editoriales, casos o flashcards que aún no son datos remotos;
- sirve para diseño, no como prueba de producción.

### Rendimiento (rama perf/arranque-cache-directorio)

Trabajo local, sin fusionar ni desplegar:

- **Caché de verificación de token** (`api/src/middleware/auth.js`): sólo para `GET` de miembro; dura como máximo 5 minutos o hasta el `exp` del token. Nunca se usa para escrituras, `/admin/*`, `GET /materiales/:id/descarga` ni `GET /clases/:cursoId/:n/ficha` (emiten URLs firmadas), ni para usuarios con claim admin. Un rechazo en vivo deja una lápida para que una verificación más antigua no vuelva a cachear un token revocado, y los `GET` simultáneos del mismo token comparten una sola verificación.
- **API**: `compression` y CORS `maxAge` de 7200 s; lecturas independientes en paralelo (en `prepararClase` se esperan en orden para conservar 404 > 403 > 500) y `tx.getAll` en las recompensas transaccionales. `GET /foro` sin filtro conserva el tope de 300 temas.
- **Cliente**: arranque en paralelo y caché de 60 s de Directorio y Comunidad (`src/core/remoto.ts`).
- **Índices**: los compuestos del Directorio (`api/firestore.indexes.json`) siguen pendientes de crear en la consola de Firebase; mientras falten, la API hace un escaneo de respaldo acotado, más lento pero con el mismo resultado.
- **Estáticos**: `public/_headers` sirve `/assets/*` como inmutables (un año); `/`, `index.html` y `sw.js` van con `no-cache`.

## 4. Materiales y lector

Archivos principales:

- `src/pages/visor.ts`
- `src/styles/visor.css`
- `src/main.ts`
- `api/src/lib/recompensas.js`
- ruta API `GET /materiales/:id/descarga`

Cadena de acceso:

1. El usuario abre `#/materiales/:id/visor`.
2. El cliente pide `/materiales/:id/descarga` con Firebase ID token.
3. La API vuelve a validar material gratuito, VIP o desbloqueo permanente.
4. Si procede, entrega una URL HMAC con vigencia de 10 minutos.
5. El cliente descarga el PDF en memoria y PDF.js lo renderiza en `canvas`.

El build de producción se comprobó con 0 PDF y 0 directorios `libros`. No convertir las páginas a imágenes públicas ni persistir la URL firmada.

Comportamiento verificado: dos páginas en escritorio, una en móvil, zoom, arrastre, swipe, teclado, pantalla completa, salto, reanudación y bloqueo correcto cuando faltan puntos.

## 5. Economía de puntos

| Acción | Puntos |
|---|---:|
| Ver una clase | 10 |
| Completar un curso | 50 |
| Aprobar un quiz | 20 |
| Respuesta correcta en Retos | 10 |
| Intento en Retos | 2 |
| Entrevista de bienvenida | 25 |
| Encuesta de curso | 20 |
| Encuesta de experiencia | 40 |
| Crear tema en Comunidad | 10 |
| Responder en Comunidad | 5 |
| Membresía confirmada | 300 |

Los movimientos usan claves idempotentes en `v2_recompensas_movimientos`. La sincronización inicial reconoce la actividad histórica; no dupliques recompensas por reintento, recarga o migración.

### Canjes vigentes

- Atlas ICDAS: gratuito.
- Guía de diagnóstico ortodóncico: 250.
- Consentimiento informado: 300.
- Tabla de dosis: 350.
- Plantilla de nota/receta: 400.
- Protocolo de abscesos: 450.
- Guía de materiales: 500.
- Checklist de urgencias pediátricas: 500.
- Guía de endodoncia: 550.
- Manual de resinas: 600.
- Praxia 30 días: 1500; crea una solicitud `pendiente`, no una activación automática.

VIP conserva acceso a los nueve materiales premium sin consumir puntos. Un canje de material es permanente.

## 6. Logros y avisos

La API devuelve `recompensas` al completar acciones. `src/main.ts` dispara `recompensas:ganadas`, muestra un toast de puntos y un toast por cada logro nuevo. La API guarda los avisos en `v2_recompensas_estado.notificaciones`; la campana muestra el total no leído y los marca al abrirla.

Logros actuales:

- Primer paso: 1 clase.
- En marcha: 5 clases.
- Primer certificado: 1 curso.
- Mente clínica: 3 quizzes.
- Retador constante: 100 puntos de Retos.
- Voz de comunidad: primer tema.
- Especialista: 3 cursos.
- Maestro: 10 cursos.
- Miembro del club: membresía pagada.

No recrear estos avisos sólo en el cliente: el servidor y la idempotencia son la fuente de verdad.

## 7. Verificación del corte

Comprobado localmente el 12 de octubre de 2026 (el runtime público sigue en el corte indicado arriba):

```text
build frontend de producción       PASS
api npm run check                  PASS
api npm test                       138 totales; 137 pass; 0 fail; 1 skip
npm audit                          0 vulnerabilidades
dist                               0 PDF; 0 libros
visor móvil/escritorio             PASS; sin errores de consola
dominio oficial                    HTTP 200
API /health                        HTTP 200
```

La prueba omitida en `npm test` (`reglas de Firestore y Storage`) es un *skip* intencional: se ejecuta aparte con `npm run test:rules`.

### Verificación local del perfil tipo CV · 2026-10-14

```text
build frontend                     PASS
api npm run check                 PASS
api npm test                      140 totales; 139 pass; 0 fail; 1 skip
directorio escritorio 1440×900    PASS; sin overflow ni errores de consola
directorio móvil 390×844          PASS; sin overflow ni errores de consola
```

La suite específica del Directorio pasa 15/15, incluidos privacidad, payload CV, portada WebP, foto, anti-spam y moderación. El reintento de `npm run test:rules` de este corte no alcanzó las aserciones porque el emulador Firestore volvió a fallar al crear el selector loopback de Java (`Unable to establish loopback connection`); no se cambiaron las reglas, cuyo comodín existente ya cubre `avatar.webp` y `banner.webp`. Esto no sustituye el test 3/3 previamente exitoso ni una validación en producción.

### Verificación local en vivo · 2026-10-12

Salidas reales ejecutadas en este host (no citas), con los 11 archivos locales sin seguimiento preservados:

```text
entorno            Node v24.18.0; npm 11.16.0; Temurin JDK 24.0.2; Windows 11
build frontend     PASS (tsc && vite build; modo DEMO, sin VITE_API_URL)
api npm run check  PASS
api npm test       138 totales; 137 pass; 1 skip intencional; 0 fail
npm ci (raíz/api)  0 vulnerabilidades
api test:rules     PASS 3/3 con emuladores Firestore+Storage (exit 0)
```

Corrección a la nota previa: el fallo `Unable to establish loopback connection` de Java/Netty **ya no ocurre en este host**. El 2026-10-12 los emuladores Firestore y Storage arrancaron y `npm run test:rules` pasó localmente (3/3). Matiz honesto: esto valida las reglas **localmente contra emuladores**, no en producción; el despliegue y la validación de reglas en el runtime público siguen pendientes (ver §8.4).

## 8. Pendientes reales, por prioridad

1. Smoke autenticado del panel admin con custom claim `admin: true`, incluido upload firmado cuando Storage exista.
2. Configurar y validar `STRIPE_WEBHOOK_SECRET` en v2 antes de habilitar checkout nuevo. Mientras tanto, conservar el flujo anterior y los beneficios heredados.
3. Ejecutar pruebas de reglas Firestore/Storage con emuladores. **CUMPLIDO LOCALMENTE el 2026-10-12** (`npm run test:rules` PASS 3/3 con emuladores en este host; ver §7). La validación en producción no está incluida aquí: sigue abierta como parte de #4.
4. Desplegar y hacer smoke autenticado del Directorio (reglas, índices, miembro y admin) antes de abrirlo masivamente, incluyendo el **despliegue y la validación de reglas Firestore/Storage en el runtime público** (local ≠ producción). El código local ya incluye consentimiento opt-in, privacidad, anti-spam y moderación.
5. Habilitar Storage para futuras cargas administradas; no es necesario para los diez PDF empaquetados actuales.
6. Auditar licencias antes de publicar nuevos libros/materiales.
7. Resolver accesibilidad pendiente y dividir el chunk grande del build demo.
8. Migrar los 68 quizzes aprobados y regenerar/revisar el catálogo completo con el formato avanzado de 5 interacciones por clase. El piloto local de Ortodoncia ya tiene revisión editorial documentada en `docs/REVISION-CLINICA-PILOTO-ORTODONCIA.md` y cuatro grupos de redacción clínica corregidos, pero continúa en `borrador` hasta que un odontólogo u ortodoncista firme las 25 actividades y cinco fichas. El pipeline exige evidencia `mm:ss` y diversidad (`seleccion`, `seleccion_multiple`, `ordenar`, `relacionar`, `completar`); no afirmar que los 77 videos fueron analizados. También faltan revisión odontológica del resto del catálogo y las demás fichas PDF/Storage.
9. En la rama `feat/juegos-cierre-clase` (subida a `origin`), cada clase cuenta con **1 juego clásico visual único** (sin repetir tipo en clases consecutivas del mismo curso) entre 5 mecánicas: **Rompecabezas visual `3:4` (`2×3`)** (18 clases, 1 garantizado por curso), **Sopa de letras clínica** (15 clases), **El ahorcado clínico con monitor dental SVG** (14 clases), **Memorama clínico 3D** (15 clases) y **Palabra secreta** (15 clases). Se abre automáticamente al terminar el video (`ended`), al pulsar «Finalizar y jugar» o al pulsar «Siguiente clase →» si aún no se ha jugado, además de mostrarse en la tarjeta `.lesson-closing-card` debajo del video. Cobertura verificada 77/77 clases con `npm run audit:class-games`. Los 18 prompts `3:4` para generar las ilustraciones dedicadas de los rompecabezas están en `docs/prompts-rompecabezas-3x4.md`.

## 9. Flujo seguro de trabajo

```powershell
git status --short --branch
$env:VITE_API_URL='https://api-production-db314.up.railway.app'
npm run build
Remove-Item Env:VITE_API_URL
Set-Location api
npm run check
npm test
```

Para diseño local puede usarse:

```powershell
npm run dev -- --host 127.0.0.1 --port 5173
```

Antes de afirmar que algo está en producción, comprobar el commit fuente, el workflow `Pages`, el despliegue `SUCCESS` de Railway y un smoke del dominio/API. Un build local no basta.

## 10. Documentos que deben mantenerse juntos

- `CLAUDE.md`: reglas de entrada.
- `docs/HANDOFF-MIGRACION-EQUIPO-2026-10-16.md`: guía completa de migración de equipo, ramas respaldadas en GitHub y trabajo del 16 de octubre de 2026.
- `docs/HANDOFF-CLAUDE-A-CODEX-2026-10-15.md`: corte previo de PRs abiertos y pendientes.
- `docs/RELEVO-CLAUDE.md`: corte operativo vigente.
- `docs/HANDOFF-DIRECTORIO-CV-2026-10-14.md`: estado exacto del perfil tipo CV, diff local, privacidad, QA y secuencia segura de continuación.
- `docs/CONTEXTO-MAESTRO.md`: contexto completo, historia y decisiones.
- `docs/PRODUCTION-READINESS-2026-10-16.md`: corte preparado de curso gratis + Brújula y secuencia exacta de publicación.
- `docs/prompts-rompecabezas-3x4.md`: los 18 prompts verticales `3:4` (`1080×1440`) para los rompecabezas de cierre de clase.
- `docs/contrato.md`: esquema y contrato API.
- `scripts/pipeline/README.md`: contenido, transcripciones y revisión clínica.

Si una implementación cambia producción, reglas comerciales, puntos, logros, rutas, seguridad o pendientes, actualiza estos documentos en el mismo commit.

## 2026-10-15 · Regla freemium nueva: «Escoge tu curso gratis»

El miembro gratis elige un curso; queda abierto menos la última clase y los demás se cierran. Ver la sección de reglas comerciales en `CONTEXTO-MAESTRO.md`. Rama `feat/curso-gratis-elegible`. Al desplegar la API, quien ya avanzó en el curso gratis anterior lo conserva solo; el resto verá el anuncio al entrar. No requiere índices ni reglas nuevas (la colección `v2_curso_gratis` la escribe solo el servidor).

## 2026-10-16 · Brújula profesional (publicada)

La entrevista inicial continúa con una Brújula opcional de ocho decisiones. El servidor calcula y persiste tres áreas afines y tres estilos de trabajo; el cliente muestra un informe, recomienda cursos combinando esas señales con los intereses elegidos y mantiene una advertencia explícita de orientación no diagnóstica. No entrega puntos, puede posponerse 14 días y no bloquea a miembros existentes. Archivos principales: `api/src/lib/brujula.js`, `src/core/brujula.ts`, `src/pages/brujula.ts` y `src/styles/brujula.css`. La implementación `767514c` y la preparación de dominio canónico `f53ada8` llegaron a `main` mediante el PR `#18` y el merge `13797ef`.

## 2026-10-16 · Elección obligatoria del curso gratis (publicada)

La elección es el primer paso de una cuenta gratis: antes de entrevista, Brújula o módulos, una cuenta sin elección confirmada sólo puede usar `#/curso-gratis`; cualquier otra ruta redirige a esa pantalla independiente, sin sidebar. Después de elegir continúa en `#/bienvenida`, luego puede contestar o posponer la Brújula y finalmente entra al club. La guardia cubre navegación, URL directa, recarga y Atrás. No aplica a VIP, administradores reales, migrados ni miembros que ya eligieron. El anuncio ya no ofrece cerrar, Escape ni «Decidir después». Un fallo de `GET /curso-gratis` tampoco se convierte en una falsa ausencia de elección, para evitar bloqueos por red. Las recomendaciones posteriores de la Brújula abren la ficha del curso sugerido, sin repetir el selector inicial. La serie `99e6af8..f53ada8` está publicada mediante el PR `#18` y el merge `13797ef`.

## 2026-10-16 · Preparación de producción

El corte y sus verificaciones están documentados en `docs/PRODUCTION-READINESS-2026-10-16.md`. El PR `#18` se fusionó con autorización explícita y publicó el merge `13797ef`: GitHub Pages `38976464505` y Railway `28536ee0-32f0-475f-980a-4278205c4a64` terminaron correctamente. El dominio, landing, catálogo público, `/health` y CORS respondieron correctamente. Railway no tiene `STRIPE_WEBHOOK_SECRET`: el checkout v2 permanece deliberadamente desactivado y el flujo heredado debe conservarse. Falta el smoke autenticado con cuentas gratis, VIP/heredada y admin reales.

## 2026-10-16 · Rediseño de Juegos de Cierre de Clase y Respaldo para Migración de Equipo

En la rama `feat/juegos-cierre-clase` se reemplazaron los juegos basados en marcas de tiempo por 5 juegos clásicos visuales (`rompecabezas` 3:4 de 6 piezas, `sopa` de letras clínica, `ahorcado` con monitor dental SVG, `memorama` 3D y `palabra` secreta), asignando 1 juego único por clase sin repetir dentro del mismo curso y garantizando 1 rompecabezas por cada uno de los 18 cursos. Se añadió la tarjeta `.lesson-closing-card` bajo el reproductor, la apertura automática al terminar la clase o pulsar «Siguiente clase →», el paquete visual del Curso 1 y los 18 prompts `3:4` en `docs/prompts-rompecabezas-3x4.md`. Todas las ramas locales fueron respaldadas en `origin` y documentadas en `docs/HANDOFF-MIGRACION-EQUIPO-2026-10-16.md`.

