import { defineConfig } from 'vite';
import { readdirSync, rmSync, unlinkSync } from 'node:fs';
import { resolve } from 'node:path';

// Dos sitios en el mismo repo: el club (index.html) y la landing pública (landing/index.html).
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [{
    name: 'odonteck-production-safety',
    enforce: 'pre',
    load(id) {
      // En modo API, el catálogo, los IDs de video, las respuestas de quizzes y
      // los miembros demo deben venir del servidor, nunca del bundle público.
      if (!process.env.VITE_API_URL) return null;
      const archivo = id.replace(/\\/g, '/').split('?')[0];
      if (archivo.endsWith('/src/data/catalogo.json')) return '{"libraryId":"725453","cursos":[]}';
      if (
        archivo.endsWith('/src/data/materiales.json') ||
        archivo.endsWith('/src/data/envivo.json') ||
        archivo.endsWith('/src/data/miembros-demo.json') ||
        archivo.endsWith('/src/data/quizzes-demo.json')
      ) return '[]';
      return null;
    },
    writeBundle(opciones) {
      if (!process.env.VITE_API_URL) return;
      const salida = resolve(import.meta.dirname, opciones.dir || 'dist');

      // Los libros completos no se publican sin una auditoría de licencias.
      rmSync(resolve(salida, 'libros'), { recursive: true, force: true });

      // Los PDF se sirven con URL firmada desde Firebase Storage. En dist solo
      // permanecen las portadas y demás imágenes públicas de la biblioteca.
      const materiales = resolve(salida, 'materiales');
      const borrarPdf = (directorio: string) => {
        for (const entrada of readdirSync(directorio, { withFileTypes: true })) {
          const ruta = resolve(directorio, entrada.name);
          if (entrada.isDirectory()) borrarPdf(ruta);
          else if (entrada.name.toLowerCase().endsWith('.pdf')) unlinkSync(ruta);
        }
      };
      try { borrarPdf(materiales); } catch (error: any) {
        if (error?.code !== 'ENOENT') throw error;
      }
    },
  }],
  build: {
    rollupOptions: {
      input: {
        club: resolve(import.meta.dirname, 'index.html'),
        landing: resolve(import.meta.dirname, 'landing/index.html'),
      },
      output: {
        // El set completo de íconos de lucide y el SDK de Firebase son
        // dependencias grandes y estables. Separarlas del código de la app
        // baja el chunk principal y las deja cacheadas entre despliegues
        // (el código de la app cambia en cada deploy; estas librerías no).
        manualChunks(id) {
          const ruta = id.replace(/\\/g, '/');
          if (ruta.includes('/node_modules/lucide')) return 'lucide';
          if (ruta.includes('/node_modules/@firebase') || ruta.includes('/node_modules/firebase')) return 'firebase';
          return undefined;
        },
      },
    },
  },
});
