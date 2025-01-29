import {Link} from 'react-router-dom';

function TipoJogo(){

    return(
        <div className='global-pageContainer-left'>
            <div className='botoes'>
                <Link to={`/jogo/M`} className='global-button global-button--full-width'>Multiplicação✖️</Link>
                <Link to={`/jogo/A`} className='global-button global-button--full-width'>Adição➕</Link>
                <Link to={`/jogo/S`} className='global-button global-button--full-width'>Subtração➖</Link>
                <Link to={`/jogo/D`} className='global-button global-button--full-width'>Divisão➗</Link>
                <Link to={`/jogo/R`} className='global-button global-button--full-width'>Aleatório🔀</Link>
                <Link to={`/formulario`} className='global-button global-button--full-width'>Voltar</Link>
            </div>
        </div>
    )
}

export default TipoJogo;