import { criarProgresso, type Progresso } from './progresso';
import { chaveDia, chaveSemana, diasEntre, diasSeguidosAtuais, registrarDia } from './sequenciaDias';

const diaDeNovembro = (dia: number, hora = 15, minuto = 0) => new Date(2026, 10, dia, hora, minuto);

const jogarNosDias = (dias: number[], progresso: Progresso = criarProgresso()) =>
  dias.reduce((atual, dia) => registrarDia(atual, diaDeNovembro(dia)), progresso);

describe('sequenciaDias', () => {
  it('builds the day and ISO week keys from the local date', () => {
    expect(chaveDia(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
    expect(chaveSemana(diaDeNovembro(2))).toBe('2026-S45');
    expect(chaveSemana(diaDeNovembro(8))).toBe('2026-S45');
    expect(chaveSemana(diaDeNovembro(9))).toBe('2026-S46');
    expect(chaveSemana(new Date(2027, 0, 1))).toBe('2026-S53');
    expect(chaveSemana(new Date(2026, 0, 1))).toBe('2026-S01');
  });

  it('counts the days between two keys across months and years', () => {
    expect(diasEntre('2026-10-31', '2026-11-01')).toBe(1);
    expect(diasEntre('2026-12-31', '2027-01-02')).toBe(2);
  });

  it('starts the streak on the first played day and counts it once per day', () => {
    const progresso = jogarNosDias([2, 2, 2]);

    expect(progresso.diasSeguidos).toBe(1);
    expect(progresso.ultimoDia).toBe('2026-11-02');
  });

  it('counts the next day right after midnight', () => {
    let progresso = registrarDia(criarProgresso(), diaDeNovembro(2, 23, 59));
    progresso = registrarDia(progresso, diaDeNovembro(3, 0, 1));

    expect(progresso.diasSeguidos).toBe(2);
    expect(progresso.melhorDiasSeguidos).toBe(2);
  });

  it('restarts the streak after a missed day without rest days and keeps the record', () => {
    const progresso = jogarNosDias([1, 2, 3, 5]);

    expect(progresso.diasSeguidos).toBe(1);
    expect(progresso.melhorDiasSeguidos).toBe(3);
  });

  it('earns a rest day every 7 days in a row up to 2', () => {
    expect(jogarNosDias([1, 2, 3, 4, 5, 6]).folgas).toBe(0);
    expect(jogarNosDias([1, 2, 3, 4, 5, 6, 7]).folgas).toBe(1);

    const progresso = jogarNosDias(Array.from({ length: 21 }, (_, index) => index + 1));
    expect(progresso.folgas).toBe(2);
    expect(progresso.diasSeguidos).toBe(21);
  });

  it('uses the rest days automatically when days are missed', () => {
    const comFolga = jogarNosDias([1, 2, 3, 4, 5, 6, 7]);

    const umaFalta = registrarDia(comFolga, diaDeNovembro(9));
    expect(umaFalta.diasSeguidos).toBe(8);
    expect(umaFalta.folgas).toBe(0);

    const duasFaltas = registrarDia(comFolga, diaDeNovembro(10));
    expect(duasFaltas.diasSeguidos).toBe(1);
    expect(duasFaltas.folgas).toBe(0);
  });

  it('shows the current streak only while it is still alive', () => {
    const progresso = jogarNosDias([1, 2, 3]);

    expect(diasSeguidosAtuais(criarProgresso(), diaDeNovembro(3))).toBe(0);
    expect(diasSeguidosAtuais(progresso, diaDeNovembro(3))).toBe(3);
    expect(diasSeguidosAtuais(progresso, diaDeNovembro(4))).toBe(3);
    expect(diasSeguidosAtuais(progresso, diaDeNovembro(5))).toBe(0);
    expect(diasSeguidosAtuais(jogarNosDias([1, 2, 3, 4, 5, 6, 7]), diaDeNovembro(9))).toBe(7);
  });
});
