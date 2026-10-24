// Reporte PDF de retención (miembros en riesgo) con identidad de marca OdonTeck.
// Reutiliza el jsPDF ya vendorizado (carga perezosa) del módulo de repaso.
import { cargarJsPdf } from './repaso-pdf';

type Pdf = {
  setFont: (f: string, s?: string) => void;
  setFontSize: (n: number) => void;
  setTextColor: (r: number, g: number, b: number) => void;
  setFillColor: (r: number, g: number, b: number) => void;
  setDrawColor: (r: number, g: number, b: number) => void;
  setLineWidth: (n: number) => void;
  rect: (x: number, y: number, w: number, h: number, style?: string) => void;
  roundedRect: (x: number, y: number, w: number, h: number, rx: number, ry: number, style: string) => void;
  line: (x1: number, y1: number, x2: number, y2: number) => void;
  text: (t: string | string[], x: number, y: number, o?: Record<string, unknown>) => void;
  getTextWidth: (t: string) => number;
  addPage: () => void;
  getNumberOfPages: () => number;
  setPage: (n: number) => void;
  save: (f: string) => void;
  internal: { pageSize: { getWidth: () => number; getHeight: () => number } };
};

export interface FilaRiesgoPDF { nombre: string; plan: string; detalle: string; whatsapp?: string; email?: string }
export interface SeccionRiesgoPDF { titulo: string; etiquetaDetalle: string; filas: FilaRiesgoPDF[] }

const NAVY: [number, number, number] = [24, 49, 91];
const TEAL: [number, number, number] = [142, 224, 216];
const TINTA: [number, number, number] = [40, 48, 66];
const GRIS: [number, number, number] = [96, 108, 126];
const CEBRA: [number, number, number] = [245, 247, 249];
const LINEA: [number, number, number] = [228, 232, 238];
const PLANES: Record<string, string> = { mensual: 'Mensual', anual: 'Anual', cortesia: 'Cortesía', regalo: 'Regalo', admin: 'Admin' };

const recortar = (pdf: Pdf, texto: string, maxW: number) => {
  let t = String(texto ?? '');
  if (pdf.getTextWidth(t) <= maxW) return t;
  while (t.length > 1 && pdf.getTextWidth(t + '…') > maxW) t = t.slice(0, -1);
  return t + '…';
};

export async function descargarRiesgoPDF(opc: { subtitulo: string; archivo: string; secciones: SeccionRiesgoPDF[] }): Promise<void> {
  const JsPDF = await cargarJsPdf();
  const pdf = new JsPDF({ unit: 'mm', format: 'a4' }) as unknown as Pdf;
  const ancho = pdf.internal.pageSize.getWidth();
  const alto = pdf.internal.pageSize.getHeight();
  const margen = 16;
  const util = ancho - margen * 2;
  const generado = new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
  const total = opc.secciones.reduce((a, s) => a + s.filas.length, 0);

  // Columnas de la tabla (suman el ancho útil).
  const cols = [
    { label: '#', w: 9 },
    { label: 'Miembro', w: 48 },
    { label: 'Plan', w: 20 },
    { label: 'Estado', w: 39 },
    { label: 'WhatsApp', w: 32 },
    { label: 'Correo', w: util - 9 - 48 - 20 - 39 - 32 },
  ];
  const xcol: number[] = [];
  cols.reduce((x, c, i) => { xcol[i] = x; return x + c.w; }, margen);
  const PAD = 2.5;
  const ROW = 8.5;

  const encabezadoMarca = () => {
    pdf.setFillColor(...NAVY);
    pdf.roundedRect(margen, 14, util, 26, 3.5, 3.5, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(...TEAL);
    pdf.text('ODONTECK CLUB  ·  REPORTE DE RETENCIÓN', margen + 7, 23);
    pdf.setFontSize(17);
    pdf.setTextColor(255, 255, 255);
    pdf.text(opc.subtitulo, margen + 7, 33);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(...TEAL);
    pdf.text(`Generado ${generado}`, ancho - margen - 7, 23, { align: 'right' });
    pdf.setTextColor(255, 255, 255);
    pdf.text(`${total} ${total === 1 ? 'miembro' : 'miembros'} en riesgo`, ancho - margen - 7, 33, { align: 'right' });
  };

  const encabezadoTabla = (y: number) => {
    pdf.setFillColor(...NAVY);
    pdf.rect(margen, y, util, ROW, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(255, 255, 255);
    cols.forEach((c, i) => pdf.text(c.label, xcol[i] + PAD, y + 5.6));
    return y + ROW;
  };

  encabezadoMarca();
  let y = 48;

  for (const sec of opc.secciones) {
    // Título de sección
    if (y > alto - 40) { pdf.addPage(); y = 20; }
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.setTextColor(...NAVY);
    pdf.text(sec.titulo, margen, y);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(...GRIS);
    pdf.text(`${sec.filas.length}`, margen + pdf.getTextWidth(sec.titulo) + 3, y);
    y += 4;

    if (!sec.filas.length) {
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(9.5);
      pdf.setTextColor(...GRIS);
      pdf.text('Sin miembros en esta lista.', margen, y + 6);
      y += 16;
      continue;
    }

    cols[3].label = sec.etiquetaDetalle;
    y = encabezadoTabla(y);

    sec.filas.forEach((f, i) => {
      if (y + ROW > alto - 16) { pdf.addPage(); y = 20; y = encabezadoTabla(y); }
      if (i % 2 === 1) { pdf.setFillColor(...CEBRA); pdf.rect(margen, y, util, ROW, 'F'); }
      pdf.setDrawColor(...LINEA);
      pdf.setLineWidth(0.1);
      pdf.line(margen, y + ROW, margen + util, y + ROW);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      const celdas = [
        String(i + 1),
        f.nombre || 'Miembro',
        PLANES[f.plan] ?? f.plan ?? '—',
        f.detalle || '—',
        f.whatsapp || '—',
        f.email || '—',
      ];
      celdas.forEach((txt, c) => {
        pdf.setTextColor(...(c === 1 ? TINTA : GRIS));
        if (c === 1) pdf.setFont('helvetica', 'bold');
        else pdf.setFont('helvetica', 'normal');
        pdf.text(recortar(pdf, txt, cols[c].w - PAD * 2), xcol[c] + PAD, y + 5.6);
      });
      y += ROW;
    });
    y += 12;
  }

  // Pie de página con numeración en todas las hojas.
  const paginas = pdf.getNumberOfPages();
  for (let p = 1; p <= paginas; p++) {
    pdf.setPage(p);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(...GRIS);
    pdf.text('OdonTeck Club · Documento interno — no compartir fuera del equipo', margen, alto - 9);
    pdf.text(`Página ${p} de ${paginas}`, ancho - margen, alto - 9, { align: 'right' });
  }

  pdf.save(opc.archivo.replace(/[^a-zA-Z0-9._-]/g, '-'));
}
