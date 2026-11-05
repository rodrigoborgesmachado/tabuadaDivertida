import { fireEvent, render, screen } from '@testing-library/react';
import { criarProgresso, STORAGE_KEY } from '../../gamificacao/progresso';
import DesafiosDoDia from './DesafiosDoDia';

const salvarProgresso = (dados: object) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...criarProgresso(), ...dados }));
};

describe('DesafiosDoDia', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 3, 10, 0));
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    delete (navigator as any).share;
  });

  it('invites to start the streak and shows the challenges of today and of the week', () => {
    render(<DesafiosDoDia />);

    expect(screen.getByText('Jogue hoje para acender o foguinho!')).toBeTruthy();
    expect(screen.getByText('Acerte 5 contas da tabuada do 9')).toBeTruthy();
    expect(screen.getByText('Acerte 150 contas esta semana')).toBeTruthy();
    expect(screen.getByText('0/5')).toBeTruthy();
    expect(screen.getAllByText('Jogar desafio')[0].getAttribute('href')).toBe('/selecionarjogo');
  });

  it('shows the streak, the progress and shares a completed challenge', () => {
    const share = vi.fn().mockResolvedValue(undefined);
    (navigator as any).share = share;
    salvarProgresso({
      ultimoDia: '2026-11-02',
      diasSeguidos: 8,
      melhorDiasSeguidos: 12,
      folgas: 1,
      desafios: { dia: { id: 'dia:2026-11-03', valor: 5 }, semana: { id: 'semana:2026-S45', valor: 60 } },
      desafiosConcluidos: ['dia:2026-11-03'],
    });

    render(<DesafiosDoDia />);
    fireEvent.click(screen.getByText('Compartilhar'));

    expect(screen.getByText('8 dias seguidos')).toBeTruthy();
    expect(screen.getByText(/Recorde: 12 dias · 🛟 1 folga/)).toBeTruthy();
    expect(screen.getByText('✅ Concluído!')).toBeTruthy();
    expect(screen.getByText('60/150')).toBeTruthy();
    expect(screen.getByRole('progressbar', { name: 'Progresso do desafio da semana' }).getAttribute('aria-valuenow')).toBe('40');
    expect(share.mock.calls[0][0].text).toContain('Concluí o desafio de hoje do Tabuada Divertida!');
  });

  it('ignores the progress of an old challenge', () => {
    salvarProgresso({ ultimoDia: '2026-10-30', diasSeguidos: 4, desafios: { dia: { id: 'dia:2026-11-02', valor: 1 } } });

    render(<DesafiosDoDia />);

    expect(screen.getByText('Jogue hoje para acender o foguinho!')).toBeTruthy();
    expect(screen.getByText('0/5')).toBeTruthy();
  });
});
