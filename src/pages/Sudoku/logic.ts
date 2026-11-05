export type Tamanho = 4 | 6 | 9;

export type Grade = number[][];

export type Direcao = 'cima' | 'baixo' | 'esquerda' | 'direita';

export interface Casa {
  linha: number;
  coluna: number;
}

export interface Modo {
  id: string;
  nome: string;
  descricao: string;
  tamanho: Tamanho;
  reveladas: number;
}

export interface Tabuleiro {
  inicial: Grade;
  solucao: Grade;
}

export const MODOS: Modo[] = [
  { id: '4x4', nome: '4×4', descricao: 'Números de 1 a 4', tamanho: 4, reveladas: 8 },
  { id: '6x6', nome: '6×6', descricao: 'Números de 1 a 6', tamanho: 6, reveladas: 18 },
  { id: '9x9-facil', nome: '9×9 fácil', descricao: 'Clássico, nível fácil', tamanho: 9, reveladas: 40 },
  { id: '9x9-medio', nome: '9×9 médio', descricao: 'Clássico, nível médio', tamanho: 9, reveladas: 32 },
  { id: '9x9-dificil', nome: '9×9 difícil', descricao: 'Clássico, nível difícil', tamanho: 9, reveladas: 26 },
];

export const DICAS = 3;

export const buscarModo = (id: string) => MODOS.find((modo) => modo.id === id);

export const dimensoesBloco = (tamanho: number) => {
  const linhas = Math.floor(Math.sqrt(tamanho));
  return { linhas, colunas: tamanho / linhas };
};

export const copiarGrade = (grade: Grade): Grade => grade.map((linha) => [...linha]);

const embaralhar = <T>(itens: T[], aleatorio: () => number) => {
  const copia = [...itens];
  for (let i = copia.length - 1; i > 0; i -= 1) {
    const j = Math.floor(aleatorio() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
};

export const mesmaRegiao = (a: Casa, b: Casa, tamanho: number) => {
  const { linhas, colunas } = dimensoesBloco(tamanho);
  return (
    a.linha === b.linha ||
    a.coluna === b.coluna ||
    (Math.floor(a.linha / linhas) === Math.floor(b.linha / linhas) && Math.floor(a.coluna / colunas) === Math.floor(b.coluna / colunas))
  );
};

const candidatos = (grade: Grade, linha: number, coluna: number) => {
  const tamanho = grade.length;
  const { linhas, colunas } = dimensoesBloco(tamanho);
  const usados = new Set<number>();
  const inicioLinha = linha - (linha % linhas);
  const inicioColuna = coluna - (coluna % colunas);

  for (let i = 0; i < tamanho; i += 1) {
    usados.add(grade[linha][i]);
    usados.add(grade[i][coluna]);
    usados.add(grade[inicioLinha + Math.floor(i / colunas)][inicioColuna + (i % colunas)]);
  }

  return Array.from({ length: tamanho }, (_, i) => i + 1).filter((numero) => !usados.has(numero));
};

const casaMaisRestrita = (grade: Grade) => {
  let melhor: { casa: Casa; opcoes: number[] } | null = null;

  for (let linha = 0; linha < grade.length; linha += 1) {
    for (let coluna = 0; coluna < grade.length; coluna += 1) {
      if (grade[linha][coluna] === 0) {
        const opcoes = candidatos(grade, linha, coluna);
        if (!melhor || opcoes.length < melhor.opcoes.length) {
          melhor = { casa: { linha, coluna }, opcoes };
          if (opcoes.length <= 1) {
            return melhor;
          }
        }
      }
    }
  }

  return melhor;
};

export const contarSolucoes = (grade: Grade, limite = 2): number => {
  const trabalho = copiarGrade(grade);
  let total = 0;

  const resolver = () => {
    const proxima = casaMaisRestrita(trabalho);
    if (!proxima) {
      total += 1;
      return;
    }

    const { casa, opcoes } = proxima;
    for (const numero of opcoes) {
      trabalho[casa.linha][casa.coluna] = numero;
      resolver();
      if (total >= limite) {
        break;
      }
    }
    trabalho[casa.linha][casa.coluna] = 0;
  };

  resolver();
  return total;
};

export const gerarSolucao = (tamanho: Tamanho, aleatorio = Math.random): Grade => {
  const grade: Grade = Array.from({ length: tamanho }, () => Array(tamanho).fill(0));

  const preencher = (posicao: number): boolean => {
    if (posicao === tamanho * tamanho) {
      return true;
    }

    const linha = Math.floor(posicao / tamanho);
    const coluna = posicao % tamanho;
    for (const numero of embaralhar(candidatos(grade, linha, coluna), aleatorio)) {
      grade[linha][coluna] = numero;
      if (preencher(posicao + 1)) {
        return true;
      }
    }
    grade[linha][coluna] = 0;
    return false;
  };

  preencher(0);
  return grade;
};

export const gerarTabuleiro = (modo: Modo, aleatorio = Math.random): Tabuleiro => {
  const solucao = gerarSolucao(modo.tamanho, aleatorio);
  const inicial = copiarGrade(solucao);
  let reveladas = modo.tamanho * modo.tamanho;
  const posicoes = embaralhar(Array.from({ length: reveladas }, (_, i) => i), aleatorio);

  for (const posicao of posicoes) {
    if (reveladas <= modo.reveladas) {
      break;
    }

    const linha = Math.floor(posicao / modo.tamanho);
    const coluna = posicao % modo.tamanho;
    inicial[linha][coluna] = 0;
    if (contarSolucoes(inicial) === 1) {
      reveladas -= 1;
    } else {
      inicial[linha][coluna] = solucao[linha][coluna];
    }
  }

  return { inicial, solucao };
};

export const casasComConflito = (grade: Grade): Set<string> => {
  const conflitos = new Set<string>();

  grade.forEach((linhaValores, linha) => {
    linhaValores.forEach((valor, coluna) => {
      if (valor === 0) {
        return;
      }

      const repetida = grade.some((outraLinha, l) =>
        outraLinha.some((outro, c) => outro === valor && (l !== linha || c !== coluna) && mesmaRegiao({ linha, coluna }, { linha: l, coluna: c }, grade.length))
      );
      if (repetida) {
        conflitos.add(`${linha}-${coluna}`);
      }
    });
  });

  return conflitos;
};

export const estaCompleto = (grade: Grade, solucao: Grade) =>
  grade.every((linha, l) => linha.every((valor, c) => valor === solucao[l][c]));

export const casaParaDica = (grade: Grade, solucao: Grade, selecionada: Casa | null, aleatorio = Math.random): Casa | null => {
  const precisaDica = ({ linha, coluna }: Casa) => grade[linha][coluna] !== solucao[linha][coluna];

  if (selecionada && precisaDica(selecionada)) {
    return selecionada;
  }

  const opcoes = grade.flatMap((linhaValores, linha) => linhaValores.map((_, coluna) => ({ linha, coluna }))).filter(precisaDica);
  return opcoes.length > 0 ? opcoes[Math.floor(aleatorio() * opcoes.length)] : null;
};

export const moverCasa = (casa: Casa, direcao: Direcao, tamanho: number): Casa => {
  const limitar = (valor: number) => Math.min(tamanho - 1, Math.max(0, valor));

  if (direcao === 'cima' || direcao === 'baixo') {
    return { ...casa, linha: limitar(casa.linha + (direcao === 'cima' ? -1 : 1)) };
  }

  return { ...casa, coluna: limitar(casa.coluna + (direcao === 'esquerda' ? -1 : 1)) };
};
