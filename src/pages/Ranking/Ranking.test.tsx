import type { Mock } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import configData from '../../Config.json';
import api from '../../services/api';
import Ranking from './Ranking';

vi.mock('../../services/api', () => ({
  __esModule: true,
  default: { get: vi.fn() },
}));

const get = api.get as Mock;

const renderRanking = (url: string) => render(
  <MemoryRouter initialEntries={[url]}>
    <Ranking />
  </MemoryRouter>
);

const item = (nome: string, pontuacao: number, dados: string | null = null) => ({
  nome,
  modo: null,
  pontuacao,
  tempo: 40,
  acertos: null,
  total: null,
  dados,
  created: '2026-11-03T10:00:00',
});

describe('Ranking', () => {
  beforeEach(() => {
    window.localStorage.clear();
    get.mockReset();
  });

  it('opens the game tab from the url and shows its columns', async () => {
    window.localStorage.setItem(configData.NOME_PARAM, 'Bia');
    get.mockResolvedValue({ data: { success: true, object: [item('Ana', 2048, '{"maiorPeca":256}'), item('Bia', 1024)], total: 5 } });

    renderRanking('/ranking?jogo=2048');

    expect(await screen.findByText('🔥Total de partidas: 5🔥')).toBeTruthy();
    expect(get).toHaveBeenCalledWith('ResultadosJogos/ranking?jogo=2048&top=50', expect.anything());
    expect(screen.getByRole('tab', { name: /2048/ }).getAttribute('aria-selected')).toBe('true');
    expect(screen.getByText('Maior peça')).toBeTruthy();
    expect(screen.getByText('256')).toBeTruthy();
    expect(screen.getByText('Bia').closest('tr')?.className).toBe('posicao');
  });

  it('uses the selected mode and filters by name', async () => {
    get.mockResolvedValue({ data: { success: true, object: [item('Ana', 10), item('Bia', 12)], total: 2 } });

    renderRanking('/ranking?jogo=memoria&modo=medio');

    await screen.findByText('🏆Ana');
    expect(get).toHaveBeenCalledWith('ResultadosJogos/ranking?jogo=memoria&modo=medio&top=50', expect.anything());
    expect((screen.getByRole('combobox') as HTMLSelectElement).value).toBe('medio');

    fireEvent.change(screen.getByPlaceholderText('Filtrar por nome...'), { target: { value: 'bi' } });

    expect(screen.queryByText('🏆Ana')).toBeNull();
    expect(screen.getByText('Bia')).toBeTruthy();
  });

  it('shows the race against the robot ranking by operation and robot', async () => {
    get.mockResolvedValue({ data: { success: true, object: [{ ...item('Ana', 0), pontuacao: null, tempo: 25, acertos: 20, total: 22 }], total: 1 } });

    renderRanking('/ranking?jogo=corrida-robo&modo=R-campeao');

    await screen.findByText('🏆Ana');
    expect(get).toHaveBeenCalledWith('ResultadosJogos/ranking?jogo=corrida-robo&modo=R-campeao&top=50', expect.anything());
    expect((screen.getByRole('combobox') as HTMLSelectElement).value).toBe('R-campeao');
    expect(screen.getByText('Aleatório · Robô campeão · 20 casas')).toBeTruthy();
    expect(screen.getByText('25s')).toBeTruthy();
    expect(screen.getByText('20/22')).toBeTruthy();
  });

  it('shows the race against the robot ranking by track size', async () => {
    get.mockResolvedValue({ data: { success: true, object: [], total: 0 } });

    renderRanking('/ranking?jogo=corrida-robo&modo=M-turbo-50');

    await screen.findByText('Ainda não há resultados neste ranking. Jogue e seja o primeiro!');
    expect(get).toHaveBeenCalledWith('ResultadosJogos/ranking?jogo=corrida-robo&modo=M-turbo-50&top=50', expect.anything());
    expect((screen.getByRole('combobox') as HTMLSelectElement).value).toBe('M-turbo-50');
    expect(screen.getByText('Multiplicação · Robô turbo · 50 casas')).toBeTruthy();
  });

  it('shows the sudoku ranking by mode with the time, real time and hints', async () => {
    get.mockResolvedValue({ data: { success: true, object: [{ ...item('Ana', 0, '{"segundos":95,"dicas":2}'), pontuacao: null, tempo: 155 }], total: 1 } });

    renderRanking('/ranking?jogo=sudoku&modo=9x9-medio');

    await screen.findByText('🏆Ana');
    expect(get).toHaveBeenCalledWith('ResultadosJogos/ranking?jogo=sudoku&modo=9x9-medio&top=50', expect.anything());
    expect(screen.getByRole('tab', { name: /Sudoku/ }).getAttribute('aria-selected')).toBe('true');
    expect((screen.getByRole('combobox') as HTMLSelectElement).value).toBe('9x9-medio');
    expect(Array.from((screen.getByRole('combobox') as HTMLSelectElement).options).map((opcao) => opcao.value)).toEqual(['4x4', '6x6', '9x9-facil', '9x9-medio', '9x9-dificil']);
    ['Tempo', 'Tempo real', 'Dicas'].forEach((titulo) => expect(screen.getByText(titulo)).toBeTruthy());
    expect(screen.getByText('155s')).toBeTruthy();
    expect(screen.getByText('95s')).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
  });

  it('shows the clock game ranking by mode and level with the right answers and time', async () => {
    get.mockResolvedValue({ data: { success: true, object: [{ ...item('Ana', 0), pontuacao: null, acertos: 9, total: 10, tempo: 48 }], total: 1 } });

    renderRanking('/ranking?jogo=que-horas-sao&modo=acertar-dificil');

    await screen.findByText('🏆Ana');
    expect(get).toHaveBeenCalledWith('ResultadosJogos/ranking?jogo=que-horas-sao&modo=acertar-dificil&top=50', expect.anything());
    expect(screen.getByRole('tab', { name: /Que horas são\?/ }).getAttribute('aria-selected')).toBe('true');
    expect(Array.from((screen.getByRole('combobox') as HTMLSelectElement).options).map((opcao) => opcao.value)).toEqual(['ler-facil', 'ler-medio', 'ler-dificil', 'acertar-facil', 'acertar-medio', 'acertar-dificil']);
    expect(screen.getByRole('option', { name: 'Acertar os ponteiros · Difícil' })).toBeTruthy();
    expect(screen.getByText('9/10')).toBeTruthy();
    expect(screen.getByText('48s')).toBeTruthy();
  });

  it('shows the empty state', async () => {
    get.mockResolvedValue({ data: { success: true, object: [], total: 0 } });

    renderRanking('/ranking?jogo=teste-qi');

    expect(await screen.findByText('Ainda não há resultados neste ranking. Jogue e seja o primeiro!')).toBeTruthy();
  });

  it('shows a friendly error and retries when the api fails', async () => {
    get.mockRejectedValueOnce(new Error('Network Error'))
      .mockResolvedValue({ data: { success: true, object: [item('Ana', 30)], total: 1 } });

    renderRanking('/ranking?jogo=maior-ou-menor');

    expect(await screen.findByText('😕 Não foi possível carregar o ranking agora. Tente novamente em instantes.')).toBeTruthy();
    fireEvent.click(screen.getByText('Tentar novamente'));

    expect(await screen.findByText('🏆Ana')).toBeTruthy();
    expect(get).toHaveBeenLastCalledWith('ResultadosJogos/ranking?jogo=maior-ou-menor&modo=tabuada-facil&top=50', expect.anything());
  });

  it('asks to connect to the internet when there is no connection', async () => {
    get.mockRejectedValue(new Error('Network Error'));
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);

    const { unmount } = renderRanking('/ranking?jogo=maior-ou-menor');
    expect(await screen.findByText('📡 Você está sem internet. Conecte-se para ver o ranking.')).toBeTruthy();
    unmount();

    renderRanking('/ranking');
    expect(await screen.findByText('📡 Você está sem internet. Conecte-se para ver o ranking.')).toBeTruthy();
    vi.restoreAllMocks();
  });

  it('keeps the multiplication table ranking as the default tab without leaving the page on error', async () => {
    get.mockRejectedValue(new Error('Network Error'));

    renderRanking('/ranking');

    expect(await screen.findByText('😕 Não foi possível carregar o ranking agora. Tente novamente em instantes.')).toBeTruthy();
    expect(get).toHaveBeenCalledWith('ResultadosTabuadaDivertida/ranking?top=50', expect.anything());
    expect(screen.getByRole('tab', { name: /Tabuada/ }).getAttribute('aria-selected')).toBe('true');
  });

  it('retries the multiplication table ranking after an error', async () => {
    get.mockRejectedValueOnce(new Error('Network Error'))
      .mockResolvedValue({ data: { success: true, object: [{ nome: 'Ana', tempo: 30, quantidade: 20, tipo: 'M', pontuacao: 200 }], total: 3 } });

    renderRanking('/ranking');

    fireEvent.click(await screen.findByText('Tentar novamente'));

    expect(await screen.findByText('🔥Total de jogadores: 3🔥')).toBeTruthy();
    expect(screen.getByText('20 Questões')).toBeTruthy();
    expect(get).toHaveBeenCalledTimes(2);
  });
});
