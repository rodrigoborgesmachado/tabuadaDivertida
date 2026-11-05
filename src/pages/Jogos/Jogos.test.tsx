import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Jogos from './Jogos';
import { jogos } from './jogosConfig';
import { abasRanking } from '../Ranking/rankingConfig';

describe('Jogos', () => {
  it('links each game to its ranking tab', () => {
    render(
      <MemoryRouter>
        <Jogos />
      </MemoryRouter>
    );

    jogos.filter((jogo) => abasRanking.some((aba) => aba.id === jogo.id)).forEach((jogo) => {
      expect(screen.getByText(`🏆 Ranking de ${jogo.nome}`).getAttribute('href')).toBe(`/ranking?jogo=${jogo.id}`);
    });
  });

  it('hides the ranking of a game without one', () => {
    render(
      <MemoryRouter>
        <Jogos />
      </MemoryRouter>
    );

    expect(screen.getByText('Contando bichinhos')).toBeTruthy();
    expect(screen.queryByText('🏆 Ranking de Contando bichinhos')).toBeNull();
  });
});
