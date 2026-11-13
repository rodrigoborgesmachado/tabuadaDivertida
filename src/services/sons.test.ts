import configData from '../Config.json';
import { criarProgresso, STORAGE_KEY } from '../gamificacao/progresso';
import { PERSONALIZACAO_PADRAO, STORAGE_PERSONALIZACAO } from '../gamificacao/recompensas';
import { xpTotalDoNivel } from '../gamificacao/xp';
import { playConquista, playError, playSuccess } from './sons';

const notas: { tipo: string; freq: number }[] = [];

class AudioContextFalso {
  currentTime = 0;
  state = 'running';
  destination = {};

  createOscillator() {
    const oscilador = {
      type: 'sine',
      frequency: { setValueAtTime: (freq: number) => notas.push({ tipo: oscilador.type, freq }) },
      connect: () => {},
      start: () => {},
      stop: () => {},
    };
    return oscilador;
  }

  createGain() {
    return { gain: { setValueAtTime: () => {}, linearRampToValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} }, connect: () => {} };
  }
}

const escolherSom = (som: string, nivel: number) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...criarProgresso(), xp: xpTotalDoNivel(nivel) }));
  window.localStorage.setItem(STORAGE_PERSONALIZACAO, JSON.stringify({ ...PERSONALIZACAO_PADRAO, som }));
};

describe('sons', () => {
  beforeAll(() => {
    (window as unknown as { AudioContext: unknown }).AudioContext = AudioContextFalso;
  });

  beforeEach(() => {
    window.localStorage.clear();
    notas.length = 0;
  });

  it('plays the classic sounds by default', () => {
    playSuccess();
    playError();

    expect(notas).toEqual([{ tipo: 'sine', freq: 660 }, { tipo: 'sine', freq: 880 }, { tipo: 'square', freq: 220 }]);
  });

  it('plays the sound set chosen by the player', () => {
    escolherSom('som-8bits', 36);
    playSuccess();
    expect(notas).toEqual([{ tipo: 'square', freq: 988 }, { tipo: 'square', freq: 1319 }]);

    notas.length = 0;
    escolherSom('som-robo', 53);
    playConquista();
    expect(notas.map((nota) => nota.tipo)).toEqual(['sawtooth', 'sawtooth', 'sawtooth', 'sawtooth']);
  });

  it('keeps the classic sounds while the chosen set is locked', () => {
    escolherSom('som-sininho', 43);
    playSuccess();

    expect(notas[0]).toEqual({ tipo: 'sine', freq: 660 });
  });

  it('plays nothing while the sound is off', () => {
    escolherSom('som-8bits', 36);
    window.localStorage.setItem(configData.SOUND_MUTED, '1');

    playSuccess();
    playError();
    playConquista();

    expect(notas).toEqual([]);
  });
});
