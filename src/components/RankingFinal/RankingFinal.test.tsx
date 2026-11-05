import type { Mock } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import configData from '../../Config.json';
import { buscarRanking, enviarResultado, informarNome } from '../../services/resultadosJogos';
import RankingFinal from './RankingFinal';

vi.mock('../../services/resultadosJogos', async () => ({
  ...(await vi.importActual('../../services/resultadosJogos')),
  enviarResultado: vi.fn(),
  informarNome: vi.fn(),
  buscarRanking: vi.fn(),
}));

const enviar = enviarResultado as Mock;
const informar = informarNome as Mock;
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
    informar.mockReset();
    buscar.mockReset();
  });

  it('sends the result with the saved name and shows the player position', async () => {
    window.localStorage.setItem(configData.NOME_PARAM, 'Ana');
    enviar.mockResolvedValue(10);
    buscar.mockResolvedValue({ lista: [{ nome: 'Bia' }, { nome: 'Ana' }], total: 2 });

    renderRanking();

    expect(await screen.findByText('🏆 Você está em 2º lugar no ranking!')).toBeTruthy();
    expect(enviar).toHaveBeenCalledTimes(1);
    expect(enviar).toHaveBeenCalledWith('memoria', 'facil', { pontuacao: 8, tempo: 30 }, 'Ana');
    expect(screen.getByText('🏆 Ver ranking').getAttribute('href')).toBe('/ranking?jogo=memoria&modo=facil');
    expect(informar).not.toHaveBeenCalled();
  });

  it('shows a friendly message when sending fails', async () => {
    window.localStorage.setItem(configData.NOME_PARAM, 'Ana');
    enviar.mockResolvedValue(null);

    renderRanking();

    expect(await screen.findByText('Não foi possível enviar seu resultado ao ranking agora.')).toBeTruthy();
    expect(buscar).not.toHaveBeenCalled();
    expect(screen.getByText('🏆 Ver ranking')).toBeTruthy();
  });

  it('explains that the result was not sent when there is no internet', async () => {
    window.localStorage.setItem(configData.NOME_PARAM, 'Ana');
    enviar.mockResolvedValue(null);
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);

    renderRanking();

    expect(await screen.findByText('📡 Você está sem internet, então seu resultado não foi para o ranking.')).toBeTruthy();
    vi.restoreAllMocks();
  });

  it('sends the result without a name and informs the name typed later without sending it again', async () => {
    enviar.mockResolvedValue(10);
    informar.mockResolvedValue(true);
    buscar.mockResolvedValue({ lista: [], total: 0 });

    renderRanking();
    expect(enviar).toHaveBeenCalledWith('memoria', 'facil', { pontuacao: 8, tempo: 30 }, '');

    fireEvent.change(screen.getByLabelText('Quer entrar no ranking? Digite seu nome:'), { target: { value: ' Caio ' } });
    fireEvent.click(screen.getByText('Entrar no ranking'));

    expect(await screen.findByText('Resultado enviado! Continue jogando para entrar no top 50.')).toBeTruthy();
    expect(informar).toHaveBeenCalledWith(10, 'Caio');
    expect(enviar).toHaveBeenCalledTimes(1);
    expect(window.localStorage.getItem(configData.NOME_PARAM)).toBe('Caio');
  });

  it('sends the result again with the name when the first sending failed', async () => {
    enviar.mockResolvedValueOnce(null).mockResolvedValueOnce(11);
    buscar.mockResolvedValue({ lista: [{ nome: 'Caio' }], total: 1 });

    renderRanking();

    fireEvent.change(screen.getByLabelText('Quer entrar no ranking? Digite seu nome:'), { target: { value: 'Caio' } });
    fireEvent.click(screen.getByText('Entrar no ranking'));

    expect(await screen.findByText('🏆 Você está em 1º lugar no ranking!')).toBeTruthy();
    expect(enviar).toHaveBeenCalledTimes(2);
    expect(enviar).toHaveBeenLastCalledWith('memoria', 'facil', { pontuacao: 8, tempo: 30 }, 'Caio');
    expect(informar).not.toHaveBeenCalled();
  });

  it('shows a friendly message when the name can not be informed', async () => {
    enviar.mockResolvedValue(10);
    informar.mockResolvedValue(false);

    renderRanking();

    fireEvent.change(screen.getByLabelText('Quer entrar no ranking? Digite seu nome:'), { target: { value: 'Caio' } });
    fireEvent.click(screen.getByText('Entrar no ranking'));

    expect(await screen.findByText('Não foi possível enviar seu resultado ao ranking agora.')).toBeTruthy();
    expect(buscar).not.toHaveBeenCalled();
  });

  it('lets the player skip the ranking and still sends the result without a name', () => {
    enviar.mockResolvedValue(10);

    renderRanking();

    fireEvent.click(screen.getByText('Não participar'));

    expect(screen.getByText('Tudo bem! Este resultado não vai aparecer no ranking.')).toBeTruthy();
    expect(enviar).toHaveBeenCalledTimes(1);
    expect(enviar).toHaveBeenCalledWith('memoria', 'facil', { pontuacao: 8, tempo: 30 }, '');
    expect(informar).not.toHaveBeenCalled();
  });
});
