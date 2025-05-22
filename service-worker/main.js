// Register Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .then(() => console.log('Service Worker Registered'));
}

const cacheBtn = document.getElementById('cacheBtn');
const removeBtn = document.getElementById('removeBtn');
const videoPlayer = document.getElementById('videoPlayer');
const status = document.getElementById('status');
const VIDEO_URL = 'Ghoomar_Padmaavat_720p_Mp4Hindi.mp4';

cacheBtn.addEventListener('click', async function () {
  const cache = await caches.open('video-cache');
  try {
    const response = await fetch(VIDEO_URL, { cache: "reload" });
    if (response.ok) {
      await cache.put('/cached-video', response.clone());
      localStorage.setItem('cachedVideoName', VIDEO_URL);
      status.textContent = 'Video cached for offline use!';
      cacheBtn.disabled = true;
      removeBtn.disabled = false;
    } else {
      status.textContent = 'Failed to fetch video for caching.';
    }
  } catch (err) {
    status.textContent = 'Error while caching video: ' + err;
  }
});

removeBtn.addEventListener('click', async function () {
  const cache = await caches.open('video-cache');
  await cache.delete('/cached-video');
  localStorage.removeItem('cachedVideoName');
  status.textContent = 'Cached video removed. Reloading...';
  setTimeout(() => window.location.reload(), 1000);
});

// On page load, check if video is cached
window.addEventListener('load', async function () {
  const cache = await caches.open('video-cache');
  const cachedRes = await cache.match('/cached-video');
  if (cachedRes) {
    const blob = await cachedRes.blob();
    videoPlayer.src = URL.createObjectURL(blob);
    cacheBtn.disabled = true;
    removeBtn.disabled = false;
    status.textContent = 'Playing cached video. App works offline!';
  } else {
    cacheBtn.disabled = false;
    removeBtn.disabled = true;
    videoPlayer.src = VIDEO_URL;
    status.textContent = '';
  }
});