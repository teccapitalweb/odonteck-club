# Genera docs/OdonTeck-guia-imagenes.pdf: prompts para portadas de curso y biblioteca.
import json, re, unicodedata
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle, KeepTogether)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

pdfmetrics.registerFont(TTFont('Body', 'C:/Windows/Fonts/arial.ttf'))
pdfmetrics.registerFont(TTFont('Bold', 'C:/Windows/Fonts/arialbd.ttf'))
pdfmetrics.registerFont(TTFont('Mono', 'C:/Windows/Fonts/consola.ttf'))

NAVY = colors.HexColor('#20254B'); BLUE = colors.HexColor('#2F6FB5'); TEAL = colors.HexColor('#4FA899')
PAPER = colors.HexColor('#F6F5F1'); LINE = colors.HexColor('#E5E2DA'); INK2 = colors.HexColor('#545A72'); INK3 = colors.HexColor('#8B90A5')

S = {
  'h1': ParagraphStyle('h1', fontName='Bold', fontSize=26, leading=30, textColor=NAVY, spaceAfter=6),
  'h2': ParagraphStyle('h2', fontName='Bold', fontSize=17, leading=21, textColor=NAVY, spaceBefore=6, spaceAfter=8),
  'h3': ParagraphStyle('h3', fontName='Bold', fontSize=12.5, leading=16, textColor=NAVY, spaceBefore=4, spaceAfter=3),
  'eyebrow': ParagraphStyle('eyebrow', fontName='Mono', fontSize=8, leading=10, textColor=INK3, spaceAfter=4),
  'body': ParagraphStyle('body', fontName='Body', fontSize=10, leading=14.5, textColor=colors.HexColor('#1B1F33')),
  'muted': ParagraphStyle('muted', fontName='Body', fontSize=9.5, leading=13.5, textColor=INK2),
  'small': ParagraphStyle('small', fontName='Body', fontSize=8.5, leading=12, textColor=INK3),
  'prompt': ParagraphStyle('prompt', fontName='Mono', fontSize=8.4, leading=11.8, textColor=colors.HexColor('#1B1F33')),
  'bullet': ParagraphStyle('bullet', fontName='Body', fontSize=10, leading=14.5, leftIndent=12, bulletIndent=0),
}

def caja(parrafos, bg=PAPER, borde=LINE, pad=9):
    t = Table([[parrafos]], colWidths=[None])
    t.setStyle(TableStyle([('BACKGROUND', (0,0), (-1,-1), bg), ('BOX', (0,0), (-1,-1), 0.6, borde),
                           ('LEFTPADDING', (0,0), (-1,-1), pad), ('RIGHTPADDING', (0,0), (-1,-1), pad),
                           ('TOPPADDING', (0,0), (-1,-1), pad), ('BOTTOMPADDING', (0,0), (-1,-1), pad)]))
    return t

def P(t, s='body'): return Paragraph(t, S[s])

MASTER = ("Editorial dental photography for a premium continuing-education platform. {subject}. "
          "Modern dental clinic setting, soft diffused studio light, cool palette of deep navy blue, sky blue and teal accents over white and light-gray surfaces, "
          "shallow depth of field, crisp macro detail, hyper-realistic, calm and professional mood. "
          "Main subject placed in the upper two thirds of the frame; the lower third is softly darkened and uncluttered to leave room for a title overlay. "
          "No text, no letters, no logos, no watermark, no borders.")
NEG = "text, letters, typography, logo, watermark, frame, border, collage, cartoon, illustration, low quality, blurry, extra fingers, deformed hands, distorted teeth, blood, gore, graphic surgery, dark and gloomy"

BOOK = ("Minimal premium book cover design, {subject}, single hero object rendered in clean 3D on a {bg} background, "
        "subtle diagonal gradient band from deep navy blue to teal, soft studio shadow, generous empty space in the top half for a title, "
        "flat and elegant, high resolution. No text, no letters, no logos, no watermark.")

def slug(s):
    s = unicodedata.normalize('NFD', s).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'(^-|-$)', '', re.sub(r'[^a-z0-9]+', '-', s))

cat = json.load(open('src/data/catalogo.json', encoding='utf-8'))['cursos']
SUBJECTS = {
 'diagnostico-en-ortodoncia': "a dentist's gloved hand pointing at a panoramic dental radiograph glowing on a lightbox, orthodontic bracket model slightly out of focus in the foreground",
 'diagnostico-y-clasificacion-de-la-caries': "extreme macro of a molar with an early enamel lesion seen through a dental magnifier, a fine explorer probe touching the surface, droplets of light on the enamel",
 'endodoncia-pediatrica': "a small pediatric dental model beside a neat row of colorful endodontic hand files on a sterile tray, soft pastel accents",
 'extracciones-simples': "stainless-steel dental forceps and elevators arranged on a sterile blue tray, gloved hands reaching in, clinic light reflecting on the metal",
 'ferulas-de-contencion': "a crystal-clear orthodontic retainer resting on a white dental model, light refracting through the transparent material",
 'manejo-de-abscesos-periodontales': "a periodontal probe measuring the gum line on a realistic dental model, a subtle translucent 3D cross-section of tooth and gum floating beside it",
 'materiales-dentales-restauradores': "composite resin syringes, ceramic CAD/CAM blocks and a shade guide laid out in a precise grid on a white lab bench",
 'ortodoncia-lingual-y-estetica': "close-up of lingual braces on the inner side of a typodont, polished metal catching the light, ceramic brackets in the background",
 'patologias-dentales-mas-comunes-en-la-infancia': "a child's bright smile with mixed dentition in a friendly pediatric dental clinic, dentist's mirror slightly blurred in the foreground",
 'periodoncia-estetica-manejo-de-encia': "smile design: a close-up of a healthy smile with faint geometric guide lines of gum contour and tooth proportion overlaid, soft clinical light",
 'periodoncia-estetica-y-plastica': "microsurgical periodontal instruments and magnification loupes on a sterile field, a gum graft model out of focus behind",
 'raspado-y-alisado-radicular': "the tip of an ultrasonic scaler and a set of Gracey curettes on a clean tray, fine water mist frozen in the light",
 'rehabilitacion-oral-estetica-con-coronas': "a monolithic zirconia bridge and single crowns on a dental model beside a screen showing a CAD design, warm white ceramic glow",
 'resinas-compuestas': "layering of composite resin shades on an incisor model, a shade guide fan and a fine brush, artistic close-up",
 'retroobturacion-en-endodoncia': "a dental surgical microscope in a modern operatory, an ultrasonic tip and an MTA capsule on the tray, precise cool light",
 'salud-oral-en-pacientes-con-condiciones-sistemicas': "a stethoscope resting beside a dental mirror on a medical chart, a blood-pressure cuff blurred in the background, calm integrated-care mood",
 'tratamientos-periodontales-no-quirurgicos': "a dental hygienist's hands with an ultrasonic scaler over a dental model with healthy pink gums, everything clean and bright",
 'traumatismos-dentales-en-ninos': "a pediatric dental model with a fractured front incisor next to a flexible splint and wire, gentle bright pediatric clinic",
}
def subject_for(c):
    for k, v in SUBJECTS.items():
        if c['id'].startswith(k): return v
    return "clean dental instruments on a sterile tray in a modern clinic"

LIBRARY = [
 ("Guía de bolsillo · Diagnóstico ortodóncico", "Guía clínica", "a single orthodontic bracket and a small caliper", "paper-white"),
 ("Atlas de caries · Clasificación ICDAS", "Atlas", "a translucent 3D molar showing a highlighted enamel lesion", "deep navy"),
 ("Formato de consentimiento informado", "Formato", "a fountain pen resting on a folded clinical form", "paper-white"),
 ("Tabla de dosis anestésicas", "Tabla de referencia", "a dental anesthetic cartridge and a syringe aligned vertically", "deep navy"),
 ("Protocolo de manejo de abscesos periodontales", "Protocolo", "a periodontal probe with a soft glowing measurement mark", "paper-white"),
 ("Guía de selección de materiales restauradores", "Guía clínica", "three ceramic blocks stacked in a neat column", "deep navy"),
 ("Manual de estratificación de resinas", "Manual", "a fan-shaped tooth shade guide", "paper-white"),
 ("Checklist de urgencias dentales pediátricas", "Checklist", "a small tooth-shaped first-aid box with a teal cross", "deep navy"),
 ("Guía de instrumentación endodóntica", "Guía clínica", "a rotary endodontic file standing upright, catching the light", "paper-white"),
 ("Plantilla de nota clínica y receta", "Plantilla", "a clipboard with a blank sheet and a dental mirror", "deep navy"),
]

def header_footer(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(NAVY); canvas.rect(0, letter[1]-14*mm, letter[0], 14*mm, fill=1, stroke=0)
    canvas.setFillColor(colors.white); canvas.setFont('Bold', 9); canvas.drawString(18*mm, letter[1]-9*mm, 'OdonTeck Club · Guía de imágenes v1')
    canvas.setFont('Mono', 8); canvas.drawRightString(letter[0]-18*mm, letter[1]-9*mm, 'TEC Capital · sep 2026')
    canvas.setFillColor(INK3); canvas.setFont('Body', 8); canvas.drawRightString(letter[0]-18*mm, 10*mm, f'{doc.page}')
    canvas.restoreState()

def cover(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(NAVY); canvas.rect(0, 0, letter[0], letter[1], fill=1, stroke=0)
    canvas.setFillColor(TEAL); canvas.circle(letter[0]-30*mm, letter[1]-40*mm, 60*mm, fill=1, stroke=0)
    canvas.setFillColor(BLUE); canvas.circle(letter[0]-70*mm, letter[1]-20*mm, 45*mm, fill=1, stroke=0)
    try: canvas.drawImage('public/brand/logo-horizontal-dark.png', 18*mm, letter[1]-40*mm, width=70*mm, height=19*mm, mask='auto')
    except Exception: pass
    canvas.setFillColor(colors.white)
    canvas.setFont('Mono', 9); canvas.drawString(18*mm, 120*mm, 'ODONTECK CLUB · IDENTIDAD VISUAL')
    canvas.setFont('Bold', 34); canvas.drawString(18*mm, 100*mm, 'Guía de imágenes'); canvas.drawString(18*mm, 86*mm, 'para cursos y biblioteca')
    canvas.setFont('Body', 12); canvas.setFillColor(colors.HexColor('#B6C2D8'))
    for i, l in enumerate(['Prompts listos para Nano Banana Pro: 18 portadas de curso, sus banners', 'y las portadas de la biblioteca de materiales, con formatos,', 'reglas de estilo y nombres de archivo para subirlas al admin.']):
        canvas.drawString(18*mm, 70*mm - i*6.5*mm, l)
    canvas.setFont('Mono', 8.5); canvas.drawString(18*mm, 22*mm, 'TEC Capital · septiembre 2026 · v1')
    canvas.restoreState()

doc = SimpleDocTemplate('docs/OdonTeck-guia-imagenes.pdf', pagesize=letter, leftMargin=18*mm, rightMargin=18*mm, topMargin=22*mm, bottomMargin=16*mm,
                        title='OdonTeck Club · Guía de imágenes', author='TEC Capital')
st = []
st.append(PageBreak())

# ── 1. Cómo usar ──
st += [P('1 · Cómo usar esta guía', 'h1'),
       P('Cada prompt está escrito en inglés porque los generadores de imagen responden mejor así. Copia el <b>prompt base</b>, pega dentro el <b>sujeto</b> del curso, añade el <b>prompt negativo</b> si tu herramienta lo admite y genera 4 variantes. Elige la que deje el tercio inferior más limpio: ahí va el título del curso en la app.', 'body'),
       Spacer(1, 8), P('Herramientas recomendadas', 'h3'),
       P('• <b>Nano Banana Pro</b> (la que usas): pega el prompt completo, elige la proporción con los botones y genera x2. No tiene campo de prompt negativo: por eso cada prompt ya trae al final la frase "No text, no letters, no logos…"; déjala siempre.<br/>• Alternativas si algún resultado no convence: <b>Midjourney v7</b> (<font name="Mono">--ar 3:4 --style raw --s 150</font>) o <b>ChatGPT / GPT Image</b>.', 'body'),
       Spacer(1, 8), P('Formatos y tamaños', 'h3')]
tf = Table([[P('<b>Uso</b>', 'body'), P('<b>Proporción</b>', 'body'), P('<b>Tamaño mínimo</b>', 'body'), P('<b>Dónde se ve</b>', 'body')],
            [P('Portada de curso', 'body'), P('<b>3:4</b> (vertical)', 'body'), P('1536 × 2048 px o más', 'body'), P('Tarjetas del catálogo, inicio y recomendados', 'muted')],
            [P('Banner de curso', 'body'), P('<b>16:9</b> (horizontal)', 'body'), P('2400 × 1350 px', 'body'), P('Cabecera grande de la página del curso y miniaturas de clase', 'muted')],
            [P('Portada de biblioteca', 'body'), P('<b>3:4</b> (libro)', 'body'), P('1800 × 2400 px', 'body'), P('Materiales: PDFs, libros, presentaciones', 'muted')]],
           colWidths=[38*mm, 34*mm, 34*mm, None])
tf.setStyle(TableStyle([('BACKGROUND', (0,0), (-1,0), PAPER), ('LINEBELOW', (0,0), (-1,-1), 0.5, LINE), ('VALIGN', (0,0), (-1,-1), 'TOP'),
                        ('TOPPADDING', (0,0), (-1,-1), 5), ('BOTTOMPADDING', (0,0), (-1,-1), 5)]))
st += [tf, Spacer(1, 6),
       P('<b>Con Nano Banana Pro:</b> elige <b>Imagen → 3:4</b> para portadas de curso y de biblioteca (las tarjetas del club ya están en 3:4, así que no hay que recortar nada) e <b>Imagen → 16:9</b> para los banners. Genera en <b>x2</b> para tener dos opciones y quédate con la que deje el tercio inferior más limpio. No uses 1:1: obligaría a recortar en la app.', 'muted'),
       Spacer(1, 8), P('Reglas de estilo (no negociables)', 'h3'),
       P('1. <b>Sin texto ni logos</b> en la imagen: el título, el área y el logo los pone la app.<br/>2. <b>Sujeto en los dos tercios superiores</b>; tercio inferior limpio y algo más oscuro (ahí va el título en blanco).<br/>3. <b>Paleta fría</b>: marino, azul cielo, teal, blancos y grises claros. Nada de rojos ni amarillos dominantes.<br/>4. <b>Nada gráfico</b>: sin sangre, sin cirugías explícitas, sin caras de pacientes reconocibles. Modelos, instrumental, radiografías y manos con guantes.<br/>5. <b>Un solo sujeto por imagen</b>. Si el prompt te da un collage, descártalo.<br/>6. Exporta en <b>JPG calidad 90</b> o WebP; el admin las optimiza al subirlas.', 'body')]

# ── 2. Prompt base ──
st += [PageBreak(), P('2 · Prompt base y prompt negativo', 'h1'),
       P('Sustituye <font name="Mono">{subject}</font> por el sujeto de cada curso (sección 3).', 'muted'), Spacer(1, 6),
       P('PROMPT BASE · PORTADA 3:4', 'eyebrow'), caja([P(MASTER.replace('{subject}', '<b>{subject}</b>'), 'prompt')]), Spacer(1, 6),
       P('EVITAR (si tu herramienta tiene prompt negativo; en Nano Banana no hace falta)', 'eyebrow'), caja([P(NEG, 'prompt')], bg=colors.HexColor('#FBEFEE'), borde=colors.HexColor('#E8C9C6')), Spacer(1, 6),
       P('BANNER 16:9 · MISMO SUJETO', 'eyebrow'),
       caja([P('Añade al final del prompt base: <b>"wide cinematic composition, subject on the right half, left half calm and out of focus for a large title"</b> y elige la proporción <b>16:9</b> en el generador.', 'body')]),
       Spacer(1, 6), P('Parámetros Midjourney sugeridos', 'h3'),
       caja([P('/imagine [prompt base con sujeto] --ar 3:4 --style raw --s 150 --v 7 --no text,logo,watermark', 'prompt')])]

# ── 3. Cursos ──
st += [PageBreak(), P('3 · Portadas de los 18 cursos', 'h1'), P('Para cada curso: pega el prompt base con este sujeto, <b>3:4</b> para la portada y <b>16:9</b> para el banner. Nombre de archivo: <font name="Mono">curso-&lt;slug&gt;.jpg</font> (3:4) y <font name="Mono">banner-&lt;slug&gt;.jpg</font> (16:9).', 'muted'), Spacer(1, 4)]
for i, c in enumerate(cat, 1):
    subj = subject_for(c)
    bloque = [P(f'{i:02d} · {c["area"].upper()} · {len(c["clases"])} CLASES', 'eyebrow'), P(c['titulo'], 'h3'),
              P('PROMPT LISTO PARA PEGAR · 3:4', 'eyebrow'), caja([P(MASTER.replace('{subject}', subj), 'prompt')]), Spacer(1, 3),
              P(f'Archivos: <font name="Mono">curso-{c["id"]}.jpg</font> · <font name="Mono">banner-{c["id"]}.jpg</font>', 'small'), Spacer(1, 9)]
    st.append(KeepTogether(bloque))

# ── 4. Biblioteca ──
st += [PageBreak(), P('4 · Biblioteca: recursos propuestos y sus portadas', 'h1'),
       P('Estos 10 recursos son una propuesta de lo que un odontólogo del club querría descargar. Cada uno lleva su portada 3:4 estilo libro. Si un recurso todavía no existe, su portada puede esperar; si prefieres otros, el prompt de portada de libro sirve para cualquiera cambiando el objeto.', 'muted'), Spacer(1, 6),
       P('PROMPT BASE · PORTADA DE LIBRO 3:4', 'eyebrow'), caja([P(BOOK.replace('{subject}', '<b>{subject}</b>').replace('{bg}', '<b>{fondo}</b>'), 'prompt')]),
       P('Alterna fondos <b>paper-white</b> y <b>deep navy</b> para que la estantería tenga ritmo. Archivo: <font name="Mono">lib-&lt;slug&gt;.jpg</font>.', 'small'), Spacer(1, 8)]
for i, (titulo, tipo, subj, bg) in enumerate(LIBRARY, 1):
    st.append(KeepTogether([P(f'{i:02d} · {tipo.upper()} · FONDO {bg.upper()}', 'eyebrow'), P(titulo, 'h3'),
                            caja([P(BOOK.replace('{subject}', subj).replace('{bg}', bg), 'prompt')]),
                            P(f'Archivo: <font name="Mono">lib-{slug(titulo)}.jpg</font>', 'small'), Spacer(1, 9)]))

# ── 5. Entrega ──
st += [PageBreak(), P('5 · Checklist de entrega', 'h1'),
       P('• 18 portadas 3:4 → <font name="Mono">curso-*.jpg</font><br/>• 18 banners 16:9 → <font name="Mono">banner-*.jpg</font> (opcional en la primera tanda; si no hay, uso la portada)<br/>• 10 portadas de biblioteca 3:4 → <font name="Mono">lib-*.jpg</font><br/>• Todo sin texto, sin logos, tercio inferior limpio<br/>• Carpeta única, me la pasas y las subo al admin o las cargas tú cuando esté listo', 'body'),
       Spacer(1, 10), P('Extras que elevan el club (cuando haya tiempo)', 'h3'),
       P('• <b>Fotos de instructores</b>: retrato de medio cuerpo, fondo liso claro, bata o uniforme, mirada a cámara, 1:1, 1200 px. Salen en la página de curso y en las tarjetas.<br/>• <b>Foto de portada del inicio</b>: 16:9, consultorio moderno con luz natural, sin personas reconocibles; hoy uso una foto pequeña del sitio viejo.<br/>• <b>Iconos de área</b> (9): línea fina, un solo color, 512 px SVG o PNG: Ortodoncia, Periodoncia, Endodoncia, Odontopediatría, Cirugía, Estética, Materiales, Cariología, Medicina bucal.', 'body')]

doc.build(st, onFirstPage=cover, onLaterPages=header_footer)
print('ok docs/OdonTeck-guia-imagenes.pdf')
