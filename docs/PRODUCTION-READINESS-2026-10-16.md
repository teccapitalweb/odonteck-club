# Preparación para producción · 16 de octubre de 2026

## Dictamen

**PUBLICADO Y VERIFICADO a nivel de infraestructura; queda pendiente el smoke autenticado con cuentas reales.**

El corte incorpora la elección obligatoria de un curso gratuito y la Brújula profesional opcional. Se fusionó mediante el PR `#18` en `13797ef` y conserva membresías heredadas, acceso VIP/admin y usuarios migrados. No incluye los activos candidatos del Programa 01 ni cambia reglas de Firebase.

## Identidad del corte

- Repositorio: `teccapitalweb/odonteck-club`.
- Rama publicada: `feat/brujula-profesional` mediante PR `#18`.
- Merge público verificado: `origin/main` en `13797ef`.
- Implementación principal: `767514c`.
- Corrección del dominio canónico: `f53ada8`.
- El PR `#18` absorbió la serie completa y sucede al PR parcial `#16`.

## Puertas de calidad

| Puerta | Resultado |
|---|---|
| Build frontend con `VITE_API_URL=https://api-production-db314.up.railway.app` | PASS |
| API `npm run check` | PASS |
| API `npm test` | PASS: 176 totales, 175 aprobadas, 0 fallos, 1 omitida |
| Pipeline de contenido | PASS: 67/67 |
| Alexia/guía | PASS: 66/66 |
| `git diff --check` | PASS |
| Dominio público y landing | PASS: HTTP 200 |
| API `/health` | PASS: HTTP 200 |
| Preflight CORS desde `https://www.odonteckconsulting.com` | PASS: HTTP 204 |

La prueba omitida corresponde a reglas Firestore/Storage y se ejecuta con `npm run test:rules`. Este corte no modifica `firestore.rules` ni `storage.rules`; curso gratis se escribe sólo desde el servidor y Brújula reutiliza las colecciones de encuestas existentes.

## Infraestructura observada

### GitHub Pages

- Pages está activo con `build_type: workflow`, dominio `www.odonteckconsulting.com` y HTTPS forzado.
- La variable de Actions `VITE_API_URL` existe y apunta al API productivo.
- El workflow `Pages` se ejecuta al hacer push a `main`.
- Ejecución pública verificada: `38976464505`, exitosa, commit `13797ef`; deployment `7130928143` en estado `success` para `https://www.odonteckconsulting.com/`.
- `main` no tiene protección de rama; evitar cualquier push directo.

### Railway

- Proyecto `odonteck-club-v2`, servicio `api`, ambiente `production`.
- Fuente: `teccapitalweb/odonteck-club`, rama `main`, directorio raíz `/api`.
- Despliegue verificado: `28536ee0-32f0-475f-980a-4278205c4a64`, `SUCCESS`, commit `13797ef`.
- Sin cambios staged ni operaciones pendientes.
- Variables esenciales de Firebase, Bunny, Stripe, `APP_URL` y `ALLOWED_ORIGINS` están definidas por nombre.
- Falta `STRIPE_WEBHOOK_SECRET`; por diseño el checkout v2 responde 503 y permanece desactivado. No crear ese secreto ni cambiar el webhook anterior sin una prueba Stripe separada.

## Contenido excluido deliberadamente

Estos archivos permanecen sin seguimiento y no forman parte del corte:

```text
docs/PROGRAMA-01-PAQUETE-VISUAL.md
public/cursos/diagnostico-en-ortodoncia-para-odontologos-generales/
```

Son candidatos visuales pendientes de revisión clínica, optimización y conexión consciente. No usar `git add .`.

## Resultado de la publicación

1. Rama publicada y PR `#18` creado sin incluir los activos candidatos del Programa 01.
2. Dos checks del PR pasaron y GitHub lo marcó fusionable.
3. Merge autorizado y realizado en `13797ef`.
4. Workflow API `38976464617` y Pages `38976464505`: `success`.
5. Railway `28536ee0-32f0-475f-980a-4278205c4a64`: `SUCCESS`, mismo commit `13797ef`.
6. Smoke público: dominio y landing HTTP 200; API `/health` HTTP 200; catálogo público HTTP 200; CORS desde el dominio canónico HTTP 204.
7. Pendiente: smoke autenticado con una cuenta gratis nueva, una VIP/heredada y una admin real para selección, entrevista, Brújula, curso sugerido, reproducción, progreso, quiz, materiales, recompensas y panel admin.
8. Stripe v2 permanece desactivado hasta disponer del secreto y completar una prueba firmada en modo test.

## Rollback

- Frontend: revertir el merge o volver a publicar el artefacto del corte `10e56bd`.
- API: Railway permite rollback al despliegue `ddbca91f-864b-4e9c-80b4-3301bb161009`.
- No borrar `v2_curso_gratis` ni respuestas de Brújula. El código nuevo es compatible con miembros existentes y las escrituras son aditivas.
- Si falla autenticación, reconocimiento VIP, acceso a video, progreso o descarga, hacer rollback antes de continuar el smoke.

## Criterio final

El código quedó publicado con el mismo SHA en GitHub Pages y Railway, y los smokes públicos pasaron. No declarar completada la validación funcional de cuentas hasta ejecutar los smokes autenticados pendientes; un CI verde y `/health` no sustituyen esas pruebas.
