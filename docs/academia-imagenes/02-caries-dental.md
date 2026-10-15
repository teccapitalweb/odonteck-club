# Imágenes · Programa 02 · Caries dental: prevención, diagnóstico y manejo

Documento de prompts de la Academia OdonTeck. Se genera desde el contenido del programa; si el contenido cambia, se vuelve a generar.

## Cómo entregar las imágenes

1. Abre la carpeta `imagenes-academia/02-caries-dental/`.
2. Entra a la subcarpeta del módulo (por ejemplo `modulo-01`).
3. Genera las imágenes **en el orden de la lista** y guárdalas ahí. Si puedes, nómbralas con su número (`01.png`, `portada.png`); si no, el importador usa el orden de creación y la proporción para identificarlas.
4. Ejecuta `npm run academia:importar-imagenes -- caries-dental` para revisarlas y `-- --aplicar` para convertirlas a WebP.

## Especificaciones generales

- Estilo: fotografía clínica realista o ilustración realista, consultorio dental limpio y bien iluminado, colores naturales.
- Anatomía dental correcta; sin sangre ni contenido gráfico perturbador; sin rostros identificables de pacientes.
- Equipo de protección personal correcto en toda escena clínica.
- Sin texto, letreros, logotipos ni marcas de agua dentro de la imagen.
- Tamaños sugeridos: 16:9 → 1920 × 1080 px · 4:3 → 1600 × 1200 px · 3:4 → 1200 × 1600 px · 1:1 → 1400 × 1400 px · 9:16 → 1080 × 1920 px.

## Módulo 1 · Qué es la caries: biopelícula, azúcares y la hipótesis de la placa ecológica

Carpeta: `imagenes-academia/02-caries-dental/modulo-01/` · 16 imágenes (6 de 16:9, 5 de 4:3, 2 de 1:1, 3 de 3:4).

### 01 · Portada del módulo · 16:9

- **Identificador:** `caries-dental/m01/portada`
- **Qué muestra:** Odontóloga con equipo de protección completo examina con espejo bucal los molares de un paciente reclinado, del que solo se ve la boca.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía clínica realista de gran formato en un consultorio dental moderno y luminoso de México: una odontóloga con guantes de nitrilo, cubrebocas, careta transparente, gorro y bata desechable examina con espejo bucal y sonda de punta roma los molares inferiores de un paciente adulto reclinado en la unidad dental; encuadre lateral cercano en el que del paciente solo se ven los labios entreabiertos y la mejilla con babero, lámpara dental encendida, bandeja de instrumental ordenada al fondo, colores naturales, profundidad de campo corta. Evitar: texto, logotipos, marcas de agua, rostro identificable del paciente, sangre, manos sin guantes, dientes deformes, instrumental oxidado.

### 02 · Tema 1.1 · figura 1.1.1 · 4:3

- **Identificador:** `caries-dental/m01/01`
- **Qué muestra:** Manos enguantadas de un odontólogo sostienen espejo bucal y sonda frente a los dientes de un paciente adulto, en encuadre cerrado de la boca.
- **Pie en la lectura:** El examen clínico es el punto de partida: antes de pensar en restaurar, hay que entender en qué etapa del proceso está cada superficie.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica realista, encuadre cerrado de la boca de un paciente adulto con los labios separados por un retractor suave, dientes permanentes completos y bien alineados, un odontólogo con guantes de nitrilo azul sostiene un espejo bucal y una sonda de punta roma junto a los premolares superiores, luz blanca uniforme de la lámpara dental, encía rosa pálido sana, saliva natural, fondo desenfocado de la unidad dental, colores naturales y nitidez alta. Evitar: texto, logotipos, marcas de agua, sangre, rostro completo del paciente, manos sin guantes, número incorrecto de dientes, aspecto de caricatura.

### 03 · Tema 1.1 · figura 1.1.2 · 16:9

- **Identificador:** `caries-dental/m01/02`
- **Qué muestra:** Sala de espera de un centro de salud con familias sentadas, vistas de espaldas y sin rostros visibles.
- **Pie en la lectura:** La caries afecta a personas de todas las edades y se concentra donde hay menos acceso a prevención; por eso es un problema de salud pública, no solo de la consulta privada.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía documental realista de la sala de espera de un centro de salud público en México, luz natural de mañana que entra por ventanas amplias, sillas de plástico en fila, varias familias con niñas y niños pequeños y personas adultas mayores sentadas vistas de espaldas o de perfil lejano, sin rostros reconocibles, paredes claras y limpias, piso de loseta, ambiente ordenado y tranquilo, colores naturales, encuadre amplio. Evitar: texto, carteles legibles, logotipos, marcas de agua, rostros identificables, personas en situación de angustia, desorden exagerado.

### 04 · Tema 1.1 · figura 1.1.3 · 1:1

- **Identificador:** `caries-dental/m01/03`
- **Qué muestra:** Vista oclusal de un modelo de molar inferior con una mancha blanca opaca junto a otra pieza con cavidad marrón.
- **Pie en la lectura:** Dos momentos del mismo proceso: una lesión inicial sin cavidad y una lesión cavitada en dentina.
- **Tamaño:** 1400 × 1400 px

**Prompt:**

> Fotografía macro de estudio sobre fondo gris neutro de dos molares inferiores permanentes extraídos y limpios, montados lado a lado en un soporte, vista oclusal: el de la izquierda con opacidades blancas tenues en el fondo de las fisuras y superficie íntegra, el de la derecha con una cavidad oclusal pequeña de bordes marrones y dentina oscura en el fondo, ambos con anatomía correcta de cinco cúspides, iluminación difusa uniforme, enfoque nítido. Evitar: texto, flechas, etiquetas, logotipos, marcas de agua, sangre, restos de tejido blando, dientes deformes.

### 05 · Tema 1.2 · figura 1.2.1 · 4:3

- **Identificador:** `caries-dental/m01/04`
- **Qué muestra:** Dientes anteriores inferiores con placa teñida de color rosa intenso cerca de la encía tras aplicar un revelador.
- **Pie en la lectura:** Un revelador de placa hace visible la biopelícula, que se acumula sobre todo cerca del margen de la encía y entre los dientes.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica macro de los incisivos y caninos inferiores permanentes de un adulto joven, labios separados con retractor transparente, tras aplicar un revelador de placa: zonas teñidas de color rosa magenta concentradas en el tercio cervical cerca de la encía y en los espacios entre dientes, el resto del esmalte blanco y limpio, encía sana rosa pálido, luz de lámpara dental uniforme, enfoque nítido. Evitar: texto, flechas, logotipos, marcas de agua, sangre, encía inflamada exagerada, rostro visible, número incorrecto de dientes.

### 06 · Tema 1.2 · figura 1.2.2 · 3:4

- **Identificador:** `caries-dental/m01/05`
- **Qué muestra:** Ilustración realista de una biopelícula vista al microscopio, con bacterias en forma de cocos y bacilos envueltas en una matriz.
- **Pie en la lectura:** La biopelícula madura es una comunidad organizada, con microcolonias, matriz extracelular y canales internos.
- **Tamaño:** 1200 × 1600 px

**Prompt:**

> Ilustración científica realista estilo micrografía electrónica de barrido coloreada en tonos suaves, vista en corte de una biopelícula dental madura sobre una superficie de esmalte con textura de prismas: grupos densos de bacterias en forma de cocos y algunos bacilos alargados, envueltos en una matriz extracelular translúcida y fibrosa, con canales abiertos entre microcolonias, profundidad de campo marcada, iluminación lateral suave, composición vertical. Evitar: texto, escalas, etiquetas, flechas, logotipos, marcas de agua, colores fluorescentes estridentes, aspecto de caricatura.

### 07 · Tema 1.2 · figura 1.2.3 · 16:9

- **Identificador:** `caries-dental/m01/06`
- **Qué muestra:** Manos de una persona usando hilo dental entre los dientes anteriores frente a un espejo, encuadre cerrado sin rostro completo.
- **Pie en la lectura:** La remoción mecánica diaria, con cepillo e hilo o auxiliares interproximales, es la herramienta más eficaz para desorganizar la biopelícula.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía realista en un baño doméstico bien iluminado, encuadre cerrado de la parte baja del rostro de un adulto joven visto de perfil, solo labios, mentón y manos visibles, pasando hilo dental entre los incisivos superiores con un movimiento suave en forma de C, dientes permanentes sanos, encía rosa, luz natural difusa desde una ventana, colores cálidos y naturales, fondo desenfocado con azulejos claros. Evitar: texto, logotipos, marcas de productos, marcas de agua, ojos o rostro completo, sangre, encía lastimada, dientes deformes.

### 08 · Tema 1.3 · figura 1.3.1 · 16:9

- **Identificador:** `caries-dental/m01/07`
- **Qué muestra:** Mesa con alimentos y bebidas comunes con azúcar: refresco, jugo envasado, pan dulce, dulces y galletas.
- **Pie en la lectura:** Bebidas azucaradas, pan dulce, galletas y dulces son fuentes frecuentes de azúcares libres en la dieta cotidiana.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía realista de bodegón sobre una mesa de madera clara con luz natural lateral: un vaso de refresco oscuro con burbujas, un vaso de jugo de naranja envasado, una concha de pan dulce, galletas con relleno, dulces de colores sin envoltura y una taza de café con terrones de azúcar al lado, composición ordenada y horizontal, colores naturales y apetitosos, fondo de pared blanca desenfocada. Evitar: texto, etiquetas de marca, logotipos, empaques reconocibles, marcas de agua, personas, aspecto de publicidad exagerada.

### 09 · Tema 1.3 · figura 1.3.2 · 4:3

- **Identificador:** `caries-dental/m01/08`
- **Qué muestra:** Mano de un adulto sostiene una botella de refresco junto a un escritorio de oficina con computadora, sin rostro visible.
- **Pie en la lectura:** Dar sorbos a una bebida azucarada durante horas multiplica las caídas de pH aunque la cantidad total parezca pequeña.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía realista de estilo documental en una oficina con luz natural de tarde: sobre un escritorio de madera con teclado y libreta, la mano de un adulto sostiene una botella de vidrio con refresco oscuro a medio consumir, junto a una taza de café y un plato con galletas, encuadre horizontal desde arriba en diagonal, solo se ven manos y antebrazos con camisa, colores naturales, profundidad de campo media. Evitar: texto, etiquetas de marca, logotipos, pantallas con contenido legible, marcas de agua, rostro de la persona.

### 10 · Tema 1.3 · figura 1.3.3 · 1:1

- **Identificador:** `caries-dental/m01/09`
- **Qué muestra:** Vaso de agua natural junto a una fruta entera y un plato con verduras en una mesa familiar.
- **Pie en la lectura:** El agua como bebida principal y la fruta entera en lugar de jugos reducen las exposiciones a azúcares libres.
- **Tamaño:** 1400 × 1400 px

**Prompt:**

> Fotografía realista cuadrada sobre una mesa de cocina mexicana con mantel de algodón claro: un vaso de vidrio con agua natural fresca, una naranja entera, un plátano y un plato pequeño con pepino y jícama en bastones, luz natural suave de ventana, colores frescos y naturales, composición sencilla y ordenada, profundidad de campo corta, fondo de cocina desenfocado. Evitar: texto, etiquetas, logotipos, marcas de agua, personas, bebidas azucaradas, alimentos en mal estado.

### 11 · Tema 1.4 · figura 1.4.1 · 4:3

- **Identificador:** `caries-dental/m01/10`
- **Qué muestra:** Microscopio óptico antiguo de latón junto a cajas de Petri y un cuaderno de notas sobre una mesa de laboratorio de época.
- **Pie en la lectura:** La microbiología de finales del siglo XIX permitió a Miller relacionar bacterias, azúcares y ácidos con la caries.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía realista de ambientación histórica, mesa de laboratorio de madera oscura de finales del siglo diecinueve con un microscopio óptico antiguo de latón, varias cajas de Petri de vidrio, frascos de reactivos con tapón de corcho sin etiquetas legibles, una pluma y un cuaderno abierto con páginas en blanco, luz cálida lateral de ventana, atmósfera sobria, encuadre horizontal, colores sepia suaves y naturales. Evitar: texto legible, etiquetas, logotipos, marcas de agua, personas, objetos modernos, aspecto de caricatura.

### 12 · Tema 1.4 · figura 1.4.2 · 3:4

- **Identificador:** `caries-dental/m01/11`
- **Qué muestra:** Investigadora con bata, guantes y lentes de seguridad trabaja con placas de cultivo en una campana de flujo laminar.
- **Pie en la lectura:** La secuenciación genética de la biopelícula mostró que la caries es polimicrobiana y se explica mejor como disbiosis.
- **Tamaño:** 1200 × 1600 px

**Prompt:**

> Fotografía realista vertical en un laboratorio de microbiología moderno y luminoso: una investigadora vista de perfil y de espaldas, con bata blanca, guantes de nitrilo, lentes de seguridad, cubrebocas y cabello recogido, trabaja dentro de una campana de flujo laminar con placas de cultivo y una micropipeta, al fondo un secuenciador genético y estanterías ordenadas, luz blanca fría uniforme, colores naturales, profundidad de campo media. Evitar: texto legible, logotipos, marcas de agua, rostro identificable, manos sin guantes, desorden, aspecto de ciencia ficción.

### 13 · Tema 1.4 · figura 1.4.3 · 16:9

- **Identificador:** `caries-dental/m01/12`
- **Qué muestra:** Dos cajas de Petri lado a lado, una con colonias variadas y otra dominada por un solo tipo de colonia.
- **Pie en la lectura:** Representación de una comunidad diversa y equilibrada frente a una comunidad desplazada hacia pocas especies tolerantes al ácido.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía macro de laboratorio sobre fondo negro mate: dos cajas de Petri de vidrio colocadas lado a lado con agar claro; la de la izquierda muestra muchas colonias bacterianas pequeñas de distintos tamaños, formas y tonos crema, blanco y amarillo pálido; la de la derecha muestra colonias más numerosas pero casi todas del mismo tipo, pequeñas y blanquecinas, iluminación lateral suave que resalta el relieve, enfoque nítido, composición simétrica. Evitar: texto, etiquetas, marcadores escritos, logotipos, marcas de agua, manos sin guantes, colores artificiales.

### 14 · Tema 1.5 · figura 1.5.1 · 4:3

- **Identificador:** `caries-dental/m01/13`
- **Qué muestra:** Superficie vestibular de un premolar con mancha blanca opaca junto a la encía, al lado de otro con mancha marrón brillante.
- **Pie en la lectura:** Lesión activa, opaca y rugosa junto al margen gingival, frente a una lesión detenida, brillante y pigmentada.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica macro de dos premolares superiores permanentes vistos desde vestibular en la boca de un adulto, labio retraído con retractor: el primero con una mancha blanca opaca, mate y sin brillo, en forma de media luna junto al margen de la encía con una capa tenue de placa; el segundo con una mancha marrón claro, lisa y brillante en el tercio cervical, encía sana rosa pálido, iluminación uniforme de lámpara dental, enfoque nítido. Evitar: texto, flechas, etiquetas, logotipos, marcas de agua, sangre, encía inflamada exagerada, rostro visible, dientes deformes.

### 15 · Tema 1.5 · figura 1.5.2 · 3:4

- **Identificador:** `caries-dental/m01/14`
- **Qué muestra:** Odontólogo con equipo de protección conversa con un paciente sentado en la unidad dental mientras le muestra un modelo de dientes.
- **Pie en la lectura:** Explicar al paciente la diferencia entre controlar la enfermedad y reparar el daño es parte del tratamiento.
- **Tamaño:** 1200 × 1600 px

**Prompt:**

> Fotografía realista vertical en un consultorio dental luminoso: un odontólogo con bata, guantes de nitrilo, cubrebocas y lentes de protección, sentado de frente a un paciente adulto que está en la unidad dental de espaldas a la cámara, muestra con la mano un modelo tipodonto de arcada completa, ambiente de conversación tranquila, luz natural mezclada con luz de consultorio, colores naturales, profundidad de campo media, encuadre desde atrás del hombro del paciente. Evitar: texto, logotipos, marcas de agua, rostro identificable del paciente, sangre, manos sin guantes, modelos con dientes deformes.

### 16 · Tema 1.5 · figura 1.5.3 · 16:9

- **Identificador:** `caries-dental/m01/15`
- **Qué muestra:** Cepillo dental con pasta, vaso de agua y fruta entera sobre un lavabo limpio.
- **Pie en la lectura:** El control de la enfermedad ocurre sobre todo en casa: cepillado con pasta fluorada, agua como bebida y menos azúcares libres.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía realista horizontal de un lavabo blanco limpio en un baño doméstico con luz natural suave: un cepillo dental de cerdas suaves con una pequeña cantidad de pasta blanca, un vaso de vidrio con agua y, al lado, una manzana roja entera sobre una toalla doblada de color claro, composición ordenada con espacio vacío a la derecha, colores frescos y naturales, profundidad de campo corta. Evitar: texto, logotipos, marcas comerciales, empaques reconocibles, marcas de agua, personas, desorden.

## Módulo 2 · Estructura dental, saliva y el equilibrio entre desmineralización y remineralización

Carpeta: `imagenes-academia/02-caries-dental/modulo-02/` · 16 imágenes (5 de 16:9, 6 de 4:3, 2 de 1:1, 3 de 3:4).

### 01 · Portada del módulo · 16:9

- **Identificador:** `caries-dental/m02/portada`
- **Qué muestra:** Corte longitudinal de un molar que muestra esmalte, dentina y pulpa, junto a gotas de saliva sobre la superficie dental.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Ilustración realista de alta calidad, estilo fotografía de estudio científico, de un molar permanente inferior cortado longitudinalmente sobre fondo azul petróleo oscuro: se distinguen el esmalte blanco translúcido de la corona, la dentina color marfil con textura fina, la cámara pulpar rosada y los conductos de las dos raíces, con pequeñas gotas brillantes de líquido transparente sobre la superficie oclusal, iluminación lateral suave que resalta las capas, composición horizontal con espacio libre a la izquierda. Evitar: texto, etiquetas, flechas, logotipos, marcas de agua, sangre, anatomía incorrecta, número equivocado de raíces.

### 02 · Tema 2.1 · figura 2.1.1 · 4:3

- **Identificador:** `caries-dental/m02/01`
- **Qué muestra:** Superficie vestibular de incisivos superiores sanos con esmalte brillante y translúcido en el borde incisal.
- **Pie en la lectura:** El esmalte sano es liso, brillante y ligeramente translúcido, sobre todo en los bordes incisales, donde no hay dentina debajo.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica macro de los incisivos centrales y laterales superiores permanentes de un adulto joven, vista frontal con labios separados por retractor transparente, esmalte sano, liso y brillante con leve translucidez azulada en los bordes incisales, finas líneas horizontales naturales en la superficie, encía sana rosa pálido con festoneado regular, iluminación difusa con flash anular, colores naturales, enfoque nítido. Evitar: texto, flechas, logotipos, marcas de agua, sangre, manchas o caries, carillas artificiales, rostro visible, dientes deformes.

### 03 · Tema 2.1 · figura 2.1.2 · 1:1

- **Identificador:** `caries-dental/m02/02`
- **Qué muestra:** Vista oclusal de un primer molar permanente recién erupcionado con fisuras profundas y encía aún cubriendo parte de la cara distal.
- **Pie en la lectura:** Un primer molar permanente recién erupcionado: fisuras profundas y esmalte todavía en maduración, una combinación de alto riesgo.
- **Tamaño:** 1400 × 1400 px

**Prompt:**

> Fotografía clínica macro, vista oclusal de un primer molar inferior permanente recién erupcionado en la boca de un niño de unos siete años, con fosetas y fisuras profundas y estrechas, esmalte limpio y brillante, un pequeño opérculo de encía rosada sobre la parte distal de la corona, molares temporales visibles al lado, espejo bucal en el borde del encuadre sostenido por mano con guante, luz de lámpara dental uniforme, encuadre cuadrado. Evitar: texto, flechas, logotipos, marcas de agua, sangre, caries cavitadas, rostro, número incorrecto de cúspides.

### 04 · Tema 2.1 · figura 2.1.3 · 3:4

- **Identificador:** `caries-dental/m02/03`
- **Qué muestra:** Ilustración realista de prismas de esmalte vistos al microscopio con forma de ojo de cerradura.
- **Pie en la lectura:** Los prismas del esmalte, vistos en corte, tienen forma de ojo de cerradura y están rodeados de esmalte interprismático.
- **Tamaño:** 1200 × 1600 px

**Prompt:**

> Ilustración científica realista estilo micrografía electrónica de barrido en escala de grises con un ligero tono marfil, vista en corte transversal de esmalte dental grabado que muestra decenas de prismas con forma de ojo de cerradura ordenados en filas, separados por esmalte interprismático con cristales orientados en otra dirección, relieve marcado por iluminación lateral, composición vertical, alta nitidez. Evitar: texto, barras de escala, etiquetas, flechas, logotipos, marcas de agua, colores artificiales saturados, aspecto de caricatura.

### 05 · Tema 2.2 · figura 2.2.1 · 3:4

- **Identificador:** `caries-dental/m02/04`
- **Qué muestra:** Corte longitudinal de un premolar extraído que muestra esmalte, dentina, cámara pulpar y conducto radicular.
- **Pie en la lectura:** Corte longitudinal de un premolar: el esmalte cubre la corona, la dentina forma el cuerpo del diente y rodea a la pulpa.
- **Tamaño:** 1200 × 1600 px

**Prompt:**

> Fotografía macro de estudio, vertical, de un premolar superior permanente extraído y cortado longitudinalmente en sentido vestíbulo palatino, pulido y limpio, colocado sobre fondo negro mate: se aprecian el esmalte blanco translúcido en la corona, la dentina color marfil con textura fina, la cámara pulpar vacía y dos conductos radiculares estrechos, la raíz cubierta por una capa delgada más opaca, iluminación lateral suave que resalta las capas, enfoque nítido. Evitar: texto, etiquetas, flechas, logotipos, marcas de agua, sangre, restos de tejido blando, anatomía incorrecta.

### 06 · Tema 2.2 · figura 2.2.2 · 16:9

- **Identificador:** `caries-dental/m02/05`
- **Qué muestra:** Ilustración realista de túbulos dentinarios abiertos vistos al microscopio, como pequeños orificios circulares.
- **Pie en la lectura:** Los túbulos dentinarios, vistos en corte transversal, aparecen como pequeños orificios; cerca de la pulpa son más numerosos y anchos.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Ilustración científica realista estilo micrografía electrónica de barrido en tonos grises cálidos, vista de una superficie de dentina cortada en sentido transversal que muestra cientos de orificios circulares de túbulos dentinarios distribuidos de forma regular, cada uno rodeado por un anillo de dentina peritubular más densa, algunos túbulos parcialmente obliterados por depósitos minerales, composición horizontal, iluminación lateral que da relieve, alta nitidez. Evitar: texto, barras de escala, etiquetas, flechas, logotipos, marcas de agua, colores artificiales, aspecto de caricatura.

### 07 · Tema 2.2 · figura 2.2.3 · 4:3

- **Identificador:** `caries-dental/m02/06`
- **Qué muestra:** Caninos y premolares inferiores de un adulto mayor con recesión de encía y raíces expuestas de color amarillento.
- **Pie en la lectura:** La recesión gingival expone cemento y dentina radicular, superficies más vulnerables a la caries que el esmalte.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica realista de la zona de caninos y premolares inferiores de un adulto mayor, vista vestibular con labio retraído por un retractor transparente, recesión gingival que deja expuestos unos tres milímetros de raíz de color amarillento, esmalte coronal con desgaste leve y sin cavidades, encía rosa pálido firme sin inflamación, iluminación uniforme de lámpara dental, colores naturales, enfoque nítido. Evitar: texto, flechas, logotipos, marcas de agua, sangre, inflamación exagerada, rostro visible, caries cavitadas, dientes deformes.

### 08 · Tema 2.3 · figura 2.3.1 · 4:3

- **Identificador:** `caries-dental/m02/07`
- **Qué muestra:** Ilustración anatómica realista de perfil de cabeza y cuello que muestra la ubicación de las glándulas parótida, submandibular y sublingual.
- **Pie en la lectura:** Las tres glándulas salivales mayores: parótida, submandibular y sublingual.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Ilustración anatómica médica realista, vista lateral de la cabeza y el cuello de un adulto con la piel parcialmente transparente, mostrando la glándula parótida delante de la oreja con su conducto cruzando la mejilla, la glándula submandibular bajo el borde de la mandíbula y la glándula sublingual en el piso de la boca, músculos y hueso mandibular en tonos suaves, estilo de atlas de anatomía, fondo blanco limpio, iluminación uniforme, rostro sin rasgos identificables. Evitar: texto, etiquetas, flechas, logotipos, marcas de agua, sangre, aspecto de caricatura, proporciones incorrectas.

### 09 · Tema 2.3 · figura 2.3.2 · 1:1

- **Identificador:** `caries-dental/m02/08`
- **Qué muestra:** Tubo graduado con saliva sobre una bandeja clínica junto a un cronómetro y una pastilla de parafina.
- **Pie en la lectura:** Material para una prueba de flujo salival estimulado: recipiente graduado, cronómetro y parafina para masticar.
- **Tamaño:** 1400 × 1400 px

**Prompt:**

> Fotografía clínica realista, encuadre cuadrado, sobre una bandeja de acero inoxidable cubierta con campo desechable azul claro: un tubo cónico graduado transparente con algunos mililitros de líquido claro ligeramente espumoso, un vaso desechable pequeño, un cronómetro digital sin números legibles, una pastilla blanca de parafina y una mano con guante de nitrilo sosteniendo el tubo, luz blanca uniforme de consultorio, colores limpios, enfoque nítido. Evitar: texto, números legibles, etiquetas, logotipos, marcas de agua, sangre, manos sin guante, rostro.

### 10 · Tema 2.3 · figura 2.3.3 · 16:9

- **Identificador:** `caries-dental/m02/09`
- **Qué muestra:** Odontóloga con equipo de protección revisa con un paciente adulto la lista de medicamentos que este le muestra en una hoja.
- **Pie en la lectura:** Revisar los medicamentos del paciente es indispensable para identificar causas de hiposalivación.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía realista horizontal en un consultorio dental luminoso: una odontóloga con bata, cubrebocas y lentes de protección, sentada junto a un paciente adulto mayor que está de espaldas a la cámara en la unidad dental, ambos miran una hoja de papel y varias cajas de medicamento sin etiquetas legibles sobre una mesa auxiliar, gesto de conversación atenta, luz natural suave mezclada con luz de consultorio, colores naturales, profundidad de campo media. Evitar: texto legible, nombres de medicamentos, logotipos, marcas de agua, rostro identificable del paciente, manos sin guantes en contacto clínico.

### 11 · Tema 2.4 · figura 2.4.1 · 4:3

- **Identificador:** `caries-dental/m02/10`
- **Qué muestra:** Corte fino de esmalte bajo luz polarizada que muestra una lesión en forma de cuña con bandas de distinto tono.
- **Pie en la lectura:** Vista al microscopio de luz polarizada de una lesión inicial de esmalte: el cuerpo de la lesión queda bajo una capa superficial íntegra.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Imagen realista de microscopía de luz polarizada de un corte delgado de esmalte dental, con una lesión de caries inicial en forma de cuña que se abre hacia la superficie, una banda superficial delgada y uniforme, un cuerpo de la lesión de tonos más brillantes y azulados, y bandas internas más oscuras y translúcidas hacia la profundidad, fondo de esmalte sano con estrías paralelas, colores de interferencia suaves, composición horizontal. Evitar: texto, barras de escala, etiquetas, flechas, logotipos, marcas de agua, aspecto de caricatura.

### 12 · Tema 2.4 · figura 2.4.2 · 4:3

- **Identificador:** `caries-dental/m02/11`
- **Qué muestra:** Radiografía de aleta de mordida de premolares y molares con una zona radiolúcida pequeña bajo el punto de contacto de un premolar.
- **Pie en la lectura:** En las caras proximales, la lesión se inicia por debajo del punto de contacto; la radiografía de aleta de mordida ayuda a detectarla.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Imagen radiográfica dental realista de aleta de mordida del lado derecho de un adulto, en escala de grises, que muestra premolares y molares superiores e inferiores en oclusión con coronas, cámaras pulpares y crestas óseas bien definidas, con una pequeña zona radiolúcida triangular en el esmalte de la cara distal de un premolar inferior justo por debajo del punto de contacto, contraste y nitidez de radiografía digital de buena calidad, encuadre horizontal. Evitar: texto, letras de orientación, números, flechas, marcadores, logotipos, marcas de agua, restauraciones excesivas, anatomía incorrecta.

### 13 · Tema 2.4 · figura 2.4.3 · 16:9

- **Identificador:** `caries-dental/m02/12`
- **Qué muestra:** Odontólogo con guantes seca con aire la superficie de un molar para observar una lesión inicial.
- **Pie en la lectura:** Secar la superficie con aire hace visible una lesión subsuperficial que puede pasar inadvertida con el diente húmedo.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía clínica realista horizontal, encuadre cerrado de la arcada inferior posterior de un paciente adulto, una mano con guante de nitrilo sostiene la jeringa triple dirigiendo aire sobre un primer molar inferior mientras la otra mano sostiene un espejo bucal, rollo de algodón en vestibular para aislamiento relativo, superficie del molar limpia, iluminación de lámpara dental intensa y uniforme, colores naturales, enfoque en el molar. Evitar: texto, logotipos, marcas de agua, sangre, rostro visible, manos sin guantes, instrumental oxidado, dientes deformes.

### 14 · Tema 2.5 · figura 2.5.1 · 4:3

- **Identificador:** `caries-dental/m02/13`
- **Qué muestra:** Molares inferiores con manchas blancas brillantes y lisas en la cara vestibular, signo de lesiones detenidas.
- **Pie en la lectura:** Lesiones de esmalte detenidas: conservan el color blanco, pero su superficie es brillante, lisa y dura, y no hay biopelícula encima.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica macro de los molares inferiores permanentes de un adulto joven, vista vestibular con mejilla retraída por un retractor transparente, cada molar con una banda blanca bien delimitada cerca del tercio cervical, de superficie lisa y brillante que refleja la luz, sin placa visible, encía sana rosa pálido, esmalte limpio, iluminación con flash anular uniforme, colores naturales, enfoque nítido. Evitar: texto, flechas, etiquetas, logotipos, marcas de agua, sangre, cavidades, rostro, encía inflamada, dientes deformes.

### 15 · Tema 2.5 · figura 2.5.2 · 3:4

- **Identificador:** `caries-dental/m02/14`
- **Qué muestra:** Adolescente frente al espejo se cepilla los dientes posteriores, visto de perfil y con el rostro parcialmente fuera de cuadro.
- **Pie en la lectura:** El cepillado diario con pasta fluorada aporta dos cosas a la vez: remoción de biopelícula y fluoruro disponible para la remineralización.
- **Tamaño:** 1200 × 1600 px

**Prompt:**

> Fotografía realista vertical en un baño doméstico con luz natural, un adolescente visto de perfil desde el hombro, con la mitad superior del rostro fuera del encuadre, se cepilla los dientes posteriores con un cepillo de cerdas suaves y una pequeña cantidad de pasta blanca, inclinando el cepillo hacia la encía, espejo y lavabo blanco desenfocados al fondo, colores naturales y frescos, enfoque en la mano y el cepillo. Evitar: texto, logotipos, marcas comerciales, marcas de agua, ojos o rostro completo, sangre, espuma exagerada.

### 16 · Tema 2.5 · figura 2.5.3 · 16:9

- **Identificador:** `caries-dental/m02/15`
- **Qué muestra:** Odontóloga con equipo de protección toma una fotografía intraoral con cámara y retractores a un paciente del que solo se ven los dientes.
- **Pie en la lectura:** Las fotografías intraorales de control permiten comparar el aspecto de una lesión entre citas y demostrar al paciente su evolución.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía realista horizontal en un consultorio dental moderno: una odontóloga con bata, guantes de nitrilo, cubrebocas, gorro y lentes de protección sostiene una cámara réflex con flash anular frente a la boca de un paciente adulto reclinado, del que solo se ven los dientes anteriores expuestos con retractores de labios transparentes, un asistente con guantes sostiene un espejo intraoral, luz de consultorio limpia, colores naturales, profundidad de campo media. Evitar: texto, logotipos, marcas de cámara visibles, marcas de agua, rostro identificable del paciente, sangre, manos sin guantes.

## Módulo 3 · Factores de riesgo y evaluación del riesgo de caries con CAMBRA e ICCMS

Carpeta: `imagenes-academia/02-caries-dental/modulo-03/` · 16 imágenes (6 de 16:9, 5 de 4:3, 3 de 3:4, 2 de 1:1).

### 01 · Portada del módulo · 16:9

- **Identificador:** `caries-dental/m03/portada`
- **Qué muestra:** Odontólogo con equipo de protección revisa un formulario en una tableta junto a la unidad dental mientras un paciente espera reclinado.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía realista de gran formato en un consultorio dental moderno y ordenado en México: un odontólogo con bata, guantes de nitrilo, cubrebocas y lentes de protección revisa una tableta con una pantalla de formulario borrosa e ilegible, sentado junto a la unidad dental donde un paciente adulto está reclinado y visto desde atrás de la cabecera, bandeja con espejo y sonda sobre campo desechable, luz natural de ventana mezclada con luz de consultorio, colores naturales, profundidad de campo media, composición horizontal con espacio libre a la derecha. Evitar: texto legible, logotipos, marcas de agua, rostro identificable del paciente, sangre, manos sin guantes.

### 02 · Tema 3.1 · figura 3.1.1 · 4:3

- **Identificador:** `caries-dental/m03/01`
- **Qué muestra:** Odontóloga con equipo de protección conversa con un paciente adulto sentado en la unidad dental, vista desde detrás del paciente.
- **Pie en la lectura:** La evaluación del riesgo empieza con una conversación: hábitos, salud general, medicamentos y experiencias previas con la caries.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía realista en un consultorio dental luminoso: una odontóloga con bata, cubrebocas, lentes de protección y guantes de nitrilo sostiene una tabla con hojas en blanco mientras conversa con un paciente adulto sentado en la unidad dental, el paciente se ve de espaldas y de perfil lejano sin rostro identificable, gesto de escucha atenta, bandeja de instrumental cubierta al fondo, luz natural suave, colores cálidos y naturales, encuadre horizontal medio. Evitar: texto legible, logotipos, marcas de agua, rostro del paciente, sangre, manos sin guantes, ambiente desordenado.

### 03 · Tema 3.1 · figura 3.1.2 · 16:9

- **Identificador:** `caries-dental/m03/02`
- **Qué muestra:** Dos arcadas en modelos de estudio, una con varias restauraciones antiguas y otra sin restauraciones pero con manchas blancas.
- **Pie en la lectura:** Muchas restauraciones no significan enfermedad activa, y una boca sin restauraciones puede tener lesiones activas: experiencia y actividad son cosas distintas.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía realista de estudio sobre fondo gris claro: dos modelos de arcada inferior permanente tipo tipodonto colocados lado a lado, el de la izquierda con varias restauraciones antiguas de amalgama y resina en molares y premolares pero superficies limpias y brillantes, el de la derecha sin restauraciones pero con manchas blancas opacas junto al margen gingival de varios dientes, anatomía dental correcta, iluminación difusa uniforme, enfoque nítido, composición horizontal simétrica. Evitar: texto, etiquetas, flechas, logotipos, marcas de agua, sangre, dientes deformes, número incorrecto de dientes.

### 04 · Tema 3.1 · figura 3.1.3 · 3:4

- **Identificador:** `caries-dental/m03/03`
- **Qué muestra:** Promotora de salud con cubrebocas enseña cepillado con un modelo dental a un grupo de niños de espaldas en un aula.
- **Pie en la lectura:** La prevención poblacional, como la educación en escuelas, complementa la evaluación individual del riesgo.
- **Tamaño:** 1200 × 1600 px

**Prompt:**

> Fotografía documental realista vertical en un aula de primaria pública en México con luz natural: una promotora de salud con bata blanca y cubrebocas sostiene un modelo dental grande y un cepillo de dientes, mostrando el movimiento del cepillado a un grupo de niñas y niños sentados en pupitres que se ven de espaldas, sin rostros visibles, pizarrón verde vacío al fondo, colores naturales, ambiente alegre y ordenado. Evitar: texto, letreros, logotipos, marcas de agua, rostros identificables de menores, desorden, aspecto de publicidad.

### 05 · Tema 3.2 · figura 3.2.1 · 4:3

- **Identificador:** `caries-dental/m03/04`
- **Qué muestra:** Incisivos y caninos superiores con manchas blancas opacas en el tercio cervical de la cara vestibular.
- **Pie en la lectura:** Las manchas blancas activas en superficies lisas son uno de los indicadores de enfermedad que más pesan en la evaluación.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica macro de los incisivos y caninos superiores permanentes de un adolescente, vista frontal con labio superior retraído por un retractor transparente, manchas blancas opacas, mate y bien delimitadas en el tercio cervical de la cara vestibular de varios dientes, con una película tenue de placa cerca de la encía, encía ligeramente enrojecida en el margen, iluminación de flash anular uniforme, colores naturales, enfoque nítido. Evitar: texto, flechas, logotipos, marcas de agua, sangre, cavidades grandes, brackets, rostro visible, dientes deformes.

### 06 · Tema 3.2 · figura 3.2.2 · 1:1

- **Identificador:** `caries-dental/m03/05`
- **Qué muestra:** Arcada superior con brackets metálicos y placa acumulada alrededor de algunos de ellos.
- **Pie en la lectura:** Los aparatos de ortodoncia crean nuevas zonas de retención de biopelícula y son un factor de riesgo en CAMBRA.
- **Tamaño:** 1400 × 1400 px

**Prompt:**

> Fotografía clínica macro cuadrada de los premolares y caninos superiores permanentes de un adolescente con brackets metálicos y arco de alambre, vista vestibular con labio retraído por retractor transparente, acumulación visible de placa blanquecina alrededor de la base de algunos brackets cerca de la encía, encía ligeramente inflamada en el margen, iluminación uniforme de flash anular, colores naturales, enfoque nítido. Evitar: texto, flechas, logotipos, marcas de agua, sangre, rostro visible, alambres deformes, dientes deformes.

### 07 · Tema 3.2 · figura 3.2.3 · 16:9

- **Identificador:** `caries-dental/m03/06`
- **Qué muestra:** Manos con guantes aplican revelador de placa con un hisopo en los dientes de un paciente, encuadre cerrado de la boca.
- **Pie en la lectura:** El revelador de placa permite registrar la biopelícula de manera objetiva y compararla entre citas.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía clínica realista horizontal, encuadre cerrado de la boca de un paciente adulto con labios separados por retractor transparente, una mano con guante de nitrilo azul aplica con un hisopo líquido revelador de color magenta sobre las caras vestibulares de los dientes anteriores inferiores, otra mano con guante sostiene un espejo bucal, dientes permanentes sanos, encía rosa, luz de lámpara dental uniforme, colores naturales, enfoque nítido. Evitar: texto, logotipos, marcas de agua, sangre, rostro completo, manos sin guantes, tinción derramada fuera de la boca.

### 08 · Tema 3.3 · figura 3.3.1 · 4:3

- **Identificador:** `caries-dental/m03/07`
- **Qué muestra:** Odontopediatra con equipo de protección revisa los dientes de un niño pequeño sentado en el regazo de su madre, en posición rodilla con rodilla.
- **Pie en la lectura:** En menores de seis años, la evaluación se hace junto con la persona cuidadora, que aporta la información sobre dieta, higiene y antecedentes familiares.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica realista en un consultorio odontopediátrico luminoso: una odontopediatra con bata de color claro, guantes de nitrilo, cubrebocas y lentes de protección sentada frente a una madre, ambas rodilla con rodilla, con un niño de unos dos años recostado sobre sus piernas con la cabeza hacia la odontóloga, que levanta suavemente su labio superior para observar los dientes temporales anteriores, rostros fuera de cuadro o de perfil lejano, luz cálida, colores naturales. Evitar: texto, logotipos, marcas de agua, rostros identificables, llanto, sangre, manos sin guantes.

### 09 · Tema 3.3 · figura 3.3.2 · 16:9

- **Identificador:** `caries-dental/m03/08`
- **Qué muestra:** Mano con guante sostiene una tableta con un formulario clínico ilegible junto a una bandeja de exploración dental.
- **Pie en la lectura:** Llenar el formulario en cada revisión permite comparar la puntuación en el tiempo y documentar los cambios.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía realista horizontal en un consultorio dental: primer plano de una mano con guante de nitrilo azul que sostiene un lápiz digital sobre una tableta cuya pantalla muestra un formulario con casillas borrosas e ilegibles, al lado una bandeja de acero con espejo bucal, sonda de punta roma y pinzas sobre campo desechable azul, fondo desenfocado con la unidad dental, luz blanca uniforme, colores limpios, profundidad de campo corta. Evitar: texto legible, números legibles, logotipos, marcas de agua, rostros, manos sin guantes, sangre.

### 10 · Tema 3.3 · figura 3.3.3 · 3:4

- **Identificador:** `caries-dental/m03/09`
- **Qué muestra:** Vista oclusal de molares inferiores con fisuras profundas y pigmentadas sin cavidades.
- **Pie en la lectura:** Las fosetas y fisuras profundas son un factor de riesgo, pero no indican por sí solas que la enfermedad esté activa.
- **Tamaño:** 1200 × 1600 px

**Prompt:**

> Fotografía clínica macro vertical de los molares inferiores permanentes de un adolescente vistos desde oclusal con espejo bucal sostenido por mano con guante, fosetas y fisuras profundas y estrechas con ligera pigmentación marrón en el fondo, sin cavidades ni opacidades, esmalte limpio y brillante en las cúspides, saliva natural, iluminación de lámpara dental uniforme, colores naturales, enfoque nítido. Evitar: texto, flechas, logotipos, marcas de agua, sangre, cavidades, restauraciones, rostro, número incorrecto de cúspides.

### 11 · Tema 3.4 · figura 3.4.1 · 16:9

- **Identificador:** `caries-dental/m03/10`
- **Qué muestra:** Odontóloga con equipo de protección examina con espejo y sonda roma los molares de un paciente, con jeringa triple a la mano.
- **Pie en la lectura:** ICCMS se apoya en un examen visual minucioso, sobre dientes limpios y secos, para clasificar cada lesión por etapa y actividad.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía clínica realista horizontal en un consultorio moderno: una odontóloga con bata, guantes de nitrilo, cubrebocas, gorro y careta transparente examina con espejo bucal y sonda de punta roma los molares inferiores de un paciente adulto reclinado, mientras una asistente con el mismo equipo de protección sostiene la jeringa triple y el eyector, encuadre cercano en el que del paciente solo se ve la boca abierta con aislamiento relativo de algodón, luz de lámpara dental intensa, colores naturales. Evitar: texto, logotipos, marcas de agua, rostro identificable del paciente, sangre, manos sin guantes.

### 12 · Tema 3.4 · figura 3.4.2 · 4:3

- **Identificador:** `caries-dental/m03/11`
- **Qué muestra:** Odontólogo con cubrebocas y una paciente adulta revisan juntos una pantalla con fotografías intraorales borrosas.
- **Pie en la lectura:** Decidir el plan con el paciente, mostrándole sus propias imágenes, es parte central del ciclo 4D.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía realista en un consultorio dental moderno: un odontólogo con bata, cubrebocas y lentes de protección y una paciente adulta sentada en la unidad dental, vista de espaldas y de perfil lejano, observan juntos un monitor montado en la unidad que muestra fotografías intraorales de dientes desenfocadas y sin detalles legibles, el odontólogo señala la pantalla con la mano, ambiente de conversación tranquila, luz natural y de consultorio, colores naturales. Evitar: texto legible, logotipos, marcas de agua, rostro identificable de la paciente, sangre, desorden.

### 13 · Tema 3.4 · figura 3.4.3 · 1:1

- **Identificador:** `caries-dental/m03/12`
- **Qué muestra:** Bandeja de exploración con espejo, sonda de punta roma, pinzas y rollos de algodón sobre campo desechable.
- **Pie en la lectura:** El examen para ICCMS requiere poco instrumental: espejo, sonda de punta roma, aire, buena luz y aislamiento relativo.
- **Tamaño:** 1400 × 1400 px

**Prompt:**

> Fotografía realista cuadrada vista desde arriba de una bandeja de acero inoxidable sobre campo desechable azul claro en un consultorio dental: espejo bucal plano, sonda periodontal de punta roma, pinzas de curación, varios rollos de algodón y gasas dobladas, todo ordenado en paralelo, iluminación blanca uniforme y suave, sombras ligeras, colores limpios, alta nitidez. Evitar: texto, etiquetas, logotipos, marcas de agua, sangre, instrumental oxidado o sucio, exploradores puntiagudos, desorden.

### 14 · Tema 3.5 · figura 3.5.1 · 4:3

- **Identificador:** `caries-dental/m03/13`
- **Qué muestra:** Odontóloga con cubrebocas entrega a una paciente un cepillo interdental y le muestra cómo usarlo en un modelo dental.
- **Pie en la lectura:** Las metas concretas, como usar un cepillo interdental cada noche, funcionan mejor que las recomendaciones generales.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía realista en un consultorio dental luminoso: una odontóloga con bata, cubrebocas y lentes de protección muestra en un modelo tipodonto de arcada completa cómo introducir un cepillo interdental entre dos premolares, frente a una paciente adulta que observa de espaldas a la cámara con un cepillo interdental en la mano, primer plano de manos y modelo, luz natural suave, colores naturales, profundidad de campo corta. Evitar: texto, logotipos, marcas comerciales, marcas de agua, rostro identificable de la paciente, sangre, modelo con dientes deformes.

### 15 · Tema 3.5 · figura 3.5.2 · 16:9

- **Identificador:** `caries-dental/m03/14`
- **Qué muestra:** Recepción de un consultorio dental con una agenda en pantalla borrosa y una tarjeta de cita sobre el mostrador.
- **Pie en la lectura:** El intervalo de revisión se programa según el riesgo: más corto en riesgo alto y más largo en riesgo bajo.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía realista horizontal de la recepción de un consultorio dental moderno y limpio en México: mostrador de madera clara con una computadora cuya pantalla muestra un calendario desenfocado e ilegible, una tarjeta de cita en blanco y una planta pequeña, al fondo una sala de espera con sillas vacías y luz natural de ventana, colores cálidos y naturales, profundidad de campo media, ambiente ordenado. Evitar: texto legible, números legibles, logotipos, marcas de agua, personas con rostro identificable, desorden.

### 16 · Tema 3.5 · figura 3.5.3 · 3:4

- **Identificador:** `caries-dental/m03/15`
- **Qué muestra:** Familia en casa: manos de un adulto y de un niño cepillándose juntos frente al lavabo.
- **Pie en la lectura:** En niñas y niños, el plan preventivo se diseña con la familia y se cumple en casa.
- **Tamaño:** 1200 × 1600 px

**Prompt:**

> Fotografía realista vertical en un baño doméstico iluminado con luz natural: encuadre de las manos y antebrazos de un adulto y de un niño de unos seis años frente a un lavabo blanco, cada uno con un cepillo dental de cerdas suaves con una pequeña cantidad de pasta, el adulto guía la mano del niño, dos vasos de colores sobre el lavabo, ambiente cálido y familiar, colores naturales, sin rostros visibles. Evitar: texto, logotipos, marcas comerciales, marcas de agua, rostros, espuma exagerada, sangre.

## Módulo 4 · Diagnóstico de la caries: examen visual-táctil, ICDAS II y radiografías

Carpeta: `imagenes-academia/02-caries-dental/modulo-04/` · 16 imágenes (4 de 16:9, 9 de 4:3, 2 de 3:4, 1 de 1:1).

### 01 · Portada del módulo · 16:9

- **Identificador:** `caries-dental/m04/portada`
- **Qué muestra:** Odontóloga con equipo de protección examina con espejo y sonda los molares de un paciente bajo la luz de la unidad dental.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía clínica realista en formato panorámico de un consultorio dental moderno y luminoso. Una odontóloga con guantes de nitrilo, cubrebocas, lentes de protección y bata clara examina los molares inferiores de un paciente adulto recostado en la unidad, usando espejo bucal y sonda periodontal de punta roma. El encuadre muestra solo la boca abierta del paciente y las manos de la profesional, con baberos desechables y rollos de algodón visibles. Luz blanca de la lámpara dental, fondo desenfocado en tonos azul y blanco, colores naturales. Evitar: texto, logotipos, marcas de agua, sangre, rostro identificable del paciente, guantes ausentes, dientes deformes o en número incorrecto.

### 02 · Tema 4.1 · figura 4.1.1 · 4:3

- **Identificador:** `caries-dental/m04/01`
- **Qué muestra:** Bandeja de examen con espejo bucal, sonda de punta roma, pinzas, rollos de algodón y jeringa triple.
- **Pie en la lectura:** Instrumental básico para el examen de caries: espejo, sonda de punta roma, pinzas, rollos de algodón y jeringa triple para secar.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía de producto realista vista desde arriba de una bandeja metálica de examen dental sobre un campo desechable azul claro. Sobre la bandeja, alineados con orden: un espejo bucal plano, una sonda periodontal con punta esférica roma, unas pinzas de curación, cuatro rollos de algodón blancos y la punta de una jeringa triple de aire y agua. Iluminación suave y uniforme de consultorio, sombras ligeras, metal con brillo natural, enfoque nítido en todo el instrumental, colores limpios. Evitar: texto, logotipos, marcas comerciales, marcas de agua, sangre, instrumental oxidado, manos sin guantes, objetos ajenos al consultorio.

### 03 · Tema 4.1 · figura 4.1.2 · 4:3

- **Identificador:** `caries-dental/m04/02`
- **Qué muestra:** Manos con guantes secan con jeringa triple la cara oclusal de un molar aislado con rollos de algodón.
- **Pie en la lectura:** El secado con aire durante unos segundos hace visibles las opacidades que el agua disimula.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica macro realista de la arcada inferior de un adolescente, encuadre cerrado solo de la boca: un primer molar permanente aislado con rollos de algodón blancos en vestibular y lingual, la punta de una jeringa triple dirigida a la cara oclusal y un espejo bucal sostenido por una mano con guante de nitrilo morado. Superficie dental limpia y brillante, encía rosa pálido sana, iluminación blanca intensa de lámpara dental, profundidad de campo corta con enfoque en el molar. Evitar: texto, logotipos, marcas de agua, sangre, rostro visible, labios deformes, número incorrecto de cúspides, manos sin guantes.

### 04 · Tema 4.1 · figura 4.1.3 · 3:4

- **Identificador:** `caries-dental/m04/03`
- **Qué muestra:** Odontólogo con lupas de magnificación y equipo de protección completo examina a un paciente en la unidad dental.
- **Pie en la lectura:** La magnificación y una postura ergonómica ayudan a sostener un examen sistemático de todas las superficies.
- **Tamaño:** 1200 × 1600 px

**Prompt:**

> Fotografía vertical realista de un odontólogo sentado en posición ergonómica junto a la unidad dental, con lupas de magnificación sobre lentes de protección, cubrebocas quirúrgico, gorro, bata desechable azul y guantes de nitrilo, sosteniendo espejo y sonda. El paciente está recostado con lentes de protección y babero; solo se ve su mentón y la boca abierta desde un ángulo lateral, sin rostro identificable. Consultorio limpio y moderno, luz natural suave desde una ventana y luz blanca de la lámpara, colores neutros. Evitar: texto, logotipos, marcas de agua, sangre, rostro del paciente, postura encorvada, falta de equipo de protección.

### 05 · Tema 4.2 · figura 4.2.1 · 4:3

- **Identificador:** `caries-dental/m04/04`
- **Qué muestra:** Vista oclusal de un molar inferior con opacidades blancas en el fondo de las fisuras tras el secado.
- **Pie en la lectura:** Lesión compatible con código 1 o 2: opacidad blanca en fisuras, sin ruptura del esmalte. Se ve mejor con la superficie seca.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica macro realista, vista oclusal de un primer molar inferior permanente de un adolescente, con cinco cúspides bien formadas y fisuras en patrón correcto. Superficie limpia y seca con opacidades blancas tenues y yesosas en el fondo de las fisuras, sin cavidad, esmalte de las cúspides con brillo natural. Borde de encía sana rosa pálido en el contorno, rollos de algodón desenfocados a los lados, iluminación uniforme de lámpara dental, colores naturales, enfoque nítido. Evitar: texto, flechas, etiquetas, logotipos, marcas de agua, sangre, rostro, número incorrecto de cúspides, cavidades, restauraciones.

### 06 · Tema 4.2 · figura 4.2.2 · 4:3

- **Identificador:** `caries-dental/m04/05`
- **Qué muestra:** Molar superior con una sombra grisácea bajo el esmalte de la fosa central, sin cavidad abierta.
- **Pie en la lectura:** Lesión compatible con código 4: sombra oscura de dentina que se transparenta a través del esmalte.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica macro realista, vista oclusal de un primer molar superior permanente de un adulto joven, con cuatro cúspides y anatomía correcta. En la fosa central se aprecia una sombra gris azulada difusa bajo el esmalte, que conserva su superficie casi continua, sin cavidad abierta. Superficie limpia y seca, encía sana alrededor, iluminación uniforme y neutra de lámpara dental, fondo de campo oscuro desenfocado, colores naturales, alta nitidez. Evitar: texto, flechas, etiquetas, logotipos, marcas de agua, sangre, rostro, restauraciones metálicas, cavidades profundas abiertas, anatomía incorrecta.

### 07 · Tema 4.2 · figura 4.2.3 · 1:1

- **Identificador:** `caries-dental/m04/06`
- **Qué muestra:** Modelo tipodonto con molares que muestran distintos grados de lesión, desde mancha blanca hasta cavidad.
- **Pie en la lectura:** Los tipodontos con lesiones simuladas son útiles para calibrarse en ICDAS II antes de examinar pacientes.
- **Tamaño:** 1400 × 1400 px

**Prompt:**

> Fotografía de estudio realista de un modelo tipodonto de arcada inferior permanente sobre una mesa blanca de laboratorio de enseñanza. Los molares y premolares muestran lesiones simuladas de distinta severidad: una opacidad blanca en fisura, una mancha marrón en fosa, una pequeña microcavidad y una cavidad con dentina amarillenta visible, todo limpio y sin aspecto desagradable. Junto al modelo, una mano con guante de nitrilo sostiene una sonda de punta roma. Luz suave de estudio, fondo neutro, enfoque nítido en las superficies oclusales. Evitar: texto, números, etiquetas, logotipos, marcas de agua, sangre, encía inflamada, número incorrecto de dientes, manos sin guantes.

### 08 · Tema 4.3 · figura 4.3.1 · 4:3

- **Identificador:** `caries-dental/m04/07`
- **Qué muestra:** Incisivos y caninos inferiores con manchas blancas opacas a lo largo del margen de la encía.
- **Pie en la lectura:** Lesiones de mancha blanca probablemente activas: opacas, sin brillo y junto al margen gingival, donde se acumula la biopelícula.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica intraoral realista, vista frontal de los dientes anteriores inferiores de un adolescente, encuadre cerrado solo de dientes y encía, labios retraídos con separadores plásticos transparentes. A lo largo del tercio cervical de caninos e incisivos se ven bandas de manchas blancas opacas y mate siguiendo el contorno de la encía, que se nota ligeramente enrojecida. Superficie limpia y seca, iluminación clínica uniforme, colores naturales, enfoque nítido. Evitar: texto, flechas, etiquetas, logotipos, marcas de agua, sangre, rostro, brackets, cavidades profundas, dientes deformes o apiñamiento extremo.

### 09 · Tema 4.3 · figura 4.3.2 · 4:3

- **Identificador:** `caries-dental/m04/08`
- **Qué muestra:** Premolar con una mancha marrón brillante y lisa en la superficie vestibular, alejada de la encía.
- **Pie en la lectura:** Lesión probablemente inactiva: mancha marrón con brillo y superficie dura, sin biopelícula ni inflamación vecina.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica macro realista de la cara vestibular de un primer premolar superior de un adulto, encuadre cerrado de dos o tres dientes con labio retraído por un separador transparente. En el tercio medio de la superficie se observa una mancha marrón claro bien delimitada, con superficie lisa y brillante que refleja la luz, sin cavidad. Encía sana, firme y rosa pálido, sin biopelícula visible. Iluminación clínica uniforme, colores naturales, enfoque nítido. Evitar: texto, flechas, etiquetas, logotipos, marcas de agua, sangre, rostro, restauraciones, cálculo dental, aspecto descuidado.

### 10 · Tema 4.3 · figura 4.3.3 · 16:9

- **Identificador:** `caries-dental/m04/09`
- **Qué muestra:** Odontóloga con equipo de protección muestra al paciente, en una pantalla, una fotografía intraoral de sus dientes.
- **Pie en la lectura:** Compartir con el paciente las fotografías intraorales facilita explicar la diferencia entre lesiones activas y detenidas.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía realista en un consultorio dental moderno: una odontóloga con cubrebocas, lentes de protección, bata y guantes de nitrilo señala con un dedo una pantalla junto a la unidad, donde se ve una fotografía intraoral ampliada de dientes posteriores sanos con una pequeña mancha blanca. El paciente, sentado en la unidad y visto de espaldas o de perfil parcial con babero, observa la pantalla. Luz natural suave mezclada con luz de consultorio, colores neutros y limpios. Evitar: texto en la pantalla, logotipos, marcas de agua, sangre, rostro identificable del paciente, equipo de protección incompleto.

### 11 · Tema 4.4 · figura 4.4.1 · 4:3

- **Identificador:** `caries-dental/m04/10`
- **Qué muestra:** Maniquí de simulación radiológica con un posicionador de aleta de mordida colocado entre los dientes posteriores.
- **Pie en la lectura:** Posicionador de aleta de mordida en un maniquí de enseñanza: el receptor queda paralelo a las coronas y el anillo guía la alineación del tubo.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía realista de un maniquí de simulación de radiología dental con arcadas de tipodonto en una sala de enseñanza, visto de lado. Entre los dientes posteriores sostiene un posicionador de aleta de mordida de plástico con su anillo guía azul, y el cono rectangular del equipo de rayos X intraoral está alineado con el anillo. Una mano con guante de nitrilo ajusta el posicionador. Luz clínica blanca y uniforme, paredes claras, colores naturales, enfoque nítido en el posicionador. Evitar: texto, logotipos, marcas comerciales, marcas de agua, sangre, personas sin guantes, rostro humano real, cables desordenados.

### 12 · Tema 4.4 · figura 4.4.2 · 16:9

- **Identificador:** `caries-dental/m04/11`
- **Qué muestra:** Monitor de consultorio con una radiografía digital de aleta de mordida de dientes posteriores.
- **Pie en la lectura:** La radiografía digital de aleta de mordida permite ajustar brillo y contraste, pero la interpretación sigue exigiendo conocer sus limitaciones.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía realista de un monitor sobre un escritorio de consultorio dental, mostrando a pantalla completa una radiografía digital de aleta de mordida en escala de grises de premolares y molares superiores e inferiores de un adulto, con anatomía correcta, cámaras pulpares visibles y puntos de contacto abiertos. Una mano con guante de nitrilo sostiene un mouse en primer plano desenfocado. Iluminación tenue del entorno para que destaque la pantalla, colores neutros. Evitar: texto, números, nombres, interfaz de programa visible, logotipos, marcas de agua, sangre, rostro, dientes en número incorrecto.

### 13 · Tema 4.4 · figura 4.4.3 · 3:4

- **Identificador:** `caries-dental/m04/12`
- **Qué muestra:** Cabezal de rayos X intraoral con cono de colimación rectangular junto a la unidad dental.
- **Pie en la lectura:** El colimador rectangular reduce la superficie irradiada a la del receptor y, con ello, la dosis al paciente.
- **Tamaño:** 1200 × 1600 px

**Prompt:**

> Fotografía vertical realista del cabezal de un equipo de rayos X intraoral montado en brazo articulado de pared, con un cono de colimación rectangular de color gris claro, en un consultorio dental limpio y luminoso. Al fondo desenfocado se ve la unidad dental vacía con su lámpara apagada. Iluminación suave natural, colores neutros blancos y grises, enfoque nítido en el colimador. Evitar: texto, logotipos, marcas comerciales, etiquetas de advertencia legibles, marcas de agua, personas, pacientes, cables sueltos, ambiente sucio.

### 14 · Tema 4.5 · figura 4.5.1 · 4:3

- **Identificador:** `caries-dental/m04/13`
- **Qué muestra:** Punta de un escáner intraoral dirigida a los molares de un modelo tipodonto, sostenida por una mano con guante.
- **Pie en la lectura:** Algunos escáneres intraorales incorporan transiluminación con infrarrojo cercano para complementar la detección de lesiones proximales.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía realista y cercana de la punta de un escáner intraoral moderno de color blanco, sostenido por una mano con guante de nitrilo azul, colocado sobre los molares de un modelo tipodonto de arcada superior con dientes de anatomía correcta. Ambiente de consultorio limpio, fondo desenfocado en tonos claros, iluminación suave y uniforme, ligera luz azulada saliendo de la punta del escáner. Evitar: texto, logotipos, marcas comerciales, pantallas con interfaz, marcas de agua, sangre, rostro, manos sin guantes, número incorrecto de dientes.

### 15 · Tema 4.5 · figura 4.5.2 · 4:3

- **Identificador:** `caries-dental/m04/14`
- **Qué muestra:** Molar con una restauración de resina que presenta una fina línea de tinción en su margen oclusal.
- **Pie en la lectura:** Una tinción marginal no es sinónimo de caries: hay que valorar el margen, la textura y la actividad antes de reemplazar.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica macro realista, vista oclusal de un primer molar inferior permanente de un adulto con una restauración de resina del color del diente bien adaptada en la fosa central. En parte del margen se aprecia una fina línea marrón de tinción, sin cavidad ni dentina visible. Superficie limpia y seca, encía sana en el borde del encuadre, rollos de algodón desenfocados, iluminación uniforme de lámpara dental, colores naturales. Evitar: texto, flechas, etiquetas, logotipos, marcas de agua, sangre, rostro, amalgamas, fracturas dramáticas, anatomía incorrecta.

### 16 · Tema 4.5 · figura 4.5.3 · 16:9

- **Identificador:** `caries-dental/m04/15`
- **Qué muestra:** Asistente dental con equipo de protección registra hallazgos en un odontograma digital mientras el odontólogo dicta.
- **Pie en la lectura:** El trabajo en equipo agiliza el registro: el odontólogo examina y dicta, y la asistente anota códigos, actividad y fecha.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía realista en un consultorio dental moderno: un odontólogo con cubrebocas, lentes de protección, bata y guantes examina con espejo la boca de un paciente recostado, del que solo se ve el mentón y el babero. A su lado, una asistente dental con cubrebocas, lentes y bata escribe en una tableta montada junto a la unidad, cuya pantalla está desenfocada y sin texto legible. Luz clínica blanca y luz natural suave, colores limpios y neutros. Evitar: texto legible, logotipos, marcas de agua, sangre, rostro identificable del paciente, equipo de protección incompleto, desorden.

## Módulo 5 · Flúor y remineralización: mecanismos, vehículos y uso seguro

Carpeta: `imagenes-academia/02-caries-dental/modulo-05/` · 16 imágenes (3 de 16:9, 8 de 4:3, 2 de 3:4, 3 de 1:1).

### 01 · Portada del módulo · 16:9

- **Identificador:** `caries-dental/m05/portada`
- **Qué muestra:** Cepillo dental infantil con una pequeña cantidad de pasta junto a un salero y un vaso de agua sobre una mesa de cocina luminosa.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía realista en formato panorámico de una mesa de cocina mexicana luminosa por la mañana. En primer plano, un cepillo dental infantil de colores suaves con una cantidad muy pequeña de pasta blanca sobre las cerdas, junto a un salero de vidrio sin etiqueta y un vaso de agua transparente. Al fondo, desenfocados, un frutero con plátanos y manzanas y una ventana con luz natural cálida. Colores naturales, ambiente doméstico limpio y acogedor, profundidad de campo corta. Evitar: texto, etiquetas, marcas comerciales, logotipos, marcas de agua, personas, dulces o refrescos, exceso de pasta en el cepillo.

### 02 · Tema 5.1 · figura 5.1.1 · 4:3

- **Identificador:** `caries-dental/m05/01`
- **Qué muestra:** Ilustración realista de cristales alargados de esmalte agrupados en prismas, vistos a gran aumento.
- **Pie en la lectura:** Los cristales de apatita del esmalte, agrupados en prismas, son el escenario donde el fluoruro reduce la pérdida y favorece la recuperación de mineral.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Ilustración científica realista en estilo de microscopía electrónica de barrido coloreada en tonos marfil y azul muy suave, que muestra a gran aumento los prismas del esmalte dental como haces ordenados de cristales alargados y hexagonales, algunos con bordes ligeramente erosionados en la superficie y otros intactos en la profundidad. Iluminación lateral suave que resalta el relieve tridimensional, fondo oscuro neutro, composición limpia y educativa. Evitar: texto, etiquetas, flechas, escalas numéricas, logotipos, marcas de agua, colores saturados artificiales, aspecto de caricatura.

### 03 · Tema 5.1 · figura 5.1.2 · 3:4

- **Identificador:** `caries-dental/m05/02`
- **Qué muestra:** Manos de una madre ayudan a un niño a cepillarse los dientes frente al lavabo, vistos desde atrás.
- **Pie en la lectura:** La presencia diaria de fluoruro en la boca, gracias al cepillado, es la base de su efecto preventivo.
- **Tamaño:** 1200 × 1600 px

**Prompt:**

> Fotografía vertical realista en un baño doméstico limpio y luminoso: un niño de unos seis años, visto de espaldas y de perfil parcial sin rostro identificable, se cepilla los dientes frente al lavabo mientras la mano de una madre guía la suya sobre el mango del cepillo. En el lavabo blanco hay un vaso con otro cepillo y una toalla doblada. Luz natural suave de la mañana, colores cálidos y neutros, ambiente tranquilo. Evitar: texto, etiquetas, marcas comerciales, logotipos, marcas de agua, rostro identificable, espuma excesiva, desorden, tubos de pasta con rótulos.

### 04 · Tema 5.1 · figura 5.1.3 · 1:1

- **Identificador:** `caries-dental/m05/03`
- **Qué muestra:** Superficie vestibular de dientes anteriores sanos con brillo natural vista de cerca.
- **Pie en la lectura:** Un esmalte sano y brillante es el resultado de miles de ciclos diarios en los que la remineralización compensa la pérdida de mineral.
- **Tamaño:** 1400 × 1400 px

**Prompt:**

> Fotografía clínica macro realista de las caras vestibulares de los incisivos centrales y laterales superiores sanos de un adulto joven, encuadre cerrado solo de dientes y encía, labios retraídos con separadores plásticos transparentes. Esmalte translúcido en los bordes incisales, superficie lisa con brillo natural, encía rosa pálido firme con contorno festoneado sano. Iluminación clínica uniforme con flash anular suave, colores naturales, alta nitidez. Evitar: texto, logotipos, marcas de agua, sangre, rostro, labios visibles en exceso, manchas, restauraciones, dientes de forma artificial o demasiado blancos.

### 05 · Tema 5.2 · figura 5.2.1 · 4:3

- **Identificador:** `caries-dental/m05/04`
- **Qué muestra:** Salero de vidrio y un plato de comida casera mexicana sobre una mesa de madera.
- **Pie en la lectura:** La sal de mesa fluorurada es el vehículo de protección masiva contra la caries que eligió México.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía realista de una mesa de madera en una cocina familiar mexicana: un salero de vidrio transparente con sal fina blanca y tapa metálica, junto a un plato de frijoles caseros, tortillas en un tortillero de tela bordada y un vaso de agua. Luz natural lateral cálida de mediodía, colores naturales, composición sencilla y cotidiana, profundidad de campo media con el salero enfocado. Evitar: texto, etiquetas, marcas comerciales, logotipos, marcas de agua, personas, refrescos, comida poco apetitosa, exceso de objetos.

### 06 · Tema 5.2 · figura 5.2.2 · 16:9

- **Identificador:** `caries-dental/m05/05`
- **Qué muestra:** Paisaje semiárido del norte de México con un pozo de agua y un tanque elevado de una comunidad rural.
- **Pie en la lectura:** En varias regiones del centro y norte de México, el agua subterránea contiene fluoruro natural en concentraciones que pueden causar fluorosis.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía realista de paisaje en formato panorámico de una comunidad rural en una zona semiárida del altiplano mexicano: un pozo de agua con bomba y tubería metálica, un tanque elevado de concreto, nopales y mezquites alrededor, casas sencillas al fondo y montañas volcánicas en el horizonte. Cielo azul con pocas nubes, luz de media tarde cálida, colores naturales de tierra y verde seco. Evitar: texto, letreros, logotipos, marcas de agua, personas identificables, basura, imágenes de pobreza extrema o dramatizadas.

### 07 · Tema 5.2 · figura 5.2.3 · 4:3

- **Identificador:** `caries-dental/m05/06`
- **Qué muestra:** Odontóloga con cubrebocas conversa con una madre en el consultorio mientras revisan juntas una historia clínica.
- **Pie en la lectura:** Preguntar por el agua y la sal que se consumen en casa forma parte de la historia clínica en odontología.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía realista en un consultorio dental luminoso: una odontóloga con cubrebocas, bata blanca y lentes de protección sobre la cabeza conversa sentada con una madre que lleva cubrebocas, ambas inclinadas sobre una tabla con hojas de historia clínica sin texto legible. Al fondo, desenfocada, la unidad dental. Luz natural suave, ambiente cálido y profesional, colores neutros con toques de azul. Evitar: texto legible, logotipos, marcas de agua, sangre, rostros identificables sin cubrebocas, instrumental en uso, gestos de preocupación exagerada.

### 08 · Tema 5.3 · figura 5.3.1 · 4:3

- **Identificador:** `caries-dental/m05/07`
- **Qué muestra:** Dos cepillos infantiles sobre una superficie blanca: uno con una embarradita de pasta del tamaño de un grano de arroz y otro con una porción del tamaño de un chícharo.
- **Pie en la lectura:** Comparación de las cantidades de pasta que recomiendan las guías internacionales para la primera infancia: grano de arroz y chícharo.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía de producto realista vista desde arriba de dos cepillos dentales infantiles de mango corto y cerdas suaves, colocados en paralelo sobre una superficie blanca mate. El primero tiene una capa mínima de pasta blanca del tamaño de un grano de arroz extendida sobre las cerdas; el segundo tiene una pequeña porción redonda de pasta del tamaño de un chícharo. Junto a ellos, como referencia, un grano de arroz y un chícharo verde reales. Iluminación suave de estudio, sombras ligeras, colores limpios. Evitar: texto, etiquetas, marcas comerciales, logotipos, marcas de agua, tubos de pasta con rótulos, exceso de pasta.

### 09 · Tema 5.3 · figura 5.3.2 · 3:4

- **Identificador:** `caries-dental/m05/08`
- **Qué muestra:** Adulto se cepilla los dientes frente al espejo del baño, visto de espaldas.
- **Pie en la lectura:** Cepillarse antes de dormir y escupir el exceso sin enjuagar abundantemente ayuda a que el fluoruro permanezca en la boca.
- **Tamaño:** 1200 × 1600 px

**Prompt:**

> Fotografía vertical realista de un adulto joven visto de espaldas frente al espejo de un baño doméstico iluminado con luz cálida de noche, cepillándose los dientes; en el reflejo del espejo solo se distingue de forma desenfocada su silueta, sin rostro identificable. Sobre el lavabo, un vaso, un cepillo de repuesto y una toalla doblada. Ambiente limpio y sereno, colores cálidos, enfoque en la mano y el cepillo. Evitar: texto, etiquetas, marcas comerciales, logotipos, marcas de agua, rostro identificable, espuma excesiva, desorden.

### 10 · Tema 5.3 · figura 5.3.3 · 1:1

- **Identificador:** `caries-dental/m05/09`
- **Qué muestra:** Estante alto de un baño con productos de higiene bucal guardados fuera del alcance de un niño.
- **Pie en la lectura:** Guardar pastas, enjuagues y geles en un lugar alto o cerrado previene ingestiones accidentales en la infancia.
- **Tamaño:** 1400 × 1400 px

**Prompt:**

> Fotografía cuadrada realista del interior de un baño doméstico limpio: en un estante alto de madera clara, por encima del lavabo, se ven ordenados un vaso con cepillos, frascos de enjuague sin etiqueta y tubos de pasta blancos sin rótulos. En la parte baja del encuadre, desenfocada, la mano de un niño pequeño apoyada en el borde del lavabo sin alcanzar el estante. Luz natural suave, colores cálidos y neutros. Evitar: texto, etiquetas, marcas comerciales, logotipos, marcas de agua, rostros, medicamentos, desorden, situaciones de peligro dramatizadas.

### 11 · Tema 5.4 · figura 5.4.1 · 4:3

- **Identificador:** `caries-dental/m05/10`
- **Qué muestra:** Manos con guantes aplican barniz de fluoruro con un pequeño pincel sobre los molares de un niño.
- **Pie en la lectura:** El barniz de fluoruro se aplica en capa delgada con un pincel y endurece al contacto con la saliva.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica realista en encuadre cerrado de la boca abierta de un niño de unos cinco años con dentición temporal completa y sana, sin rostro visible más allá de los labios. Una mano con guante de nitrilo sostiene un microaplicador con punta de pincel y aplica una capa delgada y amarillenta de barniz sobre las caras de los molares inferiores temporales, mientras otra mano con guante retrae suavemente la mejilla con un espejo. Rollos de algodón en vestibular, luz clínica uniforme, colores naturales. Evitar: texto, logotipos, marcas de agua, sangre, rostro identificable, dientes permanentes en posición incorrecta, manos sin guantes, llanto.

### 12 · Tema 5.4 · figura 5.4.2 · 4:3

- **Identificador:** `caries-dental/m05/11`
- **Qué muestra:** Microaplicador junto a un pequeño recipiente de vidrio y un modelo tipodonto de dientes temporales en una mesa de enseñanza.
- **Pie en la lectura:** El diamino fluoruro de plata se aplica con microaplicador solo sobre la lesión, con protección de la mucosa y de las superficies vecinas.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía realista en una mesa de enseñanza de odontopediatría: un modelo tipodonto de dentición temporal completa con anatomía correcta, a su lado un pequeño vaso dappen de vidrio con unas gotas de líquido transparente, dos microaplicadores de punta fina, rollos de algodón y vaselina en un recipiente pequeño. Una mano con guante de nitrilo sostiene un microaplicador sobre un molar temporal del modelo. Luz suave de estudio, fondo claro y limpio, colores naturales. Evitar: texto, etiquetas, marcas comerciales, logotipos, marcas de agua, sangre, rostros, manchas negras exageradas, manos sin guantes.

### 13 · Tema 5.4 · figura 5.4.3 · 1:1

- **Identificador:** `caries-dental/m05/12`
- **Qué muestra:** Bandeja con presentación de dosis única de barniz, microaplicadores y rollos de algodón.
- **Pie en la lectura:** Las presentaciones de dosis única facilitan la bioseguridad en la aplicación de barniz.
- **Tamaño:** 1400 × 1400 px

**Prompt:**

> Fotografía de producto cuadrada y realista vista desde arriba de una bandeja de consultorio dental cubierta con un campo desechable azul: un pequeño contenedor de dosis única abierto sin etiquetas, dos microaplicadores con punta de pincel, rollos de algodón blancos, un espejo bucal y gasas dobladas. Iluminación suave y uniforme de consultorio, sombras ligeras, colores limpios y ordenados. Evitar: texto, etiquetas, marcas comerciales, logotipos, marcas de agua, sangre, instrumental sucio, manos sin guantes, objetos ajenos al consultorio.

### 14 · Tema 5.5 · figura 5.5.1 · 4:3

- **Identificador:** `caries-dental/m05/13`
- **Qué muestra:** Incisivos superiores con finas líneas blancas horizontales y pequeñas áreas opacas simétricas.
- **Pie en la lectura:** Fluorosis muy leve a leve: líneas y áreas blancas opacas, simétricas en dientes homólogos.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica realista de las caras vestibulares de los incisivos centrales y laterales superiores permanentes de un adolescente, encuadre cerrado solo de dientes y encía, labios retraídos con separadores plásticos transparentes. El esmalte muestra finas líneas blancas horizontales y pequeñas áreas opacas difusas en las puntas incisales, distribuidas de forma simétrica en los dientes homólogos, sin cavidades ni manchas marrones. Encía sana rosa pálido, iluminación clínica uniforme, colores naturales, alta nitidez. Evitar: texto, flechas, etiquetas, logotipos, marcas de agua, sangre, rostro, brackets, restauraciones, aspecto artificial.

### 15 · Tema 5.5 · figura 5.5.2 · 16:9

- **Identificador:** `caries-dental/m05/14`
- **Qué muestra:** Odontólogo con equipo de protección conversa con un padre en el consultorio mientras muestra un cepillo infantil.
- **Pie en la lectura:** Responder con datos a las preguntas sobre el flúor fortalece la confianza de las familias en la prevención.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía realista en formato panorámico de un consultorio dental luminoso: un odontólogo con cubrebocas, lentes de protección, bata y guantes sostiene un cepillo dental infantil y lo muestra a un padre con cubrebocas sentado frente a él; a su lado, un niño pequeño visto de espaldas juega con un peluche. Fondo desenfocado con la unidad dental y estantes ordenados. Luz natural suave, colores cálidos y neutros, ambiente de conversación tranquila. Evitar: texto, logotipos, marcas de agua, sangre, rostros identificables, instrumental en uso, expresiones de miedo.

### 16 · Tema 5.5 · figura 5.5.3 · 4:3

- **Identificador:** `caries-dental/m05/15`
- **Qué muestra:** Vaso de agua de garrafón y un salero sobre una barra de cocina, con un cuaderno de notas al lado.
- **Pie en la lectura:** Conocer el agua y la sal que se consumen en casa es parte de valorar la exposición total al fluoruro.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía realista de una barra de cocina doméstica con azulejos claros: un garrafón de agua purificada con dispensador, un vaso de vidrio con agua, un salero sin etiqueta y un cuaderno abierto con una pluma, sin texto legible. Luz natural lateral de la mañana, colores cálidos y limpios, composición ordenada, profundidad de campo media con el vaso enfocado. Evitar: texto legible, etiquetas, marcas comerciales, logotipos, marcas de agua, personas, refrescos, desorden.

## Módulo 6 · Selladores de fosetas y fisuras

Carpeta: `imagenes-academia/02-caries-dental/modulo-06/` · 16 imágenes (4 de 16:9, 10 de 4:3, 1 de 3:4, 1 de 1:1).

### 01 · Portada del módulo · 16:9

- **Identificador:** `caries-dental/m06/portada`
- **Qué muestra:** Vista oclusal de un primer molar permanente con un sellador translúcido bien adaptado en sus fisuras.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía clínica macro realista en formato panorámico de la cara oclusal de un primer molar inferior permanente de un niño de unos siete años, con anatomía correcta de cinco cúspides. Las fosetas y fisuras están cubiertas por un sellador blanco opaco, delgado y bien adaptado, sin excesos. Esmalte de las cúspides limpio y brillante, encía sana rosa pálido en el borde y rollos de algodón desenfocados. Iluminación uniforme de lámpara dental, colores naturales, alta nitidez. Evitar: texto, flechas, etiquetas, logotipos, marcas de agua, sangre, rostro, burbujas en el sellador, dientes deformes, número incorrecto de cúspides.

### 02 · Tema 6.1 · figura 6.1.1 · 4:3

- **Identificador:** `caries-dental/m06/01`
- **Qué muestra:** Vista oclusal ampliada de un molar permanente sano con fisuras profundas y estrechas.
- **Pie en la lectura:** Fisuras profundas y estrechas en un molar permanente: la biopelícula de su fondo queda fuera del alcance del cepillo.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica macro realista, vista oclusal de un primer molar superior permanente sano de un niño de ocho años, con cuatro cúspides bien definidas, puente de esmalte y fisuras profundas y muy estrechas de color ligeramente más oscuro en su fondo, sin manchas de caries. Superficie limpia, seca y brillante, encía sana en el borde del encuadre, iluminación lateral suave que resalta el relieve de cúspides y surcos, fondo oscuro desenfocado. Evitar: texto, flechas, etiquetas, logotipos, marcas de agua, sangre, rostro, cavidades, restauraciones, anatomía incorrecta.

### 03 · Tema 6.1 · figura 6.1.2 · 4:3

- **Identificador:** `caries-dental/m06/02`
- **Qué muestra:** Primer molar inferior permanente en erupción, parcialmente cubierto por encía, junto a molares temporales.
- **Pie en la lectura:** Molar permanente en erupción: está por debajo del plano oclusal y parcialmente cubierto por encía, lo que dificulta su limpieza.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica intraoral realista de la hemiarcada inferior de un niño de seis años en dentición mixta temprana, encuadre cerrado solo de dientes y encía. Se ven el segundo molar temporal sano y, detrás de él, el primer molar permanente en erupción, con sus cúspides asomando y la parte distal de la cara oclusal todavía cubierta por un opérculo de encía rosa sana, por debajo del plano de los demás dientes. Iluminación clínica uniforme, colores naturales, alta nitidez. Evitar: texto, flechas, etiquetas, logotipos, marcas de agua, sangre, inflamación severa, rostro, número incorrecto de dientes, dientes deformes.

### 04 · Tema 6.1 · figura 6.1.3 · 3:4

- **Identificador:** `caries-dental/m06/03`
- **Qué muestra:** Niña de espaldas cepillándose los dientes con ayuda de su padre frente al espejo.
- **Pie en la lectura:** El cepillado supervisado sigue siendo indispensable: el sellador protege las fisuras, pero no las superficies lisas ni la encía.
- **Tamaño:** 1200 × 1600 px

**Prompt:**

> Fotografía vertical realista en un baño familiar limpio con luz natural: una niña de unos siete años vista de espaldas, sin rostro identificable, se cepilla los dientes frente al lavabo mientras su padre, de pie detrás de ella y también de espaldas, la observa y le apoya una mano en el hombro. En el espejo solo se ven siluetas desenfocadas. Ambiente cálido, ordenado y alegre, colores suaves. Evitar: texto, etiquetas, marcas comerciales, logotipos, marcas de agua, rostros identificables, espuma excesiva, desorden, tubos de pasta con rótulos.

### 05 · Tema 6.2 · figura 6.2.1 · 16:9

- **Identificador:** `caries-dental/m06/04`
- **Qué muestra:** Grupo de profesionales de la salud bucal con cubrebocas revisa documentos en una mesa de reuniones.
- **Pie en la lectura:** Las guías de práctica clínica resumen la evidencia de muchos ensayos para orientar decisiones en la consulta.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía realista en formato panorámico de una sala de reuniones luminosa de una facultad de odontología: cuatro profesionales de la salud bucal con batas blancas y cubrebocas, vistos de perfil o de espaldas sin rostros identificables, revisan juntos documentos impresos y una computadora portátil cuya pantalla no muestra texto legible. Sobre la mesa, un modelo tipodonto y tazas de café. Luz natural suave desde ventanales, colores neutros y limpios, ambiente académico. Evitar: texto legible, logotipos, marcas comerciales, marcas de agua, rostros identificables, desorden.

### 06 · Tema 6.2 · figura 6.2.2 · 4:3

- **Identificador:** `caries-dental/m06/05`
- **Qué muestra:** Arcada inferior de un adolescente con selladores intactos en los primeros y segundos molares.
- **Pie en la lectura:** Selladores íntegros en primeros y segundos molares permanentes de un adolescente, sin lesiones en las superficies oclusales.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica intraoral realista, vista oclusal con espejo de la arcada inferior permanente completa de un adolescente de catorce años, con anatomía y número de dientes correctos. Los primeros y segundos molares tienen selladores blancos opacos, delgados e íntegros cubriendo sus fisuras; premolares, caninos e incisivos sanos. Encía rosa pálido sana, superficie limpia, iluminación clínica uniforme, colores naturales, alta nitidez. Evitar: texto, flechas, etiquetas, logotipos, marcas de agua, sangre, rostro, brackets, amalgamas, cavidades, número incorrecto de dientes.

### 07 · Tema 6.2 · figura 6.2.3 · 1:1

- **Identificador:** `caries-dental/m06/06`
- **Qué muestra:** Odontopediatra con equipo de protección revisa con espejo los molares de un niño sentado en la unidad.
- **Pie en la lectura:** La revisión periódica permite confirmar que el sellador sigue íntegro y que las superficies se mantienen sanas.
- **Tamaño:** 1400 × 1400 px

**Prompt:**

> Fotografía cuadrada realista en un consultorio de odontopediatría colorido y luminoso: una odontopediatra con cubrebocas, lentes de protección, gorro, bata clara y guantes de nitrilo revisa con espejo bucal los molares de un niño de unos nueve años recostado en la unidad con lentes de protección y babero; el encuadre muestra solo la boca abierta del niño y las manos de la profesional. Luz clínica blanca y luz natural suave, colores alegres pero sobrios. Evitar: texto, logotipos, marcas de agua, sangre, rostro identificable del niño, instrumental rotatorio, llanto.

### 08 · Tema 6.3 · figura 6.3.1 · 4:3

- **Identificador:** `caries-dental/m06/07`
- **Qué muestra:** Superficie oclusal de un molar con aspecto blanco tiza mate tras el grabado ácido, aislada con rollos de algodón.
- **Pie en la lectura:** El esmalte grabado y seco adquiere un aspecto blanco y mate: es la señal de que está listo para recibir un sellador de resina.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica macro realista, vista oclusal de un primer molar inferior permanente de un niño, aislado con rollos de algodón y un eyector de saliva visible en el borde del encuadre. La superficie oclusal, recién grabada y seca, presenta un aspecto blanco tiza uniforme y mate en fosetas, fisuras y vertientes de las cúspides, sin restos de gel. Encía sana, iluminación clínica uniforme, colores naturales, alta nitidez. Evitar: texto, flechas, etiquetas, logotipos, marcas de agua, sangre, rostro, saliva sobre la superficie, cavidades, anatomía incorrecta, manos sin guantes.

### 09 · Tema 6.3 · figura 6.3.2 · 4:3

- **Identificador:** `caries-dental/m06/08`
- **Qué muestra:** Modelo tipodonto con un primer molar parcialmente erupcionado cubierto con un sellador de ionómero de vidrio blanco opaco.
- **Pie en la lectura:** En molares en erupción, un sellador de ionómero de vidrio puede colocarse aunque el aislamiento seco no sea posible.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía realista de estudio de un modelo tipodonto de dentición mixta de un niño de seis años, con el primer molar inferior permanente simulado en erupción, más bajo que los molares temporales vecinos y con una banda de encía artificial rosa sobre su parte distal. Las fisuras visibles del molar están cubiertas por un material blanco opaco y mate, de aspecto ligeramente granular. Una mano con guante de nitrilo sostiene una sonda de punta roma junto al modelo. Luz suave de estudio, fondo claro. Evitar: texto, etiquetas, logotipos, marcas de agua, sangre, rostros, número incorrecto de dientes, manos sin guantes.

### 10 · Tema 6.3 · figura 6.3.3 · 4:3

- **Identificador:** `caries-dental/m06/09`
- **Qué muestra:** Bandeja con jeringas y cápsulas de materiales de sellador sin etiquetas junto a una lámpara de fotopolimerizar.
- **Pie en la lectura:** Los selladores de resina se polimerizan con luz; los de ionómero endurecen por una reacción ácido-base.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía de producto realista sobre una bandeja de consultorio cubierta con un campo desechable azul claro: dos jeringas pequeñas de material con puntas aplicadoras finas, una cápsula de ionómero de vidrio sin etiquetas, microaplicadores, rollos de algodón y, al lado, una lámpara de fotopolimerizar inalámbrica moderna de color blanco con su punta de fibra óptica y protector naranja. Iluminación suave y uniforme, colores limpios, enfoque nítido. Evitar: texto, etiquetas, marcas comerciales, logotipos, marcas de agua, sangre, manos sin guantes, desorden, luz azul encendida dirigida a la cámara.

### 11 · Tema 6.4 · figura 6.4.1 · 4:3

- **Identificador:** `caries-dental/m06/10`
- **Qué muestra:** Molar permanente con opacidades blancas en el fondo de las fisuras, sin cavidad, candidato a sellador.
- **Pie en la lectura:** Lesión no cavitada en fisuras: un candidato a sellado como tratamiento microinvasivo.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica macro realista, vista oclusal de un segundo molar inferior permanente de un adolescente de trece años, con anatomía correcta. Las fisuras muestran opacidades blancas y ligeramente amarillentas en su fondo y paredes, visibles con el diente seco, sin ruptura del esmalte ni sombras oscuras. Superficie limpia, encía sana en el borde, rollos de algodón desenfocados, iluminación clínica uniforme, colores naturales, alta nitidez. Evitar: texto, flechas, etiquetas, logotipos, marcas de agua, sangre, rostro, cavidades, restauraciones, anatomía incorrecta.

### 12 · Tema 6.4 · figura 6.4.2 · 4:3

- **Identificador:** `caries-dental/m06/11`
- **Qué muestra:** Odontóloga con cubrebocas muestra a una madre y a su hijo, en un modelo tipodonto, qué superficies se van a sellar.
- **Pie en la lectura:** Explicar con un modelo qué se va a sellar y por qué facilita la decisión compartida con la familia.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía realista en un consultorio dental luminoso: una odontóloga con cubrebocas, lentes de protección sobre la cabeza y bata blanca sostiene un modelo tipodonto de arcada inferior y señala con una sonda las fisuras de un molar. Frente a ella, una madre con cubrebocas y su hijo de unos diez años, ambos vistos de perfil parcial o de espaldas sin rostros identificables, observan el modelo. Luz natural suave, colores cálidos y neutros, ambiente tranquilo. Evitar: texto, logotipos, marcas de agua, sangre, rostros identificables, instrumental en uso, expresiones de miedo.

### 13 · Tema 6.4 · figura 6.4.3 · 4:3

- **Identificador:** `caries-dental/m06/12`
- **Qué muestra:** Cara palatina de un incisivo lateral superior con una foseta profunda en el cíngulo.
- **Pie en la lectura:** Las fosetas palatinas profundas de los incisivos laterales superiores también pueden sellarse en personas con riesgo.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica intraoral realista tomada con espejo de la cara palatina de los incisivos superiores permanentes de un adolescente, encuadre cerrado de dientes y paladar anterior. El incisivo lateral muestra un cíngulo prominente con una foseta palatina profunda y estrecha en su centro, sin cavidad ni manchas. Superficies limpias y secas, encía y mucosa palatina sanas, iluminación clínica uniforme, colores naturales, alta nitidez. Evitar: texto, flechas, etiquetas, logotipos, marcas de agua, sangre, rostro, restauraciones, anatomía incorrecta, espejo empañado.

### 14 · Tema 6.5 · figura 6.5.1 · 16:9

- **Identificador:** `caries-dental/m06/13`
- **Qué muestra:** Odontóloga y asistente con equipo de protección completo colocan un sellador en un niño, usando lámpara de fotopolimerizar con escudo naranja.
- **Pie en la lectura:** La colocación a cuatro manos facilita el aislamiento, que es la clave de la retención del sellador.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía realista en formato panorámico de un consultorio dental infantil luminoso: una odontóloga y una asistente, ambas con cubrebocas, lentes de protección, gorro, bata desechable y guantes de nitrilo, trabajan a cuatro manos en la boca de un niño recostado con lentes de protección oscuros y babero; solo se ve la boca del niño, sin rostro identificable. La odontóloga sostiene una lámpara de fotopolimerizar con escudo naranja sobre un molar inferior y la asistente sostiene el eyector. Luz clínica blanca, colores limpios. Evitar: texto, logotipos, marcas de agua, sangre, rostro identificable, llanto, equipo de protección incompleto.

### 15 · Tema 6.5 · figura 6.5.2 · 4:3

- **Identificador:** `caries-dental/m06/14`
- **Qué muestra:** Molar permanente con un sellador parcialmente perdido en la fisura distal durante una revisión.
- **Pie en la lectura:** Sellador parcialmente perdido: se registra con el código 1 del primer dígito de ICDAS II y se valora repararlo.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica macro realista, vista oclusal de un primer molar inferior permanente de un niño de diez años, con anatomía correcta. Un sellador blanco opaco cubre la fosa central y la fisura mesial, pero falta en la fisura distal, donde se ve el esmalte natural de la fisura sin cavidad. Superficie limpia y seca, encía sana en el borde, rollos de algodón desenfocados, iluminación clínica uniforme, colores naturales, alta nitidez. Evitar: texto, flechas, etiquetas, logotipos, marcas de agua, sangre, rostro, cavidades, amalgamas, anatomía incorrecta.

### 16 · Tema 6.5 · figura 6.5.3 · 16:9

- **Identificador:** `caries-dental/m06/15`
- **Qué muestra:** Jornada escolar de salud bucal con una unidad dental portátil en un salón y profesionales con equipo de protección.
- **Pie en la lectura:** Los programas escolares acercan los selladores a los niños con mayor riesgo y menor acceso al consultorio.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía realista en formato panorámico de una jornada de salud bucal en el salón de usos múltiples de una primaria mexicana luminosa: una unidad dental portátil con sillón reclinable, una lámpara y una mesa con instrumental ordenado sobre campos desechables. Dos profesionales con cubrebocas, lentes de protección, gorro, bata y guantes atienden a un niño recostado, del que no se ve el rostro. Al fondo, desenfocados y de espaldas, niños con uniforme escolar esperan con una maestra. Luz natural abundante, colores alegres. Evitar: texto, letreros, logotipos, marcas de agua, sangre, rostros identificables de niños, desorden.

## Módulo 7 · Dieta y azúcares libres: la guía de la OMS en la práctica

Carpeta: `imagenes-academia/02-caries-dental/modulo-07/` · 16 imágenes (4 de 16:9, 7 de 4:3, 3 de 1:1, 2 de 3:4).

### 01 · Portada del módulo · 16:9

- **Identificador:** `caries-dental/m07/portada`
- **Qué muestra:** Mesa de cocina con alimentos frescos de un lado y bebidas azucaradas y dulces del otro, vista desde arriba.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía cenital de gran formato sobre una mesa de madera clara en una cocina mexicana luminosa, dividida en dos mitades de manera natural: a la izquierda fruta entera de temporada como mandarinas, plátanos y jícama en bastones, un vaso de agua natural, queso fresco y nueces; a la derecha una botella de refresco sin etiqueta, jugo envasado sin marca, pan dulce y caramelos sueltos. Luz natural suave de ventana lateral, sombras ligeras, colores naturales y apetitosos, composición ordenada y equilibrada. Evitar: texto, marcas comerciales, logotipos, etiquetas legibles, personas, manos, dientes, comida en mal estado, colores saturados artificiales.

### 02 · Tema 7.1 · figura 7.1.1 · 4:3

- **Identificador:** `caries-dental/m07/01`
- **Qué muestra:** Comparación entre una naranja entera, un vaso de jugo de naranja y una cucharada de miel sobre una barra de cocina.
- **Pie en la lectura:** La naranja entera aporta azúcares intrínsecos dentro de su estructura; el jugo y la miel aportan azúcares libres.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía de producto sobre una barra de cocina de cuarzo blanco, tres elementos alineados de izquierda a derecha con separación uniforme: una naranja entera con cáscara y hojas verdes, un vaso de vidrio transparente lleno de jugo de naranja recién exprimido y una cuchara de madera con miel dorada que escurre lentamente sobre un plato pequeño. Fondo neutro desenfocado de cocina luminosa, luz natural lateral suave, enfoque nítido en los tres elementos, colores cálidos y naturales. Evitar: texto, etiquetas, marcas, logotipos, personas, manos, fruta dañada, reflejos exagerados, aspecto de caricatura.

### 03 · Tema 7.1 · figura 7.1.2 · 1:1

- **Identificador:** `caries-dental/m07/02`
- **Qué muestra:** Distintos endulzantes en cuencos pequeños: azúcar blanca, azúcar mascabado, piloncillo, miel y jarabe.
- **Pie en la lectura:** Azúcar blanca, mascabado, piloncillo, miel y jarabe: para la biopelícula todos son azúcares fermentables.
- **Tamaño:** 1400 × 1400 px

**Prompt:**

> Fotografía cenital de estudio sobre fondo de pizarra gris mate, cinco cuencos pequeños de cerámica blanca dispuestos en círculo: azúcar blanca refinada, azúcar mascabado húmedo, un cono de piloncillo partido, miel dorada y jarabe de agave ámbar con una cucharita. Iluminación difusa uniforme, sombras suaves, enfoque nítido en toda la composición, colores naturales y cálidos, estilo editorial gastronómico limpio. Evitar: texto, etiquetas, marcas, logotipos, personas, manos, insectos, derrames sucios, colores artificiales.

### 04 · Tema 7.1 · figura 7.1.3 · 4:3

- **Identificador:** `caries-dental/m07/03`
- **Qué muestra:** Refrigerio escolar con fruta entera picada, agua natural y queso, en un recipiente de comida.
- **Pie en la lectura:** Un refrigerio sin azúcares libres: fruta entera, agua natural y una porción de queso.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía cenital de un recipiente reutilizable para comida escolar con compartimentos, sobre una mesa de madera clara: rebanadas de manzana y gajos de mandarina en un compartimento, cubos de queso panela en otro, pepino en rodajas en el tercero, y junto al recipiente una botella reutilizable transparente con agua natural. Luz natural de mañana, sombras suaves, colores frescos y naturales, composición limpia y apetitosa. Evitar: texto, marcas, logotipos, etiquetas, personas, rostros, dulces, envases desechables con estampados, comida en mal estado.

### 05 · Tema 7.2 · figura 7.2.1 · 16:9

- **Identificador:** `caries-dental/m07/04`
- **Qué muestra:** Doce cubos de azúcar alineados junto a seis cubos de azúcar sobre una superficie blanca.
- **Pie en la lectura:** Representación visual de las dos metas de la OMS para una dieta de unas 2,000 kilocalorías: menos de unas 12 cucharaditas y, de forma ideal, alrededor de 6.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía de estudio minimalista sobre superficie blanca mate, dos filas horizontales de cubos de azúcar blancos perfectamente alineados: arriba una fila larga de doce cubos y abajo una fila corta de seis cubos, con espacio vacío a la derecha de la fila corta. Luz lateral suave que crea sombras tenues, enfoque nítido, composición limpia con mucho espacio negativo, estilo editorial científico. Evitar: texto, números, etiquetas, marcas, logotipos, personas, manos, cucharas, alimentos adicionales, colores intensos.

### 06 · Tema 7.2 · figura 7.2.2 · 4:3

- **Identificador:** `caries-dental/m07/05`
- **Qué muestra:** Cucharaditas de azúcar alineadas junto a un vaso de bebida endulzada sin etiqueta.
- **Pie en la lectura:** Visualizar el azúcar en cucharaditas ayuda a los pacientes a comprender las cifras de la etiqueta.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía educativa sobre una mesa de madera clara, un vaso de vidrio alto con bebida de color ámbar con burbujas, sin etiqueta ni envase, y frente a él varias cucharitas metálicas alineadas, cada una con una porción de azúcar blanca a ras. Fondo de cocina desenfocado, luz natural lateral, enfoque nítido en las cucharitas, colores naturales, estilo de material de educación para la salud. Evitar: texto, números, etiquetas, marcas, logotipos, personas, manos, rostros, derrames, colores artificiales.

### 07 · Tema 7.2 · figura 7.2.3 · 3:4

- **Identificador:** `caries-dental/m07/06`
- **Qué muestra:** Odontóloga con equipo de protección revisando un registro de dieta en una tableta junto a la unidad dental.
- **Pie en la lectura:** Las metas de la OMS se vuelven útiles cuando se aplican al registro de dieta de cada paciente.
- **Tamaño:** 1200 × 1600 px

**Prompt:**

> Fotografía vertical en un consultorio dental moderno y luminoso, una odontóloga de pie junto a la unidad dental con bata clínica, cubrebocas, lentes de protección y guantes de nitrilo, revisando con atención la pantalla de una tableta que sostiene con ambas manos; la pantalla se ve en ángulo sin contenido legible. Al fondo, unidad dental limpia y desenfocada. Luz blanca neutra, colores naturales, ambiente profesional y cálido. Evitar: texto legible en pantalla, logotipos, marcas, pacientes, rostros identificables, falta de equipo de protección, instrumental con sangre.

### 08 · Tema 7.3 · figura 7.3.1 · 4:3

- **Identificador:** `caries-dental/m07/07`
- **Qué muestra:** Persona en un escritorio de oficina con una botella de bebida endulzada a medio terminar junto al teclado.
- **Pie en la lectura:** Beber a sorbos una bebida azucarada durante horas mantiene el pH de la placa bajo de forma casi continua.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía de estilo documental en una oficina luminosa, encuadre desde atrás y por encima del hombro de una persona adulta trabajando en una computadora portátil, sin mostrar su rostro; junto al teclado, una botella de plástico sin etiqueta con bebida de color naranja a medio terminar y una taza de café. Luz natural de ventana, enfoque en la botella, fondo desenfocado de escritorio ordenado, colores naturales. Evitar: texto, pantallas legibles, marcas, logotipos, rostros, personas de frente, comida chatarra amontonada, desorden exagerado.

### 09 · Tema 7.3 · figura 7.3.2 · 1:1

- **Identificador:** `caries-dental/m07/08`
- **Qué muestra:** Plato con un trozo de queso fresco y pepino en rodajas junto a un vaso de agua.
- **Pie en la lectura:** Queso, verduras fibrosas y agua natural: buenas opciones para cerrar una comida o como refrigerio.
- **Tamaño:** 1400 × 1400 px

**Prompt:**

> Fotografía cuadrada de estilo gastronómico, plato de cerámica blanca sobre mantel de lino beige con un trozo de queso fresco cortado en cubos, rodajas de pepino con cáscara y bastones de jícama, junto a un vaso de vidrio con agua natural y gotas de condensación. Luz natural suave desde la izquierda, sombras delicadas, enfoque nítido, colores frescos y naturales. Evitar: texto, etiquetas, marcas, logotipos, personas, manos, salsas con colorante, comida en mal estado, colores artificiales.

### 10 · Tema 7.3 · figura 7.3.3 · 4:3

- **Identificador:** `caries-dental/m07/09`
- **Qué muestra:** Mesita de noche con un vaso de agua y un cepillo de dientes infantil junto a un cuento ilustrado cerrado.
- **Pie en la lectura:** Antes de dormir: cepillado con pasta fluorada y, si hay sed, solo agua natural.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía cálida de una mesita de noche en una recámara infantil ordenada, con luz tenue de lámpara de buró, sobre la mesita un vaso de vidrio con agua natural, un cepillo dental infantil de cerdas suaves en un vaso pequeño y un libro de cuentos cerrado con portada lisa sin ilustraciones legibles. Fondo desenfocado con cama tendida y cobija de colores suaves. Colores cálidos y naturales, atmósfera tranquila. Evitar: texto, marcas, logotipos, personas, rostros, biberones con bebidas de color, dulces, desorden.

### 11 · Tema 7.4 · figura 7.4.1 · 16:9

- **Identificador:** `caries-dental/m07/10`
- **Qué muestra:** Despensa con productos empacados genéricos: cereal, yogur, barras, salsas y bebidas.
- **Pie en la lectura:** Muchos productos de uso diario contienen azúcares añadidos aunque no se perciban como dulces.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía horizontal de una alacena de cocina mexicana ordenada, con estantes de madera clara que contienen cajas de cereal, frascos de salsa, botellas de bebidas de sabor, vasitos de yogur y barras de granola, todos en envases genéricos lisos de colores suaves sin ningún texto, sello ni marca. Luz natural lateral, perspectiva frontal ligeramente angulada, enfoque nítido, colores naturales. Evitar: texto, letras, números, sellos, marcas, logotipos, etiquetas legibles, personas, desorden, productos caducos.

### 12 · Tema 7.4 · figura 7.4.2 · 4:3

- **Identificador:** `caries-dental/m07/11`
- **Qué muestra:** Manos sosteniendo un envase genérico mientras se revisa la parte posterior en el pasillo de un supermercado.
- **Pie en la lectura:** Revisar la tabla nutrimental y los ingredientes toma menos de un minuto y cambia la decisión de compra.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía en el pasillo de un supermercado, encuadre cercano de dos manos adultas sosteniendo una caja de cereal genérica de color liso y girándola para revisar la parte posterior, que se ve en ángulo sin texto legible. Fondo desenfocado de anaqueles con productos de colores suaves sin marcas visibles. Luz blanca de tienda, enfoque en las manos y el envase, colores naturales. Evitar: texto legible, números, sellos, marcas, logotipos, rostros, personas de frente, productos reconocibles.

### 13 · Tema 7.4 · figura 7.4.3 · 1:1

- **Identificador:** `caries-dental/m07/12`
- **Qué muestra:** Jarra de agua fresca con rodajas de pepino y limón junto a un vaso servido.
- **Pie en la lectura:** Agua natural o con fruta en rodajas sin endulzar: la bebida de todos los días.
- **Tamaño:** 1400 × 1400 px

**Prompt:**

> Fotografía cuadrada sobre una mesa de madera clara en exterior sombreado, una jarra de vidrio transparente con agua natural, rodajas de pepino, rodajas de limón y hojas de hierbabuena, junto a un vaso servido con hielo. Luz natural suave de mediodía filtrada, reflejos delicados en el vidrio, fondo verde desenfocado de jardín, colores frescos y naturales. Evitar: texto, etiquetas, marcas, logotipos, personas, manos, azúcar visible, popotes de plástico, colores artificiales.

### 14 · Tema 7.5 · figura 7.5.1 · 4:3

- **Identificador:** `caries-dental/m07/13`
- **Qué muestra:** Registro de dieta en papel sobre un escritorio, con marcas de colores y un bolígrafo.
- **Pie en la lectura:** Un registro de dieta con las exposiciones a azúcares libres marcadas en color facilita la conversación con el paciente.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía cenital sobre un escritorio de madera clara de consultorio, una hoja de papel con una cuadrícula manuscrita de varias columnas, sin letras legibles, con algunas filas resaltadas con marcador amarillo y rosa, un bolígrafo azul y un marcador destapado al lado, y en la esquina una taza blanca y unas gafas de lectura. Luz natural suave, enfoque nítido en la hoja, colores naturales. Evitar: texto legible, números legibles, nombres, logotipos, marcas, personas, rostros, datos personales.

### 15 · Tema 7.5 · figura 7.5.2 · 16:9

- **Identificador:** `caries-dental/m07/14`
- **Qué muestra:** Odontólogo con equipo de protección conversando con una madre y su hija sentadas en el consultorio.
- **Pie en la lectura:** Una conversación colaborativa, sentados al mismo nivel, favorece que la familia proponga sus propias metas.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía horizontal en un consultorio dental luminoso, un odontólogo sentado en un banco a la altura de los ojos de sus interlocutores, con bata clínica, cubrebocas y lentes de protección, conversando con una madre y su hija de unos siete años sentadas frente a él, vistas de espaldas o de perfil parcial sin rostros identificables. Sobre una mesa pequeña, una hoja de registro sin texto legible. Luz natural cálida, ambiente amable y profesional, colores naturales. Evitar: texto, logotipos, marcas, rostros identificables, gestos de regaño, instrumental con sangre, falta de equipo de protección.

### 16 · Tema 7.5 · figura 7.5.3 · 3:4

- **Identificador:** `caries-dental/m07/15`
- **Qué muestra:** Refrigerador doméstico abierto con jarras de agua natural, fruta entera y verduras en el estante principal.
- **Pie en la lectura:** Cambiar el entorno de casa, por ejemplo dejar agua y fruta a la vista, facilita cumplir las metas.
- **Tamaño:** 1200 × 1600 px

**Prompt:**

> Fotografía vertical de un refrigerador doméstico abierto y ordenado en una cocina iluminada, en el estante a la altura de los ojos dos jarras de vidrio con agua natural, un tazón con fruta entera lavada como manzanas, mandarinas y uvas, y recipientes transparentes con verduras picadas; en estantes inferiores leche y queso en envases lisos sin marca. Luz interior blanca del refrigerador combinada con luz natural, colores frescos y naturales. Evitar: texto, etiquetas, marcas, logotipos, personas, refrescos, dulces, comida en mal estado, desorden.

## Módulo 8 · Odontología mínimamente invasiva y remoción selectiva de tejido cariado

Carpeta: `imagenes-academia/02-caries-dental/modulo-08/` · 16 imágenes (4 de 16:9, 6 de 4:3, 3 de 1:1, 3 de 3:4).

### 01 · Portada del módulo · 16:9

- **Identificador:** `caries-dental/m08/portada`
- **Qué muestra:** Manos de un odontólogo con guantes sosteniendo un excavador manual frente a un modelo tipodonto en un consultorio luminoso.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía clínica horizontal de gran formato en un consultorio dental moderno, primer plano de las manos de un odontólogo con guantes de nitrilo azul sosteniendo con delicadeza un excavador manual de cucharilla frente a un modelo tipodonto de arcada inferior permanente con dientes bien formados. Al fondo desenfocado, una unidad dental limpia y un asistente con bata, cubrebocas y lentes de protección. Luz blanca neutra, profundidad de campo corta, colores naturales, ambiente sereno y preciso. Evitar: texto, logotipos, marcas, sangre, tejidos expuestos, rostros identificables, manos sin guantes, dientes deformes, instrumental oxidado.

### 02 · Tema 8.1 · figura 8.1.1 · 4:3

- **Identificador:** `caries-dental/m08/01`
- **Qué muestra:** Dos molares de tipodonto lado a lado: uno con una cavidad oclusal extensa y otro con una preparación pequeña y conservadora.
- **Pie en la lectura:** Comparación entre una preparación extensa al estilo clásico y una preparación conservadora limitada a la lesión.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía macro de estudio sobre fondo gris neutro, dos primeros molares inferiores permanentes de tipodonto de resina color diente colocados lado a lado en vista oclusal: el de la izquierda con una preparación oclusal amplia que recorre todas las fisuras, el de la derecha con una preparación pequeña y redondeada limitada a una sola foseta. Superficies limpias, sin restauración, iluminación de estudio difusa, enfoque nítido, anatomía oclusal correcta con cinco cúspides. Evitar: texto, flechas, etiquetas, marcas, sangre, tejidos humanos, dientes deformes, número incorrecto de cúspides, colores artificiales.

### 03 · Tema 8.1 · figura 8.1.2 · 16:9

- **Identificador:** `caries-dental/m08/02`
- **Qué muestra:** Odontóloga con equipo de protección explicando a un paciente adulto, visto de espaldas, la evolución de sus lesiones en una pantalla.
- **Pie en la lectura:** La mínima intervención empieza con la evaluación del riesgo y una conversación sobre el control de la enfermedad.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía horizontal en un consultorio dental luminoso, una odontóloga con bata clínica, cubrebocas, lentes de protección y guantes de nitrilo señala con la mano una pantalla de monitor que muestra una fotografía intraoral desenfocada sin detalles legibles; un paciente adulto sentado en la unidad dental aparece de espaldas, sin rostro visible. Luz natural complementada con luz clínica blanca, ambiente tranquilo y colaborativo, colores naturales. Evitar: texto, logotipos, marcas, rostros identificables, sangre, imágenes clínicas gráficas, falta de equipo de protección.

### 04 · Tema 8.1 · figura 8.1.3 · 1:1

- **Identificador:** `caries-dental/m08/03`
- **Qué muestra:** Molar de tipodonto con una restauración pequeña y bien adaptada del color del diente.
- **Pie en la lectura:** Una restauración pequeña conserva cúspides y rebordes, que son los que dan resistencia al diente.
- **Tamaño:** 1400 × 1400 px

**Prompt:**

> Fotografía macro cuadrada de un primer molar superior permanente de tipodonto en vista oclusal sobre fondo negro mate, con una restauración pequeña del color del diente en la fosa central, perfectamente integrada, cúspides y rebordes marginales intactos, anatomía oclusal correcta con cuatro cúspides principales. Iluminación de flash anular clínica, enfoque nítido de borde a borde, colores naturales. Evitar: texto, etiquetas, flechas, marcas, sangre, encía inflamada, número incorrecto de cúspides, restauración sobredimensionada, colores artificiales.

### 05 · Tema 8.2 · figura 8.2.1 · 4:3

- **Identificador:** `caries-dental/m08/04`
- **Qué muestra:** Superficie vestibular de premolares con una lesión blanca opaca activa junto a otra lesión blanca brillante inactiva.
- **Pie en la lectura:** Lesión activa (blanca, opaca y rugosa) frente a lesión inactiva (brillante y lisa) en la superficie vestibular.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica intraoral macro de la superficie vestibular de dos premolares superiores permanentes de un adulto joven, limpios y secos, cerca del margen gingival: en el primero una mancha blanca opaca, mate y ligeramente rugosa; en el segundo una mancha blanca lisa y brillante con bordes definidos. Encía sana rosa pálido, retractor de labios transparente apenas visible en el borde, iluminación clínica uniforme, enfoque nítido. Evitar: texto, flechas, etiquetas, sangre, inflamación gingival, rostro, labios completos, dientes deformes, instrumental sin guantes.

### 06 · Tema 8.2 · figura 8.2.2 · 4:3

- **Identificador:** `caries-dental/m08/05`
- **Qué muestra:** Dientes posteriores de tipodonto con una banda separadora y un aplicador fino en el espacio interproximal.
- **Pie en la lectura:** La infiltración con resina trata lesiones proximales no cavitadas sin preparar el diente.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica macro sobre un modelo tipodonto de arcada superior permanente, vista lateral de un premolar y un primer molar con una cuña de madera clara en el espacio interproximal y una tira aplicadora plástica delgada colocada entre ambos dientes, sostenida por una mano con guante de nitrilo azul en el borde del encuadre. Iluminación clínica blanca uniforme, fondo oscuro desenfocado, colores naturales, enfoque nítido en el punto de contacto. Evitar: texto, logotipos, marcas, sangre, encía humana inflamada, rostro, manos sin guantes, anatomía dental incorrecta.

### 07 · Tema 8.2 · figura 8.2.3 · 3:4

- **Identificador:** `caries-dental/m08/06`
- **Qué muestra:** Mano de un adulto sujetando un cepillo dental de cabeza pequeña junto a un espejo de lavabo.
- **Pie en la lectura:** Dirigir el cepillo a la superficie concreta de la lesión es la base del manejo no invasivo.
- **Tamaño:** 1200 × 1600 px

**Prompt:**

> Fotografía vertical en un baño doméstico limpio y luminoso, primer plano de la mano de un adulto sujetando un cepillo dental de cabeza pequeña y cerdas suaves con una porción de pasta del tamaño de un chícharo, frente a un lavabo blanco y un espejo que refleja solo azulejos claros. Luz natural suave, enfoque en el cepillo, fondo desenfocado, colores naturales. Evitar: texto, marcas, logotipos, rostros, reflejos de personas, pasta en exceso, desorden, colores artificiales.

### 08 · Tema 8.3 · figura 8.3.1 · 3:4

- **Identificador:** `caries-dental/m08/07`
- **Qué muestra:** Ilustración realista de un corte longitudinal de un molar con una lesión de caries que avanza en forma de cono hacia la pulpa.
- **Pie en la lectura:** Corte de un molar con lesión en dentina: el tejido cambia de forma gradual desde la superficie hacia la pulpa.
- **Tamaño:** 1200 × 1600 px

**Prompt:**

> Ilustración médica realista de un corte longitudinal de un primer molar inferior permanente con dos raíces, mostrando esmalte translúcido, dentina amarillo claro, cámara pulpar rosada y conductos; desde una foseta oclusal, una lesión de caries de color café que se ensancha en dentina en forma de cono hacia la pulpa sin alcanzarla, con un degradado de café oscuro en la superficie a amarillo pálido en la zona profunda. Fondo blanco limpio, iluminación uniforme, estilo de atlas anatómico. Evitar: texto, etiquetas, flechas, números, sangre, anatomía incorrecta, raíces fusionadas, colores fluorescentes.

### 09 · Tema 8.3 · figura 8.3.2 · 1:1

- **Identificador:** `caries-dental/m08/08`
- **Qué muestra:** Juego de excavadores manuales de distintos tamaños sobre una charola de instrumental estéril.
- **Pie en la lectura:** Los excavadores afilados permiten valorar la dureza de la dentina y retirar selectivamente el tejido blando.
- **Tamaño:** 1400 × 1400 px

**Prompt:**

> Fotografía cuadrada de estudio de cuatro excavadores dentales de acero inoxidable de distintos tamaños de cucharilla, alineados en paralelo sobre una charola metálica perforada con un campo estéril azul claro, todos limpios y brillantes. Iluminación difusa de estudio con reflejos suaves en el metal, enfoque nítido en las puntas, fondo neutro, colores naturales y fríos. Evitar: texto, logotipos, marcas grabadas legibles, sangre, residuos, óxido, manos, rostros, instrumental desordenado.

### 10 · Tema 8.3 · figura 8.3.3 · 4:3

- **Identificador:** `caries-dental/m08/09`
- **Qué muestra:** Corte de un molar extraído montado para estudio, con una lesión café en dentina vista en laboratorio.
- **Pie en la lectura:** Los cortes de dientes extraídos permiten estudiar en el laboratorio el gradiente de la lesión en dentina.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía de laboratorio académico, un molar humano extraído limpio y cortado longitudinalmente por la mitad, montado sobre un portaobjetos de vidrio bajo una lupa estereoscópica, mostrando esmalte, dentina y una lesión café en forma de cono que avanza hacia la cámara pulpar vacía. Mano con guante de nitrilo sosteniendo pinzas en el borde del encuadre, mesa de laboratorio blanca, luz fría uniforme, enfoque nítido en el corte. Evitar: texto, etiquetas, logotipos, sangre, tejido blando, rostros, manos sin guantes, anatomía incorrecta.

### 11 · Tema 8.4 · figura 8.4.1 · 4:3

- **Identificador:** `caries-dental/m08/10`
- **Qué muestra:** Ilustración de tres cortes de molar que comparan la remoción selectiva a dentina blanda, la selectiva a dentina firme y la no selectiva.
- **Pie en la lectura:** Tres estrategias de remoción en una lesión profunda: cuánto tejido queda sobre la pulpa en cada una.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Ilustración médica realista de tres cortes longitudinales idénticos de un primer molar inferior permanente colocados lado a lado sobre fondo blanco, cada uno con una cavidad oclusal profunda: en el primero queda una capa café clara de tejido sobre la cámara pulpar bajo una restauración del color del diente; en el segundo una capa más delgada de tejido amarillo pálido; en el tercero la cavidad llega muy cerca de la pulpa sin tejido cariado remanente. Esmalte, dentina y pulpa rosada bien diferenciados, estilo de atlas. Evitar: texto, etiquetas, números, flechas, sangre, exposición pulpar, anatomía incorrecta, colores fluorescentes.

### 12 · Tema 8.4 · figura 8.4.2 · 16:9

- **Identificador:** `caries-dental/m08/11`
- **Qué muestra:** Odontólogo y asistente con equipo de protección completo trabajando sobre un paciente con dique de hule colocado.
- **Pie en la lectura:** El aislamiento del campo favorece la calidad del sellado, que es la condición del éxito en la remoción selectiva.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía clínica horizontal en un consultorio dental moderno, un odontólogo y una asistente sentados a ambos lados del paciente, ambos con bata, gorro, cubrebocas, lentes de protección y guantes de nitrilo; el paciente reclinado con un dique de hule azul colocado en la arcada inferior, cubierto con babero y lentes de protección, rostro no identificable cubierto por el dique y el encuadre. Luz de la lámpara dental dirigida a la boca, colores naturales, ambiente ordenado. Evitar: texto, logotipos, marcas, sangre, rostros identificables, falta de equipo de protección, instrumental desordenado, aerosoles exagerados.

### 13 · Tema 8.4 · figura 8.4.3 · 4:3

- **Identificador:** `caries-dental/m08/12`
- **Qué muestra:** Radiografía de aleta de mordida de molares en un negatoscopio digital, revisada por manos con guantes.
- **Pie en la lectura:** La profundidad radiográfica de la lesión orienta la elección de la estrategia de remoción.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía en un consultorio dental de un monitor médico que muestra una radiografía de aleta de mordida de molares y premolares de un adulto, en escala de grises, con una zona radiolúcida oclusal en un molar inferior que se acerca a la cámara pulpar sin alcanzarla; en primer plano, una mano con guante de nitrilo señala la pantalla con un bolígrafo cerrado. Luz ambiental tenue, enfoque en la pantalla, colores neutros. Evitar: texto, nombres, fechas, datos del paciente, logotipos, rostros, sangre, anatomía radiográfica incorrecta.

### 14 · Tema 8.5 · figura 8.5.1 · 16:9

- **Identificador:** `caries-dental/m08/13`
- **Qué muestra:** Charola de instrumental para mínima intervención con excavadores, fresas de baja velocidad y un gel en jeringa sin marca.
- **Pie en la lectura:** Instrumental de mínima intervención: excavadores manuales, fresas de baja velocidad y geles químico-mecánicos.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía cenital horizontal de una charola de instrumental dental sobre campo estéril azul claro: tres excavadores manuales de acero, una pieza de mano de baja velocidad tipo contraángulo, un pequeño soporte con fresas redondas de carburo de distintos tamaños, una jeringa plástica lisa sin marca con gel transparente y dos rollos de algodón. Todo limpio y ordenado en paralelo, iluminación difusa de estudio, colores naturales y fríos, enfoque nítido. Evitar: texto, logotipos, marcas, etiquetas legibles, sangre, residuos, manos, rostros, instrumental oxidado o desordenado.

### 15 · Tema 8.5 · figura 8.5.2 · 3:4

- **Identificador:** `caries-dental/m08/14`
- **Qué muestra:** Asistente dental con equipo de protección completo preparando una charola de instrumental en un área limpia del consultorio.
- **Pie en la lectura:** La bioseguridad acompaña a todo procedimiento de mínima intervención, aunque genere pocos aerosoles.
- **Tamaño:** 1200 × 1600 px

**Prompt:**

> Fotografía vertical de una asistente dental de pie en un área de preparación limpia y ordenada de un consultorio, con bata desechable, gorro, cubrebocas, careta transparente y guantes de nitrilo, colocando instrumental en una charola sobre un campo estéril azul, con bolsas de esterilización selladas a un lado. Luz blanca neutra, superficies de acero inoxidable relucientes, colores naturales, ambiente profesional. Evitar: texto, logotipos, marcas, etiquetas legibles, rostros identificables, sangre, guantes rotos, desorden, falta de equipo de protección.

### 16 · Tema 8.5 · figura 8.5.3 · 1:1

- **Identificador:** `caries-dental/m08/15`
- **Qué muestra:** Molar de tipodonto con una restauración antigua del color del diente y una pequeña reparación marginal recién pulida.
- **Pie en la lectura:** Una reparación marginal conserva la mayor parte de la restauración y del tejido dental.
- **Tamaño:** 1400 × 1400 px

**Prompt:**

> Fotografía macro cuadrada de un primer molar inferior permanente de tipodonto en vista oclusal sobre fondo gris oscuro, con una restauración del color del diente de tamaño moderado en la que una pequeña zona del margen distal tiene un tono ligeramente distinto y brillo de pulido reciente, integrada sin escalones. Anatomía oclusal correcta con cinco cúspides, iluminación de flash anular clínica, enfoque nítido, colores naturales. Evitar: texto, flechas, etiquetas, marcas, sangre, encía humana, dientes deformes, número incorrecto de cúspides, colores artificiales.

## Módulo 9 · Materiales restauradores en el manejo de la caries

Carpeta: `imagenes-academia/02-caries-dental/modulo-09/` · 16 imágenes (4 de 16:9, 7 de 4:3, 3 de 1:1, 2 de 3:4).

### 01 · Portada del módulo · 16:9

- **Identificador:** `caries-dental/m09/portada`
- **Qué muestra:** Mesa de trabajo dental con jeringas de resina sin marca, cápsulas de ionómero y una lámpara de fotopolimerizar, junto a un tipodonto.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía horizontal de gran formato sobre una mesa de trabajo clínica blanca y ordenada: varias jeringas de resina compuesta de distintos tonos color diente sin etiquetas, cápsulas lisas de ionómero de vidrio, un aplicador de adhesivo, una lámpara de fotopolimerizar inalámbrica apagada con su filtro naranja y un modelo tipodonto de arcada posterior con restauraciones del color del diente. Fondo desenfocado de consultorio moderno, luz blanca suave, enfoque nítido, colores naturales. Evitar: texto, logotipos, marcas, etiquetas legibles, sangre, rostros, manos sin guantes, desorden, colores artificiales.

### 02 · Tema 9.1 · figura 9.1.1 · 16:9

- **Identificador:** `caries-dental/m09/01`
- **Qué muestra:** Cuatro molares de tipodonto con restauraciones de amalgama, resina compuesta, ionómero de vidrio y cerámica.
- **Pie en la lectura:** Restauraciones con distintos materiales: cada uno ofrece un equilibrio diferente entre resistencia, adhesión, estética y liberación de iones.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía macro horizontal de estudio sobre fondo gris oscuro mate, cuatro primeros molares inferiores permanentes de tipodonto alineados en vista oclusal: el primero con una restauración oclusal metálica plateada, el segundo con una restauración del color del diente brillante, el tercero con una restauración blanca opaca ligeramente mate, el cuarto con una incrustación cerámica de brillo vítreo. Anatomía oclusal correcta con cinco cúspides en cada molar, iluminación de estudio difusa, enfoque nítido. Evitar: texto, etiquetas, flechas, marcas, sangre, encía humana, dientes deformes, número incorrecto de cúspides, colores artificiales.

### 03 · Tema 9.1 · figura 9.1.2 · 4:3

- **Identificador:** `caries-dental/m09/02`
- **Qué muestra:** Bloque cerámico siendo fresado en una unidad de fresado dental de consultorio, visto a través de la ventana del equipo.
- **Pie en la lectura:** Las restauraciones indirectas se fabrican fuera de la boca; suelen requerir preparaciones más amplias que las directas.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía en primer plano del interior de una fresadora dental de consultorio a través de su ventana transparente: un pequeño bloque cerámico color diente sujeto en el portabloque mientras dos fresas finas de diamante lo tallan, con chorros finos de agua refrigerante. Iluminación interna fría del equipo, fondo oscuro, enfoque nítido en el bloque, colores naturales. Evitar: texto, pantallas legibles, logotipos, marcas, personas, rostros, sangre, colores artificiales, elementos de ciencia ficción.

### 04 · Tema 9.1 · figura 9.1.3 · 4:3

- **Identificador:** `caries-dental/m09/03`
- **Qué muestra:** Radiografía de aleta de mordida en un monitor que muestra restauraciones de distinta radiopacidad.
- **Pie en la lectura:** La radiopacidad permite distinguir el material restaurador de una lesión de caries en la radiografía.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía de un monitor médico en un consultorio que muestra una radiografía de aleta de mordida de premolares y molares de un adulto en escala de grises, con varias restauraciones: algunas muy blancas y radiopacas, otras ligeramente menos radiopacas que el esmalte; anatomía radiográfica correcta de coronas, cámaras pulpares y crestas óseas. Luz ambiental tenue, enfoque en la pantalla, colores neutros. Evitar: texto, nombres, fechas, números, datos del paciente, logotipos, rostros, anatomía incorrecta.

### 05 · Tema 9.2 · figura 9.2.1 · 1:1

- **Identificador:** `caries-dental/m09/04`
- **Qué muestra:** Molar de tipodonto con una restauración oclusal de amalgama pulida y bien adaptada.
- **Pie en la lectura:** Restauración de amalgama: material metálico de larga trayectoria que se retiene de forma mecánica.
- **Tamaño:** 1400 × 1400 px

**Prompt:**

> Fotografía macro cuadrada de un primer molar inferior permanente de tipodonto en vista oclusal sobre fondo negro mate, con una restauración oclusal de amalgama plateada pulida, bien adaptada a los márgenes y con anatomía de surcos tallada, rodeada de esmalte de color natural. Anatomía oclusal correcta con cinco cúspides, iluminación de flash anular clínica con reflejos metálicos suaves, enfoque nítido. Evitar: texto, flechas, etiquetas, marcas, sangre, encía humana, corrosión exagerada, dientes deformes, número incorrecto de cúspides.

### 06 · Tema 9.2 · figura 9.2.2 · 4:3

- **Identificador:** `caries-dental/m09/05`
- **Qué muestra:** Recipiente hermético para residuos de amalgama en un área de trabajo dental, manipulado por una mano con guante.
- **Pie en la lectura:** Los restos de amalgama se recogen en recipientes cerrados específicos, separados de otros residuos.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía en un área de trabajo de consultorio dental limpia, primer plano de una mano con guante de nitrilo colocando una cápsula usada dentro de un recipiente plástico hermético de tapa roscada, sin etiquetas legibles, sobre una superficie de acero inoxidable; al fondo desenfocado, contenedores de residuos ordenados. Luz blanca neutra, colores naturales, enfoque nítido en el recipiente. Evitar: texto, símbolos legibles, logotipos, marcas, gotas de mercurio visibles, rostros, manos sin guantes, desorden, sangre.

### 07 · Tema 9.2 · figura 9.2.3 · 3:4

- **Identificador:** `caries-dental/m09/06`
- **Qué muestra:** Odontólogo con equipo de protección y paciente con dique de hule durante el retiro de una restauración metálica, con succión de alto volumen.
- **Pie en la lectura:** El retiro de amalgama, cuando está indicado, se hace con aislamiento, succión de alto volumen y protección completa.
- **Tamaño:** 1200 × 1600 px

**Prompt:**

> Fotografía vertical en un consultorio dental, un odontólogo con bata, gorro, cubrebocas de alta eficiencia, careta transparente y guantes de nitrilo trabaja sobre la arcada inferior de un paciente reclinado que tiene colocado un dique de hule verde y lentes de protección; una asistente con equipo completo sostiene una cánula de succión de alto volumen cerca del campo. Rostros no identificables por el dique, el encuadre y las caretas. Luz clínica blanca, colores naturales. Evitar: texto, logotipos, marcas, sangre, rostros identificables, falta de equipo de protección, aerosoles exagerados.

### 08 · Tema 9.3 · figura 9.3.1 · 4:3

- **Identificador:** `caries-dental/m09/07`
- **Qué muestra:** Mano con guante aplicando luz azul de una lámpara de fotopolimerizar sobre un molar de tipodonto, con filtro naranja protector.
- **Pie en la lectura:** La fotopolimerización activa el endurecimiento de la resina; el filtro naranja protege los ojos del operador.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica macro sobre un modelo tipodonto de arcada inferior permanente, la punta de una lámpara de fotopolimerizar inalámbrica emite luz azul intensa sobre la cara oclusal de un primer molar, sostenida por una mano con guante de nitrilo; delante de la punta, un escudo protector naranja translúcido. Fondo oscuro desenfocado, la luz azul ilumina suavemente los dientes vecinos, enfoque nítido en la punta y el diente, colores naturales salvo el azul de la luz. Evitar: texto, logotipos, marcas, sangre, rostros, manos sin guantes, anatomía dental incorrecta, destellos exagerados.

### 09 · Tema 9.3 · figura 9.3.2 · 1:1

- **Identificador:** `caries-dental/m09/08`
- **Qué muestra:** Molar de tipodonto aislado con dique de hule y un microaplicador sobre la cavidad.
- **Pie en la lectura:** El aislamiento con dique de hule protege la superficie acondicionada de la contaminación con saliva.
- **Tamaño:** 1400 × 1400 px

**Prompt:**

> Fotografía macro cuadrada de un primer molar inferior permanente de tipodonto aislado con dique de hule azul y una grapa metálica, con una cavidad oclusal pequeña y limpia; un microaplicador de punta blanca sostenido por una mano con guante de nitrilo se acerca a la cavidad. Iluminación clínica uniforme, fondo azul del dique, enfoque nítido en la cavidad, colores naturales. Evitar: texto, logotipos, marcas, sangre, encía humana inflamada, rostros, manos sin guantes, anatomía incorrecta, número incorrecto de cúspides.

### 10 · Tema 9.3 · figura 9.3.3 · 4:3

- **Identificador:** `caries-dental/m09/09`
- **Qué muestra:** Premolar y molar de tipodonto con restauraciones de resina compuesta pulidas que imitan el color natural del diente.
- **Pie en la lectura:** Una resina bien pulida se integra con el diente y facilita el control de la biopelícula.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía macro de un segundo premolar y un primer molar superiores permanentes de tipodonto en vista oclusal, con restauraciones de resina compuesta pequeñas y pulidas en las fosas, del mismo tono que el esmalte, con anatomía de surcos natural y márgenes invisibles. Fondo negro mate, iluminación de flash clínico doble, brillo natural en las cúspides, enfoque nítido. Evitar: texto, flechas, etiquetas, marcas, sangre, encía humana, dientes deformes, número incorrecto de cúspides, colores artificiales.

### 11 · Tema 9.4 · figura 9.4.1 · 1:1

- **Identificador:** `caries-dental/m09/10`
- **Qué muestra:** Cápsula de ionómero de vidrio sin marca junto a un aplicador y una loseta de mezcla con material blanco.
- **Pie en la lectura:** Los ionómeros de vidrio se presentan en cápsulas predosificadas o en polvo y líquido para mezclar.
- **Tamaño:** 1400 × 1400 px

**Prompt:**

> Fotografía macro cuadrada de estudio sobre una superficie blanca: una cápsula plástica lisa de ionómero de vidrio sin marcas, un aplicador metálico para cápsulas, una loseta de vidrio con una pequeña porción de material blanco cremoso recién mezclado y una espátula de plástico. Iluminación difusa, sombras suaves, enfoque nítido en el material, colores naturales y limpios. Evitar: texto, etiquetas, logotipos, marcas, manos sin guantes, rostros, sangre, colores artificiales, desorden.

### 12 · Tema 9.4 · figura 9.4.2 · 4:3

- **Identificador:** `caries-dental/m09/11`
- **Qué muestra:** Premolares inferiores de tipodonto con restauraciones cervicales blancas y opacas cerca del margen gingival.
- **Pie en la lectura:** Restauraciones cervicales de ionómero de vidrio: aspecto más opaco, pero buena tolerancia a la humedad.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía macro de la cara vestibular de dos premolares inferiores permanentes de un modelo tipodonto con encía artificial rosa, cada uno con una pequeña restauración cervical blanca, ligeramente opaca y mate, en el tercio gingival junto al margen de la encía. Iluminación clínica uniforme, fondo oscuro desenfocado, enfoque nítido en las restauraciones, colores naturales. Evitar: texto, flechas, etiquetas, marcas, sangre, inflamación, rostros, labios, anatomía dental incorrecta, colores artificiales.

### 13 · Tema 9.4 · figura 9.4.3 · 16:9

- **Identificador:** `caries-dental/m09/12`
- **Qué muestra:** Pasante de odontología con equipo de protección atendiendo a un niño en una brigada comunitaria con instrumental manual.
- **Pie en la lectura:** El ionómero de alta viscosidad permite restaurar con instrumentos manuales donde no hay equipo dental.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía horizontal de estilo documental en un salón comunitario luminoso con luz natural de ventana, una pasante de odontología con bata, gorro, cubrebocas, lentes de protección y guantes de nitrilo atiende a un niño de unos ocho años recostado en una camilla portátil, visto de perfil parcial sin rostro identificable, con lentes de protección; sobre una mesa plegable cubierta con campo estéril, instrumental manual ordenado y cápsulas lisas. Colores naturales, ambiente cálido y profesional. Evitar: texto, logotipos, marcas, rostros identificables, sangre, falta de equipo de protección, desorden.

### 14 · Tema 9.5 · figura 9.5.1 · 16:9

- **Identificador:** `caries-dental/m09/13`
- **Qué muestra:** Odontóloga con equipo de protección mostrando a un paciente, de espaldas, muestras de materiales en un modelo durante la planeación del tratamiento.
- **Pie en la lectura:** Explicar las alternativas de material, con sus ventajas y límites, forma parte del consentimiento informado.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía horizontal en un consultorio dental moderno, una odontóloga con bata clínica, cubrebocas, lentes de protección y guantes de nitrilo sostiene un modelo tipodonto con restauraciones de distintos materiales y lo muestra a un paciente adulto sentado frente a ella, visto de espaldas y sin rostro visible. Sobre la mesa, una hoja de consentimiento sin texto legible. Luz natural cálida combinada con luz clínica, colores naturales, ambiente de confianza. Evitar: texto legible, logotipos, marcas, rostros identificables, sangre, falta de equipo de protección.

### 15 · Tema 9.5 · figura 9.5.2 · 3:4

- **Identificador:** `caries-dental/m09/14`
- **Qué muestra:** Asistente dental con guantes y lentes con filtro naranja sosteniendo una lámpara de fotopolimerizar apagada.
- **Pie en la lectura:** Lentes o escudos con filtro naranja protegen los ojos del equipo durante la fotopolimerización.
- **Tamaño:** 1200 × 1600 px

**Prompt:**

> Fotografía vertical en un consultorio dental luminoso, una asistente dental de pie con bata clínica, gorro, cubrebocas y lentes de protección con filtro naranja translúcido, sosteniendo con ambas manos enguantadas una lámpara de fotopolimerizar inalámbrica apagada; rostro no identificable gracias al cubrebocas, los lentes y un encuadre desde el mentón hacia abajo. Fondo desenfocado de unidad dental limpia, luz blanca neutra, colores naturales. Evitar: texto, logotipos, marcas, rostros identificables, sangre, falta de equipo de protección, luz azul encendida dirigida a los ojos.

### 16 · Tema 9.5 · figura 9.5.3 · 4:3

- **Identificador:** `caries-dental/m09/15`
- **Qué muestra:** Odontólogo con equipo de protección revisando con espejo y sonda una restauración en un modelo durante un control.
- **Pie en la lectura:** El control periódico permite detectar defectos pequeños y repararlos a tiempo.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica de primer plano sobre un modelo tipodonto de arcada inferior permanente montado en un simulador, un odontólogo con guantes de nitrilo sostiene un espejo bucal y una sonda periodontal de punta roma revisando el margen de una restauración del color del diente en un primer molar. Antebrazos con bata clínica visibles, luz de lámpara dental dirigida, fondo desenfocado de consultorio, colores naturales. Evitar: texto, logotipos, marcas, sangre, rostros, manos sin guantes, anatomía incorrecta, instrumental oxidado.

## Módulo 10 · Caries en niños y caries de la infancia temprana

Carpeta: `imagenes-academia/02-caries-dental/modulo-10/` · 16 imágenes (6 de 16:9, 6 de 4:3, 2 de 3:4, 2 de 1:1).

### 01 · Portada del módulo · 16:9

- **Identificador:** `caries-dental/m10/portada`
- **Qué muestra:** Niña pequeña vista de espaldas en el regazo de su madre mientras una odontóloga con equipo de protección le sonríe en un consultorio infantil.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía realista de gran formato en un consultorio dental pediátrico luminoso y cálido, con colores suaves y juguetes ordenados al fondo. Una niña de unos tres años, vista de espaldas y sin mostrar su rostro, está sentada en el regazo de su madre, de quien solo se ven los brazos y el hombro. Frente a ellas, una odontóloga con bata azul, guantes de nitrilo, cubrebocas y lentes de protección sostiene un cepillo dental infantil y sonríe con los ojos. Luz natural lateral, profundidad de campo media, ambiente amable y tranquilo. Evitar: texto, letreros, logotipos, marcas de agua, rostro identificable de la niña, sangre, instrumental punzante a la vista, profesional sin guantes o sin cubrebocas.

### 02 · Tema 10.1 · figura 10.1.1 · 4:3

- **Identificador:** `caries-dental/m10/01`
- **Qué muestra:** Acercamiento de los incisivos superiores temporales de un niño pequeño con bandas blancas opacas junto al margen de la encía.
- **Pie en la lectura:** Lesiones iniciales de caries en los incisivos superiores temporales: bandas blancas opacas paralelas al margen gingival, todavía sin cavidad.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica macro de los cuatro incisivos superiores temporales de un niño de unos dos años, con el labio superior levantado suavemente por un dedo con guante de nitrilo azul. En el tercio cervical de la cara vestibular de cada incisivo se observa una banda blanca opaca y mate paralela al margen de la encía, sin cavidad; el resto del esmalte es blanco azulado y brillante. Encía rosa sana, dientes pequeños y con espacios fisiológicos entre ellos. Iluminación de lámpara dental neutra, enfoque nítido, fondo oscuro. Evitar: texto, flechas, logotipos, marcas de agua, sangre, rostro completo, dientes permanentes, cavidades profundas, mano sin guante.

### 03 · Tema 10.1 · figura 10.1.2 · 3:4

- **Identificador:** `caries-dental/m10/02`
- **Qué muestra:** Manos de un padre cepillando los dientes de un niño pequeño recostado en su regazo, vistos desde arriba.
- **Pie en la lectura:** La higiene de un niño pequeño depende de un adulto: la posición con la cabeza del niño apoyada en el regazo da visibilidad y control.
- **Tamaño:** 1200 × 1600 px

**Prompt:**

> Fotografía realista vertical en un baño doméstico limpio con luz natural suave. Un niño de unos dos años está recostado boca arriba con la cabeza apoyada en el regazo de su padre; el encuadre muestra desde arriba las manos del adulto sosteniendo con delicadeza un cepillo dental infantil de cabeza pequeña y cerdas suaves sobre los dientes temporales del niño. Solo se ven la boca abierta con labios, la barbilla y las manos, sin mostrar ojos ni rostro completo. Tonos cálidos y naturales, ambiente tranquilo. Evitar: texto, logotipos, marcas de agua, marcas comerciales en el cepillo, rostro identificable, exceso de pasta dental, sangre, expresión de llanto.

### 04 · Tema 10.1 · figura 10.1.3 · 16:9

- **Identificador:** `caries-dental/m10/03`
- **Qué muestra:** Odontólogo con equipo de protección completo revisa la boca de un niño sentado en el sillón, visto desde detrás de la cabeza del niño.
- **Pie en la lectura:** La revisión temprana permite registrar lesiones iniciales y comenzar la prevención antes de que aparezca la cavidad.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía realista horizontal de un consultorio dental infantil limpio y bien iluminado, con paredes de colores pastel. Un niño de unos cinco años está sentado en el sillón dental, visto desde detrás y ligeramente de lado, de modo que solo se aprecian su cabello y su hombro. Un odontólogo con bata, guantes de nitrilo, cubrebocas, gorro y lentes de protección examina su boca con un espejo dental, mientras la lámpara ilumina el campo. Al fondo, una charola ordenada con instrumental básico cubierto. Luz neutra, colores naturales. Evitar: texto, letreros, logotipos, marcas de agua, rostro del niño, sangre, instrumental punzante en primer plano, profesional sin equipo de protección.

### 05 · Tema 10.2 · figura 10.2.1 · 4:3

- **Identificador:** `caries-dental/m10/04`
- **Qué muestra:** Biberón con líquido de color naranja sobre una cuna junto a una cobija, en penumbra.
- **Pie en la lectura:** El biberón con bebidas azucaradas durante el sueño es uno de los factores de riesgo más conocidos de la caries de la infancia temprana.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía realista en penumbra de la esquina de una cuna de madera clara con una cobija suave arrugada. Sobre el colchón descansa un biberón de plástico transparente a medio llenar con un líquido de color naranja que sugiere jugo, con la mamila hacia abajo y una pequeña gota en la punta. Luz cálida y tenue de lámpara de noche desde un lado, sombras suaves, ambiente doméstico tranquilo, profundidad de campo corta con el biberón en foco. No aparece ninguna persona. Evitar: texto, logotipos, marcas comerciales, etiquetas en el biberón, marcas de agua, bebé visible, colores saturados artificiales.

### 06 · Tema 10.2 · figura 10.2.2 · 1:1

- **Identificador:** `caries-dental/m10/05`
- **Qué muestra:** Vaso entrenador con agua y un plato con fruta picada sobre la mesa de una cocina.
- **Pie en la lectura:** Agua simple en vaso entrenador y fruta entera en las comidas: alternativas sencillas a las bebidas azucaradas entre comidas.
- **Tamaño:** 1400 × 1400 px

**Prompt:**

> Fotografía realista cuadrada de una mesa de cocina mexicana de madera clara con luz natural de mañana. En primer plano, un vaso entrenador infantil transparente con asas laterales lleno de agua simple, junto a un plato pequeño de cerámica blanca con trozos de papaya, plátano y manzana recién picados. Al fondo, desenfocado, un frutero con naranjas y una jarra de agua. Composición limpia y hogareña, colores naturales y frescos. No aparecen personas. Evitar: texto, logotipos, marcas comerciales, empaques, refrescos, dulces, marcas de agua, colores saturados artificiales.

### 07 · Tema 10.2 · figura 10.2.3 · 16:9

- **Identificador:** `caries-dental/m10/06`
- **Qué muestra:** Odontóloga con equipo de protección conversa con una abuela y una madre en el consultorio mientras un niño juega de espaldas.
- **Pie en la lectura:** La evaluación de riesgo en la primera infancia es una entrevista con toda la familia que cuida al niño.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía realista horizontal en un consultorio dental infantil luminoso. Una odontóloga con bata clara, cubrebocas, gorro y lentes de protección, con guantes de nitrilo, conversa sentada frente a dos mujeres adultas, una joven y una mayor, que escuchan con atención; las mujeres aparecen de perfil o parcialmente de espaldas, sin rostros nítidos. En el piso, un niño de unos dos años juega de espaldas con bloques de colores. Luz natural difusa, ambiente cordial, colores suaves. Evitar: texto, letreros, logotipos, marcas de agua, rostros identificables, sangre, instrumental a la vista, profesional sin equipo de protección.

### 08 · Tema 10.3 · figura 10.3.1 · 4:3

- **Identificador:** `caries-dental/m10/07`
- **Qué muestra:** Incisivos superiores temporales con lesiones café que rodean el cuello de los dientes, vistos de frente con el labio levantado.
- **Pie en la lectura:** Lesiones moderadas en incisivos superiores temporales: la mancha blanca inicial se ha pigmentado y el esmalte cervical comienza a perderse.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica macro, vista frontal de los incisivos superiores temporales de un niño de unos tres años, con el labio superior levantado con delicadeza por un dedo con guante de nitrilo. En el tercio cervical de los cuatro incisivos se observan lesiones de color café claro y amarillento que rodean el cuello del diente, con pérdida superficial del esmalte en dos de ellos, sin exposición pulpar. Encía rosa con leve enrojecimiento marginal, sin sangrado. Incisivos inferiores sanos visibles en segundo plano. Iluminación de lámpara dental neutra, enfoque nítido. Evitar: texto, flechas, logotipos, marcas de agua, sangre, pus, abscesos, rostro completo, dientes permanentes, mano sin guante.

### 09 · Tema 10.3 · figura 10.3.2 · 16:9

- **Identificador:** `caries-dental/m10/08`
- **Qué muestra:** Examen rodilla con rodilla: una odontóloga con equipo de protección y una madre sentadas frente a frente con un bebé recostado sobre sus piernas.
- **Pie en la lectura:** Examen rodilla con rodilla: el niño se recuesta con la cabeza en el regazo del profesional y las manos sostenidas por su cuidador.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía realista horizontal en un consultorio dental infantil iluminado. Una odontóloga con bata, guantes de nitrilo, cubrebocas, gorro y lentes de protección y una madre están sentadas frente a frente en sillas bajas con las rodillas juntas. Un bebé de unos 15 meses está recostado sobre las piernas de ambas, con la cabeza en el regazo de la odontóloga, que sostiene un espejo dental pequeño; la madre sostiene con suavidad las manos del bebé. Encuadre lateral que no muestra el rostro del bebé ni el de la madre con nitidez. Luz suave, colores cálidos. Evitar: texto, logotipos, marcas de agua, rostros identificables, sangre, instrumental punzante, profesional sin equipo de protección, posturas forzadas.

### 10 · Tema 10.3 · figura 10.3.3 · 3:4

- **Identificador:** `caries-dental/m10/09`
- **Qué muestra:** Madre levanta con un dedo el labio superior de su hijo para revisar sus dientes junto a una ventana.
- **Pie en la lectura:** La revisión «levanta el labio» en casa permite detectar manchas blancas antes de que aparezca la cavidad.
- **Tamaño:** 1200 × 1600 px

**Prompt:**

> Fotografía realista vertical en una sala doméstica junto a una ventana con luz natural suave. Encuadre cerrado sobre las manos de una madre que, con el dedo índice, levanta con delicadeza el labio superior de un niño de unos dos años para observar sus incisivos superiores temporales, sanos y blancos. Se ven solo la boca con los labios, la punta de la nariz y las manos, sin ojos ni rostro completo. Tonos cálidos, fondo desenfocado, ambiente tranquilo y afectuoso. Evitar: texto, logotipos, marcas de agua, rostro identificable, uñas largas o decoradas, sangre, lesiones visibles, expresión de llanto.

### 11 · Tema 10.4 · figura 10.4.1 · 1:1

- **Identificador:** `caries-dental/m10/10`
- **Qué muestra:** Cepillo dental infantil con una cantidad mínima de pasta, del tamaño de un grano de arroz, junto a otro con una porción del tamaño de un chícharo.
- **Pie en la lectura:** Dos cantidades de pasta de uso común en las guías: una capa mínima, del tamaño de un grano de arroz, y una porción del tamaño de un chícharo.
- **Tamaño:** 1400 × 1400 px

**Prompt:**

> Fotografía realista cuadrada de estudio sobre una superficie blanca mate. Dos cepillos dentales infantiles idénticos de cabeza pequeña y cerdas suaves, colocados en paralelo. Sobre las cerdas del primero hay una capa mínima de pasta dental blanca del tamaño de un grano de arroz; sobre el segundo, una porción redonda del tamaño de un chícharo. Iluminación suave y uniforme, sombras ligeras, enfoque nítido en las cerdas, colores neutros. Evitar: texto, números, etiquetas, logotipos, marcas comerciales, empaques de pasta, marcas de agua, exceso de pasta, colores fluorescentes.

### 12 · Tema 10.4 · figura 10.4.2 · 4:3

- **Identificador:** `caries-dental/m10/11`
- **Qué muestra:** Mujer embarazada sentada en el sillón dental conversa con un odontólogo con equipo de protección, vista de perfil desde atrás.
- **Pie en la lectura:** La consulta durante el embarazo es una oportunidad para atender la salud bucal de la madre y preparar los hábitos del bebé.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía realista en un consultorio dental moderno y luminoso. Una mujer con embarazo avanzado, de unos treinta años, está sentada en posición semirreclinada y cómoda en el sillón dental, vista de perfil desde atrás de modo que su rostro no se distingue; apoya una mano sobre el vientre. Frente a ella, un odontólogo con bata, guantes de nitrilo, cubrebocas, gorro y lentes de protección le muestra un cepillo dental infantil mientras conversan. Luz natural suave, colores cálidos y naturales, ambiente sereno. Evitar: texto, letreros, logotipos, marcas de agua, rostro identificable, jeringas, agujas, sangre, radiografías, profesional sin equipo de protección.

### 13 · Tema 10.4 · figura 10.4.3 · 16:9

- **Identificador:** `caries-dental/m10/12`
- **Qué muestra:** Enfermera con cubrebocas y guantes observa la boca de un bebé en brazos de su madre en un centro de salud, de espaldas.
- **Pie en la lectura:** El personal de enfermería y medicina que ve al niño en sus consultas de control puede detectar lesiones iniciales y referir a tiempo.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía realista horizontal en un consultorio limpio de un centro de salud comunitario en México, con luz natural difusa. Una enfermera con uniforme, cubrebocas, guantes de nitrilo y lentes de protección observa con una pequeña linterna la boca de un bebé de alrededor de un año que está en brazos de su madre. La madre y el bebé aparecen de espaldas o de perfil sin rostros nítidos. Al fondo, una báscula pediátrica y un escritorio ordenado. Colores naturales, ambiente amable. Evitar: texto, carteles, logotipos institucionales, marcas de agua, rostros identificables, agujas o jeringas visibles, sangre, profesional sin equipo de protección.

### 14 · Tema 10.5 · figura 10.5.1 · 4:3

- **Identificador:** `caries-dental/m10/13`
- **Qué muestra:** Molar temporal en un modelo didáctico con una lesión oclusal detenida, oscura y brillante.
- **Pie en la lectura:** Lesión de caries detenida en un molar temporal: superficie dura, lisa y oscura. El seguimiento confirma que se mantiene inactiva.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica macro realista de un modelo didáctico de alta calidad de la arcada inferior temporal, enfocada en el primer molar temporal inferior derecho visto desde oclusal. En el centro de su cara oclusal hay una lesión poco profunda de bordes definidos, de color negro brillante y superficie lisa y dura, que representa una lesión detenida; el resto del esmalte es blanco natural. Molares y caninos temporales con anatomía correcta alrededor. Iluminación de lámpara dental uniforme, fondo neutro oscuro, enfoque nítido. Evitar: texto, flechas, etiquetas, logotipos, marcas de agua, sangre, encía inflamada, dientes permanentes, instrumental en el campo.

### 15 · Tema 10.5 · figura 10.5.2 · 4:3

- **Identificador:** `caries-dental/m10/14`
- **Qué muestra:** Primer molar permanente inferior en erupción detrás del segundo molar temporal, con la encía cubriendo parte de su cara distal.
- **Pie en la lectura:** Primer molar permanente en erupción: su superficie oclusal queda por debajo del plano de oclusión y es difícil de limpiar.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica macro, vista oclusal de la hemiarcada inferior derecha de un niño de unos seis años, con el labio y la mejilla retraídos con suavidad por un espejo dental sostenido con guante de nitrilo. Se observan los molares temporales sanos y, detrás del segundo molar temporal, un primer molar permanente en erupción con sus cúspides visibles y la encía cubriendo todavía parte de su cara distal; fisuras profundas limpias, sin cavidades. Encía rosa sana. Iluminación de lámpara dental neutra, enfoque nítido. Evitar: texto, flechas, logotipos, marcas de agua, sangre, inflamación severa, rostro, número incorrecto de cúspides, dientes deformes, mano sin guante.

### 16 · Tema 10.5 · figura 10.5.3 · 16:9

- **Identificador:** `caries-dental/m10/15`
- **Qué muestra:** Odontopediatra con equipo de protección muestra un espejo dental a un niño sentado en el sillón, visto de espaldas.
- **Pie en la lectura:** La técnica de decir, mostrar y hacer: el niño conoce el instrumento antes de que se use en su boca.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía realista horizontal en un consultorio de odontopediatría colorido y bien iluminado. Una odontopediatra con bata de colores suaves, guantes de nitrilo, cubrebocas, gorro y lentes de protección sostiene un espejo dental y lo muestra a un niño de unos cuatro años sentado en el sillón, que aparece de espaldas y solo deja ver su cabello y la mano extendida hacia el espejo. Una asistente con el mismo equipo de protección observa al fondo. Luz cálida y uniforme, ambiente lúdico y calmado. Evitar: texto, letreros, logotipos, marcas de agua, rostro del niño, jeringas, agujas, sangre, instrumental punzante en primer plano, profesionales sin equipo de protección.

## Módulo 11 · Caries radicular y salud bucal en personas mayores

Carpeta: `imagenes-academia/02-caries-dental/modulo-11/` · 16 imágenes (6 de 16:9, 7 de 4:3, 1 de 3:4, 2 de 1:1).

### 01 · Portada del módulo · 16:9

- **Identificador:** `caries-dental/m11/portada`
- **Qué muestra:** Hombre mayor visto de espaldas en el sillón dental mientras una odontóloga con equipo de protección le muestra un cepillo interdental.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía realista de gran formato en un consultorio dental moderno, limpio y luminoso. Un hombre de unos setenta y cinco años, de cabello cano, está sentado en el sillón dental y aparece de espaldas y ligeramente de perfil, sin mostrar su rostro. Frente a él, una odontóloga con bata, guantes de nitrilo, cubrebocas, gorro y lentes de protección le muestra con paciencia un cepillo interdental pequeño y un cepillo dental de mango grueso. Luz natural lateral cálida, ambiente respetuoso y tranquilo, colores naturales. Evitar: texto, letreros, logotipos, marcas de agua, rostro identificable del paciente, sangre, jeringas, instrumental punzante en primer plano, profesional sin equipo de protección.

### 02 · Tema 11.1 · figura 11.1.1 · 4:3

- **Identificador:** `caries-dental/m11/01`
- **Qué muestra:** Sonrisa de una mujer mayor con dientes naturales, encía ligeramente retraída y raíces visibles en los caninos inferiores.
- **Pie en la lectura:** Dentición natural en una persona mayor: la recesión gingival deja expuesta parte de la raíz en algunos dientes.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica realista en primer plano de la boca de una mujer de unos setenta años sonriendo, encuadre que muestra solo los labios y los dientes, sin nariz ni ojos. Dientes naturales con ligero desgaste incisal y tono marfil, algunas restauraciones del color del diente, encía rosa pálido con recesión leve en caninos y premolares inferiores que deja ver una franja de raíz amarillenta, sin lesiones cavitadas evidentes. Iluminación de estudio suave y uniforme, fondo neutro, colores naturales. Evitar: texto, logotipos, marcas de agua, rostro completo, sangre, encía inflamada, dientes artificialmente blancos, dientes deformes, número incorrecto de dientes.

### 03 · Tema 11.1 · figura 11.1.2 · 3:4

- **Identificador:** `caries-dental/m11/02`
- **Qué muestra:** Manos de una persona mayor sosteniendo un cepillo dental de mango grueso sobre un lavabo.
- **Pie en la lectura:** Los cambios en la destreza manual hacen necesario adaptar los instrumentos de higiene, por ejemplo con mangos más gruesos.
- **Tamaño:** 1200 × 1600 px

**Prompt:**

> Fotografía realista vertical en un baño doméstico limpio con luz natural suave de ventana. Encuadre cerrado sobre las manos de una persona de unos ochenta años, con piel arrugada y articulaciones algo engrosadas, que sostienen con firmeza un cepillo dental de mango grueso y antideslizante sobre un lavabo blanco. Al lado, un vaso con agua y un cepillo interdental pequeño. No se ve el rostro. Tonos cálidos y naturales, profundidad de campo corta con foco en las manos. Evitar: texto, logotipos, marcas comerciales, empaques, marcas de agua, rostro, sangre, suciedad, colores saturados artificiales.

### 04 · Tema 11.1 · figura 11.1.3 · 16:9

- **Identificador:** `caries-dental/m11/03`
- **Qué muestra:** Odontólogo con equipo de protección muestra a una paciente mayor, vista de espaldas, sus dientes en un espejo de mano.
- **Pie en la lectura:** Mostrar al paciente sus raíces expuestas con un espejo de mano lo convierte en aliado de la prevención.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía realista horizontal en un consultorio dental bien iluminado. Una mujer de unos setenta años, de cabello gris recogido, está sentada en el sillón dental y aparece de espaldas, sosteniendo un espejo de mano a la altura de su boca; su reflejo no se distingue. A su lado, un odontólogo con bata, guantes de nitrilo, cubrebocas, gorro y lentes de protección señala con un dedo enguantado hacia el espejo mientras le explica. Luz neutra y suave, ambiente cordial, colores naturales. Evitar: texto, letreros, logotipos, marcas de agua, rostro identificable de la paciente, reflejo nítido del rostro, sangre, instrumental punzante, profesional sin equipo de protección.

### 05 · Tema 11.2 · figura 11.2.1 · 4:3

- **Identificador:** `caries-dental/m11/04`
- **Qué muestra:** Lesión de caries radicular amarillenta y mate en la cara vestibular de un canino inferior, junto al margen de la encía.
- **Pie en la lectura:** Lesión radicular de aspecto activo: amarillenta, mate y junto al margen gingival, en una raíz expuesta por recesión.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica macro de la cara vestibular de un canino inferior permanente de una persona de unos setenta años, con recesión gingival que deja expuestos unos tres milímetros de raíz. Justo debajo de la unión cemento-esmalte y junto al margen de la encía se observa una lesión poco profunda, ancha y alargada, de color amarillo-café claro, superficie mate y bordes difusos, con una delgada capa de placa blanquecina en el borde. Encía rosa sin sangrado. Labio inferior retraído con suavidad por un espejo sostenido con guante de nitrilo. Iluminación de lámpara dental neutra. Evitar: texto, flechas, logotipos, marcas de agua, sangre, pus, rostro, dientes deformes, mano sin guante.

### 06 · Tema 11.2 · figura 11.2.2 · 4:3

- **Identificador:** `caries-dental/m11/05`
- **Qué muestra:** Lesión radicular oscura, lisa y brillante en un premolar inferior, alejada del margen de la encía.
- **Pie en la lectura:** Lesión radicular de aspecto detenido: oscura, lisa, brillante y separada del margen gingival.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica macro de la cara vestibular de un primer premolar inferior permanente de una persona mayor, con recesión gingival amplia. En la superficie radicular expuesta, a un par de milímetros del margen de la encía, se ve una lesión plana de color café oscuro casi negro, de superficie lisa y brillante que refleja la luz de la lámpara, sin placa encima. Encía rosa firme. Mejilla retraída con un espejo dental sostenido con guante de nitrilo. Iluminación de lámpara dental neutra, enfoque nítido. Evitar: texto, flechas, logotipos, marcas de agua, sangre, rostro, encía inflamada, dientes deformes, mano sin guante.

### 07 · Tema 11.2 · figura 11.2.3 · 16:9

- **Identificador:** `caries-dental/m11/06`
- **Qué muestra:** Manos con guantes deslizan una sonda de punta roma sobre una raíz expuesta mientras otra mano seca la zona con la jeringa de aire.
- **Pie en la lectura:** La textura se valora deslizando con suavidad una sonda de punta roma sobre la superficie radicular limpia y seca.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía clínica realista horizontal, encuadre cerrado de la zona de premolares inferiores de una persona mayor con recesión gingival, labios y mejilla retraídos. Una mano con guante de nitrilo desliza con suavidad la punta roma de una sonda periodontal sobre una lesión amarillenta en la raíz expuesta, mientras otra mano enguantada dirige la jeringa triple de aire hacia la zona. Al borde del encuadre se ve la manga de una bata. Iluminación de lámpara dental neutra, enfoque nítido en la punta de la sonda. Evitar: texto, flechas, logotipos, marcas de agua, sangre, encía lacerada, rostro, explorador puntiagudo, manos sin guantes.

### 08 · Tema 11.3 · figura 11.3.1 · 1:1

- **Identificador:** `caries-dental/m11/07`
- **Qué muestra:** Recipiente graduado transparente con una pequeña cantidad de saliva sobre una charola dental junto a un cronómetro.
- **Pie en la lectura:** La medición del flujo de saliva no estimulada solo requiere un recipiente graduado, un cronómetro y condiciones constantes.
- **Tamaño:** 1400 × 1400 px

**Prompt:**

> Fotografía realista cuadrada de una charola dental de acero inoxidable sobre la mesa auxiliar de un consultorio limpio y bien iluminado. Sobre la charola, un recipiente plástico transparente graduado con tapa a un lado, que contiene una pequeña cantidad de líquido claro y ligeramente espumoso en el fondo, junto a un cronómetro digital de pantalla apagada y una gasa doblada. Un par de manos con guantes de nitrilo azul acomodan el recipiente. Iluminación de lámpara dental neutra, fondo desenfocado. Evitar: texto, números legibles, etiquetas, logotipos, marcas comerciales, marcas de agua, sangre, rostro, manos sin guantes.

### 09 · Tema 11.3 · figura 11.3.2 · 4:3

- **Identificador:** `caries-dental/m11/08`
- **Qué muestra:** Pastillero semanal con varios medicamentos junto a un vaso de agua sobre una mesa de cocina.
- **Pie en la lectura:** La polifarmacia es frecuente en personas mayores; muchos medicamentos de uso común reducen el flujo salival.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía realista sobre una mesa de cocina de madera con luz natural de mañana. En primer plano, un pastillero semanal de plástico translúcido con compartimentos abiertos que contienen tabletas y cápsulas de distintos colores y tamaños, junto a un vaso de vidrio con agua simple. Al fondo, desenfocados, unos anteojos de lectura y una taza. Composición ordenada y doméstica, colores naturales. No aparecen personas. Evitar: texto, nombres de medicamentos, etiquetas, cajas con marcas, logotipos, marcas de agua, jeringas, sangre, colores saturados artificiales.

### 10 · Tema 11.3 · figura 11.3.3 · 16:9

- **Identificador:** `caries-dental/m11/09`
- **Qué muestra:** Odontóloga con equipo de protección revisa con una paciente mayor, vista de espaldas, una bolsa con sus medicamentos.
- **Pie en la lectura:** Revisar con el paciente todos sus medicamentos ayuda a identificar los que pueden reducir la saliva.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía realista horizontal en un consultorio dental luminoso, en el área de escritorio junto al sillón. Una odontóloga con bata, cubrebocas, gorro y lentes de protección, sin guantes porque está en el área administrativa, revisa junto a una mujer de unos ochenta años varias cajas de medicamentos sin etiquetas legibles sobre el escritorio, y toma notas en una tableta. La paciente aparece de espaldas, con cabello blanco y un suéter, sin rostro visible. Luz natural suave, ambiente atento y cordial. Evitar: texto legible, nombres de medicamentos, logotipos, marcas comerciales, marcas de agua, rostro identificable, jeringas, sangre.

### 11 · Tema 11.4 · figura 11.4.1 · 4:3

- **Identificador:** `caries-dental/m11/10`
- **Qué muestra:** Cepillo interdental limpiando el espacio entre dos premolares inferiores con raíces expuestas en un modelo didáctico.
- **Pie en la lectura:** Los cepillos interdentales del calibre adecuado limpian las superficies proximales de las raíces expuestas.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía macro realista de un modelo didáctico de arcada inferior de adulto mayor con encía de silicona rosa que simula recesión gingival y espacios interdentales amplios. Un cepillo interdental pequeño de mango delgado se introduce con suavidad entre el primer y el segundo premolar inferiores, a la altura de las raíces expuestas, sostenido por dedos con guante de nitrilo. Anatomía dental correcta, iluminación de estudio suave, fondo neutro claro, enfoque nítido en el cepillo. Evitar: texto, etiquetas, logotipos, marcas comerciales, marcas de agua, sangre, encía real lacerada, dientes deformes, mano sin guante.

### 12 · Tema 11.4 · figura 11.4.2 · 4:3

- **Identificador:** `caries-dental/m11/11`
- **Qué muestra:** Odontóloga con equipo de protección aplica barniz con un pincel fino sobre la raíz expuesta de un premolar inferior.
- **Pie en la lectura:** Aplicación profesional de barniz con fluoruro en superficies radiculares expuestas, según el riesgo del paciente.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica realista en primer plano de la zona de premolares inferiores de un adulto mayor con recesión gingival, con la mejilla retraída por un espejo dental y la zona aislada con rollos de algodón. Una mano con guante de nitrilo sostiene un pincel aplicador fino y deposita una capa delgada y translúcida de barniz sobre la raíz expuesta del primer premolar. Al fondo, desenfocada, la manga de una bata y el borde de unos lentes de protección. Iluminación de lámpara dental neutra, enfoque nítido en la punta del pincel. Evitar: texto, etiquetas, logotipos, marcas comerciales, marcas de agua, sangre, rostro, manos sin guantes, exceso de producto.

### 13 · Tema 11.4 · figura 11.4.3 · 16:9

- **Identificador:** `caries-dental/m11/12`
- **Qué muestra:** Odontólogo con equipo de protección enseña a un paciente mayor, visto de espaldas, a usar un cepillo eléctrico frente a un espejo.
- **Pie en la lectura:** Enseñar y pedir que el paciente demuestre la técnica asegura que la recomendación sea posible para él.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía realista horizontal en un área de enseñanza de higiene dentro de un consultorio dental, con un lavabo y un espejo amplio. Un hombre de unos setenta y cinco años, visto de espaldas y sin reflejo nítido de su rostro, sostiene un cepillo dental eléctrico. A su lado, un odontólogo con bata, guantes de nitrilo, cubrebocas, gorro y lentes de protección le guía la mano con suavidad para mostrarle el ángulo correcto. Luz blanca suave, ambiente limpio, colores naturales. Evitar: texto, logotipos, marcas comerciales, marcas de agua, rostro identificable, reflejo nítido del rostro, sangre, profesional sin equipo de protección.

### 14 · Tema 11.5 · figura 11.5.1 · 4:3

- **Identificador:** `caries-dental/m11/13`
- **Qué muestra:** Cuidadora con guantes y cubrebocas cepilla los dientes de una persona mayor sentada en una silla, vista desde atrás.
- **Pie en la lectura:** Higiene asistida: la persona sentada y el cuidador detrás o a un lado, con buena luz y guantes.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía realista en una habitación luminosa de una casa de asistencia para personas mayores, limpia y ordenada. Una cuidadora con uniforme claro, guantes de nitrilo, cubrebocas y lentes de protección está de pie detrás de un hombre de unos ochenta y cinco años sentado en una silla con respaldo; con una mano sostiene suavemente su barbilla y con la otra un cepillo dental de cabeza pequeña. Encuadre desde atrás y ligeramente lateral que no muestra el rostro del hombre. Luz natural suave, ambiente respetuoso y tranquilo. Evitar: texto, logotipos, marcas de agua, rostro identificable, sangre, gestos de forcejeo, cama de hospital con equipo médico invasivo, cuidadora sin guantes.

### 15 · Tema 11.5 · figura 11.5.2 · 16:9

- **Identificador:** `caries-dental/m11/14`
- **Qué muestra:** Odontóloga con equipo de protección enseña a un grupo de cuidadores a limpiar una dentadura removible sobre un modelo.
- **Pie en la lectura:** La capacitación del personal de casas de asistencia multiplica el alcance de la prevención.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía realista horizontal en una sala de capacitación sencilla y luminosa de una casa de asistencia. Una odontóloga con bata, guantes de nitrilo, cubrebocas y lentes de protección sostiene una prótesis parcial removible sobre un lavabo portátil y muestra cómo cepillarla con un cepillo para prótesis. A su alrededor, cuatro cuidadores con uniforme y cubrebocas observan de pie, vistos de espaldas o de perfil sin rostros nítidos. Luz natural difusa, ambiente participativo. Evitar: texto, carteles, logotipos, marcas comerciales, marcas de agua, rostros identificables, sangre, prótesis con anatomía incorrecta, profesional sin guantes.

### 16 · Tema 11.5 · figura 11.5.3 · 1:1

- **Identificador:** `caries-dental/m11/15`
- **Qué muestra:** Prótesis parcial removible limpia guardada en un recipiente con tapa junto a un cepillo para prótesis.
- **Pie en la lectura:** La prótesis se limpia por separado y se guarda limpia; la boca debajo de ella también necesita revisión.
- **Tamaño:** 1400 × 1400 px

**Prompt:**

> Fotografía realista cuadrada de estudio sobre una superficie blanca de baño. Una prótesis parcial removible superior limpia, con base acrílica rosa, dientes artificiales de anatomía correcta y ganchos metálicos discretos, reposa dentro de un recipiente plástico transparente con tapa abierta. A un lado, un cepillo para prótesis de dos cabezales y una toalla pequeña doblada. Iluminación suave y uniforme, sombras ligeras, colores naturales. Evitar: texto, etiquetas, logotipos, marcas comerciales, marcas de agua, restos de comida, sarro, manchas, sangre, dientes deformes, prótesis rota.

## Módulo 12 · Comunicación con el paciente y programas de prevención

Carpeta: `imagenes-academia/02-caries-dental/modulo-12/` · 16 imágenes (6 de 16:9, 5 de 4:3, 1 de 3:4, 4 de 1:1).

### 01 · Portada del módulo · 16:9

- **Identificador:** `caries-dental/m12/portada`
- **Qué muestra:** Odontóloga con cubrebocas conversa sentada a la altura de una paciente adulta, vista de espaldas, mientras le muestra una imagen intraoral en un monitor.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía realista de gran formato en un consultorio dental moderno y luminoso. Una odontóloga con bata, cubrebocas, gorro y lentes de protección está sentada en un banco a la misma altura que una paciente adulta, que permanece sentada en el sillón y aparece de espaldas, sin rostro visible. Ambas miran un monitor que muestra una imagen intraoral ampliada de dientes sanos con placa teñida, sin texto en pantalla. La odontóloga gesticula con una mano enguantada, en actitud de explicar con calma. Luz natural lateral, colores cálidos y naturales. Evitar: texto, letreros, logotipos, interfaz con letras, marcas de agua, rostro identificable de la paciente, sangre, instrumental punzante, profesional sin equipo de protección.

### 02 · Tema 12.1 · figura 12.1.1 · 4:3

- **Identificador:** `caries-dental/m12/01`
- **Qué muestra:** Paciente adulto, visto de espaldas, observa en un espejo de mano sus dientes con placa teñida mientras un odontólogo con equipo de protección señala.
- **Pie en la lectura:** Ver la placa teñida en su propia boca convence más que cualquier explicación verbal.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía realista en un consultorio dental limpio y luminoso. Un hombre adulto de unos cuarenta años, sentado en el sillón y visto de espaldas y ligeramente de perfil, sostiene un espejo de mano frente a su boca; el reflejo muestra de forma difusa dientes con zonas teñidas de color violeta suave por una tableta reveladora de placa, sin rostro nítido. A su lado, un odontólogo con bata, guantes de nitrilo, cubrebocas, gorro y lentes de protección señala el espejo con un dedo enguantado. Luz natural suave, colores naturales. Evitar: texto, logotipos, marcas de agua, rostro identificable, reflejo nítido del rostro, sangre, instrumental punzante, profesional sin equipo de protección.

### 03 · Tema 12.1 · figura 12.1.2 · 16:9

- **Identificador:** `caries-dental/m12/02`
- **Qué muestra:** Madre, vista de espaldas, demuestra con un cepillo sobre un modelo dental cómo cepillará a su hijo mientras una asistente dental con equipo de protección observa.
- **Pie en la lectura:** El método «muéstrame»: la persona demuestra la técnica y el equipo corrige en el momento.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía realista horizontal en un área de educación para la salud dentro de un consultorio dental luminoso. Una mujer joven, vista de espaldas y sin rostro visible, sostiene un cepillo dental infantil sobre un modelo didáctico grande de dentición temporal colocado en una mesa. A su lado, una asistente dental con uniforme, guantes de nitrilo, cubrebocas y lentes de protección observa y señala con suavidad el ángulo del cepillo. Al fondo, desenfocado, un niño pequeño juega de espaldas. Luz natural difusa, colores suaves. Evitar: texto, carteles, logotipos, marcas comerciales, marcas de agua, rostros identificables, sangre, instrumental punzante, profesional sin equipo de protección.

### 04 · Tema 12.1 · figura 12.1.3 · 3:4

- **Identificador:** `caries-dental/m12/03`
- **Qué muestra:** Hoja de indicaciones ilustrada sin texto legible, con dibujos de un cepillo, un vaso de agua y un reloj, sobre la mesa junto a un cepillo dental.
- **Pie en la lectura:** Las indicaciones por escrito con dibujos ayudan a recordar lo esencial en casa.
- **Tamaño:** 1200 × 1600 px

**Prompt:**

> Fotografía realista vertical, vista cenital de una mesa de madera clara. Sobre ella hay una hoja tamaño carta con ilustraciones sencillas y coloridas de un cepillo dental, un vaso de agua, un reloj y una luna, organizadas en recuadros, sin letras ni números legibles, como una guía pictográfica. Junto a la hoja, un cepillo dental de adulto y un cepillo interdental pequeño. Luz natural suave de ventana, sombras ligeras, colores cálidos. Evitar: texto legible, letras, números, logotipos, marcas comerciales, marcas de agua, personas, colores fluorescentes.

### 05 · Tema 12.2 · figura 12.2.1 · 16:9

- **Identificador:** `caries-dental/m12/04`
- **Qué muestra:** Odontólogo con cubrebocas escucha con atención a un paciente adulto sentado frente a él, visto de perfil desde atrás.
- **Pie en la lectura:** Escuchar y reflejar lo que dice el paciente es la base de la entrevista motivacional.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía realista horizontal en un área de consulta tranquila junto al sillón dental, con luz natural suave. Un odontólogo con bata, cubrebocas, gorro y lentes de protección, sin instrumental en las manos, está sentado frente a un paciente adulto de unos cincuenta años con postura inclinada hacia adelante y gesto atento. El paciente aparece de perfil desde atrás, sin rostro visible, y gesticula con una mano mientras habla. Ambiente cálido y sin prisa, colores naturales, profundidad de campo media. Evitar: texto, letreros, logotipos, marcas de agua, rostro identificable del paciente, sangre, instrumental punzante, gestos de regaño, profesional sin cubrebocas.

### 06 · Tema 12.2 · figura 12.2.2 · 4:3

- **Identificador:** `caries-dental/m12/05`
- **Qué muestra:** Vaso de agua simple y botella de refresco sin etiqueta, uno junto al otro sobre un escritorio de oficina.
- **Pie en la lectura:** El cambio empieza con un paso pequeño elegido por la persona, como sustituir una bebida azucarada por agua.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía realista sobre un escritorio de oficina ordenado con luz natural de tarde. En primer plano, un vaso de vidrio con agua simple y hielos junto a una botella de vidrio de refresco oscuro sin etiqueta ni marca, ligeramente desenfocada y colocada un poco atrás. Al fondo, desenfocados, una libreta cerrada y un teclado. Composición sencilla que sugiere elección, colores naturales, profundidad de campo corta con foco en el vaso de agua. Evitar: texto, etiquetas, logotipos, marcas comerciales, marcas de agua, personas, colores saturados artificiales.

### 07 · Tema 12.2 · figura 12.2.3 · 1:1

- **Identificador:** `caries-dental/m12/06`
- **Qué muestra:** Manos de un paciente adulto y de una odontóloga con guantes revisando juntos una hoja de plan en blanco sobre una carpeta.
- **Pie en la lectura:** El plan de cambio se construye en conjunto y se revisa en la siguiente cita.
- **Tamaño:** 1400 × 1400 px

**Prompt:**

> Fotografía realista cuadrada, encuadre cerrado sobre una mesa clara en un consultorio. Se ven solo las manos de dos personas: a la izquierda, las manos de un paciente adulto sin guantes sosteniendo una pluma; a la derecha, una mano con guante de nitrilo de una odontóloga señalando una hoja de papel en blanco con algunos recuadros dibujados, sin texto legible, sobre una carpeta. Luz natural suave, tonos cálidos, profundidad de campo corta. Evitar: texto legible, letras, números, logotipos, marcas comerciales, marcas de agua, rostros, sangre, instrumental.

### 08 · Tema 12.3 · figura 12.3.1 · 16:9

- **Identificador:** `caries-dental/m12/07`
- **Qué muestra:** Monitor en el consultorio muestra dos fotografías intraorales lado a lado de una lesión blanca antes y después de detenerse; una odontóloga con equipo de protección señala.
- **Pie en la lectura:** Comparar fotografías de la misma lesión en distintas citas ayuda al paciente a ver el efecto de sus cambios.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía realista horizontal de un monitor sobre un brazo articulado junto al sillón dental en un consultorio luminoso. La pantalla muestra dos fotografías clínicas intraorales lado a lado de un mismo molar: a la izquierda con una mancha blanca opaca en el margen gingival y placa, a la derecha la misma zona limpia con la mancha más brillante y reducida, sin texto ni números en pantalla. Una mano con guante de nitrilo de una odontóloga con bata señala la imagen de la derecha. Luz neutra, enfoque en la pantalla. Evitar: texto, letras, números, interfaz de programa, logotipos, marcas de agua, rostros, sangre, profesional sin guantes.

### 09 · Tema 12.3 · figura 12.3.2 · 4:3

- **Identificador:** `caries-dental/m12/08`
- **Qué muestra:** Paciente adulta, vista de espaldas, lee un documento en una tableta mientras un odontólogo con cubrebocas le explica sentado a su lado.
- **Pie en la lectura:** El consentimiento informado documenta una conversación, no la sustituye.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía realista en el área de escritorio de un consultorio dental moderno con luz natural. Una mujer adulta de unos treinta y cinco años, vista de espaldas y sin rostro visible, sostiene una tableta con un documento de texto pequeño e ilegible. A su lado, sentado a la misma altura, un odontólogo con bata, cubrebocas y lentes de protección señala una parte del documento con una pluma y le explica con calma. Ambiente sereno y respetuoso, colores naturales, profundidad de campo media. Evitar: texto legible, logotipos, marcas comerciales, marcas de agua, rostro identificable, sangre, instrumental, gestos de presión.

### 10 · Tema 12.3 · figura 12.3.3 · 1:1

- **Identificador:** `caries-dental/m12/09`
- **Qué muestra:** Modelo dental didáctico de un molar seccionado sobre la mesa del consultorio, junto a un espejo de mano.
- **Pie en la lectura:** Un modelo seccionado ayuda a explicar la diferencia entre una lesión superficial y una profunda.
- **Tamaño:** 1400 × 1400 px

**Prompt:**

> Fotografía realista cuadrada de estudio sobre la mesa clara de un consultorio. Un modelo didáctico grande de un molar permanente seccionado longitudinalmente muestra con colores realistas el esmalte, la dentina y la cámara pulpar, con una pequeña zona oscura que representa una lesión en el esmalte de la fisura. Junto al modelo, un espejo de mano dental con mango blanco. Iluminación suave y uniforme, sombras ligeras, fondo neutro. Evitar: texto, etiquetas, números, flechas, logotipos, marcas comerciales, marcas de agua, sangre, anatomía incorrecta, número incorrecto de raíces.

### 11 · Tema 12.4 · figura 12.4.1 · 16:9

- **Identificador:** `caries-dental/m12/10`
- **Qué muestra:** Equipo dental de tres personas con uniforme y cubrebocas en una reunión breve frente a una pizarra blanca sin texto.
- **Pie en la lectura:** Un programa preventivo se construye en equipo, con protocolos y funciones claras para cada persona.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía realista horizontal en una pequeña sala de juntas de un consultorio dental moderno, con luz natural. Tres integrantes del equipo dental, una odontóloga, un odontólogo y una asistente, con uniformes clínicos y cubrebocas, conversan de pie frente a una pizarra blanca vacía; uno de ellos sostiene una carpeta cerrada. Se ven de perfil o de tres cuartos, con gestos de colaboración. Ambiente profesional y ordenado, colores claros. Evitar: texto, escritura en la pizarra, gráficas con números, logotipos, marcas comerciales, marcas de agua, sangre, instrumental.

### 12 · Tema 12.4 · figura 12.4.2 · 4:3

- **Identificador:** `caries-dental/m12/11`
- **Qué muestra:** Recepcionista con cubrebocas agenda la siguiente cita de un paciente, visto de espaldas, en el mostrador del consultorio.
- **Pie en la lectura:** Agendar la siguiente cita preventiva antes de que el paciente salga es una de las medidas más sencillas y eficaces.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía realista en la recepción de un consultorio dental moderno, limpia y luminosa. Una recepcionista con uniforme y cubrebocas, sentada detrás de un mostrador claro, mira la pantalla de una computadora cuyo contenido no se ve, mientras sostiene una tarjeta de cita en blanco. Frente a ella, un paciente adulto de pie aparece de espaldas, sin rostro visible. Al fondo, una planta y una sala de espera ordenada. Luz natural suave, colores neutros y cálidos. Evitar: texto, letreros, logotipos, marcas comerciales, contenido legible en pantalla, marcas de agua, rostro identificable, sangre, instrumental.

### 13 · Tema 12.4 · figura 12.4.3 · 1:1

- **Identificador:** `caries-dental/m12/12`
- **Qué muestra:** Asistente dental con guantes y cubrebocas entrega a un paciente un cepillo interdental junto a una tableta reveladora de placa.
- **Pie en la lectura:** La asistente dental capacitada tiene un papel central en la educación y el seguimiento del programa preventivo.
- **Tamaño:** 1400 × 1400 px

**Prompt:**

> Fotografía realista cuadrada, encuadre cerrado en un consultorio dental luminoso. Una asistente dental con uniforme, guantes de nitrilo, cubrebocas y lentes de protección, de quien se ven las manos y parte del torso, entrega a un paciente adulto, del que solo se ve la mano extendida, un pequeño sobre con un cepillo interdental y una tableta reveladora de placa. Fondo desenfocado del área clínica con el sillón dental. Luz suave y uniforme, colores naturales. Evitar: texto, etiquetas, logotipos, marcas comerciales, marcas de agua, rostros, sangre, instrumental punzante, asistente sin guantes.

### 14 · Tema 12.5 · figura 12.5.1 · 16:9

- **Identificador:** `caries-dental/m12/13`
- **Qué muestra:** Grupo de niños de primaria vistos de espaldas cepillándose los dientes en lavabos escolares bajo la supervisión de una promotora de salud.
- **Pie en la lectura:** El cepillado supervisado en la escuela combina hábito, fluoruro y educación en un mismo momento.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía realista horizontal en el área de lavabos de una escuela primaria mexicana, limpia y con luz natural. Una fila de seis niñas y niños de unos siete u ocho años, con uniforme escolar, aparecen de espaldas frente a lavabos bajos, cada uno con su cepillo dental y su vaso. Detrás de ellos, una promotora de salud con bata, cubrebocas y guantes de nitrilo observa y guía. No se ven los rostros de los niños ni sus reflejos con nitidez. Colores alegres y naturales, ambiente ordenado. Evitar: texto, letreros, logotipos, marcas comerciales, marcas de agua, rostros identificables de los niños, reflejos nítidos, sangre, desorden.

### 15 · Tema 12.5 · figura 12.5.2 · 4:3

- **Identificador:** `caries-dental/m12/14`
- **Qué muestra:** Odontóloga con cubrebocas da una plática a un grupo de madres y padres, vistos de espaldas, en un salón comunitario.
- **Pie en la lectura:** Las pláticas con familias en espacios comunitarios llevan la prevención a quienes no acuden al consultorio.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía realista en un salón comunitario sencillo y luminoso de una colonia en México, con sillas de plástico acomodadas en semicírculo. Una odontóloga con bata, cubrebocas y lentes de protección, de pie al frente, sostiene un modelo dental grande y un cepillo mientras explica. Un grupo de madres y padres de familia sentados la escuchan y aparecen de espaldas, sin rostros visibles. Luz natural que entra por ventanas amplias, colores cálidos y naturales, ambiente participativo. Evitar: texto, carteles, letreros, logotipos institucionales, marcas comerciales, marcas de agua, rostros identificables, sangre, instrumental.

### 16 · Tema 12.5 · figura 12.5.3 · 1:1

- **Identificador:** `caries-dental/m12/15`
- **Qué muestra:** Bebedero con agua potable en el patio de una escuela, junto a un vaso reutilizable sobre la orilla.
- **Pie en la lectura:** El acceso a agua simple en las escuelas apoya la reducción de bebidas azucaradas.
- **Tamaño:** 1400 × 1400 px

**Prompt:**

> Fotografía realista cuadrada de un bebedero de acero inoxidable con agua potable en el patio de una escuela primaria mexicana, con luz de mañana. Sobre la orilla del bebedero descansa un vaso reutilizable de plástico de color azul. Al fondo, desenfocados, una cancha, árboles y una barda pintada de colores lisos. No aparecen personas. Colores naturales y alegres, enfoque nítido en el bebedero. Evitar: texto, letreros, murales con letras, logotipos, marcas comerciales, marcas de agua, personas, basura, refrescos.

## Resumen

| Módulo | Título | Imágenes |
| --- | --- | --- |
| 1 | Qué es la caries: biopelícula, azúcares y la hipótesis de la placa ecológica | 16 |
| 2 | Estructura dental, saliva y el equilibrio entre desmineralización y remineralización | 16 |
| 3 | Factores de riesgo y evaluación del riesgo de caries con CAMBRA e ICCMS | 16 |
| 4 | Diagnóstico de la caries: examen visual-táctil, ICDAS II y radiografías | 16 |
| 5 | Flúor y remineralización: mecanismos, vehículos y uso seguro | 16 |
| 6 | Selladores de fosetas y fisuras | 16 |
| 7 | Dieta y azúcares libres: la guía de la OMS en la práctica | 16 |
| 8 | Odontología mínimamente invasiva y remoción selectiva de tejido cariado | 16 |
| 9 | Materiales restauradores en el manejo de la caries | 16 |
| 10 | Caries en niños y caries de la infancia temprana | 16 |
| 11 | Caries radicular y salud bucal en personas mayores | 16 |
| 12 | Comunicación con el paciente y programas de prevención | 16 |

**Total del programa: 192 imágenes.**

## Revisión antes de entregar

- [ ] Ninguna imagen tiene texto, letras ni logotipos.
- [ ] La anatomía dental (número de cúspides, raíces, dentición) es correcta.
- [ ] Personas con equipo de protección; sin rostros identificables.
- [ ] La proporción es la indicada (el importador la revisa).
- [ ] Cada imagen está en la carpeta de su módulo.
