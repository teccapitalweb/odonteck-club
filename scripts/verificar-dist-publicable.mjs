// Verifica que dist/ sea un build de producción (modo API) antes de publicarlo con
// Wrangler. Falla cerrado: si no hay marcador o el modo no es "api", rechaza, para
// que un `wrangler pages deploy dist` manual nunca suba el modo DEMO al dominio.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const dist = resolve(process.argv[2] || 'dist');
const marcador = resolve(dist, '_build-info.json');

let info;
try {
  info = JSON.parse(readFileSync(marcador, 'utf8'));
} catch {
  console.error(`\n✖ No se puede publicar: falta ${marcador}.`);
  console.error('  Reconstruye con `npm run build:prod` (requiere VITE_API_URL) antes de desplegar.\n');
  process.exit(1);
}

if (info.modo !== 'api') {
  console.error(`\n✖ dist/ está en modo "${info.modo}" (DEMO). No se publica.`);
  console.error('  Reconstruye con VITE_API_URL definida: `npm run build:prod`.\n');
  process.exit(1);
}

console.log(`✓ dist/ es un build de producción (modo api, ${info.apiUrl ? 'con API' : 'sin API'}, ${info.generado}).`);
