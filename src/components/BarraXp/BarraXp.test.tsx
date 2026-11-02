import { render, screen } from '@testing-library/react';
import { criarProgresso, STORAGE_KEY } from '../../gamificacao/progresso';
import BarraXp from './BarraXp';

describe('BarraXp', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('shows the saved level and the progress to the next one', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...criarProgresso(), xp: 175 }));

    render(<BarraXp />);

    expect(screen.getByText('Nível 2 · Aprendiz')).toBeTruthy();
    expect(screen.getByText('75/150 XP para o nível 3')).toBeTruthy();
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('50');
  });

  it('shows the XP earned in the match', () => {
    render(<BarraXp xp={60} ganho={25} />);

    expect(screen.getByText('+25 XP')).toBeTruthy();
    expect(screen.queryByText(/Subiu para o nível/)).toBeNull();
  });

  it('celebrates when the match makes the player level up', () => {
    render(<BarraXp xp={260} ganho={30} />);

    expect(screen.getByText('Nível 3 · Contador')).toBeTruthy();
    expect(screen.getByRole('status').textContent).toBe('⬆️ Subiu para o nível 3!');
  });
});
