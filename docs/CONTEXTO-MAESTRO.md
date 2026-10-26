# Contexto maestro · OdonTeck Club

> Documento de relevo para continuar el desarrollo sin confundir una experiencia visual terminada con una integración de producción terminada. Debe leerse completo antes de modificar el proyecto. Los cortes operativos vigentes están en `docs/RELEVO-CLAUDE.md`; los snapshots antiguos de secciones posteriores son historial, no evidencia del runtime actual.

## Actualización · 2026-10-26 · Storage activo y persistencia verificada

PR #50 y #51 están publicados; el último corte comprobado de límites es `aabaece`, Cloudflare run `40373181802` y Railway deployment `4f8e089a-cd0f-47f3-bc5d-9d9c2f40978e`. El usuario autorizó Blaze, delegó elegir cuenta y seleccionó alertas sobre 100 MXN/mes. Se activó y verificó la cuenta «Pago de Firebase» terminación 1F21EF, presupuesto exclusivo del proyecto con alertas de 50/80/100 MXN y bucket `club-odonteck.firebasestorage.app` en US-CENTRAL1. Reglas Storage publicadas tras CI aprobado; Firestore sin cambios. Las notas antiguas de falta de acceso/bucket son históricas.

El contrato añade cabeceras obligatorias para limitar bytes en Storage, caché de imágenes de 24 horas y 20 autorizaciones conjuntas de archivos del perfil por UID en 24 horas. `v2_directorio_subidas` conserva el contador aunque se borre el perfil. No es un máximo monetario ni limita descargas o reutilización de firmas vigentes. Build y API aprobados (199 pass, 0 fail, 1 skip local); reglas aprobadas en CI con emuladores Linux. Tres cuentas temporales gratis/VIP/admin verificaron subida, guardado y recarga contra producción; exceso de bytes rechazado, solicitud 21 bloqueada y documentos privados protegidos. Todos esos datos de prueba se eliminaron.

La prueba del formulario descubrió una carga ausente al recargar directamente `/directorio/editar-perfil`; este corte añade esa ruta al cargador remoto. La compilación corregida pasó el flujo real de formulario con backend de producción en escritorio y móvil, usando una cuenta temporal y assets locales interceptados. La publicación de esta corrección adicional debe contrastarse con su workflow y bundle público; los despliegues citados arriba son los de PR #51. Consultar el relevo operativo y `contrato.md` para detalles y límites.

## Actualización · 2026-10-26 · Imágenes del perfil profesional

La corrección parte del `main` vigente `5bef28b281ffbab88ddff08dd96b9ff66a9590ef`, cuyo workflow de Cloudflare Pages `40144680513` fue satisfactorio. El usuario autorizó publicar el arreglo del editor del directorio. La foto y la portada ahora actualizan sus vistas previas dentro del formulario de la página, sin depender del antiguo diálogo; también se pueden quitar y volver a seleccionar. Los avisos recuerdan pulsar «Guardar perfil». El flujo remoto sigue siendo subida firmada de WebP y `PUT /directorio/perfil` autenticado, sin cambios al backend ni a la privacidad.

Build con API real y comprobaciones API aprobados (196 pass, 0 fail, 1 skip). Prueba visual y funcional en escritorio y móvil aprobada; guardado y recarga probados únicamente en demo. Falta comprobar persistencia en una cuenta real: los dos nombres habituales de bucket del proyecto devuelven 404, Firebase CLI no tiene sesión y Railway requiere reconexión para inspeccionar su configuración efectiva. No afirmar que Storage está listo ni que se guardaron imágenes remotas. Detalles y reversión en el relevo operativo. Los hashes y estados que siguen corresponden al corte histórico del 20 de octubre.

- **Actualizado:** 20 de octubre de 2026 (frontend público verificado en `5794499`; véase el relevo operativo para fuentes de despliegue)
- **Repositorio definitivo:** `https://github.com/teccapitalweb/odonteck-club.git`
- **Rama:** `main`
- **Commit frontend público verificado:** `57944994ae576caffdcaf522a16d8117298e65d5` (merge PR #25; Cloudflare Pages deployment `9b2b5f62-e069-4fb5-a87c-931878f2ea4f`). Incluye un ajuste responsive del encabezado de Notas; **no** incluye el cuaderno en diálogo amplio.
- **Web pública:** `https://www.odonteckconsulting.com/` servida por Cloudflare Pages (`odonteck-club.pages.dev`). El workflow de GitHub Pages no debe tomarse por sí solo como prueba del runtime del dominio.
- **API pública:** `https://api-production-db314.up.railway.app` mediante Railway (`odonteck-club-v2/api`); el despliegue confirmado del backend de juegos por PR #23 fue `7f12434b-30df-4996-929e-13eeb97d48cd`.
- **Estado de despliegue comprobado el 2026-10-20:** Cloudflare Pages atendió el dominio oficial con frontend `5794499`; Railway/API y GitHub Pages son despliegues separados. La compilación de una rama local no prueba cambios en ninguno de esos servicios. El incidente Stripe documentado en la sección histórica debe revalidarse antes de tomarlo como estado actual.

> **Corrección de relevo (2026-10-20):** las líneas y secciones históricas que aún mencionan PR #20, `0b2c4c2` y GitHub Pages como origen del dominio describen cortes anteriores. Para el corte público posterior, usa el commit/deployment Cloudflare indicados arriba y el estado operativo en [`RELEVO-CLAUDE.md`](RELEVO-CLAUDE.md). No supongas que cambios locales están incluidos en ese runtime.

Antes de crear este relevo ya existían cambios locales sin seguimiento:

```text
.claude/launch.json
docs/prompts-hero-carrusel-v2.md
docs/prompts-hero-carrusel.md
docs/prompts-hero-expand.md
docs/prompts-portadas-libros.md
public/libros/
public/fotos/inicio-aurora-odontologia-v1.png
```

Son trabajo previo del usuario. Deben conservarse intactos hasta revisarlos y decidir explícitamente si se versionan.

## 1. Qué producto es

OdonTeck Club es una plataforma de formación para odontólogos: landing, autenticación, cursos grabados, biblioteca clínica, quizzes, casos, comunidad, sesiones en vivo, certificados, membresía y panel administrativo. Se reconstruyó como un proyecto Vite nuevo que debe convivir temporalmente con la infraestructura y los datos del club anterior.

Este repositorio pertenece únicamente a OdonTeck. Visión Pecuaria y Agrotec América tienen sus propios repositorios, reglas y datos.

## 2. Estado real resumido

### Lo que está construido visual y funcionalmente en demo

- Landing pública con carrusel de tres portadas, catálogo, beneficios, planes, FAQ y llamadas a registro.
- Guía virtual “Alexia” en la landing: personaje femenino original con tres posturas, movimiento SVG por capas y experiencia Concierge v3. Recomienda desde el catálogo por objetivo, especialidad y nivel, reconoce temas de búsqueda libre, explica por qué eligió cada resultado, muestra fuente verificada, conserva accesos rápidos y feedback, ofrece transferencia explícita a WhatsApp y mantiene un límite visible contra diagnósticos, tratamientos o consejo clínico. Esta evolución está desplegada y verificada en el dominio oficial.
- Login por correo, Google, registro y recuperación mediante Firebase cuando existe API.
- Inicio, catálogo, ficha de curso y reproductor de clase.
- Biblioteca de materiales y libros con lector inmersivo propio (`#/materiales/:id/visor`): doble página en escritorio, una página en móvil, zoom, arrastre, swipe, teclado, pantalla completa, salto de página y memoria de lectura. Renderiza el PDF autorizado con PDF.js desde la URL temporal de la API; no publica imágenes de cada página.
- Sesiones en vivo y reservas.
- Comunidad tipo red social clínica: feed visual, historias por especialidad, publicación, útil, respuestas, compartir, explorar y actividad; en producción sólo muestra datos reales del foro.
- Retos con Quiz Relámpago, flashcards (3 niveles de calificación, undo, atajos de teclado, stats de sesión), repetición espaciada, casos clínicos y liga/clasificación del club.
- Búsqueda global (`#/buscar?q=...`) que busca cursos, clases y materiales.
- Verificación pública de certificados (`#/verificar/:folio`) sin requerir autenticación.
- Logros, progreso y certificados.
- Perfil con intereses editables, configuración, suscripción y promoción de Praxia.
- PWA con manifest, service worker, iconos y acceso de instalación.
- Panel admin completo: en demo conserva `localStorage`; con `VITE_API_URL` usa los endpoints autenticados `/admin/*`.
- Encuestas de entrevista inicial (gustos y perfil), fin de curso y experiencia en la plataforma (`experiencia-v2`, 12 preguntas base más condicionales: uso, dispositivo, facilidad, problemas técnicos y su detalle, calidad, duración, nivel, qué sirve, qué no ha usado, qué falta, NPS 0-10 con motivo para 0-6, renovación para VIP o qué lo haría VIP para gratis, opt-in de contacto para 0-6 y comentario; sale a los 21 días o desde el día 7 con 8 clases, se repite cada trimestre y calla tras 2 aplazamientos), con opción de posponer y panel de resultados agregados.
- Página de bienvenida (`#/bienvenida`): la entrevista inicial (v2, siete preguntas) se presenta a pantalla completa, una pregunta a la vez, la primera vez que entra un miembro. Las encuestas de fin de curso y de pulso son un modal por pasos (`src/ui/encuesta.ts` + `src/styles/encuesta-modal.css`): estrellas para escalas de 1 a 5, escala numérica para 0 a 10, opciones, chips y texto libre, con cierre de agradecimiento; reutiliza las clases de `bienvenida.css`.

### Lo que sí está implementado en la API

- Firebase Auth y verificación de tokens revocados.
- Membresía heredada, suscripciones nuevas, cortesías y claim admin.
- Catálogo seguro sin `videoId` para miembros.
- Video firmado de Bunny.
- Progreso secuencial y certificados idempotentes.
- Verificación pública de certificados.
- Catálogo público mínimo para la guía de la landing (`GET /landing/catalogo`), con lista blanca, cursos publicados y precios verificados o nulos; no expone videos ni datos privados.
- Descargas temporales desde el lote privado empaquetado en la API y, para materiales administrados futuros, desde Storage.
- Quizzes aprobados y calificación en servidor.
- Foro, respuestas y reacciones.
- Eventos y reservas.
- Stripe checkout, portal y webhook.
- CRUD administrativo y autorización por custom claim.
- Encuestas versionadas: pendientes y respuestas autenticadas, disparadores por primer ingreso/curso completado/21 días y resumen administrativo sin PII.
- Directorio profesional opt-in como módulo principal en `#/directorio`: perfiles visibles con tarjeta editorial y ficha tipo CV, foto y portada propias, resumen, años de experiencia, idiomas, trayectoria, formación y credenciales; oportunidades VIP y conexiones privadas. El editor permite agregar/quitar registros repetibles, mantiene compatibilidad con perfiles anteriores y conserva el contacto fuera de toda proyección pública. El endurecimiento local añade ocultar/eliminar, cierre, paginación estable, límites anti-spam, idempotencia, validación real de foto/portada en Storage, denuncia y moderación administrativa sin exponer al reportante. La URL anterior dentro de Comunidad redirige para conservar compatibilidad.

### Cuaderno de repaso por clase — estado del flujo

La pestaña **Notas** pertenece al repaso de la clase y se mantiene separada de Temario, Quiz, Ficha y del minijuego de cierre. El acuerdo de diseño es un acceso compacto en la pestaña que abre el cuaderno completo en un diálogo amplio, accesible y responsive; véase [`DECISIONES-CUADERNO-CLASE-2026-10-20.md`](DECISIONES-CUADERNO-CLASE-2026-10-20.md) para contrato, alcance y pruebas. El despliegue de PR #25 sólo arregló el encabezado que se aplastaba; el diálogo ampliado y sincronización de bitácora por UID son locales pendientes de integración/publicación.

El contenido estructurado (resumen, conceptos con marcas de tiempo y preguntas de recuperación) se deriva de las notas disponibles por clase. Producción todavía guarda marcas y bitácora en `localStorage`; la rama local añade `/notas-clase/:cursoId/:n` y colección privada `v2_notas_clase` por UID, sin migrar datos viejos del navegador ni dar puntos por escribir. El minijuego tiene su propio registro remoto e idempotente. No afirmar que las notas ya siguen a la persona hasta desplegar/probar frontend y backend.

### Brecha principal

La experiencia de miembro ya consume la API en modo producción. El panel admin quedó conectado en el código a `/admin/*`, con autorización por claim, estados de carga/error/reintento y subidas firmadas de materiales; todavía falta probarlo con una cuenta admin real contra el despliegue nuevo antes del corte. Los diez materiales propios aprobados ahora se incluyen en el despliegue privado de la API y se entregan mediante enlaces temporales después de validar acceso; Firebase Storage queda para cargas futuras del panel. Las brechas principales quedan en la liga real y la validación de producción. En modo demo se conserva `localStorage` para recorrer la maqueta sin servicios externos.

Desde el 8 de octubre de 2026, `#/retos` está habilitado en modo API y aparece en la navegación de producción. Retos V2 usa `/retos/resumen`, `/retos/sesion` y `/retos/responder`: arma sesiones únicamente con quizzes aprobados y clases accesibles, no expone soluciones antes de responder y guarda XP, constancia y dominio por área en `v2_retos_estados`. El hub prioriza una sesión recomendada y un mapa clínico en vez de puntos decorativos. Este flujo ya forma parte del corte publicado `225ded8`. Flashcards y casos conservan por ahora su motor local y forman la siguiente etapa de sincronización.

También existe `#/recompensas`, una economía central validada por la API. Clases, cursos, evaluaciones aprobadas, primer intento diario de Retos, encuestas, aportes de Comunidad y checkout confirmado generan movimientos idempotentes en `v2_recompensas_movimientos`; saldo, logros, desbloqueos y avisos personales viven en `v2_recompensas_estado`, y los canjes en `v2_recompensas_canjes`. La sincronización inicial conserva la actividad histórica de usuarios anteriores. Los nueve materiales premium propios se desbloquean de forma permanente por 250 a 600 puntos o vienen incluidos para VIP; Atlas ICDAS es gratuito. El beneficio de 30 días de Praxia crea una solicitud `pendiente` y no se presenta como activación automática.

La siguiente etapa de aprendizaje ya tiene infraestructura local: el editor de administración, el contrato del API y el calificador soportan cinco interacciones (`seleccion`, `seleccion_multiple`, `ordenar`, `relacionar`, `completar`) sin enviar soluciones antes del intento. Retos también consume localmente este banco en modo práctica, conserva selección para el modo relámpago y registra crédito parcial sin exponer la solución antes de responder; `compatibleRetos: false` permite excluir un reactivo. La rama local `feat/juegos-cierre-clase` intercala antes del quiz una misión breve de recuerdo para cada clase: ordenar la ruta, conectar concepto-minuto, reconocer un momento o reconstruir la idea central. `scripts/audit-class-games.mjs` comprueba 77/77 usando únicamente las notas y marcas de tiempo ya publicadas; el juego no otorga puntos, no inventa soluciones clínicas y no debe describirse como análisis del video. Cada clase muestra además una pestaña de ficha; una ficha `aprobada` se entrega desde `GET /clases/:cursoId/:n/ficha` mediante URL privada de diez minutos, mientras un borrador se presenta honestamente como “en revisión”. El piloto de Ortodoncia tiene revisión editorial documentada en `docs/REVISION-CLINICA-PILOTO-ORTODONCIA.md`, con 25 actividades auditadas y cuatro grupos de redacción clínica corregidos; sigue faltando la firma profesional sobre los cinco videos y fichas. Esto no significa que las 77 fichas estén producidas: la auditoría actual sigue en 0 aprobadas y la publicación requiere fuente/transcripción y revisión odontológica.

La liga de producción ya no debe recurrir a odontólogos ficticios: mientras no exista un endpoint real, consentimiento y reglas de privacidad, el hub la presenta como próxima función. Los datos demo siguen disponibles exclusivamente cuando no existe `VITE_API_URL`.

La Comunidad publicada conserva el contrato del foro (`/foro`, respuestas y `util`) y lo presenta como feed visual. Las publicaciones ligadas a un curso reutilizan su portada; esto permite una experiencia editorial sin depender todavía de Firebase Storage. La carga libre de fotos o video por miembros queda pendiente hasta que Storage esté habilitado y exista moderación específica para archivos. Las tres publicaciones editoriales de muestra existen sólo en modo demo; nunca se hidratan en modo API.

En modo API el frontend utiliza:

- `/landing/catalogo` para hidratar a Alexia sin autenticación y sin reutilizar información privada del catálogo de miembro;
- `/me` para conocer identidad, VIP y admin;
- `/catalogo` para hidratar cursos, materiales, eventos y config (`src/core/remoto.ts`);
- `/progreso` para hidratar el progreso del miembro;
- `/quiz/:cursoId/:n` para cargar quizzes por ruta (sin respuestas correctas);
- `POST /quiz/:cursoId/:n` para calificar en servidor y conservar hasta diez intentos versionados con respuestas, confianza, bitácora, mejor puntuación y aprobación histórica; la recompensa sigue siendo idempotente;
- `/video/token` para reproducir Bunny;
- `/progreso/:cursoId/abrir` y `/progreso/:cursoId/vista` para avance real;
- `/foro`, respuestas y reacciones para comunidad;
- `/certificados` y `/verificar/:folio` para certificados reales;
- `/materiales/:id/descarga` para URLs firmadas;
- `/eventos/:id/reservar` para reservaciones;
- `PATCH /me/perfil` para perfil y avisos;
- `PATCH /me/intereses` para cambiar de uno a tres intereses sin reescribir la entrevista inicial;
- `/stripe/portal` para gestión de una suscripción existente.
- `/encuestas/pendientes`, `/encuestas/:clave/responder` y `/encuestas/:clave/posponer` para el flujo de miembro;
- `/admin/resumen`, CRUD de cursos/materiales/eventos, quizzes, miembros/cortesías, moderación, avisos y config cuando la ruta es administrativa;
- `/admin/encuestas/resumen?plan=` para tendencias agregadas (NPS, bases condicionales, trimestres, segmentación VIP/gratis), promedios por curso y comentarios sin identidad; `/admin/encuestas/contactos` para los correos de quienes pidieron que se les escriba;
- `/admin/materiales/:id/subida` para subir PDF y portada directamente a Storage mediante URL firmada, sin exponer credenciales.

La capa de hidratación remota (`src/core/remoto.ts`) carga catálogo y progreso antes de renderizar cualquier ruta autenticada, y solicita foro/certificados/quizzes según la ruta. La capa administrativa (`src/core/admin.ts`) carga solo los recursos que necesita cada pantalla y conserva respuestas API en memoria, no en `localStorage`. **Registro Stripe del corte 2026-10-20 (requiere revalidación):** el documento [`INCIDENTE-RETORNO-STRIPE-2026-10-20.md`](INCIDENTE-RETORNO-STRIPE-2026-10-20.md) conserva el hallazgo, propuestas y pruebas de aquel corte. Como la fuente pública cambió después, no tomar sus referencias a PR #20/#21 ni al checkout como estado actual. Antes de tocar Stripe, confirmar el flujo desplegado y la configuración real en Dashboard/Test Mode; no iniciar un pago real ni afirmar estado actual con este registro histórico.

### Módulos nuevos incorporados (septiembre 2026)

- **Liga / Clasificación** (`src/core/liga.ts`): ranking con podio (visual 2do-1ro-3er puesto), tabla completa, mini-card en hub de retos. Usa datos demo con 8 odontólogos + usuario actual. XP = clases×10 + cursos×50. En modo API consumirá un endpoint futuro.
- **Búsqueda global** (`src/pages/buscar.ts`): busca en cursos (vía `buscar()` de catalogo.ts), clases dentro de cursos y materiales disponibles. Resultados agrupados por tipo con conteo. La barra de búsqueda del header redirige a `#/buscar?q=...`.
- **Verificación pública** (`src/pages/certificados.ts → verificar()`): página pública sin login, usa `montar('solo')`. Muestra certificado válido (verde) o no encontrado (rojo). Auth bypass en `onBeforeRender`.
- **Flashcards mejoradas** (`src/core/juegos.ts` + `src/pages/retos.ts`): motor SR corregido (bug off-by-one en intervalos), intervalos extendidos hasta 365 días, calificación de 3 niveles (otra vez / difícil / fácil), mazo barajado, undo con Ctrl+Z, atajos de teclado (Espacio, 1/2/3), estadísticas de sesión en pantalla final.
- **Bienvenida** (`src/pages/bienvenida.ts` + `src/styles/bienvenida.css`, octubre 2026): mientras la entrevista `bienvenida-v2` esté pendiente, `onBeforeRender` redirige cualquier ruta de miembro a `#/bienvenida` (cascarón `solo`). Portada, siete pasos (etapa, experiencia, cómo conoció OdonTeck, objetivo, intereses, formato preferido y reto) y cierre con hasta tres cursos sugeridos según los intereses. Los logotipos de Instagram, Facebook, TikTok, Google y WhatsApp son SVG locales, sin peticiones externas. Guarda un borrador en `sessionStorage`, permite regresar, avanza sola al elegir una opción única y se puede posponer 3 días (“Responder después”). Las preguntas y opciones viven en la plantilla versionada (`api/src/lib/encuestas.js` y su espejo demo en `src/core/encuestas.ts`); la página sólo aporta presentación. Los administradores no la reciben en modo API. La v1 de cinco preguntas nunca se desplegó. `/encuestas/pendientes` devuelve además `perfil` (intereses, objetivo, formato, etapa y reto, sin PII); `src/core/recomendaciones.ts` lo usa para la sección "Recomendado para ti" del inicio (según intereses, con relleno por área cercana) y la pestaña "Para ti" del catálogo (`#/cursos?tab=para-ti`). Desde `#/perfil`, el miembro puede cambiar de uno a tres intereses: en API se guardan en `v2_perfiles` y en demo en una clave separada de `localStorage`; la respuesta original de `bienvenida-v2` queda inmutable para conservar el valor histórico de la encuesta.
- **Brújula profesional** (`src/pages/brujula.ts`, `src/core/brujula.ts`, `src/styles/brujula.css`): después de terminar la bienvenida, el flujo propone `#/brujula`. Son ocho decisiones sin respuesta correcta sobre problemas, jornada, detalles, resultados, pacientes, fortalezas, aprendizaje y proyecto futuro. El servidor (`api/src/lib/brujula.js`) calcula tres áreas afines y tres estilos; guarda `resultado` junto a `brujula-v1` y lo devuelve dentro de `perfil`. Es orientación explícitamente no diagnóstica: no mide aptitud ni decide una especialidad. Se puede posponer 14 días, no bloquea el club y no entrega puntos. Las afinidades complementan —no reemplazan— los intereses declarados en Inicio y “Para ti”. El resultado queda accesible en la navegación, “Más” y Perfil.
- **Iconos custom**: Quiz, Detective Dental, Flashcards y Reto Diario usan imágenes generadas (`public/brand/icon-*.jpg`) con efecto glow CSS en lugar de iconos Lucide genéricos.

## 3. Arquitectura

### Frontend

- Vite + TypeScript sin framework de componentes.
- Entrada del club: `index.html` y `src/main.ts`.
- Entrada de landing: `landing/index.html` y `src/landing/main.ts`.
- Router por hash en `src/core/router.ts`.
- Componentes por funciones HTML y eventos globales.
- Datos demo en `src/data/*.json` y `localStorage`.
- Estilos por área en `src/styles/`.

Rutas de miembro:

```text
#/                         #/cursos
#/curso/:id               #/curso/:id/clase/:n
#/materiales              #/materiales/:id
#/materiales/:id/visor
#/recompensas
#/en-vivo                 #/comunidad
#/comunidad/:id           #/directorio
#/retos
#/logros                   #/certificados
#/certificados/:id        #/praxia
#/perfil                  #/suscripcion
#/configuracion           #/mas
#/buscar?q=...            #/verificar/:folio (pública, sin auth)
#/bienvenida (entrevista inicial; sólo mientras esté pendiente)
#/brujula (orientación profesional opcional y resultado personal)
```

Rutas admin:

```text
#/admin                    #/admin/cursos
#/admin/cursos/:id        #/admin/quizzes
#/admin/quizzes/:cursoId/:n
#/admin/materiales        #/admin/materiales/:id
#/admin/en-vivo           #/admin/en-vivo/:id
#/admin/miembros          #/admin/miembros/:uid
#/admin/comunidad         #/admin/avisos
#/admin/encuestas         #/admin/ajustes
```

La ruta pública `#/verificar/:folio` ya existe. No requiere autenticación (usa `montar('solo')`). En modo API llama a `GET /verificar/:folio`; en modo demo busca folios locales.

### Backend

- Express en `api/`, preparado para Railway.
- Firebase Admin para Auth, Firestore y Storage.
- Bunny Stream para videos firmados.
- Stripe para membresías.
- Contrato de datos y endpoints en [`contrato.md`](contrato.md).
- Reglas en `api/firestore.rules` y `api/storage.rules`.

### Entorno v2 paralelo (29 de septiembre de 2026)

- Proyecto Railway: `odonteck-club-v2`, servicio `api`.
- URL temporal: `https://api-production-db314.up.railway.app`.
- `/health`, CORS desde `https://www.odonteckconsulting.com`, Firebase Auth, lectura de membresía, catálogo, video gratuito firmado con Bunny y quiz sin respuestas expuestas pasaron la prueba autenticada `api/scripts/smoke-v2.mjs`.
- Se sembraron 18 documentos en `v2_cursos` y 68 en `v2_quizzes`; no se modificaron `miembros`, suscripciones ni el webhook anterior.
- No se sembraron `v2_materiales`: los diez recursos propios aprobados se sirven desde el lote privado de la API; los libros completos sin licencia confirmada continúan excluidos.
- En el corte de octubre 16, `STRIPE_WEBHOOK_SECRET` no figuraba en el servicio v2 y el alta se mantenía en el flujo heredado. Esa observación es histórica; ver el estado comprobado el 20 de octubre abajo.
- **Actualización importante del 2026-10-20:** esa observación era del corte anterior. Railway ahora lista el nombre `STRIPE_WEBHOOK_SECRET`, pero el valor está redactado y no se confirmó si es no vacío ni si corresponde al webhook activo. El frontend público aún dirige el botón al alias `vip-auth.html?tab=register`, que devuelve la SPA y termina en inicio; los `success_url`, `cancel_url` y `return_url` actuales usan la ruta inexistente `/#/cuenta`. Ver [`INCIDENTE-RETORNO-STRIPE-2026-10-20.md`](INCIDENTE-RETORNO-STRIPE-2026-10-20.md). No habilitar ni publicar el checkout hasta terminar prueba autenticada en Stripe Test Mode.
- El frontend público nuevo ya consume este API. Se conservaron `vip-auth.html`, `vip-panel.html` y el sistema de membresías anterior para no cortar cobros ni beneficios existentes.
- El build con `VITE_API_URL` elimina libros/PDF y reemplaza semillas de cursos, materiales, miembros y quizzes por estructuras vacías; el contenido real se hidrata desde el API. El control redujo el artefacto de 3.36 GB a 10.74 MB y verificó 0 PDF, 0 libros y 0 referencias a miembros demo o `videoId`.
- Compatibilidad heredada añadida: además de `miembros/{uid}`, la API busca el correo autenticado en los documentos `miembros/email_...`, reconoce `esRegalo` y las tres fechas históricas (`expiraEn`, `fechaFinAcceso`, `fechaProximaRenovacion`). El portal de Stripe también recupera el `stripeCustomerId` encontrado por correo.
- Auditoría agregada de producción del 5 de octubre (sin PII): 94 cuentas Auth, 107 documentos de miembro, 14 documentos vigentes y 3 documentos `email_...` (2 vigentes). Stripe contiene 20 suscripciones OdonTeck identificadas y 10 en `active`/`trialing`/`past_due`; 9 tienen al menos un cobro positivo registrado y la restante es una anual activa con factura pagada en cero por un descuento total, además de cancelación ya programada. Una `past_due` tiene la factura más reciente abierta y permanece inactiva, por lo que no recibe beneficios. Tres suscripciones activas aún no tienen cuenta Auth resoluble, pero su documento vigente será reconocido por correo verificado cuando se registren con la misma dirección.
- `npm run audit:legacy` y `npm run audit:stripe` repiten estas verificaciones sin imprimir nombres, correos, UID ni IDs de Stripe.
- El proyecto Firebase `club-odonteck` todavía no tiene un bucket de Storage existente (se probaron los nombres moderno y clásico). Esto ya no bloquea los diez materiales propios empaquetados; sí bloquea nuevas cargas desde el panel hasta habilitar un bucket real.
- Railway mantiene el API público saludable; cada cambio de compatibilidad debe conservar un smoke autenticado antes y después del despliegue.
- `npm run smoke:legacy` pasó contra la API v2 pública: seleccionó una cuenta heredada vigente, generó un token efímero sin cambiar su contraseña y confirmó `esVip=true`, plan presente y 18 cursos. La prueba no imprime PII ni crea datos permanentes.
- Producción tenía 0 documentos en `v2_materiales` y 0 en `v2_eventos` durante la auditoría. El catálogo de materiales propios ya no depende de esos documentos: la API los anuncia sólo cuando detecta el PDF empaquetado. El panel anterior continúa disponible para beneficios heredados aún no migrados.

### Corte público y continuidad verificada (9 de octubre de 2026)

- **Corte vigente comprobado:** commit funcional `225ded8`; Cloudflare Pages `8e404a77-4afa-4cce-9a09-700d21cb9c6f` (`https://8e404a77.odonteck-club.pages.dev`); Railway `6c9283b5-0d0d-4c6f-9578-85cded5e1b87` en `SUCCESS`. El dominio oficial respondió 200 con `club-0TrxDrVt.js` y `club-DiBoZodq.css`; `/health` del API respondió 200. Estos identificadores describen el runtime funcional anterior a cualquier commit exclusivamente documental.
- En ese corte están publicados el lector privado, la economía de puntos, notificaciones de logros, Retos V2, Comunidad visual, encuestas/bienvenida y Alexia. El visor fue comprobado a una página en móvil y dos en escritorio, con navegación, zoom, salto, memoria y bloqueo correcto de un material de 250 puntos.
- El artefacto web de producción contiene 0 PDF y 0 directorios `libros`; sólo incluye el worker de PDF.js. El documento se obtiene después de validar acceso en `/materiales/:id/descarga`, se descarga a memoria y se dibuja en `canvas`.

Historial reciente útil para rollback y auditoría:

- El 9 de octubre de 2026 se desplegó el sistema de materiales privados y recompensas del commit `b65cc46`: Railway quedó en `SUCCESS` con el despliegue `650dfed2-1df9-4e2e-b6d5-c794f1544eac` y Cloudflare Pages publicó `ed1e63e7`. El dominio oficial respondió 200 con `club-DbQiTgQ8.js`; el smoke autenticado confirmó VIP heredado, 18 cursos, 10 materiales y checkout nuevo bloqueado mientras falta el webhook. Los diez PDF propios se sirven desde la API mediante enlaces HMAC de 10 minutos; Atlas ICDAS es gratuito y los nueve premium se incluyen con VIP o se canjean permanentemente por puntos.

- El 9 de octubre de 2026 se publicó Alexia Concierge v3 desde el commit fuente `b2be5e1` mediante Cloudflare Pages (`9097c24a`). `odonteck-club.pages.dev` y `www.odonteckconsulting.com` respondieron 200 con el bundle nuevo, el catálogo público mostró 18 cursos, Alexia reportó “Catálogo oficial verificado” y `/health` del API Railway respondió `200 {"ok":true}`.

- El dominio público `https://www.odonteckconsulting.com/` ya sirve la nueva experiencia desde el repositorio público `https://github.com/teccapitalweb/Odonteck`. El estado anterior quedó marcado con el tag recuperable `pre-club-relaunch-2026-10-05`.
- Se conservaron las rutas heredadas `vip-auth.html`, `vip-panel.html` y las páginas legales. El alta o pago nuevo que todavía depende del sistema anterior se redirige a `vip-auth.html?tab=register`.
- La API pública continúa en `https://api-production-db314.up.railway.app`. El despliegue activo verificado es `6c9283b5-0d0d-4c6f-9578-85cded5e1b87` (`SUCCESS`). Los despliegues anteriores de esta sección son historial y no describen el runtime actual.
- Como `STRIPE_WEBHOOK_SECRET` no está configurado en v2, `/stripe/checkout` responde `503 no_configurado` antes de crear una sesión. El smoke real confirmó membresía heredada VIP, plan presente, 18 cursos y bloqueo del checkout nuevo.
- Auditoría agregada de Stripe y membresías: 94 usuarios Auth, 107 documentos de miembros, 14 documentos actuales y 99 suscripciones revisadas; 20 se identificaron como OdonTeck, 10 están `active`, `trialing` o `past_due` y 9 tienen historial de pago positivo. Una suscripción anual activa quedó en $0 por descuento total y tiene cancelación programada; una `past_due` con factura abierta permanece inactiva en Firestore y no recibe VIP.
- Hay 3 suscripciones activas sin cuenta Auth resoluble; sus documentos conservan el mismo correo y el sistema las reconocerá al registrarse con ese correo verificado. No se exponen aquí correos, UID ni datos personales.
- La cuenta muestra ahora la foto de Google en barra lateral, barra superior y perfil. Sólo se acepta una URL HTTPS y siempre se conservan las iniciales como respaldo si la imagen no carga. La tarjeta lateral ganó altura, separación, sombra y un plan legible en dos líneas para evitar el aspecto aplanado.
- La foto de Google, el fallback seguro y el relieve de la tarjeta permanecen incluidos en el corte funcional `225ded8`.
- Las auditorías fueron de lectura: no se crearon cargos, no se cancelaron suscripciones y no se modificaron clientes ni registros de miembros.

### Modos

- Con `VITE_API_URL`: Firebase Auth y la experiencia real de miembro consumen la API; el panel admin también está cableado a `/admin/*`, pendiente de smoke con un claim admin real.
- Sin `VITE_API_URL`: demo completo con `localStorage`.

Al momento de esta auditoría no hay `.env` ni `.env.production` local en la raíz. Por tanto, `npm run dev` arranca en modo demo. No agregar una URL de API sin verificar primero el servicio Railway correcto, CORS y el dominio final.

## 4. Inventario de contenido versionado

| Recurso | Cantidad | Estado |
|---|---:|---|
| Cursos | 18 | la semilla no fija `publicado`; el normalizador los considera publicados |
| Clases | 77 | entre 3 y 5 por curso |
| Materiales | 26 | todos marcados disponibles |
| Libros | 17 | incluidos dentro de los 26 materiales |
| PDFs | 8 | incluidos dentro de los 26 materiales |
| Presentaciones | 1 | incluida dentro de los 26 materiales |
| Quizzes | 68 | cuatro preguntas por registro en la mayoría de la semilla |
| Casos clínicos | 12 | usados por los retos |
| Eventos locales | 0 | producción puede diferir |

Las portadas finales de cursos conviven con portadas numeradas antiguas en `public/cursos/`. No borrar activos por nombre sin buscar todas sus referencias.

`public/libros/` está actualmente sin seguimiento. Antes de añadirlo a Git hay que revisar autoría, licencias, tamaño, nombres y si contiene libros completos protegidos por derechos de autor. No asumir que tener el archivo local autoriza su distribución pública.

## 5. Reglas comerciales y contradicciones por resolver

### Clases gratuitas (resuelta)

La regla comercial unificada es:

**Regla vigente desde 2026-10-15: «Escoge tu curso gratis».**

- Cada miembro gratis **debe elegir primero un curso** del catálogo, antes de la entrevista inicial, la Brújula o cualquier módulo. Hasta guardar esa elección, la única ruta de miembro disponible es `#/curso-gratis`; pegar una URL, recargar o usar Atrás no evita el paso.
- Ese curso queda abierto **completo excepto su última clase**, que junto con el certificado requiere VIP.
- **Los demás cursos se cierran por completo** para cuentas gratis. VIP ve todo.
- La elección es **definitiva**, con **un solo cambio** permitido en las primeras 24 horas si no ha visto más de una clase.
- Quien ya tenía avance en el curso gratis anterior (el que tenía clases con `gratis: true`) **lo conserva automáticamente**, sin elegir (origen `migracion`).
- VIP, administradores y miembros migrados o con una elección guardada no reciben el bloqueo. Si `GET /curso-gratis` falla, el cliente no interpreta el error como «sin elección» y no encierra a la persona por un problema de red.
- Administración puede **reiniciar la elección** desde el detalle del miembro; el miembro vuelve a ver el anuncio y su progreso no se borra.
- Al confirmar el curso, el flujo continúa con `#/bienvenida`; después queda disponible la Brújula opcional y finalmente el club. La pantalla `#/curso-gratis` usa un cascarón independiente, sin sidebar ni navegación de módulos.

Implementación:

- Colección `v2_curso_gratis/{uid}` (`cursoId`, `origen` eleccion|migracion|reinicio, `elegido`, `cambios`). Solo la escribe el servidor.
- API: `GET/POST /curso-gratis`, `DELETE /admin/miembros/:uid/curso-gratis`; `api/src/lib/curso-gratis.js` (lectura con migración perezosa y ventana de cambio).
- `api/src/lib/acceso.js`: `tieneAccesoAClase(curso, cursoId, n, vip, cursoGratisId)`. La marca `gratis` por clase **ya no abre contenido**; solo identifica el curso gratis anterior para migrar y para textos de landing.
- Frontend: `src/core/curso-gratis.ts` (demo en localStorage), guardia de navegación en `src/main.ts`, `src/ui/curso-gratis.ts` (selección sin opción de posponer + celebración) y `Acceso.cursoGratis/claseLibre` aplican la misma regla que el servidor.
- Pruebas: `api/test/lib.test.js` y el bloque «escoge tu curso gratis» de `api/test/rutas-miembro.test.js`.

### Material gratuito

La regla comercial unificada es explícita mediante `gratis: true`, sin depender de la posición del recurso en el catálogo:

- **Gratuito:** “Atlas de caries · Clasificación ICDAS”.
- **VIP:** “Guía de bolsillo · Diagnóstico ortodóncico” y todos los demás materiales.

El frontend muestra la etiqueta “Gratis” y la API permite generar su URL temporal a una cuenta sin VIP. Los demás recursos se incluyen con VIP o se desbloquean permanentemente mediante sus costos de 250 a 600 puntos. Los documentos futuros administrados en Firestore conservan la misma validación del servidor.

### Comunidad y retos

- Comunidad se puede leer gratis; publicar, responder y reaccionar requiere VIP.
- Quiz Relámpago gratuito se limita a tres preguntas.
- Solo el primer caso clínico es gratuito.
- El desbloqueo de clases es secuencial.

### Acceso VIP

La API reconoce VIP por:

1. documento heredado vigente en `miembros/{uid}`;
2. suscripción Stripe nueva vigente;
3. cortesía vigente en `v2_cortesias/{uid}`;
4. custom claim `admin`.

No existe todavía el sistema de cupones cortos creado posteriormente para Visión Pecuaria. Añadirlo sería una función nueva, no algo ya presente.

## 6. Integraciones que faltan en el frontend

Ordenadas por prioridad:

1. ~~**Carga inicial real:**~~ Resuelto: `src/core/remoto.ts` solicita `/catalogo` y `/progreso` antes de cada ruta autenticada; `/quiz/:cursoId/:n` se carga por ruta de clase. `datos.ts` expone `hidratarAdmin`/`invalidarAdmin`; `progreso.ts` expone `hidratar`. En demo (sin `VITE_API_URL`) todo es no-op.
2. ~~**Panel admin real:**~~ Integración resuelta en código: lecturas y mutaciones usan `/admin/*`; los materiales usan uploads firmados y el modo API no persiste estas respuestas en `localStorage`. Pendiente smoke autenticado con cuenta admin y Storage habilitado en el servicio desplegado.
3. ~~**Quizzes seguros:**~~ Resuelto: carga sin respuestas y calificación mediante el backend.
4. ~~**Comunidad real:**~~ Resuelto: lista, detalle, respuestas, creación y útil usan `/foro` en modo API; las semillas solo aparecen en demo.
5. ~~**Perfil real:**~~ Resuelto: `/me` hidrata nombre/plan/vencimiento y `PATCH /me/perfil` guarda perfil y avisos.
6. ~~**Progreso real:**~~ Resuelto: se carga al iniciar y usa `/abrir` y `/vista`. Sigue pendiente decidir si se migra avance demo anterior.
7. ~~**Certificados reales:**~~ Resuelto: lista folios emitidos por API y ofrece verificación pública `#/verificar/:folio`.
8. ~~**Materiales seguros:**~~ Integración resuelta: el lector obtiene una URL temporal desde `/materiales/:id/descarga`, descarga el archivo en memoria y lo renderiza en `canvas` con PDF.js. El backend vuelve a validar acceso gratuito, VIP o desbloqueo permanente por puntos; no se generan páginas públicas. Falta sembrar/subir únicamente recursos autorizados futuros.
9. ~~**Eventos reales:**~~ Resuelto: catálogo remoto y reservas mediante API.
10. ~~**Avisos/config real:**~~ la edición administrativa de avisos y configuración usa la API. El contrato no incluye borrado de avisos, por lo que esa acción permanece solo en demo.

Estas integraciones deben desarrollarse con estados de carga, error, sesión vencida y reintento. No dejar que las semillas oculten fallos de la API en producción.

## 7. Seguridad y datos

- El navegador nunca debe recibir `videoId` ni llaves de Bunny para contenido protegido.
- Las respuestas correctas de quizzes no deben incluirse en la respuesta GET para miembros.
- Progreso, certificados y membresías deben validarse en servidor.
- Admin real: custom claim `admin: true`; no listas de correos.
- Revocación de sesión (rama `perf/arranque-cache-directorio`, no desplegada): los `GET` de miembro pueden reutilizar hasta 5 minutos (o hasta el `exp` del token) una verificación previa del ID token, así que una revocación o cuenta deshabilitada puede tardar ese plazo en reflejarse en esas lecturas, salvo que antes la detecte una verificación en vivo (deja una lápida y el siguiente `GET` vuelve a verificar). Siempre verifican en vivo con `checkRevoked`: escrituras, `/admin/*`, `GET /materiales/:id/descarga`, `GET /clases/:cursoId/:n/ficha` y cualquier usuario con claim admin.
- Las colecciones nuevas usan `v2_`; `miembros/{uid}` se lee por compatibilidad.
- No modificar el webhook viejo de Stripe hasta validar completamente el nuevo.
- Verificar CORS contra el dominio final antes de activar `VITE_API_URL`.
- No incluir información identificable de pacientes en comunidad, ejemplos, capturas o datos de prueba.

## 8. Landing e identidad visual

La landing actual incluye:

- carrusel hero con `hero-cirujano.webp`, `hero-consulta.webp` y `hero-instrumental.webp`;
- propuesta de valor, beneficios y funcionamiento;
- ocho cursos destacados cargados desde la semilla;
- bloque del club, Praxia, certificación, planes, opiniones y FAQ;
- enlaces de registro, WhatsApp e Instagram.

Dirección visual: azul marino, crema, turquesa y acentos cálidos; fotografía clínica profesional y humana; consultorios creíbles; odontólogos y pacientes representados con dignidad. Evitar sonrisas artificiales, procedimientos incorrectos, anatomía dental errónea, manos deformes, instrumental imposible y estética plástica de IA.

Los archivos de prompts actualmente sin seguimiento pertenecen al usuario. Revisarlos antes de crear un estándar nuevo o consolidarlos.

## 9. Praxia

Praxia sí pertenece al ecosistema de OdonTeck. Tiene ruta `#/praxia`, promoción dentro del club y URL configurable. No aplicar aquí la decisión de eliminar Praxia que se tomó para Visión Pecuaria.

Antes de cambiar la URL, confirmar el destino real. En la landing hay una transformación que reemplaza `odonteck-club` por `odonteck-landing`; revisar su necesidad antes de refactorizar.

## 10. Pipeline de contenido

El pipeline de `scripts/pipeline/` contempla:

1. inventario de Bunny;
2. transcripción automática;
3. descarga de VTT y conversión;
4. generación de notas, títulos y quizzes;
5. publicación como borrador en Firestore;
6. revisión humana obligatoria en admin;
7. migración de certificados anteriores.

El contenido odontológico puede afectar decisiones clínicas. Ningún quiz, protocolo o resumen generado debe aprobarse automáticamente sin revisión profesional.

## 11. Estado de calidad comprobado

Última verificación integral: 9 de octubre de 2026.

```text
frontend build de producción con VITE_API_URL  PASS
api/npm run check                               PASS
api/npm test                                    PASS: 138 totales, 137 aprobadas, 0 fallos, 1 omitida
npm audit                                       PASS: 0 vulnerabilidades
dist                                            PASS: 0 PDF, 0 directorios libros
```

El visor se recorrió con un PDF real en móvil (una página) y escritorio (dos páginas), incluyendo anterior/siguiente, zoom, salto a página 7, reanudación de lectura y bloqueo de un material de 250 puntos; no hubo errores de consola ni desbordamiento del documento. También se recorrieron `#/recompensas`, Retos V2, Comunidad, bienvenida e intereses en escritorio y móvil. Sigue pendiente asociar programáticamente varios `label` de formularios admin con sus controles y realizar el smoke admin autenticado en producción.

La API desplegada respondió `200 {"ok":true}` en `/health`, el preflight CORS del dominio oficial devolvió `204` y `/me` y `/admin/resumen` devolvieron `401` sin token. Esta comprobación es solo del perímetro público; no sustituye el smoke autenticado con una cuenta que tenga el claim `admin: true`.

Fue necesario ejecutar `npm ci` en `api/` porque faltaban localmente `stripe` y `supertest`; ambas dependencias ya estaban declaradas en `api/package.json` y `api/package-lock.json`.

La prueba omitida es la de reglas Firestore/Storage. El script oficial se intentó con Java 21, pero el emulador de Firestore no pudo abrir el selector loopback en este entorno antes de ejecutar las aserciones; no es un fallo confirmado de las reglas. Reintentar en un host donde el emulador pueda abrir puertos locales:

```bash
cd api
npm run test:rules
```

Advertencias del build:

- El chunk de datos supera 500 kB; conviene dividir carga de catálogos/quizzes y evitar incluir respuestas en el bundle de producción.
- El build con `VITE_API_URL` no incluyó correos demo, IDs de video conocidos, títulos de semilla, PDFs ni libros locales; su chunk de datos quedó por debajo de 500 kB. El warning de 530 kB corresponde al build demo sin API.

## 12. Pendientes priorizados

1. ~~Acordar y unificar las reglas de clase y material gratuitos.~~ Resuelto: regla unificada en datos, frontend, API, textos y pruebas.
2. ~~Crear la capa remota del frontend y completar hidratación inicial.~~ Resuelto: `src/core/remoto.ts` con `cargarClub()` hidrata catálogo, progreso y quizzes por ruta.
3. ~~Conectar el panel admin a los endpoints reales.~~ Resuelto en código; pendiente verificación E2E contra el despliegue con claim admin.
4. ~~Sacar quizzes, comunidad, perfil, progreso y certificados reales de `localStorage`.~~ Resuelto en modo API; demo conserva datos locales deliberadamente.
5. ~~Agregar verificación pública de certificados en frontend.~~ Resuelto con `#/verificar/:folio` (página pública sin auth).
6. Completar el entorno v2 paralelo: API y frontend publicados; los materiales propios aprobados se empaquetan de forma privada en la API. Confirmar y probar el webhook Stripe nuevo en Test Mode, reparar destinos del botón y de regreso a rutas existentes, y ejecutar smoke admin conectado antes de un corte.
7. ~~Liga y clasificación del club.~~ Resuelto visualmente: podio, ranking y mini-card; en producción permanece como próxima función hasta contar con endpoint, consentimiento y privacidad.
8. ~~Búsqueda global.~~ Resuelto: `#/buscar?q=...` busca cursos, clases y materiales.
9. ~~Motor de flashcards mejorado.~~ Resuelto: 3 niveles, undo, atajos, stats, bug de intervalos corregido.
10. Ejecutar pruebas de reglas con emuladores.
11. Auditar libros locales por licencias y distribución.
12. Revisar accesibilidad, móvil, estados de carga/error y funcionamiento PWA.
13. ~~Mejorar compatibilidad futura de Vite.~~ `vite.config.ts` ya usa `import.meta.dirname`; sigue pendiente dividir el chunk de datos.

## 13. Orden recomendado para Claude / Agente

1. Leer `docs/HANDOFF-MIGRACION-EQUIPO-2026-10-16.md`, `docs/RELEVO-CLAUDE.md`, este documento y `docs/contrato.md`.
2. Revisar `git status` y las ramas remotas (`git branch -a`), en especial `feat/juegos-cierre-clase` (los 5 juegos visuales de cierre de clase y los 18 prompts `3:4` en `docs/prompts-rompecabezas-3x4.md`).
3. Confirmar repositorio `teccapitalweb/odonteck-club`, rama `main`; no trabajar en copias históricas ni en el ZIP de Descargas.
4. Usar el demo local sólo para revisión visual. Para afirmar algo sobre producción, compilar con `VITE_API_URL` y comprobar el API/despliegue correspondiente.
5. Prioridad técnica: smoke del panel admin con un claim `admin: true` (resumen, CRUD, quiz, cortesía, moderación, aviso, config y upload firmado).
6. No habilitar checkout v2 hasta configurar y probar `STRIPE_WEBHOOK_SECRET`; conservar los pagos y beneficios heredados.
7. Después: pruebas de reglas en emuladores, endpoint/privacidad de liga y auditoría de licencias de futuros materiales.
8. En cada bloque ejecutar build, pruebas API y revisión en móvil; actualizar ambos documentos de relevo si cambia el corte real.

## 14. Comandos

Frontend:

```bash
npm install
npm run dev -- --host 127.0.0.1 --port 5173
npm run build
```

Build equivalente a producción en PowerShell:

```powershell
$env:VITE_API_URL='https://api-production-db314.up.railway.app'
npm run build
Remove-Item Env:VITE_API_URL
```

API:

```bash
cd api
npm ci
npm run dev
npm run check
npm test
npm run test:rules
```

La configuración local de Claude ya usa el puerto 5173. No sobrescribir `.claude/launch.json` sin necesidad.

Inspección de despliegues (sólo lectura):

```bash
railway deployment list --service api --limit 3
wrangler pages deployment list --project-name odonteck-club
```

No ejecutar un despliegue, cambiar DNS, aprobar un deploy de Railway ni tocar servicios reales sin autorización explícita del usuario. Un build local no demuestra que producción se haya actualizado.

## 15. Criterio para declarar producción lista

OdonTeck no está listo únicamente porque compile o se vea completo. Para declararlo listo deben cumplirse, como mínimo:

- frontend y admin leen/escriben mediante API real;
- regla freemium única y probada en cliente y servidor;
- cuenta gratuita, VIP y admin verificadas de extremo a extremo;
- videos, progreso, quiz, certificado y material probados;
- Stripe probado en modo de prueba y estrategia de cambio definida;
- reglas Firebase probadas y fusionadas con las vigentes;
- libros y materiales con derecho de distribución;
- dominio, CORS, Auth y PWA verificados en móvil;
- sin secretos ni datos de pacientes en cliente, logs o repositorio;
- rollback documentado antes del cambio definitivo.
# Actualización producción · perfil, puntos y juegos por clase · 2026-10-20

El cierre de cada clase persiste minijuegos en API. PR #23 quedó integrado en `main` (merge `879d87df24a0b7774cd4e68c1f804b0820c22cfe`). Cada registro queda ligado al UID autenticado en `v2_juegos_clase`, contiene mecánica, completado, mejor puntaje, cantidad de intentos y marcas de tiempo; se consulta por `GET /juegos-clase`. El guardado exige que la vista de la clase exista. La primera finalización acredita 5 puntos por clase mediante el libro mayor idempotente de recompensas; volver a jugar permite mejorar el puntaje, pero no duplicar puntos. Se añade el contador/logro `Repaso constante` (10 juegos) y en demo se refleja el mismo progreso local.

Verificación: API `npm run check`; suite 178 pass, 0 fail, 1 skip intencional; build con URL de API de producción; auditoría 77/77 clases con juego; GitHub Pages run `39459794440` SUCCESS; Railway API deployment `7f12434b-30df-4996-929e-13eeb97d48cd` SUCCESS; Cloudflare Pages deployment `cb0fe57b-f389-410e-b1ea-4fd5080e866d` desde `879d87d`. El dominio respondió 200 y el bundle oficial incluye la ruta nueva. `/health` respondió 200 y ambas rutas `/juegos-clase` sin credenciales devolvieron 401 como corresponde. No se hizo una prueba autenticada usando una cuenta real; no se modificaron Stripe, membresías ni canjes.
