# Genera los 10 materiales PDF, sus portadas y actualiza src/data/materiales.json.
# Uso (desde la raíz del repo): python scripts/materiales/generar.py
import json, os, sys, shutil
sys.path.insert(0, os.path.dirname(__file__))
import pypdfium2 as pdfium
from pypdf import PdfReader
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas as pdfcanvas
from PIL import Image
from kit import build, draw_cover
import docs_a, docs_b

OUT = 'public/materiales'; COV = f'{OUT}/portadas'
os.makedirs(COV, exist_ok=True)

DOCS = {
    'guia-diagnostico-ortodoncico': docs_a.guia_ortodoncia,
    'atlas-caries-icdas': docs_a.atlas_icdas,
    'consentimiento-informado': docs_a.consentimiento,
    'tabla-dosis-anestesicas': docs_a.dosis_anestesicas,
    'protocolo-abscesos': docs_a.protocolo_abscesos,
    'guia-materiales-restauradores': docs_b.guia_materiales,
    'checklist-urgencias-pediatricas': docs_b.urgencias_pediatricas,
    'guia-instrumentacion-endodontica': docs_b.instrumentacion_endo,
    'plantilla-nota-clinica-receta': docs_b.nota_receta,
}

def portada_desde(pdf_path, out_path):
    doc = pdfium.PdfDocument(pdf_path)
    page = doc[0]
    img = page.render(scale=1200 / page.get_width()).to_pil().convert('RGB')
    page.close(); doc.close()
    img.save(out_path, 'WEBP', quality=84)

paginas = {}
for mid, fn in DOCS.items():
    pdf = f'{OUT}/{mid}.pdf'
    meta, story = fn()
    flow = f'scripts/materiales/portadas-flow/{mid}.jpg'
    if os.path.exists(flow): meta['cover_image'] = flow
    build(pdf, meta, story)
    paginas[mid] = len(PdfReader(pdf).pages)
    if os.path.exists(flow): Image.open(flow).convert('RGB').resize((720, 964), Image.LANCZOS).save(f'{COV}/{mid}.webp', quality=84)
    else: portada_desde(pdf, f'{COV}/{mid}.webp')
    print(f'{mid}: {paginas[mid]} págs')

# Presentación 16:9 + portada vertical aparte (la biblioteca muestra portadas 3:4)
mid = 'manual-estratificacion-resinas'
meta, n = docs_b.presentacion_resinas(f'{OUT}/{mid}.pdf')
paginas[mid] = n
tmp = f'{COV}/_tmp_cover.pdf'
flow = f'scripts/materiales/portadas-flow/{mid}.jpg'
if os.path.exists(flow):
    Image.open(flow).convert('RGB').resize((720, 964), Image.LANCZOS).save(f'{COV}/{mid}.webp', quality=84)
else:
    c = pdfcanvas.Canvas(tmp, pagesize=letter); draw_cover(c, *letter, meta); c.showPage(); c.save()
    portada_desde(tmp, f'{COV}/{mid}.webp'); os.remove(tmp)
print(f'{mid}: {n} láminas')

# Actualizar catálogo de materiales
path = 'src/data/materiales.json'
data = json.load(open(path, encoding='utf-8'))
for m in data:
    if m['id'] in paginas:
        m.update(paginas=paginas[m['id']], estado='disponible', url=f'/materiales/{m["id"]}.pdf',
                 portada=f'/materiales/portadas/{m["id"]}.webp', autor='Equipo académico OdonTeck')
        if m['id'] == 'atlas-caries-icdas': m['tipo'] = 'Libro'
json.dump(data, open(path, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print('materiales.json actualizado')
