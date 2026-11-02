import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import configData from '../../Config.json';
import Resultados from './Resultados';

const renderResultados = () => render(
  <MemoryRouter initialEntries={['/resultados']}>
    <Routes>
      <Route path='/resultados' element={<Resultados />} />
      <Route path='/contagem/:tipo' element={<h1>Contagem</h1>} />
    </Routes>
  </MemoryRouter>
);

describe('Resultados', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem(configData.HISTORICO, JSON.stringify([
      { quantidadeQuestoes: '2', quantidadeAcertos: '1', tempo: '10', nome: 'Ana', tipo: 'D', questoes: [{ questao: '56÷8', resposta: '6', correta: false }, { questao: '9÷3', resposta: '3', correta: true }] },
      { quantidadeQuestoes: '2', quantidadeAcertos: '1', tempo: '8', nome: 'Ana', tipo: 'M', data: new Date().toISOString(), pontuacao: 10, questoes: [{ questao: '7x8', resposta: '54', correta: false }, { questao: '3x4', resposta: '12', correta: true }] },
    ]));
    window.localStorage.setItem(configData.QUESTOES, JSON.stringify([{ questao: '7x8', resposta: '54', correta: false }, { questao: '3x4', resposta: '12', correta: true }]));
    window.localStorage.setItem(configData.QUANTIDADE_PARAM, '20');
  });

  it('shows the correct answer in the common errors and in the last session', () => {
    renderResultados();

    expect(screen.getByText('7x8 = 56 — errou 1x')).toBeTruthy();
    expect(screen.getByText('56÷8 = 7 — errou 1x')).toBeTruthy();
    expect(screen.getByText('7x8 = 54 ❌ (56)')).toBeTruthy();
    expect(screen.getByText('3x4 = 12 ✅')).toBeTruthy();
  });

  it('shows the hits and errors of a cell of the times table map', () => {
    renderResultados();

    fireEvent.click(screen.getByRole('gridcell', { name: '7 x 8 = 56: 0 acertos, 1 erro' }));

    expect(screen.getByText('7 x 8 = 56: 0 acertos e 1 erro')).toBeTruthy();
  });

  it('filters the period ignoring the matches without date', () => {
    renderResultados();
    expect(screen.getByText('Jogos', { selector: 'dt' }).nextSibling?.textContent).toBe('2');

    fireEvent.click(screen.getByRole('button', { name: '7 dias' }));

    expect(screen.getByText('Jogos', { selector: 'dt' }).nextSibling?.textContent).toBe('1');
    expect(screen.queryByText('56÷8 = 7 — errou 1x')).toBeNull();
    expect(screen.getByRole('img', { name: 'Taxa de acerto nas últimas 1 partidas' })).toBeTruthy();
  });

  it('starts a training with only the wrong questions', () => {
    renderResultados();

    fireEvent.click(screen.getByRole('button', { name: 'Treinar meus erros' }));

    expect(JSON.parse(window.localStorage.getItem(configData.TREINO) || '[]')).toEqual([
      { texto: '56÷8', resposta: 7 },
      { texto: '7x8', resposta: 56 },
    ]);
    expect(window.localStorage.getItem(configData.QUANTIDADE_PARAM)).toBe('2');
    expect(screen.getByText('Contagem')).toBeTruthy();
  });
});
