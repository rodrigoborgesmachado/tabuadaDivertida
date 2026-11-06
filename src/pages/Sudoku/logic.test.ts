import { buscarModo, casaParaDica, casasComConflito, contarSolucoes, dimensoesBloco, estaCompleto, gerarSolucao, gerarTabuleiro, mesmaRegiao, MODOS, moverCasa, PENALIDADE_DICA, resultadoRanking, type Grade } from './logic';

const solucao4: Grade = [
  [1, 2, 3, 4],
  [3, 4, 1, 2],
  [2, 1, 4, 3],
  [4, 3, 2, 1],
];

const valida = (grade: Grade) => {
  const tamanho = grade.length;
  const { linhas, colunas } = dimensoesBloco(tamanho);
  const completa = (valores: number[]) => [...valores].sort((a, b) => a - b).join() === Array.from({ length: tamanho }, (_, i) => i + 1).join();

  return Array.from({ length: tamanho }, (_, i) => {
    const bloco = Array.from({ length: tamanho }, (__, j) => grade[Math.floor(i / linhas) * linhas + Math.floor(j / colunas)][(i % linhas) * colunas + (j % colunas)]);
    return completa(grade[i]) && completa(grade.map((linha) => linha[i])) && completa(bloco);
  }).every(Boolean);
};

describe('Sudoku logic', () => {
  it('uses 2x2, 2x3 and 3x3 blocks', () => {
    expect(dimensoesBloco(4)).toEqual({ linhas: 2, colunas: 2 });
    expect(dimensoesBloco(6)).toEqual({ linhas: 2, colunas: 3 });
    expect(dimensoesBloco(9)).toEqual({ linhas: 3, colunas: 3 });
  });

  it('offers the kids sizes and the classic levels', () => {
    expect(MODOS.map((modo) => modo.tamanho)).toEqual([4, 6, 9, 9, 9]);
    expect(MODOS.filter((modo) => modo.tamanho === 9).map((modo) => modo.reveladas)).toEqual([40, 32, 26]);
    expect(buscarModo('9x9-medio')?.nome).toBe('9×9 médio');
    expect(buscarModo('outro')).toBeUndefined();
  });

  it.each([4, 6, 9] as const)('generates a valid %ix%i solution', (tamanho) => {
    expect(valida(gerarSolucao(tamanho))).toBe(true);
  });

  it('counts the solutions up to the limit', () => {
    expect(contarSolucoes(solucao4)).toBe(1);
    expect(contarSolucoes(Array.from({ length: 4 }, () => Array(4).fill(0)))).toBe(2);
    expect(contarSolucoes([[1, 1, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]])).toBe(0);
  });

  it.each(MODOS.map((modo) => [modo.id, modo]))('generates %s boards with a unique solution', (_, modo) => {
    for (let i = 0; i < 3; i += 1) {
      const { inicial, solucao } = gerarTabuleiro(modo);
      const reveladas = inicial.flat().filter(Boolean).length;

      expect(valida(solucao)).toBe(true);
      expect(contarSolucoes(inicial)).toBe(1);
      expect(reveladas).toBeGreaterThanOrEqual(modo.reveladas);
      expect(reveladas).toBeLessThanOrEqual(modo.reveladas + 4);
      inicial.forEach((linha, l) => linha.forEach((valor, c) => valor && expect(valor).toBe(solucao[l][c])));
    }
  });

  it('marks repeated numbers in the same row, column or block', () => {
    const grade: Grade = [
      [1, 0, 0, 1],
      [0, 0, 0, 0],
      [0, 2, 0, 0],
      [2, 0, 0, 0],
    ];

    expect([...casasComConflito(grade)].sort()).toEqual(['0-0', '0-3', '2-1', '3-0']);
    expect(casasComConflito(solucao4).size).toBe(0);
  });

  it('knows when the board matches the solution', () => {
    const quase = solucao4.map((linha) => [...linha]);
    quase[3][3] = 0;

    expect(estaCompleto(solucao4, solucao4)).toBe(true);
    expect(estaCompleto(quase, solucao4)).toBe(false);
  });

  it('checks if two cells share a row, column or block', () => {
    expect(mesmaRegiao({ linha: 0, coluna: 0 }, { linha: 0, coluna: 5 }, 6)).toBe(true);
    expect(mesmaRegiao({ linha: 0, coluna: 0 }, { linha: 1, coluna: 2 }, 6)).toBe(true);
    expect(mesmaRegiao({ linha: 0, coluna: 0 }, { linha: 2, coluna: 2 }, 6)).toBe(false);
    expect(mesmaRegiao({ linha: 0, coluna: 0 }, { linha: 1, coluna: 3 }, 6)).toBe(false);
  });

  it('gives the hint on the selected cell or on a random wrong one', () => {
    const grade = solucao4.map((linha) => [...linha]);
    grade[0][0] = 0;
    grade[2][2] = 3;

    expect(casaParaDica(grade, solucao4, { linha: 2, coluna: 2 })).toEqual({ linha: 2, coluna: 2 });
    expect(casaParaDica(grade, solucao4, { linha: 1, coluna: 1 }, () => 0)).toEqual({ linha: 0, coluna: 0 });
    expect(casaParaDica(grade, solucao4, null, () => 0.99)).toEqual({ linha: 2, coluna: 2 });
    expect(casaParaDica(solucao4, solucao4, null)).toBeNull();
  });

  it('moves the selection inside the board', () => {
    expect(moverCasa({ linha: 0, coluna: 0 }, 'cima', 9)).toEqual({ linha: 0, coluna: 0 });
    expect(moverCasa({ linha: 0, coluna: 0 }, 'baixo', 9)).toEqual({ linha: 1, coluna: 0 });
    expect(moverCasa({ linha: 3, coluna: 3 }, 'direita', 4)).toEqual({ linha: 3, coluna: 3 });
    expect(moverCasa({ linha: 3, coluna: 3 }, 'esquerda', 4)).toEqual({ linha: 3, coluna: 2 });
  });

  it('builds the ranking result with the hint penalty', () => {
    expect(PENALIDADE_DICA).toBe(30);
    expect(resultadoRanking(95, 0)).toEqual({ tempo: 95, extras: { segundos: 95, dicas: 0 } });
    expect(resultadoRanking(95, 2)).toEqual({ tempo: 155, extras: { segundos: 95, dicas: 2 } });
  });
});
