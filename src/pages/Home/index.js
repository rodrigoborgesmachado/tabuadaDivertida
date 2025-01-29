import './style.css';
import { Link } from 'react-router-dom';

function Home(){
    return(
        <div className='global-pageContainer-left'>
            <div className='botoes'>
                <Link className='global-button global-button--full-width' to={`/formulario`}>Começar o Jogo</Link>
                <Link className='global-button global-button--full-width' to={`/instrucoes`}>Instruções do jogo</Link>
                <Link className='global-button global-button--full-width' to={`/ranking`}>Ranking</Link>
                <Link className='global-button global-button--full-width' to={`/historico`}>Histórico</Link>
            </div>
        </div>
    )
}

export default Home;