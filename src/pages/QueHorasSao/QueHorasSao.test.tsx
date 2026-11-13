import type { Mock } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { enviarResultado } from '../../services/resultadosJogos';
import QueHorasSao from './QueHorasSao';

vi.mock('../../services/resultadosJogos', async () => ({
  ...(await vi.importActual('../../services/resultadosJogos')),
  enviarResultado: vi.fn(),
  buscarRanking: vi.fn(),
}));

const enviar = enviarResultado as Mock;

vi.mock('./logic', async () => {
  const actual = await vi.importActual<typeof import('./logic')>('./logic');
  const resposta = actual.hora(7, 45);
  return {
    ...actual,
    gerarPartida: () => Array.from({ length: actual.TOTAL_QUESTOES }, () => ({
      inicio: resposta,
      resposta,
      opcoes: [resposta, actual.hora(8, 45), actual.hora(9, 35), actual.hora(6, 45)],
    })),
  };
});

const renderJogo = () => render(
  <MemoryRouter>
    <QueHorasSao />
  </MemoryRouter>
);

const proximaQuestao = () => {
  act(() => {
    vi.advanceTimersByTime(1000);
  });
};

const relogio = () => screen.getByRole('img', { name: 'Relógio para acertar os ponteiros' });

const rotacoes = () => Array.from(relogio().querySelectorAll('g')).map((grupo) => grupo.getAttribute('transform'));

describe('QueHorasSao', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.localStorage.clear();
    enviar.mockReset();
    enviar.mockResolvedValue(null);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('accepts the right time and goes to the next question', () => {
    renderJogo();
    fireEvent.click(screen.getByText('Começar'));

    expect(screen.getByText('Que horas o relógio está marcando?')).toBeTruthy();
    expect(screen.getByText('❓ 1/10')).toBeTruthy();

    fireEvent.click(screen.getByText('07:45'));

    expect(screen.getByText('🎉 Isso! A hora certa é 07:45.')).toBeTruthy();
    expect(screen.getByText('✅ Acertos: 1')).toBeTruthy();

    proximaQuestao();

    expect(screen.getByText('❓ 2/10')).toBeTruthy();
  });

  it('explains the right time on a wrong answer', () => {
    renderJogo();
    fireEvent.click(screen.getByText('Começar'));
    fireEvent.click(screen.getByText('08:45'));

    expect(screen.getByText('Ops! A hora certa é 07:45.')).toBeTruthy();
    expect(screen.getByText('O ponteiro pequeno entre o 7 e o 8 marca 7 horas e o grande no 9 marca 45 minutos.')).toBeTruthy();
    expect(screen.getByText('✅ Acertos: 0')).toBeTruthy();

    proximaQuestao();
    expect(screen.getByText('❓ 1/10')).toBeTruthy();

    fireEvent.click(screen.getByText('Continuar'));
    expect(screen.getByText('❓ 2/10')).toBeTruthy();
  });

  it('shows the answers in words', () => {
    renderJogo();
    fireEvent.click(screen.getByText('🔤 Por extenso (quinze para as oito)'));
    fireEvent.click(screen.getByText('Começar'));

    expect(screen.getByText('quinze para as oito')).toBeTruthy();
    expect(screen.getByText('vinte e cinco para as dez')).toBeTruthy();
  });

  it('sets the hands with the buttons', () => {
    renderJogo();
    fireEvent.click(screen.getByText('✋ Acertar os ponteiros'));
    fireEvent.click(screen.getByText('Começar'));

    expect(screen.getByText('Coloque os ponteiros em 07:45.')).toBeTruthy();

    for (let i = 0; i < 8; i++) {
      fireEvent.click(screen.getByText('+ 1 hora'));
    }
    for (let i = 0; i < 3; i++) {
      fireEvent.click(screen.getByText('− 5 min'));
    }
    fireEvent.click(screen.getByText('Confirmar'));

    expect(screen.getByText('🎉 Isso! A hora certa é 07:45.')).toBeTruthy();
  });

  it('drags the minute hand pulling the hour hand and drags the hour hand', () => {
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0, width: 200, height: 200, right: 200, bottom: 200, x: 0, y: 0, toJSON: () => ({}) });
    renderJogo();
    fireEvent.click(screen.getByText('✋ Acertar os ponteiros'));
    fireEvent.click(screen.getByText('Começar'));

    fireEvent.pointerDown(relogio(), { clientX: 180, clientY: 100, pointerId: 1 });
    expect(rotacoes()).toEqual(['rotate(7.5 100 100)', 'rotate(90 100 100)']);

    fireEvent.pointerMove(relogio(), { clientX: 100, clientY: 180, pointerId: 1 });
    fireEvent.pointerMove(relogio(), { clientX: 20, clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(relogio(), { clientX: 100, clientY: 20, pointerId: 1 });
    fireEvent.pointerMove(relogio(), { clientX: 180, clientY: 100, pointerId: 1 });
    fireEvent.pointerUp(relogio(), { pointerId: 1 });
    expect(rotacoes()).toEqual(['rotate(37.5 100 100)', 'rotate(90 100 100)']);

    fireEvent.pointerDown(relogio(), { clientX: 100, clientY: 130, pointerId: 2 });
    fireEvent.pointerUp(relogio(), { pointerId: 2 });
    expect(rotacoes()).toEqual(['rotate(187.5 100 100)', 'rotate(90 100 100)']);
  });

  it('finishes after 10 questions and saves the progress', () => {
    renderJogo();
    fireEvent.click(screen.getByText('Começar'));

    for (let i = 0; i < 10; i++) {
      fireEvent.click(screen.getByText('07:45'));
      proximaQuestao();
    }

    const progresso = JSON.parse(window.localStorage.getItem('tabuada-divertida-progresso') || '{}');

    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByText(/Você acertou 10 de 10 questões/)).toBeTruthy();
    expect(screen.getByText('Compartilhar')).toBeTruthy();
    expect(progresso.jogosJogados).toEqual(['que-horas-sao']);
    expect(progresso.acertosPorModo['relogio-facil']).toBe(10);
    expect(enviar).toHaveBeenCalledWith('que-horas-sao', 'ler-facil', { acertos: 10, total: 10, tempo: 10 }, '');
    expect(screen.getByText('🏆 Ver ranking').getAttribute('href')).toBe('/ranking?jogo=que-horas-sao&modo=ler-facil');
  });
});
