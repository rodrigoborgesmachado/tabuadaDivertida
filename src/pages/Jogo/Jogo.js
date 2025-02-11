import configData from "../../Config.json";
import Tempo from '../../components/Tempo';
import api from '../../services/api';
import {Link} from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {toast} from 'react-toastify';

function Jogo(){
    const{tipo} = useParams();
    const[contador, setContador] = useState(0);
    const[respostasIncorretas, setRespostasIncorretas] = useState(1);
    const[respostasCorretas, setRespostasCorretas] = useState(1);
    const[contas1, setContas1] = useState([]);
    const[contas2, setContas2] = useState([]);
    const[contasCorrente, setContasCorrente] = useState('');
    const[resposta, setResposta] = useState('');
    const navigate = useNavigate();
    const[loadding, setLoadding] = useState(false);

    useEffect(() => {
        localStorage.setItem(configData.QUESTOES, JSON.stringify([]));
        setContas1(LoadContas(parseInt(localStorage.getItem(configData.QUANTIDADE_PARAM) || 20)));
        setContas2(LoadContas(parseInt(localStorage.getItem(configData.QUANTIDADE_PARAM) || 20)));
        return() =>{

        }
    }, []);

    useEffect(() => {
        setContasCorrente(MontaConta());
        return() =>{

        }
    }, [contas1]);

    function RetornaMaximo(){
        var retorno = 11;

        if(tipo === 'R'){
            retorno = 11;
        }
        else if(tipo === 'D'){
            retorno = 11;
        }
        else if (tipo === 'S'){
            retorno = 100;
        }
        else if (tipo === 'A'){
            retorno = 100;
        }

        return retorno;
    }

    function LoadContas(total){
        var lista = [];
        for(let i = 0; i<= total;i++){
            var num1 = 0;
            while(num1 === 0 || num1 === 1){
                num1 = Math.floor(Math.random() * RetornaMaximo());
            }
            lista.push(num1);
        }
        return lista;
    }

    function MontaConta(){
        let n1 = contas1[contador];
        let n2 = contas2[contador];
        let t = ['x', '-', '+', '/'];
        let temp = '';

        if(tipo === 'D'){
            temp += (n1*n2) + t[3] + n2;
        }
        else if (tipo === 'S'){
            if(n1 > n2){
                temp += n1 + t[1] + n2;
            }
            else{
                temp += n2 + t[1] + n1;
            }
        }
        else if (tipo === 'A'){
            temp += n1 + t[2] + n2;
        }
        else if (tipo === 'R'){
            let index = Math.floor(Math.random() * 4);
            if(index === 3){
                temp += (n1*n2) + t[3] + n2;
            }
            else if(index === 1){
                if(n1 > n2){
                    temp += n1 + t[1] + n2;
                }
                else{
                    temp += n2 + t[1] + n1;
                }
            }
            else{
                temp += n1 + t[index] + n2;
            }
        }
        else{
            temp += n1 + t[0] + n2;
        }

        setContador(contador+1);
        return temp;
    }

    function respondeu(resposta){
        if (Number.isInteger(parseInt(resposta))) {
            setResposta(resposta);            
        }
        else{
            setResposta('');
        }
    }

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && resposta != '') {
            var questoes = JSON.parse(localStorage.getItem(configData.QUESTOES));

            let respostaCerta = false;

            if(contasCorrente.includes('x')){
                if(resposta == parseInt(contasCorrente.split('x')[0]) * parseInt(contasCorrente.split('x')[1])){
                    respostaCerta = true;
                }
            }
            else if(contasCorrente.includes('+')){
                if(resposta == parseInt(contasCorrente.split('+')[0]) + parseInt(contasCorrente.split('+')[1])){
                    respostaCerta = true;
                }
            }
            else if(contasCorrente.includes('-')){
                if(resposta == parseInt(contasCorrente.split('-')[0]) - parseInt(contasCorrente.split('-')[1]) || 
                    resposta == parseInt(contasCorrente.split('-')[1]) - parseInt(contasCorrente.split('-')[0])){
                    respostaCerta = true;
                }
            }
            else if(contasCorrente.includes('/')){
                if(resposta == parseInt(contasCorrente.split('/')[0]) / parseInt(contasCorrente.split('/')[1])){
                    respostaCerta = true;
                }
            }

            questoes.push({
                questao: contasCorrente,
                resposta: resposta,
                correta: respostaCerta
            });

            localStorage.setItem(configData.QUESTOES, JSON.stringify(questoes));

            if(respostaCerta){
                toast.success('Correto ✅');
                setRespostasCorretas(respostasCorretas+1);
            }
            else{
                toast.error('Incorreto 💥');
                setRespostasIncorretas(respostasIncorretas+1);
            }

            setResposta('');
            if(contador + 1 === parseInt(localStorage.getItem(configData.QUANTIDADE_PARAM) || 20)+2){
                localStorage.setItem(configData.QUANTIDADE_ACERTOS, respostasCorretas);
                SetHistorico();
                Finaliza();
            }else{
                setContasCorrente(MontaConta());
            }
        }
      }

    function SetHistorico(){
        var historico = JSON.parse(localStorage.getItem(configData.HISTORICO));
        var questoes = JSON.parse(localStorage.getItem(configData.QUESTOES));

        if(historico == null){
            historico = new Array();
        }

        var novo = {
            quantidadeQuestoes: localStorage.getItem(configData.QUANTIDADE_PARAM),
            quantidadeAcertos: localStorage.getItem(configData.QUANTIDADE_ACERTOS),
            tempo: localStorage.getItem(configData.TEMPO_PARAM),
            nome: localStorage.getItem(configData.NOME_PARAM),
            tipo: tipo,
            questoes: questoes
        }

        historico.push(novo);

        localStorage.setItem(configData.HISTORICO, JSON.stringify(historico));
    }

    async function Finaliza(){
        var data = {
            nome: localStorage.getItem(configData.NOME_PARAM),
            numeroAcertos: respostasCorretas,
            numeroQuestoes: localStorage.getItem(configData.QUANTIDADE_PARAM) || 20,
            tipo: tipo,
            tempo: localStorage.getItem(configData.TEMPO_PARAM)
        };

        setLoadding(true);
        await api.post(`/ResultadosTabuadaDivertida`, data)
        .then((response) => {
            navigate('/final/' + tipo, {replace: true});
        }).catch(() => {
            navigate('/error', {replace: true});
            return;
        });
    }

    if(tipo.toUpperCase() !== 'M' &&
       tipo.toUpperCase() !== 'D' &&
       tipo.toUpperCase() !== 'A' &&
       tipo.toUpperCase() !== 'R' &&
       tipo.toUpperCase() !== 'S'  ){
        return(
            <div className='container'>
                <div className='not-found'>
                    Não existe essa opção.
                    <Link to="/">Home</Link>
                </div>
            </div>
        )
    }

    if(loadding){
        return(
            <div className='loaddingDiv'>
                <div className="lds-ring"><div></div><div></div><div></div><div></div></div>
            </div>
        )
    }

    return(
        <div className="game">
            <div className='global-pageContainer-left'>
                <div className='tempo'>
                    <Tempo/>
                    <div>
                        <div className='tempo'>
                            <h1>🏋️ {contador-1} de {localStorage.getItem(configData.QUANTIDADE_PARAM) || 20}</h1>
                        </div>
                        <div className='info-completo'>
                            <button className='button-base' onClick={() => window.location.reload(false)}>Restart</button>
                        </div>
                    </div>
                </div>
                <div className='divJogo'>
                    <h3>
                        {contasCorrente}
                    </h3>
                    <input type="number" value={resposta} onChange={(e) => respondeu(e.target.value)} onKeyDown={handleKeyDown} autoFocus={true}/>
                </div>
            </div>
        </div>
    )
}

export default Jogo;