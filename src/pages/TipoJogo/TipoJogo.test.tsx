import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import configData from '../../Config.json';
import { lerNome, lerQuantidade, salvarNome, salvarQuantidade, STORAGE_PERFIL_VISTO } from '../../services/jogador';
import RoutesApp from '../../routes';
import TipoJogo from './TipoJogo';

const renderTipoJogo = () => render(
  <MemoryRouter>
    <TipoJogo />
  </MemoryRouter>
);

describe('TipoJogo', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('shows who is playing and how many questions', () => {
    window.localStorage.setItem(configData.NOME_PARAM, 'Ana');
    window.localStorage.setItem(configData.QUANTIDADE_PARAM, '17');
    renderTipoJogo();

    expect(screen.getByText('Ana')).toBeTruthy();
    expect(screen.getByText('20 contas')).toBeTruthy();
    expect(screen.getByText('Multiplicação✖️').closest('a')?.getAttribute('href')).toBe('/contagem/M');
    expect(screen.getByText('Voltar').closest('a')?.getAttribute('href')).toBe('/');
  });

  it('changes the quantity with the fixed options', () => {
    renderTipoJogo();

    fireEvent.click(screen.getByText('· trocar', { exact: false }));
    expect(screen.getByRole('button', { name: '20' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getAllByRole('group', { name: 'Quantidade de contas' })[0].querySelectorAll('button')).toHaveLength(5);

    fireEvent.click(screen.getByRole('button', { name: '100' }));

    expect(lerQuantidade()).toBe(100);
    expect(screen.getByText('100 contas')).toBeTruthy();
    expect(screen.queryByRole('group', { name: 'Quantidade de contas' })).toBeNull();
  });

  it('edits the name in the profile', () => {
    renderTipoJogo();

    expect(screen.getByText('Jogador')).toBeTruthy();
    fireEvent.click(screen.getByText('Jogando como', { exact: false }));
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Caio' } });
    fireEvent.click(screen.getByText('Salvar'));

    expect(lerNome()).toBe('Caio');
    expect(screen.getByText('Caio')).toBeTruthy();
  });

  it('reflects the changes made in other places', () => {
    renderTipoJogo();

    act(() => {
      salvarNome('Bia');
      salvarQuantidade(30);
    });

    expect(screen.getByText('Bia')).toBeTruthy();
    expect(screen.getByText('30 contas')).toBeTruthy();
  });

  it('redirects the old form to the mode selection', () => {
    window.localStorage.setItem(STORAGE_PERFIL_VISTO, '1');
    window.history.pushState({}, '', '/formulario');

    render(<RoutesApp />);

    expect(window.location.pathname).toBe('/selecionarjogo');
    expect(screen.getByText('Jogando como', { exact: false })).toBeTruthy();
    window.history.pushState({}, '', '/');
  });
});
