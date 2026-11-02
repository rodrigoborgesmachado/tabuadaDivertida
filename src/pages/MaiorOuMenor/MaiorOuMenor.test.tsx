import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MaiorOuMenor from './MaiorOuMenor';

jest.mock('./logic', () => {
  const actual = jest.requireActual('./logic');
  return {
    ...actual,
    gerarRodada: () => ({ esquerda: actual.conta(6, 7), direita: actual.numero(45) }),
  };
});

const renderJogo = () => render(
  <MemoryRouter>
    <MaiorOuMenor />
  </MemoryRouter>
);

const avancar = (ms: number) => {
  for (let tempo = 0; tempo < ms; tempo += 1000) {
    act(() => {
      jest.advanceTimersByTime(1000);
    });
  }
};

const comecar = () => {
  fireEvent.click(screen.getByText('Começar'));
  avancar(3000);
};

describe('MaiorOuMenor', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    window.localStorage.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows the countdown before the round', () => {
    renderJogo();
    fireEvent.click(screen.getByText('Começar'));

    expect(screen.getByText('Prepare-se!')).toBeTruthy();
    expect(screen.queryByText('6 × 7')).toBeNull();

    avancar(3000);

    expect(screen.getByText('6 × 7')).toBeTruthy();
    expect(screen.getByText('⏱️ 90s')).toBeTruthy();
  });

  it('gives points for the right answer', () => {
    renderJogo();
    comecar();

    fireEvent.click(screen.getByText('45'));

    expect(screen.getByText('⭐ Pontos: 10')).toBeTruthy();
    expect(screen.getByText('✅ Acertos: 1')).toBeTruthy();
  });

  it('accepts the arrow keys', () => {
    renderJogo();
    comecar();

    fireEvent.keyDown(window, { key: 'ArrowRight' });

    expect(screen.getByText('⭐ Pontos: 10')).toBeTruthy();
  });

  it('takes time and shows the correct values on a wrong answer', () => {
    renderJogo();
    comecar();

    fireEvent.keyDown(window, { key: 'ArrowDown' });

    expect(screen.getByText('⏱️ 87s')).toBeTruthy();
    expect(screen.getByText('Ops! 6 × 7 = 42 < 45')).toBeTruthy();

    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(screen.getByText('⭐ Pontos: 0')).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(1200);
    });

    expect(screen.queryByText('Ops! 6 × 7 = 42 < 45')).toBeNull();
  });

  it('saves the game in the history when the time is over', () => {
    renderJogo();
    comecar();

    fireEvent.click(screen.getByText('45'));
    avancar(90000);

    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByText('🏆 Novo recorde no nível fácil!')).toBeTruthy();

    const historico = JSON.parse(window.localStorage.getItem('historico') || '[]');
    const progresso = JSON.parse(window.localStorage.getItem('tabuada-divertida-progresso') || '{}');

    expect(historico).toHaveLength(1);
    expect(historico[0]).toMatchObject({ tipo: 'MM', quantidadeQuestoes: 1, quantidadeAcertos: 1, pontuacao: 10 });
    expect(historico[0].questoes[0]).toEqual({ questao: '6 × 7 ou 45', resposta: '45', correta: true });
    expect(progresso.jogosJogados).toEqual(['maior-ou-menor']);
    expect(screen.getByText('Compartilhar')).toBeTruthy();
  });
});
