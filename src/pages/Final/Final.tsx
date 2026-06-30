import configData from "../../Config.json";
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import happyRobot from '../../assets/robot-happy.svg';
import great from '../../assets/great.png';
import donkey from '../../assets/donkey.png';
import WalkingRobot from "./../../components/WalkingRobot/WalkingRobot";

type Questao = {
    questao: string;
    resposta: string;
    correta: boolean;
};

function Final(){
    const{tipo} = useParams();
    const[questoes , setQuestoes] = useState<Questao[]>([]);
    const [canShare, setCanShare] = useState(false);
    const isPerfect = localStorage.getItem(configData.QUANTIDADE_ACERTOS) === localStorage.getItem(configData.QUANTIDADE_PARAM);
    const isWorst = localStorage.getItem(configData.QUANTIDADE_ACERTOS) === '0';

    const labelTipo = (valor?: string) => {
        const tipoSelecionado = (valor || '').toUpperCase();

        if (tipoSelecionado === 'R') return 'Aleatório';
        if (tipoSelecionado === 'D') return 'Divisão';
        if (tipoSelecionado === 'S') return 'Subtração';
        if (tipoSelecionado === 'A') return 'Adição';
        if (tipoSelecionado === 'E') return 'Expressões Numéricas';
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

    const buildShareText = () => {
        const nome = localStorage.getItem(configData.NOME_PARAM) || 'Jogador';
        const acertos = parseInt(localStorage.getItem(configData.QUANTIDADE_ACERTOS) || '0');
        const total = parseInt(localStorage.getItem(configData.QUANTIDADE_PARAM) || '0');
        const erros = Math.max(total - acertos, 0);
        const tempo = parseInt(localStorage.getItem(configData.TEMPO_PARAM) || '0');
        const pontuacao = localStorage.getItem(configData.PONTUACAO) || '0';
        const recorde = localStorage.getItem(configData.RECORDE) || '0';
        const percentual = total > 0 ? Math.round((acertos / total) * 100) : 0;
        const url = window.location.origin || 'https://www.tabuadadivertida.com';

        return [
            `Este foi meu resultado na Tabuada Divertida de ${formatDate()}!`,
            `👤 Jogador: ${nome}`,
            `🧮 Modo: ${labelTipo(tipo)}`,
            `🎯 Acertos: ${acertos}/${total} (${percentual}%)`,
            `❌ Erros: ${pluralize(erros, 'erro', 'erros')}`,
            `⏱️ Tempo: ${pluralize(tempo, 'segundo', 'segundos')}`,
            `⭐ Pontuação: ${pontuacao}`,
            `🏆 Recorde: ${recorde}`,
            '',
            `Você consegue fazer melhor? ${url}`
        ].join('\n');
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

    const handleShare = async () => {
        const text = buildShareText();

        try {
            if (canShare) {
                await (navigator as any).share({
                    title: 'Tabuada Divertida',
                    text
                });
                return;
            }

            if (navigator.clipboard) {
                await navigator.clipboard.writeText(text);
                toast.success('Resultado copiado para compartilhar.');
                return;
            }

            window.prompt('Copie seu resultado:', text);
        } catch (err) {
            // Usuário cancelou ou não foi possível compartilhar; silencie o erro.
        }
    };

    return(
        <div className='global-pageContainer-left options-preview'>
            <WalkingRobot />
            <h2>
                {
                    isPerfect ?
                    <div className='congrats-final'>
                        <img src={great} alt="great"/>
                        <b>🎉Parabéns {localStorage.getItem(configData.NOME_PARAM)}, você é de outro planeta!!!🎉</b>
                    </div>
                    :
                    isWorst ?
                    <b>Você errou todas KKKKKKKKKKK</b>
                    :
                    <b>🎉Parabéns {localStorage.getItem(configData.NOME_PARAM)}, você é fera!!!🎉</b>
                }
            </h2>
            <br/>
            <div className='robot-container'>
                <img src={isPerfect ? happyRobot : isWorst ? donkey : happyRobot} alt={isPerfect ? 'Robô feliz' : 'Robô triste'} className={isWorst ? 'robot-donkey' : 'robot'}/>
            </div>
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
                <button type='button' className='global-button global-button--full-width' onClick={handleShare}>
                    <span className='option-link'>
                        {canShare ? 'Compartilhar resultado' : 'Copiar resultado'}
                    </span>
                </button>
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
                <a className='global-button global-button--full-width' href="/resultados">
                    <span className='option-link'>
                        Meus Resultados
                    </span>
                </a>
                <a className='global-button global-button--full-width' href="/">
                    <span className='option-link'>
                        Início
                    </span>
                </a>
            </div>
        </div>
    )
}

export default Final;
