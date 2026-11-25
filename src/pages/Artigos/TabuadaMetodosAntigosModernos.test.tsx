import { render, screen } from '@testing-library/react';
import TabuadaMetodosAntigosModernos from './TabuadaMetodosAntigosModernos';

describe('TabuadaMetodosAntigosModernos', () => {
  it('shows the title of the article', () => {
    render(<TabuadaMetodosAntigosModernos />);

    expect(screen.getByRole('heading', { level: 1, name: /Tabuada: métodos antigos x métodos modernos/ })).toBeTruthy();
  });
});
