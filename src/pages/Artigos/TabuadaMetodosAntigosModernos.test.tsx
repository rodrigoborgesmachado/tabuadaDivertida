import { render, screen } from '@testing-library/react';
import TabuadaMetodosAntigosModernos from './TabuadaMetodosAntigosModernos';

describe('TabuadaMetodosAntigosModernos', () => {
  beforeEach(() => {
    document.head.innerHTML = '<meta name="description" content="Descrição padrão" />';
    document.title = 'Tabuada Divertida';
  });

  it('sets the title and the meta description of the article', () => {
    render(<TabuadaMetodosAntigosModernos />);

    expect(screen.getByRole('heading', { level: 1, name: /Tabuada: métodos antigos x métodos modernos/ })).toBeTruthy();
    expect(document.title).toBe('Tabuada: métodos antigos x métodos modernos | Tabuada Divertida');
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toMatch(/^Compare as formas tradicionais/);
  });

  it('restores the title and the meta description when leaving the article', () => {
    const { unmount } = render(<TabuadaMetodosAntigosModernos />);

    unmount();

    expect(document.title).toBe('Tabuada Divertida');
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe('Descrição padrão');
  });
});
