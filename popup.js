// popup.js

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function getEpisodeIdFromTab(tab) {
  if (!tab || !tab.url) return null;
  const match = tab.url.match(/\/watch\/([A-Z0-9]+)\//i);
  return match ? match[1].toUpperCase() : null;
}

async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const isCrunchyroll = tab && tab.url && tab.url.includes('crunchyroll.com/watch/');

  const statusDot = document.getElementById('status-dot');
  const statusText = document.getElementById('status-text');
  const episodeIdEl = document.getElementById('episode-id');
  const timestampList = document.getElementById('timestamp-list');

  if (!isCrunchyroll) {
    statusDot.classList.add('inactive');
    statusText.textContent = 'Not on a Crunchyroll episode';
    episodeIdEl.textContent = '—';
    return;
  }

  statusDot.classList.remove('inactive');
  statusText.textContent = 'Active on Crunchyroll';

  const episodeId = getEpisodeIdFromTab(tab);
  episodeIdEl.textContent = episodeId || 'Unknown';

  // Load timestamps for this episode
  const timestamps = (episodeId && PICCOLO_TIMESTAMPS[episodeId]) || [];

  if (timestamps.length === 0) {
    timestampList.innerHTML = `<div class="empty-state">No timestamps for this episode yet.<br>Add them to timestamps.js!</div>`;
  } else {
    timestampList.innerHTML = timestamps.map(([start, end]) => `
      <div class="timestamp-item">
        <span class="range">${formatTime(start)} → ${formatTime(end)}</span>
        <span class="duration">${end - start}s</span>
      </div>
    `).join('');
  }
}

// Volume slider
const slider = document.getElementById('volume-slider');
const volVal = document.getElementById('volume-val');

chrome.storage.local.get('volume', ({ volume }) => {
  const v = volume !== undefined ? volume : 75;
  slider.value = v;
  volVal.textContent = `${v}%`;
});

slider.addEventListener('input', () => {
  const v = slider.value;
  volVal.textContent = `${v}%`;
  chrome.storage.local.set({ volume: parseInt(v) });
});

// Test button — plays audio in a detached Audio context
document.getElementById('test-btn').addEventListener('click', () => {
  const testAudio = new Audio(chrome.runtime.getURL('aura.mp3'));
  testAudio.volume = slider.value / 100;
  testAudio.play().catch(() => {
    // Try ogg fallback
    const fallback = new Audio(chrome.runtime.getURL('aura.ogg'));
    fallback.volume = slider.value / 100;
    fallback.play().catch(e => console.warn('Test audio failed:', e));
  });
});

init();
