import type { Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Capacitor } from '@capacitor/core';
import App from './App';

vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: vi.fn() } }));
vi.mock('./routes', () => ({ default: () => null }));

const nativo = Capacitor.isNativePlatform as Mock;

describe('App', () => {
  it('shows the footer on the website', () => {
    nativo.mockReturnValue(false);
    render(<App />);

    expect(screen.getByRole('contentinfo')).toBeTruthy();
  });

  it('hides the footer in the app', () => {
    nativo.mockReturnValue(true);
    render(<App />);

    expect(screen.queryByRole('contentinfo')).toBeNull();
  });
});
