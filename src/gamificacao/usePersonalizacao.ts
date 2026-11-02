import { useEffect, useState } from 'react';
import { EVENTO_PERSONALIZACAO, lerPersonalizacao } from './recompensas';

export const usePersonalizacao = () => {
  const [personalizacao, setPersonalizacao] = useState(() => lerPersonalizacao());

  useEffect(() => {
    const atualizar = () => setPersonalizacao(lerPersonalizacao());

    window.addEventListener(EVENTO_PERSONALIZACAO, atualizar);
    return () => window.removeEventListener(EVENTO_PERSONALIZACAO, atualizar);
  }, []);

  return personalizacao;
};
