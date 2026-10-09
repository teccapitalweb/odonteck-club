# OdonTeck Club · instrucciones obligatorias para Claude

Este es el punto de entrada del repositorio definitivo de **OdonTeck Club**.

## Antes de modificar cualquier archivo

1. Lee primero [`docs/RELEVO-CLAUDE.md`](docs/RELEVO-CLAUDE.md) y después completo [`docs/CONTEXTO-MAESTRO.md`](docs/CONTEXTO-MAESTRO.md). El relevo contiene el corte operativo vigente; el contexto maestro conserva la arquitectura, las reglas comerciales, el historial y las brechas de integración.
2. Ejecuta `git status --short --branch` y conserva todo cambio local o archivo sin seguimiento que no hayas creado tú. En este repositorio existen activos y documentos locales todavía no versionados; no los borres, restaures ni sobrescribas.
3. Confirma que trabajas en `teccapitalweb/odonteck-club`, rama `main`. No uses una copia histórica como fuente de verdad.
4. Antes de tocar datos o backend, lee [`docs/contrato.md`](docs/contrato.md). Para contenidos, transcripciones o quizzes, lee [`scripts/pipeline/README.md`](scripts/pipeline/README.md).
5. Si trabajas con imágenes, revisa los documentos de prompts en `docs/` y los PDF de dirección visual ya existentes. No regeneres ni reemplaces lotes sin inventariar primero los archivos locales no versionados.

## Reglas no negociables

- OdonTeck, Visión Pecuaria y Agrotec América son productos separados. No mezcles marcas, contenido, Firebase, credenciales, colecciones, dominios ni despliegues.
- Nunca muestres, copies a documentación ni agregues a Git secretos de `.env` o `api/.env`.
- No asumas que una pantalla terminada está conectada a producción. Con `VITE_API_URL` la experiencia de miembro usa la API; sin esa variable se activa deliberadamente el demo con semillas JSON y `localStorage`. Distingue siempre ambos modos y no uses el demo como evidencia de producción.
- No escribas datos de valor directamente desde el navegador. Membresías, progreso, certificados, quizzes, comunidad y administración reales deben pasar por la API autenticada.
- Las colecciones nuevas usan el prefijo `v2_`. No escribas en colecciones heredadas ni alteres membresías reales sin una petición explícita y una auditoría previa.
- El admin real depende del custom claim de Firebase `admin: true`; nunca lo sustituyas por correos codificados en el cliente.
- Los videos de Bunny deben obtener enlaces firmados desde la API; nunca expongas la llave.
- No actives, desactives ni cambies webhooks de Stripe, reglas Firebase, DNS, Railway o producción por inferencia.
- Antes de implementar más diseño, preserva conscientemente lo ya resuelto (hidratación remota, quizzes, progreso, certificados, materiales y reglas freemium) y atiende las brechas críticas vigentes: smoke admin autenticado, webhook Stripe v2, reglas con emuladores, liga real y licencias de futuros materiales.
- El contenido odontológico requiere revisión profesional humana. No publiques automáticamente recomendaciones clínicas, respuestas de quiz o protocolos generados.

## Verificación mínima antes de entregar

Desde la raíz:

```bash
npm run build
```

Desde `api/`:

```bash
npm ci
npm run check
npm test
```

Si cambias reglas de Firebase, ejecuta además `npm run test:rules` con los emuladores. Si cambias interfaz, comprueba escritorio y móvil. Si cambias integración, prueba una cuenta gratuita, una VIP y una admin.

Actualiza `docs/RELEVO-CLAUDE.md` y `docs/CONTEXTO-MAESTRO.md` cuando cambie una regla comercial, arquitectura, integración de producción, despliegue vigente o pendiente crítico.
