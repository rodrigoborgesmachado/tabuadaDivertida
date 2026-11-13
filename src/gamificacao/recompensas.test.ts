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
  recompensasDoNivel,
  recompensasNaoVistas,
  salvarPersonalizacao,
  sortearPersonalizacao,
  STORAGE_PERSONALIZACAO,
  STORAGE_RECOMPENSAS_VISTAS,
} from './recompensas';
import { xpTotalDoNivel } from './xp';
import { ICONES_APP } from '../services/iconeApp';

const recompensa = (id: string) => buscarRecompensa(id)!;

const medalha = (nivel: number) => ({ nivel, data: '2026-11-02T15:00:00.000Z' });

const xpDoNivel10 = 2880;

describe('recompensas', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('unlocks level items only after the level is reached', () => {
    expect(recompensaLiberada(recompensa('oculos'), { ...criarProgresso(), xp: 979 })).toBe(false);
    expect(recompensaLiberada(recompensa('oculos'), { ...criarProgresso(), xp: 980 })).toBe(true);
  });

  it('has many colors, accessories and themes spread beyond level 50', () => {
    const tipo = (nome: string) => recompensas.filter((item) => item.tipo === nome);

    expect(tipo('cor').length).toBeGreaterThanOrEqual(30);
    expect(tipo('acessorio').length).toBeGreaterThanOrEqual(30);
    expect(tipo('tema').length).toBeGreaterThanOrEqual(12);
    expect(Math.max(...recompensas.map((item) => item.nivel || 0))).toBe(75);
    expect(new Set(recompensas.map((item) => item.id)).size).toBe(recompensas.length);
  });

  it('gives an item on every level from 33 to 50 and every five levels after 50', () => {
    const niveis = new Set(recompensas.map((item) => item.nivel));

    for (let nivel = 33; nivel <= 50; nivel++) {
      expect(niveis.has(nivel)).toBe(true);
    }
    [55, 60, 65, 70, 75].forEach((nivel) => expect(niveis.has(nivel)).toBe(true));
  });

  it('has animated colors among the epic and legendary ones', () => {
    expect(recompensa('cor-camaleao').animada).toBe(true);
    expect(recompensa('cor-infinito')).toMatchObject({ raridade: 'lendaria', nivel: 75, animada: true });
  });

  it('keeps unlocking new app icon colors after level 22', () => {
    const niveis = ICONES_APP.map((id) => recompensa(id)).filter((item) => item.nivel && item.nivel > 22).map((item) => item.nivel!).sort((a, b) => a - b);

    ICONES_APP.forEach((id) => expect(recompensa(id).tipo).toBe('cor'));
    expect(niveis.length).toBeGreaterThanOrEqual(10);
    expect(niveis[0]).toBe(24);
    expect(niveis[niveis.length - 1]).toBe(75);
    niveis.slice(1).forEach((nivel, indice) => expect(nivel - niveis[indice]).toBeLessThanOrEqual(5));
    expect(recompensasDoNivel(22, 24).filter((item) => ICONES_APP.includes(item.id)).map((item) => item.id)).toEqual(['cor-rubi']);
  });

  it('has pets, sounds, trails and dances unlocked by level or medal', () => {
    const tipo = (nome: string) => recompensas.filter((item) => item.tipo === nome);

    expect(tipo('bichinho').length).toBeGreaterThanOrEqual(5);
    expect(tipo('som').length).toBeGreaterThanOrEqual(4);
    expect(tipo('rastro').length).toBeGreaterThanOrEqual(4);
    expect(tipo('danca').length).toBeGreaterThanOrEqual(5);
    expect(recompensaLiberada(recompensa('bichinho-gato'), { ...criarProgresso(), xp: xpTotalDoNivel(37) })).toBe(false);
    expect(recompensaLiberada(recompensa('bichinho-gato'), { ...criarProgresso(), xp: xpTotalDoNivel(38) })).toBe(true);
    expect(recompensaLiberada(recompensa('bichinho-coruja'), { ...criarProgresso(), medalhas: { 'mestre-dos-padroes': medalha(3) } })).toBe(true);
    expect(recompensaLiberada(recompensa('som-padrao'), criarProgresso())).toBe(true);
    expect(recompensaLiberada(recompensa('danca-pulinho'), criarProgresso())).toBe(true);
  });

  it('reads the chosen pet, sound, trail and dance only while unlocked', () => {
    salvarPersonalizacao({ ...PERSONALIZACAO_PADRAO, bichinho: 'bichinho-gato', som: 'som-8bits', rastro: 'rastro-estrelas', danca: 'danca-giro' });

    expect(lerPersonalizacao({ ...criarProgresso(), xp: xpTotalDoNivel(45) })).toEqual({
      ...PERSONALIZACAO_PADRAO,
      bichinho: 'bichinho-gato',
      som: 'som-8bits',
      rastro: 'rastro-estrelas',
      danca: 'danca-giro',
    });
    expect(lerPersonalizacao({ ...criarProgresso(), xp: xpTotalDoNivel(30) })).toEqual(PERSONALIZACAO_PADRAO);
  });

  it('does not show the default sound and dance as new items', () => {
    window.localStorage.setItem(STORAGE_RECOMPENSAS_VISTAS, JSON.stringify(['cor-prata', 'tema-padrao']));

    expect(recompensasNaoVistas(criarProgresso())).toEqual([]);
  });

  it('lists the items unlocked between two levels', () => {
    expect(recompensasDoNivel(2, 3).map((item) => item.id)).toEqual(['cor-vermelho', 'bone']);
    expect(recompensasDoNivel(58, 59)).toEqual([]);
    expect(recompensasDoNivel(54, 55).map((item) => item.id)).toEqual(['cor-cometa']);
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
    const ouvinte = vi.fn();
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
    const ouvinte = vi.fn();
    window.addEventListener(EVENTO_RECOMPENSAS_VISTAS, ouvinte);

    expect(recompensasNaoVistas(progresso).map((item) => item.id)).toEqual(['cor-vermelho', 'bone', 'tema-oceano']);

    marcarRecompensasVistas(progresso);
    window.removeEventListener(EVENTO_RECOMPENSAS_VISTAS, ouvinte);

    expect(ouvinte).toHaveBeenCalledTimes(1);
    expect(recompensasNaoVistas(progresso)).toEqual([]);
  });

  it('marks as seen only the unlocked items of the given type', () => {
    recompensasNaoVistas({ ...criarProgresso(), xp: 200 });
    const progresso = { ...criarProgresso(), xp: 430, medalhas: { 'partidas-jogadas': medalha(1) } };

    marcarRecompensasVistas(progresso, 'acessorio');

    expect(recompensasNaoVistas(progresso).map((item) => item.id)).toEqual(['cor-vermelho', 'tema-oceano']);

    marcarRecompensasVistas(progresso, 'tema');

    expect(recompensasNaoVistas(progresso).map((item) => item.id)).toEqual(['cor-vermelho']);
  });

  it('does not break when the storage is unavailable or invalid', () => {
    window.localStorage.setItem(STORAGE_PERSONALIZACAO, 'quebrado');
    expect(lerPersonalizacao(criarProgresso())).toEqual(PERSONALIZACAO_PADRAO);

    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    expect(() => salvarPersonalizacao(PERSONALIZACAO_PADRAO)).not.toThrow();
  });
});
