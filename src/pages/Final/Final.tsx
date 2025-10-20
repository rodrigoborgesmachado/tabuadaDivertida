import configData from "../../Config.json";
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import happyRobot from '../../assets/robot-happy.svg';
import great from '../../assets/great.png';
import donkey from '../../assets/donkey.png';
import WalkingRobot from "./../../components/WalkingRobot/WalkingRobot";

function Final(){
    const{tipo} = useParams();
    const[questoes , setQuestoes] = useState([]);
    const [canShare, setCanShare] = useState(false);
    const isPerfect = localStorage.getItem(configData.QUANTIDADE_ACERTOS) === localStorage.getItem(configData.QUANTIDADE_PARAM);
    const isWorst = localStorage.getItem(configData.QUANTIDADE_ACERTOS) === '1';

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
        setCanShare(typeof navigator !== 'undefined' && 'share' in navigator);
        if(isPerfect){
            launchFireworks();
        }
        return() =>{

        }
    }, []);

    const handleShare = async () => {
        if (!canShare) return;

        const nome = localStorage.getItem(configData.NOME_PARAM) || 'Eu';
        const acertos = localStorage.getItem(configData.QUANTIDADE_ACERTOS) || '0';
        const total = localStorage.getItem(configData.QUANTIDADE_PARAM) || '0';
        const tempo = localStorage.getItem(configData.TEMPO_PARAM) || '0';
        const pontuacao = localStorage.getItem(configData.PONTUACAO) || '0';
        const recorde = localStorage.getItem(configData.RECORDE) || '0';

        const prefix = isPerfect ? 'Uhuu! 🥳🚀' : isWorst ? 'Ops! 😂🐢' : 'Aê! 😄💪';
        const frase = isPerfect
            ? 'Mandei bem DEMAIS na Tabuada Divertida!'
            : isWorst
            ? 'Dessa vez não rolou, mas eu vou treinar!'
            : 'Mandei bem na Tabuada Divertida!';

        const text = `${prefix} ${nome} fez ${acertos}/${total} em ${tempo}s.\nPontuação: ${pontuacao} | Recorde: ${recorde}.\n${frase} Vem jogar também! 🎮📲`;

        try {
            await (navigator as any).share({
                title: 'Tabuada Divertida',
                text,
                url: window.location.origin
            });
        } catch (err) {
            // Usuário cancelou ou não foi possível compartilhar; silencie o erro.
        }
    };

    return(
        <div className='global-pageContainer-left options-preview'>
            <WalkingRobot />
            <h2>
                {
                    isPerfect ?
                    <div className='congrats-final'>
                        <img src={great}/>
                        <b>🎉Parabéns {localStorage.getItem(configData.NOME_PARAM)}, você é de outro planeta!!!🎉</b>
                    </div>
                    :
                    isWorst ?
                    <b>Você errou todas KKKKKKKKKKK</b>
                    :
                    <b>🎉Parabéns {localStorage.getItem(configData.NOME_PARAM)}, você é fera!!!🎉</b>
                }
            </h2>
            <br/>
            <div className='robot-container'>
                <img src={isPerfect ? happyRobot : isWorst ? donkey : happyRobot} alt={isPerfect ? 'Robô feliz' : 'Robô triste'} className={isWorst ? 'robot-donkey' : 'robot'}/>
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
                {canShare && (
                    <button type='button' className='global-button global-button--full-width' onClick={handleShare}>
                        <span className='option-link'>
                            Compartilhar resultado 📤
                        </span>
                    </button>
                )}
                <a className='global-button global-button--full-width' href={`/contagem/` + tipo}>
                    <span className='option-link'>
                        Jogar novamente
                    </span>
                </a>
                <a className='global-button global-button--full-width' href={`/ranking`}>
                    <span className='option-link'>
                        Ranking
                    </span>
                </a>
                <a className='global-button global-button--full-width' href="/resultados">
                    <span className='option-link'>
                        Meus Resultados
                    </span>
                </a>
                <a className='global-button global-button--full-width' href="/">
                    <span className='option-link'>
                        Início
                    </span>
                </a>
            </div>
        </div>
    )
}

export default Final;
