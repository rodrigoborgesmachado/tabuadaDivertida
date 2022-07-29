import './style.css';
import { Link } from 'react-router-dom';

function Home(){
    return(
        <div className='container'>
            <h3>
                Teste seu raciocínio e sua rapidez: quanto tempo você demora para responder questões de tabuada?
            </h3>
            <br/>
            <div className='botoes'>
                <Link className='botao' to={`/formulario`}>Começar o Jogo</Link>
                <Link className='botao' to={`/instrucoes`}>Instruções do jogo</Link>
                <Link className='botao' to={`/ranking`}>Ranking</Link>
            </div>
        </div>
    )
}

export default Home;