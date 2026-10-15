# Academia OdonTeck · formato de contenido y estándar editorial

Este documento define cómo se escribe cada módulo de la Academia OdonTeck. Lo siguen las personas y los agentes que redactan contenido. El esquema es idéntico al de la Academia de Visión Pecuaria para que el lector, la API y el validador funcionen sin cambios; solo cambia el dominio. El validador `node scripts/academia/validar.mjs <programa> --estricto` rechaza cualquier archivo que no lo cumpla.

## 1. Archivos

- Catálogo: `api/content/academia/catalogo.json`, coherente con la sección 6 de `docs/PLAN-ACADEMIA.md` (títulos idénticos).
- Un archivo por módulo: `api/content/academia/<programa>/modulo-01.json`, `modulo-02.json`…, con dos dígitos.
- El `titulo` del módulo debe coincidir **exactamente** con el del catálogo.

## 2. Estructura de un módulo

```jsonc
{
  "programa": "caries-dental",             // id del catálogo
  "modulo": 4,                             // número
  "titulo": "Diagnóstico de la caries: examen visual-táctil, ICDAS II y radiografías",   // = catálogo
  "estado": "borrador",                    // "borrador" | "revision" | "aprobado"; quien redacta SIEMPRE pone "borrador"
  "version": 1,
  "resumen": "Párrafo de 60 a 120 palabras: qué aprende la persona y por qué importa en la consulta.",
  "objetivos": ["Explicar…", "Registrar…", "…"],   // 4 a 6, verbos observables
  "duracionMin": 95,                       // suma aproximada de lectura + actividades + examen
  "portada": { "id": "caries-dental/m04/portada", "proporcion": "16:9", "alt": "…", "prompt": "…" },
  "temas": [ /* 4 a 6 temas (5 recomendados), ver sección 3 */ ],
  "minijuego": { /* ver sección 5 */ },
  "examen": { "aprobar": 70, "mostrar": 10, "preguntas": [ /* 15 a 20, ver sección 6 */ ] },
  "fuentes": [ /* fuentes generales del módulo, ver sección 7 */ ]
}
```

Estados:

| estado | Quién lo pone | Visible en producción |
| --- | --- | --- |
| `borrador` | Quien redacta (persona o agente). | No; solo vista previa del equipo. |
| `revision` | El profesional revisor desde el panel admin, mientras hace observaciones. | No. |
| `aprobado` | El profesional revisor desde el panel admin. | Sí. |

## 3. Tema

```jsonc
{
  "n": "4.2",                               // <módulo>.<tema>
  "titulo": "El sistema ICDAS II paso a paso",
  "minutos": 12,
  "enPocasPalabras": "2 o 3 frases en lenguaje muy sencillo, que entienda un paciente o alguien que empieza.",
  "bloques": [ /* ver sección 4 */ ],
  "glosario": [{ "termino": "Lesión no cavitada", "definicion": "Lesión de caries en la que la superficie del esmalte sigue continua…" }],   // 3 a 8
  "verificacion": [ /* exactamente 3 preguntas de selección, ver sección 6 */ ],
  "fuentes": [ /* las que respaldan este tema */ ]
}
```

### Volumen mínimo por tema

- **De 1,000 a 1,400 palabras** de enseñanza real en bloques `texto`, `recuadro`, `pasos`, `lista` y `tabla` (el validador advierte por debajo de 900).
- Al menos **3 figuras** (`figura`) y **1 diagrama** (`diagrama`).
- Al menos **2 recuadros** de variantes distintas.
- Al menos **1 actividad** (`actividad`) dentro de los bloques.
- Subtítulos (`subtitulo`) cada 2 o 3 párrafos.
- Cada tema **cierra con una idea práctica** aplicable en la consulta, en el estudio o en casa.
- En el módulo, al menos **un recuadro `profundizar`** con nivel universitario o profesional.

Así cada módulo tiene entre 5,000 y 7,000 palabras y de 16 a 21 imágenes (portada incluida).

## 4. Bloques

| tipo | campos | uso |
| --- | --- | --- |
| `subtitulo` | `texto` | Divide el tema en secciones. |
| `texto` | `md` | Párrafos. Admite `**negritas**`, `*cursivas*` y saltos de párrafo con línea en blanco. Nada de HTML. |
| `lista` | `titulo?`, `items[]`, `ordenada?` | Enumeraciones cortas (2 o más elementos). |
| `pasos` | `titulo`, `pasos[{ titulo, md }]` | Procedimientos explicados como concepto (2 o más pasos). |
| `tabla` | `titulo`, `columnas[]`, `filas[[]]` | Comparaciones, criterios de clasificación. Cada fila con tantas celdas como columnas. |
| `recuadro` | `variante`, `titulo`, `md` | `atencion` (riesgo clínico o de bioseguridad en el consultorio), `sabias` (dato curioso con respaldo), `profundizar` (técnico, nivel universitario o profesional; el lector lo muestra plegable), `ejemplo` (caso clínico ilustrativo), `mexico` (normativa o dato nacional verificado). |
| `figura` | `id`, `proporcion`, `alt`, `pie`, `prompt` | Imagen que genera el propietario con su generador de imágenes. |
| `diagrama` | `id`, `pie`, `descripcion`, `elementos[]` | Diagrama con etiquetas que se dibuja en código (SVG). `descripcion` explica qué debe mostrar; `elementos` lista las etiquetas exactas. |
| `cita` | `texto`, `autor` | Frase de un profesional o institución; solo si es real y verificable, o marcada como ilustrativa. |
| `actividad` | ver sección 5 | Práctica dentro del tema. |

### Ejemplos

```jsonc
{ "tipo": "subtitulo", "texto": "Secar antes de mirar" }

{ "tipo": "texto", "md": "Una lesión inicial puede ser invisible sobre el esmalte húmedo. Por eso el examen se hace con el diente **limpio** y **secado con aire** unos segundos…" }

{ "tipo": "recuadro", "variante": "atencion", "titulo": "No explores con fuerza", "md": "Presionar una lesión no cavitada con un explorador puntiagudo puede romper la superficie y convertirla en cavidad. Usa una sonda de punta roma y presión suave." }

{ "tipo": "recuadro", "variante": "mexico", "titulo": "Lo que pide la norma", "md": "La NOM-013-SSA2-2015 establece criterios para la prevención y control de enfermedades bucales…" }

{ "tipo": "tabla", "titulo": "Códigos ICDAS II agrupados", "columnas": ["Estadio ICCMS", "Códigos ICDAS", "Qué se observa"], "filas": [["Sano", "0", "Sin cambios visibles tras secado prolongado"], ["Inicial", "1 y 2", "Cambio visual en esmalte"], ["Moderado", "3 y 4", "Ruptura localizada del esmalte o sombra de dentina"], ["Extenso", "5 y 6", "Cavidad con dentina visible"]] }

{ "tipo": "pasos", "titulo": "Colocación de un sellador (concepto)", "pasos": [{ "titulo": "Aislamiento", "md": "Controlar la humedad es la condición más importante para que el sellador se retenga…" }, { "titulo": "Limpieza de la superficie", "md": "…" }] }
```

### Figuras

- `id`: `<programa>/m<NN>/<NN>` con numeración consecutiva dentro del módulo (la portada es `<programa>/m<NN>/portada`). Ejemplo: `caries-dental/m04/07`.
- `proporcion`: una de `16:9`, `4:3`, `3:4`, `1:1`, `9:16`.
- `alt`: descripción accesible en una frase.
- `pie`: «Figura 4.2.1 · texto del pie» lo arma el lector; aquí va solo el texto.
- `prompt`: en español, de **60 a 140 palabras**, describe sujeto, edad del paciente o dentición, escena, acción, encuadre, luz y estilo. Termina con «Evitar: …». **Nunca pedir texto dentro de la imagen.**
- Estilo base: fotografía clínica realista o ilustración realista, consultorio dental limpio y bien iluminado, colores naturales.
- Reglas fijas: anatomía dental correcta; sin sangre ni contenido gráfico perturbador; sin rostros identificables de pacientes reales (encuadres de boca, manos, instrumental, tipodonto o personas con cubrebocas); equipo de protección personal correcto en toda escena clínica (guantes, cubrebocas o respirador, lentes o careta, bata); sin texto, letreros, marcas ni logotipos.
- Los diagramas con etiquetas (cortes de un diente, periodontograma, códigos ICDAS, cadena de infección) **no** se piden al generador: van como bloque `diagrama`.

Ejemplo:

```jsonc
{
  "tipo": "figura",
  "id": "caries-dental/m04/05",
  "proporcion": "4:3",
  "alt": "Molar inferior con manchas blancas opacas en el fondo de las fisuras, visto desde oclusal tras secado con aire.",
  "pie": "Lesión inicial en fisuras de un molar permanente: el cambio de color se aprecia mejor con la superficie seca.",
  "prompt": "Fotografía clínica macro, vista oclusal de un primer molar inferior permanente de un adolescente, superficie limpia y seca, con opacidades blancas tenues siguiendo el fondo de las fosetas y fisuras, sin cavidad, esmalte con brillo natural en las cúspides, encía sana rosa pálido en el borde del encuadre, iluminación de lámpara dental uniforme y neutra, enfoque nítido, fondo de campo oscuro, colores naturales. Evitar: texto, flechas, etiquetas, logotipos, marcas de agua, sangre, rostros, dientes deformes, número incorrecto de cúspides, instrumental sin guantes."
}
```

### Diagramas

```jsonc
{
  "tipo": "diagrama",
  "id": "caries-dental/m04/d2",
  "pie": "Correspondencia entre los códigos ICDAS II y los estadios ICCMS.",
  "descripcion": "Barra horizontal dividida en cuatro bloques de color de izquierda a derecha (sano, inicial, moderado, extenso); debajo de cada bloque, los códigos ICDAS que agrupa, y encima un corte esquemático del diente que muestra la profundidad aproximada de la lesión.",
  "elementos": ["Sano: código 0", "Inicial: códigos 1 y 2", "Moderado: códigos 3 y 4", "Extenso: códigos 5 y 6", "Esmalte", "Dentina"]
}
```

- `id`: `<programa>/m<NN>/d<N>` consecutivo dentro del módulo.

## 5. Actividades y minijuego

Actividades dentro de un tema (`"tipo": "actividad"` en bloques, con `"actividad"` igual a uno de estos):

```jsonc
{ "tipo": "actividad", "actividad": "ordenar", "titulo": "Ordena el retiro del equipo de protección", "instruccion": "…", "elementos": ["Retirar guantes", "Retirar lentes o careta", "Retirar bata", "Retirar cubrebocas o respirador", "Higiene de manos"] }
// elementos en el ORDEN CORRECTO (aquí, la secuencia de ejemplo de los CDC); la app los baraja. 4 a 7 elementos, sin repetidos.

{ "tipo": "actividad", "actividad": "relacionar", "titulo": "Relaciona cada código", "instruccion": "…", "pares": [{ "a": "ICDAS 0", "b": "Superficie sana tras secado prolongado" }] }
// 4 a 6 pares.

{ "tipo": "actividad", "actividad": "vf", "titulo": "Mito o realidad", "afirmaciones": [{ "texto": "Los dientes de leche no necesitan atención porque se van a caer.", "verdadero": false, "explicacion": "…" }] }
// 4 a 6 afirmaciones.

{ "tipo": "actividad", "actividad": "caso", "titulo": "Caso clínico", "situacion": "Párrafo con la situación clínica (sin datos identificables).", "opciones": [{ "texto": "…", "correcta": true, "retro": "Qué pasa si eliges esto." }] }
// 3 o 4 opciones, exactamente una correcta.

{ "tipo": "actividad", "actividad": "calculadora", "titulo": "Índice de placa de O'Leary", "instruccion": "…", "formula": "Índice = superficies con placa ÷ superficies examinadas × 100", "variables": [{ "id": "conPlaca", "etiqueta": "Superficies con placa", "valor": 24, "unidad": "superficies" }, { "id": "examinadas", "etiqueta": "Superficies examinadas", "valor": 96, "unidad": "superficies" }], "resultado": { "expresion": "conPlaca / examinadas * 100", "etiqueta": "Superficies con placa", "unidad": "%", "decimales": 1 } }
// expresion solo con ids de variables, números y + - * / ( ). Nunca calculadoras de dosis de medicamentos.
```

Minijuego del módulo (uno por módulo, se juega antes del examen). Tipo fijo según el número de módulo: **1, 4, 7, 10, 13, 16 → `sopa`; 2, 5, 8, 11, 14 → `crucigrama`; 3, 6, 9, 12, 15 → `memorama`**.

```jsonc
{ "tipo": "sopa", "titulo": "…", "palabras": ["BIOPELICULA", "ESMALTE", "FLUOR", "…"] }        // 8 a 12 palabras, MAYÚSCULAS, sin espacios, sin acentos, 4 a 12 letras
{ "tipo": "crucigrama", "titulo": "…", "pistas": [{ "palabra": "SELLADOR", "pista": "…" }] }   // 6 a 10
{ "tipo": "memorama", "titulo": "…", "pares": [{ "a": "Concepto", "b": "Pareja" }] }        // 6 a 8
```

## 6. Preguntas

```jsonc
{ "id": "m04-p07", "q": "Pregunta clara", "opciones": ["A", "B", "C", "D"], "correcta": 2, "explicacion": "Por qué es la correcta y por qué las otras no." }
```

- 4 opciones, una correcta (`correcta` de 0 a 3), distractores plausibles, **sin «todas las anteriores» ni «ninguna de las anteriores»**.
- Repartir la respuesta correcta entre A, B, C y D: ninguna letra con más del 35 % del examen.
- Examen del módulo: de 15 a 20 preguntas (la app muestra 10 al azar; se aprueba con 70). Mezclar recuerdo, comprensión y casos clínicos.
- Verificación del tema: exactamente 3 preguntas, con `id` `t4.2-1`, `t4.2-2`, `t4.2-3`.

## 7. Fuentes

```jsonc
{ "tipo": "oficial", "titulo": "NOM-013-SSA2-2015, Para la prevención y control de enfermedades bucales", "autor": "Secretaría de Salud", "anio": 2016 }
{ "tipo": "academica", "titulo": "…", "autor": "…", "anio": 2018 }
{ "tipo": "propia", "titulo": "Elaboración propia OdonTeck con base en …", "autor": "OdonTeck", "anio": 2026 }
```

Reglas de honestidad:

- **Nunca inventar** un dato, cifra, documento, autor, año, número de norma o URL. Si no estás seguro de que existe, no lo cites; usa `propia`.
- `url` solo si estás seguro de que es correcta; si no, omítela.
- Antes de citar una NOM, confirma con una búsqueda que existe y está vigente (Catálogo Mexicano de Normas o DOF).
- Prioridad: Secretaría de Salud, COFEPRIS, DOF, OMS/OPS, FDI, ADA, AAPD, AAE, CDC (control de infecciones), UNAM y otras universidades, consensos revisados por pares (ICDAS/ICCMS, World Workshop 2017 AAP/EFP).
- `propia` para la síntesis didáctica escrita para OdonTeck, indicando en el título en qué se basa.
- Las fuentes **no se muestran** al alumno por ahora; quedan en el archivo para respaldo y revisión profesional.

## 8. Reglas de contenido

1. Español de México, claro y cálido, en segunda persona («observa», «registra»). Términos técnicos correctos, con su explicación la primera vez. Sin anglicismos innecesarios.
2. Técnicamente correcto y actualizado a 2025/2026. Cifras con contexto, unidad y fuente.
3. **Sin dosis ni protocolos farmacológicos cerrados.** Se explica el concepto y se indica que la prescripción es juicio profesional del odontólogo o del especialista.
4. **Procedimientos invasivos como concepto**, siempre con bioseguridad y sin contenido gráfico.
5. Normativa mexicana cuando aplique, solo con normas verificadas como vigentes.
6. Seguridad del paciente y del equipo dental siempre presentes.
7. Usar «» en lugar de comillas dobles ASCII dentro de los textos del JSON.
8. Cada tema cierra con una idea práctica aplicable.
