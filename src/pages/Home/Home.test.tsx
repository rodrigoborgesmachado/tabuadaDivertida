import { fireEvent, render, screen } from '@testing-library/react';
import { criarProgresso, STORAGE_KEY } from '../../gamificacao/progresso';
import { jogos } from '../Jogos/jogosConfig';
import Home from './Home';
import { STORAGE_FILTRO } from './logic';

const salvarProgresso = (dados: object) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...criarProgresso(), ...dados }));
};

describe('Home', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 10, 3, 10, 0));
    window.localStorage.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('invites who never played to start with the tabuada and shows every game', () => {
    render(<Home />);

    expect(screen.getByText('🎮 Começar pela Tabuada').closest('a')?.getAttribute('href')).toBe('/formulario');
    expect(screen.queryByText(/Continuar:/)).toBeNull();
    expect(screen.queryByText('⭐ Seu favorito')).toBeNull();
    jogos.forEach((jogo) => expect(screen.getByText(jogo.nome)).toBeTruthy());
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('continues the last game and marks the favorite one', () => {
    window.localStorage.setItem('nome', 'Ana');
    salvarProgresso({ jogosJogados: ['tabuada', 'memoria'], ultimoJogo: 'memoria', partidasPorJogo: { tabuada: 5, memoria: 2 } });

    render(<Home />);

    expect(screen.getByText('Olá, Ana! 👋')).toBeTruthy();
    expect(screen.getByText('▶️ Continuar: Memória da tabuada').closest('a')?.getAttribute('href')).toBe('/jogos/memoria-da-tabuada');
    expect(screen.getByText('⭐ Seu favorito').closest('a')?.getAttribute('href')).toBe('/formulario');
  });

  it('filters the games and remembers the filter', () => {
    render(<Home />);
    fireEvent.click(screen.getByRole('button', { name: '🧩 Lógica' }));

    expect(screen.getByText('2048')).toBeTruthy();
    expect(screen.queryByText('Memória da tabuada')).toBeNull();
    expect(window.localStorage.getItem(STORAGE_FILTRO)).toBe('logica');
  });

  it('shows compact shortcuts instead of the big menu buttons', () => {
    render(<Home />);

    expect(screen.getByRole('navigation', { name: 'Atalhos' })).toBeTruthy();
    expect(screen.getByText('🏅 Conquistas').getAttribute('href')).toBe('/conquistas');
    expect(screen.queryByText('🤔 Como Jogar?')).toBeNull();
  });
});
