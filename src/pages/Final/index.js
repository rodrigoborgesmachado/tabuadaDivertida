import './style.css'
import {Link} from 'react-router-dom';
import configData from "./../../Config.json";
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';


function Final(){
    const{tipo} = useParams();
    const[questoes , setQuestoes] = useState([]);

    useEffect(() => {
        setQuestoes(JSON.parse(localStorage.getItem(configData.QUESTOES)));
        return() =>{

        }
    }, []);

    return(
        <div className='global-pageContainer-left'>
            <h2><b>🎉Parabéns {localStorage.getItem(configData.NOME_PARAM)}!!!🎉</b></h2>
            <br/>
            {
                localStorage.getItem(configData.QUANTIDADE_ACERTOS) == localStorage.getItem(configData.QUANTIDADE_PARAM) ?
                <h3>
                    Você é um mestre da tabuada! 🧠💪<br/><br/>
                    ✅Você acertou {localStorage.getItem(configData.QUANTIDADE_ACERTOS)} de {localStorage.getItem(configData.QUANTIDADE_PARAM)} em tempo recorde! ⏱️⚡️<br/>
                    Você levou apenas {localStorage.getItem(configData.TEMPO_PARAM)} segundos! ⏱️<br/><br/>
                    Compartilhe sua conquista com seus amigos e desafie-os a superar seu desempenho!<br/><br/>

                    🔥 Quão rápido você pode ser? Descubra em Tabuada Divertida! 💥
                </h3>
                :
                <h3>
                    Não foi dessa vez, você ficou fora do ranking!!! 🧠💪<br/><br/>
                    ✅Você acertou {localStorage.getItem(configData.QUANTIDADE_ACERTOS)} de {localStorage.getItem(configData.QUANTIDADE_PARAM)}! ⏱️⚡️<br/>
                    Você levou apenas {localStorage.getItem(configData.TEMPO_PARAM)} segundos! ⏱️<br/><br/>
                    Compartilhe sua conquista com seus amigos e desafie-os a superar seu desempenho!<br/><br/>

                    🔥 Quão rápido você pode ser? Descubra em Tabuada Divertida! 💥
                </h3>
            }
            <div className='respostasQuestoes'>
                <h2>
                    Respostas:
                </h2>
                <ul>
                    {
                        questoes.map(questao => {
                            return(
                                <li>
                                    <h3>
                                        {questao.questao} = {questao.resposta} {questao.correta ? '🎉' : '😫'}
                                    </h3>
                                </li>
                            )
                        })
                    }
                </ul>
            </div>

            <div className='botoes'>
                <Link className='global-button global-button--full-width' to={`/jogo/` + tipo}>Jogar novamente</Link>
                <Link className='global-button global-button--full-width' to={`/ranking`}>Ranking</Link>
                <Link className='global-button global-button--full-width' to="/historico">Histórico</Link>
                <Link className='global-button global-button--full-width' to="/">Início</Link>
            </div>
        </div>
    )
}

export default Final;