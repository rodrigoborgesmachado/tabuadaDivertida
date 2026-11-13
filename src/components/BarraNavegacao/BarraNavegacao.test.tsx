import type { Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import BarraNavegacao from './BarraNavegacao';

vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: vi.fn() } }));

const nativo = Capacitor.isNativePlatform as Mock;

const renderBarra = (path = '/') => render(
  <MemoryRouter initialEntries={[path]}>
    <BarraNavegacao />
  </MemoryRouter>
);

describe('BarraNavegacao', () => {
  beforeEach(() => {
    nativo.mockReturnValue(true);
  });

  it('does not show the bar on the website', () => {
    nativo.mockReturnValue(false);
    renderBarra();

    expect(screen.queryByRole('navigation', { name: 'Navegação do app' })).toBeNull();
  });

  it('shows the five tabs in the app', () => {
    renderBarra();

    const links = screen.getAllByRole('link');
    expect(links.map((link) => link.textContent)).toEqual(['Início', 'Jogos', 'Progresso', 'Ranking', 'Mais']);
    expect(links.map((link) => link.getAttribute('href'))).toEqual(['/', '/jogos', '/progresso', '/ranking', '/mais']);
    expect(screen.getByRole('link', { name: 'Início' }).getAttribute('aria-current')).toBe('page');
  });

  it.each([
    ['/jogos', 'Jogos'],
    ['/progresso', 'Progresso'],
    ['/historico', 'Progresso'],
    ['/ranking', 'Ranking'],
    ['/artigos', 'Mais'],
    ['/artigos/tabuada', 'Mais'],
    ['/mais', 'Mais'],
    ['/privacidade', 'Mais'],
  ])('marks the tab of %s as active', (path, aba) => {
    renderBarra(path);

    expect(screen.getByRole('link', { name: aba }).classList.contains('barra-navegacao__item--ativo')).toBe(true);
    expect(document.querySelectorAll('.barra-navegacao__item--ativo')).toHaveLength(1);
  });

  it.each(['/selecionarjogo', '/contagem/1', '/jogo/1', '/final/1', '/jogo2048', '/jogos/sudoku'])('hides the bar while playing at %s', (path) => {
    renderBarra(path);

    expect(screen.queryByRole('navigation', { name: 'Navegação do app' })).toBeNull();
  });

  it('keeps the bar on the games list', () => {
    renderBarra('/jogos');

    expect(screen.getByRole('navigation', { name: 'Navegação do app' })).toBeTruthy();
  });
});
