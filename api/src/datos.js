// Acceso a Firestore compartido por las rutas: nombres de colecciones y lecturas comunes.
import { esVip, expiracionMiembro, cortesiaVigente, membresiaVigente, suscripcionVigente } from './lib/acceso.js';
import { aISO } from './lib/fechas.js';

export const COL = Object.freeze({
  // Colección vieja: SOLO LECTURA hasta el cambio definitivo.
  miembros: 'miembros',
  perfiles: 'v2_perfiles',
  cursos: 'v2_cursos',
  progreso: 'v2_progreso',
  certificados: 'v2_certificados',
  materiales: 'v2_materiales',
  eventos: 'v2_eventos',
  foro: 'v2_foro',
  respuestas: 'respuestas', // subcolección de v2_foro/{hiloId}
  quizzes: 'v2_quizzes',
  intentos: 'v2_intentos',
  cortesias: 'v2_cortesias',
  avisos: 'v2_avisos',
  config: 'v2_config',
  encuestasEstado: 'v2_encuestas_estado',
  encuestasRespuestas: 'v2_encuestas_respuestas',
  retosEstado: 'v2_retos_estados',
  recompensasEstado: 'v2_recompensas_estado',
  recompensasMovimientos: 'v2_recompensas_movimientos',
  recompensasCanjes: 'v2_recompensas_canjes',
  directorioPerfiles: 'v2_directorio_perfiles',
  directorioOportunidades: 'v2_directorio_oportunidades',
  directorioConexiones: 'v2_directorio_conexiones',
  // Añadidas por el backend (no están en el contrato, ver README):
  suscripciones: 'v2_suscripciones',
  contadores: 'v2_contadores',
  stripeEventos: 'v2_stripe_eventos',
});

export const AVISOS_POR_DEFECTO = Object.freeze({ enVivo: true, nuevos: true, comunidad: true });

export const CONFIG_POR_DEFECTO = Object.freeze({
  precios: { mensual: 199, anual: 1899 },
  descuentoVIP: 20,
  whatsappSoporte: '',
  canalWhatsApp: '',
  praxiaUrl: '',
  stripePriceMensual: '',
  stripePriceAnual: '',
});

export async function leerDoc(db, coleccion, id) {
  const snap = await db.collection(coleccion).doc(id).get();
  return snap.exists ? snap.data() : null;
}

/**
 * Compatibilidad con el club anterior: la mayoría de los miembros están en
 * `miembros/{uid}`, pero algunas altas manuales/regalos quedaron como
 * `miembros/email_...`. El correo procede del ID token de Firebase y por eso
 * puede usarse como segundo identificador sin aceptar datos del cliente.
 */
export async function leerMiembroHeredado(ctx, usuario) {
  const directo = await leerDoc(ctx.db, COL.miembros, usuario.uid);
  const email = String(usuario.email ?? '').trim().toLowerCase();
  if (!email) return directo;

  const snap = await ctx.db.collection(COL.miembros).where('email', '==', email).limit(10).get();
  const candidatos = [directo, ...snap.docs.map((d) => d.data())].filter(Boolean);
  if (!candidatos.length) return null;

  // Si quedaron dos documentos para el mismo correo, nunca degradar a alguien
  // que todavía tenga una membresía vigente. En empate se conserva el UID.
  const vigente = candidatos.find((m) => membresiaVigente(m, ctx.now()));
  const elegido = vigente ?? directo ?? candidatos[0];
  const conStripe = candidatos.find((m) => m.stripeCustomerId || m.stripeSubscriptionId);
  return conStripe && conStripe !== elegido
    ? {
        ...elegido,
        stripeCustomerId: elegido.stripeCustomerId ?? conStripe.stripeCustomerId,
        stripeSubscriptionId: elegido.stripeSubscriptionId ?? conStripe.stripeSubscriptionId,
      }
    : elegido;
}

export async function leerConfig(db) {
  const guardada = (await leerDoc(db, COL.config, 'general')) ?? {};
  return {
    ...CONFIG_POR_DEFECTO,
    ...guardada,
    precios: { ...CONFIG_POR_DEFECTO.precios, ...(guardada.precios ?? {}) },
  };
}

/**
 * Estado de membresía de un usuario autenticado.
 * @returns {Promise<{ esVip: boolean, esAdmin: boolean, plan: string|null, vence: string|null,
 *   miembro: object|null, cortesia: object|null }>}
 */
export async function estadoMembresia(ctx, usuario) {
  const [miembro, cortesia, suscripcion] = await Promise.all([
    leerMiembroHeredado(ctx, usuario),
    leerDoc(ctx.db, COL.cortesias, usuario.uid),
    leerDoc(ctx.db, COL.suscripciones, usuario.uid),
  ]);
  return calcularEstado(miembro, cortesia, usuario.esAdmin === true, ctx.now(), suscripcion);
}

export function calcularEstado(miembro, cortesia, esAdmin, ahora, suscripcion = null) {
  const vip = esVip(miembro, ahora, { cortesia, esAdmin, suscripcion });
  const nueva = suscripcionVigente(suscripcion, ahora);
  const pagada = membresiaVigente(miembro, ahora) || nueva;
  const conCortesia = cortesiaVigente(cortesia, ahora);
  let plan = miembro?.plan ?? null;
  let vence = null;
  if (nueva && !membresiaVigente(miembro, ahora)) {
    plan = suscripcion.plan ?? plan;
    vence = aISO(suscripcion.periodoFin);
  } else if (pagada) {
    vence = aISO(expiracionMiembro(miembro));
  } else if (conCortesia) {
    plan = 'cortesia';
    vence = aISO(cortesia.hasta);
  } else if (esAdmin) {
    plan = plan ?? 'admin';
  }
  return { esVip: vip, esAdmin, plan, vence, miembro, cortesia, suscripcion, membresiaPagada: pagada, cortesiaVigente: conCortesia };
}

export function perfilConDefectos(perfil, miembro, usuario) {
  return {
    nombre: perfil?.nombre ?? miembro?.nombre ?? usuario?.nombre ?? '',
    whatsapp: perfil?.whatsapp ?? miembro?.whatsapp ?? '',
    especialidad: perfil?.especialidad ?? '',
    ciudad: perfil?.ciudad ?? '',
    intereses: Array.isArray(perfil?.intereses) ? perfil.intereses : [],
    avisos: { ...AVISOS_POR_DEFECTO, ...(perfil?.avisos ?? {}) },
    actualizado: perfil?.actualizado ?? null,
  };
}

/** Nombre que se muestra en foro y certificados. */
export async function nombreVisible(ctx, usuario, miembro) {
  const perfil = await leerDoc(ctx.db, COL.perfiles, usuario.uid);
  const m = miembro === undefined ? await leerMiembroHeredado(ctx, usuario) : miembro;
  const candidato = [perfil?.nombre, m?.nombre, usuario.nombre].find((v) => typeof v === 'string' && v.trim());
  if (candidato) return candidato.trim().slice(0, 80);
  if (usuario.email) return usuario.email.split('@')[0];
  return 'Miembro OdonTeck';
}

export function progresoPublico(p) {
  return {
    vistas: Array.isArray(p?.vistas) ? p.vistas : [],
    ultima: p?.ultima ?? null,
    historial: Array.isArray(p?.historial) ? p.historial : [],
    actualizado: p?.actualizado ?? null,
  };
}

/** Curso para miembros: sin `videoId` en ninguna clase. */
export function cursoPublico(curso) {
  const { clases = [], ...resto } = curso;
  return {
    ...resto,
    clases: (Array.isArray(clases) ? clases : []).map(({ videoId, ficha, ...clase }) => ({
      ...clase,
      ...(ficha ? { ficha: { estado: ficha.estado, version: ficha.version, revisadaPor: ficha.revisadaPor, actualizada: ficha.actualizada } } : {}),
    })),
  };
}
