/* eslint-disable react-hooks/exhaustive-deps */
import configData from "../../Config.json";
import Tempo from '../../components/Tempo';
import api from '../../services/api';
import { KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import PacmanLoader from "../../components/PacmanLoader/PacmanLoader";
import Keypad from "../../components/Keypad/Keypad";
import happyRobot from '../../assets/robot-happy.svg';
import neutralRobot from '../../assets/robot-neutral.svg';
import sadRobot from '../../assets/robot-sad.svg';

type ContaGerada = {
    texto: string;
    resposta: number;
};

function Jogo(){
    const { tipo } = useParams();
    const tipoSelecionado = (tipo || '').toUpperCase();
    const [contador, setContador] = useState(0);
    const [respostasIncorretas, setRespostasIncorretas] = useState(0);
    const [respostasCorretas, setRespostasCorretas] = useState(0);
    const [contas1, setContas1] = useState<number[]>([]);
    const [contas2, setContas2] = useState<number[]>([]);
    const [contasCorrente, setContasCorrente] = useState('');
    const [respostaEsperada, setRespostaEsperada] = useState<number | null>(null);
    const [resposta, setResposta] = useState('');
    const navigate = useNavigate();
    const [loadding, setLoadding] = useState(false);
    const [pontuacao, setPontuacao] = useState(0);
    const [recorde, setRecorde] = useState(parseInt(localStorage.getItem(configData.RECORDE) || '0'));
    const [wrongStreak, setWrongStreak] = useState(0);
    const [robotMood, setRobotMood] = useState<'happy' | 'neutral' | 'sad'>('neutral');
    const audioCtxRef = useRef<AudioContext | null>(null);

    function ensureAudioCtx() {
        const AnyAudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
        if (!audioCtxRef.current && AnyAudioCtx) {
            audioCtxRef.current = new AnyAudioCtx();
        }
        if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume().catch(() => {});
        }
        return audioCtxRef.current;
    }

    function playBeep(freq: number, durationMs: number, type: OscillatorType = 'sine', volume = 0.08, delayMs = 0) {
        try {
            if (localStorage.getItem(configData.SOUND_MUTED) === '1') return;
        } catch {}
        const ctx = ensureAudioCtx();
        if (!ctx) return;
        const now = ctx.currentTime + (delayMs / 1000);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(volume, now + 0.01);
        const endTime = now + durationMs / 1000;
        gain.gain.exponentialRampToValueAtTime(0.0001, endTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(endTime + 0.01);
    }

    function playSuccess() {
        playBeep(660, 90, 'sine', 0.08, 0);
        playBeep(880, 100, 'sine', 0.08, 80);
    }

    function playError() {
        playBeep(220, 220, 'square', 0.06, 0);
    }

    function numeroAleatorio(min: number, max: number){
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function montaExpressaoNumerica(): ContaGerada {
        const criaTemplateDivisaoComParenteses = (): ContaGerada => {
            const a = numeroAleatorio(1, 9);
            const b = numeroAleatorio(1, 9);
            const c = numeroAleatorio(2, 10);
            const numerador = (a + b) * c;
            const divisores: number[] = [];

            for(let i = 2; i <= 18; i++){
                if(numerador % i === 0){
                    divisores.push(i);
                }
            }

            if(divisores.length === 0){
                return { texto: '', resposta: -1 };
            }

            const denominador = divisores[numeroAleatorio(0, divisores.length - 1)];
            const menorD = Math.max(1, denominador - 9);
            const maiorD = Math.min(9, denominador - 1);

            if(menorD > maiorD){
                return { texto: '', resposta: -1 };
            }

            const d = numeroAleatorio(menorD, maiorD);
            const e = denominador - d;

            return {
                texto: `(${a}+${b}) x ${c} ÷ (${d}+${e})`,
                resposta: numerador / denominador
            };
        };

        const criaTemplateSomaMultiplicacao = (): ContaGerada => {
            const a = numeroAleatorio(2, 9);
            const b = numeroAleatorio(2, 9);
            const c = numeroAleatorio(1, 9);
            const d = numeroAleatorio(1, 9);

            return {
                texto: `(${a}x${b}) + (${c}x${d})`,
                resposta: (a * b) + (c * d)
            };
        };

        const criaTemplateMultiplicacaoSubtracao = (): ContaGerada => {
            const a = numeroAleatorio(1, 9);
            const b = numeroAleatorio(1, 9);
            const c = numeroAleatorio(2, 10);
            const d = numeroAleatorio(1, c - 1);

            return {
                texto: `(${a}+${b}) x (${c}-${d})`,
                resposta: (a + b) * (c - d)
            };
        };

        const templates = [
            criaTemplateDivisaoComParenteses,
            criaTemplateSomaMultiplicacao,
            criaTemplateMultiplicacaoSubtracao
        ];

        for(let i = 0; i < 100; i++){
            const conta = templates[numeroAleatorio(0, templates.length - 1)]();

            if(Number.isInteger(conta.resposta) && conta.resposta >= 0 && conta.resposta <= 100){
                return conta;
            }
        }

        const n1 = numeroAleatorio(2, 10);
        const n2 = numeroAleatorio(2, 10);
        return {
            texto: `${n1}x${n2}`,
            resposta: n1 * n2
        };
    }

    const isMobile = useMemo(() => {
        if (typeof navigator === 'undefined') return false;
        const ua = navigator.userAgent || '';
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) ||
               (typeof window !== 'undefined' && (window as any).matchMedia && (window as any).matchMedia('(pointer: coarse)').matches);
    }, []);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        localStorage.setItem(configData.QUESTOES, JSON.stringify([]));
        localStorage.setItem(configData.PONTUACAO, '0');

        if(tipoSelecionado === 'E'){
            setContasCorrente(MontaConta());
            return;
        }

        const total = parseInt(localStorage.getItem(configData.QUANTIDADE_PARAM) || '20');
        setContas1(LoadContas(total));
        setContas2(LoadContas(total));
    }, []);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if(tipoSelecionado === 'E'){
            return;
        }

        if(contas1.length === 0 || contas2.length === 0){
            return;
        }

        setContasCorrente(MontaConta());
    }, [contas1, contas2]);

    function RetornaMaximo(){
        let retorno = 11;

        if(tipoSelecionado === 'R'){
            retorno = 11;
        }
        else if(tipoSelecionado === 'D'){
            retorno = 11;
        }
        else if (tipoSelecionado === 'S'){
            retorno = 100;
        }
        else if (tipoSelecionado === 'A'){
            retorno = 100;
        }

        return retorno;
    }

    function LoadContas(total: number){
        const lista: number[] = [];
        for(let i = 0; i < total; i++){
            let num1 = 0;
            while(num1 === 0 || num1 === 1){
                num1 = Math.floor(Math.random() * RetornaMaximo());
            }
            lista.push(num1);
        }
        return lista;
    }

    function MontaConta(){
        let conta: ContaGerada = {
            texto: '',
            resposta: 0
        };

        if(tipoSelecionado === 'E'){
            conta = montaExpressaoNumerica();
        }
        else{
            const n1 = contas1[contador];
            const n2 = contas2[contador];
            const operadores = ['x', '-', '+', '÷'];

            if(tipoSelecionado === 'D'){
                conta = {
                    texto: (n1 * n2) + operadores[3] + n2,
                    resposta: n1
                };
            }
            else if (tipoSelecionado === 'S'){
                if(n1 > n2){
                    conta = {
                        texto: n1 + operadores[1] + n2,
                        resposta: n1 - n2
                    };
                }
                else{
                    conta = {
                        texto: n2 + operadores[1] + n1,
                        resposta: n2 - n1
                    };
                }
            }
            else if (tipoSelecionado === 'A'){
                conta = {
                    texto: n1 + operadores[2] + n2,
                    resposta: n1 + n2
                };
            }
            else if (tipoSelecionado === 'R'){
                const index = Math.floor(Math.random() * 4);
                if(index === 3){
                    conta = {
                        texto: (n1 * n2) + operadores[3] + n2,
                        resposta: n1
                    };
                }
                else if(index === 1){
                    if(n1 > n2){
                        conta = {
                            texto: n1 + operadores[1] + n2,
                            resposta: n1 - n2
                        };
                    }
                    else{
                        conta = {
                            texto: n2 + operadores[1] + n1,
                            resposta: n2 - n1
                        };
                    }
                }
                else{
                    conta = {
                        texto: n1 + operadores[index] + n2,
                        resposta: index === 0 ? (n1 * n2) : (n1 + n2)
                    };
                }
            }
            else{
                conta = {
                    texto: n1 + operadores[0] + n2,
                    resposta: n1 * n2
                };
            }
        }

        setRespostaEsperada(conta.resposta);
        setContador(contador + 1);
        return conta.texto;
    }

    function respondeu(valor: string){
        if (valor === '') {
            setResposta('');
            return;
        }

        if (/^-?\d+$/.test(valor)) {
            setResposta(valor);
        }
        else{
            setResposta('');
        }
    }

    const submitAnswer = () => {
        if (resposta !== '' && respostaEsperada !== null) {
            const questoes = JSON.parse(localStorage.getItem(configData.QUESTOES) || '[]');

            const totalQuestoes = parseInt(localStorage.getItem(configData.QUANTIDADE_PARAM) || '20');
            const respostaNumerica = parseInt(resposta, 10);
            const respostaCerta = respostaNumerica === respostaEsperada;

            questoes.push({
                questao: contasCorrente,
                resposta: resposta,
                correta: respostaCerta
            });

            localStorage.setItem(configData.QUESTOES, JSON.stringify(questoes));

            let novaPontuacao = pontuacao;
            let novosAcertos = respostasCorretas;
            let novasIncorretas = respostasIncorretas;

            if(respostaCerta){
                toast.success('Correto 🤩✅');
                novosAcertos += 1;
                setRespostasCorretas(novosAcertos);
                novaPontuacao += 10;
                setWrongStreak(0);
                setRobotMood('happy');
                playSuccess();
            }
            else{
                toast.error('Incorreto 😤💥');
                novasIncorretas += 1;
                setRespostasIncorretas(novasIncorretas);
                if(novaPontuacao >= 5){
                    novaPontuacao -= 5;
                }
                const nextStreak = wrongStreak + 1;
                setWrongStreak(nextStreak);
                setRobotMood(nextStreak >= 2 ? 'sad' : 'neutral');
                playError();
            }

            if(novaPontuacao > recorde){
                setRecorde(novaPontuacao);
                localStorage.setItem(configData.RECORDE, String(novaPontuacao));
            }

            setPontuacao(novaPontuacao);
            localStorage.setItem(configData.PONTUACAO, String(novaPontuacao));

            setResposta('');
            if(contador === totalQuestoes){
                localStorage.setItem(configData.QUANTIDADE_ACERTOS, String(novosAcertos));
                SetHistorico();
                Finaliza(novaPontuacao, novosAcertos);
            }else{
                setContasCorrente(MontaConta());
            }
        }
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            submitAnswer();
        }
    };

    function SetHistorico(){
        let historico = JSON.parse(localStorage.getItem(configData.HISTORICO) || 'null');
        const questoes = JSON.parse(localStorage.getItem(configData.QUESTOES) || '[]');

        if(historico == null){
            historico = [];
        }

        const novo = {
            quantidadeQuestoes: localStorage.getItem(configData.QUANTIDADE_PARAM),
            quantidadeAcertos: localStorage.getItem(configData.QUANTIDADE_ACERTOS),
            tempo: localStorage.getItem(configData.TEMPO_PARAM),
            nome: localStorage.getItem(configData.NOME_PARAM),
            tipo: tipoSelecionado,
            questoes: questoes
        };

        historico.push(novo);

        localStorage.setItem(configData.HISTORICO, JSON.stringify(historico));
    }

    async function Finaliza(novaPontuacao: number, numeroAcertos: number){
        const nome = String(localStorage.getItem(configData.NOME_PARAM) || '');
        if(nome.length > 15){
            toast.warn('Nome deve ter no máximo 15 caracteres.');
            return;
        }

        const data = {
            nome: nome,
            numeroAcertos: numeroAcertos,
            numeroQuestoes: localStorage.getItem(configData.QUANTIDADE_PARAM) || 20,
            tipo: tipoSelecionado,
            tempo: localStorage.getItem(configData.TEMPO_PARAM),
            pontuacao: novaPontuacao
        };

        localStorage.setItem(configData.PONTUACAO, String(novaPontuacao));
        setLoadding(true);
        await api.post(`/ResultadosTabuadaDivertida`, data)
        .then(() => {
            navigate('/final/' + tipoSelecionado, { replace: true });
        }).catch(() => {
            navigate('/error', { replace: true });
            return;
        });
    }

    if(!['M', 'D', 'A', 'R', 'S', 'E'].includes(tipoSelecionado)){
        return(
            <div className='container'>
                <div className='not-found'>
                    Não existe essa opção.
                    <a href="/">Home</a>
                </div>
            </div>
        );
    }

    if(loadding){
        return(
            <PacmanLoader dots={7} mouthAngle={40} pellets={[7]} size={64}/>
        );
    }

    return(
        <div className="game">
            <div className='home-robot-container game-robot-fixed' style={{ pointerEvents: 'none' }}>
                <img
                    src={robotMood === 'happy' ? happyRobot : robotMood === 'sad' ? sadRobot : neutralRobot}
                    alt='Robô'
                    className='home-robot'
                    style={{ cursor: 'default' }}
                />
            </div>
            <div className='global-pageContainer-left options-preview'>
                <div className='game-header'>
                    <div className='info-game'>
                        <h1>🏋️ {contador} de {localStorage.getItem(configData.QUANTIDADE_PARAM) || 20}</h1>
                        <h1>🎯 Pontuação: {pontuacao}</h1>
                    </div>
                    <div className='info-game'>
                        <Tempo/>
                        <button className='button-base' onClick={() => navigate('/contagem/' + tipoSelecionado, { replace: true })}>Restart</button>
                    </div>
                </div>
                <div className='divJogo'>
                    <h3>
                        {contasCorrente}
                    </h3>
                    <input
                        type={isMobile ? 'text' : 'number'}
                        inputMode={isMobile ? 'none' : 'numeric'}
                        value={resposta}
                        onChange={(e) => respondeu(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        readOnly={isMobile}
                        disabled={isMobile}
                    />
                    {isMobile && (
                        <Keypad
                            value={resposta}
                            onChange={(val) => respondeu(val)}
                            onEnter={submitAnswer}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default Jogo;
