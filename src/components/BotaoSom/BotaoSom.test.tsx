import { act, fireEvent, render, screen } from '@testing-library/react';
import configData from '../../Config.json';
import { EVENTO_SOM } from '../../services/sons';
import BotaoSom from './BotaoSom';

describe('BotaoSom', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('mutes and unmutes the sound using the same setting of the profile', () => {
    render(<BotaoSom />);

    fireEvent.click(screen.getByRole('button', { name: 'Silenciar som' }));
    expect(window.localStorage.getItem(configData.SOUND_MUTED)).toBe('1');

    fireEvent.click(screen.getByRole('button', { name: 'Ativar som' }));
    expect(window.localStorage.getItem(configData.SOUND_MUTED)).toBe('0');
  });

  it('follows the change made in another place', () => {
    render(<BotaoSom />);

    act(() => {
      window.localStorage.setItem(configData.SOUND_MUTED, '1');
      window.dispatchEvent(new Event(EVENTO_SOM));
    });

    expect(screen.getByRole('button', { name: 'Ativar som' })).toBeTruthy();
  });
});
