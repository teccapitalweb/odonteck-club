// Pruebas de firestore.rules y storage.rules contra el emulador.
// Se saltan solas si no hay emulador: córrelas con `npm run test:rules` (requiere Java).
import { readFileSync } from 'node:fs';
import { after, before, describe, test } from 'node:test';

const HAY_FIRESTORE = Boolean(process.env.FIRESTORE_EMULATOR_HOST);
const HAY_STORAGE = Boolean(process.env.FIREBASE_STORAGE_EMULATOR_HOST);
const MOTIVO = 'sin emulador de Firebase (usa `npm run test:rules`)';

const leer = (archivo) => readFileSync(new URL(`../${archivo}`, import.meta.url), 'utf8');

const COLECCIONES_PRIVADAS = [
  'v2_perfiles', 'v2_cursos', 'v2_progreso', 'v2_materiales', 'v2_eventos', 'v2_foro', 'v2_quizzes',
  'v2_intentos', 'v2_cortesias', 'v2_avisos', 'v2_config', 'v2_suscripciones', 'v2_contadores', 'v2_stripe_eventos',
];

if (!HAY_FIRESTORE) {
  test('reglas de Firestore y Storage', { skip: MOTIVO }, () => {});
} else describe('reglas de Firestore y Storage', () => {
  let env;
  let rut;
  let fs;
  let st;

  before(async () => {
    rut = await import('@firebase/rules-unit-testing');
    fs = await import('firebase/firestore');
    fs.setLogLevel('silent'); // los PERMISSION_DENIED esperados ensucian la salida
    st = await import('firebase/storage');
    const [hostF, portF] = process.env.FIRESTORE_EMULATOR_HOST.split(':');
    const config = {
      projectId: 'demo-odonteck',
      firestore: { rules: leer('firestore.rules'), host: hostF, port: Number(portF) },
    };
    if (HAY_STORAGE) {
      const [hostS, portS] = process.env.FIREBASE_STORAGE_EMULATOR_HOST.split(':');
      config.storage = { rules: leer('storage.rules'), host: hostS, port: Number(portS) };
    }
    env = await rut.initializeTestEnvironment(config);
    await env.withSecurityRulesDisabled(async (ctx) => {
      const db = ctx.firestore();
      await fs.setDoc(fs.doc(db, 'v2_certificados', 'ODT-2026-00001'), { folio: 'ODT-2026-00001', nombre: 'Ana' });
      for (const c of COLECCIONES_PRIVADAS) await fs.setDoc(fs.doc(db, c, 'doc1'), { x: 1 });
      await fs.setDoc(fs.doc(db, 'v2_foro', 'doc1', 'respuestas', 'r1'), { texto: 'hola' });
    });
  });

  after(async () => {
    await env?.cleanup();
  });

  test('certificados: get público, sin list ni escritura', async () => {
    const anon = env.unauthenticatedContext().firestore();
    await rut.assertSucceeds(fs.getDoc(fs.doc(anon, 'v2_certificados', 'ODT-2026-00001')));
    await rut.assertFails(fs.getDocs(fs.collection(anon, 'v2_certificados')));
    const adminDb = env.authenticatedContext('adm', { admin: true }).firestore();
    await rut.assertFails(fs.getDocs(fs.collection(adminDb, 'v2_certificados')));
    await rut.assertFails(fs.setDoc(fs.doc(adminDb, 'v2_certificados', 'ODT-2026-00002'), { folio: 'x' }));
  });

  test('resto de v2_*: sin lectura ni escritura desde el cliente, ni siquiera admin', async () => {
    const contextos = [
      env.unauthenticatedContext().firestore(),
      env.authenticatedContext('vip1').firestore(),
      env.authenticatedContext('adm', { admin: true }).firestore(),
    ];
    for (const db of contextos) {
      for (const c of COLECCIONES_PRIVADAS) {
        await rut.assertFails(fs.getDoc(fs.doc(db, c, 'doc1')));
        await rut.assertFails(fs.setDoc(fs.doc(db, c, 'nuevo'), { x: 1 }));
      }
      await rut.assertFails(fs.getDoc(fs.doc(db, 'v2_foro', 'doc1', 'respuestas', 'r1')));
      await rut.assertFails(fs.setDoc(fs.doc(db, 'v2_progreso', 'vip1_curso-a'), { vistas: [1, 2, 3] }));
    }
  });

  test('storage: portadas públicas, PDFs cerrados', { skip: !HAY_STORAGE && 'sin emulador de Storage' }, async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      const s = ctx.storage();
      await st.uploadString(st.ref(s, 'materiales/guia.pdf'), 'pdf');
      await st.uploadString(st.ref(s, 'materiales/portadas/guia.webp'), 'img');
    });
    const anon = env.unauthenticatedContext().storage();
    const vip = env.authenticatedContext('vip1').storage();
    await rut.assertSucceeds(st.getDownloadURL(st.ref(anon, 'materiales/portadas/guia.webp')));
    await rut.assertFails(st.getDownloadURL(st.ref(vip, 'materiales/guia.pdf')));
    await rut.assertFails(st.uploadString(st.ref(vip, 'materiales/otro.pdf'), 'x'));
    await rut.assertFails(st.uploadString(st.ref(vip, 'materiales/portadas/otra.webp'), 'x'));
  });
});
