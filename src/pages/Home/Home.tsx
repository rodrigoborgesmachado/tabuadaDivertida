import { Link } from 'react-router-dom';
import happyRobot from '../../assets/robot-happy.svg';

function Home(){
    return(
        <div className='center'>
            <div className='home-robot-container'>
                <img src={happyRobot} alt='Robô feliz' className='home-robot'/>
            </div>
            <div className='botoes-home'>
                <Link className='global-button global-button--full-width' to={`/formulario`}>🎮 Jogar Agora</Link>
                <Link className='global-button global-button--full-width' to={`/instrucoes`}>🤔 Como Jogar?</Link>
                <Link className='global-button global-button--full-width' to={`/ranking`}>🏆 Ranking</Link>
                <Link className='global-button global-button--full-width' to={`/historico`}>📝 Minhas Partidas</Link>
            </div>
        </div>
    )
}

export default Home;