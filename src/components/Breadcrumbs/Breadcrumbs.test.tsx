import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Breadcrumbs from './index';

const renderBreadcrumbs = (path: string) => render(
  <MemoryRouter initialEntries={[path]}>
    <Breadcrumbs />
  </MemoryRouter>
);

describe('Breadcrumbs', () => {
  it('shows the games page before a game outside of it', () => {
    renderBreadcrumbs('/jogo2048');

    expect(screen.getByText('Jogos')).toBeTruthy();
    expect(screen.getByText('Jogo 2048')).toBeTruthy();
  });

  it('shows the games page only once for the memory game', () => {
    renderBreadcrumbs('/jogos/memoria-da-tabuada');

    expect(screen.getAllByText('Jogos')).toHaveLength(1);
    expect(screen.getByText('Memória da tabuada')).toBeTruthy();
  });

  it('shows the achievements page', () => {
    renderBreadcrumbs('/conquistas');

    expect(screen.getByText('Minhas conquistas')).toBeTruthy();
  });
});
