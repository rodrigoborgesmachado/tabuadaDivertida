import { Preferences } from '@capacitor/preferences';
import { ehApp } from './plataforma';

export const CHAVE_MIGRADO = 'tabuada-divertida-armazenamento-migrado';

export const gravarItem = (chave: string, valor: string) => {
  window.localStorage.setItem(chave, valor);
  if (ehApp()) {
    Preferences.set({ key: chave, value: valor }).catch(() => {});
  }
};

export const iniciarArmazenamento = async (chaves: string[]) => {
  if (!ehApp()) {
    return;
  }

  try {
    const { keys } = await Preferences.keys();
    if (keys.includes(CHAVE_MIGRADO)) {
      await Promise.all(chaves.filter((chave) => keys.includes(chave)).map(async (chave) => {
        const { value } = await Preferences.get({ key: chave });
        if (value !== null) {
          window.localStorage.setItem(chave, value);
        }
      }));
      return;
    }

    await Promise.all(chaves.map((chave) => {
      const valor = window.localStorage.getItem(chave);
      return valor === null ? null : Preferences.set({ key: chave, value: valor });
    }));
    await Preferences.set({ key: CHAVE_MIGRADO, value: '1' });
  } catch {}
};
