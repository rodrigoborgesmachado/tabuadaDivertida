import type { Mock } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { SplashScreen } from '@capacitor/splash-screen';
import { EVENTO_DESAFIOS } from '../../gamificacao/progresso';
import { agendarLembretes } from '../../services/lembretes';
import AppNativo from './AppNativo';

const atalhoAberto = vi.hoisted(() => vi.fn());

vi.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: vi.fn(), getPlatform: () => 'android' },
  registerPlugin: () => ({ addListener: atalhoAberto }),
}));
vi.mock('@capacitor/app', () => ({ App: { addListener: vi.fn(), exitApp: vi.fn() } }));
vi.mock('@capacitor/browser', () => ({ Browser: { open: vi.fn() } }));
vi.mock('@capacitor/local-notifications', () => ({ LocalNotifications: { addListener: vi.fn() } }));
vi.mock('@capacitor/splash-screen', () => ({ SplashScreen: { hide: vi.fn() } }));
vi.mock('../../services/lembretes', async (original) => ({ ...(await original<object>()), agendarLembretes: vi.fn() }));

const nativo = Capacitor.isNativePlatform as Mock;
const addListener = App.addListener as Mock;
const exitApp = App.exitApp as Mock;
const abrir = Browser.open as Mock;
const ouvirNotificacao = LocalNotifications.addListener as Mock;
const agendar = agendarLembretes as Mock;
let voltar: (evento: { canGoBack: boolean }) => void;
let tocarNotificacao: () => void;
let abrirAtalho: () => void;

function Endereco() {
  const { pathname, hash } = useLocation();
  return <span>{`${pathname}${hash}`}</span>;
}

const renderApp = (rotas = ['/']) => render(
  <MemoryRouter initialEntries={rotas}>
    <AppNativo />
    <Endereco />
    <Routes>
      <Route path='/' element={<a href='http://www.sunsalesystem.com.br/'>SunSale System</a>} />
      <Route path='/jogos' element={<a href='/sobre'>Sobre</a>} />
    </Routes>
  </MemoryRouter>
);

describe('AppNativo', () => {
  beforeEach(() => {
    nativo.mockReturnValue(true);
    addListener.mockImplementation(async (_evento, ouvinte) => {
      voltar = ouvinte;
      return { remove: vi.fn() };
    });
    ouvirNotificacao.mockImplementation(async (_evento, ouvinte) => {
      tocarNotificacao = ouvinte;
      return { remove: vi.fn() };
    });
    atalhoAberto.mockImplementation(async (_evento, ouvinte) => {
      abrirAtalho = ouvinte;
      return { remove: vi.fn() };
    });
    abrir.mockResolvedValue(undefined);
    (SplashScreen.hide as Mock).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('does nothing on the site', () => {
    nativo.mockReturnValue(false);

    renderApp();

    expect(addListener).not.toHaveBeenCalled();
    expect(ouvirNotificacao).not.toHaveBeenCalled();
    expect(agendar).not.toHaveBeenCalled();
    expect(atalhoAberto).not.toHaveBeenCalled();
    expect(SplashScreen.hide).not.toHaveBeenCalled();
  });

  it('schedules the reminders when the app opens and when a challenge is done', () => {
    renderApp();

    expect(agendar).toHaveBeenCalledTimes(1);

    act(() => {
      window.dispatchEvent(new CustomEvent(EVENTO_DESAFIOS, { detail: [] }));
    });

    expect(agendar).toHaveBeenCalledTimes(2);
  });

  it('opens the challenge of the day on the home when the reminder is touched', () => {
    renderApp(['/jogos']);

    act(() => tocarNotificacao());

    expect(screen.getByText('/#desafio-do-dia')).toBeTruthy();
  });

  it('hides the splash screen when the app opens', () => {
    renderApp();

    expect(SplashScreen.hide).toHaveBeenCalledTimes(1);
  });

  it('goes back to the previous screen with the back button', () => {
    renderApp(['/', '/jogos']);

    act(() => voltar({ canGoBack: true }));

    expect(screen.getByText('SunSale System')).toBeTruthy();
    expect(exitApp).not.toHaveBeenCalled();
  });

  it('goes to the home when there is no previous screen', () => {
    renderApp(['/jogos']);

    act(() => voltar({ canGoBack: false }));

    expect(screen.getByText('SunSale System')).toBeTruthy();
  });

  it('closes the app on the home', () => {
    renderApp();

    act(() => voltar({ canGoBack: true }));

    expect(exitApp).toHaveBeenCalledTimes(1);
  });

  it('goes to the home when the app is opened by the robot shortcut', () => {
    renderApp(['/jogos']);

    act(() => abrirAtalho());

    expect(atalhoAberto).toHaveBeenCalledWith('atalhoAberto', expect.any(Function));
    expect(screen.getByText('SunSale System')).toBeTruthy();
  });

  it('opens external links in the system browser', () => {
    renderApp();

    const clique = fireEvent.click(screen.getByText('SunSale System'));

    expect(clique).toBe(false);
    expect(abrir).toHaveBeenCalledWith({ url: 'http://www.sunsalesystem.com.br/' });
  });

  it('keeps internal links in the app', () => {
    renderApp(['/jogos']);

    fireEvent.click(screen.getByText('Sobre'));

    expect(abrir).not.toHaveBeenCalled();
  });
});
