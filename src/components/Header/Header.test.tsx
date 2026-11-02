import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from './index';

const renderHeader = () => render(
  <MemoryRouter>
    <Header theme='light' toggleTheme={() => {}} />
  </MemoryRouter>
);

describe('Header', () => {
  it('opens the menu and focuses the first item', () => {
    renderHeader();
    const toggle = screen.getByRole('button', { name: 'Abrir menu' });

    fireEvent.click(toggle);

    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(toggle.getAttribute('aria-controls')).toBe('site-menu');
    expect(document.getElementById('site-menu')?.classList.contains('open')).toBe(true);
    expect(document.activeElement?.textContent).toBe('Ranking');
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('closes the menu with Escape and returns focus to the toggle', () => {
    renderHeader();
    const toggle = screen.getByRole('button', { name: 'Abrir menu' });

    fireEvent.click(toggle);
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(toggle);
    expect(document.body.style.overflow).toBe('');
  });

  it('closes the menu when an item is chosen', () => {
    renderHeader();
    const toggle = screen.getByRole('button', { name: 'Abrir menu' });

    fireEvent.click(toggle);
    fireEvent.click(screen.getByText('Jogos'));

    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });

  it('closes the menu when touching outside', () => {
    const { container } = renderHeader();
    const toggle = screen.getByRole('button', { name: 'Abrir menu' });

    fireEvent.click(toggle);
    fireEvent.click(container.querySelector('.site-menu-backdrop') as Element);

    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(container.querySelector('.site-menu-backdrop')).toBeNull();
  });
});
