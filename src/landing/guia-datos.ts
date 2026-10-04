import { Datos } from '../core/datos';

export const marcaGuia = {
  id: 'odonteck',
  nombre: 'OdonTeck',
  asistente: 'Alexia',
  whatsapp: '5212381479365',
  saludo: '/asistente/odonteck-guia-saludo-v05.png',
  orientar: '/asistente/odonteck-guia-orientar-v05.png',
  celebrar: '/asistente/odonteck-guia-celebrar-v05.png',
};

export interface CursoGuia {
  id: string;
  titulo: string;
  area: string;
  imagen: string;
  nivel: string;
  instructor: string;
  descripcion: string;
  clases: number;
  accesoGratis: boolean;
}

export interface DatosGuia {
  fuente: 'demo' | 'api';
  verificadoEn: string | null;
  cursos: CursoGuia[];
  planes: { mensual: number | null; anual: number | null };
}

export type EstadoGuia = 'cargando' | 'listo' | 'error';
export const API_GUIA = ((import.meta.env.VITE_LANDING_API_URL || import.meta.env.VITE_API_URL) as string | undefined)?.replace(/\/$/, '');
export const ES_DEMO_GUIA = !API_GUIA && !import.meta.env.PROD;
export const CLUB_GUIA = (import.meta.env.VITE_CLUB_URL as string | undefined)?.replace(/\/$/, '') || '';
export const escaparGuia = (valor: string) => String(valor).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
export const pesosGuia = (valor: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(valor);

export function datosGuiaDemo(): DatosGuia {
  const config = Datos.config();
  return {
    fuente: 'demo',
    verificadoEn: null,
    planes: { mensual: config.precioMensual, anual: config.precioAnual },
    cursos: Datos.cursos().filter((curso) => curso.publicado !== false).map((curso) => ({
      id: curso.id,
      titulo: curso.titulo,
      area: curso.area,
      imagen: curso.portada,
      nivel: curso.nivel,
      instructor: curso.instructor,
      descripcion: curso.descripcion,
      clases: curso.clases.length,
      accesoGratis: curso.clases.some((clase) => clase.gratis === true),
    })),
  };
}

export async function cargarDatosGuia(): Promise<DatosGuia> {
  if (ES_DEMO_GUIA) return datosGuiaDemo();
  if (!API_GUIA) throw new Error('Falta la API pública de OdonTeck');
  const respuesta = await fetch(`${API_GUIA}/landing/catalogo`, { signal: AbortSignal.timeout(8_000), cache: 'no-store' });
  if (!respuesta.ok) throw new Error('Catálogo público no disponible');
  const datos = await respuesta.json();
  const dinero = (valor: unknown) => valor === null || typeof valor === 'number' && Number.isFinite(valor) && valor >= 0;
  const cursoValido = (curso: any) => curso && typeof curso.id === 'string' && typeof curso.titulo === 'string'
    && typeof curso.area === 'string' && typeof curso.imagen === 'string' && /^\/(?!\/)/.test(curso.imagen)
    && typeof curso.nivel === 'string' && typeof curso.instructor === 'string' && typeof curso.descripcion === 'string'
    && Number.isInteger(curso.clases) && curso.clases >= 0 && typeof curso.accesoGratis === 'boolean';
  if (datos?.fuente !== 'api' || typeof datos.verificadoEn !== 'string' || !Number.isFinite(Date.parse(datos.verificadoEn))
    || !Array.isArray(datos.cursos) || !datos.cursos.every(cursoValido) || !datos.planes
    || !dinero(datos.planes.mensual) || !dinero(datos.planes.anual)) {
    throw new Error('Datos públicos sin verificación');
  }
  return datos as DatosGuia;
}
