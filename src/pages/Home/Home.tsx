import { Link } from 'react-router-dom';
import HappyRobot from '../../components/HappyRobot/HappyRobot';

function Home() {
    return (
        <div className='center'>
            <div className='home-wrapper'>
                <section className='options-preview'>
                    <HappyRobot />
                    <div className='botoes-home'>
                        <Link className='global-button global-button--full-width' to={`/formulario`}>
                            <span className='option-link'>
                                🎮 Jogar Agora
                            </span>
                        </Link>
                        <Link className='global-button global-button--full-width' to={`/instrucoes`}>
                            <span className='option-link'>
                                🤔 Como Jogar?
                            </span>
                        </Link>
                        <Link className='global-button global-button--full-width' to={`/ranking`}>
                            <span className='option-link'>
                                🏆 Ranking
                            </span>
                        </Link>
                        <Link className='global-button global-button--full-width' to={`/historico`}>
                            <span className='option-link'>
                                📝 Minhas Partidas
                            </span>
                        </Link>
                    </div>
                </section>
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
                        <span className='option-link'>
                            Leia o artigo completo
                        </span>
                    </Link>
                </section>
            </div>
        </div>
    );
}

export default Home;