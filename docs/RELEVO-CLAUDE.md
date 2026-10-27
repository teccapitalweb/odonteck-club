# Relevo operativo para Claude · OdonTeck Club

> Lee este archivo antes de trabajar. Es el corte corto y vigente; `CONTEXTO-MAESTRO.md` conserva el detalle histórico y `contrato.md` define datos y endpoints.

## 2026-10-27 · Cuadernillos visuales OdonCoins en revisión

Se añadieron quince cubiertas originales para futuros cuadernillos visuales en `docs/assets/cuadernillos-visuales/` y sus copias de vista previa en `public/recompensas/cuadernillos/`. El catálogo contiene sus quince tarjetas dentro de «Cuadernillos visuales», todas con estado `proximamente`, `requiereRevision: true` y sin ruta de entrega; por tanto no pueden canjearse ni descontar OdonCoins. La interfaz muestra la cubierta, pero no presenta el arte como material clínico terminado.

Antes de habilitar cualquiera se requieren fuentes, guion clínico, revisión humana firmada, PDF accesible y archivo privado configurado. El expediente y la lista de cubiertas están en `docs/CUADERNILLOS-VISUALES-ODONCOINS.md`. No sustituir esos pasos por la sola aprobación de la imagen ni publicar recomendaciones clínicas generadas.

## 2026-10-26 · Monedero OdonCoins en la barra superior

La barra del miembro muestra su saldo disponible de OdonCoins con distintivo OC propio y acceso a /recompensas. Usa exclusivamente Recompensas.resumen(), compartido con la tienda y el resumen de cuenta; se actualiza mediante recompensas:cambio y al renderizar rutas. Cuando aún no hay saldo remoto se muestra un guion, sin inferir monedas del progreso. La carga se consulta en todas las rutas del miembro reutilizando su caché, y reintenta tras un fallo al navegar. En móvil conserva saldo y controles en la primera fila y búsqueda en la siguiente; el visor inmersivo y las pantallas de acceso mantienen su disposición propia.

Validación con assets locales y API de producción: cuentas temporales gratis/VIP/admin, saldo cero y saldo de siete cifras, navegación directa, enlace a la tienda, descuento de canje, incremento de 10 OC al terminar una clase desde la UI sin recargar, persistencia tras recarga y coherencia del resumen de cuenta. Se comprobó cierre/cambio de cuenta sin mostrar el saldo previo y una respuesta 503 simulada sin inventar saldo, seguida de recuperación al navegar. Barra dentro del ancho a 1440/768/390/320 px, tema claro/oscuro. Build, npm ci/check y 212 pruebas API aprobadas; una suite de emuladores omitida localmente. Cuentas, canjes, movimientos y progreso temporales eliminados. La evidencia de publicación se registra en el PR correspondiente tras el despliegue.

## 2026-10-26 · Auditoría completa de entrega de recompensas

Auditoría sobre la API y el frontend públicos, con tres cuentas temporales gratis/VIP/admin eliminadas al terminar: 49 archivos descargados y 10 diseños aplicados, visibles y persistidos tras recargar. Las 40 hojas HTML conservaron texto y filas añadidas al guardar y reabrir sin conexión, sin desbordamiento a 390 px; se comprobó el botón de impresión. Los nueve PDF abren y sus 46 páginas se renderizan; no tienen campos AcroForm. Las descargas repetidas no cobran y una cuenta sin propiedad recibe 403. Los 60 canjes próximos se rechazaron sin descontar OC.

Praxia registra una solicitud pendiente con seguimiento; se verificó cancelación y devolución única de OC. **No existe activación automática de licencia ni se verificó una entrega real por parte del proveedor.** La tienda separa ahora 59 entregas automáticas y una solicitud manual. La segunda tanda de 150 sigue siendo solo un plan.

Se corrigieron títulos/descripciones de 14 hojas para reflejar el archivo real: guiones, planificadores y tablas editables, no piezas gráficas, diapositivas ni firmas terminadas. La hoja de tarjeta contiene un campo para planear dónde irá un QR, no un espacio gráfico ni un generador. La nota clínica se describe como PDF imprimible, sin campos digitales rellenables. IDs, precios, propiedad y contenido clínico permanecen iguales. El corte de textos quedó publicado en PR #55, main 13eae7f9014e5e9ef33bc3081d47ad0a88aa6bbe: Cloudflare ca97e9b3 (workflow 40391972325) y Railway 56ba7469-55e6-4a98-be3a-8f972a511b3d SUCCESS. Se verificaron catálogo y 14 archivos corregidos contra producción, UI 1440/390, bundle idéntico al build y limpieza de la cuenta temporal. Validación de este corte: build con API real, npm ci/check y 212 pruebas aprobadas (una suite de reglas omitida localmente); catálogo y 14 descargas corregidas comprobados con backend/assets locales y Firebase real, UI 1440/390 sin errores, cuenta temporal eliminada.

## 2026-10-26 · Tienda OdonCoins y primera tanda de 120 recompensas

**Publicación verificada:** PR #53 integrado en main 870ea9cf7bfa715ba034c669e996bc059d082d61. Cloudflare workflow 40386187680 satisfactorio, deployment 38d1f4f8, bundle público club-DRQuBE2S.js idéntico al build aprobado. El intento automático de Railway c32bb278-bb6f-476c-93c2-d85814d99956 falló al descargar el snapshot de GitHub. Se envió un archivo del directorio api extraído del mismo commit, sin secretos ni archivos locales, al mismo servicio: deployment b492a501-0a52-4ae4-8c1d-7942f9b3ff6c SUCCESS. No se cambiaron variables, dominios ni configuración de servicios.

La verificación posterior usó exclusivamente el frontend y la API públicos: tres cuentas temporales gratis/VIP/admin confirmaron catálogo de 120, 60 disponibles, saldo persistido, bloqueo de duplicados y próximas, archivos protegidos y acceso directo Firestore denegado. La UI comprobó canje, aplicación/recarga de marco y portada, reemplazo de portada por una subida propia, descarga/edición/guardado/reapertura del HTML, devolución administrativa única y vista 1440/390 sin errores ni desbordamiento. Se eliminaron las cuentas, sus documentos, la imagen de prueba y la propuesta administrativa temporal. API /health 200 y descarga nueva sin sesión 401. CI API y emuladores satisfactorios. La segunda tanda de 150 es únicamente un plan, no publicada ni habilitada.

Implementación sobre main c436833 (PR #52, corrección del editor de perfil ya publicada). La moneda visible pasa a OdonCoins (OC), con equivalencia 1:1 y sin migrar ni reiniciar saldos, movimientos, logros o materiales existentes. Las reglas de obtención siguen iguales.

Catálogo base en api/src/data/recompensas.json: 120 entradas únicas en 12 categorías. Hay 60 preparadas: nueve materiales aprobados existentes, Praxia por solicitud manual, seis marcos, cuatro portadas y 40 plantillas originales no clínicas. Las plantillas son HTML editables, descargables, imprimibles y funcionales sin conexión; las cuatro familias cubren estudio, carrera, administración y comunicación. No son cursos, asesorías ni herramientas interactivas. La hoja de tarjeta permite anotar la ubicación prevista de un QR; no genera códigos ni una tarjeta gráfica.

Las otras 60 propuestas permanecen Próximamente, sin canje ni descuento. Talleres, paquetes clínicos, acompañamiento, beneficios, herramientas futuras y premios físicos requieren contenido o capacidad real de entrega. Las propuestas clínicas exigen confirmación administrativa de revisión humana antes de habilitarse; no se generó ni publicó contenido clínico nuevo.

La tienda ofrece búsqueda, categoría, orden, filtro de saldo, páginas de 18, detalle/confirmación con precio y saldo restante, colección y seguimiento. El servidor valida precio vigente y saldo en transacción, bloquea duplicados y reserva cupos. Descargas requieren propiedad de la recompensa. VIP conserva sus materiales incluidos; no obtiene automáticamente las nuevas plantillas y diseños. Un diseño canjeado se aplica o retira gratuitamente del directorio. Subir otra portada desactiva el diseño sin borrar su propiedad ni la imagen anterior al activar un diseño.

Administración: /admin/recompensas permite crear propuestas manuales, cambiar precio/estado/cupos y definir responsable/plazo; requiere claim admin validado en vivo. Cancelar un canje manual pendiente devuelve sus OC y cupo exactamente una vez, sin bajar ganados. Un canje entregado no puede cancelarse por esa ruta. Cada recompensa admite un canje por miembro, incluso después de una cancelación; no se habilitaron compras repetidas.

Firebase: nueva colección v2_recompensas_catalogo para ajustes y propuestas creadas por admin. Se inspeccionaron las reglas remotas: el cierre por defecto bloquea acceso directo a todas las colecciones v2 de recompensas. No se desplegaron reglas ni se alteraron membresías reales, Stripe, DNS o parámetros de facturación. Las pruebas autenticadas usan cuentas temporales identificadas y eliminadas al terminar.

Verificación previa: build con API real, check y 212 pruebas API aprobadas (0 fallidas; 1 suite de emuladores omitida localmente). Prueba con Firebase real y backend/assets locales: gratis/VIP/admin, propiedad de archivos, canje y recarga, reglas REST denegadas, aplicación de marco, edición/guardado/reapertura de plantilla y cancelación administrativa con reembolso único. Escritorio 1440 y móvil 390 sin desbordamiento ni errores de página. El despliegue público se comprobará tras fusionar; esta sección no confunde esa prueba previa con producción.

La reinstalación detectó body-parser vulnerable; se actualizó únicamente su entrada del lock a 1.20.9 (parche de GHSA-27r3-jxmh-p828). La auditoría npm ya no reporta vulnerabilidades. Reversión: revertir interfaz y API juntas, conservar las colecciones y saldos; no borrar canjes ni ajustes, y resolver solicitudes pendientes antes de retirar las rutas de entrega.

## 2026-10-26 · Storage activo, controles de uso y recarga del editor

PR #50 y #51 están integrados. El corte de límites `aabaece6443a954bc56e0da818695942f2022bbf` quedó publicado: Cloudflare run `40373181802`, bundle `club-hepMNlc5.js` verificado byte a byte, y Railway deployment `4f8e089a-cd0f-47f3-bc5d-9d9c2f40978e` SUCCESS. Firebase y Railway tienen acceso autorizado en este equipo. Los bloqueos de bucket y facturación anotados en las secciones históricas siguientes quedaron resueltos.

El usuario autorizó activar Blaze, delegó elegir la cuenta y eligió límites de uso y alertas sobre **100 MXN mensuales**. Se vinculó «Pago de Firebase», terminación **1F21EF**, y se verificó facturación activa. El presupuesto «OdonTeck Club - 100 MXN mensuales» filtra exclusivamente el proyecto y avisa al 50%, 80% y 100% del gasto actual, con destinatarios de facturación y del proyecto habilitados. No es un tope garantizado: las alertas no detienen cargos, y Storage no figura entre los servicios compatibles con spend caps de Firebase.

Se creó el bucket Firebase `club-odonteck.firebasestorage.app` en `US-CENTRAL1`, con acceso uniforme, prevención de IAM público, sin versionado ni retención de borrado y CORS para los orígenes del club. Antes de desplegar se confirmó que no había releases de reglas Storage. Se publicaron solamente las reglas existentes de `api/storage.rules`: fotos/portadas legibles y escrituras directas denegadas; documentos privados fuera de esa ruta. Las reglas de Firestore no se modificaron.

Controles publicados: 20 autorizaciones de subida por UID en 24 horas, compartidas entre foto, portada y documentos; contador transaccional independiente del perfil. Los PUT firmados exigen `x-goog-content-length-range` y el frontend reenvía `uploadHeaders`/`miniaturaUploadHeaders`. Foto hasta 2 MB y portada hasta 3 MB después de optimizar; rutas fijas por UID y validación al guardar. Imágenes con caché de 24 horas. No limita descargas ni la reutilización de una firma vigente durante sus 10 minutos.

Validación: build y API `check`; 199 pruebas API aprobadas, 0 fallidas, 1 omitida localmente. Los jobs de reglas con emuladores Linux/Java 21 pasaron en CI (`40372903218`, `40372910187`) antes de publicar Storage. En producción, tres cuentas temporales (gratis, VIP y admin) subieron foto/portada desde navegador en el origen oficial, guardaron y recuperaron los mismos bytes tras recargar. Storage rechazó cuerpos mayores que la firma con 400; documentos privados denegaron lectura pública; la autorización 21 recibió 429. Se verificó la eliminación de cuentas, documentos y archivos de prueba. Ningún miembro real se modificó.

La prueba integral del formulario detectó además que `/directorio/editar-perfil` no hidrataba el directorio al entrar directamente o recargar: el editor aparecía vacío pese a existir el perfil remoto. Este corte añade esa ruta a `cargarExtrasDeRuta`, conservando caché e invalidación. La compilación corregida se probó contra el backend de producción con una cuenta temporal: iniciar sesión, seleccionar ambas imágenes, pulsar «Guardar perfil», volver al editor y recargar en 1440×1000 y 390×844, con imágenes remotas y campos conservados, sin errores ni desbordamiento. Esta prueba previa usa assets locales interceptados en un navegador aislado; verificar el nuevo workflow y repetir contra assets públicos después de fusionar. Los identificadores de despliegue del primer párrafo corresponden a PR #51, no prueban por sí solos la publicación de esta corrección adicional.

## 2026-10-26 · Corrección de foto y portada del directorio

La fuente de esta corrección parte de `main` / `5bef28b281ffbab88ddff08dd96b9ff66a9590ef`, publicado previamente por Cloudflare Pages (workflow `40144680513`). Los cortes del 20 de octubre que siguen son históricos. El usuario autorizó publicar esta corrección en producción; el resultado del nuevo despliegue debe comprobarse en el workflow `Deploy a Cloudflare Pages` y en el dominio oficial.

El editor migró a una página, pero sus manejadores de foto/portada seguían buscando un `dialog` inexistente. Ahora buscan el formulario del perfil: seleccionar, quitar y volver a seleccionar el mismo archivo actualiza la vista previa. Se elimina `method="dialog"` y los avisos indican que hay que pulsar «Guardar perfil». Se conserva el contrato existente de subida firmada y guardado autenticado.

Validación: build con la API de producción; API `npm run check` y suite con 196 pruebas aprobadas, 0 fallidas y 1 omitida; prueba de navegador aislado en 1440×1000 y 390×844 de ambas imágenes, eliminación, reselección y guardado/recarga en demo, sin errores de página ni desbordamiento horizontal. El guardado del demo no demuestra persistencia remota.

Pendiente crítico: verificar/configurar Firebase Storage y probar el guardado con una cuenta real. Los buckets `club-odonteck.firebasestorage.app` y `club-odonteck.appspot.com` devuelven públicamente 404 «The specified bucket does not exist»; no se pudo inspeccionar la variable efectiva de Railway porque su conexión requiere autenticación, y Firebase CLI no tiene cuentas autorizadas. Esto no prueba la ausencia de cualquier otro bucket. No se modificaron API, reglas, variables ni datos de miembros. `/health` responde 200 y la solicitud de subida sin sesión responde 401. Reversión: revertir el commit de esta corrección y dejar que el workflow de Cloudflare publique el revert; no revertir cambios ajenos posteriores.

## Corte operativo confirmado · 2026-10-20

La versión pública confirmada del corte anterior incluye PR #25, merge `57944994ae576caffdcaf522a16d8117298e65d5`. Cloudflare Pages deployment `9b2b5f62-e069-4fb5-a87c-931878f2ea4f` sirvió `5794499`.

PR #26 (`64d87af560ac29df55b262be54000906527b448b`) ya está integrado en `main`; sus pruebas y el workflow de GitHub Pages pasaron. **Eso no significa que el dominio oficial tenga este corte:** el CNAME de `www.odonteckconsulting.com` apunta a Cloudflare Pages (`odonteck-club.pages.dev`), cuyo deployment más reciente sigue siendo `9b2b5f62-e069-4fb5-a87c-931878f2ea4f` / `5794499`. El artifact de GitHub Pages para `64d87af` sí se construyó, pero es otra superficie.

El API de Railway sigue en el deployment `7f12434b-30df-4996-929e-13eeb97d48cd` / `879d87d`; el endpoint nuevo `GET /notas-clase/curso-a/1` respondió `404` sin token (el código nuevo debe responder `401`). Un trigger manual al servicio existente devolvió `Deploys have been paused temporarily`; el código de Railway no se ha actualizado. **No desplegar el frontend nuevo en Cloudflare hasta que Railway publique el API `64d87af` y el endpoint autenticado verifique `401` sin token.** Luego desplegar `dist/` con Wrangler al proyecto `odonteck-club`, rama `main`, y verificar ambos hashes y el dominio oficial. No cambiar variables, dominio ni pagos.

PR #26 implementa el acceso compacto, diálogo amplio y sincronización autenticada por UID. No se mezcla el `localStorage` previo con cuentas autenticadas; no se otorgan puntos por escribir/repasar cuaderno. El alcance y las decisiones están en [`DECISIONES-CUADERNO-CLASE-2026-10-20.md`](DECISIONES-CUADERNO-CLASE-2026-10-20.md).

PR #23 sigue siendo el antecedente funcional del minijuego persistido: guarda mecánica, finalización, mejor puntaje, intentos y fechas por UID; acredita 5 puntos por primera finalización por clase de forma idempotente y añade contador/logro. Su API es `GET /juegos-clase`, `POST /juegos-clase/:cursoId/:n`; colección `v2_juegos_clase`. No se debe mezclar ese flujo con el cuaderno.

Los párrafos de incidentes y cortes anteriores de este archivo son históricos. Para publicar, comprobar el commit y despliegue actual por separado; GitHub Pages, Cloudflare Pages y Railway son señales distintas. No realizar un despliegue nuevo sin autorización explícita.

### Actualización desplegada y verificada · 2026-10-20 (antecedente PR #23)

PR #23 está integrado en `main` (`879d87d`). El minijuego de cierre de clase se conecta a la API autenticada: guarda mecánica, finalización, mejor puntaje, intentos y fechas por UID; acredita 5 puntos por la primera finalización de cada clase, idempotentes incluso en reintentos; añade contador/logro de diez juegos. Se valida que la vista de clase ya exista antes de guardar. API: `GET /juegos-clase`, `POST /juegos-clase/:cursoId/:n`; colección `v2_juegos_clase`. La UI conserva el resultado y ofrece reintentar el guardado si la red falla.

Railway deployment `7f12434b-30df-4996-929e-13eeb97d48cd`; Cloudflare Pages deployment `cb0fe57b-f389-410e-b1ea-4fd5080e866d`; GitHub Pages run `39459794440` SUCCESS. El API respondió `/health` 200 y rutas de juegos sin credenciales 401; el dominio oficial respondió 200 y su bundle incluye el nuevo endpoint. Pruebas API 178 pass, 0 fail, 1 skip intencional; build, `npm run audit:class-games` (77/77) y `git diff --check` pasan. No se probó el flujo con sesión real. No tocar la rama/árbol de trabajo paralelo `odonteck-club-wt-herramientas`, ni modificar pagos, webhooks o membresías.

## 1. Fuente de verdad

- Repositorio: `https://github.com/teccapitalweb/odonteck-club.git`
- Rama: `main`
- Corte público verificado más reciente: `57944994ae576caffdcaf522a16d8117298e65d5` (merge PR #25; frontend)
- Dominio: `https://www.odonteckconsulting.com/`
- Frontend de dominio oficial: Cloudflare Pages; deployment comprobado `9b2b5f62-e069-4fb5-a87c-931878f2ea4f`, commit `5794499`. El workflow de GitHub Pages es una señal de CI/publicación separada, no prueba por sí solo qué atiende el dominio.
- API: `https://api-production-db314.up.railway.app`
- Railway: proyecto `odonteck-club-v2`, servicio `api`; último deployment de backend registrado en este relevo: `7f12434b-30df-4996-929e-13eeb97d48cd` (PR #23, commit `879d87d`). No hubo cambio de API en PR #24 ni #25. Revalidar Railway si se va a desplegar backend.

### Registro histórico por revalidar: compra y retorno Stripe (2026-10-20)

El bundle público todavía envía el botón de plan a `vip-auth.html?tab=register`; esa URL sirve la SPA y por eso la navegación vuelve al inicio/landing. En el worktree de PR #21 el botón ya usa checkout directo; además, en este turno se corrigieron localmente los retornos a `/#/suscripcion`, se añadió estado de confirmación y soporte al evento de pago diferido. Estos cambios locales aún no están desplegados. La evidencia y las pruebas están en [`INCIDENTE-RETORNO-STRIPE-2026-10-20.md`](INCIDENTE-RETORNO-STRIPE-2026-10-20.md).

En la captura de ese corte Railway listaba el nombre `STRIPE_WEBHOOK_SECRET`, pero el valor no se verificó. No usar este registro para inferir el estado actual del flujo ni del secreto. Antes de cualquier cambio Stripe, revalidar el bundle público, el código/PR integrado y los webhooks en Dashboard/Test Mode; no iniciar una compra real. No se tocó configuración Stripe en esta auditoría. El documento [`INCIDENTE-RETORNO-STRIPE-2026-10-20.md`](INCIDENTE-RETORNO-STRIPE-2026-10-20.md) conserva la evidencia de aquel momento, no una garantía actual.

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
2. Confirmar que `STRIPE_WEBHOOK_SECRET` tenga valor no vacío y verificar el endpoint/eventos desde Stripe sin copiar el secreto; reparar compra y retorno según `INCIDENTE-RETORNO-STRIPE-2026-10-20.md`. Hasta pasar pruebas en Stripe Test Mode, no habilitar el Checkout v2 ni quitar el flujo heredado.
3. Ejecutar pruebas de reglas Firestore/Storage con emuladores. **CUMPLIDO LOCALMENTE el 2026-10-12** (`npm run test:rules` PASS 3/3 con emuladores en este host; ver §7). La validación en producción no está incluida aquí: sigue abierta como parte de #4.
4. Desplegar y hacer smoke autenticado del Directorio (reglas, índices, miembro y admin) antes de abrirlo masivamente, incluyendo el **despliegue y la validación de reglas Firestore/Storage en el runtime público** (local ≠ producción). El código local ya incluye consentimiento opt-in, privacidad, anti-spam y moderación.
5. Habilitar Storage para futuras cargas administradas; no es necesario para los diez PDF empaquetados actuales.
6. Auditar licencias antes de publicar nuevos libros/materiales.
7. Resolver accesibilidad pendiente y dividir el chunk grande del build demo.
8. Migrar los 68 quizzes aprobados y regenerar/revisar el catálogo completo con el formato avanzado de 5 interacciones por clase. El piloto local de Ortodoncia ya tiene revisión editorial documentada en `docs/REVISION-CLINICA-PILOTO-ORTODONCIA.md` y cuatro grupos de redacción clínica corregidos, pero continúa en `borrador` hasta que un odontólogo u ortodoncista firme las 25 actividades y cinco fichas. El pipeline exige evidencia `mm:ss` y diversidad (`seleccion`, `seleccion_multiple`, `ordenar`, `relacionar`, `completar`); no afirmar que los 77 videos fueron analizados. También faltan revisión odontológica del resto del catálogo y las demás fichas PDF/Storage.
9. En la rama `feat/juegos-cierre-clase` (subida a `origin`), cada clase cuenta con **1 juego clásico visual único** (sin repetir tipo en clases consecutivas del mismo curso) entre 5 mecánicas: **Rompecabezas visual `3:4` (`2×2`, cuatro piezas)** (18 clases, 1 garantizado por curso), **Sopa de letras clínica** (15 clases), **El ahorcado clínico con monitor dental SVG** (14 clases), **Memorama clínico 3D** (15 clases) y **Palabra secreta** (15 clases). Al terminar el video se registra la vista y el juego queda listo; se abre al pulsar «Finalizar y jugar» o «Siguiente clase →», sin interponer un segundo quiz. También aparece en `.lesson-closing-card` debajo del reproductor. Cobertura verificada 77/77 clases con `npm run audit:class-games`. Los 18 prompts `3:4` para las ilustraciones de rompecabezas están en `docs/prompts-rompecabezas-3x4.md`.

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

