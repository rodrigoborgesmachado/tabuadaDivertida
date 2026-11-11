import { ativarBoosters, boosterDoDesafio, boostersAtivados, multiplicadorDeXp } from './boosters';
import { desafioDaSemana, desafioDoDia } from './desafios';
import { criarProgresso } from './progresso';

const segunda = new Date(2026, 10, 2, 15, 0);
const sexta = new Date(2026, 10, 6, 15, 0);
const sabado = new Date(2026, 10, 7, 15, 0);
const domingo = new Date(2026, 10, 8, 15, 0);

describe('boosters', () => {
  it('doubles the XP automatically on weekends only', () => {
    expect(multiplicadorDeXp(criarProgresso(), sabado)).toBe(2);
    expect(multiplicadorDeXp(criarProgresso(), domingo)).toBe(2);
    expect(multiplicadorDeXp(criarProgresso(), segunda)).toBe(1);
    expect(multiplicadorDeXp(criarProgresso(), sexta)).toBe(1);
  });

  it('uses only the biggest active booster', () => {
    expect(multiplicadorDeXp({ ...criarProgresso(), boosters: { '2026-11-07': 2 } }, sabado)).toBe(2);
    expect(multiplicadorDeXp({ ...criarProgresso(), boosters: { '2026-11-07': 3 } }, sabado)).toBe(3);
    expect(multiplicadorDeXp({ ...criarProgresso(), boosters: { '2026-11-02': 3 } }, segunda)).toBe(3);
    expect(multiplicadorDeXp({ ...criarProgresso(), boosters: { '2026-11-03': 3 } }, segunda)).toBe(1);
  });

  it('activates the double XP until the end of the day with the daily challenge', () => {
    const progresso = ativarBoosters(criarProgresso(), criarProgresso(), [desafioDoDia(segunda)], segunda);

    expect(progresso.boosters).toEqual({ '2026-11-02': 2 });
    expect(multiplicadorDeXp(progresso, segunda)).toBe(2);
    expect(multiplicadorDeXp(progresso, new Date(2026, 10, 3, 8, 0))).toBe(1);
    expect(boostersAtivados(criarProgresso(), progresso, segunda)).toEqual([{ multiplicador: 2, amanha: false }]);
  });

  it('activates the triple XP for the next day with the weekly challenge', () => {
    const progresso = ativarBoosters(criarProgresso(), criarProgresso(), [desafioDaSemana(segunda)], segunda);

    expect(progresso.boosters).toEqual({ '2026-11-03': 3 });
    expect(multiplicadorDeXp(progresso, segunda)).toBe(1);
    expect(multiplicadorDeXp(progresso, new Date(2026, 10, 3, 8, 0))).toBe(3);
    expect(boostersAtivados(criarProgresso(), progresso, segunda)).toEqual([{ multiplicador: 3, amanha: true }]);
  });

  it('activates the triple XP for the next day when the streak closes seven days', () => {
    const anterior = { ...criarProgresso(), diasSeguidos: 6 };

    expect(ativarBoosters({ ...anterior, diasSeguidos: 7 }, anterior, [], segunda).boosters).toEqual({ '2026-11-03': 3 });
    expect(ativarBoosters({ ...anterior, diasSeguidos: 14 }, { ...anterior, diasSeguidos: 13 }, [], segunda).boosters).toEqual({ '2026-11-03': 3 });
    expect(ativarBoosters({ ...anterior, diasSeguidos: 7 }, { ...anterior, diasSeguidos: 7 }, [], segunda).boosters).toEqual({});
    expect(ativarBoosters({ ...anterior, diasSeguidos: 6 }, { ...anterior, diasSeguidos: 5 }, [], segunda).boosters).toEqual({});
  });

  it('keeps the biggest booster of the day and discards the old ones', () => {
    const anterior = { ...criarProgresso(), boosters: { '2026-11-01': 3, '2026-11-02': 3, '2026-11-03': 2 } };
    const progresso = ativarBoosters(anterior, anterior, [desafioDoDia(segunda), desafioDaSemana(segunda)], segunda);

    expect(progresso.boosters).toEqual({ '2026-11-02': 3, '2026-11-03': 3 });
    expect(boostersAtivados(anterior, progresso, segunda)).toEqual([{ multiplicador: 3, amanha: true }]);
  });

  it('does not announce a booster that was already active', () => {
    const progresso = ativarBoosters(criarProgresso(), criarProgresso(), [desafioDoDia(sabado)], sabado);

    expect(boostersAtivados(criarProgresso(), progresso, sabado)).toEqual([]);
  });

  it('reads the booster of each challenge from the rules', () => {
    expect(boosterDoDesafio('dia')).toBe(2);
    expect(boosterDoDesafio('semana')).toBe(3);
  });
});
