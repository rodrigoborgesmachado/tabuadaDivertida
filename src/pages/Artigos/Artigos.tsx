import './Artigos.css';

function Artigos(){

    return(
        <div className='center'>
            <div className='global-pageContainer-left options-preview'>
                <div className='botoes'>
                    <a href={`/artigos/aprender-matematica-com-jogos`} className='global-button global-button--full-width'>
                        <span className='option-link'>
                            Aprenda Matemática com jogos
                        </span>
                    </a>
                    <a href={`/artigos/historia-da-tabuada`} className='global-button global-button--full-width'>
                        <span className='option-link'>
                            História da Tabuada
                        </span>
                    </a>
                    <a href={`/artigos/tabuada`} className='global-button global-button--full-width'>
                        <span className='option-link'>
                            Tabuada de Multiplicação e Divisão
                        </span>
                    </a>
                    <a href={`/artigos/beneficios-jogos-educacionas`} className='global-button global-button--full-width'>
                        <span className='option-link'>
                            Benefício dos Jogos Educacionais
                        </span>
                    </a>
                    <a href={`/artigos/dicas-para-ensinar-matematica-em-casa`} className='global-button global-button--full-width'>
                        <span className='option-link'>
                            Dicas para Ensinar Matemática em Casa
                        </span>
                    </a>
                </div>
            </div>
        </div>
    )
}

export default Artigos;