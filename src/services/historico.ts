import configData from '../Config.json';
import { gravarItem } from './armazenamento';

export type Questao = {
  questao: string;
  resposta: string;
  correta: boolean;
};

export type HistoricoItem = {
  quantidadeQuestoes: number | string | null;
  quantidadeAcertos: number | string | null;
  tempo: number | string | null;
  nome: string | null;
  tipo: 'M' | 'D' | 'A' | 'S' | 'R' | 'E' | string;
  questoes?: Questao[] | null;
  data?: string;
  pontuacao?: number;
};

const erroDeQuota = (erro: unknown) => {
  const nome = (erro as { name?: string } | null)?.name;
  return nome === 'QuotaExceededError' || nome === 'NS_ERROR_DOM_QUOTA_REACHED';
};

const gravar = (historico: HistoricoItem[]) => {
  gravarItem(configData.HISTORICO, JSON.stringify(historico));
};

export const lerHistorico = (): HistoricoItem[] => {
  try {
    const stored = window.localStorage.getItem(configData.HISTORICO);
    const dados = stored ? JSON.parse(stored) : [];
    return Array.isArray(dados) ? dados : [];
  } catch {
    return [];
  }
};

export const salvarPartida = (partida: HistoricoItem) => {
  const anteriores = lerHistorico();

  try {
    gravar([...anteriores, partida]);
    return true;
  } catch (erro) {
    if (!erroDeQuota(erro)) {
      return false;
    }
  }

  try {
    gravar([...anteriores.map(({ questoes, ...item }) => item), partida]);
    return true;
  } catch {
    return false;
  }
};

export const formatarData = (data?: string) => {
  const valor = data ? new Date(data) : null;
  return valor && !isNaN(valor.getTime()) ? valor.toLocaleString('pt-BR') : '—';
};
