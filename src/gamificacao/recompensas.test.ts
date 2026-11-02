import { criarProgresso } from './progresso';
import {
  buscarRecompensa,
  condicaoRecompensa,
  EVENTO_PERSONALIZACAO,
  EVENTO_RECOMPENSAS_VISTAS,
  lerPersonalizacao,
  marcarRecompensasVistas,
  PERSONALIZACAO_PADRAO,
  recompensaLiberada,
  recompensasNaoVistas,
  salvarPersonalizacao,
  STORAGE_PERSONALIZACAO,
  STORAGE_RECOMPENSAS_VISTAS,
} from './recompensas';

const recompensa = (id: string) => buscarRecompensa(id)!;

const medalha = (nivel: number) => ({ nivel, data: '2026-11-02T15:00:00.000Z' });

describe('recompensas', () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.restoreAllMocks();
  });

  it('unlocks level items only after the level is reached', () => {
    expect(recompensaLiberada(recompensa('oculos'), { ...criarProgresso(), xp: 699 })).toBe(false);
    expect(recompensaLiberada(recompensa('oculos'), { ...criarProgresso(), xp: 700 })).toBe(true);
  });

  it('unlocks medal items only after the medal level is reached', () => {
    expect(recompensaLiberada(recompensa('cartola'), { ...criarProgresso(), medalhas: { 'acertos-seguidos': medalha(1) } })).toBe(false);
    expect(recompensaLiberada(recompensa('cartola'), { ...criarProgresso(), medalhas: { 'acertos-seguidos': medalha(2) } })).toBe(true);
  });

  it('describes the condition to unlock each item', () => {
    expect(condicaoRecompensa(recompensa('oculos'))).toBe('Chegue ao nível 5');
    expect(condicaoRecompensa(recompensa('cartola'))).toBe('Conquiste a medalha 🔥 Sequência de fogo · Prata');
    expect(condicaoRecompensa(recompensa('coroa'))).toBe('Conquiste a medalha 🏆 Tabuada completa');
  });

  it('starts with the default items', () => {
    expect(lerPersonalizacao(criarProgresso())).toEqual(PERSONALIZACAO_PADRAO);
  });

  it('saves the choice and notifies the site', () => {
    const ouvinte = jest.fn();
    window.addEventListener(EVENTO_PERSONALIZACAO, ouvinte);

    salvarPersonalizacao({ cor: 'cor-azul', acessorio: 'bone', tema: 'tema-padrao' });
    window.removeEventListener(EVENTO_PERSONALIZACAO, ouvinte);

    expect(ouvinte).toHaveBeenCalledTimes(1);
    expect(lerPersonalizacao({ ...criarProgresso(), xp: 250 })).toEqual({ cor: 'cor-azul', acessorio: 'bone', tema: 'tema-padrao' });
  });

  it('ignores saved items that are locked, unknown or of another type', () => {
    window.localStorage.setItem(STORAGE_PERSONALIZACAO, JSON.stringify({ cor: 'cor-roxa', acessorio: 'nao-existe', tema: 'cor-azul' }));

    expect(lerPersonalizacao({ ...criarProgresso(), xp: 250 })).toEqual(PERSONALIZACAO_PADRAO);
  });

  it('does not show as new the items unlocked before the first visit', () => {
    expect(recompensasNaoVistas({ ...criarProgresso(), xp: 700 })).toEqual([]);
    expect(JSON.parse(window.localStorage.getItem(STORAGE_RECOMPENSAS_VISTAS) || '[]')).toContain('oculos');
  });

  it('shows the items unlocked after the last visit until they are seen', () => {
    recompensasNaoVistas({ ...criarProgresso(), xp: 100 });
    const progresso = { ...criarProgresso(), xp: 250, medalhas: { 'partidas-jogadas': medalha(1) } };
    const ouvinte = jest.fn();
    window.addEventListener(EVENTO_RECOMPENSAS_VISTAS, ouvinte);

    expect(recompensasNaoVistas(progresso).map((item) => item.id)).toEqual(['bone', 'tema-oceano']);

    marcarRecompensasVistas(progresso);
    window.removeEventListener(EVENTO_RECOMPENSAS_VISTAS, ouvinte);

    expect(ouvinte).toHaveBeenCalledTimes(1);
    expect(recompensasNaoVistas(progresso)).toEqual([]);
  });

  it('does not break when the storage is unavailable or invalid', () => {
    window.localStorage.setItem(STORAGE_PERSONALIZACAO, 'quebrado');
    expect(lerPersonalizacao(criarProgresso())).toEqual(PERSONALIZACAO_PADRAO);

    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    expect(() => salvarPersonalizacao(PERSONALIZACAO_PADRAO)).not.toThrow();
  });
});
