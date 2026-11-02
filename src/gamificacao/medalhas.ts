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
  menorMelhor?: boolean;
  secreta?: boolean;
}

export const NIVEIS = ['Bronze', 'Prata', 'Ouro', 'Diamante'];

export const FATORES = [2, 3, 4, 5, 6, 7, 8, 9, 10];

export const MODOS = ['M', 'D', 'A', 'S', 'R', 'E'];

const contasAcertadas = (progresso: Progresso, tabuada: number) => Object.keys(progresso.tabuadas[tabuada] || {}).length;

const perfeitasNoModo = (progresso: Progresso, modo: string) => progresso.perfeitasPorModo[modo] || 0;

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
}));

const outrasMedalhas: Medalha[] = [
  ...mestres,
  {
    id: 'tabuada-completa',
    nome: 'Tabuada completa',
    descricao: 'Seja mestre de todas as tabuadas, do 2 ao 10.',
    icone: '🏆',
    metas: [FATORES.length],
    unidade: 'tabuadas',
    valor: (progresso) => FATORES.filter((tabuada) => contasAcertadas(progresso, tabuada) === FATORES.length).length,
  },
  {
    id: 'acertos-seguidos',
    nome: 'Sequência de fogo',
    descricao: 'Acerte 10, 25, 50 e 100 contas seguidas sem errar, mesmo em partidas diferentes.',
    icone: '🔥',
    metas: [10, 25, 50, 100],
    unidade: 'acertos seguidos',
    valor: (progresso) => progresso.melhorSequencia,
  },
  {
    id: 'partida-perfeita',
    nome: 'Partida perfeita',
    descricao: 'Termine 1, 5, 10 e 25 partidas da tabuada de pelo menos 20 contas sem errar nenhuma.',
    icone: '⭐',
    metas: [1, 5, 10, 25],
    unidade: 'partidas perfeitas',
    valor: (progresso) => progresso.partidasPerfeitas,
  },
  {
    id: 'resposta-rapida',
    nome: 'Raio veloz',
    descricao: 'Faça uma partida perfeita de pelo menos 20 contas respondendo, em média, em até 3s, 2s, 1,5s e 1s.',
    icone: '⚡',
    metas: [3, 2, 1.5, 1],
    unidade: 's',
    valor: (progresso) => progresso.melhorTempoMedio,
    menorMelhor: true,
  },
  {
    id: 'partidas-jogadas',
    nome: 'Jogador dedicado',
    descricao: 'Termine 10, 50, 100 e 500 partidas em qualquer jogo do site.',
    icone: '🎮',
    metas: [10, 50, 100, 500],
    unidade: 'partidas',
    valor: (progresso) => progresso.partidas,
  },
  {
    id: 'explorador',
    nome: 'Explorador',
    descricao: 'Jogue todos os jogos do site.',
    icone: '🧭',
    metas: [jogos.length],
    unidade: 'jogos',
    valor: (progresso) => jogos.filter((jogo) => progresso.jogosJogados.includes(jogo.id)).length,
  },
  {
    id: 'constancia',
    nome: 'Constância',
    descricao: 'Jogue 3, 7, 30 e 100 dias seguidos. A cada 7 dias seguidos você ganha 1 dia de folga.',
    icone: '📅',
    metas: [3, 7, 30, 100],
    unidade: 'dias seguidos',
    valor: (progresso) => progresso.melhorDiasSeguidos,
  },
  {
    id: 'desafios-concluidos',
    nome: 'Desafiante',
    descricao: 'Conclua 1, 10, 30 e 100 desafios do dia ou da semana.',
    icone: '🎯',
    metas: [1, 10, 30, 100],
    unidade: 'desafios',
    valor: (progresso) => progresso.desafiosConcluidos.length,
  },
  {
    id: 'rumo-ao-2048',
    nome: 'Rumo ao 2048',
    descricao: 'No 2048, chegue às peças 512, 1024 e 2048.',
    icone: '🎲',
    metas: [512, 1024, 2048],
    unidade: 'na maior peça',
    valor: (progresso) => progresso.maiorPeca,
  },
  {
    id: 'mestre-da-soma',
    nome: 'Mestre da soma',
    descricao: 'Faça uma partida perfeita de pelo menos 20 contas de adição.',
    icone: '➕',
    metas: [1],
    unidade: 'partidas perfeitas',
    valor: (progresso) => perfeitasNoModo(progresso, 'A'),
  },
  {
    id: 'mestre-da-subtracao',
    nome: 'Mestre da subtração',
    descricao: 'Faça uma partida perfeita de pelo menos 20 contas de subtração.',
    icone: '➖',
    metas: [1],
    unidade: 'partidas perfeitas',
    valor: (progresso) => perfeitasNoModo(progresso, 'S'),
  },
  {
    id: 'rei-da-divisao',
    nome: 'Rei da divisão',
    descricao: 'Faça uma partida perfeita de pelo menos 20 contas de divisão.',
    icone: '➗',
    metas: [1],
    unidade: 'partidas perfeitas',
    valor: (progresso) => perfeitasNoModo(progresso, 'D'),
  },
  {
    id: 'genio-das-expressoes',
    nome: 'Gênio das expressões',
    descricao: 'Faça 1, 5 e 10 partidas perfeitas de pelo menos 20 contas no modo de expressões numéricas.',
    icone: '🧠',
    metas: [1, 5, 10],
    unidade: 'partidas perfeitas',
    valor: (progresso) => perfeitasNoModo(progresso, 'E'),
  },
  {
    id: 'quatro-operacoes',
    nome: 'Quatro operações',
    descricao: 'Faça uma partida perfeita de pelo menos 20 contas em todos os modos da tabuada.',
    icone: '🎓',
    metas: [MODOS.length],
    unidade: 'modos',
    valor: (progresso) => MODOS.filter((modo) => perfeitasNoModo(progresso, modo) > 0).length,
  },
  {
    id: 'maratonista',
    nome: 'Maratonista',
    descricao: 'Faça uma partida perfeita de 100 contas.',
    icone: '🏃',
    metas: [1],
    unidade: 'partidas',
    valor: (progresso) => progresso.maratonas,
  },
  {
    id: 'recordista',
    nome: 'Recordista',
    descricao: 'Bata o seu recorde de pontuação na tabuada 5, 10 e 25 vezes.',
    icone: '📈',
    metas: [5, 10, 25],
    unidade: 'recordes',
    valor: (progresso) => progresso.recordesBatidos,
  },
  {
    id: 'sem-pressa-sem-erro',
    nome: 'Sem pressa, sem erro',
    descricao: 'Acerte 1.000, 5.000 e 10.000 contas no total.',
    icone: '✅',
    metas: [1000, 5000, 10000],
    unidade: 'acertos',
    valor: (progresso) => progresso.acertos,
  },
  {
    id: 'volta-por-cima',
    nome: 'Volta por cima',
    descricao: 'Erre as 3 primeiras contas e termine a partida com 90% ou mais de acerto.',
    icone: '💪',
    metas: [1],
    unidade: 'partidas',
    valor: (progresso) => progresso.voltasPorCima,
  },
  {
    id: 'memoria-de-elefante',
    nome: 'Memória de elefante',
    descricao: 'Na Memória da tabuada, termine o nível difícil com no máximo 1,5 vez o mínimo de jogadas.',
    icone: '🐘',
    metas: [1],
    unidade: 'partidas',
    valor: (progresso) => progresso.memoriasDeElefante,
  },
  {
    id: 'relampago-da-memoria',
    nome: 'Relâmpago da memória',
    descricao: 'Na Memória da tabuada, termine o nível médio em menos de 60 segundos.',
    icone: '🌩️',
    metas: [1],
    unidade: 'partidas',
    valor: (progresso) => progresso.memoriasRelampago,
  },
  {
    id: 'sem-desperdicio',
    nome: 'Sem desperdício',
    descricao: 'Na Memória da tabuada, termine um nível sem errar duas vezes com a mesma carta.',
    icone: '🃏',
    metas: [1],
    unidade: 'partidas',
    valor: (progresso) => progresso.memoriasSemDesperdicio,
  },
  {
    id: 'pontuador',
    nome: 'Pontuador',
    descricao: 'No 2048, faça 10.000, 20.000 e 50.000 pontos em uma partida.',
    icone: '💯',
    metas: [10000, 20000, 50000],
    unidade: 'pontos',
    valor: (progresso) => progresso.maiorPontuacao2048,
  },
  {
    id: 'minimalista',
    nome: 'Minimalista',
    descricao: 'No 2048, chegue à peça 1024 sem usar o desfazer.',
    icone: '🪶',
    metas: [1024],
    unidade: 'na maior peça',
    valor: (progresso) => progresso.maiorPecaSemDesfazer,
  },
  {
    id: 'gabarito',
    nome: 'Gabarito',
    descricao: 'No Teste de QI com Números, acerte as 15 questões de uma partida.',
    icone: '📝',
    metas: [1],
    unidade: 'partidas',
    valor: (progresso) => progresso.gabaritos,
  },
  {
    id: 'mestre-dos-padroes',
    nome: 'Mestre dos Padrões',
    descricao: 'No Teste de QI com Números, acerte 10, 50 e 100 questões no total.',
    icone: '🧩',
    metas: [10, 50, 100],
    unidade: 'questões',
    valor: (progresso) => progresso.padroesAcertados,
  },
  {
    id: 'sem-titubear',
    nome: 'Sem titubear',
    descricao: 'No Teste de QI com Números, acerte as 15 questões respondendo, em média, em até 10 segundos cada.',
    icone: '😎',
    metas: [1],
    unidade: 'partidas',
    valor: (progresso) => progresso.semTitubear,
  },
  {
    id: 'mais-rapido-que-a-maquina',
    nome: 'Mais rápido que a máquina',
    descricao: 'Na Corrida contra o robô, vença o Robô campeão.',
    icone: '🏎️',
    metas: [1],
    unidade: 'corridas',
    valor: (progresso) => progresso.vitoriasContraCampeao,
  },
  {
    id: 'semana-perfeita',
    nome: 'Semana perfeita',
    descricao: 'Conclua os 7 desafios do dia de uma mesma semana.',
    icone: '🗓️',
    metas: [7],
    unidade: 'desafios do dia',
    valor: desafiosDoDiaNaMesmaSemana,
  },
  {
    id: 'fim-de-semana-estudioso',
    nome: 'Fim de semana estudioso',
    descricao: 'Jogue no sábado e no domingo em 4 fins de semana.',
    icone: '🛋️',
    metas: [4],
    unidade: 'fins de semana',
    valor: (progresso) => progresso.finsDeSemana,
  },
  {
    id: 'coruja-noturna',
    nome: 'Coruja noturna',
    descricao: 'Termine uma partida entre 22h e 5h.',
    icone: '🦉',
    metas: [1],
    unidade: 'partidas',
    valor: (progresso) => progresso.partidasNoturnas,
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
    secreta: true,
  },
];

export const buscarMedalha = (id: string) => medalhas.find((medalha) => medalha.id === id);

export const nomeNivel = (medalha: Medalha, nivel: number) => (medalha.metas.length > 1 ? NIVEIS[nivel - 1] || '' : '');

export const nivelAlcancado = (medalha: Medalha, progresso: Progresso) => {
  const valor = medalha.valor(progresso);
  return medalha.metas.filter((meta) => (medalha.menorMelhor ? valor > 0 && valor <= meta : valor >= meta)).length;
};
