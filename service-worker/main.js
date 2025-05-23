// Register Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .then(() => console.log('Service Worker Registered'));
}

const cacheBtn = document.getElementById('cacheBtn');
const removeBtn = document.getElementById('removeBtn');
const status = document.getElementById('status');
const cachedStatus = document.getElementById('cachedStatus');
const serverVideo = document.getElementById('serverVideo');
const cachedVideo = document.getElementById('cachedVideo');
const VIDEO_URL = 'Ghoomar_Padmaavat_720p_Mp4Hindi.mp4';

let progressInterval = null;
let serverVideoLoaded = false;
let cachedVideoExists = false;

// Only enables the cacheBtn if conditions are satisfied
function updateCacheBtnState() {
  cacheBtn.disabled = !(serverVideoLoaded && !cachedVideoExists);
}

// Show progress spinner while caching
function showProgressAnimation() {
  let dots = '';
  status.innerHTML = `<span class="progress-spinner"></span> Caching video, please wait`;
  progressInterval = setInterval(() => {
    dots = dots.length < 3 ? dots + '.' : '';
    status.innerHTML = `<span class="progress-spinner"></span> Caching video, please wait${dots}`;
  }, 500);
}

function hideProgressAnimation() {
  clearInterval(progressInterval);
  progressInterval = null;
}

// Listen for server video load
serverVideo.addEventListener('loadeddata', () => {
  serverVideoLoaded = true;
  serverVideo.controls = true;
  if (!serverVideo.src || serverVideo.src !== VIDEO_URL) {
    serverVideo.src = VIDEO_URL;
  }
  updateCacheBtnState();
});

// Also handle error (e.g., network failure)
serverVideo.addEventListener('error', () => {
  serverVideoLoaded = false;
  serverVideo.controls = false;
  serverVideo.src = '';
  updateCacheBtnState();
});

// Loads the cached video or disables the player if not present
async function loadCachedVideo() {
  const cache = await caches.open('video-cache');
  const cachedRes = await cache.match('/cached-video');
  if (cachedRes) {
    cachedVideoExists = true;
    const blob = await cachedRes.blob();
    cachedVideo.src = URL.createObjectURL(blob);
    cacheBtn.disabled = true;
    removeBtn.disabled = false;
    cachedStatus.textContent = 'Playing cached video. App works offline!';
    cachedStatus.classList.add('big');
    cachedVideo.controls = true;
    cachedVideo.style.opacity = 1;
    cachedVideo.style.filter = "";
    cachedVideo.style.borderColor = "#ffe259";
  } else {
    cachedVideoExists = false;
    updateCacheBtnState();
    removeBtn.disabled = true;
    cachedStatus.textContent = 'No cached video. Use "Cache Video for Offline".';
    cachedStatus.classList.remove('big');
    cachedVideo.src = "";
    cachedVideo.controls = false;
    cachedVideo.style.opacity = 0.5;
    cachedVideo.style.filter = "grayscale(60%)";
    cachedVideo.style.borderColor = "#fcb69f";
  }
}

// Cache the video file
cacheBtn.addEventListener('click', async function () {
  cacheBtn.disabled = true;
  removeBtn.disabled = true;
  showProgressAnimation();
  const cache = await caches.open('video-cache');
  try {
    const response = await fetch(VIDEO_URL, { cache: "reload" });
    if (response.ok) {
      await cache.put('/cached-video', response.clone());
      localStorage.setItem('cachedVideoName', VIDEO_URL);
      hideProgressAnimation();
      status.textContent = 'Video cached for offline use!';
      cacheBtn.disabled = true;
      removeBtn.disabled = false;
      // Re-check cached status and update state/UI
      loadCachedVideo();
    } else {
      hideProgressAnimation();
      status.textContent = 'Failed to fetch video for caching.';
      updateCacheBtnState();
      removeBtn.disabled = false;
    }
  } catch (err) {
    hideProgressAnimation();
    status.textContent = 'Error while caching video: ' + err;
    updateCacheBtnState();
    removeBtn.disabled = false;
  }
});

// Remove cached video
removeBtn.addEventListener('click', async function () {
  const cache = await caches.open('video-cache');
  await cache.delete('/cached-video');
  localStorage.removeItem('cachedVideoName');
  status.textContent = 'Cached video removed. Reloading...';
  setTimeout(() => window.location.reload(), 1000);
});

// On page load, check if video is cached
window.addEventListener('load', loadCachedVideo);