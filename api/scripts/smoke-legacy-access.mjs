// Prueba una cuenta heredada real sin conocer ni cambiar su contraseña. Crea un
// token efímero y solo imprime resultados agregados; no muestra PII.
import { cert, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { membresiaVigente } from '../src/lib/acceso.js';
import { leerCuentaDeServicio } from '../src/lib/cuenta-servicio.js';

const cuenta = leerCuentaDeServicio(process.env.FIREBASE_SERVICE_ACCOUNT);
const apiUrl = String(process.env.API_URL || '').replace(/\/$/, '');
const webKey = process.env.FIREBASE_WEB_API_KEY;
if (!cuenta || !apiUrl || !webKey) throw new Error('Faltan FIREBASE_SERVICE_ACCOUNT, API_URL o FIREBASE_WEB_API_KEY.');
const app = initializeApp({ credential: cert(cuenta), projectId: cuenta.project_id });
const db = getFirestore(app);
const auth = getAuth(app);

const miembros = (await db.collection('miembros').get()).docs.map((d) => ({ id: d.id, ...d.data() }));
let elegido;
let usuario;
for (const m of miembros.filter((x) => membresiaVigente(x, new Date()))) {
  try {
    usuario = m.uid ? await auth.getUser(m.uid) : await auth.getUser(m.id);
  } catch {
    try { usuario = m.email ? await auth.getUserByEmail(String(m.email).toLowerCase()) : null; } catch { usuario = null; }
  }
  if (usuario) { elegido = m; break; }
}
if (!elegido || !usuario) throw new Error('No hay una membresía heredada vigente con cuenta Auth resoluble.');

const customToken = await auth.createCustomToken(usuario.uid);
const signIn = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${encodeURIComponent(webKey)}`, {
  method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token: customToken, returnSecureToken: true }),
});
if (!signIn.ok) throw new Error(`Firebase rechazó el token efímero (${signIn.status}).`);
const { idToken } = await signIn.json();
const headers = { authorization: `Bearer ${idToken}` };
const [meRes, catalogoRes] = await Promise.all([fetch(`${apiUrl}/me`, { headers }), fetch(`${apiUrl}/catalogo`, { headers })]);
const me = await meRes.json();
const catalogo = await catalogoRes.json();
if (!meRes.ok || me.esVip !== true) throw new Error(`La cuenta heredada no fue reconocida como VIP (${meRes.status}).`);
if (!catalogoRes.ok || !Array.isArray(catalogo.cursos)) throw new Error(`El catálogo no cargó (${catalogoRes.status}).`);
console.log(JSON.stringify({ ok: true, vipHeredado: true, planPresente: !!me.plan, cursos: catalogo.cursos.length, materiales: catalogo.materiales?.length ?? 0 }));
