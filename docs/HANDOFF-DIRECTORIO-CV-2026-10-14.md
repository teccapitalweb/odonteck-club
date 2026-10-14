# Handoff técnico · Directorio profesional y perfil tipo CV

> Corte local del 14 de octubre de 2026. Este documento existe para que otra IA continúe sin confundir el Directorio ya versionado con la ampliación tipo CV que todavía está sólo en el worktree.

## 1. Punto exacto de continuidad

- Checkout de trabajo: `C:\dev\02_CLIENTES\OdonTeck\odonteck-club-release-20261014`
- Repositorio remoto: `https://github.com/teccapitalweb/odonteck-club.git`
- Rama local: `release/directorio-responsive-20261014`
- Upstream observado: `origin/main`
- HEAD observado: `e3fc6d7` (`feat: publicar directorio profesional responsive`)
- URL local usada para QA: `http://127.0.0.1:5197/#/directorio`
- Modo de esa URL: demo, porque no se configuró `VITE_API_URL`.

El commit `e3fc6d7` ya contiene el Directorio como módulo principal, sus fotografías demostrativas y el diseño responsive base. Los cambios tipo CV descritos abajo permanecen **modificados localmente, sin commit ni push**. No afirmar que esa ampliación está en producción.

Estado Git observado antes de crear este handoff:

```text
## release/directorio-responsive-20261014...origin/main
 M api/src/routes/directorio.js
 M api/test/directorio.test.js
 M api/test/rules.test.js
 M docs/CONTEXTO-MAESTRO.md
 M docs/PLAN-DIRECTORIO-EVALUACIONES.md
 M docs/RELEVO-CLAUDE.md
 M docs/contrato.md
 M src/core/directorio.ts
 M src/main.ts
 M src/pages/comunidad.ts
 M src/styles/comunidad.css
```

No había archivos sin seguimiento en este worktree. Este archivo se agregó después de tomar el corte anterior. Preservar todos los cambios y no usar `git reset`, `git checkout --`, limpieza masiva ni `git add -A`.

## 2. Resultado visual actual

La ruta `#/directorio` muestra:

- hero editorial de red profesional con movimiento sutil y llamadas a crear perfil o publicar oportunidad;
- pestañas Personas, Oportunidades y Mis conexiones;
- búsqueda y filtros por afinidad;
- tarjetas limpias con fotografía, especialidad, ubicación, habilidades, disponibilidad y acciones;
- tres perfiles ficticios de demostración: Dra. Ana Torres, Dr. Luis Herrera y Dra. Sofía Reyes;
- aviso explícito de que los perfiles y oportunidades del demo son ficticios.

Al pulsar **Ver perfil**, se abre una ficha tipo CV con:

- portada y fotografía;
- nombre, titular, ubicación y etapa;
- métricas de años de experiencia, empleos y formación/credenciales;
- biografía profesional;
- línea de tiempo de experiencia;
- formación académica;
- credenciales y cursos;
- idiomas, modalidades, disponibilidad, especialidades y habilidades;
- recordatorio de privacidad del contacto;
- acción para solicitar conexión y opción de denuncia.

Al pulsar **Crear mi perfil** o **Editar mi perfil**, se abre un editor amplio con:

- indicador de completitud;
- portada horizontal y foto de perfil con vista previa;
- identidad profesional, ubicación, etapa y años de experiencia;
- especialidades, habilidades, idiomas y presentación;
- listas repetibles para experiencia, formación y credenciales;
- disponibilidad, modalidad, canal privado de contacto y visibilidad;
- controles para quitar foto/portada o eliminar el perfil.

El editor y la ficha se adaptan a escritorio y móvil. Las secciones repetibles cambian de varias columnas a una sola columna en pantallas pequeñas.

## 3. Datos y activos de demostración

Los perfiles demo viven en `src/core/directorio.ts`. Sus datos son ficticios y contienen la palabra `demostrativo` o `referencia` donde corresponde. No convertirlos en usuarios reales ni mezclarlos con Firestore.

Fotografías versionadas del demo:

```text
public/fotos/directorio-demo-ana-v1.webp
public/fotos/directorio-demo-luis-v1.webp
public/fotos/directorio-demo-sofia-v1.webp
```

En demo, el perfil del usuario se guarda intencionalmente en `localStorage`. La foto y la portada preparadas se convierten a data URL para poder recorrer la maqueta sin servicios externos. Esto sirve para QA visual, no demuestra Storage, Auth o API de producción.

## 4. Cambios locales por archivo

### `src/core/directorio.ts`

- Amplía `PerfilDirectorio` con `banner`, `anosExperiencia`, `idiomas`, `experiencia`, `formacion` y `credenciales`.
- Añade los tipos de experiencia, formación y credencial.
- Mantiene compatibilidad con perfiles antiguos cuyos campos nuevos estén ausentes.
- Generaliza el procesamiento de imágenes:
  - foto: cuadrada, 720 px, WebP;
  - portada: horizontal, 1600 × 560, WebP.
- En modo API solicita URLs firmadas separadas para foto y portada, hace `PUT` directo a Storage y después confirma el perfil por la API.
- En modo demo conserva la misma experiencia mediante `localStorage` y data URLs.

### `src/pages/comunidad.ts`

- Conserva el archivo histórico aunque la ruta visible sea `#/directorio`.
- Renderiza la ficha pública tipo CV, métricas, timeline, formación, credenciales e idiomas.
- Renderiza el editor por secciones y las filas repetibles.
- Calcula un porcentaje de completitud sin usarlo como requisito de publicación.
- Escapa todo texto suministrado por el miembro antes de insertarlo en HTML.

### `src/main.ts`

- Mantiene el estado temporal de foto y portada y revoca sus Object URL cuando corresponde.
- Maneja selección, vista previa y eliminación de portada.
- Permite agregar/quitar filas repetibles con máximos de 8 experiencias, 8 formaciones y 12 credenciales.
- Recoge los campos repetibles y llama `Directorio.guardarPerfil(...)`.
- Conserva los eventos ya existentes de perfiles, oportunidades, conexiones, denuncia y moderación.

### `src/styles/comunidad.css`

- Amplía el modal del editor hasta 960 px y la ficha pública hasta un formato tipo hoja profesional.
- Añade portada, indicador de completitud, secciones numeradas, filas repetibles, métricas, timeline, credenciales y responsive móvil.
- Usa los tokens visuales existentes; no introduce una segunda identidad de marca.

### `api/src/routes/directorio.js`

- Proyecta públicamente los nuevos campos CV, pero sigue excluyendo `contacto`.
- Valida:
  - `anosExperiencia`: 0–70;
  - hasta 6 idiomas;
  - hasta 8 experiencias;
  - hasta 8 formaciones;
  - hasta 12 credenciales;
  - largos máximos y texto seguro en cada registro.
- Añade portada privada administrada por el servidor:
  - path: `directorio/perfiles/{uid}/banner.webp`;
  - tipo obligatorio: `image/webp`;
  - máximo real: 3 MB;
  - URL firmada por 10 minutos.
- Foto:
  - path: `directorio/perfiles/{uid}/avatar.webp`;
  - máximo real: 2 MB.
- Antes de guardar, vuelve a consultar metadata de Storage. No confía en el tamaño declarado por el navegador.
- Agrega `?v={actualizado}` a URLs públicas de foto/portada para invalidar caché.
- Al eliminar el perfil, elimina foto y portada, además de cerrar/rechazar los recursos relacionados según la lógica existente.

Endpoints nuevos de esta ampliación:

```text
POST   /directorio/perfil/banner/subida
DELETE /directorio/perfil/banner
```

Los endpoints anteriores de foto y perfil permanecen vigentes.

### Pruebas y contrato

- `api/test/directorio.test.js`: cubre payload CV, portada WebP, límites y texto no seguro.
- `api/test/rules.test.js`: añade lectura pública y bloqueo de escritura directa para `banner.webp`.
- `docs/contrato.md`: documenta campos, límites, rutas y privacidad.
- `docs/RELEVO-CLAUDE.md`, `docs/CONTEXTO-MAESTRO.md` y `docs/PLAN-DIRECTORIO-EVALUACIONES.md`: ya reflejan que el perfil CV está sólo en local.

## 5. Privacidad y reglas que no deben romperse

- Participar en el Directorio es opt-in.
- El contacto nunca aparece en listados ni en la ficha pública.
- El contacto sólo se entrega a las dos partes después de que la persona destinataria acepta una conexión.
- La foto y la portada sí son públicas cuando el perfil es visible; el editor debe explicarlo.
- No colocar datos de pacientes en portada, experiencia, biografía, capturas o ejemplos.
- No otorgar puntos por publicar oportunidades o enviar conexiones; evitar incentivos de spam.
- Publicar oportunidades requiere VIP/admin; explorar perfiles y solicitar conexión está disponible a miembros autenticados.
- Las oportunidades vencidas no aceptan solicitudes.
- Mantener límites, idempotencia, espera tras rechazo, denuncia privada y moderación administrativa.
- No marcar perfiles reales como “verificados” hasta definir y aplicar un criterio verificable; las insignias actuales del demo son solamente presentación visual.

## 6. Verificación ya realizada para este corte local

Resultados registrados el 14 de octubre de 2026:

```text
npm run build                      PASS
cd api; npm run check              PASS
cd api; npm test                   140 totales; 139 pass; 0 fail; 1 skip
suite específica Directorio        15/15 PASS
Directorio 1440 × 900              PASS; sin overflow ni errores de consola
Directorio 390 × 844               PASS; sin overflow ni errores de consola
```

También se recorrieron manualmente:

- listado y filtros;
- ficha de la Dra. Ana Torres;
- editor completo;
- portada/foto y secciones CV;
- vista móvil y escritorio.

El conjunto completo de reglas (`npm run test:rules`) se ejecutó exitosamente con los emuladores locales de Firestore y Storage:
- 3/3 suites aprobadas (0 fallas, 0 omitidas).
- Se validó explícitamente el caso de `banner.webp` junto con `avatar.webp` en `directorio/perfiles/{uid}/{archivo}` (lectura pública y bloqueo de escritura directa desde cliente).
- Se comprobó el bloqueo estricto en `v2_*` para clientes y la lectura pública de certificados.

Adicionalmente, se rediseñó el acceso (`/login`) para cumplir con la especificación de pantalla completa edge-to-edge (split-screen 100vw × 100dvh):
- Columna izquierda de autenticación limpia (43vw), centrada verticalmente (`safe center`), scrollbar oculta.
- Columna derecha editorial (57vw) con imagen hero a sangre, degradado cinematográfico, insignias superiores y propuesta de valor.
- Cero barras de desplazamiento en PC (`overflow: hidden !important`, `scrollbar-gutter: auto !important`).
- Apilado responsivo fluido en pantallas menores a 1024px.

## 7. Cómo levantar y revisar

Frontend demo:

```powershell
Set-Location 'C:\dev\02_CLIENTES\OdonTeck\odonteck-club-release-20261014'
npm run dev -- --host 127.0.0.1 --port 5197
```

Abrir:

```text
http://127.0.0.1:5197/#/directorio
```

Verificación mínima antes de entregar cambios adicionales:

```powershell
npm run build
Set-Location api
npm run check
npm test
npm run test:rules
```

Para comprobar el comportamiento equivalente a producción, volver a la raíz y compilar con la API explícita sólo después de confirmar la URL correcta:

```powershell
$env:VITE_API_URL='https://api-production-db314.up.railway.app'
npm run build
Remove-Item Env:VITE_API_URL
```

Un build con API no demuestra despliegue ni conectividad autenticada.

## 8. Pendientes antes de producción

1. [COMPLETADO] `npm run test:rules` validado con PASS (3/3) en emuladores locales incluyendo `banner.webp`.
2. Hacer smoke autenticado con una cuenta miembro real:
   - crear/editar/ocultar perfil;
   - subir, reemplazar y quitar foto/portada;
   - comprobar caché y URLs versionadas;
   - comprobar privacidad del contacto.
3. Hacer smoke con VIP para publicar/cerrar oportunidad y conectar.
4. Hacer smoke con admin real (`admin: true`) para reportes y moderación.
5. Confirmar bucket, CORS, reglas e índices del entorno que vaya a desplegarse.
6. Probar contraste, foco, teclado, lector de pantalla y `prefers-reduced-motion` en el flujo completo.
7. Verificar Safari/iPhone real además de los breakpoints emulados.
8. Decidir el criterio real de perfil verificado antes de mostrar esa insignia fuera del demo.
9. Confirmar que las fotografías demostrativas tienen licencia adecuada para publicación continuada.

No tocar Stripe, membresías heredadas, Railway, Cloudflare, Firebase, DNS o producción sin autorización explícita. El checkout nuevo de Stripe sigue bloqueado hasta configurar y probar `STRIPE_WEBHOOK_SECRET`.

## 9. Secuencia recomendada para la siguiente IA

1. Leer `CLAUDE.md` completo.
2. Leer `docs/RELEVO-CLAUDE.md`, este archivo, `docs/CONTEXTO-MAESTRO.md`, `docs/contrato.md` y `docs/PLAN-DIRECTORIO-EVALUACIONES.md`.
3. Ejecutar `git status --short --branch` y revisar el diff sin restaurar nada.
4. Confirmar que trabaja en este worktree y no en el checkout histórico, el ZIP de Descargas u otra marca.
5. Levantar `#/directorio` en demo y recorrer la ficha y el editor antes de modificar diseño.
6. Ejecutar build, check y tests después de cualquier cambio.
7. Si el usuario pide commit, seleccionar sólo los archivos revisados; no usar staging masivo.
8. Si el usuario pide producción, verificar primero cuenta GitHub correcta, commit, despliegues, reglas, índices y smokes autenticados. Build, commit y push no equivalen a producción.

## 10. Siguiente mejora recomendada

No añadir más decoración todavía. La prioridad es cerrar la validación E2E de foto/portada y privacidad en modo API, repetir las reglas con emuladores y resolver accesibilidad del editor. Después puede refinarse el perfil con enlaces profesionales opcionales y portafolio, siempre con opt-in, moderación y límites claros.

