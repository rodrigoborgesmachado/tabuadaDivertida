import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
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

  it('scrolls to the games grid when opened from the back to games buttons', () => {
    const scrollIntoView = jest.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    window.history.pushState({}, '', '/#jogos');

    render(<Home />);

    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollIntoView.mock.instances[0]).toBe(document.getElementById('jogos'));
    window.history.pushState({}, '', '/');
    delete (Element.prototype as any).scrollIntoView;
  });

  it('invites who never played to start with the tabuada and shows every game', () => {
    render(<Home />);

    expect(screen.getByText('🎮 Começar pela Tabuada').closest('a')?.getAttribute('href')).toBe('/selecionarjogo');
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
    expect(screen.getByText('⭐ Seu favorito').closest('a')?.getAttribute('href')).toBe('/selecionarjogo');
  });

  it('opens the profile to edit the name from the greeting', () => {
    window.localStorage.setItem('nome', 'Ana');
    render(<MemoryRouter><Home /></MemoryRouter>);

    fireEvent.click(screen.getByText('Olá, Ana! 👋'));
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Bia' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(screen.getByText('Olá, Bia! 👋')).toBeTruthy();
    expect(screen.queryByRole('dialog')).toBeNull();
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
    expect(screen.getByText('🏅 Conquistas').getAttribute('href')).toBe('/progresso?aba=conquistas');
    expect(screen.queryByText('🤔 Como Jogar?')).toBeNull();
  });
});
