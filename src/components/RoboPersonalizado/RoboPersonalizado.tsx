import { useId, type CSSProperties, type ReactNode } from 'react';
import { buscarRecompensa, ESPACOS, type Personalizacao } from '../../gamificacao/recompensas';
import { usePersonalizacao } from '../../gamificacao/usePersonalizacao';
import './RoboPersonalizado.css';

interface RoboPersonalizadoProps {
  personalizacao?: Personalizacao;
  triste?: boolean;
  titulo?: string;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
}

const costas: Record<string, ReactNode> = {
  capa: <path d='M14 28 L0 100 L100 100 L86 28 Z' fill='#e0586a' stroke='#333' />,
  'capa-mago': (
    <g stroke='#333'>
      <path d='M14 26 L2 102 L98 102 L86 26 Z' fill='#5b3fa6' />
      <path d='M8 92 l2 -4 l2 4 l-4 -2.5 h4 Z M90 88 l2 -4 l2 4 l-4 -2.5 h4 Z' fill='#f2c94c' strokeWidth='0.5' />
    </g>
  ),
  mochila: (
    <g stroke='#333'>
      <rect x='-4' y='30' width='18' height='42' rx='5' fill='#8a5a3c' />
      <rect x='-2' y='50' width='10' height='14' rx='3' fill='#a8734f' />
    </g>
  ),
  'asas-anjo': (
    <g fill='#ffffff' stroke='#333'>
      <path d='M14 30 Q-20 8 -16 48 Q-4 42 14 52 Z' />
      <path d='M86 30 Q120 8 116 48 Q104 42 86 52 Z' />
    </g>
  ),
  'asas-borboleta': (
    <g fill='#ff9ad5' stroke='#333' opacity='0.9'>
      <path d='M14 30 Q-22 -4 -16 30 Q-22 56 14 54 Z' />
      <path d='M86 30 Q122 -4 116 30 Q122 56 86 54 Z' />
    </g>
  ),
  jato: (
    <g stroke='#333'>
      <path d='M2 62 L6 78 L10 62 Z M90 62 L94 78 L98 62 Z' fill='#ff9f43' />
      <rect x='0' y='30' width='12' height='32' rx='5' fill='#9aa5b1' />
      <rect x='88' y='30' width='12' height='32' rx='5' fill='#9aa5b1' />
    </g>
  ),
};

const rosto: Record<string, ReactNode> = {
  oculos: (
    <g fill='rgba(36, 50, 74, 0.25)' stroke='#333' strokeWidth='3'>
      <circle cx='35' cy='45' r='10' />
      <circle cx='65' cy='45' r='10' />
      <path d='M45 45 H55' />
    </g>
  ),
  'oculos-escuros': (
    <g fill='#222' stroke='#333' strokeWidth='2'>
      <rect x='23' y='38' width='24' height='14' rx='4' />
      <rect x='53' y='38' width='24' height='14' rx='4' />
      <path d='M47 43 H53' />
    </g>
  ),
  'oculos-laboratorio': (
    <g stroke='#333' strokeWidth='2'>
      <path d='M10 45 H22 M78 45 H90' strokeWidth='4' />
      <rect x='22' y='35' width='56' height='20' rx='10' fill='rgba(140, 220, 255, 0.4)' />
    </g>
  ),
  bigode: <path d='M50 58 Q40 51 31 60 Q40 64 50 60 Q60 64 69 60 Q60 51 50 58 Z' fill='#6b4226' stroke='#333' />,
  monoculo: (
    <g fill='none' stroke='#c9931e'>
      <circle cx='65' cy='45' r='10' strokeWidth='3' fill='rgba(255, 255, 255, 0.2)' />
      <path d='M74 50 Q80 62 72 74' strokeWidth='1.5' />
    </g>
  ),
  'mascara-heroi': (
    <path
      d='M16 38 Q50 32 84 38 L84 53 Q50 47 16 53 Z M28 45 a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0 Z M58 45 a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0 Z'
      fillRule='evenodd'
      fill='#e0586a'
      stroke='#333'
    />
  ),
  'tapa-olho': (
    <g stroke='#333'>
      <path d='M12 36 L88 30' strokeWidth='2.5' />
      <circle cx='35' cy='45' r='9' fill='#222' />
    </g>
  ),
};

const cabeca: Record<string, ReactNode> = {
  bone: (
    <g fill='#2d9cdb' stroke='#333'>
      <path d='M26 22 Q50 -10 74 22 Z' />
      <rect x='62' y='17' width='30' height='6' rx='3' />
    </g>
  ),
  cartola: (
    <g stroke='#333'>
      <rect x='32' y='-12' width='36' height='30' fill='#24324a' />
      <rect x='32' y='8' width='36' height='5' fill='#e0586a' />
      <rect x='22' y='16' width='56' height='6' rx='2' fill='#24324a' />
    </g>
  ),
  coroa: <path d='M28 21 L28 2 L39 12 L50 -4 L61 12 L72 2 L72 21 Z' fill='#f2c94c' stroke='#333' strokeWidth='2' />,
  fones: (
    <g stroke='#333'>
      <path d='M14 30 Q14 -8 50 -8 Q86 -8 86 30' fill='none' strokeWidth='4' />
      <rect x='6' y='24' width='12' height='20' rx='5' fill='#e0586a' />
      <rect x='82' y='24' width='12' height='20' rx='5' fill='#e0586a' />
    </g>
  ),
  'antena-coracao': (
    <g stroke='#333'>
      <path d='M50 5 V-6' strokeWidth='2' />
      <path d='M50 -6 C38 -14 40 -26 50 -19 C60 -26 62 -14 50 -6 Z' fill='#ff5c8a' />
    </g>
  ),
  'chapeu-cowboy': (
    <g fill='#a0652f' stroke='#333'>
      <path d='M32 18 Q30 -6 50 -2 Q70 -6 68 18 Z' />
      <ellipse cx='50' cy='19' rx='40' ry='6' />
    </g>
  ),
  'chapeu-mago': (
    <g stroke='#333'>
      <path d='M28 20 L50 -28 L72 20 Z' fill='#4a5fc1' />
      <circle cx='46' cy='2' r='2.5' fill='#f2c94c' />
      <circle cx='56' cy='-10' r='2' fill='#f2c94c' />
      <rect x='20' y='16' width='60' height='6' rx='3' fill='#4a5fc1' />
    </g>
  ),
  gorro: (
    <g stroke='#333'>
      <path d='M28 22 Q28 -6 50 -6 Q72 -6 72 22 Z' fill='#e0586a' />
      <rect x='26' y='14' width='48' height='9' rx='4' fill='#ffffff' />
      <circle cx='50' cy='-8' r='6' fill='#ffffff' />
    </g>
  ),
  'chapeu-pirata': (
    <g stroke='#333'>
      <path d='M16 21 Q50 -22 84 21 Q50 11 16 21 Z' fill='#24324a' />
      <circle cx='50' cy='6' r='4' fill='#ffffff' />
    </g>
  ),
  'tiara-flores': (
    <g stroke='#333'>
      <path d='M24 20 Q50 4 76 20' fill='none' stroke='#4f9d69' strokeWidth='3' />
      <circle cx='30' cy='15' r='5' fill='#ff9ad5' />
      <circle cx='42' cy='10' r='5' fill='#f4e66b' />
      <circle cx='58' cy='10' r='5' fill='#ff9ad5' />
      <circle cx='70' cy='15' r='5' fill='#f4e66b' />
    </g>
  ),
  'capacete-astronauta': (
    <g stroke='#333'>
      <path d='M20 22 Q20 -22 50 -22 Q80 -22 80 22 Z' fill='rgba(180, 220, 255, 0.45)' />
      <rect x='18' y='17' width='64' height='6' rx='3' fill='#ffffff' />
    </g>
  ),
  'chapeu-chef': (
    <g fill='#ffffff' stroke='#333'>
      <path d='M32 21 L32 4 Q22 0 28 -10 Q34 -22 50 -16 Q66 -22 72 -10 Q78 0 68 4 L68 21 Z' />
      <path d='M32 14 H68' />
    </g>
  ),
  aureola: <ellipse cx='50' cy='-8' rx='18' ry='5' fill='none' stroke='#f2c94c' strokeWidth='4' />,
  'chifres-unicornio': (
    <g stroke='#333'>
      <path d='M43 6 L50 -26 L57 6 Z' fill='#f7d6ff' />
      <path d='M45 -2 L55 -6 M46 -10 L54 -13' stroke='#c58ce0' strokeWidth='2' />
    </g>
  ),
  'chapeu-formatura': (
    <g stroke='#333'>
      <rect x='36' y='6' width='28' height='14' fill='#24324a' />
      <path d='M16 4 L50 -8 L84 4 L50 16 Z' fill='#24324a' />
      <path d='M50 4 L78 7 V20' fill='none' stroke='#f2c94c' strokeWidth='2' />
    </g>
  ),
};

const pescoco: Record<string, ReactNode> = {
  gravata: (
    <g fill='#e0586a' stroke='#333'>
      <path d='M50 87 L36 80 L36 94 Z M50 87 L64 80 L64 94 Z' />
      <circle cx='50' cy='87' r='3' />
    </g>
  ),
  'gravata-social': (
    <g fill='#2d6cdb' stroke='#333'>
      <path d='M45 80 L55 80 L53 86 L47 86 Z' />
      <path d='M47 86 L53 86 L57 100 L50 106 L43 100 Z' />
    </g>
  ),
  lenco: (
    <g stroke='#333'>
      <path d='M30 80 L70 80 L50 98 Z' fill='#e0586a' />
      <circle cx='44' cy='85' r='1.5' fill='#ffffff' />
      <circle cx='56' cy='85' r='1.5' fill='#ffffff' />
      <circle cx='50' cy='91' r='1.5' fill='#ffffff' />
    </g>
  ),
  cachecol: (
    <g fill='#2d9cdb' stroke='#333'>
      <rect x='20' y='77' width='60' height='9' rx='4' />
      <rect x='58' y='84' width='9' height='18' rx='2' />
      <path d='M30 77 V86 M40 77 V86 M50 77 V86' stroke='#ffffff' strokeWidth='2' />
    </g>
  ),
  'colar-perolas': (
    <g fill='#fffdf5' stroke='#999'>
      {[[30, 83], [37, 88], [43, 91], [50, 92], [57, 91], [63, 88], [70, 83]].map(([x, y]) => <circle key={x} cx={x} cy={y} r='3' />)}
    </g>
  ),
  'medalha-ouro': (
    <g stroke='#333'>
      <path d='M40 78 L50 90 L60 78' fill='none' stroke='#e0586a' strokeWidth='4' />
      <circle cx='50' cy='93' r='7' fill='#f2c94c' />
    </g>
  ),
};

const mao: Record<string, ReactNode> = {
  lapis: (
    <g stroke='#333'>
      <rect x='104' y='60' width='8' height='30' fill='#f4c542' />
      <path d='M104 90 L112 90 L108 100 Z' fill='#f5d6a8' />
    </g>
  ),
  regua: (
    <g stroke='#333'>
      <rect x='102' y='60' width='9' height='42' fill='#f2c94c' />
      <path d='M102 66 h4 M102 72 h4 M102 78 h4 M102 84 h4 M102 90 h4 M102 96 h4' />
    </g>
  ),
  varinha: (
    <g stroke='#333'>
      <path d='M102 92 L116 66' strokeWidth='3' />
      <path d='M117 60 l2 4 l4 1 l-3 3 l1 4 l-4 -2 l-4 2 l1 -4 l-3 -3 l4 -1 Z' fill='#f2c94c' />
    </g>
  ),
  balao: (
    <g stroke='#333'>
      <path d='M103 84 Q112 80 112 72' fill='none' />
      <ellipse cx='112' cy='64' rx='8' ry='9' fill='#ff5c8a' />
    </g>
  ),
  guitarra: (
    <g stroke='#333'>
      <rect x='106' y='60' width='4' height='26' fill='#6b4226' />
      <circle cx='108' cy='92' r='9' fill='#e0586a' />
      <circle cx='108' cy='92' r='2.5' fill='#333' />
    </g>
  ),
  calculadora: (
    <g stroke='#333'>
      <rect x='100' y='66' width='20' height='28' rx='3' fill='#7a7f87' />
      <rect x='103' y='69' width='14' height='7' fill='#b8ffd9' />
      <path d='M104 81 h3 M109 81 h3 M114 81 h3 M104 86 h3 M109 86 h3 M114 86 h3' stroke='#ffffff' strokeWidth='2' />
    </g>
  ),
  trofeu: (
    <g fill='#f2c94c' stroke='#333'>
      <path d='M100 64 L120 64 L118 78 Q110 86 102 78 Z' />
      <rect x='108' y='82' width='4' height='8' />
      <rect x='103' y='90' width='14' height='5' />
    </g>
  ),
};

const desenhos: Record<string, Record<string, ReactNode>> = { cabeca, rosto, pescoco, mao };

function RoboPersonalizado({ personalizacao, triste = false, titulo = 'Robô', className, style, onClick }: RoboPersonalizadoProps) {
  const salva = usePersonalizacao();
  const escolha = personalizacao || salva;
  const pintura = buscarRecompensa(escolha.cor);
  const id = `robo-pintura-${useId().replace(/:/g, '')}`;
  const corRobo = pintura?.degrade ? `url(#${id})` : pintura?.valor || '#cccccc';
  const classePintura = pintura?.animada ? 'robo-pintura-animada' : undefined;
  const acessorios = ESPACOS.map((espaco) => escolha[espaco.id]).filter(Boolean);

  return (
    <svg viewBox='0 0 100 100' overflow='visible' role='img' aria-label={titulo || undefined} aria-hidden={titulo ? undefined : true} className={className} style={style} onClick={onClick} data-acessorios={acessorios.join(' ')}>
      {pintura?.degrade && (
        <defs>
          <linearGradient id={id} x1='0' y1='0' x2='1' y2='1'>
            {pintura.degrade.map((corDegrade, indice) => <stop key={indice} offset={indice / (pintura.degrade!.length - 1)} stopColor={corDegrade} />)}
          </linearGradient>
        </defs>
      )}
      {costas[escolha.costas]}
      <rect x='10' y='20' width='80' height='60' fill={corRobo} stroke='#333' className={classePintura} />
      <rect x='40' y='5' width='20' height='15' fill={corRobo} stroke='#333' className={classePintura} />
      {pintura?.brilho && <path className='robo-brilho' d='M14 24 H40 L22 76 H14 Z' fill='#ffffff' />}
      <circle cx='35' cy='45' r='5' fill='#333' />
      <circle cx='65' cy='45' r='5' fill='#333' />
      <path d={triste ? 'M35 70 Q50 60 65 70' : 'M35 65 Q50 75 65 65'} stroke='#333' strokeWidth='4' fill='none' />
      {escolha.mao && mao[escolha.mao] && (
        <g>
          <path d='M90 84 H100' stroke='#333' strokeWidth='4' />
          <circle cx='102' cy='84' r='4' fill={corRobo} stroke='#333' />
        </g>
      )}
      {['rosto', 'cabeca', 'pescoco', 'mao'].map((espaco) => <g key={espaco} data-espaco={espaco}>{desenhos[espaco][escolha[espaco as keyof Personalizacao]]}</g>)}
    </svg>
  );
}

export default RoboPersonalizado;
