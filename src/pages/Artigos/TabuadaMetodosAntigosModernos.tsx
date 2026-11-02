import { useEffect } from 'react';
import './Artigos.css';

const TITULO = 'Tabuada: métodos antigos x métodos modernos | Tabuada Divertida';
const DESCRICAO = 'Compare as formas tradicionais de ensinar a tabuada com as abordagens modernas, veja prós e contras de cada uma e como combiná-las no aprendizado.';

function TabuadaMetodosAntigosModernos() {
    useEffect(() => {
        const tituloAnterior = document.title;
        const meta = document.querySelector('meta[name="description"]');
        const descricaoAnterior = meta?.getAttribute('content');

        document.title = TITULO;
        meta?.setAttribute('content', DESCRICAO);

        return () => {
            document.title = tituloAnterior;
            if (descricaoAnterior) {
                meta?.setAttribute('content', descricaoAnterior);
            }
        };
    }, []);

    return (
        <div className='global-pageContainer options-preview'>
            <header className='tabuada-description'>
                <h1>⚖️ Tabuada: métodos antigos x métodos modernos</h1>
                <p>
                    Quase todo adulto se lembra de como aprendeu a tabuada: repetindo em voz alta, copiando no caderno ou respondendo
                    quando a professora “tomava a tabuada”. Hoje, jogos, aplicativos e materiais concretos dividem espaço com essas
                    práticas. Neste artigo, comparamos as duas abordagens, com seus pontos fortes e limites, e mostramos como elas
                    podem trabalhar juntas.
                </p>
            </header>

            <section className='tabuada-description'>
                <h2>📚 Os métodos antigos</h2>
                <p>
                    Durante décadas, o ensino da tabuada se apoiou na <strong>memorização</strong>. Os recursos mais comuns eram:
                </p>
                <ul>
                    <li><strong>Decoreba:</strong> estudar cada tabuada até saber todos os resultados de cor.</li>
                    <li><strong>Repetição em voz alta:</strong> recitar “dois vezes um, dois; dois vezes dois, quatro...” em coro ou sozinho.</li>
                    <li><strong>Cópia no caderno:</strong> escrever a tabuada inteira várias vezes para fixar os resultados.</li>
                    <li><strong>“Tomar a tabuada”:</strong> o professor ou um familiar pergunta contas salteadas e a criança responde na hora.</li>
                </ul>
                <p>
                    Essas práticas têm raízes longas: como contamos na <a href='/artigos/historia-da-tabuada'>História da
                    Tabuada</a>, povos antigos já recitavam tabelas de multiplicação em versos para memorizá-las.
                </p>
            </section>

            <section className='tabuada-description'>
                <h2>🎮 Os métodos modernos</h2>
                <p>
                    As abordagens mais recentes procuram unir <strong>prática</strong> e <strong>compreensão</strong>, tornando o
                    estudo mais ativo:
                </p>
                <ul>
                    <li><strong>Jogos:</strong> desafios com tempo, cartas e quebra-cabeças que exigem as contas para avançar.</li>
                    <li><strong>Gamificação:</strong> pontos, medalhas, rankings e sequências de dias que incentivam a prática constante.</li>
                    <li><strong>Materiais concretos:</strong> tampinhas, palitos, malhas quadriculadas e ábacos para visualizar a multiplicação como grupos iguais.</li>
                    <li><strong>Aplicativos:</strong> exercícios com correção imediata e acompanhamento do progresso.</li>
                    <li><strong>Aprendizagem por padrões:</strong> perceber que a ordem dos fatores não altera o produto, que a tabuada do 4 é o dobro da do 2 e que a do 9 tem regularidades curiosas.</li>
                </ul>
            </section>

            <section className='tabuada-description'>
                <h2>✅ Prós e contras dos métodos antigos</h2>
                <p>
                    <strong>Pontos fortes:</strong> a repetição constrói <strong>fluência</strong>, ou seja, a capacidade de lembrar
                    os resultados rapidamente, liberando a atenção para problemas mais complexos. Também são métodos simples, que não
                    exigem nenhum recurso além de papel e lápis.
                </p>
                <p>
                    <strong>Limites:</strong> quando usados sozinhos, podem gerar ansiedade e desinteresse, e a criança pode decorar
                    resultados sem entender o que a multiplicação significa. Se esquecer um resultado, nem sempre sabe como chegar a
                    ele por outro caminho.
                </p>
            </section>

            <section className='tabuada-description'>
                <h2>✅ Prós e contras dos métodos modernos</h2>
                <p>
                    <strong>Pontos fortes:</strong> aumentam a <strong>motivação</strong>, oferecem feedback imediato e ajudam a
                    criança a entender por que os resultados são o que são. Materiais concretos e padrões dão ferramentas para
                    reconstruir uma conta esquecida.
                </p>
                <p>
                    <strong>Limites:</strong> sem prática regular, a compreensão nem sempre vira fluência. Jogos e telas também podem
                    distrair se não tiverem um objetivo claro, e o tempo de uso precisa de acompanhamento de um adulto.
                </p>
            </section>

            <section className='tabuada-description'>
                <h2>🤝 Como combinar as duas abordagens</h2>
                <p>
                    Os métodos não precisam competir. Uma sequência que costuma funcionar bem é:
                </p>
                <ol>
                    <li><strong>Entender:</strong> começar com materiais concretos e desenhos para mostrar a multiplicação como grupos iguais.</li>
                    <li><strong>Observar padrões:</strong> explorar a tabela de multiplicação e descobrir atalhos, como o dobro e a comutatividade.</li>
                    <li><strong>Praticar com frequência:</strong> sessões curtas de repetição, em voz alta ou por escrito, em vez de longas horas de estudo.</li>
                    <li><strong>Desafiar de forma divertida:</strong> usar jogos para revisar e medir a evolução, transformando a prática em hábito.</li>
                </ol>
                <p>
                    Assim, a memorização deixa de ser um fim em si mesma e passa a apoiar o raciocínio.
                </p>
            </section>

            <section className='tabuada-description'>
                <h2>🧮 Onde o Tabuada Divertida se encaixa</h2>
                <p>
                    O <strong>Tabuada Divertida</strong> une as duas abordagens: mantém a <strong>prática repetida</strong> dos
                    métodos tradicionais, mas em forma de jogo, com tempo, pontuação, ranking, medalhas e desafios diários. Cada
                    partida funciona como “tomar a tabuada”, só que com feedback imediato e sem pressão.
                </p>
                <p>
                    Ele não substitui a explicação em sala de aula nem os materiais concretos, mas é um bom complemento para
                    transformar o treino em um momento leve e frequente.
                </p>
            </section>

            <section className='tabuada-description'>
                <h2>▶️ Continue praticando</h2>
                <p>
                    Que tal colocar em prática? Escolha um dos nossos jogos e veja sua evolução partida após partida.
                </p>
                <a className='global-button' href='/jogos'>
                    <span className='option-link'>
                        Conheça os jogos
                    </span>
                </a>
            </section>
        </div>
    );
}

export default TabuadaMetodosAntigosModernos;
