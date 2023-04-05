import './style.css'
import {Link} from 'react-router-dom';
import configData from "./../../Config.json";
import { useParams } from 'react-router-dom';

function Final(){
    const{tipo} = useParams();

    return(
        <div className='container'>
            <h3>Parabéns {sessionStorage.getItem(configData.NOME_PARAM)}!!! Você acertou {sessionStorage.getItem(configData.QUANTIDADE_ACERTOS)} de {sessionStorage.getItem(configData.QUANTIDADE_PARAM)} em {sessionStorage.getItem(configData.TEMPO_PARAM)} segundos</h3>
            <br/>
            <br/>
            <Link to={`/jogo/` + tipo}>Jogar novamente</Link>
            <Link to="/">Home</Link>
        </div>
    )
}

export default Final;