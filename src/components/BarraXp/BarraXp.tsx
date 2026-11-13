import { useState } from 'react';
import { multiplicadorDeXp } from '../../gamificacao/boosters';
import { lerProgresso } from '../../gamificacao/progresso';
import { calcularNivel, estrelasDoNivel, faixaDoNivel } from '../../gamificacao/xp';
import './BarraXp.css';

interface BarraXpProps {
  xp?: number;
  ganho?: number;
  atalho?: boolean;
  compacta?: boolean;
}

const formatarNumero = (valor: number) => valor.toLocaleString('pt-BR');

function BarraXp({ xp, ganho, atalho = true, compacta = false }: BarraXpProps) {
  const [salvo] = useState(() => lerProgresso());
  const total = xp ?? salvo.xp;
  const atual = calcularNivel(total, salvo.nivelDoTitulo);
  const subiu = ganho !== undefined && atual.nivel > calcularNivel(total - ganho).nivel;
  const percentual = Math.min(atual.xpNoNivel / atual.xpDoNivel, 1);
  const multiplicador = multiplicadorDeXp(salvo);
  const faixa = faixaDoNivel(atual.nivel);
  const estrelas = estrelasDoNivel(atual.nivel);

  return (
    <div className={`barra-xp barra-xp--${faixa.id}${subiu ? ' barra-xp--subiu' : ''}${compacta ? ' barra-xp--compacta' : ''}`}>
      <div className='barra-xp__topo'>
        <span className='barra-xp__nivel' title={`Faixa ${faixa.nome}`} aria-hidden='true'>
          {atual.nivel}
          {estrelas > 0 && <span className='barra-xp__estrelas'>⭐{estrelas}</span>}
        </span>
        <div className='barra-xp__texto'>
          <strong>Nível {atual.nivel} · {atual.titulo}</strong>
          <small>{formatarNumero(atual.xpNoNivel)}/{formatarNumero(atual.xpDoNivel)} XP para o nível {atual.nivel + 1}</small>
        </div>
        {(multiplicador > 1 || ganho !== undefined) && (
          <div className='barra-xp__lado'>
            {multiplicador > 1 && <span className='barra-xp__booster' title='Booster de XP ativo nas partidas de hoje'>⚡ {multiplicador}× XP</span>}
            {ganho !== undefined && <span className='barra-xp__ganho'>+{formatarNumero(ganho)} XP</span>}
          </div>
        )}
      </div>
      <div
        className='barra-xp__barra'
        role='progressbar'
        aria-label='Progresso para o próximo nível'
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(percentual * 100)}
      >
        <span style={{ width: `${percentual * 100}%` }} />
      </div>
      {subiu && <p className='barra-xp__subiu' role='status'>⬆️ Subiu para o nível {atual.nivel}!</p>}
      {atalho && (
        <a className='global-button global-button--basic barra-xp__atalho' href='/personalizar'>
          🎨 Personalizar robô
        </a>
      )}
    </div>
  );
}

export default BarraXp;
