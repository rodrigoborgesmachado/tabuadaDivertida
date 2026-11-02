import { criarProgresso } from './progresso';
import { calcularNivel, tituloDoNivel, xpDaPartida, xpDasMedalhas, xpDoDesafio, xpInicial, xpParaSubir } from './xp';

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
    expect(xpDasMedalhas({ 'acertos-seguidos': medalha(1) })).toBe(20);
    expect(xpDasMedalhas({ 'acertos-seguidos': medalha(3) })).toBe(140);
    expect(xpDasMedalhas({ 'acertos-seguidos': medalha(4) })).toBe(290);
    expect(xpDasMedalhas({ 'mestre-da-soma': medalha(1) })).toBe(80);
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

    expect(xpInicial(progresso)).toBe(30 + 40 + 25 + 130 + 20);
  });

  it('uses a progressive level curve', () => {
    expect(xpParaSubir(1)).toBe(100);
    expect(xpParaSubir(2)).toBe(150);
    expect(xpParaSubir(5)).toBe(300);
  });

  it('calculates the level and the XP inside it', () => {
    expect(calcularNivel(0)).toEqual({ nivel: 1, titulo: 'Aprendiz', xpNoNivel: 0, xpDoNivel: 100 });
    expect(calcularNivel(99)).toEqual({ nivel: 1, titulo: 'Aprendiz', xpNoNivel: 99, xpDoNivel: 100 });
    expect(calcularNivel(100)).toEqual({ nivel: 2, titulo: 'Aprendiz', xpNoNivel: 0, xpDoNivel: 150 });
    expect(calcularNivel(260)).toEqual({ nivel: 3, titulo: 'Contador', xpNoNivel: 10, xpDoNivel: 200 });
  });

  it('gives a title for each range of levels', () => {
    expect(tituloDoNivel(5)).toBe('Contador');
    expect(tituloDoNivel(6)).toBe('Calculista');
    expect(tituloDoNivel(10)).toBe('Mestre da Tabuada');
    expect(tituloDoNivel(15)).toBe('Gênio da Matemática');
    expect(tituloDoNivel(40)).toBe('Lenda dos Números');
  });
});
