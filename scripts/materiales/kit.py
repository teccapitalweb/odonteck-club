# Kit de diseño para los materiales PDF de OdonTeck Club (reportlab).
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Table, TableStyle,
                                KeepTogether, PageBreak, ListFlowable, ListItem)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.fonts import addMapping

F = 'C:/Windows/Fonts/'
for name, file in [('Display', 'seguibl.ttf'), ('Bold', 'segoeuib.ttf'), ('Semi', 'seguisb.ttf'), ('Body', 'segoeui.ttf'), ('Mono', 'consola.ttf')]:
    pdfmetrics.registerFont(TTFont(name, F + file))
pdfmetrics.registerFontFamily('Body', normal='Body', bold='Bold', italic='Body', boldItalic='Bold')
pdfmetrics.registerFontFamily('Semi', normal='Semi', bold='Bold', italic='Semi', boldItalic='Bold')
pdfmetrics.registerFontFamily('Bold', normal='Bold', bold='Display', italic='Bold', boldItalic='Display')

NAVY = colors.HexColor('#20254B'); BLUE = colors.HexColor('#2F6FB5'); SKY = colors.HexColor('#4A7FC1')
TEAL = colors.HexColor('#4FA899'); TEAL_L = colors.HexColor('#6FBFB0'); PAPER = colors.HexColor('#F6F5F1')
LINE = colors.HexColor('#E5E2DA'); INK = colors.HexColor('#1B1F33'); INK2 = colors.HexColor('#545A72'); INK3 = colors.HexColor('#8B90A5')
BLUE_50 = colors.HexColor('#EEF4FB'); TEAL_50 = colors.HexColor('#EDF8F6'); AMBER_50 = colors.HexColor('#FDF4E4'); AMBER = colors.HexColor('#C7871A')
RED_50 = colors.HexColor('#FBECEB'); RED = colors.HexColor('#C9463D'); WHITE = colors.white

LOGO = 'public/brand/logo-horizontal.png'
LOGO_DARK = 'public/brand/logo-horizontal-dark.png'

S = {
    'h1': ParagraphStyle('h1', fontName='Display', fontSize=21, leading=25, textColor=NAVY, spaceBefore=4, spaceAfter=8),
    'h2': ParagraphStyle('h2', fontName='Bold', fontSize=13.5, leading=17, textColor=NAVY, spaceBefore=12, spaceAfter=5),
    'h3': ParagraphStyle('h3', fontName='Semi', fontSize=11, leading=14, textColor=NAVY, spaceBefore=8, spaceAfter=3),
    'eyebrow': ParagraphStyle('eyebrow', fontName='Mono', fontSize=7.8, leading=10, textColor=TEAL, spaceAfter=2),
    'body': ParagraphStyle('body', fontName='Body', fontSize=9.8, leading=14.6, textColor=INK, spaceAfter=5),
    'lead': ParagraphStyle('lead', fontName='Body', fontSize=11.2, leading=16.5, textColor=INK2, spaceAfter=8),
    'small': ParagraphStyle('small', fontName='Body', fontSize=8.3, leading=11.6, textColor=INK2),
    'tiny': ParagraphStyle('tiny', fontName='Body', fontSize=7.4, leading=10, textColor=INK3),
    'cell': ParagraphStyle('cell', fontName='Body', fontSize=8.7, leading=11.8, textColor=INK),
    'cellb': ParagraphStyle('cellb', fontName='Semi', fontSize=8.7, leading=11.8, textColor=INK),
    'head': ParagraphStyle('head', fontName='Semi', fontSize=8.4, leading=11, textColor=WHITE),
    'ref': ParagraphStyle('ref', fontName='Body', fontSize=8, leading=11.2, textColor=INK2, leftIndent=10, firstLineIndent=-10, spaceAfter=3),
}

def P(t, s='body'): return Paragraph(t, S[s])

def bullets(items, style='body', color=TEAL):
    return ListFlowable([ListItem(P(i, style), leftIndent=12, value='circle') for i in items],
                        bulletType='bullet', start='•', bulletColor=color, bulletFontSize=9, leftIndent=12, spaceBefore=0, spaceAfter=4)

def numbered(items, style='body'):
    return ListFlowable([ListItem(P(i, style), leftIndent=16) for i in items], bulletType='1', bulletFontName='Bold',
                        bulletColor=NAVY, bulletFontSize=9, leftIndent=16, spaceAfter=4)

def callout(title, text, kind='info'):
    bg, bar = {'info': (BLUE_50, SKY), 'ok': (TEAL_50, TEAL), 'warn': (AMBER_50, AMBER), 'alert': (RED_50, RED)}[kind]
    body = [P(f'<font name="Semi" color="{bar.hexval().replace("0x", "#")}">{title}</font>', 'cellb')]
    body += [P(t, 'cell') for t in (text if isinstance(text, list) else [text])]
    t = Table([['', body]], colWidths=[3, None])
    t.setStyle(TableStyle([('BACKGROUND', (0, 0), (0, 0), bar), ('BACKGROUND', (1, 0), (1, 0), bg),
                           ('LEFTPADDING', (1, 0), (1, 0), 10), ('RIGHTPADDING', (1, 0), (1, 0), 10),
                           ('TOPPADDING', (0, 0), (-1, -1), 8), ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                           ('LEFTPADDING', (0, 0), (0, 0), 0), ('RIGHTPADDING', (0, 0), (0, 0), 0), ('VALIGN', (0, 0), (-1, -1), 'TOP')]))
    return KeepTogether([Spacer(1, 4), t, Spacer(1, 6)])

def table(rows, widths=None, head=True, zebra=True, first_bold=True):
    data = []
    for r, row in enumerate(rows):
        cells = []
        for c, v in enumerate(row):
            if isinstance(v, str):
                st = 'head' if head and r == 0 else ('cellb' if first_bold and c == 0 else 'cell')
                cells.append(P(v, st))
            else:
                cells.append(v)
        data.append(cells)
    t = Table(data, colWidths=widths, repeatRows=1 if head else 0)
    st = [('VALIGN', (0, 0), (-1, -1), 'TOP'), ('LINEBELOW', (0, 0), (-1, -1), 0.5, LINE),
          ('TOPPADDING', (0, 0), (-1, -1), 5), ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
          ('LEFTPADDING', (0, 0), (-1, -1), 6), ('RIGHTPADDING', (0, 0), (-1, -1), 6)]
    if head: st += [('BACKGROUND', (0, 0), (-1, 0), NAVY)]
    if zebra:
        for i in range(1 if head else 0, len(data)):
            if i % 2 == 0: st.append(('BACKGROUND', (0, i), (-1, i), PAPER))
    t.setStyle(TableStyle(st))
    return t

def _box(size=9):
    b = Table([['']], colWidths=[size], rowHeights=[size])
    b.setStyle(TableStyle([('BOX', (0, 0), (-1, -1), 0.9, SKY), ('LEFTPADDING', (0, 0), (-1, -1), 0), ('RIGHTPADDING', (0, 0), (-1, -1), 0),
                           ('TOPPADDING', (0, 0), (-1, -1), 0), ('BOTTOMPADDING', (0, 0), (-1, -1), 0)]))
    return b

def checklist(items, style='cell'):
    rows = [[_box(), P(i, style)] for i in items]
    t = Table(rows, colWidths=[18, None])
    t.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP'), ('TOPPADDING', (0, 0), (-1, -1), 3), ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
                           ('LEFTPADDING', (0, 0), (-1, -1), 0), ('TOPPADDING', (0, 0), (0, -1), 5)]))
    return t

def field(label, lines=1, width=None, gap=15):
    rows = [[P(label, 'tiny')]] + [['' ] for _ in range(lines)]
    t = Table(rows, colWidths=[width], rowHeights=[11] + [gap] * lines)
    t.setStyle(TableStyle([('LINEBELOW', (0, 1), (-1, -1), 0.6, INK3), ('LEFTPADDING', (0, 0), (-1, -1), 0),
                           ('RIGHTPADDING', (0, 0), (-1, -1), 0), ('TOPPADDING', (0, 0), (-1, -1), 0), ('BOTTOMPADDING', (0, 0), (-1, -1), 1)]))
    return t

def fields_row(specs, total):
    # specs: [(label, fraction, lines)]
    cells = [field(l, n, total * f - 8) for l, f, n in specs]
    t = Table([cells], colWidths=[total * f for _, f, _ in specs])
    t.setStyle(TableStyle([('LEFTPADDING', (0, 0), (-1, -1), 0), ('RIGHTPADDING', (0, 0), (-1, -1), 8), ('VALIGN', (0, 0), (-1, -1), 'BOTTOM'),
                           ('TOPPADDING', (0, 0), (-1, -1), 2), ('BOTTOMPADDING', (0, 0), (-1, -1), 6)]))
    return t

def refs(items):
    return [P('Referencias', 'h2')] + [P(f'{i + 1}. {r}', 'ref') for i, r in enumerate(items)]

DISCLAIMER = ('Material de apoyo educativo para miembros del Club OdonTeck. No sustituye el juicio clínico, la valoración individual del paciente '
              'ni las guías y normas vigentes. Verifica dosis e indicaciones con la ficha técnica de cada producto.')

# ── Portada ───────────────────────────────────────────────────────────
def draw_cover(c, w, h, meta):
    c.saveState()
    c.setFillColor(WHITE); c.rect(0, 0, w, h, fill=1, stroke=0)
    # banda diagonal marino → teal
    p = c.beginPath()
    p.moveTo(0, h * 0.10); p.lineTo(w, h * 0.34); p.lineTo(w, h * 0.21); p.lineTo(0, -h * 0.03); p.close()
    c.saveState(); c.clipPath(p, stroke=0, fill=0)
    c.linearGradient(0, 0, w, h * 0.3, (NAVY, colors.HexColor('#1C4A8F'), TEAL), (0, 0.55, 1), extend=True)
    c.restoreState()
    # logo
    lw = min(w * 0.30, 190); c.drawImage(LOGO, w * 0.08, h - h * 0.08 - lw * 0.27, width=lw, height=lw * 0.27, mask='auto')
    # textos
    x = w * 0.08; tw = w * 0.80
    ey = Paragraph(meta['eyebrow'].upper(), ParagraphStyle('ce', fontName='Mono', fontSize=max(8, w / 70), leading=max(11, w / 52), textColor=TEAL))
    ti = Paragraph(meta['title'], ParagraphStyle('ct', fontName='Display', fontSize=w / 16, leading=w / 14.2, textColor=NAVY))
    su = Paragraph(meta.get('subtitle', ''), ParagraphStyle('cs', fontName='Body', fontSize=w / 46, leading=w / 32, textColor=INK2))
    top = h * 0.70
    for par, gap in [(ey, 10), (ti, 14), (su, 0)]:
        _, ph = par.wrap(tw, h); top -= ph; par.drawOn(c, x, top); top -= gap
    # pie
    c.setFont('Semi', max(8, w / 72)); c.setFillColor(NAVY); c.drawString(x, h * 0.415, meta.get('author', 'Equipo académico OdonTeck'))
    c.setFont('Mono', max(7, w / 90)); c.setFillColor(INK3); c.drawString(x, h * 0.415 - max(12, w / 50), meta.get('edition', 'Edición 1 · septiembre 2026'))
    c.setFont('Mono', max(7, w / 95)); c.setFillColor(WHITE); c.drawRightString(w - w * 0.06, h * 0.035, 'CLUB ODONTECK · MATERIAL PARA MIEMBROS')
    c.restoreState()

def build(path, meta, story, landscape_size=None):
    size = landscape_size or letter
    w, h = size
    doc = BaseDocTemplate(path, pagesize=size, leftMargin=20 * mm, rightMargin=20 * mm, topMargin=24 * mm, bottomMargin=20 * mm,
                          title=meta['title'].replace('<br/>', ' '), author='OdonTeck Consulting Group', subject=meta['eyebrow'])
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id='f', leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)

    def on_cover(c, d):
        img = meta.get('cover_image')
        if img:  # portada generada en Flow, a sangre
            c.drawImage(img, 0, 0, width=w, height=h, preserveAspectRatio=False)
        else:
            draw_cover(c, w, h, meta)

    def on_page(c, d):
        c.saveState()
        c.drawImage(LOGO, 20 * mm, h - 15 * mm, width=26 * mm, height=7 * mm, mask='auto')
        c.setFont('Mono', 7.2); c.setFillColor(INK3); c.drawRightString(w - 20 * mm, h - 12.5 * mm, meta['short'].upper())
        c.setStrokeColor(LINE); c.setLineWidth(0.6); c.line(20 * mm, h - 18 * mm, w - 20 * mm, h - 18 * mm)
        c.line(20 * mm, 14 * mm, w - 20 * mm, 14 * mm)
        c.setFont('Body', 6.8); c.setFillColor(INK3)
        c.drawString(20 * mm, 9.5 * mm, 'Material educativo · no sustituye el juicio clínico ni las normas vigentes')
        c.setFont('Semi', 8); c.setFillColor(NAVY); c.drawRightString(w - 20 * mm, 9.5 * mm, str(d.page))
        c.restoreState()

    doc.addPageTemplates([PageTemplate(id='cover', frames=[frame], onPage=on_cover), PageTemplate(id='body', frames=[frame], onPage=on_page)])
    from reportlab.platypus.doctemplate import NextPageTemplate
    doc.build([NextPageTemplate('body'), PageBreak()] + story)
    return doc
