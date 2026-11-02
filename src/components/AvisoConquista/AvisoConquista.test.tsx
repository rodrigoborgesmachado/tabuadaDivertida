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
      registrarProgresso({ jogo: '2048', maiorPeca: 512 });
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
});
