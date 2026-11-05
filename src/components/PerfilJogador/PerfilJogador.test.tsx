import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import configData from '../../Config.json';
import { lerNome } from '../../services/jogador';
import { EVENTO_SOM } from '../../services/sons';
import { TemaContext } from '../ThemeSwitcher/temaContext';
import PerfilJogador from './PerfilJogador';

const renderPerfil = (theme: 'light' | 'dark' = 'light', toggleTheme = vi.fn(), onFechar = vi.fn()) => render(
  <TemaContext.Provider value={{ theme, toggleTheme }}>
    <MemoryRouter>
      <PerfilJogador onFechar={onFechar} />
    </MemoryRouter>
  </TemaContext.Provider>
);

describe('PerfilJogador', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('organizes the settings in player, appearance and sound sections', () => {
    renderPerfil();

    expect(screen.getByRole('region', { name: 'Jogador' })).toBeTruthy();
    expect(screen.getByRole('region', { name: 'Aparência' })).toBeTruthy();
    expect(screen.getByRole('region', { name: 'Som' })).toBeTruthy();
  });

  it('changes the theme right away without saving', () => {
    const toggleTheme = vi.fn();
    const onFechar = vi.fn();
    renderPerfil('light', toggleTheme, onFechar);

    expect(screen.getByText('Claro')).toBeTruthy();
    fireEvent.click(document.getElementById('dark') as HTMLInputElement);

    expect(toggleTheme).toHaveBeenCalledTimes(1);
    expect(onFechar).not.toHaveBeenCalled();
  });

  it('shows the dark theme as selected', () => {
    renderPerfil('dark');

    expect(screen.getByText('Escuro')).toBeTruthy();
    expect((document.getElementById('dark') as HTMLInputElement).checked).toBe(true);
  });

  it('turns the sound off and on right away and notifies the change', () => {
    const ouvinte = vi.fn();
    window.addEventListener(EVENTO_SOM, ouvinte);
    renderPerfil();

    expect(screen.getByRole('button', { name: '🔊 Ligado' }).getAttribute('aria-pressed')).toBe('true');

    fireEvent.click(screen.getByRole('button', { name: '🔇 Desligado' }));

    expect(window.localStorage.getItem(configData.SOUND_MUTED)).toBe('1');
    expect(screen.getByRole('button', { name: '🔇 Desligado' }).getAttribute('aria-pressed')).toBe('true');
    expect(ouvinte).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: '🔇 Desligado' }));
    expect(ouvinte).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: '🔊 Ligado' }));
    expect(window.localStorage.getItem(configData.SOUND_MUTED)).toBe('0');
    window.removeEventListener(EVENTO_SOM, ouvinte);
  });

  it('keeps the sound choice when the profile is cancelled', () => {
    const onFechar = vi.fn();
    renderPerfil('light', vi.fn(), onFechar);

    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Caio' } });
    fireEvent.click(screen.getByRole('button', { name: '🔇 Desligado' }));
    fireEvent.click(screen.getByText('Cancelar'));

    expect(onFechar).toHaveBeenCalled();
    expect(lerNome()).toBe('');
    expect(window.localStorage.getItem(configData.SOUND_MUTED)).toBe('1');
  });

  it('shows the customize robot card with the player robot', () => {
    const onFechar = vi.fn();
    renderPerfil('light', vi.fn(), onFechar);

    const cartao = screen.getByRole('link', { name: 'Personalizar robôCores, acessórios e temas' });
    expect(cartao.getAttribute('href')).toBe('/personalizar');
    expect(cartao.querySelector('svg.perfil-modal__personalizar-robo')).toBeTruthy();

    fireEvent.click(cartao);
    expect(onFechar).toHaveBeenCalled();
  });
});
