import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import configData from '../../Config.json';
import Jogo from './Jogo';

jest.mock('../../services/api', () => ({
  __esModule: true,
  default: { post: () => Promise.resolve({}) },
}));

jest.mock('../../services/sons', () => ({
  playError: () => {},
  playSuccess: () => {},
}));

const renderJogo = () => render(
  <MemoryRouter initialEntries={['/jogo/M']}>
    <Routes>
      <Route path='/jogo/:tipo' element={<Jogo />} />
      <Route path='/final/:tipo' element={<h1>Tela final</h1>} />
    </Routes>
  </MemoryRouter>
);

const responderConta = async () => {
  const [n1, n2] = (screen.getByRole('heading', { level: 3 }).textContent || '').split('x').map(Number);
  fireEvent.change(screen.getByRole('spinbutton'), { target: { value: String(n1 * n2) } });

  await act(async () => {
    fireEvent.keyDown(screen.getByRole('spinbutton'), { key: 'Enter' });
  });
};

const progresso = () => JSON.parse(window.localStorage.getItem('tabuada-divertida-progresso') || '{}');

describe('Jogo', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    window.localStorage.clear();
    window.localStorage.setItem(configData.QUANTIDADE_PARAM, '1');
    window.localStorage.setItem(configData.NOME_PARAM, 'Ana');
  });

  it('saves the match in the history with date and score', async () => {
    renderJogo();
    await responderConta();

    const historico = JSON.parse(window.localStorage.getItem(configData.HISTORICO) || '[]');
    expect(historico).toHaveLength(1);
    expect(historico[0].pontuacao).toBe(10);
    expect(new Date(historico[0].data).toString()).not.toBe('Invalid Date');
    expect(await screen.findByText('Tela final')).toBeTruthy();
  });

  it.each(['QuotaExceededError', 'SecurityError'])('finishes the match and registers the achievements when saving the history fails with %s', async (name) => {
    const setItem = Storage.prototype.setItem;
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, chave: string, valor: string) {
      if (chave === configData.HISTORICO) {
        throw Object.assign(new Error(name), { name });
      }
      setItem.call(this, chave, valor);
    });

    renderJogo();
    await responderConta();

    expect(window.localStorage.getItem(configData.HISTORICO)).toBeNull();
    expect(progresso().jogosJogados).toEqual(['tabuada']);
    expect(await screen.findByText('Tela final')).toBeTruthy();
  });
});
