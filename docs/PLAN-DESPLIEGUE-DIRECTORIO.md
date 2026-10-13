# Plan de despliegue del Directorio profesional (#4)

> Estado: **plan local, revisable.** Ningún paso de este documento se ha ejecutado contra producción.
> El Directorio está implementado y probado **solo en local**; el pendiente #4 del relevo sigue abierto.
> Última revisión: 2026-10-13.

## ⚠️ Riesgo crítico — leer antes de cualquier acción

**Desplegar `api/firestore.rules` o `api/storage.rules` tal cual REEMPLAZA todas las reglas del proyecto `club-odonteck` y dejaría sin acceso al club viejo (`vip-panel.html`).**

Las reglas del repo **solo** contienen los bloques `v2_*` / `materiales/` / `directorio/`; las reglas vigentes del club viejo **no están en este repositorio**. Un `firebase deploy --only firestore:rules` sobrescribe el conjunto completo.

- Cabecera de advertencia: `api/firestore.rules:3-20` (líneas 10-13: "REEMPLAZA todas las reglas del proyecto").
- Bloques del Directorio que deben fusionarse: `api/firestore.rules:59-62` (las 4 colecciones `v2_directorio_*`, todas `allow read, write: if false`).
- Storage: `api/storage.rules:3-10` (advertencia) y `api/storage.rules:28-31` (`directorio/perfiles/{uid}/` → lectura pública, escritura solo por URL firmada de la API).

**Obligatorio:** descargar las reglas vigentes de la consola, **fusionar** los bloques nuevos dentro de ellas, y solo entonces desplegar. Nunca desplegar el archivo del repo directamente.

## Mapa de recursos (archivos reales)

| Recurso | Archivo | Estado |
|---|---|---|
| Reglas Firestore `v2_directorio_*` | `api/firestore.rules:59-62` | Escritas, no desplegadas |
| Reglas Storage fotos | `api/storage.rules:28-31` | Escritas, no desplegadas |
| Índices compuestos (8) | `api/firestore.indexes.json` | Escritos, no desplegados |
| Endpoints de miembro | `api/src/routes/directorio.js` (montado en `api/src/app.js:86`) | En `main`, probado local |
| Moderación admin | `api/src/routes/admin.js:392-444` (montado en `app.js:87`) | En `main`, probado local |
| Colecciones | `api/src/datos.js:27-30` | — |
| CI | `.github/workflows/api.yml` (`npm ci && npm test`, Node 22) | Activo en push a `api/**` |
| Smoke del Directorio | `api/scripts/smoke-directorio.mjs` | Local, **no ejecutado** |
| Checklist de cutover general | `api/README.md:132-149`, `docs/CUTOVER-SEGURO.md` | Referencia |
| Plan del Directorio | `docs/PLAN-DIRECTORIO-EVALUACIONES.md:5-34` | Referencia |
| Contrato del Directorio | `docs/contrato.md:89-98, 195-204, 228-229` | Referencia |

**Proyecto Firebase real: `club-odonteck`** (`api/.env.example:5-6`, `api/src/server.js:32-33`, `api/storage.rules:8`). **No existe `firebase.json` ni `.firebaserc` en el repo**; `api/firebase.emuladores.json` tiene nombre no estándar **a propósito** para que un `firebase deploy` desde `api/` no lo tome (`api/README.md:102-103`).

### Endpoints (autorización)

Miembro autenticado basta para: `GET /directorio`, `PUT/DELETE /directorio/perfil`, foto (`POST /directorio/perfil/foto/subida`, `DELETE /directorio/perfil/foto`), `POST/PATCH /directorio/conexiones`, `POST /directorio/reportes`.
**VIP** solo para `POST /directorio/oportunidades` (`directorio.js:243`). **Admin** (claim `admin:true`) para `PATCH /directorio/oportunidades/:id` de terceros (`directorio.js:275`) y toda la moderación `/admin/directorio/*` (`admin.js:392-444`).

## Fases

### Fase 0 — Preparación LOCAL (sin tocar producción)
| Paso | Acción/comando | Respaldo |
|---|---|---|
| 0.1 | `cd api && npm run test:rules` (PASS 3/3 el 2026-10-12) | `api/package.json` |
| 0.2 | Inspección solo-lectura: `railway deployment list --service api --limit 3` y `wrangler pages deployment list --project-name odonteck-club` | `docs/CONTEXTO-MAESTRO.md:432-437` |
| 0.3 | **Descargar y guardar** las reglas Firestore y Storage **vigentes** de `club-odonteck` (snapshot de rollback) | `api/README.md:100-101` |

### Fase 1 — Fusión y despliegue de reglas + índices (PRODUCCIÓN · autorización explícita)
| Paso | Acción | Respaldo |
|---|---|---|
| 1.1 | Fusionar `match /v2_directorio_*` (`firestore.rules:59-62`) y `match /directorio/perfiles/{uid}/` (`storage.rules:28-31`) **dentro** de las reglas vigentes descargadas en 0.3 | `firestore.rules:14-17` |
| 1.2 | Probar la fusión con emulador (`npm run test:rules`) **y** con el panel viejo (`vip-panel.html`) | `firestore.rules:17`, `README.md:134-135` |
| 1.3 | Desplegar reglas fusionadas + índices a `club-odonteck` (requiere un `firebase.json` real apuntando a los archivos fusionados, o hacerlo desde consola): `firebase deploy --only firestore:rules,firestore:indexes,storage --project club-odonteck` | `README.md:134`, `firestore.indexes.json` |

### Fase 2 — CORS del bucket + Storage (PRODUCCIÓN · autorización explícita)
| Paso | Acción | Respaldo |
|---|---|---|
| 2.1 | Configurar CORS del bucket `club-odonteck.firebasestorage.app` para permitir `PUT` firmado desde el dominio del club (subida WebP) | `README.md:136`, `directorio.js:220-228` |
| 2.2 | Confirmar que el bucket existe (hoy no habilitado, `CONTEXTO-MAESTRO.md:186`; `CUTOVER-SEGURO.md:29`). Si falta, `npm run storage:ensure`. Sin bucket, los endpoints de foto responden `503 no_configurado` pero el resto del Directorio opera | `directorio.js:82,221` |

### Fase 3 — Runtime API (Railway)
**No se necesita config nueva.** El Directorio no usa ninguna `process.env` propia; reutiliza `FIREBASE_SERVICE_ACCOUNT` y `FIREBASE_STORAGE_BUCKET` (`api/src/server.js:20,41,55`), ambas ya en `api/.env.example` y presentes en el servicio `odonteck-club-v2/api`. El código ya está en `main` y Railway sirve del repo → el endpoint ya está desplegado; falta habilitar reglas/índices/CORS (Fases 1-2), no redeploy de API.

### Fase 4 — Smoke autenticado post-deploy (PRODUCCIÓN)
Ejecutar `api/scripts/smoke-directorio.mjs` contra el dominio real (idealmente staging primero, `CUTOVER-SEGURO.md:33`). Cubre, con cuentas efímeras:
- **Miembro:** crear/ver perfil sin exponer contacto ajeno; foto WebP firmada (si Storage está habilitado); conexión → aceptación → contacto visible **solo tras aceptar**; anti-spam (11.ª/24h → 429) e idempotencia (reenvío → 409); `DELETE` perfil con cascada.
- **VIP:** publicar oportunidad (exige VIP; miembro → 403); 4.ª activa → `limite_oportunidades`.
- **Admin** (claim `admin:true` con `node scripts/set-admin.mjs <email>`, `README.md:138`): reporte de miembro → bandeja `/admin/directorio/reportes` (sin exponer `reportanteUid`) → `ocultar` perfil / `cerrar` oportunidad.

Config por entorno: `API_URL`, `FIREBASE_WEB_API_KEY`, `FIREBASE_SERVICE_ACCOUNT` (patrón de `api/scripts/smoke-v2.mjs`). **No se puede probar sin credenciales reales** del proyecto `club-odonteck` y un dominio API desplegado.

### Fase 5 — Verificación de índices y apertura gradual
Confirmar en consola que los 8 índices quedan `Enabled`. El código tiene fallback sin índice (`directorio.js:33-40`, `admin.js:397-405`) que pagina en memoria (degradado), así que no romperá mientras se construyen, pero **no abrir masivamente** hasta que estén activos y el smoke pase verde.

## LOCAL vs PRODUCCIÓN

| Ya resuelto (LOCAL / en código) | Falta en PRODUCCIÓN |
|---|---|
| Endpoints en `main`, Railway los sirve | Fusionar + desplegar reglas Firestore/Storage |
| Índices definidos en `firestore.indexes.json` | Desplegar índices y verificar `Enabled` |
| Reglas escritas (`v2_directorio_*`) | CORS del bucket + bucket Storage para fotos |
| `test:rules` PASS 3/3; suite `api/test/directorio.test.js` | Smoke autenticado miembro/VIP/admin contra dominio real |

## Huecos / incógnitas

1. **No hay `firebase.json`/`.firebaserc`** en el repo → el comando de deploy de reglas/índices no está parametrizado; crear config temporal o usar consola.
2. **No existía smoke de Directorio** → se añade `api/scripts/smoke-directorio.mjs` (no ejecutado).
3. **Reglas vigentes del club viejo no están en el repo** → descargar de consola antes de fusionar (Fase 0.3).
4. **Estado real del bucket Storage** de `club-odonteck`: aún no habilitado (`CONTEXTO-MAESTRO.md:186`, `CUTOVER-SEGURO.md:29`); sin él, las fotos quedan en 503 y el resto opera.
5. **CORS actual del bucket**: no verificable desde el repo.
6. **Matiz de cutover (`CUTOVER-SEGURO.md`):** el club viejo (`vip-panel.html`, `vip-auth.html`, webhook/portal antiguos) permanece como puente de compatibilidad; no se retira hasta conciliar el webhook v2 (fuera del alcance del Directorio). Publicar primero en staging, vigilar 24 h, y no modificar la web pública anterior hasta terminar las pruebas de aceptación (`CUTOVER-SEGURO.md:11,33-37`).

## Escalera de autorizaciones (cada una por separado, en orden)

1. **Descargar** reglas vigentes de la consola de `club-odonteck`.
2. **Desplegar** reglas fusionadas + índices (Fase 1.3) — toca producción; riesgo de romper el club viejo si la fusión es incorrecta.
3. **Configurar** CORS/Storage del bucket (Fase 2).
4. **Otorgar** claim admin a cuentas de prueba (`set-admin.mjs`) para el smoke (Fase 4).
5. **Abrir** el Directorio masivamente — solo tras smoke verde e índices `Enabled`.

## Rollback

Re-desplegar el snapshot de reglas vigentes descargado en la **Fase 0.3** restaura el estado del club viejo. El código de la API no necesita rollback: el Directorio convive inerte mientras el cliente no tenga acceso (`firestore.rules:59-62` niega todo acceso directo; sin índices/CORS la feature no se expone). Esto cumple la exigencia del relevo de "rollback documentado antes del cambio definitivo" (`CONTEXTO-MAESTRO.md:454`). Reversión de cutover general: restaurar únicamente enlaces/redirects anteriores; los datos no se migran destructivamente (`CUTOVER-SEGURO.md:38`).

## Nota honesta

Todo lo validado hasta hoy es **local** (`test:rules` con emuladores, suite de la API). **Producción sigue abierta**: este plan es la ruta para cerrar el pendiente #4 del relevo, no evidencia de que ya esté desplegado.
