import { Link } from 'react-router-dom';
import WalkingRobot from '../../components/WalkingRobot/WalkingRobot';

function TipoJogo() {
    return (
        <div className='center'>
            <WalkingRobot />
            <div className='global-pageContainer-left options-preview'>
                <div className='botoes'>
                    <h3>Selecione a operação matemática que deseja jogar ➕ ➖ ✖️ ➗ 🔢</h3>
                    <Link to={`/contagem/M`} className='global-button global-button--full-width'>
                        <span className='option-link'>
                            Multiplicação✖️
                        </span>
                    </Link>
                    <Link to={`/contagem/A`} className='global-button global-button--full-width'>
                        <span className='option-link'>
                            Adição➕
                        </span>
                    </Link>
                    <Link to={`/contagem/S`} className='global-button global-button--full-width'>
                        <span className='option-link'>
                            Subtração➖
                        </span>
                    </Link>
                    <Link to={`/contagem/D`} className='global-button global-button--full-width'>
                        <span className='option-link'>
                            Divisão➗
                        </span>
                    </Link>
                    <Link to={`/contagem/E`} className='global-button global-button--full-width'>
                        <span className='option-link'>
                            Expressões Numéricas🧩
                        </span>
                    </Link>
                    <Link to={`/contagem/R`} className='global-button global-button--full-width'>
                        <span className='option-link'>
                            Aleatório🔀
                        </span>
                    </Link>
                    <Link to={`/formulario`} className='global-button global-button--full-width global-button--back'>
                        <span className='option-link'>
                            Voltar
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default TipoJogo;
