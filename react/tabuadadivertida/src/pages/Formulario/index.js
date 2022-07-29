import { useEffect, useState } from 'react';
import configData from "./../../Config.json";
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import {toast} from 'react-toastify';
import './style.css';

function Formulario(){
        const[nome, setNome] = useState(sessionStorage.getItem(configData.NOME_PARAM) || '');
        const[quantidade, setQuantidade] = useState(sessionStorage.getItem(configData.QUANTIDADE_PARAM) || 20);
        const navigate = useNavigate();

        useEffect(() => {
        })

        function chageText(text){
            setQuantidade(text.replace(/[^0-9]/g, ''));
        }

        function salvarDados(){
            if(quantidade >= 5){
                sessionStorage.setItem(configData.NOME_PARAM, nome);
                sessionStorage.setItem(configData.QUANTIDADE_PARAM, quantidade);
                navigate('/selecionarjogo', {replace: true});
            }
            else{
                toast.warn('Quantidade precisa ser maior ou igual a 5.');
            }
        }

        return(
            <div className='container'>
                <div className='formulario'>
                    <h3>
                        Como você gostaria de ser chamado?
                    </h3>
                    <input type="text" value={nome} onChange={(e) => {setNome(e.target.value)}}/>
                    <h3>
                        Quantas questões?
                    </h3>
                    <input type="text" value={quantidade} onChange={(e) => chageText(e.target.value)}/>
                </div>
                <div className='botoes'>
                    <button className='botao' onClick={() => {salvarDados()}}>Continuar</button>
                </div>
            </div>
        )
}

export default Formulario;