// Auditoría agregada y de solo lectura para comprobar que las membresías del
// portal anterior pueden resolverse contra Firebase Auth. Nunca imprime PII.
import { cert, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { membresiaVigente } from '../src/lib/acceso.js';
import { leerCuentaDeServicio } from '../src/lib/cuenta-servicio.js';

const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!raw) throw new Error('Falta FIREBASE_SERVICE_ACCOUNT');
const cuenta = leerCuentaDeServicio(raw);
const app = initializeApp({ credential: cert(cuenta), projectId: cuenta.project_id });
const db = getFirestore(app);
const auth = getAuth(app);
const ahora = new Date();

const usuarios = [];
let pageToken;
do {
  const page = await auth.listUsers(1000, pageToken);
  usuarios.push(...page.users);
  pageToken = page.pageToken;
} while (pageToken);

const porUid = new Map(usuarios.map((u) => [u.uid, u]));
const porEmail = new Map(usuarios.filter((u) => u.email).map((u) => [u.email.toLowerCase(), u]));
const snap = await db.collection('miembros').get();
const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
const vigentes = docs.filter((m) => membresiaVigente(m, ahora));
const resolver = (m) => porUid.get(m.uid || m.id) || porEmail.get(String(m.email || '').toLowerCase()) || null;
const authResueltos = new Set(docs.map(resolver).filter(Boolean).map((u) => u.uid));
const vigentesResueltos = new Set(vigentes.map(resolver).filter(Boolean).map((u) => u.uid));
const emails = docs.map((m) => String(m.email || '').toLowerCase()).filter(Boolean);
const duplicados = new Set(emails.filter((e, i) => emails.indexOf(e) !== i));

console.log(JSON.stringify({
  proyecto: cuenta.project_id,
  auditadoEn: ahora.toISOString(),
  authUsuarios: usuarios.length,
  miembrosDocumentos: docs.length,
  miembrosVigentes: vigentes.length,
  documentosEmailLegacy: docs.filter((m) => m.id.startsWith('email_')).length,
  vigentesEmailLegacy: vigentes.filter((m) => m.id.startsWith('email_')).length,
  documentosConStripe: docs.filter((m) => m.stripeCustomerId || m.stripeSubscriptionId).length,
  usuariosAuthConRegistroHeredado: authResueltos.size,
  usuariosAuthConAccesoVigente: vigentesResueltos.size,
  vigentesSinUsuarioAuth: vigentes.filter((m) => !resolver(m)).length,
  correosDuplicados: duplicados.size,
}, null, 2));
