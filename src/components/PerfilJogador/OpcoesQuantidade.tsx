import { QUANTIDADES } from '../../services/jogador';
import './PerfilJogador.css';

interface OpcoesQuantidadeProps {
  valor: number;
  onEscolher: (quantidade: number) => void;
}

function OpcoesQuantidade({ valor, onEscolher }: OpcoesQuantidadeProps) {
  return (
    <div className='opcoes-quantidade' role='group' aria-label='Quantidade de contas'>
      {QUANTIDADES.map((quantidade) => (
        <button
          key={quantidade}
          type='button'
          className={`opcoes-quantidade__opcao${valor === quantidade ? ' opcoes-quantidade__opcao--ativa' : ''}`}
          aria-pressed={valor === quantidade}
          onClick={() => onEscolher(quantidade)}
        >
          {quantidade}
        </button>
      ))}
    </div>
  );
}

export default OpcoesQuantidade;
