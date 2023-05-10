import './style.css';
import { Link } from 'react-router-dom';

function Home(){
    return(
        <div className='container'>
            <h3>
                A Tabuada Divertida é uma maneira interativa e educativa para crianças aprenderem a tabuada de multiplicação. Com jogos e desafios divertidos, as crianças podem praticar e melhorar suas habilidades matemáticas enquanto se divertem. Nossa plataforma é fácil de usar e tem recursos úteis para ajudar os pais e educadores a acompanhar o progresso das crianças. Comece a aprender hoje mesmo com a Tabuada Divertida!
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