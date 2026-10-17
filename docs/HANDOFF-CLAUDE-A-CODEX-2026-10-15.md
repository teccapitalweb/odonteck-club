# Relevo Claude → Codex · OdonTeck Club · 2026-10-15

Lee primero `CLAUDE.md`/`AGENTS.md`, `docs/RELEVO-CLAUDE.md` y `docs/CONTEXTO-MAESTRO.md`. Este archivo es solo el corte de lo que hizo Claude en esta sesión y lo que falta.

## 1. Dónde está el trabajo

Todo el trabajo de esta sesión vive en ramas y PRs, **no en esta carpeta**.

| Qué | Dónde |
|---|---|
| Worktree de trabajo | `C:\dev\02_CLIENTES\OdonTeck\odonteck-club-wt-herramientas` |
| Vista local integrada (todas las ramas juntas) | rama local `local/vista-completa`, servida con Vite en `http://127.0.0.1:5176` |
| Producción | `main` en `10e56bd` (Cloudflare Pages manual, API Railway auto al mergear `api/`) |

`node_modules` y `api/node_modules` del worktree son enlaces a esta carpeta. La rama `local/vista-completa` **no se sube**: solo sirve para ver todo junto. Tiene además un ajuste local de `vite.config.ts` (`server.fs.allow`) para servir las fuentes desde el `node_modules` enlazado.

**Esta carpeta (checkout principal)** sigue en `main` pero 11 commits atrás, con cambios sin commit de una sesión anterior de Codex sobre el Directorio. Se compararon con `origin/main`: son una versión vieja de lo que ya está publicado. No se tocaron. Antes de trabajar aquí, decide con Miguel si se descartan y actualiza desde `main`.

## 2. PRs abiertos (todos esperan revisión y merge de Miguel)

| PR | Rama → base | Qué hace | Notas |
|---|---|---|---|
| #12 | `feat/academia` → `main` | Academia OdonTeck + piloto Caries dental | Módulos nacen en «borrador»; contenido clínico requiere revisión profesional. Colecciones `v2_academia_*`. |
| #13 | `fix/safari-mac` → `main` | Zoom iPhone, desborde lateral, bot que deslizaba el fondo, tarjeta de usuario de la barra lateral (layout en pantallas bajas y abre el panel lateral de cuenta) | Solo frontend. |
| #14 | `feat/directorio-diseno` → `main` | Directorio: tarjeta clicable, ficha más completa, afinidad, pasos de conexión | Solo frontend. |
| #15 | `feat/directorio-perfil-documentos` → `feat/directorio-diseno` | Página propia del perfil `#/directorio/perfil/:uid`, editar foto/portada en la página, documentos adjuntos (CV, títulos…) con miniatura real (pdf.js) y visor | **Apilado sobre #14: mergear #14 primero.** Toca API. |
| #16 | `feat/curso-gratis-elegible` → `main` | Nueva regla freemium «Escoge tu curso gratis» + módulo `#/curso-gratis` + anuncio de bienvenida | **Cambia regla comercial y API.** Ver sección 3. |
| #17 | `fix/landing-sin-precios` → `main` | Quita precios ($199/$1,899) de la sección de planes de la landing | Solo landing. **Prioridad de Miguel: debe salir a producción.** Al 2026-10-15 seguía sin mergear; Miguel desplegó dos veces pero desde `main` sin el PR, así que producción aún muestra precios. |

Orden sugerido: #17 → #13 → #14 → #15 → #12 → #16. Tras cada merge, desplegar el frontend a mano (comando en la sección 5).

### Conflictos esperados al mergear (ya resueltos en `local/vista-completa`, úsala de referencia)

- `api/src/datos.js` (#12 y #16): conservar las colecciones `academia*` **y** `cursoGratis: 'v2_curso_gratis'`. Ojo con no perder `directorioReportes`.
- `src/ui/shell.ts` (#12, `proto/cursos-en-vivo`, #16): conservar Academia, la regla de `Cursos` `/^\/(cursos$|curso(\/|$))/` (no debe activarse en `/curso-gratis`) y combinar filtros: `soloDemo` y `soloGratis`.
- `src/main.ts`: conservar todas las rutas (`/directorio/perfil/:uid`, `/curso-gratis`, Academia) y los montajes de `onRender` (documentos del directorio y módulo del curso gratis).
- `src/core/remoto.ts`: conservar la carga de Academia y las dos líneas del Directorio (listado y ficha).
- `src/pages/cuenta.ts`: puede quedar un `import { Datos }` duplicado; dejar uno.
- `src/landing/main.ts` (#16 y #17): la sección de planes. Tras mergear #17, quedarse con la versión de #16 («Escoge tu curso y empieza hoy»), que asume la regla nueva.

## 3. Regla nueva «Escoge tu curso gratis» (PR #16)

- El miembro gratis elige **un** curso; queda abierto completo **menos la última clase**. Los demás requieren VIP.
- Elección definitiva; **un solo cambio** en 24 h si no consumió más de una clase (cuenta lo marcado como visto **y** lo abierto: video, ficha, quiz → campo `maxAbierta`).
- Migración perezosa: quien ya avanzó en el curso gratis anterior (clases con `gratis: true`) lo conserva (`origen: 'migracion'`).
- Admin reinicia la elección desde el detalle del miembro.
- `v2_curso_gratis/{uid}` solo lo escribe el servidor. La decisión de acceso y el registro de `maxAbierta` corren en la **misma transacción** que el cambio de curso (corrige dos hallazgos de la revisión de seguridad: bypass por contenido abierto sin marcar y carrera entre abrir y cambiar).
- La marca `gratis` por clase **ya no abre contenido**; solo sirve para migrar y para textos de landing.
- Primera entrada: encuesta inicial → anuncio → módulo `#/curso-gratis` → celebración → clase 1. El recorrido de bienvenida no se muestra encima de una clase ni del módulo.
- Demo: `Configuración → Empezar como usuario nuevo` borra lo guardado del prototipo para repetir la primera entrada.
- Docs de la regla ya actualizados en `CONTEXTO-MAESTRO.md` y `RELEVO-CLAUDE.md` dentro del PR.

## 4. Pendientes

1. **Mergear y desplegar #17** (precios de la landing). Luego verificar en `https://www.odonteckconsulting.com/landing/` que el JS ya no contiene `MXN / mes`.
2. Al mergear #17, actualizar la rama de #16 con `main` y resolver `src/landing/main.ts` como se indica arriba.
3. El texto de portada «Aprende a tu ritmo desde $199 al mes» sigue en la landing; Miguel no ha pedido quitarlo.
4. Directorio (#15) en producción:
   - Los PDF se leen con URL firmada de Firebase Storage. Para verlos **dentro** del visor (pdf.js) el bucket necesita CORS que permita GET desde el dominio; si no, el visor muestra la portada y el botón «Abrir aparte». No cambiar CORS sin autorización.
   - Los archivos van en `directorio-documentos/{uid}/{id}/`. Confirmar que las reglas de Storage no hacen pública esa ruta (se espera denegación por defecto).
5. Preguntas abiertas de Miguel (Cursos en vivo, prototipo solo local en `proto/cursos-en-vivo`): ¿certificado avalado por IPCI?, ¿descuento VIP?, ¿grupo de WhatsApp o enlace de Meet tras pagar? La inscripción real (API/admin) no está hecha.
6. Academia: faltan los otros 4 programas (periodontal, endodoncia, odontopediatría, bioseguridad) cuando Miguel valide el piloto.
7. Contradicción de copy en Praxia y decidir si Herramientas Pro es solo VIP.

## 5. Cómo trabajar

- No hacer push a `main`, merge de PRs ni despliegues sin que Miguel lo autorice; el guardián de Claude los bloquea y Miguel mergea.
- Verificación mínima: `npm run build` en la raíz; `npm ci && npm run check && npm test` en `api/` (197 pruebas pasan en la integración).
- Pruebas visuales: Playwright con WebKit (iPhone 390×844 y escritorio) y Edge (`channel: 'msedge'`). Login demo: botón «Entrar directo al demo (1 clic)».
- Despliegue manual del frontend (lo corre Miguel):

```powershell
Set-Location "C:\dev\02_CLIENTES\OdonTeck\odonteck-club-wt-herramientas"; git fetch origin; git checkout --detach origin/main; $env:VITE_API_URL='https://api-production-db314.up.railway.app'; npm run build; Remove-Item Env:VITE_API_URL; npx -y wrangler@3 pages deploy dist --project-name odonteck-club --branch main --commit-dirty=true; git switch local/vista-completa
```

- Reglas de siempre: no mezclar marcas, no exponer `.env`, colecciones nuevas con prefijo `v2_`, admin por custom claim `admin: true`, Bunny solo con enlaces firmados, contenido clínico con revisión humana, Cursos en vivo solo local.
