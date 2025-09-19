import './style.css';

function Footer(){
    return(
        <footer>
            <div className='support-option'>
                <a className='support-option__link' href='/contribua'>💜 Contribua com o projeto</a>
            </div>
            <h1><a target='_blank' rel='noreferrer' href='http://www.sunsalesystem.com.br/' >SunSale System</a></h1>
            <div className='links'>
                <h3>
                    <a href='/privacidade'>Política de Privacidade</a>
                    <a href='/sobre'>Sobre</a>
                    <a href='/contato'>Contato</a>
                </h3>
            </div>
        </footer>
    )
}

export default Footer;