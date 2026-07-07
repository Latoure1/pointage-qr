/* Service worker minimal : rend la PWA installable et sert l'app shell.
   Le scan nécessite le réseau (envoi au serveur), donc pas de cache agressif. */
const CACHE = 'pointage-v2';
const SHELL = ['index.html', 'manifest.json'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; })
                            .map(function (k) { return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (e) {
  const url = e.request.url;
  // Jamais de cache pour les appels API ni les CDN dynamiques
  if (url.indexOf('script.google.com') !== -1 || url.indexOf('unpkg.com') !== -1) return;
  e.respondWith(
    caches.match(e.request).then(function (r) { return r || fetch(e.request); })
  );
});