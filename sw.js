const CACHE_NAME = 'chain-tracker-v3';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg'
];

// Install Event: Cache Core Assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Wir cachen nur das absolut Nötigste vorab. 
      // Alles andere (JS, TSX, CSS) wird dynamisch beim ersten Laden gecacht.
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
  return self.clients.claim();
});

// Fetch Event: Network First, falling back to Cache
self.addEventListener('fetch', (event) => {
  // Nur GET Requests cachen
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Wir cachen ALLES, was erfolgreich geladen wurde (auch Tailwind CDN, Fonts, etc.)
        // Wichtig: Wir klonen die Response, da sie nur einmal gelesen werden kann.
        const responseToCache = networkResponse.clone();
        
        caches.open(CACHE_NAME).then((cache) => {
          // Fehler beim Cachen abfangen (z.B. Quota exceeded), damit die App nicht crasht
          try {
              cache.put(event.request, responseToCache);
          } catch (err) {
              console.warn('Cache put failed for', event.request.url, err);
          }
        });
        
        return networkResponse;
      })
      .catch(() => {
        // OFFLINE FALLBACK
        
        // 1. Versuch: Exakter Match oder Match ohne Query-Params (WICHTIG für Vite!)
        // Vite hängt oft ?t=... an URLs an. 'ignoreSearch: true' ignoriert das beim Suchen.
        return caches.match(event.request, { ignoreSearch: true })
          .then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }

            // 2. Fallback für Navigation (HTML):
            // Wenn der User offline die Seite neu lädt (z.B. / oder /index.html),
            // aber der genaue Request nicht im Cache ist, geben wir die index.html zurück.
            if (event.request.mode === 'navigate') {
                return caches.match('/index.html');
            }

            return null;
          });
      })
  );
});