import type { Mock } from 'vitest';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { ajustarBarraDeStatus, linkExterno, semConexao, URL_SITE, urlDoSite } from './plataforma';

vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: vi.fn() } }));
vi.mock('@capacitor/status-bar', () => ({
  StatusBar: { setStyle: vi.fn(), setBackgroundColor: vi.fn() },
  Style: { Dark: 'DARK', Light: 'LIGHT' },
}));

const nativo = Capacitor.isNativePlatform as Mock;
const setStyle = StatusBar.setStyle as Mock;
const setBackgroundColor = StatusBar.setBackgroundColor as Mock;

describe('plataforma', () => {
  beforeEach(() => {
    nativo.mockReturnValue(false);
    setStyle.mockResolvedValue(undefined);
    setBackgroundColor.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.style.removeProperty('--background-color');
  });

  it('uses the current address on the site and the site address in the app', () => {
    expect(urlDoSite()).toBe(window.location.origin);

    nativo.mockReturnValue(true);

    expect(urlDoSite()).toBe(URL_SITE);
  });

  it('detects when there is no internet', () => {
    const online = vi.spyOn(navigator, 'onLine', 'get');

    online.mockReturnValue(false);
    expect(semConexao()).toBe(true);

    online.mockReturnValue(true);
    expect(semConexao()).toBe(false);
  });

  it('only treats links to other sites as external', () => {
    expect(linkExterno('http://www.sunsalesystem.com.br/')).toBe(true);
    expect(linkExterno('https://www.questoesaqui.com')).toBe(true);
    expect(linkExterno('/sobre')).toBe(false);
    expect(linkExterno(`${window.location.origin}/jogos`)).toBe(false);
    expect(linkExterno('mailto:rodrigomachado@sunsalesystem.com')).toBe(false);
  });

  it('does not change the status bar on the site', () => {
    ajustarBarraDeStatus(true);

    expect(setStyle).not.toHaveBeenCalled();
    expect(setBackgroundColor).not.toHaveBeenCalled();
  });

  it('paints the status bar with the theme colors in the app', () => {
    nativo.mockReturnValue(true);
    document.body.style.setProperty('--background-color', '#101c30');

    ajustarBarraDeStatus(true);

    expect(setStyle).toHaveBeenCalledWith({ style: Style.Dark });
    expect(setBackgroundColor).toHaveBeenCalledWith({ color: '#101c30' });

    ajustarBarraDeStatus(false);

    expect(setStyle).toHaveBeenLastCalledWith({ style: Style.Light });
  });
});
