declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export const registrarEvento = (nome: string, parametros: Record<string, unknown> = {}) => {
  if (typeof window.gtag !== 'function') {
    return;
  }

  window.gtag('event', nome, Object.fromEntries(Object.entries(parametros).filter(([, valor]) => valor !== undefined && valor !== null && valor !== '')));
};

export const partidaIniciada = (jogo: string, parametros: Record<string, unknown> = {}) => registrarEvento('game_started', { jogo, ...parametros });
