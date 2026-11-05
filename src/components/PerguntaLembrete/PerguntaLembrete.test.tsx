import type { Mock } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Capacitor } from '@capacitor/core';
import { criarProgresso } from '../../gamificacao/progresso';
import { ativarLembrete, lerLembrete } from '../../services/lembretes';
import PerguntaLembrete from './PerguntaLembrete';

vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: vi.fn() } }));
vi.mock('@capacitor/preferences', () => ({ Preferences: { set: vi.fn().mockResolvedValue(undefined) } }));
vi.mock('../../services/lembretes', async (original) => ({ ...(await original<object>()), ativarLembrete: vi.fn() }));

const nativo = Capacitor.isNativePlatform as Mock;
const ativar = ativarLembrete as Mock;
const concluido = { ...criarProgresso(), desafiosConcluidos: ['dia:2026-11-03'] };
const pergunta = 'Quer um lembrete diário para não perder sua sequência? 🔥';

describe('PerguntaLembrete', () => {
  beforeEach(() => {
    window.localStorage.clear();
    nativo.mockReturnValue(true);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('asks only in the app after the first challenge of the day is done', () => {
    const { rerender } = render(<PerguntaLembrete progresso={criarProgresso()} />);
    expect(screen.queryByText(pergunta)).toBeNull();

    nativo.mockReturnValue(false);
    rerender(<PerguntaLembrete key='site' progresso={concluido} />);
    expect(screen.queryByText(pergunta)).toBeNull();

    nativo.mockReturnValue(true);
    rerender(<PerguntaLembrete key='app' progresso={concluido} />);
    expect(screen.getByText(pergunta)).toBeTruthy();
  });

  it('turns the reminder on and confirms the time', async () => {
    ativar.mockResolvedValue(true);
    render(<PerguntaLembrete progresso={concluido} />);

    fireEvent.click(screen.getByRole('button', { name: '🔔 Quero' }));

    expect(ativar).toHaveBeenCalledWith('18:00');
    expect((await screen.findByRole('status')).textContent).toContain('todo dia às 18:00');
  });

  it('does not insist when the permission is denied', async () => {
    ativar.mockResolvedValue(false);
    render(<PerguntaLembrete progresso={concluido} />);

    fireEvent.click(screen.getByRole('button', { name: '🔔 Quero' }));

    expect(screen.queryByText(pergunta)).toBeNull();
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('does not ask again after "Agora não"', () => {
    render(<PerguntaLembrete progresso={concluido} />);

    fireEvent.click(screen.getByRole('button', { name: 'Agora não' }));

    expect(screen.queryByText(pergunta)).toBeNull();
    expect(lerLembrete()).toEqual({ ativo: false, hora: '18:00', perguntado: true });
  });
});
