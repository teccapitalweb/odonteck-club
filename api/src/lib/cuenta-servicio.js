// Lectura de la cuenta de servicio de Firebase desde variable de entorno.

/** FIREBASE_SERVICE_ACCOUNT puede venir como JSON en una línea o en base64. */
export function leerCuentaDeServicio(valor) {
  const crudo = String(valor ?? '').trim();
  if (!crudo) return null;
  const texto = crudo.startsWith('{') ? crudo : Buffer.from(crudo, 'base64').toString('utf8');
  const cuenta = JSON.parse(texto);
  if (!cuenta.project_id || !cuenta.private_key || !cuenta.client_email) {
    throw new Error('al JSON le faltan project_id, private_key o client_email');
  }
  return cuenta;
}
