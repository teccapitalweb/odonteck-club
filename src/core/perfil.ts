// Perfil del miembro. Provisional en localStorage; en Fase 2 viene de Firebase Auth + miembros/{uid}.
export type PlanPerfil = 'mensual' | 'anual' | 'cortesia' | 'admin' | 'invitado';
export interface Perfil { nombre: string; whatsapp: string; especialidad: string; ciudad: string; plan: PlanPerfil; vence: string; recorridoVisto?: boolean; avisos: { enVivo: boolean; nuevos: boolean; comunidad: boolean } }
const KEY = 'odonteck-club:perfil:v1';
const DEF: Perfil = { nombre: 'Dra. Fernanda Ramírez', whatsapp: '', especialidad: '', ciudad: '', plan: 'anual', vence: '2027-03-15', avisos: { enVivo: true, nuevos: true, comunidad: false } };
const DEF_API: Perfil = { nombre: 'Mi cuenta', whatsapp: '', especialidad: '', ciudad: '', plan: 'invitado', vence: '', avisos: { enVivo: true, nuevos: true, comunidad: true } };
const api = !!import.meta.env.VITE_API_URL;
let cuenta: string | null = null;
let actualApi: Perfil = { ...DEF_API };

export const Perfil = {
  seleccionarCuenta(uid: string | null) { if (cuenta !== uid) { cuenta = uid; actualApi = { ...DEF_API }; } },
  get(): Perfil { if (api) return actualApi; try { return { ...DEF, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { return DEF; } },
  set(p: Partial<Perfil>) { if (api) { actualApi = { ...actualApi, ...p }; return; } try { localStorage.setItem(KEY, JSON.stringify({ ...this.get(), ...p })); } catch {} },
  hidratar(perfil: Partial<Perfil>, plan?: string | null, vence?: string | null) {
    const planes: PlanPerfil[] = ['mensual', 'anual', 'cortesia', 'admin', 'invitado'];
    const planUi: PlanPerfil = planes.includes(plan as PlanPerfil) ? plan as PlanPerfil : 'invitado';
    this.set({ ...perfil, plan: planUi, vence: vence || '' });
  },
  planNombre: (plan?: PlanPerfil) => {
    const actual = plan || Perfil.get().plan;
    return ({ mensual: 'VIP mensual', anual: 'VIP anual', cortesia: 'VIP cortesía', admin: 'VIP administrador', invitado: 'Plan gratis' } as Record<PlanPerfil, string>)[actual];
  },
  iniciales() { const n = this.get().nombre?.trim() || 'OT'; return n.replace(/^(Dra?\.|Ing\.|Lic\.)\s*/i, '').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || 'OT'; },
  primerNombre() { return this.get().nombre.replace(/^(Dra?\.|Ing\.|Lic\.)\s*/i, '').split(' ')[0]; },
  tratamiento() { const n = this.get().nombre; const m = n.match(/^(Dra?\.)/i); return m ? `${m[1]} ${n.replace(/^(Dra?\.)\s*/i, '').split(' ').pop()}` : n.split(' ')[0]; },
};
