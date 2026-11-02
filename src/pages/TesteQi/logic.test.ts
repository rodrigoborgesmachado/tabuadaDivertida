import { DIFICULDADES, desempenhoPorTipo, gerarPartida, gerarQuestao, pontuacaoQi, QUESTOES_POR_DIFICULDADE, REGRAS, solucoes, textoQuestao, tituloQi, TOTAL_QUESTOES, type Questao } from './logic';

const GERACOES = 150;

const respondida = (questao: Questao, correta: boolean) => ({ tipo: questao.tipo, dificuldade: questao.dificuldade, correta });

describe('Teste de QI logic', () => {
  it('finds the single answer of the card examples', () => {
    expect(solucoes('sequencia', [[2, 4, 6, 8, null]])).toEqual([10]);
    expect(solucoes('sequencia', [[3, 6, 12, 24, null]])).toEqual([48]);
    expect(solucoes('sequencia', [[1, 4, 9, 16, 25, null]])).toEqual([36]);
    expect(solucoes('sequencia', [[1, 1, 2, 3, 5, null]])).toEqual([8]);
    expect(solucoes('sequencia', [[2, 5, 4, 7, 6, null]])).toEqual([9]);
    expect(solucoes('meio', [[5, 10, null, 40, 80]])).toEqual([20]);
    expect(solucoes('grade', [[2, 3, 5], [4, 6, 10], [7, null, 15]])).toEqual([8]);
    expect(solucoes('intruso', [[2, 4, 7, 8, 10]])).toEqual([7]);
    expect(solucoes('analogia', [[2, 4], [3, 9], [4, 16], [5, null]])).toEqual([25]);
    expect(solucoes('piramide', [[null], [5, 7], [2, 3, 4]])).toEqual([12]);
    expect(solucoes('piramide', [[12], [5, 7], [2, null, 4]])).toEqual([3]);
  });

  it('detects questions with more than one answer', () => {
    expect(solucoes('sequencia', [[1, 2, 4, null]]).length).toBeGreaterThan(1);
    expect(solucoes('analogia', [[2, 4], [3, 9], [5, null]]).length).toBeGreaterThan(1);
    expect(solucoes('grade', [[2, 2, 4], [null, 2, 6]]).length).toBeGreaterThan(1);
    expect(solucoes('intruso', [[2, 4, 6, 8, 9]]).length).toBeGreaterThan(1);
  });

  REGRAS.forEach((regra) => {
    it(`always generates a single integer answer for the ${regra.id} rule`, () => {
      for (let geracao = 0; geracao < GERACOES; geracao++) {
        const questao = gerarQuestao(regra);
        const vazias = questao.linhas.flat().filter((celula) => celula === null).length;

        expect(Number.isInteger(questao.resposta)).toBe(true);
        expect(questao.resposta).toBeGreaterThanOrEqual(0);
        expect(vazias).toBe(regra.tipo === 'intruso' ? 0 : 1);
        expect(solucoes(questao.tipo, questao.linhas)).toEqual([questao.resposta]);
        expect(questao.explicacao).not.toBe('');

        if (regra.dificuldade === 'facil') {
          expect(questao.opcoes).toHaveLength(4);
          expect(new Set(questao.opcoes).size).toBe(4);
          expect(questao.opcoes).toContain(questao.resposta);
        } else {
          expect(questao.opcoes).toBeUndefined();
        }
      }
    });
  });

  it('has rules of every type and difficulty', () => {
    expect(new Set(REGRAS.map((regra) => regra.tipo)).size).toBe(6);
    DIFICULDADES.forEach((dificuldade) => {
      expect(REGRAS.filter((regra) => regra.dificuldade === dificuldade).length).toBeGreaterThanOrEqual(QUESTOES_POR_DIFICULDADE);
    });
  });

  it('builds a match with increasing difficulty and no repeated rule in the same level', () => {
    const partida = gerarPartida();

    expect(partida).toHaveLength(TOTAL_QUESTOES);
    expect(partida.map((questao) => questao.dificuldade)).toEqual(DIFICULDADES.flatMap((dificuldade) => Array(QUESTOES_POR_DIFICULDADE).fill(dificuldade)));
    DIFICULDADES.forEach((dificuldade) => {
      const regras = partida.filter((questao) => questao.dificuldade === dificuldade).map((questao) => questao.regra);
      expect(new Set(regras).size).toBe(QUESTOES_POR_DIFICULDADE);
    });
  });

  it('writes the question as text with the missing number', () => {
    const base = { regra: 'teste', dificuldade: 'facil' as const, resposta: 0, explicacao: '' };

    expect(textoQuestao({ ...base, tipo: 'sequencia', linhas: [[2, 4, 6, null]] })).toBe('2, 4, 6, ?');
    expect(textoQuestao({ ...base, tipo: 'analogia', linhas: [[2, 4], [5, null]] })).toBe('2 → 4, 5 → ?');
    expect(textoQuestao({ ...base, tipo: 'grade', linhas: [[2, 3, 5], [1, null, 3]] })).toBe('2 3 5 | 1 ? 3');
  });

  it('gives a playful score that weighs the harder questions more', () => {
    const partida = gerarPartida();

    expect(pontuacaoQi(partida.map((questao) => respondida(questao, false)))).toBe(70);
    expect(pontuacaoQi(partida.map((questao) => respondida(questao, true)))).toBe(145);
    expect(pontuacaoQi(partida.map((questao) => respondida(questao, questao.dificuldade === 'dificil'))))
      .toBeGreaterThan(pontuacaoQi(partida.map((questao) => respondida(questao, questao.dificuldade === 'facil'))));
  });

  it('picks a fun title for each score', () => {
    expect(tituloQi(70)).toBe('Aprendiz dos Números');
    expect(tituloQi(100)).toBe('Detetive dos Números');
    expect(tituloQi(120)).toBe('Mente Afiada');
    expect(tituloQi(145)).toBe('Gênio dos Padrões');
  });

  it('groups the right answers by question type', () => {
    expect(desempenhoPorTipo([
      { tipo: 'sequencia', dificuldade: 'facil', correta: true },
      { tipo: 'sequencia', dificuldade: 'medio', correta: false },
      { tipo: 'piramide', dificuldade: 'dificil', correta: true },
    ])).toEqual([
      { tipo: 'sequencia', nome: 'Próximo número', acertos: 1, total: 2 },
      { tipo: 'piramide', nome: 'Pirâmide', acertos: 1, total: 1 },
    ]);
  });
});
