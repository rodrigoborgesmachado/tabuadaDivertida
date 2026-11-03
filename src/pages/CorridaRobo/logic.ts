export type Operacao = 'M' | 'A' | 'S' | 'D' | 'R';

export type NivelRobo = 'sonolento' | 'atento' | 'turbo' | 'campeao';

export type Vencedor = 'jogador' | 'robo';

export interface Conta {
  texto: string;
  resposta: number;
}

export interface ConfigNivelRobo {
  nome: string;
  icone: string;
  msPorCasa: number;
}

export const CASAS_CORRIDA = [10, 20, 30, 50];
export const CASAS_PADRAO = 20;
export const PENALIDADE_MS = 2000;

export const NIVEIS_ROBO: Record<NivelRobo, ConfigNivelRobo> = {
  sonolento: { nome: 'Robô sonolento', icone: '😴', msPorCasa: 6000 },
  atento: { nome: 'Robô atento', icone: '👀', msPorCasa: 4000 },
  turbo: { nome: 'Robô turbo', icone: '🚀', msPorCasa: 3000 },
  campeao: { nome: 'Robô campeão', icone: '🏆', msPorCasa: 2000 },
};

const MAXIMOS: Record<Operacao, number> = { M: 10, D: 10, A: 99, S: 99, R: 10 };

const OPERACOES_ALEATORIAS: Exclude<Operacao, 'R'>[] = ['M', 'S', 'A', 'D'];

const inteiro = (min: number, max: number, random: () => number) => Math.floor(random() * (max - min + 1)) + min;

export const gerarConta = (operacao: Operacao, random: () => number = Math.random): Conta => {
  const tipo = operacao === 'R' ? OPERACOES_ALEATORIAS[inteiro(0, OPERACOES_ALEATORIAS.length - 1, random)] : operacao;
  const a = inteiro(2, MAXIMOS[operacao], random);
  const b = inteiro(2, MAXIMOS[operacao], random);

  if (tipo === 'D') {
    return { texto: `${a * b}÷${b}`, resposta: a };
  }

  if (tipo === 'S') {
    return { texto: `${Math.max(a, b)}-${Math.min(a, b)}`, resposta: Math.abs(a - b) };
  }

  if (tipo === 'A') {
    return { texto: `${a}+${b}`, resposta: a + b };
  }

  return { texto: `${a}x${b}`, resposta: a * b };
};

export const tempoDoRobo = (nivel: NivelRobo, totalCasas: number) => totalCasas * NIVEIS_ROBO[nivel].msPorCasa;

export const posicaoRobo = (nivel: NivelRobo, decorrido: number, totalCasas: number) =>
  Math.min(totalCasas, Math.max(0, decorrido) / NIVEIS_ROBO[nivel].msPorCasa);

export const vencedor = (casasJogador: number, nivel: NivelRobo, decorrido: number, totalCasas: number): Vencedor | null => {
  if (casasJogador >= totalCasas) return 'jogador';
  if (decorrido >= tempoDoRobo(nivel, totalCasas)) return 'robo';
  return null;
};

export const chaveCorrida = (operacao: Operacao, nivel: NivelRobo, totalCasas: number) =>
  `${operacao}-${nivel}${totalCasas === CASAS_PADRAO ? '' : `-${totalCasas}`}`;

export const formatarTempo = (ms: number) => `${(Math.floor(ms / 100) / 10).toFixed(1).replace('.', ',')}s`;
