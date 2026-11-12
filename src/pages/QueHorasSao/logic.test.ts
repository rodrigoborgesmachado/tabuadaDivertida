import { acertou, anguloDoPonteiroDasHoras, anguloDoPonteiroDosMinutos, anguloDoPonto, explicar, formatarDigital, formatarExtenso, gerarOpcoes, gerarPartida, gerarQuestao, hora, horaDe, inicioDosPonteiros, minutoDe, moverHoras, moverMinutos, normalizar, PASSO_NIVEL, pergunta, TOTAL_QUESTOES, type Nivel } from './logic';

const niveis: Nivel[] = ['facil', 'medio', 'dificil'];

const sequencia = (valores: number[]) => {
  let indice = 0;
  return () => valores[indice++ % valores.length];
};

describe('Que horas são logic', () => {
  it('turns the clock over at twelve', () => {
    expect(normalizar(hora(11, 50) + 20)).toBe(hora(12, 10));
    expect(formatarDigital(hora(11, 50) + 20)).toBe('12:10');
    expect(formatarDigital(hora(12, 40) + 35)).toBe('01:15');
    expect(formatarDigital(hora(7, 45))).toBe('07:45');
    expect(horaDe(0)).toBe(12);
    expect(minutoDe(-5)).toBe(55);
  });

  it('writes the time in words', () => {
    expect(formatarExtenso(hora(7, 45))).toBe('quinze para as oito');
    expect(formatarExtenso(hora(8, 0))).toBe('oito horas');
    expect(formatarExtenso(hora(1, 0))).toBe('uma hora');
    expect(formatarExtenso(hora(12, 0))).toBe('meio-dia');
    expect(formatarExtenso(hora(9, 30))).toBe('nove e meia');
    expect(formatarExtenso(hora(2, 15))).toBe('duas e quinze');
    expect(formatarExtenso(hora(12, 55))).toBe('cinco para a uma');
    expect(formatarExtenso(hora(11, 40))).toBe('vinte para o meio-dia');
    expect(formatarExtenso(hora(3, 23))).toBe('três e vinte e três');
    expect(formatarExtenso(hora(6, 47))).toBe('seis e quarenta e sete');
  });

  it('keeps the questions inside the level steps', () => {
    niveis.forEach((nivel) => {
      for (let i = 0; i < 200; i++) {
        const questao = gerarQuestao(nivel);
        expect(questao.resposta % PASSO_NIVEL[nivel]).toBe(0);
        expect(questao.opcoes).toHaveLength(4);
        expect(new Set(questao.opcoes).size).toBe(4);
        expect(questao.opcoes).toContain(questao.resposta);
        questao.opcoes.forEach((opcao) => expect(opcao % PASSO_NIVEL[nivel]).toBe(0));
        if (nivel !== 'dificil') {
          expect(questao.intervalo).toBeUndefined();
        }
      }
    });
  });

  it('creates interval questions only in the hard level', () => {
    const questao = gerarQuestao('dificil', sequencia([0, 0.65, 0.4]));

    expect(questao.intervalo).toBeDefined();
    expect(questao.resposta).toBe(normalizar(questao.inicio + (questao.intervalo as number)));
    expect(pergunta(questao, 'ler', 'digital')).toMatch(/^São \d\d:\d\d\. Que horas serão daqui a \d+ minutos\?$/);
  });

  it('offers the next hour and the swapped hands as wrong options', () => {
    const opcoes = gerarOpcoes(hora(7, 45), 'medio', () => 0.99);

    expect(opcoes).toContain(hora(7, 45));
    expect(opcoes).toContain(hora(8, 45));
  });

  it('creates a match of 10 different times', () => {
    const questoes = gerarPartida('medio');

    expect(questoes).toHaveLength(TOTAL_QUESTOES);
    expect(new Set(questoes.map((questao) => questao.resposta)).size).toBe(TOTAL_QUESTOES);
  });

  it('checks the answer after the turn of the clock', () => {
    const questao = { inicio: hora(11, 50), resposta: normalizar(hora(11, 50) + 20), intervalo: 20, opcoes: [] };

    expect(acertou(questao, hora(12, 10))).toBe(true);
    expect(acertou(questao, hora(11, 10))).toBe(false);
    expect(acertou(questao, hora(12, 10) + 720)).toBe(true);
    expect(pergunta(questao, 'acertar', 'extenso')).toBe('São dez para o meio-dia. Que horas serão daqui a 20 minutos?');
    expect(pergunta({ ...questao, inicio: hora(1, 40) }, 'ler', 'digital')).toBe('É 01:40. Que horas serão daqui a 20 minutos?');
    expect(explicar(questao)).toBe('11:50 + 20 minutos = 12:10. O ponteiro pequeno entre o 12 e o 1 marca 12 horas e o grande no 2 marca 10 minutos.');
  });

  it('asks and explains the plain questions', () => {
    const questao = { inicio: hora(7, 45), resposta: hora(7, 45), opcoes: [] };

    expect(pergunta(questao, 'ler', 'digital')).toBe('Que horas o relógio está marcando?');
    expect(pergunta(questao, 'acertar', 'extenso')).toBe('Coloque os ponteiros em quinze para as oito.');
    expect(explicar(questao)).toBe('O ponteiro pequeno entre o 7 e o 8 marca 7 horas e o grande no 9 marca 45 minutos.');
    expect(explicar({ ...questao, resposta: hora(1, 0) })).toBe('O ponteiro pequeno no 1 marca 1 hora e o grande no 12 marca a hora cheia.');
    expect(explicar({ ...questao, resposta: hora(4, 58) })).toBe('O ponteiro pequeno entre o 4 e o 5 marca 4 horas e o grande entre o 11 e o 12 marca 58 minutos.');
  });

  it('starts the hands at noon or at the interval start', () => {
    expect(inicioDosPonteiros({ inicio: hora(7, 45), resposta: hora(7, 45), opcoes: [] })).toBe(0);
    expect(inicioDosPonteiros({ inicio: 0, resposta: 0, opcoes: [] })).toBe(hora(3, 0));
    expect(inicioDosPonteiros({ inicio: hora(9, 40), resposta: hora(10, 15), intervalo: 35, opcoes: [] })).toBe(hora(9, 40));
  });

  it('draws the hands at the right angles', () => {
    expect(anguloDoPonteiroDosMinutos(hora(7, 45))).toBe(270);
    expect(anguloDoPonteiroDasHoras(hora(7, 30))).toBe(225);
    expect(anguloDoPonteiroDasHoras(hora(12, 0))).toBe(0);
    expect(anguloDoPonto(0, -10)).toBe(0);
    expect(anguloDoPonto(10, 0)).toBe(90);
    expect(anguloDoPonto(0, 10)).toBe(180);
    expect(anguloDoPonto(-10, 0)).toBe(270);
  });

  it('pulls the hour hand when the minute hand goes around', () => {
    expect(moverMinutos(hora(7, 45), 90, 5)).toBe(hora(7, 15));
    expect(moverMinutos(hora(7, 50), 12, 5)).toBe(hora(8, 0));
    expect(moverMinutos(hora(7, 55), 30, 5)).toBe(hora(8, 5));
    expect(moverMinutos(hora(8, 5), 330, 5)).toBe(hora(7, 55));
    expect(moverMinutos(hora(11, 50), 60, 1)).toBe(hora(12, 10));
    expect(moverMinutos(hora(3, 0), 47, 1)).toBe(hora(3, 8));
    expect(moverMinutos(hora(3, 0), 47, 5)).toBe(hora(3, 10));
  });

  it('moves the hour hand keeping the minutes', () => {
    expect(moverHoras(hora(7, 45), 120)).toBe(hora(3, 45));
    expect(moverHoras(hora(7, 0), 0)).toBe(hora(12, 0));
    expect(moverHoras(hora(7, 30), 345)).toBe(hora(11, 30));
  });
});
