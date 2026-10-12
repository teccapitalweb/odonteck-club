import { api, mensajeError } from './auth';
import { Comunidad } from './comunidad';
import { Datos, type Aviso, type Config, type Curso, type Evento, type Material, type MiembroDemo, type Quiz } from './datos';
import type { ContactoEncuesta, ResumenEncuestas } from './encuestas';

export interface ResumenAdmin {
  miembrosActivos: number;
  altas30d: number;
  bajas30d: number;
  clasesVistas30d: number;
  certificados30d: number;
  temasForo30d: number;
  cursosTop: { cursoId: string; titulo: string; vistas: number }[];
}

export interface DetalleMiembroAdmin extends MiembroDemo {
  perfil?: Record<string, unknown>;
  miembro?: Record<string, unknown> | null;
  suscripcion?: Record<string, unknown> | null;
  cortesia?: { hasta?: string; motivo?: string } | null;
  progreso: { cursoId: string; titulo: string; vistas: number[]; total: number; ultima: number | null; actualizado: string | null; certificado?: string | null }[];
  certificados: { folio: string; cursoTitulo: string; emitido: string }[];
}

interface SubidaFirmada { uploadUrl: string; path: string; contentType: string; publicUrl?: string }

const estado = {
  resumen: null as ResumenAdmin | null,
  encuestas: null as ResumenEncuestas | null,
  contactosEncuestas: [] as ContactoEncuesta[],
  detalleMiembro: null as DetalleMiembroAdmin | null,
  error: '' as string,
};
const cargados = new Set<string>();
const pendientes = new Map<string, Promise<void>>();

const adaptarCurso = (v: any): Curso => ({
  ...v,
  portada: v.portada || '/cursos/curso-01.webp',
  aprenderas: Array.isArray(v.aprenderas) ? v.aprenderas : [],
  clases: (Array.isArray(v.clases) ? v.clases : []).map((c: any) => ({ ...c, duracion: c.duracionMin ?? c.duracion ?? null })),
});
const adaptarMaterial = (v: any): Material => ({ ...v, portada: v.portada || '/materiales/portadas/guia-diagnostico-ortodoncico.webp' });
const adaptarEvento = (v: any): Evento => ({ ...v, reservas: Array.isArray(v.reservas) ? v.reservas.length : Number(v.reservas) || 0 });
const adaptarMiembro = (v: any): MiembroDemo => ({
  ...v,
  nombre: v.nombre || '',
  email: v.email || '',
  plan: v.plan ?? null,
  vence: v.vence ?? null,
  alta: v.alta || '',
  clasesVistas: Number(v.clasesVistas) || 0,
  ultimaActividad: v.ultimaActividad || '',
  cortesiaHasta: v.cortesiaHasta ?? null,
  cortesiaMotivo: v.cortesia?.motivo || v.cortesiaMotivo || '',
});
const adaptarConfig = (v: any): Config => {
  const actual = Datos.config();
  const numero = (valor: unknown, defecto: number) => valor === null || valor === undefined || Number.isNaN(Number(valor)) ? defecto : Number(valor);
  return {
    precioMensual: numero(v?.precios?.mensual, actual.precioMensual),
    precioAnual: numero(v?.precios?.anual, actual.precioAnual),
    descuentoVIP: numero(v?.descuentoVIP, actual.descuentoVIP),
    whatsappSoporte: v?.whatsappSoporte || actual.whatsappSoporte,
    canalWhatsApp: v?.canalWhatsApp || actual.canalWhatsApp,
    praxiaUrl: v?.praxiaUrl || actual.praxiaUrl,
  };
};

async function cargar(clave: string, tarea: () => Promise<void>, forzar = false) {
  if (forzar) cargados.delete(clave);
  if (cargados.has(clave)) return;
  const existente = pendientes.get(clave);
  if (existente) return existente;
  const p = tarea().then(() => { cargados.add(clave); }).finally(() => pendientes.delete(clave));
  pendientes.set(clave, p);
  return p;
}

const cargarCursos = (forzar = false) => cargar('cursos', async () => {
  Datos.hidratarAdmin('cursos', (await api<any[]>('/admin/cursos')).map(adaptarCurso));
}, forzar);
const cargarMateriales = (forzar = false) => cargar('materiales', async () => {
  Datos.hidratarAdmin('materiales', (await api<any[]>('/admin/materiales')).map(adaptarMaterial));
}, forzar);
const cargarEventos = (forzar = false) => cargar('eventos', async () => {
  Datos.hidratarAdmin('eventos', (await api<any[]>('/admin/eventos')).map(adaptarEvento));
}, forzar);
const cargarQuizzes = (forzar = false) => cargar('quizzes', async () => {
  Datos.hidratarAdmin('quizzes', await api<Quiz[]>('/admin/quizzes'));
}, forzar);

export const Admin = {
  get resumen() { return estado.resumen; },
  get encuestas() { return estado.encuestas; },
  get contactosEncuestas() { return estado.contactosEncuestas; },
  get detalleMiembro() { return estado.detalleMiembro; },
  get error() { return estado.error; },
  limpiarError() { estado.error = ''; },
};

export async function cargarAdmin(path: string, query = new URLSearchParams(), forzar = false) {
  if (Datos.modo !== 'api') return;
  estado.error = '';
  const tareas: Promise<void>[] = [];
  try {
    if (/^\/admin\/?$/.test(path)) {
      tareas.push(cargar('resumen', async () => { estado.resumen = await api<ResumenAdmin>('/admin/resumen'); }, forzar));
      tareas.push(cargarCursos(forzar), cargarMateriales(forzar), cargarEventos(forzar), cargarQuizzes(forzar));
    } else if (path.startsWith('/admin/cursos')) {
      tareas.push(cargarCursos(forzar), cargarQuizzes(forzar));
    } else if (path.startsWith('/admin/quizzes')) {
      tareas.push(cargarCursos(forzar), cargarQuizzes(forzar));
    } else if (path.startsWith('/admin/materiales')) {
      tareas.push(cargarCursos(forzar), cargarMateriales(forzar));
    } else if (path.startsWith('/admin/en-vivo')) {
      tareas.push(cargarCursos(forzar), cargarEventos(forzar));
    } else if (path === '/admin/miembros') {
      const q = query.get('q') || '';
      const filtro = query.get('estado') || '';
      const estadoApi = filtro === 'sin' ? 'no_vip' : filtro;
      const clave = `miembros:${q}:${estadoApi}`;
      tareas.push(cargar(clave, async () => {
        const qs = new URLSearchParams();
        if (q) qs.set('q', q);
        if (estadoApi) qs.set('estado', estadoApi);
        Datos.hidratarAdmin('miembros', (await api<any[]>(`/admin/miembros${qs.size ? `?${qs}` : ''}`)).map(adaptarMiembro));
      }, true));
    } else if (path.startsWith('/admin/miembros/')) {
      const uid = decodeURIComponent(path.slice('/admin/miembros/'.length));
      tareas.push(cargar(`miembro:${uid}`, async () => {
        const d = await api<any>(`/admin/miembros/${encodeURIComponent(uid)}`);
        const progreso = Array.isArray(d.progreso) ? d.progreso : [];
        const ultimaActividad = progreso.map((p: any) => p.actualizado || '').sort().at(-1) || '';
        estado.detalleMiembro = {
          ...d,
          ...adaptarMiembro({ ...d, clasesVistas: progreso.reduce((n: number, p: any) => n + (Array.isArray(p.vistas) ? p.vistas.length : 0), 0), ultimaActividad }),
          cortesiaMotivo: d.cortesia?.motivo || '', progreso, certificados: d.certificados || [],
        };
      }, true));
    } else if (path === '/admin/comunidad') {
      tareas.push(cargar('foro', async () => { Comunidad.hidratar(await api<any[]>('/admin/foro')); }, forzar));
    } else if (path === '/admin/avisos') {
      tareas.push(cargar('avisos', async () => { Datos.hidratarAdmin('avisos', await api<Aviso[]>('/admin/avisos')); }, forzar));
    } else if (path === '/admin/encuestas') {
      const plan = query.get('plan') === 'vip' || query.get('plan') === 'gratis' ? query.get('plan') : '';
      tareas.push(cargar(`encuestas:${plan}`, async () => { estado.encuestas = await api<ResumenEncuestas>(`/admin/encuestas/resumen${plan ? `?plan=${plan}` : ''}`); }, true));
      tareas.push(cargar('encuestas:contactos', async () => { estado.contactosEncuestas = await api<ContactoEncuesta[]>('/admin/encuestas/contactos'); }, forzar));
    } else if (path === '/admin/ajustes') {
      tareas.push(cargar('config', async () => { Datos.hidratarAdmin('config', adaptarConfig(await api('/admin/config'))); }, forzar));
    }
    await Promise.all(tareas);
  } catch (e) {
    estado.error = mensajeError(e);
  }
}

function reemplazar<T extends { id: string }>(lista: T[], valor: T) {
  const i = lista.findIndex((x) => x.id === valor.id);
  if (i >= 0) lista[i] = valor; else lista.push(valor);
  return lista;
}

const cursoParaApi = (c: Curso) => ({
  id: c.id, titulo: c.titulo, area: c.area, nivel: c.nivel, instructor: c.instructor, portada: c.portada || null,
  banner: c.banner || null, descripcion: c.descripcion, aprenderas: c.aprenderas || [], orden: c.orden, publicado: c.publicado !== false,
  bunnyCollectionId: c.bunnyCollectionId, clases: c.clases.map((k) => ({ n: k.n, titulo: k.titulo, videoId: k.videoId, duracionMin: k.duracion, gratis: k.gratis, ...(k.notas ? { notas: k.notas } : {}), ...(k.ficha ? { ficha: k.ficha } : {}) })),
});

export async function guardarCursoAdmin(c: Curso, nuevo: boolean) {
  if (Datos.modo === 'demo') { Datos.guardarCurso(c); return c; }
  const payload: any = cursoParaApi(c);
  if (!nuevo) delete payload.id;
  const guardado = adaptarCurso(await api<any>(nuevo ? '/admin/cursos' : `/admin/cursos/${encodeURIComponent(c.id)}`, { method: nuevo ? 'POST' : 'PATCH', json: payload }));
  Datos.hidratarAdmin('cursos', reemplazar(Datos.cursos(), guardado));
  cargados.add('cursos');
  return guardado;
}

export async function borrarCursoAdmin(id: string) {
  if (Datos.modo === 'demo') Datos.borrarCurso(id);
  else { await api(`/admin/cursos/${encodeURIComponent(id)}`, { method: 'DELETE' }); Datos.hidratarAdmin('cursos', Datos.cursos().filter((c) => c.id !== id)); }
}

export async function reordenarCursosAdmin(ids: string[]) {
  if (Datos.modo === 'demo') { Datos.reordenarCursos(ids); return; }
  await Promise.all(ids.map((id, orden) => api(`/admin/cursos/${encodeURIComponent(id)}`, { method: 'PATCH', json: { orden: orden + 1 } })));
  const lista = Datos.cursos();
  ids.forEach((id, i) => { const c = lista.find((x) => x.id === id); if (c) c.orden = i + 1; });
  Datos.hidratarAdmin('cursos', lista);
}

const materialParaApi = (m: Material) => ({
  id: m.id, titulo: m.titulo, tipo: m.tipo, categoria: m.categoria, area: m.area, autor: m.autor, paginas: m.paginas,
  portada: m.portada || null, cursoId: m.cursoId || null, descripcion: m.descripcion, estado: m.estado, gratis: m.gratis === true,
});

async function subir(id: string, tipo: 'archivo' | 'portada', archivo: Blob, contentType: string) {
  const firma = await api<SubidaFirmada>(`/admin/materiales/${encodeURIComponent(id)}/subida`, { method: 'POST', json: { tipo, contentType } });
  const r = await fetch(firma.uploadUrl, { method: 'PUT', headers: { 'Content-Type': contentType }, body: archivo });
  if (!r.ok) throw new Error(`No se pudo subir ${tipo === 'archivo' ? 'el PDF' : 'la portada'} (${r.status}).`);
  return firma;
}

export async function guardarMaterialAdmin(m: Material, nuevo: boolean, archivos: { archivo?: File; portada?: Blob } = {}) {
  if (Datos.modo === 'demo') { Datos.guardarMaterial(m); return m; }
  const estadoFinal = m.estado;
  const inicial = { ...m, estado: archivos.archivo ? 'proximamente' : m.estado };
  const payload: any = materialParaApi(inicial);
  if (!nuevo) delete payload.id;
  let guardado = adaptarMaterial(await api<any>(nuevo ? '/admin/materiales' : `/admin/materiales/${encodeURIComponent(m.id)}`, { method: nuevo ? 'POST' : 'PATCH', json: payload }));
  if (archivos.archivo) await subir(guardado.id, 'archivo', archivos.archivo, 'application/pdf');
  if (archivos.portada) {
    const firma = await subir(guardado.id, 'portada', archivos.portada, 'image/webp');
    if (firma.publicUrl) guardado = adaptarMaterial(await api<any>(`/admin/materiales/${encodeURIComponent(guardado.id)}`, { method: 'PATCH', json: { portada: firma.publicUrl } }));
  }
  if (guardado.estado !== estadoFinal) guardado = adaptarMaterial(await api<any>(`/admin/materiales/${encodeURIComponent(guardado.id)}`, { method: 'PATCH', json: { estado: estadoFinal } }));
  Datos.hidratarAdmin('materiales', reemplazar(Datos.materiales(), guardado));
  cargados.add('materiales');
  return guardado;
}

export async function borrarMaterialAdmin(id: string) {
  if (Datos.modo === 'demo') Datos.borrarMaterial(id);
  else { await api(`/admin/materiales/${encodeURIComponent(id)}`, { method: 'DELETE' }); Datos.hidratarAdmin('materiales', Datos.materiales().filter((m) => m.id !== id)); }
}

export async function guardarEventoAdmin(e: Evento, nuevo: boolean) {
  if (Datos.modo === 'demo') { Datos.guardarEvento(e); return e; }
  const payload: any = { id: e.id, titulo: e.titulo, ponente: e.ponente, fecha: e.fecha, duracionMin: e.duracionMin, enlace: e.enlace || null, cursoId: e.cursoId || null, publicado: e.publicado !== false };
  if (!nuevo) delete payload.id;
  const guardado = adaptarEvento(await api<any>(nuevo ? '/admin/eventos' : `/admin/eventos/${encodeURIComponent(e.id)}`, { method: nuevo ? 'POST' : 'PATCH', json: payload }));
  Datos.hidratarAdmin('eventos', reemplazar(Datos.eventos(), guardado));
  cargados.add('eventos');
  return guardado;
}

export async function borrarEventoAdmin(id: string) {
  if (Datos.modo === 'demo') Datos.borrarEvento(id);
  else { await api(`/admin/eventos/${encodeURIComponent(id)}`, { method: 'DELETE' }); Datos.hidratarAdmin('eventos', Datos.eventos().filter((e) => e.id !== id)); }
}

export async function guardarQuizAdmin(q: Quiz) {
  if (Datos.modo === 'demo') { Datos.guardarQuiz(q); return q; }
  const guardado = await api<Quiz>(`/admin/quizzes/${encodeURIComponent(q.id)}`, { method: 'PATCH', json: { preguntas: q.preguntas, estado: q.estado } });
  Datos.hidratarAdmin('quizzes', reemplazar(Datos.quizzes(), guardado));
  cargados.add('quizzes');
  return guardado;
}

export async function guardarCortesiaAdmin(uid: string, dias: number, motivo: string) {
  if (Datos.modo === 'demo') {
    const m = Datos.miembros().find((x) => x.uid === uid)!;
    const base = m.cortesiaHasta && new Date(m.cortesiaHasta).getTime() > Date.now() ? new Date(m.cortesiaHasta).getTime() : Date.now();
    m.cortesiaHasta = new Date(base + dias * 864e5).toISOString(); m.cortesiaMotivo = motivo; Datos.guardarMiembro(m); return;
  }
  await api(`/admin/miembros/${encodeURIComponent(uid)}/cortesia`, { method: 'POST', json: { dias, motivo } });
  cargados.delete(`miembro:${uid}`);
}

export async function revocarCortesiaAdmin(uid: string) {
  if (Datos.modo === 'demo') { const m = Datos.miembros().find((x) => x.uid === uid)!; m.cortesiaHasta = null; m.cortesiaMotivo = ''; Datos.guardarMiembro(m); return; }
  await api(`/admin/miembros/${encodeURIComponent(uid)}/cortesia`, { method: 'DELETE' });
  cargados.delete(`miembro:${uid}`);
}

export async function moderarHiloAdmin(id: string, oculto: boolean) {
  if (Datos.modo === 'demo') Comunidad.alternarOculto(id);
  else { await api(`/admin/foro/${encodeURIComponent(id)}`, { method: 'PATCH', json: { oculto } }); cargados.delete('foro'); }
}

export async function publicarAvisoAdmin(aviso: Omit<Aviso, 'id' | 'fecha'>) {
  if (Datos.modo === 'demo') { Datos.publicarAviso(aviso); return; }
  const enlace = aviso.enlace?.startsWith('#/') ? `/${aviso.enlace}` : aviso.enlace;
  const guardado = await api<Aviso>('/admin/avisos', { method: 'POST', json: { ...aviso, enlace: enlace || null } });
  Datos.hidratarAdmin('avisos', [guardado, ...Datos.avisos()]);
  cargados.add('avisos');
}

export async function guardarConfigAdmin(c: Config) {
  if (Datos.modo === 'demo') { Datos.guardarConfig(c); return; }
  const guardada = adaptarConfig(await api('/admin/config', { method: 'PATCH', json: { precios: { mensual: c.precioMensual, anual: c.precioAnual }, descuentoVIP: c.descuentoVIP, whatsappSoporte: c.whatsappSoporte, canalWhatsApp: c.canalWhatsApp, praxiaUrl: c.praxiaUrl } }));
  Datos.hidratarAdmin('config', guardada);
  cargados.add('config');
}
