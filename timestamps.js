// ============================================================
// PICCOLO TIMESTAMP DATABASE
// ============================================================
// Add entries here for each episode where Piccolo appears.
//
// HOW TO FIND THE EPISODE ID:
//   Open a Crunchyroll episode. The URL looks like:
//   https://www.crunchyroll.com/watch/GY8VEQ95Y/episode-1-raditz-the-invader
//   The ID is the alphanumeric part: "GY8VEQ95Y"
//
// HOW TO ADD TIMESTAMPS:
//   Each episode gets an array of [startSeconds, endSeconds] pairs.
//   e.g. [120, 145] = play theme from 2:00 to 2:25
//
// CONVERTING TIME TO SECONDS:
//   minutes * 60 + seconds  →  e.g. 5:30 = 5*60+30 = 330
// ============================================================

const PICCOLO_TIMESTAMPS = {

  // DBZ Kai EP55
  "G0DUMGW2V": [
    [609, 614],
    [942, 949],
    [1098, 1100],
    [1142, 1147], 
  ],

  // DBZ Episode 2 - "The World's Strongest Team"
  "GR49G00ZY": [
    [180, 220],    // Piccolo trains in wasteland
    [900, 940],    // Piccolo powers up
  ],

  // Add more episodes below:
  // "EPISODE_ID": [[startSec, endSec], [startSec, endSec]],

};

// How long the theme plays per trigger (seconds)
// Set to null to use the full audio file length
const PLAY_DURATION = 30;

// Minimum gap between triggers (seconds) — prevents re-triggering mid-scene
const COOLDOWN = 10;
