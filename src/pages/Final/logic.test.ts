import { contasErradas, desempenhoDaPartida, mensagemDoDesempenho, respostasDaPartida } from './logic';

const questoes = [
  { questao: '3x4', resposta: '12', correta: true },
  { questao: '7x8', resposta: '54', correta: false },
  { questao: '9x9', resposta: '81', correta: true },
  { questao: '56÷8', resposta: '6', correta: false },
  { questao: '7x8', resposta: '58', correta: false },
];

describe('Final logic', () => {
  it('classifica o desempenho pela porcentagem de acertos', () => {
    expect(desempenhoDaPartida(20, 20)).toBe('perfeito');
    expect(desempenhoDaPartida(14, 20)).toBe('otimo');
    expect(desempenhoDaPartida(8, 20)).toBe('bom');
    expect(desempenhoDaPartida(7, 20)).toBe('treinar');
    expect(desempenhoDaPartida(0, 20)).toBe('zero');
    expect(desempenhoDaPartida(0, 0)).toBe('zero');
  });

  it('monta a mensagem com o nome do jogador e sem citar o ranking', () => {
    (['perfeito', 'otimo', 'bom', 'treinar', 'zero'] as const).forEach((desempenho) => {
      const { titulo, texto } = mensagemDoDesempenho(desempenho, 'Ana');
      expect(titulo).toContain('Ana');
      expect(`${titulo} ${texto}`.toLowerCase()).not.toContain('ranking');
    });
  });

  it('lista os erros primeiro com a resposta certa', () => {
    const respostas = respostasDaPartida(questoes);

    expect(respostas.map(({ questao }) => questao)).toEqual(['7x8', '56÷8', '7x8', '3x4', '9x9']);
    expect(respostas[0]).toEqual({ questao: '7x8', resposta: '54', correta: false, certa: 56 });
    expect(respostas[1].certa).toBe(7);
  });

  it('gera as contas do treino sem repetir contas erradas', () => {
    expect(contasErradas(questoes)).toEqual([
      { texto: '7x8', resposta: 56 },
      { texto: '56÷8', resposta: 7 },
    ]);
    expect(contasErradas([{ questao: '3x4', resposta: '12', correta: true }])).toEqual([]);
  });
});
