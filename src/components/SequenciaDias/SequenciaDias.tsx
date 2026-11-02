import { useState } from 'react';
import { lerProgresso } from '../../gamificacao/progresso';
import { diasSeguidosAtuais } from '../../gamificacao/sequenciaDias';
import './SequenciaDias.css';

const plural = (valor: number, singular: string, varios: string) => `${valor} ${valor === 1 ? singular : varios}`;

function SequenciaDias() {
  const [progresso] = useState(() => lerProgresso());
  const dias = diasSeguidosAtuais(progresso);

  return (
    <div className='sequencia-dias'>
      <span className={`sequencia-dias__fogo${dias === 0 ? ' sequencia-dias__fogo--apagado' : ''}`} aria-hidden='true'>🔥</span>
      <div className='sequencia-dias__texto'>
        <strong>{dias === 0 ? 'Jogue hoje para acender o foguinho!' : plural(dias, 'dia seguido', 'dias seguidos')}</strong>
        <small>
          Recorde: {plural(progresso.melhorDiasSeguidos, 'dia', 'dias')}
          {dias > 0 && ` · 🛟 ${plural(progresso.folgas, 'folga', 'folgas')}`}
        </small>
      </div>
    </div>
  );
}

export default SequenciaDias;
