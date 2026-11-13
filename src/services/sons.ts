import { useEffect, useState } from 'react';
import configData from '../Config.json';
import { lerPersonalizacao } from '../gamificacao/recompensas';

export const EVENTO_SOM = 'sound-setting-changed';

let audioCtx: AudioContext | null = null;

const lerMudo = () => {
  try {
    return localStorage.getItem(configData.SOUND_MUTED) === '1';
  } catch {
    return false;
  }
};

export const useSom = () => {
  const [mudo, setMudo] = useState(lerMudo);

  useEffect(() => {
    const atualizar = () => setMudo(lerMudo());

    window.addEventListener(EVENTO_SOM, atualizar);
    return () => window.removeEventListener(EVENTO_SOM, atualizar);
  }, []);

  const alternarSom = () => {
    try {
      localStorage.setItem(configData.SOUND_MUTED, mudo ? '0' : '1');
    } catch {}
    window.dispatchEvent(new Event(EVENTO_SOM));
  };

  return { mudo, alternarSom };
};

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
  if (lerMudo()) return;
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

type Efeito = 'acerto' | 'erro' | 'conquista';
type Nota = [number, number, OscillatorType, number];

const CONJUNTOS: Record<string, Record<Efeito, Nota[]>> = {
  'som-8bits': {
    acerto: [[988, 70, 'square', 0], [1319, 90, 'square', 70]],
    erro: [[196, 120, 'square', 0], [147, 180, 'square', 110]],
    conquista: [[523, 80, 'square', 0], [659, 80, 'square', 80], [784, 80, 'square', 160], [1047, 80, 'square', 240], [1319, 200, 'square', 320]],
  },
  'som-sininho': {
    acerto: [[1568, 160, 'sine', 0], [2093, 220, 'sine', 90]],
    erro: [[440, 200, 'triangle', 0], [415, 260, 'triangle', 150]],
    conquista: [[1047, 200, 'sine', 0], [1319, 200, 'sine', 120], [1568, 200, 'sine', 240], [2093, 400, 'sine', 360]],
  },
  'som-robo': {
    acerto: [[330, 80, 'sawtooth', 0], [440, 80, 'sawtooth', 90], [550, 100, 'sawtooth', 180]],
    erro: [[110, 300, 'sawtooth', 0]],
    conquista: [[262, 100, 'sawtooth', 0], [330, 100, 'sawtooth', 100], [392, 100, 'sawtooth', 200], [523, 300, 'sawtooth', 300]],
  },
};

const tocarConjunto = (efeito: Efeito) => {
  const notas = CONJUNTOS[lerPersonalizacao().som]?.[efeito];
  notas?.forEach(([freq, duracao, tipo, atraso]) => playBeep(freq, duracao, tipo, tipo === 'sine' || tipo === 'triangle' ? 0.08 : 0.05, atraso));
  return Boolean(notas);
};

export const playSuccess = () => {
  if (tocarConjunto('acerto')) return;
  playBeep(660, 90, 'sine', 0.08, 0);
  playBeep(880, 100, 'sine', 0.08, 80);
};

export const playError = () => {
  if (tocarConjunto('erro')) return;
  playBeep(220, 220, 'square', 0.06, 0);
};

export const falar = (texto: string) => {
  if (lerMudo() || typeof window === 'undefined' || !window.speechSynthesis) return;
  const fala = new SpeechSynthesisUtterance(texto);
  const voz = window.speechSynthesis.getVoices().find((item) => item.lang.replace('_', '-').toLowerCase() === 'pt-br');
  fala.lang = 'pt-BR';
  fala.rate = 0.9;
  if (voz) fala.voice = voz;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(fala);
};

export const pararFala = () => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};

export const playConquista = () => {
  if (tocarConjunto('conquista')) return;
  playBeep(523, 110, 'triangle', 0.08, 0);
  playBeep(659, 110, 'triangle', 0.08, 110);
  playBeep(784, 110, 'triangle', 0.08, 220);
  playBeep(1047, 260, 'triangle', 0.08, 330);
};
