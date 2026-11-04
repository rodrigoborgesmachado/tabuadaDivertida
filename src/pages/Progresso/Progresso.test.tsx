import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import RoutesApp from '../../routes';
import { STORAGE_PERFIL_VISTO } from '../../services/jogador';
import Progresso, { abaDoProgresso } from './Progresso';

const Local = () => {
  const location = useLocation();
  return <span data-testid='local'>{location.pathname + location.search}</span>;
};

const renderProgresso = (path: string) => render(
  <MemoryRouter initialEntries={[path]}>
    <Routes>
      <Route path='/progresso' element={<><Progresso /><Local /></>} />
    </Routes>
  </MemoryRouter>
);

describe('Progresso', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('opens the results tab by default', () => {
    renderProgresso('/progresso');

    expect(screen.getByRole('tab', { name: '📊 Resultados' }).getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('heading', { name: 'Resultados' })).toBeTruthy();
    expect(screen.getByText('Ver histórico completo').closest('a')?.getAttribute('href')).toBe('/historico');
  });

  it('opens the achievements tab from the url', () => {
    renderProgresso('/progresso?aba=conquistas');

    expect(screen.getByRole('tab', { name: '🏅 Conquistas' }).getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('heading', { name: '🏅 Minhas conquistas' })).toBeTruthy();
  });

  it('keeps the chosen tab in the url', () => {
    renderProgresso('/progresso');

    fireEvent.click(screen.getByRole('tab', { name: '🏅 Conquistas' }));

    expect(screen.getByTestId('local').textContent).toBe('/progresso?aba=conquistas');
    expect(screen.getByRole('heading', { name: '🏅 Minhas conquistas' })).toBeTruthy();

    fireEvent.click(screen.getByRole('tab', { name: '📊 Resultados' }));

    expect(screen.getByTestId('local').textContent).toBe('/progresso?aba=resultados');
    expect(screen.getByRole('heading', { name: 'Resultados' })).toBeTruthy();
  });

  it('falls back to the results tab with an unknown tab', () => {
    expect(abaDoProgresso('conquistas')).toBe('conquistas');
    expect(abaDoProgresso('resultados')).toBe('resultados');
    expect(abaDoProgresso('outra')).toBe('resultados');
    expect(abaDoProgresso(null)).toBe('resultados');
  });

  it.each([
    ['/resultados', '?aba=resultados'],
    ['/conquistas', '?aba=conquistas'],
  ])('redirects the old %s page to its tab', (antiga, aba) => {
    window.localStorage.setItem(STORAGE_PERFIL_VISTO, '1');
    window.history.pushState({}, '', antiga);

    render(<RoutesApp />);

    expect(window.location.pathname).toBe('/progresso');
    expect(window.location.search).toBe(aba);
    window.history.pushState({}, '', '/');
  });
});
