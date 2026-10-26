# OdonTeck Club · Contrato entre app, admin y backend

Fuente única de verdad para `src/` (app y admin), `api/` (backend en Railway) y `scripts/`.
Si algo cambia aquí, cambia en los tres lados.

## Principios

1. **Convivencia con el club actual.** El proyecto Firebase `club-odonteck` sigue alimentando el panel viejo
   (`vip-panel.html`) mientras se construye este. Por eso **todas las colecciones nuevas usan el prefijo `v2_`**
   y no se toca ninguna colección vieja salvo lectura. La única colección compartida es `miembros/{uid}`,
   que el backend nuevo **lee** para saber si alguien es VIP. Solo escribe en ella el día del cambio definitivo.
2. **El navegador no escribe datos de valor.** Progreso, certificados, membresía, quizzes y todo lo del admin
   pasan por el backend con token verificado. Las reglas de Firestore niegan escrituras directas a `v2_*`.
3. **Admin real.** Custom claim `admin: true` en Firebase Auth, puesto con `api/scripts/set-admin.mjs`.
   Se verifica en el backend (middleware) y en las reglas. Nunca listas de correos en el cliente.
4. **Videos de Bunny siempre firmados** desde el backend (biblioteca 725453). El cliente nunca ve la llave.
5. **Stripe convive.** El webhook viejo en Railway (`odonteck-production`) sigue recibiendo eventos.
   El endpoint `/stripe/webhook` nuevo existe y está probado, pero **no se registra en Stripe hasta el cambio**.

## Modo de datos del frontend

`VITE_API_URL` definida → modo **api** (Firebase Auth + backend).
Sin definir → modo **demo** (todo en `localStorage`, sembrado desde `src/data/*.json`). Ambos exponen la misma interfaz.

## Configuración web de Firebase (pública, va en el cliente)

```
apiKey: AIzaSyA3xYpORcvvcXrhNaXOBBBPm19mxdIcNsU
authDomain: club-odonteck.firebaseapp.com
projectId: club-odonteck
storageBucket: club-odonteck.firebasestorage.app
messagingSenderId: 306331582203
appId: 1:306331582203:web:7d70e51f0180528ddffa5e
```

## Modelo de datos (Firestore)

### `miembros/{uid}` o `miembros/email_...` (colección vieja, solo lectura hasta el cambio)
Campos que usa el panel actual para decidir acceso:
- `activa`, `activo` o `esRegalo`: boolean
- `expiraEn`, `fechaFinAcceso` o `fechaProximaRenovacion`: Timestamp o ISO (opcional; si existe y ya pasó, no hay acceso)
- `plan`: `'mensual' | 'anual' | 'regalo' | ...`, `esRegalo`: boolean
- `nombre`, `email`, `whatsapp` (pueden faltar)

La API v2 busca primero por el UID autenticado y después por el correo verificado por Firebase. Este segundo paso conserva las altas manuales/regalos del portal anterior cuyos documentos quedaron identificados como `email_...`. Si hay duplicados, se elige cualquier registro vigente antes que uno vencido y se conservan los identificadores de Stripe disponibles.

**Regla de acceso VIP** (backend, `esVip(miembro, ahora)`): `(activa === true || activo === true || esRegalo === true) && (!exp || exp > ahora)`,
o bien una cortesía nueva vigente en `v2_cortesias/{uid}.hasta > ahora`, o claim `admin`.

### `v2_perfiles/{uid}`
`{ nombre, whatsapp, especialidad, ciudad, intereses?: string[] (1 a 3 valores válidos de bienvenida-v2), avisos: { enVivo, nuevos, comunidad }, actualizado }`

`intereses` representa la preferencia actual editable del miembro. No reescribe la respuesta histórica de `bienvenida-v2`, para conservar comparables los agregados de la entrevista inicial.

### `v2_cursos/{cursoId}`
```
{ id, titulo, area, nivel: 'Básico'|'Intermedio'|'Avanzado', instructor, portada, banner?, descripcion,
  aprenderas: string[], orden: number, publicado: boolean, bunnyCollectionId,
  clases: [{ n, titulo, videoId, duracionMin: number|null, gratis: boolean,
    notas?: { resumen, conceptos: [{ t: 'mm:ss', texto }] },
    ficha?: { estado: 'borrador'|'aprobada', archivo?: 'fichas/...pdf', version?, revisadaPor?, actualizada? } }],
  actualizado }
```
El `videoId` **nunca** sale al cliente de miembros: `/catalogo` lo elimina.

La landing no consume `/catalogo` de miembro ni Firestore desde el navegador. Su ruta pública
`/landing/catalogo` aplica una lista blanca propia, devuelve sólo cursos `publicado === true`,
rechaza portadas externas y jamás expone `videoId`, IDs de Bunny, miembros, reservas ni IDs de Stripe.
Los precios se confirman contra Stripe cuando está configurado; si no se pueden verificar, son `null`
y el cliente muestra “Por confirmar” en lugar de inventar un importe.

### `v2_progreso/{uid}_{cursoId}`
`{ uid, cursoId, vistas: number[], ultima: number, historial: ISO[], actualizado }`

### `v2_juegos_clase/{uid}_{cursoId}_{n}`
`{ uid, cursoId, n, tipo, completado, mejorPuntaje: 0..100, intentos, primeraVez, ultimoIntento, actualizado }`.
El registro es privado por UID y se lee mediante `GET /juegos-clase`; el miembro no escribe Firestore directamente. La API exige que la vista de esa clase ya esté registrada. El primer juego completado de cada clase acredita 5 puntos; reintentos actualizan intentos y mejor puntaje sin volver a acreditar puntos. Mecánicas aceptadas: `rompecabezas`, `sopa`, `ahorcado`, `memorama` y `palabra`.

### `v2_notas_clase/{uid}_{cursoId}_{n}`
`{ uid, cursoId, n, repasados: number[], bitacora: string (máx. 1800), actualizado }`.
Cuaderno privado del miembro autenticado; no contiene respuestas de quiz ni sustituye las notas editoriales del curso. La API valida acceso/desbloqueo de la clase, limita los índices a los conceptos publicados y sólo expone al titular `GET /notas-clase/:cursoId/:n`; `PUT` sobrescribe su propia bitácora y marcas. El modo demo guarda localmente en este navegador. En modo API no se lee ni se escribe `localStorage` para este cuaderno. No hay puntos por editarlo.

### `v2_certificados/{folio}`
`{ folio: 'ODT-AAAA-NNNNN', uid, nombre, cursoId, cursoTitulo, area, clases, emitido: ISO }` · lectura pública por folio.

### `v2_materiales/{id}`
`{ id, titulo, tipo: 'PDF'|'Libro'|'Presentación', categoria, area, autor, paginas, portada, cursoId|null, descripcion,
  estado: 'disponible'|'proximamente'|'oculto', gratis: boolean, archivo: 'materiales/<id>.pdf' (Storage), actualizado }`

### `v2_eventos/{id}`
`{ id, titulo, ponente, fecha: ISO, duracionMin, enlace?, cursoId?, publicado, reservas: uid[] }`

### `v2_foro/{hiloId}` y `v2_foro/{hiloId}/respuestas/{id}`
Hilo: `{ id, titulo, texto, autorUid, autor, cursoId|null, fecha, util: number, utilPor: uid[], oculto: boolean }`
Respuesta: `{ id, autorUid, autor, texto, fecha, oculto }`

### Directorio profesional

- `v2_directorio_perfiles/{uid}`: perfil opt-in con titular, etapa, especialidades, ubicación, modalidades, disponibilidad, habilidades, idiomas, años de experiencia, bio, experiencia laboral, formación, credenciales, visibilidad, `foto` y `banner` públicos opcionales y `contacto` privado. Los registros de experiencia guardan `{ puesto, organizacion, periodo, descripcion }`; formación `{ programa, institucion, periodo }`; credenciales `{ nombre, emisor, anio }`.
- `v2_directorio_oportunidades/{id}`: empleo, colaboración, mentoría, suplencia, prácticas o consultorio compartido; expira a los 45 días.
- `v2_directorio_conexiones/{id}`: solicitud entre dos UID, mensaje y estado `pendiente|aceptada|rechazada`.
- `v2_directorio_reportes/{hash}`: denuncia privada con tipo, objetivo, motivo, detalle, estado y acción administrativa. El hash estable evita duplicados; las reglas niegan lectura y escritura directa al cliente.

La API nunca incluye `contacto` en la proyección pública del perfil. Solo lo entrega a las dos partes después de que la persona destinataria acepta la conexión. Crear perfil, explorar y conectar está disponible para cualquier usuario autenticado; publicar oportunidades requiere VIP o admin.

La foto profesional se recorta en el navegador a un cuadrado de 720 px y la portada a 1600×560 px; ambas se convierten a WebP antes de subirlas. La API sólo firma durante 10 minutos las rutas exactas `directorio/perfiles/{uid}/avatar.webp` (máximo 2 MB) y `directorio/perfiles/{uid}/banner.webp` (máximo 3 MB). Al guardar el perfil comprueba nuevamente `contentType` y tamaño reales en Storage; ningún cliente puede escribir directamente mediante las reglas de Storage. Ambos recursos son públicos porque forman parte del perfil opt-in.

Las respuestas de subida incluyen `uploadHeaders`, que el cliente debe enviar íntegros en el PUT firmado. `x-goog-content-length-range` está incluido en la firma y limita el archivo al tamaño declarado y validado por la API; Storage rechaza un cuerpo mayor. Los documentos también incluyen `miniaturaUploadHeaders` para el PUT de la miniatura. Las fotos/portadas se guardan con caché pública de 24 horas y URLs versionadas; los documentos mantienen su acceso privado.

Foto, portada y documentos comparten un máximo de 20 autorizaciones de subida por UID en una ventana móvil de 24 horas. El contador transaccional vive en `v2_directorio_subidas/{uid}` y no se reinicia al guardar, eliminar o recrear el perfil. El exceso devuelve 429 sin emitir una nueva URL. Este cupo limita nuevas autorizaciones, no la reutilización de una URL durante sus 10 minutos ni las descargas públicas; no es un tope monetario. Las alertas de presupuesto tampoco cortan cargos.

### `v2_quizzes/{cursoId}_{n}`
Los registros existentes `{ q, opciones, correcta, explicacion }` siguen siendo válidos y se interpretan como `tipo: 'seleccion'`. La v2 admite además `seleccion_multiple`, `ordenar`, `relacionar` y `completar`, con respuesta tipada y crédito parcial. `version` comienza en 1 y aumenta cuando cambia el contenido; editar preguntas sin aprobarlas explícitamente devuelve el quiz a `borrador`. GET solo entrega configuración pública; las reglas de calificación y explicaciones permanecen en servidor hasta contestar. El detalle técnico está en `docs/PLAN-DIRECTORIO-EVALUACIONES.md`.

### `v2_intentos/{uid}_{cursoId}_{n}`
Conserva el último resultado y un historial privado acotado:
`{ uid, cursoId, n, versionQuiz, correctas, total, puntaje: 0..100, aprobado, fecha, intentos, mejorPuntaje, aprobadoAlgunaVez, historial[] }`.

Cada entrada de `historial` guarda número de intento, versión del quiz, respuestas, puntuación, confianza y bitácora opcional. Se retienen los diez intentos más recientes para no crecer sin límite. La confianza y la justificación nunca alteran la calificación. Los documentos anteriores se migran de forma compatible al siguiente intento; `puntaje`, `versionQuiz` e `historial` pueden faltar en datos heredados.

### `v2_retos_estados/{uid}`
Estado personal del entrenamiento clínico, escrito únicamente por la API:
`{ uid, xp, quiz: { mejor, mejorCombo, jugados, aciertos, total }, preguntas, dominio, actividad, actualizado }`.

- `preguntas[cursoId_n_indice]` conserva intentos, aciertos y última respuesta para priorizar refuerzos.
- `dominio[area]` acumula aciertos/total y alimenta el mapa personal del hub.
- `actividad` registra constancia y racha sin guardar correo, nombre ni otra PII.
- La API limita XP a la primera respuesta de cada pregunta por día; repetir sigue sirviendo para practicar, pero no para inflar puntos.

### `v2_recompensas_estado/{uid}`
Saldo central y logros del miembro, escrito únicamente por la API:
`{ uid, saldo, ganados, gastados, contadores, logros, desbloqueos: { materiales: id[], recompensas: id[] }, personalizacion: { marco: id|null, portada: id|null }, notificaciones, actualizado }`.

- Cada actividad tiene una clave única; reintentar una petición, recargar o volver a completar lo mismo no duplica puntos.
- Las clases suman 10, completar su juego de repaso suma 5 (una sola vez por clase), terminar un curso 50, aprobar una evaluación 20, Retos 2 o 10 por primer intento diario, encuestas 20 a 40, Comunidad 5 o 10 y una membresía confirmada 300.
- Desglose vigente: clase vista 10; juego de repaso completado 5 por clase; curso completado 50; quiz aprobado 20; respuesta correcta de Retos 10 o intento 2; bienvenida 25; Brújula profesional 0; encuesta de curso 20; encuesta de experiencia 40; tema de Comunidad 10; respuesta 5; membresía confirmada 300.
- La primera lectura de `/recompensas/resumen` reconoce progreso, certificados, quizzes, encuestas, temas y XP de Retos ya existentes para conservar a miembros anteriores.
- Los nueve materiales propios premium incluidos explícitamente en `api/src/data/recompensas.json` pueden desbloquearse permanentemente con puntos; Atlas ICDAS permanece gratuito. Los diez PDF aprobados viajan dentro del despliegue privado de la API y se entregan con enlaces firmados de 10 minutos. Storage sigue disponible para materiales futuros administrados desde el panel.
- Cuando una respuesta autenticada incluye `recompensas`, `src/main.ts` dispara el evento `recompensas:ganadas`: muestra un aviso inmediato de puntos y otro por cada logro nuevo. La API guarda además los avisos no leídos en `notificaciones`; la campana los contabiliza y los marca como leídos al abrirla. La clave idempotente del movimiento evita avisos y puntos duplicados por recarga o reintento.
- Logros vigentes: primer paso (1 clase), en marcha (5 clases), primer certificado (1 curso), mente clínica (3 quizzes), retador constante (100 puntos de Retos), voz de comunidad (primer tema), especialista (3 cursos), maestro (10 cursos) y miembro del club (membresía pagada).

### `v2_recompensas_movimientos/{hash}`
Libro mayor inmutable: `{ uid, clave, tipo, puntos, detalle, fecha }`. El ID es un hash de `uid + clave` para garantizar idempotencia.

### `v2_recompensas_canjes/{hash}`
`{ uid, recompensaId, titulo, puntos, tipo, estatus:'entregado'|'pendiente'|'cancelado', solicitado, reservaCupo, plazo, nota?, resuelto?, resueltoPor? }`.
Materiales, plantillas y diseños se entregan automáticamente; los demás beneficios crean solicitudes pendientes. Resolver exige admin; cancelar devuelve el importe original una sola vez y repone el cupo reservado, preservando ganados. Un canje por recompensa y miembro, incluso si fue cancelado.

### `v2_recompensas_catalogo/{id}`
Ajustes sobre el catálogo estático y nuevas propuestas manuales: título, descripción, precio, estado, cupo, plazo, instrucciones internas, confirmación de revisión profesional y auditoría de actualización. El miembro nunca recibe instrucciones internas ni identidad del editor. API únicamente; las reglas remotas mantienen su cierre por defecto.

120 propuestas base: 59 entregas automáticas, una solicitud manual de Praxia y 60 próximas. El canje de Praxia no activa licencias; queda pendiente hasta la confirmación del equipo. Las 40 plantillas HTML originales se empaquetan en `api/private/recompensas/plantillas.json`; descarga autenticada requiere canje. Son hojas de trabajo con tablas, guiones y planificadores; no piezas gráficas terminadas ni archivos de diapositivas. Los diseños se aplican desde su ruta dedicada y no pueden adjudicarse mediante PUT de perfil. Subir/quitar una portada propia desactiva la portada de colección de forma transaccional. OdonCoins conserva el saldo anterior 1:1 y las reglas existentes de obtención. VIP mantiene materiales incluidos; las nuevas plantillas y diseños se canjean con OC.

### `v2_cortesias/{uid}`
`{ uid, hasta: ISO, motivo, otorgadaPor, fecha }`

### `v2_avisos/{id}`
`{ id, titulo, texto, enlace?, fecha, autor }`

### `v2_encuestas_estado/{uid}`
`{ uid, primeraVista, ultimaConsulta, pospuestas: { [clave]: { hasta, veces } }, actualizado? }`

Sirve para programar recordatorios sin bloquear el acceso. La entrevista inicial se puede posponer 3 días, la evaluación de curso 7 y la de experiencia en la plataforma 14 (máximo 2 veces por trimestre; después deja de insistir).

La encuesta de experiencia (`experiencia-v2--<AAAA>T<n>`, una clave por trimestre) sale a los 21 días de la primera visita, o desde el día 7 si ya vio 8 clases, y se repite cuando pasan 90 días desde la última respuesta. Sus preguntas pueden llevar `mostrarSi` (`{ pregunta, valores | hasta }` o `{ vip }`): la API ignora respuestas a preguntas que no aplican y sólo exige las que sí.

### `v2_encuestas_respuestas/{uid}__{clave}`
`{ uid, clave, encuestaId, version, tipo, cursoId?, cursoTitulo?, vip, respuestas, resultado?, enviado, avisoPrivacidad, correoContacto? }`

`vip` es el plan al responder (para segmentar agregados). `correoContacto` sólo existe si la persona calificó bajo en la encuesta de experiencia y eligió "Sí, escríbanme"; es el único dato con identidad que ve el admin.

Las plantillas son versionadas en código para conservar preguntas comparables. La entrevista inicial vigente es `bienvenida-v2` (siete preguntas: `situacion`, `experiencia`, `como_conocio`, `objetivo`, `intereses` (hasta 3), `formato` (hasta 2) y `reto`); el cliente la presenta como página propia en `#/bienvenida`. Cambiar preguntas u opciones exige subir la versión en `api/src/lib/encuestas.js` y en su espejo demo `src/core/encuestas.ts` (la v2 se ajustó en sitio el 2 de octubre de 2026 porque aún no se había desplegado ni recibido respuestas reales). El cliente nunca envía el UID. El panel administrativo sólo recibe agregados y comentarios sin UID, nombre ni correo.

Después de `bienvenida-v2` queda disponible `brujula-v1`, una orientación opcional de ocho decisiones en `#/brujula`. Su `resultado` contiene tres áreas y tres estilos de trabajo ordenados, con `alcance: "orientacion_no_diagnostica"`. No es prueba psicométrica, no mide aptitud, no determina especialidad y no entrega puntos. Puede posponerse 14 días. La API calcula y guarda el resultado; el cliente sólo lo usa para explicar afinidades y sumar señales a las recomendaciones sin sustituir los intereses declarados.

La Brújula sigue siendo opcional, pero la elección del curso de bienvenida no: una cuenta gratis con estado de curso confirmado y `cursoId: null` queda limitada en el cliente exclusivamente a `#/curso-gratis` hasta completar `POST /curso-gratis`. La selección precede a `#/bienvenida`; la Brújula sólo queda disponible después de la entrevista. VIP, administradores reales, migrados y elecciones existentes quedan exentos. El cliente no activa esta guardia si no pudo confirmar el estado remoto o si no hay cursos elegibles.

### `v2_config/general`
`{ precios: { mensual: 199, anual: 1899 }, descuentoVIP: 20, whatsappSoporte, canalWhatsApp, praxiaUrl, stripePriceMensual, stripePriceAnual }`

## API (Express en Railway)

Todas las rutas usan `Authorization: Bearer <Firebase ID token>` salvo las marcadas **pública**.
Errores: `{ error: 'codigo_corto', mensaje: 'texto para humanos' }` con el status HTTP correcto.

### Miembro
| Método | Ruta | Cuerpo / respuesta |
|---|---|---|
| GET | `/health` **pública** | `{ ok: true }` |
| GET | `/landing/catalogo` **pública** | `{ fuente:'api', verificadoEn, cursos:[{ id,titulo,area,imagen,nivel,instructor,descripcion,clases,accesoGratis }], planes:{ mensual,anual } }` |
| GET | `/me` | `{ uid, email, esVip, esAdmin, plan, vence, perfil }` |
| PATCH | `/me/perfil` | `{ nombre?, whatsapp?, especialidad?, ciudad?, avisos? }` → perfil |
| PATCH | `/me/intereses` | `{ intereses: string[] }` (1 a 3 valores únicos y válidos) → `{ intereses }`; guarda la preferencia actual sin alterar la entrevista inicial |
| GET | `/catalogo` | `{ cursos: Curso[] (sin videoId), materiales: Material[] (incluye `desbloqueadoConPuntos` y `puntosRequeridos`), eventos: Evento[], config }` |
| GET | `/progreso` | `{ [cursoId]: { vistas, ultima, historial, actualizado } }` |
| POST | `/progreso/:cursoId/abrir` | `{ n }` → progreso del curso |
| POST | `/progreso/:cursoId/vista` | `{ n }` → `{ progreso, certificado?, recompensas }` · exige desbloqueo secuencial y acceso (VIP o clase gratis) |
| GET | `/juegos-clase` | Registros de juegos del miembro autenticado; no expone UID |
| POST | `/juegos-clase/:cursoId/:n` | `{ tipo, puntaje: 0..100 }` → `{ juego, recompensas }`; exige clase vista y acceso; 5 puntos idempotentes por primera finalización de cada clase |
| GET | `/notas-clase/:cursoId/:n` | `{ repasados: number[], bitacora: string, actualizado }` del miembro autenticado; valida acceso/desbloqueo de la clase |
| PUT | `/notas-clase/:cursoId/:n` | `{ repasados: number[], bitacora: string }` → cuaderno validado y guardado sólo bajo el UID autenticado; sin recompensa de puntos |
| POST | `/video/token` | `{ cursoId, n }` → `{ embedUrl, expires }` · mismas reglas de acceso |
| GET | `/clases/:cursoId/:n/ficha` | `{ url }` temporal de 10 min al PDF privado; exige ficha `aprobada`, acceso a la clase y desbloqueo secuencial. La ruta interna `archivo` nunca sale en `/catalogo`. |
| GET | `/materiales/:id/descarga` | `{ url }` URL temporal de 10 min al PDF privado empaquetado o a Storage · VIP, material con `gratis: true` o desbloqueo permanente canjeado. El frontend la consume desde `#/materiales/:id/visor` y renderiza el documento en memoria con PDF.js; la URL no se persiste. |
| GET | `/recompensas/resumen` | Saldo, contadores, logros, catálogo de recompensas, movimientos y notificaciones no leídas; sincroniza actividad histórica |
| POST | `/recompensas/canjear` | `{ recompensaId, precioEsperado? }` → valida precio, saldo, propiedad, disponibilidad y cupo; descuenta una sola vez, entrega o crea solicitud. Precio cambiado devuelve 409 sin cobrar |
| GET | `/recompensas/:id/archivo` | Descarga HTML privado; exige propiedad, no-store |
| POST | `/recompensas/personalizacion` | `{ ranura: marco/portada, recompensaId: id/null }`; exige diseño adquirido y perfil existente |
| GET | `/admin/recompensas` | Catálogo con configuración interna y últimos 100 canjes; claim admin en vivo |
| POST | `/admin/recompensas` | Crea propuesta manual con identificador único; inicia Próximamente |
| PATCH | `/admin/recompensas/:id` | Edita precio, estado y entrega; no admite cambiar tipo ni archivo |
| POST | `/admin/recompensas/canjes/:id/resolver` | `{ estatus: entregado/cancelado, nota }`; solo manuales pendientes, devolución idempotente |
| POST | `/recompensas/notificaciones/leidas` | Marca como leídos los avisos personales de logros y canjes |
| GET | `/certificados` | `Certificado[]` del usuario |
| GET | `/verificar/:folio` **pública** | `{ valido, nombre, cursoTitulo, emitido }` |
| GET | `/quiz/:cursoId/:n` | `{ version, preguntas }` (solo aprobados; sin soluciones, explicaciones ni marcas de evidencia) |
| POST | `/quiz/:cursoId/:n` | `{ respuestas, confianzas?: (1\|2\|3)[], justificaciones?: string[] }` → `{ correctas, total, puntaje, aprobado, detalle, recompensas, intento }`; conserva hasta diez intentos y premia una sola vez |
| GET | `/retos/resumen` | Estado, disponibilidad por área y sesión recomendada; sólo cuenta quizzes aprobados y clases accesibles |
| POST | `/retos/sesion` | `{ modo:'practica'|'relampago', area?, limite? }` → preguntas adaptativas con unión pública por `tipo`, sin respuestas ni explicaciones. `relampago` sirve sólo `seleccion` |
| POST | `/retos/responder` | `{ cursoId, n, indice, respuesta }` (compatibilidad: `opcion`) → `{ acertada, puntos, tipo, respuestaCorrecta, explicacion, XP, recompensas, estado }`. La solución sólo aparece después del intento |
| GET | `/foro?cursoId=` | `Hilo[]` (sin ocultos) |
| POST | `/foro` | `{ titulo, texto, cursoId? }` → Hilo |
| GET | `/foro/:id` | `{ hilo, respuestas }` |
| POST | `/foro/:id/respuestas` | `{ texto }` → Respuesta |
| POST | `/foro/:id/util` | → `{ util }` (una vez por usuario) |
| GET | `/directorio?limite=&perfilesAntes=&oportunidadesAntes=` | Perfiles visibles y oportunidades activas paginados con cursores opacos, más conexiones del usuario; sin contacto público |
| PUT | `/directorio/perfil` | Crea/actualiza el perfil profesional opt-in |
| DELETE | `/directorio/perfil` | Retira el perfil, foto y cierra oportunidades/solicitudes pendientes propias |
| POST | `/directorio/perfil/foto/subida` | Firma por 10 min la subida de la foto WebP optimizada a la ruta exclusiva del usuario |
| DELETE | `/directorio/perfil/foto` | Elimina la foto propia y limpia su referencia del perfil |
| POST | `/directorio/perfil/banner/subida` | Firma por 10 min la subida de la portada WebP optimizada a la ruta exclusiva del usuario |
| DELETE | `/directorio/perfil/banner` | Elimina la portada propia y limpia su referencia del perfil |
| POST | `/directorio/oportunidades` | Publica oportunidad por 45 días (VIP/admin) |
| PATCH | `/directorio/oportunidades/:id` | Dueño/admin cierra una oportunidad |
| POST | `/directorio/conexiones` | Envía solicitud privada idempotente a perfil u oportunidad; máximo 10/24 h y sin reintento por 30 días tras rechazo |
| PATCH | `/directorio/conexiones/:id` | Destinatario acepta o rechaza; aceptación habilita contacto |
| POST | `/directorio/reportes` | Denuncia privada de perfil u oportunidad; deduplicada y limitada a 10/24 h |
| POST | `/eventos/:id/reserva` | → `{ reservado: boolean }` (alterna) |
| GET | `/encuestas/pendientes` | `{ pendientes: Encuesta[] }` · entrevista inicial, Brújula, fin de curso y experiencia en la plataforma · devuelve también `respondidas` (claves), `vip` y `perfil` (entrevista, intereses editables y resultado de Brújula cuando existe) |
| POST | `/encuestas/:clave/responder` | `{ respuestas }` → registra una sola respuesta versionada; devuelve `resultado` para Brújula y evento de puntos sólo para las encuestas que puntúan |
| POST | `/encuestas/:clave/posponer` | → difiere el recordatorio sin bloquear al miembro |
| POST | `/stripe/checkout` | `{ plan: 'mensual'|'anual' }` → `{ url }` |
| POST | `/stripe/portal` | → `{ url }` |
| POST | `/stripe/webhook` **pública, firma Stripe** | Solo activo tras el cambio definitivo |

### Admin (claim `admin`)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/admin/resumen` | `{ miembrosActivos, altas30d, bajas30d, clasesVistas30d, certificados30d, temasForo30d, cursosTop: [{ cursoId, titulo, vistas }] }` |
| GET · POST | `/admin/cursos` | Lista completa (con videoId) · crear |
| PATCH · DELETE | `/admin/cursos/:id` | Editar campos o clases · borrar (solo si no tiene progreso) |
| GET · POST · PATCH · DELETE | `/admin/materiales(/:id)` | CRUD |
| POST | `/admin/materiales/:id/subida` | `{ tipo: 'archivo'|'portada', contentType }` → `{ uploadUrl, path }` URL firmada de Storage |
| GET · POST · PATCH · DELETE | `/admin/eventos(/:id)` | CRUD |
| GET | `/admin/miembros?q=&estado=` | `[{ uid, nombre, email, esVip, plan, vence, cortesiaHasta, clasesVistas, ultimaActividad }]` |
| GET | `/admin/miembros/:uid` | Detalle + progreso por curso + certificados |
| POST | `/admin/miembros/:uid/cortesia` | `{ dias, motivo }` → cortesía |
| DELETE | `/admin/miembros/:uid/cortesia` | Revoca |
| GET | `/admin/foro` | Todos, incluidos ocultos |
| PATCH | `/admin/foro/:id` | `{ oculto }` |
| GET | `/admin/directorio/reportes?estado=` | Hasta 100 denuncias, sin exponer el UID del reportante |
| PATCH | `/admin/directorio/reportes/:id` | `{ estado:'revisado'|'descartado', accion:'ninguna'|'ocultar'|'cerrar' }` |
| GET | `/admin/quizzes?estado=` | Lista |
| PATCH | `/admin/quizzes/:id` | `{ preguntas?, estado? }` |
| GET · POST | `/admin/avisos` | Lista · publicar |
| GET | `/admin/encuestas/resumen?plan=vip|gratis` | Totales, distribuciones, promedios, NPS (0-10), bases de preguntas condicionales, `planes` y `periodos` por trimestre; nunca UID ni correo |
| GET | `/admin/encuestas/contactos` | Correos de quienes calificaron 0-6 y pidieron que se les escriba (con su calificación y motivo) |
| GET · PATCH | `/admin/config` | Configuración general |

## Variables de entorno (backend)

```
FIREBASE_SERVICE_ACCOUNT=<JSON en una línea o base64>
FIREBASE_STORAGE_BUCKET=club-odonteck.firebasestorage.app
BUNNY_LIBRARY_ID=725453
BUNNY_TOKEN_AUTH_KEY=
BUNNY_TOKEN_TTL_SECONDS=300
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_MENSUAL=
STRIPE_PRICE_ANUAL=
APP_URL=https://www.odonteckconsulting.com
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,https://www.odonteckconsulting.com
PORT=8080
```

## Firma de Bunny (Token Authentication del embed)

```
expires = floor(now/1000) + TTL
token   = sha256_hex(BUNNY_TOKEN_AUTH_KEY + videoId + expires)
url     = https://iframe.mediadelivery.net/embed/{libraryId}/{videoId}?token={token}&expires={expires}
```
