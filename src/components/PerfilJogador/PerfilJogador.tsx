import { FormEvent, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { NavLink } from 'react-router-dom';
import { lerNome, lerQuantidade, salvarNome, salvarQuantidade, TAMANHO_NOME } from '../../services/jogador';
import { useRecompensasNaoVistas } from '../../gamificacao/useRecompensasNaoVistas';
import OpcoesQuantidade from './OpcoesQuantidade';
import './PerfilJogador.css';

interface PerfilJogadorProps {
  primeiraVisita?: boolean;
  onFechar: () => void;
}

function PerfilJogador({ primeiraVisita = false, onFechar }: PerfilJogadorProps) {
  const [nome, setNome] = useState(lerNome);
  const [quantidade, setQuantidade] = useState(lerQuantidade);
  const recompensasNovas = useRecompensasNaoVistas().length;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
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
        <label htmlFor='perfil-nome' className='perfil-modal__rotulo'>Nome</label>
        <input
          ref={inputRef}
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
        <NavLink to='/personalizar' onClick={onFechar} className='perfil-modal__personalizar'>
          🎨 Personalizar robô
          {recompensasNovas > 0 && <span className='perfil-modal__novo'>{recompensasNovas} {recompensasNovas === 1 ? 'novo' : 'novos'}</span>}
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
