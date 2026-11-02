import { criarCartas, criarTabuleiro, formamPar, formatarTempo, gerarPares, isMelhorResultado, PARES_POR_NIVEL, TABUADAS, type Carta, type Nivel } from './logic';

const niveis: Nivel[] = ['facil', 'medio', 'dificil'];

describe('Memória da tabuada logic', () => {
  it('creates correct and unambiguous pairs for every table and level', () => {
    TABUADAS.forEach((tabuada) => {
      niveis.forEach((nivel) => {
        for (let rodada = 0; rodada < 20; rodada += 1) {
          const pares = gerarPares(tabuada, PARES_POR_NIVEL[nivel]);
          const resultados = pares.map((par) => par.resultado);

          expect(pares).toHaveLength(PARES_POR_NIVEL[nivel]);
          expect(new Set(resultados).size).toBe(resultados.length);
          pares.forEach((par) => {
            expect(par.a * par.b).toBe(par.resultado);
          });
        }
      });
    });
  });

  it('uses only the chosen table', () => {
    const pares = gerarPares(7, PARES_POR_NIVEL.dificil);

    pares.forEach((par) => {
      expect(par.a).toBe(7);
    });
  });

  it('keeps the chosen table between 1 and 10 when there are enough factors', () => {
    const pares = gerarPares(7, PARES_POR_NIVEL.medio);

    pares.forEach((par) => {
      expect(par.b).toBeGreaterThanOrEqual(1);
      expect(par.b).toBeLessThanOrEqual(10);
    });
  });

  it('never shows two operations with the same result in the mixed mode', () => {
    const random = () => 0;
    const pares = gerarPares('misturado', 12, random);

    expect(new Set(pares.map((par) => par.resultado)).size).toBe(12);
  });

  it('creates one operation card and one result card per pair', () => {
    const cartas = criarCartas([{ a: 7, b: 8, resultado: 56 }]);
    const conta = cartas.find((carta) => carta.tipo === 'conta') as Carta;
    const resultado = cartas.find((carta) => carta.tipo === 'resultado') as Carta;

    expect(cartas).toHaveLength(2);
    expect(conta.texto).toBe('7 × 8');
    expect(resultado.texto).toBe('56');
    expect(formamPar(conta, resultado)).toBe(true);
  });

  it('creates a board with two cards per pair and unique ids', () => {
    niveis.forEach((nivel) => {
      const cartas = criarTabuleiro('misturado', nivel);

      expect(cartas).toHaveLength(PARES_POR_NIVEL[nivel] * 2);
      expect(new Set(cartas.map((carta) => carta.id)).size).toBe(cartas.length);
    });
  });

  it('only matches an operation with its own result', () => {
    const conta: Carta = { id: 'conta-12', tipo: 'conta', texto: '3 × 4', valor: 12 };
    const resultado: Carta = { id: 'resultado-12', tipo: 'resultado', texto: '12', valor: 12 };
    const outroResultado: Carta = { id: 'resultado-15', tipo: 'resultado', texto: '15', valor: 15 };
    const outraConta: Carta = { id: 'conta-15', tipo: 'conta', texto: '3 × 5', valor: 15 };

    expect(formamPar(conta, resultado)).toBe(true);
    expect(formamPar(resultado, conta)).toBe(true);
    expect(formamPar(conta, outroResultado)).toBe(false);
    expect(formamPar(conta, outraConta)).toBe(false);
  });

  it('prefers fewer moves and then less time as the best result', () => {
    expect(isMelhorResultado({ jogadas: 10, segundos: 50 }, null)).toBe(true);
    expect(isMelhorResultado({ jogadas: 9, segundos: 90 }, { jogadas: 10, segundos: 50 })).toBe(true);
    expect(isMelhorResultado({ jogadas: 10, segundos: 40 }, { jogadas: 10, segundos: 50 })).toBe(true);
    expect(isMelhorResultado({ jogadas: 10, segundos: 50 }, { jogadas: 10, segundos: 50 })).toBe(false);
    expect(isMelhorResultado({ jogadas: 11, segundos: 10 }, { jogadas: 10, segundos: 50 })).toBe(false);
  });

  it('formats the elapsed time', () => {
    expect(formatarTempo(0)).toBe('0:00');
    expect(formatarTempo(65)).toBe('1:05');
    expect(formatarTempo(600)).toBe('10:00');
  });
});
