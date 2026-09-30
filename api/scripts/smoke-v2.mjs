#!/usr/bin/env node
// Prueba de humo autenticada para un API v2 ya desplegado.
// Crea una cuenta técnica efímera mediante un custom token, valida los flujos
// gratuitos esenciales y elimina la cuenta aunque la prueba falle.
import { cert, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { leerCuentaDeServicio } from '../src/lib/cuenta-servicio.js';

const apiUrl = String(process.env.API_URL || '').replace(/\/$/, '');
const webApiKey = String(process.env.FIREBASE_WEB_API_KEY || '');
const origen = String(process.env.SMOKE_ORIGIN || 'https://www.odonteckconsulting.com');
const cuenta = leerCuentaDeServicio(process.env.FIREBASE_SERVICE_ACCOUNT);

if (!apiUrl || !webApiKey || !cuenta) {
  console.error('Faltan API_URL, FIREBASE_WEB_API_KEY o FIREBASE_SERVICE_ACCOUNT.');
  process.exit(1);
}

initializeApp({ credential: cert(cuenta) });
const auth = getAuth();
const uid = `smoke-v2-${Date.now()}`;

async function json(url, init = {}) {
  const res = await fetch(url, init);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${res.status} ${body.mensaje || body.error || res.statusText}`);
  return { res, body };
}

let creado = false;
try {
  const health = await json(`${apiUrl}/health`, { headers: { Origin: origen } });
  if (health.body.ok !== true) throw new Error('/health no confirmó ok=true');
  if (health.res.headers.get('access-control-allow-origin') !== origen) {
    throw new Error(`CORS no autorizó el origen ${origen}`);
  }

  const customToken = await auth.createCustomToken(uid, { smokeTest: true });
  const login = await json(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${encodeURIComponent(webApiKey)}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: customToken, returnSecureToken: true }) },
  );
  creado = true;
  const headers = { Authorization: `Bearer ${login.body.idToken}`, Origin: origen, 'Content-Type': 'application/json' };

  const me = await json(`${apiUrl}/me`, { headers });
  if (me.body.esVip !== false) throw new Error('La cuenta técnica nueva no debe aparecer como VIP');

  const catalogo = await json(`${apiUrl}/catalogo`, { headers });
  if (!Array.isArray(catalogo.body.cursos) || catalogo.body.cursos.length < 1) {
    throw new Error('El catálogo autenticado no devolvió cursos');
  }
  const cursoGratis = catalogo.body.cursos.find((curso) => curso.clases?.some((clase) => clase.gratis === true));
  const claseGratis = cursoGratis?.clases?.find((clase) => clase.gratis === true);
  if (!cursoGratis || !claseGratis) throw new Error('No se encontró una clase gratuita para probar Bunny');

  const video = await json(`${apiUrl}/video/token`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ cursoId: cursoGratis.id, n: claseGratis.n }),
  });
  if (!String(video.body.embedUrl || '').startsWith('https://iframe.mediadelivery.net/embed/')) {
    throw new Error('Bunny no devolvió un embed firmado válido');
  }

  const quiz = await json(`${apiUrl}/quiz/${encodeURIComponent(cursoGratis.id)}/${claseGratis.n}`, { headers });
  if (!Array.isArray(quiz.body.preguntas) || quiz.body.preguntas.length < 1) throw new Error('El quiz gratuito no devolvió preguntas');
  if (quiz.body.preguntas.some((pregunta) => 'correcta' in pregunta || 'explicacion' in pregunta)) {
    throw new Error('El GET del quiz expuso respuestas antes de calificar');
  }

  console.log(`OK health, CORS, Auth, membresía, catálogo (${catalogo.body.cursos.length} cursos), video firmado y quiz seguro.`);
} finally {
  if (creado) await auth.deleteUser(uid).catch(() => {});
}
