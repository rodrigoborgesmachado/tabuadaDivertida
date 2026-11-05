import { isJogoPath, jogos } from './jogosConfig';

describe('jogosConfig', () => {
  it('includes the current games', () => {
    const paths = jogos.map((jogo) => jogo.path);
    expect(paths).toContain('/selecionarjogo');
    expect(paths).toContain('/jogo2048');
    expect(paths).toContain('/jogos/memoria-da-tabuada');
    expect(paths).toContain('/jogos/maior-ou-menor');
    expect(paths).toContain('/jogos/teste-de-qi');
    expect(paths).toContain('/jogos/corrida-contra-o-robo');
    expect(paths).toContain('/jogos/contando-bichinhos');
    expect(paths).toContain('/jogos/sudoku');
  });

  it('gives each game a unique id', () => {
    const ids = jogos.map((jogo) => jogo.id);
    expect(new Set(ids).size).toBe(jogos.length);
  });

  it('recognizes game paths', () => {
    expect(isJogoPath('/jogo2048')).toBe(true);
    expect(isJogoPath('/selecionarjogo')).toBe(true);
    expect(isJogoPath('/jogos/memoria-da-tabuada')).toBe(true);
  });

  it('ignores other paths', () => {
    expect(isJogoPath('/jogos')).toBe(false);
    expect(isJogoPath('/ranking')).toBe(false);
    expect(isJogoPath('/jogo20480')).toBe(false);
  });
});
