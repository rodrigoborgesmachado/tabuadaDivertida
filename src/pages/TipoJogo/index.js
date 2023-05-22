import './style.css';
import {Link} from 'react-router-dom';

function TipoJogo(){

    return(
        <div className='container'>
            <div className='opcoes'>
                <Link to={`/jogo/M`} className='botao'>Multiplicação✖️</Link>
                <Link to={`/jogo/A`} className='botao'>Adição➕</Link>
                <Link to={`/jogo/S`} className='botao'>Subtração➖</Link>
                <Link to={`/jogo/D`} className='botao'>Divisão➗</Link>
                <Link to={`/jogo/R`} className='botao'>Aleatório🔀</Link>
            </div>
        </div>
    )
}

export default TipoJogo;