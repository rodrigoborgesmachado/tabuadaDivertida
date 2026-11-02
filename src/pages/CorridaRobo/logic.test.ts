import { formatarTempo, gerarConta, NIVEIS_ROBO, posicaoRobo, tempoDoRobo, TOTAL_CASAS, vencedor, type NivelRobo, type Operacao } from './logic';

const NIVEIS = Object.keys(NIVEIS_ROBO) as NivelRobo[];
const GERACOES = 200;

const sequencia = (valores: number[]) => {
  let indice = 0;
  return () => valores[indice++ % valores.length];
};

describe('Corrida contra o robô logic', () => {
  NIVEIS.forEach((nivel) => {
    it(`moves the ${nivel} robot at a steady speed`, () => {
      const { msPorCasa } = NIVEIS_ROBO[nivel];

      for (let casa = 0; casa <= TOTAL_CASAS; casa++) {
        expect(posicaoRobo(nivel, casa * msPorCasa)).toBe(casa);
        expect(posicaoRobo(nivel, casa * msPorCasa + msPorCasa / 2)).toBe(Math.min(TOTAL_CASAS, casa + 0.5));
      }
    });

    it(`gives the same position to the ${nivel} robot no matter how the time is split`, () => {
      const total = tempoDoRobo(nivel) / 2;
      let decorrido = 0;
      let anterior = 0;

      while (decorrido < total) {
        decorrido += 97;
        const posicao = posicaoRobo(nivel, decorrido);
        expect(posicao).toBeGreaterThanOrEqual(anterior);
        anterior = posicao;
      }

      expect(anterior).toBeCloseTo(posicaoRobo(nivel, decorrido));
    });

    it(`ends the race when the ${nivel} robot reaches the finish line`, () => {
      expect(vencedor(TOTAL_CASAS - 1, nivel, tempoDoRobo(nivel) - 1)).toBeNull();
      expect(vencedor(TOTAL_CASAS - 1, nivel, tempoDoRobo(nivel))).toBe('robo');
      expect(posicaoRobo(nivel, tempoDoRobo(nivel) * 2)).toBe(TOTAL_CASAS);
    });
  });

  it('keeps the robot still before the start', () => {
    expect(posicaoRobo('turbo', -500)).toBe(0);
    expect(posicaoRobo('turbo', 0)).toBe(0);
  });

  it('makes each level faster than the previous one', () => {
    const tempos = NIVEIS.map(tempoDoRobo);

    expect(NIVEIS.map((nivel) => NIVEIS_ROBO[nivel].nome)).toEqual(['Robô sonolento', 'Robô atento', 'Robô turbo', 'Robô campeão']);
    expect([...tempos].sort((a, b) => b - a)).toEqual(tempos);
  });

  it('gives the win to the player who reaches the finish line', () => {
    expect(vencedor(TOTAL_CASAS, 'campeao', 1000)).toBe('jogador');
    expect(vencedor(TOTAL_CASAS, 'campeao', tempoDoRobo('campeao'))).toBe('jogador');
    expect(vencedor(5, 'sonolento', 1000)).toBeNull();
  });

  (['M', 'A', 'S', 'D', 'R'] as Operacao[]).forEach((operacao) => {
    it(`always generates a valid ${operacao} operation`, () => {
      for (let geracao = 0; geracao < GERACOES; geracao++) {
        const conta = gerarConta(operacao);
        const [a, sinal, b] = conta.texto.split(/([x+\-÷])/);
        const resultados: Record<string, number> = { x: Number(a) * Number(b), '+': Number(a) + Number(b), '-': Number(a) - Number(b), '÷': Number(a) / Number(b) };

        expect(Number.isInteger(conta.resposta)).toBe(true);
        expect(conta.resposta).toBeGreaterThanOrEqual(0);
        expect(resultados[sinal]).toBe(conta.resposta);
        if (operacao !== 'R') {
          expect(sinal).toBe({ M: 'x', A: '+', S: '-', D: '÷' }[operacao]);
        }
      }
    });
  });

  it('writes the multiplication like the times table game', () => {
    expect(gerarConta('M', sequencia([0.5, 0]))).toEqual({ texto: '6x2', resposta: 12 });
    expect(gerarConta('D', sequencia([0.5, 0]))).toEqual({ texto: '12÷2', resposta: 6 });
    expect(gerarConta('S', sequencia([0, 0.5]))).toEqual({ texto: '51-2', resposta: 49 });
  });

  it('formats the race time', () => {
    expect(formatarTempo(0)).toBe('0,0s');
    expect(formatarTempo(35290)).toBe('35,2s');
  });
});
