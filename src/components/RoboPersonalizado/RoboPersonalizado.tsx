import type { CSSProperties } from 'react';
import { buscarRecompensa, type Personalizacao } from '../../gamificacao/recompensas';
import { usePersonalizacao } from '../../gamificacao/usePersonalizacao';

interface RoboPersonalizadoProps {
  personalizacao?: Personalizacao;
  triste?: boolean;
  titulo?: string;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
}

function RoboPersonalizado({ personalizacao, triste = false, titulo = 'Robô', className, style, onClick }: RoboPersonalizadoProps) {
  const salva = usePersonalizacao();
  const { cor, acessorio } = personalizacao || salva;
  const corRobo = buscarRecompensa(cor)?.valor || '#cccccc';

  return (
    <svg viewBox='0 0 100 100' overflow='visible' role='img' aria-label={titulo || undefined} aria-hidden={titulo ? undefined : true} className={className} style={style} onClick={onClick} data-acessorio={acessorio}>
      {acessorio === 'capa' && <path d='M14 28 L0 100 L100 100 L86 28 Z' fill='#e0586a' stroke='#333' />}
      <rect x='10' y='20' width='80' height='60' fill={corRobo} stroke='#333' />
      <rect x='40' y='5' width='20' height='15' fill={corRobo} stroke='#333' />
      <circle cx='35' cy='45' r='5' fill='#333' />
      <circle cx='65' cy='45' r='5' fill='#333' />
      <path d={triste ? 'M35 70 Q50 60 65 70' : 'M35 65 Q50 75 65 65'} stroke='#333' strokeWidth='4' fill='none' />
      {acessorio === 'oculos' && (
        <g fill='rgba(36, 50, 74, 0.25)' stroke='#333' strokeWidth='3'>
          <circle cx='35' cy='45' r='10' />
          <circle cx='65' cy='45' r='10' />
          <path d='M45 45 H55' />
        </g>
      )}
      {acessorio === 'bone' && (
        <g fill='#2d9cdb' stroke='#333'>
          <path d='M26 22 Q50 -10 74 22 Z' />
          <rect x='62' y='17' width='30' height='6' rx='3' />
        </g>
      )}
      {acessorio === 'cartola' && (
        <g stroke='#333'>
          <rect x='32' y='-12' width='36' height='30' fill='#24324a' />
          <rect x='32' y='8' width='36' height='5' fill='#e0586a' />
          <rect x='22' y='16' width='56' height='6' rx='2' fill='#24324a' />
        </g>
      )}
      {acessorio === 'coroa' && <path d='M28 21 L28 2 L39 12 L50 -4 L61 12 L72 2 L72 21 Z' fill='#f2c94c' stroke='#333' strokeWidth='2' />}
      {acessorio === 'gravata' && (
        <g fill='#e0586a' stroke='#333'>
          <path d='M50 87 L36 80 L36 94 Z M50 87 L64 80 L64 94 Z' />
          <circle cx='50' cy='87' r='3' />
        </g>
      )}
    </svg>
  );
}

export default RoboPersonalizado;
