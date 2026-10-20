import type { Clase, Curso } from './datos';

type JsPdfInstance = {
  setFont: (family: string, style?: string) => void;
  setFontSize: (size: number) => void;
  setTextColor: (r: number, g: number, b: number) => void;
  setFillColor: (r: number, g: number, b: number) => void;
  roundedRect: (x: number, y: number, w: number, h: number, rx: number, ry: number, style: string) => void;
  text: (text: string | string[], x: number, y: number, options?: Record<string, unknown>) => void;
  splitTextToSize: (text: string, width: number) => string[];
  addPage: () => void;
  save: (filename: string) => void;
  internal: { pageSize: { getWidth: () => number; getHeight: () => number } };
};

type JsPdfConstructor = new (options: { unit: string; format: string }) => JsPdfInstance;
type JsPdfWindow = Window & { jspdf?: { jsPDF?: JsPdfConstructor } };

let cargarLibreria: Promise<JsPdfConstructor> | undefined;

function cargarJsPdf(): Promise<JsPdfConstructor> {
  const actual = (window as JsPdfWindow).jspdf?.jsPDF;
  if (actual) return Promise.resolve(actual);
  if (!cargarLibreria) {
    cargarLibreria = new Promise<JsPdfConstructor>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `${import.meta.env.BASE_URL}herramientas/jspdf.umd.min.js`;
      script.async = true;
      script.onload = () => {
        const jsPDF = (window as JsPdfWindow).jspdf?.jsPDF;
        if (jsPDF) resolve(jsPDF);
        else reject(new Error('No se pudo cargar el generador del documento.'));
      };
      script.onerror = () => reject(new Error('No se pudo cargar el generador del documento.'));
      document.head.append(script);
    }).catch((error: unknown) => {
      cargarLibreria = undefined;
      throw error;
    });
  }
  return cargarLibreria!;
}

export async function descargarRepasoPDF(curso: Curso, clase: Clase): Promise<void> {
  if (!clase.notas) throw new Error('Esta clase todavía no tiene notas de repaso disponibles.');
  const JsPDF = await cargarJsPdf();
  const pdf = new JsPDF({ unit: 'mm', format: 'a4' });
  const ancho = pdf.internal.pageSize.getWidth();
  const alto = pdf.internal.pageSize.getHeight();
  const margen = 18;
  const anchoTexto = ancho - margen * 2;
  let y = 20;

  const asegurarEspacio = (altoNecesario: number) => {
    if (y + altoNecesario > alto - 18) { pdf.addPage(); y = 20; }
  };
  const parrafo = (texto: string, tamano: number, color: [number, number, number], espacio = 5) => {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(tamano);
    pdf.setTextColor(...color);
    const lineas = pdf.splitTextToSize(texto, anchoTexto);
    const altoBloque = lineas.length * tamano * 0.48;
    asegurarEspacio(altoBloque + espacio);
    pdf.text(lineas, margen, y);
    y += altoBloque + espacio;
  };

  pdf.setFillColor(24, 49, 91);
  pdf.roundedRect(margen, y, anchoTexto, 31, 4, 4, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(142, 224, 216);
  pdf.text('ODONTECK CLUB  ·  REPASO DE CLASE', margen + 7, y + 8);
  pdf.setFontSize(16);
  pdf.setTextColor(255, 255, 255);
  const titulo = pdf.splitTextToSize(clase.titulo, anchoTexto - 14).slice(0, 2);
  pdf.text(titulo, margen + 7, y + 17);
  y += 39;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(90, 102, 120);
  pdf.text(pdf.splitTextToSize(curso.titulo, anchoTexto), margen, y);
  y += 9;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(24, 49, 91);
  pdf.text('Resumen', margen, y);
  y += 6;
  parrafo(clase.notas.resumen, 10, [56, 67, 82], 8);

  if (clase.notas.conceptos.length) {
    asegurarEspacio(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(24, 49, 91);
    pdf.text('Conceptos clave', margen, y);
    y += 8;
    for (const [indice, concepto] of clase.notas.conceptos.entries()) {
      const etiqueta = `[${concepto.t}]  ${String(indice + 1).padStart(2, '0')}  `;
      const lineas = pdf.splitTextToSize(`${etiqueta}${concepto.texto}`, anchoTexto - 4);
      const altoBloque = lineas.length * 5.2 + 5;
      asegurarEspacio(altoBloque);
      pdf.setFillColor(227, 244, 241);
      pdf.roundedRect(margen, y - 4, 2, altoBloque - 2, 1, 1, 'F');
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(56, 67, 82);
      pdf.text(lineas, margen + 5, y);
      y += altoBloque;
    }
  }

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(125, 135, 148);
  pdf.text('Material de repaso elaborado con las notas disponibles en esta clase.', margen, alto - 10);
  const nombre = `odonteck-repaso-${curso.id}-clase-${clase.n}.pdf`;
  pdf.save(nombre.replace(/[^a-zA-Z0-9._-]/g, '-'));
}
