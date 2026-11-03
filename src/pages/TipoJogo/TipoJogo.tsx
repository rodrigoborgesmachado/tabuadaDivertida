import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import WalkingRobot from '../../components/WalkingRobot/WalkingRobot';
import PerfilJogador from '../../components/PerfilJogador/PerfilJogador';
import OpcoesQuantidade from '../../components/PerfilJogador/OpcoesQuantidade';
import { salvarQuantidade, useJogador } from '../../services/jogador';
import './TipoJogo.css';

function TipoJogo() {
    const navigate = useNavigate();
    const { nome, quantidade } = useJogador();
    const [editandoNome, setEditandoNome] = useState(false);
    const [trocandoQuantidade, setTrocandoQuantidade] = useState(false);

    const escolherQuantidade = (valor: number) => {
        salvarQuantidade(valor);
        setTrocandoQuantidade(false);
    };

    const goToExpressoesArticle = () => {
        navigate('/artigos/expressoes-numericas');
    };

    const handleHelpClick = (event: React.MouseEvent<HTMLSpanElement>) => {
        event.preventDefault();
        event.stopPropagation();
        goToExpressoesArticle();
    };

    const handleHelpKeyDown = (event: React.KeyboardEvent<HTMLSpanElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            event.stopPropagation();
            goToExpressoesArticle();
        }
    };

    return (
        <div className='center'>
            <WalkingRobot />
            <div className='global-pageContainer-left options-preview'>
                <div className='botoes'>
                    <div className='tipo-jogo-perfil'>
                        <button type='button' className='tipo-jogo-perfil__item' onClick={() => setEditandoNome(true)}>
                            Jogando como <strong>{nome || 'Jogador'}</strong> ✏️
                        </button>
                        <button type='button' className='tipo-jogo-perfil__item' aria-expanded={trocandoQuantidade} onClick={() => setTrocandoQuantidade(!trocandoQuantidade)}>
                            <strong>{quantidade} contas</strong> · trocar
                        </button>
                        {trocandoQuantidade && <OpcoesQuantidade valor={quantidade} onEscolher={escolherQuantidade} />}
                    </div>
                    {editandoNome && <PerfilJogador onFechar={() => setEditandoNome(false)} />}
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
                            <span
                                className='tipo-jogo-help-inline'
                                title='Clique aqui para entender como funciona expressões numéricas'
                                aria-label='Clique aqui para entender como funciona expressões numéricas'
                                role='link'
                                tabIndex={0}
                                onClick={handleHelpClick}
                                onKeyDown={handleHelpKeyDown}
                            >
                                (?)
                            </span>{' '}
                            Expressões Numéricas🧩
                        </span>
                    </Link>
                    <Link to={`/contagem/R`} className='global-button global-button--full-width'>
                        <span className='option-link'>
                            Aleatório🔀
                        </span>
                    </Link>
                    <Link to={`/instrucoes`} className='global-button global-button--full-width global-button--basic'>
                        <span className='option-link'>
                            🤔 Como jogar?
                        </span>
                    </Link>
                    <Link to={`/`} className='global-button global-button--full-width global-button--back'>
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
