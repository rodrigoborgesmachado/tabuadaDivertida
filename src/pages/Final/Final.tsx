import {Link} from 'react-router-dom';
import configData from "../../Config.json";
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import happyRobot from '../../assets/robot-happy.svg';
import sadRobot from '../../assets/robot-sad.svg';


function Final(){
    const{tipo} = useParams();
    const[questoes , setQuestoes] = useState([]);
    const isPerfect = localStorage.getItem(configData.QUANTIDADE_ACERTOS) === localStorage.getItem(configData.QUANTIDADE_PARAM);

    const launchFireworks = () => {
        const confetti = (window as any).confetti;
        if (!confetti) return;

        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval = setInterval(() => {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            });
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            });
        }, 250);
    };

    useEffect(() => {
        setQuestoes(JSON.parse(localStorage.getItem(configData.QUESTOES)));
        if(isPerfect){
            launchFireworks();
        }
        return() =>{

        }
    }, []);

    return(
        <div className='global-pageContainer-left'>
            <h2><b>🎉Parabéns {localStorage.getItem(configData.NOME_PARAM)}!!!🎉</b></h2>
            <br/>
            <div className='robot-container'>
                <img src={isPerfect ? happyRobot : sadRobot} alt={isPerfect ? 'Robô feliz' : 'Robô triste'} className='robot'/>
            </div>
            {
                isPerfect ?
                <h3>
                    Você é um mestre da tabuada! 🧠💪<br/><br/>
                    ✅Você acertou {localStorage.getItem(configData.QUANTIDADE_ACERTOS)} de {localStorage.getItem(configData.QUANTIDADE_PARAM)} em tempo recorde! ⏱️⚡️<br/>
                    Você levou apenas {localStorage.getItem(configData.TEMPO_PARAM)} segundos! ⏱️<br/><br/>
                    Pontuação final: {localStorage.getItem(configData.PONTUACAO)} | Recorde: {localStorage.getItem(configData.RECORDE)}<br/><br/>
                    Compartilhe sua conquista com seus amigos e desafie-os a superar seu desempenho!<br/><br/>

                    🔥 Quão rápido você pode ser? Descubra em Tabuada Divertida! 💥
                </h3>
                :
                <h3>
                    Não foi dessa vez, sua pontuação não foi suficiente para entrar no ranking 😢🧠💪<br/><br/>
                    ✅Você acertou {localStorage.getItem(configData.QUANTIDADE_ACERTOS)} de {localStorage.getItem(configData.QUANTIDADE_PARAM)}! ⏱️⚡️<br/>
                    Você levou apenas {localStorage.getItem(configData.TEMPO_PARAM)} segundos! ⏱️<br/><br/>
                    Pontuação final: {localStorage.getItem(configData.PONTUACAO)} | Recorde: {localStorage.getItem(configData.RECORDE)}<br/><br/>
                    Compartilhe sua conquista com seus amigos e desafie-os a superar seu desempenho!<br/><br/>

                    🔥 Quão rápido você pode ser? Descubra em Tabuada Divertida! 💥
                </h3>
            }
            <div className='respostasQuestoes'>
                <h2>
                    Respostas:
                </h2>
                <div className='resultados-lista'>
                    {
                        questoes.map((questao, index) => {
                            return(
                                <div className='resultados-item' key={index}>
                                    <h3>
                                        {questao.questao} = {questao.resposta} {questao.correta ? '🎉' : '😫'}
                                    </h3>
                                </div>
                            )
                        })
                    }
                </div>
            </div>

            <div className='botoes'>
                <Link className='global-button global-button--full-width' to={`/jogo/` + tipo}>Jogar novamente</Link>
                <Link className='global-button global-button--full-width' to={`/ranking`}>Ranking</Link>
                <Link className='global-button global-button--full-width' to="/historico">Histórico</Link>
                <Link className='global-button global-button--full-width' to="/">Início</Link>
            </div>
        </div>
    )
}

export default Final;
