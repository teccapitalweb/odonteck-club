# Handoff y Guía de Migración de Equipo — OdonTeck Club (16 de octubre de 2026)

> **Propósito de este documento:** Mañana se cambia de equipo de cómputo. Este documento concentra **todo el estado actual del proyecto**, **todo lo construido hoy (16 de octubre de 2026)**, **todas las ramas respaldadas en GitHub** y **los comandos exactos paso a paso** para que en la computadora nueva cualquier persona o agente (Claude Code, Codex, Antigravity) clone, organice y continúe exactamente donde nos quedamos sin perder un solo archivo.

---

## 1. Instrucciones paso a paso para el Equipo Nuevo (Clonado y Organización)

Ejecuta estos bloques en **PowerShell** en la computadora nueva para dejar la estructura limpia y lista en menos de 3 minutos:

### Paso 1.1 — Crear carpeta base y clonar el repositorio oficial
```powershell
New-Item -ItemType Directory -Force -Path "C:\dev\02_CLIENTES\OdonTeck"
Set-Location "C:\dev\02_CLIENTES\OdonTeck"

# Clonar el repositorio oficial de TEC Capital
git clone https://github.com/teccapitalweb/odonteck-club.git
Set-Location "C:\dev\02_CLIENTES\OdonTeck\odonteck-club"

# Descargar todas las ramas remotas (incluyendo respaldos y PRs abiertos)
git fetch --all --prune
```

### Paso 1.2 — Instalar dependencias (Raíz y API)
```powershell
# Dependencias del frontend (raíz)
Set-Location "C:\dev\02_CLIENTES\OdonTeck\odonteck-club"
npm ci

# Dependencias del backend (api/)
Set-Location "C:\dev\02_CLIENTES\OdonTeck\odonteck-club\api"
npm ci
Set-Location "C:\dev\02_CLIENTES\OdonTeck\odonteck-club"
```

### Paso 1.3 — Crear el worktree de trabajo activo (`feat/juegos-cierre-clase`)
Si quieres mantener `odonteck-club` limpio en `main` y trabajar en un worktree separado igual que en el equipo anterior:
```powershell
Set-Location "C:\dev\02_CLIENTES\OdonTeck\odonteck-club"
git worktree add ..\odonteck-club-wt-herramientas feat/juegos-cierre-clase
Set-Location "C:\dev\02_CLIENTES\OdonTeck\odonteck-club-wt-herramientas"
npm ci
```
*(O bien, puedes hacer directamente `git switch feat/juegos-cierre-clase` dentro de `odonteck-club` si prefieres un solo directorio).*

### Paso 1.4 — Levantar el servidor local para ver los juegos y cambios de hoy
```powershell
Set-Location "C:\dev\02_CLIENTES\OdonTeck\odonteck-club-wt-herramientas"
npm run dev -- --host 127.0.0.1 --port 5176 --strictPort
```
Abre en el navegador: **`http://127.0.0.1:5176/#/clase/1/1`**

### Paso 1.5 — Archivos que NO están en GitHub por seguridad/licencia (copiar por USB o unidad segura si los necesitas localmente)
Por regla estricta del proyecto (`CLAUDE.md` y `docs/RELEVO-CLAUDE.md` §2), estos archivos **nunca se suben a Git**:
1. **Variables de entorno (`.env` y `api/.env`)**: si tenías llaves locales de Firebase/Bunny/Stripe en el equipo anterior, cópialas de forma privada. (Para desarrollo frontend con API de producción basta usar `$env:VITE_API_URL='https://api-production-db314.up.railway.app'`).
2. **Carpeta `public/libros/`**: contiene PDFs pesados pendientes de auditoría de derechos de autor. No se sube al repositorio. Los 10 materiales oficiales del club ya viven en `public/materiales/` y `api/private/materiales/` (esos **sí** están en Git).

---

## 2. Todo lo que se construyó hoy (16 de octubre de 2026)

Todo el trabajo de hoy está comiteado y subido en la rama **`feat/juegos-cierre-clase`**.

### 2.1 Rediseño total de los Juegos de Cierre de Clase (`juego-clase`)
Se reemplazaron por completo los juegos anteriores basados en memorizar marcas de tiempo (`mm:ss`) y se eliminó el selector repetitivo de 3 pestañas iguales en cada clase.

Ahora **cada clase tiene asignado 1 único juego clásico, visual y clínico** (sin repetir el mismo tipo en clases consecutivas dentro de un curso), rotando entre **5 mecánicas distintas**:

| # | Tipo (`TipoJuegoClase`) | Nombre en UI | Mecánica y Diseño | Cobertura en las 77 clases |
|---|---|---|---|---|
| 1 | `rompecabezas` | **Rompecabezas visual** | Tablero fotográfico vertical **`3:4` (`2 columnas × 3 filas = 6 piezas`)** con la ilustración clínica de la clase, tarjeta guía lateral con vista previa, botón de **Guía en tablero** (marca de agua), **Pista (1 pieza)**, soporte táctil/clic o arrastrar y soltar (*drag & drop*), y desbloqueo progresivo de las 3 ideas clave conforme colocas las piezas. | **18 clases** (**1 garantizado por cada uno de los 18 cursos**, siempre en Clase 1, 2 o 3 para que incluso los cursos de 3 clases tengan el suyo). |
| 2 | `sopa` | **Sopa de letras clínica** | Cuadrícula interactiva `10×10` / `11×11` con **5 términos clínicos clave** extraídos de la clase (`→`, `↓`, `↘`). Permite seleccionar arrastrando con el mouse/dedo o tocando inicio y fin, ilumina cada palabra encontrada con su propio color y ofrece botón de pista. | **15 clases** |
| 3 | `ahorcado` | **El ahorcado clínico** | 3 rondas por clase. Incluye un **Monitor de Vitalidad Dental en SVG** (escudo clínico y molar que muestra micro-fracturas conforme pierdes alguna de las `6 vidas`), pista contextual de la clase con espacio en blanco, teclado en pantalla + soporte de **teclado físico**, y botón de pista de letra. | **14 clases** |
| 4 | `memorama` | **Memorama clínico 3D** | 8 tarjetas (`4×2`) con giro tridimensional `rotateY(180deg)` que emparejan **4 conceptos clave de la clase** con su **aplicación clínica directa**. | **15 clases** |
| 5 | `palabra` | **Palabra secreta** | Fichas táctiles tipo Scrabble con las letras revueltas del concepto clínico + pista contextual de la clase, soporte de teclado físico (`Backspace`, `Enter`, letras) y reordenamiento con un clic. | **15 clases** |

### 2.2 Aparición automática al terminar la clase + Tarjeta de Cierre bajo el reproductor
1. **Al terminar el video (`Player.js` evento `ended`)**: se registra la clase como vista y se abre automáticamente el modal del juego de esa clase.
2. **Al pulsar «Siguiente clase →» (`[data-ir-siguiente]`)**: si el alumno aún no ha jugado el cierre de esa clase (`obtenerPuntajeJuego(clave) === 0`), el sistema intercepta el avance y **abre primero el juego de cierre** con diseño editorial en dos columnas (vitrina visual de la clase a la izquierda + tablero interactivo a la derecha). Al completarlo o saltar, avanza al quiz o a la siguiente clase.
3. **Tarjeta `.lesson-closing-card` debajo del video (`src/pages/clase.ts`)**: muestra siempre qué juego le toca a esa clase (con su miniatura visual, insignia de tipo de juego, descripción, puntaje si ya fue completado y botón directo **«Jugar ahora» / «Volver a jugar»**).

### 2.3 Prompts `3:4` para generar las 18 ilustraciones de Rompecabezas (`docs/prompts-rompecabezas-3x4.md`)
Se creó el documento **`docs/prompts-rompecabezas-3x4.md`** con los **18 prompts fotográficos/editoriales en proporción vertical `3:4` (`1080 × 1440 px`)**, uno para cada clase que tiene asignado el juego de **Rompecabezas** en los 18 cursos del catálogo:
- Cada prompt está diseñado específicamente para cuadrícula `2×3` (`TOP TIER`, `MIDDLE TIER`, `BOTTOM TIER`), sin texto incrustado y con estética *Editorial Dental Clinical Visualization*.
- Incluye la tabla exacta de nombres de archivo (`public/cursos/rompecabezas/curso-01-clase-01.webp` ... `curso-18-clase-03.webp`) para que, conforme el usuario pase las imágenes generadas, se coloquen ahí y se conecten en `resolverImagenClase` (`src/core/juego-clase.ts`).

### 2.4 Paquete visual del Curso 1 integrado (`public/cursos/diagnostico-en-ortodoncia-para-odontologos-generales/`)
Se integraron y documentaron en `docs/PROGRAMA-01-PAQUETE-VISUAL.md` las ilustraciones del Programa 01 (*Diagnóstico en Ortodoncia para Odontólogos Generales*):
- `portada-maestra-v2.png`
- `clase-01-diagnostico-integral.png`
- `clase-02-historia-fotografias-registros.png`
- `clase-03-radiologia-cefalometria.png`
- `clase-04-integracion-mecanicas.png`
- `clase-05-trazado-casos.png`
Conectadas automáticamente en `resolverImagenClase` (`src/core/juego-clase.ts`) para las 5 clases del Curso 1.

### 2.5 Archivos modificados y creados hoy en `feat/juegos-cierre-clase`
- `src/core/juego-clase.ts` — Motor de los 5 juegos, extractor clínico de palabras clave (`TERMINOS_PRIORITARIOS`), selector sin repetición (`elegirTipoJuego`), metadatos (`INFO_TIPO_JUEGO`), lectura de puntaje (`obtenerPuntajeJuego`) y resolución de imagen (`resolverImagenClase`).
- `src/ui/juego-clase.ts` — Modal interactivo en dos columnas (`showcase` + `stage`), eventos de arrastre/clic/teclado para los 5 juegos y pantalla de resultados con trofeo y banner visual.
- `src/styles/juego-clase.css` — Estilos del modal, tablero `3:4` de rompecabezas, sopa de letras, monitor dental SVG del ahorcado, cartas 3D del memorama, fichas de palabra secreta y `.lesson-closing-card`.
- `src/pages/clase.ts` — Tarjeta visual `.lesson-closing-card` debajo del video y atributo `data-ir-siguiente` en botones de avance.
- `src/main.ts` — Paso de `portadaCurso` a `abrirJuegoClase` e intercepción de `[data-ir-siguiente]` para mostrar el juego al terminar la clase.
- `scripts/audit-class-games.mjs` — Script de auditoría actualizado a los 5 juegos (`npm run audit:class-games` → `77/77` clases listas: `rompecabezas: 18, sopa: 15, ahorcado: 14, memorama: 15, palabra: 15`).
- `docs/prompts-rompecabezas-3x4.md` — Los 18 prompts `3:4` para los rompecabezas de los 18 cursos.
- `docs/PROGRAMA-01-PAQUETE-VISUAL.md` + `public/cursos/diagnostico-en-ortodoncia-para-odontologos-generales/*.png` — Activos visuales del Curso 1.

---

## 3. Mapa completo de Ramas y PRs en GitHub (Todo respaldado)

Todas las ramas locales y archivos sin seguimiento (excepto `.env` y `public/libros/`) quedaron subidos a `origin` (`https://github.com/teccapitalweb/odonteck-club.git`):

### 3.1 Rama principal y trabajo de hoy
| Rama en `origin` | Estado | Qué contiene |
|---|---|---|
| `origin/main` | **En producción (`72cc011`)** | Incluye los merges recientes de **PR #16** (`feat/curso-gratis-elegible`), **PR #18** (`feat/brujula-profesional`) y **PR #19** (`docs/release-onboarding-20261016`). |
| `origin/feat/juegos-cierre-clase` | **Rama activa de hoy (Lista para PR o continuar)** | Los **5 juegos visuales de cierre de clase** (`rompecabezas 3:4`, `sopa`, `ahorcado`, `memorama`, `palabra`), tarjeta `.lesson-closing-card`, apertura automática al terminar clase, los 18 prompts `3:4` (`docs/prompts-rompecabezas-3x4.md`), activos visuales del Curso 1 y todos los documentos de handoff y prompts rescatados del equipo anterior. |

### 3.2 PRs abiertos actualmente en GitHub (pendientes de revisión/merge)
| PR | Rama | Base | Descripción y orden sugerido de merge |
|---|---|---|---|
| **PR #17** | `origin/fix/landing-sin-precios` | `main` | Quita precios de la sección de planes en la landing pública. Cambio chico y aislado (1 archivo). |
| **PR #13** | `origin/fix/safari-mac` | `main` | Correcciones visuales en Safari/Mac + clic en tarjeta de usuario abre panel lateral de cuenta. |
| **PR #14** | `origin/feat/directorio-diseno` | `main` | Rediseño del Directorio profesional con tarjeta clicable y ficha completa. |
| **PR #15** | `origin/feat/directorio-perfil-documentos` | `feat/directorio-diseno` | **Apilado sobre PR #14** (mergear #14 primero, luego cambiar base de #15 a `main`). Página propia del perfil con documentos y miniaturas reales. |
| **PR #12** | `origin/feat/academia` | `main` | Nuevo módulo **Academia** (cursos interactivos por texto + bloques visuales: *Anatomía dental* 14 módulos y *Caries dental* 12 módulos). |

### 3.3 Ramas locales adicionales respaldadas en `origin` para el cambio de equipo
Para garantizar que ningún prototipo o rama local del equipo anterior se pierda, también se subieron a `origin`:
- `origin/feat/directorio-tonos` (`6f5927e`) — Variante del Directorio donde cada tarjeta de profesional tiene su propio tono de color.
- `origin/fix/quitar-cargador-inicial` (`d0a146e`) — Quita el cargador inicial vacío en `index.html` / `src/main.ts`.
- `origin/proto/cursos-en-vivo` (`d14a116`) — Prototipo local de la sección «Cursos en vivo» (modo demo).
- `origin/backup/vista-completa-20261016` (`377efe0`) — Respaldo exacto de la rama local `local/vista-completa` que integraba todos los PRs para previsualización local.
- `origin/feat/herramientas-pro` (`ec6f5f9`) — Sincronizada con el último commit local.
- `origin/perf/arranque-cache-directorio` (`0649ccc`) — Optimizaciones de caché de verificación de token en API, compresión y carga en paralelo.

---

## 4. Verificación ejecutada antes de cerrar en este equipo (2026-10-16)

```text
npm run audit:class-games (raíz)   PASS (18 cursos, 77/77 clases listas; rompecabezas: 18, sopa: 15, ahorcado: 14, memorama: 15, palabra: 15)
npm run build (raíz)               PASS (tsc && vite build sin errores)
npm run check (api/)               PASS
npm test (api/)                    PASS (176 pruebas; 175 pass; 0 fail; 1 skip intencional de rules)
```

---

## 5. Qué hacer al abrir el proyecto en el equipo nuevo

1. Clonar y levantar `feat/juegos-cierre-clase` con los comandos de la **Sección 1**.
2. Si ya generaste las **18 imágenes `3:4`** de `docs/prompts-rompecabezas-3x4.md`, pásaselas al agente para que las guarde en `public/cursos/rompecabezas/curso-XX-clase-YY.webp` y las conecte en `resolverImagenClase` dentro de `src/core/juego-clase.ts`.
3. Cuando estés conforme con los juegos en `feat/juegos-cierre-clase`, abrir su PR hacia `main` y continuar con el merge ordenado de los PRs abiertos (`#17` → `#13` → `#14` → `#15` → `#12`).
