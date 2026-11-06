import { lerExtras, type ItemRanking } from '../../services/resultadosJogos';
import { CASAS_CORRIDA, chaveCorrida, NIVEIS_ROBO, type NivelRobo, type Operacao } from '../CorridaRobo/logic';
import { MODOS as MODOS_SUDOKU } from '../Sudoku/logic';

export interface ColunaRanking {
  titulo: string;
  valor: (item: ItemRanking) => string;
}

export interface ModoRanking {
  id: string;
  label: string;
}

export interface AbaRanking {
  id: string;
  nome: string;
  icone: string;
  path: string;
}

export interface JogoRanking extends AbaRanking {
  modos: ModoRanking[];
  colunas: ColunaRanking[];
}

const NIVEIS: ModoRanking[] = [
  { id: 'facil', label: 'Fácil' },
  { id: 'medio', label: 'Médio' },
  { id: 'dificil', label: 'Difícil' },
];

const MODALIDADES: ModoRanking[] = [
  { id: 'tabuada', label: 'Tabuada' },
  { id: 'fracoes', label: 'Frações' },
  { id: 'decimais', label: 'Decimais' },
  { id: 'misturado', label: 'Misturado' },
];

const OPERACOES: ModoRanking[] = [
  { id: 'M', label: 'Multiplicação' },
  { id: 'A', label: 'Adição' },
  { id: 'S', label: 'Subtração' },
  { id: 'D', label: 'Divisão' },
  { id: 'R', label: 'Aleatório' },
];

const NIVEIS_CORRIDA = Object.keys(NIVEIS_ROBO) as NivelRobo[];

const texto = (valor: unknown) => (valor === null || valor === undefined ? '—' : String(valor));

const segundos = (valor: unknown) => (typeof valor === 'number' ? `${valor}s` : '—');

export const ABA_TABUADA: AbaRanking = { id: 'tabuada', nome: 'Tabuada', icone: '✖️', path: '/selecionarjogo' };

export const jogosRanking: JogoRanking[] = [
  {
    id: '2048',
    nome: '2048',
    icone: '🎲',
    path: '/jogo2048',
    modos: [],
    colunas: [
      { titulo: 'Pontuação', valor: (item) => texto(item.pontuacao) },
      { titulo: 'Maior peça', valor: (item) => texto(lerExtras(item).maiorPeca) },
    ],
  },
  {
    id: 'memoria',
    nome: 'Memória',
    icone: '🧠',
    path: '/jogos/memoria-da-tabuada',
    modos: NIVEIS,
    colunas: [
      { titulo: 'Jogadas', valor: (item) => texto(item.pontuacao) },
      { titulo: 'Tempo', valor: (item) => segundos(item.tempo) },
    ],
  },
  {
    id: 'maior-ou-menor',
    nome: 'Maior ou menor',
    icone: '⚖️',
    path: '/jogos/maior-ou-menor',
    modos: MODALIDADES.flatMap((modalidade) => NIVEIS.map((nivel) => ({ id: `${modalidade.id}-${nivel.id}`, label: `${modalidade.label} · ${nivel.label}` }))),
    colunas: [
      { titulo: 'Pontuação', valor: (item) => texto(item.pontuacao) },
      { titulo: 'Acertos', valor: (item) => `${texto(item.acertos)}/${texto(item.total)}` },
    ],
  },
  {
    id: 'teste-qi',
    nome: 'Teste de QI',
    icone: '🧩',
    path: '/jogos/teste-de-qi',
    modos: [],
    colunas: [
      { titulo: 'Acertos', valor: (item) => `${texto(item.acertos)}/${texto(item.total)}` },
      { titulo: 'Tempo', valor: (item) => segundos(item.tempo) },
      { titulo: 'QI', valor: (item) => texto(lerExtras(item).qi) },
    ],
  },
  {
    id: 'corrida-robo',
    nome: 'Corrida',
    icone: '🏁',
    path: '/jogos/corrida-contra-o-robo',
    modos: OPERACOES.flatMap((operacao) => NIVEIS_CORRIDA.flatMap((nivel) => CASAS_CORRIDA.map((casas) => ({ id: chaveCorrida(operacao.id as Operacao, nivel, casas), label: `${operacao.label} · ${NIVEIS_ROBO[nivel].nome} · ${casas} casas` })))),
    colunas: [
      { titulo: 'Tempo', valor: (item) => segundos(item.tempo) },
      { titulo: 'Acertos', valor: (item) => `${texto(item.acertos)}/${texto(item.total)}` },
    ],
  },
  {
    id: 'sudoku',
    nome: 'Sudoku',
    icone: '🔢',
    path: '/jogos/sudoku',
    modos: MODOS_SUDOKU.map((modo) => ({ id: modo.id, label: modo.nome })),
    colunas: [
      { titulo: 'Tempo', valor: (item) => segundos(item.tempo) },
      { titulo: 'Tempo real', valor: (item) => segundos(lerExtras(item).segundos) },
      { titulo: 'Dicas', valor: (item) => texto(lerExtras(item).dicas) },
    ],
  },
];

export const abasRanking: AbaRanking[] = [ABA_TABUADA, ...jogosRanking];

export const buscarJogoRanking = (id: string | null) => jogosRanking.find((jogo) => jogo.id === id) || null;
