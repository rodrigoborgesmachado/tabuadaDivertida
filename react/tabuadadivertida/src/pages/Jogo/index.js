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
    const[contas1, setContas1] = useState([]);
    const[contas2, setContas2] = useState([]);
    const[contasCorrente, setContasCorrente] = useState('');
    const[resposta, setResposta] = useState('');
    const [width, setWidth] = useState(window.innerWidth);
    const navigate = useNavigate();

    useEffect(() => {
        setContas1(LoadContas(parseInt(sessionStorage.getItem(configData.QUANTIDADE_PARAM) || 20)));
        setContas2(LoadContas(parseInt(sessionStorage.getItem(configData.QUANTIDADE_PARAM) || 20)));
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
        for(let i = 0; i< total;i++){
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
                if(width > 768){
                    toast.success('Correto');
                }

                setResposta('');
                if(contador + 1 === parseInt(sessionStorage.getItem(configData.QUANTIDADE_PARAM) || 20)){
                    Finaliza();
                }else{
                    setContasCorrente(MontaConta());
                }
            }
        }
        else{
            setResposta('');
        }
    }

    async function Finaliza(){
        var data = {
            nome: sessionStorage.getItem(configData.NOME_PARAM),
            acertos: sessionStorage.getItem(configData.QUANTIDADE_PARAM),
            tipo: tipo,
            tempo: sessionStorage.getItem(configData.TEMPO_PARAM)
        };

        await api.post(`/InsereResultado.php`, data)
        .then((response) => {
            navigate('/final', {replace: true});
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

    return(
        <div className='container'>
            <div className='tempo'>
                <Tempo/>
            </div>
            <div className='divJogo'>
                <h3>
                    {contasCorrente}
                </h3>
                <input type="number" value={resposta} onChange={(e) => respondeu(e.target.value)} autoFocus={true}/>
            </div>
        </div>
    )
}

export default Jogo;