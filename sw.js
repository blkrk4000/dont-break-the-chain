const CACHE_NAME = 'chain-tracker-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/index.tsx',
  '/manifest.json',
  '/favicon.svg'
];

// Install Event: Cache Core Assets
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Sofort aktivieren, wartet nicht bis Tabs geschlossen sind
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.warn('Pre-caching failed:', err);
      });
    })
  );
});

// Activate Event: Cleanup Old Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim(); // Übernimmt sofort die Kontrolle über alle offenen Tabs
});

// Fetch Event: Network First, falling back to Cache
// Strategie: Wir versuchen immer frische Daten zu holen (Network First).
// Das verhindert den "weißen Bildschirm" bei Code-Änderungen.
self.addEventListener('fetch', (event) => {
  // Nur GET Requests cachen
  if (event.request.method !== 'GET') return;

  // Browser-Sync oder Hot-Module-Replacement Requests von Vite ignorieren wir im Cache meist,
  // aber für die Produktion ist diese Strategie sicher.
  
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Erfolgreichen Request in den Cache legen (Update des Caches on-the-fly)
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => {
        // Bei Netzwerkfehler (Offline) aus dem Cache lesen
        return caches.match(event.request);
      })
  );
});