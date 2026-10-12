# Pipeline de contenido · OdonTeck Club

Scripts para pasar de "18 cursos / 77 videos con títulos `Clase N`" a clases con **título real, duración,
notas (resumen + conceptos con marca de tiempo) y quiz**, generados de la transcripción y **revisados por humanos
en el admin antes de publicarse**. Se apega a `docs/contrato.md` (`v2_cursos`, `v2_quizzes`, `v2_certificados`).

Tiene su propio `package.json` para no mezclar dependencias con el frontend. Node 22, ESM.

```bash
cd /c/dev/odonteck-club/scripts/pipeline
npm install
npm test          # 66 pruebas con fixtures y dobles: sin red ni credenciales
```

## Reglas comunes

- Todos los scripts tienen `--help`.
- **Dry-run por defecto**: sin `--apply` no se escribe nada (ni en disco ni en Bunny/Firestore) y no se llama a APIs con costo.
  Única excepción: `migrar-certificados.mjs` deja su reporte local en `out/reportes/` también en dry-run.
- Lo generado vive en `out/` (ignorado por git). Los scripts se pueden volver a correr: retoman lo pendiente.
- Las llaves se leen de variables de entorno y nunca se imprimen.
- La cobertura final se audita desde la raíz con `npm run audit:learning-packs`. El reporte no escribe nada y cuenta notas, quiz aprobado y PDF aprobado por cada una de las 77 clases. En CI usar `npm run audit:learning-packs -- --strict` para fallar mientras falte cualquier paquete.

## Variables de entorno

| Variable | Usada por | Notas |
|---|---|---|
| `BUNNY_API_KEY` | inventario, transcribir | API key de la biblioteca 725453 (header `AccessKey`) |
| `BUNNY_LIBRARY_ID` | inventario, transcribir | `725453` |
| `BUNNY_CDN_HOSTNAME` | descargar-vtt | Opcional, por defecto `vz-f5a76892-30a.b-cdn.net` |
| `BUNNY_CDN_TOKEN_KEY` | descargar-vtt | Solo si la Pull Zone tiene Token Authentication. **No** es `BUNNY_TOKEN_AUTH_KEY` (esa es la del embed) |
| `ANTHROPIC_API_KEY` | generar-contenido | Solo con `--apply` |
| `FIREBASE_SERVICE_ACCOUNT` | publicar, migrar-certificados | JSON en una línea o base64; debe ser del proyecto `club-odonteck` |
| `PIPELINE_OUT_DIR`, `CATALOGO_PATH` | todos | Opcionales (los usan las pruebas) |

Carga sugerida en Git Bash, solo para la sesión:

```bash
set -a; source /ruta/segura/pipeline.env; set +a
```

## Orden de ejecución

### 1. Inventario de Bunny
```bash
node bunny-inventario.mjs            # revisa el reporte
node bunny-inventario.mjs --apply    # escribe out/inventario.json
```
Cruza `src/data/catalogo.json` con `GET /library/725453/videos` (paginado): duración (`length`), título en Bunny,
`availableResolutions`, `captions` y si ya hay captions en español. Reporta clases del catálogo que **no existen en Bunny**,
videos de Bunny **fuera del catálogo** y videos que Bunny aún no marca como `Finished`.

### 2. Transcripción automática en Bunny
```bash
node bunny-transcribir.mjs                          # lista qué se enviaría
node bunny-transcribir.mjs --solo <videoId> --apply # PRIMERO uno solo, para validar
# esperar a que Bunny termine; comprobar con: node bunny-inventario.mjs
node bunny-transcribir.mjs --apply                  # el resto
```
Solo toma videos terminados y sin captions en español. Cola con concurrencia 2, pausa de 1.5 s y reintentos
exponenciales (429/5xx respetando `Retry-After`). Registra lo pedido en `out/transcripciones-solicitadas.json`.
Cuando Bunny termine, **vuelve a correr `bunny-inventario.mjs --apply`** para que el inventario marque los captions.

### 3. Descargar VTT y convertir a transcripción
```bash
node bunny-descargar-vtt.mjs
node bunny-descargar-vtt.mjs --apply
```
Baja `https://{cdn}/{videoId}/captions/es.vtt` a `out/vtt/` y genera `out/transcripciones/<videoId>.json`
con `{ segmentos: [{ inicio, fin, texto }], texto }`. Si responde 403, la Pull Zone exige Token Authentication:
define `BUNNY_CDN_TOKEN_KEY` (ver "Pendiente de verificar"). `--solo-parsear --apply` re-parsea sin red.

### 4. Generar notas, títulos y quizzes
```bash
node generar-contenido.mjs                                   # estimación de tokens y costo, sin llamar a la API
node generar-contenido.mjs --solo <cursoId> --apply          # un curso primero; revisar out/contenido/<cursoId>.json
node generar-contenido.mjs --apply --presupuesto 40          # el resto, abortando si la estimación supera $40
```
Modelo `claude-opus-5` con razonamiento adaptativo, salida JSON con esquema y *fallback* del servidor ante negativas.
Cada respuesta pasa por `lib/validador.mjs` (≤70 caracteres y sin "Clase N"; resumen ≤60 palabras; 3–6 conceptos con
marcas `mm:ss` dentro de la duración y presentes en la transcripción; exactamente 5 interacciones por clase:
`seleccion`, `seleccion_multiple`, `ordenar`, `relacionar` y `completar`). Cada interacción exige evidencia `mm:ss`,
solución estructural válida y explicación razonada. Si falla, se reintenta **una vez** con la lista de errores. La ficha del curso (`descripcion` ≤50 palabras,
5 `aprenderas`, `nivel`) se genera cuando todas sus clases tienen contenido. Se guarda tras cada clase.

### 5. Publicar a Firestore (borradores)
```bash
node publicar-contenido.mjs --sin-firestore   # diff aproximado contra catalogo.json, sin credenciales
node publicar-contenido.mjs                   # diff real contra Firestore (solo lecturas)
node publicar-contenido.mjs --apply
```
- `v2_cursos/{id}`: `clases[].titulo` (solo si sigue siendo `Clase N`), `clases[].duracionMin` (del inventario),
  `clases[].notas` (solo si no hay), y `descripcion/aprenderas/nivel` (solo si siguen siendo los provisionales).
  Lo editado a mano se conserva salvo `--reemplazar-titulos`, `--reemplazar-notas`, `--reemplazar-curso`.
  Update parcial: no reescribe otros campos. Si el curso no existe se avisa; `--crear-faltantes` lo crea con `publicado: false`.
- `v2_quizzes/{cursoId}_{n}`: `{ cursoId, n, estado: 'borrador', preguntas, generado }`.
  **Un quiz `aprobado` nunca se toca.** Un `borrador` existente solo se reemplaza con `--reemplazar-borradores`.
  Todo ocurre en una transacción por curso, que relee los quizzes antes de escribir.

### 6. Revisión humana en el admin (obligatoria)
Un odontólogo revisa cada clase y cada quiz en el admin (`PATCH /admin/quizzes/:id`) y solo entonces pasa a `aprobado`.

### 7. Migrar certificados viejos (independiente del resto)
```bash
node migrar-certificados.mjs        # propone, solo lecturas; reporte en out/reportes/
node migrar-certificados.mjs --apply
```
Ver mapeo abajo. Usa `create()` en lotes: nunca sobreescribe un `v2_certificados` existente.

## Costos estimados

- **Anthropic (Opus 5, $5 / M entrada, $25 / M salida).** Suponiendo clases de ~40 min (~13 mil tokens de transcripción con
  marcas), 77 clases + 18 fichas, con 30 % de reintentos y ~5 mil tokens de salida por clase (incluye razonamiento):
  **~$15–35 USD** en total. La cifra real sale de `node generar-contenido.mjs` (dry-run) una vez que hay transcripciones,
  y el costo real se imprime al terminar. Regenerar un curso cuesta lo mismo otra vez.
- **Bunny Transcribe.** La tarifa pública vigente es **$0.10 USD por minuto y por idioma**. El catálogo suma alrededor
  de 4,714 minutos, así que el peor caso —si ningún video tuviera subtítulos reutilizables— sería **$471.40 USD** solo
  por transcripción. Primero corre el inventario de solo lectura, calcula únicamente los videos sin `captions es` y no
  lances los 77 sin presupuesto explícito. El dry-run de `bunny-transcribir.mjs` imprime los minutos totales.
- **Firestore.** Despreciable (cientos de lecturas/escrituras).

## Advertencias

- **Revisión clínica humana obligatoria antes de aprobar cualquier quiz o publicar notas.** El prompt exige fidelidad a la
  transcripción y prohíbe añadir datos, pero la transcripción automática confunde términos técnicos y el modelo puede
  equivocarse. Revisa en especial dosis, cifras, nombres de materiales, la respuesta marcada como correcta y las explicaciones.
- Los scripts solo escriben en colecciones `v2_*`. `certificados` y `cursos` (club actual) se leen, nunca se escriben.
- No corras `--apply` contra producción sin revisar antes el dry-run.
- `out/` puede contener transcripciones completas: no lo subas al repo ni lo compartas.

## Mapeo de certificados viejos → `v2_certificados`

Inferido de `C:\dev\Odonteck\vip-panel.html` (`emitirCertificadoFirestore`, `getCertificadosReales`) y `verificar.html`.
El panel viejo escribe `certificados/{folio}` con `setDoc(..., { merge: true })`; `verificar.html` lee por folio.

| Viejo (`certificados/{folio}`) | v2 (`v2_certificados/{folio}`) |
|---|---|
| `folio` `OdonTeck-AAAA-XXXXXX` (hash de uid+curso) | `folioAnterior` |
| — | `folio` nuevo `ODT-AAAA-NNNNN`, consecutivo por año de emisión tras el mayor existente |
| `uid`, `nombre` | igual |
| `cursoId` (id autogenerado de la colección vieja `cursos`) | `cursoId` del catálogo nuevo: por id, por título (`curso`), o vía `cursos/{cursoId}` (título o videoIds de `sesiones`) |
| `curso` (título) | `cursoTitulo` (si falta, el del catálogo) |
| `area` (por defecto `Odontología General`) | `area` (si es el valor por defecto, se usa la del catálogo) |
| `sesiones` | `clases` (si es 0, número de clases del catálogo) |
| `emitido` ISO (o `createdAt` Timestamp) | `emitido` ISO |
| `horas`, `instructor`, `year`, `createdAt` | se descartan (no están en el contrato) |

Un solo certificado por usuario+curso (se conserva el más antiguo); los duplicados, los que no resuelven curso y los
que no tienen uid/fecha se reportan y **no** se copian. Para que los QR impresos sigan funcionando,
`GET /verificar/:folio` debe buscar también por `folioAnterior`. Coordinar con `api/` la estrategia de folios: el
generador del backend no debe chocar con los consecutivos migrados (la escritura con `create()` falla antes de sobreescribir).

## Pendiente de verificar con credenciales

| Punto | Estado |
|---|---|
| `GET /library/{id}/videos` (paginado, `AccessKey`, campos `length`, `captions[].srclang`, `availableResolutions` como texto) | Confirmado en la referencia de Bunny |
| `POST /library/{id}/videos/{videoId}/transcribe` con `targetLanguages`, `sourceLanguage`, `generateTitle`… y `?force` | Confirmado en la referencia; **probar con `--solo`**: no está claro si `targetLanguages` debe incluir el idioma de origen |
| Ruta `https://{pullzone}.b-cdn.net/{videoId}/captions/{idioma}.vtt` | Confirmada en "Storage structure" |
| Código de idioma real que genera Bunny (`es` vs `es-MX`) | Se toma de `captions[].srclang` del inventario |
| Firma de URL del CDN (`firmarUrlCdn`, HMAC-SHA256 `HS256-`) | **Sin probar**: implementada según la documentación de token authentication avanzada; validar contra la zona real si el VTT da 403 |
| Límites de tasa de la API de Bunny | No documentados; se usa concurrencia baja y reintentos |

## Estructura

```
bunny-inventario.mjs · bunny-transcribir.mjs · bunny-descargar-vtt.mjs
generar-contenido.mjs · publicar-contenido.mjs · migrar-certificados.mjs
lib/  cli (args, rutas, E/S) · tiempo · vtt · reintentos · bunny · inventario
      validador · contenido (prompts, esquemas, llamada) · generar (orquestación) · publicar · certificados · firestore
test/ *.test.mjs + fixtures/
```
