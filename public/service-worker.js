const CACHE_NAME = 'registro-ejercicios-cache-v1';
const urlsToCache = [
  '.',
  './index.html',
  './manifest.json',
  './service-worker.js'
  // Agrega aquí otros recursos como iconos o fuentes si es necesario.
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Abriendo cache y agregando recursos...');
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      )
    )
  );
});
