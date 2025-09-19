import { Link } from 'react-router-dom';
import HappyRobot from '../../components/HappyRobot/HappyRobot';

function Home() {
    return (
        <div className='center'>
            <div className='home-wrapper'>
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
                <section className='home-description'>
                    <h1>Matemática divertida para todas as idades</h1>
                    <p>
                        Tabuada Divertida é uma plataforma educacional criada para ajudar estudantes de todas as idades a praticarem matemática de maneira leve e envolvente.
                        Exercícios de multiplicação, divisão, adição e subtração são apresentados em formato de jogo, incentivando o aprendizado contínuo com rankings, objetivos claros e acompanhamento de progresso.
                    </p>
                    <p>
                        O site foi pensado para professores, responsáveis e alunos que buscam uma alternativa interativa para reforçar conteúdos básicos, desenvolver agilidade de raciocínio e ganhar confiança nas resoluções.
                        Todo o conteúdo fica disponível imediatamente, direto no navegador e sem necessidade de instalação.
                    </p>
                </section>
                <section className='home-article-preview'>
                    <h2>Por que aprender matemática com jogos funciona?</h2>
                    <p>
                        Aprender brincando transforma o estudo em um desafio prazeroso, mantém a motivação em alta e ajuda a consolidar o conhecimento por meio de repetições significativas.
                        No nosso artigo especial compartilhamos evidências, boas práticas e dicas para aproveitar atividades lúdicas em sala de aula ou em casa.
                    </p>
                    <Link className='global-button' to='/artigos/aprender-matematica-com-jogos'>
                        Leia o artigo completo
                    </Link>
                </section>
            </div>
        </div>
    );
}

export default Home;