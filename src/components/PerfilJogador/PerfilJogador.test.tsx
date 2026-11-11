import type { Mock } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import configData from '../../Config.json';
import { medalhas } from '../../gamificacao/medalhas';
import { criarProgresso, STORAGE_KEY } from '../../gamificacao/progresso';
import { lerNome } from '../../services/jogador';
import { ativarLembrete, desativarLembrete, STORAGE_LEMBRETE } from '../../services/lembretes';
import { EVENTO_SOM } from '../../services/sons';
import { TemaContext } from '../ThemeSwitcher/temaContext';
import PerfilJogador from './PerfilJogador';

vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: vi.fn(() => false) } }));
vi.mock('../../services/lembretes', async (original) => ({
  ...(await original<object>()),
  ativarLembrete: vi.fn(),
  desativarLembrete: vi.fn(),
}));

const nativo = Capacitor.isNativePlatform as Mock;
const ativar = ativarLembrete as Mock;
const desativar = desativarLembrete as Mock;

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

  it('shows the achievements shortcut below the customize robot card', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...criarProgresso(), medalhas: { [medalhas[0].id]: { nivel: 1, data: new Date().toISOString() } } }));
    const onFechar = vi.fn();
    renderPerfil('light', vi.fn(), onFechar);

    const atalho = screen.getByRole('link', { name: `Minhas conquistas1 de ${medalhas.length} medalhas` });
    expect(atalho.getAttribute('href')).toBe('/progresso?aba=conquistas');
    expect(atalho.previousElementSibling?.getAttribute('href')).toBe('/personalizar');

    fireEvent.click(atalho);
    expect(onFechar).toHaveBeenCalled();
  });

  it('opens without focusing the name and still closes with Escape', () => {
    const onFechar = vi.fn();
    renderPerfil('light', vi.fn(), onFechar);

    expect(document.activeElement).toBe(document.body);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onFechar).toHaveBeenCalled();
  });

  describe('daily reminder', () => {
    beforeEach(() => {
      nativo.mockReturnValue(true);
      ativar.mockResolvedValue(true);
    });

    afterEach(() => {
      nativo.mockReturnValue(false);
      vi.clearAllMocks();
    });

    it('is shown only in the app', () => {
      nativo.mockReturnValue(false);
      renderPerfil();

      expect(screen.queryByRole('region', { name: 'Lembrete diário' })).toBeNull();
    });

    it('turns on with the chosen time when saved', () => {
      const onFechar = vi.fn();
      renderPerfil('light', vi.fn(), onFechar);

      expect(screen.getByRole('button', { name: '🔕 Desligado' }).getAttribute('aria-pressed')).toBe('true');
      expect(screen.queryByLabelText('Horário')).toBeNull();

      fireEvent.click(screen.getByRole('button', { name: '🔔 Ligado' }));
      fireEvent.change(screen.getByLabelText('Horário'), { target: { value: '19:30' } });
      expect(ativar).not.toHaveBeenCalled();

      fireEvent.click(screen.getByText('Salvar'));

      expect(ativar).toHaveBeenCalledWith('19:30');
      expect(onFechar).toHaveBeenCalled();
    });

    it('turns off when saved', () => {
      window.localStorage.setItem(STORAGE_LEMBRETE, JSON.stringify({ ativo: true, hora: '07:00', perguntado: true }));
      renderPerfil();

      expect((screen.getByLabelText('Horário') as HTMLInputElement).value).toBe('07:00');
      fireEvent.click(screen.getByRole('button', { name: '🔕 Desligado' }));
      fireEvent.click(screen.getByText('Salvar'));

      expect(desativar).toHaveBeenCalledWith('07:00');
      expect(ativar).not.toHaveBeenCalled();
    });

    it('changes nothing when saved without changes', () => {
      window.localStorage.setItem(STORAGE_LEMBRETE, JSON.stringify({ ativo: true, hora: '07:00', perguntado: true }));
      renderPerfil();

      fireEvent.click(screen.getByText('Salvar'));

      expect(ativar).not.toHaveBeenCalled();
      expect(desativar).not.toHaveBeenCalled();
    });
  });
});
