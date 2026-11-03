import { criarProgresso } from './progresso';
import { calcularNivel, nivelNaCurvaAnterior, tituloDoNivel, xpDaPartida, xpDasMedalhas, xpDoDesafio, xpInicial, xpParaSubir, xpTotalDoNivel } from './xp';

const medalha = (nivel: number) => ({ nivel, data: '2026-11-02T15:00:00.000Z' });

describe('xp', () => {
  it('gives base XP for every finished game, even a bad one', () => {
    expect(xpDaPartida(0, false)).toBe(10);
    expect(xpDaPartida(15, false)).toBe(25);
  });

  it('limits the bonus for right answers and adds the perfect game bonus', () => {
    expect(xpDaPartida(100, false)).toBe(60);
    expect(xpDaPartida(20, true)).toBe(55);
  });

  it('gives extra XP for daily and weekly challenges', () => {
    expect(xpDoDesafio('dia')).toBe(30);
    expect(xpDoDesafio('semana')).toBe(100);
  });

  it('gives XP for every medal level reached', () => {
    expect(xpDasMedalhas({})).toBe(0);
    expect(xpDasMedalhas({ 'acertos-seguidos': medalha(1) })).toBe(10);
    expect(xpDasMedalhas({ 'acertos-seguidos': medalha(3) })).toBe(70);
    expect(xpDasMedalhas({ 'acertos-seguidos': medalha(4) })).toBe(145);
    expect(xpDasMedalhas({ maratonista: medalha(1) })).toBe(40);
    expect(xpDasMedalhas({ 'medalha-removida': medalha(2) })).toBe(0);
  });

  it('rebuilds the XP of an old saved progress', () => {
    const progresso = {
      ...criarProgresso(),
      partidas: 3,
      acertos: 40,
      partidasPerfeitas: 1,
      desafiosConcluidos: ['dia:2026-11-02', 'semana:2026-11-02'],
      medalhas: { 'partida-perfeita': medalha(1) },
    };

    expect(xpInicial(progresso)).toBe(30 + 40 + 25 + 130 + 10);
  });

  it('uses a progressive level curve', () => {
    expect(xpParaSubir(1)).toBe(200);
    expect(xpParaSubir(2)).toBe(230);
    expect(xpParaSubir(5)).toBe(320);
    expect(xpTotalDoNivel(1)).toBe(0);
    expect(xpTotalDoNivel(3)).toBe(430);
  });

  it('takes weeks to reach level 10, months to level 25 and many months to level 50', () => {
    const xpPorDia = 5 * xpDaPartida(20, false) + xpDaPartida(20, true) + xpDoDesafio('dia') + xpDoDesafio('semana') / 7;
    const xpDasMedalhasFaceis = xpDasMedalhas({ 'partidas-jogadas': medalha(2), 'acertos-seguidos': medalha(2), 'partida-perfeita': medalha(2), constancia: medalha(2), explorador: medalha(1) });
    const diasAte = (nivel: number) => Math.ceil((xpTotalDoNivel(nivel) - xpDasMedalhasFaceis) / xpPorDia);

    expect(diasAte(10)).toBeGreaterThanOrEqual(7);
    expect(diasAte(10)).toBeLessThanOrEqual(14);
    expect(diasAte(25)).toBeGreaterThanOrEqual(30);
    expect(diasAte(25)).toBeLessThanOrEqual(60);
    expect(diasAte(50)).toBeGreaterThanOrEqual(150);
  });

  it('keeps the level of the previous curve to preserve what was unlocked', () => {
    expect(nivelNaCurvaAnterior(2699)).toBe(9);
    expect(nivelNaCurvaAnterior(2700)).toBe(10);
    expect(calcularNivel(2700).nivel).toBe(9);
    expect(calcularNivel(2700, 10).titulo).toBe('Mestre da Tabuada');
  });

  it('calculates the level and the XP inside it', () => {
    expect(calcularNivel(0)).toEqual({ nivel: 1, titulo: 'Aprendiz', xpNoNivel: 0, xpDoNivel: 200 });
    expect(calcularNivel(199)).toEqual({ nivel: 1, titulo: 'Aprendiz', xpNoNivel: 199, xpDoNivel: 200 });
    expect(calcularNivel(200)).toEqual({ nivel: 2, titulo: 'Aprendiz', xpNoNivel: 0, xpDoNivel: 230 });
    expect(calcularNivel(440)).toEqual({ nivel: 3, titulo: 'Contador', xpNoNivel: 10, xpDoNivel: 260 });
  });

  it('gives a title for each range of levels', () => {
    expect(tituloDoNivel(5)).toBe('Contador');
    expect(tituloDoNivel(6)).toBe('Calculista');
    expect(tituloDoNivel(10)).toBe('Mestre da Tabuada');
    expect(tituloDoNivel(15)).toBe('Gênio da Matemática');
    expect(tituloDoNivel(20)).toBe('Lenda dos Números');
    expect(tituloDoNivel(25)).toBe('Arquiteto dos Números');
    expect(tituloDoNivel(40)).toBe('Guardião da Tabuada');
    expect(tituloDoNivel(50)).toBe('Lenda Suprema');
  });
});
