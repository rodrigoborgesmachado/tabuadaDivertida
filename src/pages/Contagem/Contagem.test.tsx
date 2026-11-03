import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import configData from '../../Config.json';
import { salvarQuantidade } from '../../services/jogador';
import Contagem from './Contagem';

const renderContagem = (tipo: string) => render(
  <MemoryRouter initialEntries={['/contagem/' + tipo]}>
    <Routes>
      <Route path='/contagem/:tipo' element={<Contagem />} />
    </Routes>
  </MemoryRouter>
);

describe('Contagem', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('starts the match with the player quantity', () => {
    salvarQuantidade(50);
    renderContagem('M');

    expect(window.localStorage.getItem(configData.QUANTIDADE_PARAM)).toBe('50');
  });

  it('uses 20 questions when the player never chose', () => {
    renderContagem('A');

    expect(window.localStorage.getItem(configData.QUANTIDADE_PARAM)).toBe('20');
  });

  it('keeps the quantity of the training of mistakes', () => {
    salvarQuantidade(50);
    window.localStorage.setItem(configData.QUANTIDADE_PARAM, '3');
    renderContagem('T');

    expect(window.localStorage.getItem(configData.QUANTIDADE_PARAM)).toBe('3');
  });
});
