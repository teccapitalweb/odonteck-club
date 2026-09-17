#!/usr/bin/env node
// Pone (o quita) el custom claim `admin: true` a un usuario de Firebase Auth.
//
// Uso:
//   FIREBASE_SERVICE_ACCOUNT='<json o base64>' node scripts/set-admin.mjs persona@correo.com
//   FIREBASE_SERVICE_ACCOUNT='<json o base64>' node scripts/set-admin.mjs persona@correo.com --quitar
//
// El usuario debe cerrar sesión y volver a entrar (o refrescar su token) para que el claim aplique.
import { cert, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { leerCuentaDeServicio } from '../src/lib/cuenta-servicio.js';

const args = process.argv.slice(2);
const quitar = args.includes('--quitar');
const email = args.find((a) => !a.startsWith('--'));

if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
  console.error('Uso: node scripts/set-admin.mjs <email> [--quitar]');
  process.exit(1);
}

let cuenta;
try {
  cuenta = leerCuentaDeServicio(process.env.FIREBASE_SERVICE_ACCOUNT);
} catch (e) {
  console.error(`FIREBASE_SERVICE_ACCOUNT no es válido: ${e.message}`);
  process.exit(1);
}
if (!cuenta) {
  console.error('Me niego a continuar: falta FIREBASE_SERVICE_ACCOUNT. Defínela explícitamente con la cuenta de servicio de club-odonteck.');
  console.error('(No se usan credenciales por defecto de la máquina a propósito.)');
  process.exit(1);
}

initializeApp({ credential: cert(cuenta) });
const auth = getAuth();

try {
  const usuario = await auth.getUserByEmail(email);
  const claims = { ...(usuario.customClaims ?? {}) };
  if (quitar) delete claims.admin;
  else claims.admin = true;
  await auth.setCustomUserClaims(usuario.uid, claims);
  console.log(`${quitar ? 'Quitado' : 'Puesto'} el claim admin a ${email} (uid ${usuario.uid}) en el proyecto ${cuenta.project_id}.`);
  console.log('Pídele que cierre sesión y vuelva a entrar para que el cambio aplique.');
} catch (e) {
  if (e?.code === 'auth/user-not-found') {
    console.error(`No existe un usuario con el correo ${email}. Debe iniciar sesión en el club al menos una vez.`);
  } else {
    console.error(`No se pudo actualizar el claim: ${e.message}`);
  }
  process.exit(1);
}
