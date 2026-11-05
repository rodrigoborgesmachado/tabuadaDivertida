import type { Mock } from 'vitest';
import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { desafioDaSemana, desafioDoDia } from '../gamificacao/desafios';
import { criarProgresso } from '../gamificacao/progresso';
import { calcularNivel, xpTotalDoNivel } from '../gamificacao/xp';
import { compartilhar, compartilharResultado, conquistaDaMedalha, conquistasDaPartida, montarTextoResultado, podeCompartilharArquivos, resultadoDaConquista, type ResultadoCompartilhado } from './compartilhar';

vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: vi.fn() } }));
vi.mock('@capacitor/share', () => ({ Share: { share: vi.fn() } }));
vi.mock('@capacitor/filesystem', () => ({ Directory: { Cache: 'CACHE' }, Filesystem: { writeFile: vi.fn() } }));

const data = new Date(2026, 10, 4, 15, 0);

const resultado = (conquistas?: ResultadoCompartilhado['conquistas']): ResultadoCompartilhado => ({
  jogo: 'Tabuada Divertida',
  linhas: ['🧮 Fiz 20/20 na tabuada do 7 em 38s no Tabuada Divertida!'],
  convite: 'Duvido você me superar 👉 https://www.tabuadadivertida.com',
  resumo: '20/20 em 38s',
  conquistas,
});

describe('compartilhar', () => {
  it('keeps the current text when there are no new achievements', () => {
    const texto = ['🧮 Fiz 20/20 na tabuada do 7 em 38s no Tabuada Divertida!', '', 'Duvido você me superar 👉 https://www.tabuadadivertida.com'].join('\n');

    expect(montarTextoResultado(resultado())).toBe(texto);
    expect(montarTextoResultado(resultado([]))).toBe(texto);
  });

  it('adds the achievements of the match before the invite', () => {
    expect(montarTextoResultado(resultado([
      { icone: '🔥', texto: 'Sequência de fogo · Ouro' },
      { icone: '🆙', texto: 'Subi para o nível 12: Mestre da Tabuada' },
    ]))).toBe([
      '🧮 Fiz 20/20 na tabuada do 7 em 38s no Tabuada Divertida!',
      '🏅 Conquistas desta partida:',
      '🔥 Sequência de fogo · Ouro',
      '🆙 Subi para o nível 12: Mestre da Tabuada',
      '',
      'Duvido você me superar 👉 https://www.tabuadadivertida.com',
    ].join('\n'));
  });

  it('shows at most 3 achievements and the count of the others', () => {
    const conquistas = Array.from({ length: 5 }, (_, indice) => ({ icone: '⭐', texto: `Medalha ${indice + 1}` }));
    const texto = montarTextoResultado(resultado(conquistas));

    expect(texto).toContain('⭐ Medalha 3\n+2 conquistas');
    expect(texto).not.toContain('Medalha 4');
    expect(montarTextoResultado(resultado(conquistas.slice(0, 4)))).toContain('⭐ Medalha 3\n+1 conquista\n');
    expect(montarTextoResultado(resultado(conquistas.slice(0, 3)))).not.toContain('+');
  });

  it('describes a medal with icon, name and level', () => {
    expect(conquistaDaMedalha('partida-perfeita', 3)).toEqual([{ icone: '⭐', texto: 'Partida perfeita · Ouro' }]);
    expect(conquistaDaMedalha('nao-existe', 1)).toEqual([]);
  });

  it('lists the new medals, the level up and the challenges completed in the match', () => {
    const anterior = { ...criarProgresso(), medalhas: { 'partida-perfeita': { nivel: 1, data: '' }, 'partidas-jogadas': { nivel: 1, data: '' } } };
    const atual = {
      ...anterior,
      xp: xpTotalDoNivel(12),
      medalhas: { ...anterior.medalhas, 'partida-perfeita': { nivel: 2, data: '' } },
      desafiosConcluidos: [desafioDoDia(data).id, desafioDaSemana(data).id],
    };

    expect(conquistasDaPartida(anterior, atual, data)).toEqual([
      { icone: '⭐', texto: 'Partida perfeita · Prata' },
      { icone: '🆙', texto: `Subi para o nível 12: ${calcularNivel(atual.xp).titulo}` },
      { icone: desafioDoDia(data).icone, texto: `Desafio do dia concluído: ${desafioDoDia(data).texto}` },
      { icone: desafioDaSemana(data).icone, texto: `Desafio da semana concluído: ${desafioDaSemana(data).texto}` },
    ]);
  });

  it('ignores achievements that already existed before the match', () => {
    const anterior = { ...criarProgresso(), xp: xpTotalDoNivel(5), desafiosConcluidos: [desafioDoDia(data).id], medalhas: { 'partida-perfeita': { nivel: 2, data: '' } } };

    expect(conquistasDaPartida(anterior, { ...anterior, xp: anterior.xp + 1 }, data)).toEqual([]);
  });

  describe('native share', () => {
    const share = vi.fn();

    beforeEach(() => {
      share.mockReset().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'share', { value: share, configurable: true });
    });

    afterEach(() => {
      delete (navigator as any).share;
      delete (navigator as any).canShare;
    });

    it('sends the image with the text as caption when the browser can share files', async () => {
      const arquivo = new File(['imagem'], 'tabuada-divertida.png', { type: 'image/png' });
      Object.defineProperty(navigator, 'canShare', { value: () => true, configurable: true });

      await compartilharResultado(resultado([{ icone: '⭐', texto: 'Partida perfeita · Prata' }]), arquivo);

      expect(share).toHaveBeenCalledWith({ title: 'Tabuada Divertida', text: expect.stringContaining('⭐ Partida perfeita · Prata'), files: [arquivo] });
    });

    it('shares only the text when files are not supported', async () => {
      expect(podeCompartilharArquivos()).toBe(false);

      await compartilharResultado(resultado());

      expect(share).toHaveBeenCalledWith({ title: 'Tabuada Divertida', text: montarTextoResultado(resultado()) });
    });
  });

  describe('app share', () => {
    const nativo = Capacitor.isNativePlatform as Mock;
    const shareNoApp = Share.share as Mock;
    const writeFile = Filesystem.writeFile as Mock;

    beforeEach(() => {
      nativo.mockReturnValue(true);
      shareNoApp.mockResolvedValue({});
      writeFile.mockResolvedValue({ uri: 'file:///cache/tabuada-divertida.png' });
    });

    it('opens the Android share screen with the text', async () => {
      await compartilhar('Tabuada Divertida', 'Joguei!');

      expect(shareNoApp).toHaveBeenCalledWith({ title: 'Tabuada Divertida', text: 'Joguei!', files: undefined });
    });

    it('always offers the image in the app', () => {
      expect(podeCompartilharArquivos()).toBe(true);
    });

    it('saves the image in the cache and shares it with the text', async () => {
      const arquivo = new File(['imagem'], 'tabuada-divertida.png', { type: 'image/png' });

      await compartilharResultado(resultado(), arquivo);

      expect(writeFile).toHaveBeenCalledWith({ path: 'tabuada-divertida.png', data: btoa('imagem'), directory: Directory.Cache });
      expect(shareNoApp).toHaveBeenCalledWith({ title: 'Tabuada Divertida', text: montarTextoResultado(resultado()), files: ['file:///cache/tabuada-divertida.png'] });
    });

    it('shares only the text when the image cannot be saved', async () => {
      writeFile.mockRejectedValue(new Error('falha'));

      await compartilharResultado(resultado(), new File(['imagem'], 'tabuada-divertida.png', { type: 'image/png' }));

      expect(shareNoApp).toHaveBeenCalledWith({ title: 'Tabuada Divertida', text: montarTextoResultado(resultado()), files: undefined });
    });

    it('invites to the site address instead of the app address', () => {
      expect(resultadoDaConquista({ icone: '🔥', texto: 'Sequência de fogo · Ouro' }).convite).toBe('Duvido você me superar 👉 https://www.tabuadadivertida.com');
    });

    it('ignores when the player cancels the share', async () => {
      shareNoApp.mockRejectedValue(new Error('Share canceled'));

      await expect(compartilhar('Tabuada Divertida', 'Joguei!')).resolves.toBeUndefined();
    });
  });

  it('shares a single achievement', () => {
    const texto = montarTextoResultado(resultadoDaConquista({ icone: '🔥', texto: 'Sequência de fogo · Ouro' }));

    expect(texto).toContain('🏅 Conquistas desta partida:\n🔥 Sequência de fogo · Ouro');
    expect(texto).not.toContain('+');
  });
});
