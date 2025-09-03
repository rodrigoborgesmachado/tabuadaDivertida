import {Link} from 'react-router-dom';

function TipoJogo(){

    return(
        <div className='center'>
            <div className='global-pageContainer-left'>
                <div className='botoes'>
                    <h3> Selecione a operação matemática que deseja jogar ➕ ➖ ✖️ ➗ 🔢</h3>
                    <Link to={`/contagem/M`} className='global-button global-button--full-width'>Multiplicação✖️</Link>
                    <Link to={`/contagem/A`} className='global-button global-button--full-width'>Adição➕</Link>
                    <Link to={`/contagem/S`} className='global-button global-button--full-width'>Subtração➖</Link>
                    <Link to={`/contagem/D`} className='global-button global-button--full-width'>Divisão➗</Link>
                    <Link to={`/contagem/R`} className='global-button global-button--full-width'>Aleatório🔀</Link>
                    <Link to={`/formulario`} className='global-button global-button--full-width global-button--back'>Voltar</Link>
                </div>
            </div>
        </div>
    )
}

export default TipoJogo;