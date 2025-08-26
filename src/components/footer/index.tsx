import './style.css';
import {Link} from 'react-router-dom';

function Footer(){
    return(
        <footer>
            <h1><a target='_blank' rel='noreferrer' href='http://www.sunsalesystem.com.br/' >SunSale System</a></h1>
            <div className='links'>
                <Link to='/privacidade'>Política de Privacidade</Link>
                <Link to='/sobre'>Sobre</Link>
                <Link to='/contato'>Contato</Link>
            </div>
        </footer>
    )
}

export default Footer;