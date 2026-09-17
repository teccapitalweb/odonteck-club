// Inicialización perezosa de firebase-admin a partir de FIREBASE_SERVICE_ACCOUNT (JSON en una línea o base64).
// Se importa dinámicamente para que los tests y los dry-run sin credenciales no carguen firebase-admin.

export const PROYECTO_ESPERADO = 'club-odonteck';

/** Decodifica la cuenta de servicio (JSON directo o base64). Nunca imprime su contenido. */
export function decodificarCuentaServicio(valor) {
  if (!valor) throw new Error('Falta FIREBASE_SERVICE_ACCOUNT');
  const texto = valor.trim().startsWith('{') ? valor : Buffer.from(valor, 'base64').toString('utf8');
  let cuenta;
  try {
    cuenta = JSON.parse(texto);
  } catch {
    throw new Error('FIREBASE_SERVICE_ACCOUNT no es JSON válido ni base64 de un JSON');
  }
  if (!cuenta.project_id || !cuenta.client_email || !cuenta.private_key) throw new Error('FIREBASE_SERVICE_ACCOUNT no parece una cuenta de servicio (faltan project_id/client_email/private_key)');
  return cuenta;
}

export async function abrirFirestore(valor = process.env.FIREBASE_SERVICE_ACCOUNT) {
  const cuenta = decodificarCuentaServicio(valor);
  if (cuenta.project_id !== PROYECTO_ESPERADO) {
    throw new Error(`La cuenta de servicio es del proyecto '${cuenta.project_id}', se esperaba '${PROYECTO_ESPERADO}'`);
  }
  const { initializeApp, cert, getApps } = await import('firebase-admin/app');
  const { getFirestore } = await import('firebase-admin/firestore');
  const app = getApps().find((a) => a.name === 'pipeline') ?? initializeApp({ credential: cert(cuenta), projectId: cuenta.project_id }, 'pipeline');
  return getFirestore(app);
}
