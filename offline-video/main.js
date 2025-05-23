// List of videos and resolutions
const VIDEOS = [
  { title: "Big Buck Bunny", file: "Big_buck_bunny.mp4" },
  { title: "Dil Cheez Tujhe Dedi", file: "Dil_Cheez_Tujhe_Dedi.mp4" },
  { title: "Ghoomar (Padmaavat)", file: "Ghoomar_Padmaavat.mp4" },
  { title: "Soch Na Sake (Airlift)", file: "Soch_Na_Sake_Airlift.mp4" },
  { title: "Tum Bin (Sanam Re)", file: "Tum_Bin_Sanam_Re.mp4" }
];
const RESOLUTIONS = [
  { label: "270p", value: "270", rowId: "row270", cachedRowId: "cachedRow270" },
  { label: "720p", value: "720", rowId: "row720", cachedRowId: "cachedRow720" }
];

const CACHE_NAME = 'offline-video-cache-v9';
// Track videos being cached
const cachingVideos = new Set();

function generateVideoTable() {
  RESOLUTIONS.forEach(res => {
    const row = document.getElementById(res.rowId);
    row.innerHTML = '';
    VIDEOS.forEach(video => {
      const td = document.createElement('td');
      td.style.width = "20%";
      const div = document.createElement('div');
      div.className = 'video-thumb';
      div.dataset.src = `${res.value}/${video.file}`;
      div.title = `${res.label} - ${video.title}`;
      div.innerHTML = `
        <div class="thumb-icon">
          <video width="100" height="60" muted preload="metadata">
            <source src="${res.value}/${video.file}" type="video/mp4">
          </video>
          <div class="resolution-overlay">${res.label}</div>
        </div>
      `;
      div.addEventListener('click', function() {
        playVideo(this.dataset.src);
        highlightSelectedThumb(this);
        // Start caching on click
        handleCacheVideo(this.dataset.src);
      });
      td.appendChild(div);
      row.appendChild(td);
    });
  });
}

function generateCachedTable(cachedSet = new Set()) {
  RESOLUTIONS.forEach(res => {
    const row = document.getElementById(res.cachedRowId);
    row.innerHTML = '';
    VIDEOS.forEach(video => {
      const td = document.createElement('td');
      td.style.width = "20%";
      const key = `${res.value}/${video.file}`;
      const div = document.createElement('div');
      div.className = 'cached-thumb';
      div.dataset.src = key;

      // Spinner during caching
      if (cachingVideos.has(key) && !cachedSet.has(key)) {
        div.innerHTML = `
          <div class="cached-thumb-icon" style="position:relative;">
            <div class="caching-spinner">
              <div class="spinner"></div>
            </div>
            <div class="resolution-overlay">${res.label}</div>
          </div>
        `;
      } else if (cachedSet.has(key)) {
        div.classList.add('cached');
        div.innerHTML = `
          <div class="cached-thumb-icon">
            <video width="100" height="60" muted preload="metadata">
              <source src="${key}" type="video/mp4">
            </video>
            <div class="resolution-overlay">${res.label}</div>
          </div>
        `;
        div.style.cursor = 'pointer';
        div.addEventListener('click', function() {
          playCachedVideo(this.dataset.src);
          highlightSelectedCachedThumb(this);
        });
      } else {
        div.innerHTML = `
          <div class="cached-thumb-icon">
            <div class="resolution-overlay">${res.label}</div>
          </div>
        `;
      }
      td.appendChild(div);
      row.appendChild(td);
    });
  });
}

function playVideo(src) {
  const player = document.getElementById('videoPlayer');
  const source = player.querySelector('source');
  source.src = src;
  player.load();
  player.play();
}

function playCachedVideo(src) {
  const player = document.getElementById('cachedVideoPlayer');
  const source = player.querySelector('source');
  source.src = src;
  player.load();
  player.play();
}

function highlightSelectedThumb(selectedDiv) {
  document.querySelectorAll('.video-thumb').forEach(div => div.classList.remove('selected'));
  selectedDiv.classList.add('selected');
}

function highlightSelectedCachedThumb(selectedDiv) {
  document.querySelectorAll('.cached-thumb.cached').forEach(div => div.classList.remove('selected'));
  selectedDiv.classList.add('selected');
}

// Request the service worker to cache a video and show spinner
function handleCacheVideo(src) {
  if (cachingVideos.has(src)) return; // Already in progress

  cachingVideos.add(src);
  console.log(`Caching started for: ${src}`); // Debugging
  generateCachedTable(); // Show spinner

  if (navigator.serviceWorker.controller) {
    const channel = new MessageChannel();
    channel.port1.onmessage = event => {
      if (event.data.success) {
        console.log(`Caching completed for: ${src}`); // Debugging
        cachingVideos.delete(src);
        updateCachedTable(); // Update cache state
      } else {
        console.error(`Caching failed for: ${src}`, event.data.error); // Debugging
        cachingVideos.delete(src);
        generateCachedTable(); // Remove spinner
      }
    };
    navigator.serviceWorker.controller.postMessage({
      type: 'CACHE_VIDEO',
      url: window.location.origin + '/' + src
    }, [channel.port2]);
  } else {
    // Fallback: remove spinner after a delay
    setTimeout(() => {
      cachingVideos.delete(src);
      generateCachedTable();
    }, 2000);
  }
}

// Service Worker registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(reg => {
        document.getElementById('status').textContent = 'Service Worker registered!';
        updateCachedTable();
      })
      .catch(err => {
        document.getElementById('status').textContent = 'Service Worker registration failed.';
      });
  });
}

// Update cached video table on right pane
async function updateCachedTable() {
  if (!('caches' in window)) return;
  let cache = await caches.open(CACHE_NAME);
  let requests = await cache.keys();
  let cachedSet = new Set(
    requests
      .map(req => req.url.split('/').slice(-2).join('/'))
      .filter(path =>
        (path.startsWith('270/') || path.startsWith('720/')) && path.endsWith('.mp4')
      )
  );
  console.log('Cached videos:', cachedSet); // Debugging
  generateCachedTable(cachedSet);
}

// Listen for cache updates from the service worker
navigator.serviceWorker && navigator.serviceWorker.addEventListener('message', event => {
  if (event.data === 'cache-updated') updateCachedTable();
});

document.addEventListener('DOMContentLoaded', () => {
  generateVideoTable();
  generateCachedTable();
  updateCachedTable();

  // Ensure no video loaded by default
  const player = document.getElementById('videoPlayer');
  const source = player.querySelector('source');
  source.src = "";
  player.load();
});