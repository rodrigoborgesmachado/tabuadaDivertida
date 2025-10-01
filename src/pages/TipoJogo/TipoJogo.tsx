function TipoJogo(){

    return(
        <div className='center'>
            <div className='global-pageContainer-left options-preview'>
                <div className='botoes'>
                    <h3> Selecione a operação matemática que deseja jogar ➕ ➖ ✖️ ➗ 🔢</h3>
                    <a href={`/contagem/M`} className='global-button global-button--full-width'>
                        <span className='option-link'>
                            Multiplicação✖️
                        </span>
                    </a>
                    <a href={`/contagem/A`} className='global-button global-button--full-width'>
                        <span className='option-link'>
                            Adição➕
                        </span>
                    </a>
                    <a href={`/contagem/S`} className='global-button global-button--full-width'>
                        <span className='option-link'>
                            Subtração➖
                        </span>
                    </a>
                    <a href={`/contagem/D`} className='global-button global-button--full-width'>
                        <span className='option-link'>
                            Divisão➗
                        </span>
                    </a>
                    <a href={`/contagem/R`} className='global-button global-button--full-width'>
                        <span className='option-link'>
                            Aleatório🔀
                        </span>
                    </a>
                    <a href={`/formulario`} className='global-button global-button--full-width global-button--back'>
                        <span className='option-link'>
                            Voltar
                        </span>
                    </a>
                </div>
            </div>
        </div>
    )
}

export default TipoJogo;