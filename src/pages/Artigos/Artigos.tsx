import './Artigos.css';
import {Link} from 'react-router-dom';

function Artigos(){

    return(
        <div className='center'>
            <div className='global-pageContainer-left options-preview'>
                <div className='botoes'>
                    <Link to={`/artigos/aprender-matematica-com-jogos`} className='global-button global-button--full-width'>
                        <span className='option-link'>
                            Aprenda Matemática com jogos
                        </span>
                    </Link>
                    <Link to={`/artigos/historia-da-tabuada`} className='global-button global-button--full-width'>
                        <span className='option-link'>
                            História da Tabuada
                        </span>
                    </Link>
                    <Link to={`/artigos/tabuada`} className='global-button global-button--full-width'>
                        <span className='option-link'>
                            Tabuada de Multiplicação e Divisão
                        </span>
                    </Link>
                    <Link to={`/artigos/beneficios-jogos-educacionas`} className='global-button global-button--full-width'>
                        <span className='option-link'>
                            Benefício dos Jogos Educacionais
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Artigos;