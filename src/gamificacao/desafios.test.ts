import { jogos } from '../pages/Jogos/jogosConfig';
import { aplicarDesafios, criarSorteio, desafioConcluido, desafioDaSemana, desafioDoDia, modelosDoDia, valorDesafio } from './desafios';
import { criarProgresso } from './progresso';

const diaDeNovembro = (dia: number, hora = 12) => new Date(2026, 10, dia, hora);

const umAno = Array.from({ length: 365 }, (_, index) => new Date(2026, 0, 1 + index, 12));

describe('desafios', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('repeats the same numbers for the same seed', () => {
    const primeiro = criarSorteio('dia:2026-11-02');
    const segundo = criarSorteio('dia:2026-11-02');
    const outro = criarSorteio('dia:2026-11-03');
    const valores = [primeiro(), primeiro(), primeiro()];

    expect([segundo(), segundo(), segundo()]).toEqual(valores);
    expect(outro()).not.toBe(valores[0]);
    valores.forEach((valor) => expect(valor >= 0 && valor < 1).toBe(true));
  });

  it('draws the same daily challenge for the whole day on any device', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.99);
    const manha = desafioDoDia(diaDeNovembro(3, 0));
    const noite = desafioDoDia(new Date(2026, 10, 3, 23, 59));

    expect(manha.id).toBe('dia:2026-11-03');
    expect(noite.texto).toBe(manha.texto);
    expect(manha.texto).toBe('Acerte 5 contas da tabuada do 9');
    expect(desafioDoDia(diaDeNovembro(2)).texto).toBe('Faça uma partida da tabuada sem errar nenhuma conta');
  });

  it('draws the same weekly challenge from monday to sunday', () => {
    const segunda = desafioDaSemana(diaDeNovembro(2));

    expect(segunda.id).toBe('semana:2026-S45');
    expect(desafioDaSemana(diaDeNovembro(8)).texto).toBe(segunda.texto);
    expect(desafioDaSemana(diaDeNovembro(9)).id).toBe('semana:2026-S46');
  });

  it('varies the challenges and only draws games that exist on the site', () => {
    const modelos = new Set(umAno.map((data) => desafioDoDia(data).modelo));
    const idsJogos = jogos.map((jogo) => jogo.id);

    expect(modelos.size).toBeGreaterThan(4);
    expect(modelos.has('sudoku')).toBe(false);
    umAno.forEach((data) => {
      [desafioDoDia(data), desafioDaSemana(data)].forEach((desafio) => {
        expect(!desafio.jogo || idsJogos.includes(desafio.jogo)).toBe(true);
      });
    });
    expect(modelosDoDia.some((modelo) => modelo.jogo === 'sudoku')).toBe(true);
  });

  it('advances the daily challenge and completes it only once', () => {
    const data = diaDeNovembro(3);
    const desafio = desafioDoDia(data);
    const conta = (correta: boolean, fatores: [number, number]) => ({ correta, fatores });

    let resultado = aplicarDesafios(criarProgresso(), { jogo: 'tabuada', contas: [conta(true, [9, 2]), conta(true, [3, 4]), conta(false, [9, 5])] }, true, true, data);
    expect(valorDesafio(resultado.progresso, desafio)).toBe(1);
    expect(resultado.concluidos).toEqual([]);

    resultado = aplicarDesafios(resultado.progresso, { jogo: 'tabuada', contas: [2, 3, 4, 5].map((fator) => conta(true, [fator, 9])) }, true, false, data);
    expect(resultado.concluidos.map((item) => item.id)).toEqual(['dia:2026-11-03']);
    expect(desafioConcluido(resultado.progresso, desafio)).toBe(true);

    resultado = aplicarDesafios(resultado.progresso, { jogo: 'tabuada', contas: [conta(true, [9, 9])] }, true, false, data);
    expect(resultado.concluidos).toEqual([]);
    expect(resultado.progresso.desafiosConcluidos).toEqual(['dia:2026-11-03']);
  });

  it('starts the progress from zero on a new day', () => {
    const ontem = aplicarDesafios(criarProgresso(), { jogo: 'tabuada', contas: [{ correta: true, fatores: [9, 2] }] }, true, true, diaDeNovembro(3));

    expect(valorDesafio(ontem.progresso, desafioDoDia(diaDeNovembro(3)))).toBe(1);
    expect(valorDesafio(ontem.progresso, desafioDoDia(diaDeNovembro(4)))).toBe(0);
  });
});
