import { render, screen } from '@testing-library/react';
import PacmanLoader from './PacmanLoader';

describe('PacmanLoader', () => {
  it('announces the loading and shows five pellets by default', () => {
    const { container } = render(<PacmanLoader />);

    expect(screen.getByRole('status').textContent).toBe('Carregando...');
    expect(container.querySelectorAll('.pellet')).toHaveLength(5);
    expect((container.querySelector('.pacman-loader') as HTMLElement).style.getPropertyValue('--size')).toBe('64px');
  });

  it('uses the given size and number of pellets', () => {
    const { container } = render(<PacmanLoader size={48} dots={3} />);

    expect(container.querySelectorAll('.pellet')).toHaveLength(3);
    expect((container.querySelector('.pacman-loader') as HTMLElement).style.getPropertyValue('--size')).toBe('48px');
    expect((container.querySelector('.pacman-loader') as HTMLElement).style.getPropertyValue('--dots')).toBe('3');
  });
});
