# Contenido: guía ortodóncica, atlas ICDAS, consentimiento, tabla de anestésicos, abscesos periodontales.
from reportlab.lib.units import mm
from reportlab.graphics.shapes import Drawing, Rect, Ellipse, Polygon, String, Line
from reportlab.platypus import Spacer, PageBreak, KeepTogether, Table, TableStyle
from kit import *

W = 175 * mm  # ancho útil en carta con márgenes de 20 mm

# ════════════════════════════════════════════════════════════════════
# 1. Guía de bolsillo · Diagnóstico ortodóncico
# ════════════════════════════════════════════════════════════════════
def guia_ortodoncia():
    meta = dict(title='Diagnóstico ortodóncico<br/>en consulta general', short='Guía · Diagnóstico ortodóncico', eyebrow='Guía clínica · Ortodoncia',
                subtitle='Qué preguntar, qué medir y cuándo referir: el recorrido completo de la primera consulta en una guía de bolsillo.')
    s = [P('Cómo usar esta guía', 'h1'),
         P('Está pensada para el odontólogo general que recibe a un paciente con una duda ortodóncica. Sigue el orden de la consulta: anamnesis, examen extraoral, examen intraoral, radiografías y decisión. Al final hay un formato de nota para dejar todo registrado.', 'lead'),
         callout('Regla de oro', 'El diagnóstico ortodóncico no es solo dental: siempre evalúa también la cara, la función y la etapa de crecimiento. Un mismo apiñamiento se maneja distinto a los 8 que a los 30 años.', 'info'),

         P('1 · Anamnesis dirigida', 'h2'),
         bullets(['<b>Motivo de consulta</b> en palabras del paciente (o del tutor): estética, función, dolor, referencia de otro colega.',
                  '<b>Edad y etapa de crecimiento</b>: dentición temporal, mixta o permanente; en adolescentes, estirón puberal (cambios de talla recientes, menarca).',
                  '<b>Hábitos</b>: succión digital o de chupón, respiración oral, deglución atípica, interposición lingual o labial, onicofagia, bruxismo.',
                  '<b>Antecedentes familiares</b>: prognatismo o clase III en padres o hermanos, agenesias, caninos retenidos.',
                  '<b>Traumatismos</b> dentales o faciales, fracturas mandibulares y tratamientos ortodóncicos previos.',
                  '<b>Salud general</b>: medicamentos (bisfosfonatos), enfermedades periodontales, alergias (níquel, látex).']),

         P('2 · Examen extraoral', 'h2'),
         table([['Qué observar', 'Cómo', 'Qué anotar'],
                ['Perfil', 'De lado, cabeza en posición natural', 'Recto, convexo o cóncavo; posición de labios respecto a la línea E'],
                ['Simetría', 'De frente, línea media facial', 'Desviación del mentón, asimetrías de tercios'],
                ['Tercios faciales', 'Glabela, subnasal, mentón', 'Tercio inferior aumentado (tendencia a mordida abierta) o disminuido'],
                ['Competencia labial', 'Labios en reposo', 'Cierre sin esfuerzo o con contracción del mentón'],
                ['Sonrisa', 'Sonrisa amplia espontánea', 'Exposición gingival, línea media dental vs facial, corredores bucales'],
                ['ATM y apertura', 'Palpación, apertura máxima', 'Ruidos, dolor, desviación; apertura menor de 40 mm merece valoración']],
               widths=[32 * mm, 55 * mm, 88 * mm]),

         P('3 · Examen intraoral', 'h2'),
         table([['Parámetro', 'Referencia habitual', 'Hallazgo que importa'],
                ['Relación molar (Angle)', 'Clase I', 'Clase II o III, uni o bilateral'],
                ['Relación canina', 'Clase I', 'Discrepancia con la relación molar (compensaciones)'],
                ['Overjet (resalte)', '2–3 mm', 'Aumentado (≥6 mm eleva el riesgo de trauma) o negativo'],
                ['Overbite (sobremordida)', '2–3 mm', 'Profunda con impacto en paladar, o mordida abierta'],
                ['Mordida cruzada', 'Ausente', 'Anterior o posterior; con desplazamiento funcional mandibular'],
                ['Líneas medias', 'Coincidentes', 'Desviación mayor de 2 mm: ¿dental o esquelética?'],
                ['Espacio', 'Sin apiñamiento', 'Apiñamiento o diastemas; estima los milímetros por arcada'],
                ['Dentición', 'Acorde a la edad', 'Agenesias, supernumerarios, retenciones, anquilosis de temporales']],
               widths=[40 * mm, 38 * mm, 97 * mm]),

         P('Clasificación de Angle en un vistazo', 'h3'),
         table([['Clase', 'Relación molar', 'Rasgos frecuentes'],
                ['I', 'Cúspide mesiovestibular del primer molar superior ocluye en el surco vestibular del primer molar inferior', 'Maloclusión dental: apiñamiento, rotaciones, diastemas'],
                ['II división 1', 'Molar inferior en posición distal', 'Incisivos superiores proinclinados, overjet aumentado, perfil convexo'],
                ['II división 2', 'Molar inferior en posición distal', 'Centrales superiores retroinclinados, laterales vestibularizados, sobremordida profunda'],
                ['III', 'Molar inferior en posición mesial', 'Overjet reducido o negativo, mordida cruzada anterior, perfil cóncavo']],
               widths=[26 * mm, 72 * mm, 77 * mm]),
         PageBreak(),

         P('4 · Radiografía panorámica: checklist', 'h2'),
         checklist(['Conteo dental y fórmula completa: agenesias (frecuentes en laterales superiores y segundos premolares) y supernumerarios.',
                    'Secuencia y estadio de erupción; simetría derecha–izquierda.',
                    'Posición de caninos superiores: inclinación y relación con la raíz del lateral.',
                    'Reabsorciones radiculares en temporales y permanentes vecinos a dientes retenidos.',
                    'Terceros molares: presencia, posición y espacio disponible.',
                    'Cóndilos y ramas: forma y simetría.',
                    'Nivel óseo, lesiones periapicales, quistes o imágenes que no correspondan.']),

         P('5 · Cefalometría básica (si se cuenta con lateral de cráneo)', 'h2'),
         table([['Medida (Steiner)', 'Norma', 'Lectura rápida'],
                ['SNA', '82° ± 2°', 'Posición anteroposterior del maxilar'],
                ['SNB', '80° ± 2°', 'Posición anteroposterior de la mandíbula'],
                ['ANB', '2° ± 2°', 'Mayor de 4°: tendencia clase II esquelética · menor de 0°: tendencia clase III'],
                ['SN–GoGn', '32° ± 5°', 'Alto: patrón vertical (abierto) · bajo: patrón horizontal (profundo)']],
               widths=[36 * mm, 30 * mm, 109 * mm]),
         P('Las normas son promedios poblacionales: interprétalas junto con el perfil blando y la edad.', 'small'),

         P('6 · Semáforo de referencia', 'h2'),
         table([['', 'Situación', 'Acción'],
                ['Referir pronto', 'Mordida cruzada anterior o posterior en crecimiento, sobre todo con desplazamiento funcional · Clase III esquelética en niños · Canino superior no palpable en vestibular a los 10–11 años o asimetría marcada de erupción · Mordida abierta con hábito persistente · Overjet de 6 mm o más', 'Interconsulta con ortodoncia en semanas, no meses'],
                ['Valorar y vigilar', 'Apiñamiento moderado en dentición mixta · Diastemas en dentición mixta temprana · Pérdida prematura de temporales (mantenedor de espacio)', 'Control cada 6 meses con registro fotográfico'],
                ['Seguimiento de rutina', 'Maloclusión leve en adulto sin demanda estética ni función alterada', 'Informar opciones y registrar en el expediente']],
               widths=[30 * mm, 100 * mm, 45 * mm]),
         callout('Canino superior retenido', 'La palpación de la eminencia canina en vestibular desde los 10 años y la panorámica temprana permiten intervenir a tiempo (por ejemplo, extracción del canino temporal por indicación del ortodoncista). Llegar tarde suele significar cirugía y tracción.', 'warn'),

         P('7 · Formato de nota de primera consulta', 'h2'),
         fields_row([('Paciente', .5, 1), ('Edad', .2, 1), ('Dentición', .3, 1)], W),
         fields_row([('Motivo de consulta', 1, 2)], W),
         fields_row([('Perfil', .34, 1), ('Relación molar D / I', .33, 1), ('Relación canina D / I', .33, 1)], W),
         fields_row([('Overjet (mm)', .25, 1), ('Overbite (mm)', .25, 1), ('Mordidas cruzadas', .25, 1), ('Líneas medias', .25, 1)], W),
         fields_row([('Hallazgos radiográficos', 1, 2)], W),
         fields_row([('Impresión diagnóstica y plan (referir / vigilar / tratar)', 1, 3)], W),
         Spacer(1, 6)]
    s += refs(['Proffit WR, Fields HW, Larson BE, Sarver DM. <i>Contemporary Orthodontics</i>. 6.ª ed. Elsevier; 2019.',
               'Steiner CC. Cephalometrics for you and me. <i>Am J Orthod</i>. 1953;39(10):729–755.',
               'American Association of Orthodontists. Clinical Practice Guidelines for Orthodontics and Dentofacial Orthopedics.',
               'Ericson S, Kurol J. Early treatment of palatally erupting maxillary canines by extraction of the primary canines. <i>Eur J Orthod</i>. 1988;10(4):283–295.'])
    s += [Spacer(1, 8), P(DISCLAIMER, 'tiny')]
    return meta, s

# ════════════════════════════════════════════════════════════════════
# 2. Atlas de caries · ICDAS
# ════════════════════════════════════════════════════════════════════
def diente(codigo):
    d = Drawing(150, 112)
    esmalte = colors.HexColor('#EEF3F9'); esm_b = colors.HexColor('#C9D6E6'); dentina = colors.HexColor('#F4E7CF')
    d.add(Rect(10, 6, 130, 100, rx=26, ry=26, fillColor=esmalte, strokeColor=esm_b, strokeWidth=0.9))      # esmalte
    d.add(Rect(22, 16, 106, 76, rx=18, ry=18, fillColor=dentina, strokeColor=colors.HexColor('#DCC9A6'), strokeWidth=0.7))  # dentina
    d.add(Ellipse(75, 44, 22, 14, fillColor=colors.HexColor('#F2C9C4'), strokeColor=colors.HexColor('#E0A9A3'), strokeWidth=0.6))  # pulpa
    d.add(Polygon([69, 106, 81, 106, 75, 99], fillColor=colors.white, strokeColor=esm_b, strokeWidth=0.6))  # fisura
    blanca = colors.white; borde = colors.HexColor('#AEBBCB'); cafe = colors.HexColor('#7A5A3C'); sombra = colors.HexColor('#8E857C')
    if codigo == 1: d.add(Ellipse(75, 101, 6, 3.2, fillColor=blanca, strokeColor=borde, strokeWidth=0.7))
    if codigo == 2: d.add(Ellipse(75, 99, 10, 6.5, fillColor=blanca, strokeColor=borde, strokeWidth=0.7))
    if codigo == 3: d.add(Polygon([67, 106, 83, 106, 79, 93, 71, 93], fillColor=cafe, strokeColor=cafe))
    if codigo == 4:
        d.add(Ellipse(75, 80, 18, 11, fillColor=sombra, strokeColor=None))
        d.add(Ellipse(75, 100, 8, 5, fillColor=colors.HexColor('#DDE4EC'), strokeColor=borde, strokeWidth=0.6))
    if codigo == 5: d.add(Polygon([64, 106, 86, 106, 83, 70, 67, 70], fillColor=cafe, strokeColor=cafe))
    if codigo == 6: d.add(Polygon([42, 106, 108, 106, 98, 56, 52, 56], fillColor=cafe, strokeColor=cafe))
    return d

def atlas_icdas():
    meta = dict(title='Atlas de caries<br/>Clasificación ICDAS', short='Atlas · ICDAS', eyebrow='Atlas clínico · Cariología',
                subtitle='Los códigos 0 a 6 explicados uno por uno: cómo se ven, qué tan profundo llegan, cómo saber si están activos y qué hacer con cada uno.')
    s = [P('Por qué ICDAS', 'h1'),
         P('El Sistema Internacional de Detección y Valoración de Caries (ICDAS) permite registrar la caries desde su primera manifestación visible en esmalte hasta la cavidad extensa, con criterios reproducibles entre examinadores. Su valor clínico está en detectar lesiones cuando todavía se pueden detener sin taladrar.', 'lead'),
         P('Cómo se escribe el código', 'h2'),
         P('Cada superficie recibe dos dígitos: el <b>primero</b> describe si hay restauración o sellante y el <b>segundo</b> el estado de caries. Ejemplo: <font name="Mono">02</font> = superficie sin restaurar con cambio visual evidente en esmalte; <font name="Mono">34</font> = restauración del color del diente con sombra oscura subyacente.'),
         table([['Primer dígito', 'Restauración o sellante'],
                ['0', 'Sin restaurar ni sellar'], ['1', 'Sellante parcial'], ['2', 'Sellante completo'], ['3', 'Restauración del color del diente'],
                ['4', 'Amalgama'], ['5', 'Corona de acero'], ['6', 'Corona o carilla de porcelana, oro o metal-porcelana'],
                ['7', 'Restauración perdida o fracturada'], ['8', 'Restauración temporal']], widths=[30 * mm, 145 * mm]),
         Spacer(1, 6),
         table([['Códigos especiales', 'Significado'], ['96', 'Superficie que no puede examinarse'], ['97', 'Diente ausente por caries'],
                ['98', 'Diente ausente por otra razón'], ['99', 'Diente no erupcionado']], widths=[30 * mm, 145 * mm]),
         P('Protocolo de examen', 'h2'),
         numbered(['Retira la placa (profilaxis o cepillado) para ver la superficie real.',
                   'Aísla con rollos de algodón y ten buena iluminación.',
                   'Examina cada superficie <b>húmeda</b> y después <b>seca con aire durante unos 5 segundos</b>.',
                   'Usa sonda de punta roma (tipo bola) solo para deslizar sobre la superficie y confirmar microcavidades; <b>no</b> uses explorador agudo con presión: puede cavitar una lesión remineralizable.',
                   'Registra también la <b>actividad</b> de la lesión: define el tratamiento tanto como el código.']),
         PageBreak(), P('Los siete códigos de caries coronal', 'h1'),
         P('Los esquemas representan un corte de molar: esmalte (azul claro), dentina (crema), pulpa (rosa) y la profundidad aproximada de la lesión. Los recuadros punteados están reservados para las fotografías clínicas de OdonTeck.', 'lead')]

    codigos = [
        (0, 'Superficie sana', 'Sin cambios visibles en el esmalte tras secar con aire durante 5 s. Se aceptan defectos de desarrollo (hipoplasia, fluorosis), desgaste, abrasión y pigmentación extrínseca.', 'Sano', 'Prevención según riesgo: higiene, flúor tópico y control de dieta.'),
        (1, 'Primer cambio visual en esmalte', 'Opacidad blanca o marrón visible <b>solo después de secar</b>; en húmedo no se aprecia. En fosas y fisuras queda confinada a la fisura.', 'Esmalte externo', 'No operatorio: barniz de flúor, sellante en fosas y fisuras activas, instrucción de higiene y control.'),
        (2, 'Cambio visual evidente en esmalte', 'Opacidad blanca o marrón visible <b>incluso con la superficie húmeda</b>, más extensa que la fisura.', 'Esmalte interno', 'No operatorio: sellante o infiltración de resina en lisas proximales, flúor de alta concentración, seguimiento.'),
        (3, 'Ruptura localizada del esmalte', 'Microcavidad o pérdida de continuidad del esmalte <b>sin dentina visible</b>. La sonda roma puede caer ligeramente en la discontinuidad.', 'Esmalte hasta dentina externa', 'Mínimamente invasivo: sellante o restauración preventiva, según actividad y radiografía.'),
        (4, 'Sombra oscura subyacente de dentina', 'Sombra gris, azulada o marrón vista a través del esmalte, que puede estar íntegro o con ruptura localizada. Se aprecia mejor húmedo.', 'Dentina', 'Valoración radiográfica: con lesión en tercio medio de dentina suele indicarse restauración conservadora.'),
        (5, 'Cavidad evidente con dentina visible', 'Cavidad clara con dentina expuesta; afecta menos de la mitad de la superficie.', 'Dentina media a interna', 'Operatorio: remoción selectiva de tejido cariado y restauración adhesiva.'),
        (6, 'Cavidad extensa con dentina visible', 'Cavidad profunda y amplia, con dentina claramente visible; afecta más de la mitad de la superficie. Puede comprometer la pulpa.', 'Dentina profunda, posible pulpa', 'Operatorio: evaluación pulpar, remoción selectiva y restauración; valorar tratamiento de conductos.')]
    for n, titulo, desc, prof, manejo in codigos:
        foto = Table([[P('Espacio reservado para fotografía clínica', 'tiny')]], colWidths=[60 * mm], rowHeights=[40 * mm])
        foto.setStyle(TableStyle([('BOX', (0, 0), (-1, -1), 0.8, LINE), ('ALIGN', (0, 0), (-1, -1), 'CENTER'), ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                                  ('BACKGROUND', (0, 0), (-1, -1), PAPER)]))
        texto = [P(f'CÓDIGO {n}', 'eyebrow'), P(titulo, 'h2'), P(desc), P(f'<b>Profundidad aproximada:</b> {prof}', 'small'), Spacer(1, 3), P(f'<b>Manejo sugerido:</b> {manejo}', 'small')]
        fila = Table([[diente(n), texto, foto]], colWidths=[55 * mm, 60 * mm, 60 * mm])
        fila.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP'), ('LEFTPADDING', (0, 0), (-1, -1), 0), ('RIGHTPADDING', (0, 0), (-1, -1), 8),
                                  ('LINEBELOW', (0, 0), (-1, -1), 0.6, LINE), ('BOTTOMPADDING', (0, 0), (-1, -1), 10), ('TOPPADDING', (0, 0), (-1, -1), 8)]))
        s.append(KeepTogether(fila))

    s += [PageBreak(), P('Actividad de la lesión', 'h1'),
          P('El mismo código puede requerir tratamientos distintos según la lesión esté activa (progresando) o inactiva (detenida).', 'lead'),
          table([['Característica', 'Lesión activa', 'Lesión inactiva'],
                 ['Aspecto del esmalte', 'Blanco o amarillento opaco, sin brillo', 'Blanco, marrón o negro, brillante'],
                 ['Textura con sonda roma', 'Rugosa', 'Lisa y dura'],
                 ['Localización', 'Zonas de acúmulo de placa: fisuras, cerca de la encía, bajo el punto de contacto', 'Alejada de zonas de acúmulo'],
                 ['Dentina (códigos 5–6)', 'Blanda o correosa al tacto', 'Brillante y dura'],
                 ['Encía vecina', 'Frecuentemente inflamada', 'Sana']], widths=[40 * mm, 67 * mm, 68 * mm]),
          P('De la clínica a la radiografía (ICCMS)', 'h2'),
          table([['Código radiográfico', 'Extensión en la radiografía'],
                 ['RA1', 'Mitad externa del esmalte'], ['RA2', 'Mitad interna del esmalte'], ['RA3', 'Tercio externo de la dentina'],
                 ['RB4', 'Tercio medio de la dentina'], ['RC5', 'Tercio interno de la dentina, clínicamente cavitada'], ['RC6', 'Hasta la pulpa']],
                widths=[40 * mm, 135 * mm]),
          P('Árbol de decisión simplificado', 'h2'),
          table([['Estadio ICCMS', 'Códigos ICDAS', 'Lesión activa', 'Lesión inactiva'],
                 ['Inicial', '1 y 2', 'Barniz de flúor, sellante en fisuras, higiene y dieta; control en 3–6 meses', 'Prevención de rutina'],
                 ['Moderado', '3 y 4', 'Sellante, infiltración o restauración mínimamente invasiva según radiografía (RA3 vs RB4)', 'Monitoreo; sellar si hay retención de placa'],
                 ['Extenso', '5 y 6', 'Remoción selectiva y restauración; evaluar pulpa', 'Restaurar si hay función o estética comprometida; si no, monitorear']],
                widths=[26 * mm, 24 * mm, 70 * mm, 55 * mm]),
          callout('Detalle que cambia el pronóstico', 'Registra el riesgo de caries del paciente (dieta, flúor, flujo salival, placa, historia de caries). Un código 2 activo en un paciente de alto riesgo necesita un plan preventivo intensivo aunque no se restaure.', 'info')]
    s += refs(['Ismail AI, Sohn W, Tellez M, et al. The International Caries Detection and Assessment System (ICDAS): an integrated system for measuring dental caries. <i>Community Dent Oral Epidemiol</i>. 2007;35(3):170–178.',
               'Pitts NB, Ismail AI, Martignon S, et al. <i>ICCMS™ Guide for Practitioners and Educators</i>. ICDAS Foundation; 2014.',
               'Nyvad B, Machiulskiene V, Baelum V. Reliability of a new caries diagnostic system differentiating between active and inactive caries lesions. <i>Caries Res</i>. 1999;33(4):252–260.'])
    s += [Spacer(1, 8), P(DISCLAIMER, 'tiny')]
    return meta, s

# ════════════════════════════════════════════════════════════════════
# 3. Consentimiento informado
# ════════════════════════════════════════════════════════════════════
def consentimiento():
    meta = dict(title='Consentimiento informado<br/>para tratamiento odontológico', short='Formato · Consentimiento informado', eyebrow='Formato · Uso en consultorio',
                subtitle='Formato listo para imprimir, con los apartados de la carta de consentimiento bajo información y espacio para riesgos específicos del procedimiento.')
    s = [P('CARTA DE CONSENTIMIENTO BAJO INFORMACIÓN', 'eyebrow'), P('Tratamiento odontológico', 'h1'),
         fields_row([('Nombre del consultorio o institución', .6, 1), ('Lugar', .25, 1), ('Fecha', .15, 1)], W),
         P('Datos del paciente', 'h3'),
         fields_row([('Nombre completo', .55, 1), ('Edad', .12, 1), ('Sexo', .13, 1), ('Expediente', .2, 1)], W),
         fields_row([('Representante legal (si aplica) y parentesco', .7, 1), ('Teléfono', .3, 1)], W),
         P('Procedimiento', 'h3'),
         fields_row([('Diagnóstico', 1, 1)], W),
         fields_row([('Procedimiento propuesto (incluye diente o zona)', 1, 2)], W),
         fields_row([('En qué consiste, explicado al paciente', 1, 2)], W),
         fields_row([('Beneficios esperados', 1, 1)], W),
         P('Riesgos y posibles complicaciones', 'h3'),
         P('Marca los que apliquen a este procedimiento y agrega los específicos:', 'small'),
         Table([[checklist(['Dolor o molestia posoperatoria', 'Inflamación o hematoma', 'Sangrado', 'Infección', 'Sensibilidad dental']),
                 checklist(['Adormecimiento temporal o, excepcionalmente, permanente de labio, lengua o mentón', 'Reacción al anestésico o a materiales',
                            'Fractura de restauración o de diente', 'Necesidad de tratamientos adicionales', 'Limitación de apertura bucal temporal'])]],
               colWidths=[W * .45, W * .55], style=[('VALIGN', (0, 0), (-1, -1), 'TOP'), ('LEFTPADDING', (0, 0), (-1, -1), 0)]),
         fields_row([('Riesgos específicos adicionales', 1, 2)], W),
         fields_row([('Alternativas de tratamiento, incluida la de no tratar y sus consecuencias', 1, 2)], W),
         PageBreak(),
         P('Declaraciones', 'h2'),
         P('Declaro que:'),
         numbered(['He sido informado(a) de forma clara y en un lenguaje comprensible sobre mi diagnóstico, el procedimiento propuesto, sus beneficios, riesgos, alternativas y el pronóstico.',
                   'He tenido la oportunidad de hacer preguntas y han sido respondidas a mi satisfacción.',
                   'Comprendo que la odontología no es una ciencia exacta y que no se me han garantizado resultados.',
                   'Autorizo la aplicación de anestesia local y los procedimientos adicionales que resulten necesarios durante el tratamiento para resolver complicaciones imprevistas, en beneficio de mi salud.',
                   'He informado con veracidad mis antecedentes médicos, alergias y medicamentos.',
                   'Sé que puedo revocar este consentimiento en cualquier momento antes del procedimiento, sin que ello afecte mi atención.']),
         P('Uso de imágenes clínicas (opcional)', 'h3'),
         checklist(['Autorizo el registro fotográfico y radiográfico con fines clínicos y de expediente.',
                    'Autorizo su uso con fines académicos o de difusión, sin datos que me identifiquen.']),
         Spacer(1, 8),
         P('Firmas', 'h2'),
         fields_row([('Nombre y firma del paciente o representante legal', .5, 2), ('Nombre, firma y cédula profesional del odontólogo', .5, 2)], W),
         fields_row([('Testigo 1 · nombre y firma', .5, 2), ('Testigo 2 · nombre y firma', .5, 2)], W),
         Spacer(1, 6),
         P('Revocación', 'h3'),
         P('Revoco el consentimiento otorgado en este documento y asumo las consecuencias que de ello se deriven.', 'small'),
         fields_row([('Fecha', .25, 1), ('Nombre y firma del paciente o representante legal', .75, 1)], W),
         Spacer(1, 8),
         callout('Nota para el consultorio', ['Formato elaborado con base en los apartados de la carta de consentimiento bajo información de la NOM-004-SSA3-2012 del expediente clínico (numeral 10.1). Consérvalo en el expediente del paciente.',
                                              'Es una plantilla general: adáptala al procedimiento y valídala con tu asesor legal antes de usarla.'], 'info')]
    return meta, s

# ════════════════════════════════════════════════════════════════════
# 4. Tabla de dosis anestésicas
# ════════════════════════════════════════════════════════════════════
ANEST = [  # nombre, presentación, mg por cartucho 1.8 mL, mg/kg, máx mg
    ('Lidocaína 2%', 'con epinefrina 1:100,000', 36, 7.0, 500),
    ('Articaína 4%', 'con epinefrina 1:100,000 o 1:200,000', 72, 7.0, 500),
    ('Mepivacaína 3%', 'sin vasoconstrictor', 54, 6.6, 400),
    ('Mepivacaína 2%', 'con vasoconstrictor', 36, 6.6, 400),
    ('Prilocaína 4%', 'simple o con epinefrina 1:200,000', 72, 8.0, 600),
    ('Bupivacaína 0.5%', 'con epinefrina 1:200,000', 9, 1.3, 90),
]

def dosis_anestesicas():
    meta = dict(title='Tabla de dosis<br/>anestésicas', short='Referencia · Dosis anestésicas', eyebrow='Tabla de referencia · Anestesia local',
                subtitle='Dosis máximas por kilogramo, cartuchos por peso y límites de epinefrina, en una sola hoja para tener a la mano en el consultorio.')
    s = [P('Dosis máximas recomendadas', 'h1'),
         table([['Anestésico', 'Presentación', 'mg por cartucho (1.8 mL)', 'Dosis máxima', 'Máximo absoluto']] +
               [[n, p, f'{mg}', f'{k} mg/kg', f'{m} mg'] for n, p, mg, k, m in ANEST],
               widths=[30 * mm, 50 * mm, 32 * mm, 30 * mm, 33 * mm]),
         P('Articaína: la FDA no establece un máximo absoluto; 500 mg es la referencia habitual. Verifica siempre el volumen del cartucho (1.7 o 1.8 mL) y la ficha técnica del fabricante.', 'tiny'),
         P('Cartuchos máximos por peso', 'h2'),
         P('Cálculo: <b>dosis máxima (mg) = peso (kg) × mg/kg</b>, sin rebasar el máximo absoluto. <b>Cartuchos = dosis máxima ÷ mg por cartucho</b>, redondeado hacia abajo al medio cartucho.', 'small')]
    pesos = [10, 15, 20, 25, 30, 40, 50, 60, 70, 80]
    def cart(mg, k, m, kg, epi):
        v = min(kg * k, m) / mg
        if epi: v = min(v, 11.1)  # límite de epinefrina 1:100,000 en paciente sano (0.2 mg)
        return f'{int(v * 2) / 2:g}'
    rows = [['Peso'] + [f'{p} kg' for p in pesos]]
    for n, p, mg, k, m in ANEST[:5]:
        rows.append([n] + [cart(mg, k, m, kg, 'epinefrina 1:100' in p or 'con vasoconstrictor' == p) for kg in pesos])
    s += [table(rows, widths=[30 * mm] + [14.5 * mm] * 10),
          P('En lidocaína, articaína y mepivacaína 2% con epinefrina 1:100,000 la tabla ya respeta el tope de 11 cartuchos por epinefrina en paciente sano. En pacientes cardiópatas el límite es de 2 cartuchos.', 'tiny'),
          callout('Ejemplo', 'Niño de 20 kg con lidocaína 2% con epinefrina: 20 × 7 = 140 mg → 140 ÷ 36 = 3.9 → <b>máximo 3.5 cartuchos</b>. En pacientes pediátricos usa siempre el peso real y la menor dosis eficaz.', 'ok'),
          P('Límite de epinefrina', 'h2'),
          table([['Concentración', 'mg de epinefrina por cartucho', 'Paciente sano (máx. 0.2 mg)', 'Paciente cardiópata (máx. 0.04 mg)'],
                 ['1:50,000', '0.036 mg', '5.5 cartuchos', '1 cartucho'],
                 ['1:100,000', '0.018 mg', '11 cartuchos', '2 cartuchos'],
                 ['1:200,000', '0.009 mg', '22 cartuchos', '4 cartuchos']],
                widths=[30 * mm, 45 * mm, 50 * mm, 50 * mm]),
          P('En adultos sanos con lidocaína 2% y epinefrina 1:100,000, el límite de epinefrina (11 cartuchos) llega antes que el del anestésico (13.8 cartuchos): respeta el menor de los dos.', 'small'),
          P('Precauciones', 'h2'),
          bullets(['<b>Reduce la dosis</b> en adultos mayores, pacientes con hepatopatía, insuficiencia renal o cardiaca, y en pacientes debilitados.',
                   '<b>Aspira antes de inyectar</b> e inyecta lento (aproximadamente 1 mL por minuto).',
                   '<b>Prilocaína y articaína</b> en dosis altas pueden producir metahemoglobinemia: evítalas en pacientes con metahemoglobinemia congénita, anemia o hipoxia.',
                   '<b>Evita vasoconstrictor o limítalo</b> en hipertiroidismo no controlado, hipertensión grave no controlada, arritmias o infarto reciente, y con antidepresivos tricíclicos o betabloqueadores no selectivos.',
                   '<b>Suma todos los anestésicos</b> aplicados en la misma sesión, incluido el tópico.'], 'small'),
          callout('Signos de toxicidad y qué hacer', ['<b>Signos tempranos:</b> locuacidad, ansiedad, mareo, zumbido de oídos, sabor metálico, adormecimiento perioral, temblor. <b>Tardíos:</b> convulsiones, depresión respiratoria, hipotensión, bradicardia, paro.',
                                                      '<b>Manejo:</b> suspende la aplicación, coloca al paciente en posición segura, administra oxígeno, monitorea signos vitales, activa el sistema de emergencias y aplica soporte vital básico. El tratamiento avanzado (incluida la emulsión lipídica) corresponde al protocolo hospitalario.'], 'alert')]
    s += refs(['Malamed SF. <i>Handbook of Local Anesthesia</i>. 7.ª ed. Elsevier; 2020.',
               'American Dental Association. Oral Health Topics: Anesthesia and Sedation.',
               'Bahl R. Local anesthesia in dentistry. <i>Anesth Prog</i>. 2004;51(4):138–142.'])
    s += [Spacer(1, 6), P(DISCLAIMER, 'tiny')]
    return meta, s

# ════════════════════════════════════════════════════════════════════
# 5. Protocolo · Abscesos periodontales
# ════════════════════════════════════════════════════════════════════
def protocolo_abscesos():
    meta = dict(title='Manejo de abscesos<br/>periodontales', short='Protocolo · Abscesos periodontales', eyebrow='Protocolo clínico · Periodoncia',
                subtitle='Del diagnóstico diferencial al control: pasos de atención de urgencia, criterios para antibióticos y cuándo referir.')
    s = [P('Qué es y por qué importa', 'h1'),
         P('El absceso periodontal es una acumulación localizada de pus dentro de la pared gingival de la bolsa periodontal, con destrucción tisular rápida. Es una de las pocas urgencias en periodoncia: su manejo oportuno alivia el dolor y limita la pérdida de inserción, y en pacientes con periodontitis avanzada puede ser la razón de perder el diente.', 'lead'),
         P('Clasificación (AAP/EFP 2017)', 'h2'),
         table([['Contexto', 'Causas frecuentes'],
                ['En paciente con periodontitis', 'Exacerbación aguda de una bolsa profunda sin tratar · Después del tratamiento: raspado incompleto que deja cálculo, cirugía periodontal, antibióticos sistémicos sin desbridamiento'],
                ['En paciente sin periodontitis', 'Impactación de cuerpos extraños (cáscara de semilla, hilo dental, palillo) · Hábitos (morder objetos) · Factores ortodóncicos · Agrandamiento gingival · Alteraciones de la superficie radicular: fisuras, fracturas, perlas del esmalte, reabsorción externa']],
               widths=[45 * mm, 130 * mm]),
         P('Diagnóstico', 'h2'),
         table([['Hallazgo', 'Qué buscar'],
                ['Síntomas', 'Dolor localizado, sensación de diente "alto", sabor desagradable'],
                ['Signos', 'Tumefacción ovoide de la encía, enrojecimiento, supuración espontánea o al presionar, bolsa profunda en la zona, movilidad y extrusión'],
                ['Vitalidad pulpar', 'Generalmente positiva (orienta contra origen endodóntico)'],
                ['Radiografía', 'Pérdida ósea previa; puede ser normal en etapas iniciales'],
                ['Estado general', 'Fiebre, malestar, linfadenopatía, trismus o celulitis indican compromiso sistémico']], widths=[35 * mm, 140 * mm]),
         P('Diagnóstico diferencial', 'h2'),
         table([['Entidad', 'Claves para distinguirla'],
                ['Absceso periapical', 'Vitalidad pulpar negativa, caries o restauración profunda, lesión radiolúcida apical, dolor a la percusión vertical'],
                ['Lesión endoperiodontal', 'Bolsa profunda que llega al ápice con pulpa necrótica; puede requerir ambos tratamientos'],
                ['Absceso gingival', 'Limitado a encía marginal o papila en zona sin bolsa previa, a menudo por cuerpo extraño'],
                ['Pericoronitis', 'Alrededor de un diente parcialmente erupcionado, típicamente tercer molar inferior'],
                ['Diente fisurado o fractura radicular', 'Bolsa angosta y aislada, dolor a la masticación, antecedente de endodoncia o poste']],
               widths=[45 * mm, 130 * mm]),
         PageBreak(),
         P('Protocolo de atención', 'h1'),
         callout('Paso 0 · Descarta urgencia médica', 'Fiebre alta, celulitis facial que se extiende, trismus, dificultad para tragar o respirar, o paciente inmunocomprometido descompensado: <b>referir de inmediato a servicio de urgencias o cirugía maxilofacial</b>. No retrases la referencia por intentar el drenaje.', 'alert'),
         numbered(['<b>Historia y exploración</b>: sondaje cuidadoso, movilidad, vitalidad pulpar y radiografía periapical.',
                   '<b>Anestesia local</b> con técnica que evite inyectar dentro del área infectada.',
                   '<b>Drenaje a través de la bolsa</b>: introduce suavemente la cureta o la sonda para liberar el pus. Si el absceso está fluctuante y no drena por la bolsa, realiza una incisión en el punto más declive.',
                   '<b>Desbridamiento</b>: raspado y alisado de la zona, retirando cálculo y cuerpos extraños, con instrumentación cuidadosa para no dañar más la inserción.',
                   '<b>Irrigación</b> con solución salina o clorhexidina al 0.12%.',
                   '<b>Ajuste oclusal</b> si el diente está extruido y en trauma oclusal.',
                   '<b>Indicaciones y analgesia</b>: por ejemplo, ibuprofeno 400 mg cada 8 horas por 3 días si no hay contraindicación; enjuagues de clorhexidina 0.12% dos veces al día por 7–14 días; dieta blanda.',
                   '<b>Control a las 24–72 horas</b> para verificar remisión.',
                   '<b>Terapia periodontal definitiva</b> a los 7–14 días: tratamiento no quirúrgico completo, reevaluación y, si hace falta, cirugía o extracción.']),
         P('¿Antibiótico sistémico?', 'h2'),
         P('El drenaje y el desbridamiento son el tratamiento. Los antibióticos sistémicos <b>no</b> sustituyen la intervención local y se reservan para:'),
         bullets(['Afectación sistémica: fiebre, malestar general, linfadenopatía.', 'Celulitis o diseminación de la infección.', 'Pacientes inmunocomprometidos o con condiciones sistémicas de riesgo.']),
         table([['Situación', 'Esquema de referencia en adultos'],
                ['Sin alergia a penicilina', 'Amoxicilina 500 mg cada 8 horas por 5–7 días'],
                ['Alergia a penicilina', 'Clindamicina 300 mg cada 8 horas por 5–7 días'],
                ['Infección más extensa', 'Valorar amoxicilina con metronidazol 500 mg cada 8 horas, según criterio clínico y guías locales']],
               widths=[50 * mm, 125 * mm]),
         P('Ajusta dosis y duración según peso, función renal, interacciones y guías vigentes de uso de antimicrobianos.', 'tiny'),
         P('Criterios de pronóstico desfavorable', 'h2'),
         bullets(['Pérdida de inserción que alcanza el ápice o compromiso de furca avanzado.', 'Movilidad grado III.', 'Abscesos recurrentes en el mismo sitio.', 'Fractura radicular vertical confirmada.'], 'small'),
         callout('Indicaciones para el paciente', 'Tomar el medicamento como se indicó, mantener la higiene con cepillo suave en la zona, no presionar ni pinchar la encía, regresar antes de la cita si aumenta la inflamación, aparece fiebre o dificultad para abrir la boca o tragar.', 'ok')]
    s += refs(['Herrera D, Retamal-Valdes B, Alonso B, Feres M. Acute periodontal lesions (periodontal abscesses and necrotizing periodontal diseases) and endo-periodontal lesions. <i>J Clin Periodontol</i>. 2018;45(Suppl 20):S78–S94.',
               'Papapanou PN, Sanz M, et al. Periodontitis: consensus report of workgroup 2 of the 2017 World Workshop. <i>J Clin Periodontol</i>. 2018;45(Suppl 20):S162–S170.',
               'Herrera D, Roldán S, Sanz M. The periodontal abscess: a review. <i>J Clin Periodontol</i>. 2000;27(6):377–386.'])
    s += [Spacer(1, 8), P(DISCLAIMER, 'tiny')]
    return meta, s
