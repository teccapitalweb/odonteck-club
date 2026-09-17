# Contenido: materiales restauradores, urgencias pediátricas, instrumentación endodóntica, nota y receta, presentación de resinas.
from reportlab.lib.units import mm
from reportlab.platypus import Spacer, PageBreak, KeepTogether, Table, TableStyle, Paragraph
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfgen import canvas as pdfcanvas
from kit import *

W = 175 * mm

# ════════════════════════════════════════════════════════════════════
# 6. Guía de selección de materiales restauradores
# ════════════════════════════════════════════════════════════════════
def guia_materiales():
    meta = dict(title='Selección de materiales<br/>restauradores', short='Guía · Materiales restauradores', eyebrow='Guía clínica · Materiales dentales',
                subtitle='Resinas, ionómeros, amalgama y cerámicas: indicaciones, límites y claves de manipulación para elegir con criterio.')
    s = [P('Cómo elegir', 'h1'),
         P('No existe un material universal. La elección depende de cuatro preguntas: ¿cuánto tejido queda?, ¿qué riesgo de caries tiene el paciente?, ¿puedo controlar la humedad? y ¿qué exigencia estética y de carga tiene la zona?', 'lead'),
         table([['Pregunta', 'Si la respuesta es…', 'Orienta hacia'],
                ['¿Control de humedad?', 'Difícil (cervical subgingival, niño poco cooperador)', 'Ionómero de vidrio convencional o modificado con resina'],
                ['¿Riesgo de caries?', 'Alto', 'Materiales con liberación de flúor; sellar y controlar antes de restaurar extenso'],
                ['¿Tejido remanente?', 'Cavidad amplia con cúspides debilitadas', 'Restauración indirecta con recubrimiento cuspídeo (incrustación u onlay)'],
                ['¿Estética y carga?', 'Sector anterior estético', 'Resina estratificada o carilla cerámica'],
                ['', 'Posterior con carga alta o bruxismo', 'Resina de alta carga, disilicato de litio o zirconia']],
               widths=[36 * mm, 64 * mm, 75 * mm]),

         P('Resinas compuestas', 'h2'),
         table([['Tipo', 'Indicaciones', 'Evitar o cuidar'],
                ['Nanohíbrida o microhíbrida', 'Anteriores y posteriores; estratificación estética', 'Incrementos mayores de 2 mm; contaminación con saliva o sangre'],
                ['Bulk-fill', 'Posteriores de clase I y II con incrementos de hasta 4–5 mm (según fabricante)', 'Algunas requieren capa final de resina convencional; verificar profundidad de curado'],
                ['Fluida', 'Primera capa en cajas proximales, lesiones pequeñas, sellado de márgenes', 'Como material único en zonas de carga']],
               widths=[36 * mm, 72 * mm, 67 * mm]),
         callout('Claves de manipulación', ['Contracción de polimerización: trabaja en incrementos y orienta la luz para reducir el estrés en las paredes.',
                                            'Fotopolimeriza con la punta de la lámpara lo más cerca posible y perpendicular; revisa la intensidad de tu lámpara periódicamente.'], 'info'),

         P('Ionómeros de vidrio', 'h2'),
         table([['Tipo', 'Indicaciones', 'Límites'],
                ['Convencional', 'Lesiones cervicales, pacientes de alto riesgo, restauraciones temporales de largo plazo, técnica restaurativa atraumática (ART), base', 'Baja resistencia al desgaste y a la fractura; sensible a la humedad en las primeras horas'],
                ['Modificado con resina', 'Clase V, bases y forros, restauraciones en dentición temporal, cementación de coronas metálicas', 'No sustituye a la resina en zonas de carga ni estética exigente']],
               widths=[36 * mm, 82 * mm, 57 * mm]),

         P('Amalgama', 'h2'),
         P('México es parte del Convenio de Minamata sobre el mercurio, que establece la reducción progresiva del uso de amalgama dental. Hoy se reserva para situaciones específicas y se desaconseja en niños, mujeres embarazadas o en lactancia. Si se usa: cápsulas predosificadas, separador de amalgama y manejo adecuado de residuos.'),

         P('Cerámicas y restauraciones indirectas', 'h2'),
         table([['Material', 'Indicaciones', 'Cementación'],
                ['Feldespática', 'Carillas de alta estética en sustrato favorable', 'Adhesiva (grabado con ácido fluorhídrico + silano)'],
                ['Disilicato de litio', 'Carillas, incrustaciones, coronas anteriores y de premolares, coronas posteriores unitarias', 'Adhesiva; en coronas con buena retención puede ser convencional según fabricante'],
                ['Zirconia', 'Coronas posteriores, puentes, pacientes con bruxismo (monolítica)', 'Convencional o adhesiva con primer de MDP'],
                ['Resina CAD/CAM', 'Incrustaciones y onlays, restauraciones provisionales de largo plazo', 'Adhesiva']],
               widths=[32 * mm, 83 * mm, 60 * mm]),
         PageBreak(),
         P('Protocolos adhesivos en resumen', 'h2'),
         table([['Estrategia', 'Pasos', 'Cuándo conviene'],
                ['Grabado total (3 o 2 pasos)', 'Ácido fosfórico 37% en esmalte (≈30 s) y dentina (≈15 s), lavado, secado sin deshidratar, primer y adhesivo', 'Máxima adhesión a esmalte; buena técnica con dentina húmeda controlada'],
                ['Autograbado', 'Primer ácido y adhesivo sobre esmalte y dentina, sin lavado', 'Menor sensibilidad posoperatoria; adhesión a esmalte menor'],
                ['Grabado selectivo del esmalte', 'Ácido fosfórico solo en esmalte y adhesivo autograbante o universal en todo', 'Punto medio muy usado con adhesivos universales']],
               widths=[40 * mm, 80 * mm, 55 * mm]),
         P('Errores que acortan la vida de una restauración', 'h2'),
         checklist(['Aislamiento deficiente: la contaminación con saliva o sangre reduce la adhesión.',
                    'Dentina resecada tras el grabado total, o demasiado húmeda.',
                    'Incrementos gruesos o tiempos de curado insuficientes.',
                    'Contactos proximales abiertos por mala elección de matriz.',
                    'Oclusión sin ajustar: fracturas y sensibilidad.',
                    'Pulido incompleto: acumulación de placa y tinción marginal.']),
         Spacer(1, 6),
         callout('Sigue siempre la ficha técnica', 'Tiempos de grabado, espesores y tiempos de fotopolimerización varían entre productos. Esta guía da criterios generales; la instrucción del fabricante manda.', 'warn')]
    s += refs(['Ferracane JL. Resin composite: state of the art. <i>Dent Mater</i>. 2011;27(1):29–38.',
               'Sidhu SK, Nicholson JW. A review of glass-ionomer cements for clinical dentistry. <i>J Funct Biomater</i>. 2016;7(3):16.',
               'Programa de las Naciones Unidas para el Medio Ambiente. Convenio de Minamata sobre el Mercurio, anexo A.',
               'Van Meerbeek B, Yoshihara K, Van Landuyt K, et al. From Buonocore’s pioneering acid-etch technique to self-adhering restoratives. <i>J Adhes Dent</i>. 2020;22(1):7–34.'])
    s += [Spacer(1, 8), P(DISCLAIMER, 'tiny')]
    return meta, s

# ════════════════════════════════════════════════════════════════════
# 8. Checklist de urgencias dentales pediátricas
# ════════════════════════════════════════════════════════════════════
def urgencias_pediatricas():
    meta = dict(title='Urgencias dentales<br/>pediátricas', short='Checklist · Urgencias pediátricas', eyebrow='Checklist · Traumatología dental',
                subtitle='Qué hacer en los primeros 30 minutos ante avulsión, luxación y fractura en niños, con la diferencia clave entre dientes temporales y permanentes.')
    s = [P('Primeros 5 minutos', 'h1'),
         callout('Antes que el diente: la cabeza', 'Pérdida de conciencia, vómito, somnolencia, confusión, dolor de cabeza intenso, sangrado por nariz u oídos: <b>referir de inmediato a urgencias médicas</b>. La atención dental puede esperar.', 'alert'),
         checklist(['¿Cómo, dónde y cuándo ocurrió? Anota la <b>hora exacta</b>: define el pronóstico de una avulsión.',
                    '¿El relato coincide con la lesión y la edad del niño? Lesiones repetidas o incongruentes pueden indicar maltrato: documenta y activa el protocolo correspondiente.',
                    '¿Esquema de vacunación antitetánica completo? Si hubo contacto con tierra y hay duda, referir al médico.',
                    '¿Falta un diente o un fragmento? Búscalo; si hay herida en labio con fragmento no encontrado, toma radiografía de tejidos blandos.',
                    '¿El diente es <b>temporal o permanente</b>? El tratamiento cambia por completo.',
                    'Explora tejidos blandos, movilidad, desplazamiento, oclusión y toma radiografías.']),

         P('Avulsión', 'h2'),
         table([['', 'Diente temporal', 'Diente permanente'],
                ['Regla principal', '<b>No reimplantar</b> (riesgo de dañar el germen del permanente)', '<b>Reimplantar lo antes posible</b>, idealmente en los primeros 15 minutos'],
                ['Manejo del diente', '—', 'Tomar por la corona, nunca por la raíz · si está sucio, enjuagar 10 segundos con agua fría sin tallar · reimplantar en el lugar o transportar en leche, solución salina o saliva del propio paciente (no dentro de la boca de un niño pequeño)'],
                ['En el consultorio', 'Limpiar la herida, control del dolor, informar a los padres', 'Irrigar el alvéolo, reposicionar, verificar con radiografía, férula flexible por 2 semanas'],
                ['Medicación', 'Según valoración', 'Antibiótico sistémico según peso y edad, y valoración antitetánica por el médico'],
                ['Seguimiento', 'Controlar la erupción del permanente', 'Ápice cerrado: iniciar endodoncia a las 2 semanas · ápice abierto: vigilar revascularización']],
               widths=[30 * mm, 60 * mm, 85 * mm]),

         P('Luxaciones', 'h2'),
         table([['Lesión', 'Diente temporal', 'Diente permanente'],
                ['Concusión o subluxación', 'Observación, dieta blanda, higiene', 'Sin férula o férula flexible 2 semanas si hay movilidad marcada; control de vitalidad'],
                ['Extrusión', 'Leve: reposicionar o dejar; severa: considerar extracción', 'Reposicionar y férula flexible 2 semanas'],
                ['Luxación lateral', 'Sin interferencia oclusal: reposición espontánea · con interferencia: reposición suave o extracción', 'Reposicionar y férula flexible 4 semanas'],
                ['Intrusión', 'Generalmente reerupción espontánea; referir si invade el germen del permanente', 'Referir: según madurez radicular, reerupción, reposición ortodóncica o quirúrgica']],
               widths=[32 * mm, 65 * mm, 78 * mm]),
         PageBreak(),
         P('Fracturas', 'h2'),
         table([['Lesión', 'Diente temporal', 'Diente permanente'],
                ['Esmalte', 'Pulir bordes', 'Pulir o restaurar con resina'],
                ['Esmalte y dentina sin exposición pulpar', 'Sellar dentina con ionómero o resina', 'Pegar el fragmento si se conserva (hidratado) o restaurar con resina'],
                ['Con exposición pulpar', 'Pulpotomía o extracción según edad y cooperación', 'Ápice inmaduro: recubrimiento o pulpotomía parcial para preservar vitalidad · ápice maduro: pulpotomía parcial o endodoncia'],
                ['Fractura radicular', 'Fragmento coronal móvil: extraerlo y dejar el apical', 'Reposicionar el fragmento coronal y férula flexible 4 semanas (hasta 4 meses si es cervical)']],
               widths=[40 * mm, 60 * mm, 75 * mm]),

         P('Indicaciones para padres', 'h2'),
         bullets(['Dieta blanda de 1 a 2 semanas y evitar deportes de contacto.', 'Cepillado suave después de cada comida; clorhexidina 0.12% con gasa o enjuague según edad, por 1 semana.',
                  'Evitar chupón y biberón en lesiones de dientes temporales cuando sea posible.', 'Regresar si hay dolor, inflamación, fístula o cambio de color del diente.']),
         P('Calendario de controles', 'h2'),
         table([['Tiempo', '2 semanas', '4 semanas', '3 meses', '6 meses', '1 año', 'Anual'],
                ['Qué revisar', 'Retiro de férula en avulsión', 'Retiro de férula en luxación lateral', 'Vitalidad y radiografía', 'Vitalidad y radiografía', 'Vitalidad y radiografía', 'Hasta 5 años en avulsión e intrusión']],
               widths=[25 * mm] + [25 * mm] * 6, first_bold=True),
         Spacer(1, 6),
         callout('Botiquín mínimo en el consultorio', 'Solución salina, medio de conservación para dientes avulsionados si está disponible, alambre y resina para férula flexible, ionómero de vidrio, y el número de urgencias médicas visible.', 'ok')]
    s += refs(['Bourguignon C, Cohenca N, Lauridsen E, et al. International Association of Dental Traumatology guidelines for the management of traumatic dental injuries: 1. Fractures and luxations. <i>Dent Traumatol</i>. 2020;36(4):314–330.',
               'Fouad AF, Abbott PV, Tsilingaridis G, et al. IADT guidelines: 2. Avulsion of permanent teeth. <i>Dent Traumatol</i>. 2020;36(4):331–342.',
               'Day PF, Flores MT, O’Connell AC, et al. IADT guidelines: 3. Injuries in the primary dentition. <i>Dent Traumatol</i>. 2020;36(4):343–359.'])
    s += [Spacer(1, 8), P(DISCLAIMER, 'tiny')]
    return meta, s

# ════════════════════════════════════════════════════════════════════
# 9. Guía de instrumentación endodóntica
# ════════════════════════════════════════════════════════════════════
def instrumentacion_endo():
    meta = dict(title='Instrumentación<br/>endodóntica', short='Guía · Instrumentación endodóntica', eyebrow='Guía clínica · Endodoncia',
                subtitle='Acceso, longitud de trabajo, glide path, técnicas manuales y rotatorias, irrigación y cómo evitar los errores que más cuestan.')
    s = [P('El orden importa', 'h1'),
         P('La mayoría de los accidentes en endodoncia se originan en saltarse un paso: un acceso insuficiente obliga a forzar limas, una longitud de trabajo imprecisa lleva a sobreinstrumentar, un glide path ausente rompe instrumentos. Esta guía sigue el orden clínico.', 'lead'),
         P('1 · Acceso', 'h2'),
         bullets(['Elimina por completo el techo de la cámara pulpar y toda la caries y restauraciones defectuosas.',
                  'Busca acceso en línea recta al tercio apical: las limas no deben tocar las paredes del acceso al entrar.',
                  'Localiza todos los conductos antes de instrumentar; magnificación e iluminación ayudan.']),
         table([['Diente', 'Conductos más frecuentes', 'Atención'],
                ['Incisivos y caninos superiores', '1', '—'],
                ['Primer premolar superior', '2', 'Vestibular y palatino'],
                ['Segundo premolar superior', '1 o 2', 'Buscar el segundo conducto'],
                ['Molares superiores', '3 o 4', 'MB2 en la raíz mesiovestibular es frecuente'],
                ['Incisivos inferiores', '1 o 2', 'Segundo conducto lingual frecuente'],
                ['Premolares inferiores', '1', 'Anatomías complejas ocasionales'],
                ['Molares inferiores', '3 o 4', 'Segundo conducto distal en algunos casos']], widths=[50 * mm, 45 * mm, 80 * mm]),
         P('2 · Longitud de trabajo', 'h2'),
         bullets(['Determínala con <b>localizador electrónico de ápice</b> y confírmala con <b>radiografía</b>.',
                  'Trabaja cerca de la constricción apical, por lo general entre 0.5 y 1 mm corto del ápice radiográfico.',
                  'Usa topes de silicona bien ajustados y un punto de referencia estable; anota la longitud por conducto en el expediente.',
                  'Revisa la longitud cuando el conducto se enderece tras la preparación del tercio coronal.']),
         P('3 · Permeabilidad y glide path', 'h2'),
         P('Antes de cualquier lima rotatoria, crea una vía de deslizamiento con limas manuales K de calibre pequeño (#10 y #15) hasta la longitud de trabajo, o con limas mecanizadas diseñadas para ello. Mantén la permeabilidad con una lima #10 que pase ligeramente el foramen sin ensancharlo.'),
         PageBreak(),
         P('4 · Técnicas de preparación', 'h2'),
         table([['Técnica', 'Idea central', 'Nota práctica'],
                ['Step-back (manual)', 'Preparar el ápice primero y retroceder aumentando calibre', 'Riesgo de escalones en conductos curvos si se fuerza'],
                ['Crown-down', 'Ensanchar primero coronal y medio, luego apical', 'Mejora la llegada de irrigante y reduce extrusión de detritos'],
                ['Fuerzas balanceadas', 'Movimientos de rotación horaria y antihoraria con presión apical controlada', 'Respeta la curvatura con limas manuales'],
                ['NiTi rotatorio multilima', 'Secuencia de limas de conicidad y calibre crecientes', 'Seguir la secuencia y velocidad del fabricante'],
                ['NiTi reciprocante', 'Una sola lima con movimiento de vaivén asimétrico', 'Menos fatiga cíclica; no forzar el avance']],
               widths=[40 * mm, 70 * mm, 65 * mm]),
         callout('Reglas con limas de níquel-titanio', ['Nunca fuerces: avanza en picoteos cortos con presión ligera y retira para limpiar las espiras.',
                                                         'Irriga y recapitula entre cada instrumento.', 'Respeta el número de usos y desecha limas con deformación visible.',
                                                         'Curvaturas severas y dobles curvaturas: glide path meticuloso y limas de mayor flexibilidad.'], 'info'),
         P('5 · Irrigación', 'h2'),
         table([['Irrigante', 'Función', 'Uso'],
                ['Hipoclorito de sodio 2.5–5.25%', 'Disolución de tejido orgánico y acción antimicrobiana', 'Durante toda la preparación, abundante y renovado'],
                ['EDTA 17%', 'Remoción del barrillo dentinario (componente inorgánico)', 'Irrigación final, aproximadamente 1 minuto'],
                ['Clorhexidina 2%', 'Antimicrobiano con sustantividad', 'Opcional al final; <b>nunca mezclar con hipoclorito</b> (precipitado): intercalar solución salina']],
               widths=[45 * mm, 70 * mm, 60 * mm]),
         bullets(['Usa agujas de salida lateral, 2–3 mm corto de la longitud de trabajo, sin trabarlas en el conducto.',
                  'Inyecta con presión suave y movimiento de vaivén; la activación (ultrasónica o sónica) mejora la limpieza.'], 'small'),
         callout('Accidente por hipoclorito', 'Dolor súbito intenso, edema rápido, equimosis o sangrado por el conducto durante la irrigación. Detén el procedimiento, aspira, irriga con solución salina, controla el dolor, aplica compresas frías las primeras horas, informa al paciente y da seguimiento; refiere si hay compromiso de vía aérea o edema progresivo.', 'alert'),
         P('6 · Errores frecuentes', 'h2'),
         table([['Error', 'Causa habitual', 'Prevención'],
                ['Escalón', 'Limas rígidas o de calibre grande forzadas en curvatura', 'Precurvar limas manuales, glide path, recapitular'],
                ['Transporte o zip apical', 'Enderezamiento del conducto con instrumentos rígidos', 'NiTi flexible, no sobreampliar el ápice'],
                ['Perforación', 'Acceso desorientado o sobrepreparación en paredes delgadas', 'Radiografía inicial, magnificación, conocer la anatomía'],
                ['Instrumento separado', 'Fatiga cíclica o torsional, falta de glide path', 'Respetar usos, no forzar, limpiar espiras'],
                ['Sobreinstrumentación', 'Longitud de trabajo imprecisa o topes movidos', 'Localizador + radiografía, verificar topes']],
               widths=[36 * mm, 70 * mm, 69 * mm]),
         P('Secuencia resumen', 'h2'),
         checklist(['Radiografía inicial y diagnóstico pulpar y periapical', 'Anestesia y aislamiento absoluto', 'Acceso completo y localización de conductos',
                    'Exploración con lima #10 y permeabilidad', 'Preparación coronal y media', 'Longitud de trabajo (localizador + radiografía)',
                    'Glide path hasta longitud de trabajo', 'Preparación apical con irrigación y recapitulación', 'Irrigación final con EDTA y activación',
                    'Secado, conometría y obturación'])]
    s += refs(['Berman LH, Hargreaves KM. <i>Cohen’s Pathways of the Pulp</i>. 12.ª ed. Elsevier; 2020.',
               'American Association of Endodontists. <i>Glossary of Endodontic Terms</i>. 10.ª ed. 2020.',
               'Zehnder M. Root canal irrigants. <i>J Endod</i>. 2006;32(5):389–398.',
               'Peters OA. Current challenges and concepts in the preparation of root canal systems: a review. <i>J Endod</i>. 2004;30(8):559–567.'])
    s += [Spacer(1, 8), P(DISCLAIMER, 'tiny')]
    return meta, s

# ════════════════════════════════════════════════════════════════════
# 10. Plantilla de nota clínica y receta
# ════════════════════════════════════════════════════════════════════
def nota_receta():
    meta = dict(title='Nota clínica<br/>y receta', short='Plantilla · Nota clínica y receta', eyebrow='Plantilla · Expediente',
                subtitle='Nota de evolución y receta con los datos que deben llevar, listas para imprimir y membretar con los datos de tu consultorio.')
    s = [P('NOTA DE EVOLUCIÓN', 'eyebrow'), P('Nota de evolución odontológica', 'h1'),
         fields_row([('Paciente', .5, 1), ('Edad', .12, 1), ('Sexo', .12, 1), ('Fecha', .13, 1), ('Hora', .13, 1)], W),
         fields_row([('Expediente', .3, 1), ('Motivo de la consulta de hoy', .7, 1)], W),
         P('Signos vitales', 'h3'),
         fields_row([('Tensión arterial', .25, 1), ('Frecuencia cardiaca', .25, 1), ('Frecuencia respiratoria', .25, 1), ('Temperatura', .25, 1)], W),
         fields_row([('Evolución y actualización del cuadro clínico', 1, 3)], W),
         fields_row([('Exploración y resultados de estudios (radiografías, pruebas de vitalidad)', 1, 3)], W),
         fields_row([('Diagnóstico o problemas clínicos', 1, 2)], W),
         fields_row([('Pronóstico', 1, 1)], W),
         fields_row([('Tratamiento realizado hoy (dientes, materiales, anestesia: tipo y número de cartuchos)', 1, 3)], W),
         fields_row([('Indicaciones y plan para la siguiente cita', 1, 2)], W),
         Spacer(1, 4),
         fields_row([('Nombre completo del odontólogo', .5, 1), ('Cédula profesional', .25, 1), ('Firma', .25, 1)], W),
         P('Elaborada con base en los elementos de la nota de evolución de la NOM-004-SSA3-2012 del expediente clínico (numeral 6.2).', 'tiny'),
         PageBreak()]
    # Receta
    membrete = Table([[[P('NOMBRE DEL CONSULTORIO', 'eyebrow'), P('Dra. / Dr. Nombre Apellido Apellido', 'h2'),
                        P('Especialidad · Cédula profesional ________ · Cédula de especialidad ________', 'small'),
                        P('Institución que expidió el título: ______________________________', 'small')],
                       [P('Domicilio del consultorio', 'tiny'), P('_______________________________', 'small'), P('Teléfono', 'tiny'), P('_______________', 'small')]]],
                     colWidths=[W * .62, W * .38])
    membrete.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP'), ('LINEBELOW', (0, 0), (-1, -1), 1.2, NAVY), ('BOTTOMPADDING', (0, 0), (-1, -1), 10), ('LEFTPADDING', (0, 0), (-1, -1), 0)]))
    s += [P('RECETA', 'eyebrow'), membrete, Spacer(1, 10),
          fields_row([('Paciente', .55, 1), ('Edad', .15, 1), ('Peso', .15, 1), ('Fecha', .15, 1)], W),
          fields_row([('Diagnóstico', 1, 1)], W),
          Spacer(1, 4), Paragraph('Rp.', ParagraphStyle('rp', fontName='Display', fontSize=24, leading=30, textColor=NAVY, spaceAfter=2))]
    for i in range(1, 4):
        s.append(KeepTogether([P(f'Medicamento {i}', 'h3'),
                               fields_row([('Nombre genérico (y comercial si aplica)', .55, 1), ('Presentación y concentración', .45, 1)], W),
                               fields_row([('Dosis', .25, 1), ('Vía', .2, 1), ('Frecuencia', .25, 1), ('Duración', .3, 1)], W)]))
    s += [fields_row([('Indicaciones no farmacológicas', 1, 2)], W), Spacer(1, 10),
          fields_row([('Firma autógrafa del odontólogo', .5, 1), ('Próxima cita', .5, 1)], W),
          Spacer(1, 6),
          callout('Antes de imprimir', ['Coloca tu membrete con nombre, institución que expidió el título, número de cédula profesional, domicilio y teléfono; la receta debe llevar fecha y firma autógrafa.',
                                        'Revisa los requisitos vigentes del Reglamento de Insumos para la Salud y de COFEPRIS, especialmente para antibióticos y medicamentos controlados.'], 'info')]
    return meta, s

# ════════════════════════════════════════════════════════════════════
# 7. Presentación · Manual de estratificación de resinas (16:9)
# ════════════════════════════════════════════════════════════════════
SLIDE = (960, 540)
SLIDES = [
    ('Objetivos', 'Al terminar podrás', ['Seleccionar el color con un método reproducible', 'Construir una restauración anterior por capas con llave de silicona', 'Controlar espesores de dentina y esmalte para lograr naturalidad', 'Terminar y pulir con textura y brillo de diente natural']),
    ('Selección de color', 'Antes de aislar, siempre', ['Toma el color al inicio: el diente se deshidrata en minutos y se ve más claro', 'Luz natural indirecta o lámpara de 5500 K; evita la luz de la unidad', 'Orden: <b>valor</b> (claridad) → <b>croma</b> (saturación) → <b>tono</b>', 'Prueba botones de resina curados sobre el diente y fotografía con la guía']),
    ('Anatomía de las capas', 'Imitar lo que ya existe', ['<b>Esmalte palatino</b>: pared de soporte con la forma final', '<b>Dentina</b>: da el color de base y el croma; forma mamelones', '<b>Efectos</b>: opalescentes o translúcidos en borde incisal, mínimos', '<b>Esmalte vestibular</b>: capa final delgada, 0.3–0.5 mm']),
    ('Llave de silicona', 'La guía de la forma', ['Encerado diagnóstico o mock-up aprobado por el paciente', 'Silicona de condensación o adición pesada sobre el modelo o en boca', 'Recorta la llave por incisal para ver el borde desde palatino', 'Verifica asentamiento antes de empezar']),
    ('Aislamiento y preparación', 'Base de todo lo que sigue', ['Aislamiento absoluto con dique de goma', 'Elimina tejido cariado y restauraciones defectuosas', 'Bisel vestibular corto y difuminado para esconder la unión', 'Limpieza de la superficie antes del protocolo adhesivo']),
    ('Protocolo adhesivo', 'Según tu sistema', ['Grabado selectivo del esmalte con ácido fosfórico 37%', 'Lavado y secado sin deshidratar la dentina', 'Aplicación activa del adhesivo, evaporación del solvente', 'Fotopolimerización según el fabricante']),
    ('Pared palatina', 'Paso 1 de construcción', ['Resina de esmalte sobre la llave, capa delgada y uniforme', 'Asienta la llave y adapta la resina a la preparación', 'Fotopolimeriza a través de la llave y retírala', 'Resultado: la forma palatina e incisal definitiva']),
    ('Paredes proximales', 'Paso 2 de construcción', ['Matriz de poliéster o seccional con cuña', 'Resina de esmalte para cerrar las caras proximales', 'Revisa el punto de contacto antes de curar', 'Ahora tienes una "caja" que se rellena con dentina']),
    ('Dentina y mamelones', 'Paso 3 de construcción', ['Resina de dentina en incrementos de 2 mm como máximo', 'Deja espacio de 0.3–0.5 mm para el esmalte vestibular', 'Modela mamelones con espátula o pincel antes de curar', 'Más croma en cervical, menos hacia incisal']),
    ('Efectos', 'Paso 4 de construcción', ['Resina translúcida u opalescente entre mamelones y en el borde incisal', 'Halo incisal sutil si el diente natural lo tiene', 'Tintes solo en cantidades mínimas', 'Menos es más: los excesos se ven artificiales']),
    ('Esmalte vestibular', 'Paso 5 de construcción', ['Capa final de resina de esmalte, delgada y uniforme', 'Alisa con pincel humedecido en resina sin carga', 'Aplica gel de glicerina y cura para eliminar la capa inhibida', 'Fotopolimerización final por vestibular y palatino']),
    ('Acabado y pulido', 'La diferencia entre bien y excelente', ['Macroforma: ángulos de transición y líneas de reflexión con discos', 'Microtextura: surcos horizontales con fresa de grano fino', 'Secuencia de discos y gomas de grueso a extrafino', 'Brillo final con pasta y cepillo o fieltro']),
    ('Errores comunes', 'Y cómo evitarlos', ['Color tomado tarde (diente deshidratado): restauración demasiado clara', 'Esmalte vestibular grueso: resultado grisáceo y sin vida', 'Incrementos gruesos: curado incompleto y contracción', 'Pulido omitido: pérdida de brillo y tinción temprana']),
    ('Checklist de la cita', 'Para imprimir junto a la unidad', ['Color tomado y fotografiado antes de aislar', 'Llave de silicona verificada', 'Aislamiento absoluto', 'Protocolo adhesivo completo', 'Capas: palatina → proximales → dentina → efectos → esmalte', 'Oclusión revisada, acabado y pulido en secuencia']),
]

def presentacion_resinas(path):
    w, h = SLIDE
    c = pdfcanvas.Canvas(path, pagesize=SLIDE)
    c.setTitle('Manual de estratificación de resinas'); c.setAuthor('OdonTeck Consulting Group')
    meta = dict(title='Estratificación<br/>de resinas', eyebrow='Manual · Estética anterior', subtitle='Paso a paso para restauraciones anteriores naturales con resina compuesta.')
    draw_cover(c, w, h, meta); c.showPage()
    body = ParagraphStyle('sb', fontName='Body', fontSize=21, leading=28, textColor=INK)
    for i, (titulo, kicker, puntos) in enumerate(SLIDES, 1):
        c.setFillColor(WHITE); c.rect(0, 0, w, h, fill=1, stroke=0)
        c.setFillColor(NAVY); c.rect(0, 0, 300, h, fill=1, stroke=0)
        c.saveState(); p = c.beginPath(); p.moveTo(0, 0); p.lineTo(300, 0); p.lineTo(300, 130); p.lineTo(0, 40); p.close()
        c.clipPath(p, stroke=0, fill=0); c.linearGradient(0, 0, 300, 130, (colors.HexColor('#1C4A8F'), TEAL), extend=True); c.restoreState()
        c.drawImage(LOGO_DARK, 34, h - 62, width=120, height=32, mask='auto')
        c.setFillColor(TEAL_L); c.setFont('Mono', 12); c.drawString(34, h - 130, f'{i:02d} / {len(SLIDES):02d}')
        tp = Paragraph(titulo, ParagraphStyle('st', fontName='Display', fontSize=34, leading=38, textColor=WHITE))
        _, th = tp.wrap(240, 300); tp.drawOn(c, 34, h - 150 - th)
        kp = Paragraph(kicker, ParagraphStyle('sk', fontName='Body', fontSize=15, leading=20, textColor=colors.HexColor('#B6C2D8')))
        _, kh = kp.wrap(240, 200); kp.drawOn(c, 34, h - 170 - th - kh)
        alturas = [max(Paragraph(t, body).wrap(520, 200)[1], 34) + 26 for t in puntos]
        y = h / 2 + sum(alturas) / 2 + 10
        for n, t in enumerate(puntos, 1):
            c.setFillColor(BLUE_50); c.circle(362, y - 10, 17, fill=1, stroke=0)
            c.setFillColor(NAVY); c.setFont('Bold', 15); c.drawCentredString(362, y - 15, str(n))
            pp = Paragraph(t, body); _, ph = pp.wrap(520, 200); pp.drawOn(c, 396, y - ph + 6)
            y -= max(ph, 34) + 26
        c.setFont('Mono', 9); c.setFillColor(INK3); c.drawRightString(w - 30, 20, 'CLUB ODONTECK · MANUAL DE ESTRATIFICACIÓN DE RESINAS')
        c.showPage()
    c.save()
    return meta, len(SLIDES) + 1
