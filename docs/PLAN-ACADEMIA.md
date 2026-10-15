# Plan · Academia OdonTeck

Propuesta del 15 de octubre de 2026 para un nuevo apartado de OdonTeck Club: programas de lectura guiada por módulos, al estilo de Cisco Networking Academy, sobre odontología. Replica el lector ya construido en la Academia de Visión Pecuaria, con el mismo esquema de datos, adaptado al dominio dental. Este documento define el propósito, las reglas y el catálogo aprobado por el propietario.

Documentos hermanos:

- [`ACADEMIA-FORMATO.md`](ACADEMIA-FORMATO.md): formato JSON de cada módulo y estándar editorial.
- [`ACADEMIA-BRIEF-AGENTES.md`](ACADEMIA-BRIEF-AGENTES.md): instrucciones para los agentes que redactan contenido.
- `api/content/academia/catalogo.json`: catálogo de programas, coherente con la sección 6 de este plan.

---

## 1. Qué es y para quién

**Academia** es el apartado de lectura guiada de OdonTeck Club. Cada «curso largo» se llama **programa**.

- **Cursos** sigue siendo lo que ya existe: clases en video.
- **Academia** es lo nuevo: programas de lectura con figuras, diagramas, actividades, minijuegos y exámenes por módulo.
- «Programa» evita confundirlos con los cursos en video y funciona bien para escuelas y facultades («Programa de Caries dental, 12 módulos»).

Propósito: ofrecer a la comunidad dental de México una ruta de estudio ordenada, actualizada y revisada por profesionales, que vaya de los fundamentos a la aplicación clínica, con lenguaje claro y fuentes verificables.

Público de la plataforma:

- estudiantes de odontología;
- pasantes en servicio social;
- odontólogos generales que quieren actualizarse;
- asistentes dentales;
- pacientes informados (solo en los programas que lo indican, por ejemplo caries, odontopediatría y anatomía básica).

## 2. Jerarquía: Programa → Módulo → Tema → Actividad

Estructura numerada igual que Cisco:

```
Programa: Caries dental: prevención, diagnóstico y manejo
└── Módulo 4 · Diagnóstico de la caries: examen visual-táctil, ICDAS II y radiografías
    ├── 4.1 Condiciones para un buen examen visual            (tema de lectura)
    │   ├── Lectura con figuras y diagramas
    │   ├── Actividad: relaciona cada código ICDAS con su descripción
    │   └── Verificación rápida (3 preguntas)
    ├── 4.2 El sistema ICDAS II paso a paso
    │   └── …
    ├── 4.5 …
    ├── Minijuego del módulo (sopa, crucigrama o memorama)
    └── Examen del módulo 4  →  70 % para desbloquear el módulo 5
```

| Nivel | Qué es | Tamaño |
| --- | --- | --- |
| Programa | Ruta completa sobre un área de la odontología. | 10 a 16 módulos. |
| Módulo | Unidad con portada, objetivos, temas, minijuego y examen. | 5 temas (4 a 6 permitidos), 75 a 110 minutos. |
| Tema | Lectura con figuras, diagramas, recuadros, glosario y verificación. | 1,000 a 1,400 palabras, 8 a 14 minutos. |
| Actividad | Práctica dentro del tema: ordenar, relacionar, verdadero o falso, caso clínico o calculadora. | Al menos 1 por tema. |

## 3. Reglas de avance, acceso y certificación

1. **Avance secuencial.** Un tema se abre al terminar el anterior. Un módulo se abre al aprobar el examen del módulo anterior con **70 % o más**.
2. **Reintentos con espera.** Tras un intento reprobado hay que esperar **3 minutos** antes de volver a presentar el examen. Las preguntas cambian de orden y salen de un banco más grande que el examen (la app muestra 10 de 15 a 20).
3. **Exámenes calificados por el servidor.** Las respuestas correctas nunca viajan al navegador antes de responder. La API registra cada intento.
4. **Freemium.** El **módulo 1 de cada programa es gratis** para cualquier cuenta. Los módulos 2 en adelante requieren **OdonTeck VIP**. La API es la autoridad final del acceso; el contenido VIP no va en el bundle público.
5. **Certificado.** Al aprobar todos los módulos de un programa se emite un certificado con **folio OdonTeck** verificable, con el mismo sistema de folios que ya usan los cursos.
6. **Datos.** El avance, los intentos y los certificados viven en colecciones nuevas con prefijo `v2_` (por ejemplo `v2_academia_progreso`, `v2_academia_intentos`, `v2_academia_certificados`), cerradas al cliente y escritas solo por la API autenticada.

## 4. Flujo de revisión: nada clínico se publica sin un profesional

La regla del proyecto dice que el contenido odontológico **no se aprueba automáticamente**.

1. **Todo módulo nace en `"estado": "borrador"`.** Quien redacta (persona o agente) nunca pone otro estado.
2. **Cada tema lista sus fuentes** al final, para que quien revise pueda verificarlas. Las fuentes no se muestran al alumno por ahora.
3. **Revisión profesional.** Un cirujano dentista (o especialista del área del programa) revisa el módulo en el panel admin y lo pasa a `revision` mientras hace observaciones y a `aprobado` cuando lo valida. El cambio de estado lo hace solo una cuenta con el claim `admin: true`.
4. **Visibilidad.** Solo los módulos `aprobado` se ven en producción. Los borradores se ven únicamente en la vista previa del equipo.
5. **Versiones.** Cada corrección después de aprobado sube `version` y vuelve a revisión.
6. **Límites clínicos.** Nunca se dan dosis de medicamentos ni protocolos farmacológicos cerrados; la prescripción es juicio profesional del odontólogo o del especialista. Los procedimientos invasivos se explican como conceptos, con bioseguridad y sin contenido gráfico.

Esto es lo que hace valioso el material para facultades y colegios: un programa revisado por profesionales vale mucho más que uno generado sin revisión.

## 5. Capas de apoyo y niveles

Cada tema tiene el mismo texto técnico para todos, más tres apoyos:

- **«En pocas palabras»:** resumen de 2 o 3 frases en lenguaje sencillo, para quien empieza o para pacientes informados.
- **«Para profundizar»:** recuadro plegable con detalle universitario o profesional (mecanismos, criterios de clasificación, evidencia). Al menos uno por módulo.
- **Glosario al tocar la palabra:** los términos técnicos del glosario del tema se subrayan y muestran su definición.

Cada programa declara su **nivel** (Inicial, Intermedio o Avanzado, o un rango como «Inicial a Intermedio») y su **público sugerido**. Así una facultad o un consultorio sabe qué asignar a cada persona del equipo.

Recuadros del lector: «En pocas palabras», «Atención en el consultorio», «¿Sabías que…?», «Para profundizar», «Caso clínico» y «En México» (normativa o dato nacional).

## 6. Catálogo aprobado: 6 programas

Orden e identificadores confirmados por el propietario. El programa 2 (`caries-dental`) es el **piloto** y se redacta primero. Los títulos de módulo de esta sección son la fuente de verdad: el `titulo` de cada archivo de módulo y de `catalogo.json` debe coincidir exactamente.

| # | id | Área | Nivel | Público |
| --- | --- | --- | --- | --- |
| 1 | `anatomia-dental` | Ciencias básicas | Inicial a Intermedio | estudiantes de odontología, pasantes, asistentes dentales, pacientes informados |
| 2 | `caries-dental` | Cariología | Inicial a Intermedio | estudiantes de odontología, pasantes, odontólogos generales, asistentes dentales, pacientes informados |
| 3 | `enfermedad-periodontal` | Periodoncia | Intermedio a Avanzado | estudiantes de odontología, pasantes, odontólogos generales, asistentes dentales |
| 4 | `endodoncia` | Endodoncia | Intermedio a Avanzado | estudiantes de odontología, pasantes, odontólogos generales |
| 5 | `odontopediatria` | Odontopediatría | Inicial a Intermedio | estudiantes de odontología, pasantes, odontólogos generales, asistentes dentales, pacientes informados |
| 6 | `bioseguridad` | Bioseguridad | Inicial a Intermedio | estudiantes de odontología, pasantes, odontólogos generales, asistentes dentales |

**1. Anatomía dental y de la cavidad oral** · Inicial a Intermedio · 14 módulos
1. La cavidad oral: límites, regiones y funciones
2. Mucosa oral, encía y glándulas salivales
3. Huesos maxilares, articulación temporomandibular y músculos de la masticación
4. Irrigación e inervación de la región oral
5. Odontogénesis: cómo se forma un diente
6. Tejidos dentarios: esmalte, dentina, pulpa y cemento
7. Periodonto de inserción: ligamento periodontal y hueso alveolar
8. Nomenclatura dental y sistemas de numeración FDI y universal
9. Dentición temporal y cronología de la erupción
10. Anatomía de incisivos y caninos permanentes
11. Anatomía de premolares permanentes
12. Anatomía de molares permanentes
13. Oclusión: relaciones entre arcadas y movimientos mandibulares
14. Anatomía radiográfica de los dientes y sus estructuras de soporte

**2. Caries dental: prevención, diagnóstico y manejo** · Inicial a Intermedio · 12 módulos
1. Qué es la caries: biopelícula, azúcares y la hipótesis de la placa ecológica
2. Estructura dental, saliva y el equilibrio entre desmineralización y remineralización
3. Factores de riesgo y evaluación del riesgo de caries con CAMBRA e ICCMS
4. Diagnóstico de la caries: examen visual-táctil, ICDAS II y radiografías
5. Flúor y remineralización: mecanismos, vehículos y uso seguro
6. Selladores de fosetas y fisuras
7. Dieta y azúcares libres: la guía de la OMS en la práctica
8. Odontología mínimamente invasiva y remoción selectiva de tejido cariado
9. Materiales restauradores en el manejo de la caries
10. Caries en niños y caries de la infancia temprana
11. Caries radicular y salud bucal en personas mayores
12. Comunicación con el paciente y programas de prevención

**3. Enfermedad periodontal: de la gingivitis a la periodontitis** · Intermedio a Avanzado · 15 módulos
1. El periodonto sano: estructura y función
2. Biopelícula dental, cálculo y respuesta inmunoinflamatoria
3. Clasificación de las enfermedades periodontales y periimplantarias 2017
4. Salud gingival y gingivitis inducida por biopelícula
5. Enfermedades gingivales no inducidas por biopelícula
6. Examen periodontal: sondeo, periodontograma e índices de placa
7. Evaluación radiográfica de la pérdida ósea
8. Periodontitis: estadificación y gradación
9. Enfermedades periodontales necrosantes, abscesos y lesiones endoperiodontales
10. Factores de riesgo: tabaquismo, diabetes y otros modificadores
11. Enfermedad periodontal y salud general
12. Terapia periodontal no quirúrgica: principios y etapas
13. Control de la biopelícula en casa: técnicas y auxiliares
14. Mantenimiento periodontal y criterios de referencia al especialista
15. Salud periimplantaria: mucositis y periimplantitis

**4. Endodoncia: fundamentos del tratamiento de conductos** · Intermedio a Avanzado · 14 módulos
1. La pulpa dental: estructura, funciones y respuesta a la agresión
2. Anatomía interna: cámara pulpar y sistema de conductos
3. Diagnóstico endodóntico: historia clínica y pruebas de sensibilidad pulpar
4. Terminología diagnóstica pulpar y periapical
5. Radiografía y tomografía de haz cónico en endodoncia
6. Dolor de origen dental: urgencias y diagnóstico diferencial
7. Terapia pulpar vital: recubrimiento pulpar y pulpotomía
8. Aislamiento absoluto y bioseguridad en endodoncia
9. Acceso cameral y localización de conductos
10. Conformación del conducto: instrumentación manual y mecanizada
11. Irrigación y desinfección del sistema de conductos
12. Obturación del conducto y sellado coronal
13. Éxito, fracaso y retratamiento: seguimiento y pronóstico
14. Traumatismos dentales y su repercusión pulpar

**5. Odontopediatría: salud bucal en niños** · Inicial a Intermedio · 14 módulos
1. La salud bucal infantil y el papel de la odontopediatría
2. Crecimiento craneofacial y desarrollo de la dentición
3. Anomalías dentales del desarrollo e hipomineralización incisivo-molar
4. Primera visita al dentista y atención del bebé
5. Manejo de la conducta y comunicación con niños y familias
6. Evaluación del riesgo y prevención personalizada en la infancia
7. Higiene bucal por edades: guía para madres, padres y cuidadores
8. Caries de la infancia temprana: enfoque familiar y comunitario
9. Terapia pulpar en dientes temporales
10. Restauración de dientes temporales: materiales y coronas
11. Hábitos orales y desarrollo de la oclusión
12. Mantenedores de espacio y ortodoncia interceptiva
13. Traumatismos dentales en la infancia
14. Niñas y niños con necesidades especiales de atención

**6. Bioseguridad y control de infecciones en el consultorio dental** · Inicial a Intermedio · 15 módulos
1. Bioseguridad en odontología: principios y marco normativo
2. Cadena de infección y vías de transmisión en el consultorio
3. Precauciones estándar y precauciones basadas en la transmisión
4. Higiene de manos
5. Equipo de protección personal: selección, colocación y retiro
6. Vacunación y salud ocupacional del equipo dental
7. Prevención y manejo de exposiciones con objetos punzocortantes
8. Aerosoles, ventilación y calidad del aire
9. Limpieza, desinfección y clasificación de Spaulding
10. Procesamiento y esterilización del instrumental
11. Monitoreo de la esterilización con indicadores físicos, químicos y biológicos
12. Calidad del agua de la unidad dental
13. Residuos peligrosos biológico-infecciosos en el consultorio
14. Protección radiológica en el consultorio dental
15. Auditoría y protocolo de bioseguridad del consultorio

**Totales: 6 programas, 84 módulos.** Con 5 temas por módulo son unos 420 temas de lectura, más actividades, minijuegos y exámenes.

## 7. Dónde vive en la app

| Lugar | Cambio |
| --- | --- |
| Barra lateral (PC) | Acceso «Academia» debajo de «Cursos». |
| Barra inferior (teléfono) | Acceso a «Academia» según lo decida el propietario; no se reordena la navegación sin su visto bueno. |
| Inicio | Tarjeta «Continúa tu programa». |
| Logros y certificados | Insignias por módulo y certificado con folio OdonTeck por programa. |

Rutas sugeridas: `#/academia`, `#/academia/:programa`, `#/academia/:programa/:modulo`, `#/academia/:programa/:modulo/:tema` y `#/academia/:programa/:modulo/examen`. La plataforma la construye un agente distinto; este plan solo fija el contenido y las reglas.

## 8. Tipos de contenido

### Bloques de lectura

Texto, subtítulo, figura con pie, diagrama etiquetado (hecho en código), tabla, lista, pasos, recuadro (`atencion`, `sabias`, `profundizar`, `ejemplo`, `mexico`), cita y actividad. El detalle técnico está en `ACADEMIA-FORMATO.md`.

### Actividades dentro del tema

| Actividad | Ejemplo dental |
| --- | --- |
| Verificación rápida | 3 preguntas al final del tema, con explicación. |
| Ordenar | Secuencia de colocación y retiro del equipo de protección personal; pasos para colocar un sellador. |
| Relacionar | Código ICDAS con su descripción clínica; tejido dentario con su característica. |
| Verdadero o falso | Mitos sobre el flúor, la dentición temporal o el sangrado de encías. |
| Caso clínico | Paciente con lesión activa en fosetas y tres decisiones posibles, cada una con su consecuencia. |
| Calculadora guiada | Porcentaje de superficies con placa (índice de O'Leary), proporción de energía que aportan los azúcares libres. |

### Minijuegos entre módulos

Sopa de letras, crucigrama y memorama con el vocabulario del módulo, en rotación fija por número de módulo (1, 4, 7, 10, 13 y 16 sopa; 2, 5, 8, 11 y 14 crucigrama; 3, 6, 9, 12 y 15 memorama). Los minijuegos dan XP, pero **lo que desbloquea el siguiente módulo es el examen**.

## 9. Política de imágenes

### Proporciones y usos

| Proporción | Uso |
| --- | --- |
| 16:9 | Portada del programa y de cada módulo, escenas de consultorio. |
| 1:1 | Fichas de memorama, detalles de un diente o instrumento. |
| 3:4 | Figuras verticales (profesional trabajando, diente completo). |
| 9:16 | Versión móvil de portadas. |
| 4:3 | Figuras horizontales y casos clínicos dentro del texto. |

### Reglas de contenido visual

- **Estilo:** fotografía clínica realista o ilustración realista, luz limpia de consultorio, colores naturales.
- **Anatomía correcta:** número, forma y posición de los dientes coherentes con la edad y la arcada que se describe.
- **Sin sangre ni contenido perturbador:** nada de cirugía explícita, heridas, sangrado o tejidos expuestos de forma gráfica.
- **Sin rostros identificables de pacientes reales:** encuadres de boca, manos, instrumental o personas de espaldas o con cubrebocas; maniquíes y modelos tipodonto cuando ayuden.
- **Equipo de protección correcto:** guantes, cubrebocas o respirador, protección ocular o careta y bata en toda escena clínica.
- **Sin texto, etiquetas ni logotipos** dentro de las imágenes.
- **Diagramas con etiquetas en código:** cortes de un diente, códigos ICDAS, periodontograma, cadena de infección o flujo de esterilización se dibujan en SVG a partir de los bloques `diagrama`, nunca con el generador de imágenes.

### Cuántas imágenes

Por módulo: 1 portada 16:9, de 15 a 20 figuras (al menos 3 por tema) y de 5 a 8 diagramas en código (al menos 1 por tema). Los prompts se entregan por lotes, un documento por programa, siguiendo los documentos de dirección visual que ya existen en `docs/`.

## 10. Orden de trabajo

| Etapa | Qué incluye | Resultado |
| --- | --- | --- |
| 1. Plataforma | Catálogo, lector, actividades, minijuegos, exámenes, avance, API, freemium, certificados y panel de revisión (otro agente). | La Academia funciona de punta a punta. |
| 2. Piloto | Programa 2 (`caries-dental`), 12 módulos completos en borrador. | Se valida formato, tono y diseño antes de producir en volumen. |
| 3. Producción | Programas 1, 3, 4, 5 y 6, en lotes, cada módulo validado con `node scripts/academia/validar.mjs <programa> --estricto`. | Texto completo en borrador. |
| 4. Imágenes y revisión | Prompts por programa, carga de imágenes y aprobación profesional módulo por módulo. | Programas publicados a medida que se aprueban. |

## 11. Normas y referencias base

Normas mexicanas verificadas como vigentes en el Catálogo Mexicano de Normas de la Secretaría de Economía (consulta del 14 de octubre de 2026). Quien redacte debe volver a confirmarlas antes de citarlas y revisar el DOF ante cualquier modificación:

- **NOM-013-SSA2-2015**, Para la prevención y control de enfermedades bucales (DOF 23/11/2016).
- **NOM-087-SEMARNAT-SSA1-2002**, Residuos peligrosos biológico-infecciosos: clasificación y especificaciones de manejo (DOF 17/02/2003).
- **NOM-004-SSA3-2012**, Del expediente clínico (DOF 15/10/2012).
- **NOM-229-SSA1-2002**, Requisitos técnicos, responsabilidades sanitarias y protección radiológica en establecimientos de diagnóstico médico con rayos X (DOF 15/09/2006). **Ojo:** su campo de aplicación tiene precisiones para equipos odontológicos; antes de afirmar que aplica a radiografía intraoral convencional hay que leer el texto oficial.

Marcos clínicos de referencia: ICDAS II e ICCMS (detección y manejo de caries), CAMBRA (riesgo de caries), guía de la OMS 2015 sobre ingesta de azúcares, clasificación de enfermedades periodontales y periimplantarias del World Workshop 2017 (AAP/EFP), terminología diagnóstica de la AAE, guías de la AAPD y de la FDI, y las guías de control de infecciones en odontología de los CDC.
