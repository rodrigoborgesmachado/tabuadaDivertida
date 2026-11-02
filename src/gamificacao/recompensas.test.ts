import { criarProgresso } from './progresso';
import {
  buscarRecompensa,
  condicaoRecompensa,
  EVENTO_PERSONALIZACAO,
  lerPersonalizacao,
  PERSONALIZACAO_PADRAO,
  recompensaLiberada,
  salvarPersonalizacao,
  STORAGE_PERSONALIZACAO,
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

  it('does not break when the storage is unavailable or invalid', () => {
    window.localStorage.setItem(STORAGE_PERSONALIZACAO, 'quebrado');
    expect(lerPersonalizacao(criarProgresso())).toEqual(PERSONALIZACAO_PADRAO);

    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    expect(() => salvarPersonalizacao(PERSONALIZACAO_PADRAO)).not.toThrow();
  });
});
