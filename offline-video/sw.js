const CACHE_NAME = 'offline-video-cache-v9';
const OFFLINE_URLS = [
  '/',
  '/index.html',
  '/main.css',
  '/main.js',
  '/sw.js',
  '/manifest.json',
  '/icon-256.png',
  '/270/Big_buck_bunny.mp4',
  '/270/Dil_Cheez_Tujhe_Dedi.mp4',
  '/270/Ghoomar_Padmaavat.mp4',
  '/270/Soch_Na_Sake_Airlift.mp4',
  '/270/Tum_Bin_Sanam_Re.mp4',
  '/720/Big_buck_bunny.mp4',
  '/720/Dil_Cheez_Tujhe_Dedi.mp4',
  '/720/Ghoomar_Padmaavat.mp4',
  '/720/Soch_Na_Sake_Airlift.mp4',
  '/720/Tum_Bin_Sanam_Re.mp4'
];

// Install event: cache files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(OFFLINE_URLS))
  );
});

// Activate event: clean up old caches if any
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
});

// Fetch event: serve from cache first
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});