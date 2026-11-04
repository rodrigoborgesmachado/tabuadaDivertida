import { useSearchParams } from 'react-router-dom';
import Resultados from '../Resultados/Resultados';
import Conquistas from '../Conquistas/Conquistas';
import './Progresso.css';

const ABAS_PROGRESSO = [
  { id: 'resultados', nome: '📊 Resultados' },
  { id: 'conquistas', nome: '🏅 Conquistas' },
];

export const abaDoProgresso = (aba: string | null) => (aba === 'conquistas' ? 'conquistas' : 'resultados');

function Progresso() {
  const [searchParams, setSearchParams] = useSearchParams();
  const abaAtiva = abaDoProgresso(searchParams.get('aba'));

  return (
    <div className='center'>
      <div className='progresso-abas' role='tablist' aria-label='Meu progresso'>
        {ABAS_PROGRESSO.map((aba) => (
          <button
            key={aba.id}
            type='button'
            role='tab'
            aria-selected={abaAtiva === aba.id}
            className={`progresso-aba${abaAtiva === aba.id ? ' progresso-aba--ativa' : ''}`}
            onClick={() => setSearchParams({ aba: aba.id }, { replace: true })}
          >
            {aba.nome}
          </button>
        ))}
      </div>
      <div className='progresso-painel' role='tabpanel'>
        {abaAtiva === 'conquistas' ? <Conquistas /> : <Resultados />}
      </div>
    </div>
  );
}

export default Progresso;
