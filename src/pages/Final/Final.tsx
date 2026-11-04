import configData from "../../Config.json";
import { useLocation, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { lerNome } from '../../services/jogador';
import { compartilharResultado, conquistaDaMedalha, resultadoDaConquista, type ConquistaPartida, type ResultadoCompartilhado } from '../../services/compartilhar';
import great from '../../assets/great.png';
import donkey from '../../assets/donkey.png';
import WalkingRobot from "./../../components/WalkingRobot/WalkingRobot";
import SequenciaDias from "./../../components/SequenciaDias/SequenciaDias";
import RoboPersonalizado from "./../../components/RoboPersonalizado/RoboPersonalizado";
import BarraXp from "./../../components/BarraXp/BarraXp";
import CompartilharResultado from "./../../components/CompartilharResultado/CompartilharResultado";
import { buscarMedalha, nomeNivel } from '../../gamificacao/medalhas';

type Questao = {
    questao: string;
    resposta: string;
    correta: boolean;
};

type EstadoFinal = {
    conquistas?: { id: string; nivel: number }[];
    ganhoXp?: number;
    conquistasPartida?: ConquistaPartida[];
};

function Final(){
    const{tipo} = useParams();
    const location = useLocation();
    const[questoes , setQuestoes] = useState<Questao[]>([]);
    const [canShare, setCanShare] = useState(false);
    const conquistas = ((location.state as EstadoFinal | null)?.conquistas || []).flatMap(({ id, nivel }) => {
        const medalha = buscarMedalha(id);
        return medalha ? [{ medalha, nivel }] : [];
    });
    const ganhoXp = (location.state as EstadoFinal | null)?.ganhoXp;
    const isPerfect = localStorage.getItem(configData.QUANTIDADE_ACERTOS) === localStorage.getItem(configData.QUANTIDADE_PARAM);
    const isWorst = localStorage.getItem(configData.QUANTIDADE_ACERTOS) === '0';

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
        const nome = lerNome() || 'Jogador';
        const acertos = parseInt(localStorage.getItem(configData.QUANTIDADE_ACERTOS) || '0');
        const total = parseInt(localStorage.getItem(configData.QUANTIDADE_PARAM) || '0');
        const erros = Math.max(total - acertos, 0);
        const tempo = parseInt(localStorage.getItem(configData.TEMPO_PARAM) || '0');
        const pontuacao = localStorage.getItem(configData.PONTUACAO) || '0';
        const recorde = localStorage.getItem(configData.RECORDE) || '0';
        const percentual = total > 0 ? Math.round((acertos / total) * 100) : 0;
        const url = window.location.origin || 'https://www.tabuadadivertida.com';

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
            conquistas: (location.state as EstadoFinal | null)?.conquistasPartida || []
        };
    };

    const launchFireworks = () => {
        const confetti = (window as any).confetti;
        if (!confetti) return;

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
        <div className='global-pageContainer-left options-preview'>
            <WalkingRobot />
            <h2>
                {
                    isPerfect ?
                    <div className='congrats-final'>
                        <img src={great} alt="great"/>
                        <b>🎉Parabéns {lerNome() || 'Jogador'}, você é de outro planeta!!!🎉</b>
                    </div>
                    :
                    isWorst ?
                    <b>Você errou todas KKKKKKKKKKK</b>
                    :
                    <b>🎉Parabéns {lerNome() || 'Jogador'}, você é fera!!!🎉</b>
                }
            </h2>
            <br/>
            <div className='robot-container'>
                {isWorst ? <img src={donkey} alt='Robô triste' className='robot-donkey'/> : <RoboPersonalizado titulo='Robô feliz' className='robot'/>}
            </div>
            <SequenciaDias />
            <br/>
            {
                isPerfect ?
                <h3>
                    Você é um mestre da tabuada! 🧠💪<br/><br/>
                    ✅Você acertou {localStorage.getItem(configData.QUANTIDADE_ACERTOS)} de {localStorage.getItem(configData.QUANTIDADE_PARAM)} em tempo recorde! ⏱️⚡️<br/>
                    Você levou apenas {localStorage.getItem(configData.TEMPO_PARAM)} segundos! ⏱️<br/><br/>
                    Pontuação final: {localStorage.getItem(configData.PONTUACAO)} | Recorde: {localStorage.getItem(configData.RECORDE)}<br/><br/>
                    Compartilhe sua conquista com seus amigos e desafie-os a superar seu desempenho!<br/><br/>

                    🔥 Quão rápido você pode ser? Descubra em Tabuada Divertida! 💥
                </h3>
                :
                <h3>
                    Não foi dessa vez, sua pontuação não foi suficiente para entrar no ranking 😢🧠💪<br/><br/>
                    ✅Você acertou {localStorage.getItem(configData.QUANTIDADE_ACERTOS)} de {localStorage.getItem(configData.QUANTIDADE_PARAM)}! ⏱️⚡️<br/>
                    Você levou apenas {localStorage.getItem(configData.TEMPO_PARAM)} segundos! ⏱️<br/><br/>
                    Pontuação final: {localStorage.getItem(configData.PONTUACAO)} | Recorde: {localStorage.getItem(configData.RECORDE)}<br/><br/>
                    Compartilhe sua conquista com seus amigos e desafie-os a superar seu desempenho!<br/><br/>

                    🔥 Quão rápido você pode ser? Descubra em Tabuada Divertida! 💥
                </h3>
            }
            {
                conquistas.length > 0 &&
                <div className='respostasQuestoes'>
                    <h2>
                        🏅 Medalhas desta partida:
                    </h2>
                    <p>Toque numa medalha para compartilhar só ela.</p>
                    <div className='resultados-lista'>
                        {
                            conquistas.map(({ medalha, nivel }) => {
                                return(
                                    <button type='button' className='resultados-item resultados-item--botao' key={medalha.id} title='Compartilhar esta conquista' onClick={() => compartilharResultado(resultadoDaConquista(conquistaDaMedalha(medalha.id, nivel)[0]))}>
                                        <h3>
                                            {medalha.icone} {medalha.nome}{nomeNivel(medalha, nivel) && ` · ${nomeNivel(medalha, nivel)}`}
                                        </h3>
                                    </button>
                                )
                            })
                        }
                    </div>
                </div>
            }
            <div className='respostasQuestoes'>
                <h2>
                    Respostas:
                </h2>
                <div className='resultados-lista'>
                    {
                        questoes.map((questao, index) => {
                            return(
                                <div className='resultados-item' key={index}>
                                    <h3>
                                        {questao.questao} = {questao.resposta} {questao.correta ? '🎉' : '😫'}
                                    </h3>
                                </div>
                            )
                        })
                    }
                </div>
            </div>

            <div className='botoes'>
                <CompartilharResultado resultado={buildShareResult()} className='global-button global-button--full-width' rotulo={canShare ? 'Compartilhar resultado' : 'Copiar resultado'} classeRotulo='option-link' />
                <a className='global-button global-button--full-width' href={`/contagem/` + tipo}>
                    <span className='option-link'>
                        Jogar novamente
                    </span>
                </a>
                <a className='global-button global-button--full-width' href={`/ranking`}>
                    <span className='option-link'>
                        Ranking
                    </span>
                </a>
                <a className='global-button global-button--full-width' href="/progresso?aba=resultados">
                    <span className='option-link'>
                        Meus Resultados
                    </span>
                </a>
                <a className='global-button global-button--full-width' href="/progresso?aba=conquistas">
                    <span className='option-link'>
                        Minhas conquistas
                    </span>
                </a>
                <a className='global-button global-button--full-width' href="/">
                    <span className='option-link'>
                        Início
                    </span>
                </a>
            </div>
        </div>
        </>
    )
}

export default Final;
