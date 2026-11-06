import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import HappyRobot from '../../components/HappyRobot/HappyRobot';
import WalkingRobot from '../../components/WalkingRobot/WalkingRobot';
import DesafiosDoDia from '../../components/DesafiosDoDia/DesafiosDoDia';
import BarraXp from '../../components/BarraXp/BarraXp';
import PerfilJogador from '../../components/PerfilJogador/PerfilJogador';
import { useJogador } from '../../services/jogador';
import { lerProgresso } from '../../gamificacao/progresso';
import { diasSeguidosAtuais } from '../../gamificacao/sequenciaDias';
import { useRecompensasNaoVistas } from '../../gamificacao/useRecompensasNaoVistas';
import { jogos } from '../Jogos/jogosConfig';
import { ehNovo, filtros, jogoFavorito, jogoParaContinuar, lerFiltro, rotaDoJogo, salvarFiltro } from './logic';
import './Home.css';

function Home() {
    const [progresso] = useState(() => lerProgresso());
    const [filtro, setFiltro] = useState(lerFiltro);
    const recompensasNovas = useRecompensasNaoVistas().length;
    const { nome } = useJogador();
    const { hash } = useLocation();
    const [editandoNome, setEditandoNome] = useState(false);
    const dias = diasSeguidosAtuais(progresso);
    const continuar = jogoParaContinuar(progresso);
    const favorito = jogoFavorito(progresso);
    const tabuada = jogos.find((jogo) => jogo.id === 'tabuada');
    const filtroAtual = filtros.find((item) => item.id === filtro) || filtros[0];

    useEffect(() => {
        if (window.location.hash === '#jogos') {
            document.getElementById('jogos')?.scrollIntoView?.();
        }
    }, []);

    const escolherFiltro = (id: string) => {
        setFiltro(id);
        salvarFiltro(id);
    };

    return (
        <div className='center'>
            <WalkingRobot />
            <div className='home-wrapper'>
                <section className='options-preview home-boas-vindas'>
                    <div className='home-boas-vindas__topo'>
                        <HappyRobot />
                        <div className='home-boas-vindas__texto'>
                            <h2>
                                <button type='button' className='home-boas-vindas__nome' title='Editar nome' onClick={() => setEditandoNome(true)}>
                                    <span>{nome ? `Olá, ${nome}!` : 'Olá!'} 👋</span> <span aria-hidden='true'>✏️</span>
                                </button>
                            </h2>
                            <span className={`home-boas-vindas__dias${dias === 0 ? ' home-boas-vindas__dias--apagado' : ''}`}>
                                🔥 {dias === 0 ? 'Jogue hoje para acender o foguinho!' : `${dias} ${dias === 1 ? 'dia seguido' : 'dias seguidos'}`}
                            </span>
                        </div>
                    </div>
                    {editandoNome && <PerfilJogador onFechar={() => setEditandoNome(false)} />}
                    <BarraXp atalho={false} compacta />
                    <a className='global-button global-button--full-width' href={continuar ? rotaDoJogo(continuar) : tabuada ? rotaDoJogo(tabuada) : '/jogos'}>
                        <span className='option-link'>
                            {continuar ? `▶️ Continuar: ${continuar.nome}` : '🎮 Começar pela Tabuada'}
                        </span>
                    </a>
                </section>
                <DesafiosDoDia sequencia={false} destaque={hash === '#desafio-do-dia'} />
                <section id='jogos' className='home-jogos'>
                    <div className='home-jogos__topo'>
                        <h2>🎮 Escolha um jogo</h2>
                        <a className='home-jogos__todos' href='/jogos'>Ver todos os jogos</a>
                    </div>
                    <div className='home-jogos__filtros' role='group' aria-label='Filtrar jogos por habilidade'>
                        {filtros.map((item) => (
                            <button
                                key={item.id}
                                type='button'
                                className={`home-jogos__filtro${item.id === filtroAtual.id ? ' home-jogos__filtro--ativo' : ''}`}
                                aria-pressed={item.id === filtroAtual.id}
                                onClick={() => escolherFiltro(item.id)}
                            >
                                {item.nome}
                            </button>
                        ))}
                    </div>
                    <div className='home-jogos__grade'>
                        {jogos.filter(filtroAtual.incluir).map((jogo) => (
                            <a key={jogo.id} className={`home-jogo${jogo.id === 'tabuada' ? ' home-jogo--destaque' : ''}`} href={rotaDoJogo(jogo)}>
                                {(ehNovo(jogo) || jogo.id === favorito) && (
                                    <span className='home-jogo__selos'>
                                        {ehNovo(jogo) && <span className='home-jogo__selo'>✨ Novo!</span>}
                                        {jogo.id === favorito && <span className='home-jogo__selo home-jogo__selo--favorito'>⭐ Seu favorito</span>}
                                    </span>
                                )}
                                <span className='home-jogo__icone' aria-hidden='true'>{jogo.icone}</span>
                                <strong>{jogo.nome}</strong>
                                <span className='home-jogo__descricao'>{jogo.descricao}</span>
                                <span className='home-jogo__tags'>
                                    <span>🧠 {jogo.habilidade}</span>
                                    <span>👦 {jogo.idade}</span>
                                </span>
                            </a>
                        ))}
                    </div>
                </section>
                <nav className='home-atalhos' aria-label='Atalhos'>
                    <a className='home-atalho' href='/progresso?aba=conquistas'>🏅 Conquistas</a>
                    <a className='home-atalho' href='/progresso?aba=resultados'>📊 Resultados</a>
                    <a className='home-atalho' href='/ranking'>🏆 Ranking</a>
                    <a
                        className='home-atalho'
                        href='/personalizar'
                        aria-label={`Personalizar${recompensasNovas > 0 ? `, ${recompensasNovas} ${recompensasNovas === 1 ? 'item novo' : 'itens novos'}` : ''}`}
                    >
                        🎨 Personalizar
                        {recompensasNovas > 0 && <span className='nav-item__novo' aria-hidden='true'>{recompensasNovas}</span>}
                    </a>
                </nav>
                <section className='home-article-preview'>
                    <h2>👩‍🏫 Use em casa ou na sala de aula</h2>
                    <p>
                        Os jogos ajudam a reforçar a tabuada, o cálculo mental e o raciocínio lógico sem cara de lição. Veja por que aprender brincando funciona e dicas para usar os jogos com as crianças.
                    </p>
                    <div className='gap-default'>
                        <a className='global-button' href='/artigos/aprender-matematica-com-jogos'>
                            <span className='option-link'>
                                Aprender matemática com jogos
                            </span>
                        </a>
                        <a className='global-button' href='/artigos/dicas-para-ensinar-matematica-em-casa'>
                            <span className='option-link'>
                                Dicas para ensinar em casa
                            </span>
                        </a>
                        <a className='global-button' href='/artigos'>
                            <span className='option-link'>
                                Todos os artigos
                            </span>
                        </a>
                    </div>
                </section>
                <section className='home-description'>
                    <h1>🎯 Matemática divertida para todas as idades</h1>
                    <p>
                        Tabuada Divertida é uma plataforma educacional com jogos de matemática para estudantes de todas as idades praticarem de maneira leve e envolvente.
                        Tem tabuada de multiplicação, divisão, adição e subtração contra o relógio, corrida contra o robô, memória da tabuada, 2048, comparação de frações e decimais no Maior ou menor e desafios de lógica e padrões no Teste de QI com Números.
                    </p>
                    <p>
                        O site foi pensado para professores, responsáveis e alunos que buscam uma alternativa interativa para reforçar conteúdos básicos, desenvolver agilidade de raciocínio e ganhar confiança nas resoluções.
                        Rankings, desafios do dia, conquistas e acompanhamento de progresso incentivam o aprendizado contínuo, e tudo fica disponível direto no navegador, sem necessidade de instalação.
                    </p>
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
                        A tabuada existe há milhares de anos: babilônios e egípcios já usavam tabelas para facilitar os cálculos, e a <strong>Tabuada de Pitágoras</strong> organizou a multiplicação no formato de matriz que conhecemos até hoje. Saber fazer contas de cabeça continua trazendo agilidade, confiança e independência no dia a dia.
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