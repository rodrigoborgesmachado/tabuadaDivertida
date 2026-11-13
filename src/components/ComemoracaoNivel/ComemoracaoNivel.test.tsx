import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { criarProgresso, EVENTO_NIVEL, partidaFinalizada, STORAGE_KEY, type NivelAlcancado } from '../../gamificacao/progresso';
import { PERSONALIZACAO_PADRAO, STORAGE_PERSONALIZACAO } from '../../gamificacao/recompensas';
import { calcularNivel, xpTotalDoNivel } from '../../gamificacao/xp';
import { playConquista } from '../../services/sons';
import ComemoracaoNivel from './ComemoracaoNivel';

vi.mock('../../services/sons', () => ({
  playConquista: vi.fn(),
}));

const renderComemoracao = () => render(
  <MemoryRouter>
    <ComemoracaoNivel />
  </MemoryRouter>
);

const subirNivel = (nivelAnterior: number, nivel: number) => act(() => {
  window.dispatchEvent(new CustomEvent<NivelAlcancado>(EVENTO_NIVEL, { detail: { ...calcularNivel(xpTotalDoNivel(nivel)), nivelAnterior } }));
});

describe('ComemoracaoNivel', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  it('celebrates the new level with the items unlocked in it', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...criarProgresso(), xp: 425 }));
    const { container } = renderComemoracao();
    expect(screen.queryByRole('dialog')).toBeNull();

    act(() => {
      partidaFinalizada({ jogo: 'memoria' }, new Date(2026, 10, 2, 15, 0));
    });

    expect(screen.getByRole('dialog', { name: 'Subiu de nível!' })).toBeTruthy();
    expect(screen.getByText('Nível 3 · Contador')).toBeTruthy();
    expect(screen.getByText('Liberado agora')).toBeTruthy();
    expect(screen.getByText('Vermelho tomate')).toBeTruthy();
    expect(screen.getByText('Boné')).toBeTruthy();
    expect(screen.getByRole('link', { name: '🎨 Personalizar robô' }).getAttribute('href')).toBe('/personalizar');
    expect(container.querySelector('.comemoracao-nivel__confetes span')).toBeTruthy();
    expect(screen.queryByText(/Nova faixa/)).toBeNull();
    expect(document.activeElement?.textContent).toBe('Continuar');
    expect(playConquista).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('announces the new band and closes with the Escape key', () => {
    const { container } = renderComemoracao();

    subirNivel(19, 20);

    expect(screen.getByText('🏅 Nova faixa: Ouro!')).toBeTruthy();
    expect(container.querySelector('.comemoracao-nivel--ouro')).toBeTruthy();

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('gives a legend star and a new title every five levels after 50', () => {
    renderComemoracao();

    subirNivel(54, 55);

    expect(screen.getByText('Nível 55 · Lenda Suprema II')).toBeTruthy();
    expect(screen.getByText('⭐ Nova estrela de lenda! Agora são 1.')).toBeTruthy();
    expect(screen.getByText('Cometa')).toBeTruthy();
  });

  it('hides the shortcut when the level has no new items and joins levels reached in a row', () => {
    renderComemoracao();

    subirNivel(58, 59);

    expect(screen.queryByText('Liberado agora')).toBeNull();
    expect(screen.queryByRole('link', { name: '🎨 Personalizar robô' })).toBeNull();

    subirNivel(59, 60);

    expect(screen.getByText('Nível 60 · Lenda Suprema III')).toBeTruthy();
    expect(screen.getByText('Nebulosa')).toBeTruthy();
  });

  it('shows the pet and the chosen dance of the robot', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...criarProgresso(), xp: xpTotalDoNivel(62) }));
    window.localStorage.setItem(STORAGE_PERSONALIZACAO, JSON.stringify({ ...PERSONALIZACAO_PADRAO, bichinho: 'bichinho-dragao', danca: 'danca-estrela' }));
    const { container } = renderComemoracao();

    subirNivel(61, 62);

    const robo = container.querySelector('.comemoracao-nivel__robo');
    expect(robo?.getAttribute('class')).toContain('robo-danca robo-danca-estrela');
    expect(robo?.querySelector('[data-bichinho="bichinho-dragao"]')).toBeTruthy();
  });
});
