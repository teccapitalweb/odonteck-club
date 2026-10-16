# Preparación para producción · 16 de octubre de 2026

## Dictamen

**GO para publicar la rama y abrir un PR; NO-GO para fusionar o desplegar sin autorización explícita.**

El corte candidato incorpora la elección obligatoria de un curso gratuito y la Brújula profesional opcional. Está basado directamente en el corte público `10e56bd` y conserva membresías heredadas, acceso VIP/admin y usuarios migrados. No incluye los activos candidatos del Programa 01 ni cambia reglas de Firebase.

## Identidad del corte

- Repositorio: `teccapitalweb/odonteck-club`.
- Rama local: `feat/brujula-profesional`.
- Base remota verificada: `origin/main` en `10e56bd`.
- Implementación principal: `767514c`.
- Corrección del dominio canónico: `f53ada8`.
- Diferencia antes de este documento: 8 commits delante de `origin/main`, 0 detrás.
- PR existente `#16`: contiene la primera parte de la serie hasta `b5d24ae`; aún no incluye Brújula ni la preparación final.

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
- Última ejecución pública verificada: `38685087891`, exitosa, commit `10e56bd`.
- `main` no tiene protección de rama; evitar cualquier push directo.

### Railway

- Proyecto `odonteck-club-v2`, servicio `api`, ambiente `production`.
- Fuente: `teccapitalweb/odonteck-club`, rama `main`, directorio raíz `/api`.
- Último despliegue: `ddbca91f-864b-4e9c-80b4-3301bb161009`, `SUCCESS`, commit `10e56bd`.
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

## Secuencia segura de publicación

1. Publicar únicamente `feat/brujula-profesional` y abrir un PR contra `main`; no empujar directamente a `main`.
2. Marcar el nuevo PR como sucesor de `#16` o fusionar primero `#16` y rebasar esta rama. No mantener dos PR que puedan aplicar dos veces la misma serie.
3. Esperar CI `API` verde y revisar el diff completo.
4. Autorizar explícitamente el merge sabiendo que dispara automáticamente Pages y Railway.
5. Confirmar que ambos despliegues usan el mismo SHA fusionado y terminan en éxito.
6. Ejecutar smoke con una cuenta gratis nueva, una VIP/heredada y una admin real.
7. Verificar selección obligatoria, entrevista, Brújula, curso sugerido, reproducción, progreso, quiz, materiales, recompensas y panel admin.
8. Mantener Stripe v2 desactivado hasta disponer del secreto y completar una prueba firmada en modo test.

## Rollback

- Frontend: revertir el merge o volver a publicar el artefacto del corte `10e56bd`.
- API: Railway permite rollback al despliegue `ddbca91f-864b-4e9c-80b4-3301bb161009`.
- No borrar `v2_curso_gratis` ni respuestas de Brújula. El código nuevo es compatible con miembros existentes y las escrituras son aditivas.
- Si falla autenticación, reconocimiento VIP, acceso a video, progreso o descarga, hacer rollback antes de continuar el smoke.

## Criterio final

El código queda listo para PR y despliegue controlado. La autorización de merge debe considerarse también autorización de despliegue automático. Un resultado local o un CI verde no sustituyen los smokes autenticados posteriores al despliegue.
