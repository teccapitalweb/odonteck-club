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
`{ nombre, whatsapp, especialidad, ciudad, avisos: { enVivo, nuevos, comunidad }, actualizado }`

### `v2_cursos/{cursoId}`
```
{ id, titulo, area, nivel: 'Básico'|'Intermedio'|'Avanzado', instructor, portada, banner?, descripcion,
  aprenderas: string[], orden: number, publicado: boolean, bunnyCollectionId,
  clases: [{ n, titulo, videoId, duracionMin: number|null, gratis: boolean, notas?: { resumen, conceptos: [{ t: 'mm:ss', texto }] } }],
  actualizado }
```
El `videoId` **nunca** sale al cliente de miembros: `/catalogo` lo elimina.

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

### `v2_cortesias/{uid}`
`{ uid, hasta: ISO, motivo, otorgadaPor, fecha }`

### `v2_avisos/{id}`
`{ id, titulo, texto, enlace?, fecha, autor }`

### `v2_encuestas_estado/{uid}`
`{ uid, primeraVista, ultimaConsulta, pospuestas: { [clave]: { hasta, veces } }, actualizado? }`

Sirve para programar recordatorios sin bloquear el acceso. La entrevista inicial se puede posponer 3 días, la evaluación de curso 7 y el pulso de uso 14.

### `v2_encuestas_respuestas/{uid}__{clave}`
`{ uid, clave, encuestaId, version, tipo, cursoId?, cursoTitulo?, respuestas, enviado, avisoPrivacidad }`

Las plantillas son versionadas en código para conservar preguntas comparables. La entrevista inicial vigente es `bienvenida-v2` (siete preguntas: `situacion`, `experiencia`, `como_conocio`, `objetivo`, `intereses` (hasta 3), `formato` (hasta 2) y `reto`); el cliente la presenta como página propia en `#/bienvenida`. Cambiar preguntas u opciones exige subir la versión en `api/src/lib/encuestas.js` y en su espejo demo `src/core/encuestas.ts`. El cliente nunca envía el UID. El panel administrativo sólo recibe agregados y comentarios sin UID, nombre ni correo.

### `v2_config/general`
`{ precios: { mensual: 199, anual: 1899 }, descuentoVIP: 20, whatsappSoporte, canalWhatsApp, praxiaUrl, stripePriceMensual, stripePriceAnual }`

## API (Express en Railway)

Todas las rutas usan `Authorization: Bearer <Firebase ID token>` salvo las marcadas **pública**.
Errores: `{ error: 'codigo_corto', mensaje: 'texto para humanos' }` con el status HTTP correcto.

### Miembro
| Método | Ruta | Cuerpo / respuesta |
|---|---|---|
| GET | `/health` **pública** | `{ ok: true }` |
| GET | `/me` | `{ uid, email, esVip, esAdmin, plan, vence, perfil }` |
| PATCH | `/me/perfil` | `{ nombre?, whatsapp?, especialidad?, ciudad?, avisos? }` → perfil |
| GET | `/catalogo` | `{ cursos: Curso[] (sin videoId), materiales: Material[], eventos: Evento[], config }` |
| GET | `/progreso` | `{ [cursoId]: { vistas, ultima, historial, actualizado } }` |
| POST | `/progreso/:cursoId/abrir` | `{ n }` → progreso del curso |
| POST | `/progreso/:cursoId/vista` | `{ n }` → `{ progreso, certificado? }` · exige desbloqueo secuencial y acceso (VIP o clase gratis) |
| POST | `/video/token` | `{ cursoId, n }` → `{ embedUrl, expires }` · mismas reglas de acceso |
| GET | `/materiales/:id/descarga` | `{ url }` URL firmada de Storage, 10 min · VIP o material con `gratis: true` |
| GET | `/certificados` | `Certificado[]` del usuario |
| GET | `/verificar/:folio` **pública** | `{ valido, nombre, cursoTitulo, emitido }` |
| GET | `/quiz/:cursoId/:n` | `{ preguntas: [{ q, opciones }] }` (solo aprobados, sin respuestas) |
| POST | `/quiz/:cursoId/:n` | `{ respuestas: number[] }` → `{ correctas, total, aprobado, detalle: [{ correcta, explicacion }] }` |
| GET | `/foro?cursoId=` | `Hilo[]` (sin ocultos) |
| POST | `/foro` | `{ titulo, texto, cursoId? }` → Hilo |
| GET | `/foro/:id` | `{ hilo, respuestas }` |
| POST | `/foro/:id/respuestas` | `{ texto }` → Respuesta |
| POST | `/foro/:id/util` | → `{ util }` (una vez por usuario) |
| POST | `/eventos/:id/reserva` | → `{ reservado: boolean }` (alterna) |
| GET | `/encuestas/pendientes` | `{ pendientes: Encuesta[] }` · entrevista inicial, fin de curso y pulso a 21 días |
| POST | `/encuestas/:clave/responder` | `{ respuestas }` → registra una sola respuesta versionada |
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
| GET | `/admin/encuestas/resumen` | Totales, distribuciones, promedios y comentarios anónimos; nunca UID ni correo |
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
