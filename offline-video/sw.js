const CACHE_NAME = 'offline-video-cache-v9';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.destination === 'video') {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(event.request).then(response =>
          response ||
          fetch(event.request).then(networkResponse => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          })
        )
      )
    );
    return;
  }
  event.respondWith(fetch(event.request));
});

// Handle video caching on demand
self.addEventListener('message', async event => {
  if (event.data && event.data.type === 'CACHE_VIDEO') {
    const url = event.data.url;
    try {
      const cache = await caches.open(CACHE_NAME);
      const response = await fetch(url, {cache: 'reload'});
      await cache.put(url, response.clone());
      event.ports[0].postMessage({success: true, url});
      // Notify all clients for UI updates
      const clients = await self.clients.matchAll();
      clients.forEach(client => client.postMessage('cache-updated'));
    } catch (e) {
      event.ports[0].postMessage({success: false, url, error: e.message});
    }
  }
});