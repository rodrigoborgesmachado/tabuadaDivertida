import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { criarProgresso, STORAGE_KEY } from '../../gamificacao/progresso';
import { marcarRecompensasVistas, recompensasNaoVistas, STORAGE_PERSONALIZACAO, STORAGE_RECOMPENSAS_VISTAS } from '../../gamificacao/recompensas';
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

const abrirAba = (nome: string) => fireEvent.click(screen.getByRole('tab', { name: nome }));

describe('Personalizar', () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.restoreAllMocks();
  });

  it('shows the locked items with the condition to unlock them', () => {
    renderPersonalizar();

    expect(screen.getByText('Nível 1 · Aprendiz')).toBeTruthy();
    expect(screen.getByText('Faltam 200 XP para o 🔵 Azul céu')).toBeTruthy();
    expect(item('Prata').getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('heading', { name: 'Lendária' })).toBeTruthy();
    expect(item('Diamante').className).toContain('personalizar-item--lendaria');

    abrirAba('🎩 Acessórios');

    expect(item('Óculos').disabled).toBe(true);
    expect(screen.getByText('Nível 5 · você está no 1')).toBeTruthy();
    expect(screen.getByText('Conquiste a medalha 🏆 Tabuada completa')).toBeTruthy();
  });

  it('saves the chosen item and shows it on the robot', () => {
    salvarProgresso({ xp: 430 });
    const { container } = renderPersonalizar();
    abrirAba('🎩 Acessórios');

    expect(item('Boné').disabled).toBe(false);
    fireEvent.click(item('Boné'));

    expect(item('Boné').getAttribute('aria-pressed')).toBe('true');
    expect(container.querySelector('.personalizar-robo')?.getAttribute('data-acessorios')).toBe('bone');
    expect(JSON.parse(window.localStorage.getItem(STORAGE_PERSONALIZACAO) || '{}').cabeca).toBe('bone');
  });

  it('combines one accessory for each space on the robot', () => {
    salvarProgresso({ xp: 2880 });
    const { container } = renderPersonalizar();
    abrirAba('🎩 Acessórios');

    ['Boné', 'Óculos', 'Lenço', 'Capa de herói', 'Lápis gigante'].forEach((nome) => fireEvent.click(item(nome)));

    expect(container.querySelector('.personalizar-robo')?.getAttribute('data-acessorios')).toBe('bone oculos lenco capa lapis');

    fireEvent.click(item('Óculos'));

    expect(container.querySelector('.personalizar-robo')?.getAttribute('data-acessorios')).toBe('bone lenco capa lapis');
  });

  it('picks a random combination among the unlocked items', () => {
    salvarProgresso({ xp: 430 });
    jest.spyOn(Math, 'random').mockReturnValue(0.99);
    const { container } = renderPersonalizar();

    fireEvent.click(screen.getByRole('button', { name: '🎲 Aleatório' }));

    expect(item('Vermelho tomate').getAttribute('aria-pressed')).toBe('true');
    expect(container.querySelector('.personalizar-robo')?.getAttribute('data-acessorios')).toBe('bone lapis');
  });

  it('shows a preview of each theme', () => {
    renderPersonalizar();
    abrirAba('🌈 Temas');

    expect(item('Cyberpunk').querySelector('[data-cor="cyberpunk"]')).toBeTruthy();
  });

  it('highlights the new items and marks them as seen', () => {
    window.localStorage.setItem(STORAGE_RECOMPENSAS_VISTAS, JSON.stringify(['cor-prata', 'sem-acessorio', 'tema-padrao']));
    salvarProgresso({ xp: 200 });
    renderPersonalizar();

    expect(item('Azul céu').textContent).toContain('✨ Novo!');
    expect(item('Prata').textContent).toContain('Em uso');
    expect(screen.getByRole('heading', { name: 'Comum ✨ Novo' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Rara' })).toBeTruthy();
    expect(screen.queryByText('🎨 Personalizar robô')).toBeNull();
    expect(JSON.parse(window.localStorage.getItem(STORAGE_RECOMPENSAS_VISTAS) || '[]')).toContain('cor-azul');
  });

  it('opens the first tab with new items and marks them as seen only when the tab is opened', () => {
    recompensasNaoVistas({ ...criarProgresso(), xp: 200 });
    salvarProgresso({ xp: 430, medalhas: { 'partidas-jogadas': { nivel: 1, data: '2026-11-02T15:00:00.000Z' } } });
    marcarRecompensasVistas(undefined, 'cor');
    renderPersonalizar();

    expect(screen.getByRole('tab', { name: '🎩 Acessórios' }).getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('tab', { name: '🎨 Cores' })).toBeTruthy();
    expect(screen.getByRole('tab', { name: '🌈 Temas, 1 item novo' }).textContent).toContain('✨ 1');
    expect(screen.getByRole('heading', { name: '🎩 Cabeça ✨ Novo' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: '✋ Mão' })).toBeTruthy();
    expect(item('Boné').textContent).toContain('✨ Novo!');
    expect(recompensasNaoVistas().map((recompensa) => recompensa.id)).toEqual(['tema-oceano']);

    abrirAba('🌈 Temas, 1 item novo');

    expect(screen.getByRole('tab', { name: '🌈 Temas' }).getAttribute('aria-selected')).toBe('true');
    expect(item('Oceano').textContent).toContain('✨ Novo!');
    expect(recompensasNaoVistas()).toEqual([]);

    abrirAba('🎩 Acessórios');

    expect(item('Boné').textContent).toContain('✨ Novo!');
  });

  it('unlocks the items of a conquered medal', () => {
    salvarProgresso({ medalhas: { 'partidas-jogadas': { nivel: 1, data: '2026-11-02T15:00:00.000Z' } } });
    renderPersonalizar();
    abrirAba('🌈 Temas');

    expect(item('Oceano').disabled).toBe(false);
    expect(item('Floresta').disabled).toBe(true);
  });
});
