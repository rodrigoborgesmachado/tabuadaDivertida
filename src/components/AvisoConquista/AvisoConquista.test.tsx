import type { Mock } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { criarProgresso, partidaFinalizada, registrarProgresso, STORAGE_KEY } from '../../gamificacao/progresso';
import { ehAndroid } from '../../services/plataforma';
import AvisoConquista from './AvisoConquista';

vi.mock('../../services/sons', () => ({
  playConquista: vi.fn(),
}));

vi.mock('../../services/plataforma', async (original) => ({
  ...(await original<typeof import('../../services/plataforma')>()),
  ehAndroid: vi.fn(),
}));

describe('AvisoConquista', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.localStorage.clear();
    (ehAndroid as Mock).mockReturnValue(false);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows each new medal for a few seconds', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...criarProgresso(), xp: 300 }));
    render(<AvisoConquista />);
    expect(screen.queryByRole('status')).toBeNull();

    act(() => {
      registrarProgresso({ jogo: '2048', maiorPeca: 512 }, new Date(2026, 10, 2, 22, 0));
      partidaFinalizada({ jogo: '2048', maiorPeca: 4096 }, new Date(2026, 10, 2, 23, 0));
    });

    expect(screen.getByRole('status').textContent).toContain('🎲 Rumo ao 2048 · Bronze');

    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(screen.getByRole('status').textContent).toContain('Rumo ao 2048 · Ouro');

    for (let i = 0; i < 3; i++) {
      act(() => {
        vi.advanceTimersByTime(4000);
      });
    }

    expect(screen.queryByRole('status')).toBeNull();
  });

  it('leaves the level up and its items to the level celebration', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...criarProgresso(), xp: 425 }));
    render(<AvisoConquista />);

    act(() => {
      partidaFinalizada({ jogo: 'memoria' }, new Date(2026, 10, 2, 15, 0));
      vi.advanceTimersByTime(0);
    });

    expect(screen.queryByRole('status')).toBeNull();
  });

  it('announces the new app icon with the robot color in the Android app', () => {
    (ehAndroid as Mock).mockReturnValue(true);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...criarProgresso(), xp: 425 }));
    render(<AvisoConquista />);

    act(() => {
      partidaFinalizada({ jogo: 'memoria' }, new Date(2026, 10, 2, 15, 0));
    });

    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(screen.getByRole('status').textContent).toBe('🎉 Novo ícone do app liberado!🤖 Robô Vermelho tomate');

    act(() => {
      vi.advanceTimersByTime(4000);
    });

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
        vi.advanceTimersByTime(4000);
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

  it('announces the XP booster activated by the daily challenge', () => {
    render(<AvisoConquista />);

    act(() => {
      partidaFinalizada({ jogo: 'tabuada', contas: Array.from({ length: 20 }, () => ({ correta: true })) }, new Date(2026, 10, 2, 15, 0));
    });

    for (let i = 0; i < 4; i++) {
      act(() => {
        vi.advanceTimersByTime(4000);
      });
    }

    expect(screen.getByRole('status').textContent).toBe('Booster ativado!⚡ 2× XP nas partidas até o fim do dia');
  });

  it('shows the diamond level and the new medals', () => {
    render(<AvisoConquista />);

    act(() => {
      partidaFinalizada({ jogo: 'tabuada', contas: Array.from({ length: 100 }, () => ({ correta: true })) }, new Date(2026, 10, 2, 15, 0));
    });

    const textos = [screen.getByRole('status').textContent];
    for (let i = 0; i < 4; i++) {
      act(() => {
        vi.advanceTimersByTime(4000);
      });
      textos.push(screen.getByRole('status').textContent);
    }

    expect(textos).toContain('Nova medalha!🔥 Sequência de fogo · Diamante');
    expect(textos).toContain('Nova medalha!🏃 Maratonista');
  });
});
