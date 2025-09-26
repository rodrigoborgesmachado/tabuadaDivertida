import './style.css';

function Footer(){
    return(
        <footer>
            <h1><a target='_blank' rel='noreferrer' href='http://www.sunsalesystem.com.br/' >SunSale System</a></h1>
            <div className='links'>
                <h3>
                    <a className="option-link" href='/privacidade'>Política de Privacidade</a>
                    <a className="option-link" href='/sobre'>Sobre</a>
                    <a className="option-link" href='/contato'>Contato</a>
                    <a className="option-link" href='/contribua'>💜 Contribua com o projeto</a>
                </h3>
            </div>
        </footer>
    )
}

export default Footer;