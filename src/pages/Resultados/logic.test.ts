import type { HistoricoItem } from '../../services/historico';
import { comparacaoSemanal, contasParaTreino, errosMaisComuns, evolucao, filtrarPorPeriodo, mapaTabuada, respostaCorreta, resumir, taxaAcerto, tempoPorConta } from './logic';

const diaDeNovembro = (dia: number) => new Date(2026, 10, dia, 15).toISOString();

const partida = (item: Partial<HistoricoItem> = {}): HistoricoItem => ({
  quantidadeQuestoes: '4',
  quantidadeAcertos: '3',
  tempo: '20',
  nome: 'Ana',
  tipo: 'M',
  questoes: [
    { questao: '7x8', resposta: '54', correta: false },
    { questao: '7x8', resposta: '56', correta: true },
    { questao: '3x4', resposta: '12', correta: true },
    { questao: '9x9', resposta: '81', correta: true },
  ],
  ...item,
});

describe('Resultados logic', () => {
  it('calculates the correct answer of every kind of question', () => {
    expect(respostaCorreta('7x8')).toBe(56);
    expect(respostaCorreta('56÷8')).toBe(7);
    expect(respostaCorreta('9-3')).toBe(6);
    expect(respostaCorreta('4+5')).toBe(9);
    expect(respostaCorreta('(3+5) x 6 ÷ (4+4)')).toBe(6);
    expect(respostaCorreta('(2x3) + (4x5)')).toBe(26);
    expect(respostaCorreta('(1+2) x (9-4)')).toBe(15);
    expect(respostaCorreta('7÷2')).toBeNull();
    expect(respostaCorreta('abc')).toBeNull();
    expect(respostaCorreta('')).toBeNull();
  });

  it('filters by period ignoring old matches without date', () => {
    const historico = [partida({ data: diaDeNovembro(1) }), partida({ data: diaDeNovembro(20) }), partida()];
    const agora = new Date(2026, 10, 22, 12);

    expect(filtrarPorPeriodo(historico, '7', agora)).toEqual([historico[1]]);
    expect(filtrarPorPeriodo(historico, '30', agora)).toEqual(historico.slice(0, 2));
    expect(filtrarPorPeriodo(historico, 'tudo', agora)).toEqual(historico);
  });

  it('summarizes the totals, the time per question and the record by type', () => {
    const { geral, porTipo } = resumir([partida({ pontuacao: 30 }), partida({ tipo: 'D', quantidadeAcertos: '1', pontuacao: 50 }), partida({ tipo: 'D' })]);

    expect(geral).toEqual({ jogos: 3, questoes: 12, acertos: 7, tempo: 60, recorde: 50 });
    expect(taxaAcerto(geral)).toBeCloseTo(7 / 12);
    expect(tempoPorConta(geral)).toBe(5);
    expect(porTipo.M.recorde).toBe(30);
    expect(porTipo.D).toEqual({ jogos: 2, questoes: 8, acertos: 4, tempo: 40, recorde: 50 });
    expect(taxaAcerto(resumir([]).geral)).toBe(0);
  });

  it('lists the most common errors with the correct answer and builds the training', () => {
    const historico = [
      partida(),
      partida({ questoes: [{ questao: '7x8', resposta: '58', correta: false }, { questao: '12÷5', resposta: '2', correta: false }] }),
      partida({ questoes: null }),
    ];

    expect(errosMaisComuns(historico)).toEqual([
      { questao: '7x8', resposta: 56, erros: 2 },
      { questao: '12÷5', resposta: null, erros: 1 },
    ]);
    expect(contasParaTreino(historico)).toEqual([{ texto: '7x8', resposta: 56 }]);
  });

  it('builds the times table map from the answered multiplications', () => {
    const mapa = mapaTabuada([
      partida(),
      partida(),
      partida({ questoes: [{ questao: '7x8', resposta: '54', correta: false }, { questao: '3x4', resposta: '11', correta: false }, { questao: '7+8', resposta: '1', correta: false }] }),
    ]);
    const casa = (a: number, b: number) => mapa.flat().find((item) => item.a === a && item.b === b);

    expect(mapa).toHaveLength(9);
    expect(mapa[0]).toHaveLength(9);
    expect(casa(9, 9)).toMatchObject({ acertos: 2, erros: 0, desempenho: 'domina' });
    expect(casa(3, 4)).toMatchObject({ acertos: 2, erros: 1, desempenho: 'as-vezes' });
    expect(casa(7, 8)).toMatchObject({ acertos: 2, erros: 3, desempenho: 'erra' });
    expect(casa(8, 7)).toMatchObject({ acertos: 0, erros: 0, desempenho: 'sem-dados' });
  });

  it('shows the evolution of the last matches with date in order', () => {
    const historico = [
      partida({ data: diaDeNovembro(3), quantidadeAcertos: '2' }),
      partida(),
      partida({ data: diaDeNovembro(1), quantidadeAcertos: '4', tempo: '8' }),
      partida({ data: diaDeNovembro(2), quantidadeQuestoes: '0' }),
    ];

    expect(evolucao(historico)).toEqual([
      { data: new Date(diaDeNovembro(1)), taxa: 100, tempoPorConta: 2 },
      { data: new Date(diaDeNovembro(3)), taxa: 50, tempoPorConta: 5 },
    ]);
    expect(evolucao(historico, 1)).toHaveLength(1);
  });

  it('compares this week with the last one', () => {
    const agora = new Date(2026, 10, 12, 12);
    const historico = [
      partida({ data: diaDeNovembro(10), quantidadeAcertos: '4' }),
      partida({ data: diaDeNovembro(4), quantidadeAcertos: '2' }),
      partida({ quantidadeAcertos: '0' }),
    ];

    expect(comparacaoSemanal(historico, agora)).toEqual({ atual: 1, anterior: 0.5, diferenca: 50 });
    expect(comparacaoSemanal(historico.slice(0, 1), agora)).toBeNull();
  });
});
