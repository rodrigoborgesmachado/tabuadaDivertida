import { render, screen } from '@testing-library/react';
import { criarProgresso, STORAGE_KEY } from '../../gamificacao/progresso';
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

  it('celebrates when the match makes the player level up', () => {
    render(<BarraXp xp={440} ganho={30} />);

    expect(screen.getByText('Nível 3 · Contador')).toBeTruthy();
    expect(screen.getByRole('status').textContent).toBe('⬆️ Subiu para o nível 3!');
  });
});
