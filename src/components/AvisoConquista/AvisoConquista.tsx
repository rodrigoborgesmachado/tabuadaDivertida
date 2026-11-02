import { useEffect, useState } from 'react';
import happyRobot from '../../assets/robot-happy.svg';
import type { Desafio } from '../../gamificacao/desafios';
import { nomeNivel } from '../../gamificacao/medalhas';
import { EVENTO_CONQUISTAS, EVENTO_DESAFIOS, type Conquista } from '../../gamificacao/progresso';
import { playConquista } from '../../services/sons';
import './AvisoConquista.css';

const TEMPO_AVISO = 4000;

interface Aviso {
  id: string;
  titulo: string;
  texto: string;
}

const avisoDaConquista = ({ medalha, nivel }: Conquista): Aviso => {
  const nivelTexto = nomeNivel(medalha, nivel);
  return { id: `${medalha.id}-${nivel}`, titulo: 'Nova medalha!', texto: `${medalha.icone} ${medalha.nome}${nivelTexto ? ` · ${nivelTexto}` : ''}` };
};

const avisoDoDesafio = (desafio: Desafio): Aviso => ({
  id: desafio.id,
  titulo: desafio.tipo === 'dia' ? 'Desafio do dia concluído!' : 'Desafio da semana concluído!',
  texto: `${desafio.icone} ${desafio.texto}`,
});

function AvisoConquista() {
  const [fila, setFila] = useState<Aviso[]>([]);

  useEffect(() => {
    const onConquistas = (event: Event) => {
      setFila((atual) => [...atual, ...(event as CustomEvent<Conquista[]>).detail.map(avisoDaConquista)]);
      playConquista();
    };

    const onDesafios = (event: Event) => {
      setFila((atual) => [...atual, ...(event as CustomEvent<Desafio[]>).detail.map(avisoDoDesafio)]);
      playConquista();
    };

    window.addEventListener(EVENTO_CONQUISTAS, onConquistas);
    window.addEventListener(EVENTO_DESAFIOS, onDesafios);
    return () => {
      window.removeEventListener(EVENTO_CONQUISTAS, onConquistas);
      window.removeEventListener(EVENTO_DESAFIOS, onDesafios);
    };
  }, []);

  const aviso = fila[0];

  useEffect(() => {
    if (!aviso) {
      return;
    }

    const timeout = window.setTimeout(() => setFila((atual) => atual.slice(1)), TEMPO_AVISO);
    return () => window.clearTimeout(timeout);
  }, [aviso]);

  if (!aviso) {
    return null;
  }

  return (
    <div key={aviso.id} className='aviso-conquista' role='status' aria-live='polite'>
      <img src={happyRobot} alt='' className='aviso-conquista__robo' />
      <div className='aviso-conquista__texto'>
        <strong>{aviso.titulo}</strong>
        <span>{aviso.texto}</span>
      </div>
    </div>
  );
}

export default AvisoConquista;
