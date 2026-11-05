import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BarraXp from '../../components/BarraXp/BarraXp';
import RoboPersonalizado from '../../components/RoboPersonalizado/RoboPersonalizado';
import { lerProgresso } from '../../gamificacao/progresso';
import {
  chaveDaRecompensa,
  condicaoRecompensa,
  ESPACOS,
  marcarRecompensasVistas,
  proximaRecompensa,
  RARIDADES,
  recompensaLiberada,
  recompensas,
  recompensasNaoVistas,
  salvarPersonalizacao,
  sortearPersonalizacao,
  type Espaco,
  type Recompensa,
  type TipoRecompensa,
} from '../../gamificacao/recompensas';
import { usePersonalizacao } from '../../gamificacao/usePersonalizacao';
import { useRecompensasNaoVistas } from '../../gamificacao/useRecompensasNaoVistas';
import { calcularNivel } from '../../gamificacao/xp';
import IconeDoApp from './IconeDoApp';
import './Personalizar.css';

const ABAS: { tipo: TipoRecompensa; titulo: string }[] = [
  { tipo: 'cor', titulo: '🎨 Cores' },
  { tipo: 'acessorio', titulo: '🎩 Acessórios' },
  { tipo: 'tema', titulo: '🌈 Temas' },
];

const formatarNumero = (valor: number) => valor.toLocaleString('pt-BR');

function Personalizar() {
  const [progresso] = useState(() => lerProgresso());
  const personalizacao = usePersonalizacao();
  const [novas] = useState(() => recompensasNaoVistas(progresso).map((recompensa) => recompensa.id));
  const [aba, setAba] = useState<TipoRecompensa>(() => ABAS.find((item) => recompensas.some((recompensa) => recompensa.tipo === item.tipo && novas.includes(recompensa.id)))?.tipo || 'cor');
  const naoVistas = useRecompensasNaoVistas();
  const nivel = calcularNivel(progresso.xp).nivel;
  const proxima = proximaRecompensa(progresso);

  useEffect(() => {
    marcarRecompensasVistas(progresso, aba);
  }, [progresso, aba]);

  const renderNovo = (itens: Recompensa[]) => itens.some((recompensa) => novas.includes(recompensa.id)) && <span className='personalizar-novo'>✨ Novo</span>;

  const renderItem = (recompensa: Recompensa) => {
    const liberada = recompensaLiberada(recompensa, progresso);
    const chave = chaveDaRecompensa(recompensa);
    const ativa = personalizacao[chave] === recompensa.id;

    return (
      <button
        key={recompensa.id}
        type='button'
        className={`personalizar-item${ativa ? ' personalizar-item--ativo' : ''}${recompensa.raridade ? ` personalizar-item--${recompensa.raridade}` : ''}`}
        aria-pressed={ativa}
        disabled={!liberada}
        onClick={() => salvarPersonalizacao({ ...personalizacao, [chave]: ativa && recompensa.espaco ? '' : recompensa.id })}
      >
        <span
          className={`personalizar-item__icone${recompensa.tipo === 'tema' && recompensa.valor ? ' personalizar-item__icone--tema' : ''}`}
          style={recompensa.tipo === 'cor' ? { background: recompensa.degrade ? `linear-gradient(135deg, ${recompensa.degrade.join(', ')})` : recompensa.valor } : undefined}
          data-cor={recompensa.tipo === 'tema' ? recompensa.valor : undefined}
          aria-hidden='true'
        >
          {!liberada ? '🔒' : recompensa.tipo === 'cor' ? '' : recompensa.icone}
        </span>
        <strong>{recompensa.nome}</strong>
        <small>{ativa ? '✅ Em uso' : !liberada ? condicaoRecompensa(recompensa, nivel) : novas.includes(recompensa.id) ? '✨ Novo!' : 'Liberado'}</small>
      </button>
    );
  };

  const renderEspaco = (espaco: Espaco) => {
    const itens = recompensas.filter((recompensa) => recompensa.espaco === espaco);

    return (
      <section key={espaco} className='personalizar-grupo'>
        <h3>{ESPACOS.find((item) => item.id === espaco)?.nome}{renderNovo(itens)}</h3>
        <div className='personalizar-grid'>
          <button
            type='button'
            className={`personalizar-item${!personalizacao[espaco] ? ' personalizar-item--ativo' : ''}`}
            aria-pressed={!personalizacao[espaco]}
            onClick={() => salvarPersonalizacao({ ...personalizacao, [espaco]: '' })}
          >
            <span className='personalizar-item__icone' aria-hidden='true'>🚫</span>
            <strong>Nenhum</strong>
            <small>{!personalizacao[espaco] ? '✅ Em uso' : 'Tirar'}</small>
          </button>
          {itens.map(renderItem)}
        </div>
      </section>
    );
  };

  return (
    <div className='center'>
      <div className='global-pageContainer-left options-preview personalizar-page'>
        <h1 className='paragrafo2'>🎨 Personalizar</h1>
        <p className='paragrafo3'>
          Escolha o visual do seu robô e do site. Novos itens são liberados ao subir de nível e conquistar medalhas.
        </p>

        <div className='personalizar-topo'>
          <RoboPersonalizado titulo='Seu robô' className='personalizar-robo' />
          <div className='personalizar-resumo'>
            <BarraXp xp={progresso.xp} atalho={false} />
            {proxima && (
              <p className='personalizar-proxima'>
                Faltam {formatarNumero(proxima.xpFaltando)} XP para o {proxima.recompensa.icone} {proxima.recompensa.nome}
              </p>
            )}
            <button type='button' className='global-button global-button--basic' onClick={() => salvarPersonalizacao(sortearPersonalizacao(personalizacao, progresso))}>
              🎲 Aleatório
            </button>
          </div>
        </div>

        <div className='personalizar-abas' role='tablist' aria-label='Tipos de itens'>
          {ABAS.map((item) => {
            const quantidade = naoVistas.filter((recompensa) => recompensa.tipo === item.tipo).length;

            return (
              <button
                key={item.tipo}
                type='button'
                role='tab'
                className={`personalizar-aba${aba === item.tipo ? ' personalizar-aba--ativa' : ''}`}
                aria-selected={aba === item.tipo}
                aria-label={quantidade > 0 ? `${item.titulo}, ${quantidade} ${quantidade === 1 ? 'item novo' : 'itens novos'}` : undefined}
                onClick={() => setAba(item.tipo)}
              >
                {item.titulo}
                {quantidade > 0 && <span className='personalizar-novo' aria-hidden='true'>✨ {quantidade}</span>}
              </button>
            );
          })}
        </div>

        <section className='personalizar-secao' role='tabpanel'>
          {aba === 'cor' && RARIDADES.map((raridade) => {
            const itens = recompensas.filter((recompensa) => recompensa.tipo === 'cor' && recompensa.raridade === raridade.id);

            return (
              <section key={raridade.id} className='personalizar-grupo'>
                <h3 className={`personalizar-raridade personalizar-raridade--${raridade.id}`}>{raridade.nome}{renderNovo(itens)}</h3>
                <div className='personalizar-grid'>
                  {itens.map(renderItem)}
                </div>
              </section>
            );
          })}
          {aba === 'acessorio' && ESPACOS.map((espaco) => renderEspaco(espaco.id))}
          {aba === 'tema' && (
            <div className='personalizar-grid'>
              {recompensas.filter((recompensa) => recompensa.tipo === 'tema').map(renderItem)}
            </div>
          )}
        </section>

        <IconeDoApp progresso={progresso} nivel={nivel} />

        <div className='personalizar-toolbar'>
          <Link to='/progresso?aba=conquistas' className='global-button'>
            Minhas conquistas
          </Link>
          <Link to='/#jogos' className='global-button global-button--back'>
            Ir para os jogos
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Personalizar;
