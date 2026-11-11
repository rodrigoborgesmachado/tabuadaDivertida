import regras from './xp.json';
import type { Desafio, TipoDesafio } from './desafios';
import type { Progresso } from './progresso';
import { chaveDia } from './sequenciaDias';

export interface BoosterAtivado {
  multiplicador: number;
  amanha: boolean;
}

const diaSeguinte = (data: Date) => new Date(data.getFullYear(), data.getMonth(), data.getDate() + 1);

export const boosterDoDesafio = (tipo: TipoDesafio) => (tipo === 'dia' ? regras.boosters.desafioDoDia : regras.boosters.desafioDaSemana);

export const multiplicadorDeXp = (progresso: Progresso, data = new Date()) =>
  Math.max(1, data.getDay() === 0 || data.getDay() === 6 ? regras.boosters.fimDeSemana : 1, progresso.boosters[chaveDia(data)] || 1);

export const ativarBoosters = (progresso: Progresso, anterior: Progresso, concluidos: Desafio[], data: Date): Progresso => {
  const hoje = chaveDia(data);
  const amanha = chaveDia(diaSeguinte(data));
  const boosters = Object.fromEntries(Object.entries(progresso.boosters).filter(([dia]) => dia >= hoje));
  const ativar = (dia: string, multiplicador: number) => {
    boosters[dia] = Math.max(boosters[dia] || 1, multiplicador);
  };

  concluidos.forEach((desafio) => ativar(desafio.tipo === 'dia' ? hoje : amanha, boosterDoDesafio(desafio.tipo)));

  if (progresso.diasSeguidos !== anterior.diasSeguidos && progresso.diasSeguidos % regras.boosters.diasDaSequencia === 0) {
    ativar(amanha, regras.boosters.sequenciaDeDias);
  }

  return { ...progresso, boosters };
};

export const boostersAtivados = (anterior: Progresso, atual: Progresso, data: Date): BoosterAtivado[] =>
  [data, diaSeguinte(data)]
    .map((dia, indice) => ({ multiplicador: multiplicadorDeXp(atual, dia), amanha: indice === 1, antes: multiplicadorDeXp(anterior, dia) }))
    .filter(({ multiplicador, antes }) => multiplicador > antes)
    .map(({ multiplicador, amanha }) => ({ multiplicador, amanha }));
