import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

export const URL_SITE = 'https://www.tabuadadivertida.com';

export const ehApp = () => Capacitor.isNativePlatform();

export const ehAndroid = () => ehApp() && Capacitor.getPlatform() === 'android';

export const urlDoSite = () => (ehApp() ? URL_SITE : window.location.origin || URL_SITE);

export const semConexao = () => typeof navigator !== 'undefined' && navigator.onLine === false;

export const ajustarBarraDeStatus = (escuro: boolean) => {
  if (!ehApp()) {
    return;
  }

  const cor = getComputedStyle(document.body).getPropertyValue('--background-color').trim();
  StatusBar.setStyle({ style: escuro ? Style.Dark : Style.Light }).catch(() => {});
  if (cor) {
    StatusBar.setBackgroundColor({ color: cor }).catch(() => {});
  }
};

export const linkExterno =(href: string) => {
  try {
    const url = new URL(href, window.location.href);
    return /^https?:$/.test(url.protocol) && url.origin !== window.location.origin;
  } catch {
    return false;
  }
};
