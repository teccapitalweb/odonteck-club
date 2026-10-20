# Incidente de compra y retorno de Stripe · 2026-10-20

## Resumen ejecutivo

Se investigó por qué al intentar comprar una membresía en producción el usuario terminaba en una pantalla que parecía la landing y por qué el retorno del pago podía ser incorrecto. Hay dos fallas de navegación confirmadas en el código y en la web pública:

1. El bundle de producción redirige el botón de plan a `https://www.odonteckconsulting.com/vip-auth.html?tab=register` en lugar de crear una sesión de Checkout.
2. Esa URL antigua responde `200`, pero GitHub Pages sirve el cascarón de la SPA del Club, no un formulario VIP independiente. Como el path y `?tab=register` no son rutas hash, el router de OdonTeck lee `#/` y abre el inicio/landing del Club. Esto explica la ida a la landing.
3. El Checkout nuevo, tanto en el backend actual como en la rama del PR #21, devuelve sus URLs de éxito, cancelación y portal a `/#/cuenta`; `/cuenta` no está registrada en el router. Si se llega a Checkout por otra vía, el retorno puede mostrar “Página no encontrada”.

No se inició sesión de pago, no se hicieron cargos, no se usó una cuenta de cliente y no se modificó configuración de producción.

## Evidencia comprobada

### Despliegues y archivos públicos

- El frontend público respondió `HTTP 200`; el bundle servido fue `/assets/club-dzgDcfMY.js`.
- La ejecución de GitHub Actions `39331567580` terminó `success` y corresponde al merge de PR #20, commit `0b2c4c25dbca68d64ceb69c9a4ed932b4aa59f66`.
- La URL `https://www.odonteckconsulting.com/vip-auth.html?tab=register` respondió `HTTP 200`, pero devolvió un HTML de 1,651 bytes con el mismo cascarón/título y los mismos assets de la SPA; no una página de alta VIP distinta.
- La API pública `/health` respondió `200 {"ok":true}`.
- Railway `odonteck-club-v2` / `api` tiene un despliegue `SUCCESS` actual de `main`, también en commit `0b2c4c25dbca68d64ceb69c9a4ed932b4aa59f66` (deployment `113b194e-7d46-4e1d-b570-8a858ba079ac`, creado el 2026-10-20 00:37 UTC).
- El PR #21 (`b3fd63c66d27ebd2199131a21c6e55b55217da0a`) sigue abierto y no forma parte de esos despliegues.

### Botón «Empezar ahora» en el bundle público

El JavaScript minificado servido en producción contiene esta rama equivalente:

```js
if (Datos.modo === 'api') {
  location.href = 'https://www.odonteckconsulting.com/vip-auth.html?tab=register';
} else if (Datos.modo === 'api') {
  // POST /stripe/checkout
}
```

La segunda condición es inalcanzable cuando la primera se cumple. En consecuencia, en modo API el botón no pide `POST /stripe/checkout`; va al alias antiguo. El HTTP `200` de ese alias es engañoso: la URL no es una ruta funcional de registro dentro de la SPA.

### URLs de regreso del checkout

En `api/src/routes/stripe.js`, la sesión nueva usa:

- éxito: `${APP_URL}/#/cuenta?pago=exito&session_id=...`
- cancelación: `${APP_URL}/#/cuenta?pago=cancelado`
- regreso desde el portal: `${APP_URL}/#/cuenta`

`src/main.ts` registra `/perfil` y `/suscripcion`, pero no `/cuenta`; el router de `src/core/router.ts` presenta “Página no encontrada” al recibir una ruta desconocida. El problema está en la URL de retorno, no en el estado HTTP del sitio.

## Estado de Stripe en Railway: qué se sabe y qué no

- El inventario de Railway muestra los nombres `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_MENSUAL`, `STRIPE_PRICE_ANUAL` y `APP_URL` en el servicio de producción.
- Railway entregó sólo nombres de variables (`valuesRedacted: true`); por privacidad no se leyeron, imprimieron ni copiaron valores. La existencia del nombre `STRIPE_WEBHOOK_SECRET` no demuestra que su valor sea no vacío, vigente o correspondiente al endpoint activo.
- El PR #21 afirma en su descripción que Railway ya tiene claves y webhook. Es una afirmación del PR, no una prueba del valor, del endpoint webhook o de un pago confirmado.
- La ruta API `POST /stripe/checkout` exige un `stripeWebhookSecret` no vacío antes de crear la sesión. Si está vacío, responde `503 no_configurado`. No se hizo un Checkout autenticado para evitar abrir un pago real.
- Por lo tanto, todavía no está confirmado si el Checkout directo crearía sesión en producción. Verificarlo con cuenta Stripe de prueba y credenciales de prueba, nunca con un intento que pueda cobrar.

## Diagnóstico: no confundir los dos momentos

**Antes de pagar:** producción manda a `vip-auth.html?tab=register`; esa ruta responde con la SPA y el usuario vuelve al inicio/landing. Es la causa confirmada de la navegación rara al pulsar el plan.

**Después de pagar o cancelar por Checkout v2:** el backend redirige a `/#/cuenta`, ruta inexistente. Es un defecto de retorno confirmado por inspección de código, pero no se probó con un pago real ni se afirma que sea lo que provocó el caso observado por el usuario.

## Corrección requerida antes de fusionar PR #21

1. Elegir un único flujo de compra seguro. Si Checkout v2 aún no está habilitado, conservar explícitamente la ruta heredada funcional; no redirigir a `vip-auth.html` mientras el archivo no exista en el despliegue de Pages. Si se usa v2, llamar a `/stripe/checkout`, manejar errores `401/409/503` y dar un fallback visible que no pierda el plan seleccionado.
2. Corregir éxito, cancelación y `return_url` del portal a una ruta registrada (por ejemplo `/#/suscripcion`), y añadir estados de retorno explícitos para éxito, cancelado y pago todavía en confirmación.
3. El parámetro `session_id` del navegador no debe otorgar VIP ni puntos. La fuente de verdad es la API después del webhook firmado; al volver de Stripe, consultar `/me` y mostrar “confirmando pago” si el webhook aún no actualiza la membresía.
4. Añadir pruebas de contrato/ruta que comprueben que cada URL configurada existe en el router y pruebas de integración que cubran checkout sin webhook (`503` sin sesión), checkout válido, cancelación y webhook. Probar una cuenta nueva gratis, una VIP heredada y un usuario con suscripción activa en Stripe Test Mode.
5. Confirmar el estado de `STRIPE_WEBHOOK_SECRET` sin revelar el valor: comprobar que no esté vacío, verificar en Stripe que el endpoint apunta al API correcto y que escucha los eventos requeridos, luego completar un ciclo de prueba y conciliar `/me`/puntos. No cambiar variables, webhook ni activar live mode como parte de este diagnóstico.
6. Hasta completar eso, no fusionar PR #21 ni publicar un cambio de checkout; el PR por sí solo no corrige la URL inexistente de regreso.

## Corrección local aplicada · 2026-10-20

En el worktree `odonteck-club-wt-herramientas`, rama `feat/juegos-cierre-clase` (cambios todavía sin publicar), se aplicó:

- éxito, cancelación y regreso del portal apuntan a la ruta registrada `/#/suscripcion`;
- la página muestra estados separados de pago confirmado/pendiente y cancelación; la sesión de Checkout no se considera prueba de pago;
- el miembro puede volver a consultar `/me` para reflejar una activación que llegó después del retorno;
- el webhook procesa `checkout.session.async_payment_succeeded`, recupera la suscripción actual y otorga puntos sólo si el estado ya es activo/trialing. No se otorgan beneficios por `payment_status: unpaid`.
- pruebas API verifican URLs de retorno y el evento diferido.

Verificación local posterior: `npm run build` pasó; `npm run check --prefix api` pasó; `npm test --prefix api` pasó (176 pasaron, 0 fallos, 1 omitida por requerir emulador). `git diff --check` pasó. La raíz no define `npm test`; el comando devolvió “Missing script”, no es un test fallido. El build mantiene un aviso existente por un chunk >500 kB.

Esto corrige el código de la rama, no el sitio/API en vivo. Producción continúa en PR #20 hasta que el usuario autorice el ciclo de publicación. Sigue pendiente confirmar mediante Test Mode que el webhook real de Stripe está configurado y completar un Checkout end-to-end; no se inspeccionaron secretos ni se creó una sesión de pago.

## Archivos y rutas de referencia

- Bundle público: `https://www.odonteckconsulting.com/assets/club-dzgDcfMY.js`.
- Botón de planes: `src/main.ts`, manejador `[data-cambiar-plan]`.
- Retornos del backend: `api/src/routes/stripe.js`, creación de Checkout y portal.
- Rutas aceptadas: `src/main.ts` (`/perfil`, `/suscripcion`) y `src/core/router.ts`.
- Documentación de continuidad: `docs/RELEVO-CLAUDE.md` y `docs/CONTEXTO-MAESTRO.md`.

## Límites de la verificación

Esta auditoría confirmó los destinos y el comportamiento de la SPA desde archivos públicos, revisó el código de la rama desplegada y leyó sólo nombres de variables Railway. No incluyó sesión de usuario, acceso a Stripe Dashboard, pago de prueba, webhook de prueba, cambio de configuración, modificación de datos, merge ni deploy. Hace falta completar pruebas autenticadas en Stripe Test Mode antes de dar el flujo por corregido.
