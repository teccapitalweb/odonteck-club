# OdonTeck Club · API

Backend del club nuevo (Express 4 en Railway). Implementa `docs/contrato.md`, que es la fuente de verdad:
si el contrato cambia, cambia aquí también.

- **Convive con el club viejo** en el proyecto Firebase `club-odonteck`: todo lo nuevo va en colecciones `v2_*`.
  `miembros/{uid}` **solo se lee** para saber quién es VIP.
- El navegador no escribe datos de valor: todo pasa por esta API con Firebase ID token verificado
  (`verifyIdToken(token, true)`, que también rechaza tokens revocados).
- Admin = custom claim `admin: true` (ver "Poner un admin").

## Estructura

```
api/
  src/
    app.js            crea la app a partir de dependencias inyectadas { db, auth, storage, stripe, bunny, now, config }
    server.js         arranque real: lee el entorno y crea las dependencias de Firebase/Stripe
    datos.js          nombres de colecciones y lecturas comunes (membresía, perfil, config)
    lib/              lógica pura: acceso (esVip, desbloqueo), firma Bunny, folio, validaciones, semilla
    middleware/       auth (token + admin) y manejo de errores { error, mensaje }
    routes/           publicas, miembro, admin, stripe
  scripts/            set-admin.mjs, seed-v2.mjs
  test/               node --test (fakes en test/fakes/: Firestore en memoria, Auth, Storage, Stripe)
  firestore.rules     reglas SOLO de v2_* (NO desplegar tal cual, ver abajo)
  storage.rules       reglas SOLO de materiales/ (NO desplegar tal cual)
```

## Correr en local

Requiere Node 22.

```bash
cd api
npm install
npm test              # unitarias + integración de rutas con dobles; no necesita credenciales
npm run test:rules    # reglas contra el emulador de Firebase (necesita Java; usa el proyecto demo-odonteck)
cp .env.example .env  # y llena las variables
npm run dev           # arranca con --watch y carga .env si existe
```

Sin `FIREBASE_SERVICE_ACCOUNT` el servidor se niega a arrancar. Si faltan Bunny o Stripe arranca igual y esas
rutas responden `503 no_configurado`.

## Variables de entorno

| Variable | Para qué |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT` | JSON de la cuenta de servicio de `club-odonteck`, en una línea o en base64. Obligatoria. |
| `FIREBASE_STORAGE_BUCKET` | `club-odonteck.firebasestorage.app`. Sin ella no hay descargas ni subidas de materiales. |
| `BUNNY_LIBRARY_ID` | `725453` |
| `BUNNY_TOKEN_AUTH_KEY` | Token Authentication Key de la biblioteca (no la API key). |
| `BUNNY_TOKEN_TTL_SECONDS` | Vida del embed firmado. Por defecto 300. |
| `STRIPE_SECRET_KEY` | `sk_test_...` hasta el cambio; `sk_live_...` después. |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` del endpoint `/stripe/webhook` (solo existe cuando se registre). |
| `STRIPE_PRICE_MENSUAL`, `STRIPE_PRICE_ANUAL` | IDs `price_...`. Si faltan se usan `stripePriceMensual/Anual` de `v2_config/general`. |
| `APP_URL` | URL del club; se usa para `success_url`, `cancel_url` y `return_url` (`/#/cuenta`). |
| `ALLOWED_ORIGINS` | Orígenes permitidos por CORS, separados por coma. Un origen fuera de la lista no recibe cabeceras CORS. |
| `PORT` | Railway la define sola. |

## Poner un admin

```bash
cd api
FIREBASE_SERVICE_ACCOUNT="$(cat /ruta/segura/cuenta.json)" node scripts/set-admin.mjs persona@correo.com
# para quitarlo:
FIREBASE_SERVICE_ACCOUNT="$(cat /ruta/segura/cuenta.json)" node scripts/set-admin.mjs persona@correo.com --quitar
```

La persona debe haber iniciado sesión en el club al menos una vez y, después del cambio, cerrar sesión y volver a
entrar. El script se niega a correr sin `FIREBASE_SERVICE_ACCOUNT` (no usa credenciales por defecto de la máquina).

## Sembrar cursos y materiales

```bash
node scripts/seed-v2.mjs                 # ensayo: imprime lo que haría, no se conecta a nada
FIREBASE_SERVICE_ACCOUNT=... node scripts/seed-v2.mjs --apply             # escribe los que no existan
FIREBASE_SERVICE_ACCOUNT=... node scripts/seed-v2.mjs --apply --sobrescribir
node scripts/seed-v2.mjs --solo=materiales
```

Lee `../src/data/catalogo.json` y `../src/data/materiales.json`, convierte `duracion` → `duracionMin`, marca los
cursos como `publicado: true`, y cambia la `url` pública de cada material por `archivo: materiales/<id>.pdf`.
Por defecto **no pisa** documentos existentes (para respetar ediciones hechas en el admin). Los PDF se suben aparte
a Storage (o desde el admin con `/admin/materiales/:id/subida`).

## Desplegar en Railway

1. Crear un servicio **nuevo** (no tocar `odonteck-production`, que sigue atendiendo al club viejo) conectado a este repo.
2. Settings → **Root Directory**: `api`. Railway toma `api/railway.json` (arranque `npm start`, healthcheck `/health`).
3. Variables: las de la tabla de arriba. `STRIPE_WEBHOOK_SECRET` puede quedar vacía hasta el cambio.
4. Generar dominio público y ponerlo como `VITE_API_URL` en el frontend.
5. Comprobar: `curl https://<dominio>/health` → `{"ok":true}`.

GitHub Actions (`.github/workflows/api.yml`) corre `npm ci` y `npm test` en Node 22 en cada push que toque `api/**`.

## Reglas de Firestore y Storage

`firestore.rules` y `storage.rules` **no se deben desplegar tal cual**: solo contienen reglas del club nuevo y
reemplazarían las del club viejo, que no están en este repo. Hay que descargar las reglas vigentes de la consola,
fusionar los bloques `v2_*` / `materiales/` y probar. `firebase.emuladores.json` existe solo para los emuladores de
`npm run test:rules` (tiene nombre distinto a propósito para que un `firebase deploy` desde `api/` no lo tome).

## Colecciones y campos añadidos al contrato

| Qué | Por qué |
|---|---|
| `v2_suscripciones/{uid}` | Donde escribe el webhook nuevo (`customerId`, `subscriptionId`, `estado`, `plan`, `periodoFin`, `cancelaAlFinal`...). Nunca en `miembros`. |
| `v2_contadores/certificados-AAAA` | Consecutivo anual del folio `ODT-AAAA-NNNNN`, asignado en transacción. |
| `v2_stripe_eventos/{eventId}` | Idempotencia del webhook (Stripe reintenta). |
| `v2_progreso.certificado` | Folio emitido para (uid, curso): hace idempotente la emisión. `/progreso` no lo devuelve. |
| `v2_foro.respuestas` | Conteo de respuestas del hilo. |

## Diferencias de forma respecto al contrato (para el frontend)

- `/catalogo` → `eventos[].reservas` es un **número** (conteo) y se agrega `reservado: boolean`; no se exponen uids
  de otros miembros. `enlace` y `config.canalWhatsApp` solo llegan a VIP (a los demás, `null` / `''`).
- `/foro` y `/foro/:id` → los hilos no traen `utilPor`; traen `marcadoUtil: boolean`.
- `POST /foro/:id/util` repetido → `409 ya_marcado_util` con `util` actual.
- `POST /quiz/...` → `detalle[].correcta` es el índice correcto; se agrega `acertada: boolean`.
- `GET /verificar/:folio` → incluye `folio`; si no existe responde `404` con `valido: false`.
- `/progreso/:cursoId/abrir` y `/video/token` exigen acceso **y** desbloqueo secuencial, igual que `vista`.
  Los quizzes exigen acceso (VIP o clase gratis) pero no desbloqueo.
- Los admins no están sujetos al desbloqueo secuencial (para revisar cursos).
- Publicar, responder, marcar útil y reservar eventos exige VIP; leer el foro solo exige sesión.
- `PATCH /admin/foro/:id` acepta `respuestaId` opcional para moderar una respuesta.
- `PATCH /admin/quizzes/:id` crea el quiz si no existe y se envían `preguntas`.
- `POST /admin/materiales/:id/subida` devuelve además `publicUrl` cuando `tipo: 'portada'`.
- Errores con información extra: `clase_bloqueada` incluye `requiere` (la clase que falta ver).

## Cambio definitivo (checklist)

1. Obtener y fusionar las reglas vigentes de Firestore y Storage con `firestore.rules` / `storage.rules`; probar con
   el emulador y con el panel viejo; desplegar.
2. Configurar CORS del bucket para permitir `PUT` desde el dominio del club (subidas firmadas del admin).
3. Subir los PDF a `materiales/<id>.pdf` y quitar `public/materiales/*.pdf` del frontend (hoy son públicos).
4. Poner el claim admin a las personas del equipo con `scripts/set-admin.mjs`.
5. Sembrar `v2_cursos` y `v2_materiales` (`seed-v2.mjs --apply`) y revisar/aprobar quizzes en el admin.
6. En Stripe (modo live): crear precios, registrar el endpoint `https://<api>/stripe/webhook` con los eventos
   `checkout.session.completed` y `customer.subscription.created|updated|deleted`, y poner `STRIPE_WEBHOOK_SECRET`.
7. Decidir cómo `v2_suscripciones` da acceso: hoy la regla VIP del contrato **solo** mira `miembros/{uid}`,
   `v2_cortesias` y el claim admin. Opciones: (a) que el webhook nuevo escriba también `miembros/{uid}`
   (`activa`, `expiraEn`), o (b) ampliar `esVip` para leer `v2_suscripciones` (estado `active`/`trialing` y
   `periodoFin` futuro). Actualizar contrato, código y tests.
8. Dar de baja el endpoint del webhook viejo (`odonteck-production`) en Stripe cuando el nuevo esté verificado.
9. Poner `VITE_API_URL` en el frontend de producción y redirigir `vip-panel.html` al club nuevo.
10. Revocar las llaves que se hayan usado en pruebas.
