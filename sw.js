// HYBRID SYSTEM — Service Worker v4
// Estratégia: Network First para index.html (sempre busca versão nova)
const CACHE = 'hybrid-system-v4';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  // Apaga todos os caches antigos
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // index.html — sempre busca da rede primeiro, nunca do cache
  if (url.pathname.endsWith('/') || url.pathname.endsWith('index.html')) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }

  // Fontes e outros recursos — cache normal
  e.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(e.request).then(cached => {
        const fetchPromise = fetch(e.request).then(response => {
          cache.put(e.request, response.clone());
          return response;
        });
        return cached || fetchPromise;
      })
    )
  );
});
