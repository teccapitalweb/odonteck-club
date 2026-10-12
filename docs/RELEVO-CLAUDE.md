# Relevo operativo para Claude · OdonTeck Club

> Lee este archivo antes de trabajar. Es el corte corto y vigente; `CONTEXTO-MAESTRO.md` conserva el detalle histórico y `contrato.md` define datos y endpoints.

## 1. Fuente de verdad

- Repositorio: `https://github.com/teccapitalweb/odonteck-club.git`
- Rama: `main`
- Corte funcional verificado antes de este relevo: `225ded8`
- Dominio: `https://www.odonteckconsulting.com/`
- Cloudflare Pages: proyecto `odonteck-club`, despliegue funcional `8e404a77-4afa-4cce-9a09-700d21cb9c6f`
- API: `https://api-production-db314.up.railway.app`
- Railway: proyecto `odonteck-club-v2`, servicio `api`, despliegue funcional `6c9283b5-0d0d-4c6f-9578-85cded5e1b87` (`SUCCESS`)

Un commit posterior que sólo cambie documentación no implica un runtime distinto. Verifica siempre Git, Cloudflare y Railway por separado.

## 2. No tocar ni mezclar

- No mezclar OdonTeck con Élite/Visión Pecuaria, Agrotec América u otros productos. Sólo pueden usarse como referencia visual o de comportamiento.
- No exponer `.env`, service accounts, llaves Bunny/Stripe/Firebase ni datos personales.
- No modificar pagos, webhooks, membresías heredadas, DNS, reglas o producción sin autorización explícita y verificación previa.
- No subir `public/libros/`: requiere auditoría de autoría, licencias y tamaño.
- Preservar estos archivos locales sin seguimiento:

```text
.claude/
docs/prompts-hero-carrusel-v2.md
docs/prompts-hero-carrusel.md
docs/prompts-hero-expand.md
docs/prompts-portadas-libros.md
public/fotos/inicio-aurora-odontologia-v1.png
public/libros/
```

## 3. Estado real del producto

Publicado y conectado en modo API:

- autenticación, identidad/foto de Google y membresía heredada;
- catálogo, cursos, videos firmados, progreso secuencial, quizzes y certificados;
- materiales privados con lector PDF.js;
- Recompensas, puntos, canjes, logros y notificaciones;
- Retos V2 respaldado por API para quiz relámpago/práctica;
- Comunidad visual respaldada por `/foro`;
- entrevista inicial, encuestas posteriores e intereses editables;
- landing y Alexia Concierge;
- perfil, sesiones/eventos y panel admin cableado a `/admin/*`.
- evaluaciones v2 con autoría administrativa y calificación de selección, selección múltiple, ordenar, relacionar y completar; las soluciones se conservan en servidor. En la clase, el miembro ve un reto guiado paso a paso con descarte de distractores, bitácora privada, confianza obligatoria, calibración posterior, feedback por pregunta, puntaje visual y ordenamiento accesible mediante controles subir/bajar. La metacognición no cambia el puntaje;
- pestaña de ficha por clase y descarga privada firmada cuando la ficha está aprobada. Aún no hay fichas clínicas aprobadas: no confundir infraestructura lista con contenido revisado.

Demo local sin `VITE_API_URL`:

- usa semillas y `localStorage` intencionalmente;
- puede contener ranking, publicaciones editoriales, casos o flashcards que aún no son datos remotos;
- sirve para diseño, no como prueba de producción.

## 4. Materiales y lector

Archivos principales:

- `src/pages/visor.ts`
- `src/styles/visor.css`
- `src/main.ts`
- `api/src/lib/recompensas.js`
- ruta API `GET /materiales/:id/descarga`

Cadena de acceso:

1. El usuario abre `#/materiales/:id/visor`.
2. El cliente pide `/materiales/:id/descarga` con Firebase ID token.
3. La API vuelve a validar material gratuito, VIP o desbloqueo permanente.
4. Si procede, entrega una URL HMAC con vigencia de 10 minutos.
5. El cliente descarga el PDF en memoria y PDF.js lo renderiza en `canvas`.

El build de producción se comprobó con 0 PDF y 0 directorios `libros`. No convertir las páginas a imágenes públicas ni persistir la URL firmada.

Comportamiento verificado: dos páginas en escritorio, una en móvil, zoom, arrastre, swipe, teclado, pantalla completa, salto, reanudación y bloqueo correcto cuando faltan puntos.

## 5. Economía de puntos

| Acción | Puntos |
|---|---:|
| Ver una clase | 10 |
| Completar un curso | 50 |
| Aprobar un quiz | 20 |
| Respuesta correcta en Retos | 10 |
| Intento en Retos | 2 |
| Entrevista de bienvenida | 25 |
| Encuesta de curso | 20 |
| Encuesta de experiencia | 40 |
| Crear tema en Comunidad | 10 |
| Responder en Comunidad | 5 |
| Membresía confirmada | 300 |

Los movimientos usan claves idempotentes en `v2_recompensas_movimientos`. La sincronización inicial reconoce la actividad histórica; no dupliques recompensas por reintento, recarga o migración.

### Canjes vigentes

- Atlas ICDAS: gratuito.
- Guía de diagnóstico ortodóncico: 250.
- Consentimiento informado: 300.
- Tabla de dosis: 350.
- Plantilla de nota/receta: 400.
- Protocolo de abscesos: 450.
- Guía de materiales: 500.
- Checklist de urgencias pediátricas: 500.
- Guía de endodoncia: 550.
- Manual de resinas: 600.
- Praxia 30 días: 1500; crea una solicitud `pendiente`, no una activación automática.

VIP conserva acceso a los nueve materiales premium sin consumir puntos. Un canje de material es permanente.

## 6. Logros y avisos

La API devuelve `recompensas` al completar acciones. `src/main.ts` dispara `recompensas:ganadas`, muestra un toast de puntos y un toast por cada logro nuevo. La API guarda los avisos en `v2_recompensas_estado.notificaciones`; la campana muestra el total no leído y los marca al abrirla.

Logros actuales:

- Primer paso: 1 clase.
- En marcha: 5 clases.
- Primer certificado: 1 curso.
- Mente clínica: 3 quizzes.
- Retador constante: 100 puntos de Retos.
- Voz de comunidad: primer tema.
- Especialista: 3 cursos.
- Maestro: 10 cursos.
- Miembro del club: membresía pagada.

No recrear estos avisos sólo en el cliente: el servidor y la idempotencia son la fuente de verdad.

## 7. Verificación del corte

Comprobado el 9 de octubre de 2026:

```text
build frontend de producción       PASS
api npm run check                  PASS
api npm test                       115 totales; 114 pass; 0 fail; 1 skip
npm audit                          0 vulnerabilidades
dist                               0 PDF; 0 libros
visor móvil/escritorio             PASS; sin errores de consola
dominio oficial                    HTTP 200
API /health                        HTTP 200
```

La prueba omitida requiere emuladores Firestore/Storage. No afirmar que las reglas están validadas en producción hasta completar `npm run test:rules` en un entorno donde los emuladores puedan abrir puertos.

## 8. Pendientes reales, por prioridad

1. Smoke autenticado del panel admin con custom claim `admin: true`, incluido upload firmado cuando Storage exista.
2. Configurar y validar `STRIPE_WEBHOOK_SECRET` en v2 antes de habilitar checkout nuevo. Mientras tanto, conservar el flujo anterior y los beneficios heredados.
3. Ejecutar pruebas de reglas Firestore/Storage con emuladores.
4. Implementar liga real sólo con endpoint, consentimiento y reglas de privacidad; no mostrar odontólogos ficticios en producción.
5. Habilitar Storage para futuras cargas administradas; no es necesario para los diez PDF empaquetados actuales.
6. Auditar licencias antes de publicar nuevos libros/materiales.
7. Resolver accesibilidad pendiente y dividir el chunk grande del build demo.
8. Migrar los 68 quizzes aprobados y regenerar/revisar el catálogo completo con el formato avanzado de 5 interacciones por clase. El pipeline ya exige evidencia `mm:ss` y diversidad (`seleccion`, `seleccion_multiple`, `ordenar`, `relacionar`, `completar`), pero `scripts/pipeline/out/` aún no existe y el entorno local no tiene llaves Bunny/Anthropic: no afirmar que los 77 videos fueron analizados. También faltan revisión odontológica y las 77 fichas PDF/Storage.
9. El reproductor carga la API oficial Player.js de Bunny: al emitir `ended`, registra la vista una sola vez y abre el quiz de la clase. El botón “Finalizar y abrir reto” cubre bloqueadores de red/script y accesibilidad.

## 9. Flujo seguro de trabajo

```powershell
git status --short --branch
$env:VITE_API_URL='https://api-production-db314.up.railway.app'
npm run build
Remove-Item Env:VITE_API_URL
Set-Location api
npm run check
npm test
```

Para diseño local puede usarse:

```powershell
npm run dev -- --host 127.0.0.1 --port 5173
```

Antes de afirmar que algo está en producción, comprobar el commit fuente, el despliegue de Cloudflare, el despliegue `SUCCESS` de Railway y un smoke del dominio/API. Un build local no basta.

## 10. Documentos que deben mantenerse juntos

- `CLAUDE.md`: reglas de entrada.
- `docs/RELEVO-CLAUDE.md`: corte operativo vigente.
- `docs/CONTEXTO-MAESTRO.md`: contexto completo, historia y decisiones.
- `docs/contrato.md`: esquema y contrato API.
- `scripts/pipeline/README.md`: contenido, transcripciones y revisión clínica.

Si una implementación cambia producción, reglas comerciales, puntos, logros, rutas, seguridad o pendientes, actualiza estos documentos en el mismo commit.
