import { useState } from 'react';
import type { Progresso } from '../../gamificacao/progresso';
import { ativarLembrete, concluiuDesafioDoDia, lerLembrete, salvarLembrete } from '../../services/lembretes';
import { ehApp } from '../../services/plataforma';
import './PerguntaLembrete.css';

interface PerguntaLembreteProps {
  progresso: Progresso;
}

function PerguntaLembrete({ progresso }: PerguntaLembreteProps) {
  const [lembrete] = useState(lerLembrete);
  const [visivel, setVisivel] = useState(() => ehApp() && !lembrete.perguntado && concluiuDesafioDoDia(progresso));
  const [ativado, setAtivado] = useState(false);

  if (ativado) {
    return (
      <p className='pergunta-lembrete' role='status'>
        🔔 Combinado! Vamos lembrar você todo dia às {lembrete.hora}. Dá para mudar em "Meu perfil".
      </p>
    );
  }

  if (!visivel) {
    return null;
  }

  const ativar = async () => {
    setVisivel(false);
    setAtivado(await ativarLembrete(lembrete.hora));
  };

  const recusar = () => {
    salvarLembrete({ ...lembrete, ativo: false, perguntado: true });
    setVisivel(false);
  };

  return (
    <div className='pergunta-lembrete'>
      <p>Quer um lembrete diário para não perder sua sequência? 🔥</p>
      <div className='pergunta-lembrete__acoes'>
        <button type='button' className='global-button' onClick={ativar}>🔔 Quero</button>
        <button type='button' className='global-button global-button--basic' onClick={recusar}>Agora não</button>
      </div>
    </div>
  );
}

export default PerguntaLembrete;
