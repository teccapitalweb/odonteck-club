# Preparación para producción · 10 de octubre de 2026

## Dictamen

**NO-GO para publicar todo el árbol local sin controles adicionales.**

El frontend y la API están técnicamente sanos en pruebas automatizadas, el perímetro público actual responde correctamente y los borradores clínicos permanecen ocultos en producción. Sin embargo, todavía no es seguro desplegar el conjunto completo porque faltan validaciones externas que no pueden sustituirse con pruebas locales: aprobación clínica de contenidos, smoke autenticado con cuentas gratis/VIP/admin, prueba del webhook nuevo de Stripe, prueba de reglas en emulador y aprobación de los despliegues pendientes de Railway.

Sí es razonable preparar un corte técnico del código, siempre que se excluyan los activos locales no autorizados y se mantengan los quizzes/fichas nuevos como borradores.

## Puertas de calidad ejecutadas

| Puerta | Resultado | Evidencia |
|---|---|---|
| Build frontend con `VITE_API_URL` productiva | PASS | TypeScript y Vite completaron; chunks principales menores de 500 kB |
| API `npm run check` | PASS | Sintaxis de servidor y aplicación válida |
| API `npm test` | PASS | 130 pruebas: 129 aprobadas, 0 fallos, 1 omitida por emuladores |
| Pipeline de contenido | PASS | 67/67 pruebas |
| Alexia/guía | PASS | 66 comprobaciones |
| Piloto Ortodoncia | PASS técnico | 5 clases, 30 conceptos, 25 actividades y 5 tipos por clase |
| Auditoría npm frontend | PASS | 0 vulnerabilidades |
| Auditoría npm API | PASS | 0 vulnerabilidades después de fijar `@grpc/grpc-js` en `^1.14.6` |
| Secretos de alto riesgo en archivos versionados | PASS | Sin llaves privadas, secretos Stripe ni service accounts detectados |
| Bundle público | PASS | 0 PDF y 0 directorios `libros` en `dist` |
| Revisión visual local | PASS parcial | Clase en escritorio/móvil y Directorio en escritorio, sin errores de consola ni overflow horizontal |
| Revisión visual pública | PASS pública | Login en escritorio/móvil, sin errores de consola ni overflow horizontal |

## Producción observada

- `https://www.odonteckconsulting.com/` responde HTTP 200 mediante Cloudflare.
- `https://www.odonteckconsulting.com/landing/` responde HTTP 200.
- `https://api-production-db314.up.railway.app/health` responde HTTP 200 con `{"ok":true}`.
- `GET /landing/catalogo` responde HTTP 200 y declara `fuente: "api"`.
- El preflight desde `https://www.odonteckconsulting.com` responde 204 y permite `Authorization, Content-Type`.
- `GET /me` sin token responde 401, como debe hacerlo.
- Los hashes de assets públicos no coinciden con el build local; por tanto, los cambios de este árbol todavía no están en producción.
- Railway mantiene en línea el despliegue exitoso `6c9283b5-0d0d-4c6f-9578-85cded5e1b87` del 9 de octubre de 2026, pero los cinco despliegues posteriores consultados están en `NEEDS_APPROVAL`.
- No fue posible consultar la lista de despliegues de Cloudflare por CLI porque esta sesión no tiene `CLOUDFLARE_API_TOKEN`.
- GitHub CLI conserva tres cuentas sin token válido; no se puede confirmar el commit remoto, crear PR ni hacer push hasta reautenticar la cuenta autorizada.

## Bloqueos antes de un GO completo

### 1. Contenido clínico

- La auditoría cuenta 77 clases con notas, 64 quizzes aprobados, 0 fichas PDF aprobadas y 0 paquetes completos.
- Las cinco evaluaciones y fichas del piloto de Ortodoncia siguen correctamente como `borrador`.
- Un odontólogo/ortodoncista identificado debe revisar fidelidad, respuestas, cifras, recomendaciones, referencias y texto de cada ficha antes de cambiar el estado a `aprobado`.
- Hasta entonces se puede desplegar la infraestructura, pero no publicar estos contenidos como material clínico aprobado.

### 2. Reglas de Firebase

`npm run test:rules` se intentó con Java 24 y Java 21. En ambos casos el emulador de Firestore terminó antes de ejecutar las aserciones con `Unable to establish loopback connection`. Esto es una limitación confirmada del host actual, no una prueba aprobada ni un fallo demostrado de las reglas.

Repetir en CI Linux o en un host donde los emuladores puedan abrir loopback y exigir PASS antes del corte.

### 3. Autenticación y perfiles reales

Falta un smoke contra producción con:

1. cuenta gratuita;
2. miembro heredado/VIP vigente;
3. administrador con custom claim `admin: true`.

Debe cubrir login, `/me`, catálogo, video firmado, progreso, evaluación, certificado, recompensa, material gratuito, material VIP/canjeado, Directorio y operaciones administrativas no destructivas.

### 4. Stripe

- La lógica automatizada pasa, incluida idempotencia y preservación de miembros heredados.
- El checkout v2 debe permanecer desactivado mientras no exista y se valide `STRIPE_WEBHOOK_SECRET` en Railway.
- Antes de activarlo: probar checkout en modo test, evento firmado, escritura única en `v2_suscripciones`, acceso VIP y portal del cliente.
- No alterar el webhook anterior hasta terminar ese smoke y documentar rollback.

### 5. Despliegues y credenciales operativas

- Reautenticar GitHub CLI con una cuenta que tenga acceso a `teccapitalweb/odonteck-club`.
- Revisar y versionar conscientemente los cambios; no usar `git add .`.
- Excluir `public/libros/`, credenciales, transcripciones, `output/` y activos sin licencia.
- Aprobar únicamente el despliegue Railway que corresponda al commit elegido; los cinco pendientes actuales no deben aprobarse a ciegas.
- Verificar el despliegue Cloudflare del mismo commit y después repetir smoke público/API.

## Orden de corte recomendado

1. Obtener firma clínica o conservar todos los paquetes nuevos como borrador.
2. Ejecutar reglas Firebase en CI/host compatible hasta PASS.
3. Reautenticar GitHub y revisar el diff archivo por archivo.
4. Crear commit/PR del corte técnico, sin `public/libros/` ni `output/`.
5. Esperar CI verde y registrar el SHA aprobado.
6. Desplegar API de ese SHA; no aprobar builds anteriores o ambiguos.
7. Ejecutar smoke API y cuentas gratis/VIP/admin.
8. Desplegar frontend del mismo SHA en Cloudflare.
9. Verificar dominio, assets, CORS, Auth, PWA, escritorio y móvil.
10. Activar Stripe v2 sólo después de la prueba firmada; si falla, mantener el flujo anterior.

## Criterio de rollback

- Conservar el despliegue exitoso anterior de Railway y el despliegue Cloudflare anterior hasta completar el smoke.
- Si falla autenticación, membresía heredada, firma de video, progreso, descarga o webhook, volver inmediatamente a esos despliegues y no migrar datos.
- No eliminar colecciones ni modificar `miembros`; las nuevas escrituras permanecen en `v2_*`.

## Conclusión operativa

El código está **preparado para revisión de corte**, no para un despliegue ciego. El GO final depende de cuatro evidencias todavía ausentes: reglas PASS, aprobación clínica, smoke autenticado de tres roles y webhook Stripe testado. Mientras tanto, la producción actual sigue operativa y los borradores no deben exponerse.
