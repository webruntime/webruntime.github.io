// Register Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .then(() => console.log('Service Worker Registered'));
}

// DOM elements
const videoInput = document.getElementById('videoInput');
const cacheBtn = document.getElementById('cacheBtn');
const videoPlayer = document.getElementById('videoPlayer');
const status = document.getElementById('status');

let videoURL = '';
let videoFile = null;

videoInput.addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (file) {
    videoURL = URL.createObjectURL(file);
    videoPlayer.src = videoURL;
    videoFile = file;
    cacheBtn.disabled = false;
    status.textContent = '';
  }
});

cacheBtn.addEventListener('click', async function () {
  if (!videoFile) return;
  const cache = await caches.open('video-cache');
  const blobURL = URL.createObjectURL(videoFile);

  // Add to cache using a fixed URL (simulate "download")
  await cache.put('/cached-video', new Response(videoFile));
  localStorage.setItem('cachedVideoName', videoFile.name);

  status.textContent = 'Video cached for offline use!';
});

// On page load, check if video is cached
window.addEventListener('load', async function () {
  const cache = await caches.open('video-cache');
  const cachedRes = await cache.match('/cached-video');
  if (cachedRes) {
    const blob = await cachedRes.blob();
    videoPlayer.src = URL.createObjectURL(blob);
    cacheBtn.disabled = true;
    videoInput.disabled = true;
    status.textContent = 'Playing cached video. App works offline!';
  } else {
    const file = 'Ghoomar_Padmaavat_720p_Mp4Hindi.mp4';
    if (file) {
      videoURL = URL.createObjectURL(file);
      videoPlayer.src = videoURL;
      videoFile = file;
      cacheBtn.disabled = false;
      status.textContent = '';
    }
  }
});
