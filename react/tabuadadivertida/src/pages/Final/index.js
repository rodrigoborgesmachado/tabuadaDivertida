import './style.css'
import {Link} from 'react-router-dom';
import configData from "./../../Config.json";

function Final(){
    return(
        <div className='container'>
            <h3>Parabéns {sessionStorage.getItem(configData.NOME_PARAM)}!!! Você acertou {sessionStorage.getItem(configData.QUANTIDADE_PARAM)} em {sessionStorage.getItem(configData.TEMPO_PARAM)} segundos</h3>
            <Link to="/">Home</Link>
        </div>
    )
}

export default Final;