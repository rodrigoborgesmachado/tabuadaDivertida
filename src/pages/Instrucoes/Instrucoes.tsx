import { useState } from 'react';
import happyRobot from '../../assets/robot-happy.svg';
import WalkingRobot from '../../components/WalkingRobot/WalkingRobot';

function Instrucoes(){
    const [clickCount, setClickCount] = useState(0);
    const [exploded, setExploded] = useState(false);

    const handleRobotClick = () => {
        if (exploded) return;
        const newCount = clickCount + 1;
        if (newCount >= 5) {
            setExploded(true);
        }
        setClickCount(newCount);
    };

    return(
    <div className='global-pageContainer-left options-preview'>
        <WalkingRobot />
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
        <div className='description'>
            <h3 className='description'>
            Seja bem-vindo ao incrível mundo da Tabuada Divertida, onde a matemática ganha vida de forma mágica e divertida! ✨🎉<br/><br/>
            🧮 Aqui, as crianças vão embarcar em uma jornada interativa cheia de jogos e desafios incríveis, enquanto aprendem a tabuada de multiplicação de um jeito superdivertido. 🚀🌟<br/><br/>
            📚 Nossa plataforma é como um tesouro repleto de recursos educativos especiais! Os pequenos aventureiros podem praticar suas habilidades matemáticas e se aprimorar enquanto se divertem de montão. 🎒📊<br/><br/>
            💡 E não se preocupe, papais e educadores! Estamos sempre ao seu lado. Nossa plataforma é fácil de usar e oferece recursos úteis para acompanhar o progresso das crianças. Vocês vão se encantar ao ver como elas brilham cada vez mais na matemágica! 🌟🌈<br/><br/>
            🚀 Então, que tal começar essa emocionante jornada de aprendizado hoje mesmo? Junte-se à Tabuada Divertida e vamos desbravar o mundo da matemágica juntos! 🎓✨<br/><br/>
            📚 Caso esteja em busca de um site com questões para estudar, seja de matemática ou outra matéria, acesse: <a target='_blank' rel='noreferrer' href='https://www.questoesaqui.com'>Questões Aqui</a>.📚
            </h3>
        </div>
        <h3>
        Prepare-se para uma aventura matemágica! 🎩✨<br/><br/>

        📝 Digite o seu nome, escolha o tipo de tabuada e mergulhe nessa diversão! 🚀💡<br/><br/>

        💪 Desafie-se a acertar todas as respostas no menor tempo possível. Você será um verdadeiro mestre da matemágica! ⏱️⚡️<br/><br/>

        ⭐ Será que você consegue conquistar um lugar no tão desejado Top 10 do ranking? 🏆🔝<br/><br/>

        Vamos lá, mostre suas habilidades e deixe todos boquiabertos com seu conhecimento matemágico! 💥 <br/><br/>   
        </h3>    
        <a className='global-button global-button--full-width global-button--back' href="/">
            <span className='option-link'>
                Voltar
            </span>
        </a>
    </div>
    )
}

export default Instrucoes;