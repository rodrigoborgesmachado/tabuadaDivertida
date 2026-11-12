import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import './Mais.css';

const links = [
  { to: '/sobre', rotulo: 'Sobre', icone: 'ℹ️' },
  { to: '/contato', rotulo: 'Contato', icone: '✉️' },
  { to: '/privacidade', rotulo: 'Política de Privacidade', icone: '🔒' },
  { to: '/contribua', rotulo: 'Contribua com o projeto', icone: '💜' },
];

function Mais() {
  return (
    <div className='global-pageContainer-left'>
      <div className='mais'>
        <h1>Mais</h1>
        <nav aria-label='Mais opções'>
          <ul className='mais__lista'>
            {links.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className='mais__link'>
                  <span aria-hidden='true'>{link.icone}</span>
                  <span className='mais__rotulo'>{link.rotulo}</span>
                  <FontAwesomeIcon icon={faChevronRight} className='mais__seta' />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className='mais__marca'>
          <a target='_blank' rel='noreferrer' href='http://www.sunsalesystem.com.br/'>SunSale System</a>
        </p>
      </div>
    </div>
  );
}

export default Mais;
