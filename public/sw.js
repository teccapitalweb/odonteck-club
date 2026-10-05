// OdonTeck Club · service worker
// Navegación: red primero, sin red la última copia. Estáticos propios: responde con caché y actualiza por detrás.
// Nunca toca el backend, Firebase, Stripe ni Bunny.
const VERSION = 'odonteck-club-v2';
const SHELL = ['/', '/manifest.webmanifest', '/brand/icon-192.png', '/brand/logo-horizontal.png', '/offline.html'];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(VERSION).then((c) => Promise.all(SHELL.map((u) => c.add(u).catch(() => null)))));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

const estatico = (url) => /^\/(assets|brand|cursos|fotos|materiales\/portadas|praxia)\//.test(url.pathname);

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/@') || url.pathname.startsWith('/src/') || url.pathname.startsWith('/node_modules/')) return; // servidor de desarrollo

  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then((r) => { const copia = r.clone(); caches.open(VERSION).then((c) => c.put('/', copia)); return r; })
      .catch(() => caches.match('/').then((r) => r || caches.match('/offline.html'))));
    return;
  }
  if (estatico(url)) {
    e.respondWith(caches.open(VERSION).then(async (c) => {
      const hit = await c.match(req);
      const red = fetch(req).then((r) => { if (r.ok) c.put(req, r.clone()); return r; }).catch(() => hit);
      return hit || red;
    }));
  }
});
