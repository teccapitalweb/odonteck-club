// Perfil del miembro. Provisional en localStorage; en Fase 2 viene de Firebase Auth + miembros/{uid}.
export interface Perfil { nombre: string; whatsapp: string; especialidad: string; ciudad: string; plan: 'mensual' | 'anual' | 'invitado'; vence: string; avisos: { enVivo: boolean; nuevos: boolean; comunidad: boolean } }
const KEY = 'odonteck-club:perfil:v1';
const DEF: Perfil = { nombre: 'Dra. Fernanda Ramírez', whatsapp: '', especialidad: '', ciudad: '', plan: 'anual', vence: '2027-03-15', avisos: { enVivo: true, nuevos: true, comunidad: false } };

export const Perfil = {
  get(): Perfil { try { return { ...DEF, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { return DEF; } },
  set(p: Partial<Perfil>) { try { localStorage.setItem(KEY, JSON.stringify({ ...this.get(), ...p })); } catch {} },
  iniciales() { return this.get().nombre.replace(/^(Dra?\.|Ing\.|Lic\.)\s*/i, '').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || 'OT'; },
  primerNombre() { return this.get().nombre.replace(/^(Dra?\.|Ing\.|Lic\.)\s*/i, '').split(' ')[0]; },
  tratamiento() { const n = this.get().nombre; const m = n.match(/^(Dra?\.)/i); return m ? `${m[1]} ${n.replace(/^(Dra?\.)\s*/i, '').split(' ').pop()}` : n.split(' ')[0]; },
};
