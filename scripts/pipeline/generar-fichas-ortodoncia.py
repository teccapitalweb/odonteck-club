"""Genera cinco fichas PDF editoriales a partir del paquete validado del curso."""

from __future__ import annotations

import html
import json
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate,
    Flowable,
    Frame,
    Image,
    KeepTogether,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[2]
CONTENIDO = ROOT / "scripts" / "pipeline" / "out" / "contenido" / "diagnostico-en-ortodoncia-para-odontologos-generales.json"
SALIDA = ROOT / "output" / "pdf"
LOGO_OSCURO = ROOT / "public" / "brand" / "logo-horizontal-dark.png"

NAVY = colors.HexColor("#142657")
NAVY_2 = colors.HexColor("#203F76")
TEAL = colors.HexColor("#149A8D")
MINT = colors.HexColor("#DDF4EF")
GOLD = colors.HexColor("#D9A441")
INK = colors.HexColor("#16213A")
MUTED = colors.HexColor("#5D6B82")
LINE = colors.HexColor("#DCE4EC")
PAPER = colors.HexColor("#F7F9FB")
WARN = colors.HexColor("#FFF3D6")


def registrar_fuentes() -> None:
    pdfmetrics.registerFont(TTFont("Segoe", r"C:\Windows\Fonts\segoeui.ttf"))
    pdfmetrics.registerFont(TTFont("SegoeBold", r"C:\Windows\Fonts\segoeuib.ttf"))


def esc(texto: object) -> str:
    return html.escape(str(texto))


class Pill(Flowable):
    def __init__(self, texto: str, fondo=TEAL, frente=colors.white, ancho=52 * mm):
        super().__init__()
        self.texto = texto
        self.fondo = fondo
        self.frente = frente
        self.width = ancho
        self.height = 8 * mm

    def draw(self):
        self.canv.setFillColor(self.fondo)
        self.canv.roundRect(0, 0, self.width, self.height, 4 * mm, fill=1, stroke=0)
        self.canv.setFillColor(self.frente)
        self.canv.setFont("SegoeBold", 7.5)
        self.canv.drawCentredString(self.width / 2, 2.7 * mm, self.texto)


class Rule(Flowable):
    def __init__(self, color=LINE, width=1):
        super().__init__()
        self.height = 4 * mm
        self.color = color
        self.rule_width = width

    def draw(self):
        self.canv.setStrokeColor(self.color)
        self.canv.setLineWidth(self.rule_width)
        self.canv.line(0, 2 * mm, self._availWidth, 2 * mm)

    def wrap(self, availWidth, availHeight):
        self._availWidth = availWidth
        return availWidth, self.height


def estilos():
    base = getSampleStyleSheet()
    return {
        "hero": ParagraphStyle("hero", parent=base["Title"], fontName="SegoeBold", fontSize=25, leading=28, textColor=colors.white, spaceAfter=6 * mm),
        "lead": ParagraphStyle("lead", parent=base["BodyText"], fontName="Segoe", fontSize=10, leading=15, textColor=colors.HexColor("#E7F1FA")),
        "h1": ParagraphStyle("h1", parent=base["Heading1"], fontName="SegoeBold", fontSize=18, leading=22, textColor=NAVY, spaceBefore=2 * mm, spaceAfter=5 * mm),
        "h2": ParagraphStyle("h2", parent=base["Heading2"], fontName="SegoeBold", fontSize=12, leading=15, textColor=NAVY, spaceBefore=2 * mm, spaceAfter=2 * mm),
        "body": ParagraphStyle("body", parent=base["BodyText"], fontName="Segoe", fontSize=9, leading=13, textColor=INK, spaceAfter=2 * mm),
        "small": ParagraphStyle("small", parent=base["BodyText"], fontName="Segoe", fontSize=7.6, leading=10.5, textColor=MUTED),
        "eyebrow": ParagraphStyle("eyebrow", parent=base["BodyText"], fontName="SegoeBold", fontSize=7, leading=9, textColor=TEAL, tracking=1.2, spaceAfter=1.5 * mm),
        "white_small": ParagraphStyle("white_small", parent=base["BodyText"], fontName="SegoeBold", fontSize=7.5, leading=10, textColor=colors.white),
        "question": ParagraphStyle("question", parent=base["BodyText"], fontName="SegoeBold", fontSize=10, leading=14, textColor=INK, spaceAfter=2 * mm),
        "answer": ParagraphStyle("answer", parent=base["BodyText"], fontName="Segoe", fontSize=7.7, leading=10.2, textColor=INK),
        "answer_note": ParagraphStyle("answer_note", parent=base["BodyText"], fontName="Segoe", fontSize=6.9, leading=8.8, textColor=MUTED),
        "center": ParagraphStyle("center", parent=base["BodyText"], fontName="Segoe", fontSize=8, leading=11, textColor=MUTED, alignment=TA_CENTER),
    }


def caja(contenido, fondo=PAPER, borde=LINE, padding=10, widths=None):
    tabla = Table([contenido], colWidths=widths)
    tabla.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), fondo),
        ("BOX", (0, 0), (-1, -1), 0.7, borde),
        ("LEFTPADDING", (0, 0), (-1, -1), padding),
        ("RIGHTPADDING", (0, 0), (-1, -1), padding),
        ("TOPPADDING", (0, 0), (-1, -1), padding),
        ("BOTTOMPADDING", (0, 0), (-1, -1), padding),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    return tabla


def solucion(p: dict) -> str:
    tipo = p["tipo"]
    if tipo == "seleccion":
        return p["opciones"][p["correcta"]]
    if tipo == "seleccion_multiple":
        return "; ".join(p["opciones"][i] for i in p["correctas"])
    if tipo == "ordenar":
        textos = {x["id"]: x["texto"] for x in p["elementos"]}
        return " → ".join(textos[x] for x in p["ordenCorrecto"])
    if tipo == "relacionar":
        izq = {x["id"]: x["texto"] for x in p["izquierda"]}
        der = {x["id"]: x["texto"] for x in p["derecha"]}
        return "; ".join(f"{izq[k]} → {der[v]}" for k, v in p["pares"].items())
    return "; ".join(f"{h['etiqueta']}: {h['respuestas'][0]}" for h in p["huecos"])


def tipo_etiqueta(tipo: str) -> str:
    return {
        "seleccion": "DECISIÓN ÚNICA",
        "seleccion_multiple": "INTEGRACIÓN MÚLTIPLE",
        "ordenar": "SECUENCIA CLÍNICA",
        "relacionar": "MAPA DE RELACIONES",
        "completar": "RECUPERACIÓN ACTIVA",
    }[tipo]


def encabezado_pie(canvas, doc, clase_n: int):
    canvas.saveState()
    ancho, alto = A4
    canvas.setFillColor(NAVY)
    canvas.rect(0, alto - 15 * mm, ancho, 15 * mm, fill=1, stroke=0)
    if LOGO_OSCURO.exists():
        canvas.drawImage(str(LOGO_OSCURO), 18 * mm, alto - 11.2 * mm, width=43 * mm, height=8.1 * mm, preserveAspectRatio=True, mask="auto")
    canvas.setFillColor(colors.HexColor("#CDEFE9"))
    canvas.setFont("SegoeBold", 7)
    canvas.drawRightString(ancho - 18 * mm, alto - 8.7 * mm, f"FICHA CLÍNICA · CLASE {clase_n} DE 5")
    canvas.setStrokeColor(LINE)
    canvas.line(18 * mm, 13 * mm, ancho - 18 * mm, 13 * mm)
    canvas.setFillColor(MUTED)
    canvas.setFont("Segoe", 6.8)
    canvas.drawString(18 * mm, 8.2 * mm, "Material educativo derivado de la clase · No sustituye valoración clínica")
    canvas.drawRightString(ancho - 18 * mm, 8.2 * mm, f"Borrador 0.9 · página {doc.page}")
    canvas.restoreState()


def historia_clase(clase: dict, curso: dict, st: dict):
    n = clase["n"]
    contenido = []
    hero = Table([
        [
            [
                Paragraph("ODONTECK · RUTA DE DOMINIO", st["white_small"]),
                Spacer(1, 5 * mm),
                Paragraph(esc(clase["titulo"]), st["hero"]),
                Paragraph(esc(clase["resumen"]), st["lead"]),
                Spacer(1, 6 * mm),
                Pill(f"CLASE {n} DE 5 · ORTODONCIA", GOLD, NAVY, 59 * mm),
            ]
        ]
    ], colWidths=[174 * mm])
    hero.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), NAVY),
        ("LEFTPADDING", (0, 0), (-1, -1), 13 * mm),
        ("RIGHTPADDING", (0, 0), (-1, -1), 13 * mm),
        ("TOPPADDING", (0, 0), (-1, -1), 13 * mm),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 13 * mm),
    ]))
    contenido.extend([Spacer(1, 5 * mm), hero, Spacer(1, 7 * mm)])

    contenido.append(Paragraph("CÓMO USAR ESTA FICHA", st["eyebrow"]))
    contenido.append(Paragraph("Mira · recupera · verifica", st["h1"]))
    pasos = [
        [Paragraph("01", st["h2"]), Paragraph("Mira la clase y detente en las marcas de la ruta clínica.", st["body"])],
        [Paragraph("02", st["h2"]), Paragraph("Explícate cada concepto sin leer; vuelve al video si falta precisión.", st["body"])],
        [Paragraph("03", st["h2"]), Paragraph("Resuelve el laboratorio y compara tu razonamiento con la evidencia.", st["body"])],
    ]
    t = Table(pasos, colWidths=[16 * mm, 150 * mm], rowHeights=[17 * mm] * 3)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), MINT),
        ("BOX", (0, 0), (-1, -1), 0.7, LINE),
        ("INNERGRID", (0, 0), (-1, -1), 0.4, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    contenido.append(t)
    contenido.extend([Spacer(1, 6 * mm), caja([Paragraph("CONTROL EDITORIAL", st["eyebrow"]), Paragraph("Borrador para revisión clínica. Los conceptos y las referencias fueron trazados a la transcripción automática del video; un odontólogo debe validar terminología, soluciones y explicaciones antes de publicación.", st["body"])], WARN, GOLD)])
    contenido.append(PageBreak())

    contenido.extend([Paragraph("RUTA CLÍNICA", st["eyebrow"]), Paragraph("Seis momentos para volver a la evidencia", st["h1"])])
    filas = []
    for i, concepto in enumerate(clase["conceptos"], 1):
        filas.append([
            Paragraph(f"{i:02d}", st["h2"]),
            Paragraph(f"<b>{esc(concepto['t'])}</b>", st["body"]),
            Paragraph(esc(concepto["texto"]), st["body"]),
        ])
    ruta = Table(filas, colWidths=[13 * mm, 21 * mm, 132 * mm])
    ruta.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), NAVY),
        ("TEXTCOLOR", (0, 0), (0, -1), colors.white),
        ("BACKGROUND", (1, 0), (1, -1), MINT),
        ("BOX", (0, 0), (-1, -1), 0.7, LINE),
        ("INNERGRID", (0, 0), (-1, -1), 0.4, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    contenido.append(ruta)
    contenido.extend([Spacer(1, 6 * mm), Paragraph("MINUTO DE RECUPERACIÓN", st["eyebrow"]), Paragraph("Cierra esta ficha y explica, en voz alta, cómo los seis momentos cambian una decisión de primera consulta. Después vuelve a las marcas donde tu explicación fue imprecisa.", st["body"])])
    contenido.append(PageBreak())

    contenido.extend([Paragraph("LABORATORIO DE DECISIÓN", st["eyebrow"]), Paragraph("Cinco maneras de demostrar comprensión", st["h1"]), Paragraph("Responde primero sin mirar la solución. Registra qué dato inclinó tu decisión y qué tan segura fue tu respuesta.", st["body"]), Spacer(1, 2 * mm)])
    for i, pregunta in enumerate(clase["preguntas"], 1):
        bloque = [
            Paragraph(f"{i:02d} · {tipo_etiqueta(pregunta['tipo'])} · VIDEO {esc(pregunta['referenciaVideo'])}", st["eyebrow"]),
            Paragraph(esc(pregunta["casoClinico"]), st["body"]),
            Paragraph(esc(pregunta["q"]), st["question"]),
            Paragraph(f"<i>{esc(pregunta['instruccion'])}</i>", st["small"]),
            Spacer(1, 5 * mm),
            Rule(colors.HexColor("#AAB6C5"), 0.6),
        ]
        if i == 4:
            contenido.append(PageBreak())
            contenido.extend([Paragraph("LABORATORIO DE DECISIÓN", st["eyebrow"]), Paragraph("Continúa y calibra tu criterio", st["h1"])])
        contenido.append(KeepTogether([caja(bloque), Spacer(1, 4 * mm)]))

    contenido.append(PageBreak())
    contenido.extend([Paragraph("CLAVE RAZONADA", st["eyebrow"]), Paragraph("Comprueba la solución, no memorices la letra", st["h1"])])
    for i, pregunta in enumerate(clase["preguntas"], 1):
        contenido.append(KeepTogether([
            caja([
                Paragraph(f"{i:02d} · {esc(pregunta['competencia'])} · {esc(pregunta['nivelCognitivo'])}", st["eyebrow"]),
                Paragraph(f"<b>Solución:</b> {esc(solucion(pregunta))}", st["answer"]),
                Spacer(1, 0.8 * mm),
                Paragraph(esc(pregunta["explicacion"]), st["answer_note"]),
            ], colors.white, LINE, padding=7),
            Spacer(1, 1.5 * mm),
        ]))
    contenido.extend([Spacer(1, 1.5 * mm), caja([Paragraph("PRÓXIMO PASO", st["eyebrow"]), Paragraph("Vuelve a la clase y confirma las respuestas en las marcas indicadas. Si un término, una medida o una indicación no coincide con el video, repórtalo antes de aprobar esta ficha.", st["answer_note"])], MINT, TEAL, padding=7)])
    return contenido


def generar_pdf(clase: dict, curso: dict, st: dict) -> Path:
    SALIDA.mkdir(parents=True, exist_ok=True)
    nombre = f"ortodoncia-clase-{clase['n']}-ficha-estudio.pdf"
    destino = SALIDA / nombre
    doc = BaseDocTemplate(
        str(destino),
        pagesize=A4,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        topMargin=21 * mm,
        bottomMargin=18 * mm,
        title=f"OdonTeck · {clase['titulo']}",
        author="OdonTeck Consulting Group",
        subject="Ficha de estudio en revisión clínica",
    )
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="contenido")
    doc.addPageTemplates([PageTemplate(id="ficha", frames=[frame], onPage=lambda c, d: encabezado_pie(c, d, clase["n"]))])
    doc.build(historia_clase(clase, curso, st))
    return destino


def main() -> None:
    registrar_fuentes()
    st = estilos()
    paquete = json.loads(CONTENIDO.read_text(encoding="utf-8"))
    for clase in paquete["clases"]:
        destino = generar_pdf(clase, paquete["curso"], st)
        print(destino)


if __name__ == "__main__":
    main()
