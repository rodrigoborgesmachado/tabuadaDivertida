import { useEffect, useState } from 'react';
import configData from "../../Config.json";
import { useNavigate } from 'react-router-dom';
import {toast} from 'react-toastify';

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
                localStorage.setItem(configData.QUANTIDADE_PARAM, quantidade.toString());
                navigate('/selecionarjogo', {replace: true});
            }
            else if(quantidade < 5){
                toast.warn('Quantidade precisa ser maior ou igual a 5.');
            }
            else if(quantidade > 100){
                toast.warn('Quantidade precisa ser menor ou igual a 100.');
            }
        }

        return(
            <div className='center'>
                <div className='global-pageContainer-left options-preview'>
                    <div className='formulario'>
                        <h3>
                            Como você gostaria de ser chamado?🙃
                        </h3>
                        <input type="text" id="name" value={nome} onChange={(e) => {setNome(e.target.value)}} maxLength={15}/>
                        <h3>
                            Deseja fazer quantas questões?🚀
                        </h3>
                        <input type="text" value={quantidade} onChange={(e) => chageText(e.target.value)}/>
                    </div>
                    <div className='botoes'>
                        <button className='global-button global-button--full-width' onClick={() => {salvarDados()}}>
                            <span className='option-link'>
                                Continuar▶️
                            </span>
                        </button>
                        <button className='global-button global-button--full-width global-button--back' onClick={() => {navigate('/', {replace: true})}}>
                            <span className='option-link'>
                                Voltar
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        )
}

export default Formulario;