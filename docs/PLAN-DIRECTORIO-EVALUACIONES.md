# OdonTeck Club · Directorio, evaluaciones interactivas y fichas por clase

Estado: directorio implementado en local. El motor v2, el editor administrativo, la validación API y el demo ya soportan selección, selección múltiple, ordenar, relacionar y completar con compatibilidad hacia atrás. La clase ya muestra una pestaña de ficha con estado honesto y la API firma el PDF privado solo cuando está aprobado. El piloto de Ortodoncia tiene revisión editorial y matriz de 25 actividades en `docs/REVISION-CLINICA-PILOTO-ORTODONCIA.md`; falta la firma de un odontólogo u ortodoncista, migrar/autorizar el contenido clínico restante y producir las demás fichas. No publicar contenido clínico generado sin revisión odontológica.

## 1. Directorio profesional como módulo principal

### Objetivo

Crear networking útil sin convertir el Club en una bolsa de spam ni exponer datos personales. El miembro elige participar, publica un perfil profesional, explora personas y oportunidades y envía una solicitud privada. El correo o WhatsApp solo se comparte si la persona destinataria acepta.

### Flujo implementado

1. Navegación principal → Directorio (`#/directorio`). La URL anterior `#/comunidad?tab=directorio` redirige para conservar enlaces guardados.
2. Personas, Oportunidades y Mis conexiones.
3. Búsqueda por nombre, especialidad, habilidad, ciudad u organización.
4. Perfil opt-in tipo CV con foto, portada, etapa, especialidades, habilidades, idiomas, años de experiencia, presentación, experiencia laboral, formación, credenciales, disponibilidad y modalidad. La vista pública usa una cabecera visual, métricas y línea de tiempo; los perfiles anteriores siguen siendo válidos aunque no tengan los campos nuevos.
5. Oportunidades con vigencia de 45 días; publicarlas requiere VIP, explorarlas y conectar no.
6. Solicitudes privadas con estado pendiente, aceptada o rechazada.
7. Contacto oculto en toda respuesta pública y revelado únicamente después de aceptar.

No se otorgan puntos por enviar solicitudes o publicar oportunidades: así se evita incentivar spam.

### Endurecimiento local para apertura masiva

- Paginación por cursor estable para perfiles y oportunidades; el cliente sólo agrega la página pedida.
- Perfil ocultable y eliminable. Al eliminarlo se cierran oportunidades propias, se rechazan solicitudes pendientes y se retira la foto.
- Máximo de tres oportunidades activas por autor y cierre explícito desde la interfaz.
- Solicitudes idempotentes por remitente/destinatario/oportunidad, máximo de diez cada 24 horas y espera de 30 días tras un rechazo.
- Oportunidades vencidas no aceptan nuevas conexiones.
- Denuncia privada de perfiles y oportunidades, máximo de diez al día, con bandeja administrativa para ocultar/cerrar o descartar.
- El cliente declara el tamaño de la foto y la portada para firmar la subida, pero la API vuelve a comprobar en Storage que los objetos reales sean WebP y no excedan 2 MB y 3 MB respectivamente. Las rutas están fijadas por UID y la escritura directa desde el navegador sigue denegada.
- Reglas del cliente niegan acceso directo a denuncias e índices compuestos quedan descritos en `api/firestore.indexes.json`.

Este endurecimiento está implementado y probado **sólo en local**. Antes de abrirlo en producción faltan desplegar reglas e índices, ejecutar `npm run test:rules` en un host donde el emulador Firestore pueda abrir loopback y hacer un smoke autenticado con miembro y administrador reales.

## 2. Principios de las nuevas evaluaciones

El objetivo no es agregar minijuegos decorativos. Cada interacción debe medir una habilidad concreta y dar retroalimentación explicativa inmediata.

- Recuperación activa frecuente y de bajo riesgo.
- Casos clínicos breves, decisión y justificación, no solo memoria literal.
- Retroalimentación con razonamiento: por qué una opción funciona y por qué las demás no.
- Accesibilidad: cualquier arrastre tendrá alternativa por clic/selección y teclado; los objetivos táctiles respetarán WCAG 2.2.
- Calificación en servidor. El navegador nunca recibe respuestas ni reglas de puntuación antes de enviar.
- Contenido basado en la transcripción revisada y referencias aprobadas; nada clínico se inventa.

### Tipos de interacción v2

| Tipo | Habilidad | Respuesta del miembro | Calificación |
|---|---|---|---|
| `seleccion` | Discriminar una opción | ID de opción | Exacta |
| `seleccion_multiple` | Reconocer un conjunto | IDs seleccionados | Parcial con penalización controlada |
| `ordenar` | Secuenciar un protocolo | Lista ordenada de IDs | Parcial por posiciones/pares correctos |
| `relacionar` | Asociar conceptos | Pares de IDs | Parcial por parejas |
| `completar` | Recuperar términos | Valores por hueco | Normalizada contra alias revisados |
| `respuesta_corta` | Explicar un criterio | Texto breve | Alias/rúbrica; revisión humana si no es cerrada |
| `caso_clinico` | Tomar decisiones | Ruta de decisiones | Puntos por decisión y retroalimentación por nodo |
| `zona_imagen` | Identificación visual | Región elegida | Solo con imagen licenciada y alternativa accesible |

Retos utilizará únicamente preguntas marcadas `compatibleRetos`; la evaluación de clase podrá usar todos los tipos. La respuesta corta abierta nunca será aprobada automáticamente por un modelo sin una rúbrica validada.

### Contrato propuesto

Cada pregunta será una unión discriminada con: `id`, `tipo`, `enunciado`, `instruccion`, `objetivo`, `dificultad`, `explicacion`, `fuentes`, `compatibleRetos`, `configPublica` y `calificacionPrivada`. GET elimina por completo `calificacionPrivada`; POST recibe respuestas tipadas y devuelve puntuación, retroalimentación y desglose.

La migración conservará las preguntas actuales convirtiéndolas a `tipo: seleccion`. Se versionarán quiz e intentos para que los historiales anteriores sigan contando para logros y recompensas.

## 3. Una ficha PDF por cada clase

La garantía “cada clase” se resolverá con cobertura verificable, no con una promesa visual. Cada curso/clase tendrá un paquete de aprendizaje:

- transcripción o fuente revisada;
- objetivos de aprendizaje;
- resumen de una página;
- conceptos y timestamps;
- perlas clínicas y datos curiosos únicamente si están respaldados;
- checklist o algoritmo breve;
- mini caso o preguntas de recuperación;
- referencias, versión, fecha de revisión y responsable clínico;
- PDF privado descargable y vínculo de regreso a la clase.

El pipeline trabajará en `dry-run` por defecto: inventario → transcripción → borrador → validación automática → revisión clínica → PDF → publicación privada. Una clase no podrá figurar como “paquete completo” hasta tener transcripción, quiz aprobado y PDF aprobado. El panel mostrará una matriz de cobertura `77/77` para quiz, PDF y revisión.

Cada quiz generado tendrá cinco interacciones distintas —selección clínica, selección múltiple, secuencia, relación y completar— y una marca `mm:ss` verificable contra la transcripción. Al concluir el video, Bunny Player.js registra el evento `ended`, marca la clase de forma idempotente y abre el reto; el botón “Finalizar y abrir reto” queda como respaldo accesible.

## 4. Entregas seguras

1. Directorio local completo, pruebas de privacidad, anti-spam, moderación, paginación y responsive. **Implementado en local; no desplegado.**
2. Esquema v2 + calificadores puros y pruebas unitarias para selección múltiple, ordenar, relacionar y completar. **Implementado en local.**
3. Render accesible de cada interacción en una clase demo, con teclado y alternativa por selección, más autoría de los cinco tipos en admin. **Implementado en local.** La experiencia de miembro usa un reto guiado de una pregunta por paso, progreso visible, descarte de distractores, bitácora privada de razonamiento, confianza obligatoria, calibración posterior, revisión por pregunta y resultado porcentual. La API conserva un historial acotado y versionado de respuestas, confianza, bitácora, mejor puntuación y aprobación previa; la confianza y la bitácora no alteran el puntaje clínico. Modificar preguntas devuelve el contenido a borrador salvo aprobación explícita. Ordenar usa tarjetas con botones subir/bajar para no depender de arrastrar. Falta migrar contenido aprobado para ver estas variantes en las 68 evaluaciones existentes.
4. Adaptación de Retos al banco v2 sin romper XP, intentos ni logros previos. **Implementado en local.** El modo práctica sirve y califica selección múltiple, ordenar, relacionar y completar; el modo relámpago conserva únicamente selección por su límite de tiempo. `compatibleRetos: false` excluye una pregunta. La API entrega sólo configuración pública y devuelve solución, puntaje parcial y explicación después del intento.
5. Generador de fichas, validador de cobertura y un solo curso piloto. La ruta privada, el estado de UI y el auditor de cobertura ya existen; faltan las fuentes del piloto y la plantilla final.
6. Revisión odontológica del piloto. La revisión editorial y el formato de firma ya están listos; falta que un odontólogo u ortodoncista contraste los cinco videos, 25 actividades y cinco fichas y autorice la versión.
7. Procesamiento de las 77 clases, carga privada y comprobación de cobertura total.

Bloqueos reales antes de los pasos 5–7: transcripciones/fuentes disponibles, aprobación del costo si se usa el modelo del pipeline, almacenamiento privado operativo y una persona odontóloga responsable de la revisión.

## 5. Investigación aplicada

- 1EdTech QTI 3: taxonomía y estructura de choice, order, associate, match, gap-match, text entry y graphic interactions.
- H5P: patrones de interactive video, branching scenario y drag the words como referencia de experiencia, sin incorporar el runtime completo por ahora.
- WCAG 2.2: alternativa de puntero simple para cualquier gesto de arrastre y tamaño/espaciado suficiente de objetivos táctiles.
- Evidencia de educación en salud: recuperación activa frecuente, casos y retroalimentación con explicación mejoran retención y desempeño; por eso el sistema prioriza práctica espaciada y feedback razonado.

Fuentes primarias/oficiales:

- https://www.1edtech.org/standards/qti/index
- https://developers.imsglobal.org/spec/qti/v3p0/guide
- https://h5p.org/documentation/for-authors/tutorials
- https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/
- https://www.w3.org/WAI/WCAG22/Techniques/general/G219
- https://pmc.ncbi.nlm.nih.gov/articles/PMC4404460/
- https://pmc.ncbi.nlm.nih.gov/articles/PMC6104310/
- https://pubmed.ncbi.nlm.nih.gov/30043313/
- https://pubmed.ncbi.nlm.nih.gov/32384885/
- https://pubmed.ncbi.nlm.nih.gov/39544578/
