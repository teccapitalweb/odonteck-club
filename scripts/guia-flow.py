# Genera docs/OdonTeck-prompts-flow.pdf: prompts listos para copiar y pegar en Flow (Nano Banana Pro) con el logo adjunto.
import json, sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'materiales'))
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import mm
from reportlab.platypus import Spacer, PageBreak, KeepTogether, Table, TableStyle
from kit import *

W = 175 * mm

LOGO_TXT = ("Use the attached OdonTeck logo exactly as provided: do not redraw, recolor, stretch or change its letters. ")

def book_prompt(obj, lineart, fondo):
    bg = ('pure white matte background with a very subtle paper texture' if fondo == 'blanco'
          else 'deep navy blue (#20254B) matte background with a very subtle paper texture')
    band = ('a bold diagonal band crossing the lower third from the bottom-left corner up to the right edge, smooth gradient from deep navy blue (#20254B) to teal (#4FA899)' if fondo == 'blanco'
            else 'a bold diagonal band crossing the lower third from the bottom-left corner up to the right edge, smooth gradient from sky blue (#4A7FC1) to teal (#6FBFB0)')
    logo_pos = ('Place it small in the top-left corner with a generous margin, as a quiet signature of the design.' if fondo == 'blanco'
                else 'Place it small in the top-left corner with a generous margin on a small white rounded label, as a quiet signature of the design.')
    return (f"Minimalist premium cover artwork for a clinical guide made for dentists, vertical 3:4, flat full-bleed design (not a book mockup). "
            f"{bg[0].upper() + bg[1:]}. Slightly above the center, a single hero object: {obj}, rendered as a clean photorealistic 3D product shot "
            f"in brushed stainless steel and white dental ceramic, soft studio light and a soft contact shadow. "
            f"Behind the object, a very faint fine-line technical illustration of {lineart}, thin light-gray lines like an anatomical dental drawing. "
            f"{band[0].upper() + band[1:]}. {LOGO_TXT}{logo_pos} "
            f"Lots of negative space, editorial, calm, clinical and elegant. No other text, no titles, no letters, no watermark.")

def course_prompt(scene):
    return (f"Premium editorial photograph for an online dental course cover, vertical 3:4. {scene}. "
            f"Modern dental clinic, soft diffused light, cool palette of deep navy blue, sky blue and teal accents over white and light-gray surfaces, "
            f"shallow depth of field, crisp macro detail, photorealistic, calm and professional. "
            f"Main subject in the middle of the frame; the bottom third fades softly into a darker navy tone and stays simple, leaving room for a title. "
            f"{LOGO_TXT}Place it small and centered at the very top, with a generous margin, in white so it reads on the photo. "
            f"No other text, no letters, no watermark, no borders. Gloved hands only, no recognizable patient faces, no blood.")

LIBROS = [
    ('lib-guia-diagnostico-ortodoncico', 'Guía de bolsillo · Diagnóstico ortodóncico', 'a single ceramic orthodontic bracket next to a small precision dental caliper', 'a dental arch seen from above with the first molars marked', 'blanco'),
    ('lib-atlas-caries-icdas', 'Atlas de caries · Clasificación ICDAS', 'a translucent glass-like molar with a small highlighted enamel lesion on the occlusal fissure', 'a molar cross-section showing enamel, dentin and pulp layers', 'marino'),
    ('lib-consentimiento-informado', 'Formato de consentimiento informado', 'a sleek fountain pen resting diagonally on a folded clinical form with a dental mirror beside it', 'a tooth outline with a small check mark', 'blanco'),
    ('lib-tabla-dosis-anestesicas', 'Tabla de dosis anestésicas', 'a dental anesthetic cartridge standing upright next to a stainless steel aspirating dental syringe', 'a mandible with the inferior alveolar nerve path', 'marino'),
    ('lib-protocolo-abscesos', 'Protocolo · Abscesos periodontales', 'a periodontal probe with millimeter markings resting on a small white tooth model with gum', 'a tooth and gum cross-section showing a periodontal pocket', 'blanco'),
    ('lib-guia-materiales-restauradores', 'Guía de materiales restauradores', 'three ceramic CAD/CAM blocks in white, ivory and translucent shades stacked in a neat column', 'a molar with an inlay outline', 'marino'),
    ('lib-manual-estratificacion-resinas', 'Manual de estratificación de resinas', 'a fan-shaped tooth shade guide slightly opened, with a fine composite brush', 'an upper central incisor showing enamel, dentin and incisal translucency layers', 'blanco'),
    ('lib-checklist-urgencias-pediatricas', 'Checklist de urgencias pediátricas', 'a small rounded tooth-shaped first-aid case in white with a teal cross', 'a child primary dentition arch', 'marino'),
    ('lib-guia-instrumentacion-endodontica', 'Guía de instrumentación endodóntica', 'a single rotary nickel-titanium endodontic file standing upright, catching the light', 'a molar with its root canals drawn in', 'blanco'),
    ('lib-plantilla-nota-clinica-receta', 'Plantilla de nota clínica y receta', 'a minimalist clipboard with a blank sheet and a dental mirror laid across it', 'a full dental chart (odontogram) grid', 'marino'),
]

cat = json.load(open('src/data/catalogo.json', encoding='utf-8'))['cursos']
ESCENAS = {
 'diagnostico-en-ortodoncia': "A dentist's gloved hand pointing with a pen at a panoramic dental radiograph glowing on a lightbox, a typodont with ceramic brackets slightly out of focus in front",
 'diagnostico-y-clasificacion-de-la-caries': "Extreme macro of a lower molar on a dental model, a ball-ended dental probe gently touching the occlusal fissure, a dental mirror reflecting light",
 'endodoncia-pediatrica': "A small pediatric dental model beside a neat row of colorful endodontic hand files on a sterile tray, soft pastel accents",
 'extracciones-simples': "Stainless-steel dental extraction forceps and elevators arranged on a sterile blue tray, gloved hands reaching in, clinic light reflecting on the metal",
 'ferulas-de-contencion': "A crystal-clear orthodontic retainer resting on a white dental model, light refracting through the transparent material",
 'manejo-de-abscesos-periodontales': "A periodontal probe measuring the gum line on a realistic dental model with pink gums, a subtle translucent 3D cross-section of tooth and gum floating beside it",
 'materiales-dentales-restauradores': "Composite resin syringes, ceramic CAD/CAM blocks and a shade guide laid out in a precise grid on a white lab bench",
 'ortodoncia-lingual-y-estetica': "Close-up of lingual braces on the inner side of a typodont, polished metal catching the light, ceramic brackets in the background",
 'patologias-dentales-mas-comunes-en-la-infancia': "A friendly pediatric dental chair with a small plush tooth and a child-size dental mirror on the tray, bright and welcoming",
 'periodoncia-estetica-manejo-de-encia': "Close-up of a healthy smile on a dental model with faint geometric guide lines of gum contour and tooth proportion overlaid",
 'periodoncia-estetica-y-plastica': "Microsurgical periodontal instruments and dental magnification loupes on a sterile field, a gum graft model out of focus behind",
 'raspado-y-alisado-radicular': "The tip of an ultrasonic scaler and a set of Gracey curettes on a clean tray, fine water mist frozen in the light",
 'rehabilitacion-oral-estetica-con-coronas': "A zirconia bridge and single ceramic crowns on a dental model beside a monitor showing a CAD crown design",
 'resinas-compuestas': "Layering of composite resin on an upper incisor model, a shade guide fan and a fine brush, artistic close-up",
 'retroobturacion-en-endodoncia': "A dental surgical microscope in a modern operatory, an ultrasonic tip and a small capsule of repair material on the tray, precise cool light",
 'salud-oral-en-pacientes-con-condiciones-sistemicas': "A stethoscope resting beside a dental mirror and a blood-pressure cuff on a clinical desk, calm integrated-care mood",
 'tratamientos-periodontales-no-quirurgicos': "A dental hygienist's gloved hands holding an ultrasonic scaler over a dental model with healthy pink gums, clean and bright",
 'traumatismos-dentales-en-ninos': "A pediatric dental model with a fractured upper front incisor next to a thin flexible splint wire, gentle bright pediatric clinic",
}
def escena(c):
    for k, v in ESCENAS.items():
        if c['id'].startswith(k): return v
    return "Clean dental instruments on a sterile tray in a modern clinic"

def prompt_box(text):
    t = Table([[P(text, 'cell')]], colWidths=[W])
    t.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, -1), PAPER), ('BOX', (0, 0), (-1, -1), 0.8, LINE),
                           ('LEFTPADDING', (0, 0), (-1, -1), 10), ('RIGHTPADDING', (0, 0), (-1, -1), 10), ('TOPPADDING', (0, 0), (-1, -1), 9), ('BOTTOMPADDING', (0, 0), (-1, -1), 9)]))
    return t

def chips(*items):
    cells = [P(f'<font name="Semi" color="#FFFFFF">{i}</font>', 'cell') for i in items]
    t = Table([cells])
    t.setStyle(TableStyle([('BACKGROUND', (0, 0), (0, 0), NAVY), ('BACKGROUND', (1, 0), (1, 0), TEAL), ('BACKGROUND', (2, 0), (2, 0), SKY),
                           ('LEFTPADDING', (0, 0), (-1, -1), 7), ('RIGHTPADDING', (0, 0), (-1, -1), 7), ('TOPPADDING', (0, 0), (-1, -1), 3), ('BOTTOMPADDING', (0, 0), (-1, -1), 3)]))
    t.hAlign = 'LEFT'
    return t

def ficha(n, total, nombre, archivo, formato, prompt):
    return KeepTogether([P(f'{n:02d} DE {total}', 'eyebrow'), P(nombre, 'h3'), chips(f'Formato {formato}', 'Adjunta el logo', f'Guardar como {archivo}.png'),
                         Spacer(1, 5), prompt_box(prompt), Spacer(1, 14)])

meta = dict(title='Portadas en Flow<br/>copia y pega', short='Prompts para Flow', eyebrow='Guía de imágenes · Nano Banana Pro',
            subtitle='28 imágenes con su prompt completo: 10 portadas de la biblioteca y 18 portadas de curso. Adjuntas el logo, pegas el prompt y listo.')
s = [P('Cómo hacerlo (3 pasos, igual para todas)', 'h1'),
     table([['Paso', 'Qué hacer en Flow'],
            ['1 · Adjunta el logo', 'Sube el archivo <b>odonteck-logo-flow.png</b> como imagen de referencia. Es el mismo para las 28 imágenes. Si no te deja subir PNG con transparencia, usa <b>odonteck-logo-flow-fondo-blanco.png</b>.'],
            ['2 · Configura', 'Elige <b>Imagen</b>, proporción <b>3:4</b> y <b>x2</b> (dos opciones). Modelo: Nano Banana Pro.'],
            ['3 · Pega y elige', 'Copia el bloque gris completo de la imagen que toque y pégalo tal cual. De las dos opciones quédate con la que tenga el logo más fiel y limpio. Guárdala con el nombre que dice la etiqueta.']],
           widths=[40 * mm, 135 * mm]),
     P('Cómo saber si quedó bien', 'h2'),
     checklist(['El logo se ve <b>igual</b> al original: el diente con degradado y las letras "OdonTeck / Consulting Group" sin deformar. Si cambió una letra o el diente, genera otra vez.',
                'No hay textos inventados además del logo.',
                'En las portadas de la biblioteca: fondo limpio, un solo objeto y la banda diagonal marino→teal abajo.',
                'En las portadas de curso: la parte de abajo es más oscura y sencilla (ahí la app pone el título).']),
     callout('Si el logo sale deformado varias veces', 'Genera la imagen sin logo borrando la frase que empieza con "Use the attached OdonTeck logo…" y pásamela así: yo le coloco el logo original encima con la posición exacta. Queda perfecto y no pierdes la imagen.', 'info'),
     P('Dónde se ven', 'h2'),
     table([['Imágenes', 'Dónde aparecen en el club'],
            ['Biblioteca (10)', 'Estantería de Materiales y ficha de cada PDF, con efecto de libro en relieve que pone la app'],
            ['Cursos (18)', 'Tarjetas del catálogo, inicio, recomendados y cabecera de la página del curso']], widths=[40 * mm, 135 * mm]),
     P('Carpeta final: pon todas en <b>Escritorio › Imagenes a usar › para-flow</b> y avísame; yo las optimizo y las coloco.', 'small'),
     PageBreak(), P('Biblioteca de materiales · 10 portadas', 'h1'),
     P('Minimalistas, blancas o marino, con un objeto odontológico en 3D, un dibujo técnico dental muy tenue detrás, la banda diagonal de la marca y el logo pequeño arriba a la izquierda.', 'lead')]
for i, (arch, nombre, obj, line, fondo) in enumerate(LIBROS, 1):
    s.append(ficha(i, 10, nombre, arch, '3:4', book_prompt(obj, line, fondo)))
s += [PageBreak(), P('Cursos · 18 portadas', 'h1'),
      P('Fotografía clínica editorial con la paleta de la marca, parte inferior oscura para el título y el logo pequeño en blanco arriba al centro.', 'lead')]
for i, c in enumerate(cat, 1):
    s.append(ficha(i, 18, c['titulo'], f'curso-{c["id"]}', '3:4', course_prompt(escena(c))))

build('docs/OdonTeck-prompts-flow.pdf', meta, s)
print('ok docs/OdonTeck-prompts-flow.pdf')
