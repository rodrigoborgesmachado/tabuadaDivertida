import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import type { Progresso } from '../../gamificacao/progresso';
import { buscarRecompensa, condicaoRecompensa, recompensaLiberada } from '../../gamificacao/recompensas';
import { IconeApp, ICONES_APP, imagemDoAtalho } from '../../services/iconeApp';
import { ehAndroid } from '../../services/plataforma';

export const AVISO_TROCA = 'Ao trocar o ícone, o app pode fechar por um instante e o atalho da tela inicial pode ser recriado. Deseja trocar?';

export const useIconeDoApp = () => {
  const [atual, setAtual] = useState('');
  const [trocaSuportada, setTrocaSuportada] = useState(false);
  const [atalho, setAtalho] = useState({ suportado: false, criado: false });

  useEffect(() => {
    if (!ehAndroid()) {
      return;
    }

    IconeApp.iconeAtual().then(({ icone, suportado }) => {
      setAtual(icone);
      setTrocaSuportada(suportado);
    }).catch(() => {});
    IconeApp.atalho().then(setAtalho).catch(() => {});
  }, []);

  return { atual, setAtual, trocaSuportada, atalho, suportado: trocaSuportada || atalho.suportado };
};

interface IconeDoAppProps {
  progresso: Progresso;
  nivel: number;
  icone: ReturnType<typeof useIconeDoApp>;
}

function IconeDoApp({ progresso, nivel, icone: { atual, setAtual, trocaSuportada, atalho, suportado } }: IconeDoAppProps) {
  const trocar = async (icone: string) => {
    if (icone === atual || !window.confirm(AVISO_TROCA)) {
      return;
    }

    try {
      await IconeApp.trocarIcone({ icone });
      setAtual(icone);
      toast.success('Ícone do app trocado!');
    } catch {
      toast.error('Não foi possível trocar o ícone.');
    }
  };

  const colocarNaTela = async () => {
    try {
      const { sucesso, atualizado } = await IconeApp.criarAtalho({ imagem: await imagemDoAtalho() });
      if (atualizado) {
        toast.success('Atalho atualizado com o seu robô!');
      } else if (!sucesso) {
        toast.error('Não foi possível criar o atalho.');
      }
    } catch {
      toast.error('Não foi possível criar o atalho.');
    }
  };

  if (!suportado) {
    return null;
  }

  return (
    <>
      {trocaSuportada && (
        <section className='personalizar-grupo'>
          <h3>📱 Ícone do app</h3>
          <p className='paragrafo3'>Escolha a cor do robô que aparece na tela inicial do celular. Novos ícones são liberados junto com as cores do robô.</p>
          <div className='personalizar-grid'>
            {ICONES_APP.map((id) => {
              const recompensa = buscarRecompensa(id);
              if (!recompensa) {
                return null;
              }

              const liberada = recompensaLiberada(recompensa, progresso);
              const ativo = atual === id;

              return (
                <button
                  key={id}
                  type='button'
                  className={`personalizar-item${ativo ? ' personalizar-item--ativo' : ''}`}
                  aria-pressed={ativo}
                  disabled={!liberada}
                  onClick={() => trocar(id)}
                >
                  <span className='personalizar-item__icone' style={{ background: recompensa.degrade ? `linear-gradient(135deg, ${recompensa.degrade.join(', ')})` : recompensa.valor }} aria-hidden='true'>
                    {liberada ? '🤖' : '🔒'}
                  </span>
                  <strong>Robô {recompensa.nome}</strong>
                  <small>{ativo ? '✅ Em uso' : !liberada ? condicaoRecompensa(recompensa, nivel) : 'Liberado'}</small>
                </button>
              );
            })}
          </div>
        </section>
      )}
      {atalho.suportado && (
        <section className='personalizar-grupo'>
          <h3>📌 Atalho com o seu robô</h3>
          <p className='paragrafo3'>
            Coloque o seu robô, do jeitinho que você personalizou, na tela inicial. O ícone oficial do app continua lá, e alguns celulares mostram um selinho pequeno do app no canto do atalho.
          </p>
          <button type='button' className='global-button global-button--basic' onClick={colocarNaTela}>
            {atalho.criado ? '🔄 Atualizar meu robô na tela inicial' : '📌 Colocar meu robô na tela inicial'}
          </button>
        </section>
      )}
    </>
  );
}

export default IconeDoApp;
