import { jogos } from '../pages/Jogos/jogosConfig';
import type { Progresso } from './progresso';

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

export const NIVEIS = ['Bronze', 'Prata', 'Ouro'];

export const FATORES = [2, 3, 4, 5, 6, 7, 8, 9, 10];

const contasAcertadas = (progresso: Progresso, tabuada: number) => (progresso.tabuadas[tabuada] || []).length;

const mestres: Medalha[] = FATORES.map((tabuada) => ({
  id: `mestre-do-${tabuada}`,
  nome: `Mestre do ${tabuada}`,
  descricao: `Acerte todas as contas da tabuada do ${tabuada} (${tabuada}×2 a ${tabuada}×10). Se errar uma, ela volta a faltar.`,
  icone: '🧮',
  metas: [FATORES.length],
  unidade: 'contas',
  valor: (progresso) => contasAcertadas(progresso, tabuada),
}));

export const medalhas: Medalha[] = [
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
    descricao: 'Acerte 10, 25 e 50 contas seguidas sem errar, mesmo em partidas diferentes.',
    icone: '🔥',
    metas: [10, 25, 50],
    unidade: 'acertos seguidos',
    valor: (progresso) => progresso.melhorSequencia,
  },
  {
    id: 'partida-perfeita',
    nome: 'Partida perfeita',
    descricao: 'Termine 1, 5 e 10 partidas da tabuada sem errar nenhuma conta.',
    icone: '⭐',
    metas: [1, 5, 10],
    unidade: 'partidas perfeitas',
    valor: (progresso) => progresso.partidasPerfeitas,
  },
  {
    id: 'resposta-rapida',
    nome: 'Raio veloz',
    descricao: 'Faça uma partida perfeita de pelo menos 10 contas respondendo, em média, em até 3s, 2s e 1,5s.',
    icone: '⚡',
    metas: [3, 2, 1.5],
    unidade: 's',
    valor: (progresso) => progresso.melhorTempoMedio,
    menorMelhor: true,
  },
  {
    id: 'partidas-jogadas',
    nome: 'Jogador dedicado',
    descricao: 'Termine 10, 50 e 100 partidas em qualquer jogo do site.',
    icone: '🎮',
    metas: [10, 50, 100],
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
    descricao: 'Jogue 3, 7 e 30 dias seguidos. A cada 7 dias seguidos você ganha 1 dia de folga.',
    icone: '📅',
    metas: [3, 7, 30],
    unidade: 'dias seguidos',
    valor: (progresso) => progresso.melhorDiasSeguidos,
  },
  {
    id: 'desafios-concluidos',
    nome: 'Desafiante',
    descricao: 'Conclua 1, 10 e 30 desafios do dia ou da semana.',
    icone: '🎯',
    metas: [1, 10, 30],
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
];

export const buscarMedalha = (id: string) => medalhas.find((medalha) => medalha.id === id);

export const nomeNivel = (medalha: Medalha, nivel: number) => (medalha.metas.length > 1 ? NIVEIS[nivel - 1] || '' : '');

export const nivelAlcancado = (medalha: Medalha, progresso: Progresso) => {
  const valor = medalha.valor(progresso);
  return medalha.metas.filter((meta) => (medalha.menorMelhor ? valor > 0 && valor <= meta : valor >= meta)).length;
};
