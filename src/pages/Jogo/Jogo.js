import configData from "../../Config.json";
import Tempo from "../../components/Tempo";
import api from "../../services/api";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

function Jogo() {
    const { tipo } = useParams();
    const navigate = useNavigate();

    const [contador, setContador] = useState(0);
    const [respostasIncorretas, setRespostasIncorretas] = useState(1);
    const [respostasCorretas, setRespostasCorretas] = useState(1);
    const [contas1, setContas1] = useState([]);
    const [contas2, setContas2] = useState([]);
    const [contasCorrente, setContasCorrente] = useState('');
    const [resposta, setResposta] = useState('');
    const [loadding, setLoadding] = useState(false);
    const [pontuacao, setPontuacao] = useState(0);
    const [recorde, setRecorde] = useState(
        parseInt(localStorage.getItem(configData.RECORDE) || 0)
    );

    useEffect(() => {
        localStorage.setItem(configData.QUESTOES, JSON.stringify([]));
        localStorage.setItem(configData.PONTUACAO, 0);
        const qnt = parseInt(
            localStorage.getItem(configData.QUANTIDADE_PARAM) || 20
        );
        setContas1(LoadContas(qnt));
        setContas2(LoadContas(qnt));
    }, []);

    useEffect(() => {
        setContasCorrente(MontaConta());
    }, [contas1]);

    function RetornaMaximo() {
        if (tipo === 'S' || tipo === 'A') {
            return 100;
        }
        return 11;
    }

    function LoadContas(total) {
        const lista = [];
        for (let i = 0; i <= total; i++) {
            let num1 = 0;
            while (num1 === 0 || num1 === 1) {
                num1 = Math.floor(Math.random() * RetornaMaximo());
            }
            lista.push(num1);
        }
        return lista;
    }

    function MontaConta() {
        const n1 = contas1[contador];
        const n2 = contas2[contador];
        const t = ['x', '-', '+', '/'];
        let temp = '';

        if (tipo === 'D') {
            temp = `${n1 * n2}${t[3]}${n2}`;
        } else if (tipo === 'S') {
            temp = n1 > n2 ? `${n1}${t[1]}${n2}` : `${n2}${t[1]}${n1}`;
        } else if (tipo === 'A') {
            temp = `${n1}${t[2]}${n2}`;
        } else if (tipo === 'R') {
            const index = Math.floor(Math.random() * 4);
            if (index === 3) {
                temp = `${n1 * n2}${t[3]}${n2}`;
            } else if (index === 1) {
                temp = n1 > n2 ? `${n1}${t[1]}${n2}` : `${n2}${t[1]}${n1}`;
            } else {
                temp = `${n1}${t[index]}${n2}`;
            }
        } else {
            temp = `${n1}${t[0]}${n2}`;
        }

        setContador(contador + 1);
        return temp;
    }

    function respondeu(resposta) {
        if (Number.isInteger(parseInt(resposta))) {
            setResposta(resposta);
        } else {
            setResposta('');
        }
    }

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && resposta !== '') {
            const questoes = JSON.parse(
                localStorage.getItem(configData.QUESTOES)
            );

            let respostaCerta = false;
            if (contasCorrente.includes('x')) {
                respostaCerta =
                    parseInt(contasCorrente.split('x')[0]) *
                        parseInt(contasCorrente.split('x')[1]) ==
                    resposta;
            } else if (contasCorrente.includes('+')) {
                respostaCerta =
                    parseInt(contasCorrente.split('+')[0]) +
                        parseInt(contasCorrente.split('+')[1]) ==
                    resposta;
            } else if (contasCorrente.includes('-')) {
                respostaCerta =
                    parseInt(contasCorrente.split('-')[0]) -
                        parseInt(contasCorrente.split('-')[1]) ==
                        resposta ||
                    parseInt(contasCorrente.split('-')[1]) -
                        parseInt(contasCorrente.split('-')[0]) ==
                        resposta;
            } else if (contasCorrente.includes('/')) {
                respostaCerta =
                    parseInt(contasCorrente.split('/')[0]) /
                        parseInt(contasCorrente.split('/')[1]) ==
                    resposta;
            }

            questoes.push({ questao: contasCorrente, resposta, correta: respostaCerta });
            localStorage.setItem(configData.QUESTOES, JSON.stringify(questoes));

            let novaPontuacao = pontuacao;

            if (respostaCerta) {
                toast.success('Correto ✅');
                setRespostasCorretas(respostasCorretas + 1);
                novaPontuacao += 10;
            } else {
                toast.error('Incorreto 💥');
                setRespostasIncorretas(respostasIncorretas + 1);
                if (novaPontuacao >= 5) {
                    novaPontuacao -= 5;
                }
            }

            if (novaPontuacao > recorde) {
                setRecorde(novaPontuacao);
                localStorage.setItem(configData.RECORDE, novaPontuacao);
            }

            setPontuacao(novaPontuacao);
            localStorage.setItem(configData.PONTUACAO, novaPontuacao);

            setResposta('');
            if (
                contador + 1 ===
                parseInt(localStorage.getItem(configData.QUANTIDADE_PARAM) || 20) +
                    2
            ) {
                localStorage.setItem(
                    configData.QUANTIDADE_ACERTOS,
                    respostasCorretas
                );
                SetHistorico();
                Finaliza();
            } else {
                setContasCorrente(MontaConta());
            }
        }
    };

    function SetHistorico() {
        let historico = JSON.parse(localStorage.getItem(configData.HISTORICO));
        const questoes = JSON.parse(localStorage.getItem(configData.QUESTOES));

        if (historico == null) {
            historico = [];
        }

        const novo = {
            quantidadeQuestoes: localStorage.getItem(configData.QUANTIDADE_PARAM),
            quantidadeAcertos: localStorage.getItem(configData.QUANTIDADE_ACERTOS),
            tempo: localStorage.getItem(configData.TEMPO_PARAM),
            nome: localStorage.getItem(configData.NOME_PARAM),
            tipo,
            questoes
        };

        historico.push(novo);

        localStorage.setItem(configData.HISTORICO, JSON.stringify(historico));
    }

    async function Finaliza() {
        const data = {
            nome: localStorage.getItem(configData.NOME_PARAM),
            numeroAcertos: respostasCorretas,
            numeroQuestoes:
                localStorage.getItem(configData.QUANTIDADE_PARAM) || 20,
            tipo,
            tempo: localStorage.getItem(configData.TEMPO_PARAM),
            pontuacao
        };

        localStorage.setItem(configData.PONTUACAO, pontuacao);
        setLoadding(true);
        await api
            .post(`/ResultadosTabuadaDivertida`, data)
            .then(() => {
                navigate('/final/' + tipo, { replace: true });
            })
            .catch(() => {
                navigate('/error', { replace: true });
            });
    }

    if (
        tipo.toUpperCase() !== 'M' &&
        tipo.toUpperCase() !== 'D' &&
        tipo.toUpperCase() !== 'A' &&
        tipo.toUpperCase() !== 'R' &&
        tipo.toUpperCase() !== 'S'
    ) {
        return (
            <div className='container'>
                <div className='not-found'>
                    Não existe essa opção.
                    <Link to='/'>Home</Link>
                </div>
            </div>
        );
    }

    if (loadding) {
        return (
            <div className='loaddingDiv'>
                <div className='lds-ring'>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
            </div>
        );
    }

    return (
        <div className='game'>
            <div className='global-pageContainer-left'>
                <div className='tempo'>
                    <Tempo />
                    <div>
                        <div className='tempo'>
                            <h1>
                                🏋️ {contador - 1} de{' '}
                                {localStorage.getItem(configData.QUANTIDADE_PARAM) || 20}
                            </h1>
                            <h2>🎯 Pontuação: {pontuacao} | Recorde: {recorde}</h2>
                        </div>
                        <div className='info-completo'>
                            <button
                                className='button-base'
                                onClick={() => window.location.reload(false)}
                            >
                                Restart
                            </button>
                        </div>
                    </div>
                </div>
                <div className='divJogo'>
                    <h3>{contasCorrente}</h3>
                    <input
                        type='number'
                        value={resposta}
                        onChange={(e) => respondeu(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoFocus={true}
                    />
                </div>
            </div>
        </div>
    );
}

export default Jogo;
