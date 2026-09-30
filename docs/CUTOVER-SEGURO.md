# Corte seguro de OdonTeck Club v2

El objetivo es sustituir la experiencia anterior sin perder cuentas, acceso pagado, cancelaciones programadas ni capacidad de volver atrás.

## Estado protegido

- Firebase Auth sigue siendo el proyecto `club-odonteck`; los usuarios no crean otra cuenta.
- `miembros` continúa siendo la autoridad heredada y se mantiene en solo lectura desde v2.
- El webhook anterior de Stripe continúa activo y actualizando `miembros` mientras el checkout nuevo esté deshabilitado.
- La API v2 acepta documentos por UID y por correo (`email_...`), regalos y los nombres históricos de vencimiento.
- La web pública anterior no se modifica hasta que las pruebas de aceptación terminen.

## Preflight obligatorio

1. Ejecutar `npm test` y exigir 0 fallos.
2. Ejecutar `npm run audit:legacy` con la cuenta de servicio real.
3. Ejecutar `npm run audit:stripe` con las credenciales reales.
4. Confirmar que toda suscripción Stripe `active` tenga un documento de miembro con acceso.
5. Ejecutar `npm run smoke:legacy` primero contra una API v2 local conectada a producción y luego contra la API desplegada.
6. Desplegar la API v2 y probar `/health`, CORS, una cuenta libre y al menos una cuenta heredada activa.
7. Confirmar que el portal de Stripe abre para una cuenta heredada sin crear otro customer.
8. Mantener el alta/pago en el portal anterior hasta configurar y verificar el webhook v2.

## Materiales

- Publicar solo los 10 recursos incluidos por `publish-owned-materials.mjs`.
- Atlas ICDAS es el único gratuito; los otros 9 son VIP.
- Los 16 libros externos quedan fuera del artefacto, Storage y Firestore.
- No intentar publicar hasta habilitar un bucket real en `club-odonteck` y configurar su nombre exacto.

## Corte y reversión

1. Publicar primero el frontend en una ruta/dominio de staging.
2. Hacer pruebas de cuenta libre, VIP heredada, cortesía, video, quiz, material, perfil y portal de pagos.
3. Guardar copia exacta de los archivos públicos anteriores.
4. Cambiar los accesos públicos al nuevo frontend, sin borrar `vip-auth.html`, `vip-panel.html` ni el backend viejo.
5. Vigilar errores de autenticación y accesos VIP durante las primeras 24 horas.
6. Para revertir, restaurar únicamente los enlaces/redirects anteriores; los datos y cobros no requieren reversión porque nunca se migran destructivamente.

## Condiciones para retirar lo anterior

El portal y webhook viejos se retiran únicamente después de que el webhook v2 haya recibido y conciliado renovaciones, cancelaciones y pagos fallidos reales durante un ciclo controlado. Hasta entonces funcionan como puente de compatibilidad.
