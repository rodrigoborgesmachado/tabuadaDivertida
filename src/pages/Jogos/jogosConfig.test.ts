import { isJogoPath, jogos } from './jogosConfig';

describe('jogosConfig', () => {
  it('includes the current games', () => {
    const paths = jogos.map((jogo) => jogo.path);
    expect(paths).toContain('/selecionarjogo');
    expect(paths).toContain('/jogo2048');
  });

  it('recognizes game paths', () => {
    expect(isJogoPath('/jogo2048')).toBe(true);
    expect(isJogoPath('/selecionarjogo')).toBe(true);
  });

  it('ignores other paths', () => {
    expect(isJogoPath('/jogos')).toBe(false);
    expect(isJogoPath('/ranking')).toBe(false);
    expect(isJogoPath('/jogo20480')).toBe(false);
  });
});
