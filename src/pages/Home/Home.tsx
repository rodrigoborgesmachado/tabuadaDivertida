import { Link } from 'react-router-dom';
import { useState } from 'react';
import HappyRobot from '../../components/HappyRobot/HappyRobot';

function Home() {
    return (
        <div className='center'>
            <HappyRobot />
            <div className='botoes-home'>
                <Link className='global-button global-button--full-width' to={`/formulario`}>
                    🎮 Jogar Agora
                </Link>
                <Link className='global-button global-button--full-width' to={`/instrucoes`}>
                    🤔 Como Jogar?
                </Link>
                <Link className='global-button global-button--full-width' to={`/ranking`}>
                    🏆 Ranking
                </Link>
                <Link className='global-button global-button--full-width' to={`/historico`}>
                    📝 Minhas Partidas
                </Link>
            </div>
        </div>
    );
}

export default Home;