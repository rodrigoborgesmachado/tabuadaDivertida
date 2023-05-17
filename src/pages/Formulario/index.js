import { useEffect, useState } from 'react';
import configData from "./../../Config.json";
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import {toast} from 'react-toastify';
import './style.css';

function Formulario(){
        const[nome, setNome] = useState(localStorage.getItem(configData.NOME_PARAM) || '');
        const[quantidade, setQuantidade] = useState(localStorage.getItem(configData.QUANTIDADE_PARAM) || 20);
        const navigate = useNavigate();

        useEffect(() => {
        })

        function chageText(text){
            setQuantidade(text.replace(/[^0-9]/g, ''));
        }

        function salvarDados(){
            if(quantidade >= 5 && quantidade <= 100){
                localStorage.setItem(configData.NOME_PARAM, nome);
                localStorage.setItem(configData.QUANTIDADE_PARAM, quantidade);
                navigate('/selecionarjogo', {replace: true});
            }
            else if(quantidade < 5){
                toast.warn('Quantidade precisa ser maior ou igual a 5.');
            }
            else if(quantidade < 5){
                toast.warn('Quantidade precisa ser menor ou igual a 100.');
            }
        }

        return(
            <div className='container'>
                <div className='formulario'>
                    <h3>
                        Como você gostaria de ser chamado?👽
                    </h3>
                    <input type="text" id="name" value={nome} onChange={(e) => {setNome(e.target.value)}}/>
                    <h3>
                        Quantas questões?🚀
                    </h3>
                    <input type="text" value={quantidade} onChange={(e) => chageText(e.target.value)}/>
                </div>
                <div className='botoes'>
                    <button className='botao' onClick={() => {salvarDados()}}>Continuar▶️</button>
                </div>
            </div>
        )
}

export default Formulario;