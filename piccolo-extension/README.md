# 🟢 Piccolo's Aura Farming Theme — Chrome Extension

Plays Piccolo's aura farming theme automatically whenever he appears on screen in Crunchyroll episodes, based on timestamps you define.

---

## SETUP (5 steps)

### 1. Add your audio file
Drop your audio file into this folder and name it:
```
aura.mp3
```
Alternatively, an `aura.ogg` file works as a fallback.

> Don't have it? Search YouTube for "Piccolo aura theme" and use a YouTube-to-mp3 converter.

---

### 2. Add timestamps for episodes

Open `timestamps.js` — this is the main file you'll be editing.

**Finding the Episode ID:**
Open any Crunchyroll episode. The URL looks like:
```
https://www.crunchyroll.com/watch/GY8VEQ95Y/episode-1-raditz-the-invader
                                  ^^^^^^^^^
                                  This part is the Episode ID
```

**Adding timestamps:**
```js
const PICCOLO_TIMESTAMPS = {

  "GY8VEQ95Y": [      // Episode ID
    [30, 60],          // Piccolo appears from 0:30 to 1:00
    [420, 455],        // Piccolo appears from 7:00 to 7:35
  ],

};
```

Convert timestamps: `minutes * 60 + seconds`  
e.g. 5:30 = 5×60+30 = **330**

---

### 3. Install the extension in Chrome

1. Open Chrome and go to: `chrome://extensions`
2. Enable **Developer mode** (toggle top right)
3. Click **Load unpacked**
4. Select this folder (`piccolo-extension/`)

---

### 4. Test it

- Click the extension icon in your Chrome toolbar
- Click **▶ TEST AUDIO** to confirm your audio file works
- Open a Crunchyroll episode that has timestamps defined
- The extension will automatically detect Piccolo and play the theme

---

### 5. Adding more timestamps

Just edit `timestamps.js` and add new entries. After saving, go to `chrome://extensions` and click the **↺ refresh** button on the extension card.

---

## HOW IT WORKS

```
Every 500ms:
  ↓
Check current video timestamp
  ↓
Is it inside a Piccolo range in timestamps.js?
  ↓ YES
Is cooldown expired? (default: 10s between triggers)
  ↓ YES
Play aura.mp3 + show green toast notification
  ↓
When timestamp range ends → stop audio
```

---

## TIPS

- **Finding timestamps fast:** Watch the episode once and note the timecodes from the Crunchyroll player. The player shows `mm:ss`.
- **Cooldown:** Set `COOLDOWN` in `timestamps.js` to avoid re-triggering mid-scene.
- **Play duration:** Set `PLAY_DURATION` to control how long the theme plays. Set to `null` to play the full file.
- **Volume:** Adjust in the popup (click the extension icon).

---

## FILES

```
piccolo-extension/
├── manifest.json       — Extension config (don't edit)
├── content.js          — Core logic, runs on Crunchyroll
├── timestamps.js       — YOUR TIMESTAMP DATABASE (edit this!)
├── popup.html          — Extension popup UI
├── popup.js            — Popup logic
├── aura.mp3            — YOUR AUDIO FILE (add this!)
└── README.md           — This file
```
