import { useState } from 'react';
import { Link } from 'react-router-dom';
import BarraXp from '../../components/BarraXp/BarraXp';
import RoboPersonalizado from '../../components/RoboPersonalizado/RoboPersonalizado';
import { lerProgresso } from '../../gamificacao/progresso';
import { condicaoRecompensa, recompensaLiberada, recompensas, salvarPersonalizacao, type TipoRecompensa } from '../../gamificacao/recompensas';
import { usePersonalizacao } from '../../gamificacao/usePersonalizacao';
import './Personalizar.css';

const SECOES: { tipo: TipoRecompensa; titulo: string }[] = [
  { tipo: 'cor', titulo: '🎨 Cores do robô' },
  { tipo: 'acessorio', titulo: '🎩 Acessórios' },
  { tipo: 'tema', titulo: '🌈 Temas de cores do site' },
];

function Personalizar() {
  const [progresso] = useState(() => lerProgresso());
  const personalizacao = usePersonalizacao();

  return (
    <div className='center'>
      <div className='global-pageContainer-left options-preview personalizar-page'>
        <h1 className='paragrafo2'>🎨 Personalizar</h1>
        <p className='paragrafo3'>
          Escolha o visual do seu robô e do site. Novos itens são liberados ao subir de nível e conquistar medalhas.
        </p>

        <div className='personalizar-topo'>
          <RoboPersonalizado titulo='Seu robô' className='personalizar-robo' />
          <BarraXp xp={progresso.xp} />
        </div>

        {SECOES.map((secao) => (
          <section key={secao.tipo} className='personalizar-secao'>
            <h2>{secao.titulo}</h2>
            <div className='personalizar-grid'>
              {recompensas.filter((recompensa) => recompensa.tipo === secao.tipo).map((recompensa) => {
                const liberada = recompensaLiberada(recompensa, progresso);
                const ativa = personalizacao[recompensa.tipo] === recompensa.id;

                return (
                  <button
                    key={recompensa.id}
                    type='button'
                    className={`personalizar-item${ativa ? ' personalizar-item--ativo' : ''}`}
                    aria-pressed={ativa}
                    disabled={!liberada}
                    onClick={() => salvarPersonalizacao({ ...personalizacao, [recompensa.tipo]: recompensa.id })}
                  >
                    <span
                      className='personalizar-item__icone'
                      style={recompensa.tipo === 'cor' ? { background: recompensa.valor } : undefined}
                      aria-hidden='true'
                    >
                      {!liberada ? '🔒' : recompensa.tipo === 'cor' ? '' : recompensa.icone}
                    </span>
                    <strong>{recompensa.nome}</strong>
                    <small>{ativa ? '✅ Em uso' : liberada ? 'Liberado' : condicaoRecompensa(recompensa)}</small>
                  </button>
                );
              })}
            </div>
          </section>
        ))}

        <div className='personalizar-toolbar'>
          <Link to='/conquistas' className='global-button'>
            Minhas conquistas
          </Link>
          <Link to='/jogos' className='global-button global-button--back'>
            Ir para os jogos
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Personalizar;
