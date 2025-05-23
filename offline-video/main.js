// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(reg => {
        document.getElementById('status').textContent = 'Service Worker registered!';
      })
      .catch(err => {
        document.getElementById('status').textContent = 'Service Worker registration failed.';
      });
  });
}

// Handle combined resolution/video selection
document.addEventListener('DOMContentLoaded', () => {
  const vidSelect = document.getElementById('videoSelect');
  const player = document.getElementById('videoPlayer');

  function updateVideo() {
    const [resolution, filename] = vidSelect.value.split('/');
    const source = player.querySelector('source');
    source.src = `${resolution}/${filename}`;
    player.load();
    player.play();
  }

  vidSelect.addEventListener('change', updateVideo);
});