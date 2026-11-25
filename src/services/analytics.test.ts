import { partidaIniciada, registrarEvento } from './analytics';

describe('analytics', () => {
  afterEach(() => {
    delete window.gtag;
  });

  it('does nothing when the Google tag is not loaded', () => {
    expect(() => registrarEvento('share', { method: 'nativo' })).not.toThrow();
  });

  it('sends the event without empty parameters', () => {
    window.gtag = vi.fn();

    registrarEvento('game_completed', { jogo: 'tabuada', modo: undefined, nivel: null, operacao: '', pontuacao: 0 });

    expect(window.gtag).toHaveBeenCalledWith('event', 'game_completed', { jogo: 'tabuada', pontuacao: 0 });
  });

  it('sends the game start with the game name', () => {
    window.gtag = vi.fn();

    partidaIniciada('sudoku', { modo: 'facil' });

    expect(window.gtag).toHaveBeenCalledWith('event', 'game_started', { jogo: 'sudoku', modo: 'facil' });
  });
});
