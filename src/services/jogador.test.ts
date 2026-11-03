import { act, renderHook } from '@testing-library/react';
import configData from '../Config.json';
import { casasDaCorrida, EVENTO_JOGADOR, lerNome, lerQuantidade, marcarPerfilVisto, opcaoMaisProxima, perfilVisto, QUANTIDADES, salvarNome, salvarQuantidade, STORAGE_QUANTIDADE, useJogador } from './jogador';

describe('jogador', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    window.localStorage.clear();
  });

  it('reads an empty name when the player never told it', () => {
    expect(lerNome()).toBe('');
  });

  it('saves the name trimmed and limited to 15 characters', () => {
    salvarNome('  Ana   Clara  ');
    expect(lerNome()).toBe('Ana Clara');
    expect(window.localStorage.getItem(configData.NOME_PARAM)).toBe('Ana Clara');

    salvarNome('Maria Eduarda da Silva');
    expect(lerNome()).toBe('Maria Eduarda d');

    salvarNome('');
    expect(lerNome()).toBe('');
  });

  it('uses 20 questions on the first visit', () => {
    expect(lerQuantidade()).toBe(20);
  });

  it.each(QUANTIDADES)('saves the quantity %i', (quantidade) => {
    salvarQuantidade(quantidade);
    expect(lerQuantidade()).toBe(quantidade);
  });

  it.each([[5, 10], [12, 10], [15, 10], [17, 20], [26, 30], [40, 30], [41, 50], [75, 50], [80, 100], [100, 100]])('converts the old free quantity %i to %i', (antiga, opcao) => {
    window.localStorage.setItem(configData.QUANTIDADE_PARAM, String(antiga));
    expect(lerQuantidade()).toBe(opcao);
  });

  it('prefers the saved option over the last match quantity', () => {
    window.localStorage.setItem(configData.QUANTIDADE_PARAM, '3');
    salvarQuantidade(30);
    expect(lerQuantidade()).toBe(30);
  });

  it('ignores invalid quantities', () => {
    window.localStorage.setItem(STORAGE_QUANTIDADE, 'abc');
    expect(lerQuantidade()).toBe(20);

    salvarQuantidade(33);
    expect(window.localStorage.getItem(STORAGE_QUANTIDADE)).toBe('30');
  });

  it('finds the closest option', () => {
    expect(opcaoMaisProxima(0, QUANTIDADES)).toBe(10);
    expect(opcaoMaisProxima(1000, QUANTIDADES)).toBe(100);
  });

  it.each([[10, 10], [20, 20], [30, 30], [50, 50], [100, 50]])('uses %i questions as %i squares in the race', (quantidade, casas) => {
    expect(casasDaCorrida(quantidade)).toBe(casas);
  });

  it('reads the race squares from the saved quantity', () => {
    salvarQuantidade(100);
    expect(casasDaCorrida()).toBe(50);
  });

  it('remembers the profile was seen', () => {
    expect(perfilVisto()).toBe(false);
    marcarPerfilVisto();
    expect(perfilVisto()).toBe(true);
  });

  it('treats who already has a name as having seen the profile', () => {
    window.localStorage.setItem(configData.NOME_PARAM, 'Ana');
    expect(perfilVisto()).toBe(true);
  });

  it('keeps working when the storage fails', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });

    expect(lerNome()).toBe('');
    expect(lerQuantidade()).toBe(20);
    expect(() => salvarNome('Ana')).not.toThrow();
    expect(() => salvarQuantidade(10)).not.toThrow();
    expect(() => marcarPerfilVisto()).not.toThrow();
  });

  it('updates every place when the player changes', () => {
    const { result } = renderHook(() => useJogador());
    const outro = renderHook(() => useJogador());
    const evento = jest.fn();
    window.addEventListener(EVENTO_JOGADOR, evento);

    expect(result.current).toEqual({ nome: '', quantidade: 20 });

    act(() => {
      salvarNome('Bia');
      salvarQuantidade(50);
    });

    expect(result.current).toEqual({ nome: 'Bia', quantidade: 50 });
    expect(outro.result.current).toEqual({ nome: 'Bia', quantidade: 50 });
    expect(evento).toHaveBeenCalledTimes(2);
    window.removeEventListener(EVENTO_JOGADOR, evento);
  });
});
