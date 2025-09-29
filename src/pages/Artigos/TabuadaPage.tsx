function TabuadaPage() {
    const linhas = Array.from({ length: 10 }, (_, i) => i + 1);
    const colunas = Array.from({ length: 10 }, (_, i) => i + 1);
    const baseNumbers = Array.from({ length: 10 }, (_, i) => i + 1);

    return (
        <div className='global-pageContainer options-preview'>
            <h1 className='tabuada-title'>📊 Tabuada de Multiplicação</h1>
            <p className='tabuada-description'>
                Consulte e pratique a tabuada de multiplicação de 1 a 10.
                Essa é uma ótima maneira de reforçar o raciocínio matemático e a memorização de contas básicas.
            </p>
            <div className='tabuada-table'>
                <div className='tabuada-header'>
                    <div className='tabuada-cell tabuada-label'>&times;</div>
                    {colunas.map((col) => (
                        <div key={col} className='tabuada-cell tabuada-header-cell'>
                            {col}
                        </div>
                    ))}
                </div>
                {linhas.map((linha) => (
                    <div key={linha} className='tabuada-row'>
                        <div className='tabuada-cell tabuada-header-cell'>{linha}</div>
                        {colunas.map((col) => (
                            <div key={col} className='tabuada-cell'>
                                {linha * col}
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            <p className='tabuada-description'>
                Consulte e pratique a tabuada de multiplicação de 1 a 10.
                Aprender a tabuada é essencial para fortalecer o raciocínio matemático e a agilidade nos cálculos do dia a dia.
            </p>

            <div className='tabuada-cards-wrapper'>
                {baseNumbers.map((base) => (
                    <div key={base} className='tabuada-card'>
                        <h3 className='tabuada-card-title'>Tabuada do {base}</h3>
                        <ul className='tabuada-list'>
                            {baseNumbers.map((multiplier) => (
                                <li key={multiplier} className='tabuada-item'>
                                    {base} × {multiplier} = {base * multiplier}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <section className="tabuada-description">
                <h2>📚 Dica de aprendizado</h2>
                <p>
                    Repetição e visualização são chaves para memorizar a tabuada. Tente praticar diariamente, começando pelas tabuadas mais fáceis (como a do 1, 2, 5 e 10) e evoluindo até as mais difíceis.
                </p>
                <p>
                    Você também pode criar desafios cronometrados, jogos de memória ou até cantar a tabuada em voz alta para tornar o processo mais divertido!
                </p>
                <p>
                    Aqui na <strong>Tabuada Divertida</strong>, acreditamos que aprender pode — e deve — ser prazeroso e interativo.
                </p>
            </section>

            <section className="tabuada-description">
                <h2>➗ Como funciona a divisão usando a tabuada?</h2>
                <p>
                    A divisão é a operação inversa da multiplicação. Por exemplo, se sabemos que <strong>3 × 4 = 12</strong>, então também sabemos que <strong>12 ÷ 3 = 4</strong> e <strong>12 ÷ 4 = 3</strong>.
                </p>
                <p>
                    Entender bem a tabuada facilita muito na hora de dividir, pois você consegue identificar rapidamente qual número multiplicado pelo divisor resulta no dividendo.
                </p>
                <p>
                    Aprender divisão com base na tabuada ajuda a desenvolver o raciocínio lógico, evita a dependência da calculadora e fortalece o aprendizado matemático como um todo.
                </p>
            </section>

            <section className="tabuada-section">
                <h2>📘 Tabuada de Divisão</h2>
                <div className="tabuada-cards-wrapper">
                    {baseNumbers.map((base) => (
                        <div key={base} className='tabuada-card'>
                            <h3 className='tabuada-card-title'>Tabuada do {base}</h3>
                            <ul className='tabuada-list'>
                                {baseNumbers.map((multiplier) => (
                                    <li key={multiplier} className='tabuada-item'>
                                        {base * multiplier} ÷ {base} = {multiplier}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default TabuadaPage;
