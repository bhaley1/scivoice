const CACHE = 'scivoice-v1';
const ASSETS = [
  '/scivoice/',
  '/scivoice/index.html',
  '/scivoice/microglossary/',
  '/scivoice/microglossary/index.html',
  '/scivoice/microglossary/glossary-data.json',
  '/scivoice/manifest.json',
  '/scivoice/icons/icon-192.png',
  '/scivoice/icons/icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Network-first for API calls and external URLs, cache-first for assets
  if (!e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      const networkFetch = fetch(e.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return response;
      });
      return cached || networkFetch;
    })
  );
});
