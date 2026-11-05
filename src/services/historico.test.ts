import configData from '../Config.json';
import { formatarData, lerHistorico, salvarPartida, type HistoricoItem } from './historico';

const questoes = [{ questao: '2x3', resposta: '6', correta: true }];

const partida = (item: Partial<HistoricoItem> = {}): HistoricoItem => ({
  quantidadeQuestoes: '1',
  quantidadeAcertos: '1',
  tempo: '10',
  nome: 'Ana',
  tipo: 'M',
  questoes,
  ...item,
});

const erro = (name: string) => Object.assign(new Error(name), { name });

describe('historico', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('saves the match with date and score keeping the previous ones', () => {
    salvarPartida(partida({ nome: 'Antiga' }));
    expect(salvarPartida(partida({ data: '2026-11-02T13:00:00.000Z', pontuacao: 10 }))).toBe(true);

    const historico = lerHistorico();
    expect(historico).toHaveLength(2);
    expect(historico[0].nome).toBe('Antiga');
    expect(historico[1]).toMatchObject({ data: '2026-11-02T13:00:00.000Z', pontuacao: 10, questoes });
  });

  it('compacts the older matches when the storage is full and saves again', () => {
    salvarPartida(partida({ nome: 'Antiga' }));
    const setItem = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, 'setItem')
      .mockImplementationOnce(() => { throw erro('QuotaExceededError'); })
      .mockImplementation(function (this: Storage, chave: string, valor: string) { setItem.call(this, chave, valor); });

    expect(salvarPartida(partida({ nome: 'Nova' }))).toBe(true);

    const historico = lerHistorico();
    expect(historico).toHaveLength(2);
    expect(historico[0]).toEqual({ quantidadeQuestoes: '1', quantidadeAcertos: '1', tempo: '10', nome: 'Antiga', tipo: 'M' });
    expect(historico[1]).toMatchObject({ nome: 'Nova', questoes });
  });

  it('does not throw nor compact when saving fails for another reason', () => {
    salvarPartida(partida({ nome: 'Antiga' }));
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw erro('SecurityError'); });

    expect(() => salvarPartida(partida())).not.toThrow();
    expect(salvarPartida(partida())).toBe(false);
    expect(setItem).toHaveBeenCalledTimes(2);
    expect(lerHistorico()[0].questoes).toEqual(questoes);
  });

  it('does not throw when the storage stays full after compacting', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw erro('QuotaExceededError'); });

    expect(salvarPartida(partida())).toBe(false);
  });

  it('reads old matches without date and ignores invalid data', () => {
    window.localStorage.setItem(configData.HISTORICO, JSON.stringify([{ quantidadeQuestoes: '20', quantidadeAcertos: '18', tempo: '60', nome: 'Ana', tipo: 'D' }]));

    const historico = lerHistorico();
    expect(historico).toHaveLength(1);
    expect(formatarData(historico[0].data)).toBe('—');
    expect(formatarData('invalida')).toBe('—');
    expect(formatarData('2026-11-02T13:00:00.000Z')).not.toBe('—');

    window.localStorage.setItem(configData.HISTORICO, '{quebrado');
    expect(lerHistorico()).toEqual([]);
  });
});
