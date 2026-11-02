import { FATORES } from '../../gamificacao/medalhas';
import { chaveSemana } from '../../gamificacao/sequenciaDias';
import type { HistoricoItem } from '../../services/historico';

export type Periodo = '7' | '30' | 'tudo';

export type Desempenho = 'domina' | 'as-vezes' | 'erra' | 'sem-dados';

export interface Totais {
  jogos: number;
  questoes: number;
  acertos: number;
  tempo: number;
  recorde: number;
}

export interface ErroComum {
  questao: string;
  resposta: number | null;
  erros: number;
}

export interface CasaDoMapa {
  a: number;
  b: number;
  acertos: number;
  erros: number;
  desempenho: Desempenho;
}

export interface PontoEvolucao {
  data: Date;
  taxa: number;
  tempoPorConta: number;
}

const DIA = 86400000;

const numero = (valor: unknown) => parseInt(String(valor || '0')) || 0;

const dataDa = (item: HistoricoItem) => {
  const data = item.data ? new Date(item.data) : null;
  return data && !isNaN(data.getTime()) ? data : null;
};

export const respostaCorreta = (texto: string): number | null => {
  const tokens = texto.replace(/\s+/g, '').match(/\d+|[-+x÷()]/g) || [];
  let posicao = 0;

  const fator = (): number => {
    const token = tokens[posicao++];
    if (token === '(') {
      const valor = expressao();
      return tokens[posicao++] === ')' ? valor : NaN;
    }
    return /^\d+$/.test(token || '') ? Number(token) : NaN;
  };

  const termo = () => {
    let valor = fator();
    while (tokens[posicao] === 'x' || tokens[posicao] === '÷') {
      valor = tokens[posicao++] === 'x' ? valor * fator() : valor / fator();
    }
    return valor;
  };

  const expressao = () => {
    let valor = termo();
    while (tokens[posicao] === '+' || tokens[posicao] === '-') {
      valor = tokens[posicao++] === '+' ? valor + termo() : valor - termo();
    }
    return valor;
  };

  const resultado = expressao();
  return tokens.length > 0 && posicao === tokens.length && Number.isInteger(resultado) ? resultado : null;
};

export const filtrarPorPeriodo = (historico: HistoricoItem[], periodo: Periodo, agora = new Date()) => {
  if (periodo === 'tudo') {
    return historico;
  }

  const inicio = agora.getTime() - Number(periodo) * DIA;
  return historico.filter((item) => (dataDa(item)?.getTime() ?? -Infinity) >= inicio);
};

const criarTotais = (): Totais => ({ jogos: 0, questoes: 0, acertos: 0, tempo: 0, recorde: 0 });

const somar = (totais: Totais, item: HistoricoItem): Totais => ({
  jogos: totais.jogos + 1,
  questoes: totais.questoes + numero(item.quantidadeQuestoes),
  acertos: totais.acertos + numero(item.quantidadeAcertos),
  tempo: totais.tempo + numero(item.tempo),
  recorde: Math.max(totais.recorde, item.pontuacao || 0),
});

export const taxaAcerto = (totais: Totais) => (totais.questoes > 0 ? totais.acertos / totais.questoes : 0);

export const tempoPorConta = (totais: Totais) => (totais.questoes > 0 ? totais.tempo / totais.questoes : 0);

export const resumir = (historico: HistoricoItem[]) => ({
  geral: historico.reduce(somar, criarTotais()),
  porTipo: historico.reduce<Record<string, Totais>>((porTipo, item) => {
    const tipo = item.tipo || 'M';
    return { ...porTipo, [tipo]: somar(porTipo[tipo] || criarTotais(), item) };
  }, {}),
});

export const errosMaisComuns = (historico: HistoricoItem[], limite = 10): ErroComum[] => {
  const erros: Record<string, number> = {};

  historico.forEach((item) => (item.questoes || []).forEach((questao) => {
    if (!questao?.correta) {
      erros[questao.questao] = (erros[questao.questao] || 0) + 1;
    }
  }));

  return Object.entries(erros)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limite)
    .map(([questao, quantidade]) => ({ questao, resposta: respostaCorreta(questao), erros: quantidade }));
};

export const contasParaTreino = (historico: HistoricoItem[], limite = 10) =>
  errosMaisComuns(historico, limite).flatMap(({ questao, resposta }) => (resposta === null ? [] : [{ texto: questao, resposta }]));

const avaliar = (acertos: number, erros: number): Desempenho => {
  if (acertos + erros === 0) return 'sem-dados';
  if (erros === 0) return 'domina';
  return erros / (acertos + erros) < 0.5 ? 'as-vezes' : 'erra';
};

export const mapaTabuada = (historico: HistoricoItem[]): CasaDoMapa[][] => {
  const contas: Record<string, { acertos: number; erros: number }> = {};

  historico.forEach((item) => (item.questoes || []).forEach((questao) => {
    if (/^\d+x\d+$/.test(questao?.questao || '')) {
      const atual = contas[questao.questao] || { acertos: 0, erros: 0 };
      contas[questao.questao] = questao.correta ? { ...atual, acertos: atual.acertos + 1 } : { ...atual, erros: atual.erros + 1 };
    }
  }));

  return FATORES.map((a) => FATORES.map((b) => {
    const { acertos, erros } = contas[`${a}x${b}`] || { acertos: 0, erros: 0 };
    return { a, b, acertos, erros, desempenho: avaliar(acertos, erros) };
  }));
};

export const evolucao = (historico: HistoricoItem[], limite = 30): PontoEvolucao[] =>
  historico
    .flatMap((item) => {
      const data = dataDa(item);
      const totais = somar(criarTotais(), item);
      return data && totais.questoes > 0 ? [{ data, taxa: taxaAcerto(totais) * 100, tempoPorConta: tempoPorConta(totais) }] : [];
    })
    .sort((a, b) => a.data.getTime() - b.data.getTime())
    .slice(-limite);

export const comparacaoSemanal = (historico: HistoricoItem[], agora = new Date()) => {
  const semanaAtual = chaveSemana(agora);
  const semanaPassada = chaveSemana(new Date(agora.getTime() - 7 * DIA));
  const totaisDa = (semana: string) => historico
    .filter((item) => {
      const data = dataDa(item);
      return data !== null && chaveSemana(data) === semana;
    })
    .reduce(somar, criarTotais());

  const atual = totaisDa(semanaAtual);
  const anterior = totaisDa(semanaPassada);

  if (atual.questoes === 0 || anterior.questoes === 0) {
    return null;
  }

  return { atual: taxaAcerto(atual), anterior: taxaAcerto(anterior), diferenca: Math.round((taxaAcerto(atual) - taxaAcerto(anterior)) * 100) };
};
