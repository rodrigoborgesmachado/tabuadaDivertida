import type { Mock } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { criarProgresso, STORAGE_KEY } from '../../gamificacao/progresso';
import { marcarRecompensasVistas, recompensasNaoVistas, STORAGE_PERSONALIZACAO, STORAGE_RECOMPENSAS_VISTAS } from '../../gamificacao/recompensas';
import { xpTotalDoNivel } from '../../gamificacao/xp';
import { IconeApp } from '../../services/iconeApp';
import { ehAndroid } from '../../services/plataforma';
import { playSuccess } from '../../services/sons';
import Personalizar from './Personalizar';

vi.mock('../../services/sons', async (original) => ({
  ...(await original<typeof import('../../services/sons')>()),
  playSuccess: vi.fn(),
}));

vi.mock('../../services/plataforma', async (original) => ({
  ...(await original<typeof import('../../services/plataforma')>()),
  ehAndroid: vi.fn(),
}));

vi.mock('../../services/iconeApp', async (original) => ({
  ...(await original<typeof import('../../services/iconeApp')>()),
  IconeApp: { iconeAtual: vi.fn(), trocarIcone: vi.fn(), atalho: vi.fn(), criarAtalho: vi.fn() },
}));

const android = ehAndroid as Mock;
const iconeAtual = IconeApp.iconeAtual as Mock;
const atalho = IconeApp.atalho as Mock;

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
    vi.restoreAllMocks();
    android.mockReturnValue(false);
    iconeAtual.mockResolvedValue({ icone: 'cor-prata', suportado: true });
    atalho.mockResolvedValue({ suportado: true, criado: false });
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

  it('animates the robot painted with an animated color', () => {
    salvarProgresso({ xp: xpTotalDoNivel(55) });
    const { container } = renderPersonalizar();

    expect(item('Cometa').querySelector('.personalizar-item__icone--animada')).toBeTruthy();
    expect(item('Ouro puro').querySelector('.personalizar-item__icone--animada')).toBeNull();
    fireEvent.click(item('Cometa'));

    expect(container.querySelectorAll('.personalizar-robo .robo-pintura-animada')).toHaveLength(2);
  });

  it('chooses a pet for the robot and takes it off', () => {
    salvarProgresso({ xp: xpTotalDoNivel(38) });
    const { container } = renderPersonalizar();
    abrirAba('🐾 Bichinhos');

    expect(screen.getByText('Um companheiro que fica ao lado do seu robô.')).toBeTruthy();
    expect(item('Nenhum').getAttribute('aria-pressed')).toBe('true');
    expect(item('Cachorrinho').disabled).toBe(true);
    fireEvent.click(item('Gatinho'));

    expect(container.querySelector('.personalizar-robo [data-bichinho="bichinho-gato"]')).toBeTruthy();
    expect(container.querySelector('.personalizar-robo--bichinho')).toBeTruthy();

    fireEvent.click(item('Gatinho'));

    expect(container.querySelector('.personalizar-robo [data-bichinho]')).toBeNull();
    expect(JSON.parse(window.localStorage.getItem(STORAGE_PERSONALIZACAO) || '{}').bichinho).toBe('');
  });

  it('plays the chosen sound set and keeps the default one selected', () => {
    salvarProgresso({ xp: xpTotalDoNivel(36) });
    renderPersonalizar();
    abrirAba('🔊 Sons');

    expect(screen.queryByText('Nenhum')).toBeNull();
    expect(item('Clássico').getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(item('8 bits'));

    expect(playSuccess).toHaveBeenCalledTimes(1);
    expect(item('8 bits').getAttribute('aria-pressed')).toBe('true');

    fireEvent.click(item('8 bits'));

    expect(item('8 bits').getAttribute('aria-pressed')).toBe('true');
  });

  it('previews the chosen dance on the robot and lists the trails of the race', () => {
    salvarProgresso({ xp: xpTotalDoNivel(45) });
    const { container } = renderPersonalizar();
    abrirAba('💃 Danças');

    expect(container.querySelector('.personalizar-robo')?.getAttribute('class')).toContain('robo-danca-pulinho');
    fireEvent.click(item('Giro'));
    expect(container.querySelector('.personalizar-robo')?.getAttribute('class')).toContain('robo-danca-giro');

    abrirAba('💨 Rastros');
    expect(screen.getByText('O rastro que o seu robô deixa na Corrida contra o Robô.')).toBeTruthy();
    expect(item('Bolhas').disabled).toBe(false);
    expect(item('Fogo').disabled).toBe(true);
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
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
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
    expect(screen.getByRole('heading', { name: 'Comum✨ Novo' })).toBeTruthy();
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
    expect(screen.getByRole('heading', { name: '🎩 Cabeça✨ Novo' })).toBeTruthy();
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

  it('does not show the app icon tab on the site', async () => {
    renderPersonalizar();
    await act(async () => {});

    expect(screen.queryByRole('tab', { name: '📱 Ícone do app' })).toBeNull();
    expect(screen.queryByText('📌 Colocar meu robô na tela inicial')).toBeNull();
  });

  it('shows the app icon only in its own tab on Android', async () => {
    android.mockReturnValue(true);
    renderPersonalizar();
    await act(async () => {});

    expect(screen.queryByText('Robô Prata')).toBeNull();
    abrirAba('🎩 Acessórios');
    expect(screen.queryByText('📌 Colocar meu robô na tela inicial')).toBeNull();

    abrirAba('📱 Ícone do app');

    expect(screen.getByRole('tab', { name: '📱 Ícone do app' }).getAttribute('aria-selected')).toBe('true');
    expect(item('Robô Prata').getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByText('📌 Colocar meu robô na tela inicial')).toBeTruthy();
    expect(screen.queryByText('Boné')).toBeNull();
  });

  it('shows only the shortcut in the app icon tab when the icon cannot be changed', async () => {
    android.mockReturnValue(true);
    iconeAtual.mockResolvedValue({ icone: 'cor-prata', suportado: false });
    renderPersonalizar();
    await act(async () => {});

    abrirAba('📱 Ícone do app');

    expect(screen.queryByText('Robô Prata')).toBeNull();
    expect(screen.getByText('📌 Colocar meu robô na tela inicial')).toBeTruthy();
  });
});
