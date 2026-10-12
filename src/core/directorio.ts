import { api } from './auth';
import { Datos } from './datos';

export interface PerfilDirectorio {
  uid: string; nombre: string; titular: string; etapa: string; especialidades: string[];
  ciudad: string; estado: string; modalidades: string[]; disponibilidad: string[];
  habilidades: string[]; bio: string; foto?: string | null; contacto?: { canal: string; valor: string } | null; actualizado: string; esMio?: boolean; visible?: boolean;
}
export interface OportunidadDirectorio {
  id: string; autorUid: string; autor: string; titulo: string; tipo: string; organizacion: string;
  modalidad: string; ciudad: string; entidad: string; especialidades: string[]; resumen: string;
  requisitos: string; compensacion: string; estado: string; fecha: string; expira: string; esMia?: boolean;
}
export interface ConexionDirectorio {
  id: string; deUid: string; paraUid: string; oportunidadId: string | null; mensaje: string;
  estado: string; creado: string; actualizado: string; esEntrante: boolean; otraPersona: string;
  contacto: { canal: string; valor: string } | null;
}
export interface EstadoDirectorio { perfiles: PerfilDirectorio[]; oportunidades: OportunidadDirectorio[]; conexiones: ConexionDirectorio[]; miPerfil: PerfilDirectorio | null }
export interface FotoPreparada { blob: Blob; preview: string }

const KEY = 'odonteck-club:directorio:v1';
const DEMO: EstadoDirectorio = {
  perfiles: [
    { uid: 'demo-ana', nombre: 'Dra. Ana Torres', titular: 'Endodoncista · atención microscópica', etapa: 'especialista', especialidades: ['Endodoncia'], ciudad: 'Puebla', estado: 'Puebla', modalidades: ['presencial'], disponibilidad: ['colaboraciones', 'mentoria'], habilidades: ['Microscopía', 'Trauma dental'], bio: 'Endodoncista enfocada en resolución de casos complejos y colaboración interdisciplinaria.', actualizado: '2026-10-09T12:00:00Z' },
    { uid: 'demo-luis', nombre: 'Dr. Luis Herrera', titular: 'Cirujano dentista · rehabilitación oral', etapa: 'general', especialidades: ['Rehabilitación', 'Cirugía'], ciudad: 'Querétaro', estado: 'Querétaro', modalidades: ['presencial', 'remoto'], disponibilidad: ['empleo', 'suplencias'], habilidades: ['Flujo digital', 'Prótesis fija'], bio: 'Odontólogo general con práctica restauradora y experiencia en flujos digitales para consulta privada.', actualizado: '2026-10-08T12:00:00Z' },
    { uid: 'demo-sofia', nombre: 'Dra. Sofía Reyes', titular: 'Odontopediatra y docente clínica', etapa: 'docente', especialidades: ['Odontopediatría'], ciudad: 'CDMX', estado: 'Ciudad de México', modalidades: ['hibrido'], disponibilidad: ['mentoria', 'colaboraciones'], habilidades: ['Manejo de conducta', 'Docencia'], bio: 'Docente clínica interesada en mentoría, educación para pacientes y proyectos de prevención infantil.', actualizado: '2026-10-07T12:00:00Z' },
  ],
  oportunidades: [
    { id: 'demo-op-1', autorUid: 'demo-ana', autor: 'Dra. Ana Torres', titulo: 'Odontólogo general para clínica multidisciplinaria', tipo: 'empleo', organizacion: 'Clínica Horizonte', modalidad: 'presencial', ciudad: 'Puebla', entidad: 'Puebla', especialidades: ['Odontología general'], resumen: 'Buscamos colega para integrarse tres tardes por semana, con acompañamiento clínico y posibilidad de crecimiento.', requisitos: 'Título y cédula; trato humano y documentación clínica ordenada.', compensacion: 'Honorarios por definir en entrevista', estado: 'publicada', fecha: '2026-10-09T12:00:00Z', expira: '2026-11-23T12:00:00Z' },
    { id: 'demo-op-2', autorUid: 'demo-sofia', autor: 'Dra. Sofía Reyes', titulo: 'Colaboración para taller de prevención infantil', tipo: 'colaboracion', organizacion: 'Proyecto Sonrisas', modalidad: 'hibrido', ciudad: 'CDMX', entidad: 'Ciudad de México', especialidades: ['Odontopediatría', 'Salud pública'], resumen: 'Diseño conjunto de un taller breve para escuelas, con materiales claros y evaluación de aprendizaje.', requisitos: 'Interés en educación y disponibilidad para dos sesiones de planeación.', compensacion: 'Colaboración académica con constancia', estado: 'publicada', fecha: '2026-10-08T12:00:00Z', expira: '2026-11-22T12:00:00Z' },
  ],
  conexiones: [], miPerfil: null,
};

let estado: EstadoDirectorio = structuredClone(DEMO);
function guardar() { if (Datos.modo === 'demo') localStorage.setItem(KEY, JSON.stringify(estado)); }
function cargarDemo() { try { const v = JSON.parse(localStorage.getItem(KEY) || 'null'); if (v?.perfiles) estado = v; } catch {} }
cargarDemo();

const blobADataUrl = (blob: Blob) => new Promise<string>((ok, err) => { const r = new FileReader(); r.onload = () => ok(String(r.result)); r.onerror = () => err(r.error); r.readAsDataURL(blob); });

export async function prepararFotoDirectorio(file: File): Promise<FotoPreparada> {
  if (!file.type.startsWith('image/')) throw new Error('Selecciona una imagen JPG, PNG o WebP.');
  if (file.size > 8_000_000) throw new Error('La imagen original debe pesar menos de 8 MB.');
  const source = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((ok, err) => { const el = new Image(); el.onload = () => ok(el); el.onerror = () => err(new Error('No pudimos leer la imagen.')); el.src = source; });
    const lado = Math.min(img.naturalWidth, img.naturalHeight);
    const canvas = document.createElement('canvas'); canvas.width = 720; canvas.height = 720;
    canvas.getContext('2d')!.drawImage(img, (img.naturalWidth - lado) / 2, (img.naturalHeight - lado) / 2, lado, lado, 0, 0, 720, 720);
    const blob = await new Promise<Blob>((ok, err) => canvas.toBlob((v) => v ? ok(v) : err(new Error('No pudimos optimizar la imagen.')), 'image/webp', .86));
    if (blob.size > 2_000_000) throw new Error('La foto optimizada todavía supera 2 MB. Prueba otra imagen.');
    return { blob, preview: URL.createObjectURL(blob) };
  } finally { URL.revokeObjectURL(source); }
}

export const Directorio = {
  get: () => estado,
  hidratar(v: EstadoDirectorio) { estado = v; },
  async cargar() { if (Datos.modo === 'api') estado = await api<EstadoDirectorio>('/directorio'); return estado; },
  async guardarPerfil(v: Omit<PerfilDirectorio, 'uid' | 'nombre' | 'actualizado' | 'esMio' | 'foto'> & { contacto: { canal: string; valor?: string } }, foto?: FotoPreparada | null, quitarFoto = false) {
    if (Datos.modo === 'api') {
      if (quitarFoto) await api('/directorio/perfil/foto', { method: 'DELETE' });
      let fotoPropia = false;
      if (foto) {
        const firma = await api<{ uploadUrl: string; publicUrl: string; contentType: string }>('/directorio/perfil/foto/subida', { method: 'POST', json: { contentType: 'image/webp', bytes: foto.blob.size } });
        const subida = await fetch(firma.uploadUrl, { method: 'PUT', headers: { 'Content-Type': firma.contentType }, body: foto.blob });
        if (!subida.ok) throw new Error(`No pudimos subir la foto (${subida.status}).`);
        fotoPropia = true;
      }
      await api('/directorio/perfil', { method: 'PUT', json: { ...v, ...(fotoPropia ? { foto: 'propia' } : quitarFoto ? { foto: null } : {}) } }); return this.cargar();
    }
    const fotoFinal = quitarFoto ? null : foto ? await blobADataUrl(foto.blob) : estado.miPerfil?.foto ?? null;
    const { contacto: _contacto, ...publico } = v;
    const perfil: PerfilDirectorio = { ...publico, foto: fotoFinal, uid: 'demo', nombre: 'Modo demo', actualizado: new Date().toISOString(), esMio: true };
    estado.perfiles = [...estado.perfiles.filter((p) => p.uid !== 'demo'), perfil]; estado.miPerfil = { ...perfil, contacto: { canal: v.contacto.canal, valor: v.contacto.valor || '' } }; guardar(); return estado;
  },
  async publicar(v: Record<string, unknown>) {
    if (Datos.modo === 'api') { await api('/directorio/oportunidades', { method: 'POST', json: v }); return this.cargar(); }
    const op = { ...v, id: `demo-op-${Date.now()}`, autorUid: 'demo', autor: 'Modo demo', estado: 'publicada', fecha: new Date().toISOString(), expira: new Date(Date.now() + 45 * 86400000).toISOString(), esMia: true } as OportunidadDirectorio;
    estado.oportunidades.unshift(op); guardar(); return estado;
  },
  async conectar(paraUid: string, oportunidadId: string | null, mensaje: string) {
    if (Datos.modo === 'api') { await api('/directorio/conexiones', { method: 'POST', json: { paraUid, oportunidadId, mensaje } }); return this.cargar(); }
    const persona = estado.perfiles.find((p) => p.uid === paraUid)?.nombre || estado.oportunidades.find((o) => o.id === oportunidadId)?.autor || 'Colega';
    estado.conexiones.unshift({ id: `demo-cn-${Date.now()}`, deUid: 'demo', paraUid, oportunidadId, mensaje, estado: 'pendiente', creado: new Date().toISOString(), actualizado: new Date().toISOString(), esEntrante: false, otraPersona: persona, contacto: null }); guardar(); return estado;
  },
  async responder(id: string, respuesta: 'aceptada' | 'rechazada') {
    if (Datos.modo === 'api') { await api(`/directorio/conexiones/${encodeURIComponent(id)}`, { method: 'PATCH', json: { estado: respuesta } }); return this.cargar(); }
    const c = estado.conexiones.find((x) => x.id === id); if (c) c.estado = respuesta; guardar(); return estado;
  },
};
