import './Artigos.css';

function ExpressoesNumericas() {
    const operacoes = [
        { simbolo: '➕', titulo: 'Adição', exemplo: '2 + 3 = 5' },
        { simbolo: '➖', titulo: 'Subtração', exemplo: '10 - 6 = 4' },
        { simbolo: '✖️', titulo: 'Multiplicação', exemplo: '5 x 4 = 20' },
        { simbolo: '➗', titulo: 'Divisão', exemplo: '12 ÷ 3 = 4' }
    ];

    const desafios = [
        '4 + 5 x 2',
        '(4 + 5) x 2',
        '10 - 6 ÷ 2',
        '(10 - 6) ÷ 2',
        '8 + 12 ÷ 3',
        '(8 + 12) ÷ 4'
    ];

    const respostas = [
        '4 + (5 x 2) = 4 + 10 = 14',
        '(4 + 5) x 2 = 9 x 2 = 18',
        '10 - (6 ÷ 2) = 10 - 3 = 7',
        '(10 - 6) ÷ 2 = 4 ÷ 2 = 2',
        '8 + (12 ÷ 3) = 8 + 4 = 12',
        '(8 + 12) ÷ 4 = 20 ÷ 4 = 5'
    ];

    return (
        <main className='global-pageContainer options-preview'>
            <article className='article-content expressoes-article'>
                <header className='expressoes-hero'>
                    <span className='expressoes-badge'>📄 Artigo Especial</span>
                    <h1>🧠 Expressões Numéricas</h1>
                    <p>
                        Expressões numéricas são contas matemáticas que misturam números e sinais para resolver desafios.
                        Elas aparecem na escola, nos jogos e em várias situações do dia a dia.
                    </p>
                </header>

                <section>
                    <h2>O que entra em uma expressão?</h2>
                    <div className='expressoes-operations-grid'>
                        {operacoes.map((item) => (
                            <div key={item.titulo} className='expressoes-op-card'>
                                <h3>{item.simbolo} {item.titulo}</h3>
                                <p>{item.exemplo}</p>
                            </div>
                        ))}
                    </div>
                    <p>
                        Exemplos de expressões: <strong>2 + 3</strong>, <strong>5 x 4</strong>, <strong>10 - 6</strong> e <strong>12 ÷ 3</strong>.
                    </p>
                </section>

                <section>
                    <h2>🎯 Para que isso serve?</h2>
                    <div className='expressoes-goals'>
                        <div className='expressoes-goal-card'>Resolver problemas do dia a dia</div>
                        <div className='expressoes-goal-card'>Fazer cálculos mais rápidos</div>
                        <div className='expressoes-goal-card'>Treinar o raciocínio lógico</div>
                        <div className='expressoes-goal-card'>Mandar bem na Tabuada Divertida</div>
                    </div>
                </section>

                <section className='expressoes-rule-box'>
                    <h2>⚠️ Regra de ouro: ordem das operações</h2>
                    <div className='expressoes-steps'>
                        <div className='expressoes-step'>
                            <span>1</span>
                            <p>Primeiro resolva multiplicação e divisão.</p>
                        </div>
                        <div className='expressoes-step'>
                            <span>2</span>
                            <p>Depois resolva adição e subtração.</p>
                        </div>
                    </div>

                    <div className='expressoes-example-grid'>
                        <div className='expressoes-example is-wrong'>
                            <h3>❌ Jeito errado</h3>
                            <p>(2 + 3) x 4 = 20</p>
                            <small>Fez da esquerda para a direita sem respeitar a prioridade.</small>
                        </div>
                        <div className='expressoes-example is-right'>
                            <h3>✅ Jeito certo</h3>
                            <p>2 + (3 x 4) = 2 + 12 = 14</p>
                            <small>Multiplicação primeiro, depois adição.</small>
                        </div>
                    </div>
                </section>

                <section className='expressoes-parenteses'>
                    <h2>🔢 E os parênteses?</h2>
                    <p>
                        Parênteses têm <strong>prioridade máxima</strong>. O que está dentro deles vem primeiro.
                    </p>
                    <p className='expressoes-highlight'>(2 + 3) x 4 = 5 x 4 = 20</p>
                </section>

                <section>
                    <h2>🧩 Desafios para treinar</h2>
                    <p>Tente resolver antes de olhar a resposta:</p>
                    <ul className='expressoes-challenge-list'>
                        {desafios.map((desafio) => (
                            <li key={desafio}>{desafio}</li>
                        ))}
                    </ul>

                    <details className='expressoes-answers'>
                        <summary>✅ Ver respostas</summary>
                        <ul className='expressoes-answer-list'>
                            {respostas.map((resposta) => (
                                <li key={resposta}>{resposta}</li>
                            ))}
                        </ul>
                    </details>
                </section>

                <section className='expressoes-final'>
                    <h2>🚀 Missão concluída. Agora é sua vez!</h2>
                    <p>
                        Você aprendeu o que são expressões numéricas, a ordem das operações e como usar parênteses.
                        Agora, bora praticar no jogo e tentar bater seu recorde.
                    </p>
                    <div className='expressoes-actions'>
                        <a className='global-button global-button--full-width' href='/contagem/E'>
                            <span className='option-link'>Treinar expressões numéricas</span>
                        </a>
                        <a className='global-button global-button--full-width global-button--basic' href='/artigos'>
                            <span className='option-link'>Ver mais artigos</span>
                        </a>
                    </div>
                </section>
            </article>
        </main>
    );
}

export default ExpressoesNumericas;