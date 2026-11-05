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

  it('shows the bigger or smaller game', () => {
    renderBreadcrumbs('/jogos/maior-ou-menor');

    expect(screen.getAllByText('Jogos')).toHaveLength(1);
    expect(screen.getByText('Maior ou menor')).toBeTruthy();
  });

  it('shows the IQ test game', () => {
    renderBreadcrumbs('/jogos/teste-de-qi');

    expect(screen.getAllByText('Jogos')).toHaveLength(1);
    expect(screen.getByText('Teste de QI com Números')).toBeTruthy();
  });

  it('shows the race against the robot game', () => {
    renderBreadcrumbs('/jogos/corrida-contra-o-robo');

    expect(screen.getAllByText('Jogos')).toHaveLength(1);
    expect(screen.getByText('Corrida contra o robô')).toBeTruthy();
  });

  it('shows the counting animals game', () => {
    renderBreadcrumbs('/jogos/contando-bichinhos');

    expect(screen.getAllByText('Jogos')).toHaveLength(1);
    expect(screen.getByText('Contando bichinhos')).toBeTruthy();
  });

  it('shows the achievements tab inside my progress', () => {
    renderBreadcrumbs('/progresso?aba=conquistas');

    expect(screen.getByText('Meu progresso').getAttribute('href')).toBe('/progresso');
    expect(screen.getByText('Conquistas').getAttribute('aria-current')).toBe('page');
  });

  it('shows the results tab as the default of my progress', () => {
    renderBreadcrumbs('/progresso');

    expect(screen.getByText('Meu progresso')).toBeTruthy();
    expect(screen.getByText('Resultados').getAttribute('aria-current')).toBe('page');
  });

  it('shows the old x modern methods article', () => {
    renderBreadcrumbs('/artigos/tabuada-metodos-antigos-x-modernos');

    expect(screen.getByText('Artigos')).toBeTruthy();
    expect(screen.getByText('Tabuada: métodos antigos x modernos')).toBeTruthy();
  });
});
