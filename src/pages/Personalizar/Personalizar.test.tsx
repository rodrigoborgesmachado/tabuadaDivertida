import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { criarProgresso, STORAGE_KEY } from '../../gamificacao/progresso';
import { STORAGE_PERSONALIZACAO, STORAGE_RECOMPENSAS_VISTAS } from '../../gamificacao/recompensas';
import Personalizar from './Personalizar';

const renderPersonalizar = () => render(
  <MemoryRouter>
    <Personalizar />
  </MemoryRouter>
);

const salvarProgresso = (dados: object) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...criarProgresso(), ...dados }));
};

const item = (nome: string) => screen.getByText(nome).closest('button') as HTMLButtonElement;

describe('Personalizar', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('shows the locked items with the condition to unlock them', () => {
    renderPersonalizar();

    expect(screen.getByText('Nível 1 · Aprendiz')).toBeTruthy();
    expect(item('Prata').getAttribute('aria-pressed')).toBe('true');
    expect(item('Óculos').disabled).toBe(true);
    expect(screen.getByText('Chegue ao nível 5')).toBeTruthy();
    expect(screen.getByText('Conquiste a medalha 🏆 Tabuada completa')).toBeTruthy();
  });

  it('saves the chosen item and shows it on the robot', () => {
    salvarProgresso({ xp: 250 });
    const { container } = renderPersonalizar();

    expect(item('Boné').disabled).toBe(false);
    fireEvent.click(item('Boné'));

    expect(item('Boné').getAttribute('aria-pressed')).toBe('true');
    expect(container.querySelector('.personalizar-robo')?.getAttribute('data-acessorio')).toBe('bone');
    expect(JSON.parse(window.localStorage.getItem(STORAGE_PERSONALIZACAO) || '{}').acessorio).toBe('bone');
  });

  it('highlights the new items and marks them as seen', () => {
    window.localStorage.setItem(STORAGE_RECOMPENSAS_VISTAS, JSON.stringify(['cor-prata', 'sem-acessorio', 'tema-padrao']));
    salvarProgresso({ xp: 100 });
    renderPersonalizar();

    expect(item('Azul céu').textContent).toContain('✨ Novo!');
    expect(item('Prata').textContent).toContain('Em uso');
    expect(screen.queryByText('🎨 Personalizar robô')).toBeNull();
    expect(JSON.parse(window.localStorage.getItem(STORAGE_RECOMPENSAS_VISTAS) || '[]')).toContain('cor-azul');
  });

  it('unlocks the items of a conquered medal', () => {
    salvarProgresso({ medalhas: { 'partidas-jogadas': { nivel: 1, data: '2026-11-02T15:00:00.000Z' } } });
    renderPersonalizar();

    expect(item('Oceano').disabled).toBe(false);
    expect(item('Floresta').disabled).toBe(true);
  });
});
