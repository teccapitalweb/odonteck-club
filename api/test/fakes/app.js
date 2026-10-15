// Construye la app con dobles y datos de ejemplo para los tests de rutas.
import { crearApp } from '../../src/app.js';
import { FakeFirestore } from './firestore.js';
import { crearAuthFalso, crearMaterialesFalsos, crearStorageFalso, crearStripeFalso } from './servicios.js';

export const AHORA_ISO = '2026-09-17T12:00:00.000Z';
export const WEBHOOK_SECRET = 'whsec_prueba_local';
export const ORIGEN_OK = 'https://club.odonteckconsulting.com';

export const TOKENS = {
  vip: 'tk-vip',
  vip2: 'tk-vip2',
  free: 'tk-free',
  admin: 'tk-admin',
  legacy: 'tk-legacy',
  revocado: 'tk-revocado',
};

export function semillaBase() {
  const pregunta = (q, correcta) => ({ q, opciones: ['A', 'B', 'C'], correcta, explicacion: `Explicación de ${q}` });
  return {
    'miembros/vip1': { activa: true, plan: 'mensual', expiraEn: '2026-12-31T00:00:00.000Z', nombre: 'Dra. Ana VIP', email: 'ana@example.com' },
    'miembros/vip2': { activo: true, plan: 'anual', nombre: 'Dr. Beto VIP', email: 'beto@example.com', fechaAlta: '2026-09-01T00:00:00Z' },
    'miembros/free1': { activa: false, plan: 'mensual', nombre: 'Carla Libre', email: 'carla@example.com', canceladoEn: '2026-09-10T00:00:00Z' },
    'miembros/vencido1': { activa: true, expiraEn: '2026-01-01T00:00:00Z', nombre: 'Vencido' },
    'v2_cursos/curso-a': {
      id: 'curso-a',
      titulo: 'Endodoncia práctica',
      area: 'Endodoncia',
      nivel: 'Intermedio',
      instructor: 'Equipo OdonTeck',
      portada: '/cursos/a.webp',
      descripcion: 'Curso A',
      aprenderas: [],
      orden: 1,
      publicado: true,
      bunnyCollectionId: 'col-a',
      clases: [
        { n: 1, titulo: 'Clase 1', videoId: 'video-a-1', duracionMin: 10, gratis: true, ficha: { estado: 'aprobada', archivo: 'fichas/curso-a/1.pdf', version: '1.0', revisadaPor: 'Equipo OdonTeck', actualizada: '2026-09-16T00:00:00.000Z' } },
        { n: 2, titulo: 'Clase 2', videoId: 'video-a-2', duracionMin: 12, gratis: false },
        { n: 3, titulo: 'Clase 3', videoId: 'video-a-3', duracionMin: null, gratis: false },
      ],
    },
    'v2_cursos/curso-b': {
      id: 'curso-b', titulo: 'Borrador', area: 'Orto', nivel: 'Básico', orden: 2, publicado: false,
      clases: [{ n: 1, titulo: 'Clase 1', videoId: 'video-b-1', gratis: true }],
    },
    'v2_materiales/guia': { id: 'guia', titulo: 'Guía', tipo: 'PDF', estado: 'disponible', gratis: true, archivo: 'materiales/guia.pdf' },
    'v2_materiales/manual-vip': { id: 'manual-vip', titulo: 'Manual VIP', tipo: 'PDF', estado: 'disponible', gratis: false, archivo: 'materiales/manual-vip.pdf' },
    'v2_materiales/secreto': { id: 'secreto', titulo: 'Oculto', tipo: 'PDF', estado: 'oculto', archivo: 'materiales/secreto.pdf' },
    'v2_eventos/ev1': { id: 'ev1', titulo: 'Sesión en vivo', ponente: 'Dr. X', fecha: '2026-10-01T18:00:00.000Z', duracionMin: 60, enlace: 'https://meet.example.com/x', publicado: true, reservas: ['otro-uid'] },
    'v2_eventos/ev-oculto': { id: 'ev-oculto', titulo: 'No publicado', fecha: '2026-10-01T18:00:00.000Z', publicado: false, reservas: [] },
    // Carla eligió «Endodoncia práctica» como su curso gratis: abre las clases 1 y 2; la 3 (última) es VIP.
    'v2_curso_gratis/free1': { uid: 'free1', cursoId: 'curso-a', origen: 'eleccion', elegido: AHORA_ISO, cambios: 0 },
    'v2_quizzes/curso-a_1': { cursoId: 'curso-a', n: 1, estado: 'aprobado', preguntas: [pregunta('P1', 0), pregunta('P2', 1), pregunta('P3', 2)], generado: AHORA_ISO },
    'v2_quizzes/curso-a_2': { cursoId: 'curso-a', n: 2, estado: 'borrador', preguntas: [pregunta('P1', 0)], generado: AHORA_ISO },
    'v2_foro/hilo1': { id: 'hilo1', titulo: 'Duda de conductos', texto: 'Texto', autorUid: 'vip2', autor: 'Dr. Beto VIP', cursoId: null, fecha: '2026-09-15T10:00:00.000Z', util: 0, utilPor: [], oculto: false },
    'v2_foro/hilo-oculto': { id: 'hilo-oculto', titulo: 'Spam', texto: 'Spam', autorUid: 'x', autor: 'x', cursoId: null, fecha: '2026-09-15T11:00:00.000Z', util: 0, utilPor: [], oculto: true },
  };
}

export function crearEntorno({ semilla = semillaBase(), sinStripe = false, sinWebhook = false, sinBunny = false, materialesEmpaquetados = [] } = {}) {
  const reloj = { ahora: new Date(AHORA_ISO) };
  const db = new FakeFirestore(semilla);
  const auth = crearAuthFalso({
    tokens: {
      [TOKENS.vip]: { uid: 'vip1', email: 'ana@example.com', name: 'Ana' },
      [TOKENS.vip2]: { uid: 'vip2', email: 'beto@example.com' },
      [TOKENS.free]: { uid: 'free1', email: 'carla@example.com' },
      [TOKENS.admin]: { uid: 'adm1', email: 'admin@example.com', admin: true },
      [TOKENS.legacy]: { uid: 'legacy-auth-uid', email: 'legacy@example.com', name: 'Legado' },
      [TOKENS.revocado]: { uid: 'vip1', revocado: true },
    },
    usuarios: {
      vip1: { email: 'ana@example.com' },
      free1: { email: 'carla@example.com' },
      adm1: { email: 'admin@example.com', customClaims: { admin: true } },
      'legacy-auth-uid': { email: 'legacy@example.com' },
      solo_auth: { email: 'nuevo@example.com' },
    },
  });
  const storage = crearStorageFalso();
  const materiales = crearMaterialesFalsos(materialesEmpaquetados);
  const stripe = sinStripe ? null : crearStripeFalso();
  const silencioso = { error() {}, warn() {}, info() {} };
  const app = crearApp({
    db,
    auth,
    storage,
    materiales,
    stripe,
    bunny: sinBunny ? null : { libraryId: '725453', tokenAuthKey: 'llave-bunny-prueba', ttlSeconds: 300 },
    now: () => new Date(reloj.ahora),
    logger: silencioso,
    config: {
      appUrl: ORIGEN_OK,
      allowedOrigins: ['http://localhost:5179', `${ORIGEN_OK}/`],
      storageBucket: 'club-odonteck.firebasestorage.app',
      stripeWebhookSecret: sinWebhook ? '' : WEBHOOK_SECRET,
      stripePrices: { mensual: 'price_mensual_test', anual: 'price_anual_test' },
    },
  });
  return { app, db, auth, storage, materiales, stripe, reloj };
}

export const bearer = (token) => ({ Authorization: `Bearer ${token}` });
