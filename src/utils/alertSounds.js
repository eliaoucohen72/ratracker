/**
 * Web Audio API sound effects for alerts.
 * No audio files needed — all generated programmatically.
 */

let audioCtx = null;

function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

/**
 * Play a red alert siren — two rising tones repeated 3 times.
 */
export function playAlertSound() {
  try {
    const ctx = getCtx();
    const now = ctx.currentTime;
    const cycles = 3;
    const cycleDuration = 0.6;

    for (let i = 0; i < cycles; i++) {
      const t = now + i * cycleDuration;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.linearRampToValueAtTime(880, t + 0.4);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.4, t + 0.05);
      gain.gain.setValueAtTime(0.4, t + 0.38);
      gain.gain.linearRampToValueAtTime(0, t + 0.5);

      osc.start(t);
      osc.stop(t + 0.5);
    }
  } catch (e) {
    console.warn("Alert sound failed:", e);
  }
}

/**
 * Play an all-clear signal — three descending calm tones.
 */
export function playAllClearSound() {
  try {
    const ctx = getCtx();
    const now = ctx.currentTime;
    const notes = [659, 523, 392]; // E5 → C5 → G4

    notes.forEach((freq, i) => {
      const t = now + i * 0.35;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.3, t + 0.05);
      gain.gain.setValueAtTime(0.3, t + 0.25);
      gain.gain.linearRampToValueAtTime(0, t + 0.35);

      osc.start(t);
      osc.stop(t + 0.35);
    });
  } catch (e) {
    console.warn("All-clear sound failed:", e);
  }
}
