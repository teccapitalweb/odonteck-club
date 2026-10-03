# Contexto maestro · OdonTeck Club

> Documento de relevo para continuar el desarrollo sin confundir una experiencia visual terminada con una integración de producción terminada. Debe leerse completo antes de modificar el proyecto.

- **Actualizado:** 3 de octubre de 2026 (guía virtual Alex integrada en la landing; pendiente despliegue y smoke autenticado)
- **Repositorio definitivo:** `https://github.com/teccapitalweb/odonteck-club.git`
- **Rama:** `main`
- **Commit auditado al redactar:** incluye todo el trabajo hasta esta fecha
- **Estado verificado:** TypeScript 0 errores; `vite build` limpio en salida aislada; API pasa 107 pruebas (106 exitosas, 0 fallos y 1 omitida por requerir emuladores). La guía tiene 17 pruebas unitarias propias y fue recorrida en demo en escritorio y móvil: tres posturas, catálogo, límite clínico, persistencia y consola sin errores. La bienvenida y la edición de intereses también se recorrieron en demo en escritorio y móvil: persistencia, recomendaciones, teclado, borrador, posponer y resumen admin.

Antes de crear este relevo ya existían cambios locales sin seguimiento:

```text
.claude/launch.json
docs/prompts-hero-carrusel-v2.md
docs/prompts-hero-carrusel.md
docs/prompts-hero-expand.md
docs/prompts-portadas-libros.md
public/libros/
```

Son trabajo previo del usuario. Deben conservarse intactos hasta revisarlos y decidir explícitamente si se versionan.

## 1. Qué producto es

OdonTeck Club es una plataforma de formación para odontólogos: landing, autenticación, cursos grabados, biblioteca clínica, quizzes, casos, comunidad, sesiones en vivo, certificados, membresía y panel administrativo. Se reconstruyó como un proyecto Vite nuevo que debe convivir temporalmente con la infraestructura y los datos del club anterior.

Este repositorio pertenece únicamente a OdonTeck. Visión Pecuaria y Agrotec América tienen sus propios repositorios, reglas y datos.

## 2. Estado real resumido

### Lo que está construido visual y funcionalmente en demo

- Landing pública con carrusel de tres portadas, catálogo, beneficios, planes, FAQ y llamadas a registro.
- Guía virtual “Alex” en la landing: personaje original con tres posturas, movimiento SVG por capas, conversación guiada, catálogo y precios verificados, transferencia explícita a WhatsApp y límite visible contra diagnósticos, tratamientos o consejo clínico.
- Login por correo, Google, registro y recuperación mediante Firebase cuando existe API.
- Inicio, catálogo, ficha de curso y reproductor de clase.
- Biblioteca de materiales y libros.
- Sesiones en vivo y reservas.
- Comunidad con temas, respuestas y reacciones.
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
- Descargas firmadas de Storage.
- Quizzes aprobados y calificación en servidor.
- Foro, respuestas y reacciones.
- Eventos y reservas.
- Stripe checkout, portal y webhook.
- CRUD administrativo y autorización por custom claim.
- Encuestas versionadas: pendientes y respuestas autenticadas, disparadores por primer ingreso/curso completado/21 días y resumen administrativo sin PII.

### Brecha principal

La experiencia de miembro ya consume la API en modo producción. El panel admin quedó conectado en el código a `/admin/*`, con autorización por claim, estados de carga/error/reintento y subidas firmadas de materiales; todavía falta probarlo con una cuenta admin real contra el despliegue nuevo antes del corte. Las brechas principales quedan en la liga real, los materiales autorizados/Storage y la validación de producción. En modo demo se conserva `localStorage` para recorrer la maqueta sin servicios externos.

En modo API el frontend utiliza:

- `/landing/catalogo` para hidratar a Alex sin autenticación y sin reutilizar información privada del catálogo de miembro;
- `/me` para conocer identidad, VIP y admin;
- `/catalogo` para hidratar cursos, materiales, eventos y config (`src/core/remoto.ts`);
- `/progreso` para hidratar el progreso del miembro;
- `/quiz/:cursoId/:n` para cargar quizzes por ruta (sin respuestas correctas);
- `POST /quiz/:cursoId/:n` para calificar en servidor;
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

La capa de hidratación remota (`src/core/remoto.ts`) carga catálogo y progreso antes de renderizar cualquier ruta autenticada, y solicita foro/certificados/quizzes según la ruta. La capa administrativa (`src/core/admin.ts`) carga solo los recursos que necesita cada pantalla y conserva respuestas API en memoria, no en `localStorage`. El checkout nuevo está desactivado mientras no exista `STRIPE_WEBHOOK_SECRET`; las altas se envían temporalmente al portal anterior.

### Módulos nuevos incorporados (septiembre 2026)

- **Liga / Clasificación** (`src/core/liga.ts`): ranking con podio (visual 2do-1ro-3er puesto), tabla completa, mini-card en hub de retos. Usa datos demo con 8 odontólogos + usuario actual. XP = clases×10 + cursos×50. En modo API consumirá un endpoint futuro.
- **Búsqueda global** (`src/pages/buscar.ts`): busca en cursos (vía `buscar()` de catalogo.ts), clases dentro de cursos y materiales disponibles. Resultados agrupados por tipo con conteo. La barra de búsqueda del header redirige a `#/buscar?q=...`.
- **Verificación pública** (`src/pages/certificados.ts → verificar()`): página pública sin login, usa `montar('solo')`. Muestra certificado válido (verde) o no encontrado (rojo). Auth bypass en `onBeforeRender`.
- **Flashcards mejoradas** (`src/core/juegos.ts` + `src/pages/retos.ts`): motor SR corregido (bug off-by-one en intervalos), intervalos extendidos hasta 365 días, calificación de 3 niveles (otra vez / difícil / fácil), mazo barajado, undo con Ctrl+Z, atajos de teclado (Espacio, 1/2/3), estadísticas de sesión en pantalla final.
- **Bienvenida** (`src/pages/bienvenida.ts` + `src/styles/bienvenida.css`, octubre 2026): mientras la entrevista `bienvenida-v2` esté pendiente, `onBeforeRender` redirige cualquier ruta de miembro a `#/bienvenida` (cascarón `solo`). Portada, siete pasos (etapa, experiencia, cómo conoció OdonTeck, objetivo, intereses, formato preferido y reto) y cierre con hasta tres cursos sugeridos según los intereses. Los logotipos de Instagram, Facebook, TikTok, Google y WhatsApp son SVG locales, sin peticiones externas. Guarda un borrador en `sessionStorage`, permite regresar, avanza sola al elegir una opción única y se puede posponer 3 días (“Responder después”). Las preguntas y opciones viven en la plantilla versionada (`api/src/lib/encuestas.js` y su espejo demo en `src/core/encuestas.ts`); la página sólo aporta presentación. Los administradores no la reciben en modo API. La v1 de cinco preguntas nunca se desplegó. `/encuestas/pendientes` devuelve además `perfil` (intereses, objetivo, formato, etapa y reto, sin PII); `src/core/recomendaciones.ts` lo usa para la sección "Recomendado para ti" del inicio (según intereses, con relleno por área cercana) y la pestaña "Para ti" del catálogo (`#/cursos?tab=para-ti`). Desde `#/perfil`, el miembro puede cambiar de uno a tres intereses: en API se guardan en `v2_perfiles` y en demo en una clave separada de `localStorage`; la respuesta original de `bienvenida-v2` queda inmutable para conservar el valor histórico de la encuesta.
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
#/en-vivo                 #/comunidad
#/comunidad/:id           #/retos
#/logros                   #/certificados
#/certificados/:id        #/praxia
#/perfil                  #/suscripcion
#/configuracion           #/mas
#/buscar?q=...            #/verificar/:folio (pública, sin auth)
#/bienvenida (entrevista inicial; sólo mientras esté pendiente)
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
- No se sembraron `v2_materiales`: el lote mezcla recursos propios con libros completos cuya licencia de distribución todavía no está confirmada.
- `STRIPE_WEBHOOK_SECRET` no está definido en el servicio v2. El webhook viejo y el portal público continúan activos sin cambios.
- Este API todavía no recibe tráfico del frontend público; no confundir el despliegue paralelo con el cambio definitivo.
- El build con `VITE_API_URL` elimina libros/PDF y reemplaza semillas de cursos, materiales, miembros y quizzes por estructuras vacías; el contenido real se hidrata desde el API. El control redujo el artefacto de 3.36 GB a 10.74 MB y verificó 0 PDF, 0 libros y 0 referencias a miembros demo o `videoId`.
- Compatibilidad heredada añadida: además de `miembros/{uid}`, la API busca el correo autenticado en los documentos `miembros/email_...`, reconoce `esRegalo` y las tres fechas históricas (`expiraEn`, `fechaFinAcceso`, `fechaProximaRenovacion`). El portal de Stripe también recupera el `stripeCustomerId` encontrado por correo.
- Auditoría agregada de producción (sin PII): 86 cuentas Auth, 99 documentos de miembro, 14 documentos vigentes, 3 documentos `email_...` (2 vigentes). Stripe contiene 19 suscripciones OdonTeck identificadas: 9 en `active`/`trialing`/`past_due`; las 8 `active` tienen documento de miembro con acceso. Una `past_due` permanece inactiva igual que en el sistema anterior. Tres activas aún no tienen cuenta Auth resoluble, pero conservarán el reconocimiento por correo cuando se registren con el mismo correo.
- `npm run audit:legacy` y `npm run audit:stripe` repiten estas verificaciones sin imprimir nombres, correos, UID ni IDs de Stripe.
- El proyecto Firebase `club-odonteck` todavía no tiene un bucket de Storage existente (se probaron los nombres moderno y clásico). Por eso los 10 materiales propios no se escribieron en `v2_materiales`; el script `npm run publish:materials -- --apply` falla antes de escribir hasta que se habilite un bucket real.
- Railway mantiene el despliegue anterior saludable, pero el 29 de septiembre rechazó una actualización con “Deploys have been paused temporarily”. La compatibilidad heredada nueva debe desplegarse y probarse antes de apuntar el portal público.
- `npm run smoke:legacy` pasó contra la API v2 ejecutada localmente con producción: seleccionó una cuenta heredada vigente, generó un token efímero sin cambiar su contraseña y confirmó `esVip=true`, plan presente y 18 cursos. La prueba no imprime PII ni crea datos permanentes.

### Modos

- Con `VITE_API_URL`: Firebase Auth y algunas operaciones reales.
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

- **Primer curso** (identificado por `orden === 1`, "Diagnóstico en Ortodoncia"): todas las clases gratuitas **excepto la última** (clase 5 requiere VIP).
- **Demás cursos**: solo la **primera clase** es gratuita; el resto requiere VIP.

Esta regla está implementada de forma coherente en:

- `src/data/catalogo.json`: campo `gratis` por clase (clases 1–4 del primer curso son `true`, clase 5 es `false`; en los demás, solo clase 1 es `true`).
- `src/core/acceso.ts`: `claseLibre()` usa `curso.orden === 1` para identificar el primer curso de forma estable.
- API (`api/src/lib/acceso.js`): `tieneAccesoAClase()` usa `clase.gratis === true`.
- Textos de landing, onboarding y login reflejan que el primer curso es casi completo gratis.
- `api/test/lib.test.js`: 9 pruebas de límite validan los escenarios: primer curso primera/penúltima/última clase, segundo curso primera/segunda clase, sin membresía, VIP activo, VIP vencido, admin.

### Material gratuito

La regla comercial unificada es explícita mediante `gratis: true`, sin depender de la posición del recurso en el catálogo:

- **Gratuito:** “Atlas de caries · Clasificación ICDAS”.
- **VIP:** “Guía de bolsillo · Diagnóstico ortodóncico” y todos los demás materiales.

El frontend muestra la etiqueta “Gratis” y la API permite generar su URL firmada a una cuenta sin VIP. Los demás recursos exigen membresía. Para llevar esta regla a Firestore debe volver a sembrarse o actualizarse `v2_materiales` antes del despliegue.

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
8. ~~**Materiales seguros:**~~ Integración resuelta: obtiene URL temporal desde `/materiales/:id/descarga`. Falta sembrar/subir únicamente recursos autorizados.
9. ~~**Eventos reales:**~~ Resuelto: catálogo remoto y reservas mediante API.
10. ~~**Avisos/config real:**~~ la edición administrativa de avisos y configuración usa la API. El contrato no incluye borrado de avisos, por lo que esa acción permanece solo en demo.

Estas integraciones deben desarrollarse con estados de carga, error, sesión vencida y reintento. No dejar que las semillas oculten fallos de la API en producción.

## 7. Seguridad y datos

- El navegador nunca debe recibir `videoId` ni llaves de Bunny para contenido protegido.
- Las respuestas correctas de quizzes no deben incluirse en la respuesta GET para miembros.
- Progreso, certificados y membresías deben validarse en servidor.
- Admin real: custom claim `admin: true`; no listas de correos.
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

Ejecutado el 30 de septiembre de 2026:

```text
tsc --noEmit        PASS (0 errores)
npm run build       PASS
api/npm run check   PASS
api/npm test        PASS: 92 pruebas totales, 91 aprobadas, 0 fallos, 1 omitida
```

También se recorrieron en navegador aislado todas las rutas de miembro y administración, junto con altas/ediciones demo de curso, material, evento, cortesía, aviso, configuración, moderación, quiz, perfil, reserva y comunidad. En viewport móvil de 390 x 844 no se detectó desbordamiento horizontal en las rutas representativas. Manifest, service worker, iconos PWA y entradas HTTP locales respondieron correctamente. Sigue pendiente asociar programáticamente varios `label` de formularios admin con sus controles.

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
6. Completar el entorno v2 paralelo: API desplegada y prueba autenticada de miembro aprobada; faltan publicar el frontend, cargar materiales autorizados, configurar el webhook Stripe nuevo y ejecutar el smoke del admin conectado antes del corte.
7. ~~Liga y clasificación del club.~~ Resuelto: podio, ranking, mini-card en hub de retos; datos demo, pendiente endpoint API.
8. ~~Búsqueda global.~~ Resuelto: `#/buscar?q=...` busca cursos, clases y materiales.
9. ~~Motor de flashcards mejorado.~~ Resuelto: 3 niveles, undo, atajos, stats, bug de intervalos corregido.
7. Ejecutar pruebas de reglas con emuladores.
8. Auditar libros locales por licencias y distribución.
9. Revisar accesibilidad, móvil, estados de carga/error y funcionamiento PWA.
10. ~~Mejorar compatibilidad futura de Vite.~~ `vite.config.ts` ya usa `import.meta.dirname`; sigue pendiente dividir el chunk de datos.

## 13. Orden recomendado para Claude

1. Leer este documento y `docs/contrato.md`.
2. Revisar `git status` y preservar los archivos sin seguimiento.
3. Levantar el demo en el puerto 5173 y recorrer miembro y admin.
4. No implementar inmediatamente: primero presentar al usuario la contradicción freemium y confirmar la regla definitiva.
5. Verificar el panel admin conectado con una cuenta que tenga el claim `admin: true`: resumen, CRUD, quiz, cortesía, moderación, aviso, config y upload firmado.
6. Conservar el modo demo separado; no usarlo como evidencia de la integración real.
7. En cada bloque ejecutar build, pruebas API y revisión en móvil.
8. Actualizar este documento cuando cambie el estado de integración.

## 14. Comandos

Frontend:

```bash
npm install
npm run dev -- --host 127.0.0.1 --port 5173
npm run build
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
