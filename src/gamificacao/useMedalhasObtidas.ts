import { useEffect, useReducer } from 'react';
import { medalhas } from './medalhas';
import { EVENTO_CONQUISTAS, lerProgresso } from './progresso';

export const useMedalhasObtidas = () => {
  const [, atualizar] = useReducer((valor: number) => valor + 1, 0);

  useEffect(() => {
    window.addEventListener(EVENTO_CONQUISTAS, atualizar);
    return () => window.removeEventListener(EVENTO_CONQUISTAS, atualizar);
  }, []);

  const progresso = lerProgresso();
  return { obtidas: medalhas.filter((medalha) => progresso.medalhas[medalha.id]).length, total: medalhas.length };
};
