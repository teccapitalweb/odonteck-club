// Cruce agregado y de solo lectura entre Stripe y `miembros`. No imprime PII,
// IDs de clientes, suscripciones, correos ni nombres.
import { cert, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import Stripe from 'stripe';
import { membresiaVigente } from '../src/lib/acceso.js';
import { leerCuentaDeServicio } from '../src/lib/cuenta-servicio.js';

const cuenta = leerCuentaDeServicio(process.env.FIREBASE_SERVICE_ACCOUNT);
if (!cuenta) throw new Error('Falta FIREBASE_SERVICE_ACCOUNT');
if (!process.env.STRIPE_SECRET_KEY) throw new Error('Falta STRIPE_SECRET_KEY');
const app = initializeApp({ credential: cert(cuenta), projectId: cuenta.project_id });
const db = getFirestore(app);
const auth = getAuth(app);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const ahora = new Date();

const usuarios = [];
let authPage;
do {
  const page = await auth.listUsers(1000, authPage);
  usuarios.push(...page.users);
  authPage = page.pageToken;
} while (authPage);
const authUids = new Set(usuarios.map((u) => u.uid));
const authEmails = new Set(usuarios.filter((u) => u.email).map((u) => u.email.toLowerCase()));

const memberSnap = await db.collection('miembros').get();
const miembros = memberSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
const subIds = new Set(miembros.map((m) => m.stripeSubscriptionId).filter(Boolean));
const customerIds = new Set(miembros.map((m) => m.stripeCustomerId).filter(Boolean));
const resuelveAuth = (m) => authUids.has(m.uid || m.id) || authEmails.has(String(m.email || '').toLowerCase());

const todas = [];
let startingAfter;
do {
  const page = await stripe.subscriptions.list({ status: 'all', limit: 100, ...(startingAfter ? { starting_after: startingAfter } : {}) });
  todas.push(...page.data);
  startingAfter = page.has_more ? page.data.at(-1)?.id : undefined;
} while (startingAfter && todas.length < 5000);

const odonteck = todas.filter((s) =>
  s.metadata?.source === 'odonteck-panel' || subIds.has(s.id) || customerIds.has(typeof s.customer === 'string' ? s.customer : s.customer?.id)
);
const facturando = odonteck.filter((s) => ['active', 'trialing', 'past_due'].includes(s.status));
const docDe = (s) => miembros.find((m) =>
  m.stripeSubscriptionId === s.id || m.stripeCustomerId === (typeof s.customer === 'string' ? s.customer : s.customer?.id)
);
const periodoFin = (s) => s.current_period_end ?? Math.max(0, ...(s.items?.data ?? []).map((i) => Number(i.current_period_end) || 0));
const sinDoc = facturando.filter((s) => !docDe(s));
const docNoVigente = facturando.filter((s) => {
  const m = docDe(s);
  return m && !membresiaVigente(m, ahora);
});
const sinAuth = facturando.filter((s) => {
  const m = docDe(s);
  return !m || !resuelveAuth(m);
});
const anomalias = facturando
  .filter((s) => !docDe(s) || !membresiaVigente(docDe(s), ahora) || !resuelveAuth(docDe(s)))
  .map((s, i) => {
    const m = docDe(s);
    return {
      caso: i + 1,
      estadoStripe: s.status,
      cancelaAlFinal: s.cancel_at_period_end === true,
      periodoStripeVigente: Number(periodoFin(s)) * 1000 > ahora.getTime(),
      tieneDocumento: !!m,
      documentoPorCorreo: !!m?.id?.startsWith('email_'),
      tieneUidHeredado: !!m?.uid,
      tieneEmailHeredado: !!m?.email,
      accesoFirestoreVigente: !!m && membresiaVigente(m, ahora),
      cuentaAuthResuelta: !!m && resuelveAuth(m),
      flagActiva: m?.activa === true || m?.activo === true || m?.esRegalo === true,
      tieneFechaFin: !!(m?.expiraEn || m?.fechaFinAcceso || m?.fechaProximaRenovacion),
    };
  });

console.log(JSON.stringify({
  auditadoEn: ahora.toISOString(),
  suscripcionesStripeRevisadas: todas.length,
  suscripcionesOdonTeckIdentificadas: odonteck.length,
  suscripcionesOdonTeckFacturando: facturando.length,
  facturandoSinDocumentoMiembro: sinDoc.length,
  facturandoConMiembroNoVigente: docNoVigente.length,
  facturandoSinCuentaAuthResuelta: sinAuth.length,
  facturandoCancelacionProgramada: facturando.filter((s) => s.cancel_at_period_end === true).length,
  anomalias,
}, null, 2));
