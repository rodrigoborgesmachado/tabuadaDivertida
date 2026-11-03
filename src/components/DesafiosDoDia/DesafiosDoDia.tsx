import { useState } from 'react';
import { desafioConcluido, desafioDaSemana, desafioDoDia, valorDesafio, type Desafio } from '../../gamificacao/desafios';
import { lerProgresso } from '../../gamificacao/progresso';
import { jogos } from '../../pages/Jogos/jogosConfig';
import { compartilhar } from '../../services/compartilhar';
import SequenciaDias from '../SequenciaDias/SequenciaDias';
import './DesafiosDoDia.css';

const formatarNumero = (valor: number) => valor.toLocaleString('pt-BR');

interface DesafiosDoDiaProps {
  sequencia?: boolean;
}

function DesafiosDoDia({ sequencia = true }: DesafiosDoDiaProps) {
  const [progresso] = useState(() => lerProgresso());
  const [desafios] = useState(() => [desafioDoDia(), desafioDaSemana()]);

  const handleShare = (desafio: Desafio) => {
    const url = window.location.origin || 'https://www.tabuadadivertida.com';

    compartilhar('Tabuada Divertida', [
      `Concluí o desafio ${desafio.tipo === 'dia' ? 'de hoje' : 'da semana'} do Tabuada Divertida!`,
      `${desafio.icone} ${desafio.texto}`,
      '',
      `Venha jogar também: ${url}`,
    ].join('\n'));
  };

  return (
    <section className='desafios-do-dia'>
      {sequencia && <SequenciaDias />}
      <div className='desafios-do-dia__lista'>
        {desafios.map((desafio) => {
          const concluido = desafioConcluido(progresso, desafio);
          const valor = concluido ? desafio.meta : Math.min(valorDesafio(progresso, desafio), desafio.meta);
          const rotulo = desafio.tipo === 'dia' ? 'Desafio do dia' : 'Desafio da semana';
          const jogo = jogos.find((item) => item.id === desafio.jogo);

          return (
            <div key={desafio.id} className={`desafios-do-dia__card${concluido ? ' desafios-do-dia__card--concluido' : ''}`}>
              <span className='desafios-do-dia__rotulo'>{desafio.tipo === 'dia' ? '🎯' : '🗓️'} {rotulo}</span>
              <p>
                <span aria-hidden='true'>{desafio.icone}</span> {desafio.texto}
              </p>
              <div
                className='desafios-do-dia__barra'
                role='progressbar'
                aria-label={`Progresso do ${rotulo.toLowerCase()}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round((valor / desafio.meta) * 100)}
              >
                <span style={{ width: `${(valor / desafio.meta) * 100}%` }} />
              </div>
              <div className='desafios-do-dia__rodape'>
                <small>{concluido ? '✅ Concluído!' : `${formatarNumero(valor)}/${formatarNumero(desafio.meta)}`}</small>
                {concluido ? (
                  <button type='button' className='global-button global-button--basic' onClick={() => handleShare(desafio)}>
                    Compartilhar
                  </button>
                ) : (
                  <a className='global-button global-button--full-width' href={jogo?.path || '/jogos'}>
                    Jogar desafio
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default DesafiosDoDia;
