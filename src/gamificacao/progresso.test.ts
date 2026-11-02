import { buscarMedalha, FATORES } from './medalhas';
import { contasDaTabuada, EVENTO_CONQUISTAS, lerProgresso, partidaFinalizada, registrarProgresso, STORAGE_KEY, VERSAO_PROGRESSO } from './progresso';

const dia = new Date(2026, 10, 2, 15, 0);
const noite = new Date(2026, 10, 2, 23, 30);

const contasCorretas = (quantidade: number) => Array.from({ length: quantidade }, () => ({ correta: true }));

const tabuadaInteira = (tabuada: number) => FATORES.map((fator) => ({ correta: true, fatores: [tabuada, fator] as [number, number] }));

const ids = (novas: ReturnType<typeof partidaFinalizada>) => novas.map((conquista) => `${conquista.medalha.id}:${conquista.nivel}`);

describe('progresso', () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.restoreAllMocks();
  });

  it('starts empty and keeps the progress between reads', () => {
    expect(lerProgresso().partidas).toBe(0);

    partidaFinalizada({ jogo: 'memoria' }, dia);

    const salvo = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
    expect(salvo.versao).toBe(VERSAO_PROGRESSO);
    expect(lerProgresso().partidas).toBe(1);
    expect(lerProgresso().jogosJogados).toEqual(['memoria']);
  });

  it('fills missing fields from older saved data', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ partidas: 3 }));

    const progresso = lerProgresso();

    expect(progresso.partidas).toBe(3);
    expect(progresso.medalhas).toEqual({});
    expect(progresso.versao).toBe(VERSAO_PROGRESSO);
  });

  it('does not break when the storage is unavailable', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });

    expect(lerProgresso().partidas).toBe(0);
    expect(() => partidaFinalizada({ jogo: 'tabuada', contas: contasCorretas(10) }, dia)).not.toThrow();
  });

  it('ignores invalid saved data', () => {
    window.localStorage.setItem(STORAGE_KEY, 'quebrado');

    expect(lerProgresso().partidas).toBe(0);
  });

  it('unlocks the master medal after every account of a times table is right', () => {
    const contas = tabuadaInteira(7).slice(0, -1);
    expect(ids(partidaFinalizada({ jogo: 'tabuada', contas }, dia))).not.toContain('mestre-do-7:1');

    const novas = partidaFinalizada({ jogo: 'tabuada', contas: [{ correta: true, fatores: [10, 7] }] }, dia);

    expect(ids(novas)).toContain('mestre-do-7:1');
    expect(lerProgresso().tabuadas[7]).toEqual(FATORES);
  });

  it('counts both factors of a multiplication', () => {
    partidaFinalizada({ jogo: 'tabuada', contas: [{ correta: true, fatores: [3, 8] }] }, dia);

    expect(lerProgresso().tabuadas[3]).toEqual([8]);
    expect(lerProgresso().tabuadas[8]).toEqual([3]);
  });

  it('removes an account from the times table when it is answered wrong', () => {
    partidaFinalizada({ jogo: 'tabuada', contas: tabuadaInteira(6).slice(0, 3) }, dia);
    partidaFinalizada({ jogo: 'tabuada', contas: [{ correta: false, fatores: [6, 3] }] }, dia);

    expect(lerProgresso().tabuadas[6]).toEqual([2, 4]);
  });

  it('unlocks the complete times table after every master medal', () => {
    let novas = partidaFinalizada({ jogo: 'tabuada', contas: FATORES.slice(0, -1).flatMap(tabuadaInteira) }, dia);
    expect(ids(novas)).not.toContain('tabuada-completa:1');

    novas = partidaFinalizada({ jogo: 'tabuada', contas: tabuadaInteira(10) }, dia);
    expect(ids(novas)).toContain('tabuada-completa:1');
  });

  it('keeps the right answers streak across matches and raises the level', () => {
    partidaFinalizada({ jogo: 'tabuada', contas: contasCorretas(8) }, dia);
    const novas = partidaFinalizada({ jogo: 'tabuada', contas: [...contasCorretas(4), { correta: false }] }, dia);

    expect(ids(novas)).toContain('acertos-seguidos:1');
    expect(lerProgresso().sequenciaAtual).toBe(0);
    expect(lerProgresso().melhorSequencia).toBe(12);

    expect(ids(partidaFinalizada({ jogo: 'tabuada', contas: contasCorretas(25) }, dia))).toContain('acertos-seguidos:2');
    expect(lerProgresso().medalhas['acertos-seguidos'].nivel).toBe(2);
  });

  it('counts perfect matches and the best average time', () => {
    partidaFinalizada({ jogo: 'tabuada', contas: contasCorretas(5), tempoMedio: 1 }, dia);
    expect(lerProgresso().partidasPerfeitas).toBe(1);
    expect(lerProgresso().melhorTempoMedio).toBe(0);

    const novas = partidaFinalizada({ jogo: 'tabuada', contas: contasCorretas(10), tempoMedio: 1.8 }, dia);

    expect(ids(novas)).toEqual(expect.arrayContaining(['resposta-rapida:2', 'acertos-seguidos:1']));
    expect(lerProgresso().melhorTempoMedio).toBe(1.8);

    partidaFinalizada({ jogo: 'tabuada', contas: [...contasCorretas(9), { correta: false }], tempoMedio: 1 }, dia);
    expect(lerProgresso().melhorTempoMedio).toBe(1.8);
    expect(lerProgresso().partidasPerfeitas).toBe(2);
  });

  it('counts matches from every game', () => {
    for (let i = 0; i < 9; i++) {
      partidaFinalizada({ jogo: 'memoria' }, dia);
    }

    expect(ids(partidaFinalizada({ jogo: '2048', maiorPeca: 64 }, dia))).toContain('partidas-jogadas:1');
  });

  it('unlocks the explorer medal after playing every game', () => {
    partidaFinalizada({ jogo: 'tabuada', contas: [{ correta: false }] }, dia);
    partidaFinalizada({ jogo: '2048', maiorPeca: 32 }, dia);

    expect(ids(partidaFinalizada({ jogo: 'memoria' }, dia))).toContain('explorador:1');
  });

  it('unlocks the 2048 medals while playing without counting a match', () => {
    expect(ids(registrarProgresso({ jogo: '2048', maiorPeca: 512 }, dia))).toEqual(['rumo-ao-2048:1']);
    expect(ids(registrarProgresso({ jogo: '2048', maiorPeca: 2048 }, dia))).toEqual(['rumo-ao-2048:3']);
    expect(ids(registrarProgresso({ jogo: '2048', maiorPeca: 1024 }, dia))).toEqual([]);
    expect(ids(registrarProgresso({ jogo: '2048', maiorPeca: 4096 }, dia))).toEqual(['alem-do-2048:1']);
    expect(lerProgresso().partidas).toBe(0);
  });

  it('unlocks the secret medal for matches at night', () => {
    expect(ids(partidaFinalizada({ jogo: 'memoria' }, dia))).not.toContain('coruja-noturna:1');
    expect(ids(partidaFinalizada({ jogo: 'memoria' }, noite))).toContain('coruja-noturna:1');
    expect(buscarMedalha('coruja-noturna')?.secreta).toBe(true);
  });

  it('returns each medal only once and keeps the date', () => {
    partidaFinalizada({ jogo: 'memoria' }, dia);
    partidaFinalizada({ jogo: 'memoria' }, noite);

    expect(ids(partidaFinalizada({ jogo: 'memoria' }, noite))).not.toContain('coruja-noturna:1');
    expect(lerProgresso().medalhas['coruja-noturna'].data).toBe(noite.toISOString());
  });

  it('notifies the screen about new medals', () => {
    const ouvinte = jest.fn();
    window.addEventListener(EVENTO_CONQUISTAS, ouvinte);

    partidaFinalizada({ jogo: 'memoria' }, dia);
    registrarProgresso({ jogo: '2048', maiorPeca: 512 }, dia);

    expect(ouvinte).toHaveBeenCalledTimes(1);
    expect((ouvinte.mock.calls[0][0] as CustomEvent).detail[0].medalha.id).toBe('rumo-ao-2048');
    window.removeEventListener(EVENTO_CONQUISTAS, ouvinte);
  });

  it('reads the multiplication factors from the times table questions', () => {
    expect(contasDaTabuada([
      { questao: '7x8', correta: true },
      { questao: '56÷8', correta: false },
      { questao: '(2x3) + (4x5)', correta: true },
    ])).toEqual([
      { correta: true, fatores: [7, 8] },
      { correta: false },
      { correta: true },
    ]);
  });
});
