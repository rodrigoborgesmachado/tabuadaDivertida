import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Jogos from './Jogos';
import { jogos } from './jogosConfig';

describe('Jogos', () => {
  it('links each game to its ranking tab', () => {
    render(
      <MemoryRouter>
        <Jogos />
      </MemoryRouter>
    );

    jogos.forEach((jogo) => {
      expect(screen.getByText(`🏆 Ranking de ${jogo.nome}`).getAttribute('href')).toBe(`/ranking?jogo=${jogo.id}`);
    });
  });
});
