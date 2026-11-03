import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { GRUPOS, medalhas } from '../../gamificacao/medalhas';
import { criarProgresso, STORAGE_KEY } from '../../gamificacao/progresso';
import Conquistas from './Conquistas';

const renderConquistas = () => render(
  <MemoryRouter>
    <Conquistas />
  </MemoryRouter>
);

const salvarProgresso = (dados: object) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...criarProgresso(), ...dados }));
};

describe('Conquistas', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    delete (navigator as any).share;
  });

  it('shows every medal still to conquer with hidden secrets', () => {
    renderConquistas();

    expect(screen.getByText(`Você conquistou 0 de ${medalhas.length} medalhas. Continue jogando para liberar todas!`)).toBeTruthy();
    expect(screen.getAllByText('???')).toHaveLength(medalhas.filter((medalha) => medalha.secreta).length);
    expect(screen.queryByText('Coruja noturna')).toBeNull();
    expect(screen.queryByText('Compartilhar')).toBeNull();
  });

  it('shows the progress to the next level', () => {
    salvarProgresso({
      melhorSequencia: 32,
      medalhas: { 'acertos-seguidos': { nivel: 2, data: '2026-11-02T15:00:00.000Z' } },
    });

    const { container } = renderConquistas();

    expect(screen.getByText('32/50 acertos seguidos')).toBeTruthy();
    expect(container.querySelector('.conquistas-card__nivel')?.textContent).toBe('Prata');
    expect(screen.getByRole('progressbar', { name: 'Progresso de Sequência de fogo' }).getAttribute('aria-valuenow')).toBe('64');
  });

  it('shows a conquered secret medal with its date and shares it', () => {
    const share = jest.fn().mockResolvedValue(undefined);
    (navigator as any).share = share;
    salvarProgresso({
      partidasNoturnas: 1,
      medalhas: { 'coruja-noturna': { nivel: 1, data: '2026-11-02T15:00:00.000Z' } },
    });

    renderConquistas();
    fireEvent.click(screen.getByText('Compartilhar'));

    expect(screen.getByText('Coruja noturna')).toBeTruthy();
    expect(screen.getByText('Conquistada em 02/11/2026')).toBeTruthy();
    expect(share.mock.calls[0][0].text).toContain('Conquistei a medalha 🦉 Coruja noturna na Tabuada Divertida!');
  });

  it('shows the diamond level only for medals with four levels', () => {
    salvarProgresso({
      melhorSequencia: 100,
      medalhas: { 'acertos-seguidos': { nivel: 4, data: '2026-11-02T15:00:00.000Z' } },
    });

    const { container } = renderConquistas();

    expect(container.querySelector('.conquistas-card--diamante h3')?.textContent).toBe('Sequência de fogo');
    expect(container.querySelector('.conquistas-card__etapa--diamante')?.textContent).toBe('Diamante');
    expect(screen.getAllByText('Diamante')).toHaveLength(medalhas.filter((medalha) => medalha.metas.length === 4).length + 1);
    expect(screen.getByText('Mestre da soma')).toBeTruthy();
    expect(screen.getByText('Memória de elefante')).toBeTruthy();
  });

  it('groups the medals by mode', () => {
    const { container } = renderConquistas();
    const grupos = Array.from(container.querySelectorAll('.conquistas-grupo'));

    expect(grupos.map((grupo) => grupo.querySelector('h2')?.textContent)).toEqual(GRUPOS);
    expect(grupos.reduce((total, grupo) => total + grupo.querySelectorAll('.conquistas-card').length, 0)).toBe(medalhas.length);
    expect(Array.from(grupos[1].querySelectorAll('h3')).map((titulo) => titulo.textContent)).toEqual(expect.arrayContaining(['Mestre da divisão por 7', 'Divisão completa', 'Rei da divisão', 'Divisor']));
    expect(Array.from(grupos[4].querySelectorAll('h3')).map((titulo) => titulo.textContent)).toEqual(expect.arrayContaining(['Coringa', 'Sortudo', 'Pau pra toda obra']));
  });
});
