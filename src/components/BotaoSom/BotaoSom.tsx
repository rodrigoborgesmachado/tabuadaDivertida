import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVolumeHigh, faVolumeXmark } from '@fortawesome/free-solid-svg-icons';
import { useSom } from '../../services/sons';
import './BotaoSom.css';

function BotaoSom() {
  const { mudo, alternarSom } = useSom();
  const texto = mudo ? 'Ativar som' : 'Silenciar som';

  return (
    <button type='button' className='button-base botao-som' onClick={alternarSom} aria-label={texto} title={texto}>
      <FontAwesomeIcon icon={mudo ? faVolumeXmark : faVolumeHigh} />
    </button>
  );
}

export default BotaoSom;
