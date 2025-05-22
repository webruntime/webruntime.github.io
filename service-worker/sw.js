const CACHE_NAME = 'video-cache-v1';
const STATIC_FILES = [
  '/',
  '/index.html',
  '/main.js',
  '/sw.js',
  '/manifest.json',
  '/Ghoomar_Padmaavat_720p_Mp4Hindi.mp4',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_FILES))
      .catch(err => {
        console.error("Cache addAll failed:", err);
      })
  );
});

self.addEventListener('fetch', (event) => {
  // Special case for cached video
  if (event.request.url.endsWith('/cached-video')) {
    event.respondWith(
      caches.open('video-cache').then(cache => cache.match('/cached-video'))
    );
    return;
  }

  // Fallback to cache for static files
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});