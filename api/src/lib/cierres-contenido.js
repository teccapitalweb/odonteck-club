// Repasos formativos vinculados a los apuntes del catálogo. No son una certificación clínica.
// Cada fila: clase, concepto (índice), pregunta, respuesta, distractores.
const bancos = {
 'diagnostico-en-ortodoncia-para-odontologos-generales': [
 [1,0,'¿Qué dimensiones integra la valoración ortodóncica?','Estética, función, periodonto y bienestar','Solo alineación de los incisivos','Únicamente el color de los dientes'],
 [1,4,'Una persona solicita alineadores por su apariencia. ¿Qué debe orientar la elección del sistema?','Diagnóstico, complejidad de movimientos y colaboración','La preferencia estética como único criterio','Usar el mismo sistema en todos los casos'],
 [5,2,'Al integrar SNA, SNB y ANB, ¿qué idea debes conservar?','Se interpretan junto con crecimiento y otros hallazgos','Un ángulo aislado define todo el tratamiento','Sustituyen la historia clínica'] ],
 'diagnostico-y-clasificacion-de-la-caries-dental': [
 [1,0,'¿Qué conjunto explica el carácter multifactorial de la caries?','Biofilm, azúcares, huésped y tiempo','Solo la edad del paciente','Solo la forma de la corona'],
 [2,0,'En un ejercicio de observación se describe una lesión blanca, opaca y rugosa. ¿Qué tema del curso ayuda a interpretarla?','Actividad de la lesión','Clasificación de recesiones','Torque ortodóncico'],
 [3,1,'¿Qué evaluación individual acompaña la planificación del manejo de caries?','Riesgo cariogénico','Color de los brackets','Tipo de sutura'] ],
 'endodoncia-pediatrica-manejo-de-los-canales-radiculares-en-ninos': [
 [1,1,'¿Qué describe la pulpotomía en los apuntes?','Retirar pulpa cameral y conservar pulpa radicular vital','Retirar una corona provisional','Medir la línea media dental'],
 [2,0,'En un repaso sobre obturación de dientes primarios, ¿qué propiedad del material se destaca?','Que sea reabsorbible','Que impida toda reabsorción radicular','Que funcione como un bracket'],
 [1,0,'¿Qué distinción diagnóstica es fundamental en este curso?','Pulpa vital frente a necrótica','Esmalte opaco frente a resina pulida','Brackets linguales frente a vestibulares'] ],
 'extracciones-simples': [
 [1,0,'¿Qué se integra en la evaluación previa?','Historia clínica, radiografía y comorbilidades','Solo el número del diente','Solo la preferencia de instrumental'],
 [1,1,'Antes de comenzar una extracción en el ejercicio del curso, ¿qué debe verificarse?','La profundidad de la anestesia','El color de la restauración futura','La elección de un alineador'],
 [3,1,'¿Qué parte del proceso continúa después de la extracción?','Indicaciones postoperatorias y prevención de complicaciones','Omitir las instrucciones al paciente','Cerrar el caso sin seguimiento indicado'] ],
 'ferulas-de-contencion-en-odontopediatria-tipos-tiempos-y-materiales': [
 [1,1,'Según el bloque de mantenedores de espacio, ¿qué aparatos se mencionan?','Banda-ansa, arco lingual y Nance','Curetas Gracey y ultrasonido','Matrices y discos de pulido'],
 [2,1,'En el seguimiento de un aparato cementado, ¿qué aspecto destaca el curso?','Cementado adecuado y controles periódicos','Evitar cualquier revisión posterior','Evaluar únicamente su color'],
 [3,0,'¿Qué hábito debe reforzarse alrededor del aparato?','Higiene cuidadosa','Suspender la higiene de esa zona','Omitir las instrucciones de cuidado'] ],
 'manejo-de-abscesos-periodontales': [
 [1,1,'¿Qué conjunto de signos se repasa en este curso?','Bolsa profunda, exudado, dolor y movilidad','Torque, apiñamiento y línea media','Color, translucidez y pulido'],
 [3,0,'Al revisar el pronóstico de un caso del curso, ¿qué hallazgo se considera desfavorable?','Compromiso de furca','El nombre comercial del cepillo','El color de los guantes'],
 [3,1,'¿Qué medida de mantenimiento se destaca para reducir recurrencias?','Control de placa','Omitir la higiene interdental','Evitar el seguimiento periodontal'] ],
 'materiales-dentales-restauradores-indicaciones-y-usos': [
 [1,0,'¿Qué propiedades del ionómero de vidrio se destacan?','Adhesión química y liberación de flúor','Movimiento ortodóncico y retención','Reabsorción de raíces primarias'],
 [2,0,'En un ejercicio de diseño de cavidad para amalgama, ¿qué concepto debes recordar?','Retención mecánica','Attachments para alineadores','Clasificación de Cairo'],
 [3,1,'¿Cómo se integra la selección del material restaurador?','Según el caso y el riesgo de caries','Con un único material para toda situación','Solo por el envase del producto'] ],
 'ortodoncia-lingual-y-estetica': [
 [1,0,'¿Qué opciones estéticas presenta el curso?','Brackets cerámicos, linguales y alineadores','Curetas, elevadores y fórceps','MTA, suturas y colgajos'],
 [2,1,'En un ejercicio sobre movimientos con alineadores, ¿qué recurso se menciona?','Attachments','Pónticos ovoides','Curetas Gracey'],
 [3,0,'Al terminar el tratamiento, ¿qué concepto se relaciona con evitar la recidiva?','Retención','Selección de color','Preparación retrógrada'] ],
 'patologias-dentales-mas-comunes-en-la-infancia': [
 [1,1,'¿Qué características se asocian con MIH en el curso?','Opacidades demarcadas y esmalte frágil','Torque e inclinación radicular','Cenit gingival y corredores bucales'],
 [2,1,'En un ejercicio de vocabulario aparece “frenillo lingual corto”. ¿Qué término corresponde?','Anquiloglosia','Avulsión','Retroobturación'],
 [3,0,'¿Qué referencia ayuda a estudiar la aparición de los dientes?','Cronología normal de erupción','Orden de pulido de resinas','Secuencia de cementado protésico'] ],
 'periodoncia-estetica-manejo-de-encia-y-diseno-de-sonrisa': [
 [2,0,'¿Qué elementos se revisan al estudiar los márgenes gingivales?','Cenit gingival y simetría','Torque y attachments','Pulpotomía y pulpectomía'],
 [3,0,'En el análisis de una fotografía de sonrisa, ¿qué elementos forman parte de la visión global?','Corredores bucales y línea media dental/facial','Solo el nombre de la cámara','Solo el color del fondo'],
 [3,1,'¿Qué enfoque resume la planificación estética del curso?','Integrar el plan de forma global','Evaluar cada detalle sin relacionarlo con los demás','Definir el resultado usando una sola medida'] ],
 'periodoncia-estetica-y-plastica': [
 [1,0,'¿Qué clasificación de recesiones se menciona?','Cairo: RT1, RT2 y RT3','ICDAS: 0 a 6','SNA, SNB y ANB'],
 [2,0,'En un repaso sobre aumento de encía queratinizada, ¿qué procedimiento se estudia?','Injerto gingival libre','Retroobturación','Estratificación de resina'],
 [3,0,'¿Qué tema conecta una extracción con el mantenimiento de tejidos para rehabilitación?','Preservación del reborde','Selección de brackets','Fotopolimerización'] ],
 'raspado-y-alisado-radicular': [
 [1,0,'¿Cuál es el objetivo de la instrumentación descrita?','Remover placa y cálculo subgingival y desorganizar el biofilm','Cambiar el color del esmalte','Producir movimiento ortodóncico'],
 [2,1,'Una cureta pierde eficacia en un ejercicio de instrumentación. ¿Qué tema debes repasar?','Afilado para mantener el filo','Selección de color','Clasificación de caries'],
 [3,1,'¿Qué debe planificarse tras la fase de tratamiento?','Mantenimiento periódico individualizado','La misma frecuencia para todos sin evaluación','Cerrar el seguimiento definitivamente'] ],
 'rehabilitacion-oral-estetica-con-coronas-y-puentes': [
 [1,1,'¿Qué material de impresión se menciona para precisión?','Silicona de adición','Pasta endodóntica reabsorbible','Cemento de banda ortodóncica'],
 [2,0,'En la fase provisional de un caso, ¿qué funciones debes considerar?','Proteger preparación, encía y oclusión','Solo reproducir el color','Reemplazar todos los controles posteriores'],
 [3,1,'¿Qué aspectos se revisan al final de la rehabilitación descrita?','Cementado y control de la oclusión','Solo la fotografía de entrega','Solo el nombre del laboratorio'] ],
 'resinas-compuestas-seleccion-manipulacion-y-tecnicas-de-estratificacion': [
 [1,0,'¿Qué recurso de aislamiento presenta el curso?','Dique de goma','Arco lingual','Cureta Gracey'],
 [2,1,'En un ejercicio de estratificación, ¿qué relación óptica se repasa?','Dentina opaca y esmalte translúcido','Dentina translúcida y esmalte siempre opaco','Ambas capas idénticas en toda restauración'],
 [3,1,'¿Qué aporta el pulido final según el curso?','Brillo y menor acúmulo de placa','Movimiento de la raíz','Reabsorción del material radicular'] ],
 'retroobturacion-en-endodoncia-tecnicas-y-materiales': [
 [1,1,'¿Qué tema corresponde al acceso quirúrgico estudiado?','Colgajo y acceso al ápice','Attachments y alineadores','Cenit y línea media'],
 [2,1,'En un ejercicio de preparación retrógrada, ¿qué instrumental se menciona?','Puntas ultrasónicas','Fórceps de extracción como único recurso','Discos de pulido estético'],
 [3,1,'¿Qué etapa acompaña el cierre del procedimiento en el curso?','Sutura y control postoperatorio','Omitir el seguimiento','Terminar sin instrucciones'] ],
 'salud-oral-en-pacientes-con-condiciones-sistemicas': [
 [1,0,'¿Qué relación se describe entre diabetes y periodonto?','Bidireccional','Sin relación posible','Solo relacionada con el color del diente'],
 [2,1,'En una revisión de antecedentes aparecen bifosfonatos. ¿Qué tema del curso debes consultar?','Riesgo de osteonecrosis de los maxilares','Clasificación de brackets estéticos','Selección de tonos de resina'],
 [3,1,'¿Qué aspecto de valoración se destaca en personas con hipertensión?','Control de presión y uso juicioso del vasoconstrictor','Ignorar la presión si no hay dolor','Elegir anestesia solo por preferencia comercial'] ],
 'tratamientos-periodontales-no-quirurgicos-tecnicas-clinicas-para-el-control-de-la-enfermedad-periodontal': [
 [1,0,'¿Qué incluye la fase inicial descrita?','Control de placa y raspado/alisado','Solo un enjuague para todos los casos','Solo rehabilitación protésica'],
 [1,1,'Para comparar la evolución en un ejercicio de seguimiento, ¿qué índices se mencionan?','Placa y sangrado','Color y translucidez','SNA y SNB'],
 [3,0,'Tras la fase inicial, ¿qué paso permite valorar lo pendiente?','Reevaluación y manejo de bolsas residuales','Dar todos los casos por resueltos','Omitir nuevas mediciones'] ],
 'traumatismos-dentales-en-ninos': [
 [1,0,'¿Qué categorías forman parte de la clasificación repasada?','Concusión, subluxación, luxaciones, avulsión y fracturas','RT1, RT2 y RT3','SNA, SNB y ANB'],
 [2,1,'Al repasar la ferulización en distintos traumatismos, ¿qué orienta su elección según el curso?','El tipo de lesión','El mismo esquema para todas las lesiones','Solo la edad del profesional'],
 [3,0,'¿Qué aspecto debe seguirse después del traumatismo?','Vitalidad pulpar','Solo el color del protector bucal','Solo la posición de la silla'] ],
};

export function crearCierre(curso) {
 let filas=bancos[curso.id]; if(!filas)return null;
 // Production still has the original Angle/space-analysis module. Keep its
 // closing exercise aligned with those notes without overwriting the course.
 if(curso.id==='diagnostico-en-ortodoncia-para-odontologos-generales' && curso.clases[0]?.notas?.conceptos?.[0]?.texto.includes('Clasificación de Angle'))filas=[
   [1,0,'¿Qué relación se usa en la clasificación de Angle presentada?','La relación del primer molar','El color del incisivo central','La forma de una restauración'],
   [2,0,'En un ejercicio de apiñamiento, ¿qué comparación orienta el análisis de espacio?','Espacio disponible frente al requerido','Solo el ancho de una fotografía','Solo el número de brackets'],
   [3,0,'Al integrar el diagnóstico, ¿qué grupo de hábitos se estudia?','Succión digital, deglución atípica y respiración bucal','Selección de color y pulido','Afilado de curetas e instrumentación'],
 ];
 const preguntas=filas.map(([n,i,q,correcta,...otras],paso)=>{
   const clase=curso.clases.find(c=>c.n===n), fuente=clase?.notas?.conceptos?.[i];
   if(!fuente?.texto)throw Error(`Falta la fuente del cierre ${curso.id}:${n}:${i}`);
   const opciones=[...otras]; const posicion=(paso+curso.id.length)%3; opciones.splice(posicion,0,correcta);
   return {q,opciones,correcta:posicion,tipo:['Recuerda','Aplica','Integra'][paso],fuente:{n,t:fuente.t,texto:fuente.texto,titulo:clase.titulo}};
 });
 return {version:1,titulo:curso.titulo,preguntas};
}

export function cierrePublico(cierre) {
 const {contenido,...estado}=cierre;
 return {...estado,titulo:contenido.titulo,preguntas:contenido.preguntas.map(({correcta,fuente,...p},i)=>({...p,fuente:{n:fuente.n,t:fuente.t,titulo:fuente.titulo},...(cierre.finalizado?{correcta,explicacion:fuente.texto,acierto:cierre.respuestas[i]===correcta}:{})}))};
}
