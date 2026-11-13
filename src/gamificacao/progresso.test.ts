import { buscarMedalha, FATORES, medalhas, MODOS } from './medalhas';
import { contasDaTabuada, criarProgresso, EVENTO_BOOSTERS, EVENTO_CONQUISTAS, EVENTO_DESAFIOS, EVENTO_NIVEL, lerProgresso, partidaFinalizada, registrarProgresso, STORAGE_KEY, VERSAO_PROGRESSO, type EventoJogo } from './progresso';

const dia = new Date(2026, 10, 2, 15, 0);
const noite = new Date(2026, 10, 2, 23, 30);

const contasCorretas = (quantidade: number) => Array.from({ length: quantidade }, () => ({ correta: true }));

const tabuadaInteira = (tabuada: number) => FATORES.map((fator) => ({ correta: true, fatores: [tabuada, fator] as [number, number] }));

const divisoesPor = (divisor: number) => contasDaTabuada(FATORES.map((fator) => ({ questao: `${divisor * fator}÷${divisor}`, correta: true })));

const ids = (novas: ReturnType<typeof partidaFinalizada>) => novas.map((conquista) => `${conquista.medalha.id}:${conquista.nivel}`);

const acertadas = (tabuada: number) => Object.keys(lerProgresso().tabuadas[tabuada] || {}).map(Number);

const salvarProgresso = (dados: object) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...criarProgresso(), ...dados }));
};

const salvarSemMedalhasNemDesafios = () => {
  salvarProgresso({
    medalhas: Object.fromEntries(medalhas.map((medalha) => [medalha.id, { nivel: medalha.metas.length, data: dia.toISOString() }])),
    desafiosConcluidos: ['dia:2026-11-02', 'semana:2026-11-02'],
    ultimoDia: '2026-11-02',
  });
};

describe('progresso', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('starts empty and keeps the progress between reads', () => {
    expect(lerProgresso().partidas).toBe(0);

    partidaFinalizada({ jogo: 'memoria' }, dia);

    const salvo = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
    expect(salvo.versao).toBe(VERSAO_PROGRESSO);
    expect(lerProgresso().partidas).toBe(1);
    expect(lerProgresso().jogosJogados).toEqual(['memoria']);
  });

  it('keeps the last game and counts the finished games of each one', () => {
    partidaFinalizada({ jogo: 'tabuada' }, dia);
    partidaFinalizada({ jogo: 'tabuada' }, dia);
    registrarProgresso({ jogo: '2048', maiorPeca: 64 }, dia);

    expect(lerProgresso().ultimoJogo).toBe('2048');
    expect(lerProgresso().partidasPorJogo).toEqual({ tabuada: 2 });

    partidaFinalizada({ jogo: '2048' }, dia);

    expect(lerProgresso().partidasPorJogo).toEqual({ tabuada: 2, '2048': 1 });
  });

  it('fills missing fields from older saved data', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ partidas: 3 }));

    const progresso = lerProgresso();

    expect(progresso.partidas).toBe(3);
    expect(progresso.medalhas).toEqual({});
    expect(progresso.versao).toBe(VERSAO_PROGRESSO);
  });

  it('does not break when the storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
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
    expect(acertadas(7)).toEqual(FATORES);
  });

  it('counts both factors of a multiplication', () => {
    partidaFinalizada({ jogo: 'tabuada', contas: [{ correta: true, fatores: [3, 8] }] }, dia);

    expect(acertadas(3)).toEqual([8]);
    expect(acertadas(8)).toEqual([3]);
  });

  it('removes an account from the times table when it is answered wrong', () => {
    partidaFinalizada({ jogo: 'tabuada', contas: tabuadaInteira(6).slice(0, 3) }, dia);
    partidaFinalizada({ jogo: 'tabuada', contas: [{ correta: false, fatores: [6, 3] }] }, dia);

    expect(acertadas(6)).toEqual([2, 4]);
  });

  it('only counts the master medal accounts answered in the last 7 days', () => {
    partidaFinalizada({ jogo: 'tabuada', contas: tabuadaInteira(4).slice(0, 4) }, new Date(2026, 10, 1, 15, 0));
    partidaFinalizada({ jogo: 'tabuada', contas: tabuadaInteira(4).slice(4, 6) }, new Date(2026, 10, 5, 15, 0));

    expect(ids(partidaFinalizada({ jogo: 'tabuada', contas: tabuadaInteira(4).slice(6) }, new Date(2026, 10, 8, 15, 0)))).not.toContain('mestre-do-4:1');
    expect(acertadas(4)).toEqual([6, 7, 8, 9, 10]);

    expect(ids(partidaFinalizada({ jogo: 'tabuada', contas: tabuadaInteira(4).slice(0, 4) }, new Date(2026, 10, 9, 15, 0)))).toContain('mestre-do-4:1');
  });

  it('unlocks the master medal with every account in the same match', () => {
    partidaFinalizada({ jogo: 'tabuada', contas: tabuadaInteira(9).slice(0, 8) }, new Date(2026, 9, 1, 15, 0));

    expect(ids(partidaFinalizada({ jogo: 'tabuada', contas: tabuadaInteira(9) }, dia))).toContain('mestre-do-9:1');
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

  it('counts perfect matches and the best average time only with at least 20 accounts', () => {
    const curta = partidaFinalizada({ jogo: 'tabuada', contas: contasCorretas(19), tempoMedio: 1 }, dia);
    expect(ids(curta)).not.toContain('partida-perfeita:1');
    expect(lerProgresso().partidasPerfeitas).toBe(0);
    expect(lerProgresso().melhorTempoMedio).toBe(0);

    const novas = partidaFinalizada({ jogo: 'tabuada', contas: contasCorretas(20), tempoMedio: 1.8 }, dia);

    expect(ids(novas)).toEqual(expect.arrayContaining(['resposta-rapida:2', 'partida-perfeita:1']));
    expect(lerProgresso().melhorTempoMedio).toBe(1.8);

    partidaFinalizada({ jogo: 'tabuada', contas: [...contasCorretas(19), { correta: false }], tempoMedio: 1 }, dia);
    expect(lerProgresso().melhorTempoMedio).toBe(1.8);
    expect(lerProgresso().partidasPerfeitas).toBe(1);

    expect(ids(partidaFinalizada({ jogo: 'tabuada', contas: contasCorretas(20), tempoMedio: 1 }, dia))).toContain('resposta-rapida:4');
  });

  it('reaches the diamond level', () => {
    salvarProgresso({ partidasPerfeitas: 24, partidas: 999, melhorDiasSeguidos: 100 });

    const novas = partidaFinalizada({ jogo: 'tabuada', contas: contasCorretas(100) }, dia);

    expect(ids(novas)).toEqual(expect.arrayContaining(['partida-perfeita:4', 'partidas-jogadas:4', 'constancia:4', 'acertos-seguidos:4']));
    expect(buscarMedalha('partida-perfeita')?.metas).toHaveLength(4);
  });

  it('keeps the conquered medals and resets the old times table progress when migrating', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
      versao: 1,
      partidas: 7,
      tabuadas: { 7: FATORES },
      medalhas: { 'mestre-do-7': { nivel: 1, data: '2026-10-01T15:00:00.000Z' }, 'partida-perfeita': { nivel: 3, data: '2026-10-01T15:00:00.000Z' } },
    }));

    const progresso = lerProgresso();

    expect(progresso.versao).toBe(VERSAO_PROGRESSO);
    expect(progresso.partidas).toBe(7);
    expect(progresso.tabuadas).toEqual({});
    expect(progresso.acertos).toBe(0);
    expect(progresso.perfeitasPorModo).toEqual({});

    partidaFinalizada({ jogo: 'memoria' }, dia);

    expect(lerProgresso().medalhas['mestre-do-7'].nivel).toBe(1);
    expect(lerProgresso().medalhas['partida-perfeita'].nivel).toBe(3);
  });

  it('unlocks the medals of each mode with perfect matches of at least 20 accounts', () => {
    expect(ids(partidaFinalizada({ jogo: 'tabuada', modo: 'A', contas: contasCorretas(19) }, dia))).not.toContain('mestre-da-soma:1');
    expect(ids(partidaFinalizada({ jogo: 'tabuada', modo: 'A', contas: contasCorretas(20) }, dia))).toContain('mestre-da-soma:1');
    expect(ids(partidaFinalizada({ jogo: 'tabuada', modo: 'S', contas: contasCorretas(20) }, dia))).toContain('mestre-da-subtracao:1');
    expect(ids(partidaFinalizada({ jogo: 'tabuada', modo: 'D', contas: contasCorretas(20) }, dia))).toContain('rei-da-divisao:1');
    expect(ids(partidaFinalizada({ jogo: 'tabuada', modo: 'E', contas: contasCorretas(20) }, dia))).toContain('genio-das-expressoes:1');
    expect(ids(partidaFinalizada({ jogo: 'tabuada', modo: 'M', contas: contasCorretas(20) }, dia))).not.toContain('quatro-operacoes:1');
    expect(ids(partidaFinalizada({ jogo: 'tabuada', modo: 'R', contas: contasCorretas(20) }, dia))).toEqual(expect.arrayContaining(['quatro-operacoes:1', 'coringa:1']));
    expect(Object.keys(lerProgresso().perfeitasPorModo).sort()).toEqual([...MODOS].sort());
  });

  it('keeps the conquered medals and the times table progress when migrating from the second version', () => {
    const data = '2026-10-01T15:00:00.000Z';
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
      versao: 2,
      partidas: 600,
      perfeitasPorModo: { A: 5 },
      tabuadas: { 7: { 2: '2026-11-01' } },
      medalhas: { 'partidas-jogadas': { nivel: 4, data }, 'mestre-da-soma': { nivel: 1, data } },
    }));

    const progresso = lerProgresso();

    expect(progresso.tabuadas).toEqual({ 7: { 2: '2026-11-01' } });
    expect(progresso.acertosPorModo).toEqual({});
    expect(progresso.melhorTempoMedioPorModo).toEqual({});
    expect(progresso.divisoes).toEqual({});
    expect(progresso.contasAcimaDe50).toBe(0);

    expect(ids(partidaFinalizada({ jogo: 'memoria' }, dia))).toContain('mestre-da-soma:2');
    expect(lerProgresso().medalhas['partidas-jogadas']).toEqual({ nivel: 4, data });
  });

  it('asks for 1000 matches to reach the diamond of the dedicated player', () => {
    salvarProgresso({ partidas: 500 });
    expect(ids(partidaFinalizada({ jogo: 'memoria' }, dia))).not.toContain('partidas-jogadas:4');
    expect(lerProgresso().medalhas['partidas-jogadas'].nivel).toBe(3);
  });

  it('counts the right answers and the streak of each mode across matches', () => {
    partidaFinalizada({ jogo: 'tabuada', modo: 'A', contas: contasCorretas(10) }, dia);
    partidaFinalizada({ jogo: 'tabuada', modo: 'S', contas: [{ correta: false }] }, dia);
    const novas = ids(partidaFinalizada({ jogo: 'tabuada', modo: 'A', contas: [...contasCorretas(5), { correta: false }, ...contasCorretas(2)] }, dia));

    expect(novas).toContain('sequencia-a:1');
    expect(novas).not.toContain('acertos-seguidos:1');
    expect(lerProgresso().acertosPorModo).toEqual({ A: 17, S: 0 });
    expect(lerProgresso().sequenciaPorModo).toEqual({ A: 2, S: 0 });
    expect(lerProgresso().melhorSequenciaPorModo).toEqual({ A: 15, S: 0 });

    salvarProgresso({ acertosPorModo: { D: 95 } });
    expect(ids(partidaFinalizada({ jogo: 'tabuada', modo: 'D', contas: contasCorretas(5) }, dia))).toContain('acertos-d:1');
  });

  it('keeps the best average time of each mode only in perfect matches', () => {
    partidaFinalizada({ jogo: 'tabuada', modo: 'A', contas: [...contasCorretas(19), { correta: false }], tempoMedio: 1 }, dia);
    partidaFinalizada({ jogo: 'tabuada', modo: 'A', contas: contasCorretas(19), tempoMedio: 1 }, dia);
    expect(lerProgresso().melhorTempoMedioPorModo).toEqual({});

    expect(ids(partidaFinalizada({ jogo: 'tabuada', modo: 'A', contas: contasCorretas(20), tempoMedio: 2.5 }, dia))).toContain('velocidade-a:2');
    partidaFinalizada({ jogo: 'tabuada', modo: 'A', contas: contasCorretas(20), tempoMedio: 3.5 }, dia);
    expect(lerProgresso().melhorTempoMedioPorModo).toEqual({ A: 2.5 });

    expect(ids(partidaFinalizada({ jogo: 'tabuada', modo: 'E', contas: contasCorretas(20), tempoMedio: 9 }, dia))).toContain('velocidade-e:2');
    expect(lerProgresso().medalhas['velocidade-s']).toBeUndefined();
  });

  it('unlocks the division master medal after every division by the same number is right', () => {
    expect(ids(partidaFinalizada({ jogo: 'tabuada', modo: 'D', contas: divisoesPor(7).slice(0, -1) }, dia))).not.toContain('mestre-da-divisao-por-7:1');

    partidaFinalizada({ jogo: 'tabuada', modo: 'D', contas: contasDaTabuada([{ questao: '21÷7', correta: false }]) }, dia);
    expect(Object.keys(lerProgresso().divisoes[7]).map(Number)).toEqual([2, 4, 5, 6, 7, 8, 9]);
    expect(lerProgresso().tabuadas).toEqual({});

    const novas = ids(partidaFinalizada({ jogo: 'tabuada', modo: 'R', contas: contasDaTabuada([{ questao: '21÷7', correta: true }, { questao: '70÷7', correta: true }]) }, dia));
    expect(novas).toContain('mestre-da-divisao-por-7:1');
  });

  it('unlocks the complete division after every division master medal', () => {
    expect(ids(partidaFinalizada({ jogo: 'tabuada', modo: 'D', contas: FATORES.slice(0, -1).flatMap((divisor) => divisoesPor(divisor)) }, dia))).not.toContain('divisao-completa:1');
    expect(ids(partidaFinalizada({ jogo: 'tabuada', modo: 'D', contas: divisoesPor(10) }, dia))).toContain('divisao-completa:1');
  });

  it('counts the additions and subtractions right with a result above 50', () => {
    salvarProgresso({ contasAcimaDe50: 47 });
    const questoes = [
      { questao: '40+11', correta: true },
      { questao: '99-48', correta: true },
      { questao: '25+25', correta: true },
      { questao: '60+30', correta: false },
      { questao: '9x7', correta: true },
      { questao: '120÷2', correta: true },
    ];

    expect(ids(partidaFinalizada({ jogo: 'tabuada', modo: 'R', contas: contasDaTabuada(questoes) }, dia))).not.toContain('calculista-mental:1');
    expect(lerProgresso().contasAcimaDe50).toBe(49);
    expect(ids(partidaFinalizada({ jogo: 'tabuada', modo: 'A', contas: contasDaTabuada([{ questao: '70+2', correta: true }]) }, dia))).toContain('calculista-mental:1');
  });

  it('unlocks the expressions streak and the long random perfect match medals', () => {
    partidaFinalizada({ jogo: 'tabuada', modo: 'E', contas: contasCorretas(6) }, dia);
    expect(ids(partidaFinalizada({ jogo: 'tabuada', modo: 'E', contas: contasCorretas(4) }, dia))).toContain('sem-parenteses-sem-problema:1');

    expect(ids(partidaFinalizada({ jogo: 'tabuada', modo: 'R', contas: contasCorretas(49) }, dia))).not.toContain('pau-pra-toda-obra:1');
    expect(ids(partidaFinalizada({ jogo: 'tabuada', modo: 'R', contas: [...contasCorretas(59), { correta: false }] }, dia))).not.toContain('pau-pra-toda-obra:1');
    expect(ids(partidaFinalizada({ jogo: 'tabuada', modo: 'R', contas: contasCorretas(50) }, dia))).toContain('pau-pra-toda-obra:1');
  });

  it('unlocks the marathon medal only with a perfect match of 100 accounts', () => {
    expect(ids(partidaFinalizada({ jogo: 'tabuada', contas: [...contasCorretas(99), { correta: false }] }, dia))).not.toContain('maratonista:1');
    expect(ids(partidaFinalizada({ jogo: 'tabuada', contas: contasCorretas(100) }, dia))).toContain('maratonista:1');
  });

  it('counts the beaten records', () => {
    partidaFinalizada({ jogo: 'tabuada', contas: [{ correta: true }], pontuacao: 10, recorde: 0 }, dia);
    partidaFinalizada({ jogo: 'tabuada', contas: [{ correta: true }], pontuacao: 10, recorde: 10 }, dia);
    expect(lerProgresso().recordesBatidos).toBe(0);

    for (let i = 0; i < 4; i++) {
      partidaFinalizada({ jogo: 'tabuada', contas: [{ correta: true }], pontuacao: 20 + i, recorde: 10 }, dia);
    }

    expect(ids(partidaFinalizada({ jogo: 'tabuada', contas: [{ correta: true }], pontuacao: 30, recorde: 20 }, dia))).toContain('recordista:1');
  });

  it('adds every right answer to the total', () => {
    salvarProgresso({ acertos: 990 });

    const novas = partidaFinalizada({ jogo: 'tabuada', contas: [...contasCorretas(10), { correta: false }] }, dia);

    expect(ids(novas)).toContain('sem-pressa-sem-erro:1');
    expect(lerProgresso().acertos).toBe(1000);
  });

  it('unlocks the comeback medal after missing the first 3 accounts', () => {
    const erros = [{ correta: false }, { correta: false }, { correta: false }];

    expect(ids(partidaFinalizada({ jogo: 'tabuada', contas: [...erros, ...contasCorretas(26)] }, dia))).not.toContain('volta-por-cima:1');
    expect(ids(partidaFinalizada({ jogo: 'tabuada', contas: [...erros, ...contasCorretas(27)] }, dia))).toContain('volta-por-cima:1');
  });

  it('reads the level, moves, time and wasted cards from the memory game', () => {
    let novas = partidaFinalizada({ jogo: 'memoria', nivel: 'dificil', jogadas: 19, tempo: 90, desperdicio: true }, dia);
    expect(ids(novas)).not.toContain('memoria-de-elefante:1');
    expect(ids(novas)).not.toContain('sem-desperdicio:1');

    novas = partidaFinalizada({ jogo: 'memoria', nivel: 'dificil', jogadas: 18, tempo: 90, desperdicio: true }, dia);
    expect(ids(novas)).toContain('memoria-de-elefante:1');

    expect(ids(partidaFinalizada({ jogo: 'memoria', nivel: 'medio', jogadas: 20, tempo: 60, desperdicio: true }, dia))).not.toContain('relampago-da-memoria:1');
    expect(ids(partidaFinalizada({ jogo: 'memoria', nivel: 'facil', jogadas: 20, tempo: 59, desperdicio: true }, dia))).not.toContain('relampago-da-memoria:1');
    expect(ids(partidaFinalizada({ jogo: 'memoria', nivel: 'medio', jogadas: 20, tempo: 59, desperdicio: true }, dia))).toContain('relampago-da-memoria:1');

    expect(ids(partidaFinalizada({ jogo: 'memoria', nivel: 'facil', jogadas: 9, tempo: 40, desperdicio: false }, dia))).toContain('sem-desperdicio:1');
  });

  it('reads the score and the undo from the 2048', () => {
    expect(ids(registrarProgresso({ jogo: '2048', maiorPeca: 1024, pontuacao: 9000, desfez: true }, dia))).not.toContain('minimalista:1');
    expect(ids(registrarProgresso({ jogo: '2048', maiorPeca: 1024, pontuacao: 10000, desfez: false }, dia))).toEqual(expect.arrayContaining(['minimalista:1', 'pontuador:1']));
    expect(ids(partidaFinalizada({ jogo: '2048', maiorPeca: 2048, pontuacao: 21000, desfez: true }, dia))).toContain('pontuador:2');
    expect(lerProgresso().maiorPecaSemDesfazer).toBe(1024);
    expect(lerProgresso().maiorPontuacao2048).toBe(21000);
  });

  it('unlocks the perfect week after the 7 daily challenges of the same week', () => {
    salvarProgresso({ desafiosConcluidos: ['dia:2026-11-01', 'dia:2026-11-02', 'dia:2026-11-03', 'dia:2026-11-04', 'dia:2026-11-05', 'dia:2026-11-06', 'semana:2026-S45'] });
    expect(ids(partidaFinalizada({ jogo: 'memoria' }, new Date(2026, 10, 7, 15, 0)))).not.toContain('semana-perfeita:1');

    salvarProgresso({ desafiosConcluidos: ['dia:2026-11-02', 'dia:2026-11-03', 'dia:2026-11-04', 'dia:2026-11-05', 'dia:2026-11-06', 'dia:2026-11-07', 'dia:2026-11-08'] });
    expect(ids(partidaFinalizada({ jogo: 'memoria' }, new Date(2026, 10, 9, 15, 0)))).toContain('semana-perfeita:1');
  });

  it('counts the weekends played on saturday and sunday', () => {
    partidaFinalizada({ jogo: 'memoria' }, new Date(2026, 10, 7, 15, 0));
    partidaFinalizada({ jogo: 'memoria' }, new Date(2026, 10, 7, 18, 0));
    expect(lerProgresso().finsDeSemana).toBe(0);

    partidaFinalizada({ jogo: 'memoria' }, new Date(2026, 10, 8, 15, 0));
    partidaFinalizada({ jogo: 'memoria' }, new Date(2026, 10, 15, 15, 0));
    partidaFinalizada({ jogo: 'memoria' }, new Date(2026, 10, 21, 15, 0));
    expect(lerProgresso().finsDeSemana).toBe(1);

    salvarProgresso({ finsDeSemana: 3 });
    partidaFinalizada({ jogo: 'memoria' }, new Date(2026, 10, 28, 15, 0));
    expect(ids(partidaFinalizada({ jogo: 'memoria' }, new Date(2026, 10, 29, 15, 0)))).toContain('fim-de-semana-estudioso:1');
  });

  it('unlocks the secret medal for matches early in the morning', () => {
    expect(ids(partidaFinalizada({ jogo: 'memoria' }, new Date(2026, 10, 2, 7, 0)))).not.toContain('madrugador:1');
    expect(ids(partidaFinalizada({ jogo: 'memoria' }, new Date(2026, 10, 2, 5, 30)))).toContain('madrugador:1');
  });

  it('unlocks the stubborn medal after missing an account 3 times and getting it right 5 times in a row', () => {
    const conta = (correta: boolean) => contasDaTabuada([{ questao: '7x8', correta }]);

    for (let i = 0; i < 3; i++) {
      partidaFinalizada({ jogo: 'tabuada', contas: conta(false) }, dia);
    }
    for (let i = 0; i < 4; i++) {
      partidaFinalizada({ jogo: 'tabuada', contas: conta(true) }, dia);
    }
    partidaFinalizada({ jogo: 'tabuada', contas: conta(false) }, dia);
    for (let i = 0; i < 4; i++) {
      expect(ids(partidaFinalizada({ jogo: 'tabuada', contas: conta(true) }, dia))).not.toContain('teimoso:1');
    }

    expect(ids(partidaFinalizada({ jogo: 'tabuada', contas: conta(true) }, dia))).toContain('teimoso:1');
    expect(lerProgresso().teimosia).toEqual({});
  });

  it('unlocks the secret medal for a palindrome score', () => {
    expect(ids(partidaFinalizada({ jogo: '2048', pontuacao: 5 }, dia))).not.toContain('palindromo:1');
    expect(ids(partidaFinalizada({ jogo: '2048', pontuacao: 1220 }, dia))).not.toContain('palindromo:1');
    expect(ids(partidaFinalizada({ jogo: '2048', pontuacao: 1221 }, dia))).toContain('palindromo:1');
  });

  it('unlocks the perfectionist medal after every other medal', () => {
    const outras = medalhas.filter((medalha) => medalha.id !== 'perfeccionista' && medalha.id !== 'coruja-noturna');
    salvarProgresso({ medalhas: Object.fromEntries(outras.map((medalha) => [medalha.id, { nivel: 1, data: dia.toISOString() }])) });

    expect(ids(partidaFinalizada({ jogo: 'memoria' }, dia))).not.toContain('perfeccionista:1');
    expect(ids(partidaFinalizada({ jogo: 'memoria' }, noite))).toEqual(expect.arrayContaining(['coruja-noturna:1', 'perfeccionista:1']));
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
    partidaFinalizada({ jogo: 'memoria' }, dia);
    partidaFinalizada({ jogo: 'maior-ou-menor' }, dia);
    partidaFinalizada({ jogo: 'teste-qi' }, dia);
    partidaFinalizada({ jogo: 'corrida-robo' }, dia);
    partidaFinalizada({ jogo: 'contando-bichinhos' }, dia);
    partidaFinalizada({ jogo: 'sudoku' }, dia);

    expect(ids(partidaFinalizada({ jogo: 'que-horas-sao' }, dia))).toContain('explorador:1');
  });

  it('unlocks the clock medals with right times in a row on the hard level', () => {
    partidaFinalizada({ jogo: 'que-horas-sao', modo: 'relogio-dificil', contas: [...contasCorretas(9), { correta: false }] }, dia);
    expect(ids(partidaFinalizada({ jogo: 'que-horas-sao', modo: 'relogio-medio', contas: contasCorretas(10) }, dia))).not.toContain('relojoeiro:1');

    const novas = ids(partidaFinalizada({ jogo: 'que-horas-sao', modo: 'relogio-dificil', contas: contasCorretas(10) }, dia));

    expect(novas).toEqual(expect.arrayContaining(['relojoeiro:1', 'hora-certa:1']));
  });

  it('unlocks the race medal only when beating the champion robot', () => {
    expect(ids(partidaFinalizada({ jogo: 'corrida-robo', nivelRobo: 'turbo', venceu: true }, dia))).not.toContain('mais-rapido-que-a-maquina:1');
    expect(ids(partidaFinalizada({ jogo: 'corrida-robo', nivelRobo: 'campeao', venceu: false }, dia))).not.toContain('mais-rapido-que-a-maquina:1');
    expect(ids(partidaFinalizada({ jogo: 'tabuada', nivelRobo: 'campeao', venceu: true }, dia))).not.toContain('mais-rapido-que-a-maquina:1');
    expect(ids(partidaFinalizada({ jogo: 'corrida-robo', nivelRobo: 'campeao', venceu: true }, dia))).toContain('mais-rapido-que-a-maquina:1');
    expect(lerProgresso().vitoriasContraCampeao).toBe(1);
  });

  it('unlocks the race medal only on tracks of 20 squares or more', () => {
    expect(ids(partidaFinalizada({ jogo: 'corrida-robo', nivelRobo: 'campeao', venceu: true, casas: 10 }, dia))).not.toContain('mais-rapido-que-a-maquina:1');
    expect(lerProgresso().vitoriasContraCampeao).toBe(0);
    expect(ids(partidaFinalizada({ jogo: 'corrida-robo', nivelRobo: 'campeao', venceu: true, casas: 30 }, dia))).toContain('mais-rapido-que-a-maquina:1');
  });

  it('counts the race answers for the times table medals', () => {
    const questoes = [...FATORES.flatMap((fator) => [{ questao: `7x${fator}`, correta: true }, { questao: `${fator + 10}+3`, correta: true }]), { questao: '2+2', correta: true }, { questao: '3+3', correta: true }];
    const novas = ids(partidaFinalizada({ jogo: 'corrida-robo', modo: 'M', contas: contasDaTabuada(questoes), nivelRobo: 'atento', venceu: true }, dia));

    expect(novas).toEqual(expect.arrayContaining(['mestre-do-7:1', 'partida-perfeita:1']));
    expect(lerProgresso().perfeitasPorModo).toEqual({ M: 1 });
  });

  it('counts the sudokus of each mode and unlocks the sudoku medals', () => {
    expect(ids(partidaFinalizada({ jogo: 'sudoku', modo: '4x4', tempo: 40, dicasUsadas: 1, desfez: true, marcouErros: true }, dia))).toContain('sudokista:1');
    expect(ids(partidaFinalizada({ jogo: 'sudoku', modo: '6x6', tempo: 200, dicasUsadas: 0, desfez: true, marcouErros: true }, dia))).toContain('primeiros-quadradinhos:1');
    expect(lerProgresso().sudokusPorModo).toEqual({ '4x4': 1, '6x6': 1 });

    salvarProgresso({ sudokusPorModo: { '4x4': 9 } });
    expect(ids(partidaFinalizada({ jogo: 'sudoku', modo: '9x9-facil', tempo: 600, desfez: true }, dia))).toContain('sudokista:2');
  });

  it('unlocks the classic sudoku levels in order', () => {
    expect(ids(partidaFinalizada({ jogo: 'sudoku', modo: '9x9-dificil', tempo: 900, desfez: true }, dia))).not.toContain('classico:1');
    expect(ids(partidaFinalizada({ jogo: 'sudoku', modo: '9x9-facil', tempo: 900, desfez: true }, dia))).toContain('classico:1');
    expect(ids(partidaFinalizada({ jogo: 'sudoku', modo: '9x9-medio', tempo: 900, desfez: true }, dia))).toContain('classico:3');

    salvarProgresso({ sudokusPorModo: { '9x9-facil': 1, '9x9-medio': 1, '9x9-dificil': 9 }, medalhas: { classico: { nivel: 3, data: dia.toISOString() } } });
    expect(ids(partidaFinalizada({ jogo: 'sudoku', modo: '9x9-dificil', tempo: 900, desfez: true }, dia))).toContain('classico:4');
  });

  it('counts only 9x9 sudokus without hints and without error marking as without help', () => {
    partidaFinalizada({ jogo: 'sudoku', modo: '4x4', tempo: 60, dicasUsadas: 0, marcouErros: false, desfez: true }, dia);
    partidaFinalizada({ jogo: 'sudoku', modo: '9x9-facil', tempo: 600, dicasUsadas: 1, marcouErros: false, desfez: true }, dia);
    expect(ids(partidaFinalizada({ jogo: 'sudoku', modo: '9x9-facil', tempo: 600, dicasUsadas: 0, marcouErros: true, desfez: true }, dia))).not.toContain('sem-ajuda:1');

    expect(ids(partidaFinalizada({ jogo: 'sudoku', modo: '9x9-medio', tempo: 600, dicasUsadas: 0, marcouErros: false, desfez: true }, dia))).toContain('sem-ajuda:1');
    expect(lerProgresso().sudokusSemAjudaPorModo).toEqual({ '4x4': 1, '9x9-medio': 1 });

    salvarProgresso({ sudokusSemAjudaPorModo: { '4x4': 30, '9x9-facil': 2, '9x9-dificil': 2 } });
    expect(ids(partidaFinalizada({ jogo: 'sudoku', modo: '9x9-facil', tempo: 600, dicasUsadas: 0, marcouErros: false, desfez: true }, dia))).toContain('sem-ajuda:2');
  });

  it('keeps the best time of each sudoku mode and unlocks the lightning levels in order', () => {
    expect(ids(partidaFinalizada({ jogo: 'sudoku', modo: '6x6', tempo: 100, desfez: true }, dia))).not.toContain('sudoku-relampago:1');
    expect(ids(partidaFinalizada({ jogo: 'sudoku', modo: '4x4', tempo: 31, desfez: true }, dia))).not.toContain('sudoku-relampago:1');
    expect(ids(partidaFinalizada({ jogo: 'sudoku', modo: '4x4', tempo: 30, desfez: true }, dia))).toContain('sudoku-relampago:2');
    partidaFinalizada({ jogo: 'sudoku', modo: '4x4', tempo: 45, desfez: true }, dia);
    expect(lerProgresso().melhorTempoSudokuPorModo).toEqual({ '6x6': 100, '4x4': 30 });

    expect(ids(partidaFinalizada({ jogo: 'sudoku', modo: '9x9-dificil', tempo: 720, desfez: true }, dia))).not.toContain('sudoku-relampago:3');
    expect(ids(partidaFinalizada({ jogo: 'sudoku', modo: '9x9-facil', tempo: 360, desfez: true }, dia))).toContain('sudoku-relampago:4');
  });

  it('unlocks the no eraser medal only in the medium and hard 9x9 without undo', () => {
    expect(ids(partidaFinalizada({ jogo: 'sudoku', modo: '9x9-facil', tempo: 600, desfez: false }, dia))).not.toContain('sem-borracha:1');
    expect(ids(partidaFinalizada({ jogo: 'sudoku', modo: '9x9-medio', tempo: 600, desfez: true }, dia))).not.toContain('sem-borracha:1');
    expect(ids(partidaFinalizada({ jogo: 'sudoku', modo: '9x9-medio', tempo: 600, desfez: false }, dia))).toContain('sem-borracha:1');
  });

  it('counts the different days with a finished sudoku', () => {
    partidaFinalizada({ jogo: 'sudoku', modo: '4x4', tempo: 60 }, dia);
    partidaFinalizada({ jogo: 'sudoku', modo: '4x4', tempo: 60 }, noite);
    partidaFinalizada({ jogo: 'memoria' }, new Date(2026, 10, 3, 15, 0));
    expect(lerProgresso().diasComSudoku).toBe(1);

    salvarProgresso({ diasComSudoku: 6, ultimoDiaSudoku: '2026-11-01' });
    expect(ids(partidaFinalizada({ jogo: 'sudoku', modo: '4x4', tempo: 60 }, new Date(2026, 10, 20, 15, 0)))).toContain('um-por-dia:1');
    expect(lerProgresso().ultimoDiaSudoku).toBe('2026-11-20');
  });

  it('unlocks the secret silent master medal only in the hard 9x9 without any help', () => {
    const silencioso = { jogo: 'sudoku', tempo: 900, dicasUsadas: 0, marcouErros: false, desfez: false };

    expect(ids(partidaFinalizada({ ...silencioso, modo: '9x9-medio' }, dia))).not.toContain('mestre-silencioso:1');
    expect(ids(partidaFinalizada({ ...silencioso, modo: '9x9-dificil', dicasUsadas: 1 }, dia))).not.toContain('mestre-silencioso:1');
    expect(ids(partidaFinalizada({ ...silencioso, modo: '9x9-dificil', marcouErros: true }, dia))).not.toContain('mestre-silencioso:1');
    expect(ids(partidaFinalizada({ ...silencioso, modo: '9x9-dificil', desfez: true }, dia))).not.toContain('mestre-silencioso:1');
    expect(ids(partidaFinalizada({ ...silencioso, modo: '9x9-dificil' }, dia))).toContain('mestre-silencioso:1');
    expect(buscarMedalha('mestre-silencioso')?.secreta).toBe(true);
  });

  it('starts the sudoku counters empty and keeps the medals when migrating from the fourth version', () => {
    const data = '2026-10-01T15:00:00.000Z';
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
      versao: 4,
      partidas: 12,
      xp: 500,
      partidasPorJogo: { sudoku: 3 },
      recompensasLiberadas: ['cor-prata'],
      medalhas: { 'partidas-jogadas': { nivel: 1, data }, explorador: { nivel: 1, data } },
    }));

    const progresso = lerProgresso();

    expect(progresso.versao).toBe(VERSAO_PROGRESSO);
    expect(progresso.sudokusPorModo).toEqual({});
    expect(progresso.melhorTempoSudokuPorModo).toEqual({});
    expect(progresso.sudokusSemAjudaPorModo).toEqual({});
    expect(progresso.diasComSudoku).toBe(0);
    expect(progresso.medalhas).toEqual({ 'partidas-jogadas': { nivel: 1, data }, explorador: { nivel: 1, data } });
    expect(progresso.recompensasLiberadas).toEqual(['cor-prata']);
  });

  it('unlocks the IQ test medals', () => {
    const questoes = (acertos: number) => [...contasCorretas(acertos), ...Array.from({ length: 15 - acertos }, () => ({ correta: false }))];

    expect(ids(partidaFinalizada({ jogo: 'teste-qi', tempo: 100, contas: questoes(14) }, dia))).toEqual(expect.arrayContaining(['mestre-dos-padroes:1']));
    expect(ids(partidaFinalizada({ jogo: 'teste-qi', tempo: 151, contas: questoes(15) }, dia))).toContain('gabarito:1');
    expect(lerProgresso().semTitubear).toBe(0);
    expect(ids(partidaFinalizada({ jogo: 'teste-qi', tempo: 150, contas: questoes(15) }, dia))).toContain('sem-titubear:1');
    expect(ids(partidaFinalizada({ jogo: 'tabuada', contas: contasCorretas(15) }, dia))).not.toContain('mestre-dos-padroes:2');
    expect(lerProgresso().padroesAcertados).toBe(44);
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
    const ouvinte = vi.fn();
    window.addEventListener(EVENTO_CONQUISTAS, ouvinte);

    partidaFinalizada({ jogo: 'memoria' }, dia);
    registrarProgresso({ jogo: '2048', maiorPeca: 512 }, dia);

    expect(ouvinte).toHaveBeenCalledTimes(1);
    expect((ouvinte.mock.calls[0][0] as CustomEvent).detail[0].medalha.id).toBe('rumo-ao-2048');
    window.removeEventListener(EVENTO_CONQUISTAS, ouvinte);
  });

  it('counts the played days only for finished matches and unlocks the constancy medal', () => {
    registrarProgresso({ jogo: '2048', maiorPeca: 64 }, new Date(2026, 10, 1, 15, 0));
    partidaFinalizada({ jogo: 'memoria' }, dia);
    partidaFinalizada({ jogo: 'memoria' }, new Date(2026, 10, 3, 9, 0));

    expect(ids(partidaFinalizada({ jogo: 'memoria' }, new Date(2026, 10, 4, 9, 0)))).toContain('constancia:1');
    expect(lerProgresso().diasSeguidos).toBe(3);
    expect(lerProgresso().ultimoDia).toBe('2026-11-04');
  });

  it('notifies the completed challenge and rewards it with a medal', () => {
    const ouvinte = vi.fn();
    window.addEventListener(EVENTO_DESAFIOS, ouvinte);

    const novas = partidaFinalizada({ jogo: 'tabuada', contas: contasCorretas(5) }, dia);

    expect(ouvinte).toHaveBeenCalledTimes(1);
    expect((ouvinte.mock.calls[0][0] as CustomEvent).detail[0].id).toBe('dia:2026-11-02');
    expect(ids(novas)).toContain('desafios-concluidos:1');
    expect(lerProgresso().desafiosConcluidos).toEqual(['dia:2026-11-02']);
    window.removeEventListener(EVENTO_DESAFIOS, ouvinte);
  });

  it('earns XP for every finished match and keeps it between sessions', () => {
    partidaFinalizada({ jogo: 'memoria' }, dia);
    registrarProgresso({ jogo: '2048', maiorPeca: 64 }, dia);

    expect(lerProgresso().xp).toBe(10);
  });

  it('adds the XP of right answers, completed challenges and new medals', () => {
    partidaFinalizada({ jogo: 'tabuada', contas: contasCorretas(5) }, dia);

    expect(lerProgresso().xp).toBe(10 + 5 + 5 + 30 + 10);
  });

  it('gives XP by size, difficulty and result in Sudoku, 2048 and memory games', () => {
    const ganho = (evento: EventoJogo) => {
      const anterior = lerProgresso().xp;
      partidaFinalizada(evento, dia);
      return lerProgresso().xp - anterior;
    };

    salvarSemMedalhasNemDesafios();

    expect(ganho({ jogo: 'sudoku', modo: '4x4', dicasUsadas: 1 })).toBe(15);
    expect(ganho({ jogo: 'sudoku', modo: '9x9-dificil', dicasUsadas: 1 })).toBe(85);
    expect(ganho({ jogo: 'sudoku', modo: '9x9-dificil', dicasUsadas: 0, marcouErros: false })).toBe(102);
    expect(ganho({ jogo: '2048', maiorPeca: 64 })).toBe(10);
    expect(ganho({ jogo: '2048', maiorPeca: 1024 })).toBe(60);
    expect(ganho({ jogo: 'memoria', nivel: 'facil' })).toBe(12);
    expect(ganho({ jogo: 'memoria', nivel: 'dificil' })).toBe(30);
  });

  it('gives a bigger perfect game bonus to longer matches', () => {
    const ganho = (quantidade: number) => {
      salvarSemMedalhasNemDesafios();
      partidaFinalizada({ jogo: 'tabuada', contas: contasCorretas(quantidade) }, dia);
      return lerProgresso().xp;
    };

    expect(ganho(5)).toBe(20);
    expect(ganho(50)).toBe(85);
  });

  describe('boosters', () => {
    const terca = new Date(2026, 10, 3, 15, 0);
    const quarta = new Date(2026, 10, 4, 15, 0);
    const sabado = new Date(2026, 10, 7, 15, 0);
    const memoria: EventoJogo = { jogo: 'memoria', nivel: 'facil' };

    const salvarSemMedalhas = (dados: object) => {
      salvarProgresso({
        medalhas: Object.fromEntries(medalhas.map((medalha) => [medalha.id, { nivel: medalha.metas.length, data: dia.toISOString() }])),
        desafiosConcluidos: ['dia:2026-11-02', 'dia:2026-11-03', 'dia:2026-11-04', 'dia:2026-11-07', 'semana:2026-S45'],
        ultimoDia: '2026-11-02',
        ...dados,
      });
    };

    const ganho = (evento: EventoJogo, data: Date) => {
      const anterior = lerProgresso().xp;
      partidaFinalizada(evento, data);
      return lerProgresso().xp - anterior;
    };

    it('doubles the XP of the match automatically on weekends', () => {
      salvarSemMedalhas({});

      expect(ganho(memoria, dia)).toBe(12);
      expect(ganho(memoria, sabado)).toBe(24);
      expect(ganho({ jogo: 'tabuada', contas: contasCorretas(50) }, sabado)).toBe(170);
    });

    it('doubles the XP until the end of the day after the daily challenge is completed', () => {
      const ouvinte = vi.fn();
      window.addEventListener(EVENTO_BOOSTERS, ouvinte);
      salvarSemMedalhas({ desafiosConcluidos: ['dia:2026-11-03', 'semana:2026-S45'] });

      expect(ganho({ jogo: 'tabuada', contas: contasCorretas(5) }, dia)).toBe(20 + 30);
      expect(ouvinte).toHaveBeenCalledTimes(1);
      expect((ouvinte.mock.calls[0][0] as CustomEvent).detail).toEqual([{ multiplicador: 2, amanha: false }]);
      expect(ganho(memoria, dia)).toBe(24);
      expect(ganho(memoria, noite)).toBe(24);
      expect(ganho(memoria, terca)).toBe(12);
      expect(ouvinte).toHaveBeenCalledTimes(1);
      window.removeEventListener(EVENTO_BOOSTERS, ouvinte);
    });

    it('triples the XP of the next day after the weekly challenge is completed', () => {
      const ouvinte = vi.fn();
      window.addEventListener(EVENTO_BOOSTERS, ouvinte);
      salvarSemMedalhas({ desafiosConcluidos: ['dia:2026-11-02', 'dia:2026-11-03', 'dia:2026-11-04'], desafios: { semana: { id: 'semana:2026-S45', valor: 149 } } });

      expect(ganho({ jogo: 'tabuada', contas: contasCorretas(1) }, dia)).toBe(16 + 100);
      expect((ouvinte.mock.calls[0][0] as CustomEvent).detail).toEqual([{ multiplicador: 3, amanha: true }]);
      expect(ganho(memoria, dia)).toBe(12);
      expect(ganho(memoria, terca)).toBe(36);
      expect(ganho(memoria, quarta)).toBe(12);
      expect(ouvinte).toHaveBeenCalledTimes(1);
      window.removeEventListener(EVENTO_BOOSTERS, ouvinte);
    });

    it('triples the XP of the next day after seven days in a row', () => {
      salvarSemMedalhas({ diasSeguidos: 6 });

      expect(ganho(memoria, terca)).toBe(12);
      expect(lerProgresso().diasSeguidos).toBe(7);
      expect(lerProgresso().boosters).toEqual({ '2026-11-04': 3 });
      expect(ganho(memoria, quarta)).toBe(36);
      expect(lerProgresso().boosters).toEqual({ '2026-11-04': 3 });
    });

    it('keeps the normal XP of medals and challenges', () => {
      salvarProgresso({ boosters: { '2026-11-02': 3 } });

      partidaFinalizada({ jogo: 'tabuada', contas: contasCorretas(5) }, dia);

      expect(lerProgresso().xp).toBe((10 + 5 + 5) * 3 + 30 + 10);
    });

    it('starts without boosters in progress saved before they existed', () => {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ versao: VERSAO_PROGRESSO, partidas: 3, xp: 40 }));

      expect(lerProgresso().boosters).toEqual({});
      expect(ganho(memoria, dia)).toBeGreaterThanOrEqual(12);
    });
  });

  it('rebuilds the XP of progress saved before the levels existed', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ partidas: 3, acertos: 12 }));

    expect(lerProgresso().xp).toBe(42);
  });

  it('notifies the screen when the player levels up', () => {
    const ouvinte = vi.fn();
    window.addEventListener(EVENTO_NIVEL, ouvinte);
    salvarProgresso({ xp: 185 });

    partidaFinalizada({ jogo: 'memoria' }, dia);
    expect(ouvinte).not.toHaveBeenCalled();

    partidaFinalizada({ jogo: 'memoria' }, dia);
    expect(ouvinte).toHaveBeenCalledTimes(1);
    expect((ouvinte.mock.calls[0][0] as CustomEvent).detail).toEqual({ nivel: 2, titulo: 'Aprendiz', xpNoNivel: 5, xpDoNivel: 230, nivelAnterior: 1 });
    window.removeEventListener(EVENTO_NIVEL, ouvinte);
  });

  it('keeps the items and the title unlocked with the previous level curve', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...criarProgresso(), versao: 3, xp: 2700, recompensasLiberadas: undefined, nivelDoTitulo: undefined }));

    const progresso = lerProgresso();

    expect(progresso.versao).toBe(VERSAO_PROGRESSO);
    expect(progresso.nivelDoTitulo).toBe(10);
    expect(progresso.recompensasLiberadas).toEqual(['cor-prata', 'cor-azul', 'cor-verde', 'cor-laranja', 'cor-roxa', 'bone', 'oculos', 'capa', 'tema-padrao']);
  });

  it('saves the unlocked items with the progress', () => {
    salvarProgresso({ xp: 425 });

    partidaFinalizada({ jogo: 'memoria' }, dia);

    expect(lerProgresso().recompensasLiberadas).toEqual(['cor-prata', 'cor-azul', 'cor-vermelho', 'bone', 'lapis', 'tema-padrao', 'som-padrao', 'danca-pulinho']);
  });

  it('reads the multiplication factors and the divisions from the times table questions', () => {
    expect(contasDaTabuada([
      { questao: '7x8', correta: true },
      { questao: '56÷8', correta: false },
      { questao: '(2x3) + (4x5)', correta: true },
    ])).toEqual([
      { correta: true, fatores: [7, 8], texto: '7x8' },
      { correta: false, divisao: [56, 8], texto: '56÷8' },
      { correta: true, texto: '(2x3) + (4x5)' },
    ]);
  });
});
