import { Link } from 'react-router-dom';

function AprenderMatematicaJogos() {
    return (
        <main className='article-page'>
            <article className='article-content'>
                <h1>Por que aprender matemática com jogos funciona</h1>
                <p>
                    Jogos educativos transformam exercícios tradicionais em desafios envolventes e, com isso, aumentam a disposição dos estudantes para praticar matemática com regularidade.
                    Quando o conteúdo é apresentado de forma lúdica, o cérebro associa o aprendizado a sentimentos positivos, fortalecendo a memória de longo prazo e reduzindo bloqueios emocionais criados por experiências negativas anteriores.
                </p>
                <p>
                    A Tabuada Divertida nasceu justamente para oferecer um ambiente seguro, acolhedor e divertido.
                    Dentro da plataforma os alunos podem experimentar diferentes operações matemáticas, comparar seus resultados com o próprio histórico e observar a evolução a cada tentativa.
                    Esse acompanhamento constante contribui para que cada pessoa aprenda no seu ritmo, sem pressão excessiva.
                </p>

                <h2>Motivação e engajamento contínuos</h2>
                <p>
                    Elementos como pontuação, rankings e metas atingíveis geram um senso de conquista que mantém o foco durante mais tempo.
                    Em sala de aula, professores podem utilizar partidas rápidas para revisar conteúdos, iniciar debates ou identificar pontos que precisam de reforço.
                    Em casa, responsáveis conseguem acompanhar o progresso e incentivar as crianças a superar seus próprios recordes.
                </p>

                <h2>Feedback imediato para corrigir rota</h2>
                <p>
                    Diferentemente de uma lista de exercícios em papel, os jogos permitem que o estudante saiba imediatamente se acertou ou errou.
                    Esse retorno rápido evita que dúvidas fiquem acumuladas e facilita intervenções direcionadas.
                    Quando o aluno entende onde cometeu um equívoco, ele consegue revisar o conceito, testar novamente e consolidar o aprendizado.
                </p>

                <h2>Desenvolvimento de habilidades além dos números</h2>
                <p>
                    Ao resolver desafios cronometrados ou sequências de operações, o estudante fortalece competências socioemocionais como resiliência, organização do tempo e pensamento crítico.
                    Essas habilidades são transferidas para outras áreas do conhecimento e contribuem para um desempenho acadêmico mais equilibrado.
                </p>

                <h2>Dicas para aproveitar os jogos educativos</h2>
                <ul>
                    <li>Defina metas realistas e celebre cada pequena conquista para manter a motivação.</li>
                    <li>Alterne tipos de operações matemáticas para reforçar diferentes habilidades.</li>
                    <li>Reserve um momento tranquilo, livre de distrações, para que a concentração seja maior.</li>
                    <li>Revise os erros com calma e transforme-os em oportunidades de aprendizado.</li>
                </ul>

                <p>
                    Quer colocar essas dicas em prática agora mesmo?
                    Experimente uma partida na <Link to='/'>página inicial</Link> ou acesse o <Link to='/formulario'>formulário de jogo</Link> para escolher o nível e a operação que deseja treinar.
                    Você também pode acompanhar a evolução no <Link to='/ranking'>ranking da comunidade</Link> e comparar seus resultados com as tentativas anteriores.
                </p>
            </article>
        </main>
    );
}

export default AprenderMatematicaJogos;
