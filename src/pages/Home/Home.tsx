import HappyRobot from '../../components/HappyRobot/HappyRobot';
import WalkingRobot from '../../components/WalkingRobot/WalkingRobot';

function Home() {
    return (
        <div className='center'>
            <WalkingRobot />
            <div className='home-wrapper'>
                <section className='options-preview'>
                    <HappyRobot />
                    <div className='botoes-home'>
                        <a className='global-button global-button--full-width' href={`/formulario`}>
                            <span className='option-link'>
                                🎮 Jogar Agora
                            </span>
                        </a>
                        <a className='global-button global-button--full-width' href={`/instrucoes`}>
                            <span className='option-link'>
                                🤔 Como Jogar?
                            </span>
                        </a>
                        <a className='global-button global-button--full-width' href={`/ranking`}>
                            <span className='option-link'>
                                🏆 Ranking
                            </span>
                        </a>
                        <a className='global-button global-button--full-width' href={`/resultados`}>
                            <span className='option-link'>
                                ✨Meus Resultados
                            </span>
                        </a>
                        <a className='global-button global-button--full-width' href={`/artigos`}>
                            <span className='option-link'>
                                🧠 Artigos
                            </span>
                        </a>
                        <a className='global-button global-button--full-width' href={`/jogo2048`}>
                            <span className='option-link'>
                                🧩 Jogar 2048
                            </span>
                        </a>
                    </div>
                </section>
                <section className='home-description'>
                    <h1>🎯 Matemática divertida para todas as idades</h1>
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
                    <h2>🧠 Por que aprender matemática com jogos funciona?</h2>
                    <p>
                        Aprender brincando transforma o estudo em um desafio prazeroso, mantém a motivação em alta e ajuda a consolidar o conhecimento por meio de repetições significativas.
                        No nosso artigo especial compartilhamos evidências, boas práticas e dicas para aproveitar atividades lúdicas em sala de aula ou em casa.
                    </p>
                    <a className='global-button' href='/artigos/aprender-matematica-com-jogos'>
                        <span className='option-link'>
                            Leia o artigo completo
                        </span>
                    </a>
                </section>
                <section className='home-article-preview'>
                    <h2>🧩 O que você encontra por aqui</h2>
                    <ul>
                        <li>✔️ Jogos de matemática para diferentes níveis</li>
                        <li>✔️ Histórico para acompanhar o desempenho</li>
                        <li>✔️ Rankings com os melhores jogadores</li>
                        <li>✔️ Conteúdo gratuito, sem anúncios invasivos</li>
                    </ul>
                </section>
                <section className='home-article-preview'>
                    <h2>🛡️ Seguro para crianças</h2>
                    <p>
                        O Tabuada Divertida foi desenvolvido com foco total em segurança e privacidade. Nenhuma informação sensível é coletada, e todas as atividades são acessíveis sem login obrigatório.
                    </p>
                </section>
                <section className='home-article-preview'>
                    <h2>📜 A História da Tabuada</h2>
                    <p>
                        A tabuada é uma ferramenta matemática que ajuda a memorizar os resultados das operações básicas, especialmente a multiplicação. Mas você sabia que ela existe há milhares de anos?
                    </p>
                    <p>
                        A origem da tabuada remonta às civilizações antigas, como os <strong>babilônios</strong> e <strong>egípcios</strong>, que já utilizavam tabelas para facilitar os cálculos comerciais e astronômicos. Porém, a tabuada como conhecemos hoje foi sistematizada por um dos matemáticos mais famosos da Grécia Antiga: <strong>Pitágoras</strong>.
                    </p>
                    <p>
                        A chamada <strong>Tabuada de Pitágoras</strong> é uma matriz onde as linhas e colunas representam números, e as células contêm o resultado da multiplicação entre eles. Esse formato visual ajudava os estudantes da época a entenderem padrões e propriedades da multiplicação.
                    </p>
                    <p>
                        Com o passar dos séculos, a tabuada se tornou parte essencial do ensino da matemática em todo o mundo. Durante a Idade Média, ela era ensinada em escolas monásticas. No século XIX, com a popularização das escolas públicas, passou a ser memorizada por milhões de alunos como uma das primeiras ferramentas para o raciocínio lógico.
                    </p>
                    <p>
                        Hoje em dia, a tabuada continua sendo fundamental. Apesar das calculadoras e da tecnologia, saber fazer contas de cabeça traz mais agilidade, confiança e independência para lidar com números no dia a dia.
                    </p>
                    <p>
                        No <strong>Tabuada Divertida</strong>, nossa missão é resgatar esse conhecimento de forma moderna, usando jogos e desafios que tornam o aprendizado mais leve, envolvente e divertido. Afinal, aprender pode — e deve — ser uma experiência prazerosa!
                    </p>
                    <div className='gap-default'>
                        <a className='global-button' href='/artigos/historia-da-tabuada'>
                            <span className='option-link'>
                                Leia a história completa
                            </span>
                        </a>
                        <a className='global-button' href='/artigos/tabuada'>
                            <span className='option-link'>
                                Acesse a tabuada
                            </span>
                        </a>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default Home;