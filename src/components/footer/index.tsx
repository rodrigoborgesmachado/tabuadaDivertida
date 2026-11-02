import './style.css';

function Footer(){
    return(
        <footer>
            <p className='footer-brand'><a target='_blank' rel='noreferrer' href='http://www.sunsalesystem.com.br/' >SunSale System</a></p>
            <nav className='links' aria-label='Links do site'>
                <ul>
                    <li><a className="option-link" href='/privacidade'>Política de Privacidade</a></li>
                    <li><a className="option-link" href='/sobre'>Sobre</a></li>
                    <li><a className="option-link" href='/contato'>Contato</a></li>
                    <li><a className="option-link" href='/contribua'>💜 Contribua com o projeto</a></li>
                </ul>
            </nav>
        </footer>
    )
}

export default Footer;