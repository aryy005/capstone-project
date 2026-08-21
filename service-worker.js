const CACHE_NAME = 'aegis-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/index.css',
  './css/splash.css',
  './css/dashboard.css',
  './css/map.css',
  './css/components.css',
  './js/app.js',
  './js/utils/constants.js',
  './js/utils/helpers.js',
  './js/ai/bayesian.js',
  './js/ai/astar.js',
  './js/ai/kmeans.js',
  './js/ai/decision-tree.js',
  './js/ai/monte-carlo.js',
  './js/data/scenarios.js',
  './js/data/simulator.js',
  './js/components/alerts.js',
  './js/components/dashboard.js',
  './js/components/map-manager.js',
  './js/components/resources.js',
  './js/components/comms.js',
  './js/components/charts.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('⚡ AEGIS PWA: Caching app shell assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      const networked = fetch(event.request)
        .then(response => {
          const cacheCopy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, cacheCopy));
          return response;
        })
        .catch(() => cached);
      return cached || networked;
    })
  );
});
