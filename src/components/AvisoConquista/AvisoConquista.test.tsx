import { act, render, screen } from '@testing-library/react';
import { partidaFinalizada, registrarProgresso } from '../../gamificacao/progresso';
import AvisoConquista from './AvisoConquista';

jest.mock('../../services/sons', () => ({
  playConquista: jest.fn(),
}));

describe('AvisoConquista', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    window.localStorage.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows each new medal for a few seconds', () => {
    render(<AvisoConquista />);
    expect(screen.queryByRole('status')).toBeNull();

    act(() => {
      registrarProgresso({ jogo: '2048', maiorPeca: 512 }, new Date(2026, 10, 2, 22, 0));
      partidaFinalizada({ jogo: '2048', maiorPeca: 4096 }, new Date(2026, 10, 2, 23, 0));
    });

    expect(screen.getByRole('status').textContent).toContain('🎲 Rumo ao 2048 · Bronze');

    act(() => {
      jest.advanceTimersByTime(4000);
    });

    expect(screen.getByRole('status').textContent).toContain('Rumo ao 2048 · Ouro');

    for (let i = 0; i < 3; i++) {
      act(() => {
        jest.advanceTimersByTime(4000);
      });
    }

    expect(screen.queryByRole('status')).toBeNull();
  });

  it('shows the completed daily challenge before its medal', () => {
    render(<AvisoConquista />);

    act(() => {
      partidaFinalizada({ jogo: 'tabuada', contas: Array.from({ length: 20 }, () => ({ correta: true })) }, new Date(2026, 10, 2, 15, 0));
    });

    const textos = [screen.getByRole('status').textContent];
    for (let i = 0; i < 3; i++) {
      act(() => {
        jest.advanceTimersByTime(4000);
      });
      textos.push(screen.getByRole('status').textContent);
    }

    expect(textos).toEqual([
      'Desafio do dia concluído!⭐ Faça uma partida da tabuada sem errar nenhuma conta',
      'Nova medalha!🔥 Sequência de fogo · Bronze',
      'Nova medalha!⭐ Partida perfeita · Bronze',
      'Nova medalha!🎯 Desafiante · Bronze',
    ]);
  });

  it('shows the diamond level and the new medals', () => {
    render(<AvisoConquista />);

    act(() => {
      partidaFinalizada({ jogo: 'tabuada', contas: Array.from({ length: 100 }, () => ({ correta: true })) }, new Date(2026, 10, 2, 15, 0));
    });

    const textos = [screen.getByRole('status').textContent];
    for (let i = 0; i < 4; i++) {
      act(() => {
        jest.advanceTimersByTime(4000);
      });
      textos.push(screen.getByRole('status').textContent);
    }

    expect(textos).toContain('Nova medalha!🔥 Sequência de fogo · Diamante');
    expect(textos).toContain('Nova medalha!🏃 Maratonista');
  });
});
