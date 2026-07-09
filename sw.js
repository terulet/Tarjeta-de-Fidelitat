const CACHE = 'gelateria-fidelidad-staff-final-escaneo-ok-v1';
const FILES = [
  './',
  './index.html',
  './staff.html',
  './privacidad.html',
  './firebase-config.js',
  './manifest.json',
  './manifest-staff.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './logo-gelateria.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES).catch(()=>{})));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  event.respondWith(
    fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(cache => cache.put(req, copy)).catch(()=>{});
      return res;
    }).catch(() => caches.match(req).then(cached => cached || caches.match('./index.html')))
  );
});
