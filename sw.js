const CACHE_NAME = 'hariku-cache-v1';
const URLS_TO_CACHE = [
  '/',
  'index.html',
  'style.css',
  'script.js',
  'manifest.json',
  'HariKuNoBG.png',
  'user-icon.png',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js'
];

// Event install: menyimpan aset ke cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// Event fetch: menyajikan aset dari cache
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Jika aset ada di cache, sajikan dari cache.
        // Jika tidak, ambil dari jaringan.
        return response || fetch(event.request);
      })
  );
});

// Event activate: membersihkan cache lama (opsional tapi disarankan)
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});