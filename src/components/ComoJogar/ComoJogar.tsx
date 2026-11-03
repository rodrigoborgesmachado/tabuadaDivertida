import { jogos } from '../../pages/Jogos/jogosConfig';
import './ComoJogar.css';

interface ComoJogarProps {
  jogo: string;
}

function ComoJogar({ jogo }: ComoJogarProps) {
  const passos = jogos.find((item) => item.id === jogo)?.comoJogar || [];

  return (
    <details className='como-jogar'>
      <summary>🤔 Como jogar</summary>
      <ol>
        {passos.map((passo) => (
          <li key={passo}>{passo}</li>
        ))}
      </ol>
    </details>
  );
}

export default ComoJogar;
