import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Mais from './Mais';

describe('Mais', () => {
  it('shows every link that was in the footer', () => {
    render(
      <MemoryRouter>
        <Mais />
      </MemoryRouter>
    );

    expect(screen.getByRole('navigation', { name: 'Aprender' })).toBeTruthy();
    expect(screen.getByRole('link', { name: /Tabuada/ }).getAttribute('href')).toBe('/artigos/tabuada');
    expect(screen.getByRole('link', { name: /Artigos/ }).getAttribute('href')).toBe('/artigos');
    expect(screen.getByRole('link', { name: /Sobre/ }).getAttribute('href')).toBe('/sobre');
    expect(screen.getByRole('link', { name: /Contato/ }).getAttribute('href')).toBe('/contato');
    expect(screen.getByRole('link', { name: /Política de Privacidade/ }).getAttribute('href')).toBe('/privacidade');
    expect(screen.getByRole('link', { name: /Contribua com o projeto/ }).getAttribute('href')).toBe('/contribua');
    expect(screen.getByRole('link', { name: 'SunSale System' }).getAttribute('href')).toBe('http://www.sunsalesystem.com.br/');
  });
});
