import { criarProgresso } from './progresso';
import {
  buscarRecompensa,
  condicaoRecompensa,
  EVENTO_PERSONALIZACAO,
  EVENTO_RECOMPENSAS_VISTAS,
  lerPersonalizacao,
  marcarRecompensasVistas,
  PERSONALIZACAO_PADRAO,
  proximaRecompensa,
  recompensaLiberada,
  recompensas,
  recompensasNaoVistas,
  salvarPersonalizacao,
  sortearPersonalizacao,
  STORAGE_PERSONALIZACAO,
  STORAGE_RECOMPENSAS_VISTAS,
} from './recompensas';

const recompensa = (id: string) => buscarRecompensa(id)!;

const medalha = (nivel: number) => ({ nivel, data: '2026-11-02T15:00:00.000Z' });

const xpDoNivel10 = 2880;

describe('recompensas', () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.restoreAllMocks();
  });

  it('unlocks level items only after the level is reached', () => {
    expect(recompensaLiberada(recompensa('oculos'), { ...criarProgresso(), xp: 979 })).toBe(false);
    expect(recompensaLiberada(recompensa('oculos'), { ...criarProgresso(), xp: 980 })).toBe(true);
  });

  it('has many colors, accessories and themes spread up to level 50', () => {
    const tipo = (nome: string) => recompensas.filter((item) => item.tipo === nome);

    expect(tipo('cor').length).toBeGreaterThanOrEqual(30);
    expect(tipo('acessorio').length).toBeGreaterThanOrEqual(30);
    expect(tipo('tema').length).toBeGreaterThanOrEqual(12);
    expect(Math.max(...recompensas.map((item) => item.nivel || 0))).toBe(50);
    expect(new Set(recompensas.map((item) => item.id)).size).toBe(recompensas.length);
  });

  it('keeps the items already unlocked even if the condition is no longer met', () => {
    expect(recompensaLiberada(recompensa('cor-roxa'), { ...criarProgresso(), recompensasLiberadas: ['cor-roxa'] })).toBe(true);
  });

  it('unlocks the legendary diamond color with any medal at the diamond level', () => {
    expect(recompensaLiberada(recompensa('cor-diamante'), { ...criarProgresso(), medalhas: { constancia: medalha(3) } })).toBe(false);
    expect(recompensaLiberada(recompensa('cor-diamante'), { ...criarProgresso(), medalhas: { constancia: medalha(4) } })).toBe(true);
    expect(condicaoRecompensa(recompensa('cor-diamante'))).toBe('Conquiste qualquer medalha no nível Diamante');
  });

  it('shows the next item to unlock and how much XP is missing', () => {
    const proxima = proximaRecompensa({ ...criarProgresso(), xp: 100 });

    expect(proxima?.recompensa.id).toBe('cor-azul');
    expect(proxima?.xpFaltando).toBe(100);
  });

  it('unlocks medal items only after the medal level is reached', () => {
    expect(recompensaLiberada(recompensa('cartola'), { ...criarProgresso(), medalhas: { 'acertos-seguidos': medalha(1) } })).toBe(false);
    expect(recompensaLiberada(recompensa('cartola'), { ...criarProgresso(), medalhas: { 'acertos-seguidos': medalha(2) } })).toBe(true);
  });

  it('describes the condition to unlock each item', () => {
    expect(condicaoRecompensa(recompensa('oculos'))).toBe('Chegue ao nível 5');
    expect(condicaoRecompensa(recompensa('oculos'), 2)).toBe('Nível 5 · você está no 2');
    expect(condicaoRecompensa(recompensa('cartola'))).toBe('Conquiste a medalha 🔥 Sequência de fogo · Prata');
    expect(condicaoRecompensa(recompensa('coroa'))).toBe('Conquiste a medalha 🏆 Tabuada completa');
  });

  it('starts with the default items', () => {
    expect(lerPersonalizacao(criarProgresso())).toEqual(PERSONALIZACAO_PADRAO);
  });

  it('saves the choice and notifies the site', () => {
    const ouvinte = jest.fn();
    window.addEventListener(EVENTO_PERSONALIZACAO, ouvinte);

    salvarPersonalizacao({ ...PERSONALIZACAO_PADRAO, cor: 'cor-azul', cabeca: 'bone' });
    window.removeEventListener(EVENTO_PERSONALIZACAO, ouvinte);

    expect(ouvinte).toHaveBeenCalledTimes(1);
    expect(lerPersonalizacao({ ...criarProgresso(), xp: 430 })).toEqual({ ...PERSONALIZACAO_PADRAO, cor: 'cor-azul', cabeca: 'bone' });
  });

  it('combines one accessory for each space', () => {
    const combinacao = { ...PERSONALIZACAO_PADRAO, cabeca: 'bone', rosto: 'oculos', pescoco: 'lenco', costas: 'capa', mao: 'lapis' };
    salvarPersonalizacao(combinacao);

    expect(lerPersonalizacao({ ...criarProgresso(), xp: xpDoNivel10 })).toEqual(combinacao);
  });

  it('moves the single accessory saved before to its space', () => {
    window.localStorage.setItem(STORAGE_PERSONALIZACAO, JSON.stringify({ cor: 'cor-azul', acessorio: 'capa', tema: 'tema-padrao' }));

    expect(lerPersonalizacao({ ...criarProgresso(), xp: xpDoNivel10 })).toEqual({ ...PERSONALIZACAO_PADRAO, cor: 'cor-azul', costas: 'capa' });
  });

  it('picks a random combination among the unlocked items', () => {
    const progresso = { ...criarProgresso(), xp: 430 };
    const sorteada = sortearPersonalizacao(PERSONALIZACAO_PADRAO, progresso, () => 0.99);

    expect(sorteada).toEqual({ ...PERSONALIZACAO_PADRAO, cor: 'cor-vermelho', cabeca: 'bone', mao: 'lapis' });
    expect(sortearPersonalizacao(PERSONALIZACAO_PADRAO, progresso, () => 0)).toEqual({ ...PERSONALIZACAO_PADRAO, cor: 'cor-prata' });
  });

  it('ignores saved items that are locked, unknown or of another type', () => {
    window.localStorage.setItem(STORAGE_PERSONALIZACAO, JSON.stringify({ cor: 'cor-roxa', cabeca: 'nao-existe', rosto: 'bone', tema: 'cor-azul' }));

    expect(lerPersonalizacao({ ...criarProgresso(), xp: 430 })).toEqual(PERSONALIZACAO_PADRAO);
  });

  it('does not show as new the items unlocked before the first visit', () => {
    expect(recompensasNaoVistas({ ...criarProgresso(), xp: 980 })).toEqual([]);
    expect(JSON.parse(window.localStorage.getItem(STORAGE_RECOMPENSAS_VISTAS) || '[]')).toContain('oculos');
  });

  it('shows the items unlocked after the last visit until they are seen', () => {
    recompensasNaoVistas({ ...criarProgresso(), xp: 200 });
    const progresso = { ...criarProgresso(), xp: 430, medalhas: { 'partidas-jogadas': medalha(1) } };
    const ouvinte = jest.fn();
    window.addEventListener(EVENTO_RECOMPENSAS_VISTAS, ouvinte);

    expect(recompensasNaoVistas(progresso).map((item) => item.id)).toEqual(['cor-vermelho', 'bone', 'tema-oceano']);

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
