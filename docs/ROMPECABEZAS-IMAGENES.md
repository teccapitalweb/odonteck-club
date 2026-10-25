# Imágenes originales de los rompecabezas de clase

Versión vigente: una ilustración clínica original y exclusiva para cada una de las 18 clases que reciben el juego. Las imágenes se generan para el tema de la clase, no se reutilizan portadas ni entre sí. El tablero es de 4 × 4 (16 piezas); cada imagen es vertical, sin texto ni marcas, y está optimizada como JPEG para mantener ligera la descarga.

## Mapa de clase, tema visual y asset

| Curso | Clase del catálogo | Tema visual original | Asset |
| --- | ---: | --- | --- |
| Diagnóstico en Ortodoncia para Odontólogos Generales | 1 | Modelos ortodóncicos, registros clínicos y valoración integral | `diagnostico-en-ortodoncia-para-odontologos-generales-clase-1.jpg` |
| Diagnóstico y Clasificación de la Caries Dental | 3 | Lesión inicial, remineralización y prevención | `diagnostico-y-clasificacion-de-la-caries-dental-clase-3.jpg` |
| Endodoncia Pediátrica | 1 | Molar primario seccionado, cámara pulpar y pulpotomía | `endodoncia-pediatrica-manejo-de-los-canales-radiculares-en-ninos-clase-1.jpg` |
| Extracciones Simples | 3 | Revisión del alvéolo, compresión y sutura | `extracciones-simples-clase-3.jpg` |
| Férulas de Contención en Odontopediatría | 2 | Férula flexible, dentición mixta y control | `ferulas-de-contencion-en-odontopediatria-tipos-tiempos-y-materiales-clase-2.jpg` |
| Manejo de Abscesos Periodontales | 3 | Modelo periodontal, furca, sonda e higiene | `manejo-de-abscesos-periodontales-clase-3.jpg` |
| Materiales Dentales Restauradores | 3 | Cavidad profunda, protección pulpar y materiales | `materiales-dentales-restauradores-indicaciones-y-usos-clase-3.jpg` |
| Ortodoncia Lingual y Estética | 2 | Brackets linguales, alineador y attachments | `ortodoncia-lingual-y-estetica-clase-2.jpg` |
| Patologías Dentales Más Comunes en la Infancia | 3 | Dentición mixta, cronología y modelos de valoración | `patologias-dentales-mas-comunes-en-la-infancia-clase-3.jpg` |
| Periodoncia Estética: Manejo de Encía y Diseño de Sonrisa | 2 | Cenit, margen gingival y papila interdental | `periodoncia-estetica-manejo-de-encia-y-diseno-de-sonrisa-clase-2.jpg` |
| Periodoncia Estética y Plástica | 3 | Preservación del reborde y modelo de tejidos blandos | `periodoncia-estetica-y-plastica-clase-3.jpg` |
| Raspado y Alisado Radicular | 1 | Cálculo subgingival, cureta Gracey e instrumental ultrasónico | `raspado-y-alisado-radicular-clase-1.jpg` |
| Rehabilitación Oral Estética con Coronas y Puentes | 3 | Puente fijo, póntico y control oclusal | `rehabilitacion-oral-estetica-con-coronas-y-puentes-clase-3.jpg` |
| Resinas Compuestas | 2 | Estratificación de dentina/esmalte y fotocurado | `resinas-compuestas-seleccion-manipulacion-y-tecnicas-de-estratificacion-clase-2.jpg` |
| Retroobturación en Endodoncia | 2 | Resección apical, preparación ultrasónica y biocerámico | `retroobturacion-en-endodoncia-tecnicas-y-materiales-clase-2.jpg` |
| Salud Oral en Pacientes con Condiciones Sistémicas | 2 | Historia médica, modelo cardiaco y salud oral | `salud-oral-en-pacientes-con-condiciones-sistemicas-clase-2.jpg` |
| Tratamientos Periodontales No Quirúrgicos | 2 | Instrumentación, higiene y coadyuvantes selectivos | `tratamientos-periodontales-no-quirurgicos-tecnicas-clinicas-para-el-control-de-la-enfermedad-periodontal-clase-2.jpg` |
| Traumatismos Dentales en Niños | 1 | Dentición mixta, fractura y contenedor de transporte; sin representar reimplante | `traumatismos-dentales-en-ninos-clase-1.jpg` |

## Dirección de generación

Cada prompt describe el tema específico de esa clase y pide una escena editorial clínica, limpia y anatómicamente plausible, con objetos distinguibles a lo largo del encuadre para que las 16 piezas tengan referencias visuales. Se evita texto, etiquetas, marcas, pacientes identificables y sangre. En trauma infantil se excluyen flechas y cualquier representación que sugiera reimplantar un diente primario.

La resolución de imágenes vive en `src/core/juego-clase.ts`; `npm run audit:class-games` comprueba que cada rompecabezas del catálogo tenga su asset y mapeo.
