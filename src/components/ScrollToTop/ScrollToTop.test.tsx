import type { Mock, MockInstance } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import ScrollToTop from './ScrollToTop';

function Navegacao() {
  const navigate = useNavigate();

  return (
    <>
      <button type='button' onClick={() => navigate('/jogos')}>Jogos</button>
      <button type='button' onClick={() => navigate('/progresso?aba=conquistas')}>Conquistas</button>
      <button type='button' onClick={() => navigate('/#jogos')}>Âncora</button>
      <button type='button' onClick={() => navigate(-1)}>Voltar</button>
      <section id='jogos' />
    </>
  );
}

const renderNavegacao = (inicio = '/progresso') => render(
  <MemoryRouter initialEntries={[inicio]}>
    <ScrollToTop />
    <Navegacao />
  </MemoryRouter>
);

const clicar = (nome: string) => fireEvent.click(screen.getByRole('button', { name: nome }));

describe('ScrollToTop', () => {
  let rolarPagina: MockInstance;
  let rolarAteElemento: Mock;

  beforeEach(() => {
    rolarPagina = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    rolarAteElemento = vi.fn();
    Element.prototype.scrollIntoView = rolarAteElemento;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does not scroll when the page is first opened', () => {
    renderNavegacao();

    expect(rolarPagina).not.toHaveBeenCalled();
    expect(rolarAteElemento).not.toHaveBeenCalled();
  });

  it('scrolls to the top when navigating to another page', () => {
    renderNavegacao('/');

    clicar('Jogos');

    expect(rolarPagina).toHaveBeenCalledWith(0, 0);
  });

  it('keeps the position when going back', () => {
    renderNavegacao('/');
    clicar('Jogos');
    rolarPagina.mockClear();

    clicar('Voltar');

    expect(rolarPagina).not.toHaveBeenCalled();
  });

  it('scrolls to the section of the anchor', () => {
    renderNavegacao();

    clicar('Âncora');

    expect(rolarAteElemento).toHaveBeenCalledTimes(1);
    expect(rolarPagina).not.toHaveBeenCalled();
  });

  it('does not scroll when only the parameters change', () => {
    renderNavegacao();

    clicar('Conquistas');

    expect(rolarPagina).not.toHaveBeenCalled();
  });
});
