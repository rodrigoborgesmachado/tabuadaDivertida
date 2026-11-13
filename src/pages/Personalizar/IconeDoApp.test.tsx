import type { Mock } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { criarProgresso } from '../../gamificacao/progresso';
import { xpTotalDoNivel } from '../../gamificacao/xp';
import { IconeApp, imagemDoAtalho, temIconeDoApp } from '../../services/iconeApp';
import { ehAndroid } from '../../services/plataforma';
import IconeDoApp, { AVISO_TROCA, useIconeDoApp } from './IconeDoApp';

vi.mock('../../services/plataforma', async (original) => ({
  ...(await original<typeof import('../../services/plataforma')>()),
  ehAndroid: vi.fn(),
}));

vi.mock('../../services/iconeApp', async (original) => ({
  ...(await original<typeof import('../../services/iconeApp')>()),
  IconeApp: { iconeAtual: vi.fn(), trocarIcone: vi.fn(), atalho: vi.fn(), criarAtalho: vi.fn() },
  imagemDoAtalho: vi.fn(),
}));

const android = ehAndroid as Mock;
const iconeAtual = IconeApp.iconeAtual as Mock;
const trocarIcone = IconeApp.trocarIcone as Mock;
const atalho = IconeApp.atalho as Mock;
const criarAtalho = IconeApp.criarAtalho as Mock;

function IconeDoAppTeste({ xp }: { xp: number }) {
  const icone = useIconeDoApp();

  return <IconeDoApp progresso={{ ...criarProgresso(), xp }} nivel={1} icone={icone} />;
}

const renderIcone = async (xp = 0) => {
  render(<IconeDoAppTeste xp={xp} />);
  await act(async () => {});
};

const item = (nome: string) => screen.getByText(nome).closest('button') as HTMLButtonElement;

describe('IconeDoApp', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    android.mockReturnValue(true);
    iconeAtual.mockResolvedValue({ icone: 'cor-prata', suportado: true });
    trocarIcone.mockResolvedValue(undefined);
    atalho.mockResolvedValue({ suportado: true, criado: false });
    criarAtalho.mockResolvedValue({ sucesso: true, atualizado: false });
    (imagemDoAtalho as Mock).mockResolvedValue('imagem');
  });

  it('shows nothing on the site', async () => {
    android.mockReturnValue(false);

    await renderIcone();

    expect(screen.queryByText('📱 Ícone do app')).toBeNull();
    expect(screen.queryByText('📌 Colocar meu robô na tela inicial')).toBeNull();
    expect(iconeAtual).not.toHaveBeenCalled();
    expect(temIconeDoApp('cor-azul')).toBe(false);
  });

  it('shows the icons unlocked with the robot colors and the condition of the locked ones', async () => {
    await renderIcone();

    expect(item('Robô Prata').getAttribute('aria-pressed')).toBe('true');
    expect(item('Robô Prata').textContent).toContain('✅ Em uso');
    expect(item('Robô Azul céu').disabled).toBe(true);
    expect(item('Robô Azul céu').textContent).toContain('Nível 2');
    expect(temIconeDoApp('cor-azul')).toBe(true);
    expect(temIconeDoApp('cor-lilas')).toBe(false);
  });

  it('shows the icons unlocked after level 22 with the gradient of the robot color', async () => {
    await renderIcone(xpTotalDoNivel(24));

    expect(item('Robô Vermelho rubi').disabled).toBe(false);
    expect(item('Robô Esmeralda').disabled).toBe(true);
    expect(item('Robô Esmeralda').textContent).toContain('Nível 26');
    expect(item('Robô Infinito').textContent).toContain('Nível 75');
    expect((item('Robô Aurora boreal').querySelector('.personalizar-item__icone') as HTMLElement).style.background).toContain('linear-gradient');
    expect(temIconeDoApp('cor-infinito')).toBe(true);
  });

  it('warns the player before changing the icon', async () => {
    const confirmar = vi.spyOn(window, 'confirm').mockReturnValue(false);
    await renderIcone(1000);

    fireEvent.click(item('Robô Azul céu'));

    expect(confirmar).toHaveBeenCalledWith(AVISO_TROCA);
    expect(trocarIcone).not.toHaveBeenCalled();

    confirmar.mockReturnValue(true);
    await act(async () => {
      fireEvent.click(item('Robô Azul céu'));
    });

    expect(trocarIcone).toHaveBeenCalledWith({ icone: 'cor-azul' });
    expect(item('Robô Azul céu').getAttribute('aria-pressed')).toBe('true');
  });

  it('pins a shortcut with the customized robot and offers to update it', async () => {
    await renderIcone();

    await act(async () => {
      fireEvent.click(screen.getByText('📌 Colocar meu robô na tela inicial'));
    });

    expect(criarAtalho).toHaveBeenCalledWith({ imagem: 'imagem' });

    atalho.mockResolvedValue({ suportado: true, criado: true });
    document.body.innerHTML = '';
    await renderIcone();

    expect(screen.getByText('🔄 Atualizar meu robô na tela inicial')).toBeTruthy();
  });

  it('hides the icon choice when the phone does not support it', async () => {
    iconeAtual.mockResolvedValue({ icone: 'cor-prata', suportado: false });
    atalho.mockResolvedValue({ suportado: false, criado: false });

    await renderIcone();

    expect(screen.queryByText('📱 Ícone do app')).toBeNull();
    expect(screen.queryByText('📌 Colocar meu robô na tela inicial')).toBeNull();
  });
});
