import { comparar, conta, CONFIG_NIVEL, decimal, explicarRodada, formatarDecimal, fracao, gerarRodada, numero, type Modalidade, type Nivel, type Valor } from './logic';

const modalidades: Modalidade[] = ['tabuada', 'fracoes', 'decimais', 'misturado'];
const niveis: Nivel[] = ['facil', 'medio', 'dificil'];

const valorReal = (valor: Valor) => {
  if (valor.tipo === 'conta') {
    const [a, b] = valor.texto.split(' × ').map(Number);
    return a * b;
  }

  if (valor.tipo === 'fracao') {
    const [n, d] = valor.texto.split('/').map(Number);
    return n / d;
  }

  return Number(valor.texto.replace(',', '.'));
};

describe('Maior ou menor logic', () => {
  it('compares operations with numbers', () => {
    expect(comparar(conta(6, 7), numero(45))).toBe('direita');
    expect(comparar(numero(45), conta(6, 7))).toBe('esquerda');
    expect(comparar(conta(6, 7), numero(42))).toBe('iguais');
  });

  it('compares fractions without rounding', () => {
    expect(comparar(fracao(1, 2), fracao(2, 5))).toBe('esquerda');
    expect(comparar(fracao(1, 3), fracao(2, 6))).toBe('iguais');
    expect(comparar(fracao(2, 3), fracao(7, 10))).toBe('direita');
    expect(comparar(fracao(1, 3), fracao(333, 1000))).toBe('esquerda');
  });

  it('compares decimals without rounding', () => {
    expect(comparar(decimal(7, 1), decimal(65, 2))).toBe('esquerda');
    expect(comparar(decimal(5, 1), decimal(50, 2))).toBe('iguais');
    expect(comparar(decimal(1, 1), decimal(2, 1))).toBe('direita');
    expect(comparar(decimal(3, 1), decimal(299, 3))).toBe('esquerda');
    expect(comparar(decimal(30, 2), decimal(300, 3))).toBe('iguais');
  });

  it('formats decimals with a comma', () => {
    expect(formatarDecimal(7, 1)).toBe('0,7');
    expect(formatarDecimal(65, 2)).toBe('0,65');
    expect(formatarDecimal(105, 2)).toBe('1,05');
    expect(formatarDecimal(5, 3)).toBe('0,005');
  });

  it('generates rounds with valid values and the right answer for every mode and level', () => {
    modalidades.forEach((modalidade) => {
      niveis.forEach((nivel) => {
        for (let rodada = 0; rodada < 300; rodada += 1) {
          const { esquerda, direita } = gerarRodada(modalidade, nivel);
          const diferenca = valorReal(esquerda) - valorReal(direita);
          const esperado = Math.abs(diferenca) < 1e-9 ? 'iguais' : diferenca > 0 ? 'esquerda' : 'direita';

          expect(comparar(esquerda, direita)).toBe(esperado);
          expect(esquerda.texto).not.toBe(direita.texto);
          [esquerda, direita].forEach((valor) => {
            expect(valor.numerador).toBeGreaterThanOrEqual(0);
            expect(Number.isInteger(valor.numerador)).toBe(true);
            expect(Number.isInteger(valor.denominador)).toBe(true);
          });
        }
      });
    });
  });

  it('keeps the operations inside the level range', () => {
    niveis.forEach((nivel) => {
      for (let rodada = 0; rodada < 100; rodada += 1) {
        const { esquerda, direita } = gerarRodada('tabuada', nivel);
        const operacao = esquerda.tipo === 'conta' ? esquerda : direita;
        operacao.texto.split(' × ').map(Number).forEach((fator) => {
          expect(fator).toBeLessThanOrEqual(CONFIG_NIVEL[nivel].fatorMaximo);
        });
      }
    });
  });

  it('never loops or repeats the value when the random number is constant', () => {
    [0, 0.99].forEach((valor) => {
      modalidades.forEach((modalidade) => {
        const { esquerda, direita } = gerarRodada(modalidade, 'facil', () => valor);
        expect(esquerda.texto).not.toBe(direita.texto);
      });
    });
  });

  it('gives harder levels less time', () => {
    expect(CONFIG_NIVEL.facil.segundos).toBeGreaterThan(CONFIG_NIVEL.medio.segundos);
    expect(CONFIG_NIVEL.medio.segundos).toBeGreaterThan(CONFIG_NIVEL.dificil.segundos);
  });

  it('explains the correct values', () => {
    expect(explicarRodada({ esquerda: conta(6, 7), direita: numero(45) })).toEqual({ esquerda: '6 × 7 = 42', direita: '45', sinal: '<' });
    expect(explicarRodada({ esquerda: fracao(1, 2), direita: fracao(2, 5) })).toEqual({ esquerda: '1/2 = 5/10', direita: '2/5 = 4/10', sinal: '>' });
    expect(explicarRodada({ esquerda: decimal(7, 1), direita: decimal(65, 2) })).toEqual({ esquerda: '0,7 = 0,70', direita: '0,65', sinal: '>' });
    expect(explicarRodada({ esquerda: fracao(1, 4), direita: fracao(2, 8) })).toEqual({ esquerda: '1/4 = 2/8', direita: '2/8', sinal: '=' });
  });
});
