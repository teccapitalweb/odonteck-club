import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// Dos sitios en el mismo repo: el club (index.html) y la landing pública (landing/index.html).
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        club: resolve(__dirname, 'index.html'),
        landing: resolve(__dirname, 'landing/index.html'),
      },
    },
  },
});
