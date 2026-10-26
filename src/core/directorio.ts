import { api } from './auth';
import { Datos } from './datos';

export interface PerfilDirectorio {
  personalizacion?: {marco?: string|null; portada?: string|null};
  uid: string; nombre: string; titular: string; etapa: string; especialidades: string[];
  ciudad: string; estado: string; modalidades: string[]; disponibilidad: string[];
  habilidades: string[]; bio: string; foto?: string | null; banner?: string | null;
  anosExperiencia?: number | null; idiomas?: string[]; experiencia?: ExperienciaDirectorio[];
  formacion?: FormacionDirectorio[]; credenciales?: CredencialDirectorio[];
  contacto?: { canal: string; valor: string } | null; actualizado: string; esMio?: boolean; visible?: boolean;
  documentos?: DocumentoDirectorio[];
}
export type TipoDocumento = 'cv' | 'titulo' | 'certificado' | 'constancia' | 'portafolio' | 'otro';
export type VisibilidadDocumento = 'miembros' | 'conexiones';
export interface DocumentoDirectorio {
  id: string; nombre: string; tipo: TipoDocumento; visibilidad: VisibilidadDocumento; mime: string; bytes: number;
  paginas?: number | null; creado: string;
  /** Solo en la ficha: si quien mira puede abrirlo, y enlaces firmados de corta duración. */
  accesible?: boolean; url?: string | null; miniatura?: string | null;
}
export interface FichaDirectorio { perfil: PerfilDirectorio; documentos: DocumentoDirectorio[]; en: number }
/** Documento ya procesado en el navegador, listo para subir. */
export interface DocumentoPreparado { archivo: Blob; mime: string; miniatura: Blob; preview: string; paginas: number | null; nombreSugerido: string }
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
interface FirmaSubida { uploadUrl: string; contentType: string; uploadHeaders?: Record<string, string> }

const KEY = 'odonteck-club:directorio:v1';
// Documentos ficticios del prototipo local (marcados como demostrativos dentro del propio archivo).
const DOC_DEMO = (id: string, nombre: string, tipo: TipoDocumento, visibilidad: VisibilidadDocumento, url: string, paginas: number | null, mime = 'application/pdf'): DocumentoDirectorio =>
  ({ id, nombre, tipo, visibilidad, mime, bytes: 0, paginas, creado: '2026-09-01T12:00:00.000Z', url });
const DEMO: EstadoDirectorio = {
  perfiles: [
    { uid: 'demo-ana', nombre: 'Dra. Ana Torres', foto: '/fotos/directorio-demo-ana-v1.webp', documentos: [DOC_DEMO('demo-doc-ana-cv', 'CV · Endodoncia microscópica', 'cv', 'miembros', '/directorio-demo/cv-ana-torres.pdf', 2), DOC_DEMO('demo-doc-ana-cedula', 'Cédula de especialidad', 'titulo', 'conexiones', '/directorio-demo/constancia-ana-torres.pdf', 1)], titular: 'Endodoncista · atención microscópica', etapa: 'especialista', especialidades: ['Endodoncia'], ciudad: 'Puebla', estado: 'Puebla', modalidades: ['presencial'], disponibilidad: ['colaboraciones', 'mentoria'], habilidades: ['Microscopía', 'Trauma dental'], idiomas: ['Español', 'Inglés'], anosExperiencia: 8, bio: 'Endodoncista enfocada en resolución de casos complejos y colaboración interdisciplinaria.', experiencia: [{ puesto: 'Endodoncista asociada', organizacion: 'Clínica Horizonte', periodo: '2021 · Actualidad', descripcion: 'Diagnóstico, microcirugía endodóntica y coordinación de casos interdisciplinarios.' }, { puesto: 'Docente invitada', organizacion: 'Programa de actualización clínica', periodo: '2023 · Actualidad', descripcion: 'Talleres de magnificación y documentación clínica para odontólogos generales.' }], formacion: [{ programa: 'Especialidad en Endodoncia', institucion: 'Universidad de referencia · perfil demostrativo', periodo: '2016 · 2018' }], credenciales: [{ nombre: 'Microscopía clínica avanzada', emisor: 'Programa demostrativo OdonTeck', anio: '2024' }], actualizado: '2026-10-09T12:00:00Z' },
    { uid: 'demo-luis', nombre: 'Dr. Luis Herrera', foto: '/fotos/directorio-demo-luis-v1.webp', documentos: [DOC_DEMO('demo-doc-luis-cv', 'Currículum 2026', 'cv', 'miembros', '/directorio-demo/cv-luis-herrera.pdf', 2), DOC_DEMO('demo-doc-luis-diploma', 'Diplomado en flujo digital', 'certificado', 'miembros', '/directorio-demo/diploma-luis-herrera.webp', null, 'image/webp')], titular: 'Cirujano dentista · rehabilitación oral', etapa: 'general', especialidades: ['Rehabilitación', 'Cirugía'], ciudad: 'Querétaro', estado: 'Querétaro', modalidades: ['presencial', 'remoto'], disponibilidad: ['empleo', 'suplencias'], habilidades: ['Flujo digital', 'Prótesis fija'], idiomas: ['Español'], anosExperiencia: 5, bio: 'Odontólogo general con práctica restauradora y experiencia en flujos digitales para consulta privada.', experiencia: [{ puesto: 'Odontólogo restaurador', organizacion: 'Consulta privada · perfil demostrativo', periodo: '2022 · Actualidad', descripcion: 'Planeación restauradora, escaneo intraoral y seguimiento de pacientes.' }], formacion: [{ programa: 'Licenciatura en Cirugía Dental', institucion: 'Universidad de referencia · perfil demostrativo', periodo: '2016 · 2021' }], credenciales: [], actualizado: '2026-10-08T12:00:00Z' },
    { uid: 'demo-sofia', nombre: 'Dra. Sofía Reyes', foto: '/fotos/directorio-demo-sofia-v1.webp', documentos: [DOC_DEMO('demo-doc-sofia-constancia', 'Constancia docente', 'constancia', 'miembros', '/directorio-demo/constancia-sofia-reyes.pdf', 1)], titular: 'Odontopediatra y docente clínica', etapa: 'docente', especialidades: ['Odontopediatría'], ciudad: 'CDMX', estado: 'Ciudad de México', modalidades: ['hibrido'], disponibilidad: ['mentoria', 'colaboraciones'], habilidades: ['Manejo de conducta', 'Docencia'], idiomas: ['Español', 'Inglés'], anosExperiencia: 10, bio: 'Docente clínica interesada en mentoría, educación para pacientes y proyectos de prevención infantil.', experiencia: [{ puesto: 'Coordinadora clínica', organizacion: 'Programa infantil · perfil demostrativo', periodo: '2019 · Actualidad', descripcion: 'Supervisión de atención preventiva y formación de equipos clínicos.' }, { puesto: 'Docente de clínica', organizacion: 'Facultad de referencia · perfil demostrativo', periodo: '2017 · Actualidad', descripcion: 'Acompañamiento de estudiantes en diagnóstico, comunicación y manejo de conducta.' }], formacion: [{ programa: 'Especialidad en Odontopediatría', institucion: 'Universidad de referencia · perfil demostrativo', periodo: '2013 · 2015' }], credenciales: [{ nombre: 'Educación basada en simulación', emisor: 'Programa académico demostrativo', anio: '2025' }], actualizado: '2026-10-07T12:00:00Z' },
  ],
  oportunidades: [
    { id: 'demo-op-1', autorUid: 'demo-ana', autor: 'Dra. Ana Torres', titulo: 'Odontólogo general para clínica multidisciplinaria', tipo: 'empleo', organizacion: 'Clínica Horizonte', modalidad: 'presencial', ciudad: 'Puebla', entidad: 'Puebla', especialidades: ['Odontología general'], resumen: 'Buscamos colega para integrarse tres tardes por semana, con acompañamiento clínico y posibilidad de crecimiento.', requisitos: 'Título y cédula; trato humano y documentación clínica ordenada.', compensacion: 'Honorarios por definir en entrevista', estado: 'publicada', fecha: '2026-10-09T12:00:00Z', expira: '2026-11-23T12:00:00Z' },
    { id: 'demo-op-2', autorUid: 'demo-sofia', autor: 'Dra. Sofía Reyes', titulo: 'Colaboración para taller de prevención infantil', tipo: 'colaboracion', organizacion: 'Proyecto Sonrisas', modalidad: 'hibrido', ciudad: 'CDMX', entidad: 'Ciudad de México', especialidades: ['Odontopediatría', 'Salud pública'], resumen: 'Diseño conjunto de un taller breve para escuelas, con materiales claros y evaluación de aprendizaje.', requisitos: 'Interés en educación y disponibilidad para dos sesiones de planeación.', compensacion: 'Colaboración académica con constancia', estado: 'publicada', fecha: '2026-10-08T12:00:00Z', expira: '2026-11-22T12:00:00Z' },
  ],
  conexiones: [], miPerfil: null,
};

let estado: EstadoDirectorio = structuredClone(DEMO);
let cargadoEn = 0;
const fichas = new Map<string, FichaDirectorio>();
const combinar = <T extends { id?: string; uid?: string }>(a: T[], b: T[]) => [...new Map([...a, ...b].map((v) => [v.id || v.uid, v])).values()];
const alInicio = <T extends { id: string }>(lista: T[], v: T) => [v, ...lista.filter((x) => x.id !== v.id)];
const reemplazar = <T extends { id: string }>(lista: T[], v: T) => lista.map((x) => x.id === v.id ? v : x);
function guardar() { if (Datos.modo === 'demo') localStorage.setItem(KEY, JSON.stringify(estado)); }
function cargarDemo() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || 'null') as EstadoDirectorio | null;
    if (!v?.perfiles) return;
    // Estados guardados antes de que existieran los documentos: se completan con los de ejemplo.
    v.perfiles = v.perfiles.map((p) => p.documentos ? p : { ...p, documentos: DEMO.perfiles.find((d) => d.uid === p.uid)?.documentos ?? [] });
    estado = v;
  } catch {}
}
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
  invalidar() { cargadoEn = 0; fichas.clear(); },
  /** Ficha completa de una persona: perfil + documentos con permisos ya resueltos. */
  ficha(uid: string): FichaDirectorio | null {
    if (Datos.modo === 'api') return fichas.get(uid) ?? null;
    const perfil = estado.perfiles.find((p) => p.uid === uid) ?? (estado.miPerfil?.uid === uid ? estado.miPerfil : null);
    if (!perfil) return null;
    const conectado = perfil.esMio || estado.conexiones.some((c) => c.estado === 'aceptada' && (c.deUid === uid || c.paraUid === uid));
    return { perfil, documentos: (perfil.documentos ?? []).map((d) => ({ ...d, accesible: d.visibilidad === 'miembros' || !!conectado })), en: Date.now() };
  },
  fichaVigente(uid: string, ttl: number) { const f = fichas.get(uid); return !!f && Date.now() - f.en < ttl; },
  async cargarFicha(uid: string) {
    if (Datos.modo !== 'api') return this.ficha(uid);
    const r = await api<{ perfil: PerfilDirectorio; documentos: DocumentoDirectorio[] }>(`/directorio/perfiles/${encodeURIComponent(uid)}/documentos`);
    const ficha = { perfil: r.perfil, documentos: r.documentos, en: Date.now() };
    fichas.set(uid, ficha); return ficha;
  },
  async adjuntarDocumento(prep: DocumentoPreparado, meta: { nombre: string; tipo: TipoDocumento; visibilidad: VisibilidadDocumento }) {
    if (Datos.modo === 'api') {
      const firma = await api<FirmaSubida & { id: string; miniaturaUploadUrl: string; miniaturaContentType: string; miniaturaUploadHeaders?: Record<string, string> }>('/directorio/perfil/documentos/subida', { method: 'POST', json: { contentType: prep.mime, bytes: prep.archivo.size, miniaturaBytes: prep.miniatura.size } });
      const [a, m] = await Promise.all([
        fetch(firma.uploadUrl, { method: 'PUT', headers: firma.uploadHeaders ?? { 'Content-Type': firma.contentType }, body: prep.archivo }),
        fetch(firma.miniaturaUploadUrl, { method: 'PUT', headers: firma.miniaturaUploadHeaders ?? { 'Content-Type': firma.miniaturaContentType }, body: prep.miniatura }),
      ]);
      if (!a.ok || !m.ok) throw new Error(`No pudimos subir el documento (${a.ok ? m.status : a.status}).`);
      await api('/directorio/perfil/documentos', { method: 'POST', json: { id: firma.id, ...meta, paginas: prep.paginas } });
      this.invalidar(); return;
    }
    const mio = estado.perfiles.find((p) => p.esMio || p.uid === 'demo');
    if (!mio) throw new Error('Crea tu perfil del directorio antes de adjuntar documentos.');
    if ((mio.documentos ?? []).length >= 6) throw new Error('Puedes adjuntar hasta 6 documentos. Retira uno para subir otro.');
    const id = [...crypto.getRandomValues(new Uint8Array(12))].map((b) => b.toString(16).padStart(2, '0')).join('');
    await guardarArchivoDemo(id, prep.archivo, prep.miniatura);
    const doc: DocumentoDirectorio = { id, ...meta, mime: prep.mime, bytes: prep.archivo.size, paginas: prep.paginas, creado: new Date().toISOString() };
    mio.documentos = [...(mio.documentos ?? []), doc];
    if (estado.miPerfil) estado.miPerfil.documentos = mio.documentos;
    guardar();
  },
  async editarDocumento(id: string, cambios: Partial<Pick<DocumentoDirectorio, 'nombre' | 'tipo' | 'visibilidad'>>) {
    if (Datos.modo === 'api') { await api(`/directorio/perfil/documentos/${encodeURIComponent(id)}`, { method: 'PATCH', json: cambios }); this.invalidar(); return; }
    const mio = estado.perfiles.find((p) => p.esMio || p.uid === 'demo');
    if (mio?.documentos) { mio.documentos = mio.documentos.map((d) => d.id === id ? { ...d, ...cambios } : d); if (estado.miPerfil) estado.miPerfil.documentos = mio.documentos; guardar(); }
  },
  async quitarDocumento(id: string) {
    if (Datos.modo === 'api') { await api(`/directorio/perfil/documentos/${encodeURIComponent(id)}`, { method: 'DELETE' }); this.invalidar(); return; }
    const mio = estado.perfiles.find((p) => p.esMio || p.uid === 'demo');
    if (mio?.documentos) { mio.documentos = mio.documentos.filter((d) => d.id !== id); if (estado.miPerfil) estado.miPerfil.documentos = mio.documentos; guardar(); }
    await borrarArchivoDemo(id);
  },
  /** Cambia solo la foto o la portada desde la página del perfil, sin abrir el formulario completo. */
  async actualizarImagen(tipo: 'foto' | 'banner', img: ImagenDirectorioPreparada | null) {
    const mio = estado.miPerfil;
    if (!mio) throw new Error('Crea tu perfil del directorio primero.');
    if (Datos.modo === 'api') {
      const ruta = tipo === 'foto' ? '/directorio/perfil/foto' : '/directorio/perfil/banner';
      if (!img) { await api(ruta, { method: 'DELETE' }); this.invalidar(); return; }
      const firma = await api<FirmaSubida>(`${ruta}/subida`, { method: 'POST', json: { contentType: 'image/webp', bytes: img.blob.size } });
      const subida = await fetch(firma.uploadUrl, { method: 'PUT', headers: firma.uploadHeaders ?? { 'Content-Type': firma.contentType }, body: img.blob });
      if (!subida.ok) throw new Error(`No pudimos subir la ${tipo === 'foto' ? 'foto' : 'portada'} (${subida.status}).`);
      const { uid: _u, nombre: _n, actualizado: _a, esMio: _e, foto: _f, banner: _b, documentos: _d, ...resto } = mio;
      await api('/directorio/perfil', { method: 'PUT', json: { ...resto, contacto: { canal: mio.contacto?.canal ?? 'correo', valor: mio.contacto?.valor ?? '' }, ...(tipo === 'foto' ? { foto: 'propia' } : { banner: 'propio' }) } });
      this.invalidar(); return;
    }
    const valor = img ? await blobADataUrl(img.blob) : null;
    const aplicar = (p: PerfilDirectorio) => { if (tipo === 'foto') p.foto = valor; else p.banner = valor; p.actualizado = new Date().toISOString(); };
    aplicar(mio); const enLista = estado.perfiles.find((p) => p.esMio || p.uid === 'demo'); if (enLista) aplicar(enLista);
    guardar();
  },
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
        const firma = await api<FirmaSubida>('/directorio/perfil/foto/subida', { method: 'POST', json: { contentType: 'image/webp', bytes: foto.blob.size } });
        const subida = await fetch(firma.uploadUrl, { method: 'PUT', headers: firma.uploadHeaders ?? { 'Content-Type': firma.contentType }, body: foto.blob });
        if (!subida.ok) throw new Error(`No pudimos subir la foto (${subida.status}).`);
        fotoPropia = true;
      }
      let bannerPropio = false;
      if (banner) {
        const firma = await api<FirmaSubida>('/directorio/perfil/banner/subida', { method: 'POST', json: { contentType: 'image/webp', bytes: banner.blob.size } });
        const subida = await fetch(firma.uploadUrl, { method: 'PUT', headers: firma.uploadHeaders ?? { 'Content-Type': firma.contentType }, body: banner.blob });
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

// ── Archivos de documentos en modo demo: IndexedDB, solo en este navegador ──
const IDB = 'odonteck-club-directorio-docs';
function abrirIdb() {
  return new Promise<IDBDatabase>((ok, err) => {
    const r = indexedDB.open(IDB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore('docs');
    r.onsuccess = () => ok(r.result); r.onerror = () => err(r.error);
  });
}
const memoriaDemo = new Map<string, { archivo: Blob; miniatura: Blob }>();
type Guardado = { archivo: ArrayBuffer; tipo: string; miniatura: ArrayBuffer };
async function guardarArchivoDemo(id: string, archivo: Blob, miniatura: Blob) {
  memoriaDemo.set(id, { archivo, miniatura });
  try {
    // Se guardan bytes (no Blob): algunos Safari rechazan Blobs dentro de IndexedDB.
    const valor: Guardado = { archivo: await archivo.arrayBuffer(), tipo: archivo.type, miniatura: await miniatura.arrayBuffer() };
    const db = await abrirIdb();
    await new Promise<void>((ok, err) => { const tx = db.transaction('docs', 'readwrite'); tx.objectStore('docs').put(valor, id); tx.oncomplete = () => ok(); tx.onerror = () => err(tx.error ?? new Error('IndexedDB')); });
    db.close();
  } catch { /* Sin IndexedDB el documento vive solo en esta sesión. */ }
}
async function borrarArchivoDemo(id: string) {
  memoriaDemo.delete(id);
  try {
    const db = await abrirIdb();
    await new Promise<void>((ok) => { const tx = db.transaction('docs', 'readwrite'); tx.objectStore('docs').delete(id); tx.oncomplete = () => ok(); tx.onerror = () => ok(); });
    db.close();
  } catch {}
}
export async function leerArchivoDemo(id: string): Promise<{ archivo: Blob; miniatura: Blob } | null> {
  const enMemoria = memoriaDemo.get(id); if (enMemoria) return enMemoria;
  try {
    const db = await abrirIdb();
    const v = await new Promise<Guardado | null>((ok) => { const r = db.transaction('docs').objectStore('docs').get(id); r.onsuccess = () => ok(r.result ?? null); r.onerror = () => ok(null); });
    db.close();
    return v ? { archivo: new Blob([v.archivo], { type: v.tipo }), miniatura: new Blob([v.miniatura], { type: 'image/webp' }) } : null;
  } catch { return null; }
}
