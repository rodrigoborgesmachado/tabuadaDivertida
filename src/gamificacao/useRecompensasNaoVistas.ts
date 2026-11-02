import { useEffect, useReducer } from 'react';
import { EVENTO_CONQUISTAS, EVENTO_NIVEL } from './progresso';
import { EVENTO_RECOMPENSAS_VISTAS, recompensasNaoVistas } from './recompensas';

const EVENTOS = [EVENTO_RECOMPENSAS_VISTAS, EVENTO_CONQUISTAS, EVENTO_NIVEL];

export const useRecompensasNaoVistas = () => {
  const [, atualizar] = useReducer((valor: number) => valor + 1, 0);

  useEffect(() => {
    EVENTOS.forEach((evento) => window.addEventListener(evento, atualizar));
    return () => EVENTOS.forEach((evento) => window.removeEventListener(evento, atualizar));
  }, []);

  return recompensasNaoVistas();
};
