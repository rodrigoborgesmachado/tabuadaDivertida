import api from './api';

export type JogoComRanking = '2048' | 'memoria' | 'maior-ou-menor' | 'teste-qi' | 'corrida-robo' | 'sudoku';

export interface DadosResultado {
  pontuacao?: number;
  tempo?: number;
  acertos?: number;
  total?: number;
  extras?: Record<string, unknown>;
}

export interface ItemRanking {
  nome: string;
  modo: string | null;
  pontuacao: number | null;
  tempo: number | null;
  acertos: number | null;
  total: number | null;
  dados: string | null;
  created: string;
}

export const TIMEOUT_ENVIO = 8000;
export const TOP_RANKING = 50;

export const normalizarNome = (nome: string) => nome.replace(/\s+/g, ' ').trim();

export const urlRanking = (jogo: string, modo?: string | null, top = TOP_RANKING) => {
  const params = new URLSearchParams({ jogo });
  if (modo) {
    params.set('modo', modo);
  }
  params.set('top', String(top));
  return `ResultadosJogos/ranking?${params.toString()}`;
};

export const enviarResultado = async (jogo: JogoComRanking, modo: string | null, dados: DadosResultado, nome: string) => {
  const { extras, ...valores } = dados;

  try {
    const response = await api.post('/ResultadosJogos', {
      jogo,
      modo,
      nome: normalizarNome(nome),
      ...valores,
      dados: extras ? JSON.stringify(extras) : null,
    }, { timeout: TIMEOUT_ENVIO });
    const codigo = response?.data?.success === true ? response.data.object?.Id : null;
    return typeof codigo === 'number' ? codigo : null;
  } catch {
    return null;
  }
};

export const informarNome = async (codigo: number, nome: string) => {
  try {
    const response = await api.put(`/ResultadosJogos/${codigo}/nome`, { nome: normalizarNome(nome) }, { timeout: TIMEOUT_ENVIO });
    return response?.data?.success === true;
  } catch {
    return false;
  }
};

export const buscarRanking = async (jogo: string, modo?: string | null, top = TOP_RANKING) => {
  const response = await api.get(urlRanking(jogo, modo, top), { timeout: TIMEOUT_ENVIO });
  if (!response?.data?.success) {
    throw new Error(response?.data?.message || 'Erro ao buscar ranking');
  }

  return {
    lista: (response.data.object || []) as ItemRanking[],
    total: (response.data.total || 0) as number,
  };
};

export const posicaoNoRanking = (lista: { nome: string }[], nome: string) => {
  const procurado = normalizarNome(nome).toLowerCase();
  const indice = lista.findIndex((item) => normalizarNome(item.nome).toLowerCase() === procurado);
  return indice === -1 ? null : indice + 1;
};

export const lerExtras = (item: ItemRanking): Record<string, unknown> => {
  try {
    const extras = item.dados ? JSON.parse(item.dados) : {};
    return extras && typeof extras === 'object' ? extras : {};
  } catch {
    return {};
  }
};
