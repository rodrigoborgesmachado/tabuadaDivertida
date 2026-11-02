export type TipoQuestao = 'sequencia' | 'meio' | 'grade' | 'intruso' | 'analogia' | 'piramide';

export type Dificuldade = 'facil' | 'medio' | 'dificil';

export type Celula = number | null;

export interface Questao {
  regra: string;
  tipo: TipoQuestao;
  dificuldade: Dificuldade;
  linhas: Celula[][];
  resposta: number;
  explicacao: string;
  opcoes?: number[];
}

export interface QuestaoRespondida {
  tipo: TipoQuestao;
  dificuldade: Dificuldade;
  correta: boolean;
}

interface Gerada {
  linhas: Celula[][];
  resposta: number;
  explicacao: string;
}

interface Regra {
  id: string;
  tipo: TipoQuestao;
  dificuldade: Dificuldade;
  gerar: (random: () => number) => Gerada;
}

export const DIFICULDADES: Dificuldade[] = ['facil', 'medio', 'dificil'];

export const QUESTOES_POR_DIFICULDADE = 5;

export const TOTAL_QUESTOES = DIFICULDADES.length * QUESTOES_POR_DIFICULDADE;

export const SEGUNDOS_POR_DIFICULDADE: Record<Dificuldade, number> = { facil: 30, medio: 45, dificil: 60 };

export const PESO_POR_DIFICULDADE: Record<Dificuldade, number> = { facil: 1, medio: 2, dificil: 3 };

export const TEMPO_MEDIO_SEM_TITUBEAR = 10;

export const TIPOS: { tipo: TipoQuestao; nome: string; pergunta: string }[] = [
  { tipo: 'sequencia', nome: 'Próximo número', pergunta: 'Qual é o próximo número?' },
  { tipo: 'meio', nome: 'Número que falta', pergunta: 'Qual número está faltando?' },
  { tipo: 'grade', nome: 'Grade 3×3', pergunta: 'Qual número completa a grade?' },
  { tipo: 'intruso', nome: 'Não pertence ao grupo', pergunta: 'Qual número não pertence ao grupo?' },
  { tipo: 'analogia', nome: 'Analogia', pergunta: 'Qual número completa a analogia?' },
  { tipo: 'piramide', nome: 'Pirâmide', pergunta: 'Qual número completa a pirâmide?' },
];

const TITULOS: { minimo: number; titulo: string }[] = [
  { minimo: 0, titulo: 'Aprendiz dos Números' },
  { minimo: 85, titulo: 'Caçador de Sequências' },
  { minimo: 100, titulo: 'Detetive dos Números' },
  { minimo: 115, titulo: 'Mente Afiada' },
  { minimo: 130, titulo: 'Gênio dos Padrões' },
];

const QI_MINIMO = 70;
const QI_FAIXA = 75;
const TENTATIVAS = 100;

const inteiro = (min: number, max: number, random: () => number) => Math.floor(random() * (max - min + 1)) + min;

export const embaralhar = <T>(lista: T[], random: () => number) => {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = inteiro(0, i, random);
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
};

const distintos = (quantidade: number, min: number, max: number, random: () => number, filtro: (valor: number) => boolean = () => true) => {
  const candidatos = embaralhar(Array.from({ length: max - min + 1 }, (_, i) => min + i).filter(filtro), random);
  return candidatos.slice(0, quantidade).sort((a, b) => a - b);
};

const ehQuadrado = (valor: number) => valor >= 0 && Number.isInteger(Math.sqrt(valor));

const ehPrimo = (valor: number) => {
  if (valor < 2) return false;
  for (let divisor = 2; divisor * divisor <= valor; divisor++) {
    if (valor % divisor === 0) return false;
  }
  return true;
};

const sequencia = (termos: number[], faltando: number, explicacao: string): Gerada => ({
  linhas: [termos.map((termo, i) => (i === faltando ? null : termo))],
  resposta: termos[faltando],
  explicacao,
});

const progressao = (inicio: number, quantidade: number, proximo: (anterior: number, i: number) => number) => {
  const termos = [inicio];
  while (termos.length < quantidade) {
    termos.push(proximo(termos[termos.length - 1], termos.length));
  }
  return termos;
};

const analogia = (xs: number[], funcao: (x: number) => number, explicacao: string): Gerada => ({
  linhas: xs.map((x, i) => [x, i === xs.length - 1 ? null : funcao(x)]),
  resposta: funcao(xs[xs.length - 1]),
  explicacao,
});

const grade = (funcao: (a: number, b: number) => number, maximo: number, explicacao: string, random: () => number): Gerada => {
  const linhas: Celula[][] = Array.from({ length: 3 }, () => {
    const a = inteiro(2, maximo, random);
    const b = inteiro(2, maximo, random);
    return [a, b, funcao(a, b)];
  });
  const linha = inteiro(1, 2, random);
  const coluna = inteiro(0, 2, random);
  const resposta = linhas[linha][coluna] as number;
  linhas[linha][coluna] = null;
  return { linhas, resposta, explicacao };
};

const piramide = (base: number, maximo: number, random: () => number, somenteBase: boolean): Gerada => {
  const linhas: Celula[][] = [Array.from({ length: base }, () => inteiro(1, maximo, random))];
  while (linhas[0].length > 1) {
    const abaixo = linhas[0] as number[];
    linhas.unshift(abaixo.slice(1).map((valor, i) => abaixo[i] + valor));
  }
  const linha = somenteBase ? base - 1 : inteiro(0, base - 1, random);
  const coluna = inteiro(0, linha, random);
  const resposta = linhas[linha][coluna] as number;
  linhas[linha][coluna] = null;
  return { linhas, resposta, explicacao: 'Cada número é a soma dos dois números logo abaixo dele.' };
};

const intruso = (grupo: number[], resposta: number, explicacao: string): Gerada => ({
  linhas: [[...grupo, resposta].sort((a, b) => a - b)],
  resposta,
  explicacao,
});

export const REGRAS: Regra[] = [
  {
    id: 'soma-fixa',
    tipo: 'sequencia',
    dificuldade: 'facil',
    gerar: (random) => {
      const passo = inteiro(2, 5, random);
      return sequencia(progressao(inteiro(1, 10, random), 6, (anterior) => anterior + passo), 5, `Cada número é o anterior mais ${passo}.`);
    },
  },
  {
    id: 'subtracao-fixa',
    tipo: 'sequencia',
    dificuldade: 'facil',
    gerar: (random) => {
      const passo = inteiro(2, 5, random);
      return sequencia(progressao(inteiro(0, 10, random) + passo * 5, 6, (anterior) => anterior - passo), 5, `Cada número é o anterior menos ${passo}.`);
    },
  },
  {
    id: 'dobro',
    tipo: 'sequencia',
    dificuldade: 'facil',
    gerar: (random) => sequencia(progressao(inteiro(1, 5, random), 5, (anterior) => anterior * 2), 4, 'Cada número é o dobro do anterior.'),
  },
  {
    id: 'meio-soma',
    tipo: 'meio',
    dificuldade: 'facil',
    gerar: (random) => {
      const passo = inteiro(2, 10, random);
      return sequencia(progressao(inteiro(1, 20, random), 5, (anterior) => anterior + passo), inteiro(1, 3, random), `Cada número é o anterior mais ${passo}.`);
    },
  },
  {
    id: 'intruso-paridade',
    tipo: 'intruso',
    dificuldade: 'facil',
    gerar: (random) => {
      const pares = random() < 0.5;
      const grupo = distintos(4, 1, 30, random, (valor) => (valor % 2 === 0) === pares);
      const resposta = distintos(1, 1, 30, random, (valor) => (valor % 2 === 0) !== pares)[0];
      return intruso(grupo, resposta, `O ${resposta} é o único ${pares ? 'ímpar' : 'par'}.`);
    },
  },
  {
    id: 'analogia-soma',
    tipo: 'analogia',
    dificuldade: 'facil',
    gerar: (random) => {
      const soma = inteiro(2, 9, random);
      return analogia(embaralhar(distintos(4, 1, 12, random), random), (x) => x + soma, `Cada número da direita é o da esquerda mais ${soma}.`);
    },
  },
  {
    id: 'multiplicacao',
    tipo: 'sequencia',
    dificuldade: 'medio',
    gerar: (random) => {
      const fator = inteiro(3, 4, random);
      return sequencia(progressao(inteiro(1, 3, random), 5, (anterior) => anterior * fator), 4, `Cada número é o anterior vezes ${fator}.`);
    },
  },
  {
    id: 'quadrados',
    tipo: 'sequencia',
    dificuldade: 'medio',
    gerar: (random) => {
      const inicio = inteiro(1, 6, random);
      const termos = Array.from({ length: 6 }, (_, i) => (inicio + i) ** 2);
      const ultimo = inicio + 5;
      return sequencia(termos, 5, `Cada número é um número vezes ele mesmo: ${inicio}×${inicio}, ${inicio + 1}×${inicio + 1}, ${inicio + 2}×${inicio + 2}... O próximo é ${ultimo}×${ultimo}.`);
    },
  },
  {
    id: 'soma-dos-anteriores',
    tipo: 'sequencia',
    dificuldade: 'medio',
    gerar: (random) => {
      const termos = [inteiro(1, 5, random), inteiro(1, 6, random)];
      while (termos.length < 6) {
        termos.push(termos[termos.length - 1] + termos[termos.length - 2]);
      }
      return sequencia(termos, 5, 'Cada número é a soma dos dois anteriores.');
    },
  },
  {
    id: 'meio-dobro',
    tipo: 'meio',
    dificuldade: 'medio',
    gerar: (random) => sequencia(progressao(inteiro(1, 10, random), 5, (anterior) => anterior * 2), inteiro(1, 3, random), 'Cada número é o dobro do anterior.'),
  },
  {
    id: 'grade-soma',
    tipo: 'grade',
    dificuldade: 'medio',
    gerar: (random) => grade((a, b) => a + b, 15, 'Em cada linha, o terceiro número é a soma dos dois primeiros.', random),
  },
  {
    id: 'intruso-multiplo',
    tipo: 'intruso',
    dificuldade: 'medio',
    gerar: (random) => {
      const tabuada = inteiro(3, 5, random);
      const grupo = distintos(4, tabuada, tabuada * 10, random, (valor) => valor % tabuada === 0);
      const resposta = distintos(1, tabuada, tabuada * 10, random, (valor) => valor % tabuada !== 0)[0];
      return intruso(grupo, resposta, `O ${resposta} é o único que não está na tabuada do ${tabuada}.`);
    },
  },
  {
    id: 'analogia-multiplicacao',
    tipo: 'analogia',
    dificuldade: 'medio',
    gerar: (random) => {
      const fator = inteiro(3, 6, random);
      return analogia(embaralhar(distintos(4, 2, 10, random), random), (x) => x * fator, `Cada número da direita é o da esquerda vezes ${fator}.`);
    },
  },
  {
    id: 'piramide-3',
    tipo: 'piramide',
    dificuldade: 'medio',
    gerar: (random) => piramide(3, 9, random, false),
  },
  {
    id: 'alternada',
    tipo: 'sequencia',
    dificuldade: 'dificil',
    gerar: (random) => {
      const sobe = inteiro(3, 7, random);
      const desce = inteiro(1, sobe - 1, random);
      return sequencia(progressao(inteiro(1, 10, random), 6, (anterior, i) => (i % 2 === 1 ? anterior + sobe : anterior - desce)), 5, `Os números alternam: mais ${sobe}, menos ${desce}.`);
    },
  },
  {
    id: 'diferenca-crescente',
    tipo: 'sequencia',
    dificuldade: 'dificil',
    gerar: (random) => {
      const passo = inteiro(1, 4, random);
      return sequencia(progressao(inteiro(1, 10, random), 6, (anterior, i) => anterior + passo + i - 1), 5, `A diferença aumenta 1 a cada passo: +${passo}, +${passo + 1}, +${passo + 2}...`);
    },
  },
  {
    id: 'grade-produto',
    tipo: 'grade',
    dificuldade: 'dificil',
    gerar: (random) => grade((a, b) => a * b, 9, 'Em cada linha, o terceiro número é o primeiro vezes o segundo.', random),
  },
  {
    id: 'grade-dobro-da-soma',
    tipo: 'grade',
    dificuldade: 'dificil',
    gerar: (random) => grade((a, b) => (a + b) * 2, 12, 'Em cada linha, o terceiro número é o dobro da soma dos dois primeiros.', random),
  },
  {
    id: 'intruso-quadrado',
    tipo: 'intruso',
    dificuldade: 'dificil',
    gerar: (random) => {
      const grupo = distintos(4, 1, 12, random).map((valor) => valor * valor);
      const resposta = distintos(1, 2, grupo[3], random, (valor) => !ehQuadrado(valor))[0];
      return intruso(grupo, resposta, `O ${resposta} é o único que não é um número vezes ele mesmo (como 9 = 3×3).`);
    },
  },
  {
    id: 'analogia-quadrado',
    tipo: 'analogia',
    dificuldade: 'dificil',
    gerar: (random) => analogia(embaralhar(distintos(4, 2, 12, random), random), (x) => x * x, 'Cada número da direita é o da esquerda vezes ele mesmo.'),
  },
  {
    id: 'analogia-dobro-mais',
    tipo: 'analogia',
    dificuldade: 'dificil',
    gerar: (random) => {
      const fator = inteiro(2, 4, random);
      const soma = inteiro(1, 5, random);
      return analogia(embaralhar(distintos(4, 1, 10, random), random), (x) => x * fator + soma, `Cada número da direita é o da esquerda vezes ${fator}, mais ${soma}.`);
    },
  },
  {
    id: 'piramide-4',
    tipo: 'piramide',
    dificuldade: 'dificil',
    gerar: (random) => piramide(4, 12, random, true),
  },
];

const diferencas = (termos: number[]) => termos.slice(1).map((termo, i) => termo - termos[i]);

const constante = (valores: number[]) => valores.every((valor) => valor === valores[0]);

const FAMILIAS_SEQUENCIA: ((termos: number[]) => boolean)[] = [
  (termos) => constante(diferencas(diferencas(termos))),
  (termos) => diferencas(termos).every((diferenca, i, lista) => i < 2 || diferenca === lista[i - 2]),
  (termos) => termos.every((termo, i) => i < 2 || termo * termos[i - 2] === termos[i - 1] * termos[i - 1]) && termos.every((termo) => termo !== 0),
  (termos) => termos.every((termo, i) => i < 2 || termo === termos[i - 1] + termos[i - 2]),
];

const FAMILIAS_GRADE: ((a: number, b: number) => number)[] = [
  (a, b) => a + b,
  (a, b) => a - b,
  (a, b) => b - a,
  (a, b) => a * b,
  (a, b) => (a + b) * 2,
  (a, b) => a + b * 2,
  (a, b) => a * 2 + b,
];

const FAMILIAS_ANALOGIA: ((pares: number[][]) => boolean)[] = [
  (pares) => {
    const [[x1, y1], [x2, y2]] = pares;
    return pares.every(([x, y]) => (y - y1) * (x2 - x1) === (y2 - y1) * (x - x1));
  },
  (pares) => constante(pares.map(([x, y]) => y - x * x)),
  (pares) => pares.every(([x, y]) => y * pares[0][0] * pares[0][0] === pares[0][1] * x * x),
];

const PROPRIEDADES: ((valor: number) => boolean)[] = [
  ...[2, 3, 4, 5, 6, 7, 8, 9, 10].map((divisor) => (valor: number) => valor % divisor === 0),
  (valor: number) => valor % 2 !== 0,
  ehQuadrado,
  ehPrimo,
  (valor: number) => !ehPrimo(valor),
];

const preencher = (linhas: Celula[][], valor: number) => linhas.map((linha) => linha.map((celula) => (celula === null ? valor : celula)));

const encaixa = (tipo: TipoQuestao, linhas: number[][]) => {
  if (tipo === 'sequencia' || tipo === 'meio') {
    return FAMILIAS_SEQUENCIA.some((familia) => familia(linhas[0]));
  }

  if (tipo === 'grade') {
    return FAMILIAS_GRADE.some((familia) => linhas.every(([a, b, c]) => familia(a, b) === c));
  }

  if (tipo === 'analogia') {
    return FAMILIAS_ANALOGIA.some((familia) => familia(linhas));
  }

  return linhas.every((linha, r) => r === linhas.length - 1 || linha.every((valor, i) => valor === linhas[r + 1][i] + linhas[r + 1][i + 1]));
};

const intrusos = (numeros: number[]) => {
  const encontrados = new Set<number>();
  PROPRIEDADES.forEach((propriedade) => {
    const diferentes = numeros.filter((numero) => !propriedade(numero));
    if (diferentes.length === 1) {
      encontrados.add(diferentes[0]);
    }
  });
  return Array.from(encontrados);
};

export const solucoes = (tipo: TipoQuestao, linhas: Celula[][]) => {
  if (tipo === 'intruso') {
    return intrusos(linhas[0] as number[]);
  }

  const maximo = Math.max(...linhas.flat().map((celula) => Math.abs(celula || 0)));
  const encontradas: number[] = [];
  for (let valor = -maximo - 20; valor <= maximo * 5 + 20; valor++) {
    if (encaixa(tipo, preencher(linhas, valor))) {
      encontradas.push(valor);
    }
  }
  return encontradas;
};

const gerarOpcoes = (questao: Gerada, tipo: TipoQuestao, random: () => number) => {
  if (tipo === 'intruso') {
    const outros = embaralhar((questao.linhas[0] as number[]).filter((valor) => valor !== questao.resposta), random).slice(0, 3);
    return embaralhar([questao.resposta, ...outros], random);
  }

  const opcoes = new Set([questao.resposta]);
  embaralhar([1, 2, 3, 4, 5, 10], random).forEach((distancia) => {
    const opcao = questao.resposta + (random() < 0.5 ? distancia : -distancia);
    if (opcoes.size < 4 && opcao >= 0) {
      opcoes.add(opcao);
    }
  });
  for (let distancia = 1; opcoes.size < 4; distancia++) {
    opcoes.add(questao.resposta + distancia);
  }
  return embaralhar(Array.from(opcoes), random);
};

export const gerarQuestao = (regra: Regra, random: () => number = Math.random): Questao => {
  let gerada = regra.gerar(random);
  for (let tentativa = 1; tentativa < TENTATIVAS; tentativa++) {
    const encontradas = solucoes(regra.tipo, gerada.linhas);
    if (encontradas.length === 1 && encontradas[0] === gerada.resposta) {
      break;
    }
    gerada = regra.gerar(random);
  }

  return {
    regra: regra.id,
    tipo: regra.tipo,
    dificuldade: regra.dificuldade,
    ...gerada,
    ...(regra.dificuldade === 'facil' ? { opcoes: gerarOpcoes(gerada, regra.tipo, random) } : {}),
  };
};

export const gerarPartida = (random: () => number = Math.random): Questao[] =>
  DIFICULDADES.flatMap((dificuldade) => {
    const regras = embaralhar(REGRAS.filter((regra) => regra.dificuldade === dificuldade), random);
    return Array.from({ length: QUESTOES_POR_DIFICULDADE }, (_, i) => gerarQuestao(regras[i % regras.length], random));
  });

export const textoQuestao = (questao: Questao) => {
  const celulas = questao.linhas.map((linha) => linha.map((celula) => (celula === null ? '?' : String(celula))));

  if (questao.tipo === 'analogia') {
    return celulas.map((linha) => linha.join(' → ')).join(', ');
  }

  if (questao.tipo === 'grade' || questao.tipo === 'piramide') {
    return celulas.map((linha) => linha.join(' ')).join(' | ');
  }

  return celulas[0].join(', ');
};

export const perguntaDoTipo = (tipo: TipoQuestao) => TIPOS.find((item) => item.tipo === tipo)?.pergunta || '';

export const pontuacaoQi = (respostas: QuestaoRespondida[]) => {
  const maximo = respostas.reduce((total, resposta) => total + PESO_POR_DIFICULDADE[resposta.dificuldade], 0);
  const pontos = respostas.reduce((total, resposta) => total + (resposta.correta ? PESO_POR_DIFICULDADE[resposta.dificuldade] : 0), 0);
  return QI_MINIMO + (maximo ? Math.round((QI_FAIXA * pontos) / maximo) : 0);
};

export const tituloQi = (qi: number) => TITULOS.reduce((titulo, item) => (qi >= item.minimo ? item.titulo : titulo), TITULOS[0].titulo);

export const desempenhoPorTipo = (respostas: QuestaoRespondida[]) =>
  TIPOS.map(({ tipo, nome }) => {
    const doTipo = respostas.filter((resposta) => resposta.tipo === tipo);
    return { tipo, nome, acertos: doTipo.filter((resposta) => resposta.correta).length, total: doTipo.length };
  }).filter((item) => item.total > 0);
