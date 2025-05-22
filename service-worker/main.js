// Register Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .then(() => console.log('Service Worker Registered'));
}

const cacheBtn = document.getElementById('cacheBtn');
const videoPlayer = document.getElementById('videoPlayer');
const status = document.getElementById('status');
const VIDEO_URL = 'Ghoomar_Padmaavat_720p_Mp4Hindi.mp4';

cacheBtn.addEventListener('click', async function () {
  const cache = await caches.open('video-cache');
  // Fetch the video and add to cache
  try {
    const response = await fetch(VIDEO_URL, { cache: "reload" });
    if (response.ok) {
      await cache.put('/cached-video', response.clone());
      localStorage.setItem('cachedVideoName', VIDEO_URL);
      status.textContent = 'Video cached for offline use!';
    } else {
      status.textContent = 'Failed to fetch video for caching.';
    }
  } catch (err) {
    status.textContent = 'Error while caching video: ' + err;
  }
});

// On page load, check if video is cached
window.addEventListener('load', async function () {
  const cache = await caches.open('video-cache');
  const cachedRes = await cache.match('/cached-video');
  if (cachedRes) {
    const blob = await cachedRes.blob();
    videoPlayer.src = URL.createObjectURL(blob);
    cacheBtn.disabled = true;
    status.textContent = 'Playing cached video. App works offline!';
  }
});