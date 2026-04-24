// ============================================================
// PICCOLO AURA EXTENSION — content.js
// Injected into every Crunchyroll /watch/ page
// ============================================================

(function () {
  'use strict';

  // ---- State ----
  let currentEpisodeId = null;
  let episodeTimestamps = [];
  let audio = null;
  let isPlaying = false;
  let lastTriggerTime = -9999;
  let pollInterval = null;
  let activeRangeIndex = -1;
  let toastEl = null;

  // ---- Extract episode ID from URL ----
  function getEpisodeId() {
    const match = window.location.pathname.match(/\/watch\/([A-Z0-9]+)\//i);
    return match ? match[1].toUpperCase() : null;
  }

  // ---- Find the Crunchyroll video element ----
  function getVideo() {
    return document.querySelector('video');
  }

  // ---- Build audio element from extension resource ----
  function initAudio() {
    if (audio) return;
    audio = new Audio();

    // Try .mp3 first, fallback to .ogg
    // Drop your audio file as "aura.mp3" in the extension folder
    audio.src = chrome.runtime.getURL('aura.mp3');
    audio.volume = 0.75;
    audio.loop = false;

    audio.addEventListener('error', () => {
      // Try ogg fallback
      if (!audio.src.endsWith('.ogg')) {
        audio.src = chrome.runtime.getURL('aura.ogg');
      }
    });

    audio.addEventListener('ended', () => {
      isPlaying = false;
    });
  }

  // ---- Play the theme ----
  function playTheme() {
    if (!audio) initAudio();
    if (isPlaying) return;

    audio.currentTime = 0;
    audio.play().catch(err => {
      console.warn('[Piccolo Ext] Audio play failed:', err);
    });

    isPlaying = true;
    showToast();

    // Auto-stop after PLAY_DURATION if set
    if (typeof PLAY_DURATION === 'number' && PLAY_DURATION > 0) {
      setTimeout(() => stopTheme(), PLAY_DURATION * 1000);
    }
  }

  // ---- Stop the theme ----
  function stopTheme() {
    if (!audio || !isPlaying) return;
    audio.pause();
    audio.currentTime = 0;
    isPlaying = false;
    hideToast();
  }

  // ---- Toast notification ----
  function showToast() {
    if (toastEl) return;
    toastEl = document.createElement('div');
    toastEl.id = 'piccolo-toast';
    toastEl.innerHTML = `
      <span class="piccolo-icon">🟢</span>
      <span class="piccolo-text">Piccolo appeared — Aura Theme playing</span>
      <button class="piccolo-mute" id="piccolo-mute-btn">Mute</button>
    `;
    toastEl.style.cssText = `
      position: fixed;
      bottom: 80px;
      right: 24px;
      z-index: 999999;
      background: rgba(10, 30, 10, 0.92);
      border: 1px solid #2ecc40;
      color: #b6ffb6;
      font-family: 'Courier New', monospace;
      font-size: 13px;
      padding: 10px 16px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 0 20px rgba(46,204,64,0.3);
      animation: piccolo-fadein 0.3s ease;
    `;

    const style = document.createElement('style');
    style.textContent = `
      @keyframes piccolo-fadein {
        from { opacity: 0; transform: translateY(10px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      #piccolo-toast .piccolo-mute {
        background: #2ecc40;
        border: none;
        color: #000;
        font-weight: bold;
        font-family: 'Courier New', monospace;
        cursor: pointer;
        padding: 3px 8px;
        border-radius: 3px;
        font-size: 11px;
      }
      #piccolo-toast .piccolo-mute:hover {
        background: #27ae60;
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(toastEl);

    document.getElementById('piccolo-mute-btn').addEventListener('click', () => {
      stopTheme();
    });
  }

  function hideToast() {
    if (toastEl) {
      toastEl.remove();
      toastEl = null;
    }
  }

  // ---- Core polling loop ----
  function poll() {
    const video = getVideo();
    if (!video || video.paused) return;

    const currentTime = video.currentTime;
    const now = Date.now() / 1000;

    // Check if we're inside any Piccolo timestamp range
    let inRange = false;
    let rangeIndex = -1;

    for (let i = 0; i < episodeTimestamps.length; i++) {
      const [start, end] = episodeTimestamps[i];
      if (currentTime >= start && currentTime <= end) {
        inRange = true;
        rangeIndex = i;
        break;
      }
    }

    if (inRange && rangeIndex !== activeRangeIndex) {
      // Entered a new Piccolo range
      activeRangeIndex = rangeIndex;

      const timeSinceLastTrigger = now - lastTriggerTime;
      if (timeSinceLastTrigger >= COOLDOWN) {
        lastTriggerTime = now;
        playTheme();
        console.log(`[Piccolo Ext] 🟢 Piccolo on screen! Range ${rangeIndex} at ${Math.round(currentTime)}s`);
      }
    } else if (!inRange) {
      // Left all ranges
      if (activeRangeIndex !== -1) {
        activeRangeIndex = -1;
        stopTheme();
        console.log('[Piccolo Ext] Piccolo left screen, stopping theme.');
      }
    }
  }

  // ---- Load timestamps for current episode ----
  function loadEpisode() {
    const id = getEpisodeId();
    if (!id) return;
    if (id === currentEpisodeId) return;

    currentEpisodeId = id;
    stopTheme();
    activeRangeIndex = -1;
    lastTriggerTime = -9999;

    episodeTimestamps = PICCOLO_TIMESTAMPS[id] || [];

    if (episodeTimestamps.length > 0) {
      console.log(`[Piccolo Ext] ✅ Loaded ${episodeTimestamps.length} Piccolo timestamp(s) for episode ${id}`);
    } else {
      console.log(`[Piccolo Ext] ℹ️ No timestamps for episode ${id}. Add them in timestamps.js!`);
    }
  }

  // ---- Init ----
  function init() {
    loadEpisode();
    initAudio();

    if (pollInterval) clearInterval(pollInterval);
    pollInterval = setInterval(() => {
      // Re-check episode on URL changes (Crunchyroll is a SPA)
      loadEpisode();
      poll();
    }, 500); // Poll every 500ms — low CPU, responsive enough

    console.log('[Piccolo Ext] 🟢 Extension active on', window.location.href);
  }

  // Crunchyroll is a SPA — listen for navigation changes
  let lastUrl = window.location.href;
  const observer = new MutationObserver(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      loadEpisode();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // Wait for page to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
