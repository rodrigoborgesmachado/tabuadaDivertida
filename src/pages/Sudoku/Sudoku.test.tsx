import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { lerProgresso } from '../../gamificacao/progresso';
import Sudoku from './Sudoku';

const solucao = [
  [1, 2, 3, 4],
  [3, 4, 1, 2],
  [2, 1, 4, 3],
  [4, 3, 2, 1],
];

const inicial = [
  [0, 2, 3, 4],
  [3, 4, 1, 2],
  [2, 1, 4, 3],
  [4, 3, 2, 0],
];

vi.mock('./logic', async () => {
  const actual = await vi.importActual<typeof import('./logic')>('./logic');
  return {
    ...actual,
    gerarTabuleiro: vi.fn(() => ({ inicial: inicial.map((linha) => [...linha]), solucao })),
  };
});

vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

vi.mock('../../services/sons', async () => ({
  ...(await vi.importActual('../../services/sons')),
  playSuccess: vi.fn(),
}));

const renderJogo = () => render(
  <MemoryRouter>
    <Sudoku />
  </MemoryRouter>
);

const casa = (linha: number, coluna: number) => screen.getByRole('button', { name: new RegExp(`^Linha ${linha}, coluna ${coluna}:`) });

const numero = (valor: number) => screen.getByLabelText(`Número ${valor}`);

const iniciar = () => {
  renderJogo();
  fireEvent.click(screen.getByText('4×4'));
  fireEvent.click(screen.getByText('▶️ Jogar'));
};

describe('Sudoku', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows the sizes and levels to choose', () => {
    renderJogo();

    ['4×4', '6×6', '9×9 fácil', '9×9 médio', '9×9 difícil'].forEach((nome) => expect(screen.getByText(nome)).toBeTruthy());
  });

  it('fills the selected cell with the on-screen keypad and keeps the given numbers locked', () => {
    iniciar();

    expect(screen.getAllByRole('button', { name: /^Linha/ })).toHaveLength(16);
    expect(screen.queryByLabelText('Número 5')).toBeNull();

    fireEvent.click(casa(1, 2));
    fireEvent.click(numero(1));
    expect(casa(1, 2).textContent).toBe('2');

    fireEvent.click(casa(1, 1));
    fireEvent.click(numero(3));
    expect(casa(1, 1).textContent).toBe('3');

    fireEvent.click(screen.getByLabelText('Apagar casa'));
    expect(casa(1, 1).textContent).toBe('');
  });

  it('highlights the row, column and block of the selected cell', () => {
    iniciar();
    fireEvent.click(casa(1, 1));

    expect(casa(1, 1).className).toContain('sudoku-casa--selecionada');
    expect(casa(1, 4).className).toContain('sudoku-casa--relacionada');
    expect(casa(4, 1).className).toContain('sudoku-casa--relacionada');
    expect(casa(2, 2).className).toContain('sudoku-casa--relacionada');
    expect(casa(3, 3).className).not.toContain('sudoku-casa--relacionada');
  });

  it('marks repeated numbers only while the option is on', () => {
    iniciar();
    fireEvent.click(casa(1, 1));
    fireEvent.click(numero(2));

    expect(casa(1, 1).className).toContain('sudoku-casa--erro');
    expect(casa(1, 2).className).toContain('sudoku-casa--erro');

    fireEvent.click(screen.getByText(/Marcar erros/));
    expect(casa(1, 1).className).not.toContain('sudoku-casa--erro');
    expect(window.localStorage.getItem('tabuada-divertida-sudoku-marcar-erros')).toBe('0');
  });

  it('undoes the last move', () => {
    iniciar();
    fireEvent.click(casa(1, 1));
    fireEvent.click(numero(3));
    fireEvent.click(numero(2));
    fireEvent.click(screen.getByText('↩️ Desfazer'));

    expect(casa(1, 1).textContent).toBe('3');
  });

  it('accepts the arrows and the number keys', () => {
    iniciar();
    fireEvent.keyDown(window, { key: 'ArrowDown' });
    expect(casa(1, 1).className).toContain('sudoku-casa--selecionada');

    fireEvent.keyDown(window, { key: '3' });
    expect(casa(1, 1).textContent).toBe('3');

    fireEvent.keyDown(window, { key: 'Backspace' });
    expect(casa(1, 1).textContent).toBe('');

    fireEvent.keyDown(window, { key: '9' });
    expect(casa(1, 1).textContent).toBe('');
  });

  it('limits the hints and locks the hinted cell', () => {
    iniciar();
    fireEvent.click(casa(1, 1));
    fireEvent.click(screen.getByText('💡 Dica (3)'));

    expect(casa(1, 1).textContent).toBe('1');
    expect(casa(1, 1).className).toContain('sudoku-casa--dica');
    expect(screen.getByText('💡 Dica (2)')).toBeTruthy();

    fireEvent.click(numero(3));
    expect(casa(1, 1).textContent).toBe('1');
  });

  it('shows the time and congratulates when the board is complete', () => {
    iniciar();
    act(() => {
      vi.advanceTimersByTime(65000);
    });
    expect(screen.getByText('⏱️ 1:05')).toBeTruthy();

    fireEvent.click(casa(1, 1));
    fireEvent.click(numero(1));
    fireEvent.click(casa(4, 4));
    fireEvent.click(numero(1));

    expect(screen.getByRole('status').textContent).toContain('Você completou o Sudoku 4×4 em 1:05 sem usar dicas!');
    expect(screen.getByText('Compartilhar')).toBeTruthy();
    expect(lerProgresso().jogosJogados).toContain('sudoku');
    expect(window.localStorage.getItem('tabuada-divertida-sudoku-partida')).toBeNull();
  });

  it('saves the game in progress to continue later', () => {
    const { unmount } = renderJogo();
    fireEvent.click(screen.getByText('4×4'));
    fireEvent.click(screen.getByText('▶️ Jogar'));
    fireEvent.click(casa(1, 1));
    fireEvent.click(numero(3));
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    unmount();
    renderJogo();

    expect(casa(1, 1).textContent).toBe('3');
    expect(screen.getByText('⏱️ 0:03')).toBeTruthy();
  });
});
