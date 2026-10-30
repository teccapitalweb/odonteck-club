import { calcularEstado } from '../datos.js';
import { membresiaVigente, suscripcionVigente } from './acceso.js';

// La misma lectura de acceso para resumen, listado y ficha. Tener acceso no
// demuestra que hubo un cobro: la conciliación de pagos es un proceso distinto.
export function estadoAdministrativo(miembro, cortesia, esAdmin, ahora, suscripcion) {
  const estado = calcularEstado(miembro, cortesia, esAdmin, ahora, suscripcion);
  const historica = membresiaVigente(miembro, ahora);
  const nueva = suscripcionVigente(suscripcion, ahora);
  const origenAcceso = historica
    ? (miembro.esRegalo === true ? 'regalo' : 'historica')
    : nueva ? (suscripcion.estado === 'trialing' ? 'prueba' : 'suscripcion')
      : estado.cortesiaVigente ? 'cortesia' : esAdmin ? 'administrador' : 'sin_acceso';
  return { ...estado, origenAcceso };
}

// Une los documentos heredados por correo únicamente cuando corresponde a
// una sola cuenta de Auth. No cambia ni migra documentos de producción.
export function normalizarMiembros(miembros, usuarios, ahora) {
  const correos = new Map();
  for (const [uid, u] of usuarios) {
    const email = String(u.email ?? '').trim().toLowerCase();
    if (!email) continue;
    correos.set(email, correos.has(email) ? null : uid);
  }
  const resultado = new Map(miembros);
  for (const [id, m] of miembros) {
    if (usuarios.has(id)) continue;
    const uid = correos.get(String(m.email ?? ''));
    if (!uid || uid === id) continue;
    const directo = resultado.get(uid);
    if (!directo || (!membresiaVigente(directo, ahora) && membresiaVigente(m, ahora))) resultado.set(uid, m);
    resultado.delete(id);
  }
  return resultado;
}
