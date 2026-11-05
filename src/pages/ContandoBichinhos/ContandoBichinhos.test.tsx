import type { Mock } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { lerProgresso } from '../../gamificacao/progresso';
import { falar } from '../../services/sons';
import ContandoBichinhos from './ContandoBichinhos';
import type { Desafio } from './logic';

const patinho = { emoji: '🦆', nome: 'patinho', plural: 'patinhos' };
const gatinho = { emoji: '🐱', nome: 'gatinho', plural: 'gatinhos' };
const sapinho = { emoji: '🐸', nome: 'sapinho', plural: 'sapinhos' };

const partida: Desafio[] = [
  { tipo: 'quantos', grupo: { bicho: patinho, quantidade: 3 }, opcoes: [2, 3, 4] },
  { tipo: 'mostre', grupo: { bicho: gatinho, quantidade: 5 }, alvo: 2 },
  { tipo: 'junte', grupos: [{ bicho: sapinho, quantidade: 2 }, { bicho: sapinho, quantidade: 3 }], opcoes: [4, 5, 3] },
  { tipo: 'mais', grupos: [{ bicho: patinho, quantidade: 1 }, { bicho: patinho, quantidade: 4 }] },
  { tipo: 'ligue', grupos: [{ bicho: patinho, quantidade: 1 }, { bicho: gatinho, quantidade: 3 }, { bicho: sapinho, quantidade: 2 }], numeros: [2, 1, 3] },
  { tipo: 'quantos', grupo: { bicho: gatinho, quantidade: 1 }, opcoes: [1, 2, 3] },
  { tipo: 'quantos', grupo: { bicho: sapinho, quantidade: 4 }, opcoes: [3, 4, 5] },
  { tipo: 'quantos', grupo: { bicho: patinho, quantidade: 5 }, opcoes: [5, 4, 3] },
];

vi.mock('./logic', async () => {
  const actual = await vi.importActual<typeof import('./logic')>('./logic');
  return {
    ...actual,
    gerarPartida: vi.fn(() => partida),
    sortearElogio: () => 'Muito bem!',
  };
});

vi.mock('../../services/sons', async () => ({
  ...(await vi.importActual('../../services/sons')),
  falar: vi.fn(),
  pararFala: vi.fn(),
  playSuccess: vi.fn(),
}));

const narrar = falar as Mock;

const renderJogo = () => render(
  <MemoryRouter>
    <ContandoBichinhos />
  </MemoryRouter>
);

const proximo = () => act(() => {
  vi.advanceTimersByTime(2000);
});

const numero = (valor: number) => screen.getByRole('button', { name: String(valor) });

const jogarAteOFim = () => {
  fireEvent.click(numero(3));
  proximo();
  fireEvent.click(screen.getByLabelText('gatinho 1'));
  fireEvent.click(screen.getByLabelText('gatinho 4'));
  fireEvent.click(screen.getByLabelText('Pronto'));
  proximo();
  fireEvent.click(numero(5));
  proximo();
  fireEvent.click(screen.getByLabelText('Grupo 2'));
  proximo();
  fireEvent.click(screen.getByLabelText('Grupo 1'));
  fireEvent.click(numero(1));
  fireEvent.click(screen.getByLabelText('Grupo 2'));
  fireEvent.click(numero(3));
  fireEvent.click(numero(2));
  fireEvent.click(screen.getByLabelText('Grupo 3'));
  proximo();
  fireEvent.click(numero(1));
  proximo();
  fireEvent.click(numero(4));
  proximo();
  fireEvent.click(numero(5));
  proximo();
};

describe('ContandoBichinhos', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.localStorage.clear();
    narrar.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('reads the instruction aloud and repeats it on demand', () => {
    renderJogo();
    fireEvent.click(screen.getByText('▶️ Jogar'));

    expect(narrar).toHaveBeenLastCalledWith('Quantos patinhos tem? Toque no número certo.');
    expect(screen.getByRole('img', { name: '3 patinhos' })).toBeTruthy();

    narrar.mockReset();
    fireEvent.click(screen.getByText('Ouvir de novo'));
    expect(narrar).toHaveBeenCalledWith('Quantos patinhos tem? Toque no número certo.');
  });

  it('cheers the right answer and moves to the next challenge', () => {
    renderJogo();
    fireEvent.click(screen.getByText('▶️ Jogar'));
    fireEvent.click(numero(3));

    expect(screen.getByRole('status').textContent).toContain('Muito bem!');
    expect(narrar).toHaveBeenLastCalledWith('3! Muito bem!');

    proximo();
    expect(narrar).toHaveBeenLastCalledWith('Toque em 2 gatinhos. Depois toque no botão verde.');
  });

  it('encourages a new try after a wrong answer', () => {
    renderJogo();
    fireEvent.click(screen.getByText('▶️ Jogar'));
    fireEvent.click(numero(4));

    expect(screen.getByText('Quase! Vamos contar de novo?')).toBeTruthy();
    expect(narrar).toHaveBeenLastCalledWith('4? Quase! Vamos contar de novo?');
    expect((numero(4) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('counts the animals touched aloud and asks to count again when it does not match', () => {
    renderJogo();
    fireEvent.click(screen.getByText('▶️ Jogar'));
    fireEvent.click(numero(3));
    proximo();

    fireEvent.click(screen.getByLabelText('gatinho 1'));
    expect(narrar).toHaveBeenLastCalledWith('1');
    fireEvent.click(screen.getByLabelText('gatinho 2'));
    fireEvent.click(screen.getByLabelText('gatinho 3'));
    expect(narrar).toHaveBeenLastCalledWith('3');
    fireEvent.click(screen.getByLabelText('Pronto'));

    expect(screen.getByText('Passou um pouquinho! Vamos contar de novo?')).toBeTruthy();
    expect(screen.getByLabelText('gatinho 1').getAttribute('aria-pressed')).toBe('false');
  });

  it('only links a group to its own number', () => {
    renderJogo();
    fireEvent.click(screen.getByText('▶️ Jogar'));
    fireEvent.click(numero(3));
    proximo();
    fireEvent.click(screen.getByLabelText('gatinho 1'));
    fireEvent.click(screen.getByLabelText('gatinho 2'));
    fireEvent.click(screen.getByLabelText('Pronto'));
    proximo();
    fireEvent.click(numero(5));
    proximo();
    fireEvent.click(screen.getByLabelText('Grupo 2'));
    proximo();

    fireEvent.click(screen.getByLabelText('Grupo 1'));
    fireEvent.click(numero(2));
    expect(screen.getByText('Quase! Vamos contar de novo?')).toBeTruthy();

    fireEvent.click(screen.getByLabelText('Grupo 1'));
    fireEvent.click(numero(1));
    expect(screen.getByText('Isso! Agora ligue outro grupo.')).toBeTruthy();
    expect((screen.getByLabelText('Grupo 1') as HTMLButtonElement).disabled).toBe(true);
  });

  it('gives stars, saves the match and lets the child play again', () => {
    renderJogo();
    fireEvent.click(screen.getByText('▶️ Jogar'));
    jogarAteOFim();

    expect(screen.getByLabelText('3 de 3 estrelas')).toBeTruthy();
    expect(narrar).toHaveBeenLastCalledWith('Parabéns! Você ganhou 3 estrelas!');
    expect(lerProgresso().partidasPorJogo['contando-bichinhos']).toBe(1);

    fireEvent.click(screen.getByText('🔁 Jogar de novo'));
    expect(narrar).toHaveBeenLastCalledWith('Quantos patinhos tem? Toque no número certo.');
  });

  it('gives fewer stars after many tries', () => {
    renderJogo();
    fireEvent.click(screen.getByText('▶️ Jogar'));
    fireEvent.click(numero(2));
    fireEvent.click(numero(4));
    fireEvent.click(numero(3));
    proximo();
    fireEvent.click(screen.getByLabelText('Pronto'));
    fireEvent.click(screen.getByLabelText('gatinho 1'));
    fireEvent.click(screen.getByLabelText('gatinho 4'));
    fireEvent.click(screen.getByLabelText('Pronto'));
    proximo();
    fireEvent.click(numero(5));
    proximo();
    fireEvent.click(screen.getByLabelText('Grupo 2'));
    proximo();
    fireEvent.click(screen.getByLabelText('Grupo 1'));
    fireEvent.click(numero(1));
    fireEvent.click(screen.getByLabelText('Grupo 2'));
    fireEvent.click(numero(3));
    fireEvent.click(numero(2));
    fireEvent.click(screen.getByLabelText('Grupo 3'));
    proximo();
    fireEvent.click(numero(1));
    proximo();
    fireEvent.click(numero(4));
    proximo();
    fireEvent.click(numero(5));
    proximo();

    expect(screen.getByLabelText('2 de 3 estrelas')).toBeTruthy();
  });
});
