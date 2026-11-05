import { jogos } from '../pages/Jogos/jogosConfig';
import type { Progresso } from './progresso';
import { chaveSemana } from './sequenciaDias';

export interface Medalha {
  id: string;
  nome: string;
  descricao: string;
  icone: string;
  metas: number[];
  unidade: string;
  valor: (progresso: Progresso) => number;
  grupo: string;
  menorMelhor?: boolean;
  secreta?: boolean;
}

export const NIVEIS = ['Bronze', 'Prata', 'Ouro', 'Diamante'];

export const FATORES = [2, 3, 4, 5, 6, 7, 8, 9, 10];

export const MODOS = ['M', 'D', 'A', 'S', 'R', 'E'];

export const GRUPOS = ['Multiplicação', 'Divisão', 'Adição', 'Subtração', 'Aleatório', 'Expressões', 'Sudoku', 'Outros jogos', 'Geral'];

const SUDOKUS_9X9 = ['9x9-facil', '9x9-medio', '9x9-dificil'];

const TEMPOS_SUDOKU: [string, number][] = [['4x4', 30], ['6x6', 120], ['9x9-facil', 360], ['9x9-dificil', 720]];

const contasAcertadas = (progresso: Progresso, tabuada: number) => Object.keys(progresso.tabuadas[tabuada] || {}).length;

const divisoesAcertadas = (progresso: Progresso, divisor: number) => Object.keys(progresso.divisoes[divisor] || {}).length;

const perfeitasNoModo = (progresso: Progresso, modo: string) => progresso.perfeitasPorModo[modo] || 0;

const listar = (valores: string[]) => `${valores.slice(0, -1).join(', ')} e ${valores[valores.length - 1]}`;

const somar = (valores: Record<string, number>, modos = Object.keys(valores)) => modos.reduce((total, modo) => total + (valores[modo] || 0), 0);

const etapasSeguidas = (etapas: boolean[]) => (etapas.includes(false) ? etapas.indexOf(false) : etapas.length);

const sudokus = (progresso: Progresso, modo: string) => progresso.sudokusPorModo[modo] || 0;

const desafiosDoDiaNaMesmaSemana = (progresso: Progresso) => {
  const porSemana: Record<string, number> = {};

  progresso.desafiosConcluidos.forEach((id) => {
    const dia = /^dia:(\d+)-(\d+)-(\d+)$/.exec(id);
    if (dia) {
      const semana = chaveSemana(new Date(Number(dia[1]), Number(dia[2]) - 1, Number(dia[3])));
      porSemana[semana] = (porSemana[semana] || 0) + 1;
    }
  });

  return Math.max(0, ...Object.values(porSemana));
};

const mestres: Medalha[] = FATORES.map((tabuada) => ({
  id: `mestre-do-${tabuada}`,
  nome: `Mestre do ${tabuada}`,
  descricao: `Acerte todas as contas da tabuada do ${tabuada} (${tabuada}×2 a ${tabuada}×10) em até 7 dias. Se errar uma, ela volta a faltar.`,
  icone: '🧮',
  metas: [FATORES.length],
  unidade: 'contas',
  valor: (progresso) => contasAcertadas(progresso, tabuada),
  grupo: 'Multiplicação',
}));

const mestresDaDivisao: Medalha[] = FATORES.map((divisor) => ({
  id: `mestre-da-divisao-por-${divisor}`,
  nome: `Mestre da divisão por ${divisor}`,
  descricao: `Acerte todas as divisões por ${divisor} (${divisor * 2}÷${divisor} a ${divisor * 10}÷${divisor}) em até 7 dias. Se errar uma, ela volta a faltar.`,
  icone: '🍕',
  metas: [FATORES.length],
  unidade: 'contas',
  valor: (progresso) => divisoesAcertadas(progresso, divisor),
  grupo: 'Divisão',
}));

const modosDaTabuada = [
  { modo: 'D', grupo: 'Divisão', contas: 'de divisão', perfeitas: ['rei-da-divisao', 'Rei da divisão', '➗'], acertos: 'Divisor', sequencia: 'Divisão em chamas', velocidade: 'Divisão relâmpago', tempos: [4, 3, 2, 1.5] },
  { modo: 'A', grupo: 'Adição', contas: 'de adição', perfeitas: ['mestre-da-soma', 'Mestre da soma', '➕'], acertos: 'Somador', sequencia: 'Soma em chamas', velocidade: 'Soma relâmpago', tempos: [4, 3, 2, 1.5] },
  { modo: 'S', grupo: 'Subtração', contas: 'de subtração', perfeitas: ['mestre-da-subtracao', 'Mestre da subtração', '➖'], acertos: 'Subtrator', sequencia: 'Subtração em chamas', velocidade: 'Subtração relâmpago', tempos: [4, 3, 2, 1.5] },
  { modo: 'R', grupo: 'Aleatório', contas: 'no modo aleatório', perfeitas: ['coringa', 'Coringa', '🔀'], acertos: 'Sortudo', sequencia: 'Aleatório em chamas', velocidade: 'Aleatório relâmpago', tempos: [4, 3, 2, 1.5] },
  { modo: 'E', grupo: 'Expressões', contas: 'no modo de expressões numéricas', perfeitas: ['genio-das-expressoes', 'Gênio das expressões', '🧠'], acertos: 'Expressivo', sequencia: 'Expressões em chamas', velocidade: 'Expressões relâmpago', tempos: [15, 10, 7, 5] },
];

const medalhasDosModos: Medalha[] = modosDaTabuada.flatMap(({ modo, grupo, contas, perfeitas: [id, nome, icone], acertos, sequencia, velocidade, tempos }) => [
  {
    id,
    nome,
    descricao: `Termine 1, 5, 10 e 25 partidas perfeitas de pelo menos 20 contas ${contas}.`,
    icone,
    metas: [1, 5, 10, 25],
    unidade: 'partidas perfeitas',
    valor: (progresso: Progresso) => perfeitasNoModo(progresso, modo),
    grupo,
  },
  {
    id: `acertos-${modo.toLowerCase()}`,
    nome: acertos,
    descricao: `Acerte 100, 500, 1.000 e 5.000 contas ${contas}.`,
    icone: '📚',
    metas: [100, 500, 1000, 5000],
    unidade: 'acertos',
    valor: (progresso: Progresso) => progresso.acertosPorModo[modo] || 0,
    grupo,
  },
  {
    id: `sequencia-${modo.toLowerCase()}`,
    nome: sequencia,
    descricao: `Acerte 15, 30, 50 e 100 contas seguidas ${contas} sem errar, mesmo em partidas diferentes.`,
    icone: '☄️',
    metas: [15, 30, 50, 100],
    unidade: 'acertos seguidos',
    valor: (progresso: Progresso) => progresso.melhorSequenciaPorModo[modo] || 0,
    grupo,
  },
  {
    id: `velocidade-${modo.toLowerCase()}`,
    nome: velocidade,
    descricao: `Faça uma partida perfeita de pelo menos 20 contas ${contas} respondendo, em média, em até ${listar(tempos.map((tempo) => `${tempo.toLocaleString('pt-BR')}s`))}.`,
    icone: '⏱️',
    metas: tempos,
    unidade: 's',
    valor: (progresso: Progresso) => progresso.melhorTempoMedioPorModo[modo] || 0,
    grupo,
    menorMelhor: true,
  },
]);

const outrasMedalhas: Medalha[] = [
  ...mestres,
  ...mestresDaDivisao,
  {
    id: 'tabuada-completa',
    nome: 'Tabuada completa',
    descricao: 'Seja mestre de todas as tabuadas, do 2 ao 10.',
    icone: '🏆',
    metas: [FATORES.length],
    unidade: 'tabuadas',
    valor: (progresso) => FATORES.filter((tabuada) => contasAcertadas(progresso, tabuada) === FATORES.length).length,
    grupo: 'Multiplicação',
  },
  {
    id: 'divisao-completa',
    nome: 'Divisão completa',
    descricao: 'Seja mestre de todas as divisões, da divisão por 2 à divisão por 10.',
    icone: '🏅',
    metas: [FATORES.length],
    unidade: 'divisores',
    valor: (progresso) => FATORES.filter((divisor) => divisoesAcertadas(progresso, divisor) === FATORES.length).length,
    grupo: 'Divisão',
  },
  ...medalhasDosModos,
  {
    id: 'calculista-mental',
    nome: 'Calculista mental',
    descricao: 'Acerte 50, 200, 500 e 1.000 contas de adição ou subtração com resultado acima de 50.',
    icone: '💭',
    metas: [50, 200, 500, 1000],
    unidade: 'contas',
    valor: (progresso) => progresso.contasAcimaDe50,
    grupo: 'Adição',
  },
  {
    id: 'sem-parenteses-sem-problema',
    nome: 'Sem parênteses, sem problema',
    descricao: 'Acerte 10 expressões numéricas seguidas.',
    icone: '📐',
    metas: [10],
    unidade: 'acertos seguidos',
    valor: (progresso) => progresso.melhorSequenciaPorModo.E || 0,
    grupo: 'Expressões',
  },
  {
    id: 'pau-pra-toda-obra',
    nome: 'Pau pra toda obra',
    descricao: 'Faça uma partida perfeita de pelo menos 50 contas no modo aleatório.',
    icone: '🛠️',
    metas: [50],
    unidade: 'contas',
    valor: (progresso) => progresso.maiorPerfeitaPorModo.R || 0,
    grupo: 'Aleatório',
  },
  {
    id: 'acertos-seguidos',
    nome: 'Sequência de fogo',
    descricao: 'Acerte 10, 25, 50 e 100 contas seguidas sem errar, mesmo em partidas diferentes.',
    icone: '🔥',
    metas: [10, 25, 50, 100],
    unidade: 'acertos seguidos',
    valor: (progresso) => progresso.melhorSequencia,
    grupo: 'Geral',
  },
  {
    id: 'partida-perfeita',
    nome: 'Partida perfeita',
    descricao: 'Termine 1, 5, 10 e 25 partidas da tabuada de pelo menos 20 contas sem errar nenhuma.',
    icone: '⭐',
    metas: [1, 5, 10, 25],
    unidade: 'partidas perfeitas',
    valor: (progresso) => progresso.partidasPerfeitas,
    grupo: 'Geral',
  },
  {
    id: 'resposta-rapida',
    nome: 'Raio veloz',
    descricao: 'Faça uma partida perfeita de pelo menos 20 contas respondendo, em média, em até 3s, 2s, 1,5s e 1s.',
    icone: '⚡',
    metas: [3, 2, 1.5, 1],
    unidade: 's',
    valor: (progresso) => progresso.melhorTempoMedio,
    grupo: 'Geral',
    menorMelhor: true,
  },
  {
    id: 'partidas-jogadas',
    nome: 'Jogador dedicado',
    descricao: 'Termine 10, 50, 100 e 1.000 partidas em qualquer jogo do site.',
    icone: '🎮',
    metas: [10, 50, 100, 1000],
    unidade: 'partidas',
    valor: (progresso) => progresso.partidas,
    grupo: 'Geral',
  },
  {
    id: 'explorador',
    nome: 'Explorador',
    descricao: 'Jogue todos os jogos do site.',
    icone: '🧭',
    metas: [jogos.length],
    unidade: 'jogos',
    valor: (progresso) => jogos.filter((jogo) => progresso.jogosJogados.includes(jogo.id)).length,
    grupo: 'Geral',
  },
  {
    id: 'constancia',
    nome: 'Constância',
    descricao: 'Jogue 3, 7, 30 e 100 dias seguidos. A cada 7 dias seguidos você ganha 1 dia de folga.',
    icone: '📅',
    metas: [3, 7, 30, 100],
    unidade: 'dias seguidos',
    valor: (progresso) => progresso.melhorDiasSeguidos,
    grupo: 'Geral',
  },
  {
    id: 'desafios-concluidos',
    nome: 'Desafiante',
    descricao: 'Conclua 1, 10, 30 e 100 desafios do dia ou da semana.',
    icone: '🎯',
    metas: [1, 10, 30, 100],
    unidade: 'desafios',
    valor: (progresso) => progresso.desafiosConcluidos.length,
    grupo: 'Geral',
  },
  {
    id: 'rumo-ao-2048',
    nome: 'Rumo ao 2048',
    descricao: 'No 2048, chegue às peças 512, 1024 e 2048.',
    icone: '🎲',
    metas: [512, 1024, 2048],
    unidade: 'na maior peça',
    valor: (progresso) => progresso.maiorPeca,
    grupo: 'Outros jogos',
  },
  {
    id: 'quatro-operacoes',
    nome: 'Quatro operações',
    descricao: 'Faça uma partida perfeita de pelo menos 20 contas em todos os modos da tabuada.',
    icone: '🎓',
    metas: [MODOS.length],
    unidade: 'modos',
    valor: (progresso) => MODOS.filter((modo) => perfeitasNoModo(progresso, modo) > 0).length,
    grupo: 'Geral',
  },
  {
    id: 'maratonista',
    nome: 'Maratonista',
    descricao: 'Faça uma partida perfeita de 100 contas.',
    icone: '🏃',
    metas: [1],
    unidade: 'partidas',
    valor: (progresso) => progresso.maratonas,
    grupo: 'Geral',
  },
  {
    id: 'recordista',
    nome: 'Recordista',
    descricao: 'Bata o seu recorde de pontuação na tabuada 5, 10 e 25 vezes.',
    icone: '📈',
    metas: [5, 10, 25],
    unidade: 'recordes',
    valor: (progresso) => progresso.recordesBatidos,
    grupo: 'Geral',
  },
  {
    id: 'sem-pressa-sem-erro',
    nome: 'Sem pressa, sem erro',
    descricao: 'Acerte 1.000, 5.000 e 10.000 contas no total.',
    icone: '✅',
    metas: [1000, 5000, 10000],
    unidade: 'acertos',
    valor: (progresso) => progresso.acertos,
    grupo: 'Geral',
  },
  {
    id: 'volta-por-cima',
    nome: 'Volta por cima',
    descricao: 'Erre as 3 primeiras contas e termine a partida com 90% ou mais de acerto.',
    icone: '💪',
    metas: [1],
    unidade: 'partidas',
    valor: (progresso) => progresso.voltasPorCima,
    grupo: 'Geral',
  },
  {
    id: 'memoria-de-elefante',
    nome: 'Memória de elefante',
    descricao: 'Na Memória da tabuada, termine o nível difícil com no máximo 1,5 vez o mínimo de jogadas.',
    icone: '🐘',
    metas: [1],
    unidade: 'partidas',
    valor: (progresso) => progresso.memoriasDeElefante,
    grupo: 'Outros jogos',
  },
  {
    id: 'relampago-da-memoria',
    nome: 'Relâmpago da memória',
    descricao: 'Na Memória da tabuada, termine o nível médio em menos de 60 segundos.',
    icone: '🌩️',
    metas: [1],
    unidade: 'partidas',
    valor: (progresso) => progresso.memoriasRelampago,
    grupo: 'Outros jogos',
  },
  {
    id: 'sem-desperdicio',
    nome: 'Sem desperdício',
    descricao: 'Na Memória da tabuada, termine um nível sem errar duas vezes com a mesma carta.',
    icone: '🃏',
    metas: [1],
    unidade: 'partidas',
    valor: (progresso) => progresso.memoriasSemDesperdicio,
    grupo: 'Outros jogos',
  },
  {
    id: 'pontuador',
    nome: 'Pontuador',
    descricao: 'No 2048, faça 10.000, 20.000 e 50.000 pontos em uma partida.',
    icone: '💯',
    metas: [10000, 20000, 50000],
    unidade: 'pontos',
    valor: (progresso) => progresso.maiorPontuacao2048,
    grupo: 'Outros jogos',
  },
  {
    id: 'minimalista',
    nome: 'Minimalista',
    descricao: 'No 2048, chegue à peça 1024 sem usar o desfazer.',
    icone: '🪶',
    metas: [1024],
    unidade: 'na maior peça',
    valor: (progresso) => progresso.maiorPecaSemDesfazer,
    grupo: 'Outros jogos',
  },
  {
    id: 'gabarito',
    nome: 'Gabarito',
    descricao: 'No Teste de QI com Números, acerte as 15 questões de uma partida.',
    icone: '📝',
    metas: [1],
    unidade: 'partidas',
    valor: (progresso) => progresso.gabaritos,
    grupo: 'Outros jogos',
  },
  {
    id: 'mestre-dos-padroes',
    nome: 'Mestre dos Padrões',
    descricao: 'No Teste de QI com Números, acerte 10, 50 e 100 questões no total.',
    icone: '🧩',
    metas: [10, 50, 100],
    unidade: 'questões',
    valor: (progresso) => progresso.padroesAcertados,
    grupo: 'Outros jogos',
  },
  {
    id: 'sem-titubear',
    nome: 'Sem titubear',
    descricao: 'No Teste de QI com Números, acerte as 15 questões respondendo, em média, em até 10 segundos cada.',
    icone: '😎',
    metas: [1],
    unidade: 'partidas',
    valor: (progresso) => progresso.semTitubear,
    grupo: 'Outros jogos',
  },
  {
    id: 'mais-rapido-que-a-maquina',
    nome: 'Mais rápido que a máquina',
    descricao: 'Na Corrida contra o robô, vença o Robô campeão em uma pista de 20 casas ou mais.',
    icone: '🏎️',
    metas: [1],
    unidade: 'corridas',
    valor: (progresso) => progresso.vitoriasContraCampeao,
    grupo: 'Outros jogos',
  },
  {
    id: 'sudokista',
    nome: 'Sudokista',
    descricao: 'Complete 1, 10, 50 e 100 sudokus de qualquer tamanho.',
    icone: '🧩',
    metas: [1, 10, 50, 100],
    unidade: 'sudokus',
    valor: (progresso) => somar(progresso.sudokusPorModo),
    grupo: 'Sudoku',
  },
  {
    id: 'primeiros-quadradinhos',
    nome: 'Primeiros quadradinhos',
    descricao: 'Complete um Sudoku 4×4 e um 6×6.',
    icone: '🌱',
    metas: [2],
    unidade: 'tamanhos',
    valor: (progresso) => ['4x4', '6x6'].filter((modo) => sudokus(progresso, modo) > 0).length,
    grupo: 'Sudoku',
  },
  {
    id: 'classico',
    nome: 'Clássico',
    descricao: 'Complete o Sudoku 9×9 fácil, depois o médio e o difícil. No Diamante, complete 10 sudokus 9×9 difíceis.',
    icone: '🏛️',
    metas: [1, 2, 3, 4],
    unidade: 'etapas',
    valor: (progresso) => etapasSeguidas([...SUDOKUS_9X9.map((modo) => sudokus(progresso, modo) > 0), sudokus(progresso, '9x9-dificil') >= 10]),
    grupo: 'Sudoku',
  },
  {
    id: 'sem-ajuda',
    nome: 'Sem ajuda',
    descricao: 'Complete 1, 5, 10 e 25 sudokus 9×9 sem usar dicas e sem ligar o "Marcar erros".',
    icone: '🧠',
    metas: [1, 5, 10, 25],
    unidade: 'sudokus',
    valor: (progresso) => somar(progresso.sudokusSemAjudaPorModo, SUDOKUS_9X9),
    grupo: 'Sudoku',
  },
  {
    id: 'sudoku-relampago',
    nome: 'Sudoku relâmpago',
    descricao: 'Complete o 4×4 em até 30s, depois o 6×6 em até 2 min, o 9×9 fácil em até 6 min e o 9×9 difícil em até 12 min.',
    icone: '⚡',
    metas: [1, 2, 3, 4],
    unidade: 'etapas',
    valor: (progresso) => etapasSeguidas(TEMPOS_SUDOKU.map(([modo, tempo]) => (progresso.melhorTempoSudokuPorModo[modo] || Infinity) <= tempo)),
    grupo: 'Sudoku',
  },
  {
    id: 'sem-borracha',
    nome: 'Sem borracha',
    descricao: 'Complete um Sudoku 9×9 médio ou difícil sem usar o desfazer.',
    icone: '🧽',
    metas: [1],
    unidade: 'sudokus',
    valor: (progresso) => progresso.sudokusSemBorracha,
    grupo: 'Sudoku',
  },
  {
    id: 'um-por-dia',
    nome: 'Um por dia',
    descricao: 'Complete sudokus em 7, 15, 30 e 60 dias diferentes.',
    icone: '📆',
    metas: [7, 15, 30, 60],
    unidade: 'dias',
    valor: (progresso) => progresso.diasComSudoku,
    grupo: 'Sudoku',
  },
  {
    id: 'semana-perfeita',
    nome: 'Semana perfeita',
    descricao: 'Conclua os 7 desafios do dia de uma mesma semana.',
    icone: '🗓️',
    metas: [7],
    unidade: 'desafios do dia',
    valor: desafiosDoDiaNaMesmaSemana,
    grupo: 'Geral',
  },
  {
    id: 'fim-de-semana-estudioso',
    nome: 'Fim de semana estudioso',
    descricao: 'Jogue no sábado e no domingo em 4 fins de semana.',
    icone: '🛋️',
    metas: [4],
    unidade: 'fins de semana',
    valor: (progresso) => progresso.finsDeSemana,
    grupo: 'Geral',
  },
  {
    id: 'coruja-noturna',
    nome: 'Coruja noturna',
    descricao: 'Termine uma partida entre 22h e 5h.',
    icone: '🦉',
    metas: [1],
    unidade: 'partidas',
    valor: (progresso) => progresso.partidasNoturnas,
    grupo: 'Geral',
    secreta: true,
  },
  {
    id: 'alem-do-2048',
    nome: 'Além do 2048',
    descricao: 'No 2048, chegue à peça 4096.',
    icone: '🌌',
    metas: [4096],
    unidade: 'na maior peça',
    valor: (progresso) => progresso.maiorPeca,
    grupo: 'Outros jogos',
    secreta: true,
  },
  {
    id: 'madrugador',
    nome: 'Madrugador',
    descricao: 'Termine uma partida entre 5h e 7h.',
    icone: '🌅',
    metas: [1],
    unidade: 'partidas',
    valor: (progresso) => progresso.partidasMadrugada,
    grupo: 'Geral',
    secreta: true,
  },
  {
    id: 'teimoso',
    nome: 'Teimoso',
    descricao: 'Erre a mesma conta 3 vezes e depois acerte-a 5 vezes seguidas.',
    icone: '🐐',
    metas: [1],
    unidade: 'contas',
    valor: (progresso) => progresso.teimoso,
    grupo: 'Geral',
    secreta: true,
  },
  {
    id: 'palindromo',
    nome: 'Palíndromo',
    descricao: 'Termine uma partida com uma pontuação que se lê igual de trás para frente, como 1221.',
    icone: '🪞',
    metas: [1],
    unidade: 'partidas',
    valor: (progresso) => progresso.partidasPalindromas,
    grupo: 'Geral',
    secreta: true,
  },
  {
    id: 'mestre-silencioso',
    nome: 'Mestre silencioso',
    descricao: 'Complete um Sudoku 9×9 difícil sem dicas, sem "Marcar erros" e sem desfazer.',
    icone: '🥷',
    metas: [1],
    unidade: 'sudokus',
    valor: (progresso) => progresso.sudokusSilenciosos,
    grupo: 'Sudoku',
    secreta: true,
  },
];

export const medalhas: Medalha[] = [
  ...outrasMedalhas,
  {
    id: 'perfeccionista',
    nome: 'Perfeccionista',
    descricao: 'Conquiste todas as outras medalhas.',
    icone: '👑',
    metas: [outrasMedalhas.length],
    unidade: 'medalhas',
    valor: (progresso) => outrasMedalhas.filter((medalha) => progresso.medalhas[medalha.id]).length,
    grupo: 'Geral',
    secreta: true,
  },
];

export const buscarMedalha = (id: string) => medalhas.find((medalha) => medalha.id === id);

export const nomeNivel = (medalha: Medalha, nivel: number) => (medalha.metas.length > 1 ? NIVEIS[nivel - 1] || '' : '');

export const nivelAlcancado = (medalha: Medalha, progresso: Progresso) => {
  const valor = medalha.valor(progresso);
  return medalha.metas.filter((meta) => (medalha.menorMelhor ? valor > 0 && valor <= meta : valor >= meta)).length;
};
