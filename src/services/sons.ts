import configData from '../Config.json';

let audioCtx: AudioContext | null = null;

const ensureAudioCtx = () => {
  const AnyAudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
  if (!audioCtx && AnyAudioCtx) {
    audioCtx = new AnyAudioCtx();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
};

const playBeep = (freq: number, durationMs: number, type: OscillatorType = 'sine', volume = 0.08, delayMs = 0) => {
  try {
    if (localStorage.getItem(configData.SOUND_MUTED) === '1') return;
  } catch {}
  const ctx = ensureAudioCtx();
  if (!ctx) return;
  const now = ctx.currentTime + (delayMs / 1000);
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(volume, now + 0.01);
  const endTime = now + durationMs / 1000;
  gain.gain.exponentialRampToValueAtTime(0.0001, endTime);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(endTime + 0.01);
};

export const playSuccess = () => {
  playBeep(660, 90, 'sine', 0.08, 0);
  playBeep(880, 100, 'sine', 0.08, 80);
};

export const playError = () => {
  playBeep(220, 220, 'square', 0.06, 0);
};

export const playConquista = () => {
  playBeep(523, 110, 'triangle', 0.08, 0);
  playBeep(659, 110, 'triangle', 0.08, 110);
  playBeep(784, 110, 'triangle', 0.08, 220);
  playBeep(1047, 260, 'triangle', 0.08, 330);
};
