import { useEffect, useState } from 'react';
import happyRobot from '../../assets/robot-happy.svg';
import { nomeNivel } from '../../gamificacao/medalhas';
import { EVENTO_CONQUISTAS, type Conquista } from '../../gamificacao/progresso';
import { playConquista } from '../../services/sons';
import './AvisoConquista.css';

const TEMPO_AVISO = 4000;

function AvisoConquista() {
  const [fila, setFila] = useState<Conquista[]>([]);

  useEffect(() => {
    const onConquistas = (event: Event) => {
      setFila((atual) => [...atual, ...(event as CustomEvent<Conquista[]>).detail]);
      playConquista();
    };

    window.addEventListener(EVENTO_CONQUISTAS, onConquistas);
    return () => window.removeEventListener(EVENTO_CONQUISTAS, onConquistas);
  }, []);

  const conquista = fila[0];

  useEffect(() => {
    if (!conquista) {
      return;
    }

    const timeout = window.setTimeout(() => setFila((atual) => atual.slice(1)), TEMPO_AVISO);
    return () => window.clearTimeout(timeout);
  }, [conquista]);

  if (!conquista) {
    return null;
  }

  const { medalha, nivel } = conquista;
  const nivelTexto = nomeNivel(medalha, nivel);

  return (
    <div key={`${medalha.id}-${nivel}`} className='aviso-conquista' role='status' aria-live='polite'>
      <img src={happyRobot} alt='' className='aviso-conquista__robo' />
      <div className='aviso-conquista__texto'>
        <strong>Nova medalha!</strong>
        <span>{medalha.icone} {medalha.nome}{nivelTexto && ` · ${nivelTexto}`}</span>
      </div>
    </div>
  );
}

export default AvisoConquista;
