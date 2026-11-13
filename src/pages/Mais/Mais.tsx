import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import './Mais.css';

const grupos = [
  {
    titulo: 'Aprender',
    links: [
      { to: '/artigos/tabuada', rotulo: 'Tabuada', icone: '✖️' },
      { to: '/artigos', rotulo: 'Artigos', icone: '📚' },
    ],
  },
  {
    titulo: 'Sobre o app',
    links: [
      { to: '/sobre', rotulo: 'Sobre', icone: 'ℹ️' },
      { to: '/contato', rotulo: 'Contato', icone: '✉️' },
      { to: '/privacidade', rotulo: 'Política de Privacidade', icone: '🔒' },
      { to: '/contribua', rotulo: 'Contribua com o projeto', icone: '💜' },
    ],
  },
];

function Mais() {
  return (
    <div className='global-pageContainer-left'>
      <div className='mais'>
        <h1>Mais</h1>
        {grupos.map((grupo) => (
          <nav key={grupo.titulo} aria-label={grupo.titulo} className='mais__grupo'>
            <h2>{grupo.titulo}</h2>
            <ul className='mais__lista'>
              {grupo.links.map((link) => (
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
        ))}
        <p className='mais__marca'>
          <a target='_blank' rel='noreferrer' href='http://www.sunsalesystem.com.br/'>SunSale System</a>
        </p>
      </div>
    </div>
  );
}

export default Mais;
