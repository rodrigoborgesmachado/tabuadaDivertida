import { Link } from 'react-router-dom';
import { useState } from 'react';
import happyRobot from '../../assets/robot-happy.svg';

function Home() {
    const [clickCount, setClickCount] = useState(0);
    const [exploded, setExploded] = useState(false);

    const handleRobotClick = () => {
        if (exploded) return;
        const newCount = clickCount + 1;
        if (newCount >= 10) {
            setExploded(true);
        }
        setClickCount(newCount);
    };

    return (
        <div className='center'>
            <div
                className='home-robot-container'
                style={
                    exploded ? { animation: 'none', pointerEvents: 'none' } : undefined
                }
            >
                {exploded ? (
                    <span className='home-robot-explosion'>💥</span>
                ) : (
                    <img
                        src={happyRobot}
                        alt='Robô feliz'
                        className='home-robot'
                        style={{ transform: `scale(${1 + clickCount * 0.1})` }}
                        onClick={handleRobotClick}
                    />
                )}
            </div>
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