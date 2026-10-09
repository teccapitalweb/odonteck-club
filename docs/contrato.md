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
  clases: [{ n, titulo, videoId, duracionMin: number|null, gratis: boolean, notas?: { resumen, conceptos: [{ t: 'mm:ss', texto }] } }],
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

### `v2_quizzes/{cursoId}_{n}`
`{ cursoId, n, estado: 'borrador'|'aprobado', preguntas: [{ q, opciones: string[], correcta: number, explicacion }], generado, revisadoPor? }`

### `v2_intentos/{uid}_{cursoId}_{n}`
`{ uid, cursoId, n, correctas, total, aprobado, fecha }`

### `v2_retos_estados/{uid}`
Estado personal del entrenamiento clínico, escrito únicamente por la API:
`{ uid, xp, quiz: { mejor, mejorCombo, jugados, aciertos, total }, preguntas, dominio, actividad, actualizado }`.

- `preguntas[cursoId_n_indice]` conserva intentos, aciertos y última respuesta para priorizar refuerzos.
- `dominio[area]` acumula aciertos/total y alimenta el mapa personal del hub.
- `actividad` registra constancia y racha sin guardar correo, nombre ni otra PII.
- La API limita XP a la primera respuesta de cada pregunta por día; repetir sigue sirviendo para practicar, pero no para inflar puntos.

### `v2_recompensas_estado/{uid}`
Saldo central y logros del miembro, escrito únicamente por la API:
`{ uid, saldo, ganados, gastados, contadores, logros, desbloqueos: { materiales: id[] }, notificaciones, actualizado }`.

- Cada actividad tiene una clave única; reintentar una petición, recargar o volver a completar lo mismo no duplica puntos.
- Las clases suman 10, terminar un curso 50, aprobar una evaluación 20, Retos 2 o 10 por primer intento diario, encuestas 20 a 40, Comunidad 5 o 10 y una membresía confirmada 300.
- La primera lectura de `/recompensas/resumen` reconoce progreso, certificados, quizzes, encuestas, temas y XP de Retos ya existentes para conservar a miembros anteriores.
- Los nueve materiales propios premium incluidos explícitamente en `api/src/lib/recompensas.js` pueden desbloquearse permanentemente con puntos; Atlas ICDAS permanece gratuito. Los diez PDF aprobados viajan dentro del despliegue privado de la API y se entregan con enlaces firmados de 10 minutos. Storage sigue disponible para materiales futuros administrados desde el panel.

### `v2_recompensas_movimientos/{hash}`
Libro mayor inmutable: `{ uid, clave, tipo, puntos, detalle, fecha }`. El ID es un hash de `uid + clave` para garantizar idempotencia.

### `v2_recompensas_canjes/{hash}`
`{ uid, recompensaId, titulo, puntos, tipo, estatus:'entregado'|'pendiente', solicitado }`.
Los materiales se entregan automáticamente. Praxia se registra como `pendiente`; nunca se presenta como activado hasta que el equipo lo confirme.

### `v2_cortesias/{uid}`
`{ uid, hasta: ISO, motivo, otorgadaPor, fecha }`

### `v2_avisos/{id}`
`{ id, titulo, texto, enlace?, fecha, autor }`

### `v2_encuestas_estado/{uid}`
`{ uid, primeraVista, ultimaConsulta, pospuestas: { [clave]: { hasta, veces } }, actualizado? }`

Sirve para programar recordatorios sin bloquear el acceso. La entrevista inicial se puede posponer 3 días, la evaluación de curso 7 y la de experiencia en la plataforma 14 (máximo 2 veces por trimestre; después deja de insistir).

La encuesta de experiencia (`experiencia-v2--<AAAA>T<n>`, una clave por trimestre) sale a los 21 días de la primera visita, o desde el día 7 si ya vio 8 clases, y se repite cuando pasan 90 días desde la última respuesta. Sus preguntas pueden llevar `mostrarSi` (`{ pregunta, valores | hasta }` o `{ vip }`): la API ignora respuestas a preguntas que no aplican y sólo exige las que sí.

### `v2_encuestas_respuestas/{uid}__{clave}`
`{ uid, clave, encuestaId, version, tipo, cursoId?, cursoTitulo?, vip, respuestas, enviado, avisoPrivacidad, correoContacto? }`

`vip` es el plan al responder (para segmentar agregados). `correoContacto` sólo existe si la persona calificó bajo en la encuesta de experiencia y eligió "Sí, escríbanme"; es el único dato con identidad que ve el admin.

Las plantillas son versionadas en código para conservar preguntas comparables. La entrevista inicial vigente es `bienvenida-v2` (siete preguntas: `situacion`, `experiencia`, `como_conocio`, `objetivo`, `intereses` (hasta 3), `formato` (hasta 2) y `reto`); el cliente la presenta como página propia en `#/bienvenida`. Cambiar preguntas u opciones exige subir la versión en `api/src/lib/encuestas.js` y en su espejo demo `src/core/encuestas.ts` (la v2 se ajustó en sitio el 2 de octubre de 2026 porque aún no se había desplegado ni recibido respuestas reales). El cliente nunca envía el UID. El panel administrativo sólo recibe agregados y comentarios sin UID, nombre ni correo.

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
| POST | `/video/token` | `{ cursoId, n }` → `{ embedUrl, expires }` · mismas reglas de acceso |
| GET | `/materiales/:id/descarga` | `{ url }` URL temporal de 10 min al PDF privado empaquetado o a Storage · VIP, material con `gratis: true` o desbloqueo permanente canjeado. El frontend la consume desde `#/materiales/:id/visor` y renderiza el documento en memoria con PDF.js; la URL no se persiste. |
| GET | `/recompensas/resumen` | Saldo, contadores, logros, catálogo de recompensas, movimientos y notificaciones no leídas; sincroniza actividad histórica |
| POST | `/recompensas/canjear` | `{ recompensaId }` → descuenta una sola vez y entrega material o crea solicitud pendiente de Praxia |
| POST | `/recompensas/notificaciones/leidas` | Marca como leídos los avisos personales de logros y canjes |
| GET | `/certificados` | `Certificado[]` del usuario |
| GET | `/verificar/:folio` **pública** | `{ valido, nombre, cursoTitulo, emitido }` |
| GET | `/quiz/:cursoId/:n` | `{ preguntas: [{ q, opciones }] }` (solo aprobados, sin respuestas) |
| POST | `/quiz/:cursoId/:n` | `{ respuestas: number[] }` → `{ correctas, total, aprobado, detalle, recompensas }` |
| GET | `/retos/resumen` | Estado, disponibilidad por área y sesión recomendada; sólo cuenta quizzes aprobados y clases accesibles |
| POST | `/retos/sesion` | `{ modo:'practica'|'relampago', area?, limite? }` → preguntas adaptativas sin respuestas ni explicaciones |
| POST | `/retos/responder` | `{ cursoId, n, indice, opcion:number|null }` → calificación, feedback, XP, recompensas y dominio actualizados en servidor |
| GET | `/foro?cursoId=` | `Hilo[]` (sin ocultos) |
| POST | `/foro` | `{ titulo, texto, cursoId? }` → Hilo |
| GET | `/foro/:id` | `{ hilo, respuestas }` |
| POST | `/foro/:id/respuestas` | `{ texto }` → Respuesta |
| POST | `/foro/:id/util` | → `{ util }` (una vez por usuario) |
| POST | `/eventos/:id/reserva` | → `{ reservado: boolean }` (alterna) |
| GET | `/encuestas/pendientes` | `{ pendientes: Encuesta[] }` · entrevista inicial, fin de curso y experiencia en la plataforma · devuelve también `respondidas` (claves), `vip` y `perfil` (respuestas de la entrevista inicial: objetivo, formato, situacion y reto; `intereses` usa la preferencia editable de `v2_perfiles` cuando existe) |
| POST | `/encuestas/:clave/responder` | `{ respuestas }` → registra una sola respuesta versionada y su evento de puntos |
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
APP_URL=https://club.odonteckconsulting.com
ALLOWED_ORIGINS=http://localhost:5179,https://club.odonteckconsulting.com
PORT=8080
```

## Firma de Bunny (Token Authentication del embed)

```
expires = floor(now/1000) + TTL
token   = sha256_hex(BUNNY_TOKEN_AUTH_KEY + videoId + expires)
url     = https://iframe.mediadelivery.net/embed/{libraryId}/{videoId}?token={token}&expires={expires}
```
