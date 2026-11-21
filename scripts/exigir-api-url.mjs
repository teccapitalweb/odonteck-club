// Exige VITE_API_URL antes de un build de producción. Evita que `npm run build:prod`
// genere en silencio el bundle DEMO (semillas + localStorage) y que ese bundle
// termine publicado en el dominio oficial.
const url = (process.env.VITE_API_URL || '').trim();

if (!url) {
  console.error('\n✖ Build de producción abortado: falta VITE_API_URL.');
  console.error('  Sin esa variable, `npm run build` genera el modo DEMO (semillas + localStorage),');
  console.error('  que no debe publicarse. Define la API antes de construir, por ejemplo:');
  console.error("    PowerShell: $env:VITE_API_URL='https://api-production-db314.up.railway.app'; npm run build:prod");
  console.error("    bash:       VITE_API_URL=https://api-production-db314.up.railway.app npm run build:prod\n");
  process.exit(1);
}

if (!/^https:\/\/\S+$/.test(url)) {
  console.error(`\n✖ VITE_API_URL no parece una URL https válida: "${url}"\n`);
  process.exit(1);
}

console.log(`✓ Build de producción con VITE_API_URL=${url}`);
