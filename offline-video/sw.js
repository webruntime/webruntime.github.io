const CACHE_NAME = 'offline-video-cache-v9';

self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  const request = event.request;

  // Handle video caching
  if (request.destination === 'video') {
    event.respondWith(
      caches.open(CACHE_NAME).then(async cache => {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
          return cachedResponse; // Serve from cache if available
        }

        // Fetch the full video response (remove Range header)
        const modifiedRequest = new Request(request.url, {
          method: request.method,
          headers: [...request.headers].filter(([key]) => key.toLowerCase() !== 'range'),
          mode: request.mode,
          credentials: request.credentials,
          redirect: request.redirect,
        });

        return fetch(modifiedRequest).then(response => {
          if (!response.ok || response.status !== 200) {
            throw new Error(`Failed to fetch video: ${response.statusText}`);
          }
          cache.put(request, response.clone()); // Cache the full response
          return response;
        });
      })
    );
    return;
  }

  // Default fetch behavior for non-video requests
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      return cachedResponse || fetch(request);
    })
  );
});

// Handle video caching on demand
self.addEventListener('message', async event => {
  if (event.data && event.data.type === 'CACHE_VIDEO') {
    const url = event.data.url;
    try {
      const cache = await caches.open(CACHE_NAME);
      const response = await fetch(url, { cache: 'reload' });
      await cache.put(url, response.clone());
      event.ports[0].postMessage({ success: true, url });
      // Notify all clients for UI updates
      const clients = await self.clients.matchAll();
      clients.forEach(client => client.postMessage('cache-updated'));
    } catch (e) {
      event.ports[0].postMessage({ success: false, url, error: e.message });
    }
  }
});