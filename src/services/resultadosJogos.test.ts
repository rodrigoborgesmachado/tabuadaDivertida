import api from './api';
import { buscarRanking, enviarResultado, lerExtras, posicaoNoRanking, TIMEOUT_ENVIO, urlRanking, type ItemRanking } from './resultadosJogos';

jest.mock('./api', () => ({
  __esModule: true,
  default: { post: jest.fn(), get: jest.fn() },
}));

const post = api.post as jest.Mock;
const get = api.get as jest.Mock;

const item = (nome: string, dados: string | null = null): ItemRanking => ({
  nome,
  modo: null,
  pontuacao: 10,
  tempo: null,
  acertos: null,
  total: null,
  dados,
  created: '2026-11-03T10:00:00',
});

describe('resultadosJogos', () => {
  beforeEach(() => {
    post.mockReset();
    get.mockReset();
  });

  it('builds the ranking url with the game, the mode and the top', () => {
    expect(urlRanking('2048')).toBe('ResultadosJogos/ranking?jogo=2048&top=50');
    expect(urlRanking('maior-ou-menor', 'tabuada-facil', 10)).toBe('ResultadosJogos/ranking?jogo=maior-ou-menor&modo=tabuada-facil&top=10');
  });

  it('sends the result with the normalized name, the extras as json and a timeout', async () => {
    post.mockResolvedValue({ data: { success: true } });

    await expect(enviarResultado('2048', null, { pontuacao: 1200, extras: { maiorPeca: 256 } }, '  Ana   Bia ')).resolves.toBe(true);

    expect(post).toHaveBeenCalledWith('/ResultadosJogos', {
      jogo: '2048',
      modo: null,
      nome: 'Ana Bia',
      pontuacao: 1200,
      dados: '{"maiorPeca":256}',
    }, { timeout: TIMEOUT_ENVIO });
  });

  it('returns false without throwing when the api fails', async () => {
    post.mockRejectedValue(new Error('Network Error'));

    await expect(enviarResultado('memoria', 'facil', { pontuacao: 8, tempo: 30 }, 'Ana')).resolves.toBe(false);
  });

  it('returns false without throwing when the request times out', async () => {
    post.mockRejectedValue(Object.assign(new Error('timeout of 8000ms exceeded'), { code: 'ECONNABORTED' }));

    await expect(enviarResultado('teste-qi', null, { acertos: 10, total: 15, tempo: 90 }, 'Ana')).resolves.toBe(false);
  });

  it('returns false when the api refuses the result', async () => {
    post.mockResolvedValue({ data: { success: false, message: 'Pontuação fora do limite' } });

    await expect(enviarResultado('2048', null, { pontuacao: 1 }, 'Ana')).resolves.toBe(false);
  });

  it('fetches the ranking list and total', async () => {
    get.mockResolvedValue({ data: { success: true, object: [item('Ana')], total: 7 } });

    await expect(buscarRanking('memoria', 'medio')).resolves.toEqual({ lista: [item('Ana')], total: 7 });
    expect(get).toHaveBeenCalledWith('ResultadosJogos/ranking?jogo=memoria&modo=medio&top=50', { timeout: TIMEOUT_ENVIO });
  });

  it('throws when the ranking is not available', async () => {
    get.mockResolvedValue({ data: { success: false, message: 'Jogo inválido' } });

    await expect(buscarRanking('xadrez')).rejects.toThrow('Jogo inválido');
  });

  it('finds the player position ignoring case and extra spaces', () => {
    const lista = [item('Bia'), item('Ana Clara')];

    expect(posicaoNoRanking(lista, ' ana  clara')).toBe(2);
    expect(posicaoNoRanking(lista, 'Caio')).toBeNull();
  });

  it('reads the extras and ignores invalid json', () => {
    expect(lerExtras(item('Ana', '{"maiorPeca":512}'))).toEqual({ maiorPeca: 512 });
    expect(lerExtras(item('Ana', '{invalido'))).toEqual({});
    expect(lerExtras(item('Ana'))).toEqual({});
  });
});
