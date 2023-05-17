import './style.css';
import configData from "./../../Config.json";
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
    const [width, setWidth] = useState(window.innerWidth);
    const navigate = useNavigate();
    const[loadding, setLoadding] = useState(false);

    useEffect(() => {
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

        if(tipo === 'D'){
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
        let temp = '';

        if(tipo === 'D'){
            temp += n1 + '/' + n2;
        }
        else if (tipo === 'S'){
            if(n1 > n2){
                temp += n1 + '-' + n2;
            }
            else{
                temp += n2 + '-' + n1;
            }
        }
        else if (tipo === 'A'){
            temp += n1 + '+' + n2;
        }
        else{
            temp += n1 + 'x' + n2;
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
            let respostaCerta = false;

            if(tipo === 'M'){
                if(resposta == parseInt(contasCorrente.split('x')[0]) * parseInt(contasCorrente.split('x')[1])){
                    respostaCerta = true;
                }
            }
            else if(tipo === 'D'){
                if(resposta == parseInt(contasCorrente.split('/')[0]) / parseInt(contasCorrente.split('/')[1])){
                    respostaCerta = true;
                }
            }
            else if(tipo === 'S'){
                if(resposta == parseInt(contasCorrente.split('-')[0]) - parseInt(contasCorrente.split('-')[1]) || 
                    resposta == parseInt(contasCorrente.split('-')[1]) - parseInt(contasCorrente.split('-')[0])){
                    respostaCerta = true;
                }
            }
            else if(tipo === 'A'){
                if(resposta == parseInt(contasCorrente.split('+')[0]) + parseInt(contasCorrente.split('+')[1])){
                    respostaCerta = true;
                }
            }

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
                Finaliza();
            }else{
                setContasCorrente(MontaConta());
            }
        }
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
                <img src={require('../../assets/hug.gif')} alt="Loading..." />
            </div>
        )
    }

    return(
        <div className='container'>
            <div className='tempo'>
                <Tempo/>
            </div>
            <div className='tempo'>
                <h1>🏋️ {contador-1} de {localStorage.getItem(configData.QUANTIDADE_PARAM) || 20}</h1>
            </div>
            <div className='divJogo'>
                <h3>
                    {contasCorrente}
                </h3>
                <input type="number" value={resposta} onChange={(e) => respondeu(e.target.value)} onKeyDown={handleKeyDown} autoFocus={true}/>
            </div>
        </div>
    )
}

export default Jogo;