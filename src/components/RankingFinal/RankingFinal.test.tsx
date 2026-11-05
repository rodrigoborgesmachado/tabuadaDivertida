import type { Mock } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import configData from '../../Config.json';
import { buscarRanking, enviarResultado } from '../../services/resultadosJogos';
import RankingFinal from './RankingFinal';

vi.mock('../../services/resultadosJogos', async () => ({
  ...(await vi.importActual('../../services/resultadosJogos')),
  enviarResultado: vi.fn(),
  buscarRanking: vi.fn(),
}));

const enviar = enviarResultado as Mock;
const buscar = buscarRanking as Mock;

const renderRanking = () => render(
  <MemoryRouter>
    <RankingFinal jogo='memoria' modo='facil' resultado={{ pontuacao: 8, tempo: 30 }} />
  </MemoryRouter>
);

describe('RankingFinal', () => {
  beforeEach(() => {
    window.localStorage.clear();
    enviar.mockReset();
    buscar.mockReset();
  });

  it('sends the result with the saved name and shows the player position', async () => {
    window.localStorage.setItem(configData.NOME_PARAM, 'Ana');
    enviar.mockResolvedValue(true);
    buscar.mockResolvedValue({ lista: [{ nome: 'Bia' }, { nome: 'Ana' }], total: 2 });

    renderRanking();

    expect(await screen.findByText('🏆 Você está em 2º lugar no ranking!')).toBeTruthy();
    expect(enviar).toHaveBeenCalledTimes(1);
    expect(enviar).toHaveBeenCalledWith('memoria', 'facil', { pontuacao: 8, tempo: 30 }, 'Ana');
    expect(screen.getByText('🏆 Ver ranking').getAttribute('href')).toBe('/ranking?jogo=memoria&modo=facil');
  });

  it('shows a friendly message when sending fails', async () => {
    window.localStorage.setItem(configData.NOME_PARAM, 'Ana');
    enviar.mockResolvedValue(false);

    renderRanking();

    expect(await screen.findByText('Não foi possível enviar seu resultado ao ranking agora.')).toBeTruthy();
    expect(buscar).not.toHaveBeenCalled();
    expect(screen.getByText('🏆 Ver ranking')).toBeTruthy();
  });

  it('asks the name before sending and saves it', async () => {
    enviar.mockResolvedValue(true);
    buscar.mockResolvedValue({ lista: [], total: 0 });

    renderRanking();
    expect(enviar).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText('Quer entrar no ranking? Digite seu nome:'), { target: { value: ' Caio ' } });
    fireEvent.click(screen.getByText('Entrar no ranking'));

    expect(await screen.findByText('Resultado enviado! Continue jogando para entrar no top 50.')).toBeTruthy();
    expect(enviar).toHaveBeenCalledWith('memoria', 'facil', { pontuacao: 8, tempo: 30 }, 'Caio');
    expect(window.localStorage.getItem(configData.NOME_PARAM)).toBe('Caio');
  });

  it('lets the player skip the ranking', () => {
    renderRanking();

    fireEvent.click(screen.getByText('Não participar'));

    expect(screen.getByText('Tudo bem! Este resultado não vai para o ranking.')).toBeTruthy();
    expect(enviar).not.toHaveBeenCalled();
  });
});
