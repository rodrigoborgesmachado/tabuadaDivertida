import { criarProgresso } from './progresso';
import { calcularNivel, nivelNaCurvaAnterior, tituloDoNivel, xpDaPartida, xpDaPartidaPerfeita, xpDasMedalhas, xpDoDesafio, xpDoJogo, xpInicial, xpParaSubir, xpTotalDoNivel } from './xp';

const medalha = (nivel: number) => ({ nivel, data: '2026-11-02T15:00:00.000Z' });

describe('xp', () => {
  it('gives base XP for every finished game, even a bad one', () => {
    expect(xpDaPartida(0, false)).toBe(10);
    expect(xpDaPartida(15, false)).toBe(25);
  });

  it('limits the bonus for right answers and adds the perfect game bonus', () => {
    expect(xpDaPartida(100, false)).toBe(60);
    expect(xpDaPartida(20, true)).toBe(40);
  });

  it('gives a perfect game bonus proportional to the number of questions', () => {
    expect(xpDaPartidaPerfeita(5)).toBe(5);
    expect(xpDaPartidaPerfeita(50)).toBe(25);
    expect(xpDaPartida(5, true)).toBe(20);
    expect(xpDaPartida(50, true)).toBe(85);
    expect(xpDaPartida(100, true)).toBe(110);
  });

  it('gives Sudoku XP by size and difficulty, with a bonus for finishing without help', () => {
    expect(xpDoJogo({ jogo: 'sudoku', modo: '4x4', dicasUsadas: 1 })).toBe(15);
    expect(xpDoJogo({ jogo: 'sudoku', modo: '4x4' })).toBe(18);
    expect(xpDoJogo({ jogo: 'sudoku', modo: '9x9-facil', marcouErros: true })).toBe(40);
    expect(xpDoJogo({ jogo: 'sudoku', modo: '9x9-dificil', dicasUsadas: 2 })).toBe(85);
    expect(xpDoJogo({ jogo: 'sudoku', modo: '9x9-dificil', dicasUsadas: 0, marcouErros: false })).toBe(102);
    expect(xpDoJogo({ jogo: 'sudoku', modo: 'desconhecido', dicasUsadas: 1 })).toBe(10);
  });

  it('gives 2048 XP by the biggest tile reached', () => {
    expect(xpDoJogo({ jogo: '2048' })).toBe(10);
    expect(xpDoJogo({ jogo: '2048', maiorPeca: 64 })).toBe(10);
    expect(xpDoJogo({ jogo: '2048', maiorPeca: 128 })).toBe(15);
    expect(xpDoJogo({ jogo: '2048', maiorPeca: 1024 })).toBe(60);
    expect(xpDoJogo({ jogo: '2048', maiorPeca: 2048 })).toBe(100);
    expect(xpDoJogo({ jogo: '2048', maiorPeca: 8192 })).toBe(150);
  });

  it('gives memory game XP by the board size', () => {
    expect(xpDoJogo({ jogo: 'memoria' })).toBe(10);
    expect(xpDoJogo({ jogo: 'memoria', nivel: 'facil' })).toBe(12);
    expect(xpDoJogo({ jogo: 'memoria', nivel: 'medio' })).toBe(18);
    expect(xpDoJogo({ jogo: 'memoria', nivel: 'dificil' })).toBe(30);
    expect(xpDoJogo({ jogo: 'tabuada', nivel: 'dificil' })).toBe(10);
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

    expect(xpInicial(progresso)).toBe(30 + 40 + 10 + 130 + 10);
    expect(xpInicial({ ...progresso, sudokusPorModo: { '4x4': 2, '9x9-dificil': 1 } })).toBe(30 + 40 + 10 + 130 + 10 + 10 + 75);
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
