import type { Questao } from '../../services/historico';
import { respostaCorreta } from '../Resultados/logic';

export type Desempenho = 'perfeito' | 'otimo' | 'bom' | 'treinar' | 'zero';

export interface RespostaFinal extends Questao {
  certa: number | null;
}

export const desempenhoDaPartida = (acertos: number, total: number): Desempenho => {
  if (total > 0 && acertos >= total) return 'perfeito';
  if (acertos <= 0) return 'zero';
  const percentual = acertos / total;
  if (percentual >= 0.7) return 'otimo';
  return percentual >= 0.4 ? 'bom' : 'treinar';
};

export const mensagemDoDesempenho = (desempenho: Desempenho, nome: string) => {
  if (desempenho === 'perfeito') return { titulo: `🎉 Perfeito, ${nome}! Você é de outro planeta!`, texto: 'Acertou todas as contas. Você é um mestre da tabuada! 🧠' };
  if (desempenho === 'otimo') return { titulo: `🎉 Mandou bem, ${nome}!`, texto: 'Quase tudo certo. Mais uma e você gabarita! 💪' };
  if (desempenho === 'bom') return { titulo: `💪 Boa, ${nome}! Está quase lá.`, texto: 'Treine os erros e veja sua pontuação subir.' };
  if (desempenho === 'treinar') return { titulo: `🌱 Continue treinando, ${nome}!`, texto: 'Cada partida deixa você mais rápido. Bora de novo?' };
  return { titulo: `🤖 Não foi dessa vez, ${nome}!`, texto: 'Todo mestre já errou um dia. Que tal treinar essas contas?' };
};

export const respostasDaPartida = (questoes: Questao[]): RespostaFinal[] =>
  questoes
    .map((questao) => ({ ...questao, certa: respostaCorreta(questao.questao) }))
    .sort((a, b) => Number(a.correta) - Number(b.correta));

export const contasErradas = (questoes: Questao[]) => {
  const contas = new Map<string, number>();
  respostasDaPartida(questoes).forEach(({ questao, correta, certa }) => {
    if (!correta && certa !== null) {
      contas.set(questao, certa);
    }
  });
  return Array.from(contas, ([texto, resposta]) => ({ texto, resposta }));
};
