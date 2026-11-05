import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TesteQi from './TesteQi';

vi.mock('./logic', async () => {
  const actual = await vi.importActual<typeof import('./logic')>('./logic');
  const facil = { regra: 'soma-fixa', tipo: 'sequencia', dificuldade: 'facil', linhas: [[2, 4, 6, 8, null]], resposta: 10, explicacao: 'Cada número é o anterior mais 2.', opcoes: [8, 10, 12, 9] };
  const medio = { regra: 'quadrados', tipo: 'sequencia', dificuldade: 'medio', linhas: [[1, 4, 9, 16, 25, null]], resposta: 36, explicacao: 'Cada número é um número vezes ele mesmo.' };
  const dificil = { regra: 'grade-soma', tipo: 'grade', dificuldade: 'dificil', linhas: [[2, 3, 5], [4, 6, 10], [7, null, 15]], resposta: 8, explicacao: 'Em cada linha, o terceiro número é a soma dos dois primeiros.' };
  return {
    ...actual,
    gerarPartida: () => [...Array(5).fill(facil), ...Array(5).fill(medio), ...Array(5).fill(dificil)],
  };
});

const renderJogo = () => render(
  <MemoryRouter>
    <TesteQi />
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

const digitar = (texto: string) => {
  texto.split('').forEach((tecla) => fireEvent.keyDown(window, { key: tecla }));
  fireEvent.keyDown(window, { key: 'Enter' });
};

describe('TesteQi', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.localStorage.clear();
    document.head.innerHTML = '<meta name="description" content="Descrição padrão" />';
    document.title = 'Tabuada Divertida';
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows the just for fun notice and sets the page title', () => {
    renderJogo();

    expect(screen.getByText('Estilo teste de QI, só por diversão. Não é um teste científico.')).toBeTruthy();
    expect(document.title).toMatch(/^Teste de QI com Números/);
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toMatch(/teste de QI/);
  });

  it('shows the countdown and then the first question with 4 options', () => {
    renderJogo();
    fireEvent.click(screen.getByText('Começar'));

    expect(screen.getByText('Prepare-se!')).toBeTruthy();

    avancar(3000);

    expect(screen.getByText('Qual é o próximo número?')).toBeTruthy();
    expect(screen.getByText('❓ 1/15')).toBeTruthy();
    expect(screen.getByText('⏱️ 30s')).toBeTruthy();
    expect(screen.getAllByRole('button', { name: /^(8|10|12|9)$/ })).toHaveLength(4);
  });

  it('goes to the next question on a right answer', () => {
    renderJogo();
    comecar();

    fireEvent.click(screen.getByRole('button', { name: '10' }));

    expect(screen.getByText('✅ Acertos: 1')).toBeTruthy();
    expect(screen.getByText('❓ 2/15')).toBeTruthy();
  });

  it('shows the rule explanation on a wrong answer', () => {
    renderJogo();
    comecar();

    fireEvent.keyDown(window, { key: '1' });

    expect(screen.getByText('Ops! Não foi dessa vez. A resposta é 10.')).toBeTruthy();
    expect(screen.getByText('Cada número é o anterior mais 2.')).toBeTruthy();

    fireEvent.click(screen.getByText('Próxima'));

    expect(screen.getByText('❓ 2/15')).toBeTruthy();
    expect(screen.getByText('✅ Acertos: 0')).toBeTruthy();
  });

  it('counts the question as wrong when the time is over', () => {
    renderJogo();
    comecar();

    avancar(30000);

    expect(screen.getByText('⏰ O tempo acabou! A resposta é 10.')).toBeTruthy();
  });

  it('uses the keypad and the keyboard on the medium questions', () => {
    renderJogo();
    comecar();

    for (let i = 0; i < 5; i++) {
      fireEvent.keyDown(window, { key: '2' });
    }

    expect(screen.getByText('🎚️ Médio')).toBeTruthy();
    expect(screen.getByLabelText('Teclado numérico')).toBeTruthy();

    fireEvent.click(screen.getByLabelText('Número 3'));
    fireEvent.click(screen.getByLabelText('Número 6'));
    expect(screen.getByLabelText('Número que falta').textContent).toBe('36');
    fireEvent.click(screen.getByLabelText('Confirmar'));

    expect(screen.getByText('✅ Acertos: 6')).toBeTruthy();

    digitar('37');
    expect(screen.getByText('Ops! Não foi dessa vez. A resposta é 36.')).toBeTruthy();
  });

  it('shows the playful score, saves the history and the best result at the end', () => {
    renderJogo();
    comecar();

    for (let i = 0; i < 5; i++) {
      fireEvent.click(screen.getByRole('button', { name: '10' }));
    }
    for (let i = 0; i < 5; i++) {
      digitar('36');
    }
    for (let i = 0; i < 4; i++) {
      digitar('8');
    }
    digitar('9');
    fireEvent.click(screen.getByText('Ver resultado'));

    expect(screen.getByText('Gênio dos Padrões')).toBeTruthy();
    expect(screen.getByText('Você acertou 14 de 15 questões.')).toBeTruthy();
    expect(screen.getByText('🏆 Novo melhor resultado!')).toBeTruthy();
    expect(screen.getAllByText('Estilo teste de QI, só por diversão. Não é um teste científico.')).toHaveLength(2);
    expect(screen.getByText('Grade 3×3')).toBeTruthy();
    expect(screen.getByText('4/5')).toBeTruthy();
    expect(screen.getByText('Revisão das questões erradas')).toBeTruthy();
    expect(screen.getByText('Sua resposta: 9 · Resposta certa: 8')).toBeTruthy();
    expect(screen.getByText('Compartilhar')).toBeTruthy();

    const historico = JSON.parse(window.localStorage.getItem('historico') || '[]');
    const progresso = JSON.parse(window.localStorage.getItem('tabuada-divertida-progresso') || '{}');
    const recorde = JSON.parse(window.localStorage.getItem('tabuada-divertida-teste-qi-recorde') || '{}');

    expect(historico[0]).toMatchObject({ tipo: 'QI', quantidadeQuestoes: 15, quantidadeAcertos: 14, pontuacao: 138 });
    expect(historico[0].questoes[14]).toEqual({ questao: '2 3 5 | 4 6 10 | 7 ? 15', resposta: '9', correta: false });
    expect(progresso.jogosJogados).toEqual(['teste-qi']);
    expect(progresso.padroesAcertados).toBe(14);
    expect(recorde).toEqual({ acertos: 14, qi: 138 });
  });
});
