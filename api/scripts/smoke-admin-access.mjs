// Smoke de solo lectura para el panel administrativo real. Busca una cuenta
// con claim `admin: true`, crea un token efimero y valida las lecturas del
// despliegue sin imprimir PII ni modificar Firestore.
import { cert, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { leerCuentaDeServicio } from '../src/lib/cuenta-servicio.js';

const cuenta = leerCuentaDeServicio(process.env.FIREBASE_SERVICE_ACCOUNT);
const apiUrl = String(process.env.API_URL || '').replace(/\/$/, '');
const webKey = process.env.FIREBASE_WEB_API_KEY;
if (!cuenta || !apiUrl || !webKey) {
  throw new Error('Faltan FIREBASE_SERVICE_ACCOUNT, API_URL o FIREBASE_WEB_API_KEY.');
}

const app = initializeApp({ credential: cert(cuenta), projectId: cuenta.project_id });
const auth = getAuth(app);

let admin;
let pageToken;
do {
  const page = await auth.listUsers(1000, pageToken);
  admin = page.users.find((u) => u.customClaims?.admin === true);
  pageToken = page.pageToken;
} while (!admin && pageToken);

if (!admin) throw new Error('No existe una cuenta con claim admin: true.');

const customToken = await auth.createCustomToken(admin.uid);
const signIn = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${encodeURIComponent(webKey)}`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ token: customToken, returnSecureToken: true }),
});
if (!signIn.ok) throw new Error(`Firebase rechazo el token efimero (${signIn.status}).`);

const { idToken } = await signIn.json();
const headers = { authorization: `Bearer ${idToken}` };
const rutas = [
  ['resumen', '/admin/resumen'],
  ['cursos', '/admin/cursos'],
  ['materiales', '/admin/materiales'],
  ['eventos', '/admin/eventos'],
  ['miembros', '/admin/miembros'],
  ['foro', '/admin/foro'],
  ['quizzes', '/admin/quizzes'],
  ['avisos', '/admin/avisos'],
  ['config', '/admin/config'],
];

const resultados = {};
for (const [nombre, ruta] of rutas) {
  const respuesta = await fetch(`${apiUrl}${ruta}`, { headers });
  const cuerpo = await respuesta.json().catch(() => null);
  if (!respuesta.ok) throw new Error(`${ruta} fallo (${respuesta.status}).`);
  resultados[nombre] = Array.isArray(cuerpo) ? cuerpo.length : 'ok';
}

console.log(JSON.stringify({ ok: true, adminAutenticado: true, lecturas: resultados }));
