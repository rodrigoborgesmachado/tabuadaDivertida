import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faEllipsis, faGamepad, faHouse, faTrophy, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { Link, useLocation } from 'react-router-dom';
import { isJogoPath } from '../../pages/Jogos/jogosConfig';
import { ehApp } from '../../services/plataforma';
import './BarraNavegacao.css';

interface ItemBarra {
  to: string;
  rotulo: string;
  icone: IconDefinition;
  ativo: (path: string) => boolean;
}

const ROTAS_MAIS = ['/mais', '/sobre', '/contato', '/privacidade', '/contribua'];

const itens: ItemBarra[] = [
  { to: '/', rotulo: 'Início', icone: faHouse, ativo: (path) => path === '/' },
  { to: '/jogos', rotulo: 'Jogos', icone: faGamepad, ativo: (path) => path === '/jogos' },
  { to: '/progresso', rotulo: 'Progresso', icone: faChartLine, ativo: (path) => path.startsWith('/progresso') || path === '/historico' },
  { to: '/ranking', rotulo: 'Ranking', icone: faTrophy, ativo: (path) => path.startsWith('/ranking') },
  { to: '/mais', rotulo: 'Mais', icone: faEllipsis, ativo: (path) => ROTAS_MAIS.includes(path) || path.startsWith('/artigos') },
];

export const telaDeJogo = (path: string) =>
  ['/contagem/', '/jogo/', '/final/'].some((inicio) => path.startsWith(inicio)) || isJogoPath(path);

function BarraNavegacao() {
  const { pathname } = useLocation();

  if (!ehApp() || telaDeJogo(pathname)) {
    return null;
  }

  return (
    <>
      <div className='barra-navegacao__espaco' aria-hidden='true' />
      <nav className='barra-navegacao' aria-label='Navegação do app'>
        {itens.map((item) => {
          const ativo = item.ativo(pathname);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`barra-navegacao__item${ativo ? ' barra-navegacao__item--ativo' : ''}`}
              aria-current={ativo ? 'page' : undefined}
            >
              <FontAwesomeIcon icon={item.icone} className='barra-navegacao__icone' />
              <span>{item.rotulo}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

export default BarraNavegacao;
