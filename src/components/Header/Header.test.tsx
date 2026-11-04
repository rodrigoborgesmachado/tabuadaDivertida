import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { criarProgresso, STORAGE_KEY } from '../../gamificacao/progresso';
import { marcarRecompensasVistas, STORAGE_RECOMPENSAS_VISTAS } from '../../gamificacao/recompensas';
import { lerNome, lerQuantidade, STORAGE_PERFIL_VISTO } from '../../services/jogador';
import configData from '../../Config.json';
import Header from './index';

const renderHeader = () => render(
  <MemoryRouter>
    <Header />
  </MemoryRouter>
);

describe('Header', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem(STORAGE_PERFIL_VISTO, '1');
  });

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
    fireEvent.click(screen.getByText('Meu progresso'));

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

  it('shows the new robot items in the menu until they are seen', () => {
    window.localStorage.setItem(STORAGE_RECOMPENSAS_VISTAS, JSON.stringify(['cor-prata', 'sem-acessorio', 'tema-padrao']));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...criarProgresso(), xp: 250 }));
    renderHeader();

    const botao = screen.getByRole('button', { name: 'Meu perfil e configurações: Jogador, 2 itens novos' });
    expect(botao.querySelector('.nav-item__novo')?.textContent).toBe('2');
    expect(screen.getByRole('button', { name: 'Abrir menu' }).querySelector('.nav-item__novo')?.textContent).toBe('2');

    fireEvent.click(botao);
    expect(screen.getByRole('link', { name: 'Personalizar robô Cores, acessórios e temas 2 novos' }).getAttribute('href')).toBe('/personalizar');

    act(() => {
      marcarRecompensasVistas();
    });

    expect(screen.getByRole('button', { name: 'Meu perfil e configurações: Jogador' }).querySelector('.nav-item__novo')).toBeNull();
    expect(screen.getByRole('link', { name: 'Personalizar robô Cores, acessórios e temas' })).toBeTruthy();
  });

  it('shows the player name and saves the profile', () => {
    window.localStorage.setItem(configData.NOME_PARAM, 'Ana');
    renderHeader();

    fireEvent.click(screen.getByRole('button', { name: 'Meu perfil e configurações: Ana' }));

    const dialog = screen.getByRole('dialog', { name: 'Meu perfil' });
    expect((screen.getByLabelText('Nome') as HTMLInputElement).value).toBe('Ana');
    expect(screen.getByRole('button', { name: '20' }).getAttribute('aria-pressed')).toBe('true');
    expect(document.activeElement).toBe(screen.getByLabelText('Nome'));

    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: '  Bia  ' } });
    fireEvent.click(screen.getByRole('button', { name: '50' }));
    fireEvent.click(screen.getByText('Salvar'));

    expect(dialog.isConnected).toBe(false);
    expect(lerNome()).toBe('Bia');
    expect(lerQuantidade()).toBe(50);
    expect(screen.getByRole('button', { name: 'Meu perfil e configurações: Bia' })).toBeTruthy();
  });

  it('closes the profile without saving', () => {
    renderHeader();

    fireEvent.click(screen.getByRole('button', { name: 'Meu perfil e configurações: Jogador' }));
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Caio' } });
    fireEvent.click(screen.getByText('Cancelar'));

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(lerNome()).toBe('');

    fireEvent.click(screen.getByRole('button', { name: 'Meu perfil e configurações: Jogador' }));
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('opens the profile from the mobile menu and closes the menu', () => {
    renderHeader();

    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }));
    fireEvent.click(screen.getByRole('button', { name: 'Meu perfil e configurações: Jogador' }));

    expect(screen.getByRole('button', { name: 'Abrir menu' }).getAttribute('aria-expanded')).toBe('false');
    expect(screen.getByRole('dialog', { name: 'Meu perfil' })).toBeTruthy();
  });

  it('suggests the profile only on the first visit', () => {
    window.localStorage.removeItem(STORAGE_PERFIL_VISTO);
    const { unmount } = renderHeader();

    expect(screen.getByRole('dialog', { name: 'Meu perfil' })).toBeTruthy();
    fireEvent.click(screen.getByText('Agora não'));
    expect(screen.queryByRole('dialog')).toBeNull();

    unmount();
    renderHeader();

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('shows only the four main items and keeps theme and sound out of the header', () => {
    const { container } = renderHeader();

    expect(Array.from(container.querySelectorAll('.nav-item')).map((item) => item.textContent)).toEqual(['Ranking', 'Meu progresso', 'Tabuada', 'Artigos']);
    expect(screen.getByRole('link', { name: 'Meu progresso' }).getAttribute('href')).toBe('/progresso');
    expect(container.querySelector('.change-theme-div')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Silenciar som' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Meu perfil e configurações: Jogador' }).getAttribute('title')).toBe('Meu perfil e configurações');
    expect(container.querySelector('.personalizar-toggle__engrenagem')).toBeTruthy();
  });

  it('marks my progress as active on the progress page', () => {
    render(
      <MemoryRouter initialEntries={['/progresso?aba=conquistas']}>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: 'Meu progresso' }).classList.contains('active')).toBe(true);
    expect(screen.getByRole('link', { name: 'Ranking' }).classList.contains('active')).toBe(false);
  });

  it('does not suggest the profile to who already has a name', () => {
    window.localStorage.removeItem(STORAGE_PERFIL_VISTO);
    window.localStorage.setItem(configData.NOME_PARAM, 'Ana');
    renderHeader();

    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
