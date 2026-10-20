import { api } from './auth';
import { Datos } from './datos';

export interface PerfilDirectorio {
  uid: string; nombre: string; titular: string; etapa: string; especialidades: string[];
  ciudad: string; estado: string; modalidades: string[]; disponibilidad: string[];
  habilidades: string[]; bio: string; foto?: string | null; banner?: string | null;
  anosExperiencia?: number | null; idiomas?: string[]; experiencia?: ExperienciaDirectorio[];
  formacion?: FormacionDirectorio[]; credenciales?: CredencialDirectorio[];
  contacto?: { canal: string; valor: string } | null; actualizado: string; esMio?: boolean; visible?: boolean;
}
export interface ExperienciaDirectorio { puesto: string; organizacion: string; periodo: string; descripcion: string }
export interface FormacionDirectorio { programa: string; institucion: string; periodo: string }
export interface CredencialDirectorio { nombre: string; emisor: string; anio: string }
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
export interface PaginacionDirectorio {
  perfiles: { hayMas: boolean; siguiente: string | null };
  oportunidades: { hayMas: boolean; siguiente: string | null };
  conexiones: { truncadas: boolean };
}
export interface EstadoDirectorio { perfiles: PerfilDirectorio[]; oportunidades: OportunidadDirectorio[]; conexiones: ConexionDirectorio[]; miPerfil: PerfilDirectorio | null; paginacion?: PaginacionDirectorio }
export interface ImagenDirectorioPreparada { blob: Blob; preview: string }
export type FotoPreparada = ImagenDirectorioPreparada;

const KEY = 'odonteck-club:directorio:v1';
const DEMO: EstadoDirectorio = {
  perfiles: [
    { uid: 'demo-ana', nombre: 'Dra. Ana Torres', foto: '/fotos/directorio-demo-ana-v1.webp', titular: 'Endodoncista · atención microscópica', etapa: 'especialista', especialidades: ['Endodoncia'], ciudad: 'Puebla', estado: 'Puebla', modalidades: ['presencial'], disponibilidad: ['colaboraciones', 'mentoria'], habilidades: ['Microscopía', 'Trauma dental'], idiomas: ['Español', 'Inglés'], anosExperiencia: 8, bio: 'Endodoncista enfocada en resolución de casos complejos y colaboración interdisciplinaria.', experiencia: [{ puesto: 'Endodoncista asociada', organizacion: 'Clínica Horizonte', periodo: '2021 · Actualidad', descripcion: 'Diagnóstico, microcirugía endodóntica y coordinación de casos interdisciplinarios.' }, { puesto: 'Docente invitada', organizacion: 'Programa de actualización clínica', periodo: '2023 · Actualidad', descripcion: 'Talleres de magnificación y documentación clínica para odontólogos generales.' }], formacion: [{ programa: 'Especialidad en Endodoncia', institucion: 'Universidad de referencia · perfil demostrativo', periodo: '2016 · 2018' }], credenciales: [{ nombre: 'Microscopía clínica avanzada', emisor: 'Programa demostrativo OdonTeck', anio: '2024' }], actualizado: '2026-10-09T12:00:00Z' },
    { uid: 'demo-luis', nombre: 'Dr. Luis Herrera', foto: '/fotos/directorio-demo-luis-v1.webp', titular: 'Cirujano dentista · rehabilitación oral', etapa: 'general', especialidades: ['Rehabilitación', 'Cirugía'], ciudad: 'Querétaro', estado: 'Querétaro', modalidades: ['presencial', 'remoto'], disponibilidad: ['empleo', 'suplencias'], habilidades: ['Flujo digital', 'Prótesis fija'], idiomas: ['Español'], anosExperiencia: 5, bio: 'Odontólogo general con práctica restauradora y experiencia en flujos digitales para consulta privada.', experiencia: [{ puesto: 'Odontólogo restaurador', organizacion: 'Consulta privada · perfil demostrativo', periodo: '2022 · Actualidad', descripcion: 'Planeación restauradora, escaneo intraoral y seguimiento de pacientes.' }], formacion: [{ programa: 'Licenciatura en Cirugía Dental', institucion: 'Universidad de referencia · perfil demostrativo', periodo: '2016 · 2021' }], credenciales: [], actualizado: '2026-10-08T12:00:00Z' },
    { uid: 'demo-sofia', nombre: 'Dra. Sofía Reyes', foto: '/fotos/directorio-demo-sofia-v1.webp', titular: 'Odontopediatra y docente clínica', etapa: 'docente', especialidades: ['Odontopediatría'], ciudad: 'CDMX', estado: 'Ciudad de México', modalidades: ['hibrido'], disponibilidad: ['mentoria', 'colaboraciones'], habilidades: ['Manejo de conducta', 'Docencia'], idiomas: ['Español', 'Inglés'], anosExperiencia: 10, bio: 'Docente clínica interesada en mentoría, educación para pacientes y proyectos de prevención infantil.', experiencia: [{ puesto: 'Coordinadora clínica', organizacion: 'Programa infantil · perfil demostrativo', periodo: '2019 · Actualidad', descripcion: 'Supervisión de atención preventiva y formación de equipos clínicos.' }, { puesto: 'Docente de clínica', organizacion: 'Facultad de referencia · perfil demostrativo', periodo: '2017 · Actualidad', descripcion: 'Acompañamiento de estudiantes en diagnóstico, comunicación y manejo de conducta.' }], formacion: [{ programa: 'Especialidad en Odontopediatría', institucion: 'Universidad de referencia · perfil demostrativo', periodo: '2013 · 2015' }], credenciales: [{ nombre: 'Educación basada en simulación', emisor: 'Programa académico demostrativo', anio: '2025' }], actualizado: '2026-10-07T12:00:00Z' },
  ],
  oportunidades: [
    { id: 'demo-op-1', autorUid: 'demo-ana', autor: 'Dra. Ana Torres', titulo: 'Odontólogo general para clínica multidisciplinaria', tipo: 'empleo', organizacion: 'Clínica Horizonte', modalidad: 'presencial', ciudad: 'Puebla', entidad: 'Puebla', especialidades: ['Odontología general'], resumen: 'Buscamos colega para integrarse tres tardes por semana, con acompañamiento clínico y posibilidad de crecimiento.', requisitos: 'Título y cédula; trato humano y documentación clínica ordenada.', compensacion: 'Honorarios por definir en entrevista', estado: 'publicada', fecha: '2026-10-09T12:00:00Z', expira: '2026-11-23T12:00:00Z' },
    { id: 'demo-op-2', autorUid: 'demo-sofia', autor: 'Dra. Sofía Reyes', titulo: 'Colaboración para taller de prevención infantil', tipo: 'colaboracion', organizacion: 'Proyecto Sonrisas', modalidad: 'hibrido', ciudad: 'CDMX', entidad: 'Ciudad de México', especialidades: ['Odontopediatría', 'Salud pública'], resumen: 'Diseño conjunto de un taller breve para escuelas, con materiales claros y evaluación de aprendizaje.', requisitos: 'Interés en educación y disponibilidad para dos sesiones de planeación.', compensacion: 'Colaboración académica con constancia', estado: 'publicada', fecha: '2026-10-08T12:00:00Z', expira: '2026-11-22T12:00:00Z' },
  ],
  conexiones: [], miPerfil: null,
};

let estado: EstadoDirectorio = structuredClone(DEMO);
let cargadoEn = 0;
const combinar = <T extends { id?: string; uid?: string }>(a: T[], b: T[]) => [...new Map([...a, ...b].map((v) => [v.id || v.uid, v])).values()];
const alInicio = <T extends { id: string }>(lista: T[], v: T) => [v, ...lista.filter((x) => x.id !== v.id)];
const reemplazar = <T extends { id: string }>(lista: T[], v: T) => lista.map((x) => x.id === v.id ? v : x);
function guardar() { if (Datos.modo === 'demo') localStorage.setItem(KEY, JSON.stringify(estado)); }
function cargarDemo() { try { const v = JSON.parse(localStorage.getItem(KEY) || 'null'); if (v?.perfiles) estado = v; } catch {} }
cargarDemo();

const blobADataUrl = (blob: Blob) => new Promise<string>((ok, err) => { const r = new FileReader(); r.onload = () => ok(String(r.result)); r.onerror = () => err(r.error); r.readAsDataURL(blob); });

async function prepararImagenDirectorio(file: File, tipo: 'foto' | 'banner'): Promise<ImagenDirectorioPreparada> {
  if (!file.type.startsWith('image/')) throw new Error('Selecciona una imagen JPG, PNG o WebP.');
  if (file.size > 8_000_000) throw new Error('La imagen original debe pesar menos de 8 MB.');
  const source = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((ok, err) => { const el = new Image(); el.onload = () => ok(el); el.onerror = () => err(new Error('No pudimos leer la imagen.')); el.src = source; });
    const ancho = tipo === 'foto' ? 720 : 1600; const alto = tipo === 'foto' ? 720 : 560;
    const escala = Math.max(ancho / img.naturalWidth, alto / img.naturalHeight);
    const origenAncho = ancho / escala; const origenAlto = alto / escala;
    const canvas = document.createElement('canvas'); canvas.width = ancho; canvas.height = alto;
    canvas.getContext('2d')!.drawImage(img, (img.naturalWidth - origenAncho) / 2, (img.naturalHeight - origenAlto) / 2, origenAncho, origenAlto, 0, 0, ancho, alto);
    const blob = await new Promise<Blob>((ok, err) => canvas.toBlob((v) => v ? ok(v) : err(new Error('No pudimos optimizar la imagen.')), 'image/webp', tipo === 'foto' ? .86 : .82));
    const max = tipo === 'foto' ? 2_000_000 : 3_000_000;
    if (blob.size > max) throw new Error(`La ${tipo === 'foto' ? 'foto' : 'portada'} optimizada todavía supera ${max / 1_000_000} MB. Prueba otra imagen.`);
    return { blob, preview: URL.createObjectURL(blob) };
  } finally { URL.revokeObjectURL(source); }
}

export const prepararFotoDirectorio = (file: File) => prepararImagenDirectorio(file, 'foto');
export const prepararBannerDirectorio = (file: File) => prepararImagenDirectorio(file, 'banner');

export const Directorio = {
  get: () => estado,
  cargado: () => cargadoEn > 0,
  vigente: (ttl: number) => Date.now() - cargadoEn < ttl,
  invalidar() { cargadoEn = 0; },
  hidratar(v: EstadoDirectorio) { estado = v; },
  async cargar(mas?: 'perfiles' | 'oportunidades') {
    if (Datos.modo === 'api') {
      const qs = new URLSearchParams({ limite: '24' });
      const siguiente = mas ? estado.paginacion?.[mas]?.siguiente : null;
      if (mas === 'perfiles' && siguiente) qs.set('perfilesAntes', siguiente);
      if (mas === 'oportunidades' && siguiente) qs.set('oportunidadesAntes', siguiente);
      const remoto = await api<EstadoDirectorio>(`/directorio?${qs}`);
      estado = mas === 'perfiles'
        ? { ...remoto, perfiles: combinar(estado.perfiles, remoto.perfiles), oportunidades: estado.oportunidades, paginacion: { ...remoto.paginacion!, oportunidades: estado.paginacion?.oportunidades ?? remoto.paginacion!.oportunidades } }
        : mas === 'oportunidades'
          ? { ...remoto, perfiles: estado.perfiles, oportunidades: combinar(estado.oportunidades, remoto.oportunidades), paginacion: { ...remoto.paginacion!, perfiles: estado.paginacion?.perfiles ?? remoto.paginacion!.perfiles } }
          : remoto;
      cargadoEn = Date.now();
    }
    return estado;
  },
  async guardarPerfil(v: Omit<PerfilDirectorio, 'uid' | 'nombre' | 'actualizado' | 'esMio' | 'foto' | 'banner'> & { contacto: { canal: string; valor?: string } }, foto?: ImagenDirectorioPreparada | null, quitarFoto = false, banner?: ImagenDirectorioPreparada | null, quitarBanner = false) {
    if (Datos.modo === 'api') {
      if (quitarFoto) await api('/directorio/perfil/foto', { method: 'DELETE' });
      if (quitarBanner) await api('/directorio/perfil/banner', { method: 'DELETE' });
      let fotoPropia = false;
      if (foto) {
        const firma = await api<{ uploadUrl: string; publicUrl: string; contentType: string }>('/directorio/perfil/foto/subida', { method: 'POST', json: { contentType: 'image/webp', bytes: foto.blob.size } });
        const subida = await fetch(firma.uploadUrl, { method: 'PUT', headers: { 'Content-Type': firma.contentType }, body: foto.blob });
        if (!subida.ok) throw new Error(`No pudimos subir la foto (${subida.status}).`);
        fotoPropia = true;
      }
      let bannerPropio = false;
      if (banner) {
        const firma = await api<{ uploadUrl: string; publicUrl: string; contentType: string }>('/directorio/perfil/banner/subida', { method: 'POST', json: { contentType: 'image/webp', bytes: banner.blob.size } });
        const subida = await fetch(firma.uploadUrl, { method: 'PUT', headers: { 'Content-Type': firma.contentType }, body: banner.blob });
        if (!subida.ok) throw new Error(`No pudimos subir la portada (${subida.status}).`);
        bannerPropio = true;
      }
      await api('/directorio/perfil', { method: 'PUT', json: { ...v, ...(fotoPropia ? { foto: 'propia' } : quitarFoto ? { foto: null } : {}), ...(bannerPropio ? { banner: 'propio' } : quitarBanner ? { banner: null } : {}) } });
      this.invalidar();
      await this.cargar();
      return estado;
    }
    const fotoFinal = quitarFoto ? null : foto ? await blobADataUrl(foto.blob) : estado.miPerfil?.foto ?? null;
    const bannerFinal = quitarBanner ? null : banner ? await blobADataUrl(banner.blob) : estado.miPerfil?.banner ?? null;
    const { contacto: _contacto, ...publico } = v;
    const perfil: PerfilDirectorio = { ...publico, foto: fotoFinal, banner: bannerFinal, uid: 'demo', nombre: 'Modo demo', actualizado: new Date().toISOString(), esMio: true };
    estado.perfiles = [...estado.perfiles.filter((p) => p.uid !== 'demo'), perfil]; estado.miPerfil = { ...perfil, contacto: { canal: v.contacto.canal, valor: v.contacto.valor || '' } }; guardar(); return estado;
  },
  async publicar(v: Record<string, unknown>) {
    if (Datos.modo === 'api') {
      const op = await api<OportunidadDirectorio>('/directorio/oportunidades', { method: 'POST', json: v });
      if (op?.id) estado = { ...estado, oportunidades: alInicio(estado.oportunidades, op) }; else this.invalidar();
      return estado;
    }
    const op = { ...v, id: `demo-op-${Date.now()}`, autorUid: 'demo', autor: 'Modo demo', estado: 'publicada', fecha: new Date().toISOString(), expira: new Date(Date.now() + 45 * 86400000).toISOString(), esMia: true } as OportunidadDirectorio;
    estado.oportunidades.unshift(op); guardar(); return estado;
  },
  async cerrarOportunidad(id: string) {
    if (Datos.modo === 'api') {
      const op = await api<OportunidadDirectorio>(`/directorio/oportunidades/${encodeURIComponent(id)}`, { method: 'PATCH', json: { estado: 'cerrada' } });
      if (op?.id) estado = { ...estado, oportunidades: reemplazar(estado.oportunidades, op) }; else this.invalidar();
      return estado;
    }
    const op = estado.oportunidades.find((x) => x.id === id); if (op) op.estado = 'cerrada'; guardar(); return estado;
  },
  async eliminarPerfil() {
    if (Datos.modo === 'api') {
      await api('/directorio/perfil', { method: 'DELETE' });
      this.invalidar();
      await this.cargar();
      return estado;
    }
    estado.perfiles = estado.perfiles.filter((p) => !p.esMio && p.uid !== 'demo');
    estado.oportunidades.forEach((o) => { if (o.esMia || o.autorUid === 'demo') o.estado = 'cerrada'; });
    estado.conexiones = estado.conexiones.map((c) => c.estado === 'pendiente' ? { ...c, estado: 'rechazada' } : c);
    estado.miPerfil = null; guardar(); return estado;
  },
  async reportar(tipo: 'perfil' | 'oportunidad', objetivoId: string, motivo: string, detalle: string) {
    if (Datos.modo === 'api') return api<{ id: string; estado: string }>('/directorio/reportes', { method: 'POST', json: { tipo, objetivoId, motivo, detalle } });
    return { id: `demo-reporte-${Date.now()}`, estado: 'pendiente' };
  },
  async conectar(paraUid: string, oportunidadId: string | null, mensaje: string) {
    if (Datos.modo === 'api') {
      const c = await api<ConexionDirectorio>('/directorio/conexiones', { method: 'POST', json: { paraUid, oportunidadId, mensaje } });
      if (c?.id) estado = { ...estado, conexiones: alInicio(estado.conexiones, c) }; else this.invalidar();
      return estado;
    }
    const persona = estado.perfiles.find((p) => p.uid === paraUid)?.nombre || estado.oportunidades.find((o) => o.id === oportunidadId)?.autor || 'Colega';
    estado.conexiones.unshift({ id: `demo-cn-${Date.now()}`, deUid: 'demo', paraUid, oportunidadId, mensaje, estado: 'pendiente', creado: new Date().toISOString(), actualizado: new Date().toISOString(), esEntrante: false, otraPersona: persona, contacto: null }); guardar(); return estado;
  },
  async responder(id: string, respuesta: 'aceptada' | 'rechazada') {
    if (Datos.modo === 'api') {
      const c = await api<ConexionDirectorio>(`/directorio/conexiones/${encodeURIComponent(id)}`, { method: 'PATCH', json: { estado: respuesta } });
      if (c?.id) estado = { ...estado, conexiones: reemplazar(estado.conexiones, c) }; else this.invalidar();
      return estado;
    }
    const c = estado.conexiones.find((x) => x.id === id); if (c) c.estado = respuesta; guardar(); return estado;
  },
};
