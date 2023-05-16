import './style.css';
import { Link } from 'react-router-dom';

function Home(){
    return(
        <div className='container'>
            <h3 className='description'>
            Seja bem-vindo ao incrível mundo da Tabuada Divertida, onde a matemática ganha vida de forma mágica e divertida! ✨🎉<br/><br/>
            🧮 Aqui, as crianças vão embarcar em uma jornada interativa cheia de jogos e desafios incríveis, enquanto aprendem a tabuada de multiplicação de um jeito superdivertido. 🚀🌟<br/><br/>
            📚 Nossa plataforma é como um tesouro repleto de recursos educativos especiais! Os pequenos aventureiros podem praticar suas habilidades matemáticas e se aprimorar enquanto se divertem de montão. 🎒📊<br/><br/>
            💡 E não se preocupe, papais e educadores! Estamos sempre ao seu lado. Nossa plataforma é fácil de usar e oferece recursos úteis para acompanhar o progresso das crianças. Vocês vão se encantar ao ver como elas brilham cada vez mais na matemágica! 🌟🌈<br/><br/>
            🚀 Então, que tal começar essa emocionante jornada de aprendizado hoje mesmo? Junte-se à Tabuada Divertida e vamos desbravar o mundo da matemágica juntos! 🎓✨
            </h3>
            <br/>
            <div className='botoes'>
                <Link className='botao' to={`/formulario`}>Começar o Jogo</Link>
                <Link className='botao' to={`/instrucoes`}>Instruções do jogo</Link>
                <Link className='botao' to={`/ranking`}>Ranking</Link>
            </div>
        </div>
    )
}

export default Home;