import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MemoriaTabuada from './MemoriaTabuada';

jest.mock('./logic', () => {
  const actual = jest.requireActual('./logic');
  return {
    ...actual,
    criarTabuleiro: () => [
      { id: 'conta-12', tipo: 'conta', texto: '3 × 4', valor: 12 },
      { id: 'resultado-15', tipo: 'resultado', texto: '15', valor: 15 },
      { id: 'resultado-12', tipo: 'resultado', texto: '12', valor: 12 },
      { id: 'conta-15', tipo: 'conta', texto: '3 × 5', valor: 15 },
    ],
  };
});

const renderJogo = () => render(
  <MemoryRouter>
    <MemoriaTabuada />
  </MemoryRouter>
);

const cartas = () => screen.getAllByRole('button').filter((button) => button.classList.contains('memoria-carta'));

describe('MemoriaTabuada', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    window.localStorage.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('flips back two cards that are not a pair', () => {
    renderJogo();
    fireEvent.click(screen.getByText('Começar'));

    fireEvent.click(cartas()[0]);
    fireEvent.click(cartas()[1]);

    expect(screen.getByText('🔁 Jogadas: 1')).toBeTruthy();
    expect(cartas()[0].classList.contains('memoria-carta--virada')).toBe(true);

    act(() => {
      jest.advanceTimersByTime(900);
    });

    expect(cartas()[0].classList.contains('memoria-carta--virada')).toBe(false);
    expect(cartas()[1].classList.contains('memoria-carta--virada')).toBe(false);
  });

  it('keeps pairs open and shows the result when every pair is found', () => {
    renderJogo();
    fireEvent.click(screen.getByText('Começar'));

    fireEvent.click(cartas()[0]);
    fireEvent.click(cartas()[2]);

    expect(cartas()[0].classList.contains('memoria-carta--encontrada')).toBe(true);
    expect(cartas()[2].classList.contains('memoria-carta--encontrada')).toBe(true);

    fireEvent.click(cartas()[1]);
    fireEvent.click(cartas()[3]);

    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByText('🏆 Novo recorde no nível fácil!')).toBeTruthy();
    expect(JSON.parse(window.localStorage.getItem('tabuada-divertida-memoria-melhores') || '{}').facil.jogadas).toBe(2);
    expect(JSON.parse(window.localStorage.getItem('tabuada-divertida-progresso') || '{}').jogosJogados).toEqual(['memoria']);
  });

  it('ignores a third card while two are open', () => {
    renderJogo();
    fireEvent.click(screen.getByText('Começar'));

    fireEvent.click(cartas()[0]);
    fireEvent.click(cartas()[1]);
    fireEvent.click(cartas()[2]);

    expect(cartas()[2].classList.contains('memoria-carta--virada')).toBe(false);
    expect(screen.getByText('🔁 Jogadas: 1')).toBeTruthy();
  });
});
