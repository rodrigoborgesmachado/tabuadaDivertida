import configData from "../../Config.json";
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { lerNome } from '../../services/jogador';
import { compartilharResultado, conquistaDaMedalha, resultadoDaConquista, type ConquistaPartida, type ResultadoCompartilhado } from '../../services/compartilhar';
import { urlDoSite } from '../../services/plataforma';
import type { Questao } from '../../services/historico';
import great from '../../assets/great.png';
import donkey from '../../assets/donkey.png';
import WalkingRobot from "./../../components/WalkingRobot/WalkingRobot";
import SequenciaDias from "./../../components/SequenciaDias/SequenciaDias";
import RoboPersonalizado from "./../../components/RoboPersonalizado/RoboPersonalizado";
import BarraXp from "./../../components/BarraXp/BarraXp";
import CompartilharResultado from "./../../components/CompartilharResultado/CompartilharResultado";
import { buscarMedalha, nomeNivel } from '../../gamificacao/medalhas';
import { contasErradas, desempenhoDaPartida, mensagemDoDesempenho, respostasDaPartida } from './logic';
import './Final.css';

type EstadoFinal = {
    conquistas?: { id: string; nivel: number }[];
    ganhoXp?: number;
    conquistasPartida?: ConquistaPartida[];
    novoRecorde?: boolean;
};

function Final(){
    const{tipo} = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const[questoes , setQuestoes] = useState<Questao[]>([]);
    const [canShare, setCanShare] = useState(false);
    const [respostasAbertas, setRespostasAbertas] = useState(false);
    const estado = location.state as EstadoFinal | null;
    const conquistas = (estado?.conquistas || []).flatMap(({ id, nivel }) => {
        const medalha = buscarMedalha(id);
        return medalha ? [{ medalha, nivel }] : [];
    });
    const ganhoXp = estado?.ganhoXp;
    const nome = lerNome() || 'Jogador';
    const acertos = parseInt(localStorage.getItem(configData.QUANTIDADE_ACERTOS) || '0');
    const total = parseInt(localStorage.getItem(configData.QUANTIDADE_PARAM) || '0');
    const tempo = parseInt(localStorage.getItem(configData.TEMPO_PARAM) || '0');
    const pontuacao = localStorage.getItem(configData.PONTUACAO) || '0';
    const recorde = localStorage.getItem(configData.RECORDE) || '0';
    const percentual = total > 0 ? Math.round((acertos / total) * 100) : 0;
    const desempenho = desempenhoDaPartida(acertos, total);
    const isPerfect = desempenho === 'perfeito';
    const isWorst = desempenho === 'zero';
    const mensagem = mensagemDoDesempenho(desempenho, nome);
    const respostas = respostasDaPartida(questoes);
    const respostasCertas = respostas.filter(({ correta }) => correta).length;
    const erradas = contasErradas(questoes);

    const labelTipo = (valor?: string) => {
        const tipoSelecionado = (valor || '').toUpperCase();

        if (tipoSelecionado === 'R') return 'Aleatório';
        if (tipoSelecionado === 'D') return 'Divisão';
        if (tipoSelecionado === 'S') return 'Subtração';
        if (tipoSelecionado === 'A') return 'Adição';
        if (tipoSelecionado === 'E') return 'Expressões Numéricas';
        if (tipoSelecionado === 'T') return 'Treino dos erros';
        return 'Multiplicação';
    };

    const formatDate = () => {
        return new Intl.DateTimeFormat('pt-BR', {
            day: 'numeric',
            month: 'long'
        }).format(new Date());
    };

    const pluralize = (valor: number, singular: string, plural: string) => {
        return `${valor} ${valor === 1 ? singular : plural}`;
    };

    const buildShareResult = (): ResultadoCompartilhado => {
        const erros = Math.max(total - acertos, 0);
        const url = urlDoSite();

        return {
            jogo: 'Tabuada Divertida',
            linhas: [
                `Este foi meu resultado na Tabuada Divertida de ${formatDate()}!`,
                `👤 Jogador: ${nome}`,
                `🧮 Modo: ${labelTipo(tipo)}`,
                `🎯 Acertos: ${acertos}/${total} (${percentual}%)`,
                `❌ Erros: ${pluralize(erros, 'erro', 'erros')}`,
                `⏱️ Tempo: ${pluralize(tempo, 'segundo', 'segundos')}`,
                `⭐ Pontuação: ${pontuacao}`,
                `🏆 Recorde: ${recorde}`
            ],
            convite: `Você consegue fazer melhor? ${url}`,
            resumo: `${labelTipo(tipo)}: ${acertos}/${total} em ${tempo}s`,
            conquistas: estado?.conquistasPartida || []
        };
    };

    const treinarErros = () => {
        localStorage.setItem(configData.TREINO, JSON.stringify(erradas));
        localStorage.setItem(configData.QUANTIDADE_PARAM, String(erradas.length));
        navigate('/contagem/T');
    };

    const launchFireworks = () => {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval = setInterval(() => {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            });
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            });
        }, 250);
    };

    useEffect(() => {
        setQuestoes(JSON.parse(localStorage.getItem(configData.QUESTOES) || '[]'));
        setCanShare(typeof navigator !== 'undefined' && 'share' in navigator);
        if(isPerfect){
            launchFireworks();
        }
        return() =>{

        }
    }, [isPerfect]);

    return(
        <>
        <div className='global-pageContainer-left'>
            {ganhoXp !== undefined && <BarraXp ganho={ganhoXp} />}
        </div>
        <div className='global-pageContainer-left options-preview final'>
            <WalkingRobot />
            <div className='robot-container'>
                {isWorst ? <img src={donkey} alt='Robô triste' className='robot-donkey'/> : <RoboPersonalizado titulo='Robô feliz' className='robot'/>}
            </div>
            <div className='final-cabecalho'>
                {isPerfect && <img src={great} alt='great' className='final-cabecalho__imagem'/>}
                <h2>{mensagem.titulo}</h2>
                <p>{mensagem.texto}</p>
                <p className='final-cabecalho__modo'>{labelTipo(tipo)} · {acertos} de {total}</p>
                {estado?.novoRecorde && <span className='final-selo'>🏆 Novo recorde!</span>}
            </div>
            <SequenciaDias />
            <div className='final-numeros'>
                <div className='final-numero'>
                    <span>🎯 Acertos</span>
                    <strong>{acertos}/{total} · {percentual}%</strong>
                </div>
                <div className='final-numero'>
                    <span>⏱️ Tempo</span>
                    <strong>{pluralize(tempo, 'segundo', 'segundos')}</strong>
                </div>
                <div className='final-numero'>
                    <span>⭐ Pontuação</span>
                    <strong>{pontuacao}</strong>
                </div>
                <div className='final-numero'>
                    <span>🏆 Recorde</span>
                    <strong>{recorde}</strong>
                </div>
            </div>
            {
                conquistas.length > 0 &&
                <div className='final-medalhas'>
                    <p>🏅 Medalhas desta partida <small>(toque para compartilhar)</small></p>
                    <div className='final-medalhas__lista'>
                        {
                            conquistas.map(({ medalha, nivel }) => {
                                return(
                                    <button type='button' className='final-medalha' key={medalha.id} title='Compartilhar esta conquista' onClick={() => compartilharResultado(resultadoDaConquista(conquistaDaMedalha(medalha.id, nivel)[0]))}>
                                        {medalha.icone} {medalha.nome}{nomeNivel(medalha, nivel) && ` · ${nomeNivel(medalha, nivel)}`}
                                    </button>
                                )
                            })
                        }
                    </div>
                </div>
            }

            <div className='final-acoes'>
                <a className='global-button global-button--full-width' href={`/contagem/` + tipo}>
                    <span className='option-link'>
                        🔁 Jogar novamente
                    </span>
                </a>
                <div className='final-acoes__linha'>
                    <a className='global-button global-button--back' href='/selecionarjogo'>
                        <span className='option-link'>
                            🔀 Mudar jogo
                        </span>
                    </a>
                    <CompartilharResultado resultado={buildShareResult()} className='global-button final-botao' rotulo={canShare ? '📤 Compartilhar' : '📋 Copiar resultado'} classeRotulo='option-link' />
                </div>
                {
                    erradas.length > 0 &&
                    <button type='button' className='global-button final-botao' onClick={treinarErros}>
                        <span className='option-link'>
                            🎯 Treinar {erradas.length === 1 ? 'o erro' : `os ${erradas.length} erros`}
                        </span>
                    </button>
                }
                {
                    respostas.length > 0 &&
                    <div className='final-respostas'>
                        <button type='button' className='final-respostas__botao' aria-expanded={respostasAbertas} onClick={() => setRespostasAbertas(!respostasAbertas)}>
                            <span>📋 Ver respostas · {pluralize(respostasCertas, 'certa', 'certas')}, {pluralize(respostas.length - respostasCertas, 'errada', 'erradas')}</span>
                            <span aria-hidden='true'>{respostasAbertas ? '▲' : '▼'}</span>
                        </button>
                        {
                            respostasAbertas &&
                            <ul className='final-respostas__lista'>
                                {
                                    respostas.map((resposta, index) => {
                                        return(
                                            <li className={`final-resposta ${resposta.correta ? 'final-resposta--certa' : 'final-resposta--errada'}`} key={index}>
                                                {resposta.questao} = {
                                                    resposta.correta || resposta.certa === null ?
                                                    resposta.resposta
                                                    :
                                                    <><s>{resposta.resposta}</s> <strong>{resposta.certa}</strong></>
                                                } {resposta.correta ? '🎉' : '😫'}
                                            </li>
                                        )
                                    })
                                }
                            </ul>
                        }
                    </div>
                }
            </div>

            <nav className='final-atalhos' aria-label='Mais opções'>
                <a href='/ranking'>
                    <span aria-hidden='true'>🏆</span>
                    Ranking
                </a>
                <a href='/progresso'>
                    <span aria-hidden='true'>📈</span>
                    Meu progresso
                </a>
                <a href='/'>
                    <span aria-hidden='true'>🏠</span>
                    Início
                </a>
            </nav>
        </div>
        </>
    )
}

export default Final;
