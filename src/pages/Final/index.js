import './style.css'
import {Link} from 'react-router-dom';
import configData from "./../../Config.json";
import { useParams } from 'react-router-dom';

function Final(){
    const{tipo} = useParams();

    return(
        <div className='container'>
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
            <br/>
            <br/>
            <Link to={`/jogo/` + tipo}>Jogar novamente</Link>
            <Link to={`/ranking`}>Ranking</Link>
            <Link to="/historico">Histórico</Link>
            <Link to="/">Início</Link>
        </div>
    )
}

export default Final;