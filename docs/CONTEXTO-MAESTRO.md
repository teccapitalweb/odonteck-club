# Contexto maestro · OdonTeck Club

> Documento de relevo para continuar el desarrollo sin confundir una experiencia visual terminada con una integración de producción terminada. Debe leerse completo antes de modificar el proyecto.

- **Actualizado:** 24 de septiembre de 2026
- **Repositorio definitivo:** `https://github.com/teccapitalweb/odonteck-club.git`
- **Rama:** `main`
- **Commit auditado al redactar:** `b195b06` (`feat: mostrar duración total en tarjetas del catálogo`)
- **Estado verificado:** frontend compila; API pasa 79 pruebas, 0 fallos y omite 1 prueba de reglas por requerir emuladores.

Antes de crear este relevo ya existían cambios locales sin seguimiento:

```text
.claude/launch.json
docs/prompts-hero-carrusel-v2.md
docs/prompts-hero-carrusel.md
docs/prompts-hero-expand.md
docs/prompts-portadas-libros.md
public/libros/
```

Son trabajo previo del usuario. Deben conservarse intactos hasta revisarlos y decidir explícitamente si se versionan.

## 1. Qué producto es

OdonTeck Club es una plataforma de formación para odontólogos: landing, autenticación, cursos grabados, biblioteca clínica, quizzes, casos, comunidad, sesiones en vivo, certificados, membresía y panel administrativo. Se reconstruyó como un proyecto Vite nuevo que debe convivir temporalmente con la infraestructura y los datos del club anterior.

Este repositorio pertenece únicamente a OdonTeck. Visión Pecuaria y Agrotec América tienen sus propios repositorios, reglas y datos.

## 2. Estado real resumido

### Lo que está construido visual y funcionalmente en demo

- Landing pública con carrusel de tres portadas, catálogo, beneficios, planes, FAQ y llamadas a registro.
- Login por correo, Google, registro y recuperación mediante Firebase cuando existe API.
- Inicio, catálogo, ficha de curso y reproductor de clase.
- Biblioteca de materiales y libros.
- Sesiones en vivo y reservas.
- Comunidad con temas, respuestas y reacciones.
- Retos con Quiz Relámpago, flashcards, repetición espaciada y casos clínicos.
- Logros, progreso y certificados.
- Perfil, configuración, suscripción y promoción de Praxia.
- PWA con manifest, service worker, iconos y acceso de instalación.
- Panel admin completo a nivel de pantallas: resumen, cursos, quizzes, materiales, en vivo, miembros, comunidad, avisos y ajustes.

### Lo que sí está implementado en la API

- Firebase Auth y verificación de tokens revocados.
- Membresía heredada, suscripciones nuevas, cortesías y claim admin.
- Catálogo seguro sin `videoId` para miembros.
- Video firmado de Bunny.
- Progreso secuencial y certificados idempotentes.
- Verificación pública de certificados.
- Descargas firmadas de Storage.
- Quizzes aprobados y calificación en servidor.
- Foro, respuestas y reacciones.
- Eventos y reservas.
- Stripe checkout, portal y webhook.
- CRUD administrativo y autorización por custom claim.

### Brecha principal

La API está mucho más completa que su integración con el frontend. En este momento `src/core/datos.ts`, `src/core/progreso.ts`, `src/core/perfil.ts`, `src/core/comunidad.ts`, el panel admin y partes de quizzes/certificados siguen usando `localStorage` y semillas JSON.

En modo API el frontend utiliza principalmente:

- `/me` para conocer identidad, VIP y admin;
- `/video/token` para reproducir Bunny;
- `/progreso/:cursoId/vista` al marcar una clase;
- `/stripe/checkout` y `/stripe/portal`.

No existe todavía una capa equivalente a la integración remota completa de Visión Pecuaria. Por ello no debe publicarse como “100 % conectado” hasta completar y probar la hidratación remota.

## 3. Arquitectura

### Frontend

- Vite + TypeScript sin framework de componentes.
- Entrada del club: `index.html` y `src/main.ts`.
- Entrada de landing: `landing/index.html` y `src/landing/main.ts`.
- Router por hash en `src/core/router.ts`.
- Componentes por funciones HTML y eventos globales.
- Datos demo en `src/data/*.json` y `localStorage`.
- Estilos por área en `src/styles/`.

Rutas de miembro:

```text
#/                         #/cursos
#/curso/:id               #/curso/:id/clase/:n
#/materiales              #/materiales/:id
#/en-vivo                 #/comunidad
#/comunidad/:id           #/retos
#/logros                   #/certificados
#/certificados/:id        #/praxia
#/perfil                  #/suscripcion
#/configuracion           #/mas
```

Rutas admin:

```text
#/admin                    #/admin/cursos
#/admin/cursos/:id        #/admin/quizzes
#/admin/quizzes/:cursoId/:n
#/admin/materiales        #/admin/materiales/:id
#/admin/en-vivo           #/admin/en-vivo/:id
#/admin/miembros          #/admin/miembros/:uid
#/admin/comunidad         #/admin/avisos
#/admin/ajustes
```

Falta una ruta frontend pública `#/verificar/:folio`, aunque la API sí implementa la verificación y el certificado muestra un enlace conceptual. Esto es un pendiente de producción.

### Backend

- Express en `api/`, preparado para Railway.
- Firebase Admin para Auth, Firestore y Storage.
- Bunny Stream para videos firmados.
- Stripe para membresías.
- Contrato de datos y endpoints en [`contrato.md`](contrato.md).
- Reglas en `api/firestore.rules` y `api/storage.rules`.

### Modos

- Con `VITE_API_URL`: Firebase Auth y algunas operaciones reales.
- Sin `VITE_API_URL`: demo completo con `localStorage`.

Al momento de esta auditoría no hay `.env` ni `.env.production` local en la raíz. Por tanto, `npm run dev` arranca en modo demo. No agregar una URL de API sin verificar primero el servicio Railway correcto, CORS y el dominio final.

## 4. Inventario de contenido versionado

| Recurso | Cantidad | Estado |
|---|---:|---|
| Cursos | 18 | la semilla no fija `publicado`; el normalizador los considera publicados |
| Clases | 77 | entre 3 y 5 por curso |
| Materiales | 26 | todos marcados disponibles |
| Libros | 17 | incluidos dentro de los 26 materiales |
| PDFs | 8 | incluidos dentro de los 26 materiales |
| Presentaciones | 1 | incluida dentro de los 26 materiales |
| Quizzes | 68 | cuatro preguntas por registro en la mayoría de la semilla |
| Casos clínicos | 12 | usados por los retos |
| Eventos locales | 0 | producción puede diferir |

Las portadas finales de cursos conviven con portadas numeradas antiguas en `public/cursos/`. No borrar activos por nombre sin buscar todas sus referencias.

`public/libros/` está actualmente sin seguimiento. Antes de añadirlo a Git hay que revisar autoría, licencias, tamaño, nombres y si contiene libros completos protegidos por derechos de autor. No asumir que tener el archivo local autoriza su distribución pública.

## 5. Reglas comerciales y contradicciones por resolver

### Clases gratuitas

La intención pública dominante es **la primera clase de cada curso gratis**:

- la landing lo repite en varias secciones;
- `src/data/catalogo.json` marca únicamente la clase 1 de cada curso como `gratis: true`;
- la API usa el campo `gratis` y sus pruebas validan esa regla.

Sin embargo, `src/core/acceso.ts` permite en el primer curso todas las clases excepto la última. Esto contradice la landing, las semillas y el backend. Debe elegirse una regla comercial única y actualizar frontend, backend, datos, textos y pruebas de forma coordinada. Hasta entonces, la API debe considerarse la autoridad de seguridad.

### Material gratuito

El cliente trata el primer material como gratuito. La API actual exige VIP para cualquier descarga firmada. Esto también debe resolverse antes de producción: o la API permite explícitamente el primer material, o la UI deja de anunciarlo como accesible.

### Comunidad y retos

- Comunidad se puede leer gratis; publicar, responder y reaccionar requiere VIP.
- Quiz Relámpago gratuito se limita a tres preguntas.
- Solo el primer caso clínico es gratuito.
- El desbloqueo de clases es secuencial.

### Acceso VIP

La API reconoce VIP por:

1. documento heredado vigente en `miembros/{uid}`;
2. suscripción Stripe nueva vigente;
3. cortesía vigente en `v2_cortesias/{uid}`;
4. custom claim `admin`.

No existe todavía el sistema de cupones cortos creado posteriormente para Visión Pecuaria. Añadirlo sería una función nueva, no algo ya presente.

## 6. Integraciones que faltan en el frontend

Ordenadas por prioridad:

1. **Carga inicial real:** solicitar `/catalogo`, `/progreso`, `/certificados` y `/me`, y poblar un almacén remoto coherente antes de renderizar.
2. **Panel admin real:** sustituir mutaciones de `localStorage` por endpoints `/admin/*`, incluidos uploads firmados.
3. **Quizzes seguros:** obtener preguntas desde `/quiz/:cursoId/:n` y enviar respuestas al backend. No calificar con respuestas correctas incluidas en el bundle de producción.
4. **Comunidad real:** usar `/foro`, respuestas y útil; no guardar actividad real en `localStorage`.
5. **Perfil real:** usar `PATCH /me/perfil` y reflejar el perfil remoto.
6. **Progreso real:** cargarlo al iniciar y usar `/abrir` además de `/vista`; fusionar una sola vez el avance demo anterior si se decide migrarlo.
7. **Certificados reales:** listar desde la API y agregar la ruta pública de verificación.
8. **Materiales seguros:** obtener la URL temporal desde `/materiales/:id/descarga`, respetando la regla comercial acordada.
9. **Eventos reales:** cargar eventos remotos y reservar mediante la API.
10. **Avisos/config real:** hidratar desde backend y evitar que el admin aparente guardar cuando solo modifica el navegador.

Estas integraciones deben desarrollarse con estados de carga, error, sesión vencida y reintento. No dejar que las semillas oculten fallos de la API en producción.

## 7. Seguridad y datos

- El navegador nunca debe recibir `videoId` ni llaves de Bunny para contenido protegido.
- Las respuestas correctas de quizzes no deben incluirse en la respuesta GET para miembros.
- Progreso, certificados y membresías deben validarse en servidor.
- Admin real: custom claim `admin: true`; no listas de correos.
- Las colecciones nuevas usan `v2_`; `miembros/{uid}` se lee por compatibilidad.
- No modificar el webhook viejo de Stripe hasta validar completamente el nuevo.
- Verificar CORS contra el dominio final antes de activar `VITE_API_URL`.
- No incluir información identificable de pacientes en comunidad, ejemplos, capturas o datos de prueba.

## 8. Landing e identidad visual

La landing actual incluye:

- carrusel hero con `hero-cirujano.webp`, `hero-consulta.webp` y `hero-instrumental.webp`;
- propuesta de valor, beneficios y funcionamiento;
- ocho cursos destacados cargados desde la semilla;
- bloque del club, Praxia, certificación, planes, opiniones y FAQ;
- enlaces de registro, WhatsApp e Instagram.

Dirección visual: azul marino, crema, turquesa y acentos cálidos; fotografía clínica profesional y humana; consultorios creíbles; odontólogos y pacientes representados con dignidad. Evitar sonrisas artificiales, procedimientos incorrectos, anatomía dental errónea, manos deformes, instrumental imposible y estética plástica de IA.

Los archivos de prompts actualmente sin seguimiento pertenecen al usuario. Revisarlos antes de crear un estándar nuevo o consolidarlos.

## 9. Praxia

Praxia sí pertenece al ecosistema de OdonTeck. Tiene ruta `#/praxia`, promoción dentro del club y URL configurable. No aplicar aquí la decisión de eliminar Praxia que se tomó para Visión Pecuaria.

Antes de cambiar la URL, confirmar el destino real. En la landing hay una transformación que reemplaza `odonteck-club` por `odonteck-landing`; revisar su necesidad antes de refactorizar.

## 10. Pipeline de contenido

El pipeline de `scripts/pipeline/` contempla:

1. inventario de Bunny;
2. transcripción automática;
3. descarga de VTT y conversión;
4. generación de notas, títulos y quizzes;
5. publicación como borrador en Firestore;
6. revisión humana obligatoria en admin;
7. migración de certificados anteriores.

El contenido odontológico puede afectar decisiones clínicas. Ningún quiz, protocolo o resumen generado debe aprobarse automáticamente sin revisión profesional.

## 11. Estado de calidad comprobado

Ejecutado el 24 de septiembre de 2026:

```text
npm run build       PASS
api/npm run check   PASS
api/npm test        PASS: 80 pruebas totales, 79 aprobadas, 0 fallos, 1 omitida
```

Fue necesario ejecutar `npm ci` en `api/` porque faltaban localmente `stripe` y `supertest`; ambas dependencias ya estaban declaradas en `api/package.json` y `api/package-lock.json`.

La prueba omitida es la de reglas Firestore/Storage. Ejecutar con emuladores:

```bash
cd api
npm run test:rules
```

Advertencias del build:

- `vite.config.ts` usa `__dirname`, que Vite advierte como incompatible con el futuro `configLoader: native`; migrar a `import.meta.dirname`.
- El chunk de datos supera 500 kB; conviene dividir carga de catálogos/quizzes y evitar incluir respuestas en el bundle de producción.

## 12. Pendientes priorizados

1. Acordar y unificar las reglas de clase y material gratuitos.
2. Crear la capa remota del frontend y completar hidratación inicial.
3. Conectar el panel admin a los endpoints reales.
4. Sacar quizzes, comunidad, perfil, progreso y certificados reales de `localStorage`.
5. Agregar verificación pública de certificados en frontend.
6. Configurar y probar el entorno de producción real sin tocar el club anterior prematuramente.
7. Ejecutar pruebas de reglas con emuladores.
8. Auditar libros locales por licencias y distribución.
9. Revisar accesibilidad, móvil, estados de carga/error y funcionamiento PWA.
10. Mejorar rendimiento y compatibilidad futura de Vite.

## 13. Orden recomendado para Claude

1. Leer este documento y `docs/contrato.md`.
2. Revisar `git status` y preservar los archivos sin seguimiento.
3. Levantar el demo en el puerto 5173 y recorrer miembro y admin.
4. No implementar inmediatamente: primero presentar al usuario la contradicción freemium y confirmar la regla definitiva.
5. Implementar la integración remota por bloques pequeños, comenzando por bootstrap de datos y lectura.
6. Después conectar mutaciones de miembro y, finalmente, administración.
7. En cada bloque ejecutar build, pruebas API y revisión en móvil.
8. Actualizar este documento cuando cambie el estado de integración.

## 14. Comandos

Frontend:

```bash
npm install
npm run dev -- --host 127.0.0.1 --port 5173
npm run build
```

API:

```bash
cd api
npm ci
npm run dev
npm run check
npm test
npm run test:rules
```

La configuración local de Claude ya usa el puerto 5173. No sobrescribir `.claude/launch.json` sin necesidad.

## 15. Criterio para declarar producción lista

OdonTeck no está listo únicamente porque compile o se vea completo. Para declararlo listo deben cumplirse, como mínimo:

- frontend y admin leen/escriben mediante API real;
- regla freemium única y probada en cliente y servidor;
- cuenta gratuita, VIP y admin verificadas de extremo a extremo;
- videos, progreso, quiz, certificado y material probados;
- Stripe probado en modo de prueba y estrategia de cambio definida;
- reglas Firebase probadas y fusionadas con las vigentes;
- libros y materiales con derecho de distribución;
- dominio, CORS, Auth y PWA verificados en móvil;
- sin secretos ni datos de pacientes en cliente, logs o repositorio;
- rollback documentado antes del cambio definitivo.
