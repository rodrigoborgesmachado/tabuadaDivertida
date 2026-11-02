export type Tabuada = number | 'misturado';

export type Nivel = 'facil' | 'medio' | 'dificil';

export type TipoCarta = 'conta' | 'resultado';

export interface Par {
  a: number;
  b: number;
  resultado: number;
}

export interface Carta {
  id: string;
  tipo: TipoCarta;
  texto: string;
  valor: number;
}

export interface Resultado {
  jogadas: number;
  segundos: number;
}

export const PARES_POR_NIVEL: Record<Nivel, number> = {
  facil: 6,
  medio: 8,
  dificil: 12,
};

export const TABUADAS: Tabuada[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 'misturado'];

const embaralhar = <T>(itens: T[], random: () => number): T[] => {
  const copia = [...itens];
  for (let index = copia.length - 1; index > 0; index -= 1) {
    const troca = Math.floor(random() * (index + 1));
    [copia[index], copia[troca]] = [copia[troca], copia[index]];
  }
  return copia;
};

export const gerarPares = (tabuada: Tabuada, quantidade: number, random: () => number = Math.random): Par[] => {
  if (tabuada !== 'misturado') {
    const fatores = Array.from({ length: Math.max(10, quantidade) }, (_, index) => index + 1);
    return embaralhar(fatores, random)
      .slice(0, quantidade)
      .map((fator) => ({ a: tabuada, b: fator, resultado: tabuada * fator }));
  }

  const contasPorResultado = new Map<number, Par[]>();
  for (let a = 1; a <= 10; a += 1) {
    for (let b = 1; b <= 10; b += 1) {
      const contas = contasPorResultado.get(a * b) || [];
      contas.push({ a, b, resultado: a * b });
      contasPorResultado.set(a * b, contas);
    }
  }

  return embaralhar(Array.from(contasPorResultado.keys()), random)
    .slice(0, quantidade)
    .map((resultado) => {
      const contas = contasPorResultado.get(resultado) as Par[];
      return contas[Math.floor(random() * contas.length)];
    });
};

export const criarCartas = (pares: Par[], random: () => number = Math.random): Carta[] => {
  const cartas = pares.flatMap((par): Carta[] => [
    { id: `conta-${par.resultado}`, tipo: 'conta', texto: `${par.a} × ${par.b}`, valor: par.resultado },
    { id: `resultado-${par.resultado}`, tipo: 'resultado', texto: String(par.resultado), valor: par.resultado },
  ]);
  return embaralhar(cartas, random);
};

export const criarTabuleiro = (tabuada: Tabuada, nivel: Nivel, random: () => number = Math.random): Carta[] =>
  criarCartas(gerarPares(tabuada, PARES_POR_NIVEL[nivel], random), random);

export const formamPar = (primeira: Carta, segunda: Carta): boolean =>
  primeira.tipo !== segunda.tipo && primeira.valor === segunda.valor;

export const isMelhorResultado = (novo: Resultado, atual: Resultado | null): boolean => {
  if (!atual) {
    return true;
  }

  if (novo.jogadas !== atual.jogadas) {
    return novo.jogadas < atual.jogadas;
  }

  return novo.segundos < atual.segundos;
};

export const formatarTempo = (segundos: number): string => {
  const minutos = Math.floor(segundos / 60);
  const resto = segundos % 60;
  return `${minutos}:${String(resto).padStart(2, '0')}`;
};
