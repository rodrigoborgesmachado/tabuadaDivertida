import { useState } from 'react';
import { Link } from 'react-router-dom';
import { medalhas, NIVEIS, nomeNivel, type Medalha } from '../../gamificacao/medalhas';
import { lerProgresso, type Progresso } from '../../gamificacao/progresso';
import { compartilhar } from '../../services/compartilhar';
import './Conquistas.css';

const CLASSES_NIVEIS = ['bronze', 'prata', 'ouro', 'diamante'];

const formatarNumero = (valor: number) => valor.toLocaleString('pt-BR');

const formatarData = (data: string) => new Intl.DateTimeFormat('pt-BR').format(new Date(data));

const calcularProgresso = (medalha: Medalha, progresso: Progresso, nivel: number) => {
  const meta = medalha.metas[nivel];
  const valor = medalha.valor(progresso);

  if (medalha.menorMelhor) {
    return {
      percentual: valor > 0 ? Math.min(meta / valor, 1) : 0,
      texto: valor > 0 ? `Melhor média: ${formatarNumero(valor)}s · meta: ${formatarNumero(meta)}s` : `Meta: ${formatarNumero(meta)}s`,
    };
  }

  return {
    percentual: Math.min(valor / meta, 1),
    texto: `${formatarNumero(Math.min(valor, meta))}/${formatarNumero(meta)} ${medalha.unidade}`,
  };
};

function Conquistas() {
  const [progresso] = useState(() => lerProgresso());
  const conquistadas = medalhas.filter((medalha) => progresso.medalhas[medalha.id]).length;

  const handleShare = (medalha: Medalha, nivel: number) => {
    const nivelTexto = nomeNivel(medalha, nivel);
    const url = window.location.origin || 'https://www.tabuadadivertida.com';

    compartilhar('Tabuada Divertida', [
      `Conquistei a medalha ${medalha.icone} ${medalha.nome}${nivelTexto ? ` (${nivelTexto})` : ''} na Tabuada Divertida!`,
      medalha.descricao,
      '',
      `Venha jogar também: ${url}`,
    ].join('\n'));
  };

  return (
    <div className='center'>
      <div className='global-pageContainer-left options-preview conquistas-page'>
        <h1 className='paragrafo2'>🏅 Minhas conquistas</h1>
        <p className='paragrafo3'>
          Você conquistou {conquistadas} de {medalhas.length} medalhas. Continue jogando para liberar todas!
        </p>

        <div className='conquistas-grid'>
          {medalhas.map((medalha) => {
            const obtida = progresso.medalhas[medalha.id];
            const nivel = obtida?.nivel || 0;
            const oculta = medalha.secreta && !obtida;
            const completa = nivel >= medalha.metas.length;
            const classeNivel = obtida ? CLASSES_NIVEIS[medalha.metas.length > 1 ? nivel - 1 : 2] : 'pendente';
            const barra = !oculta && !completa ? calcularProgresso(medalha, progresso, nivel) : null;

            return (
              <div key={medalha.id} className={`conquistas-card conquistas-card--${classeNivel}`}>
                <div className='conquistas-card__topo'>
                  <span className='conquistas-card__icone' aria-hidden='true'>{oculta ? '❓' : medalha.icone}</span>
                  <div>
                    <h2>{oculta ? '???' : medalha.nome}</h2>
                    {obtida && nomeNivel(medalha, nivel) && <span className='conquistas-card__nivel'>{nomeNivel(medalha, nivel)}</span>}
                  </div>
                </div>

                <p>{oculta ? 'Medalha secreta. Continue jogando para descobrir!' : medalha.descricao}</p>

                {!oculta && medalha.metas.length > 1 && (
                  <div className='conquistas-card__niveis'>
                    {NIVEIS.slice(0, medalha.metas.length).map((item, index) => (
                      <span key={item} className={`conquistas-card__etapa${index < nivel ? ` conquistas-card__etapa--${CLASSES_NIVEIS[index]}` : ''}`}>
                        {item}
                      </span>
                    ))}
                  </div>
                )}

                {barra && (
                  <div className='conquistas-card__progresso'>
                    <div
                      className='conquistas-card__barra'
                      role='progressbar'
                      aria-label={`Progresso de ${medalha.nome}`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(barra.percentual * 100)}
                    >
                      <span style={{ width: `${barra.percentual * 100}%` }} />
                    </div>
                    <small>{barra.texto}</small>
                  </div>
                )}

                {obtida && (
                  <div className='conquistas-card__rodape'>
                    <small>Conquistada em {formatarData(obtida.data)}</small>
                    <button type='button' className='global-button global-button--basic' onClick={() => handleShare(medalha, nivel)}>
                      Compartilhar
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className='conquistas-toolbar'>
          <Link to='/jogos' className='global-button'>
            Ir para os jogos
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Conquistas;
