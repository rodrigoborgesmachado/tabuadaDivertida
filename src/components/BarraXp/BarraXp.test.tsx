import { cleanup, render, screen } from '@testing-library/react';
import { criarProgresso, STORAGE_KEY } from '../../gamificacao/progresso';
import { xpTotalDoNivel } from '../../gamificacao/xp';
import BarraXp from './BarraXp';

describe('BarraXp', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('shows the saved level and the progress to the next one', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...criarProgresso(), xp: 315 }));

    render(<BarraXp />);

    expect(screen.getByText('Nível 2 · Aprendiz')).toBeTruthy();
    expect(screen.getByText('115/230 XP para o nível 3')).toBeTruthy();
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('50');
    expect(screen.getByText('🎨 Personalizar robô').getAttribute('href')).toBe('/personalizar');
  });

  it('hides the shortcut when asked', () => {
    render(<BarraXp xp={0} atalho={false} />);

    expect(screen.queryByText('🎨 Personalizar robô')).toBeNull();
  });

  it('shows the XP earned in the match', () => {
    render(<BarraXp xp={60} ganho={25} />);

    expect(screen.getByText('+25 XP')).toBeTruthy();
    expect(screen.queryByText(/Subiu para o nível/)).toBeNull();
  });

  it('keeps the title reached before the level curve changed', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...criarProgresso(), xp: 2700, nivelDoTitulo: 10 }));

    render(<BarraXp />);

    expect(screen.getByText('Nível 9 · Mestre da Tabuada')).toBeTruthy();
  });

  it('shows the seal of the active XP booster', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 3, 10, 0));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...criarProgresso(), boosters: { '2026-11-03': 3 } }));

    const { unmount } = render(<BarraXp />);
    expect(screen.getByText('⚡ 3× XP')).toBeTruthy();
    unmount();

    vi.setSystemTime(new Date(2026, 10, 4, 10, 0));
    render(<BarraXp />).unmount();
    expect(screen.queryByText(/× XP/)).toBeNull();

    vi.setSystemTime(new Date(2026, 10, 7, 10, 0));
    render(<BarraXp />);
    expect(screen.getByText('⚡ 2× XP')).toBeTruthy();
    vi.useRealTimers();
  });

  it('changes the look of the level seal by band and shows the legend stars', () => {
    const { container, unmount } = render(<BarraXp xp={0} />);
    expect(container.querySelector('.barra-xp--bronze')).toBeTruthy();
    expect(container.querySelector('.barra-xp__estrelas')).toBeNull();
    unmount();

    render(<BarraXp xp={xpTotalDoNivel(20)} />);
    expect(screen.getByTitle('Faixa Ouro').textContent).toBe('20');
    cleanup();

    const { container: lenda } = render(<BarraXp xp={xpTotalDoNivel(60)} />);
    expect(lenda.querySelector('.barra-xp--arco-iris')).toBeTruthy();
    expect(screen.getByText('Nível 60 · Lenda Suprema III')).toBeTruthy();
    expect(lenda.querySelector('.barra-xp__estrelas')?.textContent).toBe('⭐2');
  });

  it('celebrates when the match makes the player level up', () => {
    render(<BarraXp xp={440} ganho={30} />);

    expect(screen.getByText('Nível 3 · Contador')).toBeTruthy();
    expect(screen.getByRole('status').textContent).toBe('⬆️ Subiu para o nível 3!');
  });
});
