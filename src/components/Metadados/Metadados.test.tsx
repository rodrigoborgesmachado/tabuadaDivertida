import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import Metadados from './Metadados';

function Navegacao() {
  const navigate = useNavigate();

  return (
    <>
      <button type='button' onClick={() => navigate('/jogos/sudoku')}>Sudoku</button>
      <button type='button' onClick={() => navigate('/jogo/M')}>Jogo</button>
    </>
  );
}

const renderNavegacao = (inicio: string) => render(
  <MemoryRouter initialEntries={[inicio]}>
    <Metadados />
    <Navegacao />
  </MemoryRouter>
);

describe('Metadados', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.title = '';
  });

  it('applies the metadata of the opened page', () => {
    renderNavegacao('/artigos/tabuada-metodos-antigos-x-modernos');

    expect(document.title).toBe('Tabuada: métodos antigos x métodos modernos | Tabuada Divertida');
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://www.tabuadadivertida.com/artigos/tabuada-metodos-antigos-x-modernos');
  });

  it('updates the metadata when navigating', () => {
    renderNavegacao('/');

    fireEvent.click(screen.getByRole('button', { name: 'Sudoku' }));
    expect(document.title).toMatch(/^Sudoku online/);

    fireEvent.click(screen.getByRole('button', { name: 'Jogo' }));
    expect(document.head.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex');
  });
});
