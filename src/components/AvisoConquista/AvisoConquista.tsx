import { useEffect, useState } from 'react';
import type { Desafio } from '../../gamificacao/desafios';
import { nomeNivel } from '../../gamificacao/medalhas';
import { EVENTO_CONQUISTAS, EVENTO_DESAFIOS, EVENTO_NIVEL, lerProgresso, type Conquista } from '../../gamificacao/progresso';
import { recompensasLiberadas, type Recompensa } from '../../gamificacao/recompensas';
import type { NivelXp } from '../../gamificacao/xp';
import { playConquista } from '../../services/sons';
import RoboPersonalizado from '../RoboPersonalizado/RoboPersonalizado';
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

const avisoDoNivel = ({ nivel, titulo }: NivelXp): Aviso => ({
  id: `nivel-${nivel}`,
  titulo: 'Subiu de nível!',
  texto: `⬆️ Nível ${nivel} · ${titulo}`,
});

const avisoDaRecompensa = (recompensa: Recompensa): Aviso => ({
  id: `recompensa-${recompensa.id}`,
  titulo: recompensa.tipo === 'tema' ? 'Novo tema liberado!' : 'Novo item para o seu robô!',
  texto: `${recompensa.icone} ${recompensa.nome}`,
});

function AvisoConquista() {
  const [fila, setFila] = useState<Aviso[]>([]);

  useEffect(() => {
    const liberadas = new Set(recompensasLiberadas(lerProgresso()).map((recompensa) => recompensa.id));

    const verificarRecompensas = () => window.setTimeout(() => {
      const novas = recompensasLiberadas(lerProgresso()).filter((recompensa) => !liberadas.has(recompensa.id));
      novas.forEach((recompensa) => liberadas.add(recompensa.id));

      if (novas.length > 0) {
        setFila((atual) => [...atual, ...novas.map(avisoDaRecompensa)]);
      }
    });

    const onConquistas = (event: Event) => {
      setFila((atual) => [...atual, ...(event as CustomEvent<Conquista[]>).detail.map(avisoDaConquista)]);
      playConquista();
      verificarRecompensas();
    };

    const onDesafios = (event: Event) => {
      setFila((atual) => [...atual, ...(event as CustomEvent<Desafio[]>).detail.map(avisoDoDesafio)]);
      playConquista();
    };

    const onNivel = (event: Event) => {
      setFila((atual) => [...atual, avisoDoNivel((event as CustomEvent<NivelXp>).detail)]);
      playConquista();
      verificarRecompensas();
    };

    window.addEventListener(EVENTO_CONQUISTAS, onConquistas);
    window.addEventListener(EVENTO_DESAFIOS, onDesafios);
    window.addEventListener(EVENTO_NIVEL, onNivel);
    return () => {
      window.removeEventListener(EVENTO_CONQUISTAS, onConquistas);
      window.removeEventListener(EVENTO_DESAFIOS, onDesafios);
      window.removeEventListener(EVENTO_NIVEL, onNivel);
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
      <RoboPersonalizado titulo='' className='aviso-conquista__robo' />
      <div className='aviso-conquista__texto'>
        <strong>{aviso.titulo}</strong>
        <span>{aviso.texto}</span>
      </div>
    </div>
  );
}

export default AvisoConquista;
