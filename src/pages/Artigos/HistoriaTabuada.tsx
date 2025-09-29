import { Link } from 'react-router-dom';

function HistoriaTabuada() {
    return (
        <div className='global-pageContainer options-preview'>
            <header className='tabuada-description'>
                <h1>📜 A História da Tabuada</h1>
                <p>
                    A tabuada acompanha a humanidade desde as primeiras civilizações que precisaram registrar trocas comerciais
                    e observações astronômicas. Ao longo dos séculos, ela ganhou diferentes formatos e permanece, até hoje, como
                    uma aliada essencial para quem deseja realizar cálculos com agilidade.
                </p>
            </header>

            <section className='tabuada-description'>
                <h2>🏛️ As raízes na Antiguidade</h2>
                <p>
                    Povos como os <strong>babilônios</strong> e os <strong>egípcios</strong> já organizavam tabelas com resultados
                    de multiplicações para facilitar o dia a dia. Essas primeiras tabuadas eram gravadas em tábuas de argila ou
                    papiros e ajudavam mercadores, artesãos e estudiosos a manter seus registros com precisão.
                </p>
                <p>
                    Outros povos, como os <strong>chineses</strong> e <strong>indianos</strong>, também criaram métodos visuais e
                    músicas para memorização. Isso mostra que, independentemente da cultura, aprender padrões numéricos sempre foi
                    fundamental para resolver problemas práticos.
                </p>
            </section>

            <section className='tabuada-description'>
                <h2>🧠 Pitágoras e a popularização da tabuada</h2>
                <p>
                    O formato mais conhecido hoje surgiu na Grécia Antiga com a chamada <strong>Tabuada de Pitágoras</strong>. A
                    matriz com linhas e colunas ajudava os alunos a identificar padrões e compreender propriedades da multiplicação.
                </p>
                <p>
                    Além de memorizar resultados, a tabela estimulava a percepção de simetrias e reforçava a lógica por trás das
                    operações. Esse método acabou influenciando gerações de educadores em todo o mundo.
                </p>
            </section>

            <section className='tabuada-description'>
                <h2>📚 Da Idade Média às escolas modernas</h2>
                <p>
                    Durante a Idade Média, a tabuada era ensinada em escolas monásticas como parte da formação básica em cálculo.
                    Já no século XIX, com a expansão das escolas públicas, tornou-se um dos conteúdos obrigatórios para crianças.
                </p>
                <p>
                    Professores utilizavam livros, cantigas e competições para tornar a memorização mais envolvente — estratégias
                    que continuam eficazes e inspiram recursos educacionais até hoje.
                </p>
            </section>

            <section className='tabuada-description'>
                <h2>💡 A tabuada no século XXI</h2>
                <p>
                    Mesmo com calculadoras e dispositivos digitais, dominar a tabuada continua importante. Saber os resultados de
                    cabeça facilita a resolução de problemas complexos, fortalece o raciocínio lógico e amplia a confiança dos
                    estudantes nas aulas de matemática.
                </p>
                <p>
                    Recursos online, como jogos, quizzes e desafios, permitem que cada pessoa aprenda no próprio ritmo. Aqui na
                    <strong>Tabuada Divertida</strong>, reunimos essas ferramentas para transformar estudo em diversão.
                </p>
            </section>

            <section className='tabuada-description'>
                <h2>🚀 Continue praticando</h2>
                <p>
                    Quer colocar todo esse conhecimento em prática? Explore a tabuada interativa disponível em nosso site e
                    acompanhe sua evolução com desafios personalizados.
                </p>
                <Link className='global-button' to='/artigos/tabuada'>
                    <span className='option-link'>
                        Acesse a tabuada completa
                    </span>
                </Link>
            </section>
        </div>
    );
}

export default HistoriaTabuada;
