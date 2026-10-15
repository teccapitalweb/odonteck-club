# Imágenes · Programa 01 · Anatomía dental y de la cavidad oral

Documento de prompts de la Academia OdonTeck. Se genera desde el contenido del programa; si el contenido cambia, se vuelve a generar.

## Cómo entregar las imágenes

1. Abre la carpeta `imagenes-academia/01-anatomia-dental/`.
2. Entra a la subcarpeta del módulo (por ejemplo `modulo-01`).
3. Genera las imágenes **en el orden de la lista** y guárdalas ahí. Si puedes, nómbralas con su número (`01.png`, `portada.png`); si no, el importador usa el orden de creación y la proporción para identificarlas.
4. Ejecuta `npm run academia:importar-imagenes -- anatomia-dental` para revisarlas y `-- --aplicar` para convertirlas a WebP.

## Especificaciones generales

- Estilo: fotografía clínica realista o ilustración realista, consultorio dental limpio y bien iluminado, colores naturales.
- Anatomía dental correcta; sin sangre ni contenido gráfico perturbador; sin rostros identificables de pacientes.
- Equipo de protección personal correcto en toda escena clínica.
- Sin texto, letreros, logotipos ni marcas de agua dentro de la imagen.
- Tamaños sugeridos: 16:9 → 1920 × 1080 px · 4:3 → 1600 × 1200 px · 3:4 → 1200 × 1600 px · 1:1 → 1400 × 1400 px · 9:16 → 1080 × 1920 px.

## Módulo 1 · La cavidad oral: límites, regiones y funciones

Carpeta: `imagenes-academia/01-anatomia-dental/modulo-01/` · 16 imágenes (4 de 16:9, 8 de 4:3, 3 de 1:1, 1 de 3:4).

### 01 · Portada del módulo · 16:9

- **Identificador:** `anatomia-dental/m01/portada`
- **Qué muestra:** Vista frontal cercana de una boca adulta abierta con retractores, que muestra labios, dientes, lengua, paladar y el fondo de la garganta bajo luz clínica.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía clínica realista de gran formato de la boca abierta de un adulto joven sano, encuadre cerrado desde el mentón hasta la base de la nariz, labios separados con retractores transparentes, se aprecian ambas arcadas dentales permanentes completas, la lengua en reposo con papilas finas, el paladar duro con rugas suaves, el paladar blando con la úvula centrada y los arcos palatinos al fondo, mucosa rosa húmeda y sana, iluminación blanca uniforme de lámpara dental, fondo neutro desenfocado, colores naturales y nitidez alta. Evitar: texto, etiquetas, flechas, logotipos, marcas de agua, ojos o rostro completo, sangre, lesiones, dientes deformes o de más, aspecto de caricatura.

### 02 · Tema 1.1 · figura 1.1.1 · 4:3

- **Identificador:** `anatomia-dental/m01/01`
- **Qué muestra:** Corte sagital ilustrado de la cabeza que muestra la cavidad oral, la cavidad nasal por encima y la faringe por detrás.
- **Pie en la lectura:** La cavidad oral se relaciona por arriba con la cavidad nasal, por detrás con la orofaringe y por abajo con el piso muscular de la boca.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Ilustración anatómica realista de estilo atlas médico, corte sagital medio de la cabeza de un adulto visto desde la izquierda, se muestran la cavidad oral con la lengua en reposo, el paladar duro óseo y el paladar blando con la úvula, la cavidad nasal por encima, la orofaringe y la epiglotis por detrás, la mandíbula seccionada y los músculos del piso de la boca, colores anatómicos suaves y naturales, fondo blanco limpio, iluminación uniforme. Evitar: texto, etiquetas, números, flechas, rostro con rasgos identificables, sangre, proporciones incorrectas, aspecto de caricatura.

### 03 · Tema 1.1 · figura 1.1.2 · 16:9

- **Identificador:** `anatomia-dental/m01/02`
- **Qué muestra:** Vestíbulo inferior expuesto al retraer suavemente el labio con un espejo, mostrando encía, fondo de saco y mucosa labial.
- **Pie en la lectura:** Al retraer el labio se expone el vestíbulo: la encía insertada, el fondo de saco y la mucosa labial, más roja y móvil.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía clínica realista, encuadre cerrado del sector anterior inferior de la boca de un adulto sano, el labio inferior retraído suavemente con un espejo bucal sostenido por una mano con guante de nitrilo, se ve la encía rosa pálido y firme alrededor de los incisivos inferiores, el fondo de saco vestibular y la mucosa del labio de color rojo más intenso con pequeños vasos visibles, saliva natural, iluminación de lámpara dental uniforme, fondo desenfocado. Evitar: texto, etiquetas, logotipos, marcas de agua, sangre, lesiones, rostro visible, manos sin guantes, dientes deformes.

### 04 · Tema 1.1 · figura 1.1.3 · 1:1

- **Identificador:** `anatomia-dental/m01/03`
- **Qué muestra:** Modelo anatómico de cráneo con mandíbula, visto desde atrás y abajo, que muestra la región retromolar entre la rama mandibular y la tuberosidad maxilar.
- **Pie en la lectura:** Detrás de los últimos molares queda el espacio retromolar, una comunicación permanente entre vestíbulo y cavidad propia.
- **Tamaño:** 1400 × 1400 px

**Prompt:**

> Fotografía de estudio de un modelo anatómico de cráneo humano adulto de resina color hueso con dentición permanente completa y mandíbula articulada en oclusión, vista oblicua posterolateral desde abajo que muestra el espacio entre la cara distal del último molar, la tuberosidad del maxilar y el borde anterior de la rama mandibular, fondo gris neutro, iluminación suave de estudio con sombras definidas, enfoque nítido. Evitar: texto, etiquetas, números, flechas, logotipos, marcas de agua, número incorrecto de dientes, huesos deformes, apariencia de cráneo real con restos de tejido.

### 05 · Tema 1.2 · figura 1.2.1 · 4:3

- **Identificador:** `anatomia-dental/m01/04`
- **Qué muestra:** Acercamiento de los labios de un adulto en reposo, cerrados, con el arco de Cupido y el filtrum bien definidos.
- **Pie en la lectura:** Arco de Cupido, filtrum, tubérculo y comisuras: referencias que se usan para valorar la sonrisa y planear restauraciones anteriores.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía macro realista de los labios cerrados y relajados de un adulto, encuadre que incluye solo la base de la nariz, el labio superior con el filtrum y el arco de Cupido bien marcados, el tubérculo central, el labio inferior y las comisuras, piel de textura natural con poros finos, bermellón rosado e hidratado, iluminación lateral suave de estudio, fondo neutro claro, colores naturales. Evitar: texto, etiquetas, logotipos, marcas de agua, maquillaje intenso, ojos o rostro completo, lesiones, sangre, retoque artificial de la piel.

### 06 · Tema 1.2 · figura 1.2.2 · 4:3

- **Identificador:** `anatomia-dental/m01/05`
- **Qué muestra:** Mucosa yugal derecha retraída con espejo, con la papila parotídea frente al segundo molar superior y una línea alba tenue.
- **Pie en la lectura:** Mucosa de la mejilla: papila parotídea frente al segundo molar superior y línea alba a la altura del plano oclusal.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica intraoral realista de la mucosa yugal derecha de un adulto sano, la mejilla retraída hacia fuera con un espejo bucal sostenido por una mano con guante de nitrilo, se ve una pequeña elevación redondeada de mucosa rosada frente a la corona del segundo molar superior y una línea blanquecina tenue horizontal a la altura del plano de oclusión, mucosa húmeda brillante, algunos puntos amarillentos diminutos dispersos, iluminación de lámpara dental, fondo de los molares visible. Evitar: texto, flechas, etiquetas, logotipos, marcas de agua, sangre, úlceras, rostro visible, manos sin guantes.

### 07 · Tema 1.2 · figura 1.2.3 · 16:9

- **Identificador:** `anatomia-dental/m01/06`
- **Qué muestra:** Labio superior evertido con los dedos enguantados que muestra el frenillo labial superior insertado en la encía entre los incisivos centrales.
- **Pie en la lectura:** Frenillo labial superior: al traccionar el labio se observa dónde se inserta y si tensa la papila.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía clínica realista del sector anterior superior de la boca de un adulto joven, el labio superior evertido hacia arriba con dos dedos que llevan guantes de nitrilo, se observa el frenillo labial superior como un pliegue delgado de mucosa que se inserta en la encía insertada entre los incisivos centrales, encía rosa pálido sana, mucosa labial roja y húmeda con pequeñas glándulas visibles, iluminación de lámpara dental uniforme. Evitar: texto, flechas, etiquetas, logotipos, marcas de agua, sangre, rostro visible, manos sin guantes, dientes deformes o apiñados en exceso.

### 08 · Tema 1.3 · figura 1.3.1 · 4:3

- **Identificador:** `anatomia-dental/m01/07`
- **Qué muestra:** Vista oclusal del paladar duro de un adulto con espejo, que muestra papila incisiva, rugas palatinas y rafe medio.
- **Pie en la lectura:** Paladar duro visto con espejo: papila incisiva, rugas palatinas y rafe medio, referencias para anestesia y prótesis.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica intraoral realista tomada con espejo oclusal, vista del paladar duro de un adulto sano con arcada superior permanente completa, se aprecian la papila incisiva por detrás de los incisivos centrales, las rugas palatinas como pliegues transversales irregulares en el tercio anterior, una línea media blanquecina tenue y la mucosa rosa pálido firme, transición al paladar blando más rojizo al fondo, iluminación de flash clínico uniforme. Evitar: texto, flechas, etiquetas, logotipos, marcas de agua, reflejos de dedos, sangre, lesiones, número incorrecto de dientes.

### 09 · Tema 1.3 · figura 1.3.2 · 3:4

- **Identificador:** `anatomia-dental/m01/08`
- **Qué muestra:** Boca abierta con la lengua deprimida por un abatelenguas que deja ver la úvula, los arcos palatinos y amígdalas pequeñas.
- **Pie en la lectura:** Istmo de las fauces: úvula, arcos palatogloso y palatofaríngeo y amígdalas palatinas.
- **Tamaño:** 1200 × 1600 px

**Prompt:**

> Fotografía clínica realista de la boca muy abierta de un adulto joven sano, encuadre cerrado sin mostrar ojos, la lengua deprimida suavemente por un abatelenguas de madera sostenido por una mano con guante de nitrilo, se ven el paladar blando, la úvula centrada, los arcos palatogloso y palatofaríngeo a cada lado con amígdalas palatinas pequeñas y rosadas, y la pared posterior de la orofaringe, iluminación frontal con lámpara clínica, colores naturales. Evitar: texto, etiquetas, flechas, logotipos, marcas de agua, sangre, pus, amígdalas inflamadas, rostro completo, manos sin guantes.

### 10 · Tema 1.3 · figura 1.3.3 · 1:1

- **Identificador:** `anatomia-dental/m01/09`
- **Qué muestra:** Modelo de yeso de un maxilar sin dientes, visto desde abajo, con el paladar, la tuberosidad y la zona del límite posterior.
- **Pie en la lectura:** En un paciente sin dientes, el paladar duro es la principal superficie de soporte de la prótesis superior.
- **Tamaño:** 1400 × 1400 px

**Prompt:**

> Fotografía de estudio de un modelo de yeso dental color blanco de un maxilar superior completamente desdentado, vista desde oclusal, rebordes alveolares redondeados, paladar duro con rugas suaves y papila incisiva visibles, tuberosidades a ambos lados y la zona de transición al paladar blando en el borde posterior del modelo, sobre una superficie gris neutra, iluminación de estudio suave con sombras definidas, enfoque nítido. Evitar: texto, marcas de lápiz, etiquetas, logotipos, marcas de agua, dientes, fracturas del yeso, burbujas grandes.

### 11 · Tema 1.4 · figura 1.4.1 · 4:3

- **Identificador:** `anatomia-dental/m01/10`
- **Qué muestra:** Dorso de la lengua de un adulto sano extendida, con papilas filiformes, fungiformes como puntos rojos y la fila de papilas circunvaladas al fondo.
- **Pie en la lectura:** Dorso lingual: textura de papilas filiformes, puntos rojos de las fungiformes y, al fondo, las circunvaladas en V.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica macro realista del dorso de la lengua de un adulto sano, protruida hacia delante sobre el labio inferior, superficie rosada con textura aterciopelada de papilas filiformes finas, pequeñas papilas fungiformes como puntos rojizos dispersos más abundantes en la punta, y al fondo una fila en forma de V de papilas circunvaladas redondeadas, surco medio leve, saliva natural, iluminación clínica uniforme, fondo oscuro desenfocado. Evitar: texto, etiquetas, flechas, logotipos, marcas de agua, saburra gruesa, lesiones, sangre, rostro visible, perforaciones o piercings.

### 12 · Tema 1.4 · figura 1.4.2 · 4:3

- **Identificador:** `anatomia-dental/m01/11`
- **Qué muestra:** Cara ventral de la lengua elevada que muestra el frenillo lingual, las carúnculas sublinguales y las venas linguales.
- **Pie en la lectura:** Piso de la boca con la lengua elevada: frenillo lingual, carúnculas sublinguales, pliegues sublinguales y venas linguales profundas.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica intraoral realista de un adulto sano con la punta de la lengua elevada hacia el paladar, se observa la cara ventral lisa con venas linguales profundas azuladas a cada lado, los pliegues fimbriados, el frenillo lingual en la línea media, dos pequeñas elevaciones a los lados de su base y los pliegues sublinguales hacia atrás, mucosa del piso húmeda y brillante, incisivos inferiores en el borde inferior del encuadre, iluminación de lámpara dental. Evitar: texto, flechas, etiquetas, logotipos, marcas de agua, sangre, lesiones, rostro visible, piercings.

### 13 · Tema 1.4 · figura 1.4.3 · 4:3

- **Identificador:** `anatomia-dental/m01/12`
- **Qué muestra:** Vista lingual de la arcada inferior con dos abultamientos óseos lisos y redondeados a la altura de los premolares, cubiertos por mucosa sana.
- **Pie en la lectura:** Toro mandibular bilateral: exostosis benigna en la cara lingual de la mandíbula, a la altura de los premolares.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica intraoral realista tomada con espejo, vista lingual de la arcada inferior de un adulto, con la lengua elevada fuera del encuadre, se observan dos abultamientos óseos lisos, redondeados y simétricos en la cara lingual de la mandíbula a la altura de los premolares, cubiertos por mucosa rosa pálido delgada y brillante, dientes inferiores sanos alineados, piso de la boca húmedo, iluminación de flash clínico uniforme. Evitar: texto, flechas, etiquetas, logotipos, marcas de agua, sangre, úlceras, rostro visible, dientes deformes o de más.

### 14 · Tema 1.5 · figura 1.5.1 · 16:9

- **Identificador:** `anatomia-dental/m01/13`
- **Qué muestra:** Ilustración en corte sagital de la cabeza durante la fase faríngea de la deglución, con el paladar blando elevado y la epiglotis inclinada.
- **Pie en la lectura:** Durante la fase faríngea, el velo cierra la nasofaringe y la epiglotis protege la laringe mientras el bolo pasa al esófago.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Ilustración anatómica realista de estilo atlas médico, corte sagital medio de la cabeza y el cuello de un adulto durante la deglución, el paladar blando elevado en contacto con la pared posterior de la faringe, la lengua presionando contra el paladar, un bolo alimenticio color beige en la orofaringe dirigiéndose al esófago, la laringe elevada y la epiglotis inclinada hacia atrás, colores anatómicos suaves, fondo blanco limpio. Evitar: texto, etiquetas, números, flechas, rostro con rasgos identificables, sangre, proporciones incorrectas, aspecto de caricatura.

### 15 · Tema 1.5 · figura 1.5.2 · 4:3

- **Identificador:** `anatomia-dental/m01/14`
- **Qué muestra:** Odontóloga con equipo de protección completo explora la boca de un paciente usando dos espejos bucales bajo la lámpara.
- **Pie en la lectura:** Dos espejos, buena luz y un orden fijo: la base de una exploración que no deja zonas sin revisar.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica realista en un consultorio dental limpio y luminoso, una odontóloga con guantes de nitrilo, cubrebocas, careta transparente, gorro y bata desechable sostiene dos espejos bucales separando la mejilla y la lengua de un paciente adulto reclinado, encuadre lateral cercano en el que del paciente solo se ven la boca entreabierta y el mentón con babero, lámpara dental encendida, bandeja con gasas e instrumental ordenado, colores naturales. Evitar: texto, logotipos, marcas de agua, rostro identificable del paciente, sangre, manos sin guantes, instrumental oxidado.

### 16 · Tema 1.5 · figura 1.5.3 · 1:1

- **Identificador:** `anatomia-dental/m01/15`
- **Qué muestra:** Mano enguantada que sostiene con una gasa la punta de la lengua y la desplaza hacia un lado para exponer su borde lateral.
- **Pie en la lectura:** Con una gasa se puede desplazar la lengua para revisar sus bordes completos hasta la región de las papilas foliadas.
- **Tamaño:** 1400 × 1400 px

**Prompt:**

> Fotografía clínica realista, encuadre cerrado de la boca abierta de un adulto, una mano con guante de nitrilo sujeta la punta de la lengua con una gasa blanca doblada y la desplaza suavemente hacia la izquierda del paciente, exponiendo el borde lateral derecho completo con su mucosa rosada y pliegues verticales en la parte posterior, dientes inferiores visibles en el borde del encuadre, iluminación de lámpara dental uniforme. Evitar: texto, flechas, etiquetas, logotipos, marcas de agua, sangre, úlceras, rostro visible, manos sin guantes.

## Módulo 2 · Mucosa oral, encía y glándulas salivales

Carpeta: `imagenes-academia/01-anatomia-dental/modulo-02/` · 16 imágenes (4 de 16:9, 8 de 4:3, 3 de 1:1, 1 de 3:4).

### 01 · Portada del módulo · 16:9

- **Identificador:** `anatomia-dental/m02/portada`
- **Qué muestra:** Vista frontal cercana de dientes anteriores con encía rosa coral, firme y festoneada, y mucosa alveolar más roja por encima.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía clínica macro realista de gran formato del sector anterior de la boca de un adulto joven sano, labios retraídos con retractores transparentes, dientes anteriores superiores e inferiores bien alineados, encía rosa coral firme con margen delgado y festoneado, papilas que llenan los espacios interdentales, textura ligeramente punteada, y por encima una franja de mucosa alveolar más roja y brillante con vasos finos visibles, saliva natural, iluminación de flash clínico uniforme, colores naturales y nitidez alta. Evitar: texto, etiquetas, flechas, logotipos, marcas de agua, rostro completo, sangre, inflamación, dientes deformes, aspecto artificial.

### 02 · Tema 2.1 · figura 2.1.1 · 4:3

- **Identificador:** `anatomia-dental/m02/01`
- **Qué muestra:** Microfotografía de un corte histológico de mucosa oral teñido con hematoxilina y eosina, con epitelio estratificado y tejido conectivo subyacente.
- **Pie en la lectura:** Corte histológico de mucosa oral: el epitelio se interdigita con la lámina propia mediante crestas epiteliales y papilas de tejido conectivo.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Microfotografía óptica realista de un corte histológico de mucosa oral humana teñido con hematoxilina y eosina, aumento medio, se observa un epitelio plano estratificado de color morado rosado con crestas epiteliales que se proyectan hacia abajo alternando con papilas de tejido conectivo rosado claro, núcleos basales más oscuros, capilares pequeños con eritrocitos en las papilas y fibras de colágeno en la parte inferior, fondo de portaobjetos blanco, enfoque nítido. Evitar: texto, escalas, flechas, etiquetas, logotipos, marcas de agua, colores fluorescentes, artefactos exagerados.

### 03 · Tema 2.1 · figura 2.1.2 · 16:9

- **Identificador:** `anatomia-dental/m02/02`
- **Qué muestra:** Sector posterior vestibular con la mejilla retraída que muestra la encía pálida y firme y la mucosa alveolar roja separadas por la unión mucogingival.
- **Pie en la lectura:** La unión mucogingival separa la encía, mucosa masticadora, de la mucosa alveolar, mucosa de revestimiento.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía clínica intraoral realista del sector posterior vestibular inferior derecho de un adulto sano, la mejilla retraída con un separador, se aprecian premolares y molares con encía rosa pálido firme y ligeramente punteada que termina en una línea festoneada nítida, por debajo la mucosa alveolar de color rojo más intenso, lisa, brillante y con vasos finos visibles que continúa hacia el fondo de saco, iluminación de flash clínico uniforme, colores naturales. Evitar: texto, flechas, etiquetas, logotipos, marcas de agua, sangre, inflamación, recesiones marcadas, rostro visible.

### 04 · Tema 2.1 · figura 2.1.3 · 1:1

- **Identificador:** `anatomia-dental/m02/03`
- **Qué muestra:** Comparación microscópica de dos epitelios lado a lado, uno con capa córnea rosada y otro sin ella.
- **Pie en la lectura:** Epitelio queratinizado del paladar frente a epitelio no queratinizado de la mejilla, observados al microscopio.
- **Tamaño:** 1400 × 1400 px

**Prompt:**

> Composición de dos microfotografías ópticas realistas lado a lado, cortes histológicos de mucosa oral humana teñidos con hematoxilina y eosina al mismo aumento: a la izquierda un epitelio plano estratificado con una capa superficial rosada compacta de células aplanadas sin núcleo y crestas epiteliales largas, a la derecha un epitelio más grueso con células superficiales aplanadas que conservan núcleos y una interfaz con el tejido conectivo más suave, fondo blanco de portaobjetos, enfoque nítido. Evitar: texto, escalas, flechas, etiquetas, logotipos, marcas de agua, colores artificiales.

### 05 · Tema 2.2 · figura 2.2.1 · 4:3

- **Identificador:** `anatomia-dental/m02/04`
- **Qué muestra:** Paladar duro y blando de un adulto visto con espejo, con mucosa anterior pálida y firme y mucosa posterior con pequeños orificios glandulares.
- **Pie en la lectura:** El paladar duro no es homogéneo: su submucosa lateral es adiposa por delante y glandular por detrás.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica intraoral realista con espejo oclusal del paladar de un adulto sano con dentición superior completa, mucosa del paladar duro anterior rosa pálido firme con rugas, mucosa de la mitad posterior ligeramente más rosada con diminutos puntos que corresponden a orificios de glándulas, transición nítida al paladar blando de color rojo más intenso, rafe medio blanquecino, iluminación de flash clínico uniforme, colores naturales y nitidez alta. Evitar: texto, flechas, etiquetas, logotipos, marcas de agua, sangre, lesiones, toro palatino grande, dientes deformes.

### 06 · Tema 2.2 · figura 2.2.2 · 4:3

- **Identificador:** `anatomia-dental/m02/05`
- **Qué muestra:** Dorso de la lengua con varias zonas rojas lisas sin papilas, rodeadas por bordes blanquecinos ondulados, sobre una lengua con surcos.
- **Pie en la lectura:** Lengua geográfica asociada a lengua fisurada: zonas depapiladas con bordes blanquecinos que cambian de lugar.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica macro realista del dorso de la lengua de un adulto, protruida sobre el labio inferior, con varias áreas rojas lisas de contorno irregular sin papilas filiformes, cada una rodeada por un borde blanco amarillento ondulado y ligeramente elevado, el resto del dorso con textura aterciopelada normal y algunos surcos poco profundos, saliva natural, iluminación clínica uniforme, fondo oscuro desenfocado. Evitar: texto, flechas, etiquetas, logotipos, marcas de agua, sangre, úlceras profundas, rostro visible, piercings, colores saturados artificiales.

### 07 · Tema 2.2 · figura 2.2.3 · 16:9

- **Identificador:** `anatomia-dental/m02/06`
- **Qué muestra:** Encía vestibular anterior con pigmentación café difusa y simétrica en una persona de piel morena.
- **Pie en la lectura:** Pigmentación melánica fisiológica: difusa, simétrica y estable, más frecuente en personas de piel morena.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía clínica intraoral realista del sector anterior de un adulto mexicano de piel morena, labios retraídos con separadores, dientes anteriores sanos y alineados, encía insertada vestibular superior e inferior con bandas de pigmentación café difusa y simétrica a ambos lados, margen gingival rosa delgado y papilas sanas, sin inflamación, iluminación de flash clínico uniforme, colores naturales. Evitar: texto, flechas, etiquetas, logotipos, marcas de agua, sangre, manchas negras aisladas, rostro completo, dientes deformes.

### 08 · Tema 2.3 · figura 2.3.1 · 4:3

- **Identificador:** `anatomia-dental/m02/07`
- **Qué muestra:** Sonda periodontal milimetrada colocada verticalmente sobre la encía vestibular de un incisivo inferior para medir la encía queratinizada.
- **Pie en la lectura:** La sonda colocada sobre la superficie mide el ancho de encía queratinizada; dentro del surco mide la profundidad de sondaje.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica macro realista del sector anterior inferior de un adulto sano, una sonda periodontal metálica milimetrada con marcas oscuras sostenida por una mano con guante de nitrilo, apoyada verticalmente sobre la superficie de la encía vestibular de un incisivo central inferior desde el margen gingival hasta la línea de unión con la mucosa alveolar, encía rosa coral firme, mucosa alveolar más roja, labio retraído, iluminación de flash clínico. Evitar: texto, números legibles, flechas, etiquetas, logotipos, marcas de agua, sangre, rostro visible, manos sin guantes.

### 09 · Tema 2.3 · figura 2.3.2 · 4:3

- **Identificador:** `anatomia-dental/m02/08`
- **Qué muestra:** Acercamiento de encía insertada sana con textura de cáscara de naranja y margen delgado alrededor de incisivos inferiores.
- **Pie en la lectura:** Encía sana: color rosa coral, margen en filo de cuchillo, papilas completas y punteado en la encía insertada.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica macro realista con luz rasante de la encía vestibular de los incisivos inferiores de un adulto joven sano, se observa el margen gingival delgado en filo de cuchillo siguiendo el contorno festoneado de los dientes, papilas puntiagudas que llenan los espacios interdentales, encía insertada rosa coral con una textura fina de pequeños hoyuelos como cáscara de naranja, y abajo la transición a la mucosa alveolar lisa y roja, labio retraído fuera del encuadre, nitidez alta. Evitar: texto, flechas, etiquetas, logotipos, marcas de agua, sangre, inflamación, sarro, rostro visible.

### 10 · Tema 2.3 · figura 2.3.3 · 16:9

- **Identificador:** `anatomia-dental/m02/09`
- **Qué muestra:** Dos sectores anteriores lado a lado: uno con encía delgada y festoneado alto, otro con encía gruesa y festoneado plano.
- **Pie en la lectura:** Fenotipo gingival delgado frente a grueso: cambia el riesgo de recesión y la respuesta a la cirugía y a la ortodoncia.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Composición de dos fotografías clínicas intraorales realistas lado a lado del sector anterior superior de dos adultos sanos distintos con labios retraídos: a la izquierda dientes largos y triangulares con encía delgada, translúcida, festoneado pronunciado y papilas altas; a la derecha dientes más cuadrados con encía gruesa, densa, festoneado plano y papilas cortas y anchas, ambas sin inflamación, iluminación de flash clínico igual en las dos, colores naturales. Evitar: texto, flechas, etiquetas, logotipos, marcas de agua, sangre, rostro completo, restauraciones visibles, dientes deformes.

### 11 · Tema 2.4 · figura 2.4.1 · 3:4

- **Identificador:** `anatomia-dental/m02/10`
- **Qué muestra:** Ilustración en corte de la región cervical de un diente con la encía, el surco y el hueso alveolar.
- **Pie en la lectura:** Corte de la unión dentogingival: el epitelio de unión sella el diente y las fibras de colágeno anclan la encía.
- **Tamaño:** 1200 × 1600 px

**Prompt:**

> Ilustración anatómica realista de estilo atlas de histología, corte longitudinal vestibulolingual del tercio cervical de un incisivo humano con su encía, se ven el esmalte blanco, la dentina color marfil, el cemento delgado, la encía rosada con su superficie externa, un surco gingival poco profundo, una banda delgada de epitelio adherida al esmalte cervical, haces de fibras de colágeno en abanico en el tejido conectivo y la cresta del hueso alveolar por debajo, colores suaves naturales, fondo blanco. Evitar: texto, etiquetas, números, flechas, sangre, proporciones incorrectas, aspecto de caricatura.

### 12 · Tema 2.4 · figura 2.4.2 · 4:3

- **Identificador:** `anatomia-dental/m02/11`
- **Qué muestra:** Corona cerámica anterior con margen ligeramente subgingival y encía sana sin inflamación alrededor.
- **Pie en la lectura:** Un margen que respeta la inserción de tejidos supracrestales permite una encía estable y sin inflamación.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica intraoral realista del sector anterior superior de un adulto con una corona cerámica en el incisivo central derecho de color y forma naturales idénticos al diente vecino, encía marginal rosa coral delgada y sin enrojecimiento alrededor de la corona, papilas completas, labios retraídos con separadores, iluminación de flash clínico uniforme, colores naturales y nitidez alta. Evitar: texto, flechas, etiquetas, logotipos, marcas de agua, sangre, inflamación, margen metálico visible, rostro completo, dientes deformes.

### 13 · Tema 2.4 · figura 2.4.3 · 1:1

- **Identificador:** `anatomia-dental/m02/12`
- **Qué muestra:** Tira de papel absorbente colocada en la entrada del surco gingival de un diente anterior para recoger líquido crevicular.
- **Pie en la lectura:** El líquido crevicular gingival puede recogerse con tiras de papel para estudios de investigación sobre inflamación.
- **Tamaño:** 1400 × 1400 px

**Prompt:**

> Fotografía clínica macro realista del margen gingival vestibular de un incisivo superior de un adulto, una tira delgada de papel absorbente blanco sostenida con pinzas de punta fina por una mano con guante de nitrilo, colocada suavemente en la entrada del surco gingival, encía rosa sana, campo seco aislado con rollos de algodón, iluminación de flash clínico, fondo desenfocado. Evitar: texto, números, flechas, etiquetas, logotipos, marcas de agua, sangre, rostro visible, manos sin guantes, inflamación.

### 14 · Tema 2.5 · figura 2.5.1 · 4:3

- **Identificador:** `anatomia-dental/m02/13`
- **Qué muestra:** Ilustración anatómica lateral de la cara sin piel que muestra la glándula parótida sobre el masetero y su conducto hacia la mejilla.
- **Pie en la lectura:** Glándula parótida y su conducto, que cruza el masetero y atraviesa el buccinador.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Ilustración anatómica realista de estilo atlas médico, vista lateral derecha de la cabeza de un adulto con la piel retirada en la región de la mejilla, se observan la glándula parótida lobulada de color amarillo rosado delante de la oreja, su conducto blanquecino que cruza horizontalmente el músculo masetero y se hunde en la mejilla atravesando el buccinador, el músculo masetero rojizo, la mandíbula y el arco cigomático, fondo blanco limpio, iluminación uniforme. Evitar: texto, etiquetas, números, flechas, ojos detallados o rostro identificable, sangre, proporciones incorrectas.

### 15 · Tema 2.5 · figura 2.5.2 · 1:1

- **Identificador:** `anatomia-dental/m02/14`
- **Qué muestra:** Piso de la boca con la lengua elevada y una gota de saliva clara que sale por la carúncula sublingual tras secar la zona.
- **Pie en la lectura:** Tras secar el piso de la boca y presionar suavemente la glándula submandibular desde fuera, la saliva fluye clara por la carúncula.
- **Tamaño:** 1400 × 1400 px

**Prompt:**

> Fotografía clínica macro realista del piso de la boca de un adulto sano con la punta de la lengua elevada, mucosa del piso seca con una gasa, se observa una pequeña elevación junto a la base del frenillo lingual de la que emerge una gota de saliva clara y transparente, venas linguales visibles en la cara ventral, pliegue sublingual a un lado, incisivos inferiores en el borde del encuadre, iluminación de lámpara dental. Evitar: texto, flechas, etiquetas, logotipos, marcas de agua, sangre, pus, saliva turbia, rostro visible, piercings.

### 16 · Tema 2.5 · figura 2.5.3 · 4:3

- **Identificador:** `anatomia-dental/m02/15`
- **Qué muestra:** Tubo graduado con saliva recolectada junto a un cronómetro sobre una bandeja clínica.
- **Pie en la lectura:** La sialometría mide el flujo salival con un procedimiento sencillo: recolectar durante un tiempo fijo y dividir el volumen entre los minutos.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía realista de estudio sobre una bandeja clínica blanca en un consultorio dental, un tubo de ensayo graduado transparente con una pequeña cantidad de saliva espumosa en el fondo dentro de una gradilla, un embudo pequeño de plástico al lado, un cronómetro digital sin números legibles y una caja de guantes de nitrilo al fondo desenfocada, iluminación clínica suave y uniforme, colores neutros. Evitar: texto, números legibles, etiquetas, logotipos, marcas de agua, personas, rostros, sangre, recipientes sucios.

## Módulo 3 · Huesos maxilares, articulación temporomandibular y músculos de la masticación

Carpeta: `imagenes-academia/01-anatomia-dental/modulo-03/` · 16 imágenes (5 de 16:9, 7 de 4:3, 3 de 1:1, 1 de 3:4).

### 01 · Portada del módulo · 16:9

- **Identificador:** `anatomia-dental/m03/portada`
- **Qué muestra:** Modelo anatómico de cráneo visto de lado con la mandíbula articulada y los músculos masetero y temporal representados en resina.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía de estudio de gran formato de un modelo anatómico didáctico de cráneo humano adulto en vista lateral derecha, de resina color hueso con dentición permanente completa en oclusión, con los músculos temporal y masetero representados en resina rojiza semitransparente sobre el hueso, la articulación temporomandibular visible delante del conducto auditivo, fondo gris azulado oscuro, iluminación lateral suave de estudio que resalta volúmenes, enfoque nítido. Evitar: texto, etiquetas, números, flechas, logotipos, marcas de agua, apariencia de cráneo real con restos de tejido, sangre, dientes deformes o de más, aspecto de caricatura.

### 02 · Tema 3.1 · figura 3.1.1 · 4:3

- **Identificador:** `anatomia-dental/m03/01`
- **Qué muestra:** Cráneo de resina en vista anterolateral que muestra el maxilar, el agujero infraorbitario, la eminencia canina y la tuberosidad.
- **Pie en la lectura:** Cara anterior del maxilar: agujero infraorbitario, fosa canina, eminencia canina y proceso alveolar.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía de estudio de un modelo anatómico de cráneo humano adulto de resina color hueso, vista anterolateral izquierda centrada en el tercio medio de la cara, se aprecian el reborde inferior de la órbita, un agujero pequeño por debajo de él, la depresión de la fosa canina, el relieve vertical de la raíz del canino, el proceso alveolar con los dientes superiores y el hueso cigomático, fondo gris neutro, iluminación lateral que marca relieves. Evitar: texto, etiquetas, números, flechas, logotipos, marcas de agua, restos de tejido, dientes faltantes o de más, apariencia de cráneo real dañado.

### 03 · Tema 3.1 · figura 3.1.2 · 16:9

- **Identificador:** `anatomia-dental/m03/02`
- **Qué muestra:** Radiografía panorámica de un adulto en la que se distinguen los senos maxilares por encima de los molares superiores.
- **Pie en la lectura:** En una radiografía panorámica, el piso del seno maxilar se dibuja como una línea curva radiopaca sobre los ápices de los molares superiores.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Radiografía panorámica dental digital realista de un adulto con dentición permanente completa sin restauraciones extensas, tonos de gris naturales, se distinguen las cavidades radiolúcidas de ambos senos maxilares por encima de las raíces de los premolares y molares superiores con su piso como una línea curva blanca, la cavidad nasal y el tabique en el centro, la mandíbula completa con sus conductos y los cóndilos a los lados, contraste equilibrado. Evitar: texto, letras, números, marcadores de lado, flechas, logotipos, marcas de agua, implantes, dientes de más o deformes.

### 04 · Tema 3.1 · figura 3.1.3 · 1:1

- **Identificador:** `anatomia-dental/m03/03`
- **Qué muestra:** Vista inferior de un cráneo de resina que muestra el paladar óseo con sus suturas y los agujeros palatinos.
- **Pie en la lectura:** Paladar óseo: apófisis palatinas del maxilar, láminas horizontales del palatino, fosa incisiva y agujeros palatinos.
- **Tamaño:** 1400 × 1400 px

**Prompt:**

> Fotografía de estudio de la base de un modelo anatómico de cráneo humano adulto de resina color hueso, vista inferior centrada en el paladar óseo, se aprecian la arcada superior completa, la fosa incisiva detrás de los incisivos, la sutura en la línea media y la sutura transversa posterior, dos pequeños agujeros a cada lado cerca de los últimos molares y las apófisis pterigoides por detrás, fondo gris neutro, iluminación uniforme de estudio, enfoque nítido. Evitar: texto, etiquetas, números, flechas, logotipos, marcas de agua, restos de tejido, dientes faltantes o de más.

### 05 · Tema 3.2 · figura 3.2.1 · 4:3

- **Identificador:** `anatomia-dental/m03/04`
- **Qué muestra:** Mandíbula de resina vista desde su cara interna, con las espinas mentonianas, la línea milohioidea y el agujero mandibular.
- **Pie en la lectura:** Cara interna de la mandíbula: espinas mentonianas, fosas sublingual y submandibular, línea milohioidea y agujero mandibular con su língula.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía de estudio de una mandíbula humana adulta de resina color hueso con dentición permanente completa, vista medial oblicua desde atrás que muestra la cara interna del cuerpo y de la rama derecha, se aprecian las pequeñas espinas en la línea media, una cresta oblicua que asciende hacia los molares, una depresión por encima y otra por debajo de ella, y en el centro de la rama un agujero con una laminilla ósea delante, fondo gris neutro, iluminación lateral suave. Evitar: texto, etiquetas, números, flechas, logotipos, marcas de agua, restos de tejido, dientes faltantes o de más, hueso fracturado.

### 06 · Tema 3.2 · figura 3.2.2 · 16:9

- **Identificador:** `anatomia-dental/m03/05`
- **Qué muestra:** Comparación de dos mandíbulas de resina vistas de lado, una con dientes y otra sin dientes con el reborde muy reabsorbido.
- **Pie en la lectura:** Al perder los dientes, el reborde alveolar se reabsorbe y el agujero mentoniano queda más cerca de la cresta.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía de estudio de dos mandíbulas humanas adultas de resina color hueso colocadas lado a lado en vista lateral sobre fondo gris neutro: a la izquierda una mandíbula con dentición permanente completa, cuerpo alto y ángulo bien definido; a la derecha una mandíbula sin dientes con el cuerpo muy bajo y delgado, el reborde alveolar reabsorbido y un pequeño agujero cerca del borde superior, iluminación lateral suave, enfoque nítido. Evitar: texto, etiquetas, números, flechas, logotipos, marcas de agua, restos de tejido, prótesis, huesos fracturados.

### 07 · Tema 3.2 · figura 3.2.3 · 4:3

- **Identificador:** `anatomia-dental/m03/06`
- **Qué muestra:** Fragmento de radiografía panorámica de la zona del tercer molar inferior con el conducto mandibular cerca de sus raíces.
- **Pie en la lectura:** El conducto mandibular aparece como una banda oscura limitada por líneas blancas; su relación con el tercer molar se valora antes de la cirugía.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Recorte realista de una radiografía panorámica digital en tonos de gris centrado en la región del tercer molar inferior derecho de un adulto joven, el tercer molar parcialmente erupcionado con raíces completas, y por debajo una banda radiolúcida horizontal limitada por dos líneas radiopacas finas que pasa muy cerca de los ápices, el segundo molar y el borde anterior de la rama visibles, contraste natural. Evitar: texto, letras, números, flechas, marcadores, logotipos, marcas de agua, implantes, restauraciones metálicas grandes, dientes deformes.

### 08 · Tema 3.3 · figura 3.3.1 · 4:3

- **Identificador:** `anatomia-dental/m03/07`
- **Qué muestra:** Base de un cráneo de resina vista desde abajo y de lado, centrada en la fosa mandibular y la eminencia articular delante del conducto auditivo.
- **Pie en la lectura:** Componente temporal de la articulación: fosa mandibular, eminencia articular y conducto auditivo externo por detrás.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía de estudio de un modelo anatómico de cráneo humano adulto de resina color hueso sin mandíbula, vista inferolateral derecha centrada en la región delante del conducto auditivo externo, se aprecian una depresión ovalada profunda y por delante de ella una prominencia transversal redondeada, el arco cigomático hacia delante y la apófisis estiloides por detrás, fondo gris neutro, iluminación lateral suave que resalta los relieves, enfoque nítido. Evitar: texto, etiquetas, números, flechas, logotipos, marcas de agua, restos de tejido, dientes, hueso dañado.

### 09 · Tema 3.3 · figura 3.3.2 · 3:4

- **Identificador:** `anatomia-dental/m03/08`
- **Qué muestra:** Ilustración anatómica en corte sagital de la articulación temporomandibular con el disco entre el cóndilo y la eminencia.
- **Pie en la lectura:** La ATM en corte: disco bicóncavo, dos espacios articulares y tejidos retrodiscales vascularizados.
- **Tamaño:** 1200 × 1600 px

**Prompt:**

> Ilustración anatómica realista de estilo atlas médico, corte sagital de la articulación temporomandibular de un adulto con la boca cerrada, el cóndilo mandibular redondeado alojado en la fosa del hueso temporal, un disco fibroso gris azulado bicóncavo sobre el cóndilo, más grueso en su parte posterior, tejido laxo rojizo con pequeños vasos por detrás del disco, fibras musculares rojas que llegan por delante, cápsula fibrosa blanquecina envolviendo la articulación, colores anatómicos suaves, fondo blanco limpio. Evitar: texto, etiquetas, números, flechas, sangre derramada, rostro, proporciones incorrectas, aspecto de caricatura.

### 10 · Tema 3.3 · figura 3.3.3 · 1:1

- **Identificador:** `anatomia-dental/m03/09`
- **Qué muestra:** Dedos enguantados de un profesional palpan la región delante de la oreja de una persona mientras abre la boca, vista de perfil sin mostrar el rostro completo.
- **Pie en la lectura:** El polo lateral del cóndilo se palpa justo por delante del trago mientras el paciente abre y cierra.
- **Tamaño:** 1400 × 1400 px

**Prompt:**

> Fotografía clínica realista en consultorio dental, primer plano lateral de la región preauricular de un adulto sentado, encuadre desde la oreja hasta la comisura labial sin mostrar ojos, dos dedos con guantes de nitrilo de un profesional apoyados suavemente justo por delante del trago, la boca del paciente ligeramente abierta, cabello recogido, iluminación clínica suave, fondo de consultorio desenfocado, colores naturales. Evitar: texto, logotipos, marcas de agua, rostro completo o identificable, ojos, sangre, manos sin guantes, joyas llamativas.

### 11 · Tema 3.4 · figura 3.4.1 · 16:9

- **Identificador:** `anatomia-dental/m03/10`
- **Qué muestra:** Dos vistas laterales de un cráneo de resina, con la boca cerrada y abierta, que muestran cómo el cóndilo avanza hasta la eminencia articular.
- **Pie en la lectura:** Con la boca cerrada el cóndilo está en la fosa; en la apertura máxima se ha trasladado hasta la cima de la eminencia articular.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Composición de dos fotografías de estudio lado a lado de un modelo anatómico de cráneo humano adulto de resina color hueso con mandíbula articulada, vista lateral derecha centrada en la articulación temporomandibular: a la izquierda con la boca cerrada y el cóndilo dentro de la fosa delante del conducto auditivo, a la derecha con la boca muy abierta y el cóndilo desplazado hacia delante bajo la prominencia articular, mismo encuadre e iluminación lateral suave, fondo gris neutro. Evitar: texto, etiquetas, números, flechas, logotipos, marcas de agua, restos de tejido, dientes faltantes o de más.

### 12 · Tema 3.4 · figura 3.4.2 · 4:3

- **Identificador:** `anatomia-dental/m03/11`
- **Qué muestra:** Profesional con guantes mide con una regla milimetrada la apertura bucal de un paciente del que solo se ve la boca.
- **Pie en la lectura:** Medir la apertura con una regla y registrarla en cada visita permite detectar cambios con el tiempo.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica realista en consultorio dental, encuadre cerrado de la boca de un adulto abierta al máximo, una regla milimetrada metálica sostenida verticalmente por una mano con guante de nitrilo con un extremo apoyado en el borde de los incisivos inferiores y la regla alcanzando el borde de los incisivos superiores, labios relajados, sin mostrar ojos ni nariz completa, iluminación de lámpara dental, fondo desenfocado. Evitar: texto, números legibles, logotipos, marcas de agua, rostro completo, sangre, manos sin guantes, dientes deformes.

### 13 · Tema 3.4 · figura 3.4.3 · 16:9

- **Identificador:** `anatomia-dental/m03/12`
- **Qué muestra:** Imagen de resonancia magnética en corte sagital de una articulación temporomandibular con la boca cerrada.
- **Pie en la lectura:** La resonancia magnética muestra el disco y su posición; es el estudio de elección para valorar desplazamientos discales.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Imagen realista de resonancia magnética de la articulación temporomandibular en corte sagital ponderado en densidad protónica, escala de grises, se observa el cóndilo mandibular redondeado alojado en la fosa del temporal, la eminencia articular por delante y una estructura delgada de señal baja en forma de corbatín sobre el cóndilo, el conducto auditivo y el músculo pterigoideo lateral en tonos grises, contraste natural de estudio médico. Evitar: texto, letras, números, escalas, marcadores, flechas, logotipos, marcas de agua, datos de paciente, colores artificiales.

### 14 · Tema 3.5 · figura 3.5.1 · 4:3

- **Identificador:** `anatomia-dental/m03/13`
- **Qué muestra:** Ilustración anatómica lateral de la cabeza con la piel retirada que muestra los músculos masetero y temporal.
- **Pie en la lectura:** Masetero sobre la rama y temporal en abanico desde la fosa temporal hasta la apófisis coronoides.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Ilustración anatómica realista de estilo atlas médico, vista lateral izquierda de la cabeza de un adulto con la piel y la grasa retiradas, se muestran el músculo temporal en forma de abanico rojizo sobre la fosa temporal que desciende bajo el arco cigomático, y el músculo masetero grueso y rectangular desde el arco cigomático hasta el ángulo de la mandíbula, con sus fibras bien definidas, cráneo y dientes visibles en parte, colores anatómicos naturales, fondo blanco limpio. Evitar: texto, etiquetas, números, flechas, ojos detallados o rostro identificable, sangre, proporciones incorrectas.

### 15 · Tema 3.5 · figura 3.5.2 · 4:3

- **Identificador:** `anatomia-dental/m03/14`
- **Qué muestra:** Dedos enguantados palpan el músculo masetero sobre la mejilla de un adulto mientras aprieta los dientes, vista lateral de la mitad inferior de la cara.
- **Pie en la lectura:** La palpación del masetero y del temporal con presión moderada forma parte del examen muscular básico.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica realista en consultorio dental, encuadre lateral de la mitad inferior de la cara de un adulto sentado, desde el lóbulo de la oreja hasta el mentón sin mostrar ojos, tres dedos con guantes de nitrilo de un profesional apoyados sobre la mejilla a la altura de la rama de la mandíbula, el relieve del músculo masetero visible bajo la piel al apretar los dientes, iluminación clínica suave, fondo desenfocado, colores naturales. Evitar: texto, logotipos, marcas de agua, rostro completo o identificable, ojos, sangre, manos sin guantes, joyas.

### 16 · Tema 3.5 · figura 3.5.3 · 1:1

- **Identificador:** `anatomia-dental/m03/15`
- **Qué muestra:** Ilustración anatómica de la región submandibular vista desde abajo con los músculos digástrico y milohioideo.
- **Pie en la lectura:** Vista inferior del piso de la boca: vientres anteriores del digástrico sobre el milohioideo, que llega al hioides.
- **Tamaño:** 1400 × 1400 px

**Prompt:**

> Ilustración anatómica realista de estilo atlas médico, vista inferior de la región submentoniana y submandibular de un adulto con la piel retirada, se observan los dos vientres anteriores del músculo digástrico como bandas rojizas desde el borde de la mandíbula hacia el hueso hioides, por encima la lámina del músculo milohioideo con su rafe medio, el hueso hioides en forma de U y los vientres posteriores hacia atrás, colores anatómicos naturales, fondo blanco limpio. Evitar: texto, etiquetas, números, flechas, rostro, sangre, proporciones incorrectas, aspecto de caricatura.

## Módulo 4 · Irrigación e inervación de la región oral

Carpeta: `imagenes-academia/01-anatomia-dental/modulo-04/` · 16 imágenes (6 de 16:9, 7 de 4:3, 2 de 3:4, 1 de 1:1).

### 01 · Portada del módulo · 16:9

- **Identificador:** `anatomia-dental/m04/portada`
- **Qué muestra:** Ilustración anatómica de la cara en vista lateral con arterias, venas y nervios que se dirigen a los maxilares y los dientes.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Ilustración anatómica realista de gran formato estilo atlas médico moderno, vista lateral derecha de cabeza adulta en la que piel y músculos superficiales se vuelven translúcidos para mostrar el maxilar y la mandíbula con dentición permanente completa y anatomía correcta, arterias en rojo suave, venas en azul tenue y nervios en amarillo pálido que se ramifican hacia los dientes, la lengua y los labios, el perfil facial es neutro y sin rasgos identificables, fondo azul petróleo oscuro degradado, iluminación de estudio suave, alto detalle. Evitar: texto, etiquetas, flechas, números, logotipos, marcas de agua, sangre, rostro reconocible, aspecto de caricatura, dientes en número incorrecto.

### 02 · Tema 4.1 · figura 4.1.1 · 4:3

- **Identificador:** `anatomia-dental/m04/01`
- **Qué muestra:** Ilustración anatómica lateral de cabeza y cuello sin piel que muestra la arteria carótida externa y sus ramas hacia la cara.
- **Pie en la lectura:** La carótida externa asciende por el cuello y reparte ramas hacia la lengua, la cara, la región temporal y la profundidad de la cara, donde nace la arteria maxilar.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Ilustración anatómica realista de estilo atlas médico, vista lateral derecha de cabeza y cuello de un adulto sin piel, con el músculo masetero y la rama mandibular parcialmente retirados para mostrar la arteria carótida común que se bifurca a la altura del borde superior del cartílago tiroides, la carótida externa ascendiendo hacia la región parotídea y sus ramas principales hacia la lengua, la cara y la región temporal, arterias en rojo suave, venas en azul tenue, nervios en amarillo pálido, fondo blanco limpio, iluminación difusa y colores naturales, alto detalle. Evitar: texto, etiquetas, flechas, números, logotipos, marcas de agua, sangre derramada, rostro con rasgos identificables, proporciones anatómicas incorrectas.

### 03 · Tema 4.1 · figura 4.1.2 · 4:3

- **Identificador:** `anatomia-dental/m04/02`
- **Qué muestra:** Ilustración anatómica de la cara inferior de la lengua y el piso de boca con las venas y arterias linguales visibles bajo la mucosa.
- **Pie en la lectura:** En la cara ventral de la lengua los vasos linguales se ven por transparencia a cada lado del frenillo; el piso de boca es una zona muy vascularizada.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Ilustración anatómica realista de la cavidad oral de un adulto con la lengua elevada, vista frontal cercana de la cara ventral de la lengua y el piso de boca, mucosa rosada húmeda y brillante, frenillo lingual centrado, vasos sanguíneos finos visibles por transparencia a ambos lados del frenillo, carúnculas sublinguales pequeñas en la base, incisivos inferiores permanentes en el borde inferior del encuadre, iluminación clínica blanca y uniforme, estilo de atlas médico con colores naturales. Evitar: texto, etiquetas, flechas, logotipos, marcas de agua, sangre, lesiones, rostro, labios exagerados, dientes deformes o en número incorrecto.

### 04 · Tema 4.1 · figura 4.1.3 · 16:9

- **Identificador:** `anatomia-dental/m04/03`
- **Qué muestra:** Vista clínica del paladar duro de un adulto con dentición permanente completa, iluminado de forma uniforme.
- **Pie en la lectura:** La arteria palatina mayor recorre el paladar duro de atrás hacia adelante, a medio camino entre la línea media y los márgenes gingivales de los molares.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía clínica realista con espejo intraoral de la arcada superior de un adulto joven, vista oclusal del paladar duro completo, dentición permanente de incisivo central a segundo molar en ambos lados, mucosa palatina rosa pálido con rugas palatinas suaves en la zona anterior, papila incisiva visible detrás de los incisivos centrales, superficie húmeda con brillo natural, iluminación de lámpara dental uniforme, enfoque nítido de todo el paladar, colores naturales. Evitar: texto, etiquetas, flechas, logotipos, marcas de agua, sangre, lesiones, restauraciones metálicas llamativas, dientes faltantes o deformes, rostro.

### 05 · Tema 4.2 · figura 4.2.1 · 4:3

- **Identificador:** `anatomia-dental/m04/04`
- **Qué muestra:** Ilustración anatómica lateral de la fosa infratemporal con la rama mandibular retirada y una red de venas entre los músculos pterigoideos.
- **Pie en la lectura:** El plexo pterigoideo ocupa la fosa infratemporal, rodeando los músculos pterigoideos, y se conecta con la vena facial y con el seno cavernoso.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Ilustración anatómica realista estilo atlas médico de la fosa infratemporal derecha de un adulto, vista lateral con el arco cigomático y la rama de la mandíbula parcialmente retirados, mostrando los músculos pterigoideos lateral y medial en tonos rojizos musculares, una red densa de venas delgadas azul tenue envolviéndolos, la arteria maxilar en rojo suave cruzando la fosa y nervios en amarillo pálido, hueso en marfil, fondo blanco, iluminación difusa, alto detalle anatómico y colores naturales. Evitar: texto, etiquetas, flechas, números, logotipos, marcas de agua, sangre derramada, piel, rostro, proporciones irreales.

### 06 · Tema 4.2 · figura 4.2.2 · 4:3

- **Identificador:** `anatomia-dental/m04/05`
- **Qué muestra:** Manos enguantadas de una profesional palpan la región submandibular de un paciente adulto, visto de perfil desde el cuello hacia abajo.
- **Pie en la lectura:** La palpación de los ganglios submentonianos, submandibulares y cervicales es parte del examen extraoral de cada consulta.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica realista en consultorio dental bien iluminado, encuadre cerrado del cuello y la región submandibular de un paciente adulto sentado con la cabeza ligeramente inclinada hacia adelante, una odontóloga con guantes de nitrilo y bata clara palpa con las yemas de los dedos bajo el borde inferior de la mandíbula, el rostro del paciente queda fuera de cuadro por arriba del labio inferior, luz blanca suave, fondo desenfocado de la unidad dental, colores naturales. Evitar: texto, logotipos, marcas de agua, rostro identificable, sangre, manos sin guantes, gestos de dolor exagerados.

### 07 · Tema 4.2 · figura 4.2.3 · 3:4

- **Identificador:** `anatomia-dental/m04/06`
- **Qué muestra:** Ilustración anatómica del cuello en vista anterolateral con los grupos de ganglios linfáticos submentonianos, submandibulares y cervicales.
- **Pie en la lectura:** Los ganglios de la región oral se organizan en grupos superficiales bajo la mandíbula y en una cadena profunda junto a la vena yugular interna.
- **Tamaño:** 1200 × 1600 px

**Prompt:**

> Ilustración anatómica realista estilo atlas médico de cabeza y cuello de un adulto en vista anterolateral izquierda, sin piel, con la glándula submandibular, el músculo digástrico y el esternocleidomastoideo visibles, pequeños ganglios linfáticos ovalados de color verde pálido agrupados bajo el mentón, junto a la glándula submandibular y a lo largo de la vena yugular interna, vasos linfáticos finos que los unen, venas en azul tenue, arterias en rojo suave, fondo blanco limpio, colores naturales. Evitar: texto, etiquetas, flechas, números, logotipos, marcas de agua, rostro con rasgos identificables, sangre, inflamación exagerada.

### 08 · Tema 4.3 · figura 4.3.1 · 16:9

- **Identificador:** `anatomia-dental/m04/07`
- **Qué muestra:** Ilustración anatómica lateral de cráneo y cara con el nervio trigémino y sus tres divisiones dirigiéndose a frente, maxilar y mandíbula.
- **Pie en la lectura:** Las tres divisiones del trigémino nacen del ganglio trigeminal y reparten la sensibilidad de la cara en tres territorios.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Ilustración anatómica realista estilo atlas médico, vista lateral derecha de un cráneo adulto con una ventana ósea que expone la fosa craneal media, el ganglio trigeminal en color amarillo pálido y sus tres divisiones saliendo hacia la órbita, hacia la fosa pterigopalatina y el maxilar, y hacia la mandíbula, ramas finas que alcanzan los dientes superiores e inferiores dentro de los huesos semitransparentes, dientes permanentes completos con anatomía correcta, fondo blanco limpio, iluminación difusa, colores naturales. Evitar: texto, etiquetas, flechas, números, logotipos, marcas de agua, piel con rostro identificable, sangre, dientes en número incorrecto.

### 09 · Tema 4.3 · figura 4.3.2 · 4:3

- **Identificador:** `anatomia-dental/m04/08`
- **Qué muestra:** Ilustración anatómica de un corte del maxilar que muestra el seno maxilar sobre los ápices de los molares superiores y finos nervios en su pared.
- **Pie en la lectura:** Los ápices de los molares superiores están muy cerca del piso del seno maxilar, y los nervios alveolares recorren sus paredes.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Ilustración anatómica realista estilo atlas médico, corte sagital del maxilar derecho de un adulto que muestra el seno maxilar como una cavidad aérea revestida de mucosa rosada delgada, debajo de él el proceso alveolar con primer y segundo molares superiores permanentes cuyas raíces se aproximan al piso del seno, finas fibras nerviosas amarillo pálido y vasos rojo suave que corren por la pared del seno hacia los ápices, hueso esponjoso en tono marfil, fondo blanco, iluminación difusa, colores naturales. Evitar: texto, etiquetas, flechas, números, logotipos, marcas de agua, sangre, inflamación, dientes con número incorrecto de raíces.

### 10 · Tema 4.3 · figura 4.3.3 · 16:9

- **Identificador:** `anatomia-dental/m04/09`
- **Qué muestra:** Ilustración de un cráneo adulto en vista frontal con el foramen infraorbitario debajo del borde de la órbita y los dientes superiores completos.
- **Pie en la lectura:** El foramen infraorbitario, por donde sale el nervio infraorbitario, se localiza por debajo del borde inferior de la órbita.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Ilustración anatómica realista de un cráneo humano adulto en vista frontal ligeramente oblicua, hueso en tono marfil con textura natural, órbitas, aberturas nasales y maxilar superior bien definidos, el foramen infraorbitario visible como un orificio pequeño debajo del borde inferior de cada órbita, arcada superior con dentición permanente completa y anatomía correcta, mandíbula articulada, fondo gris neutro, iluminación lateral suave que realza el relieve óseo, estilo de atlas médico. Evitar: texto, etiquetas, flechas, números, logotipos, marcas de agua, aspecto macabro, grietas, dientes faltantes o deformes.

### 11 · Tema 4.4 · figura 4.4.1 · 4:3

- **Identificador:** `anatomia-dental/m04/10`
- **Qué muestra:** Ilustración anatómica de la cara interna de la rama mandibular con los nervios alveolar inferior y lingual descendiendo hacia el foramen mandibular y la lengua.
- **Pie en la lectura:** El nervio alveolar inferior entra al foramen mandibular, mientras el nervio lingual, por delante y por dentro, se dirige hacia la lengua.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Ilustración anatómica realista estilo atlas médico de la cara medial de la rama mandibular derecha de un adulto, vista desde el interior de la boca con la lengua y la mucosa retiradas, el músculo pterigoideo medial en tono rojizo, dos nervios amarillo pálido que descienden desde arriba: uno entra en el foramen mandibular detrás de una pequeña espina ósea y otro avanza hacia adelante en dirección a la lengua junto al tercer molar inferior, vasos rojo suave acompañantes, dientes inferiores permanentes con anatomía correcta, fondo blanco, iluminación difusa. Evitar: texto, etiquetas, flechas, números, logotipos, marcas de agua, sangre, piel, rostro, proporciones irreales.

### 12 · Tema 4.4 · figura 4.4.2 · 16:9

- **Identificador:** `anatomia-dental/m04/11`
- **Qué muestra:** Mandíbula humana adulta seca en vista lateral con el foramen mentoniano visible debajo de los premolares.
- **Pie en la lectura:** El foramen mentoniano suele estar a la altura de los premolares inferiores; su posición exacta varía entre personas.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía de estudio de una mandíbula humana adulta de modelo anatómico de alta calidad, vista lateral izquierda, hueso en tono marfil con textura natural, dentición permanente inferior completa con anatomía correcta de incisivos, canino, dos premolares y tres molares, el foramen mentoniano visible como un orificio ovalado en el cuerpo mandibular por debajo de los premolares, cóndilo y apófisis coronoides bien definidos, fondo gris neutro, iluminación lateral suave, enfoque nítido. Evitar: texto, etiquetas, flechas, números, logotipos, marcas de agua, aspecto macabro, dientes faltantes, fracturas.

### 13 · Tema 4.4 · figura 4.4.3 · 1:1

- **Identificador:** `anatomia-dental/m04/12`
- **Qué muestra:** Vista clínica del dorso de la lengua de un adulto, sana, con papilas visibles y las papilas caliciformes en la parte posterior.
- **Pie en la lectura:** El dorso de la lengua tiene doble inervación sensitiva y gustativa: los dos tercios anteriores dependen del lingual y la cuerda del tímpano, y el tercio posterior del glosofaríngeo.
- **Tamaño:** 1400 × 1400 px

**Prompt:**

> Fotografía clínica macro realista del dorso de la lengua sana de un adulto, protruida y relajada, encuadre cerrado que solo muestra la lengua y el borde de los incisivos inferiores, superficie rosada con papilas filiformes finas y algunas fungiformes rojizas dispersas, en el fondo la fila en forma de V de papilas caliciformes, humedad natural con brillo suave, iluminación de lámpara dental blanca y uniforme, fondo oscuro desenfocado, colores naturales. Evitar: texto, etiquetas, flechas, logotipos, marcas de agua, labios o rostro completo, saburra exagerada, lesiones, sangre, piercings.

### 14 · Tema 4.5 · figura 4.5.1 · 3:4

- **Identificador:** `anatomia-dental/m04/13`
- **Qué muestra:** Ilustración realista de un corte longitudinal de un molar con la pulpa coronaria y radicular y finas fibras nerviosas que entran por los ápices.
- **Pie en la lectura:** Los nervios entran por el ápice junto con los vasos y se ramifican en la pulpa coronaria, donde forman un plexo bajo la capa de odontoblastos.
- **Tamaño:** 1200 × 1600 px

**Prompt:**

> Ilustración realista de estilo histológico y anatómico, corte longitudinal de un primer molar inferior permanente sano de un adulto, esmalte blanco translúcido, dentina color marfil con textura fina, cámara pulpar y conductos radiculares en rosa suave, finas fibras nerviosas amarillo pálido y vasos rojo tenue que entran por los dos ápices, ascienden por los conductos y se ramifican en abanico bajo el techo de la cámara pulpar, hueso alveolar alrededor de las raíces, fondo neutro claro, iluminación difusa. Evitar: texto, etiquetas, flechas, números, logotipos, marcas de agua, caries, sangre, raíces en número incorrecto.

### 15 · Tema 4.5 · figura 4.5.2 · 4:3

- **Identificador:** `anatomia-dental/m04/14`
- **Qué muestra:** Manos enguantadas de un odontólogo aplican una torunda de algodón fría sobre la cara vestibular de un premolar inferior.
- **Pie en la lectura:** Las pruebas de sensibilidad evalúan la respuesta nerviosa de la pulpa; siempre se comparan con dientes control del mismo paciente.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica realista, encuadre cerrado de la boca de un paciente adulto con labios separados por un retractor suave, un odontólogo con guantes de nitrilo azul sostiene con pinzas de curación una torunda de algodón con escarcha blanca de frío y la apoya en el tercio medio de la cara vestibular de un premolar inferior permanente sano, dientes vecinos secos, encía rosa sana, iluminación de lámpara dental blanca, enfoque nítido, fondo desenfocado. Evitar: texto, logotipos, marcas de agua, sangre, rostro completo del paciente, manos sin guantes, caries, dientes deformes.

### 16 · Tema 4.5 · figura 4.5.3 · 16:9

- **Identificador:** `anatomia-dental/m04/15`
- **Qué muestra:** Tipodonto adulto completo sobre una mesa de laboratorio dental, con ambas arcadas visibles desde una vista frontal ligeramente superior.
- **Pie en la lectura:** Sobre un modelo de las dos arcadas puedes practicar el mapa nervioso: diente, encía vestibular y encía palatina o lingual.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía de estudio realista de un tipodonto dental de adulto de alta calidad colocado en una mesa blanca de laboratorio de enseñanza, arcadas superior e inferior entreabiertas con dentición permanente completa de 32 dientes y anatomía correcta, encía de silicona rosa pálido, vista frontal ligeramente superior que permite ver el paladar y la cara lingual de los dientes inferiores, luz suave de ventana, fondo limpio desenfocado, colores naturales. Evitar: texto, etiquetas, logotipos, marcas, marcas de agua, dientes faltantes o deformes, sangre, personas.

## Módulo 5 · Odontogénesis: cómo se forma un diente

Carpeta: `imagenes-academia/01-anatomia-dental/modulo-05/` · 16 imágenes (4 de 16:9, 10 de 4:3, 1 de 1:1, 1 de 3:4).

### 01 · Portada del módulo · 16:9

- **Identificador:** `anatomia-dental/m05/portada`
- **Qué muestra:** Ilustración científica de una secuencia de gérmenes dentarios en desarrollo, del brote a un diente con raíz en formación.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Ilustración científica realista de gran formato que muestra, de izquierda a derecha sobre un fondo azul petróleo oscuro, una secuencia de cinco gérmenes dentarios en corte: una yema epitelial redondeada, una forma de casquete, una forma de campana con capas celulares, una corona en formación con capas de dentina y esmalte, y un molar con corona completa y raíces en crecimiento, tejidos en tonos marfil, rosa suave y azul grisáceo translúcido, iluminación de estudio suave, alto detalle, estilo de atlas de histología moderno. Evitar: texto, etiquetas, flechas, números, logotipos, marcas de agua, sangre, aspecto de caricatura, anatomía incorrecta.

### 02 · Tema 5.1 · figura 5.1.1 · 4:3

- **Identificador:** `anatomia-dental/m05/01`
- **Qué muestra:** Ilustración embriológica de un embrión humano temprano en vista lateral con los arcos faríngeos y la región de la futura boca.
- **Pie en la lectura:** Hacia la sexta semana, el primer arco faríngeo ya forma los procesos maxilar y mandibular, donde comenzará el desarrollo dental.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Ilustración científica realista de un embrión humano de aproximadamente seis semanas en vista lateral, piel translúcida rosada, cabeza grande con los arcos faríngeos visibles como pliegues redondeados bajo la región de la futura cara, procesos maxilar y mandibular del primer arco destacados con un tono ligeramente más cálido, esbozos de extremidades pequeños, fondo azul oscuro suave y uniforme, iluminación difusa de estudio, estilo de atlas de embriología, alto detalle y colores naturales. Evitar: texto, etiquetas, flechas, números, logotipos, marcas de agua, sangre, aspecto perturbador, rasgos faciales humanos desarrollados, proporciones irreales.

### 03 · Tema 5.1 · figura 5.1.2 · 4:3

- **Identificador:** `anatomia-dental/m05/02`
- **Qué muestra:** Microfotografía histológica teñida con hematoxilina y eosina de un engrosamiento epitelial que penetra en el mesénquima subyacente.
- **Pie en la lectura:** La lámina dental es una proliferación del epitelio oral que avanza dentro del ectomesénquima.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Microfotografía histológica realista de un corte de maxilar de un embrión de mamífero teñido con hematoxilina y eosina, aumento medio, en la parte superior una capa de epitelio oral de varias células de espesor teñida de violeta intenso que se engruesa y penetra en forma de cordón hacia abajo dentro de un tejido mesenquimatoso laxo rosado con células estrelladas dispersas, iluminación de microscopio de campo claro uniforme, enfoque nítido, colores naturales de tinción. Evitar: texto, etiquetas, flechas, barras de escala, números, logotipos, marcas de agua, artefactos de corte exagerados, colores fluorescentes.

### 04 · Tema 5.1 · figura 5.1.3 · 16:9

- **Identificador:** `anatomia-dental/m05/03`
- **Qué muestra:** Ilustración de los maxilares de un recién nacido con los gérmenes de los dientes temporales dentro del hueso y las encías intactas.
- **Pie en la lectura:** Al nacer, los maxilares ya alojan las coronas en formación de los dientes temporales y los primeros gérmenes permanentes.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Ilustración anatómica realista estilo atlas, vista lateral de los maxilares de un recién nacido con el hueso representado semitransparente en tono marfil claro, dentro de él coronas de dientes temporales en formación sin raíces, blancas y nacaradas, alineadas en ambas arcadas, y por detrás el germen pequeño del primer molar permanente, encía rosa lisa e intacta sin dientes erupcionados, fondo blanco limpio, iluminación difusa, colores naturales y alto detalle. Evitar: texto, etiquetas, flechas, números, logotipos, marcas de agua, rostro del bebé, sangre, dientes erupcionados, raíces completas, aspecto perturbador.

### 05 · Tema 5.2 · figura 5.2.1 · 4:3

- **Identificador:** `anatomia-dental/m05/04`
- **Qué muestra:** Microfotografía histológica de un germen dentario en etapa de brote, con una esfera epitelial rodeada de mesénquima condensado.
- **Pie en la lectura:** Etapa de brote: el epitelio forma una yema redondeada y el ectomesénquima se condensa a su alrededor.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Microfotografía histológica realista de un germen dentario en etapa de brote de un embrión de mamífero, corte teñido con hematoxilina y eosina, aumento medio, una masa epitelial redondeada de células violeta densamente agrupadas unida por un cordón delgado al epitelio oral en la parte superior, rodeada por una zona de células mesenquimatosas más compactas y oscuras, y por fuera mesénquima laxo rosado, iluminación de microscopio de campo claro, enfoque nítido, colores naturales de tinción. Evitar: texto, etiquetas, flechas, barras de escala, números, logotipos, marcas de agua, colores fluorescentes, artefactos.

### 06 · Tema 5.2 · figura 5.2.2 · 4:3

- **Identificador:** `anatomia-dental/m05/05`
- **Qué muestra:** Microfotografía histológica de un germen dentario en etapa de campana con el órgano del esmalte, la papila y el folículo.
- **Pie en la lectura:** Etapa de campana: el órgano del esmalte rodea a la papila dental y ya dibuja la forma de la futura corona.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Microfotografía histológica realista de un germen dentario en etapa de campana, corte teñido con hematoxilina y eosina, aumento bajo, un órgano del esmalte en forma de campana con una capa interna de células cilíndricas violeta, una zona central pálida de células estrelladas espaciadas y una capa externa delgada, en su interior la papila dental densa y rosada, todo rodeado por un folículo fibroso y hueso en formación en los bordes, iluminación de campo claro, enfoque nítido. Evitar: texto, etiquetas, flechas, barras de escala, números, logotipos, marcas de agua, colores fluorescentes, artefactos de corte.

### 07 · Tema 5.2 · figura 5.2.3 · 1:1

- **Identificador:** `anatomia-dental/m05/06`
- **Qué muestra:** Ilustración tridimensional realista de un germen dentario en campana cortado a la mitad que muestra sus capas internas.
- **Pie en la lectura:** Un germen en campana visto en tres dimensiones: la unión entre el epitelio interno y la papila anticipa la forma de la corona.
- **Tamaño:** 1400 × 1400 px

**Prompt:**

> Ilustración científica tridimensional realista de un germen dentario de molar en etapa de campana cortado por la mitad, órgano del esmalte en tonos azul grisáceo translúcido con una capa interna de células alargadas, zona central esponjosa y capa externa delgada, papila dental rosada dentro de la concavidad con relieve de varias cúspides incipientes, folículo fibroso envolvente en tono beige, fondo oscuro neutro, iluminación de estudio suave con sombras delicadas, alto detalle. Evitar: texto, etiquetas, flechas, números, logotipos, marcas de agua, sangre, aspecto de caricatura, dientes completamente formados.

### 08 · Tema 5.3 · figura 5.3.1 · 4:3

- **Identificador:** `anatomia-dental/m05/07`
- **Qué muestra:** Microfotografía histológica de la punta de una cúspide en formación con una capa de odontoblastos, una franja de dentina y otra de ameloblastos.
- **Pie en la lectura:** En la punta de la cúspide comienza la aposición: los odontoblastos forman dentina y, frente a ellos, los ameloblastos empiezan a formar esmalte.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Microfotografía histológica realista de la punta de una cúspide de un germen dentario en etapa de campana tardía, corte teñido con hematoxilina y eosina, gran aumento, de abajo hacia arriba se ven la pulpa con células dispersas, una hilera de odontoblastos cilíndricos alineados, una franja rosada intensa de predentina y dentina, una franja delgada de matriz de esmalte más pálida y una hilera de ameloblastos altos y en empalizada, iluminación de campo claro uniforme, enfoque nítido. Evitar: texto, etiquetas, flechas, barras de escala, números, logotipos, marcas de agua, colores fluorescentes, artefactos de corte.

### 09 · Tema 5.3 · figura 5.3.2 · 4:3

- **Identificador:** `anatomia-dental/m05/08`
- **Qué muestra:** Vista clínica frontal de incisivos superiores permanentes con finas líneas y manchas blancas opacas simétricas.
- **Pie en la lectura:** Fluorosis leve: opacidades blancas simétricas que siguen las líneas de crecimiento del esmalte en dientes homólogos.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica realista frontal de los incisivos centrales y laterales superiores permanentes de un adolescente, labios separados por un retractor suave, esmalte con finas estrías horizontales blancas opacas y pequeñas manchas blancas como nieve distribuidas de forma simétrica en ambos lados, sin cavidades ni manchas pardas, encía sana rosa pálido, superficie húmeda con brillo natural, iluminación de flash clínico uniforme, enfoque nítido. Evitar: texto, logotipos, marcas de agua, rostro completo, sangre, caries, ortodoncia, dientes deformes o en número incorrecto.

### 10 · Tema 5.3 · figura 5.3.3 · 4:3

- **Identificador:** `anatomia-dental/m05/09`
- **Qué muestra:** Primer molar permanente con una opacidad delimitada color crema y amarillo en la cúspide mesiovestibular, en vista oclusal.
- **Pie en la lectura:** Hipomineralización: opacidad delimitada en un primer molar permanente, distinta del patrón difuso y simétrico de la fluorosis.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica macro realista con espejo intraoral de un primer molar inferior permanente de un niño de 8 años en vista oclusal, con una opacidad bien delimitada de color crema amarillento en la cúspide mesiovestibular y esmalte normal brillante en el resto de la corona, fisuras sanas, segundo molar temporal vecino visible, encía rosada sana, superficie limpia y húmeda, iluminación de lámpara dental uniforme, enfoque nítido. Evitar: texto, flechas, etiquetas, logotipos, marcas de agua, rostro, sangre, cavidades profundas, número incorrecto de cúspides.

### 11 · Tema 5.4 · figura 5.4.1 · 3:4

- **Identificador:** `anatomia-dental/m05/10`
- **Qué muestra:** Ilustración realista de un corte longitudinal de un diente en formación con la corona completa y una raíz corta abierta en el extremo apical.
- **Pie en la lectura:** La vaina de Hertwig avanza hacia apical y guía la formación de la raíz; el ápice permanece abierto mientras la raíz crece.
- **Tamaño:** 1200 × 1600 px

**Prompt:**

> Ilustración científica realista de un corte longitudinal de un incisivo central inferior permanente en formación dentro del hueso de un niño, corona completa con esmalte blanco translúcido y dentina marfil, raíz corta con paredes delgadas que se abren en forma de embudo hacia apical, pulpa amplia rosada, en el extremo de la raíz una delgada banda celular que se curva hacia adentro, tejido de folículo fibroso alrededor y hueso esponjoso en tono marfil, fondo neutro claro, iluminación difusa. Evitar: texto, etiquetas, flechas, números, logotipos, marcas de agua, sangre, caries, raíz completamente cerrada.

### 12 · Tema 5.4 · figura 5.4.2 · 4:3

- **Identificador:** `anatomia-dental/m05/11`
- **Qué muestra:** Molar superior extraído visto desde la furcación, con una pequeña esfera de esmalte entre las raíces.
- **Pie en la lectura:** Una perla de esmalte en la furcación de un molar: esmalte formado fuera de lugar por células de la vaina radicular.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía macro de estudio de un segundo molar superior permanente extraído, limpio y seco, sobre fondo gris neutro, vista lateral que muestra la zona de furcación entre las raíces vestibulares, con una pequeña esfera lisa y brillante de color blanco nacarado adherida a la raíz justo debajo del cuello, raíces color marfil con textura de cemento mate, corona con anatomía correcta, iluminación difusa de estudio, enfoque nítido. Evitar: texto, flechas, etiquetas, logotipos, marcas de agua, sangre, restos de tejido blando, caries, fracturas.

### 13 · Tema 5.4 · figura 5.4.3 · 16:9

- **Identificador:** `anatomia-dental/m05/12`
- **Qué muestra:** Vista clínica de la encía de un niño con la punta de un primer molar permanente emergiendo detrás del segundo molar temporal.
- **Pie en la lectura:** El primer molar permanente emerge cuando su raíz todavía está en formación: un diente nuevo con ápice abierto.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía clínica realista con espejo intraoral de la hemiarcada inferior izquierda de un niño de 6 años, vista oclusal, dientes temporales completos y sanos, por detrás del segundo molar temporal emergen las cúspides de un primer molar permanente atravesando una encía rosada ligeramente engrosada, sin inflamación marcada, superficies limpias y húmedas, iluminación de lámpara dental uniforme, enfoque nítido, colores naturales. Evitar: texto, flechas, etiquetas, logotipos, marcas de agua, rostro, sangre, caries extensas, dientes en número incorrecto.

### 14 · Tema 5.5 · figura 5.5.1 · 16:9

- **Identificador:** `anatomia-dental/m05/13`
- **Qué muestra:** Radiografía panorámica de un adolescente con ausencia de los incisivos laterales superiores y espacio entre centrales y caninos.
- **Pie en la lectura:** Agenesia de incisivos laterales superiores: los caninos ocupan una posición más mesial y pueden quedar espacios.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Radiografía panorámica dental realista de un adolescente de 14 años, imagen en escala de grises con contraste clínico normal, dentición permanente con ausencia de ambos incisivos laterales superiores, caninos superiores en posición más mesial junto a los centrales, premolares y molares completos con raíces en formación final, terceros molares en germen dentro del hueso, estructuras óseas y senos maxilares bien definidos, encuadre panorámico completo. Evitar: texto, letras, números, marcadores de lado, logotipos, marcas de agua, artefactos metálicos, ortodoncia, implantes, dientes duplicados.

### 15 · Tema 5.5 · figura 5.5.2 · 4:3

- **Identificador:** `anatomia-dental/m05/14`
- **Qué muestra:** Vista clínica de un incisivo lateral superior pequeño y de forma cónica junto a un incisivo central normal.
- **Pie en la lectura:** Incisivo lateral superior conoide: la microdoncia aislada más frecuente.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica realista frontal de los dientes anterosuperiores de un adulto joven, labios separados por un retractor suave, incisivos centrales permanentes de forma y tamaño normales, el incisivo lateral derecho pequeño, estrecho y de forma cónica con punta redondeada y espacios a ambos lados, el lateral izquierdo de forma normal, caninos completos, encía sana rosa pálido, esmalte con brillo natural, iluminación de flash clínico uniforme, enfoque nítido. Evitar: texto, logotipos, marcas de agua, rostro completo, sangre, caries, ortodoncia, restauraciones visibles, dientes duplicados.

### 16 · Tema 5.5 · figura 5.5.3 · 4:3

- **Identificador:** `anatomia-dental/m05/15`
- **Qué muestra:** Dientes de un adulto joven con coloración ámbar grisácea opalescente y desgaste de los bordes.
- **Pie en la lectura:** Dentinogénesis imperfecta: coloración opalescente y desgaste acelerado por una dentina anormal bajo un esmalte que se desprende.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica realista frontal de las arcadas en oclusión de un adulto joven, labios separados por un retractor suave, todos los dientes permanentes con una coloración ámbar grisácea translúcida y opalescente, bordes incisales con desgaste moderado y pequeñas zonas donde falta esmalte, forma de las coronas ligeramente bulbosa, encía sana rosa pálido, iluminación de flash clínico uniforme, enfoque nítido, colores realistas. Evitar: texto, logotipos, marcas de agua, rostro completo, sangre, caries extensas, restauraciones metálicas, dientes en número incorrecto, aspecto perturbador.

## Módulo 6 · Tejidos dentarios: esmalte, dentina, pulpa y cemento

Carpeta: `imagenes-academia/01-anatomia-dental/modulo-06/` · 16 imágenes (2 de 16:9, 3 de 3:4, 10 de 4:3, 1 de 1:1).

### 01 · Portada del módulo · 16:9

- **Identificador:** `anatomia-dental/m06/portada`
- **Qué muestra:** Ilustración de un corte de molar con capas de esmalte, dentina, pulpa y cemento y ampliaciones microscópicas de cada tejido.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Ilustración científica realista de gran formato sobre fondo azul petróleo oscuro: a la izquierda, un corte longitudinal de un primer molar inferior permanente con esmalte blanco translúcido, dentina marfil, pulpa rosada y cemento delgado sobre las raíces; a la derecha, tres círculos de ampliación con apariencia de microscopía que muestran prismas del esmalte en patrón de panal, túbulos dentinarios paralelos y células alineadas de la pulpa, iluminación de estudio suave, alto detalle, colores naturales. Evitar: texto, etiquetas, flechas, números, logotipos, marcas de agua, caries, sangre, raíces en número incorrecto.

### 02 · Tema 6.1 · figura 6.1.1 · 3:4

- **Identificador:** `anatomia-dental/m06/01`
- **Qué muestra:** Ilustración de un corte longitudinal de un molar inferior con esmalte, dentina, pulpa y cemento en su posición dentro del hueso.
- **Pie en la lectura:** Los cuatro tejidos del diente en un corte longitudinal: esmalte en la corona, dentina en todo el cuerpo del diente, pulpa en el centro y cemento sobre la raíz.
- **Tamaño:** 1200 × 1600 px

**Prompt:**

> Ilustración anatómica realista de un corte longitudinal vestibulolingual de un primer molar inferior permanente sano de un adulto colocado en su alvéolo, esmalte blanco translúcido que se adelgaza hacia el cuello, dentina color marfil amarillento con estrías finas, pulpa rosada con cuernos pulpares bajo las cúspides y conductos que llegan a los ápices, capa delgada de cemento color hueso sobre las raíces, ligamento fino y hueso alveolar alrededor, encía rosada en el margen, fondo neutro claro, iluminación difusa. Evitar: texto, etiquetas, flechas, números, logotipos, marcas de agua, caries, sangre, raíces en número incorrecto.

### 03 · Tema 6.1 · figura 6.1.2 · 4:3

- **Identificador:** `anatomia-dental/m06/02`
- **Qué muestra:** Vista clínica del cuello de un premolar inferior con ligera recesión gingival que deja visible el límite entre esmalte y raíz.
- **Pie en la lectura:** Con la recesión gingival queda a la vista la unión amelocementaria; si hay dentina expuesta, la sensibilidad es frecuente.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica macro realista de la cara vestibular de un primer premolar inferior permanente de un adulto, con recesión gingival leve que deja visible una franja de raíz de color ligeramente amarillento por debajo del esmalte brillante, límite nítido entre ambos en el cuello, encía rosa pálido sana y firme, dientes vecinos parcialmente visibles, superficie limpia y húmeda, iluminación de lámpara dental uniforme, enfoque nítido. Evitar: texto, flechas, etiquetas, logotipos, marcas de agua, sangre, caries, cálculo abundante, rostro, inflamación marcada.

### 04 · Tema 6.1 · figura 6.1.3 · 4:3

- **Identificador:** `anatomia-dental/m06/03`
- **Qué muestra:** Microfotografía de microscopio electrónico de barrido de la superficie de dentina cortada con múltiples orificios de túbulos.
- **Pie en la lectura:** La dentina vista de frente: cada orificio es un túbulo que comunica con la pulpa.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Microfotografía realista de microscopio electrónico de barrido en escala de grises de una superficie de dentina humana cortada transversalmente, numerosos orificios circulares de túbulos dentinarios distribuidos de forma regular, cada uno rodeado por un anillo más brillante, matriz intertubular de textura fina entre ellos, iluminación y contraste típicos de microscopía electrónica, enfoque nítido en todo el campo, encuadre lleno. Evitar: texto, barras de escala, números, etiquetas, flechas, logotipos, marcas de agua, colores artificiales, artefactos de carga eléctrica.

### 05 · Tema 6.2 · figura 6.2.1 · 4:3

- **Identificador:** `anatomia-dental/m06/04`
- **Qué muestra:** Microfotografía de microscopio electrónico de barrido de esmalte grabado con ácido que muestra prismas en patrón de panal.
- **Pie en la lectura:** El esmalte grabado deja ver la organización en prismas; el patrón exacto depende de qué parte del prisma se disuelve más.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Microfotografía realista de microscopio electrónico de barrido en escala de grises de la superficie de esmalte humano grabado con ácido, patrón regular de prismas vistos en corte transversal con centros ligeramente hundidos y bordes elevados formando un dibujo parecido a un panal o a escamas, textura cristalina fina visible, contraste típico de microscopía electrónica, enfoque nítido en todo el campo, encuadre lleno. Evitar: texto, barras de escala, números, etiquetas, flechas, logotipos, marcas de agua, colores artificiales, artefactos.

### 06 · Tema 6.2 · figura 6.2.2 · 4:3

- **Identificador:** `anatomia-dental/m06/05`
- **Qué muestra:** Microfotografía con luz reflejada de un corte longitudinal de esmalte con bandas claras y oscuras alternas.
- **Pie en la lectura:** Bandas de Hunter-Schreger: el cruce de grupos de prismas produce franjas alternas cuando se ilumina el corte.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Microfotografía óptica realista de un corte longitudinal pulido de esmalte humano observado con luz reflejada oblicua, aumento bajo, franjas alternas claras y oscuras que se extienden desde el borde de la dentina en la parte inferior hacia la superficie del esmalte en la parte superior y se desvanecen en el tercio externo, tonos marfil y gris cálido, textura fina y regular, enfoque nítido, encuadre lleno. Evitar: texto, barras de escala, números, etiquetas, flechas, logotipos, marcas de agua, colores artificiales, grietas grandes, suciedad.

### 07 · Tema 6.2 · figura 6.2.3 · 1:1

- **Identificador:** `anatomia-dental/m06/06`
- **Qué muestra:** Vista oclusal macro de un segundo molar inferior permanente sano con fisuras profundas y estrechas.
- **Pie en la lectura:** Las fisuras estrechas y profundas de un molar joven son zonas de retención de placa con esmalte más delgado en el fondo.
- **Tamaño:** 1400 × 1400 px

**Prompt:**

> Fotografía clínica macro realista con espejo intraoral de la cara oclusal de un segundo molar inferior permanente de un adolescente, recién erupcionado y sano, cuatro cúspides bien definidas con anatomía correcta, fisuras centrales y vestibulares estrechas y profundas con ligera pigmentación natural en el fondo, esmalte translúcido con brillo, superficie limpia y seca, iluminación de lámpara dental uniforme, enfoque nítido de toda la superficie. Evitar: texto, flechas, etiquetas, logotipos, marcas de agua, cavidades, restauraciones, sangre, rostro, número incorrecto de cúspides.

### 08 · Tema 6.3 · figura 6.3.1 · 4:3

- **Identificador:** `anatomia-dental/m06/07`
- **Qué muestra:** Microfotografía de un corte longitudinal de dentina coronaria con túbulos paralelos en forma de S suave desde la pulpa hacia el esmalte.
- **Pie en la lectura:** Los túbulos dentinarios recorren la dentina en forma de S suave y se acercan entre sí a medida que llegan a la pulpa.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Microfotografía óptica realista de un corte longitudinal por desgaste de dentina coronaria humana, aumento medio, cientos de túbulos finos y oscuros que corren paralelos desde la parte inferior, donde estaría la pulpa, hacia la parte superior, donde estaría el esmalte, describiendo una curva suave en forma de S, matriz de tono marfil dorado entre ellos, iluminación de campo claro, enfoque nítido. Evitar: texto, barras de escala, números, etiquetas, flechas, logotipos, marcas de agua, colores artificiales, grietas, suciedad.

### 09 · Tema 6.3 · figura 6.3.2 · 3:4

- **Identificador:** `anatomia-dental/m06/08`
- **Qué muestra:** Ilustración realista comparativa de dos cortes de incisivo, uno joven con pulpa amplia y otro de adulto mayor con pulpa reducida por dentina secundaria.
- **Pie en la lectura:** La dentina secundaria reduce la cámara pulpar con los años: compara la pulpa de un diente joven con la de uno de un adulto mayor.
- **Tamaño:** 1200 × 1600 px

**Prompt:**

> Ilustración científica realista con dos cortes longitudinales de incisivos centrales superiores permanentes colocados lado a lado sobre fondo neutro claro, a la izquierda un diente joven con cámara pulpar amplia y cuernos pulpares altos en rosa suave, a la derecha un diente de adulto mayor con cámara pulpar estrecha y conducto delgado por el depósito de dentina, borde incisal ligeramente desgastado y dentina más oscura, esmalte translúcido en ambos, iluminación difusa, alto detalle. Evitar: texto, etiquetas, flechas, números, logotipos, marcas de agua, caries, sangre, proporciones incorrectas.

### 10 · Tema 6.3 · figura 6.3.3 · 4:3

- **Identificador:** `anatomia-dental/m06/09`
- **Qué muestra:** Cuellos de premolares inferiores con recesión gingival y dentina expuesta de color amarillento.
- **Pie en la lectura:** La dentina expuesta en el cuello, con túbulos abiertos, es la causa anatómica de la hipersensibilidad dentinaria.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica macro realista de la cara vestibular de premolares inferiores permanentes de un adulto con recesión gingival moderada, franja de dentina radicular expuesta de color amarillento mate por debajo del esmalte blanco brillante, ligera concavidad en el cuello por desgaste, encía rosa pálido sana y firme sin inflamación, superficie limpia y húmeda, iluminación de lámpara dental uniforme, enfoque nítido. Evitar: texto, flechas, etiquetas, logotipos, marcas de agua, sangre, caries, cálculo, rostro, inflamación marcada.

### 11 · Tema 6.4 · figura 6.4.1 · 4:3

- **Identificador:** `anatomia-dental/m06/10`
- **Qué muestra:** Microfotografía histológica de la periferia de la pulpa con dentina, odontoblastos, una franja clara y una zona densa en células.
- **Pie en la lectura:** Las zonas de la pulpa: odontoblastos junto a la dentina, una franja pobre en células y, por dentro, la zona rica en células.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Microfotografía histológica realista de la periferia de la pulpa coronaria de un diente humano, corte teñido con hematoxilina y eosina, aumento medio, en la parte superior dentina rosada intensa y una delgada franja de predentina más pálida, debajo una hilera de odontoblastos en empalizada con núcleos violeta, luego una franja clara con escasos núcleos y capilares finos, después una zona con abundantes núcleos y abajo tejido laxo con un vaso sanguíneo, iluminación de campo claro, enfoque nítido. Evitar: texto, etiquetas, flechas, barras de escala, números, logotipos, marcas de agua, colores fluorescentes.

### 12 · Tema 6.4 · figura 6.4.2 · 3:4

- **Identificador:** `anatomia-dental/m06/11`
- **Qué muestra:** Ilustración realista de la red vascular de la pulpa de un premolar con vasos que entran por el ápice y forman una malla bajo la dentina.
- **Pie en la lectura:** Las arteriolas entran por el ápice y forman en la corona una red capilar densa bajo la capa de odontoblastos.
- **Tamaño:** 1200 × 1600 px

**Prompt:**

> Ilustración científica realista de un premolar inferior permanente con la dentina y el esmalte representados semitransparentes en tono marfil claro, mostrando en su interior la pulpa como un molde rosado con una red de vasos sanguíneos rojos finos que entran por el ápice, ascienden por el conducto y forman una malla capilar densa bajo el techo de la cámara pulpar y los cuernos pulpares, venas en azul tenue acompañantes, fondo oscuro neutro, iluminación de estudio suave, alto detalle. Evitar: texto, etiquetas, flechas, números, logotipos, marcas de agua, sangre derramada, caries, raíces en número incorrecto.

### 13 · Tema 6.4 · figura 6.4.3 · 4:3

- **Identificador:** `anatomia-dental/m06/12`
- **Qué muestra:** Radiografía periapical de molares inferiores con una imagen radiopaca redondeada dentro de la cámara pulpar de uno de ellos.
- **Pie en la lectura:** Un cálculo pulpar se ve en la radiografía como una masa radiopaca dentro de la cámara pulpar.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Radiografía periapical dental realista en escala de grises de los molares inferiores izquierdos de un adulto, primer y segundo molar con raíces completas y lámina dura visible, en la cámara pulpar del primer molar una masa radiopaca redondeada y bien delimitada que ocupa parte de la cámara, conductos estrechos, hueso alveolar con trabeculado normal, sin caries ni restauraciones, contraste clínico normal. Evitar: texto, letras, números, marcadores, logotipos, marcas de agua, artefactos metálicos, implantes, lesiones periapicales, distorsión exagerada.

### 14 · Tema 6.5 · figura 6.5.1 · 4:3

- **Identificador:** `anatomia-dental/m06/13`
- **Qué muestra:** Microfotografía histológica de la superficie de una raíz con dentina, una capa de cemento con células atrapadas y el ligamento periodontal.
- **Pie en la lectura:** Cemento celular en la región apical: los cementocitos ocupan lagunas y el ligamento periodontal se inserta en su superficie.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Microfotografía histológica realista de un corte longitudinal de la región apical de una raíz humana, tinción de hematoxilina y eosina, aumento medio, a la izquierda dentina radicular rosada con túbulos finos, en el centro una banda gruesa de cemento con pequeñas lagunas que contienen células de núcleo oscuro y líneas incrementales paralelas, a la derecha el ligamento periodontal con haces de fibras que se insertan en el cemento, iluminación de campo claro, enfoque nítido. Evitar: texto, etiquetas, flechas, barras de escala, números, logotipos, marcas de agua, colores fluorescentes, artefactos.

### 15 · Tema 6.5 · figura 6.5.2 · 4:3

- **Identificador:** `anatomia-dental/m06/14`
- **Qué muestra:** Premolar inferior extraído con la raíz engrosada en forma de maza en su tercio apical.
- **Pie en la lectura:** Hipercementosis: el depósito excesivo de cemento engrosa la raíz en su tercio apical.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía macro de estudio de un premolar inferior permanente extraído, limpio y seco, sobre fondo gris neutro, vista proximal, corona con anatomía correcta y esmalte íntegro, raíz única de color marfil mate que se engrosa de forma redondeada en su tercio apical como una maza, superficie radicular lisa sin restos de tejido, iluminación difusa de estudio, enfoque nítido de toda la pieza. Evitar: texto, flechas, etiquetas, logotipos, marcas de agua, sangre, restos de tejido blando, caries, fracturas, instrumental.

### 16 · Tema 6.5 · figura 6.5.3 · 16:9

- **Identificador:** `anatomia-dental/m06/15`
- **Qué muestra:** Manos enguantadas de una higienista realizan un raspado suave con una cureta en los dientes inferiores de un paciente, en encuadre cerrado.
- **Pie en la lectura:** El tratamiento periodontal busca eliminar biopelícula y cálculo de la raíz conservando el cemento sano siempre que sea posible.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía clínica realista en consultorio dental bien iluminado, encuadre cerrado de la boca de un paciente adulto con los labios separados por un retractor suave, una profesional con guantes de nitrilo, cubrebocas y careta transparente sostiene una cureta periodontal con apoyo digital estable junto al margen gingival de un incisivo inferior, encía rosa con leve enrojecimiento marginal, sin sangrado, luz blanca de lámpara dental, fondo desenfocado, colores naturales. Evitar: texto, logotipos, marcas de agua, sangre, rostro completo del paciente, manos sin guantes, instrumental oxidado, dientes deformes.

## Módulo 7 · Periodonto de inserción: ligamento periodontal y hueso alveolar

Carpeta: `imagenes-academia/01-anatomia-dental/modulo-07/` · 16 imágenes (5 de 16:9, 7 de 4:3, 2 de 1:1, 2 de 3:4).

### 01 · Portada del módulo · 16:9

- **Identificador:** `anatomia-dental/m07/portada`
- **Qué muestra:** Ilustración realista de un corte de mandíbula con un molar y un premolar en sus alvéolos, rodeados por el ligamento y el hueso alveolar.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Ilustración médica realista de gran formato estilo atlas anatómico contemporáneo, corte longitudinal de un segmento de mandíbula adulta con un premolar y un primer molar inferiores permanentes en sus alvéolos, raíces rodeadas por una banda fina rosada de ligamento periodontal con fibras sutiles, cemento color marfil, hueso alveolar con cortical densa y hueso trabecular de textura fina, encía rosa pálido sana sobre las crestas, iluminación suave lateral de estudio, fondo gris azulado degradado, colores naturales y alto detalle. Evitar: texto, flechas, etiquetas, números, logotipos, sangre, rostros, número incorrecto de raíces, aspecto de caricatura.

### 02 · Tema 7.1 · figura 7.1.1 · 4:3

- **Identificador:** `anatomia-dental/m07/01`
- **Qué muestra:** Ilustración realista de un corte de mandíbula que muestra un molar dentro de su alvéolo, con el espacio del ligamento entre la raíz y el hueso.
- **Pie en la lectura:** El diente se aloja en su alvéolo sin tocar el hueso: entre ambos hay un espacio ocupado por el ligamento periodontal.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Ilustración anatómica realista de estilo atlas médico, corte sagital de un segmento de mandíbula adulta con un primer molar inferior permanente y sus dos raíces dentro de los alvéolos, se aprecia un espacio fino y uniforme de tejido rosado entre la raíz y la pared ósea, hueso cortical denso en la periferia y hueso esponjoso trabeculado en el centro, encía rosa pálido cubriendo la cresta, colores naturales, iluminación suave de estudio, fondo neutro gris claro, alto detalle histológico sin exagerar. Evitar: texto, flechas, etiquetas, números, logotipos, sangre, raíces fusionadas al hueso, número incorrecto de raíces, aspecto de caricatura.

### 03 · Tema 7.1 · figura 7.1.2 · 1:1

- **Identificador:** `anatomia-dental/m07/02`
- **Qué muestra:** Vista microscópica realista de la interfase entre raíz, ligamento periodontal y hueso, con fibras que cruzan de un lado a otro.
- **Pie en la lectura:** Al microscopio, las fibras del ligamento cruzan el espacio entre el cemento y el hueso y se insertan en ambos.
- **Tamaño:** 1400 × 1400 px

**Prompt:**

> Microfotografía realista de histología con tinción de hematoxilina y eosina, corte longitudinal de la interfase entre raíz dental y hueso alveolar, a la izquierda dentina y una banda delgada de cemento de tono rosado más claro, al centro el ligamento periodontal con haces de fibras de colágena ondulados y oblicuos y núcleos alargados de fibroblastos, a la derecha hueso alveolar con osteocitos en sus lagunas, campo de microscopio óptico con iluminación uniforme, enfoque nítido, colores típicos de laboratorio. Evitar: texto, flechas, escalas numéricas, etiquetas, logotipos, artefactos de tinción exagerados, aspecto de dibujo animado.

### 04 · Tema 7.1 · figura 7.1.3 · 4:3

- **Identificador:** `anatomia-dental/m07/03`
- **Qué muestra:** Manos enguantadas sostienen una sonda periodontal milimetrada junto a la encía de un premolar inferior en un modelo de estudio.
- **Pie en la lectura:** El sondaje periodontal traduce la anatomía de la inserción en números que se registran en el expediente.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica realista en primer plano de un modelo de estudio periodontal tipo tipodonto con encía de silicona rosada y dientes permanentes inferiores, unas manos con guantes de nitrilo azul introducen con suavidad una sonda periodontal metálica de punta roma en el surco vestibular de un premolar, ángulo paralelo al eje del diente, iluminación clínica blanca uniforme, fondo de consultorio desenfocado, colores naturales, nitidez alta en la punta de la sonda. Evitar: texto, números visibles, logotipos, marcas de agua, sangre, rostro de pacientes, manos sin guantes, dientes deformes.

### 05 · Tema 7.2 · figura 7.2.1 · 3:4

- **Identificador:** `anatomia-dental/m07/04`
- **Qué muestra:** Ilustración realista de un canino inferior en su alvéolo con el espacio del ligamento más ancho en la cresta y el ápice y más estrecho a la mitad de la raíz.
- **Pie en la lectura:** El ligamento es más estrecho a la altura del fulcro, cerca de la mitad de la raíz, y más ancho junto a la cresta y el ápice.
- **Tamaño:** 1200 × 1600 px

**Prompt:**

> Ilustración anatómica realista estilo atlas, corte longitudinal de un canino inferior permanente de un adulto dentro de su alvéolo, el espacio entre raíz y hueso representado como una banda rosada fina que se ensancha ligeramente cerca de la cresta alveolar y del ápice y se estrecha a la mitad de la raíz, cemento color marfil, hueso alveolar con trabéculas visibles, encía sana sobre la cresta, iluminación suave de estudio, fondo gris claro, proporciones anatómicas correctas, raíz única y larga. Evitar: texto, flechas, etiquetas, números, logotipos, sangre, raíz curva exagerada, aspecto caricaturesco.

### 06 · Tema 7.2 · figura 7.2.2 · 4:3

- **Identificador:** `anatomia-dental/m07/05`
- **Qué muestra:** Microfotografía realista con luz polarizada de haces de colágena del ligamento que se insertan en hueso.
- **Pie en la lectura:** Con luz polarizada, los haces de colágena del ligamento brillan y permiten ver su orientación oblicua y su entrada en el hueso.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Microfotografía realista de histología bajo microscopio con luz polarizada, corte de ligamento periodontal humano entre raíz y hueso alveolar, haces de fibras de colágena birrefringentes de tono amarillo dorado y naranja orientados en dirección oblicua, que penetran en el hueso como pequeños haces paralelos, fondo oscuro, contraste alto, enfoque nítido, aspecto de preparación de laboratorio universitario. Evitar: texto, escalas numéricas, flechas, etiquetas, logotipos, colores fluorescentes artificiales, aspecto de dibujo animado.

### 07 · Tema 7.2 · figura 7.2.3 · 16:9

- **Identificador:** `anatomia-dental/m07/06`
- **Qué muestra:** Ilustración realista de los vasos sanguíneos finos que rodean la raíz de un premolar dentro del hueso.
- **Pie en la lectura:** La red vascular del ligamento llega desde el ápice, desde los septos interdentales y desde la encía.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Ilustración médica realista de estilo atlas, vista lateral de un premolar inferior permanente dentro de un bloque de hueso alveolar seccionado, alrededor de la raíz una red delicada de vasos sanguíneos finos en tonos rojo oscuro y azul que llegan desde el ápice, desde perforaciones en la pared del alvéolo y desde la encía, hueso con textura trabecular realista, fondo gris claro neutro, iluminación suave de estudio, alto detalle anatómico. Evitar: texto, flechas, etiquetas, números, logotipos, sangre derramada, aspecto gráfico perturbador, raíces múltiples, colores neón.

### 08 · Tema 7.3 · figura 7.3.1 · 1:1

- **Identificador:** `anatomia-dental/m07/07`
- **Qué muestra:** Microfotografía realista del ligamento periodontal con núcleos alargados de fibroblastos y pequeños grupos de células epiteliales cerca del cemento.
- **Pie en la lectura:** Fibroblastos alineados con las fibras y, cerca del cemento, pequeños cúmulos de restos epiteliales de Malassez.
- **Tamaño:** 1400 × 1400 px

**Prompt:**

> Microfotografía realista de histología a gran aumento con tinción de hematoxilina y eosina, ligamento periodontal humano entre una franja de cemento acelular rosa pálido a la izquierda y hueso alveolar a la derecha, núcleos alargados y fusiformes de fibroblastos alineados con fibras de colágena onduladas, y cerca del cemento pequeños cúmulos redondeados de células epiteliales con núcleos oscuros, algunos capilares con eritrocitos, enfoque nítido, iluminación uniforme de microscopio óptico. Evitar: texto, escalas numéricas, flechas, etiquetas, logotipos, colores artificiales, aspecto de ilustración infantil.

### 09 · Tema 7.3 · figura 7.3.2 · 16:9

- **Identificador:** `anatomia-dental/m07/08`
- **Qué muestra:** Comparación ilustrada lado a lado de un diente natural con ligamento y un implante unido directamente al hueso.
- **Pie en la lectura:** El diente natural está suspendido por el ligamento; el implante está unido directamente al hueso, sin ligamento intermedio.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Ilustración médica realista de estilo atlas, dos cortes longitudinales lado a lado en un mismo bloque de hueso maxilar: a la izquierda un premolar natural con su raíz rodeada por una banda fina rosada de ligamento periodontal y encía sana, a la derecha un implante dental de titanio gris con roscas y su corona, en contacto directo con el hueso sin banda intermedia, hueso cortical y trabecular realistas, fondo gris claro, iluminación de estudio suave, colores naturales. Evitar: texto, flechas, etiquetas, números, logotipos, marcas comerciales, sangre, aspecto caricaturesco, proporciones irreales.

### 10 · Tema 7.3 · figura 7.3.3 · 4:3

- **Identificador:** `anatomia-dental/m07/09`
- **Qué muestra:** Manos enguantadas sostienen por la corona un incisivo central superior permanente sobre un recipiente con leche.
- **Pie en la lectura:** El diente avulsionado se sujeta por la corona y se transporta en un medio que evite que el ligamento se seque.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía realista de estudio, primer plano de unas manos con guantes de nitrilo azul que sostienen con delicadeza por la corona un incisivo central superior permanente completo con raíz larga y cónica, sobre un recipiente de plástico transparente con tapa que contiene leche, mesa clínica blanca y limpia, luz suave difusa, fondo de consultorio desenfocado, colores naturales, nitidez alta en el diente. Evitar: texto, logotipos, marcas comerciales, sangre, rostros, dedos tocando la raíz, manos sin guantes, diente deforme o con dos raíces.

### 11 · Tema 7.4 · figura 7.4.1 · 3:4

- **Identificador:** `anatomia-dental/m07/10`
- **Qué muestra:** Radiografía periapical realista de premolares inferiores con la lámina dura visible como una línea blanca alrededor de las raíces.
- **Pie en la lectura:** La lámina dura es la imagen radiográfica del hueso alveolar propio; el espacio oscuro fino que la separa de la raíz corresponde al ligamento.
- **Tamaño:** 1200 × 1600 px

**Prompt:**

> Radiografía periapical digital realista en escala de grises, región de premolares inferiores permanentes de un adulto sano, raíces únicas y rectas, una línea blanca delgada y continua que contornea cada raíz separada de ella por una línea oscura fina y uniforme, crestas alveolares a poca distancia de las uniones amelocementarias, trabeculado óseo fino en el hueso esponjoso, contraste y nitidez de calidad diagnóstica. Evitar: texto, letras, números, escalas, marcas de agua, logotipos, restauraciones metálicas, lesiones, artefactos de movimiento, aspecto de dibujo.

### 12 · Tema 7.4 · figura 7.4.2 · 4:3

- **Identificador:** `anatomia-dental/m07/11`
- **Qué muestra:** Cráneo seco de estudio visto de frente con raíces de incisivos y caninos superiores marcando relieves en la cortical vestibular.
- **Pie en la lectura:** En el maxilar anterior, las raíces forman relieves bajo una cortical vestibular muy delgada; ahí son más frecuentes dehiscencias y fenestraciones.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía realista de estudio de un cráneo humano seco de uso académico, encuadre cerrado de la región anterior del maxilar superior vista desde vestibular con dientes permanentes completos, relieves verticales de las raíces de incisivos y caninos bajo una cortical ósea fina, en un canino una pequeña ventana ovalada en el hueso que deja ver la raíz con el borde marginal intacto, iluminación lateral suave que resalta el relieve, fondo negro mate. Evitar: texto, etiquetas, flechas, logotipos, aspecto macabro o de terror, dientes faltantes, piezas deformes, tejidos blandos.

### 13 · Tema 7.4 · figura 7.4.3 · 16:9

- **Identificador:** `anatomia-dental/m07/12`
- **Qué muestra:** Modelo anatómico de una mandíbula con una zona desdentada donde el reborde es más estrecho y bajo que en las zonas con dientes.
- **Pie en la lectura:** Donde faltan dientes, el proceso alveolar se reabsorbe y el reborde queda más bajo y angosto.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía realista de estudio de un modelo anatómico de mandíbula adulta de resina con textura ósea natural, vista oblicua desde vestibular, dientes permanentes presentes en ambos lados y una zona sin primer molar en la que el reborde alveolar se ve claramente más bajo y estrecho que en las zonas vecinas con dientes, iluminación lateral suave que resalta el contorno, fondo gris neutro, enfoque nítido en el reborde. Evitar: texto, etiquetas, flechas, números, logotipos, aspecto macabro, tejidos blandos, sangre, dientes deformes.

### 14 · Tema 7.5 · figura 7.5.1 · 4:3

- **Identificador:** `anatomia-dental/m07/13`
- **Qué muestra:** Dos mangos de instrumentos metálicos apoyados en las caras vestibular y lingual de un incisivo inferior en un modelo, sostenidos por manos enguantadas.
- **Pie en la lectura:** La movilidad se evalúa con dos mangos de instrumentos rígidos, nunca con los dedos, porque la yema absorbe parte del movimiento.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica realista, primer plano de un tipodonto de estudio con dientes permanentes inferiores y encía de silicona rosada, unas manos con guantes de nitrilo azul apoyan los extremos romos de los mangos de dos instrumentos metálicos, uno por vestibular y otro por lingual, sobre la corona de un incisivo central inferior, iluminación clínica blanca uniforme, fondo de consultorio desenfocado, colores naturales, nitidez alta. Evitar: texto, números, logotipos, marcas comerciales, sangre, rostros, manos sin guantes, puntas afiladas apoyadas en la encía, dientes deformes.

### 15 · Tema 7.5 · figura 7.5.2 · 16:9

- **Identificador:** `anatomia-dental/m07/14`
- **Qué muestra:** Arcada superior de un adolescente con brackets metálicos y arco, vista desde oclusal con espejo.
- **Pie en la lectura:** Durante la ortodoncia, cada diente se mueve porque el ligamento y el hueso alveolar se remodelan alrededor de su raíz.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía clínica intraoral realista vista oclusal con espejo de la arcada superior permanente de un adolescente, brackets metálicos pequeños adheridos a premolares, caninos e incisivos con un arco de alambre fino y ligaduras transparentes, primeros y segundos molares con tubos, encía rosa sana, superficie dental limpia, iluminación clínica uniforme, colores naturales, alta nitidez. Evitar: texto, logotipos, marcas comerciales, sangre, labios o rostro visibles, dientes faltantes, número incorrecto de dientes, aparatos deformes, caries visibles.

### 16 · Tema 7.5 · figura 7.5.3 · 4:3

- **Identificador:** `anatomia-dental/m07/15`
- **Qué muestra:** Manos enguantadas colocan papel de articular entre los dientes posteriores de un modelo articulado.
- **Pie en la lectura:** El papel de articular revela los contactos oclusales que pueden sobrecargar el periodonto de un diente.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica realista de primer plano, modelos de yeso de arcadas permanentes superior e inferior montados en un articulador semiajustable, unas manos con guantes de nitrilo azul sostienen con pinzas una tira delgada de papel de articular de color azul entre los molares, mesa de laboratorio dental limpia, iluminación blanca difusa, fondo desenfocado, colores naturales, enfoque nítido en los molares. Evitar: texto, números, logotipos, marcas comerciales, rostros, manos sin guantes, dientes deformes, modelos rotos, desorden.

## Módulo 8 · Nomenclatura dental y sistemas de numeración FDI y universal

Carpeta: `imagenes-academia/01-anatomia-dental/modulo-08/` · 16 imágenes (7 de 16:9, 2 de 1:1, 7 de 4:3).

### 01 · Portada del módulo · 16:9

- **Identificador:** `anatomia-dental/m08/portada`
- **Qué muestra:** Tipodonto de dentición permanente completa visto desde arriba sobre una mesa clínica, junto a un espejo bucal y una sonda.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía realista de estudio en gran formato, tipodonto de enseñanza con las arcadas superior e inferior abiertas una junto a la otra, vistas desde oclusal, dentición permanente completa de treinta y dos dientes con anatomía correcta de cada grupo, encía de silicona rosada, sobre una mesa clínica blanca con un espejo bucal y una sonda de punta roma acomodados en paralelo, iluminación difusa cenital suave, colores naturales, composición limpia y ordenada. Evitar: texto, números, etiquetas adhesivas, logotipos, marcas comerciales, rostros, manos, dientes faltantes o deformes.

### 02 · Tema 8.1 · figura 8.1.1 · 16:9

- **Identificador:** `anatomia-dental/m08/01`
- **Qué muestra:** Arcada superior permanente completa de un adulto vista desde oclusal, con todos los grupos dentarios visibles.
- **Pie en la lectura:** Una arcada permanente completa: incisivos y caninos al frente, premolares y molares en el sector posterior.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía clínica intraoral realista vista oclusal con espejo de la arcada superior permanente completa de un adulto joven, dieciséis dientes sanos en forma de U, incisivos centrales y laterales, caninos, primeros y segundos premolares, primeros, segundos y terceros molares con anatomía correcta de cúspides y fosas, paladar rosado con rugas palatinas, iluminación clínica uniforme, colores naturales, enfoque nítido de toda la arcada. Evitar: texto, números, etiquetas, logotipos, restauraciones metálicas, caries, sangre, labios o rostro, número incorrecto de dientes.

### 03 · Tema 8.1 · figura 8.1.2 · 1:1

- **Identificador:** `anatomia-dental/m08/02`
- **Qué muestra:** Primer molar inferior permanente aislado sobre fondo neutro, en vista ligeramente oblicua que muestra las caras oclusal, vestibular y mesial.
- **Pie en la lectura:** En una vista oblicua se aprecian tres caras de un molar y los ángulos que se forman donde se unen.
- **Tamaño:** 1400 × 1400 px

**Prompt:**

> Fotografía macro de estudio de un primer molar inferior permanente humano extraído, limpio y sano, colocado sobre un soporte en fondo gris neutro, vista oblicua desde mesio-vestíbulo-oclusal que muestra la cara oclusal con sus cinco cúspides, la cara vestibular con su surco y la cara mesial convexa, dos raíces mesial y distal visibles, esmalte con brillo natural, iluminación difusa uniforme, profundidad de campo amplia. Evitar: texto, flechas, etiquetas, números, logotipos, sangre, restos de tejido, caries, número incorrecto de cúspides o raíces.

### 04 · Tema 8.1 · figura 8.1.3 · 4:3

- **Identificador:** `anatomia-dental/m08/03`
- **Qué muestra:** Incisivos superiores permanentes vistos de frente, con las áreas de contacto entre ellos y las papilas llenando los espacios gingivales.
- **Pie en la lectura:** Las áreas de contacto y las troneras: en salud, la papila interdental ocupa la tronera gingival.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica intraoral realista en vista frontal de los cuatro incisivos superiores permanentes de un adulto joven con labios separados por retractores transparentes, contactos interproximales cerrados, espacios en forma de V por incisal y papilas interdentales rosadas y puntiagudas que llenan los espacios hacia la encía, encía sana con textura de cáscara de naranja, iluminación clínica uniforme con flash anular, colores naturales, enfoque nítido. Evitar: texto, números, etiquetas, logotipos, rostro completo, sangre, caries, restauraciones, diastemas exagerados, dientes deformes.

### 05 · Tema 8.2 · figura 8.2.1 · 16:9

- **Identificador:** `anatomia-dental/m08/04`
- **Qué muestra:** Manos enguantadas sostienen un tipodonto de dentición permanente completa visto de frente, con ambas arcadas en oclusión.
- **Pie en la lectura:** Antes de usar un sistema de numeración, ubica los cuatro cuadrantes en un modelo: el superior derecho del paciente queda a tu izquierda.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía realista de estudio, unas manos con guantes de nitrilo azul sostienen de frente un tipodonto de enseñanza con dentición permanente completa de treinta y dos dientes en oclusión, encía de silicona rosada, dientes blancos con anatomía correcta, vista frontal centrada en la línea media, fondo blanco limpio de laboratorio, iluminación difusa uniforme, colores naturales, nitidez alta. Evitar: texto, números, etiquetas adhesivas, logotipos, marcas comerciales, rostros, manos sin guantes, dientes faltantes, dientes deformes.

### 06 · Tema 8.2 · figura 8.2.2 · 4:3

- **Identificador:** `anatomia-dental/m08/05`
- **Qué muestra:** Vista oclusal de la arcada inferior de un niño en dentición mixta, con primeros molares permanentes junto a molares temporales.
- **Pie en la lectura:** En dentición mixta conviven códigos de ambas denticiones en el mismo cuadrante: por ejemplo 36 junto a 75 y 74.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica intraoral realista vista oclusal con espejo de la arcada inferior de un niño de unos ocho años en dentición mixta: incisivos permanentes inferiores recién erupcionados con bordes ligeramente ondulados, caninos temporales, primeros y segundos molares temporales más pequeños y blancos, y primeros molares permanentes completos en los extremos, lengua relajada fuera de foco, encía rosa sana, iluminación clínica uniforme, colores naturales. Evitar: texto, números, etiquetas, logotipos, labios o rostro, sangre, caries extensas, número incorrecto de dientes, dientes deformes.

### 07 · Tema 8.2 · figura 8.2.3 · 4:3

- **Identificador:** `anatomia-dental/m08/06`
- **Qué muestra:** Radiografía periapical de un niño con un molar temporal inferior cuyas raíces se reabsorben sobre el germen de un premolar.
- **Pie en la lectura:** Cuando la morfología no basta, la radiografía confirma la identidad: aquí, un molar temporal con un premolar en formación por debajo.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Radiografía periapical digital realista en escala de grises de la región posterior inferior de un niño de unos nueve años, un segundo molar temporal con raíces divergentes parcialmente reabsorbidas que abrazan desde arriba el germen de un segundo premolar con corona formada y raíz incipiente, por detrás un primer molar permanente erupcionado con raíces en formación y ápices abiertos, hueso trabecular fino, contraste y nitidez de calidad diagnóstica. Evitar: texto, letras, números, escalas, marcas de agua, logotipos, restauraciones, artefactos, aspecto de dibujo.

### 08 · Tema 8.3 · figura 8.3.1 · 16:9

- **Identificador:** `anatomia-dental/m08/07`
- **Qué muestra:** Monitor de una computadora en un consultorio mostrando un odontograma digital sin texto legible, con manos enguantadas cerca del ratón.
- **Pie en la lectura:** Muchos programas clínicos permiten elegir el sistema de numeración: verifica cuál está configurado antes de registrar.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía realista de un consultorio dental moderno, primer plano de un monitor sobre un brazo articulado junto a la unidad dental que muestra un odontograma digital esquemático con dos filas de siluetas de dientes en colores suaves, sin letras ni números legibles, una mano con guante de nitrilo azul sobre un ratón inalámbrico en primer plano desenfocado, iluminación blanca limpia, fondo de consultorio ordenado, colores naturales. Evitar: texto legible, números legibles, logotipos, marcas comerciales, rostros, pantallas con interfaces de marcas reales, desorden, manos sin guantes.

### 09 · Tema 8.3 · figura 8.3.2 · 4:3

- **Identificador:** `anatomia-dental/m08/08`
- **Qué muestra:** Vista oclusal de la arcada inferior de un adulto con una corona metal-porcelana en el primer molar derecho.
- **Pie en la lectura:** El primer molar inferior derecho: 46 en FDI y 30 en el sistema universal.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica intraoral realista en vista oclusal con espejo de la arcada inferior permanente de un adulto de mediana edad, catorce dientes presentes sin terceros molares, el primer molar inferior derecho con una corona de cerámica de color natural bien ajustada, el resto de los dientes sanos con anatomía correcta, lengua relajada fuera de foco, encía rosa sana, iluminación clínica uniforme, colores naturales, alta nitidez. Evitar: texto, números, etiquetas, logotipos, labios o rostro, sangre, caries extensas, número incorrecto de dientes, dientes deformes.

### 10 · Tema 8.3 · figura 8.3.3 · 16:9

- **Identificador:** `anatomia-dental/m08/09`
- **Qué muestra:** Radiografía panorámica de un adulto joven con dentición permanente completa, incluidos los cuatro terceros molares.
- **Pie en la lectura:** Una dentición permanente completa: en el sistema universal, del 1 en el extremo superior derecho al 32 en el inferior derecho.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Radiografía panorámica digital realista en escala de grises de un adulto joven con dentición permanente completa de treinta y dos dientes, incluidos cuatro terceros molares erupcionados y alineados, raíces completas, cóndilos mandibulares, senos maxilares y conducto mandibular visibles con anatomía correcta, contraste y nitidez de calidad diagnóstica, imagen centrada y simétrica. Evitar: texto, letras, números, marcadores de lado, escalas, marcas de agua, logotipos, restauraciones metálicas, implantes, artefactos de movimiento.

### 11 · Tema 8.4 · figura 8.4.1 · 4:3

- **Identificador:** `anatomia-dental/m08/10`
- **Qué muestra:** Odontólogo con cubrebocas y lentes de protección revisa modelos de estudio de yeso sobre una mesa, sosteniéndolos con guantes.
- **Pie en la lectura:** En ortodoncia y cirugía bucal de algunos países todavía es habitual anotar los dientes con el sistema de Palmer.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía realista en un consultorio de ortodoncia luminoso, un odontólogo adulto con cubrebocas quirúrgico, lentes de protección, gorro y bata clara sostiene con guantes de nitrilo azul un par de modelos de estudio de yeso blanco con dentición permanente completa en oclusión, observándolos de frente sobre una mesa limpia con otros modelos desenfocados al fondo, luz natural difusa, colores naturales, encuadre a la altura del pecho. Evitar: texto, letreros, logotipos, marcas comerciales, rostro descubierto, manos sin guantes, modelos rotos, dientes deformes.

### 12 · Tema 8.4 · figura 8.4.2 · 16:9

- **Identificador:** `anatomia-dental/m08/11`
- **Qué muestra:** Colección didáctica de dientes permanentes extraídos ordenados en forma de arcada sobre una tela oscura.
- **Pie en la lectura:** Ordenar dientes de una colección didáctica en su posición de arcada es un buen ejercicio para practicar los tres sistemas.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía realista de estudio de una colección didáctica de dientes humanos permanentes extraídos, limpios y secos, ordenados en forma de arcada superior en U sobre una tela de terciopelo gris oscuro, desde los incisivos centrales al frente hasta los molares en los extremos, con coronas y raíces completas y anatomía correcta de cada grupo, iluminación difusa cenital, vista desde arriba ligeramente oblicua, enfoque nítido. Evitar: texto, etiquetas, números, flechas, logotipos, sangre, restos de tejido, aspecto macabro, dientes deformes o repetidos.

### 13 · Tema 8.4 · figura 8.4.3 · 1:1

- **Identificador:** `anatomia-dental/m08/12`
- **Qué muestra:** Primeros premolares superior e inferior permanentes extraídos colocados uno junto al otro sobre fondo gris.
- **Pie en la lectura:** Primeros premolares superior e inferior: 4 en Palmer, 14 y 44 o 24 y 34 en FDI según el lado.
- **Tamaño:** 1400 × 1400 px

**Prompt:**

> Fotografía macro de estudio sobre fondo gris neutro de dos premolares humanos permanentes extraídos, limpios y sanos, colocados uno junto al otro en vista vestibular: a la izquierda un primer premolar superior con dos cúspides de altura similar y dos raíces, a la derecha un primer premolar inferior con cúspide vestibular dominante y raíz única, esmalte con brillo natural, iluminación difusa uniforme, enfoque nítido. Evitar: texto, etiquetas, números, flechas, logotipos, sangre, restos de tejido, caries, anatomía incorrecta de cúspides o raíces.

### 14 · Tema 8.5 · figura 8.5.1 · 4:3

- **Identificador:** `anatomia-dental/m08/13`
- **Qué muestra:** Asistente dental con guantes y cubrebocas registra datos en una tableta junto a la unidad dental, sin texto visible en la pantalla.
- **Pie en la lectura:** El registro se hace en el momento, dictado por el operador y confirmado por quien escribe.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía realista en un consultorio dental limpio y luminoso, una asistente dental con cubrebocas, gorro, lentes de protección, bata y guantes de nitrilo sostiene una tableta con una funda de plástico protectora junto a la unidad dental, la pantalla muestra siluetas esquemáticas de dientes sin letras ni números legibles, al fondo desenfocado un operador con equipo de protección completo frente a un paciente reclinado del que no se ve el rostro, luz natural difusa, colores naturales. Evitar: texto legible, números legibles, logotipos, marcas comerciales, rostros descubiertos, manos sin guantes, desorden.

### 15 · Tema 8.5 · figura 8.5.2 · 16:9

- **Identificador:** `anatomia-dental/m08/14`
- **Qué muestra:** Operador y asistente con equipo de protección completo revisan juntos una radiografía en un monitor antes de iniciar un procedimiento.
- **Pie en la lectura:** La pausa de verificación: el equipo confirma el diente con la radiografía y el expediente antes de empezar.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía realista en un consultorio dental moderno, un odontólogo y una asistente con cubrebocas, gorro, lentes de protección, batas y guantes de nitrilo observan juntos un monitor que muestra una radiografía periapical en escala de grises sin texto, uno de ellos señala la imagen sin tocar la pantalla, al fondo la unidad dental con un paciente reclinado cubierto con babero del que no se ve el rostro, iluminación clínica blanca, colores naturales. Evitar: texto legible, números legibles, logotipos, marcas comerciales, rostros descubiertos, manos sin guantes, sangre, instrumental en uso.

### 16 · Tema 8.5 · figura 8.5.3 · 4:3

- **Identificador:** `anatomia-dental/m08/15`
- **Qué muestra:** Vista intraoral frontal de un adolescente con un canino temporal superior retenido junto a un incisivo lateral permanente.
- **Pie en la lectura:** Un canino temporal retenido conserva su código temporal aunque el paciente sea adolescente.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica intraoral realista en vista frontal con retractores de labios transparentes de un adolescente con dentición permanente, en el lado superior derecho del paciente un canino temporal pequeño, de corona corta y más blanca, ubicado entre el incisivo lateral permanente y el primer premolar, el resto de los dientes permanentes alineados y sanos, encía rosa sana, iluminación clínica con flash, colores naturales, alta nitidez. Evitar: texto, números, etiquetas, logotipos, rostro completo, sangre, caries extensas, número incorrecto de dientes, dientes deformes.

## Módulo 9 · Dentición temporal y cronología de la erupción

Carpeta: `imagenes-academia/01-anatomia-dental/modulo-09/` · 16 imágenes (6 de 16:9, 6 de 4:3, 2 de 1:1, 2 de 3:4).

### 01 · Portada del módulo · 16:9

- **Identificador:** `anatomia-dental/m09/portada`
- **Qué muestra:** Sonrisa de un niño en dentición mixta con incisivos permanentes nuevos junto a caninos temporales, en encuadre que solo muestra la boca.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía realista de gran formato en primer plano de la sonrisa de un niño de unos ocho años, encuadre que solo muestra labios, dientes y barbilla sin ojos ni nariz, dentición mixta con incisivos centrales superiores permanentes grandes de bordes ondulados, un espacio donde se cayó un incisivo lateral temporal y caninos temporales pequeños y blancos, encía rosa sana, luz natural cálida y suave, fondo desenfocado en tonos claros, colores naturales. Evitar: texto, logotipos, rostro identificable, ojos, sangre, caries, aparatos de ortodoncia, dientes deformes.

### 02 · Tema 9.1 · figura 9.1.1 · 4:3

- **Identificador:** `anatomia-dental/m09/01`
- **Qué muestra:** Sonrisa en primer plano de un niño pequeño con dentición temporal completa, sin mostrar ojos ni rostro completo.
- **Pie en la lectura:** La dentición temporal completa: 20 dientes pequeños, blancos y a menudo con espacios entre ellos.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica realista en primer plano de la boca de un niño de unos cuatro años sonriendo, encuadre que solo muestra labios y dientes sin ojos ni nariz, dentición temporal completa con incisivos pequeños y muy blancos, espacios fisiológicos visibles entre los incisivos, caninos temporales con punta definida, encía rosa sana, iluminación suave y natural, fondo desenfocado claro, colores naturales. Evitar: texto, logotipos, rostro identificable, ojos, caries, sangre, aparatos de ortodoncia, dientes permanentes, número incorrecto de dientes.

### 03 · Tema 9.1 · figura 9.1.2 · 1:1

- **Identificador:** `anatomia-dental/m09/02`
- **Qué muestra:** Microfotografía de esmalte dental con una línea oscura de crecimiento más marcada que las demás.
- **Pie en la lectura:** Al microscopio, la línea neonatal se ve como una estría más marcada que separa el esmalte prenatal del posnatal.
- **Tamaño:** 1400 × 1400 px

**Prompt:**

> Microfotografía realista de una lámina delgada de esmalte de un incisivo temporal humano vista con microscopio óptico de luz transmitida, se observan finas estrías incrementales paralelas en tonos marrón y ámbar y una sola línea oscura más gruesa y marcada que las cruza a la misma altura, textura prismática sutil, fondo uniforme, enfoque nítido y contraste moderado, aspecto de preparación histológica de laboratorio universitario. Evitar: texto, escalas numéricas, flechas, etiquetas, logotipos, colores artificiales, aspecto de dibujo.

### 04 · Tema 9.1 · figura 9.1.3 · 16:9

- **Identificador:** `anatomia-dental/m09/03`
- **Qué muestra:** Manos de una madre limpian con una gasa los primeros incisivos inferiores de un bebé, en encuadre que solo muestra boca y manos.
- **Pie en la lectura:** La higiene empieza con el primer diente: la orientación a la familia es parte del cuidado de la dentición temporal.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía realista y cálida en un hogar con luz natural suave, encuadre cerrado de las manos de una persona adulta que limpian con una gasa húmeda enrollada en el dedo índice los dos primeros incisivos inferiores temporales de un bebé de unos ocho meses, solo se ven la boca entreabierta, la barbilla y las manos, encía rosa sana, colores naturales y tonos suaves. Evitar: texto, logotipos, marcas comerciales, rostro del bebé o del adulto, ojos, sangre, llanto, dientes de más, objetos peligrosos.

### 05 · Tema 9.2 · figura 9.2.1 · 16:9

- **Identificador:** `anatomia-dental/m09/04`
- **Qué muestra:** Un segundo molar temporal inferior extraído junto a un primer molar permanente inferior sobre fondo gris, en vista vestibular.
- **Pie en la lectura:** El molar temporal es más pequeño, más blanco, con un cuello estrecho y raíces delgadas y muy separadas.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía macro de estudio sobre fondo gris neutro de dos molares humanos extraídos, limpios y sanos, colocados lado a lado en vista vestibular: a la izquierda un segundo molar temporal inferior pequeño, blanco lechoso, con cuello muy estrecho, cresta cervical marcada y dos raíces largas, delgadas y muy divergentes; a la derecha un primer molar permanente inferior más grande, de tono marfil, con dos raíces más gruesas y menos separadas, iluminación difusa uniforme, enfoque nítido. Evitar: texto, etiquetas, números, flechas, logotipos, sangre, restos de tejido, caries, anatomía incorrecta de cúspides o raíces.

### 06 · Tema 9.2 · figura 9.2.2 · 4:3

- **Identificador:** `anatomia-dental/m09/05`
- **Qué muestra:** Arcada superior de un niño de cinco años vista desde oclusal con espejo, mostrando incisivos, caninos y molares temporales.
- **Pie en la lectura:** Arcada superior temporal: el segundo molar se parece a un primer molar permanente en miniatura.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica intraoral realista vista oclusal con espejo de la arcada superior temporal completa de un niño de unos cinco años, diez dientes blancos lechosos en forma de semicírculo amplio con espacios entre los incisivos, caninos con cúspide puntiaguda, primeros molares temporales más pequeños y segundos molares temporales con cuatro cúspides y forma de molar permanente en miniatura, paladar rosado, iluminación clínica uniforme, colores naturales. Evitar: texto, números, etiquetas, logotipos, labios o rostro, sangre, caries, dientes permanentes, número incorrecto de dientes.

### 07 · Tema 9.2 · figura 9.2.3 · 3:4

- **Identificador:** `anatomia-dental/m09/06`
- **Qué muestra:** Radiografía periapical de un molar temporal inferior con cámara pulpar amplia y raíces divergentes que rodean el germen de un premolar.
- **Pie en la lectura:** En la radiografía se aprecian la cámara pulpar amplia del molar temporal y el germen del premolar entre sus raíces.
- **Tamaño:** 1200 × 1600 px

**Prompt:**

> Radiografía periapical digital realista en escala de grises de la región de molares inferiores de un niño de unos seis años, primer molar temporal con esmalte delgado, cámara pulpar amplia y cuernos pulpares altos, raíces delgadas y divergentes que rodean el germen de un primer premolar con su corona en formación dentro de una cripta radiolúcida bien delimitada, hueso trabecular fino, contraste y nitidez de calidad diagnóstica. Evitar: texto, letras, números, escalas, marcas de agua, logotipos, restauraciones, lesiones, artefactos, aspecto de dibujo.

### 08 · Tema 9.3 · figura 9.3.1 · 4:3

- **Identificador:** `anatomia-dental/m09/07`
- **Qué muestra:** Primer plano de la boca de un bebé con los dos incisivos centrales inferiores recién emergidos.
- **Pie en la lectura:** Los incisivos centrales inferiores suelen ser los primeros dientes temporales en aparecer.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía realista y tierna en primer plano de la boca entreabierta de un bebé de unos siete meses, encuadre que solo muestra labios, encía y barbilla sin ojos ni nariz, dos incisivos centrales inferiores temporales pequeños y muy blancos recién emergidos de una encía rosada y sana, saliva natural, luz de ventana suave, fondo desenfocado en tonos claros, colores naturales. Evitar: texto, logotipos, rostro identificable, ojos, sangre, llanto, dientes superiores ya erupcionados, objetos en la boca, número incorrecto de dientes.

### 09 · Tema 9.3 · figura 9.3.2 · 4:3

- **Identificador:** `anatomia-dental/m09/08`
- **Qué muestra:** Incisivos inferiores de un niño con un incisivo permanente emergiendo por detrás de los incisivos temporales.
- **Pie en la lectura:** Un incisivo permanente inferior que emerge por lingual del temporal: hallazgo frecuente que suele resolverse cuando el temporal se cae.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica intraoral realista en vista frontal ligeramente desde arriba de la región anterior inferior de un niño de unos seis años, con los labios separados por retractores pequeños, dos incisivos centrales inferiores temporales blancos y pequeños todavía en su lugar y, por detrás de ellos, un incisivo central permanente más grande con bordes ondulados emergiendo por lingual, encía rosa sana, iluminación clínica uniforme, colores naturales. Evitar: texto, números, logotipos, rostro, ojos, sangre, caries, instrumental, número incorrecto de dientes, dientes deformes.

### 10 · Tema 9.3 · figura 9.3.3 · 1:1

- **Identificador:** `anatomia-dental/m09/09`
- **Qué muestra:** Incisivo temporal recién exfoliado sobre un pañuelo blanco, con su raíz casi completamente reabsorbida.
- **Pie en la lectura:** Un incisivo temporal exfoliado: de su raíz queda muy poco porque fue reabsorbida por el avance del permanente.
- **Tamaño:** 1400 × 1400 px

**Prompt:**

> Fotografía macro de estudio de un incisivo central temporal humano recién caído, limpio, colocado sobre un pañuelo de tela blanca, corona pequeña y blanca intacta y la raíz casi completamente reabsorbida con un borde irregular en forma de cuenco, iluminación natural suave y difusa, fondo blanco, enfoque nítido en el diente, tonos cálidos y amables. Evitar: texto, etiquetas, números, logotipos, sangre, restos de tejido, aspecto macabro, raíz larga completa, caries.

### 11 · Tema 9.4 · figura 9.4.1 · 16:9

- **Identificador:** `anatomia-dental/m09/10`
- **Qué muestra:** Radiografía panorámica de un niño de unos nueve años con dientes temporales y gérmenes permanentes en distintos grados de desarrollo.
- **Pie en la lectura:** La panorámica en dentición mixta muestra al mismo tiempo los dientes temporales en boca y los permanentes que se forman debajo.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Radiografía panorámica digital realista en escala de grises de un niño de unos nueve años en dentición mixta, incisivos y primeros molares permanentes erupcionados con raíces todavía en formación y ápices abiertos, caninos y molares temporales en boca con raíces en reabsorción, y por debajo los gérmenes de caninos, premolares y segundos molares permanentes en sus criptas, anatomía simétrica y correcta, calidad diagnóstica. Evitar: texto, letras, números, marcadores de lado, escalas, marcas de agua, logotipos, restauraciones metálicas, aparatos de ortodoncia, artefactos.

### 12 · Tema 9.4 · figura 9.4.2 · 4:3

- **Identificador:** `anatomia-dental/m09/11`
- **Qué muestra:** Incisivos centrales superiores permanentes de un niño con diastema en la línea media y coronas inclinadas hacia distal.
- **Pie en la lectura:** La etapa del «patito feo»: un diastema transitorio entre los incisivos centrales superiores durante la dentición mixta.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica intraoral realista en vista frontal de un niño de unos nueve años con los labios separados por retractores pequeños, incisivos centrales superiores permanentes grandes con bordes ligeramente ondulados, separados por un espacio en la línea media y con las coronas inclinadas hacia los lados en forma de abanico, incisivos laterales permanentes recién erupcionados, caninos temporales pequeños, encía rosa sana, iluminación clínica uniforme, colores naturales. Evitar: texto, números, logotipos, rostro, ojos, sangre, caries, aparatos de ortodoncia, número incorrecto de dientes.

### 13 · Tema 9.4 · figura 9.4.3 · 3:4

- **Identificador:** `anatomia-dental/m09/12`
- **Qué muestra:** Radiografía periapical de incisivos permanentes superiores de un niño con ápices abiertos en forma de embudo.
- **Pie en la lectura:** Incisivos recién erupcionados con ápices todavía abiertos: la raíz terminará de formarse en los siguientes dos o tres años.
- **Tamaño:** 1200 × 1600 px

**Prompt:**

> Radiografía periapical digital realista en escala de grises de la región anterior superior de un niño de unos ocho años, dos incisivos centrales permanentes erupcionados con raíces cortas de paredes delgadas que terminan en ápices amplios y abiertos en forma de embudo, cámaras pulpares grandes, por encima y a los lados los gérmenes de los caninos permanentes, hueso trabecular fino, contraste y nitidez de calidad diagnóstica. Evitar: texto, letras, números, escalas, marcas de agua, logotipos, restauraciones, fracturas, lesiones, aspecto de dibujo.

### 14 · Tema 9.5 · figura 9.5.1 · 16:9

- **Identificador:** `anatomia-dental/m09/13`
- **Qué muestra:** Arcadas temporales de un niño en oclusión vistas de frente, con espacios entre los incisivos y junto a los caninos.
- **Pie en la lectura:** Una dentición temporal con espacios: una reserva valiosa para acomodar a los incisivos permanentes.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía clínica intraoral realista en vista frontal con retractores de labios de un niño de unos cuatro años con dentición temporal completa en oclusión, incisivos superiores e inferiores pequeños y blancos con espacios visibles entre ellos, un espacio más amplio por mesial de los caninos superiores y por distal de los caninos inferiores, encía rosa sana, iluminación clínica uniforme con flash, colores naturales, alta nitidez. Evitar: texto, números, logotipos, rostro, ojos, sangre, caries, dientes permanentes, aparatos, número incorrecto de dientes.

### 15 · Tema 9.5 · figura 9.5.2 · 4:3

- **Identificador:** `anatomia-dental/m09/14`
- **Qué muestra:** Modelo de estudio de la arcada inferior de un niño con un espacio de extracción reducido entre el primer molar temporal y el primer molar permanente.
- **Pie en la lectura:** Tras la pérdida prematura de un segundo molar temporal, el primer molar permanente puede inclinarse hacia el espacio y reducirlo.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía realista de estudio de un modelo de yeso blanco de la arcada inferior de un niño en dentición mixta, vista oclusal ligeramente oblicua, en un lado falta el segundo molar temporal y el primer molar permanente aparece inclinado hacia mesial reduciendo el espacio disponible, en el otro lado la secuencia de canino, primer y segundo molares temporales y primer molar permanente está completa, iluminación difusa, fondo gris neutro, nitidez alta. Evitar: texto, números, etiquetas, logotipos, manos, rostros, modelos rotos, dientes deformes, aparatos.

### 16 · Tema 9.5 · figura 9.5.3 · 16:9

- **Identificador:** `anatomia-dental/m09/15`
- **Qué muestra:** Vista lateral de modelos de estudio de un niño en oclusión que muestra la relación entre los segundos molares temporales.
- **Pie en la lectura:** En los modelos en oclusión puede observarse el plano terminal de los segundos molares temporales.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía realista de estudio en vista lateral de un par de modelos de yeso blanco de un niño de unos cinco años con dentición temporal completa, montados en oclusión sobre una base, encuadre centrado en la zona posterior donde se aprecian los segundos molares temporales superior e inferior con sus caras distales alineadas en un mismo plano vertical, iluminación lateral suave que marca el relieve, fondo gris oscuro, enfoque nítido. Evitar: texto, líneas dibujadas, números, etiquetas, logotipos, manos, rostros, modelos rotos, dientes permanentes, dientes deformes.

## Módulo 10 · Anatomía de incisivos y caninos permanentes

Carpeta: `imagenes-academia/01-anatomia-dental/modulo-10/` · 16 imágenes (5 de 16:9, 3 de 3:4, 7 de 4:3, 1 de 1:1).

### 01 · Portada del módulo · 16:9

- **Identificador:** `anatomia-dental/m10/portada`
- **Qué muestra:** Incisivos y caninos permanentes extraídos ordenados en abanico sobre una superficie neutra junto a un tipodonto.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Ilustración realista de gran formato para portada educativa: sobre una superficie de laboratorio gris mate, una hilera en abanico de incisivos centrales, laterales y caninos permanentes superiores e inferiores, extraídos, limpios y con anatomía correcta, vistos desde vestibular, con las raíces de los caninos claramente más largas; al fondo, desenfocado, un tipodonto de arcada superior completo. Iluminación de estudio suave y lateral que resalta el relieve del esmalte, colores naturales, profundidad de campo corta. Evitar: texto, etiquetas, logotipos, marcas de agua, sangre, restos de tejido, rostros, dientes deformes, número de raíces incorrecto.

### 02 · Tema 10.1 · figura 10.1.1 · 3:4

- **Identificador:** `anatomia-dental/m10/01`
- **Qué muestra:** Incisivo central superior derecho extraído, visto desde vestibular sobre fondo gris neutro, con corona en forma de pala y raíz cónica.
- **Pie en la lectura:** Vista vestibular del incisivo central superior derecho: corona trapezoidal, ángulo mesioincisal casi recto y ángulo distoincisal redondeado.
- **Tamaño:** 1200 × 1600 px

**Prompt:**

> Ilustración realista de estudio de un incisivo central superior permanente derecho de adulto, limpio y extraído, colocado en posición vertical con la corona hacia abajo como en la boca, visto exactamente desde vestibular sobre fondo gris neutro liso. Corona trapezoidal más ancha en incisal que en cervical, contorno mesial casi recto, ángulo distoincisal redondeado, dos depresiones verticales tenues en el esmalte, línea cervical curva, raíz cónica única de longitud algo mayor que la corona y ápice romo. Iluminación difusa de estudio, colores naturales de esmalte y cemento, enfoque nítido. Evitar: texto, etiquetas, flechas, logotipos, sangre, restos de tejido, caries, dientes deformes, raíces dobles.

### 03 · Tema 10.1 · figura 10.1.2 · 4:3

- **Identificador:** `anatomia-dental/m10/02`
- **Qué muestra:** Incisivo central superior visto desde mesial, con corona en forma de cuña y línea cervical muy curvada hacia incisal.
- **Pie en la lectura:** Vista mesial: perfil en cuña, cíngulo palatino y la curvatura cervical más pronunciada de toda la dentición.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Ilustración realista de estudio de un incisivo central superior permanente extraído, visto exactamente desde su cara mesial, colocado vertical con la corona hacia abajo sobre fondo gris claro. Corona de perfil triangular en cuña con el borde incisal alineado sobre el eje de la raíz, convexidad vestibular suave, cíngulo palatino visible en el tercio cervical, línea amelocementaria marcadamente curvada hacia incisal, raíz cónica única que se estrecha hacia un ápice romo. Luz difusa lateral que resalta el relieve, colores naturales, alta nitidez. Evitar: texto, etiquetas, flechas, logotipos, sangre, restos de ligamento, fracturas, caries, raíces dobles, proporciones irreales.

### 04 · Tema 10.1 · figura 10.1.3 · 16:9

- **Identificador:** `anatomia-dental/m10/03`
- **Qué muestra:** Encuadre de la boca de un adulto sonriendo con los incisivos centrales superiores al centro, sin mostrar el rostro.
- **Pie en la lectura:** En boca, el central superior domina la sonrisa: su forma, proporción y textura son la referencia de cualquier tratamiento estético anterior.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía clínica realista en encuadre cerrado de la boca de una persona adulta sonriendo, solo labios y dientes visibles, sin nariz ni ojos. Incisivos centrales superiores permanentes al centro, sanos, con proporción natural ancho/alto cercana a 80 %, textura de periquimatías visible al contraluz, laterales y caninos a los lados con contornos gingivales armoniosos, encía rosa pálido sana, iluminación de flash anular suave, fondo neutro. Colores naturales, nitidez alta. Evitar: texto, logotipos, marcas de agua, rostro completo, dientes blanqueados de forma artificial, sangre, ortodoncia, labial exagerado, dientes deformes.

### 05 · Tema 10.2 · figura 10.2.1 · 4:3

- **Identificador:** `anatomia-dental/m10/04`
- **Qué muestra:** Incisivo central y lateral superiores derechos extraídos, colocados lado a lado y vistos desde vestibular para comparar tamaño y ángulos.
- **Pie en la lectura:** Central y lateral superiores lado a lado: el lateral es más estrecho, más corto de corona y con ambos ángulos incisales más redondeados.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Ilustración realista de estudio de dos dientes permanentes superiores derechos extraídos colocados lado a lado en posición anatómica, con la corona hacia abajo, vistos desde vestibular sobre fondo gris neutro: a la izquierda un incisivo central ancho con ángulo mesioincisal recto, a la derecha un incisivo lateral más estrecho, de corona más corta, con ángulo distoincisal muy redondeado y raíz cónica delgada ligeramente curvada a distal en el ápice. Iluminación difusa de estudio, colores naturales del esmalte y cemento, nitidez alta. Evitar: texto, etiquetas, flechas, logotipos, sangre, restos de tejido, caries, dientes deformes, raíces dobles.

### 06 · Tema 10.2 · figura 10.2.2 · 1:1

- **Identificador:** `anatomia-dental/m10/05`
- **Qué muestra:** Tipodonto superior visto de frente con un incisivo lateral derecho conoide más pequeño que el contralateral.
- **Pie en la lectura:** Lateral conoide en un tipodonto: la forma en clavija y el espacio a ambos lados son típicos de esta variante.
- **Tamaño:** 1400 × 1400 px

**Prompt:**

> Fotografía realista de estudio de un tipodonto de arcada superior permanente de adulto visto de frente en ligera vista oclusal, dientes de resina con color natural de esmalte, el incisivo lateral derecho de forma conoide en clavija, más corto y estrecho que el izquierdo, con pequeños espacios a sus lados, el resto de los dientes con anatomía normal y bien alineados, encía artificial rosa, iluminación difusa uniforme, fondo blanco neutro. Evitar: texto, etiquetas, logotipos, marcas de agua, manos, sangre, dientes adicionales, número incorrecto de dientes, brackets.

### 07 · Tema 10.2 · figura 10.2.3 · 3:4

- **Identificador:** `anatomia-dental/m10/06`
- **Qué muestra:** Incisivo lateral superior extraído visto desde palatino, con cíngulo centrado y fosita lingual profunda.
- **Pie en la lectura:** Vista palatina del lateral: cíngulo centrado, crestas marginales marcadas y fosita lingual, punto frecuente de retención de biopelícula.
- **Tamaño:** 1200 × 1600 px

**Prompt:**

> Ilustración realista de estudio de un incisivo lateral superior permanente extraído, visto exactamente desde palatino, en posición vertical con la corona hacia abajo, sobre fondo gris neutro. Corona estrecha con cíngulo centrado en el tercio cervical, crestas marginales mesial y distal prominentes, fosa lingual profunda y una fosita pequeña en la unión del cíngulo con la fosa, raíz cónica delgada y única con ápice ligeramente inclinado hacia distal. Luz rasante suave que resalta los relieves, colores naturales, nitidez alta. Evitar: texto, etiquetas, flechas, logotipos, sangre, caries, restos de tejido, raíces dobles, dientes deformes.

### 08 · Tema 10.3 · figura 10.3.1 · 4:3

- **Identificador:** `anatomia-dental/m10/07`
- **Qué muestra:** Incisivos central y lateral inferiores extraídos, lado a lado, vistos desde vestibular, con coronas estrechas y raíces largas.
- **Pie en la lectura:** Incisivos inferiores: el central es simétrico; el lateral es un poco más ancho y su ángulo distoincisal más redondeado.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Ilustración realista de estudio de dos incisivos inferiores permanentes derechos extraídos, colocados lado a lado en posición anatómica con la corona hacia arriba, vistos desde vestibular sobre fondo gris neutro: a la izquierda un central con corona estrecha y simétrica, borde incisal recto y ángulos casi rectos; a la derecha un lateral algo más ancho con el ángulo distoincisal ligeramente redondeado. Raíces únicas, largas, rectas y estrechas en sentido mesiodistal. Iluminación difusa uniforme, colores naturales, nitidez alta. Evitar: texto, etiquetas, flechas, logotipos, sangre, cálculo, caries, restos de tejido, raíces dobles, dientes deformes.

### 09 · Tema 10.3 · figura 10.3.2 · 4:3

- **Identificador:** `anatomia-dental/m10/08`
- **Qué muestra:** Incisivo inferior extraído visto desde mesial, con raíz ancha en sentido vestibulolingual y depresión longitudinal.
- **Pie en la lectura:** Vista mesial: la raíz es una lámina ancha en sentido vestibulolingual con una depresión longitudinal; ahí se esconde el posible segundo conducto.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Ilustración realista de estudio de un incisivo central inferior permanente extraído, visto exactamente desde mesial, en posición vertical con la corona hacia arriba, sobre fondo gris claro. Corona en forma de cuña con el borde incisal ligeramente lingual al eje de la raíz, cíngulo pequeño, raíz única larga, ancha en sentido vestibulolingual y con una depresión longitudinal poco profunda en el centro de su cara mesial, línea cervical curvada hacia incisal. Luz rasante suave, colores naturales, nitidez alta. Evitar: texto, etiquetas, flechas, logotipos, sangre, cálculo, restos de tejido, raíces bifurcadas, dientes deformes.

### 10 · Tema 10.3 · figura 10.3.3 · 16:9

- **Identificador:** `anatomia-dental/m10/09`
- **Qué muestra:** Vista lingual de los incisivos inferiores en un tipodonto, con la lengua ausente y el piso de boca representado en encía artificial.
- **Pie en la lectura:** Cara lingual del sector anterior inferior: cíngulos pequeños, fosas poco profundas y la zona donde con mayor frecuencia se acumula el cálculo.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía realista de estudio de un tipodonto de arcada inferior permanente de adulto, vista lingual cercana del sector anterior desde canino a canino, dientes de resina con color natural, incisivos estrechos con cíngulos pequeños y fosas linguales poco profundas, encía artificial rosa con el contorno gingival bien definido, sin lengua, iluminación difusa de estudio, fondo blanco neutro, profundidad de campo media. Evitar: texto, etiquetas, logotipos, marcas de agua, manos, sangre, cálculo exagerado, número incorrecto de dientes, brackets, dientes deformes.

### 11 · Tema 10.4 · figura 10.4.1 · 3:4

- **Identificador:** `anatomia-dental/m10/10`
- **Qué muestra:** Canino superior derecho extraído visto desde vestibular, con cúspide puntiaguda, cresta vestibular y raíz muy larga.
- **Pie en la lectura:** Canino superior: la raíz más larga de la dentición y una cúspide cuya vertiente mesial es más corta que la distal.
- **Tamaño:** 1200 × 1600 px

**Prompt:**

> Ilustración realista de estudio de un canino superior permanente derecho de adulto extraído, en posición vertical con la corona hacia abajo, visto exactamente desde vestibular sobre fondo gris neutro. Corona con una cúspide puntiaguda, vertiente mesial más corta que la distal, cresta vestibular vertical marcada en el centro, contorno distal más convexo, línea cervical curva y una raíz única muy larga, casi el doble de la corona, que termina en un ápice afilado. Iluminación difusa de estudio, colores naturales, nitidez alta. Evitar: texto, etiquetas, flechas, logotipos, sangre, restos de tejido, caries, raíces dobles, dientes deformes.

### 12 · Tema 10.4 · figura 10.4.2 · 4:3

- **Identificador:** `anatomia-dental/m10/11`
- **Qué muestra:** Canino superior e inferior extraídos vistos desde mesial, lado a lado, mostrando la diferencia de grosor y la posición de la punta de la cúspide.
- **Pie en la lectura:** Vista mesial: el canino superior es más grueso y su cúspide queda sobre el eje radicular; en el inferior la cúspide queda lingual al eje.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Ilustración realista de estudio de dos caninos permanentes extraídos vistos exactamente desde mesial, colocados lado a lado sobre fondo gris claro: a la izquierda un canino superior con la corona hacia abajo, cíngulo voluminoso y raíz muy larga; a la derecha un canino inferior con la corona hacia arriba, corona más estrecha y punta de la cúspide ligeramente lingual al eje de la raíz. Ambas raíces únicas con depresión longitudinal en su cara mesial. Iluminación difusa uniforme, colores naturales, nitidez alta. Evitar: texto, etiquetas, flechas, logotipos, sangre, restos de tejido, caries, dientes deformes, raíces bifurcadas.

### 13 · Tema 10.4 · figura 10.4.3 · 16:9

- **Identificador:** `anatomia-dental/m10/12`
- **Qué muestra:** Tipodonto articulado visto de lado en movimiento lateral, con contacto entre canino superior e inferior y dientes posteriores separados.
- **Pie en la lectura:** Guía canina en un tipodonto: durante el movimiento lateral, el contacto entre caninos separa a los dientes posteriores.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía realista de estudio de un tipodonto de dentición permanente completa montado en un articulador simple, vista lateral derecha cercana, con la mandíbula desplazada hacia ese lado: la punta del canino inferior contacta la cresta lingual del canino superior y los premolares y molares quedan ligeramente separados, dientes de resina de color natural, encía artificial rosa, iluminación difusa de estudio, fondo blanco neutro, enfoque nítido en los caninos. Evitar: texto, etiquetas, flechas, logotipos, manos, sangre, número incorrecto de dientes, brackets, dientes deformes.

### 14 · Tema 10.5 · figura 10.5.1 · 16:9

- **Identificador:** `anatomia-dental/m10/13`
- **Qué muestra:** Doce dientes anteriores permanentes extraídos ordenados en dos filas sobre fondo neutro, superiores arriba e inferiores abajo.
- **Pie en la lectura:** Los doce dientes anteriores ordenados por arcada y posición: compara anchos de corona, longitudes radiculares y formas de cíngulo.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Ilustración realista de estudio de los doce dientes anteriores permanentes de un adulto, extraídos y limpios, ordenados en dos filas horizontales sobre fondo gris neutro: arriba los seis superiores de canino a canino con las coronas hacia abajo, abajo los seis inferiores con las coronas hacia arriba, todos vistos desde vestibular y alineados por la línea cervical, mostrando diferencias reales de ancho de corona y longitud de raíz, caninos con las raíces más largas. Iluminación difusa uniforme, colores naturales, nitidez alta. Evitar: texto, números, etiquetas, flechas, logotipos, sangre, restos de tejido, dientes repetidos, número incorrecto de dientes, dientes deformes.

### 15 · Tema 10.5 · figura 10.5.2 · 4:3

- **Identificador:** `anatomia-dental/m10/14`
- **Qué muestra:** Vista palatina de los incisivos superiores en un tipodonto con crestas marginales muy prominentes y fosas profundas.
- **Pie en la lectura:** Incisivos en pala: las crestas marginales gruesas delimitan una fosa profunda que retiene biopelícula con facilidad.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía realista de estudio, vista palatina cercana tomada con espejo de los cuatro incisivos superiores permanentes de un tipodonto de adulto, dientes de resina de color natural con crestas marginales linguales muy prominentes y fosas linguales profundas en forma de pala, cíngulos bien definidos, encía artificial rosa del paladar en el borde inferior del encuadre, iluminación difusa uniforme, colores naturales, fondo neutro. Evitar: texto, etiquetas, logotipos, marcas de agua, sangre, caries, manos sin guantes, número incorrecto de dientes, dientes deformes.

### 16 · Tema 10.5 · figura 10.5.3 · 4:3

- **Identificador:** `anatomia-dental/m10/15`
- **Qué muestra:** Manos con guantes sostienen un tipodonto anterior superior y comparan un incisivo restaurado con su homólogo.
- **Pie en la lectura:** La pieza homóloga es la mejor guía para restaurar un diente anterior: forma, contactos y troneras deben coincidir.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía realista en un laboratorio de práctica odontológica: manos con guantes de nitrilo azul sostienen un tipodonto de arcada superior permanente visto de frente; el incisivo central derecho tiene una restauración de resina del color del diente en el ángulo mesioincisal y se compara con el central izquierdo, ambos con troneras incisales y contornos simétricos. Fondo de mesa de trabajo desenfocado, luz blanca uniforme, colores naturales. Evitar: texto, etiquetas, logotipos, marcas de agua, rostros, sangre, manos sin guantes, instrumentos punzantes en primer plano, dientes deformes.

## Módulo 11 · Anatomía de premolares permanentes

Carpeta: `imagenes-academia/01-anatomia-dental/modulo-11/` · 16 imágenes (3 de 16:9, 8 de 4:3, 2 de 3:4, 3 de 1:1).

### 01 · Portada del módulo · 16:9

- **Identificador:** `anatomia-dental/m11/portada`
- **Qué muestra:** Premolares permanentes superiores e inferiores extraídos ordenados sobre una superficie neutra, vistos desde oclusal y vestibular.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Ilustración realista de gran formato para portada educativa: sobre una superficie de laboratorio gris mate, ocho premolares permanentes extraídos y limpios, superiores e inferiores, dispuestos en dos filas; algunos vistos desde oclusal mostrando contornos hexagonal, ovalado, romboidal y cuadrado, y otros de perfil mostrando una o dos raíces. Al fondo, desenfocado, un tipodonto de arcada inferior. Iluminación de estudio suave y lateral que resalta cúspides y surcos, colores naturales, profundidad de campo corta. Evitar: texto, etiquetas, números, logotipos, marcas de agua, sangre, restos de tejido, rostros, dientes deformes.

### 02 · Tema 11.1 · figura 11.1.1 · 16:9

- **Identificador:** `anatomia-dental/m11/01`
- **Qué muestra:** Cuatro premolares permanentes extraídos alineados y vistos desde vestibular: dos superiores con corona hacia abajo y dos inferiores con corona hacia arriba.
- **Pie en la lectura:** Los cuatro premolares de un lado: los superiores tienen cúspides vestibulares más altas y simétricas; en los inferiores la corona se inclina hacia lingual.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Ilustración realista de estudio de cuatro premolares permanentes de un mismo lado, extraídos y limpios, alineados sobre fondo gris neutro y vistos desde vestibular: a la izquierda el primer y segundo premolar superiores con la corona hacia abajo, el primero con dos raíces separadas en el tercio apical; a la derecha el primer y segundo premolar inferiores con la corona hacia arriba y una sola raíz cónica cada uno. Cúspides vestibulares bien definidas, línea cervical suave, proporciones reales. Iluminación difusa de estudio, colores naturales, nitidez alta. Evitar: texto, números, etiquetas, flechas, logotipos, sangre, restos de tejido, caries, dientes deformes.

### 03 · Tema 11.1 · figura 11.1.2 · 4:3

- **Identificador:** `anatomia-dental/m11/02`
- **Qué muestra:** Tipodonto visto desde oclusal en la zona de premolares superiores e inferiores, mostrando cúspides, fosas y crestas marginales.
- **Pie en la lectura:** Vista oclusal de los premolares en un tipodonto: crestas marginales, surco central y fositas en los extremos.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía realista de estudio de un tipodonto de dentición permanente de adulto, vista oclusal cercana del segmento posterior derecho superior, desde el canino hasta el primer molar, con el primer premolar de contorno hexagonal y surco central largo y el segundo premolar de contorno oval con surco central corto y varios surcos suplementarios. Dientes de resina de color natural, encía artificial rosa en los bordes, iluminación difusa uniforme, fondo blanco neutro, enfoque nítido. Evitar: texto, etiquetas, logotipos, marcas de agua, manos, sangre, número incorrecto de dientes, restauraciones, brackets.

### 04 · Tema 11.1 · figura 11.1.3 · 4:3

- **Identificador:** `anatomia-dental/m11/03`
- **Qué muestra:** Premolar inferior extraído visto desde mesial con la corona inclinada hacia lingual respecto a la raíz.
- **Pie en la lectura:** Vista mesial de un premolar inferior: la corona se inclina hacia lingual y la cúspide vestibular queda casi sobre el centro de la raíz.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Ilustración realista de estudio de un primer premolar inferior permanente extraído, visto exactamente desde mesial, en posición vertical con la corona hacia arriba, sobre fondo gris claro. Corona inclinada hacia lingual respecto al eje de la raíz, cúspide vestibular alta y puntiaguda casi centrada sobre la raíz, cúspide lingual pequeña y baja, convexidad vestibular en el tercio cervical, cresta marginal mesial inclinada, raíz única cónica con una depresión longitudinal suave. Luz difusa, colores naturales, nitidez alta. Evitar: texto, etiquetas, flechas, logotipos, sangre, restos de tejido, caries, raíces dobles, dientes deformes.

### 05 · Tema 11.2 · figura 11.2.1 · 3:4

- **Identificador:** `anatomia-dental/m11/04`
- **Qué muestra:** Primer premolar superior derecho extraído visto desde vestibular, con cúspide vestibular puntiaguda y dos raíces separadas en el tercio apical.
- **Pie en la lectura:** Vista vestibular del primer premolar superior: cúspide puntiaguda con la vertiente mesial más larga que la distal y dos raíces visibles en el tercio apical.
- **Tamaño:** 1200 × 1600 px

**Prompt:**

> Ilustración realista de estudio de un primer premolar superior permanente derecho extraído, en posición vertical con la corona hacia abajo, visto exactamente desde vestibular sobre fondo gris neutro. Corona pentagonal con cúspide vestibular puntiaguda cuya punta queda ligeramente hacia distal, vertiente mesial algo más larga que la distal, cresta vestibular vertical marcada, línea cervical casi recta, raíz que se divide en dos ramas, vestibular y palatina, en su tercio medio o apical, la palatina asomando detrás. Iluminación difusa, colores naturales, nitidez alta. Evitar: texto, etiquetas, flechas, logotipos, sangre, restos de tejido, caries, tres raíces, dientes deformes.

### 06 · Tema 11.2 · figura 11.2.2 · 4:3

- **Identificador:** `anatomia-dental/m11/05`
- **Qué muestra:** Primer premolar superior extraído visto desde mesial con concavidad en la corona y la raíz, y dos raíces separadas.
- **Pie en la lectura:** Vista mesial: la concavidad cervical, el surco marginal mesial y las dos raíces, vestibular y palatina.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Ilustración realista de estudio de un primer premolar superior permanente extraído, visto exactamente desde mesial, en posición vertical con la corona hacia abajo, sobre fondo gris claro. Dos cúspides bien separadas, la vestibular más alta que la palatina, una concavidad suave en el tercio cervical de la corona que se continúa sobre el tronco radicular, un surco fino que cruza la cresta marginal mesial y dos raíces delgadas, vestibular y palatina, que se separan en el tercio medio. Luz rasante suave, colores naturales, nitidez alta. Evitar: texto, etiquetas, flechas, logotipos, sangre, restos de tejido, caries, dientes deformes.

### 07 · Tema 11.2 · figura 11.2.3 · 1:1

- **Identificador:** `anatomia-dental/m11/06`
- **Qué muestra:** Vista oclusal ampliada de un primer premolar superior extraído con contorno hexagonal y surco central largo.
- **Pie en la lectura:** Vista oclusal: contorno hexagonal, surco central largo y superficie con pocos surcos suplementarios.
- **Tamaño:** 1400 × 1400 px

**Prompt:**

> Ilustración macro realista de estudio de un primer premolar superior permanente extraído visto exactamente desde oclusal, centrado sobre fondo gris neutro. Contorno hexagonal más ancho de vestibular a lingual, mitad vestibular más amplia, surco central largo que termina en una fosita en cada extremo, crestas marginales nítidas, un surco fino que cruza la cresta marginal mesial y pocos surcos suplementarios, esmalte translúcido con brillo natural. Iluminación difusa uniforme, colores naturales, enfoque nítido. Evitar: texto, etiquetas, flechas, logotipos, sangre, caries, selladores, restauraciones, dientes deformes.

### 08 · Tema 11.3 · figura 11.3.1 · 4:3

- **Identificador:** `anatomia-dental/m11/07`
- **Qué muestra:** Primer y segundo premolares superiores derechos extraídos, lado a lado, vistos desde vestibular.
- **Pie en la lectura:** Primer y segundo premolares superiores: el segundo tiene una cúspide vestibular menos puntiaguda, contornos más redondeados y una sola raíz.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Ilustración realista de estudio de dos premolares superiores permanentes derechos extraídos, colocados lado a lado en posición anatómica con la corona hacia abajo, vistos desde vestibular sobre fondo gris neutro: a la izquierda el segundo premolar con cúspide vestibular menos puntiaguda, contornos redondeados y una sola raíz cónica; a la derecha el primer premolar con cúspide más afilada y dos raíces separadas en el tercio apical. Proporciones reales, iluminación difusa de estudio, colores naturales, nitidez alta. Evitar: texto, números, etiquetas, flechas, logotipos, sangre, restos de tejido, caries, dientes deformes.

### 09 · Tema 11.3 · figura 11.3.2 · 1:1

- **Identificador:** `anatomia-dental/m11/08`
- **Qué muestra:** Segundo premolar superior extraído visto desde oclusal, con contorno ovalado, surco central corto y surcos suplementarios.
- **Pie en la lectura:** Vista oclusal del segundo premolar superior: contorno ovalado, surco central corto y surcos suplementarios que irradian del centro.
- **Tamaño:** 1400 × 1400 px

**Prompt:**

> Ilustración macro realista de estudio de un segundo premolar superior permanente extraído visto exactamente desde oclusal, centrado sobre fondo gris neutro. Contorno ovalado más ancho de vestibular a palatino, dos cúspides de tamaño casi igual, surco central corto con fositas cercanas al centro, varios surcos suplementarios finos que irradian desde el surco central, crestas marginales redondeadas, esmalte con brillo natural. Iluminación difusa uniforme, colores naturales, enfoque nítido. Evitar: texto, etiquetas, flechas, logotipos, sangre, caries, selladores, restauraciones, dientes deformes.

### 10 · Tema 11.3 · figura 11.3.3 · 4:3

- **Identificador:** `anatomia-dental/m11/09`
- **Qué muestra:** Ilustración anatómica de un corte de maxilar que muestra las raíces de premolares y molares superiores cerca del piso del seno maxilar.
- **Pie en la lectura:** Relación de las raíces del segundo premolar y los molares superiores con el piso del seno maxilar.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Ilustración anatómica realista, estilo lámina de atlas médico, de un corte sagital del maxilar superior de un adulto a nivel de los dientes posteriores: segundo premolar y primer molar superiores con sus raíces dentro del hueso alveolar, ápices muy próximos a una lámina ósea delgada que forma el piso del seno maxilar, seno representado como cavidad aérea limpia y oscura por encima, mucosa del seno fina y rosada, hueso esponjoso con textura natural. Colores sobrios y naturales, iluminación uniforme. Evitar: texto, etiquetas, flechas, logotipos, sangre, inflamación, instrumental, rostros, dientes deformes, número incorrecto de raíces.

### 11 · Tema 11.4 · figura 11.4.1 · 3:4

- **Identificador:** `anatomia-dental/m11/10`
- **Qué muestra:** Primer premolar inferior extraído visto desde vestibular, con cúspide vestibular puntiaguda y raíz única cónica.
- **Pie en la lectura:** Vista vestibular del primer premolar inferior: la corona recuerda a la de un canino corto, con la vertiente mesial más corta que la distal.
- **Tamaño:** 1200 × 1600 px

**Prompt:**

> Ilustración realista de estudio de un primer premolar inferior permanente derecho extraído, en posición vertical con la corona hacia arriba, visto exactamente desde vestibular sobre fondo gris neutro. Corona pentagonal con una cúspide vestibular alta y puntiaguda, vertiente mesial más corta que la distal, cresta vestibular marcada, contorno mesial y distal convergentes hacia cervical, línea cervical suave y una raíz única cónica que se estrecha hacia un ápice fino. Iluminación difusa de estudio, colores naturales, nitidez alta. Evitar: texto, etiquetas, flechas, logotipos, sangre, restos de tejido, caries, raíces dobles, dientes deformes.

### 12 · Tema 11.4 · figura 11.4.2 · 1:1

- **Identificador:** `anatomia-dental/m11/11`
- **Qué muestra:** Vista oclusal de un primer premolar inferior extraído con contorno romboidal y cresta transversal que separa dos fosas.
- **Pie en la lectura:** Vista oclusal: contorno romboidal, cúspide lingual pequeña y cresta transversal entre la fosa mesial y la distal.
- **Tamaño:** 1400 × 1400 px

**Prompt:**

> Ilustración macro realista de estudio de un primer premolar inferior permanente extraído visto exactamente desde oclusal, centrado sobre fondo gris neutro. Contorno romboidal con mitad vestibular mucho mayor que la lingual, cúspide lingual pequeña, una cresta transversal continua que cruza de la cúspide vestibular a la lingual y separa una fosa mesial pequeña de una fosa distal más amplia, cada una con una fosita, y un surco fino en el ángulo mesiolingual. Iluminación difusa, colores naturales, enfoque nítido. Evitar: texto, etiquetas, flechas, logotipos, sangre, caries, restauraciones, selladores, dientes deformes.

### 13 · Tema 11.4 · figura 11.4.3 · 4:3

- **Identificador:** `anatomia-dental/m11/12`
- **Qué muestra:** Ilustración de un primer premolar inferior en corte longitudinal que muestra un conducto que se divide en dos en el tercio apical.
- **Pie en la lectura:** Corte longitudinal ilustrativo: un conducto amplio que se divide en vestibular y lingual en el tercio apical, la variante que explica muchos fracasos endodónticos en este diente.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Ilustración anatómica realista de un primer premolar inferior permanente seccionado longitudinalmente en sentido vestibulolingual, visto de frente sobre fondo gris claro: esmalte y dentina con sus tonos naturales, cámara pulpar con un cuerno pulpar vestibular prominente y uno lingual pequeño, un conducto amplio que en el tercio apical se divide en dos conductos finos, vestibular y lingual, que terminan en dos forámenes. Pulpa de tono rosado pálido uniforme, estilo lámina de atlas, iluminación uniforme. Evitar: texto, etiquetas, flechas, logotipos, sangre, instrumental, caries, dientes deformes.

### 14 · Tema 11.5 · figura 11.5.1 · 4:3

- **Identificador:** `anatomia-dental/m11/13`
- **Qué muestra:** Dos segundos premolares inferiores extraídos vistos desde oclusal: uno con tres cúspides y surcos en Y, otro con dos cúspides y surco en H.
- **Pie en la lectura:** Las dos formas del segundo premolar inferior: tricuspídea con surcos en Y (izquierda) y bicuspídea con surco central recto en H (derecha).
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Ilustración macro realista de estudio de dos segundos premolares inferiores permanentes extraídos, vistos exactamente desde oclusal y colocados lado a lado sobre fondo gris neutro: el de la izquierda con contorno cuadrado, una cúspide vestibular y dos cúspides linguales, la mesiolingual mayor que la distolingual, y surcos que forman una Y con una fosita central; el de la derecha con contorno redondeado, una cúspide vestibular y una lingual, y un surco central recto de mesial a distal. Iluminación difusa, colores naturales, nitidez alta. Evitar: texto, etiquetas, flechas, logotipos, sangre, caries, restauraciones, dientes deformes.

### 15 · Tema 11.5 · figura 11.5.2 · 16:9

- **Identificador:** `anatomia-dental/m11/14`
- **Qué muestra:** Ilustración anatómica de la cara externa de una mandíbula adulta con el agujero mentoniano por debajo de los premolares.
- **Pie en la lectura:** Ubicación habitual del agujero mentoniano, por debajo de los ápices de los premolares inferiores.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Ilustración anatómica realista, estilo lámina de atlas, de la vista lateral externa del cuerpo de una mandíbula adulta dentada, sin tejidos blandos, hueso de color marfil con textura natural: dientes inferiores permanentes desde el canino hasta el primer molar, con la cortical vestibular parcialmente transparente que deja ver las raíces de los premolares, y un agujero mentoniano ovalado situado por debajo y entre los ápices del primer y segundo premolar. Iluminación uniforme, fondo gris claro. Evitar: texto, etiquetas, flechas, logotipos, sangre, nervios dibujados con colores irreales, rostros, dientes deformes.

### 16 · Tema 11.5 · figura 11.5.3 · 4:3

- **Identificador:** `anatomia-dental/m11/15`
- **Qué muestra:** Manos con guantes sostienen un premolar extraído frente a una charola con premolares ordenados para su identificación.
- **Pie en la lectura:** La identificación sistemática, rasgo por rasgo, es la base de la práctica de laboratorio de anatomía dental.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía realista en un laboratorio universitario de anatomía dental: manos con guantes de nitrilo sostienen con pinzas un premolar permanente extraído y limpio, observándolo desde oclusal, frente a una charola de plástico blanco con ocho premolares ordenados en dos filas, junto a una lupa de mano. Mesa de trabajo limpia, luz blanca uniforme, profundidad de campo corta, colores naturales. Evitar: texto, etiquetas, números, logotipos, marcas de agua, rostros, sangre, restos de tejido, manos sin guantes, dientes deformes.

## Módulo 12 · Anatomía de molares permanentes

Carpeta: `imagenes-academia/01-anatomia-dental/modulo-12/` · 16 imágenes (5 de 16:9, 2 de 3:4, 4 de 1:1, 5 de 4:3).

### 01 · Portada del módulo · 16:9

- **Identificador:** `anatomia-dental/m12/portada`
- **Qué muestra:** Molares permanentes superiores e inferiores extraídos dispuestos sobre una superficie neutra, vistos desde oclusal y de perfil.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Ilustración realista de gran formato para portada educativa: sobre una superficie de laboratorio gris mate, seis molares permanentes extraídos y limpios con anatomía correcta, tres superiores con tres raíces divergentes y tres inferiores con dos raíces, dispuestos en arco; algunos vistos desde oclusal mostrando la cresta oblicua y cinco cúspides, otros de perfil mostrando sus raíces. Al fondo, desenfocado, un tipodonto completo. Iluminación de estudio suave y lateral que resalta cúspides y surcos, colores naturales, profundidad de campo corta. Evitar: texto, etiquetas, números, logotipos, marcas de agua, sangre, restos de tejido, rostros, dientes deformes.

### 02 · Tema 12.1 · figura 12.1.1 · 3:4

- **Identificador:** `anatomia-dental/m12/01`
- **Qué muestra:** Primer molar superior derecho extraído visto desde vestibular, con dos cúspides vestibulares y tres raíces.
- **Pie en la lectura:** Vista vestibular del primer molar superior: dos cúspides vestibulares separadas por el surco vestibular y tres raíces divergentes.
- **Tamaño:** 1200 × 1600 px

**Prompt:**

> Ilustración realista de estudio de un primer molar superior permanente derecho de adulto, extraído y limpio, en posición vertical con la corona hacia abajo, visto exactamente desde vestibular sobre fondo gris neutro. Corona con cúspides mesiovestibular y distovestibular separadas por un surco vestibular vertical, línea cervical casi recta, tronco radicular corto y tres raíces divergentes: mesiovestibular ancha y curvada hacia distal, distovestibular más corta y recta, y la palatina, la más larga, asomando entre ambas. Iluminación difusa, colores naturales, nitidez alta. Evitar: texto, etiquetas, flechas, logotipos, sangre, restos de tejido, caries, dos raíces, dientes deformes.

### 03 · Tema 12.1 · figura 12.1.2 · 1:1

- **Identificador:** `anatomia-dental/m12/02`
- **Qué muestra:** Vista oclusal de un primer molar superior extraído con contorno romboidal, cresta oblicua y cúspide de Carabelli.
- **Pie en la lectura:** Vista oclusal: contorno romboidal, cresta oblicua en diagonal y una cúspide de Carabelli en palatino.
- **Tamaño:** 1400 × 1400 px

**Prompt:**

> Ilustración macro realista de estudio de un primer molar superior permanente extraído visto exactamente desde oclusal, centrado sobre fondo gris neutro. Contorno romboidal, cuatro cúspides principales con la mesiopalatina como la mayor, una cresta oblicua continua que cruza en diagonal desde la cúspide mesiopalatina hasta la distovestibular, fosa central amplia por delante y fosa distal pequeña por detrás, surcos de desarrollo nítidos y una pequeña cúspide accesoria en la cara palatina de la cúspide mesiopalatina. Iluminación difusa, colores naturales, enfoque nítido. Evitar: texto, etiquetas, flechas, logotipos, sangre, caries, restauraciones, selladores, dientes deformes.

### 04 · Tema 12.1 · figura 12.1.3 · 16:9

- **Identificador:** `anatomia-dental/m12/03`
- **Qué muestra:** Encuadre de la boca de un niño con el primer molar superior permanente recién erupcionado detrás de los molares temporales.
- **Pie en la lectura:** Primer molar superior permanente en erupción, detrás de los molares temporales, en una boca de alrededor de 6 años.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía clínica realista con espejo intraoral de la arcada superior de un niño de alrededor de 6 años, vista oclusal del lado derecho: molares temporales sanos y, detrás, un primer molar permanente recién erupcionado con la cara oclusal todavía parcialmente cubierta por encía en su mitad distal, fosas profundas y esmalte brillante. Encía rosa sana, mano con guante de nitrilo sosteniendo el espejo en el borde del encuadre, luz de lámpara dental uniforme, colores naturales. Evitar: texto, logotipos, marcas de agua, rostro, sangre, caries, aparatos de ortodoncia, dientes deformes, número incorrecto de dientes.

### 05 · Tema 12.2 · figura 12.2.1 · 4:3

- **Identificador:** `anatomia-dental/m12/04`
- **Qué muestra:** Primer molar superior extraído visto desde mesial, con la raíz mesiovestibular ancha y la palatina divergente.
- **Pie en la lectura:** Vista mesial: la raíz mesiovestibular es ancha en sentido vestibulopalatino, la razón anatómica de su segundo conducto.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Ilustración realista de estudio de un primer molar superior permanente extraído, visto exactamente desde mesial, en posición vertical con la corona hacia abajo, sobre fondo gris claro. Corona con cúspide mesiovestibular y mesiopalatina y un pequeño tubérculo en palatino; raíz mesiovestibular ancha y aplanada que oculta a la distovestibular, con una depresión longitudinal suave; raíz palatina larga que diverge hacia palatino con el ápice curvado ligeramente hacia vestibular; tronco radicular corto. Luz difusa lateral, colores naturales, nitidez alta. Evitar: texto, etiquetas, flechas, logotipos, sangre, restos de tejido, caries, raíces fusionadas, dientes deformes.

### 06 · Tema 12.2 · figura 12.2.2 · 16:9

- **Identificador:** `anatomia-dental/m12/05`
- **Qué muestra:** Primer, segundo y tercer molares superiores extraídos vistos desde vestibular, en tamaño decreciente y raíces cada vez más juntas.
- **Pie en la lectura:** Los tres molares superiores: coronas cada vez más pequeñas y raíces cada vez más juntas, cortas y fusionadas.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Ilustración realista de estudio de los tres molares superiores permanentes derechos de un adulto, extraídos y limpios, colocados en fila en posición anatómica con la corona hacia abajo y vistos desde vestibular sobre fondo gris neutro: primer molar con tres raíces bien separadas, segundo molar más pequeño con raíces más juntas e inclinadas a distal, tercer molar pequeño con corona redondeada y raíces cortas fusionadas en forma cónica. Iluminación difusa uniforme, colores naturales, nitidez alta. Evitar: texto, números, etiquetas, flechas, logotipos, sangre, restos de tejido, caries, dientes deformes.

### 07 · Tema 12.2 · figura 12.2.3 · 1:1

- **Identificador:** `anatomia-dental/m12/06`
- **Qué muestra:** Segundo molar superior extraído visto desde oclusal, con forma de corazón y tres cúspides.
- **Pie en la lectura:** Segundo molar superior en forma de corazón: la cúspide distopalatina está ausente y la cara oclusal tiene tres cúspides.
- **Tamaño:** 1400 × 1400 px

**Prompt:**

> Ilustración macro realista de estudio de un segundo molar superior permanente extraído visto exactamente desde oclusal, centrado sobre fondo gris neutro. Contorno en forma de corazón con tres cúspides, mesiovestibular, distovestibular y mesiopalatina, sin cúspide distopalatina, cresta oblicua discreta, surcos de desarrollo y algunos surcos suplementarios, esmalte con brillo natural. Iluminación difusa uniforme, colores naturales, enfoque nítido. Evitar: texto, etiquetas, flechas, logotipos, sangre, caries, restauraciones, cúspide de Carabelli marcada, dientes deformes.

### 08 · Tema 12.3 · figura 12.3.1 · 3:4

- **Identificador:** `anatomia-dental/m12/07`
- **Qué muestra:** Primer molar inferior derecho extraído visto desde vestibular, con tres cúspides vestibulares y dos raíces separadas.
- **Pie en la lectura:** Vista vestibular del primer molar inferior: tres cúspides vestibulares, dos surcos vestibulares y raíces mesial y distal bien separadas.
- **Tamaño:** 1200 × 1600 px

**Prompt:**

> Ilustración realista de estudio de un primer molar inferior permanente derecho de adulto, extraído y limpio, en posición vertical con la corona hacia arriba, visto exactamente desde vestibular sobre fondo gris neutro. Corona con tres cúspides vestibulares, mesiovestibular la más ancha, distovestibular y distal la más pequeña, separadas por los surcos mesiovestibular y distovestibular; tronco radicular corto y dos raíces bien separadas: mesial ancha y curvada hacia distal, distal más recta. Iluminación difusa, colores naturales, nitidez alta. Evitar: texto, etiquetas, flechas, logotipos, sangre, restos de tejido, caries, tres raíces, dientes deformes.

### 09 · Tema 12.3 · figura 12.3.2 · 1:1

- **Identificador:** `anatomia-dental/m12/08`
- **Qué muestra:** Vista oclusal de un primer molar inferior extraído con cinco cúspides y contorno pentagonal.
- **Pie en la lectura:** Vista oclusal: contorno pentagonal, cinco cúspides y surcos que dibujan el patrón Y5.
- **Tamaño:** 1400 × 1400 px

**Prompt:**

> Ilustración macro realista de estudio de un primer molar inferior permanente extraído visto exactamente desde oclusal, centrado sobre fondo gris neutro. Contorno pentagonal más ancho en sentido mesiodistal, tres cúspides vestibulares redondeadas con la distal como la más pequeña, dos cúspides linguales más altas y puntiagudas, fosa central amplia, surco central en zigzag y surcos vestibulares y lingual nítidos, crestas marginales bien definidas, esmalte con brillo natural. Iluminación difusa uniforme, colores naturales, enfoque nítido. Evitar: texto, etiquetas, flechas, logotipos, sangre, caries, restauraciones, selladores, dientes deformes.

### 10 · Tema 12.3 · figura 12.3.3 · 4:3

- **Identificador:** `anatomia-dental/m12/09`
- **Qué muestra:** Primer molar inferior extraído visto desde mesial con la raíz mesial ancha y la corona inclinada hacia lingual.
- **Pie en la lectura:** Vista mesial: raíz mesial ancha con depresión longitudinal, donde se alojan los conductos mesiovestibular y mesiolingual.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Ilustración realista de estudio de un primer molar inferior permanente extraído, visto exactamente desde mesial, en posición vertical con la corona hacia arriba, sobre fondo gris claro. Corona con la cúspide mesiovestibular y la mesiolingual, esta última más alta, convexidad vestibular marcada en el tercio cervical y corona inclinada hacia lingual; raíz mesial ancha en sentido vestibulolingual, con una depresión longitudinal central y ápice romo. Luz difusa lateral, colores naturales, nitidez alta. Evitar: texto, etiquetas, flechas, logotipos, sangre, restos de tejido, caries, raíces adicionales, dientes deformes.

### 11 · Tema 12.4 · figura 12.4.1 · 4:3

- **Identificador:** `anatomia-dental/m12/10`
- **Qué muestra:** Primer y segundo molares inferiores extraídos vistos desde oclusal: uno con cinco cúspides y surcos en Y, otro con cuatro cúspides y surcos en cruz.
- **Pie en la lectura:** Primer molar inferior (patrón Y5) junto al segundo molar inferior (patrón +4): la diferencia más útil para distinguirlos.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Ilustración macro realista de estudio de dos molares inferiores permanentes derechos extraídos, vistos exactamente desde oclusal y colocados lado a lado sobre fondo gris neutro: a la izquierda un primer molar de contorno pentagonal con cinco cúspides y surcos en Y; a la derecha un segundo molar más pequeño, de contorno rectangular, con cuatro cúspides de tamaño parecido y surcos que se cruzan en ángulo recto formando una cruz en la fosa central. Iluminación difusa, colores naturales, nitidez alta. Evitar: texto, etiquetas, flechas, logotipos, sangre, caries, restauraciones, dientes deformes.

### 12 · Tema 12.4 · figura 12.4.2 · 1:1

- **Identificador:** `anatomia-dental/m12/11`
- **Qué muestra:** Segundo molar inferior extraído visto desde vestibular con raíces fusionadas en forma de herradura.
- **Pie en la lectura:** Segundo molar inferior con raíces fusionadas por vestibular, la morfología externa que acompaña al conducto en C.
- **Tamaño:** 1400 × 1400 px

**Prompt:**

> Ilustración realista de estudio de un segundo molar inferior permanente extraído, en posición vertical con la corona hacia arriba, visto en tres cuartos desde vestibular y apical sobre fondo gris neutro: corona de cuatro cúspides y raíces mesial y distal fusionadas por su cara vestibular formando una sola masa cónica en forma de herradura abierta hacia lingual, con un surco longitudinal tenue en la zona de unión. Iluminación difusa, colores naturales, nitidez alta. Evitar: texto, etiquetas, flechas, logotipos, sangre, restos de tejido, caries, raíces separadas, dientes deformes.

### 13 · Tema 12.4 · figura 12.4.3 · 16:9

- **Identificador:** `anatomia-dental/m12/12`
- **Qué muestra:** Ilustración anatómica del cuerpo y la rama mandibular con un tercer molar retenido en posición mesioangular junto al conducto dentario inferior.
- **Pie en la lectura:** Tercer molar inferior retenido en posición mesioangular, con sus ápices próximos al conducto dentario inferior.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Ilustración anatómica realista, estilo lámina de atlas, de la vista lateral de la región posterior de una mandíbula adulta con la cortical vestibular parcialmente transparente: primer y segundo molares inferiores erupcionados, y detrás un tercer molar retenido dentro del hueso, inclinado hacia mesial con su corona contra la cara distal del segundo molar; por debajo, un conducto óseo tubular que corre a lo largo del cuerpo mandibular muy cerca de los ápices del tercer molar. Hueso color marfil, colores sobrios. Evitar: texto, etiquetas, flechas, logotipos, sangre, nervios de colores irreales, rostros, dientes deformes.

### 14 · Tema 12.5 · figura 12.5.1 · 16:9

- **Identificador:** `anatomia-dental/m12/13`
- **Qué muestra:** Seis molares permanentes extraídos ordenados en dos filas, superiores con tres raíces arriba e inferiores con dos raíces abajo.
- **Pie en la lectura:** Los seis molares de un lado: compara número y separación de las raíces y el tamaño de las coronas del primero al tercero.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Ilustración realista de estudio de seis molares permanentes de un mismo lado, extraídos y limpios, ordenados en dos filas sobre fondo gris neutro y vistos desde vestibular: arriba primer, segundo y tercer molares superiores con la corona hacia abajo y tres raíces cada vez más juntas y fusionadas; abajo primer, segundo y tercer molares inferiores con la corona hacia arriba y dos raíces cada vez más próximas y cortas. Tamaños decrecientes reales. Iluminación difusa uniforme, colores naturales, nitidez alta. Evitar: texto, números, etiquetas, flechas, logotipos, sangre, restos de tejido, caries, dientes deformes.

### 15 · Tema 12.5 · figura 12.5.2 · 4:3

- **Identificador:** `anatomia-dental/m12/14`
- **Qué muestra:** Molar superior extraído con una pequeña perla de esmalte redonda y brillante en la zona de la furcación.
- **Pie en la lectura:** Perla de esmalte en la furcación de un molar superior: una pequeña esfera brillante donde la encía no logra insertarse.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Ilustración macro realista de estudio de un segundo molar superior permanente extraído y limpio, visto desde distal en ligera vista oblicua sobre fondo gris neutro, con una pequeña esfera de esmalte blanco brillante de unos dos milímetros adherida a la superficie radicular, justo por encima de la entrada de la furcación entre la raíz distovestibular y la palatina; el resto de la raíz con el tono mate amarillento del cemento. Iluminación difusa, colores naturales, enfoque nítido en la perla. Evitar: texto, etiquetas, flechas, logotipos, sangre, cálculo, restos de tejido, caries, dientes deformes.

### 16 · Tema 12.5 · figura 12.5.3 · 4:3

- **Identificador:** `anatomia-dental/m12/15`
- **Qué muestra:** Primer molar inferior extraído visto desde distolingual con una tercera raíz pequeña y curvada.
- **Pie en la lectura:** Radix entomolaris: una tercera raíz más corta y delgada, en posición distolingual, curvada hacia vestibular.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Ilustración realista de estudio de un primer molar inferior permanente extraído, en posición vertical con la corona hacia arriba, visto desde distolingual sobre fondo gris neutro: corona de cinco cúspides, raíz mesial ancha, raíz distal principal y una tercera raíz adicional más corta y delgada que nace en la zona distolingual del tronco radicular y se curva hacia vestibular en su tercio apical. Iluminación difusa, colores naturales, nitidez alta. Evitar: texto, etiquetas, flechas, logotipos, sangre, restos de tejido, caries, más de tres raíces, dientes deformes.

## Módulo 13 · Oclusión: relaciones entre arcadas y movimientos mandibulares

Carpeta: `imagenes-academia/01-anatomia-dental/modulo-13/` · 16 imágenes (3 de 16:9, 11 de 4:3, 2 de 1:1).

### 01 · Portada del módulo · 16:9

- **Identificador:** `anatomia-dental/m13/portada`
- **Qué muestra:** Modelos de estudio dentales en oclusión montados en un articulador sobre una mesa clínica, con instrumental de exploración al lado.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía realista de gran formato en un consultorio dental moderno y luminoso: sobre una mesa clínica blanca, un articulador dental semiajustable con modelos de yeso de una dentición permanente completa en oclusión, vista lateral tres cuartos que muestra el engranaje de caninos, premolares y molares, a un lado una sonda periodontal, un espejo bucal y unas pinzas con papel de articular azul; al fondo desenfocado la unidad dental y una ventana con luz natural, colores naturales, profundidad de campo corta. Evitar: texto, escalas legibles, logotipos, marcas comerciales, marcas de agua, personas, yeso fracturado, dientes deformes.

### 02 · Tema 13.1 · figura 13.1.1 · 16:9

- **Identificador:** `anatomia-dental/m13/01`
- **Qué muestra:** Tipodonto de dentición permanente completa en máxima intercuspidación visto de lado.
- **Pie en la lectura:** Vista lateral de una dentición permanente en máxima intercuspidación: observa cómo cada diente superior encaja entre dos inferiores.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía de estudio realista de un tipodonto dental de dentición permanente completa con 28 dientes, montado en máxima intercuspidación, vista lateral derecha a la altura del plano oclusal, dientes de resina color marfil natural con anatomía correcta de incisivos, caninos, premolares y molares, encía de silicona rosa pálido, los molares superiores ligeramente distales respecto a los inferiores como en una relación normal, fondo gris neutro liso, iluminación difusa de estudio, enfoque nítido de canino a segundo molar. Evitar: texto, flechas, etiquetas, logotipos, marcas de agua, dientes deformes, número incorrecto de cúspides, colores artificiales, sombras duras.

### 03 · Tema 13.1 · figura 13.1.2 · 4:3

- **Identificador:** `anatomia-dental/m13/02`
- **Qué muestra:** Modelo de yeso de la arcada inferior visto de lado, con la curva suave que forman las cúspides de canino a molares.
- **Pie en la lectura:** En un modelo de estudio inferior la curva de Spee se aprecia al mirar las cúspides vestibulares desde un lado.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía de estudio realista de un modelo de yeso dental blanco de una arcada inferior permanente completa, vista lateral exacta a la altura del plano oclusal, de modo que se aprecia la curva suave y cóncava que forman la punta del canino y las cúspides vestibulares de premolares y molares, base del modelo recortada y limpia, fondo azul grisáceo uniforme, iluminación lateral suave que resalta el relieve de las cúspides, enfoque nítido en toda la arcada. Evitar: texto, líneas dibujadas, flechas, etiquetas, logotipos, marcas de agua, burbujas o fracturas en el yeso, dientes deformes, número incorrecto de dientes.

### 04 · Tema 13.1 · figura 13.1.3 · 4:3

- **Identificador:** `anatomia-dental/m13/03`
- **Qué muestra:** Vista desde lingual de molares de tipodonto en oclusión, con las cúspides linguales superiores apoyadas en las fosas inferiores.
- **Pie en la lectura:** Vista desde lingual: las cúspides linguales superiores, de soporte, descansan en las fosas de los molares inferiores.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía macro de estudio de la región posterior de un tipodonto dental en oclusión, vista desde el lado lingual, primer y segundo molar superior e inferior y segundo premolar, se aprecia cómo las cúspides linguales superiores, anchas y redondeadas, descansan dentro de las fosas centrales de los molares inferiores, dientes de resina color marfil con anatomía correcta, encía de silicona rosa, fondo gris oscuro, iluminación difusa con ligera luz rasante que resalta el relieve oclusal, enfoque nítido. Evitar: texto, flechas, etiquetas, logotipos, marcas de agua, dientes deformes, número incorrecto de cúspides, colores irreales.

### 05 · Tema 13.2 · figura 13.2.1 · 4:3

- **Identificador:** `anatomia-dental/m13/04`
- **Qué muestra:** Vista lateral de tipodonto en clase I molar y canina, con la cúspide mesiovestibular superior sobre el surco vestibular inferior.
- **Pie en la lectura:** Relación molar y canina de clase I en un tipodonto: compárala con el diagrama anterior.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía macro de estudio de un tipodonto dental de dentición permanente en oclusión, vista vestibular lateral izquierda centrada en el canino, los premolares y el primer molar, la cúspide mesiovestibular del primer molar superior alineada con el surco vestibular del primer molar inferior y la punta del canino superior en la tronera entre el canino y el primer premolar inferiores, dientes de resina color marfil con anatomía correcta, encía de silicona rosa pálido, fondo gris neutro, iluminación difusa de estudio. Evitar: texto, líneas dibujadas, flechas, etiquetas, logotipos, marcas de agua, dientes deformes, número incorrecto de cúspides.

### 06 · Tema 13.2 · figura 13.2.2 · 4:3

- **Identificador:** `anatomia-dental/m13/05`
- **Qué muestra:** Manos con guantes miden con una sonda periodontal la distancia horizontal entre incisivos superiores e inferiores de un tipodonto.
- **Pie en la lectura:** La sobremordida horizontal se mide con una sonda milimetrada apoyada en la cara vestibular del incisivo inferior.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica realista en primer plano: manos con guantes de nitrilo azul sostienen una sonda periodontal milimetrada de acero apoyada horizontalmente desde la cara vestibular de un incisivo central inferior hasta el borde incisal del incisivo central superior, en un tipodonto de dentición permanente en oclusión colocado sobre una mesa clínica limpia, vista lateral, dientes con anatomía correcta, encía de silicona rosa, iluminación clínica blanca y uniforme, fondo desenfocado de consultorio, colores naturales. Evitar: texto legible, números impresos ampliados, logotipos, marcas de agua, manos sin guantes, sangre, dientes deformes, rostros.

### 07 · Tema 13.2 · figura 13.2.3 · 4:3

- **Identificador:** `anatomia-dental/m13/06`
- **Qué muestra:** Vista frontal de un tipodonto con incisivos centrales superiores retroinclinados que cubren casi por completo a los inferiores.
- **Pie en la lectura:** Patrón de clase II división 2: centrales superiores retroinclinados y sobremordida vertical profunda.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía de estudio realista de un tipodonto dental de dentición permanente en oclusión, vista frontal ligeramente lateral, incisivos centrales superiores retroinclinados hacia palatino que cubren casi por completo las coronas de los incisivos inferiores, incisivos laterales superiores inclinados hacia vestibular, caninos y premolares visibles, dientes de resina color marfil con anatomía correcta, encía de silicona rosa pálido, fondo gris claro uniforme, iluminación difusa suave, enfoque nítido en el sector anterior. Evitar: texto, flechas, etiquetas, logotipos, marcas de agua, rostros, labios, dientes deformes, número incorrecto de dientes.

### 08 · Tema 13.3 · figura 13.3.1 · 4:3

- **Identificador:** `anatomia-dental/m13/07`
- **Qué muestra:** Odontólogo con guantes guía suavemente la mandíbula de un paciente reclinado, del que solo se ven mentón y labios.
- **Pie en la lectura:** La manipulación bilateral guía la mandíbula con suavidad para registrar la relación céntrica; nunca se fuerza.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica realista en un consultorio dental luminoso: un odontólogo con guantes de nitrilo, bata desechable, cubrebocas y lentes de protección coloca ambas manos con suavidad sobre el borde inferior de la mandíbula de un paciente adulto reclinado, pulgares sobre el mentón, encuadre cerrado que muestra solo la parte inferior del rostro del paciente desde los labios hasta el cuello, con babero, piel de aspecto natural, luz blanca suave, fondo desenfocado de la unidad dental, colores naturales. Evitar: texto, logotipos, marcas de agua, ojos o rostro completo del paciente, gesto de dolor, presión exagerada, manos sin guantes, sangre.

### 09 · Tema 13.3 · figura 13.3.2 · 4:3

- **Identificador:** `anatomia-dental/m13/08`
- **Qué muestra:** Modelos de yeso superior e inferior montados en un articulador semiajustable sobre una mesa de laboratorio.
- **Pie en la lectura:** Montar modelos en articulador con un registro de relación céntrica permite estudiar contactos y deslizamientos fuera de la boca.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía de estudio realista de un articulador dental semiajustable metálico con modelos de yeso superior e inferior de una dentición permanente completa montados con yeso de montaje, vista lateral tres cuartos, los dientes en oclusión, mesa de laboratorio dental blanca y limpia, al fondo desenfocado un recortador de modelos y una espátula, iluminación difusa y uniforme, colores naturales, enfoque nítido en los modelos y en la guía condilar. Evitar: texto, escalas legibles, marcas comerciales, logotipos, marcas de agua, yeso fracturado, dientes deformes, manos sin guantes.

### 10 · Tema 13.3 · figura 13.3.3 · 1:1

- **Identificador:** `anatomia-dental/m13/09`
- **Qué muestra:** Regla milimetrada de plástico medida entre bordes incisales de un tipodonto con la boca abierta.
- **Pie en la lectura:** La apertura máxima se mide entre los bordes incisales superiores e inferiores; es un dato básico del examen funcional.
- **Tamaño:** 1400 × 1400 px

**Prompt:**

> Fotografía de estudio realista de un tipodonto dental con articulación de bisagra abierto al máximo, una regla milimetrada de plástico transparente colocada verticalmente entre el borde incisal del incisivo central superior y el borde incisal del incisivo central inferior, sostenida por una mano con guante de nitrilo azul, dientes de resina color marfil con anatomía correcta, fondo gris claro uniforme, iluminación difusa suave, enfoque nítido en la regla y los incisivos. Evitar: números ampliados o legibles, texto, logotipos, marcas de agua, manos sin guantes, rostros, dientes deformes.

### 11 · Tema 13.4 · figura 13.4.1 · 4:3

- **Identificador:** `anatomia-dental/m13/10`
- **Qué muestra:** Vista lateral de tipodonto en protrusión con incisivos borde a borde y molares separados.
- **Pie en la lectura:** En protrusión con guía anterior adecuada, los incisivos contactan borde a borde y los molares quedan separados.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía de estudio realista de un tipodonto dental de dentición permanente completa, vista lateral derecha, con la mandíbula adelantada de modo que los incisivos superiores e inferiores contactan borde a borde mientras se aprecia un espacio claro entre las cúspides de premolares y molares superiores e inferiores, dientes de resina color marfil con anatomía correcta, encía de silicona rosa pálido, fondo gris neutro liso, iluminación difusa de estudio con ligero contraluz que resalta el espacio entre los posteriores. Evitar: texto, flechas, etiquetas, logotipos, marcas de agua, dientes deformes, rostros, colores artificiales.

### 12 · Tema 13.4 · figura 13.4.2 · 4:3

- **Identificador:** `anatomia-dental/m13/11`
- **Qué muestra:** Boca de un adulto con retractor de labios en lateralidad derecha, con solo los caninos en contacto.
- **Pie en la lectura:** Guía canina: en lateralidad, los caninos del lado de trabajo contactan y los posteriores se separan.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica intraoral realista de un adulto con retractor de mejillas transparente, vista lateral derecha, la mandíbula desplazada hacia la derecha de modo que la punta del canino inferior contacta la cara palatina del canino superior y se observa un espacio entre premolares y molares superiores e inferiores, dentición permanente sana con anatomía correcta, encía rosa pálido, saliva natural, luz de flash clínico anular uniforme, fondo oscuro de la cavidad oral. Evitar: texto, flechas, logotipos, marcas de agua, nariz u ojos del paciente, sangre, caries extensas, restauraciones metálicas, dientes deformes.

### 13 · Tema 13.4 · figura 13.4.3 · 1:1

- **Identificador:** `anatomia-dental/m13/12`
- **Qué muestra:** Pinzas de Miller sostienen papel de articular sobre los molares de un tipodonto.
- **Pie en la lectura:** El papel de articular deja marcas que permiten distinguir contactos en cierre y en movimientos excéntricos.
- **Tamaño:** 1400 × 1400 px

**Prompt:**

> Fotografía clínica realista en primer plano: una mano con guante de nitrilo azul sostiene unas pinzas de Miller con una tira de papel de articular azul colocada sobre las superficies oclusales de los molares inferiores de un tipodonto de dentición permanente, se ven marcas puntuales azules en las cúspides de soporte de los molares, dientes de resina color marfil con anatomía correcta, fondo de mesa clínica blanca desenfocado, iluminación clínica uniforme, colores naturales. Evitar: texto, logotipos, marcas comerciales, marcas de agua, manos sin guantes, sangre, rostros, dientes deformes.

### 14 · Tema 13.5 · figura 13.5.1 · 4:3

- **Identificador:** `anatomia-dental/m13/13`
- **Qué muestra:** Tipodonto de dentición temporal completa en oclusión, con espacios entre los incisivos.
- **Pie en la lectura:** Dentición temporal con espacios fisiológicos entre los incisivos: una buena señal para la llegada de los permanentes.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía de estudio realista de un tipodonto pediátrico de dentición temporal completa con veinte dientes temporales en oclusión, vista frontal ligeramente lateral, coronas blancas y pequeñas con anatomía correcta de incisivos, caninos y molares temporales, pequeños espacios visibles entre los incisivos superiores e inferiores y entre el lateral y el canino superior, encía de silicona rosa, fondo gris claro uniforme, iluminación difusa suave, enfoque nítido. Evitar: texto, flechas, etiquetas, logotipos, marcas de agua, dientes permanentes, rostros infantiles, dientes deformes, caries.

### 15 · Tema 13.5 · figura 13.5.2 · 4:3

- **Identificador:** `anatomia-dental/m13/14`
- **Qué muestra:** Boca de un niño de unos nueve años con retractor, con diastema entre incisivos centrales superiores y laterales inclinados.
- **Pie en la lectura:** Fase del patito feo en dentición mixta: diastema central y laterales abiertos en abanico antes de la erupción de los caninos.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica intraoral realista de un niño de nueve años con retractor de mejillas pediátrico transparente, vista frontal, dentición mixta con incisivos centrales superiores permanentes separados por un diastema de pocos milímetros, incisivos laterales superiores inclinados hacia distal en abanico, caninos y molares temporales presentes, incisivos inferiores permanentes, encía sana rosa, luz de flash clínico uniforme, colores naturales, encuadre solo de dientes y encía. Evitar: texto, logotipos, marcas de agua, ojos, nariz o rostro del niño, sangre, caries extensas, aparatos de ortodoncia, dientes deformes.

### 16 · Tema 13.5 · figura 13.5.3 · 16:9

- **Identificador:** `anatomia-dental/m13/15`
- **Qué muestra:** Odontóloga con equipo de protección registra datos oclusales en una tableta junto a la unidad dental.
- **Pie en la lectura:** Documentar la oclusión con lenguaje descriptivo permite comparar en cada visita y comunicarse con otros especialistas.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía realista en un consultorio dental moderno de México: una odontóloga con guantes de nitrilo, bata desechable, cubrebocas y lentes de protección, vista de perfil, anota datos en una tableta electrónica apoyada en la mesa auxiliar, junto a ella sobre una charola hay modelos de estudio de yeso en oclusión, una sonda periodontal y pinzas con papel de articular; al fondo desenfocado la unidad dental vacía, luz natural suave mezclada con luz clínica, colores naturales, ambiente ordenado. Evitar: texto legible en la pantalla, logotipos, marcas de agua, pacientes identificables, manos sin guantes, desorden.

## Módulo 14 · Anatomía radiográfica de los dientes y sus estructuras de soporte

Carpeta: `imagenes-academia/01-anatomia-dental/modulo-14/` · 16 imágenes (6 de 16:9, 2 de 4:3, 8 de 3:4).

### 01 · Portada del módulo · 16:9

- **Identificador:** `anatomia-dental/m14/portada`
- **Qué muestra:** Monitor de un consultorio dental que muestra una radiografía panorámica normal junto a un sensor intraoral sobre la mesa.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía realista de gran formato en un consultorio dental moderno con luz ambiental suave: en primer plano un monitor de alta resolución que muestra una radiografía panorámica dental simulada en escala de grises de un adulto con anatomía normal, sobre el escritorio un sensor digital intraoral con funda de barrera, un posicionador de paralelismo y unas gafas de protección, al fondo desenfocado el cabezal de rayos X intraoral montado en la pared, colores naturales, profundidad de campo corta, ambiente ordenado. Evitar: texto legible, nombres, datos del paciente, logotipos, marcas comerciales, marcas de agua, personas, desorden.

### 02 · Tema 14.1 · figura 14.1.1 · 16:9

- **Identificador:** `anatomia-dental/m14/01`
- **Qué muestra:** Imagen radiográfica simulada de una serie de tres estudios: periapical de incisivos, aleta de mordida de premolares y molares, y oclusal maxilar.
- **Pie en la lectura:** Tres formatos intraorales: periapical, aleta de mordida y oclusal. Cada uno responde a una pregunta clínica distinta.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Composición realista de tres radiografías dentales intraorales simuladas en escala de grises, colocadas lado a lado sobre fondo negro: a la izquierda una periapical vertical de incisivos centrales superiores con raíces y ápices completos y hueso circundante; al centro una aleta de mordida horizontal de premolares y molares superiores e inferiores que muestra coronas y crestas alveolares; a la derecha una radiografía oclusal maxilar con el arco dentario en forma de herradura. Anatomía normal de un adulto, contraste diagnóstico, sin restauraciones extensas. Evitar: texto, letras, números, nombres, fechas, marcas de orientación, flechas, etiquetas, logotipos, artefactos exagerados.

### 03 · Tema 14.1 · figura 14.1.2 · 16:9

- **Identificador:** `anatomia-dental/m14/02`
- **Qué muestra:** Imagen radiográfica panorámica simulada de un adulto con dentición permanente completa y anatomía normal.
- **Pie en la lectura:** La panorámica ofrece un panorama de ambos maxilares, pero con menos detalle que las radiografías intraorales.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Radiografía panorámica dental simulada realista en escala de grises de un adulto joven con dentición permanente completa de 32 dientes bien alineados, ambos maxilares, ramas y cóndilos mandibulares visibles, senos maxilares y paladar duro en la parte superior, conducto mandibular tenue, contraste diagnóstico equilibrado, posicionamiento correcto con plano oclusal en ligera sonrisa, anatomía normal sin restauraciones ni lesiones. Evitar: texto, letras, números, nombres, fechas, marcas de lado, flechas, etiquetas, logotipos, artefactos de movimiento, dientes deformes, número incorrecto de dientes.

### 04 · Tema 14.1 · figura 14.1.3 · 4:3

- **Identificador:** `anatomia-dental/m14/03`
- **Qué muestra:** Asistente dental con guantes coloca un sensor digital en un posicionador de paralelismo sobre una charola.
- **Pie en la lectura:** Los posicionadores de paralelismo ayudan a obtener imágenes reproducibles y a evitar repeticiones.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Fotografía clínica realista en primer plano de las manos de una asistente dental con guantes de nitrilo azul y bata desechable colocando un sensor digital intraoral cubierto con funda de barrera plástica transparente en un posicionador de paralelismo con anillo de alineación, sobre una charola clínica limpia, al fondo desenfocado el cabezal de un equipo de rayos X intraoral montado en la pared, iluminación clínica uniforme, colores naturales, enfoque nítido en el sensor y el posicionador. Evitar: texto, marcas comerciales, logotipos, marcas de agua, manos sin guantes, rostros, pacientes, desorden.

### 05 · Tema 14.2 · figura 14.2.1 · 3:4

- **Identificador:** `anatomia-dental/m14/04`
- **Qué muestra:** Radiografía periapical simulada de un primer molar inferior sano con cámara pulpar, conductos, ligamento periodontal y lámina dura visibles.
- **Pie en la lectura:** Molar inferior sano: esmalte, dentina, cámara pulpar, conductos, espacio del ligamento periodontal y lámina dura continuos.
- **Tamaño:** 1200 × 1600 px

**Prompt:**

> Radiografía periapical dental simulada realista en escala de grises, orientación vertical, de un primer molar inferior permanente sano de un adulto joven con sus dos raíces mesial y distal completas hasta más allá de los ápices, esmalte muy radiopaco en la corona, dentina homogénea, cámara pulpar y conductos radiolúcidos, línea radiolúcida fina del ligamento periodontal y línea radiopaca continua de la lámina dura alrededor de ambas raíces, hueso trabecular mandibular de patrón grueso, crestas alveolares sanas, contraste diagnóstico. Evitar: texto, letras, números, flechas, etiquetas, nombres, fechas, restauraciones, caries, lesiones, artefactos, dientes deformes.

### 06 · Tema 14.2 · figura 14.2.2 · 4:3

- **Identificador:** `anatomia-dental/m14/05`
- **Qué muestra:** Radiografía de aleta de mordida simulada de premolares y molares con crestas alveolares planas y corticales nítidas.
- **Pie en la lectura:** En la aleta de mordida las crestas posteriores sanas se ven planas, con cortical continua y cerca de las uniones amelocementarias.
- **Tamaño:** 1600 × 1200 px

**Prompt:**

> Radiografía dental de aleta de mordida simulada realista en escala de grises, orientación horizontal, de premolares y molares superiores e inferiores de un adulto joven sano, coronas con esmalte radiopaco y dentina, cámaras pulpares radiolúcidas, contactos proximales abiertos sin traslape, crestas alveolares interproximales planas con cortical radiopaca continua situadas poco por debajo de las uniones amelocementarias, hueso trabecular visible, contraste diagnóstico equilibrado. Evitar: texto, letras, números, flechas, etiquetas, nombres, fechas, caries, restauraciones, cálculo, pérdida ósea, artefactos, dientes deformes.

### 07 · Tema 14.2 · figura 14.2.3 · 3:4

- **Identificador:** `anatomia-dental/m14/06`
- **Qué muestra:** Radiografía periapical simulada de la zona de molares temporales inferiores de un niño con el germen del premolar entre sus raíces.
- **Pie en la lectura:** Dentición mixta: el germen del segundo premolar, rodeado por su folículo, se aloja entre las raíces del segundo molar temporal en reabsorción.
- **Tamaño:** 1200 × 1600 px

**Prompt:**

> Radiografía periapical dental simulada realista en escala de grises, orientación vertical, de la región posterior inferior de un niño de ocho años: segundo molar temporal con raíces divergentes parcialmente reabsorbidas, entre ellas el germen del segundo premolar con corona formada rodeado por un folículo radiolúcido con borde cortical fino, distal a ellos el primer molar permanente con raíces en formación y ápices abiertos, hueso trabecular normal, contraste diagnóstico. Evitar: texto, letras, números, flechas, etiquetas, nombres, fechas, caries, restauraciones, lesiones, artefactos, dientes deformes.

### 08 · Tema 14.3 · figura 14.3.1 · 3:4

- **Identificador:** `anatomia-dental/m14/07`
- **Qué muestra:** Radiografía periapical simulada de incisivos centrales superiores con sutura media, agujero incisivo y piso de la fosa nasal.
- **Pie en la lectura:** Periapical de centrales superiores: la sutura intermaxilar, el agujero incisivo entre las raíces y, arriba, el piso de las fosas nasales.
- **Tamaño:** 1200 × 1600 px

**Prompt:**

> Radiografía periapical dental simulada realista en escala de grises, orientación vertical, de incisivos centrales superiores permanentes sanos de un adulto, raíces completas con lámina dura continua, entre ambas raíces una línea radiolúcida delgada vertical de la sutura media y por encima de los ápices una zona radiolúcida ovalada del agujero incisivo, en la parte superior las fosas nasales radiolúcidas separadas por el tabique radiopaco y el piso nasal como línea blanca, espina nasal anterior en forma de V, contraste diagnóstico. Evitar: texto, letras, números, flechas, etiquetas, nombres, fechas, restauraciones, lesiones, artefactos, dientes deformes.

### 09 · Tema 14.3 · figura 14.3.2 · 3:4

- **Identificador:** `anatomia-dental/m14/08`
- **Qué muestra:** Radiografía periapical simulada de molares superiores con el seno maxilar, su piso curvo y la apófisis cigomática en forma de U.
- **Pie en la lectura:** Periapical de molares superiores: el piso del seno maxilar desciende entre las raíces y la apófisis cigomática dibuja una U por encima.
- **Tamaño:** 1200 × 1600 px

**Prompt:**

> Radiografía periapical dental simulada realista en escala de grises, orientación vertical, de premolares y molares superiores permanentes sanos de un adulto, sobre los ápices una zona radiolúcida amplia del seno maxilar limitada por una línea cortical radiopaca fina que desciende ligeramente entre las raíces de los molares, un tabique delgado dentro del seno, por encima del primer molar una radiopacidad en forma de U de la apófisis cigomática, hueso trabecular fino y granular, contraste diagnóstico. Evitar: texto, letras, números, flechas, etiquetas, nombres, fechas, restauraciones, lesiones, opacificación del seno, artefactos, dientes deformes.

### 10 · Tema 14.3 · figura 14.3.3 · 3:4

- **Identificador:** `anatomia-dental/m14/09`
- **Qué muestra:** Radiografía periapical simulada de la tuberosidad del maxilar con tercer molar, apófisis hamular y sombra de la apófisis coronoides.
- **Pie en la lectura:** Región de la tuberosidad: la sombra triangular de la coronoides mandibular y la apófisis hamular aparecen detrás del último molar.
- **Tamaño:** 1200 × 1600 px

**Prompt:**

> Radiografía periapical dental simulada realista en escala de grises, orientación vertical, de la región posterior del maxilar de un adulto: segundo y tercer molar superiores sanos, distal a ellos la tuberosidad redondeada con cortical fina, detrás una pequeña proyección radiopaca en forma de gancho, y superpuesta en la parte inferior una sombra triangular radiopaca con el vértice hacia arriba que corresponde a la apófisis coronoides mandibular, seno maxilar radiolúcido en la parte superior, hueso trabecular fino, contraste diagnóstico. Evitar: texto, letras, números, flechas, etiquetas, nombres, fechas, restauraciones, lesiones, artefactos, dientes deformes.

### 11 · Tema 14.4 · figura 14.4.1 · 3:4

- **Identificador:** `anatomia-dental/m14/10`
- **Qué muestra:** Radiografía periapical simulada de incisivos inferiores con tubérculos geni y agujero lingual bajo los ápices.
- **Pie en la lectura:** Periapical de incisivos inferiores: el anillo radiopaco de los tubérculos geni con el agujero lingual en su centro, por debajo de los ápices.
- **Tamaño:** 1200 × 1600 px

**Prompt:**

> Radiografía periapical dental simulada realista en escala de grises, orientación vertical, de incisivos centrales y laterales inferiores permanentes sanos de un adulto, raíces completas con lámina dura continua, por debajo de los ápices en la línea media un anillo radiopaco redondeado con un pequeño punto radiolúcido central, una banda radiopaca tenue en forma de V invertida de la protuberancia mentoniana, canales nutricios finos verticales entre raíces, hueso trabecular mandibular, contraste diagnóstico. Evitar: texto, letras, números, flechas, etiquetas, nombres, fechas, restauraciones, cálculo, lesiones, artefactos, dientes deformes.

### 12 · Tema 14.4 · figura 14.4.2 · 3:4

- **Identificador:** `anatomia-dental/m14/11`
- **Qué muestra:** Radiografía periapical simulada de premolares inferiores con el agujero mentoniano cerca del ápice del segundo premolar.
- **Pie en la lectura:** Agujero mentoniano junto al ápice del segundo premolar: la lámina dura del diente permanece continua.
- **Tamaño:** 1200 × 1600 px

**Prompt:**

> Radiografía periapical dental simulada realista en escala de grises, orientación vertical, de canino y premolares inferiores permanentes sanos de un adulto, raíces completas con espacio del ligamento y lámina dura continuos, cerca del ápice del segundo premolar y ligeramente por debajo una zona radiolúcida ovalada de bordes suaves que corresponde al agujero mentoniano, hacia distal el inicio tenue del conducto mandibular como banda radiolúcida con bordes radiopacos, hueso trabecular de patrón grueso, contraste diagnóstico. Evitar: texto, letras, números, flechas, etiquetas, nombres, fechas, restauraciones, lesiones, artefactos, dientes deformes.

### 13 · Tema 14.4 · figura 14.4.3 · 3:4

- **Identificador:** `anatomia-dental/m14/12`
- **Qué muestra:** Radiografía periapical simulada de molares inferiores con líneas oblicua externa y milohioidea, conducto mandibular y fosa submandibular.
- **Pie en la lectura:** Molares inferiores: la línea oblicua externa arriba, la milohioidea más abajo y, por debajo, la fosa submandibular y el conducto mandibular.
- **Tamaño:** 1200 × 1600 px

**Prompt:**

> Radiografía periapical dental simulada realista en escala de grises, orientación vertical, de primer, segundo y tercer molar inferiores permanentes sanos de un adulto, una línea radiopaca oblicua que desciende hacia delante cerca de la región cervical de los molares, otra línea radiopaca más baja que cruza las raíces, por debajo de los ápices una banda radiolúcida horizontal con bordes radiopacos finos del conducto mandibular y una zona radiolúcida con trabéculas escasas, hueso trabecular de patrón grueso con trabéculas horizontales, contraste diagnóstico. Evitar: texto, letras, números, flechas, etiquetas, nombres, fechas, restauraciones, lesiones, artefactos, dientes deformes.

### 14 · Tema 14.5 · figura 14.5.1 · 16:9

- **Identificador:** `anatomia-dental/m14/13`
- **Qué muestra:** Radiografía panorámica simulada de un adulto con paladar duro, senos maxilares, cóndilos, apófisis estiloides e hioides visibles.
- **Pie en la lectura:** Panorámica normal: además de dientes y maxilares, aparecen articulaciones, apófisis estiloides, hioides, tejidos blandos y espacios aéreos.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Radiografía panorámica dental simulada realista en escala de grises de un adulto con dentición permanente completa y anatomía normal, se aprecian el paladar duro como banda radiopaca horizontal sobre los ápices superiores, senos maxilares y fosas nasales, arcos cigomáticos, cóndilos y eminencias articulares a ambos lados, apófisis coronoides, ramas y conductos mandibulares, apófisis estiloides delgadas detrás de las ramas, hueso hioides en la parte inferior, posicionamiento correcto con lengua contra el paladar, contraste diagnóstico. Evitar: texto, letras, números, nombres, fechas, marcas de lado, flechas, etiquetas, logotipos, aretes, artefactos metálicos, dientes deformes.

### 15 · Tema 14.5 · figura 14.5.2 · 16:9

- **Identificador:** `anatomia-dental/m14/14`
- **Qué muestra:** Radiografía panorámica simulada con banda radiolúcida sobre los ápices superiores por la lengua separada del paladar.
- **Pie en la lectura:** Lengua separada del paladar: el espacio palatogloso aparece como una banda oscura sobre los ápices superiores.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Radiografía panorámica dental simulada realista en escala de grises de un adulto con dentición permanente completa y anatomía normal, con una banda radiolúcida horizontal oscura que cruza por encima de los ápices de los dientes superiores entre el dorso de la lengua y el paladar duro, resto de la imagen con contraste diagnóstico, ramas y cóndilos simétricos, plano oclusal en ligera sonrisa, sin lesiones. Evitar: texto, letras, números, nombres, fechas, marcas de lado, flechas, etiquetas, logotipos, aretes, artefactos metálicos, dientes deformes, asimetrías exageradas.

### 16 · Tema 14.5 · figura 14.5.3 · 16:9

- **Identificador:** `anatomia-dental/m14/15`
- **Qué muestra:** Odontólogo con cubrebocas revisa una radiografía panorámica en un monitor en un consultorio con luz tenue.
- **Pie en la lectura:** La interpretación se hace en un monitor adecuado, con luz ambiental tenue y siguiendo siempre la misma secuencia.
- **Tamaño:** 1920 × 1080 px

**Prompt:**

> Fotografía realista en un consultorio dental moderno con luz ambiental tenue: un odontólogo con bata clínica y cubrebocas, visto de espaldas y de perfil parcial sin rostro identificable, observa en un monitor de alta resolución una radiografía panorámica dental en escala de grises de anatomía normal, la mano sobre el ratón, escritorio ordenado con modelos de estudio de yeso a un lado, iluminación suave que favorece la lectura de la pantalla, colores naturales. Evitar: texto legible en pantalla, nombres o datos del paciente, logotipos, marcas comerciales, marcas de agua, rostro identificable, desorden.

## Resumen

| Módulo | Título | Imágenes |
| --- | --- | --- |
| 1 | La cavidad oral: límites, regiones y funciones | 16 |
| 2 | Mucosa oral, encía y glándulas salivales | 16 |
| 3 | Huesos maxilares, articulación temporomandibular y músculos de la masticación | 16 |
| 4 | Irrigación e inervación de la región oral | 16 |
| 5 | Odontogénesis: cómo se forma un diente | 16 |
| 6 | Tejidos dentarios: esmalte, dentina, pulpa y cemento | 16 |
| 7 | Periodonto de inserción: ligamento periodontal y hueso alveolar | 16 |
| 8 | Nomenclatura dental y sistemas de numeración FDI y universal | 16 |
| 9 | Dentición temporal y cronología de la erupción | 16 |
| 10 | Anatomía de incisivos y caninos permanentes | 16 |
| 11 | Anatomía de premolares permanentes | 16 |
| 12 | Anatomía de molares permanentes | 16 |
| 13 | Oclusión: relaciones entre arcadas y movimientos mandibulares | 16 |
| 14 | Anatomía radiográfica de los dientes y sus estructuras de soporte | 16 |

**Total del programa: 224 imágenes.**

## Revisión antes de entregar

- [ ] Ninguna imagen tiene texto, letras ni logotipos.
- [ ] La anatomía dental (número de cúspides, raíces, dentición) es correcta.
- [ ] Personas con equipo de protección; sin rostros identificables.
- [ ] La proporción es la indicada (el importador la revisa).
- [ ] Cada imagen está en la carpeta de su módulo.
