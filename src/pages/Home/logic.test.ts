import { criarProgresso } from '../../gamificacao/progresso';
import { jogos } from '../Jogos/jogosConfig';
import { ehNovo, filtros, jogoFavorito, jogoParaContinuar, lerFiltro, rotaDoJogo, salvarFiltro, STORAGE_FILTRO } from './logic';

const jogo = (id: string) => jogos.find((item) => item.id === id)!;

const idsDoFiltro = (id: string) => jogos.filter(filtros.find((filtro) => filtro.id === id)!.incluir).map((item) => item.id);

describe('Home logic', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('continues the last played game', () => {
    expect(jogoParaContinuar({ ...criarProgresso(), jogosJogados: ['tabuada', '2048'], ultimoJogo: 'memoria' })?.id).toBe('memoria');
  });

  it('falls back to the last game of older progress', () => {
    expect(jogoParaContinuar({ ...criarProgresso(), jogosJogados: ['tabuada', '2048'] })?.id).toBe('2048');
  });

  it('has nothing to continue for who never played or played a removed game', () => {
    expect(jogoParaContinuar(criarProgresso())).toBeUndefined();
    expect(jogoParaContinuar({ ...criarProgresso(), ultimoJogo: 'xadrez' })).toBeUndefined();
  });

  it('picks the most played game as the favorite', () => {
    expect(jogoFavorito(criarProgresso())).toBeUndefined();
    expect(jogoFavorito({ ...criarProgresso(), partidasPorJogo: { tabuada: 3, 'teste-qi': 5, xadrez: 9 } })).toBe('teste-qi');
  });

  it('keeps the first game of the list when the favorite is tied', () => {
    expect(jogoFavorito({ ...criarProgresso(), partidasPorJogo: { memoria: 2, tabuada: 2 } })).toBe('tabuada');
  });

  it('opens the tabuada through the current flow', () => {
    expect(rotaDoJogo(jogo('tabuada'))).toBe('/selecionarjogo');
    expect(rotaDoJogo(jogo('2048'))).toBe('/jogo2048');
  });

  it('marks a game as new until the configured day', () => {
    const novo = { ...jogo('2048'), novoAte: '2026-12-31' };

    expect(ehNovo(novo, new Date(2026, 11, 31, 23, 0))).toBe(true);
    expect(ehNovo(novo, new Date(2027, 0, 1))).toBe(false);
    expect(ehNovo(jogo('tabuada'))).toBe(false);
  });

  it('filters the games by skill and age', () => {
    expect(idsDoFiltro('todos')).toEqual(jogos.map((item) => item.id));
    expect(idsDoFiltro('tabuada')).toEqual(['tabuada', 'memoria', 'corrida-robo']);
    expect(idsDoFiltro('logica')).toEqual(['2048', 'teste-qi', 'sudoku']);
    expect(idsDoFiltro('contas')).toEqual(['2048', 'maior-ou-menor', 'corrida-robo', 'contando-bichinhos']);
    expect(idsDoFiltro('pequenos')).toEqual(['tabuada', 'memoria', 'corrida-robo', 'contando-bichinhos', 'sudoku']);
  });

  it('remembers the chosen filter', () => {
    expect(lerFiltro()).toBe('todos');

    salvarFiltro('logica');
    expect(lerFiltro()).toBe('logica');

    window.localStorage.setItem(STORAGE_FILTRO, 'inexistente');
    expect(lerFiltro()).toBe('todos');
  });
});
