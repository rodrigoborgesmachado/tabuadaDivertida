import { aplicarDesafios, type Desafio, type TipoDesafio } from './desafios';
import { FATORES, medalhas, nivelAlcancado, type Medalha } from './medalhas';
import { chaveDia, registrarDia } from './sequenciaDias';

export const STORAGE_KEY = 'tabuada-divertida-progresso';
export const EVENTO_CONQUISTAS = 'tabuada-divertida-conquistas';
export const EVENTO_DESAFIOS = 'tabuada-divertida-desafios';
export const VERSAO_PROGRESSO = 1;

export interface MedalhaObtida {
  nivel: number;
  data: string;
}

export interface Progresso {
  versao: number;
  partidas: number;
  partidasPerfeitas: number;
  partidasNoturnas: number;
  jogosJogados: string[];
  sequenciaAtual: number;
  melhorSequencia: number;
  melhorTempoMedio: number;
  maiorPeca: number;
  tabuadas: Record<string, number[]>;
  medalhas: Record<string, MedalhaObtida>;
  ultimoDia: string;
  diasSeguidos: number;
  melhorDiasSeguidos: number;
  folgas: number;
  desafios: Partial<Record<TipoDesafio, { id: string; valor: number }>>;
  desafiosConcluidos: string[];
}

export interface ContaRespondida {
  correta: boolean;
  fatores?: [number, number];
}

export interface EventoJogo {
  jogo: string;
  contas?: ContaRespondida[];
  tempoMedio?: number;
  maiorPeca?: number;
}

export interface Conquista {
  medalha: Medalha;
  nivel: number;
}

export const criarProgresso = (): Progresso => ({
  versao: VERSAO_PROGRESSO,
  partidas: 0,
  partidasPerfeitas: 0,
  partidasNoturnas: 0,
  jogosJogados: [],
  sequenciaAtual: 0,
  melhorSequencia: 0,
  melhorTempoMedio: 0,
  maiorPeca: 0,
  tabuadas: {},
  medalhas: {},
  ultimoDia: '',
  diasSeguidos: 0,
  melhorDiasSeguidos: 0,
  folgas: 0,
  desafios: {},
  desafiosConcluidos: [],
});

const migrarProgresso = (dados: Partial<Progresso>): Progresso => ({
  ...criarProgresso(),
  ...dados,
  versao: VERSAO_PROGRESSO,
});

export const lerProgresso = (): Progresso => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const dados = stored ? JSON.parse(stored) : null;
    return dados && typeof dados === 'object' ? migrarProgresso(dados) : criarProgresso();
  } catch {
    return criarProgresso();
  }
};

const salvarProgresso = (progresso: Progresso) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progresso));
  } catch {}
};

const marcarConta = (tabuadas: Record<string, number[]>, tabuada: number, fator: number, correta: boolean) => {
  if (!FATORES.includes(tabuada) || !FATORES.includes(fator)) {
    return;
  }

  const acertadas = (tabuadas[tabuada] || []).filter((item) => item !== fator);
  tabuadas[tabuada] = correta ? [...acertadas, fator].sort((a, b) => a - b) : acertadas;
};

export const aplicarEvento = (progresso: Progresso, evento: EventoJogo, finalizada: boolean, data: Date): Progresso => {
  const proximo: Progresso = {
    ...progresso,
    jogosJogados: progresso.jogosJogados.includes(evento.jogo) ? progresso.jogosJogados : [...progresso.jogosJogados, evento.jogo],
    tabuadas: { ...progresso.tabuadas },
  };
  const contas = evento.contas || [];

  contas.forEach((conta) => {
    proximo.sequenciaAtual = conta.correta ? proximo.sequenciaAtual + 1 : 0;
    proximo.melhorSequencia = Math.max(proximo.melhorSequencia, proximo.sequenciaAtual);

    if (conta.fatores) {
      const [a, b] = conta.fatores;
      marcarConta(proximo.tabuadas, a, b, conta.correta);
      marcarConta(proximo.tabuadas, b, a, conta.correta);
    }
  });

  if (evento.maiorPeca && evento.maiorPeca > proximo.maiorPeca) {
    proximo.maiorPeca = evento.maiorPeca;
  }

  if (!finalizada) {
    return proximo;
  }

  proximo.partidas += 1;

  const hora = data.getHours();
  if (hora >= 22 || hora < 5) {
    proximo.partidasNoturnas += 1;
  }

  if (contas.length > 0 && contas.every((conta) => conta.correta)) {
    proximo.partidasPerfeitas += 1;

    if (contas.length >= 10 && evento.tempoMedio && (proximo.melhorTempoMedio === 0 || evento.tempoMedio < proximo.melhorTempoMedio)) {
      proximo.melhorTempoMedio = evento.tempoMedio;
    }
  }

  return registrarDia(proximo, data);
};

export const avaliarMedalhas = (progresso: Progresso, data: Date) => {
  const obtidas = { ...progresso.medalhas };
  const novas: Conquista[] = [];

  medalhas.forEach((medalha) => {
    const nivel = nivelAlcancado(medalha, progresso);

    if (nivel > (obtidas[medalha.id]?.nivel || 0)) {
      obtidas[medalha.id] = { nivel, data: data.toISOString() };
      novas.push({ medalha, nivel });
    }
  });

  return { progresso: { ...progresso, medalhas: obtidas }, novas };
};

const registrar = (evento: EventoJogo, finalizada: boolean, data: Date) => {
  const anterior = lerProgresso();
  const novoDia = finalizada && anterior.ultimoDia !== chaveDia(data);
  const desafios = aplicarDesafios(aplicarEvento(anterior, evento, finalizada, data), evento, finalizada, novoDia, data);
  const { progresso, novas } = avaliarMedalhas(desafios.progresso, data);
  salvarProgresso(progresso);

  if (desafios.concluidos.length > 0) {
    window.dispatchEvent(new CustomEvent<Desafio[]>(EVENTO_DESAFIOS, { detail: desafios.concluidos }));
  }

  if (novas.length > 0) {
    window.dispatchEvent(new CustomEvent<Conquista[]>(EVENTO_CONQUISTAS, { detail: novas }));
  }

  return novas;
};

export const partidaFinalizada = (evento: EventoJogo, data = new Date()) => registrar(evento, true, data);

export const registrarProgresso = (evento: EventoJogo, data = new Date()) => registrar(evento, false, data);

export const contasDaTabuada = (questoes: { questao: string; correta: boolean }[]): ContaRespondida[] =>
  questoes.map((questao) => {
    const multiplicacao = /^(\d+)x(\d+)$/.exec(questao.questao);
    return multiplicacao
      ? { correta: questao.correta, fatores: [Number(multiplicacao[1]), Number(multiplicacao[2])] }
      : { correta: questao.correta };
  });
