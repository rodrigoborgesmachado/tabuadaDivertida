import type { Mock } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import configData from '../../Config.json';
import { buscarRanking, enviarResultado } from '../../services/resultadosJogos';
import { lerQuantidade, salvarQuantidade } from '../../services/jogador';
import CorridaRobo from './CorridaRobo';

const STORAGE_RECORDES = 'tabuada-divertida-corrida-robo-recordes';

vi.mock('./logic', async () => {
  const actual = await vi.importActual<typeof import('./logic')>('./logic');
  return {
    ...actual,
    gerarConta: () => ({ texto: '6x7', resposta: 42 }),
  };
});

vi.mock('../../services/resultadosJogos', async () => ({
  ...(await vi.importActual('../../services/resultadosJogos')),
  enviarResultado: vi.fn(),
  buscarRanking: vi.fn(),
}));

const enviar = enviarResultado as Mock;
const buscar = buscarRanking as Mock;

const renderJogo = () => render(
  <MemoryRouter>
    <CorridaRobo />
  </MemoryRouter>
);

const avancar = (ms: number) => {
  for (let tempo = 0; tempo < ms; tempo += 1000) {
    act(() => {
      vi.advanceTimersByTime(1000);
    });
  }
};

const comecar = () => {
  fireEvent.click(screen.getByText('Começar'));
  avancar(3000);
};

const responder = (valor: string) => {
  const input = screen.getByLabelText('Sua resposta');
  fireEvent.change(input, { target: { value: valor } });
  fireEvent.keyDown(input, { key: 'Enter' });
};

describe('CorridaRobo', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.localStorage.clear();
    enviar.mockReset().mockResolvedValue(true);
    buscar.mockReset().mockResolvedValue({ lista: [], total: 0 });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows the robot levels and the countdown before the race', () => {
    renderJogo();

    expect(screen.getByText('😴 Robô sonolento')).toBeTruthy();
    expect(screen.getByText('👀 Robô atento')).toBeTruthy();
    expect(screen.getByText('🚀 Robô turbo')).toBeTruthy();
    expect(screen.getByText('🏆 Robô campeão')).toBeTruthy();

    fireEvent.click(screen.getByText('Começar'));

    expect(screen.getByText('Prepare-se!')).toBeTruthy();
    expect(screen.queryByText('6x7')).toBeNull();

    avancar(3000);

    expect(screen.getByText('6x7')).toBeTruthy();
    expect(screen.getByLabelText('Pista da corrida')).toBeTruthy();
    expect(screen.getByLabelText('Seu robô')).toBeTruthy();
  });

  it('moves the player one step for each right answer', () => {
    renderJogo();
    comecar();

    responder('42');

    expect(screen.getByText('🏁 Casas: 1/20')).toBeTruthy();
    expect(screen.getByText('✅ Acertos: 1')).toBeTruthy();
  });

  it('holds the player for a while after a wrong answer', () => {
    renderJogo();
    comecar();

    responder('40');

    expect(screen.getByText('Ops! 6x7 = 42. Seu robô tropeçou...')).toBeTruthy();
    expect((screen.getByLabelText('Sua resposta') as HTMLInputElement).disabled).toBe(true);

    responder('42');
    expect(screen.getByText('🏁 Casas: 0/20')).toBeTruthy();

    avancar(2000);

    expect(screen.queryByText('Ops! 6x7 = 42. Seu robô tropeçou...')).toBeNull();
    responder('42');
    expect(screen.getByText('🏁 Casas: 1/20')).toBeTruthy();
  });

  it('lets the robot win when it reaches the finish line first', () => {
    renderJogo();
    comecar();

    responder('42');
    avancar(119000);
    expect(screen.queryByRole('status')).toBeNull();

    avancar(1000);

    expect(screen.getByRole('status')).toBeTruthy();
    expect(screen.getByText('🤖 O robô venceu!')).toBeTruthy();
    expect(screen.getByText('O Robô sonolento chegou primeiro, em 120,0s. Você avançou 1 de 20 casas.')).toBeTruthy();

    const historico = JSON.parse(window.localStorage.getItem('historico') || '[]');
    const progresso = JSON.parse(window.localStorage.getItem('tabuada-divertida-progresso') || '{}');

    expect(historico).toHaveLength(1);
    expect(historico[0]).toMatchObject({ tipo: 'CR', quantidadeQuestoes: 1, quantidadeAcertos: 1, tempo: 120 });
    expect(historico[0].questoes[0]).toEqual({ questao: '6x7', resposta: '42', correta: true });
    expect(progresso.jogosJogados).toEqual(['corrida-robo']);
    expect(Object.keys(progresso.tabuadas[6])).toEqual(['7']);
    expect(screen.queryByText('🏆 Ver ranking')).toBeNull();
    expect(enviar).not.toHaveBeenCalled();
  });

  it('gives the win and the medal for beating the champion robot', () => {
    renderJogo();
    fireEvent.click(screen.getByText('🏆 Robô campeão'));
    comecar();

    for (let casa = 0; casa < 20; casa++) {
      responder('42');
    }

    expect(screen.getByText('🏆 Você venceu!')).toBeTruthy();
    expect(screen.getByText('🏆 Novo recorde contra o Robô campeão!')).toBeTruthy();
    expect(JSON.parse(window.localStorage.getItem('tabuada-divertida-progresso') || '{}').vitoriasContraCampeao).toBe(1);
    expect(screen.getByText('Quer entrar no ranking? Digite seu nome:')).toBeTruthy();
    expect(screen.getByText('🏆 Ver ranking').getAttribute('href')).toBe('/ranking?jogo=corrida-robo&modo=M-campeao');

    fireEvent.click(screen.getByText('Revanche'));

    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.getByText('Prepare-se!')).toBeTruthy();
  });

  it('sends the winning race to the ranking of the chosen operation and robot', async () => {
    window.localStorage.setItem(configData.NOME_PARAM, 'Ana');
    renderJogo();
    fireEvent.click(screen.getByText('Adição➕'));
    fireEvent.click(screen.getByText('👀 Robô atento'));
    comecar();

    responder('40');
    avancar(2000);
    for (let casa = 0; casa < 20; casa++) {
      responder('42');
    }

    expect(await screen.findByText('Resultado enviado! Continue jogando para entrar no top 50.')).toBeTruthy();
    expect(enviar).toHaveBeenCalledWith('corrida-robo', 'A-atento', { tempo: 2, acertos: 20, total: 21 }, 'Ana');
  });

  it('starts with the track size of the player quantity', () => {
    salvarQuantidade(100);
    renderJogo();

    expect(screen.getByRole('button', { name: '50 casas' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByText(/quem chegar primeiro às 50 casas vence!/)).toBeTruthy();
  });

  it('keeps the player quantity when choosing the track size that matches it', () => {
    salvarQuantidade(100);
    renderJogo();

    fireEvent.click(screen.getByRole('button', { name: '50 casas' }));
    expect(lerQuantidade()).toBe(100);

    fireEvent.click(screen.getByRole('button', { name: '10 casas' }));
    expect(lerQuantidade()).toBe(10);
    expect(screen.getByRole('button', { name: '10 casas' }).getAttribute('aria-pressed')).toBe('true');
  });

  it('races on the chosen track size with its own records and ranking', async () => {
    window.localStorage.setItem(configData.NOME_PARAM, 'Ana');
    window.localStorage.setItem(STORAGE_RECORDES, JSON.stringify({ 'M-campeao': 1000 }));
    renderJogo();
    fireEvent.click(screen.getByRole('button', { name: '10 casas' }));
    fireEvent.click(screen.getByText('🏆 Robô campeão'));

    expect(screen.getByText('🏆 Recorde: ainda não há')).toBeTruthy();
    comecar();
    expect(screen.getByText('🏁 Casas: 0/10')).toBeTruthy();

    for (let casa = 0; casa < 10; casa++) {
      responder('42');
    }

    expect(screen.getByText('🏆 Você venceu!')).toBeTruthy();
    expect(screen.getByText('🏆 Novo recorde contra o Robô campeão!')).toBeTruthy();
    expect(JSON.parse(window.localStorage.getItem(STORAGE_RECORDES) || '{}')).toEqual({ 'M-campeao': 1000, 'M-campeao-10': 0 });
    expect(JSON.parse(window.localStorage.getItem('tabuada-divertida-progresso') || '{}').vitoriasContraCampeao).toBe(0);
    expect(await screen.findByText('Resultado enviado! Continue jogando para entrar no top 50.')).toBeTruthy();
    expect(enviar).toHaveBeenCalledWith('corrida-robo', 'M-campeao-10', { tempo: 0, acertos: 10, total: 10 }, 'Ana');
    expect(screen.getByText('🏆 Ver ranking').getAttribute('href')).toBe('/ranking?jogo=corrida-robo&modo=M-campeao-10');
  });

  it('lets the robot win a longer race only at the end of the track', () => {
    renderJogo();
    fireEvent.click(screen.getByRole('button', { name: '30 casas' }));
    fireEvent.click(screen.getByText('🏆 Robô campeão'));
    comecar();

    avancar(59000);
    expect(screen.queryByRole('status')).toBeNull();

    avancar(1000);

    expect(screen.getByText('O Robô campeão chegou primeiro, em 60,0s. Você avançou 0 de 30 casas.')).toBeTruthy();
  });
});
