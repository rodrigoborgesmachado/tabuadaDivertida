import { FormEvent, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { NavLink } from 'react-router-dom';
import { toast } from 'react-toastify';
import { lerNome, lerQuantidade, salvarNome, salvarQuantidade, TAMANHO_NOME } from '../../services/jogador';
import { ativarLembrete, desativarLembrete, lerLembrete } from '../../services/lembretes';
import { ehApp } from '../../services/plataforma';
import { useRecompensasNaoVistas } from '../../gamificacao/useRecompensasNaoVistas';
import { useMedalhasObtidas } from '../../gamificacao/useMedalhasObtidas';
import { useSom } from '../../services/sons';
import RoboPersonalizado from '../RoboPersonalizado/RoboPersonalizado';
import ThemeSwitcher from '../ThemeSwitcher/themeSwitcher';
import { useTema } from '../ThemeSwitcher/temaContext';
import OpcoesQuantidade from './OpcoesQuantidade';
import './PerfilJogador.css';

interface PerfilJogadorProps {
  primeiraVisita?: boolean;
  onFechar: () => void;
}

function PerfilJogador({ primeiraVisita = false, onFechar }: PerfilJogadorProps) {
  const [nome, setNome] = useState(lerNome);
  const [quantidade, setQuantidade] = useState(lerQuantidade);
  const [lembrete] = useState(lerLembrete);
  const [lembreteAtivo, setLembreteAtivo] = useState(lembrete.ativo);
  const [horaLembrete, setHoraLembrete] = useState(lembrete.hora);
  const recompensasNovas = useRecompensasNaoVistas().length;
  const { theme, toggleTheme } = useTema();
  const { obtidas, total } = useMedalhasObtidas();
  const { mudo, alternarSom } = useSom();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onFechar();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onFechar]);

  const salvar = (event: FormEvent) => {
    event.preventDefault();
    salvarNome(nome);
    salvarQuantidade(quantidade);
    if (!lembreteAtivo && lembrete.ativo) {
      desativarLembrete(horaLembrete);
    } else if (lembreteAtivo && (!lembrete.ativo || horaLembrete !== lembrete.hora)) {
      ativarLembrete(horaLembrete).then((ativo) => {
        if (!ativo) {
          toast.info('Para receber o lembrete, permita as notificações do app nas configurações do celular.', { autoClose: 5000 });
        }
      });
    }
    onFechar();
  };

  return createPortal(
    <div className='perfil-modal' onClick={onFechar}>
      <form
        className='perfil-modal__conteudo'
        role='dialog'
        aria-modal='true'
        aria-labelledby='perfil-modal-titulo'
        onClick={(event) => event.stopPropagation()}
        onSubmit={salvar}
      >
        <h3 id='perfil-modal-titulo'>Meu perfil</h3>
        {primeiraVisita && <p className='perfil-modal__texto'>Como você quer ser chamado? Dá para mudar quando quiser.</p>}
        <section className='perfil-modal__secao' aria-labelledby='perfil-secao-jogador'>
          <h4 id='perfil-secao-jogador'>Jogador</h4>
          <label htmlFor='perfil-nome' className='perfil-modal__rotulo'>Nome</label>
          <input
            id='perfil-nome'
            type='text'
            className='global-input'
            value={nome}
            maxLength={TAMANHO_NOME}
            placeholder='Jogador'
            onChange={(event) => setNome(event.target.value)}
          />
          <span className='perfil-modal__rotulo'>Quantidade de contas padrão</span>
          <OpcoesQuantidade valor={quantidade} onEscolher={setQuantidade} />
        </section>
        <section className='perfil-modal__secao perfil-modal__secao--linha' aria-labelledby='perfil-secao-aparencia'>
          <h4 id='perfil-secao-aparencia'>Aparência</h4>
          <span className='perfil-modal__valor'>{theme === 'dark' ? 'Escuro' : 'Claro'}</span>
          <ThemeSwitcher theme={theme} toggleTheme={toggleTheme} />
        </section>
        <section className='perfil-modal__secao perfil-modal__secao--linha' aria-labelledby='perfil-secao-som'>
          <h4 id='perfil-secao-som'>Som</h4>
          <div className='opcoes-quantidade perfil-modal__som' role='group' aria-label='Som'>
            {[false, true].map((opcao) => (
              <button
                key={String(opcao)}
                type='button'
                className={`opcoes-quantidade__opcao${mudo === opcao ? ' opcoes-quantidade__opcao--ativa' : ''}`}
                aria-pressed={mudo === opcao}
                onClick={() => mudo !== opcao && alternarSom()}
              >
                {opcao ? '🔇 Desligado' : '🔊 Ligado'}
              </button>
            ))}
          </div>
        </section>
        {ehApp() && (
          <section className='perfil-modal__secao perfil-modal__secao--linha' aria-labelledby='perfil-secao-lembrete'>
            <h4 id='perfil-secao-lembrete'>Lembrete diário</h4>
            <div className='opcoes-quantidade perfil-modal__lembrete' role='group' aria-label='Lembrete diário'>
              {[true, false].map((opcao) => (
                <button
                  key={String(opcao)}
                  type='button'
                  className={`opcoes-quantidade__opcao${lembreteAtivo === opcao ? ' opcoes-quantidade__opcao--ativa' : ''}`}
                  aria-pressed={lembreteAtivo === opcao}
                  onClick={() => setLembreteAtivo(opcao)}
                >
                  {opcao ? '🔔 Ligado' : '🔕 Desligado'}
                </button>
              ))}
            </div>
            {lembreteAtivo && (
              <>
                <label htmlFor='perfil-lembrete-hora' className='perfil-modal__valor'>Horário</label>
                <input
                  id='perfil-lembrete-hora'
                  type='time'
                  className='global-input perfil-modal__hora'
                  value={horaLembrete}
                  onChange={(event) => event.target.value && setHoraLembrete(event.target.value)}
                />
              </>
            )}
          </section>
        )}
        <NavLink to='/personalizar' onClick={onFechar} className='perfil-modal__personalizar'>
          <RoboPersonalizado titulo='' className='perfil-modal__personalizar-robo' />
          <span className='perfil-modal__personalizar-texto'>
            <strong>Personalizar robô</strong>
            <small>Cores, acessórios e temas</small>
          </span>
          {recompensasNovas > 0 && <span className='perfil-modal__novo'>{recompensasNovas} {recompensasNovas === 1 ? 'novo' : 'novos'}</span>}
          <span className='perfil-modal__seta' aria-hidden='true'>›</span>
        </NavLink>
        <NavLink to='/progresso?aba=conquistas' onClick={onFechar} className='perfil-modal__personalizar'>
          <span className='perfil-modal__personalizar-icone' aria-hidden='true'>🏅</span>
          <span className='perfil-modal__personalizar-texto'>
            <strong>Minhas conquistas</strong>
            <small>{obtidas} de {total} medalhas</small>
          </span>
          <span className='perfil-modal__seta' aria-hidden='true'>›</span>
        </NavLink>
        <div className='perfil-modal__acoes'>
          <button type='submit' className='global-button'>Salvar</button>
          <button type='button' className='global-button global-button--basic' onClick={onFechar}>
            {primeiraVisita ? 'Agora não' : 'Cancelar'}
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
}

export default PerfilJogador;
